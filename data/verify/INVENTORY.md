# Grab-plan inventory — what the grabber pulls today

Phase 1 (step 2) of `CORRECTNESS_PLAN.md`. Measured 2026-08-08 from:

- the **current seed plan** — `web/src/lib/default-plan.ts`, materialized via
  `buildSeedTemplates()` with one place and no funnel names (what a grab today
  would actually emit);
- the **last real grab reports** — `data/games/*/grab-report.json`, both from
  2026-08-07 runs that predate the Place-filter fix in `perfSpecs()`;
- **every raw capture bundle** found: 7 in `data/raw/` **plus 2 that only exist
  in the extension's Downloads fallback**
  (`C:\Users\bfhdh\Downloads\rbx-analytics-grabber\data\raw\`), including
  `9610561918-2026-08-08T07-49-47-260Z.json` — the Aug-8 performance-tab
  passive capture that is the sole source of the crash-incident series and of
  every observed perf query shape. **It is not in the repo.**

How to read the tables:

- **Observed** = the same shape (metric · granularity · breakdown dims · filter
  dims+operation, values ignored) appears in a captured dashboard request —
  the only provenance that counts as evidence per CLAUDE.md. "replay only"
  means we've only ever seen our own replay of it succeed.
- The two outcome columns are from the **pre-fix** runs, so every
  `where Place` row shows "not attempted": no active grab has run since the
  perf shapes were fixed on 2026-08-08. Their evidence is the passive corpus.
- `✓ N pts` = returned data · `empty 200` = valid query, zero rows · `HTTP 400`
  = rejected.

## Caveats that change how you read the outcome columns

1. **The grab report misclassifies successes as failures.** Both runs record
   `placeVersions` as failed (`status:200, ok:false, points:0`) while the same
   run's bundle contains `saved-versions` responses with 100 rows each — which
   were ingested and produced `place-versions.md`. 9610561918's `reviews`
   attempt is likewise recorded failed while its bundle holds 47–49 reviews and
   `feedback.csv` exists. The success-detection in `collector.js` only
   recognizes `queryResult.values` / `metricMetadataResult` / `reviews` bodies;
   `{data:[...]}` (develop.roblox.com) is counted as failure. The "Failed"
   table of `grab-report.md` therefore cannot currently be trusted — the exact
   opposite of its purpose.
2. **Discovery results are not persisted.** Discovery captures (places list,
   dimension values) are pushed to the panel's passive buffer, not delivered
   with the grab — active bundles contain zero `dimensions/` captures. What
   discovery found survives only as a summary line inside the grab report.
3. **FunnelName discovery returned nothing on both games** — including
   9963622286, which has two funnels (`BaseUpgrades`, `PlayerProgression`; the
   dashboard's own dimensions call returns them, captured 2026-08-07). Our
   discovery request body is shape-identical to the dashboard's (only the
   window differs). The suspect is async handling: the dimensions endpoint can
   answer `done:false` + operation `path`; the replayer polls by **re-POSTing
   the same body** instead of fetching the path (`interceptor.js`), and
   `isResolved()` doesn't recognize `dimensionValuesResult` at all. Until this
   is fixed, **no active grab pulls any funnel metric** — the funnel data we
   hold for 9963622286 came from passively browsing the dashboard.
4. **Template learning is dead while Supabase is dead.** Learned templates
   exist only in the `grab_templates` table; the project is unreachable (DNS),
   so `getGrabPlan` falls back to seed-only every time, and newly observed
   shapes (the whole Aug-8 perf corpus) are never merged into a plan. The file
   mirror does not store templates.

## Table 1 — the current seed plan (112 templates)

`(benchmark)` rows are the flat benchmark endpoint, not the metrics gateway.

| Metric | Shape | Optional | Observed | 9610561918 (Jul 7→Aug 7 run) | 9963622286 (Jul 2→Aug 6 run) |
|---|---|---|---|---|---|
| UniqueUsersWithImpressions | ONE_DAY |  | replay only | ✓ 30 pts | ✓ 35 pts |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | yes | replay only | ✓ 238 pts | ✓ 214 pts |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource | yes | replay only | ✓ 30 pts | ✓ 35 pts |
| RFYQualifiedPTR | ONE_DAY |  | replay only | ✓ 30 pts | ✓ 35 pts |
| RFYL7PlayDays | ONE_DAY | yes | replay only | ✓ 30 pts | ✓ 35 pts |
| AttributionD1RetentionRatio | ONE_DAY | yes | replay only | ✓ 29 pts | ✓ 34 pts |
| Attribution7DPayerConversionRatio | ONE_DAY | yes | replay only | ✓ 24 pts | ✓ 29 pts |
| Attribution7DPlaytimePerUserInMinutes | ONE_DAY | yes | replay only | ✓ 24 pts | ✓ 29 pts |
| Attribution7DRobuxPerUser | ONE_DAY | yes | replay only | ✓ 24 pts | ✓ 29 pts |
| Attribution30DRobuxPerUser | ONE_DAY | yes | replay only | ✓ 1 pts | ✓ 6 pts |
| ForwardD1Retention | ONE_DAY |  | replay only | ✓ 29 pts | ✓ 34 pts |
| ForwardD1Retention | ONE_DAY · by Platform |  | replay only | ✓ 174 pts | ✓ 210 pts |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource | yes | replay only | ✓ 145 pts | ✓ 170 pts |
| ForwardD1Retention | ONE_DAY · by PlaceVersion | yes | — | HTTP 400 | HTTP 400 |
| ForwardD7Retention | ONE_DAY |  | replay only | ✓ 23 pts | ✓ 28 pts |
| ForwardD7Retention | ONE_DAY · by Platform | yes | replay only | ✓ 138 pts | ✓ 172 pts |
| ForwardD30Retention | ONE_DAY |  | replay only | empty 200 | ✓ 5 pts |
| DauMauStickiness | ONE_DAY |  | replay only | ✓ 30 pts | ✓ 35 pts |
| DailyCohortRetention | ONE_DAY · by CohortDay |  | — | HTTP 400 | HTTP 400 |
| WeeklyCohortRetention | ONE_DAY · by CohortDay | yes | — | HTTP 400 | HTTP 400 |
| L7AverageForwardD1Retention | ONE_DAY |  | replay only | ✓ 29 pts | ✓ 34 pts |
| L7AverageForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource |  | replay only | ✓ 145 pts | ✓ 170 pts |
| DailyActiveUsers | ONE_DAY |  | replay only | ✓ 30 pts | ✓ 35 pts |
| DailyActiveUsers | ONE_DAY · where IsNewUser |  | replay only | ✓ 30 pts | ✓ 35 pts |
| DailyActiveUsers | ONE_DAY · where IsNewUser |  | replay only | ✓ 30 pts | ✓ 35 pts |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource |  | replay only | ✓ 150 pts | ✓ 175 pts |
| DailyActiveUsers | ONE_DAY · by Platform | yes | replay only | ✓ 180 pts | ✓ 213 pts |
| DailyActiveUsers | ONE_DAY · by PlaceVersion | yes | — | HTTP 400 | HTTP 400 |
| MonthlyActiveUsers | ONE_DAY |  | replay only | ✓ 30 pts | ✓ 35 pts |
| Visits | ONE_DAY |  | replay only | ✓ 30 pts | ✓ 35 pts |
| Visits | ONE_DAY · by Platform | yes | replay only | ✓ 180 pts | ✓ 213 pts |
| AverageSessionLengthMinutes | ONE_DAY |  | replay only | ✓ 30 pts | ✓ 35 pts |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser |  | replay only | ✓ 30 pts | ✓ 35 pts |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser |  | replay only | ✓ 30 pts | ✓ 35 pts |
| AverageSessionLengthMinutes | ONE_DAY · by Platform | yes | replay only | ✓ 180 pts | ✓ 213 pts |
| AverageSessionLengthMinutes | ONE_DAY · by PlaceVersion | yes | — | HTTP 400 | HTTP 400 |
| AveragePlayTimeMinutesPerDAU | ONE_DAY |  | replay only | ✓ 30 pts | ✓ 35 pts |
| L7AveragePlayTimeMinutesPerDAU | ONE_DAY |  | replay only | ✓ 30 pts | ✓ 35 pts |
| L7AverageDailyActiveUsers | ONE_DAY |  | replay only | ✓ 30 pts | ✓ 35 pts |
| TotalPlayTimeHours | ONE_DAY |  | replay only | ✓ 30 pts | ✓ 35 pts |
| UniqueUsersWithPlaySessions | ONE_DAY |  | replay only | ✓ 30 pts | ✓ 35 pts |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser |  | replay only | ✓ 30 pts | ✓ 35 pts |
| L7AverageUniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser |  | replay only | ✓ 183 pts | ✓ 213 pts |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket |  | replay only | ✓ 61 pts | ✓ 61 pts |
| PayingUsersCVR | ONE_DAY |  | replay only | ✓ 30 pts | ✓ 35 pts |
| PayingUsersCVR | ONE_DAY · by Platform | yes | replay only | ✓ 182 pts | ✓ 213 pts |
| AverageRevenuePerPayingUser | ONE_DAY |  | replay only | ✓ 30 pts | ✓ 35 pts |
| AverageRevenuePerUser | ONE_DAY |  | replay only | ✓ 30 pts | ✓ 35 pts |
| PayingUsers | ONE_DAY |  | replay only | ✓ 30 pts | ✓ 35 pts |
| DailyRevenue | ONE_DAY |  | replay only | ✓ 30 pts | ✓ 35 pts |
| DailyRevenue | ONE_DAY · by RevenueSource |  | replay only | ✓ 96 pts | ✓ 123 pts |
| DailyRevenue | ONE_DAY · by BalanceType |  | replay only | ✓ 60 pts | ✓ 70 pts |
| DailyRevenue | ONE_DAY · by PlaceVersion | yes | — | HTTP 400 | HTTP 400 |
| L7AverageDailyRevenue | ONE_DAY |  | replay only | ✓ 30 pts | ✓ 35 pts |
| ItemMonetizationRevenue | ONE_HOUR · by ProductType |  | replay only | ✓ 727 pts | ✓ 781 pts |
| ItemMonetizationRevenue | ONE_HOUR |  | replay only | ✓ 216 pts | ✓ 197 pts |
| PotentialExtraEarningsTotalUsd | NONE |  | replay only | ✓ 1 pts | ✓ 1 pts |
| ErrorCount | ONE_DAY |  | replay only | ✓ 32 pts | ✓ 36 pts |
| ErrorCount | ONE_DAY · by LogSource |  | replay only | ✓ 64 pts | ✓ 72 pts |
| EventAvgDailyActiveUsers | ONE_DAY | yes | replay only | ✓ 30 pts | ✓ 35 pts |
| EventAvgDailyRevenue | ONE_DAY | yes | replay only | ✓ 30 pts | ✓ 35 pts |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | yes | replay only | ✓ 30 pts | ✓ 35 pts |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | yes | replay only | ✓ 30 pts | ✓ 35 pts |
| RSVPCount | ONE_DAY | yes | replay only | ✓ 30 pts | ✓ 35 pts |
| UsersJoinedFromNotifications | ONE_DAY | yes | replay only | ✓ 30 pts | ✓ 35 pts |
| PlayerFeedbackVotesCount | ONE_DAY | yes | replay only | ✓ 31 pts | ✓ 36 pts |
| RFYUniqueNotInterestedUsersPerMillionImpressions | ONE_DAY |  | replay only | ✓ 30 pts | ✓ 35 pts |
| EndToEndCVR | ONE_DAY | yes | replay only | ✓ 30 pts | ✓ 35 pts |
| AttributionD7RetentionRatio | ONE_DAY | yes | replay only | ✓ 23 pts | ✓ 28 pts |
| ClientCrashRate15m | ONE_DAY · where Place |  | dashboard | not attempted | not attempted |
| ClientCrashCount | ONE_DAY · where Place |  | dashboard | not attempted | not attempted |
| OomUnexpectedExits | ONE_DAY · where Place |  | dashboard | not attempted | not attempted |
| ServerCrashCount | ONE_DAY · where Place |  | dashboard | not attempted | not attempted |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place | yes | dashboard | not attempted | not attempted |
| ClientCrashCount | ONE_DAY · by Platform · where Place | yes | dashboard | not attempted | not attempted |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place | yes | dashboard | not attempted | not attempted |
| ServerCrashCount | ONE_DAY · by CrashType · where Place | yes | dashboard | not attempted | not attempted |
| ClientFpsP10 | ONE_DAY · where Place |  | dashboard | not attempted | not attempted |
| ClientMemoryUsageAvg | ONE_DAY · where Place |  | dashboard | not attempted | not attempted |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place |  | dashboard | not attempted | not attempted |
| ClientCpuTimeAvg | ONE_DAY · where Place |  | dashboard | not attempted | not attempted |
| MemoryUsageAvg | ONE_DAY · where Place |  | dashboard | not attempted | not attempted |
| CpuTimeAvg | ONE_DAY · where Place |  | dashboard | not attempted | not attempted |
| CpuCoreUtilization | ONE_DAY · where Place |  | dashboard | not attempted | not attempted |
| ClientFpsP10 | ONE_DAY · by Platform · where Place | yes | dashboard | not attempted | not attempted |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place | yes | dashboard | not attempted | not attempted |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place | yes | dashboard | not attempted | not attempted |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place | yes | dashboard | not attempted | not attempted |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place | yes | dashboard | not attempted | not attempted |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place | yes | dashboard | not attempted | not attempted |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place | yes | dashboard | not attempted | not attempted |
| PeakConcurrentPlayers | ONE_DAY · where Place |  | dashboard | not attempted | not attempted |
| ErrorCount | NONE · by MessageHash · where MessageHash(NOT_CONTAINS),Place |  | dashboard | not attempted | not attempted |
| ErrorCount | ONE_DAY · where Place |  | dashboard | not attempted | not attempted |
| ErrorCount | ONE_DAY · by LogSource · where Place |  | dashboard | not attempted | not attempted |
| ForwardD1Retention (benchmark) | — |  | replay only | ✓ 58 pts | ✓ 68 pts |
| ForwardD7Retention (benchmark) | — |  | replay only | ✓ 46 pts | ✓ 56 pts |
| ForwardD30Retention (benchmark) | — |  | replay only | empty 200 | ✓ 10 pts |
| DauMauStickiness (benchmark) | — |  | replay only | empty 200 | empty 200 |
| PayingUsersCVR (benchmark) | — |  | replay only | ✓ 60 pts | ✓ 70 pts |
| AverageRevenuePerPayingUser (benchmark) | — |  | replay only | ✓ 60 pts | ✓ 70 pts |
| AverageRevenuePerUser (benchmark) | — |  | replay only | ✓ 60 pts | ✓ 70 pts |
| DailyRevenue (benchmark) | — |  | replay only | ✓ 30 pts | ✓ 35 pts |
| PayingUsers (benchmark) | — |  | replay only | ✓ 30 pts | ✓ 35 pts |
| DailyActiveUsers (benchmark) | — |  | replay only | ✓ 30 pts | ✓ 35 pts |
| MonthlyActiveUsers (benchmark) | — |  | replay only | ✓ 30 pts | ✓ 35 pts |
| Visits (benchmark) | — |  | replay only | ✓ 30 pts | ✓ 35 pts |
| AverageSessionLengthMinutes (benchmark) | — |  | replay only | ✓ 60 pts | ✓ 70 pts |
| AveragePlayTimeMinutesPerDAU (benchmark) | — |  | replay only | ✓ 60 pts | ✓ 70 pts |
| TotalPlayTimeHours (benchmark) | — |  | replay only | ✓ 30 pts | ✓ 35 pts |
| L7AverageDailyActiveUsers (benchmark) | — |  | replay only | ✓ 30 pts | ✓ 35 pts |
| L7AverageDailyRevenue (benchmark) | — |  | replay only | ✓ 30 pts | ✓ 35 pts |
| L7AveragePlayTimeMinutesPerDAU (benchmark) | — |  | replay only | ✓ 60 pts | ✓ 70 pts |
| RFYL7PlayDays (benchmark) | — |  | dashboard | ✓ 60 pts | ✓ 70 pts |

## Table 2 — the funnel family (emitted only per discovered funnel name)

Currently **never emitted** — see caveat 3. `<name>` = a discovered
`FunnelName` value. 15 templates per funnel.

| Metric | Shape | Optional |
|---|---|---|
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName |  |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName |  |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName |  |
| FunnelUserTotalCount | NONE · where FunnelName |  |
| FunnelUserOverallCompletionRate | NONE · where FunnelName |  |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName |  |
| FunnelUserChurnRate | ONE_DAY · by FunnelStep · where FunnelName | yes |
| FunnelUserStepCompletionRate | ONE_DAY · by FunnelStep · where FunnelName | yes |
| FunnelUserOverallCompletionRate | ONE_DAY · where FunnelName | yes |
| FunnelUserTotalCount | ONE_DAY · by FunnelStep · where FunnelName | yes |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName |  |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName |  |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName | yes |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName | yes |
| FunnelStepOverallCompletionRate | NONE · where FunnelName | yes |

## Table 3 — shapes attempted in the last runs that are no longer in the plan

The pre-fix perf block (no Place filter, wrong granularity) and two guessed
dimension names. These rows explain the 36–37 "failed" entries in the on-disk
grab reports; all were removed or replaced by the fixed `perfSpecs()`.
Their 400s are evidence about the old queries, **not about the games**.

| Metric | Shape | 9610561918 | 9963622286 |
|---|---|---|---|
| PeakConcurrentPlayers | ONE_HOUR | HTTP 400 | HTTP 400 |
| ConcurrentPlayers | ONE_HOUR | HTTP 400 | HTTP 400 |
| ErrorCount | ONE_DAY · by FirstSeenPlaceVersion | HTTP 400 | HTTP 400 |
| ErrorCount | ONE_DAY · by ErrorMessage | HTTP 400 | HTTP 400 |
| ClientCrashCount | ONE_DAY | HTTP 400 | HTTP 400 |
| ClientCrashCount | ONE_DAY · by Platform | HTTP 400 | HTTP 400 |
| ServerCrashCount | ONE_DAY | HTTP 400 | HTTP 400 |
| ClientFpsP10 | ONE_DAY | HTTP 400 | HTTP 400 |
| ClientMemoryUsageAvg | ONE_DAY | HTTP 400 | HTTP 400 |
| ClientMemoryUsagePercentageAvg | ONE_DAY | HTTP 400 | HTTP 400 |
| ClientCpuTimeAvg | ONE_DAY | HTTP 400 | HTTP 400 |
| ClientFpsP10 | ONE_DAY · by Platform | HTTP 400 | HTTP 400 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform | HTTP 400 | HTTP 400 |
| ClientCrashRate15m | ONE_HOUR | HTTP 400 | HTTP 400 |
| ClientFpsAvg | ONE_HOUR | HTTP 400 | HTTP 400 |
| MemoryUsageAvg | ONE_HOUR | HTTP 400 | HTTP 400 |
| SessionDurationSecondsAvg | ONE_HOUR | HTTP 400 | HTTP 400 |
| OomUnexpectedExits | ONE_HOUR | HTTP 400 | HTTP 400 |
| ClientCrashRate15m | ONE_DAY | HTTP 400 | HTTP 400 |
| ClientFpsAvg | ONE_DAY | HTTP 400 | HTTP 400 |
| MemoryUsageAvg | ONE_DAY | HTTP 400 | HTTP 400 |
| OomUnexpectedExits | ONE_DAY | HTTP 400 | HTTP 400 |
| SessionDurationSecondsAvg | ONE_DAY | HTTP 400 | HTTP 400 |
| ClientFpsAvg | ONE_HOUR · by Platform | HTTP 400 | HTTP 400 |
| ClientCrashRate15m | ONE_HOUR · by Platform | HTTP 400 | HTTP 400 |
| MemoryUsageAvg | ONE_HOUR · by Platform | HTTP 400 | HTTP 400 |
| ClientCrashRate15m | ONE_HOUR · by PlaceVersion | HTTP 400 | HTTP 400 |
| OomUnexpectedExits | ONE_HOUR · by Platform | HTTP 400 | HTTP 400 |
| ClientFpsAvg | ONE_HOUR · by PlaceVersion | HTTP 400 | HTTP 400 |

## Table 4 — observed dashboard shapes the seed does NOT emit (the gap list)

Every row is a request the dashboard itself makes that a full grab today would
not. The `HALF_HOUR` rows are defect D5. The funnel rows differ from our family
by an extra `FunnelStep` filter. `PeakConcurrentPlayers @ ONE_MINUTE` is
excluded deliberately (live tile). `ClientFpsAvg @ HALF_HOUR` does not appear
here because no passive bundle contains it — but the dashboard CSV export
`Client frame rate` proves the chart exists and serves half-hour data
(see `COVERAGE.md` row 6); treat it as part of this gap list too.

| Metric | Shape | Where seen |
|---|---|---|
| ErrorCount | HALF_HOUR · by LogSource | dashboard capture |
| ErrorCount | HALF_HOUR · by LogSource · where Place | dashboard capture |
| ErrorCount | HALF_HOUR | dashboard capture |
| ErrorCount | HALF_HOUR · where Place | dashboard capture |
| ErrorCount | NONE · by MessageHash · where MessageHash(NOT_CONTAINS) | dashboard capture |
| ErrorCount | NONE · where FirstSeenPlaceVersion(GTE),Place | dashboard capture |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName,FunnelStep | dashboard capture |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName,FunnelStep | dashboard capture |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName,FunnelStep | dashboard capture |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName,FunnelStep | dashboard capture |
| FunnelStepOverallCompletionRate | NONE · by FunnelStep · where FunnelName,FunnelStep | dashboard capture |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName,FunnelStep | dashboard capture |
| FunnelStepTotalCount | NONE · where FunnelName | dashboard capture |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName,FunnelStep | dashboard capture |
| FunnelUserOverallCompletionRate | NONE · by FunnelStep · where FunnelName,FunnelStep | dashboard capture |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName,FunnelStep | dashboard capture |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName,FunnelStep | dashboard capture |
| MemoryUsageAvg | NONE · by ServerAgeBucket+MemoryUsageCategory · where Place | dashboard capture |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place | dashboard capture |
| PeakConcurrentPlayers | ONE_MINUTE · by Place+PlaceVersion | dashboard capture |
| PlayerFeedbackVotesCount | ONE_DAY · by VoteType | dashboard capture |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place | dashboard capture |
| ServerCrashCount | HALF_HOUR · where Place | dashboard capture |
| ServerFrameRateP10 | ONE_DAY · where Place | dashboard capture |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place | dashboard capture |
| SessionDurationSecondsAvg | ONE_DAY · where Place | dashboard capture |

## Table 5 — non-metric requests in the last runs

`placeVersions` and `reviews` "failed" rows are the misclassification from
caveat 1 — the data actually arrived and was exported.

| Request | 9610561918 | 9963622286 |
|---|---|---|
| reviews | 0 ok / 1 failed (0 items) | — |
| placeVersions | 0 ok / 1 failed (0 items) | 0 ok / 1 failed (0 items) |
| metadata | 1 ok / 0 failed (58 items) | 1 ok / 0 failed (58 items) |

## Where the numbers we hold actually came from

| Universe | Active grab (Aug 7) | Passive capture |
|---|---|---|
| 9610561918 | 80 metric/benchmark shapes, no perf (all 400) | **Aug-8 perf tab** (Downloads-only bundle): all perf dailies `where Place`, ServerCrashCount incl. the 30,393 spike, MessageHash top-500, SessionDuration, ServerFrameRateP10 |
| 9963622286 | 82 shapes, no perf (all 400) | Aug-7 browsing: funnels (both names, all steps), ErrorCount @ HALF_HOUR, annotations (types 7 & 16, both empty), reviews |

Neither universe has ever had a **post-fix active grab**. Re-grabbing both is
the first thing to do once Phase 2's harness can prove the result — it should
turn most of Table 1's perf rows from "not attempted" into real outcomes and is
expected to surface 9963622286's crash history (its `ServerCrashCount` is
absent from `series.json` entirely).
