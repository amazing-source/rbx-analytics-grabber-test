// Analyst tables for Seal A Driveway (10638354731), week of the 11 Sep build (v915).
// Reads the built data file, the portfolio file, the merged feedback file, the corpus
// (series.json via tools/lib.js), the raw capture bundles (for funnel capture ages and
// session buckets) and the filed error exports. Writes
//   reports/2026-09-19/data/extras-seal.json
// Every number in the Seal page's prose is either in data/seal.json or in this output.
//   node tools/r0919/extras/seal.js
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "../../../");
const L = require(path.join(ROOT, "tools/lib.js"));
const ID = "10638354731", SLUG = "seal";
const rd = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const D = rd(`reports/2026-09-19/data/${SLUG}.json`);
const PF = rd("reports/2026-09-19/data/portfolio.json");
const FB = rd(`reports/2026-09-19/data/feedback-${ID}.json`);
const GAMES = ["brainrot", "waterslide", "monkey", "verity", "seal"];
const G = Object.fromEntries(GAMES.map(s => [s, rd(`reports/2026-09-19/data/${s}.json`)]));
const W = D.window, POST = W.POST, PRE = W.PRE, PRIOR = W.PRIOR;
const tables = [];
const T = (section, title, columns, rows, numeric, note, source) => tables.push({ section, title, columns, rows, numeric, note, source });

// ---------- formatting helpers
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dn = d => DOW[new Date(d + "T00:00:00Z").getUTCDay()];
const md = d => d.slice(5);
const addDays = (d, n) => new Date(Date.parse(d + "T00:00:00Z") + n * 864e5).toISOString().slice(0, 10);
const mean = a => { const b = a.filter(x => x != null && Number.isFinite(x)); return b.length ? b.reduce((x, y) => x + y, 0) / b.length : null; };
const sd = a => { const m = mean(a); if (m == null || a.length < 2) return null; return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };
const I = v => v == null || !Number.isFinite(v) ? "—" : Math.round(v).toLocaleString("en-US");
const z0 = (x, dp) => Math.abs(x) < 0.5 * Math.pow(10, -dp) ? 0 : x;
const P = (v, dp = 1) => v == null || !Number.isFinite(v) ? "—" : z0(v * 100, dp).toFixed(dp).replace(/^-/, "−") + "%";
const S = (d, dp = 1) => d == null || !Number.isFinite(d) ? "—" : (d > 0 ? "+" : d < 0 ? "−" : "") + Math.abs(d * 100).toFixed(dp) + "%";
const PP = (d, dp = 1) => d == null || !Number.isFinite(d) ? "—" : (d > 0 ? "+" : d < 0 ? "−" : "") + Math.abs(d * 100).toFixed(dp) + " pp";
const N = (v, dp = 2) => v == null || !Number.isFinite(v) ? "—" : v.toFixed(dp);
const SN = (v, dp = 2) => v == null || !Number.isFinite(v) ? "—" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(dp);
const rel = (a, b) => a != null && b != null && a !== 0 ? b / a - 1 : null;
const M = k => D.metrics.find(m => m.metric === k);
const run = k => (M(k) || {}).run || {};

// =====================================================================================
// TIMELINE
// =====================================================================================
// Listing title per raw capture (develop.roblox.com places call inside every bundle).
const RAW = path.join(ROOT, "data/raw");
const rawFiles = fs.readdirSync(RAW).filter(f => f.startsWith(ID + "-")).sort();
const loadRaw = f => { const r = JSON.parse(fs.readFileSync(path.join(RAW, f), "utf8")); return Array.isArray(r) ? r : Object.values(r); };
const rawCaps = []; // {file, caps}
for (const f of rawFiles) rawCaps.push({ file: f, caps: loadRaw(f) });
const reqOf = c => { let rb = c.reqBody; try { if (typeof rb === "string") rb = JSON.parse(rb); } catch (e) { rb = null; } return rb && rb.query ? rb.query : null; };
const titles = [];
for (const { file, caps } of rawCaps) for (const c of caps)
  if (c.url && /\/v1\/universes\/\d+\/places/.test(c.url) && c.body && c.body.data) titles.push({ t: new Date(c.ts).toISOString(), name: c.body.data.map(x => x.name).join(" | ") });
titles.sort((a, b) => a.t < b.t ? -1 : 1);
const titleRuns = [];
for (const x of titles) { const last = titleRuns.at(-1); if (last && last.name === x.name) last.to = x.t; else titleRuns.push({ name: x.name, from: x.t, to: x.t }); }
T("timeline", "Experience title as read from each grab (develop.roblox.com places list)",
  ["Title", "First seen in a grab (UTC)", "Last seen in a grab (UTC)"],
  titleRuns.map(r => [r.name, r.from.slice(0, 16).replace("T", " "), r.to.slice(0, 16).replace("T", " ")]), [],
  "A title change is dated only to the interval between two grabs; there was no grab between 09-14 16:48 and 09-19 09:04.",
  "`data/raw/10638354731-*.json`, the `develop.roblox.com/v1/universes/{id}/places` response in each bundle, grouped by consecutive identical names.");

// What each build contained, and the independent evidence for it.
const pv = D.placeVersions.filter(v => v.v >= 914);
const ev = D.annotations.filter(a => /EVENT_STATE/.test(a.type)).map(a => `${a.what.replace("EXPERIENCE_EVENT_STATE: ", "")} ${a.t.slice(5, 16).replace("T", " ")}`);
const titleNewMap = titleRuns.find(r => /NEW MAP/.test(r.name));
const specRows = {
  914: ["Update 04.09", "Mobile UI rework; squeegee-skin VFX from Rare; performance/QoL bugs; rebirth UI rework; tutorial rework (arrows to Refill Station and Upgrades, exit arrow, Quick Upgrades highlight, vehicle hint at 250K). Refill teleport PAUSED, not live."],
  915: ["Update 10.09", "Bug fixes: FPS, airport driveway, mobile UI; \"rewriting core part of the AI code\". Invite-friend bonus (+15% cash on work earnings while an invited friend is in, shown on a bar). Like + group reward (50k cash + 1 instant refill). Sealer colours: 4 new, 2 for cash (100k / 500k), 2 for Robux (29R / 49R)."],
  918: ["none filed", "Unknown. No spec block was supplied for this build."],
  919: ["none filed", "Unknown. No spec block was supplied for this build."],
};
const evidence = {
  914: `Event annotation NEW UPDATE START ${ev.find(x => /NEW UPDATE START 09-04/.test(x)) ? "09-04 18:00" : "—"}`,
  915: "Event NEW UPDATE START 09-10 18:00 → END 09-13 16:55; `PlayerFeedbackVotesCount` stepped on 09-11 (sentiment table)",
  918: `Event NEW UPDATE START 09-17 19:00; title reads "[NEW MAP]" from ${titleNewMap ? titleNewMap.from.slice(5, 16).replace("T", " ") : "—"}; errors first seen at v918 name a \`RobotHelper\` DataStore and a "Helper price" lookup; \`MapReach 2\` step 5 is labelled NewZone in the 09-19 09:10 pull`,
  919: "No event annotation; live 09-18 15:41 while v918 servers were still emitting errors at 09-19 09:00",
};
T("timeline", "Builds from 04 Sep: what the spec says each contained",
  ["Version", "Saved / published (UTC)", "Live?", "Spec block", "Contents per spec", "Independent evidence in the data"],
  pv.map(v => [`v${v.v}`, v.t.slice(5, 16).replace("T", " "), v.published ? "published" : "saved, not published",
    (specRows[v.v] || ["—"])[0], (specRows[v.v] || [, v.published ? "—" : "Not live."])[1] || (v.published ? "—" : "Not live."), evidence[v.v] || "—"]), [],
  "Spec contents are Ren's specs as filed; a spec item is not proof the item shipped working. v918 and v919 have no spec — their contents are unknown beyond what the title and error text name.",
  "`data/updates/10638354731-seal-a-driveway.md`; `placeVersions` and `annotations` in `data/seal.json`; title from raw bundles (table above); error text from `data/exports/10638354731-seal-a-driveway/errors/errors_2026-09-19_0919_since-v918_7d_44rows.csv`.");

// Old-build tail after each publish (ErrorCount by PlaceVersion).
const errDaily = L.daily(ID, "ErrorCount", { gran: "METRIC_GRANULARITY_ONE_DAY" });
const dv = v => D.deploy.daily.find(r => r.v === v) || {};
const hv = v => D.deploy.halfhour.filter(r => r.v === v);
const v914 = dv(914), v915d = dv(915);
const e0910 = (errDaily.get("2026-09-09") || 0) + (errDaily.get("2026-09-10") || 0);
const v914after = v914.errors - e0910;
const e1114 = ["2026-09-11", "2026-09-12", "2026-09-13", "2026-09-14"].reduce((s, d) => s + (errDaily.get(d) || 0), 0);
const v915hh = hv(915).sort((a, b) => a.last < b.last ? 1 : -1)[0];
const v918hh = hv(918).sort((a, b) => a.last < b.last ? 1 : -1)[0];
const v919hh = hv(919)[0];
const tail = [
  ["v914 → v915 (09-11 11:10)", `last error day ${v914.last}`, I(v914after), `${P(v914after / e1114)} of all errors 09-11 → 09-14`,
    "v914 total over its served span minus all errors on 09-09 and 09-10 (only v914 was live then)"],
  ["v915 → v918 (09-17 15:56)", `last half-hour bucket ${v915hh ? v915hh.last : "—"}`, "—", "—", "half-hour deploy log; bucket counts per version per slot are not served"],
  ["v918 → v919 (09-18 15:41)", `still emitting in the latest bucket ${v918hh ? v918hh.last : "—"}`, v919hh ? I(v919hh.errors) + " (v919)" : "—",
    v918hh && v919hh ? `v919 ${I(v919hh.errors)} vs v918 ${I(v918hh.errors)} since 09-18 00:00` : "—", "the 09-19 population is a mix of v918 and v919 servers"],
];
T("timeline", "How long the previous build kept running after each publish",
  ["Publish", "Old build last seen", "Old-build errors after publish", "Share", "How computed"], tail, [2],
  "Errors are a proxy for players on each build, not a count of them: two builds can throw at different rates per player.",
  "`deploy` in `data/seal.json` (`ErrorCount` by `PlaceVersion`, Place-filtered) and headline `ErrorCount` ONE_DAY from `series.json`.");

