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
npm run verify -- ../data/verify/9610561918/   # 23 pass · 2 fail · 8 skip, EXITS 1
npm run audit-plan                             # 140 templates, 0 failures
npm test                                       # 44 pass
```

*(Counts re-measured 2026-08-23. They previously read "1 fail · 9 skip" and
"30 pass" here, both stale.)*

The **two** expected `verify` failures are the documented disputed hour of
realtime revenue and the `ErrorCount` half-hour bucket at the export window's
own edge, both tracked in the test's `KNOWN_OPEN` set. **They make `verify`
exit 1**,
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

## 3b. The second grab path — Open Cloud, unattended (added 2026-08-19)

There are now two ways to grab, and CLAUDE.md carries the full comparison. The
short version for picking one up cold:

```
BROWSER (manual)                    OPEN CLOUD (scheduled)
chrome.alarms -> tab                src/lib/scheduler.ts, a timer in the app
your session cookie                 web/.opencloud-key
everything                          metrics only (39 requests skipped, reported)
needs Chrome + login                needs `npm run dev`
```

Run it by hand: the game modal's **Grab via Open Cloud** button, or
`POST /api/grab-opencloud {"universe":"<id>"}`. State: `GET /api/scheduler`
and `data/scheduler-state.json`. Turn a game on with the `dailyGrab` /
`intervalHours` chips — those settings now drive something, which they did not
before. Stop everything with `RBX_SCHEDULER=off`.

**A grab takes ~6 minutes per game** (135 requests paced at 2200ms) and the
budget is per KEY, so the two paths are serialized through one queue in
`opencloud-run.ts`. Running them concurrently was measured taking 39 of 135
requests as 429 — recorded as failed metrics, i.e. as a game with no data.

**Alerting** posts to the Discord webhook after a scheduled grab, only when a
metric is outside its own weekday baseline. `npm run notify-test -- <id>`
previews without sending. See CLAUDE.md for why it is quiet by default and why
`DailyRevenue` is not watched.

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

**ANSWERED 2026-08-21 — what was in v546.** More brainrots rolled out with
**`collision = true`**, plus **data-wipe bugs**. Confirmed by the producer, who
plays the game. Analytics could never have produced this (no API exposes a
diff), which is exactly why it sat open — and why it is written down here
rather than re-derived. **Do not re-open this.** The v546 date, the funnel step
it broke and the retention fall are all settled; what remains is what to ship.

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
- ~~**THE STRUCTURAL FINDING — biggest lever in the game.** `PlayerProgression`
  step 4 is `Rebirth1`, churn **61.4%**, unchanged pre/post break (0.6144
  full-life vs 0.6137 post-break).~~ **WITHDRAWN 2026-08-10. The "unchanged"
  half was an aggregation artifact and the "structural" reading with it.** Both
  figures are `NONE`-granularity *window aggregates*; two windows agreeing means
  only that they averaged the same swing. The daily series
  (`FunnelCohortCompletionRate`, `FunnelStep: Rebirth1`, 94 days from
  2026-05-08) shows completion **24–33% in May–June → 44–48% across July →
  34–37% now**. The gate nearly doubled in effectiveness and then partly
  reverted. It does not sit still, and today is *better* than May and June.
  Churn still collapses after the first rebirth (61% → 28% → 10% → 7.5%
  lifetime), so the ladder shape stands; the "immovable structural gate" framing
  does not.
- ~~**Fix order:** inventory `pcall` first, Rebirth1 gate second.~~
  **Withdrawn** — see *Disproved* in `.claude/SESSION_LOG.md` 2026-08-10. The
  `pcall` is not firing, and the rebirth requirement is not the constraint
  (producer cleared it twice in 5–10 min; modelled at 16m40 naive / 5–10 min
  informed). Current best fix order is **funnel instrumentation → extend the
  tutorial through the first rebirth → only then touch the number.**

### Re-diagnosed again 2026-08-10 (evening) — the 8-day detection gap is the story

Source read of the **dev place `115476892057345`** over the roblox-studio MCP
(live place is `99255447043899`), plus a 7→10 Aug grab and three dashboard
exports. Supersedes the "structural gate" framing above.

- **The 30 July break has a precise shape: everything after the tutorial
  dropped, nothing inside it moved.** `OnboardingComplete` / `FirstUpgrade` /
  `FirstMorph` flat at 99–100% across the break; `BaseUpgrade2` −4.9pp,
  `BaseUpgrade3` −7.0pp, `BaseUpgrade5` −7.8pp, `Rebirth1` −10.3pp (29 Jul → 2
  Aug), damage compounding down the chain. D1 16.8% → 9.72% same day. **Cause
  KNOWN (producer, 2026-08-21): v546 rolled out more brainrots with
  `collision = true`, plus data-wipe bugs.** Both fit the signature — a
  colliding NPC blocks the treadmill lane that earns rebirth currency, and a
  wipe destroys the progress already made toward it.
- **The 7 Aug fix (v575–577, 17:14 UTC) worked.** All four pre-fix days
  (34.72/35.14/34.79/34.61) sit below all three post-fix days
  (37.18/39.57/36.54) on `Rebirth1`; survives the returning-share control at
  **+3.9pp, 3.6 sd**. D1 9.72% (2 Aug) → 12.44% (7 Aug), up 5 of 6 days.
- **Eight days with nobody watching, and that is the finding.** Deploys went out
  3 Aug (v569) and 4 Aug (v574) and the metric did not move (34.72 → 35.14 →
  34.79 → 34.61). The 7 Aug deploy moved it +5.0pp in 24h. Downvote rate 13.4%
  → 21.8% → **28.1% on 7 Aug** → 10.2% on 9 Aug. Cost of the gap, baselined on
  25–29 Jul mean R$239,761/day: **~R$700k, ~R$650k after 15%/mo decay ≈
  $2,275–2,450 USD**, plus reach damage running to late August.
- **Volume has not recovered and will not for weeks.** PCU same-weekday WoW:
  −62% (5 Aug), −61% (7 Aug), −47% (9 Aug); daily trough deepening 2,539 →
  1,842 → 1,315 across 7–9 Aug. Rates lead, reach lags on the 28-day window.
  Do **not** cite the 8 Aug uptick, it is the weekly giveaway.
- **Time to first rebirth, modelled from shipped constants:** training ticks
  1/s at `speedGain × multiplier`, tap bonus `×2` on a 2.5s cooldown. Default
  treadmill (5/s, free) = **16m40 naive**, 9m16 tapping; Neon (10/s, 1,500) =
  8m20; PurpleCrystal (35/s, 10,000) = 2m23. 10 stands at ~7 cash/s each in the
  Basic zone pay for the upgrades in parallel. Producer clears it in **5–10 min**
  twice. Mean session is **9.7 min** — the first rebirth costs roughly one whole
  average session, so it only fits if you already know the loop.
- **The funnel cannot see any of that.** `MAIN_STEPS` is OnboardingComplete /
  FirstUpgrade / FirstMorph / Rebirth1–4; the entire treadmill loop sits in the
  uninstrumented 99.3% → 39.6% gap. `funnelSessionId` is a hardcoded constant
  (`"MainProgression"`), so every player has one lifelong funnel session.
  **Highest-value cheap fix: add steps between FirstMorph and Rebirth1.**
- **Data loss is real and the mechanism is NOT found.** Player comments 14–27
  Jul repeatedly and specifically report inventory loss. Two proposed causes are
  dead (see the log's *Disproved*). Open question for the studio: *can two
  brainrots ever share a UID?* — the save dedupes on it at `OnPlayerAdded:554`
  and drops silently.

### World 3 update (`v586`/`v587`) — tracked live 2026-08-15

First update tracked under Nina's new mandate (ship, then watch for hours).
`v586` published **2026-08-14 20:13 UTC**, `v587` at **20:20**; `v588`–`v590`
followed **2026-08-15 11:28–14:17**. Two grabs (11:24 and 18:19 UTC on the
15th) plus two dashboard error exports. Delivered as
`Brainrot - World 3 update check (15 Aug).docx` in the repo root.

**Pre/post, 13 Aug vs 14 Aug** (the update owned only the last 3.8h of the
14th, so this understates it): DAU 123,316 → **180,466** (+46.3%), revenue
R$73,107 → **102,274** (+39.9%), session 9.66 → 10.10 min, PCU 1,940 → 3,140.
Client errors 6,795,121 → 11,197,283; server 425,293 → 684,499.
**Unexplained:** +46% DAU in under 4 hours of exposure is more than the update
can account for. Something else ran that day. → find it before crediting v587.

**2026-08-15 is unusable as a post baseline** — an admin event took PCU to
**14,932** (vs 1,940 on the 13th). Volume ratios are meaningless against a
peak-PCU denominator on a spike day. The first clean day is **2026-08-16**.
The one rate that survives: `ClientCrashRate15m` **1.53% → 1.87% → 3.68%**
(13th/14th/15th) — more than doubled, still climbing, and a 15k-concurrent
event strains servers on its own, so it is a watch item and not yet a finding.

**Eight issues, all first seen on `V587`+.** Volumes at the 18:17 UTC export.
Four of them are **one bug class: new content shipped without the entry another
system looks it up by** (see the skill's §5c).

| Issue | Events | Where | Impact |
|---|---|---|---|
| Upgrade does nothing | 2,281 | `AnimalModule:547` via `OnPlayerAdded:1392` | `TraitMultiplier[trait]` nil kills a safe default set 6 lines above. Throws **before** the cash deduct at 1401, so no money lost — the button is just dead. **Arrived with `v588`–`v590`.** |
| Purchase prompt never fires | 1,844 | `OnPlayerAdded:1778` | Data says `Conetto Morsetto`, folder holds **`Conetto Mosteretto`** (verified in Studio). Inside `InteractStand.OnServerEvent` (opens 1684), **not** the join thread, so it kills only line 1793's `PromptProductPurchase`. Costs revenue; one word. |
| Fuse preview empty | 36,297 | `FuseClient:149` | 147/148 guard for nil, 149 passes it in anyway. Throws before `SetModel` at 156; `updateUI:253` has no pcall so the refresh dies too. |
| Fuse save refused | 12,874 | `FuseModule:718` | **Mostly the guard working** — 362/538/612 check the return and roll back (cash restored, tombstones dropped, player notified). Gap: `PlayerRemoving:815` ignores the return, then 819 drops the state anyway. |
| Limited stock lies | 2,010 | `LimitedTreadmill` load | DataStore **rate limit** on one shared key. Failure path only warns, so the replicated value stays at its init of `LIMITED_TREADMILL_MAX_STOCK` = 1000. Purchase does its own `UpdateAsync` with `if data.stock <= 0`, so **no overselling**. |
| Trail never turns off | 1,561 | `OnPlayerAdded:4466` | `if player.Character` checked at 4460, then `task.wait(300)` and re-read unguarded. Timed cosmetic becomes permanent. |
| Odds UI skips new rarities | ~339k each | `OddsController` | Genesis / Anomaly / Stellar absent from the rarity table. Warnings only. |
| Guard stays awake | 445 | `GuardClient:307` | See §5c — the `task.spawn` at 320 escapes the `pcall` at 300. |

**Open:** (1) `v588`–`v590` fixed neither one-liner — Conetto 1,049 → 1,844 and
FuseClient 20,269 → 36,297 in under six hours; the export can't split counts by
version, so this is "kept accumulating", not "still firing on v590". → confirm
off a fresh export after a fix ships. (2) The +46% DAU attribution. (3) Whether
crash rate holds above 2% on the 16th with normal traffic.

### Brainrot re-read 2026-08-16 (grab 09:36Z, 15 Jul → 17 Aug, place at v590)

**The 22 vs 30 July discrimination, settled.** The first forced model swap
dipped one day and recovered completely; the second one never did. This is the
evidence that the call made at the time ("the models are not the issue") was
correct on the data then available.

| | 19 Jul | 22 Jul swap | 25 Jul | 30 Jul `v546` | 2 Aug |
|---|---|---|---|---|---|
| DAU | 855,710 | 361,151 | **776,393** | 625,437 | 492,074 |
| `ForwardD1Retention` | 15.1% | 16.4% | 16.5% | 14.26% | **9.72%** |
| Session length | 12.4 min | 10.9 min | 12.3 min | 11.66 | 10.59 |

D1 was 16.77% on 29 Jul and fell every day to 2 Aug. Session length broke the
same day and still sits ~10 min. Revenue R$239,898 (29 Jul) → R$59,319 (12 Aug).

**The wipe guard is holding, with a number.** `OnPlayerAdded:530-538`
`performSaveData` refuses to write unless `sessionLoadCompleted` *and*
`sessionSaveAllowed` are true — `[PlayerData] BLOCKED SAVE because this session
did not load safely`, **4,229 events in 7 days**, first seen V582. Phrase as
"saves refused", not "wipes prevented".

**World 3 cost the low end its sessions.** OOM exits 610–746/day → 1,385 (14th)
→ **5,213 (15th)**; client memory +21%; `ClientFpsP10` −23% and still falling;
`ClientCrashRate15m` 0.89% → 3.60%. `ServerFrameRateP10` flat 59.6–59.7 all
through. Content weight, not a defect. 16 Aug is partial so its counts are a floor.

**Two one-liners still live at v590** (so `v588`–`v590` did not fix them):
`OnPlayerAdded:1778` `Conetto Morsetto` vs the folder's `Conetto Mosteretto`,
**3,030 events and climbing** (was 1,844), purchase prompt never fires; and
`AnimalModule:547`, **4,303 events**, `multiplier` nil because L543 guards
`~= ""` and nil passes — upgrade button silently dead, no cash taken, no data
written back (thread dies at `OnPlayerAdded:1392` before the save). The correct
pattern is 40 lines above at L498/L506.

**Dropped as out of scope 2026-08-16** (verified, then dropped as visual): the
odds screen omits 19 of 139 animals across five rarity tiers absent from
`OddsControl`'s hardcoded 15-entry table, and those 19 are the top 15 by
MoneyPerSecond (94.7% of roster earning power); `FuseClient:149` LoadAnimation
on nil, 53,800 events, same `ActualName` typo; `Vanish` VFX missing, 2,927,
cosmetic.

**Open:** the 14 Aug +46.3% DAU on 3.8h exposure is still unattributed.
`FuseModule.saveState:718` DataStore flush failures now 19,905 (was 12,874),
benign but growing — likely capacity on a shared key.

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

#### Knife Farm 2026-08-16 — payer conversion has halved and the cause is NOT identified

Grab 13:15Z, 1 month, merged over the series back to April. Place read at
**v3829**.

**The claim that survives is matched-DAU:** at ~36K DAU on 1–3 Aug the game
converted **561 / 634 / 669** payers; at ~34K DAU on 13–15 Aug, **276 / 265 /
291**. ARPPU is flat and normal (R$127 → R$107, band R$89–140). DevProduct
−66% and GamePass −66% together. `PayingUsersCVR` ends at 0.78–0.85%, **below
anything in the preceding two months** (previous floor 1.02%, 16 Jun).

**Ruled out:** platform (fell on all four), acquisition mix (stable),
new-vs-returning mix (56.3% returning on 3 Aug vs 56.0–57.3% on 13–15 Aug, with
matching new-user volume), spend depth, one broken product. Also ruled out by
date: `ADMIN ABUSE` (15 Aug 17:00–18:00Z, three days after), `StellarQuest`
(13 Aug 09:00Z, after most of the fall, and its tasks push crate buying up),
Windows engine 734 (12 Aug 16:00Z, mid-decline). Event-fatigue is unsupported on
timing — August roughly doubled the free-value cadence and added three new event
types, but the steepest part of the fall precedes the first of them.

**Retract if you see it repeated:** an earlier read in this session called a
one-day step on 12 Aug. That was a denominator artifact — payers 355 → 356 flat
while DAU rose 24%. The decline is gradual across ~10 days.

**`StellarQuest` contaminates retention 13 → 23 Aug** (`REQUIRED_DAYS = 7`).
D1 rose 14.45% (7 Aug) → ~19–20% from 10 Aug, which is *before* the quest and
therefore real; everything after 13 Aug is not comparable. Given this game's
whole diagnosis is structural retention, do not let a D7 rise read as a fix.

**Blocked by F12:** `place-versions.md` tops out at **v3747, 10 May**, while live
is **V3829** — the root place's `saved-versions` 500'd. So "what shipped between
3 and 13 Aug" is unanswerable from the repo, and that is the largest place a
cause could still be hiding. **Fixing the deploy log is the next action here.**

**Code:** `MainModule` grants the case at L798, then runs ~15 unguarded
`BadgeService:UserHasBadgeAsync` calls (L810–936), then fires
`GameEvents.CaseSpawn:FireClient` at L940. `UserHasBadgeAsync: Internal error`
3,069 at :897 + 1,796 at :905, first seen 13–14 Aug V3829. The case is **not
lost** (798 already ran); the client notification is. Only the rare rarities run
the badge chain, so the failure lands exclusively on the good moments.

### Waterslide (`10030829154`) — pre-update baseline, measured 2026-08-14

Fourth universe, first grabbed **2026-08-14T17:43:53Z** (30 days, 2026-07-15 →
2026-08-13 settled). Six places; root is `139617346573330`. Purpose of the grab
is a **pre/post comparison for the update that shipped the same afternoon**, so
this section is the *before* half — read it with §"What broken looks like".

**The update: root place `V1698`, sub-places published 17:29:41 → 17:30:55 UTC.
The grab ran 13 minutes later, so this bundle holds ~zero post-update data.**
Previous live build was `V1691` (8 Aug 10:45 UTC, the "NEW WORLD" event).

**`place-versions.*` is missing the root place — the `saved-versions` call for
`139617346573330` 500'd** (`grab-report.md` → *Failed — inferred shapes*), so the
file tops out at `v437` on a sub-place while the root is at `v1698`. Root-place
publish dates were reconstructed from `feedback.csv`'s `asset_version` column:
v1679 (→24 Jul) · v1681 (24 Jul) · v1683 (28 Jul) · v1685 (31 Jul) · v1691
(8 Aug) · v1698 (14 Aug). Each lines up with a sub-place publish the same hour.

**The window is one viral run, peaking 2 August.** DAU 177K (15 Jul) → **688K
(2 Aug)** → 220K (13 Aug); impressions 3.97M → 11.45M → 4.50M. Every raw Δ in
`summary.md` is measuring the back half of that spike. The correct frame is that
the game came out **structurally bigger**: DAU +24% and daily revenue R$83.6K →
R$107.2K (+28%, ≈$11.3K/mo at DevEx) versus mid-July.

- **Reach — withdrawn, and Charts is gone.** Home-rec impressions 10.35M (2 Aug)
  → 3.86M (−63%). **Charts impressions 84,474 (3 Aug) → 605 (−99.3%)**, dead
  since ~4 Aug. Search untouched (135K → 119K). `npm run lead-lag -- 10030829154`
  MA7 first-diff peaks at **0d, r=0.47** — appeal and reach moved together,
  neither leads. `EndToEndCVR` trend −0.195 pp/wk but **ends above where it
  started** (3.97% → 4.36%, mean 4.91%): mean reversion after the push, not
  appeal decay.
- **Hook — the one finding that is not the spike.** D1 mean **15.81%
  (15–28 Jul) → 13.80% (29 Jul–12 Aug)**, −2.0pp, 15 consecutive days below
  baseline (sign test p≈3e-5). It fell on **every acquisition source including
  Friends (19.8→18.1%) and Search (15.5→13.3%)** and on every platform equally,
  which kills the "low-intent viral traffic" explanation. Corroborated by
  `AveragePlayTimeMinutesPerDAU` 25.2 → 20.7 min (−18%) and session length −9%
  for new *and* returning alike. **Two candidates remain and this window cannot
  separate them**: the 31 Jul–2 Aug crash wave, and a content/economy change.
- **Return loop.** D7 0.86–1.2%, below peer cohort — the familiar portfolio
  shape (D1 fine, D7 dead), same as Knife Farm. Bounce <60s is **7.4%** and 48%
  of sessions run 10+ min (`TotalSessionsEndedInBucket`, one NONE aggregate over
  the window — level only, no trend).
- **Money — clean, and the cleanest rung here.** ARPDAU R$0.472 → R$0.488,
  ARPPU R$18.60 → R$19.01, payer CVR 2.54% → 2.57%, all flat across the whole
  window *including* the spike. Revenue falls purely with DAU. Nothing to fix.
- **Technical — rate flat, two real signals.** `ClientCrashRate15m` sat at
  0.343–0.397% for 30 days. But: **(a) every publish day spikes server errors
  20–50×** — baseline 70–215K/day, then 07-24 → 5.04M, 07-28 → 5.85M, 07-31 →
  2.03M, 08-08 → 2.84M; **4 deploy days in the window, 4 spikes, no non-deploy
  day spikes**, back to baseline the next day each time. **(b) 483,029
  `ServerCrashCount CrashType: Runtime` over 31 Jul–2 Aug** (peak 299,187 on
  1 Aug) that **cleared with no deploy in between** (last publish 31 Jul 18:25,
  next 8 Aug) — which exonerates the deploy. Third universe to crash in that
  window; RCC v732 landed 27–28 Jul. Association, not proof.
- **12 August is a one-day reach crater, not a product event.** DAU 147,770 —
  the lowest of the window, below the pre-push floor — impressions −58%, payers
  −49%, visits −45%, while session length, playtime/DAU and CVR all rose.
  Wed-on-Wed −54% vs 5 Aug; partial recovery 13 Aug. Nothing of ours shipped.
  Windows player engine 734 rolled out 16:00 UTC that day, RCC 734 the day
  before — association only. The cross-game check is **unusable**: Brainrot's
  11 Aug is `FILLED_ZERO`. **Watch for a repeat.**
- **Feedback is the loudest pre-update signal.** Downvote rate by version
  (`down/(up+down)`): 43.1% (v1679) → 37.0% → 18.2% → **14.7% (v1685) → 46.7%
  (v1691)**. 5/34 → 7/15, z≈2.40, p≈0.016 — small n but significant, and it
  moved before any retention metric. The v1691 comments name mechanisms:
  *"I just spent over 100 robux and my game got reset"*, *"my panda pet
  gone????"*, *"Money function is bugged and not updating after a slide"*,
  *"no me deja comprar ni una balsa"*.
- **A save-loss path is confirmed in code text, volume unknown.**
  `data/verify/10030829154/Errors and warnings by count, 1 day to 2026-08-14,
  V1691.csv`: `[SaveLoadDataMgr] SavePlayerData failed: <userId>
  ReplicatedStorage.ToolScripts.CopyTableScript:5: invalid argument #1 to
  'pairs' (table expected, got nil)` (6+5 events, 13 Aug) and `[PlayerData] Load
  failed … READ_FAILED`. **Those counts are a floor, not a total** — the userId
  is inside the message, so each affected player gets its own signature row and
  the export caps at ~26 rows. Against that, server errors per DAU are flat
  (0.33–0.50 all window, **no step at v1691**), so this is a tail, not a mass
  event — but a tail that permanently destroys saves.

**What broken looks like on the post-update grab** (diff against these):

| Signal | Pre-update (v1691) | Broken if |
|---|---|---|
| D1, settled (~2d lag) | 13.80% mean since 29 Jul | < 12.5% for 2+ settled days |
| `AverageSessionLengthMinutes` | 15.1 min | < 14 min |
| `ClientCrashRate15m` | 0.36% | > 0.5% |
| `ErrorCount` LogSource: Server | 70–215K/day baseline | **still > 1M on 15 Aug** (the publish spike must clear in one day) |
| `PetBag:484 index nil with 'Get'` | 3 events, first 13 min on v1698 | any real volume |
| Downvote rate | 46.7% on v1691 | > 50% on v1698 |
| ARPDAU | R$0.49 | **any** move — it has not moved in 30 days |

**Open, needs someone who plays the game** (§5b of the skill — never publish a
level judgement that has not survived one):

1. The `X2 EVENT!` annotation started **16:00:59 UTC and ended 17:00:59 UTC on
   14 Aug** — one hour, against 7 days for the July X2. Reschedule around the
   publish, or did a week-long event run for an hour?
2. Is "money not updating after a slide" a known bug or an intended rebalance?
   It is the only named mechanism that would explain playtime/DAU −18%.

#### Waterslide post-update, 2026-08-16 — healthy, every gate passed

Grab 12:21Z, place read at **v1702** (4 publishes past the baseline). Diffed
against the "what broken looks like" table above:

| Signal | Broken if | Actual | |
|---|---|---|---|
| D1, settled | < 12.5% for 2+ days | 14.73 / 14.27 / 14.12% | pass, above the 13.80% baseline |
| Session length | < 14 min | 15.10–15.47 | pass |
| `ClientCrashRate15m` | > 0.5% | 0.361 → 0.351 → 0.292% | pass |
| `ErrorCount` Server | > 1M on 15 Aug | 96,314 / 127,000 | pass, inside 70–215K |
| `PetBag:484` | any volume | absent | pass |
| ARPDAU | any move | R$0.482 → R$0.444 | dilution, see below |

DAU 219,574 → 256,677 → **295,154**; revenue R$107,236 → R$123,686 → R$131,194.
ARPDAU's move is explained: `PayingUsersCVR` **rose** to 2.76% (from 2.55%),
payers 6,537 → 8,145, ARPPU R$18.92 → R$16.11. More payers each spending less on
a day DAU rose 15%.

**Two absences worth as much as the passes.** (1) **No publish-day error spike** —
the baseline documented 4 of 4 publishes spiking server errors 20–50× (up to
5.85M); `v1698` produced 96,314, flat. Ask the studio what changed in the publish
path. (2) **No memory or OOM step** (OOM 372/517 against a 289–441 baseline,
client memory flat 1.09–1.13 GB), the direct contrast with Brainrot's World 3.

**Still open:** downvote rate by version needs the dashboard User ratings export;
the API grab carries only a `Total` series with no up/down breakdown.

**The save-loss volume question from the baseline is answered, but not the way it
was asked.** The unfiltered 7-day export **does not contain** the baseline's
`[SaveLoadDataMgr] SavePlayerData failed: <userId> … CopyTableScript:5`
signature at all. What it does carry is `CopyTableScript:5` at **4,565 events**
on a *different* stack (`GamePassMgr:57 GetData` → `PlayerData:353 ToDictionary`
→ `PlayerService:201 Update` → `ServerInit:97`), which is the client-sync path
above, not a save. Two readings and this export cannot separate them: the
SaveLoadDataMgr path stopped firing, or it is below the ~26-row cap. **Do not
report the save-loss path as resolved.** Re-pull with a narrower filter to settle it.

**Code, functional only:**
- `GamePassMgr:57 GetData` → `DeepCopy(self.pass)`, `pairs(nil)` when `GetData`
  beats `Init`. Reached from `PlayerData:356` ← `PlayerService.Update:201` ←
  `ServerInit:97`, an unprotected registry loop in a Heartbeat. Skips every
  service after it that tick, repeats at 10 Hz (`sendMsgCd = 0.1`) because
  `isChanged` is cleared after the throwing call. **4,565 events, a floor.**
  `IsHavePass:41` already guards the same field.
- `Tutorial:262` indexes `shared["Char"].HumanoidRootPart` directly, which throws
  on respawn before parts replicate. Aborts the `tutorialKeys` loop, so remaining
  steps never update and `OnTutorialCompleted` never fires. **9,473 events, first
  seen 24 Jul.** L88's guard is written as the same direct index, so it throws too.
  **Not date-matched to the D1 drop** (24 Jul vs 29 Jul); a candidate, not a cause.
- `WorldService.RequestTeleportWorld` has no debounce before
  `TeleportService:Teleport`, 549,959 events. **Does not double-charge** — the
  unlock block is gated by `table.find(unlockWorlds, worldId)` at L37. Low severity.
- Teleport errors are universe-wide across 6 places; only the root was open.

### Waterslide post-update incident — read from LIVE source, 2026-08-23

Producer reported "critical state, tutorial broken on phone, CCU 4k against 10k".
Read the live root place `139617346573330` at **v1708** over MCP. Report:
`https://claude.ai/code/artifact/f8cad0f1-da1f-4577-a57d-066a2a4115cb`.

