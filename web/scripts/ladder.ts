// Pulls the §1 diagnostic ladder for one universe straight from Open Cloud and
// prints it as one aligned table, so rungs are read together rather than one
// metric at a time.
//
//   npm run ladder -- <universeId> [days]
//
// Deliberately prints the LAST SETTLED value alongside the newest one: §0 of the
// liveops-diagnosis skill exists because the right edge of a retention chart is
// always falling, on every game, every day, and that artefact arrives as an
// urgent "we just dropped" message.

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
const days = Number(process.argv[3] || 150);
if (!key || !/^\d+$/.test(universe || "")) {
  console.error("usage: npm run ladder -- <universeId> [days]");
  process.exit(2);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Class -> how far back Roblox still holds it. Asking past the wall 400s the
// whole query rather than truncating, so each metric gets its own window.
const LONG = days;      // behavioural / monetization: full life
const MID = 55;         // ErrorCount ~56d
const SHORT = 27;       // crash + performance ~28d

const METRICS: { m: string; rung: string; win: number }[] = [
  { m: "UniqueUsersWithImpressions", rung: "1 reach", win: LONG },
  { m: "EndToEndCVR", rung: "1 reach", win: LONG },
  { m: "RFYL7PlayDays", rung: "1 reach", win: LONG },
  { m: "DailyActiveUsers", rung: "1 reach", win: LONG },
  { m: "PeakConcurrentPlayers", rung: "1 reach", win: SHORT },
  { m: "ForwardD1Retention", rung: "2 hook", win: LONG },
  { m: "AverageSessionLengthMinutes", rung: "2 hook", win: LONG },
  { m: "ForwardD7Retention", rung: "3 return", win: LONG },
  { m: "ForwardD30Retention", rung: "3 return", win: LONG },
  { m: "DauMauStickiness", rung: "3 return", win: LONG },
  { m: "PayingUsersCVR", rung: "4 money", win: LONG },
  { m: "AverageRevenuePerUser", rung: "4 money", win: LONG },
  { m: "DailyRevenue", rung: "4 money", win: LONG },
  { m: "ErrorCount", rung: "5 tech", win: MID },
  { m: "ClientCrashRate15m", rung: "5 tech", win: SHORT },
  { m: "OomUnexpectedExits", rung: "5 tech", win: SHORT },
  { m: "ClientFpsP10", rung: "5 tech", win: SHORT },
];

async function series(metric: string, win: number): Promise<Map<string, number> | string> {
  const end = new Date(); end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end.getTime() - win * 86400_000);
  const res = await fetch(`${BASE}/universes/${universe}/metrics`, {
    method: "POST",
    headers: { "x-api-key": key!, "content-type": "application/json" },
    body: JSON.stringify({
      metric, granularity: "OneDay",
      startTime: start.toISOString().replace(/\.\d{3}Z$/, "Z"),
      endTime: end.toISOString().replace(/\.\d{3}Z$/, "Z"),
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    let m = text; try { m = JSON.parse(text)?.error?.message ?? text; } catch { /* raw */ }
    return String(m).slice(0, 110).replace(/\s+/g, " ");
  }
  let b = JSON.parse(text) as Record<string, unknown>;
  while (b.done === false && typeof b.path === "string") {
    await sleep(1000);
    const r = await fetch(`https://apis.roblox.com/analytics-query-api/${b.path}`, { headers: { "x-api-key": key! } });
    if (!r.ok) return `poll ${r.status}`;
    b = (await r.json()) as Record<string, unknown>;
  }
  const resp = (b.response ?? {}) as { values?: { breakdowns?: unknown[]; dataPoints?: { time: string; value: number }[] }[] };
  // Headline = the series with NO breakdown. Never series[0].
  const tot = (resp.values ?? []).find((v) => !v.breakdowns || v.breakdowns.length === 0);
  if (!tot) return "no unbroken-down series";
  const out = new Map<string, number>();
  for (const p of tot.dataPoints ?? []) out.set(p.time.slice(0, 10), p.value);
  return out;
}

const fmt = (v: number | undefined) =>
  v === undefined ? "    —"
    : Math.abs(v) >= 1000 ? Math.round(v).toLocaleString("en-US")
      : Math.abs(v) >= 1 ? v.toFixed(2)
        : v.toFixed(4);

const results = new Map<string, Map<string, number> | string>();
for (const { m, win } of METRICS) {
  results.set(m, await series(m, win));
  await sleep(2200);
}

// Build the date axis from the longest series we actually got.
const allDates = new Set<string>();
for (const r of results.values()) if (r instanceof Map) for (const d of r.keys()) allDates.add(d);
const dates = [...allDates].sort();
const tail = dates.slice(-21);

console.log(`\nLadder · universe ${universe} · ${dates[0]} → ${dates[dates.length - 1]}\n`);
const NAMEW = 28;
console.log("metric".padEnd(NAMEW) + tail.map((d) => d.slice(5)).map((d) => d.padStart(9)).join(""));
console.log("-".repeat(NAMEW + tail.length * 9));

let lastRung = "";
for (const { m, rung } of METRICS) {
  if (rung !== lastRung) { console.log(`-- ${rung}`); lastRung = rung; }
  const r = results.get(m)!;
  if (typeof r === "string") { console.log(m.padEnd(NAMEW) + "  " + r); continue; }
  console.log(m.padEnd(NAMEW) + tail.map((d) => fmt(r.get(d)).padStart(9)).join(""));
}

console.log(`\n${"metric".padEnd(NAMEW)}${"newest".padStart(12)}${"date".padStart(12)}${"7d mean".padStart(12)}${"prev 7d".padStart(12)}${"Δ%".padStart(9)}`);
console.log("-".repeat(NAMEW + 57));
for (const { m } of METRICS) {
  const r = results.get(m)!;
  if (typeof r === "string") continue;
  const ds = [...r.keys()].sort();
  if (!ds.length) continue;
  const vals = ds.map((d) => r.get(d)!);
  const last7 = vals.slice(-7), prev7 = vals.slice(-14, -7);
  const mean = (a: number[]) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN;
  const a = mean(last7), b2 = mean(prev7);
  const d = Number.isFinite(a) && Number.isFinite(b2) && b2 !== 0 ? ((a - b2) / Math.abs(b2)) * 100 : NaN;
  console.log(
    m.padEnd(NAMEW) +
    fmt(vals[vals.length - 1]).padStart(12) +
    ds[ds.length - 1].padStart(12) +
    fmt(a).padStart(12) + fmt(b2).padStart(12) +
    (Number.isFinite(d) ? (d >= 0 ? "+" : "") + d.toFixed(1) : "—").padStart(9)
  );
}
