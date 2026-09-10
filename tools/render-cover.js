// Render the portfolio cover for the 04.09 update set, from the DuckDB panel.
//
//   node tools/panel-duck.js && node tools/render-reports.js && node tools/render-cover.js
//
// Descriptive only, same rule as the per-game reports: series, deltas,
// availability and provenance, with no causal claim and no recommendation.
const fs = require("fs");
const path = require("path");
const { GAMES, ALL, fmt, esc, meanOn, OUT } = require("./build-reports.js");

const PRE = ["2026-08-29", "2026-08-30", "2026-08-31"];
const POST = ["2026-09-05", "2026-09-06", "2026-09-07"];
const CSS = fs.readFileSync(path.join(__dirname, "report-style.css"), "utf8");

const ORDER = ["9963622286", "10399712766", "10030829154", "10565445771", "10638354731"];

/**
 * Colour encodes DIRECTION, not identity — Ren's call. A game holding its level
 * reads green, a game deep in a drop reads red, with amber between.
 *
 * That means colour can no longer tell you WHICH game a line is, so every line
 * is directly labelled with its name and value at the right-hand end. That
 * labelling is not decoration: it is the secondary encoding that keeps the chart
 * readable for a red-green colourblind reader, for whom this ramp is the single
 * worst hue pair. Never ship this scale without the labels.
 */
const RAMP_LIGHT = [[0, [163, 36, 27]], [50, [192, 122, 18]], [100, [21, 122, 76]]];
const RAMP_DARK = [[0, [240, 130, 118]], [50, [227, 172, 74]], [100, [94, 200, 148]]];

function rampColor(idx, stops) {
  const v = Math.max(0, Math.min(100, idx));
  let a = stops[0], b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++)
    if (v >= stops[i][0] && v <= stops[i + 1][0]) { a = stops[i]; b = stops[i + 1]; break; }
  const t = b[0] === a[0] ? 0 : (v - a[0]) / (b[0] - a[0]);
  const c = a[1].map((ch, i) => Math.round(ch + (b[1][i] - ch) * t));
  return "#" + c.map((n) => n.toString(16).padStart(2, "0")).join("");
}

/** Final indexed DAU per game, which is what the colour is keyed on. */
function finalIndex() {
  const days = [];
  for (let d = new Date("2026-08-25T00:00:00Z"); d <= new Date("2026-09-07T00:00:00Z"); d.setUTCDate(d.getUTCDate() + 1))
    days.push(d.toISOString().slice(0, 10));
  const out = {};
  for (const id of ORDER) {
    const rows = ALL[id].series;
    const vals = days.map((d) => rows.find((r) => r.date === d)?.DailyActiveUsers).filter((v) => v != null);
    if (vals.length >= 2) out[id] = (vals[vals.length - 1] / vals[0]) * 100;
  }
  return out;
}
const FINAL = finalIndex();
const SERIES = Object.fromEntries(ORDER.map((id) => [id, rampColor(FINAL[id] ?? 100, RAMP_LIGHT)]));
const SERIES_DARK = Object.fromEntries(ORDER.map((id) => [id, rampColor(FINAL[id] ?? 100, RAMP_DARK)]));

const ROWS = [
  ["DailyActiveUsers", "Daily active users", "int"],
  ["UniqueUsersWithImpressions", "Unique users who saw it", "int"],
  ["PeakConcurrentPlayers", "Peak concurrents", "int"],
  ["AverageSessionLengthMinutes", "Session length (min)", "min"],
  ["ForwardD1Retention", "D1 retention", "pct"],
  ["DailyRevenue", "Daily revenue (R$)", "int"],
  ["PayingUsersCVR", "Payer conversion", "pct"],
  ["AverageRevenuePerUser", "Revenue per player", "num3"],
];

/**
 * DAU indexed to 100 on the FIRST day of the window, so five games of very
 * different size share one axis and every line starts together.
 *
 * Indexing on the publish day instead put games that were falling fast at 300+
 * early in the window, which blew the domain out and clipped every line against
 * the top of the plot. The scale is also computed from the data rather than
 * hardcoded, so a line can never run off the chart again.
 */
