# Grab report — universe 9610561918

- Window: **2026-01-22 → 2026-09-04**
- Plan source: seed+learned
- Discovered dimension values: **__places**: 125003919504672 · **PlaceVersion**: 3809, 3810, 3813, 3824, 3825, 3826, 3829, 3831, 3834, 3837, 3848, 3852 · **Place**: 125003919504672 · **FirstSeenPlaceVersion**: 3727, 3826, 3802, 3760, 3801, 3762, 3797, 3809, 3798, 3829, 3810, 3759, 3808, 3823, 3758, 3834, 3813, 3807, 3837, 3755, 3825, 3824, 3831, 3822, 3852, 3848, 3804, 3817, 3821, 3784, 3789, 2993, 3757
- Requested 372 · **280 returned data** · 14 empty · 88 failed — of which 60 aged out (data Roblox no longer stores) and **20 on observed/proven shapes (look here first)**

## Failed — window older than the data (aged out, not a capture problem)

60 requests over 16 metrics. Each of these shapes returned data elsewhere in this same grab, so the query is valid and only the window differs. Roblox keeps crash/performance for ~30 days and `ErrorCount` for ~56; anything older 400s. **This is a gap in coverage, not an absence of incidents** — a technical question about a period further back is unanswerable and must never be read as health. Since 2026-09-03 the planner clamps these windows up front, so a large number here means the grab predates that or ran with `RBX_NO_HORIZON=1`.

| Metric | Requests aged out |
|---|---|
| ClientCpuTimeAvg | 4 |
| ClientCrashCount | 4 |
| ClientCrashRate15m | 4 |
| ClientFpsAvg | 2 |
| ClientFpsP10 | 4 |
| ClientMemoryUsageAvg | 4 |
| ClientMemoryUsagePercentageAvg | 4 |
| CpuCoreUtilization | 2 |
| CpuTimeAvg | 4 |
| ErrorCount | 6 |
| MemoryUsageAvg | 4 |
| OomUnexpectedExits | 4 |
| PeakConcurrentPlayers | 4 |
| ServerCrashCount | 4 |
| ServerFrameRateP10 | 2 |
| SessionDurationSecondsAvg | 4 |

## Failed — observed/proven shapes (real problems)

The dashboard itself sends these shapes (or they have returned data before). A failure here means capture is broken or the API changed — it is never evidence about the game.

| Metric | Kind | Shape | HTTP | Provenance | Error |
|---|---|---|---|---|---|
| — | dimensions | by FunnelStep | 403 | observed | — |
| — | dimensions | by CustomField1 | 403 | observed | — |
| — | dimensions | by MessageHash | 500 | observed | — |
| — | annotations | — | 400 | proven | — |
| MonthlyActiveUsers | metric | ONE_DAY · by Country | 500 | observed | — |
| DailyCohortRetention | metric | ONE_DAY · by CohortDay | 400 | observed | — |
| L7AverageForwardD1Retention | metric | ONE_DAY | 400 | observed | — |
| L7AveragePlayTimeMinutesPerDAU | metric | ONE_DAY | 400 | observed | — |
| L7AverageDailyActiveUsers | metric | ONE_DAY | 400 | observed | — |
| L7AverageDailyRevenue | metric | ONE_DAY | 400 | observed | — |
| ItemMonetizationRevenue | metric | ONE_HOUR · by ProductType | 500 | observed | — |
| ItemMonetizationRevenue | metric | ONE_HOUR | 500 | observed | — |
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
| — | metadata | — | 404 | **no** | — |

## Returned 200 but no data points

**The query was valid and matched nothing.** That is NOT evidence the feature is unused — the most common cause is a filter value that doesn't exist on this universe (e.g. a hardcoded `FunnelName` that belongs to a different game). Verify against the dashboard before concluding anything from a row here.

