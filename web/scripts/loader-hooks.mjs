// Node resolver hooks so the app source can be run directly by scripts and
// tests. The source is written for a bundler — extensionless relative imports
// and the "@/" alias — and Node's ESM resolver understands neither. Teach it
// both here rather than contorting the source for a script's benefit.
//
// Import this BEFORE importing anything from src/:
//   import "./loader-hooks.mjs";            (static import, runs first)
//   node --import ./scripts/loader-hooks.mjs …   (tests)
//
// registerHooks is Node >= 22.15.

import { registerHooks } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

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
