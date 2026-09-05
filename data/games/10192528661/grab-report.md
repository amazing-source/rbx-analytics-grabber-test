# Grab report — universe 10192528661

- Window: **2026-05-19 → 2026-09-04**
- Plan source: seed+learned
- Discovered dimension values: **__places**: 71469476498100 · **FunnelName**: FUNNEL_TYPE_ONBOARDING · **PlaceVersion**: 24, 27, 28 · **Place**: 71469476498100 · **FirstSeenPlaceVersion**: 3, 20, 17, 27, 28, 23, 19, 15, 24
- Requested 401 · **283 returned data** · 33 empty · 95 failed — of which 60 aged out (data Roblox no longer stores) and **23 on observed/proven shapes (look here first)**

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
| DailyCohortRetention | metric | ONE_DAY · by CohortDay | 400 | observed | — |
| L7AverageForwardD1Retention | metric | ONE_DAY | 400 | observed | — |
| L7AveragePlayTimeMinutesPerDAU | metric | ONE_DAY | 400 | observed | — |
| L7AverageDailyActiveUsers | metric | ONE_DAY | 400 | observed | — |
| L7AverageDailyRevenue | metric | ONE_DAY | 400 | observed | — |
| L7AverageDailyActiveUsers | benchmark | — | 404 | observed | — |
| L7AverageDailyRevenue | benchmark | — | 404 | observed | — |
| ItemTotalCreatorEarning | metric | NONE · by AvatarItemId+AvatarItemTargetType | 403 | observed | — |
| ItemTotalTransactionCount | metric | NONE · by AvatarItemId+AvatarItemTargetType | 403 | observed | — |
| L7AverageForwardD1Retention | metric | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Others/Friends/Search | 400 | observed | — |
| L7AverageUniqueUsersWithPlaySessions | metric | ONE_DAY · where IsNewUser=New | 400 | observed | — |
| L7AverageUniqueUsersWithPlaySessions | metric | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 400 | observed | — |
| L7AverageForwardD1Retention | metric | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 400 | observed | — |
| PeakConcurrentPlayers | metric | ONE_HOUR | 400 | observed | — |
| ConcurrentPlayers | metric | ONE_HOUR | 400 | observed | — |
| ClientCrashRate15m | metric | ONE_HOUR | 400 | observed | — |
| ClientFpsAvg | metric | ONE_HOUR | 400 | observed | — |
| MemoryUsageAvg | metric | ONE_HOUR | 400 | observed | — |
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
| FunnelUserChurnRate | metric | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 400 | yes | — |
| FunnelUserStepCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 400 | yes | — |
| FunnelUserOverallCompletionRate | metric | ONE_DAY · where FunnelName=FUNNEL_TYPE_ONBOARDING | 400 | yes | — |
| FunnelUserTotalCount | metric | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 400 | yes | — |
| — | metadata | — | 404 | **no** | — |

## Returned 200 but no data points

**The query was valid and matched nothing.** That is NOT evidence the feature is unused — the most common cause is a filter value that doesn't exist on this universe (e.g. a hardcoded `FunnelName` that belongs to a different game). Verify against the dashboard before concluding anything from a row here.

