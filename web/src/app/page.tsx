"use client";

// Indigo LiveOps — portfolio dashboard.
//
// Flow: identify yourself -> pick a group -> pick a game -> choose what runs on
// it. Everything on the identity/discovery path uses Roblox's public web APIs
// (no credential); the per-game access badge is the only thing that touches the
// Open Cloud key, and that happens server-side in /api/rbx/access.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type RbxUser = { userId: number; name: string; displayName: string; avatarUrl: string | null };
type RbxGroup = { id: number; name: string; role: string; memberCount: number; emblemUrl: string | null; known?: boolean };
type RbxGame = { universeId: number; name: string; rootPlaceId: number | null; playing: number | null; iconUrl: string | null };
type GameConfig = {
  dailyGrab?: boolean; intervalHours?: number | null; liveopsDiagnosis?: boolean;
  updateWatch?: boolean; discordWebhook?: string; notes?: string;
};
type DashConfig = {
  username?: string; userId?: number;
  games: Record<string, GameConfig>;
};

const SEED_UNIVERSES = "9963622286,10030829154,9610561918";

/* ------------------------------------------------------------------ atoms */

function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-[13px]" style={{ color: "var(--rbx-ink-3)" }}>
      <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      {label}
    </div>
  );
}

function Card({ children, className = "", ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{ background: "var(--rbx-surface)", border: "1px solid var(--rbx-border)" }}
      {...rest}
    >
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--rbx-ink-3)" }}>
      {children}
    </div>
  );
}

function Toggle({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors"
      style={{ background: on ? "var(--rbx-blue-wash)" : "var(--rbx-surface-2)" }}
    >
      <span
        className="mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-all"
        style={{ background: on ? "var(--rbx-blue)" : "var(--rbx-border-strong)" }}
      >
        <span className="h-4 w-4 rounded-full bg-white transition-transform" style={{ transform: on ? "translateX(16px)" : "none" }} />
      </span>
      <span className="min-w-0">
        <span className="block text-[14px] font-medium" style={{ color: "var(--rbx-ink)" }}>{label}</span>
        {hint && <span className="mt-0.5 block text-[12px] leading-snug" style={{ color: "var(--rbx-ink-2)" }}>{hint}</span>}
      </span>
    </button>
  );
}

function AccessBadge({ state }: { state?: string }) {
  const map: Record<string, { t: string; bg: string; fg: string }> = {
    ok: { t: "Analytics access", bg: "#e7f7f0", fg: "var(--rbx-up)" },
    denied: { t: "No API access", bg: "#fdecea", fg: "var(--rbx-down)" },
    error: { t: "Check failed", bg: "var(--rbx-warn-wash)", fg: "var(--rbx-warn)" },
    nokey: { t: "No API key", bg: "var(--rbx-surface-2)", fg: "var(--rbx-ink-3)" },
    checking: { t: "Checking…", bg: "var(--rbx-surface-2)", fg: "var(--rbx-ink-3)" },
  };
  const m = map[state ?? "checking"] ?? map.checking;
  return (
    <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: m.bg, color: m.fg }}>
      {m.t}
    </span>
  );
}

/* ------------------------------------------------------------------- page */

