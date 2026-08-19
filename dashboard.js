// Indigo LiveOps dashboard — an extension page, embedded into create.roblox.com
// by collector.js or opened standalone from the toolbar icon.
//
// Where each call goes is deliberate:
//   - Roblox's PUBLIC APIs (user, groups, games, thumbnails) are called straight
//     from here. No credential, so nothing to protect and no reason to proxy.
//   - Anything needing the Open Cloud KEY or the disk (metric summaries, access
//     checks, grabs, data/ writes) goes through the service worker to the local
//     app. The key never enters extension storage.
//
// EVERY entry point is wrapped so a thrown error paints a visible banner instead
// of leaving a page that renders but does not respond. A dead-looking input with
// a silent console error cost an afternoon; it must not be possible again.

const CFG_KEY = "rbx_dash_cfg";
const INGEST_URL_KEY = "rbx_ingest_url";
const DEFAULT_INGEST = "http://localhost:3000/api/ingest";
const EMBEDDED = window.top !== window.self;

const state = {
  cfg: { username: "", userId: 0, games: {} },
  user: null, groups: [], group: null, games: [], access: {},
  serverUp: false, hasKey: false, query: "", menuOpen: false, selected: null, loading: "",
};

/* ---------------------------------------------------------------- plumbing */

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const num = (n) => (n == null ? "—" : Number(n).toLocaleString("en-US"));

/** Nothing fails silently. */
function fail(where, e) {
  const msg = `${where}: ${(e && (e.stack || e.message)) || e}`;
  console.error("[LiveOps]", msg);
  const el = $("err");
  if (el) el.innerHTML = `<div class="banner err">Something broke — ${esc(msg)}</div>`;
}
const guard = (where, fn) => async (...a) => { try { return await fn(...a); } catch (e) { fail(where, e); } };

async function storageGet(key, fallback) {
  try { const s = await chrome.storage.local.get(key); return s[key] ?? fallback; } catch { return fallback; }
}
async function storageSet(key, value) {
  try { await chrome.storage.local.set({ [key]: value }); } catch { /* non-fatal */ }
}
async function pub(url) {
  try { const r = await fetch(url); return r.ok ? await r.json() : null; } catch { return null; }
}

/** Privileged work goes via the service worker: a page fetch to localhost is
 *  subject to Private Network Access rules, the worker's is not. */
function bg(message, timeoutMs = 60000) {
  return new Promise((resolve) => {
    let done = false;
    const t = setTimeout(() => { if (!done) { done = true; resolve({ ok: false, error: "timeout" }); } }, timeoutMs);
    try {
      chrome.runtime.sendMessage(message, (resp) => {
        if (done) return;
        done = true; clearTimeout(t);
        resolve(chrome.runtime.lastError ? { ok: false, error: chrome.runtime.lastError.message } : (resp || { ok: false, error: "no response" }));
      });
    } catch (e) { if (!done) { done = true; clearTimeout(t); resolve({ ok: false, error: String(e) }); } }
  });
}
async function appBase() {
  const ingest = await storageGet(INGEST_URL_KEY, DEFAULT_INGEST);
  return String(ingest).replace(/\/api\/ingest\/?$/, "");
}

/* ------------------------------------------------------------------- data */

async function loadUser(username) {
  const r = await fetch("https://users.roblox.com/v1/usernames/users", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }),
  }).then((x) => (x.ok ? x.json() : null)).catch(() => null);
  const u = r?.data?.[0];
  if (!u) return null;
  const t = await pub(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${u.id}&size=150x150&format=Png`);
  return { userId: u.id, name: u.name, displayName: u.displayName || u.name, avatarUrl: t?.data?.[0]?.imageUrl ?? null };
}

async function loadGroups(userId, knownIds) {
  const j = await pub(`https://groups.roblox.com/v1/users/${userId}/groups/roles`);
  const rows = (j?.data ?? []).map((x) => ({
    id: x.group.id, name: x.group.name, role: x.role?.name ?? "",
    memberCount: x.group.memberCount ?? 0, emblemUrl: null, known: knownIds.has(x.group.id),
  }));
  if (rows.length) {
    const t = await pub(`https://thumbnails.roblox.com/v1/groups/icons?groupIds=${rows.map((r) => r.id).join(",")}&size=150x150&format=Png`);
    const m = new Map((t?.data ?? []).filter((d) => d.state === "Completed").map((d) => [d.targetId, d.imageUrl]));
    for (const r of rows) r.emblemUrl = m.get(r.id) ?? null;
  }
  // Studios first. A real account is 42 memberships and 4 studios, and role does
  // not separate them — both read "Member".
  rows.sort((a, b) => (Number(b.known) - Number(a.known)) || a.name.localeCompare(b.name));
  return rows;
}

