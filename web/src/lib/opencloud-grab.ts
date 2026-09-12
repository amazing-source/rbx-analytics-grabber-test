// Server-side Open Cloud grab — the second of the two grab paths.
//
// The EXTENSION path (interceptor.js replaying inside a create.roblox.com tab)
// stays the manual one: it needs Chrome open and a logged-in Roblox session,
// and it sees exactly what the dashboard sees, including the endpoints Open
// Cloud does not serve. This path is the SCHEDULED one: it runs inside the web
// app with an API key, so it survives the browser being closed.
//
// Both land in the same corpus through the same parse/export pipeline. That is
// the point — one parser, one freeze policy, one set of files. A capture from
// here is tagged `via: "opencloud"` so a number's origin stays knowable, but
// the body is stored exactly as Open Cloud returned it: raw stays honest.
//
// What this path does NOT replace (CLAUDE.md, measured 2026-08-19): update
// annotations, genre benchmarks, and the develop.roblox.com deploy log. Open
// Cloud serves the METRICS half. Those requests are skipped and REPORTED as
// skipped — an unreported skip reads as a metric the game never had, which is
// the same failure mode the grab report exists to prevent.

import { getGrabPlan, type GrabRequest } from "@/lib/store";
import { apiKey } from "@/lib/opencloud";
import type { Capture } from "@/lib/parse-captures";
import type { GrabAttempt, GrabReport } from "@/lib/export-files";
import { startProgress, updateProgress } from "@/lib/grab-progress";

const BASE = "https://apis.roblox.com/analytics-query-api/v1";

/** Measured 2026-08-19: 30 query POSTs/min, 3000 polls/min. The POST budget is
 *  the binding constraint at portfolio scale, so we pace to it rather than
 *  discovering it as 429s halfway through a plan. */
const POSTS_PER_MIN = 30;
// 2200ms, not the 2000ms the limit literally allows. Pacing exactly at the cap
// leaves no headroom for the server's own window boundary, and the first run
// that tried it took 39 metrics as HTTP 429 — which the report then showed as
// 39 failures, i.e. indistinguishable from a game with no data. 2200ms is what
// compare-opencloud.ts has been using successfully all along.
const POST_INTERVAL_MS = Math.ceil(60_000 / POSTS_PER_MIN) + 200;
const POLL_INTERVAL_MS = 1000;
const MAX_POLLS = 30;
/** A 429 is never an answer about the game. Retry it rather than record it. */
const MAX_429_RETRIES = 4;
const BACKOFF_MS = 15_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const GRANULARITY: Record<string, string> = {
  METRIC_GRANULARITY_NONE: "None",
  METRIC_GRANULARITY_ONE_MINUTE: "OneMinute",
  METRIC_GRANULARITY_HALF_HOUR: "HalfHour",
  METRIC_GRANULARITY_ONE_HOUR: "OneHour",
  METRIC_GRANULARITY_ONE_DAY: "OneDay",
  METRIC_GRANULARITY_ONE_WEEK: "OneWeek",
  METRIC_GRANULARITY_ONE_MONTH: "OneMonth",
};

/** The gateway's filter enum spelled the way Open Cloud wants it. Measured
 *  2026-08-19 by probe-filter: legal values are In, NotIn, GreaterThan,
 *  GreaterThanOrEqual, LessThan — and `In` is the equality operator, which is
 *  what scopes a query to one Place. Anything not in this map has no Open Cloud
 *  equivalent; the request is skipped and reported rather than sent in a shape
 *  the API will reject. NOT_CONTAINS is the known casualty (the MessageHash
 *  "-1" exclusion), so error-signature breakdowns stay on the extension path. */
const FILTER_OP: Record<string, string> = {
  FILTER_OPERATION_IN: "In",
  FILTER_OPERATION_UNSPECIFIED: "In",
  FILTER_OPERATION_NOT_IN: "NotIn",
  FILTER_OPERATION_GT: "GreaterThan",
  FILTER_OPERATION_GTE: "GreaterThanOrEqual",
  FILTER_OPERATION_LT: "LessThan",
};

/** Metrics Open Cloud serves only at granularity None. The funnel family is
 *  matched by prefix as well, so a funnel metric we have not met yet does not
 *  quietly fail on its first appearance. */
const NEEDS_NONE = new Set(["WeeklyCohortRetention"]);

export type CloudQuery = {
  metric: string;
  granularity: string;
  startTime: string;
  endTime: string;
  breakdown?: string[];
  filter?: { dimension: string; values: string[]; operation: string }[];
  limit?: number;
};

type GatewayQuery = {
  metric?: string;
  granularity?: string;
  startTime?: string;
  endTime?: string;
  breakdown?: { dimensions?: string[] }[];
  filter?: { dimension: string; values?: string[]; operation?: string }[];
  limit?: number;
};

/** Open Cloud stamps points `...+00:00`; the gateway stamps them `...Z`. Same
 *  instant, different spelling — and the merge keys on the timestamp STRING, so
 *  leaving it alone would fork every series into two copies of itself. */
