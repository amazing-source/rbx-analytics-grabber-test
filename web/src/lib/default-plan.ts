// The built-in grab plan: every metric we know Roblox serves, expressed as
// request templates, so an active grab works on a fresh install with an empty
// `grab_templates` table (no passive pass through the dashboard tabs first).
//
// This is NOT a hash table. CLAUDE.md forbids hardcoding `operation.path`
// hashes — those change and are auto-mapped from the request body on ingest.
// What lives here is only the metric NAME + query shape, which is exactly what
// the dashboard itself puts in the request body. Templates harvested from real
// captures are merged over these (same key => the captured one wins), so the
// plan still learns any query shape we didn't anticipate.
//
// The metric list was mined from the dashboard's own `metrics/metadata` calls
// (which enumerate what a universe supports) rather than invented. Breakdown
// dimensions come from observed requests plus the `v1/dimensions` endpoint.
// Anything inferred rather than observed is `optional: true` — those are
// expected to fail on some universes, and failures are now recorded in
// data/games/<id>/grab-report.md instead of vanishing.

import { templateKey, type GrabTemplate } from "./parse-captures";

export type SeedTemplate = GrabTemplate & {
  optional?: boolean;
};

const DAY = "METRIC_GRANULARITY_ONE_DAY";
const HOUR = "METRIC_GRANULARITY_ONE_HOUR";
const NONE = "METRIC_GRANULARITY_NONE";

// Dimension VALUES are per-universe and must be discovered, never assumed.
// Hardcoding `FUNNEL_TYPE_ONBOARDING` (lifted from a different game's capture)
// made every funnel request return 200-with-no-rows on a game whose funnels are
// developer-named — which reads exactly like "the feature isn't used". It isn't.
export const DISCOVER_DIMENSIONS = [
  { namespace: "recommendedEvents.funnel.dimensions", name: "FunnelName" },
  { namespace: "recommendedEvents.funnel.dimensions", name: "CustomField1" },
  { namespace: "recommendedEvents.funnel.dimensions", name: "CustomField2" },
  { namespace: "recommendedEvents.funnel.dimensions", name: "CustomField3" },
  { namespace: "creatorAnalytics.dimensions", name: "PlaceVersion" },
];

// Discovered dimension values, plus `__places` — the universe's place IDs,
// which aren't a dimension but are discovered the same way and are what the
// version-history request needs.
export type Discovered = Record<string, string[]> & { __places?: string[] };
const NEW = [{ dimension: "IsNewUser", values: ["New"] }];
const RETURNING = [{ dimension: "IsNewUser", values: ["Returning"] }];
const SOURCES = [
  {
    dimension: "AcquisitionSource",
    values: ["HomeRecommendation", "Friends", "Others", "Search", "Charts"],
  },
];

type Spec = {
  metric: string;
  granularity: string;
  breakdown?: string[];
  filter?: { dimension: string; values: string[]; operation?: string }[];
  limit?: number;
  optional?: boolean;
};

