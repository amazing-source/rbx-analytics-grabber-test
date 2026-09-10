// Acquisition attribution: is a decline BUGS, the ALGORITHM, or something else?
//
//   node tools/acq-split.js <universeId> [firstDay] [lastDay]
//
// The discrimination, from the Brainrot precedent in HANDOFF.md:
//   - every source falling together, INCLUDING Friends (which no algorithm
//     ranks), => not the algorithm.
//   - HomeRecommendation / Search falling while Friends holds => demotion.
//   - impressions holding while conversion falls => appeal or a bug.
//   - impressions falling while conversion holds => discovery/algorithm.
const L = require(__dirname + "/lib.js");
const id = process.argv[2];
const A  = process.argv[3] || "2026-08-22";
const B  = process.argv[4] || "2026-08-31";

const pct = (a, b) => (a == null || b == null || a === 0) ? null : (b - a) / a * 100;
const f = (v, d = 0) => v == null ? "—" : (typeof v === "number"
  ? (Math.abs(v) >= 10000 ? Math.round(v).toLocaleString() : v.toFixed(d)) : String(v));
const fp = v => v == null ? "—" : (v >= 0 ? "+" : "") + v.toFixed(1) + "%";

function edge(map) {
  if (!map) return [null, null, []];
  const days = [...map.keys()].filter(d => d >= A && d <= B);
  if (!days.length) return [null, null, []];
  return [map.get(days[0]), map.get(days[days.length - 1]), days];
}

console.log("=".repeat(96));
console.log(`UNIVERSE ${id}   acquisition attribution   ${A} -> ${B}`);
console.log("=".repeat(96));

// ---- 1. the ladder, headline
console.log("\n LADDER (headline series)");
const ladder = [
  ["UniqueUsersWithImpressions", "saw it", 0],
  ["UniqueUsersWithPlaySessions", "played it", 0],
  ["EndToEndCVR", "saw -> played", 4],
  ["DailyActiveUsers", "DAU", 0],
  ["PeakConcurrentPlayers", "PCU", 0],
  ["ForwardD1Retention", "came back D1", 4],
  ["AverageSessionLengthMinutes", "session min", 2],
];
for (const [m, gloss, d] of ladder) {
  const [a, b, days] = edge(L.daily(id, m));
  console.log("  " + (m + "  (" + gloss + ")").padEnd(46) +
    f(a, d).padStart(12) + f(b, d).padStart(12) + fp(pct(a, b)).padStart(11) +
    (days.length ? "   " + days[0].slice(5) + "->" + days[days.length - 1].slice(5) : ""));
}

// ---- 2. by acquisition source
for (const metric of ["UniqueUsersWithImpressions", "UniqueUsersWithPlaySessions"]) {
  const bd = L.byBreakdown(id, metric, "AcquisitionSource");
  console.log(`\n ${metric}  BY AcquisitionSource`);
  if (!bd) { console.log("   (not served)"); continue; }
  const rows = [];
  for (const [label, map] of bd) {
    const [a, b] = edge(map);
    if (a == null && b == null) continue;
    rows.push({ label, a, b, ch: pct(a, b) });
  }
  rows.sort((x, y) => (y.b || 0) - (x.b || 0));
  console.log("  " + "source".padEnd(30) + A.slice(5).padStart(12) + B.slice(5).padStart(12) + "change".padStart(11));
  for (const r of rows) console.log("  " + r.label.padEnd(30) + f(r.a).padStart(12) + f(r.b).padStart(12) + fp(r.ch).padStart(11));
  const named = rows.filter(r => r.ch != null);
  if (named.length > 1) {
    const ch = named.map(r => r.ch);
    const spread = Math.max(...ch) - Math.min(...ch);
    const fr = named.find(r => /friend/i.test(r.label));
    console.log(`  spread across sources: ${spread.toFixed(1)} pp` +
      (fr ? `   ·  Friends ${fp(fr.ch)}  (no algorithm ranks Friends)` : ""));
  }
}

// ---- 3. RFY ranking signals — what the algorithm itself scores
console.log("\n RFY RANKING SIGNALS (what the recommender scores you on)");
for (const m of ["RFYPlayThroughRate","RFYQualifiedPTR","RFYDuration0To60","RFYDuration61To180",
                 "RFYD1Playtime","RFYD2To7PlayDays","RFYL7PlayDays"]) {
  const [a, b] = edge(L.daily(id, m));
  if (a == null && b == null) continue;
  console.log("  " + m.padEnd(46) + f(a, 4).padStart(12) + f(b, 4).padStart(12) + fp(pct(a, b)).padStart(11));
}
console.log("");
