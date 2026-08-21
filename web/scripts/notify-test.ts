// Preview — or actually fire — the anomaly webhook.
//
//   npm run notify-test -- <universeId>          print what WOULD be sent
//   npm run notify-test -- <universeId> --send   post it to the configured hook
//
// Preview is the default on purpose: a webhook posts into a channel other
// people read, and "let me just check the formatting" should not cost them a
// notification.

import "./loader-hooks.mjs";

// Dynamic, not static: ESM hoists static imports above the loader-hook
// registration, so "@/" would be resolved before the resolver understands it.
const { findingsFor, buildMessage, webhookFor } = await import("../src/lib/notify.ts");
const { readConfig } = await import("../src/lib/opencloud.ts");

const universe = process.argv[2];
const send = process.argv.includes("--send");
// Lower the bar to see what an alert would look like on a quiet game. Tuning
// aid only — the scheduler always uses the real threshold.
const zi = process.argv.indexOf("--z");
const z = zi > -1 ? Number(process.argv[zi + 1]) : undefined;
if (!/^\d+$/.test(universe || "")) {
  console.error("usage: npm run notify-test -- <universeId> [--send]");
  process.exit(2);
}

const cfg = readConfig();
const hook = webhookFor(cfg, universe);
console.log(`universe ${universe} · webhook ${hook ? hook.replace(/\/[\w-]{40,}$/, "/***") : "NONE configured"}`);

const { date, findings } = await findingsFor(universe, { z });
if (!date) {
  console.log("no scoreable daily series in the corpus — grab first, or the metrics have <21 settled days");
  process.exit(0);
}
console.log(`latest scoreable day: ${date} · ${findings.length} finding(s) at |z| >= ${z ?? 2}
`);

if (!findings.length) {
  console.log("nothing outside the weekday baseline — quiet by design, nothing would be sent");
  process.exit(0);
}

const payload = buildMessage(universe, date, findings);
console.log(payload.embeds[0].title);
console.log(payload.embeds[0].description);
console.log(`\n(color ${payload.embeds[0].color.toString(16)})`);

if (!send) {
  console.log("\n--- preview only. re-run with --send to post it ---");
  process.exit(0);
}
if (!hook) {
  console.error("\nno webhook configured for this universe");
  process.exit(1);
}
const r = await fetch(hook, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload),
});
console.log(`\nposted: HTTP ${r.status}${r.ok ? "" : " — " + (await r.text()).slice(0, 300)}`);
