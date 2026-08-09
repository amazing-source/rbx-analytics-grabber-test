// Supabase-backed repository. Same exported surface as the original in-memory
// version — the route handlers only had to add `await`. The secret-key client
// bypasses RLS, so all of this is server-only.

import { supabase } from "./supabase";
import { parseCaptures, type Capture, type Snapshot } from "./parse-captures";
import {
  buildSeedTemplates,
  DISCOVER_DIMENSIONS,
  type Discovered,
  type SeedTemplate,
} from "./default-plan";

export type Update = {
  id: string;
  gameId: string;
  title: string;
  occurredAt: string;
  notes?: string;
};

async function chunkedUpsert<T>(
  table: string,
  rows: T[],
  onConflict: string,
  size = 500
) {
  for (let i = 0; i < rows.length; i += size) {
    const { error } = await supabase
      .from(table)
      .upsert(rows.slice(i, i + size) as never[], { onConflict });
    if (error) throw new Error(`upsert ${table}: ${error.message}`);
  }
}

export async function ingestCaptures(captures: Capture[]) {
  const r = parseCaptures(captures);

  const genreByGame = new Map<string, string | null>();
  for (const b of r.benchmarks) if (b.genre) genreByGame.set(b.gameId, b.genre);

  if (r.games.length) {
    await chunkedUpsert(
      "games",
      r.games.map((id) => ({ id, genre: genreByGame.get(id) ?? null })),
      "id"
    );
  }

  if (r.catalog.length) {
    await chunkedUpsert(
      "metric_catalog",
      r.catalog.map((c) => ({
        game_id: c.gameId,
        metric: c.metric,
        hash: c.hash,
        updated_at: new Date().toISOString(),
      })),
      "game_id,metric"
    );
  }

  if (r.snapshots.length) {
    await chunkedUpsert(
      "metric_snapshots",
      r.snapshots.map((s) => ({
        game_id: s.gameId,
        metric: s.metric,
        ts: s.ts,
        date: s.date,
        granularity: s.granularity,
        series_key: s.seriesKey,
        breakdown: s.breakdown,
        filters: s.filters,
        value: s.value,
        string_values: s.stringValues,
        status: s.status,
      })),
      "game_id,metric,granularity,series_key,ts"
    );
  }

  if (r.benchmarks.length) {
    await chunkedUpsert(
      "benchmarks",
      r.benchmarks.map((b) => ({
        game_id: b.gameId,
        metric: b.metric,
        percentile: b.percentile,
        genre: b.genre,
        ts: b.ts,
        date: b.date,
        value: b.value,
      })),
      "game_id,metric,percentile,ts"
    );
  }

  if (r.metadata.length) {
    await chunkedUpsert(
      "metric_freshness",
      r.metadata.map((m) => ({
        metric: m.metric,
        latest_available_time: m.latestAvailableTime,
        updated_at: new Date().toISOString(),
      })),
      "metric"
    );
  }

  if (r.templates.length) {
    await chunkedUpsert(
      "grab_templates",
      r.templates.map((t) => ({
        key: t.key,
        kind: t.kind,
        metric: t.metric,
        resource_type: t.resourceType,
        query: t.query,
        updated_at: new Date().toISOString(),
      })),
      "key"
    );
  }

  return {
    games: r.games.length,
    snapshots: r.snapshots.length,
    metrics: new Set(r.snapshots.map((x) => x.metric)).size,
    benchmarks: r.benchmarks.length,
    templates: r.templates.length,
  };
}

const API = "https://apis.roblox.com";

export type GrabRequest = {
  id: string;
  kind:
    | "metric"
    | "benchmark"
    | "metadata"
    | "dimensions"
    | "places"
    | "placeVersions"
    | "reviews"
    | "annotations";
  metric: string | null;
  dimension?: string;
  placeId?: string;
  url: string;
  method: "POST" | "GET";
  body: unknown;
  optional?: boolean; // a non-200 here is expected, not a failure
  // observed = the dashboard itself sends this shape; proven = ours but it
  // has returned data on a real universe; inferred = a guess whose failure
  // says nothing about the game. Flows into the grab report.
  provenance?: "observed" | "proven" | "inferred";
};

