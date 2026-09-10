# Grab report — universe 9963622286

- Window: **2026-08-27 → 2026-09-10**
- Plan source: seed
- Discovered dimension values: **__places**: 99255447043899 · **FunnelName**: BaseUpgrades, PlayerProgression · **PlaceVersion**: 600, 605, 606, 607, 608 · **Place**: 99255447043899 · **FirstSeenPlaceVersion**: 404, 499, 552, 596, 608, 416, 587, 582, 607, 432, 468, 606, 452, 464, 553, 408, 576, 411, 437, 505, 579, 414, 577, 569, 600, 422, 598, 592, 454, 574, 421, 516, 447, 605, 509, 446, 507, 412, 420, 439, 466, 413, 419, 436
- Requested 222 · **185 returned data** · 20 empty · 27 failed — of which 0 aged out (data Roblox no longer stores) and **6 on observed/proven shapes (look here first)**

## Failed — observed/proven shapes (real problems)

The dashboard itself sends these shapes (or they have returned data before). A failure here means capture is broken or the API changed — it is never evidence about the game.

| Metric | Kind | Shape | HTTP | Provenance | Error |
|---|---|---|---|---|---|
| — | dimensions | by FunnelStep | 403 | observed | — |
| — | dimensions | by CustomField1 | 403 | observed | — |
| — | dimensions | by MessageHash | 500 | observed | — |
| — | annotations | — | 400 | proven | — |
| L7AverageDailyActiveUsers | benchmark | — | 404 | proven | — |
| L7AverageDailyRevenue | benchmark | — | 404 | proven | — |

## Failed — inferred shapes (probably not valid here)

Query shapes we constructed without a captured example. A failure usually means the dimension isn't valid for this universe. **Never report these as findings about the game.**

| Metric | Kind | Shape | HTTP | optional | Error |
|---|---|---|---|---|---|
| ForwardD1Retention | metric | ONE_DAY · by PlaceVersion | 400 | yes | — |
| DailyCohortRetention | metric | ONE_DAY · by CohortDay | 400 | yes | — |
| WeeklyCohortRetention | metric | ONE_DAY · by CohortDay | 400 | yes | — |
| L7AverageForwardD1Retention | metric | ONE_DAY | 400 | yes | — |
| L7AverageForwardD1Retention | metric | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 400 | yes | — |
| DailyActiveUsers | metric | ONE_DAY · by PlaceVersion | 400 | yes | — |
| AverageSessionLengthMinutes | metric | ONE_DAY · by PlaceVersion | 400 | yes | — |
| L7AveragePlayTimeMinutesPerDAU | metric | ONE_DAY | 400 | yes | — |
| L7AverageDailyActiveUsers | metric | ONE_DAY | 400 | yes | — |
| L7AverageUniqueUsersWithPlaySessions | metric | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 400 | yes | — |
| DailyRevenue | metric | ONE_DAY · by PlaceVersion | 400 | yes | — |
| L7AverageDailyRevenue | metric | ONE_DAY | 400 | yes | — |
| FunnelUserChurnRate | metric | ONE_DAY · by FunnelStep · where FunnelName=BaseUpgrades | 400 | yes | — |
| FunnelUserStepCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=BaseUpgrades | 400 | yes | — |
| FunnelUserOverallCompletionRate | metric | ONE_DAY · where FunnelName=BaseUpgrades | 400 | yes | — |
| FunnelUserTotalCount | metric | ONE_DAY · by FunnelStep · where FunnelName=BaseUpgrades | 400 | yes | — |
| FunnelUserChurnRate | metric | ONE_DAY · by FunnelStep · where FunnelName=PlayerProgression | 400 | yes | — |
| FunnelUserStepCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=PlayerProgression | 400 | yes | — |
| FunnelUserOverallCompletionRate | metric | ONE_DAY · where FunnelName=PlayerProgression | 400 | yes | — |
| FunnelUserTotalCount | metric | ONE_DAY · by FunnelStep · where FunnelName=PlayerProgression | 400 | yes | — |
| — | metadata | — | 404 | **no** | — |

## Returned 200 but no data points

**The query was valid and matched nothing.** That is NOT evidence the feature is unused — the most common cause is a filter value that doesn't exist on this universe (e.g. a hardcoded `FunnelName` that belongs to a different game). Verify against the dashboard before concluding anything from a row here.

