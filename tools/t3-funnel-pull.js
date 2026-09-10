// FunnelCohortCompletionRate at OneDay — the ONLY funnel series that dates a
// break, and what tripwires 13-15 are set on. Same discipline as funnels.js:
// poll the 202, no FunnelName filter, retry an empty answer three times (F23).
const fs = require("fs");
const KEY = fs.readFileSync("C:/Users/bfhdh/Desktop/rbx-analytics-grabber-test/web/.opencloud-key", "utf8").trim();
const BASE = "https://apis.roblox.com/analytics-query-api";
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function once(u, body) {
  const r = await fetch(`${BASE}/v1/universes/${u}/metrics`, { method: "POST",
    headers: { "x-api-key": KEY, "content-type": "application/json" }, body: JSON.stringify(body) });
  const txt = await r.text();
  if (r.status === 429) return { retry: true, note: "429" };
  let j; try { j = JSON.parse(txt); } catch { return { error: "nonjson: " + txt.slice(0, 160) }; }
  if (!r.ok) return { error: `${r.status}: ${(j.error && j.error.message) || txt.slice(0, 160)}` };
  let polls = 0;
  while (j.done === false && j.path && polls < 120) {
    await sleep(1500);
    const p = await fetch(`${BASE}/${j.path.replace(/^\//, "")}`, { headers: { "x-api-key": KEY } });
    j = await p.json(); polls++;
  }
  if (j.done === false) return { retry: true, note: "not done after 120 polls" };
  return { values: (j.response && j.response.values) || j.values || [] };
}
async function query(u, body, label) {
  for (let a = 1; a <= 3; a++) {
    const r = await once(u, body);
    if (r.error) { console.log(`  ${label}: ERROR ${r.error}`); return r; }
    if (!r.retry && r.values.length) { console.log(`  ${label}: ${r.values.length} series`); return r; }
    if (!r.retry && !r.values.length && a === 3) { console.log(`  ${label}: genuinely EMPTY after 3`); return r; }
    console.log(`  ${label}: attempt ${a} -> ${r.retry ? r.note : "0 series"}, retrying`);
    await sleep(6000);
  }
  return { values: [] };
}
(async () => {
  const u = process.argv[2];
  const START = process.argv[3] || "2026-08-18T00:00:00Z", END = process.argv[4] || "2026-09-01T00:00:00Z";
  console.log(`=== ${u} · FunnelCohortCompletionRate OneDay · ${START.slice(0,10)} -> ${END.slice(0,10)} (end exclusive)`);
  const res = await query(u, { metric: "FunnelCohortCompletionRate", granularity: "OneDay", startTime: START, endTime: END, breakdown: ["FunnelStep"], limit: 500 }, "cohort/day");
  const days = new Set(); const rows = new Map();
  for (const v of (res.values || [])) {
    const b = (v.breakdowns || [])[0] || {};
    const idx = Number(b.value), label = b.displayValue || b.value;
    const m = new Map();
    for (const p of (v.dataPoints || [])) { const d = String(p.time).slice(0, 10); days.add(d); m.set(d, p.value); }
    rows.set(idx, { label, m });
  }
  const D = [...days].sort();
  if (!rows.size) { console.log("  no series"); return; }
  console.log("  " + "step".padEnd(24) + D.map(d => d.slice(5).padStart(8)).join(""));
  for (const k of [...rows.keys()].sort((a, b) => a - b)) {
    const r = rows.get(k);
    console.log("  " + `${k} ${r.label}`.padEnd(24) + D.map(d => { const v = r.m.get(d); return v == null ? "—" : (v * 100).toFixed(1); }).map(s => s.padStart(8)).join(""));
  }
})();
