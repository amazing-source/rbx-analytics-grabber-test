// Drive a one-time browser grab over a chosen date range, with no clicking.
//
//   npm run grab -- 9963622286 --lifetime
//   npm run grab -- 9963622286 10030829154 --start 2026-01-01 --end 2026-09-04
//   npm run grab -- --all --days 60
//
// This is the SAME path as the dashboard's "Grab now" button: it sends
// `collector-cmd / pull` with {universes, start, end}, which background.js
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
  --lifetime           from 2021-01-01 (the technical rung is horizon-clamped,
                       so a lifetime window now costs about what 30 days costs)
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

const start = opt("start") ?? (flag("lifetime") ? "2021-01-01" : daysAgo(Number(opt("days") ?? 28)));
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
        type: "collector-cmd",
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

  const outcome = (await page.evaluate(() => (window as never as { __rbxGrab?: { state: string; error?: string } }).__rbxGrab).catch(() => null));
  if (outcome?.state === "error") {
    console.error(`\n  message channel error: ${outcome.error}`);
    console.error("  (the grab itself may still be running in the tab — checking for bundles)");
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