**Root cause under most of it.** Client `PlayerService.Awake()` assigns
`shared["PlayerData"]` at **line 13**. **81 unguarded `shared["PlayerData"].Get()`
call sites across 42 scripts** (vs 16 guarded). Anything opening before `Awake()`
finishes throws *"attempt to index nil with 'Get'"*. Slower devices lose the race
more often — that is the phone/tablet skew, not a rendering bug. Fix is one stub
in the client bootstrap, not 81 patches.

**Six defects, all confirmed present in v1708 (none fixed as of 18:05 UTC):**

1. **`GoShop_Raft` 601–609 — the scroll bug.** `while scroll.CanvasPosition.Y ~=
   calcPos do … end`. `calcPos` derives from `AbsolutePosition.Y` (screen space)
   assigned into `CanvasPosition` (canvas space), and Roblox **clamps** the write,
   so float equality never holds. **Infinite loop**, overwriting the player's
   scroll every 0.2s. `ClearTutorial()` does not cancel it and `OnTabChanged`
   spawns another at 637, so they stack. **Emits no error, ever.**
2. **`GoShop_Raft` 102 — empty raft list.** Throws at line 488, twelve lines
   before the tile loop at 500, so no tile is created; also before `clearList()`
   at 497, so a stale list freezes. **77 hits on v1708** in ~5h.
