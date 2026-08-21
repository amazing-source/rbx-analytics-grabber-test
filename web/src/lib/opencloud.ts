// Server-only Open Cloud client + the dashboard's config store.
//
// The API key is read from web/.opencloud-key (gitignored) or ROBLOX_API_KEY,
// and is never returned to the browser by any route in this app. The dashboard
// only ever learns the RESULT of a permission check, never the credential that
// performed it.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const BASE = "https://apis.roblox.com/analytics-query-api/v1";

export function apiKey(): string | null {
  if (process.env.ROBLOX_API_KEY?.trim()) return process.env.ROBLOX_API_KEY.trim();
  for (const p of [".opencloud-key", path.join("..", ".opencloud-key")]) {
    try {
      const v = readFileSync(path.resolve(process.cwd(), p), "utf8").trim();
      if (v) return v;
    } catch { /* keep looking */ }
  }
  return null;
}

/** Does this key actually grant analytics on this universe?
 *
 *  The cheapest honest test is a real query over a 1-day window. We care about
 *  the DISTINCTION between "no permission" and "permission but no data": a 401
 *  or 403 means the key is not scoped here, while a 200 with zero points means
 *  the game simply had no activity — and per CLAUDE.md an empty result is never
 *  evidence about the game. Conflating those would hide half a portfolio.
 */
export async function checkAccess(universeId: number): Promise<"ok" | "denied" | "error" | "nokey"> {
  const key = apiKey();
  if (!key) return "nokey";
  const end = new Date(); end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end.getTime() - 86400_000);
  try {
    const r = await fetch(`${BASE}/universes/${universeId}/metrics`, {
      method: "POST",
      headers: { "x-api-key": key, "content-type": "application/json" },
      body: JSON.stringify({
        metric: "DailyActiveUsers", granularity: "OneDay",
        startTime: start.toISOString().replace(/\.\d{3}Z$/, "Z"),
        endTime: end.toISOString().replace(/\.\d{3}Z$/, "Z"),
      }),
    });
    if (r.ok) return "ok";
    if (r.status === 401 || r.status === 403) return "denied";
    return "error";
  } catch {
    return "error";
  }
}

// ---------------------------------------------------------------- config store
//
// Written to data/dashboard-config.json, next to every other file sink. Same
// reasoning as the rest of this project: a plain file that survives the web app
// being down, and that a human can read and correct by hand.

export type GameConfig = {
  dailyGrab?: boolean;
  intervalHours?: number | null;
  liveopsDiagnosis?: boolean;
  updateWatch?: boolean;
  discordWebhook?: string;
  notes?: string;
};
export type DashConfig = {
  username?: string;
  userId?: number;
  /** Metric families to skip in a grab, keyed by family id. Consumed by the
   *  grab-plan route; see lib/exclusions.ts for what each family covers. */
  exclude?: Record<string, boolean>;
  defaultIntervalHours?: number | null;
  /** Kill switch for the server-side Open Cloud scheduler. Absent means on:
   *  the per-game dailyGrab/intervalHours toggles are the real opt-in, and a
   *  second switch that also has to be found would just make "why did nothing
   *  run" harder to answer. RBX_SCHEDULER=off overrides this. */
  schedulerEnabled?: boolean;
  /** Commit and push `data/raw/` after each scheduled grab. OPT-IN, unlike the
   *  scheduler above: this one writes to a remote, and a default that pushes to
   *  GitHub on a timer is not a default anyone should discover by accident.
   *  See lib/auto-commit.ts for exactly what it stages (never code, never the
   *  API key). */
  autoCommit?: boolean;
  discordWebhook?: string;
  games: Record<string, GameConfig>;
  updatedAt?: string;
};

function configPath() {
  return path.resolve(process.cwd(), "..", "data", "dashboard-config.json");
}

export function readConfig(): DashConfig {
  try {
    const raw = readFileSync(configPath(), "utf8");
    const j = JSON.parse(raw) as DashConfig;
    return { ...j, games: j.games ?? {} };
  } catch {
    return { games: {} };
  }
}

export function writeConfig(next: DashConfig): DashConfig {
  const p = configPath();
  mkdirSync(path.dirname(p), { recursive: true });
  const out: DashConfig = { ...next, games: next.games ?? {}, updatedAt: new Date().toISOString() };
  writeFileSync(p, JSON.stringify(out, null, 2) + "\n", "utf8");
  return out;
}

export function configExists() {
  return existsSync(configPath());
}
