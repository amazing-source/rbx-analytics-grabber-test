import { readFileSync } from "node:fs";
import { parseCaptures, type Capture } from "../src/lib/parse-captures.ts";

const path = process.argv[2] ?? "../rbx-grab-2026-06-23-14-59-29.json";
const captures = JSON.parse(readFileSync(path, "utf8")) as Capture[];

const r = parseCaptures(captures);

console.log("games:", r.games);
console.log("snapshots:", r.snapshots.length);
console.log("catalog (metric->hash):", r.catalog.length);
console.log("benchmarks:", r.benchmarks.length);
console.log("metadata (latestAvailableTime):", r.metadata.length);

const metrics = [...new Set(r.snapshots.map((s) => s.metric))].sort();
console.log("\ndistinct metrics with data:", metrics.length);
console.log(metrics.join(", "));

const invalid = r.snapshots.filter((s) => s.status === "DATA_STATUS_INVALID").length;
console.log("\nsnapshots flagged DATA_STATUS_INVALID:", invalid);

const brokenOut = r.snapshots.filter((s) => Object.keys(s.breakdown).length > 0);
console.log("snapshots with a breakdown:", brokenOut.length);
console.log("sample breakdown row:", JSON.stringify(brokenOut[0], null, 1));

const filtered = r.snapshots.filter((s) => s.filters.length > 0);
console.log("\nsnapshots with a request filter:", filtered.length);
console.log("sample metadata:", JSON.stringify(r.metadata[0]));
console.log("sample benchmark:", JSON.stringify(r.benchmarks[0]));
