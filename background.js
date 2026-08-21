// Background service worker. Three jobs, all things a content script can't do:
//
//  (1) "webapp" — privileged cross-origin calls to the local web app. In
//      Manifest V3 a content script's fetch is subject to CORS / Private
//      Network Access as if it came from the page; the service worker can use
//      the extension's host_permissions (http://localhost/*) instead.
//  (2) "download" — write the raw capture bundle into the project's data/
//      folder via chrome.downloads, so a grab is never lost just because the
//      web app or Supabase happens to be down.
//  (3) "schedule" — fire an active grab on a timer via chrome.alarms, so the
//      cadence the update-watch skill describes runs without anyone clicking.
//
// This only ever talks to the local web app and the local disk — never to
// Roblox, never with any credentials. The Roblox replay stays in the page
// context (interceptor.js), which is the whole reason the scheduler drives a
// real tab instead of fetching anything itself: the session cookie is the
// browser's business and we never see it.

// Downloads are relative to the browser's Downloads directory. The default
// assumes the repo lives at <Downloads>/rbx-analytics-grabber, which is where
// it is; the collector can override this (stored in chrome.storage.local).
const DEFAULT_DOWNLOAD_DIR = "rbx-analytics-grabber/data/raw";

const SCHEDULE_KEY = "rbx_schedule";
const ALARM_NAME = "rbx-scheduled-grab";
// chrome.alarms will not fire faster than once a minute, and a full grab of one
// universe is minutes of requests anyway. Anything under an hour is a mistake
// rather than a preference, so the floor is enforced here and not just in the UI.
const MIN_PERIOD_MINUTES = 60;

const DEFAULT_SCHEDULE = {
  enabled: false,
  everyMinutes: 360,
  universes: "",
  start: "",
  end: "",
  lastRunAt: null,
  lastResult: null,
  // Last status line the collector printed during the grab in flight. Null
  // between runs — a stale "159/159" shown before the first request has gone
  // out is worse than showing no line at all.
  progress: null,
  // Set while a scheduled grab is in flight in a tab WE opened, so the result
  // handler knows to close it again. Kept in storage, not memory: the service
  // worker is killed freely between the two halves of that exchange.
  closeTabWhenDone: null,
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getSchedule() {
  try {
    const s = await chrome.storage.local.get(SCHEDULE_KEY);
    return { ...DEFAULT_SCHEDULE, ...(s[SCHEDULE_KEY] || {}) };
  } catch {
    return { ...DEFAULT_SCHEDULE };
  }
}

async function patchSchedule(patch) {
  const next = { ...(await getSchedule()), ...patch };
  await chrome.storage.local.set({ [SCHEDULE_KEY]: next });
  return next;
}

// The alarm is derived state: it must always match what's in storage, including
// after a browser restart or an extension reload, or the schedule silently
// stops being true. Every path that changes the config calls this.
async function syncAlarm() {
  const cfg = await getSchedule();
  await chrome.alarms.clear(ALARM_NAME);
  const ids = parseUniverses(cfg.universes);
  if (!cfg.enabled || !ids.length) return cfg;

  const period = Math.max(MIN_PERIOD_MINUTES, Number(cfg.everyMinutes) || MIN_PERIOD_MINUTES);
  // delayInMinutes as well as periodInMinutes: without it the first firing is
  // one full period away, which makes "did I set this up right?" untestable.
  chrome.alarms.create(ALARM_NAME, { delayInMinutes: 1, periodInMinutes: period });
  return cfg;
}

function parseUniverses(raw) {
  return String(raw || "").split(/[\s,]+/).filter((x) => /^\d+$/.test(x));
}

function toDataUrl(text) {
  const bytes = new TextEncoder().encode(text);
  // btoa needs a binary string; chunk it so a multi-MB bundle doesn't blow the
  // argument limit on String.fromCharCode.
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return "data:application/json;base64," + btoa(binary);
}

async function handleWebapp(msg) {
  // An explicit method wins. Previously any body forced POST, which silently
  // turned the dashboard's config PUT into a POST and 405'd.
  const opts = { method: msg.method || (msg.body != null ? "POST" : "GET"), headers: {} };
  if (msg.body != null) {
    opts.headers["content-type"] = "application/json";
    opts.body = JSON.stringify(msg.body);
  }
  const res = await fetch(msg.url, opts);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { ok: res.ok, status: res.status, data };
}

async function handleDownload(msg) {
  const dir = msg.dir || DEFAULT_DOWNLOAD_DIR;
  const filename = `${dir}/${msg.filename}`.replace(/\/+/g, "/");
  const id = await chrome.downloads.download({
    url: toDataUrl(msg.text),
    filename,
    conflictAction: "uniquify",
    saveAs: false,
  });
  return { ok: true, id, filename };
}

// ---------------------------------------------------------------- scheduling

function waitForTabComplete(tabId, timeoutMs = 90000) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      chrome.tabs.onUpdated.removeListener(onUpdated);
      clearTimeout(timer);
      resolve(ok);
    };
    const onUpdated = (id, info) => {
      if (id === tabId && info.status === "complete") finish(true);
    };
    chrome.tabs.onUpdated.addListener(onUpdated);
    const timer = setTimeout(() => finish(false), timeoutMs);
    // It may already be loaded by the time we attached the listener.
    chrome.tabs.get(tabId)
      .then((tab) => { if (tab && tab.status === "complete") finish(true); })
      .catch(() => finish(false));
  });
}

