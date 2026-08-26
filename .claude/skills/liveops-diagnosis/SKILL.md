---
name: liveops-diagnosis
description: Diagnose a Roblox game's metrics — why DAU/revenue/retention moved, what caused it, and what to do about it. Use whenever reading data/games/<id>/, writing a decline or post-update report, answering "why did X drop", or proposing a fix based on analytics. Covers the diagnostic ladder, Indigo's benchmarks and levers, and the discrimination tests that separate cause from coincidence.
---

# LiveOps diagnosis

A producer acts on what you write: kills a feature, ships a fix, or misses an
outage. The cost of a confident wrong answer is higher than the cost of "I
don't know yet". This skill is the method that keeps the difference visible.

> This file answers **why did a metric move**. For the routine that runs on
> every update whether or not anything moved — the grab cadence around a
> publish, what is readable at which stage, and the report a producer
> receives — use the **`update-watch`** skill, and come back here when
> something has actually moved.

## 0. Earn the right to quote a number

Do this before any analysis. It takes a minute and it has already caught a
30,393-crash incident being reported as "5".

1. **Is the data trustworthy?** From `web/`: `npm run verify -- ../data/verify/<id>/`,
   `npm run audit-plan`, `npm test`. A red gate means numbers may be wrong.
2. **Did the metric actually arrive?** `data/games/<id>/grab-report.md` →
   *Failed — observed/proven shapes*. A metric that 400'd is missing, not zero.
   **An empty result or a failed request is never evidence about the game.**
3. **Is this specific point disputed?** `data/games/<id>/data-quality.md`. A
   `revision` row means the gateway served two different values for that point.
4. **Which series is this?** The headline is the series with an **empty
   breakdown**. A `Place=` filter still counts as the whole; `IsNewUser=New` or
   `AcquisitionSource=` is a slice. Quoting a slice as the total is the single
   most damaging error this pipeline has made.
5. **Is the point settled?** Never quote a point flagged `partial` (interval
   unfinished at capture). `FILLED_ZERO` is a synthesized zero, not a reading.
6. **Is the comparison like-for-like on day of week?** Several metrics carry a
   hard weekly shape. On 9963622286 `PeakConcurrentPlayers` spiked 3–5× on
   **all five Saturdays** in the window — that is the game's rhythm, not an
   artifact and not an event. Compare Monday to Monday, or use a 7-day mean.

**The most common false alarm, and it will arrive as an urgent message.**
"We just dropped 50%" is usually today's partial point. On 2026-08-10 a grab
captured at 07:39 UTC put `PeakConcurrentPlayers` at 1,660 against 3,626 the day
before — read as "another 50% gone". It was **7.6 hours of a day whose peak lands
at ~12:30 UTC**, so the day had not reached its peak yet; 134 rows in that grab
carried `partial`. The last *settled* day was flat against the week.

So, before answering any "it just fell off a cliff" question, in this order:
**(a)** is the latest point `partial`; **(b)** is the comparison same-weekday;
**(c)** what does the last settled full day say. Only then look for a cause.
Getting this wrong sends a producer to fix something that did not happen — and
the real finding underneath (a genuine −62% week-over-week on weekdays) gets
buried under a number that falls apart on inspection.

**Retention lags ~2 days and the chart's right edge is always falling.** D1 for
day D cannot settle until D+1 is over, and Roblox's retention pipeline adds
about another day: a grab at 2026-08-10 14:28 UTC returned **no D1 past
2026-08-07**. So the last one or two points of any retention chart read low
every day, on every game, regardless of what is happening. This arrives as
"D1 is still dropping" from someone reading the dashboard. Check the newest
*settled* point before answering. Related: a deploy at 17:14 UTC means that
day's cohort is mostly pre-fix, so the first day that tests a fix is the day
*after* it ships.

**A window aggregate can hide a series that doubled.** `NONE`-granularity
metrics return one number per requested window, so comparing two windows and
finding them equal proves nothing — both may average the same swing. On
9963622286 the `Rebirth1` churn aggregate read 0.6144 full-life vs 0.6137
post-break, which was written up as an immovable structural gate; the daily
series ran **24% → 48% → 35%** underneath it. **Before calling anything
structural, plot it daily.** If no daily series exists, say "level unknown over
time" rather than inferring stability from two aggregates agreeing.

## 0b. Pick the window before you pick the cause

Two windows answer two different questions, and mixing them up is how a
coincidence gets written up as a finding.

| Window | Answers | Fails at |
|---|---|---|
| **~28 days** | *What changed, and when.* Day-level resolution: a step on one date, a deploy, a crash spike | No base rate. Every event looks causal because there is nothing to compare it to |
| **Full history** | *Is this event actually the story.* Shape, cadence, how often this已 happened | Smooths away the day a thing broke. A weekly mean would never show D1 stepping 16.8% → 14.3% overnight |

**Run them in this order. The order is the method:**

1. **Full history first.** What shape is this — a slide, an oscillation, a
   single step, a plateau? How many times has this already happened?
2. **If the recent move is unlike anything before it**, it is a real event.
   Zoom to ~28 days and find the day and the cause.
3. **If it looks like the previous three**, do not explain the event. Explain
   the **pattern**. The cause is structural and the "event" is the latest
   instance of it.

*Worked both ways, 2026-08-09.* Knife Farm was case 3 and I diagnosed it as
case 2: three collapses in four months, and I explained only the last one.
Become a Brainrot is genuinely case 2 — it was climbing to an all-time peak on
2026-06-28 and then turned, which resembles nothing earlier in its life — so a
dated cause is worth hunting there.

**Do not let Roblox's storage limits choose your window.** Crash and
performance data exists for ~30 days, so the technical rung is always short
whether you like it or not; behavioural data runs months. Diagnosing off 28
days because that is what the perf tab holds means the retention horizon picked
your analysis window.

Rough mapping from question to window: *"did our update break something"* is a
short-window question; *"why is this game bleeding"* and *"should we buy this"*
are long-window questions, and most acquisition and LiveOps work is the latter.

**Never compare today against whole days.** `PeakConcurrentPlayers` is a
*maximum* over the day, so a partial day can only ever undercount and a raw
comparison manufactures a collapse that is not there. Compare the **same clock
window on both days** at half-hour granularity — and pick the same weekday, since
the intraday shape differs. Measured 2026-08-23 on `10030829154`: the raw daily
number read −56% against the peak, while an hour-matched read against the prior
Sunday gave −26% at peak-in-window. Both are "true"; only the second answers
*is today unusual*. Report the direction of the **gap over the day** too — one
that widens through the morning and then plateaus means players arrived and
left, not that fewer arrived.

**Rank the day against its own weekday before calling it a low.** The same
session began from "CCU is at an all-time low" and "yesterday's Saturday was
terrible". Neither survived: the 28-day low was six days *earlier*, and that
Saturday came in **2nd of the last 4 Saturdays, +27% above the Saturday
median**. A single alarming number is almost always a weekday-shape artifact or
a partial-day artifact until proven otherwise.

**But NEVER benchmark against the window's minimum. "Not a new low" is not an
answer.** Measured 2026-08-24 on `10030829154`, and it is the inverse failure of
the paragraph above: today's concurrents were reported as fine because 2,993 sat
above the 22-day low of 2,675. The 22-day **mean** was 5,453 and the prior
week's plateau was 7,476 — the day was −45% against typical and −60% against
last week. A trough is one day; it is not a baseline. The same error graded
9963622286 as "recovering, +21% to +54% WoW" when the comparison week was the
lowest week in its entire series.

**Print four baselines and let them disagree**, plus the day's rank in the
window (`3 of 22`): the window mean, the pre-event baseline, the most recent
stable plateau, and the matched weekday. Call a level normal only when it is
normal against the *typical* level. If the four disagree, that disagreement is
the finding — on Waterslide it separated "unwinding a surge" (−19% vs the
pre-surge base) from "new low" (Knife Farm, −53% against three flat prior
Mondays).

**And test a publish against the base rate of publishes, not against a hand-
picked control day.** Same session: v600 on 9963622286 was first read as a
steeper-than-normal post-publish slide, from two chosen control days. Measured
against *all nine* non-publish days in the window — same two clock times, so the
publish spike is out of the denominator — the afternoon fell **−29.3%** against
a **−29.2%** mean (sd 12.3pp, z = −0.01), milder than two prior publishes.
Every publish on that game spikes then decays; the question is only whether this
one decayed more than usual, and that needs the whole distribution.

**Check whether the decline predates the publish.** A decay leg off a discovery
spike looks exactly like an update regression to anyone reading only the last
three days. On `10030829154` the slide began two days *before* the deploy
(−1.6%, −6.5%) and then steepened 4–7× after it (−5.2%, −21.8%, −35.8%). The
honest finding is "the update did not start this, it steepened it" — which is a
different remediation than either "the update broke the game" or "this is just
decay". Get the pre-publish leg on the page or the producer will hear only one
of the two.

**But "it was already declining" NEVER downgrades a deploy on its own — check
the magnitude, and check which metric.** Measured 2026-08-24 on 9963622286,
and this is the correction to the paragraph above. That game's 30 July deploy
was graded *partial* because impressions had fallen 15% and 25% in the two
weeks before it. Both wrong:

