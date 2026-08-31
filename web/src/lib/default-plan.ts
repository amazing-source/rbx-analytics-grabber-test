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

// Where a query shape's claim to validity comes from:
//   observed — matched against a request the dashboard itself made (a capture
//              in data/raw/). The gold standard; a failure here is a real bug.
//   proven   — our own construction, but it has returned data on a real
//              universe (see data/games/*/grab-report.json).
//   inferred — neither. An inferred shape's failure or empty result says
//              NOTHING about the game. `npm run audit-plan` checks these tags
//              against the capture corpus and fails on untagged guesses.
export type Provenance = "observed" | "proven" | "inferred";

export type SeedTemplate = GrabTemplate & {
  optional?: boolean;
  provenance?: Provenance;
};

const DAY = "METRIC_GRANULARITY_ONE_DAY";
const HOUR = "METRIC_GRANULARITY_ONE_HOUR";
const HALF = "METRIC_GRANULARITY_HALF_HOUR";
const NONE = "METRIC_GRANULARITY_NONE";

// Dimension VALUES are per-universe and must be discovered, never assumed.
// Hardcoding `FUNNEL_TYPE_ONBOARDING` (lifted from a different game's capture)
// made every funnel request return 200-with-no-rows on a game whose funnels are
// developer-named — which reads exactly like "the feature isn't used". It isn't.
// All of these are shapes the dashboard itself sends (observed 2026-08-07/08).
// errorReporting.dimensions/MessageHash is the async hash→text lookup — the
// response may arrive done:false and is polled by the replayer.
export const DISCOVER_DIMENSIONS = [
  { namespace: "recommendedEvents.funnel.dimensions", name: "FunnelName" },
  { namespace: "recommendedEvents.funnel.dimensions", name: "FunnelStep" },
  { namespace: "recommendedEvents.funnel.dimensions", name: "CustomField1" },
  { namespace: "recommendedEvents.funnel.dimensions", name: "CustomField2" },
  { namespace: "recommendedEvents.funnel.dimensions", name: "CustomField3" },
  { namespace: "creatorAnalytics.dimensions", name: "PlaceVersion" },
  { namespace: "errorReporting.dimensions", name: "Place" },
  { namespace: "errorReporting.dimensions", name: "FirstSeenPlaceVersion" },
  { namespace: "errorReporting.dimensions", name: "MessageHash" },
];

// Discovered dimension values, plus `__places` — the universe's place IDs,
// which aren't a dimension but are discovered the same way and are what the
// version-history request needs.
export type Discovered = Record<string, string[]> & { __places?: string[] };
const NEW = [{ dimension: "IsNewUser", values: ["New"] }];
const RETURNING = [{ dimension: "IsNewUser", values: ["Returning"] }];
// The full value list the dashboard itself sends, observed 2026-08-31 on the
// acquisition tab of 9963622286. We shipped five of these for months; the three
// that were missing (CrossGame, PortalAds, Curation) are real traffic sources,
// and a filter that omits a source silently under-counts the "where did the
// traffic go" question it exists to answer. Report-1's list (Continue Play,
// Today's Picks, Teleport, Home other) is the UI's grouping, NOT dimension
// values — do not add those, they 400.
const SOURCES = [
  {
    dimension: "AcquisitionSource",
    values: [
      "HomeRecommendation", "Search", "Friends", "CrossGame", "SponsoredAds",
      "PortalAds", "Curation", "Charts", "SearchAds", "Others",
    ],
  },
];

// Demographic breakdowns, observed 2026-08-31 on the same tab. All four are
// served on MonthlyActiveUsers with no `limit` and no filter — Country came
// back as 203 series, Locale 50, AgeGroupV2 7, Gender 3.
//
// Why these matter for a diagnosis and not just for a slide: geo is the only
// control we hold for "external / seasonal / platform-wide", which is otherwise
// unfalsifiable on a single universe. A decline concentrated in one country is
// not a product regression.
//
// AgeGroupV2 has a large `AgeUnchecked` bucket (60% on 9963622286), so treat
// the known buckets as a sample of the minority whose age is verified, never as
// the audience.
const DEMOGRAPHICS = ["Country", "Locale", "AgeGroupV2", "Gender"];

