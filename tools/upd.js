// Post-update Open Cloud pass, driven by a config file so it is not rewritten
// per update.  node tools/upd.js <config.json> [section]
//
//   sections: deploy   ErrorCount filtered FirstSeenPlaceVersion >= <ver>
//                      ("errors this deploy introduced" — a deploy artefact
//                      decays across the day boundary, a live defect does not)
//             adopt    ErrorCount by PlaceVersion, daily — version adoption and
//                      an independent deploy log (F12: place-versions truncates)
//             funnels  FunnelCohortCompletionRate by FunnelStep at OneDay
//             all      (default)
//
// Both traps of F22/F23 are handled: funnel queries answer 202 async and must be
// polled, NO FunnelName filter is ever sent, and an empty answer is retried
// three times before it is believed.
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

const cfg = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const section = process.argv[3] || "all";
const { start: START, end: END } = cfg;
const n = x => x.toLocaleString();

function label(v) {
  const b = (v.breakdowns || [])[0] || {};
  return b.displayValue || b.value || "Total";
}

(async () => {
  for (const g of cfg.games) {
    if (section === "all" || section === "deploy") {
      console.log(`\n=== ${g.name} — errors this deploy introduced (FirstSeenPlaceVersion >= ${g.ver}) ===`);
      const r = await query(g.id, {
        metric: "ErrorCount", granularity: "OneDay", startTime: START, endTime: END,
        filter: [
          { dimension: "Place", values: [g.place], operation: "In" },
          { dimension: "FirstSeenPlaceVersion", values: [String(g.ver)], operation: "GreaterThanOrEqual" },
        ], limit: 200,
      }, g.name);
      const byDay = {};
      for (const v of (r.values || [])) for (const p of (v.dataPoints || []))
        byDay[p.time.slice(0, 10)] = (byDay[p.time.slice(0, 10)] || 0) + p.value;
      const days = Object.keys(byDay).sort();
      if (!days.length) console.log("  (no points)");
      for (const d of days) console.log(`  ${d}  ${n(byDay[d])}`);
      await sleep(2500);
    }

    if (section === "all" || section === "adopt") {
      console.log(`\n=== ${g.name} — ErrorCount by PlaceVersion (adoption + deploy log) ===`);
      const r = await query(g.id, {
        metric: "ErrorCount", granularity: "OneDay", startTime: START, endTime: END,
        filter: [{ dimension: "Place", values: [g.place], operation: "In" }],
        breakdown: ["PlaceVersion"], limit: 200,
      }, g.name);
      const rows = [];
      for (const v of (r.values || [])) {
        const pts = (v.dataPoints || []).filter(p => p.value > 0);
        if (!pts.length) continue;
        pts.sort((a, b) => a.time < b.time ? -1 : 1);
        rows.push({ ver: label(v), first: pts[0].time.slice(0, 10), last: pts[pts.length - 1].time.slice(0, 10),
                    total: pts.reduce((s, p) => s + p.value, 0),
                    byDay: Object.fromEntries(pts.map(p => [p.time.slice(0, 10), p.value])) });
      }
      rows.sort((a, b) => Number(b.ver) - Number(a.ver));
      const allDays = [...new Set(rows.flatMap(r => Object.keys(r.byDay)))].sort();
      const recent = allDays.slice(-6);
      console.log(`  version  first-seen   ` + recent.map(d => d.slice(5).padStart(12)).join(""));
      for (const r2 of rows.slice(0, 14))
        console.log(`  ${String(r2.ver).padEnd(8)} ${r2.first}   ` +
          recent.map(d => (r2.byDay[d] ? n(Math.round(r2.byDay[d])) : "—").padStart(12)).join(""));
      // share of the newest days carried by the new build
      for (const d of recent.slice(-3)) {
        const tot = rows.reduce((s, r2) => s + (r2.byDay[d] || 0), 0);
        const nu = rows.filter(r2 => Number(r2.ver) >= g.ver).reduce((s, r2) => s + (r2.byDay[d] || 0), 0);
        if (tot) console.log(`  adoption ${d}: ${(100 * nu / tot).toFixed(1)}% of error events on >= v${g.ver}`);
      }
      await sleep(2500);
    }

    if (section === "all" || section === "funnels") {
      console.log(`\n=== ${g.name} — FunnelCohortCompletionRate by step, daily ===`);
      const r = await query(g.id, {
        metric: "FunnelCohortCompletionRate", granularity: "OneDay",
        startTime: START, endTime: END, breakdown: ["FunnelStep"], limit: 500,
      }, g.name);
      const steps = [];
      for (const v of (r.values || [])) {
        const pts = (v.dataPoints || []);
        if (!pts.length) continue;
        pts.sort((a, b) => a.time < b.time ? -1 : 1);
        steps.push({ name: label(v), byDay: Object.fromEntries(pts.map(p => [p.time.slice(0, 10), p.value])) });
      }
      const allDays = [...new Set(steps.flatMap(s => Object.keys(s.byDay)))].sort();
      const show = allDays.slice(-9);
      console.log(`  step`.padEnd(34) + show.map(d => d.slice(5).padStart(8)).join(""));
      for (const s of steps)
        console.log(`  ${s.name.slice(0, 31).padEnd(32)}` +
          show.map(d => (s.byDay[d] == null ? "—" : (100 * s.byDay[d]).toFixed(1)).padStart(8)).join(""));
      console.log(`  (newest day is UNSTABLE by up to 5.5pp — F25, never fire a tripwire on it)`);
      await sleep(2500);
    }
  }
})();
