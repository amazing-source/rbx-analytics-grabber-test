# Grab report — universe 10638354731

- Window: **2026-08-27 → 2026-09-10**
- Plan source: seed
- Discovered dimension values: **__places**: 120014184236770 · **FunnelName**: FUNNEL_TYPE_ONBOARDING, Progression, MapReach 2 · **PlaceVersion**: 901, 908, 914 · **Place**: 120014184236770 · **FirstSeenPlaceVersion**: 488, 582, 825, 791, 345, 878, 901, 639, 888, 880, 892, 908, 778, 914, 594, 776, 739, 696, 591, 622, 769, 890, 884, 666, 636, 611, 310, 686 · **FunnelStep**: 1, 2, 3, 4, 5, 6
- Requested 237 · **184 returned data** · 32 empty · 31 failed — of which 0 aged out (data Roblox no longer stores) and **5 on observed/proven shapes (look here first)**

## Failed — observed/proven shapes (real problems)

The dashboard itself sends these shapes (or they have returned data before). A failure here means capture is broken or the API changed — it is never evidence about the game.

| Metric | Kind | Shape | HTTP | Provenance | Error |
|---|---|---|---|---|---|
| — | dimensions | by MessageHash | 500 | observed | — |
| — | annotations | — | 400 | proven | — |
| DailyRevenue | benchmark | — | 500 | proven | — |
| L7AverageDailyActiveUsers | benchmark | — | 404 | proven | — |
| L7AverageDailyRevenue | benchmark | — | 404 | proven | — |

## Failed — inferred shapes (probably not valid here)

Query shapes we constructed without a captured example. A failure usually means the dimension isn't valid for this universe. **Never report these as findings about the game.**

| Metric | Kind | Shape | HTTP | optional | Error |
|---|---|---|---|---|---|
| — | placeVersions | — | 500 | yes | — |
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
| — | metadata | — | 404 | **no** | — |

## Returned 200 but no data points

**The query was valid and matched nothing.** That is NOT evidence the feature is unused — the most common cause is a filter value that doesn't exist on this universe (e.g. a hardcoded `FunnelName` that belongs to a different game). Verify against the dashboard before concluding anything from a row here.

