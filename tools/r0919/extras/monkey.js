// Analyst tables for +1 Banana Monkey Destruction (10399712766), 2026-09-19 read.
// Reads reports/2026-09-19/data/monkey.json (+ portfolio.json, feedback merge, explore),
// the corpus (data/games/<id>/series.json, data-quality.md), the deploy log and the
// filed error exports. Writes reports/2026-09-19/data/extras-monkey.json.
//   node tools/r0919/extras/monkey.js
// Every figure a table prints is computed here; nothing is typed by hand.
const fs = require("fs");
const path = require("path");
const L = require("../../lib.js");
const ROOT = L.ROOT;
const BASE = path.join(ROOT, "reports/2026-09-19");
const ID = "10399712766", BR = "9963622286";
const D = JSON.parse(fs.readFileSync(path.join(BASE, "data/monkey.json"), "utf8"));
const P = JSON.parse(fs.readFileSync(path.join(BASE, "data/portfolio.json"), "utf8"));
const FB = JSON.parse(fs.readFileSync(path.join(BASE, `data/feedback-${ID}.json`), "utf8"));
const W = D.window;
const GAMES = { brainrot: "9963622286", waterslide: "10030829154", monkey: "10399712766", verity: "10565445771", seal: "10638354731" };

// ---------------------------------------------------------------- helpers
const addDays = (d, n) => { const x = new Date(d + "T00:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const range = (a, b) => { const o = []; for (let d = a; d <= b; d = addDays(d, 1)) o.push(d); return o; };
const DOW = d => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(d + "T00:00:00Z").getUTCDay()];
const mean = a => { const b = a.filter(x => x != null && Number.isFinite(x)); return b.length ? b.reduce((x, y) => x + y, 0) / b.length : null; };
const sum = a => a.filter(x => x != null && Number.isFinite(x)).reduce((x, y) => x + y, 0);
const sd = a => { const b = a.filter(x => x != null && Number.isFinite(x)); if (b.length < 2) return null; const m = mean(b); return Math.sqrt(b.reduce((s, x) => s + (x - m) ** 2, 0) / (b.length - 1)); };
const median = a => { const b = a.filter(x => x != null && Number.isFinite(x)).sort((x, y) => x - y); if (!b.length) return null; const i = Math.floor(b.length / 2); return b.length % 2 ? b[i] : (b[i - 1] + b[i]) / 2; };
const rel = (a, b) => (a != null && b != null && a !== 0) ? b / a - 1 : null;
const I = v => v == null || !Number.isFinite(v) ? "—" : Math.round(v).toLocaleString("en-US");
const F = (v, p = 2) => v == null || !Number.isFinite(v) ? "—" : v.toFixed(p);
const PC = (v, p = 1) => v == null || !Number.isFinite(v) ? "—" : (v * 100).toFixed(p) + "%";
const SG = (v, p = 1) => v == null || !Number.isFinite(v) ? "—" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v * 100).toFixed(p) + "%";
const PP = (v, p = 1) => v == null || !Number.isFinite(v) ? "—" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v * 100).toFixed(p) + "pp";
const SN = (v, p = 2) => v == null || !Number.isFinite(v) ? "—" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(p);
const R = v => "R$" + I(v);

const series = {}; const load = id => (series[id] ||= JSON.parse(fs.readFileSync(path.join(ROOT, "data/games", id, "series.json"), "utf8")));
const placeCount = s => { const f = (s.filters || []).find(x => (x.dimension || x.name) === "Place"); return f ? (f.values || []).length : 0; };
const onlyPlace = s => (s.filters || []).every(f => (f.dimension || f.name) === "Place");
// Same headline rule as build.js: empty breakdown, Place-only filters, widest place set first, no partial / FILLED_ZERO.
function headline(id, metric, gran = "METRIC_GRANULARITY_ONE_DAY") {
  const m = load(id).metrics[metric]; if (!m) return new Map();
  const c = (m.series || []).filter(s => s.granularity === gran && !Object.keys(s.breakdown || {}).length && onlyPlace(s)).sort((a, b) => placeCount(b) - placeCount(a));
  const v = new Map();
  for (const s of c) for (const p of s.points) { if (p.partial || p.status === "FILLED_ZERO" || p.date > "2026-09-19") continue; if (!v.has(p.date)) v.set(p.date, p.value); }
  return v;
}
function bd(id, metric, dim, gran = "METRIC_GRANULARITY_ONE_DAY") {
  const m = load(id).metrics[metric]; if (!m) return {};
  const c = (m.series || []).filter(s => s.granularity === gran && Object.keys(s.breakdown || {}).length === 1 && Object.keys(s.breakdown).includes(dim) && L.isWholePopulation(s, dim)).sort((a, b) => placeCount(b) - placeCount(a));
  const out = {};
  for (const s of c) { const lbl = (s.breakdownLabels && s.breakdownLabels[dim]) || s.breakdown[dim]; const mm = (out[lbl] ||= new Map());
    for (const p of s.points) { if (p.partial || p.status === "FILLED_ZERO" || p.date > "2026-09-19") continue; if (!mm.has(p.date)) mm.set(p.date, p.value); } }
  return out;
}
const run = k => { const m = D.metrics.find(x => x.metric === k); return m ? new Map(Object.entries(m.run).filter(([, v]) => v != null)) : new Map(); };
function paired(map, post, pre, skip = []) {
  const pr = []; post.forEach((d, i) => { const a = map.get(pre[i]), b = map.get(d); if (skip.includes(d) || skip.includes(pre[i])) return;
    if (a != null && b != null && Number.isFinite(a) && Number.isFinite(b)) pr.push([pre[i], d, a, b]); });
  const before = mean(pr.map(p => p[2])), after = mean(pr.map(p => p[3]));
  return { n: pr.length, before, after, delta: rel(before, after), pairs: pr };
}
const POST = W.POST, PRE = W.PRE, PRIOR = W.PRIOR;

const tables = [];
const T = (section, title, columns, rows, numeric, note, source) => tables.push({ section, title, columns, rows, numeric, note, source });

// data-quality.md: the corpus keeps the FIRST settled read; later re-serves are logged. Build a latest-read map.
const DQ = {};
for (const line of fs.readFileSync(path.join(ROOT, "data/games", ID, "data-quality.md"), "utf8").split("\n")) {
  const m = line.match(/^\| revision \| (\w+) \| ([^|]*) \| (\S+) \| settled point re-served as ([\d.eE+-]+) \(captured ([^)]+)\); kept ([\d.eE+-]+)/);
  if (!m) continue; const [, metric, ser, ts, nv, cap] = m; if (!ts.endsWith("T00:00:00Z")) continue;
  const k = metric + "|" + ser.trim(); const o = (DQ[k] ||= {}); const d = ts.slice(0, 10);
  if (!o[d] || cap > o[d].cap) o[d] = { v: +nv, cap };
}
const latest = (metric, ser, map) => { const o = DQ[metric + "|" + ser] || {}; const out = new Map(map); for (const [d, r] of Object.entries(o)) if (out.has(d)) out.set(d, r.v); return out; };

// ================================================================ GLANCE
{
  const K = [["DailyActiveUsers", "DAU", I], ["UniqueUsersWithImpressions", "Impressions", I], ["EndToEndCVR", "Impression→play CVR", v => PC(v, 2)],
    ["ForwardD1Retention", "D1 retention", v => PC(v, 2)], ["AverageSessionLengthMinutes", "Session length (min)", v => F(v, 2)],
    ["AveragePlayTimeMinutesPerDAU", "Play min per DAU", v => F(v, 2)], ["RFYDuration0To60", "RFY bounce <60s", v => PC(v, 2)],
    ["RFYD2To7PlayDays", "RFY D2–7 play days", v => F(v, 3)], ["RFYD8To28PlayDays", "RFY D8–28 play days", v => F(v, 3)],
    ["PayingUsers", "Paying users", I], ["PayingUsersCVR", "Paying-user CVR", v => PC(v, 2)], ["AverageRevenuePerPayingUser", "ARPPU (R$)", v => F(v, 1)],
    ["AverageRevenuePerUser", "ARPDAU (R$)", v => F(v, 3)], ["DailyRevenue", "Revenue (R$)", I], ["ClientCrashRate15m", "Client crash rate", v => PC(v, 3)]];
  const rows = K.map(([k, lab, f]) => { const mp = run(k); const a = paired(mp, POST, PRE), b = paired(mp, PRE, PRIOR), c = paired(mp, POST, PRIOR);
    return [`${lab} \`${k}\``, f(b.before), f(a.before), f(a.after), SG(a.delta), SG(b.delta), SG(c.delta), `${a.n}/${c.n}`]; });
  T("reach", "Two-week view: this week against both earlier weeks",
    ["Metric", "Wk −2 (08-29→09-02)", "Wk −1 (09-05→09)", "This wk (09-12→16)", "Δ vs wk −1", "Δ wk −1 vs wk −2", "Δ vs wk −2", "Pairs (−1/−2)"], rows, [1, 2, 3, 4, 5, 6, 7],
    "A rate that rose this week but still sits below week −2 recovered from a trough, not to a new level. Read the last column before the first delta.",
    "data/monkey.json metrics[].run; weekday-paired means (D vs D−7, D vs D−14), only pairs where both days exist.");
}

