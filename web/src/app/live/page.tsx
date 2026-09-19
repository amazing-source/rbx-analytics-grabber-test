"use client";

// The live board: concurrents for every game, refreshed on a timer, and a feed
// of player reviews as they arrive.
//
// CCU polls itself from this page — the upstream needs no auth, so the board is
// useful with nothing else running. The feedback feed is filled by
// `npm run live`, which polls inside the logged-in browser; when it is not
// running the feed simply stops updating and says so, rather than looking empty.
import { useCallback, useEffect, useRef, useState } from "react";

type CcuRow = { universeId: string; name: string; playing: number; visits: number; favorites: number };
type Sample = { t: string; v: Record<string, number> };
type Review = { id: string; universeId: string; game: string; comment: string;
  createdUtc: string; assetVersion?: string | number | null; category?: string | null; seenAt: string };
type PollGame = { universeId: string; game: string; status: number; pages: number;
  returned: number; truncated: boolean; error?: string };
type FeedPoll = { at: string; every: number; games: PollGame[] };

type MetricSpec = { key: string; metric: string; label: string; gloss: string;
  kind: "int" | "robux" | "rate" | "pct" | "minutes" };
type Point = { date: string; value: number };
type Cell = { latest: Point; prev: Point | null; weekAgo: Point | null;
  partialToday: Point | null; history: Point[] };
type GameMetrics = { universeId: string; name: string;
  cells: Record<string, Cell | null>; notes: Record<string, string> };
type MetricSnap = { computedAt: string; games: GameMetrics[]; specs: MetricSpec[];
  problems: string[]; refreshing?: boolean };

const CCU_MS = 30_000;
const FEED_MS = 60_000;
// Cheap: the route answers from a disk cache. This poll only exists so a
// background refresh landing shows up without a manual reload.
const MET_MS = 60_000;

const SERIES = ["#2F5D50", "#B4552B", "#4A6FA5", "#8A5B0C", "#7A3E6B", "#2F6E8F"];
const nf = new Intl.NumberFormat("en-US");
/** Two decimals, with trailing zeros dropped — via Number, not a regex.
 *  A regex here is one lost backslash away from `/.?0+$/`, which matches ANY
 *  character before the zeros and turned -0.10 into "-0." on this very page. */
const trimZeros = (n: number) => String(Number(n.toFixed(2)));

/** Format by KIND, because a rate and a Robux total are not the same number.
 *  ARPDAU at 3dp keeps a real move visible; rounding it to 0.5 would hide one. */
function fmtVal(v: number, kind: MetricSpec["kind"]) {
  if (kind === "int") return nf.format(Math.round(v));
  if (kind === "robux") return "R$ " + nf.format(Math.round(v));
  if (kind === "pct") return trimZeros(v * 100) + "%";
  if (kind === "minutes") return v.toFixed(1) + "m";
  return v.toFixed(3);
}

/** A RATE moves in percentage POINTS; a volume moves in percent. Printing a
 *  D1 of 15.5%→19.9% as "+28%" overstates it — it is +4.4pp. */
function delta(now: number, then: number, kind: MetricSpec["kind"]) {
  if (kind === "pct") {
    const pp = (now - then) * 100;
    return { text: (pp > 0 ? "+" : "") + trimZeros(pp) + "pp", dir: Math.sign(pp) };
  }
  if (!then) return { text: "—", dir: 0 };
  const pc = ((now - then) / Math.abs(then)) * 100;
  return { text: (pc > 0 ? "+" : "") + pc.toFixed(1) + "%", dir: Math.sign(pc) };
}

const dayLabel = (d: string) => (d ? d.slice(5) : "");

function ago(ms: number) {
  const m = Math.round(ms / 60_000);
  if (m < 90) return `${m} min`;
  const h = Math.round(m / 60);
  return h < 48 ? `${h} h` : `${Math.round(h / 24)} days`;
}

const clock = (iso: string) => (iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "");
/** The reviews API returns created_utc as epoch MILLISECONDS in a string. */
function when(v: string) {
  if (!v) return "";
  const d = /^[0-9]+$/.test(v) ? new Date(Number(v)) : new Date(v);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString();
}

