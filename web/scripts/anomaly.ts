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

import { readFileSync } from "node:fs";

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

const median = (a: number[]) => {
  if (!a.length) return NaN;
  const s = [...a].sort((x, y) => x - y);
  const i = Math.floor(s.length / 2);
  return s.length % 2 ? s[i] : (s[i - 1] + s[i]) / 2;
};

type Scored = { metric: string; date: string; obs: number; exp: number; z: number; dir: 1 | -1 };

const scored: Scored[] = [];
const notes: string[] = [];

// DAU first: every perDau metric is scored as a rate against it.
const dau = await series("DailyActiveUsers", days);
await sleep(2200);

for (const { m, win, dir, perDau } of METRICS) {
  let s = await series(m, win);
  await sleep(2200);
  if (s && perDau) {
    if (!dau) { notes.push(`${m}: no DAU to normalise against, skipped`); continue; }
    const rate = new Map<string, number>();
    for (const [d, v] of s) { const a = dau.get(d); if (a) rate.set(d, (v / a) * 100000); }
    s = rate;
  }
  if (!s || s.size < 21) { notes.push(`${m}: too few points to baseline (${s?.size ?? 0})`); continue; }

  const dates = [...s.keys()].sort();
  // level(d) from the 7 days before d — computable at the live edge.
  const level = new Map<string, number>();
  for (let i = 7; i < dates.length; i++) {
    const prev = dates.slice(i - 7, i).map((d) => s.get(d)!).filter((v) => v > 0);
    if (prev.length < 5) continue;
    level.set(dates[i], Math.exp(prev.reduce((a, v) => a + Math.log(v), 0) / prev.length));
  }

  // Weekday factor = median ratio, so giveaway spikes cannot set the baseline.
  const ratios: number[][] = Array.from({ length: 7 }, () => []);
  for (const d of dates) {
    const l = level.get(d); const v = s.get(d);
    if (!l || !v) continue;
    ratios[new Date(d + "T00:00:00Z").getUTCDay()].push(v / l);
  }
  const factor = ratios.map((a) => (a.length >= 3 ? median(a) : 1));

  // Residual spread over the whole history, in log space.
  const resid: { d: string; r: number }[] = [];
  for (const d of dates) {
    const l = level.get(d); const v = s.get(d);
    if (!l || !v) continue;
    const f = factor[new Date(d + "T00:00:00Z").getUTCDay()];
    if (!f) continue;
    resid.push({ d, r: Math.log(v / (l * f)) });
  }
  if (resid.length < 20) { notes.push(`${m}: too few residuals`); continue; }
  const mu = resid.reduce((a, x) => a + x.r, 0) / resid.length;
  const sd = Math.sqrt(resid.reduce((a, x) => a + (x.r - mu) ** 2, 0) / resid.length);
  if (!(sd > 0)) { notes.push(`${m}: zero variance`); continue; }

  for (const x of resid.slice(-5)) {
    const v = s.get(x.d)!;
    const f = factor[new Date(x.d + "T00:00:00Z").getUTCDay()];
    scored.push({ metric: perDau ? `${m}/100kDAU` : m, date: x.d, obs: v, exp: level.get(x.d)! * f, z: (x.r - mu) / sd, dir });
  }
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
