# Handoff — state as of 2026-08-07

Written for picking this up on another machine. Read `CLAUDE.md` for the working
agreement and `README.md` for setup. This file is what's true *right now*: what
works, what's broken, what was found, and what to do next.

---

## 1. Getting running on a new machine

```bash
git clone <this repo>
cd rbx-analytics-grabber/web
cp .env.local.example .env.local     # then fill in — see "Blockers" below
npm install
npm run dev                          # must be running or the extension can't reach anything
```

Then load the extension: `chrome://extensions` → Developer mode → **Load unpacked**
→ select the repo root. Open a game's Analytics dashboard on `create.roblox.com`.

**After any edit to `collector.js` / `interceptor.js` / `background.js`:**
reload the extension **and** hard-reload the Roblox tab (Ctrl+Shift+R). Reloading
the extension alone does nothing to an already-open page — this cost us two
debugging rounds.

### Restoring the data on a new machine

`data/raw/` and `data/verify/` **are committed** — the raw capture bundles
cannot be re-created (Roblox expires performance data after a few months, and
a delisted game takes the rest with it). `data/games/` is ignored because it is
fully derived. Rebuild it after cloning:

```bash
cd web && npm install
for f in ../data/raw/*.json; do npm run ingest:file -- "$f"; done
```

Ingest in filename order — the timestamps are the capture order, and the
freeze-when-settled rule means order affects which reading of a disputed point
is kept. Then confirm the three gates:

```bash
npm run verify -- ../data/verify/9610561918/   # 23 pass · 1 fail · 9 skip, exit 0
npm run audit-plan                             # 0 failures
npm test                                       # 30 pass
```

The one expected `verify` failure is a documented disputed hour of realtime
revenue, tracked in the test's `KNOWN_OPEN` set.

---

## 2. Blockers on a fresh machine

| Blocker | Detail |
|---|---|
| **Supabase project is gone** | `rdvtifctqucaqemrhnkd.supabase.co` no longer resolves in DNS. Every DB write fails. **This does not block the tool** — the file mirror in `data/` is written first and the ingest returns `savedToFiles: true`. To restore charts: new Supabase project, new URL/keys in `.env.local`, run `web/supabase/schema.sql`. |
| **`.env.local` not in git** | Deliberate — it held a live secret key. Copy from `.env.local.example`. Consider the old keys compromised and rotate. |
| **Impressions metric returns 403** | `UniqueUsersWithImpressions` is permission-denied on this account. Needs the producer's account or an added permission. Not a query bug. |

---

## 3. How the tool works now

Two-phase active grab, driven entirely by the web app:

```
Extension                         Web app
  │  GET /api/grab-plan?universe=X
  │ ─────────────────────────────►  returns discovery[] + a funnel-less plan
  │  replay discovery in your session
  │    → places, funnel names, dimension values
  │  POST /api/grab-plan {discovered}
  │ ─────────────────────────────►  returns the full plan (~148 requests)
  │  replay all of it
  │  POST /api/ingest {captures, report}
  │ ─────────────────────────────►  writes data/ first, then Supabase
```

**Everything lands in `data/`, always, before the database is touched.**
A dead DB cannot lose a grab. Layout:

- `data/raw/<universe>-<ts>.json` — untouched capture bundle
- `data/games/<id>/summary.md` — headline table per category
- `data/games/<id>/series.json` — full record, merges across grabs
- `data/games/<id>/metrics/*.csv` — long format; hourly metrics also get `*.daily.csv`
- `data/games/<id>/grab-report.md` — **every request attempt**: returned data / empty 200 / failed, with HTTP status
- `data/games/<id>/place-versions.md` — deploy log (version → publish timestamp)

Offline path, no server or DB:
`cd web && npm run ingest:file -- ../data/raw/<file>.json`

---

## 4. Hard-won rules — do not relearn these

1. **Never hardcode a dimension VALUE.** Names are stable; values are per-game.
   Hardcoding `FunnelName: FUNNEL_TYPE_ONBOARDING` (copied from another game)
   made every funnel query return `200` with zero rows, which was then reported
   as "the funnel isn't instrumented". It was — 3.8M sessions. Discovery phase
   exists because of this.
2. **A 200 with zero data points is not evidence of anything.** It means the
   query matched nothing. Verify against the dashboard before concluding.
3. **Breakdowns needing a trend must use `ONE_DAY`, not `NONE`.** At `NONE` the
   gateway returns one aggregate point for the whole window, which silently
   makes "did X change on date D" unanswerable.
4. **Poll on any 2xx, not just 200.** The gateway returns `202` (accepted, still
   computing). Treating that as failure silently dropped whole metrics.