- **Magnitude.** The pre-existing trend was **−4.7%/week**; what followed was
  **−53%/week**. Two things an order of magnitude apart are not the same
  phenomenon, and calling the second a "steepening" of the first understated it
  by 10×. If the post-event rate is not within ~2× the prior rate, it is a new
  event, not a continuation.
- **Wrong metric entirely.** Impressions are *reach*, and since Roblox's
  2026-06-15 re-weighting reach sits **downstream** of retention with a
  multi-week lag (§3b). Using a downstream metric to exonerate a build is
  reading the effect to judge the cause. On a 7-day mean, impressions were
  *rising* in the four days before that deploy (+1.5%, +1.6%, +8.2%, +2.8%).

**To decide whether a deploy broke something, only same-day-responsive metrics
count:** `ForwardD1Retention` **daily** (16.8% → 9.7% in four days here),
`AverageSessionLengthMinutes`, `AveragePlayTimeMinutesPerDAU`, and
`FunnelCohortCompletionRate` per step **mix-controlled** (§3, matched pairs).
Read reach *afterwards*, as a consequence.

**The onboarding-vs-progression split settles it without any other test.**
Onboarding steps holding at 99%+ while progression steps fall is a **core-loop**
break, and it rules out "the traffic got worse" on its own — worse traffic
degrades the first session too. On 9963622286: `FirstMorph` 99.3% flat and
`OnboardingComplete` 100% flat, while `Rebirth1` fell 9.6pp at *identical*
returning-player mix across 25 of 25 matched pairs.

## 0c. A CCU drop is an alarm, not a diagnosis — triage in this order

Measured 2026-08-25, and it inverts the instinct. A concurrents drop is the
loudest signal this portfolio produces and the least informative one. Run these
in order and **stop as soon as one answers it**; each is minutes, and steps 1–2
resolve most alarms before any code is opened.

1. **Is it real?** `npm run ccu-baseline -- <id>`. Matched half-hour slots
   against the same slots on prior days, so a part-finished day is never
   measured against whole ones. Most "we dropped 50%" alarms die here.
2. **Is it us, or everyone?** Run it across every game in the portfolio, and
   check `npm run platform-ccu` history. **If they moved together there is no
   bug in any of them** and nothing in the code will explain it. On 2026-08-25
   five unrelated universes — including a dead one at ~10 CCU — fell together
   on 24 Aug; crash rates, session length and impression-to-play conversion
   were all flat, and Banana Monkey had shipped nothing since 21 Aug.
3. **Did something ship?** `ErrorCount` by `PlaceVersion` dates every deploy
   independently of `place-versions.csv` (which truncates — F12).
4. **Reach or retention?** Decompose into impressions × conversion. Impressions
   collapsing with conversion flat = players stopped *arriving*; conversion
   falling with impressions flat = they stopped *staying*. Opposite fixes.
   Measured 22→24 Aug: impressions −46%/−36%/−28% against conversion
   −8%/−13%/−20%, so exposure was ~65–85% of the loss on all three.
5. **Only if retention or session length actually moved**, open the game — and
   then **funnel first, error export second** (§5c: the expensive defect is
   routinely silent).

**So: bug hunt when retention or session length moved, or when a publish sits in
the window. Never on a CCU move alone.** Twice on 2026-08-25 the defect that
mattered emitted zero log lines — Waterslide's `CanvasPosition` loop, and Knife
Farm's v3831 sell break, whose "errors first seen at version ≥ 3831" totalled
~5,700 events against the 2,022,535 that version inherited.

**You cannot finish the diagnosis on day 0, and should not try.** What is
readable when:

| Signal | Available |
|---|---|
| CCU, crash rate, `ErrorCount` | now |
| DAU, revenue, payers, impressions | **+2 days** |
| Retention | +2 days, and the right edge always reads low |
| Funnel cohorts | +2 days |

"It's real, it's not portfolio-wide, no deploy, crash rates flat — retention
reads Thursday" is a complete day-0 answer. Give it and stop.

**An instrument can come back degenerate, and that is not a finding.** On Knife
Farm `TotalSessionsEndedInBucket` — §1's documented substitute when no funnels
exist — returned days reading 100%/0% across buckets, totals swinging 13K to
399K, and nothing at all after 08-18. Say the instrument failed; never read a
degenerate series as a result.

## 0d. Close your own loop — verification is the analyst's job

The diagnosis is not the deliverable. **Every finding ships with one success
metric and a date to read it**, and on that date you read it and report the
result — shipped or not, moved or not, to the same people who got the original.

This is not process hygiene. Measured 2026-08-25: a six-defect fix list with
line numbers was handed over for 10030829154 on 23 Aug with a stated target of
`Tutorial_Main_5_ToRaftShop` above 0.95. Two days later a read of the live place
at v1711 found **none of the six applied** — two unrelated guards had been added
instead — and the step sat at 81.9%. Nobody had checked. The same studio's
9963622286 *did* ship its 14–15 Aug fixes and recovered (errors per DAU ~110–130
→ ~30, D1 8.8% → 12.7–14.1%, `Rebirth1` +8.3pp).

Same analyst, same method, two games: **the one that shipped the fixes improved
and the one that did not, did not.** So when a report appears to have failed,
test "was it applied" *before* re-opening the diagnosis — and for a silent
defect, reading the live place is the only way to answer that.

**Where the analyst's line actually sits.** Name the mechanism, the *class* of
lever, and its size; the producer picks which lever, who builds it, and when.
Stopping at "reach is falling" is an unfinished analysis, not a handoff — reach
is downstream of retention with a ~4-week lag (§3b), so keep going until
something causal. But picking the game, the person and the date is not yours.

## 1. Diagnose bottom-up, not by what looks interesting

Check rungs in order. A break high on the ladder is usually caused by a break
lower down, and the lowest broken rung is the diagnosis.

| # | Rung | Metrics | Question |
|---|---|---|---|
| 1 | **Reach** | `UniqueUsersWithImpressions`, `RFYQualifiedPTR`, DAU by `AcquisitionSource` | Is Roblox still showing the game to people? |
| 2 | **Hook** | `ForwardD1Retention` (+ by `Platform`), `AverageSessionLengthMinutes` | Do arrivals stay? |
| 3 | **Return loop** | `ForwardD7Retention`, `ForwardD30Retention`, `DauMauStickiness` | Do they come back? |
| 4 | **Money** | `PayingUsersCVR`, `AverageRevenuePerPayingUser`, `AverageRevenuePerUser`, `DailyRevenue` by `RevenueSource` | Do they pay, and how? |
| 5 | **Technical** | `ServerCrashCount`, `ClientCrashRate15m`, `ClientFpsP10`, `OomUnexpectedExits`, `ErrorCount` | Is it breaking underneath? |
| 6 | **Funnel** | `FunnelUserChurnRate`, `FunnelUserStepCompletionRate` | Where exactly do they quit? (only where instrumented) |

Rung 5 is a **rule-out**, not a starting point. Check it early so you can
exclude it, but a crash spike is only the story if the timing survives §3.

### HOW TO PULL FUNNELS. Read this before saying a game has none. (2026-08-26)

**This has now gone wrong on four separate games, always the same way, always
ending in "no funnels instrumented" about a game with a full Funnels page.**
The recipe below is measured against dashboard ground truth on `10638354731`
(4 funnels) and `10565445771` (9 funnels). Follow it exactly.

```
POST https://apis.roblox.com/analytics-query-api/v1/universes/{id}/metrics
x-api-key: <key>
{ "metric": "FunnelUserTotalCount",     // or any of the nine below
  "granularity": "None",                 // "OneDay" for the two Cohort metrics
  "startTime": ..., "endTime": ...,
  "breakdown": ["FunnelStep"],           // the ONLY legal breakdown
  "limit": 500 }
```

**The two things that make funnels look absent when they are not:**

1. **Funnel queries answer ASYNC — HTTP 202 / `done:false` + `path`. You must
   poll.** Poll `https://apis.roblox.com/analytics-query-api/{path}` (the
   `analytics-query-api/` prefix is part of it; `apis.roblox.com/{path}` alone
   404s into nothing). A probe that does not poll reads the 202 as an empty
   answer and reports zero series. **This is the single most common cause of a
   false "no funnels" finding.** `opencloud-grab.ts:208` has the correct loop —
   copy it, don't re-write it.
2. **NEVER send a `FunnelName` filter.** It is accepted and returns **0 series
   always — even for a name you can read off the dashboard tab.** Measured:
   `FunnelName In ["Onboarding"]` on a universe whose Onboarding funnel has
   1,140,668 users returned nothing, and so did a deliberately fake name. The
   filter is non-functional. Drop it and the same query returns every step.
   *Filters are not broken in general* — `Platform In ["Computer"]` and
   `IsNewUser In ["New"]` both filter correctly on the same metrics (Computer
   came back at ~33% of each step, matching its DAU share). `FunnelName` alone
   is the broken one.

**What is and is not legal**, enumerated by probing until the API named each:

| Dimension | On funnel metrics |
|---|---|
| `FunnelStep` | **the only breakdown that works** |
| `FunnelName` | filter-only, and the filter returns nothing — unusable |
| `Platform`, `IsNewUser` | filter-only, and they work |
| `FunnelId`, `FunnelSessionId`, `FunnelStepName`, `FunnelType`, `Place`, `AcquisitionSource`, `CohortDay`, `PlaceVersion` | *"not supported for metric …"* |