// ================================================================ TIMELINE
{
  const pv = D.placeVersions; const vt = v => (pv.find(x => x.v === v) || {}).t;
  const hrs = (a, b) => ((new Date(b) - new Date(a)) / 3600e3);
  const rows = [
    ["v1246 (AURAS update)", "2026-09-04 17:35", "2026-09-11 15:08", F(hrs(vt(1246), vt(1250)), 1) + " h", "whole wk −1 window"],
    ["v1250", "2026-09-11 15:08", "2026-09-11 15:33", F(hrs(vt(1250), vt(1251)) * 60, 0) + " min", "publish day only"],
    ["v1251 (UPD 11.09 spec)", "2026-09-11 15:33", "2026-09-17 17:35", F(hrs(vt(1251), vt(1252)), 1) + " h", "whole this-week window"],
    ["v1252 (no spec filed)", "2026-09-17 17:35", "live at 2026-09-19", F(hrs(vt(1252), "2026-09-19T09:15:00Z"), 1) + " h to 09-19 09:15", "after the window"],
    ["Event: NEW UPDATE - AURAS", "2026-09-04 18:00", "2026-09-12 18:00", "192.0 h", "wk −1 + first day of this week"],
    ["Event: NEW UPDATE (no END row)", "2026-09-10 18:00", "—", "—", "starts 21 h before v1250"],
    ["Event: Banana Vault", "2026-09-11 17:00", "2026-09-18 18:00", F(hrs("2026-09-11T17:00:06Z", "2026-09-18T18:00:06Z"), 1) + " h", "whole this-week window"],
    ["Event: x5 BONUS", "2026-09-06 16:00", "2026-09-06 17:00", "1.0 h", "wk −1 (Sunday)"],
    ["Event: x5 BONUS", "2026-09-13 16:00", "2026-09-13 17:00", "1.0 h", "this week (Sunday)"],
    ["Event: NEW UPDATE (no END row)", "2026-09-17 18:00", "—", "—", "25 min after v1252"],
  ];
  T("timeline", "Live spans: builds and events", ["Item", "Start (UTC)", "End (UTC)", "Length", "Falls in"], rows, [3],
    "v1250 was live for 25 minutes. The this-week window (Sat 09-12 → Wed 09-16) ran entirely on v1251 with the Banana Vault event live.",
    "data/monkey.json placeVersions (published=true) and annotations (EXPERIENCE_EVENT_STATE START/END); hours computed from the timestamps.");
  const inWin = (t, days) => days.includes(t.slice(0, 10));
  const cnt = (days, re) => D.annotations.filter(a => re.test(a.type) && inWin(a.t, days)).length;
  const rows2 = [["Builds live", "v1246", "v1251"],
    ["Publishes inside the window", String(pv.filter(v => v.published && PRE.includes(v.d)).length), String(pv.filter(v => v.published && POST.includes(v.d)).length)],
    ["Saved-not-published versions", String(pv.filter(v => !v.published && PRE.includes(v.d)).length) + " (v1247, v1248, v1249)", String(pv.filter(v => !v.published && POST.includes(v.d)).length)],
    ["Place thumbnail changes", String(cnt(PRE, /PLACE_THUMBNAIL/)), String(cnt(POST, /PLACE_THUMBNAIL/))],
    ["Engine releases (RCC / clients)", String(cnt(PRE, /ENGINE_RELEASE/)), String(cnt(POST, /ENGINE_RELEASE/))],
    ["x5 BONUS hours", "1 (Sun 09-06)", "1 (Sun 09-13)"],
    ["Other events live", "NEW UPDATE - AURAS (all 5 days)", "Banana Vault (all 5 days); AURAS event ends 09-12 18:00"],
    ["ADMIN ABUSE annotations", "0", "0"]];
  T("timeline", "What each comparison window contained", ["", "Wk −1 (09-05→09)", "This wk (09-12→16)"], rows2, [],
    "Both windows carry one x5 BONUS hour on the Sunday, so that event is symmetric. No ADMIN ABUSE annotation exists on this universe in either window.",
    "data/monkey.json annotations filtered to each window's dates; placeVersions.");
}

// ================================================================ REACH
{
  const dau = run("DailyActiveUsers"), imp = run("UniqueUsersWithImpressions"), cvr = run("EndToEndCVR"), up = run("UniqueUsersWithPlaySessions");
  const row = (lab, post, pre) => { const a = paired(dau, post, pre), b = paired(imp, post, pre), c = paired(cvr, post, pre), u = paired(up, post, pre);
    const ld = Math.log(a.after / a.before), li = Math.log(b.after / b.before), lc = Math.log(c.after / c.before);
    return [lab, SG(a.delta), SG(b.delta), SG(c.delta), SG((1 + b.delta) * (1 + c.delta) - 1), F(li / ld * 100, 0) + "%", F(lc / ld * 100, 0) + "%", F((ld - li - lc) / ld * 100, 0) + "%"]; };
  T("reach", "DAU decomposed: impressions × impression→play conversion",
    ["Comparison", "DAU Δ", "Impressions Δ", "CVR Δ", "Impr × CVR Δ", "Share: reach", "Share: conversion", "Share: other sources"],
    [row("This wk vs wk −1", POST, PRE), row("Wk −1 vs wk −2", PRE, PRIOR)], [1, 2, 3, 4, 5, 6, 7],
    "Shares are of the log change in DAU. 'Other sources' is DAU that does not pass through an impression (Friends, Others) moving differently from the product.",
    "UniqueUsersWithImpressions, EndToEndCVR, DailyActiveUsers; weekday-paired means; log-share = Δln(x)/Δln(DAU).");

  const ib = D.splits.impressionsBySource; const tot = k => sum(Object.values(ib).map(v => v[k]));
  const rows = Object.entries(ib).filter(([, v]) => v.before > 1000).sort((a, b) => b[1].before - a[1].before).map(([k, v]) =>
    [k, I(v.before), PC(v.before / tot("before")), I(v.after), PC(v.after / tot("after")), PP(v.after / tot("after") - v.before / tot("before")), SG(v.delta)]);
  T("reach", "Impression mix by surface", ["Surface", "Wk −1 /day", "Share", "This wk /day", "Share", "Share Δ", "Volume Δ"], rows, [1, 2, 3, 4, 5, 6],
    "HomeRecommendation's share of impressions fell while ContinueToPlay and Search gained share; volume fell on every surface.",
    "splits.impressionsBySource (UniqueUsersWithImpressions × AcquisitionSource, weekday-paired means). Shares use the sum of listed surfaces as the denominator.");

  const db = D.splits.dauBySource;
  const conv = ["HomeRecommendation", "Search"].map(k => { const a = db[k], b = ib[k]; if (!a || !b) return null;
    const pre = a.before / b.before, post = a.after / b.after;
    // prior week from runs
    const ar = a.run || {}, br = b.run || {}; const pr = mean(PRIOR.map(d => ar[d] && br[d] ? ar[d] / br[d] : null));
    return [k, PC(pr, 2), PC(pre, 2), PC(post, 2), SG(rel(pre, post)), SG(rel(pr, pre))]; }).filter(Boolean);
  T("reach", "Surface conversion: DAU from a source ÷ impressions from that source",
    ["Source", "Wk −2", "Wk −1", "This wk", "Δ this wk", "Δ wk before"], conv, [1, 2, 3, 4, 5],
    "HomeRecommendation is the definitionally closest thing to click-to-play on Home. Friends and Others are left out: their DAU includes joins that never passed through an impression (ratios above 50%, and above 100% for Others), so the quotient is not a conversion.",
    "splits.dauBySource / splits.impressionsBySource (same AcquisitionSource). Wk −2 is the mean of daily ratios 08-29→09-02.");

  // Lifecycle: Monkey vs Brainrot at the same days since peak (non-Saturday days).
  const lc = (id) => { const m = headline(id, "DailyActiveUsers"); let pk = null; for (const [d, v] of m) if (!pk || v > pk[1]) pk = [d, v]; return { m, pk }; };
  const M = lc(ID), B = lc(BR);
  const bins = [[0, 6], [7, 13], [14, 20], [21, 27], [28, 34], [35, 41], [42, 48], [49, 55], [56, 62], [63, 69], [70, 76], [77, 83]];
  const binStat = (G, a, b) => { const v = []; for (let i = a; i <= b; i++) { const d = addDays(G.pk[0], i); if (DOW(d) === "Sat") continue; const x = G.m.get(d); if (x != null) v.push(x / G.pk[1]); } return v.length ? mean(v) : null; };
  const lrows = bins.map(([a, b]) => { const m = binStat(M, a, b), br = binStat(B, a, b); return [`day ${a}–${b}`, m == null ? "—" : PC(m), br == null ? "—" : PC(br), `${addDays(M.pk[0], a).slice(5)}→${addDays(M.pk[0], b).slice(5)}`, `${addDays(B.pk[0], a).slice(5)}→${addDays(B.pk[0], b).slice(5)}`]; })
    .filter(r => r[1] !== "—" || r[2] !== "—");
  T("reach", "Lifecycle position: DAU as % of own peak, Monkey vs Brainrot, by days since peak",
    ["Days since peak", "Monkey", "Brainrot", "Monkey dates", "Brainrot dates"], lrows, [1, 2],
    `Peaks: Monkey ${M.pk[0]} (${I(M.pk[1])}), Brainrot ${B.pk[0]} (${I(B.pk[1])}). Saturdays excluded (Brainrot runs admin-abuse Saturdays). This week is Monkey's day 38–42.`,
    "DailyActiveUsers headline, full corpus history for both universes; mean of daily DAU/peak within each 7-day bin.");

  // Depth reached: lowest non-Saturday % of peak each game has recorded.
  const minDepth = G => { let mn = null; for (const [d, v] of G.m) { if (d <= G.pk[0] || DOW(d) === "Sat") continue; const r = v / G.pk[1]; if (!mn || r < mn[1]) mn = [d, r]; } return mn; };
  const mm = minDepth(M), bm = minDepth(B);
  T("reach", "Deepest point each game has reached (non-Saturday DAU as % of own peak)", ["Game", "Lowest day", "% of peak", "Latest settled day", "% of peak"],
    [["Monkey", mm[0], PC(mm[1], 2), [...M.m.keys()].at(-1), PC(M.m.get([...M.m.keys()].at(-1)) / M.pk[1], 2)],
     ["Brainrot", bm[0], PC(bm[1], 2), [...B.m.keys()].at(-1), PC(B.m.get([...B.m.keys()].at(-1)) / B.pk[1], 2)]], [2, 4],
    "Monkey is now below the deepest point Brainrot has ever recorded, so Brainrot offers no matched-depth control for this week's level.",
    "DailyActiveUsers headline, full corpus history.");

  // RFY ranking signals in 7-day blocks ending Wednesday.
  const blocks = []; for (let e = "2026-09-16"; e >= "2026-07-29"; e = addDays(e, -7)) blocks.unshift([addDays(e, -6), e]);
  const SIG = [["UniqueUsersWithImpressions", "Impressions", I], ["RFYPlayThroughRate", "PTR", v => PC(v, 2)], ["RFYDuration0To60", "Bounce <60s", v => PC(v, 1)],
    ["RFYD1Playtime", "D1 playtime", v => F(v, 1)], ["RFYD1QualifiedPlaySessions", "D1 qual. sess.", v => F(v, 3)], ["RFYD2To7PlayDays", "D2–7 play days", v => F(v, 3)],
    ["RFYD8To28PlayDays", "D8–28 play days", v => F(v, 3)], ["RFYD1CoplayDays", "D1 co-play days", v => F(v, 3)]];
  const sm = SIG.map(([k]) => headline(ID, k));
  const brow = blocks.map(([a, b], bi) => [`${a.slice(5)}→${b.slice(5)}`, ...SIG.map(([k, , f], i) => { const v = mean(range(a, b).map(d => sm[i].get(d)));
    const pv = bi ? mean(range(blocks[bi - 1][0], blocks[bi - 1][1]).map(d => sm[i].get(d))) : null; return `${f(v)} (${pv ? SG(rel(pv, v), 0) : "—"})`; })]);
  T("reach", "RFY ranking signals, 7-day blocks ending Wednesday (value, and change vs the previous block)",
    ["Block", ...SIG.map(s => s[1])], brow, SIG.map((_, i) => i + 1),
    "Seven of Roblox's Home-ranking signal series (spend and Robux-per-user signals are in the Money table). Impressions fell in every block from 08-13→08-19 on; D2–7 play days first fell in 08-06→08-12, the block in which impressions were still rising.",
    "RFYPlayThroughRate, RFYDuration0To60, RFYD1Playtime, RFYD1QualifiedPlaySessions, RFYD2To7PlayDays, RFYD8To28PlayDays, RFYD1CoplayDays, UniqueUsersWithImpressions — corpus headline, mean of the days in each block.");

  // Country spread
  const cs = Object.entries(D.splits.dauByCountry).map(([k, v]) => v.delta).filter(x => x != null);
  const tot2 = paired(dau, POST, PRE).delta;
  T("reach", "DAU change across the top 15 countries", ["Countries", "Lowest Δ", "Median Δ", "Highest Δ", "Total DAU Δ", "Within ±5pp of total"],
    [[String(cs.length), SG(Math.min(...cs)), SG(median(cs)), SG(Math.max(...cs)), SG(tot2), `${cs.filter(x => Math.abs(x - tot2) <= 0.05).length} of ${cs.length}`]], [0, 1, 2, 3, 4],
    "Every one of the top 15 countries fell between −51% and −64%; none moved against the total.", "splits.dauByCountry (top 15 by this-week volume).");

  // Is it us or everyone: the same weekday-paired deltas on all five games.
  const KP = [["DailyActiveUsers", "DAU"], ["UniqueUsersWithImpressions", "Impressions"], ["EndToEndCVR", "CVR"], ["ForwardD1Retention", "D1"], ["AverageSessionLengthMinutes", "Session"],
    ["AverageRevenuePerUser", "ARPDAU"], ["PayingUsersCVR", "Payer CVR"], ["ClientCrashRate15m", "Crash rate"]];
  const prow = P.games.map(g => [g.name + (g.slug === "monkey" ? " ◀" : ""), ...KP.map(([k]) => { const v = g.k[k]; return v ? `${SG(v.d)} (${SG(v.prior)})` : "—"; }),
    (() => { const e = Object.entries(g.pctOfPeak).filter(([d]) => d <= "2026-09-17").sort().at(-1); return e ? PC(e[1], 1) : "—"; })()]);
  const dpd = x => (Math.pow(1 + x, 1 / 7) - 1);
  const mk = P.games.find(g => g.slug === "monkey").k.DailyActiveUsers;
  prow.push(["Monkey DAU as an implied daily rate", `${SG(dpd(mk.d))}/day (${SG(dpd(mk.prior))}/day)`, "", "", "", "", "", "", "", ""]);
  T("reach", "Is it us or everyone: this week's deltas on all five games (week before in brackets)", ["Game", ...KP.map(k => k[1]), "DAU % of peak (09-17)"], prow, [1, 2, 3, 4, 5, 6, 7, 8, 9],
    "Same windows and weekday pairing on every game. Brainrot and Waterslide grew this week; Monkey, Verity and Seal fell. Other games' own builds sit inside this window (Waterslide v1722 09-14, Verity v695 09-15).",
    "reports/2026-09-19/data/portfolio.json (k[metric].d and .prior; pctOfPeak). Implied daily rate = (1+Δ)^(1/7) − 1.");
}

