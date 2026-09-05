# Grab report — universe 10030829154

- Window: **2026-09-01 → 2026-09-05**
- Plan source: seed+learned
- Discovered dimension values: **__places**: 87388097381958, 94401613935841, 100407536317236, 109025676702094, 111157217779261, 128451475320872, 139617346573330 · **FunnelStep**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 · **PlaceVersion**: 10, 106, 1716, 215, 3, 443, 73 · **FunnelName**: TutorialFunnel · **Place**: 139617346573330, 109025676702094, 111157217779261, 100407536317236, 87388097381958, 128451475320872, 94401613935841 · **FirstSeenPlaceVersion**: 1304, 348, 125, 2, 34, 1618, 213, 62, 414, 104, 71, 4, 8, 339, 1294, 441, 1708, 3, 1681, 1421, 1669, 1300, 1698, 1716, 1360, 1679, 1677, 372, 157, 1691, 73, 41, 147, 433, 50, 1590, 439, 205, 1715, 1344, 63, 215, 428, 443, 1685, 434, 437, 382, 1596, 98, 364, 68, 5, 202, 210, 1705, 106, 1683, 206, 412, 209, 188, 97, 10, 64, 139, 169, 84, 1607, 440, 101, 99, 102, 207, 212, 1594, 70, 67, 394, 435, 66, 186, 65, 402, 1706, 401, 1711, 436, 7, 176, 100, 208
- Requested 296 · **224 returned data** · 52 empty · 30 failed — of which 0 aged out (data Roblox no longer stores) and **15 on observed/proven shapes (look here first)**

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
| MonthlyActiveUsers | benchmark | — | 500 | observed | — |
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
| — | placeVersions | — | 500 | yes | — |
| — | placeVersions | — | 500 | yes | — |
| ForwardD1Retention | metric | ONE_DAY · by PlaceVersion | 400 | yes | — |
| WeeklyCohortRetention | metric | ONE_DAY · by CohortDay | 400 | yes | — |
| L7AverageForwardD1Retention | metric | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 400 | yes | — |
| DailyActiveUsers | metric | ONE_DAY · by PlaceVersion | 400 | yes | — |
| AverageSessionLengthMinutes | metric | ONE_DAY · by PlaceVersion | 400 | yes | — |
| L7AverageUniqueUsersWithPlaySessions | metric | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 400 | yes | — |
| DailyRevenue | metric | ONE_DAY · by PlaceVersion | 400 | yes | — |
| FunnelUserChurnRate | metric | ONE_DAY · by FunnelStep · where FunnelName=TutorialFunnel | 400 | yes | — |
| FunnelUserStepCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=TutorialFunnel | 400 | yes | — |
| FunnelUserOverallCompletionRate | metric | ONE_DAY · where FunnelName=TutorialFunnel | 400 | yes | — |
| FunnelUserTotalCount | metric | ONE_DAY · by FunnelStep · where FunnelName=TutorialFunnel | 400 | yes | — |
| FunnelCohortSessionCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=TutorialFunnel | 500 | yes | — |
| — | metadata | — | 404 | **no** | — |

## Returned 200 but no data points

**The query was valid and matched nothing.** That is NOT evidence the feature is unused — the most common cause is a filter value that doesn't exist on this universe (e.g. a hardcoded `FunnelName` that belongs to a different game). Verify against the dashboard before concluding anything from a row here.

