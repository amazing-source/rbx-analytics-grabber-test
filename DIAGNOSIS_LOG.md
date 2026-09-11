# Diagnosis log — every claim that reached Ren, and what happened to it

One row per delivered diagnosis. The point is not to collect scalps; it is that
the same five mistakes keep recurring, and each one now has a named control that
prevents it. **Read the "Recurring failure modes" table before writing a new
report** — it is the checklist that would have caught every retraction below.

Started 2026-09-03, reconstructed from `.claude/SESSION_LOG.md` (which stops at
2026-08-21), `reports/2026-08-30/README.md`, the `.docx` deliverables in the repo
root, and the published artifacts. **Append to this file whenever a diagnosis
ships or a claim changes status** — the session log is per-session and does not
survive as a thread across the ten artifacts published 24 Aug → 2 Sep.

Status vocabulary: **HELD** (still believed, evidence unchanged or strengthened) ·
**NARROWED** (true in a smaller scope than delivered) · **RETRACTED** (wrong) ·
**OPEN** (testable, not yet tested).

---

## Delivered diagnoses

| Date | Deliverable | Headline claim | Status | What actually happened |
|---|---|---|---|---|
| 08-07 | `Become a Brainrot - LiveOps Bleed Report.docx` | Decline starts at the 30 Jul deploy (v535–546). "It's a quality problem, not a traffic one." | **NARROWED** | The 31 Jul break is real and was independently re-dated on 09-02 by a change-point scan across three metric families (D1 −5.6pp, playtime −4.1 min, session −1.74 min). But Home reach peaked **29 June** and was already **−38.2%** by the day the bug landed. The step was real; "not a traffic one" was false about what started the decline, and the report attributed 32 days of pre-existing pullback to a deploy that had not shipped yet. |
| 08-09 | `Knife Farm - Decline Diagnosis.docx` | "Not a bug and not the algorithm." Roblox pushes reach, D1 holds (16–25%), D7 collapses (4.5%→1.3%), so Roblox stops. Three push/pullback cycles, each peak lower. | **OPEN** | This is a *mechanism* claim — retention failure causes the withdrawal — and it is now directly testable with the RFY ranking signals (added to the plan 08-31). It has **not** been retested. On the two games where the same test was run (09-03, Brainrot and Waterslide) the mechanism did **not** appear. Knife Farm's D7/D30 decay is far steeper than either, so it may genuinely be the exception — but the claim currently rests on a correlation that failed elsewhere. **Next action: pull RFY lifetime for 9610561918 and re-run finding 09's two tests.** |
| 08-12 | `Brainrot Error Analysis 2026-08-12.docx` | Five code defects ranked by severity, from error exports + place file. | **HELD** | Explicitly framed as hypothetical ("reasoning about code, not watching it happen"). The save-guard fix from this line of work "is still catching writes today" per the 08-16 role doc. |
| 08-14 | `Waterslide Update Watch 2026-08-14.docx` | v1698 broke nothing; the usual 20–50× server-error publish spike did not occur. | **HELD** | Correctly identified the publish signature as a known baseline behaviour rather than an incident. This is the template the later baselines follow. |
| 08-15 | `Brainrot - World 3 update check (15 Aug).docx` | Update day ahead of the prior day on DAU +46.3%, revenue +39.9%. | **NARROWED** | Only 3.8 hours of the day were post-update, which the doc says. But a raw day-over-day on a single pair of days carries no weekday control — the 09-02 analysis later showed Tue/Wed troughs of −22%/−25% on this game, large enough to produce a "+46%" from position in the week alone. |
| 08-16 | `LiveOps Analytics - the case for a full-time role.docx` | Four titles, three needed different answers, two would have been misdiagnosed by the obvious read. | **HELD** | Superseded in detail by later work but the framing survived. |
| 08-20 | (verbal / nearly written to Indigo leadership) | "Anomaly alerting works now." | **RETRACTED** | An alert genuinely fired 08-19 18:23, but the sending code was nowhere on disk — full-tree grep of both clones found no match for its own wording. It had been run outside the repo and never committed. |
| 08-21 | Live incident read, 10399712766 | "CCU is down 28%." then "CCU is up 21.8%." | **RETRACTED ×2** | (1) Built on "the daily peak lands at 13:00", inferred from a **single day** and applied to a different weekday; a partial MAX is a floor, and the re-read was 13,532 vs the 8,258 used. (2) That 13,532 is a **sum of per-platform peaks**; the dashboard export's best half-hour was 10,429. The real answer was **−24.1%**, and only the CSV export settled it. → F15/F16. |
| 08-21 | Code findings, 10399712766 | Four defects reported. | **RETRACTED ×3** | Three of four fell in-session: a `Touched` re-fire I missed by reading lines 155–230 instead of the whole file; an unreachable popup path; and a "stale EventId" that was actually `Number()` precision loss on a 19-digit ID inside our own JSON parse. |
| 08-30 | `reports/2026-08-30/liveops-diagnosis.html` (draft) | "D1 below ~12.5% triggers a next-day traffic cut." | **RETRACTED** | The association is real across five games (median next-day home-rec change −19.7% vs +3.3%) but it is not a mechanism: D1 does not settle for two days, and on Verity and Seal the low-D1 days *were* their biggest traffic days (same-day r = −0.44, −0.69). A surge depresses D1 and then mean-reverts. Caught before delivery. |
| 08-30 | `post-update-watch.html`, four games | No publish on 08-28 broke anything measurable. | **HELD** | Confirmed by the 09-02 placebo audit, which found nothing at the deploy on Brainrot or Waterslide and showed the apparent Verity/Seal effects were the peak's curvature. |
| 09-02 | `Four Games, One Distribution Problem` (artifact) | Reach is the larger term in all four; two also lost conversion. | **HELD** | Reproduces observed DAU change to within 0.4pp in all four. Explicitly flagged as an accounting identity, not causation. |
| 09-02 | same | "No update moved a metric." | **RETRACTED in-report** | Tested **one date** (28 Aug) per game and stated it as if it covered every publish. A proper change-point scan found genuine breaks on three of four games. |
| 09-02 | same | Verity has "the best hook in the portfolio" (D1 +115%, above 90th pct). | **RETRACTED in-report** | Cohort artifact. Verity's D1 of 14.6% is statistically identical to Brainrot's 14.3%; it only reads as exceptional because Verity is benchmarked against adventure (median 6.78%) and Brainrot against a cohort at 15.56%. Same retention, half the bar. |
| 09-02 | same | Seal's 28 Aug update cost it 71% of DAU / 87% of revenue (p=0.002). | **RETRACTED pre-publication** | The placebo audit killed it — the same test fires at 27, 28, 29 and 30 Aug with similar magnitude. A smear, not a step. This is the single most valuable control added so far: a standard, defensible test produced a confident, wrong answer. |
| 09-02 | same | "No product fix will restore these DAU numbers, because nothing about the product is what changed." | **RETRACTED 09-03** | Contradicted finding 02 on the same page, which dates real product breaks on three of four games. Rewritten to a claim about what a fix can be expected to *move*. |
| 09-03 | same, finding 09 (new) | Quality held as reach scaled; no ranking signal leads the pullback. | **HELD** | See below. |

