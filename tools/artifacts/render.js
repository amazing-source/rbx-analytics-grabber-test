// Render the D+7 artifacts: five game pages + a cover.
// Numbers come from data.json (built by data.js off tools/lib.js); prose from
// content.json. Nothing here hand-transcribes a figure.
const fs = require("fs");
const path = require("path");
const { lineChart, deltaBars, spark, esc, sgn } = require("./chart.js");

const D = JSON.parse(fs.readFileSync(path.join(__dirname, "data.json"), "utf8"));
const C = JSON.parse(fs.readFileSync(path.join(__dirname, "content.json"), "utf8"));
const CCU = JSON.parse(fs.readFileSync(path.join(__dirname, "ccu.json"), "utf8"));
const OUT = path.join(__dirname, "out");
fs.mkdirSync(OUT, { recursive: true });

const COVER_URL = "https://claude.ai/code/artifact/3babee44-0bbf-4a1d-8708-f27f0ce90999";
const URLS = {
  brainrot:"https://claude.ai/code/artifact/5f32c6f5-7a76-4a8b-a630-421477f17ea4",
  waterslide:"https://claude.ai/code/artifact/c9ba1fd3-d3a3-4c09-af40-1745e9cd0a55",
  monkey:"https://claude.ai/code/artifact/7f9eea6c-03c3-43b9-952c-f97cb0bdc3d3",
  verity:"https://claude.ai/code/artifact/deeb132c-3431-43b5-9c31-d40b354b0c67",
  seal:"https://claude.ai/code/artifact/046687f3-3674-474c-a51b-d28f4011b068",
};
const SHORT = { brainrot:"Brainrot", waterslide:"Waterslide", monkey:"Banana Monkey", verity:"Verity", seal:"Seal" };
const SEV = {
  good:     { cls:"ok",    word:"improved" },
  neutral:  { cls:"flat",  word:"held" },
  warning:  { cls:"watch", word:"soft" },
  serious:  { cls:"fix",   word:"down" },
  critical: { cls:"fix",   word:"sharp drop" },
  // verdict-level aliases used by content.json
  watch:    { cls:"watch", word:"watch" },
  fix:      { cls:"fix",   word:"needs work" },
};
function severity(m) {
  if (m.delta == null) return "neutral";
  if (m.group === "Audience" || m.group === "Reach") {
    if (m.unit === "int") return "neutral";           // volumes carry no severity
  }
  const eff = m.lower ? -m.delta : m.delta;
  if (eff >= 0.10) return "good";
  if (eff >= -0.05) return "neutral";
  if (eff >= -0.15) return "warning";
  if (eff >= -0.30) return "serious";
  return "critical";
}
const chip = (lvl, label) => `<span class="chip chip--${SEV[lvl].cls}">${esc(label)}</span>`;

function fmtMetric(m, v) {
  if (v == null) return "—";
  switch (m.unit) {
    case "pct":    return (v*100).toFixed(2) + "%";
    case "min":    return v.toFixed(2);
    case "robux":  return "R$" + v.toFixed(2);
    case "robux0": return "R$" + Math.round(v).toLocaleString("en-US");
    case "num1":   return v.toFixed(1);
    case "num2":   return v.toFixed(2);
    case "num3":   return v.toFixed(3);
    default:       return Math.round(v).toLocaleString("en-US");
  }
}
const g = (slug) => D.games.find((x) => x.slug === slug);
const met = (game, name) => game.metrics.find((m) => m.metric === name);

