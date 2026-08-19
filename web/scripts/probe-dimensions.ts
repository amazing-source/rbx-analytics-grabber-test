// Finds out how Open Cloud wants a Place scope expressed, so the perf metrics
// can be compared against the corpus like for like.
//
//   npm run probe-dimensions -- <universeId> [placeId]
//
// The comparison run on 2026-08-19 was apples-to-oranges: the corpus stores
// perf metrics as `Place=<rootPlace>` (the gateway 400s them unfiltered) while
// Open Cloud returned them for the WHOLE universe — and this universe has more
// than one place. Until the scopes match, the perf half is unproven either way.
//
// This deliberately probes the API's own schema and prints what it says back.
// That is not the "invented query shape" CLAUDE.md bans: the ban is on
// reporting a FINDING ABOUT A GAME from a failed guess. Learning an API's shape
// from its own error messages is how you stop guessing — provided the errors,
// not our assumptions, are what get written down. Every response is printed
// verbatim for exactly that reason.

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
  try {
    const v = readFileSync(".opencloud-key", "utf8").trim();
    if (v) return v;
  } catch { /* not there */ }
  return undefined;
}

const key = readKey();
const universe = process.argv[2];
const placeId = process.argv[3] || "";
if (!key || !/^\d+$/.test(universe || "")) {
  console.error("usage: npm run probe-dimensions -- <universeId> [placeId]");
  process.exit(2);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Well inside the 28-day performance retention wall, so a failure here is about
// the shape and never about the window.
const end = new Date(); end.setUTCHours(0, 0, 0, 0);
const start = new Date(end.getTime() - 10 * 86400_000);
const startTime = start.toISOString().replace(/\.\d{3}Z$/, "Z");
const endTime = end.toISOString().replace(/\.\d{3}Z$/, "Z");

async function call(path: string, body: unknown, label: string) {
  const res = await fetch(`${BASE}/universes/${universe}/${path}`, {
    method: "POST",
    headers: { "x-api-key": key!, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let parsed: Record<string, unknown> | null = null;
  try { parsed = JSON.parse(text); } catch { /* keep raw */ }

  if (!res.ok) {
    const msg = (parsed as { error?: { message?: string } })?.error?.message;
    console.log(`✗ ${label}\n    HTTP ${res.status}: ${(msg || text).slice(0, 260).replace(/\s+/g, " ")}\n`);
    return null;
  }

  let body2 = parsed as Record<string, unknown>;
  if (body2?.done === false && typeof body2.path === "string") {
    for (let i = 0; i < 25 && body2.done === false; i++) {
      await sleep(1000);
      const r = await fetch(`https://apis.roblox.com/analytics-query-api/${body2.path}`, { headers: { "x-api-key": key! } });
      if (!r.ok) { console.log(`✗ ${label}\n    poll HTTP ${r.status}\n`); return null; }
      body2 = (await r.json()) as Record<string, unknown>;
    }
  }

  const resp = (body2.response ?? {}) as { values?: { breakdowns?: unknown[]; dataPoints?: { time: string; value: number }[] }[] };
  const values = resp.values ?? [];
  const pts = values.reduce((n, v) => n + (v.dataPoints?.length ?? 0), 0);
  console.log(`✓ ${label}\n    ${values.length} series · ${pts} points`);
  // The breakdown labels are the payload here: they say what the dimension is
  // actually called and what its values look like on this universe.
  for (const v of values.slice(0, 6)) {
    const bd = JSON.stringify(v.breakdowns ?? []);
    const first = v.dataPoints?.[0];
    console.log(`      breakdowns=${bd}  first=${first ? `${first.time.slice(0, 10)}:${first.value}` : "—"}  n=${v.dataPoints?.length ?? 0}`);
  }
  if (values.length > 6) console.log(`      … ${values.length - 6} more series`);
  console.log();
  return values;
}

console.log(`Open Cloud dimension probe · universe ${universe}`);
console.log(`window ${startTime.slice(0, 10)} → ${endTime.slice(0, 10)}\n`);

const M = process.argv[4] || "ServerCrashCount";

// 1. Baseline. Already known to work; establishes what "no scope" returns.
await call("metrics", { metric: M, granularity: "OneDay", startTime, endTime }, `${M} · no breakdown`);
await sleep(2200);

// 2. Does breakdown work at all, on a dimension we know the gateway accepts?
await call("metrics", { metric: M, granularity: "OneDay", startTime, endTime, breakdown: ["Place"] }, `${M} · breakdown ["Place"]`);
await sleep(2200);

await call("metrics", { metric: M, granularity: "OneDay", startTime, endTime, breakdown: ["Platform"] }, `${M} · breakdown ["Platform"]`);
await sleep(2200);

// 3. Filtering to one place — the shape the corpus effectively stores.
if (placeId) {
  await call("metrics", { metric: M, granularity: "OneDay", startTime, endTime, filter: [{ dimension: "Place", values: [placeId] }] }, `${M} · filter Place=${placeId} (no operation)`);
  await sleep(2200);

  await call("metrics", { metric: M, granularity: "OneDay", startTime, endTime, filter: [{ dimension: "Place", values: [placeId], operation: "Equals" }] }, `${M} · filter Place=${placeId} operation:"Equals"`);
  await sleep(2200);
}

// 4. The documented discovery endpoint. If this works it replaces every guess
//    above with an authoritative list, which is what we actually want long term.
await call("dimension-values", { dimension: "Place", startTime, endTime }, `dimension-values · {dimension:"Place"}`);
await sleep(2200);

await call("dimension-values", { dimensions: ["Place"], startTime, endTime }, `dimension-values · {dimensions:["Place"]}`);
await sleep(2200);

await call("dimension-values", { metric: M, dimension: "Place", startTime, endTime }, `dimension-values · {metric,dimension}`);

console.log("Read the errors above as the schema. Anything that returned series is the shape to use.");