function Spark({ pts, color }: { pts: number[]; color: string }) {
  if (pts.length < 2) return <svg width={150} height={34} aria-hidden="true" />;
  const lo = Math.min(...pts), hi = Math.max(...pts);
  const span = hi - lo || 1;
  const d = pts.map((v, i) =>
    `${i ? "L" : "M"}${((i / (pts.length - 1)) * 146 + 2).toFixed(1)},${(31 - ((v - lo) / span) * 28).toFixed(1)}`).join("");
  return (
    <svg width={150} height={34} role="img" aria-label="recent concurrents">
      <path d={d} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={148} cy={31 - ((pts[pts.length - 1] - lo) / span) * 28} r={2.6} fill={color} />
    </svg>
  );
}

export default function LivePage() {
  const [rows, setRows] = useState<CcuRow[]>([]);
  const [hist, setHist] = useState<Sample[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ccuAt, setCcuAt] = useState<string>("");
  const [ccuErr, setCcuErr] = useState<string>("");
  const [poll, setPoll] = useState<FeedPoll | null>(null);
  const [feedErr, setFeedErr] = useState<string>("");
  const [now, setNow] = useState(() => Date.now());
  const [met, setMet] = useState<MetricSnap | null>(null);
  const [metErr, setMetErr] = useState<string>("");
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const firstFeed = useRef(true);
  const seenIds = useRef<Set<string>>(new Set());
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());

  const pullCcu = useCallback(async () => {
    try {
      const r = await fetch(`/api/live/ccu?history=1`, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) { setCcuErr(j.error ?? `HTTP ${r.status}`); return; }
      setCcuErr(""); setRows(j.rows); setHist(j.history ?? []); setCcuAt(j.at);
    } catch (e) { setCcuErr((e as Error).message); }
  }, []);

  const pullFeed = useCallback(async () => {
    try {
      const r = await fetch(`/api/live/feedback`, { cache: "no-store" });
      const j = await r.json();
      const next: Review[] = j.reviews ?? [];
      // Decide "new" from the ids we have already seen in THIS tab, outside the
      // state updater — an updater can run twice and would mark a cold load as new.
      if (firstFeed.current) {
        firstFeed.current = false;
        next.forEach((x) => seenIds.current.add(x.id));
      } else {
        const added = next.filter((x) => !seenIds.current.has(x.id)).map((x) => x.id);
        added.forEach((id) => seenIds.current.add(id));
        if (added.length) {
          setFreshIds((s) => new Set([...s, ...added]));
          window.setTimeout(() => setFreshIds((s) => {
            const c = new Set(s); added.forEach((id) => c.delete(id)); return c;
          }), 120_000);
        }
      }
      setReviews(next);
      // The poller's own heartbeat — NOT the time this tab re-read the log.
      // Stamping the tab's read as "updated" is what showed a feed as refreshed
      // every 60s for two days while nothing was polling Roblox.
      setPoll(j.poll ?? null);
      setFeedErr("");
    } catch (e) { setFeedErr((e as Error).message); /* leave the last good feed on screen */ }
    setNow(Date.now());
  }, []);

  const pullMet = useCallback(async (force = false) => {
    try {
      const r = await fetch(`/api/live/metrics${force ? "?refresh=1" : ""}`, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) { setMetErr(j.error ?? `HTTP ${r.status}`); return; }
      setMetErr(""); setMet(j);
    } catch (e) { setMetErr((e as Error).message); }
  }, []);

  useEffect(() => { pullCcu(); pullFeed(); pullMet(); }, [pullCcu, pullFeed, pullMet]);
  useEffect(() => {
    if (paused) return;
    const a = window.setInterval(pullCcu, CCU_MS);
    const b = window.setInterval(pullFeed, FEED_MS);
    const c = window.setInterval(() => pullMet(), MET_MS);
    return () => { window.clearInterval(a); window.clearInterval(b); window.clearInterval(c); };
  }, [paused, pullCcu, pullFeed, pullMet]);

  const total = rows.reduce((a, r) => a + r.playing, 0);
  const seriesFor = (u: string) => hist.map((s) => s.v[u]).filter((v) => typeof v === "number");
  const shown = filter === "all" ? reviews : reviews.filter((r) => r.universeId === filter);
  // Stale once three poll intervals pass with no heartbeat (10 min floor).
  const pollAge = poll ? now - Date.parse(poll.at) : Infinity;
  const feedStale = !poll || pollAge > Math.max(10 * 60_000, 3 * poll.every * 1000);
  const pollFaults = poll?.games.filter((g) => g.error || g.truncated) ?? [];
  const newest = reviews[0]?.createdUtc;

  return (
    <main className="wrap">
      <style>{css}</style>

      <header className="mast">
        <div>
          <p className="lab">Indigo LiveOps</p>
          <h1>Live board</h1>
        </div>
        <div className="ctl">
          <span className="tot"><b>{nf.format(total)}</b> playing now</span>
          <button onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
            {paused ? "Resume" : "Pause"}
          </button>
        </div>
      </header>

      {ccuErr && <p className="err" role="status">Concurrents poll failed — {ccuErr}. Showing the last good read; this is not zero players.</p>}

      <section>
        <div className="hd"><h2>Concurrents</h2>
          <span className="muted">{ccuAt ? `updated ${clock(ccuAt)} · every 30s` : "…"}</span></div>
        <div className="grid">
          {rows.map((r, i) => {
            const s = seriesFor(r.universeId);
            const prev = s.length > 1 ? s[s.length - 2] : null;
            const d = prev == null ? null : r.playing - prev;
            return (
              <article key={r.universeId} className="card" style={{ borderLeftColor: SERIES[i % SERIES.length] }}>
                <h3>{r.name}</h3>
                <p className="big">{nf.format(r.playing)}</p>
                <p className="sub">
                  {d == null ? <span className="muted">—</span>
                    : <span className={d > 0 ? "up" : d < 0 ? "dn" : "muted"}>{d > 0 ? "+" : ""}{nf.format(d)} since last</span>}
                </p>
                <Spark pts={s.slice(-60)} color={SERIES[i % SERIES.length]} />
                <p className="meta">{nf.format(r.visits)} visits · {nf.format(r.favorites)} favourites</p>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <div className="hd"><h2>Key metrics</h2>
          <span className="muted">
            {met?.refreshing ? "refreshing — 36 paced Open Cloud reads, ~80s"
              : met ? `snapshot ${clock(met.computedAt)}` : "…"}
          </span>
          <button className="ghost" onClick={() => pullMet(true)} disabled={!!met?.refreshing}>Refresh</button>
        </div>

        {metErr && <p className="err" role="status">Metrics read failed — {metErr}.</p>}
        {met?.problems?.map((x) => <p key={x} className="warn">{x}</p>)}

        <p className="lagnote">
          These are <b>settled daily figures, not live</b>. Roblox serves the behavioural
          rung about two days behind, and D1 a day behind that because the cohort has to
          mature — so each cell is stamped with the UTC day it is for. Today is never shown
          here: a part-day differenced against whole ones reads as a collapse.
          <b> CCU above is the live number.</b>
        </p>

        {!met ? <p className="muted empty">Building the first snapshot…</p> : (
          <div className="tscroll">
            <table className="mt">
              <thead>
                <tr>
                  <th className="gcol">Game</th>
                  {met.specs.map((sp) => (
                    <th key={sp.key}><span className="mlab">{sp.label}</span>
                      <span className="mgloss">{sp.gloss}</span></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {met.games.map((g) => (
                  <tr key={g.universeId}>
                    <td className="gcol">{g.name}</td>
                    {met.specs.map((sp) => {
                      const c = g.cells[sp.key];
                      if (!c) return (
                        <td key={sp.key} className="na" title={g.notes[sp.key] || "not served"}>
                          —<span className="mgloss">{g.notes[sp.key] ? "see note" : "not served"}</span></td>
                      );
                      const d1 = c.prev ? delta(c.latest.value, c.prev.value, sp.kind) : null;
                      const d7 = c.weekAgo ? delta(c.latest.value, c.weekAgo.value, sp.kind) : null;
                      return (
                        <td key={sp.key}>
                          <span className="mval">{fmtVal(c.latest.value, sp.kind)}</span>
                          <span className="mdate">{dayLabel(c.latest.date)}</span>
                          <span className="deltas">
                            <span className={"dl " + (d1 ? (d1.dir > 0 ? "up" : d1.dir < 0 ? "dn" : "") : "")}
                              title={c.prev ? `vs ${c.prev.date} (previous day)` : "previous day not served"}>
                              d/d {d1 ? d1.text : "—"}</span>
                            <span className={"dl " + (d7 ? (d7.dir > 0 ? "up" : d7.dir < 0 ? "dn" : "") : "")}
                              title={c.weekAgo ? `vs ${c.weekAgo.date} — same weekday` : "same weekday not in the served window"}>
                              w/w {d7 ? d7.text : "—"}</span>
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="muted foot">
          d/d is the calendar day before. w/w is the <b>same weekday</b> a week earlier,
          kept as its own comparison rather than folded into a matched-window mean.
          Rates move in percentage points (pp), volumes in percent. Hover any delta for the
          exact dates compared.
        </p>
      </section>

      <section>
        <div className="hd"><h2>Player reviews</h2>
          <span className="muted">
            {poll ? `last poll of Roblox ${feedStale ? when(poll.at) : clock(poll.at)} · every ${poll.every}s`
              : "no poll on record"}
            {newest ? ` · newest review ${when(newest)}` : ""}
          </span></div>

        {feedErr && <p className="err" role="status">Could not read the review log — {feedErr}. Showing the last good read.</p>}
        {feedStale && (
          <p className="err" role="status">
            Review feed is not running
            {poll ? <> — nothing has polled Roblox since <b>{when(poll.at)}</b> ({ago(pollAge)} ago)</>
              : newest ? <> — no poll on record, and the newest logged review is from <b>{when(newest)}</b></> : null}.
            Reviews written after that are not below. Start it with <code>npm run live</code> in a
            second terminal; the first pass pages back and fills the gap.
          </p>
        )}
        {!feedStale && pollFaults.map((g) => (
          <p key={g.universeId} className="warn">
            {g.game}: {g.error
              ? `last poll failed (HTTP ${g.status || "—"})${g.status === 401 || g.status === 403 ? " — the grab profile's Roblox session has lapsed; run npm run grab:login" : ""}. Its reviews are not updating.`
              : "the gap since the previous poll was longer than the page budget — older reviews in it were not backfilled."}
          </p>
        ))}

        <div className="filters">
          <button className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>All</button>
          {rows.map((r) => (
            <button key={r.universeId} className={filter === r.universeId ? "on" : ""}
              onClick={() => setFilter(r.universeId)}>{r.name.split(" ").slice(0, 2).join(" ")}</button>
          ))}
        </div>

        {!shown.length && (
          <p className="muted empty">
            No reviews logged yet. Concurrents above run on their own; the review feed needs
            <code> npm run live</code> in a second terminal — it polls inside the logged-in browser,
            because that endpoint is cookie-authenticated.
          </p>
        )}

        <ul className="feed">
          {shown.slice(0, 120).map((r) => (
            <li key={r.id} className={freshIds.has(r.id) ? "new" : ""}>
              <div className="row">
                <span className="who">{r.game}</span>
                {r.category ? <span className={"sent " + (r.category === "Downvote" ? "down" : "upv")}>{r.category === "Downvote" ? "▼" : "▲"}</span> : null}
                {r.assetVersion ? <span className="ver">v{r.assetVersion}</span> : null}
                <span className="when">{when(r.createdUtc)}</span>
                {freshIds.has(r.id) && <span className="badge">new</span>}
              </div>
              <p>{r.comment}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

const css = `
.wrap{--ground:#F7F5F2;--surface:#fff;--surface-2:#EFEDE8;--ink:#16181C;--ink-2:#4B515C;--ink-3:#77808D;
 --rule:#DFDCD5;--rule-2:#C6C2B9;--accent:#2F5D50;--ok:#1B6F47;--fix:#A6332A;
 background:var(--ground);color:var(--ink);min-height:100vh;margin:0;
 font-family:"Source Serif 4",Georgia,serif;padding:0 22px 80px;max-width:1180px;margin:0 auto}
@media (prefers-color-scheme:dark){.wrap{--ground:#121417;--surface:#191C21;--surface-2:#21252B;
 --ink:#E9EBEF;--ink-2:#AEB5C0;--ink-3:#7E8794;--rule:#2A2F36;--rule-2:#3B424B;
 --accent:#6FB39D;--ok:#5FBF8C;--fix:#E88479}}
.wrap h1,.wrap h2,.wrap h3,.lab,button,.big,.meta,.ver,.when,.badge,.tot{font-family:Archivo,Helvetica,Arial,sans-serif}
.mast{display:flex;justify-content:space-between;align-items:flex-end;gap:18px;flex-wrap:wrap;
 border-top:6px solid var(--accent);padding:20px 0 0;margin-bottom:34px}
.mast h1{font-size:2rem;font-weight:700;letter-spacing:-.02em;margin:2px 0 0}
.lab{font-size:.68rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);margin:0}
.ctl{display:flex;align-items:center;gap:14px}
.tot{font-size:.95rem;color:var(--ink-2)} .tot b{font-size:1.5rem;color:var(--ink);font-variant-numeric:tabular-nums}
button{font-size:.74rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;
 padding:7px 13px;border-radius:5px;border:1px solid var(--rule-2);background:var(--surface);color:var(--ink)}
button:hover{border-color:var(--accent)} button.on{background:var(--accent);color:#fff;border-color:var(--accent)}
section{margin-bottom:46px}
.hd{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;border-bottom:2px solid var(--rule-2);
 padding-bottom:9px;margin-bottom:18px}
.hd h2{font-size:1.2rem;font-weight:600;margin:0}
.muted{color:var(--ink-2);font-size:.85rem}
.err{background:#FAE6E3;color:#A6332A;border-radius:6px;padding:11px 15px;font-size:.9rem;margin:0 0 20px}
.grid{display:grid;gap:13px;grid-template-columns:repeat(auto-fit,minmax(215px,1fr))}
.card{background:var(--surface);border:1px solid var(--rule);border-left:4px solid var(--accent);
 border-radius:8px;padding:15px}
.card h3{font-size:.82rem;font-weight:600;margin:0 0 9px;color:var(--ink-2);
 white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.big{font-size:2.1rem;font-weight:700;font-variant-numeric:tabular-nums;margin:0;line-height:1}
.sub{font-size:.78rem;margin:4px 0 8px;font-family:Archivo,sans-serif}
.up{color:var(--ok);font-weight:600}.dn{color:var(--fix);font-weight:600}
.meta{font-size:.7rem;color:var(--ink-3);margin:6px 0 0}
.hd button.ghost{margin-left:auto;font-size:.66rem;padding:5px 10px}
.hd button.ghost:disabled{opacity:.45;cursor:default}
.warn{background:var(--surface-2);color:var(--ink-2);border-left:3px solid var(--fix);
 border-radius:5px;padding:8px 13px;font-size:.82rem;margin:0 0 10px}
.lagnote{background:var(--surface-2);border-radius:7px;padding:12px 16px;font-size:.88rem;
 line-height:1.55;margin:0 0 16px;color:var(--ink-2)}
.lagnote b{color:var(--ink)}
.tscroll{overflow-x:auto;border:1px solid var(--rule);border-radius:8px;background:var(--surface)}
.mt{border-collapse:collapse;width:100%;min-width:780px}
.mt th,.mt td{text-align:right;padding:10px 13px;border-bottom:1px solid var(--rule);vertical-align:top}
.mt tbody tr:last-child td{border-bottom:none}
.mt th{font-family:Archivo,sans-serif;background:var(--surface-2);position:sticky;top:0}
.mt th .mlab{display:block;font-size:.78rem;font-weight:700}
.mgloss{display:block;font-family:"IBM Plex Mono",monospace;font-size:.6rem;
 color:var(--ink-3);font-weight:400;margin-top:2px}
.mt .gcol{text-align:left;font-family:Archivo,sans-serif;font-size:.8rem;font-weight:600;
 white-space:nowrap;position:sticky;left:0;background:var(--surface)}
.mt th.gcol{background:var(--surface-2)}
.mval{display:block;font-family:Archivo,sans-serif;font-size:1.02rem;font-weight:700;
 font-variant-numeric:tabular-nums;line-height:1.2}
.mdate{display:block;font-family:"IBM Plex Mono",monospace;font-size:.6rem;color:var(--ink-3);margin-top:1px}
.deltas{display:flex;flex-direction:column;gap:1px;margin-top:5px}
.dl{font-family:"IBM Plex Mono",monospace;font-size:.66rem;color:var(--ink-3);cursor:help}
.dl.up{color:var(--ok)}.dl.dn{color:var(--fix)}
.mt td.na{color:var(--ink-3)}
.foot{margin:12px 0 0;line-height:1.5;font-size:.8rem}
.filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}
.empty{background:var(--surface-2);border-radius:7px;padding:16px 18px;font-size:.9rem}
.empty code{font-family:"IBM Plex Mono",monospace;font-size:.85em}
.feed{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:11px}
.feed li{background:var(--surface);border:1px solid var(--rule);border-radius:7px;padding:13px 15px}
.feed li.new{border-color:var(--accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 18%,transparent)}
.row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:5px}
.who{font-family:Archivo,sans-serif;font-size:.76rem;font-weight:600}
.ver,.when{font-family:"IBM Plex Mono",monospace;font-size:.68rem;color:var(--ink-3)}
.sent{font-size:.7rem;line-height:1}.sent.upv{color:var(--ok)}.sent.down{color:var(--fix)}
.badge{font-size:.62rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
 background:var(--accent);color:#fff;padding:2px 7px;border-radius:3px}
.feed p{margin:0;font-size:.97rem;line-height:1.5}
@media (max-width:560px){.mast{align-items:flex-start;flex-direction:column}.wrap{padding-inline:16px}}
`;