const CSS = `
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700&family=IBM+Plex+Mono:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap">
<style>
:root{
  --ground:#F7F5F2; --surface:#FFFFFF; --surface-2:#EFEDE8;
  --ink:#16181C; --ink-2:#4B515C; --ink-3:#77808D;
  --rule:#DFDCD5; --rule-2:#C6C2B9;
  --accent:#2F5D50; --accent-soft:#E4EDE9;
  --ok:#1B6F47; --ok-bg:#E3F2EA;
  --watch:#8A5B0C; --watch-bg:#FAF0DA;
  --fix:#A6332A; --fix-bg:#FAE6E3;
  --s1:#2F5D50; --s2:#B4552B; --s3:#4A6FA5; --s4:#8A5B0C; --s5:#7A3E6B;
  color-scheme:light;
}
@media (prefers-color-scheme:dark){ :root:not([data-theme="light"]){
  --ground:#121417; --surface:#191C21; --surface-2:#21252B;
  --ink:#E9EBEF; --ink-2:#AEB5C0; --ink-3:#7E8794;
  --rule:#2A2F36; --rule-2:#3B424B;
  --accent:#6FB39D; --accent-soft:#17241F;
  --ok:#5FBF8C; --ok-bg:#13271D; --watch:#DBA747; --watch-bg:#2A2214;
  --fix:#E88479; --fix-bg:#2E1A18;
  --s1:#6FB39D; --s2:#D98253; --s3:#7FA6D9; --s4:#DBA747; --s5:#BE8FB0;
  color-scheme:dark;
}}
:root[data-theme="dark"]{
  --ground:#121417; --surface:#191C21; --surface-2:#21252B;
  --ink:#E9EBEF; --ink-2:#AEB5C0; --ink-3:#7E8794;
  --rule:#2A2F36; --rule-2:#3B424B;
  --accent:#6FB39D; --accent-soft:#17241F;
  --ok:#5FBF8C; --ok-bg:#13271D; --watch:#DBA747; --watch-bg:#2A2214;
  --fix:#E88479; --fix-bg:#2E1A18;
  --s1:#6FB39D; --s2:#D98253; --s3:#7FA6D9; --s4:#DBA747; --s5:#BE8FB0;
  color-scheme:dark;
}
*{box-sizing:border-box}
body{background:var(--ground); color:var(--ink);
  font-family:"Source Serif 4",Georgia,"Times New Roman",serif;
  font-size:17px; line-height:1.62; margin:0; -webkit-font-smoothing:antialiased}
.wrap{max-width:900px; margin:0 auto; padding-inline:22px; padding-block:0 90px}
h1,h2,h3,.lab,.chip,table,.tile,.legend,figcaption{font-family:Archivo,"Helvetica Neue",Arial,sans-serif}
h1{font-size:clamp(2rem,5.4vw,2.7rem); font-weight:700; letter-spacing:-.024em; line-height:1.06; margin:0; text-wrap:balance}
h2{font-size:1.24rem; font-weight:600; letter-spacing:-.01em; margin:0 0 14px;
   padding-bottom:9px; border-bottom:2px solid var(--rule-2); text-wrap:balance}
h3{font-size:1.02rem; font-weight:600; margin:0 0 7px}
p{margin:0 0 14px; max-width:67ch}
p:last-child{margin-bottom:0}
a{color:var(--accent)}
section{margin-top:54px}
code{font-family:"IBM Plex Mono",ui-monospace,monospace; font-size:.84em; background:var(--surface-2);
  padding:.1em .36em; border-radius:3px; overflow-wrap:anywhere}
.tr{font-family:"IBM Plex Mono",monospace; font-size:.74rem; color:var(--ink-3); display:block; margin-top:4px}
.lab{font-size:.68rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-3); margin:0}
.muted{color:var(--ink-2)}
.mast{border-top:6px solid var(--accent); padding-top:20px}
.sub{font-size:1.14rem; line-height:1.5; color:var(--ink-2); max-width:60ch; margin:14px 0 0}
.meta{display:flex; flex-wrap:wrap; gap:5px 22px; margin-top:16px;
  font-family:"IBM Plex Mono",monospace; font-size:.75rem; color:var(--ink-2)}
.meta b{color:var(--ink); font-weight:500}
.chip{display:inline-block; font-size:.66rem; font-weight:700; letter-spacing:.09em; text-transform:uppercase;
  padding:4px 10px; border-radius:3px; white-space:nowrap}
.chip--ok{background:var(--ok-bg); color:var(--ok)}
.chip--watch{background:var(--watch-bg); color:var(--watch)}
.chip--fix{background:var(--fix-bg); color:var(--fix)}
.chip--flat{background:var(--surface-2); color:var(--ink-2)}
.chip--wrap{white-space:normal; line-height:1.5; letter-spacing:.06em}
.scroll{overflow-x:auto; margin:16px 0; border:1px solid var(--rule); border-radius:7px; background:var(--surface)}
table{border-collapse:collapse; width:100%; font-size:.84rem}
th,td{padding:9px 13px; text-align:left; border-bottom:1px solid var(--rule); white-space:nowrap}
thead th{background:var(--surface-2); font-weight:600; font-size:.68rem; letter-spacing:.07em;
  text-transform:uppercase; color:var(--ink-2)}
tbody tr:last-child td{border-bottom:none}
td.num,th.num{text-align:right; font-family:"IBM Plex Mono",monospace; font-variant-numeric:tabular-nums}
td.w{white-space:normal; min-width:250px; font-family:"Source Serif 4",serif; font-size:.94rem; line-height:1.45}
.up{color:var(--ok); font-weight:600} .dn{color:var(--fix); font-weight:600}
.heat{position:relative; font-family:"IBM Plex Mono",monospace; font-variant-numeric:tabular-nums; text-align:right}
.heat i{position:absolute; inset:3px 2px; border-radius:2px; display:block}
.heat span{position:relative}
.bar{min-width:150px}
.spark{padding:4px 13px}
.spark svg{display:block}
.hint{font-family:Archivo,sans-serif; font-size:.62rem; font-weight:600; letter-spacing:.06em;
  text-transform:uppercase; color:var(--ink-3); margin-left:6px; white-space:nowrap}
.bar i{display:block; height:12px; border-radius:2px; background:var(--s3)}
.fig{border:1px solid var(--rule); border-radius:7px; background:var(--surface); padding:16px 14px 10px; margin:16px 0}
.fig figcaption{font-size:.78rem; line-height:1.5; color:var(--ink-2); margin-top:9px; padding-inline:3px}
.plot{overflow-x:auto}
.fig svg{display:block; width:100%; height:auto}
@media (max-width:700px){ .fig svg{min-width:640px} }
.ax{font-family:"IBM Plex Mono",monospace; font-size:10.5px; fill:var(--ink-3)}
.lbl{font-family:Archivo,sans-serif; font-size:11.5px; fill:var(--ink-2)}
.val{font-family:"IBM Plex Mono",monospace; font-size:11.5px; font-weight:500}
.mark{font-family:"IBM Plex Mono",monospace; font-size:10px; fill:var(--ink-2)}
.legend{display:flex; gap:15px; flex-wrap:wrap; font-size:.76rem; color:var(--ink-2); margin-bottom:11px}
.legend span{display:inline-flex; align-items:center; gap:6px}
.key{width:13px; height:3px; border-radius:2px; display:inline-block}
.tiles{display:grid; gap:10px; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); margin:16px 0}
.tile{border:1px solid var(--rule); border-radius:6px; background:var(--surface); padding:11px 13px}
.tile b{display:block; font-size:.67rem; font-weight:600; letter-spacing:.06em; text-transform:uppercase;
  color:var(--ink-3); margin-bottom:4px}
.tile u{display:block; text-decoration:none; font-family:"IBM Plex Mono",monospace;
  font-variant-numeric:tabular-nums; font-size:1.24rem; font-weight:500; overflow-wrap:anywhere}
.tile i{font-style:normal; font-size:.75rem; font-family:"IBM Plex Mono",monospace}
.hyp{border-left:3px solid var(--rule-2); padding-left:19px; margin-top:28px; overflow-wrap:anywhere}
.hyp--confirmed{border-left-color:var(--ok)}
.hyp--likely{border-left-color:var(--accent)}
.hyp--unknown{border-left-color:var(--ink-3)}
.hyp dl{margin:11px 0 0; display:grid; grid-template-columns:auto 1fr; gap:7px 15px}
.hyp dt{font-family:Archivo,sans-serif; font-size:.66rem; font-weight:700; letter-spacing:.1em;
  text-transform:uppercase; color:var(--ink-3); padding-top:6px; white-space:nowrap}
.hyp dd{margin:0}
.q{border-left:2px solid var(--rule-2); padding-left:15px; margin:0 0 15px}
.q p{font-size:.97rem; margin:0 0 3px}
.q cite{font-style:normal; font-size:.73rem; color:var(--ink-3); font-family:"IBM Plex Mono",monospace}
.note{background:var(--surface-2); border-radius:7px; padding:17px 19px; font-size:.94rem}
.cards{display:grid; gap:12px; grid-template-columns:repeat(auto-fit,minmax(215px,1fr)); margin-top:18px}
.card{display:block; text-decoration:none; color:inherit; border:1px solid var(--rule);
  border-left:4px solid var(--rule-2); border-radius:6px; background:var(--surface); padding:15px}
.card:hover,.card:focus-visible{border-color:var(--accent)}
.card--ok{border-left-color:var(--ok)} .card--watch{border-left-color:var(--watch)} .card--fix{border-left-color:var(--fix)}
ul.plain{margin:0 0 14px; padding-left:21px; max-width:67ch} ul.plain li{margin-bottom:6px}
:focus-visible{outline:2px solid var(--accent); outline-offset:2px}
@media (max-width:560px){
  body{font-size:16px}
  .hyp dl{grid-template-columns:1fr; gap:1px} .hyp dt{padding-top:11px}
}
</style>`;

