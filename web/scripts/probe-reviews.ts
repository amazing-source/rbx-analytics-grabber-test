// Can we poll player reviews as JSON from the logged-in context, instead of
// driving a CSV export? That decides whether a live feedback feed is cheap.
// SECURITY: requests are issued in-page; no cookie enters Node.
import { launchWithExtension, isLoggedIn } from "./browser-context.ts";
const PLACES: [string,string][] = [
  ["99255447043899","Brainrot"], ["139617346573330","Waterslide"],
  ["83256791430098","Monkey"], ["74542317333958","Verity"], ["120014184236770","Seal"],
];
const { context } = await launchWithExtension();
if (!(await isLoggedIn(context))) { console.error("not logged in"); await context.close(); process.exit(1); }
const page = await context.newPage();
await page.goto("https://create.roblox.com/dashboard/creations", { waitUntil:"domcontentloaded", timeout:60_000 });
await page.waitForTimeout(5000);
for (const [placeId, name] of PLACES) {
  const r = await page.evaluate(async (pid) => {
    const u = `https://apis.roblox.com/player-generated-reviews-service/v1/channels/experience-discovery-page/assets/${pid}/reviews?limit=10`;
    const res = await fetch(u, { credentials:"include" });
    return { status: res.status, body: await res.text() };
  }, placeId);
  if (r.status !== 200) { console.log(`${name}: HTTP ${r.status} ${r.body.slice(0,110)}`); continue; }
  let j: any; try { j = JSON.parse(r.body); } catch { console.log(`${name}: non-JSON`); continue; }
  const list = j.reviews ?? j.data ?? j.items ?? [];
  console.log(`\n${name}: HTTP 200, ${list.length} reviews | top-level keys: ${Object.keys(j).join(", ")}`);
  if (list[0]) {
    console.log("  review keys:", Object.keys(list[0]).join(", "));
    for (const rv of list.slice(0,3)) {
      const txt = (rv.text ?? rv.content ?? rv.body ?? rv.comment ?? "").toString().replace(/\s+/g," ").slice(0,80);
      console.log(`   [${rv.sentiment ?? rv.rating ?? rv.isRecommended ?? "?"}] ${rv.created ?? rv.createdUtc ?? rv.createdTime ?? ""} ${txt}`);
    }
  }
}
await context.close();