// =====================================================================================
// REACH
// =====================================================================================
const impr = run("UniqueUsersWithImpressions"), dau = run("DailyActiveUsers");
const decompRow = (label, a, b) => {
  const i0 = a.map(d => impr[d]), i1 = b.map(d => impr[d]), u0 = a.map(d => dau[d]), u1 = b.map(d => dau[d]);
  const I0 = mean(i0), I1 = mean(i1), U0 = mean(u0), U1 = mean(u1);
  const c0 = U0 / I0, c1 = U1 / I1, lu = Math.log(U1 / U0), li = Math.log(I1 / I0);
  return [label, S(rel(I0, I1)), `${P(c0, 2)} → ${P(c1, 2)}`, S(rel(c0, c1)), S(rel(U0, U1)), P(li / lu, 0), P(1 - li / lu, 0)];
};
const decomp = POST.map((d, i) => decompRow(`${dn(d)} ${md(PRE[i])} → ${md(d)}`, [PRE[i]], [d]));
decomp.push(decompRow("**5-day mean, this week**", PRE, POST));
decomp.push(decompRow("5-day mean, week before", PRIOR, PRE));
T("reach", "DAU split into reach and conversion, per weekday pair",
  ["Pair", "Impressions Δ", "DAU ÷ impressions", "Conversion Δ", "DAU Δ", "Share of log-change: reach", "Share: conversion"], decomp, [1, 3, 4, 5, 6],
  "DAU = impressions × (DAU ÷ impressions) is an identity, so the two shares add to 100%. It says which term moved, not why.",
  "`UniqueUsersWithImpressions` and `DailyActiveUsers` ONE_DAY from `data/seal.json`; share = ln(impressions ratio) ÷ ln(DAU ratio).");

// Conversion by acquisition source
const srcs = ["HomeRecommendation", "ContinueToPlay", "Others", "Friends", "Search"];
const convRows = srcs.map(s => {
  const im = D.splits.impressionsBySource[s], du = D.splits.dauBySource[s];
  if (!im) return null;
  const same = ["HomeRecommendation", "Friends", "Search"].includes(s);
  const c0 = du && same ? du.before / im.before : null, c1 = du && same ? du.after / im.after : null;
  return [s, I(im.before), I(im.after), S(im.delta), du ? I(du.before) : "— (no DAU source)", du ? I(du.after) : "—", du ? S(du.delta) : "—",
    c0 != null ? `${P(c0, 2)} → ${P(c1, 2)}` : "—"];
}).filter(Boolean);
T("reach", "Impressions and DAU by acquisition source, and DAU per impression",
  ["Source", "Impressions before", "after", "Δ", "DAU before", "after", "Δ", "DAU ÷ impressions"], convRows, [1, 2, 3, 4, 5, 6],
  "`ContinueToPlay` has impressions but no matching DAU source, and `Others` DAU is not fed only by `Others` impressions, so no ratio is shown for either. DAU ÷ impressions within a source is a descriptive ratio, not Roblox's `EndToEndCVR`.",
  "`splits.impressionsBySource` and `splits.dauBySource` in `data/seal.json` (5 weekday pairs each).");

// DAU share by source
const dsrc = D.splits.dauBySource, dsKeys = Object.keys(dsrc).filter(k => dsrc[k].pairs);
const sumB = dsKeys.reduce((s, k) => s + dsrc[k].before, 0), sumA = dsKeys.reduce((s, k) => s + dsrc[k].after, 0);
T("reach", "Share of DAU by acquisition source",
  ["Source", "Share before", "Share after", "Δ share", "DAU Δ"],
  dsKeys.sort((a, b) => dsrc[b].after - dsrc[a].after).map(k => [k, P(dsrc[k].before / sumB), P(dsrc[k].after / sumA), PP(dsrc[k].after / sumA - dsrc[k].before / sumB), S(dsrc[k].delta)]), [1, 2, 3, 4],
  "Shares are of the sum of the source series (5-day means), which is within a few percent of headline DAU.",
  "`splits.dauBySource` in `data/seal.json`.");

// "Others" impressions step on 09-11, all five games
const othRows = GAMES.map(s => { const o = G[s].splits.impressionsBySource && G[s].splits.impressionsBySource.Others; if (!o) return [s, "—", "—", "—", "—"];
  const r = o.run; return [G[s].name.split(" [")[0], I(r["2026-09-09"]), I(r["2026-09-10"]), I(r["2026-09-11"]), S(rel(r["2026-09-10"], r["2026-09-11"]))]; });
const pub0911 = GAMES.map(s => `${G[s].name.split(" [")[0]} ${[...new Set(G[s].placeVersions.filter(v => v.published && v.d === "2026-09-11" && (s !== "waterslide" || v.place === G[s].root)).map(v => "v" + v.v))].join("/")}`).join(", ");
T("reach", "`Others` impressions stepped down on 11 Sep on all five games",
  ["Game", "09-09", "09-10", "09-11", "Δ 09-10 → 09-11"], othRows, [1, 2, 3, 4],
  `The step lands on the same day on all five games. All five also published that day (${pub0911}), so co-movement cannot separate a platform or instrument change from a change the five builds share. \`Others\` DAU did not step on 09-11.`,
  "`splits.impressionsBySource.Others.run` in each game's `reports/2026-09-19/data/<slug>.json`.");

// RFY signal block vs impressions
const sigList = [["UniqueUsersWithImpressions", "reference"], ["RFYPlayThroughRate", "up"], ["RFYQualifiedPTR", "up"], ["RFYUniqueNotInterestedUsersPerMillionImpressions", "down"],
  ["RFYDuration0To60", "down"], ["RFYDuration61To180", "down"], ["RFYD1Playtime", "up"], ["RFYD1QualifiedPlaySessions", "up"], ["RFYD1CoplayDays", "up"],
  ["RFYL7PlayDays", "up"], ["RFYD2To7PlayDays", "up"], ["RFYD2To7Playtime", "up"], ["RFYD2To7QualifiedPlaySessions", "up"], ["RFYD2To7CoplayDays", "up"],
  ["RFYD1SpendDay", "up"], ["RFYD1RobuxSpend", "up"], ["RFYD2To7SpendDays", "up"], ["RFYD2To7RobuxSpend", "up"]];
const fmtM = (m, v) => v == null ? "—" : m.unit === "pct" ? P(v, 2) : m.unit === "int" ? I(v) : N(v, m.unit === "num1" ? 1 : m.unit === "num2" ? 2 : 3);
T("reach", "Home-ranking signals (RFY) against the impression change",
  ["Series", "Before", "After", "Δ this week", "Δ week before", "Direction this week"],
  sigList.map(([k, good]) => { const m = M(k); if (!m) return null; const d = m.cur.delta;
    const dir = good === "reference" ? "reference" : d == null ? "—" : Math.abs(d) < 0.05 ? "within ±5%" : ((good === "up") === (d > 0) ? "favourable" : "unfavourable");
    return [`\`${k}\``, fmtM(m, m.cur.before), fmtM(m, m.cur.after), S(d), S(m.prior.delta), dir]; }).filter(Boolean), [1, 2, 3, 4],
  "`RFYD8To28*` series are served only from 09-12 (earlier days are gap-fills), so they have no before-window; they read 0.284 → 0.212 play days across 09-12 → 09-17. RFY signals cover RFY-organic players only.",
  "`metrics[]` in `data/seal.json`; `RFYD8To28PlayDays` from `series.json` (ONE_DAY, settled).");

// Lifecycle depth, five games
const lc = PF.games.map(g => {
  const postMean = mean(POST.map(d => g.dauRun && g.dauRun[d])), last = Object.entries(g.pctOfPeak).sort().at(-1);
  const days = Math.round((Date.parse("2026-09-16") - Date.parse(g.peak.date)) / 864e5);
  return [g.name.split(" [")[0], g.peak.date, I(g.peak.dau), String(days), P(postMean / g.peak.dau), `${P(last[1])} (${md(last[0])})`, S(g.k.DailyActiveUsers.d), S(g.k.DailyActiveUsers.prior)];
});
T("reach", "Where each game sits on its own curve (DAU as % of its own peak)",
  ["Game", "Peak day", "Peak DAU", "Days peak → 09-16", "This week's mean, % of peak", "Newest, % of peak", "DAU Δ this week", "DAU Δ week before"], lc, [2, 3, 4, 5, 6, 7],
  "Brainrot is the portfolio's measured floor: it fell to about 6–9% of peak and then held and rose. One game is one observation.",
  "`reports/2026-09-19/data/portfolio.json` (`peak`, `pctOfPeak`, `dauRun`, `k.DailyActiveUsers`).");

// =====================================================================================
// CCU
// =====================================================================================
const cpSpec = D.explore.specs.find(s => s.metric === "ConcurrentPlayers" && s.points);
const hourly = {}; // date -> {h: v}
// The last kept hourly bucket is in progress at pull time (09:12 UTC): keep 09-19 hours 00–08 only.
const PULL = Date.parse(D.explore.pulledAt);
for (const [k, v] of Object.entries(cpSpec.points)) { const t = Date.parse(k); if (t + 36e5 > PULL) continue; const d = k.slice(0, 10), h = +k.slice(11, 13); (hourly[d] ||= {})[h] = v; }
const dayMean = d => { const hs = hourly[d]; if (!hs || Object.keys(hs).length < 24) return null; return mean(Object.values(hs)); };
const hoursMean = (d, hs) => { const x = hs.map(h => hourly[d] && hourly[d][h]); return x.some(v => v == null) ? null : mean(x); };
const pubDays = { "2026-09-04": "v914 20:22", "2026-09-11": "v915 11:10", "2026-09-17": "v918 15:56", "2026-09-18": "v919 15:41" };
const evDays = { "2026-09-05": "NEW UPDATE event", "2026-09-06": "NEW UPDATE event", "2026-09-07": "NEW UPDATE event (to 19:00)", "2026-09-10": "event from 18:00", "2026-09-11": "NEW UPDATE event", "2026-09-12": "NEW UPDATE event", "2026-09-13": "event to 16:55", "2026-09-17": "event from 19:00", "2026-09-18": "NEW UPDATE event", "2026-09-19": "NEW UPDATE event" };
const ccuRows = [];
for (let d = "2026-09-05"; d <= "2026-09-18"; d = addDays(d, 1)) {
  const m = dayMean(d), p = dayMean(addDays(d, -7));
  ccuRows.push([`${dn(d)} ${md(d)}`, I(m), I(p), S(rel(p, m)), [pubDays[d], evDays[d]].filter(Boolean).join("; ") || "—"]);
}
{ const m5 = ds => mean(ds.map(dayMean)); const mP = m5(POST), mR = m5(PRE), mQ = m5(PRIOR);
  ccuRows.push(["**5-day mean, this week (Sat 09-12 → Wed 09-16)**", I(mP), I(mR), S(rel(mR, mP)), "vs Sat 09-05 → Wed 09-09"]);
  ccuRows.push(["5-day mean, week before (Sat 09-05 → Wed 09-09)", I(mR), I(mQ), S(rel(mQ, mR)), "vs Sat 08-29 → Wed 09-02"]); }
