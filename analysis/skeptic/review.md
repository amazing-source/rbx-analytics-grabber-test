# Skeptic review — 12-game panel study

Scripts: `analysis/skeptic/{a1_headline,a2_contam,a3_scope,b1_j0,b2_gaps,c1_phase6,d1_tracka}.py`.
Nothing existing was modified. All numbers below are reproduced from the committed
artefacts at HEAD.

## Verdict

**Six defects, and the panel is not usable as it stands.** `is_headline()` in
`panel.py` classifies six filter-only series — `IsNewUser=New`, `IsNewUser=Returning`
and three `AcquisitionSource=...` strings — as the unbroken-down total, and because
`daily[(uid,d)][metric]` is last-write-wins, **`DailyActiveUsers` in `daily.csv` is the
`IsNewUser=Returning` slice on all 3,191 game-days of all 12 games** (17.6%–54.5% of the
true total). The same bug in `by_source.csv` means the Home-reach series that *defines J0*
is the new-user slice on all 12 games. Fixing it moves the J0 set on 4 of 12 games and
touches 2 of the 6 Track A events. The consequences are not uniform: the "DAU was rising"
claim **dies**, the Track A negative **reverses direction** under a fairer placebo (and was
already contradicted by its own printed numbers), and the J0 *dates* and the Phase 6
lifecycle result survive. The panel must be rebuilt before anything else is believed.

## Defects (the code does not do what it claims)

**D1 — `is_headline()` accepts population filters. SEVERE.**
`parse_series` puts the filter in `filt` only when the string contains `" · "`. A series
whose whole name *is* a filter (`"IsNewUser=Returning"`) lands in `headpart`, fails the
`Dim: value` regex, returns `(None, None, "")`, and `is_headline` short-circuits on
`if not filt: return True`. The `([A-Za-z0-9]+)=` guard never runs.
19 distinct series strings pass `is_headline`; 6 are population slices.
**12,111 of 151,337 aggregate cells (8.00%) are written by a slice**, concentrated in the
metrics that matter: `DailyActiveUsers` 3,191 cells (100%), `UniqueUsersWithImpressions`
3,184, `UniqueUsersWithPlaySessions` 3,184, `AverageSessionLengthMinutes` 2,362.
Worked example — Brainrot 2026-08-20: `data/.../DailyActiveUsers.csv` `Total` = **162,717**;
committed `daily.csv` = **129,987** (`IsNewUser=Returning`). This is CLAUDE.md's
"Data semantics gotchas" rule verbatim, and failure mode 2 in `DIAGNOSIS_LOG.md`.
*Fix:* apply the `=`-token test to `headpart` as well as `filt`; then assert one winner per
(game, metric, date) and fail loudly on collision.

> **Note for the coordinator:** the other agent's null result is a false negative from the
> wrong test. Counting *how many series pass `is_headline`* per metric-file finds the
> problem only if you also key on **date** — the collision is per game-metric-**day**, and
> an `IsNewUser=` row exists on days when `Total` also does. Reproduce with
> `python analysis/skeptic/a2_contam.py`. It is not five metrics; it is five metrics
> **plus every downstream consumer**, because `by_source.csv` is hit too.

**D2 — `by_source.csv` discards the filter half of a compound series. SEVERE.**
`AcquisitionSource: HomeRecommendation` and
`AcquisitionSource: HomeRecommendation · IsNewUser=New` both emit `source=HomeRecommendation`.
`pullback.home_reach()` and `phase6.home` take last-write-wins and get the **new-user slice
on all 12 games**. Brainrot 2026-08-20: 757,552 instead of 1,233,272 (−38.6%).
Rebuilding reach from the unfiltered breakdown changes the J0 set on **4/12 games**:
Brainrot **4 events → 1** (07-02/07-11/07-21/08-03 → a single 07-10 — the "3 of 4 FRAGILE"
was mostly an artefact), Poison Treats **1 → 3** (12-01 plus 12-16 and 12-31, both *inside*
its Track A J+8..J+28 outcome window), Knife Farm 05-06→05-07, Don't Wake Police
**10-13→10-14** (a Track A event).

