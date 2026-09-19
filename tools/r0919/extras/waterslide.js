// Analyst tables for Climb Waterslide and Slide (10030829154), 2026-09-19 read.
// Reads the built data file, the corpus, the raw bundles, the Explore / CCU pulls,
// the error exports and the merged feedback history; writes
//   reports/2026-09-19/data/extras-waterslide.json
// Every cell is computed here — the page's prose quotes these tables, never mental arithmetic.
//   node tools/r0919/extras/waterslide.js
const fs = require("fs");
const path = require("path");
const L = require("../../lib.js");
const ROOT = L.ROOT;
const ID = "10030829154";
const DATA = path.join(ROOT, "reports/2026-09-19/data");
const J = p => JSON.parse(fs.readFileSync(p, "utf8"));
const D = J(path.join(DATA, "waterslide.json"));
const PF = J(path.join(DATA, "portfolio.json"));
const FB = J(path.join(DATA, `feedback-${ID}.json`));
const CCU = J(path.join(DATA, `ccu-${ID}.json`));
const EXP_DIR = DATA;
const RAW = path.join(ROOT, "data/raw");
const EXPORTS = path.join(ROOT, "data/exports/10030829154-climb-waterslide-and-slide/errors");

// ---------------------------------------------------------------- helpers
const addDays = (d, n) => { const x = new Date(d + "T00:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const range = (a, b) => { const o = []; for (let d = a; d <= b; d = addDays(d, 1)) o.push(d); return o; };
const mean = a => { const b = a.filter(v => v != null && Number.isFinite(v)); return b.length ? b.reduce((x, y) => x + y, 0) / b.length : null; };
const sd = a => { const b = a.filter(v => v != null && Number.isFinite(v)); if (b.length < 2) return null; const m = mean(b); return Math.sqrt(b.reduce((s, v) => s + (v - m) ** 2, 0) / (b.length - 1)); };
const sum = a => a.filter(v => v != null && Number.isFinite(v)).reduce((x, y) => x + y, 0);
const fi = v => v == null || !Number.isFinite(v) ? "—" : Math.round(v).toLocaleString("en-US");
const fp = (v, dp = 2) => v == null || !Number.isFinite(v) ? "—" : (v < 0 ? "−" : "") + Math.abs(v * 100).toFixed(dp) + "%";
const fs_ = (r, dp = 1) => r == null || !Number.isFinite(r) ? "—" : (r >= 0 ? "+" : "−") + Math.abs(r * 100).toFixed(dp) + "%";   // signed % from a relative change
const fpp = (v, dp = 2) => v == null || !Number.isFinite(v) ? "—" : (v >= 0 ? "+" : "−") + Math.abs(v * 100).toFixed(dp) + "pp";
const fn = (v, dp = 2) => v == null || !Number.isFinite(v) ? "—" : v.toFixed(dp);
const fz = v => v == null || !Number.isFinite(v) ? "—" : (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(2);
const fx = v => v == null || !Number.isFinite(v) ? "—" : v.toFixed(2) + "×";
const dow = d => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(d + "T00:00:00Z").getUTCDay()];
const rel = (a, b) => (a != null && b != null && b) ? a / b - 1 : null;
const phi = z => { const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2); const e = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z / 2); return z >= 0 ? (1 + e) / 2 : (1 - e) / 2; };
function ols(x, y) { const n = x.length; const mx = mean(x), my = mean(y); let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; }
  const b = sxy / sxx, a = my - b * mx; return { a, b, r: sxy / Math.sqrt(sxx * syy), n }; }

const W = D.window; const POST = W.POST, PRE = W.PRE, PRIOR = W.PRIOR;
const M = k => D.metrics.find(m => m.metric === k);
const daily = (metric) => L.daily(ID, metric) || new Map();
const bySrc = (metric, dim, opt) => L.byBreakdown(ID, metric, dim, opt || {}) || new Map();
const tables = [];
const T = (section, title, columns, rows, numeric, note, source) => tables.push({ section, title, columns, rows, numeric, note, source });

// corpus series used repeatedly
const DAU = daily("DailyActiveUsers"), IMP = daily("UniqueUsersWithImpressions"), CVR = daily("EndToEndCVR"), PTR = daily("RFYPlayThroughRate");
const D1 = daily("ForwardD1Retention"), SES = daily("AverageSessionLengthMinutes"), REV = daily("DailyRevenue"), ARPU = daily("AverageRevenuePerUser");
const PAY = daily("PayingUsers"), PCVR = daily("PayingUsersCVR"), ARPPU = daily("AverageRevenuePerPayingUser");
const dauSrc = bySrc("DailyActiveUsers", "AcquisitionSource"), impSrc = bySrc("UniqueUsersWithImpressions", "AcquisitionSource");
const homeDau = dauSrc.get("HomeRecommendation"), homeImp = impSrc.get("HomeRecommendation");
const HOMECONV = new Map([...homeDau].filter(([d]) => homeImp.get(d)).map(([d, v]) => [d, v / homeImp.get(d)]));
// IsNewUser slices of DAU (population FILTER, read as slices — never as the total)
function filtSlice(metric, dim, val) { const s = L.load(ID).metrics[metric].series.filter(s => s.granularity === "METRIC_GRANULARITY_ONE_DAY" && !Object.keys(s.breakdown || {}).length
  && (s.filters || []).length === 1 && (s.filters[0].dimension || s.filters[0].name) === dim && (s.filters[0].values || []).join() === val);
  const m = new Map(); for (const x of s) for (const p of x.points) { if (p.partial || p.status === "FILLED_ZERO") continue; if (!m.has(p.date)) m.set(p.date, p.value); } return m; }
const NEW = filtSlice("DailyActiveUsers", "IsNewUser", "New"), RET = filtSlice("DailyActiveUsers", "IsNewUser", "Returning");
// hourly / half-hour CCU (Open Cloud pull 09:01Z; keys YYYY-MM-DDTHH:MM, start-labelled)
const HH = CCU.halfhour, HR = CCU.hourly;
// Unsettled buckets: the half-hour 09-19T09:00 slot was still changing between the 09:01Z and 09:11Z pulls
// (3,170.6 -> 3,181.6), and so was the hourly 10:00 label (3,169.9 -> 3,180.6). Drop both, and everything after.
const HH_CUT = "2026-09-19T09:00", HR_CUT = "2026-09-19T09:00";
const hh = t => (t < HH_CUT ? HH[t] : undefined), hr = t => (t < HR_CUT ? HR[t] : undefined);
const slot = (d, h) => `${d}T${String(Math.floor(h)).padStart(2, "0")}:${h % 1 ? "30" : "00"}`;
const addH = (t, h) => new Date(Date.parse(t + ":00Z") + h * 3600e3).toISOString().slice(0, 16);

// paired mean over a list of (pre, post) days
function pairMean(map, posts, pres) { const a = [], b = []; posts.forEach((d, i) => { const x = map.get(pres[i]), y = map.get(d); if (x != null && y != null) { a.push(x); b.push(y); } });
  return { before: mean(a), after: mean(b), n: a.length, delta: rel(mean(b), mean(a)) }; }
const minus7 = ds => ds.map(d => addDays(d, -7));
// CCU daily mean from hourly ConcurrentPlayers, complete days only (24 settled hours)
const ccuMean = new Map(); for (const d of range("2026-08-22", "2026-09-19")) { const v = []; for (let h = 0; h < 24; h++) { const x = hr(slot(d, h)); if (x != null) v.push(x); } if (v.length === 24) ccuMean.set(d, mean(v)); }

// ================================================================ GLANCE
{
  const halves = [["Sat–Sun 09-12/13", ["2026-09-12", "2026-09-13"]], ["Mon 09-14 (v1722 16:09)", ["2026-09-14"]], ["Tue–Wed 09-15/16", ["2026-09-15", "2026-09-16"]], ["Whole week 09-12→16", POST]];
  const rowsDef = [["DAU `DailyActiveUsers`", DAU], ["New DAU (`IsNewUser=New` slice)", NEW], ["Returning DAU (`IsNewUser=Returning` slice)", RET],
    ["Impressions `UniqueUsersWithImpressions`", IMP], ["Home impressions (`AcquisitionSource=HomeRecommendation`)", homeImp], ["Impression→play `EndToEndCVR`", CVR], ["`RFYPlayThroughRate`", PTR],
    ["Home-surface conversion (Home DAU ÷ Home impressions)", HOMECONV], ["`ForwardD1Retention`", D1], ["`AverageSessionLengthMinutes`", SES],
    ["CCU daily mean (hourly `ConcurrentPlayers`)", ccuMean], ["`DailyRevenue`", REV], ["`AverageRevenuePerUser` (ARPDAU)", ARPU], ["`PayingUsers`", PAY]];
  T("timeline", "The week in three parts — each vs the same weekdays one week earlier",
    ["Series", ...halves.map(h => h[0])],
    rowsDef.map(([lab, map]) => [lab, ...halves.map(([, ds]) => { const r = pairMean(map, ds, minus7(ds)); return r.n === ds.length ? fs_(r.delta) : (r.n ? fs_(r.delta) + ` (${r.n}/${ds.length})` : "—"); })]),
    [1, 2, 3, 4],
    "Mon 09-14 carries the v1722 publish at 16:09 UTC, so the week splits into a pre-v1722 weekend and a post-v1722 Tue–Wed. D1 for a day needs the next day, so its newest pairs are included only where served.",
    "Corpus `series.json` ONE_DAY headline series (IsNewUser rows are the `DailyActiveUsers` filter slices); CCU = mean of 24 settled hourly `ConcurrentPlayers` buckets (Open Cloud pull 09-19 09:01Z). Each cell = mean(after days) ÷ mean(same weekdays −7d) − 1.");
}