All nine funnel metrics answer at `granularity: "None"`:
`FunnelUserTotalCount`, `FunnelStepTotalCount`, `FunnelUserChurnRate`,
`FunnelUserStepCompletionRate`, `FunnelUserOverallCompletionRate`,
`FunnelCohortCompletionRate`, `FunnelCohortSessionCompletionRate`,
`FunnelStepChurnRate`, `FunnelStepCompletionRate`. Only
`FunnelCohortCompletionRate` and `FunnelCohortSessionCompletionRate` also answer
at `OneDay` — those two date a break. `FunnelUserTotalCount` 400s at `OneDay`
("Granularity OneDay is not supported").

**THE CAVEAT THAT MATTERS MOST — steps are merged across every funnel by index.**
`FunnelStep` is an integer position with the name in `displayValue`, and with no
working `FunnelName` filter you get **the union over all funnels**, summed. Where
two funnels share an index, one label wins and the counts are a blend. Measured
on Seal A Driveway: index 1 came back `Neighbourhood` (from MapReach) while the
Onboarding funnel's own step 1 is `Started`, and the merged step-2 completion
read **66.65%** against the dashboard's Onboarding figure of **98.15%**.

So, without qualification:
- **Reliable from Open Cloud:** step names, per-step user volumes, and the daily
  trend per step. Shape and movement are sound.
- **NOT reliable:** any single funnel's completion rate. Never quote a merged
  rate as one funnel's. A game with one funnel is exempt; check the count first.
- **Funnel NAMES and per-funnel separation come from the dashboard Funnels page**
  (the tabs across the top) or the browser path's gateway `v1/dimensions` call.
  Read the tabs and write them into the report — they cost one screenshot and
  they tell you what the studio thought was worth instrumenting.

**`dimension-values` is a dead end — do not spend time on it.**
`POST /analytics-query-api/v1/universes/{id}/dimension-values` exists, accepts
`{metric, dimension, startTime, endTime}`, answers `200 {"values":[]}` for
**everything** including positive controls (`DailyActiveUsers`/`Platform` on a
universe whose Platform breakdowns we hold). The `FunnelName` error message
recommends it; the recommendation does not work.

**Funnel step values carry names — use them.** `FunnelStep` comes back as an
integer with a `displayValue` beside it (`4` → `Rebirth1`). "61% never reach
step 4" is a curiosity; "61% never reach their first rebirth" is a diagnosis.
If a label looks like a bare integer, the name is in `data/raw/` — see G9 in
`COVERAGE.md`.

**Funnels CAN be dated to a day — use `FunnelCohortCompletionRate`.** Corrected
2026-08-10. It is true that `FunnelUserChurnRate` / `FunnelUserStepCompletionRate`
`ONE_DAY · by FunnelStep` 400s, so those give **levels, not trends**. But
`FunnelCohortCompletionRate` and `FunnelCohortSessionCompletionRate` *are*
served at `ONE_DAY` per named step, and they carry the full history (94 days on
9963622286). That is the series that dates a funnel break. This file previously
said no funnel could be dated to a day, which would have made the 7 Aug deploy
effect on Become a Brainrot unmeasurable.

**Two traps on the NONE-granularity funnel series.** The date column is the
**window start**, not a day — a row stamped `2026-08-07` on a 7→10 Aug grab is
the aggregate over all four days. And moving the window changes the number with
no day changing: PlayerProgression `FunnelUserOverallCompletionRate` read 26.73%
from an 11 Jul window and 23.09% from a 7 Aug one. A producer comparing two
screenshots taken with different ranges will report a drop that did not happen.

**No funnels instrumented? Prove it with the recipe above first** — run
`breakdown:["FunnelStep"]`, polled, with no `FunnelName` filter, before you
believe it. Measured 2026-08-26 across the whole portfolio: Knife Farm really
does return **0 steps**, but Waterslide returns 15, Become a Brainrot 20, Banana
Monkey 3, Verity 9 funnels' worth and Seal 4. Only Knife Farm is genuinely
uninstrumented. **Then** use `TotalSessionsEndedInBucket`. Broken down by
`SessionTimeBucket` it gives the session-length distribution, which is the
closest substitute for "where do they quit" — and the <60s and 61–180s bands
are themselves official RFY bounce signals. *Knife Farm: median session ~10 min,
bounce under 60s only 7.6% → 8.7%, i.e. within-session engagement was never the
problem.* A stable bucket profile alongside collapsing D7 is strong evidence the
break is between sessions, not inside them.

## 2. Read the signature, not the single metric

Each cause has a fingerprint across rungs. Match the whole pattern.

| Cause | Reach | Retention | Session | Shape |
|---|---|---|---|---|
| **Discovery/algorithm cut** | ↓↓ | **flat** | flat | Step change on one day; new users fall hardest |
| **Product/update break** | flat at first | **↓** | ↓ | Starts at a publish; sustained; funnel breaks at one step |
| **Technical/outage** | flat | ↓ during only | ↓ during only | Recovers when the fault clears |
| **Monetization change** | flat | flat | flat | Only rung 4 moves |
| **Lifecycle decay** | ↓ gradual | slow ↓ | flat | Smooth curve, no step, matches genre decline |
| **Audience exhaustion** | ↓↓ **and QPTR ↓** | flat or **improving** | flat or improving | Smooth; and new creative stops working — early thumbnail swaps moved QPTR, late ones did nothing |

**Improving quality metrics during a collapse is not a contradiction — it is a
diagnosis.** Climb Up Mountain died with retention, session length and paying
conversion all rising while QPTR halved (7.33% → 3.65%) and impressions fell
82%: the remaining players were the enthusiasts, and there was nobody new left
to reach. Do not "fix" the product in that state.

**Retention flat while reach collapses = discovery, not product.** That single
contrast has carried more diagnoses here than any other.

## 3. Discrimination — the step that makes it a diagnosis

For every candidate cause, name the test that could falsify it, then run it.
A hypothesis that survives nothing is not a finding.

- **Does the effect outlive the cause?** If X stopped and the metric kept
  falling, X is not the cause. *Become a Brainrot: crashes ended 2 Aug, DAU
  kept falling 492K → 277K through 5 Aug → crashes were a confound, and the
  30 July deploy remained the answer.*
- **Is it acquisition or retention? Split DAU by `IsNewUser`.** This is the
  fastest test there is and it kills the most expensive wrong answer, "let's
  make the game more appealing to new players". *Knife Farm on 2026-08-07 was
  still taking **13,209 brand-new players a day, 36% of DAU**, while D7 sat at
  1.2%. Roblox had not stopped delivering new players; the game was failing to
  convert them.* New users still arriving in volume + weak D7 ⇒ the problem is
  the return loop, and creative/appeal work is wasted effort. Read it against
  D1: **D1 healthy while D7 dies means they liked it and ran out of game.**
- **Read the ranking signal directly — `RFYL7PlayDays`.** Since 2026-06-15 RFY
  ranks on play days per user, so this metric *is* the input, not a proxy for
  it. *Knife Farm: ~1.4 play days per 7, flat all year — the average player
  plays once or twice a week and never more. That number is the ceiling on
  distribution, and no amount of reach work moves it.* Quote it before
  theorising about the algorithm.
- **Did the metric break before or after the publish?** `place-versions.csv`
  has publish timestamps to the minute. Break-before-publish exonerates it.
  *Check the full deploy list — a report here once exonerated updates by
  citing Jul 20 while deploys on Jul 14 and Jul 17 existed.*
- **Is it platform-side?** `annotations.md` → `ANNOTATION_TYPE_ENGINE_RELEASE`
  (RCC = server engine). Then check whether an unrelated game moved the same
  way on the same days. *Both games crashed 28 Jul–1 Aug after RCC v732.*
  An engine release preceding a fault is an association, never proof of a
  faulty release.
- **Is it really performance?** A render/perf regression hits weak devices
  hardest. **If desktop fell more than phone, it is not a render regression.**
- **Is it growth confounding?** Volume metrics move with audience size. Use the
  per-1k-DAU column in `summary.md`, never a raw volume delta.
- **Is the rate move just a change in who showed up? Regress it on the
  returning share.** Returning players complete funnels far better than new
  ones, so any shift in the new/returning mix moves every rate with it. On
  9963622286 returning share correlates with `Rebirth1` completion at
  **r = 0.718 over 93 days**. Test: fit `rate ~ returning-share` on the days
  *before* the change, predict forward, read the residual. Worked 2026-08-10 —
  the 7 Aug deploy still beat its mix-only prediction by **+3.9pp on Rebirth1
  (3.6 sd)** and +2.3–3.6pp on every other step, so the gain was real and not
  composition. Without this the same numbers are indistinguishable from a
  weekend skew toward veterans.

  **But check the fit before you control with it — r is per-game, not a
  constant.** Measured 2026-08-14: the same regression on 10030829154 gives
  **r = 0.198** (D1 on returning share, 14 days), against 0.718 on 9963622286.
  At that strength the "prediction" is just the fit window's mean, and calling
  the result mix-controlled would be a lie. Say so and use a different test.
- **The better dilution test: split the rate by `AcquisitionSource`.** "Our
  rate fell because a viral push brought low-intent traffic" predicts the fall
  is concentrated in `HomeRecommendation` and that `Friends` and `Search` are
  untouched. If it fell on *those* too, it is the game holding fewer players,
  not the traffic. *Worked 2026-08-14 on 10030829154: D1 fell 13–14% on Home,
  Search and Others and **9% on Friends** — so the −2.0pp step survived the
  push ending and is a product finding, not composition.* This is cheaper and
  far more direct than the regression, and it needs no baseline window.
