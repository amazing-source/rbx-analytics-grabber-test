// Pull the Creator Dashboard error export without anyone clicking.
//
//   npm run export:errors -- 10399712766
//   npm run export:errors -- --all
//   npm run export:errors -- 10638354731 --keep-open
//
// WHY THIS EXISTS: the `MessageHash` -> message-text lookup returns HTTP 500 on
// every universe, so a dashboard export is the ONLY route to an error message
// body. That made "read the error text" a manual step on five games, and four of
// them went stale — Banana Monkey never had one filed at all. This closes it.
//
// SECURITY: identical posture to the grab. We drive the logged-in window and
// click the page's own export control; nothing here reads, stores or transmits
// the session cookie, and `browser-context.ts` still exposes no cookie access.
// Owned games only — this is data the user is already authorised to see.
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, unlinkSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { launchWithExtension, isLoggedIn } from "./browser-context.ts";

const DATA = process.env.RBX_DATA_DIR
  ? path.resolve(process.env.RBX_DATA_DIR)
  : path.resolve(import.meta.dirname, "../../data");
const EXPORTS = path.join(DATA, "exports");

const argv = process.argv.slice(2);
const flag = (n: string) => argv.includes(`--${n}`);
const opt = (n: string) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : undefined; };
const version = opt("version");
const windowArg = opt("window");
const placeArg = opt("place");
if (flag("help") || !argv.length) {
  console.log(`
npm run export:errors -- <universeId...> [--version v608] [--window 28d] [--place <placeId>] [--all] [--keep-open]

Downloads the "Errors and warnings" CSV from the Creator Dashboard and files it
under data/exports/<universe>-<slug>/errors/ using the repo naming rule:
  errors_<YYYY-MM-DD>_<HHMM>_<version band read from the file>_<n>rows.csv

--version filters the page to one Place Version before exporting, which is what
answers "what is this build throwing". Without it you get the page default,
which is the last 1 day across all versions.

--window widens the export. The page has a date-range control
(data-testid="dateRangeSelector") offering: 1h, 1d, 7d, 28d, custom.
Accepts 1h, 1d, 7d, 28d (default: the page default, 1d).

CORRECTED 2026-09-10 (supersedes F29, which claimed the window was hard-clamped
to 24h and the picker changed the page but not the CSV). Measured on 10399712766
filtered to V1246, same run, two windows:
  md5 differs; "[Medal] API error: 404" 276 -> 350, CratesController:85 106 -> 158.
The earlier negative was a race: the table refetches asynchronously after the
range is picked, and exporting before it settles re-downloads the stale rows.
Wait for the refetch (this script waits 10s) BEFORE clicking export.
`);
  process.exit(0);
}

/** Existing export folders carry the slug; fall back to the bare id. */
function folderFor(universe: string): string {
  const dirs = existsSync(EXPORTS) ? readdirSync(EXPORTS) : [];
  const hit = dirs.find((d) => d.startsWith(universe + "-"));
  const dir = path.join(EXPORTS, hit ?? universe, "errors");
  mkdirSync(dir, { recursive: true });
  return dir;
}

// Option VALUES must not be mistaken for universe ids — a place id is also a
// long number, so `--place 139617346573330` was being run as its own universe.
const optionValues = new Set(
  argv.map((a, i) => (a.startsWith("--") ? argv[i + 1] : undefined)).filter(Boolean) as string[],
);
const universes = flag("all")
  ? readdirSync(path.join(DATA, "games")).filter((d) => /^\d+$/.test(d))
  : argv.filter((a) => /^\d{6,}$/.test(a) && !optionValues.has(a));
if (!universes.length) { console.error("no universeIds given (or use --all)"); process.exit(1); }

