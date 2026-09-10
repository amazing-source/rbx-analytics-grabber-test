// Half-hour ErrorCount profile for named days — separates a SPIKE (a few
// buckets) from a STEP (every bucket up). Reads Open Cloud directly; the corpus
// half-hour rows are 77% FILLED_ZERO fiction (F18). Final bucket dropped (F19).
//
//   node tools/halfhour-profile.js <universe> <placeId> <dayA> <dayB> [dayC]
const fs = require("fs");
const KEY = fs.readFileSync(__dirname + "/../web/.opencloud-key", "utf8").trim();
const BASE = "https://apis.roblox.com/analytics-query-api";
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function once(universe, body) {
  const r = await fetch(`${BASE}/v1/universes/${universe}/metrics`, {
    method: "POST", headers: { "x-api-key": KEY, "content-type": "application/json" },
    body: JSON.stringify(body) });
  const txt = await r.text();
  if (r.status === 429) return { retry: true };
  let j; try { j = JSON.parse(txt); } catch { return { error: "nonjson" }; }
  if (!r.ok) return { error: `${r.status}: ${(j.error && j.error.message) || ""}` };
  let polls = 0;
  while (j.done === false && j.path && polls < 120) {
    await sleep(1500);
    const p = await fetch(`${BASE}/${j.path.replace(/^\//, "")}`, { headers: { "x-api-key": KEY } });
    j = await p.json(); polls++;
  }
  return { values: (j.response && j.response.values) || j.values || [] };
}
async function query(u, b, l) {
  for (let i = 1; i <= 3; i++) {
    const r = await once(u, b);
    if (r.error) { console.log(`  ${l}: ERROR ${r.error}`); return { values: [] }; }
    if (!r.retry && r.values.length) return r;
    if (!r.retry && i === 3) return r;
    await sleep(6000);
  }
  return { values: [] };
}

const [, , universe, place, ...days] = process.argv;

(async () => {
  const r = await query(universe, {
    metric: "ErrorCount", granularity: "HalfHour",
    startTime: days[0] + "T00:00:00Z", endTime: "2026-08-31T00:00:00Z",
    filter: [{ dimension: "Place", values: [place], operation: "In" }], limit: 5000,
  }, "ErrorCount");
  const E = {};
  for (const v of (r.values || [])) for (const p of (v.dataPoints || [])) {
    const t = p.time.replace("+00:00", "Z");
    E[t] = (E[t] || 0) + p.value;
  }
  const drop = Object.keys(E).sort().at(-1);
  const slots = [];
  for (let h = 0; h < 17; h++) for (const m of ["00", "30"]) slots.push(String(h).padStart(2, "0") + ":" + m);
  console.log(`\nuniverse ${universe} — half-hour ErrorCount (dropped final bucket ${drop})\n`);
  console.log("| slot | " + days.join(" | ") + " | ratio last/first |");
  console.log("|" + "---|".repeat(days.length + 2));
  for (const s of slots) {
    const vals = days.map(d => E[`${d}T${s}:00Z`]);
    if (vals.every(v => v == null)) continue;
    const ratio = (vals[0] && vals.at(-1)) ? (vals.at(-1) / vals[0]).toFixed(2) + "x" : "—";
    console.log(`| ${s} | ` + vals.map(v => v == null ? "—" : Math.round(v).toLocaleString()).join(" | ") + ` | ${ratio} |`);
  }
})();
