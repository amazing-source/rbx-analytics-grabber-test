// Launch a Chrome that has the RBX Analytics extension loaded and a persistent
// Roblox login, so a grab can be driven without anyone clicking.
//
// SECURITY: the Roblox session cookie lives inside the Chrome profile directory
// and is never read, exported or serialised by anything here. We deliberately do
// NOT use context.cookies() or storageState() — the repo's standing rule is that
// `.ROBLOSECURITY` is never read, stored, logged or transmitted, and a profile
// directory keeps it in Chrome's hands. Do not add cookie access to this file.
import { chromium, type BrowserContext } from "playwright";
import os from "node:os";
import path from "node:path";
import { existsSync } from "node:fs";

/** Outside the repo on purpose: a browser profile must never be committable. */
export const PROFILE_DIR =
  process.env.RBX_GRAB_PROFILE ?? path.join(os.homedir(), ".rbx-grab-profile");

export const EXTENSION_DIR = path.resolve(import.meta.dirname, "../..");

export type Launched = { context: BrowserContext; extensionId: string };

/**
 * MV3 extensions only load in a PERSISTENT context, and only with a real head —
 * `headless: true` silently drops them, which looks exactly like the extension
 * being broken. `headless: "new"` is not exposed by Playwright's launcher, so
 * headed is the supported path; RBX_GRAB_HEADFUL=0 still lets a caller try.
 */
export async function launchWithExtension(): Promise<Launched> {
  if (!existsSync(path.join(EXTENSION_DIR, "manifest.json"))) {
    throw new Error(`no manifest.json in ${EXTENSION_DIR} — is the extension dir right?`);
  }
  // A Chrome already holding this profile makes the new launch hand off to it
  // and exit 0 immediately ("Ouverture dans une session de navigateur
  // existante"). Playwright then reports a closed browser, which reads as a
  // Playwright bug rather than a stale window — it cost a silent ten-minute
  // "grab" that never issued a single request.
  await assertProfileFree();
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    channel: process.env.RBX_GRAB_CHANNEL || undefined,
    viewport: { width: 1280, height: 900 },
    args: [
      `--disable-extensions-except=${EXTENSION_DIR}`,
      `--load-extension=${EXTENSION_DIR}`,
      "--no-first-run",
      "--no-default-browser-check",
    ],
  });
  return { context, extensionId: await extensionId(context) };
}

/**
 * The unpacked extension's id is derived from its path, so it is stable per
 * machine but not knowable up front. Read it off the service worker instead of
 * hardcoding one — a hardcoded id silently addresses nothing after a move.
 */
export async function extensionId(context: BrowserContext): Promise<string> {
  let [sw] = context.serviceWorkers();
  if (!sw) sw = await context.waitForEvent("serviceworker", { timeout: 30_000 });
  const m = /^chrome-extension:\/\/([a-p]+)\//.exec(sw.url());
  if (!m) throw new Error(`could not read extension id from ${sw.url()}`);
  return m[1];
}

/** True when the profile still holds a usable Roblox login. */
export async function isLoggedIn(context: BrowserContext): Promise<boolean> {
  const page = await context.newPage();
  try {
    const r = await page.request.get("https://users.roblox.com/v1/users/authenticated");
    return r.status() === 200;
  } catch {
    return false;
  } finally {
    await page.close();
  }
}

/**
 * Refuse to launch while another Chrome holds the profile directory.
 *
 * Chrome hands a second launch off to the running instance and exits 0, so
 * Playwright sees a browser that closed by itself. The symptom is a grab that
 * starts, reports nothing, and never issues a request — indistinguishable from
 * a hung network. Better to fail loudly with the PIDs to kill.
 */
export async function assertProfileFree(): Promise<void> {
  if (process.platform !== "win32") return; // POSIX: Chrome's own SingletonLock handles it
  const { execFileSync } = await import("node:child_process");
  let out = "";
  try {
    out = execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        `Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | ` +
          `Where-Object { $_.CommandLine -like '*${path.basename(PROFILE_DIR)}*' } | ` +
          `Select-Object -ExpandProperty ProcessId`,
      ],
      { encoding: "utf8", timeout: 20_000 }
    );
  } catch {
    return; // cannot check — do not block the grab on a diagnostic
  }
  const pids = out.split(/\s+/).filter(Boolean);
  if (!pids.length) return;
  throw new Error(
    `a Chrome is already using the grab profile (${PROFILE_DIR}).\n` +
      `      Chrome would hand this launch off to it and exit, so the grab would ` +
      `never start.\n      Close that window, or: taskkill /F ${pids.map((p) => `/PID ${p}`).join(" ")}`
  );
}
