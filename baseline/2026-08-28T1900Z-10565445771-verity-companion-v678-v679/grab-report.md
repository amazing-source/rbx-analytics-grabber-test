# Grab report — universe 10565445771

- Window: **2026-08-01 → 2026-08-30**
- Plan source: seed · opencloud
- Discovered dimension values: **__places**: 74542317333958
- Requested 128 · **107 returned data** · 16 empty · 5 failed (0 on observed/proven shapes)

## Failed — inferred shapes (probably not valid here)

Query shapes we constructed without a captured example. A failure usually means the dimension isn't valid for this universe. **Never report these as findings about the game.**

| Metric | Kind | Shape | HTTP | optional | Error |
|---|---|---|---|---|---|
| ForwardD1Retention | metric | OneDay · by PlaceVersion | 400 | yes | {"done":true,"error":{"code":2001,"message":"Query Validation Errors: Query Error: Dimension PlaceVersion is not supported for metric ForwardD1Retention."}} |
| WeeklyCohortRetention | metric | None · by CohortDay | 400 | yes | {"done":true,"error":{"code":2001,"message":"Query Validation Errors: Query Error: Dimension CohortDay is not supported for metric WeeklyCohortRetention."}} |
| DailyActiveUsers | metric | OneDay · by PlaceVersion | 400 | yes | {"done":true,"error":{"code":2001,"message":"Query Validation Errors: Query Error: Dimension PlaceVersion is not supported for metric DailyActiveUsers."}} |
| AverageSessionLengthMinutes | metric | OneDay · by PlaceVersion | 400 | yes | {"done":true,"error":{"code":2001,"message":"Query Validation Errors: Query Error: Dimension PlaceVersion is not supported for metric AverageSessionLengthMinutes."}} |
| DailyRevenue | metric | OneDay · by PlaceVersion | 400 | yes | {"done":true,"error":{"code":2001,"message":"Query Validation Errors: Query Error: Dimension PlaceVersion is not supported for metric DailyRevenue."}} |

## Returned 200 but no data points

**The query was valid and matched nothing.** That is NOT evidence the feature is unused — the most common cause is a filter value that doesn't exist on this universe (e.g. a hardcoded `FunnelName` that belongs to a different game). Verify against the dashboard before concluding anything from a row here.

