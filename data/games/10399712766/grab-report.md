# Grab report — universe 10399712766

- Window: **2026-09-01 → 2026-09-05**
- Plan source: seed+learned
- Discovered dimension values: **__places**: 83256791430098 · **FunnelName**: FUNNEL_TYPE_ONBOARDING · **PlaceVersion**: 1244 · **Place**: 83256791430098 · **FirstSeenPlaceVersion**: 1228, 1197, 178, 1207, 1223, 1215, 1218, 1240, 1216, 1244, 1192, 1217, 1241, 1214, 786
- Requested 279 · **217 returned data** · 42 empty · 30 failed — of which 0 aged out (data Roblox no longer stores) and **17 on observed/proven shapes (look here first)**

## Failed — observed/proven shapes (real problems)

The dashboard itself sends these shapes (or they have returned data before). A failure here means capture is broken or the API changed — it is never evidence about the game.

| Metric | Kind | Shape | HTTP | Provenance | Error |
|---|---|---|---|---|---|
| — | dimensions | by FunnelStep | 403 | observed | — |
| — | dimensions | by CustomField1 | 403 | observed | — |
| — | dimensions | by MessageHash | 500 | observed | — |
| — | annotations | — | 400 | proven | — |
| L7AverageForwardD1Retention | metric | ONE_DAY | 400 | observed | — |
| L7AveragePlayTimeMinutesPerDAU | metric | ONE_DAY | 400 | observed | — |
| L7AverageDailyActiveUsers | metric | ONE_DAY | 400 | observed | — |
| L7AverageDailyRevenue | metric | ONE_DAY | 400 | observed | — |
| DailyRevenue | benchmark | — | 500 | proven | — |
| L7AverageDailyActiveUsers | benchmark | — | 404 | observed | — |
| L7AverageDailyRevenue | benchmark | — | 404 | observed | — |
| L7AverageUniqueUsersWithPlaySessions | metric | ONE_DAY · where IsNewUser=New | 400 | observed | — |
| ItemTotalCreatorEarning | metric | NONE · by AvatarItemId+AvatarItemTargetType | 403 | observed | — |
| ItemTotalTransactionCount | metric | NONE · by AvatarItemId+AvatarItemTargetType | 403 | observed | — |
| L7AverageForwardD1Retention | metric | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Others/Friends/Search | 400 | observed | — |
| L7AverageUniqueUsersWithPlaySessions | metric | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 400 | observed | — |
| L7AverageForwardD1Retention | metric | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 400 | observed | — |

## Failed — inferred shapes (probably not valid here)

Query shapes we constructed without a captured example. A failure usually means the dimension isn't valid for this universe. **Never report these as findings about the game.**

