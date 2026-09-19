// Render the 2026-09-19 game pages from
//   reports/2026-09-19/data/<slug>.json      (tools/r0919/build.js — every standard figure)
//   reports/2026-09-19/data/extras-<slug>.json (analyst-computed tables, each with its source)
//   reports/2026-09-19/content/<slug>.json   (analyst prose + hypotheses)
// into reports/2026-09-19/out/<slug>.html. Charts and tables are drawn from the data
// files; the renderer never types a number.
//   node tools/r0919/render.js [slug...]
const fs = require("fs");
const path = require("path");
const { esc, lineChart, dumbbell, deltaBars, spark } = require("./chart.js");
const BASE = path.join(__dirname, "../../reports/2026-09-19");
const OUT = path.join(BASE, "out"); fs.mkdirSync(OUT, { recursive: true });
const readJ = (p, d = null) => fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : d;
const URLS = readJ(path.join(BASE, "urls.json"), {});

// light markup: **bold**, *italic*, `code`; paragraphs split on blank lines
const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, "$1<em>$2</em>").replace(/`([^`]+)`/g, "<code>$1</code>");
const prose = s => !s ? "" : String(s).split(/\n\s*\n/).map(p => p.trim().startsWith("- ")
  ? `<ul>${p.split(/\n/).filter(l => l.trim()).map(l => `<li>${inline(l.replace(/^\s*-\s+/, ""))}</li>`).join("")}</ul>`
  : `<p>${inline(p)}</p>`).join("");

function fmtU(unit, v) {
  if (v == null || !Number.isFinite(v)) return "—";
  switch (unit) {
    case "pct": return (v * 100).toFixed(Math.abs(v) < 0.1 ? 2 : 1) + "%";
    case "min": return v.toFixed(2);
    case "robux": return "R$" + v.toFixed(3);
    case "robux0": return "R$" + Math.round(v).toLocaleString("en-US");
    case "num1": return v.toFixed(1);
    case "num2": return v.toFixed(2);
    case "num3": return v.toFixed(3);
    default: return Math.round(v).toLocaleString("en-US");
  }
}
const pctS = d => d == null ? "—" : (d > 0 ? "+" : d < 0 ? "−" : "") + Math.abs(d * 100).toFixed(1) + "%";
const dcls = (d, lower) => d == null || Math.abs(d) < 0.005 ? "flat" : ((lower ? d < 0 : d > 0) ? "up" : "down");
const dspan = (d, lower) => `<span class="d d-${dcls(d, lower)}">${d == null ? "—" : (d > 0 ? "▲ " : d < 0 ? "▼ " : "") + pctS(d)}</span>`;
const yfmtFor = unit => unit === "pct" ? (v => (v * 100).toFixed(1) + "%") : unit === "robux" ? (v => "R$" + v.toFixed(2))
  : unit === "robux0" ? (v => "R$" + (Math.abs(v) >= 1e3 ? (v / 1e3).toFixed(0) + "K" : v.toFixed(0)))
  : unit === "int" ? (v => Math.abs(v) >= 1e6 ? (v / 1e6).toFixed(1) + "M" : Math.abs(v) >= 1e3 ? (v / 1e3).toFixed(0) + "K" : v.toFixed(0)) : (v => v.toFixed(2));
const dayName = d => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(d + "T00:00:00Z").getUTCDay()];

function table(cols, rows, { cls = "", num = [] } = {}) {
  return `<div class="tbl"><table class="${cls}"><thead><tr>${cols.map((c, i) => `<th${num.includes(i) ? ' class="n"' : ""}>${inline(c)}</th>`).join("")}</tr></thead><tbody>` +
    rows.map(r => `<tr>${r.map((c, i) => `<td${num.includes(i) ? ' class="n"' : ""}>${typeof c === "object" && c && c.html ? c.html : inline(c ?? "—")}</td>`).join("")}</tr>`).join("") + `</tbody></table></div>`;
}

function page(D, C, X) {
  const M = k => D.metrics.find(m => m.metric === k);
  const W = D.window;
  const from = "2026-08-29", to = "2026-09-19";
  // publish markers: published root-place versions + deploy-log first-seen, from 09-04
  const pubs = D.placeVersions.filter(v => v.published && v.d >= "2026-09-04" && (D.slug !== "waterslide" || v.place === D.root))
    .map(v => ({ t: v.t.slice(0, 16), label: "v" + v.v }));
  const bands = [{ a: W.PRE[0], b: W.PRE.at(-1), label: "before" }, { a: W.POST[0], b: W.POST.at(-1), label: "after" }];
  const dailyChart = (keys, opts = {}) => {
    const ms = keys.map(k => M(k)).filter(m => m && !m.missing);
    if (!ms.length) return "";
    const colors = ["var(--s1)", "var(--s2)", "var(--s3)", "var(--s4)"];
    return lineChart({ series: ms.map((m, i) => ({ name: m.label, color: colors[i], pts: Object.entries(m.run).filter(([d]) => d >= from) })),
      markers: pubs, bands, xFrom: from, xTo: to, yFmt: yfmtFor(ms[0].unit), ariaLabel: ms.map(m => m.label).join(", "), title: ms.length === 1 ? ms[0].label + " — daily, settled days" : null, ...opts });
  };
  const metricRows = (group, extra = []) => D.metrics.filter(m => (m.group === group || extra.includes(m.metric)) && !m.missing).map(m => [
    `${m.label} <code>${m.metric}</code>`.replace(/`/g, "") && { html: `${esc(m.label)}<br><code class="mname">${esc(m.metric)}</code>` },
    fmtU(m.unit, m.cur.before), fmtU(m.unit, m.cur.after), { html: dspan(m.cur.delta, m.lower) },
    { html: dspan(m.prior.delta, m.lower) }, `${m.cur.pairs}/5`, (m.newest || "—").slice(5),
    { html: spark(Object.entries(m.run).filter(([d]) => d >= from).map(([, v]) => v), "var(--s1)") }]);
  const MT = (group, extra) => table(["Metric", "Before", "After", "Δ this week", "Δ week before", "Pairs", "Newest", "Aug 29 → Sep 19"],
    metricRows(group, extra), { num: [1, 2, 3, 4, 5, 6], cls: "mt" });
  const extras = sec => (X.tables || []).filter(t => t.section === sec).map(t =>
    `<figure class="xt"><figcaption><strong>${inline(t.title)}</strong>${t.note ? `<span class="note">${inline(t.note)}</span>` : ""}</figcaption>` +
    table(t.columns, t.rows, { num: t.numeric || [] }) + (t.source ? `<p class="src">Source: ${inline(t.source)}</p>` : "") + `</figure>`).join("");
  const sec = (id, title, body) => `<section id="${id}"><h2>${esc(title)}</h2>${prose((C.sections || {})[id])}${body}${extras(id)}</section>`;

  // ---------- header facts
  const pctPeakNow = (() => { const e = Object.entries(D.dauPctOfPeak).sort().at(-1); return e ? `${(e[1] * 100).toFixed(1)}% on ${e[0].slice(5)}` : "—"; })();
  const builds = D.placeVersions.filter(v => v.published && v.d >= "2026-09-10" && (D.slug !== "waterslide" || v.place === D.root))
    .map(v => `<span class="ver">v${v.v}</span> ${v.t.slice(5, 16).replace("T", " ")}`).join(" · ");
  const facts = [["Universe", D.id], ["Window", "Sat 09-12 → Wed 09-16 vs Sat 09-05 → Wed 09-09"], ["Builds (UTC)", builds || "—"],
    ["Peak DAU", `${Math.round(D.peak.dau).toLocaleString("en-US")} on ${D.peak.date}`], ["DAU vs peak", pctPeakNow]];

  // ---------- at-a-glance tiles
  const TILES = ["DailyActiveUsers", "PeakConcurrentPlayers", "UniqueUsersWithImpressions", "EndToEndCVR", "ForwardD1Retention",
    "AverageSessionLengthMinutes", "DailyRevenue", "AverageRevenuePerUser", "PayingUsersCVR", "RFYD2To7PlayDays"];
  const tiles = TILES.map(M).filter(m => m && !m.missing).map(m => `<div class="tile"><p class="lab">${esc(m.label)}</p>
    <p class="big">${fmtU(m.unit, m.cur.after)}</p><p class="tsub">${dspan(m.cur.delta, m.lower)} <span class="vs">vs ${fmtU(m.unit, m.cur.before)}</span></p>
    <p class="tsub prior">week before: ${pctS(m.prior.delta)}</p>${spark(Object.entries(m.run).filter(([d]) => d >= from).map(([, v]) => v))}</div>`).join("");

  // ---------- timeline
  const ann = D.annotations.filter(a => a.t >= "2026-09-04");
  const icons = {}; for (const a of ann) if (/PLACE_ICON|PLACE_THUMBNAIL/.test(a.type)) { const k = a.t.slice(0, 10) + (a.type.includes("ICON") ? " icon" : " thumbnail"); icons[k] = (icons[k] || 0) + 1; }
  const tl = [
    ...D.placeVersions.filter(v => v.d >= "2026-09-04").map(v => [v.t.slice(0, 16).replace("T", " "), `Publish <span class="ver">v${v.v}</span>${D.slug === "waterslide" ? ` place ${v.place}` : ""}${v.published ? "" : " — saved, not published"}`]),
    ...ann.filter(a => /EVENT_STATE|ENGINE_RELEASE/.test(a.type)).filter(a => !/ENGINE_RELEASE/.test(a.type) || /RCC/.test(a.what))
      .map(a => [a.t.slice(0, 16).replace("T", " "), esc(a.what.replace("EXPERIENCE_EVENT_STATE: ", "Event · ").replace("ENGINE_RELEASE: ", "Engine release · "))]),
    ...Object.entries(icons).map(([k, n]) => [k.slice(0, 10) + " (day)", `${n} × ${k.slice(11)} change${n > 1 ? "s" : ""}`]),
  ].sort((a, b) => a[0] < b[0] ? -1 : 1).map(([t, w]) => [t, { html: w }]);
  const dep = D.deploy.daily.filter(r => r.last >= "2026-09-04").map(r => [`v${r.v}`, r.first, r.last, String(r.n), r.errors.toLocaleString("en-US")]);

  // ---------- CCU hourly (Explore)
  const hr = D.explore && D.explore.specs.find(s => s.metric === "ConcurrentPlayers" && s.points);
  const hh = D.explore && D.explore.specs.find(s => s.metric === "PeakConcurrentPlayers" && s.points);
  const ccuSeries = hr || hh;
  const ccuChart = ccuSeries ? lineChart({ series: [{ name: ccuSeries.metric + (hr ? " (hourly)" : " (half-hour peak)"), color: "var(--s1)",
    pts: Object.entries(ccuSeries.points).filter(([t]) => t >= "2026-09-04") .map(([t, v]) => [t.slice(0, 16), v]) }],
    markers: pubs, bands: [], xFrom: "2026-09-04", xTo: "2026-09-19T23:00", hourly: true, yFmt: yfmtFor("int"), height: 250, yZero: true,
    ariaLabel: "hourly concurrent players", title: (hr ? "Concurrent players, hourly (Explore)" : "Peak concurrents, half-hour (Explore)") }) : `<p class="nodata">Hourly CCU was not pulled for this game.</p>`;

  // ---------- funnels
  const funnelHtml = (D.funnels || []).map(f => {
    const rows = f.steps.filter(s => s.before != null || s.after != null);
    if (!rows.length) return "";
    const dd = dumbbell({ rows: rows.map(s => ({ label: s.step, a: s.before, b: s.after, sub: s.dpp == null ? "" : (s.dpp > 0 ? "+" : "") + s.dpp.toFixed(1) + "pp" })), ariaLabel: `${f.name} funnel` });
    const tb = table(["Step", "Before", "After", "Δ pp", "Δ pp week before", "Pairs"], rows.map(s => [s.step, fmtU("pct", s.before), fmtU("pct", s.after),
      s.dpp == null ? "—" : (s.dpp > 0 ? "+" : "") + s.dpp.toFixed(1), s.priorDpp == null ? "—" : (s.priorDpp > 0 ? "+" : "") + s.priorDpp.toFixed(1), `${s.pairs}/5`]), { num: [1, 2, 3, 4, 5] });
    return `<h3>${esc(f.name)}</h3>${dd}<details><summary>Step table</summary>${tb}</details>`;
  }).join("");

  // ---------- splits (corpus + Explore)
  const splitTable = (key, unit, title) => { const s = D.splits[key]; if (!s) return "";
    const rows = Object.entries(s).filter(([, v]) => v.pairs).sort((a, b) => (b[1].after || 0) - (a[1].after || 0)).slice(0, 12)
      .map(([k, v]) => [k, fmtU(unit, v.before), fmtU(unit, v.after), { html: dspan(v.delta, false) }, `${v.pairs}/5`]);
    return rows.length ? `<h3>${esc(title)}</h3>` + table(["Segment", "Before", "After", "Δ", "Pairs"], rows, { num: [1, 2, 3, 4] }) : ""; };
  const exploreTable = (metric, bd, unit, title) => { const s = D.explore && D.explore.specs.find(x => x.metric === metric && x.breakdown === bd && x.segments);
    if (!s) return ""; const rows = Object.entries(s.segments).filter(([, v]) => v.pairs).sort((a, b) => (b[1].after || 0) - (a[1].after || 0)).slice(0, 12)
      .map(([k, v]) => [k, fmtU(unit, v.before), fmtU(unit, v.after), { html: dspan(v.delta, false) }, { html: dspan(v.prior && v.prior.delta, false) }]);
    return rows.length ? `<h3>${esc(title)}</h3>` + table(["Segment", "Before", "After", "Δ this week", "Δ week before"], rows, { num: [1, 2, 3, 4] }) : ""; };

  // ---------- sentiment
  const fbv = Object.entries(D.feedback.byVersion || {}).filter(([, v]) => v.last >= "2026-09-01").sort((a, b) => +a[0] - +b[0])
    .map(([v, r]) => [`v${v}`, `${r.first.slice(5)} → ${r.last.slice(5)}`, String(r.up), String(r.down), r.up + r.down ? ((r.down / (r.up + r.down)) * 100).toFixed(1) + "%" : "—"]);
  const quotes = (C.quotes || []).map(q => `<blockquote><p>${esc(q.text)}</p><footer>${esc([q.vote, q.device, q.version && "v" + String(q.version).replace(/^v/, ""), q.date].filter(Boolean).join(" · "))}</footer></blockquote>`).join("");

  // ---------- appendix: day-on-day
  const DODK = ["PeakConcurrentPlayers", "DailyActiveUsers", "UniqueUsersWithImpressions", "EndToEndCVR", "ForwardD1Retention", "AverageSessionLengthMinutes", "DailyRevenue", "AverageRevenuePerUser", "ClientCrashRate15m"];
  const dodRows = W.DOD.map(d => [`${dayName(d)} ${d.slice(5)}`, ...DODK.map(k => { const m = M(k); const r = m && !m.missing && m.dod.find(x => x.d === d);
    return r && r.v != null ? { html: `${fmtU(m.unit, r.v)}<br><span class="d d-${dcls(r.delta, m.lower)} small">${pctS(r.delta)}</span>` } : "—"; })]);
  const dodTable = table(["Day (vs same weekday −7d)", ...DODK.map(k => (M(k) || {}).label || k)], dodRows, { num: DODK.map((_, i) => i + 1), cls: "dod" });

  // ---------- hypotheses
  const STAT = { "supported": "sup", "plausible": "pla", "unresolved": "unr", "weakened": "wea", "ruled out": "rul" };
  const hyps = (C.hypotheses || []).map((h, i) => `<article class="hyp hyp-${STAT[h.status] || "unr"}">
    <header><span class="hstat">${esc(h.status || "unresolved")}${h.confidence ? ` · ${esc(h.confidence)} confidence` : ""}</span><h3>H${i + 1}. ${inline(h.title)}</h3></header>
    <p class="claim">${inline(h.claim || "")}</p>
    <div class="evid"><div><p class="lab">Consistent with it</p><ul>${(h.for || []).map(x => `<li>${inline(x)}</li>`).join("")}</ul></div>
    <div><p class="lab">Against it / not explained</p><ul>${(h.against || []).map(x => `<li>${inline(x)}</li>`).join("") || "<li>—</li>"}</ul></div></div>
    ${h.test ? `<p class="test"><span class="lab">What would settle it</span> ${inline(h.test)}</p>` : ""}
    ${h.lever ? `<p class="test"><span class="lab">If it holds</span> ${inline(h.lever)}</p>` : ""}</article>`).join("");

  const toc = [["glance", "At a glance"], ["timeline", "What shipped"], ["reach", "Reach & audience"], ["ccu", "Concurrents"], ["retention", "Retention"],
    ["engagement", "Session & RFY"], ["money", "Monetization"], ["funnels", "Funnels"], ["technical", "Technical"], ["errors", "Errors"], ["sentiment", "Sentiment"],
    ["appendix", "All metrics"], ["method", "Method"], ["diagnosis", "Diagnosis"]];

  return `<title>${esc(D.name.split(" [")[0])} 11–19 Sep</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap">
<style>${CSS}</style>
<div class="wrap">
<header class="mast"><p class="eyebrow">Post-update read · week of the 11 Sep build · data to ${esc(C.asOf || "2026-09-19")}</p>
<h1>${esc(D.name)}</h1><p class="dek">${inline(C.dek || "")}</p>
<dl class="facts">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${k === "Builds (UTC)" ? v : esc(v)}</dd></div>`).join("")}</dl>
${URLS.cover ? `<p class="back"><a href="${URLS.cover}">← Portfolio cover</a></p>` : ""}
<nav class="toc">${toc.map(([id, t]) => `<a href="#${id}">${t}</a>`).join("")}</nav></header>

