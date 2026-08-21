// Live progress for an Open Cloud grab.
//
// The grab is a single blocking POST that runs for minutes — 159 requests paced
// at 2200ms — so its own HTTP response cannot say anything until the last one
// has landed. On 2026-08-21 that meant six minutes of a frozen "Grabbing…" for
// a pass where request #1 came back `401 Invalid API Key` and all 159 failed
// identically. This is the side channel that makes the first status visible in
// seconds: the grab loop writes here, `GET /api/grab-opencloud` reads it, the
// dashboard polls it.
//
// It lives in the lib and not in the route on purpose. The scheduler calls
// grabAndPersist directly, never over HTTP, so a route-level implementation
// would leave the unattended path — the one nobody is watching, and therefore
// the one that most needs a status — permanently invisible.
//
// Module state, not a table: it describes a run inside THIS process and is
// meant to die with it. `npm run dev` is the only deployment.

export type GrabPhase = "planning" | "querying" | "persisting" | "done";

export type GrabProgress = {
  universeId: string;
  phase: GrabPhase;
  /** Plan requests processed, counting the ones skipped as not served by Open
   *  Cloud — so it is monotone and actually reaches `total`. */
  done: number;
  total: number;
  sent: number;
  ok: number;
  empty: number;
  failed: number;
  skipped: number;
  /** The metric the last completed request asked for. */
  metric: string | null;
  lastStatus: number | null;
  lastError: string | null;
  startedAt: number;
  updatedAt: number;
  summary: string | null;
};

// One entry per universe, overwritten by that universe's next run. A finished
// run stays readable: the poller has to be able to see the terminal state, and
// a poll that arrives just after the POST resolves must not find nothing.
const runs = new Map<string, GrabProgress>();

export function startProgress(universeId: string): void {
  const now = Date.now();
  runs.set(universeId, {
    universeId,
    phase: "planning",
    done: 0,
    total: 0,
    sent: 0,
    ok: 0,
    empty: 0,
    failed: 0,
    skipped: 0,
    metric: null,
    lastStatus: null,
    lastError: null,
    startedAt: now,
    updatedAt: now,
    summary: null,
  });
}

export function updateProgress(universeId: string, patch: Partial<GrabProgress>): void {
  const cur = runs.get(universeId);
  if (!cur) return;
  runs.set(universeId, { ...cur, ...patch, updatedAt: Date.now() });
}

export function finishProgress(universeId: string, summary: string): void {
  updateProgress(universeId, { phase: "done", summary });
}

export function getProgress(universeId: string): GrabProgress | null {
  return runs.get(universeId) ?? null;
}
