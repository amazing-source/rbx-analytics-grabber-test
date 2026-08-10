# Handoff — state as of 2026-08-09

Written for picking this up on another machine. Read `CLAUDE.md` for the working
agreement and `README.md` for setup. This file is what's true *right now*: what
works, what's broken, what was found, and what to do next.

**For the running thread — what the last session did and what to do next —
read `.claude/SESSION_LOG.md` (newest entry first).** This file holds the
durable state; the log holds the sequence. Both are maintained by the
`checkpoint` skill.

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
npm run verify -- ../data/verify/9610561918/   # 23 pass · 1 fail · 9 skip, EXITS 1
npm run audit-plan                             # 140 templates, 0 failures
npm test                                       # 30 pass
```

The one expected `verify` failure is a documented disputed hour of realtime
revenue, tracked in the test's `KNOWN_OPEN` set. **It makes `verify` exit 1**,
so that gate is currently "green" by its printed counts, not by its exit code —
do not wire it into CI as a pass/fail without deciding that first
(measured 2026-08-09).

---

## 2. Blockers on a fresh machine

| Blocker | Detail |
|---|---|
| **Supabase project is gone** | `rdvtifctqucaqemrhnkd.supabase.co` no longer resolves in DNS. Every DB write fails. **This does not block the tool** — the file mirror in `data/` is written first and the ingest returns `savedToFiles: true`. To restore charts: new Supabase project, new URL/keys in `.env.local`, run `web/supabase/schema.sql`. |
| **`.env.local` not in git** | Deliberate — it held a live secret key. Copy from `.env.local.example`. Consider the old keys compromised and rotate. |
| ~~**Impressions metric returns 403**~~ | **Resolved — was stale.** `UniqueUsersWithImpressions` returns data on all three universes (27 / 37 / 27 points, checked 2026-08-09 in each `grab-report.md`). The QPTR proxies depend on it, so it matters that this line no longer says "denied". |

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

### Re-diagnosed 2026-08-10 — three causes, only one is the studio's

A grab covering 2026-08-07 → 08-10 (174 requests, 139 returned data) plus the
merged history. **The July 30 break still stands**; what is new is that the
current decline is its *reach* phase, not a second event.

| Phase | Daily revenue mean | Cause |
|---|---|---|
| Plateau, Jun 22 – Jul 8 | R$428,036 | — |
| Slide, Jul 9 – 20 | R$356,291 | **Platform.** No deploy behind it; matches the 15 June RFY re-weighting reaching full effect ~13 July |
| Model swap, Jul 21 – 26 | R$206,604 | Forced (`CREATOR_REGEX_CHANGE` annotation + deploys 514/516 on **Jul 22 — there is no Jul 21 deploy**) |
| Recovery, Jul 27 – 31 | R$239,722 | — |
| Deploy break, Aug 1 – 8 | R$136,167 | **Studio, preventable** |

- **Hook (the acute break).** D1 16.8% → trough **9.7% on Aug 2** → recovering to
  12.4% by Aug 7. Funnel damage is concentrated at **BaseUpgrade2 churn +62%
  (8.42% → 13.67%) and BaseUpgrade3 +49%**, decaying by step 5, while the *late*
  funnel improved. That is the signature of the unchecked-`pcall` inventory-load
  defect (P0, still unfixed): a player whose inventory fails to load stalls at
  the first upgrades. Veterans are unaffected.
- **Reach (why it is still falling).** Impressions 9.97M (Jul 31) → **4.31M
  (Aug 8), −57%**, still falling on the last held day. Downstream of the D1
  break on the documented 28-day signal window, so it keeps suppressing
  distribution to roughly **27 August** even if the code were fixed today.
- **Ruled out.** Crashes (1,060,617 peak Aug 1 → 0–6/day from Aug 3, decline ran
  past it). The Aug 3/4/7 deploys (573, 574, 575–577) — D1 was *rising* across
  them. Appeal: `EndToEndCVR` recovered to **6.33%** while impressions fell 57%,
  so thumbnail/title work is wasted effort.
- **THE STRUCTURAL FINDING — biggest lever in the game.** `PlayerProgression`
  step 4 is **`Rebirth1`**, and its churn is **61.4%**, unchanged pre/post break
  (0.6144 full-life vs 0.6137 post-break). Churn collapses once a player
  rebirths once: **61.4% → 28.0% → 10.4% → 7.5%**. That gate is why D7 ≈ 3% and
  D30 ≈ 1%, i.e. why every reach shock is permanent.
- **Fix order:** inventory `pcall` first (stops the bleed), Rebirth1 gate second
  (fixes why bleeding is fatal).

### Knife Farm (`9610561918`) — it is the return loop, not appeal

Producer: Nina. Asked 2026-08-10 whether the decline is "the algo or bugs".
**Neither.** Evidence, all from the merged 129-day record:

- **Still acquiring fine.** 2026-08-07: **13,209 new users, 36% of DAU**
  (`DailyActiveUsers` by `IsNewUser`). Roblox has not stopped delivering people.
- **The hook works.** D1 17–20%, above peer cohort. Session profile stable
  (median ~10 min; bounce <60s 7.6% → 8.7% via `TotalSessionsEndedInBucket`).
  `AveragePlayTimeMinutesPerDAU` flat ~22 min.
- **The loop does not.** D7 2.5% → 1.2%, D30 1.2% → 0.2%.
  **`RFYL7PlayDays` ≈ 1.4 and flat all year** — that is the ranking input, and
  the ceiling on distribution.
- **Structure explains it exactly.** The game has offline earnings and daily
  rewards (so D1 holds) but **no rebirth, only finite upgrades** (so D7/D30
  die). Confirmed by the producer 2026-08-10.
- **`UsersJoinedFromNotifications` is a cumulative lifetime counter** (129 days,
  strictly monotonic, zero decreases) reading **2,073 total** against 476M
  sessions. Experience Notifications is effectively switched off. *Verify in the
  dashboard before pitching it — single counter, not yet cross-checked.*
- **Do not** attribute this to the 15 June RFY change: Knife Farm's biggest
  collapse ran 31 May → 12 June (−81%), before that change existed.

## 6. Next steps

> Updated 2026-08-08 after the correctness overhaul (`CORRECTNESS_PLAN.md`).
> The numbers below were produced by the **pre-fix** pipeline. The conclusion
> about v546 rests on retention, session length and funnel completion — all
> rate metrics on unbroken-down series, none of which the D1/D2/D4 defects
> touched — so it still stands. Re-grab before extending it, though.

1. ~~**Re-grab both universes.**~~ **Done 2026-08-08** — this verification item
   is closed. 9963622286's crash history is now in `data/`
   (`ServerCrashCount` peak **1,060,617** on 2026-08-01), funnel discovery
   found `BaseUpgrades` + `PlayerProgression` + 20 steps, and returned-data
   counts rose to 127/156 and 155/186. The fresh data also disproved four of
   the audit's own findings — read **G1–G7 in `data/verify/COVERAGE.md`**
   before quoting anything from before that date.
2. **Read `place-versions.md`** — confirms v546's exact publish timestamp, and
   `summary.md`'s incident table now names the nearest publish itself.
3. **Read `errors.md`**, not `ErrorCount` by `ErrorMessage` — that dimension
   name was a guess that 400s. The real one is `MessageHash`, and errors are
   heavily concentrated (one signature is 52.3% of 12.4M events on
   9610561918). If a progress-loss bug shipped in v546, its signature should
   appear or spike on Jul 30 — which moves this from "v546 did it" to "*this
   line* did it". ~~Hash→text needs the async dimensions lookup, which the
   re-grab now polls for.~~ **Wrong on both counts, corrected 2026-08-10:** the
   grabber does NOT poll it, and the lookup returns HTTP 500 on both universes.
   **Closed as won't-fix** — the producer's judgement is that Roblox error
   volumes are near-meaningless (a signature firing 75M times is one benign call
   per player per session). Do not re-open it, and never cite missing error text
   as a limit on a diagnosis. See G7 in `COVERAGE.md`.
4. **Read `annotations.md`** before blaming or exonerating Roblox. Both
   universes spiked 2026-07-31→08-01, which is Fri–Sat and fits a weekly-update
   pattern as readily as a platform event. The annotation feed is the authority;
   correlation is not.
5. Optional: a passive pass over Retention/Acquisition tabs to learn the correct
   `DailyCohortRetention` query shape.