<section id="glance"><h2>At a glance</h2>
<p class="howto">Every <strong>Δ this week</strong> compares Sat 09-12 → Wed 09-16 (the 11 Sep build, publish days excluded) with the same five weekdays one week earlier, pairing each day with its own weekday. <strong>Δ week before</strong> is the same comparison one week back (09-05→09 vs 08-29→09-02), so you can see whether a trend sped up or slowed down. Metrics that lag use only the day pairs both weeks have.</p>
<ul class="summary">${(C.summary || []).map(s => `<li>${inline(s)}</li>`).join("")}</ul>
<div class="tiles">${tiles}</div>
${deltaBars({ rows: D.metrics.filter(m => !m.missing && m.kind === "rate" && m.cur && m.cur.delta != null && !/^(ClientMemoryUsageAvg|MemoryUsageAvg|CpuTimeAvg)$/.test(m.metric)).map(m => ({ label: m.label, d: m.cur.delta, lower: m.lower, note: `${m.cur.pairs}/5 pairs` })), ariaLabel: "relative change of every rate metric" })}
${extras("glance")}
<p class="src">Green = moved in the favourable direction for that metric, red = unfavourable (bounce, crash rate, memory and errors count as favourable when they fall). Rates only; volumes are in the tables.</p>
</section>

