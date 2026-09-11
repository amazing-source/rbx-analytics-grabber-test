const fs = require("fs");
let r = fs.readFileSync(__dirname + "/render.js", "utf8");

r = r.replace('const { lineChart, deltaBars, esc, sgn } = require("./chart.js");',
              'const { lineChart, deltaBars, spark, esc, sgn } = require("./chart.js");');

// unit-aware formatter driven by the metric list, not by decimal count
r = r.replace(/const UNIT = \{[\s\S]*?\nfunction fmtMetric\(m, v\) \{[\s\S]*?\n\}/,
`function fmtMetric(m, v) {
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
}`);

// severity now respects `lower` (a fall in bounce or rejection is good)
r = r.replace(/function severity\(m\) \{[\s\S]*?\n\}/,
`function severity(m) {
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
}`);

// grouped table, every metric, with the 3 Sep -> D+7 daily path
r = r.replace(/function movedTable\(game\) \{[\s\S]*?\n\}\n/,
`function movedTable(game) {
  const groups = [...new Set(game.metrics.map(m => m.group))];
  return groups.map(gr => {
    const rows = game.metrics.filter(m => m.group === gr).map(m => {
      const lvl = severity(m);
      const cls = lvl === "good" ? "up" : (lvl === "neutral" ? "" : "dn");
      const change = m.signFlip
        ? \`<span class="muted">\${fmtMetric(m, m.before)} → \${fmtMetric(m, m.after)}</span>\`
        : \`<span class="\${cls}">\${sgn(m.delta)}</span>\`;
      return \`<tr>
        <td>\${esc(m.label)}\${m.lower ? ' <span class="hint">lower is better</span>' : ""}</td>
        <td class="num">\${fmtMetric(m, m.before)}</td>
        <td class="num">\${fmtMetric(m, m.after)}</td>
        <td class="num">\${change}</td>
        <td class="spark">\${spark(m.run, { lower: m.lower })}</td>
        <td>\${m.lag ? \`<span class="chip chip--flat">to \${m.lag.slice(5)}</span>\` : ""}</td></tr>\`;
    }).join("");
    return \`<h3 style="margin-top:26px">\${esc(gr)}</h3>
      <div class="scroll"><table>
        <thead><tr><th>Metric</th><th class="num">3–4 Sep</th><th class="num">D+7</th>
          <th class="num">Change</th><th>3 Sep → 11 Sep</th><th></th></tr></thead>
        <tbody>\${rows}</tbody></table></div>\`;
  }).join("");
}
`);

// tiles pull from the new metric names
r = r.replace(/const want = \[[^\]]*\];/,
  'const want = ["PeakConcurrentPlayers","ForwardD1Retention","RFYDuration0To60","RFYDuration61To180","RFYD2To7PlayDays","RFYUniqueNotInterestedUsersPerMillionImpressions"];');

// delta bars: rates only, now selected by unit rather than a kind flag
r = r.replace(/const rows = game\.metrics\.filter\(\(m\) => m\.kind === "rate"\)/,
              'const rows = game.metrics.filter((m) => m.unit === "pct" && m.delta != null)');

// styles for the new columns
r = r.replace('.bar{min-width:150px}',
`.bar{min-width:150px}
.spark{padding:4px 13px}
.spark svg{display:block}
.hint{font-family:Archivo,sans-serif; font-size:.62rem; font-weight:600; letter-spacing:.06em;
  text-transform:uppercase; color:var(--ink-3); margin-left:6px; white-space:nowrap}`);

fs.writeFileSync(__dirname + "/render.js", r);
console.log("table + severity + formatter patched");
