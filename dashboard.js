// Indigo LiveOps dashboard — runs as an extension page, not a web app.
//
// Split of responsibility, and it is deliberate:
//   - Roblox's PUBLIC APIs (user, groups, games, thumbnails) are called straight
//     from here. They carry no credential, so there is nothing to protect and no
//     reason to round-trip through a server.
//   - Anything needing the Open Cloud KEY or the disk (access checks, grab
//     plans, ingest, data/ writes) goes to the local web app via the background
//     service worker. The key stays on the server side and never enters
//     extension storage, so a compromised extension profile does not leak it.
//
// That is not a compromise: the extension already cannot grab without the local
// server, because the grab plan and the ingest sink both live there.

const CFG_KEY = "rbx_dash_cfg";
const INGEST_URL_KEY = "rbx_ingest_url";
const DEFAULT_INGEST = "http://localhost:3000/api/ingest";

// When framed into create.roblox.com the surrounding overlay already provides
// the close affordance and the padding, so the page trims its own chrome.
const EMBEDDED = window.top !== window.self;

const state = {
  cfg: { username: "", userId: 0, games: {} },
  user: null,
  groups: [],
  group: null,
  games: [],
  access: {},
  serverUp: false,
  hasKey: false,
  query: "",
  menuOpen: false,
  selected: null,
  loading: "",
};

/* ---------------------------------------------------------------- plumbing */

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const num = (n) => (n == null ? "—" : Number(n).toLocaleString("en-US"));

async function storageGet(key, fallback) {
  try { const s = await chrome.storage.local.get(key); return s[key] ?? fallback; } catch { return fallback; }
}
async function storageSet(key, value) {
  try { await chrome.storage.local.set({ [key]: value }); } catch { /* non-fatal */ }
}

/** Public Roblox JSON. Failures return null so a dead endpoint degrades one
 *  section instead of blanking the page. */
async function pub(url) {
  try { const r = await fetch(url); return r.ok ? await r.json() : null; } catch { return null; }
}

/** Anything privileged goes through the service worker to the local web app —
 *  a page's own fetch to localhost is subject to Private Network Access rules,
 *  the worker's is not. */
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
  // Studios first: a real account is 42 memberships and 4 studios, and role
  // does not tell them apart (both read "Member").
  rows.sort((a, b) => (Number(b.known) - Number(a.known)) || a.name.localeCompare(b.name));
  return rows;
}

