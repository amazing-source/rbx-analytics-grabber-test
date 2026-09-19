// Analyst tables for the 2026-09-19 Verity Companion [AI] page (universe 10565445771).
// Reads the data files and the corpus, writes reports/2026-09-19/data/extras-verity.json.
// Every figure the verity prose quotes that is not in data/verity.json is computed here.
//
//   node tools/r0919/extras/verity.js
//
// Inputs (read-only):
//   reports/2026-09-19/data/{verity,brainrot,waterslide,monkey,seal,portfolio}.json   (tools/r0919/build.js)
//   reports/2026-09-19/data/feedback-10565445771.json                                (merged review history)
//   data/raw/10565445771-*.json            (window-aggregate funnel + session-bucket queries, with their windows)
//   data/games/10565445771/metrics/FunnelCohortCompletionRate.csv   (captured_at = first-read time per cohort day)
//   data/games/10565445771/data-quality.md (re-served values = the same-capture read of 09-19 09:03)
//   data/games/10565445771/annotations.md, series.json (via tools/lib.js)
//   data/exports/10565445771-verity-companion/errors/*.csv
const fs = require("fs");
const path = require("path");
const L = require("../../lib.js");
const ROOT = path.join(__dirname, "../../..");
const DATA = path.join(ROOT, "reports/2026-09-19/data");
const ID = "10565445771";
const readJ = p => JSON.parse(fs.readFileSync(p, "utf8"));
const D = readJ(path.join(DATA, "verity.json"));
const P = readJ(path.join(DATA, "portfolio.json"));
const G = Object.fromEntries(["brainrot", "waterslide", "monkey", "verity", "seal"].map(s => [s, readJ(path.join(DATA, s + ".json"))]));
const FB = readJ(path.join(DATA, `feedback-${ID}.json`));
const W = D.window;
const tables = [];
const T = (section, title, columns, rows, numeric, note, source) => tables.push({ section, title, columns, rows, numeric, note, source });

