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
import type { ParseResult, Snapshot, PlaceVersion, Feedback } from "./parse-captures";
import { metricInfo, formatValue, deltaIsGood, UNIT_RANGE, type Category } from "./metric-info";

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

export type ExportPoint = {
  date: string;
  ts: string;
  value: number | null;
  // "FILLED_ZERO" marks a zero synthesized for a row the API omitted — the
  // gateway drops zero rows entirely, so for count/robux volume metrics an
  // absent granule inside the requested window IS a zero (proven against the
  // dashboard's own CSV exports, which print those zeros explicitly).
  status: string | null;
  capturedAt?: string; // when the capture carrying this point was made
  partial?: boolean; // the interval had not fully elapsed at capturedAt
};
export type ExportSeries = {
  key: string;
  label: string;
  granularity: string;
  breakdown: Record<string, string>;
  filters: Snapshot["filters"];
  // Union of the request windows that fed this series — what we actually
  // asked about. The API omits zero rows, so this cannot be reconstructed
  // from the points themselves.
  windowStart?: string;
  windowEnd?: string;
  points: ExportPoint[];
};

// A data-quality event worth a human's attention, persisted in series.json so
// it survives re-ingests and renders into data-quality.md.
export type QualityEntry = {
  kind: "revision" | "implausible";
  metric: string;
  series: string;
  ts: string;
  detail: string;
  observedAt: string;
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
  // BENCHMARK_TYPE_GENRE or BENCHMARK_TYPE_SIMILARITY — decides what a
  // benchmark verdict may claim to compare against. Some universes get
  // similarity cohorts with an empty genre; that is the API's answer, not a
  // parse failure.
  benchmarkType?: string | null;
  generatedAt: string;
  metrics: Record<string, ExportMetric>;
  benchmarks: Record<string, Record<string, ExportPoint[]>>; // metric -> percentile -> points
  quality?: QualityEntry[];
  // Timeline annotations by type, raw — kept verbatim until a type is seen
  // returning rows and its schema is known.
  annotations?: { annotationType: number; raw: unknown }[];
  // MessageHash -> human-readable error text (null until the async dimensions
  // lookup has been captured for that hash).
  messageHashes?: Record<string, string | null>;
};

// Series identity on disk includes granularity — the same breakdown pulled
// hourly and daily are two different series, not one that overwrites the other.
const seriesId = (granularity: string, seriesKey: string) => `${granularity}::${seriesKey}`;

// ---------------------------------------------------------------- intervals

const GRAN_MS: Record<string, number> = {
  METRIC_GRANULARITY_ONE_DAY: 86_400_000,
  METRIC_GRANULARITY_ONE_HOUR: 3_600_000,
  METRIC_GRANULARITY_HALF_HOUR: 1_800_000,
  METRIC_GRANULARITY_ONE_MINUTE: 60_000,
};