async function loadGames(groupId) {
  const j = await pub(`https://games.roblox.com/v2/groups/${groupId}/games?accessFilter=All&limit=50&sortOrder=Desc`);
  const rows = (j?.data ?? []).map((x) => ({ universeId: x.id, name: x.name, playing: null, iconUrl: null }));
  if (!rows.length) return rows;
  const ids = rows.map((r) => r.universeId).join(",");
  const [icons, live] = await Promise.all([
    pub(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${ids}&size=256x256&format=Png`),
    pub(`https://games.roblox.com/v1/games?universeIds=${ids}`),
  ]);
  const im = new Map((icons?.data ?? []).filter((d) => d.state === "Completed").map((d) => [d.targetId, d.imageUrl]));
  const pm = new Map((live?.data ?? []).map((d) => [d.id, d.playing]));
  for (const r of rows) { r.iconUrl = im.get(r.universeId) ?? null; r.playing = pm.get(r.universeId) ?? null; }
  return rows.sort((a, b) => (b.playing ?? -1) - (a.playing ?? -1));
}

/** The local app knows which universes we hold data for; that is what marks a
 *  group as a studio rather than a fan group joined once. Server down => empty
 *  set => everything lands under "Other groups", which is degraded but honest. */
async function loadKnown() {
  const base = await appBase();
  const r = await bg({ type: "webapp", url: `${base}/api/rbx/groups?seedUniverses=` }, 6000);
  state.serverUp = Boolean(r?.ok);
  const ids = new Set();
  if (!state.serverUp) return ids;
  const held = r?.data?.held ?? [];
  if (held.length) {
    const g = await pub(`https://games.roblox.com/v1/games?universeIds=${held.join(",")}`);
    for (const x of g?.data ?? []) if (x.creator?.type === "Group" && x.creator.id) ids.add(x.creator.id);
  }
  const cfg = await bg({ type: "webapp", url: `${base}/api/dash/config` }, 6000);
  state.hasKey = Boolean(cfg?.data?.hasKey);
  return ids;
}

async function checkAccess(universeIds) {
  if (!state.serverUp || !state.hasKey) return {};
  const base = await appBase();
  const r = await bg({ type: "webapp", url: `${base}/api/rbx/access`, body: { universeIds } }, 180000);
  return r?.data?.access ?? {};
}

async function saveCfg() {
  await storageSet(CFG_KEY, state.cfg);
  // Mirror to the app so a scheduler outside the browser can read it too.
  if (state.serverUp) {
    const base = await appBase();
    bg({ type: "webapp", url: `${base}/api/dash/config`, method: "PUT", body: state.cfg }, 15000);
  }
}

/* ----------------------------------------------------------------- render */

function renderHeader() {
  const watched = Object.values(state.cfg.games || {}).filter((g) => g.dailyGrab || g.intervalHours || g.updateWatch).length;
  $("sub").textContent = watched ? `${watched} game${watched === 1 ? "" : "s"} under watch` : "Portfolio watch";
  $("me").innerHTML = state.user
    ? `<div class="me">${state.user.avatarUrl ? `<img src="${esc(state.user.avatarUrl)}" alt="">` : `<div class="pemb"></div>`}
         <div><b>${esc(state.user.displayName)}</b><span>@${esc(state.user.name)}</span></div></div>`
    : "";
}

function renderBanners() {
  const b = [];
  if (!state.serverUp) b.push(`<div class="banner warn">Local app not reachable. Thumbnails and groups still work; grabs, access checks and saving need it — run <b>cd web &amp;&amp; npm run dev</b>.</div>`);
  else if (!state.hasKey) b.push(`<div class="banner warn">No Open Cloud key on the server, so analytics access can’t be verified. Put one in <b>web/.opencloud-key</b>.</div>`);
  $("banners").innerHTML = b.join("");
}

function renderWelcome() {
  // Whatever is in the box wins over stored config: a re-render mid-typing must
  // never clobber what the user is entering. This is why the field appeared
  // dead -- the value was being reset from state underneath the caret.
  const typed = $("u") ? $("u").value : null;
  const initial = typed != null ? typed : (state.cfg.username || "");
  $("stage").innerHTML = `
    <div class="card rise" style="padding:28px">
      <div style="font-size:21px;font-weight:650;letter-spacing:-.2px">Welcome</div>
      <p class="muted" style="max-width:520px;margin:7px 0 0;line-height:1.6">
        Enter your Roblox username to load your groups and the experiences in them.
        This reads public profile data only — nothing is sent on your behalf.
      </p>
      <div style="display:flex;gap:9px;margin-top:19px;flex-wrap:wrap">
        <input id="u" placeholder="Roblox username" style="width:280px" autocomplete="off" spellcheck="false" value="${esc(initial)}">
        <button class="btn" id="go">Continue</button>
      </div>
      <div id="uerr" style="color:var(--down);font-size:12.5px;margin-top:9px"></div>
    </div>`;
  const go = async () => {
    const v = $("u").value.trim();
    if (!v) return;
    $("go").disabled = true; $("go").textContent = "Looking up…";
    const u = await loadUser(v);
    if (!u) { $("uerr").textContent = `No Roblox user named “${v}”.`; $("go").disabled = false; $("go").textContent = "Continue"; return; }
    state.user = u; state.cfg.username = u.name; state.cfg.userId = u.userId;
    await saveCfg();
    await boot(true);
  };
  $("go").onclick = go;
  $("u").onkeydown = (e) => e.key === "Enter" && go();
  // Focus without stealing the caret position if it was already there.
  if (typed == null) $("u").focus();
}

function groupRow(g) {
  return `<button data-gid="${g.id}">
    ${g.emblemUrl ? `<img src="${esc(g.emblemUrl)}" alt="">` : `<div class="pemb"></div>`}
    <span style="min-width:0;flex:1">
      <span class="pname" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(g.name)}</span>
      <span class="psub" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(g.role || num(g.memberCount) + " members")}</span>
    </span></button>`;
}

function renderStage() {
  const studios = state.groups.filter((g) => g.known);
  const q = state.query.trim().toLowerCase();
  const match = (g) => !q || g.name.toLowerCase().includes(q) || String(g.id).includes(q);
  const mStudios = studios.filter(match), mOthers = state.groups.filter((g) => !g.known && match(g));

  $("stage").innerHTML = `
    <div style="display:flex;gap:11px;align-items:flex-end;flex-wrap:wrap;margin-bottom:20px">
      <div>
        <div class="lbl">Group</div>
        <div class="picker">
          <button id="pk">
            ${state.group?.emblemUrl ? `<img src="${esc(state.group.emblemUrl)}" alt="">` : `<div class="pemb"></div>`}
            <span style="min-width:0;flex:1">
              <span class="pname" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${state.group ? esc(state.group.name) : "Select a group"}</span>
              <span class="psub">${state.group ? (state.group.known ? "Studio · " : "") + esc(state.group.role || num(state.group.memberCount) + " members") : `${studios.length} studios · ${state.groups.length} groups`}</span>
            </span>
            <span style="color:var(--ink-3)">▾</span>
          </button>
          ${state.menuOpen ? `<div class="menu rise" id="menu">
            <div class="menu-search"><input id="q" placeholder="Search ${state.groups.length} groups…" value="${esc(state.query)}"></div>
            <div class="menu-list">
              ${!mStudios.length && !mOthers.length ? `<div class="muted" style="padding:14px">No groups match.</div>` : ""}
              ${mStudios.length ? `<div class="sect">Your studios</div>${mStudios.map(groupRow).join("")}` : ""}
              ${mOthers.length ? `<div class="sect">Other groups · ${mOthers.length}</div>${mOthers.map(groupRow).join("")}` : ""}
            </div></div>` : ""}
        </div>
      </div>
      <button class="btn-ghost" id="switch">Switch user</button>
    </div>
    ${state.loading === "games" ? `<div class="muted"><i class="spin"></i>Loading experiences…</div>` : ""}
    ${!state.group && state.loading !== "games" ? `<div class="card" style="padding:24px" class="muted"><span class="muted">Pick a group to see its experiences.</span></div>` : ""}
    ${state.group && state.loading !== "games" && !state.games.length ? `<div class="card" style="padding:24px"><span class="muted">No experiences in ${esc(state.group.name)}.</span></div>` : ""}
    ${state.games.length ? `<div class="grid">${state.games.map(gameCard).join("")}</div>` : ""}`;

  $("pk").onclick = () => { state.menuOpen = !state.menuOpen; state.query = ""; renderStage(); };
  $("switch").onclick = async () => { state.user = null; state.group = null; state.games = []; renderHeader(); renderWelcome(); };
  const qEl = $("q");
  if (qEl) {
    qEl.focus();
    qEl.oninput = (e) => { state.query = e.target.value; const c = e.target.selectionStart; renderStage(); const n = $("q"); if (n) { n.focus(); n.setSelectionRange(c, c); } };
  }
  document.querySelectorAll("#menu button[data-gid]").forEach((b) => {
    b.onclick = async () => {
      state.group = state.groups.find((g) => String(g.id) === b.dataset.gid) || null;
      state.menuOpen = false; state.query = ""; state.games = []; state.access = {};
      state.loading = "games"; renderStage();
      state.games = state.group ? await loadGames(state.group.id) : [];
      state.loading = ""; renderStage();
      if (state.games.length) {
        state.access = Object.fromEntries(state.games.map((g) => [String(g.universeId), "checking"]));
        renderStage();
        state.access = await checkAccess(state.games.map((g) => g.universeId));
        renderStage();
      }
    };
  });
  document.querySelectorAll(".game[data-uid]").forEach((el) => {
    el.onclick = () => { state.selected = state.games.find((g) => String(g.universeId) === el.dataset.uid); renderModal(); };
  });
}

function gameCard(g) {
  const a = state.access[String(g.universeId)] ?? (state.hasKey ? "" : "idle");
  const pill = { ok: ["ok", "Access"], denied: ["denied", "No access"], error: ["error", "Check failed"], checking: ["idle", "Checking…"], idle: ["idle", "No key"], "": ["idle", "—"] }[a] || ["idle", "—"];
  const cfg = state.cfg.games?.[String(g.universeId)] || {};
  const on = cfg.dailyGrab || cfg.intervalHours || cfg.updateWatch;
  return `<button class="game rise" data-uid="${g.universeId}">
    ${g.iconUrl ? `<img class="thumb" src="${esc(g.iconUrl)}" alt="">` : `<div class="thumb"></div>`}
    <div class="meta">
      <div class="nm">${esc(g.name)}</div>
      <div class="row">
        <span class="live">${g.playing ? `<i class="dot"></i>${num(g.playing)} playing` : num(g.playing) + " playing"}</span>
        <span class="pill ${pill[0]}">${on ? "Watching" : pill[1]}</span>
      </div>
    </div></button>`;
}

function renderModal() {
  const g = state.selected;
  if (!g) { $("modal-root").innerHTML = ""; return; }
  const key = String(g.universeId);
  const c = state.cfg.games?.[key] || {};
  const opt = (id, on, title, hint) => `<button class="opt ${on ? "on" : ""}" data-opt="${id}"><span class="sw"><i></i></span><span><b>${title}</b><span>${hint}</span></span></button>`;
  $("modal-root").innerHTML = `<div class="scrim" id="scrim"><div class="modal rise" id="modal">
    <div style="display:flex;gap:13px;align-items:flex-start">
      ${g.iconUrl ? `<img src="${esc(g.iconUrl)}" style="width:56px;height:56px;border-radius:13px;object-fit:cover">` : ""}
      <div style="flex:1;min-width:0">
        <div style="font-size:16.5px;font-weight:650">${esc(g.name)}</div>
        <div class="muted tnum" style="margin-top:2px">Universe ${g.universeId}${g.playing != null ? ` · ${num(g.playing)} playing` : ""}</div>
      </div>
      <button class="btn-ghost" id="x" style="padding:5px 11px">✕</button>
    </div>
    <div style="margin-top:22px">
      <div class="lbl">Collection</div>
      ${opt("dailyGrab", !!c.dailyGrab, "Daily grab", "One full pull a day. The cheapest thing that keeps history.")}
      <div style="background:var(--surface-2);border-radius:10px;padding:13px;margin-bottom:9px">
        <b style="font-size:13.5px">Repeat grab</b>
        <span style="display:block;font-size:11.5px;color:var(--ink-2);margin-top:2px">Tighter cadence around a publish — sub-daily metrics only hold ~24h.</span>
        <div class="chips">${[["off", null], ["1h", 1], ["3h", 3], ["6h", 6], ["12h", 12], ["24h", 24]].map(([l, v]) =>
          `<button class="chip ${(c.intervalHours ?? null) === v ? "on" : ""}" data-int="${v ?? ""}">${l}</button>`).join("")}</div>
      </div>
      <div class="lbl" style="margin-top:18px">Analysis</div>
      ${opt("liveopsDiagnosis", !!c.liveopsDiagnosis, "LiveOps diagnosis", "Run the ladder when something moves; score each day against its own weekday baseline.")}
      ${opt("updateWatch", !!c.updateWatch, "Update watch", "Tighten cadence around a publish and report what changed.")}
      <div class="lbl" style="margin-top:18px">Discord</div>
      <div style="background:var(--surface-2);border-radius:10px;padding:13px">
        <input id="hook" placeholder="https://discord.com/api/webhooks/…" style="width:100%" value="${esc(c.discordWebhook || "")}">
        <div class="muted" style="margin-top:9px;font-size:11.5px;line-height:1.5">Stored, not sent yet — so alerting can be switched on later without revisiting every game.</div>
      </div>
    </div>
    <div class="lbl" style="margin-top:18px">Run now</div>
    <div style="background:var(--surface-2);border-radius:10px;padding:13px">
      <div style="display:flex;gap:9px;align-items:center;flex-wrap:wrap">
        <button class="btn" id="grab" ${state.serverUp ? "" : "disabled"}>Grab this game</button>
        <span class="muted" id="grabmsg" style="font-size:12px">${state.serverUp ? "Pulls every metric for this universe." : "Needs the local app running."}</span>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:22px">
      <span class="muted" style="font-size:11.5px">${state.serverUp ? "Saved to extension + data/dashboard-config.json" : "Saved locally — app offline"}</span>
      <button class="btn" id="done">Done</button>
    </div>
  </div></div>`;

  const patch = async (p) => {
    state.cfg.games = state.cfg.games || {};
    state.cfg.games[key] = { ...(state.cfg.games[key] || {}), ...p };
    await saveCfg(); renderHeader(); renderModal(); renderStage();
  };
  $("scrim").onclick = (e) => { if (e.target.id === "scrim") { state.selected = null; renderModal(); } };
  $("x").onclick = $("done").onclick = () => { state.selected = null; renderModal(); renderStage(); };
  document.querySelectorAll("[data-opt]").forEach((b) => { b.onclick = () => patch({ [b.dataset.opt]: !c[b.dataset.opt] }); });
  document.querySelectorAll("[data-int]").forEach((b) => { b.onclick = () => patch({ intervalHours: b.dataset.int === "" ? null : Number(b.dataset.int) }); });
  $("hook").onchange = (e) => patch({ discordWebhook: e.target.value.trim() });

  const grabBtn = $("grab");
  if (grabBtn) grabBtn.onclick = async () => {
    grabBtn.disabled = true; grabBtn.textContent = "Starting…";
    const r = await bg({ type: "grab:now", universes: key }, 120000);
    const msgEl = $("grabmsg");
    if (r && r.ok) {
      grabBtn.textContent = "Running";
      if (msgEl) msgEl.textContent = "Grab running in a create.roblox.com tab — watch the panel there for progress.";
      // Poll the worker's own record rather than guessing when it finished.
      const tick = setInterval(async () => {
        const st = await bg({ type: "grab:status" }, 15000);
        if (st && st.running === false && st.lastResult) {
          clearInterval(tick);
          grabBtn.disabled = false; grabBtn.textContent = "Grab this game";
          if (msgEl) msgEl.textContent = String(st.lastResult).slice(0, 160);
        }
      }, 4000);
    } else {
      grabBtn.disabled = false; grabBtn.textContent = "Grab this game";
      if (msgEl) msgEl.textContent = (r && (r.error || r.msg)) || "could not start";
    }
  };
}

/* ------------------------------------------------------------------- boot */

async function boot(afterIdentify) {
  if (!afterIdentify) state.cfg = await storageGet(CFG_KEY, { username: "", userId: 0, games: {} });
  state.cfg.games = state.cfg.games || {};
  renderHeader();

  // Paint something usable BEFORE any network work. loadKnown() talks to the
  // local app through the service worker and can sit for its full timeout when
  // that app is down; doing it first left #stage empty and the username field
  // simply did not exist yet.
  if (!state.user && !state.cfg.username) renderWelcome();

  const known = await loadKnown();
  renderBanners();

  if (!state.user && state.cfg.username) {
    state.user = await loadUser(state.cfg.username);
    // A stored username that no longer resolves must fall back to the form
    // rather than leaving a blank page.
    if (!state.user) { renderHeader(); renderWelcome(); return; }
  }
  renderHeader();

  if (!state.user) { renderWelcome(); return; }
  state.groups = await loadGroups(state.user.userId, known);
  renderStage();
}

document.addEventListener("click", (e) => {
  if (state.menuOpen && !e.target.closest(".picker")) { state.menuOpen = false; renderStage(); }
}, true);

if (EMBEDDED) document.documentElement.classList.add("embedded");
boot();
