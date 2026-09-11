# Grab report — universe 9610561918

- Window: **2026-06-01 → 2026-09-12**
- Plan source: seed
- Discovered dimension values: **__places**: 125003919504672 · **PlaceVersion**: 3824, 3825, 3826, 3829, 3831, 3834, 3837, 3848, 3852, 3855 · **Place**: 125003919504672 · **FirstSeenPlaceVersion**: 3760, 3727, 3852, 3834, 3837, 3855, 3826, 3810, 3758, 3823, 3759, 3813, 3848, 3822, 3755, 3802, 3825, 3831, 3757, 3801, 3821
- Requested 247 · **183 returned data** · 24 empty · 50 failed — of which 31 aged out (data Roblox no longer stores) and **6 on observed/proven shapes (look here first)**

## Failed — window older than the data (aged out, not a capture problem)

31 requests over 16 metrics. Each of these shapes returned data elsewhere in this same grab, so the query is valid and only the window differs. Roblox keeps crash/performance for ~30 days and `ErrorCount` for ~56; anything older 400s. **This is a gap in coverage, not an absence of incidents** — a technical question about a period further back is unanswerable and must never be read as health. Since 2026-09-03 the planner clamps these windows up front, so a large number here means the grab predates that or ran with `RBX_NO_HORIZON=1`.

| Metric | Requests aged out |
|---|---|
| ClientCpuTimeAvg | 2 |
| ClientCrashCount | 2 |
| ClientCrashRate15m | 2 |
| ClientFpsAvg | 1 |
| ClientFpsP10 | 2 |
| ClientMemoryUsageAvg | 2 |
| ClientMemoryUsagePercentageAvg | 2 |
| CpuCoreUtilization | 1 |
| CpuTimeAvg | 2 |
| ErrorCount | 4 |
| MemoryUsageAvg | 2 |
| OomUnexpectedExits | 2 |
| PeakConcurrentPlayers | 2 |
| ServerCrashCount | 2 |
| ServerFrameRateP10 | 1 |
| SessionDurationSecondsAvg | 2 |

## Failed — observed/proven shapes (real problems)

The dashboard itself sends these shapes (or they have returned data before). A failure here means capture is broken or the API changed — it is never evidence about the game.

| Metric | Kind | Shape | HTTP | Provenance | Error |
|---|---|---|---|---|---|
| — | dimensions | by FunnelName | 403 | observed | — |
| — | dimensions | by CustomField1 | 403 | observed | — |
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
| — | metadata | — | 404 | **no** | — |

## Returned 200 but no data points

**The query was valid and matched nothing.** That is NOT evidence the feature is unused — the most common cause is a filter value that doesn't exist on this universe (e.g. a hardcoded `FunnelName` that belongs to a different game). Verify against the dashboard before concluding anything from a row here.

| Metric | Shape |
|---|---|
| — | by CustomField3 |
| — | by CustomField2 |
| — | by FunnelStep |
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
| ErrorCount | ONE_DAY |
| ErrorCount | ONE_DAY |
| ErrorCount | ONE_DAY · by LogSource |
| ErrorCount | ONE_DAY · by LogSource |
| ErrorCount | ONE_DAY · where Place=125003919504672 |
| ErrorCount | ONE_DAY · where Place=125003919504672 |
| ErrorCount | ONE_DAY · by LogSource · where Place=125003919504672 |
| ErrorCount | ONE_DAY · by LogSource · where Place=125003919504672 |
| DauMauStickiness | — |

## Returned data