---

## 2026-09-03 — the ranking-signal test

Prompted by a research brief arguing the diagnostic ladder should start from
Roblox's published Home signals rather than from "reach fell". The brief's
mechanism — *an impressions drop typically follows a fall in PTR / play days /
playtime or a rise in first-play bounce* — is testable, and had never been tested
here. Two results, both on Home-filtered `UniqueUsersWithImpressions`:

- **Quality holds under expansion.** Controlling for a time trend and weekday
  fixed effects, every long-horizon signal (D2–7 and D8–28 play days, playtime,
  qualified sessions) moves *in the game's favour* as reach rises, on both games
  with enough history. Only PTR dilutes, on one game — the effect Roblox
  documents as normal during expansion.
- **Nothing leads the pullback.** Symmetric Granger-style test, both directions
  given the same 7-lag search, Sidak-corrected: 1 marginal hit out of 32 tests on
  Brainrot (chance produces ~1.6), and 0 of 14 on Waterslide, where 6 of 14 run
  the *other* way. Waterslide lost **79.8%** of Home reach while its D8–28
  signals moved −3% and its bounce *improved*.

**Two retractions of my own, in-session, before either reached the artifact:**

1. **Rigged lag search.** My first lead-lag run gave the forward direction seven
   lags and the reverse only one, and produced five "signal leads reach" results
   on Waterslide. All five vanished under a symmetric search. I had built the
   asymmetry into the code without noticing it was a multiple-comparison
   advantage for the hypothesis I was testing.
2. **Reach-quintile reading.** The raw quintile table appeared to show Seal's
   quality degrading as reach scaled (bounce +0.70 with reach). Controlling for
   time it is −0.21 — the quintiles were almost perfectly collinear with
   time-since-launch (r = +0.81), so I was reading novelty decay as audience
   dilution.

**Also corrected:** the objective pullback-date rule fired on early-life
volatility because it scanned from series start; restricted to search from the
all-time peak.

---

## 2026-09-03 (later) — tooling, and four bugs of my own

Not diagnoses, but they belong in the same ledger because the same failure modes
produced them.

**Landed:** the horizon clamp (technical rung asked only over the ~30d/~56d
Roblox actually retains — a 976-day window went 2,438 -> 230 requests with zero
data lost); an "aged out" bucket in the grab report (10192528661 went from
12,382 rows filed as "real problems" to 30); **F19**, learned templates carrying
other games' dimension values (910 of 1,000 rows; 314 empty-200 funnel requests
under 14 foreign funnel names); and a Playwright driver so grabs run from the
CLI.

**Four bugs of mine, in one feature:**

1. **Wrong message type** — sent `collector-cmd`, the receiver listens for
   `collector:cmd`. The hyphen form is the *next hop*. Unknown types fall
   through to `else return`, so the call resolved `undefined` instantly and the
   grab never started. **Failure mode 4** (I read a function name instead of the
   dispatcher) and the root cause of an hour of wrong-tree debugging.
2. **`--lifetime` hardcoded to 2021-01-01** on a game created 2026-02-19. The
   gateway 400s an over-wide ask, so DAU took 15 x 400 and landed 44 days of a
   161-day span. The flag was destroying the data it existed to collect. Now
   resolves the real creation date.
3. **Probed `__RBX_COLLECTOR_LOADED__`** from `page.evaluate` — it lives in the
   ISOLATED world and can never be visible there, so a working extension always
   reported as broken.
4. **Treated `{ok:false}` as "still running"**, so a refused grab looked
   identical to a slow one.

**The pattern worth keeping:** three of the four were bugs in my own
*instrumentation*, and I kept adding guards around a message that was never
being handled. Ren's words: *"You've found so many bugs so far but they haven't
fixed anything."* Correct. **Before adding a guard, confirm the thing you are
guarding is on the path at all** — one read of the receiver's dispatcher would
have ended it immediately.