// Had this point's interval fully elapsed when we captured it? A settled
// point is final enough to freeze; an in-progress one is expected to change.
function settledAtCapture(ts: string, granularity: string, capturedAt: string | null | undefined): boolean | null {
  const ms = GRAN_MS[granularity];
  if (!ms || !capturedAt) return null; // NONE-aggregates / legacy points: unknown
  return new Date(ts).getTime() + ms <= new Date(capturedAt).getTime();
}

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
  const quality: QualityEntry[] = [];

  for (const b of r.benchmarks) {
    if (b.gameId !== gameId) continue;
    if (b.genre) out.genre = b.genre;
    if (b.benchmarkType) out.benchmarkType = b.benchmarkType;
  }

  // Annotations accumulate (deduped on their serialized form).
  const annotationsIn = (r.annotations ?? []).filter((a) => a.gameId === gameId);
  if (annotationsIn.length) {
    const seen = new Set((out.annotations ?? []).map((a) => `${a.annotationType}|${JSON.stringify(a.raw)}`));
    for (const a of annotationsIn) {
      const k = `${a.annotationType}|${JSON.stringify(a.raw)}`;
      if (!seen.has(k)) {
        (out.annotations ??= []).push({ annotationType: a.annotationType, raw: a.raw });
        seen.add(k);
      }
    }
  }

  // MessageHash -> text. Field names on the value entries are not yet known
  // for every namespace, so take the first plausible text-bearing field.
  for (const dv of r.dimensionValues ?? []) {
    if (dv.gameId !== gameId || dv.dimension !== "MessageHash") continue;
    const raw = dv.raw as Record<string, unknown> | null;
    const text =
      (raw &&
        ((raw.displayValue as string) ||
          (raw.displayName as string) ||
          (raw.text as string) ||
          (raw.description as string))) ||
      null;
    (out.messageHashes ??= {})[dv.value] = text ?? out.messageHashes?.[dv.value] ?? null;
  }

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
    // Track the union of request windows so absent rows can be classified.
    if (s.windowStart && (!series.windowStart || s.windowStart < series.windowStart))
      series.windowStart = s.windowStart;
    if (s.windowEnd && (!series.windowEnd || s.windowEnd > series.windowEnd))
      series.windowEnd = s.windowEnd;

    const bucket = index.get(`${s.metric}|${sid}`) ?? new Map<string, ExportPoint>();
    const incoming: ExportPoint = {
      date: s.date,
      ts: s.ts,
      value: s.value,
      status: s.status,
      capturedAt: s.capturedAt ?? undefined,
      partial: settledAtCapture(s.ts, s.granularity, s.capturedAt) === false || undefined,
    };
    const existing = bucket.get(s.ts);
    // Freeze-when-settled: once a point's interval had fully elapsed at
    // capture time, a later capture may NOT silently replace it. The gateway
    // has been observed re-serving a 17-hour-old hour at a quarter of its
    // (dashboard-confirmed) value seven minutes after serving it correctly —
    // blind last-write-wins kept the wrong number. Divergent re-reads of a
    // settled point are logged to data-quality.md instead of applied.
    // Filled zeros and unsettled/unknown points always yield to real data.
    const existingSettled =
      existing && existing.status !== "FILLED_ZERO"
        ? settledAtCapture(existing.ts, s.granularity, existing.capturedAt)
        : false;
    if (existing && existingSettled === true) {
      // Only MATERIAL divergence is worth a human's attention. Measured over
      // 587 re-reads on two universes: the median divergence is 0.0000% and
      // p90 is 0.78% — Roblox continuously recomputes averaged metrics
      // (CpuTimeAvg, the L7 rolling averages, FPS percentiles) by fractions of
      // a percent. Logging those buries the real events, which is the same
      // mistake as the "latest point is an estimate" flag that fired on every
      // row. Above the threshold sit genuine restatements, and they are large:
      // ItemMonetizationRevenue has been seen going 353 -> 21,835.
      const a = existing.value;
      const b = incoming.value;
      const material =
        a == null || b == null
          ? a !== b
          : Math.abs(a - b) > Math.max(1e-9, 0.01 * Math.abs(a));
      if (material) {
        quality.push({
          kind: "revision",
          metric: s.metric,
          series: series.label,
          ts: s.ts,
          detail: `settled point re-served as ${incoming.value} (captured ${incoming.capturedAt ?? "?"}); kept ${existing.value} (captured ${existing.capturedAt ?? "?"})`,
          observedAt: new Date().toISOString(),
        });
      }
    } else {
      bucket.set(s.ts, incoming);
    }
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
    fillOmittedZeros(m);

    // Unit plausibility (D9): values outside their unit's plausible range are
    // kept but reported — a violation usually means the metric->unit mapping
    // is wrong, which no per-value check downstream would ever catch.
    const range = UNIT_RANGE[metricInfo(m.metric).unit];
    if (range) {
      for (const s of m.series) {
        const bad = s.points.filter(
          (p) =>
            p.value != null &&
            p.status !== "FILLED_ZERO" &&
            ((range.min !== undefined && p.value < range.min) ||
              (range.max !== undefined && p.value > range.max))
        );
        if (bad.length) {
          quality.push({
            kind: "implausible",
            metric: m.metric,
            series: s.label,
            ts: bad[0].ts,
            detail: `${bad.length} point(s) outside plausible ${metricInfo(m.metric).unit} range (e.g. ${bad[0].value}) — check the metric's unit mapping`,
            observedAt: new Date().toISOString(),
          });
        }
      }
    }
  }

  // persist quality findings (deduped, capped — newest kept)
  if (quality.length) {
    const seen = new Set(
      (out.quality ?? []).map((q) => `${q.kind}|${q.metric}|${q.series}|${q.ts}|${q.detail}`)
    );
    const fresh_ = quality.filter(
      (q) => !seen.has(`${q.kind}|${q.metric}|${q.series}|${q.ts}|${q.detail}`)
    );
    out.quality = [...(out.quality ?? []), ...fresh_].slice(-500);
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

// ---------------------------------------------------------------- zero fill

// The API omits zero rows. For count/robux VOLUME metrics an absent granule
// inside the requested window is a zero — the dashboard's own CSV exports
// print those zeros explicitly (Server crashes Aug 4–8 = 0; per-source revenue
// hours = 0), and computing a median or Δ over only the non-zero days is how
// a 30,393-crash day sat next to a "typical" that ignored three quiet weeks.
// NEVER filled: rates (a missing retention day is unknown, not 0%), and
// anything beyond what had both fully elapsed and become available when we
// last looked. Sub-daily series are only filled between their first real
// point and the caps — the gateway truncates long sub-daily windows (a 744-
// hour request came back with ~240 hours), so a leading absence there means
// "outside the effective window", not zero.
function fillOmittedZeros(m: ExportMetric): void {
  const info = metricInfo(m.metric);
  if (info.kind !== "volume" || !["count", "robux"].includes(info.unit)) return;
  for (const s of m.series) {
    const ms = GRAN_MS[s.granularity];
    if (!ms || s.granularity === "METRIC_GRANULARITY_ONE_MINUTE") continue;
    const real = s.points.filter((p) => p.status !== "FILLED_ZERO");
    if (!real.length || !s.windowStart || !s.windowEnd) continue;
    const captured = real.map((p) => p.capturedAt).filter(Boolean) as string[];
    if (!captured.length) continue;
    const capMs = Math.max(...captured.map((c) => new Date(c).getTime()));
    const lastRealMs = new Date(real[real.length - 1].ts).getTime();
    const latestAvailMs = m.latestAvailableTime
      ? Math.max(new Date(m.latestAvailableTime).getTime(), lastRealMs)
      : null;
    // Sub-daily fill is bounded by the points the gateway actually SERVED, at
    // both ends. It truncates long sub-daily windows without saying so — a
    // 768-hour request came back with 240 hours — so absence outside the
    // served span means "never served", not zero. Filling past the last real
    // point overwrote hours the dashboard shows as R$4,845 with 0. Inside the
    // span an absent granule is still a genuine zero (the dashboard prints
    // those explicitly). Daily series are not truncated this way and DO carry
    // meaningful trailing zeros — ServerCrashCount's quiet days after an
    // outage are real — so they fill to the availability cap.
    const daily = s.granularity === "METRIC_GRANULARITY_ONE_DAY";
    const startBase = daily
      ? new Date(s.windowStart).getTime()
      : new Date(real[0].ts).getTime();
    const endBase = daily
      ? new Date(s.windowEnd).getTime()
      : Math.min(new Date(s.windowEnd).getTime(), lastRealMs + ms);
    const have = new Set(s.points.map((p) => new Date(p.ts).getTime()));
    const filledAt = new Date(capMs).toISOString();
    let added = false;
    for (let t = Math.ceil(startBase / ms) * ms; t < endBase; t += ms) {
      if (t + ms > capMs) break; // interval had not fully elapsed at last capture
      if (latestAvailMs != null && t > latestAvailMs) break; // beyond server-side availability
      if (have.has(t)) continue;
      const iso = new Date(t).toISOString().replace(".000Z", "Z");
      s.points.push({
        date: iso.slice(0, 10),
        ts: iso,
        value: 0,
        status: "FILLED_ZERO",
        capturedAt: filledAt,
      });
      added = true;
    }
    if (added) s.points.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
  }
}

// ---------------------------------------------------------------- rollup

// Sub-daily metrics (the whole Performance tab, peak CCU, item revenue) need a
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

// `samples` is how many sub-daily points fed the day; `partial` means the day
// cannot be quoted as a whole — a contributing point was still in progress at
// capture, or fewer samples arrived than the granularity has slots.
type DailyPoint = ExportPoint & { samples: number };

function rollupToDaily(
  points: ExportPoint[],
  rule: "max" | "sum" | "mean",
  granularity: string
): DailyPoint[] {
  const slots = GRAN_MS[granularity] ? 86_400_000 / GRAN_MS[granularity] : null;
  const byDate = new Map<string, { vals: number[]; partial: boolean }>();
  for (const p of points) {
    if (p.value == null) continue;
    const e = byDate.get(p.date) ?? { vals: [], partial: false };
    e.vals.push(p.value);
    if (p.partial) e.partial = true;
    byDate.set(p.date, e);
  }
  return [...byDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, { vals, partial }]) => ({
      date,
      ts: `${date}T00:00:00.000Z`,
      value:
        rule === "max" ? Math.max(...vals)
        : rule === "sum" ? vals.reduce((s, v) => s + v, 0)
        : vals.reduce((s, v) => s + v, 0) / vals.length,
      status: null,
      samples: vals.length,
      partial: partial || (slots != null && vals.length < slots) || undefined,
    }));
}

