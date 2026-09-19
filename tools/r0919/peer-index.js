// Peer index for every game: each game's daily metric divided by its own 01–07 Sep
// mean, then divided by the MEDIAN of the other four games' same ratio. 1.00 = moved
// exactly like the rest of the portfolio that day, so a shared calendar or platform
// effect (the 08 Sep payer step, Labor Day) cancels and what remains is game-specific.
// Also writes the SHARED component (median of all five ratios) for the cover.
//   node tools/r0919/peer-index.js     (run after the per-game extras scripts)
const fs = require("fs");
const path = require("path");
const BASE = path.join(__dirname, "../../reports/2026-09-19/data");
const S = ["brainrot", "waterslide", "monkey", "verity", "seal"];
const NAME = { brainrot: "Brainrot", waterslide: "Waterslide", monkey: "Banana Monkey", verity: "Verity", seal: "Seal" };
const D = Object.fromEntries(S.map(s => [s, JSON.parse(fs.readFileSync(path.join(BASE, `${s}.json`), "utf8"))]));
const DAYS = []; for (let d = new Date("2026-09-01T00:00:00Z"); d <= new Date("2026-09-17T00:00:00Z"); d.setUTCDate(d.getUTCDate() + 1)) DAYS.push(d.toISOString().slice(0, 10));
const BASEDAYS = DAYS.slice(0, 7), SHOW = DAYS.slice(7);
const med = a => { a = a.filter(x => x != null && isFinite(x)).sort((x, y) => x - y); if (!a.length) return null; const m = (a.length - 1) / 2; return (a[Math.floor(m)] + a[Math.ceil(m)]) / 2; };
const val = (s, metric, d) => { const m = D[s].metrics.find(x => x.metric === metric); return m && !m.missing ? m.run[d] : null; };
const baseOf = (s, metric) => { const v = BASEDAYS.map(d => val(s, metric, d)).filter(x => x != null); return v.length ? v.reduce((a, b) => a + b) / v.length : null; };
const ratio = (s, metric, d) => { const b = baseOf(s, metric), v = val(s, metric, d); return v == null || !b ? null : v / b; };
// rates first: they are what the index is for; volumes last, read with the note
const METRICS = [["EndToEndCVR", "Impression→play CVR"], ["ForwardD1Retention", "D1 retention"], ["AverageSessionLengthMinutes", "Session length"],
  ["RFYD2To7PlayDays", "RFY D2–7 play days"], ["PayingUsersCVR", "Paying-user CVR"], ["AverageRevenuePerUser", "ARPDAU"],
  ["AverageRevenuePerPayingUser", "ARPPU"], ["ClientCrashRate15m", "Crash rate"], ["UniqueUsersWithImpressions", "Impressions"], ["DailyActiveUsers", "DAU"]];
const SRC = "`run` series in reports/2026-09-19/data/<slug>.json (settled ONE_DAY headline). Index = (this game ÷ its own 01–07 Sep mean) ÷ median over the other four games of the same ratio. tools/r0919/peer-index.js";
const out = {};
for (const s of S) {
  const rows = METRICS.map(([m, label]) => [label, ...SHOW.map(d => { const r = ratio(s, m, d), p = med(S.filter(x => x !== s).map(x => ratio(x, m, d)));
    return r == null || p == null ? "—" : (r / p).toFixed(2); })]);
  out[s] = rows;
  const f = path.join(BASE, `extras-${s}.json`); const X = JSON.parse(fs.readFileSync(f, "utf8"));
  X.tables = X.tables.filter(t => t.id !== "peer-index");
  X.tables.push({ id: "peer-index", section: "glance", title: `${NAME[s]} against the other four games, day by day from 08 Sep`,
    columns: ["Metric", ...SHOW.map(d => d.slice(5))], rows, numeric: SHOW.map((_, i) => i + 1),
    note: "1.00 = this game moved exactly like the rest of the portfolio that day; below 1 = worse, above 1 = better (for crash rate, above 1 = more crashes). Each game is first divided by its own 01–07 Sep mean, so shared calendar or platform effects — the 08 Sep payer step, the Labor Day weekend — cancel. Rates are the reliable rows; for DAU and impressions the peers mix growing and decaying games, so read those rows as 'moved differently from the portfolio', not as a counterfactual.",
    source: SRC });
  fs.writeFileSync(f, JSON.stringify(X, null, 1));
}
// the shared component: what the whole portfolio did, per day
const shared = METRICS.filter(([m]) => !/DailyActiveUsers|UniqueUsersWithImpressions/.test(m)).map(([m, label]) =>
  [label, ...SHOW.map(d => { const p = med(S.map(x => ratio(x, m, d))); return p == null ? "—" : p.toFixed(2); })]);
fs.writeFileSync(path.join(BASE, "extras-cover.json"), JSON.stringify({ tables: [{ id: "shared", section: "cross",
  title: "What the whole portfolio did, day by day (median of the five games)", columns: ["Metric", ...SHOW.map(d => d.slice(5))], rows: shared,
  numeric: SHOW.map((_, i) => i + 1), note: "Each game divided by its own 01–07 Sep mean, then the median of the five. A day where this row steps is a portfolio-wide move — calendar, platform or instrument — and no single build explains it.",
  source: SRC }] }, null, 1));
for (const s of S) { console.log(`== ${s}   ${SHOW.map(d => d.slice(8)).join("   ")}`); for (const r of out[s]) console.log("  " + r[0].padEnd(22) + r.slice(1).map(x => x.padStart(5)).join("")); }
console.log("== SHARED (median of five)"); for (const r of shared) console.log("  " + r[0].padEnd(22) + r.slice(1).map(x => x.padStart(5)).join(""));