${sec("timeline", "What shipped, and when", `${table(["UTC", "What"], tl)}<h3>Deploy log from errors by version</h3>${table(["Version", "First error day", "Last error day", "Days", "Errors"], dep, { num: [3, 4] })}<p class="src">Deploy log: <code>ErrorCount</code> by <code>PlaceVersion</code>, Place-filtered (Open Cloud). A version appears when it first throws, so it dates a ship independently of <code>place-versions.csv</code>.</p>`)}

${sec("reach", "Reach & audience", dailyChart(["DailyActiveUsers"]) + dailyChart(["UniqueUsersWithImpressions"]) + dailyChart(["EndToEndCVR", "RFYPlayThroughRate"]) + MT("Reach") + MT("Audience") +
  exploreTable("DailyActiveUsers", "IsNewUser", "int", "DAU, new vs returning (Explore)") + splitTable("dauBySource", "int", "DAU by acquisition source") + splitTable("impressionsBySource", "int", "Impressions by acquisition source") + splitTable("dauByPlatform", "int", "DAU by platform") + splitTable("dauByCountry", "int", "DAU by country (top 15)"))}

${sec("ccu", "Concurrents", ccuChart + dailyChart(["PeakConcurrentPlayers"]) + splitTable("pcuByPlatform", "int", "Daily peak CCU by platform"))}