const TODAY_H = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const t19 = hoursMean("2026-09-19", TODAY_H), t12 = hoursMean("2026-09-12", TODAY_H), t05 = hoursMean("2026-09-05", TODAY_H);
ccuRows.push([`Sat 09-19 (00:00–08:59 UTC only)`, I(t19), `${I(t12)} (09-12, same hours)`, S(rel(t12, t19)), `vs 09-05 same hours: ${S(rel(t05, t19))}; NEW UPDATE event`]);
T("ccu", "Mean concurrent players per day, against the same weekday a week earlier",
  ["Day", "Mean CCU (24 h)", "Same weekday −7 d", "Δ", "Publish / event that day"], ccuRows, [1, 2, 3],
  "`ConcurrentPlayers` hourly is an average, so a full-day mean is comparable across days. Today is compared on its elapsed complete hours only.",
  "Explore `ConcurrentPlayers` ONE_HOUR in `data/seal.json` (`explore.specs`); buckets that had not closed by the 09:12 UTC pull are dropped.");

T("ccu", "Today against the last two Saturdays, hour by hour (UTC)",
  ["Hour", "Sat 09-05", "Sat 09-12", "Sat 09-19", "Δ vs 09-12"],
  TODAY_H.map(h => [`${String(h).padStart(2, "0")}:00`, I(hourly["2026-09-05"][h]), I(hourly["2026-09-12"][h]), I(hourly["2026-09-19"][h]), S(rel(hourly["2026-09-12"][h], hourly["2026-09-19"][h]))]).concat([["**00–08 mean**", I(t05), I(t12), I(t19), S(rel(t12, t19))]]), [1, 2, 3, 4],
  "All three Saturdays fall inside a NEW UPDATE event window (09-04→09-07, 09-10→09-13, 09-17→). No ADMIN ABUSE event is annotated on this game.",
  "Explore `ConcurrentPlayers` ONE_HOUR; hours 09:00 and later on 09-19 were not complete at the pull and are excluded.");

// Publish-hour event study against the base rate of ordinary days
const allDays = Object.keys(hourly).filter(d => d >= "2026-08-29" && d <= "2026-09-18" && Object.keys(hourly[d]).length === 24).sort();
const pubs = [["v915", "2026-09-11", 11], ["v918", "2026-09-17", 15], ["v919", "2026-09-18", 15], ["v914", "2026-09-04", 20]];
const pubSet = new Set(pubs.map(p => p[1]));
const ratioAt = (d, h0) => { const b = hoursMean(d, [h0 - 4, h0 - 3, h0 - 2, h0 - 1]), a = hoursMean(d, [h0 + 1, h0 + 2, h0 + 3]); return b && a ? a / b : null; };
const esRows = pubs.map(([v, d, h0]) => {
  const r = ratioAt(d, h0); const base = allDays.filter(x => !pubSet.has(x)).map(x => ratioAt(x, h0)).filter(x => x != null);
  const mu = mean(base), s = sd(base);
  return [v, `${md(d)} ${String(h0).padStart(2, "0")}:xx`, `${String(h0 - 4).padStart(2, "0")}–${String(h0 - 1).padStart(2, "0")}h → ${String(h0 + 1).padStart(2, "0")}–${String(h0 + 3).padStart(2, "0")}h`,
    S(r - 1), S(mu - 1), N(s * 100, 1) + " pp", String(base.length), SN((r - mu) / s, 2)];
});
T("ccu", "CCU in the hours after each publish, against the same clock hours on ordinary days",
  ["Build", "Publish hour (UTC)", "Hours compared", "Change on publish day", "Mean change, other days", "sd, other days", "Days in base", "z"], esRows, [3, 4, 5, 6, 7],
  "The publish hour itself is excluded. Every day has a diurnal climb or fall at these hours; z says whether the publish day departed from that usual shape.",
  "Explore `ConcurrentPlayers` ONE_HOUR, complete days 08-29 → 09-18; base = every complete day that is not a publish day (09-04, 09-11, 09-17, 09-18).");

// =====================================================================================
// RETENTION
// =====================================================================================
const d1s = D.splits.d1BySource;
const newSeries = L.seriesOf(ID, "UniqueUsersWithPlaySessions", { breakdownDim: "AcquisitionSource", filterDim: "IsNewUser" });
const newMap = {}; for (const s of newSeries) { const lbl = (s.breakdownLabels && s.breakdownLabels.AcquisitionSource) || s.breakdown.AcquisitionSource;
  const f = (s.filters || []).find(x => x.dimension === "IsNewUser"); if (!f || !(f.values || []).includes("New")) continue;
  newMap[lbl] = {}; for (const p of s.points) if (!p.partial && p.status !== "FILLED_ZERO") newMap[lbl][p.date] = p.value; }
const d1Rows = ["HomeRecommendation", "Friends", "Search", "Others"].map(src => {
  const r = d1s[src].run; const a = PRE.map(d => r[d]), b = POST.map(d => r[d]);
  const ma = mean(a), mb = mean(b), dlt = mb - ma;
  const diffs = b.map((x, i) => x - a[i]), tP = mean(diffs) / (sd(diffs) / Math.sqrt(diffs.length)), down = diffs.filter(x => x < 0).length;
  const na = PRE.reduce((s, d) => s + (newMap[src] && newMap[src][d] || 0), 0), nb = POST.reduce((s, d) => s + (newMap[src] && newMap[src][d] || 0), 0);
  const seBin = Math.sqrt(ma * (1 - ma) / na + mb * (1 - mb) / nb);
  return [src, P(ma, 2), P(mb, 2), S(rel(ma, mb)), PP(dlt, 2), `${down} of 5`, N(sd(diffs) * 100, 2) + " pp", SN(tP, 1), I(na) + " / " + I(nb), SN(dlt / seBin, 1)];
});
{ const r = run("ForwardD1Retention"); const a = PRE.map(d => r[d]), b = POST.map(d => r[d]); const ma = mean(a), mb = mean(b);
  const diffs = b.map((x, i) => x - a[i]);
  d1Rows.unshift(["**All sources (headline)**", P(ma, 2), P(mb, 2), S(rel(ma, mb)), PP(mb - ma, 2), `${diffs.filter(x => x < 0).length} of 5`, N(sd(diffs) * 100, 2) + " pp", SN(mean(diffs) / (sd(diffs) / Math.sqrt(5)), 1), "—", "—"]); }
T("retention", "D1 by acquisition source: effect size and confidence",
  ["Source", "D1 before", "D1 after", "Relative Δ", "Δ", "Pairs lower after", "sd of the 5 pair differences", "Paired t (4 df)", "New users before / after (5 d)", "z vs binomial floor"], d1Rows, [1, 2, 3, 4, 6, 7, 8, 9],
  "Relative Δ is the effect size (use it for 'is this composition'); the paired t and the binomial z are confidence (use them for 'did it move at all'). A paired t beyond about ±2.8 is what 4 degrees of freedom need for 95%. The binomial floor only counts sampling noise inside a day, so it is always the stricter of the two. `Friends` arrive by invite and never see a thumbnail; `Search` looked the game up by name. The binomial floor assumes the D1 cohort is that source's new users.",
  "`splits.d1BySource` in `data/seal.json`; paired t = mean of the 5 same-weekday differences ÷ (their sd ÷ √5); new users = `UniqueUsersWithPlaySessions` by `AcquisitionSource`, filter `IsNewUser = New`, from `series.json`.");

// D1 same-weekday pairs by source
const d1pair = POST.map((d, i) => { const p = PRE[i]; const cell = r => r[p] != null && r[d] != null ? `${P(r[p], 1)} → ${P(r[d], 1)}` : "—";
  return [`${dn(d)} ${md(p)} → ${md(d)}`, cell(run("ForwardD1Retention")), cell(d1s.HomeRecommendation.run), cell(d1s.Friends.run), cell(d1s.Search.run), cell(d1s.Others.run)]; });
T("retention", "D1 day-on-day, same weekday, by source",
  ["Pair", "All", "HomeRecommendation", "Friends", "Search", "Others"], d1pair, [],
  "09-12 and 09-13 fall inside the NEW UPDATE event (09-10 18:00 → 09-13 16:55); 09-05 → 09-07 fell inside the previous one.",
  "`ForwardD1Retention` and `splits.d1BySource` in `data/seal.json`.");

