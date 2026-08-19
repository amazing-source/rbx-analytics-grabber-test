// Diffs Open Cloud's numbers against the corpus we already hold, cell by cell.
//
//   npm run compare-opencloud -- <universeId> [metric ...]
//
// The probe answered "does Open Cloud SERVE this metric". That is coverage, and
// coverage is not correctness. This answers the only question that licenses us
// to swap data sources: does it return THE SAME NUMBERS as the dashboard
// gateway did? A source that is complete and wrong is worse than one that is
// narrow and right, because nothing downstream will flag it.
//
// Compared on the Total series only (empty breakdown), over the dates both
// sides hold. Rows the exporter synthesised (FILLED_ZERO) and rows marked
// partial are reported separately, never as mismatches: the first is our own
// gap-fill rather than something Roblox said, and the second is a bucket that
// had not finished when we captured it.

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const BASE = "https://apis.roblox.com/analytics-query-api/v1";
const DEFAULT_METRICS = [
  "DailyActiveUsers",
  "PeakConcurrentPlayers",
  "DailyRevenue",
  "AverageRevenuePerUser",
  "ForwardD1Retention",
  "ServerCrashCount",
  "ClientCrashCount",
  "ClientFpsAvg",
  "ErrorCount",
];

function readKey(): string | undefined {
  if (process.env.ROBLOX_API_KEY) return process.env.ROBLOX_API_KEY.trim();
  for (const p of [".opencloud-key", "../.opencloud-key"]) {
    try {
      const v = readFileSync(new URL(p, import.meta.url), "utf8").trim();
      if (v) return v;
    } catch { /* keep looking */ }
  }
  try {
    const v = readFileSync(".opencloud-key", "utf8").trim();
    if (v) return v;
  } catch { /* not there */ }
  return undefined;
}

const key = readKey();
const universe = process.argv[2];
const metrics = process.argv.slice(3).filter((a) => !a.startsWith("-"));
if (!key || !/^\d+$/.test(universe || "")) {
  console.error("usage: npm run compare-opencloud -- <universeId> [metric ...]");
  console.error("(needs web/.opencloud-key or ROBLOX_API_KEY)");
  process.exit(2);
}
const wanted = metrics.length ? metrics : DEFAULT_METRICS;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const repoRoot = path.resolve(process.cwd(), "..");
const metricsDir = path.join(repoRoot, "data", "games", universe, "metrics");

type Local = { values: Map<string, number>; filled: Set<string>; partial: Set<string>; series: string };

// Long format: date,ts,granularity,series,value,status,captured_at,partial
//
// Which row is the headline? "Total" when it exists. When it doesn't, the whole
// Performance tab is Place-scoped — the gateway 400s those metrics without a
// Place filter — and CLAUDE.md is explicit that a Place filter still counts as
// the whole, unlike a population filter. So a single bare `Place=<id>` series is
// a legitimate headline. Two or more, and we refuse rather than pick: that
// fallback to series[0] is what once printed a 30,393-crash incident as "5".
function readLocal(metric: string): Local | null {
  const file = path.join(metricsDir, `${metric}.csv`);
  if (!existsSync(file)) return null;
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  const header = (lines.shift() || "").split(",");
  const iDate = header.indexOf("date");
  const iSeries = header.indexOf("series");
  const iValue = header.indexOf("value");
  const iStatus = header.indexOf("status");
  const iPartial = header.indexOf("partial");

  // Granularity FIRST, before anything else looks at these rows. A metric CSV
  // holds every granularity that was ever grabbed — PeakConcurrentPlayers has
  // one-minute, half-hour and daily rows in one file — and they share the date
  // column. Filtering only by series label lets a half-hour bucket overwrite
  // the daily value for the same date, which is not a small error: it read as
  // an 8x disagreement with Open Cloud that was entirely self-inflicted.
  const iGran = header.indexOf("granularity");
  const rows = lines
    .filter((l) => l.trim())
    .map((l) => l.split(","))
    .filter((c) => (c[iGran] || "").trim() === "METRIC_GRANULARITY_ONE_DAY");
  if (!rows.length) return null;
  const labels = new Set(rows.map((c) => (c[iSeries] || "").trim()));

  let pick = "";
  if (labels.has("Total")) pick = "Total";
  else {
    const placeOnly = [...labels].filter((s) => /^Place=\d+$/.test(s));
    if (placeOnly.length === 1) pick = placeOnly[0];
    else return null; // no unambiguous headline — print nothing rather than guess
  }

  const values = new Map<string, number>();
  const filled = new Set<string>();
  const partial = new Set<string>();
  for (const c of rows) {
    if ((c[iSeries] || "").trim() !== pick) continue;
    const date = c[iDate];
    if (!date) continue;
    if ((c[iPartial] || "").trim()) { partial.add(date); continue; }
    if ((c[iStatus] || "").trim() === "FILLED_ZERO") { filled.add(date); continue; }
    const v = Number(c[iValue]);
    if (Number.isFinite(v)) values.set(date, v);
  }
  return { values, filled, partial, series: pick };
}

