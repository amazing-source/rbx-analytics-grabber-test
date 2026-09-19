// Analyst tables for Become a Brainrot (9963622286), 2026-09-19 read.
// Reads reports/2026-09-19/data/brainrot.json (+ portfolio, feedback, ccu, the other games' data files),
// the corpus (data/games/9963622286/series.json via tools/lib.js), data-quality.md, annotations.md and the
// filed error exports; writes reports/2026-09-19/data/extras-brainrot.json. Every table carries its source.
//
//   node tools/r0919/extras/brainrot.js
const fs = require("fs");
const path = require("path");
const L = require("../../lib.js");
const ROOT = path.join(__dirname, "../../..");
const DATA = path.join(ROOT, "reports/2026-09-19/data");
const ID = "9963622286";
const rj = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const D = rj("reports/2026-09-19/data/brainrot.json");
const P = rj("reports/2026-09-19/data/portfolio.json");
const OTHERS = ["waterslide", "monkey", "verity", "seal"].map(s => rj(`reports/2026-09-19/data/${s}.json`));
const CCU = rj("reports/2026-09-19/data/ccu-9963622286.json");
const FB = rj("reports/2026-09-19/data/feedback-9963622286.json");

// ---------- helpers
const addDays = (d, n) => { const x = new Date(d + "T00:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const range = (a, b) => { const o = []; for (let d = a; d <= b; d = addDays(d, 1)) o.push(d); return o; };
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dow = d => DOW[new Date(d + "T00:00:00Z").getUTCDay()];
const mean = a => { const b = a.filter(v => v != null && Number.isFinite(v)); return b.length ? b.reduce((x, y) => x + y, 0) / b.length : null; };
const sd = a => { const b = a.filter(v => v != null && Number.isFinite(v)); if (b.length < 2) return null; const m = mean(b); return Math.sqrt(b.reduce((s, v) => s + (v - m) ** 2, 0) / (b.length - 1)); };
const sum = a => a.reduce((x, y) => x + (y || 0), 0);
const I = v => v == null || !Number.isFinite(v) ? "—" : Math.round(v).toLocaleString("en-US");
const F = (v, p = 2) => v == null || !Number.isFinite(v) ? "—" : v.toFixed(p);
const PC = (v, p = 1) => v == null || !Number.isFinite(v) ? "—" : (v * 100).toFixed(p) + "%";
const DL = (v, p = 1) => v == null || !Number.isFinite(v) ? "—" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v * 100).toFixed(p) + "%";
const PP = (v, p = 2) => v == null || !Number.isFinite(v) ? "—" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(p) + "pp";
const SG = (v, p = 2) => v == null || !Number.isFinite(v) ? "—" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(p);
const SI = v => v == null || !Number.isFinite(v) ? "—" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(Math.round(v)).toLocaleString("en-US");
const PS = (v, p = 1) => v == null || !Number.isFinite(v) ? "—" : (v < 0 ? "−" : "") + Math.abs(v * 100).toFixed(p) + "%";
const rel = (a, b) => (a != null && b != null && a) ? b / a - 1 : null;

const POST = D.window.POST, PRE = D.window.PRE, PRIOR = D.window.PRIOR;
const MON = 2; // index of the Monday pair (09-07 PRE / 09-14 POST) — 09-07 is US Labor Day
const EXMON = [0, 1, 3, 4];
const M = k => D.metrics.find(m => m.metric === k);
const runMap = k => new Map(Object.entries(M(k).run).filter(([, v]) => v != null));
const corp = (metric) => L.daily(ID, metric);                 // headline, settled, no FILLED_ZERO
const bd = (metric, dim) => L.byBreakdown(ID, metric, dim);   // whole-population breakdowns only
const pairMeans = (map, post = POST, pre = PRE, idx = [0, 1, 2, 3, 4]) => {
  const get = (m, d) => m instanceof Map ? m.get(d) : m[d];
  const pr = idx.map(i => [get(map, pre[i]), get(map, post[i])]).filter(([a, b]) => a != null && b != null);
  return { n: pr.length, before: mean(pr.map(p => p[0])), after: mean(pr.map(p => p[1])) };
};

const tables = [];
const T = (section, title, columns, rows, numeric, note, source) => tables.push({ section, title, columns, rows, numeric, note, source });

// ---------- core series from the corpus
const dau = corp("DailyActiveUsers");
const payers = corp("PayingUsers");
const rev = corp("DailyRevenue");
const cvr = corp("PayingUsersCVR");
const d1 = corp("ForwardD1Retention");
const sess = corp("AverageSessionLengthMinutes");
const crash = corp("ClientCrashRate15m");
const impr = corp("UniqueUsersWithImpressions");
const revSrc = bd("DailyRevenue", "RevenueSource");
const GP = revSrc.get("GamePass"), DP = revSrc.get("DevProduct");
const country = bd("DailyActiveUsers", "Country");
const RU = country.get("RU"), US = country.get("US");
const imprSrc = bd("UniqueUsersWithImpressions", "AcquisitionSource");
const HOMEI = imprSrc.get("HomeRecommendation");
const dauSrc = bd("DailyActiveUsers", "AcquisitionSource");
const ex = (metric, bdim) => D.explore.specs.find(s => s.metric === metric && s.breakdown === bdim && s.segments);
const NEWU = new Map(Object.entries(ex("DailyActiveUsers", "IsNewUser").segments.New.run).filter(([, v]) => v != null));
const RETU = new Map(Object.entries(ex("DailyActiveUsers", "IsNewUser").segments.Returning.run).filter(([, v]) => v != null));

// =====================================================================================
// GLANCE — every headline with its numerator, with and without the Labor Day pair
// =====================================================================================
{
  const rowsSpec = [
    ["DAU `DailyActiveUsers`", dau, I],
    ["New-user DAU (Explore `IsNewUser`=New)", NEWU, I],
    ["Returning DAU (Explore `IsNewUser`=Returning)", RETU, I],
    ["DAU from Russia (`Country`=RU)", RU, I],
    ["DAU from the US (`Country`=US)", US, I],
    ["Russia's share of DAU", new Map([...RU].filter(([d]) => dau.get(d)).map(([d, v]) => [d, v / dau.get(d)])), v => PC(v, 1)],
    ["Home impressions (`UniqueUsersWithImpressions`, HomeRecommendation)", HOMEI, I],
    ["Revenue R$ `DailyRevenue`", rev, I],
    ["— of which DevProduct R$", DP, I],
    ["— of which GamePass R$", GP, I],
    ["Paying users `PayingUsers`", payers, I],
    ["Paying-user CVR `PayingUsersCVR`", cvr, v => PC(v, 2)],
    ["D1 `ForwardD1Retention`", d1, v => PC(v, 1)],
    ["Session length, min `AverageSessionLengthMinutes`", sess, v => F(v, 2)],
  ];
  const rows = rowsSpec.map(([lab, m, f]) => {
    const all = pairMeans(m), exm = pairMeans(m, POST, PRE, EXMON);
    return [lab, f(all.before), f(all.after), DL(rel(all.before, all.after)), DL(rel(exm.before, exm.after)), `${all.n}/5`];
  });
  T("reach", "The week's headline moves beside their numerators — with and without the Monday pair",
    ["Series", "Before (Sat 09-05→Wed 09-09)", "After (Sat 09-12→Wed 09-16)", "Δ, 5 pairs", "Δ without Mon 09-07/09-14", "Pairs"],
    rows, [1, 2, 3, 4, 5],
    "Mon 09-07 was US Labor Day: US DAU 24,085 that day against 12,711 on Mon 09-14. The last column drops that one pair so the holiday cannot carry a comparison.",
    "series.json headline series (settled, no FILLED_ZERO) via tools/lib.js daily()/byBreakdown(); new/returning from reports/2026-09-19/data/brainrot.json explore.specs (DailyActiveUsers × IsNewUser). Mean of paired days, POST day d vs PRE day d−7.");
}

// =====================================================================================
// TIMELINE — day-by-day week-on-week, to date each move against the 09-11 publish
// =====================================================================================
{
  const days = range("2026-09-05", "2026-09-17");
  const cols = [["DAU", dau], ["New DAU", NEWU], ["RU DAU", RU], ["US DAU", US], ["Home impr.", HOMEI], ["D1", d1], ["Session", sess], ["GamePass R$", GP], ["DevProduct R$", DP], ["Payers", payers], ["Crash rate", crash]];
  const marks = { "2026-09-07": " (US Labor Day)", "2026-09-08": " (RU step)", "2026-09-11": " (v610/v612 15:36/15:51)", "2026-09-12": " (admin abuse)", "2026-09-05": " (admin abuse)" };
  const rows = days.map(d => [`${dow(d)} ${d.slice(5)}${marks[d] || ""}`, ...cols.map(([, m]) => { const a = m.get(addDays(d, -7)), b = m.get(d); return a != null && b != null ? DL(rel(a, b), 0) : "—"; })]);
  T("timeline", "Week-on-week change by day, 05 → 17 Sep: which series moved before the 11 Sep publish",
    ["Day (vs same weekday −7d)", ...cols.map(c => c[0])], rows, cols.map((_, i) => i + 1),
    "Each cell is that day against the same weekday a week earlier. Russia, new-user DAU and Home impressions are already up by 09-08 → 09-10, before v612 (09-11 15:51 UTC). GamePass revenue is up w/w through 09-11 and down every day from 09-12. D1 and revenue lag, so their newest cells are blank.",
    "series.json via tools/lib.js (DailyActiveUsers, DailyActiveUsers×Country, UniqueUsersWithImpressions×AcquisitionSource, ForwardD1Retention, AverageSessionLengthMinutes, DailyRevenue×RevenueSource, PayingUsers, ClientCrashRate15m); new-user DAU from Explore. Δ = day / (day−7) − 1.");
}
{
  // both windows carried the same event calendar
  const ann = D.annotations;
  const cnt = (re, a, b) => ann.filter(x => re.test(x.what) && x.t.slice(0, 10) >= a && x.t.slice(0, 10) <= b).length;
  const rows = [
    ["Build live", "v608 (published 09-04 12:17)", "v612 (published 09-11 15:51)", "v614 published 09-18 15:22"],
    ["ADMIN ABUSE event (Sat 15:00–16:00 UTC)", "09-05", "09-12", "09-19 (today)"],
    ["NEW UPDATE event listing", "09-04 18:00 → 09-08 14:00", "09-11 18:00 → 09-14 14:00", "NEW EVENT from 09-18 18:00"],
    ["WORLD 3 event listing (started 08-14)", "running", "ended 09-14 16:00", "—"],
    ["Place-icon changes", String(cnt(/PLACE_ICON/, "2026-09-05", "2026-09-09")) + " (all on Sat 09-05)", String(cnt(/PLACE_ICON/, "2026-09-12", "2026-09-16")) + " (all on Sat 09-12)", "—"],
    ["Thumbnail-set changes", String(cnt(/PLACE_THUMBNAIL/, "2026-09-05", "2026-09-09")) + " (09-06)", String(cnt(/PLACE_THUMBNAIL/, "2026-09-12", "2026-09-16")) + " (09-13, 21:42 and 22:03)", "one on 09-10, between the windows"],
    ["Engine releases (RCC)", "—", "RCC 739 09-14 22:07", "RCC 738 on 09-08 22:36 and 09-09 16:47, between the windows"],
  ];
  T("timeline", "Event, creative and engine calendar in each window",
    ["Item", "Before window (09-05→09-09)", "After window (09-12→09-16)", "Outside both"], rows, [],
    "Both windows carry one admin-abuse Saturday, one NEW UPDATE listing and a Saturday icon rotation, so those items are present on both sides of every comparison.",
    "reports/2026-09-19/data/brainrot.json annotations + placeVersions (annotations.md, place-versions.csv).");
}
{
  // icon rotation cadence: every Saturday since 07-25
  const txt = fs.readFileSync(path.join(ROOT, "data/games", ID, "annotations.md"), "utf8");
  const seen = new Set(), icons = {}, thumbs = [];
  for (const line of txt.split("\n")) { const m = line.match(/^- `(\{.*\})`$/); if (!m) continue; let j; try { j = JSON.parse(m[1]); } catch { continue; }
    const k = j.createdUtcTime + j.annotationType + JSON.stringify(j.metadata); if (seen.has(k)) continue; seen.add(k);
    const d = (j.createdUtcTime || "").slice(0, 10);
    if (j.annotationType === "ANNOTATION_TYPE_PLACE_ICON") icons[d] = (icons[d] || 0) + 1;
    if (j.annotationType === "ANNOTATION_TYPE_PLACE_THUMBNAIL") thumbs.push(d); }
  const sats = range("2026-07-25", "2026-09-12").filter(d => dow(d) === "Sat");
  const nonSatIconDays = Object.keys(icons).filter(d => d >= "2026-07-25" && dow(d) !== "Sat");
  T("timeline", "Place-icon changes by Saturday since 25 Jul",
    ["Saturday", "Icon changes that day"], sats.map(d => [d, String(icons[d] || 0)]), [1],
    `Icons changed on ${sats.filter(d => icons[d]).length} of ${sats.length} Saturdays and on ${nonSatIconDays.length} non-Saturdays in this span, so an icon change never occurs without the admin-abuse Saturday beside it and cannot be event-studied on its own.`,
    "data/games/9963622286/annotations.md, ANNOTATION_TYPE_PLACE_ICON, de-duplicated on (time, type, metadata).");
  global.__thumbs = [...new Set(thumbs)].filter(d => d >= "2026-07-15" && d <= "2026-09-17").sort();
}

// =====================================================================================
// REACH
// =====================================================================================
{
  const tot = pairMeans(dau); const dTot = tot.after - tot.before;
  const rows = [];
  const all = [...country.entries()].map(([k, m]) => { const p = pairMeans(m); return [k, p]; }).filter(([, p]) => p.n === 5);
  all.sort((a, b) => Math.abs(b[1].after - b[1].before) - Math.abs(a[1].after - a[1].before));
  const top = all.slice(0, 12);
  for (const [k, p] of top) rows.push([k, I(p.before), I(p.after), SI(p.after - p.before), PS((p.after - p.before) / dTot, 1), DL(rel(p.before, p.after))]);
  const restB = sum(all.slice(12).map(x => x[1].before)), restA = sum(all.slice(12).map(x => x[1].after));
  rows.push([`All other ${all.length - 12} countries`, I(restB), I(restA), SI(restA - restB), PS((restA - restB) / dTot, 1), DL(rel(restB, restA))]);
  rows.push(["**Total (headline DAU)**", I(tot.before), I(tot.after), SI(dTot), "100%", DL(rel(tot.before, tot.after))]);
  T("reach", "Where the added DAU came from, by country (12 largest movers)",
    ["Country", "Before", "After", "Δ DAU/day", "Share of total Δ", "Δ"], rows, [1, 2, 3, 4, 5],
    "Russia alone is 39% of the week's added DAU; the US is the largest faller. Country rows sum to within ~0.5% of the headline (Explore reconciliation), so shares are approximate.",
    "DailyActiveUsers × Country (ONE_DAY, whole population) from series.json; 5 paired days each side.");
}
{
  const days = ["2026-09-01", "2026-09-03", "2026-09-05", "2026-09-07", "2026-09-08", "2026-09-09", "2026-09-10", "2026-09-11", "2026-09-12", "2026-09-14", "2026-09-16", "2026-09-17"];
  const games = [["Brainrot", ID], ["Waterslide", "10030829154"], ["Banana Monkey", "10399712766"], ["Verity", "10565445771"], ["Seal", "10638354731"]];
  const rows = games.map(([n, id]) => { const c = L.byBreakdown(id, "DailyActiveUsers", "Country"), t = L.daily(id, "DailyActiveUsers"); const ru = c && c.get("RU");
    return [n, ...days.map(d => ru && ru.get(d) != null && t.get(d) ? PC(ru.get(d) / t.get(d), 1) : "—")]; });
  T("reach", "Russia's share of DAU by day — Brainrot against the other four games",
    ["Game", ...days.map(d => `${dow(d)} ${d.slice(5)}`)], rows, days.map((_, i) => i + 1),
    "Brainrot's Russian share steps from 6–7% to 15.5% on Tue 09-08 and reaches 24.6% on 09-17. No other game in the portfolio moves this way.",
    "DailyActiveUsers × Country (RU) ÷ headline DailyActiveUsers, each game's series.json.");
}
{
  const rows = [];
  const tot = pairMeans(dau); const dTot = tot.after - tot.before;
  for (const [k, m] of dauSrc) { const p = pairMeans(m); if (p.n < 5 || p.after < 50) continue; rows.push(["Source · " + k, I(p.before), I(p.after), SI(p.after - p.before), PS((p.after - p.before) / dTot, 1), DL(rel(p.before, p.after))]); }
  for (const [k, m] of [["New", NEWU], ["Returning", RETU]]) { const p = pairMeans(m); rows.push(["IsNewUser · " + k, I(p.before), I(p.after), SI(p.after - p.before), PS((p.after - p.before) / dTot, 1), DL(rel(p.before, p.after))]); }
  const hp = pairMeans(HOMEI), hd = pairMeans(dauSrc.get("HomeRecommendation"));
  rows.push(["Home DAU ÷ Home impressions (home-surface conversion)", PC(hd.before / hp.before, 2), PC(hd.after / hp.after, 2), PP((hd.after / hp.after - hd.before / hp.before) * 100), "—", DL(rel(hd.before / hp.before, hd.after / hp.after))]);
  T("reach", "The added DAU by acquisition source and by new vs returning",
    ["Segment", "Before", "After", "Δ DAU/day", "Share of total Δ", "Δ"], rows, [1, 2, 3, 4, 5],
    "HomeRecommendation carries 78% of the added DAU and new users 65%. Search DAU fell 4.9%. Segment rows come from different breakdowns and reconcile to the headline within ~3% (new + returning shares sum to 103%). Home impressions grew faster (+65.5%) than Home DAU (+46.6%), so conversion per Home impression fell while the volume rose.",
    "DailyActiveUsers × AcquisitionSource and UniqueUsersWithImpressions × AcquisitionSource (series.json); IsNewUser from Explore; source rows under 50 DAU omitted.");
}
{
  // thumbnail event study against the base rate of ordinary days (w/w change, so weekday divides out)
  const thumbs = global.__thumbs;
  const e2e = corp("EndToEndCVR"), nint = corp("RFYUniqueNotInterestedUsersPerMillionImpressions"), ptr = corp("RFYPlayThroughRate");
  const span = range("2026-07-22", "2026-09-17");
  const swapNext = new Set(thumbs.map(d => addDays(d, 1)));
  const study = (m, lab) => {
    const ww = d => { const a = m.get(addDays(d, -7)), b = m.get(d); return a != null && b != null ? b / a - 1 : null; };
    const sw = [...swapNext].filter(d => span.includes(d)).map(ww).filter(v => v != null);
    const base = span.filter(d => !swapNext.has(d) && !thumbs.includes(d)).map(ww).filter(v => v != null);
    const z = (mean(sw) - mean(base)) / (sd(base) / Math.sqrt(sw.length));
    return [lab, String(sw.length), DL(mean(sw)), String(base.length), DL(mean(base)), PC(sd(base), 1), F(z, 2)];
  };
  T("reach", "Thumbnail changes against the base rate of ordinary days",
    ["Series (w/w change on the day after a change)", "Change days", "Mean after a change", "Ordinary days", "Mean on ordinary days", "SD, ordinary", "z"],
    [study(e2e, "Impression→play CVR `EndToEndCVR`"), study(ptr, "RFY play-through rate `RFYPlayThroughRate`"), study(nint, "Listing rejections / M impressions (denominator-immune)")], [1, 2, 3, 4, 5, 6],
    `Change dates: ${thumbs.map(d => d.slice(5)).join(", ")}. |z| under 2 means the day after a thumbnail change is not distinguishable from any other day.`,
    "ANNOTATION_TYPE_PLACE_THUMBNAIL dates from annotations.md; series from series.json; window 07-22 → 09-17; w/w = day ÷ same weekday −7d − 1; z = (mean after change − ordinary mean) ÷ (ordinary SD ÷ √n).");
}

// =====================================================================================
// CCU — half-hour PeakConcurrentPlayers (Open Cloud, UTC, bucket start) from ccu-9963622286.json
// =====================================================================================
const HH = new Map(Object.entries(CCU.halfhour).map(([k, v]) => [k.slice(0, 16), v]));
const hhDay = d => { const out = []; for (let h = 0; h < 48; h++) { const k = `${d}T${String(Math.floor(h / 2)).padStart(2, "0")}:${h % 2 ? "30" : "00"}`; out.push(HH.get(k)); } return out; };
const slot = (d, hhmm) => HH.get(`${d}T${hhmm}`);
{
  const rows = [];
  const pairs = POST.map((d, i) => [PRE[i], d]).concat([["2026-09-10", "2026-09-17"], ["2026-09-11", "2026-09-18"]]);
  for (const [a, b] of pairs) { const ma = mean(hhDay(a)), mb = mean(hhDay(b));
    rows.push([`${dow(b)} ${b.slice(5)} vs ${a.slice(5)}${b === "2026-09-18" ? " (both publish days)" : ""}`, I(ma), I(mb), DL(rel(ma, mb))]); }
  const noSat = [1, 2, 3, 4]; const bA = mean(noSat.map(i => mean(hhDay(PRE[i])))), bB = mean(noSat.map(i => mean(hhDay(POST[i]))));
  rows.push(["**Sun→Wed pairs (Saturday excluded)**", I(bA), I(bB), DL(rel(bA, bB))]);
  const pcu = M("PeakConcurrentPlayers");
  T("ccu", "Mean concurrents per day, matched weekday (half-hour series, all 48 slots)",
    ["Day pair", "Before", "After", "Δ"], rows, [1, 2, 3],
    `Saturday, the admin-abuse day, is excluded from the trend line. The daily-peak series the chart shows moved ${DL(pcu.cur.delta)} on the same pairs.`,
    "PeakConcurrentPlayers HALF_HOUR (reports/2026-09-19/data/ccu-9963622286.json, pulled 2026-09-19 09:01 UTC), mean of the 48 half-hour peaks per UTC day.");
}
{
  // today vs the last two Saturdays, same elapsed half-hours. Pull 09:01 UTC → 09:00 bucket partial, 09:30 carried forward: use 00:00–08:30.
  const slots = []; for (let h = 0; h < 17; h++) slots.push(`${String(Math.floor(h / 2)).padStart(2, "0")}:${h % 2 ? "30" : "00"}`);
  const rows = [];
  for (let i = 0; i < slots.length; i += 2) { const s = slots.slice(i, i + 2);
    const v = d => mean(s.map(x => slot(d, x)));
    rows.push([s.join(" + "), I(v("2026-09-19")), I(v("2026-09-12")), I(v("2026-09-05")), DL(rel(v("2026-09-12"), v("2026-09-19"))), DL(rel(v("2026-09-05"), v("2026-09-19")))]); }
  const all = d => mean(slots.map(x => slot(d, x)));
  rows.push(["**00:00 → 08:30, all 17 slots**", I(all("2026-09-19")), I(all("2026-09-12")), I(all("2026-09-05")), DL(rel(all("2026-09-12"), all("2026-09-19"))), DL(rel(all("2026-09-05"), all("2026-09-19")))]);
  T("ccu", "Today (Sat 09-19, partial) against the last two Saturdays, same UTC half-hours",
    ["UTC slots", "Sat 09-19", "Sat 09-12", "Sat 09-05", "Δ vs 09-12", "Δ vs 09-05"], rows, [1, 2, 3, 4, 5],
    "Only the slots that had finished when the series was pulled (09:01 UTC) are compared; the 09:00 bucket was partial and the 09:30 bucket repeated it (carry-forward), so both are dropped. All slots are before the 15:00 admin-abuse hour.",
    "PeakConcurrentPlayers HALF_HOUR, ccu-9963622286.json; mean of the peaks in each pair of half-hour slots.");
}
{
  // publish-day afternoon shape vs the base rate of non-publish, non-Saturday days at the same clock slots
  const win = (d, a, b) => { const out = []; for (const [k, v] of HH) { if (!k.startsWith(d)) continue; const t = k.slice(11); if (t >= a && t < b) out.push(v); } return mean(out); };
  const pubs = [["v608", "2026-09-04", "12:17", ["10:30", "12:00"], ["12:30", "14:00"]], ["v612", "2026-09-11", "15:51", ["13:30", "15:30"], ["16:00", "18:00"]], ["v614", "2026-09-18", "15:22", ["13:00", "15:00"], ["15:30", "17:30"]]];
  const pubDays = new Set(pubs.map(p => p[1]));
  const days = range("2026-08-23", "2026-09-18").filter(d => dow(d) !== "Sat" && !pubDays.has(d));
  const rows = pubs.map(([v, d, t, pre, post]) => {
    const r = win(d, post[0], post[1]) / win(d, pre[0], pre[1]);
    const base = days.map(x => win(x, post[0], post[1]) / win(x, pre[0], pre[1])).filter(Number.isFinite);
    return [`${v} · ${dow(d)} ${d.slice(5)} ${t}`, `${pre[0]}–${pre[1]}`, `${post[0]}–${post[1]}`, DL(r - 1), DL(mean(base) - 1), PC(sd(base), 1), F((r - mean(base)) / sd(base), 2), String(base.length)];
  });
  T("ccu", "Concurrents in the two hours after each publish, against the same clock hours on ordinary days",
    ["Publish (UTC)", "Before slots", "After slots", "Change on publish day", "Mean change, ordinary days", "SD", "z", "Ordinary days"], rows, [3, 4, 5, 6, 7],
    "Ordinary days = 08-23 → 09-18 excluding Saturdays and the three publish days. A z near 0 means the publish day's afternoon followed the normal diurnal curve.",
    "PeakConcurrentPlayers HALF_HOUR (ccu-9963622286.json); ratio of mean half-hour peak after ÷ before, per day.");
}
{
  const sats = ["2026-08-22", "2026-08-29", "2026-09-05", "2026-09-12"];
  const rows = sats.map(d => { const v = s => slot(d, s); const peak = Math.max(v("15:00"), v("15:30")); const base = mean([v("13:30"), v("14:00")]);
    const fri = mean(hhDay(addDays(d, -1))), sun = mean(hhDay(addDays(d, 1))), sat = mean(hhDay(d));
    return [d, I(v("14:00")), I(v("14:30")), I(v("15:00")), I(v("15:30")), I(v("16:30")), F(peak / base, 2) + "×", DL(sat / mean([fri, sun]) - 1)]; });
  T("ccu", "The Saturday admin-abuse hour (15:00–16:00 UTC), four Saturdays",
    ["Saturday", "14:00", "14:30", "15:00", "15:30", "16:30", "Event peak ÷ 13:30–14:00", "Day mean vs Fri/Sun mean"], rows, [1, 2, 3, 4, 5, 6, 7],
    "The event multiplies concurrents for one hour and the level falls back by 16:30. Its multiple has shrunk as the base rose.",
    "PeakConcurrentPlayers HALF_HOUR (ccu-9963622286.json); ADMIN ABUSE START/END from annotations.md.");
}

// =====================================================================================
// RETENTION
// =====================================================================================
{
  const src = bd("ForwardD1Retention", "AcquisitionSource");
  const rows = [];
  for (const k of ["Friends", "Search", "HomeRecommendation", "Others"]) {
    const m = src.get(k); const p = pairMeans(m);
    const base = range("2026-08-15", "2026-09-09").map(d => { const a = m.get(addDays(d, -7)), b = m.get(d); return a != null && b != null ? b - a : null; }).filter(v => v != null);
    const se = sd(base) / Math.sqrt(p.n);
    const n = pairMeans(dauSrc.get(k)).after;
    rows.push([k + (k === "Friends" ? " (never sees a thumbnail)" : k === "Search" ? " (looked the game up)" : ""), I(n), PC(p.before, 2), PC(p.after, 2), PP((p.after - p.before) * 100), DL(rel(p.before, p.after)), PP(sd(base) * 100), F((p.after - p.before) / se, 2)]);
  }
  T("retention", "D1 by acquisition source — effect size and confidence kept separate",
    ["Source", "DAU/day after", "D1 before", "D1 after", "Δ pp", "Δ relative (effect size)", "Own w/w SD", "z (confidence)"], rows, [1, 2, 3, 4, 5, 6, 7],
    "Relative change is the effect size; z divides the 5-pair mean change by that source's own week-on-week SD (08-15 → 09-09) ÷ √5. Friends and Search are the controls: they do not arrive through the listing.",
    "ForwardD1Retention × AcquisitionSource (series.json, ONE_DAY); DAU × AcquisitionSource for volume.");
}
{
  const d1p = bd("ForwardD1Retention", "Platform"), dp = bd("DailyActiveUsers", "Platform");
  const grp = { Mobile: ["Phone", "Tablet"], Computer: ["Computer"], Console: ["Console"] };
  const rows = Object.entries(grp).map(([g, ps]) => {
    const w = (days) => { const vals = days.map(d => { let num = 0, den = 0; for (const p of ps) { const r = d1p.get(p) && d1p.get(p).get(d), n = dp.get(p) && dp.get(p).get(d); if (r != null && n != null) { num += r * n; den += n; } } return den ? num / den : null; }); return mean(vals); };
    const b = w(PRE), a = w(POST), pb = w(PRIOR);
    const nA = mean(POST.map(d => sum(ps.map(p => dp.get(p).get(d)))));
    return [g + (g === "Mobile" ? " (Phone + Tablet, DAU-weighted)" : ""), I(nA), PC(pb, 2), PC(b, 2), PC(a, 2), DL(rel(b, a)), DL(rel(pb, b))];
  });
  T("retention", "D1 by platform class, each against its own earlier weeks",
    ["Platform", "DAU/day after", "D1 08-29→09-02", "D1 before", "D1 after", "Δ this week", "Δ week before"], rows, [1, 2, 3, 4, 5, 6],
    "Compare each row with itself across the columns, not with the other rows. TV and VR (under 40 DAU) are not read.",
    "ForwardD1Retention × Platform and DailyActiveUsers × Platform (series.json); Mobile = DAU-weighted mean of Phone and Tablet per day.");
}
{
  // RFY ranking-signal block by week, beside Home impressions (§3e ordering test)
  const weeks = [["08-22→08-26", range("2026-08-22", "2026-08-26")], ["08-29→09-02", PRIOR], ["09-05→09-09", PRE], ["09-12→09-16", POST]];
  const sigs = [["Home impressions (HomeRecommendation)", HOMEI, I], ["RFY play-through rate", corp("RFYPlayThroughRate"), v => PC(v, 2)], ["RFY bounce <60s (lower is better)", corp("RFYDuration0To60"), v => PC(v, 1)],
    ["RFY bounce 61–180s (lower is better)", corp("RFYDuration61To180"), v => PC(v, 1)], ["RFY D1 playtime (min)", corp("RFYD1Playtime"), v => F(v, 2)], ["RFY D1 qualified sessions", corp("RFYD1QualifiedPlaySessions"), v => F(v, 3)],
    ["RFY D2–7 play days", corp("RFYD2To7PlayDays"), v => F(v, 3)], ["RFY D2–7 playtime (min)", corp("RFYD2To7Playtime"), v => F(v, 2)], ["RFY D8–28 play days", corp("RFYD8To28PlayDays"), v => F(v, 3)],
    ["RFY D1 co-play days", corp("RFYD1CoplayDays"), v => F(v, 3)], ["RFY D1 spend days", corp("RFYD1SpendDay"), v => F(v, 4)], ["RFY D1 Robux spend", corp("RFYD1RobuxSpend"), v => F(v, 3)],
    ["D1 retention (headline)", d1, v => PC(v, 1)]];
  const rows = sigs.map(([lab, m, f]) => [lab, ...weeks.map(([, days]) => f(mean(days.map(d => m.get(d)))))]);
  T("retention", "Home ranking signals by week, beside Home impressions (Sat→Wed means)",
    ["Signal", ...weeks.map(w => w[0])], rows, [1, 2, 3, 4],
    "Read across each row. Play-through, bounce, D1 playtime and qualified sessions improve in the 09-05→09-09 week, before Home impressions rise in the 09-12→09-16 week. D8–28 play days rose in 09-05→09-09 and returned to its 08-22→09-02 level. The spend signals fall in the last week.",
    "RFY* metrics and UniqueUsersWithImpressions × AcquisitionSource (series.json, ONE_DAY); mean of the five Sat→Wed days in each week.");
}

// =====================================================================================
// ENGAGEMENT — mix decomposition of session length and playtime
// =====================================================================================
{
  const rows = [];
  for (const [metric, lab] of [["AverageSessionLengthMinutes", "Session length (min)"], ["AveragePlayTimeMinutesPerDAU", "Play minutes per DAU"]]) {
    const s = ex(metric, "IsNewUser"); if (!s) continue;
    const segB = {}, segA = {}; const shB = {}, shA = {};
    for (const k of ["New", "Returning"]) { segB[k] = s.segments[k].before; segA[k] = s.segments[k].after; }
    const nb = pairMeans(NEWU), rb = pairMeans(RETU);
    shB.New = nb.before / (nb.before + rb.before); shB.Returning = 1 - shB.New; shA.New = nb.after / (nb.after + rb.after); shA.Returning = 1 - shA.New;
    const blend = (seg, sh) => seg.New * sh.New + seg.Returning * sh.Returning;
    const bB = blend(segB, shB), bA = blend(segA, shA), mixOnly = blend(segB, shA), withinOnly = blend(segA, shB);
    rows.push([lab + " — New", F(segB.New), F(segA.New), DL(rel(segB.New, segA.New)), "—"]);
    rows.push([lab + " — Returning", F(segB.Returning), F(segA.Returning), DL(rel(segB.Returning, segA.Returning)), "—"]);
    rows.push([lab + " — blended (reconstructed)", F(bB), F(bA), DL(rel(bB, bA)), `mix alone ${DL(rel(bB, mixOnly))} · within-segment alone ${DL(rel(bB, withinOnly))}`]);
  }
  const nb = pairMeans(NEWU), rb = pairMeans(RETU);
  rows.push(["New-user share of DAU", PC(nb.before / (nb.before + rb.before)), PC(nb.after / (nb.after + rb.after)), PP((nb.after / (nb.after + rb.after) - nb.before / (nb.before + rb.before)) * 100, 1), "—"]);
  T("engagement", "Session length and playtime: how much is who showed up, how much is within each group",
    ["Series", "Before", "After", "Δ", "Decomposition"], rows, [1, 2, 3],
    "Mix alone = before-week segment values at after-week shares; within-segment alone = after-week segment values at before-week shares. Both groups' sessions lengthened, and the within-segment term is larger than the mix term.",
    "Explore AverageSessionLengthMinutes and AveragePlayTimeMinutesPerDAU × IsNewUser; DAU × IsNewUser for the shares (brainrot.json explore.specs).");
}

// =====================================================================================
// MONEY
// =====================================================================================
{
  const rows = [];
  for (const [lab, m] of [["DevProduct", DP], ["GamePass", GP]]) {
    const cur = pairMeans(m), prior = pairMeans(m, PRE, PRIOR);
    const perK = days => mean(days.map(d => m.get(d) / dau.get(d) * 1000));
    rows.push([lab, I(prior.before), I(cur.before), I(cur.after), DL(rel(cur.before, cur.after)), DL(rel(prior.before, prior.after)), F(perK(PRIOR), 1), F(perK(PRE), 1), F(perK(POST), 1), DL(rel(perK(PRE), perK(POST)))]);
  }
  const shr = days => mean(days.map(d => GP.get(d) / (GP.get(d) + DP.get(d))));
  rows.push(["GamePass share of revenue", PC(shr(PRIOR)), PC(shr(PRE)), PC(shr(POST)), PP((shr(POST) - shr(PRE)) * 100, 1), "—", "—", "—", "—", "—"]);
  T("money", "Revenue by source, in Robux and per 1,000 DAU",
    ["Source", "R$/day 08-29→09-02", "R$/day before", "R$/day after", "Δ", "Δ week before", "per 1k DAU 08-29→", "per 1k DAU before", "per 1k DAU after", "Δ per 1k DAU"], rows, [1, 2, 3, 4, 5, 6, 7, 8, 9],
    "DevProduct Robux held level while DAU rose 37%; GamePass Robux halved. Per player both fell, GamePass by more.",
    "DailyRevenue × RevenueSource (series.json, ONE_DAY) ÷ DailyActiveUsers. The ItemMonetizationRevenue hourly roll-up in the Monetization split table double-counts some days (09-07, 09-09, 09-10 read exactly 2× the daily GamePass figure), so this table uses DailyRevenue.");
}
{
  const days = range("2026-09-05", "2026-09-17");
  const rows = days.map(d => { const g = GP.get(d), g7 = GP.get(addDays(d, -7)), p = DP.get(d), p7 = DP.get(addDays(d, -7));
    return [`${dow(d)} ${d.slice(5)}${d === "2026-09-11" ? " (publish 15:51)" : d === "2026-09-07" ? " (US Labor Day)" : ""}`, I(g), I(g7), DL(rel(g7, g)), I(p), I(p7), DL(rel(p7, p)), I(dau.get(d)), DL(rel(dau.get(addDays(d, -7)), dau.get(d)))]; });
  T("money", "GamePass and DevProduct Robux by day, each against the same weekday a week earlier",
    ["Day", "GamePass R$", "GamePass −7d", "Δ", "DevProduct R$", "DevProduct −7d", "Δ", "DAU", "DAU Δ"], rows, [1, 2, 3, 4, 5, 6, 7, 8],
    "GamePass Robux is above its prior-week weekday on 09-09, 09-10 and 09-11 (+28% to +58%; 09-08 was −33%) and below it on all six days from 09-12 to 09-17 (−44% to −64%). DevProduct is above its prior-week weekday on 3 of those 6 days.",
    "DailyRevenue × RevenueSource and DailyActiveUsers (series.json).");
}
{
  // GamePass per 1k DAU, weekly since June
  const days = [...GP.keys()].filter(d => d >= "2026-06-01" && d <= "2026-09-17" && dau.get(d) && DP.get(d) != null);
  const rows = [];
  for (let i = 0; i < days.length; i += 7) { const ch = days.slice(i, i + 7);
    const g = mean(ch.map(d => GP.get(d))), dd = mean(ch.map(d => dau.get(d))), p = mean(ch.map(d => DP.get(d)));
    rows.push([`${ch[0].slice(5)} → ${ch.at(-1).slice(5)}`, String(ch.length), I(dd), I(g), F(g / dd * 1000, 1), F(p / dd * 1000, 1), PC(g / (g + p), 1)]); }
  T("money", "GamePass per 1,000 DAU by week since June",
    ["Week", "Days", "DAU/day", "GamePass R$/day", "GamePass per 1k DAU", "DevProduct per 1k DAU", "GamePass share"], rows, [1, 2, 3, 4, 5, 6],
    "The last row (09-14 → 09-17, 4 days) is the lowest GamePass-per-player week since June; DevProduct per player is also at its low.",
    "DailyRevenue × RevenueSource ÷ DailyActiveUsers (series.json), 7-day blocks from 06-01.");
}
{
  const rows = POST.map((d, i) => { const a = PRE[i];
    return [`${dow(d)} ${d.slice(5)} vs ${a.slice(5)}${i === MON ? " (US Labor Day before)" : ""}`, I(dau.get(a)), I(dau.get(d)), I(payers.get(a)), I(payers.get(d)), DL(rel(payers.get(a), payers.get(d))), PC(cvr.get(a), 2), PC(cvr.get(d), 2), I(rev.get(a)), I(rev.get(d)), DL(rel(rev.get(a), rev.get(d)))]; });
  const ex5 = k => pairMeans(k, POST, PRE, EXMON);
  const pa = ex5(payers), rv = ex5(rev), du = ex5(dau);
  rows.push(["**4 pairs without Monday**", I(du.before), I(du.after), I(pa.before), I(pa.after), DL(rel(pa.before, pa.after)), PC(pa.before / du.before, 2), PC(pa.after / du.after, 2), I(rv.before), I(rv.after), DL(rel(rv.before, rv.after))]);
  T("money", "Payers and revenue by day pair — the count behind PayingUsersCVR",
    ["Pair", "DAU before", "DAU after", "Payers before", "Payers after", "Payers Δ", "CVR before", "CVR after", "Revenue before", "Revenue after", "Revenue Δ"], rows, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    "Without the Labor Day pair, the number of paying users is flat (+0.3%) while DAU is +37.7%. The summary-row CVR is payers ÷ DAU; the metric PayingUsersCVR is a mean of daily ratios and differs slightly.",
    "PayingUsers, PayingUsersCVR, DailyRevenue, DailyActiveUsers (series.json).");
}
{
  const games = [["Brainrot", D], ...OTHERS.map(o => [o.name.split(" ")[0] === "+1" ? "Banana Monkey" : o.name.split(" ")[0] === "Climb" ? "Waterslide" : o.name.split(" ")[0], o])];
  const rows = games.map(([n, G]) => { const m = G.metrics.find(x => x.metric === "PayingUsersCVR"), du = G.metrics.find(x => x.metric === "DailyActiveUsers");
    const cells = POST.map((d, i) => { const a = m.run[PRE[i]], b = m.run[d]; return a != null && b != null ? DL(b / a - 1, 0) : "—"; });
    const t = m.run["2026-09-08"], y = m.run["2026-09-07"];
    return [n, ...cells, DL(m.cur.delta), DL(du.cur.delta), DL(rel(y, t), 0)]; });
  T("money", "Paying-user CVR by day pair on all five games — is it us or everyone?",
    ["Game", ...POST.map((d, i) => `${dow(d)} ${d.slice(5)}`), "5-pair Δ", "DAU Δ", "Mon 09-07 → Tue 09-08"], rows, [1, 2, 3, 4, 5, 6, 7, 8],
    "PayingUsersCVR fell on all five games this week and stepped down from Mon 09-07 to Tue 09-08 on all five (the before-window Saturday→Monday was the US Labor Day weekend). Brainrot's fall is the second-largest, and it is one of two games whose DAU grew.",
    "PayingUsersCVR and DailyActiveUsers from each game's reports/2026-09-19/data/<slug>.json (run + cur).");
}
{
  // five games: does GamePass diverge from DevProduct anywhere else?
  const NM = { brainrot: "Brainrot", waterslide: "Waterslide", monkey: "Banana Monkey", verity: "Verity", seal: "Seal" };
  const rows = [D, ...OTHERS].map(G => { const r = G.splits.revenueBySource || {}; const mt = k => G.metrics.find(x => x.metric === k);
    const nu = G.explore && G.explore.specs.find(s => s.metric === "DailyActiveUsers" && s.breakdown === "IsNewUser" && s.segments);
    return [NM[G.slug], DL(mt("DailyActiveUsers").cur.delta), nu ? DL(nu.segments.New.delta, 0) : "—", DL(mt("PayingUsers").cur.delta), DL(mt("PayingUsersCVR").cur.delta),
      r.DevProduct ? DL(r.DevProduct.delta) : "—", r.GamePass ? DL(r.GamePass.delta) : "—", r.GamePass && r.DevProduct ? PP((r.GamePass.delta - r.DevProduct.delta) * 100, 0).replace("pp", " pts") : "—"]; });
  T("money", "Audience and money deltas on all five games, same pairs",
    ["Game", "DAU", "New-user DAU", "Paying users", "Payer CVR", "DevProduct R$", "GamePass R$", "GamePass minus DevProduct"], rows, [1, 2, 3, 4, 5, 6, 7],
    "On the other four games GamePass and DevProduct moved within 16 points of each other; on Brainrot GamePass is 54 points below DevProduct. Waterslide, the other game whose DAU and new users rose, added paying users.",
    "Each game's reports/2026-09-19/data/<slug>.json: metrics[].cur (DailyActiveUsers, PayingUsers, PayingUsersCVR), splits.revenueBySource, explore DailyActiveUsers × IsNewUser. Same five Sat→Wed pairs.");
}
{
  // matched-DAU, matched-weekday: POST Mon–Wed against Mon–Wed 08-24→26 (similar DAU)
  const A = ["2026-08-24", "2026-08-25", "2026-08-26"], B = ["2026-09-14", "2026-09-15", "2026-09-16"];
  const newAll = L.seriesOf(ID, "DailyActiveUsers").filter(s => (s.filters || []).some(f => (f.dimension || f.name) === "IsNewUser" && (f.values || []).includes("New")) && !Object.keys(s.breakdown || {}).length);
  const newMap = new Map(); for (const s of newAll) for (const p of s.points) if (!p.partial && p.status !== "FILLED_ZERO" && !newMap.has(p.date)) newMap.set(p.date, p.value);
  const row = (lab, f) => [lab, ...A.map(f), ...B.map(f)];
  const rows = [
    row("DAU", d => I(dau.get(d))), row("New-user share", d => PC(newMap.get(d) / dau.get(d), 1)), row("Russia share", d => PC(RU.get(d) / dau.get(d), 1)),
    row("Paying users", d => I(payers.get(d))), row("Payers per 1k DAU", d => F(payers.get(d) / dau.get(d) * 1000, 2)), row("Revenue R$", d => I(rev.get(d))),
    row("GamePass R$", d => I(GP.get(d))), row("DevProduct R$", d => I(DP.get(d))), row("ARPPU R$", d => F(rev.get(d) / payers.get(d), 1)),
  ];
  const mA = mean(A.map(d => payers.get(d))), mB = mean(B.map(d => payers.get(d)));
  T("money", "Matched size and weekday: Mon–Wed 14–16 Sep against Mon–Wed 24–26 Aug",
    ["Series", ...A.map(d => `${dow(d)} ${d.slice(5)}`), ...B.map(d => `${dow(d)} ${d.slice(5)}`)], rows, [1, 2, 3, 4, 5, 6],
    `At near-identical DAU (123–127K then, 114–127K now) the game had ${I(mA)} payers a day then and ${I(mB)} now (${DL(rel(mA, mB))}). The audience composition differs: Russia's share tripled and the new-user share rose.`,
    "DailyActiveUsers, DailyActiveUsers with IsNewUser=New filter (slice, used only as a share), DailyActiveUsers × Country, PayingUsers, DailyRevenue × RevenueSource (series.json).");
}
{
  const exm = k => pairMeans(k, POST, PRE, EXMON);
  const du = exm(dau), pa = exm(payers);
  const cvrB = pa.before / du.before, zeroCase = pa.before / du.after, act = pa.after / du.after;
  const nonRuB = mean(EXMON.map(i => dau.get(PRE[i]) - RU.get(PRE[i]))), nonRuA = mean(EXMON.map(i => dau.get(POST[i]) - RU.get(POST[i])));
  const rows = [
    ["Before: payers ÷ DAU", I(pa.before) + " ÷ " + I(du.before), PC(cvrB, 3)],
    ["After, if every added player paid nothing and the rest paid as before", I(pa.before) + " ÷ " + I(du.after), PC(zeroCase, 3)],
    ["After, actual", I(pa.after) + " ÷ " + I(du.after), PC(act, 3)],
    ["Added DAU/day", SI(du.after - du.before), "—"],
    ["Added payers/day", SI(pa.after - pa.before), "—"],
    ["DAU outside Russia, before → after", I(nonRuB) + " → " + I(nonRuA), DL(rel(nonRuB, nonRuA))],
  ];
  T("money", "Dilution arithmetic for PayingUsersCVR (4 day pairs, Labor Day pair excluded)",
    ["Case", "Payers ÷ DAU", "Rate"], rows, [2],
    "The actual after-week rate matches the 'added players paid nothing' case to within 0.003pp. The arithmetic does not identify which players pay.",
    "PayingUsers, DailyActiveUsers, DailyActiveUsers × Country (series.json); pairs Sat, Sun, Tue, Wed.");
}

// =====================================================================================
// FUNNELS — capture age and a same-day re-read
// =====================================================================================
{
  const dq = fs.readFileSync(path.join(ROOT, "data/games", ID, "data-quality.md"), "utf8");
  const reread = {}; // `${funnel}|${step}|${date}` -> value re-served at 09-19
  for (const line of dq.split("\n")) {
    const m = line.match(/^\| revision \| FunnelCohortCompletionRate \| FunnelStep: (.+?) · FunnelName=(\S+) \| (\d{4}-\d{2}-\d{2})T.*?\| settled point re-served as ([\d.]+) \(captured (2026-09-19)[^)]*\); kept ([\d.]+)/);
    if (m) reread[`${m[2]}|${m[1]}|${m[3]}`] = +m[4];
  }
  // capture times of the kept values, from series.json
  const S = L.load(ID).metrics.FunnelCohortCompletionRate.series;
  const cap = {};
  for (const s of S) { if (s.granularity !== "METRIC_GRANULARITY_ONE_DAY" || Object.keys(s.breakdown || {}).join() !== "FunnelStep") continue;
    const fl = s.filters || []; if (fl.length !== 1 || (fl[0].dimension || fl[0].name) !== "FunnelName") continue;
    const fn = fl[0].values[0], step = (s.breakdownLabels && s.breakdownLabels.FunnelStep) || s.breakdown.FunnelStep;
    for (const p of s.points) { if (p.partial) continue; const k = `${fn}|${step}|${p.date}`; if (!(k in cap)) cap[k] = { v: p.value, at: p.capturedAt }; } }
  const age = (d, at) => at ? (new Date(at) - new Date(d + "T00:00:00Z")) / 864e5 : null;
  const pick = [["PlayerProgression", "FirstMorph"], ["PlayerProgression", "Rebirth1"], ["PlayerProgression", "Rebirth2"], ["PlayerProgression", "Rebirth4"], ["BaseUpgrades", "BaseUpgrade5"], ["BaseUpgrades", "BaseUpgrade10"], ["BaseUpgrades", "BaseUpgrade15"], ["BaseUpgrades", "BaseUpgrade20"]];
  const rows = pick.map(([fn, st]) => {
    const kept = days => mean(days.map(d => cap[`${fn}|${st}|${d}`] && cap[`${fn}|${st}|${d}`].v));
    const ages = days => days.map(d => age(d, cap[`${fn}|${st}|${d}`] && cap[`${fn}|${st}|${d}`].at)).filter(v => v != null);
    // 09-19 read: re-served value where logged; kept value where it was itself captured 09-19; else kept (re-read within 1%, unlogged)
    const now = days => mean(days.map(d => { const k = `${fn}|${st}|${d}`; return reread[k] != null ? reread[k] : cap[k] && cap[k].v; }));
    const aB = ages(PRE), aA = ages(POST);
    return [`${fn} · ${st}`, PC(kept(PRE), 1), PC(kept(POST), 1), PP((kept(POST) - kept(PRE)) * 100, 1), `${F(Math.min(...aB), 1)}–${F(Math.max(...aB), 1)}d / ${F(Math.min(...aA), 1)}–${F(Math.max(...aA), 1)}d`,
      PC(now(PRE), 1), PC(now(POST), 1), PP((now(POST) - now(PRE)) * 100, 1)];
  });
  T("funnels", "Funnel steps read two ways: first read (as charted) and all days re-read on 09-19",
    ["Step", "First read, before", "First read, after", "Δ", "Cohort age at first read (before / after)", "09-19 read, before", "09-19 read, after", "Δ"], rows, [1, 2, 3, 5, 6, 7],
    "The charted rates are the first settled read of each cohort. The before-week cohorts were first read younger (1.5–3.5 days) than the after-week cohorts (2.7–6.4 days), so on the first read the after-week has had longer to mature. On the 09-19 re-read the before-week cohorts are 10–14 days old and the after-week 3–7 days, which tilts the other way. The two Δ columns bracket the maturity-matched change.",
    "FunnelCohortCompletionRate × FunnelStep, one FunnelName filter (series.json, capturedAt per point); 09-19 re-served values from data/games/9963622286/data-quality.md revision rows (only divergences >1% are logged; unlogged days use the kept value).");
  global.__funnelNow = { reread, cap };
}
{
  // step-to-step conversion along the rebirth ladder and the late BaseUpgrade steps (first read)
  const f = Object.fromEntries(D.funnels.map(x => [x.name, Object.fromEntries(x.steps.map(s => [s.step, s]))]));
  const chain = [["PlayerProgression", ["FirstMorph", "Rebirth1", "Rebirth2", "Rebirth3", "Rebirth4"]], ["BaseUpgrades", ["BaseUpgrade15", "BaseUpgrade16", "BaseUpgrade17", "BaseUpgrade18", "BaseUpgrade19", "BaseUpgrade20"]]];
  const rows = [];
  for (const [fn, steps] of chain) for (let i = 1; i < steps.length; i++) { const a = f[fn][steps[i - 1]], b = f[fn][steps[i]];
    const rb = b.before / a.before, ra = b.after / a.after, rp = b.priorBefore / a.priorBefore;
    rows.push([`${steps[i - 1]} → ${steps[i]}`, PC(rp, 1), PC(rb, 1), PC(ra, 1), PP((ra - rb) * 100, 1)]); }
  T("funnels", "Step-to-step conversion on the rebirth ladder and the last BaseUpgrade steps (first read)",
    ["Transition", "08-29→09-02", "Before", "After", "Δ"], rows, [1, 2, 3, 4],
    "Each cell is the later step's cohort completion ÷ the earlier step's, so it reads as 'of those who reached step A, the share who reached step B'. FirstMorph → Rebirth1 is the transition that fell (−1.0pp); Rebirth1 → Rebirth2 and Rebirth2 → Rebirth3 rose.",
    "reports/2026-09-19/data/brainrot.json funnels (FunnelCohortCompletionRate, first read, 5 paired days).");
}
{
  const f = Object.fromEntries(D.funnels.map(x => [x.name, Object.fromEntries(x.steps.map(s => [s.step, s]))]));
  const { reread, cap } = global.__funnelNow;
  const days = range("2026-09-08", "2026-09-17");
  const steps = [["PlayerProgression", "FirstMorph"], ["PlayerProgression", "Rebirth1"], ["BaseUpgrades", "BaseUpgrade20"]];
  const rows = days.map(d => [`${dow(d)} ${d.slice(5)}${d === "2026-09-11" ? " (publish)" : d === "2026-09-12" ? " (admin abuse)" : ""}`, ...steps.flatMap(([fn, st]) => { const k = `${fn}|${st}|${d}`; const first = cap[k] && cap[k].v; const now = reread[k] != null ? reread[k] : first; return [PC(first, 1), PC(now, 1)]; })]);
  T("funnels", "The publish day and the Saturday after it, first read against the 09-19 re-read",
    ["Cohort day", "FirstMorph first", "FirstMorph 09-19", "Rebirth1 first", "Rebirth1 09-19", "BaseUpgrade20 first", "BaseUpgrade20 09-19"], rows, [1, 2, 3, 4, 5, 6],
    "The 09-11 spike and the 09-12 dip in the charted series both largely disappear on re-read (Rebirth1 09-12: 42.6% → 50.5%; BaseUpgrade20 09-11: 57.0% → 45.9%). FirstMorph's 97.9% on 09-12 is the one cohort below 99.3% in the run.",
    "FunnelCohortCompletionRate (series.json first reads) and data-quality.md 09-19 revision rows.");
}

