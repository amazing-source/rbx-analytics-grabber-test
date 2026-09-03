// How many requests does a given window actually cost, and how many of them ask
// for data Roblox no longer stores?
//
//   npm run chunk-cost -- 2024-01-01 2026-09-03
//
// Horizons are the MEASURED ones from CLAUDE.md / COVERAGE.md (grab of
// 9963622286 back to 2026-03-23, 2026-08-09): crash+perf ~30d, ErrorCount ~56d,
// everything else full life.
import "./loader-hooks.mjs";

const { buildSeedTemplates } = await import("../src/lib/default-plan.ts");

const [startArg, endArg] = process.argv.slice(2);
const end = endArg ?? new Date().toISOString().slice(0, 10);
const start = startArg ?? "2024-01-01";
const DAY = 86_400_000;
const spanDays = Math.round((Date.parse(end) - Date.parse(start)) / DAY);

const MAX_CRASH = 7;
const MAX_PERF = 28;
const CRASH = new Set([
  "ClientCrashCount", "ServerCrashCount", "ClientCrashRate15m", "OomUnexpectedExits",
]);
// measured data-retention horizons, in days back from today
const HORIZON_PERF = 30;
const HORIZON_ERRORS = 56;

// One place is enough to make the Place-scoped perf templates materialise;
// a universe with N places multiplies the technical rung by N.
const places = Number(process.env.PLACES ?? 1);
const templates = buildSeedTemplates({
  __places: Array.from({ length: places }, (_, i) => String(100000 + i)),
} as Record<string, string[]> & { __places?: string[] });

type Row = { metric: string; gran: string; cap: number | null; chunks: number; live: number };
const rows: Row[] = [];

for (const t of templates) {
  const q = t.query as { filter?: { dimension?: string }[]; granularity?: string };
  const placeScoped = (q.filter ?? []).some((f) => f?.dimension === "Place");
  const isErr = t.metric === "ErrorCount";
  const technical = placeScoped || isErr;
  const gran = (q.granularity ?? "").replace("METRIC_GRANULARITY_", "");

  if (!technical || gran === "NONE") {
    rows.push({ metric: t.metric, gran, cap: null, chunks: 1, live: 1 });
    continue;
  }
  const cap = CRASH.has(t.metric) ? MAX_CRASH : MAX_PERF;
  const chunks = Math.max(1, Math.ceil(spanDays / cap));
  const horizon = isErr ? HORIZON_ERRORS : HORIZON_PERF;
  const live = Math.max(1, Math.ceil(Math.min(spanDays, horizon) / cap));
  rows.push({ metric: t.metric, gran, cap, chunks, live });
}

const total = rows.reduce((a, r) => a + r.chunks, 0);
const useful = rows.reduce((a, r) => a + r.live, 0);
const tech = rows.filter((r) => r.cap !== null);
const techTotal = tech.reduce((a, r) => a + r.chunks, 0);
const techUseful = tech.reduce((a, r) => a + r.live, 0);

console.log(`window ${start} -> ${end}  (${spanDays} days)`);
console.log(`templates: ${templates.length}  (${tech.length} technical, chunked)\n`);
console.log(`TOTAL requests as planned      ${total}`);
console.log(`  non-technical (1 each)       ${total - techTotal}`);
console.log(`  technical, chunked           ${techTotal}`);
console.log(`    of which inside horizon    ${techUseful}`);
console.log(`    of which PROVABLY EMPTY    ${techTotal - techUseful}  <- crash/perf older than ${HORIZON_PERF}d, errors older than ${HORIZON_ERRORS}d`);
console.log(`\nrequests if the technical rung were clamped to its horizon: ${useful}`);
console.log(`saving: ${total - useful} requests (${(100 * (total - useful) / total).toFixed(1)}%)`);
const paceMin = (n: number) => (n * 2.2 / 60).toFixed(0);
console.log(`\nat 2200ms pacing:  as planned ${paceMin(total)} min   clamped ${paceMin(useful)} min`);

// worst offenders
const byCost = [...tech].sort((a, b) => (b.chunks - b.live) - (a.chunks - a.live)).slice(0, 12);
console.log(`\nbiggest wasted spends:`);
for (const r of byCost) {
  console.log(`  ${r.metric.padEnd(34)} ${String(r.gran).padEnd(9)} cap ${r.cap}d  ${r.chunks} chunks, ${r.chunks - r.live} of them empty by construction`);
}