| Metric | Shape |
|---|---|
| Attribution30DRobuxPerUser | OneDay |
| ForwardD30Retention | OneDay |
| EventAvgDailyActiveUsers | OneDay |
| EventAvgDailyRevenue | OneDay |
| EventAvgDailyUserPlaytimeMinutes | OneDay |
| EventAvgRevenuePerDailyActiveUser | OneDay |
| RSVPCount | OneDay |
| UsersJoinedFromNotifications | OneDay |
| ServerCrashCount | OneDay · where Place=74542317333958 |
| ServerCrashCount | OneDay · where Place=74542317333958 |
| ServerCrashCount | OneDay · where Place=74542317333958 |
| ServerCrashCount | OneDay · by CrashType · where Place=74542317333958 |
| ServerCrashCount | OneDay · by CrashType · where Place=74542317333958 |
| ServerCrashCount | OneDay · by CrashType · where Place=74542317333958 |
| ServerCrashCount | HalfHour · where Place=74542317333958 |
| ServerCrashCount | HalfHour · by CrashType · where Place=74542317333958 |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| Attribution7DPayerConversionRatio | OneDay | 21 |
| Attribution7DPlaytimePerUserInMinutes | OneDay | 21 |
| Attribution7DRobuxPerUser | OneDay | 21 |
| AttributionD1RetentionRatio | OneDay | 26 |
| AttributionD7RetentionRatio | OneDay | 20 |
| AveragePlayTimeMinutesPerDAU | OneDay | 27 |
| AverageRevenuePerPayingUser | OneDay | 26 |
| AverageRevenuePerUser | OneDay | 27 |
| AverageSessionLengthMinutes | OneDay | 27 |
| AverageSessionLengthMinutes | OneDay · where IsNewUser=New | 26 |
| AverageSessionLengthMinutes | OneDay · where IsNewUser=Returning | 27 |
| AverageSessionLengthMinutes | OneDay · by Platform | 145 |
| ClientCpuTimeAvg | OneDay · where Place=74542317333958 | 24 |
| ClientCpuTimeAvg | OneDay · by ClientCpuTimeCategory · where Place=74542317333958 | 120 |
| ClientCrashCount | OneDay · where Place=74542317333958 | 4 |
| ClientCrashCount | OneDay · where Place=74542317333958 | 7 |
| ClientCrashCount | OneDay · where Place=74542317333958 | 7 |
| ClientCrashCount | OneDay · where Place=74542317333958 | 5 |
| ClientCrashCount | OneDay · by Platform · where Place=74542317333958 | 11 |
| ClientCrashCount | OneDay · by Platform · where Place=74542317333958 | 34 |
| ClientCrashCount | OneDay · by Platform · where Place=74542317333958 | 41 |
| ClientCrashCount | OneDay · by Platform · where Place=74542317333958 | 30 |
| ClientCrashRate15m | OneDay · where Place=74542317333958 | 4 |
| ClientCrashRate15m | OneDay · where Place=74542317333958 | 7 |
| ClientCrashRate15m | OneDay · where Place=74542317333958 | 7 |
| ClientCrashRate15m | OneDay · where Place=74542317333958 | 5 |
| ClientCrashRate15m | OneDay · by Platform · where Place=74542317333958 | 20 |
| ClientCrashRate15m | OneDay · by Platform · where Place=74542317333958 | 42 |
| ClientCrashRate15m | OneDay · by Platform · where Place=74542317333958 | 42 |
| ClientCrashRate15m | OneDay · by Platform · where Place=74542317333958 | 30 |
| ClientFpsAvg | OneDay · where Place=74542317333958 | 25 |
| ClientFpsP10 | OneDay · where Place=74542317333958 | 25 |
| ClientFpsP10 | OneDay · by Platform · where Place=74542317333958 | 146 |
| ClientMemoryUsageAvg | OneDay · where Place=74542317333958 | 25 |
| ClientMemoryUsageAvg | OneDay · by Platform · where Place=74542317333958 | 146 |
| ClientMemoryUsagePercentageAvg | OneDay · where Place=74542317333958 | 25 |
| ClientMemoryUsagePercentageAvg | OneDay · by Platform · where Place=74542317333958 | 146 |
| CpuCoreUtilization | OneDay · where Place=74542317333958 | 25 |
| CpuTimeAvg | OneDay · where Place=74542317333958 | 25 |
| CpuTimeAvg | OneDay · by CpuTimeCategory · where Place=74542317333958 | 125 |
| DailyActiveUsers | OneDay | 27 |
| DailyActiveUsers | OneDay · where IsNewUser=New | 26 |
| DailyActiveUsers | OneDay · where IsNewUser=Returning | 27 |
| DailyActiveUsers | OneDay · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 95 |
| DailyActiveUsers | OneDay · by Platform | 145 |
| DailyCohortRetention | OneDay · by CohortDay | 28 |
| DailyRevenue | OneDay | 27 |
| DailyRevenue | OneDay · by RevenueSource | 89 |
| DailyRevenue | OneDay · by BalanceType | 51 |
| DauMauStickiness | OneDay | 27 |
| EndToEndCVR | OneDay | 26 |
| ErrorCount | OneDay | 28 |
| ErrorCount | OneDay · by LogSource | 56 |
| ErrorCount | OneDay · where Place=74542317333958 | 28 |
| ErrorCount | OneDay · by LogSource · where Place=74542317333958 | 56 |
| ErrorCount | HalfHour · where Place=74542317333958 | 22 |
| ErrorCount | HalfHour · by LogSource · where Place=74542317333958 | 44 |
| ForwardD1Retention | OneDay | 26 |
| ForwardD1Retention | OneDay · by Platform | 145 |
| ForwardD1Retention | OneDay · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 94 |
| ForwardD7Retention | OneDay | 20 |
| ForwardD7Retention | OneDay · by Platform | 120 |
| ItemMonetizationRevenue | OneHour · by ProductType | 659 |
| ItemMonetizationRevenue | OneHour | 222 |
| L7AverageDailyActiveUsers | OneDay | 27 |
| L7AverageDailyRevenue | OneDay | 27 |
| L7AverageForwardD1Retention | OneDay | 26 |
| L7AverageForwardD1Retention | OneDay · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 94 |
| L7AveragePlayTimeMinutesPerDAU | OneDay | 27 |
| L7AverageUniqueUsersWithPlaySessions | OneDay · by AcquisitionSource · where IsNewUser=New | 125 |
| MemoryUsageAvg | OneDay · where Place=74542317333958 | 24 |
| MemoryUsageAvg | OneDay · by MemoryUsageCategory · where Place=74542317333958 | 120 |
| MemoryUsageAvg | None · by ServerAgeBucket · where Place=74542317333958 | 9 |
| MonthlyActiveUsers | OneDay | 27 |
| OomUnexpectedExits | OneDay · where Place=74542317333958 | 2 |
| OomUnexpectedExits | OneDay · where Place=74542317333958 | 7 |
| OomUnexpectedExits | OneDay · where Place=74542317333958 | 7 |
| OomUnexpectedExits | OneDay · where Place=74542317333958 | 5 |
| OomUnexpectedExits | OneDay · by Platform · where Place=74542317333958 | 3 |
| OomUnexpectedExits | OneDay · by Platform · where Place=74542317333958 | 20 |
| OomUnexpectedExits | OneDay · by Platform · where Place=74542317333958 | 21 |
| OomUnexpectedExits | OneDay · by Platform · where Place=74542317333958 | 16 |
| PayingUsers | OneDay | 27 |
| PayingUsersCVR | OneDay | 27 |
| PayingUsersCVR | OneDay · by Platform | 145 |
| PeakConcurrentPlayers | OneDay · by Platform · where Place=74542317333958 | 146 |
| PeakConcurrentPlayers | OneDay · where Place=74542317333958 | 25 |
| PeakConcurrentPlayers | HalfHour · where Place=74542317333958 | 23 |
| PlayerFeedbackVotesCount | OneDay | 24 |
| PotentialExtraEarningsTotalUsd | None | 1 |
| RFYL7PlayDays | OneDay | 20 |
| RFYQualifiedPTR | OneDay | 20 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | OneDay | 20 |
| ServerCrashCount | OneDay · where Place=74542317333958 | 6 |
| ServerCrashCount | OneDay · by CrashType · where Place=74542317333958 | 6 |
| ServerFrameRateP10 | OneDay · where Place=74542317333958 | 24 |
| SessionDurationSecondsAvg | OneDay · where Place=74542317333958 | 25 |
| SessionDurationSecondsAvg | OneDay · by Platform · where Place=74542317333958 | 146 |
| TotalPlayTimeHours | OneDay | 27 |
| TotalSessionsEndedInBucket | None · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | OneDay | 26 |
| UniqueUsersWithImpressions | OneDay · by AcquisitionSource | 136 |
| UniqueUsersWithImpressions | OneDay · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 26 |
| UniqueUsersWithPlaySessions | OneDay | 27 |
| UniqueUsersWithPlaySessions | OneDay · where IsNewUser=New | 26 |
| Visits | OneDay | 27 |
| Visits | OneDay · by Platform | 145 |
