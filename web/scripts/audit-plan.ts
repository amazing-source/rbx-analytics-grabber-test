// Audits the seed plan's provenance claims against reality:
//
//   observed — the same shape appears in a captured dashboard request
//              (data/raw/*.json, passive captures)
//   proven   — an active grab has returned data for the shape
//              (data/games/*/grab-report.json)
//   inferred — neither: a guess. Allowed only on `optional` templates,
//              because an inferred shape's failure or empty result must never
//              be reported as a finding about a game.
//
//   npm run audit-plan
//
// Exit 1 when a non-optional template is inferred-in-fact, or when a template
// CLAIMS observed but no capture backs it. Both are how false findings start.

import "./loader-hooks.mjs";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const { buildSeedTemplates } = await import("../src/lib/default-plan.ts");

const DATA = process.env.RBX_DATA_DIR
  ? path.resolve(process.env.RBX_DATA_DIR)
  : path.resolve(import.meta.dirname, "../../data");

// ---------------------------------------------------------------- signatures

const SG = (g: string | undefined) => (g ?? "").replace("METRIC_GRANULARITY_", "");
const opTag = (op: string | undefined) =>
  op && op !== "FILTER_OPERATION_IN" ? `(${op.replace("FILTER_OPERATION_", "")})` : "";

function sig(
  kind: string,
  metric: string,
  gran: string | undefined,
  breakdown: unknown[] | undefined,
  filter: unknown[] | undefined
): string {
  const bd = (breakdown ?? [])
    .flatMap((b) => ((b as { dimensions?: string[] }).dimensions ?? []))
    .join("+");
  const fl = (filter ?? [])
    .map((f) => {
      const ff = f as { dimension?: string; operation?: string };
      return `${ff.dimension ?? "?"}${opTag(ff.operation)}`;
    })
    .sort()
    .join(",");
  return `${kind}|${metric}|${SG(gran)}|${bd}|${fl}`;
}

// ---------------------------------------------------------------- corpora

function observedSigs(): Set<string> {
  const out = new Set<string>();
  let files: string[] = [];
  try {
    files = readdirSync(path.join(DATA, "raw")).filter((f) => f.endsWith(".json"));
  } catch {
    return out;
  }
  for (const f of files) {
    let caps: { url?: string; via?: string; reqBody?: string | null }[];
    try {
      caps = JSON.parse(readFileSync(path.join(DATA, "raw", f), "utf8"));
    } catch {
      continue;
    }
    for (const c of caps) {
      const url = c.url ?? "";
      // Only PASSIVE captures are dashboard evidence — our own replays
      // proving themselves would be circular.
      if (c.via === "active") continue;
      let kind: "metric" | "benchmark" | null = null;
      if (/analytics-query-gateway\/v1\/metrics\/resource/.test(url)) kind = "metric";
      else if (/analytics-benchmark\/v1\/benchmarks\/resource/.test(url)) kind = "benchmark";
      if (!kind) continue;
      let rb: Record<string, unknown> | null = null;
      try {
        rb = typeof c.reqBody === "string" ? JSON.parse(c.reqBody) : (c.reqBody as never);
      } catch {
        continue;
      }
      const q = (kind === "benchmark" ? rb : (rb?.query as Record<string, unknown>)) as
        | { metric?: string; granularity?: string; breakdown?: unknown[]; filter?: unknown[] }
        | null;
      if (!q?.metric) continue;
      out.add(sig(kind, q.metric, q.granularity, q.breakdown, q.filter));
    }
  }
  return out;
}

function provenSigs(): Set<string> {
  const out = new Set<string>();
  let games: string[] = [];
  try {
    games = readdirSync(path.join(DATA, "games"));
  } catch {
    return out;
  }
  for (const g of games) {
    let report: {
      attempts?: {
        kind: string;
        metric: string | null;
        granularity: string;
        breakdown: string;
        filter: string;
        ok: boolean;
        points: number;
      }[];
    };
    try {
      report = JSON.parse(
        readFileSync(path.join(DATA, "games", g, "grab-report.json"), "utf8")
      );
    } catch {
      continue;
    }
    for (const a of report.attempts ?? []) {
      if (!a.ok || a.points <= 0 || !a.metric) continue;
      if (a.kind !== "metric" && a.kind !== "benchmark") continue;
      const breakdown = a.breakdown ? [{ dimensions: a.breakdown.split("+") }] : [];
      const filter = (a.filter || "")
        .split(",")
        .filter(Boolean)
        .map((x) => ({ dimension: x.split("=")[0] }));
      out.add(sig(a.kind, a.metric, a.granularity, breakdown, filter));
    }
  }
  return out;
}

// ---------------------------------------------------------------- audit

const observed = observedSigs();
const proven = provenSigs();

// Materialize the FULL plan, funnels and perf included, with placeholder
// discovery values (signatures ignore values, only dimension names count).
const templates = buildSeedTemplates({
  FunnelName: ["__AUDIT__"],
  FirstSeenPlaceVersion: ["1"],
  __places: ["1"],
});

let failures = 0;
let upgrades = 0;
const shapeText = (s: string) => {
  const [, metric, gran, bd, fl] = s.split("|");
  return [metric, gran, bd && `by ${bd}`, fl && `where ${fl}`].filter(Boolean).join(" · ");
};

for (const t of templates) {
  const s = sig(t.kind, t.metric, t.query.granularity, t.query.breakdown, t.query.filter);
  const fact = observed.has(s) ? "observed" : proven.has(s) ? "proven" : "inferred";
  const claim = t.provenance ?? "inferred";

  if (claim === "observed" && fact !== "observed") {
    console.log(`FALSE CLAIM  ${shapeText(s)} — tagged observed, no passive capture matches`);
    failures++;
  }
  if (fact === "inferred" && claim === "proven") {
    console.log(`STALE CLAIM  ${shapeText(s)} — tagged proven, but no grab report shows data for it`);
    failures++;
  }
  if (fact === "inferred" && !t.optional) {
    console.log(`GUESS        ${shapeText(s)} — non-optional but neither observed nor proven`);
    failures++;
  }
  if (fact === "observed" && claim !== "observed") {
    console.log(`upgradable   ${shapeText(s)} — tagged ${claim}, actually observed in captures`);
    upgrades++;
  }
}

console.log(
  `\n${templates.length} templates · ${observed.size} observed shapes in corpus · ${proven.size} proven shapes · ${failures} failure(s) · ${upgrades} upgradable tag(s)`
);
if (failures) {
  console.log("fix the tags or the templates — an untagged guess is how false findings start");
}
process.exitCode = failures ? 1 : 0;
