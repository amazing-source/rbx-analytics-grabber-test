# CLAUDE.md — Indigo LiveOps Analytics Tool

Working agreement for Claude Code on this repo. Read `CAHIER_DES_CHARGES.md` for
the full spec; this file is the day-to-day reference.

> **START HERE: `CORRECTNESS_PLAN.md` + `data/verify/COVERAGE.md`.** An audit on
> 2026-08-08 found 11 defects that made the tool's output untrustworthy —
> including one that hid a 30,393-crash incident behind an arbitrary breakdown
> slice. **All seven phases landed the same day**; the code changes are in
> `git log` from `Commit the ground-truth corpus` onward. What matters now:
>
> - **Resuming after a break, or on another machine? Read
>   `.claude/SESSION_LOG.md` first** (newest entry), then verify it against the
>   gates before trusting it — that is `checkpoint resume`. The log is written
>   by the `checkpoint` skill; run it whenever you stop or switch devices.
> - **Three gates — run them before and after any change** (measured
>   2026-08-10, not copied):
>   `npm run verify -- ../data/verify/9610561918/` → 23 pass · **2 fail** · 8 skip
>   and **exits 1**. BOTH fails are documented and held in the test's
>   `KNOWN_OPEN`, so `npm test` stays green while `verify` exits 1 — that is the
>   expected state, not a regression: (1) the disputed realtime-revenue hour
>   2026-08-08T00:00, and (2) `ErrorCount` half-hour, where 144 of 147 cells
>   match and the 3 that don't are all the 08:00 bucket at the export window's
>   own edge — the CSV holds a partial bucket, our later read holds the settled
>   one. `npm run audit-plan` → 140 templates, 0 failures. `npm test` → 41 pass.
>   A change that moves a number without moving these is unproven.
> - **Both universes were re-grabbed post-fix on 2026-08-08** — that closed the
>   last verification item. 9963622286's crash history is now present
>   (`ServerCrashCount` peak 1,060,617 on 2026-08-01). The re-grab then
>   disproved four of the audit's own findings; they are G1–G7 in
>   `data/verify/COVERAGE.md`.
> - `data/verify/COVERAGE.md` is the measurement that supersedes the audit's
>   defect table, and carries findings F1–F11 (things the audit missed).
>
> **Scope:** the grabber only — what we pull, whether it is accurate, and the
> files it writes. The architecture is NOT in scope: the web app, the
> Node/localhost setup and Supabase all stay as they are. Deleting or porting
> them was considered on 2026-08-08 and explicitly dropped.
>
> Standing rule that produced most of those defects: **an invented query shape
> that 400s, or returns an empty 200, tells you nothing about the game.** Only
> the dashboard's own captured request shape is evidence. Verify which series a
> number came from before stating any finding. `npm run audit-plan` now enforces
> this on the plan itself: every template is tagged `observed` / `proven` /
> `inferred`, and an inferred shape's failure may never be reported as a
> finding about a game.

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
- `data/games/<universe>/metrics/*.csv` — long format per metric
  (`…,status,captured_at,partial`); sub-daily metrics also get `*.daily.csv`
  with `agg` + `samples` + `partial`.
- `data/games/<universe>/data-quality.md` — settled points the gateway
  re-served differently (first read kept), and implausible units. **Read it
  before quoting a sub-daily number.**
- `data/games/<universe>/annotations.md` / `errors.md` — Roblox timeline
  annotations by type; error signatures by `MessageHash` with volumes.
- `data/README.md` — the semantics (UTC, `FILLED_ZERO`, `partial`, rate vs
  volume). Regenerated on every export from `export-files.ts`.
- `data/verify/` — the ground-truth corpus + `COVERAGE.md` / `INVENTORY.md`.
  The only part of `data/` that is committed.
Offline path, no server or DB: `cd web && npm run ingest:file -- <raw.json>`.

