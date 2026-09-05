// Re-render grab-report.md from a stored grab-report.json, without re-grabbing.
//   npm run rebuild-report -- <universeId>
import "./loader-hooks.mjs";
import { readFileSync } from "node:fs";
import path from "node:path";
const { exportGrabReport } = await import("../src/lib/export-files.ts");
const uid = process.argv[2];
const DATA = process.env.RBX_DATA_DIR ?? path.resolve(import.meta.dirname, "../../data");
const p = path.join(DATA, "games", uid, "grab-report.json");
const report = JSON.parse(readFileSync(p, "utf8"));
const out = await exportGrabReport(report);
console.log("rewrote", out);
