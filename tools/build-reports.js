// Generate the descriptive per-game data reports from the DuckDB panel.
//
//   node tools/panel-duck.js && node tools/build-reports.js <outDir>
//
// These are DESCRIPTIVE documents. They report what the series did and how the
// numbers were derived. They contain no causal claim, no verdict, no ranked
// severity and no recommendation — that separation is the point, decided with
// Ren on 2026-09-09 after two diagnoses in one day had to be retracted.
// If interpretation is ever wanted again it goes in its own labelled section,
// never mixed into a sentence that also carries a measurement.
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PANEL = path.join(ROOT, "analysis", "panel-duck");
const OUT = path.resolve(process.argv[2] || path.join(ROOT, "analysis", "reports-0904"));
fs.mkdirSync(OUT, { recursive: true });
const ALL = JSON.parse(fs.readFileSync(path.join(PANEL, "all.json"), "utf8"));

// Publish times from data/games/<id>/place-versions.csv, root place, is_published.
const GAMES = {
  "9963622286":  { short: "Become a Brainrot", title: "Brainrot v608 Post-Update", url: "https://claude.ai/code/artifact/a9c32121-7f9d-4dd6-bbe9-f7ae4c6de292", ver: "v608",  pub: "2026-09-04T12:17:52Z", accent: "#B0472A", accentDark: "#E0866A", file: "brainrot" },
  "10399712766": { short: "+1 Banana Monkey Destruction", title: "Banana Monkey v1246 Post-Update", url: "https://claude.ai/code/artifact/ae8bd250-e1ff-4872-b92c-0d4184997aaa", ver: "v1246", pub: "2026-09-04T17:35:02Z", accent: "#9A5B10", accentDark: "#E5AC57", file: "monkey" },
  "10030829154": { short: "Climb Waterslide and Slide", title: "Waterslide v1719 Post-Update", url: "https://claude.ai/code/artifact/7b7662cb-afaf-43cc-ba5c-f6d478fd4b04", ver: "v1719", pub: "2026-09-04T19:12:51Z", accent: "#1D5F7A", accentDark: "#6FB6D2", file: "waterslide" },
  "10565445771": { short: "Verity Companion [AI]", title: "Verity v684 Post-Update", url: "https://claude.ai/code/artifact/cb89ffd1-4aa3-4453-8d63-8ff0115b11ec", ver: "v684", pub: "2026-09-04T19:40:46Z", accent: "#57387F", accentDark: "#B79BE0", file: "verity",
                   later: [["v688", "2026-09-06T12:44:11Z"], ["v689", "2026-09-08T10:07:47Z"], ["v690", "2026-09-08T10:47:57Z"]] },
  "10638354731": { short: "Seal A Driveway", title: "Seal A Driveway v914 Post-Update", url: "https://claude.ai/code/artifact/d9087fe8-6118-40ff-b1e0-cff6258eb3a5", ver: "v914", pub: "2026-09-04T20:22:33Z", accent: "#1D6B75", accentDark: "#6FC6D2", file: "seal" },
};

const GROUPS = [
  ["Reach", [
    ["UniqueUsersWithImpressions", "Unique users who saw it", "int"],
    ["UniqueUsersWithPlaySessions", "Unique users who played", "int"],
    ["EndToEndCVR", "Impression to play", "pct"],
    ["RFYPlayThroughRate", "RFY play-through rate", "pct"],
    ["DailyActiveUsers", "Daily active users", "int"],
    ["PeakConcurrentPlayers", "Peak concurrents", "int"],
  ]],
  ["Engagement", [
    ["AverageSessionLengthMinutes", "Session length", "min"],
    ["AveragePlayTimeMinutesPerDAU", "Playtime per player", "min"],
    ["ForwardD1Retention", "D1 retention", "pct"],
    ["RFYDuration0To60", "First play under 60s", "pct"],
    ["RFYDuration61To180", "First play 61 to 180s", "pct"],
    ["RFYD2To7PlayDays", "Play days, D2 to D7", "num3"],
    ["RFYL7PlayDays", "Play days per 7", "num2"],
    ["DauMauStickiness", "DAU over MAU", "pct"],
  ]],
  ["Monetization", [
    ["DailyRevenue", "Daily revenue (R$)", "int"],
    ["PayingUsers", "Paying users", "int"],
    ["PayingUsersCVR", "Payer conversion", "pct"],
    ["AverageRevenuePerUser", "Revenue per player", "num3"],
    ["AverageRevenuePerPayingUser", "Revenue per payer", "num1"],
  ]],
  ["Technical", [
    ["ClientCrashRate15m", "Client crash rate", "pct"],
    ["ClientFpsP10", "Client FPS, 10th pct", "num1"],
    ["OomUnexpectedExits", "Out-of-memory exits", "int"],
    ["ErrorCount", "Logged events", "int"],
  ]],
];

const fmt = (v, kind) => {
  if (v == null || Number.isNaN(v)) return "—";
  switch (kind) {
    case "int": return Math.round(v).toLocaleString("en-US");
    case "pct": return (v * 100).toFixed(2) + "%";
    case "min": return v.toFixed(2);
    case "num1": return v.toFixed(1);
    case "num2": return v.toFixed(2);
    case "num3": return v.toFixed(3);
    default: return String(v);
  }
};
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Mean of a metric over an explicit list of dates; null when nothing is served. */
function meanOn(rows, metric, dates) {
  const v = dates.map((d) => rows.find((r) => r.date === d)?.[metric]).filter((x) => x != null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

/** Sparkline over the last n days, with the publish day marked. */
function spark(rows, metric, pubDate, w = 260, h = 54) {
  const pts = rows.filter((r) => r[metric] != null).slice(-28);
  if (pts.length < 2) return `<div class="sparkempty">no data</div>`;
  const vs = pts.map((p) => p[metric]);
  const lo = Math.min(...vs), hi = Math.max(...vs);
  const pad = 6, span = hi - lo || 1;
  const x = (i) => pad + (i * (w - 2 * pad)) / (pts.length - 1);
  const y = (v) => h - pad - ((v - lo) / span) * (h - 2 * pad);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p[metric]).toFixed(1)}`).join(" ");
  const area = `${d} L${x(pts.length - 1).toFixed(1)} ${h - pad} L${x(0).toFixed(1)} ${h - pad} Z`;
  const pi = pts.findIndex((p) => p.date >= pubDate);
  const mark = pi > 0
    ? `<line x1="${x(pi).toFixed(1)}" y1="2" x2="${x(pi).toFixed(1)}" y2="${h - 2}" stroke="var(--rule)" stroke-width="1" stroke-dasharray="3 2"/>`
    : "";
  const last = pts.length - 1;
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="auto" preserveAspectRatio="none" role="img"
    aria-label="${esc(metric)}, last ${pts.length} days, ${fmt(lo)} to ${fmt(hi)}">
    <path d="${area}" fill="var(--accent)" fill-opacity="0.10"/>${mark}
    <path d="${d}" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linejoin="round"/>
    <circle cx="${x(last).toFixed(1)}" cy="${y(vs[last]).toFixed(1)}" r="2.6" fill="var(--accent)"/>
  </svg>`;
}

module.exports = { GAMES, GROUPS, ALL, fmt, esc, meanOn, spark, OUT, PANEL };

if (require.main === module) {
  console.log("panel games:", Object.keys(ALL).join(", "));
  for (const [id, g] of Object.entries(GAMES)) {
    const rows = ALL[id].series;
    console.log(`${g.short.padEnd(30)} ${String(rows.length).padStart(4)} days  ${rows[0].date} -> ${rows.at(-1).date}`);
  }
}
