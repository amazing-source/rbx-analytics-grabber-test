"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Legend,
} from "recharts";
import {
  CATEGORIES, type Category, metricInfo, formatValue, deltaIsGood, isVisible,
} from "@/lib/metric-info";

type Game = { id: string; genre: string | null };
type OverviewMetric = {
  metric: string;
  latest: number | null;
  latestDate: string | null;
  deltaPct: number | null;
  anyInvalid: boolean;
  spark: { date: string; value: number | null }[];
  representative?: boolean;
  seriesLabel?: string;
};
type SeriesPoint = { date: string; ts: string; value: number | null; status: string | null };
type Series = { key: string; label: string; points: SeriesPoint[] };
type SeriesData = {
  metric: string;
  latestAvailableTime: string | null;
  genre: string | null;
  series: Series[];
  benchmarks: Record<string, SeriesPoint[]>;
  updates: { id: string; title: string; occurredAt: string }[];
};

const LINE_COLORS = ["#335fff", "#00a3a3", "#f0883e", "#00a36c", "#8b5cf6", "#e8519a", "#0ea5e9", "#d4a017"];

async function getJSON<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

function axisFmt(metric: string, v: number) {
  const u = metricInfo(metric).unit;
  if (u === "percent") return `${Math.round(v * 100)}%`;
  if (Math.abs(v) >= 1000) return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(v);
  return u === "robux" && Math.abs(v) < 100 ? v.toFixed(1) : String(Math.round(v));
}

