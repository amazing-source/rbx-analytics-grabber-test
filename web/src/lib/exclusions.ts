// Which family a planned request belongs to, and how to drop whole families
// from a grab.
//
// The point is cost: a 28-day plan is ~333 requests and a 139-day one is ~400+,
// most of it perf and error chunks. Skipping a family a game does not need makes
// a long grab practical.
//
// The rule that governs everything here: a dropped request must be REPORTED as
// dropped. `CLAUDE.md` is explicit that a request which fails is invisible
// unless recorded, and an *excluded* request is worse — it looks like a metric
// the game does not have. So filterPlan returns what it removed, and the plan
// response carries it through to the grab report.

export type Family = "perf" | "errors" | "funnels" | "benchmarks" | "ads";

export const FAMILIES: Family[] = ["perf", "errors", "funnels", "benchmarks", "ads"];

type PlanRequest = { kind?: string; metric?: string | null };

/** Null when the request belongs to no skippable family — annotations, metadata
 *  and the behavioural core are never excluded, because they are cheap and they
 *  are what every diagnosis starts from. */
export function familyOf(r: PlanRequest): Family | null {
  if (r.kind === "benchmark") return "benchmarks";
  const m = r.metric ?? "";
  if (!m || m.startsWith("annotation:")) return null;
  if (/^Funnel/i.test(m)) return "funnels";
  if (/^ErrorCount/i.test(m)) return "errors";
  // Crash, frame rate, memory, CPU and OOM are the ~28-day perishable set.
  if (/(Crash|Fps|FrameRate|Memory|Cpu|Oom|SessionDurationSeconds)/i.test(m)) return "perf";
  if (/^RFY/i.test(m) || /(Notification|RSVP|Impression|PotentialExtraEarnings)/i.test(m)) return "ads";
  return null;
}

/** Accepts "perf,errors" or a { perf: true } map; ignores anything unknown so a
 *  stale client cannot silently exclude something we never defined. */
export function parseExclude(input: string | null | undefined | Record<string, unknown>): Set<Family> {
  const out = new Set<Family>();
  if (!input) return out;
  const names = typeof input === "string"
    ? input.split(",")
    : Object.entries(input).filter(([, v]) => v === true).map(([k]) => k);
  for (const raw of names) {
    const n = String(raw).trim().toLowerCase();
    if ((FAMILIES as string[]).includes(n)) out.add(n as Family);
  }
  return out;
}

export function filterPlan<T extends PlanRequest>(requests: T[], excluded: Set<Family>) {
  if (!excluded.size) return { requests, dropped: 0, byFamily: {} as Record<string, number> };
  const byFamily: Record<string, number> = {};
  const kept = requests.filter((r) => {
    const f = familyOf(r);
    if (f && excluded.has(f)) { byFamily[f] = (byFamily[f] ?? 0) + 1; return false; }
    return true;
  });
  return { requests: kept, dropped: requests.length - kept.length, byFamily };
}
