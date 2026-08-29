# Grab report — universe 10030829154

- Window: **2026-08-01 → 2026-08-30**
- Plan source: seed · opencloud
- Discovered dimension values: **__places**: 87388097381958, 94401613935841, 100407536317236, 109025676702094, 111157217779261, 139617346573330 · **FunnelStep**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 · **PlaceVersion**: 100, 101, 102, 104, 1679, 1681, 1683, 1685, 1691, 1696, 1698, 1705, 1706, 1708, 205, 206, 207, 208, 209, 210, 212, 213, 4, 433, 434, 435, 436, 437, 439, 440, 441, 5, 63, 64, 65, 66, 67, 68, 7, 70, 71, 8, 98, 99 · **Place**: 139617346573330, 109025676702094, 111157217779261, 100407536317236, 87388097381958, 94401613935841 · **FirstSeenPlaceVersion**: 1304, 125, 348, 34, 62, 339, 1294, 4, 1681, 1421, 1679, 1300, 1669, 433, 1360, 1677, 63, 205, 41, 372, 434, 98, 157, 1685, 1698, 50, 147, 1590, 382, 206, 428, 1344, 1691, 1596, 1618, 436, 364, 64, 66, 412, 439, 1683, 202, 437, 208, 169, 100, 97, 65, 188, 84, 139, 210, 99, 5, 67, 435, 68, 209, 414, 207, 1607, 102, 1705, 1594, 101, 402, 1708, 1706, 70, 186, 104, 71, 441, 440, 213, 175, 401, 212, 394, 176, 7, 8, 80, 1696
- Requested 129 · **118 returned data** · 6 empty · 5 failed (0 on observed/proven shapes)

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
| ServerCrashCount | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 |
| ServerCrashCount | OneDay · by CrashType · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 |
| ServerCrashCount | HalfHour · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 |
| ServerCrashCount | HalfHour · by CrashType · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| Attribution7DPayerConversionRatio | OneDay | 21 |
| Attribution7DPlaytimePerUserInMinutes | OneDay | 21 |
| Attribution7DRobuxPerUser | OneDay | 21 |
| AttributionD1RetentionRatio | OneDay | 26 |
| AttributionD7RetentionRatio | OneDay | 20 |
| AveragePlayTimeMinutesPerDAU | OneDay | 27 |
| AverageRevenuePerPayingUser | OneDay | 27 |
| AverageRevenuePerUser | OneDay | 27 |
| AverageSessionLengthMinutes | OneDay | 27 |
| AverageSessionLengthMinutes | OneDay · where IsNewUser=New | 27 |
| AverageSessionLengthMinutes | OneDay · where IsNewUser=Returning | 27 |
| AverageSessionLengthMinutes | OneDay · by Platform | 162 |
| ClientCpuTimeAvg | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 28 |
| ClientCpuTimeAvg | OneDay · by ClientCpuTimeCategory · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 140 |
| ClientCrashCount | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 7 |
| ClientCrashCount | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 7 |
| ClientCrashCount | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 7 |
| ClientCrashCount | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 5 |
| ClientCrashCount | OneDay · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 36 |
| ClientCrashCount | OneDay · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 35 |
| ClientCrashCount | OneDay · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 41 |
| ClientCrashCount | OneDay · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 26 |
| ClientCrashRate15m | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 7 |
| ClientCrashRate15m | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 7 |
| ClientCrashRate15m | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 7 |
| ClientCrashRate15m | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 5 |
| ClientCrashRate15m | OneDay · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 42 |
| ClientCrashRate15m | OneDay · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 42 |
| ClientCrashRate15m | OneDay · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 42 |
| ClientCrashRate15m | OneDay · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 30 |
| ClientFpsAvg | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 28 |
| ClientFpsP10 | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 28 |
| ClientFpsP10 | OneDay · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 168 |
| ClientMemoryUsageAvg | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 28 |
| ClientMemoryUsageAvg | OneDay · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 168 |
| ClientMemoryUsagePercentageAvg | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 28 |
| ClientMemoryUsagePercentageAvg | OneDay · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 168 |
| CpuCoreUtilization | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 28 |
| CpuTimeAvg | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 28 |
| CpuTimeAvg | OneDay · by CpuTimeCategory · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 140 |
| DailyActiveUsers | OneDay | 27 |
| DailyActiveUsers | OneDay · where IsNewUser=New | 27 |
| DailyActiveUsers | OneDay · where IsNewUser=Returning | 27 |
| DailyActiveUsers | OneDay · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 135 |
| DailyActiveUsers | OneDay · by Platform | 162 |
| DailyCohortRetention | OneDay · by CohortDay | 28 |
| DailyRevenue | OneDay | 27 |
| DailyRevenue | OneDay · by RevenueSource | 120 |
| DailyRevenue | OneDay · by BalanceType | 54 |
| DauMauStickiness | OneDay | 27 |
| EndToEndCVR | OneDay | 27 |
| ErrorCount | OneDay | 28 |
| ErrorCount | OneDay · by LogSource | 56 |
| ErrorCount | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 28 |
| ErrorCount | OneDay · by LogSource · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 56 |
| ErrorCount | None · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330,FirstSeenPlaceVersion=1708 | 1 |
| ErrorCount | HalfHour · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 23 |
| ErrorCount | HalfHour · by LogSource · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 46 |
| EventAvgDailyActiveUsers | OneDay | 27 |
| EventAvgDailyRevenue | OneDay | 27 |
| EventAvgDailyUserPlaytimeMinutes | OneDay | 27 |
| EventAvgRevenuePerDailyActiveUser | OneDay | 27 |
| ForwardD1Retention | OneDay | 26 |
| ForwardD1Retention | OneDay · by Platform | 156 |
| ForwardD1Retention | OneDay · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 130 |
| ForwardD7Retention | OneDay | 20 |
| ForwardD7Retention | OneDay · by Platform | 120 |
| ItemMonetizationRevenue | OneHour · by ProductType | 884 |
| ItemMonetizationRevenue | OneHour | 223 |
| L7AverageDailyActiveUsers | OneDay | 27 |
| L7AverageDailyRevenue | OneDay | 27 |
| L7AverageForwardD1Retention | OneDay | 26 |
| L7AverageForwardD1Retention | OneDay · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 130 |
| L7AveragePlayTimeMinutesPerDAU | OneDay | 27 |
| L7AverageUniqueUsersWithPlaySessions | OneDay · by AcquisitionSource · where IsNewUser=New | 151 |
| MemoryUsageAvg | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 28 |
| MemoryUsageAvg | OneDay · by MemoryUsageCategory · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 140 |
| MemoryUsageAvg | None · by ServerAgeBucket · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 9 |
| MonthlyActiveUsers | OneDay | 27 |
| OomUnexpectedExits | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 7 |
| OomUnexpectedExits | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 7 |
| OomUnexpectedExits | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 7 |
| OomUnexpectedExits | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 5 |
| OomUnexpectedExits | OneDay · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 24 |
| OomUnexpectedExits | OneDay · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 21 |
| OomUnexpectedExits | OneDay · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 28 |
| OomUnexpectedExits | OneDay · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 17 |
| PayingUsers | OneDay | 27 |
| PayingUsersCVR | OneDay | 27 |
| PayingUsersCVR | OneDay · by Platform | 165 |
| PeakConcurrentPlayers | OneDay · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 168 |
| PeakConcurrentPlayers | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 28 |
| PeakConcurrentPlayers | HalfHour · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 24 |
| PlayerFeedbackVotesCount | OneDay | 27 |
| PotentialExtraEarningsTotalUsd | None | 1 |
| RFYL7PlayDays | OneDay | 27 |
| RFYQualifiedPTR | OneDay | 27 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | OneDay | 27 |
| RSVPCount | OneDay | 27 |
| ServerCrashCount | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 5 |
| ServerCrashCount | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 3 |
| ServerCrashCount | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 3 |
| ServerCrashCount | OneDay · by CrashType · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 5 |
| ServerCrashCount | OneDay · by CrashType · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 3 |
| ServerCrashCount | OneDay · by CrashType · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 3 |
| ServerFrameRateP10 | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 28 |
| SessionDurationSecondsAvg | OneDay · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 28 |
| SessionDurationSecondsAvg | OneDay · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/139617346573330 | 168 |
| TotalPlayTimeHours | OneDay | 27 |
| TotalSessionsEndedInBucket | None · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | OneDay | 27 |
| UniqueUsersWithImpressions | OneDay · by AcquisitionSource | 162 |
| UniqueUsersWithImpressions | OneDay · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 27 |
| UniqueUsersWithPlaySessions | OneDay | 27 |
| UniqueUsersWithPlaySessions | OneDay · where IsNewUser=New | 27 |
| UsersJoinedFromNotifications | OneDay | 27 |
| Visits | OneDay | 27 |
| Visits | OneDay · by Platform | 162 |
