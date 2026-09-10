# `baseline/` — frozen "before" states

A baseline is a **reference point**: the state of a game at a named moment, frozen
so that every later claim about it can be measured against something rather than
argued about. Two kinds live here.

- **Update baselines** — one per publish, the grab the `update-watch` routine is
  built around. Without one, "did the update break it" is unanswerable, because
  every metric is being read against a version that is already gone.
- **Handover baselines** — the full-life diagnosis of a game newly taken on.

## Folder naming

    <UTC publish time>-<universeId>-<slug>-<version>

Publish time first, so repeat baselines for one game stack in chronological
order; version last, because that is what a producer asks about. The two
handover folders predate this convention and keep their original names.

## Index

| Baseline | Game | Universe | Kind |
|---|---|---|---|
| [`2026-08-28T2130Z-…-v908`](2026-08-28T2130Z-10638354731-seal-a-driveway-v908/BASELINE.md) | Seal A Driveway [RELEASE 🛢️] | `10638354731` | update |
| [`2026-08-28T2030Z-…-v1715-v1716`](2026-08-28T2030Z-10030829154-climb-waterslide-and-slide-v1715-v1716/BASELINE.md) | Climb Waterslide and Slide | `10030829154` | update |
| [`2026-08-28T1900Z-…-v678-v679`](2026-08-28T1900Z-10565445771-verity-companion-v678-v679/BASELINE.md) | Verity Companion [AI] | `10565445771` | update |
| [`2026-08-28T1500Z-…-v606-v607`](2026-08-28T1500Z-9963622286-become-a-brainrot-v606-v607/BASELINE.md) | [WORLD 3] Become a Brainrot | `9963622286` | update |
| [`2026-08-28T1400Z-…-v1244`](2026-08-28T1400Z-10399712766-banana-monkey-destruction-v1244/BASELINE.md) | [UPD] +1 Banana Monkey Destruction | `10399712766` | update |
| [`verity-companion-10565445771`](verity-companion-10565445771/BASELINE.md) | Verity Companion [AI] | `10565445771` | handover, 2026-08-26 |
| [`seal-a-driveway-10638354731`](seal-a-driveway-10638354731/BASELINE.md) | Seal A Driveway | `10638354731` | handover, 2026-08-26 |

**Five games shipped inside eight hours on 2026-08-28**, and all five are
baselined. The three below were reported a day late and baselined on 08-29; the
two further down were baselined the same afternoon.

---

## Update baselines — the 2026-08-28 evening batch, frozen 2026-08-29

Three publishes inside 2.5 hours, on the three games that had none of the
existing watch coverage. **All three were reported after the fact**, so all three
are frozen at **2026-08-27** — the last UTC day that closed before any of them —
and each is labelled with how far after the publish it was taken.

| Game | Version | Published (UTC) | Baseline is | State it ships into |
|---|---|---|---|---|
| **Verity Companion [AI]** | v678 → **v679** | 2026-08-28 **19:00–19:30** | T+15h | **Steep reach-led decline** since the 08-23 peak. DAU −62.5% w/w — but ARPDAU has risen three days running |
| **Climb Waterslide and Slide** | v1715 → **v1716** | 2026-08-28 **20:30–21:00** | T+14h | **Deep decline that began 08-23**, five days before the publish. DAU −66.1% w/w while **D1 holds at 13.70%** |
| **Seal A Driveway** | **v908** | 2026-08-28 **21:00–21:30** | T+13h | **A violent scale-up.** DAU +364% w/w, revenue +225%, PCU at an all-time high — every *rate* falling purely from dilution |

**None of these three builds can be judged on DAU, CCU or revenue.** Two are
falling for reasons that predate the publish by five days; the third is diluting
because the algorithm quadrupled its audience. Retention, funnel step rates,
errors per player and the monetization *rates* are what test them.

**All three publishes were double-checked for adoption and all three are at
100% on the new build** by the morning of 08-29 — so reads from 08-29 onward are
clean. Two of the three (Verity, Waterslide) shipped a version that was
superseded within one half-hour bucket (v678, v1715); those builds' error events
must be excluded from any post-update read.