// Order = replay order, so the metrics that carry the diagnosis land first if a
// long grab is interrupted.
const SPECS: Spec[] = [
  // ---- Discovery / acquisition -------------------------------------------
  // Impressions vs plays is the single chart that separates "shown to fewer
  // people" from "shown to the same people who then leave".
  { metric: "UniqueUsersWithImpressions", granularity: DAY },
  { metric: "UniqueUsersWithImpressions", granularity: DAY, breakdown: ["AcquisitionSource"], optional: true },
  { metric: "UniqueUsersWithImpressions", granularity: DAY, filter: SOURCES, optional: true },
  { metric: "RFYQualifiedPTR", granularity: DAY },
  { metric: "RFYL7PlayDays", granularity: DAY, optional: true },
  { metric: "AttributionD1RetentionRatio", granularity: DAY, optional: true },
  { metric: "Attribution7DPayerConversionRatio", granularity: DAY, optional: true },
  { metric: "Attribution7DPlaytimePerUserInMinutes", granularity: DAY, optional: true },
  { metric: "Attribution7DRobuxPerUser", granularity: DAY, optional: true },
  { metric: "Attribution30DRobuxPerUser", granularity: DAY, optional: true },

  // ---- Retention (the hook + the return loop) ----------------------------
  { metric: "ForwardD1Retention", granularity: DAY },
  { metric: "ForwardD1Retention", granularity: DAY, breakdown: ["Platform"] },
  { metric: "ForwardD1Retention", granularity: DAY, breakdown: ["AcquisitionSource"], filter: SOURCES, optional: true },
  { metric: "ForwardD1Retention", granularity: DAY, breakdown: ["PlaceVersion"], optional: true },
  { metric: "ForwardD7Retention", granularity: DAY },
  { metric: "ForwardD7Retention", granularity: DAY, breakdown: ["Platform"], optional: true },
  { metric: "ForwardD30Retention", granularity: DAY },
  { metric: "DauMauStickiness", granularity: DAY },
  { metric: "DailyCohortRetention", granularity: DAY, breakdown: ["CohortDay"] },
  { metric: "WeeklyCohortRetention", granularity: DAY, breakdown: ["CohortDay"], optional: true },
  { metric: "L7AverageForwardD1Retention", granularity: DAY },
  { metric: "L7AverageForwardD1Retention", granularity: DAY, breakdown: ["AcquisitionSource"], filter: SOURCES },

  // ---- Engagement ---------------------------------------------------------
  { metric: "DailyActiveUsers", granularity: DAY },
  { metric: "DailyActiveUsers", granularity: DAY, filter: NEW },
  { metric: "DailyActiveUsers", granularity: DAY, filter: RETURNING },
  // Daily, not NONE — at NONE this returns one aggregate point and no trend,
  // which is useless for "did discovery change on date X".
  { metric: "DailyActiveUsers", granularity: DAY, breakdown: ["AcquisitionSource"], filter: SOURCES },
  { metric: "DailyActiveUsers", granularity: DAY, breakdown: ["Platform"], optional: true },
  { metric: "DailyActiveUsers", granularity: DAY, breakdown: ["PlaceVersion"], optional: true },
  { metric: "MonthlyActiveUsers", granularity: DAY },
  { metric: "Visits", granularity: DAY },
  { metric: "Visits", granularity: DAY, breakdown: ["Platform"], optional: true },
  { metric: "AverageSessionLengthMinutes", granularity: DAY },
  { metric: "AverageSessionLengthMinutes", granularity: DAY, filter: NEW },
  { metric: "AverageSessionLengthMinutes", granularity: DAY, filter: RETURNING },
  { metric: "AverageSessionLengthMinutes", granularity: DAY, breakdown: ["Platform"], optional: true },
  { metric: "AverageSessionLengthMinutes", granularity: DAY, breakdown: ["PlaceVersion"], optional: true },
  { metric: "AveragePlayTimeMinutesPerDAU", granularity: DAY },
  { metric: "L7AveragePlayTimeMinutesPerDAU", granularity: DAY },
  { metric: "L7AverageDailyActiveUsers", granularity: DAY },
  { metric: "TotalPlayTimeHours", granularity: DAY },
  { metric: "UniqueUsersWithPlaySessions", granularity: DAY },
  { metric: "UniqueUsersWithPlaySessions", granularity: DAY, filter: NEW },
  { metric: "L7AverageUniqueUsersWithPlaySessions", granularity: DAY, breakdown: ["AcquisitionSource"], filter: NEW },
  { metric: "TotalSessionsEndedInBucket", granularity: NONE, breakdown: ["SessionTimeBucket"] },
  // PeakConcurrentPlayers moved to perfSpecs() — it needs a Place filter and
  // ONE_DAY. At HOUR with no filter it 400s. `ConcurrentPlayers` is a live
  // tile the dashboard only ever queries at ONE_MINUTE over ~1 day; replaying
  // it across a 28-day window is meaningless, so it is not seeded at all.

  // ---- Monetization -------------------------------------------------------
  { metric: "PayingUsersCVR", granularity: DAY },
  { metric: "PayingUsersCVR", granularity: DAY, breakdown: ["Platform"], optional: true },
  { metric: "AverageRevenuePerPayingUser", granularity: DAY },
  { metric: "AverageRevenuePerUser", granularity: DAY },
  { metric: "PayingUsers", granularity: DAY },
  { metric: "DailyRevenue", granularity: DAY },
  { metric: "DailyRevenue", granularity: DAY, breakdown: ["RevenueSource"] },
  { metric: "DailyRevenue", granularity: DAY, breakdown: ["BalanceType"] },
  { metric: "DailyRevenue", granularity: DAY, breakdown: ["PlaceVersion"], optional: true },
  { metric: "L7AverageDailyRevenue", granularity: DAY },
  // Passes vs Dev Products — the idle-monetization thesis.
  { metric: "ItemMonetizationRevenue", granularity: HOUR, breakdown: ["ProductType"] },
  { metric: "ItemMonetizationRevenue", granularity: HOUR },
  { metric: "PotentialExtraEarningsTotalUsd", granularity: NONE },

  // ---- Errors / deploy tracking -------------------------------------------
  // These two work without a Place filter. Everything else in error-reporting
  // does NOT — see perfSpecs() below.
  { metric: "ErrorCount", granularity: DAY },
  { metric: "ErrorCount", granularity: DAY, breakdown: ["LogSource"] },

  // ---- Live-ops events -----------------------------------------------------
  // Whether a scheduled event ran, and what it was worth.
  { metric: "EventAvgDailyActiveUsers", granularity: DAY, optional: true },
  { metric: "EventAvgDailyRevenue", granularity: DAY, optional: true },
  { metric: "EventAvgDailyUserPlaytimeMinutes", granularity: DAY, optional: true },
  { metric: "EventAvgRevenuePerDailyActiveUser", granularity: DAY, optional: true },
  { metric: "RSVPCount", granularity: DAY, optional: true },
  { metric: "UsersJoinedFromNotifications", granularity: DAY, optional: true },
  { metric: "PlayerFeedbackVotesCount", granularity: DAY, optional: true },
  { metric: "RFYUniqueNotInterestedUsersPerMillionImpressions", granularity: DAY },
  { metric: "EndToEndCVR", granularity: DAY, optional: true },
  { metric: "AttributionD7RetentionRatio", granularity: DAY, optional: true },

  // ---- Performance / technical health -------------------------------------
  // Deliberately empty: every performance metric requires a Place filter and is
  // therefore generated per-universe in perfSpecs() below.
];