**Also corrected:** `CLAUDE.md` said Supabase was a placeholder with no project
behind it and that DB failures were "the steady state". It is live with 1,000
rows — and believing it was dead is exactly why nobody looked at the unscoped
shared table behind F19. Same file wrongly called 10192528661 a "test universe";
it is a portfolio game.

**Portfolio corrected:** the tool held 8 games; Ren's actual list is 11.
Newly added — **Poison Treats (8507699752, 114M visits, the largest title and we
had nothing)**, Moon Incremental (7888930431) and Flip A Coin (9537928732).
Dropped Shoot a Brainrot (8220738785): reachable, but no metrics permission.
**Moon Incremental is the only game with real funnel instrumentation**
(`WorldProgress`, `AscensionProgress`, 15 steps) — the one place "where do new
players give up" is measurable rather than inferred.

## 2026-09-04 — "only one game has funnels" — wrong, and backwards

**Claimed:** Moon Incremental (7888930431) is the only game in the portfolio
with real funnel instrumentation, so "where do new players give up" is
unanswerable elsewhere and would need a dev to add `LogOnboardingFunnelStepEvent`.

**RETRACTED the same evening, by Ren.** Seven games carry funnel data:

| game | steps | step names |
|---|---|---|
| Verity | 36 | `1 Minute`, `10 Minutes`, `1 Sent`, `10 Sent` |
| Become a Brainrot | 28 | `BaseUpgrade1..12`, `PlayerProgression` |
| Moon Incremental | 21 | `11`, `12`, `13` — **bare integers** |
| Seal A Driveway | 17 | `Airport`, `DrivewaySealed`, `EstateDistrict` |
| Waterslide | 15 | `Tutorial_Main_1_StartSwim`, `_10_BuyEgg`, `_11_OpenPetBag` |
| +1 Banana Monkey | 7 | `Collected a Banana`, `Completed Tutorial (Part 1-3)` |
| KameHameHa | 5 | `Cross Starting Line`, `Grab First Brainrot` |

Moon Incremental is in fact the **worst** of the seven — the only one whose
steps are unnamed integers. Waterslide's `Tutorial_Main_*` is a textbook
onboarding funnel.

**Cause: failure mode 1, generalised from a single observation.** I read the
"Discovered dimension values" line of ONE grab report, saw funnel names in it,
and concluded the others had none — without opening a second report or listing
`metrics/Funnel*.csv`, which takes thirty seconds and is what settled it.

**Why it mattered:** it inverted the main recommendation. I told Ren the research
brief's central gap — "nothing we grab can locate where a new player gives up" —
was real and needed dev work. It is already answerable on six games with data
we have been pulling for weeks. **A wrong "we cannot measure this" is more
expensive than a wrong number: it closes a line of enquiry instead of opening
one.** Before declaring anything unmeasurable, list the files.

**Also corrected by Ren the same evening:** the portfolio is 12 games, not 10 —
`7364907416` Plane Training (52.7M visits, third largest) and `8669915245`
Don't Wake The Police (6.8M) were both missing, and I had reported the list as
complete after checking only the groups whose names matched my filters.

## 2026-09-04 (late) — the skeptic found a real defect in my panel

**RETRACTED: the entire 12-game panel, and both conclusions built on it.**

`is_headline()` in `analysis/panel.py` declared six FILTER-ONLY series to be the
unbroken-down total: `IsNewUser=New`, `IsNewUser=Returning`, and three
`AcquisitionSource=…` variants. The mechanism: `parse_series` only populated
`filt` when the series string contained `" · "`, so a series whose entire name
*is* a filter landed in `headpart`, failed the `Dim: value` regex, and returned
an empty `filt` — which `is_headline` then short-circuited to `True`.

Because the daily table is last-write-wins, **`DailyActiveUsers` was the
`IsNewUser=Returning` slice on every game-day of all 12 games** — 17.6% to 54.5%
of true DAU. Brainrot 2026-08-20: true 162,717, panel said 129,987. 8.00% of
aggregate cells were written by a population slice. The same class of error hit
`by_source.csv`, so **the Home-reach series defining every J0 was the new-user
slice**.

**What it changed once fixed:**
- Brainrot 4 pullback events -> **1**. The "3 of 4 FRAGILE" I reported was the
  artefact, not a stepped decline.
- Poison Treats 1 -> **3**, two of them inside its own Track A outcome window.
- Pre-RFY event set 6 -> 8; every event now fires at 9/9 settings, not 8/9.
- **Track A's negative does not survive.** Real 2.25 LEADS/window against a
  placebo of 1.12. The skeptic's fairer placebo — random cut dates >=30 days
  from any detected pullback, rather than my +/-60/90 offsets which sat *inside*
  the decline — gives 2.00 vs 0.98, Fisher p = 0.022. The honest label is
  **underpowered and inconclusive**, not "nothing leads".
- **"DAU was rising before three of six pullbacks" (z +2.2/+2.1/+3.1) is
  withdrawn.** That was the Returning slice; on true DAU it is +0.9/+1.3/+1.6,
  and residualised on log Home reach it is -0.0/-0.1/+0.5.
- Phase 6 survives: calendar +0.028 vs lifecycle +0.266, p = 0.045.

**Why I did not catch it.** I *did* test the panel when an agent flagged it —
and my test was wrong. I checked whether more than one series passes
`is_headline()` per metric FILE. The collision is per game-metric-DAY, so a file
with exactly one passing series per day but the *wrong* one looks clean. I
reported "0 metrics affected" and moved on. **Failure mode 4: a test built so it
could only return the answer I expected.** The right test compares the panel's
value against the raw `Total` row for the same game, metric and date — one line,
and it would have failed immediately.

