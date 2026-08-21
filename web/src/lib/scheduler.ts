// The unattended half of the tool: a timer inside the web app that grabs via
// Open Cloud on a cadence, with no browser involved.
//
// Why here and not chrome.alarms: the extension scheduler drives a real
// create.roblox.com tab because the gateway needs the session cookie, so it
// only runs while Chrome is open, logged in, and the extension is un-orphaned.
// Every one of those has failed silently at least once. Open Cloud authenticates
// with a key, so this path needs none of them — it needs `npm run dev` up, and
// that is the whole dependency.
//
// This is also what finally makes the per-game settings in dashboard-config.json
// mean something. `dailyGrab` and `intervalHours` were written by the UI and
// read by nothing, so a game could sit there marked "watched" for weeks without
// a single grab. They are this scheduler's input now.

import { promises as fs } from "node:fs";
import path from "node:path";
import { readConfig, apiKey } from "@/lib/opencloud";
import { resolveDataDir } from "@/lib/export-files";
import { grabAndPersist } from "@/lib/opencloud-run";
import { notifyGrab } from "@/lib/notify";

const TICK_MS = 60_000;

// A floor, for the same reason the extension has one: a full pass is minutes of
// paced requests, and anything under an hour is a mistake rather than a
// preference. Open Cloud's 30 POSTs/min is a per-key budget, so a too-eager
// schedule would starve the manual button too.
const MIN_INTERVAL_HOURS = 1;

type State = {
  lastRunAt: Record<string, string>;
  lastResult: Record<string, string>;
};

let timer: NodeJS.Timeout | null = null;
let running = false;

async function statePath() {
  return path.join(await resolveDataDir(), "scheduler-state.json");
}

async function readState(): Promise<State> {
  try {
    const raw = await fs.readFile(await statePath(), "utf8");
    const j = JSON.parse(raw) as Partial<State>;
    return { lastRunAt: j.lastRunAt ?? {}, lastResult: j.lastResult ?? {} };
  } catch {
    return { lastRunAt: {}, lastResult: {} };
  }
}

async function writeState(s: State) {
  const p = await statePath();
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(s, null, 2) + "\n", "utf8");
}

/** Hours between grabs for one game, or null when it isn't scheduled.
 *  An explicit intervalHours wins over the dailyGrab checkbox; dailyGrab alone
 *  means 24h. Anything below the floor is raised to it rather than ignored,
 *  because silently not running is the failure mode this file exists to end. */
export function intervalFor(
  game: { dailyGrab?: boolean; intervalHours?: number | null } | undefined,
  fallback?: number | null
): number | null {
  if (!game) return null;
  const explicit = game.intervalHours ?? fallback ?? null;
  if (explicit != null && Number.isFinite(explicit)) return Math.max(MIN_INTERVAL_HOURS, explicit);
  if (game.dailyGrab) return 24;
  return null;
}

export type DueGame = { universeId: string; intervalHours: number; lastRunAt: string | null };

export function dueGames(
  cfg: ReturnType<typeof readConfig>,
  state: State,
  now = Date.now()
): DueGame[] {
  const out: DueGame[] = [];
  for (const [universeId, game] of Object.entries(cfg.games ?? {})) {
    const hours = intervalFor(game, cfg.defaultIntervalHours);
    if (hours == null) continue;
    const last = state.lastRunAt[universeId];
    const lastMs = last ? Date.parse(last) : NaN;
    // Never run: due immediately. That is deliberate — turning the switch on
    // should produce a grab you can look at, not a wait of up to a day
    // wondering whether you configured it right.
    if (!Number.isFinite(lastMs) || now - lastMs >= hours * 3_600_000) {
      out.push({ universeId, intervalHours: hours, lastRunAt: last ?? null });
    }
  }
  return out;
}

async function tick() {
  // One grab at a time, process-wide. The rate limit is per key, not per game,
  // so two concurrent passes would only make each other fail.
  if (running) return;
  if (!apiKey()) return;

  const cfg = readConfig();
  if (cfg.schedulerEnabled === false) return;
  const state = await readState();
  const due = dueGames(cfg, state, Date.now());
  if (!due.length) return;

  running = true;
  try {
    for (const d of due) {
      const startedAt = new Date().toISOString();
      try {
        const r = await grabAndPersist({ universeId: d.universeId });
        state.lastRunAt[d.universeId] = startedAt;
        state.lastResult[d.universeId] = r.summary;
        await writeState(state);
        console.log(`[scheduler] ${r.summary}`);
        await notifyGrab(d.universeId, cfg);
      } catch (e) {
        // A failed grab still stamps lastRunAt: without it a universe that
        // always fails would be retried every single tick, burning the whole
        // POST budget on the one game that cannot use it.
        state.lastRunAt[d.universeId] = startedAt;
        state.lastResult[d.universeId] = `failed: ${(e as Error).message}`;
        await writeState(state);
        console.error(`[scheduler] ${d.universeId} failed:`, (e as Error).message);
      }
    }
  } finally {
    running = false;
  }
}

export function startScheduler() {
  if (timer) return; // idempotent: dev HMR calls register() more than once
  timer = setInterval(() => {
    tick().catch((e) => console.error("[scheduler] tick failed:", e));
  }, TICK_MS);
  // Don't hold the process open on this timer alone.
  timer.unref?.();
  console.log("[scheduler] started — Open Cloud grabs on the per-game cadence in dashboard-config.json");
  // A first tick shortly after boot, not immediately: let the app finish
  // starting before a multi-minute job takes the floor.
  setTimeout(() => tick().catch(() => {}), 10_000).unref?.();
}

export async function schedulerStatus() {
  const cfg = readConfig();
  const state = await readState();
  const games = Object.entries(cfg.games ?? {})
    .map(([universeId, g]) => ({
      universeId,
      intervalHours: intervalFor(g, cfg.defaultIntervalHours),
      lastRunAt: state.lastRunAt[universeId] ?? null,
      lastResult: state.lastResult[universeId] ?? null,
    }))
    .filter((g) => g.intervalHours != null);
  // `enabled` is reported explicitly. "due: []" is not evidence the scheduler is
  // off — it also means "nothing has come round yet", and the two look identical
  // from outside at exactly the moment you want to be sure.
  const enabled = cfg.schedulerEnabled !== false && process.env.RBX_SCHEDULER !== "off";
  return {
    enabled,
    running,
    hasKey: !!apiKey(),
    games,
    due: enabled ? dueGames(cfg, state).map((d) => d.universeId) : [],
  };
}