const isSubDaily = (g: string) =>
  g === "METRIC_GRANULARITY_ONE_HOUR" || g === "METRIC_GRANULARITY_HALF_HOUR";

// ---------------------------------------------------------------- rendering

function csvEscape(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function metricCsv(m: ExportMetric): string {
  const rows = ["date,ts,granularity,series,value,status,captured_at,partial"];
  for (const s of m.series)
    for (const p of s.points)
      rows.push(
        [
          p.date,
          p.ts,
          s.granularity,
          csvEscape(s.label),
          p.value ?? "",
          p.status ?? "",
          p.capturedAt ?? "",
          p.partial ? "true" : "",
        ].join(",")
      );
  return rows.join("\n") + "\n";
}

// Human rendering of the persisted quality entries — settled points the
// gateway re-served with different values, and values outside their unit's
// plausible range. An empty file is not written.
function dataQualityMd(g: GameExport): string | null {
  const entries = g.quality ?? [];
  if (!entries.length) return null;
  const out: string[] = [];
  out.push(`# Data quality — universe ${g.universeId}`);
  out.push("");
  out.push(
    "Events that make a stored number less trustworthy than it looks. `implausible` = a value outside its unit's plausible range, kept but flagged."
  );
  out.push("");
  out.push(
    "`revision` = the gateway re-served an already-settled point with a **materially** different value (>1%; sub-1% recomputation drift on averaged metrics is normal and is not logged). The FIRST settled read is kept and the later one recorded here."
  );
  out.push("");
  out.push(
    "> **Open question — do not assume the kept value is the right one.** Keeping the first read was chosen after a re-grab replaced a dashboard-confirmed R$3,092 hour with R$747 seven minutes later. Wider evidence complicates that: the largest divergences run the other way (`ItemMonetizationRevenue` 353 → 21,835), which looks like back-fill, and against the dashboard's own export our kept value is sometimes the low one. For any metric labelled *Realtime*, treat a revision row as \"this hour is disputed\", check the dashboard, and do not build a conclusion on it either way."
  );
  out.push("");
  out.push("| Kind | Metric | Series | Point | Detail | Observed |");
  out.push("|---|---|---|---|---|---|");
  for (const q of entries)
    out.push(
      `| ${q.kind} | ${q.metric} | ${q.series} | ${q.ts} | ${q.detail} | ${q.observedAt.slice(0, 16)}Z |`
    );
  out.push("");
  return out.join("\n");
}

function dailyCsv(m: ExportMetric): string | null {
  const subDaily = m.series.filter((s) => isSubDaily(s.granularity));
  if (!subDaily.length) return null;
  const rule = rollupRule(m);
  const rows = [`date,series,value,agg,samples,partial`];
  for (const s of subDaily)
    for (const p of rollupToDaily(s.points, rule, s.granularity))
      rows.push([p.date, csvEscape(s.label), p.value ?? "", rule, p.samples, p.partial ? "true" : ""].join(","));
  return rows.join("\n") + "\n";
}

// ---------------------------------------------------------------- headline

// A metric's headline series is the one with an EMPTY breakdown. A filter that
// scopes the query to the game's place(s) does not disqualify it — the whole
// Performance tab only exists Place-filtered — but a filter that restricts the
// population (IsNewUser=New, AcquisitionSource=…) is a slice, and a slice
// presented as the whole is how a 30,393-crash incident printed as "5".
// If no such series exists, there is NO headline. Never fall back to series[0].
export function totalSeries(m: ExportMetric): ExportSeries | null {
  const rank = (g: string) =>
    g === "METRIC_GRANULARITY_ONE_DAY" ? 0
    : isSubDaily(g) ? 1
    : g === "METRIC_GRANULARITY_NONE" ? 2
    : 3;
  const pick = (list: ExportSeries[]) =>
    list.length
      ? [...list].sort((a, b) => rank(a.granularity) - rank(b.granularity) || b.points.length - a.points.length)[0]
      : null;
  const candidates = m.series.filter(
    (s) =>
      Object.keys(s.breakdown ?? {}).length === 0 &&
      s.granularity !== "METRIC_GRANULARITY_ONE_MINUTE"
  );
  const unfiltered = candidates.filter((s) => !(s.filters ?? []).length);
  const placeScoped = candidates.filter(
    (s) => (s.filters ?? []).length > 0 && (s.filters ?? []).every((f) => f.dimension === "Place")
  );
  return pick(unfiltered) ?? pick(placeScoped);
}

// The status that actually matters. DATA_STATUS_INVALID is 99.5% of all raw
// points — the protobuf zero-value ("unset"), carrying no information — but
// NOT_STATISTICALLY_SIGNIFICANT marks a series Roblox itself does not trust
// (tiny sample). Surface those loudly and keep them out of conclusions.
const NOT_SIG = "DATA_STATUS_NOT_STATISTICALLY_SIGNIFICANT";

function isNotSignificant(s: ExportSeries): boolean {
  const valued = s.points.filter((p) => p.value != null);
  if (!valued.length) return false;
  return valued.filter((p) => p.status === NOT_SIG).length * 2 >= valued.length;
}

function notSignificantLabels(m: ExportMetric): string[] {
  return m.series.filter(isNotSignificant).map((s) => s.label);
}

// Points that may feed a headline, Δ, or incident: value present, interval
// fully elapsed at capture, and no later than the metric's own
// latestAvailableTime (a day the server has not finished computing is not a
// result — quoting it produced "Crash Count ▼85.6%" off a 7-hour day).
function settledPoints(m: ExportMetric, s: ExportSeries): (ExportPoint | DailyPoint)[] {
  const pts = isSubDaily(s.granularity)
    ? rollupToDaily(s.points, rollupRule(m), s.granularity)
    : s.points;
  const completeDay = m.latestAvailableTime ? m.latestAvailableTime.slice(0, 10) : null;
  const lastSettledReal = [...s.points].reverse().find((p) => p.value != null && !p.partial);
  // Freshness metadata can lag data that demonstrably exists — never let it
  // exclude settled points we actually hold.
  const effComplete =
    completeDay && lastSettledReal && lastSettledReal.date > completeDay
      ? lastSettledReal.date
      : completeDay;
  return pts.filter((p) => p.value != null && !p.partial && (!effComplete || p.date <= effComplete));
}

// Latest settled value + a like-for-like comparison ~7 points back, the same
// week-over-week read the dashboard tiles show.
function headline(m: ExportMetric) {
  const total = totalSeries(m);
  if (!total) return null;
  const usable = settledPoints(m, total);
  if (!usable.length) return null;
  const last = usable[usable.length - 1];
  const prev = usable.length > 7 ? usable[usable.length - 8] : usable[0];
  const deltaPct =
    prev && prev.value != null && prev.value !== 0 && last.value != null && prev !== last
      ? ((last.value - prev.value) / Math.abs(prev.value)) * 100
      : null;
  const gapDays =
    prev !== last
      ? Math.round((new Date(last.date).getTime() - new Date(prev.date).getTime()) / 86_400_000)
      : 0;
  return {
    seriesLabel: total.label,
    date: last.date,
    value: last.value,
    deltaPct,
    // Δ is only a week-over-week read when the compared points are actually
    // ~7 days apart — on a sparse series it can silently span far more.
    deltaSpanDays: gapDays,
    points: usable.length,
  };
}

// INCIDENTS — the spike the Δ column structurally cannot show.
//
// Δ compares the latest point to ~7 points earlier, so anything that spiked and
// recovered *between* those two endpoints is invisible. Real case: "Become a
// Brainrot" server crashes ran 375 → 670,907 → 1,060,617 → 18,674 → ~0 over
// 2026-07-30..08-07. Δ on the last point reads −99.9995% — "massively
// improved" — and the million-crash day never appears anywhere in the summary.
//
// So scan for excursions directly. Only metrics where high is BAD (crashes,
// errors, OOM, memory) can have an "incident"; a DAU spike is a good day.
// Median, not mean, because the spike would drag a mean up and mask itself.
type Incident = {
  metric: string;
  label: string;
  from: string;
  to: string;
  peak: number;
  median: number;
  ratio: number;
};

export function detectIncidents(g: GameExport): Incident[] {
  const found: Incident[] = [];
  for (const m of Object.values(g.metrics)) {
    if (m.higherIsBetter !== false) continue;
    // Same identity rule as the headline: only an unbroken-down series may
    // represent the metric. Scanning `series[0]` here is what hid a
    // 30,393-crash incident behind its OutOfMemory slice.
    const total = totalSeries(m);
    if (!total) continue;
    // A series Roblox marks not-statistically-significant cannot carry an
    // incident — its excursions are sampling noise on a tiny population.
    if (isNotSignificant(total)) continue;
    const vals = settledPoints(m, total).filter((p) => p.value != null) as (ExportPoint & {
      value: number;
    })[];
    if (vals.length < 5) continue;

    const sorted = [...vals].map((p) => p.value).sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    // A rate tripling is already an emergency; a count needs a bigger multiple
    // plus an absolute floor, or 0→3 crashes reads as "infinite increase".
    // Thresholds are deliberately loose: a false positive costs one table row,
    // a false negative hides an outage. 9610561918's 3.0M-error day sits at
    // 7.4× its median — an 8× cut silently dropped it.
    const minRatio = m.kind === "rate" ? 3 : 6;
    const floor = m.kind === "rate" ? 0 : 25;

    // Group consecutive flagged days into one incident — a 3-day outage is one
    // event, not three rows competing for the top of the table.
    let run: (ExportPoint & { value: number })[] = [];
    const flush = () => {
      if (!run.length) return;
      const peak = Math.max(...run.map((p) => p.value));
      found.push({
        metric: m.metric,
        label: m.label,
        from: run[0].date,
        to: run[run.length - 1].date,
        peak,
        median,
        ratio: median > 0 ? peak / median : Infinity,
      });
      run = [];
    };
    for (const p of vals) {
      const ratio = median > 0 ? p.value / median : Infinity;
      const isSpike = p.value >= floor && ratio >= minRatio;
      if (isSpike) run.push(p);
      else flush();
    }
    flush();
  }
  return found.sort((a, b) => b.ratio - a.ratio || b.peak - a.peak);
}

function benchmarkVerdict(g: GameExport, m: ExportMetric, latest: number | null): string {
  if (latest == null) return "";
  const b = g.benchmarks[m.metric];
  if (!b) return "";
  const lastOf = (pct: string) => {
    const pts = (b[pct] ?? []).filter((p) => p.value != null);
    return pts.length ? pts[pts.length - 1].value! : null;
  };
  // Say what the benchmark actually compared against: a genre cohort, or a
  // "similar experiences" cohort (served with an empty genre). Claiming
  // "for genre" off a similarity benchmark is a false precision.
  const cohort =
    g.benchmarkType === "BENCHMARK_TYPE_SIMILARITY"
      ? "similar games"
      : g.genre
      ? "genre"
      : "peer cohort";
  const p50 = lastOf("50");
  const p90 = lastOf("90");
  if (p90 != null && latest >= p90) return `top 10% of ${cohort}`;
  if (p50 != null && latest >= p50) return `above ${cohort} median`;
  if (p50 != null) return `below ${cohort} median`;
  return "";
}

// DAU total by date, for normalizing volume metrics. A volume delta without
// the DAU delta next to it is a non-insight — "+40% revenue" during +40%
// growth says nothing about the update.
function dauByDate(g: GameExport): Map<string, number> {
  const out = new Map<string, number>();
  const dau = g.metrics["DailyActiveUsers"];
  if (!dau) return out;
  const total = totalSeries(dau);
  if (!total) return out;
  for (const p of total.points) if (p.value != null && !p.partial) out.set(p.date, p.value);
  return out;
}

// The nearest publish at-or-before a date, if it is close enough to matter.
// This states an ASSOCIATION — "spike began Nh after v546" — never a cause,
// and never infers a platform-side incident: the annotation feed is the only
// authority on that.
function nearbyPublish(versions: PlaceVersion[], date: string): string {
  if (!versions.length) return "—";
  const t = new Date(`${date}T00:00:00Z`).getTime();
  let best: PlaceVersion | null = null;
  for (const v of versions) {
    const vt = new Date(v.created).getTime();
    if (vt <= t + 86_400_000 && (!best || vt > new Date(best.created).getTime())) best = v;
  }
  if (!best) return "—";
  const hours = Math.round((t - new Date(best.created).getTime()) / 3_600_000);
  if (hours > 72) return `none within 72h (last: v${best.version}, ${Math.round(hours / 24)}d before)`;
  if (hours < 0) return `v${best.version} published ${-hours}h into the day`;
  return `v${best.version} published ${hours}h before`;
}

function summaryMd(g: GameExport, placeVersions: PlaceVersion[] = []): string {
  const order: Category[] = ["Discovery", "Retention", "Monetization", "Engagement", "Funnel", "Performance", "Other"];
  const byCat = new Map<Category, ExportMetric[]>();
  const dau = dauByDate(g);
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

  // Incidents go ABOVE every category table. A spike that has already recovered
  // shows up nowhere else in this file — Δ reads it as an improvement.
  const incidents = detectIncidents(g);
  if (incidents.length) {
    out.push("## ⚠ Incidents");
    out.push("");
    out.push(
      "Excursions in metrics where high is bad, found by comparing each point to the series median. **Δ cannot show these** — it compares two endpoints, and an incident that spiked and recovered lives between them. The publish column states an association, not a cause; whether a spike was Roblox-side is answered only by `annotations.md`, never by inference."
    );
    out.push("");
    out.push("| Metric | When | Peak | Typical | vs typical | Nearby publish |");
    out.push("|---|---|---|---|---|---|");
    for (const i of incidents.slice(0, 12)) {
      const when = i.from === i.to ? i.from : `${i.from} → ${i.to}`;
      const mult = i.ratio === Infinity ? "∞ (typically ~0)" : `${i.ratio.toFixed(0)}×`;
      out.push(
        `| ${i.label} | ${when} | **${formatValue(i.metric, i.peak)}** | ${formatValue(i.metric, i.median)} | ${mult} | ${nearbyPublish(placeVersions, i.from)} |`
      );
    }
    if (incidents.length > 12) out.push("");
    if (incidents.length > 12) out.push(`_${incidents.length - 12} further excursion(s) not shown._`);
    out.push("");
  }

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
        // Never invent a headline. A metric with only breakdown/sliced series
        // has no "the" value — say so instead of quoting a slice.
        const why = totalSeries(m) ? "no settled values" : `breakdown only (${m.series.length} series)`;
        out.push(`| ${m.label} | ${m.kind} | — | — | — | — | ${m.series.length} | ${why} |`);
        continue;
      }
      const good = deltaIsGood(m.metric, h.deltaPct);
      // Only warn on a move big enough to be worth looking at — a 0.1% drift
      // marked ⚠ trains you to ignore the column.
      const material = h.deltaPct != null && Math.abs(h.deltaPct) >= 2;
      const arrow = h.deltaPct == null ? "—" : `${h.deltaPct > 0 ? "▲" : "▼"} ${Math.abs(h.deltaPct).toFixed(1)}%${good === false && material ? " ⚠" : ""}`;
      const notSig = notSignificantLabels(m);
      // Volume metrics get their DAU context inline: the per-1k-DAU value and
      // how DAU itself moved over the same Δ span. A raw volume Δ during
      // growth is the classic false win.
      let dauNote = "";
      if (m.kind === "volume" && m.metric !== "DailyActiveUsers" && h.value != null) {
        const dauNow = dau.get(h.date);
        if (dauNow) {
          const per1k = (h.value / dauNow) * 1000;
          const prevDate = new Date(new Date(h.date).getTime() - h.deltaSpanDays * 86_400_000)
            .toISOString()
            .slice(0, 10);
          const dauPrev = dau.get(prevDate);
          const dauDelta =
            h.deltaPct != null && dauPrev
              ? `, DAU ${dauNow >= dauPrev ? "▲" : "▼"} ${Math.abs(((dauNow - dauPrev) / dauPrev) * 100).toFixed(1)}% over same span`
              : "";
          dauNote = `${formatValue(m.metric, per1k)}/1k DAU${dauDelta}`;
        }
      }
      const notes = [
        h.seriesLabel !== "Total" ? `shown: ${h.seriesLabel}` : "",
        dauNote,
        h.deltaPct != null && (h.deltaSpanDays < 5 || h.deltaSpanDays > 9)
          ? `Δ spans ${h.deltaSpanDays}d`
          : "",
        notSig.length ? `⚠ not statistically significant: ${notSig.join(", ")}` : "",
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
  out.push("- `metrics/<Metric>.csv` — one long-format CSV per metric (`date,ts,granularity,series,value,status,captured_at,partial`). `FILLED_ZERO` status marks zeros the API omitted; `partial` marks in-progress captures excluded from headlines.");
  out.push("- `metrics/<Metric>.daily.csv` — daily rollup of sub-daily metrics; `agg` says how (mean for rates, sum for volumes, max for concurrents), `samples` how many points fed the day, `partial` which days cannot be quoted whole.");
  out.push("- `catalog.json` — metric → response-path hash, freshness, and the series inventory.");
  out.push("- `data-quality.md` — settled points the gateway re-served with different values (first settled read kept) and values outside their unit's plausible range. Present only when something was found.");
  out.push("- `feedback.csv` / `feedback.md` — raw player reviews (up/down-votes + comments) with the `asset_version` each landed on, plus counts by category and version. Present only when feedback was captured.");
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

// Annotations by type. Until a type returns rows its schema is unknown, so
// entries render as compact JSON — the point is (a) which types carry data at
// all and (b) the authoritative "was it us or Roblox" record, verbatim.
function annotationsMd(g: GameExport): string | null {
  const anns = g.annotations ?? [];
  if (!anns.length) return null;
  const byType = new Map<number, unknown[]>();
  for (const a of anns) (byType.get(a.annotationType) ?? byType.set(a.annotationType, []).get(a.annotationType)!).push(a.raw);
  const out: string[] = [];
  out.push(`# Timeline annotations — universe ${g.universeId}`);
  out.push("");
  out.push(
    "Native Roblox annotations, by annotationType. This is the authoritative platform-side signal — cross-reference incident dates here BEFORE attributing a spike to a deploy or to Roblox. A type absent from this file returned no rows in the grabbed window."
  );
  out.push("");
  for (const [type, rows] of [...byType.entries()].sort((a, b) => a[0] - b[0])) {
    out.push(`## annotationType=${type} (${rows.length})`);
    out.push("");
    for (const rw of rows) out.push("- `" + JSON.stringify(rw) + "`");
    out.push("");
  }
  return out.join("\n");
}

// Individual errors: ErrorCount broken down by MessageHash (window aggregate),
// joined with whatever hash→text mappings have been captured. Errors are
// heavily concentrated — one signature was 52% of 12.4M events — so even a
// text-less top-20 is actionable.
function errorsMd(g: GameExport): string | null {
  const m = g.metrics["ErrorCount"];
  if (!m) return null;
  const hashSeries = m.series.filter(
    (s) => s.granularity === "METRIC_GRANULARITY_NONE" && s.breakdown?.MessageHash
  );
  if (!hashSeries.length) return null;
  const rows = hashSeries
    .map((s) => {
      const latest = [...s.points].reverse().find((p) => p.value != null);
      return { hash: s.breakdown.MessageHash, value: latest?.value ?? 0 };
    })
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);
  if (!rows.length) return null;
  const total = rows.reduce((s, r) => s + r.value, 0);
  const out: string[] = [];
  out.push(`# Error signatures — universe ${g.universeId}`);
  out.push("");
  out.push(
    `${rows.length} distinct MessageHash signatures, ${total.toLocaleString("en-US")} events in the captured window. Text comes from the async dimensions lookup and is null until that capture succeeds for a hash.`
  );
  out.push("");
  out.push("| # | Share | Events | MessageHash | Text |");
  out.push("|---|---|---|---|---|");
  rows.slice(0, 50).forEach((r, i) => {
    const text = g.messageHashes?.[r.hash] ?? "—";
    out.push(
      `| ${i + 1} | ${((r.value / total) * 100).toFixed(1)}% | ${r.value.toLocaleString("en-US")} | \`${r.hash}\` | ${text} |`
    );
  });
  if (rows.length > 50) {
    out.push("");
    out.push(`_${rows.length - 50} further signature(s) in \`metrics/ErrorCount.csv\`._`);
  }
  out.push("");
  return out.join("\n");
}

const ROOT_README = `# data/ — the file mirror

Every ingest writes here as well as to Supabase. Nothing in this folder needs
the web app or a database to read.

## Layout

    data/
      raw/<universeId>-<timestamp>.json   raw capture bundles from the extension
      verify/           ground-truth dashboard CSV exports + coverage docs (committed)
      games/<universeId>/
        summary.md        headline table per category — start here
        series.json       full structured record (all metrics, breakdowns, points)
        catalog.json      metric inventory: hash, freshness, series counts
        data-quality.md   settled-point revisions + implausible values, when any
        metrics/*.csv     one long-format CSV per metric
        metrics/*.daily.csv  daily rollup of the sub-daily metrics
        place-versions.md deploy log (version -> publish time), when captured
        feedback.csv      raw player reviews w/ asset_version, when captured
        feedback.md       feedback counts by category and version

## Reading the numbers

- **All timestamps are UTC.** Daily points are stamped at 00:00:00Z (measured
  across every stored point); sub-daily points at their interval boundary.
  The \`date\` column is the UTC date and is what you should join on.
- **\`status: DATA_STATUS_INVALID\` carries no information.** It is ~99.5% of
  all raw points — the protobuf zero-value ("unset"), not "estimated". The
  status that matters is \`DATA_STATUS_NOT_STATISTICALLY_SIGNIFICANT\`: Roblox
  itself does not trust that series (tiny sample). summary.md surfaces those
  and they are excluded from incident detection.
- **\`status: FILLED_ZERO\` is a synthesized zero.** The API omits zero rows,
  so for count/robux volume metrics an absent granule inside the requested
  window is a zero — confirmed against the dashboard's own CSV exports, which
  print those zeros explicitly. Rates are NEVER filled: a missing retention
  day is unknown, not 0%.
- **\`captured_at\` / \`partial\` columns.** \`captured_at\` is when the grab that
  carried the point ran. \`partial: true\` means the point's interval had not
  fully elapsed at capture — the value is an in-progress undercount and is
  excluded from headlines, Δ and incidents. Once a point was captured settled
  it is FROZEN: a later grab re-serving a different value is logged to
  \`data-quality.md\` instead of applied (the gateway has been observed
  re-serving a settled hour at a quarter of its dashboard-confirmed value).
- **rate vs volume.** Rate metrics (retention %, conversion, ARPPU, ARPDAU,
  average session length, crash rate, FPS) are comparable before/after an update
  even while the game grows. Volume metrics (DAU, revenue, paying users,
  sessions) are not — a +40% revenue delta means nothing without the DAU delta
  next to it.
- **Empty breakdown = the "Total" series** — a Place filter still counts as
  Total (the Performance tab only exists Place-scoped), a population filter
  (IsNewUser, AcquisitionSource) does not. A metric with only broken-down
  series (funnels, always per-step) has NO Total row, and summary.md says
  "breakdown only" rather than quoting a slice.
- **Sub-daily metrics** (Performance tab, peak CCU, item revenue) also get a
  \`.daily.csv\` rollup so they line up with the daily metrics. \`agg\` records
  the aggregation used, \`samples\` how many points fed the day, and
  \`partial\` marks days that cannot be quoted as a whole.
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
  provenance?: "observed" | "proven" | "inferred" | null;
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
  // An inferred shape's failure is expected noise; an observed/proven shape's
  // failure is a real problem (the dashboard sends this exact request, or it
  // has returned data before). Mixing them is how 37 broken guesses once read
  // as "this universe has no performance data".
  const failedReal = failed.filter((a) => a.provenance === "observed" || a.provenance === "proven");
  const failedInferred = failed.filter((a) => a.provenance !== "observed" && a.provenance !== "proven");
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
  out.push(`- Requested ${r.requested} · **${ok.length} returned data** · ${empty.length} empty · ${failed.length} failed (${failedReal.length} on observed/proven shapes)`);
  out.push("");

  if (failedReal.length) {
    out.push("## Failed — observed/proven shapes (real problems)");
    out.push("");
    out.push("The dashboard itself sends these shapes (or they have returned data before). A failure here means capture is broken or the API changed — it is never evidence about the game.");
    out.push("");
    out.push("| Metric | Kind | Shape | HTTP | Provenance | Error |");
    out.push("|---|---|---|---|---|---|");
    for (const a of failedReal)
      out.push(`| ${a.metric ?? "—"} | ${a.kind} | ${shape(a) || "—"} | ${a.status || "—"} | ${a.provenance} | ${a.error ?? "—"} |`);
    out.push("");
  }
  if (failedInferred.length) {
    out.push("## Failed — inferred shapes (probably not valid here)");
    out.push("");
    out.push("Query shapes we constructed without a captured example. A failure usually means the dimension isn't valid for this universe. **Never report these as findings about the game.**");
    out.push("");
    out.push("| Metric | Kind | Shape | HTTP | optional | Error |");
    out.push("|---|---|---|---|---|---|");
    for (const a of failedInferred)
      out.push(`| ${a.metric ?? "—"} | ${a.kind} | ${shape(a) || "—"} | ${a.status || "—"} | ${a.optional ? "yes" : "**no**"} | ${a.error ?? "—"} |`);
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

// Raw player feedback, one row per review, with the place version the reviewer
// was on — so `feedback.csv` joins straight onto place-versions.md / the deploy
// log. Generic: no per-game keyword classification, just the facts.
function feedbackCsv(rows: Feedback[]): string {
  const out = ["created_utc,date,place_id,asset_version,category,options,os,device,comment"];
  for (const f of rows)
    out.push(
      [
        f.createdUtc,
        f.date,
        f.placeId,
        f.assetVersion ?? "",
        csvEscape(f.category),
        csvEscape(f.options.join("|")),
        f.os ?? "",
        f.device ?? "",
        csvEscape(f.comment),
      ].join(",")
    );
  return out.join("\n") + "\n";
}

// A compact, game-agnostic view: how much feedback, split by category and by the
// version it landed on. The version split is the useful part — it lines up with
// the deploy log, so a spike of downvotes on one version points at that deploy.
function feedbackMd(rows: Feedback[]): string {
  const byCat = new Map<string, number>();
  const byVer = new Map<string, number>();
  for (const f of rows) {
    byCat.set(f.category || "?", (byCat.get(f.category || "?") ?? 0) + 1);
    const v = f.assetVersion != null ? `v${f.assetVersion}` : "unknown";
    byVer.set(v, (byVer.get(v) ?? 0) + 1);
  }
  const dates = rows.map((r) => r.date).filter(Boolean).sort();
  const out: string[] = [];
  out.push("# Player feedback");
  out.push("");
  out.push(`- Entries: **${rows.length}**${dates.length ? ` (${dates[0]} → ${dates[dates.length - 1]})` : ""}`);
  out.push(`- Full text with the version each landed on: \`feedback.csv\` (\`asset_version\` column).`);
  out.push("");
  out.push("## By category");
  out.push("");
  out.push("| Category | Count |");
  out.push("|---|---|");
  for (const [c, n] of [...byCat.entries()].sort((a, b) => b[1] - a[1])) out.push(`| ${c} | ${n} |`);
  out.push("");
  out.push("## By place version");
  out.push("");
  out.push("Cross-reference `place-versions.md` — a category clustering on one version dates it to that deploy.");
  out.push("");
  out.push("| Version | Feedback count |");
  out.push("|---|---|");
  for (const [v, n] of [...byVer.entries()].sort((a, b) => {
    const na = Number(a[0].replace("v", "")) || -1, nb = Number(b[0].replace("v", "")) || -1;
    return nb - na;
  }))
    out.push(`| ${v} | ${n} |`);
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

    // Publish timestamps for the incident table: this batch's, or the ones
    // already exported for this game.
    let versions: PlaceVersion[] = r.placeVersions ?? [];
    if (!versions.length) {
      try {
        versions = (await fs.readFile(path.join(gameDir, "place-versions.csv"), "utf8"))
          .trim()
          .split("\n")
          .slice(1)
          .map((l) => {
            const [version, created, date, placeId, isPublished] = l.split(",");
            return {
              version: Number(version),
              created,
              date,
              placeId,
              isPublished: isPublished !== "false",
            };
          })
          .filter((v) => Number.isFinite(v.version) && !!v.created);
      } catch {
        versions = [];
      }
    }

    await fs.writeFile(seriesFile, JSON.stringify(merged, null, 2), "utf8");
    await fs.writeFile(path.join(gameDir, "summary.md"), summaryMd(merged, versions), "utf8");
    await fs.writeFile(
      path.join(gameDir, "catalog.json"),
      JSON.stringify(catalogJson(merged), null, 2),
      "utf8"
    );
    files += 3;

    const quality = dataQualityMd(merged);
    if (quality) {
      await fs.writeFile(path.join(gameDir, "data-quality.md"), quality, "utf8");
      files++;
    }
    const anns = annotationsMd(merged);
    if (anns) {
      await fs.writeFile(path.join(gameDir, "annotations.md"), anns, "utf8");
      files++;
    }
    const errs = errorsMd(merged);
    if (errs) {
      await fs.writeFile(path.join(gameDir, "errors.md"), errs, "utf8");
      files++;
    }

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

    if (r.feedback?.length) {
      await fs.writeFile(path.join(gameDir, "feedback.csv"), feedbackCsv(r.feedback), "utf8");
      await fs.writeFile(path.join(gameDir, "feedback.md"), feedbackMd(r.feedback), "utf8");
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