async function loadGames(groupId) {
  const j = await pub(`https://games.roblox.com/v2/groups/${groupId}/games?accessFilter=All&limit=50&sortOrder=Desc`);
  const rows = (j?.data ?? []).map((x) => ({ universeId: x.id, name: x.name, iconUrl: null }));
  if (!rows.length) return rows;
  // Icons only. The live-player count was dropped with the metric cards: this
  // tool exists to grab, schedule and analyse, not to restate numbers Roblox
  // already shows on the page next to it.
  const ids = rows.map((r) => r.universeId).join(",");
  const icons = await pub(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${ids}&size=512x512&format=Png`);
  const im = new Map((icons?.data ?? []).filter((d) => d.state === "Completed").map((d) => [d.targetId, d.imageUrl]));
  for (const r of rows) r.iconUrl = im.get(r.universeId) ?? null;
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

async function loadKnown() {
  const base = await appBase();
  const r = await bg({ type: "webapp", url: `${base}/api/rbx/groups?seedUniverses=` }, 6000);
  state.serverUp = Boolean(r && r.ok);
  const ids = new Set();
  if (!state.serverUp) return ids;
  const held = (r.data && r.data.held) || [];
  if (held.length) {
    const g = await pub(`https://games.roblox.com/v1/games?universeIds=${held.join(",")}`);
    for (const x of (g && g.data) || []) if (x.creator && x.creator.type === "Group" && x.creator.id) ids.add(x.creator.id);
  }
  const cfg = await bg({ type: "webapp", url: `${base}/api/dash/config` }, 6000);
  state.hasKey = Boolean(cfg && cfg.data && cfg.data.hasKey);
  return ids;
}

async function checkAccess(universeIds) {
  if (!state.serverUp || !state.hasKey) return {};
  const base = await appBase();
  const r = await bg({ type: "webapp", url: `${base}/api/rbx/access`, body: { universeIds } }, 180000);
  return (r && r.data && r.data.access) || {};
}

async function saveCfg() {
  await storageSet(CFG_KEY, state.cfg);
  if (state.serverUp) {
    const base = await appBase();
    bg({ type: "webapp", url: `${base}/api/dash/config`, method: "PUT", body: state.cfg }, 15000);
  }
}

/* ----------------------------------------------------------------- render */

function renderRail() {
  const studios = state.groups.filter((g) => g.known);
  const q = state.query.trim().toLowerCase();
  const match = (g) => !q || g.name.toLowerCase().includes(q) || String(g.id).includes(q);
  const mS = studios.filter(match), mO = state.groups.filter((g) => !g.known && match(g));
  const row = (g) => `<button data-gid="${g.id}">
      ${g.emblemUrl ? `<img src="${esc(g.emblemUrl)}" alt="">` : `<div class="emb"></div>`}
      <span style="min-width:0;flex:1">
        <span class="nm" style="display:block">${esc(g.name)}</span>
        <span style="display:block;font-size:11px;color:var(--ink-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(g.role || num(g.memberCount) + " members")}</span>
      </span></button>`;

  $("gsw").innerHTML = `
    <button id="gswbtn">
      ${state.group && state.group.emblemUrl ? `<img src="${esc(state.group.emblemUrl)}" alt="">` : `<div class="emb"></div>`}
      <span class="nm" style="flex:1;min-width:0">${state.group ? esc(state.group.name) : "Select group"}</span>
      <span class="caret">▾</span>
    </button>
    ${state.menuOpen ? `<div class="menu rise">
      <div class="menu-search"><input id="q" placeholder="Search ${state.groups.length} groups…" value="${esc(state.query)}"></div>
      <div class="menu-list">
        ${!mS.length && !mO.length ? `<div class="muted" style="padding:12px">No match.</div>` : ""}
        ${mS.length ? `<div class="sect">Your studios</div>${mS.map(row).join("")}` : ""}
        ${mO.length ? `<div class="sect">Other groups · ${mO.length}</div>${mO.map(row).join("")}` : ""}
      </div></div>` : ""}`;

  // No Analytics/Updates/Settings tabs: they were decoration that did nothing,
  // and a control that does not work is worse than one that is absent.

  $("foot").innerHTML = state.user
    ? `<div class="me">${state.user.avatarUrl ? `<img src="${esc(state.user.avatarUrl)}" alt="">` : `<div class="emb" style="border-radius:99px"></div>`}
        <div style="min-width:0"><b>${esc(state.user.displayName)}</b><span>@${esc(state.user.name)}</span></div></div>
       <button class="btn-ghost" id="switch" style="width:100%;margin-top:10px;font-size:12px;padding:7px">Switch user</button>`
    : "";

  const b = $("gswbtn");
  if (b) b.onclick = (e) => { e.stopPropagation(); state.menuOpen = !state.menuOpen; state.query = ""; renderRail(); };
  const qEl = $("q");
  if (qEl) {
    qEl.focus();
    qEl.oninput = (e) => { const c = e.target.selectionStart; state.query = e.target.value; renderRail(); const n = $("q"); if (n) { n.focus(); n.setSelectionRange(c, c); } };
  }
  document.querySelectorAll(".menu button[data-gid]").forEach((el) => { el.onclick = () => pickGroup(el.dataset.gid); });
  const sw = $("switch");
  if (sw) sw.onclick = () => { state.user = null; state.group = null; state.games = []; renderRail(); renderWelcome(); };
}