// Roblox's published Home-ranking signals, one metric per (segment x signal).
// Observed 2026-08-31 on 9963622286's acquisition tab, all returning data.
// Order matches the docs: conversion, then bounce, then the D1 / D2-7 / D8-28
// engagement and spend segments.
const RFY_SIGNALS = [
  "RFYPlayThroughRate",
  "RFYDuration0To60",            // first-play bounce <60s  — negative signal
  "RFYDuration61To180",          // first-play bounce 61-180s — negative signal
  "RFYD1Playtime", "RFYD1CoplayDays", "RFYD1QualifiedPlaySessions",
  "RFYD1RobuxSpend", "RFYD1SpendDay",
  "RFYD2To7PlayDays", "RFYD2To7Playtime", "RFYD2To7CoplayDays",
  "RFYD2To7QualifiedPlaySessions", "RFYD2To7RobuxSpend", "RFYD2To7SpendDays",
  "RFYD8To28PlayDays", "RFYD8To28Playtime", "RFYD8To28CoplayDays",
  "RFYD8To28QualifiedPlaySessions", "RFYD8To28RobuxSpend", "RFYD8To28SpendDays",
];

type Spec = {
  metric: string;
  granularity: string;
  breakdown?: string[];
  filter?: { dimension: string; values: string[]; operation?: string }[];
  limit?: number;
  optional?: boolean;
  provenance?: Provenance;
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
  // Kept, but it is NOT one of the shapes the dashboard sends and it is not in
  // Roblox's public metric list either. The real per-segment signals are the
  // RFY_SIGNALS block below, which supersedes it; the name looks like a leftover
  // from before the 2026-06-15 change moved the window from 7 to 28 days.
  { metric: "RFYL7PlayDays", granularity: DAY, optional: true },
  { metric: "AttributionD1RetentionRatio", granularity: DAY, optional: true },
  { metric: "Attribution7DPayerConversionRatio", granularity: DAY, optional: true },
  { metric: "Attribution7DPlaytimePerUserInMinutes", granularity: DAY, optional: true },
  { metric: "Attribution7DRobuxPerUser", granularity: DAY, optional: true },
  { metric: "Attribution30DRobuxPerUser", granularity: DAY, optional: true },

  // ---- RFY ranking signals ------------------------------------------------
  // Roblox exposes EVERY signal it says it ranks Home recommendations on as its
  // own metric, one per (segment x signal). Observed 2026-08-31 on the
  // acquisition tab of 9963622286; all 20 returned data at ONE_DAY with no
  // breakdown and no filter.
  //
  // Why this block is worth ~20 requests: until now the only way to ask "is the
  // reach cut the platform's doing, or our own signals decaying?" was to proxy
  // it with D1 retention and argue. These ARE the inputs. Roblox's own docs say
  // an impression decline typically FOLLOWS a fall in play-through rate, play
  // days per user or playtime per user, or a rise in first-play bounce — so
  // reading impressions without reading these can mistake a lagged consequence
  // of a product problem for a discovery event.
  //
  // Segment naming is Roblox's own and is inconsistent: `RFYD1SpendDay` is
  // singular while `RFYD2To7SpendDays` and `RFYD8To28SpendDays` are plural, and
  // there is no `RFYD1PlayDays` (play days over one day carries no information).
  // Do not "fix" these names — they are what the request body must say.
  ...RFY_SIGNALS.map((metric) => ({
    metric,
    granularity: DAY,
    provenance: "observed" as const,
  })),

  // ---- Demographics -------------------------------------------------------
  // Observed 2026-08-31, all four served on MonthlyActiveUsers with no limit.
  ...DEMOGRAPHICS.map((dim) => ({
    metric: "MonthlyActiveUsers",
    granularity: DAY,
    breakdown: [dim],
    provenance: "observed" as const,
  })),
  // The same breakdowns on DAU are NOT observed — the dashboard only asks for
  // them on MAU. They are the shape we actually want (a monthly snapshot cannot
  // date a regional decline), so they are worth asking for, but a failure or an
  // empty result here says nothing about the game and must never be reported as
  // a finding. Promote to `observed` only if a capture proves the shape.
  ...DEMOGRAPHICS.map((dim) => ({
    metric: "DailyActiveUsers",
    granularity: DAY,
    breakdown: [dim],
    optional: true,
    provenance: "inferred" as const,
  })),

  // ---- Acquisition-source value table -------------------------------------
  // The per-source quality table the dashboard renders: how each traffic source
  // actually performs downstream. Observed at NONE with an AcquisitionSource
  // breakdown AND filter, which is how the dashboard scopes it.
  //
  // NONE means one aggregate over the requested window, so the date column is
  // the WINDOW START, not a day — moving the window changes the number with no
  // day changing. Never compare two of these taken at different ranges.
  ...["Attribution30DPayerConversionRatio", "Attribution30DRobuxPerUser",
      "Attribution7DPlaytimePerUserInMinutes", "AttributionD7RetentionRatio"]
    .map((metric) => ({
      metric,
      granularity: NONE,
      breakdown: ["AcquisitionSource"],
      filter: SOURCES,
      provenance: "observed" as const,
    })),
  { metric: "EndToEndCVR", granularity: NONE, breakdown: ["AcquisitionSource"],
    filter: [...SOURCES, ...NEW], provenance: "observed" },
  { metric: "UniqueUsersWithPlaySessions", granularity: DAY,
    breakdown: ["AcquisitionSource"], filter: NEW, provenance: "observed" },
  { metric: "UniqueUsersWithImpressions", granularity: DAY,
    breakdown: ["AcquisitionSource"], filter: NEW, provenance: "observed" },

  // ---- Retention (the hook + the return loop) ----------------------------
  { metric: "ForwardD1Retention", granularity: DAY },
  { metric: "ForwardD1Retention", granularity: DAY, breakdown: ["Platform"] },
  { metric: "ForwardD1Retention", granularity: DAY, breakdown: ["AcquisitionSource"], filter: SOURCES, optional: true },
  { metric: "ForwardD1Retention", granularity: DAY, breakdown: ["PlaceVersion"], optional: true },
  { metric: "ForwardD7Retention", granularity: DAY },
  { metric: "ForwardD7Retention", granularity: DAY, breakdown: ["Platform"], optional: true },
  // Returns an empty 200 on a 28-day window and always will: D30 only exists
  // for cohorts at least 30 days old. The dashboard's own export has data for
  // this metric, so the query is right and the window is wrong — widen the
  // grab to see it. Optional so its emptiness stops reading as a defect.
  { metric: "ForwardD30Retention", granularity: DAY, optional: true },
  { metric: "DauMauStickiness", granularity: DAY },
  // 400s on every universe tried — the query shape is wrong and the correct
  // one has never been captured (browse the Retention tab once to learn it).
  // Optional until then: its failure must not read as a problem with the game.
  { metric: "DailyCohortRetention", granularity: DAY, breakdown: ["CohortDay"], optional: true },
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
  // Passes vs Dev Products — the idle-monetization thesis. This is the
  // overview page's "Robux Spent (Realtime)" series, so it RESTATES as
  // transactions settle: re-reads of the same settled hour have moved
  // 353 -> 21,835. The zero-fill bug that made whole hours read as R$0 is
  // fixed; what remains is the metric's own nature, so read a `revision` row
  // in data-quality.md as "this hour is disputed". `DailyRevenue` by
  // `RevenueSource` is the settled, dashboard-verified (27/27) view of the
  // same split — prefer it for any before/after conclusion.
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
function perfSpecs(places: string[], firstSeenVersions: string[] = []): Spec[] {
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
    provenance: "observed",
  });
  const specs: Spec[] = [
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
    // Observed on the dashboard's own perf tab (2026-08-08 capture) but long
    // missing from this plan:
    daily("ServerFrameRateP10"),
    daily("SessionDurationSecondsAvg"),
    daily("SessionDurationSecondsAvg", ["Platform"], true),
    {
      metric: "MemoryUsageAvg",
      granularity: NONE,
      breakdown: ["ServerAgeBucket"],
      filter: place,
      optional: true,
      provenance: "observed",
    },
    // ClientFpsAvg is proven by the dashboard's CSV export ("Client frame
    // rate"), but no captured request carries it yet — inferred until one does.
    { metric: "ClientFpsAvg", granularity: DAY, filter: place, optional: true, provenance: "inferred" },
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
      provenance: "observed",
    },
    daily("ErrorCount"),
    daily("ErrorCount", ["LogSource"]),
  ];
  // "Errors this deploy introduced": ErrorCount filtered to versions >= the
  // newest deploy that has reported errors. FirstSeenPlaceVersion is a FILTER
  // with GTE (the breakdown form 400s); its values are per-universe and come
  // from discovery — none discovered, no request.
  const newest = firstSeenVersions
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v))
    .sort((a, b) => b - a)[0];
  if (newest != null) {
    specs.push({
      metric: "ErrorCount",
      granularity: NONE,
      filter: [
        ...place,
        {
          dimension: "FirstSeenPlaceVersion",
          values: [String(newest)],
          operation: "FILTER_OPERATION_GTE",
        },
      ],
      provenance: "observed",
    });
  }
  return specs;
}

