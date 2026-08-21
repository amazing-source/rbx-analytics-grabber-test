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