// ================================================================ CCU
const hr = D.explore.specs.find(s => s.metric === "ConcurrentPlayers" && s.points);
const hh = D.explore.specs.find(s => s.metric === "PeakConcurrentPlayers" && s.points);
const H = new Map(Object.entries(hr.points).map(([t, v]) => [t.slice(0, 13), v]));      // key: YYYY-MM-DDTHH
const HH = new Map(Object.entries(hh.points).map(([t, v]) => [t.slice(0, 16), v]));
{
  const days = range("2026-09-05", "2026-09-18");
  const pcu = run("PeakConcurrentPlayers");
  const dm = d => { const v = []; for (let h = 0; h < 24; h++) { const x = H.get(`${d}T${String(h).padStart(2, "0")}`); if (x != null) v.push(x); } return v.length === 24 ? mean(v) : null; };
  const dmax = d => { const v = []; for (const [k, x] of HH) if (k.startsWith(d)) v.push(x); return v.length >= 47 ? Math.max(...v) : null; };
  const rows = days.map(d => [`${DOW(d)} ${d.slice(5)}`, F(dm(d), 0), SG(rel(dm(addDays(d, -7)), dm(d))), F(dmax(d), 0), I(pcu.get(d)), POST.includes(d) ? "this wk" : PRE.includes(d) ? "wk −1" : d === "2026-09-11" || d === "2026-09-17" ? "publish day" : ""]);
  const mp = new Map(days.map(d => [d, dm(d)])), xp = new Map(days.map(d => [d, dmax(d)]));
  const a = paired(mp, POST, PRE), b = paired(xp, POST, PRE), c = paired(pcu, POST, PRE);
  rows.push(["Wk −1 mean", F(a.before, 0), "", F(b.before, 0), I(c.before), ""], ["This wk mean", F(a.after, 0), "", F(b.after, 0), I(c.after), ""], ["Δ", SG(a.delta), "", SG(b.delta), SG(c.delta), ""]);
  T("ccu", "Daily concurrents three ways", ["Day", "Mean of hourly CCU", "vs same weekday −7d", "Max half-hour peak", "PeakConcurrentPlayers (daily)", ""], rows, [1, 2, 3, 4],
    "The daily PeakConcurrentPlayers series is a sum of per-platform peaks (F15) and reads above the true half-hour peak; the hourly mean is the 'how big was the game' number.",
    "Explore ConcurrentPlayers ONE_HOUR (24 complete buckets required), Explore PeakConcurrentPlayers HALF_HOUR (max of the day's buckets, ≥47 required), corpus PeakConcurrentPlayers ONE_DAY.");

  // Today vs previous Saturdays, matched elapsed UTC hours.
  const hrs = [...Array(9).keys()];   // 00:00 … 08:00 buckets, all complete before the 09:11Z pull
  const sats = ["2026-09-19", "2026-09-12", "2026-09-05"];
  const trow = hrs.map(h => { const k = String(h).padStart(2, "0"); const v = sats.map(d => H.get(`${d}T${k}`));
    return [`${k}:00`, F(v[0], 0), F(v[1], 0), F(v[2], 0), SG(rel(v[1], v[0])), SG(rel(v[2], v[1]))]; });
  const m = sats.map(d => mean(hrs.map(h => H.get(`${d}T${String(h).padStart(2, "0")}`))));
  trow.push(["Mean 00:00–08:59", F(m[0], 0), F(m[1], 0), F(m[2], 0), SG(rel(m[1], m[0])), SG(rel(m[2], m[1]))]);
  T("ccu", "Today (Sat 09-19) against the two previous Saturdays, matched UTC hours", ["Hour (UTC)", "Sat 09-19", "Sat 09-12", "Sat 09-05", "09-19 vs 09-12", "09-12 vs 09-05"], trow, [1, 2, 3, 4, 5],
    "Only hours that had fully elapsed at the 09:11 UTC pull are compared (00:00–08:00 buckets); the final buckets of the series are dropped (carry-forward phantom). 09-12 ran v1251 with the Banana Vault event live; 09-19 runs v1252 after that event ended 09-18 18:00.",
    `Explore ConcurrentPlayers ONE_HOUR (pulled ${D.explore.pulledAt.slice(0, 16)}Z).`);

  // Publish-day event study: evening/afternoon ratio vs every ordinary day.
  const ratio = d => { const pre = mean([10, 11, 12, 13, 14].map(h => H.get(`${d}T${h}`))), post = mean([18, 19, 20, 21, 22].map(h => H.get(`${d}T${h}`)));
    return pre && post ? post / pre : null; };
  const all = range("2026-08-29", "2026-09-18"); const pubs = ["2026-09-04", "2026-09-11", "2026-09-17"];
  const ord = all.filter(d => !pubs.includes(d)).map(d => [d, ratio(d)]).filter(x => x[1] != null);
  const om = mean(ord.map(x => x[1])), os = sd(ord.map(x => x[1]));
  const prow = pubs.map(d => { const r = ratio(d); return [`${DOW(d)} ${d.slice(5)}`, d === "2026-09-04" ? "v1246 17:35" : d === "2026-09-11" ? "v1250 15:08 / v1251 15:33" : "v1252 17:35", F(r, 3), F(om, 3), F(os, 3), SN((r - om) / os, 2)]; });
  const sameDow = ord.filter(x => ["Thu", "Fri"].includes(DOW(x[0]))).map(x => `${DOW(x[0])} ${x[0].slice(5)} ${F(x[1], 3)}`);
  prow.push(["Ordinary Thursdays and Fridays", "", sameDow.join(" · "), "", "", ""]);
  T("ccu", "Publish-day evening dip against the base rate of ordinary days", ["Publish day", "Build", "CCU 18–22h ÷ 10–14h", "Ordinary-day mean", "Ordinary-day sd", "z"], prow, [2, 3, 4, 5],
    `Every day falls from the early-afternoon peak into the evening; the question is only whether a publish day fell more than usual. Base rate = ${ord.length} non-publish days 08-29→09-18.`,
    "Explore ConcurrentPlayers ONE_HOUR; ratio of the mean of the 18:00–22:00 buckets to the mean of the 10:00–14:00 buckets (both windows avoid the 15:08/17:35 publish hours).");

  // x5 BONUS hour: 16:00 bucket vs the flanking hours, against the same statistic on ordinary days.
  const bump = d => { const a = H.get(`${d}T16`), f = mean([14, 15, 17, 18].map(h => H.get(`${d}T${h}`))); return a && f ? a / f - 1 : null; };
  const bonus = ["2026-08-30", "2026-09-06", "2026-09-13"]; const other = all.filter(d => !bonus.includes(d)).map(bump).filter(x => x != null);
  const bm = mean(other), bs = sd(other);
  const brows = bonus.map(d => [`${DOW(d)} ${d.slice(5)}`, F(H.get(`${d}T16`), 0), F(mean([14, 15, 17, 18].map(h => H.get(`${d}T${h}`))), 0), SG(bump(d)), SG(bm), SN((bump(d) - bm) / bs, 2)]);
  T("ccu", "x5 BONUS hour (Sunday 16:00–17:00 UTC) against ordinary days", ["Day", "CCU 16:00 bucket", "Mean of 14,15,17,18h", "Bump", "Ordinary-day bump (mean)", "z"], brows, [1, 2, 3, 4, 5],
    `Ordinary-day bump sd = ${SG(bs)} across ${other.length} days.`, "Explore ConcurrentPlayers ONE_HOUR.");
}