// The six metrics the dashboard demonstrably serves at 30-minute resolution
// (proven by its own CSV exports in data/verify/), plus ServerCrashCount,
// whose half-hour shape was captured directly. This is the "which hours are
// spiking" view — the daily series structurally cannot answer that. The
// window is clamped to the final 24h of the grab window in getGrabPlan: the
// gateway silently truncates long sub-daily windows, and the dashboard itself
// only ever asks for ~a day.
function halfHourSpecs(places: string[]): Spec[] {
  if (!places.length) return [];
  const place = [{ dimension: "Place", values: places }];
  const hh = (metric: string, provenance: Provenance, breakdown?: string[], optional?: boolean): Spec => ({
    metric,
    granularity: HALF,
    breakdown,
    filter: place,
    optional,
    provenance,
  });
  // VERIFIED AGAINST THE DASHBOARD'S OWN EXPORTS, 2026-08-08. The first grab
  // to actually run these was checked cell-by-cell with `npm run verify`, and
  // the result splits cleanly enough to be worth recording:
  //
  //   ErrorCount            observed  →  99/99 cells match
  //   ServerCrashCount      observed  →  matches
  //   PeakConcurrentPlayers inferred  →  33/33 cells match (now proven)
  //   ClientCrashRate15m    inferred  →  WRONG, up to 65% off
  //   SessionDurationSecondsAvg  inferred → WRONG, up to 2.4% off
  //   OomUnexpectedExits    inferred  →  WRONG, integer counts disagree
  //   ClientFpsAvg          inferred  →  WRONG, ~52% off (30.7 vs 46.7 fps)
  //
  // The four wrong ones are NOT requested. Whatever the dashboard plots on
  // those half-hour charts, it is not what these metric names return at this
  // granularity, and shipping a number we have proven wrong is worse than
  // shipping none. Re-add each only when a captured dashboard request shows
  // the shape it really uses — the daily versions are unaffected and still
  // pulled in perfSpecs().
  return [
    hh("ErrorCount", "observed"),
    hh("ErrorCount", "observed", ["LogSource"], true),
    hh("ServerCrashCount", "observed"),
    hh("ServerCrashCount", "observed", ["CrashType"], true),
    hh("PeakConcurrentPlayers", "proven", undefined, true),
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
function funnelSpecs(names: string[], steps: string[] = []): Spec[] {
  const out: Spec[] = [];
  for (const name of names) {
    const f = [{ dimension: "FunnelName", values: [name] }];
    // The dashboard filters some funnel queries by FunnelName AND FunnelStep
    // (all discovered steps listed). Where that is the observed shape, emit
    // it exactly — the FunnelName-only variant of FunnelUserStepCompletionRate
    // has never been seen and `npm run audit-plan` calls it a guess.
    const fs_ = steps.length
      ? [...f, { dimension: "FunnelStep", values: steps }]
      : null;
    const obs = "observed" as const;
    out.push(
      fs_
        ? { metric: "FunnelUserStepCompletionRate", granularity: NONE, breakdown: ["FunnelStep"], filter: fs_, provenance: obs }
        : { metric: "FunnelUserStepCompletionRate", granularity: NONE, breakdown: ["FunnelStep"], filter: f, optional: true },
      { metric: "FunnelUserChurnRate", granularity: NONE, breakdown: ["FunnelStep"], filter: f, provenance: obs },
      { metric: "FunnelUserTotalCount", granularity: NONE, breakdown: ["FunnelStep"], filter: f, provenance: obs },
      { metric: "FunnelUserTotalCount", granularity: NONE, filter: f, provenance: obs },
      { metric: "FunnelUserOverallCompletionRate", granularity: NONE, filter: f, provenance: obs },
      { metric: "FunnelStepTotalCount", granularity: NONE, breakdown: ["FunnelStep"], filter: f, provenance: obs },
      // over time — the diagnostic pull
      { metric: "FunnelUserChurnRate", granularity: DAY, breakdown: ["FunnelStep"], filter: f, optional: true },
      { metric: "FunnelUserStepCompletionRate", granularity: DAY, breakdown: ["FunnelStep"], filter: f, optional: true },
      { metric: "FunnelUserOverallCompletionRate", granularity: DAY, filter: f, optional: true },
      { metric: "FunnelUserTotalCount", granularity: DAY, breakdown: ["FunnelStep"], filter: f, optional: true },
      // The only funnel metrics Roblox itself serves as a daily series — this
      // is how you see a progression loop break on a date instead of as a
      // 28-day average. The dashboard's own capture carries an extra
      // FunnelStep filter; our FunnelName-only variant is unproven until a
      // grab returns data, so it stays optional.
      { metric: "FunnelCohortCompletionRate", granularity: DAY, breakdown: ["FunnelStep"], filter: f, optional: true },
      { metric: "FunnelCohortSessionCompletionRate", granularity: DAY, breakdown: ["FunnelStep"], filter: f, optional: true },
      // event-counted variants
      { metric: "FunnelStepCompletionRate", granularity: NONE, breakdown: ["FunnelStep"], filter: f, optional: true },
      { metric: "FunnelStepChurnRate", granularity: NONE, breakdown: ["FunnelStep"], filter: f, optional: true, provenance: obs },
      { metric: "FunnelStepOverallCompletionRate", granularity: NONE, filter: f, optional: true, provenance: obs }
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
    // Core specs have all returned data on real universes (grab reports);
    // anything marked optional without an explicit tag is a guess.
    provenance: s.provenance ?? (s.optional ? "inferred" : "proven"),
  };
}

// `discovered` comes from the dimensions endpoint for THIS universe. With no
// funnel names discovered we emit no funnel requests at all, rather than
// guessing a value and manufacturing a confident-looking empty result.
export function buildSeedTemplates(discovered?: Discovered): SeedTemplate[] {
  const funnelNames = discovered?.FunnelName ?? [];
  const funnelSteps = discovered?.FunnelStep ?? [];
  const places = discovered?.__places ?? [];
  const firstSeen = discovered?.FirstSeenPlaceVersion ?? [];
  return [
    ...SPECS.map(toTemplate),
    ...perfSpecs(places, firstSeen).map(toTemplate),
    ...halfHourSpecs(places).map(toTemplate),
    ...funnelSpecs(funnelNames, funnelSteps).map(toTemplate),
    ...BENCHMARK_TEMPLATES,
  ];
}

// All optional: benchmarks are simply not published for every metric on every
// universe — Stickiness came back empty on both games tried, and an empty
// benchmark is an answer, not a failure.
const BENCHMARK_TEMPLATES: SeedTemplate[] = [
  ...DEFAULT_BENCHMARK_METRICS.map((metric) => {
    const query = { metric, filter: [] as unknown[] };
    return {
      key: templateKey("benchmark", query),
      kind: "benchmark" as const,
      metric,
      resourceType: "RESOURCE_TYPE_UNIVERSE",
      query,
      optional: true,
      // Roblox does not publish a benchmark for every metric on every
      // universe. These two have returned empty on every game tried —
      // Stickiness has no published cohort, and D30 needs a window wider than
      // we grab. An empty benchmark is an answer, not a failure, but tagging
      // them `proven` would be a claim no grab report backs.
      provenance:
        metric === "RFYL7PlayDays"
          ? ("observed" as const)
          : metric === "DauMauStickiness" || metric === "ForwardD30Retention"
          ? ("inferred" as const)
          : ("proven" as const),
    };
  }),
];