- **A metric that spikes on exactly the publish days is a publish-path
  signature, not a defect.** Check the deploy dates before reading a spike as
  breakage. *On 10030829154, `ErrorCount` `LogSource: Server` runs 70–215K/day
  and hit 2.0–5.9M on **4 of 4** deploy days and no other day, returning to
  baseline within 24h each time.* Worth reporting as its own finding — a
  20–50× publish spike is real — but it is not "the update broke something",
  and a grab taken the day after a deploy will read it as one.
- **A huge error count is not a huge problem. Test it against a rate.**
  9963622286 shipped ~35M client warnings on 2026-07-31 (`[OddsController]
  Unknown rarity`, broken season pass and shop UI, ~3M each). All three are
  monetization or aspiration surfaces, so if they cost anything **ARPDAU** would
  step. It did not — 0.368 (29 Jul) → **0.433 (31 Jul)** → 0.438 (8 Aug), the
  highest of the window. Revenue fell purely with DAU. Warnings are often
  guarded paths firing per-item per-frame; convert count to *affected players*
  or to a rate move before reporting one. Inverted here: the signature that
  mattered was **8,249** (`TrainedSpeed is not a valid member of Player`, a race
  on the line that fires the tutorial), four hundred times smaller.
- **Is it just the weekend?** Roblox audiences normally *rise* Fri–Sun. A
  weekend fall is anomalous; a weekend rise is not a win.
- **Does the pattern predate the cause you found?** The most dangerous
  explanation is a real, dated, external event that fits a short window. On
  2026-08-09 I attributed Knife Farm's July collapse to Roblox's 2026-06-15
  algorithm change: documented, correctly dated, and a clean fit across the 31
  days we held. Pulling 129 days killed it — the game's **biggest** collapse ran
  31 May to 12 June (−81%), before the change existed, and there were three
  such collapses in four months. **Always extend the window past the proposed
  cause and check whether the same shape already happened.** A cause that only
  explains the last instance of a repeating pattern is not the cause.
- **Did appeal move before reach, or after?** `cd web && npm run lead-lag`.
  Cross-correlates `EndToEndCVR` against `UniqueUsersWithImpressions` at ±5
  days. **Read the `MA7 first-diff` row only** — on raw levels two declining
  series correlate at every lag, which is trend, not lead.

  | Peak lag | Reading | Lever |
  |---|---|---|
  | **Positive — appeal leads** | The listing lost its pull *before* Roblox cut reach | Creative: thumbnail/title/icon A/B, then audience expansion |
  | **Negative — reach leads** | The platform moved first; conversion drifted after | Cadence + re-qualify. QPTR work will not restore it |

  **The direction is not universal, and that is exactly why it is worth
  running.** Measured 2026-08-09 on all three universes: Climb Up Mountain
  (dead) **+4d, r=0.78**, with a clean sign flip to −0.71 at −4d — appeal
  decayed first, the signature of exhaustion. Knife Farm +3d but only r=0.39,
  too weak to lean on. Become a Brainrot runs the **other way** on the trend
  transforms (−5d, r=0.71): distribution was withdrawn first. An earlier note
  in this repo generalised the dead game's result into "QPTR is a 3-day leading
  indicator". **It is not** — treating it as one would have inverted the story
  on Brainrot.

  State the caveats whenever you quote it: n=3 games, 31–37 day windows, ~25
  usable points after the 7-day mean, and the peak is chosen by scanning 11
  lags — so it generates a hypothesis and never proves causation. Corroborate
  with the §2 signature before it reaches a producer.

- **Never call a step on a rate without looking at the numerator.** Measured
  2026-08-16 on Knife Farm: `PayingUsersCVR` fell 1.075% → 0.860% on 12 Aug and
  read as a one-day break. It was not. **Paying users were 355 on the 11th and
  356 on the 12th** — flat — while DAU rose 24% (33,544 → 41,527). The rate moved
  because the denominator moved. I reported the step before checking, and had to
  retract it in the same session.

  The fix is a **matched-DAU comparison**: find days on either side with similar
  DAU and compare the raw count. At ~36K DAU on 1–3 Aug the game converted
  561/634/669 payers; at ~34K DAU on 13–15 Aug, 276/265/291. Half the payers at
  the same size, which is the claim that actually survives.
- **The new-vs-returning mix control is a two-way test, and it is worth running
  precisely because it can come back negative.** On Brainrot it *explained* the
  funnel recovery (returning share 64% → 78%, so the headline rose while the
  underlying rate did not). On Knife Farm the same test **ruled composition out**:
  returning share was 56.3% on 3 Aug and 56.0–57.3% on 13–15 Aug, with
  near-identical new-user volume, and conversion still halved. Same instrument,
  opposite verdict. Do not assume the veteran-mix story applies just because it
  applied last time.
- **When every split says the same thing, the cause is global to the game.**
  Knife Farm's conversion fell on every platform (Phone 1.38→0.58, Computer
  2.55→1.13, Tablet 1.84→0.79, Console 2.48→1.36), on both product types
  (DevProduct and GamePass both −66%), with ARPPU flat. That combination kills
  mix, kills "one broken product", and kills "whales left" in one pass.
- **Eliminating every candidate is a result. Report it as one.** If the shape is
  a gradual decline and each named event lands before or after the bulk of it,
  say the cause is not identified and name the measurement that would find it.
  Inventing an attribution that fits the vibe is how a report loses its warrant.

- **Count findings by mechanism, not by metric name — two metrics can be the
  same number wearing different labels.** Any volume metric must be normalised
  by DAU before it is scored, but once you do that, `DailyRevenue`/DAU *is*
  `AverageRevenuePerUser`. Measured 2026-08-18 on 9963622286: both reported
  −20.7% at z −1.17, byte-identical, because they are the same quotient. Two
  entries on a list read as two problems, and a report that inflates its own
  count makes an ordinary day look like a pile-up — the mirror image of the
  growth-confounding trap above, and just as easy to ship. Before listing a
  finding, ask what its numerator and denominator are; if another line has the
  same pair, they are one finding. Same trap with `AverageSessionLength` vs
  `AveragePlayTimeMinutesPerDAU`, and with any `L7Average*` against its own
  daily series.

## 3b. The algorithm is the mediator — and it changed on 2026-06-15

Everything below comes from Roblox's own documentation and announcements, not
from inference. Read this before blaming or crediting anything for a reach move.

**Official RFY ranking signals** (`create.roblox.com/docs/discovery`): play
through rate; **first play bounce rate** (<60s and 61–180s); **play days per
user across D1, D2–7, D8–28**; playtime per user (capped 60 min/day/user).
Secondary: intentional co-play days, qualified play sessions, spend days, Robux
per user. Signals are **per-user averages, not totals**, so a small game with
engaged users is not disadvantaged.

**On 2026-06-15 Roblox re-weighted RFY to value long-term retention**
("Recommended For You Algorithm Improvements That Better Value Long-Term
Retention"): the signal window went from 7 days to **28 days** (D1, D2–7,
D8–28), and **QPTR was removed from ranking**, replaced by play-through rate
and first-play bounce rate. Roblox warned of "fluctuations in your
distribution". A 28-day signal window means the change reaches full effect
about four weeks after rollout — **~2026-07-13**.

Three consequences, and they are load-bearing:

1. **Retention buys distribution, with a ~4-week lag.** A same-day correlation
   between DAU and D1 is the WRONG test and will read ≈ 0 (measured −0.011 on
   9963622286 over 130 days). The causal path is
   retention → ranking → impressions → DAU. Do not conclude "retention doesn't
   matter here" from a flat contemporaneous correlation.
2. **A game with weak D8–28 was structurally demoted by this change.** On
   9963622286 (D7 ≈ 3%, D30 ≈ 1%) the 7-day-mean impressions peaked 2026-07-09
   and fell 59% by 08-07; on 9610561918 they peaked 07-17 and fell 62%. Two
   unrelated games, same window, same magnitude — consistent with a platform
   cause. (n=2, same studio and genre, so not proof.)
3. **Indigo's "QPTR is the #1 lever" playbook predates this.** QPTR is still a
   real *health* signal — it is what the store listing does to a viewer — but
   as of 2026-06-15 it is **not what the recommender ranks on**. Say that
   plainly rather than selling QPTR work as distribution work.

**Roblox counts only organically-discovered users in the ranking stage** — the
engagement, monetization and retention of users first acquired from ads,
curation, friends, search or social are excluded. So a DAU breakdown by
`AcquisitionSource` is not a curiosity; growth from non-recommendation sources
does not buy ranking.

**Roblox publishes NO retention benchmarks.** Its docs give definitions and
improvement advice, no numbers. The "simulators get 45–60% D1" figures that
circulate on SEO blogs (bloxg, rolearn, lensblox) are unsourced — do not quote
them. Use the benchmark series in `series.json` (a similar-experience cohort)
or say the bar is unknown.

## 3c. Traffic mix vs gameplay — the test Roblox shipped for exactly this

