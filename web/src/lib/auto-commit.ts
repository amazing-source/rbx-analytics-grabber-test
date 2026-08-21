// Commit and push the irreplaceable half of a grab, right after it lands.
//
// `data/games/` is gitignored as regenerable — but it is only regenerable FROM
// `data/raw/`, and Roblox drops performance and crash data after ~30 days. A
// bundle that never leaves one laptop is one disk failure or one device switch
// from being permanently gone, and no amount of re-grabbing brings back a day
// that has aged out. The scheduler is the only thing that knows the moment a
// new bundle exists, so this hangs off it.
//
// Deliberately NARROW. Three rules, each of which exists because the obvious
// implementation gets it wrong:
//
//  1. **Only data paths are staged.** `git add -A` would sweep in whatever the
//     working tree happens to be holding — half-finished code, a debug edit,
//     a scratch file — and push it hourly under a message claiming it was a
//     grab. The stage list is explicit and additive-only.
//  2. **The Open Cloud key is never auto-committed**, even though this repo
//     commits it by convention. Committing a credential is a decision someone
//     should make deliberately, once, not something a timer does every hour
//     while nobody is watching.
//  3. **Failure is logged, never thrown.** A push that fails because the remote
//     moved, or because credentials expired, must not fail the grab or stop the
//     scheduler. The commits stay local and the next successful push carries
//     them, so the recovery is automatic and lossless.
//
// Never force-pushes, never rebases, never touches a branch it is not on.

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

/** Paths that a grab legitimately produces. Anything outside this list is the
 *  developer's business, not the scheduler's. */
const STAGE = ["data/raw", "data/dashboard-config.json"];

export type AutoCommitResult = {
  ok: boolean;
  committed: boolean;
  pushed: boolean;
  detail: string;
};

async function git(root: string, args: string[]): Promise<string> {
  const { stdout } = await run("git", args, { cwd: root, windowsHide: true });
  return stdout.trim();
}

/** Repo root, resolved by git rather than by counting `..` from cwd — the app
 *  runs from `web/` but that is a layout detail, not a guarantee. */
async function repoRoot(): Promise<string | null> {
  try {
    const { stdout } = await run("git", ["rev-parse", "--show-toplevel"], {
      cwd: process.cwd(),
      windowsHide: true,
    });
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

export async function autoCommitGrab(
  universeId: string,
  summary: string
): Promise<AutoCommitResult> {
  const root = await repoRoot();
  if (!root) return { ok: false, committed: false, pushed: false, detail: "not a git repo" };

  try {
    // A detached HEAD has nowhere to push and committing onto it strands the
    // work where the next checkout silently loses it.
    const branch = await git(root, ["rev-parse", "--abbrev-ref", "HEAD"]);
    if (!branch || branch === "HEAD") {
      return { ok: false, committed: false, pushed: false, detail: "detached HEAD — skipped" };
    }

    for (const p of STAGE) {
      // A path that does not exist yet is not an error worth failing over.
      try { await git(root, ["add", "--", p]); } catch { /* nothing there yet */ }
    }

    // --cached, so an unrelated dirty working tree does not read as "we have
    // something to commit". Exit code 1 means there IS a staged diff.
    let hasStaged = false;
    try {
      await git(root, ["diff", "--cached", "--quiet"]);
    } catch {
      hasStaged = true;
    }
    if (!hasStaged) {
      return { ok: true, committed: false, pushed: false, detail: "nothing new to commit" };
    }

    const msg = `Grab ${universeId} — ${summary}\n\nAutomatic commit from the scheduled Open Cloud grab.\nRaw bundles only; see data/raw/ for the capture this describes.`;
    await git(root, ["commit", "-m", msg]);

    try {
      await git(root, ["push"]);
      return { ok: true, committed: true, pushed: true, detail: `committed + pushed on ${branch}` };
    } catch (e) {
      // Commits are safe locally; the next push takes them along.
      return {
        ok: true,
        committed: true,
        pushed: false,
        detail: `committed on ${branch}, push failed (will retry next grab): ${(e as Error).message.split("\n")[0]}`,
      };
    }
  } catch (e) {
    return { ok: false, committed: false, pushed: false, detail: (e as Error).message.split("\n")[0] };
  }
}
