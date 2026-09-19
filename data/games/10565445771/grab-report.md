# Grab report — universe 10565445771

- Window: **2026-09-16 → 2026-09-20**
- Plan source: seed
- Discovered dimension values: **__places**: 74542317333958 · **FunnelName**: Conversation, FUNNEL_TYPE_ONBOARDING, Session, FollowMe, Messages, EndingOthers, Notebook, MessagePack, Ending · **CustomField2**: phone, unknown, tablet, computer, console · **CustomField3**: new, returning · **PlaceVersion**: 695, 696 · **FunnelStep**: 1, 2, 3, 4, 5, 6, 7, 8, 9 · **CustomField1**: Day 1, Day 2, Day 5, Day 3, Day 4 · **Place**: 74542317333958 · **FirstSeenPlaceVersion**: 454, 684, 446, 695, 609, 693, 584, 514, 471, 696, 645, 473, 479, 664, 466, 615, 481, 545, 692, 586, 688, 556, 639, 680, 619, 690, 679, 512, 689
- Requested 319 · **241 returned data** · 29 empty · 59 failed — of which 0 aged out (data Roblox no longer stores) and **5 on observed/proven shapes (look here first)**

## Failed — observed/proven shapes (real problems)

The dashboard itself sends these shapes (or they have returned data before). A failure here means capture is broken or the API changed — it is never evidence about the game.