| Metric | Shape |
|---|---|
| — | by CustomField2 |
| — | by CustomField3 |
| — | by CustomField1 |
| — | — |
| — | — |
| — | — |
| — | — |
| — | — |
| — | — |
| annotation:PLACE_ICON | — |
| — | — |
| — | — |
| annotation:PLACE_THUMBNAIL | — |
| — | — |
| annotation:FUNNEL | — |
| — | — |
| — | — |
| — | — |
| — | — |
| — | — |
| annotation:CREATOR_REGEX_CHANGE | — |
| Attribution7DPayerConversionRatio | ONE_DAY |
| Attribution30DRobuxPerUser | ONE_DAY |
| Attribution7DPlaytimePerUserInMinutes | ONE_DAY |
| Attribution7DRobuxPerUser | ONE_DAY |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| ForwardD7Retention | ONE_DAY |
| ForwardD7Retention | ONE_DAY · by Platform |
| ForwardD30Retention | ONE_DAY |
| ServerCrashCount | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 |
| AttributionD7RetentionRatio | ONE_DAY |
| ServerCrashCount | HALF_HOUR · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 |
| ForwardD7Retention | — |
| ForwardD30Retention | — |
| DauMauStickiness | — |
| ServerCrashCount | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 |
| ServerCrashCount | HALF_HOUR · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| — | — | 7 |
| — | by FunnelStep | 15 |
| — | by PlaceVersion | 7 |
| — | by FunnelName | 1 |
| — | by Place | 7 |
| — | by FirstSeenPlaceVersion | 92 |
| — | — | 10 |
| — | — | 100 |
| — | — | 73 |
| — | — | 3 |
| — | — | 8 |
| — | — | 100 |
| — | — | 1 |
| annotation:ENGINE_RELEASE | — | 3 |
| annotation:EXPERIENCE_EVENT_STATE | — | 2 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| AttributionD1RetentionRatio | ONE_DAY | 1 |
| AveragePlayTimeMinutesPerDAU | ONE_DAY | 3 |
| AveragePlayTimeMinutesPerDAU | — | 4 |
| AverageRevenuePerPayingUser | ONE_DAY | 3 |
| AverageRevenuePerPayingUser | — | 4 |
| AverageRevenuePerUser | ONE_DAY | 3 |
| AverageRevenuePerUser | — | 4 |
| AverageSessionLengthMinutes | ONE_DAY | 3 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 3 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 3 |
| AverageSessionLengthMinutes | ONE_DAY · by Platform | 18 |
| AverageSessionLengthMinutes | — | 4 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 3 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 3 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 20 |
| ClientCpuTimeAvg | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 4 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 20 |
| ClientCpuTimeAvg | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 4 |
| ClientCrashCount | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 25 |
| ClientCrashCount | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 25 |
| ClientCrashRate15m | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 30 |
| ClientCrashRate15m | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 30 |
| ClientFpsAvg | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| ClientFpsAvg | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| ClientFpsP10 | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 30 |
| ClientFpsP10 | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 30 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 30 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 30 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 30 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 30 |
| CpuCoreUtilization | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 3 |
| CpuCoreUtilization | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 3 |
| CpuTimeAvg | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 3 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 15 |
| CpuTimeAvg | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 3 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 15 |
| DailyActiveUsers | ONE_DAY · by Locale | 150 |
| DailyActiveUsers | ONE_DAY · by Country | 602 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 21 |
| DailyActiveUsers | ONE_DAY · by Gender | 9 |
| DailyActiveUsers | ONE_DAY | 3 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 3 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 3 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 18 |
| DailyActiveUsers | ONE_DAY · by Platform | 18 |
| DailyActiveUsers | — | 2 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 15 |
| DailyActiveUsers | NONE · by AcquisitionSource · where IsNewUser=New | 5 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 3 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 3 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 18 |
| DailyCohortRetention | ONE_DAY · by CohortDay | 3 |
| DailyRevenue | ONE_DAY · by RevenueSource | 12 |
| DailyRevenue | ONE_DAY · by BalanceType | 6 |
| DailyRevenue | ONE_DAY | 3 |
| DailyRevenue | — | 2 |
| DauMauStickiness | ONE_DAY | 3 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 5 |
| EndToEndCVR | ONE_DAY | 2 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 5 |
| ErrorCount | ONE_DAY | 4 |
| ErrorCount | ONE_DAY · by LogSource | 8 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 500 |
| ErrorCount | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 4 |
| ErrorCount | ONE_DAY · by LogSource · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 8 |
| ErrorCount | NONE · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330,FirstSeenPlaceVersion=1716 | 1 |
| ErrorCount | HALF_HOUR · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 29 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 58 |
| ErrorCount | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 4 |
| ErrorCount | ONE_DAY · by LogSource · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 8 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 500 |
| ErrorCount | NONE · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330,FirstSeenPlaceVersion=1304/348/125/2/34/1618/213/62/414/104/71/4/8/339/1294/441/1708/3/1681/1421/1669/1300/1698/1716/1360/1679/1677/372/157/1691/73/41/147/433/50/1590/439/205/1715/1344/63/215/428/443/1685/434/437/382/1596/98/364/68/5/202/210/1705/106/1683/206/412/209/188/97/10/64/139/169/84/1607/440/101/99/102/207/212/1594/70/67/394/435/66/186/65/402/1706/401/1711/436/7/176/100/208 | 1 |
| ErrorCount | HALF_HOUR · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 29 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 58 |
| EventAvgDailyActiveUsers | ONE_DAY | 2 |
| EventAvgDailyRevenue | ONE_DAY | 2 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 2 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 2 |
| ForwardD1Retention | ONE_DAY | 2 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 12 |
| ForwardD1Retention | ONE_DAY · by Platform | 12 |
| ForwardD1Retention | — | 2 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 10 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 12 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=TutorialFunnel | 60 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=TutorialFunnel | 60 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=TutorialFunnel | 60 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=TutorialFunnel | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=TutorialFunnel | 1 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelStepTotalCount | NONE · where FunnelName=TutorialFunnel | 1 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelStep=1/2/3/4/5/6/7/8/9/10/11/12/13/14/15,FunnelName=TutorialFunnel | 15 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=TutorialFunnel | 1 |
| FunnelUserOverallCompletionRate | NONE · by FunnelStep · where FunnelStep=1/2/3/4/5/6/7/8/9/10/11/12/13/14/15,FunnelName=TutorialFunnel | 15 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=TutorialFunnel | 1 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=TutorialFunnel,FunnelStep=1/2/3/4/5/6/7/8/9/10/11/12/13/14/15 | 15 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelStep=1/2/3/4/5/6/7/8/9/10/11/12/13/14/15,FunnelName=TutorialFunnel | 15 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=TutorialFunnel,FunnelStep=1/2/3/4/5/6/7/8/9/10/11/12/13/14/15 | 15 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelUserTotalCount | NONE · where FunnelName=TutorialFunnel | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelStep=1/2/3/4/5/6/7/8/9/10/11/12/13/14/15,FunnelName=TutorialFunnel | 15 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelUserTotalCount | NONE · where FunnelName=TutorialFunnel | 1 |
| ItemMonetizationRevenue | ONE_HOUR | 86 |
| ItemMonetizationRevenue | ONE_HOUR · by ProductType | 324 |
| L7AveragePlayTimeMinutesPerDAU | — | 4 |
| MemoryUsageAvg | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 4 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 20 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 9 |
| MemoryUsageAvg | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 4 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 20 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 9 |
| MonthlyActiveUsers | ONE_DAY · by Locale | 150 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 21 |
| MonthlyActiveUsers | ONE_DAY · by Country | 602 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 9 |
| MonthlyActiveUsers | ONE_DAY | 3 |
| OomUnexpectedExits | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 17 |
| OomUnexpectedExits | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 17 |
| PayingUsers | ONE_DAY | 3 |
| PayingUsers | — | 2 |
| PayingUsersCVR | ONE_DAY | 3 |
| PayingUsersCVR | ONE_DAY · by Platform | 18 |
| PayingUsersCVR | — | 4 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 30 |
| PeakConcurrentPlayers | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 30 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 30 |
| PeakConcurrentPlayers | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 30 |
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
| RFYD8To28CoplayDays | ONE_DAY | 3 |
| RFYD8To28PlayDays | ONE_DAY | 3 |
| RFYD8To28Playtime | ONE_DAY | 3 |
| RFYD8To28QualifiedPlaySessions | ONE_DAY | 3 |
| RFYD8To28RobuxSpend | ONE_DAY | 3 |
| RFYD8To28SpendDays | ONE_DAY | 3 |
| RFYDuration0To60 | ONE_DAY | 3 |
| RFYDuration61To180 | ONE_DAY | 3 |
| RFYL7PlayDays | ONE_DAY | 3 |
| RFYL7PlayDays | — | 4 |
| RFYPlayThroughRate | ONE_DAY | 3 |
| RFYQualifiedPTR | ONE_DAY | 3 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | ONE_DAY | 3 |
| RSVPCount | ONE_DAY | 2 |
| ServerFrameRateP10 | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| ServerFrameRateP10 | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 30 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 30 |
| TotalPlayTimeHours | ONE_DAY | 3 |
| TotalPlayTimeHours | — | 2 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 2 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 12 |
| UniqueUsersWithImpressions | ONE_DAY | 2 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 10 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 2 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 2 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation | 2 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 10 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 10 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 5 |
| UniqueUsersWithPlaySessions | ONE_DAY | 2 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 2 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 10 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 2 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 5 |
| UsersJoinedFromNotifications | ONE_DAY | 2 |
| Visits | ONE_DAY · by Platform | 18 |
| Visits | ONE_DAY | 3 |
| Visits | — | 2 |
