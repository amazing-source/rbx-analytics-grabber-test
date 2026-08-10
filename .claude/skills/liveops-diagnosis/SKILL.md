---
name: liveops-diagnosis
description: Diagnose a Roblox game's metrics — why DAU/revenue/retention moved, what caused it, and what to do about it. Use whenever reading data/games/<id>/, writing a decline or post-update report, answering "why did X drop", or proposing a fix based on analytics. Covers the diagnostic ladder, Indigo's benchmarks and levers, and the discrimination tests that separate cause from coincidence.
---

# LiveOps diagnosis

A producer acts on what you write: kills a feature, ships a fix, or misses an
outage. The cost of a confident wrong answer is higher than the cost of "I
don't know yet". This skill is the method that keeps the difference visible.

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

**No funnels instrumented? Use `TotalSessionsEndedInBucket`.** Broken down by
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
- **Feedback: use the downvote RATE**, `down / (up + down)`. The `Total` series
  is upvotes *minus* downvotes and is useless alone. On 9963622286: 13.4%
  pre-break → 21.8% during the bleed → 28.1% on the fix day → 10.2% the day
  after. It moved before any retention metric could.

**And read PCU at half-hour before quoting a daily peak.** 9963622286's Saturday
PCU of 17,572 was a 90-minute giveaway: 5,284 → **19,593** → 3,784, settling
*below* the pre-event baseline. The daily number reads as a recovery; the shape
says the game can still buy attention and cannot hold it.

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