**Nothing is broken on the evidence available at T+13–15h.** Errors per
concurrent player, on matched elapsed slots against the mean of the two
pre-update days: Verity **−0.9%**, Seal **+1.8%**, Waterslide **−4.7%**.

### Post-update read, 2026-08-29 ~14:20 UTC — one live defect, one already fixed

Dashboard error exports arrived a few hours after these baselines were written
and changed two of the three verdicts. Each is written up in the game's own
`BASELINE.md` under *Post-update read*.

| Game | Tripwire | Result |
|---|---|---|
| **Verity** | new signature on v679 | **FIRED.** `MysticLibraryService:144: attempt to call missing method 'FireAllClients' of table` — first seen 20:10 on 08-28, 40 min after the publish, largest signature in the export, and **still rising** |
| **Waterslide** | new signature on v1715/v1716 | **FIRED on v1715, CLEAR on v1716.** `MuFa is not a valid member of Folder ReplicatedStorage.Model` (9,129) + four `Egg model not found` warnings — **v1716 was a hotfix and it worked** |
| **Seal** | new signature on v908 | **CLEAR.** 539 events introduced, 0.0075% of the day. But the export surfaced a *pre-existing* core-loop warning: `[DrivewaySealer] Sealing is disabled: this place cannot use the Editable Image/Mesh APIs` |

**The test that separated the live defect from the fixed one** is `ErrorCount`
filtered to `FirstSeenPlaceVersion >= <new version>` at `OneDay` — the documented
"errors this deploy introduced" shape:

| | 08-28 | 08-29 | reading |
|---|---|---|---|
| Verity, `>= 678` | 2,069 | **4,018** | rising — **live defect** |
| Waterslide, `>= 1715` | 9,826 | **174** | −98% — **fixed by the next publish** |
| Seal, `>= 908` | 25 | 539 | negligible — clear |

**A deploy artefact decays across the day boundary; a live defect does not.** An
error export alone cannot make this call, because *First seen version* dates a
signature's first appearance and not the only build it fires on. **Always pair
the export with this filter.**

One coverage gap turned real: Waterslide's undiscovered seventh place,
`128451475320872` (*Omatsuri*), went **0 → 6,172 → 44,288** errors across
08-27/28/29 and is the only place on that universe rising while every other falls.

### Post-update read, 2026-08-30 ~17:00 UTC — T+2d, all four graded

