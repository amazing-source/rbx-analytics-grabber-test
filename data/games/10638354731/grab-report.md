# Grab report — universe 10638354731

- Window: **2026-09-01 → 2026-09-05**
- Plan source: seed+learned
- Discovered dimension values: **__places**: 120014184236770 · **PlaceVersion**: 908 · **FunnelStep**: 1, 2, 3, 4, 5, 6 · **FunnelName**: FUNNEL_TYPE_ONBOARDING, Progression, MapReach 2 · **Place**: 120014184236770 · **FirstSeenPlaceVersion**: 582, 488, 825, 791, 345, 878, 901, 888, 594, 892, 639, 880, 908, 636, 776, 696, 739, 622, 769, 591, 778, 666, 884, 890, 611, 310, 372
- Requested 314 · **238 returned data** · 52 empty · 34 failed — of which 0 aged out (data Roblox no longer stores) and **14 on observed/proven shapes (look here first)**

## Failed — observed/proven shapes (real problems)

The dashboard itself sends these shapes (or they have returned data before). A failure here means capture is broken or the API changed — it is never evidence about the game.

| Metric | Kind | Shape | HTTP | Provenance | Error |
|---|---|---|---|---|---|
| — | dimensions | by MessageHash | 500 | observed | — |
| — | annotations | — | 400 | proven | — |
| L7AverageForwardD1Retention | metric | ONE_DAY | 400 | observed | — |
| L7AveragePlayTimeMinutesPerDAU | metric | ONE_DAY | 400 | observed | — |
| L7AverageDailyActiveUsers | metric | ONE_DAY | 400 | observed | — |
| L7AverageDailyRevenue | metric | ONE_DAY | 400 | observed | — |
| L7AverageDailyActiveUsers | benchmark | — | 404 | observed | — |
| L7AverageDailyRevenue | benchmark | — | 404 | observed | — |
| ItemTotalCreatorEarning | metric | NONE · by AvatarItemId+AvatarItemTargetType | 403 | observed | — |
| ItemTotalTransactionCount | metric | NONE · by AvatarItemId+AvatarItemTargetType | 403 | observed | — |
| L7AverageUniqueUsersWithPlaySessions | metric | ONE_DAY · where IsNewUser=New | 400 | observed | — |
| L7AverageForwardD1Retention | metric | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Others/Friends/Search | 400 | observed | — |
| L7AverageUniqueUsersWithPlaySessions | metric | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 400 | observed | — |
| L7AverageForwardD1Retention | metric | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 400 | observed | — |

## Failed — inferred shapes (probably not valid here)

Query shapes we constructed without a captured example. A failure usually means the dimension isn't valid for this universe. **Never report these as findings about the game.**

