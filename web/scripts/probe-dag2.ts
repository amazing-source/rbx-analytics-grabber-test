// Follow-up to probe-dag.ts: is the UserSegmentation breakdown's failure a
// RATE/VOLUME split, or specific to retention? And what is the DAG's real
// vocabulary (node types, reducers, segmentation dimensions)?
//
// The enum list is read out of the dashboard's OWN JS bundle rather than
// guessed — the repo's standing rule is that an invented shape proves nothing.
// SECURITY: all requests issued in-page; no cookie or CSRF token enters Node.
import { launchWithExtension, isLoggedIn } from "./browser-context.ts";
import { writeFileSync } from "node:fs";

const universe = process.argv[2] ?? "10638354731";
const OUT = process.argv[3] ?? "./dag-probe2.json";

const { context } = await launchWithExtension();
if (!(await isLoggedIn(context))) { console.error("not logged in"); await context.close(); process.exit(1); }
const page = await context.newPage();

const scripts: string[] = [];
page.on("response", (r) => { if (/\.js(\?|$)/.test(r.url()) && r.status() === 200) scripts.push(r.url()); });

await page.goto(`https://create.roblox.com/dashboard/creations/experiences/${universe}/analytics/explore`,
  { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForTimeout(10_000);

const ctx = {
  resourceType: "RESOURCE_TYPE_UNIVERSE", resourceId: universe,
  granularity: "METRIC_GRANULARITY_ONE_DAY",
  startTime: "2026-08-25T00:00:00.000Z", endTime: "2026-09-10T00:00:00.000Z",
};

async function runDag(metric: string, breakdown?: string) {
  const nodes = [
    { id: "query_A", type: "NODE_TYPE_QUERY",
      queryConfig: breakdown ? { metric, breakdownSpecs: [{ dimensionBreakdown: { dimension: breakdown } }] } : { metric } },
    { id: "output_main", type: "NODE_TYPE_OUTPUT", outputConfig: { input: "query_A", alias: "computed_A" } },
  ];
  const body = { graph: { id: "computed_metric_computed_A", name: "Computed Metric DAG", nodes }, context: ctx };
  return page.evaluate(async ({ body }) => {
    const url = "https://apis.roblox.com/analytics-query-gateway/v1/dag/execute";
    let token = "";
    async function post() {
      const h: Record<string, string> = { "content-type": "application/json" };
      if (token) h["x-csrf-token"] = token;
      const r = await fetch(url, { method: "POST", credentials: "include", headers: h, body: JSON.stringify(body) });
      if (r.status === 403) { const t = r.headers.get("x-csrf-token"); if (t && t !== token) { token = t; return post(); } }
      return { status: r.status, json: await r.json().catch(() => null) };
    }
    let res = await post();
    for (let i = 0; i < 60 && res.json && res.json.pending; i++) { await new Promise((s) => setTimeout(s, 2000)); res = await post(); }
    return res;
  }, { body });
}

/** Print a metric's total against the sum of its segments on the last shared day. */
async function check(metric: string) {
  const tot = await runDag(metric);
  const seg = await runDag(metric, "UserSegmentationEngagementLevel");
  const pick = (o: any) => (o.json?.result?.outputs?.[0]?.timeSeries?.values) || [];
  const tv = pick(tot)[0]?.dataPoints || [];
  const last = tv.length ? tv[tv.length - 1].time : null;
  const total = tv.length ? tv[tv.length - 1].value : null;
  const parts: Record<string, number> = {};
  for (const v of pick(seg)) {
    const k = (v.breakdownValue || []).map((x: any) => x.value).join(",");
    const dp = (v.dataPoints || []).find((d: any) => d.time === last);
    parts[k] = dp ? dp.value : NaN;
  }
  const sum = Object.values(parts).reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
  const ratio = total ? sum / total : NaN;
  console.log(`\n### ${metric}  (${String(last).slice(0, 10)})`);
  console.log(`   total = ${total}`);
  console.log(`   parts = ${JSON.stringify(parts)}`);
  console.log(`   sum   = ${sum}   sum/total = ${ratio.toFixed(4)}   -> ${Math.abs(ratio - 1) < 0.05 ? "SUMS (usable)" : "DOES NOT SUM (unusable)"}`);
  return { metric, last, total, parts, sum, ratio };
}

const checks = [];
for (const m of ["PayingUsers", "DailyRevenue", "AverageRevenuePerUser", "PayingUsersCVR", "AverageSessionLengthMinutes"]) {
  try { checks.push(await check(m)); } catch (e) { console.log(`### ${m} FAILED ${(e as Error).message.slice(0, 120)}`); }
}

// The app's own vocabulary, straight out of the bundle it shipped.
console.log("\n=== enum strings found in the dashboard's JS bundle ===");
const found: Record<string, string[]> = {};
const pats = ["NODE_TYPE_[A-Z_]+", "WINDOW_REDUCER_[A-Z_]+", "RANK_DIRECTION_[A-Z_]+",
              "UserSegmentation[A-Za-z]*", "FILTER_OPERATION_[A-Z_]+", "WINDOW_AVG_MODE_[A-Z_]+"];
for (const u of [...new Set(scripts)]) {
  let txt = "";
  try { const r = await page.request.get(u); if (r.status() !== 200) continue; txt = await r.text(); } catch { continue; }
  for (const p of pats) {
    for (const m of txt.match(new RegExp(p, "g")) || []) { (found[p] ??= []).push(m); }
  }
}
for (const [p, list] of Object.entries(found)) {
  console.log(`  ${p}:`);
  for (const v of [...new Set(list)].sort()) console.log(`     ${v}`);
}

writeFileSync(OUT, JSON.stringify({ checks, found }, null, 1));
console.log("\nwrote " + OUT);
if (!process.argv.includes("--keep-open")) await context.close();