function renderBanners() {
  const b = [];
  if (!state.serverUp) b.push(`<div class="banner warn">Local app not reachable — groups and thumbnails still work, but metrics, access checks and grabs need it. Run <b>cd web &amp;&amp; npm run dev</b>.</div>`);
  else if (!state.hasKey) b.push(`<div class="banner warn">No Open Cloud key on the server, so metrics and access can’t be read. Put one in <b>web/.opencloud-key</b>.</div>`);
  $("banners").innerHTML = b.join("");
}

function renderWelcome() {
  $("title").textContent = "Welcome";
  $("subtitle").textContent = "";
  const typed = $("u") ? $("u").value : null;      // never clobber live typing
  const initial = typed != null ? typed : (state.cfg.username || "");
  $("stage").innerHTML = `
    <div class="card rise" style="padding:26px;max-width:620px">
      <p class="muted" style="margin:0 0 18px;line-height:1.6;font-size:13.5px">
        Enter your Roblox username to load your groups and the experiences in them.
        This reads public profile data only — nothing is sent on your behalf.
      </p>
      <div style="display:flex;gap:9px;flex-wrap:wrap">
        <input id="u" placeholder="Roblox username" style="width:270px" autocomplete="off" spellcheck="false" value="${esc(initial)}">
        <button class="btn" id="go">Continue</button>
      </div>
      <div id="uerr" style="color:var(--down);font-size:12.5px;margin-top:10px"></div>
    </div>`;

  const go = guard("identify", async () => {
    const v = $("u").value.trim();
    if (!v) { $("uerr").textContent = "Type a username first."; return; }
    $("go").disabled = true; $("go").textContent = "Looking up…";
    const u = await loadUser(v);
    if (!u) {
      $("uerr").textContent = `No Roblox user named "${v}".`;
      $("go").disabled = false; $("go").textContent = "Continue";
      return;
    }
    state.user = u; state.cfg.username = u.name; state.cfg.userId = u.userId;
    await saveCfg();
    await boot(true);
  });
  $("go").onclick = go;
  $("u").onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); go(); } };
  if (typed == null) $("u").focus();
}

function gameCard(g) {
  const id = String(g.universeId);
  const a = state.access[id];
  const cfg = (state.cfg.games || {})[id] || {};
  const watching = cfg.dailyGrab || cfg.intervalHours || cfg.updateWatch;
  // One marker, not a metrics panel: Roblox's own dashboard already shows the
  // numbers, and fetching them here cost a request per metric per game and made
  // the page crawl. All this needs to say is "can I reach this one".
  const mark = watching ? ["watch", "Watching"]
    : ({ ok: ["ok", "Access"], denied: ["denied", "No access"], error: ["warn", "Error"], checking: ["idle", "…"] }[a] || ["idle", ""]);
  return `<button class="gcard rise" data-uid="${id}" title="${esc(g.name)}">
    <span class="gthumb">${g.iconUrl ? `<img src="${esc(g.iconUrl)}" alt="" loading="lazy">` : ""}
      ${mark[1] ? `<span class="pill ${mark[0]}">${mark[1]}</span>` : ""}
    </span>
    <span class="gname">${esc(g.name)}</span>
  </button>`;
}