export type GrabPlan = {
  universeId: string;
  startTime: string;
  endTime: string;
  requests: GrabRequest[];
  discovery?: GrabRequest[];
  discovered?: Discovered;
  source: "seed" | "seed+learned";
  warnings: string[];
};

// The metrics gateway rejects a window that isn't aligned to its granularity,
// and a 28-day window at minute granularity is both useless and enormous.
// Half-hour windows are additionally clamped to the FINAL 24h of the request:
// the gateway silently truncates long sub-daily windows (a 744-hour request
// came back with ~240 hours), and the dashboard itself only asks for ~a day.
function alignWindow(granularity: string | undefined, startTime: string, endTime: string) {
  const snap = (iso: string, unit: "day" | "hour" | "half") => {
    const d = new Date(iso);
    if (unit === "day") d.setUTCHours(0, 0, 0, 0);
    else if (unit === "half") d.setUTCMinutes(d.getUTCMinutes() >= 30 ? 30 : 0, 0, 0);
    else d.setUTCMinutes(0, 0, 0);
    return d.toISOString();
  };
  if (granularity === "METRIC_GRANULARITY_ONE_HOUR") {
    return { startTime: snap(startTime, "hour"), endTime: snap(endTime, "hour") };
  }
  if (granularity === "METRIC_GRANULARITY_HALF_HOUR") {
    const end = snap(endTime, "half");
    const dayBack = new Date(new Date(end).getTime() - 86_400_000).toISOString();
    const start = snap(startTime, "half") > dayBack ? snap(startTime, "half") : dayBack;
    return { startTime: start, endTime: end };
  }
  return { startTime: snap(startTime, "day"), endTime: snap(endTime, "day") };
}

// ---------------------------------------------------------------------------
// The technical rung has a HARD MAXIMUM WINDOW, and the gateway 400s rather
// than truncating. Measured 2026-08-09: a 139-day grab of 9963622286 returned
// 38 behavioural metrics at full span and 400'd every one of the 19 perf/error
// shapes that had returned data on a 28-day window two days earlier — same
// shapes, same universe, same account.
//
// The limit is Roblox's; asking for a shorter overall grab is NOT the fix,
// because the data exists across the whole span and is retrievable one legal
// window at a time. So we CHUNK: a 139-day ask becomes 20 crash requests of 7
// days, or 5 perf requests of 28. One request per template is what silently
// produced "this game has no crash history" for a game with a 1,060,617 peak.
//
// Identification uses the invariant the codebase already enforces: every
// technical metric requires a `Place` filter (without it the gateway 400s).
// `ErrorCount` is included by name because it is also served unfiltered.
// Both figures come from the producer's own platform knowledge (2026-08-09):
// "for everything performance related the maximum window is a month, for
// crashes it's 7 days even."
//
// One caveat recorded rather than silently ignored: our 2026-08-08 grab used a
// 28-day window and `ServerCrashCount` came back with 28 days of daily points
// (Jul 11 → Aug 7), so a 28-day *daily* crash ask demonstrably worked. The
// 7-day cap may apply to a sub-daily granularity or to the dashboard UI. 7 is
// kept because a smaller window always succeeds where a larger one does — the
// only cost is request count. Raise it to 28 only after a grab report shows a
// 28-day crash chunk returning data across a long span.
const MAX_CRASH_WINDOW_DAYS = 7;
const MAX_PERF_WINDOW_DAYS = 28;

const CRASH_METRICS = new Set([
  "ServerCrashCount",
  "ClientCrashCount",
  "ClientCrashRate15m",
  "OomUnexpectedExits",
]);

// Metrics with their own short window that are NOT Place-scoped, so the filter
// test below cannot find them. `PotentialExtraEarningsTotalUsd` returned data on
// a 28-day grab (2026-08-07) and 400s on a 139-day one (2026-08-09), which is
// why 28 rather than a guess.
const SHORT_WINDOW_METRICS = new Map<string, number>([
  ["PotentialExtraEarningsTotalUsd", MAX_PERF_WINDOW_DAYS],
]);

