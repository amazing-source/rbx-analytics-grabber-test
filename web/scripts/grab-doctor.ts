// Check every precondition a browser grab needs, and say which one is missing.
//
//   npm run grab:doctor
//
// A grab has several ways to fail silently — the app not running (captures land
// nowhere), the profile logged out, the extension not loading — and they all
// look the same from the outside: a grab that "did nothing".
import { launchWithExtension, isLoggedIn, PROFILE_DIR, EXTENSION_DIR } from "./browser-context.ts";

const APP = process.env.RBX_APP_URL ?? "http://localhost:3000";
const ok = (s: string) => console.log(`  ok    ${s}`);
const bad = (s: string, fix: string) => {
  console.log(`  FAIL  ${s}`);
  console.log(`        -> ${fix}`);
  failures++;
};
let failures = 0;

console.log("\nbrowser grab preconditions\n");
console.log(`  extension : ${EXTENSION_DIR}`);
console.log(`  profile   : ${PROFILE_DIR}\n`);

try {
  const r = await fetch(APP, { signal: AbortSignal.timeout(5000) });
  if (r.ok) ok(`web app answering at ${APP}`);
  else bad(`web app returned HTTP ${r.status}`, "cd web && npm run dev");
} catch {
  bad(`web app not answering at ${APP}`, "cd web && npm run dev — without it a grab lands nowhere");
}

let context;
try {
  const launched = await launchWithExtension();
  context = launched.context;
  ok(`extension loaded (id ${launched.extensionId})`);

  const page = await context.newPage();
  await page.goto(`chrome-extension://${launched.extensionId}/dashboard.html`);
  ok(`dashboard page renders ("${await page.title()}")`);

  const reply = await page
    .evaluate(() => chrome.runtime.sendMessage({ type: "schedule:get" }))
    .catch(() => null);
  if (reply) ok("service worker answers messages");
  else bad("service worker did not answer", "reload the extension, then re-run");

  if (await isLoggedIn(context)) ok("profile is logged into Roblox");
  else bad("profile is NOT logged into Roblox", "npm run grab:login (one time)");
} catch (e) {
  bad(`could not launch Chrome with the extension: ${(e as Error).message}`, "npx playwright install chromium");
} finally {
  await context?.close();
}

console.log(failures ? `\n${failures} problem(s) — fix the above, then npm run grab\n` : "\nall clear — npm run grab -- <universeId> --lifetime\n");
process.exit(failures ? 1 : 0);