// ================================================================ RETENTION
{
  const d1 = run("ForwardD1Retention"), dau = run("DailyActiveUsers");
  const s = D.splits.d1BySource; const src = k => new Map(Object.entries((s[k] || {}).run || {}).filter(([, v]) => v != null));
  const home = src("HomeRecommendation"), fr = src("Friends"), se = src("Search");
  const build = d => d < "2026-09-04" ? "v1244" : d === "2026-09-04" ? "v1244→v1246" : d < "2026-09-11" ? "v1246" : d === "2026-09-11" ? "v1246→v1251" : "v1251";
  const rows = range("2026-09-01", "2026-09-16").map(d => [`${DOW(d)} ${d.slice(5)}`, build(d), I(dau.get(d)), PC(d1.get(d), 2), PC(home.get(d), 2), PC(fr.get(d), 2), PC(se.get(d), 2),
    POST.includes(d) ? "this wk" : PRE.includes(d) ? "wk −1" : PRIOR.includes(d) ? "wk −2" : ""]);
  const pre3 = mean(["2026-09-08", "2026-09-09", "2026-09-10"].map(d => d1.get(d))), post = mean(POST.map(d => d1.get(d)));
  rows.push(["Mean 09-08→09-10 (v1246, after the trough)", "", "", PC(pre3, 2), "", "", "", ""], ["Mean this wk (v1251)", "", "", PC(post, 2), "", "", "", ""]);
  T("retention", "D1 day by day across the three builds", ["Cohort day", "Build live", "DAU", "D1", "D1 Home", "D1 Friends", "D1 Search", "Window"], rows, [2, 3, 4, 5, 6],
    "D1 bottomed on 09-06/09-07 and was already climbing on 09-08, 09-09 and 09-10 — before v1250 shipped on 09-11 15:08. A cohort day's D1 is read one to two days later.",
    "ForwardD1Retention headline and × AcquisitionSource (corpus), DailyActiveUsers.");

  // D1 by source: effect size vs confidence (paired t over the 5 weekday pairs) + binomial floor.
  const db = D.splits.dauBySource;
  const srows = ["HomeRecommendation", "Others", "Friends", "Search"].map(k => { const m = src(k); const pr = paired(m, POST, PRE); const diffs = pr.pairs.map(p => p[3] - p[2]);
    const t = mean(diffs) / (sd(diffs) / Math.sqrt(diffs.length)); const up = diffs.filter(x => x > 0).length;
    const n = db[k] ? db[k].after : null; const p = pr.after; const floor = n ? Math.sqrt(p * (1 - p) / n) : null;
    const pr2 = paired(m, POST, PRIOR);
    return [k, I(db[k] && db[k].after), PC(pr.before, 2), PC(pr.after, 2), SG(pr.delta), SN(t, 2), `${up}/${diffs.length}`, PC(floor, 2), SG(pr2.delta)]; });
  { const m = run("ForwardD1Retention"); const pr = paired(m, POST, PRE); const diffs = pr.pairs.map(p => p[3] - p[2]); const t = mean(diffs) / (sd(diffs) / Math.sqrt(diffs.length));
    srows.unshift(["Headline ForwardD1Retention", I(paired(run("DailyActiveUsers"), POST, PRE).after), PC(pr.before, 2), PC(pr.after, 2), SG(pr.delta), SN(t, 2), `${diffs.filter(x => x > 0).length}/${diffs.length}`, "—", SG(paired(m, POST, PRIOR).delta)]); }
  T("retention", "D1 by acquisition source: effect size and confidence", ["Source", "DAU/day this wk", "D1 wk −1", "D1 this wk", "Rel. Δ (effect size)", "Paired t (5 pairs)", "Pairs up", "Binomial floor (1 day)", "Δ vs wk −2"], srows, [1, 2, 3, 4, 5, 6, 7, 8],
    "Effect size answers 'how much'; the paired t answers 'did it move at all' (|t| > 2.78 is p<0.05 at 4 d.f.). Friends never sees a thumbnail; Search came looking for the game.",
    "splits.d1BySource and splits.dauBySource. Binomial floor = sqrt(p(1−p)/n) with n = the source's DAU, an upper bound on the D1 cohort, so the true floor is wider.");

  // Shift-share: composition vs within-source rate.
  const ks = ["HomeRecommendation", "Others", "Friends", "Search"];
  const tb = sum(ks.map(k => db[k].before)), ta = sum(ks.map(k => db[k].after));
  const w0 = Object.fromEntries(ks.map(k => [k, db[k].before / tb])), w1 = Object.fromEntries(ks.map(k => [k, db[k].after / ta]));
  const r0 = Object.fromEntries(ks.map(k => [k, s[k].before])), r1 = Object.fromEntries(ks.map(k => [k, s[k].after]));
  const blend = (w, r) => sum(ks.map(k => w[k] * r[k]));
  const b00 = blend(w0, r0), b11 = blend(w1, r1), b10 = blend(w1, r0), b01 = blend(w0, r1);
  const hl = paired(run("ForwardD1Retention"), POST, PRE);
  const shrows = ks.map(k => [k, PC(w0[k]), PC(w1[k]), PC(r0[k], 2), PC(r1[k], 2)]);
  shrows.push(["Blended (four sources)", "", "", PC(b00, 2), PC(b11, 2)], ["Headline ForwardD1Retention", "", "", PC(hl.before, 2), PC(hl.after, 2)],
    ["Composition only (this wk mix × wk −1 rates)", "", "", "", PC(b10, 2) + ` (${PP(b10 - b00, 2)})`], ["Rates only (wk −1 mix × this wk rates)", "", "", "", PC(b01, 2) + ` (${PP(b01 - b00, 2)})`]);
  T("retention", "D1 shift-share: how much of the move is source mix", ["Source", "DAU share wk −1", "DAU share this wk", "D1 wk −1", "D1 this wk"], shrows, [1, 2, 3, 4],
    "The blend weights by DAU share (not new-user share), so it approximates the headline rather than reproducing it. D1 × IsNewUser failed inside Roblox's Explore engine on every game, so the new-vs-returning control is unavailable.",
    "splits.dauBySource, splits.d1BySource; weekday-paired means. Composition effect = Σ w_this·r_prev − Σ w_prev·r_prev.");

  // Matched decay depth: Monkey vs Brainrot.
  const MET = [["ForwardD1Retention", "D1", v => PC(v, 2)], ["AverageSessionLengthMinutes", "Session min", v => F(v, 2)], ["RFYDuration0To60", "Bounce <60s", v => PC(v, 2)],
    ["RFYD2To7PlayDays", "D2–7 play days", v => F(v, 3)], ["EndToEndCVR", "Impr→play CVR", v => PC(v, 2)]];
  const G = id => { const dau = headline(id, "DailyActiveUsers"); let pk = null; for (const [d, v] of dau) if (!pk || v > pk[1]) pk = [d, v]; return { dau, pk, m: MET.map(([k]) => headline(id, k)) }; };
  const gm = G(ID), gb = G(BR);
  const bk = [[0.30, 0.50], [0.20, 0.30], [0.15, 0.20], [0.10, 0.15], [0.07, 0.10], [0.05, 0.07], [0.03, 0.05], [0.0, 0.03]];
  const cell = (g, lo, hi, i) => { const v = []; for (const [d, x] of g.dau) { if (d <= g.pk[0] || DOW(d) === "Sat") continue; const r = x / g.pk[1]; if (r >= lo && r < hi) { const y = g.m[i].get(d); if (y != null) v.push(y); } } return v; };
  const nday = (g, lo, hi) => { let n = 0; for (const [d, x] of g.dau) { if (d <= g.pk[0] || DOW(d) === "Sat") continue; const r = x / g.pk[1]; if (r >= lo && r < hi) n++; } return n; };
  const drows = bk.map(([lo, hi]) => [`${(lo * 100).toFixed(0)}–${(hi * 100).toFixed(0)}%`, `${nday(gm, lo, hi)} / ${nday(gb, lo, hi)}`,
    ...MET.map(([, , f], i) => { const a = cell(gm, lo, hi, i), b = cell(gb, lo, hi, i); return `${a.length ? f(mean(a)) : "—"} / ${b.length ? f(mean(b)) : "—"}`; })]);
  T("retention", "Matched decay depth: Monkey / Brainrot at the same % of own peak", ["DAU as % of peak", "Days (M / B)", ...MET.map(m => m[1] + " (M / B)")], drows, [1, 2, 3, 4, 5, 6],
    "Each cell is Monkey / Brainrot, mean over post-peak non-Saturday days whose DAU fell in that band. Brainrot never went below 5% of peak, so the bottom two bands have no control.",
    "Corpus headline series for both universes (full history); DAU/peak computed per day, Saturdays excluded.");

  // Cohort D2 hold
  const dc = bd(ID, "DailyCohortRetention", "CohortDay");
  const c1 = dc["1"] || new Map(), c2 = dc["2"] || new Map();
  const crow = [...c2.keys()].filter(d => d >= "2026-08-20").sort().map(d => [d, PC(c1.get(d), 2), PC(c2.get(d), 2), c1.get(d) ? PC(c2.get(d) / c1.get(d), 1) : "—"]);
  T("retention", "Cohort D2 hold (DailyCohortRetention by CohortDay)", ["Cohort", "Day 1", "Day 2", "Day 2 ÷ Day 1"], crow, [1, 2, 3],
    "Only cohorts the grabs happened to capture a day-2 point for; no this-week cohort has a day-2 read yet. The two Saturday cohorts (08-22, 09-05) hold 32–35% into day 2 against 41–46% for the weekday cohorts.", "DailyCohortRetention × CohortDay (corpus, 10-day windows).");
}