| Metric | Shape |
|---|---|
| — | by CustomField2 |
| — | by FunnelName |
| — | by CustomField3 |
| — | — |
| — | — |
| annotation:FUNNEL | — |
| — | — |
| — | — |
| — | — |
| — | — |
| — | — |
| — | — |
| annotation:CREATOR_REGEX_CHANGE | — |
| DauMauStickiness | — |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| — | — | 1 |
| — | by PlaceVersion | 12 |
| — | by Place | 1 |
| — | by FirstSeenPlaceVersion | 33 |
| — | — | 100 |
| — | — | 1 |
| — | — | 1182 |
| annotation:ENGINE_RELEASE | — | 123 |
| annotation:EXPERIENCE_EVENT_STATE | — | 68 |
| annotation:PLACE_ICON | — | 33 |
| annotation:PLACE_THUMBNAIL | — | 60 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DRobuxPerUser | ONE_DAY | 183 |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPayerConversionRatio | ONE_DAY | 187 |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPlaytimePerUserInMinutes | ONE_DAY | 187 |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DRobuxPerUser | ONE_DAY | 187 |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| AttributionD1RetentionRatio | ONE_DAY | 187 |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| AttributionD7RetentionRatio | ONE_DAY | 187 |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| AveragePlayTimeMinutesPerDAU | ONE_DAY | 186 |
| AveragePlayTimeMinutesPerDAU | — | 448 |
| AverageRevenuePerPayingUser | ONE_DAY | 175 |
| AverageRevenuePerPayingUser | — | 448 |
| AverageRevenuePerUser | ONE_DAY | 186 |
| AverageRevenuePerUser | — | 448 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 176 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 185 |
| AverageSessionLengthMinutes | ONE_DAY | 186 |
| AverageSessionLengthMinutes | ONE_DAY · by Platform | 956 |
| AverageSessionLengthMinutes | — | 448 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 176 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 185 |
| ClientCpuTimeAvg | ONE_DAY · where Place=125003919504672 | 6 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=125003919504672 | 30 |
| ClientCpuTimeAvg | ONE_DAY · where Place=125003919504672 | 6 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=125003919504672 | 30 |
| ClientCrashCount | ONE_DAY · where Place=125003919504672 | 8 |
| ClientCrashCount | ONE_DAY · where Place=125003919504672 | 8 |
| ClientCrashCount | ONE_DAY · where Place=125003919504672 | 8 |
| ClientCrashCount | ONE_DAY · where Place=125003919504672 | 4 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=125003919504672 | 33 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=125003919504672 | 39 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=125003919504672 | 32 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=125003919504672 | 16 |
| ClientCrashCount | ONE_DAY · where Place=125003919504672 | 8 |
| ClientCrashCount | ONE_DAY · where Place=125003919504672 | 8 |
| ClientCrashCount | ONE_DAY · where Place=125003919504672 | 8 |
| ClientCrashCount | ONE_DAY · where Place=125003919504672 | 4 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=125003919504672 | 32 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=125003919504672 | 33 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=125003919504672 | 39 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=125003919504672 | 16 |
| ClientCrashRate15m | ONE_DAY · where Place=125003919504672 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=125003919504672 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=125003919504672 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=125003919504672 | 4 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=125003919504672 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=125003919504672 | 44 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=125003919504672 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=125003919504672 | 18 |
| ClientCrashRate15m | ONE_DAY · where Place=125003919504672 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=125003919504672 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=125003919504672 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=125003919504672 | 4 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=125003919504672 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=125003919504672 | 44 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=125003919504672 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=125003919504672 | 18 |
| ClientFpsAvg | ONE_DAY · where Place=125003919504672 | 7 |
| ClientFpsAvg | ONE_DAY · where Place=125003919504672 | 7 |
| ClientFpsP10 | ONE_DAY · where Place=125003919504672 | 7 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=125003919504672 | 36 |
| ClientFpsP10 | ONE_DAY · where Place=125003919504672 | 7 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=125003919504672 | 36 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=125003919504672 | 7 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=125003919504672 | 36 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=125003919504672 | 7 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=125003919504672 | 36 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=125003919504672 | 7 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=125003919504672 | 36 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=125003919504672 | 7 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=125003919504672 | 36 |
| CpuCoreUtilization | ONE_DAY · where Place=125003919504672 | 5 |
| CpuCoreUtilization | ONE_DAY · where Place=125003919504672 | 5 |
| CpuTimeAvg | ONE_DAY · where Place=125003919504672 | 5 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=125003919504672 | 25 |
| CpuTimeAvg | ONE_DAY · where Place=125003919504672 | 5 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=125003919504672 | 25 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 1220 |
| DailyActiveUsers | ONE_DAY · by Locale | 8271 |
| DailyActiveUsers | ONE_DAY · by Gender | 533 |
| DailyActiveUsers | ONE_DAY · by Country | 20000 |
| DailyActiveUsers | ONE_DAY | 186 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 176 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 185 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 1076 |
| DailyActiveUsers | ONE_DAY · by Platform | 956 |
| DailyActiveUsers | — | 224 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 849 |
| DailyActiveUsers | NONE · by AcquisitionSource · where IsNewUser=New | 5 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 176 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 185 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 1076 |
| DailyRevenue | ONE_DAY · by BalanceType | 273 |
| DailyRevenue | ONE_DAY | 186 |
| DailyRevenue | ONE_DAY · by RevenueSource | 599 |
| DailyRevenue | — | 224 |
| DauMauStickiness | ONE_DAY | 186 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 5 |
| EndToEndCVR | ONE_DAY | 177 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 5 |
| ErrorCount | ONE_DAY | 29 |
| ErrorCount | ONE_DAY | 3 |
| ErrorCount | ONE_DAY | 29 |
| ErrorCount | ONE_DAY · by LogSource | 58 |
| ErrorCount | ONE_DAY · by LogSource | 58 |
| ErrorCount | ONE_DAY · by LogSource | 6 |
| ErrorCount | ONE_DAY · where Place=125003919504672 | 29 |
| ErrorCount | ONE_DAY · where Place=125003919504672 | 29 |
| ErrorCount | ONE_DAY · where Place=125003919504672 | 3 |
| ErrorCount | ONE_DAY · by LogSource · where Place=125003919504672 | 58 |
| ErrorCount | ONE_DAY · by LogSource · where Place=125003919504672 | 58 |
| ErrorCount | ONE_DAY · by LogSource · where Place=125003919504672 | 6 |
| ErrorCount | NONE · where Place=125003919504672,FirstSeenPlaceVersion=3852 | 1 |
| ErrorCount | HALF_HOUR · where Place=125003919504672 | 43 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=125003919504672 | 86 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=125003919504672 | 500 |
| ErrorCount | ONE_DAY · where Place=125003919504672 | 29 |
| ErrorCount | ONE_DAY · where Place=125003919504672 | 3 |
| ErrorCount | ONE_DAY · where Place=125003919504672 | 29 |
| ErrorCount | ONE_DAY · by LogSource · where Place=125003919504672 | 58 |
| ErrorCount | ONE_DAY · by LogSource · where Place=125003919504672 | 58 |
| ErrorCount | ONE_DAY · by LogSource · where Place=125003919504672 | 6 |
| ErrorCount | HALF_HOUR · where Place=125003919504672 | 43 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=125003919504672 | 500 |
| ErrorCount | NONE · where Place=125003919504672,FirstSeenPlaceVersion=3727/3826/3802/3760/3801/3762/3797/3809/3798/3829/3810/3759/3808/3823/3758/3834/3813/3807/3837/3755/3825/3824/3831/3822/3852/3848/3804/3817/3821/3784/3789/2993/3757 | 1 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=125003919504672 | 86 |
| EventAvgDailyActiveUsers | ONE_DAY | 131 |
| EventAvgDailyRevenue | ONE_DAY | 131 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 131 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 131 |
| ForwardD1Retention | ONE_DAY | 191 |
| ForwardD1Retention | ONE_DAY · by Platform | 968 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 1098 |
| ForwardD1Retention | — | 446 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 855 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 1098 |
| ForwardD30Retention | ONE_DAY | 185 |
| ForwardD30Retention | — | 388 |
| ForwardD7Retention | ONE_DAY | 189 |
| ForwardD7Retention | ONE_DAY · by Platform | 975 |
| ForwardD7Retention | — | 434 |
| L7AveragePlayTimeMinutesPerDAU | — | 448 |
| MemoryUsageAvg | ONE_DAY · where Place=125003919504672 | 6 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=125003919504672 | 30 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=125003919504672 | 9 |
| MemoryUsageAvg | ONE_DAY · where Place=125003919504672 | 6 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=125003919504672 | 30 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=125003919504672 | 9 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 1220 |
| MonthlyActiveUsers | ONE_DAY · by Locale | 8271 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 533 |
| MonthlyActiveUsers | ONE_DAY | 186 |
| MonthlyActiveUsers | — | 224 |
| OomUnexpectedExits | ONE_DAY · where Place=125003919504672 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=125003919504672 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=125003919504672 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=125003919504672 | 4 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=125003919504672 | 23 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=125003919504672 | 24 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=125003919504672 | 28 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=125003919504672 | 12 |
| OomUnexpectedExits | ONE_DAY · where Place=125003919504672 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=125003919504672 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=125003919504672 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=125003919504672 | 4 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=125003919504672 | 23 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=125003919504672 | 24 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=125003919504672 | 28 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=125003919504672 | 12 |
| PayingUsers | ONE_DAY | 186 |
| PayingUsers | — | 224 |
| PayingUsersCVR | ONE_DAY | 186 |
| PayingUsersCVR | ONE_DAY · by Platform | 966 |
| PayingUsersCVR | — | 448 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=125003919504672 | 36 |
| PeakConcurrentPlayers | ONE_DAY · where Place=125003919504672 | 7 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=125003919504672 | 44 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=125003919504672 | 36 |
| PeakConcurrentPlayers | ONE_DAY · where Place=125003919504672 | 7 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=125003919504672 | 44 |
| PlayerFeedbackVotesCount | ONE_DAY | 171 |
| PotentialExtraEarningsTotalUsd | NONE | 1 |
| RFYD1CoplayDays | ONE_DAY | 125 |
| RFYD1Playtime | ONE_DAY | 125 |
| RFYD1QualifiedPlaySessions | ONE_DAY | 125 |
| RFYD1RobuxSpend | ONE_DAY | 125 |
| RFYD1SpendDay | ONE_DAY | 125 |
| RFYD2To7CoplayDays | ONE_DAY | 125 |
| RFYD2To7PlayDays | ONE_DAY | 125 |
| RFYD2To7Playtime | ONE_DAY | 125 |
| RFYD2To7QualifiedPlaySessions | ONE_DAY | 125 |
| RFYD2To7RobuxSpend | ONE_DAY | 125 |
| RFYD2To7SpendDays | ONE_DAY | 125 |
| RFYD8To28CoplayDays | ONE_DAY | 125 |
| RFYD8To28PlayDays | ONE_DAY | 125 |
| RFYD8To28Playtime | ONE_DAY | 125 |
| RFYD8To28QualifiedPlaySessions | ONE_DAY | 125 |
| RFYD8To28RobuxSpend | ONE_DAY | 125 |
| RFYD8To28SpendDays | ONE_DAY | 125 |
| RFYDuration0To60 | ONE_DAY | 125 |
| RFYDuration61To180 | ONE_DAY | 125 |
| RFYL7PlayDays | ONE_DAY | 161 |
| RFYL7PlayDays | — | 448 |
| RFYPlayThroughRate | ONE_DAY | 125 |
| RFYQualifiedPTR | ONE_DAY | 168 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | ONE_DAY | 168 |
| RSVPCount | ONE_DAY | 131 |
| ServerCrashCount | ONE_DAY · where Place=125003919504672 | 2 |
| ServerCrashCount | ONE_DAY · where Place=125003919504672 | 4 |
| ServerCrashCount | ONE_DAY · where Place=125003919504672 | 8 |
| ServerCrashCount | ONE_DAY · where Place=125003919504672 | 3 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=125003919504672 | 3 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=125003919504672 | 5 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=125003919504672 | 8 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=125003919504672 | 3 |
| ServerCrashCount | HALF_HOUR · where Place=125003919504672 | 7 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=125003919504672 | 7 |
| ServerCrashCount | ONE_DAY · where Place=125003919504672 | 2 |
| ServerCrashCount | ONE_DAY · where Place=125003919504672 | 4 |
| ServerCrashCount | ONE_DAY · where Place=125003919504672 | 3 |
| ServerCrashCount | ONE_DAY · where Place=125003919504672 | 8 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=125003919504672 | 5 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=125003919504672 | 3 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=125003919504672 | 8 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=125003919504672 | 3 |
| ServerCrashCount | HALF_HOUR · where Place=125003919504672 | 7 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=125003919504672 | 7 |
| ServerFrameRateP10 | ONE_DAY · where Place=125003919504672 | 7 |
| ServerFrameRateP10 | ONE_DAY · where Place=125003919504672 | 7 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=125003919504672 | 7 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=125003919504672 | 39 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=125003919504672 | 7 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=125003919504672 | 39 |
| TotalPlayTimeHours | ONE_DAY | 186 |
| TotalPlayTimeHours | — | 224 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY | 177 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 1193 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 171 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 1010 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 171 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 171 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation | 167 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 1010 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 8 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 914 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 175 |
| UniqueUsersWithPlaySessions | ONE_DAY | 185 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 914 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 175 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 8 |
| UsersJoinedFromNotifications | ONE_DAY | 131 |
| Visits | ONE_DAY | 186 |
| Visits | ONE_DAY · by Platform | 956 |
| Visits | — | 224 |