// Prefer a create.roblox.com tab that is already open — that one is warm and
// definitely logged in. Only open our own as a fallback, and remember that we
// did so we can put the browser back how we found it.
async function ensureDashboardTab() {
  const existing = await chrome.tabs.query({ url: "https://create.roblox.com/*" });
  if (existing.length) return { tabId: existing[0].id, created: false };

  const tab = await chrome.tabs.create({
    url: "https://create.roblox.com/dashboard/creations",
    active: false,
  });
  const loaded = await waitForTabComplete(tab.id);
  if (!loaded) return { tabId: tab.id, created: true, slow: true };
  return { tabId: tab.id, created: true };
}

// Reloading an unpacked extension ORPHANS the content scripts already running
// in open tabs: the page keeps the old script, but its link to the new extension
// context is gone, and every message fails with "Receiving end does not exist".
// The scheduler hit exactly this — it fired on time and could not reach anyone.
// Re-inject rather than ask the user to remember to refresh the tab.
async function reinject(tabId) {
  try {
    // MAIN world, no chrome.* — an extension reload does not break it, and it
    // guards itself against being wrapped twice. This call is a deliberate
    // no-op on a page that already has it; it is here for the case where the
    // tab never had the scripts at all.
    await chrome.scripting.executeScript({ target: { tabId }, files: ["interceptor.js"], world: "MAIN" });

    // The collector is the half that actually died, and healing it needs one
    // step that is easy to miss: it guards its own re-entry with
    // window.__RBX_COLLECTOR_LOADED__, and that flag lives in the page's
    // isolated world, which SURVIVES the extension reload even though the
    // listeners it was protecting do not. Injecting collector.js on top of a
    // stale flag hits the guard and returns immediately — so the heal ran, the
    // retry loop burned its 12 attempts, and the caller still got "Receiving
    // end does not exist". Clear the flag first; that is the whole difference
    // between a heal and a no-op.
    await chrome.scripting.executeScript({
      target: { tabId },
      world: "ISOLATED",
      func: () => {
        try {
          delete window.__RBX_COLLECTOR_LOADED__;
          // Same reason: the dead copy's panel is still in the DOM.
          document.querySelectorAll("#rbx-panel,#rbx-launch").forEach((n) => n.remove());
        } catch { /* a page that blocks this still gets the injection below */ }
      },
    });
    await chrome.scripting.executeScript({ target: { tabId }, files: ["collector.js"], world: "ISOLATED" });
    return true;
  } catch { return false; }
}

// The content script is injected at document_start but its listener is only
// registered once the script body has run, and a freshly created tab loses that
// race. Retry rather than assume.
async function sendToCollector(tabId, msg, attempts = 12) {
  let lastErr = "";
  let healed = false;
  for (let i = 0; i < attempts; i++) {
    try {
      const resp = await chrome.tabs.sendMessage(tabId, msg);
      if (resp) return resp;
    } catch (e) {
      lastErr = String((e && e.message) || e);
      // One heal attempt, then keep retrying normally.
      if (!healed && /Receiving end does not exist|Could not establish connection/i.test(lastErr)) {
        healed = true;
        if (await reinject(tabId)) await sleep(900);
      }
    }
    await sleep(1500);
  }
  return { ok: false, error: lastErr || "collector never answered" };
}