**Standing rule now:** when someone reports a defect you cannot reproduce, state
the exact test you ran before concluding they were wrong. Mine was one sentence
away from being visibly inadequate.

## 2026-09-04 — "Banana Monkey's funnel died on 18 July" — RETRACTED by Ren

**Claimed:** `Sold Bananas` and `Completed Tutorial (Part 1/2/3)` read exactly
0.0000 for 46 consecutive days while the preceding step kept reporting 95-100%,
therefore the events stopped firing on 2026-07-18 and the studio has been blind
to its own tutorial completion since July.

**Wrong.** Ren: *"for monkey youre hallucinating, the funnels are only joined
punched collected a banana."* Density check:

| step | non-zero days |
|---|---|
| Joined / Punched / Collected a Banana | **54 of 54** |
| Sold Bananas | 7 of 54 |
| Completed Tutorial (Part 1 / 2 / 3) | 7 / 7 / 6 of 54 |

Those four were **never a working funnel** — 6-7 days of data out of 54, at the
very start of the series. Not "healthy then broken", which is what my sentence
implied and what makes it a defect claim rather than a coverage note.

**Cause: I read ONE number and built a story on it.** I printed `last non-zero =
2026-07-18` and interpreted it as a break date, without ever asking how many
non-zero days there were in total. The line above it in my own output would have
answered it.

**Control, now in `analysis/phase5.py`:** a density guard. A step must fire on
>=50% of observed days to enter the comparison at all; anything sparser is
listed separately as *never-populated*, explicitly because it has no baseline to
have moved from. This is the same rule Ren gave earlier — a level is not a
finding without a baseline — applied to the step's existence rather than its value.

**What is actually true, and it still matters:** Banana Monkey instruments
`Joined -> Punched -> Collected a Banana` and nothing after. That is roughly the
first thirty seconds. Its D2-7 play-days fell 35% alongside the reach pullback,
and **the instrumentation cannot locate where that loss happens** — the funnel
ends long before the players do. That is a real gap, and it is the honest
version of what I said: not a broken funnel, a short one.

## 2026-09-05 — the Waterslide counterexample was an averaging artefact

**RETRACTED: "Waterslide lost 79.8% of Home reach while its D8-28 signals moved
-3%."** Delivered 09-03 as finding 09's flagship evidence that quality holds
while Roblox withdraws reach. The -3% was a pre/post average over a window that
straddled the break. By day: **0.115 -> 0.093, -19%, starting 25 Aug** - exactly
when cohorts arriving 17-21 Aug reach their D8 window, which is the lag a
progression bug shipped on 21 Aug must produce.

**REOPENED: `Waterslide Update Watch 2026-08-14` ("v1698 broke nothing"),
previously HELD.** True about crashes and server errors, silent about
progression - which is all the watch checks. First-play bounce went 10.0%
(8 Aug) -> 13.6% (15 Aug) and never returned.

**NARROWED: "Seal's bounce is within benchmark."** A cohort percentile is not a
health verdict. Absolute: **38.9% of first sessions end inside 180s**, and the
61-180s band at **24.2% is the worst in the portfolio** (median 14.8%), rising
27.8% -> 41.6% between 16 and 30 Aug. Onboarding completes fine
(`ReachedDriveway` 97.2%), so the loss is post-tutorial. Owed: an audience-mix
control.

**OPEN, and urgent before it reaches a dev team:** our data holds both **63% and
97%** for Seal's `ReachedDriveway` in the same window. The 63% series pools three
funnel names in one `FunnelName` filter. Settle against the dashboard.

**Failure mode 7 - a control applied to a hypothesis that was never searched.**
A placebo across every cut date corrects for *searching*. When the date comes
from a deploy log or a bug report, no search happened and no penalty is owed. I
charged the 21 Aug ship the scan penalty (rank 16/78, p=0.21) and buried a real
finding. Compounding it: a placebo drawn from the same series has no true nulls
when the phenomenon recurs - June outranked 22 Aug because June is another
instance. **Control: state where the date came from before choosing the test.
I picked it -> control owed. A deploy log or feedback picked it -> none.**

**Failure mode 8 - every test detects steps; bugs that need a rejoin produce
ramps.** Nothing in the suite could see a two-week monotone deterioration, which
is what both Seal's bounce and Waterslide's D8-28 actually are.

**Still true and kept, against the update theory:** July bounce hit 18.7% and
reach then doubled. Bounce alone does not predict a pullback. Waterslide shipped
on 14 of 31 August days, so timing alone can never carry an update claim.

---

## Recurring failure modes, and the control that catches each

| # | Failure mode | Where it has bitten | The control |
|---|---|---|---|
| 1 | **A rule inferred from one observation.** | "Peak lands at 13:00" (one day) · "no update moved anything" (one date) · "D1 <12.5% cuts traffic" (an association) | State n before leaning on a rule. If n=1, say so in the sentence. Scan every candidate date rather than testing the one you expect. |
| 2 | **The wrong series read as the headline.** | PCU ONE_DAY = sum of per-platform peaks (30% high) · `series[0]` fallback printing a 30,393-crash incident as "5" · an OOM figure read 0→36→50 when the real series was 344→400→179 (the Tablet slice) | `totalSeries()` only. Filter the `granularity` column. A partial max is a floor, not a ceiling. |
| 3 | **A trend fitted as a step.** | Seal "−71% DAU from the update, p=0.002" · every change point on a trending series | Placebo cut dates, always. Report the **smear fraction** — what share of candidate dates also fire. On the 09-03 run, 40–86% smear killed most apparent breaks. |
| 4 | **A test built asymmetrically in favour of the hypothesis.** | 09-03 lag search (7 lags forward, 1 back) · reach quintiles with no time control | Both directions get the identical procedure. Correct for the search. Control for time and weekday before believing any cross-sectional pattern. |
| 5 | **A rate compared across cohorts.** | Verity "best hook, +115%, above 90th percentile" — same D1 as Brainrot, half the bar | Lead with the absolute number. Percentiles are per-game cohorts and never comparable across games. |
| 6 | **Diagnosing the pipeline without checking the checkout.** | F17 — reported the Open Cloud path ingesting zero points; the tree was 5 commits behind origin | `git fetch && git log HEAD..origin` before calling anything a pipeline defect. This repo is worked from two machines. |