function tiles(game) {
  const want = ["PeakConcurrentPlayers","ForwardD1Retention","RFYDuration0To60","RFYDuration61To180","RFYD2To7PlayDays","RFYUniqueNotInterestedUsersPerMillionImpressions"];
  return `<div class="tiles">` + want.map((n) => {
    const m = met(game, n); if (!m) return "";
    const lvl = severity(m);
    const cls = lvl==="good" ? "up" : (lvl==="neutral" ? "muted" : "dn");
    return `<div class="tile"><b>${esc(m.label)}</b><u>${fmtMetric(m, m.after)}</u>
      <i class="${cls}">${sgn(m.delta)} · ${SEV[lvl].word}</i></div>`;
  }).join("") + `</div>`;
}

/** 11 Sep IS readable for concurrents — matched elapsed slots only. */
function ccuBlock(game) {
  const c = CCU.games[game.id];
  if (!c) return "";
  const up = c.delta >= 0;
  return `<div class="note" style="margin:18px 0">
    <h3>11 September, on concurrents</h3>
    <p>Behavioural data lags about two days, so 11 Sep is blank in the table below.
    <strong>Concurrents are current to the hour</strong>, so the second half of D+7 is readable here: peak
    within the <strong>${c.slots} half-hour slots elapsed so far today</strong> (to ${esc(CCU.cutoff)} UTC),
    against the <em>same</em> slots on 4 September. Comparing a part-day peak with a whole-day peak would
    manufacture a collapse, so it is not done; the final bucket is dropped because it repeats the one before.</p>
    <div class="tiles" style="margin-bottom:0">
      <div class="tile"><b>4 Sep, to ${esc(CCU.cutoff)}</b><u>${Math.round(c.before).toLocaleString("en-US")}</u><i class="muted">peak concurrents</i></div>
      <div class="tile"><b>11 Sep, to ${esc(CCU.cutoff)}</b><u>${Math.round(c.after).toLocaleString("en-US")}</u><i class="muted">peak concurrents</i></div>
      <div class="tile"><b>Change</b><u class="${up?"up":"dn"}">${sgn(c.delta)}</u><i class="muted">matched slots</i></div>
    </div></div>`;
}