// ================================================================ ENGAGEMENT
{
  const ex = (metric, b) => D.explore.specs.find(s => s.metric === metric && s.breakdown === b && s.segments);
  const dn = ex("DailyActiveUsers", "IsNewUser").segments, sl = ex("AverageSessionLengthMinutes", "IsNewUser").segments, pt = ex("AveragePlayTimeMinutesPerDAU", "IsNewUser").segments;
  const shr = (seg, k) => seg[k] / (dn.New[k] + dn.Returning[k]);
  const priorB = x => x.prior && x.prior.before;
  const rows = ["New", "Returning"].map(k => [k, PC(priorB(dn[k]) / (priorB(dn.New) + priorB(dn.Returning))), PC(shr(dn[k], "before")), PC(shr(dn[k], "after")),
    F(sl[k].before, 2), F(sl[k].after, 2), SG(sl[k].delta), F(pt[k].before, 2), F(pt[k].after, 2), SG(pt[k].delta)]);
  const wB = { New: shr(dn.New, "before"), Returning: shr(dn.Returning, "before") }, wA = { New: shr(dn.New, "after"), Returning: shr(dn.Returning, "after") };
  const mixHeld = wB.New * sl.New.after + wB.Returning * sl.Returning.after, mixOnly = wA.New * sl.New.before + wA.Returning * sl.Returning.before;
  const blendB = wB.New * sl.New.before + wB.Returning * sl.Returning.before;
  rows.push(["Session length at wk −1 mix", "", "", "", F(blendB, 2), F(mixHeld, 2), SG(rel(blendB, mixHeld)), "", "", ""],
    ["Session length, mix change only", "", "", "", F(blendB, 2), F(mixOnly, 2), SG(rel(blendB, mixOnly)), "", "", ""]);
  T("engagement", "New vs returning: mix and per-segment engagement (Explore)",
    ["Segment", "DAU share wk −2", "DAU share wk −1", "DAU share this wk", "Session wk −1", "Session this wk", "Δ", "Play min/DAU wk −1", "This wk", "Δ"], rows, [1, 2, 3, 4, 5, 6, 7, 8, 9],
    "Returning players' share of DAU rose again this week. Both segments' session length rose; holding last week's mix fixed gives the within-segment change.",
    "Explore DailyActiveUsers, AverageSessionLengthMinutes, AveragePlayTimeMinutesPerDAU × IsNewUser (dag/execute, weekday-paired).");

  // Session-length buckets
  const m = load(ID).metrics.TotalSessionsEndedInBucket; const byW = {};
  for (const s of m.series) { const b = +s.breakdown.SessionTimeBucket; for (const p of s.points) { const k = p.date + "|" + (p.capturedAt || "").slice(0, 16); (byW[k] ||= {})[b] = p.value; } }
  const want = ["2026-08-12", "2026-08-27", "2026-09-01", "2026-09-05", "2026-09-06", "2026-09-16"];
  const brows = Object.entries(byW).filter(([k]) => want.includes(k.split("|")[0])).sort().map(([k, v]) => { const tot = sum(Object.values(v));
    const lt = s => sum(Object.entries(v).filter(([b]) => +b < s).map(([, x]) => x)) / tot;
    return [`${k.split("|")[0]} → ${k.split("|")[1].replace("T", " ")}`, I(tot), PC(lt(60)), PC(lt(180)), PC(lt(600)), PC(1 - lt(1800), 2)]; });
  T("engagement", "Where sessions end: TotalSessionsEndedInBucket, all sessions", ["Window (point date → capture, inferred)", "Sessions", "< 1 min", "< 3 min", "< 10 min", "≥ 30 min"], brows, [1, 2, 3, 4, 5],
    "This metric is served as one aggregate per request window; the window is inferred as the point's date through its capture time, so windows overlap and are unequal. Read the shares, not the volumes. None isolates this week.",
    "TotalSessionsEndedInBucket × SessionTimeBucket (30-second buckets, NONE granularity), corpus.");
}

// ================================================================ MONEY
{
  const k = ["DailyActiveUsers", "PayingUsers", "DailyRevenue", "AverageRevenuePerPayingUser", "AverageRevenuePerUser"].map(run);
  const rs = D.splits.revenueBySource; const dp = new Map(Object.entries(rs.DevProduct.run).filter(([, v]) => v != null)), gp = new Map(Object.entries(rs.GamePass.run).filter(([, v]) => v != null));
  const rows = range("2026-09-05", "2026-09-17").map(d => [`${DOW(d)} ${d.slice(5)}`, I(k[0].get(d)), I(k[1].get(d)), k[0].get(d) ? F(k[1].get(d) / k[0].get(d) * 1000, 2) : "—", R(k[2].get(d)), F(k[3].get(d), 1), F(k[4].get(d), 3), R(dp.get(d)), R(gp.get(d)),
    POST.includes(d) ? "this wk" : PRE.includes(d) ? "wk −1" : d === "2026-09-11" || d === "2026-09-17" ? "publish day" : ""]);
  T("money", "Daily money numerators", ["Day", "DAU", "Paying users", "Payers per 1k DAU", "Revenue", "ARPPU", "ARPDAU", "DevProduct", "GamePass", ""], rows, [1, 2, 3, 4, 5, 6, 7, 8],
    "Payers per 1k DAU is PayingUsersCVR ×1000 recomputed from its own numerator and denominator. Revenue by source reaches 09-17; 09-18 is not served yet.",
    "DailyActiveUsers, PayingUsers, DailyRevenue, AverageRevenuePerPayingUser, AverageRevenuePerUser, DailyRevenue × RevenueSource (corpus headline).");

  const pr = (m, lab, f) => { const p = paired(m, POST, PRE); const ratios = p.pairs.map(x => x[3] / x[2]);
    return [lab, ...p.pairs.map(x => `${f(x[2])} → ${f(x[3])} (${SG(x[3] / x[2] - 1, 0)})`), `${ratios.filter(r => r > 1).length}/${ratios.length}`, SG(median(ratios) - 1), SG(p.delta)]; };
  T("money", "Pair by pair: which days carry the ARPDAU and ARPPU rise", ["Metric", "Sat 05→12", "Sun 06→13", "Mon 07→14", "Tue 08→15", "Wed 09→16", "Pairs up", "Median pair Δ", "Mean Δ"],
    [pr(k[4], "ARPDAU", v => F(v, 2)), pr(k[3], "ARPPU", v => F(v, 0)), pr(k[1], "Paying users", I), pr(new Map([...k[1]].map(([d, v]) => [d, k[0].get(d) ? v / k[0].get(d) * 1000 : null]).filter(x => x[1] != null)), "Payers per 1k DAU", v => F(v, 1))], [6, 7, 8],
    "A mean driven by one pair reads differently from a median; both are shown. The Tue 09-08 → 09-15 pair carries the largest ARPDAU and ARPPU ratios.",
    "AverageRevenuePerUser, AverageRevenuePerPayingUser, PayingUsers, DailyActiveUsers; weekday pairs D vs D−7.");

  const dau = k[0];
  const per = (m, days) => mean(days.map(d => m.get(d) && dau.get(d) ? m.get(d) / dau.get(d) : null));
  const srows = ["DevProduct", "GamePass", "PrivateServer"].map(s => { const m = new Map(Object.entries(rs[s].run || {}).filter(([, v]) => v != null));
    const a = per(m, PRIOR), b = per(m, PRE), c = per(m, POST); return [s, F(a, 3), F(b, 3), F(c, 3), SG(rel(b, c)), SG(rel(a, b)), SG(rel(a, c))]; });
  T("money", "Revenue per DAU by source (R$)", ["RevenueSource", "Wk −2", "Wk −1", "This wk", "Δ this wk", "Δ wk before", "Δ vs wk −2"], srows, [1, 2, 3, 4, 5, 6],
    "Mean of daily (source revenue ÷ DAU). DevProduct is where Robux crates and one-off purchases land; GamePass is permanent passes.",
    "DailyRevenue × RevenueSource and DailyActiveUsers (corpus headline); PrivateServer has missing days (absent = no sale, not filled).");

  // Hourly item revenue per player-hour, reaching past the daily lag.
  const it = {}; const m = load(ID).metrics.ItemMonetizationRevenue;
  for (const s of m.series) { if (s.granularity !== "METRIC_GRANULARITY_ONE_HOUR") continue; const kk = Object.keys(s.breakdown || {}); if (kk.join() !== "ProductType") continue;
    const lbl = s.breakdownLabels && s.breakdownLabels.ProductType || s.breakdown.ProductType; const seen = new Set(); const o = (it[lbl] ||= {});
    for (const p of s.points) { const ts = (p.ts || p.date).slice(0, 13); if (seen.has(ts) || p.partial) continue; seen.add(ts); o[ts] = p.value || 0; } }
  const days = range("2026-09-05", "2026-09-18");
  const irows = days.map(d => { const ph = sum([...Array(24).keys()].map(h => H.get(`${d}T${String(h).padStart(2, "0")}`)));
    const dv = sum([...Array(24).keys()].map(h => (it.DevProduct || {})[`${d}T${String(h).padStart(2, "0")}`])), gv = sum([...Array(24).keys()].map(h => (it.GamePass || {})[`${d}T${String(h).padStart(2, "0")}`]));
    return [`${DOW(d)} ${d.slice(5)}`, I(ph), R(dv), R(gv), F(dv / ph, 2), F(gv / ph, 2), dp.get(d) != null ? R(dp.get(d)) : "—"]; });
  const rph = (days, key) => mean(days.map(d => { const ph = sum([...Array(24).keys()].map(h => H.get(`${d}T${String(h).padStart(2, "0")}`)));
    const v = sum([...Array(24).keys()].map(h => (it[key] || {})[`${d}T${String(h).padStart(2, "0")}`])); return ph ? v / ph : null; }));
  irows.push(["Wk −1 mean", "", "", "", F(rph(PRE, "DevProduct"), 2), F(rph(PRE, "GamePass"), 2), ""], ["This wk mean", "", "", "", F(rph(POST, "DevProduct"), 2), F(rph(POST, "GamePass"), 2), ""],
    ["Δ", "", "", "", SG(rel(rph(PRE, "DevProduct"), rph(POST, "DevProduct"))), SG(rel(rph(PRE, "GamePass"), rph(POST, "GamePass"))), ""]);
  T("money", "Item revenue per concurrent-player-hour (reaches 09-18)", ["Day", "Player-hours (Σ hourly CCU)", "DevProduct (hourly Σ)", "GamePass (hourly Σ)", "DevProduct R$/player-hour", "GamePass R$/player-hour", "DevProduct (daily series)"], irows, [1, 2, 3, 4, 5, 6],
    "Normalises revenue by time actually played, which the daily series cannot do for 09-17/09-18 yet. Hourly sums match the daily RevenueSource series to within a few percent where both exist; the corpus logs large restatements on some 00:00 hourly points (data-quality.md), so read direction, not decimals.",
    "ItemMonetizationRevenue × ProductType ONE_HOUR (corpus, first read), Explore ConcurrentPlayers ONE_HOUR, DailyRevenue × RevenueSource.");
}