function renderStage() {
  if (!state.user) return renderWelcome();
  $("title").textContent = state.group ? state.group.name : "Experiences";
  $("subtitle").textContent = state.group
    ? `${state.games.length} experience${state.games.length === 1 ? "" : "s"}${state.group.known ? " · studio" : ""}`
    : `${state.groups.filter((g) => g.known).length} studios · ${state.groups.length} groups`;

  $("stage").innerHTML =
    state.loading === "games" ? `<div class="muted"><i class="spin"></i>Loading experiences…</div>`
    : !state.group ? `<div class="card" style="padding:22px"><span class="muted">Pick a group from the switcher to see its experiences.</span></div>`
    : !state.games.length ? `<div class="card" style="padding:22px"><span class="muted">No experiences in ${esc(state.group.name)}.</span></div>`
    : `<div class="grid">${state.games.map(gameCard).join("")}</div>`;

  document.querySelectorAll(".gcard[data-uid]").forEach((el) => {
    el.onclick = () => { state.selected = state.games.find((g) => String(g.universeId) === el.dataset.uid); renderModal(); };
  });
}

const pickGroup = guard("pickGroup", async (gid) => {
  state.group = state.groups.find((g) => String(g.id) === String(gid)) || null;
  state.menuOpen = false; state.query = ""; state.games = []; state.access = {};
  state.loading = "games"; renderRail(); renderStage();
  state.games = state.group ? await loadGames(state.group.id) : [];
  state.loading = ""; renderStage();
  if (!state.games.length) return;
  state.access = Object.fromEntries(state.games.map((g) => [String(g.universeId), "checking"]));
  renderStage();
  checkAccess(state.games.map((g) => g.universeId)).then((a) => { state.access = a; renderStage(); });
});