export function normalizeTs(t: string): string {
  const d = new Date(t);
  return isNaN(d.getTime()) ? t : d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

/** Translate one seeded gateway request into an Open Cloud query.
 *  Returns null with a reason when the shape has no Open Cloud equivalent —
 *  never a silently dropped request. */
export function toCloudQuery(req: GrabRequest): { query: CloudQuery } | { skip: string } {
  if (req.kind !== "metric") return { skip: `kind "${req.kind}" is not served by Open Cloud` };
  const q = ((req.body as { query?: GatewayQuery })?.query ?? {}) as GatewayQuery;
  if (!q.metric) return { skip: "request carries no metric name" };

  let granularity = GRANULARITY[q.granularity ?? "METRIC_GRANULARITY_NONE"];
  if (!granularity) return { skip: `unmapped granularity ${q.granularity}` };
  if (!q.startTime || !q.endTime) return { skip: "request carries no window" };

  // Per-metric granularity overrides, measured 2026-08-19 and recorded in
  // CLAUDE.md: the funnel metrics and WeeklyCohortRetention are served at None,
  // not OneDay. The gateway takes ONE_DAY for these, so the seed plan asks for
  // it and Open Cloud answers "Granularity OneDay is not supported for metric
  // X" — which is us asking wrong, never the data missing. Eight of them.
  if (NEEDS_NONE.has(q.metric) || q.metric.startsWith("Funnel")) granularity = "None";

  let startTime = normalizeTs(q.startTime);
  const endTime = normalizeTs(q.endTime);

  // DailyCohortRetention is OneDay but caps at a 10-day window; a wider ask is
  // refused outright rather than truncated. Clamp to the most recent 10 days
  // instead of losing the metric entirely.
  if (q.metric === "DailyCohortRetention") {
    const end = Date.parse(endTime);
    const tenDaysBack = new Date(end - 10 * 86_400_000).toISOString().replace(/\.\d{3}Z$/, "Z");
    if (startTime < tenDaysBack) startTime = tenDaysBack;
  }

  const breakdown = (q.breakdown ?? []).flatMap((b) => b.dimensions ?? []).filter(Boolean);

  const filter: CloudQuery["filter"] = [];
  for (const f of q.filter ?? []) {
    const op = FILTER_OP[f.operation ?? "FILTER_OPERATION_IN"];
    if (!op) return { skip: `filter operation ${f.operation} has no Open Cloud equivalent` };
    filter.push({ dimension: f.dimension, values: (f.values ?? []).map(String), operation: op });
  }

  // Place must be a FILTER, never a breakdown: with breakdown ["Place",...] the
  // API answers 200 and silently drops the other dimension, returning one
  // series that looks like a complete answer. Measured 2026-08-19.
  if (breakdown.includes("Place")) {
    return { skip: "Place as a breakdown returns a silently-collapsed 200 — must be a filter" };
  }

  const query: CloudQuery = { metric: q.metric, granularity, startTime, endTime };
  if (breakdown.length) query.breakdown = breakdown;
  if (filter.length) query.filter = filter;
  if (q.limit) query.limit = q.limit;
  return { query };
}

type CloudResult =
  | { ok: true; status: number; body: unknown; points: number }
  | { ok: false; status: number; error: string };

/** Exported so the live board's metric snapshot reuses this exact loop rather
 *  than growing a second client. The 429 backoff and the done:false poll are
 *  the two things a hand-rolled probe always gets wrong, and a wrong one
 *  reports a rate limit or an unfinished query as a game with no data. */
export async function runQuery(
  universeId: string,
  query: CloudQuery,
  key: string,
  attempt = 0
): Promise<CloudResult> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/universes/${universeId}/metrics`, {
      method: "POST",
      headers: { "x-api-key": key, "content-type": "application/json" },
      body: JSON.stringify(query),
    });
  } catch (e) {
    return { ok: false, status: 0, error: (e as Error).message };
  }
  const text = await res.text();
  if (res.status === 429) {
    // Rate limited. This says nothing about the game, so it must not be
    // recorded as a metric that failed — that reads identically to "this
    // universe has no such data", which is the false finding the grab report
    // exists to prevent. Back off and ask again.
    if (attempt < MAX_429_RETRIES) {
      const retryAfter = Number(res.headers.get("retry-after")) * 1000;
      await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : BACKOFF_MS * (attempt + 1));
      return runQuery(universeId, query, key, attempt + 1);
    }
    return { ok: false, status: 429, error: `rate limited after ${MAX_429_RETRIES} retries` };
  }
  if (!res.ok) {
    // Open Cloud errors name the fix ("Granularity OneDay is not supported for
    // metric X"), so the message is worth keeping in full rather than a code.
    return { ok: false, status: res.status, error: text.slice(0, 400).replace(/\s+/g, " ") };
  }

  let body: { done?: boolean; path?: string; response?: unknown };
  try {
    body = JSON.parse(text);
  } catch {
    return { ok: false, status: res.status, error: "response was not JSON" };
  }

  // Async: the query is accepted with done:false and a path to poll. Treating
  // that as a failure is exactly the bug that once dropped whole metrics on the
  // gateway path (HANDOFF rule 4).
  for (let i = 0; i < MAX_POLLS && body.done === false && body.path; i++) {
    await sleep(POLL_INTERVAL_MS);
    try {
      const r = await fetch(`https://apis.roblox.com/analytics-query-api/${body.path}`, {
        headers: { "x-api-key": key },
      });
      if (!r.ok) return { ok: false, status: r.status, error: `poll HTTP ${r.status}` };
      body = await r.json();
    } catch (e) {
      return { ok: false, status: 0, error: `poll failed: ${(e as Error).message}` };
    }
  }
  if (body.done === false) return { ok: false, status: 202, error: "still computing after 30 polls" };

  const values = ((body.response ?? {}) as { values?: { dataPoints?: unknown[] }[] }).values ?? [];
  const points = values.reduce((n, v) => n + (v.dataPoints?.length ?? 0), 0);
  return { ok: true, status: res.status, body, points };
}