async function runScheduledGrab(trigger, universesOverride) {
  const cfg = await getSchedule();
  // An override lets the dashboard's "Grab now" reuse this whole path — tab
  // discovery, the overlap guard, the result plumbing — instead of growing a
  // second grab implementation that would drift from the scheduled one.
  const universes = universesOverride != null ? String(universesOverride) : cfg.universes;
  const ids = parseUniverses(universes);
  if (!ids.length) {
    await patchSchedule({ lastRunAt: Date.now(), lastResult: "no universeIds configured" });
    return { ok: false, error: "no universeIds configured" };
  }

  // A grab still in flight must not be started again on top of itself: the
  // collector clears its capture buffer at the start of every active grab, so
  // two overlapping runs would have the second one wipe the first's evidence.
  if (cfg.running) {
    await patchSchedule({ lastResult: "skipped — previous grab still running" });
    return { ok: false, error: "already running" };
  }

  let tab;
  try {
    tab = await ensureDashboardTab();
  } catch (e) {
    const err = "could not open create.roblox.com: " + String((e && e.message) || e);
    await patchSchedule({ lastRunAt: Date.now(), lastResult: err });
    return { ok: false, error: err };
  }

  await patchSchedule({
    running: true,
    lastRunAt: Date.now(),
    lastResult: `running (${trigger}) — ${ids.length} universe(s)…`,
    closeTabWhenDone: tab.created ? tab.tabId : null,
    progress: null,
  });

  // Fire and forget: the collector answers immediately that it started, then
  // reports the outcome with a separate schedule:result message. Awaiting the
  // whole grab here would tie a multi-minute job to the service worker's
  // lifetime, and the worker is killed whenever Chrome feels like it.
  const started = await sendToCollector(tab.tabId, {
    type: "scheduled-grab",
    universes,
    start: cfg.start || "",
    end: cfg.end || "",
  });

  if (!started.ok) {
    if (tab.created) { try { await chrome.tabs.remove(tab.tabId); } catch {} }
    await patchSchedule({
      running: false,
      closeTabWhenDone: null,
      // If the re-injection heal above could not revive the collector either,
      // the tab itself is the thing to reload — say that rather than passing
      // Chrome's wording through, which names neither cause nor fix.
      lastResult: /Receiving end does not exist|Could not establish connection/i.test(String(started.error || ""))
        ? "could not reach the collector in the create.roblox.com tab — reload that tab and try again"
        : "could not reach the page collector: " + (started.error || "unknown"),
    });
    return started;
  }
  return { ok: true, started: true };
}

async function handleScheduleResult(msg) {
  const cfg = await getSchedule();
  if (cfg.closeTabWhenDone != null) {
    try { await chrome.tabs.remove(cfg.closeTabWhenDone); } catch {}
  }
  await patchSchedule({
    running: false,
    closeTabWhenDone: null,
    lastRunAt: Date.now(),
    lastResult: msg.summary || "finished",
    progress: null,
  });
  return { ok: true };
}

// Toolbar click opens the dashboard as a full tab. A popup is too small for a
// game grid, and this page is the extension's primary surface now.
// The dashboard runs on the extension origin; the capture buffer and the Roblox
// session live in the content script. Anything the dashboard wants done to that
// buffer is forwarded here, because only the worker can reach a tab.
async function collectorCmd(msg) {
  let tab;
  try { tab = await ensureDashboardTab(); }
  catch (e) { return { ok: false, error: "no create.roblox.com tab: " + String((e && e.message) || e) }; }
  const r = await sendToCollector(tab.tabId, { type: "collector-cmd", cmd: msg.cmd, payload: msg.payload || null }, 6);
  return r || { ok: false, error: "collector did not answer" };
}

async function openDashboard() {
  const url = chrome.runtime.getURL("dashboard.html");
  const open = await chrome.tabs.query({ url });
  if (open.length) await chrome.tabs.update(open[0].id, { active: true });
  else await chrome.tabs.create({ url });
  return { ok: true };
}
chrome.action.onClicked.addListener(() => { openDashboard(); });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) runScheduledGrab("timer");
});

// Alarms survive a browser restart, but an extension reload during development
// wipes them while leaving storage intact — which reads as "the schedule is on"
// with nothing behind it. Re-derive on both events.
chrome.runtime.onStartup.addListener(() => { syncAlarm(); });
chrome.runtime.onInstalled.addListener(() => { syncAlarm(); });

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg) return;
  let work;
  if (msg.type === "webapp" && msg.url) work = handleWebapp(msg);
  else if (msg.type === "download" && msg.text != null) work = handleDownload(msg);
  else if (msg.type === "schedule:get") work = getSchedule();
  else if (msg.type === "schedule:set") work = patchSchedule(msg.patch || {}).then(syncAlarm);
  else if (msg.type === "schedule:runNow") work = runScheduledGrab("manual");
  else if (msg.type === "grab:now" && msg.universes) work = runScheduledGrab("dashboard", msg.universes);
  else if (msg.type === "grab:status") work = getSchedule();
  // The collector's own status line, forwarded so the dashboard can show the
  // same progress the create.roblox.com panel shows.
  else if (msg.type === "grab:progress")
    work = patchSchedule({
      progress: { text: String(msg.text || ""), color: msg.color || null, at: msg.at || Date.now() },
    });
  // The panel needs this: a content script cannot call chrome.tabs itself, and
  // an unpinned extension with no icon is effectively unreachable otherwise.
  else if (msg.type === "open-dashboard") work = openDashboard();
  else if (msg.type === "collector:cmd") work = collectorCmd(msg);
  else if (msg.type === "schedule:result") work = handleScheduleResult(msg);
  else return;

  work.then(sendResponse).catch((e) => {
    sendResponse({ ok: false, status: 0, error: String((e && e.message) || e) });
  });
  return true; // keep the message channel open for the async response
});
