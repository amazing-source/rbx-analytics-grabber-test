# CLAUDE.md — Indigo LiveOps Analytics Tool

Working agreement for Claude Code on this repo. Read `CAHIER_DES_CHARGES.md` for
the full spec; this file is the day-to-day reference.

## What this is
Internal tool for Indigo: pull ALL Creator Dashboard metrics for an owned Roblox
game in one shot, tag updates, and compare metrics pre/post update. Two parts:
a thin MV3 Chrome extension (captures the dashboard's own JSON) + a Next.js +
Supabase web app (storage, comparison engine, AI diagnosis).

## Two sinks, and the file one is not optional
Every ingest writes to **both** Supabase and the plain-file mirror in `data/`.
The file mirror is written FIRST and never fails the ingest, because a grab that
reached Roblox must not be lost to a database being down (it has been).
- `data/raw/<universe>-<ts>.json` — untouched capture bundle, re-parseable.
- `data/games/<universe>/summary.md` — headline table per category. Start here.
- `data/games/<universe>/series.json` — full record; merges across grabs.
- `data/games/<universe>/metrics/*.csv` — long format per metric; hourly metrics
  also get `*.daily.csv` with `agg` + `samples` (samples < 24 = partial day).
- `data/README.md` — the semantics (UTC, estimated points, rate vs volume).
Offline path, no server or DB: `cd web && npm run ingest:file -- <raw.json>`.

## Stack
- Web: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- Data/auth: Supabase (Postgres + Auth + Row-Level Security per producer)
- AI diagnosis: Anthropic API, server-side only (never expose the key client-side)
- Extension: Manifest V3, two content scripts — MAIN world (interceptor) +
  ISOLATED world (collector). No build step needed for the extension.

## Non-negotiable security rules
- NEVER read, store, log, or transmit `.ROBLOSECURITY` or any auth cookie.
- The extension only OBSERVES requests the page already makes. It must not issue
  its own authenticated requests in Phase 1 (passive capture only).
- Owned games only. This is a tool for data the user is already authorized to see.
- Anthropic API key lives server-side (Next.js route handler / server action),
  never in the extension or client bundle.

## Roblox API reference (discovered + verified, base = https://apis.roblox.com)
- METRIC DATA: `POST /analytics-query-gateway/v1/metrics/resource/RESOURCE_TYPE_UNIVERSE/id/{universeId}`
  → `operation.queryResult.values[].dataPoints[] {time,value,status}`;
    `values[].breakdownValue[] {dimension,value}` (empty = the "Total" series).
- METRIC NAMES/FRESHNESS: `POST /analytics-query-gateway/v1/metrics/metadata`
  → `[{metric, latestAvailableTime}]`.
- BENCHMARKS: `POST /analytics-benchmark/v1/benchmarks/resource/RESOURCE_TYPE_UNIVERSE/id/{universeId}`
  → 50th/90th percentile series, `genre` in metadata.
- UPDATE ANNOTATIONS (native): `GET /analytics-annotations/v1/universes/{universeId}/annotations?annotationType={n}&inclusiveStartUtcTime=...&inclusiveEndUtcTime=...`
- PERMISSIONS: `GET /developer-analytics-aggregations/v1/feature-permissions?universeId={id}`
- DEPLOY LOG (base = https://develop.roblox.com, GET, no CSRF needed):
  `GET /v1/universes/{universeId}/places?limit=100` → place IDs;
  `GET /v1/assets/{placeId}/saved-versions?limit=100&sortOrder=Desc`
  → `data[] {assetVersionNumber, created, isPublished}`. This is what turns
  `PlaceVersion=546` into "shipped 2026-07-30 14:23 UTC" — the single most
  useful non-analytics endpoint, because it dates every metric step change.
  Exported to `data/games/<id>/place-versions.{md,csv}`.
- `ErrorCount` broken down by `FirstSeenPlaceVersion` is a fallback deploy log
  (a version appearing = a ship) and by `ErrorMessage` is bug discovery.
- IGNORE as noise: `translations-cdn.roblox.com`, `barista-feature-flags`,
  `product-experimentation-platform`.
- Test universe: KameHameHa Walls For Brainrots = `10192528661`, genre `simulation`.

## The grab plan is seeded, not discovered
`web/src/lib/default-plan.ts` holds all 49 metrics Roblox serves, as query
shapes (metric name + granularity + breakdown + filter). The metric list was
mined from the dashboard's own `metrics/metadata` calls, not invented; valid
breakdown dimensions come from observed requests plus `v1/dimensions`
(AcquisitionSource, IsNewUser, Platform, PlaceVersion, CohortDay, RevenueSource,
BalanceType, ProductType, SessionTimeBucket, FunnelStep/FunnelName).
**Breakdowns that need a trend must use ONE_DAY, not NONE** — at NONE the
gateway returns a single aggregate point over the window, which silently makes
"did X change on date D" unanswerable.

**NEVER hardcode a dimension VALUE.** Dimension *names* are stable; their values
are per-universe. Funnel names are developer-defined. Hardcoding
`FunnelName: FUNNEL_TYPE_ONBOARDING` (copied from the test universe) produced
valid queries that matched zero rows on a game with seven-step custom funnels —
which reads identically to "the feature is unused", and was reported as such.
The grab now runs a discovery phase first:
`POST /analytics-query-gateway/v1/dimensions/resource/RESOURCE_TYPE_UNIVERSE/id/{id}`
with `query.dimensions:[{namespace,name}]` returns the real values; the plan is
built from those. If discovery finds nothing, emit NO funnel requests rather
than guessing — an absent request is honest, an empty result is a false finding.

**A 200 with zero data points is not evidence of anything.** It means the query
matched nothing. Check the dashboard before concluding the feature is unused.
Every attempt is recorded to `data/games/<id>/grab-report.md` (returned data /
empty 200 / failed), because a request that fails is dropped from the capture
list and would otherwise be invisible. `getGrabPlan` merges
templates learned from real captures OVER it — same key, captured wins — so a
fresh install can pull a game whose dashboard was never opened, and anything we
didn't anticipate is still learned. Query shapes we inferred rather than
observed are marked `optional: true`; a 4xx on those is reported as "n/a", not a
failure. Windows are snapped per granularity, and `ONE_MINUTE` templates (live
tiles) are dropped — replaying one over a 28-day window is meaningless.

## Metric identity is auto-mapped — do NOT hardcode hashes
Each metric's `operation.path` is a hash that can change. The metric NAME is in
the REQUEST body, which the dashboard sends via a `Request` object (body in
`args[0]`, not `args[1]`). The interceptor MUST clone `args[0]` when it's a
Request and read its body, so the name↔hash map is rebuilt automatically on every
capture. Never ship a static hash table. `metric_catalog` table holds the current
mapping, updated on ingest. (Metric *names* in `default-plan.ts` are fine — those
are what the dashboard itself puts in the request body. Hashes are what rot.)

## Data semantics gotchas
- Timestamps are UTC, points stamped at 08:00:00Z. Align on UTC.
- `status: DATA_STATUS_INVALID` means unvalidated/estimated, NOT wrong. Keep the
  value, surface the status as a flag.
- Comparison engine: split metrics into RATE (conversion, ARPPU, ARPDAU,
  retention %, funnel completion %) vs VOLUME (revenue, DAU, paying users,
  sessions). Only rate metrics are safe to compare across a growth window;
  for volume, show the delta but annotate the DAU growth over the window. Warn
  when two updates fall inside one comparison window.

## Build order
Phase 1: request-body capture → web app ingest/store/chart one game + manual
update tagging. Phase 2: pre/post comparison engine (rate/volume aware).
Phase 3: AI diagnosis in producer format. Phase 4: multi-producer + portfolio.
Ship something demoable to the producer at end of Phase 1.

## Conventions
- TypeScript everywhere, prefer server components / server actions for anything
  touching Supabase service role or the Anthropic key.
- Keys in `metric_snapshots`: one row per (game, metric, date, granularity,
  breakdown). Upsert on re-capture (last-write-wins).
- Keep the extension dumb: capture + forward only. All logic lives in the web app.
- No browser localStorage/sessionStorage for app state.

## Indispensable LiveOps metrics + the fixes to capture them
The tool doesn't need all 36 metrics. This is the non-negotiable set for a
post-update LiveOps diagnosis. (rate = comparable across windows; volume =
contextualize with DAU growth, don't compare raw.)

- Hook: `ForwardD1Retention` (rate), `AverageSessionLengthMinutes` (rate),
  `ForwardD1Retention` by `Platform` breakdown (rate).
- Repeat play: `ForwardD7Retention`, `ForwardD30Retention`, `DauMauStickiness`
  (rates); `DailyActiveUsers`, `MonthlyActiveUsers`, `PeakConcurrentPlayers` (volume).
- Monetization (core): `PayingUsersCVR` (conversion — #1), `AverageRevenuePerPayingUser`
  (ARPPU), `AverageRevenuePerUser` (ARPDAU) — all rates; `PayingUsers`,
  `DailyRevenue` (volume); `ItemMonetizationRevenue` by source breakdown
  (Passes vs Dev Products — the idle-game monetization thesis lives here).
- Funnel: `FunnelUserStepCompletionRate`, `FunnelUserChurnRate` (rate),
  `FunnelUserTotalCount` (volume).
- Performance / technical health (captured and surfaced — its own dashboard tab):
  `ClientCrashRate15m`, `ClientFpsAvg`, `MemoryUsageAvg` (hourly, plus a daily
  rollup), and `OomUnexpectedExits` where the game exposes it. This is the
  "did the update break something?" rung — rule it out before blaming design.
  Roblox queries these hourly only, so the exporter rolls them up: mean for
  rates, sum for volumes, max for concurrents.

Required fixes to capture this set cleanly:
1. **BLOCKER — capture the request body** (clone `args[0]` when it's a `Request`).
   Without it, hash↔name mapping isn't reliable.
2. **Keep full `breakdownValue[]`** — retention-by-platform, revenue-by-source,
   funnel-by-step are only useful broken down.
3. ~~One pass per page~~ — superseded by the seeded plan above; the active grab
   no longer depends on what happened to render. Passive capture still runs and
   still teaches the plan new query shapes.
4. **Capture `latestAvailableTime`** (from `metrics/metadata`) — the comparison
   engine must refuse/flag updates measured on un-matured data (e.g. D7 on a
   3-day-old cohort).
5. **Capture genre benchmark** — for automatic "above/below 50th/90th percentile"
   verdicts.
