// Writes every ingest to a plain-file mirror under <repo>/data, so the data is
// readable without the web app or Supabase running — by a person, by a script,
// or by Claude Code reading the repo.
//
// Supabase stays the source of truth for the app; this is a second, dumber sink
// that never fails the ingest. Each export MERGES into what's already on disk
// (same key => last write wins), so a series accumulates across grabs instead of
// being replaced by whatever window the latest grab happened to cover.

import { promises as fs } from "node:fs";
import path from "node:path";
import type { ParseResult, Snapshot, PlaceVersion } from "./parse-captures";
import { metricInfo, formatValue, deltaIsGood, type Category } from "./metric-info";

// ---------------------------------------------------------------- file layout

// data/ sits next to web/ at the repo root. Resolve it by walking up from cwd
// looking for the extension manifest, so this works whether the process was
// started in web/ or at the root. RBX_DATA_DIR overrides.
export async function resolveDataDir(): Promise<string> {
  if (process.env.RBX_DATA_DIR) return path.resolve(process.env.RBX_DATA_DIR);
  let dir = process.cwd();
  for (let i = 0; i < 5; i++) {
    try {
      await fs.access(path.join(dir, "manifest.json"));
      await fs.access(path.join(dir, "web"));
      return path.join(dir, "data");
    } catch {
      const up = path.dirname(dir);
      if (up === dir) break;
      dir = up;
    }
  }
  return path.resolve(process.cwd(), "data");
}

// ---------------------------------------------------------------- on-disk shape

export type ExportPoint = { date: string; ts: string; value: number | null; status: string | null };
export type ExportSeries = {
  key: string;
  label: string;
  granularity: string;
  breakdown: Record<string, string>;
  filters: Snapshot["filters"];
  points: ExportPoint[];
};
export type ExportMetric = {
  metric: string;
  label: string;
  category: Category;
  unit: string;
  kind: "rate" | "volume";
  higherIsBetter: boolean;
  blurb: string;
  latestAvailableTime: string | null;
  hash: string | null;
  series: ExportSeries[];
};
export type GameExport = {
  universeId: string;
  genre: string | null;
  generatedAt: string;
  metrics: Record<string, ExportMetric>;
  benchmarks: Record<string, Record<string, ExportPoint[]>>; // metric -> percentile -> points
};

// Series identity on disk includes granularity — the same breakdown pulled
// hourly and daily are two different series, not one that overwrites the other.
const seriesId = (granularity: string, seriesKey: string) => `${granularity}::${seriesKey}`;

function labelFor(breakdown: Record<string, string>, filters: Snapshot["filters"]): string {
  const bd = Object.entries(breakdown).map(([k, v]) => `${k}: ${v}`).join(", ");
  const fl = (filters ?? []).map((f) => `${f.dimension}=${f.values.join("/")}`).join(", ");
  return [bd, fl].filter(Boolean).join(" · ") || "Total";
}

async function readExisting(file: string): Promise<GameExport | null> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as GameExport;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- merge

