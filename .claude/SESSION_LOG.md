# Session log

Newest entry first. Written by the `checkpoint` skill — see
`.claude/skills/checkpoint/SKILL.md` for the routing rules and entry template.

This file holds **the sequence**: where we stopped, what is open, what to do
next. `HANDOFF.md` holds the durable state, `CLAUDE.md` the standing rules, and
`.claude/skills/liveops-diagnosis/SKILL.md` the accumulated method. A finding
that lives only here is a finding that will be re-derived — route it.

Resuming? Read the newest entry, then **verify it against the gates before
trusting it**. Entries describe the moment they were written.

---

## 2026-08-28 — update baselines for two publishes; the async-empty trap is wider than F22 said

**State:** branch `grabber-correctness` · 70 ahead of `main` · **8 unpushed, still 6 BEHIND `origin/grabber-correctness`** — unchanged since 08-26, reconcile before pushing · dirty: 2 new `baseline/` folders, 3 new `tools/`, 2 raw bundles, 1 platform snapshot, `baseline/README.md`, 2 grab-report.json
**Gates** (measured now): verify **23 pass · 2 fail · 8 skip, exit 1** (both fails documented + held) · audit-plan **140 templates, 0 failures, exit 0** · test **44/44, exit 0**

**Landed:** update baselines for `9963622286` **v606→v607** (published 08-28 15:00–15:30 UTC) and `10399712766` **v1244** (14:00–14:30 UTC), in `baseline/<UTC publish>-<universe>-<slug>-<version>/`. Each holds the report, settled metric table + `headline-daily.csv`, funnels, deploy log, CCU baseline and the frozen corpus files. `baseline/README.md` rewritten as an index over both kinds of baseline. Second `platform-ccu` snapshot taken. Three reusable pullers added: `tools/deploy-log.js`, `tools/funnels.js`, `tools/build-baseline.js`.

**Learned → routed:**
- **An unfinished async query is indistinguishable from a game with no data, and it is NOT confined to funnels** — `ErrorCount`×`PlaceVersion` returned 0 versions then 25 on the identical rerun → **F23**, `CLAUDE.md` (extends the empty-200 standing rule), and guards in `tools/deploy-log.js` / `tools/funnels.js`
- **`ccu-baseline` counts not-yet-elapsed slots as zero** — 848/−64.7% vs 1,246/−40.9% on the same universe minutes apart → **F24**, `CLAUDE.md` Reading-CCU section
- **`FunnelUserStepCompletionRate` (step-to-step) and `FunnelCohortCompletionRate` (cumulative from step 1) have different denominators** — 99.11% vs 95.2% for one step → `liveops-diagnosis` SKILL.md funnel section
- **A pre-registered threshold must exclude the in-progress day**, and a post-publish grab must be labelled T+0 with its freeze date → `update-watch` SKILL.md
- Brainrot's two funnel cliffs (gates 4 and 8 = **62.9%** of all loss across 20 steps) and its `ClientCpuTimeAvg` 41→93 step on 08-27 → `HANDOFF.md` + `BASELINE.md`
- Board **up 7.5%** to 8,101,577 CCU while the portfolio was not → `CLAUDE.md`, `data/platform/`

**Disproved:**
- **`CLAUDE.md`'s "only elapsed slots are ever compared"** about `ccu-baseline` — false; with no `--slots` it swept 00:00–23:00 and scored eight unlived hours as zero, turning a −40.9% day into a −64.7% "collapse". Corrected in place. It selected the elapsed range unprompted for a *second* universe in the same run, so the behaviour is inconsistent rather than uniformly wrong.
- **F22's implied scope** — "funnel queries are async" was the narrow reading of a fault that hits any Open Cloud query under load, including the deploy log, where an empty answer looks like a plausible "no ships in this window" and would have been filed as fact.

**Open:**
- **8 commits unpushed and 6 behind `origin/grabber-correctness`** — carried over untouched from 2026-08-26 → reconcile, then push
- **Nothing here is committed**, including the platform snapshot — "an uncommitted snapshot is gone" → commit
- **Error TEXT for both games.** Brainrot's newest export is 4 builds old; **Banana Monkey has never had one** → export *Errors and warnings by count* per game at T+2h, filtered to the new version; without it the "new signature" tripwire is unevaluable on both
- **F24 is not fixed and not tested** → clamp the slot list to the last elapsed boundary when the day is today, in `web/scripts/ccu-baseline.ts`, and encode it
- **Brainrot `ClientCpuTimeAvg` 93 vs a 37–50 band** — one settled day only → re-read 08-29: still ~93 means a real regression predating v607
- Both 08-28 updates are **unread post-publish** → full grab after the UTC day rolls, 2026-08-29
- Seal payer CVR read (due 08-28/29) and Verity reach read (due 08-29) from the 08-26 entry — **both still not done**
- `9963622286` `ServerCrashCount` returns empty 200s across the whole window at every granularity → verify against the dashboard rather than reading it as zero

**Next:** commit this session, then on 2026-08-29 run the post-update grab for both universes and mark the pre-registered tripwires OK/WATCH/FIX/NO DATA.
## 2026-08-26 — two new games baselined from birth; funnels finally cracked; the fresh-universe perf hole closed

**State:** branch `grabber-correctness` · 69 ahead of `main` · **7 unpushed, and 6 BEHIND `origin/grabber-correctness`** — reconcile before pushing · clean
**Gates** (measured now): verify **23 pass · 2 fail · 8 skip, exit 1** (both fails documented + held) · audit-plan **140 templates, 0 failures, exit 0** · test **44/44, exit 0**

**Landed:** full-life baselines for `10565445771` Verity Companion [AI] and `10638354731` Seal A Driveway, in a new tracked `baseline/` folder (settled series, deploy logs from `ErrorCount`×`PlaceVersion`, CCU baselines, funnels, error text, two published reports). Both error exports filed to `data/exports/` and registered. Commit `90c394b`.

**Learned → routed:**
- **How to pull funnels** — `breakdown:["FunnelStep"]`, POLLED, and never a `FunnelName` filter → recipe at the top of **`SKILL.md` §1**, summary in **`CLAUDE.md`**, **F22** rewritten, memory `how-to-pull-funnels`
- A fresh universe got **no technical rung at all** — `perfSpecs()`/`halfHourSpecs()` return `[]` with no discovered places, and places were only ever inherited from a prior grab → fixed in `opencloud-run.ts` (fetches `develop.roblox.com/.../places`), **F21**
- Perf metrics **400 the whole family** if `startTime` precedes the 28-day horizon; they do not clamp, and the error names the floor → `CLAUDE.md`
- Both games' full lives sit inside every retention horizon, so the technical rung is complete from birth — a first → `baseline/README.md`

**Disproved (mine, same session):**
- **"Funnels are unreachable on Open Cloud / the instrument is degenerate"** — written into F22 and CLAUDE.md at ~15:00, false by ~17:30. Two faults stacked: funnel queries answer **HTTP 202 async and my probes never polled** (one also dropped the `analytics-query-api/` prefix from the poll URL), and the **`FunnelName` filter returns 0 series always, even for a real name**. Verity has 9 funnels, Seal 4. `Platform`/`IsNewUser` filters work fine — `FunnelName` alone is broken.
- **`SKILL.md`'s "filtering funnel metrics by `Platform` returns no series"** — Platform filters correctly (Computer ≈ 33% of each step, matching DAU share). Almost certainly the same unpolled 202, and it had misdirected three later investigations.
- **"24 Aug was platform-wide / late-August seasonality"** (memory `aug-24-portfolio-wide-drop`) — Seal **grew +8%/+8%** across exactly that window and set an all-time high on the 26th. Memory updated with the caveat that Seal was mid-surge.
- **Seal's "conversion broke on 24 Aug"** — caught before publishing: it lands on Mon/Tue after the three best days, and one week at this scale cannot separate a step from the weekly shape. Shipped as **unresolved** with a dated test.
- **`HANDOFF.md`'s "zero funnels on Knife Farm"** — re-tested with the working instrument and it **holds** (0 steps, against Waterslide 15 / Brainrot 20 / Monkey 3). Right claim, previously right for the wrong reason.

