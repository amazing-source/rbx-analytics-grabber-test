# Grab report — universe 10399712766

- Window: **2026-08-27 → 2026-09-10**
- Plan source: seed
- Discovered dimension values: **__places**: 83256791430098 · **FunnelName**: FUNNEL_TYPE_ONBOARDING · **PlaceVersion**: 1241, 1244, 1246 · **Place**: 83256791430098 · **FunnelStep**: 1, 2, 3 · **FirstSeenPlaceVersion**: 1228, 1197, 178, 1214, 1246, 1207, 1223, 1215, 1192, 1218, 1240, 1216, 1217, 1241
- Requested 207 · **171 returned data** · 25 empty · 21 failed — of which 0 aged out (data Roblox no longer stores) and **4 on observed/proven shapes (look here first)**

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
| — | by CustomField1 |
| annotation:PLACE_ICON | — |
| — | — |
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
| Attribution30DRobuxPerUser | ONE_DAY |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others |
| ForwardD30Retention | ONE_DAY |
| ServerCrashCount | ONE_DAY · where Place=83256791430098 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=83256791430098 |
| ServerCrashCount | HALF_HOUR · where Place=83256791430098 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=83256791430098 |
| ForwardD30Retention | — |
| DauMauStickiness | — |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| — | — | 1 |
| — | by FunnelName | 1 |
| — | by PlaceVersion | 3 |
| — | by Place | 1 |
| — | by FunnelStep | 3 |
| — | by FirstSeenPlaceVersion | 14 |
| — | — | 25 |
| — | — | 100 |
| annotation:ENGINE_RELEASE | — | 10 |
| annotation:EXPERIENCE_EVENT_STATE | — | 6 |
| annotation:PLACE_THUMBNAIL | — | 8 |
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
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 13 |
| AverageSessionLengthMinutes | ONE_DAY · by Platform | 78 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 13 |
| AverageSessionLengthMinutes | — | 26 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=83256791430098 | 75 |
| ClientCpuTimeAvg | ONE_DAY · where Place=83256791430098 | 15 |
| ClientCrashCount | ONE_DAY · where Place=83256791430098 | 8 |
| ClientCrashCount | ONE_DAY · where Place=83256791430098 | 7 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=83256791430098 | 39 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=83256791430098 | 35 |
| ClientCrashRate15m | ONE_DAY · where Place=83256791430098 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=83256791430098 | 7 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=83256791430098 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=83256791430098 | 41 |
| ClientFpsAvg | ONE_DAY · where Place=83256791430098 | 15 |
| ClientFpsP10 | ONE_DAY · where Place=83256791430098 | 15 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=83256791430098 | 89 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=83256791430098 | 15 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=83256791430098 | 89 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=83256791430098 | 15 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=83256791430098 | 89 |
| CpuCoreUtilization | ONE_DAY · where Place=83256791430098 | 14 |
| CpuTimeAvg | ONE_DAY · where Place=83256791430098 | 14 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=83256791430098 | 70 |
| DailyActiveUsers | ONE_DAY · by Locale | 649 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 91 |
| DailyActiveUsers | ONE_DAY · by Country | 2676 |
| DailyActiveUsers | ONE_DAY · by Gender | 39 |
| DailyActiveUsers | ONE_DAY | 13 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 13 |
| DailyActiveUsers | ONE_DAY · by Platform | 78 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 13 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 78 |
| DailyActiveUsers | — | 13 |
| DailyRevenue | ONE_DAY · by RevenueSource | 52 |
| DailyRevenue | ONE_DAY · by BalanceType | 26 |
| DailyRevenue | ONE_DAY | 13 |
| DailyRevenue | — | 13 |
| DauMauStickiness | ONE_DAY | 13 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 5 |
| EndToEndCVR | ONE_DAY | 14 |
| ErrorCount | ONE_DAY · by LogSource | 4 |
| ErrorCount | ONE_DAY | 2 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=83256791430098 | 115 |
| ErrorCount | ONE_DAY · where Place=83256791430098 | 2 |
| ErrorCount | ONE_DAY · by LogSource · where Place=83256791430098 | 4 |
| ErrorCount | NONE · where Place=83256791430098,FirstSeenPlaceVersion=1246 | 1 |
| ErrorCount | HALF_HOUR · where Place=83256791430098 | 37 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=83256791430098 | 74 |
| EventAvgDailyActiveUsers | ONE_DAY | 13 |
| EventAvgDailyRevenue | ONE_DAY | 13 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 13 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 13 |
| ForwardD1Retention | ONE_DAY | 12 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 72 |
| ForwardD1Retention | ONE_DAY · by Platform | 72 |
| ForwardD1Retention | — | 24 |
| ForwardD7Retention | ONE_DAY | 6 |
| ForwardD7Retention | ONE_DAY · by Platform | 36 |
| ForwardD7Retention | — | 12 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 45 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 45 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING,FunnelStep=1/2/3 | 3 |
| FunnelUserTotalCount | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| ItemMonetizationRevenue | ONE_HOUR · by ProductType | 697 |
| ItemMonetizationRevenue | ONE_HOUR | 199 |
| L7AveragePlayTimeMinutesPerDAU | — | 26 |
| MemoryUsageAvg | ONE_DAY · where Place=83256791430098 | 15 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=83256791430098 | 75 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=83256791430098 | 9 |
| MonthlyActiveUsers | ONE_DAY · by Locale | 649 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 91 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 39 |
| MonthlyActiveUsers | ONE_DAY · by Country | 2676 |
| MonthlyActiveUsers | ONE_DAY | 13 |
| MonthlyActiveUsers | — | 13 |
| OomUnexpectedExits | ONE_DAY · where Place=83256791430098 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=83256791430098 | 7 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=83256791430098 | 21 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=83256791430098 | 18 |
| PayingUsers | ONE_DAY | 13 |
| PayingUsers | — | 13 |
| PayingUsersCVR | ONE_DAY | 13 |
| PayingUsersCVR | ONE_DAY · by Platform | 78 |
| PayingUsersCVR | — | 26 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=83256791430098 | 89 |
| PeakConcurrentPlayers | ONE_DAY · where Place=83256791430098 | 15 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=83256791430098 | 49 |
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
| RFYD8To28CoplayDays | ONE_DAY | 14 |
| RFYD8To28PlayDays | ONE_DAY | 14 |
| RFYD8To28Playtime | ONE_DAY | 14 |
| RFYD8To28QualifiedPlaySessions | ONE_DAY | 14 |
| RFYD8To28RobuxSpend | ONE_DAY | 14 |
| RFYD8To28SpendDays | ONE_DAY | 14 |
| RFYDuration0To60 | ONE_DAY | 14 |
| RFYDuration61To180 | ONE_DAY | 14 |
| RFYL7PlayDays | ONE_DAY | 14 |
| RFYL7PlayDays | — | 26 |
| RFYPlayThroughRate | ONE_DAY | 14 |
| RFYQualifiedPTR | ONE_DAY | 14 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | ONE_DAY | 14 |
| RSVPCount | ONE_DAY | 13 |
| ServerCrashCount | ONE_DAY · where Place=83256791430098 | 1 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=83256791430098 | 1 |
| ServerFrameRateP10 | ONE_DAY · where Place=83256791430098 | 15 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=83256791430098 | 15 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=83256791430098 | 90 |
| TotalPlayTimeHours | ONE_DAY | 13 |
| TotalPlayTimeHours | — | 13 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY | 14 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 84 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 14 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 70 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 6 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 63 |
| UniqueUsersWithPlaySessions | ONE_DAY | 14 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 14 |
| UsersJoinedFromNotifications | ONE_DAY | 13 |
| Visits | ONE_DAY · by Platform | 78 |
| Visits | ONE_DAY | 13 |
| Visits | — | 13 |
