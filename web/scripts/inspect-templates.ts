// What is in the shared `grab_templates` table, and what the re-scoping does to
// it for a given universe's discovered values.
//   node scripts/inspect-templates.ts
import "./loader-hooks.mjs";
import { readFileSync } from "node:fs";

for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const t = line.trim();
  const i = t.indexOf("=");
  if (i < 1 || t.startsWith("#")) continue;
  process.env[t.slice(0, i).trim()] ??= t.slice(i + 1).trim();
}

const { supabase } = await import("../src/lib/supabase.ts");
const { retargetLearnedQuery } = await import("../src/lib/retarget-templates.ts");

const { data, error } = await supabase.from("grab_templates").select("key, kind, metric, query");
if (error) {
  console.error("ERR", error.message);
  process.exit(1);
}
console.log("rows in grab_templates:", data?.length, "(shared across every universe)");

// 10192528661's real discovery output, from its 2026-09-03 grab report.
const DISCOVERED = {
  __places: ["71469476498100"],
  Place: ["71469476498100"],
  FunnelName: ["FUNNEL_TYPE_ONBOARDING"],
  PlaceVersion: ["24", "27", "28"],
  FirstSeenPlaceVersion: ["3", "20", "17", "27", "28", "23", "19", "15", "24"],
};

let kept = 0, changed = 0, dropped = 0;
const dropDims: Record<string, number> = {};
for (const t of data ?? []) {
  const r = retargetLearnedQuery(t.query as never, DISCOVERED as never);
  if (r.query === null) {
    dropped++;
    const d = (r as { dimension: string }).dimension;
    dropDims[d] = (dropDims[d] ?? 0) + 1;
  } else if ((r as { changed: boolean }).changed) changed++;
  else kept++;
}
console.log(`\nre-scoped for universe 10192528661:`);
console.log(`  kept unchanged   ${kept}`);
console.log(`  re-targeted      ${changed}   <- would have carried another game's values`);
console.log(`  dropped          ${dropped}`);
for (const [d, n] of Object.entries(dropDims)) console.log(`      ${d}: ${n}`);
