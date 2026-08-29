// Funnels via Open Cloud. Two rules that are easy to get wrong and both return
// an empty series when broken: poll the 202 (these are async), and send NO
// FunnelName filter (it is accepted and matches nothing, always).
const fs = require("fs");
const KEY = fs.readFileSync("C:/Users/bfhdh/Desktop/rbx-analytics-grabber-test/web/.opencloud-key", "utf8").trim();
const BASE = "https://apis.roblox.com/analytics-query-api";
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function once(universe, body) {
  const r = await fetch(`${BASE}/v1/universes/${universe}/metrics`, {
    method: "POST", headers: { "x-api-key": KEY, "content-type": "application/json" }, body: JSON.stringify(body) });
  const txt = await r.text();
  if (r.status === 429) return { retry: true, note: "429" };
  let j; try { j = JSON.parse(txt); } catch { return { error: "nonjson: " + txt.slice(0, 200) }; }
  if (!r.ok) return { error: `${r.status}: ${(j.error && j.error.message) || txt.slice(0, 200)}` };
  let polls = 0;
  while (j.done === false && j.path && polls < 120) {          // 120 x 1.5s = 3 min
    await sleep(1500);
    const p = await fetch(`${BASE}/${j.path.replace(/^\//, "")}`, { headers: { "x-api-key": KEY } });
    j = await p.json(); polls++;
  }
  if (j.done === false) return { retry: true, note: "still not done after 120 polls" };
  return { values: (j.response && j.response.values) || j.values || [] };
}

// A zero-length result is retried — an empty series is never accepted on the
// first answer, because "async not finished" and "no data" look identical.
async function query(universe, body, label) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const r = await once(universe, body);
    if (r.error) { console.log(`  ${label}: ERROR ${r.error}`); return { error: r.error }; }
    if (!r.retry && r.values.length) { console.log(`  ${label}: ${r.values.length} series`); return r; }
    if (!r.retry && !r.values.length && attempt === 3) { console.log(`  ${label}: genuinely EMPTY after 3 attempts`); return r; }
    console.log(`  ${label}: attempt ${attempt} gave ${r.retry ? r.note : "0 series"} - retrying`);
    await sleep(6000);
  }
  return { values: [] };
}

const START = "2026-08-14T00:00:00Z", END = "2026-08-29T00:00:00Z";
const ROOT = "C:/Users/bfhdh/Desktop/rbx-analytics-grabber-test/";
const games = [
  { id: "9963622286", name: "Become a Brainrot", out: "baseline/2026-08-28T1500Z-9963622286-become-a-brainrot-v606-v607/funnels-pre-update.md" },
  { id: "10399712766", name: "+1 Banana Monkey Destruction", out: "baseline/2026-08-28T1400Z-10399712766-banana-monkey-destruction-v1244/funnels-pre-update.md" },
];

