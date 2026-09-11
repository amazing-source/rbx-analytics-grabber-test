// Which metrics can actually be segmented by UserSegmentation*, and which
// return degenerate values?
//
// THE TEST MATTERS. A volume's segments must SUM to the total; a rate's must
// WEIGHT-AVERAGE back to it (weighted by the rate's own denominator). Testing a
// rate with a sum declares every healthy rate broken — which is exactly the
// wrong call probe-dag2 made before this was fixed.
//
// SECURITY: all requests issued in-page; no cookie or CSRF token enters Node.
import { launchWithExtension, isLoggedIn } from "./browser-context.ts";
import { writeFileSync } from "node:fs";

const universe = process.argv[2] ?? "10638354731";
const OUT = process.argv[3] ?? "./dag-probe3.json";
const DIM = process.argv.includes("--dim")
  ? process.argv[process.argv.indexOf("--dim") + 1]
  : "UserSegmentationEngagementLevel";

// kind: "volume" sums; "rate" weight-averages by `weight`'s segments.
const METRICS: { metric: string; kind: "volume" | "rate"; weight?: string }[] = [
  { metric: "DailyActiveUsers", kind: "volume" },
  { metric: "PayingUsers", kind: "volume" },
  { metric: "DailyRevenue", kind: "volume" },
  { metric: "UniqueUsersWithPlaySessions", kind: "volume" },
  { metric: "TotalPlayTimeHours", kind: "volume" },
  { metric: "AverageRevenuePerUser", kind: "rate", weight: "DailyActiveUsers" },
  { metric: "PayingUsersCVR", kind: "rate", weight: "DailyActiveUsers" },
  { metric: "AverageSessionLengthMinutes", kind: "rate", weight: "DailyActiveUsers" },
  { metric: "AveragePlayTimeMinutesPerDAU", kind: "rate", weight: "DailyActiveUsers" },
  { metric: "AverageRevenuePerPayingUser", kind: "rate", weight: "PayingUsers" },
  { metric: "ForwardD1Retention", kind: "rate", weight: "DailyActiveUsers" },
  { metric: "ForwardD7Retention", kind: "rate", weight: "DailyActiveUsers" },
  { metric: "DauMauStickiness", kind: "rate", weight: "DailyActiveUsers" },
];

const { context } = await launchWithExtension();
if (!(await isLoggedIn(context))) { console.error("not logged in"); await context.close(); process.exit(1); }
const page = await context.newPage();
await page.goto(`https://create.roblox.com/dashboard/creations/experiences/${universe}/analytics/explore`,
  { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForTimeout(9000);

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

/** metric -> { day -> value } for the total, and { segment -> { day -> value } }. */
function shred(out: any) {
  const total: Record<string, number> = {};
  const seg: Record<string, Record<string, number>> = {};
  for (const o of out?.json?.result?.outputs || []) {
    for (const v of o.timeSeries?.values || []) {
      const key = (v.breakdownValue || []).map((x: any) => x.value).join(",");
      const target = key ? (seg[key] ??= {}) : total;
      for (const d of v.dataPoints || []) target[d.time.slice(0, 10)] = d.value;
    }
  }
  return { total, seg };
}

const cache = new Map<string, any>();
async function segOf(metric: string) {
  const k = metric + "|" + DIM;
  if (!cache.has(k)) cache.set(k, shred(await runDag(metric, DIM)));
  return cache.get(k);
}
async function totOf(metric: string) {
  const k = metric + "|total";
  if (!cache.has(k)) cache.set(k, shred(await runDag(metric)));
  return cache.get(k);
}

const rows: any[] = [];
console.log(`\nreconciling segments of ${DIM} on ${universe}\n`);
for (const spec of METRICS) {
  try {
    const tot = (await totOf(spec.metric)).total;
    const seg = (await segOf(spec.metric)).seg;
    const days = Object.keys(tot).filter((d) => Object.values(seg).some((s: any) => d in s)).sort();
    const day = days[days.length - 1];
    if (!day) { console.log(`${spec.metric.padEnd(30)} no overlapping day`); continue; }

    let recon: number;
    let detail: string;
    if (spec.kind === "volume") {
      recon = Object.values(seg).reduce((a: number, s: any) => a + (Number(s[day]) || 0), 0);
      detail = "sum";
    } else {
      const w = (await segOf(spec.weight!)).seg;
      let num = 0, den = 0;
      for (const [k, s] of Object.entries(seg)) {
        const val = Number((s as any)[day]); const wt = Number(w[k]?.[day]);
        if (Number.isFinite(val) && Number.isFinite(wt)) { num += val * wt; den += wt; }
      }
      recon = den ? num / den : NaN;
      detail = `weighted by ${spec.weight}`;
    }
    const ratio = recon / tot[day];
    const ok = Number.isFinite(ratio) && Math.abs(ratio - 1) < 0.02;
    rows.push({ metric: spec.metric, kind: spec.kind, day, total: tot[day], recon, ratio, ok,
                parts: Object.fromEntries(Object.entries(seg).map(([k, s]) => [k, (s as any)[day]])) });
    console.log(`${spec.metric.padEnd(30)} ${spec.kind.padEnd(6)} ${day}  total=${Number(tot[day]).toPrecision(6).padStart(12)}  ${detail}=${Number(recon).toPrecision(6).padStart(12)}  ratio=${Number(ratio).toFixed(4)}  ${ok ? "OK" : "<-- MISMATCH"}`);
  } catch (e) {
    console.log(`${spec.metric.padEnd(30)} FAILED ${(e as Error).message.slice(0, 100)}`);
  }
}

console.log("\n=== segment values on the newest shared day ===");
for (const r of rows) console.log(`${r.metric.padEnd(30)} ${JSON.stringify(r.parts)}`);

writeFileSync(OUT, JSON.stringify({ dim: DIM, universe, rows }, null, 1));
console.log("\nwrote " + OUT);
if (!process.argv.includes("--keep-open")) await context.close();
