# Grab report — universe 10565445771

- Window: **2026-08-27 → 2026-09-10**
- Plan source: seed
- Discovered dimension values: **__places**: 74542317333958 · **FunnelName**: Conversation, FUNNEL_TYPE_ONBOARDING, Session, FollowMe, Messages, MessagePack, EndingOthers, Notebook, Ending · **CustomField1**: Day 1, Day 2, Day 5, Day 3, Day 4 · **CustomField2**: phone, tablet, unknown, computer, console · **PlaceVersion**: 664, 678, 679, 680, 684, 688, 689, 690, 691, 692 · **Place**: 74542317333958 · **FirstSeenPlaceVersion**: 454, 684, 609, 584, 446, 692, 471, 690, 514, 664, 473, 678, 645, 479, 615, 679, 466, 481, 691, 545, 639, 688, 680, 586, 619, 556, 689, 441 · **FunnelStep**: 1, 2, 3, 4, 5, 6, 7, 8, 9 · **CustomField3**: new, returning
- Requested 327 · **266 returned data** · 18 empty · 53 failed — of which 0 aged out (data Roblox no longer stores) and **4 on observed/proven shapes (look here first)**

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
| ServerCrashCount | HALF_HOUR · where Place=74542317333958 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=74542317333958 |
| ForwardD30Retention | — |
| DauMauStickiness | — |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| — | — | 1 |
| — | by FunnelName | 9 |
| — | by CustomField1 | 5 |
| — | by CustomField2 | 5 |
| — | by PlaceVersion | 10 |
| — | by Place | 1 |
| — | by FirstSeenPlaceVersion | 28 |
| — | by FunnelStep | 9 |
| — | by CustomField3 | 2 |
| — | — | 1 |
| — | — | 549 |
| — | — | 1 |
| — | — | 100 |
| annotation:ENGINE_RELEASE | — | 10 |
| annotation:EXPERIENCE_EVENT_STATE | — | 3 |
| annotation:PLACE_THUMBNAIL | — | 6 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| Attribution7DPayerConversionRatio | ONE_DAY | 7 |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| Attribution7DPlaytimePerUserInMinutes | ONE_DAY | 7 |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| Attribution7DRobuxPerUser | ONE_DAY | 7 |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| AttributionD1RetentionRatio | ONE_DAY | 12 |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
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
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=74542317333958 | 75 |
| ClientCpuTimeAvg | ONE_DAY · where Place=74542317333958 | 15 |
| ClientCrashCount | ONE_DAY · where Place=74542317333958 | 8 |
| ClientCrashCount | ONE_DAY · where Place=74542317333958 | 7 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=74542317333958 | 47 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=74542317333958 | 41 |
| ClientCrashRate15m | ONE_DAY · where Place=74542317333958 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=74542317333958 | 7 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=74542317333958 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=74542317333958 | 42 |
| ClientFpsAvg | ONE_DAY · where Place=74542317333958 | 15 |
| ClientFpsP10 | ONE_DAY · where Place=74542317333958 | 15 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=74542317333958 | 90 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=74542317333958 | 15 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=74542317333958 | 90 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=74542317333958 | 15 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=74542317333958 | 90 |
| CpuCoreUtilization | ONE_DAY · where Place=74542317333958 | 14 |
| CpuTimeAvg | ONE_DAY · where Place=74542317333958 | 14 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=74542317333958 | 70 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 91 |
| DailyActiveUsers | ONE_DAY · by Country | 2880 |
| DailyActiveUsers | ONE_DAY · by Locale | 652 |
| DailyActiveUsers | ONE_DAY · by Gender | 39 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 13 |
| DailyActiveUsers | ONE_DAY | 13 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 78 |
| DailyActiveUsers | ONE_DAY · by Platform | 79 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 13 |
| DailyActiveUsers | — | 13 |
| DailyRevenue | ONE_DAY · by BalanceType | 26 |
| DailyRevenue | ONE_DAY · by RevenueSource | 49 |
| DailyRevenue | ONE_DAY | 13 |
| DailyRevenue | — | 13 |
| DauMauStickiness | ONE_DAY | 13 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 4 |
| EndToEndCVR | ONE_DAY | 14 |
| ErrorCount | ONE_DAY | 2 |
| ErrorCount | ONE_DAY · by LogSource | 4 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=74542317333958 | 500 |
| ErrorCount | ONE_DAY · where Place=74542317333958 | 2 |
| ErrorCount | ONE_DAY · by LogSource · where Place=74542317333958 | 4 |
| ErrorCount | NONE · where Place=74542317333958,FirstSeenPlaceVersion=692 | 1 |
| ErrorCount | HALF_HOUR · where Place=74542317333958 | 37 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=74542317333958 | 74 |
| EventAvgDailyActiveUsers | ONE_DAY | 12 |
| EventAvgDailyRevenue | ONE_DAY | 12 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 12 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 12 |
| ForwardD1Retention | ONE_DAY | 12 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 72 |
| ForwardD1Retention | ONE_DAY · by Platform | 74 |
| ForwardD1Retention | — | 24 |
| ForwardD7Retention | ONE_DAY | 6 |
| ForwardD7Retention | ONE_DAY · by Platform | 37 |
| ForwardD7Retention | — | 12 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Conversation | 45 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 135 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Session | 90 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FollowMe | 45 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Messages | 90 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=MessagePack | 45 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=EndingOthers | 45 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Notebook | 60 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Ending | 45 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Conversation | 45 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 135 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Session | 90 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FollowMe | 45 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Messages | 90 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=MessagePack | 45 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=EndingOthers | 45 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Notebook | 60 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Ending | 45 |
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
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=Conversation | 3 |
| FunnelUserTotalCount | NONE · where FunnelName=Conversation | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 9 |
| FunnelUserTotalCount | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=Session | 6 |
| FunnelUserTotalCount | NONE · where FunnelName=Session | 1 |
| FunnelUserTotalCount | NONE · where FunnelName=FollowMe | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=FollowMe | 3 |
| FunnelUserTotalCount | NONE · where FunnelName=Messages | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=Messages | 6 |
| FunnelUserTotalCount | NONE · where FunnelName=MessagePack | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=MessagePack | 3 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=EndingOthers | 3 |
| FunnelUserTotalCount | NONE · where FunnelName=EndingOthers | 1 |
| FunnelUserTotalCount | NONE · where FunnelName=Notebook | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=Notebook | 4 |
| FunnelUserTotalCount | NONE · where FunnelName=Ending | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=Ending | 3 |
| ItemMonetizationRevenue | ONE_HOUR | 199 |
| ItemMonetizationRevenue | ONE_HOUR · by ProductType | 596 |
| L7AveragePlayTimeMinutesPerDAU | — | 26 |
| MemoryUsageAvg | ONE_DAY · where Place=74542317333958 | 15 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=74542317333958 | 75 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=74542317333958 | 9 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 91 |
| MonthlyActiveUsers | ONE_DAY · by Locale | 652 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 39 |
| MonthlyActiveUsers | ONE_DAY · by Country | 2880 |
| MonthlyActiveUsers | ONE_DAY | 13 |
| MonthlyActiveUsers | — | 13 |
| OomUnexpectedExits | ONE_DAY · where Place=74542317333958 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=74542317333958 | 7 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=74542317333958 | 24 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=74542317333958 | 23 |
| PayingUsers | ONE_DAY | 13 |
| PayingUsers | — | 13 |
| PayingUsersCVR | ONE_DAY | 13 |
| PayingUsersCVR | ONE_DAY · by Platform | 79 |
| PayingUsersCVR | — | 26 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=74542317333958 | 90 |
| PeakConcurrentPlayers | ONE_DAY · where Place=74542317333958 | 15 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=74542317333958 | 49 |
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
| RFYD8To28CoplayDays | ONE_DAY | 6 |
| RFYD8To28PlayDays | ONE_DAY | 6 |
| RFYD8To28Playtime | ONE_DAY | 6 |
| RFYD8To28QualifiedPlaySessions | ONE_DAY | 6 |
| RFYD8To28RobuxSpend | ONE_DAY | 6 |
| RFYD8To28SpendDays | ONE_DAY | 6 |
| RFYDuration0To60 | ONE_DAY | 14 |
| RFYDuration61To180 | ONE_DAY | 14 |
| RFYL7PlayDays | ONE_DAY | 14 |
| RFYL7PlayDays | — | 26 |
| RFYPlayThroughRate | ONE_DAY | 14 |
| RFYQualifiedPTR | ONE_DAY | 14 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | ONE_DAY | 14 |
| RSVPCount | ONE_DAY | 12 |
| ServerCrashCount | ONE_DAY · where Place=74542317333958 | 2 |
| ServerCrashCount | ONE_DAY · where Place=74542317333958 | 2 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=74542317333958 | 2 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=74542317333958 | 2 |
| ServerFrameRateP10 | ONE_DAY · where Place=74542317333958 | 15 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=74542317333958 | 15 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=74542317333958 | 90 |
| TotalPlayTimeHours | ONE_DAY | 13 |
| TotalPlayTimeHours | — | 13 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 14 |
| UniqueUsersWithImpressions | ONE_DAY | 14 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 70 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 56 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 64 |
| UniqueUsersWithPlaySessions | ONE_DAY | 14 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 14 |
| UsersJoinedFromNotifications | ONE_DAY | 12 |
| Visits | ONE_DAY | 13 |
| Visits | ONE_DAY · by Platform | 79 |
| Visits | — | 13 |
