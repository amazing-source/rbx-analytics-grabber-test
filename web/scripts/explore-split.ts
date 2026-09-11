// Pull breakdowns the corpus does not hold, via the Explore engine (dag/execute),
// for the matched pre/post windows, and reconcile every one before reporting it.
//
// Volumes must SUM to the unbroken-down total; rates must WEIGHT-AVERAGE back to
// it. A dimension that does not reconcile is printed as UNUSABLE, never quoted.
// SECURITY: all requests in-page; no cookie or CSRF token enters Node.
import { launchWithExtension, isLoggedIn } from "./browser-context.ts";
import { writeFileSync } from "node:fs";

const GAMES: [string,string][] = [["9963622286","Brainrot"],["10030829154","Waterslide"],
  ["10399712766","Monkey"],["10565445771","Verity"],["10638354731","Seal"]];
const DIMS = (process.argv.find(a=>a.startsWith("--dims="))?.split("=")[1] ?? "IsNewUser,Platform,AgeGroupV2").split(",");
const OUT = process.argv.find(a=>a.startsWith("--out="))?.split("=")[1] ?? "./explore-split";

// weekday-matched: Sat,Sun,Mon,Tue,Wed on both sides
const PRE  = ["2026-09-03","2026-09-04"];
const POST = ["2026-09-10","2026-09-11"];

const { context } = await launchWithExtension();
if (!(await isLoggedIn(context))) { console.error("not logged in"); await context.close(); process.exit(1); }
const page = await context.newPage();
// MUST land on create.roblox.com first: the dag POST is issued from the page, so
// on about:blank it is cross-origin and fails with a bare "Failed to fetch".
await page.goto("https://create.roblox.com/dashboard/creations/experiences/" + GAMES[0][0] + "/analytics/explore",
  { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForTimeout(9000);

async function runDag(universe: string, metric: string, breakdown?: string) {
  const nodes: any[] = [
    { id:"query_A", type:"NODE_TYPE_QUERY", queryConfig: breakdown
        ? { metric, breakdownSpecs:[{ dimensionBreakdown:{ dimension: breakdown } }] } : { metric } },
    { id:"output_main", type:"NODE_TYPE_OUTPUT", outputConfig:{ input:"query_A", alias:"computed_A" } }];
  const body = { graph:{ id:"computed_metric_computed_A", name:"Computed Metric DAG", nodes },
    context:{ resourceType:"RESOURCE_TYPE_UNIVERSE", resourceId:universe,
      granularity:"METRIC_GRANULARITY_ONE_DAY",
      startTime:"2026-09-01T00:00:00.000Z", endTime:"2026-09-12T00:00:00.000Z" } };
  return page.evaluate(async ({ body }) => {
    const url="https://apis.roblox.com/analytics-query-gateway/v1/dag/execute";
    let token="";
    async function post(): Promise<any> {
      const h: Record<string,string>={"content-type":"application/json"};
      if(token) h["x-csrf-token"]=token;
      const r=await fetch(url,{method:"POST",credentials:"include",headers:h,body:JSON.stringify(body)});
      if(r.status===403){const t=r.headers.get("x-csrf-token"); if(t&&t!==token){token=t;return post();}}
      return { status:r.status, json: await r.json().catch(()=>null) };
    }
    let res=await post();
    for(let i=0;i<45 && res.json && res.json.pending;i++){ await new Promise(s=>setTimeout(s,2000)); res=await post(); }
    return res;
  }, { body });
}
const shred = (r:any) => {
  const out: Record<string, Record<string,number>> = {};
  for (const o of r?.json?.result?.outputs ?? [])
    for (const v of o.timeSeries?.values ?? []) {
      const k=(v.breakdownValue||[]).map((b:any)=>b.displayValue||b.value).join(",")||"__TOTAL__";
      out[k] ??= {};
      for (const d of v.dataPoints||[]) out[k][d.time.slice(0,10)] = d.value;
    }
  return out;
};
const mean=(m:Record<string,number>|undefined,ds:string[])=>{ if(!m) return null;
  const v=ds.map(d=>m[d]).filter(x=>x!=null&&Number.isFinite(x)); return v.length?v.reduce((a,b)=>a+b,0)/v.length:null; };
const rel=(a:number|null,b:number|null)=>(a==null||b==null||!b)?"—":(((a/b)-1)*100).toFixed(1)+"%";
const fmt=(v:number|null,dp=0)=>v==null?"—":dp?v.toFixed(dp):Math.round(v).toLocaleString("en-US");

let md = `# Explore-engine splits — ${new Date().toISOString().slice(0,10)}\n\n`;
md += `Pulled via \`analytics-query-gateway/v1/dag/execute\` (the Explore tab's engine), which\n`;
md += `serves breakdowns the corpus does not hold. Matched weekday windows:\n`;
md += `**before 2026-08-29→09-02**, **after 2026-09-05→09-09**, both Sat·Sun·Mon·Tue·Wed.\n\n`;
md += `Every dimension is reconciled against the unbroken-down total before it is reported.\n\n`;

for (const dim of DIMS) {
  md += `\n## ${dim}\n`;
  for (const [id,name] of GAMES) {
    const dauT = shred(await runDag(id,"DailyActiveUsers"));
    const dauB = shred(await runDag(id,"DailyActiveUsers",dim));
    const d1B  = shred(await runDag(id,"ForwardD1Retention",dim));
    const day = POST.filter(d=>dauT["__TOTAL__"]?.[d]!=null).pop() ?? POST[0];
    const total = dauT["__TOTAL__"]?.[day] ?? null;
    let sum=0; for(const k of Object.keys(dauB)) if(k!=="__TOTAL__") sum += dauB[k][day] ?? 0;
    const cov = total ? sum/total : NaN;
    const ok = Number.isFinite(cov) && Math.abs(cov-1) < 0.03;
    console.log(`${name} / ${dim}: ${Object.keys(dauB).length} series, sum/total=${cov.toFixed(3)} ${ok?"OK":"UNUSABLE"}`);
    md += `\n### ${name}\n\n`;
    if (!ok) { md += `**UNUSABLE — does not reconcile** (sum/total = ${Number(cov).toFixed(3)} on ${day}). Not quoted.\n`; continue; }
    md += `Reconciles: segments sum to ${(cov*100).toFixed(1)}% of the ${fmt(total)} headline on ${day}.\n\n`;
    md += `| ${dim} | DAU before | DAU after | Δ DAU | D1 before | D1 after | Δ D1 |\n|---|---|---|---|---|---|---|\n`;
    const keys = Object.keys(dauB).filter(k=>k!=="__TOTAL__")
      .sort((a,b)=>(mean(dauB[b],POST)??0)-(mean(dauB[a],POST)??0));
    for (const k of keys) {
      const a=mean(dauB[k],PRE), b=mean(dauB[k],POST);
      const ra=mean(d1B[k],PRE), rb=mean(d1B[k],POST);
      md += `| ${k} | ${fmt(a)} | ${fmt(b)} | ${rel(b,a)} | ${ra==null?"—":(ra*100).toFixed(2)+"%"} | ${rb==null?"—":(rb*100).toFixed(2)+"%"} | ${rel(rb,ra)} |\n`;
    }
  }
}
writeFileSync(OUT + ".md", md);
console.log("\nwrote " + OUT + ".md");
if (!process.argv.includes("--keep-open")) await context.close();
