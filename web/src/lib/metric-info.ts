// Human-facing metadata for every metric: a plain-language name, the category
// it belongs to (the LiveOps diagnostic rungs), its unit, whether higher is
// better, and a one-line explanation. This is what makes the dashboard legible.

export type Unit = "percent" | "robux" | "minutes" | "hours" | "seconds" | "count" | "fps" | "mb" | "bytes";
export type Category = "Discovery" | "Engagement" | "Retention" | "Monetization" | "Funnel" | "Performance" | "Other";
export type MetricKind = "rate" | "volume";

export type MetricInfo = {
  label: string;
  category: Category;
  unit: Unit;
  kind: MetricKind;
  higherIsBetter: boolean;
  blurb: string;
};

export const CATEGORIES: Category[] = [
  "Discovery",
  "Engagement",
  "Retention",
  "Monetization",
  "Funnel",
  "Performance",
];

// Only unmapped metrics stay off the dashboard.
export const HIDDEN_CATEGORIES: Category[] = ["Other"];
export function isVisible(metric: string): boolean {
  return !HIDDEN_CATEGORIES.includes(metricInfo(metric).category);
}

const M: Record<string, MetricInfo> = {
  // ---- Discovery ----
  // How many people Roblox SHOWS the game to, vs how many then play. Splitting
  // this from Engagement is what separates "shown to fewer people" from "shown
  // to the same people, who then leave" — the first question of any decline.
  UniqueUsersWithImpressions: { label: "Impressions (unique users)", category: "Discovery", unit: "count", kind: "volume", higherIsBetter: true, blurb: "Players who saw the game surfaced to them. Falls in lockstep with DAU = a discovery/algorithm problem, not an in-game one." },
  RFYQualifiedPTR: { label: "RFY Qualified PTR", category: "Discovery", unit: "percent", kind: "rate", higherIsBetter: true, blurb: "Play-through rate qualifying for Recommended-For-You. The gate on home-page promotion." },
  RFYL7PlayDays: { label: "RFY Play Days (L7)", category: "Discovery", unit: "count", kind: "rate", higherIsBetter: true, blurb: "Play-days per player over 7 days — a Recommended-For-You ranking input." },
  AttributionD1RetentionRatio: { label: "Attributed D1 Retention", category: "Discovery", unit: "percent", kind: "rate", higherIsBetter: true, blurb: "Day-1 retention of players attributed to a discovery surface." },
  Attribution7DPayerConversionRatio: { label: "Attributed 7d Conversion", category: "Discovery", unit: "percent", kind: "rate", higherIsBetter: true, blurb: "Payer conversion within 7 days, by acquisition attribution." },
  Attribution7DPlaytimePerUserInMinutes: { label: "Attributed 7d Playtime", category: "Discovery", unit: "minutes", kind: "rate", higherIsBetter: true, blurb: "Minutes played per attributed user over 7 days." },
  Attribution7DRobuxPerUser: { label: "Attributed 7d Robux/User", category: "Discovery", unit: "robux", kind: "rate", higherIsBetter: true, blurb: "Robux per attributed user over 7 days — acquisition quality in revenue terms." },
  Attribution30DRobuxPerUser: { label: "Attributed 30d Robux/User", category: "Discovery", unit: "robux", kind: "rate", higherIsBetter: true, blurb: "Robux per attributed user over 30 days — the long-run value of a cohort." },

  // ---- Engagement ----
  DailyActiveUsers: { label: "Daily Active Users", category: "Engagement", unit: "count", kind: "volume", higherIsBetter: true, blurb: "Unique players per day. Size & momentum — don't compare raw across a growth spurt." },
  MonthlyActiveUsers: { label: "Monthly Active Users", category: "Engagement", unit: "count", kind: "volume", higherIsBetter: true, blurb: "Unique players over a rolling 30 days." },
  Visits: { label: "Visits", category: "Engagement", unit: "count", kind: "volume", higherIsBetter: true, blurb: "Total play sessions started." },
  AverageSessionLengthMinutes: { label: "Avg Session Length", category: "Engagement", unit: "minutes", kind: "rate", higherIsBetter: true, blurb: "How long an average session lasts. Core engagement signal; also sets the benchmark bucket." },
  SessionDurationSecondsAvg: { label: "Avg Session Duration", category: "Engagement", unit: "seconds", kind: "rate", higherIsBetter: true, blurb: "Average session length, reported in seconds (hourly resolution)." },
  AveragePlayTimeMinutesPerDAU: { label: "Playtime per Player", category: "Engagement", unit: "minutes", kind: "rate", higherIsBetter: true, blurb: "Minutes played per active player per day." },
  TotalPlayTimeHours: { label: "Total Playtime", category: "Engagement", unit: "hours", kind: "volume", higherIsBetter: true, blurb: "Total hours played across all players." },
  PeakConcurrentPlayers: { label: "Peak Concurrent", category: "Engagement", unit: "count", kind: "volume", higherIsBetter: true, blurb: "Most players online at once — traffic & server load." },
  ConcurrentPlayers: { label: "Concurrent Players", category: "Engagement", unit: "count", kind: "volume", higherIsBetter: true, blurb: "Players online simultaneously." },
  UniqueUsersWithPlaySessions: { label: "Unique Players", category: "Engagement", unit: "count", kind: "volume", higherIsBetter: true, blurb: "Distinct players with a play session." },
  TotalSessionsEndedInBucket: { label: "Sessions Ended", category: "Engagement", unit: "count", kind: "volume", higherIsBetter: true, blurb: "Sessions that ended in the period." },
  L7AverageDailyActiveUsers: { label: "DAU (7-day avg)", category: "Engagement", unit: "count", kind: "volume", higherIsBetter: true, blurb: "Daily active users, smoothed over 7 days." },
  L7AverageUniqueUsersWithPlaySessions: { label: "Unique Players (7-day avg)", category: "Engagement", unit: "count", kind: "volume", higherIsBetter: true, blurb: "Unique players, smoothed over 7 days." },
  L7AveragePlayTimeMinutesPerDAU: { label: "Playtime/Player (7-day avg)", category: "Engagement", unit: "minutes", kind: "rate", higherIsBetter: true, blurb: "Minutes per player, smoothed over 7 days." },

  // ---- Retention ----
  ForwardD1Retention: { label: "Day 1 Retention", category: "Retention", unit: "percent", kind: "rate", higherIsBetter: true, blurb: "Of players who joined, the % who came back the next day. The hook test." },
  ForwardD7Retention: { label: "Day 7 Retention", category: "Retention", unit: "percent", kind: "rate", higherIsBetter: true, blurb: "% returning after a week — the return loop / progression." },
  ForwardD30Retention: { label: "Day 30 Retention", category: "Retention", unit: "percent", kind: "rate", higherIsBetter: true, blurb: "% returning after a month — end-game. Often ~0 on a young game (normal)." },
  DauMauStickiness: { label: "Stickiness (DAU/MAU)", category: "Retention", unit: "percent", kind: "rate", higherIsBetter: true, blurb: "How habitual play is: daily over monthly actives." },
  DailyCohortRetention: { label: "Cohort Retention", category: "Retention", unit: "percent", kind: "rate", higherIsBetter: true, blurb: "Retention by join-day cohort." },
  L7AverageForwardD1Retention: { label: "Day 1 Retention (7-day avg)", category: "Retention", unit: "percent", kind: "rate", higherIsBetter: true, blurb: "Day-1 retention, smoothed over 7 days. Breaking away from a flat genre benchmark is the cleanest game-specific-regression signal there is." },
  WeeklyCohortRetention: { label: "Weekly Cohort Retention", category: "Retention", unit: "percent", kind: "rate", higherIsBetter: true, blurb: "Retention by join-week cohort." },

  // ---- Monetization ----
  PayingUsersCVR: { label: "Payer Conversion", category: "Monetization", unit: "percent", kind: "rate", higherIsBetter: true, blurb: "The #1 metric: % of players who spend Robux. The width of paying." },
  AverageRevenuePerPayingUser: { label: "ARPPU", category: "Monetization", unit: "robux", kind: "rate", higherIsBetter: true, blurb: "Average revenue per paying user — the depth of paying." },
  AverageRevenuePerUser: { label: "ARPDAU", category: "Monetization", unit: "robux", kind: "rate", higherIsBetter: true, blurb: "Revenue per active player — conversion × depth." },
  PayingUsers: { label: "Paying Users", category: "Monetization", unit: "count", kind: "volume", higherIsBetter: true, blurb: "Number of players who spent Robux." },
  DailyRevenue: { label: "Daily Revenue", category: "Monetization", unit: "robux", kind: "volume", higherIsBetter: true, blurb: "Gross Robux earned per day — contextualize with DAU growth." },
  L7AverageDailyRevenue: { label: "Daily Revenue (7-day avg)", category: "Monetization", unit: "robux", kind: "volume", higherIsBetter: true, blurb: "Daily revenue, smoothed over 7 days." },
  ItemMonetizationRevenue: { label: "Item Revenue", category: "Monetization", unit: "robux", kind: "volume", higherIsBetter: true, blurb: "Revenue by source (Passes vs Dev Products). The idle-monetization thesis lives here." },
  PotentialExtraEarningsTotalUsd: { label: "Potential Extra Earnings", category: "Monetization", unit: "count", kind: "volume", higherIsBetter: true, blurb: "Estimated revenue left on the table (USD)." },

  // ---- Funnel ----
  FunnelUserStepCompletionRate: { label: "Funnel Step Completion", category: "Funnel", unit: "percent", kind: "rate", higherIsBetter: true, blurb: "% of players who clear each onboarding step." },
  FunnelUserChurnRate: { label: "Funnel Step Churn", category: "Funnel", unit: "percent", kind: "rate", higherIsBetter: false, blurb: "% who drop out at each step — lower is better." },
  FunnelUserOverallCompletionRate: { label: "Funnel Completion", category: "Funnel", unit: "percent", kind: "rate", higherIsBetter: true, blurb: "% who finish the whole funnel." },
  FunnelUserTotalCount: { label: "Funnel Users", category: "Funnel", unit: "count", kind: "volume", higherIsBetter: true, blurb: "Cohort size entering the funnel." },
  FunnelStepTotalCount: { label: "Funnel Step Count", category: "Funnel", unit: "count", kind: "volume", higherIsBetter: true, blurb: "Players counted at each step." },
  FunnelStepCompletionRate: { label: "Step Completion (event)", category: "Funnel", unit: "percent", kind: "rate", higherIsBetter: true, blurb: "Step completion counted per event rather than per user." },
  FunnelStepChurnRate: { label: "Step Churn (event)", category: "Funnel", unit: "percent", kind: "rate", higherIsBetter: false, blurb: "Drop-out per step counted per event — lower is better." },
  FunnelStepOverallCompletionRate: { label: "Funnel Completion (event)", category: "Funnel", unit: "percent", kind: "rate", higherIsBetter: true, blurb: "Whole-funnel completion counted per event." },

  // ---- Performance (technical health — the "did the update break something?" rung) ----
  // Captured hourly by the dashboard; the exporter also rolls these up to daily
  // so they line up with the rest of the LiveOps comparison window.
  ClientCrashRate15m: { label: "Crash Rate (15m)", category: "Performance", unit: "percent", kind: "rate", higherIsBetter: false, blurb: "% of sessions crashing within 15 min. A jump right after an update is the first thing to rule out." },
  ClientFpsAvg: { label: "Avg FPS", category: "Performance", unit: "fps", kind: "rate", higherIsBetter: true, blurb: "Average client frame rate. Falling FPS shows up as shorter sessions before it shows up as churn." },
  MemoryUsageAvg: { label: "Avg Memory", category: "Performance", unit: "mb", kind: "rate", higherIsBetter: false, blurb: "Average client memory use — lower is safer on low-end mobile, where most of the audience is." },
  // Reported in BYTES, unlike MemoryUsageAvg which is genuinely MB.
  ClientMemoryUsageAvg: { label: "Avg Client Memory", category: "Performance", unit: "bytes", kind: "rate", higherIsBetter: false, blurb: "Average client memory use. Read next to Memory Used % — the percentage is what predicts OOM kills, since the budget differs per device." },
  OomUnexpectedExits: { label: "Out-of-Memory Exits", category: "Performance", unit: "count", kind: "volume", higherIsBetter: false, blurb: "Sessions killed by running out of memory — the low-end-device tax." },
  ServerFpsAvg: { label: "Server FPS", category: "Performance", unit: "fps", kind: "rate", higherIsBetter: true, blurb: "Average server frame rate — server-side lag." },
  ServerFrameRateP10: { label: "Server FPS (10th pct)", category: "Performance", unit: "fps", kind: "rate", higherIsBetter: true, blurb: "Server frame rate on the worst-off 10% of servers. Roblox caps at 60 — a drop here is server-side lag hitting real sessions, not an average smoothing it away." },
  ServerMemoryUsageAvg: { label: "Server Memory", category: "Performance", unit: "mb", kind: "rate", higherIsBetter: false, blurb: "Average server memory use." },
  ClientFpsP10: { label: "FPS (10th pct)", category: "Performance", unit: "fps", kind: "rate", higherIsBetter: true, blurb: "Frame rate for the worst-off 10% of sessions — the low-end-device reality, not the average." },
  ClientMemoryUsagePercentageAvg: { label: "Memory Used %", category: "Performance", unit: "percent", kind: "rate", higherIsBetter: false, blurb: "Share of the device's memory budget consumed — closer to 100% means OOM kills." },
  ClientCpuTimeAvg: { label: "Client CPU Time", category: "Performance", unit: "count", kind: "rate", higherIsBetter: false, blurb: "Average client CPU time per frame — where render-submission cost shows up." },
  CpuTimeAvg: { label: "Server CPU Time", category: "Performance", unit: "count", kind: "rate", higherIsBetter: false, blurb: "Average server CPU time per frame. Break down by CpuTimeCategory to see which subsystem is eating it." },
  CpuCoreUtilization: { label: "CPU Core Utilization", category: "Performance", unit: "percent", kind: "rate", higherIsBetter: false, blurb: "How saturated the server's cores are — sustained highs mean the server is the bottleneck, not the client." },
  ClientCrashCount: { label: "Crash Count", category: "Performance", unit: "count", kind: "volume", higherIsBetter: false, blurb: "Absolute client crashes. Read next to crash RATE — volume falls when players leave." },
  ServerCrashCount: { label: "Server Crashes", category: "Performance", unit: "count", kind: "volume", higherIsBetter: false, blurb: "Server-side crashes." },
  // The dimension that identifies an individual error is `MessageHash`, NOT
  // `ErrorMessage` — that name was a guess and 400s. FirstSeenPlaceVersion is a
  // filter (with FILTER_OPERATION_GTE), not a breakdown.
  ErrorCount: { label: "Script Errors", category: "Performance", unit: "count", kind: "volume", higherIsBetter: false, blurb: "Logged script errors — a VOLUME metric, so it falls when players leave. Normalise per DAU before calling a drop an improvement. Break down by MessageHash to find the individual bug." },

  // ---- Live-ops events ----
  EventAvgDailyActiveUsers: { label: "Event DAU", category: "Engagement", unit: "count", kind: "volume", higherIsBetter: true, blurb: "Average DAU during a scheduled event." },
  EventAvgDailyRevenue: { label: "Event Revenue", category: "Monetization", unit: "robux", kind: "volume", higherIsBetter: true, blurb: "Average daily revenue during a scheduled event." },
  EventAvgDailyUserPlaytimeMinutes: { label: "Event Playtime", category: "Engagement", unit: "minutes", kind: "rate", higherIsBetter: true, blurb: "Playtime per user during a scheduled event." },
  EventAvgRevenuePerDailyActiveUser: { label: "Event ARPDAU", category: "Monetization", unit: "robux", kind: "rate", higherIsBetter: true, blurb: "Revenue per active user during a scheduled event." },
  RSVPCount: { label: "Event RSVPs", category: "Discovery", unit: "count", kind: "volume", higherIsBetter: true, blurb: "Players who RSVP'd to a scheduled event." },
  UsersJoinedFromNotifications: { label: "Joins from Notifications", category: "Discovery", unit: "count", kind: "volume", higherIsBetter: true, blurb: "Players who came back via a notification — the re-engagement channel." },
  PlayerFeedbackVotesCount: { label: "Feedback Votes", category: "Discovery", unit: "count", kind: "volume", higherIsBetter: true, blurb: "Player feedback votes cast." },
  RFYUniqueNotInterestedUsersPerMillionImpressions: { label: "\"Not Interested\" Rate", category: "Discovery", unit: "count", kind: "rate", higherIsBetter: false, blurb: "Players actively dismissing the game per million impressions — rising means the store listing is over-reaching." },
  EndToEndCVR: { label: "End-to-End Conversion", category: "Discovery", unit: "percent", kind: "rate", higherIsBetter: true, blurb: "Impression → play conversion across the whole funnel." },
  AttributionD7RetentionRatio: { label: "Attributed D7 Retention", category: "Discovery", unit: "percent", kind: "rate", higherIsBetter: true, blurb: "Day-7 retention of players attributed to a discovery surface." },

  // ---- Funnel over time ----
  FunnelCohortCompletionRate: { label: "Funnel Completion (daily)", category: "Funnel", unit: "percent", kind: "rate", higherIsBetter: true, blurb: "Share of each day's cohort reaching a funnel step. The ONLY funnel metric with a daily series — use it to date a progression break." },
  FunnelCohortSessionCompletionRate: { label: "Funnel Completion, sessions (daily)", category: "Funnel", unit: "percent", kind: "rate", higherIsBetter: true, blurb: "Same as above, counted per session rather than per user." },
};