${sec("retention", "Retention", dailyChart(["ForwardD1Retention"]) + MT("Return loop", ["ForwardD1Retention"]) + splitTable("d1BySource", "pct", "D1 by acquisition source") + splitTable("d1ByPlatform", "pct", "D1 by platform") + exploreTable("ForwardD1Retention", "IsNewUser", "pct", "D1, new vs returning (Explore)"))}

${sec("engagement", "Session length and first-play signals", dailyChart(["AverageSessionLengthMinutes", "AveragePlayTimeMinutesPerDAU"]) + dailyChart(["RFYDuration0To60", "RFYDuration61To180"]) + MT("First session") +
  exploreTable("AverageSessionLengthMinutes", "IsNewUser", "min", "Session length, new vs returning (Explore)") + exploreTable("AverageSessionLengthMinutes", "Platform", "min", "Session length by platform (Explore)"))}

${sec("money", "Monetization", dailyChart(["DailyRevenue"]) + dailyChart(["AverageRevenuePerUser"]) + dailyChart(["PayingUsers"]) + MT("Money") + splitTable("revenueBySource", "robux0", "Revenue by source") + splitTable("itemRevenueByProductType", "robux0", "Item revenue by product type") + exploreTable("PayingUsersCVR", "Platform", "pct", "Paying-user CVR by platform (Explore)"))}