| Metric | Shape | Points |
|---|---|---|
| — | — | 1 |
| — | by PlaceVersion | 10 |
| — | by Place | 1 |
| — | by FirstSeenPlaceVersion | 21 |
| — | — | 196 |
| — | — | 100 |
| annotation:ENGINE_RELEASE | — | 65 |
| annotation:EXPERIENCE_EVENT_STATE | — | 64 |
| annotation:PLACE_THUMBNAIL | — | 31 |
| Attribution1DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution1DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution30DRobuxPerUser | ONE_DAY | 72 |
| Attribution30DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPayerConversionRatio | ONE_DAY | 95 |
| Attribution7DPayerConversionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DPlaytimePerUserInMinutes | ONE_DAY | 95 |
| Attribution7DPlaytimePerUserInMinutes | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| Attribution7DRobuxPerUser | ONE_DAY | 95 |
| Attribution7DRobuxPerUser | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| AttributionD1RetentionRatio | ONE_DAY | 100 |
| AttributionD7RetentionRatio | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 7 |
| AttributionD7RetentionRatio | ONE_DAY | 94 |
| AveragePlayTimeMinutesPerDAU | ONE_DAY | 102 |
| AveragePlayTimeMinutesPerDAU | — | 202 |
| AverageRevenuePerPayingUser | ONE_DAY | 101 |
| AverageRevenuePerPayingUser | — | 202 |
| AverageRevenuePerUser | ONE_DAY | 101 |
| AverageRevenuePerUser | — | 202 |
| AverageSessionLengthMinutes | ONE_DAY | 102 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=New | 102 |
| AverageSessionLengthMinutes | ONE_DAY · where IsNewUser=Returning | 102 |
| AverageSessionLengthMinutes | ONE_DAY · by Platform | 595 |
| AverageSessionLengthMinutes | — | 202 |
| ClientCpuTimeAvg | ONE_DAY · where Place=125003919504672 | 6 |
| ClientCpuTimeAvg | ONE_DAY · by ClientCpuTimeCategory · where Place=125003919504672 | 30 |
| ClientCrashCount | ONE_DAY · where Place=125003919504672 | 8 |
| ClientCrashCount | ONE_DAY · where Place=125003919504672 | 8 |
| ClientCrashCount | ONE_DAY · where Place=125003919504672 | 8 |
| ClientCrashCount | ONE_DAY · where Place=125003919504672 | 4 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=125003919504672 | 33 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=125003919504672 | 39 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=125003919504672 | 40 |
| ClientCrashCount | ONE_DAY · by Platform · where Place=125003919504672 | 16 |
| ClientCrashRate15m | ONE_DAY · where Place=125003919504672 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=125003919504672 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=125003919504672 | 8 |
| ClientCrashRate15m | ONE_DAY · where Place=125003919504672 | 4 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=125003919504672 | 44 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=125003919504672 | 48 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=125003919504672 | 45 |
| ClientCrashRate15m | ONE_DAY · by Platform · where Place=125003919504672 | 24 |
| ClientFpsAvg | ONE_DAY · where Place=125003919504672 | 7 |
| ClientFpsP10 | ONE_DAY · where Place=125003919504672 | 7 |
| ClientFpsP10 | ONE_DAY · by Platform · where Place=125003919504672 | 40 |
| ClientMemoryUsageAvg | ONE_DAY · where Place=125003919504672 | 7 |
| ClientMemoryUsageAvg | ONE_DAY · by Platform · where Place=125003919504672 | 40 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · where Place=125003919504672 | 7 |
| ClientMemoryUsagePercentageAvg | ONE_DAY · by Platform · where Place=125003919504672 | 40 |
| CpuCoreUtilization | ONE_DAY · where Place=125003919504672 | 5 |
| CpuTimeAvg | ONE_DAY · where Place=125003919504672 | 5 |
| CpuTimeAvg | ONE_DAY · by CpuTimeCategory · where Place=125003919504672 | 25 |
| DailyActiveUsers | ONE_DAY · by Locale | 5012 |
| DailyActiveUsers | ONE_DAY · by Country | 18487 |
| DailyActiveUsers | ONE_DAY · by AgeGroupV2 | 714 |
| DailyActiveUsers | ONE_DAY · by Gender | 306 |
| DailyActiveUsers | ONE_DAY | 102 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=Returning | 102 |
| DailyActiveUsers | ONE_DAY · where IsNewUser=New | 102 |
| DailyActiveUsers | ONE_DAY · by Platform | 595 |
| DailyActiveUsers | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 625 |
| DailyActiveUsers | — | 101 |
| DailyRevenue | ONE_DAY | 101 |
| DailyRevenue | ONE_DAY · by RevenueSource | 319 |
| DailyRevenue | ONE_DAY · by BalanceType | 195 |
| DailyRevenue | — | 101 |
| DauMauStickiness | ONE_DAY | 102 |
| EndToEndCVR | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others,IsNewUser=New | 5 |
| EndToEndCVR | ONE_DAY | 102 |
| ErrorCount | ONE_DAY | 3 |
| ErrorCount | ONE_DAY · by LogSource | 6 |
| ErrorCount | NONE · by MessageHash · where MessageHash=-1,Place=125003919504672 | 500 |
| ErrorCount | ONE_DAY · where Place=125003919504672 | 3 |
| ErrorCount | NONE · where Place=125003919504672,FirstSeenPlaceVersion=3855 | 1 |
| ErrorCount | ONE_DAY · by LogSource · where Place=125003919504672 | 6 |
| ErrorCount | HALF_HOUR · where Place=125003919504672 | 33 |
| ErrorCount | HALF_HOUR · by LogSource · where Place=125003919504672 | 66 |
| EventAvgDailyActiveUsers | ONE_DAY | 101 |
| EventAvgDailyRevenue | ONE_DAY | 101 |
| EventAvgDailyUserPlaytimeMinutes | ONE_DAY | 101 |
| EventAvgRevenuePerDailyActiveUser | ONE_DAY | 101 |
| ForwardD1Retention | ONE_DAY | 101 |
| ForwardD1Retention | ONE_DAY · by Platform | 595 |
| ForwardD1Retention | ONE_DAY · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 627 |
| ForwardD1Retention | — | 200 |
| ForwardD30Retention | ONE_DAY | 72 |
| ForwardD30Retention | — | 142 |
| ForwardD7Retention | ONE_DAY | 95 |
| ForwardD7Retention | ONE_DAY · by Platform | 568 |
| ForwardD7Retention | — | 188 |
| ItemMonetizationRevenue | ONE_HOUR · by ProductType | 879 |
| ItemMonetizationRevenue | ONE_HOUR | 301 |
| L7AveragePlayTimeMinutesPerDAU | — | 202 |
| MemoryUsageAvg | ONE_DAY · where Place=125003919504672 | 6 |
| MemoryUsageAvg | ONE_DAY · by MemoryUsageCategory · where Place=125003919504672 | 30 |
| MemoryUsageAvg | NONE · by ServerAgeBucket · where Place=125003919504672 | 9 |
| MonthlyActiveUsers | ONE_DAY · by AgeGroupV2 | 714 |
| MonthlyActiveUsers | ONE_DAY · by Gender | 306 |
| MonthlyActiveUsers | ONE_DAY · by Locale | 5012 |
| MonthlyActiveUsers | ONE_DAY · by Country | 18487 |
| MonthlyActiveUsers | ONE_DAY | 102 |
| MonthlyActiveUsers | — | 101 |
| OomUnexpectedExits | ONE_DAY · where Place=125003919504672 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=125003919504672 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=125003919504672 | 8 |
| OomUnexpectedExits | ONE_DAY · where Place=125003919504672 | 4 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=125003919504672 | 24 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=125003919504672 | 28 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=125003919504672 | 26 |
| OomUnexpectedExits | ONE_DAY · by Platform · where Place=125003919504672 | 12 |
| PayingUsers | ONE_DAY | 101 |
| PayingUsers | — | 101 |
| PayingUsersCVR | ONE_DAY | 101 |
| PayingUsersCVR | ONE_DAY · by Platform | 592 |
| PayingUsersCVR | — | 202 |
| PeakConcurrentPlayers | ONE_DAY · by Platform · where Place=125003919504672 | 40 |
| PeakConcurrentPlayers | ONE_DAY · where Place=125003919504672 | 7 |
| PeakConcurrentPlayers | HALF_HOUR · where Place=125003919504672 | 34 |
| PlayerFeedbackVotesCount | ONE_DAY | 102 |
| PotentialExtraEarningsTotalUsd | NONE | 1 |
| RFYD1CoplayDays | ONE_DAY | 102 |
| RFYD1Playtime | ONE_DAY | 102 |
| RFYD1QualifiedPlaySessions | ONE_DAY | 102 |
| RFYD1RobuxSpend | ONE_DAY | 102 |
| RFYD1SpendDay | ONE_DAY | 102 |
| RFYD2To7CoplayDays | ONE_DAY | 102 |
| RFYD2To7PlayDays | ONE_DAY | 102 |
| RFYD2To7Playtime | ONE_DAY | 102 |
| RFYD2To7QualifiedPlaySessions | ONE_DAY | 102 |
| RFYD2To7RobuxSpend | ONE_DAY | 102 |
| RFYD2To7SpendDays | ONE_DAY | 102 |
| RFYD8To28CoplayDays | ONE_DAY | 102 |
| RFYD8To28PlayDays | ONE_DAY | 102 |
| RFYD8To28Playtime | ONE_DAY | 102 |
| RFYD8To28QualifiedPlaySessions | ONE_DAY | 102 |
| RFYD8To28RobuxSpend | ONE_DAY | 102 |
| RFYD8To28SpendDays | ONE_DAY | 102 |
| RFYDuration0To60 | ONE_DAY | 102 |
| RFYDuration61To180 | ONE_DAY | 102 |
| RFYL7PlayDays | ONE_DAY | 102 |
| RFYL7PlayDays | — | 202 |
| RFYPlayThroughRate | ONE_DAY | 102 |
| RFYQualifiedPTR | ONE_DAY | 102 |
| RFYUniqueNotInterestedUsersPerMillionImpressions | ONE_DAY | 102 |
| RSVPCount | ONE_DAY | 101 |
| ServerCrashCount | ONE_DAY · where Place=125003919504672 | 4 |
| ServerCrashCount | ONE_DAY · where Place=125003919504672 | 8 |
| ServerCrashCount | ONE_DAY · where Place=125003919504672 | 8 |
| ServerCrashCount | ONE_DAY · where Place=125003919504672 | 2 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=125003919504672 | 5 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=125003919504672 | 8 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=125003919504672 | 8 |
| ServerCrashCount | ONE_DAY · by CrashType · where Place=125003919504672 | 2 |
| ServerCrashCount | HALF_HOUR · where Place=125003919504672 | 1 |
| ServerCrashCount | HALF_HOUR · by CrashType · where Place=125003919504672 | 1 |
| ServerFrameRateP10 | ONE_DAY · where Place=125003919504672 | 7 |
| SessionDurationSecondsAvg | ONE_DAY · where Place=125003919504672 | 7 |
| SessionDurationSecondsAvg | ONE_DAY · by Platform · where Place=125003919504672 | 42 |
| TotalPlayTimeHours | ONE_DAY | 102 |
| TotalPlayTimeHours | — | 101 |
| TotalSessionsEndedInBucket | NONE · by SessionTimeBucket | 61 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource | 725 |
| UniqueUsersWithImpressions | ONE_DAY | 102 |
| UniqueUsersWithImpressions | ONE_DAY · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 102 |
| UniqueUsersWithImpressions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 620 |
| UniqueUsersWithPlaySessions | NONE · by AcquisitionSource · where AcquisitionSource=HomeRecommendation/Search/Friends/CrossGame/SponsoredAds/PortalAds/Curation/Charts/SearchAds/Others | 8 |
| UniqueUsersWithPlaySessions | ONE_DAY · by AcquisitionSource · where IsNewUser=New | 506 |
| UniqueUsersWithPlaySessions | ONE_DAY | 102 |
| UniqueUsersWithPlaySessions | ONE_DAY · where IsNewUser=New | 102 |
| UsersJoinedFromNotifications | ONE_DAY | 101 |
| Visits | ONE_DAY | 102 |
| Visits | ONE_DAY · by Platform | 595 |
| Visits | — | 101 |
