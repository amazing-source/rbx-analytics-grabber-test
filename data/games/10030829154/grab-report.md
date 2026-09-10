# Grab report — universe 10030829154

- Window: **2026-08-27 → 2026-09-10**
- Plan source: seed
- Discovered dimension values: **__places**: 76865069793948, 87388097381958, 94401613935841, 100407536317236, 109025676702094, 111157217779261, 128451475320872, 139617346573330 · **FunnelName**: TutorialFunnel · **FunnelStep**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 · **PlaceVersion**: 10, 104, 105, 106, 107, 11, 1711, 1715, 1716, 1719, 2, 213, 214, 215, 216, 3, 4, 441, 442, 443, 444, 71, 72, 73, 74, 8, 9 · **Place**: 139617346573330, 109025676702094, 111157217779261, 100407536317236, 87388097381958, 128451475320872, 94401613935841 · **FirstSeenPlaceVersion**: 1304, 348, 125, 2, 1618, 213, 34, 62, 414, 104, 71, 8, 4, 339, 1294, 441, 1708, 3, 1681, 1669, 1300, 1421, 1360, 1698, 1679, 1677, 1719, 1716, 372, 1344, 1715, 147, 433, 428, 50, 439, 1691, 1590, 157, 205, 382, 437, 1685, 98, 41, 74, 216, 444, 434, 63, 364, 1683, 188, 215, 5, 1596, 107, 210, 106, 84, 202, 394, 11, 102, 212, 412, 435, 440, 443, 65, 70, 101, 206, 97, 209, 1607, 1705, 10, 68, 99, 64, 67, 73, 139, 169, 186, 402, 7, 66, 100, 207, 436, 1706
- Requested 221 · **171 returned data** · 33 empty · 27 failed — of which 0 aged out (data Roblox no longer stores) and **6 on observed/proven shapes (look here first)**

## Failed — observed/proven shapes (real problems)

The dashboard itself sends these shapes (or they have returned data before). A failure here means capture is broken or the API changed — it is never evidence about the game.

| Metric | Kind | Shape | HTTP | Provenance | Error |
|---|---|---|---|---|---|
| — | dimensions | by MessageHash | 500 | observed | — |
| — | annotations | — | 400 | proven | — |
| ClientCpuTimeAvg | metric | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 500 | observed | — |
| ClientCpuTimeAvg | metric | ONE_DAY · by ClientCpuTimeCategory · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 500 | observed | — |
| L7AverageDailyActiveUsers | benchmark | — | 404 | proven | — |
| L7AverageDailyRevenue | benchmark | — | 404 | proven | — |

## Failed — inferred shapes (probably not valid here)

Query shapes we constructed without a captured example. A failure usually means the dimension isn't valid for this universe. **Never report these as findings about the game.**