**Open:**
- **Verity's AI unit cost is unknown and it is the only game with a variable cost per player.** Revenue is $0.00136/DAU/day; if inference exceeds that, growth destroys value. → ask the studio before any growth spend
- **Seal payer CVR: read 2026-08-28/29.** Back to ~1.7–1.9% ⇒ weekly shape, nothing there. Still ~1.25% ⇒ real step worth ~$26–29k/mo
- **Verity reach: read 2026-08-29** (`UniqueUsersWithImpressions`, `RFYQualifiedPTR`) — settles demotion vs algorithmic reshuffle
- Seal's `ContextActionService` dead binding (10.5M events, 85% of its error volume) is only *likely* the cause of the 4× desktop crash rate → needs a read of the live place at v901
- Neither new game is in `data/dashboard-config.json` — **nothing is scheduled and no alerting covers either** → deliberate decision needed
- Player-comment exports for both games have never existed → pull from the dashboard
- `platform-ccu` still has one snapshot (2026-08-25) → schedule daily or §0c step 2 stays unanswerable

**Next:** reconcile the 6 commits behind `origin/grabber-correctness`, then push the 7 ahead.

## 2026-08-25 — CCU baselines rebuilt on matched slots; v1711 verified unfixed; four-game curve

**State:** branch `grabber-correctness` · 67 ahead of `main` · **5 unpushed** vs `origin/grabber-correctness` · dirty (`.gitignore`, `CLAUDE.md`, `COVERAGE.md`, `web/package.json`, + `data/platform/`, 2 new scripts, 1 new export)
**Gates** (measured now, not copied): verify **23 pass · 2 fail · 8 skip, exit 1** (both fails documented + held) · audit-plan **140 templates, 0 failures, exit 0** · test **44/44, exit 0**

**Landed:** `npm run ccu-baseline` (matched XX:00/XX:30 UTC slots, 4 baselines + rank + per-slot profile, reads Open Cloud not the CSVs) · `npm run platform-ccu` (public discovery board snapshot → `data/platform/`, committed via new `.gitignore` negation; first snapshot 269 games / 7,537,949 CCU) · Waterslide patch set published → `https://claude.ai/code/artifact/076be0a2-aadd-421a-b5a0-7f35ab150194`

**Learned → routed:**
- CCU-drop triage ladder + "what is readable on day 0" + degenerate-instrument rule → **SKILL.md §0c**
- Verification is the analyst's job; mechanism-vs-decision line → **SKILL.md §0d**
- Four-game cohort curve, D2 ceiling, RFY ≈ 2.0 bar → **SKILL.md §4**
- F18 corpus half-hour rows 77% fabricated · F19 PCU carry-forward at HalfHour · F20 Open Cloud serves HalfHour across all 28d → **COVERAGE.md**, summarised in **CLAUDE.md**
- `scoreSeries()` blind spot; both new tools → **CLAUDE.md**
- v1711 verification, Knife Farm v3831, Monkey appeal decay → **HANDOFF.md**

**Disproved (mine, same session):**
- "Late-August/school seasonality" — read off a **half-day** window. The complete 08-24 day is flat across the clock (Waterslide deepest −54% at 03:00 CEST, shallowest −29% at 20:00), and the three games disagree on which hours are worst.
- "Waterslide needs a rebirth loop / Monkey's loop is thin" — asserted **before** pulling `DailyCohortRetention`. The curve says the constraint is D1→D2 (43–49% hold on all four); loops hold D5+ and are irrelevant above that cliff.
- "A quiet `npm run anomaly` means CCU is fine" — it scored PCU z −0.10/−0.20/−1.70 on three games at or one off their 28-day floor.
- "The 23 Aug Waterslide fixes shipped" — code read at v1711 says none of six did.

