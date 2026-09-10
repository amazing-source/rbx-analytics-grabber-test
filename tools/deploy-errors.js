// "Errors this deploy introduced" — ErrorCount at OneDay filtered to
// FirstSeenPlaceVersion >= <new version>, with Place present.
//
//   node tools/deploy-errors.js
//
// This is the discriminator the error export cannot give you: the export's
// "First seen version" column dates a signature's FIRST appearance, not the only
// build it fires on. A deploy artefact decays across the day boundary; a live
// defect does not. Measured 2026-08-29 — Waterslide >=1715 went 9,826 -> 174
// (fixed by the next publish) while Verity >=678 went 2,069 -> 4,018 (live).
//
// Empty answers are retried: an async query that has not finished is
// indistinguishable from a game with no data (F23).
const fs = require("fs");
const KEY = fs.readFileSync(__dirname + "/../web/.opencloud-key", "utf8").trim();
const BASE = "https://apis.roblox.com/analytics-query-api";
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function once(universe, body) {
  const r = await fetch(`${BASE}/v1/universes/${universe}/metrics`, {
    method: "POST", headers: { "x-api-key": KEY, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const txt = await r.text();
  if (r.status === 429) return { retry: true, note: "429" };
  let j; try { j = JSON.parse(txt); } catch { return { error: "nonjson: " + txt.slice(0, 200) }; }
  if (!r.ok) return { error: `${r.status}: ${(j.error && j.error.message) || txt.slice(0, 200)}` };
  let polls = 0;
  while (j.done === false && j.path && polls < 120) {
    await sleep(1500);
    const p = await fetch(`${BASE}/${j.path.replace(/^\//, "")}`, { headers: { "x-api-key": KEY } });
    j = await p.json(); polls++;
  }
  if (j.done === false) return { retry: true, note: "not done after 120 polls" };
  return { values: (j.response && j.response.values) || j.values || [] };
}

async function query(universe, body, label) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const r = await once(universe, body);
    if (r.error) { console.log(`  ${label}: ERROR ${r.error}`); return { values: [], error: r.error }; }
    if (!r.retry && r.values.length) return r;
    if (!r.retry && attempt === 3) { console.log(`  ${label}: genuinely EMPTY after 3 attempts`); return r; }
    console.log(`  ${label}: attempt ${attempt} gave ${r.retry ? r.note : "0 series"} — retrying`);
    await sleep(6000);
  }
  return { values: [] };
}

const START = "2026-08-26T00:00:00Z", END = "2026-09-01T00:00:00Z";
const games = [
  { id: "10399712766", place: "83256791430098", ver: 1244, name: "Banana Monkey v1244" },
  { id: "10565445771", place: "74542317333958", ver: 678, name: "Verity v678/v679" },
  { id: "10030829154", place: "139617346573330", ver: 1715, name: "Waterslide v1715/v1716" },
  { id: "10030829154", place: "139617346573330", ver: 1716, name: "Waterslide v1716 only" },
  { id: "10638354731", place: "120014184236770", ver: 908, name: "Seal v908" },
];

(async () => {
  for (const g of games) {
    console.log(`\n=== ${g.name} — ErrorCount, FirstSeenPlaceVersion >= ${g.ver} ===`);
    const r = await query(g.id, {
      metric: "ErrorCount", granularity: "OneDay", startTime: START, endTime: END,
      filter: [
        { dimension: "Place", values: [g.place], operation: "In" },
        { dimension: "FirstSeenPlaceVersion", values: [String(g.ver)], operation: "GreaterThanOrEqual" },
      ],
      limit: 200,
    }, g.name);
    const byDay = {};
    for (const v of (r.values || [])) for (const p of (v.dataPoints || [])) {
      byDay[p.time.slice(0, 10)] = (byDay[p.time.slice(0, 10)] || 0) + p.value;
    }
    const days = Object.keys(byDay).sort();
    if (!days.length) console.log("  (no points)");
    for (const d of days) console.log(`  ${d}  ${byDay[d].toLocaleString()}`);
    await sleep(3000);
  }
})();