// New vs returning mix and a reweighting check
const exSeg = (metric, bd) => (D.explore.specs.find(s => s.metric === metric && s.breakdown === bd && s.segments) || {}).segments || {};
const dN = exSeg("DailyActiveUsers", "IsNewUser"), sN = exSeg("AverageSessionLengthMinutes", "IsNewUser"), pN = exSeg("AveragePlayTimeMinutesPerDAU", "IsNewUser");
const shNewB = dN.New.before / (dN.New.before + dN.Returning.before), shNewA = dN.New.after / (dN.New.after + dN.Returning.after);
const cfSess = shNewB * sN.New.after + (1 - shNewB) * sN.Returning.after, actSess = shNewA * sN.New.after + (1 - shNewA) * sN.Returning.after;
const cfPlay = shNewB * pN.New.after + (1 - shNewB) * pN.Returning.after, actPlay = shNewA * pN.New.after + (1 - shNewA) * pN.Returning.after;
T("retention", "New vs returning: mix and per-segment engagement",
  ["", "Before", "After", "Δ"],
  [["New-player share of DAU", P(shNewB), P(shNewA), PP(shNewA - shNewB)],
   ["Session length, new (min)", N(sN.New.before), N(sN.New.after), S(sN.New.delta)],
   ["Session length, returning (min)", N(sN.Returning.before), N(sN.Returning.after), S(sN.Returning.delta)],
   ["Playtime per DAU, new (min)", N(pN.New.before), N(pN.New.after), S(pN.New.delta)],
   ["Playtime per DAU, returning (min)", N(pN.Returning.before), N(pN.Returning.after), S(pN.Returning.delta)],
   ["After-window session length at the before-window mix (DAU-weighted)", "—", N(cfSess), `vs ${N(actSess)} at the actual mix: ${S(rel(cfSess, actSess))}`],
   ["After-window playtime per DAU at the before-window mix (DAU-weighted)", "—", N(cfPlay), `vs ${N(actPlay)} at the actual mix: ${S(rel(cfPlay, actPlay))}`]], [1, 2, 3],
  "Holding the mix fixed changes the after-window figures by well under 1%, so the segment rates, not the mix, carry the move. DAU weights approximate session weights.",
  "Explore `DailyActiveUsers`, `AverageSessionLengthMinutes`, `AveragePlayTimeMinutesPerDAU` by `IsNewUser` in `data/seal.json`. D1 by `IsNewUser` failed inside Roblox's Explore engine and is unavailable.");

// Pre-publish linear trend vs POST actual (descriptive extrapolation)
const fitWin = []; for (let d = "2026-08-29"; d <= "2026-09-10"; d = addDays(d, 1)) fitWin.push(d);
const trendRow = (label, r, fmt) => {
  const xs = [], ys = []; fitWin.forEach((d, i) => { if (r[d] != null) { xs.push(i); ys.push(r[d]); } });
  const mx = mean(xs), my = mean(ys); let sxy = 0, sxx = 0; xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; });
  const b = sxy / sxx, a = my - b * mx; const res = ys.map((y, i) => y - (a + b * xs[i])); const rsd = Math.sqrt(res.reduce((s, x) => s + x * x, 0) / (res.length - 2));
  const pred = POST.map(d => a + b * (Math.round((Date.parse(d) - Date.parse(fitWin[0])) / 864e5))); const act = POST.map(d => r[d]);
  const pm = mean(pred), am = mean(act);
  return [label, fmt(b).replace(/^-/, "−") + "/day", String(xs.length), fmt(pm), fmt(am), S(rel(pm, am)), SN((am - pm) / (rsd / Math.sqrt(POST.length)), 1)];
};
const segRun = (seg, k) => seg[k] && seg[k].run || {};
T("retention", "Was the after-window already on the pre-publish line? (linear trend 08-29 → 09-10, extended to 09-12 → 09-16)",
  ["Series", "Pre-publish slope", "Days in fit", "Line's value, after-window mean", "Actual after-window mean", "Actual vs line", "z vs fit scatter"],
  [trendRow("D1 (`ForwardD1Retention`)", run("ForwardD1Retention"), v => P(v, 2)),
   trendRow("Session length, returning (min)", segRun(sN, "Returning"), v => N(v)),
   trendRow("Session length, new (min)", segRun(sN, "New"), v => N(v)),
   trendRow("Playtime per DAU, returning (min)", segRun(pN, "Returning"), v => N(v)),
   trendRow("Paying-user CVR", run("PayingUsersCVR"), v => P(v, 2)),
   trendRow("RFY D1 co-play days", run("RFYD1CoplayDays"), v => N(v, 3))], [1, 2, 3, 4, 5, 6],
  `New players were ${P(dN.New.run['2026-08-29'] / dau['2026-08-29'])} of DAU on 08-29 and ${P(dN.New.run['2026-09-10'] / dau['2026-09-10'])} on 09-10, so an all-player average carries a composition trend inside the fit window; the rows are per segment where a segment series exists. ` + "A straight line through 13 post-peak days, extended 2–6 days past a publish. It describes whether the after-window sits on the path the series was already on; it is not a forecast and the fit window contains no peak but does contain two event weekends.",
  "Daily runs in `data/seal.json` (headline) and Explore `IsNewUser` segments; ordinary least squares on day index; z = (actual − line) ÷ (residual sd ÷ √5).");

// =====================================================================================
// ENGAGEMENT
// =====================================================================================
// Session survival from TotalSessionsEndedInBucket (exact windows from raw request bodies)
const sessWin = [];
for (const { caps } of rawCaps) for (const c of caps) {
  const q = reqOf(c); if (!q || q.metric !== "TotalSessionsEndedInBucket") continue;
  const vals = c.body && c.body.operation && c.body.operation.queryResult && c.body.operation.queryResult.values; if (!vals) continue;
  const b = {}; for (const v of vals) { const k = (v.breakdownValue || []).find(x => x.dimension === "SessionTimeBucket"); if (k) b[+k.value] = v.dataPoints.reduce((a, p) => a + p.value, 0); }
  if (!(0 in b)) continue;
  sessWin.push({ cap: new Date(c.ts).toISOString(), from: q.startTime.slice(0, 10), to: addDays(q.endTime.slice(0, 10), -1), b });
}
const keepWin = [["2026-09-05", "2026-09-07"], ["2026-09-06", "2026-09-09"], ["2026-09-16", "2026-09-19"], ["2026-09-03", "2026-09-19"]];
const sessRows = keepWin.map(([f, t]) => { const w = sessWin.filter(x => x.from === f && x.to === t).sort((a, b) => a.cap < b.cap ? 1 : -1)[0]; if (!w) return null;
  const S0 = w.b[0]; const live = t < "2026-09-11" ? "v914" : f >= "2026-09-16" ? "v915 → v918 → v919" : "v914 → v919";
  return [`${md(f)} → ${md(t)}`, live, I(S0), P(1 - w.b[60] / S0), P(1 - w.b[180] / S0), P(1 - w.b[600] / S0), P(w.b[1800] / S0), w.cap.slice(5, 16).replace("T", " ")]; }).filter(Boolean);
T("engagement", "How long sessions last, by window (`TotalSessionsEndedInBucket`, read as a survival curve)",
  ["Window", "Builds live", "Sessions (bucket 0)", "Ended < 1 min", "Ended < 3 min", "Ended < 10 min", "Lasted ≥ 30 min", "Read at (UTC)"], sessRows, [2, 3, 4, 5, 6],
  "Bucket values fall smoothly from 0 s to 1,800 s with no catch-all jump, and the implied under-1-minute share (~9–13%) is in the range of `RFYDuration0To60`, so each bucket is read as sessions lasting at least that long. That reading is inferred, not documented. Windows are whatever the grab asked for, so weekdays are not matched.",
  "Raw request/response pairs for `TotalSessionsEndedInBucket` (NONE granularity, by `SessionTimeBucket`) in `data/raw/10638354731-*.json`; exact window from each request body.");

// Consistency of rate moves across the five weekday pairs
const rob = [["AverageSessionLengthMinutes", false], ["AveragePlayTimeMinutesPerDAU", false], ["ForwardD1Retention", false], ["RFYD1Playtime", false], ["RFYD1QualifiedPlaySessions", false],
  ["RFYDuration0To60", true], ["RFYDuration61To180", true], ["RFYD2To7PlayDays", false], ["RFYD1CoplayDays", false], ["RFYD2To7CoplayDays", false], ["EndToEndCVR", false], ["RFYPlayThroughRate", false],
  ["PayingUsersCVR", false], ["AverageRevenuePerPayingUser", false], ["AverageRevenuePerUser", false], ["RFYD1SpendDay", false]];
const robRows = rob.map(([k]) => { const m = M(k); if (!m) return null; const r = m.run;
  const pr = POST.map((d, i) => [r[PRE[i]], r[d]]).filter(([a, b]) => a != null && b != null); const diffs = pr.map(([a, b]) => b - a);
  const t = diffs.length > 2 ? mean(diffs) / (sd(diffs) / Math.sqrt(diffs.length)) : null;
  const w = r["2026-09-16"] != null && r["2026-09-09"] != null ? S(rel(r["2026-09-09"], r["2026-09-16"])) : "—";
  const th = r["2026-09-17"] != null && r["2026-09-10"] != null ? S(rel(r["2026-09-10"], r["2026-09-17"])) : "—";
  return ["`" + k + "`", S(m.cur.delta), `${diffs.filter(x => x < 0).length} of ${diffs.length}`, SN(t, 1), w, th]; }).filter(Boolean);
T("engagement", "How consistent is each rate move across the five weekday pairs?",
  ["Series", "Δ this week", "Pairs lower after", "Paired t", "Wed 09-16 vs 09-09", "Thu 09-17 vs 09-10"], robRows, [1, 3, 4, 5],
  "With five pairs, |t| of about 2.8 or more is what 95% confidence needs; a move that shows up on only two or three pairs is not established. The last two columns show whether the latest settled days were still below the week before.",
  "`metrics[].run` in `data/seal.json`; paired t = mean of same-weekday differences ÷ (their sd ÷ √n).");

// Co-play and Friends
const fr =D.splits.dauBySource.Friends.run, frNew = newMap.Friends || {};
const coRows = []; for (let d = "2026-09-05"; d <= "2026-09-17"; d = addDays(d, 1)) {
  coRows.push([`${dn(d)} ${md(d)}${d === "2026-09-11" ? " (v915)" : d === "2026-09-17" ? " (v918)" : ""}`, N(run("RFYD1CoplayDays")[d], 3), N(run("RFYD2To7CoplayDays")[d], 3),
    I(fr[d]), P(fr[d] / dau[d]), I(frNew[d]), I((D.splits.impressionsBySource.Friends.run || {})[d])]); }
T("engagement", "Co-play signals and Friends traffic by day (the invite-friend bonus shipped in v915 on 09-11)",
  ["Day", "RFY D1 co-play days", "RFY D2–7 co-play days", "Friends DAU", "Friends share of DAU", "Friends new users", "Friends impressions"], coRows, [1, 2, 3, 4, 5, 6],
  "Co-play days are Roblox's per-user count of days played together with a friend, for RFY-organic players only; `Friends` DAU is everyone who arrived through a friend.",
  "`RFYD1CoplayDays`, `RFYD2To7CoplayDays`, `splits.dauBySource.Friends`, `splits.impressionsBySource.Friends` in `data/seal.json`; Friends new users from `UniqueUsersWithPlaySessions` (`IsNewUser = New`) in `series.json`.");

