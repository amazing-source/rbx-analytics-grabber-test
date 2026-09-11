// Enumerate EVERY breakdown dimension the dashboard knows, then test each one
// against dag/execute and reconcile it, so we learn which are usable rather
// than guessing. Answers "demographics, groups, acquisition — what can we split by".
//
// Reconciliation: a volume's segments must SUM to the unbroken-down total.
// DailyActiveUsers is the probe metric because it is a clean volume.
// SECURITY: all requests in-page; no cookie or CSRF token enters Node.
import { launchWithExtension, isLoggedIn } from "./browser-context.ts";
import { writeFileSync } from "node:fs";

const universe = process.argv[2] ?? "9963622286";
const OUT = process.argv[3] ?? "./dims";

const { context } = await launchWithExtension();
if (!(await isLoggedIn(context))) { console.error("not logged in"); await context.close(); process.exit(1); }
const page = await context.newPage();
const scripts: string[] = [];
page.on("response", (r) => { if (/\.js(\?|$)/.test(r.url()) && r.status() === 200) scripts.push(r.url()); });

await page.goto(`https://create.roblox.com/dashboard/creations/experiences/${universe}/analytics/explore`,
  { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForTimeout(11_000);

// --- 1. harvest candidate dimension names from the shipped bundle ---
const KNOWN = ["AcquisitionSource","TopAcquisitionSources","Platform","IsNewUser","AgeGroup","AgeGroupV2",
  "Gender","Locale","Country","CohortDay","RevenueSource","BalanceType","ProductType","SessionTimeBucket",
  "FunnelStep","FunnelName","PlaceVersion","Place","MessageHash","LogSource","MemoryGroup","DeviceType",
  "UserSegmentationAccountAge","UserSegmentationAcquisitionSource","UserSegmentationActivationStatus",
  "UserSegmentationEngagementLevel","UserSegmentationPayerStatus","UserSegmentationPlatformActivationStatus",
  "UserSegmentationPlatformSpenderStatus","UserSegmentationReturnStatus"];
const found = new Set<string>(KNOWN);
for (const u of [...new Set(scripts)]) {
  let txt = ""; try { const r = await page.request.get(u); if (r.status() !== 200) continue; txt = await r.text(); } catch { continue; }
  for (const m of txt.match(/"(?:Top)?[A-Z][A-Za-z]{3,40}"(?=\s*[,:\]}])/g) || []) {
    const s = m.slice(1, -1);
    if (/^(Top)?(Acquisition|Age|Gender|Locale|Country|Region|Platform|Device|Segment|User|Group|Cohort|Session|Revenue|Product|Balance)/.test(s)) found.add(s);
  }
}
console.log(`candidate dimensions: ${found.size}`);

const ctx = { resourceType: "RESOURCE_TYPE_UNIVERSE", resourceId: universe,
  granularity: "METRIC_GRANULARITY_ONE_DAY",
  startTime: "2026-08-29T00:00:00.000Z", endTime: "2026-09-10T00:00:00.000Z" };

async function runDag(metric: string, breakdown?: string) {
  const nodes: any[] = [
    { id: "query_A", type: "NODE_TYPE_QUERY", queryConfig: breakdown
        ? { metric, breakdownSpecs: [{ dimensionBreakdown: { dimension: breakdown } }] } : { metric } },
    { id: "output_main", type: "NODE_TYPE_OUTPUT", outputConfig: { input: "query_A", alias: "computed_A" } }];
  const body = { graph: { id: "computed_metric_computed_A", name: "Computed Metric DAG", nodes }, context: ctx };
  return page.evaluate(async ({ body }) => {
    const url = "https://apis.roblox.com/analytics-query-gateway/v1/dag/execute";
    let token = "";
    async function post(): Promise<any> {
      const h: Record<string,string> = { "content-type": "application/json" };
      if (token) h["x-csrf-token"] = token;
      const r = await fetch(url, { method:"POST", credentials:"include", headers:h, body: JSON.stringify(body) });
      if (r.status === 403) { const t = r.headers.get("x-csrf-token"); if (t && t !== token) { token = t; return post(); } }
      return { status: r.status, json: await r.json().catch(() => null) };
    }
    let res = await post();
    for (let i = 0; i < 45 && res.json && res.json.pending; i++) { await new Promise(s=>setTimeout(s,2000)); res = await post(); }
    return res;
  }, { body });
}

const base = await runDag("DailyActiveUsers");
const totSeries = base?.json?.result?.outputs?.[0]?.timeSeries?.values?.[0]?.dataPoints ?? [];
const totals: Record<string, number> = {};
for (const d of totSeries) totals[d.time.slice(0,10)] = d.value;
const day = Object.keys(totals).sort().pop()!;
console.log(`DailyActiveUsers total on ${day}: ${Math.round(totals[day]).toLocaleString("en-US")}\n`);

const rows: any[] = [];
for (const dim of [...found].sort()) {
  const r = await runDag("DailyActiveUsers", dim);
  const outs = r?.json?.result?.outputs?.[0];
  if (r.status !== 200 || !outs || outs.success === false) {
    rows.push({ dim, ok:false, note: (outs?.error || r?.json?.errors?.[0]?.message || `HTTP ${r.status}`).slice(0,80) });
    continue;
  }
  const vals = outs.timeSeries?.values ?? [];
  if (!vals.length) { rows.push({ dim, ok:false, note:"200, zero series" }); continue; }
  let sum = 0; const labels: string[] = [];
  for (const v of vals) {
    const key = (v.breakdownValue||[]).map((b:any)=>b.displayValue||b.value).join(",");
    const dp = (v.dataPoints||[]).find((d:any)=>d.time.slice(0,10)===day);
    if (dp) sum += dp.value;
    if (key) labels.push(key);
  }
  const cov = totals[day] ? sum/totals[day] : NaN;
  rows.push({ dim, ok:true, n: vals.length, sum, cov, labels: labels.slice(0,8) });
  console.log(`${dim.padEnd(42)} ${String(vals.length).padStart(3)} series  sum/total=${cov.toFixed(3)}  ${Math.abs(cov-1)<0.02?"RECONCILES":"does not reconcile"}`);
  if (labels.length) console.log(`    values: ${labels.slice(0,8).join(" · ")}${labels.length>8?` … +${labels.length-8}`:""}`);
}

console.log("\n=== dimensions that FAILED ===");
for (const r of rows.filter(r=>!r.ok)) console.log(`  ${r.dim.padEnd(42)} ${r.note}`);

writeFileSync(OUT + ".json", JSON.stringify({ universe, day, total: totals[day], rows }, null, 1));
console.log("\nwrote " + OUT + ".json");
if (!process.argv.includes("--keep-open")) await context.close();