---

## Open items this log is tracking

- **Knife Farm (9610561918).** The 08-09 mechanism claim has never been tested
  with the RFY signals. Highest-value re-test available.
- **Onboarding funnel instrumentation.** Nothing we grab can locate *where* a
  new player gives up. That needs `LogOnboardingFunnelStepEvent` in-game, which
  is a dev ask, not a grabber change. It is the difference between "bounce rose"
  and "they quit at the third tutorial step, on Phone".
- **Competition / seasonality / Discovery-side changes.** Roblox names all three
  as reach factors and we observe none of them. Every "the algorithm withdrew
  the push" statement is a description of shape until one of these is measured.
- **`ItemMonetizationRevenue` freeze policy.** Systematically understated in the
  corpus (restated up to 21×, always upward). Any report quoting it is wrong in
  the same direction. Decide whether it switches to last-write-wins.
- **F13 / F15** unfixed and F13 not encoded as a test.

---

## 2026-09-08 — Update 04.09, five games, and a spec-mapping error

Five builds shipped inside eight hours on 2026-09-04 and all five were graded at
T+4d from one browser grab each (08 Sep 12:38-12:44 UTC, window 12 Aug - 9 Sep;
1,307 requests, 1,071 with data). Reports published as six artifacts (cover +
one per game). Gates on the day: `npm test` 51/51 · `audit-plan` 180 templates,
0 failures · `verify` 24 pass / 2 fail / 7 skip.

| Game | Version | Published UTC | Verdict |
|---|---|---|---|
| Brainrot `9963622286` | v608 | 04 Sep 12:17:52 | **OK.** Nothing broken; CVR +17.2%, Rebirth1 +2.3pp; D1 rise contaminated by the new 4-day quest |
| Banana Monkey `10399712766` | v1246 | 04 Sep 17:35:02 | **WATCH.** Technically cleanest; decline began 31 Aug; sessions ~7% below trend on all 3 post days |
| Waterslide `10030829154` | v1719 | 04 Sep 19:12:51 | **FIX (chronic).** Build clean; the 23 Aug raft-shop `CanvasPosition` defect is still live — 9 reports across 5 builds |
| Verity `10565445771` | v684 → v688 06 Sep | 04 Sep 19:40:46 | **OK + WATCH.** CVR +45.2%, DevProduct +57%; first-play bounce is a ramp from 01 Sep |
| Seal `10638354731` | v914 | 04 Sep 20:22:33 | **FIX.** Onboarding completion 68.1→74.0%; v914 introduced DataStore save failures |

**RETRACTED IN-SESSION, before delivery — the spec mapping.** I credited v684
with Verity's daily/returning-player rewards and the 99R personalities, and v914
with Seal's sealer colours, friend-invite boost and like/group reward. **All six
are unreleased** — Verity's block is a later update, Seal's is headed
*Update 10.09*. Ren caught it: *"the date is literally written"*. The
measurements were unaffected; every attribution built on them was. Re-cut: v684
is alternative endings + the skins shop, v914 is mobile UI + squeegee VFX +
rebirth UI + the tutorial rework.

Once re-cut, the Verity result got **stronger and more specific**: the free skin
unlocks at "over 50 messages", and the share of message-senders reaching 50 went
7.1% → 10.5% on matched Saturdays. The mechanism names its own threshold. Ren's
cannibalisation worry is about the *unreleased* block, so the report now carries
a pre-registered four-row baseline instead of an answer.

**Two more in-session retractions:**

1. **Verity's bounce rise is a ramp, not a step.** Read from the publish onward
   it looks like a clean break at v684 (z 3.55, 3.40). Printing the pre-update
   days shows it climbing from 01 Sep — three days earlier, alongside thumbnail
   swaps on 01 and 02 Sep and the v680 publish on 31 Aug. Failure mode 3 + 8.
   The claim is now "v684 did not start it and may have steepened it".
2. **Brainrot's funnel did not collapse.** Merged across funnels by step index,
   its deep steps appeared to fall 11pp over the newest three days. Pulled per
   funnel name, `BaseUpgrade20` has no data at all and every real step is flat
   or up — the merged view attaches one funnel's label to another's numbers on
   immature cohort days.

**Method gain worth keeping: the gateway path DOES serve a working `FunnelName`
filter.** `CLAUDE.md` records that the filter returns 0 series always — that is
true on **Open Cloud only**. The browser path returns 36 daily points per
(FunnelName, FunnelStep), which un-blends every funnel on every game. It is what
settled Seal's 63%-vs-97% `ReachedDriveway` ambiguity (97.4% is Onboarding; 63%
was the merged blend) and what produced the per-funnel tables in all five
reports. `/tmp/pf.js` reads it straight out of `series.json`.