**Open:**
- **Knife Farm sell path broken since v3831 (silent).** Affected-player count is not derivable — zero funnels, `IsNewUser` dark after 08-20, session buckets degenerate. → **needs read-only Studio on `9610561918`** to find the failure condition; ask the reporter what the clip shows.
- **Waterslide patches unapplied.** → hand the artifact to the dev; read `Tutorial_Main_5_ToRaftShop` (81.9%, target 0.95) two days after any publish.
- **Banana Monkey mid-game unmeasured.** → instrument a first-session funnel (8–12 steps) before any content decision; check whether a dev place exists (Waterslide's is universe `10100945543`).
- **`platform-ccu` has one snapshot.** → schedule daily or step 2 of §0c stays unanswerable.
- 12 Aug payer collapse on `9610561918` + `10399712766` — still unexplained.

**Next:** schedule `platform-ccu` daily, then read-only Studio on Knife Farm to locate the v3831 sell failure condition.

## 2026-08-24 — four-game LiveOps diagnosis; two of my own calls corrected; data/exports/ rescued from .gitignore

**State:** branch `grabber-correctness` · 66 ahead of `main` · unpushed · dirty (CLAUDE.md, HANDOFF.md, COVERAGE.md, SKILL.md, 4 grab-reports, new `data/exports/` + `tools/`)
**Gates:** verify 23 pass / 2 fail / 8 skip (**exit 1**, both fails documented + held) · audit-plan 140 templates, 0 failures (exit 0) · test 44/44 — measured today, not copied
**Landed:** all four games re-grabbed and diagnosed; full life pulled for 10030829154 (40→118d) and 10399712766 (30→53d); 40 dashboard downloads filed into `data/exports/<id>-<slug>/`; 5 artifacts published (URLs in the `liveops-reports-2026-08-24` memory, generators in `tools/reports/`)

**Learned → routed:**
- Never benchmark a level against the window **minimum**; print 4 baselines + the day's rank → `SKILL.md` §0b
- Reach cannot exonerate a deploy — wrong metric (downstream, lagged) and check magnitude (−4.7%/wk vs −53%/wk) → `SKILL.md` §0b
- Onboarding flat + progression falling = **core-loop** break, rules out traffic quality alone → `SKILL.md` §0b
- Test a publish against the **distribution of publishes**, not one control day → `SKILL.md` §0b
- `data/exports/` was untracked; error text is not API-retrievable (MessageHash lookup 500s on all 4) → **F17** in `COVERAGE.md` + `.gitignore` + `CLAUDE.md`
- Waterslide's 8 defects (v1709, read-only) and Brainrot v600 clearance → `HANDOFF.md`

**Disproved (mine, same day):**
- "Waterslide is fine, above its 22-day low" — the low was one day (2,675); the mean was 5,453 and last week 7,476. Day was −45% on typical.
- "Brainrot recovering, +21–54% WoW" — measured against 10–16 Aug, the **lowest week in the series**. Matched Sundays: −23%.
- "30 Jul deploy = partial cause, impressions were already falling" — impressions were *rising* on a 7-day mean the 4 days before it (+1.5/+1.6/+8.2/+2.8%). Verdict now **primary**: D1 16.8%→9.7% in 4 days, Rebirth1 −9.6pp at identical mix, 25/25 matched pairs negative, onboarding flat at 99.3%. Matches `v546-cause-known`, which I had on file and contradicted.
- "v600 slide is steeper than normal" — from 2 hand-picked controls. Against all 9 non-publish days: −29.3% vs −29.2% mean, z = −0.01.

**Open:**
- **12 Aug payer collapse on 9610561918 AND 10399712766**, no publish either day; denominator/platform/product/composition/Roblox-wide all ruled out → needs the 10399712766 error export (none has ever existed) and a read of the purchase path as at 11–12 Aug
- Knife Farm Gamebeast billing 403 (692,260 events since 15 Aug 19:46Z) → someone must open the Gamebeast dashboard; postdates the 12 Aug step so it is not that cause
- Knife Farm sell path reported broken since v3831 by a paying player → newest export is v3829, pull one at v3832
- 381-row Waterslide all-time export landed after the defect report was written → dedicated pass
- All four games −43% to −58% vs their own 22-day mean on 24 Aug; shape identical, spread 4× → needs one game outside the portfolio to settle seasonal vs not

**Next:** commit this branch (66 commits unpushed, and `data/exports/` is newly tracked — 2.4 MB of otherwise-unrecoverable error text), then the 12 Aug payer question on 10399712766 once an error export exists.

## 2026-08-23 — Waterslide: the costliest bug emitted zero log lines

**State:** branch `grabber-correctness` · 66 ahead of `main` · tracking
`origin/grabber-correctness` · dirty: `data/dashboard-config.json`, two
`grab-report.json`, untracked `data/raw/10030829154-2026-08-23T11-09-35-036Z.json`
**Gates:** verify 23 pass / **2 fail** / 8 skip (**exit 1**, both fails the
documented KNOWN_OPEN pair) · audit-plan 140 templates, 0 failures (exit 0) ·
`npm test` **44 pass** (exit 0) — all measured 2026-08-23.

**Landed:** no code changes. Diagnosis only, read from the LIVE root place
`139617346573330` v1708 over the Studio MCP. Deliverable is an artifact:
`https://claude.ai/code/artifact/f8cad0f1-da1f-4577-a57d-066a2a4115cb`.

**Learned → routed:**
- Silent defects: a bug in *working* code emits nothing, so never rank by error
  count; funnel step rates are the second entry point → **liveops-diagnosis §5c**
- Pre/post test for "regression vs chronic design defect"; funnel endpoint
  answers only some windows and the set changes between calls →
  **liveops-diagnosis §5d**
- Hour-match partial days; rank a day against its own weekday; check whether the
  decline predates the publish → **liveops-diagnosis §0b**
- Open Cloud `endTime` is **exclusive**; asking past today makes PCU carry its
  last value into a future date → **CLAUDE.md** + **COVERAGE.md F16**
- Every Waterslide defect, with file:line and the v1708 status →
  **HANDOFF.md §5 "Waterslide post-update incident"**

**Disproved (all mine except the last two):**
- *Per-tile rotation scripts starve the client, causing the scroll bug.*
  `UIAnimUtils.BindLoopRotate` already uses one shared `RunService.Heartbeat`
  per kind with stale cleanup — the exact fix I had proposed. Real cause is the
  `while … CanvasPosition ~= calcPos` loop at `GoShop_Raft:601-609`.
- *Tutorial step 5 has no ownership check.* It does (`CheckTutorial` 567-574) —
  it just hardcodes `isOwnedRaft(2, …)`, so any other raft leaves you stuck.
- *The tutorial break is new with the update.* Step 5 = 0.824 pre / 0.866 post.
  Chronic for weeks; the deploy only changed how many people hit it.
- *(user's) CCU is at an all-time low* — 28-day low is 3,457 on 08-12 vs 5,331
  today. *(user's) Saturday was terrible* — 08-22 was 2nd of 4 Saturdays, +27%
  above the Saturday median.

**Open:**
- **Did the dev ship any of the six?** None were present at 18:05 UTC 08-23.
  Next action: re-run the `GoShop_Raft` line-102/606/570 pattern scan over MCP.
- **Step 5 under v1708 is unmeasured** — the funnel endpoint went quiet for
  every window, including ones that answered twice earlier the same day. Next
  action: re-query `FunnelUserStepCompletionRate` for 08-23→08-24 tomorrow.
- **F16 has no regression test.** Two wanted: a PCU series repeating its last
  point on a future date collapses to one; `FILLED_ZERO` is never written for a
  date the API previously served. `DailyActiveUsers` 08-16/08-17 are stored as
  `0` against real 389,477 / 401,742 — this feeds `scoreSeries()`.
- **Gateway `endTime` inclusivity is inferred, not measured.** Measure before
  touching `alignWindow`.

**Next:** fix the `FILLED_ZERO` DAU corruption (it silently poisons the alerting
baseline), and encode both F16 tests — then re-check step 5 and the six defects.

## 2026-08-21 (light) — Waterslide update baseline frozen

**Mode:** `checkpoint light` — gates not re-run, they were measured earlier the
same day (verify 23/2/8 exit 1 - audit-plan 140/0 - test 44/44) and nothing
under `web/` changed since.
**State:** branch `grabber-correctness` - pushed - new raw bundle committed.
**Landed:** `baselines/` — a new top-level, committed folder for frozen
pre/post-update references. Sits outside `data/`s ignore rules on purpose.
`baselines/README.md` carries the contract; first entry is
`10030829154-2026-08-21-waterslide.md`.
**Read:** an update shipped on 10030829154 on 2026-08-21, **probably v1705**
(dimension discovery returned PlaceVersion 1705; feedback tops out at v1698 last
seen 08-20T23:44Z). `ErrorCount` `LogSource: Server` 08-21 = **3,029,260 and
still partial** against a 96K-182K/day week — ~17x, which is the publish
signature already documented for this universe (5.04M / 5.85M / 2.03M / 2.84M on
its four previous deploy days). **Not a finding unless still elevated on 08-22.**
Client errors tracking normal. Perf clean: crash rate 0.3-0.4%, FPS p10 ~33,
OOM ~1.6/1k DAU, server crashes 0-2.
**Game shape:** hard growth spike — DAU 256,677 (08-14) -> 491,464 (08-20),
revenue +202.9%, paying users +259.2%. Payer conversion **4.12%, top 10% of
peers**, while ARPPU R$16.03 is below median: breadth exceptional, depth weak.
Retention is the soft rung at every horizon (D1 13.4%, D7 0.95%, D30 0.18%).
**Open:** downvote rate roughly tripled v1685 (14.7%) -> v1691 (46.7%) / v1698
(43.6%), but DAU tripled over the same span so it is confounded. WATCH, not a
finding. n ~ 35 per version.
**Could not measure:** publish time to the minute (placeVersions 500 = F12; no
08-21 feedback rows; half-hour errors clamp at 08-21T00:00Z). Error text —
`MessageHash` dimensions **500** on this universe again, so volumes without text.
**Wake:** 2026-08-22 — re-grab 10030829154 and mark all 11 pre-registered
tripwires in the baseline OK/WATCH/FIX. The decisive number is `ErrorCount`
`LogSource: Server` on a settled 08-22: under 400K = the spike was the publish.
Also still due that date: the 10399712766 reach check and the F18 re-read.
**Next:** the 08-22 Waterslide follow-up, then Nina.
## 2026-08-21 — A CCU drop that was not the update, and three of my own claims retracted

**State:** branch `grabber-correctness` · 65 ahead of main · pushed · clean at
session start; this checkpoint touches `CLAUDE.md`, `COVERAGE.md`, the diagnosis
skill, the Banana Monkey baseline and this log.
**Gates:** verify 23 pass · 2 fail · 8 skip, **exit 1** (the documented
`KNOWN_OPEN` pair) · audit-plan 140 templates, 0 failures, **40 upgradable tags**
· test **44/44** — all measured 2026-08-21, not copied.
**Fixed stale doc:** `CLAUDE.md` START HERE said `npm test` → **41 pass**; it is
44 and has been since 2026-08-19. That block loads into every session.
**Landed:** no code changes. Session was read-only investigation plus routing.
**Learned → routed:**
- `EndToEndCVR` is inversely correlated with impressions (**r = −0.881**, 28d,
  10399712766), so a CVR trend alone is never an appeal signal; check paid
  sources before an ad-cliff theory; an acquisition landing on an RFY surge day
  distorts every later comparison → `liveops-diagnosis/SKILL.md` §4.
- Gateway served an impossible `ConcurrentPlayers` `ONE_HOUR` point
  (13,532.377 at 2026-08-21T15:00Z vs a 6,869 half-hour peak) → **F18** in
  `data/verify/COVERAGE.md`. Confirmed from raw entry 385, not our exporter.
- 10399712766 post-update read, publish timing, handover date → the
  `Banana Monkey Baseline 2026-08-21.md` post-update section.
**Disproved — all four mine, three in-session:**
1. "MenuHUD.Wheel locks out until you step off the pad" — false. `Touched`
   re-fires for an animated character, so SpinController:201 reopens it. I
   concluded it from lines 155–230 without reading the whole file.
2. "`openMenuFrame()` can bind the gamepad cursor to the wrong frame" —
   unreachable; every open path closes `activePopup` first, so only one popup
   is ever open. Should never have been reported under the repo's own
   materiality rule.
3. "`EventConfig.EventId` is stale, hence the 404s" — false. It matches the live
   `AURAS/INDEX + ADMIN ABUSE` event exactly; the annotation's
   `6858286705385014000` is `Number()` precision loss on `...014015`, in our own
   JSON parse.
4. "Our exporter injected the 13,532 point" — false, the gateway returned it.
**Open:**
- Why 08-21 sits at the plateau's low edge. **Next action: on 08-22 re-pull
  08-21 DAU and `UniqueUsersWithImpressions` by `AcquisitionSource`, check
  whether `HomeRecommendation` kept falling below 7.71M.**
- F18 has one observation and no re-read. **Re-read 2026-08-21T15:00Z after
  2026-08-22T00:00Z** and record whether the gateway self-corrects.
- `EventController`'s signup calls still fail for an unknown reason —
  `errors.md` has null text for all 899 hashes because the async MessageHash
  lookup never polls. Fixing that poll is what makes error text readable at all.
- 19-digit Roblox IDs lose precision through `JSON.parse` in our pipeline.
  Not yet a test. Would have caused a false finding if I had trusted it.
- 40 audit-plan templates tagged `proven` are actually `observed` — upgradable,
  not a failure, but the tags are drifting.
**Wake:** 2026-08-22 — (1) pull 08-21 DAU + `UniqueUsersWithImpressions` by
`AcquisitionSource` and check whether `HomeRecommendation` fell below 7.71M;
(2) re-read `ConcurrentPlayers` ONE_HOUR at 2026-08-21T15:00Z and record whether
the gateway corrected the F18 point. Neither is answerable before that date.
**Next:** send Nina the detailed 10399712766 writeup once 08-22 numbers settle,
leading with the reach reading and the baseline correction. Studio code reads
from today are in `data/games/10399712766/code-reads.md` (PlaceVersion 1241).

## 2026-08-21 — A CCU incident on a new game; my own read was wrong twice before the export settled it

**State:** branch `grabber-correctness` · merged origin (5 commits from the other
PC, incl. `notify.ts` / `scheduler.ts`) · dirty: `CLAUDE.md`, `HANDOFF.md`, `COVERAGE.md`,
`SKILL.md`, this log, 4 new `data/raw/` bundles, `data/games/10399712766/`
**Gates:** verify 23 pass/2 fail/8 skip (**exit 1**, documented `KNOWN_OPEN`) ·
audit-plan 140 templates/0 failures (**proven shapes 221**) · test **44/44** —
all measured 2026-08-21 **after** merging origin. Pre-merge this tree reported
41/41 and 142 proven shapes; the difference is the 5 commits from the other PC.
**Landed:** first grabs of **`10399712766`** (8 bundles) + a live incident read.
Full diagnosis in `HANDOFF.md` §5.

**Disproved — mine, twice in one session, and both reached the user before the
data did.**
1. "CCU is down 28%." Built on "the daily peak lands at 13:00", inferred from a
   **single day**, applied to a different weekday. `PeakConcurrentPlayers` is a
   MAX so a partial read is a floor; the 17:11Z re-read was 13,532 vs the 8,258
   I used. → SKILL.md §0.
2. "CCU is up 21.8%." That 13,532 is a **sum of per-platform peaks** and the
   dashboard export's best half-hour was 10,429 — 30% lower. The real answer,
   from the export, was **-24.1%**. → **F15** in `COVERAGE.md` + `CLAUDE.md`.

The correct answer only arrived from a **dashboard CSV export**, which is
cell-exact against our data (2026-08-20 17:00 = 7,265.229 both).

**Learned → routed:**
- Partial max/count is a floor; "is CCU down" is three different questions;
  sub-daily clamps to the last settled 24h so the grabber cannot see today; the
  diurnal curve is -52% peak-to-trough; the publish restart signature; querying
  annotations over a narrow window to kill an event hypothesis →
  `liveops-diagnosis/SKILL.md` **§0**.
- **F16** PCU ONE_DAY = sum of platform peaks (30% high on in-progress days) →
  `COVERAGE.md` + `CLAUDE.md`. Not encoded as a test.
- **F17 is a RETRACTION of my own claim.** I reported the unattended Open Cloud
  path as ingesting to zero points and wrote it up as a defect. The working tree
  was **5 commits behind origin**, before `parse-captures.ts` learned the Open
  Cloud envelope. The identical bundle post-merge ingests **6,539 points / 57
  metrics**. Nothing was broken. **Rule now in `COVERAGE.md`: `git fetch && git
  log HEAD..origin` before diagnosing a pipeline defect** — this repo is worked
  from two machines.
- **Removed the "ALERTING DOES NOT SEND" block I added to `CLAUDE.md` on
  2026-08-20.** It was true of my checkout and false of the repo: `notify.ts`,
  `scheduler.ts` and `anomaly-score.ts` were committed from the other PC. The
  2026-08-19 alert I could not find the code for was real and is now merged.
- Everything about the game → `HANDOFF.md` §5 *Banana game*.

**The finding worth acting on:** `[EventController] PromptRsvpToEventAsync
failed: HTTP 404` — **2.01M events across 4 signatures**, first seen
2026-08-09 19:50Z, **50 minutes after** the `AURAS/INDEX + ADMIN ABUSE` event
START (`19:00:33Z`). `RSVPCount` frozen at 465,357. Twelve days live, `V1228`.
Not yet traced to code.

**Ruled out for the incident**, each by a named test: today's update (predates by
14h), any deploy (**none 2026-08-02 -> 2026-08-21**), engine release, an event
ending (zero EVENT_STATE rows in a 08-19 -> 08-22 query), technical breakage.
**v1240 is a clean update** — one new signature, 66 events, gamepad cursor.

**Open:** (1) Studio MCP added to this project (`claude mcp add Roblox_Studio`,
health-check OK) but **needs a Claude Code restart** to be callable — read
`EventController` for a hardcoded eventId, `ProgressionService:568`, and the
`MenuHUD.Wheel` gamepad path. (2) H1 thumbnail decay vs H2 event-surface
withdrawal — tomorrow's CVR direction discriminates. (3) F15/F16 unfixed.
(4) Webhook sender still uncommitted (may be on the Desktop clone).
**Next:** `git merge origin/grabber-correctness` (5 behind, `CLAUDE.md` overlaps
`de3c2e4`), then restart with `claude --continue` and read `EventController`.

## 2026-08-20 — The alert that fired is not in the repo; the role note is reframed

**State:** branch `grabber-correctness` · 56 ahead of main · in sync with origin ·
dirty: `NOTE - where this fits.md` (new), `CLAUDE.md`, this log
**Gates:** verify 23 pass/2 fail/8 skip (**exit 1**, the documented `KNOWN_OPEN`
pair) · audit-plan 140 templates/0 failures · test 41/41 — measured 2026-08-20,
**no drift** from the documented state.
**Landed:** no code. `NOTE - where this fits.md`, a short placement note for
Olivia sent via Nina.
**Disproved:** "anomaly alerting works now" — believed by Ren and nearly written
into a document for Indigo leadership. An alert genuinely fired 2026-08-19 18:23
(9610561918, `ErrorCount/100kDAU` +362.1%, observed 3,499,035 vs expected
757,201, z +2.10, for 08-18 02:00) but **the sending code is nowhere on disk**:
full-tree grep of both clones finds no match for its own wording ("vs this
weekday", "Not a threshold"), and `anomaly.ts`'s only `fetch` targets
`apis.roblox.com`. Run outside the repo after the 2026-08-19 checkpoint, never
committed. → standing rule now in `CLAUDE.md` (extension section).
**Learned → routed:**
- Indigo portfolio = **10–15 games per producer** (Nina, 2026-08-20), varying by
  strategy: more games on fast revenue-centred updates, fewer on slower
  strategic growth. **Closes open item (4) of the 2026-08-16 entry**, which held
  the position doc to "far larger than four".
- Contract `Djematene Dilan contract (1).pdf`: §7.4 bars competing work **during
  the term only** and is absent from the §8.5 survival list; §3.8 survives one
  year but reaches only Indigo's own clients/partners Ren had contact with, and
  is geographically limited to the state of Delaware; §8.3 allows immediate
  termination for convenience by either side. Read 2026-08-20; §4.2 work-product
  ownership still unresolved.
- **Log ordering repaired**: both 2026-08-19 entries had been appended at the
  BOTTOM, so a cold resume read 2026-08-16 as newest and missed the extension
  becoming the product surface.
**Open:** (1) Recover the webhook sender from shell history before it is lost —
it exists only as a screenshot. (2) Olivia decides ~end of 2026-08. (3) F12, F13
and the Knife Farm cause unchanged.
**Next:** recover and commit the `anomaly.ts` → webhook join, then confirm one
scheduled grab lands end to end (`data/raw/` + ingest in the dev log).

## 2026-08-19 (afternoon) — the extension became the product surface

**State:** all work in the TEST clone `rbx-analytics-grabber-test`, pushed to
`origin/grabber-correctness`, clean. Manifest **v0.8.0**. The MAIN repo has NONE
of this — it holds only the morning's knowledge port.
**Gates** (measured now): verify 23 pass / 2 fail / 8 skip (exit 1, documented) ·
audit-plan 140 templates 0 failures · test 41/41.

**Landed:** dashboard as an extension page framed into create.roblox.com
(`dashboard.html` + `dashboard.js`, overlay in `collector.js`); Experiences /
Grab / Settings views; five server routes (`/api/rbx/user|groups|group-games|
access`, `/api/dash/config`); grab exclusions wired end to end
(`lib/exclusions.ts`); the old panel reduced to a launcher (-144 lines).

**Learned → routed:** iframe-vs-inline reasoning, the credential split, the
orphaned-content-script failure, exclusion numbers and the report-what-you-
dropped rule, and "no live metrics in the dashboard" → **CLAUDE.md**.

**Disproved / corrected (mine):**
- "The username field is dead" — it did not exist yet. `boot()` awaited a
  6–20s local-app probe before painting `#stage`. Now paints first; every entry
  point is wrapped and paints a visible error banner.
- "The scheduler is broken" — it fires correctly. Reloading the extension
  orphaned the content script, so it reached nobody.
- Metric cards on the grid — built, then removed as costly and redundant.

**Open:**
- **The scheduler has still never completed a grab end to end.** It fires; the
  orphan fix is unverified. Next check: a new file in `data/raw/` and a
  `POST /api/ingest` in the dev log after the next hourly firing.
- Alerts do not send. `anomaly.ts` has the seasonal baseline; nothing joins it to
  the webhook field. Decision made: **measured baseline only, no manual
  threshold** — a typed number fires every Wednesday on a game whose Wednesday
  runs 42% below its own weekly mean.
- Lag reportedly improved but not confirmed; user switching to a faster machine.
- Only universe 9963622286 verified against Open Cloud; Waterslide (multi-place)
  and Knife Farm unprobed for value parity.
- Contract §4.2 makes all work product Indigo's — unresolved, and it decides
  whether any of this is sellable.

**Next:** confirm one scheduled grab lands (`data/raw/` + ingest in the log). If
the orphan fix holds, wire `anomaly.ts` to the Discord webhook.

## 2026-08-19 — A second grab path that needs no browser, and alerting that fires on the weekday baseline

**State:** branch `grabber-correctness` · 56 ahead of main · pushed · dirty:
9 new `data/raw/` bundles, both grab-reports, `dashboard-config.json`
**Gates:** verify 23 pass/2 fail/8 skip (**exit 1**, the documented `KNOWN_OPEN`
pair) · audit-plan 140 templates/0 failures · test **44/44** (was 41; +3 = G10)
— measured 2026-08-19, not copied.
**Landed:** Open Cloud grab path (`opencloud-grab.ts` / `opencloud-run.ts`),
server-side scheduler (`scheduler.ts` + `src/instrumentation.ts`),
`/api/grab-opencloud` + `/api/scheduler`, Discord alerting (`notify.ts`) on the
weekday baseline, scorer extracted to `anomaly-score.ts` and now shared with
`scripts/anomaly.ts`. Two buttons in the game modal: **Local web app grab**
(session) and **API grab** (key). Corpus rebuilt from `data/raw/` — the clone
had none, which is why the corpus gate had been skipping silently.
**Proven end-to-end 2026-08-19 18:17→18:23 UTC+2:** timer → Open Cloud →
corpus → scoring → a Discord post, no browser open. `data/notify-state.json`
holds the signature; it is only written after a successful POST.
**Learned → routed:**
- 429-recorded-as-failed-metric, the per-key contention between the two paths,
  and the three non-`OneDay` Open Cloud shapes → **F15** in
  `data/verify/COVERAGE.md`, regression test **G10**.
- Two grab paths, read policy, pacing, scheduler inputs → `CLAUDE.md` (new
  section) + `HANDOFF.md` §3b.
- Collinear metrics inflate a finding count (`DailyRevenue`/DAU **is** ARPU) →
  `liveops-diagnosis/SKILL.md` **§3**.
**Disproved:** mine, twice. (1) "Running both grab paths is something to avoid"
— they use different budgets (session cookie vs API key), so they do not starve
each other; the real cost is duplicate bundles and tab churn, a cadence
question. (2) "I have not fired a real Discord post" — the scheduler I had
already started fired one automatically at 18:23.
**Open:** (1) `ErrorCount/100kDAU` on 9610561918 read **+362% vs that weekday**
(3,499,035 vs 757,201 expected, z +2.10, day 2026-08-18) — the corpus was
rebuilt minutes earlier, so confirm against the dashboard before believing it.
(2) A browser grab on 2026-08-19 18:49 used a **20-day** window, not the 28-day
default — check the panel's date fields for a leftover value.
**Next:** verify or kill the +362% ErrorCount reading on 9610561918 against the
dashboard's own export, then decide the cadence per game — nothing is scheduled
right now (`schedulerEnabled: false`, extension schedule `enabled: false`).

## 2026-08-19 — Open Cloud is a verified drop-in for the metrics half

**State:** ALL of today's work is in a SECOND CLONE,
`C:\Users\bfhdh\Downloads\rbx-analytics-grabber-test` (private GitHub repo
`amazing-source/rbx-analytics-grabber-test`, `origin` = test, `upstream` = real
with push disabled). Nothing committed anywhere. **The main repo is still
`behind 2` and dirty** (`SKILL.md`, `data/games/10030829154/grab-report.json`)
— and both incoming commits rewrite those same two files.
**Gates** (test repo, measured 2026-08-19): verify 23 pass / 2 fail / 8 skip
(exit 1, the documented state) · audit-plan 140 templates 0 failures 125 proven
· test 41/41.

**Landed (uncommitted):** `chrome.alarms` scheduler in the extension
(`background.js` +208, `collector.js` +116, manifest 0.5.0 — scheduler drives a
real tab so the session cookie is still never touched); four Open Cloud probes
in `web/scripts/` (`probe-opencloud`, `compare-opencloud`, `coverage-opencloud`,
`probe-dimensions`, `probe-granularity`), key read from gitignored
`web/.opencloud-key`; `liveops-diagnosis` skill 827 → 966 lines.

**Learned → routed:**
- Open Cloud parity + shapes + the granularity-column trap → `CLAUDE.md`
- The 726-cell measurement and its two self-inflicted false alarms →
  `data/verify/COVERAGE.md` **F14**
- Retention-by-acquisition-source as a discrimination test; platform DAU floors;
  Roblox's published perf targets; funnel back-fill/repeat/filter rules; Configs
  API as the rollback lever and Notifications as re-engagement →
  `SKILL.md` §3c, §3d, §4 technical targets, §5d, §5e

**Disproved (all mine):**
- "The perf half is unproven — local Place-scope vs cloud universe-scope" —
  `breakdown:["Place"]` returns ONE series identical to the total; Become a
  Brainrot is single-place ("[WORLD 3]" is the update name, not a place).
- "ServerCrashCount's fractional 4.010101010101 is an anomaly to resolve" —
  both sources return it; normal at daily granularity.
- "PeakConcurrentPlayers disagrees by 87%" — `compare-opencloud.ts` was not
  filtering the `granularity` column.
- "The robocopy preserved everything not in the copy" — it reverted six files
  from the two newer commits; restored via `git checkout`.

**Open:**
- `filter` needs an `operation` enum; `"Equals"` rejected — probe for legal
  values, it blocks Place-scoped queries.
- Only 9963622286 tested, and it is single-place — run the probes on Waterslide
  (multi-place) and Knife Farm before generalising.
- Contract §4.2 makes all work product Indigo's — unresolved, and it decides
  whether any of this is sellable. Raise with the rate conversation.
- Extension scheduler is written but never run against Chrome.

**Next:** reconcile the main repo — `git fetch && git merge` (behind 2, two
dirty files the incoming commits rewrite), then port `SKILL.md`, the `CLAUDE.md`
Open Cloud block and COVERAGE F14 across. Until that happens today's knowledge
exists ONLY in the test clone, which is exactly the failure this log prevents.

## 2026-08-16 — Three games re-read in one pass, and the position doc is written

**State:** branch `grabber-correctness` · 37 ahead of main · pushed · clean
**Gates:** verify 23 pass/2 fail/8 skip (**exit 1**, the documented `KNOWN_OPEN`
pair) · audit-plan 140 templates/0 failures · test 41/41 — measured 2026-08-16.
**Landed:** four new grabs (2× `9963622286`, `10030829154`, `9610561918`), three
dashboard error exports, code read against all three live places
(v590 / v1702 / v3829). Deliverables: `LiveOps Analytics - the case for a
full-time role.docx` (7pp) + `Dilan Djematene - motivation letter.docx` (1pp),
both committed, sources in `docs-src/`.
**Learned → routed:**
- Never call a step on a rate without checking the numerator; matched-DAU
  comparison; the mix control as a two-way test; "eliminated everything" is a
  result → `liveops-diagnosis/SKILL.md` **§3**.
- Export row-cap truncation, severity inversion, client-vs-server split for
  "heavy vs broken", unprotected registry loops → **§5c**.
- `ANNOTATION_TYPE_EXPERIENCE_EVENT_STATE` dates every event to the second;
  retention-paying quests contaminate D1/D3/D7 → **§5c** event block.
- Per-game facts → `HANDOFF.md` §5 (three new dated blocks).
- **UI/visual defects are out of reporting scope** (Ren, 2026-08-16) →
  `CLAUDE.md` START HERE, because the memory dir does not travel.
- **F12 reproduced on `9610561918`** — `place-versions.md` stuck at v3747/10 May
  while live is v3829, and it blocked a live investigation → `COVERAGE.md`,
  priority raised from cosmetic to blocking.
**Disproved:** mine, twice on Knife Farm in one session. "Conversion slid from
3 Aug" then "conversion stepped on 12 Aug" — the second was a denominator
artifact (payers 355→356 flat, DAU +24%). What survives is matched-DAU: half the
payers at the same size, cause **not identified**, every named candidate
eliminated by date or by test.
**Open:** (1) Knife Farm cause — blocked on F12; fix the deploy log first.
(2) Waterslide save-loss path: the baseline's `SaveLoadDataMgr` signature is
absent from the unfiltered export, cap or genuinely stopped — re-pull narrower.
(3) Brainrot 14 Aug +46.3% DAU on 3.8h exposure still unattributed.
(4) Coverage number for the doc — needs Nina's real game count; the doc says
"far larger than four" rather than guessing.
**Next:** fix F12 (root-place `saved-versions` 500 handling + cross-check the
place list against `Place` filter values), then re-read Knife Farm's 3–13 Aug
deploys.

## 2026-08-15 — World 3 tracked live: engagement up, and four systems broke on one missing table

**State:** branch `grabber-correctness` · 35 ahead of main · pushed · dirty:
2 new `data/raw/` bundles, `9963622286/grab-report.json`, the new `.docx`,
+ edits to `CLAUDE.md`, `HANDOFF.md`, `COVERAGE.md`, `liveops-diagnosis/SKILL.md`
**Gates:** verify 23 pass/2 fail/8 skip (**exit 1**, the documented `KNOWN_OPEN`
pair) · audit-plan 140 templates/0 failures · test 41/41 — measured 2026-08-15.
**Landed:** first update tracked end-to-end under Nina's watch-after-ship
mandate. `v586`/`v587` (2026-08-14 20:13/20:20 UTC), two grabs on the 15th
(11:24, 18:19 UTC), two dashboard error exports. Delivered as
`Brainrot - World 3 update check (15 Aug).docx` (repo root, 4pp).
**The read:** 13→14 Aug DAU +46.3% (123,316 → 180,466), revenue +39.9%, session
+4.6% — off only 3.8h of exposure, so something else also ran that day.
8 issues, **4 of them one bug class**: new content with no entry in the table
another system indexes it by. Highest value are two one-liners —
`OnPlayerAdded:1778` (`Conetto Morsetto` vs the folder's `Conetto Mosteretto`,
1,844 purchase prompts never fired) and `AnimalModule:547` (dead upgrade button,
arrived with `v588`–`v590`).
**Learned → routed:**
- Blast-radius walk-up, the two recurring guard shapes, `task.spawn` escaping an
  enclosing `pcall`, the missing-lookup-entry class, and event contamination
  breaking peak-PCU normalisation → `liveops-diagnosis/SKILL.md` **§5c** (new).
- Everything specific to this update → `HANDOFF.md` §5 *World 3 update*.
- **F13** — `*.daily.csv` rolls up `FILLED_ZERO` rows and printed PCU 0 and
  ErrorCount 0 for **2026-08-14, the update day**, while `ONE_DAY` in the same
  file says 3,139.57 and 11.2M → `data/verify/COVERAGE.md` + standing warning in
  `CLAUDE.md`. **Not fixed, not yet a test.**
**Disproved:** "12,874 `FuseModule` DataStore flush failures are the July wipe
returning" — mine, killed by reading `FuseModule:362/538/612`, which check the
return and roll back (cash restored, tombstones dropped, player notified). The
real gaps are `PlayerRemoving:815` ignoring the return, and DataStore *capacity*
(`LimitedTreadmill` 502s: rate limit on one shared key).
**Open:** (1) the +46% DAU on 3.8h of exposure is unattributed → find the other
thing that ran on 14 Aug. (2) `v588`–`v590` fixed neither one-liner (counts kept
climbing) → confirm off a fresh export once a fix ships. (3) `ClientCrashRate15m`
1.53% → 1.87% → 3.68% → re-read on the 16th; above 2% on normal traffic is real.
**Next:** grab `9963622286` on **2026-08-16** — first clean post-update day, the
15th is unusable (admin event took PCU to 14,932 vs 1,940 on the 13th).

## 2026-08-14 — Waterslide is the fourth universe, and this is its *before* half

**State:** branch `grabber-correctness` · 34 ahead of main · **3 unpushed** ·
dirty: 7 new `data/raw/` bundles + `data/games/9963622286/grab-report.json`
**Gates:** verify 23 pass/2 fail/8 skip (**exit 1**, both fails are the
documented `KNOWN_OPEN` pair) · audit-plan 140 templates/0 failures ·
test 41/41 — all measured 2026-08-14, not copied.

**Landed:** first grab of **`10030829154` Waterslide** (2026-08-14T17:43:53Z,
30 days, 2026-07-15 → 08-13 settled) + full pre-update baseline.

**The timing is the point:** the update (root place **`V1698`**) published
17:29:41–17:30:55 UTC and the grab ran **13 minutes later**, so this bundle is
the *before* half of a pre/post comparison and holds ~zero post-update data.

**Learned → routed:**
- Whole diagnosis + the "what broken looks like" diff table →
  `HANDOFF.md` §5 *Waterslide (`10030829154`)*.
- Dilution is better tested by splitting the rate by `AcquisitionSource` than
  by the returning-share regression; the regression's r is per-game (0.198 here
  vs 0.718 on Brainrot); a metric spiking on exactly the publish days is a
  publish-path signature; error-export counts on userId-bearing messages are a
  floor; `feedback.csv`'s `asset_version` is a second deploy log →
  `.claude/skills/liveops-diagnosis/SKILL.md` §3 and §5b.
- The deploy log drops a place whose `saved-versions` 500s and looks complete →
  **F12** in `data/verify/COVERAGE.md`, standing rule in `CLAUDE.md`.
- Irreplaceable dashboard export copied into
  `data/verify/10030829154/` (Downloads does not travel).

**Disproved:** "D1 fell because the viral push brought low-intent traffic" —
it fell 9% on `Friends` and 14% on `Search` too, so it is the game holding
fewer players (−2.0pp, 15 straight days below baseline). Also: the 31 Jul–2 Aug
483,029-crash wave was **not** the 31 Jul deploy — it cleared with no deploy in
between. Also: the raw `−34% DAU` in `summary.md` is the back half of a spike;
the game is **+24% DAU and +28% revenue** versus mid-July.

**Open:**
- Two level judgements need someone who plays it (§5b): the 1-hour `X2 EVENT!`
  on 14 Aug (July's ran 7 days), and whether "money not updating after a slide"
  is a bug or a rebalance. → ask the studio.
- Save-loss path confirmed in text on v1691, **volume unknown** (export counts
  split per userId). → size it against `ErrorCount LogSource: Server` per DAU
  on the next grab.
- 12 Aug one-day reach crater (DAU 147,770, lowest of the window) unattributed.
  → check whether it repeats.

**Next:** re-grab `10030829154` on 2026-08-15 so 15 Aug is a full settled day,
and re-pull the error export **without** the V1691 filter so v1698 signatures
are not excluded. Then diff against the HANDOFF table.

## 2026-08-10 (evening) — Four of my findings killed by someone who plays the game

**State:** branch `grabber-correctness` · 33 ahead of `main` · **2 commits
unpushed** · dirty: `.claude/settings.local.json`, `liveops-diagnosis/SKILL.md`,
`HANDOFF.md`, `data/games/9963622286/grab-report.json`, untracked
`data/raw/9963622286-2026-08-10T14-28-47-177Z.json` (**must commit, cannot be
re-created**)
**Gates (measured now):** verify **23 pass · 2 fail · 8 skip, exit 1** ·
audit-plan 140 templates / **0 failures** · test **41/41**. Documented state.

**Landed:** `FunnelCohortCompletionRate` is served **`ONE_DAY` per named step**
with full history, so funnel moves can be dated to a day — the skill said they
could not. Studio source read of dev place `115476892057345`. Time-to-first-
rebirth modelled from shipped constants. Three dashboard exports ingested
(error text, feedback split, 164 player comments).

**Learned → routed:**
- Retention lags ~2 days; a `NONE` window aggregate can hide a series that
  doubled → `liveops-diagnosis` §0
- Returning-share regression as the mix control (r = 0.718 on 9963622286);
  "big error count, test it against ARPDAU before reporting" → §3
- **Metrics date changes, they cannot judge levels**; the three export-only
  sources; half-hour PCU vs daily peak → new §5b
- Brainrot 30 Jul shape, 7 Aug fix confirmed, 8-day gap cost, rebirth timing
  → `HANDOFF.md` §5
- Series-name traps and export locations → memory `rbx-where-to-find-each-metric`
- Chat register ≠ doc register → memory `write-in-users-voice-not-ai-voice`

**Disproved — all mine, all within hours, all by the producer playing the game:**
- *"Rebirth1 61.4% churn unchanged pre/post = immovable structural gate"* —
  aggregation artifact. Daily series runs 24-33% → 44-48% → 34-37%.
- *"First rebirth is 6.58× too hard, flip `new_speed_mechanic`"* — the whole
  treadmill loop is gated on that flag. Flipping it disables the core loop.
- *"A fresh player can't train"* — the tutorial grants and equips the treadmill.
- *"The unchecked `pcall` at `OnPlayerAdded:2963` causes the wipes"* — zero
  DataStore signatures in the error export, floor 7,875 lifetime.
- *"Backpack items aren't saved"* — `OnPlayerAdded:584-586` saves them.
- *"PCU isn't in the grab"* — it is, series `Place=<id>`, never `Total`.

**Open:**
- **What shipped in v546 (30 Jul 11:54 UTC)?** Everything after the tutorial
  dropped, nothing inside it moved. Next action: ask the studio. Lead: a 30 Jul
  player comment that getting speed "takes too long".
- Data loss is real (comments 14-27 Jul), mechanism unfound. Next action: ask
  whether two brainrots can share a UID — the save dedupes at `:554` silently.
- Artifact `claude.ai/code/artifact/f51e905e-72b4-4621-8708-d1ee200cc05b`
  carries the withdrawn 6.58× claim. Next action: redeploy corrected or delete.
- `VoteType` breakdown missing for 7-9 Aug in the grab. Next action: confirm the
  plan requests it.

**Next:** commit and push (raw bundle first), then chase v546.

---

## 2026-08-10 — Rebirth1 named the biggest leak; the "50% drop today" was a partial

**State:** branch `grabber-correctness` · 31 ahead of `main` · pushed through
HEAD · **all of today's work is UNCOMMITTED** (6 modified, 2 untracked incl.
`data/raw/9963622286-2026-08-10T07-39-21-953Z.json`, which must be committed —
raw bundles cannot be re-created)
**Gates (measured now):** verify **23/2/8 exit 1** · audit-plan **0 failures** ·
test **41/41**. Both verify fails are in `KNOWN_OPEN`; this is the expected
state, not a regression.

**Landed:** G9 — `displayValue` was being dropped from every dimension value.
`breakdownLabels` now carries dimension → human name into `series.json`, CSVs
and labels, refreshed on merge; raw `value` stays the series identity. 5
regression tests (36 → 41), fixture `funnel-step-displayvalue-0810.json`.
Re-ingested both bundles, so `data/` now reads `Rebirth1` not `4`.

**Learned → routed:**
- Partial-point false alarm, same-weekday rule, `IsNewUser` acquisition-vs-
  retention test, `RFYL7PlayDays` as the ranking input, session buckets as a
  funnel substitute, idle-mechanic→retention-day map, loss-baseline discipline
  → `.claude/skills/liveops-diagnosis/SKILL.md` (§0, §1, §3, §4, §4b)
- Brainrot 3-cause split + `Rebirth1` 61.4% gate; Knife Farm return-loop
  diagnosis → `HANDOFF.md` §5
- G9 + current gate reading → `data/verify/COVERAGE.md`
- `displayValue` rule, app-launch, corrected gate baseline → `CLAUDE.md`

**Disproved:**
- *"The 2nd verify failure is a new regression"* (mine, this session) — it is
  `ErrorCount` half-hour, already in `KNOWN_OPEN` since `cab8e85` (2026-08-09).
  `CLAUDE.md` was stale at 23/1/9 + 30 pass; fixed.
- *"The API only gives funnel step numbers"* (mine) — the names were in
  `data/raw/` all along. The user was right; it cost a round trip.
- *"Brainrot dropped another 50% on Aug 10"* — that was a `partial` point
  captured 07:39 UTC before the ~12:30 daily peak. Real move is −62% weekday
  PCU week-over-week, dating to Aug 1–2.
- G7 hash→text — **closed as won't-fix**, not a blocker. `HANDOFF.md` §6.3 also
  wrongly claimed the re-grab polls for it; corrected.

**Open:**
- Uncommitted work — next action: commit (see resume line).
- `UsersJoinedFromNotifications` = 2,073 lifetime on Knife Farm looks like a
  switched-off channel. Next action: confirm in the dashboard it isn't a narrow
  subtype before Ren pitches it.
- Matthew (Indigo CEO) asked what the tool does, awaiting Ren's reply. Next
  action: send findings-only answer + the QPTR clicks-vs-plays question.

**Next:** commit today's work, then send Matthew the reply.

**State:** branch `grabber-correctness` · pushed through `cacde14` · dirty:
`.claude/settings.local.json` only
**Gates — all three red, measured now, not fixed to look green:**
- `verify` **23 pass · 2 fail · 8 skip** (was 23/1/9). The new fail is
  `ErrorCount` at `2026-08-08T08:00`, csv 3137 vs ours 3710. **Unexplained.**
- `audit-plan` **2 failures** (was 0), both `PotentialExtraEarningsTotalUsd ·
  NONE`: tagged `proven` but it 400s on a long window, so the tag is now a
  stale claim.
- `npm test` **34/35**. The one fail is the corpus gate catching the same
  `ErrorCount` disagreement. It is doing its job.

**Landed:** window chunking for the technical rung (`bc7e8cb`), retention
horizon measured (`4972e9c`), Roblox algorithm research (`ac1d984`), the
window-selection method (`33d6a4f`), today's three capture bundles (`cacde14`),
and a rewritten Knife Farm client doc with charts.

**Learned → routed:**
- Official RFY ranking signals + the 2026-06-15 algorithm change + QPTR removed
  from ranking + Roblox publishes no retention benchmarks → `liveops-diagnosis` §3b.
- **Long history first, then the 28-day zoom** → `liveops-diagnosis` §0b. This
  is the fix for the error below.
- Retention horizons: technical ~30 days, `ErrorCount` ~56, behavioural ~4
  months → `CLAUDE.md`.
- Knife Farm is three reach cycles, not one July decline → memory
  `rbx-games-and-findings`.
- User wants client-facing writing in their voice, no em dashes → memory
  `write-in-users-voice-not-ai-voice`.

**Disproved:**
- **"Knife Farm declined on 19 July because of the 2026-06-15 algorithm
  change."** Wrong, and it was in a doc. On 129 days the biggest collapse ran
  31 May → 12 Jun, before the change existed. A real, correctly-dated external
  cause that fits a short window is the most dangerous kind of wrong.
- "QPTR is Indigo's #1 distribution lever" — Roblox removed it from ranking on
  2026-06-15 (verbatim: *"Removing qualified play-through rate"*).
- "Retention doesn't drive DAU here" (r = −0.011) — wrong test. The path is
  retention → ranking → impressions → DAU with a ~4-week lag.

**All four resolved in `cab8e85`, same day.** Gates after: `npm test` **36/36**,
`verify` 23/2/8 with both fails documented in `KNOWN_OPEN`, `audit-plan` still
2 — see below.
- `ErrorCount` 2026-08-08T08:00: **explained.** 144 of 147 cells match; the
  three that do not are one half-hour bucket stamped at the export window's own
  end, covering 08:00–08:30 which is outside the exported window. The dashboard
  wrote a partial bucket, our 2026-08-09 read has the settled one, ours higher
  on all three series. In `KNOWN_OPEN` with the reasoning and a way to resolve
  (re-export that chart with a later end time and see if it then reads 3710).
- Chunk boundary overlap: fixed, chunks now start one interval after the
  previous ends. Verified live — Apr 1→8, Apr 9→16, Apr 17→24. Plan for
  9610561918 went 395 → 363 requests purely from removed duplicates.
- `NONE` chunking: fixed, `NONE` is clamped to the most recent legal window
  instead of split into N aggregates.
- `PotentialExtraEarningsTotalUsd`: given an explicit 28-day cap. Live plan
  emits one request, 2026-07-12 → 2026-08-09.

**Open:**
- `audit-plan` reports 2 failures and **will until the next grab**. It proves
  templates from `data/games/*/grab-report.json`, which is overwritten each
  grab, so the 2026-08-07 report that earned the `proven` tag is gone and the
  current one records the 400. The clamp above should make the next grab return
  data and clear it. Next action: re-grab either universe, then re-run
  `npm run audit-plan`. If it still fails, the tag is genuinely wrong and
  should drop to `optional`.
- Still unused: the peer-cohort benchmark series already in `series.json`.
  Roblox publishes no benchmarks, so this is the only real bar we have.
  Next action: surface it in `summary.md` alongside each rate metric.

**Next:** re-grab one universe to clear `audit-plan` and confirm the clamp
returns data end-to-end.

---

## 2026-08-09 — Session continuity: `checkpoint` skill, and the repo is not backed up

**State:** branch `grabber-correctness` · **pushed to `origin` for the first
time** (the remote previously held only `main` at `c033b18`, pre-overhaul) ·
dirty: `.claude/settings.local.json`
**Gates:** verify 23 pass · 1 fail · 9 skip (**exit 1**) · audit-plan 140
templates / 0 failures · test 30/30 — all three measured today, not copied

**Landed:**
- `.claude/skills/checkpoint/SKILL.md` — the session-continuity procedure, with
  a routing table (which kind of knowledge goes in which sink) and a resume mode.
- This log.
- `web/scripts/lead-lag.ts` + `npm run lead-lag` — cross-correlates the QPTR
  proxy against reach at ±5 days and prints the OLS appeal trend on **both**
  QPTR proxies. Built to re-measure two claims; it overturned both.
- Reconciled five stale or wrong claims (see *Disproved*).

**Learned → routed:**
- The memory directory is keyed by the project's **absolute path**, so it does
  not survive a device change or even a different clone folder. The repo is the
  only carrier; memory is a local index → `.claude/skills/checkpoint/SKILL.md`.
- `verify` exits 1 on the one known-disputed hour, so it cannot be wired into
  CI as pass/fail as written → `HANDOFF.md` §1.
- **The lead-lag direction is a discriminator, not a forecast** — appeal-leads
  = exhaustion/creative fatigue, reach-leads = platform demotion →
  `liveops-diagnosis` §3.
- **Audience exhaustion has its own signature** (reach ↓↓ with QPTR ↓ while
  retention and session *improve*) → `liveops-diagnosis` §2.
- The simulator lifecycle gap **cannot** be closed with what we hold: all three
  universes carry only 31–37 days of daily headline data. It needs 6+ month
  launch-to-present windows → `liveops-diagnosis` §4.

**Disproved:**
- `CLAUDE.md` START HERE claimed "neither universe has had a post-fix active
  grab" and that 9963622286's crash history was "absent from `data/`" — both
  false since 2026-08-08 (commit `298cdb8`). Eight commits of drift in a block
  that loads into every session. Fixed.
- `HANDOFF.md` documented the verify gate as "exit 0"; it exits 1. Fixed.
- `HANDOFF.md` §6 item 1 still listed the re-grab as open. Closed 2026-08-08.
- **"QPTR is a 3-day leading indicator" does not generalise.** It held on the
  dead game (+4d, r=0.78 on MA7 first-diff, clean sign flip at −4d), is weak on
  Knife Farm (+3d, r=0.39) and runs the *other way* on Brainrot (reach leads,
  −5d r=0.71). The original r=0.85 was measured on raw levels, where two
  declining series correlate at every lag.
- **"Become a Brainrot QPTR −0.72%/week, steeper than the dead game's final
  fortnight" is withdrawn.** Reproduces on neither proxy: −0.124 pp/wk on
  `EndToEndCVR`, +0.016 pp/wk on home-surface, versus the dead game's final
  fortnight at −0.463 / −0.488. It was queued to go to the producer. It should
  not go.

**Open:**
- Branch not merged to `main` — decide merge vs keep-as-branch.
- G5, freeze-first-write-wins is disputed policy, not a settled rule: the
  largest divergences run both ways (`ItemMonetizationRevenue` 353 → 21,835
  looks like back-fill). Next action: decide whether to keep first-read or
  prefer-latest, using the dashboard as tiebreak on 3–5 disputed points.
- G7, `MessageHash` → text returns HTTP 500 on both universes, so `errors.md`
  is volumes without text. Next action: retry the async dimensions poll; if it
  still 500s, record it as a platform limitation and stop treating it as a bug.
- The lifecycle prior is unbuildable at current window length. Next action: on
  the next active grab, request 6+ months per universe rather than 28 days.

**Next:** decide merge-to-`main` vs keep-as-branch; then the long-window grab,
which is the only open item that unlocks new analysis rather than tidying.

---

## 2026-08-08 — Correctness overhaul landed; the re-grab audited the audit

*Reconstructed from git and `data/verify/COVERAGE.md` on 2026-08-09 — this
session predates the log, so treat it as a summary of commits, not as measured
state.*

**State:** commits `6c7b1b9` → `343ae1e` on `grabber-correctness`
**Gates at the time:** verify 23/1/9 · audit-plan 0 · test 30/30

**Landed:** all 7 phases of `CORRECTNESS_PLAN.md`; both universes re-grabbed
with the fixed pipeline (closing the last verification item); the
`liveops-diagnosis` skill; `data/raw/` committed because the bundles cannot be
re-created; a rebuild from `data/raw/` now reproduces the verified state.

**Learned → routed:** the diagnostic ladder, Indigo's priors, and the QPTR
leading indicator (QPTR turns down ~3 days before impressions, r=0.85 forward
vs r=0.44 reverse) → `.claude/skills/liveops-diagnosis/SKILL.md`. Pipeline
measurements → `data/verify/COVERAGE.md` (F1–F11, G1–G7).

**Disproved — by our own fresh data (G1–G7):** the zero-fill overreached past
what the gateway served (read R$4,845 as R$0); four *inferred* half-hour shapes
were up to 65% off the dashboard and were removed; "Client frame rate" is not
`ClientFpsAvg`; the revision log fired on every row (median divergence 0.0000%)
and now logs only >1%.

**Wins, measured:** `ServerCrashCount` peak 1,060,617 on 2026-08-01 for
9963622286, previously absent entirely; funnel discovery found `BaseUpgrades`,
`PlayerProgression` and 20 steps; returned-data counts 80/120 → 127/156 and
82/119 → 155/186; annotation enumeration found
`ANNOTATION_TYPE_ENGINE_RELEASE`, the genuine "was it Roblox?" signal.