/** Max window in days for a template, or null when the span needs no limiting. */
function maxWindowDays(metric: string, query: unknown): number | null {
  const explicit = SHORT_WINDOW_METRICS.get(metric);
  if (explicit) return explicit;
  const filter = (query as { filter?: unknown })?.filter;
  const placeScoped =
    Array.isArray(filter) &&
    filter.some((f) => (f as { dimension?: string })?.dimension === "Place");
  if (!placeScoped && metric !== "ErrorCount") return null;
  return CRASH_METRICS.has(metric) ? MAX_CRASH_WINDOW_DAYS : MAX_PERF_WINDOW_DAYS;
}

/** One interval of the given granularity, in ms. Daily is the safe default. */
function intervalMs(granularity: string | undefined) {
  if (granularity === "METRIC_GRANULARITY_HALF_HOUR") return 1_800_000;
  if (granularity === "METRIC_GRANULARITY_ONE_HOUR") return 3_600_000;
  if (granularity === "METRIC_GRANULARITY_ONE_MINUTE") return 60_000;
  return 86_400_000;
}

/**
 * Split [start, end] into windows of at most `maxDays` that tile it without
 * overlapping. The gateway is **inclusive on both ends** — verified 2026-08-09,
 * where adjacent chunks sharing a boundary each returned the boundary day and
 * produced 147 duplicate points in one bundle — so the next chunk must start one
 * interval AFTER the previous one ended, not at the same instant.
 */
function chunkWindow(
  startTime: string,
  endTime: string,
  maxDays: number,
  granularity: string | undefined
) {
  const end = Date.parse(endTime);
  const step = maxDays * 86_400_000;
  const unit = intervalMs(granularity);
  const out: { startTime: string; endTime: string }[] = [];
  let cur = Date.parse(startTime);
  if (!Number.isFinite(cur) || !Number.isFinite(end) || cur >= end) {
    return [{ startTime, endTime }];
  }
  while (cur < end) {
    const stop = Math.min(cur + step, end);
    out.push({ startTime: new Date(cur).toISOString(), endTime: new Date(stop).toISOString() });
    cur = stop + unit;
  }
  return out;
}

/**
 * Keep the most recent `maxDays` of a window. Used instead of chunking for
 * `NONE`, where the whole point of the query is ONE aggregate over the window:
 * chunking it would silently turn a single number into N numbers over N
 * different spans, which is a different question with the same metric name.
 */
function clampToRecent(win: { startTime: string; endTime: string }, maxDays: number) {
  const end = Date.parse(win.endTime);
  const earliest = end - maxDays * 86_400_000;
  const start = Date.parse(win.startTime);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= earliest) return win;
  return { startTime: new Date(earliest).toISOString(), endTime: win.endTime };
}

// Build the universe-specific request list the extension replays. Templates are
// universe-independent; we inject resourceId + the chosen time window here.
// The seeded plan (default-plan.ts) always applies, so a fresh install can pull
// a game it has never visited; templates learned from real captures are merged
// over it, and a captured template wins on key collision.
// Phase 0. Which dimension VALUES does this universe actually have? Funnel
// names are developer-defined, so the plan cannot be built without asking.
const DEVELOP = "https://develop.roblox.com";

export function getDiscoveryRequests(
  universeId: string,
  startTime: string,
  endTime: string
): GrabRequest[] {
  // Which places belong to this universe? Needed to ask for version history,
  // which turns `PlaceVersion=546` into a real publish timestamp instead of an
  // inference from when errors first appeared.
  const places: GrabRequest = {
    id: "places:universe",
    kind: "places",
    metric: null,
    url: `${DEVELOP}/v1/universes/${universeId}/places?limit=100&sortOrder=Asc`,
    method: "GET",
    body: undefined,
    optional: true,
  };
  return [places, ...DISCOVER_DIMENSIONS.map((d) => ({
    id: `dimensions:${d.name}`,
    kind: "dimensions" as const,
    metric: null,
    dimension: d.name,
    url: `${API}/analytics-query-gateway/v1/dimensions/resource/RESOURCE_TYPE_UNIVERSE/id/${universeId}`,
    method: "POST" as const,
    body: {
      resourceType: "RESOURCE_TYPE_UNIVERSE",
      resourceId: universeId,
      query: {
        resourceType: "RESOURCE_TYPE_UNIVERSE",
        resourceId: universeId,
        dimensions: [d],
        startTime,
        endTime,
      },
    },
    optional: true,
  }))];
}

