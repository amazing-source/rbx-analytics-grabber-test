// Background service worker. Two jobs, both things a content script can't do:
//
//  (1) "webapp" — privileged cross-origin calls to the local web app. In
//      Manifest V3 a content script's fetch is subject to CORS / Private
//      Network Access as if it came from the page; the service worker can use
//      the extension's host_permissions (http://localhost/*) instead.
//  (2) "download" — write the raw capture bundle into the project's data/
//      folder via chrome.downloads, so a grab is never lost just because the
//      web app or Supabase happens to be down.
//
// This only ever talks to the local web app and the local disk — never to
// Roblox, never with any credentials. The Roblox replay stays in the page
// context (interceptor.js).

// Downloads are relative to the browser's Downloads directory. The default
// assumes the repo lives at <Downloads>/rbx-analytics-grabber, which is where
// it is; the collector can override this (stored in chrome.storage.local).
const DEFAULT_DOWNLOAD_DIR = "rbx-analytics-grabber/data/raw";

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
  const opts = { method: msg.method || "GET", headers: {} };
  if (msg.body != null) {
    opts.method = "POST";
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

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg) return;
  let work;
  if (msg.type === "webapp" && msg.url) work = handleWebapp(msg);
  else if (msg.type === "download" && msg.text != null) work = handleDownload(msg);
  else return;

  work.then(sendResponse).catch((e) => {
    sendResponse({ ok: false, status: 0, error: String((e && e.message) || e) });
  });
  return true; // keep the message channel open for the async response
});
