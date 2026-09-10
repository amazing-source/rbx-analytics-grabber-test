// Post-update funnel read — daily FunnelCohortCompletionRate per step, printed
// against the pre-update mean each BASELINE.md froze.
//
//   node tools/funnels-post.js
//
// Two rules that both return an empty series when broken: poll the 202 (async),
// and send NO FunnelName filter (accepted, matches nothing, always). Empty
// answers are retried three times — F23.
//
// The newest day is UNSTABLE by up to 5.5 pp and must never fire a tripwire
// (F25); it is printed and marked, never scored.
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

// pre-update means, copied from each baseline's funnels-pre-update.md
const MEANS = {
  "10399712766": { Joined: 100.0, Punched: 96.1, "Collected a Banana": 95.2 },
  "10565445771": {
    Submitted: 100.0, Accepted: 86.1, Delivered: 68.4, "Day 4 Reached": 60.2,
    "First Reply Received": 49.9, "Day 5 Reached": 46.0, "Day 2 Reached": 32.7,
    "Ending Completed": 18.8, "Day 3 Reached": 23.3,
  },
  "10030829154": {
    Tutorial_Main_1_StartSwim: 100.0, Tutorial_Main_2_WaitGetCash: 97.5,
    Tutorial_Main_3_ClickSlide: 94.4, Tutorial_Main_4_WaitSildeEnd: 94.1,
    Tutorial_Main_5_ToRaftShop: 82.1, Tutorial_Main_6_StartSwim: 80.6,
    Tutorial_Main_7_WaitGetCash: 80.3, Tutorial_Main_8_ClickSlide: 77.5,
    Tutorial_Main_9_WaitSildeEnd: 77.3, Tutorial_Main_10_BuyEgg: 66.9,
    Tutorial_Main_11_OpenPetBag: 62.1, Tutorial_Main_12_EquipPet: 55.8,
    Tutorial_Main_13_ClosePetBag: 55.7, Tutorial_Main_14_Final: 55.6,
    Tutorial_Main_15_AddFriendTip: 49.7,
  },
  "10638354731": {
    Neighbourhood: 100.0, ReachedDriveway: 67.0, Complete: 46.5,
    PouredOut: 42.9, DrivewaySealed: 38.0, FirstPass: 39.9,
  },
};

const START = "2026-08-18T00:00:00Z", END = "2026-08-31T00:00:00Z";
const games = [
  ["10399712766", "Banana Monkey"],
  ["10565445771", "Verity Companion"],
  ["10030829154", "Climb Waterslide"],
  ["10638354731", "Seal A Driveway"],
];

const label = v => {
  const b = (v.breakdowns || [])[0] || {};
  return b.displayValue || b.value || "?";
};

(async () => {
  for (const [id, name] of games) {
    console.log(`\n=== ${name} (${id}) — FunnelCohortCompletionRate, OneDay, breakdown FunnelStep ===`);
    const r = await query(id, {
      metric: "FunnelCohortCompletionRate", granularity: "OneDay",
      startTime: START, endTime: END, breakdown: ["FunnelStep"], limit: 500,
    }, name);
    const byStep = {};
    for (const v of (r.values || [])) {
      const n = label(v); byStep[n] = byStep[n] || {};
      for (const p of (v.dataPoints || [])) byStep[n][p.time.slice(0, 10)] = p.value;
    }
    const dates = [...new Set(Object.values(byStep).flatMap(o => Object.keys(o)))].sort();
    if (!dates.length) { console.log("  (no series)"); continue; }
    const show = dates.slice(-7);
    console.log("| Step | " + show.map(d => d.slice(5)).join(" | ") + " | pre-mean | Δ vs mean (last settled) |");
    console.log("|" + "---|".repeat(show.length + 3));
    for (const s of Object.keys(byStep)) {
      const mean = (MEANS[id] || {})[s];
      // last settled = newest day is unstable (F25), so score the one before it
      const scoreDate = show.at(-2);
      const sv = byStep[s][scoreDate];
      const d = (mean != null && sv != null) ? (sv * 100 - mean) : null;
      console.log(`| \`${s}\` | ` + show.map(x => byStep[s][x] == null ? "—" : (byStep[s][x] * 100).toFixed(1) + "%").join(" | ") +
        ` | ${mean == null ? "—" : mean.toFixed(1) + "%"} | ${d == null ? "—" : (d >= 0 ? "+" : "") + d.toFixed(1) + " pp"} |`);
    }
    console.log(`\n  scored day = ${show.at(-2)} (newest day ${show.at(-1)} shown but NOT scored — F25)`);
    await sleep(3000);
  }
})();