// PERFORMANCE + ERROR REPORTING — the Place filter is MANDATORY.
//
// This whole block used to sit in SPECS with no filter and at HOUR granularity.
// Every request 400'd, which the grab report faithfully recorded as "failed",
// and the metrics/metadata call returned these names with no
// `latestAvailableTime` — so the evidence pointed at "this universe doesn't
// serve performance data". It serves all of it. The dashboard's own requests
// (captured 2026-08-08 on universe 9610561918) carry
// `filter:[{dimension:"Place",values:[placeId]}]` on every single one, and
// query them at ONE_DAY, not ONE_HOUR.
//
// The lesson matching CLAUDE.md's rule about dimension VALUES: a 400 on a query
// shape we invented is not evidence about the game. Only the dashboard's own
// request shape is evidence.
//
// `ClientCrashRate15m` is the rate to trend (crash COUNT tracks DAU, so it
// falls when the game shrinks and looks like an improvement). `ClientFpsP10` is
// the low-end tail — the players most likely to churn over performance.
function perfSpecs(places: string[]): Spec[] {
  // No places discovered => emit nothing. An absent request is honest; a
  // request we know will 400 just refills the failure table with noise.
  if (!places.length) return [];
  const place = [{ dimension: "Place", values: places }];
  const daily = (metric: string, breakdown?: string[], optional?: boolean): Spec => ({
    metric,
    granularity: DAY,
    breakdown,
    filter: place,
    optional,
  });
  return [
    // Crashes / stability
    daily("ClientCrashRate15m"),
    daily("ClientCrashCount"),
    daily("OomUnexpectedExits"),
    daily("ServerCrashCount"),
    daily("ClientCrashRate15m", ["Platform"], true),
    daily("ClientCrashCount", ["Platform"], true),
    daily("OomUnexpectedExits", ["Platform"], true),
    daily("ServerCrashCount", ["CrashType"], true),
    // Frame rate / memory / CPU
    daily("ClientFpsP10"),
    daily("ClientMemoryUsageAvg"),
    daily("ClientMemoryUsagePercentageAvg"),
    daily("ClientCpuTimeAvg"),
    daily("MemoryUsageAvg"),
    daily("CpuTimeAvg"),
    daily("CpuCoreUtilization"),
    daily("ClientFpsP10", ["Platform"], true),
    daily("ClientMemoryUsageAvg", ["Platform"], true),
    daily("ClientMemoryUsagePercentageAvg", ["Platform"], true),
    daily("PeakConcurrentPlayers", ["Platform"], true),
    daily("ClientCpuTimeAvg", ["ClientCpuTimeCategory"], true),
    daily("CpuTimeAvg", ["CpuTimeCategory"], true),
    daily("MemoryUsageAvg", ["MemoryUsageCategory"], true),
    daily("PeakConcurrentPlayers"),
    // Error reporting. MessageHash — NOT "ErrorMessage", which was a guess and
    // 400'd — is what identifies an individual error. The NOT_CONTAINS "-1"
    // filter is the dashboard's way of dropping unhashed/unknown entries.
    {
      metric: "ErrorCount",
      granularity: NONE,
      breakdown: ["MessageHash"],
      filter: [
        { dimension: "MessageHash", values: ["-1"], operation: "FILTER_OPERATION_NOT_CONTAINS" },
        ...place,
      ],
      limit: 500,
    },
    daily("ErrorCount"),
    daily("ErrorCount", ["LogSource"]),
  ];
}