function movedTable(game) {
  const groups = [...new Set(game.metrics.map(m => m.group))];
  return groups.map(gr => {
    const rows = game.metrics.filter(m => m.group === gr).map(m => {
      const lvl = severity(m);
      const cls = lvl === "good" ? "up" : (lvl === "neutral" ? "" : "dn");
      const change = m.signFlip
        ? `<span class="muted">${fmtMetric(m, m.before)} → ${fmtMetric(m, m.after)}</span>`
        : `<span class="${cls}">${sgn(m.delta)}</span>`;
      return `<tr>
        <td>${esc(m.label)}${m.lower ? ' <span class="hint">lower is better</span>' : ""}</td>
        <td class="num">${fmtMetric(m, m.before)}</td>
        <td class="num">${fmtMetric(m, m.after)}</td>
        <td class="num">${change}</td>
        <td class="spark">${spark(m.run, { lower: m.lower })}</td>
        <td>${m.lag ? `<span class="chip chip--flat">to ${m.lag.slice(5)}</span>` : ""}</td></tr>`;
    }).join("");
    return `<h3 style="margin-top:26px">${esc(gr)}</h3>
      <div class="scroll"><table>
        <thead><tr><th>Metric</th><th class="num">3–4 Sep</th><th class="num">D+7</th>
          <th class="num">Change</th><th>3 Sep → 11 Sep</th><th></th></tr></thead>
        <tbody>${rows}</tbody></table></div>`;
  }).join("");
}

