# Grab report — universe 10399712766

- Window: **2026-08-15 → 2026-09-12**
- Plan source: seed
- Discovered dimension values: **__places**: 83256791430098 · **FunnelName**: FUNNEL_TYPE_ONBOARDING · **FunnelStep**: 1, 2, 3 · **PlaceVersion**: 1228, 1240, 1241, 1244, 1246, 1250, 1251 · **Place**: 83256791430098 · **FirstSeenPlaceVersion**: 1228, 1197, 178, 1246, 1207, 1214, 1223, 1215, 1218, 1192, 1240, 1217, 1250, 1216, 786, 1244, 1241
- Requested 223 · **186 returned data** · 25 empty · 22 failed — of which 0 aged out (data Roblox no longer stores) and **5 on observed/proven shapes (look here first)**

## Failed — observed/proven shapes (real problems)

The dashboard itself sends these shapes (or they have returned data before). A failure here means capture is broken or the API changed — it is never evidence about the game.

| Metric | Kind | Shape | HTTP | Provenance | Error |
|---|---|---|---|---|---|
| — | dimensions | by MessageHash | 500 | observed | — |
| — | annotations | — | 400 | proven | — |
| DailyRevenue | benchmark | — | 500 | proven | — |
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
| — | by CustomField1 |
| — | by CustomField2 |
| — | by CustomField3 |
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
| — | by FunnelStep | 3 |
| — | by PlaceVersion | 7 |
| — | by Place | 1 |
| — | by FirstSeenPlaceVersion | 17 |
| — | — | 99 |
| — | — | 100 |
| annotation:ENGINE_RELEASE | — | 21 |
| annotation:EXPERIENCE_EVENT_STATE | — | 7 |
| annotation:PLACE_THUMBNAIL | — | 12 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPayerConversionRatio | ONE_DAY | 20 |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPlaytimePerUserInMinutes | ONE_DAY | 20 |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DRobuxPerUser | ONE_DAY | 20 |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| AttributionD1RetentionRatio | ONE_DAY | 25 |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| AttributionD7RetentionRatio | ONE_DAY | 19 |
| AveragePlayTimeMinutesPerDAU | ONE_DAY | 27 |
| AveragePlayTimeMinutesPerDAU | — | 52 |
| AverageRevenuePerPayingUser | ONE_DAY | 26 |
| AverageRevenuePerPayingUser | — | 52 |
| AverageRevenuePerUser | ONE_DAY | 26 |
| AverageRevenuePerUser | — | 52 |
| AverageSessionLengthMinutes | ONE_DAY | 27 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 27 |
| AverageSessionLengthMinutes | ONE_DAY · by Platform | 161 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 27 |
| AverageSessionLengthMinutes | — | 52 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=83256791430098 | 140 |
| ClientCpuTimeAvg | ONE_DAY · where Place=83256791430098 | 28 |
| ClientCrashCount | ONE_DAY · where Place=83256791430098 | 8 |
| ClientCrashCount | ONE_DAY · where Place=83256791430098 | 8 |
| ClientCrashCount | ONE_DAY · where Place=83256791430098 | 8 |
| ClientCrashCount | ONE_DAY · where Place=83256791430098 | 5 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=83256791430098 | 40 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=83256791430098 | 36 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=83256791430098 | 40 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=83256791430098 | 24 |
| ClientCrashRate15m | ONE_DAY · where Place=83256791430098 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=83256791430098 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=83256791430098 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=83256791430098 | 5 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=83256791430098 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=83256791430098 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=83256791430098 | 27 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=83256791430098 | 48 |
| ClientFpsAvg | ONE_DAY · where Place=83256791430098 | 29 |
| ClientFpsP10 | ONE_DAY · where Place=83256791430098 | 29 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=83256791430098 | 171 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=83256791430098 | 29 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=83256791430098 | 171 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=83256791430098 | 29 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=83256791430098 | 171 |
| CpuCoreUtilization | ONE_DAY · where Place=83256791430098 | 27 |
| CpuTimeAvg | ONE_DAY · where Place=83256791430098 | 27 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=83256791430098 | 135 |
| DailyActiveUsers | ONE_DAY · by Locale | 1345 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 189 |
| DailyActiveUsers | ONE_DAY · by Gender | 81 |
| DailyActiveUsers | ONE_DAY · by Country | 5683 |
| DailyActiveUsers | ONE_DAY | 27 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 27 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 27 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 166 |
| DailyActiveUsers | ONE_DAY · by Platform | 161 |
| DailyActiveUsers | — | 26 |
| DailyRevenue | ONE_DAY · by RevenueSource | 105 |
| DailyRevenue | ONE_DAY · by BalanceType | 52 |
| DailyRevenue | ONE_DAY | 26 |
| DauMauStickiness | ONE_DAY | 27 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 5 |
| EndToEndCVR | ONE_DAY | 27 |
| ErrorCount | ONE_DAY | 3 |
| ErrorCount | ONE_DAY · by LogSource | 6 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=83256791430098 | 500 |
| ErrorCount | ONE_DAY · where Place=83256791430098 | 3 |
| ErrorCount | ONE_DAY · by LogSource · where Place=83256791430098 | 6 |
| ErrorCount | NONE · where Place=83256791430098,FirstSeenPlaceVersion=1250 | 1 |
| ErrorCount | HALF_HOUR · where Place=83256791430098 | 33 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=83256791430098 | 66 |
| EventAvgDailyActiveUsers | ONE_DAY | 26 |
| EventAvgDailyRevenue | ONE_DAY | 26 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 26 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 26 |
| ForwardD1Retention | ONE_DAY · by Platform | 157 |
| ForwardD1Retention | ONE_DAY | 26 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 162 |
| ForwardD1Retention | — | 50 |
| ForwardD7Retention | ONE_DAY · by Platform | 121 |
| ForwardD7Retention | ONE_DAY | 20 |
| ForwardD7Retention | — | 38 |
| FunnelCohortCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 84 |
| FunnelCohortSessionCompletionRate | ONE_DAY · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 84 |
| FunnelStepChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelStepOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelStepTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelUserChurnRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelUserOverallCompletionRate | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| FunnelUserStepCompletionRate | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING,FunnelStep=1/2/3 | 3 |
| FunnelUserTotalCount | NONE · by FunnelStep · where FunnelName=FUNNEL_TYPE_ONBOARDING | 3 |
| FunnelUserTotalCount | NONE · where FunnelName=FUNNEL_TYPE_ONBOARDING | 1 |
| ItemMonetizationRevenue | ONE_HOUR · by ProductType | 773 |
| ItemMonetizationRevenue | ONE_HOUR | 227 |
| L7AveragePlayTimeMinutesPerDAU | — | 52 |
| MemoryUsageAvg | ONE_DAY · where Place=83256791430098 | 28 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=83256791430098 | 140 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=83256791430098 | 9 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 189 |
| MonthlyActiveUsers | ONE_DAY · by Locale | 1345 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 81 |
| MonthlyActiveUsers | ONE_DAY · by Country | 5683 |
| MonthlyActiveUsers | ONE_DAY | 27 |
| MonthlyActiveUsers | — | 26 |
| OomUnexpectedExits | ONE_DAY · where Place=83256791430098 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=83256791430098 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=83256791430098 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=83256791430098 | 5 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=83256791430098 | 28 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=83256791430098 | 24 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=83256791430098 | 25 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=83256791430098 | 10 |
| PayingUsers | ONE_DAY | 26 |
| PayingUsers | — | 26 |
| PayingUsersCVR | ONE_DAY | 26 |
| PayingUsersCVR | ONE_DAY · by Platform | 157 |
| PayingUsersCVR | — | 52 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=83256791430098 | 171 |
| PeakConcurrentPlayers | ONE_DAY · where Place=83256791430098 | 29 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=83256791430098 | 34 |
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
| RFYD8To28CoplayDays | ONE_DAY | 27 |
| RFYD8To28PlayDays | ONE_DAY | 27 |
| RFYD8To28Playtime | ONE_DAY | 27 |
| RFYD8To28QualifiedPlaySessions | ONE_DAY | 27 |
| RFYD8To28RobuxSpend | ONE_DAY | 27 |
| RFYD8To28SpendDays | ONE_DAY | 27 |
| RFYDuration0To60 | ONE_DAY | 27 |
| RFYDuration61To180 | ONE_DAY | 27 |
| RFYL7PlayDays | ONE_DAY | 27 |
| RFYL7PlayDays | — | 52 |
| RFYPlayThroughRate | ONE_DAY | 27 |
| RFYQualifiedPTR | ONE_DAY | 27 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | ONE_DAY | 27 |
| RSVPCount | ONE_DAY | 26 |
| ServerCrashCount | ONE_DAY · where Place=83256791430098 | 3 |
| ServerCrashCount | ONE_DAY · where Place=83256791430098 | 2 |
| ServerCrashCount | ONE_DAY · where Place=83256791430098 | 1 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=83256791430098 | 3 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=83256791430098 | 2 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=83256791430098 | 1 |
| ServerFrameRateP10 | ONE_DAY · where Place=83256791430098 | 29 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=83256791430098 | 29 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=83256791430098 | 172 |
| TotalPlayTimeHours | ONE_DAY | 27 |
| TotalPlayTimeHours | — | 26 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY | 27 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 162 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 27 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 135 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 130 |
| UniqueUsersWithPlaySessions | ONE_DAY | 27 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 27 |
| UsersJoinedFromNotifications | ONE_DAY | 26 |
| Visits | ONE_DAY | 27 |
| Visits | ONE_DAY · by Platform | 161 |
| Visits | — | 26 |
