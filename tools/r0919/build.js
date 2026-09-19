// Build every number the 2026-09-19 report needs, per game, into
// reports/2026-09-19/data/<slug>.json (+ portfolio.json). Nothing downstream
// hand-transcribes a figure: the analysts read these files, the renderer prints them.
//
// WINDOW. Every game published on Fri 2026-09-11. The read is that build's week:
//   POST = Sat 09-12 → Wed 09-16   (clean: excludes the 09-11 and 09-17 publish days)
//   PRE  = Sat 09-05 → Wed 09-09   (the previous build's same weekdays)
//   PRIOR= Sat 08-29 → Wed 09-02   (one more week back, to test acceleration)
// Days are paired by weekday (D vs D-7) and a metric only uses the pairs where BOTH
// sides exist, so a metric that lags (D1, revenue) is still compared like-for-like.
// Every metric records which days it actually landed on.
//
//   node tools/r0919/build.js
const fs = require("fs");
const path = require("path");
const L = require("../lib.js");
const ROOT = L.ROOT;
const OUT = path.join(ROOT, "reports/2026-09-19/data");
fs.mkdirSync(OUT, { recursive: true });

const addDays = (d, n) => { const x = new Date(d + "T00:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const range = (a, b) => { const o = []; for (let d = a; d <= b; d = addDays(d, 1)) o.push(d); return o; };
const POST = range("2026-09-12", "2026-09-16");
const PRE = POST.map(d => addDays(d, -7));
const PRIOR = POST.map(d => addDays(d, -14));
const RUN = range("2026-08-15", "2026-09-19");
const DOD = range("2026-09-11", "2026-09-19");          // day-on-day, each vs D-7
const TODAY = "2026-09-19";

const GAMES = [
  { id: "9963622286", slug: "brainrot", name: "Become a Brainrot", root: "99255447043899" },
  { id: "10030829154", slug: "waterslide", name: "Climb Waterslide and Slide", root: "139617346573330" },
  { id: "10399712766", slug: "monkey", name: "+1 Banana Monkey Destruction", root: "83256791430098" },
  { id: "10565445771", slug: "verity", name: "Verity Companion [AI]", root: "74542317333958" },
  { id: "10638354731", slug: "seal", name: "Seal A Driveway", root: "120014184236770" },
];

// [group, label, metric, unit, lowerIsBetter, kind]
const METRICS = [
  ["Reach", "Impressions (unique users)", "UniqueUsersWithImpressions", "int", false, "volume"],
  ["Reach", "Visits", "Visits", "int", false, "volume"],
  ["Reach", "Impression→play CVR", "EndToEndCVR", "pct", false, "rate"],
  ["Reach", "RFY play-through rate", "RFYPlayThroughRate", "pct", false, "rate"],
  ["Reach", "RFY qualified PTR", "RFYQualifiedPTR", "pct", false, "rate"],
  ["Reach", "Listing rejections / M impressions", "RFYUniqueNotInterestedUsersPerMillionImpressions", "num1", true, "rate"],
  ["Audience", "DAU", "DailyActiveUsers", "int", false, "volume"],
  ["Audience", "Unique users with plays", "UniqueUsersWithPlaySessions", "int", false, "volume"],
  ["Audience", "Peak concurrents (daily)", "PeakConcurrentPlayers", "int", false, "volume"],
  ["Audience", "MAU", "MonthlyActiveUsers", "int", false, "volume"],
  ["Audience", "DAU / MAU stickiness", "DauMauStickiness", "pct", false, "rate"],
  ["Audience", "Joined from notifications", "UsersJoinedFromNotifications", "int", false, "volume"],
  ["First session", "D1 retention", "ForwardD1Retention", "pct", false, "rate"],
  ["First session", "Session length (min)", "AverageSessionLengthMinutes", "min", false, "rate"],
  ["First session", "Session duration avg (s)", "SessionDurationSecondsAvg", "int", false, "rate"],
  ["First session", "Play min per DAU", "AveragePlayTimeMinutesPerDAU", "min", false, "rate"],
  ["First session", "Total play hours", "TotalPlayTimeHours", "int", false, "volume"],
  ["First session", "RFY bounce <60s", "RFYDuration0To60", "pct", true, "rate"],
  ["First session", "RFY bounce 61–180s", "RFYDuration61To180", "pct", true, "rate"],
  ["First session", "RFY D1 playtime", "RFYD1Playtime", "num2", false, "rate"],
  ["First session", "RFY D1 qualified sessions", "RFYD1QualifiedPlaySessions", "num3", false, "rate"],
  ["First session", "RFY D1 co-play days", "RFYD1CoplayDays", "num3", false, "rate"],
  ["Return loop", "D7 retention", "ForwardD7Retention", "pct", false, "rate"],
  ["Return loop", "RFY L7 play days", "RFYL7PlayDays", "num3", false, "rate"],
  ["Return loop", "RFY D2–7 play days", "RFYD2To7PlayDays", "num3", false, "rate"],
  ["Return loop", "RFY D2–7 playtime", "RFYD2To7Playtime", "num2", false, "rate"],
  ["Return loop", "RFY D2–7 qualified sessions", "RFYD2To7QualifiedPlaySessions", "num3", false, "rate"],
  ["Return loop", "RFY D2–7 co-play days", "RFYD2To7CoplayDays", "num3", false, "rate"],
  ["Return loop", "RFY D8–28 play days", "RFYD8To28PlayDays", "num3", false, "rate"],
  ["Return loop", "RFY D8–28 playtime", "RFYD8To28Playtime", "num2", false, "rate"],
  ["Return loop", "RFY D8–28 qualified sessions", "RFYD8To28QualifiedPlaySessions", "num3", false, "rate"],
  ["Money", "Revenue", "DailyRevenue", "robux0", false, "volume"],
  ["Money", "ARPDAU", "AverageRevenuePerUser", "robux", false, "rate"],
  ["Money", "ARPPU", "AverageRevenuePerPayingUser", "robux", false, "rate"],
  ["Money", "Paying users", "PayingUsers", "int", false, "volume"],
  ["Money", "Paying-user CVR", "PayingUsersCVR", "pct", false, "rate"],
  ["Money", "RFY D1 Robux spend", "RFYD1RobuxSpend", "num2", false, "rate"],
  ["Money", "RFY D1 spend days", "RFYD1SpendDay", "num3", false, "rate"],
  ["Money", "RFY D2–7 Robux spend", "RFYD2To7RobuxSpend", "num2", false, "rate"],
  ["Money", "RFY D2–7 spend days", "RFYD2To7SpendDays", "num3", false, "rate"],
  ["Technical", "Client crash rate (15m)", "ClientCrashRate15m", "pct", true, "rate"],
  ["Technical", "Client crashes", "ClientCrashCount", "int", true, "volume"],
  ["Technical", "OOM exits", "OomUnexpectedExits", "int", true, "volume"],
  ["Technical", "Server crashes", "ServerCrashCount", "int", true, "volume"],
  ["Technical", "Client FPS p10", "ClientFpsP10", "num2", false, "rate"],
  ["Technical", "Client FPS avg", "ClientFpsAvg", "num2", false, "rate"],
  ["Technical", "Client memory %", "ClientMemoryUsagePercentageAvg", "pct", true, "rate"],
  ["Technical", "Client memory avg (MB)", "ClientMemoryUsageAvg", "num1", true, "rate"],
  ["Technical", "Client CPU ms/frame", "ClientCpuTimeAvg", "num2", true, "rate"],
  ["Technical", "Server CPU time avg", "CpuTimeAvg", "num2", true, "rate"],
  ["Technical", "Server frame rate p10", "ServerFrameRateP10", "num2", false, "rate"],
  ["Technical", "Server memory avg", "MemoryUsageAvg", "num1", true, "rate"],
  ["Technical", "Errors + warnings", "ErrorCount", "int", true, "volume"],
  ["Sentiment", "Feedback votes (up − down)", "PlayerFeedbackVotesCount", "int", false, "volume"],
];

const raw = {};
const series = id => (raw[id] ||= JSON.parse(fs.readFileSync(path.join(ROOT, "data/games", id, "series.json"), "utf8")));
const placeCount = s => { const f = (s.filters || []).find(x => (x.dimension || x.name) === "Place"); return f ? (f.values || []).length : 0; };
const onlyPlace = s => (s.filters || []).every(f => (f.dimension || f.name) === "Place");

// Headline daily map. Place filters scope, never slice; on a multi-place universe
// several Place-filtered unions exist over time, so prefer the WIDEST place set for
// each date (the one that includes every place live that day). Partial and
// FILLED_ZERO points are dropped. Also returns captured_at per date.
function headline(id, metric, gran = "METRIC_GRANULARITY_ONE_DAY") {
  const m = series(id).metrics[metric]; if (!m) return null;
  const cands = (m.series || []).filter(s => s.granularity === gran && !Object.keys(s.breakdown || {}).length && onlyPlace(s))
    .sort((a, b) => placeCount(b) - placeCount(a));
  if (!cands.length) return null;
  const v = new Map(), cap = new Map();
  for (const s of cands) for (const p of s.points) {
    if (p.partial || p.status === "FILLED_ZERO") continue;
    if (p.date > TODAY) continue;                       // F16 phantom future rows
    if (!v.has(p.date)) { v.set(p.date, p.value); cap.set(p.date, p.captured_at || p.capturedAt || null); }
  }
  return { v, cap };
}
function breakdown(id, metric, dim, gran = "METRIC_GRANULARITY_ONE_DAY") {
  const m = series(id).metrics[metric]; if (!m) return null;
  const cands = (m.series || []).filter(s => s.granularity === gran && Object.keys(s.breakdown || {}).includes(dim)
    && Object.keys(s.breakdown).length === 1 && L.isWholePopulation(s, dim)).sort((a, b) => placeCount(b) - placeCount(a));
  if (!cands.length) return null;
  const out = {};
  for (const s of cands) {
    const lbl = (s.breakdownLabels && s.breakdownLabels[dim]) || s.breakdown[dim];
    const mm = (out[lbl] ||= {});
    for (const p of s.points) { if (p.partial || p.status === "FILLED_ZERO" || p.date > TODAY) continue; if (!(p.date in mm)) mm[p.date] = p.value; }
  }
  return out;
}

const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
function paired(map, postDays, preDays) {
  const pairs = [];
  postDays.forEach((d, i) => { const a = map.get ? map.get(preDays[i]) : map[preDays[i]], b = map.get ? map.get(d) : map[d];
    if (a != null && b != null && Number.isFinite(a) && Number.isFinite(b)) pairs.push([preDays[i], d, a, b]); });
  const before = avg(pairs.map(p => p[2])), after = avg(pairs.map(p => p[3]));
  return { pairs: pairs.length, days: pairs.map(p => p[1]), before, after,
    delta: (before != null && after != null && before && before * after > 0) ? after / before - 1 : null,
    abs: (before != null && after != null) ? after - before : null };
}
const toObj = (map, days) => Object.fromEntries(days.map(d => [d, map && map.has(d) ? map.get(d) : null]));

function annotations(id) {
  const txt = fs.readFileSync(path.join(ROOT, "data/games", id, "annotations.md"), "utf8");
  const rows = [];
  for (const line of txt.split("\n")) {
    const m = line.match(/^- `(\{.*\})`$/); if (!m) continue;
    let j; try { j = JSON.parse(m[1]); } catch { continue; }
    const t = j.createdUtcTime || ""; if (t < "2026-08-28" || t > "2026-09-20") continue;
    const md = j.metadata || {}; let what = j.annotationType.replace("ANNOTATION_TYPE_", "");
    if (md.experienceEventState) what += `: ${md.experienceEventState.eventName.trim()} ${md.experienceEventState.eventStateType.replace("EVENT_STATE_TYPE_EVENT_", "")}`;
    else if (md.engineRelease) what += `: ${md.engineRelease.platform.replace("ENGINE_RELEASE_PLATFORM_", "")} ${md.engineRelease.releaseMajorVersion}`;
    else if (md.placeThumbnail) what += `: ${(md.placeThumbnail.thumbnailAssetIds || []).join(",")}`;
    else if (md.placeIcon) what += `: ${md.placeIcon.iconAssetId}`;
    else what += ` ${JSON.stringify(md).slice(0, 160)}`;
    rows.push({ t, type: j.annotationType, what });
  }
  const seen = new Set();
  return rows.filter(r => { const k = r.t + r.what; if (seen.has(k)) return false; seen.add(k); return true; }).sort((a, b) => a.t < b.t ? -1 : 1);
}

function deployLog(id) {
  const out = { daily: [], halfhour: [] };
  for (const f of ["a", "b"]) {
    const p = path.join(ROOT, "reports/2026-09-19/deploy", `${id}-${f}.md`); if (!fs.existsSync(p)) continue;
    let sec = null;
    for (const line of fs.readFileSync(p, "utf8").split("\n")) {
      if (line.startsWith("## Daily")) sec = "daily"; else if (line.startsWith("## Half")) sec = "halfhour";
      const m = line.match(/^\| v(\d+) \| ([^|]+) \| ([^|]+) \| (\d+) \| ([\d ]+) \|/);
      if (m && sec) out[sec].push({ v: +m[1], first: m[2].trim(), last: m[3].trim(), n: +m[4], errors: +m[5].replace(/ /g, ""), src: f });
    }
  }
  // merge a/b: earliest first, latest last, max errors
  const merge = arr => { const by = {}; for (const r of arr) { const o = by[r.v] ||= { ...r };
    if (r.first < o.first) o.first = r.first; if (r.last > o.last) o.last = r.last; o.errors = Math.max(o.errors, r.errors); } return Object.values(by).sort((a, b) => a.v - b.v); };
  return { daily: merge(out.daily), halfhour: merge(out.halfhour) };
}

function placeVersions(id) {
  const p = path.join(ROOT, "data/games", id, "place-versions.csv");
  const [h, ...rows] = fs.readFileSync(p, "utf8").trim().split("\n");
  return rows.map(r => r.split(",")).map(([v, t, d, place, pub]) => ({ v: +v, t, d, place, published: pub === "true" }))
    .filter(r => r.d >= "2026-08-28").sort((a, b) => a.t < b.t ? -1 : 1);
}

function feedback(id) {
  // Prefer the merged history (tools/r0919/feedback-merge.js): feedback.csv is truncated by any short grab.
  const mp = path.join(OUT, `feedback-${id}.json`);
  if (fs.existsSync(mp)) { const F = JSON.parse(fs.readFileSync(mp, "utf8"));
    return { n: F.n, span: F.span, source: "merged raw bundles + live log", byVersion: F.byVersion, byDay: F.byDay,
      window: F.rows.filter(r => r.d >= "2026-09-04").map(r => ({ t: r.t, d: r.d, v: String(r.v), cat: r.cat, os: r.os, device: r.device, comment: r.comment })) }; }
  const p = path.join(ROOT, "data/games", id, "feedback.csv"); if (!fs.existsSync(p)) return { rows: [] };
  const txt = fs.readFileSync(p, "utf8");
  // RFC4180-ish parser (comments may contain commas / quotes / newlines)
  const recs = []; let row = [], cur = "", q = false;
  for (let i = 0; i < txt.length; i++) { const c = txt[i];
    if (q) { if (c === '"') { if (txt[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true; else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n") { row.push(cur.replace(/\r$/, "")); recs.push(row); row = []; cur = ""; } else cur += c; }
  if (cur || row.length) { row.push(cur); recs.push(row); }
  const [hdr, ...data] = recs; const ix = Object.fromEntries(hdr.map((h, i) => [h.trim(), i]));
  const rows = data.filter(r => r.length >= hdr.length - 1).map(r => ({ t: r[ix.created_utc], d: r[ix.date], v: r[ix.asset_version],
    cat: r[ix.category], opt: r[ix.options], os: r[ix.os], device: r[ix.device], comment: r[ix.comment] }));
  const byVer = {}, byDay = {};
  for (const r of rows) { const a = byVer[r.v] ||= { up: 0, down: 0, n: 0, first: r.d, last: r.d }; a.n++;
    if (/down/i.test(r.cat)) a.down++; else if (/up/i.test(r.cat)) a.up++; if (r.d < a.first) a.first = r.d; if (r.d > a.last) a.last = r.d;
    const b = byDay[r.d] ||= { up: 0, down: 0, n: 0 }; b.n++; if (/down/i.test(r.cat)) b.down++; else if (/up/i.test(r.cat)) b.up++; }
  return { n: rows.length, span: rows.length ? [rows.map(r => r.d).sort()[0], rows.map(r => r.d).sort().at(-1)] : null,
    byVersion: byVer, byDay, window: rows.filter(r => r.d >= "2026-09-04").sort((a, b) => a.t < b.t ? -1 : 1) };
}

function funnels(id) {
  const m = series(id).metrics["FunnelCohortCompletionRate"]; if (!m) return [];
  const scopes = {};
  for (const s of m.series) {
    if (s.granularity !== "METRIC_GRANULARITY_ONE_DAY") continue;
    if (Object.keys(s.breakdown || {}).join() !== "FunnelStep") continue;
    const fl = s.filters || [];
    if (fl.some(f => (f.dimension || f.name) !== "FunnelName")) continue;      // drop step-filtered duplicates
    const fn = (fl.find(f => (f.dimension || f.name) === "FunnelName") || {}).values;
    if (!fn || fn.length !== 1) continue;                                        // a union across funnels is a blend
    const stepKey = s.breakdown.FunnelStep, step = (s.breakdownLabels && s.breakdownLabels.FunnelStep) || stepKey;
    const sc = scopes[fn[0]] ||= {};
    const st = sc[stepKey] ||= { key: stepKey, step, daily: {}, cap: {} };
    if (step && step !== stepKey) st.step = step;
    for (const p of s.points) { if (p.partial || p.status === "FILLED_ZERO" || p.date > TODAY) continue;
      if (!(p.date in st.daily)) { st.daily[p.date] = p.value; st.cap[p.date] = p.captured_at || null; } }
  }
  const out = [];
  for (const [name, steps] of Object.entries(scopes)) {
    const arr = Object.values(steps).map(st => {
      const mp = new Map(Object.entries(st.daily));
      const k = paired(mp, POST, PRE), k2 = paired(mp, PRE, PRIOR);
      return { key: st.key, step: st.step, before: k.before, after: k.after, dpp: k.abs == null ? null : k.abs * 100, pairs: k.pairs,
        priorBefore: k2.before, priorDpp: k2.abs == null ? null : k2.abs * 100,
        run: Object.fromEntries(RUN.filter(d => d >= "2026-08-29").map(d => [d, st.daily[d] ?? null])),
        capturedAt: Object.fromEntries(RUN.filter(d => d >= "2026-09-01").map(d => [d, st.cap[d] ?? null])) };
    });
    // order by the step's numeric key when it is numeric, else by completion
    arr.sort((a, b) => (/^\d+$/.test(a.key) && /^\d+$/.test(b.key)) ? (+a.key - +b.key) : ((b.after ?? 0) - (a.after ?? 0)));
    out.push({ name, steps: arr });
  }
  return out;
}

function hourlyProduct(id) {
  const bd = breakdown(id, "ItemMonetizationRevenue", "ProductType", "METRIC_GRANULARITY_ONE_HOUR");
  if (!bd) return null;
  // hourly points are keyed by date in lib; recompute daily sums from raw points by ts
  const m = series(id).metrics["ItemMonetizationRevenue"]; const out = {};
  for (const s of m.series) { if (s.granularity !== "METRIC_GRANULARITY_ONE_HOUR") continue; const k = Object.keys(s.breakdown || {});
    if (k.join() !== "ProductType") continue; const lbl = (s.breakdownLabels && s.breakdownLabels.ProductType) || s.breakdown.ProductType;
    const seen = new Set(); const o = out[lbl] ||= {};
    for (const p of s.points) { const ts = p.ts || p.time || p.date; if (seen.has(ts) || p.partial) continue; seen.add(ts); const d = (p.date || ts).slice(0, 10); o[d] = (o[d] || 0) + (p.value || 0); } }
  return out;
}

const portfolio = { window: { POST, PRE, PRIOR }, games: [] };

for (const g of GAMES) {
  const rec = { ...g, window: { POST, PRE, PRIOR, RUN, DOD }, builtAt: new Date().toISOString(), metrics: [], splits: {}, notes: [] };
  // lifecycle: peak DAU over full history
  const dau = headline(g.id, "DailyActiveUsers");
  let peak = null; for (const [d, v] of dau.v) if (!peak || v > peak[1]) peak = [d, v];
  rec.peak = { date: peak[0], dau: peak[1] };
  rec.dauPctOfPeak = Object.fromEntries(RUN.filter(d => dau.v.has(d)).map(d => [d, dau.v.get(d) / peak[1]]));

  for (const [group, label, metric, unit, lower, kind] of METRICS) {
    const h = headline(g.id, metric);
    if (!h || !h.v.size) { rec.metrics.push({ group, label, metric, unit, lower, kind, missing: true }); continue; }
    const cur = paired(h.v, POST, PRE), prior = paired(h.v, PRE, PRIOR);
    const newest = [...h.v.keys()].filter(d => d <= TODAY).sort().at(-1);
    rec.metrics.push({ group, label, metric, unit, lower, kind, newest, cur, prior,
      run: toObj(h.v, RUN), dod: DOD.map(d => ({ d, v: h.v.get(d) ?? null, prev: h.v.get(addDays(d, -7)) ?? null,
        delta: (h.v.get(d) != null && h.v.get(addDays(d, -7))) ? h.v.get(d) / h.v.get(addDays(d, -7)) - 1 : null })),
      capturedAt: Object.fromEntries(RUN.filter(d => d >= "2026-09-01" && h.cap.has(d)).map(d => [d, h.cap.get(d)])) });
  }
  // derived per-DAU volumes (a volume across a shrinking audience is not like-for-like)
  for (const [label, metric] of [["Errors per DAU", "ErrorCount"], ["Client crashes per 1k DAU", "ClientCrashCount"],
    ["OOM exits per 1k DAU", "OomUnexpectedExits"], ["Peak CCU per 1k DAU", "PeakConcurrentPlayers"]]) {
    const h = headline(g.id, metric); if (!h) continue; const k = label.includes("1k") ? 1000 : 1;
    const mp = new Map(); for (const [d, v] of h.v) if (dau.v.get(d)) mp.set(d, v / dau.v.get(d) * k);
    rec.metrics.push({ group: "Derived", label, metric: metric + "/DAU", unit: "num2", lower: !label.startsWith("Peak"), kind: "rate",
      newest: [...mp.keys()].sort().at(-1), cur: paired(mp, POST, PRE), prior: paired(mp, PRE, PRIOR), run: toObj(mp, RUN),
      dod: DOD.map(d => ({ d, v: mp.get(d) ?? null, prev: mp.get(addDays(d, -7)) ?? null, delta: (mp.get(d) != null && mp.get(addDays(d, -7))) ? mp.get(d) / mp.get(addDays(d, -7)) - 1 : null })) });
  }
  // errors by log source
  const els = breakdown(g.id, "ErrorCount", "LogSource"); if (els) rec.splits.errorsByLogSource = els;

  // splits held in the corpus
  for (const [key, metric, dim] of [["dauBySource", "DailyActiveUsers", "AcquisitionSource"], ["d1BySource", "ForwardD1Retention", "AcquisitionSource"],
    ["dauByPlatform", "DailyActiveUsers", "Platform"], ["d1ByPlatform", "ForwardD1Retention", "Platform"],
    ["impressionsBySource", "UniqueUsersWithImpressions", "AcquisitionSource"], ["revenueBySource", "DailyRevenue", "RevenueSource"],
    ["revenueByBalance", "DailyRevenue", "BalanceType"], ["pcuByPlatform", "PeakConcurrentPlayers", "Platform"],
    ["crashRateByPlatform", "ClientCrashRate15m", "Platform"], ["fpsP10ByPlatform", "ClientFpsP10", "Platform"],
    ["memPctByPlatform", "ClientMemoryUsagePercentageAvg", "Platform"], ["dauByCountry", "DailyActiveUsers", "Country"]]) {
    const bd = breakdown(g.id, metric, dim); if (!bd) continue;
    const summ = {};
    for (const [lbl, mp] of Object.entries(bd)) { const m = new Map(Object.entries(mp)); const c = paired(m, POST, PRE);
      if (c.pairs) summ[lbl] = { ...c, run: Object.fromEntries(RUN.filter(d => d >= "2026-08-29").map(d => [d, mp[d] ?? null])) }; }
    if (key === "dauByCountry") {   // keep the top 15 by post volume only
      const top = Object.entries(summ).sort((a, b) => (b[1].after || 0) - (a[1].after || 0)).slice(0, 15);
      rec.splits[key] = Object.fromEntries(top.map(([k, v]) => [k, { ...v, run: undefined }])); continue; }
    rec.splits[key] = summ;
  }
  const prod = hourlyProduct(g.id);
  if (prod) { const summ = {}; for (const [lbl, mp] of Object.entries(prod)) { const m = new Map(Object.entries(mp)); summ[lbl] = { ...paired(m, POST, PRE), run: Object.fromEntries(RUN.filter(d => d >= "2026-09-01").map(d => [d, mp[d] ?? null])) }; } rec.splits.itemRevenueByProductType = summ; }

  rec.funnels = funnels(g.id);
  rec.annotations = annotations(g.id);
  rec.deploy = deployLog(g.id);
  rec.placeVersions = placeVersions(g.id);
  rec.feedback = feedback(g.id);

  // Explore pull (browser): IsNewUser splits, hourly CCU
  const ex = path.join(OUT, `explore-${g.id}.json`);
  if (fs.existsSync(ex)) {
    const E = JSON.parse(fs.readFileSync(ex, "utf8")); rec.explore = { pulledAt: E.pulledAt, specs: [] };
    for (const s of E.specs) {
      if (s.error) { rec.explore.specs.push({ metric: s.metric, breakdown: s.breakdown, granularity: s.granularity, error: s.error }); continue; }
      if (s.granularity !== "METRIC_GRANULARITY_ONE_DAY") {
        // hourly / half-hour CCU: keep raw points from 08-29 on; drop the final bucket (F16/F19 carry-forward)
        const tot = s.series["__TOTAL__"]; if (!tot) continue;
        const ks = Object.keys(tot.points).sort(); const drop = ks.at(-1);
        rec.explore.specs.push({ metric: s.metric, granularity: s.granularity, droppedLast: drop,
          points: Object.fromEntries(ks.filter(k => k !== drop && k >= "2026-08-29").map(k => [k, tot.points[k]])) }); continue; }
      const segs = {};
      for (const [k, sv] of Object.entries(s.series)) { const mp = new Map(Object.entries(sv.points).map(([t, v]) => [t.slice(0, 10), v]));
        segs[sv.label] = { ...paired(mp, POST, PRE), prior: paired(mp, PRE, PRIOR), run: Object.fromEntries(RUN.filter(d => d >= "2026-08-29").map(d => [d, mp.get(d) ?? null])) }; }
      rec.explore.specs.push({ metric: s.metric, breakdown: s.breakdown, granularity: s.granularity, segments: segs });
    }
  }
  fs.writeFileSync(path.join(OUT, `${g.slug}.json`), JSON.stringify(rec, null, 1));
  const pick = mt => { const x = rec.metrics.find(m => m.metric === mt); return x && x.cur ? { d: x.cur.delta, pairs: x.cur.pairs, prior: x.prior && x.prior.delta, newest: x.newest } : null; };
  portfolio.games.push({ slug: g.slug, name: g.name, peak: rec.peak, pctOfPeak: rec.dauPctOfPeak,
    k: Object.fromEntries(["DailyActiveUsers", "PeakConcurrentPlayers", "UniqueUsersWithImpressions", "EndToEndCVR", "ForwardD1Retention",
      "AverageSessionLengthMinutes", "AveragePlayTimeMinutesPerDAU", "DailyRevenue", "AverageRevenuePerUser", "PayingUsersCVR",
      "RFYPlayThroughRate", "RFYDuration0To60", "RFYD2To7PlayDays", "RFYD8To28PlayDays", "ClientCrashRate15m", "ErrorCount/DAU"].map(mt => [mt, pick(mt)])),
    dauRun: Object.fromEntries(RUN.map(d => [d, dau.v.get(d) ?? null])) });
  console.log(`${g.slug}: ${rec.metrics.filter(m => !m.missing).length} metrics, ${rec.funnels.length} funnels, ${rec.annotations.length} annotations, ` +
    `deploy ${rec.deploy.daily.length}, feedback ${rec.feedback.n}, explore ${rec.explore ? rec.explore.specs.length : "none"}`);
}
fs.writeFileSync(path.join(OUT, "portfolio.json"), JSON.stringify(portfolio, null, 1));
console.log("wrote", OUT);
