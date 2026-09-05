# Grab report — universe 10565445771

- Window: **2026-09-01 → 2026-09-05**
- Plan source: seed+learned
- Discovered dimension values: **__places**: 74542317333958 · **CustomField1**: Day 1, Day 2, Day 5, Day 3, Day 4 · **FunnelName**: Conversation, FUNNEL_TYPE_ONBOARDING, Session, FollowMe, Messages, MessagePack, EndingOthers, Notebook, Ending · **FunnelStep**: 1, 2, 3, 4, 5, 6, 7, 8, 9 · **PlaceVersion**: 680 · **CustomField3**: new, returning · **Place**: 74542317333958 · **CustomField2**: phone, unknown, tablet, computer, console · **FirstSeenPlaceVersion**: 454, 609, 645, 584, 680, 446, 514, 664, 471, 678, 479, 473, 639, 545, 615, 466, 481, 586, 679, 556, 619, 200
- Requested 405 · **306 returned data** · 50 empty · 59 failed — of which 0 aged out (data Roblox no longer stores) and **15 on observed/proven shapes (look here first)**

## Failed — observed/proven shapes (real problems)

The dashboard itself sends these shapes (or they have returned data before). A failure here means capture is broken or the API changed — it is never evidence about the game.

| Metric | Kind | Shape | HTTP | Provenance | Error |
|---|---|---|---|---|---|
| — | dimensions | by MessageHash | 500 | observed | — |
| — | annotations | — | 400 | proven | — |
| L7AverageForwardD1Retention | metric | ONE_DAY | 400 | observed | — |
| L7AveragePlayTimeMinutesPerDAU | metric | ONE_DAY | 400 | observed | — |
| L7AverageDailyActiveUsers | metric | ONE_DAY | 400 | observed | — |
| L7AverageDailyRevenue | metric | ONE_DAY | 400 | observed | — |
| L7AverageDailyActiveUsers | benchmark | — | 404 | observed | — |
| L7AverageDailyRevenue | benchmark | — | 404 | observed | — |
| FunnelUserStepCompletionRate | metric | NONE · by FunnelStep · where FunnelName=Ending,FunnelStep=1/2/3/4/5/6/7/8/9 | 500 | observed | — |
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
| FunnelUserStepCompletionRate | metric | ONE_DAY · by FunnelStep · where FunnelName=Conversation | 400 | yes | — |
| FunnelUserChurnRate | metric | ONE_DAY · by FunnelStep · where FunnelName=Conversation | 400 | yes | — |
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
| FunnelUserTotalCount | metric | ONE_DAY · by FunnelStep · where FunnelName=EndingOthers | 400 | yes | — |
| FunnelUserOverallCompletionRate | metric | ONE_DAY · where FunnelName=EndingOthers | 400 | yes | — |
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
| — | — |
| annotation:FUNNEL | — |
| annotation:EXPERIENCE_EVENT_STATE | — |
| — | — |
| — | — |
| — | — |
| — | — |
| — | — |
| — | — |
| annotation:CREATOR_REGEX_CHANGE | — |
| Attribution7DPayerConversionRatio | ONE_DAY |
| Attribution30DRobuxPerUser | ONE_DAY |
| Attribution7DPlaytimePerUserInMinutes | ONE_DAY |
| Attribution7DRobuxPerUser | ONE_DAY |
| RFYD8To28Playtime | ONE_DAY |
| RFYD8To28QualifiedPlaySessions | ONE_DAY |
| RFYD8To28PlayDays | ONE_DAY |
| RFYD8To28RobuxSpend | ONE_DAY |
| RFYD8To28SpendDays | ONE_DAY |
| RFYD8To28CoplayDays | ONE_DAY |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| ForwardD7Retention | ONE_DAY |
| ForwardD7Retention | ONE_DAY · by Platform |
| ForwardD30Retention | ONE_DAY |
| ServerCrashCount | ONE_DAY · where Place=74542317333958 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=74542317333958 |
| AttributionD7RetentionRatio | ONE_DAY |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=74542317333958 |
| ServerCrashCount | HALF_HOUR · where Place=74542317333958 |
| ForwardD7Retention | — |
| ForwardD30Retention | — |
| DauMauStickiness | — |
| ServerCrashCount | ONE_DAY · where Place=74542317333958 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=74542317333958 |
| ServerCrashCount | HALF_HOUR · where Place=74542317333958 |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=74542317333958 |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| — | — | 1 |
| — | by CustomField1 | 5 |
| — | by FunnelName | 9 |
| — | by FunnelStep | 9 |
| — | by PlaceVersion | 1 |
| — | by CustomField3 | 2 |
| — | by Place | 1 |
| — | by CustomField2 | 5 |
| — | by FirstSeenPlaceVersion | 22 |
| — | — | 131 |
| — | — | 100 |
| annotation:ENGINE_RELEASE | — | 3 |
| annotation:PLACE_THUMBNAIL | — | 2 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| AttributionD1RetentionRatio | ONE_DAY | 1 |
| AveragePlayTimeMinutesPerDAU | ONE_DAY | 3 |
| AveragePlayTimeMinutesPerDAU | — | 4 |
| AverageRevenuePerPayingUser | ONE_DAY | 3 |
| AverageRevenuePerPayingUser | — | 4 |
| AverageRevenuePerUser | ONE_DAY | 3 |
| AverageRevenuePerUser | — | 4 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 3 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 3 |
| AverageSessionLengthMinutes | ONE_DAY | 3 |
| AverageSessionLengthMinutes | ONE_DAY · by Platform | 18 |
| AverageSessionLengthMinutes | — | 4 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 3 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 3 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=74542317333958 | 20 |
| ClientCpuTimeAvg | ONE_DAY · where Place=74542317333958 | 4 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=74542317333958 | 20 |
| ClientCpuTimeAvg | ONE_DAY · where Place=74542317333958 | 4 |
| ClientCrashCount | ONE_DAY · where Place=74542317333958 | 5 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=74542317333958 | 28 |
| ClientCrashCount | ONE_DAY · where Place=74542317333958 | 5 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=74542317333958 | 28 |
| ClientCrashRate15m | ONE_DAY · where Place=74542317333958 | 5 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=74542317333958 | 30 |
| ClientCrashRate15m | ONE_DAY · where Place=74542317333958 | 5 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=74542317333958 | 30 |
| ClientFpsAvg | ONE_DAY · where Place=74542317333958 | 5 |
| ClientFpsAvg | ONE_DAY · where Place=74542317333958 | 5 |
| ClientFpsP10 | ONE_DAY · where Place=74542317333958 | 5 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=74542317333958 | 30 |
| ClientFpsP10 | ONE_DAY · where Place=74542317333958 | 5 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=74542317333958 | 30 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=74542317333958 | 5 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=74542317333958 | 30 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=74542317333958 | 5 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=74542317333958 | 30 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=74542317333958 | 5 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=74542317333958 | 30 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=74542317333958 | 5 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=74542317333958 | 30 |
| ConcurrentPlayers | ONE_HOUR | 89 |
| CpuCoreUtilization | ONE_DAY · where Place=74542317333958 | 3 |
| CpuCoreUtilization | ONE_DAY · where Place=74542317333958 | 3 |
| CpuTimeAvg | ONE_DAY · where Place=74542317333958 | 3 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=74542317333958 | 15 |
| CpuTimeAvg | ONE_DAY · where Place=74542317333958 | 3 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=74542317333958 | 15 |
| DailyActiveUsers | ONE_DAY · by Locale | 150 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 21 |
| DailyActiveUsers | ONE_DAY · by Gender | 9 |
| DailyActiveUsers | ONE_DAY · by Country | 663 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 3 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 3 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 18 |
| DailyActiveUsers | ONE_DAY | 3 |
| DailyActiveUsers | ONE_DAY · by Platform | 18 |
| DailyActiveUsers | — | 2 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 12 |
| DailyActiveUsers | NONE · by AcquisitionSource · where IsNewUser=New | 4 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 3 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 3 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 18 |
| DailyCohortRetention | ONE_DAY · by CohortDay | 3 |
| DailyRevenue | ONE_DAY | 3 |
| DailyRevenue | ONE_DAY · by RevenueSource | 11 |
| DailyRevenue | ONE_DAY · by BalanceType | 6 |
| DailyRevenue | — | 2 |
| DauMauStickiness | ONE_DAY | 3 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 4 |
| EndToEndCVR | ONE_DAY | 2 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 4 |
| ErrorCount | ONE_DAY | 4 |
| ErrorCount | ONE_DAY · by LogSource | 8 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=74542317333958 | 500 |
| ErrorCount | ONE_DAY · where Place=74542317333958 | 4 |
| ErrorCount | ONE_DAY · by LogSource · where Place=74542317333958 | 8 |
| ErrorCount | NONE · where Place=74542317333958,FirstSeenPlaceVersion=680 | 1 |
| ErrorCount | HALF_HOUR · where Place=74542317333958 | 29 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=74542317333958 | 58 |
| ErrorCount | ONE_DAY · where Place=74542317333958 | 4 |
| ErrorCount | ONE_DAY · by LogSource · where Place=74542317333958 | 8 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=74542317333958 | 500 |
| ErrorCount | HALF_HOUR · where Place=74542317333958 | 29 |
| ErrorCount | NONE · where Place=74542317333958,FirstSeenPlaceVersion=454/609/645/584/680/446/514/664/471/678/479/473/639/545/615/466/481/586/679/556/619/200 | 1 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=74542317333958 | 58 |
| EventAvgDailyActiveUsers | ONE_DAY | 2 |
| EventAvgDailyRevenue | ONE_DAY | 2 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 2 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 2 |
| ForwardD1Retention | ONE_DAY | 2 |
| ForwardD1Retention | ONE_DAY · by Platform | 12 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 12 |
| ForwardD1Retention | — | 2 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 8 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 12 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Conversation | 12 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 36 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Session | 24 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FollowMe | 12 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Messages | 24 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=MessagePack | 12 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=EndingOthers | 12 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Notebook | 16 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Ending | 12 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Conversation/FUNNEL_TYPE_ONBOARDING/Session/FollowMe/Messages/MessagePack/EndingOthers/Notebook/Ending | 36 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Conversation | 12 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 36 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Session | 24 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FollowMe | 12 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Messages | 24 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=MessagePack | 12 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=EndingOthers | 12 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Notebook | 16 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Ending | 12 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=Conversation/FUNNEL_TYPE_ONBOARDING/Session/FollowMe/Messages/MessagePack/EndingOthers/Notebook/Ending | 36 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=Conversation | 3 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 9 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=FollowMe | 3 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=Session | 6 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=Messages | 6 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=MessagePack | 3 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=EndingOthers | 3 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=Notebook | 4 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=Ending | 3 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=Conversation/FUNNEL_TYPE_ONBOARDING/Session/FollowMe/Messages/MessagePack/EndingOthers/Notebook/Ending | 9 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=Conversation | 3 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 9 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=Session | 6 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=FollowMe | 3 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=Messages | 6 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=MessagePack | 3 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=EndingOthers | 3 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=Notebook | 4 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=Ending | 3 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=Conversation/FUNNEL_TYPE_ONBOARDING/Session/FollowMe/Messages/MessagePack/EndingOthers/Notebook/Ending | 9 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=Conversation | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=Session | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=FollowMe | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=Messages | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=MessagePack | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=EndingOthers | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=Notebook | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=Ending | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=Conversation/FUNNEL_TYPE_ONBOARDING/Session/FollowMe/Messages/MessagePack/EndingOthers/Notebook/Ending | 1 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=Conversation | 3 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 9 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=Session | 6 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=FollowMe | 3 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=Messages | 6 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=MessagePack | 3 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=EndingOthers | 3 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=Notebook | 4 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=Ending | 3 |
| FunnelStepTotalCount | NONE · where FunnelName=Conversation/FUNNEL_TYPE_ONBOARDING/Session/FollowMe/Messages/MessagePack/EndingOthers/Notebook/Ending | 1 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=Conversation/FUNNEL_TYPE_ONBOARDING/Session/FollowMe/Messages/MessagePack/EndingOthers/Notebook/Ending | 9 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=Conversation | 3 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 9 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=Session | 6 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=FollowMe | 3 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=Messages | 6 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=MessagePack | 3 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=EndingOthers | 3 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=Notebook | 4 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=Ending | 3 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelStep=1/2/3/4/5/6/7/8/9,FunnelName=Conversation/FUNNEL_TYPE_ONBOARDING/Session/FollowMe/Messages/MessagePack/EndingOthers/Notebook/Ending | 9 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=Conversation/FUNNEL_TYPE_ONBOARDING/Session/FollowMe/Messages/MessagePack/EndingOthers/Notebook/Ending | 9 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=Conversation | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=Session | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=FollowMe | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=Messages | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=MessagePack | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=EndingOthers | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=Notebook | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=Ending | 1 |
| FunnelUserOverallCompletionRate | NONE · by FunnelStep · where FunnelStep=1/2/3/4/5/6/7/8/9,FunnelName=Conversation/FUNNEL_TYPE_ONBOARDING/Session/FollowMe/Messages/MessagePack/EndingOthers/Notebook/Ending | 9 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=Conversation/FUNNEL_TYPE_ONBOARDING/Session/FollowMe/Messages/MessagePack/EndingOthers/Notebook/Ending | 1 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=Conversation,FunnelStep=1/2/3/4/5/6/7/8/9 | 3 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING,FunnelStep=1/2/3/4/5/6/7/8/9 | 9 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=Session,FunnelStep=1/2/3/4/5/6/7/8/9 | 6 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=FollowMe,FunnelStep=1/2/3/4/5/6/7/8/9 | 3 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=MessagePack,FunnelStep=1/2/3/4/5/6/7/8/9 | 3 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=Messages,FunnelStep=1/2/3/4/5/6/7/8/9 | 6 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=EndingOthers,FunnelStep=1/2/3/4/5/6/7/8/9 | 3 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=Notebook,FunnelStep=1/2/3/4/5/6/7/8/9 | 4 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelStep=1/2/3/4/5/6/7/8/9,FunnelName=Conversation/FUNNEL_TYPE_ONBOARDING/Session/FollowMe/Messages/MessagePack/EndingOthers/Notebook/Ending | 9 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=Conversation/FUNNEL_TYPE_ONBOARDING/Session/FollowMe/Messages/MessagePack/EndingOthers/Notebook/Ending,FunnelStep=1/2/3/4/5/6/7/8/9 | 9 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=Conversation/FUNNEL_TYPE_ONBOARDING/Session/FollowMe/Messages/MessagePack/EndingOthers/Notebook/Ending | 9 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=Conversation | 3 |
| FunnelUserTotalCount | NONE · where FunnelName=Conversation | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 9 |
| FunnelUserTotalCount | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserTotalCount | NONE · where FunnelName=Session | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=Session | 6 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=FollowMe | 3 |
| FunnelUserTotalCount | NONE · where FunnelName=FollowMe | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=Messages | 6 |
| FunnelUserTotalCount | NONE · where FunnelName=Messages | 1 |
| FunnelUserTotalCount | NONE · where FunnelName=MessagePack | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=MessagePack | 3 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=EndingOthers | 3 |
| FunnelUserTotalCount | NONE · where FunnelName=EndingOthers | 1 |
| FunnelUserTotalCount | NONE · where FunnelName=Notebook | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=Notebook | 4 |
| FunnelUserTotalCount | NONE · where FunnelName=Ending | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=Ending | 3 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelStep=1/2/3/4/5/6/7/8/9,FunnelName=Conversation/FUNNEL_TYPE_ONBOARDING/Session/FollowMe/Messages/MessagePack/EndingOthers/Notebook/Ending | 9 |
| FunnelUserTotalCount | NONE · where FunnelName=Conversation/FUNNEL_TYPE_ONBOARDING/Session/FollowMe/Messages/MessagePack/EndingOthers/Notebook/Ending | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=Conversation/FUNNEL_TYPE_ONBOARDING/Session/FollowMe/Messages/MessagePack/EndingOthers/Notebook/Ending | 9 |
| ItemMonetizationRevenue | ONE_HOUR | 86 |
| ItemMonetizationRevenue | ONE_HOUR · by ProductType | 258 |
| L7AveragePlayTimeMinutesPerDAU | — | 4 |
| MemoryUsageAvg | ONE_DAY · where Place=74542317333958 | 4 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=74542317333958 | 20 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=74542317333958 | 9 |
| MemoryUsageAvg | ONE_DAY · where Place=74542317333958 | 4 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=74542317333958 | 20 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=74542317333958 | 9 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 21 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 9 |
| MonthlyActiveUsers | ONE_DAY · by Locale | 150 |
| MonthlyActiveUsers | ONE_DAY · by Country | 663 |
| MonthlyActiveUsers | ONE_DAY | 3 |
| MonthlyActiveUsers | — | 2 |
| OomUnexpectedExits | ONE_DAY · where Place=74542317333958 | 5 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=74542317333958 | 14 |
| OomUnexpectedExits | ONE_DAY · where Place=74542317333958 | 5 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=74542317333958 | 14 |
| PayingUsers | ONE_DAY | 3 |
| PayingUsers | — | 2 |
| PayingUsersCVR | ONE_DAY | 3 |
| PayingUsersCVR | ONE_DAY · by Platform | 18 |
| PayingUsersCVR | — | 4 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=74542317333958 | 30 |
| PeakConcurrentPlayers | ONE_DAY · where Place=74542317333958 | 5 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=74542317333958 | 30 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=74542317333958 | 30 |
| PeakConcurrentPlayers | ONE_DAY · where Place=74542317333958 | 5 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=74542317333958 | 30 |
| PlayerFeedbackVotesCount | ONE_DAY | 3 |
| PotentialExtraEarningsTotalUsd | NONE | 1 |
| RFYD1CoplayDays | ONE_DAY | 3 |
| RFYD1Playtime | ONE_DAY | 3 |
| RFYD1QualifiedPlaySessions | ONE_DAY | 3 |
| RFYD1RobuxSpend | ONE_DAY | 3 |
| RFYD1SpendDay | ONE_DAY | 3 |
| RFYD2To7CoplayDays | ONE_DAY | 3 |
| RFYD2To7PlayDays | ONE_DAY | 3 |
| RFYD2To7Playtime | ONE_DAY | 3 |
| RFYD2To7QualifiedPlaySessions | ONE_DAY | 3 |
| RFYD2To7RobuxSpend | ONE_DAY | 3 |
| RFYD2To7SpendDays | ONE_DAY | 3 |
| RFYDuration0To60 | ONE_DAY | 3 |
| RFYDuration61To180 | ONE_DAY | 3 |
| RFYL7PlayDays | ONE_DAY | 3 |
| RFYL7PlayDays | — | 4 |
| RFYPlayThroughRate | ONE_DAY | 3 |
| RFYQualifiedPTR | ONE_DAY | 3 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | ONE_DAY | 3 |
| RSVPCount | ONE_DAY | 2 |
| ServerFrameRateP10 | ONE_DAY · where Place=74542317333958 | 5 |
| ServerFrameRateP10 | ONE_DAY · where Place=74542317333958 | 5 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=74542317333958 | 5 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=74542317333958 | 30 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=74542317333958 | 5 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=74542317333958 | 30 |
| TotalPlayTimeHours | ONE_DAY | 3 |
| TotalPlayTimeHours | — | 2 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY | 2 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 10 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 2 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 8 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 2 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 2 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation | 2 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 8 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 5 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 8 |
| UniqueUsersWithPlaySessions | ONE_DAY | 2 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 2 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 8 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 2 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 5 |
| UsersJoinedFromNotifications | ONE_DAY | 2 |
| Visits | ONE_DAY | 3 |
| Visits | ONE_DAY · by Platform | 18 |
| Visits | — | 2 |
