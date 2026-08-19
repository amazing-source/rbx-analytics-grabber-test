// The coverage run left 10 metrics "failing", but every failure was the API
// telling us the ask was malformed — wrong granularity, or a window longer than
// the metric allows. None of them said the data does not exist.
//
//   npm run probe-granularity -- <universeId>
//
// This finds the granularity each one actually wants, so "not served" can be
// separated from "we asked wrong". That distinction is the whole difference
// between a real coverage gap and a bug in our plan.

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
if (!key || !/^\d+$/.test(universe || "")) {
  console.error("usage: npm run probe-granularity -- <universeId>");
  process.exit(2);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Candidates. Deliberately including a nonsense one: if the API rejects it with
// a message that enumerates the legal values, that single error is worth more
// than the whole rest of this script.
const GRANULARITIES = ["None", "OneHour", "OneDay", "OneWeek", "OneMonth", "__probe__"];

const CASES: { metric: string; days: number }[] = [
  { metric: "FunnelUserTotalCount", days: 28 },
  { metric: "FunnelUserStepCompletionRate", days: 28 },
  { metric: "WeeklyCohortRetention", days: 28 },
  { metric: "DailyCohortRetention", days: 10 },
];

async function call(metric: string, granularity: string, days: number) {
  const end = new Date(); end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end.getTime() - days * 86400_000);
  const res = await fetch(`${BASE}/universes/${universe}/metrics`, {
    method: "POST",
    headers: { "x-api-key": key!, "content-type": "application/json" },
    body: JSON.stringify({
      metric,
      granularity,
      startTime: start.toISOString().replace(/\.\d{3}Z$/, "Z"),
      endTime: end.toISOString().replace(/\.\d{3}Z$/, "Z"),
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = text;
    try { msg = JSON.parse(text)?.error?.message ?? text; } catch { /* raw */ }
    return { ok: false, msg: String(msg).slice(0, 220).replace(/\s+/g, " ") };
  }
  let body = JSON.parse(text) as Record<string, unknown>;
  if (body.done === false && typeof body.path === "string") {
    for (let i = 0; i < 25 && body.done === false; i++) {
      await sleep(1000);
      const r = await fetch(`https://apis.roblox.com/analytics-query-api/${body.path}`, { headers: { "x-api-key": key! } });
      if (!r.ok) return { ok: false, msg: `poll ${r.status}` };
      body = (await r.json()) as Record<string, unknown>;
    }
  }
  const resp = (body.response ?? {}) as { values?: { dataPoints?: unknown[] }[] };
  const vals = resp.values ?? [];
  const pts = vals.reduce((n, v) => n + (v.dataPoints?.length ?? 0), 0);
  return { ok: true, msg: `${vals.length} series · ${pts} points` };
}

console.log(`Granularity probe · universe ${universe}\n`);

for (const c of CASES) {
  console.log(`${c.metric}  (${c.days}d window)`);
  for (const g of GRANULARITIES) {
    const r = await call(c.metric, g, c.days);
    console.log(`   ${r.ok ? "✓" : "✗"} ${g.padEnd(10)} ${r.msg}`);
    await sleep(2200);
  }
  console.log();
}
