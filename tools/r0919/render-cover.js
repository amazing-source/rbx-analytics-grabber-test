// Portfolio cover for the 2026-09-19 pass: links, the cross-game table (from
// portfolio.json — no hand-typed figures) and the cross-game prose from
// reports/2026-09-19/content/cover.json.
//   node tools/r0919/render-cover.js
const fs = require("fs");
const path = require("path");
const { lineChart, esc } = require("./chart.js");
const { CSS, inline, prose, table, readJ, pctS } = require("./render.js");
const BASE = path.join(__dirname, "../../reports/2026-09-19");
const P = readJ(path.join(BASE, "data/portfolio.json"));
const C = readJ(path.join(BASE, "content/cover.json"), { dek: "", summary: [], sections: {} });
const URLS = readJ(path.join(BASE, "urls.json"), {});
const XC = readJ(path.join(BASE, "data/extras-cover.json"), { tables: [] });
const xtables = sec => XC.tables.filter(t => t.section === sec).map(t => `<figure class="xt"><figcaption><strong>${inline(t.title)}</strong>${t.note ? `<span class="note">${inline(t.note)}</span>` : ""}</figcaption>` + table(t.columns, t.rows, { num: t.numeric || [] }) + (t.source ? `<p class="src">Source: ${inline(t.source)}</p>` : "") + `</figure>`).join("");
const G = Object.fromEntries(P.games.map(g => [g.slug, g]));
const ORDER = ["waterslide", "brainrot", "seal", "monkey", "verity"].filter(s => G[s]);
const COL = { brainrot: "var(--s1)", waterslide: "var(--s2)", monkey: "var(--s3)", verity: "var(--s4)", seal: "var(--s5)" };

const KEYS = [["DailyActiveUsers", "DAU", false], ["PeakConcurrentPlayers", "Peak CCU", false], ["UniqueUsersWithImpressions", "Impressions", false],
  ["EndToEndCVR", "Impr→play CVR", false], ["ForwardD1Retention", "D1", false], ["AverageSessionLengthMinutes", "Session", false],
  ["DailyRevenue", "Revenue", false], ["AverageRevenuePerUser", "ARPDAU", false], ["RFYD2To7PlayDays", "D2–7 play days", false],
  ["ClientCrashRate15m", "Crash rate", true]];
const cell = (x, lower) => { if (!x || x.d == null) return "—";
  const cls = Math.abs(x.d) < 0.005 ? "flat" : ((lower ? x.d < 0 : x.d > 0) ? "up" : "down");
  return { html: `<span class="d d-${cls}">${pctS(x.d)}</span><br><span class="small muted">wk before ${pctS(x.prior)}</span>` }; };
const rows = ORDER.map(s => { const g = G[s]; const last = Object.entries(g.pctOfPeak).sort().at(-1);
  return [{ html: URLS[s] ? `<a href="${URLS[s]}">${esc(g.name)}</a>` : esc(g.name) }, last ? `${(last[1] * 100).toFixed(1)}%` : "—",
    ...KEYS.map(([k, , lower]) => cell(g.k[k], lower))]; });

const peakChart = lineChart({ series: ORDER.map(s => ({ name: G[s].name, color: COL[s],
  pts: Object.entries(G[s].pctOfPeak).filter(([d]) => d >= "2026-08-15") })), xFrom: "2026-08-15", xTo: "2026-09-19",
  yFmt: v => (v * 100).toFixed(0) + "%", yZero: true, height: 260, markers: [{ t: "2026-09-11T15:00", label: "11 Sep builds" }],
  bands: [{ a: "2026-09-05", b: "2026-09-09", label: "before" }, { a: "2026-09-12", b: "2026-09-16", label: "after" }],
  ariaLabel: "DAU as a share of each game's own peak", title: "DAU as a share of each game's own all-time peak" });

const cards = ORDER.map(s => { const g = G[s]; const c = (C.games || {})[s] || {};
  return `<article class="gcard"><p class="lab">${esc(g.name)}</p><p class="gline">${inline(c.line || "")}</p>
  ${URLS[s] ? `<p><a href="${URLS[s]}">Open the ${esc(c.short || g.name)} read →</a></p>` : ""}</article>`; }).join("");

const html = `<title>Portfolio 11–19 Sep</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap">
<style>${CSS}
:root{--s5:#e87ba4}@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--s5:#d55181}}:root[data-theme="dark"]{--s5:#d55181}
.gcards{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin:14px 0 8px}
.gcard{background:var(--surface);border:1px solid var(--rule);border-radius:3px;padding:12px 14px 4px;box-shadow:var(--shadow)}
.gcard .lab{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);font-weight:700;margin:0 0 4px}
.gline{font-size:15px}.muted{color:var(--faint)}</style>
<div class="wrap">
<header class="mast"><p class="eyebrow">Portfolio · week of the 11 Sep builds · data to ${esc(C.asOf || "2026-09-19")}</p>
<h1>${esc(C.title || "Five games, one week after the 11 Sep builds")}</h1><p class="dek">${inline(C.dek || "")}</p>
<nav class="toc"><a href="#games">Games</a><a href="#table">Side by side</a><a href="#cross">Across the portfolio</a><a href="#reads">Reads due</a><a href="#method">Method</a><a href="#diagnosis">Diagnosis</a></nav></header>
<section id="games"><h2>The five reads</h2><ul class="summary">${(C.summary || []).map(s => `<li>${inline(s)}</li>`).join("")}</ul><div class="gcards">${cards}</div></section>
<section id="table"><h2>Side by side</h2>
<p class="howto">Sat 09-12 → Wed 09-16 against the same weekdays a week earlier (09-05 → 09-09), day paired with day. "wk before" is the same comparison one week back. DAU vs peak is the newest settled day.</p>
${table(["Game", "DAU vs peak", ...KEYS.map(k => k[1])], rows, { num: KEYS.map((_, i) => i + 2), cls: "dod" })}
${peakChart}${prose((C.sections || {}).table)}</section>
<section id="cross"><h2>Across the portfolio</h2>${prose((C.sections || {}).cross)}${xtables("cross")}</section>
<section id="reads"><h2>Reads due</h2>${prose((C.sections || {}).reads)}${(C.reads || []).length ? table(["When", "What"], C.reads.map(r => [r.date, r.what])) : ""}</section>
<section id="method"><h2>Method</h2>${prose((C.sections || {}).method)}</section>
<section id="diagnosis" class="diag"><h2>Diagnosis — portfolio hypotheses</h2>${prose((C.sections || {}).diagnosis)}</section>
</div>
<div id="tip" role="tooltip" hidden></div>
<script>(function(){var t=document.getElementById("tip");document.addEventListener("mouseover",function(e){var el=e.target.closest("[data-tip]");if(!el){t.hidden=true;return;}t.textContent=el.getAttribute("data-tip");t.hidden=false;});document.addEventListener("mousemove",function(e){if(t.hidden)return;var x=e.clientX+14,y=e.clientY+14;if(x+t.offsetWidth>innerWidth-8)x=e.clientX-t.offsetWidth-14;t.style.left=x+"px";t.style.top=y+"px";});})();</script>`;
fs.writeFileSync(path.join(BASE, "out/cover.html"), html);
console.log(`wrote out/cover.html (${(html.length / 1024).toFixed(0)} KB)`);