export default function Dashboard() {
  const [games, setGames] = useState<Game[]>([]);
  const [game, setGame] = useState("");
  const [overview, setOverview] = useState<OverviewMetric[]>([]);
  const [freshness, setFreshness] = useState<Record<string, string>>({});
  const [category, setCategory] = useState<Category>("Engagement");
  const [metric, setMetric] = useState("");
  const [data, setData] = useState<SeriesData | null>(null);
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const [showBench, setShowBench] = useState(true);
  const [reload, setReload] = useState(0);
  const [err, setErr] = useState("");

  useEffect(() => {
    getJSON<{ games: Game[] }>("/api/games")
      .then((d) => { setGames(d.games); if (d.games[0]) setGame(d.games[0].id); })
      .catch((e) => setErr(String(e)));
  }, []);

  useEffect(() => {
    if (!game) return;
    getJSON<{ metrics: OverviewMetric[]; freshness: Record<string, string> }>(`/api/overview?game=${game}`)
      .then((d) => { setOverview(d.metrics); setFreshness(d.freshness || {}); });
  }, [game, reload]);

  const byCategory = useMemo(() => {
    const map = new Map<Category, OverviewMetric[]>();
    for (const m of overview) {
      if (!isVisible(m.metric)) continue;
      const c = metricInfo(m.metric).category as Category;
      const arr = map.get(c) ?? [];
      arr.push(m);
      map.set(c, arr);
    }
    for (const arr of map.values())
      arr.sort((a, b) => metricInfo(a.metric).label.localeCompare(metricInfo(b.metric).label));
    return map;
  }, [overview]);

  const tiles = byCategory.get(category) ?? [];

  // keep a valid selected metric for the active category
  useEffect(() => {
    if (!tiles.length) { setMetric(""); return; }
    if (!tiles.some((t) => t.metric === metric)) setMetric(tiles[0].metric);
  }, [category, tiles, metric]);

  const inCategory = !!metric && tiles.some((t) => t.metric === metric);

  useEffect(() => {
    if (!game || !metric) return;
    getJSON<SeriesData>(`/api/series?game=${game}&metric=${metric}`).then((d) => {
      setData(d);
      const total = d.series.find((s) => s.label === "Total") ?? d.series[0];
      setVisible(new Set(total ? [total.key] : []));
    });
  }, [game, metric, reload]);

  const chart = useMemo(() => {
    if (!data) return [];
    const byDate = new Map<string, Record<string, number | string | null>>();
    const ensure = (date: string) => {
      let row = byDate.get(date);
      if (!row) { row = { date }; byDate.set(date, row); }
      return row;
    };
    for (const s of data.series) {
      if (!visible.has(s.key)) continue;
      for (const p of s.points) ensure(p.date)[s.key] = p.value;
    }
    if (showBench) for (const [pct, pts] of Object.entries(data.benchmarks))
      for (const p of pts) ensure(p.date)[`p${pct}`] = p.value;
    return [...byDate.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }, [data, visible, showBench]);

  const dataThrough = useMemo(() => {
    const vals = Object.values(freshness).map((x) => x.slice(0, 10)).sort();
    return vals.length ? vals[vals.length - 1] : null;
  }, [freshness]);

  const info = metric ? metricInfo(metric) : null;
  const selectedTile = tiles.find((t) => t.metric === metric);

  return (
    <div className="min-h-screen" style={{ background: "var(--rbx-bg)" }}>
      {/* ---- Top bar ---- */}
      <header className="sticky top-0 z-20 flex items-center gap-4 px-6 h-14 border-b"
        style={{ background: "var(--rbx-surface)", borderColor: "var(--rbx-border)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg grid place-items-center text-white font-extrabold text-sm"
            style={{ background: "var(--rbx-blue)" }}>I</div>
          <div className="leading-tight">
            <div className="font-bold text-[15px]" style={{ color: "var(--rbx-ink)" }}>Indigo</div>
            <div className="text-[10px] -mt-0.5" style={{ color: "var(--rbx-ink-3)" }}>LiveOps Analytics</div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          {dataThrough && (
            <span className="text-xs hidden sm:inline" style={{ color: "var(--rbx-ink-3)" }}>
              Data through <span className="font-semibold" style={{ color: "var(--rbx-ink-2)" }}>{dataThrough}</span>
            </span>
          )}
          <div className="flex items-center gap-2 px-3 h-9 rounded-lg border text-sm"
            style={{ borderColor: "var(--rbx-border-strong)", background: "var(--rbx-surface)" }}>
            <span className="w-5 h-5 rounded grid place-items-center text-[11px] font-bold text-white"
              style={{ background: "linear-gradient(135deg,#335fff,#7c5cff)" }}>R</span>
            <select value={game} onChange={(e) => setGame(e.target.value)}
              className="bg-transparent outline-none font-medium" style={{ color: "var(--rbx-ink)" }}>
              {games.map((g) => (
                <option key={g.id} value={g.id}>{g.id}{g.genre ? ` · ${g.genre}` : ""}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* ---- Category tabs ---- */}
      <nav className="px-6 border-b flex gap-1" style={{ background: "var(--rbx-surface)", borderColor: "var(--rbx-border)" }}>
        {CATEGORIES.map((c) => {
          const active = c === category;
          const count = (byCategory.get(c) ?? []).length;
          return (
            <button key={c} onClick={() => setCategory(c)}
              className="relative px-3.5 py-2.5 text-sm font-semibold transition-colors"
              style={{ color: active ? "var(--rbx-blue)" : "var(--rbx-ink-2)" }}>
              {c}
              <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: active ? "var(--rbx-blue-wash)" : "var(--rbx-surface-2)", color: active ? "var(--rbx-blue)" : "var(--rbx-ink-3)" }}>{count}</span>
              {active && <span className="absolute left-2 right-2 -bottom-px h-0.5 rounded-full" style={{ background: "var(--rbx-blue)" }} />}
            </button>
          );
        })}
      </nav>

      {err && <div className="px-6 py-2 text-sm" style={{ color: "var(--rbx-down)" }}>{err}</div>}

      <main className="max-w-[1180px] mx-auto px-6 py-6">
        <div className="mb-4">
          <h1 className="text-xl font-extrabold" style={{ color: "var(--rbx-ink)" }}>{category}</h1>
          <p className="text-sm" style={{ color: "var(--rbx-ink-2)" }}>{CATEGORY_BLURB[category]}</p>
        </div>

        {/* ---- Metric tiles ---- */}
        <div className="grid gap-3 mb-7" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))" }}>
          {tiles.map((t) => (
            <MetricTile key={t.metric} t={t} active={t.metric === metric} onClick={() => setMetric(t.metric)} />
          ))}
          {!tiles.length && <div className="text-sm col-span-full py-8 text-center" style={{ color: "var(--rbx-ink-3)" }}>No data captured for {category} yet.</div>}
        </div>

        {/* ---- Detail ---- */}
        {data && info && inCategory && data.metric === metric && (
          <section className="rounded-2xl border overflow-hidden rbx-rise"
            style={{ background: "var(--rbx-surface)", borderColor: "var(--rbx-border)" }}>
            <div className="px-5 pt-5 pb-3 flex flex-wrap items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-extrabold" style={{ color: "var(--rbx-ink)" }}>{info.label}</h2>
                  <Pill kind={info.kind} />
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded"
                    style={{ background: "var(--rbx-surface-2)", color: "var(--rbx-ink-3)" }}>{metric}</span>
                </div>
                <p className="text-sm mt-1 max-w-2xl" style={{ color: "var(--rbx-ink-2)" }}>{info.blurb}</p>
              </div>
              {selectedTile && (
                <div className="text-right">
                  <div className="text-2xl font-extrabold tnum" style={{ color: "var(--rbx-ink)" }}>{formatValue(metric, selectedTile.latest)}</div>
                  <DeltaChip metric={metric} delta={selectedTile.deltaPct} align="right" />
                </div>
              )}
            </div>

            {data.latestAvailableTime && (
              <div className="px-5 pb-2 text-xs" style={{ color: "var(--rbx-ink-3)" }}>
                Fresh through <span className="font-semibold" style={{ color: "var(--rbx-ink-2)" }}>{data.latestAvailableTime.slice(0, 10)}</span>
                {selectedTile?.anyInvalid && <span style={{ color: "var(--rbx-warn)" }}> · some points estimated (unvalidated)</span>}
              </div>
            )}

            <div className="px-3 pb-2">
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={chart} margin={{ top: 10, right: 20, bottom: 4, left: 4 }}>
                  <CartesianGrid stroke="#eef0f3" vertical={false} />
                  <XAxis dataKey="date" stroke="#c3c9d1" tick={{ fontSize: 11, fill: "#8a929c" }} tickMargin={8}
                    tickFormatter={(d: string) => String(d).slice(5)} />
                  <YAxis stroke="#c3c9d1" tick={{ fontSize: 11, fill: "#8a929c" }} width={52}
                    tickFormatter={(v: number) => axisFmt(metric, v)} />
                  <Tooltip
                    contentStyle={{ background: "#fff", border: "1px solid var(--rbx-border-strong)", borderRadius: 10, fontSize: 12, boxShadow: "0 6px 24px rgba(20,30,50,.12)" }}
                    labelStyle={{ color: "var(--rbx-ink-2)", fontWeight: 600 }}
                    formatter={(v, name) => {
                      const n = typeof v === "number" ? v : Number(v);
                      const label = String(name ?? "");
                      return [label.startsWith("genre") ? axisFmt(metric, n) : formatValue(metric, n), label];
                    }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
                  {data.series.filter((s) => visible.has(s.key)).map((s, i) => (
                    <Line key={s.key} type="monotone" dataKey={s.key} name={s.label}
                      stroke={LINE_COLORS[i % LINE_COLORS.length]} strokeWidth={2.25} dot={false} connectNulls
                      activeDot={{ r: 4 }} />
                  ))}
                  {showBench && Object.keys(data.benchmarks).map((pct) => (
                    <Line key={`p${pct}`} type="monotone" dataKey={`p${pct}`} name={`genre p${pct}`}
                      stroke="#b8c0cc" strokeWidth={1.5} strokeDasharray="5 4" dot={false} connectNulls />
                  ))}
                  {data.updates.map((u) => (
                    <ReferenceLine key={u.id} x={u.occurredAt.slice(0, 10)} stroke="#e8519a" strokeDasharray="3 3"
                      label={{ value: u.title, fill: "#e8519a", fontSize: 10, position: "insideTopRight" }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* read-help + series toggles */}
            <div className="px-5 py-4 border-t" style={{ borderColor: "var(--rbx-border)" }}>
              <div className="text-xs mb-3 px-3 py-2 rounded-lg" style={{ background: "var(--rbx-surface-2)", color: "var(--rbx-ink-2)" }}>
                {info.kind === "rate"
                  ? "Rate metric — comparable before vs after an update, even while the game grows."
                  : "Volume metric — grows with your player base. Read the trend, but don't compare raw numbers across a growth spurt."}
              </div>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <span className="text-xs font-semibold" style={{ color: "var(--rbx-ink-3)" }}>BREAKDOWNS ({data.series.length})</span>
                <label className="text-xs flex items-center gap-1.5 cursor-pointer" style={{ color: "var(--rbx-ink-2)" }}>
                  <input type="checkbox" checked={showBench} onChange={(e) => setShowBench(e.target.checked)} style={{ accentColor: "#335fff" }} />
                  show genre benchmark
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.series.map((s, i) => {
                  const on = visible.has(s.key);
                  return (
                    <button key={s.key} onClick={() => {
                      const next = new Set(visible);
                      next.has(s.key) ? next.delete(s.key) : next.add(s.key);
                      setVisible(next);
                    }}
                      className="text-xs flex items-center gap-1.5 rounded-full border px-2.5 py-1 transition-all"
                      style={{
                        borderColor: on ? LINE_COLORS[i % LINE_COLORS.length] : "var(--rbx-border-strong)",
                        background: on ? "var(--rbx-surface)" : "var(--rbx-surface-2)",
                        color: on ? "var(--rbx-ink)" : "var(--rbx-ink-3)",
                      }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: on ? LINE_COLORS[i % LINE_COLORS.length] : "var(--rbx-ink-3)" }} />
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <UpdateTagger game={game} onAdded={() => setReload((n) => n + 1)} />
          </section>
        )}
      </main>
    </div>
  );
}

const CATEGORY_BLURB: Record<Category, string> = {
  Discovery: "Is Roblox still showing the game to people? Impressions vs plays separates a reach problem from an in-game one.",
  Engagement: "Are players showing up and staying in a session? The hook and the traffic.",
  Retention: "Do they come back? Day-1 / Day-7 / Day-30 and stickiness.",
  Monetization: "Are players spending — and how widely vs how deeply? Conversion is the #1 lever.",
  Funnel: "Where do new players drop off during onboarding?",
  Performance: "Technical health — crashes, memory, frame rate. Rule this out before blaming the design.",
  Other: "",
};

function Pill({ kind }: { kind: "rate" | "volume" }) {
  const rate = kind === "rate";
  return (
    <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
      style={{ background: rate ? "#e6f7f0" : "#fff0e6", color: rate ? "#00875a" : "#c2620e" }}>
      {kind}
    </span>
  );
}

function DeltaChip({ metric, delta, align }: { metric: string; delta: number | null; align?: "right" }) {
  if (delta == null) return <div className="text-[11px]" style={{ color: "var(--rbx-ink-3)" }}>—</div>;
  const good = deltaIsGood(metric, delta);
  const color = good == null ? "var(--rbx-ink-3)" : good ? "var(--rbx-up)" : "var(--rbx-down)";
  const arrow = delta > 0 ? "▲" : delta < 0 ? "▼" : "•";
  return (
    <div className={`text-[11px] font-semibold tnum flex items-center gap-1 ${align === "right" ? "justify-end" : ""}`} style={{ color }}>
      <span>{arrow}</span>{Math.abs(delta).toFixed(1)}%<span className="font-normal" style={{ color: "var(--rbx-ink-3)" }}>vs prior</span>
    </div>
  );
}

function Sparkline({ points, good }: { points: { value: number | null }[]; good: boolean | null }) {
  const vals = points.map((p) => p.value).filter((v): v is number => v != null);
  if (vals.length < 2) return <div className="h-8" />;
  const min = Math.min(...vals), max = Math.max(...vals), span = max - min || 1;
  const w = 100, h = 30;
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * w},${h - ((v - min) / span) * h}`).join(" ");
  const color = good == null ? "#8a929c" : good ? "#00a36c" : "#e0341d";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-8">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke"
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function MetricTile({ t, active, onClick }: { t: OverviewMetric; active: boolean; onClick: () => void }) {
  const info = metricInfo(t.metric);
  const good = deltaIsGood(t.metric, t.deltaPct);
  return (
    <button onClick={onClick}
      className="text-left rounded-2xl border p-4 transition-all"
      style={{
        background: "var(--rbx-surface)",
        borderColor: active ? "var(--rbx-blue)" : "var(--rbx-border)",
        boxShadow: active ? "0 0 0 3px var(--rbx-blue-wash)" : "0 1px 2px rgba(20,30,50,.04)",
      }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[13px] font-semibold leading-tight" style={{ color: "var(--rbx-ink-2)" }}>{info.label}</span>
        <Pill kind={info.kind} />
      </div>
      <div className="text-[26px] font-extrabold leading-none tnum mb-1" style={{ color: "var(--rbx-ink)" }}>
        {formatValue(t.metric, t.latest)}
      </div>
      <DeltaChip metric={t.metric} delta={t.deltaPct} />
      {t.representative && t.seriesLabel && (
        <div className="text-[10px] mt-1 truncate" style={{ color: "var(--rbx-ink-3)" }} title={t.seriesLabel}>
          shown: {t.seriesLabel}
        </div>
      )}
      <div className="mt-2"><Sparkline points={t.spark} good={good} /></div>
    </button>
  );
}

function UpdateTagger({ game, onAdded }: { game: string; onAdded: () => void }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit() {
    if (!title || !date) { setMsg("Add a title and a date."); return; }
    setBusy(true); setMsg("");
    try {
      await fetch("/api/updates", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ gameId: game, title, occurredAt: new Date(date + "T00:00:00Z").toISOString() }),
      });
      setTitle(""); setDate(""); setMsg("Tagged ✓"); onAdded();
    } catch (e) { setMsg("Failed: " + String(e)); }
    finally { setBusy(false); }
  }

  return (
    <div className="px-5 py-4 border-t" style={{ borderColor: "var(--rbx-border)" }}>
      <div className="text-xs font-semibold mb-2" style={{ color: "var(--rbx-ink-3)" }}>TAG AN UPDATE — drops a marker on every chart</div>
      <div className="flex items-center gap-2 flex-wrap">
        <input placeholder="e.g. v1.4 rebirth rework" value={title} onChange={(e) => setTitle(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg border px-3 h-9 text-sm outline-none"
          style={{ borderColor: "var(--rbx-border-strong)", color: "var(--rbx-ink)" }} />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border px-3 h-9 text-sm outline-none"
          style={{ borderColor: "var(--rbx-border-strong)", color: "var(--rbx-ink-2)" }} />
        <button onClick={submit} disabled={busy}
          className="h-9 px-4 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: "var(--rbx-blue)" }}>Add update</button>
        {msg && <span className="text-xs" style={{ color: "var(--rbx-ink-2)" }}>{msg}</span>}
      </div>
    </div>
  );
}
