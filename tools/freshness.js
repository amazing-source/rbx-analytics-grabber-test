// Per-metric freshness audit: for every metric the corpus holds, the newest
// settled ONE_DAY headline point, per game. Run this BEFORE writing any
// post-update table — the frontier differs by metric and assuming one date for
// all of them silently throws away the newest day.
//
//   node tools/freshness.js [asOf]
const L = require(__dirname + "/lib.js");
const GAMES = [["9963622286","Brainrot"],["10030829154","Waterslide"],["10399712766","Monkey"],
               ["10565445771","Verity"],["10638354731","Seal"]];
const asOf = process.argv[2] || "2026-09-09";
const rows = {};
const names = new Set();
for (const [id, n] of GAMES) {
  rows[n] = {};
  for (const m of L.listMetrics(id)) {
    const d = L.daily(id, m);
    if (!d || !d.size) continue;
    const days = [...d.keys()].filter(k => k <= asOf);
    if (!days.length) continue;
    rows[n][m] = days[days.length - 1];
    names.add(m);
  }
}
const all = [...names].sort();
const w = Math.max(...all.map(s => s.length)) + 2;
console.log("Newest settled ONE_DAY headline point per metric (partial + FILLED_ZERO dropped)\n");
console.log("metric".padEnd(w) + GAMES.map(g => g[1].padStart(13)).join(""));
console.log("-".repeat(w + 13 * GAMES.length));
for (const m of all)
  console.log(m.padEnd(w) + GAMES.map(g => (rows[g[1]][m] || "—").replace(/^2026-/, "").padStart(13)).join(""));
// frontier summary
console.log("\nfrontier by game (count of metrics at each newest date):");
for (const [, n] of GAMES) {
  const tally = {};
  for (const m of Object.keys(rows[n])) tally[rows[n][m]] = (tally[rows[n][m]] || 0) + 1;
  const top = Object.keys(tally).sort().reverse().slice(0, 4).map(d => `${d.slice(5)}×${tally[d]}`);
  console.log(`  ${n.padEnd(12)} ${Object.keys(rows[n]).length} metrics · newest: ${top.join("  ")}`);
}