// ---------------------------------------------------------------- helpers
const addDays = (d, n) => { const x = new Date(d + "T00:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const range = (a, b) => { const o = []; for (let d = a; d <= b; d = addDays(d, 1)) o.push(d); return o; };
const DOW = d => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(d.slice(0, 10) + "T00:00:00Z").getUTCDay()];
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
const sum = a => a.reduce((x, y) => x + y, 0);
const sd = a => { if (a.length < 2) return null; const m = avg(a); return Math.sqrt(sum(a.map(x => (x - m) ** 2)) / (a.length - 1)); };
const fin = v => v != null && Number.isFinite(v);
const fi = v => fin(v) ? Math.round(v).toLocaleString("en-US") : "—";
const fp = (v, dp = 1) => fin(v) ? (v * 100).toFixed(dp) + "%" : "—";
const fd = v => fin(v) ? (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v * 100).toFixed(1) + "%" : "—";
const fpp = (v, dp = 1) => fin(v) ? (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(dp) + "pp" : "—";
const fn = (v, dp = 2) => fin(v) ? v.toFixed(dp) : "—";
const fz = v => fin(v) ? (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1) : "—";
const fr = v => fin(v) ? "R$" + Math.round(v).toLocaleString("en-US") : "—";
const M = k => D.metrics.find(m => m.metric === k);
const run = k => M(k).run;
const POST = W.POST, PRE = W.PRE, PRIOR = W.PRIOR;
// paired means over weekday pairs where both sides exist; skip = indexes of pairs to drop
function paired(map, post, pre, skip = []) {
  const get = (m, d) => m instanceof Map ? m.get(d) : m[d];
  const pr = []; post.forEach((d, i) => { if (skip.includes(i)) return; const a = get(map, pre[i]), b = get(map, d); if (fin(a) && fin(b)) pr.push([pre[i], d, a, b]); });
  const before = avg(pr.map(p => p[2])), after = avg(pr.map(p => p[3]));
  return { n: pr.length, before, after, delta: fin(before) && fin(after) && before ? after / before - 1 : null, diffs: pr.map(p => p[3] - p[2]), pairs: pr };
}
function csvParse(txt) {
  const recs = []; let row = [], cur = "", q = false;
  for (let i = 0; i < txt.length; i++) { const c = txt[i];
    if (q) { if (c === '"') { if (txt[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true; else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n") { row.push(cur.replace(/\r$/, "")); recs.push(row); row = []; cur = ""; } else cur += c; }
  if (cur || row.length) { row.push(cur); recs.push(row); }
  return recs;
}
const dauRun = run("DailyActiveUsers");

// ================================================================ GLANCE
// G1. Revenue = DAU × payer conversion × ARPPU, from SUMS over the paired days so the identity is exact.
{
  const rev = run("DailyRevenue"), pay = run("PayingUsers");
  const agg = (days) => { const ok = days.filter(d => fin(rev[d]) && fin(dauRun[d]) && fin(pay[d]));
    const R = sum(ok.map(d => rev[d])), U = sum(ok.map(d => dauRun[d])), Pu = sum(ok.map(d => pay[d]));
    return { n: ok.length, R, U, Pu, dau: U / ok.length, cvr: Pu / U, arppu: R / Pu, arpdau: R / U, payers: Pu / ok.length, revDay: R / ok.length }; };
  const A = agg(PRIOR), B = agg(PRE), C = agg(POST);
  const lr = (x, y) => Math.log(y / x);
  const tot = lr(B.revDay, C.revDay), totP = lr(A.revDay, B.revDay);
  const rows = [
    ["Revenue per day (R$)", fr(A.revDay), fr(B.revDay), fr(C.revDay), fd(B.revDay / A.revDay - 1), fd(C.revDay / B.revDay - 1), fz(totP * 100), fz(tot * 100)],
    ["DAU (mean)", fi(A.dau), fi(B.dau), fi(C.dau), fd(B.dau / A.dau - 1), fd(C.dau / B.dau - 1), fz(lr(A.dau, B.dau) * 100), fz(lr(B.dau, C.dau) * 100)],
    ["Paying-user conversion (payers ÷ DAU)", fp(A.cvr, 3), fp(B.cvr, 3), fp(C.cvr, 3), fd(B.cvr / A.cvr - 1), fd(C.cvr / B.cvr - 1), fz(lr(A.cvr, B.cvr) * 100), fz(lr(B.cvr, C.cvr) * 100)],
    ["ARPPU (R$ per payer)", fn(A.arppu), fn(B.arppu), fn(C.arppu), fd(B.arppu / A.arppu - 1), fd(C.arppu / B.arppu - 1), fz(lr(A.arppu, B.arppu) * 100), fz(lr(B.arppu, C.arppu) * 100)],
    ["Paying users per day (numerator)", fi(A.payers), fi(B.payers), fi(C.payers), fd(B.payers / A.payers - 1), fd(C.payers / B.payers - 1), "", ""],
    ["ARPDAU (R$, = conversion × ARPPU)", fn(A.arpdau, 3), fn(B.arpdau, 3), fn(C.arpdau, 3), fd(B.arpdau / A.arpdau - 1), fd(C.arpdau / B.arpdau - 1), "", ""],
  ];
  T("money", "Revenue split into audience size, payer conversion and spend per payer",
    ["Factor", "Aug 29→Sep 2", "Sep 5→9", "Sep 12→16", "Δ week before", "Δ this week", "Log-points week before", "Log-points this week"],
    rows, [1, 2, 3, 4, 5, 6, 7],
    "Revenue = DAU × (payers ÷ DAU) × (R$ ÷ payer) holds exactly on window sums, so the three log-point figures add up to the revenue line. Conversion here is Σpayers ÷ ΣDAU, which differs slightly from the mean of the daily `PayingUsersCVR`.",
    "`DailyRevenue`, `DailyActiveUsers`, `PayingUsers` headline ONE_DAY, sums over the five weekday-paired days (all 5/5 present); log-points = 100 × ln(after ÷ before).");
}
// G2. portfolio co-movement
{
  const ks = [["DailyActiveUsers", "DAU"], ["PeakConcurrentPlayers", "Peak CCU"], ["UniqueUsersWithImpressions", "Impressions"], ["EndToEndCVR", "Impr→play CVR"],
    ["ForwardD1Retention", "D1"], ["AverageSessionLengthMinutes", "Session length"], ["DailyRevenue", "Revenue"], ["AverageRevenuePerUser", "ARPDAU"],
    ["PayingUsersCVR", "Payer CVR"], ["RFYD2To7PlayDays", "RFY D2–7 play days"], ["RFYD8To28PlayDays", "RFY D8–28 play days"], ["ClientCrashRate15m", "Crash rate"]];
  const rows = ks.map(([k, lbl]) => [lbl, ...P.games.map(g => { const x = g.k[k]; return x && fin(x.d) ? fd(x.d) : "—"; })]);
  T("reach", "Is it Verity or everyone? The same window on all five games",
    ["Metric (Δ this week)", ...P.games.map(g => g.name.split(" [")[0].replace("+1 ", ""))], rows, [1, 2, 3, 4, 5],
    "Same paired weekdays on every game. Where Verity moves with the other four, the cause is less likely to be Verity-specific; where it moves alone, it is.",
    "`reports/2026-09-19/data/portfolio.json` (built by tools/r0919/build.js), Δ = POST ÷ PRE − 1 on paired days.");
}

// G3. lifecycle: each game's DAU as a share of its own peak
{
  const ds = ["2026-08-26", "2026-09-02", "2026-09-09", "2026-09-16", "2026-09-17"];
  const rows = P.games.map(g => { const dr = g.dauRun; const wk = (a, b) => { const x = dr[a], y = dr[b]; return fin(x) && fin(y) ? fd(y / x - 1) : "—"; };
    return [g.name.split(" [")[0].replace("+1 ", ""), `${fi(g.peak.dau)} on ${g.peak.date.slice(5)}`, ...ds.map(d => fin(g.pctOfPeak[d]) ? fp(g.pctOfPeak[d], 1) : "—"), wk("2026-09-09", "2026-09-16")]; });
  T("reach", "Where each game sits on its own curve: DAU as a share of its own peak", ["Game", "Peak DAU", "Wed 26 Aug", "Wed 2 Sep", "Wed 9 Sep", "Wed 16 Sep", "Thu 17 Sep", "DAU Wed 9 → Wed 16 Sep"], rows, [1, 2, 3, 4, 5, 6, 7],
    "Same weekday in every column. Brainrot is the portfolio's measured floor: it settled at 7–11% of its peak and is rising this week. Monkey went through that level.",
    "`reports/2026-09-19/data/portfolio.json` (`pctOfPeak`, `dauRun`, `peak` — headline `DailyActiveUsers`, peak over full history).");
}

// ================================================================ TIMELINE
// Exports: parse every error export once (used in timeline + errors)
const EXDIR = path.join(ROOT, "data/exports/10565445771-verity-companion/errors");
const EX = {};
for (const f of fs.readdirSync(EXDIR).filter(f => f.endsWith(".csv"))) {
  const r = csvParse(fs.readFileSync(path.join(EXDIR, f), "utf8")); const [, ...rows] = r;
  EX[f] = rows.filter(x => x.length >= 6 && /^\d+$/.test(x[0])).map(x => ({ count: +x[0], sev: x[1], type: x[2], seenAt: x[3], ver: x[4], msg: x[5].split("\n")[0].replace(/\s+/g, " ").trim() }));
}
const exSum = (file, re) => sum((EX[file] || []).filter(r => re.test(r.msg)).map(r => r.count));
const F693 = "errors_2026-09-19_0916_since-v693_7d_42rows.csv", F695 = "errors_2026-09-19_0917_since-v695_7d_44rows.csv",
  F696 = "errors_2026-09-19_0917_since-v696_1d_25rows.csv", FALL = "errors_2026-09-19_0916_v446-v684_7d_129rows.csv",
  F692 = "errors_2026-09-10_1434_since-v692_48rows.csv", F0908 = "errors_2026-09-08_1449_v446-v688_154rows.csv";
{
  const fb = FB.byVersion;
  const dv = v => { const r = fb[v]; return r ? `${r.up + r.down} · ${fp(r.down / (r.up + r.down), 0)} down` : "—"; };
  const pv = v => { const x = D.placeVersions.find(p => p.v === v); return x ? x.t.slice(0, 16).replace("T", " ") : "—"; };
  const rows = [
    ["v684", pv(684), "Spec `Update 04.09`: alternative endings (best-friends ending marked DELAYED), paid personality/skin shop, first skin free after 50 messages", "`[MessageSpend] … infinite messages are active` (61,820 in the last 7 days); `[BestFriends] Shared.WorldStates.dark missing` (16,518)", dv("684")],
    ["v688", pv(688), "No spec filed", "`[Client] /cmdr chat command missing` (93,266 in the 09-08 export)", dv("688")],
    ["v689 / v690", `${pv(689)} / ${pv(690)}`, "Spec `Update 10.09`, shipped early: D7 daily-reward track paying messages (unlock-all 399R); returning-player rewards; endings repeatable; like + group reward (50 messages + Mischievous skin); playtime-reward timer; Dreamity and Cruelty personalities at 99R", "none filed at v689/v690 (no since-v689 export exists)", `${dv("689")} / ${dv("690")}`],
    ["v691 / v692", `${pv(691)} / ${pv(692)}`, "No spec filed", "`Error fetching MarketplaceService receipts … DnsResolve` (2,576 on the 09-10 export); `ProfileStore … Too many requests` (42)", dv("692")],
    ["**v693** (the 11 Sep build)", pv(693), "No spec filed — contents unknown", "`[LikeReward] Player:IsInGroup failed …` (586 across five HTTP error types); AI-reply retry warnings: `Model repeated its own previous line` (6,127), `Model returned no usable dialogue` (4,023), `DeepInfra network failure` (543), `Reply was cut at max_tokens` (487)", dv("693")],
    ["v694", pv(694), "Saved, not published", "—", "—"],
    ["v695", pv(695), "No spec filed — contents unknown", "`AnalyticsService: You have sent too many events.` (6,125, first seen 09-17); `ProfileStore DataStore API error: 502 … Access forbidden` (1,175); `Ending rejoin failed: Not allowed` (15)", dv("695")],
    ["v696", pv(696), "No spec filed — contents unknown", "only per-player `Generated dialogue was rejected by filtering` rows (65 events, 1 day)", dv("696")],
  ];
  T("timeline", "Builds, what is known about their contents, and the log lines they introduced",
    ["Build", "Published (UTC)", "Contents", "Signatures first seen at this build (error exports)", "Reviews on this build"], rows, [],
    "A signature first seen at a build proves that code path ran on that build; it does not list the build's features. Counts are from row-capped exports, so they are floors.",
    "`data/updates/10565445771-verity-companion.md`; `place-versions.csv`; exports `errors_2026-09-19_*` (7-day / 1-day windows), `errors_2026-09-10_1434_since-v692`, `errors_2026-09-08_1449_v446-v688`; review counts from `feedback-10565445771.json`.");
}
{
  const rows = [
    ["2026-09-04 19:00 → (no END row)", "`NEW UPDATE` experience event starts, 40 min before v684", "PRIOR/PRE boundary"],
    ["2026-09-07 (Mon)", "Labor Day in the US and Canada — the PRE Monday (09-07) is a public holiday; the POST Monday (09-14) is not", "PRE Monday pair"],
    ["2026-09-08", "Roblox telemetry fault on `ClientFpsP10` / client memory on all five games (F28); first read kept in the corpus", "PRE Tuesday pair (technical)"],
    ["2026-09-08 22:36 / 09-09 16:47", "Engine `RCC 738`", "PRE"],
    ["2026-09-10 19:00 → 09-14 19:00", "`NEW UPDATE` experience event (START and END rows)", "covers Sat 09-12 and Sun 09-13 of POST"],
    ["2026-09-14 22:07", "Engine `RCC 739`", "POST"],
    ["2026-09-18 19:00 → (running)", "`NEW UPDATE` experience event starts", "after POST; covers today"],
    ["08-31 ×2, 09-01, 09-02, 09-06, 09-08, 09-12, 09-14, 09-16, 09-17", "Place thumbnail set changed (10 swaps since 08-31)", "every window"],
  ];
  T("timeline", "Non-build events inside the comparison windows", ["When (UTC)", "What", "Where it lands"], rows, [],
    "Anything here can move a metric on its own date without a build being involved.",
    "`annotations.md` (EXPERIENCE_EVENT_STATE, ENGINE_RELEASE, PLACE_THUMBNAIL); `DIAGNOSIS_LOG.md` 2026-09-09 (F28); public-holiday calendar.");
}

// ================================================================ REACH
{
  const imp = run("UniqueUsersWithImpressions"), cvr = run("EndToEndCVR"), plays = run("UniqueUsersWithPlaySessions");
  const a = paired(imp, POST, PRE), b = paired(cvr, POST, PRE), c = paired(plays, POST, PRE);
  const a0 = paired(imp, PRE, PRIOR), b0 = paired(cvr, PRE, PRIOR), c0 = paired(plays, PRE, PRIOR);
  const prod = (1 + a.delta) * (1 + b.delta) - 1, prod0 = (1 + a0.delta) * (1 + b0.delta) - 1;
  const rows = [
    ["Impressions (unique users) `UniqueUsersWithImpressions`", fd(a0.delta), fd(a.delta), fp(Math.log(1 + a0.delta) / Math.log(1 + prod0), 0), fp(Math.log(1 + a.delta) / Math.log(1 + prod), 0)],
    ["Impression→play conversion `EndToEndCVR`", fd(b0.delta), fd(b.delta), fp(Math.log(1 + b0.delta) / Math.log(1 + prod0), 0), fp(Math.log(1 + b.delta) / Math.log(1 + prod), 0)],
    ["Product of the two", fd(prod0), fd(prod), "100%", "100%"],
    ["Measured `UniqueUsersWithPlaySessions`", fd(c0.delta), fd(c.delta), "", ""],
  ];
  T("reach", "Players arriving = impressions × conversion", ["Factor", "Δ week before", "Δ this week", "Share week before", "Share this week"], rows, [1, 2, 3, 4],
    "Both factors fell together this week; the week before, conversion carried the fall with impressions nearly flat. The product tracks measured players-with-plays within a few points.",
    "Paired weekday means of the headline ONE_DAY series; share = ln(1+Δfactor) ÷ ln(1+Δproduct).");
}
{
  const S = D.splits, rows = [];
  for (const src of ["HomeRecommendation", "Search", "Friends", "Others", "ContinueToPlay"]) {
    const i = S.impressionsBySource[src], d = S.dauBySource[src];
    const conv = x => i && d && x === "b" ? d.before / i.before : i && d ? d.after / i.after : null;
    rows.push([src, i ? fi(i.before) : "—", i ? fi(i.after) : "—", i ? fd(i.delta) : "—", d ? fi(d.before) : "—", d ? fi(d.after) : "—", d ? fd(d.delta) : "—",
      i && d && src !== "Others" ? fp(conv("b"), 2) : "—", i && d && src !== "Others" ? fp(conv("a"), 2) : "—"]);
  }
  T("reach", "Reach and players by acquisition source", ["Source", "Impr. before", "Impr. after", "Δ impr.", "DAU before", "DAU after", "Δ DAU", "DAU ÷ impr. before", "DAU ÷ impr. after"],
    rows, [1, 2, 3, 4, 5, 6, 7, 8],
    "Search impressions barely moved while Search DAU fell a third. `Others` DAU exceeds its impressions (players arrive through surfaces that are not counted as impressions), so no ratio is shown; `ContinueToPlay` has impressions but no DAU source of its own.",
    "`UniqueUsersWithImpressions` and `DailyActiveUsers` by `AcquisitionSource`, ONE_DAY, paired weekday means (5/5).");
}
{
  // RFY signal block, daily
  const ks = [["UniqueUsersWithImpressions", "Impr.", v => fi(v)], ["RFYPlayThroughRate", "PTR", v => fp(v, 2)], ["RFYUniqueNotInterestedUsersPerMillionImpressions", "Not-interested /M", v => fn(v, 0)],
    ["RFYDuration0To60", "Bounce <60s", v => fp(v, 1)], ["RFYD1Playtime", "D1 playtime", v => fn(v, 1)], ["RFYD1QualifiedPlaySessions", "D1 qual. sess.", v => fn(v, 2)],
    ["RFYD2To7PlayDays", "D2–7 play days", v => fn(v, 3)], ["RFYD8To28PlayDays", "D8–28 play days", v => fn(v, 3)], ["RFYD1SpendDay", "D1 spend days", v => fn(v, 4)]];
  const rows = range("2026-09-03", "2026-09-17").map(d => [`${DOW(d)} ${d.slice(5)}`, ...ks.map(([k, , f]) => f(run(k)[d]))]);
  T("reach", "Recommendation (RFY) signals by day, 3 → 17 Sep", ["Day", ...ks.map(k => k[1])], rows, [1, 2, 3, 4, 5, 6, 7, 8, 9],
    "Roblox says impression cuts typically follow a fall in these per-user signals. `RFYD8To28PlayDays` is first served on 09-04 and falls on every day after; the other quality signals sit inside their earlier range.",
    "Headline ONE_DAY RFY series from the corpus (settled days only).");
}
{
  // Impressions by surface, daily, and the Tue->Wed Home step across the portfolio
  const S = D.splits.impressionsBySource;
  const rows = range("2026-09-05", "2026-09-17").map(d => { const h = S.HomeRecommendation.run[d], hp = S.HomeRecommendation.run[addDays(d, -1)], h7 = S.HomeRecommendation.run[addDays(d, -7)];
    return [`${DOW(d)} ${d.slice(5)}`, fi(h), fin(h) && fin(hp) ? fd(h / hp - 1) : "—", fin(h) && fin(h7) ? fd(h / h7 - 1) : "—", fi(S.Search.run[d]), fi(S.ContinueToPlay.run[d]), fi(S.Friends.run[d])]; });
  T("reach", "Impressions by surface, by day", ["Day", "Home recommendation", "Δ vs day before", "Δ vs same weekday −7d", "Search", "Continue to play", "Friends"], rows, [1, 2, 3, 4, 5, 6],
    "Home carries three quarters of impressions. Its largest one-day fall in the window is Wed 16 Sep (−65% on the day before), the day after v695; Search holds at 0.30–0.60M throughout.",
    "`UniqueUsersWithImpressions` by `AcquisitionSource`, ONE_DAY (corpus).");
  const rows2 = ["verity", "brainrot", "waterslide", "monkey", "seal"].map(g => { const H = G[g].splits.impressionsBySource.HomeRecommendation.run;
    return [G[g].name.split(" [")[0].replace("+1 ", ""), fi(H["2026-09-15"]), fi(H["2026-09-16"]), fd(H["2026-09-16"] / H["2026-09-15"] - 1), fd(H["2026-09-09"] / H["2026-09-08"] - 1), fd(H["2026-09-02"] / H["2026-09-01"] - 1)]; });
  T("reach", "Home impressions, Tuesday → Wednesday, all five games", ["Game", "Tue 15 Sep", "Wed 16 Sep", "Δ 15 → 16 Sep", "Δ 8 → 9 Sep", "Δ 1 → 2 Sep"], rows2, [1, 2, 3, 4, 5],
    "Tuesday to Wednesday is usually down on these games; the question is whether 16 Sep was unusual for Verity against its own earlier Tuesdays and against the others.",
    "`UniqueUsersWithImpressions` `AcquisitionSource=HomeRecommendation`, ONE_DAY, each game's data file.");
}
{
  // Thumbnail event study against the base rate of non-swap days
  const txt = fs.readFileSync(path.join(ROOT, "data/games", ID, "annotations.md"), "utf8");
  const swaps = new Set();
  for (const line of txt.split("\n")) { const m = line.match(/^- `(\{.*\})`$/); if (!m) continue; let j; try { j = JSON.parse(m[1]); } catch { continue; }
    if (j.annotationType === "ANNOTATION_TYPE_PLACE_THUMBNAIL") swaps.add(j.createdUtcTime.slice(0, 10)); }
  const rows = [];
  for (const [k, lbl] of [["RFYPlayThroughRate", "RFY play-through rate"], ["RFYUniqueNotInterestedUsersPerMillionImpressions", "Not-interested per M impressions"], ["UniqueUsersWithImpressions", "Impressions"]]) {
    const r = run(k); const days = range("2026-08-16", "2026-09-16");
    const stat = d => (fin(r[addDays(d, -1)]) && fin(r[addDays(d, 1)]) && r[addDays(d, -1)] > 0) ? Math.log(r[addDays(d, 1)] / r[addDays(d, -1)]) : null;
    const sw = days.filter(d => swaps.has(d)).map(stat).filter(fin), ns = days.filter(d => !swaps.has(d)).map(stat).filter(fin);
    const z = (avg(sw) - avg(ns)) / (sd(ns) / Math.sqrt(sw.length));
    rows.push([lbl, String(sw.length), fd(Math.exp(avg(sw)) - 1), String(ns.length), fd(Math.exp(avg(ns)) - 1), fd(Math.exp(sd(ns)) - 1), fz(z)]);
  }
  T("reach", "Thumbnail swaps against the base rate of ordinary days", ["Series", "Swap days", "Mean change, swap days", "Other days", "Mean change, other days", "sd, other days", "z"],
    rows, [1, 2, 3, 4, 5, 6],
    "Change = day after the swap vs day before (the swap day itself is mixed). A swap effect has to beat what ordinary days do; |z| under 2 is indistinguishable.",
    "Swap dates from `annotations.md` `ANNOTATION_TYPE_PLACE_THUMBNAIL` (08-16 → 09-16); headline ONE_DAY series; z = (mean_swap − mean_other) ÷ (sd_other ÷ √n_swap).");
}
{
  // New inflow and the returning pool
  const ex = D.explore.specs.find(s => s.metric === "DailyActiveUsers" && s.breakdown === "IsNewUser").segments;
  const N = ex.New.run, R = ex.Returning.run;
  const trail = d => { const xs = range(addDays(d, -7), addDays(d, -1)).map(x => N[x]).filter(fin); return xs.length === 7 ? avg(xs) : null; };
  const rows = range("2026-09-05", "2026-09-17").map(d => [`${DOW(d)} ${d.slice(5)}`, fi(N[d]), fi(R[d]), fp(R[d] / (N[d] + R[d]), 1), fi(trail(d)), fin(trail(d)) ? fn(R[d] / trail(d), 3) : "—"]);
  const wk = days => { const ok = days.filter(d => fin(N[d]) && fin(R[d]) && fin(trail(d))); return [avg(ok.map(d => N[d])), avg(ok.map(d => R[d])), avg(ok.map(d => R[d] / trail(d)))]; };
  const [n0, r0, q0] = wk(PRIOR.filter(d => d >= "2026-08-29")), [n1, r1, q1] = wk(PRE), [n2, r2, q2] = wk(POST);
  rows.push(["**Mean Sep 5→9**", fi(n1), fi(r1), fp(r1 / (n1 + r1), 1), "", fn(q1, 3)]);
  rows.push(["**Mean Sep 12→16**", fi(n2), fi(r2), fp(r2 / (n2 + r2), 1), "", fn(q2, 3)]);
  T("reach", "New players, returning players, and returning players per recent arrival",
    ["Day", "New DAU", "Returning DAU", "Returning share", "New DAU, mean of prior 7 days", "Returning ÷ that mean"], rows, [1, 2, 3, 4, 5],
    "The last column divides the day's returning players by the average daily arrivals of the week before it. It is a rough return rate with a known bias: returning players also come from older, larger cohorts, so the ratio drifts up whenever the inflow is shrinking.",
    "Explore (`dag/execute`) `DailyActiveUsers` by `IsNewUser`, pulled 2026-09-19 09:12 UTC; the pull starts 08-29, so the ratio exists from 09-05.");
}
{
  const c = D.splits.dauByCountry; const en = ["US", "GB", "CA", "AU"], la = ["MX", "BR", "AR", "CL"];
  const tb = sum(Object.values(c).map(v => v.before)), ta = sum(Object.values(c).map(v => v.after));
  const totB = paired(dauRun, POST, PRE).before, totA = paired(dauRun, POST, PRE).after;
  const rows = Object.entries(c).map(([k, v]) => [k, fi(v.before), fi(v.after), fd(v.delta), fp(v.before / totB, 1), fp(v.after / totA, 1), fpp((v.after / totA - v.before / totB) * 100)]);
  const grp = (lbl, ks) => { const b = sum(ks.map(k => c[k].before)), a = sum(ks.map(k => c[k].after)); return [`**${lbl}**`, fi(b), fi(a), fd(a / b - 1), fp(b / totB, 1), fp(a / totA, 1), fpp((a / totA - b / totB) * 100)]; };
  rows.push(grp("US + GB + CA + AU", en), grp("MX + BR + AR + CL", la));
  T("reach", "Country mix of DAU", ["Country", "DAU before", "DAU after", "Δ", "Share before", "Share after", "Δ share"], rows, [1, 2, 3, 4, 5, 6],
    "Mexico and Chile grew while every other large market shrank. The English-speaking group lost 3.6 points of share. Revenue by country is not held, so the mix effect on ARPDAU cannot be priced.",
    "`DailyActiveUsers` by `Country`, ONE_DAY, top 15 by post volume, paired weekday means; shares are of headline DAU.");
}

// ================================================================ CCU
const HR = D.explore.specs.find(s => s.metric === "ConcurrentPlayers" && s.points).points;          // label = END of the hour (see method)
const HH = D.explore.specs.find(s => s.metric === "PeakConcurrentPlayers" && s.points && s.granularity === "METRIC_GRANULARITY_HALF_HOUR").points;
const PULL = D.explore.pulledAt;                                                                     // 2026-09-19T09:12Z
{
  // daily mean from hourly: hour label T covers [T-1h, T)
  const byDay = {};
  for (const [t, v] of Object.entries(HR)) { const s = new Date(Date.parse(t) - 3600e3).toISOString(); if (s >= PULL.slice(0, 13)) continue; (byDay[s.slice(0, 10)] ||= []).push(v); }
  const full = Object.fromEntries(Object.entries(byDay).filter(([, a]) => a.length === 24).map(([d, a]) => [d, avg(a)]));
  const rows = range("2026-08-29", "2026-09-18").map(d => [`${DOW(d)} ${d.slice(5)}`, fi(full[d]), fi(full[addDays(d, -7)]), fin(full[d]) && fin(full[addDays(d, -7)]) ? fd(full[d] / full[addDays(d, -7)] - 1) : "—", fi(run("PeakConcurrentPlayers")[d])]);
  const p = paired(full, POST, PRE), p0 = paired(full, PRE, PRIOR);
  rows.push(["**Sep 12→16 vs Sep 5→9**", fi(p.after), fi(p.before), fd(p.delta), ""], ["**Sep 5→9 vs Aug 29→Sep 2**", fi(p0.after), fi(p0.before), fd(p0.delta), ""]);
  T("ccu", "Average concurrent players per day (hourly series), same weekday", ["Day", "Mean CCU", "Same weekday −7d", "Δ", "Daily peak `PeakConcurrentPlayers`"], rows, [1, 2, 3, 4],
    "The daily mean is the size of the game across the whole day; the daily peak is a maximum (and a sum of per-platform peaks). Only complete 24-hour days are shown.",
    "Explore `ConcurrentPlayers` ONE_HOUR (label = end of the hour), mean of 24 hourly values per UTC day; peak from the corpus ONE_DAY series.");
}
{
  // Today vs last Saturday, same elapsed UTC hours. Complete hours today: 00:00–09:00 UTC (labels 01:00–09:00). Label 10:00 (09:00–10:00) is in progress: dropped.
  const rows = []; const a = [], b = [];
  for (let h = 1; h <= 9; h++) { const lt = `2026-09-19T${String(h).padStart(2, "0")}:00:00Z`, lp = `2026-09-12T${String(h).padStart(2, "0")}:00:00Z`, lq = `2026-09-05T${String(h).padStart(2, "0")}:00:00Z`;
    const v = HR[lt], w = HR[lp], x = HR[lq]; if (fin(v) && fin(w)) { a.push(v); b.push(w); }
    rows.push([`${String(h - 1).padStart(2, "0")}:00–${String(h).padStart(2, "0")}:00`, fi(v), fi(w), fin(v) && fin(w) ? fd(v / w - 1) : "—", fi(x), fin(v) && fin(x) ? fd(v / x - 1) : "—"]); }
  const s5 = []; for (let h = 1; h <= 9; h++) { const x = HR[`2026-09-05T${String(h).padStart(2, "0")}:00:00Z`]; if (fin(x)) s5.push(x); }
  rows.push(["**Mean 00:00–09:00**", fi(avg(a)), fi(avg(b)), fd(avg(a) / avg(b) - 1), fi(avg(s5)), fd(avg(a) / avg(s5) - 1)]);
  T("ccu", "Today (Sat 19 Sep, partial) against the same hours of the last two Saturdays",
    ["UTC hour", "Sat 19 Sep", "Sat 12 Sep", "Δ vs 12 Sep", "Sat 5 Sep", "Δ vs 5 Sep"], rows, [1, 2, 3, 4, 5],
    "Only hours that had finished when the data was pulled (09:12 UTC) are compared; the in-progress 09:00 hour and the carry-forward bucket after it are dropped. All three Saturdays sit inside a `NEW UPDATE` event (09-04, 09-10 and 09-18 starts).",
    "Explore `ConcurrentPlayers` ONE_HOUR, pulled 2026-09-19 09:12 UTC; hourly label = end of the hour.");
}
{
  // Publish hours: half-hour PCU slots [tp-2h, tp) and [tp+1h, tp+4h) vs the same slots 7 days earlier, against the base rate of non-publish days at the same clock time
  const pubs = D.placeVersions.filter(v => v.published && v.t >= "2026-09-05").map(v => ({ v: v.v, t: v.t }));
  const pubDays = new Set(pubs.map(p => p.t.slice(0, 10)));
  const slot = (day, hhmm) => HH[`${day}T${hhmm}:00Z`];
  const hm = ms => { const d = new Date(ms); return [d.toISOString().slice(0, 10), d.toISOString().slice(11, 16)]; };
  const winMean = (day, t0ms, fromH, toH) => { const xs = []; for (let m = fromH * 60; m < toH * 60; m += 30) { const tt = t0ms + m * 60e3; const [, hh] = hm(tt); const key = `${day}T${hh}:00Z`; const v = HH[key]; if (fin(v)) xs.push(v); } return xs.length ? avg(xs) : null; };
  const stat = (day, clockMs) => {  // clockMs = ms since midnight of the publish, snapped to the half-hour
    const t0 = Date.parse(day + "T00:00:00Z") + clockMs, t7 = t0 - 7 * 864e5, d7 = addDays(day, -7);
    const pre = winMean(day, t0, -2, 0), post = winMean(day, t0, 1, 4), pre7 = winMean(d7, t7, -2, 0), post7 = winMean(d7, t7, 1, 4);
    return fin(pre) && fin(post) && fin(pre7) && fin(post7) ? { r: (post / pre) / (post7 / pre7), pre: pre / pre7 - 1, post: post / post7 - 1 } : null; };
  const rows = [];
  let lastT = 0;
  for (const p of pubs) {
    const tms = Date.parse(p.t); if (tms - lastT < 2 * 3600e3) { lastT = tms; continue; } lastT = tms;
    const day = p.t.slice(0, 10), ms = Date.parse(p.t) - Date.parse(day + "T00:00:00Z"), snap = Math.floor(ms / 1800e3) * 1800e3;
    const s = stat(day, snap); if (!s) continue;
    const base = range("2026-09-05", "2026-09-18").filter(d => !pubDays.has(d)).map(d => stat(d, snap)).filter(Boolean).map(x => Math.log(x.r));
    const z = (Math.log(s.r) - avg(base)) / sd(base);
    rows.push([`v${p.v}`, p.t.slice(5, 16).replace("T", " "), fd(s.pre), fd(s.post), fd(s.r - 1), String(base.length), fd(Math.exp(avg(base)) - 1), fz(z)]);
  }
  T("ccu", "Concurrents around each publish, against ordinary days at the same clock time",
    ["Build", "Published (UTC)", "2h before vs −7d", "+1h→+4h vs −7d", "After ÷ before, vs −7d", "Ordinary days", "Same statistic, ordinary days (mean)", "z"], rows, [2, 3, 4, 5, 6, 7],
    "Half-hour peak CCU. The publish half-hour itself (server restarts double-count players) is skipped, and a publish less than 2h after the previous one (v690, v692) is folded into it. The ordinary-day column runs the identical calculation at the same clock time on every non-publish day 09-05 → 09-18.",
    "Explore `PeakConcurrentPlayers` HALF_HOUR (final and in-progress buckets dropped); publish times from `place-versions.csv`.");
}

// ================================================================ RETENTION
function effectTable(section, title, metricSplit, dauSplit, labels, note) {
  const d1 = L.byBreakdown(ID, "ForwardD1Retention", metricSplit.dim);
  const dauS = D.splits[dauSplit];
  const ex = D.explore.specs.find(s => s.metric === "DailyActiveUsers" && s.breakdown === "IsNewUser").segments;
  const newShare = d => { const n = ex.New.run[d], r = ex.Returning.run[d]; return fin(n) && fin(r) ? n / (n + r) : null; };
  const rows = [];
  for (const lbl of labels) {
    const m = d1.get(lbl); if (!m) continue;
    const p = paired(m, POST, PRE); if (!p.n) continue;
    // own volatility: w/w paired differences on days 08-22 → 09-11 (all before the POST window)
    const hist = range("2026-08-22", "2026-09-11").map(d => [m.get(addDays(d, -7)), m.get(d)]).filter(([a, b]) => fin(a) && fin(b)).map(([a, b]) => b - a);
    const zOwn = avg(p.diffs) / (sd(hist) / Math.sqrt(p.n));
    // binomial floor: n per day ≈ DAU of that segment × new-user share of the day (new users by segment are not held)
    const dauRunS = dauS && dauS[lbl] && dauS[lbl].run;
    const v = (days) => sum(days.map(d => { const q = m.get(d), n = dauRunS && dauRunS[d] && newShare(d) ? dauRunS[d] * newShare(d) : null; return fin(q) && fin(n) ? q * (1 - q) / n : 0; })) / days.length ** 2;
    const se = Math.sqrt(v(p.pairs.map(x => x[0])) + v(p.pairs.map(x => x[1])));
    const zBin = se > 0 ? (p.after - p.before) / se : null;
    rows.push([lbl, fi(dauS && dauS[lbl] ? dauS[lbl].after : null), fp(p.before, 2), fp(p.after, 2), fd(p.delta), fpp((p.after - p.before) * 100, 2), fpp(sd(hist) * 100, 2), fz(zOwn), fin(zBin) ? fz(zBin) : "—"]);
  }
  T(section, title, [metricSplit.dim === "Platform" ? "Platform" : "Source", "DAU after", "D1 before", "D1 after", "Effect (relative)", "Δ pp", "Own w/w sd", "z vs own sd", "z vs binomial"], rows, [1, 2, 3, 4, 5, 6, 7, 8], note,
    `\`ForwardD1Retention\` by \`${metricSplit.dim}\` (corpus, ONE_DAY), 5 paired weekdays. Own sd = sd of same-weekday differences on 08-22→09-11; z vs own sd = mean paired Δ ÷ (sd ÷ √5). Binomial floor uses n ≈ segment DAU × that day's new-user share (Explore), because new users by segment are not held — an approximation.`);
}
effectTable("retention", "D1 by acquisition source: effect size and confidence kept apart", { dim: "AcquisitionSource" }, "dauBySource", ["HomeRecommendation", "Others", "Friends", "Search"],
  "`Friends` arrive by invitation and never see the thumbnail; `Search` looked the game up by name. Relative change is the effect size; the two z columns are confidence and grow with volume.");
effectTable("retention", "D1 by platform: each platform against its own previous week", { dim: "Platform" }, "dauByPlatform", ["Phone", "Tablet", "Computer", "Console", "VR", "TV"],
  "Levels differ across platforms (different players choose each device); only the within-platform change is read. VR and TV carry a few hundred and a few dozen players a day.");
{
  const d1 = run("ForwardD1Retention"), d7 = run("ForwardD7Retention");
  const rows = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"].map((wd, i) => {
    const a = addDays("2026-08-29", i), b = addDays(a, 7), c = addDays(a, 14);
    return [wd, `${a.slice(5)} · ${fp(d1[a], 1)}`, `${b.slice(5)} · ${fp(d1[b], 1)}`, `${c.slice(5)} · ${fp(d1[c], 1)}`, fin(d1[b]) && fin(d1[c]) ? fd(d1[c] / d1[b] - 1) : "—", fp(d7[a], 2), fp(d7[b], 2)];
  });
  T("retention", "D1 and D7 by cohort day, three weeks side by side", ["Weekday", "Week of 29 Aug", "Week of 5 Sep", "Week of 12 Sep", "Δ last column vs middle", "D7, week of 29 Aug", "D7, week of 5 Sep"], rows, [4, 5, 6],
    "Mon 07 Sep is Labor Day (US/Canada); the Mon 14 Sep comparison is against a holiday cohort. D1 for 17 Sep onward and D7 for 11 Sep onward are not served yet.",
    "`ForwardD1Retention`, `ForwardD7Retention` headline ONE_DAY, settled points.");
}

// ================================================================ ENGAGEMENT
// raw-bundle window aggregates (funnels at NONE + session-end buckets)
const RAW = path.join(ROOT, "data/raw"); const WA = {}; const SB = {};
for (const f of fs.readdirSync(RAW).filter(f => f.startsWith(ID + "-") && f.endsWith(".json"))) {
  let j; try { j = JSON.parse(fs.readFileSync(path.join(RAW, f), "utf8")); } catch { continue; }
  const caps = Array.isArray(j) ? j : Object.values(j);
  for (const c of caps) { if (!c || !c.reqBody) continue; let q; try { q = JSON.parse(c.reqBody).query; } catch { continue; } if (!q || q.granularity !== "METRIC_GRANULARITY_NONE") continue;
    const vals = c.body && c.body.operation && c.body.operation.queryResult && c.body.operation.queryResult.values; if (!vals) continue;
    const win = q.startTime.slice(0, 10) + "→" + q.endTime.slice(0, 10), fl = q.filter || [], bd = (q.breakdown || []).flatMap(b => b.dimensions || []);
    if (q.metric === "FunnelUserTotalCount" && fl.length === 1 && fl[0].dimension === "FunnelName" && fl[0].values.length === 1 && bd.join() === "FunnelStep")
      for (const v of vals) { const b = v.breakdownValue[0], dp = v.dataPoints[0]; if (dp) ((WA[win] ||= {})[fl[0].values[0]] ||= {})[b.displayValue || b.value] = dp.value; }
    if (q.metric === "TotalSessionsEndedInBucket" && !fl.length && bd.join() === "SessionTimeBucket")
      for (const v of vals) { const b = +v.breakdownValue[0].value, dp = v.dataPoints[0]; if (dp) (SB[win] ||= {})[b] = dp.value; } }
}
const WINS = ["2026-09-01→2026-09-05", "2026-09-05→2026-09-08", "2026-09-06→2026-09-10", "2026-09-03→2026-09-20", "2026-09-16→2026-09-20"];
const winLabel = w => { const [a, b] = w.split("→"); return `${a.slice(5)} → ${addDays(b, -1).slice(5)}${b === "2026-09-20" ? " (19th partial)" : ""}`; };
{
  const rows = WINS.filter(w => SB[w]).map(w => { const o = SB[w]; const tot = sum(Object.values(o)); const lt = t => sum(Object.entries(o).filter(([k]) => +k < t).map(([, v]) => v)) / tot;
    return [winLabel(w), fi(tot), fp(lt(60), 1), fp(lt(180), 1), fp(lt(600), 1), fp(1 - lt(1800), 1)]; });
  T("engagement", "How long sessions last, by query window", ["Window", "Sessions ended", "< 1 min", "< 3 min", "< 10 min", "≥ 30 min"], rows, [1, 2, 3, 4, 5],
    "Window aggregates, not daily. The 16→19 Sep window includes the partial 19th, whose newest sessions are still running and cannot have ended long.",
    "`TotalSessionsEndedInBucket` by `SessionTimeBucket` at NONE, window taken from each raw capture's request body (`data/raw/10565445771-*.json`).");
}
{
  const ex = D.explore.specs.find(s => s.metric === "AveragePlayTimeMinutesPerDAU" && s.breakdown === "IsNewUser").segments;
  const sl = D.explore.specs.find(s => s.metric === "AverageSessionLengthMinutes" && s.breakdown === "IsNewUser").segments;
  const rows = ["New", "Returning"].map(k => [k, fn(ex[k].prior ? ex[k].before / (1 + (ex[k].prior.delta || 0)) : null), fn(ex[k].before), fn(ex[k].after), fd(ex[k].prior && ex[k].prior.delta), fd(ex[k].delta), fn(sl[k].before), fn(sl[k].after), fd(sl[k].delta)]);
  T("engagement", "Playtime per player and session length, new vs returning", ["Segment", "Play min/DAU Aug 29→Sep 2", "Sep 5→9", "Sep 12→16", "Δ week before", "Δ this week", "Session min before", "Session min after", "Δ session"], rows, [1, 2, 3, 4, 5, 6, 7, 8],
    "Splitting by new vs returning removes the mix effect from the headline. The first column is back-computed from the week-before change.",
    "Explore `AveragePlayTimeMinutesPerDAU` and `AverageSessionLengthMinutes` by `IsNewUser`, paired weekday means.");
}

// ================================================================ MONEY
{
  // Portfolio payer-CVR step on Tue 09-08
  const games = ["verity", "brainrot", "waterslide", "monkey", "seal"];
  const cv = (g, d) => G[g].metrics.find(m => m.metric === "PayingUsersCVR").run[d], ar = (g, d) => G[g].metrics.find(m => m.metric === "AverageRevenuePerUser").run[d];
  const pub0908 = g => G[g].placeVersions.filter(v => v.published && v.d === "2026-09-08" && (g !== "waterslide" || v.place === G[g].root)).map(v => "v" + v.v).join(", ") || "none";
  const rows = games.map(g => [G[g].name.split(" [")[0].replace("+1 ", ""), fd(cv(g, "2026-09-01") / cv(g, "2026-08-31") - 1), fd(cv(g, "2026-09-08") / cv(g, "2026-09-07") - 1), fd(cv(g, "2026-09-15") / cv(g, "2026-09-14") - 1),
    fd(ar(g, "2026-09-08") / ar(g, "2026-09-07") - 1), pub0908(g)]);
  T("money", "Payer conversion fell on Tuesday 8 Sep on all five games", ["Game", "`PayingUsersCVR` Mon 31 Aug → Tue 1 Sep", "Mon 7 → Tue 8 Sep", "Mon 14 → Tue 15 Sep", "`AverageRevenuePerUser` Mon 7 → Tue 8 Sep", "Root-place publish on 8 Sep"], rows, [1, 2, 3, 4],
    "The same Monday→Tuesday step, three weeks running. It rose on every game the first week and fell on every game on 7→8 Sep, the day after the US/Canada Labor Day holiday. Only Verity published that day.",
    "`PayingUsersCVR`, `AverageRevenuePerUser` headline ONE_DAY for each universe (reports/2026-09-19/data/<slug>.json); publishes from each `place-versions.csv`.");
}
{
  // CVR indexed to each game's own week of 29 Aug (same weekday)
  const games = ["verity", "brainrot", "waterslide", "monkey", "seal"];
  const cv = (g, d) => G[g].metrics.find(m => m.metric === "PayingUsersCVR").run[d];
  const rows = range("2026-09-05", "2026-09-17").map(d => { const base = addDays("2026-08-29", ((new Date(d + "T00:00:00Z").getUTCDay() + 1) % 7));
    const idx = games.map(g => fin(cv(g, d)) && fin(cv(g, base)) ? cv(g, d) / cv(g, base) : null);
    const others = idx.slice(1).filter(fin).sort((a, b) => a - b); const med = others.length ? (others[1] + others[2]) / 2 : null;
    return [`${DOW(d)} ${d.slice(5)}`, ...idx.map(x => fin(x) ? fn(x, 2) : "—"), fin(med) ? fn(med, 2) : "—", fin(idx[0]) && fin(med) ? fd(idx[0] / med - 1) : "—"]; });
  T("money", "Payer conversion as a multiple of each game's own week of 29 Aug", ["Day", "Verity", "Brainrot", "Waterslide", "Monkey", "Seal", "Median of the other four", "Verity vs that median"], rows, [1, 2, 3, 4, 5, 6, 7],
    "1.00 = the same weekday in the week of 29 Aug (29 Aug → 4 Sep). Verity ran well above the other four from 5 to 7 Sep (the week after v684), fell with them on 8 Sep, and sits near them from 12 Sep.",
    "`PayingUsersCVR` headline ONE_DAY per game; each day divided by the same weekday of 29 Aug → 4 Sep; median of Brainrot, Waterslide, Monkey, Seal.");
}
{
  // Matched-DAU payer comparison
  const pay = run("PayingUsers"), cvr = run("PayingUsersCVR"), arppu = run("AverageRevenuePerPayingUser");
  const era = d => d < "2026-09-04" ? "before v684" : d < "2026-09-08" ? "v684 / v688" : d < "2026-09-11" ? "v689 → v692" : d < "2026-09-15" ? "v693" : "v695";
  const pick = ["2026-09-02", "2026-09-07", "2026-09-12", "2026-08-31", "2026-09-06", "2026-09-08", "2026-09-13", "2026-09-15", "2026-09-09", "2026-09-11", "2026-09-10", "2026-09-14"];
  const rows = pick.map(d => [`${DOW(d)} ${d.slice(5)}`, era(d), fi(dauRun[d]), fi(pay[d]), fp(cvr[d], 3), fn(arppu[d], 1)]);
  T("money", "Payers at matched audience size", ["Day", "Build live", "DAU", "Paying users", "Payer CVR", "ARPPU (R$)"], rows, [2, 3, 4, 5],
    "Grouped by similar DAU: ~317K (rows 1–3), ~360–440K (4–5), ~200–240K (6–8), ~160–200K (9–12). Weekdays differ within each group, so read each group as a range, not a paired test.",
    "`DailyActiveUsers`, `PayingUsers`, `PayingUsersCVR`, `AverageRevenuePerPayingUser` headline ONE_DAY.");
}
{
  // Product type per DAU by build era
  const rs = D.splits.revenueBySource;
  const eras = [["Aug 29 → Sep 3 (before v684)", range("2026-08-29", "2026-09-03")], ["Sep 4 → 7 (v684 / v688)", range("2026-09-04", "2026-09-07")], ["Sep 8 → 10 (v689 → v692)", range("2026-09-08", "2026-09-10")],
    ["Sep 11 → 14 (v693)", range("2026-09-11", "2026-09-14")], ["Sep 15 → 17 (v695)", range("2026-09-15", "2026-09-17")]];
  const rows = eras.map(([lbl, ds]) => { const ok = ds.filter(d => fin(dauRun[d]) && fin(rs.DevProduct.run[d]) && fin(rs.GamePass.run[d]));
    const U = sum(ok.map(d => dauRun[d])), dp = sum(ok.map(d => rs.DevProduct.run[d])), gp = sum(ok.map(d => rs.GamePass.run[d]));
    return [lbl, String(ok.length), fn(dp / U, 3), fn(gp / U, 3), fp(gp / (dp + gp), 1)]; });
  T("money", "Developer-product and game-pass revenue per player, by build era", ["Era", "Days", "DevProduct R$ per DAU", "GamePass R$ per DAU", "GamePass share"], rows, [1, 2, 3, 4],
    "Both product types rose after v684 and both fell from 8 Sep. Which items are passes and which are products is not held, so this cannot isolate message packs from personalities.",
    "`DailyRevenue` by `RevenueSource` (DevProduct, GamePass) ONE_DAY, summed per era and divided by summed `DailyActiveUsers`. Eras are calendar days, not weekday-matched.");
  // weekday-paired version
  const per = src => Object.fromEntries(Object.keys(rs[src].run).map(d => [d, fin(rs[src].run[d]) && fin(dauRun[d]) ? rs[src].run[d] / dauRun[d] : null]));
  const rows2 = ["DevProduct", "GamePass"].map(src => { const m = per(src); const a = paired(m, PRE, PRIOR), b = paired(m, POST, PRE), c = paired(m, POST, PRIOR);
    return [src, fn(a.before, 3), fn(a.after, 3), fn(b.after, 3), fd(a.delta), fd(b.delta), fd(c.delta)]; });
  T("money", "Revenue per player by product type, weekday-paired", ["Product type", "R$/DAU Aug 29→Sep 2", "Sep 5→9", "Sep 12→16", "Δ week before", "Δ this week", "Δ vs Aug 29→Sep 2"], rows2, [1, 2, 3, 4, 5, 6],
    "Same five weekdays in each week. The last column compares this week with the week before v684 shipped.",
    "`DailyRevenue` by `RevenueSource` ÷ headline `DailyActiveUsers`, per day, paired weekday means (5/5).");
}
{
  // MessagePack funnel as window aggregates (users), from raw bundles
  const rows = WINS.filter(w => WA[w] && WA[w].MessagePack && WA[w].Session).map(w => { const S = WA[w].Session, MP = WA[w].MessagePack, NB = WA[w].Notebook || {}, MS = WA[w].Messages || {};
    const J = S.Joined, R = MP["Ran Out"], Pr = MP["Prompt Opened"], B = MP.Purchased;
    return [winLabel(w), fi(J), fp(R / J, 1), fp(Pr / R, 1), fp(B / Pr, 1), fp(B / R, 2), fn(B / J * 100, 2), fin(MS["50 Sent"]) && fin(MS["1 Sent"]) ? fp(MS["50 Sent"] / MS["1 Sent"], 1) : "—", fin(NB.Purchased) ? fn(NB.Purchased / J * 100, 3) : "—"]; });
  T("money", "Running out of messages, and buying more, by query window", ["Window", "Players in `Session` funnel", "Ran out ÷ players", "Opened pack prompt ÷ ran out", "Bought ÷ opened prompt", "Bought ÷ ran out", "Pack buyers per 100 players", "Reached 50 sent ÷ sent 1", "Notebook buyers per 100 players"], rows, [1, 2, 3, 4, 5, 6, 7, 8],
    "Unique users per funnel step over each query window. The 5→7 Sep window is entirely before v689 (8 Sep); 6→9 Sep holds two v689 days; 16→19 Sep is after v693 and v695. Window lengths and weekday mix differ.",
    "`FunnelUserTotalCount` at NONE with one `FunnelName` filter and `FunnelStep` breakdown, from the request bodies in `data/raw/10565445771-*.json` (windows are the queries' own startTime→endTime).");
}
{
  const c = run("PayingUsersCVR"), pay = run("PayingUsers");
  const mp = D.funnels.find(f => f.name === "MessagePack").steps; const pr = mp.find(s => s.step === "Prompt Opened").run, bu = mp.find(s => s.step === "Purchased").run;
  const rows = range("2026-08-29", "2026-09-18").map(d => [`${DOW(d)} ${d.slice(5)}`, fi(pay[d]), fp(c[d], 3), fp(pr[d], 1), fp(bu[d], 2), fin(pr[d]) && fin(bu[d]) ? fp(bu[d] / pr[d], 1) : "—"]);
  T("money", "Daily payer conversion beside the message-pack funnel", ["Cohort day", "Paying users", "Payer CVR", "Pack prompt opened (of ran out)", "Pack bought (of ran out)", "Bought ÷ prompt"], rows, [1, 2, 3, 4, 5],
    "Payer CVR counts every purchase (packs, personalities, passes); the pack funnel counts only players who ran out of messages. First-read cohort values.",
    "`PayingUsers`, `PayingUsersCVR` headline ONE_DAY; `FunnelCohortCompletionRate` `FunnelName=MessagePack` ONE_DAY.");
}

// ================================================================ FUNNELS
// capture age per cohort day (first read, as used everywhere on this page)
const FCSV = csvParse(fs.readFileSync(path.join(ROOT, "data/games", ID, "metrics/FunnelCohortCompletionRate.csv"), "utf8"));
const capAt = {}; for (const r of FCSV.slice(1)) { if (r[2] !== "METRIC_GRANULARITY_ONE_DAY") continue; if (r[3] === "FunnelStep: Ran Out · FunnelName=MessagePack" || r[3] === "FunnelStep: Day 3 Reached · FunnelName=FUNNEL_TYPE_ONBOARDING") capAt[r[0]] = r[6]; }
const age = d => capAt[d] ? (Date.parse(capAt[d]) - Date.parse(addDays(d, 1) + "T00:00:00Z")) / 864e5 : null;
{
  const rows = POST.map((d, i) => [`${DOW(PRE[i])} ${PRE[i].slice(5)}`, (capAt[PRE[i]] || "").slice(5, 16).replace("T", " "), fn(age(PRE[i]), 1), `${DOW(d)} ${d.slice(5)}`, (capAt[d] || "").slice(5, 16).replace("T", " "), fn(age(d), 1)]);
  rows.push(["**Mean**", "", fn(avg(PRE.map(age).filter(fin)), 1), "", "", fn(avg(POST.map(age).filter(fin)), 1)]);
  T("funnels", "How old each cohort was when it was first read", ["PRE cohort", "First read (UTC)", "Age (days after the cohort day ended)", "POST cohort", "First read (UTC)", "Age"], rows, [2, 5],
    "The corpus keeps the first read of each cohort day. The POST cohorts were read older than the PRE ones, so any upward drift from maturing favours POST: a step that still reads lower in POST is not a maturity artefact.",
    "`captured_at` column of `data/games/10565445771/metrics/FunnelCohortCompletionRate.csv` (ONE_DAY rows).");
}
// same-capture read: the 09-19 09:03 grab re-served 09-03 → 09-18. data-quality.md lists every re-served value >1% from the kept one.
const DQ = {}; {
  const txt = fs.readFileSync(path.join(ROOT, "data/games", ID, "data-quality.md"), "utf8");
  for (const line of txt.split("\n")) { const m = line.match(/^\| revision \| FunnelCohortCompletionRate \| FunnelStep: (.+?) · FunnelName=(\S+) \| (\d{4}-\d\d-\d\d)T.*?re-served as ([\d.eE-]+) \(captured 2026-09-19/);
    if (m) ((DQ[m[2]] ||= {})[m[1]] ||= {})[m[3]] = +m[4]; }
}
{
  const rows = [];
  for (const f of D.funnels) for (const s of f.steps) { if (s.key === "1") continue;
    const first = paired(s.run, POST, PRE);
    const latest = Object.fromEntries(Object.entries(s.run).map(([d, v]) => [d, (DQ[f.name] && DQ[f.name][s.step] && fin(DQ[f.name][s.step][d])) ? DQ[f.name][s.step][d] : v]));
    const same = paired(latest, POST, PRE);
    const a = (first.after - first.before) * 100, b = (same.after - same.before) * 100;
    if (Math.abs(a) < 0.5 && Math.abs(b) < 0.5) continue;
    rows.push([f.name, s.step, fp(first.before, 1), fp(first.after, 1), fpp(a), fp(same.before, 1), fp(same.after, 1), fpp(b), Math.sign(a) === Math.sign(b) ? "same" : "flips"]);
  }
  T("funnels", "Every step that moved by half a point or more, under two reads of the same cohorts",
    ["Funnel", "Step", "Before (first read)", "After (first read)", "Δ first read", "Before (09-19 read)", "After (09-19 read)", "Δ 09-19 read", "Direction"], rows, [2, 3, 4, 5, 6, 7],
    "First read: each cohort as first captured (POST older at capture, favouring POST). 09-19 read: every cohort as served by one grab on 19 Sep 09:03 (PRE a week older, favouring PRE). A move that points the same way under both is not a maturity artefact.",
    "`FunnelCohortCompletionRate` ONE_DAY per FunnelName; 09-19 values from the `revision` rows of `data-quality.md` (points re-served within 1% keep the first read).");
}
{
  // step-to-step conditional conversion
  const rows = [];
  for (const f of D.funnels) { const st = f.steps.slice().sort((a, b) => +a.key - +b.key);
    for (let i = 1; i < st.length; i++) { const cond = Object.fromEntries(Object.keys(st[i].run).map(d => [d, fin(st[i].run[d]) && fin(st[i - 1].run[d]) && st[i - 1].run[d] > 0 ? st[i].run[d] / st[i - 1].run[d] : null]));
      const p = paired(cond, POST, PRE), p0 = paired(cond, PRE, PRIOR);
      rows.push([f.name, `${st[i - 1].step} → ${st[i].step}`, fp(p.before, 1), fp(p.after, 1), fpp((p.after - p.before) * 100), fpp((p0.after - p0.before) * 100)]); } }
  T("funnels", "Step-to-step conversion (share of players at the previous step who reach the next)", ["Funnel", "Transition", "Before", "After", "Δ this week", "Δ week before"], rows, [2, 3, 4, 5],
    "Cumulative step rates compound; this table isolates each hand-off. First-read cohort values.",
    "`FunnelCohortCompletionRate` ONE_DAY; conditional = step rate ÷ previous step rate per cohort day, paired weekday means.");
}
{
  const f = n => D.funnels.find(x => x.name === n);
  const cols = [["EndingOthers", "Wall Reached"], ["EndingOthers", "Completed"], ["Ending", "Hold Started"], ["Ending", "Completed"], ["FUNNEL_TYPE_ONBOARDING", "Ending Completed"], ["Session", "5 Minutes"], ["Session", "10 Minutes"], ["Messages", "50 Sent"]];
  const get = (n, s) => f(n).steps.find(x => x.step === s).run;
  const rows = range("2026-09-05", "2026-09-18").map(d => [`${DOW(d)} ${d.slice(5)}${d === "2026-09-11" ? " (v693 15:55)" : d === "2026-09-15" ? " (v695 13:13)" : d === "2026-09-18" ? " (v696 14:38)" : d === "2026-09-08" ? " (v689 10:07)" : ""}`, ...cols.map(([n, s]) => fp(get(n, s)[d], 1))]);
  const mean = (n, s, ds) => avg(ds.map(d => get(n, s)[d]).filter(fin));
  rows.push(["**Mean 5 → 10 Sep**", ...cols.map(([n, s]) => fp(mean(n, s, range("2026-09-05", "2026-09-10")), 1))]);
  rows.push(["**Mean 12 → 16 Sep**", ...cols.map(([n, s]) => fp(mean(n, s, range("2026-09-12", "2026-09-16")), 1))]);
  T("funnels", "Ending, session and message steps by cohort day, around the 11 Sep publish", ["Cohort day", "EndingOthers: Wall Reached", "EndingOthers: Completed", "Ending: Hold Started", "Ending: Completed", "Onboarding: Ending Completed", "Session: 5 Minutes", "Session: 10 Minutes", "Messages: 50 Sent"], rows, [1, 2, 3, 4, 5, 6, 7, 8],
    "Each column is one FunnelName's cumulative completion rate for players who started that day. The means are calendar-day means (not weekday-paired). From 17 Sep the v695 servers log `AnalyticsService: You have sent too many events`, so funnel events on those servers may be dropped.",
    "`FunnelCohortCompletionRate` ONE_DAY, first-read cohort values.");
}
{
  const rows = WINS.filter(w => WA[w] && WA[w].Session).map(w => { const A = WA[w], J = A.Session.Joined; const e = (n, s) => A[n] && fin(A[n][s]) ? fn(A[n][s] / J * 100, 1) : "—";
    return [winLabel(w), fi(J), e("FUNNEL_TYPE_ONBOARDING", "Joined"), e("Messages", "1 Sent"), e("Conversation", "Submitted"), e("FollowMe", "Asked"), e("Ending", "Box Appeared"), e("EndingOthers", "Wall Armed"), e("Notebook", "Opened"), e("MessagePack", "Ran Out")]; });
  T("funnels", "Players entering each funnel per 100 players in the Session funnel, by query window", ["Window", "Session players", "Onboarding", "Messages", "Conversation", "FollowMe", "Ending", "EndingOthers", "Notebook", "MessagePack"], rows, [1, 2, 3, 4, 5, 6, 7, 8, 9],
    "Entry to each funnel = its first step's unique users. Onboarding entry approximates the share of players who are new in the window.",
    "`FunnelUserTotalCount` at NONE per FunnelName, windows from the raw request bodies.");
}

// ================================================================ TECHNICAL
{
  const ks = [["ClientCrashRate15m", "Client crash rate (15m)", v => fp(v, 3)], ["ClientFpsP10", "Client FPS p10", v => fn(v, 2)], ["ClientFpsAvg", "Client FPS avg", v => fn(v, 2)],
    ["ClientMemoryUsagePercentageAvg", "Client memory %", v => fp(v, 1)], ["ClientCpuTimeAvg", "Client CPU ms/frame", v => fn(v, 2)], ["ServerFrameRateP10", "Server frame rate p10", v => fn(v, 2)],
    ["OomUnexpectedExits/DAU", "OOM exits per 1k DAU", v => fn(v, 3)], ["ClientCrashCount/DAU", "Client crashes per 1k DAU", v => fn(v, 2)]];
  const med = a => { const x = a.filter(fin).sort((p, q) => p - q); return x.length ? (x.length % 2 ? x[(x.length - 1) / 2] : (x[x.length / 2 - 1] + x[x.length / 2]) / 2) : null; };
  const rows = ks.map(([k, lbl, f]) => { const r = run(k); const a = paired(r, POST, PRE), b = paired(r, POST, PRE, [3]);
    const mb = med(PRE.map(d => r[d])), ma = med(POST.map(d => r[d]));
    return [lbl, f(a.before), f(a.after), fd(a.delta), f(b.before), f(b.after), fd(b.delta), f(mb), f(ma), fd(ma / mb - 1)]; });
  T("technical", "Technical rates with the 8 Sep telemetry fault taken out", ["Metric", "Before (5 pairs)", "After (5 pairs)", "Δ (5 pairs)", "Before (4 pairs)", "After (4 pairs)", "Δ (8/15 Sep pair dropped)", "Median before", "Median after", "Δ median"], rows, [1, 2, 3, 4, 5, 6, 7, 8, 9],
    "On 8 Sep Roblox served a collapsed client FPS and memory reading on all five games (F28), and the corpus keeps that first read. Dropping the Tue 8 / Tue 15 Sep pair removes it; FPS and memory then read flat. Client CPU has two outlying days of its own (4.2 ms on 15 Sep, 17.2 ms on 16 Sep, against 6.9–9.0 on every other day since 29 Aug), so read its median.",
    "Headline ONE_DAY (Place-filtered) series; per-1k-DAU rows from build.js derived series; F28 in `DIAGNOSIS_LOG.md` 2026-09-09.");
}
{
  const c = run("ClientCrashRate15m");
  const rows = range("2026-08-29", "2026-09-18").map(d => [`${DOW(d)} ${d.slice(5)}`, fp(c[d], 3), fp(c[addDays(d, -7)], 3), fin(c[d]) && fin(c[addDays(d, -7)]) ? fd(c[d] / c[addDays(d, -7)] - 1) : "—", fi(run("ClientCrashCount")[d]), fi(dauRun[d])]);
  T("technical", "Client crash rate by day", ["Day", "Crash rate", "Same weekday −7d", "Δ", "Client crashes", "DAU"], rows, [1, 2, 3, 4, 5],
    "Crash rate = crashes ÷ ended sessions. The step up is dated 10 Sep (v692 live, before v693), and 18 Sep returns to the August level.",
    "`ClientCrashRate15m`, `ClientCrashCount` headline ONE_DAY; `DailyActiveUsers`.");
}

// ================================================================ ERRORS
{
  const lb = L.byBreakdown(ID, "ErrorCount", "LogSource");
  const rows = [];
  for (const src of ["Client", "Server"]) { const m = lb.get(src); const pd = new Map([...m].filter(([d]) => fin(dauRun[d])).map(([d, v]) => [d, v / dauRun[d]]));
    const a = paired(pd, POST, PRE), b = paired(pd, PRE, PRIOR), c = paired(m, POST, PRE);
    rows.push([src, fn(b.before, 2), fn(a.before, 2), fn(a.after, 2), fd(b.delta), fd(a.delta), `${a.n}/5`, fi(c.after)]); }
  T("errors", "Errors per player, client vs server", ["Log source", "Per DAU Aug 29→Sep 2", "Per DAU Sep 5→9", "Per DAU Sep 12→16", "Δ week before", "Δ this week", "Pairs", "Errors per day after"], rows, [1, 2, 3, 4, 5, 6, 7],
    "Per DAU: raw volume follows the audience. 8 Sep has no settled ErrorCount point, so its pair drops out. The unit of `ErrorCount` (occurrence, player or server) is not documented.",
    "`ErrorCount` by `LogSource`, ONE_DAY (corpus), divided by headline `DailyActiveUsers`, paired weekday means.");
}
{
  const dauS = sum(range("2026-09-12", "2026-09-17").map(d => dauRun[d]));
  const conv = D.funnels.find(f => f.name === "Conversation").steps.find(s => s.step === "Delivered");
  const cDel = paired(conv.run, POST, PRE);
  const msgs = D.funnels.find(f => f.name === "Messages").steps.find(s => s.step === "5 Sent"); const m5 = paired(msgs.run, POST, PRE);
  const sess = M("AverageSessionLengthMinutes").cur, d1 = run("ForwardD1Retention");
  const eo = D.funnels.find(f => f.name === "EndingOthers").steps.find(s => s.step === "Completed"); const eoP = paired(eo.run, POST, PRE);
  const mp = D.funnels.find(f => f.name === "MessagePack").steps.find(s => s.step === "Purchased"); const mpP = paired(mp.run, POST, PRE);
  const votes = run("PlayerFeedbackVotesCount");
  const per1k = n => fn(n / dauS * 1000, 2);
  const rows = [
    ["`AnalyticsService: You have sent too many events.`", "v695", "Server", fi(exSum(F695, /^AnalyticsService: You have sent too many events/)), per1k(exSum(F695, /^AnalyticsService: You have sent too many events/)), "Custom analytics / funnel event logging", "Funnel event counts on and after 17 Sep", "first seen 17 Sep, after the POST window — funnel cohorts from 17 Sep may undercount"],
    ["AI reply retries: `Model repeated its own previous line` (attempts 1+2), `Model returned no usable dialogue`, `Reply was cut at max_tokens`, `Model echoed the player's message`", "v693", "Server", fi(exSum(F693, /^Model repeated|^Model returned no usable|^Reply was cut|^Model echoed/)), per1k(exSum(F693, /^Model repeated|^Model returned no usable|^Reply was cut|^Model echoed/)), "The conversation itself (every message)", "`Conversation` Submitted→Delivered; `Messages` 5 Sent; session length", `Delivered ${fp(cDel.before, 1)} → ${fp(cDel.after, 1)}; 5 Sent ${fp(m5.before, 1)} → ${fp(m5.after, 1)}; session ${fd(sess.delta)}`],
    ["`DeepInfra network failure (attempt 1)`", "v693", "Server", fi(exSum(F693, /^DeepInfra network failure/)), per1k(exSum(F693, /^DeepInfra network failure/)), "AI backend reachability", "same as above", "same as above"],
    ["`ProfileStore DataStore API error: 502 … Access forbidden`", "v695", "Server", fi(exSum(F695, /^ProfileStore DataStore API error: 502.*Access forbidden/)), per1k(exSum(F695, /^ProfileStore DataStore API error: 502.*Access forbidden/)), "Player save / load", "D1 of v695 cohorts (16 Sep onward)", `16 Sep D1 ${fp(d1["2026-09-16"], 1)} vs 9 Sep ${fp(d1["2026-09-09"], 1)} (one day)`],
    ["`[LikeReward] Player:IsInGroup failed because HTTP unknown error` (5 variants)", "v693", "Client", fi(exSum(F693, /^\[LikeReward\]/)), per1k(exSum(F693, /^\[LikeReward\]/)), "Like + group reward claim", "`PlayerFeedbackVotesCount`; reviews asking for the gift", `votes (up − down) per day: ${fi(avg(range("2026-09-04", "2026-09-10").map(d => votes[d])))} (4→10 Sep) → ${fi(avg(range("2026-09-12", "2026-09-18").map(d => votes[d])))} (12→18 Sep)`],
    ["`Ending rejoin failed: Not allowed`, `TeleportService:Not allowed`, teleport during shutdown", "v695", "Server", fi(exSum(F695, /^Ending rejoin failed|^TeleportService:Not allowed|^TeleportService:Teleport is not allowed/)), per1k(exSum(F695, /^Ending rejoin failed|^TeleportService:Not allowed|^TeleportService:Teleport is not allowed/)), "Teleport after an ending", "`EndingOthers` Completed", `${fp(eoP.before, 1)} → ${fp(eoP.after, 1)}`],
    ["`Badge … ownership check failed`", "v695", "Server", fi(exSum(F695, /^Badge .* ownership check failed/)), per1k(exSum(F695, /^Badge .* ownership check failed/)), "Badges", "none", "—"],
    ["`Unsupported Luau version requested`", "v695", "Server", fi(exSum(F695, /^Error while sending.*Unsupported Luau version/)), per1k(exSum(F695, /^Error while sending.*Unsupported Luau version/)), "Engine messaging (RCC 739 landed 14–15 Sep)", "none", "—"],
    ["`Not running script because past shutdown deadline`", "v693", "Client", fi(exSum(F693, /^Not running script because past shutdown deadline/)), per1k(exSum(F693, /^Not running script because past shutdown deadline/)), "Server shutdown on publish", "none", "—"],
    ["standing: `[MessageSpend] … infinite messages are active`", "v684", "Server", fi(exSum(FALL, /^\[MessageSpend\]/)), per1k(exSum(FALL, /^\[MessageSpend\]/)), "Message spending when unlimited messages are on", "`MessagePack` Ran Out share", "see Monetization"],
    ["standing: `[BestFriends] Shared.WorldStates.dark missing`", "v684", "Client", fi(exSum(FALL, /^\[BestFriends\]/)), per1k(exSum(FALL, /^\[BestFriends\]/)), "An ending path (best-friends)", "`EndingOthers` / `Ending` completion", `EndingOthers Completed ${fp(eoP.before, 1)} → ${fp(eoP.after, 1)}`],
    ["standing: `Monetize:PromptProductPurchase() called with prompt in progress, aborting`", "v454", "Client", fi(exSum(FALL, /^Monetize:PromptProductPurchase/)), per1k(exSum(FALL, /^Monetize:PromptProductPurchase/)), "A purchase prompt (second prompt while one is open)", "`MessagePack` Purchased", `${fp(mpP.before, 2)} → ${fp(mpP.after, 2)} of ran-out players`],
  ];
  T("errors", "New and relevant signatures, sized against the rate each one would move", ["Signature", "First seen", "Type", "Events (7-day export)", "Per 1k DAU-days", "Surface", "Rate that would move", "That rate, before → after"], rows, [3, 4],
    "Ranked by surface, not volume. Counts are floors (exports are capped at 25 rows and per-player messages split into many rows). Per-1k uses the six served DAU days 12→17 Sep; the export's 7 days reach into 18–19 Sep, so it overstates slightly.",
    "`errors_2026-09-19_0916_since-v693_7d`, `…_0917_since-v695_7d`, `…_0916_v446-v684_7d` (unfiltered) under `data/exports/10565445771-verity-companion/errors/`; rates from data/verity.json.");
}
{
  const a = EX[F0908] || [], b = EX[FALL] || []; const ta = sum(a.map(r => r.count)), tb = sum(b.map(r => r.count));
  const key = s => s.replace(/\(.*?\)|\d+/g, "").slice(0, 60);
  const top = b.slice(0, 12).map(r => { const m = a.find(x => key(x.msg) === key(r.msg)); return [`\`${r.msg.slice(0, 90)}\``, r.ver, r.type, fp(m ? m.count / ta : null, 1), fp(r.count / tb, 1)]; });
  T("errors", "Standing signatures: share of the unfiltered export, 8 Sep vs 19 Sep", ["Signature", "First seen", "Type", "Share on 8 Sep export", "Share on 19 Sep 7-day export"], top, [3, 4],
    "Shares: the two exports cover different windows. The largest two — the text-filter rejection of AI replies and the 64-track animation limit — predate every build in this report.",
    "`errors_2026-09-08_1449_v446-v688_154rows.csv` (window not recorded) and `errors_2026-09-19_0916_v446-v684_7d_129rows.csv`; share = count ÷ file total of the top-25 rows.");
}

// ================================================================ SENTIMENT
const THEMES = [
  ["Scary / creepy", /scar[eyi]|creep|terrif|nightmare|frighten|horror|miedo|asust|assust|medo|seram|น่ากลัว|무서|страш|chills/i],
  ["It knows about me (location, time, account, device)", /\b(it|he|verity|game|they|ai|bot)\b[^.?!]{0,20}\b(knows?|knew|learned)\b|location|address|where (i|we) live|my country|what country|\bdox|hack(ed|ing|s)?\b|track(ing)? (my|me)|spy|stalk|password|personal (info|life|information|data)|private info|when (i|we) (made|created|joined)|account (was )?(made|created)|what time it (is|was)|la hora|dados pessoais|area code|lo sabe|weiß wo/i],
  ["Messages: limit, waiting or paying", /(messag|meseg|mensag|mensaj|meggag|meessag|\bwords?\b|\bchats?\b|\btexts?\b)[^.?!]{0,40}(limit|infinite|unlimit|refill|cooldown|wait|pay|robux|max|cap\b)|(limit|infinite|unlimit|\binf\b|more|max|pay for|give) [^.?!]{0,20}(messag|meseg|mensag|mensaj|meggag|meessag|words|chats?|texts)|paywall|cash grab|refill|cooldown|pay to talk|l[ií]mite|limity|message (limit|cap|countdown)|coutdowm|countdown is too long/i],
  ["Blocked progression: key, gate, door, ending does not finish", /(?<!low-)\bkey\b|gate|door|locked|\block\b|stuck|can'?t (get|go) (in|past|inside)|couldn'?t get in|through the wall|into the wall|phases? into|ending (doesn'?t|does not|dont|didn'?t|wont|won'?t) work|new ending doesn|nice ending|cave|green building|mountain|llave|ключ|鑰匙|noche 5|day 5|vanish|disappear/i],
  ["Wants a reset / restart", /reset|restart|start over|reiniciar|redo|recome/i],
  ["Against AI use", /(don'?t|dont|stop|no) (use|using) ai|ai slop|\bslop\b|lazy|ai thumbnail|chatgpt|using ai|it'?s ai|and it'?s ai|\bai as well\b/i],
  ["Boring / repetitive", /boring|bored|repetit|same (words|thing|ending)|nothing to do|\bborder\b|aburr|mid\b/i],
  ["Free gift / like + group reward", /gift|reward|reword|joined the (group|community)|like and joined|they promise/i],
  ["Bug / broken (generic)", /\bbug|glitch|broken|doesn'?t work|dont work|don'?t work|won'?t work|not working|\berror\b|buttons? (wont|won'?t|don'?t|dont)/i],
  ["Performance (lag, fps, freeze, crash)", /\blag|fps|frame ?rate|freez|stutter|crash|unplayable/i],
  ["Language / translation", /spanish|español|espanol|translat|idioma|subt[ií]tulo|日本語|русском|in english|habla en ingles|language/i],
];
{
  const rows = FB.rows.filter(r => r.d >= "2026-09-04");
  const grp = r => { const v = +r.v; return v <= 680 ? "v680" : v === 684 ? "v684" : v === 688 ? "v688" : v <= 692 ? "v689–v692" : v === 693 ? "v693" : v === 695 ? "v695" : "v696"; };
  const G2 = ["v680", "v684", "v688", "v689–v692", "v693", "v695", "v696"];
  const by = Object.fromEntries(G2.map(g => [g, rows.filter(r => grp(r) === g)]));
  const out = [["Reviews", ...G2.map(g => String(by[g].length)), String(rows.length)],
    ["Downvote rate", ...G2.map(g => { const x = by[g]; const dn = x.filter(r => /down/i.test(r.cat)).length; return x.length ? fp(dn / x.length, 0) : "—"; }), fp(rows.filter(r => /down/i.test(r.cat)).length / rows.length, 0)],
    ["Dates", ...G2.map(g => by[g].length ? `${by[g][0].d.slice(5)}→${by[g].at(-1).d.slice(5)}` : "—"), "09-04→09-19"]];
  for (const [lbl, re] of THEMES) out.push([lbl, ...G2.map(g => { const x = by[g]; const k = x.filter(r => re.test(r.comment)).length; return x.length ? `${k} (${fp(k / x.length, 0)})` : "—"; }), (() => { const k = rows.filter(r => re.test(r.comment)).length; return `${k} (${fp(k / rows.length, 0)})`; })()]);
  const shortC = r => r.comment.trim().split(/\s+/).filter(Boolean).length <= 3;
  out.push(["Very short comment (3 words or fewer)", ...G2.map(g => { const x = by[g]; const k = x.filter(shortC).length; return x.length ? `${k} (${fp(k / x.length, 0)})` : "—"; }), `${rows.filter(shortC).length} (${fp(rows.filter(shortC).length / rows.length, 0)})`]);
  // downvotes only, before vs from v693 — robust to extra (rewarded) upvotes
  const downs = rows.filter(r => /down/i.test(r.cat));
  const A1 = downs.filter(r => +r.v < 693), B1 = downs.filter(r => +r.v >= 693);
  const out4 = [["Downvotes with a comment", String(A1.length), String(B1.length)]];
  for (const [lbl, re] of THEMES) { const a = A1.filter(r => re.test(r.comment)).length, b = B1.filter(r => re.test(r.comment)).length;
    out4.push([lbl, `${a} (${fp(a / A1.length, 0)})`, `${b} (${fp(b / B1.length, 0)})`]); }
  T("sentiment", "Themes among downvotes only, before and from the 11 Sep build", ["Theme", "v680 → v692 (4 → 11 Sep)", "v693 → v696 (11 → 19 Sep)"], out4, [1, 2],
    "Restricting to downvotes removes any effect of extra upvotes on the shares. Small n on the right-hand side.",
    "Same file; `category` = Downvote; build from `asset_version`.");
  T("sentiment", "What players wrote about, by the build they reviewed", ["Theme", ...G2, "All since 4 Sep"], out, [1, 2, 3, 4, 5, 6, 7, 8],
    "Every review since 4 Sep has a comment (430). A review can match several themes. Themes are keyword regexes (listed in the appendix), so they count mentions, not sentiment strength; non-English comments are only partly covered.",
    "`reports/2026-09-19/data/feedback-10565445771.json` (merged review history — `feedback.csv` is truncated by the short trailing grab); build = the review's `asset_version`.");
  // device split
  const cls = r => /Phone|Tablet/.test(r.device || "") ? "Mobile (Phone + Tablet)" : r.device === "Computer" ? "Computer" : "Other";
  const C2 = ["Mobile (Phone + Tablet)", "Computer"];
  const byC = Object.fromEntries(C2.map(c => [c, rows.filter(r => cls(r) === c)]));
  const out2 = [["Reviews", ...C2.map(c => String(byC[c].length))], ["Downvote rate", ...C2.map(c => fp(byC[c].filter(r => /down/i.test(r.cat)).length / byC[c].length, 0))]];
  for (const [lbl, re] of THEMES) out2.push([lbl, ...C2.map(c => { const k = byC[c].filter(r => re.test(r.comment)).length; return `${k} (${fp(k / byC[c].length, 0)})`; })]);
  T("sentiment", "Themes by device class, all reviews since 4 Sep", ["Theme", ...C2], out2, [1, 2],
    "Phone and Tablet are grouped as one platform class. Compare the rates within a row, not the counts.",
    "Same file; `device` column.");
  // daily reviews vs vote series
  const votes = run("PlayerFeedbackVotesCount");
  const days = range("2026-09-04", "2026-09-18");
  const out3 = days.map(d => { const b = FB.byDay[d] || { up: 0, down: 0, n: 0 }; return [`${DOW(d)} ${d.slice(5)}`, String(b.up), String(b.down), b.n ? fp(b.down / b.n, 0) : "—", fi(votes[d]), fi(dauRun[d]), fin(dauRun[d]) ? fn(b.n / dauRun[d] * 1e5, 1) : "—"]; });
  T("sentiment", "Written reviews and the vote-count series, by day", ["Day", "Up (with comment)", "Down (with comment)", "Downvote rate", "`PlayerFeedbackVotesCount` (up − down, all votes)", "DAU", "Reviews per 100K DAU"], out3, [1, 2, 3, 4, 5, 6],
    "The vote series counts every thumbs-up and thumbs-down, most without a comment. It turns from near zero to +690 on 11 Sep (v693 published 15:55) and stays in the hundreds; the written-review downvote rate halves on the same day. Reviews per 100K DAU shows how many players wrote one.",
    "`byDay` of the merged review file; `PlayerFeedbackVotesCount` headline ONE_DAY.");
}

// ================================================================ APPENDIX
T("appendix", "Theme regexes used in the sentiment tables", ["Theme", "Regex (case-insensitive)"], THEMES.map(([l, re]) => [l, "`" + re.source.slice(0, 400) + "`"]), [],
  "Applied to the `comment` text of each review. Counting is literal; a sarcastic mention counts the same as a sincere one.", "tools/r0919/extras/verity.js");
{
  const rows = [["UsersJoinedFromNotifications", "Served as a value that stays constant for about a week (365 → 846 → 992) rather than a daily count; its Δ compares two weekly figures."],
    ["PlayerFeedbackVotesCount", "Up-votes minus down-votes. A like can be rewarded in-game (spec v689; the `[LikeReward]` code path is first logged at v693, 11 Sep), so votes cast after 11 Sep are not comparable with votes cast before it."],
    ["ForwardD1Retention × IsNewUser", "The Explore query failed inside Roblox (`ERROR_CODE_INTERNAL_ERROR`) on every game — unavailable, not zero."],
    ["ClientFpsP10, client memory on 8 Sep", "Roblox telemetry fault on all five games (F28); first read kept in the corpus, correct values re-served on 19 Sep for some series."],
    ["RFYD8To28PlayDays / Playtime / QualifiedPlaySessions", "First served on 4 Sep, so there is no week-before comparison."],
    ["ForwardD7Retention", "Newest settled cohort is 10 Sep; the POST week has no D7 yet."],
    ["ConcurrentPlayers ONE_HOUR (Explore)", "Each label is the END of its hour: publish spikes appear one label later than in the half-hour series, and at 09:12 UTC the newest label was 10:00. The in-progress hour and the carry-forward bucket after it are dropped."]];
  T("appendix", "Series caveats specific to this game", ["Series", "Caveat"], rows, [], "", "Checked against the corpus and the Explore pull for this report.");
}

// sentiment order: all-reviews table first, downvote-only table after the device split
{ const i = tables.findIndex(t => t.title.startsWith("Themes among downvotes")); if (i >= 0) { const [t] = tables.splice(i, 1);
  const j = tables.findIndex(x => x.title.startsWith("Themes by device class")); tables.splice(j + 1, 0, t); } }
fs.writeFileSync(path.join(DATA, "extras-verity.json"), JSON.stringify({ generatedAt: new Date().toISOString(), tables }, null, 1));
console.log(`extras-verity.json: ${tables.length} tables`);
for (const t of tables) console.log(` [${t.section}] ${t.title} — ${t.rows.length} rows`);
