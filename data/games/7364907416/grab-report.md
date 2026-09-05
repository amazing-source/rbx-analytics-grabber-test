# Grab report — universe 7364907416

- Window: **2025-03-11 → 2026-09-05**
- Plan source: seed+learned
- Discovered dimension values: **__places**: 115469775440792 · **FunnelName**: FUNNEL_TYPE_ONBOARDING, TheHatch_Funnel · **PlaceVersion**: 346, 352, 353, 358, 365 · **Place**: 115469775440792 · **FirstSeenPlaceVersion**: 301, 308, 352, 323, 318, 353, 346, 358, 336, 365, 89
- Requested 415 · **293 returned data** · 30 empty · 102 failed — of which 60 aged out (data Roblox no longer stores) and **24 on observed/proven shapes (look here first)**

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
| FunnelCohortSessionCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING/TheHatch_Funnel | 500 | observed | — |
| FunnelCohortCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING/TheHatch_Funnel | 500 | observed | — |
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
| FunnelUserChurnRate | metric | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 400 | yes | — |
| FunnelUserStepCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 400 | yes | — |
| FunnelUserOverallCompletionRate | metric | ONE_DAY · where FunnelName=FUNNEL_TYPE_ONBOARDING | 400 | yes | — |
| FunnelUserTotalCount | metric | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 400 | yes | — |
| FunnelCohortCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 500 | yes | — |
| FunnelCohortSessionCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 500 | yes | — |
| FunnelUserChurnRate | metric | ONE_DAY · by FunnelStep · where FunnelName=TheHatch_Funnel | 400 | yes | — |
| FunnelUserStepCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=TheHatch_Funnel | 400 | yes | — |
| FunnelUserOverallCompletionRate | metric | ONE_DAY · where FunnelName=TheHatch_Funnel | 400 | yes | — |
| FunnelUserTotalCount | metric | ONE_DAY · by FunnelStep · where FunnelName=TheHatch_Funnel | 400 | yes | — |
| — | metadata | — | 404 | **no** | — |

## Returned 200 but no data points

**The query was valid and matched nothing.** That is NOT evidence the feature is unused — the most common cause is a filter value that doesn't exist on this universe (e.g. a hardcoded `FunnelName` that belongs to a different game). Verify against the dashboard before concluding anything from a row here.

