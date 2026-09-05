# Grab report — universe 8507699752

- Window: **2025-08-21 → 2026-09-04**
- Plan source: seed+learned
- Discovered dimension values: **__places**: 73257710123935 · **PlaceVersion**: 903, 916, 918, 924, 928, 929, 930, 934, 935, 941, 947, 949 · **Place**: 73257710123935 · **FirstSeenPlaceVersion**: 747, 935, 934, 949, 947, 903, 664, 900, 941, 916, 918, 930, 898, 929, 928
- Requested 372 · **263 returned data** · 29 empty · 90 failed — of which 60 aged out (data Roblox no longer stores) and **22 on observed/proven shapes (look here first)**

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
| MonthlyActiveUsers | metric | ONE_DAY · by Locale | 500 | observed | — |
| MonthlyActiveUsers | metric | ONE_DAY · by Country | 202 | observed | — |
| DailyCohortRetention | metric | ONE_DAY · by CohortDay | 400 | observed | — |
| L7AverageForwardD1Retention | metric | ONE_DAY | 400 | observed | — |
| MonthlyActiveUsers | metric | ONE_DAY | 500 | observed | — |
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
| annotation:CREATOR_REGEX_CHANGE | — |
| ServerCrashCount | ONE_DAY · where Place=73257710123935 |
| ServerCrashCount | ONE_DAY · where Place=73257710123935 |
| ServerCrashCount | ONE_DAY · where Place=73257710123935 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=73257710123935 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=73257710123935 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=73257710123935 |
| ServerCrashCount | HALF_HOUR · where Place=73257710123935 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=73257710123935 |
| DauMauStickiness | — |
| ServerCrashCount | ONE_DAY · where Place=73257710123935 |
| ServerCrashCount | ONE_DAY · where Place=73257710123935 |
| ServerCrashCount | ONE_DAY · where Place=73257710123935 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=73257710123935 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=73257710123935 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=73257710123935 |
| ServerCrashCount | HALF_HOUR · where Place=73257710123935 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=73257710123935 |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| — | — | 1 |
| — | by PlaceVersion | 12 |
| — | by Place | 1 |
| — | by FirstSeenPlaceVersion | 15 |
| — | — | 1 |
| — | — | 100 |
| — | — | 553 |
| — | — | 1 |
| annotation:ENGINE_RELEASE | — | 124 |
| annotation:EXPERIENCE_EVENT_STATE | — | 10 |
| annotation:PLACE_ICON | — | 35 |
| annotation:PLACE_THUMBNAIL | — | 41 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DRobuxPerUser | ONE_DAY | 349 |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPayerConversionRatio | ONE_DAY | 368 |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPlaytimePerUserInMinutes | ONE_DAY | 368 |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DRobuxPerUser | ONE_DAY | 368 |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| AttributionD1RetentionRatio | ONE_DAY | 373 |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| AttributionD7RetentionRatio | ONE_DAY | 367 |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| AveragePlayTimeMinutesPerDAU | ONE_DAY | 377 |
| AveragePlayTimeMinutesPerDAU | — | 756 |
| AverageRevenuePerPayingUser | ONE_DAY | 372 |
| AverageRevenuePerPayingUser | — | 756 |
| AverageRevenuePerUser | ONE_DAY | 377 |
| AverageRevenuePerUser | — | 756 |
| AverageSessionLengthMinutes | ONE_DAY | 377 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 376 |
| AverageSessionLengthMinutes | ONE_DAY · by Platform | 1990 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 375 |
| AverageSessionLengthMinutes | — | 756 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 376 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 375 |
| ClientCpuTimeAvg | ONE_DAY · where Place=73257710123935 | 6 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=73257710123935 | 30 |
| ClientCpuTimeAvg | ONE_DAY · where Place=73257710123935 | 6 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=73257710123935 | 30 |
| ClientCrashCount | ONE_DAY · where Place=73257710123935 | 8 |
| ClientCrashCount | ONE_DAY · where Place=73257710123935 | 8 |
| ClientCrashCount | ONE_DAY · where Place=73257710123935 | 8 |
| ClientCrashCount | ONE_DAY · where Place=73257710123935 | 4 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=73257710123935 | 40 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=73257710123935 | 32 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=73257710123935 | 36 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=73257710123935 | 16 |
| ClientCrashCount | ONE_DAY · where Place=73257710123935 | 8 |
| ClientCrashCount | ONE_DAY · where Place=73257710123935 | 8 |
| ClientCrashCount | ONE_DAY · where Place=73257710123935 | 8 |
| ClientCrashCount | ONE_DAY · where Place=73257710123935 | 4 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=73257710123935 | 40 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=73257710123935 | 32 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=73257710123935 | 36 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=73257710123935 | 16 |
| ClientCrashRate15m | ONE_DAY · where Place=73257710123935 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=73257710123935 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=73257710123935 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=73257710123935 | 4 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=73257710123935 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=73257710123935 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=73257710123935 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=73257710123935 | 24 |
| ClientCrashRate15m | ONE_DAY · where Place=73257710123935 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=73257710123935 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=73257710123935 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=73257710123935 | 4 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=73257710123935 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=73257710123935 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=73257710123935 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=73257710123935 | 24 |
| ClientFpsAvg | ONE_DAY · where Place=73257710123935 | 7 |
| ClientFpsAvg | ONE_DAY · where Place=73257710123935 | 7 |
| ClientFpsP10 | ONE_DAY · where Place=73257710123935 | 7 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=73257710123935 | 42 |
| ClientFpsP10 | ONE_DAY · where Place=73257710123935 | 7 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=73257710123935 | 42 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=73257710123935 | 7 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=73257710123935 | 42 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=73257710123935 | 7 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=73257710123935 | 42 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=73257710123935 | 7 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=73257710123935 | 42 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=73257710123935 | 7 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=73257710123935 | 42 |
| CpuCoreUtilization | ONE_DAY · where Place=73257710123935 | 5 |
| CpuCoreUtilization | ONE_DAY · where Place=73257710123935 | 5 |
| CpuTimeAvg | ONE_DAY · where Place=73257710123935 | 5 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=73257710123935 | 25 |
| CpuTimeAvg | ONE_DAY · where Place=73257710123935 | 5 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=73257710123935 | 25 |
| DailyActiveUsers | ONE_DAY · by Country | 20000 |
| DailyActiveUsers | ONE_DAY · by Locale | 17668 |
| DailyActiveUsers | ONE_DAY · by Gender | 1124 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 2423 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 376 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 375 |
| DailyActiveUsers | ONE_DAY | 377 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 2322 |
| DailyActiveUsers | ONE_DAY · by Platform | 1990 |
| DailyActiveUsers | — | 378 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 1845 |
| DailyActiveUsers | NONE · by AcquisitionSource · where IsNewUser=New | 5 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 375 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 376 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 2322 |
| DailyRevenue | ONE_DAY | 377 |
| DailyRevenue | ONE_DAY · by RevenueSource | 1682 |
| DailyRevenue | ONE_DAY · by BalanceType | 464 |
| DailyRevenue | — | 378 |
| DauMauStickiness | ONE_DAY | 377 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 5 |
| EndToEndCVR | ONE_DAY | 376 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 5 |
| ErrorCount | ONE_DAY | 29 |
| ErrorCount | ONE_DAY | 29 |
| ErrorCount | ONE_DAY | 3 |
| ErrorCount | ONE_DAY · by LogSource | 58 |
| ErrorCount | ONE_DAY · by LogSource | 58 |
| ErrorCount | ONE_DAY · by LogSource | 6 |
| ErrorCount | ONE_DAY · where Place=73257710123935 | 29 |
| ErrorCount | ONE_DAY · where Place=73257710123935 | 29 |
| ErrorCount | ONE_DAY · where Place=73257710123935 | 3 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=73257710123935 | 500 |
| ErrorCount | ONE_DAY · by LogSource · where Place=73257710123935 | 58 |
| ErrorCount | ONE_DAY · by LogSource · where Place=73257710123935 | 6 |
| ErrorCount | ONE_DAY · by LogSource · where Place=73257710123935 | 58 |
| ErrorCount | NONE · where Place=73257710123935,FirstSeenPlaceVersion=949 | 1 |
| ErrorCount | HALF_HOUR · where Place=73257710123935 | 43 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=73257710123935 | 86 |
| ErrorCount | ONE_DAY · where Place=73257710123935 | 29 |
| ErrorCount | ONE_DAY · where Place=73257710123935 | 29 |
| ErrorCount | ONE_DAY · where Place=73257710123935 | 3 |
| ErrorCount | ONE_DAY · by LogSource · where Place=73257710123935 | 58 |
| ErrorCount | ONE_DAY · by LogSource · where Place=73257710123935 | 58 |
| ErrorCount | ONE_DAY · by LogSource · where Place=73257710123935 | 6 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=73257710123935 | 500 |
| ErrorCount | HALF_HOUR · where Place=73257710123935 | 43 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=73257710123935 | 86 |
| ErrorCount | NONE · where Place=73257710123935,FirstSeenPlaceVersion=747/935/934/949/947/903/664/900/941/916/918/930/898/929/928 | 1 |
| EventAvgDailyActiveUsers | ONE_DAY | 252 |
| EventAvgDailyRevenue | ONE_DAY | 252 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 252 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 252 |
| ForwardD1Retention | ONE_DAY | 377 |
| ForwardD1Retention | ONE_DAY · by Platform | 2024 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 2351 |
| ForwardD1Retention | — | 754 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 1848 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 2351 |
| ForwardD30Retention | ONE_DAY | 348 |
| ForwardD30Retention | — | 696 |
| ForwardD7Retention | ONE_DAY | 371 |
| ForwardD7Retention | ONE_DAY · by Platform | 2012 |
| ForwardD7Retention | — | 742 |
| L7AveragePlayTimeMinutesPerDAU | — | 756 |
| MemoryUsageAvg | ONE_DAY · where Place=73257710123935 | 6 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=73257710123935 | 30 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=73257710123935 | 9 |
| MemoryUsageAvg | ONE_DAY · where Place=73257710123935 | 6 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=73257710123935 | 30 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=73257710123935 | 9 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 2423 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 1124 |
| MonthlyActiveUsers | — | 378 |
| OomUnexpectedExits | ONE_DAY · where Place=73257710123935 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=73257710123935 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=73257710123935 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=73257710123935 | 4 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=73257710123935 | 27 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=73257710123935 | 17 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=73257710123935 | 23 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=73257710123935 | 9 |
| OomUnexpectedExits | ONE_DAY · where Place=73257710123935 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=73257710123935 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=73257710123935 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=73257710123935 | 4 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=73257710123935 | 27 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=73257710123935 | 17 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=73257710123935 | 23 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=73257710123935 | 9 |
| PayingUsers | ONE_DAY | 377 |
| PayingUsers | — | 378 |
| PayingUsersCVR | ONE_DAY | 377 |
| PayingUsersCVR | ONE_DAY · by Platform | 1990 |
| PayingUsersCVR | — | 756 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=73257710123935 | 42 |
| PeakConcurrentPlayers | ONE_DAY · where Place=73257710123935 | 7 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=73257710123935 | 44 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=73257710123935 | 42 |
| PeakConcurrentPlayers | ONE_DAY · where Place=73257710123935 | 7 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=73257710123935 | 44 |
| PlayerFeedbackVotesCount | ONE_DAY | 367 |
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
| RFYL7PlayDays | ONE_DAY | 360 |
| RFYL7PlayDays | — | 756 |
| RFYPlayThroughRate | ONE_DAY | 125 |
| RFYQualifiedPTR | ONE_DAY | 368 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | ONE_DAY | 214 |
| RSVPCount | ONE_DAY | 252 |
| ServerCrashCount | ONE_DAY · where Place=73257710123935 | 4 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=73257710123935 | 4 |
| ServerCrashCount | ONE_DAY · where Place=73257710123935 | 4 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=73257710123935 | 4 |
| ServerFrameRateP10 | ONE_DAY · where Place=73257710123935 | 7 |
| ServerFrameRateP10 | ONE_DAY · where Place=73257710123935 | 7 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=73257710123935 | 7 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=73257710123935 | 42 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=73257710123935 | 7 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=73257710123935 | 42 |
| TotalPlayTimeHours | ONE_DAY | 377 |
| TotalPlayTimeHours | — | 378 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY | 376 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 373 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 2338 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 1951 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 373 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 373 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation | 367 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 1951 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 8 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 1786 |
| UniqueUsersWithPlaySessions | ONE_DAY | 376 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 375 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 1786 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 375 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 8 |
| UsersJoinedFromNotifications | ONE_DAY | 252 |
| Visits | ONE_DAY · by Platform | 1990 |
| Visits | ONE_DAY | 377 |
| Visits | — | 378 |
