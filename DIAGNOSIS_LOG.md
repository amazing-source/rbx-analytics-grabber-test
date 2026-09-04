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
