// Post-update read: the same daily table each BASELINE.md froze, re-read from
// the corpus after the update, so a tripwire is a lookup and not an argument.
//
//   node tools/post-update.js <universeId> [lastDate]
//
// Reads ONE_DAY headline series only (FILLED_ZERO and partial dropped), which is
// the one shape safe to quote as-is. Nothing here calls the API — run the grab
// first, then this.
const L = require(__dirname + "/lib.js");

const [, , universe, lastDate = "2026-08-31"] = process.argv;

const COLS = [
  ["DAU", "DailyActiveUsers", 0],
  ["PCU", "PeakConcurrentPlayers", 0],
  ["Revenue", "DailyRevenue", 0],
  ["Payers", "PayingUsers", 0],
  ["ARPDAU", "AverageRevenuePerUser", 4],
  ["ARPPU", "AverageRevenuePerPayingUser", 0],
  ["CVR", "PayingUsersCVR", "pct"],
  ["Session", "AverageSessionLengthMinutes", 2],
  ["D1", "ForwardD1Retention", "pct"],
  ["Errors", "ErrorCount", "m"],
  ["Crashes", "ClientCrashCount", 0],
  ["CrashRate", "ClientCrashRate15m", "pct"],
  ["OOM", "OomUnexpectedExits", 0],
  ["FpsP10", "ClientFpsP10", 2],
  ["CpuAvg", "ClientCpuTimeAvg", 2],
  ["Mem%", "ClientMemoryUsagePercentageAvg", "pct"],
  ["Votes", "PlayerFeedbackVotesCount", 0],
];

const series = {};
for (const [, metric] of COLS) series[metric] = L.daily(universe, metric) || new Map();

const dates = [...new Set(Object.values(series).flatMap(m => [...m.keys()]))]
  .filter(d => d <= lastDate).sort().slice(-13);

function cell(v, fmt) {
  if (v == null) return "—";
  if (fmt === "pct") return (v * 100).toFixed(2) + "%";
  if (fmt === "m") return (v / 1e6).toFixed(2) + "M";
  return L.fmt(v, fmt);
}

console.log(`\n## ${universe} — settled daily series (ONE_DAY headline, partial + FILLED_ZERO dropped)\n`);
console.log("| date | " + COLS.map(c => c[0]).join(" | ") + " |");
console.log("|" + "---|".repeat(COLS.length + 1));
for (const d of dates) {
  console.log(`| ${d.slice(5)} | ` + COLS.map(([, m, f]) => cell(series[m].get(d), f)).join(" | ") + " |");
}

// Every metric that has a point on the newest two days, so nothing that moved
// can hide simply because it is not in the column list above.
const newest = dates.at(-1), prev = dates.at(-2);
console.log(`\n### every metric with a settled point on ${prev} / ${newest}\n`);
console.log("| metric | " + prev + " | " + newest + " | Δ |");
console.log("|---|---|---|---|");
for (const name of L.listMetrics(universe)) {
  const d = L.daily(universe, name);
  if (!d) continue;
  const a = d.get(prev), b = d.get(newest);
  if (a == null && b == null) continue;
  const delta = a && b ? (((b - a) / a) * 100).toFixed(1) + "%" : "—";
  console.log(`| ${name} | ${a == null ? "—" : L.fmt(a, 4)} | ${b == null ? "—" : L.fmt(b, 4)} | ${delta} |`);
}