function mergeGame(prev: GameExport | null, gameId: string, r: ParseResult): GameExport {
  const out: GameExport = prev ?? {
    universeId: gameId,
    genre: null,
    generatedAt: "",
    metrics: {},
    benchmarks: {},
  };
  out.universeId = gameId;
  out.generatedAt = new Date().toISOString();

  for (const b of r.benchmarks) if (b.gameId === gameId && b.genre) out.genre = b.genre;

  const hashes = new Map(r.catalog.filter((c) => c.gameId === gameId).map((c) => [c.metric, c.hash]));
  // metrics/metadata has no universeId in its URL — freshness is global per metric.
  const fresh = new Map(r.metadata.map((m) => [m.metric, m.latestAvailableTime]));

  // index existing series so new points merge in by timestamp
  const index = new Map<string, Map<string, ExportPoint>>();
  for (const m of Object.values(out.metrics)) {
    for (const s of m.series) {
      index.set(
        `${m.metric}|${seriesId(s.granularity, s.key)}`,
        new Map(s.points.map((p) => [p.ts, p]))
      );
    }
  }

  for (const s of r.snapshots) {
    if (s.gameId !== gameId) continue;
    const info = metricInfo(s.metric);
    const m = (out.metrics[s.metric] ??= {
      metric: s.metric,
      label: info.label || s.metric,
      category: info.category,
      unit: info.unit,
      kind: info.kind,
      higherIsBetter: info.higherIsBetter,
      blurb: info.blurb,
      latestAvailableTime: null,
      hash: null,
      series: [],
    });
    // keep the human metadata current even for metrics exported before it existed
    m.label = info.label || s.metric;
    m.category = info.category;
    m.unit = info.unit;
    m.kind = info.kind;
    m.higherIsBetter = info.higherIsBetter;
    m.blurb = info.blurb;

    const sid = seriesId(s.granularity, s.seriesKey);
    let series = m.series.find((x) => seriesId(x.granularity, x.key) === sid);
    if (!series) {
      series = {
        key: s.seriesKey,
        label: labelFor(s.breakdown, s.filters),
        granularity: s.granularity,
        breakdown: s.breakdown,
        filters: s.filters,
        points: [],
      };
      m.series.push(series);
    }
    const bucket = index.get(`${s.metric}|${sid}`) ?? new Map<string, ExportPoint>();
    bucket.set(s.ts, { date: s.date, ts: s.ts, value: s.value, status: s.status });
    index.set(`${s.metric}|${sid}`, bucket);
  }

  // write merged points back, sorted
  for (const m of Object.values(out.metrics)) {
    m.hash = hashes.get(m.metric) ?? m.hash;
    m.latestAvailableTime = fresh.get(m.metric) ?? m.latestAvailableTime;
    for (const s of m.series) {
      const bucket = index.get(`${m.metric}|${seriesId(s.granularity, s.key)}`);
      if (bucket) s.points = [...bucket.values()].sort((a, b) => a.ts.localeCompare(b.ts));
    }
    m.series.sort((a, b) => (a.label === "Total" ? -1 : b.label === "Total" ? 1 : a.label.localeCompare(b.label)));
  }

  for (const b of r.benchmarks) {
    if (b.gameId !== gameId) continue;
    const perMetric = (out.benchmarks[b.metric] ??= {});
    const pts = (perMetric[b.percentile] ??= []);
    const at = pts.findIndex((p) => p.ts === b.ts);
    const point: ExportPoint = { date: b.date, ts: b.ts, value: b.value, status: null };
    if (at >= 0) pts[at] = point;
    else pts.push(point);
  }
  for (const perMetric of Object.values(out.benchmarks))
    for (const pts of Object.values(perMetric)) pts.sort((a, b) => a.ts.localeCompare(b.ts));

  return out;
}

// ---------------------------------------------------------------- rollup

// Hourly metrics (the whole Performance tab, peak CCU, item revenue) need a
// daily view to line up with the rest of the comparison window.
const ROLLUP: Record<string, "max" | "sum" | "mean"> = {
  PeakConcurrentPlayers: "max",
  ConcurrentPlayers: "max",
  ItemMonetizationRevenue: "sum",
  OomUnexpectedExits: "sum",
};

function rollupRule(m: ExportMetric): "max" | "sum" | "mean" {
  return ROLLUP[m.metric] ?? (m.kind === "rate" ? "mean" : "sum");
}

// `samples` is how many hourly points fed the day — a day with fewer than 24 is
// partial, which matters a lot for `sum` rollups and not at all for `mean`.
type DailyPoint = ExportPoint & { samples: number };

function rollupToDaily(points: ExportPoint[], rule: "max" | "sum" | "mean"): DailyPoint[] {
  const byDate = new Map<string, number[]>();
  for (const p of points) {
    if (p.value == null) continue;
    const arr = byDate.get(p.date) ?? [];
    arr.push(p.value);
    byDate.set(p.date, arr);
  }
  return [...byDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, vals]) => ({
      date,
      ts: `${date}T00:00:00.000Z`,
      value:
        rule === "max" ? Math.max(...vals)
        : rule === "sum" ? vals.reduce((s, v) => s + v, 0)
        : vals.reduce((s, v) => s + v, 0) / vals.length,
      status: null,
      samples: vals.length,
    }));
}

const isHourly = (g: string) => g === "METRIC_GRANULARITY_ONE_HOUR";

// ---------------------------------------------------------------- rendering