// ================================================================ TIMELINE
{ // publish event study vs base rate — half-hour peaks, 3h before the publish slot vs 3h starting 1h after it
  const pubs = [["v1721 root + 7 sub-places (Heaven v3 16:32)", "2026-09-11T16:42"], ["v1722 all places", "2026-09-14T16:09"], ["v1723 all places", "2026-09-17T18:11"]];
  const pubDays = new Set(["2026-08-28", "2026-09-04", "2026-09-11", "2026-09-14", "2026-09-17"]);
  const rows = [];
  for (const [lab, t] of pubs) {
    const d = t.slice(0, 10), hDec = +t.slice(11, 13) + (+t.slice(14, 16) >= 30 ? 0.5 : 0);
    const stat = day => { const b = [], a = []; for (let k = 1; k <= 6; k++) b.push(hh(slot(day, hDec - k * 0.5))); for (let k = 2; k < 8; k++) a.push(hh(slot(day, hDec + k * 0.5)));
      return b.every(v => v != null) && a.every(v => v != null) ? mean(a) / mean(b) : null; };
    const obs = stat(d);
    const base = range("2026-08-23", "2026-09-18").filter(x => !pubDays.has(x)).map(stat).filter(v => v != null);
    const m = mean(base), s = sd(base);
    rows.push([lab, t.replace("T", " "), fx(obs), fx(m), fn(s, 3), String(base.length), fz((obs - m) / s)]);
  }
  T("timeline", "Did any publish change concurrents beyond the normal time-of-day swing?", ["Publish", "UTC", "After ÷ before (publish day)", "Same clock slots, non-publish days: mean", "sd", "n days", "z"],
    rows, [2, 3, 4, 5, 6],
    "Before = the six half-hours ending at the publish slot; after = six half-hours starting one hour after it (skips the restart dip/spike). A z near 0 means the publish day moved like any other day at that clock time.",
    "`PeakConcurrentPlayers` HALF_HOUR (Open Cloud pull 09-19 09:01Z, start-labelled). Base = every day 08-23→09-18 without a publish (08-28, 09-04, 09-11, 09-14, 09-17 excluded).");
}
{ // three new-world launches
  const launches = [["08-07 NEW WORLD (07.08 spec)", "2026-08-07"], ["08-28 NEW WORLD (28.08 spec, v1715/1716)", "2026-08-28"], ["09-11 NEW WORLD (10.09 spec, v1721)", "2026-09-11"]];
  const peakDau = D.peak.dau;
  const rows = launches.map(([lab, d]) => { const after = range(addDays(d, 1), addDays(d, 5)), before = minus7(after);
    const g = map => pairMean(map, after, before);
    return [lab, fp(DAU.get(d) / peakDau, 1), fs_(g(DAU).delta), fs_(g(IMP).delta), fs_(g(PTR).delta), fs_(g(CVR).delta), fs_(g(D1).delta), fs_(g(REV).delta)]; });
  T("timeline", "Three new-world launches, same test: the five days after vs the same weekdays one week earlier",
    ["Launch (event START 19:00 UTC)", "DAU at launch, % of peak", "DAU", "Impressions", "`RFYPlayThroughRate`", "`EndToEndCVR`", "`ForwardD1Retention`", "`DailyRevenue`"],
    rows, [1, 2, 3, 4, 5, 6, 7],
    "The spec blocks for 07.08, 28.08 and 10.09 all read 'NEW WORLD — 7 rafts, 2 limited pets, 3 eggs, 3 trails'. Only the third launch is followed by a rise.",
    "Event dates from `ANNOTATION_TYPE_EXPERIENCE_EVENT_STATE` (NEW WORLD START); specs in `data/updates/10030829154-climb-waterslide-and-slide.md`. Corpus ONE_DAY headline series; peak DAU 688,061 on 2026-08-02.");
}

