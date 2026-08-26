# Grab report — universe 10638354731

- Window: **2026-08-05 → 2026-08-27**
- Plan source: seed · opencloud
- Discovered dimension values: **__places**: 120014184236770
- Requested 120 · **95 returned data** · 20 empty · 5 failed (0 on observed/proven shapes)

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
| ClientCrashRate15m | OneDay · by Platform · where Place=120014184236770 |
| ClientCrashCount | OneDay · by Platform · where Place=120014184236770 |
| OomUnexpectedExits | OneDay · by Platform · where Place=120014184236770 |
| ServerCrashCount | OneDay · by CrashType · where Place=120014184236770 |
| ServerCrashCount | OneDay · by CrashType · where Place=120014184236770 |
| ServerCrashCount | HalfHour · where Place=120014184236770 |
| ServerCrashCount | HalfHour · by CrashType · where Place=120014184236770 |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| Attribution7DPayerConversionRatio | OneDay | 15 |
| Attribution7DPlaytimePerUserInMinutes | OneDay | 15 |
| Attribution7DRobuxPerUser | OneDay | 15 |
| AttributionD1RetentionRatio | OneDay | 18 |
| AttributionD7RetentionRatio | OneDay | 14 |
| AveragePlayTimeMinutesPerDAU | OneDay | 18 |
| AverageRevenuePerPayingUser | OneDay | 14 |
| AverageRevenuePerUser | OneDay | 18 |
| AverageSessionLengthMinutes | OneDay | 18 |
| AverageSessionLengthMinutes | OneDay · where IsNewUser=New | 18 |
| AverageSessionLengthMinutes | OneDay · where IsNewUser=Returning | 17 |
| AverageSessionLengthMinutes | OneDay · by Platform | 66 |
| ClientCpuTimeAvg | OneDay · where Place=120014184236770 | 14 |
| ClientCpuTimeAvg | OneDay · by ClientCpuTimeCategory · where Place=120014184236770 | 70 |
| ClientCrashCount | OneDay · where Place=120014184236770 | 7 |
| ClientCrashCount | OneDay · where Place=120014184236770 | 6 |
| ClientCrashCount | OneDay · by Platform · where Place=120014184236770 | 21 |
| ClientCrashCount | OneDay · by Platform · where Place=120014184236770 | 18 |
| ClientCrashRate15m | OneDay · where Place=120014184236770 | 7 |
| ClientCrashRate15m | OneDay · where Place=120014184236770 | 6 |
| ClientCrashRate15m | OneDay · by Platform · where Place=120014184236770 | 26 |
| ClientCrashRate15m | OneDay · by Platform · where Place=120014184236770 | 30 |
| ClientFpsAvg | OneDay · where Place=120014184236770 | 15 |
| ClientFpsP10 | OneDay · where Place=120014184236770 | 15 |
| ClientFpsP10 | OneDay · by Platform · where Place=120014184236770 | 64 |
| ClientMemoryUsageAvg | OneDay · where Place=120014184236770 | 15 |
| ClientMemoryUsageAvg | OneDay · by Platform · where Place=120014184236770 | 64 |
| ClientMemoryUsagePercentageAvg | OneDay · where Place=120014184236770 | 15 |
| ClientMemoryUsagePercentageAvg | OneDay · by Platform · where Place=120014184236770 | 64 |
| CpuCoreUtilization | OneDay · where Place=120014184236770 | 14 |
| CpuTimeAvg | OneDay · where Place=120014184236770 | 14 |
| CpuTimeAvg | OneDay · by CpuTimeCategory · where Place=120014184236770 | 70 |
| DailyActiveUsers | OneDay | 18 |
| DailyActiveUsers | OneDay · where IsNewUser=New | 18 |
| DailyActiveUsers | OneDay · where IsNewUser=Returning | 17 |
| DailyActiveUsers | OneDay · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 60 |
| DailyActiveUsers | OneDay · by Platform | 66 |
| DailyCohortRetention | OneDay · by CohortDay | 36 |
| DailyRevenue | OneDay | 18 |
| DailyRevenue | OneDay · by RevenueSource | 59 |
| DailyRevenue | OneDay · by BalanceType | 29 |
| DauMauStickiness | OneDay | 18 |
| EndToEndCVR | OneDay | 18 |
| ErrorCount | OneDay | 19 |
| ErrorCount | OneDay · by LogSource | 37 |
| ErrorCount | OneDay · where Place=120014184236770 | 19 |
| ErrorCount | OneDay · by LogSource · where Place=120014184236770 | 37 |
| ErrorCount | HalfHour · where Place=120014184236770 | 29 |
| ErrorCount | HalfHour · by LogSource · where Place=120014184236770 | 58 |
| ForwardD1Retention | OneDay | 18 |
| ForwardD1Retention | OneDay · by Platform | 67 |
| ForwardD1Retention | OneDay · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 60 |
| ForwardD7Retention | OneDay | 14 |
| ForwardD7Retention | OneDay · by Platform | 59 |
| ItemMonetizationRevenue | OneHour · by ProductType | 647 |
| ItemMonetizationRevenue | OneHour | 212 |
| L7AverageDailyActiveUsers | OneDay | 18 |
| L7AverageDailyRevenue | OneDay | 18 |
| L7AverageForwardD1Retention | OneDay | 18 |
| L7AverageForwardD1Retention | OneDay · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 60 |
| L7AveragePlayTimeMinutesPerDAU | OneDay | 18 |
| L7AverageUniqueUsersWithPlaySessions | OneDay · by AcquisitionSource · where IsNewUser=New | 74 |
| MemoryUsageAvg | OneDay · where Place=120014184236770 | 14 |
| MemoryUsageAvg | OneDay · by MemoryUsageCategory · where Place=120014184236770 | 70 |
| MemoryUsageAvg | None · by ServerAgeBucket · where Place=120014184236770 | 9 |
| MonthlyActiveUsers | OneDay | 18 |
| OomUnexpectedExits | OneDay · where Place=120014184236770 | 7 |
| OomUnexpectedExits | OneDay · where Place=120014184236770 | 6 |
| OomUnexpectedExits | OneDay · by Platform · where Place=120014184236770 | 17 |
| OomUnexpectedExits | OneDay · by Platform · where Place=120014184236770 | 18 |
| PayingUsers | OneDay | 18 |
| PayingUsersCVR | OneDay | 18 |
| PayingUsersCVR | OneDay · by Platform | 66 |
| PeakConcurrentPlayers | OneDay · by Platform · where Place=120014184236770 | 64 |
| PeakConcurrentPlayers | OneDay · where Place=120014184236770 | 15 |
| PeakConcurrentPlayers | HalfHour · where Place=120014184236770 | 30 |
| PlayerFeedbackVotesCount | OneDay | 15 |
| PotentialExtraEarningsTotalUsd | None | 1 |
| RFYL7PlayDays | OneDay | 10 |
| RFYQualifiedPTR | OneDay | 10 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | OneDay | 10 |
| ServerCrashCount | OneDay · where Place=120014184236770 | 1 |
| ServerCrashCount | OneDay · by CrashType · where Place=120014184236770 | 1 |
| ServerFrameRateP10 | OneDay · where Place=120014184236770 | 14 |
| SessionDurationSecondsAvg | OneDay · where Place=120014184236770 | 15 |
| SessionDurationSecondsAvg | OneDay · by Platform · where Place=120014184236770 | 64 |
| TotalPlayTimeHours | OneDay | 18 |
| TotalSessionsEndedInBucket | None · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | OneDay | 18 |
| UniqueUsersWithImpressions | OneDay · by AcquisitionSource | 95 |
| UniqueUsersWithImpressions | OneDay · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 18 |
| UniqueUsersWithPlaySessions | OneDay | 18 |
| UniqueUsersWithPlaySessions | OneDay · where IsNewUser=New | 18 |
| Visits | OneDay | 18 |
| Visits | OneDay · by Platform | 66 |