3. **`GoShop_Raft` 570 — `isOwnedRaft(2, …)`.** Only Purple Raft Id 2 satisfies
   tutorial step 5. Own any other raft and you are stuck permanently. Matches two
   player reports verbatim ("already bought a raft", "another raft").
4. **`PlayerService` 53 — silent data loss.** `if not data then return end`
   leaves `serviceInit` false forever, so `PlayerData.Init` never runs and
   `OnUpdatePlayerData` blocks in an **unbounded** `while not serviceInit`. Player
   sees an empty profile. 5 × `SavePlayerData 502` today, no retry behind it.
5. **`Convert` 274 — `FindFirstChild(nil)`.** Raises "Argument 1 missing or nil"
   *before* its own `or … "Common"` fallback can run. Line 275 also shadows
   `color` with a second `local` and clones without a nil check.
6. **Raft `UIGridLayout`** — `CellSize.X = 0.33` × `FillDirectionMaxCells = 4`
   = **132% of frame width**; with `ScrollingDirection = Y` the 4th column is
   unreachable. Plus chronic throttling: MemoryStore `RequestThrottled` 430,428 ·
   Teleport 69,788 · DataStore `KeyThrottled` 15,783.

**What v1708 actually changed:** `GoShop_Raft` grew 8 lines since v1705 (crash
trace moved `OnOpen` 611 → 619, `RefreshList` still 102). It now carries
`task.spawn(ctrl.CheckTutorial)` at 623/637 — CheckTutorial was made async so it
would not block `OnOpen`'s tween. Real fix for a logged symptom; leaves the loop,
and non-blocking arguably makes the loops **easier** to stack.