// ================================================================ REACH
{ // decomposition per pair
  const rows = []; const lg = [];
  POST.forEach((d, i) => { const p = PRE[i]; const rd = DAU.get(d) / DAU.get(p), ri = IMP.get(d) / IMP.get(p), rc = CVR.get(d) / CVR.get(p); const res = rd / (ri * rc);
    const L_ = Math.log(rd); lg.push([Math.log(ri), Math.log(rc), Math.log(res), L_]);
    rows.push([`${dow(d)} ${d.slice(5)} vs ${p.slice(5)}`, fs_(rd - 1), fs_(ri - 1), fs_(rc - 1), fs_(res - 1), fp(Math.log(ri) / L_, 0), fp(Math.log(rc) / L_, 0)]); });
  const s = [0, 1, 2, 3].map(k => sum(lg.map(x => x[k])));
  rows.push(["All five pairs (sum of logs)", fs_(Math.exp(s[3] / 5) - 1), fs_(Math.exp(s[0] / 5) - 1), fs_(Math.exp(s[1] / 5) - 1), fs_(Math.exp(s[2] / 5) - 1), fp(s[0] / s[3], 0), fp(s[1] / s[3], 0)]);
  T("reach", "Where the DAU change came from: impressions × impression→play conversion, per weekday pair",
    ["Pair", "DAU", "Impressions", "`EndToEndCVR`", "Residual (DAU not covered by impr × CVR)", "Share of log-change: impressions", "Share: CVR"],
    rows, [1, 2, 3, 4, 5, 6],
    "On the weekend DAU rose while impressions fell — the gain was all conversion. From Monday both terms rose. The total row is the geometric mean of the five pair ratios.",
    "Corpus ONE_DAY `DailyActiveUsers`, `UniqueUsersWithImpressions`, `EndToEndCVR`. Share = log(term ratio) ÷ log(DAU ratio); residual = DAU ratio ÷ (impressions ratio × CVR ratio).");
}
let PTRFIT, CVRFIT, HOMEFIT;
{ // conversion at matched reach — model-free: compare each day with pre-period days at a similar impression level
  const fitDays = range("2026-08-10", "2026-09-08");
  const fit = (y, x) => { const xs = [], ys = []; for (const d of fitDays) if (y.get(d) && x.get(d)) { xs.push(Math.log(x.get(d))); ys.push(Math.log(y.get(d))); } return ols(xs, ys); };
  PTRFIT = fit(PTR, IMP); CVRFIT = fit(CVR, IMP); HOMEFIT = fit(HOMECONV, homeImp);
  const band = (y, x, d) => { const v = x.get(d); if (!v) return null; const m = fitDays.filter(q => x.get(q) && y.get(q) && Math.abs(x.get(q) / v - 1) <= 0.15).map(q => y.get(q));
    return m.length ? { n: m.length, lo: Math.min(...m), hi: Math.max(...m), med: m.slice().sort((a, b) => a - b)[Math.floor(m.length / 2)] } : { n: 0 }; };
  const cell = (y, x, d) => { const b = band(y, x, d); if (!b) return "—"; if (!b.n) return "no pre-period day at this reach"; return fp(b.lo) + "–" + fp(b.hi) + " (n=" + b.n + ")"; };
  const days = range("2026-09-03", "2026-09-17");
  const rows = days.map(d => [dow(d) + " " + d.slice(5), fi(IMP.get(d)), fp(PTR.get(d)), cell(PTR, IMP, d), fp(CVR.get(d)), cell(CVR, IMP, d), fi(homeImp.get(d)), fp(HOMECONV.get(d)), cell(HOMECONV, homeImp, d)]);
  const maxPre = (y) => Math.max(...fitDays.filter(q => y.get(q)).map(q => y.get(q)));
  rows.push(["Highest single day 08-10→09-08", "", fp(maxPre(PTR)), "", fp(maxPre(CVR)), "", "", fp(maxPre(HOMECONV)), ""]);
  T("reach", "Conversion at matched reach: each day beside the range seen on pre-period days with impressions within ±15%",
    ["Day", "Impressions", "`RFYPlayThroughRate`", "Pre-period range at this reach", "`EndToEndCVR`", "Pre-period range", "Home impressions", "Home conversion", "Pre-period range at this Home reach"],
    rows, [1, 2, 4, 6, 7],
    "On this game, over 08-10→09-08, conversion and impressions rose and fell TOGETHER (log–log r = " + fn(CVRFIT.r, 2) + " for CVR, " + fn(PTRFIT.r, 2) + " for PTR, " + fn(HOMEFIT.r, 2) + " for Home) — the reverse of the 'denominator' pattern measured on Banana Monkey — so no fitted line is used. Each day is set beside the conversion seen on pre-period days that had a similar number of impressions.",
    "Corpus ONE_DAY `RFYPlayThroughRate`, `EndToEndCVR`, `UniqueUsersWithImpressions` (total and `AcquisitionSource=HomeRecommendation`); Home conversion = `DailyActiveUsers` ÷ `UniqueUsersWithImpressions`, both `AcquisitionSource=HomeRecommendation`. Pre-period = 08-10→09-08 (30 days).");
}
{ // thumbnail swaps vs base rate — raw play-through change, day after vs day before
  const ann = fs.readFileSync(path.join(ROOT, "data/games", ID, "annotations.md"), "utf8");
  const swapTs = [...new Set([...ann.matchAll(/"annotationType":"ANNOTATION_TYPE_PLACE_THUMBNAIL"[^\n]*?"createdUtcTime":"([^"]+)"/g)].map(m => m[1]))].sort();
  const byDay = new Map(); for (const t of swapTs) if (!byDay.has(t.slice(0, 10))) byDay.set(t.slice(0, 10), t);   // one row per swap day
  const lr = d => PTR.get(d) ? Math.log(PTR.get(d)) : null, li = d => IMP.get(d) ? Math.log(IMP.get(d)) : null;
  const stat = d => { const a = lr(addDays(d, 1)), b = lr(addDays(d, -1)); return a != null && b != null ? a - b : null; };
  const istat = d => { const a = li(addDays(d, 1)), b = li(addDays(d, -1)); return a != null && b != null ? a - b : null; };
  const near = d => [-1, 0, 1].some(k => byDay.has(addDays(d, k)));
  const base = range("2026-05-08", "2026-09-17").filter(d => !near(d)).map(stat).filter(v => v != null); const bm = mean(base), bs = sd(base);
  const sw = [...byDay.entries()].filter(([d]) => d >= "2026-06-01");
  const rows = sw.map(([d, t]) => { const v = stat(d), vi = istat(d); return [t.slice(0, 16).replace("T", " "), v == null ? "—" : fs_(Math.exp(v) - 1), vi == null ? "—" : fs_(Math.exp(vi) - 1), v == null ? "—" : fz((v - bm) / bs)]; });
  const vals = sw.map(([d]) => stat(d)).filter(v => v != null);
  rows.push(["All " + vals.length + " swap days since 06-01: mean", fs_(Math.exp(mean(vals)) - 1), "", fz((mean(vals) - bm) / (bs / Math.sqrt(vals.length)))]);
  rows.push(["Non-swap days (n=" + base.length + "): mean · sd", fs_(Math.exp(bm) - 1) + " · sd " + fp(bs, 1), "", "—"]);
  const z0908 = (stat("2026-09-08") - bm) / bs; const pOne = 1 - phi(z0908); const pAny = 1 - Math.pow(1 - pOne, vals.length);
  var THUMB_NOTE_EXTRA = " The 09-08 swap's z of " + fz(z0908) + " has a one-sided p of " + pOne.toFixed(4) + " on its own; the chance that at least one of " + vals.length + " swap days reaches it by chance is " + pAny.toFixed(2) + ".";
  T("reach", "Thumbnail swaps against the base rate of ordinary days",
    ["Swap (UTC)", "`RFYPlayThroughRate`, day after ÷ day before", "Impressions, same days", "z vs non-swap days"],
    rows, [1, 2, 3],
    "Same statistic on every day with no swap on it or either neighbour gives the base rate. The 'all swaps' z uses the standard error of a mean. Only one swap day is flagged per UTC date. The images were not inspected for this read." + THUMB_NOTE_EXTRA,
    "`ANNOTATION_TYPE_PLACE_THUMBNAIL` rows in `data/games/10030829154/annotations.md`; corpus `RFYPlayThroughRate` and `UniqueUsersWithImpressions` ONE_DAY; base days 05-08→09-17.");
}
{ // RFY signal block, daily
  const sig = [["Impressions", "UniqueUsersWithImpressions", fi], ["PTR", "RFYPlayThroughRate", v => fp(v)], ["Bounce <60s", "RFYDuration0To60", v => fp(v, 1)], ["Bounce 61–180s", "RFYDuration61To180", v => fp(v, 1)],
    ["D1 playtime", "RFYD1Playtime", v => fn(v, 2)], ["D1 qual. sessions", "RFYD1QualifiedPlaySessions", v => fn(v, 3)], ["D2–7 play days", "RFYD2To7PlayDays", v => fn(v, 3)], ["D8–28 play days", "RFYD8To28PlayDays", v => fn(v, 3)],
    ["Not-interested / M impr.", "RFYUniqueNotInterestedUsersPerMillionImpressions", v => fn(v, 1)]];
  const maps = sig.map(s => daily(s[1]));
  const rows = range("2026-09-03", "2026-09-17").map(d => [`${dow(d)} ${d.slice(5)}`, ...sig.map((s, i) => s[2](maps[i].get(d)))]);
  T("reach", "The eight Home-ranking signals by day, against impressions",
    ["Day", ...sig.map(s => s[0])], rows, sig.map((_, i) => i + 1),
    "Roblox documents that an impression change usually FOLLOWS a move in these signals. Read the columns top to bottom for which moved first: the reach step is 09-14/09-15.",
    "Corpus ONE_DAY RFY metrics (`RFYPlayThroughRate`, `RFYDuration0To60`, `RFYDuration61To180`, `RFYD1Playtime`, `RFYD1QualifiedPlaySessions`, `RFYD2To7PlayDays`, `RFYD8To28PlayDays`, `RFYUniqueNotInterestedUsersPerMillionImpressions`).");
}
{ // new players by source
  const np = bySrc("UniqueUsersWithPlaySessions", "AcquisitionSource", { allowSlice: true }); // exists ONLY as IsNewUser=New (F33) — deliberately the new-player slice
  const srcs = ["HomeRecommendation", "Friends", "Others", "Search"];
  let tb = 0, ta = 0; const r0 = srcs.map(s => { const r = pairMean(np.get(s), POST, PRE); tb += r.before; ta += r.after; return [s, r]; });
  const rows = r0.map(([s, r]) => [s, fi(r.before), fi(r.after), fs_(r.delta), fp((r.after - r.before) / (ta - tb), 0), fp(r.before / tb, 1), fp(r.after / ta, 1)]);
  rows.push(["Four sources", fi(tb), fi(ta), fs_(ta / tb - 1), "100%", "", ""]);
  T("reach", "New players by acquisition source",
    ["Source", "New players/day before", "After", "Δ", "Share of the increase", "Mix before", "Mix after"],
    rows, [1, 2, 3, 4, 5, 6],
    "This is the new-player slice (`IsNewUser=New`) — the population `ForwardD1Retention` is measured on. Charts, Moments and ads are under 50/day and omitted.",
    "Corpus `UniqueUsersWithPlaySessions` ONE_DAY broken down by `AcquisitionSource`, which the gateway serves only with an `IsNewUser=New` filter (F33). Paired weekday means, 5/5 pairs.");
}
{ // country contribution
  const bd = bySrc("DailyActiveUsers", "Country");
  const all = []; for (const [c, m] of bd) { const r = pairMean(m, POST, PRE); if (r.n === 5) all.push([c, r]); }
  const totB = sum(all.map(x => x[1].before)), totA = sum(all.map(x => x[1].after));
  all.sort((a, b) => (b[1].after - b[1].before) - (a[1].after - a[1].before));
  const top = all.slice(0, 12);
  const rows = top.map(([c, r]) => [c, fi(r.before), fi(r.after), fs_(r.delta), fp((r.after - r.before) / (totA - totB), 1)]);
  const rest = all.slice(12); rows.push([`Other ${rest.length} countries`, fi(sum(rest.map(x => x[1].before))), fi(sum(rest.map(x => x[1].after))), fs_(sum(rest.map(x => x[1].after)) / sum(rest.map(x => x[1].before)) - 1), fp(sum(rest.map(x => x[1].after - x[1].before)) / (totA - totB), 1)]);
  const falling = all.filter(x => x[1].delta < 0).sort((a, b) => b[1].before - a[1].before).slice(0, 4).map(([c, r]) => `${c} ${fs_(r.delta)}`).join(", ");
  T("reach", "Which countries the DAU increase came from (top 12 by added DAU)",
    ["Country", "DAU before", "After", "Δ", "Share of the total increase"], rows, [1, 2, 3, 4],
    `Countries with ≥1,000 DAU before that fell: ${falling || "none"}. Tue 09-15 against Tue 09-08, in the 15 largest countries by DAU after: ${(() => { const top15 = all.slice().sort((a, b) => b[1].after - a[1].after).slice(0, 15).map(x => x[0]); const ch = top15.map(c => [c, bd.get(c).get("2026-09-15") / bd.get(c).get("2026-09-08") - 1]); return ch.filter(x => x[1] > 0).length + " of 15 rose (range " + fs_(Math.min(...ch.map(x => x[1]))) + " to " + fs_(Math.max(...ch.map(x => x[1]))) + ")"; })()}.`,
    "Corpus `DailyActiveUsers` ONE_DAY by `Country` (236 countries), paired weekday means; countries with all 5 pairs only.");
}
{ // portfolio co-movement
  const ks = [["DAU", "DailyActiveUsers"], ["CCU peak", "PeakConcurrentPlayers"], ["Impressions", "UniqueUsersWithImpressions"], ["CVR", "EndToEndCVR"], ["PTR", "RFYPlayThroughRate"], ["D1", "ForwardD1Retention"], ["Session", "AverageSessionLengthMinutes"], ["Revenue", "DailyRevenue"], ["D8–28 play days", "RFYD8To28PlayDays"]];
  const rows = PF.games.map(g => [g.name + (g.slug === "waterslide" ? " ◀" : ""), ...ks.map(([, k]) => { const x = g.k[k]; return x && x.d != null ? `${fs_(x.d)} (${fs_(x.prior)})` : "—"; })]);
  T("reach", "Is it us or everyone? The same five-pair comparison on all five games (week before in brackets)",
    ["Game", ...ks.map(k => k[0])], rows, ks.map((_, i) => i + 1),
    "Two of five games rose this week (Waterslide, Brainrot); three fell 38–59% on DAU. RFY D8–28 play days fell on every game that serves it.",
    "`reports/2026-09-19/data/portfolio.json` (built by `tools/r0919/build.js`), same POST/PRE/PRIOR windows for every game.");
}

// ================================================================ CCU
{ // daily means
  const rows = range("2026-09-05", "2026-09-19").map(d => { const v = []; for (let h = 0; h < 24; h++) { const x = hr(slot(d, h)); if (x != null) v.push(x); }
    const m = mean(v), mx = v.length ? Math.max(...v) : null; const prev = ccuMean.get(addDays(d, -7));
    return [`${dow(d)} ${d.slice(5)}`, String(v.length), fi(m), fi(mx), v.length === 24 && prev ? fs_(m / prev - 1) : "—", ccuMean.get(addDays(d, -1)) && v.length === 24 ? fs_(m / ccuMean.get(addDays(d, -1)) - 1) : "—"]; });
  T("ccu", "Concurrents by day — mean and highest hour of the hourly series",
    ["Day", "Settled hours", "Mean CCU", "Highest hourly value", "Mean vs same weekday −7d", "Mean vs previous day"],
    rows, [1, 2, 3, 4, 5],
    "The mean answers 'was the game smaller today'; the daily `PeakConcurrentPlayers` chart above is a sum of per-platform peaks and reads higher (F15). 09-19 is partial and is not compared here — see the matched-slot table.",
    "Hourly `ConcurrentPlayers` (Open Cloud pull 09-19 09:01Z). Buckets labelled 09:00 and later on 09-19 are dropped: the 10:00 label was still changing between the 09:01Z and 09:11Z pulls.");
}
{ // today vs last saturdays, matched slots
  const blocks = [["00:00–02:30", 0, 3], ["03:00–05:30", 3, 6], ["06:00–08:30", 6, 9], ["All 18 settled slots", 0, 9]];
  const val = (d, a, b) => { const v = []; for (let h = a; h < b; h += 0.5) v.push(hh(slot(d, h))); return v.every(x => x != null) ? mean(v) : null; };
  const rows = blocks.map(([lab, a, b]) => { const t = val("2026-09-19", a, b), s1 = val("2026-09-12", a, b), s2 = val("2026-09-05", a, b);
    return [lab, fi(t), fi(s1), fi(s2), fs_(t / s1 - 1), fs_(t / s2 - 1)]; });
  T("ccu", "Today so far (Sat 09-19, to 09:00 UTC) against the same clock slots on the last two Saturdays",
    ["UTC slots", "Sat 09-19", "Sat 09-12", "Sat 09-05", "vs 09-12", "vs 09-05"],
    rows, [1, 2, 3, 4, 5],
    "Only half-hours that had fully elapsed at the 09:01Z pull are compared; the in-progress 09:00 slot and the carried-forward 09:30 slot are excluded. The Saturday ADMIN ABUSE hour (17:00–18:00) is not inside these slots.",
    "`PeakConcurrentPlayers` HALF_HOUR, Open Cloud pull 09-19 09:01Z (`reports/2026-09-19/data/ccu-10030829154.json`), mean of half-hour values per block.");
}
{ // 3h block w/w grid
  const blocks = [0, 3, 6, 9, 12, 15, 18, 21];
  const rows = range("2026-09-08", "2026-09-19").map(d => [`${dow(d)} ${d.slice(5)}`, ...blocks.map(b => { let a = 0, c = 0, n = 0; for (let k = 0; k < 6; k++) { const t = slot(d, b + k * 0.5); const p = addH(t, -168); const x = hh(t), y = HH[p]; if (x != null && y != null) { a += x; c += y; n++; } }
    return n === 6 ? fx(a / c) : "—"; })]);
  T("ccu", "When the rise happened: concurrents in 3-hour blocks, each against the same block one week earlier",
    ["Day", ...blocks.map(b => `${String(b).padStart(2, "0")}:00`)], rows, blocks.map((_, i) => i + 1),
    "Publishes: 09-11 16:42 (block 15:00), 09-14 16:09 (15:00), 09-17 18:11 (18:00). Events: NEW WORLD 09-11 19:00 → 09-15 18:00; ADMIN ABUSE 09-12 17:00–18:00. A ratio of 1.00× = same as last week. The base week has its own events (NEW UPDATE 09-03 18:00 → 09-07 17:00; ADMIN ABUSE 09-05 17:00), so read a column change, not one cell.",
    "`PeakConcurrentPlayers` HALF_HOUR, sum of six half-hour values ÷ the same six slots 168h earlier (Open Cloud pull 09-19 09:01Z).");
}
{ // 09-11 before the publish, vs the day before; base = other Thu→Fri pairs
  const blocks = [0, 3, 6, 9, 12, 15];
  const r = (d, b) => { let a = 0, c = 0; for (let k = 0; k < 6; k++) { const t = slot(d, b + k * 0.5); const p = addH(t, -24); if (hh(t) == null || HH[p] == null) return null; a += hh(t); c += HH[p]; } return a / c; };
  const pairsFri = ["2026-08-28", "2026-09-04", "2026-09-18"];
  const rows = [["Fri 09-11 vs Thu 09-10", ...blocks.map(b => fx(r("2026-09-11", b)))],
    ...pairsFri.map(d => [`Fri ${d.slice(5)} vs Thu ${addDays(d, -1).slice(5)}`, ...blocks.map(b => fx(r(d, b)))])];
  T("ccu", "Friday 09-11 before the 16:42 publish, against the day before — and the same comparison on other Fridays",
    ["Pair", ...blocks.map(b => `${String(b).padStart(2, "0")}:00`)], rows, blocks.map((_, i) => i + 1),
    "Blocks from 15:00 include the publish on 09-11 (16:42), 08-28 (v1715 20:49 is later, so 08-28 blocks shown are pre-publish) and 09-04 (v1719 19:12, later). 09-18 has no publish.",
    "`PeakConcurrentPlayers` HALF_HOUR, six half-hour values ÷ the same slots 24h earlier (Open Cloud pull 09-19 09:01Z).");
}
{ // Monday 09-14 half-hours around the step, vs the Monday before
  const rows = []; for (let h = 8; h < 14; h += 0.5) { const t = slot("2026-09-14", h), p = slot("2026-09-07", h); rows.push([t.slice(11), fi(hh(t)), fi(HH[p]), fx(hh(t) / HH[p])]); }
  T("ccu", "Mon 09-14, half-hour by half-hour from 08:00 UTC, beside Mon 09-07",
    ["UTC slot", "Mon 09-14", "Mon 09-07", "Ratio"], rows, [1, 2, 3],
    "v1722 was published at 16:09 UTC, after every slot shown.",
    "`PeakConcurrentPlayers` HALF_HOUR (Open Cloud pull 09-19 09:01Z).");
}
{ // morning ramp on 09-14, five games
  const games = [["10030829154", "Waterslide"], ["9963622286", "Brainrot"], ["10399712766", "Banana Monkey"], ["10565445771", "Verity"], ["10638354731", "Seal"]];
  const rows = games.map(([gid, name]) => { const E = J(path.join(EXP_DIR, `explore-${gid}.json`)); const s = E.specs.find(s => s.metric === "PeakConcurrentPlayers" && s.granularity === "METRIC_GRANULARITY_HALF_HOUR");
    const P = s.series.__TOTAL__.points; const g = t => P[t + ":00Z"];
    const stat = d => { const a = [], b = []; for (let h = 11; h < 14; h += 0.5) a.push(g(slot(d, h))); for (let h = 8; h < 10; h += 0.5) b.push(g(slot(d, h))); return a.every(v => v != null) && b.every(v => v != null) ? mean(a) / mean(b) : null; };
    const obs = stat("2026-09-14"); const others = range("2026-08-28", "2026-09-18").filter(d => d !== "2026-09-14").map(d => [d, stat(d)]).filter(x => x[1] != null);
    const vals = others.map(x => x[1]); const m = mean(vals), s_ = sd(vals); const rank = 1 + vals.filter(v => v > obs).length;
    return [name, fx(obs), fx(m), fn(s_, 3), fz((obs - m) / s_), `${rank} of ${vals.length + 1}`]; });
  T("ccu", "Mon 09-14: the late-morning ramp against every other day, all five games",
    ["Game", "09-14: CCU 11:00–13:30 ÷ 08:00–09:30", "Other days: mean", "sd", "z", "Rank (1 = steepest)"],
    rows, [1, 2, 3, 4],
    "The step on 09-14 began in the 10:00 half-hour, six hours before v1722 (16:09). This asks whether that morning ramp was unusual for each game, against the same statistic on every day 08-28→09-18.",
    "`PeakConcurrentPlayers` HALF_HOUR from each game's Explore pull (`reports/2026-09-19/data/explore-<id>.json`, 09-19 ~09:11Z).");
}

// ================================================================ RETENTION
const NP = bySrc("UniqueUsersWithPlaySessions", "AcquisitionSource", { allowSlice: true });
{ // D1 by source, effect vs confidence
  const d1s = bySrc("ForwardD1Retention", "AcquisitionSource");
  const srcs = ["HomeRecommendation", "Friends", "Others", "Search"];
  const base = range("2026-08-22", "2026-09-09");
  const rows = srcs.map(s => { const m = d1s.get(s); const r = pairMean(m, POST, PRE); const n = NP.get(s); const nb = pairMean(n, POST, PRE);
    const own = sd(base.map(d => m.get(d))); const dlt = r.after - r.before; const zOwn = dlt / (own * Math.sqrt(2 / 5));
    const p = (r.before + r.after) / 2; const se = Math.sqrt(p * (1 - p) / (5 * nb.before) + p * (1 - p) / (5 * nb.after));
    return [s, fi(nb.after), fp(r.before), fp(r.after), fs_(r.delta), fpp(dlt), fp(own), fz(zOwn), fp(Math.sqrt(p * (1 - p) / nb.after), 2), fz(dlt / se)]; });
  T("retention", "D1 by acquisition source: effect size (relative change) and confidence (z) kept apart",
    ["Source", "New players/day (after)", "D1 before", "D1 after", "Relative Δ", "Δ pp", "Own daily sd (08-22→09-09)", "z vs own sd", "Binomial floor (1 day)", "z vs binomial"],
    rows, [1, 2, 3, 4, 5, 6, 7, 8, 9],
    "Friends arrive by invite and never see a thumbnail; Search looked the game up. z vs own sd = Δ ÷ (sd·√(2/5)), the standard error of a difference of two 5-day means. Relative Δ is the composition instrument; z says whether it moved at all.",
    "Corpus `ForwardD1Retention` ONE_DAY by `AcquisitionSource` (5/5 pairs); n = `UniqueUsersWithPlaySessions` by `AcquisitionSource`, `IsNewUser=New`.");
}
{ // shift-share of blended D1
  const d1s = bySrc("ForwardD1Retention", "AcquisitionSource"); const srcs = ["HomeRecommendation", "Friends", "Others", "Search"];
  const g = (s, k) => pairMean(k === "d" ? d1s.get(s) : NP.get(s), POST, PRE);
  const nb = srcs.map(s => g(s, "n").before), na = srcs.map(s => g(s, "n").after), pb = srcs.map(s => g(s, "d").before), pa = srcs.map(s => g(s, "d").after);
  const wb = nb.map(v => v / sum(nb)), wa = na.map(v => v / sum(na));
  const blend = (w, p) => sum(w.map((x, i) => x * p[i]));
  const B = blend(wb, pb), A = blend(wa, pa), mixOnly = blend(wa, pb), withinOnly = blend(wb, pa);
  const rows = [["Blended before (weights & rates before)", fp(B), ""], ["Blended after", fp(A), fpp(A - B)],
    ["Rates before, mix after (mix effect only)", fp(mixOnly), fpp(mixOnly - B)], ["Mix before, rates after (within-source effect only)", fp(withinOnly), fpp(withinOnly - B)],
    ["Headline `ForwardD1Retention` before → after", `${fp(M("ForwardD1Retention").cur.before)} → ${fp(M("ForwardD1Retention").cur.after)}`, fpp(M("ForwardD1Retention").cur.abs)]];
  T("retention", "How much of the D1 rise is traffic mix and how much is within-source",
    ["Read", "D1", "Δ vs before"], rows, [1, 2],
    "Weights are each source's new players per day. The four sources carry ~99% of new players; the blend reproduces the headline D1 closely.",
    "Corpus `ForwardD1Retention` by `AcquisitionSource` and `UniqueUsersWithPlaySessions` by `AcquisitionSource` (`IsNewUser=New`), 5 paired weekdays each side.");
}
{ // returning vs recent cohorts
  const cr = bySrc("DailyCohortRetention", "CohortDay");
  const rk = {}; for (let k = 1; k <= 7; k++) { const m = cr.get(String(k)); rk[k] = m ? mean([...m].filter(([d]) => d >= "2026-08-20" && d <= "2026-09-06").map(x => x[1])) : null; }
  const exp_ = d => { let s = 0; for (let k = 1; k <= 7; k++) { const n = NEW.get(addDays(d, -k)); if (n == null || rk[k] == null) return null; s += n * rk[k]; } return s; };
  const days = range("2026-09-05", "2026-09-17");
  const rows = days.map(d => { const e = exp_(d), r = RET.get(d); return [`${dow(d)} ${d.slice(5)}`, fi(NEW.get(d)), fi(r), fi(e), fi(r - e), fp(e / r, 0)]; });
  const avg = ds => { const x = ds.map(d => RET.get(d) - exp_(d)); return mean(x); };
  rows.push(["Mean 09-05→09 (PRE)", "", fi(mean(PRE.map(d => RET.get(d)))), fi(mean(PRE.map(exp_))), fi(avg(PRE)), ""]);
  rows.push(["Mean 09-12→16 (POST)", "", fi(mean(POST.map(d => RET.get(d)))), fi(mean(POST.map(exp_))), fi(avg(POST)), ""]);
  T("retention", "Returning players against what the last seven days of new cohorts predict",
    ["Day", "New players", "Returning players", "Expected returners from cohorts aged 1–7 days", "Everyone else returning (older players, reactivations)", "Share explained by recent cohorts"],
    rows, [1, 2, 3, 4, 5],
    `Model: expected = Σ New(t−k) × r_k, k = 1…7, with r_k the day-k cohort retention averaged over 08-20→09-06 (r1 ${fp(rk[1], 1)}, r2 ${fp(rk[2], 1)}, r3 ${fp(rk[3], 1)}, r4 ${fp(rk[4], 1)}, r5 ${fp(rk[5], 1)}, r6 ${fp(rk[6], 1)}, r7 ${fp(rk[7], 1)}). If the new world pulled lapsed players back, the 'everyone else' column rises from 09-12. It is a model, not a measurement of individual players.`,
    "Corpus `DailyActiveUsers` filtered `IsNewUser=New` / `Returning` (slices), `DailyCohortRetention` by `CohortDay` (sparse: CohortDay k served for 5–14 cohort dates each).");
}

// ================================================================ ENGAGEMENT
{ // mix-standardised session & playtime
  const ex = (metric, bd) => D.explore.specs.find(s => s.metric === metric && s.breakdown === bd && s.segments);
  const dauS = ex("DailyActiveUsers", "IsNewUser").segments;
  const wB = dauS.New.before / (dauS.New.before + dauS.Returning.before), wA = dauS.New.after / (dauS.New.after + dauS.Returning.after);
  const rows = [];
  for (const [lab, metric, tot] of [["Session length (min)", "AverageSessionLengthMinutes", M("AverageSessionLengthMinutes")], ["Play min per DAU", "AveragePlayTimeMinutesPerDAU", M("AveragePlayTimeMinutesPerDAU")]]) {
    const s = ex(metric, "IsNewUser").segments; const nb = s.New.before, na = s.New.after, rb = s.Returning.before, ra = s.Returning.after;
    const Bl = wB * nb + (1 - wB) * rb, Al = wA * na + (1 - wA) * ra, mixOnly = wA * nb + (1 - wA) * rb, within = wB * na + (1 - wB) * ra;
    rows.push([lab, fn(nb, 2) + " → " + fn(na, 2), fn(rb, 2) + " → " + fn(ra, 2), fp(wB, 1) + " → " + fp(wA, 1), fn(tot.cur.before, 2) + " → " + fn(tot.cur.after, 2), fs_(Al / Bl - 1), fs_(mixOnly / Bl - 1), fs_(within / Bl - 1)]);
  }
  T("engagement", "Session length and playtime: within-segment change vs the shift toward new players",
    ["Metric", "New: before → after", "Returning: before → after", "New share of DAU", "Headline", "Blend Δ", "Mix effect only", "Within-segment effect only"],
    rows, [5, 6, 7],
    "Weights are DAU by segment (a session-weighted blend would differ slightly for session length). New players play fewer minutes per day, so a week with twice the new players pulls playtime per DAU down with no change to either group.",
    "Explore (`dag/execute`) `AverageSessionLengthMinutes`, `AveragePlayTimeMinutesPerDAU` and `DailyActiveUsers` by `IsNewUser`, paired weekday means (5/5); headline from the corpus.");
}

// ================================================================ MONEY
{ // revenue decomposition by part of week
  const parts = [["Sat–Sun 09-12/13", ["2026-09-12", "2026-09-13"]], ["Mon 09-14", ["2026-09-14"]], ["Tue–Wed 09-15/16", ["2026-09-15", "2026-09-16"]], ["Whole week", POST]];
  const rows = parts.map(([lab, ds]) => { const pr = minus7(ds); const r = map => pairMean(map, ds, pr).after / pairMean(map, ds, pr).before;
    const rr = r(REV), rd = r(DAU), rc = r(PCVR), ra = r(ARPPU); const lr = Math.log(rr);
    return [lab, fs_(rr - 1), fs_(rd - 1), fs_(rc - 1), fs_(ra - 1), fp(Math.log(rd) / lr, 0), fp(Math.log(rc) / lr, 0), fp(Math.log(ra) / lr, 0)]; });
  T("money", "Revenue = DAU × paying-user CVR × ARPPU, by part of the week",
    ["Days", "`DailyRevenue`", "DAU", "`PayingUsersCVR`", "`AverageRevenuePerPayingUser`", "Share: DAU", "Share: CVR", "Share: ARPPU"],
    rows, [1, 2, 3, 4, 5, 6, 7],
    "Shares are of the log-change in revenue and can exceed 100% when another term moved the other way. The three terms multiply back to revenue up to rounding in Roblox's own daily figures.",
    "Corpus ONE_DAY `DailyRevenue`, `DailyActiveUsers`, `PayingUsersCVR`, `AverageRevenuePerPayingUser`; weekday-paired means.");
}
{ // matched-DAU
  const hist = range("2026-07-20", "2026-09-10").filter(d => DAU.get(d) && PAY.get(d));
  const rows = POST.map(d => { const v = DAU.get(d); const best = hist.slice().sort((a, b) => Math.abs(DAU.get(a) - v) - Math.abs(DAU.get(b) - v))[0];
    return [`${dow(d)} ${d.slice(5)}`, fi(v), fi(PAY.get(d)), fi(REV.get(d)), `${dow(best)} ${best.slice(5)}`, fi(DAU.get(best)), fi(PAY.get(best)), fi(REV.get(best)), fs_(PAY.get(d) / PAY.get(best) - 1), fs_(REV.get(d) / REV.get(best) - 1)]; });
  T("money", "Matched-DAU check: each post-build day against the earlier day with the closest DAU",
    ["Day", "DAU", "Payers", "Revenue R$", "Closest-DAU day (07-20→09-10)", "Its DAU", "Its payers", "Its revenue R$", "Payers Δ", "Revenue Δ"],
    rows, [1, 2, 3, 5, 6, 7, 8, 9],
    "Holds audience size fixed so the payer count is compared at the same scale. The matched days sit in August, when the audience had a different age and country mix, so this bounds rather than isolates.",
    "Corpus ONE_DAY `DailyActiveUsers`, `PayingUsers`, `DailyRevenue`; nearest absolute DAU among 07-20→09-10.");
}
let hourlyRev = null;
{ // hourly item revenue per concurrent-player-hour (one read, 09-19 09:01Z)
  const R = J(path.join(RAW, "10030829154-2026-09-19T09-01-24-481Z.json"));
  const cap = R.find(c => { try { const q = JSON.parse(c.reqBody || "{}").query || {}; return q.metric === "ItemMonetizationRevenue" && q.granularity === "METRIC_GRANULARITY_ONE_HOUR" && (q.breakdown || []).length; } catch { return false; } });
  const byType = {}; for (const v of cap.body.operation.queryResult.values) { const t = v.breakdownValue[0].value; byType[t] = Object.fromEntries(v.dataPoints.map(p => [p.time.slice(0, 16), p.value])); }
  hourlyRev = byType;
  const pubDay = { "2026-09-04": "v1719 19:12", "2026-09-11": "v1721 16:42", "2026-09-14": "v1722 16:09", "2026-09-17": "v1723 18:11" };
  const rows = range("2026-09-04", "2026-09-18").map(d => { let dp = 0, gp = 0, ccuH = 0, n = 0; for (let h = 0; h < 24; h++) { const t = slot(d, h); const c = hr(t); if (c == null) continue; n++; ccuH += c; dp += byType.DevProduct[t] || 0; gp += byType.GamePass[t] || 0; }
    return [dow(d) + " " + d.slice(5) + (pubDay[d] ? " · " + pubDay[d] : ""), fi(ccuH), fi(dp), fi(gp), n === 24 ? fn(dp / ccuH, 2) : "—", n === 24 ? fn(gp / ccuH, 2) : "—", ARPU.get(d) != null ? "R$" + fn(ARPU.get(d), 3) : "—"]; });
  // 24h either side of v1723 (the publish that re-keyed the shop price-lookup errors)
  const win = (start, hours, type) => { let r = 0, c = 0; for (let k = 0; k < hours; k++) { const t = addH(start, k); const x = hr(t); if (x == null || t >= "2026-09-19T08:00") return null; r += (byType[type][t] || 0); c += x; } return r / c; };
  for (const type of ["DevProduct", "GamePass"]) { const b = win("2026-09-16T18:00", 24, type), a = win("2026-09-17T19:00", 24, type); rows.push([type + ": 24h before v1723 → 24h after (from 19:00)", "", "", "", type === "DevProduct" ? fn(b, 2) + " → " + fn(a, 2) + " (" + fs_(a / b - 1) + ")" : "", type === "GamePass" ? fn(b, 2) + " → " + fn(a, 2) + " (" + fs_(a / b - 1) + ")" : "", ""]); }
  const chk = range("2026-09-05", "2026-09-16").map(d => { let s_ = 0; for (let h = 0; h < 24; h++) for (const t of Object.keys(byType)) s_ += byType[t][slot(d, h)] || 0; return s_ / REV.get(d); });
  T("money", "Item revenue per concurrent-player-hour, by day",
    ["Day (publish, UTC)", "CCU-hours (Σ hourly CCU)", "DevProduct R$", "GamePass R$", "DevProduct R$ per CCU-hour", "GamePass R$ per CCU-hour", "ARPDAU (corpus)"],
    rows, [1, 2, 3, 4, 5, 6],
    "Revenue per hour of play rather than per player, from one read so every hour carries the same restatement lag (the newest hours are the least settled). Sanity check: the daily sums of this hourly read ÷ `DailyRevenue` over 09-05→09-16 run " + fn(Math.min(...chk), 2) + "–" + fn(Math.max(...chk), 2) + ". The last two rows are the only readable money signal for v1723, whose behavioural metrics are not served yet.",
    "Raw bundle `data/raw/10030829154-2026-09-19T09-01-24-481Z.json`, `ItemMonetizationRevenue` ONE_HOUR by `ProductType`; hourly `ConcurrentPlayers` (Open Cloud pull 09-19 09:01Z); ARPDAU = corpus `AverageRevenuePerUser`.");
}

// ================================================================ FUNNELS
const FUN = D.funnels.find(f => f.name === "TutorialFunnel");
const stepName = k => FUN.steps.find(s => s.key === String(k)).step;
function rawFunnel(file) { const R = J(path.join(RAW, file)); const c = R.find(c => (c.reqBody || "").includes("FunnelCohortCompletionRate") && (c.reqBody || "").includes("TutorialFunnel"));
  const out = {}; for (const v of c.body.operation.queryResult.values) { const k = v.breakdownValue[0].value; out[k] = Object.fromEntries(v.dataPoints.map(p => [p.time.slice(0, 10), p.value])); } return { out, at: c.body.operation.metadata.createdTime }; }
const RF19 = rawFunnel("10030829154-2026-09-19T09-01-24-481Z.json"), RF14 = rawFunnel("10030829154-2026-09-14T16-54-33-273Z.json");
// first-read corpus values with capture time
const firstRead = {}; { const m = L.load(ID).metrics.FunnelCohortCompletionRate; for (const s of m.series) { if (s.granularity !== "METRIC_GRANULARITY_ONE_DAY" || Object.keys(s.breakdown || {}).join() !== "FunnelStep") continue;
  const fl = s.filters || []; if (fl.length !== 1 || (fl[0].dimension || fl[0].name) !== "FunnelName" || fl[0].values[0] !== "TutorialFunnel") continue;
  const o = firstRead[s.breakdown.FunnelStep] ||= {}; for (const p of s.points) { if (p.partial || p.status === "FILLED_ZERO") continue; if (!o[p.date]) o[p.date] = { v: p.value, at: p.capturedAt || p.captured_at }; } } }
const ageDays = (d, at) => at ? (Date.parse(at) - Date.parse(d + "T00:00:00Z")) / 864e5 - 1 : null;   // days after the cohort day ended
{ // step-to-step conversion
  const cum = (src, k, d) => src === "first" ? (firstRead[k] && firstRead[k][d] ? firstRead[k][d].v : null) : null;
  const cond = (k, ds) => mean(ds.map(d => { const a = cum("first", k, d), b = cum("first", k - 1, d); return a != null && b ? a / b : null; }));
  const rows = []; for (let k = 2; k <= 15; k++) { const pr = cond(k, PRIOR), b = cond(k, PRE), a = cond(k, POST); rows.push([`${k - 1} → ${k}: ${stepName(k).replace("Tutorial_Main_", "")}`, fp(pr, 1), fp(b, 1), fp(a, 1), fpp(a - b, 1), fpp(b - pr, 1)]); }
  T("funnels", "TutorialFunnel step-to-step conversion (share of players at the previous step who complete this one)",
    ["Step", "PRIOR 08-29→09-02", "PRE 09-05→09", "POST 09-12→16", "Δ this week", "Δ week before"],
    rows, [1, 2, 3, 4, 5],
    "The dumbbells above show cumulative completion from step 1; this shows where the loss happens. Step 5 (`ToRaftShop`) is the tutorial's raft-shop step — the 10.09 spec lists 'raft UI not scrolling (mobile and PC)' as fixed.",
    "Corpus `FunnelCohortCompletionRate` ONE_DAY, `FunnelName=TutorialFunnel`, by `FunnelStep` (first settled read of each cohort day); conditional = C(k) ÷ C(k−1) per day, then the 5-day mean.");
}
{ // maturity bracket
  const steps = [5, 10, 12, 15];
  const rows = [];
  for (const k of steps) {
    const fr = ds => mean(ds.map(d => firstRead[k][d] && firstRead[k][d].v)), frAge = ds => mean(ds.map(d => firstRead[k][d] && ageDays(d, firstRead[k][d].at)));
    const r19 = ds => mean(ds.map(d => RF19.out[k][d])), r14 = ds => mean(ds.map(d => RF14.out[k][d]));
    const ageAt = (ds, at) => mean(ds.map(d => ageDays(d, at)));
    rows.push([stepName(k).replace("Tutorial_Main_", ""), "First read (corpus)", fp(fr(PRE), 1), fp(fr(POST), 1), fpp(fr(POST) - fr(PRE), 1), `${fn(frAge(PRE), 1)} d / ${fn(frAge(POST), 1)} d`]);
    rows.push(["", "Both read 09-19 09:01Z", fp(r19(PRE), 1), fp(r19(POST), 1), fpp(r19(POST) - r19(PRE), 1), `${fn(ageAt(PRE, RF19.at), 1)} d / ${fn(ageAt(POST, RF19.at), 1)} d`]);
    rows.push(["", "PRE read 09-14, POST read 09-19", fp(r14(PRE), 1), fp(r19(POST), 1), fpp(r19(POST) - r14(PRE), 1), `${fn(ageAt(PRE, RF14.at), 1)} d / ${fn(ageAt(POST, RF19.at), 1)} d`]);
  }
  T("funnels", "Cohort maturity: the same comparison under three reads",
    ["Step (cumulative completion)", "Read", "PRE 09-05→09", "POST 09-12→16", "Δ", "Mean cohort age at read, PRE / POST"],
    rows, [2, 3, 4],
    "Cohort rates keep rising for days as players come back. The first read favours POST here (its cohorts were read older); the same-day read favours PRE; the third read is the closest to age-matched. A move that keeps its sign under all three is not a maturity artefact.",
    "Corpus first reads (`capturedAt` per point) and the two raw bundles `data/raw/10030829154-2026-09-19T09-01-24-481Z.json` and `…-2026-09-14T16-54-33-273Z.json` (`FunnelCohortCompletionRate`, `FunnelName=TutorialFunnel`, ONE_DAY). Age = read time − end of cohort day.");
}
{ // step 5 by day
  const rows = range("2026-08-29", "2026-09-18").map(d => { const a = firstRead[5][d], b = firstRead[4][d]; const c19 = RF19.out[5][d] && RF19.out[4][d] ? RF19.out[5][d] / RF19.out[4][d] : null;
    return [`${dow(d)} ${d.slice(5)}`, a && b ? fp(a.v / b.v, 1) : "—", a ? fn(ageDays(d, a.at), 1) : "—", c19 != null ? fp(c19, 1) : "—", a ? fp(a.v, 1) : "—"]; });
  T("funnels", "`Tutorial_Main_5_ToRaftShop` by cohort day, around the 09-11 raft-UI fix",
    ["Cohort day", "Step 4 → 5 conversion (first read)", "Age at first read (days)", "Step 4 → 5 (read 09-19)", "Cumulative completion at step 5 (first read)"],
    rows, [1, 2, 3, 4],
    "The 09-11 cohort straddles the 16:42 publish. For scale, the step-to-step conversions of the neighbouring steps (2→3, 3→4, 6→7, 8→9) run 97–100% in the table above.",
    "Corpus `FunnelCohortCompletionRate` first reads and raw bundle 09-19 09:01Z (covers 09-03→09-18).");
}

// ================================================================ TECHNICAL
{ // clean pairs across five games (09-08 telemetry fault, F28)
  const cleanPost = POST.filter(d => d !== "2026-09-15"), cleanPre = minus7(cleanPost);
  const rows = PF.games.map(g => { const G = J(path.join(DATA, `${g.slug}.json`)); const mm = k => G.metrics.find(m => m.metric === k);
    const c = k => { const m = mm(k); if (!m || m.missing) return "—"; const mp = new Map(Object.entries(m.run)); const r = pairMean(mp, cleanPost, cleanPre); return r.n ? fs_(r.delta) : "—"; };
    const f08 = (() => { const m = mm("ClientFpsP10"); return m && m.run["2026-09-08"] != null && m.run["2026-09-07"] ? fs_(m.run["2026-09-08"] / m.run["2026-09-07"] - 1) : "—"; })();
    return [g.name + (g.slug === "waterslide" ? " ◀" : ""), c("ClientFpsP10"), c("ClientFpsAvg"), c("ClientCrashRate15m"), c("ClientMemoryUsagePercentageAvg"), c("OomUnexpectedExits/DAU"), f08]; });
  T("technical", "Technical rates on the four clean pairs, all five games",
    ["Game", "`ClientFpsP10`", "`ClientFpsAvg`", "`ClientCrashRate15m`", "`ClientMemoryUsagePercentageAvg`", "OOM exits per 1k DAU", "FPS p10 on 09-08 vs 09-07"],
    rows, [1, 2, 3, 4, 5, 6],
    "The 09-08→09-15 pair is dropped because 09-08 carries the portfolio-wide telemetry fault (F28: FPS and memory collapsed on unrelated games that day). The last column shows which games' 09-08 point is affected.",
    "Each game's `reports/2026-09-19/data/<slug>.json` metric runs (Place-filtered unions); pairs 09-05/06/07/09 → 09-12/13/14/16.");
}
{ // fps / crash vs dau, daily
  const fps = daily("ClientFpsP10"), crash = daily("ClientCrashRate15m"), oom = daily("OomUnexpectedExits");
  const pl = bySrc("DailyActiveUsers", "Platform"); const ph = pl.get("Phone"), tb = pl.get("Tablet"), pc = pl.get("Computer");
  const fpsPl = bySrc("ClientFpsP10", "Platform");
  // FPS p10 by platform uses the widest Place set per date; lib.byBreakdown keeps the first series it sees — rebuild widest-first
  const S = L.load(ID).metrics.ClientFpsP10.series.filter(s => s.granularity === "METRIC_GRANULARITY_ONE_DAY" && Object.keys(s.breakdown || {}).join() === "Platform")
    .sort((a, b) => ((b.filters || [])[0] || { values: [] }).values.length - ((a.filters || [])[0] || { values: [] }).values.length);
  const fp_ = {}; for (const s of S) { const o = fp_[s.breakdown.Platform] ||= {}; for (const p of s.points) { if (p.partial || p.status === "FILLED_ZERO") continue; if (!(p.date in o)) o[p.date] = p.value; } }
  const days = range("2026-09-05", "2026-09-18");
  const rows = days.map(d => [`${dow(d)} ${d.slice(5)}`, fi(DAU.get(d)), ph && DAU.get(d) ? fp((ph.get(d) + tb.get(d)) / DAU.get(d), 1) : "—", fn(fps.get(d), 2), fn(fp_["Phone"] && fp_["Phone"][d], 2), fn(fp_["Tablet"] && fp_["Tablet"][d], 2), fn(fp_["Computer"] && fp_["Computer"][d], 2), fp(crash.get(d), 2), DAU.get(d) ? fn(oom.get(d) / DAU.get(d) * 1000, 2) : "—"]);
  const mA = (ds, f) => mean(ds.map(f)); const B_ = range("2026-09-05", "2026-09-10"), A_ = range("2026-09-11", "2026-09-18");
  const mrow = f => { const b = mA(B_, f), a = mA(A_, f); return fn(b, 2) + " → " + fn(a, 2) + " (" + fs_(a / b - 1) + ")"; };
  rows.push(["Mean 09-05→10 → 09-11→18", "", "", mrow(d => fps.get(d)), mrow(d => fp_["Phone"][d]), mrow(d => fp_["Tablet"][d]), mrow(d => fp_["Computer"][d]), (() => { const b = mA(B_, d => crash.get(d)), a = mA(A_, d => crash.get(d)); return fp(b) + " → " + fp(a); })(), ""]);
  const cd = range("2026-08-22", "2026-09-17").filter(d => fps.get(d) && DAU.get(d));
  const rr = L.pearson(cd.map(d => Math.log(DAU.get(d))), cd.map(d => fps.get(d)));
  const cdPh = cd.filter(d => fp_["Phone"] && fp_["Phone"][d] != null);
  const rrPh = L.pearson(cdPh.map(d => Math.log(DAU.get(d))), cdPh.map(d => fp_["Phone"][d]));
  T("technical", "Frame rate, crash rate and OOM exits by day, beside audience size and device mix",
    ["Day", "DAU", "Mobile share of DAU", "`ClientFpsP10`", "FPS p10 Phone", "FPS p10 Tablet", "FPS p10 Computer", "`ClientCrashRate15m`", "OOM exits per 1k DAU"],
    rows, [1, 2, 3, 4, 5, 6, 7, 8],
    `Across 08-22→09-17 (n=${cd.length}), corr(log DAU, FPS p10) = ${fn(rr, 2)}; on Phone alone ${fn(rrPh, 2)} (n=${cdPh.length}). Last row: mean of 09-05→09-10 against 09-11→09-18 per column.`,
    "Corpus ONE_DAY, Place-filtered (widest place set per date): `ClientFpsP10` (total and by `Platform`), `ClientCrashRate15m`, `OomUnexpectedExits`; `DailyActiveUsers` by `Platform` (Mobile = Phone + Tablet).");
}

// ================================================================ ERRORS
{ // error volume by log source per DAU
  const ls = bySrc("ErrorCount", "LogSource"); const cl = ls.get("Client"), sv = ls.get("Server"); const tot = daily("ErrorCount");
  const days = range("2026-09-05", "2026-09-18");
  const rows = days.map(d => [`${dow(d)} ${d.slice(5)}`, fi(tot.get(d)), fi(cl && cl.get(d)), fi(sv && sv.get(d)), DAU.get(d) ? fn(cl.get(d) / DAU.get(d), 2) : "—", DAU.get(d) ? fn(sv.get(d) / DAU.get(d), 2) : "—"]);
  const pw = (m) => { const r = pairMean(new Map(POST.map((d, i) => [d, m.get(d) / DAU.get(d)]).concat(PRE.map(d => [d, m.get(d) && DAU.get(d) ? m.get(d) / DAU.get(d) : null]))), POST, PRE); return r; };
  const c = pw(cl), s = pw(sv);
  rows.push(["Paired mean PRE → POST (per DAU)", "", "", "", `${fn(c.before, 2)} → ${fn(c.after, 2)} (${fs_(c.delta)}, ${c.n} pairs)`, `${fn(s.before, 2)} → ${fn(s.after, 2)} (${fs_(s.delta)}, ${s.n} pairs)`]);
  T("errors", "Errors and warnings by log source, per DAU",
    ["Day", "`ErrorCount` total", "Client", "Server", "Client per DAU", "Server per DAU"],
    rows, [1, 2, 3, 4, 5],
    "Publish days (09-11, 09-14, 09-17) are where this game's server errors normally spike (the publish-path signature recorded in the method). ErrorCount's unit is undocumented, so per-DAU figures are an assumption stacked on an assumption.",
    "Corpus `ErrorCount` ONE_DAY, headline and by `LogSource` (unfiltered universe-wide series); `DailyActiveUsers`.");
}
const {parse} = (() => { function parse(txt) { const recs = []; let row = [], cur = "", q = false; for (let i = 0; i < txt.length; i++) { const c = txt[i];
  if (q) { if (c === '"') { if (txt[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; } else if (c === '"') q = true; else if (c === ",") { row.push(cur); cur = ""; }
  else if (c === "\n") { row.push(cur.replace(/\r$/, "")); recs.push(row); row = []; cur = ""; } else cur += c; } if (cur || row.length) { row.push(cur); recs.push(row); } return recs; } return { parse }; })();
const loadExport = f => { const r = parse(fs.readFileSync(path.join(EXPORTS, f), "utf8").replace(/^﻿/, "")); const h = r[0]; const hasVer = h[4] === "First seen version";
  return r.slice(1).filter(x => x.length >= 5 && x[0] !== "" && Number.isFinite(+x[0])).map(x => hasVer ? { n: +x[0], sev: x[1], type: x[2], at: x[3], ver: x[4], msg: x[5], trace: x[6] || "" } : { n: +x[0], sev: x[1], type: x[2], at: x[3], msg: x[4], trace: x[5] || "", ver: "" }); };
const toUTC = s => { const m = (s || "").match(/(\w{3}) (\d{2}) (\d{4}) (\d{2}):(\d{2}):(\d{2}) GMT([+-]\d{4})/); if (!m) return ""; const mon = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }[m[1]];
  const off = (+m[7].slice(0, 3)) * 60 + Math.sign(+m[7].slice(0, 3) || 1) * (+m[7].slice(3)); const t = Date.UTC(+m[3], mon, +m[2], +m[4], +m[5], +m[6]) - off * 60e3; return new Date(t).toISOString().slice(0, 16).replace("T", " "); };
const norm = s => (s || "").replace(/\s+/g, " ").replace(/UserId=(\d+|<PlayerId>)/g, "UserId=<id>").replace(/: \d{6,}\b/g, ": <id>").slice(0, 70);
const EXFILES = fs.readdirSync(EXPORTS).filter(f => f.endsWith(".csv")).sort();
{ // export inventory
  const today = EXFILES.filter(f => f.startsWith("errors_2026-09-19"));
  const desc = { "since-v1721_7d": "first seen at v1721 or later, last 7 days", "since-v1722_7d": "first seen at v1722 or later, last 7 days", "since-v1723_7d": "first seen at v1723 or later, last 7 days", "v1294-v1708_7d": "all versions, last 7 days (label = first-seen band of the rows)" };
  const rows = today.map(f => { const x = loadExport(f); const tot = sum(x.map(r => r.n)); const k = Object.keys(desc).find(k => f.includes(k));
    const tail = x.slice(-5).map(r => r.n); const minN = Math.min(...x.map(r => r.n));
    return [f.replace(/^errors_/, ""), desc[k] || "", String(x.length), fi(tot), fp(x[0].n / tot, 0), fi(minN)]; });
  T("errors", "Error exports pulled 2026-09-19 (ROOT place only)",
    ["File", "Filter", "Signatures (cap 25)", "Events in the list", "Top signature's share", "Smallest listed count"],
    rows, [2, 3, 4, 5],
    "Every export was filtered to the root place `139617346573330`, so errors thrown in the seven sub-places — including the new world, place `76865069793948` 'Heaven' — are not in these files. All four hit the 25-row cap, so absence from a list is never evidence.",
    "`data/exports/10030829154-climb-waterslide-and-slide/errors/errors_2026-09-19_*.csv`, parsed with a quoted-CSV reader (stack traces span lines).");
}
{ // new vs re-emitted signatures
  const newer = ["errors_2026-09-19_0920_since-v1721_7d_57rows.csv", "errors_2026-09-19_0921_since-v1722_7d_54rows.csv", "errors_2026-09-19_0922_since-v1723_7d_65rows.csv"];
  const earlier = EXFILES.filter(f => f < "errors_2026-09-19").map(f => [f, loadExport(f)]);
  const surf = m => /GetDeveloperProductInfo|MarketplaceService/.test(m) ? "Shop — product price lookup (client)" : /GoShop_Raft/.test(m) ? "Raft shop UI, list refresh on open" : /RaceClaimCoins|RaceService/.test(m) ? "Cash claim at the end of a slide run" :
    /SavePlayerData|DataStore read/.test(m) ? "Player save / load" : /CopyTableScript|GamePassMgr/.test(m) ? "Server per-player tick (game-pass data copy)" : /Teleport/.test(m) ? "Teleport between worlds" : "Other";
  // group key: normalised message; the price-lookup failures differ only by network reason and are grouped
  const key = r => /GetDeveloperProductInfo failed/.test(r.msg) ? "GetDeveloperProductInfo failed: <network reason>" : norm(r.msg);
  const agg = new Map(); const DAUW = mean(range("2026-09-12", "2026-09-17").map(d => DAU.get(d)));
  for (const f of newer) { const per = new Map(); for (const r of loadExport(f)) { const k = key(r); const o = per.get(k) || { n: 0, rows: 0, first: toUTC(r.at), r }; o.n += r.n; o.rows++; if (toUTC(r.at) < o.first) o.first = toUTC(r.at); per.set(k, o); }
    for (const [k, o] of per) { const cur = agg.get(k); if (!cur || o.n > cur.n) agg.set(k, { ...o, file: f }); } }   // keep the file that lists it most fully
  const rows = [...agg.entries()].sort((a, b) => b[1].n - a[1].n).map(([k, o]) => {
    const match = r => key(r) === k && (k.startsWith("GetDeveloperProductInfo") || r.type === o.r.type);
    const hits = earlier.map(([f, x]) => [f, sum(x.filter(match).map(r => r.n))]).filter(x => x[1] > 0);
    const label = k.startsWith("GetDeveloperProductInfo") ? "MarketplaceService::getProductInfo — GetDeveloperProductInfo failed: HTTP request failed (DnsResolve / Timedout / ConnectFail / NetFail / TLS / 503)" : o.r.msg.replace(/\s+/g, " ").slice(0, 110);
    const perK = o.n / 7 / DAUW * 1000;
    return [label, o.r.sev + " · " + o.r.type, o.r.ver, o.first, fi(o.n) + (o.rows > 1 ? " (" + o.rows + " rows)" : ""), fn(perK, 2), hits.length ? "yes: " + hits.length + " earlier file(s), first " + hits[0][0].slice(7, 17) : "no — new text", surf(o.r.msg)]; });
  T("errors", "What the builds since 11 Sep introduced: signatures first seen at v1721, v1722 or v1723 (root place)",
    ["Message", "Severity · source", "First seen version", "First seen (UTC)", "Count, last 7 days (listed rows)", "Per 1k DAU per day", "Same text in an earlier export?", "Surface (from the script path / message)"],
    rows, [4, 5],
    "'First seen at vN' is keyed on (message, stack). The price-lookup failures carry the same client call path as before (`ProductMgr.GetProductPrice` from `UI.HUD` line 110) but at ProductMgr line 133 instead of 125, and one row adds a call from `GoShop_Raft.setSpeedDisplay` — which is why a long-standing message is filed under v1723. The three `[RaceService] RaceClaimCoins` warnings and the v1722 save/teleport rows are new text. Counts are floors: every list hit the 25-row cap. Per 1k DAU per day = count ÷ 7 ÷ mean universe DAU 09-12→09-17 (" + fi(DAUW) + "). v1723 had been live ~37 hours when the list was pulled, so the 7-day divisor understates its rows — the next table gives their rate.",
    "The three `since-v17xx_7d` exports (09-19 09:20–09:22 CEST) against every earlier export in the same folder, matched on normalised message text (player ids masked) and log source; stack traces read from the export's trace column. First-seen times converted from CEST to UTC.");
}
{ // the price-lookup failure rate before/after v1723
  const e1 = loadExport("errors_2026-09-11_1707_no-version_1d_138rows.csv"), e3 = loadExport("errors_2026-09-19_0922_since-v1723_7d_65rows.csv");
  const reasons = ["DnsResolve", "Timedout", "ConnectFail"];
  const pick = (x, re) => sum(x.filter(r => /GetDeveloperProductInfo failed/.test(r.msg) && re.test(r.msg.trim())).map(r => r.n));
  const h1 = 24, h3 = (Date.parse("2026-09-19T07:22:00Z") - Date.parse("2026-09-17T18:20:00Z")) / 3600e3;
  const d1 = mean(["2026-09-10", "2026-09-11"].map(d => DAU.get(d))), d3 = DAU.get("2026-09-17");
  const rows = reasons.map(rn => { const a = pick(e1, new RegExp(rn + "$")), b = pick(e3, new RegExp(rn + "$")); return [rn, fi(a), fn(a / h1 * 24 / d1 * 1000, 1), fi(b), fn(b / h3 * 24 / d3 * 1000, 1)]; });
  const A = sum(reasons.map(rn => pick(e1, new RegExp(rn + "$")))), B = sum(reasons.map(rn => pick(e3, new RegExp(rn + "$"))));
  rows.push(["Three reasons together", fi(A), fn(A / h1 * 24 / d1 * 1000, 1), fi(B), fn(B / h3 * 24 / d3 * 1000, 1)]);
  T("errors", "Shop price-lookup failures (`GetDeveloperProductInfo`) per 1k DAU per day, before and after v1723",
    ["Network reason", "09-11 1-day export (24h to 09-11 15:07 UTC)", "per 1k DAU per day", "Since-v1723 export (09-17 18:20 → 09-19 07:22 UTC, " + fn(h3, 1) + "h)", "per 1k DAU per day"],
    rows, [1, 2, 3, 4],
    "Only the three reasons listed in both exports are compared. Both lists are capped at 25 rows, so both columns are floors. DAU: mean of 09-10/11 (" + fi(d1) + ") and 09-17 (" + fi(d3) + ", the newest served day). The failure text names a network condition on the player's connection, not a script error.",
    "`errors_2026-09-11_1707_no-version_1d_138rows.csv` (place filter not recorded) and `errors_2026-09-19_0922_since-v1723_7d_65rows.csv` (root place); corpus `DailyActiveUsers`.");
}
{ // chronic top signatures, per day, 7-day vs earlier 1-day export
  const e7 = loadExport("errors_2026-09-19_0920_v1294-v1708_7d_192rows.csv"), e1 = loadExport("errors_2026-09-11_1707_no-version_1d_138rows.csv");
  const dau7 = mean(range("2026-09-12", "2026-09-18").map(d => DAU.get(d) || null)), dau1 = mean(["2026-09-10", "2026-09-11"].map(d => DAU.get(d)));
  const rows = e7.slice(0, 12).map(r => { const k = norm(r.msg); const o = e1.filter(x => norm(x.msg) === k && x.type === r.type); const n1 = sum(o.map(x => x.n));
    return [r.msg.replace(/\s+/g, " ").slice(0, 90), r.sev + " · " + r.type, fi(r.n / 7), fn(r.n / 7 / dau7 * 1000, 1), o.length ? fi(n1) : "not listed", o.length ? fn(n1 / dau1 * 1000, 1) : "—"]; });
  T("errors", "The loudest standing signatures: last 7 days against the 1-day export of 09-11 (per 1k DAU)",
    ["Message (truncated)", "Severity · source", "Per day, 7-day export", "Per 1k DAU per day", "1-day export to 09-11 15:07 UTC", "Per 1k DAU"],
    rows, [2, 3, 4, 5],
    "Per-1k-DAU uses universe-wide mean DAU (" + fi(dau7) + " for 09-12→09-18 where served; " + fi(dau1) + " for 09-10/11) against place-filtered error lists, so it is comparable row to row, not as an absolute rate. Both exports are capped at 25 rows.",
    "`errors_2026-09-19_0920_v1294-v1708_7d_192rows.csv` (root place, all versions) and `errors_2026-09-11_1707_no-version_1d_138rows.csv` (all versions; place filter not recorded).");
}

// ================================================================ SENTIMENT
const FROWS = FB.rows.filter(r => r.d >= "2026-08-28").sort((a, b) => a.t < b.t ? -1 : 1);
const periodOf = r => r.d <= "2026-09-11" ? "pre" : "post";
{ // themes by period
  const themes = [
    ["Raft / slide shop won't scroll or keeps jumping", /raft|rafting|плот|bè|slide menu|buying slide|tea cup/i, /scroll|glitch|bug|broken|terrible|не работает|quay lại|back to start|earthquake|scroll up/i],
    ["Progress, items or purchases lost", /gone|disapear|disappear|lost|took away|progress|прогресс|quita mis cosas|no tengo nada|primeira fase|everything i had|zerado/i, null],
    ["Cash not received after a run", /don.?t get any money|no money|not receiving cash|don't have money/i, null],
    ["Other bug / glitch / lag / freeze", /bug|glitch|lag|freez|завис|bugea|bugado|doesn.?t let me move|isn.?t working/i, null],
    ["Asks for more content / codes / songs", /more worlds|mais mundos|more code|give me a code|add |more slides|difficult/i, null],
    ["Plain praise", /love|fun|fave|best game|good|gud|amei|adorei|chido|好玩|おもしろい|relaxing/i, null]];
  const counts = themes.map(([lab, re, re2]) => { const hit = r => re.test(r.comment || "") && (!re2 || re2.test(r.comment || ""));
    const pre = FROWS.filter(r => periodOf(r) === "pre"), post = FROWS.filter(r => periodOf(r) === "post");
    return [lab, `${pre.filter(hit).length} of ${pre.length}`, `${post.filter(hit).length} of ${post.length}`, `${FROWS.filter(hit).filter(r => /Down/i.test(r.cat)).length} of ${FROWS.filter(hit).length}`]; });
  T("sentiment", "Review themes before and after the 09-11 build (regex counts)",
    ["Theme", "08-28 → 09-11 (v1715–v1719)", "09-12 → 09-19 (v1721–v1723)", "Of which downvotes (both periods)"],
    counts, [1, 2, 3],
    "A review can carry several themes. The raft-shop theme needs both a raft/shop word and a scroll/broken word (several languages). The n is small: say it with every number. If raft complaints were equally likely in both periods, 0 of 12 after would happen with probability " + (() => { const lg = n => { let t = 0; for (let i = 2; i <= n; i++) t += Math.log(i); return t; }; const C = (n, k) => lg(n) - lg(k) - lg(n - k); const pre = FROWS.filter(r => periodOf(r) === "pre"), post = FROWS.filter(r => periodOf(r) === "post"); const re = /raft|rafting|плот|bè|slide menu|buying slide|tea cup/i, re2 = /scroll|glitch|bug|broken|terrible|не работает|quay lại|back to start|earthquake|scroll up/i; const k = pre.filter(r => re.test(r.comment || "") && re2.test(r.comment || "")).length; const N = pre.length + post.length; return Math.exp(C(N - k, post.length) - C(N, post.length)).toFixed(3); })() + " (one-sided hypergeometric).",
    `Merged review history \`reports/2026-09-19/data/feedback-${ID}.json\` (409 rows, 05-15→09-19), rows dated 08-28→09-19 (${FROWS.length}). Regexes are in \`tools/r0919/extras/waterslide.js\`.`);
}
{ // device & vote by build
  const grp = r => /Phone|Tablet/i.test(r.device) ? "Mobile" : /Computer/i.test(r.device) ? "Computer" : r.device || "other";
  const since = FB.rows.filter(r => r.d >= "2026-09-04");
  const builds = [...new Set(since.map(r => String(r.v)))].sort();
  const rows = builds.map(v => { const x = since.filter(r => String(r.v) === v); const g = k => x.filter(r => grp(r) === k); const dn = a => a.filter(r => /Down/i.test(r.cat)).length;
    return [`v${v}`, `${x.map(r => r.d).sort()[0].slice(5)} → ${x.map(r => r.d).sort().at(-1).slice(5)}`, `${g("Mobile").length} (${dn(g("Mobile"))} down)`, `${g("Computer").length} (${dn(g("Computer"))} down)`, fp(dn(x) / x.length, 0)]; });
  { const g = k => since.filter(r => grp(r) === k); const dn = a => a.filter(r => /Down/i.test(r.cat)).length;
    rows.push(["All builds", "09-04 → 09-19", g("Mobile").length + " (" + dn(g("Mobile")) + " down)", g("Computer").length + " (" + dn(g("Computer")) + " down)", fp(dn(since) / since.length, 0)]); }
  T("sentiment", "Reviews since 09-04 by build and device class",
    ["Build (root `asset_version`)", "Dates", "Mobile = Phone + Tablet", "Computer", "Downvote share"],
    rows, [2, 3, 4],
    `${since.length} reviews in total — too few to rate a build on; read with the theme table.`,
    `Merged review history \`feedback-${ID}.json\`, rows dated 09-04→09-19.`);
}

// ================================================================ APPENDIX
{ // RSVP increments around three launches
  const R = daily("RSVPCount"); const rows = [];
  for (const [lab, d] of [["08-07 launch", "2026-08-07"], ["08-28 launch", "2026-08-28"], ["09-11 launch", "2026-09-11"]]) {
    const inc = k => { const a = R.get(addDays(d, k)), b = R.get(addDays(d, k - 1)); return a != null && b != null ? a - b : null; };
    rows.push([lab, ...[-2, -1, 0, 1, 2].map(k => fi(inc(k))), fi(DAU.get(addDays(d, 1)) - DAU.get(addDays(d, -6)))]);
  }
  T("appendix", "Event RSVPs around the three new-world launches (daily increments of `RSVPCount`)",
    ["Launch", "Day −2", "Day −1", "Launch day", "Day +1", "Day +2", "DAU change, day +1 vs same weekday −7"],
    rows, [1, 2, 3, 4, 5, 6],
    "`RSVPCount` is cumulative (1.1M) and occasionally jumps by ~205K in one day (a batch roll-up on 08-14 and 08-21), so only small daily increments are read. Increments of a few hundred to ~2,000 a day are three orders below the DAU moves.",
    "Corpus `RSVPCount` ONE_DAY, first differences; `DailyActiveUsers`.");
}

fs.writeFileSync(path.join(DATA, "extras-waterslide.json"), JSON.stringify({ builtAt: new Date().toISOString(), tables }, null, 1));
console.log(`wrote extras-waterslide.json: ${tables.length} tables`);
for (const t of tables) console.log(`- [${t.section}] ${t.title} (${t.rows.length} rows)`);