// Version history for each place. `sortOrder=Desc&limit=100` covers the most
// recent 100 publishes, which is far more than any comparison window needs.
export function getPlaceVersionRequests(placeIds: string[]): GrabRequest[] {
  return placeIds.map((placeId) => ({
    id: `versions:${placeId}`,
    kind: "placeVersions" as const,
    metric: null,
    placeId,
    url: `${DEVELOP}/v1/assets/${placeId}/saved-versions?limit=100&sortOrder=Desc`,
    method: "GET" as const,
    body: undefined,
    optional: true,
  }));
}

// Player feedback (up/down-votes + comments) per place. Cursor-paginated; the
// interceptor walks every page (`has_more`/`next_cursor`) and merges them, so
// one request here pulls the whole set. Channel + service are Roblox-wide, not
// per-game — the only universe-specific input is the discovered placeId.
export function getReviewRequests(
  placeIds: string[],
  startTime: string,
  endTime: string
): GrabRequest[] {
  const win =
    (startTime ? `&startTime=${encodeURIComponent(startTime)}` : "") +
    (endTime ? `&endTime=${encodeURIComponent(endTime)}` : "");
  return placeIds.map((placeId) => ({
    id: `reviews:${placeId}`,
    kind: "reviews" as const,
    metric: null,
    placeId,
    url: `${API}/player-generated-reviews-service/v1/channels/experience-discovery-page/assets/${placeId}/reviews?limit=100${win}`,
    method: "GET" as const,
    body: undefined,
    optional: true,
  }));
}

// Update annotations — the authoritative "was it us or Roblox" feed.
//
// The type space was enumerated on 2026-08-08 against two universes, and the
// responses name themselves. Types 1..17 are valid; 18..24 return 400, so
// asking for them only fills the failure table with noise. The one that
// answers "was it Roblox" is ENGINE_RELEASE — RCC entries are server-engine
// rollouts, which is what a ServerCrashCount spike must be read against.
//
// Types with an empty name were valid (HTTP 200) but returned no rows on
// either universe, so their meaning is still unknown — that is honest, and
// they stay in the plan because a row from one is exactly what we are missing.
const ANNOTATION_TYPES: { type: number; name: string }[] = [
  { type: 1, name: "PLACE_ICON" },
  { type: 2, name: "" },
  { type: 3, name: "" },
  { type: 4, name: "PLACE_THUMBNAIL" },
  { type: 6, name: "" },
  { type: 7, name: "FUNNEL" }, // observed: the dashboard's own funnel request
  { type: 8, name: "EXPERIENCE_EVENT_STATE" },
  { type: 9, name: "" },
  { type: 10, name: "ENGINE_RELEASE" },
  { type: 11, name: "" },
  { type: 12, name: "" },
  { type: 13, name: "" },
  { type: 14, name: "" },
  { type: 15, name: "" },
  { type: 16, name: "CREATOR_REGEX_CHANGE" }, // observed: the dashboard requests this one
  { type: 17, name: "" },
];

// Only types the dashboard itself was captured requesting are `observed`; the
// rest are ours. They returned data, so they are `proven` — but tagging them
// all `observed` (as the first cut did) would have been a false claim, and
// audit-plan exists to catch exactly that.
const OBSERVED_ANNOTATION_TYPES = new Set([7, 16]);

