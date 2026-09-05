// One-time setup: open the dedicated grab profile so you can log into Roblox in
// it. The session then persists in that profile and `npm run grab` needs no
// further interaction.
//
//   npm run grab:login
//
// Nothing here reads or stores the cookie — you log in, Chrome keeps it in the
// profile directory, this script just waits for you to finish.
import { launchWithExtension, isLoggedIn, PROFILE_DIR } from "./browser-context.ts";

const { context } = await launchWithExtension();

if (await isLoggedIn(context)) {
  console.log(`Already logged in. Profile: ${PROFILE_DIR}`);
  console.log("Close the browser window (or press Ctrl+C) to finish.");
} else {
  console.log(`Profile: ${PROFILE_DIR}`);
  console.log("Log into Roblox in the window that just opened, then close it.");
  await context.newPage().then((p) => p.goto("https://www.roblox.com/login").catch(() => {}));
}

// Resolve when the user closes the browser.
await new Promise<void>((resolve) => context.on("close", () => resolve()));

console.log("Browser closed. Run `npm run grab -- --help` next.");
process.exit(0);
