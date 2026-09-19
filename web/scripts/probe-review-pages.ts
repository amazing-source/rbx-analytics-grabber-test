// Does the reviews API page with a cursor, and is it newest-first? Decides
// whether the live poller can backfill a gap longer than one page.
// SECURITY: requests are issued in-page; no cookie enters Node.
import { launchWithExtension, isLoggedIn } from "./browser-context.ts";
const { context } = await launchWithExtension();
if (!(await isLoggedIn(context))) { console.error("not logged in"); await context.close(); process.exit(1); }
const page = await context.newPage();
await page.goto("https://create.roblox.com/dashboard/creations", { waitUntil:"domcontentloaded", timeout:60_000 });
await page.waitForTimeout(4000);
const base = "https://apis.roblox.com/player-generated-reviews-service/v1/channels/experience-discovery-page/assets/74542317333958/reviews?limit=50";
const get = (u: string) => page.evaluate(async (url) => {
  const res = await fetch(url, { credentials:"include" }); return { status: res.status, body: await res.text() };
}, u);
type Rv = { id: string; created_utc: string };
type PageBody = { reviews: Rv[]; next_cursor: string; has_more: boolean };
const p1 = await get(base);
const j1 = JSON.parse(p1.body) as PageBody;
const ts = (rs: Rv[]) => rs.map(r => Number(r.created_utc));
const sortedDesc = (a: number[]) => a.every((v, i) => !i || a[i - 1] >= v);
const iso = (n: number) => new Date(n).toISOString();
const t1 = ts(j1.reviews);
console.log(`p1 ${p1.status} n=${t1.length} has_more=${j1.has_more} cursor=${String(j1.next_cursor).slice(0,40)}`);
console.log(`   newest ${iso(t1[0])} oldest ${iso(t1.at(-1)!)} newest-first=${sortedDesc(t1)}`);
for (const param of ["cursor", "next_cursor", "pageToken"]) {
  const p2 = await get(`${base}&${param}=${encodeURIComponent(j1.next_cursor)}`);
  if (p2.status !== 200) { console.log(`${param}: HTTP ${p2.status} ${p2.body.slice(0,100)}`); continue; }
  const j2 = JSON.parse(p2.body) as PageBody;
  const ids1 = new Set(j1.reviews.map(r => r.id));
  const overlap = j2.reviews.filter(r => ids1.has(r.id)).length;
  const t2 = ts(j2.reviews);
  console.log(`${param}: n=${t2.length} overlap=${overlap} has_more=${j2.has_more} newest ${t2[0] ? iso(t2[0]) : "-"} oldest ${t2.length ? iso(t2.at(-1)!) : "-"} newest-first=${sortedDesc(t2)}`);
}
await context.close();
