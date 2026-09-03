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