**D3 — `pullback.py` claims "gap-fills excluded"; it cannot be.** `by_source.csv` carries no
`status` column, so the gap-fill flag is unavailable at that point. What the code actually
does is `if s[d] > 0`, which drops **every FILLED_ZERO day** — 481 of 577 on KameHameHa,
264 of 450 on Moon Incremental (a Track A game), all `FILLED_ZERO`, none genuine zeros.
A reach series that collapsed to zero would have the collapse deleted rather than detected.

**D4 — `track_a.py` differences reach in logs and the signal in levels** (`np.diff(np.log(...))`
vs `np.diff(...)`) while the docstring says "daily log-differences" for both. An asymmetric
transformation in a test whose entire discipline is symmetry.

**D5 — `phase6.py`'s reported p is a seed artefact.** `random.seed(7)`, 200 draws, prints
p = 0.035 and "Survives the shuffle". Across ten seeds at the same 200 draws: 0.035, 0.040,
0.055, 0.060, 0.060, 0.060, 0.070, 0.070, 0.080, 0.115 — **seed 7 is the only one under
0.05**; at 400 draws with seed 7 it is 0.070.

**D6 — the FILLED_ZERO flag survives into `daily.csv` and is then ignored by every consumer.**
`track_a.py` explicitly skips the `filled_zero_metrics` column; `pullback.py` and `phase6.py`
read tables that never had it. The flag exists; nothing reads it.

## Threats to validity

**T1 — the Track A negative reverses under a fair placebo. HIGH.** The published placebo
(±60/±90) yields 1.31 LEADS/window against 2.00 at real events — *the script's own output
already shows real > placebo* and the write-up reports NEGATIVE anyway. Building a better
placebo — 48 cut dates drawn at random from each game's own span, ≥30 days from **any**
detected pullback at **any** of the 9 settings — gives **0.98 LEADS/window (47/475 tests)
against 2.00 (12/60) at real events, Fisher p = 0.022** one-sided. The ±60/±90 offsets do sit
inside the decline and inflate the placebo, exactly as suspected. **The negative does not
survive.** It is not thereby a positive: the hits concentrate on D1/D7 retention, the OLS
standard errors have no HAC correction on autocorrelated residuals, and the AR term is lag-1
only. The honest statement is *"underpowered and inconclusive"*, not *"nothing leads"*.

**T2 — 120 tests, not 144.** Ten metrics × 6 events × 2 = 120 run; the stated 144 assumes 12
metrics but `METRICS` holds 10. The expected-hits arithmetic ("about seven by chance") is off
the wrong denominator, and Sidak over 7 *correlated* lags is conservative — which biases
toward the null, i.e. toward the negative being reported.

**T3 — Phase 6's shuffle null is weak, but the result survives a stronger one.** The
peak-shuffle draws anchors from only 10 clustered dates. Anchoring each game on a random date
≥60 days from its own edges (preserving span and autocorrelation) gives **p = 0.018**
(contaminated reach) / **0.022** (fixed). So +0.266 is probably real — but the *published*
p = 0.035 is not reproducible, and the linear-trend + weekday residual does leave curvature in.

**T4 — the August fortnight test uses the wrong scale.** `z = (13-day mean − daily mean) /
daily sd` compares a block mean to a daily standard deviation. Done correctly against the 84
overlapping 13-day block means in the same reference set, 2026-08-12..24 is the **worst block
of 84** — but the five worst blocks all overlap it, so 96 days hold ~7 independent fortnights
and the defensible p is ~0.14, not 0.012. **Direction real, significance not established**;
and the fortnight sits inside its own reference window.

**T5 — an all-time-peak anchor cannot see a pre-peak pullback**, and `peak = max(m[i:])`
after a restart is a *forward-looking* max, not the "running maximum" the docstring promises.

## Presentation issues