// =====================================================================================
// TECHNICAL — instrument-fault days removed
// =====================================================================================
{
  const fault = { ClientFpsP10: ["2026-09-08"], ClientFpsAvg: ["2026-09-08"], ClientMemoryUsagePercentageAvg: ["2026-09-08"], ClientMemoryUsageAvg: ["2026-09-08"], ClientCpuTimeAvg: ["2026-09-15"] };
  const other = OTHERS.map(o => [o.slug, o]);
  const rows = [];
  for (const [k, days] of Object.entries(fault)) {
    const m = M(k); const run = new Map(Object.entries(m.run).filter(([, v]) => v != null));
    const keep = [0, 1, 2, 3, 4].filter(i => !days.includes(PRE[i]) && !days.includes(POST[i]));
    const c = pairMeans(run, POST, PRE, keep);
    const fd = days[0]; const ratio = [["brainrot", D], ...other].map(([s, G]) => { const g = G.metrics.find(x => x.metric === k); if (!g || !g.run) return null; const v = g.run[fd], v0 = g.run[addDays(fd, -1)]; return v != null && v0 ? v / v0 - 1 : null; });
    rows.push([`${m.label} \`${k}\``, fd.slice(5), ratio.map(r => DL(r, 0)).join(" · "), DL(m.cur.delta), `${c.n}/5`, DL(rel(c.before, c.after))]);
  }
  T("technical", "Client-performance deltas with the instrument-fault day removed",
    ["Metric", "Fault day", "Change into the fault day: Brainrot · Waterslide · Monkey · Verity · Seal", "Δ as charted (5 pairs)", "Pairs kept", "Δ without the fault pair"], rows, [3, 4, 5],
    "On 09-08 client FPS and memory collapsed by ~75–90% on four of the five games at once (the F28 telemetry fault; Waterslide's multi-place headline did not), and on 09-15 client CPU time fell 32–68% on all five. Same-day falls of this size on unrelated universes are logged as an instrument fault (COVERAGE.md F28), so those pairs are dropped here. Memory % goes from +14% as charted to a fall once 09-08 is removed.",
    "Each game's reports/2026-09-19/data/<slug>.json metrics[].run; COVERAGE.md F28 for 09-08.");
}
{
  const cr = bd("ClientCrashRate15m", "Platform"), dp = bd("DailyActiveUsers", "Platform");
  const grp = { Mobile: ["Phone", "Tablet"], Computer: ["Computer"], Console: ["Console"] };
  const w = (ps, days) => mean(days.map(d => { let n = 0, den = 0; for (const p of ps) { const r = cr.get(p) && cr.get(p).get(d), x = dp.get(p) && dp.get(p).get(d); if (r != null && x != null) { n += r * x; den += x; } } return den ? n / den : null; }));
  const rows = Object.entries(grp).map(([g, ps]) => [g, PC(w(ps, PRIOR), 2), PC(w(ps, PRE), 2), PC(w(ps, POST), 2), DL(rel(w(ps, PRE), w(ps, POST))), DL(rel(w(ps, PRIOR), w(ps, PRE)))]);
  const NM = { waterslide: "Waterslide", monkey: "Banana Monkey", verity: "Verity", seal: "Seal" };
  const pr = [["Brainrot", D], ...OTHERS.map(o => [NM[o.slug], o])].map(([n, G]) => { const m = G.metrics.find(x => x.metric === "ClientCrashRate15m"); return `${n} ${DL(m.cur.delta, 0)}`; }).join(" · ");
  T("technical", "Client crash rate by platform class, each against its own earlier weeks",
    ["Platform", "08-29→09-02", "Before", "After", "Δ this week", "Δ week before"], rows, [1, 2, 3, 4, 5],
    `The fall is on mobile only. Same metric on the other games this week: ${pr}.`,
    "ClientCrashRate15m × Platform (Place-filtered) and DailyActiveUsers × Platform (series.json); Mobile = DAU-weighted Phone + Tablet.");
}
{
  const days = range("2026-09-01", "2026-09-18");
  const oom = corp("OomUnexpectedExits"), cc = corp("ClientCrashCount"), crp = bd("ClientCrashRate15m", "Platform");
  const cpl = (k, d) => crp.get(k) && crp.get(k).get(d) != null ? PC(crp.get(k).get(d), 2) : "—";
  const rows = days.map(d => [`${dow(d)} ${d.slice(5)}${d === "2026-09-08" ? " (RU step; RCC 738 22:36)" : d === "2026-09-11" ? " (v612 15:51)" : d === "2026-09-18" ? " (v614 15:22)" : ""}`, PC(crash.get(d), 2), cpl("Phone", d), cpl("Tablet", d), cpl("Computer", d), I(cc.get(d)), I(oom.get(d)), dau.get(d) ? F(oom.get(d) / dau.get(d) * 1000, 2) : "—"]);
  T("technical", "Client crash rate by day, 01 → 18 Sep",
    ["Day", "Crash rate (15m)", "Phone", "Tablet", "Computer", "Client crashes", "OOM exits", "OOM per 1k DAU"], rows, [1, 2, 3, 4, 5, 6, 7],
    "The headline rate steps down twice: ~2.5% → ~2.1% on 09-08, then → ~1.4–1.6% from 09-12. Phone and Tablet carry both steps; Computer rises 09-08 → 09-10 and again 09-14 → 09-16. OOM exits are a floor by design (telemetry undercounts); read their direction only.",
    "ClientCrashRate15m (headline and × Platform), ClientCrashCount, OomUnexpectedExits (Place-filtered, series.json); DAU not served for 09-18.");
}
{
  const ls = D.splits.errorsByLogSource;
  const rows = ["Client", "Server"].map(k => { const m = new Map(Object.entries(ls[k])); const perDau = new Map([...m].filter(([d]) => dau.get(d)).map(([d, v]) => [d, v / dau.get(d)]));
    const c = pairMeans(perDau), raw = pairMeans(m);
    return [k, I(raw.before), I(raw.after), DL(rel(raw.before, raw.after)), F(c.before, 2), F(c.after, 2), DL(rel(c.before, c.after)), `${c.n}/5`]; });
  { const m = new Map(Object.entries(ls.Server)); const perDau = new Map([...m].filter(([d]) => dau.get(d)).map(([d, v]) => [d, v / dau.get(d)])); const c = pairMeans(perDau, POST, PRE, [1, 2, 3, 4]), raw = pairMeans(m, POST, PRE, [1, 2, 3, 4]);
    rows.push(["Server, Saturday pair excluded", I(raw.before), I(raw.after), DL(rel(raw.before, raw.after)), F(c.before, 2), F(c.after, 2), DL(rel(c.before, c.after)), `${c.n}/5`]); }
  const sat = ["2026-08-29", "2026-09-05", "2026-09-12"].map(d => `${d.slice(5)}: ${I(ls.Server[d])}`).join(" · ");
  T("technical", "Errors and warnings by log source, per DAU",
    ["LogSource", "Events/day before", "Events/day after", "Δ", "Per DAU before", "Per DAU after", "Δ per DAU", "Pairs"], rows, [1, 2, 3, 4, 5, 6],
    `09-08 has no ErrorCount point, so the Tuesday pair is missing. Server events on the last three Saturdays: ${sat} — the 09-05 Saturday is a one-day server spike (1.68M against ~0.2M on neighbouring days).`,
    "ErrorCount × LogSource (series.json, Place-filtered, ONE_DAY) ÷ DailyActiveUsers. Unit of ErrorCount is not documented by Roblox; per-DAU is a ratio of events to users.");
}