export function getAnnotationRequests(
  universeId: string,
  startTime: string,
  endTime: string
): GrabRequest[] {
  const win = `inclusiveStartUtcTime=${encodeURIComponent(startTime)}&inclusiveEndUtcTime=${encodeURIComponent(endTime)}`;
  return ANNOTATION_TYPES.map(({ type, name }) => ({
    id: `annotations:${type}`,
    kind: "annotations" as const,
    metric: name ? `annotation:${name}` : null,
    url: `${API}/analytics-annotations/v1/universes/${universeId}/annotations?annotationType=${type}&${win}&cursor=&reverse=false&resultsPerPage=500`,
    method: "GET" as const,
    body: undefined,
    optional: true,
    provenance: OBSERVED_ANNOTATION_TYPES.has(type)
      ? ("observed" as const)
      : ("proven" as const),
  }));
}

export async function getGrabPlan(
  universeId: string,
  startTime: string,
  endTime: string,
  discovered?: Discovered
): Promise<GrabPlan> {
  const warnings: string[] = [];
  const merged = new Map<string, SeedTemplate>();
  for (const t of buildSeedTemplates(discovered)) merged.set(t.key, t);
  if (!discovered?.FunnelName?.length) {
    warnings.push(
      "no funnel names discovered — funnel requests omitted rather than guessed. Browse the Funnels tab once and Send captured, or check dimension discovery."
    );
  }

  let learned = 0;
  try {
    const { data, error } = await supabase
      .from("grab_templates")
      .select("key, kind, metric, resource_type, query");
    if (error) throw new Error(error.message);
    for (const t of data ?? []) {
      const q = t.query as SeedTemplate["query"];
      // Live tiles poll at minute granularity for a single instant — replaying
      // one over a multi-week window is meaningless, so drop those.
      if (q?.granularity === "METRIC_GRANULARITY_ONE_MINUTE") continue;
      merged.set(t.key as string, {
        key: t.key as string,
        kind: t.kind as "metric" | "benchmark",
        metric: t.metric as string,
        resourceType: (t.resource_type as string) ?? "RESOURCE_TYPE_UNIVERSE",
        query: q,
        // learned templates are harvested from real captured requests —
        // observed by definition
        provenance: "observed",
      });
      learned++;
    }
  } catch (e) {
    // Supabase down shouldn't stop a grab — the seeded plan is self-sufficient.
    warnings.push(`could not load learned templates (${(e as Error).message}); using the built-in plan only`);
  }

  const requests: GrabRequest[] = [
    ...getPlaceVersionRequests(discovered?.__places ?? []),
    ...getReviewRequests(discovered?.__places ?? [], startTime, endTime),
    ...getAnnotationRequests(universeId, startTime, endTime),
  ];
  const metricNames = new Set<string>();
  let chunked = 0;

  for (const t of merged.values()) {
    const rt = t.resourceType;
    metricNames.add(t.metric);
    if (t.kind === "benchmark") {
      // Benchmark bodies are flat: { metric, startTime, endTime }.
      const w = alignWindow(undefined, startTime, endTime);
      requests.push({
        id: `${t.kind}:${t.key}`,
        kind: "benchmark",
        metric: t.metric,
        url: `${API}/analytics-benchmark/v1/benchmarks/resource/${rt}/id/${universeId}`,
        method: "POST",
        body: { metric: t.metric, ...w, filter: [] },
        optional: t.optional,
        provenance: t.provenance,
      });
    } else {
      const gran = t.query?.granularity;
      const aligned = alignWindow(gran, startTime, endTime);
      const cap = maxWindowDays(t.metric, t.query);
      // Sub-daily templates are already clamped by alignWindow (half-hour to the
      // final 24h), so chunking them yields exactly one window.
      const windows = !cap
        ? [aligned]
        : gran === "METRIC_GRANULARITY_NONE" || !gran
        ? [clampToRecent(aligned, cap)]   // one aggregate stays one aggregate
        : chunkWindow(aligned.startTime, aligned.endTime, cap, gran);
      if (windows.length > 1) chunked += windows.length - 1;
      for (const w of windows) {
        const q = { ...(t.query as Record<string, unknown>), ...w };
        requests.push({
          // The window is part of the id: without it, N chunks of one template
          // collide and the grab report shows a single attempt.
          id: windows.length > 1
            ? `${t.kind}:${t.key}@${w.startTime.slice(0, 10)}`
            : `${t.kind}:${t.key}`,
          kind: "metric",
          metric: t.metric,
          url: `${API}/analytics-query-gateway/v1/metrics/resource/${rt}/id/${universeId}`,
          method: "POST",
          body: { resourceType: rt, resourceId: universeId, query: q },
          optional: t.optional,
          provenance: t.provenance,
        });
      }
    }
  }

  if (chunked) {
    warnings.push(
      `technical rung split into legal windows: +${chunked} extra requests ` +
        `(crash ≤${MAX_CRASH_WINDOW_DAYS}d, other perf/error ≤${MAX_PERF_WINDOW_DAYS}d). ` +
        `The gateway 400s a longer ask instead of truncating it, so this is how ` +
        `crash and error history is retrieved across a long span.`
    );
  }

  // One freshness request for all metrics (no resourceId on this endpoint).
  if (metricNames.size) {
    requests.push({
      id: "metadata:all",
      kind: "metadata",
      metric: null,
      url: `${API}/analytics-query-gateway/v1/metrics/metadata`,
      method: "POST",
      body: { query: { metrics: [...metricNames] } },
    });
  }

  return {
    universeId,
    startTime,
    endTime,
    requests,
    discovered,
    source: learned ? "seed+learned" : "seed",
    warnings,
  };
}

