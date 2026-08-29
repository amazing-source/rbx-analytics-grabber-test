// Deploy log from ErrorCount broken down by PlaceVersion, with Place as a
// FILTER (as a breakdown, the API answers 200 and silently drops PlaceVersion).
// This is Roblox's own key-authenticated second source for dating a ship;
// develop.roblox.com/v1/assets/<place>/saved-versions returns 401 without a
// session cookie, so it is not available on the Open Cloud path.
//
//   node tools/deploy-log.js <universe> <placeId> <outFile> "<game name>" [dayStart] [end]
//
// A version whose first point falls on the window start is LEFT-CENSORED — it
// shipped on or before that date. Widen the window before quoting a ship date.
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
  if (j.done === false) return { retry: true, note: "still not done after 120 polls" };
  return { values: (j.response && j.response.values) || j.values || [] };
}

// An empty answer is retried before it is believed. These queries are async, so
// "the poll never finished" and "this game has no data" look identical — and a
// silently empty deploy log is a false record, not a missing one. Measured
// 2026-08-28: the first run of this query returned 0 versions; the identical
// rerun returned 25.
async function query(universe, body, label) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const r = await once(universe, body);
    if (r.error) throw new Error(`${label}: ${r.error}`);
    if (!r.retry && r.values.length) return r.values;
    if (!r.retry && attempt === 3) {
      throw new Error(`${label}: empty after 3 attempts — refusing to write an empty deploy log. ` +
        `Check the window and the Place filter before believing this.`);
    }
    console.log(`  ${label}: attempt ${attempt} gave ${r.retry ? r.note : "0 series"} — retrying`);
    await sleep(6000);
  }
}

const [, , universe, place, outFile, gameName,
  DAY_START = "2026-08-01T00:00:00Z", END = "2026-08-29T00:00:00Z"] = process.argv;
const HH_START = new Date(new Date(END).getTime() - 2 * 86400000).toISOString().replace(/\.\d+Z$/, "Z");

function group(values) {
  const by = new Map();
  for (const v of values) {
    const ver = Number((v.breakdowns || []).find(b => b.dimension === "PlaceVersion")?.value);
    const pts = (v.dataPoints || []).filter(p => p.value).sort((a, b) => a.time.localeCompare(b.time));
    if (!pts.length) continue;
    by.set(ver, { v: ver, first: pts[0].time, last: pts.at(-1).time, n: pts.length,
                  total: pts.reduce((s, p) => s + p.value, 0) });
  }
  return [...by.values()].sort((a, b) => a.v - b.v);
}

(async () => {
  const base = { filter: [{ dimension: "Place", values: [place], operation: "In" }],
                 breakdown: ["PlaceVersion"], limit: 300 };
  const days = group(await query(universe,
    { metric: "ErrorCount", granularity: "OneDay", startTime: DAY_START, endTime: END, ...base }, "OneDay"));
  await sleep(2500);
  const hh = group(await query(universe,
    { metric: "ErrorCount", granularity: "HalfHour", startTime: HH_START, endTime: END, ...base }, "HalfHour"));

  const n = x => x.toLocaleString("en-US").replace(/,/g, " ");
  const L = [];
  L.push(`# Deploy log — ${gameName} (${universe})`, "");
  L.push("Reconstructed from `ErrorCount` broken down by `PlaceVersion` with `Place` as a",
    "FILTER — Roblox's own key-authenticated second source for dating a ship.",
    "`develop.roblox.com/v1/assets/<place>/saved-versions` returns **HTTP 401** without a",
    "session cookie, so it was not available on this pass (checked, not assumed).", "");
  L.push("**Caveats.** A version that emitted zero errors is invisible to this method. A version",
    "whose first point falls on the window start is LEFT-CENSORED — read it as \"on or before\".",
    `Daily window starts ${DAY_START.slice(0, 10)}.`, "");
  L.push(`## Daily — ${DAY_START.slice(0, 10)} → ${END.slice(0, 10)} (exclusive)`, "");
  L.push("| version | first seen | last seen | days live | errors |", "|---|---|---|---|---|");
  for (const r of days) L.push(`| v${r.v} | ${r.first.slice(0, 10)} | ${r.last.slice(0, 10)} | ${r.n} | ${n(r.total)} |`);
  L.push("", `## Half-hour — ${HH_START.slice(0, 10)} → now (dates the publish to the bucket)`, "");
  L.push("| version | first bucket (UTC) | last bucket (UTC) | buckets | errors |", "|---|---|---|---|---|");
  for (const r of hh) L.push(`| v${r.v} | ${r.first.slice(0, 16).replace("T", " ")} | ${r.last.slice(0, 16).replace("T", " ")} | ${r.n} | ${n(r.total)} |`);
  L.push("", `_Pulled ${new Date().toISOString().slice(0, 19)}Z._`, "");
  fs.writeFileSync(outFile, L.join("\n"));
  console.log(`wrote ${outFile} — ${days.length} versions daily, ${hh.length} in the half-hour window`);
})().catch(e => { console.error(String(e.message || e)); process.exit(1); });