| Metric | Shape |
|---|---|
| — | by CustomField1 |
| — | by CustomField3 |
| — | by CustomField2 |
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
| RFYD8To28SpendDays | ONE_DAY |
| RFYD8To28RobuxSpend | ONE_DAY |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| ForwardD30Retention | ONE_DAY |
| ServerCrashCount | ONE_DAY · where Place=120014184236770 |
| ServerCrashCount | ONE_DAY · where Place=120014184236770 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=120014184236770 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=120014184236770 |
| ServerCrashCount | HALF_HOUR · where Place=120014184236770 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=120014184236770 |
| DauMauStickiness | — |
| ForwardD30Retention | — |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| — | — | 1 |
| — | by FunnelName | 3 |
| — | by PlaceVersion | 3 |
| — | by Place | 1 |
| — | by FirstSeenPlaceVersion | 28 |
| — | by FunnelStep | 6 |
| — | — | 197 |
| — | — | 1 |
| annotation:ENGINE_RELEASE | — | 10 |
| annotation:EXPERIENCE_EVENT_STATE | — | 4 |
| annotation:PLACE_THUMBNAIL | — | 5 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| Attribution7DPayerConversionRatio | ONE_DAY | 7 |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 5 |
| Attribution7DPlaytimePerUserInMinutes | ONE_DAY | 7 |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 5 |
| Attribution7DRobuxPerUser | ONE_DAY | 7 |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 5 |
| AttributionD1RetentionRatio | ONE_DAY | 12 |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 5 |
| AttributionD7RetentionRatio | ONE_DAY | 6 |
| AveragePlayTimeMinutesPerDAU | ONE_DAY | 13 |
| AveragePlayTimeMinutesPerDAU | — | 26 |
| AverageRevenuePerPayingUser | ONE_DAY | 13 |
| AverageRevenuePerPayingUser | — | 26 |
| AverageRevenuePerUser | ONE_DAY | 13 |
| AverageRevenuePerUser | — | 26 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 13 |
| AverageSessionLengthMinutes | ONE_DAY | 13 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 13 |
| AverageSessionLengthMinutes | ONE_DAY · by Platform | 65 |
| AverageSessionLengthMinutes | — | 26 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=120014184236770 | 75 |
| ClientCpuTimeAvg | ONE_DAY · where Place=120014184236770 | 15 |
| ClientCrashCount | ONE_DAY · where Place=120014184236770 | 8 |
| ClientCrashCount | ONE_DAY · where Place=120014184236770 | 7 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=120014184236770 | 26 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=120014184236770 | 21 |
| ClientCrashRate15m | ONE_DAY · where Place=120014184236770 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=120014184236770 | 7 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=120014184236770 | 40 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=120014184236770 | 35 |
| ClientFpsAvg | ONE_DAY · where Place=120014184236770 | 15 |
| ClientFpsP10 | ONE_DAY · where Place=120014184236770 | 15 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=120014184236770 | 75 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=120014184236770 | 15 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=120014184236770 | 75 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=120014184236770 | 15 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=120014184236770 | 75 |
| CpuCoreUtilization | ONE_DAY · where Place=120014184236770 | 14 |
| CpuTimeAvg | ONE_DAY · where Place=120014184236770 | 14 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=120014184236770 | 70 |
| DailyActiveUsers | ONE_DAY · by Locale | 647 |
| DailyActiveUsers | ONE_DAY · by Country | 2564 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 91 |
| DailyActiveUsers | ONE_DAY · by Gender | 39 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 13 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 13 |
| DailyActiveUsers | ONE_DAY · by Platform | 65 |
| DailyActiveUsers | ONE_DAY | 13 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 66 |
| DailyActiveUsers | — | 13 |
| DailyRevenue | ONE_DAY | 13 |
| DailyRevenue | ONE_DAY · by RevenueSource | 62 |
| DailyRevenue | ONE_DAY · by BalanceType | 26 |
| DauMauStickiness | ONE_DAY | 13 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 4 |
| EndToEndCVR | ONE_DAY | 14 |
| ErrorCount | ONE_DAY | 2 |
| ErrorCount | ONE_DAY · by LogSource | 4 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=120014184236770 | 500 |
| ErrorCount | ONE_DAY · where Place=120014184236770 | 2 |
| ErrorCount | ONE_DAY · by LogSource · where Place=120014184236770 | 4 |
| ErrorCount | NONE · where Place=120014184236770,FirstSeenPlaceVersion=914 | 1 |
| ErrorCount | HALF_HOUR · where Place=120014184236770 | 37 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=120014184236770 | 74 |
| EventAvgDailyActiveUsers | ONE_DAY | 12 |
| EventAvgDailyRevenue | ONE_DAY | 12 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 12 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 12 |
| ForwardD1Retention | ONE_DAY | 12 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 62 |
| ForwardD1Retention | ONE_DAY · by Platform | 60 |
| ForwardD1Retention | — | 24 |
| ForwardD7Retention | ONE_DAY | 6 |
| ForwardD7Retention | ONE_DAY · by Platform | 30 |
| ForwardD7Retention | — | 12 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 90 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Progression | 90 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=MapReach 2 | 75 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 90 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Progression | 90 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=MapReach 2 | 75 |
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
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=Progression | 6 |
| FunnelUserTotalCount | NONE · where FunnelName=Progression | 1 |
| FunnelUserTotalCount | NONE · where FunnelName=MapReach 2 | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=MapReach 2 | 5 |
| ItemMonetizationRevenue | ONE_HOUR · by ProductType | 626 |
| ItemMonetizationRevenue | ONE_HOUR | 199 |
| L7AveragePlayTimeMinutesPerDAU | — | 26 |
| MemoryUsageAvg | ONE_DAY · where Place=120014184236770 | 15 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=120014184236770 | 75 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=120014184236770 | 9 |
| MonthlyActiveUsers | ONE_DAY · by Locale | 647 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 91 |
| MonthlyActiveUsers | ONE_DAY · by Country | 2564 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 39 |
| MonthlyActiveUsers | ONE_DAY | 13 |
| MonthlyActiveUsers | — | 13 |
| OomUnexpectedExits | ONE_DAY · where Place=120014184236770 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=120014184236770 | 7 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=120014184236770 | 24 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=120014184236770 | 19 |
| PayingUsers | ONE_DAY | 13 |
| PayingUsers | — | 13 |
| PayingUsersCVR | ONE_DAY | 13 |
| PayingUsersCVR | ONE_DAY · by Platform | 66 |
| PayingUsersCVR | — | 26 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=120014184236770 | 75 |
| PeakConcurrentPlayers | ONE_DAY · where Place=120014184236770 | 15 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=120014184236770 | 49 |
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
| RFYDuration0To60 | ONE_DAY | 14 |
| RFYDuration61To180 | ONE_DAY | 14 |
| RFYL7PlayDays | ONE_DAY | 14 |
| RFYL7PlayDays | — | 26 |
| RFYPlayThroughRate | ONE_DAY | 14 |
| RFYQualifiedPTR | ONE_DAY | 14 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | ONE_DAY | 14 |
| RSVPCount | ONE_DAY | 12 |
| ServerFrameRateP10 | ONE_DAY · where Place=120014184236770 | 15 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=120014184236770 | 15 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=120014184236770 | 75 |
| TotalPlayTimeHours | ONE_DAY | 13 |
| TotalPlayTimeHours | — | 13 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY | 14 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 79 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 14 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 65 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 57 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| UniqueUsersWithPlaySessions | ONE_DAY | 14 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 14 |
| UsersJoinedFromNotifications | ONE_DAY | 12 |
| Visits | ONE_DAY · by Platform | 65 |
| Visits | ONE_DAY | 13 |
| Visits | — | 13 |