| Metric | Kind | Shape | HTTP | optional | Error |
|---|---|---|---|---|---|
| — | placeVersions | — | 500 | yes | — |
| — | placeVersions | — | 500 | yes | — |
| — | placeVersions | — | 500 | yes | — |
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
| FunnelUserChurnRate | metric | ONE_DAY · by FunnelStep · where FunnelName=TutorialFunnel | 400 | yes | — |
| FunnelUserStepCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=TutorialFunnel | 400 | yes | — |
| FunnelUserOverallCompletionRate | metric | ONE_DAY · where FunnelName=TutorialFunnel | 400 | yes | — |
| FunnelUserTotalCount | metric | ONE_DAY · by FunnelStep · where FunnelName=TutorialFunnel | 400 | yes | — |
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
| — | — |
| annotation:CREATOR_REGEX_CHANGE | — |
| Attribution30DRobuxPerUser | ONE_DAY |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| ForwardD30Retention | ONE_DAY |
| ServerCrashCount | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 |
| ServerCrashCount | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 |
| ServerCrashCount | HALF_HOUR · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 |
| ForwardD30Retention | — |
| DauMauStickiness | — |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| — | — | 8 |
| — | by FunnelName | 1 |
| — | by FunnelStep | 15 |
| — | by PlaceVersion | 27 |
| — | by Place | 7 |
| — | by FirstSeenPlaceVersion | 93 |
| — | — | 1 |
| — | — | 11 |
| — | — | 4 |
| — | — | 30 |
| — | — | 100 |
| — | — | 1 |
| annotation:ENGINE_RELEASE | — | 10 |
| annotation:EXPERIENCE_EVENT_STATE | — | 8 |
| annotation:PLACE_THUMBNAIL | — | 4 |
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
| AverageSessionLengthMinutes | ONE_DAY | 13 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 13 |
| AverageSessionLengthMinutes | ONE_DAY · by Platform | 79 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 13 |
| AverageSessionLengthMinutes | — | 26 |
| ClientCrashCount | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 8 |
| ClientCrashCount | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 7 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 40 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 35 |
| ClientCrashRate15m | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 7 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 42 |
| ClientFpsAvg | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 15 |
| ClientFpsP10 | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 15 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 90 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 15 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 90 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 15 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 90 |
| CpuCoreUtilization | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 14 |
| CpuTimeAvg | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 14 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 70 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 91 |
| DailyActiveUsers | ONE_DAY · by Gender | 39 |
| DailyActiveUsers | ONE_DAY · by Locale | 650 |
| DailyActiveUsers | ONE_DAY · by Country | 2559 |
| DailyActiveUsers | ONE_DAY | 13 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 13 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 13 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 78 |
| DailyActiveUsers | ONE_DAY · by Platform | 79 |
| DailyActiveUsers | — | 13 |
| DailyRevenue | ONE_DAY | 13 |
| DailyRevenue | ONE_DAY · by RevenueSource | 56 |
| DailyRevenue | ONE_DAY · by BalanceType | 26 |
| DailyRevenue | — | 13 |
| DauMauStickiness | ONE_DAY | 13 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 5 |
| EndToEndCVR | ONE_DAY | 14 |
| ErrorCount | ONE_DAY | 2 |
| ErrorCount | ONE_DAY · by LogSource | 4 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 463 |
| ErrorCount | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 2 |
| ErrorCount | ONE_DAY · by LogSource · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 4 |
| ErrorCount | NONE · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330,FirstSeenPlaceVersion=1719 | 1 |
| ErrorCount | HALF_HOUR · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 37 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 74 |
| EventAvgDailyActiveUsers | ONE_DAY | 13 |
| EventAvgDailyRevenue | ONE_DAY | 13 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 13 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 13 |
| ForwardD1Retention | ONE_DAY | 12 |
| ForwardD1Retention | ONE_DAY · by Platform | 74 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 72 |
| ForwardD1Retention | — | 24 |
| ForwardD7Retention | ONE_DAY | 6 |
| ForwardD7Retention | ONE_DAY · by Platform | 37 |
| ForwardD7Retention | — | 12 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=TutorialFunnel | 225 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=TutorialFunnel | 225 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=TutorialFunnel | 1 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=TutorialFunnel | 1 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=TutorialFunnel,FunnelStep=1/2/3/4/5/6/7/8/9/10/11/12/13/14/15 | 15 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelUserTotalCount | NONE · where FunnelName=TutorialFunnel | 1 |
| ItemMonetizationRevenue | ONE_HOUR | 199 |
| ItemMonetizationRevenue | ONE_HOUR · by ProductType | 752 |
| L7AveragePlayTimeMinutesPerDAU | — | 26 |
| MemoryUsageAvg | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 15 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 75 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 9 |
| MonthlyActiveUsers | ONE_DAY · by Country | 2559 |
| MonthlyActiveUsers | ONE_DAY · by Locale | 650 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 39 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 91 |
| MonthlyActiveUsers | ONE_DAY | 13 |
| MonthlyActiveUsers | — | 13 |
| OomUnexpectedExits | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 7 |
| OomUnexpectedExits | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 8 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 29 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 19 |
| PayingUsers | ONE_DAY | 13 |
| PayingUsers | — | 13 |
| PayingUsersCVR | ONE_DAY · by Platform | 79 |
| PayingUsersCVR | ONE_DAY | 13 |
| PayingUsersCVR | — | 26 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 90 |
| PeakConcurrentPlayers | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 15 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 49 |
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
| ServerFrameRateP10 | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 15 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 15 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 90 |
| TotalPlayTimeHours | ONE_DAY | 13 |
| TotalPlayTimeHours | — | 13 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY | 14 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 14 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 84 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 70 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 66 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 14 |
| UniqueUsersWithPlaySessions | ONE_DAY | 14 |
| UsersJoinedFromNotifications | ONE_DAY | 13 |
| Visits | ONE_DAY | 13 |
| Visits | ONE_DAY · by Platform | 79 |
| Visits | — | 13 |