**Shipped 2025-10-16** ("Analytics: View retention by acquisition source and
select your benchmark set"). D1/D7/D30 now break down by `Source`, and Roblox
states the purpose plainly: to identify whether a retention change comes from
**a shift in traffic mix rather than a gameplay problem**.

That is a discrimination test, and it belongs before any "the update hurt
retention" conclusion. Sources retain very differently. A week where sponsored
or teleport traffic grows drags *blended* D1 down while every individual source
holds flat — the blend moved and nothing about the game did.

**How to run it:** pull `ForwardD1Retention` broken down by `AcquisitionSource`
across the window.
- Per-source flat, blend down → **mix**. The fix is an acquisition
  conversation, not a design one.
- One source dropped → that source's audience or its landing surface changed.
- Every source dropped together → now you may blame the build.

Roblox clarified in the same announcement that **"running ads should not harm
your organic distribution."** Ads-acquired users are excluded from ranking
signals: they neither help nor hurt. Producers routinely fear paid traffic
poisons the algorithm — say plainly that it does not. What it does is dilute
blended averages, which is a reporting problem, not a ranking one.

## 3d. Platform floors — "no data" usually means "too small"

Roblox gates analytics behind size thresholds. Below them charts are empty, and
an empty chart reads exactly like a healthy one.

| Feature | Floor |
|---|---|
| Dashboard KPIs at all | >10 DAU **and** 10 play hours, 7 consecutive days |
| Client/server performance charts | **100+ DAU** |
| Benchmarks (similar-experience or genre) | 100+ DAU |
| Insights | 100+ DAU |
| AI analytics reports | **1,000+ DAU** |
| Player-feedback reports | 20+ comments |

Before writing "no crash data, so the technical rung is clear" — check DAU
against 100. On a small game the performance tab is empty *by policy*. Combined
with the ~28-day perf retention horizon there are now two distinct reasons a
performance chart is blank, and neither of them is "nothing is wrong".

## 4. Priors — what "good" looks like

Without these a number is just a number. Source for the Indigo figures is its
own AE playbook (`indigodev` repo, `src/data/game-data.ts`): a canonical
knowledge base plus 20 worked deal scenarios spanning 20 genres — Race, Obby,
Escape, Runner, Roleplay, Tower Defense, Action/Combat, Social RPG, and a large
idle/incremental cluster (Idle/Viral, Mining/Idle, Fishing/Idle,
Idle/Incremental, Incremental, Viral/Casual, Sports/Viral).

**Treat these as Indigo's own calibration, not sampled telemetry.** The
scenarios are authored teaching cases. Use them to judge whether a number is
in a sane band; do not quote them to a producer as measured benchmarks.

### QPTR — the master lever

QPTR (click-to-play rate) is Indigo's #1 algorithm signal and its stated
primary technical value-add: higher QPTR → more home recommendations →
compounding organic reach. The playbook's canonical target is **above 3%**,
and the scenarios calibrate the full ladder explicitly in their coaching hints:

| QPTR | Read |
|---|---|
| < 2% | "very low" — the core Indigo opportunity |
| 2–3% | below target; explicitly *caps the valuation* |
| 3–5% | at or above target for most genres |
| 8%+ | strong (8% → 18% roughly doubles organic traffic) |
| 13–22% | exceptional — in the playbook these are the $8k–280k/month games |

QPTR rises with revenue efficiency: in the scenario set, games at 13–22% QPTR
run **$8–30 revenue per CCU per month**, while games under 5% run **$0.3–0.9**.
It also correlates with age (r ≈ 0.6) and scale (r ≈ 0.5 vs log CCU) — partly
survivorship, so do not read "older ⇒ better QPTR" as causal.

### Measuring QPTR — close proxies, not an exact match

Indigo defines QPTR as **"Click-to-Play Rate: the % of Roblox home page
impressions that result in a click"**. Nothing we capture is definitionally
that, because every Roblox metric we hold counts **play sessions, not clicks**.
Two good proxies, established 2026-08-08 across both universes:

| Proxy | What it is | Knife Farm | Brainrot |
|---|---|---|---|
| `EndToEndCVR` | Roblox's impression → play conversion, **all surfaces** | 3.0–4.1% | 4.8–7.1% |
| home-surface conversion | `DailyActiveUsers[HomeRecommendation]` ÷ `UniqueUsersWithImpressions[HomeRecommendation]` | 3.2–5.4% | 5.2–6.4% |

`EndToEndCVR` matches unique plays ÷ unique impressions at **r = 0.998** on
Brainrot, so it is genuinely the impression→play conversion. The home-surface
ratio is **definitionally closer** to Indigo's wording (right surface) and runs
slightly higher, as expected — home is the highest-intent surface.

**Both are play-based and therefore lower bounds on a click-based QPTR** (some
clicks never become a session). Use `EndToEndCVR` as the default operational
number, quote the home-surface ratio when the question is specifically about
home-page performance, and say which one you used. Still worth confirming with
whoever runs QPTR optimisation whether their number is clicks or plays — the
levels shift, though the direction never does.

**`RFYQualifiedPTR` is NOT QPTR.** It reads ~0.5%, roughly five times smaller,
and measures the Recommended-For-You qualification gate specifically. Never
quote it as QPTR.

**Trend, measured 2026-08-09** — `cd web && npm run lead-lag` prints both
proxies, so a claim that holds on only one is visible as such:

| Game | `EndToEndCVR` | home-surface | Read |
|---|---|---|---|
| Knife Farm | 3.42% mean, **+0.4%/wk** | 3.80% mean, **+3.0%/wk** | Appeal healthy and improving. The low *level* is upside, not decay |
| Become a Brainrot | 5.88% mean, **−2.1%/wk** | 5.93% mean, **+0.3%/wk** | Mild to flat, from the highest level of the three |
| Climb Up Mountain (dead) | 5.10% mean, **−11.8%/wk** | 4.80% mean, **−14.2%/wk** | What a dying listing actually looks like |

**A withdrawn claim, kept here as the warning.** This repo previously recorded
"Become a Brainrot QPTR **−0.72%/week — steeper than the dead game's final
fortnight**" and queued it to go to the producer as a second, independent reach
problem. It reproduces on **neither** proxy: Brainrot is −0.124 pp/wk on
`EndToEndCVR` and flat-to-positive on home-surface, while the dead game's final
fortnight ran −0.463 and −0.488 pp/wk — about **4× steeper, and from a falling
level**. The −0.72 figure sits suspiciously close to the dead game's own
full-window home-surface slope (−0.683 pp/wk), so the likeliest explanation is
a number attached to the wrong game.

Two rules out of that: **recompute a slope before quoting it**, and **state the
metric, window and units every time** — here "−0.72%/week" as percentage points
and as percent-of-level differ by more than 5×, and the two readings support
opposite recommendations.

**Read QPTR against impressions, always.** They separate the two causes of a
reach collapse, and the answer changes the fix completely:

| Impressions | QPTR | Meaning | Lever |
|---|---|---|---|
| ↓ | flat | Roblox cut distribution; the listing still converts | Content cadence, re-qualify, paid — *not* QPTR work |
| flat | ↓ | The listing lost appeal | Thumbnail/title/icon A/B |
| ↓ | ↓ | Both — usually a demotion following an appeal drop | Fix appeal first, then re-qualify |

*Worked example:* Knife Farm's July cut ran impressions 3.09M → 1.16M (−63%)
while QPTR held at 3.37% → 3.29%. Distribution was withdrawn; click-appeal was
untouched. So QPTR optimisation would not have restored it — though at 3.3%
the game does sit far below the 8%+ band, so QPTR remains real *upside*, just
not the *cause*.

### Tier bands (by CCU, from the scenario set)

`small` 180–340 · `mid` 380–1,400 · `large` 1,200–2,100 · `mega` 5,200–12,000.
Useful for "what kind of game is this" and for choosing the right comparison.

### Lifecycle

- **Escape genre is the only one with a documented curve:** peaks at **6–8
  weeks**, then loses **60–70% of revenue in the following 2 weeks**. Indigo's
  extension to 4–5 months comes from cadence + thumbnails + cross-network
  funnel.
- **Indigo's portfolio is mostly simulators and brainrot-style games, and no
  lifecycle curve exists for them.** Searched the whole playbook — the only
  decline curve stated is the escape one above. **Do not apply it to a
  simulator**, and do not invent a substitute: say the expected curve is
  unknown and judge the decline on its own shape (step vs smooth) instead.
  Building this prior is a real gap, and **checked 2026-08-09 it cannot be
  closed with what we hold**: every universe in `data/games/` carries only
  31–37 days of daily headline data (Knife Farm Jul 7 → Aug 6, Brainrot Jul 2 →
  Aug 6, Climb Up Mountain Mar 25 → Apr 30). A lifecycle curve needs launch-to-
  present windows — 6+ months, several titles. The grabber can request them;
  nobody has. Until then, "expected for the genre" is a sentence you may not
  write about a simulator.
- **Post-peak decline of ~15–20% per month** is the general figure used at
  LARGE tier valuation. A decline matching it is expected, not a defect.
- **Content cadence resets the algorithm signal:** updates every **2–3 weeks**.
- **Thumbnail A/B testing weekly/bi-weekly** is the other primary reach lever.

### Monetization

- **Low ARPDAU alongside healthy CCU = undertapped monetization**, which is the
  upside case, not a fault.
- **Measured on our own games:** D1 retention ~16–20% when healthy; Brainrot's
  break took it to ~10–12% and held. Treat sustained sub-13% D1 on these titles
  as broken, not noisy.

**The whole-portfolio curve, measured 2026-08-25 — read this before promising
any single game a recovery.** `DailyCohortRetention` by `CohortDay`, 10-day
window, all four live games:

| | D1 | **D2 holds** | D7 | D30 | `RFYL7PlayDays` |
|---|---|---|---|---|---|
| Knife Farm `9610561918` | 18.3% | **49%** | 1.38% | — | 1.43 |
| Waterslide `10030829154` | 13.9% | **48%** | 1.03% | 0.40% | 1.28 |
| Banana Monkey `10399712766` | 13.5% | **43%** | 1.71% | 0.66% | 1.33 |
| Become a Brainrot `9963622286` | 13.4% | **46%** | 2.03% | 0.68% | 1.37 |

Three things follow, and each kills a plausible-sounding plan:

1. **D2 holds 43–49% on all four.** Four codebases, one number — that is a
   studio-level structural signature, not four coincidences, and it says none of
   them has an effective between-session hook (§4 "Idle/simulator structure":
   offline earnings / daily reward / streak is what holds D1→D2). Past D2 the
   curve is *fine* — 66%, 74%, 87%, 89% day over day. **Prestige loops and
   content tracks hold D5+ and are irrelevant while half the day-1 returners
   never come back on day 2.** Monkey has rebirths and Waterslide has six
   worlds; neither shows up, because almost nobody survives to use them.
2. **Fixing D2 is worth far less than it looks: +6–7% DAU.** At D1 ≈ 13.5%,
   keeping more of a small number stays small. Model check: `1 + Σ(D1..D6)`
   reproduces measured `RFYL7PlayDays` to within 0.05 on all four. The bigger
   prize is upstream — on Waterslide, tutorial completion 64.8% → 90% projects
   D1 13.9% → ~18%, roughly **5×** the D2 mechanic fix.
3. **The distribution ceiling is real and none of them clears it.** A game
   Roblox promotes needs `RFYL7PlayDays` ≈ 2.0, i.e. the first six days summing
   to ~100pp. Waterslide's sum is **30pp**. That is a 3× gap, not a tuning gap.
   Knife Farm is the proof it cannot be fixed downstream: **best retention of
   the four, and it still went R$1,265,577/day (April) → R$42,461 (August),
   −97%.** Do not promise a recovery that requires beating this ceiling.

Benchmarks in `series.json` are **similarity cohorts, not genre** on these
universes (check `benchmarkType`), so say "peer cohort", not "genre median".

### Idle/simulator structure — which mechanic holds which day

For this portfolio's genre, the retention curve maps onto game structure
cleanly enough to diagnose a *missing mechanic* from the numbers alone:

| Mechanic | The day it holds | Absent ⇒ |
|---|---|---|
| Offline earnings, daily reward, streak | **D1 → D2** | D1 sags |
| Finite upgrade track | D2 → D5, then exhausted | D7 collapses once bought out |
| **Prestige / rebirth loop** | **D7 → D30** | D30 goes to ~0 |

*Worked, 2026-08-10.* Knife Farm has offline earnings and daily rewards but **no
rebirth** — only upgrades. Measured: D1 healthy at 17–20% (the daily mechanics
work), D7 1.2%, D30 0.2% (nothing to chase once upgrades are bought). Become a
Brainrot, same studio, **has** a rebirth ladder and runs D7 ≈ 3%. The absent
mechanic was readable straight off the curve.

**Content is not the same lever as structure.** A new world is consumed once and
buys one cycle — which is exactly the pattern Knife Farm already ran three times
since May, each peak smaller. A prestige loop regenerates the goal indefinitely
from content that already exists. When both are on the table, ship the loop and
use the content as its reward.

### Technical targets — the only numbers Roblox actually publishes

From `docs/production/analytics/performance`. Use these instead of inventing a
bar; they are the rare case where Roblox does give hard figures:

| Metric | Target |
|---|---|
| Client / server frame rate | **60 FPS** |
| Client / server CPU time | **<16 ms per frame** — this is what 60 FPS costs |
| Server memory | **<50% of total, or <3 GB** |
| Compute efficiency | >100% (better than the Roblox average) |

Three definitions that change how the charts read:

- **`ClientCrashRate` = crashes ÷ ENDED sessions.** A day with many sessions
  that never cleanly end moves the denominator, not the game's stability.
- **Roblox draws the crash-rate line DASHED when the sample is small** and
  advises reading crash COUNT instead in that regime. That is the dashboard's
  own version of `DATA_STATUS_NOT_STATISTICALLY_SIGNIFICANT` — same meaning,
  same response: exclude it from conclusions.
- **`OomUnexpectedExits` undercounts by design** — "does not cover all
  out-of-memory crashes due to telemetry limitations". Directionally valid,
  never quotable as an absolute. Write "OOM exits rose ~40%", never "there were
  943 OOM crashes".

**Client memory percentage approaching 100% on Android is a crash predictor**,
not a performance note. Memory% climbing together with OOM exits is a leak with
a known ending — that pairing is a finding on its own.

## 4b. Sizing the prize — what a fix is actually worth

LiveOps and acquisition run on the same arithmetic, which is how a diagnosis
becomes a business case. From Indigo's own deal model (`game-utils.ts`
`computeOfferGrade`, and the owner-valuation logic in `game-engine.tsx`):