async function fetchCloud(metric: string, startTime: string, endTime: string) {
  const res = await fetch(`${BASE}/universes/${universe}/metrics`, {
    method: "POST",
    headers: { "x-api-key": key!, "content-type": "application/json" },
    body: JSON.stringify({ metric, granularity: "OneDay", startTime, endTime }),
  });
  const text = await res.text();
  if (!res.ok) return { error: `HTTP ${res.status}: ${text.slice(0, 400).replace(/\s+/g, " ")}` };
  let body = JSON.parse(text) as Record<string, unknown>;
  if (body.done === false && typeof body.path === "string") {
    for (let i = 0; i < 30 && body.done === false; i++) {
      await sleep(1000);
      const r = await fetch(`https://apis.roblox.com/analytics-query-api/${body.path}`, { headers: { "x-api-key": key! } });
      if (!r.ok) return { error: `poll HTTP ${r.status}` };
      body = (await r.json()) as Record<string, unknown>;
    }
  }
  const response = (body.response ?? {}) as { values?: { breakdowns?: unknown[]; dataPoints?: { time: string; value: number }[] }[] };
  // The headline series is the one with NO breakdown. Never fall back to [0].
  const total = (response.values ?? []).find((v) => !v.breakdowns || v.breakdowns.length === 0);
  const out = new Map<string, number>();
  for (const p of total?.dataPoints ?? []) out.set(p.time.slice(0, 10), p.value);
  return { values: out };
}

console.log(`Open Cloud vs local corpus · universe ${universe}\n`);

let totalCells = 0, totalExact = 0, totalOff = 0;

for (const metric of wanted) {
  const local = readLocal(metric);
  if (!local) { console.log(`—  ${metric.padEnd(30)} no local CSV, skipped`); continue; }
  if (!local.values.size) { console.log(`—  ${metric.padEnd(30)} local CSV has no settled Total rows, skipped`); continue; }

  // Ask Open Cloud for exactly the span the corpus covers, so a difference is
  // never just the two sides looking at different days.
  const dates = [...local.values.keys()].sort();
  const startTime = `${dates[0]}T00:00:00Z`;
  const endDate = new Date(`${dates[dates.length - 1]}T00:00:00Z`);
  endDate.setUTCDate(endDate.getUTCDate() + 1); // endTime is exclusive
  const endTime = endDate.toISOString().replace(/\.\d{3}Z$/, "Z");

  let cloud = await fetchCloud(metric, startTime, endTime);

  // Performance and stability metrics age out at ~28 days, and the API refuses
  // the whole query rather than truncating it. That refusal is information, not
  // a failure: it marks the exact boundary past which only OUR copy exists.
  // Retry inside the window so the overlap still gets checked.
  let clampedFrom = "";
  if ("error" in cloud && /retention|exceeds the data/i.test(cloud.error!)) {
    const clamp = new Date();
    clamp.setUTCHours(0, 0, 0, 0);
    clamp.setUTCDate(clamp.getUTCDate() - 27);
    const clampISO = clamp.toISOString().replace(/\.\d{3}Z$/, "Z");
    if (clampISO < endTime) {
      clampedFrom = startTime.slice(0, 10);
      await sleep(2200);
      cloud = await fetchCloud(metric, clampISO, endTime);
    }
  }
  if ("error" in cloud) { console.log(`✗  ${metric.padEnd(30)} ${cloud.error}`); await sleep(2200); continue; }

  const shared = [...local.values.keys()].filter((d) => cloud.values!.has(d));
  const onlyLocal = [...local.values.keys()].filter((d) => !cloud.values!.has(d));
  const onlyCloud = [...cloud.values!.keys()].filter((d) => !local.values.has(d) && !local.filled.has(d) && !local.partial.has(d));

  let exact = 0;
  const off: { date: string; local: number; cloud: number; pct: number }[] = [];
  for (const d of shared) {
    const a = local.values.get(d)!, b = cloud.values!.get(d)!;
    if (a === b) { exact++; continue; }
    const denom = Math.max(Math.abs(a), Math.abs(b), 1e-9);
    const pct = (Math.abs(a - b) / denom) * 100;
    if (pct < 0.0001) exact++;
    else off.push({ date: d, local: a, cloud: b, pct });
  }

  totalCells += shared.length; totalExact += exact; totalOff += off.length;
  const mark = off.length === 0 ? "✓" : "✗";
  const scope = local.series === "Total" ? "" : `  [local: ${local.series}]`;
  console.log(
    `${mark}  ${metric.padEnd(30)} ${String(exact).padStart(4)}/${String(shared.length).padEnd(4)} exact${scope}` +
    (off.length ? `  · ${off.length} differ` : "") +
    (onlyLocal.length ? `  · ${onlyLocal.length} local-only` : "") +
    (onlyCloud.length ? `  · ${onlyCloud.length} cloud-only` : "") +
    (clampedFrom ? `  · aged out before ${clampedFrom}, only our copy has it` : "")
  );
  for (const o of off.slice(0, 4)) {
    console.log(`      ${o.date}  local ${o.local}  cloud ${o.cloud}  (${o.pct.toFixed(2)}% off)`);
  }
  if (off.length > 4) console.log(`      … and ${off.length - 4} more`);

  await sleep(2200); // stay under 30 submissions/min
}

console.log(`\n${totalExact}/${totalCells} cells identical · ${totalOff} differ`);
console.log(
  totalOff === 0
    ? "Open Cloud agrees with the corpus everywhere it was checked."
    : "Divergence found — do NOT swap sources until each one above is explained."
);
