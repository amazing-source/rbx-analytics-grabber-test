// Drive a one-time browser grab over a chosen date range, with no clicking.
//
//   npm run grab -- 9963622286 --lifetime
//   npm run grab -- 9963622286 10030829154 --start 2026-01-01 --end 2026-09-04
//   npm run grab -- --all --days 60
//
// This is the SAME path as the dashboard's "Grab now" button: it sends
// `collector:cmd / pull` with {universes, start, end}, which background.js
// forwards to the create.roblox.com tab it opens itself. Nothing to do with the
// scheduler — `runScheduledGrab()` is just badly named, both entry points share
// it so a second grab implementation cannot drift from the first.
//
// The browser path is preferred over Open Cloud for dataset runs: no 30-POST/min
// ceiling, and it is the only path that returns feedback content, annotations,
// genre benchmarks, place-versions and error MessageHash text.
import { readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { launchWithExtension, isLoggedIn, PROFILE_DIR } from "./browser-context.ts";

const DATA = process.env.RBX_DATA_DIR
  ? path.resolve(process.env.RBX_DATA_DIR)
  : path.resolve(import.meta.dirname, "../../data");
const RAW = path.join(DATA, "raw");
const APP = process.env.RBX_APP_URL ?? "http://localhost:3000";

// ------------------------------------------------------------------ arguments
const argv = process.argv.slice(2);
const flag = (n: string) => argv.includes(`--${n}`);
const opt = (n: string) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
if (flag("help") || (!argv.length)) {
  console.log(`
npm run grab -- <universeId...> [options]

  --all                every game under data/games/
  --lifetime           from the game's CREATION date (looked up from the public
                       games API). Not a fixed early date: a window far wider
                       than the game 400s the behavioural metrics outright.
  --days N             the last N days
  --start YYYY-MM-DD   explicit window start
  --end   YYYY-MM-DD   explicit window end (default: tomorrow, so today is whole)
  --timeout MIN        give up waiting after MIN minutes per grab (default 180)
  --keep-open          leave the browser open when finished
`);
  process.exit(0);
}

const ids = argv.filter((a) => /^\d{6,}$/.test(a));
const universes = flag("all")
  ? readdirSync(path.join(DATA, "games")).filter((d) => /^\d+$/.test(d))
  : ids;
if (!universes.length) {
  console.error("no universeIds given (or use --all)");
  process.exit(1);
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return iso(d);
};
const tomorrow = () => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  return iso(d);
};

/**
 * "Lifetime" means since the game was CREATED, not since some fixed early date.
 *
 * A window far wider than the game's life does not merely waste requests — the
 * gateway 400s it. Measured 2026-09-03 on 9758414065 (created 2026-02-19): a
 * 2021-01-01 start produced 15 DailyActiveUsers 400s and left DAU with 44 days
 * of a 161-day span, while a 578-day window on 10192528661 had DAU succeed
 * 17/18. Behavioural metrics have no retention horizon, so losing them to an
 * over-wide ask destroys exactly the history a lifetime grab exists to collect.
 *
 * Public endpoint, no auth. Falls back to a conservative recent start rather
 * than a wide one, because wide is the failure mode.
 */
async function createdDate(universeIds: string[]): Promise<string | null> {
  try {
    const r = await fetch(
      `https://games.roblox.com/v1/games?universeIds=${universeIds.join(",")}`,
      { signal: AbortSignal.timeout(15_000) }
    );
    if (!r.ok) return null;
    const { data } = (await r.json()) as { data?: { id: number; created?: string }[] };
    const dates = (data ?? []).map((g) => g.created).filter(Boolean) as string[];
    if (!dates.length) return null;
    // Earliest creation across the requested games, minus a day of margin.
    const earliest = new Date(dates.sort()[0]);
    earliest.setUTCDate(earliest.getUTCDate() - 1);
    return iso(earliest);
  } catch {
    return null;
  }
}

let start = opt("start");
if (!start && flag("lifetime")) {
  start = (await createdDate(universes)) ?? daysAgo(365);
  console.log(`lifetime  : resolved to ${start} (game creation date)`);
}
start ??= daysAgo(Number(opt("days") ?? 28));
const end = opt("end") ?? tomorrow();
const timeoutMs = Number(opt("timeout") ?? 180) * 60_000;

for (const d of [start, end])
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    console.error(`bad date "${d}" — expected YYYY-MM-DD`);
    process.exit(1);
  }