export async function getGames() {
  const { data, error } = await supabase.from("games").select("id, genre").order("id");
  if (error) throw new Error(error.message);
  return (data ?? []).map((g) => ({ id: g.id as string, genre: g.genre as string | null }));
}

async function freshnessMap(metrics?: string[]) {
  let q = supabase.from("metric_freshness").select("metric, latest_available_time");
  if (metrics?.length) q = q.in("metric", metrics);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  const m = new Map<string, string>();
  for (const row of data ?? []) m.set(row.metric as string, row.latest_available_time as string);
  return m;
}

export async function getMetrics(gameId: string) {
  const { data, error } = await supabase
    .from("metric_catalog")
    .select("metric")
    .eq("game_id", gameId);
  if (error) throw new Error(error.message);
  const metrics = [...new Set((data ?? []).map((r) => r.metric as string))].sort();
  const fresh = await freshnessMap(metrics);
  return metrics.map((metric) => ({
    metric,
    latestAvailableTime: fresh.get(metric) ?? null,
  }));
}

export type SeriesPoint = { date: string; ts: string; value: number | null; status: string | null };
export type Series = {
  key: string;
  label: string;
  breakdown: Record<string, string>;
  filters: Snapshot["filters"];
  points: SeriesPoint[];
};

export async function getSeries(gameId: string, metric: string) {
  const [snapRes, benchRes, updRes, fresh] = await Promise.all([
    supabase
      .from("metric_snapshots")
      .select("ts, date, granularity, series_key, breakdown, filters, value, status")
      .eq("game_id", gameId)
      .eq("metric", metric)
      .order("ts"),
    supabase
      .from("benchmarks")
      .select("percentile, ts, date, value")
      .eq("game_id", gameId)
      .eq("metric", metric)
      .order("ts"),
    supabase
      .from("updates")
      .select("id, game_id, title, occurred_at, notes")
      .eq("game_id", gameId)
      .order("occurred_at"),
    freshnessMap([metric]),
  ]);
  if (snapRes.error) throw new Error(snapRes.error.message);

  const groups = new Map<string, typeof snapRes.data>();
  for (const row of snapRes.data ?? []) {
    const arr = groups.get(row.series_key as string) ?? [];
    arr!.push(row);
    groups.set(row.series_key as string, arr!);
  }

  const series: Series[] = [...groups.entries()].map(([key, rows]) => {
    const first = rows![0];
    const bd = (first.breakdown ?? {}) as Record<string, string>;
    const fl = (first.filters ?? []) as Snapshot["filters"];
    const bdLabel = Object.entries(bd).map(([k, v]) => `${k}: ${v}`).join(", ");
    const flLabel = fl.map((f) => `${f.dimension}=${f.values.join("/")}`).join(", ");
    const label = [bdLabel, flLabel].filter(Boolean).join(" · ") || "Total";
    return {
      key,
      label,
      breakdown: bd,
      filters: fl,
      points: rows!.map((r) => ({
        date: r.date as string,
        ts: r.ts as string,
        value: r.value as number | null,
        status: r.status as string | null,
      })),
    };
  });
  series.sort((a, b) =>
    a.label === "Total" ? -1 : b.label === "Total" ? 1 : a.label.localeCompare(b.label)
  );

  const benchmarks: Record<string, SeriesPoint[]> = {};
  for (const b of benchRes.data ?? []) {
    (benchmarks[b.percentile as string] ??= []).push({
      date: b.date as string,
      ts: b.ts as string,
      value: b.value as number | null,
      status: null,
    });
  }

  // genre lives on the games row
  const { data: gameRow } = await supabase
    .from("games")
    .select("genre")
    .eq("id", gameId)
    .maybeSingle();

  return {
    metric,
    latestAvailableTime: fresh.get(metric) ?? null,
    genre: (gameRow?.genre as string | null) ?? null,
    series,
    benchmarks,
    updates: (updRes.data ?? []).map((u) => ({
      id: u.id as string,
      gameId: u.game_id as string,
      title: u.title as string,
      occurredAt: u.occurred_at as string,
      notes: (u.notes as string | null) ?? undefined,
    })),
  };
}