const SHORT = {
  "9963622286": "Brainrot", "10399712766": "Banana Monkey",
  "10030829154": "Waterslide", "10565445771": "Verity", "10638354731": "Seal",
};

function indexedChart() {
  const days = [];
  for (let d = new Date("2026-08-25T00:00:00Z"); d <= new Date("2026-09-07T00:00:00Z"); d.setUTCDate(d.getUTCDate() + 1))
    days.push(d.toISOString().slice(0, 10));

  const seriesPts = [];
  for (const id of ORDER) {
    const rows = ALL[id].series;
    const at = (d) => rows.find((r) => r.date === d)?.DailyActiveUsers;
    const base = days.map(at).find((v) => v != null);   // first served day in the window
    if (!base) continue;
    const pts = days.map((d, i) => [i, at(d)]).filter(([, v]) => v != null).map(([i, v]) => [i, (v / base) * 100]);
    if (pts.length >= 2) seriesPts.push({ id, pts });
  }

  // Domain from the data, padded, then snapped out to round gridlines.
  const all = seriesPts.flatMap((s) => s.pts.map(([, v]) => v));
  const step = 25;
  const lo = Math.max(0, Math.floor((Math.min(...all) - 5) / step) * step);
  const hi = Math.ceil((Math.max(...all) + 5) / step) * step;

  const W = 940, H = 310, L = 52, R = 158, T = 22, B = 258;
  const x = (i) => L + (i * (W - L - R)) / (days.length - 1);
  const y = (v) => B - ((v - lo) / (hi - lo)) * (B - T);

  const paths = [], dots = [], ends = [];
  for (const { id, pts } of seriesPts) {
    paths.push(`<path d="${pts.map(([i, v], k) => `${k ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ")}" fill="none" stroke="var(--s${id})" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`);
    const [li, lv] = pts[pts.length - 1];
    dots.push(`<circle cx="${x(li).toFixed(1)}" cy="${y(lv).toFixed(1)}" r="4" fill="var(--s${id})" stroke="var(--panel)" stroke-width="2"/>`);
    ends.push({ id, x: x(li), y: y(lv), v: lv });
  }

  // Spread the right-hand labels so none collide and none leaves the box.
  ends.sort((a, b) => a.y - b.y);
  const GAP = 17;
  for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < GAP) ends[i].y = ends[i - 1].y + GAP;
  const overflow = ends.length ? ends[ends.length - 1].y - (H - 12) : 0;
  if (overflow > 0) for (const e of ends) e.y -= overflow;
  const texts = ends.map((e) =>
    `<text x="${(e.x + 9).toFixed(1)}" y="${(e.y + 4).toFixed(1)}" fill="var(--s${e.id})" font-size="11.5" font-family="Archivo,sans-serif" font-weight="600">${esc(SHORT[e.id])} ${e.v.toFixed(0)}</text>`).join("");

  const lines = [];
  for (let v = lo; v <= hi; v += step)
    lines.push(`<line x1="${L}" y1="${y(v).toFixed(1)}" x2="${(W - R).toFixed(1)}" y2="${y(v).toFixed(1)}" stroke="${v === 100 ? "var(--rule)" : "var(--rule-soft)"}" stroke-width="1"/><text x="${L - 8}" y="${(y(v) + 3.5).toFixed(1)}" fill="var(--faint)" font-size="10.5" text-anchor="end" font-family="'IBM Plex Mono',monospace">${v}</text>`);

  const ticks = days.map((d, i) => (i % 3 === 0 || i === days.length - 1)
    ? `<text x="${x(i).toFixed(1)}" y="${B + 18}" fill="var(--faint)" font-size="10.5" text-anchor="middle" font-family="'IBM Plex Mono',monospace">${d.slice(5)}</text>` : "").join("");

  const pubX = x(days.indexOf("2026-09-04"));
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="auto" role="img"
    aria-label="Daily active users for five games, each indexed to 100 on 25 August, through 7 September"
    style="display:block">${lines.join("")}
    <line x1="${pubX.toFixed(1)}" y1="${T}" x2="${pubX.toFixed(1)}" y2="${B}" stroke="var(--rule)" stroke-width="1.5" stroke-dasharray="4 3"/>
    <text x="${(pubX - 6).toFixed(1)}" y="${T - 6}" fill="var(--muted)" font-size="10.5" text-anchor="end" font-family="'IBM Plex Mono',monospace">04 Sep publishes</text>
    ${paths.join("")}${dots.join("")}${texts}${ticks}
    <text x="${((L + W - R) / 2).toFixed(0)}" y="${H - 4}" fill="var(--faint)" font-size="10.5" text-anchor="middle"
      font-family="'IBM Plex Mono',monospace">DAU indexed to 100 on 25 Aug &middot; UTC</text></svg>`;
}

const cmp = ROWS.map(([m, label, kind]) => {
  const cells = ORDER.map((id) => {
    const rows = ALL[id].series;
    const a = meanOn(rows, m, PRE), b = meanOn(rows, m, POST);
    if (a == null || b == null) return `<td class="n">&mdash;<span class="wowsub">not held</span></td>`;
    const pc = ((b - a) / Math.abs(a)) * 100;
    const cls = Math.abs(pc) < 2 ? "mflat" : pc > 0 ? "mup" : "mdown";
    return `<td class="n">${fmt(b, kind)}<span class="wowsub ${cls}">${(pc >= 0 ? "+" : "") + pc.toFixed(1)}%</span></td>`;
  }).join("");
  return `<tr><td class="name">${esc(label)}<br><code class="dim">${esc(m)}</code></td>${cells}</tr>`;
}).join("\n");

const cards = ORDER.map((id) => {
  const g = GAMES[id];
  const rows = ALL[id].series;
  const dau = meanOn(rows, "DailyActiveUsers", POST);
  const n = rows.length;
  return `<a class="gcard" href="${g.url}" style="border-left-color:${SERIES[id]}">
    <div class="gtop"><span class="gname">${esc(g.short)}</span> <span class="ver">${esc(g.ver)}</span></div>
    <p class="gsum">Published ${g.pub.slice(0, 10)} ${g.pub.slice(11, 19)} UTC &middot; ${n} days in the panel &middot;
      ${dau == null ? "DAU not held" : fmt(dau, "int") + " DAU on the 5&ndash;7 Sep mean"}. Daily series, week-over-week
      by weekday, funnels and the full metric grid.</p></a>`;
}).join("\n");

const html = `<title>Update 04.09 Across Five Games</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>
${CSS}
:root{--accent:#33404F;--accent-text:#33404F;
${ORDER.map((id) => `--s${id}:${SERIES[id]};`).join("")}}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--accent:#9FB0C4;--accent-text:#C3CCD8;
${ORDER.map((id) => `--s${id}:${SERIES_DARK[id]};`).join("")}}}
:root[data-theme="dark"]{--accent:#9FB0C4;--accent-text:#C3CCD8;
${ORDER.map((id) => `--s${id}:${SERIES_DARK[id]};`).join("")}}
</style>

<div class="wrap">
<header class="masthead">
  <div class="eyebrow">Data report &middot; five universes &middot; built 09 Sep 2026</div>
  <h1>Update 04.09: what the series did on all five games</h1>
  <p class="dek">All five shipped inside eight hours on 4 September and all five reached 100% adoption by 5&ndash;7 September. This is the index. It reports the movement on each game and how every number was derived; each linked report does the same in full. None of them draws a conclusion about cause.</p>
  <dl class="factbar">
    <div class="fact"><dt>Panel</dt><dd>24,426 rows</dd></div>
    <div class="fact"><dt>Metrics</dt><dd>75</dd></div>
    <div class="fact"><dt>Grabbed</dt><dd>09 Sep 12:05&ndash;12:16 UTC</dd></div>
    <div class="fact"><dt>Behavioural to</dt><dd>07 Sep</dd></div>
    <div class="fact"><dt>Technical to</dt><dd>08 Sep</dd></div>
  </dl>
</header>

<h2>What shipped</h2>
<div class="tablewrap"><table>
<caption>From <code>develop.roblox.com</code> saved-versions, root place, published builds only</caption>
<thead><tr><th>Game</th><th>Universe</th><th>Version</th><th>Published (UTC)</th><th class="n">Adoption</th></tr></thead>
<tbody>
<tr><td class="name">Become a Brainrot</td><td><code>9963622286</code></td><td><span class="ver">v608</span></td><td>04 Sep 12:17:52</td><td class="n">100% by 05 Sep</td></tr>
<tr><td class="name">+1 Banana Monkey Destruction</td><td><code>10399712766</code></td><td><span class="ver">v1246</span></td><td>04 Sep 17:35:02</td><td class="n">100% by 05 Sep</td></tr>
<tr><td class="name">Climb Waterslide and Slide</td><td><code>10030829154</code></td><td><span class="ver">v1719</span> + 6 sub-places</td><td>04 Sep 19:12:51</td><td class="n">100% by 05 Sep</td></tr>
<tr><td class="name">Verity Companion [AI]</td><td><code>10565445771</code></td><td><span class="ver">v684</span></td><td>04 Sep 19:40:46</td><td class="n">100% by 07 Sep</td></tr>
<tr><td class="name">Seal A Driveway</td><td><code>10638354731</code></td><td><span class="ver">v914</span></td><td>04 Sep 20:22:33</td><td class="n">100% by 05 Sep</td></tr>
</tbody></table></div>
<p>Verity is the one game where later builds land inside the read window: <span class="ver">v688</span> on 6 September and <span class="ver">v689</span> / <span class="ver">v690</span> on 8 September. Only 5 September is a clean <span class="ver">v684</span> day on that game.</p>

<h2>Daily active users, indexed</h2>
<p>Each game's DAU divided by its own value on 25 August, so five games of very different size share one axis and every line starts at 100. The dashed rule is the 4 September publish. <strong>Colour runs green to red on where each game ended</strong> &mdash; green is holding its level, red is the deepest drop &mdash; so the line colour is the verdict on the level, and the name and number at the right tell you which game is which.</p>
<div class="tablewrap" style="padding:10px 12px 4px">${indexedChart()}</div>

<h2>All five, matched weekdays</h2>
<p>Each cell is the mean of <strong>5, 6 and 7 September</strong>, with the change underneath against <strong>29, 30 and 31 August</strong> &mdash; Friday, Saturday and Sunday on both sides, so the weekday mix is identical in the two windows and neither contains the publish day. A change under 2% is greyed rather than called flat. Each game's own report carries the same comparison per metric plus a full week-over-week table.</p>
<div class="tablewrap"><table>
<caption>5&ndash;7 Sep mean, and the change against 29&ndash;31 Aug</caption>
<thead><tr><th>Metric</th>${ORDER.map((id) => `<th class="n">${esc(GAMES[id].short.replace(/^\+1 /, "").replace(" Companion [AI]", "").replace("Climb ", "").replace(" and Slide", ""))}</th>`).join("")}</tr></thead>
<tbody>${cmp}</tbody></table></div>

<div class="note">
  <span class="lbl">One gap in that table, stated rather than hidden</span>
  <p>Waterslide holds <strong>60</strong> of the 75 metrics the other four have, and <code>PeakConcurrentPlayers</code> is one of the missing ones, so its concurrents cell reads &ldquo;not held&rdquo; rather than zero. An absent metric and a metric reading zero are different things and the panel keeps them different.</p>
</div>

<h2>The five reports</h2>
<div class="gamelist">${cards}</div>

<footer>Five universes &middot; browser grab 09 Sep 2026, 12:05&ndash;12:16 UTC &middot; behavioural metrics settled to 07 Sep, technical to 08 Sep.</footer>
</div>`;

fs.writeFileSync(path.join(OUT, "cover.html"), html);
console.log("wrote " + path.join(OUT, "cover.html"));
