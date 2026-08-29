# Grab report — universe 9963622286

- Window: **2026-07-31 → 2026-08-29**
- Plan source: seed · opencloud
- Discovered dimension values: **__places**: 99255447043899 · **FunnelName**: BaseUpgrades, PlayerProgression · **PlaceVersion**: 516, 518, 522, 523, 524, 528, 529, 530, 537, 544, 545, 546, 552, 553, 569, 574, 575, 576, 577, 579, 582, 586, 587, 592, 596, 598 · **Place**: 99255447043899 · **FirstSeenPlaceVersion**: 404, 553, 587, 509, 530, 505, 592, 499, 468, 552, 416, 528, 574, 428, 464, 596, 452, 432, 577, 430, 493, 576, 507, 582, 408, 476, 516, 437, 546, 422, 456, 514, 579, 414, 454, 421, 569, 420, 439, 447, 413, 482, 431, 466, 598, 575, 412, 446, 465, 411, 479, 522, 443, 419, 436, 492, 523 · **FunnelStep**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20
- Requested 159 · **148 returned data** · 6 empty · 5 failed (0 on observed/proven shapes)

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
| ServerCrashCount | OneDay · where Place=99255447043899 |
| ServerCrashCount | OneDay · by CrashType · where Place=99255447043899 |
| ServerCrashCount | HalfHour · where Place=99255447043899 |
| ServerCrashCount | HalfHour · by CrashType · where Place=99255447043899 |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| Attribution7DPayerConversionRatio | OneDay | 21 |
| Attribution7DPlaytimePerUserInMinutes | OneDay | 21 |
| Attribution7DRobuxPerUser | OneDay | 21 |
| AttributionD1RetentionRatio | OneDay | 26 |
| AttributionD7RetentionRatio | OneDay | 21 |
| AveragePlayTimeMinutesPerDAU | OneDay | 28 |
| AverageRevenuePerPayingUser | OneDay | 28 |
| AverageRevenuePerUser | OneDay | 28 |
| AverageSessionLengthMinutes | OneDay | 28 |
| AverageSessionLengthMinutes | OneDay · where IsNewUser=New | 28 |
| AverageSessionLengthMinutes | OneDay · where IsNewUser=Returning | 28 |
| AverageSessionLengthMinutes | OneDay · by Platform | 169 |
| ClientCpuTimeAvg | OneDay · where Place=99255447043899 | 28 |
| ClientCpuTimeAvg | OneDay · by ClientCpuTimeCategory · where Place=99255447043899 | 140 |
| ClientCrashCount | OneDay · where Place=99255447043899 | 7 |
| ClientCrashCount | OneDay · where Place=99255447043899 | 7 |
| ClientCrashCount | OneDay · where Place=99255447043899 | 7 |
| ClientCrashCount | OneDay · where Place=99255447043899 | 5 |
| ClientCrashCount | OneDay · by Platform · where Place=99255447043899 | 40 |
| ClientCrashCount | OneDay · by Platform · where Place=99255447043899 | 39 |
| ClientCrashCount | OneDay · by Platform · where Place=99255447043899 | 42 |
| ClientCrashCount | OneDay · by Platform · where Place=99255447043899 | 25 |
| ClientCrashRate15m | OneDay · where Place=99255447043899 | 7 |
| ClientCrashRate15m | OneDay · where Place=99255447043899 | 7 |
| ClientCrashRate15m | OneDay · where Place=99255447043899 | 7 |
| ClientCrashRate15m | OneDay · where Place=99255447043899 | 5 |
| ClientCrashRate15m | OneDay · by Platform · where Place=99255447043899 | 42 |
| ClientCrashRate15m | OneDay · by Platform · where Place=99255447043899 | 42 |
| ClientCrashRate15m | OneDay · by Platform · where Place=99255447043899 | 42 |
| ClientCrashRate15m | OneDay · by Platform · where Place=99255447043899 | 30 |
| ClientFpsAvg | OneDay · where Place=99255447043899 | 28 |
| ClientFpsP10 | OneDay · where Place=99255447043899 | 28 |
| ClientFpsP10 | OneDay · by Platform · where Place=99255447043899 | 168 |
| ClientMemoryUsageAvg | OneDay · where Place=99255447043899 | 28 |
| ClientMemoryUsageAvg | OneDay · by Platform · where Place=99255447043899 | 168 |
| ClientMemoryUsagePercentageAvg | OneDay · where Place=99255447043899 | 28 |
| ClientMemoryUsagePercentageAvg | OneDay · by Platform · where Place=99255447043899 | 168 |
| CpuCoreUtilization | OneDay · where Place=99255447043899 | 28 |
| CpuTimeAvg | OneDay · where Place=99255447043899 | 28 |
| CpuTimeAvg | OneDay · by CpuTimeCategory · where Place=99255447043899 | 140 |
| DailyActiveUsers | OneDay | 28 |
| DailyActiveUsers | OneDay · where IsNewUser=New | 28 |
| DailyActiveUsers | OneDay · where IsNewUser=Returning | 28 |
| DailyActiveUsers | OneDay · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 140 |
| DailyActiveUsers | OneDay · by Platform | 169 |
| DailyCohortRetention | OneDay · by CohortDay | 36 |
| DailyRevenue | OneDay | 28 |
| DailyRevenue | OneDay · by RevenueSource | 91 |
| DailyRevenue | OneDay · by BalanceType | 56 |
| DauMauStickiness | OneDay | 28 |
| EndToEndCVR | OneDay | 28 |
| ErrorCount | OneDay | 28 |
| ErrorCount | OneDay · by LogSource | 56 |
| ErrorCount | OneDay · where Place=99255447043899 | 28 |
| ErrorCount | OneDay · by LogSource · where Place=99255447043899 | 56 |
| ErrorCount | None · where Place=99255447043899,FirstSeenPlaceVersion=598 | 1 |
| ErrorCount | HalfHour · where Place=99255447043899 | 32 |
| ErrorCount | HalfHour · by LogSource · where Place=99255447043899 | 64 |
| EventAvgDailyActiveUsers | OneDay | 27 |
| EventAvgDailyRevenue | OneDay | 27 |
| EventAvgDailyUserPlaytimeMinutes | OneDay | 27 |
| EventAvgRevenuePerDailyActiveUser | OneDay | 27 |
| ForwardD1Retention | OneDay | 27 |
| ForwardD1Retention | OneDay · by Platform | 164 |
| ForwardD1Retention | OneDay · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 135 |
| ForwardD7Retention | OneDay | 21 |
| ForwardD7Retention | OneDay · by Platform | 127 |
| FunnelCohortCompletionRate | None · by FunnelStep · where FunnelName=BaseUpgrades | 20 |
| FunnelCohortCompletionRate | None · by FunnelStep · where FunnelName=PlayerProgression | 7 |
| FunnelCohortSessionCompletionRate | None · by FunnelStep · where FunnelName=BaseUpgrades | 20 |
| FunnelCohortSessionCompletionRate | None · by FunnelStep · where FunnelName=PlayerProgression | 7 |
| FunnelStepChurnRate | None · by FunnelStep · where FunnelName=BaseUpgrades | 20 |
| FunnelStepChurnRate | None · by FunnelStep · where FunnelName=PlayerProgression | 7 |
| FunnelStepCompletionRate | None · by FunnelStep · where FunnelName=BaseUpgrades | 20 |
| FunnelStepCompletionRate | None · by FunnelStep · where FunnelName=PlayerProgression | 7 |
| FunnelStepOverallCompletionRate | None · where FunnelName=BaseUpgrades | 1 |
| FunnelStepOverallCompletionRate | None · where FunnelName=PlayerProgression | 1 |
| FunnelStepTotalCount | None · by FunnelStep · where FunnelName=BaseUpgrades | 20 |
| FunnelStepTotalCount | None · by FunnelStep · where FunnelName=PlayerProgression | 7 |
| FunnelUserChurnRate | None · by FunnelStep · where FunnelName=BaseUpgrades | 20 |
| FunnelUserChurnRate | None · by FunnelStep · where FunnelName=BaseUpgrades | 20 |
| FunnelUserChurnRate | None · by FunnelStep · where FunnelName=PlayerProgression | 7 |
| FunnelUserChurnRate | None · by FunnelStep · where FunnelName=PlayerProgression | 7 |
| FunnelUserOverallCompletionRate | None · where FunnelName=BaseUpgrades | 1 |
| FunnelUserOverallCompletionRate | None · where FunnelName=BaseUpgrades | 1 |
| FunnelUserOverallCompletionRate | None · where FunnelName=PlayerProgression | 1 |
| FunnelUserOverallCompletionRate | None · where FunnelName=PlayerProgression | 1 |
| FunnelUserStepCompletionRate | None · by FunnelStep · where FunnelName=BaseUpgrades,FunnelStep=1/2/3/4/5/6/7/8/9/10/11/12/13/14/15/16/17/18/19/20 | 20 |
| FunnelUserStepCompletionRate | None · by FunnelStep · where FunnelName=BaseUpgrades | 20 |
| FunnelUserStepCompletionRate | None · by FunnelStep · where FunnelName=PlayerProgression,FunnelStep=1/2/3/4/5/6/7/8/9/10/11/12/13/14/15/16/17/18/19/20 | 7 |
| FunnelUserStepCompletionRate | None · by FunnelStep · where FunnelName=PlayerProgression | 7 |
| FunnelUserTotalCount | None · by FunnelStep · where FunnelName=BaseUpgrades | 20 |
| FunnelUserTotalCount | None · where FunnelName=BaseUpgrades | 1 |
| FunnelUserTotalCount | None · by FunnelStep · where FunnelName=BaseUpgrades | 20 |
| FunnelUserTotalCount | None · by FunnelStep · where FunnelName=PlayerProgression | 7 |
| FunnelUserTotalCount | None · where FunnelName=PlayerProgression | 1 |
| FunnelUserTotalCount | None · by FunnelStep · where FunnelName=PlayerProgression | 7 |
| ItemMonetizationRevenue | OneHour · by ProductType | 832 |
| ItemMonetizationRevenue | OneHour | 227 |
| L7AverageDailyActiveUsers | OneDay | 28 |
| L7AverageDailyRevenue | OneDay | 28 |
| L7AverageForwardD1Retention | OneDay | 27 |
| L7AverageForwardD1Retention | OneDay · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 135 |
| L7AveragePlayTimeMinutesPerDAU | OneDay | 28 |
| L7AverageUniqueUsersWithPlaySessions | OneDay · by AcquisitionSource · where IsNewUser=New | 166 |
| MemoryUsageAvg | OneDay · where Place=99255447043899 | 28 |
| MemoryUsageAvg | OneDay · by MemoryUsageCategory · where Place=99255447043899 | 140 |
| MemoryUsageAvg | None · by ServerAgeBucket · where Place=99255447043899 | 9 |
| MonthlyActiveUsers | OneDay | 28 |
| OomUnexpectedExits | OneDay · where Place=99255447043899 | 7 |
| OomUnexpectedExits | OneDay · where Place=99255447043899 | 7 |
| OomUnexpectedExits | OneDay · where Place=99255447043899 | 7 |
| OomUnexpectedExits | OneDay · where Place=99255447043899 | 5 |
| OomUnexpectedExits | OneDay · by Platform · where Place=99255447043899 | 28 |
| OomUnexpectedExits | OneDay · by Platform · where Place=99255447043899 | 30 |
| OomUnexpectedExits | OneDay · by Platform · where Place=99255447043899 | 30 |
| OomUnexpectedExits | OneDay · by Platform · where Place=99255447043899 | 20 |
| PayingUsers | OneDay | 28 |
| PayingUsersCVR | OneDay | 28 |
| PayingUsersCVR | OneDay · by Platform | 169 |
| PeakConcurrentPlayers | OneDay · by Platform · where Place=99255447043899 | 168 |
| PeakConcurrentPlayers | OneDay · where Place=99255447043899 | 28 |
| PeakConcurrentPlayers | HalfHour · where Place=99255447043899 | 33 |
| PlayerFeedbackVotesCount | OneDay | 28 |
| PotentialExtraEarningsTotalUsd | None | 1 |
| RFYL7PlayDays | OneDay | 27 |
| RFYQualifiedPTR | OneDay | 27 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | OneDay | 27 |
| RSVPCount | OneDay | 27 |
| ServerCrashCount | OneDay · where Place=99255447043899 | 6 |
| ServerCrashCount | OneDay · where Place=99255447043899 | 2 |
| ServerCrashCount | OneDay · where Place=99255447043899 | 4 |
| ServerCrashCount | OneDay · by CrashType · where Place=99255447043899 | 8 |
| ServerCrashCount | OneDay · by CrashType · where Place=99255447043899 | 4 |
| ServerCrashCount | OneDay · by CrashType · where Place=99255447043899 | 7 |
| ServerFrameRateP10 | OneDay · where Place=99255447043899 | 28 |
| SessionDurationSecondsAvg | OneDay · where Place=99255447043899 | 28 |
| SessionDurationSecondsAvg | OneDay · by Platform · where Place=99255447043899 | 168 |
| TotalPlayTimeHours | OneDay | 28 |
| TotalSessionsEndedInBucket | None · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | OneDay | 28 |
| UniqueUsersWithImpressions | OneDay · by AcquisitionSource | 168 |
| UniqueUsersWithImpressions | OneDay · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 28 |
| UniqueUsersWithPlaySessions | OneDay | 28 |
| UniqueUsersWithPlaySessions | OneDay · where IsNewUser=New | 28 |
| UsersJoinedFromNotifications | OneDay | 27 |
| Visits | OneDay | 28 |
| Visits | OneDay · by Platform | 169 |
