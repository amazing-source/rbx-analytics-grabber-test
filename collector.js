// Runs in the extension's ISOLATED world. Three jobs:
//  (1) Passive: receive responses the dashboard already loaded (from the
//      interceptor) and let you review / download / send them.
//  (2) Active grab: ask the web app for a "grab plan" (request templates for a
//      universeId), have the MAIN-world interceptor replay them in your logged-in
//      session, and forward the results to the web app. No browsing tabs.
//  (3) Always land the raw bundle in the project's data/raw folder — before the
//      web app is involved at all. A grab that reaches Roblox successfully must
//      not be lost because localhost:3000 isn't running.
// The extension stays dumb: the web app decides WHAT to pull; we just execute.

(() => {
  // Re-injection after an extension reload must not double-register listeners.
  if (window.__RBX_COLLECTOR_LOADED__) return;
  window.__RBX_COLLECTOR_LOADED__ = true;

  const TAG = "__RBX_GRAB__";
  const EXEC = "__RBX_EXEC__";
  const EXEC_RESULT = "__RBX_EXEC_RESULT__";
  const INGEST_URL_KEY = "rbx_ingest_url";
  const DOWNLOAD_DIR_KEY = "rbx_download_dir";
  const UI_STATE_KEY = "rbx_ui_state"; // "open" | "collapsed" | "closed"
  const DEFAULT_INGEST_URL = "http://localhost:3000/api/ingest";
  // Relative to the browser's Downloads folder — the repo lives there.
  const DEFAULT_DOWNLOAD_DIR = "rbx-analytics-grabber/data/raw";
  const captures = [];
  const CAPTURES_MIRROR_KEY = "rbx_captures_mirror";

  // The dashboard cannot see this array: it runs on the extension origin in an
  // iframe. Mirror a light summary to storage so it can render the same list
  // without a round trip per paint. Throttled — a grab pushes hundreds of rows.
  let mirrorTimer = null;
  function mirrorCaptures() {
    if (mirrorTimer) return;
    mirrorTimer = setTimeout(() => {
      mirrorTimer = null;
      const recent = captures.slice(-40).map((c2) => ({ url: c2.url, method: c2.method, via: c2.via, ts: c2.ts }));
      try { chrome.storage.local.set({ [CAPTURES_MIRROR_KEY]: { count: captures.length, recent, at: Date.now() } }); } catch {}
    }, 400);
  }

  // exec correlation: id -> resolver
  const pending = new Map();
  let idSeq = 1;

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    const d = event.data;
    if (!d) return;
    if (d[TAG]) {
      captures.push({
        url: d.url, method: d.method, via: d.via, ts: d.ts,
        reqBody: d.reqBody ?? null, body: d.body,
      });
      render();
      mirrorCaptures();
      return;
    }
    if (d[EXEC_RESULT]) {
      const cb = pending.get(d.id);
      if (cb) { pending.delete(d.id); cb(d); }
    }
  });

  let panel, launcher, countEl, statusEl, activeEl;

  async function getIngestUrl() {
    try {
      const stored = await chrome.storage.local.get(INGEST_URL_KEY);
      return stored[INGEST_URL_KEY] || DEFAULT_INGEST_URL;
    } catch { return DEFAULT_INGEST_URL; }
  }
  async function setIngestUrl(url) {
    try { await chrome.storage.local.set({ [INGEST_URL_KEY]: url }); } catch {}
  }
  async function getDownloadDir() {
    try {
      const stored = await chrome.storage.local.get(DOWNLOAD_DIR_KEY);
      return stored[DOWNLOAD_DIR_KEY] || DEFAULT_DOWNLOAD_DIR;
    } catch { return DEFAULT_DOWNLOAD_DIR; }
  }
  // The extension's own exclusion settings, sent with the plan request so a
  // grab honours what the dashboard is showing rather than whatever was last
  // written to disk.
  async function excludeParam() {
    try {
      const s2 = await chrome.storage.local.get("rbx_dash_cfg");
      const ex = (s2 && s2.rbx_dash_cfg && s2.rbx_dash_cfg.exclude) || {};
      const on = Object.keys(ex).filter((k) => ex[k] === true);
      return on.length ? on.join(",") : "";
    } catch { return ""; }
  }

  function baseFrom(ingestUrl) {
    return ingestUrl.replace(/\/api\/ingest\/?$/, "");
  }

  // All web-app (localhost) calls go through the background service worker —
  // content scripts can't make these privileged cross-origin requests in MV3.
  function bg(message, timeoutMs = 120000) {
    return new Promise((resolve) => {
      let done = false;
      const to = setTimeout(() => {
        if (!done) { done = true; resolve({ ok: false, status: 0, error: "timeout" }); }
      }, timeoutMs);
      try {
        chrome.runtime.sendMessage(message, (resp) => {
          if (done) return;
          done = true; clearTimeout(to);
          if (chrome.runtime.lastError) {
            resolve({ ok: false, status: 0, error: chrome.runtime.lastError.message });
            return;
          }
          resolve(resp || { ok: false, status: 0, error: "no response from background" });
        });
      } catch (e) {
        if (!done) { done = true; clearTimeout(to); resolve({ ok: false, status: 0, error: String(e) }); }
      }
    });
  }
  const webappFetch = (url, body, timeoutMs) =>
    bg({ type: "webapp", url, body: body ?? null }, timeoutMs);

  // "Failed to fetch" from the service worker means the local server refused the
  // connection. Say that, instead of making the user guess.
  function explain(error, base) {
    if (!error) return "";
    if (/failed to fetch|networkerror|refused|timeout/i.test(String(error))) {
      return `web app not reachable at ${base} — start it with: cd web && npm run dev`;
    }
    return String(error);
  }

  function guessUniverse() {
    const m = location.href.match(/(\d{6,})/);
    return m ? m[1] : "";
  }


  // ---- in-page dashboard ---------------------------------------------------
  //
  // The dashboard lives INSIDE create.roblox.com rather than in its own tab,
  // because everything else about this tool already happens here. It is an
  // iframe of the extension's own page, which buys two things a hand-rolled
  // in-page render would not: Roblox's stylesheet cannot reach into it, and the
  // frame runs on the extension origin, so it keeps its host_permissions and can
  // call the Roblox APIs and the service worker exactly as it does standalone.
  // Zero duplicated UI code.
  let overlay = null;

  function toggleOverlay(show) {
    // Built once and hidden, never torn down. Rebuilding meant reloading the
    // whole dashboard document on every open — the frame is cheap to keep and
    // the second open should be instant.
    if (overlay) {
      overlay.style.display = show ? "flex" : "none";
      if (show) document.addEventListener("keydown", onOverlayKey, true);
      else document.removeEventListener("keydown", onOverlayKey, true);
      return;
    }
    if (show && !overlay) {
      overlay = document.createElement("div");
      overlay.id = "rbx-overlay";
      overlay.style.cssText = [
        "position:fixed", "inset:0", "z-index:2147483646",
        "background:rgba(6,5,12,.72)", "backdrop-filter:blur(3px)",
        "display:flex", "align-items:center", "justify-content:center", "padding:24px"
      ].join(";");

      const shell = document.createElement("div");
      shell.style.cssText = [
        "position:relative", "width:100%", "max-width:1240px", "height:100%",
        "border-radius:16px", "overflow:hidden", "background:#0f0e17",
        "border:1px solid #282540", "box-shadow:0 30px 90px rgba(0,0,0,.6)"
      ].join(";");

      const close = document.createElement("button");
      close.textContent = "✕";
      close.title = "Close (Esc)";
      close.style.cssText = [
        "position:absolute", "top:12px", "right:14px", "z-index:2",
        "cursor:pointer", "background:#1d1b2e", "border:1px solid #332f4d",
        "color:#a49dbd", "border-radius:9px", "padding:6px 11px", "font-size:13px"
      ].join(";");
      close.onclick = () => toggleOverlay(false);

      const frame = document.createElement("iframe");
      frame.src = chrome.runtime.getURL("dashboard.html");
      frame.style.cssText = "width:100%;height:100%;border:0;display:block;background:#0f0e17";

      shell.appendChild(close);
      shell.appendChild(frame);
      overlay.appendChild(shell);
      // Clicking the scrim closes; clicking inside must not.
      overlay.addEventListener("mousedown", (e) => { if (e.target === overlay) toggleOverlay(false); });
      document.documentElement.appendChild(overlay);
      document.addEventListener("keydown", onOverlayKey, true);
    }
  }

  function onOverlayKey(e) {
    if (e.key === "Escape") { e.stopPropagation(); toggleOverlay(false); }
  }

  function ensurePanel() {
    if (panel) return;
    panel = document.createElement("div");
    panel.style.cssText = [
      "position:fixed", "bottom:20px", "right:20px", "z-index:2147483647",
      "width:352px", "font:13px/1.45 'Builder Sans',system-ui,-apple-system,sans-serif",
      "color:#e9e9f2", "background:#141320", "border:1px solid #272438",
      "border-radius:14px", "box-shadow:0 16px 48px rgba(0,0,0,.55)",
      "overflow:hidden", "backdrop-filter:saturate(1.2)"
    ].join(";");
    panel.innerHTML = `
      <div style="padding:11px 13px;background:linear-gradient(180deg,#1e1b2e,#1a1828);display:flex;justify-content:space-between;align-items:center;gap:8px">
        <span style="display:flex;align-items:center;gap:8px;min-width:0">
          <span style="width:7px;height:7px;border-radius:99px;background:#7c5cff;box-shadow:0 0 0 3px rgba(124,92,255,.18);flex:none"></span>
          <strong style="color:#efeaff;font-size:13px;letter-spacing:.2px">RBX Grab</strong>
        </span>
        <span style="display:flex;align-items:center;gap:6px;flex:none">
          <span id="rbx-count" title="captures buffered" style="background:#2a2540;color:#cfc9e0;border-radius:99px;padding:2px 9px;font-size:11px;font-variant-numeric:tabular-nums">0</span>
          <button id="rbx-min" title="Collapse" style="cursor:pointer;background:transparent;border:0;color:#8f88a8;border-radius:7px;padding:2px 7px;font-size:16px;line-height:1">\u2013</button>
          <button id="rbx-close" title="Hide" style="cursor:pointer;background:transparent;border:0;color:#8f88a8;border-radius:7px;padding:2px 7px;font-size:16px;line-height:1">\u00d7</button>
        </span>
      </div>
      <div id="rbx-body" style="padding:11px 13px">
        <button id="rbx-dash" style="width:100%;cursor:pointer;background:linear-gradient(180deg,#8468ff,#6d4ff5);border:0;color:#fff;border-radius:9px;padding:10px;font-size:12.5px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:7px">
          <span style="font-size:13px">\u25a6</span> Open dashboard
        </button>
        <div id="rbx-active" style="font-size:11px;color:#9a93b3;min-height:0;margin-top:8px;line-height:1.4"></div>
        <div id="rbx-status" style="font-size:11px;color:#6e6885;min-height:0;margin-top:4px"></div>
      </div>`;
    document.documentElement.appendChild(panel);

    // A little launcher pill so a hidden panel is always recoverable without
    // reloading the tab. Shown only while the panel is fully closed.
    launcher = document.createElement("button");
    launcher.id = "rbx-launch";
    launcher.textContent = "RBX Grab";
    launcher.style.cssText = [
      "position:fixed", "bottom:20px", "right:20px", "z-index:2147483647", "display:none",
      "cursor:pointer", "background:linear-gradient(180deg,#8468ff,#6d4ff5)", "border:0",
      "color:#fff", "border-radius:99px", "padding:9px 16px", "font-weight:600",
      "font:600 12px 'Builder Sans',system-ui,-apple-system,sans-serif",
      "box-shadow:0 10px 32px rgba(109,79,245,.42)"
    ].join(";");
    launcher.onclick = () => setUiState("open");
    document.documentElement.appendChild(launcher);
    countEl  = panel.querySelector("#rbx-count");
    statusEl = panel.querySelector("#rbx-status");
    activeEl = panel.querySelector("#rbx-active");
    panel.querySelector("#rbx-min").onclick = () => {
      const collapsed = panel.querySelector("#rbx-body").style.display === "none";
      setUiState(collapsed ? "open" : "collapsed");
    };
    panel.querySelector("#rbx-close").onclick = () => setUiState("closed");
    // Restore the last chosen visibility so it stays out of the way across
    // page navigations (this content script re-runs on every full load).
    (async () => {
      let state = "open";
      try { const s = await chrome.storage.local.get(UI_STATE_KEY); state = s[UI_STATE_KEY] || "open"; } catch {}
      applyUiState(state);
    })();
    // which would arrive as runActiveGrab's options object.
    panel.querySelector("#rbx-dash").onclick = () => toggleOverlay(true);

  }

  // The scheduler lives in the service worker, which deliberately cannot reach
  // Roblox: it drives this page instead, so every request still leaves from the
  // session the browser already holds. Answer "started" straight away and report
  // the outcome separately — a full grab far outlives the message channel.
  // Commands from the dashboard. Kept tiny and synchronous-ish: the dashboard
  // owns the UI, this owns the buffer and the Roblox session.
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!msg || msg.type !== "collector-cmd") return;
    ensurePanel();
    (async () => {
      try {
        if (msg.cmd === "captures") {
          sendResponse({ ok: true, count: captures.length, recent: captures.slice(-40).map((c2) => ({ url: c2.url, method: c2.method, via: c2.via, ts: c2.ts })) });
        } else if (msg.cmd === "clear") {
          captures.length = 0; setStatus(""); render(); mirrorCaptures();
          sendResponse({ ok: true, count: 0 });
        } else if (msg.cmd === "send") {
          const out = await deliver(captures, guessUniverse());
          setStatus(out.msg, !out.ok ? "#ff7c7c" : "#7cd992");
          sendResponse({ ok: out.ok, msg: out.msg });
        } else if (msg.cmd === "save") {
          const out = await saveToFolder(captures, guessUniverse(), true);
          sendResponse({ ok: true, msg: (out && out.msg) || "saved" });
        } else if (msg.cmd === "pull") {
          const p = msg.payload || {};
          const r = await runActiveGrab({ universes: p.universes, start: p.start || "", end: p.end || "" });
          sendResponse({ ok: true, summary: (r && r.summary) || "done" });
        } else {
          sendResponse({ ok: false, error: "unknown cmd " + msg.cmd });
        }
      } catch (e) { sendResponse({ ok: false, error: String((e && e.message) || e) }); }
    })();
    return true;
  });

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!msg || msg.type !== "scheduled-grab") return;
    ensurePanel();
    setActive("scheduled grab starting…");
    runActiveGrab({ universes: msg.universes, start: msg.start || "", end: msg.end || "" })
      .then((r) => bg({ type: "schedule:result", summary: (r && r.summary) || "finished" }, 15000))
      .catch((e) => bg({ type: "schedule:result", summary: "failed: " + String((e && e.message) || e) }, 15000));
    sendResponse({ ok: true, started: true });
  });

  function setStatus(msg, color) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.style.color = color || "#9a93b3";
  }
  function setActive(msg, color) {
    if (!activeEl) return;
    activeEl.textContent = msg;
    activeEl.style.color = color || "#9a93b3";
  }

  // open = full panel · collapsed = header bar only · closed = hidden, launcher shown
  function applyUiState(state) {
    if (!panel) return;
    const body = panel.querySelector("#rbx-body");
    const min = panel.querySelector("#rbx-min");
    if (state === "closed") {
      panel.style.display = "none";
      if (launcher) launcher.style.display = "block";
      return;
    }
    panel.style.display = "";
    if (launcher) launcher.style.display = "none";
    const collapsed = state === "collapsed";
    if (body) body.style.display = collapsed ? "none" : "";
    if (min) { min.textContent = collapsed ? "+" : "–"; min.title = collapsed ? "Expand" : "Collapse"; }
  }
  async function setUiState(state) {
    applyUiState(state);
    try { await chrome.storage.local.set({ [UI_STATE_KEY]: state }); } catch {}
  }

  // ---- folder sink -----------------------------------------------------------
  // The web app writes data/raw itself on ingest, and it resolves the real repo
  // path — so this is the FALLBACK for when the web app can't be reached, not a
  // second copy. chrome.downloads can write into a subfolder; if it refuses
  // (data-URL size, permission), fall back again to a plain blob download, which
  // lands flat in Downloads but still saves the data.
  async function saveToFolder(records, universeHint, announce) {
    if (!records.length) { if (announce) setStatus("nothing to save"); return null; }
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${universeHint || "captures"}-${stamp}.json`;
    const text = JSON.stringify(records);
    const dir = await getDownloadDir();

    const r = await bg({ type: "download", text, filename, dir });
    if (r && r.ok) {
      if (announce) setStatus(`saved → ${r.filename}`, "#7cd992");
      return r.filename;
    }
    try {
      const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url; a.download = filename;
      document.documentElement.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      if (announce) setStatus(`saved to Downloads/${filename} (move it into data/raw)`, "#ffd27c");
      return filename;
    } catch (e) {
      if (announce) setStatus("save failed: " + String(e), "#ff7c7c");
      return null;
    }
  }

  // Hand a batch to the web app, which writes data/raw + data/games and then
  // upserts to Supabase. Only if it can't be reached do we write the raw bundle
  // ourselves — otherwise every send would leave two copies in data/raw.
  // Returns a display string for the panel.
  async function deliver(records, universeHint, report) {
    const ingestUrl = await getIngestUrl();
    const base = baseFrom(ingestUrl);
    const r = await webappFetch(ingestUrl, { captures: records, report: report ?? null });
    const body = r.data || {};

    // Reached the app and it wrote something — even if Supabase then failed.
    // A report-only delivery (every request failed) still counts as reaching it.
    if (r.ok && body.files && (body.files.dataDir || body.files.report) && !body.files.error) {
      const c = body.counts || {};
      const dbNote = body.ok === false ? ` · db: ${body.error}` : "";
      return {
        ok: true,
        degraded: body.ok === false,
        msg: `${c.snapshots || 0} pts, ${c.metrics || 0} metrics → data/ ✓${dbNote}`,
      };
    }

    const why = explain(r.error, base) || body.error || ("HTTP " + r.status);
    const saved = await saveToFolder(records, universeHint, false);
    return {
      ok: !!saved,
      degraded: true,
      msg: saved ? `saved → ${saved} ✓ · web app: ${why}` : `failed: ${why}`,
    };
  }

  // Ask the MAIN-world interceptor to replay one request in the authed session.
  function execViaMain(request) {
    return new Promise((resolve) => {
      const id = String(idSeq++);
      const timer = setTimeout(() => {
        pending.delete(id);
        resolve({ ok: false, status: 0, error: "timeout" });
      }, 90000);
      pending.set(id, (msg) => { clearTimeout(timer); resolve(msg); });
      window.postMessage({ [EXEC]: true, id, request }, "*");
    });
  }

  async function runPool(items, n, worker) {
    let i = 0;
    const runners = Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) { const idx = i++; await worker(items[idx]); }
    });
    await Promise.all(runners);
  }

  function toISO(dateStr) {
    return dateStr ? new Date(dateStr + "T00:00:00Z").toISOString() : "";
  }

  // `opts` lets the scheduler drive this exact function rather than a parallel
  // copy of it. A timed grab and a clicked grab must be the same grab, or only
  // one of the two is the one the three gates were ever run against.
  async function runActiveGrab(opts) {
    const o = opts || {};
    const rawIds = o.universes != null ? o.universes : (uniInput ? uniInput.value : "");
    const ids = String(rawIds).split(/[\s,]+/).filter((x) => /^\d+$/.test(x));
    const summaries = [];
    if (!ids.length) {
      setActive("enter at least one numeric universeId", "#ff7c7c");
      return { ok: false, summary: "no valid universeId" };
    }

    // An active grab is a clean pull. Drop whatever the dashboard happened to
    // load while browsing, so a half-empty passive buffer can never be mistaken
    // for the grab's own result — which is exactly how a 16-metric "pull" once
    // looked like a coverage bug instead of a grab that never ran.
    if (captures.length) {
      setStatus(`cleared ${captures.length} passive capture(s) before pulling`);
      captures.length = 0;
      render();
    }

    const ingestUrl = await getIngestUrl();
    const base = baseFrom(ingestUrl);
    const start = toISO(o.start != null ? o.start : "");
    const end = toISO(o.end != null ? o.end : "");

    for (const u of ids) {
      setActive(`planning ${u}…`);
      const ex = await excludeParam();
      const qs = `universe=${u}` + (start ? `&start=${encodeURIComponent(start)}` : "") + (end ? `&end=${encodeURIComponent(end)}` : "") + `&exclude=${encodeURIComponent(ex)}`;
      const planRes = await webappFetch(`${base}/api/grab-plan?${qs}`, null, 30000);
      if (!planRes.ok) {
        setActive(`plan failed for ${u}: ${explain(planRes.error, base) || ("HTTP " + planRes.status)}`, "#ff7c7c");
        summaries.push(`${u}: plan failed (${planRes.status || "no response"})`);
        continue;
      }
      let plan = planRes.data || {};

      // Phase 0 — discover this universe's dimension VALUES before planning.
      // Funnel names are developer-defined; assuming them produced valid
      // queries that matched nothing, which is worse than no data at all.
      const discovery = plan.discovery || [];
      const discoveryCaptures = [];
      const discoveryAttempts = [];
      if (discovery.length) {
        setActive(`${u}: discovering dimensions…`);
        const discovered = {};
        await runPool(discovery, 3, async (request) => {
          const r = await execViaMain(request);
          // Every discovery attempt goes in the grab report too — a silent
          // discovery failure reads as "this game has no funnels", which is
          // exactly the class of false finding this tool must not produce.
          const att = {
            metric: null,
            kind: request.kind,
            granularity: "",
            breakdown: request.dimension || "",
            filter: "",
            optional: true,
            provenance: "observed",
            status: r.status || 0,
            ok: false,
            points: 0,
            error: r.error || null,
          };
          discoveryAttempts.push(att);
          if (!r.ok || !r.body) return;
          discoveryCaptures.push({ url: r.url, method: r.method || "POST", via: "active", ts: Date.now(), reqBody: r.reqBody, body: r.body });
          // the universe's places — needed to ask for version history
          if (request.kind === "places") {
            const ids = (r.body.data || []).map((p) => String(p.id ?? p.placeId ?? "")).filter(Boolean);
            att.ok = Array.isArray(r.body.data);
            att.points = ids.length;
            if (ids.length) discovered.__places = [...new Set([...(discovered.__places || []), ...ids])];
            return;
          }
          const groups = r.body?.operation?.dimensionValuesResult?.values || [];
          att.ok = !!r.body?.operation?.dimensionValuesResult;
          for (const g of groups) {
            const name = g.dimension?.name || request.dimension;
            const vals = (g.values || []).map((v) => v.value).filter(Boolean);
            att.points += vals.length;
            if (name && vals.length) discovered[name] = [...new Set([...(discovered[name] || []), ...vals])];
          }
        });
        const found = Object.entries(discovered).map(([k, v]) => `${k.replace("__", "")}:${v.length}`).join(" ");
        setActive(`${u}: discovered ${found || "nothing"} — replanning…`);
        const re = await webappFetch(`${base}/api/grab-plan`, { universe: u, start, end, discovered, exclude: ex }, 30000);
        if (re.ok && re.data && re.data.requests) plan = re.data;
      }

      const reqs = plan.requests || [];
      if (!reqs.length) {
        setActive("empty plan — the web app returned no requests", "#ffd27c");
        continue;
      }
      for (const w of plan.warnings || []) setStatus(w, "#ffd27c");

      let done = 0, ok = 0, skipped = 0;
      const results = [];
      // Every attempt is recorded, including the ones that produced nothing.
      // Silently dropping failures once made a plan that half-worked look like
      // a metric-coverage problem — the grab report exists so that can't recur.
      const attempts = [];
      await runPool(reqs, 3, async (request) => {
        const r = await execViaMain(request);
        done++;
        const q = (request.body && request.body.query) || {};
        const attempt = {
          metric: request.metric,
          kind: request.kind,
          granularity: q.granularity || "",
          breakdown: (q.breakdown || []).flatMap((b) => b.dimensions || []).join("+"),
          filter: (q.filter || []).map((f) => `${f.dimension}=${(f.values || []).join("/")}`).join(","),
          optional: !!request.optional,
          provenance: request.provenance || null,
          status: r.status || 0,
          ok: false,
          points: 0,
          error: r.error || null,
        };
        if (r.ok && r.body) {
          const b = r.body;
          // Success detection must understand every body shape the plan can
          // request. It once only knew the metrics-gateway shapes, so
          // saved-versions responses with 100 rows were reported as FAILED
          // while their data sat in the export — the report's one job,
          // inverted.
          if (request.kind === "reviews") {
            // Feedback: the interceptor already merged every cursor page, so the
            // point count is just how many reviews came back.
            attempt.points = Array.isArray(b.reviews) ? b.reviews.length : 0;
            attempt.ok = Array.isArray(b.reviews);
          } else if (Array.isArray(b.data)) {
            // develop.roblox.com list bodies: places, saved-versions
            attempt.points = b.data.length;
            attempt.ok = true;
          } else if (Array.isArray(b.annotations)) {
            attempt.points = b.annotations.length;
            attempt.ok = true;
          } else if (b.operation && b.operation.dimensionValuesResult) {
            attempt.points = (b.operation.dimensionValuesResult.values || [])
              .reduce((s, g) => s + ((g.values || []).length), 0);
            attempt.ok = true;
          } else {
            const meta = b.operation?.metricMetadataResult?.metadata;
            const values = b.operation?.queryResult?.values ?? b.result?.values ?? (meta ? [] : null);
            attempt.points = meta
              ? meta.length
              : (values || []).reduce((s, v) => s + ((v.dataPoints || []).length), 0);
            // A 200 with zero points is not a success — that distinction is what
            // tells you "not enabled for this game" vs "no data in this window".
            attempt.ok = !!values || !!meta;
          }
          results.push({ url: r.url, method: r.method || "POST", via: "active", ts: Date.now(), reqBody: r.reqBody, body: r.body });
          ok++;
        } else if (request.optional) {
          skipped++;
        }
        attempts.push(attempt);
        setActive(`${u}: ${done}/${reqs.length} replayed (${ok} ok${skipped ? `, ${skipped} n/a` : ""})`);
      });

      const report = {
        universeId: u,
        startTime: plan.startTime,
        endTime: plan.endTime,
        planSource: plan.source,
        discovered: plan.discovered || null,
        requested: reqs.length,
        // Discovery attempts lead the report — a failed discovery silently
        // shrinks the whole plan (no funnel names = no funnel requests).
        attempts: [...discoveryAttempts, ...attempts],
      };

      // Discovery captures ship with the grab: they are the provenance for
      // which dimension values exist. They used to stay in the panel buffer,
      // so no raw bundle contained the evidence discovery acted on.
      const delivery = [...discoveryCaptures, ...results];
      if (!delivery.length) {
        // Still deliver the report — knowing every request failed, and with
        // what status, is the whole point.
        await deliver([], u, report);
        setActive(`${u}: 0/${reqs.length} returned data — see data/games/${u}/grab-report.md`, "#ff7c7c");
        summaries.push(`${u}: 0/${reqs.length} returned data`);
        continue;
      }
      if (plan && plan.excluded && plan.excluded.dropped) {
        setStatus(`${plan.excluded.dropped} request(s) skipped by settings: ${plan.excluded.families.join(", ")}`);
      }
      captures.push(...delivery);
      render();

      const out = await deliver(delivery, u, report);
      setActive(`${u}: ${out.msg}`, !out.ok ? "#ff7c7c" : out.degraded ? "#ffd27c" : "#7cd992");
      summaries.push(`${u}: ${out.msg}`);
    }
    return { ok: true, summary: summaries.join(" · ") || "nothing ran" };
  }

  async function send() {
    if (captures.length === 0) { setStatus("nothing to send"); return; }
    setStatus("sending…");
    const out = await deliver(captures, guessUniverse());
    setStatus(out.msg, !out.ok ? "#ff7c7c" : out.degraded ? "#ffd27c" : "#7cd992");
  }

  function shortUrl(u) {
    try { const x = new URL(u); return x.host.replace("www.", "") + x.pathname; }
    catch { return String(u).slice(0, 50); }
  }

  // Throttled. render() used to run once per captured response, so a 400-request
  // grab did 400 full innerHTML rebuilds of the list while the page was already
  // busy replaying requests — which is what made the extension feel laggy.
  // One repaint per animation frame is indistinguishable to a human and ~400x
  // cheaper here.
  let renderQueued = false;
  function render() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => { renderQueued = false; renderNow(); });
  }

  function renderNow() {
    ensurePanel();
    // The capture LIST lives in the dashboard now. All this has to do is keep
    // the counter honest, which is one textContent write instead of rebuilding
    // a list on every captured response.
    if (countEl) countEl.textContent = String(captures.length);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", renderNow);
  else renderNow();
})();
