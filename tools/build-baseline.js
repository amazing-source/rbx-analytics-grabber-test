// Emit headline-daily.csv + a settled metric table for one universe.
// Reads the corpus only (no API). ONE_DAY, headline series, FILLED_ZERO and
// partial dropped, so every row is quotable as-is.
const fs = require("fs");
const path = require("path");
const L = require("C:/Users/bfhdh/Desktop/rbx-analytics-grabber-test/tools/lib.js");

const [, , universe, outDir, cutoff] = process.argv; // cutoff = last date to KEEP (pre-update)
fs.mkdirSync(path.join(outDir, "series"), { recursive: true });

// percent series are stored as fractions; robux and minutes carry their own marks
function show(v, unit) {
  if (v == null) return "—";
  if (unit === "percent") return (v * 100).toFixed(2) + "%";
  if (unit === "robux") return "R$ " + L.fmt(v, 2);
  if (unit === "minutes") return L.fmt(v, 2) + " min";
  if (unit === "seconds") return L.fmt(v, 1) + " s";
  return L.fmt(v, 2) + (unit && unit !== "count" ? " " + unit : "");
}

const j = L.load(universe);
const rows = [];
const table = [];
for (const name of L.listMetrics(universe)) {
  const m = j.metrics[name];
  const d = L.daily(universe, name);
  if (!d || !d.size) continue;
  const kept = [...d].filter(([date]) => date <= cutoff);
  if (!kept.length) continue;
  for (const [date, v] of kept) rows.push(`${name},${date},${v},Total`);
  const [lastDate, lastVal] = kept.at(-1);
  const prior = kept.length >= 8 ? kept.at(-8) : kept[0];
  const delta = prior && prior[1] ? ((lastVal - prior[1]) / prior[1]) * 100 : null;
  table.push({
    name, label: m.label || name, category: m.category || "Other", kind: m.kind || "",
    unit: m.unit || "", latest: lastVal, as_of: lastDate,
    d7: delta, d7_from: prior ? prior[0] : null, d7_val: prior ? prior[1] : null,
    points: kept.length,
  });
}
rows.sort();
fs.writeFileSync(path.join(outDir, "series", "headline-daily.csv"),
  "metric,date,value,series\n" + rows.join("\n") + "\n");
fs.writeFileSync(path.join(outDir, "series", "metric-table.json"), JSON.stringify(table, null, 1));

table.sort((a, b) => (a.category + a.label).localeCompare(b.category + b.label));
let cat = "";
const out = [];
for (const t of table) {
  if (t.category !== cat) {
    cat = t.category;
    out.push(`\n### ${cat}\n`, "| Metric | Kind | Latest (settled) | As of | Δ7d | from |", "|---|---|---|---|---|---|");
  }
  const dv = t.d7 == null ? "—" : `${t.d7 >= 0 ? "▲" : "▼"} ${Math.abs(t.d7).toFixed(1)}%`;
  out.push(`| ${t.label} | ${t.kind} | ${show(t.latest, t.unit)} | ${t.as_of} | ${dv} | ${t.d7_from ?? "—"} |`);
}
fs.writeFileSync(path.join(outDir, "series", "metric-table.md"), out.join("\n") + "\n");
console.log(`${universe}: ${table.length} metrics with a settled headline daily series, ${rows.length} rows, cutoff ${cutoff}`);