const FALLBACK: MetricInfo = {
  label: "",
  category: "Other",
  unit: "count",
  kind: "volume",
  higherIsBetter: true,
  blurb: "",
};

export function metricInfo(metric: string): MetricInfo {
  const found = M[metric];
  if (found) return found;
  // Heuristic fallback for anything not explicitly mapped.
  const lower = metric.toLowerCase();
  const unit: Unit = /fps/.test(lower)
    ? "fps"
    : /memory/.test(lower)
    ? "mb"
    : /rate|retention|cvr|ratio|stickiness|percentage/.test(lower)
    ? "percent"
    : /revenue|arp|robux|earnings/.test(lower)
    ? "robux"
    : /second/.test(lower)
    ? "seconds"
    : /minute/.test(lower)
    ? "minutes"
    : /hour/.test(lower)
    ? "hours"
    : "count";
  // Anything expressed per-something (a %, an average) is comparable across a
  // growth window; raw counts are not.
  const kind: MetricKind = ["percent", "fps", "mb", "seconds", "minutes"].includes(unit) ? "rate" : "volume";
  // Names that describe something going wrong read the opposite way.
  const higherIsBetter = !/crash|churn|oom|error|exit|fail|drop|latency|lag/.test(lower);
  return { ...FALLBACK, label: spaceCase(metric), unit, kind, higherIsBetter };
}