| Metric | Kind | Shape | HTTP | Provenance | Error |
|---|---|---|---|---|---|
| — | dimensions | by MessageHash | 500 | observed | — |
| — | annotations | — | 400 | proven | — |
| L7AverageDailyActiveUsers | benchmark | — | 404 | proven | — |
| L7AverageDailyRevenue | benchmark | — | 404 | proven | — |
| DailyRevenue | benchmark | — | 500 | proven | — |

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
| FunnelUserChurnRate | metric | ONE_DAY · by FunnelStep · where FunnelName=EndingOthers | 400 | yes | — |
| FunnelUserStepCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=EndingOthers | 400 | yes | — |
| FunnelUserOverallCompletionRate | metric | ONE_DAY · where FunnelName=EndingOthers | 400 | yes | — |
| FunnelUserTotalCount | metric | ONE_DAY · by FunnelStep · where FunnelName=EndingOthers | 400 | yes | — |
| FunnelUserChurnRate | metric | ONE_DAY · by FunnelStep · where FunnelName=Notebook | 400 | yes | — |
| FunnelUserStepCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=Notebook | 400 | yes | — |
| FunnelUserOverallCompletionRate | metric | ONE_DAY · where FunnelName=Notebook | 400 | yes | — |
| FunnelUserTotalCount | metric | ONE_DAY · by FunnelStep · where FunnelName=Notebook | 400 | yes | — |
| FunnelUserChurnRate | metric | ONE_DAY · by FunnelStep · where FunnelName=MessagePack | 400 | yes | — |
| FunnelUserStepCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=MessagePack | 400 | yes | — |
| FunnelUserOverallCompletionRate | metric | ONE_DAY · where FunnelName=MessagePack | 400 | yes | — |
| FunnelUserTotalCount | metric | ONE_DAY · by FunnelStep · where FunnelName=MessagePack | 400 | yes | — |
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
| — | — |
| annotation:FUNNEL | — |
| annotation:ENGINE_RELEASE | — |
| — | — |
| — | — |
| — | — |
| — | — |
| — | — |
| — | — |
| annotation:CREATOR_REGEX_CHANGE | — |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| ForwardD7Retention | ONE_DAY · by Platform |
| ForwardD30Retention | ONE_DAY |
| ForwardD7Retention | ONE_DAY |
| ServerCrashCount | ONE_DAY · where Place=74542317333958 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=74542317333958 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=74542317333958 |
| ServerCrashCount | HALF_HOUR · where Place=74542317333958 |
| ForwardD7Retention | — |
| ForwardD30Retention | — |
| DauMauStickiness | — |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| — | — | 1 |
| — | by FunnelName | 9 |
| — | by CustomField2 | 5 |
| — | by CustomField3 | 2 |
| — | by PlaceVersion | 2 |
| — | by FunnelStep | 9 |
| — | by CustomField1 | 5 |
| — | by Place | 1 |
| — | by FirstSeenPlaceVersion | 29 |
| — | — | 53 |
| — | — | 100 |
| annotation:EXPERIENCE_EVENT_STATE | — | 1 |
| annotation:PLACE_THUMBNAIL | — | 2 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 5 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 5 |
| AveragePlayTimeMinutesPerDAU | ONE_DAY | 2 |
| AveragePlayTimeMinutesPerDAU | — | 4 |
| AverageRevenuePerPayingUser | ONE_DAY | 2 |
| AverageRevenuePerPayingUser | — | 4 |
| AverageRevenuePerUser | ONE_DAY | 2 |
| AverageRevenuePerUser | — | 4 |
| AverageSessionLengthMinutes | ONE_DAY | 2 |
| AverageSessionLengthMinutes | ONE_DAY · by Platform | 12 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 2 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 2 |
| AverageSessionLengthMinutes | — | 4 |
| ClientCpuTimeAvg | ONE_DAY · where Place=74542317333958 | 4 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=74542317333958 | 20 |
| ClientCrashCount | ONE_DAY · where Place=74542317333958 | 5 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=74542317333958 | 25 |
| ClientCrashRate15m | ONE_DAY · where Place=74542317333958 | 5 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=74542317333958 | 30 |
| ClientFpsAvg | ONE_DAY · where Place=74542317333958 | 5 |
| ClientFpsP10 | ONE_DAY · where Place=74542317333958 | 5 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=74542317333958 | 30 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=74542317333958 | 5 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=74542317333958 | 30 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=74542317333958 | 5 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=74542317333958 | 30 |
| CpuCoreUtilization | ONE_DAY · where Place=74542317333958 | 3 |
| CpuTimeAvg | ONE_DAY · where Place=74542317333958 | 3 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=74542317333958 | 15 |
| DailyActiveUsers | ONE_DAY · by Country | 406 |
| DailyActiveUsers | ONE_DAY · by Locale | 100 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 14 |
| DailyActiveUsers | ONE_DAY · by Gender | 6 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 2 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 2 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 12 |
| DailyActiveUsers | ONE_DAY · by Platform | 12 |
| DailyActiveUsers | ONE_DAY | 2 |
| DailyActiveUsers | — | 2 |
| DailyCohortRetention | ONE_DAY · by CohortDay | 1 |
| DailyRevenue | ONE_DAY | 2 |
| DailyRevenue | ONE_DAY · by RevenueSource | 6 |
| DailyRevenue | ONE_DAY · by BalanceType | 4 |
| DauMauStickiness | ONE_DAY | 2 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 4 |
| EndToEndCVR | ONE_DAY | 2 |
| ErrorCount | ONE_DAY | 4 |
| ErrorCount | ONE_DAY · by LogSource | 8 |
| ErrorCount | ONE_DAY · where Place=74542317333958 | 4 |
| ErrorCount | ONE_DAY · by LogSource · where Place=74542317333958 | 8 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=74542317333958 | 500 |
| ErrorCount | HALF_HOUR · where Place=74542317333958 | 19 |
| ErrorCount | NONE · where Place=74542317333958,FirstSeenPlaceVersion=696 | 1 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=74542317333958 | 38 |
| EventAvgDailyActiveUsers | ONE_DAY | 2 |
| EventAvgDailyRevenue | ONE_DAY | 2 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 2 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 2 |
| ForwardD1Retention | ONE_DAY | 1 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| ForwardD1Retention | ONE_DAY · by Platform | 6 |
| ForwardD1Retention | — | 2 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Conversation | 12 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 36 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Session | 24 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FollowMe | 12 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Messages | 24 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=EndingOthers | 12 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Notebook | 16 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=MessagePack | 12 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Ending | 12 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Conversation | 12 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 36 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Session | 24 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FollowMe | 12 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Messages | 24 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=EndingOthers | 12 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Notebook | 16 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=MessagePack | 12 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Ending | 12 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=Conversation | 3 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 9 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=Session | 6 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=FollowMe | 3 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=Messages | 6 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=EndingOthers | 3 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=Notebook | 4 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=MessagePack | 3 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=Ending | 3 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=Conversation | 3 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 9 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=Session | 6 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=FollowMe | 3 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=Messages | 6 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=EndingOthers | 3 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=Notebook | 4 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=MessagePack | 3 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=Ending | 3 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=Conversation | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=Session | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=FollowMe | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=Messages | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=EndingOthers | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=Notebook | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=MessagePack | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=Ending | 1 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=Conversation | 3 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 9 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=Session | 6 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=FollowMe | 3 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=Messages | 6 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=EndingOthers | 3 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=Notebook | 4 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=MessagePack | 3 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=Ending | 3 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=Conversation | 3 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 9 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=Session | 6 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=FollowMe | 3 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=Messages | 6 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=EndingOthers | 3 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=Notebook | 4 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=MessagePack | 3 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=Ending | 3 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=Conversation | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=Session | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=FollowMe | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=Messages | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=EndingOthers | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=Notebook | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=MessagePack | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=Ending | 1 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=Conversation,FunnelStep=1/2/3/4/5/6/7/8/9 | 3 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING,FunnelStep=1/2/3/4/5/6/7/8/9 | 9 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=Session,FunnelStep=1/2/3/4/5/6/7/8/9 | 6 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=FollowMe,FunnelStep=1/2/3/4/5/6/7/8/9 | 3 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=Messages,FunnelStep=1/2/3/4/5/6/7/8/9 | 6 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=EndingOthers,FunnelStep=1/2/3/4/5/6/7/8/9 | 3 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=Notebook,FunnelStep=1/2/3/4/5/6/7/8/9 | 4 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=MessagePack,FunnelStep=1/2/3/4/5/6/7/8/9 | 3 |
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
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=EndingOthers | 3 |
| FunnelUserTotalCount | NONE · where FunnelName=EndingOthers | 1 |
| FunnelUserTotalCount | NONE · where FunnelName=Notebook | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=Notebook | 4 |
| FunnelUserTotalCount | NONE · where FunnelName=MessagePack | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=MessagePack | 3 |
| FunnelUserTotalCount | NONE · where FunnelName=Ending | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=Ending | 3 |
| ItemMonetizationRevenue | ONE_HOUR · by ProductType | 225 |
| ItemMonetizationRevenue | ONE_HOUR | 81 |
| L7AveragePlayTimeMinutesPerDAU | — | 4 |
| MemoryUsageAvg | ONE_DAY · where Place=74542317333958 | 4 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=74542317333958 | 20 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=74542317333958 | 9 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 14 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 6 |
| MonthlyActiveUsers | ONE_DAY · by Locale | 100 |
| MonthlyActiveUsers | ONE_DAY · by Country | 406 |
| MonthlyActiveUsers | ONE_DAY | 2 |
| MonthlyActiveUsers | — | 2 |
| OomUnexpectedExits | ONE_DAY · where Place=74542317333958 | 5 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=74542317333958 | 15 |
| PayingUsers | ONE_DAY | 2 |
| PayingUsers | — | 2 |
| PayingUsersCVR | ONE_DAY | 2 |
| PayingUsersCVR | ONE_DAY · by Platform | 12 |
| PayingUsersCVR | — | 4 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=74542317333958 | 30 |
| PeakConcurrentPlayers | ONE_DAY · where Place=74542317333958 | 5 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=74542317333958 | 20 |
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
| ServerFrameRateP10 | ONE_DAY · where Place=74542317333958 | 5 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=74542317333958 | 5 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=74542317333958 | 30 |
| TotalPlayTimeHours | ONE_DAY | 2 |
| TotalPlayTimeHours | — | 2 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY | 2 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 2 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 12 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 10 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 5 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 11 |
| UniqueUsersWithPlaySessions | ONE_DAY | 2 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 2 |
| UsersJoinedFromNotifications | ONE_DAY | 2 |
| Visits | ONE_DAY | 2 |
| Visits | ONE_DAY · by Platform | 12 |
| Visits | — | 2 |
