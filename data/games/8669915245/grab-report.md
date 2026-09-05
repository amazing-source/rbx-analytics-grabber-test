# Grab report — universe 8669915245

- Window: **2025-09-08 → 2026-09-05**
- Plan source: seed+learned
- Discovered dimension values: **__places**: 101657168228738 · **PlaceVersion**: 1264 · **Place**: 101657168228738 · **FirstSeenPlaceVersion**: 1264
- Requested 373 · **258 returned data** · 38 empty · 87 failed — of which 60 aged out (data Roblox no longer stores) and **19 on observed/proven shapes (look here first)**

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
| — | dimensions | by FunnelName | 403 | observed | — |
| — | dimensions | by MessageHash | 500 | observed | — |
| — | annotations | — | 400 | proven | — |
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
| ConcurrentPlayers | metric | ONE_HOUR | 400 | observed | — |

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
| — | by CustomField1 |
| — | by CustomField3 |
| — | by FunnelStep |
| — | by CustomField2 |
| — | — |
| — | — |
| annotation:FUNNEL | — |
| — | — |
| — | — |
| — | — |
| — | — |
| — | — |
| annotation:CREATOR_REGEX_CHANGE | — |
| OomUnexpectedExits | ONE_DAY · where Place=101657168228738 |
| ServerCrashCount | ONE_DAY · where Place=101657168228738 |
| ServerCrashCount | ONE_DAY · where Place=101657168228738 |
| ServerCrashCount | ONE_DAY · where Place=101657168228738 |
| ServerCrashCount | ONE_DAY · where Place=101657168228738 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=101657168228738 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=101657168228738 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=101657168228738 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=101657168228738 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=101657168228738 |
| ServerCrashCount | HALF_HOUR · where Place=101657168228738 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=101657168228738 |
| DauMauStickiness | — |
| OomUnexpectedExits | ONE_DAY · where Place=101657168228738 |
| ServerCrashCount | ONE_DAY · where Place=101657168228738 |
| ServerCrashCount | ONE_DAY · where Place=101657168228738 |
| ServerCrashCount | ONE_DAY · where Place=101657168228738 |
| ServerCrashCount | ONE_DAY · where Place=101657168228738 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=101657168228738 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=101657168228738 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=101657168228738 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=101657168228738 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=101657168228738 |
| ServerCrashCount | HALF_HOUR · where Place=101657168228738 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=101657168228738 |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| — | — | 1 |
| — | by PlaceVersion | 1 |
| — | by Place | 1 |
| — | by FirstSeenPlaceVersion | 1 |
| — | — | 63 |
| — | — | 1 |
| — | — | 1 |
| — | — | 100 |
| annotation:ENGINE_RELEASE | — | 124 |
| annotation:EXPERIENCE_EVENT_STATE | — | 6 |
| annotation:PLACE_ICON | — | 7 |
| annotation:PLACE_THUMBNAIL | — | 6 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DRobuxPerUser | ONE_DAY | 331 |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPayerConversionRatio | ONE_DAY | 354 |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPlaytimePerUserInMinutes | ONE_DAY | 354 |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DRobuxPerUser | ONE_DAY | 354 |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| AttributionD1RetentionRatio | ONE_DAY | 359 |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| AttributionD7RetentionRatio | ONE_DAY | 353 |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| AveragePlayTimeMinutesPerDAU | ONE_DAY | 359 |
| AveragePlayTimeMinutesPerDAU | — | 720 |
| AverageRevenuePerPayingUser | ONE_DAY | 323 |
| AverageRevenuePerPayingUser | — | 720 |
| AverageRevenuePerUser | ONE_DAY | 359 |
| AverageRevenuePerUser | — | 720 |
| AverageSessionLengthMinutes | ONE_DAY | 359 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 359 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 357 |
| AverageSessionLengthMinutes | ONE_DAY · by Platform | 1191 |
| AverageSessionLengthMinutes | — | 720 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 359 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 357 |
| ClientCpuTimeAvg | ONE_DAY · where Place=101657168228738 | 6 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=101657168228738 | 30 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=101657168228738 | 30 |
| ClientCpuTimeAvg | ONE_DAY · where Place=101657168228738 | 6 |
| ClientCrashCount | ONE_DAY · where Place=101657168228738 | 2 |
| ClientCrashCount | ONE_DAY · where Place=101657168228738 | 6 |
| ClientCrashCount | ONE_DAY · where Place=101657168228738 | 8 |
| ClientCrashCount | ONE_DAY · where Place=101657168228738 | 4 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=101657168228738 | 4 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=101657168228738 | 10 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=101657168228738 | 24 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=101657168228738 | 7 |
| ClientCrashCount | ONE_DAY · where Place=101657168228738 | 2 |
| ClientCrashCount | ONE_DAY · where Place=101657168228738 | 6 |
| ClientCrashCount | ONE_DAY · where Place=101657168228738 | 8 |
| ClientCrashCount | ONE_DAY · where Place=101657168228738 | 4 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=101657168228738 | 4 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=101657168228738 | 10 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=101657168228738 | 24 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=101657168228738 | 7 |
| ClientCrashRate15m | ONE_DAY · where Place=101657168228738 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=101657168228738 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=101657168228738 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=101657168228738 | 4 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=101657168228738 | 24 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=101657168228738 | 24 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=101657168228738 | 32 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=101657168228738 | 14 |
| ClientCrashRate15m | ONE_DAY · where Place=101657168228738 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=101657168228738 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=101657168228738 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=101657168228738 | 4 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=101657168228738 | 24 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=101657168228738 | 24 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=101657168228738 | 32 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=101657168228738 | 14 |
| ClientFpsAvg | ONE_DAY · where Place=101657168228738 | 7 |
| ClientFpsAvg | ONE_DAY · where Place=101657168228738 | 7 |
| ClientFpsP10 | ONE_DAY · where Place=101657168228738 | 7 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=101657168228738 | 23 |
| ClientFpsP10 | ONE_DAY · where Place=101657168228738 | 7 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=101657168228738 | 23 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=101657168228738 | 7 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=101657168228738 | 23 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=101657168228738 | 7 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=101657168228738 | 23 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=101657168228738 | 7 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=101657168228738 | 23 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=101657168228738 | 7 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=101657168228738 | 23 |
| CpuCoreUtilization | ONE_DAY · where Place=101657168228738 | 5 |
| CpuCoreUtilization | ONE_DAY · where Place=101657168228738 | 5 |
| CpuTimeAvg | ONE_DAY · where Place=101657168228738 | 5 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=101657168228738 | 25 |
| CpuTimeAvg | ONE_DAY · where Place=101657168228738 | 5 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=101657168228738 | 25 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 2110 |
| DailyActiveUsers | ONE_DAY · by Locale | 11585 |
| DailyActiveUsers | ONE_DAY · by Gender | 1070 |
| DailyActiveUsers | ONE_DAY · by Country | 20000 |
| DailyActiveUsers | ONE_DAY | 359 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 359 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 357 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 1786 |
| DailyActiveUsers | ONE_DAY · by Platform | 1191 |
| DailyActiveUsers | — | 360 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 1452 |
| DailyActiveUsers | NONE · by AcquisitionSource · where IsNewUser=New | 5 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 357 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 359 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 1786 |
| DailyRevenue | ONE_DAY · by RevenueSource | 1068 |
| DailyRevenue | ONE_DAY | 359 |
| DailyRevenue | ONE_DAY · by BalanceType | 383 |
| DailyRevenue | — | 360 |
| DauMauStickiness | ONE_DAY | 359 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 5 |
| EndToEndCVR | ONE_DAY | 359 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 5 |
| ErrorCount | ONE_DAY | 29 |
| ErrorCount | ONE_DAY | 3 |
| ErrorCount | ONE_DAY | 29 |
| ErrorCount | ONE_DAY · by LogSource | 6 |
| ErrorCount | ONE_DAY · by LogSource | 58 |
| ErrorCount | ONE_DAY · by LogSource | 58 |
| ErrorCount | ONE_DAY · where Place=101657168228738 | 29 |
| ErrorCount | ONE_DAY · where Place=101657168228738 | 29 |
| ErrorCount | ONE_DAY · where Place=101657168228738 | 3 |
| ErrorCount | ONE_DAY · by LogSource · where Place=101657168228738 | 58 |
| ErrorCount | ONE_DAY · by LogSource · where Place=101657168228738 | 58 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=101657168228738 | 500 |
| ErrorCount | ONE_DAY · by LogSource · where Place=101657168228738 | 6 |
| ErrorCount | HALF_HOUR · where Place=101657168228738 | 28 |
| ErrorCount | NONE · where Place=101657168228738,FirstSeenPlaceVersion=1264 | 1 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=101657168228738 | 56 |
| ErrorCount | ONE_DAY · where Place=101657168228738 | 29 |
| ErrorCount | ONE_DAY · where Place=101657168228738 | 29 |
| ErrorCount | ONE_DAY · where Place=101657168228738 | 3 |
| ErrorCount | ONE_DAY · by LogSource · where Place=101657168228738 | 58 |
| ErrorCount | ONE_DAY · by LogSource · where Place=101657168228738 | 6 |
| ErrorCount | ONE_DAY · by LogSource · where Place=101657168228738 | 58 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=101657168228738 | 500 |
| ErrorCount | NONE · where Place=101657168228738,FirstSeenPlaceVersion=1264 | 1 |
| ErrorCount | HALF_HOUR · where Place=101657168228738 | 28 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=101657168228738 | 56 |
| EventAvgDailyActiveUsers | ONE_DAY | 350 |
| EventAvgDailyRevenue | ONE_DAY | 350 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 350 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 350 |
| ForwardD1Retention | ONE_DAY | 360 |
| ForwardD1Retention | ONE_DAY · by Platform | 1252 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 1819 |
| ForwardD1Retention | — | 718 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 1470 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 1819 |
| ForwardD30Retention | ONE_DAY | 331 |
| ForwardD30Retention | — | 660 |
| ForwardD7Retention | ONE_DAY | 354 |
| ForwardD7Retention | ONE_DAY · by Platform | 1254 |
| ForwardD7Retention | — | 706 |
| L7AveragePlayTimeMinutesPerDAU | — | 720 |
| MemoryUsageAvg | ONE_DAY · where Place=101657168228738 | 6 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=101657168228738 | 30 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=101657168228738 | 8 |
| MemoryUsageAvg | ONE_DAY · where Place=101657168228738 | 6 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=101657168228738 | 30 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=101657168228738 | 8 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 2110 |
| MonthlyActiveUsers | ONE_DAY · by Country | 20000 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 1070 |
| MonthlyActiveUsers | ONE_DAY · by Locale | 11585 |
| MonthlyActiveUsers | ONE_DAY | 359 |
| MonthlyActiveUsers | — | 360 |
| OomUnexpectedExits | ONE_DAY · where Place=101657168228738 | 3 |
| OomUnexpectedExits | ONE_DAY · where Place=101657168228738 | 3 |
| OomUnexpectedExits | ONE_DAY · where Place=101657168228738 | 3 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=101657168228738 | 5 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=101657168228738 | 5 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=101657168228738 | 4 |
| OomUnexpectedExits | ONE_DAY · where Place=101657168228738 | 3 |
| OomUnexpectedExits | ONE_DAY · where Place=101657168228738 | 3 |
| OomUnexpectedExits | ONE_DAY · where Place=101657168228738 | 3 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=101657168228738 | 5 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=101657168228738 | 5 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=101657168228738 | 4 |
| PayingUsers | ONE_DAY | 359 |
| PayingUsers | — | 360 |
| PayingUsersCVR | ONE_DAY | 359 |
| PayingUsersCVR | ONE_DAY · by Platform | 1190 |
| PayingUsersCVR | — | 720 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=101657168228738 | 23 |
| PeakConcurrentPlayers | ONE_DAY · where Place=101657168228738 | 7 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=101657168228738 | 29 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=101657168228738 | 23 |
| PeakConcurrentPlayers | ONE_DAY · where Place=101657168228738 | 7 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=101657168228738 | 29 |
| PlayerFeedbackVotesCount | ONE_DAY | 250 |
| PotentialExtraEarningsTotalUsd | NONE | 1 |
| RFYD1CoplayDays | ONE_DAY | 126 |
| RFYD1Playtime | ONE_DAY | 126 |
| RFYD1QualifiedPlaySessions | ONE_DAY | 126 |
| RFYD1RobuxSpend | ONE_DAY | 126 |
| RFYD1SpendDay | ONE_DAY | 126 |
| RFYD2To7CoplayDays | ONE_DAY | 126 |
| RFYD2To7PlayDays | ONE_DAY | 126 |
| RFYD2To7Playtime | ONE_DAY | 126 |
| RFYD2To7QualifiedPlaySessions | ONE_DAY | 126 |
| RFYD2To7RobuxSpend | ONE_DAY | 126 |
| RFYD2To7SpendDays | ONE_DAY | 126 |
| RFYD8To28CoplayDays | ONE_DAY | 126 |
| RFYD8To28PlayDays | ONE_DAY | 126 |
| RFYD8To28Playtime | ONE_DAY | 126 |
| RFYD8To28QualifiedPlaySessions | ONE_DAY | 126 |
| RFYD8To28RobuxSpend | ONE_DAY | 126 |
| RFYD8To28SpendDays | ONE_DAY | 126 |
| RFYDuration0To60 | ONE_DAY | 126 |
| RFYDuration61To180 | ONE_DAY | 126 |
| RFYL7PlayDays | ONE_DAY | 345 |
| RFYL7PlayDays | — | 720 |
| RFYPlayThroughRate | ONE_DAY | 126 |
| RFYQualifiedPTR | ONE_DAY | 353 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | ONE_DAY | 215 |
| RSVPCount | ONE_DAY | 350 |
| ServerFrameRateP10 | ONE_DAY · where Place=101657168228738 | 7 |
| ServerFrameRateP10 | ONE_DAY · where Place=101657168228738 | 7 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=101657168228738 | 7 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=101657168228738 | 23 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=101657168228738 | 7 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=101657168228738 | 23 |
| TotalPlayTimeHours | ONE_DAY | 359 |
| TotalPlayTimeHours | — | 360 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY | 359 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 356 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 1855 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 1491 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 356 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 356 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation | 349 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 1491 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 1429 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| UniqueUsersWithPlaySessions | ONE_DAY | 358 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 358 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 1429 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 358 |
| UsersJoinedFromNotifications | ONE_DAY | 350 |
| Visits | ONE_DAY | 359 |
| Visits | ONE_DAY · by Platform | 1191 |
| Visits | — | 360 |