${sec("funnels", "Funnels", `<p class="howto"><code>FunnelCohortCompletionRate</code> at ONE_DAY, one <code>FunnelName</code> per chart, so no rate is a blend across funnels. Cohort rates for recent days keep rising for a week or more as players come back, so a multi-day step reads low for the newest cohorts.</p>` + (funnelHtml || `<p class="nodata">No FunnelName-scoped daily funnel series in the corpus.</p>`))}

${sec("technical", "Technical", dailyChart(["ClientCrashRate15m"]) + dailyChart(["ErrorCount"]) + MT("Technical") + MT("Derived") + splitTable("crashRateByPlatform", "pct", "Crash rate by platform") + splitTable("fpsP10ByPlatform", "num2", "FPS p10 by platform") + splitTable("memPctByPlatform", "pct", "Client memory % by platform") + splitTable("errorsByLogSource", "int", "Errors by log source"))}

${sec("errors", "Error exports", "")}

${sec("sentiment", "Sentiment", (fbv.length ? `<h3>Feedback rows by build</h3>` + table(["Build", "Dates", "Up", "Down", "Downvote rate"], fbv, { num: [2, 3, 4] }) : "") + quotes + MT("Sentiment"))}

<section id="appendix"><h2>All metrics</h2>
<h3>Day-on-day, same weekday</h3><p class="howto">Each cell is that day's settled value, with its change against the same weekday seven days earlier. 11 Sep is a publish day; 17 and 18 Sep carry new publishes on some games; the newest days of the lagging metrics are not served yet (—).</p>${dodTable}
${extras("appendix")}</section>