Full Open Cloud re-grab of all four live-update games (Brainrot not re-read this
pass). Each game's own `BASELINE.md` carries the scored tripwire table under
*Post-update read — 2026-08-30 T+2d*. Report:
[Four Updates at T+2d](https://claude.ai/code/artifact/beff0382-c871-4ebb-a665-fe1611a674e6).

| Game | Worst status | The reading |
|---|---|---|
| **Verity** | **FIX** | `MysticLibraryService:144` unchanged — deploy-introduced errors **2,069 → 7,244**, no decay. Everything else clear; DAU reversed to ~618,500 and votes turned positive |
| **Seal** | WATCH | Tripwire 5 **fired** (errors/CCU 1,786.5 vs 1,550) but v908 introduced 416 of 8.6M events and the rise is bursty, not a step. DevProduct share 5.3% → **8.7%** on an 87%-pre-update day |
| **Waterslide** | WATCH | Cleanest. v1715 hotfix confirmed (9,826 → 379), all 15 tutorial steps recovered, the 08-27 CPU spike resolved as a one-day event |
| **Monkey** | WATCH | Recovery held — 08-29 projects to ~287,700, above the pre-update peak. v1244-introduced errors rising at 100% adoption (30 → 128 → 1,308) |

**All four builds are at 100% adoption.** Gates on the day: `npm test` 44/44 ·
`npm run audit-plan` 140 templates, 0 failures · `npm run verify` 23/2/8.

**A correction this pass produced, and it applies to every baseline in the
batch.** All five say monetization, session length and DAU are *"first readable
08-29 / 08-30"*. **They are not.** Behavioural metrics lag ~2 days, so on 08-30
the newest served day for DAU, revenue, payers, ARPDAU, CVR and session length is
**08-28** — a publish day on all four. **The first clean behavioural day is
08-29 and it lands 08-31.** The technical rung and the funnels *are* settled for
08-29, which is enough to answer "did we break it".

**Reading DAU inside the lag.** `UniqueUsersWithPlaySessions` is served for 08-29
and tracks DAU at **0.995–1.003 ± 0.006–0.011** across the four games, so it
projects DAU to about ±1%. Every 08-29 DAU figure in these reads is that
projection and is labelled as one. New tool: `tools/post-update.js`.

**New tools from this pass** — all read Open Cloud directly, never the corpus
half-hour rows (F18): `tools/post-update.js` (the settled daily table + every
metric's newest two days), `tools/errors-per-ccu.js` (the matched-slot
errors-per-player tripwire; reproduces the frozen 168.3 as 168.5),
`tools/deploy-errors.js` (`FirstSeenPlaceVersion >=` for all four),
`tools/funnels-post.js`, `tools/halfhour-profile.js` (spike vs step),
`tools/post-extras.js` (per-place errors, `RevenueSource`, version adoption).

**One open defect in the grabber itself.** `web/src/lib/opencloud-run.ts:77`
returns the corpus place list early whenever one exists, so `fetchPlaces()` is
never called again and a place added after the first grab can never enter the
plan. That is why Waterslide's **Omatsuri** `128451475320872` — now the
fifth-largest error source on that universe (0 → 6,172 → 86,850 → 72,219) —
still has no per-place shape. The fix is a union, not a short-circuit. Not
applied.


### What each folder holds

Same layout as the 08-28 batch below, plus `ccu-baseline-2026-08-29.txt`.
Waterslide additionally carries `errors-at-grab.md` (it is the only one of the
three with error signatures in the corpus).

### How these were measured

Open Cloud, window `2026-08-01 → 2026-08-30`, run 2026-08-29 10:50–11:18 UTC.
The start is 28 days back because **perf metrics 400 the whole family if the
start precedes the 28-day retention horizon**.

- Verity: 128 requested, **107 returned data**, 16 empty, 5 failed, 39 skipped.
- Seal: 128 requested, **101 returned data**, 22 empty, 5 failed, 39 skipped.
- Waterslide: 129 requested, **118 returned data**, 6 empty, 5 failed, 39 skipped.
- **All 15 failures across the three games are inferred `PlaceVersion` breakdowns**
  on metrics that do not support that dimension. **Zero failures on observed or
  proven shapes.**

Gates, measured on the day: `npm test` **44/44** · `npm run audit-plan`
**140 templates, 0 failures** · `npm run verify` **23 pass / 2 fail / 8 skip,
exit 1** (both fails the documented `KNOWN_OPEN` pair).

### Two things this pass measured that were not known before

1. **The newest day of `FunnelCohortCompletionRate` is unstable, and by enough to
   swamp the tripwire.** Pulling the same dates twice, three days apart: every
   date four or more days old moved by **less than ±0.6 pp**, while the
   then-newest day moved by up to **−5.5 pp** (Verity `First Reply Received`
   55.0 → 49.5). Direction differs by game — Verity's shallow steps read *high*
   and settle down, Seal's and Waterslide's read ~1–4 pp *low* and settle up.
   **Never fire a funnel tripwire on a day less than two days old**, and treat
   anything under four days as provisional. Every pre-update mean in this batch
   excludes the newest day for exactly this reason.
2. **The 2026-08-27 client-CPU spike hit two games and missed three.** Waterslide
   went 10.5 → **33.0** (3.1×) and Brainrot 41.0 → **93.0** (2.3×) on the same
   day; Verity, Seal and Banana Monkey did not move. That kills a clean "Roblox
   client release" story while leaving a real shared cause unexplained — and it
   means Waterslide's baseline CPU value is contaminated and must not be the
   number v1716 is measured against. This also answers question 3 of the Brainrot
   baseline: it was not that game alone.

### What is not in these three baselines

1. **Error message TEXT — the same gap as the 08-28 batch, and it needs a
   person.** Every game's newest dashboard export predates the build that was
   live *before* this update: Verity's stops at v615 (live build was v664), Seal's
   at v884 (v901), Waterslide's at v1711. **Without a fresh export per game the
   "new signature on this version" tripwire cannot be evaluated at all.**
2. **A true pre-publish grab.** All three updates were already live when they were
   reported.
3. **Confirmation of what shipped.** Verity and Seal have a 28.08 spec but no
   changelog, and the specs may describe upcoming rather than shipped work;
   Waterslide has no spec at all. Each report states the hypothesis it is testing
   and does not treat it as fact.
4. **Waterslide's seventh place.** `develop.roblox.com` lists seven places for
   `10030829154`; the grab discovered six — `128451475320872` (*Omatsuri*) was
   not among them, so no per-place error or perf shape was constructed for it.

### Regenerating

```bash
cd web && npm run dev
curl -X POST localhost:3000/api/grab-opencloud -H 'content-type: application/json' \
  -d '{"universe":"10565445771","start":"2026-08-01T00:00:00Z","end":"2026-08-30T00:00:00Z"}'
npm run ccu-baseline -- 10565445771 --slots 00:00-11:00
npm run platform-ccu
cd .. && node tools/build-baseline.js 10565445771 baseline/<folder> 2026-08-27
node tools/deploy-log.js 10565445771 74542317333958 baseline/<folder>/deploy-log.md \
  "Verity Companion [AI]" 2026-08-01T00:00:00Z 2026-08-30T00:00:00Z
```

Place ids: Verity `74542317333958` · Seal `120014184236770` · Waterslide root
`139617346573330`. `endTime` must be **tomorrow 00:00 UTC** to include today, and
no later — `PeakConcurrentPlayers` fabricates a carried-forward row beyond that.

---

## Update baselines — the 2026-08-28 afternoon batch, frozen the same day

Two updates published within an hour of each other, both baselined the same
afternoon.

| Game | Version | Published (UTC) | State it ships into |
|---|---|---|---|
| **Become a Brainrot** | v606 → **v607** | 2026-08-28 15:00–15:30 | Reach-led decline, two weeks old. DAU −36% w/w, revenue −52% — **while D1 retention rises to 14.50%**. CCU flat at the bottom of its range, not still falling |
| **Banana Monkey Destruction** | **v1244** | 2026-08-28 14:00–14:30 | **A recovery in progress.** DAU, PCU, revenue and payers all up three days running off an 08-26 floor; ARPDAU +23% w/w |

**Both games' baselines say the same thing in different directions: do not judge
these builds on DAU or CCU.** Brainrot's will fall whatever v607 does, and
Monkey's was already rising before v1244 landed. Retention, session length,
funnel step rates and the error load are what actually test a build.

Each folder holds:

| File | What it is |
|---|---|
| `BASELINE.md` | The report — bottom line, all metrics before, tripwires, errors, watchlist |
| `series/metric-table.md` | Every metric with a settled headline daily series, latest value, 7-day delta |
| `series/headline-daily.csv` | The settled points themselves — `ONE_DAY` only, `FILLED_ZERO` and `partial` dropped, so every row is quotable as-is |
| `series/metric-table.json` | The same table, machine-readable, for the post-update diff |
| `funnels-pre-update.md` | Step names, volumes, completion and churn, plus the per-step daily rates the tripwires are set against |
| `deploy-log.md` | Version → first-seen, daily and at half-hour resolution. This is what dates the publish |
| `ccu-baseline-2026-08-28.txt` | Matched time-of-day CCU against the game's own history |
| `summary-at-grab.md`, `grab-report.md`, `data-quality.md` | The corpus files frozen at grab time — every attempt, every skip, every disputed point |

### How these were measured

Open Cloud analytics API, window `2026-07-31 → 2026-08-29`, run 2026-08-28
15:25–15:41 UTC. The start is 28 days back because **perf metrics 400 the whole
family if the start precedes the 28-day retention horizon** — they do not clamp.

- Brainrot: 198 planned, 159 sent, **148 returned data**, 6 empty, 5 failed, 39 skipped.
- Monkey: 183 planned, 144 sent, **135 returned data**, 4 empty, 5 failed, 39 skipped.
- **All 10 failures across both games are inferred `PlaceVersion` breakdowns** on
  metrics that do not support that dimension. **Zero failures on observed or
  proven shapes** — nothing here is missing data about either game.
- The 39 skips per game are annotations, genre benchmarks, the `develop.roblox.com`
  deploy log and player reviews, none of which Open Cloud serves. They are
  reported, not silent.

Gates, measured on the day and not copied: `npm test` **44/44** ·
`npm run audit-plan` **140 templates, 0 failures** · `npm run verify` **23 pass /
2 fail / 8 skip**, both fails the documented held ones.

### Three traps this pass walked into, recorded so the next one does not

1. **`ccu-baseline` scores slots that have not happened yet as zero.** The first
   Brainrot run swept 00:00–23:00 and reported today at 848 CCU, −64.7%.
   Restricted to elapsed slots it is 1,246 and −40.9%. **Pass `--slots` bounded
   by the current UTC time when reading a part-day.**
2. **An async query that has not finished is indistinguishable from a game with
   no data.** The first deploy-log run returned **0 versions** and would have
   filed an empty table as fact; the identical rerun returned 25. The first funnel
   run reported "0 steps" for both games — both in fact have full funnels (20
   steps and 3). `tools/deploy-log.js` and `tools/funnels.js` now retry an empty
   answer three times, and the deploy log **refuses to write** rather than file an
   empty one.
3. **A pre-registered threshold must not include the in-progress day.** The funnel
   7-day means are computed over complete days only; today is shown for continuity
   and excluded from the mean.

### Regenerating

```bash
cd web && npm run dev                        # required: the grab runs in the app
curl -X POST localhost:3000/api/grab-opencloud -H 'content-type: application/json' \
  -d '{"universe":"9963622286","start":"2026-07-31T00:00:00Z","end":"2026-08-29T00:00:00Z"}'
npm run ccu-baseline -- 9963622286 --slots 00:00-15:30
cd .. && node tools/build-baseline.js 9963622286 baseline/<folder> 2026-08-27
node tools/deploy-log.js 9963622286 99255447043899 baseline/<folder>/deploy-log.md "[WORLD 3] Become a Brainrot"
node tools/funnels.js /tmp/funnels-raw.json
```

`endTime` must be **tomorrow 00:00 UTC** to include today, and no later —
`PeakConcurrentPlayers` fabricates a carried-forward row beyond that.

### What is not in these baselines

1. **Error message TEXT — the significant gap, and it needs a person.** The
   `MessageHash` lookup 500s and Open Cloud serves no text, so the only route to a
   message body is a Creator Dashboard export. Brainrot's last one is four builds
   old (`errors_2026-08-24_1831_v600.csv`); **Banana Monkey has never had one
   filed at all.** Without a T+2h export per game, the "new signature on this
   version" tripwire cannot be evaluated.
2. **Annotations, genre benchmarks, player reviews, the `develop.roblox.com`
   deploy log** — not served by Open Cloud; `saved-versions` additionally 401s
   without a session cookie. Run the browser grab when a Roblox-side event needs
   cross-referencing.
3. **A true pre-publish grab.** Both updates were already live when they were
   reported, so both baselines are frozen at **2026-08-27**, the last day that
   closed before either publish. That is valid — no post-update player is inside
   any number — but neither holds a clean partial-day shape for 08-28 itself.
4. **Single-funnel completion rates.** With no working `FunnelName` filter, steps
   come back merged across funnels by index. Names, volumes and daily trends are
   sound; a merged completion rate is a blend and must not be quoted as one
   funnel's.

---

## Handover baseline — 2026-08-26

Full-life LiveOps diagnosis of the two games handed to Indigo on 2026-08-26.

| Game | Universe | Born | Public launch | State on 2026-08-26 |
|---|---|---|---|---|
| [Verity Companion \[AI\]](verity-companion-10565445771/BASELINE.md) | `10565445771` | 2026-07-25 | **2026-08-04** | **Past peak, in active decline** — CCU −49.6% vs its own last 7 days |
| [Seal A Driveway](seal-a-driveway-10638354731/BASELINE.md) | `10638354731` | 2026-08-05 | **2026-08-12** | **At its all-time high** — CCU rank 1 of 14 |

They are different genres (Adventure/Story vs Simulation) with different
playbooks, and are diagnosed independently. The only place one is used to explain
the other is a single discrimination test, flagged where it appears.

Published as pages, for handing to a producer:

- **Verity Companion** — <https://claude.ai/code/artifact/9195610a-0284-46d0-a0fb-6d6f8726b3b1>
- **Seal A Driveway** — <https://claude.ai/code/artifact/66d91d26-7fa6-46f3-a9ae-6651fe889fc7>

Sources are `report.html` in each folder; republish from those paths to update in
place and keep the URLs.

### How that pass was measured

Open Cloud, full life for each game, pulled 2026-08-26 14:00–15:00 UTC. Both
games' lifetimes fall inside every Roblox retention horizon, so — unusually — the
technical rung is complete from birth rather than truncated.

- Verity: window `2026-07-25 → 2026-08-27`, 198 requests, 107 metrics with data.
- Seal: window `2026-08-05 → 2026-08-27`, 159 requests, 95 metrics with data.
- Both **single-place universes**, so the F12 sub-place truncation trap does not
  apply and the `Place` filter is unambiguous.

### Limits on that pass

1. ~~Funnels~~ — **RESOLVED.** Both games have full Funnels pages: **9 funnels on
   Verity**, **4 on Seal**. The earlier "no funnels" claim was two mistakes
   stacked: funnel queries answer **HTTP 202 async** and the probes never polled,
   and a **`FunnelName` filter returns 0 series always**, even for a name read
   straight off the dashboard. Working shape: `breakdown:["FunnelStep"]`, no
   `FunnelName` filter, with polling. F22 in `COVERAGE.md`.
2. ~~Error message TEXT~~ — **RESOLVED for those two games.** Exports were filed
   2026-08-26 and changed both diagnoses: Seal's largest signature is a dead
   `ContextActionService` binding at 10.5M events (85% of its error volume), and
   Verity's is `Generated dialogue was rejected by filtering` at 512,734 — its
   core loop failing.
3. **D30 is not meaningful yet** — Verity was 32 days old and Seal 21.
4. **The last one or two retention points always read low** (~2-day settle).

### The grabber defect that pass exposed, now fixed

For a universe whose dashboard was never opened, `perfSpecs()` and
`halfHourSpecs()` returned `[]` because no places had been discovered — so the
**entire technical rung plus `PeakConcurrentPlayers` were never requested at
all.** Not failed, not skipped: absent, and therefore absent from the grab report
too, which reads exactly like a game that never crashed. Verity's first grab
issued 71 requests with zero perf shapes; after the fix, 198. `lastDiscovered()`
in `web/src/lib/opencloud-run.ts` now fetches the place list, which is a plain
unauthenticated GET. F21 in `data/verify/COVERAGE.md`.

---

**Nothing in this directory is on a schedule.** Only `10399712766` Banana Monkey
appears in `data/dashboard-config.json` with `intervalHours: 1`, and
`schedulerEnabled` is **false**, so in practice no grab and no alerting covers any
of the five games baselined here. Every publish in this directory was found after
the fact, by a person being told. That is the standing gap the whole
`update-watch` routine exists to close, and it is now five games wide.
