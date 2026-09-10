// T+3d post-update read for one universe. Uses lib.js so the headline rule
// (empty breakdown) and the partial / FILLED_ZERO drops are enforced in one place.
const L = require("./lib.js");
const id = process.argv[2];
const DAYS = (process.argv[3] || "2026-08-24,2026-08-25,2026-08-26,2026-08-27,2026-08-28,2026-08-29,2026-08-30,2026-08-31").split(",");

const get = (m, o) => { try { return L.daily(id, m, o || {}); } catch { return new Map(); } };
const row = (label, m, p = 2, o) => {
  const s = get(m, o) || new Map();
  const cells = DAYS.map(d => { const v = s.get(d); return v == null ? "—" : (typeof v === "number" ? (Math.abs(v) >= 10000 ? Math.round(v).toLocaleString() : v.toFixed(p)) : v); });
  console.log("  " + label.padEnd(34) + cells.map(c => String(c).padStart(12)).join(""));
};

console.log("=".repeat(34 + 12 * DAYS.length));
console.log("UNIVERSE " + id + "   (— = not served / dropped as partial or FILLED_ZERO)");
console.log("  " + "".padEnd(34) + DAYS.map(d => d.slice(5).padStart(12)).join(""));
console.log("-".repeat(34 + 12 * DAYS.length));
console.log(" BEHAVIOURAL");
row("DailyActiveUsers", "DailyActiveUsers", 0);
row("UniqueUsersWithPlaySessions", "UniqueUsersWithPlaySessions", 0);
row("PeakConcurrentPlayers", "PeakConcurrentPlayers", 0);
row("AverageSessionLengthMinutes", "AverageSessionLengthMinutes", 2);
row("ForwardD1Retention", "ForwardD1Retention", 4);
row("ForwardD7Retention", "ForwardD7Retention", 4);
console.log(" MONEY");
row("DailyRevenue", "DailyRevenue", 0);
row("AverageRevenuePerUser", "AverageRevenuePerUser", 4);
row("AverageRevenuePerPayingUser", "AverageRevenuePerPayingUser", 2);
row("PayingUsersCVR", "PayingUsersCVR", 4);
row("PayingUsers", "PayingUsers", 0);
console.log(" REACH");
row("UniqueUsersWithImpressions", "UniqueUsersWithImpressions", 0);
row("EndToEndCVR", "EndToEndCVR", 4);
console.log(" RFY RANKING SIGNALS (new 08-31)");
["RFYPlayThroughRate","RFYQualifiedPTR","RFYDuration0To60","RFYDuration61To180","RFYD2To7PlayDays","RFYD8To28PlayDays","RFYD1Playtime","RFYD2To7Playtime","RFYD8To28Playtime","RFYL7PlayDays"].forEach(m => row(m, m, 4));
console.log(" TECHNICAL");
row("ClientCrashRate15m", "ClientCrashRate15m", 4);
row("ClientCrashCount", "ClientCrashCount", 0);
row("OomUnexpectedExits", "OomUnexpectedExits", 0);
row("ClientFpsP10", "ClientFpsP10", 2);
console.log(" FEEDBACK");
row("PlayerFeedbackVotesCount", "PlayerFeedbackVotesCount", 0);