// -------------------------------------------------------------------- preflight
// The collector POSTs its captures to the local app. Without it the grab runs to
// completion and lands nowhere, which is the most expensive possible failure.
try {
  const r = await fetch(APP, { signal: AbortSignal.timeout(5000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
} catch (e) {
  console.error(`the web app is not answering at ${APP} (${(e as Error).message}).`);
  console.error("Start it first: cd web && npm run dev — otherwise the grab has nowhere to land.");
  process.exit(1);
}

const before = new Set(existsSync(RAW) ? readdirSync(RAW) : []);
const newBundleFor = (u: string) =>
  (existsSync(RAW) ? readdirSync(RAW) : []).filter((f) => f.startsWith(`${u}-`) && !before.has(f));

console.log(`universes : ${universes.join(", ")}`);
console.log(`window    : ${start} -> ${end}`);
console.log(`profile   : ${PROFILE_DIR}`);

const { context, extensionId } = await launchWithExtension();

if (!(await isLoggedIn(context))) {
  console.error("\nthis profile is not logged into Roblox — run `npm run grab:login` once.");
  await context.close();
  process.exit(1);
}

// The collector only exists on create.roblox.com (manifest content_scripts), and
// it is the thing that actually runs the grab — the extension page is only where
// we can call chrome.runtime. background.js does open its own tab via
// ensureDashboardTab(), but relying on that means a slow first load races
// sendToCollector's retry budget and the grab is refused for no visible reason.
// Open the page ourselves and confirm the collector is live BEFORE asking for
// anything.
const robloxPage = await context.newPage();
await robloxPage.goto("https://create.roblox.com/dashboard/creations", {
  waitUntil: "domcontentloaded",
  timeout: 60_000,
});
// Probe the MAIN-world interceptor, not the collector. collector.js runs in the
// ISOLATED world, so `__RBX_COLLECTOR_LOADED__` is on a different window object
// and page.evaluate() can never see it — checking for it always fails, which
// reads as "the extension is broken". interceptor.js is the MAIN-world half of
// the same pair, injected by the same content_scripts entry, so its flag proves
// the extension attached to this page.
try {
  await robloxPage.waitForFunction(
    () => (window as never as { __RBX_INTERCEPTOR_LOADED__?: boolean }).__RBX_INTERCEPTOR_LOADED__ === true,
    undefined,
    { timeout: 30_000 }
  );
  console.log(`extension attached to ${new URL(robloxPage.url()).pathname}`);
} catch {
  console.error(`the extension did not attach to ${robloxPage.url()}`);
  console.error("content_scripts match https://create.roblox.com/* at document_start —");
  console.error("if that URL redirected to a login, the profile's session has expired:");
  console.error("  npm run grab:login");
  await context.close();
  process.exit(1);
}

const page = await context.newPage();
await page.goto(`chrome-extension://${extensionId}/dashboard.html`);

// Fire and poll rather than await: a lifetime grab outlives the service worker's
// message channel, and awaiting it here would report a dead channel as a failed
// grab. The bundle landing in data/raw/ is the real completion signal.
await page.evaluate(
  ([universesArg, startArg, endArg]) => {
    const w = window as unknown as { __rbxGrab?: unknown };
    w.__rbxGrab = { state: "running" };
    chrome.runtime
      .sendMessage({
        type: "collector:cmd",
        cmd: "pull",
        payload: { universes: universesArg, start: startArg, end: endArg },
      })
      .then((r: unknown) => {
        w.__rbxGrab = { state: "done", result: r };
      })
      .catch((e: Error) => {
        w.__rbxGrab = { state: "error", error: String(e?.message || e) };
      });
  },
  [universes.join(","), start, end]
);

console.log("\ngrab started — the extension opens its own create.roblox.com tab\n");

const t0 = Date.now();
let lastLine = "";
const done = new Set<string>();

while (Date.now() - t0 < timeoutMs) {
  await new Promise((r) => setTimeout(r, 4000));

  for (const u of universes)
    if (!done.has(u) && newBundleFor(u).length) {
      done.add(u);
      console.log(`\n  ✓ ${u} landed -> data/raw/${newBundleFor(u)[0]}`);
    }
  if (done.size === universes.length) break;

  // The collector forwards its own status line into extension storage, so this
  // is the same progress the create.roblox.com panel shows.
  const st = (await page
    .evaluate(() => chrome.runtime.sendMessage({ type: "schedule:get" }))
    .catch(() => null)) as { progress?: { text?: string } } | null;
  const line = st?.progress?.text ?? "";
  if (line && line !== lastLine) {
    lastLine = line;
    const mins = ((Date.now() - t0) / 60000).toFixed(1);
    process.stdout.write(`  [${mins}m] ${line.slice(0, 110)}\n`);
  }

  // The reply can be a REFUSAL rather than a throw — background.js answers
  // {ok:false, error} when it cannot reach the collector or open a tab. Treating
  // that as "still running" is how this script sat silent for ten minutes on a
  // grab that never started: waiting looks identical to working.
  const outcome = await page
    .evaluate(
      () =>
        (window as never as { __rbxGrab?: { state: string; error?: string; result?: unknown } })
          .__rbxGrab
    )
    .catch(() => null);

  if (outcome?.state === "error") {
    console.error(`\n  message channel error: ${outcome.error}`);
    console.error("  (the grab may still be running in the tab — still watching data/raw/)");
  }
  if (outcome?.state === "done") {
    const r = outcome.result as { ok?: boolean; error?: string; summary?: string } | null;
    if (r && r.ok === false) {
      console.error(`\n  the extension REFUSED the grab: ${r.error ?? "no reason given"}`);
      console.error("  nothing is running — not waiting for a bundle that will never arrive.");
      if (!flag("keep-open")) await context.close();
      process.exit(1);
    }
    if (r?.summary) console.log(`\n  extension reports: ${String(r.summary).slice(0, 200)}`);
  }
}

const missing = universes.filter((u) => !done.has(u));
console.log("");
if (missing.length) {
  console.log(`landed: ${done.size}/${universes.length}. No bundle yet for: ${missing.join(", ")}`);
  console.log("A long lifetime grab can outlast --timeout; check data/raw/ before re-running.");
} else {
  console.log(`all ${universes.length} grab(s) landed in ${((Date.now() - t0) / 60000).toFixed(1)}m`);
}

if (!flag("keep-open")) await context.close();
process.exit(missing.length ? 2 : 0);