function spaceCase(s: string) {
  return s.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
}

export function metricKind(metric: string): MetricKind {
  return metricInfo(metric).kind;
}

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

export function formatValue(metric: string, v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "—";
  const { unit } = metricInfo(metric);
  switch (unit) {
    case "percent": {
      const p = v * 100;
      return `${p < 10 ? p.toFixed(2) : p.toFixed(1)}%`;
    }
    case "robux":
      return Math.abs(v) < 100 ? `R$ ${v.toFixed(2)}` : `R$ ${compact.format(v)}`;
    case "minutes":
      return `${v.toFixed(1)} min`;
    case "seconds":
      return v >= 90 ? `${Math.floor(v / 60)}m ${Math.round(v % 60)}s` : `${v.toFixed(0)}s`;
    case "hours":
      return `${compact.format(v)} h`;
    case "fps":
      return `${v.toFixed(0)} fps`;
    case "mb":
      return `${compact.format(v)} MB`;
    // Roblox reports client memory in raw bytes (1.3e9), which rendered as
    // "1.3B MB". Scale to the unit a human reads.
    case "bytes": {
      const mb = v / 1024 / 1024;
      return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(0)} MB`;
    }
    default:
      return compact.format(v);
  }
}

// Sign of a delta in the "good" direction, accounting for inverted metrics.
export function deltaIsGood(metric: string, deltaPct: number | null): boolean | null {
  if (deltaPct == null || deltaPct === 0) return null;
  const good = deltaPct > 0;
  return metricInfo(metric).higherIsBetter ? good : !good;
}