// The "Total" series (no breakdown, no filter) has this deterministic key.
const TOTAL_KEY = "b[]f[]";

export type OverviewMetric = {
  metric: string;
  latest: number | null;
  latestDate: string | null;
  previous: number | null;
  deltaPct: number | null;
  anyInvalid: boolean;
  spark: { date: string; value: number | null }[];
  representative?: boolean; // tile value is from a breakdown series, not a Total
  seriesLabel?: string; // which series the tile value came from
};

type RawPoint = { value: number | null; status: string | null };

function buildOverviewMetric(
  metric: string,
  dateMap: Map<string, RawPoint>,
  extra?: { representative?: boolean; seriesLabel?: string }
): OverviewMetric {
  const pts = [...dateMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, v]) => ({ date, value: v.value, status: v.status }));
  const latest = pts.length ? pts[pts.length - 1].value : null;
  const latestDate = pts.length ? pts[pts.length - 1].date : null;
  const prevIdx = pts.length > 7 ? pts.length - 8 : 0; // ~week-over-week
  const previous = pts.length > 1 ? pts[prevIdx].value : null;
  const deltaPct =
    latest != null && previous != null && previous !== 0
      ? ((latest - previous) / Math.abs(previous)) * 100
      : null;
  return {
    metric,
    latest,
    latestDate,
    previous,
    deltaPct,
    anyInvalid: pts.some((p) => p.status === "DATA_STATUS_INVALID"),
    spark: pts.slice(-14).map((p) => ({ date: p.date, value: p.value })),
    ...extra,
  };
}

function seriesLabelOf(breakdown: unknown, filters: unknown): string {
  const bd = (breakdown ?? {}) as Record<string, string>;
  const fl = (filters ?? []) as { dimension: string; values: string[] }[];
  const bdLabel = Object.entries(bd).map(([k, v]) => `${k}: ${v}`).join(", ");
  const flLabel = fl.map((f) => `${f.dimension}=${f.values.join("/")}`).join(", ");
  return [bdLabel, flLabel].filter(Boolean).join(" · ") || "Total";
}