function csvEscape(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function metricCsv(m: ExportMetric): string {
  const rows = ["date,ts,granularity,series,value,status"];
  for (const s of m.series)
    for (const p of s.points)
      rows.push(
        [p.date, p.ts, s.granularity, csvEscape(s.label), p.value ?? "", p.status ?? ""].join(",")
      );
  return rows.join("\n") + "\n";
}

function dailyCsv(m: ExportMetric): string | null {
  const hourly = m.series.filter((s) => isHourly(s.granularity));
  if (!hourly.length) return null;
  const rule = rollupRule(m);
  const rows = [`date,series,value,agg,samples`];
  for (const s of hourly)
    for (const p of rollupToDaily(s.points, rule))
      rows.push([p.date, csvEscape(s.label), p.value ?? "", rule, p.samples].join(","));
  return rows.join("\n") + "\n";
}

// Latest value + a like-for-like comparison ~7 points back, which is the same
// week-over-week read the dashboard tiles show.
function headline(m: ExportMetric) {
  const total = m.series.find((s) => s.label === "Total") ?? m.series[0];
  if (!total) return null;
  const pts = isHourly(total.granularity)
    ? rollupToDaily(total.points, rollupRule(m))
    : total.points;
  const withValues = pts.filter((p) => p.value != null);
  if (!withValues.length) return null;
  const last = withValues[withValues.length - 1];
  const prev = withValues.length > 7 ? withValues[withValues.length - 8] : withValues[0];
  const deltaPct =
    prev && prev.value != null && prev.value !== 0 && last.value != null && prev !== last
      ? ((last.value - prev.value) / Math.abs(prev.value)) * 100
      : null;
  // Nearly every series has an unvalidated tail, so flagging "contains an
  // estimate" would flag everything. What actually changes a read is whether
  // the number being quoted is itself an estimate.
  const latestRaw = total.points.filter((p) => p.value != null).pop();
  return {
    seriesLabel: total.label,
    date: last.date,
    value: last.value,
    deltaPct,
    latestIsEstimate: latestRaw?.status === "DATA_STATUS_INVALID",
    partialDay: isHourly(total.granularity) && (last as DailyPoint).samples < 24,
    points: withValues.length,
  };
}

function benchmarkVerdict(g: GameExport, m: ExportMetric, latest: number | null): string {
  if (latest == null) return "";
  const b = g.benchmarks[m.metric];
  if (!b) return "";
  const lastOf = (pct: string) => {
    const pts = (b[pct] ?? []).filter((p) => p.value != null);
    return pts.length ? pts[pts.length - 1].value! : null;
  };
  const p50 = lastOf("50");
  const p90 = lastOf("90");
  if (p90 != null && latest >= p90) return "top 10% for genre";
  if (p50 != null && latest >= p50) return "above genre median";
  if (p50 != null) return "below genre median";
  return "";
}

function summaryMd(g: GameExport): string {
  const order: Category[] = ["Discovery", "Retention", "Monetization", "Engagement", "Funnel", "Performance", "Other"];
  const byCat = new Map<Category, ExportMetric[]>();
  for (const m of Object.values(g.metrics)) {
    const arr = byCat.get(m.category) ?? [];
    arr.push(m);
    byCat.set(m.category, arr);
  }

  const out: string[] = [];
  out.push(`# Universe ${g.universeId} — metric summary`);
  out.push("");
  out.push(`- Genre: **${g.genre ?? "unknown"}**`);
  out.push(`- Exported: ${g.generatedAt}`);
  out.push(`- Metrics captured: ${Object.keys(g.metrics).length}`);
  const freshVals = Object.values(g.metrics).map((m) => m.latestAvailableTime).filter(Boolean).sort();
  if (freshVals.length) out.push(`- Data fresh through: **${String(freshVals[freshVals.length - 1]).slice(0, 10)}**`);
  out.push("");
  out.push(
    "Δ is the latest point vs ~7 points earlier on the same series. `rate` metrics are safe to compare across a growth window; `volume` metrics are not — read their trend, and check DAU growth before drawing a conclusion."
  );
  out.push("");

  for (const cat of order) {
    const metrics = (byCat.get(cat) ?? []).sort((a, b) => a.label.localeCompare(b.label));
    if (!metrics.length) continue;
    out.push(`## ${cat}`);
    out.push("");
    out.push("| Metric | Kind | Latest | As of | Δ | vs genre | Series | Notes |");
    out.push("|---|---|---|---|---|---|---|---|");
    for (const m of metrics) {
      const h = headline(m);
      if (!h) {
        out.push(`| ${m.label} | ${m.kind} | — | — | — | — | ${m.series.length} | no values |`);
        continue;
      }
      const good = deltaIsGood(m.metric, h.deltaPct);
      // Only warn on a move big enough to be worth looking at — a 0.1% drift
      // marked ⚠ trains you to ignore the column.
      const material = h.deltaPct != null && Math.abs(h.deltaPct) >= 2;
      const arrow = h.deltaPct == null ? "—" : `${h.deltaPct > 0 ? "▲" : "▼"} ${Math.abs(h.deltaPct).toFixed(1)}%${good === false && material ? " ⚠" : ""}`;
      const notes = [
        h.seriesLabel !== "Total" ? `shown: ${h.seriesLabel}` : "",
        h.latestIsEstimate ? "latest point is an estimate" : "",
        h.partialDay ? "last day partial" : "",
      ].filter(Boolean).join("; ");
      out.push(
        `| ${m.label} | ${m.kind} | ${formatValue(m.metric, h.value)} | ${h.date} | ${arrow} | ${benchmarkVerdict(g, m, h.value) || "—"} | ${m.series.length} | ${notes || "—"} |`
      );
    }
    out.push("");
  }

  out.push("## Files");
  out.push("");
  out.push("- `series.json` — every metric, every breakdown, every point. The full record.");
  out.push("- `metrics/<Metric>.csv` — one long-format CSV per metric (`date,ts,granularity,series,value,status`).");
  out.push("- `metrics/<Metric>.daily.csv` — daily rollup of hourly metrics; `agg` says how (mean for rates, sum for volumes, max for concurrents) and `samples` how many hours fed the day — anything under 24 is a partial day.");
  out.push("- `catalog.json` — metric → response-path hash, freshness, and the series inventory.");
  out.push("");
  return out.join("\n");
}

function catalogJson(g: GameExport) {
  return {
    universeId: g.universeId,
    genre: g.genre,
    generatedAt: g.generatedAt,
    metrics: Object.values(g.metrics)
      .sort((a, b) => a.metric.localeCompare(b.metric))
      .map((m) => ({
        metric: m.metric,
        label: m.label,
        category: m.category,
        unit: m.unit,
        kind: m.kind,
        higherIsBetter: m.higherIsBetter,
        // response-path hash for this capture — informational only, never a key
        hash: m.hash,
        latestAvailableTime: m.latestAvailableTime,
        series: m.series.map((s) => ({
          label: s.label,
          granularity: s.granularity,
          points: s.points.length,
          firstDate: s.points[0]?.date ?? null,
          lastDate: s.points[s.points.length - 1]?.date ?? null,
        })),
      })),
  };
}

const ROOT_README = `# data/ — the file mirror

Every ingest writes here as well as to Supabase. Nothing in this folder needs
the web app or a database to read.

## Layout

    data/
      raw/<universeId>-<timestamp>.json   raw capture bundles from the extension
      games/<universeId>/
        summary.md        headline table per category — start here
        series.json       full structured record (all metrics, breakdowns, points)
        catalog.json      metric inventory: hash, freshness, series counts
        metrics/*.csv     one long-format CSV per metric
        metrics/*.daily.csv  daily rollup of the hourly metrics

## Reading the numbers

- **All timestamps are UTC.** Daily points are stamped at 08:00:00Z; the \`date\`
  column is the UTC date and is what you should join on.
- **\`status: DATA_STATUS_INVALID\` means unvalidated/estimated, not wrong.**
  Keep the value; treat it as a confidence flag.
- **rate vs volume.** Rate metrics (retention %, conversion, ARPPU, ARPDAU,
  average session length, crash rate, FPS) are comparable before/after an update
  even while the game grows. Volume metrics (DAU, revenue, paying users,
  sessions) are not — a +40% revenue delta means nothing without the DAU delta
  next to it.
- **Empty breakdown = the "Total" series.** A metric with only broken-down
  series (funnels, always per-step) has no Total row.
- **Hourly metrics** (Performance tab, peak CCU, item revenue) also get a
  \`.daily.csv\` rollup so they line up with the daily metrics. \`agg\` records
  the aggregation used and \`samples\` how many hourly points fed the day —
  fewer than 24 means a partial day, which understates any \`sum\` rollup.
- **Freshness matters.** \`catalog.json\` carries \`latestAvailableTime\` per
  metric. Don't read a D7 retention number for a cohort younger than 7 days.

## Regenerating

    cd web && npm run ingest:file -- ../data/raw/<file>.json

turns a raw capture bundle into this layout with no database involved.
`;

// ---------------------------------------------------------------- entry points

export type GrabAttempt = {
  metric: string | null;
  kind: string;
  granularity: string;
  breakdown: string;
  filter: string;
  optional: boolean;
  status: number;
  ok: boolean;
  points: number;
  error: string | null;
};
export type GrabReport = {
  universeId: string;
  startTime: string;
  endTime: string;
  planSource?: string;
  discovered?: Record<string, string[]> | null;
  requested: number;
  attempts: GrabAttempt[];
};

// What the grab asked for and what came back — including everything that
// didn't. Without this a partial plan is indistinguishable from a plan that
// worked but found no data.
function grabReportMd(r: GrabReport): string {
  const ok = r.attempts.filter((a) => a.ok && a.points > 0);
  const empty = r.attempts.filter((a) => a.ok && a.points === 0);
  const failed = r.attempts.filter((a) => !a.ok);
  const shape = (a: GrabAttempt) =>
    [a.granularity.replace("METRIC_GRANULARITY_", ""), a.breakdown && `by ${a.breakdown}`, a.filter && `where ${a.filter}`]
      .filter(Boolean).join(" · ");

  const out: string[] = [];
  out.push(`# Grab report — universe ${r.universeId}`);
  out.push("");
  out.push(`- Window: **${r.startTime.slice(0, 10)} → ${r.endTime.slice(0, 10)}**`);
  out.push(`- Plan source: ${r.planSource ?? "seed"}`);
  if (r.discovered) {
    const d = Object.entries(r.discovered)
      .filter(([, v]) => v?.length)
      .map(([k, v]) => `**${k}**: ${v.join(", ")}`);
    out.push(`- Discovered dimension values: ${d.length ? d.join(" · ") : "_none_"}`);
  }
  out.push(`- Requested ${r.requested} · **${ok.length} returned data** · ${empty.length} empty · ${failed.length} failed`);
  out.push("");
  out.push("`optional` requests are query shapes inferred rather than observed on a real dashboard — a failure there usually means the dimension isn't valid for this universe, not that something is broken.");
  out.push("");

  if (failed.length) {
    out.push("## Failed");
    out.push("");
    out.push("| Metric | Shape | HTTP | optional | Error |");
    out.push("|---|---|---|---|---|");
    for (const a of failed)
      out.push(`| ${a.metric ?? "—"} | ${shape(a) || "—"} | ${a.status || "—"} | ${a.optional ? "yes" : "**no**"} | ${a.error ?? "—"} |`);
    out.push("");
  }
  if (empty.length) {
    out.push("## Returned 200 but no data points");
    out.push("");
    out.push("**The query was valid and matched nothing.** That is NOT evidence the feature is unused — the most common cause is a filter value that doesn't exist on this universe (e.g. a hardcoded `FunnelName` that belongs to a different game). Verify against the dashboard before concluding anything from a row here.");
    out.push("");
    out.push("| Metric | Shape |");
    out.push("|---|---|");
    for (const a of empty) out.push(`| ${a.metric ?? "—"} | ${shape(a) || "—"} |`);
    out.push("");
  }
  out.push("## Returned data");
  out.push("");
  out.push("| Metric | Shape | Points |");
  out.push("|---|---|---|");
  for (const a of ok.sort((x, y) => (x.metric ?? "").localeCompare(y.metric ?? "")))
    out.push(`| ${a.metric ?? "—"} | ${shape(a) || "—"} | ${a.points} |`);
  out.push("");
  return out.join("\n");
}

export async function exportGrabReport(report: GrabReport): Promise<string> {
  const dataDir = await resolveDataDir();
  const gameDir = path.join(dataDir, "games", report.universeId);
  await fs.mkdir(gameDir, { recursive: true });
  const file = path.join(gameDir, "grab-report.md");
  await fs.writeFile(file, grabReportMd(report), "utf8");
  await fs.writeFile(
    path.join(gameDir, "grab-report.json"),
    JSON.stringify(report, null, 2),
    "utf8"
  );
  return file;
}

// A dated deploy log. Line this up against the daily metrics and a step change
// on date D has a version number next to it.
function placeVersionsMd(versions: PlaceVersion[]): string {
  const byDate = new Map<string, PlaceVersion[]>();
  for (const v of versions) {
    const arr = byDate.get(v.date) ?? [];
    arr.push(v);
    byDate.set(v.date, arr);
  }
  const out: string[] = [];
  out.push("# Place version history (deploy log)");
  out.push("");
  out.push(`${versions.length} versions across ${byDate.size} days. Times are UTC — the same clock the metrics use.`);
  out.push("");
  out.push("| Date | Versions | Count | First publish | Last publish |");
  out.push("|---|---|---|---|---|");
  for (const [date, vs] of [...byDate.entries()].sort((a, b) => b[0].localeCompare(a[0]))) {
    const sorted = [...vs].sort((a, b) => a.created.localeCompare(b.created));
    out.push(
      `| ${date} | ${sorted.map((v) => `v${v.version}`).join(", ")} | ${vs.length} | ${sorted[0].created.slice(11, 16)} | ${sorted[sorted.length - 1].created.slice(11, 16)} |`
    );
  }
  out.push("");
  out.push("## Every version");
  out.push("");
  out.push("| Version | Published (UTC) | Place |");
  out.push("|---|---|---|");
  for (const v of versions) out.push(`| v${v.version} | ${v.created.replace("T", " ").slice(0, 19)} | ${v.placeId} |`);
  out.push("");
  return out.join("\n");
}

export type ExportSummary = { dataDir: string; games: string[]; files: number };

// Mirror a parsed capture set to disk. Never throws — a broken export must not
// lose an ingest that already succeeded against Supabase.
export async function exportToFiles(r: ParseResult): Promise<ExportSummary> {
  const dataDir = await resolveDataDir();
  let files = 0;
  const done: string[] = [];

  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(path.join(dataDir, "README.md"), ROOT_README, "utf8");
  files++;

  for (const gameId of r.games) {
    const gameDir = path.join(dataDir, "games", gameId);
    const metricsDir = path.join(gameDir, "metrics");
    await fs.mkdir(metricsDir, { recursive: true });

    const seriesFile = path.join(gameDir, "series.json");
    const merged = mergeGame(await readExisting(seriesFile), gameId, r);

    await fs.writeFile(seriesFile, JSON.stringify(merged, null, 2), "utf8");
    await fs.writeFile(path.join(gameDir, "summary.md"), summaryMd(merged), "utf8");
    await fs.writeFile(
      path.join(gameDir, "catalog.json"),
      JSON.stringify(catalogJson(merged), null, 2),
      "utf8"
    );
    files += 3;

    if (r.placeVersions?.length) {
      await fs.writeFile(path.join(gameDir, "place-versions.md"), placeVersionsMd(r.placeVersions), "utf8");
      await fs.writeFile(
        path.join(gameDir, "place-versions.csv"),
        "version,published_utc,date,place_id,is_published\n" +
          r.placeVersions.map((v) => [v.version, v.created, v.date, v.placeId, v.isPublished].join(",")).join("\n") +
          "\n",
        "utf8"
      );
      files += 2;
    }

    for (const m of Object.values(merged.metrics)) {
      await fs.writeFile(path.join(metricsDir, `${m.metric}.csv`), metricCsv(m), "utf8");
      files++;
      const daily = dailyCsv(m);
      if (daily) {
        await fs.writeFile(path.join(metricsDir, `${m.metric}.daily.csv`), daily, "utf8");
        files++;
      }
    }
    done.push(gameId);
  }

  return { dataDir, games: done, files };
}

// Keep the untouched capture bundle too — it's the only thing that can be
// re-parsed if the parser changes, and it's what the offline CLI reads.
export async function saveRawCaptures(
  captures: unknown[],
  universeHint?: string | null
): Promise<string> {
  const dataDir = await resolveDataDir();
  const rawDir = path.join(dataDir, "raw");
  await fs.mkdir(rawDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = path.join(rawDir, `${universeHint || "captures"}-${stamp}.json`);
  await fs.writeFile(file, JSON.stringify(captures), "utf8");
  return file;
}
