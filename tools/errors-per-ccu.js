// Errors per concurrent player on MATCHED half-hour slots — the tripwire shape
// each 2026-08-28 BASELINE.md pre-registered.
//
//   node tools/errors-per-ccu.js [slotEnd]        # default 11:00
//
// Raw error counts across a publish are meaningless because the population
// changes; this divides half-hour ErrorCount by half-hour PeakConcurrentPlayers
// over the same elapsed slots on every day compared.
//
// Reads Open Cloud DIRECTLY and never the corpus CSVs: 77% of the half-hour rows
// in metrics/*.csv are FILLED_ZERO standing in for values the gateway never
// served, and they bias a baseline downward (F18). The final bucket is dropped
// always — PCU duplicates its previous value into it (F19).
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

const SLOT_END = process.argv[2] || "11:00";
const START = "2026-08-26T00:00:00Z", END = "2026-09-02T00:00:00Z";
const games = [
  { id: "10399712766", place: "83256791430098", name: "Banana Monkey", base: null },
  { id: "10565445771", place: "74542317333958", name: "Verity Companion", base: 168.3 },
  { id: "10030829154", place: "139617346573330", name: "Climb Waterslide", base: 578.0 },
  { id: "10638354731", place: "120014184236770", name: "Seal A Driveway", base: 1163.3 },
];

const flat = vals => {
  const out = {};
  for (const v of vals) for (const p of (v.dataPoints || [])) {
    const t = p.time.replace("+00:00", "Z");
    out[t] = (out[t] || 0) + p.value;
  }
  return out;
};

(async () => {
  for (const g of games) {
    console.log(`\n=== ${g.name} (${g.id}) — errors / CCU, slots 00:00-${SLOT_END} UTC ===`);
    const errs = await query(g.id, {
      metric: "ErrorCount", granularity: "HalfHour", startTime: START, endTime: END,
      filter: [{ dimension: "Place", values: [g.place], operation: "In" }], limit: 5000,
    }, "ErrorCount");
    await sleep(2500);
    const ccu = await query(g.id, {
      metric: "PeakConcurrentPlayers", granularity: "HalfHour", startTime: START, endTime: END,
      filter: [{ dimension: "Place", values: [g.place], operation: "In" }], limit: 5000,
    }, "PeakConcurrentPlayers");

    const E = flat(errs.values || []), C = flat(ccu.values || []);
    // drop the newest bucket overall — PCU carries its previous value into it (F19)
    const allTs = [...new Set([...Object.keys(E), ...Object.keys(C)])].sort();
    const dropped = allTs.at(-1);

    const days = {};
    for (const ts of allTs) {
      if (ts === dropped) continue;
      const [d, hm] = [ts.slice(0, 10), ts.slice(11, 16)];
      if (hm > SLOT_END) continue;
      days[d] = days[d] || { e: 0, c: [], slots: 0 };
      if (E[ts] != null) days[d].e += E[ts];
      if (C[ts] != null) { days[d].c.push(C[ts]); }
      days[d].slots++;
    }
    console.log(`  (dropped final bucket ${dropped})`);
    console.log("| day | errors | mean CCU | errors/CCU | vs 08-27 | slots |");
    console.log("|---|---|---|---|---|---|");
    const ref = days["2026-08-27"];
    const refR = ref && ref.c.length ? ref.e / (ref.c.reduce((a, b) => a + b, 0) / ref.c.length) : null;
    for (const d of Object.keys(days).sort()) {
      const x = days[d];
      const mc = x.c.length ? x.c.reduce((a, b) => a + b, 0) / x.c.length : null;
      const r = mc ? x.e / mc : null;
      const vs = (r && refR) ? (((r - refR) / refR) * 100).toFixed(1) + "%" : "—";
      console.log(`| ${d} | ${x.e.toLocaleString()} | ${mc ? Math.round(mc).toLocaleString() : "—"} | ${r ? r.toFixed(1) : "—"} | ${vs} | ${x.slots} |`);
    }
    if (g.base) console.log(`  baseline (frozen 08-27) = ${g.base}`);
    await sleep(3000);
  }
})();
