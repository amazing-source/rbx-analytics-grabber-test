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

## 2. Read the signature, not the single metric

Each cause has a fingerprint across rungs. Match the whole pattern.

| Cause | Reach | Retention | Session | Shape |
|---|---|---|---|---|
| **Discovery/algorithm cut** | ↓↓ | **flat** | flat | Step change on one day; new users fall hardest |
| **Product/update break** | flat at first | **↓** | ↓ | Starts at a publish; sustained; funnel breaks at one step |
| **Technical/outage** | flat | ↓ during only | ↓ during only | Recovers when the fault clears |
| **Monetization change** | flat | flat | flat | Only rung 4 moves |
| **Lifecycle decay** | ↓ gradual | slow ↓ | flat | Smooth curve, no step, matches genre decline |

**Retention flat while reach collapses = discovery, not product.** That single
contrast has carried more diagnoses here than any other.

## 3. Discrimination — the step that makes it a diagnosis

For every candidate cause, name the test that could falsify it, then run it.
A hypothesis that survives nothing is not a finding.

- **Does the effect outlive the cause?** If X stopped and the metric kept
  falling, X is not the cause. *Become a Brainrot: crashes ended 2 Aug, DAU
  kept falling 492K → 277K through 5 Aug → crashes were a confound, and the
  30 July deploy remained the answer.*
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
- **Is it just the weekend?** Roblox audiences normally *rise* Fri–Sun. A
  weekend fall is anomalous; a weekend rise is not a win.

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

### We capture QPTR — it is `EndToEndCVR`

Established 2026-08-08 against both universes. `EndToEndCVR` is Roblox's
impression → play conversion, and it tracks unique plays ÷ unique impressions
with **r = 0.998** on Become a Brainrot (r = 0.74 on Knife Farm; the small
level offset is Roblox's attributed calculation versus a crude same-day ratio).
Measured ranges: **Knife Farm 3.0–4.1%, Become a Brainrot 4.8–7.1%** — both
above the playbook's >3% floor, which corroborates the mapping.

**`RFYQualifiedPTR` is NOT QPTR.** It reads ~0.5%, roughly five times smaller,
and measures the Recommended-For-You qualification gate specifically. Never
quote it as QPTR.

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
  funnel. **Do not apply this curve to idle/simulator titles** — the playbook
  does not state one for them, and inventing one would be a fabricated prior.
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