**P1 — "DAU was rising before three of six pullbacks (z +2.2, +2.1, +3.1)" is wrong twice.**
Those z's are the `IsNewUser=Returning` slice. On true DAU they are **+0.9, +1.3, +1.6** —
none clears the |z|>2 flag. Residualising DAU on log Home reach over the same window leaves
**−0.0, −0.1, +0.5**: the "rise" is Home reach mechanically dragging DAU, as suspected in (E).
The claim should be withdrawn, not restated.

**P2 — the plan's section K ("Home impressions before 2026-05-01 ... simply do not exist ...
for Plane Training that is 457 of 542 game-days") is false**, and conflates the `RFY*` metric
family with `UniqueUsersWithImpressions` by `AcquisitionSource`. Plane Training has **542**
days of Home-source impressions from 2025-03-11 — which is the only reason Track A can date a
2025-05-06 pullback at all. Constraint 01 is right about `RFY*`; K over-generalises it.

**P3 — the plan's headline counts are stale.** Re-running `panel.py` at HEAD gives 3,191
game-days / 135,197 by_source rows against the published 3,186 / 135,035.

**P4 — `DIAGNOSIS_LOG.md`'s "Open items" still lists onboarding-funnel location as
unanswerable**, retracted in the 09-04 entry of the same file.

## What held up under attack

- **The `ma()` index-vs-calendar worry: HELD.** I expected zero-dropping to make the 3-point
  window span arbitrary calendar distance. Measured: median, p90 and max span are **3, 3, 3
  days on all 11 games; 0 windows exceed 5 days**. The dropped zeros are all in one leading
  run at series start, so contiguity is never broken mid-series. Not a defect.
- **Weekday seasonality cannot trip 0.70: HELD, narrowly.** A purely seasonal series' 3-day MA
  swings to 76.4% of its own maximum at worst (Poison Treats; Brainrot 79.8%, Plane 81.8%).
  Above 0.70 on every game — but **below 0.80 on 5 of 9**, so the 0.80 arm of the sweep is
  partly measuring the calendar. The canonical 0.70 is the right choice and is defensible.
- **J0 *dating* is definition-robust: HELD.** Across 0.60/0.70/0.80 the first J0 moves ≤5 days
  on 9 of 11 games (worst: Brainrot 10 days, Poison Treats 6). **Event *counts* are not** —
  Brainrot is 1/4/2 events at 0.60/0.70/0.80 — so any claim counting events is
  definition-dependent while any claim dating one is not.
- **`partial` exclusion: HELD.** Correctly implemented and effective in `panel.py` and in my
  independent re-reads.
- **`.daily.csv` skipping (F13): HELD** in `panel.py`, `audit.py` and everywhere downstream.
- **`publish_log.py`'s root-place scoping: HELD.** It keys on `rootPlaceId` from the public
  games API, honours `is_published`, and labels feedback-derived dates left-censored. I found
  no way to make it mix a sub-place save into a root publish.
- **Phase 6's lifecycle > calendar conclusion: HELD.** +0.266 vs +0.030, and both figures are
  unchanged (to 3 dp) by the reach fix.

## What I could not check, and why

- **HAC / Newey-West correction of the Granger p-values.** The residuals are autocorrelated
  and the AR control is lag-1 only, so both real and placebo p-values are too small. I could
  not tell how much of the 2.00-vs-0.98 gap survives proper standard errors; that is the next
  test and it is the one that decides whether T1 is a finding or just a broken negative.
- **Whether the exporter or the grabber is the origin of the ambiguous series strings.** I
  attacked `panel.py`; the same collision may exist in `series.json` and `export-files.ts`.
- **`audit.py`'s tables** beyond spot-checking coverage — it feeds the plan's prose, not the
  models, so I deprioritised it.
- **Funnel and by_platform tables.** `by_platform.csv` almost certainly carries the same D2
  duplication (`Platform: Phone · IsNewUser=New`); I confirmed the pattern exists in the raw
  CSVs but did not quantify it. Nothing downstream reads it yet.
