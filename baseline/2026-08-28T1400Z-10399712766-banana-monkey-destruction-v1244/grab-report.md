# Grab report — universe 10399712766

- Window: **2026-07-31 → 2026-08-29**
- Plan source: seed · opencloud
- Discovered dimension values: **__places**: 83256791430098 · **FunnelName**: FUNNEL_TYPE_ONBOARDING · **PlaceVersion**: 1218, 1222, 1223, 1226, 1227, 1228, 1240, 1241 · **Place**: 83256791430098 · **FirstSeenPlaceVersion**: 1197, 1228, 1207, 178, 1223, 1161, 672, 1218, 1215, 794, 1214, 938, 1217, 1216, 1192, 1240, 1241, 1158, 786 · **FunnelStep**: 1, 2, 3
- Requested 144 · **135 returned data** · 4 empty · 5 failed (0 on observed/proven shapes)

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
| ServerCrashCount | HalfHour · where Place=83256791430098 |
| ServerCrashCount | HalfHour · by CrashType · where Place=83256791430098 |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| Attribution7DPayerConversionRatio | OneDay | 22 |
| Attribution7DPlaytimePerUserInMinutes | OneDay | 22 |
| Attribution7DRobuxPerUser | OneDay | 22 |
| AttributionD1RetentionRatio | OneDay | 27 |
| AttributionD7RetentionRatio | OneDay | 21 |
| AveragePlayTimeMinutesPerDAU | OneDay | 28 |
| AverageRevenuePerPayingUser | OneDay | 28 |
| AverageRevenuePerUser | OneDay | 28 |
| AverageSessionLengthMinutes | OneDay | 28 |
| AverageSessionLengthMinutes | OneDay · where IsNewUser=New | 28 |
| AverageSessionLengthMinutes | OneDay · where IsNewUser=Returning | 28 |
| AverageSessionLengthMinutes | OneDay · by Platform | 170 |
| ClientCpuTimeAvg | OneDay · where Place=83256791430098 | 28 |
| ClientCpuTimeAvg | OneDay · by ClientCpuTimeCategory · where Place=83256791430098 | 140 |
| ClientCrashCount | OneDay · where Place=83256791430098 | 7 |
| ClientCrashCount | OneDay · where Place=83256791430098 | 7 |
| ClientCrashCount | OneDay · where Place=83256791430098 | 7 |
| ClientCrashCount | OneDay · where Place=83256791430098 | 5 |
| ClientCrashCount | OneDay · by Platform · where Place=83256791430098 | 35 |
| ClientCrashCount | OneDay · by Platform · where Place=83256791430098 | 35 |
| ClientCrashCount | OneDay · by Platform · where Place=83256791430098 | 35 |
| ClientCrashCount | OneDay · by Platform · where Place=83256791430098 | 25 |
| ClientCrashRate15m | OneDay · where Place=83256791430098 | 7 |
| ClientCrashRate15m | OneDay · where Place=83256791430098 | 7 |
| ClientCrashRate15m | OneDay · where Place=83256791430098 | 7 |
| ClientCrashRate15m | OneDay · where Place=83256791430098 | 5 |
| ClientCrashRate15m | OneDay · by Platform · where Place=83256791430098 | 42 |
| ClientCrashRate15m | OneDay · by Platform · where Place=83256791430098 | 42 |
| ClientCrashRate15m | OneDay · by Platform · where Place=83256791430098 | 42 |
| ClientCrashRate15m | OneDay · by Platform · where Place=83256791430098 | 30 |
| ClientFpsAvg | OneDay · where Place=83256791430098 | 28 |
| ClientFpsP10 | OneDay · where Place=83256791430098 | 28 |
| ClientFpsP10 | OneDay · by Platform · where Place=83256791430098 | 168 |
| ClientMemoryUsageAvg | OneDay · where Place=83256791430098 | 28 |
| ClientMemoryUsageAvg | OneDay · by Platform · where Place=83256791430098 | 168 |
| ClientMemoryUsagePercentageAvg | OneDay · where Place=83256791430098 | 28 |
| ClientMemoryUsagePercentageAvg | OneDay · by Platform · where Place=83256791430098 | 168 |
| CpuCoreUtilization | OneDay · where Place=83256791430098 | 28 |
| CpuTimeAvg | OneDay · where Place=83256791430098 | 28 |
| CpuTimeAvg | OneDay · by CpuTimeCategory · where Place=83256791430098 | 140 |
| DailyActiveUsers | OneDay | 28 |
| DailyActiveUsers | OneDay · where IsNewUser=New | 28 |
| DailyActiveUsers | OneDay · where IsNewUser=Returning | 28 |
| DailyActiveUsers | OneDay · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 140 |
| DailyActiveUsers | OneDay · by Platform | 170 |
| DailyCohortRetention | OneDay · by CohortDay | 36 |
| DailyRevenue | OneDay | 28 |
| DailyRevenue | OneDay · by RevenueSource | 120 |
| DailyRevenue | OneDay · by BalanceType | 56 |
| DauMauStickiness | OneDay | 28 |
| EndToEndCVR | OneDay | 28 |
| ErrorCount | OneDay | 28 |
| ErrorCount | OneDay · by LogSource | 56 |
| ErrorCount | OneDay · where Place=83256791430098 | 28 |
| ErrorCount | OneDay · by LogSource · where Place=83256791430098 | 56 |
| ErrorCount | None · where Place=83256791430098,FirstSeenPlaceVersion=1241 | 1 |
| ErrorCount | HalfHour · where Place=83256791430098 | 32 |
| ErrorCount | HalfHour · by LogSource · where Place=83256791430098 | 64 |
| EventAvgDailyActiveUsers | OneDay | 25 |
| EventAvgDailyRevenue | OneDay | 25 |
| EventAvgDailyUserPlaytimeMinutes | OneDay | 25 |
| EventAvgRevenuePerDailyActiveUser | OneDay | 25 |
| ForwardD1Retention | OneDay | 27 |
| ForwardD1Retention | OneDay · by Platform | 166 |
| ForwardD1Retention | OneDay · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 135 |
| ForwardD7Retention | OneDay | 21 |
| ForwardD7Retention | OneDay · by Platform | 129 |
| FunnelCohortCompletionRate | None · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelCohortSessionCompletionRate | None · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelStepChurnRate | None · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelStepCompletionRate | None · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelStepOverallCompletionRate | None · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelStepTotalCount | None · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelUserChurnRate | None · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelUserChurnRate | None · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelUserOverallCompletionRate | None · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserOverallCompletionRate | None · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserStepCompletionRate | None · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING,FunnelStep=1/2/3 | 3 |
| FunnelUserStepCompletionRate | None · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelUserTotalCount | None · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelUserTotalCount | None · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserTotalCount | None · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| ItemMonetizationRevenue | OneHour · by ProductType | 891 |
| ItemMonetizationRevenue | OneHour | 228 |
| L7AverageDailyActiveUsers | OneDay | 28 |
| L7AverageDailyRevenue | OneDay | 28 |
| L7AverageForwardD1Retention | OneDay | 27 |
| L7AverageForwardD1Retention | OneDay · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 135 |
| L7AveragePlayTimeMinutesPerDAU | OneDay | 28 |
| L7AverageUniqueUsersWithPlaySessions | OneDay · by AcquisitionSource · where IsNewUser=New | 170 |
| MemoryUsageAvg | OneDay · where Place=83256791430098 | 28 |
| MemoryUsageAvg | OneDay · by MemoryUsageCategory · where Place=83256791430098 | 140 |
| MemoryUsageAvg | None · by ServerAgeBucket · where Place=83256791430098 | 9 |
| MonthlyActiveUsers | OneDay | 28 |
| OomUnexpectedExits | OneDay · where Place=83256791430098 | 7 |
| OomUnexpectedExits | OneDay · where Place=83256791430098 | 7 |
| OomUnexpectedExits | OneDay · where Place=83256791430098 | 7 |
| OomUnexpectedExits | OneDay · where Place=83256791430098 | 5 |
| OomUnexpectedExits | OneDay · by Platform · where Place=83256791430098 | 25 |
| OomUnexpectedExits | OneDay · by Platform · where Place=83256791430098 | 23 |
| OomUnexpectedExits | OneDay · by Platform · where Place=83256791430098 | 25 |
| OomUnexpectedExits | OneDay · by Platform · where Place=83256791430098 | 15 |
| PayingUsers | OneDay | 28 |
| PayingUsersCVR | OneDay | 28 |
| PayingUsersCVR | OneDay · by Platform | 171 |
| PeakConcurrentPlayers | OneDay · by Platform · where Place=83256791430098 | 168 |
| PeakConcurrentPlayers | OneDay · where Place=83256791430098 | 28 |
| PeakConcurrentPlayers | HalfHour · where Place=83256791430098 | 33 |
| PlayerFeedbackVotesCount | OneDay | 28 |
| PotentialExtraEarningsTotalUsd | None | 1 |
| RFYL7PlayDays | OneDay | 27 |
| RFYQualifiedPTR | OneDay | 27 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | OneDay | 27 |
| RSVPCount | OneDay | 25 |
| ServerCrashCount | OneDay · where Place=83256791430098 | 7 |
| ServerCrashCount | OneDay · where Place=83256791430098 | 4 |
| ServerCrashCount | OneDay · where Place=83256791430098 | 3 |
| ServerCrashCount | OneDay · where Place=83256791430098 | 1 |
| ServerCrashCount | OneDay · by CrashType · where Place=83256791430098 | 7 |
| ServerCrashCount | OneDay · by CrashType · where Place=83256791430098 | 5 |
| ServerCrashCount | OneDay · by CrashType · where Place=83256791430098 | 3 |
| ServerCrashCount | OneDay · by CrashType · where Place=83256791430098 | 1 |
| ServerFrameRateP10 | OneDay · where Place=83256791430098 | 28 |
| SessionDurationSecondsAvg | OneDay · where Place=83256791430098 | 28 |
| SessionDurationSecondsAvg | OneDay · by Platform · where Place=83256791430098 | 168 |
| TotalPlayTimeHours | OneDay | 28 |
| TotalSessionsEndedInBucket | None · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | OneDay | 28 |
| UniqueUsersWithImpressions | OneDay · by AcquisitionSource | 168 |
| UniqueUsersWithImpressions | OneDay · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 28 |
| UniqueUsersWithPlaySessions | OneDay | 28 |
| UniqueUsersWithPlaySessions | OneDay · where IsNewUser=New | 28 |
| UsersJoinedFromNotifications | OneDay | 25 |
| Visits | OneDay | 28 |
| Visits | OneDay · by Platform | 170 |
