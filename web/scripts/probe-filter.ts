// Cracks two things the grab plan depends on and Open Cloud has not yet proven:
//
//   1. Can we break down / filter by PlaceVersion? That is what turns a metric
//      chart into "this moved when v546 shipped" instead of "this moved".
//   2. What are the legal values of the FilterOperation enum? `"Equals"` is
//      rejected and the error does not enumerate the alternatives, so the only
//      way to know is to ask and read what comes back.
//
//   npm run probe-filter -- <universeId> [placeId]
//
// .NET's JsonStringEnumConverter accepts NUMBERS as well as names by default,
// so the integers are probed too: if 0..N are accepted where every string is
// rejected, the enum is positional and we can map it by observing results.
// Every response is printed verbatim — the errors are the documentation here.

import { readFileSync } from "node:fs";

const BASE = "https://apis.roblox.com/analytics-query-api/v1";

function readKey(): string | undefined {
  if (process.env.ROBLOX_API_KEY) return process.env.ROBLOX_API_KEY.trim();
  for (const p of [".opencloud-key", "../.opencloud-key"]) {
    try {
      const v = readFileSync(new URL(p, import.meta.url), "utf8").trim();
      if (v) return v;
    } catch { /* keep looking */ }
  }
  return undefined;
}

const key = readKey();
const universe = process.argv[2];
const placeId = process.argv[3] || "";
if (!key || !/^\d+$/.test(universe || "")) {
  console.error("usage: npm run probe-filter -- <universeId> [placeId]");
  process.exit(2);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const end = new Date(); end.setUTCHours(0, 0, 0, 0);
const start = new Date(end.getTime() - 20 * 86400_000);
const startTime = start.toISOString().replace(/\.\d{3}Z$/, "Z");
const endTime = end.toISOString().replace(/\.\d{3}Z$/, "Z");

async function call(body: unknown, label: string, quiet = false) {
  const res = await fetch(`${BASE}/universes/${universe}/metrics`, {
    method: "POST",
    headers: { "x-api-key": key!, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let parsed: Record<string, unknown> | null = null;
  try { parsed = JSON.parse(text); } catch { /* raw */ }

  if (!res.ok) {
    const msg = (parsed as { error?: { message?: string } })?.error?.message || text;
    const short = String(msg).slice(0, 200).replace(/\s+/g, " ");
    // A validation error naming the METRIC/dimension is a real answer; a
    // deserialization error just means the enum spelling was wrong.
    if (!quiet) console.log(`  ✗ ${label}\n      ${short}`);
    return { ok: false, msg: short };
  }

  let b = parsed as Record<string, unknown>;
  if (b?.done === false && typeof b.path === "string") {
    for (let i = 0; i < 25 && b.done === false; i++) {
      await sleep(1000);
      const r = await fetch(`https://apis.roblox.com/analytics-query-api/${b.path}`, { headers: { "x-api-key": key! } });
      if (!r.ok) return { ok: false, msg: `poll ${r.status}` };
      b = (await r.json()) as Record<string, unknown>;
    }
  }
  const resp = (b.response ?? {}) as { values?: { breakdowns?: { dimension?: string; value?: string; displayValue?: string }[]; dataPoints?: unknown[] }[] };
  const vals = resp.values ?? [];
  const pts = vals.reduce((n, v) => n + (v.dataPoints?.length ?? 0), 0);
  console.log(`  ✓ ${label}  →  ${vals.length} series · ${pts} points`);
  for (const v of vals.slice(0, 8)) {
    const bd = (v.breakdowns ?? []).map((x) => `${x.dimension}=${x.value}${x.displayValue && x.displayValue !== x.value ? ` (${x.displayValue})` : ""}`).join(", ");
    console.log(`        ${bd || "(total)"}  n=${v.dataPoints?.length ?? 0}`);
  }
  if (vals.length > 8) console.log(`        … ${vals.length - 8} more`);
  return { ok: true, values: vals };
}

const M = "ErrorCount"; // has PlaceVersion dimensions on the gateway

console.log(`Filter / PlaceVersion probe · universe ${universe}`);
console.log(`window ${startTime.slice(0, 10)} → ${endTime.slice(0, 10)}\n`);

console.log("1. Version breakdowns — does Open Cloud know about place versions?");
for (const dim of ["PlaceVersion", "FirstSeenPlaceVersion", "LastSeenPlaceVersion", "Version"]) {
  await call({ metric: M, granularity: "OneDay", startTime, endTime, breakdown: [dim], limit: 50 }, `breakdown ["${dim}"]`);
  await sleep(2200);
}

console.log("\n2. FilterOperation enum — string candidates");
const STRINGS = [
  "Equal", "EQUALS", "EQUAL", "Eq", "In", "NotIn", "Contains", "NotContains",
  "GreaterThan", "GreaterThanOrEqual", "Gte", "LessThan", "StartsWith",
  "FILTER_OPERATION_EQUALS",
];
const accepted: string[] = [];
for (const op of STRINGS) {
  const r = await call(
    { metric: M, granularity: "OneDay", startTime, endTime, filter: [{ dimension: "Place", values: [placeId || "0"], operation: op }] },
    `operation "${op}"`,
    true,
  );
  // Distinguish "bad enum spelling" from "enum fine, something else wrong".
  const badEnum = !r.ok && /could not be converted|FilterOperation/i.test(r.msg || "");
  if (r.ok) { accepted.push(op); console.log(`  ✓ "${op}" ACCEPTED`); }
  else if (!badEnum) { accepted.push(op); console.log(`  ~ "${op}" parsed as a valid enum — failed later: ${r.msg}`); }
  await sleep(2200);
}
if (!accepted.length) console.log("  (every string rejected as an invalid enum value)");

console.log("\n3. FilterOperation enum — integers (JsonStringEnumConverter also takes numbers)");
for (let i = 0; i <= 6; i++) {
  const r = await call(
    { metric: M, granularity: "OneDay", startTime, endTime, filter: [{ dimension: "Place", values: [placeId || "0"], operation: i }] },
    `operation ${i}`,
    true,
  );
  const badEnum = !r.ok && /could not be converted|FilterOperation/i.test(r.msg || "");
  if (r.ok) console.log(`  ✓ ${i} ACCEPTED and returned data`);
  else if (!badEnum) console.log(`  ~ ${i} is a legal enum value — failed later: ${r.msg}`);
  else console.log(`  ✗ ${i} rejected as invalid enum`);
  await sleep(2200);
}