// Session length by segment around the publish
const sessDaily = []; for (let d = "2026-09-03"; d <= "2026-09-17"; d = addDays(d, 1))
  sessDaily.push([`${dn(d)} ${md(d)}${d === "2026-09-11" ? " (v915)" : d === "2026-09-17" ? " (v918)" : ""}`, N(run("AverageSessionLengthMinutes")[d]), N(segRun(sN, "Returning")[d]), N(segRun(sN, "New")[d]), N(segRun(pN, "Returning")[d]), N(segRun(pN, "New")[d])]);
T("engagement", "Session length and playtime by new vs returning, daily",
  ["Day", "Session, all", "Session, returning", "Session, new", "Playtime/DAU, returning", "Playtime/DAU, new"], sessDaily, [1, 2, 3, 4, 5],
  "Minutes. Returning-player session length runs 17.7 on 09-03 and 09-04, 17.4 on 09-07 and 09-08, 17.0 on 09-09, 16.7 on 09-10, 16.0 on 09-11, then 15.6–16.4.",
  "`AverageSessionLengthMinutes` headline and Explore `IsNewUser` segments in `data/seal.json`.");

// =====================================================================================
// MONEY
// =====================================================================================
const pay = run("PayingUsers"), rev = run("DailyRevenue"), arppu = run("AverageRevenuePerPayingUser"), cvr = run("PayingUsersCVR");
const mdPairs = [["2026-09-09", "2026-09-15"], ["2026-09-10", "2026-09-15"], ["2026-09-10", "2026-09-16"], ["2026-09-08", "2026-09-12"], ["2026-09-08", "2026-09-13"]];
const mdRows = mdPairs.map(([a, b]) => [`${dn(a)} ${md(a)} (v914) ↔ ${dn(b)} ${md(b)} (v915)`, `${I(dau[a])} ↔ ${I(dau[b])} (${S(rel(dau[a], dau[b]))})`,
  `${I(pay[a])} ↔ ${I(pay[b])} (${S(rel(pay[a], pay[b]))})`, `${P(cvr[a], 2)} ↔ ${P(cvr[b], 2)}`, `R$${N(arppu[a], 1)} ↔ R$${N(arppu[b], 1)}`, `${I(rev[a])} ↔ ${I(rev[b])} (${S(rel(rev[a], rev[b]))})`]);
T("money", "Matched-DAU comparison: days of similar size either side of v915",
  ["Days", "DAU", "Paying users", "Paying-user CVR", "ARPPU", "Revenue R$"], mdRows, [],
  "Size is matched, weekday is not: the 09-12/13 rows are a weekend inside an event against a Tuesday.",
  "`DailyActiveUsers`, `PayingUsers`, `PayingUsersCVR`, `AverageRevenuePerPayingUser`, `DailyRevenue` runs in `data/seal.json`.");

const dRev = M("DailyRevenue").cur, dDau = M("DailyActiveUsers").cur, dCvr = M("PayingUsersCVR").cur, dArppu = M("AverageRevenuePerPayingUser").cur;
const lr = Math.log(dRev.after / dRev.before), ld = Math.log(dDau.after / dDau.before), lc2 = Math.log(dCvr.after / dCvr.before), la = Math.log(dArppu.after / dArppu.before);
T("money", "Revenue split into audience × payer conversion × spend per payer",
  ["Term", "Before", "After", "Δ", "Share of log revenue change"],
  [["DAU", I(dDau.before), I(dDau.after), S(dDau.delta), P(ld / lr, 0)],
   ["Paying-user CVR", P(dCvr.before, 2), P(dCvr.after, 2), S(dCvr.delta), P(lc2 / lr, 0)],
   ["ARPPU (R$)", N(dArppu.before, 1), N(dArppu.after, 1), S(dArppu.delta), P(la / lr, 0)],
   ["Product of the three", "—", "—", S(Math.exp(ld + lc2 + la) - 1), P((ld + lc2 + la) / lr, 0)],
   ["Revenue (R$)", I(dRev.before), I(dRev.after), S(dRev.delta), "100%"]], [1, 2, 3, 4],
  "Means of daily ratios do not multiply exactly, so the three shares sum to slightly more or less than 100%.",
  "`DailyActiveUsers`, `PayingUsersCVR`, `AverageRevenuePerPayingUser`, `DailyRevenue` (`cur`) in `data/seal.json`.");

const rs = D.splits.revenueBySource, rsK = ["GamePass", "DevProduct", "PrivateServer"];
const rsB = rsK.reduce((s, k) => s + rs[k].before, 0), rsA = rsK.reduce((s, k) => s + rs[k].after, 0);
T("money", "Revenue mix by source",
  ["Source", "Share before", "Share after", "Δ share", "Revenue Δ"],
  rsK.map(k => [k, P(rs[k].before / rsB), P(rs[k].after / rsA), PP(rs[k].after / rsA - rs[k].before / rsB), S(rs[k].delta)]), [1, 2, 3, 4],
  "The four sealer colours in v915 (two for Robux, 29R and 49R) cannot be isolated: there is no item-level revenue series.",
  "`splits.revenueBySource` in `data/seal.json`.");

// =====================================================================================
// FUNNELS — capture-age matched
// =====================================================================================
const hist = []; // {cap, fn, key, label, date, v}
for (const { caps } of rawCaps) for (const c of caps) {
  const q = reqOf(c); if (!q || q.metric !== "FunnelCohortCompletionRate" || q.granularity !== "METRIC_GRANULARITY_ONE_DAY") continue;
  const fnF = (q.filter || []).find(x => x.dimension === "FunnelName"); if (!fnF || fnF.values.length !== 1) continue;
  const vals = c.body && c.body.operation && c.body.operation.queryResult && c.body.operation.queryResult.values; if (!vals) continue;
  const cap = new Date(c.ts).toISOString();
  for (const v of vals) { const b = (v.breakdownValue || []).find(x => x.dimension === "FunnelStep"); if (!b) continue;
    for (const p of v.dataPoints) hist.push({ cap, fn: fnF.values[0], key: b.value, label: b.displayValue, date: p.time.slice(0, 10), v: p.value }); }
}
const BAD_CAP = c => c >= "2026-09-14T16:00" && c < "2026-09-14T17:30"; // non-monotone capture, see table below
const ageOf = h => (Date.parse(h.cap) - Date.parse(h.date + "T00:00:00Z") - 864e5) / 864e5;
function reads(fn, key, date, { excludeBad = true } = {}) {
  const r = hist.filter(h => h.fn === fn && h.key === key && h.date === date && ageOf(h) > 0 && !(excludeBad && BAD_CAP(h.cap)))
    .map(h => ({ age: ageOf(h), v: h.v, cap: h.cap })).sort((a, b) => a.age - b.age);
  const out = []; for (const x of r) { const l = out.at(-1); if (l && x.age - l.age < 0.05) { out[out.length - 1] = x; continue; } out.push(x); }
  return out;
}
function interp(rs, age) {
  if (!rs.length) return null;
  if (age <= rs[0].age) return { v: rs[0].v, ext: rs[0].age - age };
  if (age >= rs.at(-1).age) return { v: rs.at(-1).v, ext: age - rs.at(-1).age };
  for (let i = 1; i < rs.length; i++) if (rs[i].age >= age) { const a = rs[i - 1], b = rs[i]; return { v: a.v + (b.v - a.v) * (age - a.age) / (b.age - a.age), ext: 0 }; }
}
const FUN = [["FUNNEL_TYPE_ONBOARDING", ["1", "2", "3", "4", "5", "6"]], ["Progression", ["1", "2", "3", "4", "5", "6"]], ["MapReach 2", ["1", "2", "3", "4", "5"]]];
const labelOf = (fn, key) => { const ls = [...new Set(hist.filter(h => h.fn === fn && h.key === key).sort((a, b) => a.cap < b.cap ? -1 : 1).map(h => h.label))]; return ls.join(" / "); };
const fRows = []; const matched = {}; let maxExt = 0;
for (const [fn, keys] of FUN) {
  const per = {}; // key -> {pre:[], post:[]}
  for (const key of keys) {
    per[key] = { pre: [], post: [] };
    POST.forEach((d, i) => { const pr = reads(fn, key, d); if (!pr.length) return; const last = pr.at(-1);
      const pre = interp(reads(fn, key, PRE[i]), last.age); if (!pre) return; maxExt = Math.max(maxExt, pre.ext);
      per[key].post.push(last.v); per[key].pre.push(pre.v); });
  }
  matched[fn] = per;
  keys.forEach((key, j) => {
    const a = mean(per[key].pre), b = mean(per[key].post);
    let cA = null, cB = null;
    if (j > 0) { const pk = keys[j - 1]; cA = mean(per[key].pre.map((v, i) => v / per[pk].pre[i])); cB = mean(per[key].post.map((v, i) => v / per[pk].post[i])); }
    const fs0 = (D.funnels.find(f => f.name === fn) || { steps: [] }).steps.find(s => String(s.key) === key) || {};
    fRows.push([fn, labelOf(fn, key), P(a, 2), P(b, 2), PP(b - a, 2), S(rel(a, b)), j ? `${P(cA, 1)} → ${P(cB, 1)}` : "—",
      fs0.before != null ? `${P(fs0.before, 1)} → ${P(fs0.after, 1)}` : "—", `${per[key].post.filter((v, i) => v < per[key].pre[i] - 1e-9).length} of ${per[key].post.length}`]);
  });
}
T("funnels", "Funnel steps at matched cohort age (each after-window cohort against its same-weekday cohort read at the same age)",
  ["Funnel", "Step", "Before, matched age", "After", "Δ", "Relative Δ", "Step-to-step, before → after", "Standard table (first read)", "Pairs lower after"], fRows, [2, 3, 4, 5],
  `After-window cohorts are read as served on 09-19 (ages 2.4–6.4 days). Each before-window cohort is interpolated to the same age between its own reads on 09-08 → 09-11 and 09-19; the largest extrapolation needed was ${N(maxExt, 2)} days. The 09-14 16:48 capture is excluded (next table). Cohort rates only ever rise with age, so the first-read comparison in the standard funnel table is biased by unequal ages.`,
  "Every raw `FunnelCohortCompletionRate` ONE_DAY response with one `FunnelName` filter in `data/raw/10638354731-*.json`; age = capture time − end of cohort day; linear interpolation in age.");

