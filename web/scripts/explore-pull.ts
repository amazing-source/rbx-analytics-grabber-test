// Pull arbitrary (metric × breakdown × granularity) series through the Explore
// engine (analytics-query-gateway/v1/dag/execute) inside the logged-in browser,
// and write them RAW to JSON — reconciliation and reading happen downstream.
// Browser path, so it spends none of Open Cloud's 30-POST/min quota.
//
//   npm run explore-pull -- --games=9963622286,10030829154 --start=2026-08-28 --end=2026-09-20 \
//        --out=../reports/2026-09-19/data [--specs=DailyActiveUsers:IsNewUser:ONE_DAY,...] [--keep-open]
//
// A spec is metric[:breakdown|-][:GRANULARITY]. "-" means no breakdown (the headline).
// SECURITY: every request is issued from the page; no cookie or CSRF token enters Node.
import { launchWithExtension, isLoggedIn } from "./browser-context.ts";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const arg = (n: string, d?: string) => process.argv.find(a => a.startsWith(`--${n}=`))?.split("=")[1] ?? d;
const GAMES = (arg("games", "9963622286,10030829154,10399712766,10565445771,10638354731") as string).split(",");
const START = arg("start", "2026-08-28") as string;
const END = arg("end", "2026-09-20") as string;       // exclusive, 00:00Z
const OUT = path.resolve(arg("out", "./explore-pull") as string);
const DEFAULT_SPECS = [
  "DailyActiveUsers:-", "DailyActiveUsers:IsNewUser", "DailyActiveUsers:Platform", "DailyActiveUsers:AcquisitionSource",
  "ForwardD1Retention:-", "ForwardD1Retention:IsNewUser", "ForwardD1Retention:Platform", "ForwardD1Retention:AcquisitionSource",
  "AverageSessionLengthMinutes:-", "AverageSessionLengthMinutes:IsNewUser", "AverageSessionLengthMinutes:Platform",
  "AveragePlayTimeMinutesPerDAU:IsNewUser",
  "PayingUsersCVR:-", "PayingUsersCVR:Platform", "AverageRevenuePerUser:Platform",
  "ConcurrentPlayers:-:ONE_HOUR", "PeakConcurrentPlayers:-:HALF_HOUR",
].join(",");
const SPECS = (arg("specs", DEFAULT_SPECS) as string).split(",").map(s => {
  const [metric, bd = "-", gran = "ONE_DAY"] = s.split(":");
  return { metric, breakdown: bd === "-" ? null : bd, granularity: `METRIC_GRANULARITY_${gran}` };
});
mkdirSync(OUT, { recursive: true });

const { context } = await launchWithExtension();
if (!(await isLoggedIn(context))) { console.error("not logged in"); await context.close(); process.exit(1); }
const page = await context.newPage();
// Must be ON create.roblox.com: the dag POST is issued from the page.
await page.goto(`https://create.roblox.com/dashboard/creations/experiences/${GAMES[0]}/analytics/explore`,
  { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForTimeout(9000);

async function runDag(universe: string, metric: string, breakdown: string | null, granularity: string) {
  const nodes: any[] = [
    { id: "query_A", type: "NODE_TYPE_QUERY", queryConfig: breakdown
        ? { metric, breakdownSpecs: [{ dimensionBreakdown: { dimension: breakdown } }] } : { metric } },
    { id: "output_main", type: "NODE_TYPE_OUTPUT", outputConfig: { input: "query_A", alias: "computed_A" } }];
  const body = { graph: { id: "computed_metric_computed_A", name: "Computed Metric DAG", nodes },
    context: { resourceType: "RESOURCE_TYPE_UNIVERSE", resourceId: universe, granularity,
      startTime: `${START}T00:00:00.000Z`, endTime: `${END}T00:00:00.000Z` } };
  return page.evaluate(async ({ body }) => {
    const url = "https://apis.roblox.com/analytics-query-gateway/v1/dag/execute";
    let token = (window as any).__dagToken || "";
    async function post(): Promise<any> {
      const h: Record<string, string> = { "content-type": "application/json" };
      if (token) h["x-csrf-token"] = token;
      const r = await fetch(url, { method: "POST", credentials: "include", headers: h, body: JSON.stringify(body) });
      if (r.status === 403) { const t = r.headers.get("x-csrf-token"); if (t && t !== token) { token = t; (window as any).__dagToken = t; return post(); } }
      return { status: r.status, json: await r.json().catch(() => null) };
    }
    let res = await post();
    // Polling = re-POSTing the identical body (operationId is content-addressed).
    for (let i = 0; i < 60 && res.json && res.json.pending; i++) { await new Promise(s => setTimeout(s, 2000)); res = await post(); }
    return res;
  }, { body });
}

const shred = (r: any) => {
  const out: Record<string, { label: string; points: Record<string, number> }> = {};
  for (const o of r?.json?.result?.outputs ?? [])
    for (const v of o.timeSeries?.values ?? []) {
      const bv = v.breakdownValue || [];
      const k = bv.map((b: any) => b.value).join(",") || "__TOTAL__";
      const label = bv.map((b: any) => b.displayValue || b.value).join(",") || "__TOTAL__";
      out[k] ??= { label, points: {} };
      for (const d of v.dataPoints || []) out[k].points[d.time] = d.value;
    }
  return out;
};

for (const u of GAMES) {
  const rec: any = { universe: u, start: START, end: END, pulledAt: new Date().toISOString(), specs: [] };
  for (const s of SPECS) {
    let res: any = null, err: string | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try { res = await runDag(u, s.metric, s.breakdown, s.granularity); } catch (e: any) { err = String(e?.message || e); }
      const n = res ? Object.keys(shred(res)).length : 0;
      if (res && res.status === 200 && n) { err = null; break; }
      err = res ? `HTTP ${res.status}${n ? "" : " (no series)"}: ${JSON.stringify(res.json)?.slice(0, 240)}` : err;
      await page.waitForTimeout(4000);   // an empty answer is a measurement of the poll until a retry agrees
    }
    const series = res && !err ? shred(res) : {};
    rec.specs.push({ ...s, error: err, series });
    const npts = Object.values(series).reduce((a, x) => a + Object.keys(x.points).length, 0);
    console.log(`${u} ${s.metric} × ${s.breakdown ?? "total"} @ ${s.granularity.replace("METRIC_GRANULARITY_", "")}: ` +
      (err ? `FAILED ${err.slice(0, 160)}` : `${Object.keys(series).length} series, ${npts} points`));
  }
  writeFileSync(path.join(OUT, `explore-${u}.json`), JSON.stringify(rec));
}
console.log(`wrote ${OUT}`);
if (!process.argv.includes("--keep-open")) await context.close();
