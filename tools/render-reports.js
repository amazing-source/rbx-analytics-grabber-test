// Render the descriptive per-game reports + the cover, from the DuckDB panel.
//
//   node tools/panel-duck.js && node tools/render-reports.js
//
// Descriptive only: series, deltas, availability and provenance. No causal
// claim, no verdict, no recommendation. See tools/build-reports.js for why.
const fs = require("fs");
const path = require("path");
const { GAMES, GROUPS, ALL, fmt, esc, meanOn, spark, OUT } = require("./build-reports.js");

// Matched weekdays either side of the 04 Sep publish: Fri/Sat/Sun both sides,
// both windows complete, neither containing the publish day itself.
const PRE = ["2026-08-29", "2026-08-30", "2026-08-31"];
const POST = ["2026-09-05", "2026-09-06", "2026-09-07"];
const ALL_METRICS = GROUPS.flatMap(([, ms]) => ms);

const CSS = fs.readFileSync(path.join(__dirname, "report-style.css"), "utf8");

const head = (title, accent, accentDark) => `<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>
${CSS}
:root{--accent:${accent};--accent-text:${accent}}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--accent:${accentDark};--accent-text:${accentDark}}}
:root[data-theme="dark"]{--accent:${accentDark};--accent-text:${accentDark}}
</style>
`;

/** Newest settled day per metric — computed, never assumed. */
function frontier(rows) {
  const out = {};
  for (const [m] of ALL_METRICS) {
    const days = rows.filter((r) => r[m] != null).map((r) => r.date);
    if (days.length) out[m] = days[days.length - 1];
  }
  const byDate = {};
  for (const [m, d] of Object.entries(out)) (byDate[d] ??= []).push(m);
  return { out, byDate };
}

function deltaCell(a, b) {
  if (a == null || b == null || a === 0) return `<td class="n">—</td>`;
  const pc = ((b - a) / Math.abs(a)) * 100;
  const s = (pc >= 0 ? "+" : "") + pc.toFixed(1) + "%";
  return `<td class="n ${Math.abs(pc) < 2 ? "flat" : ""}">${s}</td>`;
}

