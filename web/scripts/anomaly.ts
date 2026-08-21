// Scores today against what today SHOULD look like, instead of against yesterday.
//
//   npm run anomaly -- <universeId> [days]
//
// Why this exists: on 2026-08-19 a producer and I both misread the same game in
// opposite directions within two days. I called a reach collapse off a 7-day
// mean that was still spanning the trough; he called a crash off a Sunday to
// Monday slope. Neither error survives a seasonal baseline, because the
// question stops being "is it lower than before" and becomes "is it lower than
// this weekday normally is".
//
// The model, deliberately the simplest thing that works:
//
//   level(d)    = geometric mean of the 7 days BEFORE d      (local trend)
//   factor(dow) = median of observed/level for that weekday   (weekly shape)
//   expected(d) = level(d) x factor(dow(d))
//   residual(d) = ln(observed / expected)
//   z(d)        = residual / sd(residuals over history)
//
// Geometric, not arithmetic, because these series are multiplicative: a game at
// 500K DAU and one at 50K both swing +/-20%, and logs make that one scale.
// Median for the weekday factor because event days (giveaways, raids) are
// exactly the outliers that would otherwise poison the baseline they are
// supposed to be judged against.
//
// Only needs the 7 days before a point, so a day is scoreable the moment it
// lands. No waiting for confirmation — which was the whole complaint.

import "./loader-hooks.mjs";
import { readFileSync } from "node:fs";

// The scorer lives in src/lib so the scheduler's Discord alert and this table
// can never disagree about what counts as an outlier. Dynamic import because
// static ones are hoisted above the loader hooks that teach Node the "@/" alias.
const { scoreSeries, perDau: toPerDau } = await import("../src/lib/anomaly-score.ts");
type Scored = import("../src/lib/anomaly-score.ts").Scored;

const BASE = "https://apis.roblox.com/analytics-query-api/v1";
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
const days = Number(process.argv[3] || 130);
if (!key || !/^\d+$/.test(universe || "")) {
  console.error("usage: npm run anomaly -- <universeId> [days]");
  process.exit(2);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Windows per class: asking past Roblox's retention wall 400s the whole query.
// perDau: a VOLUME metric must be divided by DAU before scoring. Without it a
// growth spurt fires an alarm on every volume series at once — measured
// 2026-08-19 on Waterslide, where OomUnexpectedExits scored z=+1.96 purely
// because DAU went 257k -> 402k while the OOM RATE sat dead flat at ~155 per
// 100k DAU. That is the §3 growth-confounding trap, and a detector that falls
// into it will cry wolf on exactly the days a game is doing well.
const METRICS: { m: string; win: number; dir: 1 | -1; perDau?: true }[] = [
  // dir = +1 when higher is better, -1 when higher is worse
  { m: "DailyActiveUsers", win: days, dir: 1 },
  { m: "PeakConcurrentPlayers", win: 27, dir: 1 },
  { m: "UniqueUsersWithImpressions", win: days, dir: 1 },
  { m: "EndToEndCVR", win: days, dir: 1 },
  { m: "ForwardD1Retention", win: days, dir: 1 },
  { m: "AverageSessionLengthMinutes", win: days, dir: 1 },
  { m: "AveragePlayTimeMinutesPerDAU", win: days, dir: 1 },
  { m: "DauMauStickiness", win: days, dir: 1 },
  { m: "PayingUsersCVR", win: days, dir: 1 },
  { m: "AverageRevenuePerUser", win: days, dir: 1 },
  { m: "DailyRevenue", win: days, dir: 1 },
  { m: "ErrorCount", win: 55, dir: -1, perDau: true },
  { m: "ClientCrashRate15m", win: 27, dir: -1 },
  { m: "OomUnexpectedExits", win: 27, dir: -1, perDau: true },
  { m: "ClientFpsP10", win: 27, dir: 1 },
];

async function series(metric: string, win: number): Promise<Map<string, number> | null> {
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
  if (!res.ok) return null;
  let b = JSON.parse(await res.text()) as Record<string, unknown>;
  while (b.done === false && typeof b.path === "string") {
    await sleep(1000);
    const r = await fetch(`https://apis.roblox.com/analytics-query-api/${b.path}`, { headers: { "x-api-key": key! } });
    if (!r.ok) return null;
    b = (await r.json()) as Record<string, unknown>;
  }
  const resp = (b.response ?? {}) as { values?: { breakdowns?: unknown[]; dataPoints?: { time: string; value: number }[] }[] };
  const tot = (resp.values ?? []).find((v) => !v.breakdowns || v.breakdowns.length === 0);
  if (!tot) return null;
  const m = new Map<string, number>();
  for (const p of tot.dataPoints ?? []) if (p.value > 0) m.set(p.time.slice(0, 10), p.value);
  return m;
}


const scored: Scored[] = [];
const notes: string[] = [];

// DAU first: every perDau metric is scored as a rate against it.
const dau = await series("DailyActiveUsers", days);
await sleep(2200);

for (const { m, win, dir, perDau } of METRICS) {
  let vals = await series(m, win);
  await sleep(2200);
  if (vals && perDau) {
    if (!dau) { notes.push(`${m}: no DAU to normalise against, skipped`); continue; }
    vals = toPerDau(vals, dau);
  }
  if (!vals) { notes.push(`${m}: no series returned`); continue; }

  // The scorer itself lives in src/lib/anomaly-score.ts, so the alert the
  // scheduler posts to Discord and the table below can never disagree about
  // what counts as an outlier.
  const { scored: rows, note } = scoreSeries(vals, { metric: perDau ? `${m}/100kDAU` : m, dir });
  if (note) notes.push(note);
  scored.push(...rows);
}

const fmt = (v: number) => Math.abs(v) >= 1000 ? Math.round(v).toLocaleString("en-US") : v >= 1 ? v.toFixed(2) : v.toFixed(4);

const allDates = [...new Set(scored.map((s) => s.date))].sort();
const recent = allDates.slice(-4);

console.log(`\nSeasonal anomaly scan · universe ${universe}`);
console.log(`z = how far the day sits from what THAT WEEKDAY normally does, in sd of historical residuals\n`);

for (const d of recent) {
  const day = scored.filter((s) => s.date === d).sort((a, b) => a.z - b.z);
  if (!day.length) continue;
  const dow = DOW[new Date(d + "T00:00:00Z").getUTCDay()];
  console.log(`${d} (${dow})`);
  for (const s of day) {
    // A "bad" move is down for dir=+1 metrics and up for dir=-1 metrics.
    const bad = s.dir === 1 ? s.z < 0 : s.z > 0;
    const flag = Math.abs(s.z) >= 2 ? (bad ? "  <== ANOMALY" : "  <== unusually good") : "";
    console.log(
      `   ${s.metric.padEnd(28)} obs ${fmt(s.obs).padStart(11)}  exp ${fmt(s.exp).padStart(11)}  z ${(s.z >= 0 ? "+" : "") + s.z.toFixed(2)}${flag}`
    );
  }
  console.log();
}

const worst = scored.filter((s) => s.date === recent[recent.length - 1] && Math.abs(s.z) >= 2);
console.log(worst.length
  ? `${worst.length} metric(s) beyond 2 sd on the newest day — investigate those, ignore the rest.`
  : `Nothing beyond 2 sd on the newest day. Everything is within its normal weekly shape.`);
if (notes.length) console.log("\nskipped:\n  " + notes.join("\n  "));