**New failure mode for the table below — 9. An attribution built on an unchecked
premise.** Every number can be right and the finding still wrong, because the
thing it is attributed to does not exist. Control: name the shipped list at the
top of the report, cross-check the date header against `place-versions.csv` and
the `EXPERIENCE_EVENT_STATE` annotation, and exclude anything marked DELAYED or
PAUSED inside a shipped block.

**Still blocked on all five: error message TEXT.** `MessageHash` 500s on every
universe. Seal has a 05 Sep v914 export and it is the only reason that report
can name its defect. Verity is 6 builds stale, Waterslide predates the build,
Brainrot is 8 builds stale, and **Banana Monkey has still never had one filed**.

---

## 2026-09-09 — the record-low CCU read, and the first measured floor

Ren: *"ccu for verity, seal and monkey are looking critical rn, all time low
pretty sure... theres no way were this low in ccu."* Then, mid-read: *"even
become a brainrot is higher than monkey and seal, if u told me that 1 week ago i
wouldve js laughed at ur face."*

**Both observations were correct and the second one is the finding.**

| Date | Deliverable | Headline claim | Status | Notes |
|---|---|---|---|---|
| 09-09 | `One Curve, Five Games` (cover) | The lows are real, but it is one decay curve at five speeds, not five incidents. Brainrot is above Monkey and Seal because it reached its floor first, not because it improved. | **OPEN** | Rests on 5 games' full-life weekly DAU. Brainrot flat at 84–97K for a fortnight after −90.7% off peak; Monkey is already *below* it at 61K. The floor generalisation is n=1 and is flagged as such in the report. |
| 09-09 | `Banana Monkey Bounce Break` | The only genuine product regression of the five. `RFYDuration0To60` = 13.54% on 07-09, **lifetime max, z = +3.20** on a 50-day window; session length 12.27 min, lifetime low. | **OPEN** | Strengthened by an inversion argument: bounce and reach normally move oppositely on this game (bounce was at its *lowest*, 7.8–9.5%, during the 8–11M impression push). Both now move together, which the dilution story cannot produce. Not dated to a build — bounce ramps across v1244 and v1246 rather than stepping at either, and the report says so. |
| 09-09 | `Seal A Driveway Listing Collapse` | The game is fine and improving; Home click-to-play fell 8.47% → 2.76% between 28 Aug and 02 Sep, then plateaued. | **OPEN** | Five instruments say the game did not regress (bounce −6.0%, session +2.3%, D1 playtime +4.6%, playtime/DAU +1.1%, payer CVR +58%). Thumbnail revert proposed as the discriminating experiment; explicitly labelled circumstantial. |
| 09-09 | `Verity Free Messages at T+1d` | All four pre-registered cannibalisation rows are **NO DATA**; first honest read is 11 Sep. | **HELD** | This is the pre-registration working as designed. v689/v690 shipped 08-09 10:07/10:47 UTC; the money rung reads to 09-07, entirely pre-publish. |

**Caught before it shipped — the failure mode was #4, an instrument fault read as
a game event.** Verity's `ClientFpsP10` for 09-08 reads **9.71** against 45.30 the
day before, and memory 0.044 against 0.216. The build had shipped that morning,
so the obvious write-up was "the free-message update destroyed client
performance." It is a **Roblox telemetry fault**: the same ~78% collapse appears
on *all five* universes on 09-08, session length and crash rate stay flat on every
one, memory falls *with* FPS, every `Platform` slice drops by the same ratio, and
09-09 recovers with no publish. Open Cloud serves the identical values, so it is
not our pipeline. Logged as **F28** in `data/verify/COVERAGE.md` and in Verity's
`data-quality.md`.

**The general rule this adds:** a technical regression that appears on every
unrelated universe at once is an instrument fault, not five incidents. It is the
cheapest cross-check in the file and it costs one query per game.

**One claim deliberately NOT made.** The first pass computed a
d-log-impressions vs d-log-CVR correlation to argue Seal's listing lost appeal.
On a clean post-launch window it is r = +0.30 at n = 15, which supports nothing,
and the earlier r = −0.86 was contaminated by Seal's own launch ramp. Dropped
rather than reported. The Home-surface conversion *level* carries the Seal claim
instead, and that is a measurement rather than an inference.

**Method note — the funnel could not localise Monkey.** Its instrumented funnel
is three steps (`Joined`, `Punched`, `Collected a Banana`), all firing in the
first seconds and all at 92–96%. A player completes all three and still leaves
inside 60s. **The instrumentation stops before the place the player is lost**,
which is why a real, large, lifetime-extreme regression produced no funnel
signal, no error and no crash. Recorded as the cheapest fix on that game.

### 2026-09-09, same session — both game diagnoses reversed by Ren's hands-on knowledge

| Claim | Status | What happened |
|---|---|---|
| "Banana Monkey is the only game of five with a genuine product regression" (bounce 13.54%, lifetime max, z = +3.20) | **RETRACTED** | Ren: *"i did play monkey for 60 s and didnt see anything once agian, the game is literally fine."* Correct. Bucketing post-peak days by decay depth, **Brainrot ran 15.06% mean / 17.93% worst bounce at the same depth where Monkey now runs 12.63% / 13.54%** — Monkey's all-time worst is better than the control's average, and Brainrot then recovered to 12.79% unaided. Bounce rises monotonically with decay depth on both games. |
| "Seal A Driveway is fine, do not bug-hunt" | **RETRACTED** | Ren: *"seal still has the performance issues, and a progression blocker, like the airport road cannot be completed, its the last one, it blocks u from rebirthing."* All confirmed in the game's own log. |

