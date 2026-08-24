const fs = require("fs");
const { HEAD, CHARTJS } = require("./shell.js");
const SP = "C:/Users/bfhdh/AppData/Local/Temp/claude/C--Users-bfhdh-Desktop-rbx-analytics-grabber-test/020b6e59-de57-43dc-a6b3-90c4b6a0894d/scratchpad/";
const CD = JSON.parse(fs.readFileSync(SP + "chartdata.json", "utf8"));
const OUT = SP + "reports/";

const GAMES = {
  "10030829154": { name: "Climb Waterslide and Slide", slug: "waterslide", root: "139617346573330" },
  "10399712766": { name: "+1 Banana Monkey Destruction", slug: "banana-monkey", root: "83256791430098" },
  "9963622286":  { name: "Become a Brainrot", slug: "brainrot", root: "99255447043899" },
  "9610561918":  { name: "My Knife Farm", slug: "knife-farm", root: "125003919504672" },
};

/* ---------- chart helpers ---------- */
function dauChart(id, marks) {
  const d = CD.dau[id], dates = CD.dauDates;
  let first = d.findIndex(v => v != null);
  const series = d.slice(first), xs = dates.slice(first);
  const labels = [];
  xs.forEach((s, i) => { if (s.slice(8) === "01") labels.push({ i, t: s.slice(5, 7) + "/" + s.slice(2, 4) }); });
  const mk = (marks || []).map(m => ({ i: xs.indexOf(m.d), t: m.t })).filter(m => m.i >= 0);
  return `<figure><div class="chart" data-h="200"
    data-series='${JSON.stringify(series)}'
    data-x='${JSON.stringify(xs)}'
    data-labels='${JSON.stringify(labels)}'
    data-marks='${JSON.stringify(mk)}'
    data-alt="Seven-day mean daily active users across the game's full life">
    <div class="ct">Daily active users — full life, 7-day mean</div>
    <div class="cs">${xs[0]} to ${xs[xs.length - 1]} · ${xs.length} days · hover for a value</div>
    <div class="plot"></div><div class="tip"></div></div></figure>`;
}
function ccuChart(id, marks) {
  const d = CD.ccu[id], slots = CD.ccuSlots;
  const labels = [];
  slots.forEach((s, i) => { if (s.endsWith("T00:00")) labels.push({ i, t: s.slice(5, 10) }); });
  const mk = (marks || []).map(m => ({ i: slots.indexOf(m.d), t: m.t })).filter(m => m.i >= 0);
  return `<figure><div class="chart" data-h="200"
    data-series='${JSON.stringify(d)}'
    data-x='${JSON.stringify(slots.map(s => s.replace("T", " ") + "Z"))}'
    data-labels='${JSON.stringify(labels)}'
    data-marks='${JSON.stringify(mk)}'
    data-alt="Concurrent players at half-hour resolution over the last three weeks">
    <div class="ct">Concurrent players — half-hour resolution, 22 days</div>
    <div class="cs">2026-08-03 00:00 to 2026-08-24 11:30 UTC · 1,032 buckets · pulled fresh from Open Cloud</div>
    <div class="plot"></div><div class="tip"></div></div></figure>`;
}

/* ---------- small builders ---------- */
const chip = (k, t) => `<span class="chip ${k}">${t}</span>`;
const stat = (k, v, d) => `<div class="stat"><div class="k">${k}</div><div class="v">${v}</div>${d ? `<div class="d">${d}</div>` : ""}</div>`;
const stats = a => `<div class="stats">${a.map(x => stat(...x)).join("")}</div>`;
function table(head, rows, cls, cap) {
  const th = head.map(h => `<th${h.c ? ' class="' + h.c + '"' : ""}>${h.t}</th>`).join("");
  const tb = rows.map(r => {
    if (r.__cap) return "";
    const hl = r.__hl ? ' class="hl"' : "";
    const cells = (r.__hl ? r.cells : r).map(c => typeof c === "string"
      ? `<td>${c}</td>` : `<td${c.c ? ' class="' + c.c + '"' : ""}${c.v ? ' data-v="' + c.v + '"' : ""}>${c.t}</td>`).join("");
    return `<tr${hl}>${cells}</tr>`;
  }).join("");
  return `<div class="tw"><table${cls ? ' class="' + cls + '"' : ""}><thead><tr>${th}</tr></thead><tbody>${tb}</tbody></table></div>${cap ? `<span class="cap">${cap}</span>` : ""}`;
}
function fix(i, title, where, body, badges) {
  return `<article class="fix"><header><div class="idx">${i}</div><div class="ttl"><h3>${title}</h3><div class="where">${where}</div></div></header>${body}${badges ? `<div class="badges">${badges.join("")}</div>` : ""}</article>`;
}
function sec(id, n, title, lede, body) {
  return `<section id="${id}"><div class="sechead"><span class="n">${n}</span><h2>${title}</h2></div>${lede ? `<p class="lede">${lede}</p>` : ""}${body}</section>`;
}

/* ---------- page shell ---------- */
function page(o) {
  return `<title>${o.title}</title>
${HEAD}
<div class="wrap">
<header class="mast">
  <div class="kicker"><span class="eyebrow">${o.eyebrow}</span>${o.chips.join("")}</div>
  <h1>${o.h1}</h1>
  <p class="sub">${o.sub}</p>
  <div class="metaline">${o.meta.map(m => `<span>${m}</span>`).join("")}</div>
</header>
<nav class="toc">${o.nav.map(n => `<a href="#${n[0]}">${n[1]}</a>`).join("")}</nav>
<div class="verdict"><p>${o.verdict}</p>${o.verdict2 ? `<p>${o.verdict2}</p>` : ""}</div>
${o.body}
<footer>${o.footer}</footer>
</div>
${CHARTJS}`;
}

module.exports = { CD, GAMES, OUT, dauChart, ccuChart, chip, stat, stats, table, fix, sec, page };
