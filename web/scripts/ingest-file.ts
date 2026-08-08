// Offline ingest: raw capture bundle on disk -> the data/ file mirror.
// No Supabase, no dev server, no network. This is the path that still works
// when everything else is down.
//
//   npm run ingest:file -- ../data/raw/10192528661-2026-08-07T....json
//   npm run ingest:file -- ../rbx-grab-2026-06-23-14-59-29.json

import "./loader-hooks.mjs";
import { readFileSync } from "node:fs";

const { parseCaptures } = await import("../src/lib/parse-captures.ts");
const { exportToFiles } = await import("../src/lib/export-files.ts");
type Capture = import("../src/lib/parse-captures.ts").Capture;

const file = process.argv[2];
if (!file) {
  console.error("usage: npm run ingest:file -- <captures.json>");
  process.exit(1);
}

const raw = JSON.parse(readFileSync(file, "utf8"));
// Accept both the bare array the extension downloads and the { captures: [] }
// envelope the ingest endpoint expects.
const captures: Capture[] = Array.isArray(raw) ? raw : raw.captures;
if (!Array.isArray(captures)) {
  console.error(`${file}: expected an array of captures, or { captures: [...] }`);
  process.exit(1);
}

const parsed = parseCaptures(captures);
console.log(
  `parsed ${captures.length} captures -> ${parsed.snapshots.length} points, ` +
    `${new Set(parsed.snapshots.map((s) => s.metric)).size} metrics, ` +
    `${parsed.benchmarks.length} benchmark points, games: ${parsed.games.join(", ") || "none"}`
);

if (!parsed.games.length) {
  console.error("no game data in this bundle — nothing to export");
  process.exit(1);
}

const out = await exportToFiles(parsed);
console.log(`wrote ${out.files} files to ${out.dataDir}`);
for (const g of out.games) console.log(`  data/games/${g}/summary.md`);