// The 09-14 capture is non-monotone
let cmp = 0, over = 0, maxOver = 0, maxEx = null;
for (const h of hist.filter(x => BAD_CAP(x.cap) && x.date <= "2026-09-12")) {
  const later = hist.filter(x => x.fn === h.fn && x.key === h.key && x.date === h.date && x.cap >= "2026-09-19").sort((a, b) => a.cap < b.cap ? 1 : -1)[0];
  if (!later || h.v < 0.001) continue; cmp++; const ex = h.v - later.v; if (ex > 0.005) { over++; if (ex > maxOver) { maxOver = ex; maxEx = { h, later }; } }
}
const exRows = [["Progression", "3", "2026-09-05"], ["Progression", "4", "2026-09-08"], ["FUNNEL_TYPE_ONBOARDING", "6", "2026-09-07"], ["Progression", "3", "2026-09-11"], ["Progression", "4", "2026-09-12"], ["MapReach 2", "4", "2026-09-08"]].map(([fn, key, date]) => {
  const all = reads(fn, key, date, { excludeBad: false }); const pick = pred => all.filter(pred).at(-1);
  const bef = pick(x => x.cap < "2026-09-14"), bad = pick(x => BAD_CAP(x.cap)), aft = pick(x => x.cap >= "2026-09-19");
  const f = x => x ? `${P(x.v, 2)} at ${N(x.age, 1)} d` : "—";
  return [`${fn} · ${labelOf(fn, key)}`, date.slice(5), f(bef), f(bad), f(aft)];
});
exRows.push([`**All cohort-day × step points read on 09-14 and again on 09-19 (cohorts ≤ 09-12)**`, "—", "—", `${over} of ${cmp} read more than 0.5 pp ABOVE the later read`, `largest excess ${PP(maxOver, 1)}`]);
T("funnels", "The 09-14 16:48 funnel capture is internally impossible, so it is excluded",
  ["Series", "Cohort day", "Last read before 09-14", "Read 09-14 16:48", "Read 09-19"], exRows, [],
  "A cohort completion rate can only rise as the cohort ages. In the 09-14 capture many cohorts read far above their later values (09-11 `TenJobs` 96.8% vs 19.0% five days later). The standard funnel table's 09-11 and 09-12 values were first read in that capture.",
  "Raw `FunnelCohortCompletionRate` responses in `data/raw/10638354731-2026-09-14T16-48-47-836Z.json` against earlier and later bundles.");

// Airport -> step 5 counts by window (FunnelUserTotalCount)
const wins = [];
for (const { caps } of rawCaps) for (const c of caps) {
  const q = reqOf(c); if (!q || q.metric !== "FunnelUserTotalCount") continue;
  const fnF = (q.filter || []).find(x => x.dimension === "FunnelName"); if (!fnF || fnF.values.length !== 1 || fnF.values[0] !== "MapReach 2") continue;
  if (!(q.breakdown || []).length) continue;
  const vals = c.body && c.body.operation && c.body.operation.queryResult && c.body.operation.queryResult.values; if (!vals) continue;
  const st = {}; let lab5 = null; for (const v of vals) { const b = (v.breakdownValue || []).find(x => x.dimension === "FunnelStep"); if (!b) continue; st[b.value] = v.dataPoints.reduce((a, p) => a + p.value, 0); if (b.value === "5") lab5 = b.displayValue; }
  wins.push({ cap: new Date(c.ts).toISOString(), from: q.startTime.slice(0, 10), to: addDays(q.endTime.slice(0, 10), -1), st, lab5 });
}
const wkey = w => w.from + w.to; const wbest = {}; for (const w of wins) { if (!wbest[wkey(w)] || wbest[wkey(w)].cap < w.cap) wbest[wkey(w)] = w; }
const wl = Object.values(wbest).sort((a, b) => a.cap < b.cap ? -1 : 1);
const apRows = wl.map(w => [`${md(w.from)} → ${md(w.to)}`, w.cap.slice(5, 16).replace("T", " ") + (BAD_CAP(w.cap) ? " (suspect capture)" : ""), I(w.st["4"]), `${I(w.st["5"])} (${w.lab5})`, P(w.st["5"] / w.st["4"])]);
const wA = wl.find(w => w.from === "2026-09-03" && w.to === "2026-09-19"), wB = wl.find(w => w.from === "2026-09-16" && w.to === "2026-09-19");
if (wA && wB) {
  const a4 = wA.st["4"] - wB.st["4"], a5 = wA.st["5"] - wB.st["5"], p1 = a5 / a4, p2 = wB.st["5"] / wB.st["4"];
  const z = (p2 - p1) / Math.sqrt(p1 * (1 - p1) / a4 + p2 * (1 - p2) / wB.st["4"]);
  apRows.push(["**09-03 → 09-15 cohorts (difference of the two 09-19 reads)**", "09-19 09:04 − 09:10", I(a4), I(a5), P(p1)]);
  apRows.push([`**09-16 → 09-19 cohorts vs 09-03 → 09-15**`, "—", I(wB.st["4"]), I(wB.st["5"]), `${P(p2)} vs ${P(p1)}, z ${SN(z, 1)}`]);
}
T("funnels", "Players reaching the Airport, and how many of them reach step 5 (`MapReach 2`)",
  ["Cohort window", "Read at (UTC)", "Reached Airport", "Reached step 5", "Step 5 ÷ Airport"], apRows, [2, 3, 4],
  "Step 5 is labelled ParkingGarage in every pull before 09-19 09:10 and NewZone in that pull; the key is the same. Windows are cohorts by funnel start date, read at whatever age the grab happened, so short recent windows are immature. A few hundred players reach the Airport per week.",
  "Raw `FunnelUserTotalCount` responses (NONE granularity, `FunnelName = MapReach 2`, by `FunnelStep`) in `data/raw/10638354731-*.json`.");

// =====================================================================================
// TECHNICAL
// =====================================================================================
const techList = [["ClientFpsP10", "num2"], ["ClientFpsAvg", "num2"], ["ClientMemoryUsagePercentageAvg", "pct"], ["ClientMemoryUsageAvg", "mb"], ["ClientCpuTimeAvg", "num2"],
  ["ClientCrashRate15m", "pct"], ["OomUnexpectedExits/DAU", "num2"], ["ClientCrashCount/DAU", "num2"], ["CpuTimeAvg", "num2"], ["MemoryUsageAvg", "num1"], ["ServerFrameRateP10", "num2"], ["SessionDurationSecondsAvg", "int"]];
const excl = { ClientCpuTimeAvg: ["2026-09-13"] };
const tf = (u, v) => v == null ? "—" : u === "pct" ? P(v, 2) : u === "mb" ? I(v / 1048576) + " MB" : u === "int" ? I(v) : u === "num1" ? N(v, 1) : N(v, 2);
const techRows = techList.map(([k, u]) => { const m = M(k); if (!m) return null; const r = m.run;
  const keep = POST.map((d, i) => [PRE[i], d]).filter(([a, b]) => a !== "2026-09-08" && !(excl[k] || []).includes(b) && r[a] != null && r[b] != null);
  const a = mean(keep.map(p => r[p[0]])), b = mean(keep.map(p => r[p[1]]));
  const dropped = POST.map((d, i) => [PRE[i], d]).filter(p => !keep.includes(p)).filter(([x, y]) => !keep.some(q => q[0] === x)).map(([x, y]) => `${md(x)}↔${md(y)}`);
  return [`\`${k}\``, S(m.cur.delta), tf(u, a), tf(u, b), S(rel(a, b)), `${keep.length}/5`, dropped.join(", ") || "—"]; }).filter(Boolean);
T("technical", "Technical rates with instrument-fault days removed",
  ["Metric", "Standard Δ (all pairs)", "Before", "After", "Δ, faults removed", "Pairs kept", "Pairs dropped"], techRows, [1, 2, 3, 4],
  "09-08 is the Roblox telemetry fault that collapsed FPS and memory on all five games at once (F28); every metric drops the Tue 09-08 ↔ 09-15 pair. `ClientCpuTimeAvg` also drops 09-13 (52.3 ms against 3.7–4.1 either side, Seal only). `ClientCpuTimeAvg` also dipped on all five games on 09-15, which the dropped Tuesday pair already removes.",
  "`metrics[].run` in `data/seal.json`; same weekday pairing as the standard table.");

// 09-09 level shift across five games
const pm3 = (r, ds) => mean(ds.map(d => r[d]));
const A = ["2026-09-05", "2026-09-06", "2026-09-07"], B = ["2026-09-09", "2026-09-10"], C = ["2026-09-12", "2026-09-13", "2026-09-14", "2026-09-15", "2026-09-16", "2026-09-17", "2026-09-18"];
const shiftRows = GAMES.map(s => { const g = G[s]; const f = k => (g.metrics.find(m => m.metric === k) || {}).run || {};
  const fa = f("ClientFpsAvg"), mp = f("ClientMemoryUsagePercentageAvg"), mb = f("ClientMemoryUsageAvg");
  return [g.name.split(" [")[0], `${N(pm3(fa, A), 1)} → ${N(pm3(fa, B), 1)} → ${N(pm3(fa, C), 1)}`, S(rel(pm3(fa, A), pm3(fa, B))),
    `${P(pm3(mp, A))} → ${P(pm3(mp, B))} → ${P(pm3(mp, C))}`, S(rel(pm3(mp, A), pm3(mp, B))), S(rel(pm3(mb, A), pm3(mb, B)))]; });
T("technical", "The 09-09 client performance shift: Seal against the other four games",
  ["Game", "`ClientFpsAvg` 05–07 → 09–10 → 12–18 Sep", "Δ 09–10 vs 05–07", "`ClientMemoryUsagePercentageAvg` same periods", "Δ", "`ClientMemoryUsageAvg` (bytes) Δ"], shiftRows, [2, 4, 5],
  "09-08 (the portfolio-wide telemetry fault) and 09-11 (v915 publish day on Seal) are left out of every period. No Seal build was published between 09-04 and 09-11; engine 738 released 09-08/09 to all five.",
  "`metrics[].run` in each game's `reports/2026-09-19/data/<slug>.json`.");

