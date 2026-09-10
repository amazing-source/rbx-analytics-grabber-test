// Per-game post-update read from the corpus. Daily ONE_DAY headline rows only
// (partial + FILLED_ZERO dropped), so every printed cell is quotable as-is.
//
//   node tools/upd-read.js <universeId> <publishDate> [lastDate]
//
// Prints: (a) freshness — the newest settled day per metric family, because a
// metric that has not arrived is not a flat one; (b) the daily table across the
// publish; (c) a pre/post comparison on COMPLETE days only, with the same
// weekdays on both sides where the window allows.
const L = require(__dirname + "/lib.js");
const [, , universe, publish, lastDate = "2026-09-08"] = process.argv;

const BLOCKS = [
  ["Reach",   [["Impressions","UniqueUsersWithImpressions",0],["E2E CVR","EndToEndCVR","pct"],
               ["RFY PTR","RFYPlayThroughRate","pct"],["Bounce<60","RFYDuration0To60","pct"],
               ["Bounce61-180","RFYDuration61To180","pct"],["D2-7 playdays","RFYD2To7PlayDays",3],
               ["D8-28 playdays","RFYD8To28PlayDays",3],["L7 playdays","RFYL7PlayDays",3]]],
  ["Scale",   [["DAU","DailyActiveUsers",0],["UUwPlaySessions","UniqueUsersWithPlaySessions",0],
               ["PCU","PeakConcurrentPlayers",0],["MAU","MonthlyActiveUsers",0]]],
  ["Hook",    [["D1","ForwardD1Retention","pct"],["D7","ForwardD7Retention","pct"],
               ["Session min","AverageSessionLengthMinutes",2],["Playtime/DAU","AveragePlayTimeMinutesPerDAU",2],
               ["Stickiness","DauMauStickiness","pct"]]],
  ["Money",   [["Revenue","DailyRevenue",0],["Payers","PayingUsers",0],["CVR","PayingUsersCVR","pct"],
               ["ARPDAU","AverageRevenuePerUser",4],["ARPPU","AverageRevenuePerPayingUser",1]]],
  ["Tech",    [["Errors","ErrorCount","m"],["ClientCrash","ClientCrashCount",0],
               ["CrashRate","ClientCrashRate15m","pct"],["ServerCrash","ServerCrashCount",0],
               ["OOM","OomUnexpectedExits",0],["FpsP10","ClientFpsP10",1],["CpuAvg","ClientCpuTimeAvg",2],
               ["Mem%","ClientMemoryUsagePercentageAvg","pct"]]],
  ["Feedback",[["Votes","PlayerFeedbackVotesCount",0]]],
];
const ALL = BLOCKS.flatMap(b => b[1]);
const S = {};
for (const [, m] of ALL) S[m] = L.daily(universe, m) || new Map();

const cell = (v, f) => v == null ? "—"
  : f === "pct" ? (v * 100).toFixed(2) + "%"
  : f === "m" ? (v / 1e6).toFixed(2) + "M" : L.fmt(v, f);

console.log(`\n# ${universe} — publish ${publish}\n`);
console.log(`## Freshness — newest settled day per metric (behavioural metrics lag ~2d)\n`);
for (const [blk, cols] of BLOCKS) {
  const parts = cols.map(([n, m]) => { const k = [...S[m].keys()]; return `${n} ${k.length ? k.at(-1) : "NONE"}`; });
  console.log(`  ${blk.padEnd(9)} ${parts.join(" · ")}`);
}

const dates = [...new Set(ALL.flatMap(([, m]) => [...S[m].keys()]))].filter(d => d <= lastDate).sort().slice(-16);
for (const [blk, cols] of BLOCKS) {
  console.log(`\n## ${blk}\n`);
  console.log("| date | dow | " + cols.map(c => c[0]).join(" | ") + " |");
  console.log("|" + "---|".repeat(cols.length + 2));
  for (const d of dates) {
    const mark = d === publish ? " **←publish**" : "";
    console.log(`| ${d.slice(5)}${mark} | ${L.dow(d)} | ` + cols.map(([, m, f]) => cell(S[m].get(d), f)).join(" | ") + " |");
  }
}

// pre/post on complete days only. Post starts the day AFTER the publish: the
// publish day's cohort is mostly pre-update.
const pre = [], post = [];
const dAdd = (s, n) => { const t = new Date(s + "T00:00:00Z"); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
for (let i = 7; i >= 1; i--) pre.push(dAdd(publish, -i));
for (let i = 1; i <= 7; i++) { const d = dAdd(publish, i); if (d <= lastDate) post.push(d); }
const mean = (m, ds) => { const v = ds.map(d => m.get(d)).filter(x => x != null); return v.length ? [v.reduce((a, b) => a + b, 0) / v.length, v.length] : [null, 0]; };

console.log(`\n## Pre (${pre[0]}→${pre.at(-1)}) vs post (${post[0]}→${post.at(-1)}) — complete days only\n`);
console.log("| metric | pre (n) | post (n) | Δ% | matched-weekday Δ% |");
console.log("|---|---|---|---|---|");
for (const [n, m, f] of ALL) {
  const [a, na] = mean(S[m], pre), [b, nb] = mean(S[m], post);
  if (a == null && b == null) continue;
  // matched weekday: only pairs where both sides hold the same dow
  const pairs = [];
  for (const d of post) { const src = pre.find(p => L.dow(p) === L.dow(d) && S[m].get(p) != null); if (src && S[m].get(d) != null) pairs.push([S[m].get(src), S[m].get(d)]); }
  const mw = pairs.length ? ((pairs.reduce((s, [x, y]) => s + y / x, 0) / pairs.length - 1) * 100).toFixed(1) + `% (n=${pairs.length})` : "—";
  const dl = a && b ? (((b - a) / a) * 100).toFixed(1) + "%" : "—";
  console.log(`| ${n} | ${cell(a, f)} (${na}) | ${cell(b, f)} (${nb}) | ${dl} | ${mw} |`);
}
