const fs = require("fs");
let r = fs.readFileSync(__dirname + "/render.js", "utf8");

if (!r.includes('ccu.json')) {
  r = r.replace(
    `const C = JSON.parse(fs.readFileSync(path.join(__dirname, "content.json"), "utf8"));`,
    `const C = JSON.parse(fs.readFileSync(path.join(__dirname, "content.json"), "utf8"));
const CCU = JSON.parse(fs.readFileSync(path.join(__dirname, "ccu.json"), "utf8"));`);
}

const block = [
  '/** 11 Sep IS readable for concurrents — matched elapsed slots only. */',
  'function ccuBlock(game) {',
  '  const c = CCU.games[game.id];',
  '  if (!c) return "";',
  '  const up = c.delta >= 0;',
  '  return `<div class="note" style="margin:18px 0">',
  '    <h3>11 September, on concurrents</h3>',
  '    <p>Behavioural data lags about two days, so 11 Sep is blank in the table below.',
  '    <strong>Concurrents are current to the hour</strong>, so the second half of D+7 is readable here: peak',
  '    within the <strong>${c.slots} half-hour slots elapsed so far today</strong> (to ${esc(CCU.cutoff)} UTC),',
  '    against the <em>same</em> slots on 4 September. Comparing a part-day peak with a whole-day peak would',
  '    manufacture a collapse, so it is not done; the final bucket is dropped because it repeats the one before.</p>',
  '    <div class="tiles" style="margin-bottom:0">',
  '      <div class="tile"><b>4 Sep, to ${esc(CCU.cutoff)}</b><u>${Math.round(c.before).toLocaleString("en-US")}</u><i class="muted">peak concurrents</i></div>',
  '      <div class="tile"><b>11 Sep, to ${esc(CCU.cutoff)}</b><u>${Math.round(c.after).toLocaleString("en-US")}</u><i class="muted">peak concurrents</i></div>',
  '      <div class="tile"><b>Change</b><u class="${up?"up":"dn"}">${sgn(c.delta)}</u><i class="muted">matched slots</i></div>',
  '    </div></div>`;',
  '}',
  '',
  'function movedTable(game) {',
].join("\n");

if (!r.includes("function ccuBlock")) {
  r = r.replace("function movedTable(game) {", block);
  r = r.replace("    ${tiles(game)}\n    ${deltaFig(game)}", "    ${tiles(game)}\n    ${ccuBlock(game)}\n    ${deltaFig(game)}");
}

// cover: extra column that reaches 11 Sep
if (!r.includes("CCU 11 Sep")) {
  r = r.replace(
    '<th class="num">Impr→play</th><th class="num">D1</th></tr></thead>',
    '<th class="num">Impr→play</th><th class="num">D1</th><th class="num">CCU 11 Sep</th></tr></thead>');
  r = r.replace(
    '<td class="num ${l==="good"?"up":(l==="neutral"?"":"dn")}">${sgn(d1.delta)}</td></tr>`;',
    '<td class="num ${l==="good"?"up":(l==="neutral"?"":"dn")}">${sgn(d1.delta)}</td>\n' +
    '      <td class="num ${CCU.games[game.id]?(CCU.games[game.id].delta>=0?"up":"dn"):""}">${CCU.games[game.id]?sgn(CCU.games[game.id].delta):"—"}</td></tr>`;');
  r = r.replace(
    'a volume delta across a shrinking audience is not like-for-like.</p>',
    'a volume delta across a shrinking audience is not like-for-like. The last column is the only one reaching\n' +
    '    <strong>11 September</strong> — concurrents are current to the hour, compared on the half-hour slots\n' +
    '    elapsed on both days.</p>');
}

fs.writeFileSync(__dirname + "/render.js", r);
console.log("patched render.js");