5. **Failed requests are dropped from the capture list** — that's why
   `grab-report.md` exists. Without it a half-working plan looks like a
   metric-coverage problem.
6. **`ErrorCount` by `FirstSeenPlaceVersion` is a deploy log.** A version
   appearing = a ship. `place-versions.md` is the precise version.

### Known dead ends
- `PlaceVersion` as a **breakdown** → 400 on every metric. It's a valid
  dimension for *discovery*, not for breaking down metrics.
- `DailyCohortRetention` → 400. Query shape still wrong; copy the dashboard's.
  Marked `optional` on 2026-08-08 so its failure stops reading as a problem
  with the game.
- ~~`ForwardD30Retention` → 200 empty. Possibly genuine (young cohorts).~~
  **Answered 2026-08-08: not genuine.** The dashboard's own CSV export has D30
  data for Jun 12 → Jul 7. Our 28-day window simply contains no cohort old
  enough. Widen the window instead of concluding anything. (COVERAGE.md row 10.)

---

## 5. The investigation — Become a Brainrot (universe `9963622286`)

Producer: Nina, Indigo Studios. QA blamed a Jul 22 stolen-model swap.

**The model swap is exonerated. The break is July 30.**

Three independent signals, all stepping on the same day, plus a deploy:

| Signal | Before | After Jul 30 |
|---|---|---|
| D1 retention | 16.8% (tracking genre p50) | 10.9% (p50 held at 16–18%) |
| Avg session length | 12.5 min | 10.0 min |
| PlayerProgression funnel completion | 28.1% (3-week plateau) | 18.8% |
| **Place version v546** | — | **first traffic Jul 30** |

Supporting detail:
- Retention degradation tracks **return date, not join date** — existing players
  who had been retaining normally stopped coming back. Points at a change in the
  game, not in the quality of arrivals.
- **Not performance**: FPS flat ~34, crash rate *improved*, memory flat. Desktop
  session length fell *more* than phone (−22.6% vs −19.2%) — the opposite of a
  render regression. The Garden emitter work (1,781 emitters) is real chronic
  debt but is not this.
- **Not discovery**: all five acquisition sources fell within 2 points of each
  other (−54% to −57%) including Friends, which no algorithm controls.
  `RFYQualifiedPTR` stayed flat — never demoted.
- **Chronic problem underneath**: 56% of players churn at **Rebirth1**. Everyone
  who survives it retains 89–92%/step. That's the "weak initial hook".
- The game is **event-driven**: admin-abuse giveaways produce a constant ~21–27K
  CCU spike, but the pre-event floor fell 14,009 → 7,097 (−49%) across four
  Saturdays. Attention machine intact, retention loop absent.
- Roblox's own monthly report says DAU "−1% WoW, in line with historical
  patterns". **That's an artifact** of comparing against the Jul 20–22 crash
  week. Same window start-to-end: DAU −43%, revenue −54%.

**The question for Nina: what was in v546?** Analytics can't answer that —
no API exposes a diff.

---

## 6. Next steps

> Updated 2026-08-08 after the correctness overhaul (`CORRECTNESS_PLAN.md`).
> The numbers below were produced by the **pre-fix** pipeline. The conclusion
> about v546 rests on retention, session length and funnel completion — all
> rate metrics on unbroken-down series, none of which the D1/D2/D4 defects
> touched — so it still stands. Re-grab before extending it, though.

1. **Re-grab both universes** (`Jun 1 → Aug 7`). This is the open verification
   item: the perf/half-hour shapes and the async-polling fix have never been
   exercised live. Expect 9963622286's crash history to appear for the first
   time, with its ~1.06M peak.
2. **Read `place-versions.md`** — confirms v546's exact publish timestamp, and
   `summary.md`'s incident table now names the nearest publish itself.
3. **Read `errors.md`**, not `ErrorCount` by `ErrorMessage` — that dimension
   name was a guess that 400s. The real one is `MessageHash`, and errors are
   heavily concentrated (one signature is 52.3% of 12.4M events on
   9610561918). If a progress-loss bug shipped in v546, its signature should
   appear or spike on Jul 30 — which moves this from "v546 did it" to "*this
   line* did it". Hash→text needs the async dimensions lookup, which the
   re-grab now polls for.
4. **Read `annotations.md`** before blaming or exonerating Roblox. Both
   universes spiked 2026-07-31→08-01, which is Fri–Sat and fits a weekly-update
   pattern as readily as a platform event. The annotation feed is the authority;
   correlation is not.
5. Optional: a passive pass over Retention/Acquisition tabs to learn the correct
   `DailyCohortRetention` query shape.