- **Robux → USD: × 0.0035** (the DevEx rate used throughout the playbook).
- **An owner's asking price sits around 6× monthly revenue**, with their
  private acceptable zone roughly **4–8×**.
- **Indigo's target buy is 50–80% of that ask — about 3–4.8× monthly.** Below
  ~3× is a "Lowball" that rarely closes. **Above the ask is not a win; the
  playbook models the owner reacting with suspicion, not enthusiasm.**

So a sustained change in monthly revenue moves the asset's value by roughly
**6× that change** at owner-ask, or 3–4.8× at Indigo's buy range. That converts
"retention broke" into a number a producer can act on.

*Worked example — Become a Brainrot's July 30 break.* Daily revenue fell
R$239,898 → R$101,072. At ×30 days and the DevEx rate that is about
**$25,200 → $10,600 per month**, a **−$14,600/month** swing. Capitalised at the
6× owner-ask multiple, the defect is worth roughly **$87,000 of asset value**
(≈$44k–$70k at Indigo's 3–4.8× buy band).

Two caveats, and state them when you use this: ×30 on a single day's revenue is
a simplification — use a settled multi-day average where you have one; and
0.0035 is the developer payout rate, which is the right unit for "what the
owner earns", not necessarily for every valuation context.

### "How much did we lose?" — the baseline is the whole answer

A cumulative-loss figure is a **counterfactual**, so the baseline dominates the
result and is the first thing a sceptical reader attacks. Always compute a
range, name the baseline, and subtract expected decay.

*Worked, 2026-08-10, Become a Brainrot since 21 July (19 settled days,
R$3,527,576 actually earned):*

| Baseline | at 15%/mo decay | at 0% decay |
|---|---|---|
| Last 7d before the event | **$7,370** | $8,346 |
| 14d before | $11,261 | $12,430 |
| Peak week | $16,346 | $17,767 |

Three rules out of that spread:

1. **Subtract expected decay.** ~15–20%/month post-peak is *normal*, so only the
   excess is a loss. Reporting the 0% column inflates the number by ~13%.
2. **Never baseline on the peak week** if the metric was already sliding when
   the event hit — it more than doubles the figure and the case dies on
   inspection. Prefer the last settled week before the event.
3. **A cumulative loss is usually the weaker number anyway.** The **ongoing
   run-rate gap** ($21,392/month here) and the **capitalised value** (6× ⇒
   $128,352) argue far better than a historical total, because they describe
   what is still bleeding rather than what is already spent.

And decompose before attributing: of Brainrot's drop, ~R$71,744/day traced to a
platform change (not the studio's doing), ~R$149,687/day to a forced model swap,
and ~R$103,555/day to a preventable deploy break. **Only the third is anyone's
fault, and only the third is worth a fix.** A single blended "we lost $X" hides
that distinction and invites the wrong response.

## 4c. Keep your own projections credible

The playbook models an owner growing *suspicious* at overpromising, and it
names the thresholds. Hold your own recommendations to the same bar:

**Believable without special justification**
- QPTR improvement of **20–50%** (e.g. 3.0% → 4.2%)
- CCU growth of **30–80% over 2–3 months** with real services behind it
- Revenue uplift **tied to a specific change** (a VIP pass, thumbnail A/B)

**Requires a named mechanism, or don't say it**
- Anything beyond **2×** those figures
- Any projection needing 3–5× better performance than the game has ever shown
- "Explode", "skyrocket", "massively" — vague magnitude with no timeline
- Any number without a timeline, a mechanism, and a comparable

A projection is only as good as the mechanism attached to it. If you cannot
name the lever, the expected size, the timeline and how it will be measured,
you are guessing — say so plainly instead.

## 5. From diagnosis to a precise fix

Name the lever, the expected size, and how you will know it worked.

| Diagnosis | Lever | Measure |
|---|---|---|
| Reach cut, product healthy | Content update (resets algorithm signal); thumbnail A/B; cross-network funnel; paid acquisition to rebuild top of funnel | Impressions and `RFYQualifiedPTR` within 1–2 weeks |
| Hook broken | Fix the first-session experience; onboarding funnel step that broke | `ForwardD1Retention`, session length |
| Return loop broken | Progression/economy gate that blocks repeat play | `ForwardD7Retention`, `DauMauStickiness` |
| Monetization gap | Close ARPDAU to cohort; rebalance Passes vs Dev Products | `PayingUsersCVR`, ARPPU, `DailyRevenue` by `RevenueSource` |
| Technical | The specific defect, cited by file and line where code was read | Crash **rate** (not count — count tracks DAU) |

Always state the **measurement window and what to exclude**. If a platform
event contaminated days, say so, or the fix will look bigger than it was.

## 5b. Know which half of the job this is

**Metrics date and rank changes. They cannot tell you whether a level is bad.**
Learned expensively on 2026-08-10: four separate claims about 9963622286 were
produced from correct readings of the code and the data, and all four were
killed within minutes by the producer, who had played the game.

| Claimed | Killed by |
|---|---|
| First rebirth is 6.58× too hard (`NewRebirths` 5,000 vs `Rebiths` 760) | The whole treadmill loop is gated behind the same flag, so the ladders are denominated in currencies earned by different mechanics. "Flip the flag" would have disabled the core loop |
| A fresh player cannot train (`OwnedTreadmills` = `"{}"`) | The tutorial grants and equips it |
| The unchecked `pcall` load defect caused the D1 break | Error export: zero DataStore signatures, floor 7,875 lifetime |
| Backpack items are not saved | `OnPlayerAdded:584-586` saves them |

The pattern in every one: **a level asserted as bad without knowing how the game
plays.** The half that does travel is the other one — the daily funnel dated a
tutorial replacement to 27–28 June off `FirstMorph` stepping 87% → 99.98% and
staying, later confirmed by the producer as a 26/27 June ship. Nobody gets that
from playing.

So: date it, rank it, quantify it, and hand the "is this bad" question to
someone who plays. **Never publish a level judgement that has not survived one.**

### Sources the grabber does not have

Three things only a dashboard export gives, and on 2026-08-10 they beat every
metric in the pipeline. Locations and gotchas in the `rbx-where-to-find-each-
metric` memory; the short version:

- **Player comment text** (`Report_<epochMillis>.csv`). ~160/month on this
  title. It named the mechanism twice when the metrics could not: *"I get stuck
  at the very beginning"*, *"why did you make the brain rods have collision"*,
  and on the break day itself *"its so hard to get speed and it takes too long"*
  — the only direct hint at what shipped in v546. **Read these before
  theorising about a cause.**
- **Error message text + `First seen version`**, which dates what a deploy
  introduced. Capped at top 25 by count, so absence is never evidence.
  **And the counts understate whenever the message embeds a per-player value.**
  Signatures are the message *text*, so `SavePlayerData failed: 11467090262 …`
  and `… : 8686261280 …` are two rows of 6 and 5, not one row of 11 — and with
  ~26 rows of headroom the long tail never appears at all. Treat any count on a
  userId-bearing message as a **floor**, and size the real thing against a
  volume series (`ErrorCount` `LogSource: Server` per DAU) before quoting it.
- **`feedback.csv`'s `asset_version` column is a second deploy log, and
  sometimes the only one for the root place.** The `saved-versions` call is
  per-place and can 500 (it did for `139617346573330` on 2026-08-14), leaving
  `place-versions.*` topped out at a sub-place's `v437` while the root ran
  `v1698`. Grouping feedback rows by `asset_version` and taking min/max date
  reconstructs the root's publish sequence, and each boundary lands in the same
  hour as a sub-place publish. Also gives the **downvote rate per version**
  free — which is the first signal to move after a bad ship.
- **Feedback: use the downvote RATE**, `down / (up + down)`. The `Total` series
  is upvotes *minus* downvotes and is useless alone. On 9963622286: 13.4%
  pre-break → 21.8% during the bleed → 28.1% on the fix day → 10.2% the day
  after. It moved before any retention metric could.

**And read PCU at half-hour before quoting a daily peak.** 9963622286's Saturday
PCU of 17,572 was a 90-minute giveaway: 5,284 → **19,593** → 3,784, settling
*below* the pre-event baseline. The daily number reads as a recovery; the shape
says the game can still buy attention and cannot hold it.

## 5c. Post-update error triage — the loop that works

Established 2026-08-15 tracking `9963622286` `v587` through its first 22 hours.
The two sources answer different halves and neither is enough alone:
**the dashboard error export gives volume, severity and first-seen version;
reading the live place gives mechanism and blast radius.** Run them together.

**The most expensive defect may emit ZERO log lines, so never rank by error
count.** Measured 2026-08-23 on `10030829154` (Climb Waterslide and Slide).
A tutorial helper held the raft shop's `CanvasPosition` in a `while` loop whose
exit test was float equality against a value Roblox *clamps* — so it never
exited, and every 0.2s it overwrote whatever the player had just scrolled to.
That is working code doing the wrong thing: **no throw, no warning, nothing in
the error export, ever.** Its entire footprint was one funnel step sitting at
0.83 completion against 0.97–1.00 for the steps either side.

The trap is that a defect hunt seeded from the error export cannot see this
class at all. The publish that shipped in the middle of the investigation fixed
a *different*, logged symptom in the same function and left the loop untouched —
precisely because the log pointed at the other thing.

So run the funnel and the error export as **two independent entry points**:

- **Error export → mechanism.** Good at crashes, nil indexes, throttling.
- **Funnel step rates → silent defects.** Any step materially below its
  neighbours is a defect candidate *even with a clean error log*. Open the code
  for that step and read it; do not wait for a signature that will never come.

**Symptom grammar that means "silent defect", worth grepping for directly:**
`while <property> ~= <computed>` on any engine property the engine clamps
(`CanvasPosition`, `Rotation`, `CFrame` on an anchored part) — float equality
against a clamped write is an infinite loop by construction. Also any coroutine
spawned per UI-open with no `task.cancel` on close: they stack, and N of them
fight each other and the player.

**Always establish blast radius before you claim impact.** Walk *up* from the
error line to the enclosing connection or thread, because that is what bounds
the damage:

- Throw inside an **event handler** (`X.OnServerEvent:Connect`) → kills that one
  invocation. Find the statement it skipped; that is the real impact. On `v587`
  an unguarded index at `OnPlayerAdded:1778` skipped the
  `PromptProductPurchase:FireClient` 15 lines below it — **1,844 purchase
  prompts that never appeared**, invisible in every metric.
- Throw in the **join thread** → kills everything after it for that player.
  This is the shape that produced the July inventory wipe.
- Throw inside `task.spawn` → kills only that thread, **and escapes any
  enclosing `pcall`**. `GuardClient:299-322` wraps the body in a `pcall` and
  then hands the work to `task.spawn`, so the protection never applies.

**Check whether cash moves before or after the throw.** Same defect is a dead
button or a theft depending on line order. `AnimalModule:547` throws at
`OnPlayerAdded:1392`, the deduction is at 1401, so nothing was stolen — the
upgrade just silently does nothing. Say which it is; producers hear "error" and
assume the worst.

**Two recurring shapes, both worth grepping for directly:**

1. **The guard written then bypassed.** `FindFirstChild` used to allow nil, then
   the nil passed straight into something that cannot take it
   (`FuseClient:147-149`, 36k events). Or a safe default assigned and then
   overwritten by a lookup that can miss (`AnimalModule:541` vs `544`). Or a
   `pcall` that the real path spawns out of. The author knew the hazard; the
   code just doesn't act on it.
2. **Check, yield, use.** `if player.Character then` … `task.wait(300)` … use it
   unchecked (`OnPlayerAdded:4460-4466`). Any yield invalidates the check. The
   longer the wait, the higher the count.

**The class that dominates content updates: new content shipped without the
entry another system looks it up by.** On `v587`, four unrelated systems broke
from one cause — the rarity table, `Animations.Animals[x].Idle`,
`Models.Animals[name]` and `TraitMultiplier[trait]` each lacked an entry for
newly added animals, traits or rarities. **Report the class, not the four
lines** — fixing the lines alone guarantees the same four on the next world.
Ask for a publish-time check that fails when a new asset has no matching row in
every table that indexes it.

**Rate-limit warnings are a capacity finding, not a bug.** `502 … request rate
exceeds the allowed maximum for the key` means a shared DataStore key is being
hammered by every server. Count the stores the update added before blaming the
code; `v587` added a fuse store alongside weather and ascension, all flushing on
interaction.

**The export's row cap understates breadth, and only the code read gives the
real count.** Measured 2026-08-16 on Brainrot: the error export showed 9 animals
missing a rarity-table entry. Reading the live place showed **19**, across five
tiers. All 38 signatures sat inside a 550,338–550,356 band, so the ~26-row cap
cut arbitrarily among equals rather than dropping the small ones. **When
several signatures share a near-identical count, treat the list as truncated and
census the source of truth in Studio.** Corollary: you cannot date the entries
the cap hid, so do not.

**Severity inverts. Rank by mechanism, never by volume.** Same session, same
game: `Vanish` VFX at 2,927 events looked alarming and was cosmetic (both call
sites `Destroy()` on the line before, so only the effect is lost), while
`AnimalModule:547` at 4,303 killed the upgrade button outright, and a *warning*
class hid 94.7% of the roster's earning power from the odds screen. The loudest
row is routinely the cheapest. Read the call site before you rank anything.

**Split client from server to tell "the update is heavy" from "the update is
broken".** Brainrot's World 3: OOM exits 610–746/day → **5,213**, client memory
+21%, `ClientFpsP10` −23%, while `ServerFrameRateP10` sat dead flat at 59.6–59.7.
That pattern is content weight crushing low-end devices, not a defect, and the
fix is an optimisation budget rather than a patch. Waterslide's update in the
same week showed no memory or OOM step at all, which is what a light update
looks like. An OOM exit is a lost session, so this is never "just performance".

**A registry loop with no `pcall` turns one player's bad state into a partial
server outage.** Waterslide's `ServerInit` runs
`for _, module in shared["Service"] do module.Update(dt) end` inside a Heartbeat
with no protection anywhere. When `PlayerService.Update` threw on one player
(`pairs(nil)` via an uninitialised manager), **every service after it in the
iteration was skipped for that tick**, and the line clearing the dirty flag sat
after the throw, so it repeated at 10 Hz for that player's whole session. Look
for this shape explicitly: an unprotected iteration over a module registry, or
over players, where any single element can throw. The guard usually already
exists elsewhere in the same file — Waterslide's `IsHavePass` checked the exact
field that `GetData` did not.

### An event contaminates the window — say so before anyone reads the numbers

An admin event, a giveaway or a raid inflates everything and **breaks
per-player normalisation specifically**, because peak PCU is a terrible
denominator on a spike day (it is a max, not an average, so it understates
per-player rates in exactly the direction that reads as "improved"). On
2026-08-15 PCU hit 14,932 against 1,940 two days earlier; raw errors were up
4–5× and no ratio built on that was worth quoting.

What survives contamination: **metrics that are already rates**
(`ClientCrashRate15m`). What does not: every volume, and every ratio you build
from one. Name the contaminated day, exclude it, and give the next clean date.
Then record what the event was and when it ran — otherwise the spike becomes an
unexplained anomaly in the series that somebody re-investigates in a fortnight.

**You do not have to ask anyone when an event ran — the grab already knows.**
`annotations.md` carries `ANNOTATION_TYPE_EXPERIENCE_EVENT_STATE`, one row per
event with `eventName` and a `START`/`END` pair stamped to the second. On Knife
Farm it dated `ADMIN ABUSE` to `2026-08-15T17:00:25Z → 18:00:25Z`, which
**eliminated it as a cause** for a break three days earlier, and it printed the
whole calendar back to June (a weekly `NEW UPDATE` → `x5 LUCK` rhythm, with
three new event types appearing only in August). Read this before theorising
about any spike. Times are UTC and the dashboard shows local, so a one-hour
event a user remembers as 19:00 is 17:00Z in CEST.

**A quest that pays for coming back contaminates retention for its whole run.**
Knife Farm's `StellarQuest` (`ServerScriptService.StellarQuest`, read at v3829)
hardcodes `QUEST_START`, `QUEST_DURATION` and `REQUIRED_DAYS = 7`, so from
13 Aug to 23 Aug D1/D3/D7 partly measure reward-claiming rather than engagement.
**Grep the place for a quest/login-reward module before quoting any retention
number**, and state the window. This matters most on a game whose diagnosis *is*
retention: a rise during the quest is not a fix, and it will revert when the
quest ends. Note also that a quest can cut the other way on the same game —
its task list included "Buy 20 Knife Crates", which pushes purchases up, so
never assume the direction without reading the tasks.

## 5d. Funnel semantics — three rules that change what a funnel means

From `docs/production/analytics/funnel-events`. Each of these can make a funnel
say something it does not mean:

1. **Skipped steps are back-filled.** *"If you log step 3 without logging steps
   1 or 2, the funnel considers steps 1 and 2 as completed."* A game that logs
   out of order therefore shows completion that never happened, and real
   drop-off at intermediate steps becomes structurally invisible. Before
   diagnosing "users sail through 2-3 and die at 4", confirm the game logs every
   step in order. A suspiciously flat middle is this bug's signature.
2. **A repeated step counts once.** Only the first instance per user (or per
   `funnelSessionId`) counts, so a retry loop is invisible in the funnel and has
   to be found elsewhere.
3. **Filters apply to the FIRST STEP ONLY** — deliberately, to avoid
   double-counting users whose status changes mid-funnel. So a filtered funnel
   describes "users who *entered* as X", not "users who were X at that step".

One-time funnels (onboarding) take no `funnelSessionId`; recurring funnels
(shop, progression loops) require one, and without it every visit collapses
into a single funnel run.

**Discrimination test — regression or design defect?** Measure the same step in
a window *before* the publish and a window *after*. A step that is equally bad
on both sides is **not** what the deploy broke, however loudly it correlates
with the complaint. On `10030829154`, `Tutorial_Main_5_ToRaftShop` read 0.824
pre-publish and 0.866 post-publish — the worst step in the funnel in *both*
windows. The complaints arriving after the update were real, and the step was
genuinely broken, but it had been broken for weeks; the deploy only changed how
many people hit it. Report those as two separate items with two separate
priorities, or the chronic one gets closed as "fixed by the rollback" and comes
straight back.

Corollary worth stating to a producer: **a step at ~0.83 is not a 17% problem,
it is a compounding one.** Fifteen steps at 0.97–1.00 with one at 0.83 still
compounds to ~50% overall completion, so "half your new players never finish
the tutorial" was true before the incident and will still be true after it.
Size the chronic leak against the incident before choosing what to fix first.

**Two failure modes of the funnel endpoint itself, both measured 2026-08-23:**
it answers only *some* windows — of ten rolling windows requested, two returned
data and eight returned an empty series — and the set that works **changes
between calls**, so a window that answered twice can go quiet an hour later.
An empty funnel series is therefore never evidence about the game. Re-query
before concluding anything, and record the window that worked alongside the
number.

**Corrected 2026-08-26 — "filtering funnel metrics by `Platform` returns no
series at all" was wrong**, and it sent three later investigations down the
wrong path. `Platform In ["Computer"]` returns every step and genuinely narrows
the values (~33% of each, matching desktop's DAU share); `IsNewUser` filters
correctly too. The dimension that returns nothing is **`FunnelName`**, and only
that one. The original observation was almost certainly an unpolled 202 (see the
recipe at the top of §1) being read as an empty series.

**Quotas that silently cap what exists:** 10 funnels per experience, 100 steps
per funnel, 3 custom fields per event, and **8,000 unique custom-field value
combinations before the rest is bucketed as "Other"**. A funnel with a huge
"Other" segment has hit that ceiling — an instrumentation fact, not player
behaviour. Events stay visible **90 days** from last receipt, and the logging
budget is **120 + (20 x CCU) requests/minute**: a game that outgrows its event
budget starts dropping events, which looks exactly like a metric decline.

## 5e. Levers you can actually pull through Open Cloud

Diagnosis without a remedy is half the job (see 5b). These close the loop, and
all are key-authenticated and scriptable.

**Configs API — change live balance WITHOUT publishing.** Item availability,
damage, cooldowns, UTC-scheduled releases. Scopes `universe:read` /
`universe:write`, callable from inside an experience via HttpService since
March 2026, propagation up to ~5 minutes, full version history.
**This is the rollback mechanism**, and Roblox names that use case explicitly:
revert to a previous config version if metrics spike negatively. A watch that
detects a regression plus a config that undoes it without a republish is the
entire loop — detection is only worth what the speed of the fix makes it worth.

**Experience Notifications — re-engagement.**
`POST https://apis.roblox.com/cloud/v2/users/{userId}/notifications` with
`source.universe`, `payload.message_id`, `type: "MOMENT"`. Constraints that
shape the design: **one per user per day per experience**, recipients must be
opted in and 13+, the experience needs 100+ visits, and the message string must
be pre-created in the Creator Dashboard — there is no API for the text.
Opt-in via `ExperienceNotificationService:PromptOptIn()`, which will not re-show
within 30 days. **Delivery is not guaranteed and scales with engagement**:
better-engaging experiences get more of their notifications delivered, so
notification reach is itself a downstream health metric rather than a fixed
channel. A worked example from the field: notifying offline users after two
hours that idle earnings are ready to claim.

**Experience Events** — max 10 upcoming/ongoing, update announcements once per
3 days (60 chars), 7 days' lead time for off-platform featuring, and the
"Trending Events" sort needs **1,000+ RSVPs**. `RSVPCount` is already in the
grab plan, so an event's pull is measurable before it starts.

**When proposing a fix, prefer the lever that ships without a republish.** A
config change is minutes and reversible. A build is a deploy, a review, and a
fresh set of `PlaceVersion` steps to disentangle from every metric afterwards.

## 6. What you hand over

1. **The claim** — one sentence: which rung broke, on which date.
2. **The evidence** — metric, series label, dates, values. Traceable.
3. **What you ruled out** — each candidate and the test that killed it.
4. **Confidence, and what would change it** — name the observation that would
   overturn your conclusion. If nothing could, it is not a finding.
5. **The action** — specific, with expected magnitude and how it gets measured.

Separate **confirmed** (code read, or cell-verified against the dashboard) from
**likely** (consistent with the pattern) from **unknown**. Never let the reader
guess which one they are reading.
