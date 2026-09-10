// The three post-update reads the corpus grab cannot give you:
//   1. Waterslide per-place ErrorCount INCLUDING Omatsuri — the seventh place
//      the grab plan still misses (lastDiscovered() returns the corpus list
//      unconditionally when one exists, so a place added later never enters).
//   2. DailyRevenue by RevenueSource — Verity tripwire 1, Seal tripwire 1.
//   3. Version adoption per PlaceVersion, to confirm the new build is live.
const fs = require("fs");
const KEY = fs.readFileSync(__dirname + "/../web/.opencloud-key", "utf8").trim();
const BASE = "https://apis.roblox.com/analytics-query-api";
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function once(universe, body) {
  const r = await fetch(`${BASE}/v1/universes/${universe}/metrics`, {
    method: "POST", headers: { "x-api-key": KEY, "content-type": "application/json" },
    body: JSON.stringify(body) });
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
    if (r.error) { console.log(`  ${label}: ERROR ${r.error}`); return { values: [] }; }
    if (!r.retry && r.values.length) return r;
    if (!r.retry && attempt === 3) { console.log(`  ${label}: genuinely EMPTY after 3 attempts`); return r; }
    console.log(`  ${label}: attempt ${attempt} gave ${r.retry ? r.note : "0 series"} — retrying`);
    await sleep(6000);
  }
  return { values: [] };
}
const bd = v => { const b = (v.breakdowns || [])[0] || {}; return b.displayValue || b.value || "total"; };

const START = "2026-08-25T00:00:00Z", END = "2026-08-31T00:00:00Z";

const WS_PLACES = {
  "139617346573330": "ROOT Climb Waterslide", "109025676702094": "Forest",
  "111157217779261": "Ice", "100407536317236": "Soccer Stadium",
  "87388097381958": "Desert", "94401613935841": "Hawaii",
  "128451475320872": "Omatsuri  <-- NOT IN THE GRAB PLAN",
};

(async () => {
  console.log("\n######## 1. Waterslide ErrorCount per place (all seven) ########");
  const rows = {};
  for (const [pid, nm] of Object.entries(WS_PLACES)) {
    const r = await query("10030829154", {
      metric: "ErrorCount", granularity: "OneDay", startTime: START, endTime: END,
      filter: [{ dimension: "Place", values: [pid], operation: "In" }], limit: 200,
    }, nm);
    rows[nm] = {};
    for (const v of (r.values || [])) for (const p of (v.dataPoints || [])) rows[nm][p.time.slice(0, 10)] = p.value;
    await sleep(2500);
  }
  const days = [...new Set(Object.values(rows).flatMap(o => Object.keys(o)))].sort();
  console.log("\n| place | " + days.map(d => d.slice(5)).join(" | ") + " |");
  console.log("|" + "---|".repeat(days.length + 1));
  for (const [nm, o] of Object.entries(rows)) {
    console.log(`| ${nm} | ` + days.map(d => o[d] == null ? "—" : Math.round(o[d]).toLocaleString()).join(" | ") + " |");
  }

  console.log("\n\n######## 2. DailyRevenue by RevenueSource ########");
  for (const [id, nm] of [["10565445771", "Verity"], ["10638354731", "Seal"]]) {
    console.log(`\n--- ${nm} (${id}) ---`);
    const r = await query(id, {
      metric: "DailyRevenue", granularity: "OneDay", startTime: START, endTime: END,
      breakdown: ["RevenueSource"], limit: 200,
    }, nm);
    const byS = {};
    for (const v of (r.values || [])) {
      const n = bd(v); byS[n] = byS[n] || {};
      for (const p of (v.dataPoints || [])) byS[n][p.time.slice(0, 10)] = p.value;
    }
    const ds = [...new Set(Object.values(byS).flatMap(o => Object.keys(o)))].sort();
    if (!ds.length) { console.log("  (no series)"); continue; }
    console.log("| source | " + ds.map(d => d.slice(5)).join(" | ") + " |");
    console.log("|" + "---|".repeat(ds.length + 1));
    const tot = {};
    for (const d of ds) tot[d] = Object.values(byS).reduce((s, o) => s + (o[d] || 0), 0);
    for (const [n, o] of Object.entries(byS)) {
      console.log(`| ${n} | ` + ds.map(d => o[d] == null ? "—" : Math.round(o[d]).toLocaleString()).join(" | ") + " |");
    }
    console.log(`| **TOTAL** | ` + ds.map(d => Math.round(tot[d]).toLocaleString()).join(" | ") + " |");
    for (const [n, o] of Object.entries(byS)) {
      console.log(`  share ${n}: ` + ds.map(d => tot[d] ? d.slice(5) + "=" + ((o[d] || 0) / tot[d] * 100).toFixed(1) + "%" : "").join("  "));
    }
    await sleep(2500);
  }

  console.log("\n\n######## 3. Version adoption — ErrorCount by PlaceVersion ########");
  for (const [id, place, nm] of [
    ["10399712766", "83256791430098", "Banana Monkey (expect v1244)"],
    ["10565445771", "74542317333958", "Verity (expect v679)"],
    ["10030829154", "139617346573330", "Waterslide (expect v1716)"],
    ["10638354731", "120014184236770", "Seal (expect v908)"],
  ]) {
    console.log(`\n--- ${nm} ---`);
    const r = await query(id, {
      metric: "ErrorCount", granularity: "OneDay", startTime: "2026-08-28T00:00:00Z", endTime: END,
      filter: [{ dimension: "Place", values: [place], operation: "In" }],
      breakdown: ["PlaceVersion"], limit: 200,
    }, nm);
    const byV = {};
    for (const v of (r.values || [])) {
      const n = bd(v); byV[n] = byV[n] || {};
      for (const p of (v.dataPoints || [])) byV[n][p.time.slice(0, 10)] = p.value;
    }
    const ds = [...new Set(Object.values(byV).flatMap(o => Object.keys(o)))].sort();
    const totals = {};
    for (const d of ds) totals[d] = Object.values(byV).reduce((s, o) => s + (o[d] || 0), 0);
    for (const [n, o] of Object.entries(byV).sort((a, b) => Number(b[0]) - Number(a[0])).slice(0, 8)) {
      console.log(`  v${n}: ` + ds.map(d => `${d.slice(5)}=${Math.round(o[d] || 0).toLocaleString()} (${totals[d] ? ((o[d] || 0) / totals[d] * 100).toFixed(1) : "0"}%)`).join("  "));
    }
    await sleep(2500);
  }
})();