export type CloudGrabResult = {
  universeId: string;
  captures: Capture[];
  report: GrabReport;
  skipped: { id: string; metric: string | null; kind: string; reason: string }[];
  ok: boolean;
  summary: string;
};

/** Run a full Open Cloud pass for one universe.
 *
 *  Discovery is INHERITED, never guessed: funnel names are developer-defined
 *  and hardcoding one produced valid queries matching zero rows, which reads
 *  identically to "the feature is unused". We reuse whatever the last grab
 *  discovered (grab-report.json); with none, getGrabPlan emits no funnel
 *  requests at all and says so in its warnings. */
export async function runOpenCloudGrab(opts: {
  universeId: string;
  startTime: string;
  endTime: string;
  discovered?: Record<string, string[]> | null;
}): Promise<CloudGrabResult> {
  const { universeId, startTime, endTime } = opts;
  const key = apiKey();
  if (!key) throw new Error("no Open Cloud key (web/.opencloud-key or ROBLOX_API_KEY)");

  startProgress(universeId);
  const plan = await getGrabPlan(universeId, startTime, endTime, opts.discovered ?? undefined);

  const captures: Capture[] = [];
  const attempts: GrabAttempt[] = [];
  const skipped: CloudGrabResult["skipped"] = [];

  // `total` counts every plan request, including the ones skipped below as not
  // served by Open Cloud, so the counter is monotone and ends at total.
  updateProgress(universeId, { phase: "querying", total: plan.requests.length });
  let done = 0, okCount = 0, emptyCount = 0, failedCount = 0;

  // Serial, paced to the POST budget. Concurrency would only buy us 429s: the
  // limit is per minute, not per connection.
  let sent = 0;
  for (const req of plan.requests) {
    const t = toCloudQuery(req);
    if ("skip" in t) {
      skipped.push({ id: req.id, metric: req.metric, kind: req.kind, reason: t.skip });
      updateProgress(universeId, { done: ++done, skipped: skipped.length });
      continue;
    }
    if (sent > 0) await sleep(POST_INTERVAL_MS);
    sent++;

    const r = await runQuery(universeId, t.query, key);
    const attempt: GrabAttempt = {
      metric: req.metric,
      kind: req.kind,
      granularity: t.query.granularity,
      breakdown: (t.query.breakdown ?? []).join("+"),
      filter: (t.query.filter ?? []).map((f) => `${f.dimension}=${f.values.join("/")}`).join(","),
      optional: !!req.optional,
      provenance: req.provenance ?? null,
      status: r.status,
      ok: r.ok,
      points: r.ok ? r.points : 0,
      error: r.ok ? null : r.error,
    };
    attempts.push(attempt);

    if (!r.ok) failedCount++;
    else if (r.points > 0) okCount++;
    else emptyCount++;
    // Published every request rather than on a timer: the number that matters
    // most is the FIRST status, and a grab whose every request 401s should say
    // so within seconds instead of at minute six.
    updateProgress(universeId, {
      done: ++done,
      sent,
      ok: okCount,
      empty: emptyCount,
      failed: failedCount,
      metric: req.metric,
      lastStatus: r.status,
      lastError: r.ok ? null : r.error,
    });

    if (r.ok) {
      captures.push({
        url: `${BASE}/universes/${universeId}/metrics`,
        method: "POST",
        via: "opencloud",
        ts: Date.now(),
        reqBody: JSON.stringify(t.query),
        body: r.body,
      });
    }
  }

  const withData = attempts.filter((a) => a.ok && a.points > 0).length;
  const empty = attempts.filter((a) => a.ok && a.points === 0).length;
  const failed = attempts.filter((a) => !a.ok).length;
  const points = attempts.reduce((n, a) => n + a.points, 0);

  return {
    universeId,
    captures,
    report: {
      universeId,
      startTime,
      endTime,
      planSource: `${plan.source} · opencloud`,
      discovered: opts.discovered ?? plan.discovered ?? null,
      requested: attempts.length,
      attempts,
    },
    skipped,
    ok: withData > 0,
    summary:
      `${universeId}: ${points} pts, ${withData} returned data, ${empty} empty, ` +
      `${failed} failed, ${skipped.length} not served by Open Cloud`,
  };
}
