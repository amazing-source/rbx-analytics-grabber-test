// RECON ONLY — learn the Explore tab's URL, DOM and traffic. Writes no repo data.
// Security posture identical to the grab: we drive the logged-in window; nothing
// here reads, stores or transmits the session cookie.
import { launchWithExtension, isLoggedIn } from "./browser-context.ts";
import { writeFileSync } from "node:fs";

const universe = process.argv[2] ?? "10638354731";
const OUT = process.argv[3] ?? "./explore-recon";

const { context } = await launchWithExtension();
if (!(await isLoggedIn(context))) { console.error("not logged in — run `npm run grab:login`"); await context.close(); process.exit(1); }

const page = await context.newPage();

type Hit = { url: string; method: string; status?: number; req?: unknown; res?: unknown };
const hits: Hit[] = [];
const reqBodies = new Map<string, string>();

page.on("request", (r) => {
  const u = r.url();
  if (!u.includes("apis.roblox.com")) return;
  const d = r.postData();
  if (d) reqBodies.set(r.method() + " " + u + " " + d.slice(0, 60), d);
});

page.on("response", async (r) => {
  const u = r.url();
  if (!u.includes("apis.roblox.com")) return;
  if (/translations-cdn|barista-feature-flags|product-experimentation/.test(u)) return;
  let res: unknown;
  try { res = await r.json(); } catch { /* non-JSON */ }
  let req: unknown;
  const raw = r.request().postData();
  if (raw) { try { req = JSON.parse(raw); } catch { req = raw; } }
  hits.push({ url: u, method: r.request().method(), status: r.status(), req, res });
});

// 1) Land on the analytics area and FIND the Explore tab rather than guessing.
const root = `https://create.roblox.com/dashboard/creations/experiences/${universe}/analytics`;
console.log("goto", root);
await page.goto(root, { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForTimeout(8000);

const links = await page.evaluate(() =>
  Array.from(document.querySelectorAll("a")).map((a) => ({
    text: (a.textContent || "").trim().slice(0, 40),
    href: (a as HTMLAnchorElement).href,
  })).filter((x) => x.text && x.href.includes("/analytics"))
);
console.log("=== analytics nav links ===");
for (const l of links) console.log(" ", l.text.padEnd(28), l.href.replace(/^https:\/\/create\.roblox\.com/, ""));

const explore = links.find((l) => /explore/i.test(l.text) || /explore/i.test(l.href));
if (explore) {
  console.log("\ngoto EXPLORE ->", explore.href);
  await page.goto(explore.href, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(12_000);
} else {
  console.log("\n!! no Explore link found in nav — dumping what exists");
}

// 2) Dump the interactive controls so the next pass can address them precisely.
const controls = await page.evaluate(() =>
  Array.from(document.querySelectorAll("button,[role=combobox],[role=listbox],[data-testid],select"))
    .map((e) => ({
      tag: e.tagName.toLowerCase(),
      testid: e.getAttribute("data-testid") || "",
      aria: e.getAttribute("aria-label") || "",
      role: e.getAttribute("role") || "",
      text: (e.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60),
    }))
    .filter((x) => x.testid || x.aria || x.text)
);
console.log("\n=== controls (" + controls.length + ") ===");
const seen = new Set<string>();
for (const c of controls) {
  const k = `${c.tag}|${c.testid}|${c.aria}|${c.text}`;
  if (seen.has(k)) continue; seen.add(k);
  console.log(`  <${c.tag}> testid=${JSON.stringify(c.testid)} aria=${JSON.stringify(c.aria)} role=${c.role} :: ${c.text}`);
}

console.log("\n=== url now ===", page.url());
console.log("=== api hits (" + hits.length + ") ===");
const counts: Record<string, number> = {};
for (const h of hits) { const b = h.url.split("?")[0]; counts[b] = (counts[b] || 0) + 1; }
for (const [u, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(String(n).padStart(3), u);

writeFileSync(OUT + ".json", JSON.stringify({ url: page.url(), links, controls, hits }, null, 1));
await page.screenshot({ path: OUT + ".png", fullPage: true });
console.log("\nwrote " + OUT + ".json and " + OUT + ".png");
if (!process.argv.includes("--keep-open")) await context.close();
