// Pure parser: turns a raw extension capture dump into normalized rows ready
// to upsert. No DB, no Next.js — so it can be unit-tested against the fixture
// JSON the extension produces. See CLAUDE.md "Roblox API reference".

export type Capture = {
  url: string;
  method: string;
  via?: string;
  ts?: number;
  reqBody?: string | null;
  body?: unknown;
};

export type Snapshot = {
  gameId: string;
  metric: string;
  ts: string; // full ISO timestamp from the data point
  date: string; // UTC yyyy-mm-dd derived from ts
  granularity: string;
  breakdown: Record<string, string>; // dimension -> value ({} = Total series)
  filters: { dimension: string; values: string[]; operation?: string }[];
  seriesKey: string; // deterministic id for (breakdown + filters)
  value: number | null;
  stringValues: string[];
  status: string | null;
  // When the capture that carried this point was made. A point whose interval
  // had not fully elapsed at capture time is an in-progress partial — quoting
  // it as the day's value is how "Crash Count ▼85.6%" got printed off a
  // 7-hour day. Absent on captures that predate this field.
  capturedAt: string | null;
  // The request's own startTime/endTime. The API omits zero rows, so "which
  // dates did we ask about" cannot be reconstructed from the points that came
  // back — and without it, a count's missing day cannot be told apart from a
  // day outside the query.
  windowStart: string | null;
  windowEnd: string | null;
};

export type CatalogEntry = { metric: string; hash: string; gameId: string };

export type BenchmarkPoint = {
  gameId: string;
  metric: string;
  percentile: string; // "50" | "90"
  genre: string | null;
  // BENCHMARK_TYPE_GENRE or BENCHMARK_TYPE_SIMILARITY — some universes are
  // served similarity cohorts with an EMPTY genre, and a verdict must say
  // which population it compared against.
  benchmarkType: string | null;
  ts: string;
  date: string;
  value: number | null;
};

// One timeline annotation, from analytics-annotations. The type space is
// enumerated by the grab (only types 7 and 16 were ever observed from the
// dashboard, both empty) — which type carries Roblox-side incident entries is
// exactly what this capture exists to find out. Fields beyond the type are
// unknown until one returns rows, so the raw entry is kept verbatim.
export type Annotation = {
  gameId: string;
  annotationType: number;
  raw: unknown;
};

// A discovered dimension value (FunnelName, MessageHash, …). For MessageHash
// the entry is the hash→text mapping the error tables need.
export type DimensionValue = {
  gameId: string;
  dimension: string;
  value: string;
  raw: unknown;
};

export type MetadataEntry = { gameId: string; metric: string; latestAvailableTime: string };

// A universe-INDEPENDENT request template, harvested from a real captured request.
// The active grabber replays these with a fresh resourceId + time window, so a
// game can be pulled from its universeId alone, without browsing its dashboard.
export type GrabTemplate = {
  key: string;
  kind: "metric" | "benchmark";
  metric: string;
  resourceType: string;
  query: {
    metric: string;
    granularity?: string;
    breakdown?: unknown[];
    filter?: unknown[];
    limit?: number;
  };
};

// Identity of a template = what makes it a distinct request, minus the time
// window. Shared with the seeded default plan so a hand-written seed and the
// same request harvested from a real capture collapse to one entry.
export function templateKey(
  kind: "metric" | "benchmark",
  q: { metric: string; granularity?: string; breakdown?: unknown[]; filter?: unknown[]; limit?: number }
): string {
  return `${kind}|${q.metric}|${q.granularity ?? ""}|${JSON.stringify(
    q.breakdown ?? []
  )}|${JSON.stringify(q.filter ?? [])}|${q.limit ?? ""}`;
}

// A published place version, from develop.roblox.com version history. Turns
// `PlaceVersion=546` in the analytics into "shipped Jul 30 14:23 UTC".
export type PlaceVersion = {
  placeId: string;
  version: number;
  created: string;
  date: string;
  isPublished: boolean;
};