export default function Dashboard() {
  const [cfg, setCfg] = useState<DashConfig>({ games: {} });
  const [hasKey, setHasKey] = useState(false);
  const [user, setUser] = useState<RbxUser | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [idErr, setIdErr] = useState("");
  const [busy, setBusy] = useState<"boot" | "user" | "groups" | "games" | null>("boot");

  const [groups, setGroups] = useState<RbxGroup[]>([]);
  const [seeded, setSeeded] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [group, setGroup] = useState<RbxGroup | null>(null);
  const [games, setGames] = useState<RbxGame[]>([]);
  const [access, setAccess] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<RbxGame | null>(null);
  const [groupQuery, setGroupQuery] = useState("");
  const ddRef = useRef<HTMLDivElement>(null);

  /* boot: load config, and re-identify if we already know who you are */
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/dash/config");
        const j = await r.json();
        setCfg(j.config ?? { games: {} });
        setHasKey(Boolean(j.hasKey));
        if (j.config?.username) {
          setNameInput(j.config.username);
          const u = await fetch(`/api/rbx/user?username=${encodeURIComponent(j.config.username)}`);
          if (u.ok) setUser(await u.json());
        }
      } catch { /* first run */ }
      setBusy(null);
    })();
  }, []);

  /* close the dropdown on an outside click */
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ddRef.current && !ddRef.current.contains(e.target as Node)) setGroupOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const saveConfig = useCallback(async (patch: Record<string, unknown>) => {
    const r = await fetch("/api/dash/config", {
      method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(patch),
    });
    if (r.ok) setCfg((await r.json()).config);
  }, []);

  const identify = useCallback(async (username: string) => {
    if (!username.trim()) return;
    setBusy("user"); setIdErr("");
    const r = await fetch(`/api/rbx/user?username=${encodeURIComponent(username.trim())}`);
    if (!r.ok) { setIdErr((await r.json().catch(() => ({}))).error ?? "lookup failed"); setBusy(null); return; }
    const u: RbxUser = await r.json();
    setUser(u);
    await saveConfig({ username: u.name, userId: u.userId });
    setBusy(null);
  }, [saveConfig]);

  /* groups: from the user when known, otherwise seeded from known universes */
  useEffect(() => {
    (async () => {
      setBusy("groups");
      const qs = user ? `userId=${user.userId}` : `seedUniverses=${SEED_UNIVERSES}`;
      const r = await fetch(`/api/rbx/groups?${qs}`);
      const j = await r.json().catch(() => ({ groups: [] }));
      // No manual group entry by design: group membership IS the permission
      // model. If you are not in the group you cannot reach its experiences,
      // so a hand-added group would only ever render rows you cannot use.
      setGroups(j.groups ?? []); setSeeded(Boolean(j.seeded)); setBusy(null);
    })();
  }, [user]);

  /* games for the chosen group, then a permission check per game */
  useEffect(() => {
    if (!group) { setGames([]); setAccess({}); return; }
    let cancelled = false;
    (async () => {
      setBusy("games"); setGames([]); setAccess({});
      const r = await fetch(`/api/rbx/group-games?groupId=${group.id}`);
      const j = await r.json().catch(() => ({ games: [] }));
      if (cancelled) return;
      const gs: RbxGame[] = j.games ?? [];
      setGames(gs); setBusy(null);
      if (!gs.length || !hasKey) return;
      setAccess(Object.fromEntries(gs.map((g) => [String(g.universeId), "checking"])));
      const a = await fetch("/api/rbx/access", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ universeIds: gs.map((g) => g.universeId) }),
      });
      if (cancelled) return;
      const aj = await a.json().catch(() => ({ access: {} }));
      setAccess(aj.access ?? {});
    })();
    return () => { cancelled = true; };
  }, [group, hasKey]);

  const gameCfg = useMemo<GameConfig>(
    () => (selected ? cfg.games?.[String(selected.universeId)] ?? {} : {}),
    [cfg, selected]
  );

  const patchGame = useCallback((patch: GameConfig) => {
    if (!selected) return;
    saveConfig({ gameId: String(selected.universeId), game: patch });
  }, [selected, saveConfig]);

  const watched = Object.entries(cfg.games ?? {}).filter(([, g]) => g.dailyGrab || g.intervalHours || g.updateWatch).length;

  /* ---------------------------------------------------------------- render */

  if (busy === "boot") {
    return <main className="flex min-h-screen items-center justify-center"><Spinner label="Loading…" /></main>;
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1180px] px-6 py-8">
      {/* header */}
      <header className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl text-[15px] font-bold text-white" style={{ background: "var(--rbx-blue)" }}>I</div>
          <div>
            <div className="text-[17px] font-semibold leading-tight">Indigo LiveOps</div>
            <div className="text-[12px]" style={{ color: "var(--rbx-ink-3)" }}>
              {watched > 0 ? `${watched} game${watched === 1 ? "" : "s"} under watch` : "Portfolio watch"}
            </div>
          </div>
        </div>
        {user && (
          <div className="flex items-center gap-3 rounded-full py-1 pl-1 pr-4" style={{ background: "var(--rbx-surface)", border: "1px solid var(--rbx-border)" }}>
            {user.avatarUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={user.avatarUrl} alt="" className="h-9 w-9 rounded-full" style={{ background: "var(--rbx-surface-2)" }} />
              : <div className="h-9 w-9 rounded-full" style={{ background: "var(--rbx-surface-2)" }} />}
            <div className="leading-tight">
              <div className="text-[13px] font-semibold">{user.displayName}</div>
              <div className="text-[11px]" style={{ color: "var(--rbx-ink-3)" }}>@{user.name}</div>
            </div>
          </div>
        )}
      </header>

      {/* identity */}
      {!user && (
        <Card className="rbx-rise mb-6 p-7">
          <div className="text-[22px] font-semibold tracking-tight">Welcome</div>
          <p className="mt-1 max-w-lg text-[14px] leading-relaxed" style={{ color: "var(--rbx-ink-2)" }}>
            Enter your Roblox username to load your groups and the experiences inside them.
            Nothing is sent to Roblox on your behalf — this only reads public profile data.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && identify(nameInput)}
              placeholder="Roblox username"
              className="h-11 w-72 rounded-xl px-3.5 text-[14px] outline-none"
              style={{ background: "var(--rbx-surface-2)", border: "1px solid var(--rbx-border)", color: "var(--rbx-ink)" }}
            />
            <button
              onClick={() => identify(nameInput)}
              disabled={busy === "user" || !nameInput.trim()}
              className="h-11 rounded-xl px-5 text-[14px] font-semibold text-white transition-opacity disabled:opacity-40"
              style={{ background: "var(--rbx-blue)" }}
            >
              {busy === "user" ? "Looking up…" : "Continue"}
            </button>
          </div>
          {idErr && <div className="mt-2 text-[13px]" style={{ color: "var(--rbx-down)" }}>{idErr}</div>}
          {seeded && groups.length > 0 && (
            <div className="mt-4 text-[13px]" style={{ color: "var(--rbx-ink-3)" }}>
              Meanwhile, {groups.length} group{groups.length === 1 ? "" : "s"} owning known universes are already available below.
            </div>
          )}
        </Card>
      )}

      {!hasKey && (
        <Card className="mb-6 p-4" style={{ background: "var(--rbx-warn-wash)", border: "1px solid #f0e0b8" }}>
          <div className="text-[13px]" style={{ color: "var(--rbx-warn)" }}>
            No Open Cloud key found. Games will still list, but analytics access can’t be verified.
            Put one in <code>web/.opencloud-key</code>.
          </div>
        </Card>
      )}

      {/* group picker */}
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <div ref={ddRef} className="relative">
          <Label>Group</Label>
          <button
            onClick={() => setGroupOpen((o) => !o)}
            className="flex h-12 w-80 items-center gap-3 rounded-xl px-3 text-left"
            style={{ background: "var(--rbx-surface)", border: "1px solid var(--rbx-border)" }}
          >
            {group?.emblemUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={group.emblemUrl} alt="" className="h-8 w-8 rounded-lg" />
              : <div className="h-8 w-8 rounded-lg" style={{ background: "var(--rbx-surface-2)" }} />}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-medium">{group ? group.name : "Select a group"}</span>
              <span className="block text-[11px]" style={{ color: "var(--rbx-ink-3)" }}>
                {group
                  ? (group.known ? "Studio · " : "") + (group.role || `${group.memberCount.toLocaleString()} members`)
                  : `${groups.filter((g) => g.known).length} studios · ${groups.length} groups`}
              </span>
            </span>
            <span style={{ color: "var(--rbx-ink-3)" }}>▾</span>
          </button>

          {groupOpen && (
            <Card className="rbx-rise absolute z-30 mt-2 w-[22rem] overflow-hidden p-0 shadow-xl">
              <div className="p-2" style={{ borderBottom: "1px solid var(--rbx-border)" }}>
                <input
                  autoFocus
                  value={groupQuery}
                  onChange={(e) => setGroupQuery(e.target.value)}
                  placeholder={`Search ${groups.length} groups…`}
                  className="h-9 w-full rounded-lg px-3 text-[13px] outline-none"
                  style={{ background: "var(--rbx-surface-2)", border: "1px solid var(--rbx-border)" }}
                />
              </div>
              <div className="max-h-[320px] overflow-auto p-1.5">
                {(() => {
                  const q = groupQuery.trim().toLowerCase();
                  const match = (g: RbxGroup) => !q || g.name.toLowerCase().includes(q) || String(g.id).includes(q);
                  const studios = groups.filter((g) => g.known && match(g));
                  const others = groups.filter((g) => !g.known && match(g));
                  const row = (g: RbxGroup) => (
                    <button
                      key={g.id}
                      onClick={() => { setGroup(g); setGroupOpen(false); setGroupQuery(""); setSelected(null); }}
                      className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-[var(--rbx-surface-2)]"
                    >
                      {g.emblemUrl
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={g.emblemUrl} alt="" className="h-8 w-8 shrink-0 rounded-lg" />
                        : <div className="h-8 w-8 shrink-0 rounded-lg" style={{ background: "var(--rbx-surface-2)" }} />}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium">{g.name}</span>
                        <span className="block truncate text-[11px]" style={{ color: "var(--rbx-ink-3)" }}>
                          {g.role || `${g.memberCount.toLocaleString()} members`}
                        </span>
                      </span>
                    </button>
                  );
                  if (!studios.length && !others.length) {
                    return <div className="p-3 text-[13px]" style={{ color: "var(--rbx-ink-3)" }}>No groups match “{groupQuery}”.</div>;
                  }
                  return (
                    <>
                      {studios.length > 0 && (
                        <>
                          <div className="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--rbx-ink-3)" }}>
                            Your studios
                          </div>
                          {studios.map(row)}
                        </>
                      )}
                      {others.length > 0 && (
                        <>
                          <div className="mt-1 px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--rbx-ink-3)", borderTop: studios.length ? "1px solid var(--rbx-border)" : undefined }}>
                            Other groups · {others.length}
                          </div>
                          {others.map(row)}
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            </Card>
          )}
        </div>

        {user && (
          <button
            onClick={() => { setUser(null); setGroup(null); setNameInput(cfg.username ?? ""); }}
            className="h-12 rounded-xl px-4 text-[13px] font-medium"
            style={{ background: "var(--rbx-surface)", border: "1px solid var(--rbx-border)", color: "var(--rbx-ink-2)" }}
          >Switch user</button>
        )}
      </div>

      {/* games */}
      {busy === "games" && <Spinner label="Loading experiences…" />}
      {group && busy !== "games" && games.length === 0 && (
        <Card className="p-6 text-[14px]" style={{ color: "var(--rbx-ink-2)" }}>
          No experiences found in {group.name}.
        </Card>
      )}
      {games.length > 0 && (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(232px,1fr))]">
          {games.map((g) => (
            <button key={g.universeId} onClick={() => setSelected(g)} className="rbx-rise text-left">
              <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                <div className="aspect-[16/10] w-full" style={{ background: "var(--rbx-surface-2)" }}>
                  {g.iconUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={g.iconUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="p-3.5">
                  <div className="truncate text-[14px] font-semibold">{g.name}</div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="tnum text-[12px]" style={{ color: "var(--rbx-ink-2)" }}>
                      {g.playing != null ? `${g.playing.toLocaleString()} playing` : "—"}
                    </span>
                    <AccessBadge state={access[String(g.universeId)] ?? (hasKey ? undefined : "nokey")} />
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}

      {/* game menu */}
      {selected && (
        <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center" style={{ background: "rgba(20,24,31,.42)" }} onClick={() => setSelected(null)}>
          <Card className="rbx-rise max-h-[88vh] w-full max-w-[520px] overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3.5">
              {selected.iconUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.iconUrl} alt="" className="h-14 w-14 rounded-xl object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[17px] font-semibold leading-tight">{selected.name}</div>
                <div className="tnum mt-0.5 text-[12px]" style={{ color: "var(--rbx-ink-3)" }}>
                  Universe {selected.universeId}
                  {selected.playing != null && ` · ${selected.playing.toLocaleString()} playing`}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg px-2 py-1 text-[18px] leading-none" style={{ color: "var(--rbx-ink-3)" }}>×</button>
            </div>

            <div className="mt-6 space-y-2.5">
              <Label>Collection</Label>
              <Toggle
                on={Boolean(gameCfg.dailyGrab)}
                onChange={(v) => patchGame({ dailyGrab: v })}
                label="Daily grab"
                hint="One full pull per day. Enough to date a change; the cheapest thing that keeps history."
              />
              <div className="rounded-xl px-3 py-3" style={{ background: "var(--rbx-surface-2)" }}>
                <div className="text-[14px] font-medium">Repeat grab</div>
                <div className="mt-0.5 text-[12px]" style={{ color: "var(--rbx-ink-2)" }}>
                  Tighter cadence around a publish. Sub-daily metrics only hold ~24h.
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {[null, 1, 3, 6, 12, 24].map((h) => (
                    <button
                      key={String(h)}
                      onClick={() => patchGame({ intervalHours: h })}
                      className="rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium"
                      style={
                        (gameCfg.intervalHours ?? null) === h
                          ? { background: "var(--rbx-blue)", color: "#fff" }
                          : { background: "var(--rbx-surface)", border: "1px solid var(--rbx-border)", color: "var(--rbx-ink-2)" }
                      }
                    >{h == null ? "Off" : `${h}h`}</button>
                  ))}
                </div>
              </div>

              <div className="pt-3"><Label>Analysis</Label></div>
              <Toggle
                on={Boolean(gameCfg.liveopsDiagnosis)}
                onChange={(v) => patchGame({ liveopsDiagnosis: v })}
                label="LiveOps diagnosis"
                hint="Run the ladder when something moves, and score each day against its own weekday baseline."
              />
              <Toggle
                on={Boolean(gameCfg.updateWatch)}
                onChange={(v) => patchGame({ updateWatch: v })}
                label="Update watch"
                hint="Tighten cadence around a publish and report what the update changed."
              />

              <div className="pt-3"><Label>Discord</Label></div>
              <div className="rounded-xl px-3 py-3" style={{ background: "var(--rbx-surface-2)" }}>
                <input
                  value={gameCfg.discordWebhook ?? ""}
                  onChange={(e) => patchGame({ discordWebhook: e.target.value })}
                  placeholder="https://discord.com/api/webhooks/…"
                  className="h-10 w-full rounded-lg px-3 text-[13px] outline-none"
                  style={{ background: "var(--rbx-surface)", border: "1px solid var(--rbx-border)" }}
                />
                <div className="mt-2 text-[12px] leading-snug" style={{ color: "var(--rbx-ink-3)" }}>
                  Not wired up yet — the field stores the URL so alerting can be switched on without
                  reconfiguring every game later.
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-[12px]" style={{ color: "var(--rbx-ink-3)" }}>Saved to data/dashboard-config.json</span>
              <button onClick={() => setSelected(null)} className="h-10 rounded-xl px-5 text-[14px] font-semibold text-white" style={{ background: "var(--rbx-blue)" }}>Done</button>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}
