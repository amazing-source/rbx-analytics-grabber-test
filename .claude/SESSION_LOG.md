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
