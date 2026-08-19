// Does Open Cloud serve everything our grabber pulls?
//
//   npm run coverage-opencloud -- <universeId> [days]
//
// The metric list is derived from the repo, not typed here: every metric named
// in default-plan.ts plus every metric we have actually exported a CSV for.
// Hardcoding it would let the answer drift the moment the plan changes, and the
// whole point is to know whether Open Cloud can replace THIS grabber.
//
// Three outcomes, kept distinct for the reason grab-report.md keeps them
// distinct: DATA is coverage, an EMPTY 200 means the query matched nothing and
// is NOT proof the metric is unavailable, and a 4xx carries the API's own
// explanation of what is wrong with the ask.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

const BASE = "https://apis.roblox.com/analytics-query-api/v1";

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
const days = Number(process.argv[3] || 28);
if (!key || !/^\d+$/.test(universe || "")) {
  console.error("usage: npm run coverage-opencloud -- <universeId> [days]");
  process.exit(2);
}

const repoRoot = path.resolve(process.cwd(), "..");

function collectMetrics(): string[] {
  const set = new Set<string>();
  // 1. Whatever the seed plan names.
  try {
    const src = readFileSync(path.join("src", "lib", "default-plan.ts"), "utf8");
    for (const m of src.matchAll(/metric:\s*"([A-Za-z0-9_]+)"/g)) set.add(m[1]);
    for (const m of src.matchAll(/"([A-Za-z0-9_]{4,})"\s*,?\s*(?:\/\/.*)?$/gm)) {
      // conservative: only names that look like metric identifiers already seen
      // as CSVs are added below, so this pass just catches list literals.
      if (/^[A-Z]/.test(m[1])) set.add(m[1]);
    }
  } catch { /* plan unreadable; CSVs still give us the real list */ }
  // 2. Whatever we have actually exported — the ground truth of what we pull.
  const gamesDir = path.join(repoRoot, "data", "games");
  if (existsSync(gamesDir)) {
    for (const game of readdirSync(gamesDir)) {
      const md = path.join(gamesDir, game, "metrics");
      if (!existsSync(md)) continue;
      for (const f of readdirSync(md)) {
        if (!f.endsWith(".csv")) continue;
        set.add(f.replace(/\.daily\.csv$/, "").replace(/\.csv$/, ""));
      }
    }
  }
  return [...set].sort();
}

// Only keep names that a CSV or the plan really vouches for; the loose regex
// above can pick up stray string literals.
const csvBacked = new Set<string>();
{
  const gamesDir = path.join(repoRoot, "data", "games");
  if (existsSync(gamesDir)) {
    for (const game of readdirSync(gamesDir)) {
      const md = path.join(gamesDir, game, "metrics");
      if (!existsSync(md)) continue;
      for (const f of readdirSync(md)) {
        if (f.endsWith(".csv")) csvBacked.add(f.replace(/\.daily\.csv$/, "").replace(/\.csv$/, ""));
      }
    }
  }
}
const planNamed = new Set<string>();
try {
  const src = readFileSync(path.join("src", "lib", "default-plan.ts"), "utf8");
  for (const m of src.matchAll(/metric:\s*"([A-Za-z0-9_]+)"/g)) planNamed.add(m[1]);
} catch { /* ignore */ }

const metrics = [...new Set([...csvBacked, ...planNamed])].sort();

const end = new Date(); end.setUTCHours(0, 0, 0, 0);
const start = new Date(end.getTime() - days * 86400_000);
const startTime = start.toISOString().replace(/\.\d{3}Z$/, "Z");
const endTime = end.toISOString().replace(/\.\d{3}Z$/, "Z");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Row = { metric: string; status: string; points: number; note: string };

async function probe(metric: string): Promise<Row> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/universes/${universe}/metrics`, {
      method: "POST",
      headers: { "x-api-key": key!, "content-type": "application/json" },
      body: JSON.stringify({ metric, granularity: "OneDay", startTime, endTime }),
    });
  } catch (e) {
    return { metric, status: "NETWORK", points: 0, note: String((e as Error).message) };
  }
  const text = await res.text();
  if (!res.ok) {
    let msg = text;
    try { msg = JSON.parse(text)?.error?.message ?? text; } catch { /* raw */ }
    return { metric, status: `HTTP ${res.status}`, points: 0, note: String(msg).slice(0, 200).replace(/\s+/g, " ") };
  }
  let body = JSON.parse(text) as Record<string, unknown>;
  if (body.done === false && typeof body.path === "string") {
    for (let i = 0; i < 25 && body.done === false; i++) {
      await sleep(1000);
      const r = await fetch(`https://apis.roblox.com/analytics-query-api/${body.path}`, { headers: { "x-api-key": key! } });
      if (!r.ok) return { metric, status: `poll ${r.status}`, points: 0, note: "" };
      body = (await r.json()) as Record<string, unknown>;
    }
  }
  const resp = (body.response ?? {}) as { values?: { dataPoints?: unknown[] }[] };
  const vals = resp.values ?? [];
  const pts = vals.reduce((n, v) => n + (v.dataPoints?.length ?? 0), 0);
  if (!pts) return { metric, status: "EMPTY 200", points: 0, note: "matched nothing — not proof of absence" };
  return { metric, status: "DATA", points: pts, note: `${vals.length} series` };
}

console.log(`Open Cloud coverage vs our grab plan · universe ${universe}`);
console.log(`${metrics.length} metrics · window ${startTime.slice(0, 10)} → ${endTime.slice(0, 10)} · OneDay\n`);

const rows: Row[] = [];
for (const m of metrics) {
  const r = await probe(m);
  rows.push(r);
  const mark = r.status === "DATA" ? "✓" : r.status === "EMPTY 200" ? "·" : "✗";
  console.log(`${mark} ${m.padEnd(42)} ${r.status.padEnd(10)} ${String(r.points).padStart(5)} pts`);
  await sleep(2200);
}

const data = rows.filter((r) => r.status === "DATA");
const empty = rows.filter((r) => r.status === "EMPTY 200");
const failed = rows.filter((r) => r.status !== "DATA" && r.status !== "EMPTY 200");

console.log(`\n${data.length} served · ${empty.length} empty · ${failed.length} failed  (of ${rows.length})`);

if (failed.length) {
  console.log(`\nNOT served by Open Cloud — these still need the extension:`);
  for (const r of failed) console.log(`  ${r.metric.padEnd(42)} ${r.status}  ${r.note}`);
}
if (empty.length) {
  console.log(`\nEmpty 200 (query matched nothing — check the dashboard before concluding unavailable):`);
  for (const r of empty) console.log(`  ${r.metric}`);
}