| Metric | Kind | Shape | HTTP | optional | Error |
|---|---|---|---|---|---|
| — | placeVersions | — | 500 | yes | — |
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
| — | by CustomField3 |
| — | by CustomField2 |
| annotation:PLACE_ICON | — |
| — | — |
| — | — |
| — | — |
| annotation:EXPERIENCE_EVENT_STATE | — |
| annotation:FUNNEL | — |
| — | — |
| — | — |
| — | — |
| — | — |
| — | — |
| — | — |
| annotation:CREATOR_REGEX_CHANGE | — |
| Attribution7DPayerConversionRatio | ONE_DAY |
| Attribution7DRobuxPerUser | ONE_DAY |
| Attribution30DRobuxPerUser | ONE_DAY |
| Attribution7DPlaytimePerUserInMinutes | ONE_DAY |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| ForwardD7Retention | ONE_DAY |
| ForwardD7Retention | ONE_DAY · by Platform |
| ForwardD30Retention | ONE_DAY |
| AttributionD7RetentionRatio | ONE_DAY |
| ServerCrashCount | HALF_HOUR · where Place=83256791430098 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=83256791430098 |
| ForwardD7Retention | — |
| ForwardD30Retention | — |
| DauMauStickiness | — |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| ServerCrashCount | HALF_HOUR · where Place=83256791430098 |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=83256791430098 |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| — | — | 1 |
| — | by FunnelName | 1 |
| — | by PlaceVersion | 1 |
| — | by Place | 1 |
| — | by FirstSeenPlaceVersion | 15 |
| — | — | 5 |
| annotation:ENGINE_RELEASE | — | 3 |
| annotation:PLACE_THUMBNAIL | — | 3 |
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
| AverageSessionLengthMinutes | ONE_DAY | 3 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 3 |
| AverageSessionLengthMinutes | ONE_DAY · by Platform | 18 |
| AverageSessionLengthMinutes | — | 4 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 3 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 3 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=83256791430098 | 20 |
| ClientCpuTimeAvg | ONE_DAY · where Place=83256791430098 | 4 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=83256791430098 | 20 |
| ClientCpuTimeAvg | ONE_DAY · where Place=83256791430098 | 4 |
| ClientCrashCount | ONE_DAY · where Place=83256791430098 | 5 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=83256791430098 | 25 |
| ClientCrashCount | ONE_DAY · where Place=83256791430098 | 5 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=83256791430098 | 25 |
| ClientCrashRate15m | ONE_DAY · where Place=83256791430098 | 5 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=83256791430098 | 29 |
| ClientCrashRate15m | ONE_DAY · where Place=83256791430098 | 5 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=83256791430098 | 29 |
| ClientFpsAvg | ONE_DAY · where Place=83256791430098 | 5 |
| ClientFpsAvg | ONE_DAY · where Place=83256791430098 | 5 |
| ClientFpsP10 | ONE_DAY · where Place=83256791430098 | 5 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=83256791430098 | 29 |
| ClientFpsP10 | ONE_DAY · where Place=83256791430098 | 5 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=83256791430098 | 29 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=83256791430098 | 5 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=83256791430098 | 29 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=83256791430098 | 5 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=83256791430098 | 29 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=83256791430098 | 5 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=83256791430098 | 29 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=83256791430098 | 5 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=83256791430098 | 29 |
| CpuCoreUtilization | ONE_DAY · where Place=83256791430098 | 3 |
| CpuCoreUtilization | ONE_DAY · where Place=83256791430098 | 3 |
| CpuTimeAvg | ONE_DAY · where Place=83256791430098 | 3 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=83256791430098 | 15 |
| CpuTimeAvg | ONE_DAY · where Place=83256791430098 | 3 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=83256791430098 | 15 |
| DailyActiveUsers | ONE_DAY · by Locale | 150 |
| DailyActiveUsers | ONE_DAY · by Gender | 9 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 21 |
| DailyActiveUsers | ONE_DAY · by Country | 627 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 3 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 3 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 18 |
| DailyActiveUsers | ONE_DAY | 3 |
| DailyActiveUsers | ONE_DAY · by Platform | 18 |
| DailyActiveUsers | — | 2 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 15 |
| DailyActiveUsers | NONE · by AcquisitionSource · where IsNewUser=New | 5 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 3 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 3 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 18 |
| DailyCohortRetention | ONE_DAY · by CohortDay | 3 |
| DailyRevenue | ONE_DAY · by RevenueSource | 13 |
| DailyRevenue | ONE_DAY | 3 |
| DailyRevenue | ONE_DAY · by BalanceType | 6 |
| DauMauStickiness | ONE_DAY | 3 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 5 |
| EndToEndCVR | ONE_DAY | 2 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 5 |
| ErrorCount | ONE_DAY | 4 |
| ErrorCount | ONE_DAY · by LogSource | 8 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=83256791430098 | 466 |
| ErrorCount | ONE_DAY · where Place=83256791430098 | 4 |
| ErrorCount | ONE_DAY · by LogSource · where Place=83256791430098 | 8 |
| ErrorCount | NONE · where Place=83256791430098,FirstSeenPlaceVersion=1244 | 1 |
| ErrorCount | HALF_HOUR · where Place=83256791430098 | 29 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=83256791430098 | 58 |
| ErrorCount | ONE_DAY · where Place=83256791430098 | 4 |
| ErrorCount | ONE_DAY · by LogSource · where Place=83256791430098 | 8 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=83256791430098 | 466 |
| ErrorCount | NONE · where Place=83256791430098,FirstSeenPlaceVersion=1228/1197/178/1207/1223/1215/1218/1240/1216/1244/1192/1217/1241/1214/786 | 1 |
| ErrorCount | HALF_HOUR · where Place=83256791430098 | 29 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=83256791430098 | 58 |
| EventAvgDailyActiveUsers | ONE_DAY | 2 |
| EventAvgDailyRevenue | ONE_DAY | 2 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 2 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 2 |
| ForwardD1Retention | ONE_DAY · by Platform | 6 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| ForwardD1Retention | ONE_DAY | 1 |
| ForwardD1Retention | — | 2 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 5 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 12 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 12 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 12 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 12 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelStepTotalCount | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelUserTotalCount | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserTotalCount | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| ItemMonetizationRevenue | ONE_HOUR · by ProductType | 320 |
| ItemMonetizationRevenue | ONE_HOUR | 86 |
| L7AveragePlayTimeMinutesPerDAU | — | 4 |
| MemoryUsageAvg | ONE_DAY · where Place=83256791430098 | 4 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=83256791430098 | 20 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=83256791430098 | 9 |
| MemoryUsageAvg | ONE_DAY · where Place=83256791430098 | 4 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=83256791430098 | 20 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=83256791430098 | 9 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 14 |
| MonthlyActiveUsers | ONE_DAY · by Locale | 100 |
| MonthlyActiveUsers | ONE_DAY · by Country | 424 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 6 |
| MonthlyActiveUsers | ONE_DAY | 2 |
| MonthlyActiveUsers | — | 2 |
| OomUnexpectedExits | ONE_DAY · where Place=83256791430098 | 5 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=83256791430098 | 10 |
| OomUnexpectedExits | ONE_DAY · where Place=83256791430098 | 5 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=83256791430098 | 10 |
| PayingUsers | ONE_DAY | 3 |
| PayingUsers | — | 2 |
| PayingUsersCVR | ONE_DAY | 3 |
| PayingUsersCVR | ONE_DAY · by Platform | 18 |
| PayingUsersCVR | — | 4 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=83256791430098 | 29 |
| PeakConcurrentPlayers | ONE_DAY · where Place=83256791430098 | 5 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=83256791430098 | 30 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=83256791430098 | 29 |
| PeakConcurrentPlayers | ONE_DAY · where Place=83256791430098 | 5 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=83256791430098 | 30 |
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
| RFYD8To28CoplayDays | ONE_DAY | 3 |
| RFYD8To28PlayDays | ONE_DAY | 3 |
| RFYD8To28Playtime | ONE_DAY | 3 |
| RFYD8To28QualifiedPlaySessions | ONE_DAY | 3 |
| RFYD8To28RobuxSpend | ONE_DAY | 3 |
| RFYD8To28SpendDays | ONE_DAY | 3 |
| RFYDuration0To60 | ONE_DAY | 3 |
| RFYDuration61To180 | ONE_DAY | 3 |
| RFYL7PlayDays | ONE_DAY | 3 |
| RFYL7PlayDays | — | 4 |
| RFYPlayThroughRate | ONE_DAY | 3 |
| RFYQualifiedPTR | ONE_DAY | 3 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | ONE_DAY | 3 |
| RSVPCount | ONE_DAY | 2 |
| ServerCrashCount | ONE_DAY · where Place=83256791430098 | 1 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=83256791430098 | 1 |
| ServerCrashCount | ONE_DAY · where Place=83256791430098 | 1 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=83256791430098 | 1 |
| ServerFrameRateP10 | ONE_DAY · where Place=83256791430098 | 5 |
| ServerFrameRateP10 | ONE_DAY · where Place=83256791430098 | 5 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=83256791430098 | 5 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=83256791430098 | 29 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=83256791430098 | 5 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=83256791430098 | 29 |
| TotalPlayTimeHours | ONE_DAY | 3 |
| TotalPlayTimeHours | — | 2 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY | 2 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 12 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 2 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 10 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 2 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Friends/Others/Search/Charts | 2 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation | 2 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 10 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 5 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 9 |
| UniqueUsersWithPlaySessions | ONE_DAY | 2 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 2 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 9 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 2 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 5 |
| UsersJoinedFromNotifications | ONE_DAY | 2 |
| Visits | ONE_DAY | 3 |
| Visits | ONE_DAY · by Platform | 18 |
| Visits | — | 2 |
