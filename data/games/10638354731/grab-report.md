# Grab report — universe 10638354731

- Window: **2026-08-15 → 2026-09-12**
- Plan source: seed
- Discovered dimension values: **__places**: 120014184236770 · **FunnelName**: FUNNEL_TYPE_ONBOARDING, Progression, MapReach 2, MapReach · **FunnelStep**: 1, 2, 3, 4, 5, 6 · **PlaceVersion**: 769, 776, 778, 783, 786, 791, 825, 878, 880, 884, 888, 890, 892, 900, 901, 908, 914, 915 · **Place**: 120014184236770 · **FirstSeenPlaceVersion**: 488, 582, 825, 791, 345, 878, 901, 914, 888, 639, 892, 880, 908, 778, 594, 739, 776, 591, 622, 696, 769, 884, 636, 890, 666, 915, 611, 310, 686
- Requested 268 · **211 returned data** · 34 empty · 33 failed — of which 0 aged out (data Roblox no longer stores) and **4 on observed/proven shapes (look here first)**

## Failed — observed/proven shapes (real problems)

The dashboard itself sends these shapes (or they have returned data before). A failure here means capture is broken or the API changed — it is never evidence about the game.

| Metric | Kind | Shape | HTTP | Provenance | Error |
|---|---|---|---|---|---|
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
| FunnelUserChurnRate | metric | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 400 | yes | — |
| FunnelUserStepCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 400 | yes | — |
| FunnelUserOverallCompletionRate | metric | ONE_DAY · where FunnelName=FUNNEL_TYPE_ONBOARDING | 400 | yes | — |
| FunnelUserTotalCount | metric | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 400 | yes | — |
| FunnelUserChurnRate | metric | ONE_DAY · by FunnelStep · where FunnelName=Progression | 400 | yes | — |
| FunnelUserStepCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=Progression | 400 | yes | — |
| FunnelUserOverallCompletionRate | metric | ONE_DAY · where FunnelName=Progression | 400 | yes | — |
| FunnelUserTotalCount | metric | ONE_DAY · by FunnelStep · where FunnelName=Progression | 400 | yes | — |
| FunnelUserChurnRate | metric | ONE_DAY · by FunnelStep · where FunnelName=MapReach 2 | 400 | yes | — |
| FunnelUserStepCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=MapReach 2 | 400 | yes | — |
| FunnelUserOverallCompletionRate | metric | ONE_DAY · where FunnelName=MapReach 2 | 400 | yes | — |
| FunnelUserTotalCount | metric | ONE_DAY · by FunnelStep · where FunnelName=MapReach 2 | 400 | yes | — |
| FunnelUserChurnRate | metric | ONE_DAY · by FunnelStep · where FunnelName=MapReach | 400 | yes | — |
| FunnelUserStepCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=MapReach | 400 | yes | — |
| FunnelUserOverallCompletionRate | metric | ONE_DAY · where FunnelName=MapReach | 400 | yes | — |
| FunnelUserTotalCount | metric | ONE_DAY · by FunnelStep · where FunnelName=MapReach | 400 | yes | — |
| — | metadata | — | 404 | **no** | — |

## Returned 200 but no data points

**The query was valid and matched nothing.** That is NOT evidence the feature is unused — the most common cause is a filter value that doesn't exist on this universe (e.g. a hardcoded `FunnelName` that belongs to a different game). Verify against the dashboard before concluding anything from a row here.