// =====================================================================================
// ERRORS — the filed exports
// =====================================================================================
const parseCsv = txt => { const recs = []; let row = [], cur = "", q = false; for (let i = 0; i < txt.length; i++) { const c = txt[i]; if (q) { if (c === '"') { if (txt[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; } else if (c === '"') q = true; else if (c === ",") { row.push(cur); cur = ""; } else if (c === "\n") { row.push(cur.replace(/\r$/, "")); recs.push(row); row = []; cur = ""; } else cur += c; } if (cur || row.length) { row.push(cur); recs.push(row); } return recs; };
const EXP = path.join(ROOT, "data/exports/9963622286-become-a-brainrot/errors");
const readExp = f => parseCsv(fs.readFileSync(path.join(EXP, f), "utf8")).slice(1).filter(r => r[0] && /^\d+$/.test(r[0])).map(r => ({ n: +r[0], sev: r[1], type: r[2], first: r[3], ver: r[4], msg: (r[5] || "").split("\n")[0].trim(), where: (r[6] || "").split("\n")[0].trim() }));
const shortMsg = s => s.replace(/Players\.<Player>\.PlayerGui\.MainFrame\.StoreFrames\.SeasonPass\.RewardsFrame\.Rewards\.ContentFrame\.LocalScript/, "SeasonPass rewards LocalScript").slice(0, 88);
{
  const now = readExp("errors_2026-09-19_0913_v404-v612_7d_106rows.csv"), then = readExp("errors_2026-09-08_1449_v404-v596_105rows.csv");
  const tn = sum(now.map(r => r.n)), tt = sum(then.map(r => r.n));
  const key = r => r.type + "|" + r.msg;
  const thenBy = new Map(then.map(r => [key(r), r.n]));
  const dauWk = mean(range("2026-09-12", "2026-09-17").map(d => dau.get(d)));
  const rows = now.slice(0, 18).map(r => [shortMsg(r.msg), r.type, r.sev, r.ver, I(r.n), F(r.n / 7 / dauWk, 2), PC(r.n / tn, 1), thenBy.has(key(r)) ? PC(thenBy.get(key(r)) / tt, 1) : "not in top rows"]);
  T("errors", "Error export, all versions, last 7 days (pulled 09-19 09:13 CEST) — top 18 signatures",
    ["Message (first line)", "Side", "Severity", "First seen", "Events, 7d", "Per DAU per day", "Share of export", "Share in the 09-08 export"], rows, [4, 5, 6, 7],
    `${now.length} signature rows totalling ${I(tn)} events. Per DAU uses the mean DAU of 09-12 → 09-17 (${I(dauWk)}). Only one row first seen at the last three builds (V608, V612, V614) is among the 25: \`[AnimalModule] Unknown trait: Ice\` (server, V612). Every other top row dates from V404–V596.`,
    "data/exports/9963622286-become-a-brainrot/errors/errors_2026-09-19_0913_v404-v612_7d_106rows.csv and errors_2026-09-08_1449_v404-v596_105rows.csv (window of the 09-08 file not recorded in its name; shares are window-free). Row cap ~25, so absence is not evidence.");
}
{
  const s612 = readExp("errors_2026-09-19_0914_since-v612_7d_30rows.csv"), s608 = readExp("errors_2026-09-10_1434_since-v608_27rows.csv"), s612d1 = readExp("errors_2026-09-11_1706_since-v612_1d_25rows.csv");
  const fam = r => /Value is not a valid member of Model "Workspace\.Plots/.test(r.msg) ? "Plot stand `Value` missing (AnimalStands.N, one row per stand)" :
    /disconnected during remote call to ReplicatedStorage\.Events\.Gift/.test(r.msg) ? "Gift remote: player disconnected mid-call" :
    /Unknown trait: Ice/.test(r.msg) ? "[AnimalModule] Unknown trait: Ice" : /Conetto Morsetto/.test(r.msg) ? "Conetto Morsetto is not a valid member of Models.Animals" :
    /AccessForbidden/.test(r.msg) ? "DataStoreService: AccessForbidden on SetAsync" : /Vanish is not a valid member/.test(r.msg) ? "Vanish is not a valid member of Assets.VFX" :
    /WeatherMachineModule/.test(r.msg) ? "[WeatherMachineModule.saveState] DataStore flush failed" : r.msg.slice(0, 70);
  const groups = new Map();
  for (const r of s612) { const k = fam(r) + "|" + r.type + "|" + r.ver; const g = groups.get(k) || { fam: fam(r), type: r.type, ver: r.ver, n: 0, rows: 0, first: r.first, where: r.where }; g.n += r.n; g.rows++; if (r.first < g.first) g.first = r.first; groups.set(k, g); }
  const toUtc = s => { const m = s.match(/(\w{3}) (\w{3}) (\d{2}) (\d{4}) (\d{2}):(\d{2})/); if (!m) return s; const dt = new Date(`${m[2]} ${m[3]} ${m[4]} ${m[5]}:${m[6]}:00 GMT+0200`); return dt.toISOString().slice(5, 16).replace("T", " "); };
  const earlier = f => s608.some(r => fam(r) === f) ? "yes — in the since-v608 export (09-10)" : s612d1.some(r => fam(r) === f) ? "yes — in the 09-11 1-day export" : "no";
  const dauWk = mean(range("2026-09-12", "2026-09-17").map(d => dau.get(d)));
  const rows = [...groups.values()].sort((a, b) => b.n - a.n).map(g => [g.fam, g.type, g.ver, String(g.rows), I(g.n), F(g.n / 7 / dauWk * 1000, 2), toUtc(g.first), earlier(g.fam)]);
  T("errors", "Signatures first seen at v612 or later, last 7 days — grouped into families",
    ["Family", "Side", "First-seen version", "Export rows", "Events, 7d", "Per 1k DAU per day", "First seen (UTC)", "Also under an earlier build?"], rows, [3, 4, 5],
    "‘First seen at v612’ means this exact text first appeared at v612. Two families carry a line number that moved between builds (Conetto Morsetto: line 1795 at v608, 1800 at v612, 1831 at v614; Gift: 1493 → 1498 → 1529), so they are older messages re-counted as new. 17 of 30 rows are one stand-numbered family at exactly 680 each; the list is capped, so its tail is not visible.",
    "errors_2026-09-19_0914_since-v612_7d_30rows.csv (filter: FirstSeenPlaceVersion ≥ 612), errors_2026-09-10_1434_since-v608_27rows.csv, errors_2026-09-11_1706_since-v612_1d_25rows.csv. First-seen times converted from CEST to UTC.");
}
{
  const s614 = readExp("errors_2026-09-19_0914_since-v614_1d_26rows.csv");
  const fam = r => /disconnected during remote call to ReplicatedStorage\.Events\.(Gift|TradeRequest)/.test(r.msg) ? "Gift / TradeRequest remote: player disconnected mid-call" : /must be a child of game\.Players/.test(r.msg) ? "Gift / TradeRequest remote: player disconnected mid-call" : /Rejoin time/.test(r.msg) ? "<Player> Rejoin time: N (warning)" : r.msg.slice(0, 80);
  const groups = new Map(); for (const r of s614) { const k = fam(r) + "|" + r.type; const g = groups.get(k) || { fam: fam(r), type: r.type, n: 0, rows: 0 }; g.n += r.n; g.rows++; groups.set(k, g); }
  const tot = sum(s614.map(r => r.n));
  const v614 = D.deploy.halfhour.find(r => r.v === 614);
  const rows = [...groups.values()].sort((a, b) => b.n - a.n).map(g => [g.fam, g.type, String(g.rows), I(g.n), PC(g.n / tot, 1)]);
  T("errors", "Signatures first seen at v614 (published 09-18 15:22 UTC), last 1 day",
    ["Family", "Side", "Export rows", "Events", "Share of export"], rows, [2, 3, 4],
    `${I(tot)} events in ${s614.length} rows, against ${I(v614 && v614.errors)} total errors attributed to v614 by the deploy log over the same span — so errors first seen at v614 are ~${PC(tot / (v614 && v614.errors), 2)} of what v614 emits; the rest is inherited text. The WrapDeformer row names a player's avatar accessory, not a game asset.`,
    "errors_2026-09-19_0914_since-v614_1d_26rows.csv; reports/2026-09-19/deploy/9963622286-a.md (ErrorCount by PlaceVersion, half-hour).");
}

// =====================================================================================
// SENTIMENT — the text reviews, full history for base rates
// =====================================================================================
{
  const rows = FB.rows;
  const THEMES = [
    ["Loading / lag / performance", /load|lag|fps|freez|stutter|crash|laggy|join|лаг|carga|lento/i],
    ["Lost progress / reset / data", /reset|reaset|wipe|lost (my|all)|lose|progress|save|сброс|потерял|perd/i],
    ["Robux / paid and did not get", /robux|money|pay|paid|refund|\bR\$|€|dinero|деньг/i],
    ["Admin abuse", /admin/i],
    ["Treadmill / speed", /treadmill|tapis|speed|скорост|velocidad/i],
    ["Bugs / glitches / broken", /bug|glitch|broken|fix|stuck|bugead|баг|arregl/i],
    ["'It used to be better' / update worse", /used to|раньше|верните|bring back|update (is|was) (bad|worse)|обновление|since the (upgrade|update)/i],
    ["Asks for content (world / treadmill / feature)", /add|world ?4|new world|please make|сделай|добавьте|agreg/i],
  ];
  const mobile = r => /Phone|Tablet/i.test(r.device || ""); const comp = r => /Computer/i.test(r.device || "");
  const since = rows.filter(r => r.d >= "2026-09-04"), aug = rows.filter(r => r.d >= "2026-08-01" && r.d < "2026-09-04");
  const withText = a => a.filter(r => (r.comment || "").trim().length > 3);
  const out = THEMES.map(([lab, re]) => { const c = a => withText(a).filter(r => re.test(r.comment)).length;
    const all = withText(rows); const mob = all.filter(mobile), cmp = all.filter(comp);
    return [lab, `${c(rows)} / ${all.length} (${PC(c(rows) / all.length, 0)})`, `${c(aug)} / ${withText(aug).length}`, `${c(since)} / ${withText(since).length}`, `${PC(mob.filter(r => re.test(r.comment)).length / mob.length, 0)} / ${PC(cmp.filter(r => re.test(r.comment)).length / cmp.length, 0)}`]; });
  global.__themeRe = THEMES;
  T("sentiment", "Review themes, counted with fixed patterns — full history as the base rate",
    ["Theme", "All reviews (01 Apr → 14 Sep)", "01 Aug → 03 Sep", "Since 04 Sep", "Mobile / Computer share, all-time"], out, [1, 2, 3, 4],
    `n = ${rows.length} reviews all-time, ${withText(since).length} with text since 09-04 — too few to rank themes this week; the columns give the base rate those ${withText(since).length} are read against. A review can hit several themes. Mobile = Phone + Tablet.`,
    "reports/2026-09-19/data/feedback-9963622286.json (merged from every raw grab bundle + the live review log; the live poll at 09-19 09:10 UTC returned 0 new Brainrot rows). Patterns are case-insensitive regexes listed in tools/r0919/extras/brainrot.js.");
}
{
  const rows = FB.rows;
  const cyr = r => /[Ѐ-ӿ]/.test(r.comment || "");
  const blocks = [["01 Jun → 30 Jun", "2026-06-01", "2026-06-30"], ["01 Jul → 31 Jul", "2026-07-01", "2026-07-31"], ["01 Aug → 31 Aug", "2026-08-01", "2026-08-31"], ["01 Sep → 07 Sep", "2026-09-01", "2026-09-07"], ["08 Sep → 14 Sep", "2026-09-08", "2026-09-14"]];
  const out = blocks.map(([lab, a, b]) => { const r = rows.filter(x => x.d >= a && x.d <= b); const dn = r.filter(x => /down/i.test(x.cat)).length;
    return [lab, String(r.length), String(dn), PC(dn / r.length, 0), `${r.filter(cyr).length} (${PC(r.filter(cyr).length / r.length, 0)})`, `${r.filter(x => /Phone|Tablet/i.test(x.device || "")).length} / ${r.filter(x => /Computer/i.test(x.device || "")).length}`]; });
  const all = rows.filter(x => /down/i.test(x.cat)).length;
  out.push(["**All-time**", String(rows.length), String(all), PC(all / rows.length, 0), `${rows.filter(cyr).length} (${PC(rows.filter(cyr).length / rows.length, 0)})`, `${rows.filter(x => /Phone|Tablet/i.test(x.device || "")).length} / ${rows.filter(x => /Computer/i.test(x.device || "")).length}`]);
  T("sentiment", "Reviews by period: volume, downvote rate, Cyrillic-script share, device",
    ["Period", "Reviews", "Downvotes", "Downvote rate", "Written in Cyrillic", "Mobile / Computer"], out, [1, 2, 3, 4],
    "The downvote rate of this game's reviews has sat near 50% for its whole life, so a single build's rate on 4 reviews carries no signal. Cyrillic-script reviews are counted as a check against Russia's DAU share, which tripled from 09-08.",
    "feedback-9963622286.json; downvote rate = Downvote ÷ all rows; Cyrillic = any character in U+0400–U+04FF.");
}
{
  const v = corp("PlayerFeedbackVotesCount");
  const per = new Map([...v].filter(([d]) => dau.get(d)).map(([d, x]) => [d, x / dau.get(d) * 1000]));
  const c = pairMeans(v), p = pairMeans(per), pr = pairMeans(per, PRE, PRIOR);
  T("sentiment", "Net feedback votes (up − down) per 1,000 DAU",
    ["Window", "Net votes/day", "Per 1k DAU"], [["08-29→09-02", "—", F(pr.before, 3)], ["Before (09-05→09-09)", F(c.before, 1), F(p.before, 3)], ["After (09-12→09-16)", F(c.after, 1), F(p.after, 3)], ["Δ", DL(rel(c.before, c.after)), DL(rel(p.before, p.after))]], [1, 2],
    "The corpus holds this series only as up minus down since 08-06 (the VoteType split stops then), so it cannot give a downvote rate; per player it barely moved.",
    "PlayerFeedbackVotesCount (series.json, ONE_DAY) ÷ DailyActiveUsers.");
}

// =====================================================================================
// APPENDIX — the country step, daily
// =====================================================================================
{
  const days = range("2026-09-01", "2026-09-17");
  const lo = bd("DailyActiveUsers", "Locale");
  const cs = ["RU", "KZ", "UA", "BY", "US", "ID", "VN", "MX"];
  const rows = days.map(d => [`${dow(d)} ${d.slice(5)}`, I(dau.get(d)), ...cs.map(c => I(country.get(c) && country.get(c).get(d))), I(lo.get("ru_ru") && lo.get("ru_ru").get(d)), I(NEWU.get(d))]);
  T("appendix", "DAU by country and by Russian locale, daily 01 → 17 Sep",
    ["Day", "DAU", ...cs, "Locale ru_ru", "New-user DAU"], rows, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    "Russia and the ru_ru locale step up on Tue 09-08 (RU 5,844 → 11,992 in one day); Kazakhstan, Ukraine and Belarus rise more gradually from 09-10; the US holds at 11–14K on weekdays.",
    "DailyActiveUsers × Country and × Locale (series.json); new-user DAU from Explore.");
}

fs.writeFileSync(path.join(DATA, "extras-brainrot.json"), JSON.stringify({ game: ID, builtAt: new Date().toISOString(), tables }, null, 1));
console.log(`wrote extras-brainrot.json: ${tables.length} tables`);