// Benchmarks only exist for the metrics Roblox publishes genre percentiles for.
// Asking outside this set returns an empty result, so keep it tight.
export const DEFAULT_BENCHMARK_METRICS = [
  "ForwardD1Retention",
  "ForwardD7Retention",
  "ForwardD30Retention",
  "DauMauStickiness",
  "PayingUsersCVR",
  "AverageRevenuePerPayingUser",
  "AverageRevenuePerUser",
  "DailyRevenue",
  "PayingUsers",
  "DailyActiveUsers",
  "MonthlyActiveUsers",
  "Visits",
  "AverageSessionLengthMinutes",
  "AveragePlayTimeMinutesPerDAU",
  "TotalPlayTimeHours",
  "L7AverageDailyActiveUsers",
  "L7AverageDailyRevenue",
  "L7AveragePlayTimeMinutesPerDAU",
  "RFYL7PlayDays",
];

// Funnels are generated per discovered funnel name. The NONE-granularity
// requests reproduce the dashboard's table; the ONE_DAY ones are the reason
// this matters — a step's churn over time is how you see a hook break on a
// specific date rather than as a 28-day average.
function funnelSpecs(names: string[]): Spec[] {
  const out: Spec[] = [];
  for (const name of names) {
    const f = [{ dimension: "FunnelName", values: [name] }];
    out.push(
      { metric: "FunnelUserStepCompletionRate", granularity: NONE, breakdown: ["FunnelStep"], filter: f },
      { metric: "FunnelUserChurnRate", granularity: NONE, breakdown: ["FunnelStep"], filter: f },
      { metric: "FunnelUserTotalCount", granularity: NONE, breakdown: ["FunnelStep"], filter: f },
      { metric: "FunnelUserTotalCount", granularity: NONE, filter: f },
      { metric: "FunnelUserOverallCompletionRate", granularity: NONE, filter: f },
      { metric: "FunnelStepTotalCount", granularity: NONE, breakdown: ["FunnelStep"], filter: f },
      // over time — the diagnostic pull
      { metric: "FunnelUserChurnRate", granularity: DAY, breakdown: ["FunnelStep"], filter: f, optional: true },
      { metric: "FunnelUserStepCompletionRate", granularity: DAY, breakdown: ["FunnelStep"], filter: f, optional: true },
      { metric: "FunnelUserOverallCompletionRate", granularity: DAY, filter: f, optional: true },
      { metric: "FunnelUserTotalCount", granularity: DAY, breakdown: ["FunnelStep"], filter: f, optional: true },
      // The only funnel metrics Roblox itself serves as a daily series — this
      // is how you see a progression loop break on a date instead of as a
      // 28-day average. Highest-value funnel pull there is.
      { metric: "FunnelCohortCompletionRate", granularity: DAY, breakdown: ["FunnelStep"], filter: f },
      { metric: "FunnelCohortSessionCompletionRate", granularity: DAY, breakdown: ["FunnelStep"], filter: f },
      // event-counted variants
      { metric: "FunnelStepCompletionRate", granularity: NONE, breakdown: ["FunnelStep"], filter: f, optional: true },
      { metric: "FunnelStepChurnRate", granularity: NONE, breakdown: ["FunnelStep"], filter: f, optional: true },
      { metric: "FunnelStepOverallCompletionRate", granularity: NONE, filter: f, optional: true }
    );
  }
  return out;
}

function toTemplate(s: Spec): SeedTemplate {
  const query = {
    metric: s.metric,
    granularity: s.granularity,
    breakdown: s.breakdown ? [{ dimensions: s.breakdown }] : [],
    filter: s.filter ?? [],
    limit: s.limit,
  };
  return {
    key: templateKey("metric", query),
    kind: "metric",
    metric: s.metric,
    resourceType: "RESOURCE_TYPE_UNIVERSE",
    query,
    optional: s.optional,
  };
}

// `discovered` comes from the dimensions endpoint for THIS universe. With no
// funnel names discovered we emit no funnel requests at all, rather than
// guessing a value and manufacturing a confident-looking empty result.
export function buildSeedTemplates(discovered?: Discovered): SeedTemplate[] {
  const funnelNames = discovered?.FunnelName ?? [];
  const places = discovered?.__places ?? [];
  return [
    ...SPECS.map(toTemplate),
    ...perfSpecs(places).map(toTemplate),
    ...funnelSpecs(funnelNames).map(toTemplate),
    ...BENCHMARK_TEMPLATES,
  ];
}

const BENCHMARK_TEMPLATES: SeedTemplate[] = [
  ...DEFAULT_BENCHMARK_METRICS.map((metric) => {
    const query = { metric, filter: [] as unknown[] };
    return {
      key: templateKey("benchmark", query),
      kind: "benchmark" as const,
      metric,
      resourceType: "RESOURCE_TYPE_UNIVERSE",
      query,
    };
  }),
];