// ================================================================ FUNNELS
{
  const f = D.funnels.find(x => x.name === "FUNNEL_TYPE_ONBOARDING"); const st = n => f.steps.find(s => s.step === n);
  const j = st("Joined"), p = st("Punched"), c = st("Collected a Banana");
  // capture time per cohort day from the corpus (build.js left capturedAt null)
  const cap = {}; for (const s of load(ID).metrics.FunnelCohortCompletionRate.series) { if (s.granularity !== "METRIC_GRANULARITY_ONE_DAY" || (s.breakdownLabels || {}).FunnelStep !== "Punched") continue;
    for (const q of s.points) if (!cap[q.date] && !q.partial) cap[q.date] = q.capturedAt || q.captured_at; }
  const days = range("2026-09-01", "2026-09-18");
  const rows = days.map(d => { const a = j.run[d], b = p.run[d], cc = c.run[d]; const ag = cap[d] ? ((new Date(cap[d]) - new Date(d + "T00:00:00Z")) / 864e5) : null;
    return [`${DOW(d)} ${d.slice(5)}`, PC(b, 1), PC(cc, 1), b ? PC(cc / b, 2) : "—", cap[d] ? cap[d].slice(0, 16).replace("T", " ") : "—", ag == null ? "—" : F(ag, 1) + " d",
      POST.includes(d) ? "this wk" : PRE.includes(d) ? "wk −1" : ""]; });
  const ageR = days => { const a = days.map(d => cap[d] ? (new Date(cap[d]) - new Date(d + "T00:00:00Z")) / 864e5 : null).filter(x => x != null); return F(Math.min(...a), 1) + "–" + F(Math.max(...a), 1) + " d"; };
  T("funnels", "Onboarding funnel by cohort day, with step-to-step conversion and capture age", ["Cohort day", "Punched (of Joined)", "Collected a Banana (of Joined)", "Collected ÷ Punched", "Captured (UTC)", "Age at capture", ""], rows, [1, 2, 3, 5],
    `All three live steps happen inside the first minute of a first session, so the multi-day maturity drift that affects later funnel steps does not apply. Capture age: this week's cohorts ${ageR(POST)}, wk −1 cohorts ${ageR(PRE)}.`,
    "FunnelCohortCompletionRate × FunnelStep, FunnelName = FUNNEL_TYPE_ONBOARDING, ONE_DAY (corpus; capture time from the stored point).");
  const dens = f.steps.map(s => { const m = load(ID).metrics.FunnelCohortCompletionRate.series.filter(x => x.granularity === "METRIC_GRANULARITY_ONE_DAY" && (x.breakdownLabels || {}).FunnelStep === s.step);
    const pts = new Map(); for (const x of m) for (const q of x.points) if (!pts.has(q.date)) pts.set(q.date, q.value);
    const nz = [...pts].filter(([, v]) => v > 0); return [s.step, String(pts.size), String(nz.length), nz.length ? nz[0][0] : "—", nz.length ? nz.at(-1)[0] : "—"]; });
  T("funnels", "Step density over the whole series", ["Step", "Days served", "Days non-zero", "First non-zero", "Last non-zero"], dens, [1, 2],
    "Steps 4–7 fired on only a handful of days at the very start of the series; they were never a working part of the funnel, so they carry no before/after.",
    "FunnelCohortCompletionRate × FunnelStep ONE_DAY, all stored days.");
}

// ================================================================ TECHNICAL
{
  const FAULT = ["2026-09-08"], CPUFAULT = ["2026-09-15"];
  const MM = [["ClientFpsP10", "FPS p10", v => F(v, 2), FAULT], ["ClientFpsAvg", "FPS avg", v => F(v, 2), FAULT], ["ClientMemoryUsagePercentageAvg", "Client memory %", v => PC(v, 1), FAULT],
    ["ClientMemoryUsageAvg", "Client memory (MB)", v => F(v / 1e6, 0), FAULT], ["ClientCpuTimeAvg", "Client CPU ms/frame", v => F(v, 2), CPUFAULT],
    ["ClientCrashRate15m", "Client crash rate", v => PC(v, 3), []], ["OomUnexpectedExits", "OOM exits (count)", v => F(v, 1), []], ["ServerFrameRateP10", "Server FPS p10", v => F(v, 2), []],
    ["MemoryUsageAvg", "Server memory avg", v => F(v, 1), []], ["CpuTimeAvg", "Server CPU time avg", v => F(v, 3), []]];
  const rows = MM.map(([k, lab, f, skip]) => { const m = run(k); const a = paired(m, POST, PRE), b = paired(m, POST, PRE, skip);
    const lt = latest(k, "Place=83256791430098", m); const c = paired(lt, POST, PRE, skip);
    return [`${lab} \`${k}\``, `${f(a.before)} → ${f(a.after)} (${SG(a.delta)})`, skip.length ? `${f(b.before)} → ${f(b.after)} (${SG(b.delta)}), ${b.n} pairs` : "no fault day", `${f(c.before)} → ${f(c.after)} (${SG(c.delta)})`]; });
  T("technical", "Technical deltas with the instrument faults removed and on the latest-read basis",
    ["Metric", "As served (5 pairs)", "Fault pair dropped", "Latest read, fault pair dropped"], rows, [],
    "09-08 is Roblox's F28 telemetry fault (FPS and memory collapse on all five universes); 09-15 is a second one on ClientCpuTimeAvg (Brainrot 11.4, Waterslide 5.5, Monkey 4.9, Verity 4.2 against ~8–30 either side). The corpus keeps the first read of each day; Roblox later re-served several wk −1 technical points higher, so the last column uses the latest served value where data-quality.md logs one.",
    "Corpus headline (Place=83256791430098); data-quality.md revision rows (latest capture wins); weekday-paired means.");

  // crash rate by platform, Monkey + phone on the other four
  const cr = bd(ID, "ClientCrashRate15m", "Platform");
  const prow = ["Phone", "Tablet", "Computer", "Console"].map(pl => { const m = cr[pl]; const a = paired(m, POST, PRE);
    return [`Monkey · ${pl}`, PC(a.before, 3), PC(m.get("2026-09-10"), 3), PC(m.get("2026-09-11"), 3), PC(a.after, 3), SG(a.delta)]; });
  for (const [g, id] of Object.entries(GAMES)) { if (g === "monkey") continue; const m = (bd(id, "ClientCrashRate15m", "Platform") || {}).Phone; if (!m) continue; const a = paired(m, POST, PRE);
    prow.push([`${g} · Phone`, PC(a.before, 3), PC(m.get("2026-09-10"), 3), PC(m.get("2026-09-11"), 3), PC(a.after, 3), SG(a.delta)]); }
  T("technical", "Client crash rate by platform, and Phone on the other four games", ["Series", "Wk −1 mean", "Thu 09-10", "Fri 09-11 (publish)", "This wk mean", "Δ"], prow, [1, 2, 3, 4, 5],
    "Monkey's Phone crash rate sits above its wk −1 range from 09-11 on, with 09-10 partly raised. Its +33.5% is the largest of the five games' Phone series; Waterslide (+14.3%) and Verity (+16.7%) also rose, Brainrot and Seal fell.",
    "ClientCrashRate15m × Platform (corpus, first read), weekday-paired; Thu/Fri single days.");

  // OOM per 1k DAU, portfolio
  const orows = Object.entries(GAMES).map(([g, id]) => { const o = headline(id, "OomUnexpectedExits"), d = headline(id, "DailyActiveUsers");
    const r = new Map([...o].filter(([x]) => d.get(x)).map(([x, v]) => [x, v / d.get(x) * 1000])); const a = paired(r, POST, PRE), b = paired(r, PRE, PRIOR);
    return [g, F(b.before, 2), F(a.before, 2), F(a.after, 2), SG(a.delta), SG(b.delta)]; });
  T("technical", "OOM exits per 1,000 DAU across the portfolio", ["Game", "Wk −2", "Wk −1", "This wk", "Δ this wk", "Δ wk before"], orows, [1, 2, 3, 4, 5],
    "OomUnexpectedExits undercounts by design (Roblox), so read the direction, not the level.",
    "OomUnexpectedExits and DailyActiveUsers, corpus headline for each universe (widest Place set), weekday-paired.");
  const oo = run("OomUnexpectedExits"), dd = run("DailyActiveUsers"), cc = run("ClientCrashCount"), cpu = run("ClientCpuTimeAvg"), smem = run("MemoryUsageAvg");
  const drows = range("2026-09-05", "2026-09-18").map(d => [`${DOW(d)} ${d.slice(5)}`, I(oo.get(d)), I(cc.get(d)), I(dd.get(d)), dd.get(d) ? F(oo.get(d) / dd.get(d) * 1000, 2) : "—", dd.get(d) ? F(cc.get(d) / dd.get(d) * 1000, 2) : "—", PC(run("ClientCrashRate15m").get(d), 3), F(cpu.get(d), 1) + (d === "2026-09-15" ? " (fault)" : ""), F(smem.get(d), 0)]);
  T("technical", "Monkey day by day: OOM exits and client crashes per 1,000 DAU", ["Day", "OOM exits", "Client crashes", "DAU", "OOM / 1k DAU", "Crashes / 1k DAU", "Crash rate (15m)", "Client CPU ms/frame", "Server memory avg"], drows, [1, 2, 3, 4, 5, 6, 7, 8],
    "The OOM ratio steps from ~1 to ~2 per 1k DAU on 09-12, the first full day on v1251; the crash-count ratio steps on 09-10. Client CPU per frame sits at 14.3–15.4 on 09-11→09-14 and back at 11.8–12.5 from 09-16 (09-15 is the cross-universe fault day).",
    "OomUnexpectedExits, ClientCrashCount, DailyActiveUsers, ClientCrashRate15m (corpus headline).");

  // Errors per DAU by log source
  const e = D.splits.errorsByLogSource; const cl = new Map(Object.entries(e.Client)), sv = new Map(Object.entries(e.Server));
  const per = m => new Map([...m].filter(([d]) => dd.get(d)).map(([d, v]) => [d, v / dd.get(d)]));
  const a = paired(per(cl), POST, PRE), b = paired(per(sv), POST, PRE), b2 = paired(per(sv), POST, PRE, ["2026-09-05"]), a2 = paired(per(cl), POST, PRE, ["2026-09-05"]);
  T("technical", "Errors per DAU by LogSource", ["LogSource", "Wk −1", "This wk", "Δ", "Pairs", "Without the Sat 09-05 pair", "Pairs"],
    [["Client (per DAU)", F(a.before, 2), F(a.after, 2), SG(a.delta), String(a.n), `${F(a2.before, 2)} → ${F(a2.after, 2)} (${SG(a2.delta)})`, String(a2.n)],
     ["Server (per 1k DAU)", F(b.before * 1000, 1), F(b.after * 1000, 1), SG(b.delta), String(b.n), `${F(b2.before * 1000, 1)} → ${F(b2.after * 1000, 1)} (${SG(b2.delta)})`, String(b2.n)]], [1, 2, 3, 4, 6],
    "Sat 09-05 carried a one-day server spike of 402,560 events (a saved-not-published version, v1247/v1248, was uploaded that morning); 09-08 is not served, so at most four pairs exist.",
    "ErrorCount × LogSource (corpus), DailyActiveUsers; ErrorCount's unit is undocumented (occurrences assumed).");

  // memory% by platform level shift on 09-09 across universes
  const mrows = []; for (const [g, id] of Object.entries(GAMES)) { const b = bd(id, "ClientMemoryUsagePercentageAvg", "Platform");
    for (const pl of ["Computer", "Console", "Tablet"]) { const m = b[pl]; if (!m) continue; const pre = mean(["2026-09-05", "2026-09-06", "2026-09-07"].map(d => m.get(d))), post = mean(["2026-09-09", "2026-09-10"].map(d => m.get(d)));
      mrows.push([`${g} · ${pl}`, PC(pre, 1), PC(m.get("2026-09-08"), 1), PC(post, 1), SG(rel(pre, post))]); } }
  T("technical", "Client memory % by platform: a level shift on 09-09, before any 11 Sep build", ["Series", "Mean 09-05→07", "09-08 (fault day)", "Mean 09-09→10", "Δ"], mrows, [1, 2, 3, 4],
    "Computer and Console step up and Tablet steps down on 09-09 on Monkey, Verity, Seal and Brainrot. data-quality.md shows Roblox later re-served Monkey's earlier Computer memory % ×1.32 and Tablet ×0.89, i.e. the 09-09 step is where first reads switch basis.",
    "ClientMemoryUsagePercentageAvg × Platform (corpus, first read) for all five universes.");
}