function deltaFig(game) {
  const rows = game.metrics.filter((m) => m.unit === "pct" && m.delta != null).map((m) => {
    const lvl = severity(m);
    return { label: m.label, delta: m.delta,
      color: lvl==="good" ? "var(--ok)" : lvl==="neutral" ? "var(--ink-3)" : lvl==="warning" ? "var(--watch)" : "var(--fix)" };
  });
  return `<figure class="fig"><div class="plot">${deltaBars({ rows })}</div>
    <figcaption>Rate metrics only — a volume change across a shrinking audience is not like-for-like. Colour
    marks severity and the same reading is written as a word in the table above, so colour never carries it
    alone.</figcaption></figure>`;
}

function trendFig(game) {
  const base = (arr) => {
    const b = (arr||[]).find(([d]) => d === "2026-09-03");
    if (!b || !b[1]) return [];
    return arr.map(([d, v]) => [d, v / b[1]]);
  };
  const marks = [{ date: game.buildAt.slice(0,10), label: game.build }];
  const series = [
    { name:"DAU", color:"var(--s1)", points: base(game.daily.DailyActiveUsers), marks },
    { name:"Impressions", color:"var(--s2)", points: base(game.daily.UniqueUsersWithImpressions) },
    { name:"Concurrents", color:"var(--s3)", points: base(game.daily.PeakConcurrentPlayers) },
  ].filter((s) => s.points.length);
  return `<figure class="fig">
    <div class="legend">${series.map(s=>`<span><i class="key" style="background:${s.color}"></i>${s.name}</span>`).join("")}</div>
    <div class="plot">${lineChart({ series, yLabel:"pct", clampZero:true, baseLabel:"indexed to 3 Sep" })}</div>
    <figcaption>All three indexed to <strong>3 Sep = 100%</strong>, the day before the publish, so a single axis
    serves all three. The dashed rule marks ${esc(game.build)}.</figcaption></figure>`;
}

function funnelTables(game) {
  if (!game.funnel.length) return `<p class="muted">No single-funnel series held for this game.</p>`;
  return game.funnel.map((f) => {
    const worst = Math.max(...f.steps.map(s=>s.churnAfter||0), 0.12);
    const rows = f.steps.map((s) => {
      const comp = s.stepAfter, churn = s.churnAfter;
      const gOK  = comp==null?0:Math.max(0, Math.min(1,(comp-0.4)/0.6));
      const gBad = churn==null?0:Math.max(0, Math.min(1, churn/worst));
      return `<tr>
        <td>${s.idx}. ${esc(s.step)}</td>
        <td class="heat"><i style="background:var(--ok);opacity:${(0.08+gOK*0.30).toFixed(2)}"></i><span>${comp==null?"—":(comp*100).toFixed(2)+"%"}</span></td>
        <td class="heat"><i style="background:var(--fix);opacity:${(0.05+gBad*0.42).toFixed(2)}"></i><span>${churn==null?"—":(churn*100).toFixed(2)+"%"}</span></td>
        <td class="bar"><i style="width:${Math.max(1.5, s.after*100).toFixed(1)}%"></i></td>
        <td class="num">${(s.after*100).toFixed(2)}%</td>
        <td class="num ${s.dpp>=0?"up":"dn"}">${s.dpp>=0?"+":""}${s.dpp.toFixed(1)}pp</td></tr>`;
    }).join("");
    return `<h3 style="margin-top:28px">${esc(f.name)}</h3>
      <div class="tiles">
        <div class="tile"><b>Total conversion</b><u>${(f.total*100).toFixed(2)}%</u><i class="muted">start to finish</i></div>
        <div class="tile"><b>Steps</b><u>${f.steps.length}</u><i class="muted">instrumented</i></div>
        <div class="tile"><b>Biggest drop</b><u style="font-size:.82rem;line-height:1.6">${esc(f.biggestDrop||"—")}</u><i class="muted">highest churn</i></div>
      </div>
      <div class="scroll"><table>
        <thead><tr><th>Step</th><th class="num">Step completion</th><th class="num">Churn</th>
          <th>Total conversion</th><th class="num">&nbsp;</th><th class="num">Δ vs before</th></tr></thead>
        <tbody>${rows}</tbody></table></div>`;
  }).join("");
}