**Confirmed / refuted on the numbers:**
- **Refuted — "all-time low".** Today 5,331 (partial, still climbing); 28-day low
  is 3,457 on 08-12.
- **Refuted — "Saturday was terrible".** Sat 08-22 = 7,557, **2nd of the last 4
  Saturdays, +27% above the Saturday median** (5,949).
- **Confirmed — today is soft.** Hour-matched vs Sun 08-16: −25.9% at
  peak-in-window; gap widened to ~−37% by 10:30 then **plateaued** (−35.9% at
  16:00).
- **Confirmed — decline predates the deploy.** Starts 08-19 (−1.6%, −6.5%),
  *then* steepens after v1705 (−5.2%, −21.8%, −35.8%). v1708 did not worsen it:
  today's afternoon slope −12.1% vs −14.1% on the prior Sunday.
- **Refuted — a retention collapse.** `ForwardD1Retention` flat at 0.128–0.158
  across 08-10 → 08-21; 08-21 (0.1500) is 2nd-highest in the window. Damage is on
  **new** players inside the tutorial, not the existing base.
- **Chronic, not a regression.** `Tutorial_Main_5_ToRaftShop` = **0.824
  pre-publish, 0.866 post**. Worst step in the funnel in both windows. Compound
  tutorial completion 50.5% → 47.4%, so **~half of new players never finish the
  tutorial and that was true before the incident.** Steps 10 (BuyEgg) and 12
  (EquipPet) *did* regress (−2.9pp, −2.4pp), matching defect 5.