## Running the app — one command, and Supabase is meant to be dead
`cd web && npm run dev` → http://localhost:3000. That is the whole procedure.
Deps are installed and `web/.env.local` is already correct, so there is nothing
to discover first: no run-skill to hunt for, no route listing, no API smoke
test. **Supabase is a deliberate placeholder** (`https://placeholder.supabase.co`)
and there is no project behind it, so every DB-backed route (`/api/games`,
`/api/overview`, `/api/series`, …) answers `TypeError: fetch failed` / 500.
**That is the steady state, not a bug** — the file mirror above is the real
sink, and the architecture is out of scope. The var must *exist* but may point
nowhere: `src/lib/supabase.ts` throws at module-import time when it is unset,
while a dead URL imports fine and only fails on an actual query. So never empty
it and never "fix" it by provisioning a project. `/` renders the dashboard shell
with empty tiles and a red error line, because the client chains every fetch off
`/api/games`. That is a running app.

## The three gates
Run from `web/`. Any change to what the numbers say must keep all three green,
and a change that fixes a number should move one of them.
- `npm run verify -- ../data/verify/<id>/` — diffs every dashboard-CSV cell
  against `series.json`. FAILs on a value mismatch **or** a cell missing from
  inside a window we hold (that is how omitted zero rows get caught). SKIPs are
  printed, never silent.
- `npm run audit-plan` — checks every seed template's `observed`/`proven`/
  `inferred` tag against the capture corpus and the grab reports. Fails on a
  non-optional guess or a false `observed` claim.
- `npm test` — regression fixtures built from real captures; every audit defect
  is encoded so it cannot return.

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
  **It is per-place and a 500 on one place drops it silently.** On 10030829154
  the ROOT place's call failed, so the file topped out at a sub-place's `v437`
  and read as complete while the root ran `v1698` — and every "did the metric
  break before or after the publish" test runs off this file. **Check the place
  list against the `Place` filter values in the metric templates before trusting
  it.** Fallback that worked: group `feedback.csv` by `asset_version` and take
  min/max date — it dated all six root publishes to the right hour. F12 in
  `data/verify/COVERAGE.md`.
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
- **A metric's headline series is the one with an EMPTY breakdown.** A `Place`
  filter still counts as the whole (the entire Performance tab is Place-scoped);
  a population filter (`IsNewUser`, `AcquisitionSource`) does not — that is a
  slice. If no unbroken-down series exists, there is NO headline: print `—` and
  `breakdown only`. Never fall back to `series[0]`. That fallback is what
  printed a 30,393-crash incident as "5" and peak concurrents as "0.5".
  `totalSeries()` in `export-files.ts` is the single implementation; use it.
- **A breakdown value ships with a human name — use it, don't re-derive it.**
  `breakdownValue[]` carries `displayValue` next to `value`: `FunnelStep` "4" is
  `Rebirth1`, not step four. The exporter used to drop it, which turned a funnel
  into twenty anonymous integers and downgraded a confirmed finding to a guess.
  `breakdownLabels` now carries it into `series.json`, the CSVs and every label,
  and is refreshed on merge so series stored before the fix pick names up on the
  next ingest. **The raw `value` remains the series identity** — display names
  are cosmetic and a shifting key would silently fork every merged series.
  Roblox sometimes sends `displayValue: ""` (PlayerProgression step 2); falling
  back to the integer is correct, and a later grab that does carry the name
  fills it in. Encoded as G9 in the test suite.
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
  window); for rates a missing day is genuinely unknown. The exporter now
  gap-fills count/robux volumes inside the requested window and marks them
  `status: FILLED_ZERO`; rates are never filled. Δ carries its real span, so a
  comparison that silently reaches further than 7 days says so.
- **`*.daily.csv` is currently WRONG where a day falls outside the half-hour
  served span — read the `ONE_DAY` rows instead.** The roll-up sums/maxes
  `FILLED_ZERO` rows, so on universe 9963622286 both `PeakConcurrentPlayers.
  daily.csv` and `ErrorCount.daily.csv` print **0 for 2026-08-14, the day the
  update shipped**, while the genuine `ONE_DAY` series in the same file says PCU
  3,139.57 and 11.2M client errors. Same roll-up invents a 2026-08-16 row on a
  day that has not happened. Measured 2026-08-15, F13 in
  `data/verify/COVERAGE.md`, **not yet fixed and not yet encoded as a test**.