| Metric | Shape |
|---|---|
| — | by CustomField1 |
| — | by CustomField2 |
| — | by CustomField3 |
| annotation:PLACE_ICON | — |
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
| RFYD8To28PlayDays | ONE_DAY |
| RFYD8To28CoplayDays | ONE_DAY |
| RFYD8To28QualifiedPlaySessions | ONE_DAY |
| RFYD8To28Playtime | ONE_DAY |
| RFYD8To28RobuxSpend | ONE_DAY |
| RFYD8To28SpendDays | ONE_DAY |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| ForwardD30Retention | ONE_DAY |
| ServerCrashCount | ONE_DAY · where Place=120014184236770 |
| ServerCrashCount | ONE_DAY · where Place=120014184236770 |
| ServerCrashCount | ONE_DAY · where Place=120014184236770 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=120014184236770 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=120014184236770 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=120014184236770 |
| ServerCrashCount | HALF_HOUR · where Place=120014184236770 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=120014184236770 |
| ForwardD30Retention | — |
| DauMauStickiness | — |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| — | — | 1 |
| — | by FunnelName | 4 |
| — | by FunnelStep | 6 |
| — | by PlaceVersion | 18 |
| — | by Place | 1 |
| — | by FirstSeenPlaceVersion | 29 |
| — | — | 374 |
| — | — | 1 |
| — | — | 100 |
| annotation:ENGINE_RELEASE | — | 21 |
| annotation:EXPERIENCE_EVENT_STATE | — | 5 |
| annotation:PLACE_THUMBNAIL | — | 12 |
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
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 27 |
| AverageSessionLengthMinutes | ONE_DAY | 27 |
| AverageSessionLengthMinutes | ONE_DAY · by Platform | 130 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 27 |
| AverageSessionLengthMinutes | — | 52 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=120014184236770 | 140 |
| ClientCpuTimeAvg | ONE_DAY · where Place=120014184236770 | 28 |
| ClientCrashCount | ONE_DAY · where Place=120014184236770 | 8 |
| ClientCrashCount | ONE_DAY · where Place=120014184236770 | 8 |
| ClientCrashCount | ONE_DAY · where Place=120014184236770 | 8 |
| ClientCrashCount | ONE_DAY · where Place=120014184236770 | 5 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=120014184236770 | 24 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=120014184236770 | 25 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=120014184236770 | 25 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=120014184236770 | 15 |
| ClientCrashRate15m | ONE_DAY · where Place=120014184236770 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=120014184236770 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=120014184236770 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=120014184236770 | 5 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=120014184236770 | 35 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=120014184236770 | 40 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=120014184236770 | 25 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=120014184236770 | 40 |
| ClientFpsAvg | ONE_DAY · where Place=120014184236770 | 29 |
| ClientFpsP10 | ONE_DAY · where Place=120014184236770 | 29 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=120014184236770 | 140 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=120014184236770 | 29 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=120014184236770 | 140 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=120014184236770 | 29 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=120014184236770 | 140 |
| CpuCoreUtilization | ONE_DAY · where Place=120014184236770 | 27 |
| CpuTimeAvg | ONE_DAY · where Place=120014184236770 | 27 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=120014184236770 | 135 |
| DailyActiveUsers | ONE_DAY · by Country | 5032 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 189 |
| DailyActiveUsers | ONE_DAY · by Gender | 81 |
| DailyActiveUsers | ONE_DAY · by Locale | 1324 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 27 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 27 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 135 |
| DailyActiveUsers | ONE_DAY | 27 |
| DailyActiveUsers | ONE_DAY · by Platform | 130 |
| DailyActiveUsers | — | 26 |
| DailyRevenue | ONE_DAY · by RevenueSource | 118 |
| DailyRevenue | ONE_DAY | 26 |
| DailyRevenue | ONE_DAY · by BalanceType | 51 |
| DailyRevenue | — | 26 |
| DauMauStickiness | ONE_DAY | 27 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 4 |
| EndToEndCVR | ONE_DAY | 27 |
| ErrorCount | ONE_DAY | 3 |
| ErrorCount | ONE_DAY · by LogSource | 6 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=120014184236770 | 500 |
| ErrorCount | ONE_DAY · where Place=120014184236770 | 3 |
| ErrorCount | ONE_DAY · by LogSource · where Place=120014184236770 | 6 |
| ErrorCount | NONE · where Place=120014184236770,FirstSeenPlaceVersion=915 | 1 |
| ErrorCount | HALF_HOUR · where Place=120014184236770 | 33 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=120014184236770 | 66 |
| EventAvgDailyActiveUsers | ONE_DAY | 13 |
| EventAvgDailyRevenue | ONE_DAY | 13 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 13 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 13 |
| ForwardD1Retention | ONE_DAY | 26 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 132 |
| ForwardD1Retention | ONE_DAY · by Platform | 127 |
| ForwardD1Retention | — | 50 |
| ForwardD7Retention | ONE_DAY | 20 |
| ForwardD7Retention | ONE_DAY · by Platform | 100 |
| ForwardD7Retention | — | 38 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 168 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Progression | 168 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=MapReach 2 | 135 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=MapReach | 12 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 168 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Progression | 168 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=MapReach 2 | 135 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=MapReach | 12 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 6 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=Progression | 6 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=MapReach 2 | 5 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=MapReach | 4 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 6 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=Progression | 6 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=MapReach 2 | 5 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=MapReach | 4 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=Progression | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=MapReach 2 | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=MapReach | 1 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 6 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=Progression | 6 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=MapReach 2 | 5 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=MapReach | 4 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 6 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=Progression | 6 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=MapReach 2 | 5 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=MapReach | 4 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=Progression | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=MapReach 2 | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=MapReach | 1 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING,FunnelStep=1/2/3/4/5/6 | 6 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=Progression,FunnelStep=1/2/3/4/5/6 | 6 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=MapReach 2,FunnelStep=1/2/3/4/5/6 | 5 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=MapReach,FunnelStep=1/2/3/4/5/6 | 4 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 6 |
| FunnelUserTotalCount | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserTotalCount | NONE · where FunnelName=Progression | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=Progression | 6 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=MapReach 2 | 5 |
| FunnelUserTotalCount | NONE · where FunnelName=MapReach 2 | 1 |
| FunnelUserTotalCount | NONE · where FunnelName=MapReach | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=MapReach | 4 |
| ItemMonetizationRevenue | ONE_HOUR · by ProductType | 716 |
| ItemMonetizationRevenue | ONE_HOUR | 227 |
| L7AveragePlayTimeMinutesPerDAU | — | 52 |
| MemoryUsageAvg | ONE_DAY · where Place=120014184236770 | 28 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=120014184236770 | 140 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=120014184236770 | 9 |
| MonthlyActiveUsers | ONE_DAY · by Locale | 1324 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 189 |
| MonthlyActiveUsers | ONE_DAY · by Country | 5032 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 81 |
| MonthlyActiveUsers | ONE_DAY | 27 |
| MonthlyActiveUsers | — | 26 |
| OomUnexpectedExits | ONE_DAY · where Place=120014184236770 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=120014184236770 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=120014184236770 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=120014184236770 | 5 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=120014184236770 | 20 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=120014184236770 | 24 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=120014184236770 | 24 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=120014184236770 | 15 |
| PayingUsers | ONE_DAY | 26 |
| PayingUsers | — | 26 |
| PayingUsersCVR | ONE_DAY | 26 |
| PayingUsersCVR | ONE_DAY · by Platform | 126 |
| PayingUsersCVR | — | 52 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=120014184236770 | 140 |
| PeakConcurrentPlayers | ONE_DAY · where Place=120014184236770 | 29 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=120014184236770 | 34 |
| PlayerFeedbackVotesCount | ONE_DAY | 27 |
| PotentialExtraEarningsTotalUsd | NONE | 1 |
| RFYD1CoplayDays | ONE_DAY | 20 |
| RFYD1Playtime | ONE_DAY | 26 |
| RFYD1QualifiedPlaySessions | ONE_DAY | 26 |
| RFYD1RobuxSpend | ONE_DAY | 26 |
| RFYD1SpendDay | ONE_DAY | 26 |
| RFYD2To7CoplayDays | ONE_DAY | 20 |
| RFYD2To7PlayDays | ONE_DAY | 20 |
| RFYD2To7Playtime | ONE_DAY | 20 |
| RFYD2To7QualifiedPlaySessions | ONE_DAY | 20 |
| RFYD2To7RobuxSpend | ONE_DAY | 20 |
| RFYD2To7SpendDays | ONE_DAY | 20 |
| RFYDuration0To60 | ONE_DAY | 26 |
| RFYDuration61To180 | ONE_DAY | 26 |
| RFYL7PlayDays | ONE_DAY | 26 |
| RFYL7PlayDays | — | 52 |
| RFYPlayThroughRate | ONE_DAY | 26 |
| RFYQualifiedPTR | ONE_DAY | 26 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | ONE_DAY | 26 |
| RSVPCount | ONE_DAY | 13 |
| ServerCrashCount | ONE_DAY · where Place=120014184236770 | 1 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=120014184236770 | 1 |
| ServerFrameRateP10 | ONE_DAY · where Place=120014184236770 | 29 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=120014184236770 | 29 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=120014184236770 | 140 |
| TotalPlayTimeHours | ONE_DAY | 27 |
| TotalPlayTimeHours | — | 26 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 27 |
| UniqueUsersWithImpressions | ONE_DAY | 27 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 158 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 131 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 115 |
| UniqueUsersWithPlaySessions | ONE_DAY | 27 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 27 |
| UsersJoinedFromNotifications | ONE_DAY | 13 |
| Visits | ONE_DAY · by Platform | 130 |
| Visits | ONE_DAY | 27 |
| Visits | — | 26 |
