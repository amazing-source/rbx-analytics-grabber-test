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

// The content script is injected at document_start but its listener is only
// registered once the script body has run, and a freshly created tab loses that
// race. Retry rather than assume.
async function sendToCollector(tabId, msg, attempts = 12) {
  let lastErr = "";
  for (let i = 0; i < attempts; i++) {
    try {
      const resp = await chrome.tabs.sendMessage(tabId, msg);
      if (resp) return resp;
    } catch (e) {
      lastErr = String((e && e.message) || e);
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
      lastResult: "could not reach the page collector: " + (started.error || "unknown"),
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
  });
  return { ok: true };
}

// Toolbar click opens the dashboard as a full tab. A popup is too small for a
// game grid, and this page is the extension's primary surface now.
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
  // The panel needs this: a content script cannot call chrome.tabs itself, and
  // an unpinned extension with no icon is effectively unreachable otherwise.
  else if (msg.type === "open-dashboard") work = openDashboard();
  else if (msg.type === "schedule:result") work = handleScheduleResult(msg);
  else return;

  work.then(sendResponse).catch((e) => {
    sendResponse({ ok: false, status: 0, error: String((e && e.message) || e) });
  });
  return true; // keep the message channel open for the async response
});
