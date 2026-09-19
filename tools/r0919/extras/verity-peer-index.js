// Verity against the other four games, day by day around v689 (08 Sep): each game's
// metric divided by its own 01–07 Sep mean, then Verity's ratio divided by the peers'
// median ratio. 1.00 = Verity moved exactly like the portfolio that day. Appends one
// table to extras-verity.json (run AFTER tools/r0919/extras/verity.js).
//   node tools/r0919/extras/verity-peer-index.js
const fs = require("fs");
const path = require("path");
const BASE = path.join(__dirname, "../../../reports/2026-09-19/data");
const S = ["verity", "brainrot", "waterslide", "monkey", "seal"];
const D = Object.fromEntries(S.map(s => [s, JSON.parse(fs.readFileSync(path.join(BASE, `${s}.json`), "utf8"))]));
const DAYS = []; for (let d = new Date("2026-09-01T00:00:00Z"); d <= new Date("2026-09-16T00:00:00Z"); d.setUTCDate(d.getUTCDate() + 1)) DAYS.push(d.toISOString().slice(0, 10));
const BASEDAYS = DAYS.slice(0, 7);
const med = a => { a = a.filter(x => x != null && isFinite(x)).sort((x, y) => x - y); if (!a.length) return null; const m = (a.length - 1) / 2; return (a[Math.floor(m)] + a[Math.ceil(m)]) / 2; };
const val = (s, metric, d) => { const m = D[s].metrics.find(x => x.metric === metric); return m && !m.missing ? m.run[d] : null; };
const base = (s, metric) => { const v = BASEDAYS.map(d => val(s, metric, d)).filter(x => x != null); return v.length ? v.reduce((a, b) => a + b) / v.length : null; };
const METRICS = [["PayingUsersCVR", "Paying-user CVR"], ["AverageRevenuePerUser", "ARPDAU"], ["AverageRevenuePerPayingUser", "ARPPU"],
  ["RFYD2To7PlayDays", "RFY D2–7 play days"], ["AverageSessionLengthMinutes", "Session length"], ["ForwardD1Retention", "D1 retention"],
  ["UniqueUsersWithImpressions", "Impressions"], ["DailyActiveUsers", "DAU"]];
const rows = METRICS.map(([m, label]) => { const b = Object.fromEntries(S.map(s => [s, base(s, m)]));
  return [label, ...DAYS.slice(7).map(d => { const v = val("verity", m, d), p = med(S.slice(1).map(s => val(s, m, d) != null && b[s] ? val(s, m, d) / b[s] : null));
    return v == null || p == null || !b.verity ? "—" : ((v / b.verity) / p).toFixed(2); })]; });
const X = JSON.parse(fs.readFileSync(path.join(BASE, "extras-verity.json"), "utf8"));
X.tables = X.tables.filter(t => t.id !== "peer-index");
X.tables.push({ id: "peer-index", section: "money", title: "Verity against the other four games, day by day from v689 (08 Sep)",
  columns: ["Metric", ...DAYS.slice(7).map(d => d.slice(5))], rows, numeric: DAYS.slice(7).map((_, i) => i + 1),
  note: "1.00 = Verity moved exactly like the other four games that day; below 1 = worse than the portfolio. Each game is first divided by its own 01–07 Sep mean, so the shared 08 Sep payer step and the Labor Day weekend cancel out.",
  source: "`run` series in reports/2026-09-19/data/<slug>.json (settled ONE_DAY headline); index = (Verity ÷ own 01–07 Sep mean) ÷ median over Brainrot, Waterslide, Monkey, Seal of the same ratio. tools/r0919/extras/verity-peer-index.js" });
fs.writeFileSync(path.join(BASE, "extras-verity.json"), JSON.stringify(X, null, 1));
console.log(rows.map(r => r.join("  ")).join("\n"));
