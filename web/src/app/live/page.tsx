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

const CCU_MS = 30_000;
const FEED_MS = 60_000;

const SERIES = ["#2F5D50", "#B4552B", "#4A6FA5", "#8A5B0C", "#7A3E6B", "#2F6E8F"];
const nf = new Intl.NumberFormat("en-US");
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
  const [feedAt, setFeedAt] = useState<string>("");
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
      setFeedAt(new Date().toISOString());
    } catch { /* leave the last good feed on screen */ }
  }, []);

  useEffect(() => { pullCcu(); pullFeed(); }, [pullCcu, pullFeed]);
  useEffect(() => {
    if (paused) return;
    const a = window.setInterval(pullCcu, CCU_MS);
    const b = window.setInterval(pullFeed, FEED_MS);
    return () => { window.clearInterval(a); window.clearInterval(b); };
  }, [paused, pullCcu, pullFeed]);

  const total = rows.reduce((a, r) => a + r.playing, 0);
  const seriesFor = (u: string) => hist.map((s) => s.v[u]).filter((v) => typeof v === "number");
  const shown = filter === "all" ? reviews : reviews.filter((r) => r.universeId === filter);
  const feedStale = feedAt ? Date.now() - Date.parse(feedAt) > 5 * 60_000 : true;

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
        <div className="hd"><h2>Player reviews</h2>
          <span className="muted">
            {feedStale
              ? "feed idle — start it with npm run live"
              : `updated ${clock(feedAt)} · every 60s`}
          </span></div>

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