function errorsSec(c) {
  return `<p class="muted">${esc(c.errors.total)}</p>
  <div class="scroll"><table>
    <thead><tr><th class="num">Events</th><th>Signature</th><th>Reading</th></tr></thead>
    <tbody>${c.errors.rows.map(([n, sig, lvl, note]) => `<tr>
      <td class="num ${lvl==="critical"||lvl==="serious"?"dn":""}">${esc(n)}</td>
      <td class="w">${sig}</td><td class="w muted">${note}</td></tr>`).join("")}</tbody></table></div>
  <p class="muted" style="font-size:.86rem">The export caps at 25 signatures, so absence is never evidence. Any
  message embedding a username shreds one defect across many rows — treat those counts as a floor.</p>`;
}

function hypSec(c) {
  return c.hypotheses.map((x) => `<article class="hyp hyp--${x.conf}">
    <h3>${esc(x.h)}</h3><span class="chip chip--flat">${esc(x.conf)}</span>
    <dl><dt>Why</dt><dd>${x.why}</dd><dt>Against</dt><dd>${x.against}</dd><dt>Do</dt><dd>${x.fix}</dd></dl>
    </article>`).join("");
}

const FRIENDS_NOTE = `<div class="note">
  <h3>A control this report no longer uses</h3>
  <p>Earlier readings leaned on <code>Friends</code> traffic as a clean control for creative, on the reasoning
  that a social invite never shows a thumbnail. <strong>That is wrong.</strong> The friend-activity card shows
  the experience image beside the name, so Friends traffic does see creative — and it is probably not purely
  invite-driven either, since opening a friend's card and joining from it plausibly attributes to Friends as
  well, which would make it partly a discovery surface.</p>
  <p style="margin-bottom:0">Every “creative is ruled out because Friends fell too” claim is therefore
  withdrawn. Creative is judged here on the reach-immune rejection metric and an event study against ordinary
  days instead.</p></div>`;