- **Retracted (mine):** I first blamed per-tile rotation scripts for the scroll
  bug. `UIAnimUtils.BindLoopRotate` already uses one shared `RunService.Heartbeat`
  per animation kind with stale cleanup — the exact architecture I proposed as
  the fix. Killed by reading `UIAnimUtils`.
- `ShopTriggerMgr:51` (58s) and `EggOpen:460` (35s) long-runtime warnings are
  intentional `while task.wait()` polling loops. **Not defects.**

**Ship order given to the dev:** 4 (save guards) → 2 (the stub) → 5 (three
lines) today; 1 (scroll) and 3 (tutorial gate) next, shipped separately so each
is measurable. Defect 5 demoted — it did not fire at all on 08-23. Success
metric is **step-5 completion > 0.95**, not CCU, which will keep falling as the
08-18 discovery spike unwinds.

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

---

### Session 2026-08-24 — four-game diagnosis, and two of my own calls corrected

All four games were re-grabbed and diagnosed the same day. Full life was pulled
for the two that lacked it: **10030829154 went 40 → 118 days** and
**10399712766 30 → 53 days** (its whole life). Five artifacts published — the
URLs and the regeneration path are in the `liveops-reports-2026-08-24` memory,
and the generators are committed under `tools/reports/`.

**Two corrections to conclusions I published earlier the same day.** Both were
the same class of error — a defensible-looking baseline chosen without asking
whether it could answer the question. Both are now written into
`.claude/skills/liveops-diagnosis/SKILL.md` §0b as rules, because they will
recur otherwise.