function renderModal() {
  const g = state.selected;
  if (!g) { $("modal-root").innerHTML = ""; return; }
  const key = String(g.universeId);
  const c = (state.cfg.games || {})[key] || {};
  const opt = (id, on, t, h) => `<button class="opt ${on ? "on" : ""}" data-opt="${id}"><span class="sw"><i></i></span><span><b>${t}</b><span>${h}</span></span></button>`;
  $("modal-root").innerHTML = `<div class="scrim" id="scrim"><div class="modal rise">
    <div style="display:flex;gap:13px;align-items:flex-start">
      ${g.iconUrl ? `<img src="${esc(g.iconUrl)}" style="width:54px;height:54px;border-radius:12px;object-fit:cover">` : ""}
      <div style="flex:1;min-width:0">
        <div style="font-size:16.5px;font-weight:650">${esc(g.name)}</div>
        <div class="muted tnum" style="margin-top:2px">Universe ${g.universeId}</div>
      </div>
      <button class="btn-ghost" id="x" style="padding:5px 11px">✕</button>
    </div>
    <div style="margin-top:20px">
      <div class="lbl">Collection</div>
      ${opt("dailyGrab", !!c.dailyGrab, "Daily grab", "One full pull a day. The cheapest thing that keeps history.")}
      <div style="background:var(--surface-2);border-radius:10px;padding:13px;margin-bottom:9px">
        <b style="font-size:13.5px">Repeat grab</b>
        <span style="display:block;font-size:11.5px;color:var(--ink-2);margin-top:2px">Tighter cadence around a publish — sub-daily metrics only hold ~24h.</span>
        <div class="chips">${[["off", null], ["1h", 1], ["3h", 3], ["6h", 6], ["12h", 12], ["24h", 24]]
          .map((p) => `<button class="chip ${(c.intervalHours ?? null) === p[1] ? "on" : ""}" data-int="${p[1] == null ? "" : p[1]}">${p[0]}</button>`).join("")}</div>
      </div>
      <div class="lbl" style="margin-top:17px">Analysis</div>
      ${opt("liveopsDiagnosis", !!c.liveopsDiagnosis, "LiveOps diagnosis", "Run the ladder when something moves; score each day against its own weekday baseline.")}
      ${opt("updateWatch", !!c.updateWatch, "Update watch", "Tighten cadence around a publish and report what changed.")}
      <div class="lbl" style="margin-top:17px">Discord</div>
      <div style="background:var(--surface-2);border-radius:10px;padding:13px">
        <input id="hook" placeholder="https://discord.com/api/webhooks/…" value="${esc(c.discordWebhook || "")}">
        <div class="muted" style="margin-top:9px;font-size:11.5px;line-height:1.5">Stored, not sent yet — so alerting can be switched on later without revisiting every game.</div>
      </div>
      <div class="lbl" style="margin-top:17px">Run now</div>
      <div style="background:var(--surface-2);border-radius:10px;padding:13px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <button class="btn" id="grab" ${state.serverUp ? "" : "disabled"}>Grab this game</button>
        <span class="muted" id="grabmsg" style="font-size:12px">${state.serverUp ? "Pulls every metric for this universe." : "Needs the local app running."}</span>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px">
      <span class="muted" style="font-size:11.5px">${state.serverUp ? "Saved to extension + data/dashboard-config.json" : "Saved locally — app offline"}</span>
      <button class="btn" id="done">Done</button>
    </div>
  </div></div>`;

  const patch = guard("saveGameConfig", async (p) => {
    state.cfg.games = state.cfg.games || {};
    state.cfg.games[key] = Object.assign({}, state.cfg.games[key] || {}, p);
    await saveCfg(); renderModal(); renderStage();
  });
  $("scrim").onclick = (e) => { if (e.target.id === "scrim") { state.selected = null; renderModal(); } };
  $("x").onclick = $("done").onclick = () => { state.selected = null; renderModal(); renderStage(); };
  document.querySelectorAll("[data-opt]").forEach((b) => { b.onclick = () => patch({ [b.dataset.opt]: !c[b.dataset.opt] }); });
  document.querySelectorAll("[data-int]").forEach((b) => { b.onclick = () => patch({ intervalHours: b.dataset.int === "" ? null : Number(b.dataset.int) }); });
  $("hook").onchange = (e) => patch({ discordWebhook: e.target.value.trim() });

  $("grab").onclick = guard("grabNow", async () => {
    const btn = $("grab"), msgEl = $("grabmsg");
    btn.disabled = true; btn.textContent = "Starting…";
    const r = await bg({ type: "grab:now", universes: key }, 120000);
    if (r && r.ok) {
      btn.textContent = "Running";
      msgEl.textContent = "Grab running in a create.roblox.com tab — watch the panel there.";
      const tick = setInterval(async () => {
        const st = await bg({ type: "grab:status" }, 15000);
        if (st && st.running === false && st.lastResult) {
          clearInterval(tick);
          btn.disabled = false; btn.textContent = "Grab this game";
          msgEl.textContent = String(st.lastResult).slice(0, 160);
        }
      }, 4000);
    } else {
      btn.disabled = false; btn.textContent = "Grab this game";
      msgEl.textContent = (r && (r.error || r.msg)) || "could not start";
    }
  });
}

/* ------------------------------------------------------------------- boot */

const boot = guard("boot", async (afterIdentify) => {
  if (!afterIdentify) state.cfg = await storageGet(CFG_KEY, { username: "", userId: 0, games: {} });
  state.cfg.games = state.cfg.games || {};

  // Paint something usable BEFORE any network work. loadKnown() reaches the
  // local app through the service worker and can sit for its whole timeout when
  // that app is down; doing it first left the page with no input to type into,
  // which read as "the field is dead".
  renderRail();
  if (!state.user && !state.cfg.username) renderWelcome();

  const known = await loadKnown();
  renderBanners();

  if (!state.user && state.cfg.username) {
    state.user = await loadUser(state.cfg.username);
    if (!state.user) { renderRail(); renderWelcome(); return; }   // stale username
  }
  if (!state.user) { renderRail(); renderWelcome(); return; }

  state.groups = await loadGroups(state.user.userId, known);
  renderRail();
  renderStage();
});

document.addEventListener("click", (e) => {
  if (state.menuOpen && !e.target.closest(".gsw")) { state.menuOpen = false; renderRail(); }
}, true);
window.addEventListener("error", (e) => fail("uncaught", e.error || e.message));
window.addEventListener("unhandledrejection", (e) => fail("promise", e.reason));

if (EMBEDDED) document.documentElement.classList.add("embedded");
boot();