**Failure mode: a z-score against a game's own history, on a game riding a
lifecycle curve.** The 50-day window used for Monkey's mean was dominated by its
peak, when reach was huge and bounce structurally low. Every day of the decline
then reads as an outlier, and I reported the artifact as a defect. **The fix is a
control game at the same decay depth**, which this portfolio now has because
Brainrot completed the curve first. This is a NEW recurring failure mode and it is
not in the existing six — closest is "wrong baseline", but the specific trap is
that the baseline is *internally* valid and still wrong.

**Second lesson, and it is the same one as 2026-08-10 §5b:** four other tests on
Monkey all came back negative (errors down, crashes down, v1246 export 882
events, funnel flat, FPS up on every platform, D1 fell *hardest on Computer*
which excludes a render regression). I read that as an unexplained absence and
went looking harder, instead of treating it as agreement. **Converging negatives
are a result.** Ren has now played Monkey twice on my prompting and found nothing
both times; that is two people-hours spent on a defect the data never supported.

---

## 2026-09-09 — Seal A Driveway: the coverage blocker (CONFIRMED, code-level)

Found by searching the filed error exports after Ren named the symptom. The game
prints its own diagnosis:

    [DrivewayServer] <Player> finished Workspace.Airport.Taxiways.Taxiway_B
    but the server had only seen 0.90 coverage (needs 0.93)
    -- not paid and NOT recorded

**Mechanism:** the client decides a surface is finished; the server keeps an
independent coverage figure and requires **0.93**; when it falls short the
completion is discarded — no payment, no record. The airport taxiway misses by
three points, which is exactly a road that can never be completed.

**Breadth:** in the 09-09 export filtered to v914, **24 of 25 signatures are this
warning**, across Neighbourhood, EstateDistrict, RetailPark and Airport. Two
distinct regimes: near misses at 0.83–0.92 (server slightly pessimistic) and
0.01–0.34 (server effectively blind to the work).

**Volume is NOT measurable from the export and must not be quoted.** The message
embeds both the surface name and the coverage value, so one defect shreds into
two dozen signatures that consume the entire ~25-row cap — the classic
userId-bearing-message truncation, in a new form. Breadth is established; depth
is not.

**It explains three things previously filed separately:** Ren's rebirth block;
the 09-08 feedback *"terrible game i rebirth and all money has gone"* and 09-06
*"WHY DOESNT TS SAVE?? LIKE WHAT"*; and `RFYD2To7PlayDays` −26.5% on matched
weekdays, which the first version of this session's Seal report dismissed as a
mild caveat.

**Why the aggregates said the game was healthy:** survivorship. Bounce improved
6.0%, session +2.3%, payer CVR +58% — because a player blocked at the airport
leaves the denominator of every per-player average. **An aggregate cannot see a
defect that removes its own victims**, which is the same mechanism recorded for
Seal's Computer performance problem on 2026-09-04.

**Second defect, separate:** `VehicleCamera:173: assertion failed!` at 42,677
events paired with `RunService:fireRenderStepEarlyFunctions unexpected error` at
42,677 — the same throw, **on RenderStep, once per frame**. Plus
`EditableImage is not accessible. Go to the Security Tab in Experience Settings`
at 12,429, which names its own one-toggle fix and sits plausibly upstream of the
coverage shortfall (untested — flagged as a hypothesis, not a chain).

## 2026-09-10 — Seal A Driveway: "the thumbnails are mid" — TESTED, DID NOT SURVIVE

Ren's theory, in their words: PTR declining, lots of thumbnail complaints in
feedback, and drops "kinda around new thumbnails". Two of the three premises are
true and the causal claim is not. Method now in `liveops-diagnosis` §3f.

**Confirmed — the creative is AI, and players resent it.** 7 of 197 feedback rows
name it unprompted: *"Gameplay 10/10. Thumbnail AI/10"*, *"Delete AI thumbnail"*,
*"advertise your experience properly. The actual gameplay looks nothing like the
photos"*, *"it looks nothing like the photo"*. Fetched the images off the
annotations' asset IDs and confirmed by eye — photoreal renders with blocky
Roblox hands composited in. **13 thumbnail swaps in 26 days** (08-14 → 09-08),
one anchor asset (`70795922266029`) present in all 13.

**Confirmed — PTR fell**, 13.13% → 1.31%. But `corr(PTR, log impressions) =
-0.720` and impressions went 279k → 4.89M over the same leg, so most of it is
the denominator.

**KILLED — "drops around new thumbnails".** 10 of 11 swaps are followed by lower
PTR, mean **-25.3%**, which looks conclusive. Against the base rate of non-swap
days it is **-18.9%**, so **z = -1.16, indistinguishable**. Ordinary days did the
same thing because PTR fell monotonically all window. Same test on
`RFYUniqueNotInterestedUsersPerMillionImpressions`: z = -0.69, and that metric —
already per-million-impressions, so reach-immune — trends **-1.85/week at
r = -0.19**, i.e. the listing is *not* being rejected more.

**Bounce is not usable evidence here, and Ren is the one who caught it.** I
argued the creative "attracts fine but they bounce". Bounce is conditional on
conversion — you cannot bounce out of a game you never joined — and Roblox scopes
the signal to RFY-organic traffic only, the exact population a reach expansion
dilutes. `corr(bounce<60s, log impressions) = +0.691`. A matched-reach residual
survives at **+1.38pp, 5/5 pairs**, but n=5. Not enough to carry a claim.