// Tiles for every metric: the Total series where it exists, else the most
// populated breakdown series (so funnel/breakdown-only metrics still surface).
export async function getOverview(gameId: string): Promise<{
  metrics: OverviewMetric[];
  freshness: Record<string, string>;
}> {
  // Total (b[]f[]) series for all metrics — paginate past the 1000-row cap.
  const totalRows: { metric: string; date: string; value: number | null; status: string | null }[] = [];
  for (let from = 0; from < 100000; from += 1000) {
    const { data, error } = await supabase
      .from("metric_snapshots")
      .select("metric, date, value, status")
      .eq("game_id", gameId)
      .eq("series_key", TOTAL_KEY)
      .order("metric")
      .order("ts")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    totalRows.push(...(data as typeof totalRows));
    if (!data || data.length < 1000) break;
  }

  const byMetric = new Map<string, Map<string, RawPoint>>();
  for (const r of totalRows) {
    const dm = byMetric.get(r.metric) ?? new Map();
    dm.set(r.date, { value: r.value, status: r.status });
    byMetric.set(r.metric, dm);
  }

  const metrics: OverviewMetric[] = [...byMetric.entries()].map(([metric, dm]) =>
    buildOverviewMetric(metric, dm)
  );

  // Metrics that have data but no Total series (e.g. funnels — always per-step).
  const { data: catRows } = await supabase
    .from("metric_catalog")
    .select("metric")
    .eq("game_id", gameId);
  const have = new Set(byMetric.keys());
  const missing = [...new Set((catRows ?? []).map((r) => r.metric as string))].filter((m) => !have.has(m));

  for (const m of missing) {
    const rows: {
      series_key: string; date: string; value: number | null; status: string | null;
      breakdown: unknown; filters: unknown;
    }[] = [];
    for (let from = 0; from < 50000; from += 1000) {
      const { data, error } = await supabase
        .from("metric_snapshots")
        .select("series_key, date, value, status, breakdown, filters")
        .eq("game_id", gameId)
        .eq("metric", m)
        .order("ts")
        .range(from, from + 999);
      if (error) throw new Error(error.message);
      rows.push(...(data as typeof rows));
      if (!data || data.length < 1000) break;
    }
    if (!rows.length) continue;

    // pick the series with the most distinct dates as the representative tile
    const bySeries = new Map<string, Map<string, RawPoint>>();
    const meta = new Map<string, { breakdown: unknown; filters: unknown }>();
    for (const r of rows) {
      const dm = bySeries.get(r.series_key) ?? new Map();
      dm.set(r.date, { value: r.value, status: r.status });
      bySeries.set(r.series_key, dm);
      if (!meta.has(r.series_key)) meta.set(r.series_key, { breakdown: r.breakdown, filters: r.filters });
    }
    let bestKey = "", bestSize = -1;
    for (const [k, dm] of bySeries) if (dm.size > bestSize) { bestSize = dm.size; bestKey = k; }
    const mt = meta.get(bestKey)!;
    metrics.push(
      buildOverviewMetric(m, bySeries.get(bestKey)!, {
        representative: true,
        seriesLabel: seriesLabelOf(mt.breakdown, mt.filters),
      })
    );
  }

  const fresh = await freshnessMap();
  return { metrics, freshness: Object.fromEntries(fresh) };
}

export async function getUpdates(gameId: string) {
  const { data, error } = await supabase
    .from("updates")
    .select("id, game_id, title, occurred_at, notes")
    .eq("game_id", gameId)
    .order("occurred_at");
  if (error) throw new Error(error.message);
  return (data ?? []).map((u) => ({
    id: u.id as string,
    gameId: u.game_id as string,
    title: u.title as string,
    occurredAt: u.occurred_at as string,
    notes: (u.notes as string | null) ?? undefined,
  }));
}

export async function addUpdate(u: Omit<Update, "id">) {
  const { data, error } = await supabase
    .from("updates")
    .insert({
      game_id: u.gameId,
      title: u.title,
      occurred_at: u.occurredAt,
      notes: u.notes ?? null,
    })
    .select("id, game_id, title, occurred_at, notes")
    .single();
  if (error) throw new Error(error.message);
  return {
    id: data.id as string,
    gameId: data.game_id as string,
    title: data.title as string,
    occurredAt: data.occurred_at as string,
    notes: (data.notes as string | null) ?? undefined,
  };
}