// A single player-feedback entry (an up/down-vote with an optional comment),
// from the player-generated-reviews-service. `assetVersion` is the place version
// the reviewer was on — so a complaint can be pinned to a deploy, exactly like a
// metric step change. Universe-independent: keyed on placeId, works for any game.
export type Feedback = {
  placeId: string;
  reviewId: string;
  assetVersion: number | null;
  category: string; // "Downvote" | "Upvote" | ...
  options: string[]; // category_option_ids — the reason tags the player picked
  comment: string;
  os: string | null;
  device: string | null;
  createdUtc: string;
  date: string;
};

export type ParseResult = {
  games: string[];
  snapshots: Snapshot[];
  catalog: CatalogEntry[];
  benchmarks: BenchmarkPoint[];
  metadata: MetadataEntry[];
  templates: GrabTemplate[];
  placeVersions: PlaceVersion[];
  feedback: Feedback[];
  annotations: Annotation[];
  dimensionValues: DimensionValue[];
};

function asObject(body: unknown): any {
  if (body == null) return null;
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }
  return body;
}

function universeIdFromUrl(url: string): string | null {
  const m = url.match(/\/id\/(\d+)/);
  return m ? m[1] : null;
}

function utcDate(iso: string): string {
  return iso.slice(0, 10); // points are stamped in UTC, so the date prefix is safe
}

// Metric points arrive as ISO strings; feedback timestamps arrive as epoch
// milliseconds (occasionally seconds). Normalize either to an ISO string.
function toIso(v: unknown): string {
  if (v == null || v === "") return "";
  if (typeof v === "number" || /^\d+$/.test(String(v))) {
    const n = Number(v);
    const d = new Date(n > 1e12 ? n : n * 1000);
    return isNaN(d.getTime()) ? "" : d.toISOString();
  }
  return String(v);
}

// Stable, order-independent key for a series identity.
function makeSeriesKey(
  breakdown: Record<string, string>,
  filters: Snapshot["filters"]
): string {
  const b = Object.keys(breakdown)
    .sort()
    .map((k) => `${k}=${breakdown[k]}`)
    .join(",");
  const f = [...filters]
    .map((x) => `${x.dimension}:${[...x.values].sort().join("|")}`)
    .sort()
    .join(",");
  return `b[${b}]f[${f}]`;
}

function breakdownToMap(
  arr: { dimension?: string; value?: string }[] | undefined
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const x of arr ?? []) {
    if (x && x.dimension != null) out[x.dimension] = String(x.value ?? "");
  }
  return out;
}

