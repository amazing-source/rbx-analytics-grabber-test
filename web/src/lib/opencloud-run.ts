// Grab via Open Cloud, then persist through the ordinary pipeline.
//
// Split out from opencloud-grab.ts so the querying stays testable without the
// disk. One implementation, used by both callers: the /api/grab-opencloud route
// (a human pressing the button) and the scheduler (nobody pressing anything).
// A second copy would drift, and the one that drifts is always the unattended
// one — which is also the one nobody is watching.

import { promises as fs } from "node:fs";
import path from "node:path";
import { parseCaptures } from "@/lib/parse-captures";
import {
  exportGrabReport,
  exportToFiles,
  resolveDataDir,
  saveRawCaptures,
} from "@/lib/export-files";
import { ingestCaptures } from "@/lib/store";
import { runOpenCloudGrab, type CloudGrabResult } from "@/lib/opencloud-grab";
import { finishProgress, updateProgress } from "@/lib/grab-progress";

/** Whatever the last grab discovered for this universe.
 *
 *  Funnel names are developer-defined and per-universe. This path cannot run
 *  the gateway's discovery phase (it replays in the browser session), so it
 *  inherits instead of guessing — the standing rule is that an absent request
 *  is honest while an invented one produces a false finding. No prior grab
 *  means no funnel requests, and getGrabPlan says so in its warnings. */
export async function lastDiscovered(universeId: string): Promise<Record<string, string[]> | null> {
  try {
    const dir = await resolveDataDir();
    const raw = await fs.readFile(path.join(dir, "games", universeId, "grab-report.json"), "utf8");
    const j = JSON.parse(raw) as { discovered?: Record<string, string[]> };
    return j.discovered ?? null;
  } catch {
    return null;
  }
}

/** Default window: the same 28 days the extension path uses, snapped to UTC
 *  midnight so a grab at 09:00 and one at 18:00 ask for identical days. */
export function defaultWindow(days = 28) {
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end.getTime() - days * 86_400_000);
  const iso = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "Z");
  return { startTime: iso(start), endTime: iso(end) };
}

export type PersistedGrab = CloudGrabResult & {
  files: { raw?: string; dataDir?: string; written?: number; report?: string; error?: string };
  db: string;
};

// One grab at a time, across BOTH callers.
//
// The rate limit is per API KEY, not per grab, so two concurrent passes do not
// run twice as fast — they run at half the budget each and take the difference
// out in 429s. Measured 2026-08-19: a manual grab fired while the scheduler was
// mid-pass took 39 of its 135 requests as 429, and every one of those landed in
// the grab report as a failed metric, which reads as "this game has no such
// data". The scheduler's own `running` flag did not catch it because it only
// ever guarded the scheduler against itself.
//
// A queue rather than a rejection: the caller asked for a grab, and making them
// discover the collision and retry is the same work with worse ergonomics.
// On globalThis for the same reason as the scheduler's lock: a module-scoped
// chain is replaced by HMR whenever anything this file imports is edited, and
// two chains serialize nothing against each other. That is not hypothetical —
// on 2026-08-21 it let two scheduled passes of 10399712766 overlap and 429 each
// other, which is precisely the collision this queue exists to prevent.
const lock = ((globalThis as typeof globalThis & {
  __rbxGrabLock?: { chain: Promise<unknown> };
}).__rbxGrabLock ??= { chain: Promise.resolve() });

function serialize<T>(fn: () => Promise<T>): Promise<T> {
  const next = lock.chain.then(fn, fn);
  lock.chain = next.catch(() => {});
  return next;
}

export function grabAndPersist(opts: {
  universeId: string;
  startTime?: string;
  endTime?: string;
  days?: number;
}): Promise<PersistedGrab> {
  return serialize(() => grabAndPersistUnlocked(opts));
}

async function grabAndPersistUnlocked(opts: {
  universeId: string;
  startTime?: string;
  endTime?: string;
  days?: number;
}): Promise<PersistedGrab> {
  const win = defaultWindow(opts.days ?? 28);
  const startTime = opts.startTime || win.startTime;
  const endTime = opts.endTime || win.endTime;

  const result = await runOpenCloudGrab({
    universeId: opts.universeId,
    startTime,
    endTime,
    discovered: await lastDiscovered(opts.universeId),
  });

  // Files first, always — same reason as the ingest route. A grab that reached
  // Roblox must not be lost to a database being down, and this one is running
  // unattended, so nobody is there to notice and retry.
  const files: PersistedGrab["files"] = {};
  // Writing 71 metrics' worth of CSVs is not instant, and a status line that
  // sits on the last request number through it looks like a stall.
  updateProgress(opts.universeId, { phase: "persisting" });
  try {
    files.report = await exportGrabReport(result.report);
    if (result.captures.length) {
      const parsed = parseCaptures(result.captures);
      files.raw = await saveRawCaptures(result.captures, parsed.games[0] ?? null);
      const summary = await exportToFiles(parsed);
      files.dataDir = summary.dataDir;
      files.written = summary.files;
    }
  } catch (e) {
    files.error = (e as Error).message;
  }

  // Supabase is a deliberate placeholder in this repo; its failure is the
  // steady state and must not fail the grab.
  let db = "skipped";
  try {
    const counts = await ingestCaptures(result.captures);
    db = `ok (${counts.snapshots ?? 0} snapshots)`;
  } catch (e) {
    db = `unavailable: ${(e as Error).message}`;
  }

  finishProgress(opts.universeId, result.summary);
  return { ...result, files, db };
}
