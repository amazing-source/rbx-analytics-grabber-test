# Grab report — universe 10565445771

- Window: **2026-07-29 → 2026-08-27**
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
| OomUnexpectedExits | OneDay · where Place=74542317333958 |
| ServerCrashCount | OneDay · where Place=74542317333958 |
| ServerCrashCount | OneDay · where Place=74542317333958 |
| OomUnexpectedExits | OneDay · by Platform · where Place=74542317333958 |
| ServerCrashCount | OneDay · by CrashType · where Place=74542317333958 |
| ServerCrashCount | OneDay · by CrashType · where Place=74542317333958 |
| ServerCrashCount | HalfHour · where Place=74542317333958 |
| ServerCrashCount | HalfHour · by CrashType · where Place=74542317333958 |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| Attribution7DPayerConversionRatio | OneDay | 22 |
| Attribution7DPlaytimePerUserInMinutes | OneDay | 22 |
| Attribution7DRobuxPerUser | OneDay | 22 |
| AttributionD1RetentionRatio | OneDay | 25 |
| AttributionD7RetentionRatio | OneDay | 21 |
| AveragePlayTimeMinutesPerDAU | OneDay | 28 |
| AverageRevenuePerPayingUser | OneDay | 24 |
| AverageRevenuePerUser | OneDay | 28 |
| AverageSessionLengthMinutes | OneDay | 28 |
| AverageSessionLengthMinutes | OneDay · where IsNewUser=New | 25 |
| AverageSessionLengthMinutes | OneDay · where IsNewUser=Returning | 27 |
| AverageSessionLengthMinutes | OneDay · by Platform | 136 |
| ClientCpuTimeAvg | OneDay · where Place=74542317333958 | 21 |
| ClientCpuTimeAvg | OneDay · by ClientCpuTimeCategory · where Place=74542317333958 | 105 |
| ClientCrashCount | OneDay · where Place=74542317333958 | 1 |
| ClientCrashCount | OneDay · where Place=74542317333958 | 7 |
| ClientCrashCount | OneDay · where Place=74542317333958 | 7 |
| ClientCrashCount | OneDay · where Place=74542317333958 | 5 |
| ClientCrashCount | OneDay · by Platform · where Place=74542317333958 | 2 |
| ClientCrashCount | OneDay · by Platform · where Place=74542317333958 | 30 |
| ClientCrashCount | OneDay · by Platform · where Place=74542317333958 | 38 |
| ClientCrashCount | OneDay · by Platform · where Place=74542317333958 | 29 |
| ClientCrashRate15m | OneDay · where Place=74542317333958 | 1 |
| ClientCrashRate15m | OneDay · where Place=74542317333958 | 7 |
| ClientCrashRate15m | OneDay · where Place=74542317333958 | 7 |
| ClientCrashRate15m | OneDay · where Place=74542317333958 | 5 |
| ClientCrashRate15m | OneDay · by Platform · where Place=74542317333958 | 4 |
| ClientCrashRate15m | OneDay · by Platform · where Place=74542317333958 | 41 |
| ClientCrashRate15m | OneDay · by Platform · where Place=74542317333958 | 42 |
| ClientCrashRate15m | OneDay · by Platform · where Place=74542317333958 | 30 |
| ClientFpsAvg | OneDay · where Place=74542317333958 | 22 |
| ClientFpsP10 | OneDay · where Place=74542317333958 | 22 |
| ClientFpsP10 | OneDay · by Platform · where Place=74542317333958 | 128 |
| ClientMemoryUsageAvg | OneDay · where Place=74542317333958 | 22 |
| ClientMemoryUsageAvg | OneDay · by Platform · where Place=74542317333958 | 128 |
| ClientMemoryUsagePercentageAvg | OneDay · where Place=74542317333958 | 22 |
| ClientMemoryUsagePercentageAvg | OneDay · by Platform · where Place=74542317333958 | 128 |
| CpuCoreUtilization | OneDay · where Place=74542317333958 | 22 |
| CpuTimeAvg | OneDay · where Place=74542317333958 | 22 |
| CpuTimeAvg | OneDay · by CpuTimeCategory · where Place=74542317333958 | 110 |
| DailyActiveUsers | OneDay | 28 |
| DailyActiveUsers | OneDay · where IsNewUser=New | 25 |
| DailyActiveUsers | OneDay · where IsNewUser=Returning | 27 |
| DailyActiveUsers | OneDay · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 90 |
| DailyActiveUsers | OneDay · by Platform | 136 |
| DailyCohortRetention | OneDay · by CohortDay | 36 |
| DailyRevenue | OneDay | 28 |
| DailyRevenue | OneDay · by RevenueSource | 85 |
| DailyRevenue | OneDay · by BalanceType | 50 |
| DauMauStickiness | OneDay | 28 |
| EndToEndCVR | OneDay | 27 |
| ErrorCount | OneDay | 28 |
| ErrorCount | OneDay · by LogSource | 54 |
| ErrorCount | OneDay · where Place=74542317333958 | 28 |
| ErrorCount | OneDay · by LogSource · where Place=74542317333958 | 54 |
| ErrorCount | HalfHour · where Place=74542317333958 | 30 |
| ErrorCount | HalfHour · by LogSource · where Place=74542317333958 | 60 |
| ForwardD1Retention | OneDay | 27 |
| ForwardD1Retention | OneDay · by Platform | 138 |
| ForwardD1Retention | OneDay · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 89 |
| ForwardD7Retention | OneDay | 21 |
| ForwardD7Retention | OneDay · by Platform | 124 |
| ItemMonetizationRevenue | OneHour · by ProductType | 660 |
| ItemMonetizationRevenue | OneHour | 222 |
| L7AverageDailyActiveUsers | OneDay | 28 |
| L7AverageDailyRevenue | OneDay | 28 |
| L7AverageForwardD1Retention | OneDay | 27 |
| L7AverageForwardD1Retention | OneDay · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 89 |
| L7AveragePlayTimeMinutesPerDAU | OneDay | 28 |
| L7AverageUniqueUsersWithPlaySessions | OneDay · by AcquisitionSource · where IsNewUser=New | 118 |
| MemoryUsageAvg | OneDay · where Place=74542317333958 | 21 |
| MemoryUsageAvg | OneDay · by MemoryUsageCategory · where Place=74542317333958 | 105 |
| MemoryUsageAvg | None · by ServerAgeBucket · where Place=74542317333958 | 9 |
| MonthlyActiveUsers | OneDay | 28 |
| OomUnexpectedExits | OneDay · where Place=74542317333958 | 7 |
| OomUnexpectedExits | OneDay · where Place=74542317333958 | 7 |
| OomUnexpectedExits | OneDay · where Place=74542317333958 | 5 |
| OomUnexpectedExits | OneDay · by Platform · where Place=74542317333958 | 16 |
| OomUnexpectedExits | OneDay · by Platform · where Place=74542317333958 | 21 |
| OomUnexpectedExits | OneDay · by Platform · where Place=74542317333958 | 17 |
| PayingUsers | OneDay | 28 |
| PayingUsersCVR | OneDay | 28 |
| PayingUsersCVR | OneDay · by Platform | 136 |
| PeakConcurrentPlayers | OneDay · by Platform · where Place=74542317333958 | 128 |
| PeakConcurrentPlayers | OneDay · where Place=74542317333958 | 22 |
| PeakConcurrentPlayers | HalfHour · where Place=74542317333958 | 31 |
| PlayerFeedbackVotesCount | OneDay | 22 |
| PotentialExtraEarningsTotalUsd | None | 1 |
| RFYL7PlayDays | OneDay | 17 |
| RFYQualifiedPTR | OneDay | 17 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | OneDay | 17 |
| ServerCrashCount | OneDay · where Place=74542317333958 | 4 |
| ServerCrashCount | OneDay · where Place=74542317333958 | 3 |
| ServerCrashCount | OneDay · by CrashType · where Place=74542317333958 | 4 |
| ServerCrashCount | OneDay · by CrashType · where Place=74542317333958 | 3 |
| ServerFrameRateP10 | OneDay · where Place=74542317333958 | 21 |
| SessionDurationSecondsAvg | OneDay · where Place=74542317333958 | 22 |
| SessionDurationSecondsAvg | OneDay · by Platform · where Place=74542317333958 | 128 |
| TotalPlayTimeHours | OneDay | 28 |
| TotalSessionsEndedInBucket | None · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | OneDay | 27 |
| UniqueUsersWithImpressions | OneDay · by AcquisitionSource | 128 |
| UniqueUsersWithImpressions | OneDay · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 25 |
| UniqueUsersWithPlaySessions | OneDay | 28 |
| UniqueUsersWithPlaySessions | OneDay · where IsNewUser=New | 25 |
| Visits | OneDay | 28 |
| Visits | OneDay · by Platform | 136 |
