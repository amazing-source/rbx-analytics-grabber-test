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
      return;
    }
    if (d[EXEC_RESULT]) {
      const cb = pending.get(d.id);
      if (cb) { pending.delete(d.id); cb(d); }
    }
  });

  let panel, launcher, countEl, listEl, statusEl, activeEl, uniInput, startInput, endInput;

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

  function ensurePanel() {
    if (panel) return;
    panel = document.createElement("div");
    panel.style.cssText = [
      "position:fixed", "bottom:16px", "right:16px", "z-index:2147483647",
      "width:340px", "font:12px/1.4 system-ui,-apple-system,sans-serif", "color:#e8e8ef",
      "background:#15131f", "border:1px solid #2d2a3d", "border-radius:10px",
      "box-shadow:0 8px 30px rgba(0,0,0,.5)", "overflow:hidden"
    ].join(";");
    panel.innerHTML = `
      <div style="padding:10px 12px;background:#1d1a2b;display:flex;justify-content:space-between;align-items:center;gap:8px">
        <strong style="color:#b9a6ff">RBX Grab · Phase 1</strong>
        <span style="display:flex;align-items:center;gap:6px">
          <span id="rbx-count" style="background:#332d4d;border-radius:99px;padding:2px 8px">0</span>
          <button id="rbx-min" title="Collapse" style="cursor:pointer;background:#332d4d;border:0;color:#cfc9e0;border-radius:6px;padding:1px 8px 3px;font-size:15px;line-height:1">–</button>
          <button id="rbx-close" title="Hide panel" style="cursor:pointer;background:#332d4d;border:0;color:#cfc9e0;border-radius:6px;padding:1px 8px 3px;font-size:15px;line-height:1">×</button>
        </span>
      </div>

      <div id="rbx-body">
      <div style="padding:8px 12px;background:#181527;border-bottom:1px solid #221f30">
        <div style="font-size:11px;color:#b9a6ff;margin-bottom:6px">Active grab (by universeId)</div>
        <input id="rbx-uni" placeholder="universeId(s), comma-separated"
          style="width:100%;box-sizing:border-box;background:#15131f;border:1px solid #2d2a3d;color:#e8e8ef;border-radius:6px;padding:5px 7px;margin-bottom:6px;font-size:11px"/>
        <div style="display:flex;gap:6px;margin-bottom:6px">
          <input id="rbx-start" type="date" title="start (optional)"
            style="flex:1;min-width:0;background:#15131f;border:1px solid #2d2a3d;color:#9a93b3;border-radius:6px;padding:4px 6px;font-size:11px"/>
          <input id="rbx-end" type="date" title="end (optional)"
            style="flex:1;min-width:0;background:#15131f;border:1px solid #2d2a3d;color:#9a93b3;border-radius:6px;padding:4px 6px;font-size:11px"/>
        </div>
        <button id="rbx-pull" style="width:100%;cursor:pointer;background:#7c5cff;border:0;color:#fff;border-radius:6px;padding:7px">Pull all metrics → folder + web app</button>
        <div id="rbx-active" style="font-size:11px;color:#9a93b3;min-height:14px;margin-top:6px"></div>
      </div>

      <div style="padding:8px 12px;background:#181527;border-bottom:1px solid #221f30">
        <div style="font-size:11px;color:#b9a6ff;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">
          <span>Scheduled grabs</span>
          <label style="display:flex;align-items:center;gap:4px;cursor:pointer;color:#9a93b3;font-size:11px">
            <input id="rbx-sch-on" type="checkbox" style="cursor:pointer;margin:0"/> on
          </label>
        </div>
        <input id="rbx-sch-uni" placeholder="universeId(s) to grab on a timer"
          style="width:100%;box-sizing:border-box;background:#15131f;border:1px solid #2d2a3d;color:#e8e8ef;border-radius:6px;padding:5px 7px;margin-bottom:6px;font-size:11px"/>
        <div style="display:flex;gap:6px;align-items:center">
          <span style="font-size:11px;color:#6e6885">every</span>
          <select id="rbx-sch-int" style="flex:1;min-width:0;background:#15131f;border:1px solid #2d2a3d;color:#e8e8ef;border-radius:6px;padding:4px 6px;font-size:11px">
            <option value="60">1 hour</option>
            <option value="180">3 hours</option>
            <option value="360">6 hours</option>
            <option value="720">12 hours</option>
            <option value="1440">24 hours</option>
          </select>
          <button id="rbx-sch-now" style="cursor:pointer;background:#2d2a3d;border:0;color:#cfc9e0;border-radius:6px;padding:5px 9px;font-size:11px">Run now</button>
        </div>
        <div id="rbx-sch-info" style="font-size:10px;color:#6e6885;margin-top:6px;min-height:12px"></div>
      </div>

      <div id="rbx-list" style="max-height:120px;overflow:auto;padding:6px 12px;font-size:11px;color:#9a93b3"></div>
      <div id="rbx-status" style="padding:0 12px 6px;font-size:11px;color:#9a93b3;min-height:14px"></div>
      <div style="display:flex;gap:6px;padding:8px 12px;background:#1d1a2b">
        <button id="rbx-send" style="flex:1;cursor:pointer;background:#2d2a3d;border:0;color:#cfc9e0;border-radius:6px;padding:7px">Send captured</button>
        <button id="rbx-save" style="cursor:pointer;background:#2d2a3d;border:0;color:#cfc9e0;border-radius:6px;padding:7px 10px" title="Save to data/raw folder">⤓</button>
        <button id="rbx-clr"  style="cursor:pointer;background:#2d2a3d;border:0;color:#cfc9e0;border-radius:6px;padding:7px 10px" title="Clear">×</button>
      </div>
      <div style="padding:6px 12px 10px;background:#1d1a2b;font-size:10px;color:#6e6885">
        ingest: <a id="rbx-cfg" href="#" style="color:#9a93b3;text-decoration:underline">change…</a>
        · folder: <a id="rbx-dir" href="#" style="color:#9a93b3;text-decoration:underline">change…</a>
      </div>
      </div>`;
    document.documentElement.appendChild(panel);

    // A little launcher pill so a hidden panel is always recoverable without
    // reloading the tab. Shown only while the panel is fully closed.
    launcher = document.createElement("button");
    launcher.id = "rbx-launch";
    launcher.textContent = "RBX Grab";
    launcher.style.cssText = [
      "position:fixed", "bottom:16px", "right:16px", "z-index:2147483647", "display:none",
      "cursor:pointer", "background:#7c5cff", "border:0", "color:#fff", "border-radius:99px",
      "padding:8px 14px", "font:12px system-ui,-apple-system,sans-serif",
      "box-shadow:0 8px 30px rgba(0,0,0,.5)"
    ].join(";");
    launcher.onclick = () => setUiState("open");
    document.documentElement.appendChild(launcher);
    countEl  = panel.querySelector("#rbx-count");
    listEl   = panel.querySelector("#rbx-list");
    statusEl = panel.querySelector("#rbx-status");
    activeEl = panel.querySelector("#rbx-active");
    uniInput = panel.querySelector("#rbx-uni");
    startInput = panel.querySelector("#rbx-start");
    endInput = panel.querySelector("#rbx-end");
    uniInput.value = guessUniverse();
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
    // Wrapped, not passed directly: onclick hands the listener a MouseEvent,
    // which would arrive as runActiveGrab's options object.
    panel.querySelector("#rbx-pull").onclick = () => runActiveGrab();
    panel.querySelector("#rbx-send").onclick = send;
    panel.querySelector("#rbx-save").onclick = () => saveToFolder(captures, guessUniverse(), true);
    panel.querySelector("#rbx-clr").onclick  = () => { captures.length = 0; setStatus(""); render(); };
    panel.querySelector("#rbx-cfg").onclick  = async (e) => {
      e.preventDefault();
      const next = prompt("Ingest URL:", await getIngestUrl());
      if (next) { await setIngestUrl(next); setStatus("ingest URL saved"); }
    };
    panel.querySelector("#rbx-dir").onclick  = async (e) => {
      e.preventDefault();
      const next = prompt("Save folder (relative to your Downloads directory):", await getDownloadDir());
      if (next) {
        try { await chrome.storage.local.set({ [DOWNLOAD_DIR_KEY]: next }); setStatus("folder saved"); } catch {}
      }
    };

    // ---- scheduled grabs ------------------------------------------------
    // The config lives in the service worker's storage, not here: this content
    // script dies on every navigation, and a schedule that forgets itself when
    // you click a link is not a schedule.
    const schOn = panel.querySelector("#rbx-sch-on");
    const schUni = panel.querySelector("#rbx-sch-uni");
    const schInt = panel.querySelector("#rbx-sch-int");
    const schInfo = panel.querySelector("#rbx-sch-info");

    const fmtMins = (m) => (m >= 60 ? `${Math.round(m / 60)}h` : `${m}m`);

    function describeSchedule(cfg) {
      if (!cfg || cfg.error) return cfg && cfg.error ? `scheduler unreachable: ${cfg.error}` : "";
      const ids = String(cfg.universes || "").split(/[\s,]+/).filter((x) => /^\d+$/.test(x));
      const bits = [];
      if (!cfg.enabled) bits.push("off");
      else if (!ids.length) bits.push("on, but no universeId set — nothing will fire");
      else bits.push(`on · ${ids.length} universe(s) · every ${fmtMins(Number(cfg.everyMinutes) || 360)}`);
      if (cfg.lastRunAt) bits.push(`last ${new Date(cfg.lastRunAt).toLocaleString()}`);
      if (cfg.lastResult) bits.push(cfg.lastResult);
      return bits.join(" · ");
    }

    async function loadSchedule() {
      const cfg = await bg({ type: "schedule:get" }, 15000);
      if (!cfg || cfg.error) { schInfo.textContent = describeSchedule(cfg); return; }
      schOn.checked = !!cfg.enabled;
      schUni.value = cfg.universes || "";
      schInt.value = String(Number(cfg.everyMinutes) || 360);
      schInfo.textContent = describeSchedule(cfg);
    }

    async function saveSchedule() {
      const cfg = await bg({ type: "schedule:set", patch: {
        enabled: schOn.checked,
        universes: schUni.value,
        everyMinutes: Number(schInt.value) || 360,
      } }, 15000);
      schInfo.textContent = describeSchedule(cfg);
    }

    schOn.onchange = saveSchedule;
    schInt.onchange = saveSchedule;
    schUni.onchange = saveSchedule;
    panel.querySelector("#rbx-sch-now").onclick = async () => {
      schInfo.textContent = "starting…";
      const r = await bg({ type: "schedule:runNow" }, 60000);
      if (r && r.error) schInfo.textContent = `could not start: ${r.error}`;
      else setTimeout(loadSchedule, 2000);
    };
    loadSchedule();
  }

  // The scheduler lives in the service worker, which deliberately cannot reach
  // Roblox: it drives this page instead, so every request still leaves from the
  // session the browser already holds. Answer "started" straight away and report
  // the outcome separately — a full grab far outlives the message channel.
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
    const rawIds = o.universes != null ? o.universes : (uniInput.value || "");
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
    const start = toISO(o.start != null ? o.start : startInput.value);
    const end = toISO(o.end != null ? o.end : endInput.value);

    for (const u of ids) {
      setActive(`planning ${u}…`);
      const qs = `universe=${u}` + (start ? `&start=${encodeURIComponent(start)}` : "") + (end ? `&end=${encodeURIComponent(end)}` : "");
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
        const re = await webappFetch(`${base}/api/grab-plan`, { universe: u, start, end, discovered }, 30000);
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

  function render() {
    ensurePanel();
    countEl.textContent = String(captures.length);
    listEl.innerHTML = captures.slice(-15).reverse()
      .map((c) => `<div title="${c.url}" style="padding:3px 0;border-bottom:1px solid #221f30;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"><span style="color:#7c5cff">${c.via || c.method}</span> ${shortUrl(c.url)}</div>`)
      .join("") || `<div style="opacity:.5">passive captures appear here · or use Active grab above</div>`;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
