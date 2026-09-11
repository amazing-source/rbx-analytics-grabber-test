// Probe the Explore tab's `dag/execute` engine: does the UserSegmentation
// breakdown return usable numbers, or the 0/1 series the first capture showed?
//
// DISCRIMINATOR: a volume metric's segments must sum to its unbroken-down total.
// If DailyActiveUsers segments sum to DAU, the breakdown works and the 0/1 is a
// rate-metric problem. If they come back 0/1 too, the breakdown is broken.
//
// SECURITY: every request is issued INSIDE the page, so the session cookie and
// the CSRF token never enter this process. Nothing here reads either.
import { launchWithExtension, isLoggedIn } from "./browser-context.ts";
import { writeFileSync } from "node:fs";

const universe = process.argv[2] ?? "10638354731";
const OUT = process.argv[3] ?? "./dag-probe.json";

const { context } = await launchWithExtension();
if (!(await isLoggedIn(context))) { console.error("not logged in"); await context.close(); process.exit(1); }
const page = await context.newPage();
await page.goto(`https://create.roblox.com/dashboard/creations/experiences/${universe}/analytics/explore`,
  { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForTimeout(9000);   // let the shell settle so same-site state is live

/** Run one DAG graph in-page, retrying the XSRF 403 and polling the async result. */
async function runDag(label: string, graphNodes: unknown[], ctx: Record<string, string>) {
  const body = { graph: { id: "computed_metric_computed_A", name: "Computed Metric DAG", nodes: graphNodes }, context: ctx };
  const out = await page.evaluate(async ({ body }) => {
    const url = "https://apis.roblox.com/analytics-query-gateway/v1/dag/execute";
    let token = "";
    async function post() {
      const h: Record<string, string> = { "content-type": "application/json" };
      if (token) h["x-csrf-token"] = token;
      const r = await fetch(url, { method: "POST", credentials: "include", headers: h, body: JSON.stringify(body) });
      // Roblox hands the CSRF token back on the 403; retry once with it.
      if (r.status === 403) {
        const t = r.headers.get("x-csrf-token");
        if (t && t !== token) { token = t; return post(); }
      }
      return { status: r.status, json: await r.json().catch(() => null) };
    }
    let res = await post();
    // The operationId is content-addressed: polling IS re-POSTing the same body.
    for (let i = 0; i < 60 && res.json && res.json.pending; i++) {
      await new Promise((s) => setTimeout(s, 2000));
      res = await post();
    }
    return res;
  }, { body });

  const polls = out.json && out.json.pending ? "GAVE UP pending" : "done";
  console.log(`\n### ${label} — HTTP ${out.status}, ${polls}`);
  if (out.json && out.json.result) {
    for (const o of out.json.result.outputs || []) {
      for (const v of (o.timeSeries && o.timeSeries.values) || []) {
        const bd = (v.breakdownValue || []).map((x: any) => `${x.dimension}=${x.value}`).join(",") || "(TOTAL)";
        const dp = v.dataPoints || [];
        const last = dp.slice(-4).map((d: any) => `${d.time.slice(5, 10)}:${d.value}`).join("  ");
        console.log(`  ${o.nodeId} ${bd.padEnd(46)} n=${dp.length}  ${last}`);
      }
    }
  } else if (out.json && out.json.errors) {
    console.log("  ERRORS:", JSON.stringify(out.json.errors).slice(0, 300));
  } else {
    console.log("  raw:", JSON.stringify(out.json).slice(0, 300));
  }
  return out;
}

const ctx = {
  resourceType: "RESOURCE_TYPE_UNIVERSE", resourceId: universe,
  granularity: "METRIC_GRANULARITY_ONE_DAY",
  startTime: "2026-08-25T00:00:00.000Z", endTime: "2026-09-10T00:00:00.000Z",
};
const Q = (metric: string, breakdown?: string) => ({
  id: "query_A", type: "NODE_TYPE_QUERY",
  queryConfig: breakdown
    ? { metric, breakdownSpecs: [{ dimensionBreakdown: { dimension: breakdown } }] }
    : { metric },
});
const OUTN = { id: "output_main", type: "NODE_TYPE_OUTPUT", outputConfig: { input: "query_A", alias: "computed_A" } };

const results: Record<string, unknown> = {};
results.dauTotal = await runDag("A: DailyActiveUsers — no breakdown (control)", [Q("DailyActiveUsers"), OUTN], ctx);
results.dauSeg  = await runDag("B: DailyActiveUsers by UserSegmentationEngagementLevel", [Q("DailyActiveUsers", "UserSegmentationEngagementLevel"), OUTN], ctx);
results.d1Total = await runDag("C: ForwardD1Retention — no breakdown (control)", [Q("ForwardD1Retention"), OUTN], ctx);
results.d1Seg   = await runDag("D: ForwardD1Retention by UserSegmentationEngagementLevel", [Q("ForwardD1Retention", "UserSegmentationEngagementLevel"), OUTN], ctx);

writeFileSync(OUT, JSON.stringify(results, null, 1));
console.log("\nwrote " + OUT);
if (!process.argv.includes("--keep-open")) await context.close();