| Metric | Shape |
|---|---|
| — | by CustomField2 |
| — | by CustomField3 |
| — | — |
| — | — |
| — | — |
| annotation:FUNNEL | — |
| — | — |
| — | — |
| — | — |
| — | — |
| — | — |
| annotation:CREATOR_REGEX_CHANGE | — |
| Attribution30DRobuxPerUser | ONE_DAY |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| ForwardD30Retention | ONE_DAY |
| ServerCrashCount | HALF_HOUR · where Place=99255447043899 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=99255447043899 |
| ForwardD30Retention | — |
| DauMauStickiness | — |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| — | — | 1 |
| — | by FunnelName | 2 |
| — | by PlaceVersion | 5 |
| — | by Place | 1 |
| — | by FirstSeenPlaceVersion | 44 |
| — | — | 12 |
| — | — | 1 |
| — | — | 100 |
| annotation:ENGINE_RELEASE | — | 10 |
| annotation:EXPERIENCE_EVENT_STATE | — | 7 |
| annotation:PLACE_ICON | — | 24 |
| annotation:PLACE_THUMBNAIL | — | 2 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| Attribution7DPayerConversionRatio | ONE_DAY | 7 |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| Attribution7DPlaytimePerUserInMinutes | ONE_DAY | 7 |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| Attribution7DRobuxPerUser | ONE_DAY | 7 |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| AttributionD1RetentionRatio | ONE_DAY | 12 |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| AttributionD7RetentionRatio | ONE_DAY | 6 |
| AveragePlayTimeMinutesPerDAU | ONE_DAY | 13 |
| AveragePlayTimeMinutesPerDAU | — | 26 |
| AverageRevenuePerPayingUser | ONE_DAY | 13 |
| AverageRevenuePerPayingUser | — | 26 |
| AverageRevenuePerUser | ONE_DAY | 13 |
| AverageRevenuePerUser | — | 26 |
| AverageSessionLengthMinutes | ONE_DAY | 13 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 13 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 13 |
| AverageSessionLengthMinutes | ONE_DAY · by Platform | 78 |
| AverageSessionLengthMinutes | — | 26 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=99255447043899 | 75 |
| ClientCpuTimeAvg | ONE_DAY · where Place=99255447043899 | 15 |
| ClientCrashCount | ONE_DAY · where Place=99255447043899 | 8 |
| ClientCrashCount | ONE_DAY · where Place=99255447043899 | 7 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=99255447043899 | 42 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=99255447043899 | 35 |
| ClientCrashRate15m | ONE_DAY · where Place=99255447043899 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=99255447043899 | 7 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=99255447043899 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=99255447043899 | 42 |
| ClientFpsAvg | ONE_DAY · where Place=99255447043899 | 15 |
| ClientFpsP10 | ONE_DAY · where Place=99255447043899 | 15 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=99255447043899 | 90 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=99255447043899 | 15 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=99255447043899 | 90 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=99255447043899 | 15 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=99255447043899 | 90 |
| CpuCoreUtilization | ONE_DAY · where Place=99255447043899 | 14 |
| CpuTimeAvg | ONE_DAY · where Place=99255447043899 | 14 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=99255447043899 | 70 |
| DailyActiveUsers | ONE_DAY · by Locale | 651 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 91 |
| DailyActiveUsers | ONE_DAY · by Gender | 39 |
| DailyActiveUsers | ONE_DAY · by Country | 2538 |
| DailyActiveUsers | ONE_DAY | 13 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 13 |
| DailyActiveUsers | ONE_DAY · by Platform | 78 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 13 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 91 |
| DailyActiveUsers | — | 13 |
| DailyRevenue | ONE_DAY | 13 |
| DailyRevenue | ONE_DAY · by RevenueSource | 41 |
| DailyRevenue | ONE_DAY · by BalanceType | 26 |
| DailyRevenue | — | 13 |
| DauMauStickiness | ONE_DAY | 13 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 5 |
| EndToEndCVR | ONE_DAY | 14 |
| ErrorCount | ONE_DAY | 2 |
| ErrorCount | ONE_DAY · by LogSource | 4 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=99255447043899 | 500 |
| ErrorCount | ONE_DAY · where Place=99255447043899 | 2 |
| ErrorCount | ONE_DAY · by LogSource · where Place=99255447043899 | 4 |
| ErrorCount | NONE · where Place=99255447043899,FirstSeenPlaceVersion=608 | 1 |
| ErrorCount | HALF_HOUR · where Place=99255447043899 | 37 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=99255447043899 | 74 |
| EventAvgDailyActiveUsers | ONE_DAY | 13 |
| EventAvgDailyRevenue | ONE_DAY | 13 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 13 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 13 |
| ForwardD1Retention | ONE_DAY | 12 |
| ForwardD1Retention | ONE_DAY · by Platform | 72 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 84 |
| ForwardD1Retention | — | 24 |
| ForwardD7Retention | ONE_DAY | 6 |
| ForwardD7Retention | ONE_DAY · by Platform | 36 |
| ForwardD7Retention | — | 12 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=BaseUpgrades | 300 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=PlayerProgression | 105 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=BaseUpgrades | 300 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=PlayerProgression | 105 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=BaseUpgrades | 20 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=PlayerProgression | 7 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=BaseUpgrades | 20 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=PlayerProgression | 7 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=BaseUpgrades | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=PlayerProgression | 1 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=BaseUpgrades | 20 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=PlayerProgression | 7 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=BaseUpgrades | 20 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=PlayerProgression | 7 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=BaseUpgrades | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=PlayerProgression | 1 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=BaseUpgrades | 20 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=PlayerProgression | 7 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=BaseUpgrades | 20 |
| FunnelUserTotalCount | NONE · where FunnelName=BaseUpgrades | 1 |
| FunnelUserTotalCount | NONE · where FunnelName=PlayerProgression | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=PlayerProgression | 7 |
| ItemMonetizationRevenue | ONE_HOUR · by ProductType | 688 |
| ItemMonetizationRevenue | ONE_HOUR | 199 |
| L7AveragePlayTimeMinutesPerDAU | — | 26 |
| MemoryUsageAvg | ONE_DAY · where Place=99255447043899 | 15 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=99255447043899 | 75 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=99255447043899 | 9 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 91 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 39 |
| MonthlyActiveUsers | ONE_DAY · by Locale | 651 |
| MonthlyActiveUsers | ONE_DAY · by Country | 2538 |
| MonthlyActiveUsers | ONE_DAY | 13 |
| MonthlyActiveUsers | — | 13 |
| OomUnexpectedExits | ONE_DAY · where Place=99255447043899 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=99255447043899 | 7 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=99255447043899 | 32 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=99255447043899 | 27 |
| PayingUsers | ONE_DAY | 13 |
| PayingUsers | — | 13 |
| PayingUsersCVR | ONE_DAY | 13 |
| PayingUsersCVR | ONE_DAY · by Platform | 78 |
| PayingUsersCVR | — | 26 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=99255447043899 | 90 |
| PeakConcurrentPlayers | ONE_DAY · where Place=99255447043899 | 15 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=99255447043899 | 49 |
| PlayerFeedbackVotesCount | ONE_DAY | 14 |
| PotentialExtraEarningsTotalUsd | NONE | 1 |
| RFYD1CoplayDays | ONE_DAY | 14 |
| RFYD1Playtime | ONE_DAY | 14 |
| RFYD1QualifiedPlaySessions | ONE_DAY | 14 |
| RFYD1RobuxSpend | ONE_DAY | 14 |
| RFYD1SpendDay | ONE_DAY | 14 |
| RFYD2To7CoplayDays | ONE_DAY | 14 |
| RFYD2To7PlayDays | ONE_DAY | 14 |
| RFYD2To7Playtime | ONE_DAY | 14 |
| RFYD2To7QualifiedPlaySessions | ONE_DAY | 14 |
| RFYD2To7RobuxSpend | ONE_DAY | 14 |
| RFYD2To7SpendDays | ONE_DAY | 14 |
| RFYD8To28CoplayDays | ONE_DAY | 14 |
| RFYD8To28PlayDays | ONE_DAY | 14 |
| RFYD8To28Playtime | ONE_DAY | 14 |
| RFYD8To28QualifiedPlaySessions | ONE_DAY | 14 |
| RFYD8To28RobuxSpend | ONE_DAY | 14 |
| RFYD8To28SpendDays | ONE_DAY | 14 |
| RFYDuration0To60 | ONE_DAY | 14 |
| RFYDuration61To180 | ONE_DAY | 14 |
| RFYL7PlayDays | ONE_DAY | 14 |
| RFYL7PlayDays | — | 26 |
| RFYPlayThroughRate | ONE_DAY | 14 |
| RFYQualifiedPTR | ONE_DAY | 14 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | ONE_DAY | 14 |
| RSVPCount | ONE_DAY | 13 |
| ServerCrashCount | ONE_DAY · where Place=99255447043899 | 3 |
| ServerCrashCount | ONE_DAY · where Place=99255447043899 | 4 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=99255447043899 | 4 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=99255447043899 | 4 |
| ServerFrameRateP10 | ONE_DAY · where Place=99255447043899 | 15 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=99255447043899 | 15 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=99255447043899 | 90 |
| TotalPlayTimeHours | ONE_DAY | 13 |
| TotalPlayTimeHours | — | 13 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY | 14 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 85 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 14 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 70 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 72 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 14 |
| UniqueUsersWithPlaySessions | ONE_DAY | 14 |
| UsersJoinedFromNotifications | ONE_DAY | 13 |
| Visits | ONE_DAY | 13 |
| Visits | ONE_DAY · by Platform | 78 |
| Visits | — | 13 |