| Metric | Kind | Shape | HTTP | optional | Error |
|---|---|---|---|---|---|
| ForwardD1Retention | metric | ONE_DAY · by PlaceVersion | 400 | yes | — |
| WeeklyCohortRetention | metric | ONE_DAY · by CohortDay | 400 | yes | — |
| L7AverageForwardD1Retention | metric | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 400 | yes | — |
| DailyActiveUsers | metric | ONE_DAY · by PlaceVersion | 400 | yes | — |
| AverageSessionLengthMinutes | metric | ONE_DAY · by PlaceVersion | 400 | yes | — |
| L7AverageUniqueUsersWithPlaySessions | metric | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 400 | yes | — |
| DailyRevenue | metric | ONE_DAY · by PlaceVersion | 400 | yes | — |
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
| — | by CustomField2 |
| — | by CustomField3 |
| annotation:PLACE_ICON | — |
| — | — |
| — | — |
| — | — |
| annotation:EXPERIENCE_EVENT_STATE | — |
| annotation:FUNNEL | — |
| — | — |
| — | — |
| — | — |
| — | — |
| annotation:CREATOR_REGEX_CHANGE | — |
| — | — |
| Attribution7DPayerConversionRatio | ONE_DAY |
| Attribution30DRobuxPerUser | ONE_DAY |
| Attribution7DRobuxPerUser | ONE_DAY |
| Attribution7DPlaytimePerUserInMinutes | ONE_DAY |
| RFYD8To28PlayDays | ONE_DAY |
| RFYD8To28CoplayDays | ONE_DAY |
| RFYD8To28QualifiedPlaySessions | ONE_DAY |
| RFYD8To28SpendDays | ONE_DAY |
| RFYD8To28RobuxSpend | ONE_DAY |
| RFYD8To28Playtime | ONE_DAY |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| ForwardD7Retention | ONE_DAY |
| ForwardD30Retention | ONE_DAY |
| ForwardD7Retention | ONE_DAY · by Platform |
| AttributionD7RetentionRatio | ONE_DAY |
| ServerCrashCount | ONE_DAY · where Place=120014184236770 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=120014184236770 |
| ServerCrashCount | HALF_HOUR · where Place=120014184236770 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=120014184236770 |
| ForwardD7Retention | — |
| ForwardD30Retention | — |
| DauMauStickiness | — |
| ServerCrashCount | ONE_DAY · where Place=120014184236770 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=120014184236770 |
| ServerCrashCount | HALF_HOUR · where Place=120014184236770 |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=120014184236770 |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| — | — | 1 |
| — | by PlaceVersion | 1 |
| — | by FunnelStep | 6 |
| — | by FunnelName | 3 |
| — | by Place | 1 |
| — | by FirstSeenPlaceVersion | 27 |
| — | — | 36 |
| — | — | 1 |
| — | — | 100 |
| annotation:ENGINE_RELEASE | — | 3 |
| annotation:PLACE_THUMBNAIL | — | 1 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 5 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 5 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 5 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 5 |
| AttributionD1RetentionRatio | ONE_DAY | 1 |
| AveragePlayTimeMinutesPerDAU | ONE_DAY | 3 |
| AveragePlayTimeMinutesPerDAU | — | 4 |
| AverageRevenuePerPayingUser | ONE_DAY | 3 |
| AverageRevenuePerPayingUser | — | 4 |
| AverageRevenuePerUser | ONE_DAY | 3 |
| AverageRevenuePerUser | — | 4 |
| AverageSessionLengthMinutes | ONE_DAY | 3 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 3 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 3 |
| AverageSessionLengthMinutes | ONE_DAY · by Platform | 15 |
| AverageSessionLengthMinutes | — | 4 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 3 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 3 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=120014184236770 | 20 |
| ClientCpuTimeAvg | ONE_DAY · where Place=120014184236770 | 4 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=120014184236770 | 20 |
| ClientCpuTimeAvg | ONE_DAY · where Place=120014184236770 | 4 |
| ClientCrashCount | ONE_DAY · where Place=120014184236770 | 5 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=120014184236770 | 15 |
| ClientCrashCount | ONE_DAY · where Place=120014184236770 | 5 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=120014184236770 | 15 |
| ClientCrashRate15m | ONE_DAY · where Place=120014184236770 | 5 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=120014184236770 | 25 |
| ClientCrashRate15m | ONE_DAY · where Place=120014184236770 | 5 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=120014184236770 | 25 |
| ClientFpsAvg | ONE_DAY · where Place=120014184236770 | 5 |
| ClientFpsAvg | ONE_DAY · where Place=120014184236770 | 5 |
| ClientFpsP10 | ONE_DAY · where Place=120014184236770 | 5 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=120014184236770 | 25 |
| ClientFpsP10 | ONE_DAY · where Place=120014184236770 | 5 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=120014184236770 | 25 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=120014184236770 | 5 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=120014184236770 | 25 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=120014184236770 | 5 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=120014184236770 | 25 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=120014184236770 | 5 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=120014184236770 | 25 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=120014184236770 | 5 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=120014184236770 | 25 |
| CpuCoreUtilization | ONE_DAY · where Place=120014184236770 | 3 |
| CpuCoreUtilization | ONE_DAY · where Place=120014184236770 | 3 |
| CpuTimeAvg | ONE_DAY · where Place=120014184236770 | 3 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=120014184236770 | 15 |
| CpuTimeAvg | ONE_DAY · where Place=120014184236770 | 3 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=120014184236770 | 15 |
| DailyActiveUsers | ONE_DAY · by Locale | 151 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 21 |
| DailyActiveUsers | ONE_DAY · by Gender | 9 |
| DailyActiveUsers | ONE_DAY · by Country | 577 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 3 |
| DailyActiveUsers | ONE_DAY | 3 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 3 |
| DailyActiveUsers | ONE_DAY · by Platform | 15 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 16 |
| DailyActiveUsers | — | 2 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 12 |
| DailyActiveUsers | NONE · by AcquisitionSource · where IsNewUser=New | 5 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 3 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 3 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 16 |
| DailyCohortRetention | ONE_DAY · by CohortDay | 3 |
| DailyRevenue | ONE_DAY | 3 |
| DailyRevenue | ONE_DAY · by RevenueSource | 14 |
| DailyRevenue | ONE_DAY · by BalanceType | 6 |
| DailyRevenue | — | 2 |
| DauMauStickiness | ONE_DAY | 3 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 4 |
| EndToEndCVR | ONE_DAY | 2 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 4 |
| ErrorCount | ONE_DAY | 4 |
| ErrorCount | ONE_DAY · by LogSource | 8 |
| ErrorCount | ONE_DAY · where Place=120014184236770 | 4 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=120014184236770 | 500 |
| ErrorCount | ONE_DAY · by LogSource · where Place=120014184236770 | 8 |
| ErrorCount | NONE · where Place=120014184236770,FirstSeenPlaceVersion=908 | 1 |
| ErrorCount | HALF_HOUR · where Place=120014184236770 | 29 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=120014184236770 | 58 |
| ErrorCount | ONE_DAY · where Place=120014184236770 | 4 |
| ErrorCount | ONE_DAY · by LogSource · where Place=120014184236770 | 8 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=120014184236770 | 500 |
| ErrorCount | NONE · where Place=120014184236770,FirstSeenPlaceVersion=582/488/825/791/345/878/901/888/594/892/639/880/908/636/776/696/739/622/769/591/778/666/884/890/611/310/372 | 1 |
| ErrorCount | HALF_HOUR · where Place=120014184236770 | 29 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=120014184236770 | 58 |
| EventAvgDailyActiveUsers | ONE_DAY | 2 |
| EventAvgDailyRevenue | ONE_DAY | 2 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 2 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 2 |
| ForwardD1Retention | ONE_DAY | 1 |
| ForwardD1Retention | ONE_DAY · by Platform | 5 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 5 |
| ForwardD1Retention | — | 2 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 4 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 5 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 24 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Progression | 24 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=MapReach 2 | 20 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING/Progression/MapReach 2 | 24 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 24 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Progression | 24 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=MapReach 2 | 20 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING/Progression/MapReach 2 | 24 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 6 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=Progression | 6 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=MapReach 2 | 5 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING/Progression/MapReach 2 | 6 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 6 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=Progression | 6 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=MapReach 2 | 5 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING/Progression/MapReach 2 | 6 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=Progression | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=MapReach 2 | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING/Progression/MapReach 2 | 1 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 6 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=Progression | 6 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=MapReach 2 | 5 |
| FunnelStepTotalCount | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING/Progression/MapReach 2 | 1 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING/Progression/MapReach 2 | 6 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 6 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=Progression | 6 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=MapReach 2 | 5 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelStep=1/2/3/4/5/6,FunnelName=FUNNEL_TYPE_ONBOARDING/Progression/MapReach 2 | 6 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING/Progression/MapReach 2 | 6 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=Progression | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=MapReach 2 | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING/Progression/MapReach 2 | 1 |
| FunnelUserOverallCompletionRate | NONE · by FunnelStep · where FunnelStep=1/2/3/4/5/6,FunnelName=FUNNEL_TYPE_ONBOARDING/Progression/MapReach 2 | 6 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING,FunnelStep=1/2/3/4/5/6 | 6 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=Progression,FunnelStep=1/2/3/4/5/6 | 6 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=MapReach 2,FunnelStep=1/2/3/4/5/6 | 5 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelStep=1/2/3/4/5/6,FunnelName=FUNNEL_TYPE_ONBOARDING/Progression/MapReach 2 | 6 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING/Progression/MapReach 2,FunnelStep=1/2/3/4/5/6 | 6 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING/Progression/MapReach 2 | 6 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 6 |
| FunnelUserTotalCount | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserTotalCount | NONE · where FunnelName=Progression | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=Progression | 6 |
| FunnelUserTotalCount | NONE · where FunnelName=MapReach 2 | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=MapReach 2 | 5 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelStep=1/2/3/4/5/6,FunnelName=FUNNEL_TYPE_ONBOARDING/Progression/MapReach 2 | 6 |
| FunnelUserTotalCount | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING/Progression/MapReach 2 | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING/Progression/MapReach 2 | 6 |
| ItemMonetizationRevenue | ONE_HOUR | 86 |
| ItemMonetizationRevenue | ONE_HOUR · by ProductType | 269 |
| L7AveragePlayTimeMinutesPerDAU | — | 4 |
| MemoryUsageAvg | ONE_DAY · where Place=120014184236770 | 4 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=120014184236770 | 20 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=120014184236770 | 9 |
| MemoryUsageAvg | ONE_DAY · where Place=120014184236770 | 4 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=120014184236770 | 20 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=120014184236770 | 9 |
| MonthlyActiveUsers | ONE_DAY · by Country | 384 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 6 |
| MonthlyActiveUsers | ONE_DAY · by Locale | 101 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 14 |
| MonthlyActiveUsers | ONE_DAY | 2 |
| MonthlyActiveUsers | — | 2 |
| OomUnexpectedExits | ONE_DAY · where Place=120014184236770 | 5 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=120014184236770 | 15 |
| OomUnexpectedExits | ONE_DAY · where Place=120014184236770 | 5 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=120014184236770 | 15 |
| PayingUsers | ONE_DAY | 3 |
| PayingUsers | — | 2 |
| PayingUsersCVR | ONE_DAY | 3 |
| PayingUsersCVR | ONE_DAY · by Platform | 15 |
| PayingUsersCVR | — | 4 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=120014184236770 | 25 |
| PeakConcurrentPlayers | ONE_DAY · where Place=120014184236770 | 5 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=120014184236770 | 38 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=120014184236770 | 25 |
| PeakConcurrentPlayers | ONE_DAY · where Place=120014184236770 | 5 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=120014184236770 | 38 |
| PlayerFeedbackVotesCount | ONE_DAY | 3 |
| PotentialExtraEarningsTotalUsd | NONE | 1 |
| RFYD1CoplayDays | ONE_DAY | 3 |
| RFYD1Playtime | ONE_DAY | 3 |
| RFYD1QualifiedPlaySessions | ONE_DAY | 3 |
| RFYD1RobuxSpend | ONE_DAY | 3 |
| RFYD1SpendDay | ONE_DAY | 3 |
| RFYD2To7CoplayDays | ONE_DAY | 3 |
| RFYD2To7PlayDays | ONE_DAY | 3 |
| RFYD2To7Playtime | ONE_DAY | 3 |
| RFYD2To7QualifiedPlaySessions | ONE_DAY | 3 |
| RFYD2To7RobuxSpend | ONE_DAY | 3 |
| RFYD2To7SpendDays | ONE_DAY | 3 |
| RFYDuration0To60 | ONE_DAY | 3 |
| RFYDuration61To180 | ONE_DAY | 3 |
| RFYL7PlayDays | ONE_DAY | 3 |
| RFYL7PlayDays | — | 4 |
| RFYPlayThroughRate | ONE_DAY | 3 |
| RFYQualifiedPTR | ONE_DAY | 3 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | ONE_DAY | 3 |
| RSVPCount | ONE_DAY | 2 |
| ServerFrameRateP10 | ONE_DAY · where Place=120014184236770 | 5 |
| ServerFrameRateP10 | ONE_DAY · where Place=120014184236770 | 5 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=120014184236770 | 5 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=120014184236770 | 25 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=120014184236770 | 5 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=120014184236770 | 25 |
| TotalPlayTimeHours | ONE_DAY | 3 |
| TotalPlayTimeHours | — | 2 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY | 2 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 11 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 2 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 9 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 2 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 2 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation | 2 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 9 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 5 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 8 |
| UniqueUsersWithPlaySessions | ONE_DAY | 2 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 2 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 8 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 2 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 5 |
| UsersJoinedFromNotifications | ONE_DAY | 2 |
| Visits | ONE_DAY | 3 |
| Visits | ONE_DAY · by Platform | 15 |
| Visits | — | 2 |
