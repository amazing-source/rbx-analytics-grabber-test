# Grab report — universe 10565445771

- Window: **2026-08-15 → 2026-09-12**
- Plan source: seed
- Discovered dimension values: **__places**: 74542317333958 · **CustomField1**: Day 1, Day 2, Day 5, Day 3, Day 4 · **CustomField2**: phone, tablet, unknown, computer, console · **FunnelName**: Conversation, FUNNEL_TYPE_ONBOARDING, Session, FollowMe, Messages, MessagePack, EndingOthers, Notebook, Ending · **FunnelStep**: 1, 2, 3, 4, 5, 6, 7, 8, 9 · **PlaceVersion**: 615, 619, 639, 645, 663, 664, 678, 679, 680, 684, 688, 689, 690, 691, 692, 693 · **Place**: 74542317333958 · **FirstSeenPlaceVersion**: 454, 684, 609, 446, 692, 584, 514, 471, 645, 473, 678, 664, 479, 690, 615, 466, 639, 545, 481, 679, 688, 586, 691, 680, 693, 556, 619, 689, 441 · **CustomField3**: new, returning
- Requested 343 · **280 returned data** · 20 empty · 53 failed — of which 0 aged out (data Roblox no longer stores) and **4 on observed/proven shapes (look here first)**

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
| FunnelUserChurnRate | metric | ONE_DAY · by FunnelStep · where FunnelName=Conversation | 400 | yes | — |
| FunnelUserStepCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=Conversation | 400 | yes | — |
| FunnelUserOverallCompletionRate | metric | ONE_DAY · where FunnelName=Conversation | 400 | yes | — |
| FunnelUserTotalCount | metric | ONE_DAY · by FunnelStep · where FunnelName=Conversation | 400 | yes | — |
| FunnelUserChurnRate | metric | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 400 | yes | — |
| FunnelUserStepCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 400 | yes | — |
| FunnelUserOverallCompletionRate | metric | ONE_DAY · where FunnelName=FUNNEL_TYPE_ONBOARDING | 400 | yes | — |
| FunnelUserTotalCount | metric | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 400 | yes | — |
| FunnelUserChurnRate | metric | ONE_DAY · by FunnelStep · where FunnelName=Session | 400 | yes | — |
| FunnelUserStepCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=Session | 400 | yes | — |
| FunnelUserOverallCompletionRate | metric | ONE_DAY · where FunnelName=Session | 400 | yes | — |
| FunnelUserTotalCount | metric | ONE_DAY · by FunnelStep · where FunnelName=Session | 400 | yes | — |
| FunnelUserChurnRate | metric | ONE_DAY · by FunnelStep · where FunnelName=FollowMe | 400 | yes | — |
| FunnelUserStepCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=FollowMe | 400 | yes | — |
| FunnelUserOverallCompletionRate | metric | ONE_DAY · where FunnelName=FollowMe | 400 | yes | — |
| FunnelUserTotalCount | metric | ONE_DAY · by FunnelStep · where FunnelName=FollowMe | 400 | yes | — |
| FunnelUserChurnRate | metric | ONE_DAY · by FunnelStep · where FunnelName=Messages | 400 | yes | — |
| FunnelUserStepCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=Messages | 400 | yes | — |
| FunnelUserOverallCompletionRate | metric | ONE_DAY · where FunnelName=Messages | 400 | yes | — |
| FunnelUserTotalCount | metric | ONE_DAY · by FunnelStep · where FunnelName=Messages | 400 | yes | — |
| FunnelUserChurnRate | metric | ONE_DAY · by FunnelStep · where FunnelName=MessagePack | 400 | yes | — |
| FunnelUserStepCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=MessagePack | 400 | yes | — |
| FunnelUserOverallCompletionRate | metric | ONE_DAY · where FunnelName=MessagePack | 400 | yes | — |
| FunnelUserTotalCount | metric | ONE_DAY · by FunnelStep · where FunnelName=MessagePack | 400 | yes | — |
| FunnelUserChurnRate | metric | ONE_DAY · by FunnelStep · where FunnelName=EndingOthers | 400 | yes | — |
| FunnelUserStepCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=EndingOthers | 400 | yes | — |
| FunnelUserOverallCompletionRate | metric | ONE_DAY · where FunnelName=EndingOthers | 400 | yes | — |
| FunnelUserTotalCount | metric | ONE_DAY · by FunnelStep · where FunnelName=EndingOthers | 400 | yes | — |
| FunnelUserChurnRate | metric | ONE_DAY · by FunnelStep · where FunnelName=Notebook | 400 | yes | — |
| FunnelUserStepCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=Notebook | 400 | yes | — |
| FunnelUserOverallCompletionRate | metric | ONE_DAY · where FunnelName=Notebook | 400 | yes | — |
| FunnelUserTotalCount | metric | ONE_DAY · by FunnelStep · where FunnelName=Notebook | 400 | yes | — |
| FunnelUserChurnRate | metric | ONE_DAY · by FunnelStep · where FunnelName=Ending | 400 | yes | — |
| FunnelUserStepCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=Ending | 400 | yes | — |
| FunnelUserOverallCompletionRate | metric | ONE_DAY · where FunnelName=Ending | 400 | yes | — |
| FunnelUserTotalCount | metric | ONE_DAY · by FunnelStep · where FunnelName=Ending | 400 | yes | — |
| — | metadata | — | 404 | **no** | — |