function gamePage(slug) {
  const game = g(slug), c = C[slug], v = c.verdict;
  const dd = game.daily.DailyActiveUsers || [];
  const pct = (dd.length && game.peakDau) ? (dd[dd.length-1][1] / game.peakDau * 100).toFixed(0) + "%" : "—";
  return `<title>${esc(game.name.split(" [")[0])} D+7</title>
${CSS}
<div class="wrap">
  <header class="mast">
    <p class="lab">D+7 diagnosis · universe ${game.id}</p>
    <h1>${esc(game.name)}</h1>
    <p class="sub">${c.standfirst}</p>
    <div class="meta">
      <span>build <b>${esc(game.build)}</b></span>
      <span>published <b>${esc(game.buildAt)} UTC</b></span>
      <span>newest <b>${esc(game.newest)}</b></span>
      <span>peak <b>${esc(game.peak)}</b>, now <b>${pct} of it</b></span>
    </div>
    <p style="margin-top:16px"><span class="chip chip--${SEV[v.level].cls} chip--wrap">${esc(v.label)}</span></p>
  </header>

  <section>
    <h2>What moved</h2>
    <p><strong>D+7, point to point.</strong> The publish days — 3 and 4 September — against the same two
    weekdays seven days on, 10 and 11 September. Thursday and Friday on both sides, so no averaging and no
    weekday mismatch.</p>
    <p class="muted" style="font-size:.9rem">11 September is not served yet: behavioural data lags about two
    days. Rows marked <span class="chip chip--flat">lag</span> could not reach 10 September either and are read
    on the newest settled day instead — the table says which.</p>
    ${tiles(game)}
    ${ccuBlock(game)}
    ${deltaFig(game)}
    ${movedTable(game)}
  </section>

  <section><h2>Through the window</h2>${trendFig(game)}</section>

  <section><h2>What shipped</h2><ul class="plain">${c.shipped.map((s) => `<li>${s}</li>`).join("")}</ul></section>

  <section><h2>Funnel</h2>
    <p>Laid out as the dashboard does it — step completion, churn, and total conversion tapering from the first
    step. Step completion is this step's conversion divided by the previous step's, which is how the dashboard
    derives it too.</p>
    ${funnelTables(game)}</section>

  <section><h2>The listing</h2><p>${c.creative}</p></section>

  <section><h2>Errors on the newest build</h2>${errorsSec(c)}</section>

  <section><h2>What players said</h2><p>${c.feedback.note}</p>
    ${c.feedback.quotes.map(([d, q, note]) => `<blockquote class="q"><p>“${esc(q)}”</p>
      <cite>${esc(d)} · ${note}</cite></blockquote>`).join("")}</section>

  <section><h2>Hypotheses</h2>
    <p>Why it moved, and whether there is anything to do. <em>Confirmed</em> means measured or read directly;
    <em>likely</em> means it survived a test that could have killed it; <em>unknown</em> means it fits and has not
    been tested.</p>
    ${hypSec(c)}</section>

  <section><h2>Caveats</h2>${FRIENDS_NOTE}
    <div class="note" style="margin-top:14px"><h3>Volumes carry no severity</h3>
      <p style="margin-bottom:0">Every game here is descending its own decay curve, so a large DAU fall is the
      curve rather than news. Severity is scored on rates and on errors. Figures are generated from
      <code>data/games/&lt;id&gt;/series.json</code> through <code>tools/lib.js</code> using the headline-series
      rule: an empty breakdown, or a <code>Place</code> filter, counts as the whole; a population filter does
      not.</p></div>
    <p style="margin-top:20px"><a href="${COVER_URL}">← all five games</a></p>
  </section>
</div>`;
}