// Within-platform, three periods
const plRows = [];
for (const [key, label, fm] of [["fpsP10ByPlatform", "FPS p10", v => N(v, 1)], ["memPctByPlatform", "Memory %", v => P(v)], ["crashRateByPlatform", "Crash rate", v => P(v, 2)]])
  for (const pl of ["Computer", "Phone", "Tablet"]) { const r = D.splits[key][pl].run; const a = pm3(r, A), b = pm3(r, B), c = pm3(r, C);
    plRows.push([pl, label, fm(a), fm(b), fm(c), S(rel(a, b)), S(rel(b, c))]); }
T("technical", "Seal within each platform: before the 09-09 shift, after it (still v914), and the v915 → v919 days",
  ["Platform", "Metric", "05–07 Sep (v914)", "09–10 Sep (v914)", "12–18 Sep (v915+)", "Δ 09–10 vs 05–07", "Δ 12–18 vs 09–10"], plRows, [2, 3, 4, 5, 6],
  "Each platform is compared only with itself. Per-player performance averages exclude players who left, so a rise can mean the players it hurt are gone.",
  "`splits.fpsP10ByPlatform`, `memPctByPlatform`, `crashRateByPlatform` runs in `data/seal.json`.");

// =====================================================================================
// ERRORS
// =====================================================================================
const clientS = L.byBreakdown(ID, "ErrorCount", "LogSource");
const cl = clientS.get("Client"), sv = clientS.get("Server");
const erRows = []; for (let d = "2026-09-01"; d <= "2026-09-18"; d = addDays(d, 1)) {
  const c = cl.get(d), s = sv.get(d), u = dau[d];
  erRows.push([`${dn(d)} ${md(d)}${pubDays[d] ? " (" + pubDays[d].split(" ")[0] + ")" : ""}`, I(c), I(s), I(u), u && c != null ? N(c / u, 1) : "—", u && s != null ? N(s / u, 2) : "—"]); }
T("errors", "Client and server errors per DAU, daily",
  ["Day", "Client errors", "Server errors", "DAU", "Client per DAU", "Server per DAU"], erRows, [1, 2, 3, 4, 5],
  "09-08 is missing (only a partial read exists). 09-18 has no DAU yet. `ErrorCount`'s unit is undocumented; per-DAU figures assume occurrences.",
  "`ErrorCount` ONE_DAY by `LogSource` (Place-filtered) from `series.json`; `DailyActiveUsers` from `data/seal.json`.");

// 09-05 server burst + feedback cluster
const hhS = L.seriesOf(ID, "ErrorCount", { gran: "METRIC_GRANULARITY_HALF_HOUR", breakdownDim: "LogSource" }).find(s => s.breakdown.LogSource === "Server");
const burst = hhS.points.filter(p => p.ts >= "2026-09-05T14:00" && p.ts < "2026-09-05T17:00" && p.status !== "FILLED_ZERO");
const lostRe = /lost (all )?(my )?progress|restart everything|would not load my save|start over|quitaron todo|LOST ALL/i;
const clusAll = FB.rows.filter(r => r.t >= "2026-09-05T16:00" && r.t < "2026-09-05T17:30");
const clus = clusAll.filter((r, i) => !clusAll.slice(0, i).some(x => x.comment === r.comment && x.t.slice(0, 16) === r.t.slice(0, 16)));
const clusLost = clus.filter(r => lostRe.test(r.comment || ""));
T("errors", "Inside the before-window: the 09-05 16:00–17:00 server-error burst and the comments that followed",
  ["Half-hour (UTC)", "Server errors"], burst.map(p => [p.ts.slice(11, 16), I(p.value)]).concat([
    ["**Comments 16:00–17:30**", `${clus.length} comments (${clusAll.length - clus.length} identical duplicate row removed), ${clusLost.length} of them about lost progress (${clusLost.map(r => r.t.slice(11, 16)).join(", ")})`]]), [1],
  "The 17:00 bucket and later were not served (only a partial read). This sits inside the before-window (Sat 09-05) and inside the previous NEW UPDATE event; that day's D1 read 11.13%.",
  "`ErrorCount` HALF_HOUR by `LogSource` (Server, Place-filtered) from `series.json`; comment rows from `reports/2026-09-19/data/feedback-10638354731.json`, regex /lost progress|restart everything|would not load my save|start over|quitaron todo/.");