1. **Never benchmark against a window minimum.** Waterslide's concurrents were
   called healthy because 2,993 sat above the 22-day low of 2,675. The 22-day
   *mean* was 5,453 and the prior week 7,476 — the day was −45% on typical.
   The same error graded 9963622286 "recovering, +21–54% WoW" against the
   lowest week in its series. Print four baselines and the day's rank.
2. **Reach cannot exonerate a deploy.** 9963622286's 30 July deploy was graded
   *partial* because impressions were already falling. Wrong instrument —
   reach is downstream of retention with a multi-week lag — and wrong
   magnitude: −4.7%/week before versus −53%/week after. Re-measured on daily
   retention and the mix-controlled funnel it is the **primary** cause, which
   is what `v546-cause-known` already said.

**9963622286 — v600 (24 Aug 14:00Z) is cleared.** It fixed the Stellar quest
crediting for players already at `MAX_BASE_UPGRADES = 30`. Concurrents fell all
afternoon and it is not the reason: same two clock times across all 15 days
held, today −29.3% against a −29.2% mean on nine non-publish days (sd 12.3pp,
z = −0.01), milder than v582 (−38%) and v587 (−33%). The day was already
38–48% down at 00:00–03:00, fourteen hours before the publish. Error rate flat
(~128K/h against v598's ~130K/h), no player report names it, and the producer
checked it in-game. **Every publish on this game spikes then decays — measure
against the distribution of publishes, never one control day.**

**10030829154 — eight defects read from live source at v1709.** Full write-up
in the published artifact. Two emit nothing at all and were found from the
funnel and the config rather than the log:
- `UI.GoShop_Raft:603-609` — the scroll loop. Three faults: averages a viewport
  coordinate with a canvas coordinate; `while` tests float equality against a
  value the engine **clamps**; and nothing cancels the thread (`OnClose` empty,
  spawned on every open *and* every tab change, so they stack).
- `ConfigData.Pet` — **10 of 162 rows missing both `Quality` and `CashBuff`**
  (Ids 52-57, 69-72; all `Limited_*`/`Code_*`/4203-4205). Missing `Quality`
  throws in `Convert:274`; missing `CashBuff` silently pays 0. And
  `PetBagMgr.RefreshFollowPets` calls `ClearAllChildren()` *then* rebuilds with
  no `pcall`, so one bad pet deletes every pet after it in the list.
- `SaveLoadDataMgr.SavePlayerData:67-112` — ~20 unguarded expressions in one
  table literal inside one `pcall`. Any throw skips the `SetAsync` entirely:
  silent total save loss.
- `ServerInit:88-100` — Heartbeat iterates both module registries with no
  `pcall` at any level.
- The 430K `MemoryStoreService: RequestThrottled` signature is **not** the game
  loop: it is `Tool.Notification.ExperienceNotificationBatchProcessor` hammering
  a single shared SortedMap key from every server.

**Still unexplained, and it is the most valuable open thread:** payer
conversion halved on **12 August** on both 9610561918 and 10399712766, no
publish either day. Ruled out: denominator (matched-DAU), platform (all four
fell), product type (DevProduct and GamePass together), composition, and a
Roblox-wide change (Waterslide's and Brainrot's attributed conversion *rose*
over the same days). Knife Farm's Gamebeast 403 does **not** explain it — first
seen 15 Aug 19:46Z, three days after. See the `aug-12-conversion-step` memory.

---

## Session 2026-08-25 — v1711 verified unfixed, Knife Farm's silent sell break, the portfolio curve

### Waterslide (`10030829154`) — the 23 Aug fix list was never applied

Read the **live root place `139617346573330` at v1711** over MCP, read-only.
**None of the six defects is fixed.** Two guards were added that address no
reported mechanism: `PlayerService:19` (`if not serviceInit then return end`,
protects only the reward call) and `Convert:273` (`if not QualityColor then
return end`, guards the container while the reported nil-*argument* throw at
274 and the shadowed blind clone at 275 both remain).

Exact patches published: **https://claude.ai/code/artifact/076be0a2-aadd-421a-b5a0-7f35ab150194**

| # | Defect | v1711 |
|---|---|---|
| 1 | `GoShop_Raft:605-609` `CanvasPosition` loop | present, verbatim |
| 2 | `GoShop_Raft:102` unguarded `PlayerData.Get()` | present |
| 3 | `GoShop_Raft:570,581` hardcoded raft Id 2 | present |
| 4 | `PlayerService:53` + unbounded wait at `:39` | present, verbatim |
| 5 | `Convert:274-275` | wrong half guarded |
| 6 | Grid 132% overflow | present, **and a 2nd instance** |

**New this session, not in the 23 Aug report:**
- **The loop cannot exit, and now we know exactly why.** `calcPos` is computed
  once from `AbsolutePosition.Y` (screen space) written into `CanvasPosition`
  (canvas space), which Roblox **clamps** — read-back never equals it.
  `ClearTutorial:543-550` destroys only finger UI and stores no thread handle,
  so it **cannot** cancel the loop, and `task.spawn(ctrl.CheckTutorial)` fires
  from *both* `OnOpen:623` and `OnNotify:637`. Copies stack and fight.
- **Defect 3's permanent stick is located.** `ctrl.tutorial.raftFrame` is
  assigned only at `:514`, inside `if item.Id == 2` (`:513`), inside the
  `isFirstBuild` branch of `RefreshList`. If raft 2 is not rendered, `:576`
  returns silently and step 5 **can never complete** — no finger, no error.
  Meanwhile `OnBuyBtnDown:237` already fires `Complete("toRaftShop","Main")`
  after *any* successful purchase, so the Id-2 test was never needed.
- **The root cause is one line, not 81.** `GameEnter.Start()` runs
  `InitMgr → InitController → InitUI → InitService`, and
  `shared["PlayerData"]` is assigned in `PlayerService.Awake()` — in that last
  group. Every Mgr/Ctrl/UI Awake runs before the table exists. Census: **89
  `.Get()` sites on the client, 65 unguarded across 33 modules; 102 including
  ReplicatedStorage. Zero chain `.Get().field`** — which is what makes a stub
  safe. Stub must return `GetPassBuff → 0` (not nil; callers do arithmetic),
  `IsHavePass → false`, `Get → nil`. `Online:121` reads `.InitData` as a
  *field* with a nil check — **not** a bug, checked.
- **`Tutorial_Main_5_ToRaftShop` 81.9%** (was 77–78% before 21 Aug; target
  0.95). `Tutorial_Main_10_BuyEgg` flat 63–68% all month, untouched.
- Error export filed `errors_2026-08-25_1732_v1711_147rows.csv`: **zero
  signatures first seen in V1711.** Confirms nothing new shipped *and* is not
  evidence the defects are gone — defect 1 is silent by construction.

### Knife Farm (`9610561918`) — v3831 broke the sell path, silently

Core loop is buy knives from a conveyor → place → sell → repeat. Three player
reports (one with a clip) say **selling fails, so cases cannot be bought
either** — the loop is fully broken for those players.

- **`v3831` published 2026-08-21 16:21:21Z, `is_published=true`** — the live
  version, matching the report. (`v3834` is live per `ErrorCount`/`PlaceVersion`
  but absent from `place-versions.csv` — F12 again.)
- **The break is silent.** Errors first-seen at version ≥3831: 116 / 4k / 308 /
  473 / 858 across 21–25 Aug ≈ **5,700 events, against the 2,022,535 v3831
  inherited.** No error export will find this.
- **How many players is NOT derivable from telemetry.** Three instruments, three
  failures: **zero funnels instrumented on this game at all**; `IsNewUser`
  returns nothing from 08-21 onward; `TotalSessionsEndedInBucket` degenerate
  (§0c). The failure *condition* in code is the only route — a numeric
  threshold or save-size limit would scale with progress and hit payers first,
  which fits the reports.
- **Do not claim v3831 caused the decline.** DAU was already falling from 08-19
  and payers ran 812 (06 Aug) → 236 (18 Aug) → 93 (24 Aug), well before it. The
  defensible claim: an already-declining game then had its core loop broken for
  its most established players.
- **Next: Studio connection to Knife Farm, read-only**, to find the failure
  condition. Ask the reporter what the clip shows (button dead? cash unchanged?
  prompt appears and fails?) — that narrows the search to one function.

### Banana Monkey (`10399712766`) — nothing broke; the appeal decayed

`ForwardD1Retention` filtered to **`AcquisitionSource = HomeRecommendation`**
(one source, so mix is controlled out): **27.5% (23 Jul) → 18.7% (31 Jul) →
13.7% (09 Aug) → 10.3% (23 Aug).** Continuous, monotonic, no step, no date.
Kills deploy, mix, technical and funnel-break explanations together. It was
*liked* at 27.5% — this is a thin loop revealing itself, not a defect.
**Only `FUNNEL_TYPE_ONBOARDING` is instrumented (3 usable steps, all 95–96%);
the rebirth loop is unmeasured.** Instrumenting it is the precondition for any
content decision here.