function coverPage() {
  const order = ["monkey","seal","waterslide","verity","brainrot"];
  const cols = { brainrot:"var(--s1)", waterslide:"var(--s2)", monkey:"var(--s3)", verity:"var(--s4)", seal:"var(--s5)" };
  const series = D.games.map((x) => ({ name: SHORT[x.slug], color: cols[x.slug], points: x.peakPct }));
  const rowFor = (slug) => {
    const game = g(slug), c = C[slug];
    const d1 = met(game,"ForwardD1Retention"), dau = met(game,"DailyActiveUsers"),
          cvr = met(game,"EndToEndCVR"), imp = met(game,"UniqueUsersWithImpressions");
    const l = severity(d1);
    return `<tr><td><a href="${URLS[slug]}">${esc(game.name)}</a></td>
      <td>${chip(c.verdict.level, SEV[c.verdict.level].word)}</td>
      <td class="num">${sgn(dau.delta)}</td><td class="num">${sgn(imp.delta)}</td>
      <td class="num">${sgn(cvr.delta)}</td>
      <td class="num ${l==="good"?"up":(l==="neutral"?"":"dn")}">${sgn(d1.delta)}</td>
      <td class="num ${CCU.games[game.id]?(CCU.games[game.id].delta>=0?"up":"dn"):""}">${CCU.games[game.id]?sgn(CCU.games[game.id].delta):"—"}</td></tr>`;
  };
  return `<title>Portfolio D+7, September 2026</title>
${CSS}
<div class="wrap">
  <header class="mast">
    <p class="lab">Indigo LiveOps · D+7 diagnosis</p>
    <h1>Five games, one decay curve</h1>
    <p class="sub">Four of these five shipped an update on 3–4 September. Each page compares those publish days against the
    same two weekdays seven days on. Every decline here predates the update in it, so the question is not “why is
    it falling” but “did anything change on top of the fall”.</p>
    <div class="meta"><span>publish <b>3 – 4 Sep</b></span><span>D+7 <b>10 – 11 Sep</b></span>
      <span>both <b>Thu + Fri</b></span></div>
  </header>

  <section><h2>The frame</h2>
    <figure class="fig">
      <div class="legend">${series.map(s=>`<span><i class="key" style="background:${s.color}"></i>${esc(s.name)}</span>`).join("")}</div>
      <div class="plot">${lineChart({ series, yLabel:"pct", clampZero:true, baseLabel:"share of own peak DAU" })}</div>
      <figcaption>Each game as a share of <strong>its own</strong> peak DAU. Brainrot reached roughly a tenth of
      its peak and stopped falling; the others are still descending toward that level, and Banana Monkey is
      already through it.</figcaption>
    </figure>
  </section>

  <section><h2>Where each one landed</h2>
    <div class="scroll"><table>
      <thead><tr><th>Game</th><th>Reading</th><th class="num">DAU</th><th class="num">Impressions</th>
        <th class="num">Impr→play</th><th class="num">D1</th><th class="num">CCU 11 Sep</th></tr></thead>
      <tbody>${order.map(rowFor).join("")}</tbody></table></div>
    <p class="muted" style="font-size:.86rem">Ordered by how much attention each needs. Read the rate columns —
    a volume delta across a shrinking audience is not like-for-like. The last column is the only one reaching
    <strong>11 September</strong> — concurrents are current to the hour, compared on the half-hour slots
    elapsed on both days.</p>
    <div class="cards">${order.map((slug) => {
      const game = g(slug), c = C[slug];
      return `<a class="card card--${SEV[c.verdict.level].cls}" href="${URLS[slug]}">
        <h3>${esc(game.name)}</h3>
        <p class="muted" style="font-size:.88rem;margin:0">${esc(c.verdict.label)}</p></a>`;
    }).join("")}</div>
  </section>

  <section><h2>What is worth doing first</h2>
    <article class="hyp hyp--confirmed"><h3>Seal — progression stops at ten jobs</h3>
      <p style="margin-bottom:0"><code>TenJobs</code> churns 76%: three quarters of players who buy an upgrade
      never finish ten jobs, and the funnel ends at 9.2% end to end. Onboarding was fixed and works; what follows
      it was never built to carry them.</p></article>
    <article class="hyp hyp--confirmed"><h3>Waterslide — the raft shop is still throwing after its fix</h3>
      <p style="margin-bottom:0"><code>GoShop_Raft:102</code> fails inside <code>RefreshList</code> the moment the
      shop opens, first seen on <strong>V1721, 11 September</strong> — after the 10 September build that was meant
      to fix the raft UI. That screen is step 5 of the tutorial, and steps 5 and 10 together cost about a third of
      everyone who starts.</p></article>
    <article class="hyp hyp--likely"><h3>Banana Monkey — pacing, not a patch</h3>
      <p style="margin-bottom:0">Listing rejection fell 46% and play-through rose 14%, so the thumbnail is pulling
      better than ever. Both bounce windows then rose about 20% and session duration fell 23%. They arrive better
      and leave faster — that gap is the work.</p></article>
    <article class="hyp hyp--confirmed"><h3>Brainrot — the new players are not paying</h3>
      <p style="margin-bottom:0">DAU up 23% and paying users flat at 744, which is the entire reason ARPU looks
      bad. The quest track hands new players rewards and never introduces them to anything priced.</p></article>
    <article class="hyp hyp--unknown"><h3>All five — D8–28 is falling together</h3>
      <p style="margin-bottom:0">The long-horizon cohort is down on every game in the pack: Brainrot −6.8%,
      Waterslide −18.2%, Monkey −22.5%, Verity −46.0%. That is the horizon Roblox re-weighted its recommender to
      in June. Five unrelated games moving as a block is a reason to check the platform before checking any one
      codebase.</p></article>
  </section>

  <section><h2>Caveats</h2>${FRIENDS_NOTE}</section>
</div>`;
}

for (const slug of ["brainrot","waterslide","monkey","verity","seal"]) {
  fs.writeFileSync(path.join(OUT, slug + ".html"), gamePage(slug));
}
fs.writeFileSync(path.join(OUT, "cover.html"), coverPage());
console.log("rendered:", ["cover","brainrot","waterslide","monkey","verity","seal"].join(", "));
