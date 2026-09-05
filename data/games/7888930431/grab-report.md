# Grab report — universe 7888930431

- Window: **2025-06-10 → 2026-09-04**
- Plan source: seed+learned
- Discovered dimension values: **__places**: 94045220073183, 116294134389652 · **PlaceVersion**: 125, 3786, 3812 · **FunnelStep**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 · **Place**: 116294134389652, 94045220073183 · **FirstSeenPlaceVersion**: 3773, 3775, 124, 3786, 3779, 3783, 3812, 125, 3778
- Requested 376 · **258 returned data** · 36 empty · 92 failed — of which 60 aged out (data Roblox no longer stores) and **24 on observed/proven shapes (look here first)**

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
| ItemTotalTransactionCount | metric | NONE · by AvatarItemId+AvatarItemTargetType | 403 | observed | — |
| ItemTotalCreatorEarning | metric | NONE · by AvatarItemId+AvatarItemTargetType | 403 | observed | — |
| L7AverageUniqueUsersWithPlaySessions | metric | ONE_DAY · where IsNewUser=New | 400 | observed | — |
| L7AverageForwardD1Retention | metric | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Others/Friends/Search | 400 | observed | — |
| L7AverageUniqueUsersWithPlaySessions | metric | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 400 | observed | — |
| L7AverageForwardD1Retention | metric | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 400 | observed | — |
| ConcurrentPlayers | metric | ONE_HOUR | 400 | observed | — |
| PeakConcurrentPlayers | metric | ONE_HOUR | 400 | observed | — |
| ClientCrashRate15m | metric | ONE_HOUR | 400 | observed | — |
| MemoryUsageAvg | metric | ONE_HOUR | 400 | observed | — |
| ClientFpsAvg | metric | ONE_HOUR | 400 | observed | — |
| SessionDurationSecondsAvg | metric | ONE_HOUR | 400 | observed | — |

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
| — | by CustomField2 |
| — | — |
| — | — |
| — | — |
| — | — |
| — | — |
| — | — |
| — | — |
| annotation:CREATOR_REGEX_CHANGE | — |
| OomUnexpectedExits | ONE_DAY · where Place=94045220073183/116294134389652 |
| ServerCrashCount | ONE_DAY · where Place=94045220073183/116294134389652 |
| ServerCrashCount | ONE_DAY · where Place=94045220073183/116294134389652 |
| ServerCrashCount | ONE_DAY · where Place=94045220073183/116294134389652 |
| ServerCrashCount | ONE_DAY · where Place=94045220073183/116294134389652 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=94045220073183/116294134389652 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=94045220073183/116294134389652 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=94045220073183/116294134389652 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=94045220073183/116294134389652 |
| ServerCrashCount | HALF_HOUR · where Place=94045220073183/116294134389652 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=94045220073183/116294134389652 |
| DauMauStickiness | — |
| OomUnexpectedExits | ONE_DAY · where Place=94045220073183/116294134389652 |
| ServerCrashCount | ONE_DAY · where Place=94045220073183/116294134389652 |
| ServerCrashCount | ONE_DAY · where Place=94045220073183/116294134389652 |
| ServerCrashCount | ONE_DAY · where Place=94045220073183/116294134389652 |
| ServerCrashCount | ONE_DAY · where Place=94045220073183/116294134389652 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=94045220073183/116294134389652 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=94045220073183/116294134389652 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=94045220073183/116294134389652 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=94045220073183/116294134389652 |
| ServerCrashCount | HALF_HOUR · where Place=94045220073183/116294134389652 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=94045220073183/116294134389652 |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| — | — | 2 |
| — | by PlaceVersion | 3 |
| — | by FunnelStep | 15 |
| — | by Place | 2 |
| — | by FirstSeenPlaceVersion | 9 |
| — | — | 100 |
| — | — | 106 |
| — | — | 100 |
| — | — | 1 |
| — | — | 1 |
| — | — | 1 |
| annotation:ENGINE_RELEASE | — | 124 |
| annotation:EXPERIENCE_EVENT_STATE | — | 20 |
| annotation:FUNNEL | — | 69 |
| annotation:PLACE_ICON | — | 13 |
| annotation:PLACE_THUMBNAIL | — | 53 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DRobuxPerUser | ONE_DAY | 194 |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPayerConversionRatio | ONE_DAY | 194 |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPlaytimePerUserInMinutes | ONE_DAY | 194 |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DRobuxPerUser | ONE_DAY | 194 |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| AttributionD1RetentionRatio | ONE_DAY | 194 |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| AttributionD7RetentionRatio | ONE_DAY | 194 |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| AveragePlayTimeMinutesPerDAU | ONE_DAY | 194 |
| AveragePlayTimeMinutesPerDAU | — | 900 |
| AverageRevenuePerPayingUser | ONE_DAY | 193 |
| AverageRevenuePerPayingUser | — | 900 |
| AverageRevenuePerUser | ONE_DAY | 194 |
| AverageRevenuePerUser | — | 900 |
| AverageSessionLengthMinutes | ONE_DAY | 194 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 194 |
| AverageSessionLengthMinutes | ONE_DAY · by Platform | 883 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 193 |
| AverageSessionLengthMinutes | — | 900 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 194 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 193 |
| ClientCpuTimeAvg | ONE_DAY · where Place=94045220073183/116294134389652 | 6 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=94045220073183/116294134389652 | 30 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=94045220073183/116294134389652 | 30 |
| ClientCpuTimeAvg | ONE_DAY · where Place=94045220073183/116294134389652 | 6 |
| ClientCrashCount | ONE_DAY · where Place=94045220073183/116294134389652 | 8 |
| ClientCrashCount | ONE_DAY · where Place=94045220073183/116294134389652 | 8 |
| ClientCrashCount | ONE_DAY · where Place=94045220073183/116294134389652 | 8 |
| ClientCrashCount | ONE_DAY · where Place=94045220073183/116294134389652 | 4 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 19 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 24 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 17 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 12 |
| ClientCrashCount | ONE_DAY · where Place=94045220073183/116294134389652 | 8 |
| ClientCrashCount | ONE_DAY · where Place=94045220073183/116294134389652 | 8 |
| ClientCrashCount | ONE_DAY · where Place=94045220073183/116294134389652 | 8 |
| ClientCrashCount | ONE_DAY · where Place=94045220073183/116294134389652 | 4 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 24 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 19 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 12 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 17 |
| ClientCrashRate15m | ONE_DAY · where Place=94045220073183/116294134389652 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=94045220073183/116294134389652 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=94045220073183/116294134389652 | 4 |
| ClientCrashRate15m | ONE_DAY · where Place=94045220073183/116294134389652 | 8 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 32 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 37 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 41 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 16 |
| ClientCrashRate15m | ONE_DAY · where Place=94045220073183/116294134389652 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=94045220073183/116294134389652 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=94045220073183/116294134389652 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=94045220073183/116294134389652 | 4 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 32 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 37 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 41 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 16 |
| ClientFpsAvg | ONE_DAY · where Place=94045220073183/116294134389652 | 7 |
| ClientFpsAvg | ONE_DAY · where Place=94045220073183/116294134389652 | 7 |
| ClientFpsP10 | ONE_DAY · where Place=94045220073183/116294134389652 | 7 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 30 |
| ClientFpsP10 | ONE_DAY · where Place=94045220073183/116294134389652 | 7 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 30 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=94045220073183/116294134389652 | 7 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 30 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=94045220073183/116294134389652 | 7 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 30 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=94045220073183/116294134389652 | 7 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 30 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=94045220073183/116294134389652 | 7 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 30 |
| CpuCoreUtilization | ONE_DAY · where Place=94045220073183/116294134389652 | 5 |
| CpuCoreUtilization | ONE_DAY · where Place=94045220073183/116294134389652 | 5 |
| CpuTimeAvg | ONE_DAY · where Place=94045220073183/116294134389652 | 5 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=94045220073183/116294134389652 | 25 |
| CpuTimeAvg | ONE_DAY · where Place=94045220073183/116294134389652 | 5 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=94045220073183/116294134389652 | 25 |
| DailyActiveUsers | ONE_DAY · by Locale | 6017 |
| DailyActiveUsers | ONE_DAY · by Country | 16347 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 1338 |
| DailyActiveUsers | ONE_DAY · by Gender | 580 |
| DailyActiveUsers | ONE_DAY | 194 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 194 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 193 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 985 |
| DailyActiveUsers | ONE_DAY · by Platform | 883 |
| DailyActiveUsers | — | 450 |
| DailyActiveUsers | NONE · by AcquisitionSource · where IsNewUser=New | 5 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 795 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 193 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 194 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 985 |
| DailyRevenue | ONE_DAY | 194 |
| DailyRevenue | ONE_DAY · by RevenueSource | 777 |
| DailyRevenue | ONE_DAY · by BalanceType | 278 |
| DailyRevenue | — | 450 |
| DauMauStickiness | ONE_DAY | 194 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 5 |
| EndToEndCVR | ONE_DAY | 193 |
| ErrorCount | ONE_DAY | 29 |
| ErrorCount | ONE_DAY | 29 |
| ErrorCount | ONE_DAY | 3 |
| ErrorCount | ONE_DAY · by LogSource | 58 |
| ErrorCount | ONE_DAY · by LogSource | 6 |
| ErrorCount | ONE_DAY · by LogSource | 58 |
| ErrorCount | ONE_DAY · where Place=94045220073183/116294134389652 | 29 |
| ErrorCount | ONE_DAY · where Place=94045220073183/116294134389652 | 29 |
| ErrorCount | ONE_DAY · where Place=94045220073183/116294134389652 | 3 |
| ErrorCount | ONE_DAY · by LogSource · where Place=94045220073183/116294134389652 | 58 |
| ErrorCount | ONE_DAY · by LogSource · where Place=94045220073183/116294134389652 | 58 |
| ErrorCount | ONE_DAY · by LogSource · where Place=94045220073183/116294134389652 | 6 |
| ErrorCount | NONE · where Place=94045220073183/116294134389652,FirstSeenPlaceVersion=3812 | 1 |
| ErrorCount | HALF_HOUR · where Place=94045220073183/116294134389652 | 44 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=94045220073183/116294134389652 | 88 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=94045220073183/116294134389652 | 500 |
| ErrorCount | ONE_DAY · where Place=94045220073183/116294134389652 | 29 |
| ErrorCount | ONE_DAY · where Place=94045220073183/116294134389652 | 29 |
| ErrorCount | ONE_DAY · where Place=94045220073183/116294134389652 | 3 |
| ErrorCount | ONE_DAY · by LogSource · where Place=94045220073183/116294134389652 | 58 |
| ErrorCount | ONE_DAY · by LogSource · where Place=94045220073183/116294134389652 | 58 |
| ErrorCount | ONE_DAY · by LogSource · where Place=94045220073183/116294134389652 | 6 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=94045220073183/116294134389652 | 500 |
| ErrorCount | HALF_HOUR · where Place=94045220073183/116294134389652 | 44 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=94045220073183/116294134389652 | 88 |
| ErrorCount | NONE · where Place=94045220073183/116294134389652,FirstSeenPlaceVersion=3773/3775/124/3786/3779/3783/3812/125/3778 | 1 |
| EventAvgDailyActiveUsers | ONE_DAY | 189 |
| EventAvgDailyRevenue | ONE_DAY | 189 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 189 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 189 |
| ForwardD1Retention | ONE_DAY | 194 |
| ForwardD1Retention | ONE_DAY · by Platform | 907 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 1004 |
| ForwardD1Retention | — | 898 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 803 |
| ForwardD30Retention | ONE_DAY | 194 |
| ForwardD30Retention | — | 840 |
| ForwardD7Retention | ONE_DAY | 194 |
| ForwardD7Retention | ONE_DAY · by Platform | 913 |
| ForwardD7Retention | — | 886 |
| L7AveragePlayTimeMinutesPerDAU | — | 776 |
| MemoryUsageAvg | ONE_DAY · where Place=94045220073183/116294134389652 | 6 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=94045220073183/116294134389652 | 29 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=94045220073183/116294134389652 | 9 |
| MemoryUsageAvg | ONE_DAY · where Place=94045220073183/116294134389652 | 6 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=94045220073183/116294134389652 | 29 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=94045220073183/116294134389652 | 9 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 1338 |
| MonthlyActiveUsers | ONE_DAY · by Locale | 6017 |
| MonthlyActiveUsers | ONE_DAY · by Country | 16347 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 580 |
| MonthlyActiveUsers | ONE_DAY | 194 |
| MonthlyActiveUsers | — | 450 |
| OomUnexpectedExits | ONE_DAY · where Place=94045220073183/116294134389652 | 1 |
| OomUnexpectedExits | ONE_DAY · where Place=94045220073183/116294134389652 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=94045220073183/116294134389652 | 3 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 1 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 8 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 5 |
| OomUnexpectedExits | ONE_DAY · where Place=94045220073183/116294134389652 | 1 |
| OomUnexpectedExits | ONE_DAY · where Place=94045220073183/116294134389652 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=94045220073183/116294134389652 | 3 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 1 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 8 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 5 |
| PayingUsers | ONE_DAY | 194 |
| PayingUsers | — | 450 |
| PayingUsersCVR | ONE_DAY | 194 |
| PayingUsersCVR | ONE_DAY · by Platform | 888 |
| PayingUsersCVR | — | 900 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 30 |
| PeakConcurrentPlayers | ONE_DAY · where Place=94045220073183/116294134389652 | 7 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=94045220073183/116294134389652 | 49 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 30 |
| PeakConcurrentPlayers | ONE_DAY · where Place=94045220073183/116294134389652 | 7 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=94045220073183/116294134389652 | 49 |
| PlayerFeedbackVotesCount | ONE_DAY | 186 |
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
| RFYL7PlayDays | ONE_DAY | 181 |
| RFYL7PlayDays | — | 900 |
| RFYPlayThroughRate | ONE_DAY | 125 |
| RFYQualifiedPTR | ONE_DAY | 187 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | ONE_DAY | 187 |
| RSVPCount | ONE_DAY | 189 |
| ServerFrameRateP10 | ONE_DAY · where Place=94045220073183/116294134389652 | 7 |
| ServerFrameRateP10 | ONE_DAY · where Place=94045220073183/116294134389652 | 7 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=94045220073183/116294134389652 | 7 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 30 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=94045220073183/116294134389652 | 7 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=94045220073183/116294134389652 | 30 |
| TotalPlayTimeHours | ONE_DAY | 194 |
| TotalPlayTimeHours | — | 450 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY | 193 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 1065 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 193 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 870 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 193 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 193 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation | 186 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 8 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 803 |
| UniqueUsersWithPlaySessions | ONE_DAY | 193 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 193 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 803 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 193 |
| UsersJoinedFromNotifications | ONE_DAY | 189 |
| Visits | ONE_DAY | 194 |
| Visits | ONE_DAY · by Platform | 883 |
| Visits | — | 450 |