| Metric | Shape |
|---|---|
| — | by CustomField2 |
| — | by CustomField3 |
| — | — |
| — | — |
| — | — |
| — | — |
| — | — |
| — | — |
| annotation:CREATOR_REGEX_CHANGE | — |
| ServerCrashCount | ONE_DAY · where Place=115469775440792 |
| ServerCrashCount | ONE_DAY · where Place=115469775440792 |
| ServerCrashCount | ONE_DAY · where Place=115469775440792 |
| ServerCrashCount | ONE_DAY · where Place=115469775440792 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=115469775440792 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=115469775440792 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=115469775440792 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=115469775440792 |
| ServerCrashCount | HALF_HOUR · where Place=115469775440792 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=115469775440792 |
| DauMauStickiness | — |
| ServerCrashCount | ONE_DAY · where Place=115469775440792 |
| ServerCrashCount | ONE_DAY · where Place=115469775440792 |
| ServerCrashCount | ONE_DAY · where Place=115469775440792 |
| ServerCrashCount | ONE_DAY · where Place=115469775440792 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=115469775440792 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=115469775440792 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=115469775440792 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=115469775440792 |
| ServerCrashCount | HALF_HOUR · where Place=115469775440792 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=115469775440792 |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| — | — | 1 |
| — | by FunnelName | 2 |
| — | by PlaceVersion | 5 |
| — | by Place | 1 |
| — | by FirstSeenPlaceVersion | 11 |
| — | — | 12 |
| — | — | 1 |
| — | — | 696 |
| — | — | 1 |
| — | — | 100 |
| annotation:ENGINE_RELEASE | — | 124 |
| annotation:EXPERIENCE_EVENT_STATE | — | 26 |
| annotation:FUNNEL | — | 111 |
| annotation:PLACE_ICON | — | 20 |
| annotation:PLACE_THUMBNAIL | — | 47 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DRobuxPerUser | ONE_DAY | 511 |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPayerConversionRatio | ONE_DAY | 534 |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPlaytimePerUserInMinutes | ONE_DAY | 534 |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DRobuxPerUser | ONE_DAY | 534 |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| AttributionD1RetentionRatio | ONE_DAY | 536 |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| AttributionD7RetentionRatio | ONE_DAY | 533 |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| AveragePlayTimeMinutesPerDAU | ONE_DAY | 538 |
| AveragePlayTimeMinutesPerDAU | — | 1000 |
| AverageRevenuePerPayingUser | ONE_DAY | 538 |
| AverageRevenuePerPayingUser | — | 1000 |
| AverageRevenuePerUser | ONE_DAY | 538 |
| AverageRevenuePerUser | — | 1000 |
| AverageSessionLengthMinutes | ONE_DAY | 538 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 538 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 537 |
| AverageSessionLengthMinutes | ONE_DAY · by Platform | 2888 |
| AverageSessionLengthMinutes | — | 1000 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 538 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 537 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=115469775440792 | 30 |
| ClientCpuTimeAvg | ONE_DAY · where Place=115469775440792 | 6 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=115469775440792 | 30 |
| ClientCpuTimeAvg | ONE_DAY · where Place=115469775440792 | 6 |
| ClientCrashCount | ONE_DAY · where Place=115469775440792 | 8 |
| ClientCrashCount | ONE_DAY · where Place=115469775440792 | 8 |
| ClientCrashCount | ONE_DAY · where Place=115469775440792 | 8 |
| ClientCrashCount | ONE_DAY · where Place=115469775440792 | 4 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=115469775440792 | 40 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=115469775440792 | 37 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=115469775440792 | 37 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=115469775440792 | 15 |
| ClientCrashCount | ONE_DAY · where Place=115469775440792 | 8 |
| ClientCrashCount | ONE_DAY · where Place=115469775440792 | 8 |
| ClientCrashCount | ONE_DAY · where Place=115469775440792 | 8 |
| ClientCrashCount | ONE_DAY · where Place=115469775440792 | 4 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=115469775440792 | 40 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=115469775440792 | 37 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=115469775440792 | 37 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=115469775440792 | 15 |
| ClientCrashRate15m | ONE_DAY · where Place=115469775440792 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=115469775440792 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=115469775440792 | 4 |
| ClientCrashRate15m | ONE_DAY · where Place=115469775440792 | 8 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=115469775440792 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=115469775440792 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=115469775440792 | 22 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=115469775440792 | 46 |
| ClientCrashRate15m | ONE_DAY · where Place=115469775440792 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=115469775440792 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=115469775440792 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=115469775440792 | 4 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=115469775440792 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=115469775440792 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=115469775440792 | 46 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=115469775440792 | 22 |
| ClientFpsAvg | ONE_DAY · where Place=115469775440792 | 7 |
| ClientFpsAvg | ONE_DAY · where Place=115469775440792 | 7 |
| ClientFpsP10 | ONE_DAY · where Place=115469775440792 | 7 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=115469775440792 | 41 |
| ClientFpsP10 | ONE_DAY · where Place=115469775440792 | 7 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=115469775440792 | 41 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=115469775440792 | 7 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=115469775440792 | 41 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=115469775440792 | 7 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=115469775440792 | 41 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=115469775440792 | 7 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=115469775440792 | 41 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=115469775440792 | 7 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=115469775440792 | 41 |
| CpuCoreUtilization | ONE_DAY · where Place=115469775440792 | 5 |
| CpuCoreUtilization | ONE_DAY · where Place=115469775440792 | 5 |
| CpuTimeAvg | ONE_DAY · where Place=115469775440792 | 5 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=115469775440792 | 25 |
| CpuTimeAvg | ONE_DAY · where Place=115469775440792 | 5 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=115469775440792 | 25 |
| DailyActiveUsers | ONE_DAY · by Locale | 20000 |
| DailyActiveUsers | ONE_DAY · by Country | 20000 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 3248 |
| DailyActiveUsers | ONE_DAY · by Gender | 1614 |
| DailyActiveUsers | ONE_DAY | 538 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 538 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 537 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 2302 |
| DailyActiveUsers | ONE_DAY · by Platform | 2888 |
| DailyActiveUsers | — | 500 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 1949 |
| DailyActiveUsers | NONE · by AcquisitionSource · where IsNewUser=New | 5 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 537 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 538 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 2302 |
| DailyRevenue | ONE_DAY | 538 |
| DailyRevenue | ONE_DAY · by RevenueSource | 1668 |
| DailyRevenue | ONE_DAY · by BalanceType | 618 |
| DailyRevenue | — | 500 |
| DauMauStickiness | ONE_DAY | 538 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 5 |
| EndToEndCVR | ONE_DAY | 537 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 5 |
| ErrorCount | ONE_DAY | 29 |
| ErrorCount | ONE_DAY | 29 |
| ErrorCount | ONE_DAY | 3 |
| ErrorCount | ONE_DAY · by LogSource | 58 |
| ErrorCount | ONE_DAY · by LogSource | 58 |
| ErrorCount | ONE_DAY · by LogSource | 6 |
| ErrorCount | ONE_DAY · where Place=115469775440792 | 29 |
| ErrorCount | ONE_DAY · where Place=115469775440792 | 29 |
| ErrorCount | ONE_DAY · where Place=115469775440792 | 3 |
| ErrorCount | ONE_DAY · by LogSource · where Place=115469775440792 | 58 |
| ErrorCount | ONE_DAY · by LogSource · where Place=115469775440792 | 58 |
| ErrorCount | ONE_DAY · by LogSource · where Place=115469775440792 | 6 |
| ErrorCount | NONE · where Place=115469775440792,FirstSeenPlaceVersion=365 | 1 |
| ErrorCount | HALF_HOUR · where Place=115469775440792 | 28 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=115469775440792 | 56 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=115469775440792 | 500 |
| ErrorCount | ONE_DAY · where Place=115469775440792 | 29 |
| ErrorCount | ONE_DAY · where Place=115469775440792 | 3 |
| ErrorCount | ONE_DAY · where Place=115469775440792 | 29 |
| ErrorCount | ONE_DAY · by LogSource · where Place=115469775440792 | 58 |
| ErrorCount | ONE_DAY · by LogSource · where Place=115469775440792 | 58 |
| ErrorCount | ONE_DAY · by LogSource · where Place=115469775440792 | 6 |
| ErrorCount | HALF_HOUR · where Place=115469775440792 | 28 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=115469775440792 | 500 |
| ErrorCount | NONE · where Place=115469775440792,FirstSeenPlaceVersion=301/308/352/323/318/353/346/358/336/365/89 | 1 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=115469775440792 | 56 |
| EventAvgDailyActiveUsers | ONE_DAY | 350 |
| EventAvgDailyRevenue | ONE_DAY | 350 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 350 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 350 |
| ForwardD1Retention | ONE_DAY | 537 |
| ForwardD1Retention | ONE_DAY · by Platform | 2933 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 2503 |
| ForwardD1Retention | — | 1000 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 2111 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 2509 |
| ForwardD30Retention | ONE_DAY | 511 |
| ForwardD30Retention | — | 1000 |
| ForwardD7Retention | ONE_DAY | 534 |
| ForwardD7Retention | ONE_DAY · by Platform | 2914 |
| ForwardD7Retention | — | 1000 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=TheHatch_Funnel | 42 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=TheHatch_Funnel | 42 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 48 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=TheHatch_Funnel | 3 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING/TheHatch_Funnel | 48 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 48 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=TheHatch_Funnel | 3 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING/TheHatch_Funnel | 48 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=TheHatch_Funnel | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING/TheHatch_Funnel | 1 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 48 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=TheHatch_Funnel | 3 |
| FunnelStepTotalCount | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING/TheHatch_Funnel | 1 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING/TheHatch_Funnel | 48 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 48 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=TheHatch_Funnel | 3 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING/TheHatch_Funnel | 48 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=TheHatch_Funnel | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING/TheHatch_Funnel | 1 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 48 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=TheHatch_Funnel | 3 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING/TheHatch_Funnel | 48 |
| FunnelUserTotalCount | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 65 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=TheHatch_Funnel | 3 |
| FunnelUserTotalCount | NONE · where FunnelName=TheHatch_Funnel | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING/TheHatch_Funnel | 48 |
| FunnelUserTotalCount | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING/TheHatch_Funnel | 1 |
| L7AveragePlayTimeMinutesPerDAU | — | 776 |
| MemoryUsageAvg | ONE_DAY · where Place=115469775440792 | 6 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=115469775440792 | 30 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=115469775440792 | 9 |
| MemoryUsageAvg | ONE_DAY · where Place=115469775440792 | 6 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=115469775440792 | 30 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=115469775440792 | 9 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 3241 |
| MonthlyActiveUsers | ONE_DAY · by Locale | 19980 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 1611 |
| MonthlyActiveUsers | — | 500 |
| OomUnexpectedExits | ONE_DAY · where Place=115469775440792 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=115469775440792 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=115469775440792 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=115469775440792 | 4 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=115469775440792 | 19 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=115469775440792 | 16 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=115469775440792 | 24 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=115469775440792 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=115469775440792 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=115469775440792 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=115469775440792 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=115469775440792 | 4 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=115469775440792 | 19 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=115469775440792 | 16 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=115469775440792 | 24 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=115469775440792 | 8 |
| PayingUsers | ONE_DAY | 538 |
| PayingUsers | — | 500 |
| PayingUsersCVR | ONE_DAY | 538 |
| PayingUsersCVR | ONE_DAY · by Platform | 2889 |
| PayingUsersCVR | — | 1000 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=115469775440792 | 41 |
| PeakConcurrentPlayers | ONE_DAY · where Place=115469775440792 | 7 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=115469775440792 | 29 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=115469775440792 | 41 |
| PeakConcurrentPlayers | ONE_DAY · where Place=115469775440792 | 7 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=115469775440792 | 29 |
| PlayerFeedbackVotesCount | ONE_DAY | 538 |
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
| RFYL7PlayDays | ONE_DAY | 528 |
| RFYL7PlayDays | — | 1000 |
| RFYPlayThroughRate | ONE_DAY | 126 |
| RFYQualifiedPTR | ONE_DAY | 536 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | ONE_DAY | 215 |
| RSVPCount | ONE_DAY | 350 |
| ServerFrameRateP10 | ONE_DAY · where Place=115469775440792 | 7 |
| ServerFrameRateP10 | ONE_DAY · where Place=115469775440792 | 7 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=115469775440792 | 7 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=115469775440792 | 42 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=115469775440792 | 7 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=115469775440792 | 42 |
| TotalPlayTimeHours | ONE_DAY | 538 |
| TotalPlayTimeHours | — | 500 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 537 |
| UniqueUsersWithImpressions | ONE_DAY | 537 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 3108 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 2562 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 537 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 537 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation | 535 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 2562 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 8 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 2390 |
| UniqueUsersWithPlaySessions | ONE_DAY | 537 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 537 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 2390 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 8 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 537 |
| UsersJoinedFromNotifications | ONE_DAY | 350 |
| Visits | ONE_DAY | 538 |
| Visits | ONE_DAY · by Platform | 2888 |
| Visits | — | 500 |
