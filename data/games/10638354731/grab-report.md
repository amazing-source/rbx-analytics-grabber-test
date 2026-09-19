# Grab report — universe 10638354731

- Window: **2026-09-16 → 2026-09-20**
- Plan source: seed
- Discovered dimension values: **__places**: 120014184236770 · **FunnelName**: FUNNEL_TYPE_ONBOARDING, Progression, MapReach 2 · **PlaceVersion**: 915, 918, 919 · **FunnelStep**: 1, 2, 3, 4, 5, 6 · **Place**: 120014184236770 · **FirstSeenPlaceVersion**: 488, 582, 791, 825, 345, 878, 901, 888, 639, 892, 880, 594, 908, 739, 778, 915, 696, 591, 776, 622, 636, 918, 666, 769, 914, 884, 890, 611, 310, 919
- Requested 229 · **172 returned data** · 33 empty · 34 failed — of which 0 aged out (data Roblox no longer stores) and **4 on observed/proven shapes (look here first)**

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
| AttributionD1RetentionRatio | metric | ONE_DAY | 400 | yes | — |
| Attribution7DPayerConversionRatio | metric | ONE_DAY | 400 | yes | — |
| Attribution7DPlaytimePerUserInMinutes | metric | ONE_DAY | 400 | yes | — |
| Attribution7DRobuxPerUser | metric | ONE_DAY | 400 | yes | — |
| Attribution30DRobuxPerUser | metric | ONE_DAY | 400 | yes | — |
| ForwardD1Retention | metric | ONE_DAY · by PlaceVersion | 400 | yes | — |
| WeeklyCohortRetention | metric | ONE_DAY · by CohortDay | 400 | yes | — |
| L7AverageForwardD1Retention | metric | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 400 | yes | — |
| L7AverageForwardD1Retention | metric | ONE_DAY | 400 | yes | — |
| DailyActiveUsers | metric | ONE_DAY · by PlaceVersion | 400 | yes | — |
| AverageSessionLengthMinutes | metric | ONE_DAY · by PlaceVersion | 400 | yes | — |
| L7AveragePlayTimeMinutesPerDAU | metric | ONE_DAY | 400 | yes | — |
| L7AverageDailyActiveUsers | metric | ONE_DAY | 400 | yes | — |
| L7AverageUniqueUsersWithPlaySessions | metric | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 400 | yes | — |
| DailyRevenue | metric | ONE_DAY · by PlaceVersion | 400 | yes | — |
| L7AverageDailyRevenue | metric | ONE_DAY | 400 | yes | — |
| AttributionD7RetentionRatio | metric | ONE_DAY | 400 | yes | — |
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
| — | metadata | — | 404 | **no** | — |

## Returned 200 but no data points

**The query was valid and matched nothing.** That is NOT evidence the feature is unused — the most common cause is a filter value that doesn't exist on this universe (e.g. a hardcoded `FunnelName` that belongs to a different game). Verify against the dashboard before concluding anything from a row here.