**What it actually is: the product, across every channel.** D1 by
`AcquisitionSource`, early 08-16..08-24 vs late 09-01..09-09 —
HomeRecommendation -20.6%, Others -28.6%, **Friends -26.3%**, Search -31.7%.
All clear 4 sd against their own volatility and 9 sd against binomial noise.
**`Friends` never sees a thumbnail** (social invite) and **Search went looking
for the game by name**; both fell harder than the reach-expanded source. Creative
ruled out, composition ruled out, cause global to the game. Window contains the
v908 publish, the `FIRST UPDATE` (08-28→08-31) and `NEW UPDATE` (09-04→09-07)
events, and the frame-rate collapse fixed the same day.

**My own error, corrected mid-thread:** I called HomeRecommendation "least
affected" off relative change while its z was the *largest* of the four. z
measures confidence (it scales with n), relative change measures effect size.
For a composition question the instrument is effect size; for "did it move", z.
Ren also correctly predicted Search would be noisiest — own sd 3.32pp vs Home's
1.10pp, exactly 3x — it just still clears at 4.5 sd.

**Open:** whether one thumbnail depicting a pothole drain-and-fill mechanic
matches anything in the game. Not in the codebase I read; §5b says that judgement
belongs to someone who plays. Asked, unanswered.

## 2026-09-11 — D+7 diagnosis, five games, window 09-03/04 → 09-11

Docs: `reports/2026-09-11/` (cover + five game docs). Requested by Ren as a
diagnosis, so each doc carries a **separately labelled Interpretation section** —
measurements and causal claims never share a sentence.

**Claims delivered, with the test each rests on:**

| Claim | Status | Test it rests on |
|---|---|---|
| All five games are on staggered decay curves; the window's declines **predate every update in it** | measured | Peak dates 07-25 → 08-28, each game's DAU as % of its own peak |
| **Brainrot is the only game that improved against its own trajectory** — D1 +19.7%, session +4.3%, bounce −9.8% | likely | Residual vs own log-linear decay trend (+2.49 to +5.37 z); D1 up on **all four** acquisition sources incl. `Friends` |
| Brainrot's gain **cannot be credited to v608** | stated as unresolved | First departure is 09-03; v608 published 09-04 12:17 |
| **Monkey fell BELOW its own −8%/day decline on all 14 metrics tested**; engagement broke on the publish day, reach followed 2 days later | likely | Residuals −1.13 to −2.97, none positive; ordering 09-04 → 09-06 |
| Monkey's cause is **global to the game; creative ruled out** | likely | D1 fell on `Friends` (−5.3%) and `Search` (−12.3%); `HomeRecommendation` fell hardest in effect size (−24.3%) |
| **Verity is a conversion story, not a reach cut** — impressions −4.4%, CVR −25.8% | confirmed | Matched-weekday decomposition |
| Verity: **revenue flat (+0.3%) on DAU −23.4%**, paying CVR +15.5% | confirmed | Matched-weekday |
| **Seal's first session improved while distribution collapsed** | confirmed | Six funnel steps up (`Complete` +6.0pp); bounce −12.1%; D1 flat on every source |
| Seal's reach cut is **not necessarily external** — D2–7 play days −19.0% | likely | RFY signal block; §3e says finish the test past D1 |
| **Waterslide barely moved**; loss is conversion; step 5 lost 2pp and propagates | likely | Residuals within 1.5 sd except PTR; funnel steps 1–4 flat, 5–15 all −2.0 to −2.9pp |

**Two instrument failures caught before publication, both recorded in the docs:**

1. **A level baseline is useless on a decaying series.** The first "what moved
   first" pass used a 08-19→08-30 level baseline and returned *every metric on
   every game* as departing on 09-01, the first scan day — because the baseline
   sits high on the decay curve. Replaced with a residual-against-own-trend fit.
   Same failure mode as the Monkey bounce retraction of 2026-09-09.
2. **The replacement instrument does not work on a freshly-peaked game.** Verity
   (peak 08-23) and Seal (peak 08-28) leave 8 and 4 non-Saturday days to fit
   against; the residual scale collapses and Seal returned z = 127, 38, 26.
   **Not reported for those two games** — they are carried on the fit-free
   matched-weekday comparison and make no trend-relative claim.

3. **And it fails on a NON-MONOTONIC window, not just a short one.** Knife Farm
   (since dropped from scope) fitted "flat" over 08-19→09-02 — +0.6%/day DAU —
   and then returned residuals of −4.02, −3.71, −3.47 for the window, which
   reads as "a stable game broke on 09-03". The fit window actually contains a
   **trough (08-24, 14,879 DAU) and a spike (08-29, 45,666)**, and a straight
   line through a V averages to flat. Not reported. **Plot the fit window before
   trusting a trend fit** — "flat trend" and "rose then fell" are the same
   coefficient.

**One number corrected mid-analysis.** Verity's impressions read **+15.7%** on an
unmatched pre/post window and **−4.4%** once both spans were weekday-matched
(Sat·Sun·Mon·Tue·Wed each). The unmatched version would have supported "Roblox
*increased* Verity's reach", which is false. Weekday matching is not a refinement
here; it flips the sign.

**Not claimed, deliberately:** no feature is attributed to any build except
Monkey's auras (named by Roblox's own event annotation). The update specs were
pasted in an earlier conversation and are not in the repo — the same gap that
produced the 2026-09-08 spec-block retraction. Asked Ren to re-send.

**Dropped:** Knife Farm — Ren: *"dead for a fortnight, i dont think it rly matters"*. Re-grabbed (corpus now current to 09-09) but not diagnosed.

**Open:** v689 (Verity daily + group
rewards) has two days and is not assessed; first clean read ~09-15.
