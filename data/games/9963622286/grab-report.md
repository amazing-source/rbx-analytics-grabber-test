# Grab report — universe 9963622286

- Window: **2026-08-15 → 2026-09-12**
- Plan source: seed
- Discovered dimension values: **__places**: 99255447043899 · **FunnelName**: BaseUpgrades, PlayerProgression · **PlaceVersion**: 587, 592, 596, 598, 600, 605, 606, 607, 608, 610, 612 · **Place**: 99255447043899 · **FirstSeenPlaceVersion**: 404, 499, 552, 608, 596, 416, 587, 582, 606, 468, 607, 452, 464, 432, 553, 408, 576, 437, 600, 505, 577, 414, 422, 598, 579, 569, 411, 447, 592, 612, 605, 574, 454, 516, 509, 412, 421, 507, 436, 446, 466, 439, 413, 430, 419, 420, 522, 528, 476, 410, 443, 479, 492
- Requested 238 · **202 returned data** · 19 empty · 27 failed — of which 0 aged out (data Roblox no longer stores) and **6 on observed/proven shapes (look here first)**

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
| — | by PlaceVersion | 11 |
| — | by Place | 1 |
| — | by FirstSeenPlaceVersion | 53 |
| — | — | 42 |
| — | — | 1 |
| — | — | 100 |
| annotation:CREATOR_REGEX_CHANGE | — | 2 |
| annotation:ENGINE_RELEASE | — | 21 |
| annotation:EXPERIENCE_EVENT_STATE | — | 12 |
| annotation:PLACE_ICON | — | 49 |
| annotation:PLACE_THUMBNAIL | — | 5 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| Attribution7DPayerConversionRatio | ONE_DAY | 20 |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| Attribution7DPlaytimePerUserInMinutes | ONE_DAY | 20 |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| Attribution7DRobuxPerUser | ONE_DAY | 20 |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| AttributionD1RetentionRatio | ONE_DAY | 25 |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| AttributionD7RetentionRatio | ONE_DAY | 19 |
| AveragePlayTimeMinutesPerDAU | ONE_DAY | 27 |
| AveragePlayTimeMinutesPerDAU | — | 52 |
| AverageRevenuePerPayingUser | ONE_DAY | 26 |
| AverageRevenuePerPayingUser | — | 52 |
| AverageRevenuePerUser | ONE_DAY | 26 |
| AverageRevenuePerUser | — | 52 |
| AverageSessionLengthMinutes | ONE_DAY | 27 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 27 |
| AverageSessionLengthMinutes | ONE_DAY · by Platform | 162 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 27 |
| AverageSessionLengthMinutes | — | 52 |
| ClientCpuTimeAvg | ONE_DAY · where Place=99255447043899 | 28 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=99255447043899 | 140 |
| ClientCrashCount | ONE_DAY · where Place=99255447043899 | 8 |
| ClientCrashCount | ONE_DAY · where Place=99255447043899 | 8 |
| ClientCrashCount | ONE_DAY · where Place=99255447043899 | 8 |
| ClientCrashCount | ONE_DAY · where Place=99255447043899 | 5 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=99255447043899 | 48 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=99255447043899 | 42 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=99255447043899 | 40 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=99255447043899 | 25 |
| ClientCrashRate15m | ONE_DAY · where Place=99255447043899 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=99255447043899 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=99255447043899 | 5 |
| ClientCrashRate15m | ONE_DAY · where Place=99255447043899 | 8 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=99255447043899 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=99255447043899 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=99255447043899 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=99255447043899 | 30 |
| ClientFpsAvg | ONE_DAY · where Place=99255447043899 | 29 |
| ClientFpsP10 | ONE_DAY · where Place=99255447043899 | 29 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=99255447043899 | 174 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=99255447043899 | 29 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=99255447043899 | 174 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=99255447043899 | 29 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=99255447043899 | 174 |
| CpuCoreUtilization | ONE_DAY · where Place=99255447043899 | 27 |
| CpuTimeAvg | ONE_DAY · where Place=99255447043899 | 27 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=99255447043899 | 135 |
| DailyActiveUsers | ONE_DAY · by Locale | 1351 |
| DailyActiveUsers | ONE_DAY · by Country | 5442 |
| DailyActiveUsers | ONE_DAY · by Gender | 81 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 189 |
| DailyActiveUsers | ONE_DAY | 27 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 27 |
| DailyActiveUsers | ONE_DAY · by Platform | 162 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 27 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 189 |
| DailyActiveUsers | — | 26 |
| DailyRevenue | ONE_DAY | 26 |
| DailyRevenue | ONE_DAY · by RevenueSource | 81 |
| DailyRevenue | ONE_DAY · by BalanceType | 52 |
| DailyRevenue | — | 26 |
| DauMauStickiness | ONE_DAY | 27 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 5 |
| EndToEndCVR | ONE_DAY | 27 |
| ErrorCount | ONE_DAY | 3 |
| ErrorCount | ONE_DAY · by LogSource | 6 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=99255447043899 | 500 |
| ErrorCount | ONE_DAY · by LogSource · where Place=99255447043899 | 6 |
| ErrorCount | ONE_DAY · where Place=99255447043899 | 3 |
| ErrorCount | NONE · where Place=99255447043899,FirstSeenPlaceVersion=612 | 1 |
| ErrorCount | HALF_HOUR · where Place=99255447043899 | 33 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=99255447043899 | 66 |
| EventAvgDailyActiveUsers | ONE_DAY | 26 |
| EventAvgDailyRevenue | ONE_DAY | 26 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 26 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 26 |
| ForwardD1Retention | ONE_DAY | 26 |
| ForwardD1Retention | ONE_DAY · by Platform | 156 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 182 |
| ForwardD1Retention | — | 50 |
| ForwardD7Retention | ONE_DAY | 20 |
| ForwardD7Retention | ONE_DAY · by Platform | 120 |
| ForwardD7Retention | — | 38 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=BaseUpgrades | 560 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=PlayerProgression | 196 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=BaseUpgrades | 560 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=PlayerProgression | 196 |
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
| ItemMonetizationRevenue | ONE_HOUR | 227 |
| ItemMonetizationRevenue | ONE_HOUR · by ProductType | 790 |
| L7AveragePlayTimeMinutesPerDAU | — | 52 |
| MemoryUsageAvg | ONE_DAY · where Place=99255447043899 | 28 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=99255447043899 | 140 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=99255447043899 | 9 |
| MonthlyActiveUsers | ONE_DAY · by Locale | 1351 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 189 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 81 |
| MonthlyActiveUsers | ONE_DAY · by Country | 5442 |
| MonthlyActiveUsers | ONE_DAY | 27 |
| MonthlyActiveUsers | — | 26 |
| OomUnexpectedExits | ONE_DAY · where Place=99255447043899 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=99255447043899 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=99255447043899 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=99255447043899 | 5 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=99255447043899 | 34 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=99255447043899 | 32 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=99255447043899 | 20 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=99255447043899 | 32 |
| PayingUsers | ONE_DAY | 26 |
| PayingUsers | — | 26 |
| PayingUsersCVR | ONE_DAY | 26 |
| PayingUsersCVR | ONE_DAY · by Platform | 156 |
| PayingUsersCVR | — | 52 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=99255447043899 | 174 |
| PeakConcurrentPlayers | ONE_DAY · where Place=99255447043899 | 29 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=99255447043899 | 34 |
| PlayerFeedbackVotesCount | ONE_DAY | 27 |
| PotentialExtraEarningsTotalUsd | NONE | 1 |
| RFYD1CoplayDays | ONE_DAY | 27 |
| RFYD1Playtime | ONE_DAY | 27 |
| RFYD1QualifiedPlaySessions | ONE_DAY | 27 |
| RFYD1RobuxSpend | ONE_DAY | 27 |
| RFYD1SpendDay | ONE_DAY | 27 |
| RFYD2To7CoplayDays | ONE_DAY | 27 |
| RFYD2To7PlayDays | ONE_DAY | 27 |
| RFYD2To7Playtime | ONE_DAY | 27 |
| RFYD2To7QualifiedPlaySessions | ONE_DAY | 27 |
| RFYD2To7RobuxSpend | ONE_DAY | 27 |
| RFYD2To7SpendDays | ONE_DAY | 27 |
| RFYD8To28CoplayDays | ONE_DAY | 27 |
| RFYD8To28PlayDays | ONE_DAY | 27 |
| RFYD8To28Playtime | ONE_DAY | 27 |
| RFYD8To28QualifiedPlaySessions | ONE_DAY | 27 |
| RFYD8To28RobuxSpend | ONE_DAY | 27 |
| RFYD8To28SpendDays | ONE_DAY | 27 |
| RFYDuration0To60 | ONE_DAY | 27 |
| RFYDuration61To180 | ONE_DAY | 27 |
| RFYL7PlayDays | ONE_DAY | 27 |
| RFYL7PlayDays | — | 52 |
| RFYPlayThroughRate | ONE_DAY | 27 |
| RFYQualifiedPTR | ONE_DAY | 27 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | ONE_DAY | 27 |
| RSVPCount | ONE_DAY | 26 |
| ServerCrashCount | ONE_DAY · where Place=99255447043899 | 5 |
| ServerCrashCount | ONE_DAY · where Place=99255447043899 | 1 |
| ServerCrashCount | ONE_DAY · where Place=99255447043899 | 5 |
| ServerCrashCount | ONE_DAY · where Place=99255447043899 | 1 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=99255447043899 | 8 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=99255447043899 | 1 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=99255447043899 | 6 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=99255447043899 | 1 |
| ServerFrameRateP10 | ONE_DAY · where Place=99255447043899 | 29 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=99255447043899 | 29 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=99255447043899 | 174 |
| TotalPlayTimeHours | ONE_DAY | 27 |
| TotalPlayTimeHours | — | 26 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY | 27 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 164 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 27 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 135 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 144 |
| UniqueUsersWithPlaySessions | ONE_DAY | 27 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 27 |
| UsersJoinedFromNotifications | ONE_DAY | 26 |
| Visits | ONE_DAY | 27 |
| Visits | ONE_DAY · by Platform | 162 |
| Visits | — | 26 |
