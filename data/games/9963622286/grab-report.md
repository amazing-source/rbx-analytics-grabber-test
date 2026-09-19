# Grab report — universe 9963622286

- Window: **2026-09-16 → 2026-09-20**
- Plan source: seed
- Discovered dimension values: **__places**: 99255447043899 · **FunnelName**: BaseUpgrades, PlayerProgression · **PlaceVersion**: 612, 614 · **Place**: 99255447043899 · **FirstSeenPlaceVersion**: 404, 499, 552, 596, 416, 612, 587, 582, 606, 614, 608, 452, 468, 553, 607, 464, 600, 408, 432, 437, 577, 579, 576, 505, 414, 605, 447, 598, 422, 574, 421, 569, 413, 516, 592, 454, 509, 412, 476, 439, 420, 411, 507, 466, 436, 446, 528, 430, 443, 479, 492, 546
- Requested 214 · **161 returned data** · 31 empty · 32 failed — of which 0 aged out (data Roblox no longer stores) and **6 on observed/proven shapes (look here first)**

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
| AttributionD1RetentionRatio | metric | ONE_DAY | 400 | yes | — |
| Attribution7DPayerConversionRatio | metric | ONE_DAY | 400 | yes | — |
| Attribution7DRobuxPerUser | metric | ONE_DAY | 400 | yes | — |
| Attribution7DPlaytimePerUserInMinutes | metric | ONE_DAY | 400 | yes | — |
| Attribution30DRobuxPerUser | metric | ONE_DAY | 400 | yes | — |
| ForwardD1Retention | metric | ONE_DAY · by PlaceVersion | 400 | yes | — |
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
| AttributionD7RetentionRatio | metric | ONE_DAY | 400 | yes | — |
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
| annotation:PLACE_ICON | — |
| — | — |
| — | — |
| — | — |
| annotation:PLACE_THUMBNAIL | — |
| annotation:FUNNEL | — |
| — | — |
| — | — |
| annotation:ENGINE_RELEASE | — |
| — | — |
| — | — |
| — | — |
| — | — |
| — | — |
| annotation:CREATOR_REGEX_CHANGE | — |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| ForwardD7Retention | ONE_DAY · by Platform |
| ForwardD7Retention | ONE_DAY |
| ForwardD30Retention | ONE_DAY |
| ServerCrashCount | HALF_HOUR · where Place=99255447043899 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=99255447043899 |
| ForwardD7Retention | — |
| ForwardD30Retention | — |
| DauMauStickiness | — |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| — | — | 1 |
| — | by FunnelName | 2 |
| — | by PlaceVersion | 2 |
| — | by Place | 1 |
| — | by FirstSeenPlaceVersion | 52 |
| — | — | 100 |
| annotation:EXPERIENCE_EVENT_STATE | — | 1 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| AveragePlayTimeMinutesPerDAU | ONE_DAY | 2 |
| AveragePlayTimeMinutesPerDAU | — | 4 |
| AverageRevenuePerPayingUser | ONE_DAY | 2 |
| AverageRevenuePerPayingUser | — | 4 |
| AverageRevenuePerUser | ONE_DAY | 2 |
| AverageRevenuePerUser | — | 4 |
| AverageSessionLengthMinutes | ONE_DAY | 2 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 2 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 2 |
| AverageSessionLengthMinutes | ONE_DAY · by Platform | 12 |
| AverageSessionLengthMinutes | — | 4 |
| ClientCpuTimeAvg | ONE_DAY · where Place=99255447043899 | 4 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=99255447043899 | 20 |
| ClientCrashCount | ONE_DAY · where Place=99255447043899 | 5 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=99255447043899 | 25 |
| ClientCrashRate15m | ONE_DAY · where Place=99255447043899 | 5 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=99255447043899 | 30 |
| ClientFpsAvg | ONE_DAY · where Place=99255447043899 | 5 |
| ClientFpsP10 | ONE_DAY · where Place=99255447043899 | 5 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=99255447043899 | 30 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=99255447043899 | 5 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=99255447043899 | 30 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=99255447043899 | 5 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=99255447043899 | 30 |
| CpuCoreUtilization | ONE_DAY · where Place=99255447043899 | 3 |
| CpuTimeAvg | ONE_DAY · where Place=99255447043899 | 3 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=99255447043899 | 15 |
| DailyActiveUsers | ONE_DAY · by Country | 390 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 14 |
| DailyActiveUsers | ONE_DAY · by Locale | 100 |
| DailyActiveUsers | ONE_DAY · by Gender | 6 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 2 |
| DailyActiveUsers | ONE_DAY | 2 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 2 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 14 |
| DailyActiveUsers | ONE_DAY · by Platform | 12 |
| DailyActiveUsers | — | 2 |
| DailyCohortRetention | ONE_DAY · by CohortDay | 1 |
| DailyRevenue | ONE_DAY | 2 |
| DailyRevenue | ONE_DAY · by RevenueSource | 6 |
| DailyRevenue | ONE_DAY · by BalanceType | 4 |
| DailyRevenue | — | 2 |
| DauMauStickiness | ONE_DAY | 2 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 5 |
| EndToEndCVR | ONE_DAY | 2 |
| ErrorCount | ONE_DAY | 4 |
| ErrorCount | ONE_DAY · by LogSource | 8 |
| ErrorCount | ONE_DAY · where Place=99255447043899 | 4 |
| ErrorCount | NONE · where Place=99255447043899,FirstSeenPlaceVersion=614 | 1 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=99255447043899 | 500 |
| ErrorCount | ONE_DAY · by LogSource · where Place=99255447043899 | 8 |
| ErrorCount | HALF_HOUR · where Place=99255447043899 | 19 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=99255447043899 | 38 |
| EventAvgDailyActiveUsers | ONE_DAY | 2 |
| EventAvgDailyRevenue | ONE_DAY | 2 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 2 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 2 |
| ForwardD1Retention | ONE_DAY | 1 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| ForwardD1Retention | ONE_DAY · by Platform | 6 |
| ForwardD1Retention | — | 2 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=BaseUpgrades | 80 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=PlayerProgression | 28 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=BaseUpgrades | 80 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=PlayerProgression | 28 |
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
| ItemMonetizationRevenue | ONE_HOUR · by ProductType | 281 |
| ItemMonetizationRevenue | ONE_HOUR | 81 |
| L7AveragePlayTimeMinutesPerDAU | — | 4 |
| MemoryUsageAvg | ONE_DAY · where Place=99255447043899 | 4 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=99255447043899 | 20 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=99255447043899 | 9 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 14 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 6 |
| MonthlyActiveUsers | ONE_DAY · by Country | 390 |
| MonthlyActiveUsers | ONE_DAY · by Locale | 100 |
| MonthlyActiveUsers | ONE_DAY | 2 |
| MonthlyActiveUsers | — | 2 |
| OomUnexpectedExits | ONE_DAY · where Place=99255447043899 | 5 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=99255447043899 | 20 |
| PayingUsers | ONE_DAY | 2 |
| PayingUsers | — | 2 |
| PayingUsersCVR | ONE_DAY | 2 |
| PayingUsersCVR | ONE_DAY · by Platform | 12 |
| PayingUsersCVR | — | 4 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=99255447043899 | 30 |
| PeakConcurrentPlayers | ONE_DAY · where Place=99255447043899 | 5 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=99255447043899 | 19 |
| PlayerFeedbackVotesCount | ONE_DAY | 3 |
| PotentialExtraEarningsTotalUsd | NONE | 1 |
| RFYD1CoplayDays | ONE_DAY | 2 |
| RFYD1Playtime | ONE_DAY | 2 |
| RFYD1QualifiedPlaySessions | ONE_DAY | 2 |
| RFYD1RobuxSpend | ONE_DAY | 2 |
| RFYD1SpendDay | ONE_DAY | 2 |
| RFYD2To7CoplayDays | ONE_DAY | 2 |
| RFYD2To7PlayDays | ONE_DAY | 2 |
| RFYD2To7Playtime | ONE_DAY | 2 |
| RFYD2To7QualifiedPlaySessions | ONE_DAY | 2 |
| RFYD2To7RobuxSpend | ONE_DAY | 2 |
| RFYD2To7SpendDays | ONE_DAY | 2 |
| RFYD8To28CoplayDays | ONE_DAY | 2 |
| RFYD8To28PlayDays | ONE_DAY | 2 |
| RFYD8To28Playtime | ONE_DAY | 2 |
| RFYD8To28QualifiedPlaySessions | ONE_DAY | 2 |
| RFYD8To28RobuxSpend | ONE_DAY | 2 |
| RFYD8To28SpendDays | ONE_DAY | 2 |
| RFYDuration0To60 | ONE_DAY | 2 |
| RFYDuration61To180 | ONE_DAY | 2 |
| RFYL7PlayDays | ONE_DAY | 2 |
| RFYL7PlayDays | — | 4 |
| RFYPlayThroughRate | ONE_DAY | 2 |
| RFYQualifiedPTR | ONE_DAY | 2 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | ONE_DAY | 2 |
| RSVPCount | ONE_DAY | 2 |
| ServerCrashCount | ONE_DAY · where Place=99255447043899 | 1 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=99255447043899 | 1 |
| ServerFrameRateP10 | ONE_DAY · where Place=99255447043899 | 5 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=99255447043899 | 5 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=99255447043899 | 30 |
| TotalPlayTimeHours | ONE_DAY | 2 |
| TotalPlayTimeHours | — | 2 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 14 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 2 |
| UniqueUsersWithImpressions | ONE_DAY | 2 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 12 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 14 |
| UniqueUsersWithPlaySessions | ONE_DAY | 2 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 2 |
| UsersJoinedFromNotifications | ONE_DAY | 2 |
| Visits | ONE_DAY | 2 |
| Visits | ONE_DAY · by Platform | 12 |
| Visits | — | 2 |