| Metric | Shape |
|---|---|
| — | by CustomField2 |
| — | by CustomField3 |
| — | by CustomField1 |
| annotation:PLACE_ICON | — |
| — | — |
| — | — |
| annotation:PLACE_THUMBNAIL | — |
| — | — |
| annotation:FUNNEL | — |
| — | — |
| annotation:ENGINE_RELEASE | — |
| — | — |
| — | — |
| — | — |
| — | — |
| — | — |
| annotation:CREATOR_REGEX_CHANGE | — |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| ForwardD7Retention | ONE_DAY |
| ForwardD7Retention | ONE_DAY · by Platform |
| ForwardD30Retention | ONE_DAY |
| ServerCrashCount | ONE_DAY · where Place=120014184236770 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=120014184236770 |
| ServerCrashCount | HALF_HOUR · where Place=120014184236770 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=120014184236770 |
| ForwardD7Retention | — |
| ForwardD30Retention | — |
| DauMauStickiness | — |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| — | — | 1 |
| — | by FunnelName | 3 |
| — | by PlaceVersion | 3 |
| — | by FunnelStep | 6 |
| — | by Place | 1 |
| — | by FirstSeenPlaceVersion | 30 |
| — | — | 5 |
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
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 2 |
| AverageSessionLengthMinutes | ONE_DAY · by Platform | 9 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 2 |
| AverageSessionLengthMinutes | ONE_DAY | 2 |
| AverageSessionLengthMinutes | — | 4 |
| ClientCpuTimeAvg | ONE_DAY · where Place=120014184236770 | 4 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=120014184236770 | 20 |
| ClientCrashCount | ONE_DAY · where Place=120014184236770 | 5 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=120014184236770 | 15 |
| ClientCrashRate15m | ONE_DAY · where Place=120014184236770 | 5 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=120014184236770 | 22 |
| ClientFpsAvg | ONE_DAY · where Place=120014184236770 | 5 |
| ClientFpsP10 | ONE_DAY · where Place=120014184236770 | 5 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=120014184236770 | 23 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=120014184236770 | 5 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=120014184236770 | 23 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=120014184236770 | 5 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=120014184236770 | 23 |
| CpuCoreUtilization | ONE_DAY · where Place=120014184236770 | 3 |
| CpuTimeAvg | ONE_DAY · where Place=120014184236770 | 3 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=120014184236770 | 15 |
| DailyActiveUsers | ONE_DAY · by Locale | 97 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 14 |
| DailyActiveUsers | ONE_DAY · by Country | 319 |
| DailyActiveUsers | ONE_DAY · by Gender | 6 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 2 |
| DailyActiveUsers | ONE_DAY | 2 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 2 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 11 |
| DailyActiveUsers | ONE_DAY · by Platform | 9 |
| DailyActiveUsers | — | 2 |
| DailyCohortRetention | ONE_DAY · by CohortDay | 1 |
| DailyRevenue | ONE_DAY | 2 |
| DailyRevenue | ONE_DAY · by RevenueSource | 8 |
| DailyRevenue | ONE_DAY · by BalanceType | 4 |
| DailyRevenue | — | 2 |
| DauMauStickiness | ONE_DAY | 2 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 4 |
| EndToEndCVR | ONE_DAY | 2 |
| ErrorCount | ONE_DAY | 4 |
| ErrorCount | ONE_DAY · by LogSource | 8 |
| ErrorCount | ONE_DAY · where Place=120014184236770 | 4 |
| ErrorCount | ONE_DAY · by LogSource · where Place=120014184236770 | 8 |
| ErrorCount | NONE · where Place=120014184236770,FirstSeenPlaceVersion=919 | 1 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=120014184236770 | 500 |
| ErrorCount | HALF_HOUR · where Place=120014184236770 | 19 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=120014184236770 | 38 |
| EventAvgDailyActiveUsers | ONE_DAY | 2 |
| EventAvgDailyRevenue | ONE_DAY | 2 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 2 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 2 |
| ForwardD1Retention | ONE_DAY | 1 |
| ForwardD1Retention | ONE_DAY · by Platform | 5 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| ForwardD1Retention | — | 2 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 24 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Progression | 24 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=MapReach 2 | 20 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 24 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Progression | 24 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=MapReach 2 | 20 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 6 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=Progression | 6 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=MapReach 2 | 5 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 6 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=Progression | 6 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=MapReach 2 | 5 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=Progression | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=MapReach 2 | 1 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 6 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=Progression | 6 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=MapReach 2 | 5 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 6 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=Progression | 6 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=MapReach 2 | 5 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=Progression | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=MapReach 2 | 1 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING,FunnelStep=1/2/3/4/5/6 | 6 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=Progression,FunnelStep=1/2/3/4/5/6 | 6 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=MapReach 2,FunnelStep=1/2/3/4/5/6 | 5 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 6 |
| FunnelUserTotalCount | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserTotalCount | NONE · where FunnelName=Progression | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=Progression | 6 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=MapReach 2 | 5 |
| FunnelUserTotalCount | NONE · where FunnelName=MapReach 2 | 1 |
| ItemMonetizationRevenue | ONE_HOUR | 81 |
| ItemMonetizationRevenue | ONE_HOUR · by ProductType | 234 |
| L7AveragePlayTimeMinutesPerDAU | — | 4 |
| MemoryUsageAvg | ONE_DAY · where Place=120014184236770 | 4 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=120014184236770 | 20 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=120014184236770 | 9 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 14 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 6 |
| MonthlyActiveUsers | ONE_DAY · by Locale | 97 |
| MonthlyActiveUsers | ONE_DAY · by Country | 319 |
| MonthlyActiveUsers | ONE_DAY | 2 |
| MonthlyActiveUsers | — | 2 |
| OomUnexpectedExits | ONE_DAY · where Place=120014184236770 | 5 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=120014184236770 | 12 |
| PayingUsers | ONE_DAY | 2 |
| PayingUsers | — | 2 |
| PayingUsersCVR | ONE_DAY · by Platform | 9 |
| PayingUsersCVR | ONE_DAY | 2 |
| PayingUsersCVR | — | 4 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=120014184236770 | 23 |
| PeakConcurrentPlayers | ONE_DAY · where Place=120014184236770 | 5 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=120014184236770 | 20 |
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
| ServerFrameRateP10 | ONE_DAY · where Place=120014184236770 | 5 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=120014184236770 | 5 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=120014184236770 | 23 |
| TotalPlayTimeHours | ONE_DAY | 2 |
| TotalPlayTimeHours | — | 2 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY | 2 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 12 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 2 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 10 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 5 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 9 |
| UniqueUsersWithPlaySessions | ONE_DAY | 2 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 2 |
| UsersJoinedFromNotifications | ONE_DAY | 2 |
| Visits | ONE_DAY | 2 |
| Visits | ONE_DAY · by Platform | 9 |
| Visits | — | 2 |
