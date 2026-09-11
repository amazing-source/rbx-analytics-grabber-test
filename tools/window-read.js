// Per-game daily table across a window, for "what moved and when".
// Reuses tools/lib.js `daily()` so the headline-series rule, FILLED_ZERO and
// partial handling are the repo's single implementation, not a second one.
//
//   node tools/window-read.js [startISO] [endISO]
const { daily } = require("./lib.js");

const START = process.argv[2] || "2026-08-28";
const END   = process.argv[3] || "2026-09-11";

const GAMES = [
  ["9963622286",  "Brainrot"],
  ["10030829154", "Waterslide"],
  ["10399712766", "Banana Monkey"],
  ["10565445771", "Verity"],
  ["10638354731", "Seal"],
  ["9610561918",  "Knife Farm"],
];

// label, metric, decimals
const ROWS = [
  ["PCU",         "PeakConcurrentPlayers",        0],
  ["DAU",         "DailyActiveUsers",             0],
  ["Revenue R$",  "DailyRevenue",                 0],
  ["ARPU",        "AverageRevenuePerUser",        4],
  ["PayCVR %",    "PayingUsersCVR",               4],
  ["D1 %",        "ForwardD1Retention",           4],
  ["Session min", "AverageSessionLengthMinutes",  2],
  ["Play min/DAU","AveragePlayTimeMinutesPerDAU", 2],
  ["Impressions", "UniqueUsersWithImpressions",   0],
  ["E2E CVR",     "EndToEndCVR",                  4],
  ["RFY PTR",     "RFYPlayThroughRate",           4],
  ["RFY bounce60","RFYDuration0To60",             4],
  ["RFY D2-7 pd", "RFYD2To7PlayDays",             3],
  ["ErrorCount",  "ErrorCount",                   0],
];

function dates(a, b) {
  const out = []; const d = new Date(a + "T00:00:00Z"); const e = new Date(b + "T00:00:00Z");
  while (d <= e) { out.push(d.toISOString().slice(0, 10)); d.setUTCDate(d.getUTCDate() + 1); }
  return out;
}
const DAYS = dates(START, END);
const dow = (d) => ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(d + "T00:00:00Z").getUTCDay()];

for (const [id, name] of GAMES) {
  console.log(`\n${"=".repeat(110)}\n${name}  (${id})   ${START} .. ${END}\n${"=".repeat(110)}`);
  const series = ROWS.map(([lbl, metric, dp]) => {
    let m = null;
    try { m = daily(id, metric); } catch { m = null; }
    return { lbl, dp, m };
  });
  const head = "date       dow  " + series.map((s) => s.lbl.padStart(13)).join("");
  console.log(head);
  for (const d of DAYS) {
    const cells = series.map((s) => {
      if (!s.m || !s.m.has(d)) return "—".padStart(13);
      const v = s.m.get(d);
      return (s.dp ? Number(v).toFixed(s.dp) : Math.round(v).toLocaleString("en-US")).padStart(13);
    });
    console.log(`${d} ${dow(d)}  ${cells.join("")}`);
  }
}
