# Grab report — universe 10030829154

- Window: **2026-09-16 → 2026-09-20**
- Plan source: seed
- Discovered dimension values: **__places**: 76865069793948, 87388097381958, 94401613935841, 100407536317236, 109025676702094, 111157217779261, 128451475320872, 139617346573330 · **FunnelName**: TutorialFunnel · **PlaceVersion**: 109, 110, 13, 14, 1722, 1723, 218, 219, 4, 446, 447, 5, 6, 7, 76, 77 · **Place**: 139617346573330, 109025676702094, 111157217779261, 100407536317236, 87388097381958, 128451475320872, 76865069793948, 94401613935841 · **FirstSeenPlaceVersion**: 1304, 348, 125, 2, 3, 1618, 34, 213, 414, 104, 62, 71, 8, 4, 339, 1294, 441, 1708, 1681, 1300, 1421, 1698, 372, 1723, 1360, 1669, 1590, 1679, 1677, 1721, 147, 41, 1716, 1722, 50, 63, 6, 1719, 157, 7, 433, 382, 1344, 439, 1685, 447, 428, 205, 1691, 412, 219, 1596, 5, 437, 434, 446, 444, 218, 1705, 216, 364, 1683, 68, 169, 188, 98, 210, 202, 443, 107, 84, 440, 139, 110, 74, 215, 97, 1607, 206, 109, 209, 64, 101, 67, 102, 77, 99, 76, 1594, 106, 435, 14, 445, 11, 1711, 10, 70, 73, 212, 12 · **FunnelStep**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
- Requested 213 · **157 returned data** · 40 empty · 26 failed — of which 0 aged out (data Roblox no longer stores) and **4 on observed/proven shapes (look here first)**

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
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| ForwardD7Retention | ONE_DAY |
| ForwardD7Retention | ONE_DAY · by Platform |
| ForwardD30Retention | ONE_DAY |
| ServerCrashCount | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 |
| ServerCrashCount | HALF_HOUR · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 |
| ForwardD7Retention | — |
| ForwardD30Retention | — |
| DauMauStickiness | — |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| — | — | 8 |
| — | by FunnelName | 1 |
| — | by PlaceVersion | 16 |
| — | by Place | 8 |
| — | by FirstSeenPlaceVersion | 100 |
| — | by FunnelStep | 15 |
| — | — | 14 |
| — | — | 5 |
| — | — | 77 |
| — | — | 100 |
| — | — | 100 |
| — | — | 100 |
| — | — | 7 |
| — | — | 100 |
| — | — | 5 |
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
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 20 |
| ClientCpuTimeAvg | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 4 |
| ClientCrashCount | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 24 |
| ClientCrashRate15m | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 30 |
| ClientFpsAvg | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| ClientFpsP10 | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 30 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 30 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 30 |
| CpuCoreUtilization | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 3 |
| CpuTimeAvg | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 3 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 15 |
| DailyActiveUsers | ONE_DAY · by Locale | 100 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 14 |
| DailyActiveUsers | ONE_DAY · by Gender | 6 |
| DailyActiveUsers | ONE_DAY · by Country | 391 |
| DailyActiveUsers | ONE_DAY | 2 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 2 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 2 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 12 |
| DailyActiveUsers | ONE_DAY · by Platform | 12 |
| DailyActiveUsers | — | 2 |
| DailyCohortRetention | ONE_DAY · by CohortDay | 1 |
| DailyRevenue | ONE_DAY · by RevenueSource | 9 |
| DailyRevenue | ONE_DAY · by BalanceType | 4 |
| DailyRevenue | ONE_DAY | 2 |
| DailyRevenue | — | 2 |
| DauMauStickiness | ONE_DAY | 2 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 5 |
| EndToEndCVR | ONE_DAY | 2 |
| ErrorCount | ONE_DAY | 4 |
| ErrorCount | ONE_DAY · by LogSource | 8 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 500 |
| ErrorCount | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 4 |
| ErrorCount | ONE_DAY · by LogSource · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 8 |
| ErrorCount | HALF_HOUR · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 19 |
| ErrorCount | NONE · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330,FirstSeenPlaceVersion=1723 | 1 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 38 |
| EventAvgDailyActiveUsers | ONE_DAY | 2 |
| EventAvgDailyRevenue | ONE_DAY | 2 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 2 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 2 |
| ForwardD1Retention | ONE_DAY | 1 |
| ForwardD1Retention | ONE_DAY · by Platform | 6 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| ForwardD1Retention | — | 2 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=TutorialFunnel | 60 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=TutorialFunnel | 60 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=TutorialFunnel | 1 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=TutorialFunnel | 1 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=TutorialFunnel,FunnelStep=1/2/3/4/5/6/7/8/9/10/11/12/13/14/15 | 15 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=TutorialFunnel | 15 |
| FunnelUserTotalCount | NONE · where FunnelName=TutorialFunnel | 1 |
| ItemMonetizationRevenue | ONE_HOUR · by ProductType | 319 |
| ItemMonetizationRevenue | ONE_HOUR | 81 |
| L7AveragePlayTimeMinutesPerDAU | — | 4 |
| MemoryUsageAvg | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 4 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 20 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 9 |
| MonthlyActiveUsers | ONE_DAY · by Country | 391 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 6 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 14 |
| MonthlyActiveUsers | ONE_DAY · by Locale | 100 |
| MonthlyActiveUsers | ONE_DAY | 2 |
| MonthlyActiveUsers | — | 2 |
| OomUnexpectedExits | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 15 |
| PayingUsers | ONE_DAY | 2 |
| PayingUsers | — | 2 |
| PayingUsersCVR | ONE_DAY | 2 |
| PayingUsersCVR | ONE_DAY · by Platform | 13 |
| PayingUsersCVR | — | 4 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 30 |
| PeakConcurrentPlayers | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 20 |
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
| ServerFrameRateP10 | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 5 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=76865069793948/87388097381958/94401613935841/100407536317236/109025676702094/111157217779261/128451475320872/139617346573330 | 30 |
| TotalPlayTimeHours | ONE_DAY | 2 |
| TotalPlayTimeHours | — | 2 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY | 2 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 2 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 14 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 12 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 5 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 12 |
| UniqueUsersWithPlaySessions | ONE_DAY | 2 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 2 |
| UsersJoinedFromNotifications | ONE_DAY | 2 |
| Visits | ONE_DAY | 2 |
| Visits | ONE_DAY · by Platform | 12 |
| Visits | — | 2 |