function gameDoc(id) {
  const g = GAMES[id];
  const rows = ALL[id].series;
  const { out: fr, byDate } = frontier(rows);
  const pubDay = g.pub.slice(0, 10);
  const last21 = rows.slice(-21);

  // Small multiples, grouped.
  const grid = GROUPS.map(([label, ms]) => {
    const cards = ms.map(([m, name, kind]) => {
      const has = rows.some((r) => r[m] != null);
      const latest = [...rows].reverse().find((r) => r[m] != null);
      const a = meanOn(rows, m, PRE), b = meanOn(rows, m, POST);
      const pc = a != null && b != null && a !== 0 ? ((b - a) / Math.abs(a)) * 100 : null;
      return `<div class="mcard">
        <div class="mtop"><span class="mname">${esc(name)}</span>
          <span class="mval">${has ? fmt(latest[m], kind) : "—"}</span></div>
        <div class="mmeta"><code>${esc(m)}</code>${latest ? ` &middot; to ${latest.date.slice(5)}` : ""}</div>
        ${spark(rows, m, pubDay)}
        <div class="mfoot">${pc == null ? '<span class="mflat">not comparable</span>'
          : `<span class="${Math.abs(pc) < 2 ? "mflat" : pc > 0 ? "mup" : "mdown"}">${(pc >= 0 ? "+" : "") + pc.toFixed(1)}%</span> vs matched days before`}</div>
      </div>`;
    }).join("\n");
    return `<h3>${label}</h3><div class="mgrid">${cards}</div>`;
  }).join("\n");

  // Matched-weekday table.
  const cmp = GROUPS.map(([label, ms]) => {
    const body = ms.map(([m, name, kind]) => {
      const a = meanOn(rows, m, PRE), b = meanOn(rows, m, POST);
      return `<tr><td class="name">${esc(name)}<br><code class="dim">${esc(m)}</code></td>
        <td class="n">${fmt(a, kind)}</td><td class="n">${fmt(b, kind)}</td>${deltaCell(a, b)}
        <td class="n">${fr[m] ? fr[m].slice(5) : "—"}</td></tr>`;
    }).join("\n");
    return `<tr class="rule-row"><td colspan="5">${label}</td></tr>${body}`;
  }).join("\n");

  // Daily table, last 21 days, one column per key metric.
  const cols = [
    ["DailyActiveUsers", "DAU", "int"], ["PeakConcurrentPlayers", "CCU", "int"],
    ["UniqueUsersWithImpressions", "Impressions", "int"], ["EndToEndCVR", "Imp→play", "pct"],
    ["DailyRevenue", "Revenue", "int"], ["PayingUsersCVR", "Payer CVR", "pct"],
    ["AverageSessionLengthMinutes", "Session", "min"], ["ForwardD1Retention", "D1", "pct"],
  ];
  const daily = last21.map((r) => {
    const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(r.date + "T00:00:00Z").getUTCDay()];
    const isPub = r.date === pubDay;
    return `<tr${isPub ? ' class="pubrow"' : ""}><td class="name">${r.date.slice(5)} ${wd}${isPub ? ` <span class="ver">${esc(g.ver)}</span>` : ""}</td>` +
      cols.map(([m, , k]) => `<td class="n">${fmt(r[m], k)}</td>`).join("") + `</tr>`;
  }).join("\n");

  // Week over week, same weekday. Every one of the last 14 served days paired
  // with the same weekday seven days earlier — Friday against Friday.
  const wowCols = [
    ["DailyActiveUsers", "DAU", "int"], ["PeakConcurrentPlayers", "CCU", "int"],
    ["UniqueUsersWithImpressions", "Impressions", "int"], ["DailyRevenue", "Revenue", "int"],
    ["AverageSessionLengthMinutes", "Session", "min"], ["ForwardD1Retention", "D1", "pct"],
  ];
  const byDay = Object.fromEntries(rows.map((r) => [r.date, r]));
  const shift = (d, n) => { const x = new Date(d + "T00:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
  const wow = rows.slice(-14).map((r) => {
    const prev = byDay[shift(r.date, -7)];
    const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(r.date + "T00:00:00Z").getUTCDay()];
    const cells = wowCols.map(([m, , k]) => {
      const now = r[m], was = prev?.[m];
      if (now == null) return `<td class="n">—</td>`;
      if (was == null || was === 0) return `<td class="n">${fmt(now, k)}<span class="wowsub">no pair</span></td>`;
      const pc = ((now - was) / Math.abs(was)) * 100;
      const cls = Math.abs(pc) < 2 ? "mflat" : pc > 0 ? "mup" : "mdown";
      return `<td class="n">${fmt(now, k)}<span class="wowsub ${cls}">${(pc >= 0 ? "+" : "") + pc.toFixed(1)}% vs ${prev.date.slice(5)}</span></td>`;
    }).join("");
    const isPub = r.date === pubDay;
    return `<tr${isPub ? ' class="pubrow"' : ""}><td class="name">${r.date.slice(5)} <strong>${wd}</strong>${isPub ? ` <span class="ver">${esc(g.ver)}</span>` : ""}</td>${cells}</tr>`;
  }).join("\n");

  const avail = Object.entries(byDate).sort((x, y) => (x[0] < y[0] ? 1 : -1)).map(([d, ms]) =>
    `<tr><td class="name">${d}</td><td class="n">${ms.length}</td><td class="dimcell">${ms.map((m) => `<code>${esc(m)}</code>`).join(" ")}</td></tr>`).join("\n");

  const exf = path.join(__dirname, "report-extras", g.file + ".html");
  const extras = fs.existsSync(exf) ? fs.readFileSync(exf, "utf8") : "";

  const later = g.later
    ? `<p>Later builds on this game inside the read window: ${g.later.map(([v, t]) =>
        `<span class="ver">${esc(v)}</span> ${t.slice(0, 10)}`).join(", ")}. Days after those dates are not a clean <span class="ver">${esc(g.ver)}</span> read.</p>`
    : "";

  return head(g.title, g.accent, g.accentDark) + `
<div class="wrap">
<header class="masthead">
  <div class="eyebrow">Data report &middot; universe ${id} &middot; built 09 Sep 2026</div>
  <h1>${esc(g.short)}: what the series did around ${esc(g.ver)}</h1>
  <p class="dek">Every number here is a settled daily headline point pulled through one SQL view over the corpus. This document reports the movement and how it was measured. It draws no conclusion about cause.</p>
  <dl class="factbar">
    <div class="fact"><dt>Version</dt><dd><span class="ver">${esc(g.ver)}</span></dd></div>
    <div class="fact"><dt>Published (UTC)</dt><dd>${g.pub.slice(0, 10)} ${g.pub.slice(11, 19)}</dd></div>
    <div class="fact"><dt>Days in panel</dt><dd>${rows.length}</dd></div>
    <div class="fact"><dt>Series span</dt><dd>${rows[0].date} &rarr; ${rows.at(-1).date}</dd></div>
  </dl>
</header>

<h2>The window at a glance</h2>
<p>Each panel is the last 28 served days for that metric on its own scale, with the ${esc(g.ver)} publish marked as a dashed rule. The figure top-right is the newest settled value; the figure underneath compares <strong>${PRE[0].slice(5)}&ndash;${PRE[2].slice(5)}</strong> against <strong>${POST[0].slice(5)}&ndash;${POST[2].slice(5)}</strong>, Friday to Sunday on both sides, so the weekday mix is identical in both windows. A week-over-week table follows below. ${later}</p>
${grid}

<h2>Week over week, same weekday</h2>
<p>Every one of the last 14 served days against <strong>the same weekday seven days earlier</strong> &mdash; this Friday against last Friday, this Monday against last Monday. These games have a strong weekly shape, so a day-on-day comparison against yesterday mostly measures the day of the week; pairing like weekdays removes that and leaves the week-on-week move.</p>
<div class="tablewrap"><table>
<caption>Each cell: the day's value, and its change against the same weekday a week before</caption>
<thead><tr><th>Day</th>${wowCols.map(([, l]) => `<th class="n">${l}</th>`).join("")}</tr></thead>
<tbody>${wow}</tbody></table></div>

<h2>Three days before against three days after</h2>
<p>The same idea collapsed to one number per metric: mean of ${PRE.join(", ")} against mean of ${POST.join(", ")} &mdash; Friday, Saturday and Sunday on both sides, so the weekday mix is identical in the two windows. Neither window contains the publish day. A change under 2% is greyed rather than called flat.</p>
<div class="tablewrap"><table>
<caption>Fri&ndash;Sun before vs Fri&ndash;Sun after &middot; settled ONE_DAY headline points</caption>
<thead><tr><th>Metric</th><th class="n">${PRE[0].slice(5)}&ndash;${PRE[2].slice(5)}</th><th class="n">${POST[0].slice(5)}&ndash;${POST[2].slice(5)}</th><th class="n">Change</th><th class="n">Reads to</th></tr></thead>
<tbody>${cmp}</tbody></table></div>

<h2>Daily series, last 21 days</h2>
<div class="tablewrap"><table>
<caption>Settled daily headline points &middot; the publish row is shaded</caption>
<thead><tr><th>Date</th>${cols.map(([, l]) => `<th class="n">${l}</th>`).join("")}</tr></thead>
<tbody>${daily}</tbody></table></div>

<h2>What reads to when</h2>
<p>The data frontier differs by metric, so it is computed per series rather than assumed for the game.</p>
<div class="tablewrap"><table>
<caption>Newest settled day, by metric</caption>
<thead><tr><th>Newest day</th><th class="n">Metrics</th><th>Which</th></tr></thead>
<tbody>${avail}</tbody></table></div>

${extras}
<footer>Universe ${id} &middot; browser grab 09 Sep 2026 &middot; behavioural metrics settled to 07 Sep, technical to 08 Sep &middot; 08 Sep client FPS and memory excluded as a platform-wide telemetry fault.</footer>
</div>`;
}

for (const id of Object.keys(GAMES)) {
  const f = path.join(OUT, `${GAMES[id].file}.html`);
  fs.writeFileSync(f, gameDoc(id));
  console.log("wrote " + path.relative(process.cwd(), f));
}