(async () => {
  const dump = {};
  for (const g of games) {
    console.log(`\n=== ${g.name} (${g.id})`);
    const L = [];
    L.push(`# Funnels before the update - ${g.name} (${g.id})`, "");
    L.push(`Pulled from Open Cloud on 2026-08-28, window ${START.slice(0, 10)} to ${END.slice(0, 10)} (exclusive).`, "");
    L.push("**How, because the shape is the whole difficulty.** `granularity: \"None\"` for the");
    L.push("step metrics, `breakdown: [\"FunnelStep\"]`, and **no `FunnelName` filter** - that filter");
    L.push("is accepted and returns zero series always. These queries answer **HTTP 202**; the");
    L.push("result only exists after polling the returned `path`. Both faults return an empty");
    L.push("series, which reads exactly like a game with no funnels instrumented. This run");
    L.push("retried every empty answer three times before recording it as empty.", "");
    L.push("**Caveat that limits every number here:** with no working `FunnelName` filter the");
    L.push("steps come back **merged across all funnels, keyed by index**. Step *names* and");
    L.push("*volumes* are sound and the daily trend is sound; a merged completion rate is a");
    L.push("blend across funnels and must never be quoted as one funnel's rate.", "");

    const totals = await query(g.id, { metric: "FunnelUserTotalCount", granularity: "None", startTime: START, endTime: END, breakdown: ["FunnelStep"], limit: 500 }, "FunnelUserTotalCount");
    await sleep(2500);
    const churn = await query(g.id, { metric: "FunnelUserChurnRate", granularity: "None", startTime: START, endTime: END, breakdown: ["FunnelStep"], limit: 500 }, "FunnelUserChurnRate");
    await sleep(2500);
    const stepc = await query(g.id, { metric: "FunnelUserStepCompletionRate", granularity: "None", startTime: START, endTime: END, breakdown: ["FunnelStep"], limit: 500 }, "FunnelUserStepCompletionRate");
    await sleep(2500);
    const daily = await query(g.id, { metric: "FunnelCohortCompletionRate", granularity: "OneDay", startTime: START, endTime: END, breakdown: ["FunnelStep"], limit: 500 }, "FunnelCohortCompletionRate (OneDay)");

    const name = v => { const b = (v.breakdowns || [])[0] || {}; return { idx: Number(b.value), label: b.displayValue || b.value }; };
    const first = v => (v.dataPoints || [])[0] ? v.dataPoints[0].value : null;
    const rows = new Map();
    for (const v of (totals.values || [])) { const n = name(v); rows.set(n.idx, { ...n, users: first(v) }); }
    for (const v of (churn.values || [])) { const n = name(v); rows.set(n.idx, { ...(rows.get(n.idx) || n), churn: first(v) }); }
    for (const v of (stepc.values || [])) { const n = name(v); rows.set(n.idx, { ...(rows.get(n.idx) || n), stepc: first(v) }); }

    L.push("## Steps (merged across funnels, by index)", "");
    if (!rows.size) L.push("_No step series returned after three attempts._", "");
    else {
      L.push("| # | Step | Users | Step completion | Churn |", "|---|---|---|---|---|");
      for (const k of [...rows.keys()].sort((a, b) => a - b)) {
        const r = rows.get(k);
        const pct = x => x == null ? "-" : (x * 100).toFixed(2) + "%";
        L.push(`| ${k} | \`${r.label}\` | ${r.users == null ? "-" : r.users.toLocaleString("en-US")} | ${pct(r.stepc)} | ${pct(r.churn)} |`);
      }
      L.push("");
    }

    const byStep = {};
    for (const v of (daily.values || [])) {
      const n = name(v);
      byStep[n.label] = {};
      for (const p of (v.dataPoints || [])) byStep[n.label][p.time.slice(0, 10)] = p.value;
    }
    L.push("## Daily completion rate per step - the tripwire baseline", "");
    const dates = [...new Set(Object.values(byStep).flatMap(o => Object.keys(o)))].sort().slice(-8);
    if (!dates.length) L.push("_`FunnelCohortCompletionRate` at OneDay returned no series after three attempts._", "");
    else {
      L.push("| Step | " + dates.map(d => d.slice(5)).join(" | ") + " | 7d mean |", "|" + "---|".repeat(dates.length + 2));
      for (const s of Object.keys(byStep)) {
        const vals = dates.map(d => byStep[s][d]);
        const seen = vals.filter(v => v != null);
        const mean = seen.length ? seen.reduce((a, b) => a + b, 0) / seen.length : null;
        L.push(`| \`${s}\` | ` + vals.map(v => v == null ? "-" : (v * 100).toFixed(1) + "%").join(" | ") +
          ` | **${mean == null ? "-" : (mean * 100).toFixed(1) + "%"}** |`);
      }
      L.push("");
      L.push("**Tripwire:** any step whose daily rate falls more than **5 pp** below its own");
      L.push("7-day mean above, on a settled post-update day, is a broken step - and the step");
      L.push("name says where in the loop it broke.", "");
    }
    L.push(`_Pulled ${new Date().toISOString().slice(0, 19)}Z._`, "");
    fs.writeFileSync(ROOT + g.out, L.join("\n"));
    dump[g.id] = { totals: totals.values || [], churn: churn.values || [], stepc: stepc.values || [], daily: daily.values || [] };
    console.log(`  wrote ${g.out} - ${rows.size} steps, ${Object.keys(byStep).length} daily step series`);
    await sleep(3000);
  }
  fs.writeFileSync(process.argv[2], JSON.stringify(dump, null, 1));
})();