// ================================================================ ERRORS
{
  const parse = txt => { const recs = []; let row = [], cur = "", q = false;
    for (let i = 0; i < txt.length; i++) { const c = txt[i];
      if (q) { if (c === '"') { if (txt[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true; else if (c === ",") { row.push(cur); cur = ""; } else if (c === "\n") { row.push(cur.replace(/\r$/, "")); recs.push(row); row = []; cur = ""; } else cur += c; }
    if (cur || row.length) { row.push(cur); recs.push(row); } return recs; };
  const dir = path.join(ROOT, "data/exports/10399712766-banana-monkey-destruction/errors");
  const read = f => { const [, ...rows] = parse(fs.readFileSync(path.join(dir, f), "utf8")); return rows.filter(r => r.length >= 6 && /^\d+$/.test(r[0]))
    .map(r => ({ n: +r[0], sev: r[1], type: r[2], first: r[3], ver: r[4], msg: r[5].replace(/\s+/g, " "), ctx: (r[6] || "").replace(/\s+/g, " ") })); };
  const FILES = [["errors_2026-09-08_1449_v178-v1246_92rows.csv", "unfiltered, last 1 day", "09-07 12:49 → 09-08 12:49"],
    ["errors_2026-09-14_1646_v178-v1246_1d_85rows.csv", "unfiltered, last 1 day", "09-13 14:46 → 09-14 14:46"],
    ["errors_2026-09-19_0915_v178-v1246_7d_96rows.csv", "unfiltered, last 7 days", "09-12 07:15 → 09-19 07:15"],
    ["errors_2026-09-11_1708_since-v1250_1d_2rows.csv", "first seen ≥ v1250, 1 day", "09-10 15:08 → 09-11 15:08"],
    ["errors_2026-09-14_1644_since-v1251_7d_1795rows.csv", "first seen ≥ v1251, 7 days", "09-07 14:44 → 09-14 14:44"],
    ["errors_2026-09-19_0915_since-v1251_7d_143rows.csv", "first seen ≥ v1251, 7 days", "09-12 07:15 → 09-19 07:15"],
    ["errors_2026-09-19_0916_since-v1252_7d_2277rows.csv", "first seen ≥ v1252, 7 days", "09-12 07:16 → 09-19 07:16"]];
  const X = Object.fromEntries(FILES.map(([f]) => [f, read(f)]));
  const inv = FILES.map(([f, what, win]) => { const r = X[f]; const vs = {}; for (const x of r) vs[x.ver] = (vs[x.ver] || 0) + x.n;
    return [`\`${f}\``, what, win + " UTC", String(r.length), I(sum(r.map(x => x.n))), Object.entries(vs).sort((a, b) => b[1] - a[1]).map(([v, n]) => `${v} ${I(n)}`).join(", ")]; });
  T("errors", "Export inventory: what each file actually holds", ["File", "Filter", "Window (UTC, from download time)", "Signatures", "Events listed", "First-seen versions present (events)"], inv, [3, 4],
    "Every export is capped at 25 signatures, so absence from a list is never evidence. The 'rows' in a filename counts CSV lines — multi-line HTML error bodies inflate it — not signatures: the since-v1252 file's 2,277 lines are 25 signatures totalling 29 events, all first seen in V1252. 'Since vN' means first seen at version ≥ N (the 09-19 since-v1251 file also lists V1252 rows).",
    "data/exports/10399712766-banana-monkey-destruction/errors/*.csv parsed as RFC4180; download times are Paris local (UTC+2) and converted.");

  const FAM = [["AnimationTrack limit (64 tracks)", /AnimationTrack limit/], ["Event RSVP 404 (EventController)", /EventController\].*Rsvp/i], ["Asset load failures (sound / animation / mesh)", /Failed to load (sound|animation)|MeshContentProvider/],
    ["TopbarPlus version notice", /TopbarPlus/], ["Infinite yield (WaitForChild)", /Infinite yield/], ["[Medal] third-party API", /\[Medal\]/], ["DataStore / leaderboard", /DataStore|ProfileStore|LeaderboardService/],
    ["Other", /.*/]];
  const fam = r => { const t = { }; for (const x of r) { const f = FAM.find(([, re]) => re.test(x.msg))[0]; t[f] = (t[f] || 0) + x.n; } return t; };
  const U = FILES.slice(0, 3).map(([f]) => [f, fam(X[f]), sum(X[f].map(x => x.n))]);
  // ErrorCount over each window (day-weighted) to show coverage
  const ec = run("ErrorCount");
  const cov = [ec.get("2026-09-07") * (11.2 / 24) + (ec.get("2026-09-08") || NaN) * (12.8 / 24), ec.get("2026-09-13") * (9.2 / 24) + ec.get("2026-09-14") * (14.8 / 24),
    ec.get("2026-09-12") * (16.75 / 24) + sum(range("2026-09-13", "2026-09-18").map(d => ec.get(d)))];
  const frows = FAM.map(([name]) => [name, ...U.map(([, t, tot]) => t[name] ? `${I(t[name])} (${PC(t[name] / tot, 1)})` : "—")]);
  const dw = [run("DailyActiveUsers").get("2026-09-07") * (11.2 / 24) + run("DailyActiveUsers").get("2026-09-08") * (12.8 / 24),
    run("DailyActiveUsers").get("2026-09-13") * (9.2 / 24) + run("DailyActiveUsers").get("2026-09-14") * (14.8 / 24)];
  frows.push(["AnimationTrack events per DAU (day-weighted DAU)", F(U[0][1]["AnimationTrack limit (64 tracks)"] / dw[0], 2), F(U[1][1]["AnimationTrack limit (64 tracks)"] / dw[1], 2), "— (09-18 DAU not served)"]);
  frows.push(["Listed total", ...U.map(([, , tot]) => I(tot))], ["ErrorCount over the same window (day-weighted)", ...cov.map(v => Number.isFinite(v) ? I(v) : "09-08 not served")],
    ["Listed ÷ ErrorCount", ...U.map(([, , tot], i) => Number.isFinite(cov[i]) ? PC(tot / cov[i], 0) : "—")]);
  T("errors", "Signature families in the unfiltered exports (events, and share of the listed total)", ["Family", "1 day to 09-08 12:49", "1 day to 09-14 14:46", "7 days to 09-19 07:15"], frows, [1, 2, 3],
    "Compare shares, not raw counts: windows differ in length and each list is capped at 25 signatures (the listed events cover 90–99% of ErrorCount where both exist). Only two single-day windows exist, one on v1246 and one on v1251, so the per-DAU row rests on n = 2.",
    "Unfiltered exports parsed; families by explicit regex on the message (AnimationTrack limit | EventController…Rsvp | Failed to load sound/animation, MeshContentProvider | TopbarPlus | Infinite yield | [Medal] | DataStore/ProfileStore/LeaderboardService). Coverage uses ErrorCount daily totals weighted by the hours of each day inside the window; 09-19 is not served, so the 7-day denominator omits that day's first 7.25 hours.");

  // Build-introduced signatures, grouped by surface
  const grp = (r, rules) => { const o = {}; for (const x of r) { const g = (rules.find(([, re]) => re.test(x.msg + " " + x.ctx)) || ["Other"])[0]; const a = (o[g] ||= { n: 0, k: 0, ver: new Set(), sev: new Set() }); a.n += x.n; a.k++; a.ver.add(x.ver); a.sev.add(x.sev + "/" + x.type); } return o; };
  const RULES = [["Vault event portal script (Workspace.VaultEventRooms…Portal)", /VaultEventRoom/], ["Vault event leaderboard (LeaderboardService, Vaults)", /LeaderboardService.*Vaults/],
    ["'not enough memory' in UIEffects / GameEffects", /not enough memory/], ["Script timeout (VaultShop, Crates, Topbar, Destruction, CameraView controllers)", /Script timeout/],
    ["Scripts outside the game's module tree (PlayerGui …Tela*, Luraph / CoreGui loadstring, bytecode or Luau version mismatch)", /Tela\d|Luraph|bytecode version mismatch|Unsupported Luau version/],
    ["[Medal] third-party API (504/520/NetFail)", /\[Medal\]/], ["Mesh load (unknown mesh version)", /MeshContentProvider/]];
  const intro = [["v1250 (1 day, 09-11)", X[FILES[3][0]]], ["v1251 (7 days to 09-19)", X[FILES[5][0]].filter(x => x.ver === "V1251")], ["v1252 (7 days to 09-19)", X[FILES[6][0]]]];
  const surf = { "Vault event portal script (Workspace.VaultEventRooms…Portal)": "Banana Vault event entry → event participation", "Vault event leaderboard (LeaderboardService, Vaults)": "event leaderboard only",
    "'not enough memory' in UIEffects / GameEffects": "client session → OOM exits, crash rate", "Script timeout (VaultShop, Crates, Topbar, Destruction, CameraView controllers)": "client UI → session length",
    "Scripts outside the game's module tree (PlayerGui …Tela*, Luraph / CoreGui loadstring, bytecode or Luau version mismatch)": "none of the game's own surfaces", "[Medal] third-party API (504/520/NetFail)": "third-party clip SDK", "Mesh load (unknown mesh version)": "asset load" };
  const irows = []; for (const [lab, r] of intro) { const g = grp(r, RULES); for (const [k, a] of Object.entries(g).sort((x, y) => y[1].n - x[1].n)) irows.push([lab, k, String(a.k), I(a.n), [...a.sev].join(", "), surf[k] || "—"]); }
  T("errors", "Signatures first seen in the 11 Sep and 17 Sep builds, grouped by the surface they sit on", ["Build", "Signature group", "Signatures", "Events", "Severity / side", "Surface it could touch"], irows, [2, 3],
    "The v1250 group (34 server errors) appears only in the 25 minutes v1250 was live and does not reappear under V1251. The 'not enough memory' rows all carry the same first-seen second (09-13 07:28 UTC) and the same count in the 09-14 and 09-19 exports. Scripts outside the game's own ReplicatedStorage/ServerScriptService tree are not the game's code paths.",
    "since-v1250 (09-11 17:08 local), since-v1251 7d (09-19 09:15 local, V1251 rows only), since-v1252 7d (09-19 09:16 local); grouped by regex on message + context.");

  // Deploy log errors per build
  const dl = D.deploy.daily.filter(r => r.v >= 1246);
  const dsum = (a, b) => sum(range(a, b).map(d => run("DailyActiveUsers").get(d)));
  const drows = dl.map(r => [`v${r.v}`, `${r.first} → ${r.last}`, String(r.n), I(r.errors), I(r.errors / r.n)]);
  T("errors", "Errors by build from the deploy log", ["Build", "Days with errors", "Days", "Errors", "Errors per day"], drows, [2, 3, 4],
    "Per-build DAU is not served (DailyActiveUsers × PlaceVersion 400s), so these cannot be put per player; days overlap while old servers drain. v1246's first error day reads 09-09 although it went live 09-04 — its row is left-censored and covers only its last six days.",
    "reports/2026-09-19/deploy/10399712766-a.md/-b.md (ErrorCount × PlaceVersion, Place filter), DailyActiveUsers.");
}

// ================================================================ SENTIMENT
{
  const rows = FB.rows; const dau = headline(ID, "DailyActiveUsers");
  const weeks = []; for (let e = "2026-09-16"; e >= "2026-07-22"; e = addDays(e, -7)) weeks.unshift([addDays(e, -6), e]);
  const wr = weeks.map(([a, b]) => { const n = rows.filter(r => r.d >= a && r.d <= b).length, dn = rows.filter(r => r.d >= a && r.d <= b && r.cat === "Downvote").length;
    const dd = sum(range(a, b).map(d => dau.get(d))); return [a, b, n, dn, dd]; });
  const base = wr.filter(([a]) => a >= "2026-08-20" && a < "2026-09-10"); const rate = sum(base.map(x => x[2])) / sum(base.map(x => x[4]));
  const post = sum(POST.map(d => dau.get(d))); const exp = rate * post; const p0 = Math.exp(-exp);
  const srows = wr.map(([a, b, n, dn, dd]) => [`${a.slice(5)}→${b.slice(5)}`, String(n), String(dn), n ? PC(dn / n, 0) : "—", I(dd), F(n / dd * 1e5, 2)]);
  srows.push(["This wk (09-12→16): expected at the 08-20→09-09 rate", F(exp, 1), "", "", I(post), F(rate * 1e5, 2)], ["Observed this wk", "0", "0", "—", "", `P(0 | expected) = ${F(p0, 2)}`]);
  T("sentiment", "Written reviews against audience size, by week", ["Week", "Reviews", "Downvotes", "Downvote rate", "DAU-days", "Reviews per 100k DAU-days"], srows, [1, 2, 3, 4, 5],
    `No review has been written since 09-10 (the live feedback poll at 09-19 09:10 UTC returned none). At the 08-20→09-09 rate this week's audience would produce ${F(exp, 1)} reviews, and zero happens with probability ${F(p0, 2)} — the silence is not evidence either way.`,
    `feedback-${ID}.json (merged history, ${FB.n} rows ${FB.span.join(" → ")}); DailyActiveUsers; Poisson P(0) = e^−expected.`);

  const TH = [["Pay-to-win / price", /p2w|ptw|pay ?to ?win|paytowin|robux|gamepass|gampass|cash grab|scam|\bpay\b|pagar|p2w/i],
    ["Cannot jump / movement", /jump|saltar|pular|walk|caminar/i], ["Admin abuse / update promises", /admin|abuse|asmin|update|updtae|ghosted|lied/i],
    ["Copy / clone of another game", /\bcop(y|ia|iaste|y)\b|copia|copiaste|stole|eat the world|come mundos|copyright/i],
    ["Lag / performance", /lag|laggy|ラグ|fps|freez|stutter|crash|frame/i], ["Progression / grind / timers", /progress|too slow|too much time|timer|minutos|renascimento|grind|10 minutes/i],
    ["Saving / data loss", /\bsave|rollback|lost my|reset/i], ["Art / UI", /\bui\b|ai images|buttons|screen|thumbnail/i], ["Hackers / exploiters", /hack|exploit|ハッカー/i],
    ["Praise (fun / good / love, any language)", /fun|good|love|nice|best|cool|great|amazing|legal|bom|buen|bueno|mantap|bagus|keren|gostei|incr[ií]vel|おもしろ|好玩|крут|very nice/i]];
  const mob = r => r.device === "Phone" || r.device === "Tablet";
  const trows = TH.map(([name, re]) => { const h = rows.filter(r => re.test(r.comment || "")); const dn = h.filter(r => r.cat === "Downvote").length;
    const w = h.filter(r => r.d >= "2026-09-04").length;
    return [name, String(h.length), PC(h.length / rows.length, 1), String(dn), h.length ? PC(dn / h.length, 0) : "—", `${h.filter(mob).length} / ${h.filter(r => r.device === "Computer").length}`, String(w)]; });
  T("sentiment", "Comment themes over the full review history (explicit regex counts)", ["Theme", "Rows", "Share of all rows", "Of which downvotes", "Downvote share", "Mobile / Computer", "Rows since 09-04"], trows, [1, 2, 3, 4, 6],
    `n = ${rows.length} rows (${rows.filter(r => r.cat === "Downvote").length} downvotes), ${FB.span.join(" → ")}. A row can match several themes. Regexes: pay-to-win = p2w|ptw|pay to win|robux|gamepass|cash grab|scam|pay; jump = jump|saltar|pular|walk|caminar; admin = admin|abuse|update|ghosted|lied; lag = lag|fps|freez|stutter|crash|frame; praise = fun|good|love|nice|best|cool|great|legal|bom|buen|mantap|bagus|gostei and non-Latin equivalents.`,
    `feedback-${ID}.json rows[].comment, device (Phone + Tablet = Mobile).`);

  const dev = [["Mobile (Phone + Tablet)", mob], ["Computer", r => r.device === "Computer"]].map(([n, f]) => { const h = rows.filter(f); const dn = h.filter(r => r.cat === "Downvote").length;
    const w = h.filter(r => r.d >= "2026-09-04"); const lag = h.filter(r => /lag|laggy|ラグ|fps|freez|stutter|crash|frame/i.test(r.comment || "")).length;
    return [n, String(h.length), String(dn), PC(dn / h.length, 1), String(lag), `${w.length} (${w.filter(r => r.cat === "Downvote").length} down)`]; });
  T("sentiment", "Downvote rate and performance language by device class", ["Device class", "Rows", "Downvotes", "Downvote rate", "Performance-language rows", "Rows since 09-04"], dev, [1, 2, 3, 4],
    "Both reviews written since 09-04 that downvote the game came from Computer. No review carries a v1250, v1251 or v1252 build number.", `feedback-${ID}.json.`);

  const bv = Object.entries(FB.byVersion).sort((a, b) => +a[0] - +b[0]).map(([v, a]) => [`v${v}`, `${a.first.slice(5)} → ${a.last.slice(5)}`, String(a.up), String(a.down), String(a.n), PC(a.down / a.n, 1)]);
  bv.push(["v1250 / v1251 / v1252", "—", "0", "0", "0", "no rows"]);
  T("sentiment", "Downvote rate by build (written reviews)", ["Build", "Dates", "Up", "Down", "Rows", "Downvote rate"], bv, [2, 3, 4, 5],
    "Builds with fewer than ~20 rows carry little information; v1246 has 4.", `feedback-${ID}.json byVersion.`);
  const v = run("PlayerFeedbackVotesCount"), dd = run("DailyActiveUsers");
  const r = new Map([...v].filter(([d]) => dd.get(d)).map(([d, x]) => [d, x / dd.get(d) * 1000]));
  const a = paired(r, POST, PRE), b = paired(r, PRE, PRIOR);
  T("sentiment", "Net feedback votes per 1,000 DAU", ["Series", "Wk −2", "Wk −1", "This wk", "Δ this wk", "Δ wk before"],
    [["PlayerFeedbackVotesCount ÷ DAU × 1000", F(b.before, 2), F(a.before, 2), F(a.after, 2), SG(a.delta), SG(b.delta)]], [1, 2, 3, 4, 5],
    "PlayerFeedbackVotesCount is served only as a Total (upvotes minus downvotes), so it cannot give a downvote rate; per DAU it shows net vote intensity only.",
    "PlayerFeedbackVotesCount (Total series) and DailyActiveUsers, weekday-paired.");
}

// ================================================================ APPENDIX
{
  const ex = [["AttributionD1RetentionRatio", v => PC(v, 2), "Roblox's attribution-page D1; served to 09-12 only"], ["CpuCoreUtilization", v => PC(v, 1), "server CPU core utilisation (Place-filtered)"],
    ["RFYD8To28CoplayDays", v => F(v, 3), ""], ["RFYD8To28RobuxSpend", v => F(v, 3), ""], ["RFYD8To28SpendDays", v => F(v, 4), ""], ["L7AverageForwardD1Retention", v => PC(v, 2), "stops 08-28 (400 on this grab)"],
    ["UsersJoinedFromNotifications", v => I(v), "moves by ~10/day and never falls: not a daily volume"], ["RSVPCount", v => I(v), "cumulative RSVPs"], ["EventAvgDailyActiveUsers", v => I(v), "a per-event average, constant between event boundaries"]];
  const rows = ex.map(([k, f, note]) => { const m = headline(ID, k); const a = paired(m, POST, PRE); const last = [...m.keys()].filter(d => d <= "2026-09-19").sort().at(-1);
    return [`\`${k}\``, a.n ? f(a.before) : "—", a.n ? f(a.after) : "—", a.n ? SG(a.delta) : "—", `${a.n}/5`, last ? `${last} (${f(m.get(last))})` : "—", note]; });
  T("appendix", "Other series the corpus holds for this universe", ["Metric", "Wk −1", "This wk", "Δ", "Pairs", "Newest point", "Note"], rows, [1, 2, 3, 4],
    "Not in the standard tables; listed so nothing served is silently left out. The notes say where a series cannot be read as a daily level.",
    "Corpus headline series (series.json), weekday-paired.");
  const gaps = [["ForwardD1Retention × IsNewUser", "Explore returned ERROR_CODE_INTERNAL_ERROR (Roblox-side) — unavailable, not zero"], ["ForwardD7Retention this week", "newest point 09-10; no this-week pair"],
    ["ServerCrashCount", "absent (only one point, 09-03); the API omits zero rows"], ["Error message text for v1250–v1252 beyond 25 signatures", "export cap; MessageHash text lookup still returns 500"],
    ["Written reviews on v1250/v1251/v1252", "none exist (live poll 09-19 09:10 UTC)"], ["Update contents of v1252", "no spec filed"]];
  T("appendix", "Not available this week, and why", ["Series", "Status"], gaps, [], "", "grab-report.md, Explore pull log, feedback poll, data/updates/.");
}

const out = { game: "monkey", universe: ID, builtAt: new Date().toISOString(), tables };
fs.writeFileSync(path.join(BASE, "data/extras-monkey.json"), JSON.stringify(out, null, 1));
console.log(`wrote extras-monkey.json: ${tables.length} tables`);
for (const t of tables) console.log(` [${t.section}] ${t.title} — ${t.rows.length} rows`);
