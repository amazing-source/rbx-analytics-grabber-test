# Grab report — universe 9758414065

- Window: **2026-02-18 → 2026-09-04**
- Plan source: seed+learned
- Discovered dimension values: **PlaceVersion**: 1256 · **Place**: 137768115850394 · **FirstSeenPlaceVersion**: 1256, 1194, 1246, 1251, 1195, 1248, 1197, 1249, 1189 · **__places**: 137768115850394
- Requested 372 · **262 returned data** · 35 empty · 85 failed — of which 60 aged out (data Roblox no longer stores) and **17 on observed/proven shapes (look here first)**

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
| — | dimensions | by MessageHash | 500 | observed | — |
| — | annotations | — | 400 | proven | — |
| L7AverageForwardD1Retention | metric | ONE_DAY | 400 | observed | — |
| DailyCohortRetention | metric | ONE_DAY · by CohortDay | 400 | observed | — |
| L7AveragePlayTimeMinutesPerDAU | metric | ONE_DAY | 400 | observed | — |
| L7AverageDailyActiveUsers | metric | ONE_DAY | 400 | observed | — |
| L7AverageDailyRevenue | metric | ONE_DAY | 400 | observed | — |
| ItemMonetizationRevenue | metric | ONE_HOUR | 500 | observed | — |
| L7AverageDailyActiveUsers | benchmark | — | 404 | observed | — |
| L7AverageDailyRevenue | benchmark | — | 404 | observed | — |
| ItemTotalCreatorEarning | metric | NONE · by AvatarItemId+AvatarItemTargetType | 403 | observed | — |
| L7AverageUniqueUsersWithPlaySessions | metric | ONE_DAY · where IsNewUser=New | 400 | observed | — |
| ItemTotalTransactionCount | metric | NONE · by AvatarItemId+AvatarItemTargetType | 403 | observed | — |
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
| — | by CustomField1 |
| — | by FunnelName |
| — | by CustomField2 |
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
| ServerCrashCount | ONE_DAY · where Place=137768115850394 |
| ServerCrashCount | ONE_DAY · where Place=137768115850394 |
| ServerCrashCount | ONE_DAY · where Place=137768115850394 |
| ServerCrashCount | ONE_DAY · where Place=137768115850394 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=137768115850394 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=137768115850394 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=137768115850394 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=137768115850394 |
| ServerCrashCount | HALF_HOUR · where Place=137768115850394 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=137768115850394 |
| DauMauStickiness | — |
| ServerCrashCount | ONE_DAY · where Place=137768115850394 |
| ServerCrashCount | ONE_DAY · where Place=137768115850394 |
| ServerCrashCount | ONE_DAY · where Place=137768115850394 |
| ServerCrashCount | ONE_DAY · where Place=137768115850394 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=137768115850394 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=137768115850394 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=137768115850394 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=137768115850394 |
| ServerCrashCount | HALF_HOUR · where Place=137768115850394 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=137768115850394 |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| — | by PlaceVersion | 1 |
| — | by Place | 1 |
| — | by FirstSeenPlaceVersion | 9 |
| — | — | 1 |
| — | — | 100 |
| — | — | 2 |
| — | — | 312 |
| annotation:ENGINE_RELEASE | — | 118 |
| annotation:EXPERIENCE_EVENT_STATE | — | 14 |
| annotation:PLACE_ICON | — | 11 |
| annotation:PLACE_THUMBNAIL | — | 20 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DRobuxPerUser | ONE_DAY | 168 |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPayerConversionRatio | ONE_DAY | 190 |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPlaytimePerUserInMinutes | ONE_DAY | 190 |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DRobuxPerUser | ONE_DAY | 190 |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| AttributionD1RetentionRatio | ONE_DAY | 192 |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| AttributionD7RetentionRatio | ONE_DAY | 190 |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| AveragePlayTimeMinutesPerDAU | ONE_DAY | 190 |
| AveragePlayTimeMinutesPerDAU | — | 394 |
| AverageRevenuePerPayingUser | ONE_DAY | 187 |
| AverageRevenuePerPayingUser | — | 394 |
| AverageRevenuePerUser | ONE_DAY | 190 |
| AverageRevenuePerUser | — | 394 |
| AverageSessionLengthMinutes | ONE_DAY | 190 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 190 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 189 |
| AverageSessionLengthMinutes | ONE_DAY · by Platform | 831 |
| AverageSessionLengthMinutes | — | 394 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 189 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 190 |
| ClientCpuTimeAvg | ONE_DAY · where Place=137768115850394 | 6 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=137768115850394 | 30 |
| ClientCpuTimeAvg | ONE_DAY · where Place=137768115850394 | 6 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=137768115850394 | 30 |
| ClientCrashCount | ONE_DAY · where Place=137768115850394 | 8 |
| ClientCrashCount | ONE_DAY · where Place=137768115850394 | 8 |
| ClientCrashCount | ONE_DAY · where Place=137768115850394 | 8 |
| ClientCrashCount | ONE_DAY · where Place=137768115850394 | 4 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=137768115850394 | 24 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=137768115850394 | 24 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=137768115850394 | 24 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=137768115850394 | 11 |
| ClientCrashCount | ONE_DAY · where Place=137768115850394 | 8 |
| ClientCrashCount | ONE_DAY · where Place=137768115850394 | 8 |
| ClientCrashCount | ONE_DAY · where Place=137768115850394 | 8 |
| ClientCrashCount | ONE_DAY · where Place=137768115850394 | 4 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=137768115850394 | 24 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=137768115850394 | 24 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=137768115850394 | 24 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=137768115850394 | 11 |
| ClientCrashRate15m | ONE_DAY · where Place=137768115850394 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=137768115850394 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=137768115850394 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=137768115850394 | 4 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=137768115850394 | 33 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=137768115850394 | 39 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=137768115850394 | 38 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=137768115850394 | 19 |
| ClientCrashRate15m | ONE_DAY · where Place=137768115850394 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=137768115850394 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=137768115850394 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=137768115850394 | 4 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=137768115850394 | 39 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=137768115850394 | 33 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=137768115850394 | 38 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=137768115850394 | 19 |
| ClientFpsAvg | ONE_DAY · where Place=137768115850394 | 7 |
| ClientFpsAvg | ONE_DAY · where Place=137768115850394 | 7 |
| ClientFpsP10 | ONE_DAY · where Place=137768115850394 | 7 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=137768115850394 | 33 |
| ClientFpsP10 | ONE_DAY · where Place=137768115850394 | 7 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=137768115850394 | 33 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=137768115850394 | 7 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=137768115850394 | 33 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=137768115850394 | 7 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=137768115850394 | 33 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=137768115850394 | 7 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=137768115850394 | 33 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=137768115850394 | 7 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=137768115850394 | 33 |
| CpuCoreUtilization | ONE_DAY · where Place=137768115850394 | 5 |
| CpuCoreUtilization | ONE_DAY · where Place=137768115850394 | 5 |
| CpuTimeAvg | ONE_DAY · where Place=137768115850394 | 5 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=137768115850394 | 25 |
| CpuTimeAvg | ONE_DAY · where Place=137768115850394 | 5 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=137768115850394 | 25 |
| DailyActiveUsers | ONE_DAY · by Locale | 7401 |
| DailyActiveUsers | ONE_DAY · by Country | 20000 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 1300 |
| DailyActiveUsers | ONE_DAY · by Gender | 558 |
| DailyActiveUsers | ONE_DAY | 190 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 190 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 189 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 1099 |
| DailyActiveUsers | ONE_DAY · by Platform | 831 |
| DailyActiveUsers | — | 197 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 911 |
| DailyActiveUsers | NONE · by AcquisitionSource · where IsNewUser=New | 5 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 189 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 190 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 1099 |
| DailyRevenue | ONE_DAY · by RevenueSource | 716 |
| DailyRevenue | ONE_DAY | 190 |
| DailyRevenue | ONE_DAY · by BalanceType | 240 |
| DailyRevenue | — | 197 |
| DauMauStickiness | ONE_DAY | 190 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 5 |
| EndToEndCVR | ONE_DAY | 190 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 5 |
| ErrorCount | ONE_DAY | 29 |
| ErrorCount | ONE_DAY | 29 |
| ErrorCount | ONE_DAY | 3 |
| ErrorCount | ONE_DAY · by LogSource | 58 |
| ErrorCount | ONE_DAY · by LogSource | 6 |
| ErrorCount | ONE_DAY · by LogSource | 58 |
| ErrorCount | ONE_DAY · where Place=137768115850394 | 29 |
| ErrorCount | ONE_DAY · where Place=137768115850394 | 29 |
| ErrorCount | ONE_DAY · where Place=137768115850394 | 3 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=137768115850394 | 500 |
| ErrorCount | ONE_DAY · by LogSource · where Place=137768115850394 | 58 |
| ErrorCount | ONE_DAY · by LogSource · where Place=137768115850394 | 58 |
| ErrorCount | HALF_HOUR · where Place=137768115850394 | 44 |
| ErrorCount | ONE_DAY · by LogSource · where Place=137768115850394 | 6 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=137768115850394 | 88 |
| ErrorCount | NONE · where Place=137768115850394,FirstSeenPlaceVersion=1256 | 1 |
| ErrorCount | ONE_DAY · where Place=137768115850394 | 29 |
| ErrorCount | ONE_DAY · where Place=137768115850394 | 3 |
| ErrorCount | ONE_DAY · where Place=137768115850394 | 29 |
| ErrorCount | ONE_DAY · by LogSource · where Place=137768115850394 | 58 |
| ErrorCount | ONE_DAY · by LogSource · where Place=137768115850394 | 58 |
| ErrorCount | ONE_DAY · by LogSource · where Place=137768115850394 | 6 |
| ErrorCount | HALF_HOUR · where Place=137768115850394 | 44 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=137768115850394 | 500 |
| ErrorCount | NONE · where Place=137768115850394,FirstSeenPlaceVersion=1256/1194/1246/1251/1195/1248/1197/1249/1189 | 1 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=137768115850394 | 88 |
| EventAvgDailyActiveUsers | ONE_DAY | 180 |
| EventAvgDailyRevenue | ONE_DAY | 180 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 180 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 180 |
| ForwardD1Retention | ONE_DAY | 192 |
| ForwardD1Retention | ONE_DAY · by Platform | 890 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 1128 |
| ForwardD1Retention | — | 392 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 915 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 1128 |
| ForwardD30Retention | ONE_DAY | 167 |
| ForwardD30Retention | — | 334 |
| ForwardD7Retention | ONE_DAY | 189 |
| ForwardD7Retention | ONE_DAY · by Platform | 890 |
| ForwardD7Retention | — | 380 |
| ItemMonetizationRevenue | ONE_HOUR · by ProductType | 786 |
| L7AveragePlayTimeMinutesPerDAU | — | 394 |
| MemoryUsageAvg | ONE_DAY · where Place=137768115850394 | 6 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=137768115850394 | 29 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=137768115850394 | 8 |
| MemoryUsageAvg | ONE_DAY · where Place=137768115850394 | 6 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=137768115850394 | 29 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=137768115850394 | 8 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 1300 |
| MonthlyActiveUsers | ONE_DAY · by Locale | 7401 |
| MonthlyActiveUsers | ONE_DAY · by Country | 20000 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 558 |
| MonthlyActiveUsers | ONE_DAY | 190 |
| MonthlyActiveUsers | — | 197 |
| OomUnexpectedExits | ONE_DAY · where Place=137768115850394 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=137768115850394 | 6 |
| OomUnexpectedExits | ONE_DAY · where Place=137768115850394 | 7 |
| OomUnexpectedExits | ONE_DAY · where Place=137768115850394 | 4 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=137768115850394 | 15 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=137768115850394 | 10 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=137768115850394 | 13 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=137768115850394 | 7 |
| OomUnexpectedExits | ONE_DAY · where Place=137768115850394 | 6 |
| OomUnexpectedExits | ONE_DAY · where Place=137768115850394 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=137768115850394 | 7 |
| OomUnexpectedExits | ONE_DAY · where Place=137768115850394 | 4 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=137768115850394 | 10 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=137768115850394 | 15 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=137768115850394 | 13 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=137768115850394 | 7 |
| PayingUsers | ONE_DAY | 190 |
| PayingUsers | — | 197 |
| PayingUsersCVR | ONE_DAY | 190 |
| PayingUsersCVR | ONE_DAY · by Platform | 833 |
| PayingUsersCVR | — | 394 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=137768115850394 | 33 |
| PeakConcurrentPlayers | ONE_DAY · where Place=137768115850394 | 7 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=137768115850394 | 45 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=137768115850394 | 33 |
| PeakConcurrentPlayers | ONE_DAY · where Place=137768115850394 | 7 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=137768115850394 | 45 |
| PlayerFeedbackVotesCount | ONE_DAY | 180 |
| PotentialExtraEarningsTotalUsd | NONE | 1 |
| RFYD1CoplayDays | ONE_DAY | 119 |
| RFYD1Playtime | ONE_DAY | 119 |
| RFYD1QualifiedPlaySessions | ONE_DAY | 119 |
| RFYD1RobuxSpend | ONE_DAY | 119 |
| RFYD1SpendDay | ONE_DAY | 119 |
| RFYD2To7CoplayDays | ONE_DAY | 119 |
| RFYD2To7PlayDays | ONE_DAY | 119 |
| RFYD2To7Playtime | ONE_DAY | 119 |
| RFYD2To7QualifiedPlaySessions | ONE_DAY | 119 |
| RFYD2To7RobuxSpend | ONE_DAY | 119 |
| RFYD2To7SpendDays | ONE_DAY | 119 |
| RFYD8To28CoplayDays | ONE_DAY | 124 |
| RFYD8To28PlayDays | ONE_DAY | 124 |
| RFYD8To28Playtime | ONE_DAY | 124 |
| RFYD8To28QualifiedPlaySessions | ONE_DAY | 124 |
| RFYD8To28RobuxSpend | ONE_DAY | 124 |
| RFYD8To28SpendDays | ONE_DAY | 124 |
| RFYDuration0To60 | ONE_DAY | 119 |
| RFYDuration61To180 | ONE_DAY | 119 |
| RFYL7PlayDays | ONE_DAY | 175 |
| RFYL7PlayDays | — | 394 |
| RFYPlayThroughRate | ONE_DAY | 125 |
| RFYQualifiedPTR | ONE_DAY | 181 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | ONE_DAY | 181 |
| RSVPCount | ONE_DAY | 180 |
| ServerFrameRateP10 | ONE_DAY · where Place=137768115850394 | 7 |
| ServerFrameRateP10 | ONE_DAY · where Place=137768115850394 | 7 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=137768115850394 | 7 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=137768115850394 | 34 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=137768115850394 | 7 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=137768115850394 | 34 |
| TotalPlayTimeHours | ONE_DAY | 190 |
| TotalPlayTimeHours | — | 197 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 187 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 1050 |
| UniqueUsersWithImpressions | ONE_DAY | 190 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 860 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 187 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 187 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation | 180 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 860 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 8 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 798 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 189 |
| UniqueUsersWithPlaySessions | ONE_DAY | 189 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 8 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 798 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 189 |
| UsersJoinedFromNotifications | ONE_DAY | 180 |
| Visits | ONE_DAY | 190 |
| Visits | ONE_DAY · by Platform | 831 |
| Visits | — | 197 |