export function parseCaptures(captures: Capture[]): ParseResult {
  const games = new Set<string>();
  const snapshots: Snapshot[] = [];
  const catalog = new Map<string, CatalogEntry>();
  // de-dupe benchmark points on their conflict key (last-write-wins)
  const benchmarks = new Map<string, BenchmarkPoint>();
  const metadata = new Map<string, MetadataEntry>();
  const templates = new Map<string, GrabTemplate>();
  const placeVersions = new Map<string, PlaceVersion>();
  const feedback = new Map<string, Feedback>();
  const annotations: Annotation[] = [];
  const dimensionValues = new Map<string, DimensionValue>();

  function addTemplate(kind: "metric" | "benchmark", req: any) {
    // metric bodies are { resourceType, resourceId, query:{metric,...} };
    // benchmark bodies are flat { metric, startTime, endTime }.
    const q = kind === "benchmark" ? req : req?.query;
    if (!q?.metric) return;
    const key = templateKey(kind, q);
    templates.set(key, {
      key,
      kind,
      metric: q.metric,
      resourceType: req.resourceType ?? "RESOURCE_TYPE_UNIVERSE",
      query: {
        metric: q.metric,
        granularity: q.granularity,
        breakdown: q.breakdown ?? [],
        filter: q.filter ?? [],
        limit: q.limit,
      },
    });
  }
  // de-dupe identical snapshot rows (last-write-wins on re-capture)
  const snapSeen = new Map<string, number>();

  for (const c of captures) {
    const url = c.url || "";
    const body = asObject(c.body);

    // --- Place version history: GET develop.roblox.com/v1/assets/{id}/saved-versions
    if (/develop\.roblox\.com\/v1\/assets\/(\d+)\/saved-versions/.test(url)) {
      const placeId = url.match(/assets\/(\d+)\//)?.[1] ?? "";
      for (const v of body?.data ?? []) {
        // Field names have varied across API revisions; accept the aliases.
        const version = v?.assetVersionNumber ?? v?.versionNumber ?? v?.version;
        const created = v?.created ?? v?.createdUtc ?? v?.Created;
        if (version == null || !created) continue;
        placeVersions.set(`${placeId}|${version}`, {
          placeId,
          version: Number(version),
          created: String(created),
          date: utcDate(String(created)),
          isPublished: v?.isPublished !== false,
        });
      }
      continue;
    }

    // --- Player feedback: GET player-generated-reviews-service/.../assets/{placeId}/reviews
    // Cursor-paginated; the active grabber merges every page into one body before
    // this runs, so body.reviews is the whole set. De-duped on the review id.
    if (/player-generated-reviews-service\/v1\/channels\/[^/]+\/assets\/(\d+)\/reviews/.test(url)) {
      const placeId = url.match(/assets\/(\d+)\/reviews/)?.[1] ?? "";
      for (const rv of body?.reviews ?? []) {
        if (!rv?.id) continue;
        const created = toIso(rv.created_utc ?? rv.createdUtc ?? "");
        feedback.set(String(rv.id), {
          placeId: String(rv.asset_id ?? placeId),
          reviewId: String(rv.id),
          assetVersion: rv.asset_version != null ? Number(rv.asset_version) : null,
          category: String(rv.category_type ?? ""),
          options: Array.isArray(rv.category_option_ids) ? rv.category_option_ids.map(String) : [],
          comment: String(rv.comment ?? ""),
          os: rv.metadata?.operating_system_type ?? null,
          device: rv.metadata?.device_type ?? null,
          createdUtc: created,
          date: created ? utcDate(created) : "",
        });
      }
      continue;
    }

    // --- Timeline annotations: GET analytics-annotations/v1/universes/{id}/annotations
    if (/analytics-annotations\/v1\/universes\/(\d+)\/annotations/.test(url)) {
      const gameId = url.match(/universes\/(\d+)\//)?.[1] ?? "";
      const typeMatch = url.match(/[?&]annotationType=(\d+)/);
      const annotationType = typeMatch ? Number(typeMatch[1]) : -1;
      for (const a of (body as any)?.annotations ?? []) {
        annotations.push({ gameId, annotationType, raw: a });
      }
      continue;
    }

    // --- Dimension values: POST .../dimensions/resource/.../id/{universeId} ---
    // FunnelName/FunnelStep discovery, and the MessageHash hash→text mapping.
    if (/analytics-query-gateway\/v1\/dimensions\/resource/.test(url)) {
      const gameId = String(universeIdFromUrl(url) ?? "");
      const groups = (body as any)?.operation?.dimensionValuesResult?.values ?? [];
      for (const g of groups) {
        const dim = g?.dimension?.name;
        if (!dim) continue;
        for (const v of g.values ?? []) {
          if (v?.value == null) continue;
          dimensionValues.set(`${gameId}|${dim}|${v.value}`, {
            gameId,
            dimension: String(dim),
            value: String(v.value),
            raw: v,
          });
        }
      }
      continue;
    }

    // --- Metric data: POST .../metrics/resource/.../id/{universeId} ---
    if (/analytics-query-gateway\/v1\/metrics\/resource/.test(url)) {
      const req = asObject(c.reqBody);
      // Harvest the request template even from a done:false kickoff — the body
      // (metric, granularity, breakdown, filter) is what the grabber replays.
      if (req?.query?.metric) addTemplate("metric", req);
      const op = body?.operation;
      const values = op?.queryResult?.values;
      // Only resolved responses carry data; ignore the done:false kickoffs.
      if (!req || !values) continue;

      const gameId = String(req.resourceId ?? universeIdFromUrl(url) ?? "");
      if (!gameId) continue;
      games.add(gameId);

      const metric: string = req.query?.metric;
      const granularity: string = req.query?.granularity ?? "METRIC_GRANULARITY_NONE";
      const filters: Snapshot["filters"] = (req.query?.filter ?? []).map((f: any) => ({
        dimension: f.dimension,
        values: f.values ?? [],
        operation: f.operation,
      }));
      const capturedAt = typeof c.ts === "number" ? new Date(c.ts).toISOString() : null;
      const windowStart = req.query?.startTime ? String(req.query.startTime) : null;
      const windowEnd = req.query?.endTime ? String(req.query.endTime) : null;

      if (op.path && metric) {
        catalog.set(`${gameId}:${metric}`, { metric, hash: op.path, gameId });
      }

      for (const v of values) {
        const breakdown = breakdownToMap(v.breakdownValue);
        const seriesKey = makeSeriesKey(breakdown, filters);
        for (const dp of v.dataPoints ?? []) {
          const ts: string = dp.time;
          if (!ts) continue;
          const row: Snapshot = {
            gameId,
            metric,
            ts,
            date: utcDate(ts),
            granularity,
            breakdown,
            filters,
            seriesKey,
            value: typeof dp.value === "number" ? dp.value : null,
            stringValues: dp.stringValues ?? [],
            status: dp.status ?? null,
            capturedAt,
            windowStart,
            windowEnd,
          };
          const dedupe = `${gameId}|${metric}|${granularity}|${seriesKey}|${ts}`;
          if (snapSeen.has(dedupe)) {
            snapshots[snapSeen.get(dedupe)!] = row; // last-write-wins
          } else {
            snapSeen.set(dedupe, snapshots.length);
            snapshots.push(row);
          }
        }
      }
      continue;
    }

    // --- Genre benchmarks: POST .../analytics-benchmark/... ---
    if (/analytics-benchmark\/v1\/benchmarks\/resource/.test(url)) {
      const req = asObject(c.reqBody);
      if (req?.metric) addTemplate("benchmark", req);
      const values = body?.result?.values;
      if (!values) continue;
      const gameId = String(req?.resourceId ?? universeIdFromUrl(url) ?? "");
      const metric: string = req?.query?.metric ?? req?.metric ?? "unknown";
      if (gameId) games.add(gameId);
      for (const v of values) {
        const bd = breakdownToMap(v.breakdownValue);
        const percentile = bd.Percentile ?? "";
        for (const dp of v.dataPoints ?? []) {
          if (!dp.time) continue;
          benchmarks.set(`${gameId}|${metric}|${percentile}|${dp.time}`, {
            gameId,
            metric,
            percentile,
            // genre arrives as "" on universes served similarity cohorts —
            // empty is "no genre benchmark", not a parse failure
            genre: dp.metadata?.genre || null,
            benchmarkType: dp.metadata?.benchmarkType ?? null,
            ts: dp.time,
            date: utcDate(dp.time),
            value: typeof dp.value === "number" ? dp.value : null,
          });
        }
      }
      continue;
    }

    // --- Metric freshness: POST .../metrics/metadata ---
    // Shape: { operation: { metricMetadataResult: { metadata: [{metric, latestAvailableTime}] } } }
    // This endpoint has no /id/{universeId} — freshness is global per metric.
    if (/analytics-query-gateway\/v1\/metrics\/metadata/.test(url)) {
      const gameId = String(universeIdFromUrl(url) ?? "") || "";
      const list = body?.operation?.metricMetadataResult?.metadata;
      if (!Array.isArray(list)) continue;
      for (const m of list) {
        if (m?.metric && m?.latestAvailableTime) {
          metadata.set(`${gameId}:${m.metric}`, {
            gameId,
            metric: m.metric,
            latestAvailableTime: m.latestAvailableTime,
          });
        }
      }
      continue;
    }
  }

  return {
    games: [...games],
    snapshots,
    catalog: [...catalog.values()],
    benchmarks: [...benchmarks.values()],
    metadata: [...metadata.values()],
    templates: [...templates.values()],
    placeVersions: [...placeVersions.values()].sort((a, b) => b.version - a.version),
    feedback: [...feedback.values()].sort((a, b) => b.createdUtc.localeCompare(a.createdUtc)),
    annotations,
    dimensionValues: [...dimensionValues.values()],
  };
}
