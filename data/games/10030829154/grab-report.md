# Grab report — universe 10030829154

- Window: **2026-08-15 → 2026-09-12**
- Plan source: seed
- Discovered dimension values: **__places**: 76865069793948, 87388097381958, 94401613935841, 100407536317236, 109025676702094, 111157217779261, 128451475320872, 139617346573330 · **FunnelName**: TutorialFunnel · **PlaceVersion**: 10, 102, 104, 105, 106, 107, 11, 1698, 1705, 1706, 1708, 1711, 1715, 1716, 1719, 2, 210, 212, 213, 214, 215, 216, 3, 4, 439, 440, 441, 442, 443, 444, 5, 68, 7, 70, 71, 72, 73, 74, 8, 9 · **Place**: 139617346573330, 109025676702094, 111157217779261, 100407536317236, 87388097381958, 128451475320872, 94401613935841 · **FirstSeenPlaceVersion**: 1304, 348, 125, 2, 1618, 213, 414, 34, 62, 104, 71, 8, 4, 339, 1294, 1708, 441, 3, 1681, 1669, 1300, 1421, 1719, 1698, 372, 1360, 1716, 1679, 216, 1677, 157, 147, 1590, 205, 50, 444, 63, 1344, 107, 439, 74, 1715, 382, 41, 1683, 428, 68, 433, 1691, 98, 1685, 215, 188, 443, 434, 364, 437, 202, 210, 412, 11, 1596, 84, 5, 206, 106, 102, 209, 440, 139, 169, 1705, 73, 101, 10, 65, 97, 64, 70, 99, 186, 212, 394, 1607, 67, 435, 1594, 176, 402, 66, 100, 1706, 7, 80, 207, 436, 1711 · **FunnelStep**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
- Requested 237 · **194 returned data** · 31 empty · 22 failed — of which 0 aged out (data Roblox no longer stores) and **5 on observed/proven shapes (look here first)**

## Failed — observed/proven shapes (real problems)

The dashboard itself sends these shapes (or they have returned data before). A failure here means capture is broken or the API changed — it is never evidence about the game.

| Metric | Kind | Shape | HTTP | Provenance | Error |
|---|---|---|---|---|---|
| — | dimensions | by MessageHash | 500 | observed | — |
| — | annotations | — | 400 | proven | — |
| ClientCpuTimeAvg | metric | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 500 | observed | — |
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
| FunnelUserChurnRate | metric | ONE_DAY · by FunnelStep · where FunnelName=TutorialFunnel | 400 | yes | — |
| FunnelUserStepCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=TutorialFunnel | 400 | yes | — |
| FunnelUserTotalCount | metric | ONE_DAY · by FunnelStep · where FunnelName=TutorialFunnel | 400 | yes | — |
| FunnelUserOverallCompletionRate | metric | ONE_DAY · where FunnelName=TutorialFunnel | 400 | yes | — |
| — | metadata | — | 404 | **no** | — |

## Returned 200 but no data points

**The query was valid and matched nothing.** That is NOT evidence the feature is unused — the most common cause is a filter value that doesn't exist on this universe (e.g. a hardcoded `FunnelName` that belongs to a different game). Verify against the dashboard before concluding anything from a row here.

