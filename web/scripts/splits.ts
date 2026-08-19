// Runs the §3 discrimination splits for one universe against Open Cloud.
//
//   npm run splits -- <universeId> [placeId]
//
// Three questions, each of which can kill a different wrong answer:
//   - D1 by AcquisitionSource  -> is a retention move traffic MIX or the build?
//   - DAU by IsNewUser         -> acquisition problem or return-loop problem?
//   - ErrorCount by severity   -> are the "errors" actually warnings (noise)?
// Also enumerates which dimensions ErrorCount will accept, because the answer
// decides whether message-level triage is possible from this API at all.

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
  console.error("usage: npm run splits -- <universeId> [placeId]");
  process.exit(2);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function win(days: number) {
  const end = new Date(); end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end.getTime() - days * 86400_000);
  return {
    startTime: start.toISOString().replace(/\.\d{3}Z$/, "Z"),
    endTime: end.toISOString().replace(/\.\d{3}Z$/, "Z"),
  };
}

async function q(body: Record<string, unknown>, label: string, showDates = 6) {
  const res = await fetch(`${BASE}/universes/${universe}/metrics`, {
    method: "POST",
    headers: { "x-api-key": key!, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    let m = text; try { m = JSON.parse(text)?.error?.message ?? text; } catch { /* raw */ }
    console.log(`✗ ${label}\n    ${String(m).slice(0, 170).replace(/\s+/g, " ")}`);
    return null;
  }
  let b = JSON.parse(text) as Record<string, unknown>;
  while (b.done === false && typeof b.path === "string") {
    await sleep(1000);
    const r = await fetch(`https://apis.roblox.com/analytics-query-api/${b.path}`, { headers: { "x-api-key": key! } });
    if (!r.ok) { console.log(`✗ ${label} poll ${r.status}`); return null; }
    b = (await r.json()) as Record<string, unknown>;
  }
  const resp = (b.response ?? {}) as { values?: { breakdowns?: { dimension?: string; value?: string; displayValue?: string }[]; dataPoints?: { time: string; value: number }[] }[] };
  const vals = resp.values ?? [];
  console.log(`✓ ${label} → ${vals.length} series`);
  const rows = vals.map((v) => {
    const lbl = (v.breakdowns ?? []).map((x) => x.displayValue || x.value).join(" · ") || "(total)";
    const pts = (v.dataPoints ?? []).slice().sort((a, c) => a.time.localeCompare(c.time));
    const tot = pts.reduce((n, p) => n + p.value, 0);
    return { lbl, pts, tot };
  }).sort((a, c) => c.tot - a.tot);
  for (const r of rows.slice(0, 12)) {
    const tail = r.pts.slice(-showDates).map((p) => `${p.time.slice(5, 10)}:${p.value >= 1000 ? Math.round(p.value).toLocaleString("en-US") : p.value.toFixed(4)}`).join("  ");
    console.log(`    ${r.lbl.padEnd(26)} ${tail}`);
  }
  if (rows.length > 12) console.log(`    … ${rows.length - 12} more series`);
  console.log();
  return rows;
}

console.log(`\n=== Which dimensions does ErrorCount accept? ===`);
const w14 = win(14);
for (const dim of ["LogSource", "Severity", "MessageType", "MessageHash", "ErrorType", "Platform"]) {
  const res = await fetch(`${BASE}/universes/${universe}/metrics`, {
    method: "POST",
    headers: { "x-api-key": key!, "content-type": "application/json" },
    body: JSON.stringify({
      metric: "ErrorCount", granularity: "OneDay", ...w14,
      filter: placeId ? [{ dimension: "Place", values: [placeId], operation: "In" }] : undefined,
      breakdown: [dim], limit: 100,
    }),
  });
  const t = await res.text();
  let msg = "OK";
  if (!res.ok) { try { msg = JSON.parse(t)?.error?.message ?? t; } catch { msg = t; } }
  console.log(`  ${res.ok ? "✓" : "✗"} ${dim.padEnd(14)} ${res.ok ? "accepted" : String(msg).slice(0, 130).replace(/\s+/g, " ")}`);
  await sleep(2200);
}

console.log(`\n=== ErrorCount by LogSource (14d) — separates real errors from warning noise ===`);
await q({ metric: "ErrorCount", granularity: "OneDay", ...w14,
  filter: placeId ? [{ dimension: "Place", values: [placeId], operation: "In" }] : undefined,
  breakdown: ["LogSource"], limit: 50 }, "ErrorCount by LogSource", 8);
await sleep(2200);

console.log(`=== D1 by AcquisitionSource (28d) — §3c mix vs build ===`);
await q({ metric: "ForwardD1Retention", granularity: "OneDay", ...win(28), breakdown: ["AcquisitionSource"], limit: 50 },
  "ForwardD1Retention by AcquisitionSource", 7);
await sleep(2200);

console.log(`=== DAU by IsNewUser (28d) — acquisition vs return loop ===`);
await q({ metric: "DailyActiveUsers", granularity: "OneDay", ...win(28), breakdown: ["IsNewUser"], limit: 20 },
  "DailyActiveUsers by IsNewUser", 7);
await sleep(2200);

console.log(`=== Impressions by AcquisitionSource (28d) — where did reach go ===`);
await q({ metric: "UniqueUsersWithImpressions", granularity: "OneDay", ...win(28), breakdown: ["AcquisitionSource"], limit: 50 },
  "UniqueUsersWithImpressions by AcquisitionSource", 7);
