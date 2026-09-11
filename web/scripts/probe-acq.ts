// Validate our AcquisitionSource data against the dashboard's own Acquisition
// page: screenshot it, and capture the metric requests behind it so the exact
// numbers can be diffed against the corpus.
//
// SECURITY: drives the logged-in window only; no cookie is read or exported.
import { launchWithExtension, isLoggedIn } from "./browser-context.ts";
import { writeFileSync } from "node:fs";

const universe = process.argv[2] ?? "9963622286";
const OUT = process.argv[3] ?? "./acq";

const { context } = await launchWithExtension();
if (!(await isLoggedIn(context))) { console.error("not logged in"); await context.close(); process.exit(1); }
const page = await context.newPage();

type Hit = { metric?: string; breakdown?: unknown; filters?: unknown; gran?: string; res?: any };
const hits: Hit[] = [];
page.on("response", async (r) => {
  const u = r.url();
  if (!u.includes("analytics-query-gateway/v1/metrics/resource")) return;
  let req: any, res: any;
  try { req = JSON.parse(r.request().postData() || "{}"); } catch { return; }
  try { res = await r.json(); } catch { return; }
  const q = req.query ?? req;
  hits.push({ metric: q.metric, gran: q.granularity, breakdown: q.breakdowns ?? q.breakdown, filters: q.filters, res });
});

const root = `https://create.roblox.com/dashboard/creations/experiences/${universe}/analytics`;
await page.goto(root, { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForTimeout(7000);
const links = await page.evaluate(() =>
  Array.from(document.querySelectorAll("a")).map((a) => ({ t: (a.textContent||"").trim(), h: (a as HTMLAnchorElement).href }))
    .filter((x) => /acquisition/i.test(x.t) || /acquisition/i.test(x.h)));
console.log("acquisition links:", links.map(l=>l.h.replace(/^https:\/\/create\.roblox\.com/,"")).join(" | ") || "(none found)");
const url = links[0]?.h ?? `${root}/acquisition`;
console.log("goto", url);
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForTimeout(15_000);

await page.screenshot({ path: OUT + ".png", fullPage: true });

// Pull any rendered tables too — the page may show the split as text.
const tables = await page.evaluate(() =>
  Array.from(document.querySelectorAll("table")).map((t) =>
    Array.from(t.querySelectorAll("tr")).map((r) =>
      Array.from(r.querySelectorAll("th,td")).map((c) => (c.textContent||"").trim()).join(" | ")
    ).join("\n")
  ));

console.log(`\n=== metric requests captured: ${hits.length} ===`);
for (const h of hits) {
  const bd = JSON.stringify(h.breakdown ?? []);
  const fl = JSON.stringify(h.filters ?? []);
  const vals = h.res?.operation?.queryResult?.values ?? [];
  console.log(`\n${h.metric}  gran=${String(h.gran).replace("METRIC_GRANULARITY_","")}  bd=${bd}  filters=${fl}  series=${vals.length}`);
  for (const v of vals.slice(0, 12)) {
    const key = (v.breakdownValue||[]).map((b:any)=>`${b.dimension}=${b.value}`).join(",") || "(TOTAL)";
    const dp = v.dataPoints||[];
    const last = dp.slice(-3).map((d:any)=>`${d.time.slice(5,10)}:${Math.round(d.value).toLocaleString("en-US")}`).join("  ");
    console.log(`   ${key.padEnd(42)} n=${String(dp.length).padStart(3)}  ${last}`);
  }
}
if (tables.length) { console.log(`\n=== ${tables.length} rendered table(s) ===`); for (const t of tables) console.log(t.slice(0,900)+"\n---"); }

writeFileSync(OUT + ".json", JSON.stringify({ universe, url, hits, tables }, null, 1));
console.log("\nwrote " + OUT + ".png / .json");
if (!process.argv.includes("--keep-open")) await context.close();