| Metric | Shape |
|---|---|
| — | by CustomField1 |
| — | by CustomField2 |
| — | by CustomField3 |
| — | — |
| — | — |
| — | — |
| — | — |
| — | — |
| — | — |
| — | — |
| annotation:PLACE_ICON | — |
| — | — |
| — | — |
| — | — |
| annotation:FUNNEL | — |
| — | — |
| — | — |
| — | — |
| — | — |
| annotation:CREATOR_REGEX_CHANGE | — |
| — | — |
| Attribution30DRobuxPerUser | ONE_DAY |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| ForwardD30Retention | ONE_DAY |
| ServerCrashCount | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 |
| ServerCrashCount | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 |
| ForwardD30Retention | — |
| DauMauStickiness | — |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| — | — | 8 |
| — | by FunnelName | 1 |
| — | by PlaceVersion | 40 |
| — | by Place | 7 |
| — | by FirstSeenPlaceVersion | 97 |
| — | by FunnelStep | 15 |
| — | — | 2 |
| — | — | 11 |
| — | — | 74 |
| — | — | 100 |
| — | — | 100 |
| — | — | 4 |
| — | — | 100 |
| — | — | 102 |
| — | — | 100 |
| — | — | 1 |
| annotation:ENGINE_RELEASE | — | 21 |
| annotation:EXPERIENCE_EVENT_STATE | — | 14 |
| annotation:PLACE_THUMBNAIL | — | 7 |
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
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 27 |
| AverageSessionLengthMinutes | ONE_DAY · by Platform | 163 |
| AverageSessionLengthMinutes | — | 52 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 140 |
| ClientCrashCount | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 8 |
| ClientCrashCount | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 8 |
| ClientCrashCount | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 8 |
| ClientCrashCount | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 45 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 42 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 40 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 24 |
| ClientCrashRate15m | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| ClientCrashRate15m | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 8 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 30 |
| ClientFpsAvg | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 29 |
| ClientFpsP10 | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 29 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 174 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 29 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 174 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 29 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 174 |
| CpuCoreUtilization | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 27 |
| CpuTimeAvg | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 27 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 135 |
| DailyActiveUsers | ONE_DAY · by Country | 5472 |
| DailyActiveUsers | ONE_DAY · by Gender | 81 |
| DailyActiveUsers | ONE_DAY · by Locale | 1350 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 189 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 27 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 27 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 164 |
| DailyActiveUsers | ONE_DAY · by Platform | 163 |
| DailyActiveUsers | ONE_DAY | 27 |
| DailyActiveUsers | — | 26 |
| DailyRevenue | ONE_DAY · by RevenueSource | 115 |
| DailyRevenue | ONE_DAY · by BalanceType | 52 |
| DailyRevenue | ONE_DAY | 26 |
| DailyRevenue | — | 26 |
| DauMauStickiness | ONE_DAY | 27 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 5 |
| EndToEndCVR | ONE_DAY | 27 |
| ErrorCount | ONE_DAY | 3 |
| ErrorCount | ONE_DAY · by LogSource | 6 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 500 |
| ErrorCount | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 3 |
| ErrorCount | ONE_DAY · by LogSource · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 6 |
| ErrorCount | NONE · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330,FirstSeenPlaceVersion=1719 | 1 |
| ErrorCount | HALF_HOUR · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 33 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 66 |
| EventAvgDailyActiveUsers | ONE_DAY | 26 |
| EventAvgDailyRevenue | ONE_DAY | 26 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 26 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 26 |
| ForwardD1Retention | ONE_DAY | 26 |
| ForwardD1Retention | ONE_DAY · by Platform | 158 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 160 |
| ForwardD1Retention | — | 50 |
| ForwardD7Retention | ONE_DAY | 20 |
| ForwardD7Retention | ONE_DAY · by Platform | 121 |
| ForwardD7Retention | — | 38 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=TutorialFunnel | 420 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=TutorialFunnel | 420 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=TutorialFunnel | 1 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=TutorialFunnel | 1 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=TutorialFunnel,FunnelStep=1/2/3/4/5/6/7/8/9/10/11/12/13/14/15 | 15 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelUserTotalCount | NONE · where FunnelName=TutorialFunnel | 1 |
| ItemMonetizationRevenue | ONE_HOUR · by ProductType | 846 |
| ItemMonetizationRevenue | ONE_HOUR | 227 |
| L7AveragePlayTimeMinutesPerDAU | — | 52 |
| MemoryUsageAvg | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 28 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 140 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 9 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 189 |
| MonthlyActiveUsers | ONE_DAY · by Locale | 1350 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 81 |
| MonthlyActiveUsers | ONE_DAY · by Country | 5472 |
| MonthlyActiveUsers | ONE_DAY | 27 |
| MonthlyActiveUsers | — | 26 |
| OomUnexpectedExits | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 31 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 28 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 26 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 11 |
| PayingUsers | ONE_DAY | 26 |
| PayingUsers | — | 26 |
| PayingUsersCVR | ONE_DAY | 26 |
| PayingUsersCVR | ONE_DAY · by Platform | 160 |
| PayingUsersCVR | — | 52 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 174 |
| PeakConcurrentPlayers | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 29 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 34 |
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
| ServerCrashCount | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 3 |
| ServerCrashCount | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 1 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 3 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 1 |
| ServerCrashCount | HALF_HOUR · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 1 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 1 |
| ServerFrameRateP10 | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 29 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 29 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 174 |
| TotalPlayTimeHours | ONE_DAY | 27 |
| TotalPlayTimeHours | — | 26 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY | 27 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 162 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 27 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 135 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 132 |
| UniqueUsersWithPlaySessions | ONE_DAY | 27 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 27 |
| UsersJoinedFromNotifications | ONE_DAY | 26 |
| Visits | ONE_DAY · by Platform | 163 |
| Visits | ONE_DAY | 27 |
| Visits | — | 26 |