## Returned 200 but no data points

**The query was valid and matched nothing.** That is NOT evidence the feature is unused — the most common cause is a filter value that doesn't exist on this universe (e.g. a hardcoded `FunnelName` that belongs to a different game). Verify against the dashboard before concluding anything from a row here.

| Metric | Shape |
|---|---|
| annotation:PLACE_ICON | — |
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
| ServerCrashCount | ONE_DAY · where Place=74542317333958 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=74542317333958 |
| ServerCrashCount | HALF_HOUR · where Place=74542317333958 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=74542317333958 |
| ForwardD30Retention | — |
| DauMauStickiness | — |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| — | — | 1 |
| — | by CustomField1 | 5 |
| — | by CustomField2 | 5 |
| — | by FunnelName | 9 |
| — | by FunnelStep | 9 |
| — | by PlaceVersion | 16 |
| — | by Place | 1 |
| — | by FirstSeenPlaceVersion | 29 |
| — | by CustomField3 | 2 |
| — | — | 1 |
| — | — | 1 |
| — | — | 100 |
| — | — | 2251 |
| annotation:ENGINE_RELEASE | — | 21 |
| annotation:EXPERIENCE_EVENT_STATE | — | 4 |
| annotation:PLACE_THUMBNAIL | — | 12 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| Attribution7DPayerConversionRatio | ONE_DAY | 20 |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| Attribution7DPlaytimePerUserInMinutes | ONE_DAY | 20 |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| Attribution7DRobuxPerUser | ONE_DAY | 20 |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| AttributionD1RetentionRatio | ONE_DAY | 25 |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| AttributionD7RetentionRatio | ONE_DAY | 19 |
| AveragePlayTimeMinutesPerDAU | ONE_DAY | 27 |
| AveragePlayTimeMinutesPerDAU | — | 52 |
| AverageRevenuePerPayingUser | ONE_DAY | 26 |
| AverageRevenuePerPayingUser | — | 52 |
| AverageRevenuePerUser | ONE_DAY | 26 |
| AverageRevenuePerUser | — | 52 |
| AverageSessionLengthMinutes | ONE_DAY | 27 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 27 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 27 |
| AverageSessionLengthMinutes | ONE_DAY · by Platform | 163 |
| AverageSessionLengthMinutes | — | 52 |
| ClientCpuTimeAvg | ONE_DAY · where Place=74542317333958 | 28 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=74542317333958 | 140 |
| ClientCrashCount | ONE_DAY · where Place=74542317333958 | 8 |
| ClientCrashCount | ONE_DAY · where Place=74542317333958 | 8 |
| ClientCrashCount | ONE_DAY · where Place=74542317333958 | 8 |
| ClientCrashCount | ONE_DAY · where Place=74542317333958 | 5 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=74542317333958 | 45 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=74542317333958 | 46 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=74542317333958 | 47 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=74542317333958 | 25 |
| ClientCrashRate15m | ONE_DAY · where Place=74542317333958 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=74542317333958 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=74542317333958 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=74542317333958 | 5 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=74542317333958 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=74542317333958 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=74542317333958 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=74542317333958 | 30 |
| ClientFpsAvg | ONE_DAY · where Place=74542317333958 | 29 |
| ClientFpsP10 | ONE_DAY · where Place=74542317333958 | 29 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=74542317333958 | 174 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=74542317333958 | 29 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=74542317333958 | 174 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=74542317333958 | 29 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=74542317333958 | 174 |
| CpuCoreUtilization | ONE_DAY · where Place=74542317333958 | 27 |
| CpuTimeAvg | ONE_DAY · where Place=74542317333958 | 27 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=74542317333958 | 135 |
| DailyActiveUsers | ONE_DAY · by Locale | 1356 |
| DailyActiveUsers | ONE_DAY · by Country | 6021 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 189 |
| DailyActiveUsers | ONE_DAY · by Gender | 81 |
| DailyActiveUsers | ONE_DAY | 27 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 27 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 27 |
| DailyActiveUsers | ONE_DAY · by Platform | 163 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 162 |
| DailyActiveUsers | — | 26 |
| DailyRevenue | ONE_DAY | 26 |
| DailyRevenue | ONE_DAY · by BalanceType | 52 |
| DailyRevenue | ONE_DAY · by RevenueSource | 99 |
| DailyRevenue | — | 26 |
| DauMauStickiness | ONE_DAY | 27 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 4 |
| EndToEndCVR | ONE_DAY | 27 |
| ErrorCount | ONE_DAY · by LogSource | 6 |
| ErrorCount | ONE_DAY | 3 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=74542317333958 | 500 |
| ErrorCount | ONE_DAY · where Place=74542317333958 | 3 |
| ErrorCount | ONE_DAY · by LogSource · where Place=74542317333958 | 6 |
| ErrorCount | NONE · where Place=74542317333958,FirstSeenPlaceVersion=693 | 1 |
| ErrorCount | HALF_HOUR · where Place=74542317333958 | 33 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=74542317333958 | 66 |
| EventAvgDailyActiveUsers | ONE_DAY | 13 |
| EventAvgDailyRevenue | ONE_DAY | 13 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 13 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 13 |
| ForwardD1Retention | ONE_DAY | 26 |
| ForwardD1Retention | ONE_DAY · by Platform | 158 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 156 |
| ForwardD1Retention | — | 50 |
| ForwardD7Retention | ONE_DAY | 20 |
| ForwardD7Retention | ONE_DAY · by Platform | 122 |
| ForwardD7Retention | — | 38 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Conversation | 84 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 252 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Session | 168 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FollowMe | 84 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Messages | 168 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=MessagePack | 84 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=EndingOthers | 84 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Notebook | 112 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Ending | 84 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Conversation | 84 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 252 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Session | 168 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FollowMe | 84 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Messages | 168 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=MessagePack | 84 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=EndingOthers | 84 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Notebook | 112 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Ending | 84 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=Conversation | 3 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 9 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=Session | 6 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=FollowMe | 3 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=Messages | 6 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=MessagePack | 3 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=EndingOthers | 3 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=Notebook | 4 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=Ending | 3 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=Conversation | 3 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 9 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=Session | 6 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=FollowMe | 3 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=Messages | 6 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=MessagePack | 3 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=EndingOthers | 3 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=Notebook | 4 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=Ending | 3 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=Conversation | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=Session | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=FollowMe | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=Messages | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=MessagePack | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=EndingOthers | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=Notebook | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=Ending | 1 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=Conversation | 3 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 9 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=Session | 6 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=FollowMe | 3 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=Messages | 6 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=MessagePack | 3 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=EndingOthers | 3 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=Notebook | 4 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=Ending | 3 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=Conversation | 3 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 9 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=Session | 6 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=FollowMe | 3 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=Messages | 6 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=MessagePack | 3 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=EndingOthers | 3 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=Notebook | 4 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=Ending | 3 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=Conversation | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=Session | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=FollowMe | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=Messages | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=MessagePack | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=EndingOthers | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=Notebook | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=Ending | 1 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=Conversation,FunnelStep=1/2/3/4/5/6/7/8/9 | 3 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING,FunnelStep=1/2/3/4/5/6/7/8/9 | 9 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=Session,FunnelStep=1/2/3/4/5/6/7/8/9 | 6 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=FollowMe,FunnelStep=1/2/3/4/5/6/7/8/9 | 3 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=Messages,FunnelStep=1/2/3/4/5/6/7/8/9 | 6 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=MessagePack,FunnelStep=1/2/3/4/5/6/7/8/9 | 3 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=EndingOthers,FunnelStep=1/2/3/4/5/6/7/8/9 | 3 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=Notebook,FunnelStep=1/2/3/4/5/6/7/8/9 | 4 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=Ending,FunnelStep=1/2/3/4/5/6/7/8/9 | 3 |
| FunnelUserTotalCount | NONE · where FunnelName=Conversation | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=Conversation | 3 |
| FunnelUserTotalCount | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 9 |
| FunnelUserTotalCount | NONE · where FunnelName=Session | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=Session | 6 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=FollowMe | 3 |
| FunnelUserTotalCount | NONE · where FunnelName=FollowMe | 1 |
| FunnelUserTotalCount | NONE · where FunnelName=Messages | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=Messages | 6 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=MessagePack | 3 |
| FunnelUserTotalCount | NONE · where FunnelName=MessagePack | 1 |
| FunnelUserTotalCount | NONE · where FunnelName=EndingOthers | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=EndingOthers | 3 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=Notebook | 4 |
| FunnelUserTotalCount | NONE · where FunnelName=Notebook | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=Ending | 3 |
| FunnelUserTotalCount | NONE · where FunnelName=Ending | 1 |
| ItemMonetizationRevenue | ONE_HOUR | 227 |
| ItemMonetizationRevenue | ONE_HOUR · by ProductType | 679 |
| L7AveragePlayTimeMinutesPerDAU | — | 52 |
| MemoryUsageAvg | ONE_DAY · where Place=74542317333958 | 28 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=74542317333958 | 140 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=74542317333958 | 9 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 189 |
| MonthlyActiveUsers | ONE_DAY · by Locale | 1356 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 81 |
| MonthlyActiveUsers | ONE_DAY · by Country | 6021 |
| MonthlyActiveUsers | ONE_DAY | 27 |
| MonthlyActiveUsers | — | 26 |
| OomUnexpectedExits | ONE_DAY · where Place=74542317333958 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=74542317333958 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=74542317333958 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=74542317333958 | 5 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=74542317333958 | 24 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=74542317333958 | 26 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=74542317333958 | 24 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=74542317333958 | 15 |
| PayingUsers | ONE_DAY | 26 |
| PayingUsers | — | 26 |
| PayingUsersCVR | ONE_DAY | 26 |
| PayingUsersCVR | ONE_DAY · by Platform | 157 |
| PayingUsersCVR | — | 52 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=74542317333958 | 174 |
| PeakConcurrentPlayers | ONE_DAY · where Place=74542317333958 | 29 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=74542317333958 | 34 |
| PlayerFeedbackVotesCount | ONE_DAY | 27 |
| PotentialExtraEarningsTotalUsd | NONE | 1 |
| RFYD1CoplayDays | ONE_DAY | 27 |
| RFYD1Playtime | ONE_DAY | 27 |
| RFYD1QualifiedPlaySessions | ONE_DAY | 27 |
| RFYD1RobuxSpend | ONE_DAY | 27 |
| RFYD1SpendDay | ONE_DAY | 27 |
| RFYD2To7CoplayDays | ONE_DAY | 27 |
| RFYD2To7PlayDays | ONE_DAY | 27 |
| RFYD2To7Playtime | ONE_DAY | 27 |
| RFYD2To7QualifiedPlaySessions | ONE_DAY | 27 |
| RFYD2To7RobuxSpend | ONE_DAY | 27 |
| RFYD2To7SpendDays | ONE_DAY | 27 |
| RFYD8To28CoplayDays | ONE_DAY | 7 |
| RFYD8To28PlayDays | ONE_DAY | 7 |
| RFYD8To28Playtime | ONE_DAY | 7 |
| RFYD8To28QualifiedPlaySessions | ONE_DAY | 7 |
| RFYD8To28RobuxSpend | ONE_DAY | 7 |
| RFYD8To28SpendDays | ONE_DAY | 7 |
| RFYDuration0To60 | ONE_DAY | 27 |
| RFYDuration61To180 | ONE_DAY | 27 |
| RFYL7PlayDays | ONE_DAY | 27 |
| RFYL7PlayDays | — | 52 |
| RFYPlayThroughRate | ONE_DAY | 27 |
| RFYQualifiedPTR | ONE_DAY | 27 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | ONE_DAY | 27 |
| RSVPCount | ONE_DAY | 13 |
| ServerCrashCount | ONE_DAY · where Place=74542317333958 | 6 |
| ServerCrashCount | ONE_DAY · where Place=74542317333958 | 3 |
| ServerCrashCount | ONE_DAY · where Place=74542317333958 | 3 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=74542317333958 | 6 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=74542317333958 | 3 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=74542317333958 | 3 |
| ServerFrameRateP10 | ONE_DAY · where Place=74542317333958 | 29 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=74542317333958 | 29 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=74542317333958 | 174 |
| TotalPlayTimeHours | ONE_DAY | 27 |
| TotalPlayTimeHours | — | 26 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY | 27 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 139 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 27 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 112 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 128 |
| UniqueUsersWithPlaySessions | ONE_DAY | 27 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 27 |
| UsersJoinedFromNotifications | ONE_DAY | 13 |
| Visits | ONE_DAY · by Platform | 163 |
| Visits | ONE_DAY | 27 |
| Visits | — | 26 |