/** Minimal CSV field reader — enough to pull one column out of the export. */
function column(csv: string, name: string): string[] {
  const rows: string[][] = [];
  let f = "", row: string[] = [], q = false;
  for (let i = 0; i < csv.length; i++) {
    const c = csv[i];
    if (q) { if (c === '"') { if (csv[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n") { row.push(f); f = ""; rows.push(row); row = []; }
    else if (c !== "\r") f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  const head = (rows[0] ?? []).map((h) => h.replace(/^﻿/, "").trim());
  const ix = head.indexOf(name);
  return ix < 0 ? [] : rows.slice(1).map((r) => (r[ix] ?? "").trim()).filter(Boolean);
}

/** "V901,V908,V914" -> "v901-v914"; a single version stays "v914". */
function versionBand(csv: string): string {
  const vs = [...new Set(column(csv, "First seen version"))]
    .map((v) => Number(String(v).replace(/^v/i, "")))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
  if (!vs.length) return "no-version";
  return vs.length === 1 ? `v${vs[0]}` : `v${vs[0]}-v${vs[vs.length - 1]}`;
}

const stamp = (d: Date) =>
  `${d.toISOString().slice(0, 10)}_${String(d.getUTCHours()).padStart(2, "0")}${String(d.getUTCMinutes()).padStart(2, "0")}`;

const { context } = await launchWithExtension();
if (!(await isLoggedIn(context))) {
  console.error("profile is not logged into Roblox — run `npm run grab:login` once");
  await context.close();
  process.exit(1);
}

const page = await context.newPage();
const results: string[] = [];

for (const universe of universes) {
  const url = `https://create.roblox.com/dashboard/creations/experiences/${universe}/analytics/errors`;
  process.stdout.write(`\n${universe} … `);
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    // The table streams in after the shell renders; the export button is disabled
    // until it has rows, so wait for the control rather than a fixed sleep.
    const btn = page.locator('button[aria-label="Export your data to a .CSV file"]');
    await btn.waitFor({ state: "visible", timeout: 60_000 });
    await page.waitForTimeout(4000);

    // Optional window widening. The date-range control refetches the table
    // ASYNCHRONOUSLY, so this must settle before the export click — exporting
    // too early re-downloads the previous window's rows, which is what produced
    // the bogus "the window is hard-clamped to 24h" reading (old F29).
    if (windowArg) {
      const map: Record<string, string> = {
        "1h": "Last 1 hour", "1d": "Last 1 day",
        "7d": "Last 7 days", "28d": "Last 28 days",
      };
      const label = map[String(windowArg).toLowerCase()];
      if (!label) throw new Error("--window must be one of 1h, 1d, 7d, 28d");
      await page.locator('[data-testid="dateRangeSelector"]').first().click({ timeout: 20_000 });
      await page.waitForTimeout(2000);
      const wopt = page.locator("button").filter({ hasText: new RegExp("^" + label + "$") }).first();
      if (!(await wopt.count())) throw new Error(`window "${label}" not offered`);
      await wopt.click({ timeout: 15_000 });
      await page.waitForTimeout(10_000);   // MUST settle before export, see above
      console.log(`window ${label} … `);
    }

    // MULTI-PLACE GAMES: the Place selector defaults to "Experience" (all places
    // aggregated), and while it is on Experience BOTH version controls render
    // DISABLED — which is why 10030829154 failed with a click timeout on every
    // attempt, not because v1719 was missing from the picker. Pick a place first.
    // Options render as "<Name><placeId>", so a bare place id matches.
    if (placeArg) {
      await page.locator('button:has-text("Experience")').first().click({ timeout: 20_000 });
      await page.waitForTimeout(2000);
      const popt = page.locator('[role=option],[role=menuitem],li,button')
        .filter({ hasText: String(placeArg) }).first();
      if (!(await popt.count())) throw new Error(`place ${placeArg} not offered`);
      await popt.click({ timeout: 15_000 });
      await page.keyboard.press("Escape");
      await page.waitForTimeout(8000);
      console.log(`place ${placeArg} … `);
    }

    // Optional version filter. NOTE the control is labelled "New errors since",
    // so this is FirstSeenPlaceVersion >= v — "errors this deploy introduced" —
    // NOT "every error this build throws". Verified 2026-09-10: every row in the
    // v608 and v914 exports carries First seen version == that exact version.
    // (The separate "Place Versions" dropdown is the real per-version filter.)
    // Version labels render as V608, so accept 608, v608 or V608 from the caller.
    if (version) {
      const want = "V" + String(version).replace(/^v/i, "");
      await page.locator('button:has-text("Select version")').last().click({ timeout: 20_000 });
      await page.waitForTimeout(1500);
      const opt = page.locator(`[role=menuitem],[role=option],li`).filter({ hasText: new RegExp(`^${want}$`) }).first();
      if (!(await opt.count())) throw new Error(`version ${want} not offered on the picker`);
      await opt.click({ timeout: 15_000 });
      await page.keyboard.press("Escape");
      await page.waitForTimeout(6000);   // table refetches on filter change
      console.log(`filtered to ${want} … `);
    }

    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 120_000 }),
      btn.click(),
    ]);

    // Land it in a temp path first so the version band can be read from the
    // content — naming the file after what is inside it beats guessing, and an
    // unattributable "Errors and warnings (17).csv" is the thing this avoids.
    const tmp = path.join(os.tmpdir(), `rbx-export-${universe}-${Date.now()}.csv`);
    await download.saveAs(tmp);
    const csv = readFileSync(tmp, "utf8");
    const rows = Math.max(0, csv.trim().split("\n").length - 1);
    const tag = ((version ? "since-v" + String(version).replace(/^v/i, "") : versionBand(csv))
      + (windowArg ? "_" + String(windowArg).toLowerCase() : ""));
    const dest = path.join(folderFor(universe), `errors_${stamp(new Date())}_${tag}_${rows}rows.csv`);
    if (existsSync(dest)) unlinkSync(dest);
    renameSync(tmp, dest);

    const rel = path.relative(path.join(DATA, ".."), dest).replace(/\\/g, "/");
    console.log(`ok — ${rows} rows, ${(statSync(dest).size / 1024).toFixed(1)} KB`);
    console.log(`   ${rel}`);
    results.push(`${universe}  ${rows} rows  ${rel}`);
  } catch (e) {
    console.log(`FAILED — ${(e as Error).message.split("\n")[0].slice(0, 140)}`);
    results.push(`${universe}  FAILED`);
  }
}

console.log(`\n${results.length} universe(s):`);
for (const r of results) console.log("  " + r);
if (!flag("keep-open")) await context.close();