<section id="method"><h2>Method and provenance</h2>${prose((C.sections || {}).method)}
<ul class="method"><li>Source: browser grab of 2026-09-19 (${esc(D.builtAt.slice(0, 16).replace("T", " "))} UTC build of the data file), merged into <code>data/games/${D.id}/series.json</code>. Settled points only: <code>partial</code> and gap-filled <code>FILLED_ZERO</code> rows are dropped; future-dated rows are dropped.</li>
<li>Headline series = empty breakdown; a <code>Place</code> filter scopes and counts as the whole. Population filters (<code>IsNewUser</code>, <code>AcquisitionSource</code>) are slices and are only shown as splits.</li>
<li>New-vs-returning, session and CVR splits and hourly CCU come from the dashboard's Explore engine (<code>dag/execute</code>), pulled in the logged-in browser on 2026-09-19.</li>
<li>Error exports: dashboard CSV via <code>npm run export:errors</code>, filed under <code>data/exports/</code>. "Since vN" exports list errors first seen at that build, not every error that build throws.</li></ul></section>

<section id="diagnosis" class="diag"><h2>Diagnosis — hypotheses</h2>
<p class="howto">Everything above is measurement. This section is interpretation: each hypothesis is stated with what supports it, what cuts against it, and the observation that would settle it. None is a confirmed cause unless marked <em>supported</em> with high confidence.</p>
${prose((C.sections || {}).diagnosis)}${hyps}
${(C.reads || []).length ? `<h3>Reads due</h3>` + table(["When", "What becomes readable"], C.reads.map(r => [r.date, r.what])) : ""}</section>
</div>
<div id="tip" role="tooltip" hidden></div>
<script>(function(){var t=document.getElementById("tip");document.addEventListener("mouseover",function(e){var el=e.target.closest("[data-tip]");if(!el){t.hidden=true;return;}t.textContent=el.getAttribute("data-tip");t.hidden=false;});document.addEventListener("mousemove",function(e){if(t.hidden)return;var x=e.clientX+14,y=e.clientY+14;if(x+t.offsetWidth>innerWidth-8)x=e.clientX-t.offsetWidth-14;t.style.left=x+"px";t.style.top=y+"px";});})();</script>`;
}

const CSS = `
:root{--ground:#F2F4F7;--surface:#FFFFFF;--sunk:#E8ECF1;--ink:#141922;--ink-2:#2A323D;--ink-3:#5F6B7A;--faint:#8793A2;
--rule:#D6DDE6;--rule-soft:#E6EBF1;--accent:#2F5D8A;--accent-text:#2A5580;--pos:#16704A;--neg:#A82A20;--band:rgba(47,93,138,.07);
--before:#9AA5B3;--s1:#2a78d6;--s2:#eb6834;--s3:#1baf7a;--s4:#eda100;
--sup:#16704A;--pla:#2F5D8A;--unr:#8A5B0C;--wea:#77808D;--rul:#A82A20;--shadow:0 1px 2px rgba(20,25,34,.05),0 8px 24px -16px rgba(20,25,34,.3)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--ground:#0E1218;--surface:#161C25;--sunk:#1E2632;--ink:#EDF1F6;--ink-2:#C3CCD8;--ink-3:#8B98A8;--faint:#6B7889;
--rule:#2A3441;--rule-soft:#212A35;--accent:#7FA6D9;--accent-text:#8DB3E6;--pos:#5EC894;--neg:#F08276;--band:rgba(127,166,217,.08);--before:#6B7889;
--s1:#3987e5;--s2:#d95926;--s3:#199e70;--s4:#c98500;--sup:#5EC894;--pla:#7FA6D9;--unr:#DBA747;--wea:#8B98A8;--rul:#F08276;--shadow:0 1px 2px rgba(0,0,0,.4),0 10px 28px -18px rgba(0,0,0,.8)}}
:root[data-theme="dark"]{--ground:#0E1218;--surface:#161C25;--sunk:#1E2632;--ink:#EDF1F6;--ink-2:#C3CCD8;--ink-3:#8B98A8;--faint:#6B7889;
--rule:#2A3441;--rule-soft:#212A35;--accent:#7FA6D9;--accent-text:#8DB3E6;--pos:#5EC894;--neg:#F08276;--band:rgba(127,166,217,.08);--before:#6B7889;
--s1:#3987e5;--s2:#d95926;--s3:#199e70;--s4:#c98500;--sup:#5EC894;--pla:#7FA6D9;--unr:#DBA747;--wea:#8B98A8;--rul:#F08276;--shadow:0 1px 2px rgba(0,0,0,.4),0 10px 28px -18px rgba(0,0,0,.8)}
*{box-sizing:border-box}
body{background:var(--ground);color:var(--ink-2);font-family:"Source Serif 4",Georgia,"Times New Roman",serif;font-size:16.5px;line-height:1.6;-webkit-font-smoothing:antialiased;padding-inline:18px;padding-block:0 96px;margin:0}
.wrap{max-width:1060px;margin:0 auto}
h1,h2,h3,.lab,.eyebrow,table,.tile,.legend,figcaption,.toc,.facts,.hstat,summary{font-family:Archivo,"Helvetica Neue",Arial,sans-serif}
code,.ver,.src,.cx,.cy{font-family:"IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace}
.mast{border-top:5px solid var(--accent);padding-block:28px 8px}
.eyebrow{font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-text);font-weight:600;margin:0}
h1{font-size:clamp(28px,4.2vw,42px);line-height:1.08;letter-spacing:-.02em;color:var(--ink);font-weight:700;margin:.25em 0 .2em;text-wrap:balance}
.dek{font-size:18.5px;color:var(--ink-3);max-width:70ch;margin:0 0 18px}
.facts{display:flex;flex-wrap:wrap;border:1px solid var(--rule);border-radius:3px;background:var(--surface);box-shadow:var(--shadow);margin:0}
.facts>div{flex:1 1 180px;padding:10px 14px;border-right:1px solid var(--rule-soft)}
.facts dt{font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);margin:0 0 3px}
.facts dd{margin:0;font-size:14px;font-weight:600;color:var(--ink);font-variant-numeric:tabular-nums}
.back{margin:14px 0 0;font-family:Archivo,sans-serif;font-size:14px}
.toc{display:flex;flex-wrap:wrap;gap:6px 14px;margin:16px 0 0;font-size:13px}
.toc a{color:var(--accent-text);text-decoration:none;border-bottom:1px solid transparent}.toc a:hover,.toc a:focus-visible{border-bottom-color:currentColor}
h2{font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);font-weight:600;margin:52px 0 12px;padding-bottom:9px;border-bottom:1px solid var(--rule)}
h3{font-size:15px;color:var(--ink);font-weight:600;margin:26px 0 8px;text-wrap:balance}
p{margin:0 0 13px;max-width:78ch}
p,li,blockquote,figcaption,.tile,.facts dd{overflow-wrap:anywhere}
a{color:var(--accent-text);text-underline-offset:2px}
a:focus-visible,summary:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
strong{font-weight:600;color:var(--ink)}
ul{margin:0 0 14px;padding-left:22px}li{margin:0 0 6px}
code{font-size:.8em;color:var(--ink-3);background:var(--sunk);border-radius:2px;padding:0 4px;word-break:break-word}
code.mname{background:none;padding:0;font-size:10.5px;color:var(--faint)}
.ver{background:var(--sunk);color:var(--ink);border-radius:2px;padding:0 5px;font-size:12px}
.howto{font-size:14.5px;color:var(--ink-3);max-width:80ch}
.summary{font-size:16.5px;max-width:82ch}.summary li{margin-bottom:8px}
.tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(172px,1fr));gap:10px;margin:18px 0 22px}
.tile{background:var(--surface);border:1px solid var(--rule);border-radius:3px;padding:11px 12px 8px;box-shadow:var(--shadow)}
.tile .lab{font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);margin:0 0 4px;font-weight:600}
.tile .big{font-family:Archivo,sans-serif;font-size:22px;font-weight:700;color:var(--ink);margin:0;font-variant-numeric:tabular-nums}
.tile .tsub{font-size:12.5px;margin:2px 0 0;font-family:Archivo,sans-serif}.tile .vs{color:var(--faint)}.tile .prior{color:var(--faint)}
.spark{width:100%;height:30px;display:block;margin-top:6px}
.d{font-family:Archivo,sans-serif;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap}
.d-up{color:var(--pos)}.d-down{color:var(--neg)}.d-flat{color:var(--ink-3)}.small{font-size:11.5px}
.tbl{overflow-x:auto;margin:6px 0 16px;border:1px solid var(--rule);border-radius:3px;background:var(--surface)}
table{border-collapse:collapse;width:100%;font-size:13px;color:var(--ink-2)}
th{text-align:left;font-weight:600;color:var(--ink-3);font-size:11px;letter-spacing:.04em;text-transform:uppercase;padding:8px 10px;border-bottom:1px solid var(--rule);background:var(--sunk);white-space:nowrap}
td{padding:7px 10px;border-bottom:1px solid var(--rule-soft);vertical-align:top}
tr:last-child td{border-bottom:0}
.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
table.mt td:last-child{width:130px}table.mt .spark{height:24px;margin:0}
table.dod td{font-size:12.5px}
.chartbox{overflow-x:auto;margin:4px 0 14px;background:var(--surface);border:1px solid var(--rule);border-radius:3px;padding:6px 4px}
.chartbox svg{display:block;width:100%;min-width:560px;height:auto}
.legend{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12.5px;color:var(--ink-3);margin:10px 0 2px}
.legend i{display:inline-block;width:14px;height:3px;border-radius:2px;margin-right:6px;vertical-align:middle}
.cgrid{stroke:var(--rule-soft);stroke-width:1}.caxis{stroke:var(--rule);stroke-width:1}
.cmark{stroke:var(--accent);stroke-width:1;stroke-dasharray:3 3;opacity:.8}
.cx{font-size:10.5px;fill:var(--ink-3);text-anchor:middle}.cy{font-size:10.5px;fill:var(--ink-3);text-anchor:end}
.cmlab{font:600 10.5px Archivo,sans-serif;fill:var(--accent-text)}.cband{font:600 10px Archivo,sans-serif;fill:var(--faint);letter-spacing:.08em;text-transform:uppercase}
.crow{font:12px Archivo,sans-serif;fill:var(--ink-2);text-anchor:end}.cval{font:600 11.5px Archivo,sans-serif;fill:var(--ink-2)}
.ctitle{font:600 13.5px Archivo,sans-serif;color:var(--ink);margin:18px 0 2px}
.nodata{font-style:italic;color:var(--faint)}
.src{font-size:11.5px;color:var(--faint);max-width:90ch}
figure.xt{margin:18px 0}figure.xt figcaption{font-size:14px;color:var(--ink);margin:0 0 4px}figure.xt .note{display:block;font-size:13px;color:var(--ink-3);font-weight:400;margin-top:2px}
details{margin:0 0 16px}summary{cursor:pointer;font-size:13px;color:var(--accent-text)}
blockquote{margin:0 0 10px;padding:8px 14px;border-left:3px solid var(--rule);background:var(--surface);border-radius:0 3px 3px 0}
blockquote p{margin:0;font-size:15px}blockquote footer{font:12px Archivo,sans-serif;color:var(--faint);margin-top:3px}
.diag{border-top:3px double var(--rule);margin-top:64px}
.diag h2{color:var(--ink)}
.hyp{background:var(--surface);border:1px solid var(--rule);border-radius:3px;padding:14px 16px 6px;margin:0 0 14px;box-shadow:var(--shadow);border-top:3px solid var(--unr)}
.hyp-sup{border-top-color:var(--sup)}.hyp-pla{border-top-color:var(--pla)}.hyp-wea{border-top-color:var(--wea)}.hyp-rul{border-top-color:var(--rul)}
.hyp h3{margin:2px 0 6px}.hstat{font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:var(--ink-3)}
.hyp-sup .hstat{color:var(--sup)}.hyp-pla .hstat{color:var(--pla)}.hyp-rul .hstat{color:var(--rul)}.hyp-unr .hstat{color:var(--unr)}
.claim{font-size:16.5px;color:var(--ink)}
.evid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:4px 22px;font-size:14.5px}
.evid .lab,.test .lab{font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);font-weight:700;margin:0 0 4px}
.test{font-size:14.5px}.test .lab{display:inline;margin-right:6px}
.method{font-size:14px;color:var(--ink-3)}
#tip{position:fixed;z-index:10;pointer-events:none;background:var(--ink);color:var(--ground);font:12px/1.35 Archivo,sans-serif;padding:5px 8px;border-radius:3px;max-width:320px;box-shadow:var(--shadow)}
@media (max-width:560px){body{font-size:15.5px}.facts>div{flex-basis:100%;border-right:0;border-bottom:1px solid var(--rule-soft)}}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
`;

module.exports = { page, CSS, inline, prose, table, fmtU, pctS, dspan, readJ };

if (require.main === module) {
  const slugs = process.argv.slice(2).length ? process.argv.slice(2) : ["brainrot", "waterslide", "monkey", "verity", "seal"];
  for (const s of slugs) {
    const D = readJ(path.join(BASE, "data", `${s}.json`));
    const C = readJ(path.join(BASE, "content", `${s}.json`), { dek: "", summary: [], sections: {}, hypotheses: [] });
    const X = readJ(path.join(BASE, "data", `extras-${s}.json`), { tables: [] });
    const html = page(D, C, X);
    fs.writeFileSync(path.join(OUT, `${s}.html`), html);
    console.log(`wrote out/${s}.html (${(html.length / 1024).toFixed(0)} KB)`);
  }
}