// Error exports
const EXD = path.join(ROOT, "data/exports/10638354731-seal-a-driveway/errors");
function parseCSV(t) { const rows = []; let row = [], cur = "", q = false;
  for (let i = 0; i < t.length; i++) { const ch = t[i];
    if (q) { if (ch === '"') { if (t[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
    else if (ch === '"') q = true; else if (ch === ",") { row.push(cur); cur = ""; } else if (ch === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; } else if (ch !== "\r") cur += ch; }
  if (cur || row.length) { row.push(cur); rows.push(row); } return rows.filter(r => /^\d+$/.test(r[0] || "")); }
const readExp = f => parseCSV(fs.readFileSync(path.join(EXD, f), "utf8")).map(r => ({ n: +r[0], sev: r[1], src: r[2], first: r[3], ver: r[4], msg: (r[5] || "").replace(/\s+/g, " "), trace: (r[6] || "").replace(/\s+/g, " ") }));
const firstUTC = s => { const m = /(\w{3}) (\w{3}) (\d{2}) (\d{4}) (\d{2}):(\d{2})/.exec(s); if (!m) return "—";
  const mon = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }[m[2]];
  const t = Date.UTC(+m[4], mon, +m[3], +m[5], +m[6]) - 2 * 36e5; return new Date(t).toISOString().slice(5, 16).replace("T", " "); }; // exports are stamped GMT+0200
const CLASSES = [
  [/EditableImage is not accessible/, "Sealing-surface render: EditableImage API not enabled (race-surface stack)", "`AverageSessionLengthMinutes`", () => `${S(M("AverageSessionLengthMinutes").cur.delta)}; the drop is visible from 09-11, this signature from 09-14`],
  [/WritePixelsBuffer/, "Sealing-surface paint outside image bounds", "`AverageSessionLengthMinutes`", () => S(M("AverageSessionLengthMinutes").cur.delta)],
  [/mutex lock failed/, "Engine signalling failure (no game script in the trace)", "`ClientCrashRate15m`", () => S(M("ClientCrashRate15m").cur.delta)],
  [/Unsupported Luau version/, "Engine: Luau version mismatch on a server send", "`ClientCrashRate15m`", () => S(M("ClientCrashRate15m").cur.delta)],
  [/Script timeout|may timeout/, "Client script timeout (main client loop, colour FX, UI shell)", "`ClientFpsP10`, 12–18 Sep vs 09–10 Sep", () => S(rel(pm3(run("ClientFpsP10"), B), pm3(run("ClientFpsP10"), C)))],
  [/UpgradeService\] save failed/, "Upgrade save failed after 3 tries (DataStore 502)", "lost-progress comments on v915", () => null],
  [/RobotHelper/, "`RobotHelper` DataStore save failed (new at v918)", "— (v918 not yet readable)", () => "—"],
  [/Unreliable Event dropped/, "Unreliable remote payload over the size limit (message embeds the overage, so it shreds)", "—", () => "—"],
  [/\[MapReach\]/, "MapReach funnel mark read/save failed (DataStore)", "`MapReach 2` funnel counts", () => "instrument caveat"],
  [/finished .* coverage/, "Coverage shortfall: finished surface not paid or recorded (message embeds surface and value, so it shreds)", "`Progression · FirstRebirth`, matched age", () => { const r = fRows.find(r => r[0] === "Progression" && /FirstRebirth/.test(r[1])) || []; return `${r[5]} overall; step-to-step from TenJobs ${r[6]}`; }],
  [/CoreGui of class DataModel/, "A script named `spawner` reading CoreGui (not a game script path)", "—", () => "—"],
  [/Cannot require a RobloxScript/, "Client require from a non-RobloxScript context", "—", () => "—"],
  [/Teleport failed/, "Teleport to an unrated place refused", "—", () => "—"],
  [/.*/, "Other (asset/mesh/decal load, avatar)", "—", () => "—"],
];
const v915exp = readExp("errors_2026-09-19_0918_since-v915_7d_30rows.csv"), v918exp = readExp("errors_2026-09-19_0919_since-v918_7d_44rows.csv"), v919exp = readExp("errors_2026-09-19_0919_since-v919_1d_17rows.csv");
const all3 = [...v915exp.map(r => ({ ...r, file: "since-v915 7d" })), ...v918exp.filter(r => !v915exp.some(x => x.msg === r.msg && x.n === r.n && x.ver === r.ver)).map(r => ({ ...r, file: "since-v918 7d" })),
  ...v919exp.filter(r => !v915exp.some(x => x.msg === r.msg && x.n === r.n) && !v918exp.some(x => x.msg === r.msg && x.n === r.n)).map(r => ({ ...r, file: "since-v919 1d" }))];
const lostV915 = FB.rows.filter(r => r.v === 915 && /(doesn['’]?t|does not|not)\s+save|lost (all )?(my )?progress|start(ed)? over|restart everything|would not load my save|money has gone|don['’]?t have it/i.test(r.comment || "")).length;
const nV915 = FB.rows.filter(r => r.v === 915).length;
const clsRows = CLASSES.map(([re, name, rate, val]) => {
  const rs = all3.filter(r => CLASSES.find(c => c[0].test(r.msg + " " + r.trace)) && CLASSES.find(c => c[0].test(r.msg + " " + r.trace))[0] === re);
  if (!rs.length) return null;
  const vers = [...new Set(rs.map(r => r.ver))].sort().join(", "), srcs2 = [...new Set(rs.map(r => r.src))].join(", ");
  const first = rs.map(r => firstUTC(r.first)).sort()[0];
  let v = val(); if (/UpgradeService/.test(re.source)) v = `${lostV915} of ${nV915} v915 comments mention lost saves or purchases`;
  return [name, I(rs.reduce((s, r) => s + r.n, 0)), String(rs.length), srcs2, vers, first, rate, v == null ? "—" : v];
}).filter(Boolean).sort((a, b) => +b[1].replace(/,/g, "") - +a[1].replace(/,/g, ""));
T("errors", "Error signatures first seen at v915 or later, grouped by surface, each paired with the rate that would move if it mattered",
  ["Surface / class", "Events (7 d)", "Rows", "Log source", "First-seen build(s)", "Earliest first seen (UTC)", "Rate to check", "That rate this week"], clsRows, [1, 2],
  "Exports are capped (~25–45 rows), so absence is never evidence and counts on messages that embed a value are floors. `since-vN` lists errors FIRST SEEN at build N or later, not every error N throws. The class labels describe where the message points; they are not a finding that the code is wrong.",
  "`errors_2026-09-19_0918_since-v915_7d_30rows.csv`, `…0919_since-v918_7d_44rows.csv`, `…0919_since-v919_1d_17rows.csv` in `data/exports/10638354731-seal-a-driveway/errors/` (duplicates across files counted once); times converted from the export's GMT+0200 stamps.");

const unf = readExp("errors_2026-09-19_0918_v345-v915_7d_104rows.csv"); const unfTot = unf.reduce((s, r) => s + r.n, 0);
const newBand = unf.filter(r => +r.ver.replace(/\D/g, "") >= 915).reduce((s, r) => s + r.n, 0);
T("errors", "The whole error landscape, last 7 days, all builds (top signatures by count)",
  ["Events", "Share of listed total", "First-seen build", "Log source", "Severity", "Message (truncated)"],
  unf.slice(0, 12).map(r => [I(r.n), P(r.n / unfTot), r.ver, r.src, r.sev, r.msg.slice(0, 90) + (r.msg.length > 90 ? "…" : "")]).concat([
    ["**" + I(newBand) + "**", P(newBand / unfTot, 2), "v915 or later", "—", "—", `Listed signatures first seen at v915+ (of ${I(unfTot)} listed in ${unf.length} rows)`]]), [0, 1],
  "The list is capped at its top rows. One legacy warning first seen at v488 is most of the volume; the headline `ErrorCount` therefore tracks that warning, not the newest build.",
  "`errors_2026-09-19_0918_v345-v915_7d_104rows.csv` (unfiltered, last 7 days).");

// =====================================================================================
// SENTIMENT
// =====================================================================================
const grp = v => v <= 901 ? "≤ v901" : v === 908 ? "v908" : v === 914 ? "v914" : v === 915 ? "v915" : v >= 918 ? "v918–919" : "other";
const GRPS = ["≤ v901", "v908", "v914", "v915", "v918–919"];
const THEMES = [
  ["Performance, lag, crash, kick", /lag|fps|frame|freez|stutter|crash|glitch|unplayable|optimi[sz]|otimaz|cpu usage|performance|kick/i],
  ["Save, progress or purchase lost", /(doesn['’]?t|does not|dont|don['’]?t|not|won['’]?t|didn['’]?t)\s+save|lost (all )?(my )?progress|progress (doesn['’]?t|does not) save|start(ed)? (all )?over|restart everything|would not load my save|money has gone|quitaron|started my whole|don['’]?t have it/i],
  ["Can't finish a surface / airport", /airport|can['’]?t be sealed|coverage|atascado|no calcula|dosent spread|doesn['’]?t spread|where to spread|dots everywhere/i],
  ["Rebirth, pace, running out of game", /rebirth|too (long|hard)|takes to long|forced|limit of progression|get further|further in the game|more upgrades|more easy|boring/i],
  ["Paywall, Robux, pop-ups for purchases", /robux|\bpay\b|pay to|greedy|money grab|predatory/i],
  ["AI art, listing does not match game", /\bai\b|generat|thumbnail|slop|photo|nothing like|unlike the video/i],
  ["Controls, camera, UI clutter", /control|steer|turn|\bgui\b|\bui\b|pop ?ups|screen|overstimulat|button|visible|console/i],
];
const byG = Object.fromEntries(GRPS.map(g => [g, FB.rows.filter(r => grp(r.v) === g)]));
const cellT = (g, re) => { const rs = byG[g]; const k = rs.filter(r => re.test(r.comment || "")).length; return rs.length ? `${k} (${P(k / rs.length, 0)})` : "—"; };
const thRows = [["**Comments**", ...GRPS.map(g => I(byG[g].length))], ["Downvote rate", ...GRPS.map(g => { const rs = byG[g]; const dn2 = rs.filter(r => r.cat === "Downvote").length; return rs.length ? P(dn2 / rs.length, 0) : "—"; })]]
  .concat(THEMES.map(([name, re]) => [name, ...GRPS.map(g => cellT(g, re))]))
  .concat([["Upvote with praise", ...GRPS.map(g => { const rs = byG[g]; const k = rs.filter(r => r.cat === "Upvote" && /good|great|love|amazing|\bfun\b|satisf|peaceful|better|awesome|enjoy/i.test(r.comment || "")).length; return rs.length ? `${k} (${P(k / rs.length, 0)})` : "—"; })]]);
T("sentiment", "Comment themes by build, counted with explicit patterns",
  ["Theme", ...GRPS.map(g => `${g}`)], thRows, [1, 2, 3, 4, 5],
  "A comment can hit several themes. Build = the `asset_version` the player was on when they wrote it. v915 has 14 comments and v918–919 has 2, so one comment moves a share by 7–50 points.",
  "`reports/2026-09-19/data/feedback-10638354731.json` (391 rows, merged raw bundles); patterns: " + THEMES.map(([n, re]) => `${n} = \`${re.source}\``).join("; ") + ".");

const perfRe = THEMES[0][1];
const devRows = GRPS.map(g => { const rs = byG[g]; const c = rs.filter(r => r.device === "Computer"), m = rs.filter(r => r.device === "Phone" || r.device === "Tablet");
  const kc = c.filter(r => perfRe.test(r.comment || "")).length, km = m.filter(r => perfRe.test(r.comment || "")).length;
  return [g, `${kc} of ${c.length}${c.length ? " (" + P(kc / c.length, 0) + ")" : ""}`, `${km} of ${m.length}${m.length ? " (" + P(km / m.length, 0) + ")" : ""}`]; });
T("sentiment", "Performance language by device class and build (Mobile = Phone + Tablet)",
  ["Build", "Computer: mentions / comments", "Mobile: mentions / comments"], devRows, [],
  "The 04 Sep read found Computer reviews concentrated on lag (7 of 14). Counts after v914 are single digits.",
  "Same feedback file; performance pattern `" + perfRe.source + "`.");

const votes = run("PlayerFeedbackVotesCount"); const vRows = [];
for (let d = "2026-09-04"; d <= "2026-09-18"; d = addDays(d, 1)) vRows.push([`${dn(d)} ${md(d)}${pubDays[d] ? " (" + pubDays[d].split(" ")[0] + ")" : ""}`, I(votes[d]), I(dau[d]), dau[d] ? N(votes[d] / dau[d] * 1000, 2) : "—", I((FB.byDay[d] || {}).n || 0)]);
T("sentiment", "Feedback votes around the v915 publish (the like-and-group reward shipped in v915)",
  ["Day", "`PlayerFeedbackVotesCount`", "DAU", "Votes per 1k DAU", "Written comments"], vRows, [1, 2, 3, 4],
  "This pipeline labels `PlayerFeedbackVotesCount` as net votes (up − down); no up/down breakdown is served, so a rise cannot be split into more upvotes or fewer downvotes.",
  "`PlayerFeedbackVotesCount` and `DailyActiveUsers` runs in `data/seal.json`; comments per day from `feedback.byDay` in the merged feedback file.");

// =====================================================================================
// APPENDIX
// =====================================================================================
const pk = Object.keys(PF.games[0].k);
T("appendix", "Is it us or everyone? This week's Δ on all five games",
  ["Metric", ...PF.games.map(g => g.name.split(" [")[0]), "Seal's rank (1 = most favourable)"],
  pk.map(k => { const lower = /Duration0To60|CrashRate|ErrorCount/.test(k); const ds = PF.games.map(g => g.k[k] && g.k[k].d);
    const seal = ds[PF.games.findIndex(g => g.slug === "seal")]; const valid = ds.filter(x => x != null);
    const rank = seal == null ? "—" : `${1 + valid.filter(x => lower ? x < seal : x > seal).length} of ${valid.length}`;
    return [`\`${k}\``, ...ds.map(x => S(x)), rank]; }), [1, 2, 3, 4, 5, 6],
  "Matched weekdays on every game. Two games grew and three shrank this week, so the week has no single portfolio direction.",
  "`reports/2026-09-19/data/portfolio.json` (`games[].k[metric].d`).");

T("appendix", "What is readable, and when, for the builds at the right edge",
  ["Signal", "Newest settled day served", "v918 (09-17 15:56)", "v919 (09-18 15:41)"],
  [["CCU (`ConcurrentPlayers` hourly)", "09-19 08:00 hour", "09-17 16:00 → 09-18 15:00 only (then v919)", "from 09-18 16:00; 09-19 mixed with v918 servers"],
   ["Crash rate, FPS, memory", M("ClientCrashRate15m").newest, "09-18 is a mixed day", "09-19 first mixed full day, served ~09-20"],
   ["`ErrorCount`, error exports", M("ErrorCount").newest, "since-v918 export filed 09-19", "since-v919 1-day export filed 09-19"],
   ["DAU, revenue, session, RFY signals", M("DailyActiveUsers").newest, "no clean full day (v919 shipped the next afternoon)", "09-19 served ~09-21; matched week 09-19 → 09-23 served ~09-25"],
   ["D1 (`ForwardD1Retention`)", M("ForwardD1Retention").newest, "no clean cohort", "09-19 cohort served ~09-21/22"],
   ["Funnel cohorts (multi-day steps)", "09-18 (immature)", "—", "09-19 → 09-23 cohorts need ≥ 3 days of age: ~09-26"]], [],
  "v918 was the only live build for under 24 hours, so on daily metrics it cannot be separated from v919.",
  "`newest` per metric in `data/seal.json`; publish times from `placeVersions`; deploy tail from the timeline table.");

// ---------- write
const out = path.join(ROOT, `reports/2026-09-19/data/extras-${SLUG}.json`);
fs.writeFileSync(out, JSON.stringify({ tables, builtAt: new Date().toISOString() }, null, 1));
console.log(`wrote ${out}: ${tables.length} tables`);
