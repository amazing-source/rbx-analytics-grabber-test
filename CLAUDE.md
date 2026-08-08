# CLAUDE.md — Indigo LiveOps Analytics Tool

Working agreement for Claude Code on this repo. Read `CAHIER_DES_CHARGES.md` for
the full spec; this file is the day-to-day reference.

> **START HERE: `CORRECTNESS_PLAN.md`.** An audit on 2026-08-08 found 11 verified
> defects that make the tool's output untrustworthy — including one that hid a
> 30,393-crash incident behind an arbitrary breakdown slice. That plan is the
> current priority and is **not started**. Do not build new analysis on top of
> these numbers until Phase 2 (the CSV verification harness) is landed. Start at
> Phase 1 — a read-only pass over the whole project — not at the code.
>
> **Scope:** the grabber only — what we pull, whether it is accurate, and the
> files it writes. The architecture is NOT in scope: the web app, the
> Node/localhost setup and Supabase all stay as they are. Deleting or porting
> them was considered on 2026-08-08 and explicitly dropped.
>
> Standing rule that produced most of those defects: **an invented query shape
> that 400s, or returns an empty 200, tells you nothing about the game.** Only
> the dashboard's own captured request shape is evidence. Verify which series a
> number came from before stating any finding.

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
- Timestamps are UTC. `ONE_DAY` points are stamped `00:00:00Z` (verified across
  5,571 points). Sub-daily series are stamped at the interval boundary. Align on
  UTC.
- `status: DATA_STATUS_INVALID` is **99.5% of all points returned by the API** —
  it is almost certainly the protobuf zero-value ("unset"), NOT "estimated".
  Do not surface it as a per-row warning; a flag that fires on every row carries
  no information. The status that actually matters is
  `DATA_STATUS_NOT_STATISTICALLY_SIGNIFICANT` — on universe 9610561918 it fires
  on exactly one series (crash rate on Platform=TV, a tiny sample). Surface that
  one and exclude it from conclusions.
- **The API omits zero rows.** A missing day is absent, not `0`. For counts that
  almost always means zero (`ServerCrashCount` returned 10 days of a 27-day
  window); for rates a missing day is genuinely unknown. Gap-fill counts, never
  rates — and note that "Δ vs ~7 points earlier" silently spans non-adjacent
  dates on a sparse series.
- Several metrics are served at **`METRIC_GRANULARITY_HALF_HOUR`** —
  `ErrorCount`, `ClientFpsAvg`, `ClientCrashRate15m`, `PeakConcurrentPlayers`,
  `OomUnexpectedExits`, `SessionDurationSecondsAvg`. This is the resolution that
  answers "which hours are spiking". Proven by the dashboard CSV exports in
  `data/verify/`.
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
  `ClientCrashRate15m`, `ClientFpsP10`, `ClientMemoryUsagePercentageAvg`,
  `OomUnexpectedExits`, `ClientCrashCount`, `ServerCrashCount`, `CpuTimeAvg`,
  `CpuCoreUtilization`. This is the "did the update break something?" rung —
  rule it out before blaming design.
  **Every one of these requires `filter:[{dimension:"Place",values:[placeId]}]`
  and is queried at ONE_DAY.** Without the Place filter the gateway returns 400,
  and `metrics/metadata` reports the metric with NO `latestAvailableTime` — so
  both signals say "this universe has no performance data" when the dashboard is
  showing it in full. That combination cost a whole investigation: the July 2026
  9610561918 grab reported 37 perf failures and the summary carried one
  `ErrorCount` line. Read crash RATE, not crash COUNT — count tracks DAU and
  falls when the game shrinks, which reads as an improvement.
- Individual errors break down by **`MessageHash`**, never `ErrorMessage` (a
  guessed name that 400s): `granularity: NONE`, `breakdown:[MessageHash]`,
  `filter:[MessageHash NOT_CONTAINS "-1", Place]`, `limit: 500`. Errors are
  heavily concentrated — on 9610561918 one signature was 52% of 12.4M events.
  The hash→text mapping comes from the **async** dimensions endpoint
  (`errorReporting.dimensions/MessageHash`), which returns `done:false` and must
  be polled; the grabber does not poll yet, so we get volumes without text.
- `FirstSeenPlaceVersion` is a **filter** (with `FILTER_OPERATION_GTE`), not a
  breakdown — `ErrorCount` at NONE filtered to `>= <version>` is "errors this
  deploy introduced".

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
