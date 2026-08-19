// Per-place seasonal anomaly scan — for universes that HAVE multiple places.
//
//   npm run anomaly-places -- <universeId> [days]
//
// Why separate from `anomaly`: only five metrics accept a Place breakdown, and
// they are all technical (PeakConcurrentPlayers, ErrorCount, ClientCrashRate15m,
// OomUnexpectedExits, ClientFpsP10). Measured 2026-08-19 on both 10030829154
// and 9963622286: every behavioural and monetization metric — DAU, impressions,
// retention, revenue, CVR — answers "Dimension Place is not supported". That is
// Roblox's own model (the Performance tab is Place-scoped, the rest is not), so
// a per-place view of retention is not something we can build.
//
// The single-place guard matters. On 9963622286 the breakdown returns ONE
// series identical to the universe total, so per-place scoring would just be
// the same numbers again under a different heading — worse than useless,
// because it reads as corroboration. This exits early and says so.
//
// DAU is not available per place either, so volume metrics are normalised by
// that place's own PCU rather than by DAU. Same reasoning as the universe
// scan: without it, a place that simply grew fires an alarm.

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
const days = Number(process.argv[3] || 27); // perf metrics only hold ~28d
if (!key || !/^\d+$/.test(universe || "")) {
  console.error("usage: npm run anomaly-places -- <universeId> [days]");
  process.exit(2);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// dir = +1 higher is better; perPcu = volume, normalise before scoring.
const METRICS: { m: string; dir: 1 | -1; perPcu?: true }[] = [
  { m: "PeakConcurrentPlayers", dir: 1 },
  { m: "ErrorCount", dir: -1, perPcu: true },
  { m: "OomUnexpectedExits", dir: -1, perPcu: true },
  { m: "ClientCrashRate15m", dir: -1 },
  { m: "ClientFpsP10", dir: 1 },
];

type PlaceSeries = { id: string; name: string; pts: Map<string, number> };

async function byPlace(metric: string): Promise<PlaceSeries[] | string> {
  const end = new Date(); end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end.getTime() - days * 86400_000);
  const res = await fetch(`${BASE}/universes/${universe}/metrics`, {
    method: "POST",
    headers: { "x-api-key": key!, "content-type": "application/json" },
    body: JSON.stringify({
      metric, granularity: "OneDay",
      startTime: start.toISOString().replace(/\.\d{3}Z$/, "Z"),
      endTime: end.toISOString().replace(/\.\d{3}Z$/, "Z"),
      breakdown: ["Place"], limit: 200,
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    let m = text; try { m = JSON.parse(text)?.error?.message ?? text; } catch { /* raw */ }
    return String(m).slice(0, 120).replace(/\s+/g, " ");
  }
  let b = JSON.parse(text) as Record<string, unknown>;
  while (b.done === false && typeof b.path === "string") {
    await sleep(1000);
    const r = await fetch(`https://apis.roblox.com/analytics-query-api/${b.path}`, { headers: { "x-api-key": key! } });
    if (!r.ok) return `poll ${r.status}`;
    b = (await r.json()) as Record<string, unknown>;
  }
  const resp = (b.response ?? {}) as { values?: { breakdowns?: { dimension?: string; value?: string; displayValue?: string }[]; dataPoints?: { time: string; value: number }[] }[] };
  const out: PlaceSeries[] = [];
  for (const v of resp.values ?? []) {
    const bd = (v.breakdowns ?? []).find((x) => x.dimension === "Place");
    if (!bd?.value) continue;
    const pts = new Map<string, number>();
    for (const p of v.dataPoints ?? []) if (p.value > 0) pts.set(p.time.slice(0, 10), p.value);
    out.push({ id: bd.value, name: bd.displayValue || bd.value, pts });
  }
  return out;
}

const median = (a: number[]) => {
  if (!a.length) return NaN;
  const s = [...a].sort((x, y) => x - y);
  const i = Math.floor(s.length / 2);
  return s.length % 2 ? s[i] : (s[i - 1] + s[i]) / 2;
};

// Same model as the universe scan: local level x weekday factor, z on log
// residuals. Returns null when there is not enough history to be honest about.
function score(s: Map<string, number>, minPts = 18) {
  const dates = [...s.keys()].sort();
  if (dates.length < minPts) return null;
  const level = new Map<string, number>();
  for (let i = 7; i < dates.length; i++) {
    const prev = dates.slice(i - 7, i).map((d) => s.get(d)!).filter((v) => v > 0);
    if (prev.length < 5) continue;
    level.set(dates[i], Math.exp(prev.reduce((a, v) => a + Math.log(v), 0) / prev.length));
  }
  const ratios: number[][] = Array.from({ length: 7 }, () => []);
  for (const d of dates) {
    const l = level.get(d), v = s.get(d);
    if (l && v) ratios[new Date(d + "T00:00:00Z").getUTCDay()].push(v / l);
  }
  // With <28d of history most weekdays have 2-3 samples, so fall back to 1
  // rather than inventing a factor from a single observation.
  const factor = ratios.map((a) => (a.length >= 3 ? median(a) : 1));
  const resid: { d: string; r: number }[] = [];
  for (const d of dates) {
    const l = level.get(d), v = s.get(d);
    if (!l || !v) continue;
    const f = factor[new Date(d + "T00:00:00Z").getUTCDay()];
    if (f) resid.push({ d, r: Math.log(v / (l * f)) });
  }
  if (resid.length < 12) return null;
  const mu = resid.reduce((a, x) => a + x.r, 0) / resid.length;
  const sd = Math.sqrt(resid.reduce((a, x) => a + (x.r - mu) ** 2, 0) / resid.length);
  if (!(sd > 0)) return null;
  const last = resid[resid.length - 1];
  return { date: last.d, obs: s.get(last.d)!, exp: level.get(last.d)! * factor[new Date(last.d + "T00:00:00Z").getUTCDay()], z: (last.r - mu) / sd, n: resid.length };
}

// ---- discover places -------------------------------------------------------
const pcu = await byPlace("PeakConcurrentPlayers");
if (typeof pcu === "string") { console.error(`Could not enumerate places: ${pcu}`); process.exit(1); }
if (!pcu.length) { console.error("No places returned — nothing to scan."); process.exit(1); }

console.log(`\nPer-place anomaly scan · universe ${universe} · ${days}d\n`);

// Labeled block, not process.exit(): exiting with fetch keep-alive handles
// still open trips a libuv assertion on Windows, turning a correct answer into
// what looks like a crash.
scan: {
if (pcu.length === 1) {
  console.log(`This universe has ONE place: ${pcu[0].name} (${pcu[0].id}).`);
  console.log(`Per-place scoring would reproduce the universe totals under a different`);
  console.log(`heading, which reads as corroboration when it is the same number twice.`);
  console.log(`\nUse: npm run anomaly -- ${universe}`);
  break scan;
}

const pcuById = new Map(pcu.map((p) => [p.id, p]));
console.log(`${pcu.length} places found:`);
for (const p of [...pcu].sort((a, b) => Math.max(...b.pts.values()) - Math.max(...a.pts.values()))) {
  console.log(`  ${p.id.padEnd(18)} peak ${String(Math.round(Math.max(...p.pts.values()))).padStart(7)}  ${p.pts.size}d  ${p.name}`);
}
console.log();

// ---- score each metric per place -------------------------------------------
type Row = { place: string; metric: string; z: number; obs: number; exp: number; date: string; dir: 1 | -1 };
const rows: Row[] = [];
const thin: string[] = [];

for (const { m, dir, perPcu } of METRICS) {
  const got = m === "PeakConcurrentPlayers" ? pcu : await byPlace(m);
  if (m !== "PeakConcurrentPlayers") await sleep(2200);
  if (typeof got === "string") { thin.push(`${m}: ${got}`); continue; }
  for (const ps of got) {
    let series = ps.pts;
    if (perPcu) {
      const denom = pcuById.get(ps.id)?.pts;
      if (!denom) { thin.push(`${ps.name} · ${m}: no PCU to normalise against`); continue; }
      const rate = new Map<string, number>();
      for (const [d, v] of series) { const c = denom.get(d); if (c) rate.set(d, (v / c) * 1000); }
      series = rate;
    }
    const sc = score(series);
    if (!sc) { thin.push(`${ps.name} · ${m}: too little history to baseline (${series.size}d)`); continue; }
    rows.push({ place: ps.name, metric: perPcu ? `${m}/1k PCU` : m, ...sc, dir });
  }
}

const flagged = rows.filter((r) => {
  const bad = r.dir === 1 ? r.z < 0 : r.z > 0;
  return bad && Math.abs(r.z) >= 2;
});

const fmt = (v: number) => Math.abs(v) >= 1000 ? Math.round(v).toLocaleString("en-US") : v >= 1 ? v.toFixed(2) : v.toFixed(4);

console.log(`newest scored day per series, ranked by how bad:\n`);
for (const r of rows.sort((a, b) => (a.dir === 1 ? a.z : -a.z) - (b.dir === 1 ? b.z : -b.z)).slice(0, 20)) {
  const bad = r.dir === 1 ? r.z < 0 : r.z > 0;
  const flag = bad && Math.abs(r.z) >= 2 ? "  <== ANOMALY" : "";
  console.log(`  ${r.place.padEnd(28)} ${r.metric.padEnd(24)} ${r.date}  obs ${fmt(r.obs).padStart(10)}  exp ${fmt(r.exp).padStart(10)}  z ${(r.z >= 0 ? "+" : "") + r.z.toFixed(2)}${flag}`);
}

console.log(flagged.length
  ? `\n${flagged.length} place/metric pair(s) beyond 2 sd in the bad direction.`
  : `\nNo place is beyond 2 sd in the bad direction.`);

if (thin.length) {
  console.log(`\nnot scored (stated, not silently dropped):`);
  for (const t of thin) console.log(`  ${t}`);
}
} // scan
