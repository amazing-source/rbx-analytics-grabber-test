# Grab report — universe 10638354731

- Window: **2026-08-01 → 2026-08-30**
- Plan source: seed · opencloud
- Discovered dimension values: **__places**: 120014184236770
- Requested 128 · **101 returned data** · 22 empty · 5 failed (0 on observed/proven shapes)

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
| ClientCrashRate15m | OneDay · where Place=120014184236770 |
| ClientCrashCount | OneDay · where Place=120014184236770 |
| OomUnexpectedExits | OneDay · where Place=120014184236770 |
| ServerCrashCount | OneDay · where Place=120014184236770 |
| ServerCrashCount | OneDay · where Place=120014184236770 |
| ServerCrashCount | OneDay · where Place=120014184236770 |
| ClientCrashRate15m | OneDay · by Platform · where Place=120014184236770 |
| ClientCrashCount | OneDay · by Platform · where Place=120014184236770 |
| OomUnexpectedExits | OneDay · by Platform · where Place=120014184236770 |
| ServerCrashCount | OneDay · by CrashType · where Place=120014184236770 |
| ServerCrashCount | OneDay · by CrashType · where Place=120014184236770 |
| ServerCrashCount | OneDay · by CrashType · where Place=120014184236770 |
| ServerCrashCount | HalfHour · where Place=120014184236770 |
| ServerCrashCount | HalfHour · by CrashType · where Place=120014184236770 |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| Attribution7DPayerConversionRatio | OneDay | 20 |
| Attribution7DPlaytimePerUserInMinutes | OneDay | 20 |
| Attribution7DRobuxPerUser | OneDay | 20 |
| AttributionD1RetentionRatio | OneDay | 20 |
| AttributionD7RetentionRatio | OneDay | 20 |
| AveragePlayTimeMinutesPerDAU | OneDay | 20 |
| AverageRevenuePerPayingUser | OneDay | 16 |
| AverageRevenuePerUser | OneDay | 20 |
| AverageSessionLengthMinutes | OneDay | 20 |
| AverageSessionLengthMinutes | OneDay · where IsNewUser=New | 20 |
| AverageSessionLengthMinutes | OneDay · where IsNewUser=Returning | 19 |
| AverageSessionLengthMinutes | OneDay · by Platform | 76 |
| ClientCpuTimeAvg | OneDay · where Place=120014184236770 | 16 |
| ClientCpuTimeAvg | OneDay · by ClientCpuTimeCategory · where Place=120014184236770 | 80 |
| ClientCrashCount | OneDay · where Place=120014184236770 | 4 |
| ClientCrashCount | OneDay · where Place=120014184236770 | 7 |
| ClientCrashCount | OneDay · where Place=120014184236770 | 5 |
| ClientCrashCount | OneDay · by Platform · where Place=120014184236770 | 11 |
| ClientCrashCount | OneDay · by Platform · where Place=120014184236770 | 21 |
| ClientCrashCount | OneDay · by Platform · where Place=120014184236770 | 15 |
| ClientCrashRate15m | OneDay · where Place=120014184236770 | 4 |
| ClientCrashRate15m | OneDay · where Place=120014184236770 | 7 |
| ClientCrashRate15m | OneDay · where Place=120014184236770 | 5 |
| ClientCrashRate15m | OneDay · by Platform · where Place=120014184236770 | 12 |
| ClientCrashRate15m | OneDay · by Platform · where Place=120014184236770 | 33 |
| ClientCrashRate15m | OneDay · by Platform · where Place=120014184236770 | 25 |
| ClientFpsAvg | OneDay · where Place=120014184236770 | 17 |
| ClientFpsP10 | OneDay · where Place=120014184236770 | 17 |
| ClientFpsP10 | OneDay · by Platform · where Place=120014184236770 | 74 |
| ClientMemoryUsageAvg | OneDay · where Place=120014184236770 | 17 |
| ClientMemoryUsageAvg | OneDay · by Platform · where Place=120014184236770 | 74 |
| ClientMemoryUsagePercentageAvg | OneDay · where Place=120014184236770 | 17 |
| ClientMemoryUsagePercentageAvg | OneDay · by Platform · where Place=120014184236770 | 74 |
| CpuCoreUtilization | OneDay · where Place=120014184236770 | 17 |
| CpuTimeAvg | OneDay · where Place=120014184236770 | 17 |
| CpuTimeAvg | OneDay · by CpuTimeCategory · where Place=120014184236770 | 85 |
| DailyActiveUsers | OneDay | 20 |
| DailyActiveUsers | OneDay · where IsNewUser=New | 20 |
| DailyActiveUsers | OneDay · where IsNewUser=Returning | 19 |
| DailyActiveUsers | OneDay · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 68 |
| DailyActiveUsers | OneDay · by Platform | 76 |
| DailyCohortRetention | OneDay · by CohortDay | 28 |
| DailyRevenue | OneDay | 20 |
| DailyRevenue | OneDay · by RevenueSource | 69 |
| DailyRevenue | OneDay · by BalanceType | 33 |
| DauMauStickiness | OneDay | 20 |
| EndToEndCVR | OneDay | 20 |
| ErrorCount | OneDay | 21 |
| ErrorCount | OneDay · by LogSource | 41 |
| ErrorCount | OneDay · where Place=120014184236770 | 21 |
| ErrorCount | OneDay · by LogSource · where Place=120014184236770 | 41 |
| ErrorCount | HalfHour · where Place=120014184236770 | 23 |
| ErrorCount | HalfHour · by LogSource · where Place=120014184236770 | 46 |
| ForwardD1Retention | OneDay | 20 |
| ForwardD1Retention | OneDay · by Platform | 77 |
| ForwardD1Retention | OneDay · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 68 |
| ForwardD7Retention | OneDay | 20 |
| ForwardD7Retention | OneDay · by Platform | 76 |
| ItemMonetizationRevenue | OneHour · by ProductType | 694 |
| ItemMonetizationRevenue | OneHour | 212 |
| L7AverageDailyActiveUsers | OneDay | 20 |
| L7AverageDailyRevenue | OneDay | 20 |
| L7AverageForwardD1Retention | OneDay | 20 |
| L7AverageForwardD1Retention | OneDay · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 68 |
| L7AveragePlayTimeMinutesPerDAU | OneDay | 20 |
| L7AverageUniqueUsersWithPlaySessions | OneDay · by AcquisitionSource · where IsNewUser=New | 84 |
| MemoryUsageAvg | OneDay · where Place=120014184236770 | 16 |
| MemoryUsageAvg | OneDay · by MemoryUsageCategory · where Place=120014184236770 | 80 |
| MemoryUsageAvg | None · by ServerAgeBucket · where Place=120014184236770 | 9 |
| MonthlyActiveUsers | OneDay | 20 |
| OomUnexpectedExits | OneDay · where Place=120014184236770 | 3 |
| OomUnexpectedExits | OneDay · where Place=120014184236770 | 7 |
| OomUnexpectedExits | OneDay · where Place=120014184236770 | 5 |
| OomUnexpectedExits | OneDay · by Platform · where Place=120014184236770 | 6 |
| OomUnexpectedExits | OneDay · by Platform · where Place=120014184236770 | 19 |
| OomUnexpectedExits | OneDay · by Platform · where Place=120014184236770 | 15 |
| PayingUsers | OneDay | 20 |
| PayingUsersCVR | OneDay | 20 |
| PayingUsersCVR | OneDay · by Platform | 76 |
| PeakConcurrentPlayers | OneDay · by Platform · where Place=120014184236770 | 74 |
| PeakConcurrentPlayers | OneDay · where Place=120014184236770 | 17 |
| PeakConcurrentPlayers | HalfHour · where Place=120014184236770 | 24 |
| PlayerFeedbackVotesCount | OneDay | 17 |
| PotentialExtraEarningsTotalUsd | None | 1 |
| RFYL7PlayDays | OneDay | 13 |
| RFYQualifiedPTR | OneDay | 13 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | OneDay | 13 |
| ServerCrashCount | OneDay · where Place=120014184236770 | 1 |
| ServerCrashCount | OneDay · by CrashType · where Place=120014184236770 | 1 |
| ServerFrameRateP10 | OneDay · where Place=120014184236770 | 16 |
| SessionDurationSecondsAvg | OneDay · where Place=120014184236770 | 17 |
| SessionDurationSecondsAvg | OneDay · by Platform · where Place=120014184236770 | 74 |
| TotalPlayTimeHours | OneDay | 20 |
| TotalSessionsEndedInBucket | None · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | OneDay | 20 |
| UniqueUsersWithImpressions | OneDay · by AcquisitionSource | 107 |
| UniqueUsersWithImpressions | OneDay · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 20 |
| UniqueUsersWithPlaySessions | OneDay | 20 |
| UniqueUsersWithPlaySessions | OneDay · where IsNewUser=New | 20 |
| Visits | OneDay | 20 |
| Visits | OneDay · by Platform | 76 |