- **A point whose interval had not elapsed when we captured it is `partial`**
  and is excluded from every headline, Δ and incident. This is what stopped
  `ClientCrashCount` printing "▼85.6%" off a 7-hour day.
- **Settled points are frozen, and that policy is an open question.** The
  gateway re-serves settled points with different values. Most of it is
  harmless — measured across 587 re-reads, the median divergence is 0.0000%
  and p90 is 0.78%, just Roblox recomputing its averages — so only material
  (>1%) divergence is logged, or the log becomes another flag that fires on
  everything. The material ones are large and go BOTH ways: 3,092 → 747 (the
  dashboard confirmed 3,092) but also 353 → 21,835, which looks like back-fill.
  We keep the first settled read; for anything labelled *Realtime* treat a
  revision row as "this hour is disputed" rather than trusting either value.
- The dashboard serves several charts at **`METRIC_GRANULARITY_HALF_HOUR`** —
  that is the resolution that answers "which hours are spiking", and the CSV
  exports in `data/verify/` prove the charts exist. **But the chart label does
  not tell you the metric.** Verified 2026-08-08 against a real grab:
  `ErrorCount`, `ServerCrashCount` and `PeakConcurrentPlayers` match the export
  cell-for-cell at half-hour; `ClientCrashRate15m` (65% off), `ClientFpsAvg`
  (52% off), `SessionDurationSecondsAvg` and `OomUnexpectedExits` **do not**,
  and are deliberately not requested at that granularity. Their daily versions
  are fine. Re-add one only when a captured dashboard request proves the shape.
  Half-hour windows are clamped to the **final 24h** — the gateway silently
  truncates long sub-daily windows (a 768-hour ask returned 240 hours), and
  absence outside the served span is NOT zero.
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
  **The technical rung has a HARD MAXIMUM WINDOW and the gateway 400s rather
  than truncating: ~1 month for performance metrics, 7 days for crashes.**
  Confirmed by the producer 2026-08-09 and visible in a 139-day grab of
  9963622286 that returned 38 behavioural metrics at full span while 400'ing
  every one of the 19 perf/error shapes that had worked on a 28-day window two
  days earlier. **The data still exists across the whole span — it just has to
  be asked for one legal window at a time.** `getGrabPlan` now CHUNKS
  automatically (`maxWindowDays` / `chunkWindow` in `store.ts`): a 139-day ask
  becomes 20 crash requests of 7 days and 5 perf requests of 28, tiled
  contiguously, each with its own id so `grab-report.md` shows every attempt.
  Cost: a 139-day plan is ~395 requests instead of ~143. Encoded as G8 in the
  test suite. **Do not "solve" a 400 here by shortening the grab** — that
  silently produces a game with no technical history, which reads exactly like
  a game that never crashed.

  **RETENTION HORIZON — the harder limit, measured 2026-08-09 by a chunked
  430-request grab of 9963622286 back to 2026-03-23.** Chunking legalises the
  *shape* of the ask; it cannot conjure data Roblox no longer stores. What came
  back, with 242 of the 245 failures being 400s on chunks older than the
  horizon:

  | Metric class | Oldest data served | Horizon |
  |---|---|---|
  | Crash + performance (FPS, memory, CPU, PCU, session) | 2026-07-11 | **~30 days** |
  | `ErrorCount` | 2026-06-15 | **~56 days** (a chunk boundary, so true horizon is 56–84d) |
  | Behavioural, retention, monetization, reach | 2026-03-23 (launch) | none found — full life |

  So a game's technical history **only exists for roughly the last month, and
  is gone forever after that**. Chunking still earned its keep — `ErrorCount`
  went 38 → 56 days and the recent month of perf now survives a long grab
  instead of 400ing wholesale — but March–June crash history for this universe
  does not exist and never will. **Corrects an earlier claim in this file:** the
  dead game's perf 400s WERE data ageing out, not the window. Any technical
  question about a period more than ~30 days before the grab is unanswerable —
  say so rather than reading absence as health. Grab often; the alternative is
  losing it.

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
