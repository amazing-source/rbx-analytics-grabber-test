// Offline ingest: raw capture bundle on disk -> the data/ file mirror.
// No Supabase, no dev server, no network. This is the path that still works
// when everything else is down.
//
//   npm run ingest:file -- ../data/raw/10192528661-2026-08-07T....json
//   npm run ingest:file -- ../rbx-grab-2026-06-23-14-59-29.json

import { readFileSync } from "node:fs";
import nodeModule from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

// The app source is written for a bundler: extensionless relative imports and
// the "@/" alias. Node's ESM resolver understands neither, so teach it both
// rather than contorting the source for a script's benefit.
// (registerHooks is Node >=22.15; @types/node here is v20, hence the cast.)
type ResolveCtx = { parentURL?: string; conditions: string[]; importAttributes: object };
type ResolveResult = { url: string; format?: string | null; shortCircuit?: boolean };
type Next = (specifier: string, context: ResolveCtx) => ResolveResult;
const { registerHooks } = nodeModule as unknown as {
  registerHooks: (hooks: {
    resolve: (specifier: string, context: ResolveCtx, next: Next) => ResolveResult;
  }) => void;
};

const SRC = pathToFileURL(path.resolve(import.meta.dirname, "../src/")).href + "/";
registerHooks({
  resolve(specifier, context, next) {
    const spec = specifier.startsWith("@/") ? SRC + specifier.slice(2) : specifier;
    try {
      return next(spec, context);
    } catch (e) {
      if (/^[./]/.test(spec) || spec.startsWith(SRC)) {
        for (const ext of [".ts", ".tsx", "/index.ts"]) {
          try {
            return next(spec + ext, context);
          } catch {
            // try the next extension
          }
        }
      }
      throw e;
    }
  },
});

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