| Metric | Shape |
|---|---|
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
| ServerCrashCount | ONE_DAY · where Place=71469476498100 |
| ServerCrashCount | ONE_DAY · where Place=71469476498100 |
| ServerCrashCount | ONE_DAY · where Place=71469476498100 |
| ServerCrashCount | ONE_DAY · where Place=71469476498100 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=71469476498100 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=71469476498100 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=71469476498100 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=71469476498100 |
| ServerCrashCount | HALF_HOUR · where Place=71469476498100 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=71469476498100 |
| DauMauStickiness | — |
| ServerCrashCount | ONE_DAY · where Place=71469476498100 |
| ServerCrashCount | ONE_DAY · where Place=71469476498100 |
| ServerCrashCount | ONE_DAY · where Place=71469476498100 |
| ServerCrashCount | ONE_DAY · where Place=71469476498100 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=71469476498100 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=71469476498100 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=71469476498100 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=71469476498100 |
| ServerCrashCount | HALF_HOUR · where Place=71469476498100 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=71469476498100 |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| — | — | 1 |
| — | by FunnelName | 1 |
| — | by PlaceVersion | 3 |
| — | by Place | 1 |
| — | by FirstSeenPlaceVersion | 9 |
| — | — | 17 |
| — | — | 28 |
| — | — | 1 |
| annotation:ENGINE_RELEASE | — | 67 |
| annotation:EXPERIENCE_EVENT_STATE | — | 10 |
| annotation:PLACE_ICON | — | 2 |
| annotation:PLACE_THUMBNAIL | — | 11 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DRobuxPerUser | ONE_DAY | 78 |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPayerConversionRatio | ONE_DAY | 101 |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPlaytimePerUserInMinutes | ONE_DAY | 101 |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DRobuxPerUser | ONE_DAY | 101 |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| AttributionD1RetentionRatio | ONE_DAY | 101 |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| AttributionD7RetentionRatio | ONE_DAY | 100 |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| AveragePlayTimeMinutesPerDAU | ONE_DAY | 101 |
| AveragePlayTimeMinutesPerDAU | — | 214 |
| AverageRevenuePerPayingUser | ONE_DAY | 101 |
| AverageRevenuePerPayingUser | — | 214 |
| AverageRevenuePerUser | ONE_DAY | 101 |
| AverageRevenuePerUser | — | 214 |
| AverageSessionLengthMinutes | ONE_DAY | 101 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 101 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 100 |
| AverageSessionLengthMinutes | ONE_DAY · by Platform | 511 |
| AverageSessionLengthMinutes | — | 214 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 101 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 100 |
| ClientCpuTimeAvg | ONE_DAY · where Place=71469476498100 | 6 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=71469476498100 | 30 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=71469476498100 | 30 |
| ClientCpuTimeAvg | ONE_DAY · where Place=71469476498100 | 6 |
| ClientCrashCount | ONE_DAY · where Place=71469476498100 | 8 |
| ClientCrashCount | ONE_DAY · where Place=71469476498100 | 8 |
| ClientCrashCount | ONE_DAY · where Place=71469476498100 | 8 |
| ClientCrashCount | ONE_DAY · where Place=71469476498100 | 4 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=71469476498100 | 32 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=71469476498100 | 32 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=71469476498100 | 34 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=71469476498100 | 16 |
| ClientCrashCount | ONE_DAY · where Place=71469476498100 | 8 |
| ClientCrashCount | ONE_DAY · where Place=71469476498100 | 8 |
| ClientCrashCount | ONE_DAY · where Place=71469476498100 | 8 |
| ClientCrashCount | ONE_DAY · where Place=71469476498100 | 4 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=71469476498100 | 32 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=71469476498100 | 32 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=71469476498100 | 16 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=71469476498100 | 34 |
| ClientCrashRate15m | ONE_DAY · where Place=71469476498100 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=71469476498100 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=71469476498100 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=71469476498100 | 4 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=71469476498100 | 41 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=71469476498100 | 40 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=71469476498100 | 42 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=71469476498100 | 21 |
| ClientCrashRate15m | ONE_DAY · where Place=71469476498100 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=71469476498100 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=71469476498100 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=71469476498100 | 4 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=71469476498100 | 41 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=71469476498100 | 40 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=71469476498100 | 42 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=71469476498100 | 21 |
| ClientFpsAvg | ONE_DAY · where Place=71469476498100 | 7 |
| ClientFpsAvg | ONE_DAY · where Place=71469476498100 | 7 |
| ClientFpsP10 | ONE_DAY · where Place=71469476498100 | 7 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=71469476498100 | 40 |
| ClientFpsP10 | ONE_DAY · where Place=71469476498100 | 7 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=71469476498100 | 40 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=71469476498100 | 7 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=71469476498100 | 40 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=71469476498100 | 7 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=71469476498100 | 40 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=71469476498100 | 7 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=71469476498100 | 40 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=71469476498100 | 7 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=71469476498100 | 40 |
| CpuCoreUtilization | ONE_DAY · where Place=71469476498100 | 5 |
| CpuCoreUtilization | ONE_DAY · where Place=71469476498100 | 5 |
| CpuTimeAvg | ONE_DAY · where Place=71469476498100 | 5 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=71469476498100 | 25 |
| CpuTimeAvg | ONE_DAY · where Place=71469476498100 | 5 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=71469476498100 | 25 |
| DailyActiveUsers | ONE_DAY · by Locale | 4216 |
| DailyActiveUsers | ONE_DAY · by Country | 15022 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 707 |
| DailyActiveUsers | ONE_DAY · by Gender | 303 |
| DailyActiveUsers | ONE_DAY | 101 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 100 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 101 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 540 |
| DailyActiveUsers | ONE_DAY · by Platform | 511 |
| DailyActiveUsers | — | 107 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 436 |
| DailyActiveUsers | NONE · by AcquisitionSource · where IsNewUser=New | 5 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 100 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 101 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 540 |
| DailyRevenue | ONE_DAY | 101 |
| DailyRevenue | ONE_DAY · by RevenueSource | 331 |
| DailyRevenue | ONE_DAY · by BalanceType | 184 |
| DailyRevenue | — | 107 |
| DauMauStickiness | ONE_DAY | 101 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 5 |
| EndToEndCVR | ONE_DAY | 100 |
| ErrorCount | ONE_DAY | 29 |
| ErrorCount | ONE_DAY | 29 |
| ErrorCount | ONE_DAY | 3 |
| ErrorCount | ONE_DAY · by LogSource | 58 |
| ErrorCount | ONE_DAY · by LogSource | 58 |
| ErrorCount | ONE_DAY · by LogSource | 6 |
| ErrorCount | ONE_DAY · where Place=71469476498100 | 29 |
| ErrorCount | ONE_DAY · where Place=71469476498100 | 29 |
| ErrorCount | ONE_DAY · where Place=71469476498100 | 3 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=71469476498100 | 500 |
| ErrorCount | ONE_DAY · by LogSource · where Place=71469476498100 | 58 |
| ErrorCount | ONE_DAY · by LogSource · where Place=71469476498100 | 58 |
| ErrorCount | ONE_DAY · by LogSource · where Place=71469476498100 | 6 |
| ErrorCount | NONE · where Place=71469476498100,FirstSeenPlaceVersion=28 | 1 |
| ErrorCount | HALF_HOUR · where Place=71469476498100 | 44 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=71469476498100 | 88 |
| ErrorCount | ONE_DAY · where Place=71469476498100 | 29 |
| ErrorCount | ONE_DAY · where Place=71469476498100 | 3 |
| ErrorCount | ONE_DAY · where Place=71469476498100 | 29 |
| ErrorCount | ONE_DAY · by LogSource · where Place=71469476498100 | 58 |
| ErrorCount | ONE_DAY · by LogSource · where Place=71469476498100 | 58 |
| ErrorCount | ONE_DAY · by LogSource · where Place=71469476498100 | 6 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=71469476498100 | 500 |
| ErrorCount | HALF_HOUR · where Place=71469476498100 | 44 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=71469476498100 | 88 |
| ErrorCount | NONE · where Place=71469476498100,FirstSeenPlaceVersion=3/20/17/27/28/23/19/15/24 | 1 |
| EventAvgDailyActiveUsers | ONE_DAY | 76 |
| EventAvgDailyRevenue | ONE_DAY | 76 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 76 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 76 |
| ForwardD1Retention | ONE_DAY | 101 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 554 |
| ForwardD1Retention | ONE_DAY · by Platform | 542 |
| ForwardD1Retention | — | 212 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 448 |
| ForwardD30Retention | ONE_DAY | 77 |
| ForwardD30Retention | — | 154 |
| ForwardD7Retention | ONE_DAY | 100 |
| ForwardD7Retention | ONE_DAY · by Platform | 540 |
| ForwardD7Retention | — | 200 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 510 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 510 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 510 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 510 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 5 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 5 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 5 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 5 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 5 |
| FunnelStepTotalCount | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 5 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 5 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 5 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 5 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 5 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 5 |
| FunnelUserTotalCount | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 5 |
| FunnelUserTotalCount | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| ItemMonetizationRevenue | ONE_HOUR · by ProductType | 691 |
| ItemMonetizationRevenue | ONE_HOUR | 280 |
| L7AveragePlayTimeMinutesPerDAU | — | 214 |
| MemoryUsageAvg | ONE_DAY · where Place=71469476498100 | 6 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=71469476498100 | 30 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=71469476498100 | 9 |
| MemoryUsageAvg | ONE_DAY · where Place=71469476498100 | 6 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=71469476498100 | 30 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=71469476498100 | 9 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 707 |
| MonthlyActiveUsers | ONE_DAY · by Locale | 4216 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 303 |
| MonthlyActiveUsers | ONE_DAY · by Country | 15022 |
| MonthlyActiveUsers | ONE_DAY | 101 |
| MonthlyActiveUsers | — | 107 |
| OomUnexpectedExits | ONE_DAY · where Place=71469476498100 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=71469476498100 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=71469476498100 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=71469476498100 | 4 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=71469476498100 | 24 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=71469476498100 | 24 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=71469476498100 | 19 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=71469476498100 | 9 |
| OomUnexpectedExits | ONE_DAY · where Place=71469476498100 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=71469476498100 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=71469476498100 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=71469476498100 | 4 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=71469476498100 | 24 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=71469476498100 | 24 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=71469476498100 | 19 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=71469476498100 | 9 |
| PayingUsers | ONE_DAY | 101 |
| PayingUsers | — | 107 |
| PayingUsersCVR | ONE_DAY · by Platform | 511 |
| PayingUsersCVR | ONE_DAY | 101 |
| PayingUsersCVR | — | 214 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=71469476498100 | 40 |
| PeakConcurrentPlayers | ONE_DAY · where Place=71469476498100 | 7 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=71469476498100 | 45 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=71469476498100 | 40 |
| PeakConcurrentPlayers | ONE_DAY · where Place=71469476498100 | 7 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=71469476498100 | 45 |
| PlayerFeedbackVotesCount | ONE_DAY | 99 |
| PotentialExtraEarningsTotalUsd | NONE | 1 |
| RFYD1CoplayDays | ONE_DAY | 91 |
| RFYD1Playtime | ONE_DAY | 97 |
| RFYD1QualifiedPlaySessions | ONE_DAY | 97 |
| RFYD1RobuxSpend | ONE_DAY | 97 |
| RFYD1SpendDay | ONE_DAY | 97 |
| RFYD2To7CoplayDays | ONE_DAY | 91 |
| RFYD2To7PlayDays | ONE_DAY | 91 |
| RFYD2To7Playtime | ONE_DAY | 91 |
| RFYD2To7QualifiedPlaySessions | ONE_DAY | 91 |
| RFYD2To7RobuxSpend | ONE_DAY | 91 |
| RFYD2To7SpendDays | ONE_DAY | 91 |
| RFYD8To28CoplayDays | ONE_DAY | 70 |
| RFYD8To28PlayDays | ONE_DAY | 70 |
| RFYD8To28Playtime | ONE_DAY | 70 |
| RFYD8To28QualifiedPlaySessions | ONE_DAY | 70 |
| RFYD8To28RobuxSpend | ONE_DAY | 70 |
| RFYD8To28SpendDays | ONE_DAY | 70 |
| RFYDuration0To60 | ONE_DAY | 97 |
| RFYDuration61To180 | ONE_DAY | 97 |
| RFYL7PlayDays | ONE_DAY | 97 |
| RFYL7PlayDays | — | 214 |
| RFYPlayThroughRate | ONE_DAY | 97 |
| RFYQualifiedPTR | ONE_DAY | 97 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | ONE_DAY | 97 |
| RSVPCount | ONE_DAY | 76 |
| ServerFrameRateP10 | ONE_DAY · where Place=71469476498100 | 7 |
| ServerFrameRateP10 | ONE_DAY · where Place=71469476498100 | 7 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=71469476498100 | 7 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=71469476498100 | 40 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=71469476498100 | 7 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=71469476498100 | 40 |
| TotalPlayTimeHours | ONE_DAY | 101 |
| TotalPlayTimeHours | — | 107 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 100 |
| UniqueUsersWithImpressions | ONE_DAY | 100 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 563 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 461 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 100 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 100 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation | 96 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 423 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 8 |
| UniqueUsersWithPlaySessions | ONE_DAY | 100 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 100 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 423 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 100 |
| UsersJoinedFromNotifications | ONE_DAY | 76 |
| Visits | ONE_DAY | 101 |
| Visits | ONE_DAY · by Platform | 511 |
| Visits | — | 107 |
