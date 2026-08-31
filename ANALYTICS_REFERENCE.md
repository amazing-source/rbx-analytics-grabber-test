# Roblox analytics — an internal working reference

> ## Read this before quoting anything in here
>
> **This is not research. No literature review was performed to produce it.**
> There was no survey of the DevForum, no RDC talks, no interviews, no
> cross-studio corroboration, no attempt to find work that contradicts it. The
> only inputs were: Roblox's official documentation (read directly, where a
> question sent us to it — not read systematically), our own captured data from
> a handful of games, and one internal acquisitions playbook.
>
> **What can be trusted here is the arithmetic, not the explanations.**
>
> | | Trust it | Because |
> |---|---|---|
> | *"This chart label maps to this API metric, and 27/27 cells match the export"* | **Yes** | Mechanically checked, reproducible by anyone with the same files |
> | *"Daily peak concurrents is the sum of per-platform peaks"* | **Yes** | An arithmetic identity, exact to the bit |
> | *"D1 went 16.8% → 9.72% on 30 July on this game"* | **Yes** | It is a number, off a verified series |
> | *"…because v546 broke the tutorial"* | **No — this is our reading** | One game, one analyst, no control, no second opinion |
> | *"Retention flat while reach collapses means discovery, not product"* | **No — this is a heuristic** | It has worked for us several times. That is not the same as being true |
>
> **The evidence base is small and not diverse.** Seven universes, one studio,
> one genre cluster (idle / simulator / brainrot), most carrying only 31–37 days
> of daily history, nearly all observations taken during 2026-08. Where a claim
> rests on one game or one day, it says so — and it says so often.
>
> **The causal claims were generated and confirmed by the same process**, which
> is precisely the condition under which confirmation bias is invisible. Several
> of them have already been retracted after a wider window was pulled; those
> retractions are kept in the text on purpose, because they are the best
> available evidence about how often the rest are wrong.
>
> **So: use Parts A and A2 as reference. Treat Parts B and C as hypotheses that
> have survived a few tests on a few games — a starting point for someone else's
> investigation, not a conclusion to hand a producer.**

**What this is.** One half of a deliberate pair. It was written *before* reading
the ChatGPT deep-research output, so the two are independent and can be diffed.
Its job is to say what our own data actually shows and where our pipeline lies to
us — the mechanical facts a public-corpus answer cannot contain. Its job is
**not** to establish what is true about Roblox in general; that is what the
research is for, and where the two disagree about a *cause*, the research should
generally win.

## Provenance tags

Every non-obvious claim carries one. They are not confidence levels; they are
*kinds of evidence*, and they fail in different ways.

| Tag | Means | How it fails |
|---|---|---|
| `[Verified]` | Checked cell-for-cell against Roblox's own CSV export, or reproducible API behaviour anyone can re-run | Only about the shape of the data. Says nothing about a game |
| `[Official]` | Roblox's own docs or announcement | Goes stale silently; Roblox changes behaviour without changelogs |
| `[Observed]` | A number we recorded, and how it moved, on a named universe on a named date | True about that game on that date. **Carries no explanation of why** |
| `[Our reading]` | Our causal interpretation of an `[Observed]` movement | **Not verified.** Usually n=1, one studio, one genre. May be a coincidence that fit |
| `[Indigo]` | The AE playbook's own calibration (`indigodev`, `src/data/game-data.ts`) | Authored teaching cases, **not sampled telemetry**. Sanity bands, not benchmarks |
| `[Inference]` | Reasoned from the above, not observed | The class that produced most of the retracted findings here |
| `[Unknown]` | Checked, could not establish | Listed on purpose — an absent row reads as an oversight |

**`[Observed]` is the most common tag in the file, and it is deliberately weak.**
It means we have the number and we trust the number. It says **nothing** about
why the number moved. Where a card gives a cell count ("27/27 match") or an exact
decomposition, that specific claim is `[Verified]` — and the verification is
stated inline precisely so it can be re-checked rather than taken on trust.

**The standing rule underneath all of it:** an invented query shape that 400s,
or returns an empty 200, tells you nothing about the game. Only a shape the
dashboard itself issues is evidence. A failed request is missing data, never a
zero.

---

# PART A — METRIC CARDS

Cards are keyed by **API metric name**, because that is what the exported CSVs
are keyed by. The Creator Hub label is a separate field and does not always
match — the label→metric map at the end of this part was resolved by matching
cell values, not by assumption. `[Observed]`

The high-stakes metrics get full cards. The rest are in the compact table, on
the principle that a card full of `null` is noise.

## Reach / discovery

```yaml
api_name: UniqueUsersWithImpressions
ui_label: "Unique users with impressions"
definition: unique users shown the experience's tile, per day
unit: users (count)
aggregation: COUNT_DISTINCT per day
granularity_used: ONE_DAY
breakdowns_that_work: [AcquisitionSource]
additive_across_breakdowns: not verified — do not assume the sources sum to Total
AcquisitionSource_values: [HomeRecommendation, Friends, Search, Charts, Others, SponsoredAds, SearchAds]
reads:
  - "Rung 1 of the ladder. Reach falling with retention flat is the single most
     load-bearing contrast in this file. [Observed]"
  - "SponsoredAds / SearchAds read literally zero on every day of the window on
     10399712766, which killed 'the seller's ad spend stopped at handover' in one
     query. Check them before blaming an ad cliff. [Observed 2026-08-21]"
traps:
  - "Roblox counts only ORGANICALLY-discovered users in ranking, so growth from
     Friends / Search / ads does not buy ranking. [Official]"
confidence: Observed + Official
```

```yaml
api_name: EndToEndCVR
ui_label: null    # not surfaced under this name in the UI
definition: Roblox's impression -> play conversion, all surfaces
unit: fraction (0-1 in both API and CSV export)
denominator: unique impressions, all surfaces; numerator unique plays
granularity_used: ONE_DAY
reads:
  - "Matches unique plays / unique impressions at r = 0.998 on 9963622286, so it
     genuinely is the impression->play conversion. [Observed 2026-08-08]"
  - "Best available proxy for what Indigo calls QPTR — but play-based, therefore
     a LOWER BOUND on a click-based QPTR. [Observed]"
observed_levels:
  knife_farm_9610561918: 3.0-4.1%
  become_a_brainrot_9963622286: 4.8-7.1%
  climb_up_mountain_dead: 5.10% mean, falling -11.8%/wk
traps:
  - "**CVR and impressions are INVERSELY correlated: r = -0.881 over 28 days on
     10399712766.** CVR rises when Roblox narrows reach, because the denominator
     moves faster than the plays do. A CVR rise during a reach collapse is the
     signature of a SHRINKING audience. A report here already banked a
     4.65% -> 6.64% rise as 'discovery is healthy, click-to-play up 17%'; the
     game was being shown to 27% fewer people. **Never quote a CVR move without
     the impressions series beside it.** [Observed 2026-08-21]"
confidence: Observed
```

```yaml
api_name: RFYQualifiedPTR
ui_label: null
definition: the Recommended-For-You qualification gate specifically
unit: fraction
granularity_used: ONE_DAY
observed_level: ~0.5% — roughly 5x smaller than EndToEndCVR
traps:
  - "**This is NOT QPTR.** The name invites the substitution and the levels are
     five times apart. Quoting it as click-to-play rate understates ~5x.
     [Observed 2026-08-08]"
  - "Roblox REMOVED qualified play-through rate from RFY ranking on 2026-06-15,
     replacing it with play-through rate + first-play bounce rate. As of that
     date this is a health signal, not the ranking input. [Official]"
confidence: Observed + Official
```

```yaml
api_name: RFYL7PlayDays
ui_label: null
definition: play days per user over a trailing 7 days, as RFY sees it
unit: days per user
granularity_used: ONE_DAY
reads:
  - "Since 2026-06-15 RFY ranks on play days per user, so **this metric IS the
     ranking input, not a proxy for it.** Quote it before theorising about the
     algorithm. [Official + Observed]"
  - "Knife Farm: ~1.4 play days per 7, flat all year. That number is the ceiling
     on distribution, and no amount of reach work moves it. [Observed]"
confidence: Observed + Official
```

## Engagement

```yaml
api_name: PeakConcurrentPlayers
ui_label: "Peak concurrent players"
unit: players
aggregation: MAX within the bucket — but see the trap; the daily total is a SUM
granularity_used: [ONE_DAY, HALF_HOUR]
additive_across_breakdowns: TRUE at ONE_DAY, and that is the defect
traps:
  - "**ONE_DAY is the SUM of per-platform peaks, not the day's peak.** Measured
     to the bit on 10399712766, 2026-08-21: headline 13,532.377 =
     Computer 439.116 + Console 532.324 + Phone 9,773.771 + Tablet 2,783.785 +
     TV 3.381. The dashboard export's best half-hour the same day was 10,429 —
     **30% lower**. Platforms peak at different times, so the sum is an upper
     bound, correct only when they peak together (which is why 08-20 matched
     exactly and hid the bug). This misread a live incident as +21.8% when the
     game was -24%. [Observed — F16]"
  - "**A partial MAX is a FLOOR, not a ceiling.** An in-progress day can only
     rise. A 13:22Z read of 8,258 was called near-final on the inferred rule
     'the peak lands at 13:00' — a rule resting on ONE day — and reported as a
     -28% drop. The 17:11Z re-read was 13,532. [Observed 2026-08-21]"
  - "Half-hour is where the shape lives. 9963622286's Saturday PCU of 17,572 was
     a 90-minute giveaway: 5,284 -> 19,593 -> 3,784, settling BELOW the pre-event
     baseline. The daily number reads as a recovery; the shape says the game can
     buy attention and cannot hold it. [Observed]"
use_instead: ConcurrentPlayers @ ONE_HOUR, or PeakConcurrentPlayers @ HALF_HOUR
confidence: Observed
```

```yaml
api_name: ConcurrentPlayers
ui_label: null
definition: mean concurrent players over the interval
unit: players
granularity_used: ONE_HOUR
traps:
  - "400s at ONE_HOUR with no Place filter. [Observed]"
  - "**The gateway served an impossible point.** 10399712766, 2026-08-21T15:00Z
     returned 13,532.377417024942 between neighbours of 8,042 and 6,461, while
     PeakConcurrentPlayers HALF_HOUR for the same hour read 6,869. A mean cannot
     exceed the max over the same interval. The bad value is bit-exact the daily
     platform-sum (the F16 quantity) appearing inside an hourly series. It sits
     at 15:00Z on a day that published at 14:15Z, so it reads exactly like 'the
     update spiked then collapsed 52%'. It did not happen. **Working rule: on
     the in-progress day, cross-check any sub-daily ConcurrentPlayers point
     against PeakConcurrentPlayers HALF_HOUR and discard it if the mean exceeds
     the peak.** ONE observation, no re-read exists — do not generalise.
     [Observed 2026-08-21 — F18]"
confidence: Observed, n=1
```

```yaml
api_name: AverageSessionLengthMinutes
ui_label: "Average session time"
unit: minutes
granularity_used: ONE_DAY
breakdowns_that_work: [IsNewUser, Platform]
verified: 27/27 cells exact against the dashboard export
traps:
  - "**Not the same metric as SessionDurationSecondsAvg** — that one is seconds,
     and the dashboard's 'Session time by place' export is in minutes, so a naive
     join reports a 60x mismatch forever. [Observed — F6]"
  - "Dips ~15-22% in the publish hour and recovers within ~2h, because servers
     cycle and truncate sessions. That is the deploy, not breakage. Still
     degraded 3h later IS a finding. [Observed on 10399712766's 14:15:59Z ship]"
  - "This and AveragePlayTimeMinutesPerDAU are close cousins; listing both as
     separate findings double-counts one mechanism."
confidence: Observed
```

```yaml
api_name: TotalSessionsEndedInBucket
ui_label: null
definition: sessions ending, bucketed by length
unit: sessions (count)
breakdowns_that_work: [SessionTimeBucket]
reads:
  - "**The substitute for a funnel on a game with none instrumented.** The
     session-length distribution is the closest thing to 'where do they quit',
     and the <60s and 61-180s bands are themselves official RFY bounce signals.
     [Observed + Official]"
  - "A stable bucket profile alongside collapsing D7 is strong evidence the break
     is BETWEEN sessions, not inside them. Knife Farm: median session ~10 min,
     bounce under 60s only 7.6% -> 8.7%, so within-session engagement was never
     the problem. [Observed]"
confidence: Observed
```

## Retention

```yaml
api_name: ForwardD1Retention        # and ForwardD7Retention / ForwardD30Retention
ui_label: "Day 1 / 7 / 30 retention"
unit: fraction — fractions on BOTH sides, API and CSV export [Observed]
granularity_used: ONE_DAY
breakdowns_that_work: [Platform, AcquisitionSource, IsNewUser]
verified: D1 29/29, D7 23/23 cells exact against the dashboard export
latency:
  - "**D1 lags ~2 days.** D1 for day D needs D+1 to finish, plus ~1 day of
     Roblox's own pipeline: a grab at 2026-08-10 14:28Z returned no D1 past
     2026-08-07. So the last one or two points of ANY retention chart read low,
     every day, on every game, regardless of what is happening. This arrives as
     'D1 is still dropping' from someone reading the dashboard. [Observed]"
  - "D7 = 8 days, D30 = 31 days before a cohort is readable."
  - "A deploy at 17:14Z means that day's cohort is mostly PRE-fix. The first day
     that tests a fix is the day AFTER it ships. [Observed]"
traps:
  - "**D30 returning an empty 200 on a 28-day window is a window artifact, not an
     absent metric** — D30 only exists for cohorts >=30 days old, and a 28-day
     window contains none. [Observed — COVERAGE row 10]"
  - "**A login-reward quest contaminates retention for its whole run.** Knife
     Farm's StellarQuest hardcodes REQUIRED_DAYS = 7, so 13-23 Aug D1/D3/D7
     partly measure reward-claiming rather than engagement. Grep the place for a
     quest / login-reward module before quoting any retention number. It cuts
     both ways — that quest also required 'Buy 20 Knife Crates', which pushes
     purchases up. [Observed]"
benchmark:
  official: "**Roblox publishes NO retention benchmarks.** The docs give
    definitions and improvement advice, no numbers. The '45-60% D1 for
    simulators' figures circulating on SEO blogs (bloxg, rolearn, lensblox) are
    unsourced — do not quote them. [Observed by searching the docs]"
  ours: "D1 ~16-20% on this portfolio's titles during periods we considered
    healthy [Observed]. Calling sustained sub-13% 'broken' is [Our reading] — it
    is a line drawn around our own games' normal range, on one studio in one
    genre, and it is NOT a benchmark. Do not present it as one, and do not apply
    it to a game outside this genre cluster."
confidence: Observed + Official
```

```yaml
api_name: DailyCohortRetention / WeeklyCohortRetention
granularity_quirk:
  - "**DailyCohortRetention is OneDay but caps at a 10-DAY WINDOW.**
     WeeklyCohortRetention is served at `None`, not OneDay. The dashboard gateway
     accepts ONE_DAY for both, so a shared plan asks wrong and Open Cloud answers
     'Granularity OneDay is not supported for metric X' — which reads as missing
     data and is not. [Observed 2026-08-19]"
confidence: Observed
```

## Monetization

```yaml
api_name: PayingUsersCVR
ui_label: "Payer conversion rate"
unit: fraction
denominator: DAU        # this is the whole trap
granularity_used: ONE_DAY
verified: 27/27 cells exact
traps:
  - "**Never call a step on this rate without looking at the numerator.** Knife
     Farm 2026-08-12: CVR fell 1.075% -> 0.860% and read as a one-day break.
     Paying users were 355 on the 11th and **356** on the 12th — flat — while DAU
     rose 24% (33,544 -> 41,527). The rate moved because the denominator did.
     Reported and retracted in the same session. [Observed]"
  - "**The fix is a matched-DAU comparison:** find days on either side with
     similar DAU and compare the raw count. At ~36K DAU on 1-3 Aug the game
     converted 561/634/669 payers; at ~34K DAU on 13-15 Aug, 276/265/291. Half
     the payers at the same size — that is the claim that survives. [Observed]"
confidence: Observed
```

```yaml
api_name: AverageRevenuePerUser     # ARPDAU
ui_label: "Average revenue per DAU (ARPDAU)"
unit: Robux per DAU
verified: 27/27 cells exact
traps:
  - "**DailyRevenue normalised by DAU *is* ARPDAU.** Any volume metric must be
     DAU-normalised before scoring, but once you do, these two are the same
     quotient: both reported -20.7% at z -1.17, byte-identical, on 9963622286
     2026-08-18. Two lines on a findings list read as two problems. Before
     listing a finding, ask what its numerator and denominator are; if another
     line has the same pair, they are ONE finding. [Observed]"
  - "Same trap for AverageSessionLength vs AveragePlayTimeMinutesPerDAU, and for
     any L7Average* against its own daily series."
reads:
  - "**Low ARPDAU alongside healthy CCU is the UPSIDE case, not a fault** —
     undertapped monetization. [Indigo]"
  - "ARPDAU is the test that sizes an error spike. 9963622286 shipped ~35M client
     warnings on 2026-07-31 across a broken season pass and shop UI; if they cost
     anything, ARPDAU would step. It went 0.368 -> **0.433** -> 0.438, the highest
     of the window. Revenue fell purely with DAU. [Observed]"
confidence: Observed
```

```yaml
api_name: ItemMonetizationRevenue
ui_label: "Robux Spent (Realtime)"   # resolved BY VALUE over 56 cells, not by name
unit: Robux
granularity_used: ONE_HOUR
breakdowns_that_work: [ProductType, RevenueSource]
display_aliases: {Developer Products: DevProduct, Passes: GamePass, Third-party avatar item commissions: CommissionAvatar, Private Servers: PrivateServer}
traps:
  - "**The realtime series is where the gateway's re-serving is worst.** The
     17:41 grab returned Aug-7 00:00 = 3,092 (dashboard agrees); the 17:48
     re-grab returned **747** for the same 17-hour-old point. Same pattern in the
     ProductType slices (2406->490, 686->257). But the largest divergences run
     the OTHER way — 353 -> 21,835, which looks like back-fill. For anything
     labelled *Realtime*, treat a revision row as 'this hour is disputed' rather
     than trusting either value. [Observed — F2 / G5]"
confidence: Observed
```

## Technical

```yaml
api_name: ErrorCount
ui_label: "Errors and warnings"
unit: events (count)
counts: OCCURRENCES, not affected players — this is the trap
granularity_used: [ONE_DAY, HALF_HOUR]
breakdowns_that_work: [LogSource, PlaceVersion, MessageHash]
filter_only: [FirstSeenPlaceVersion]
requires: filter Place — 400s without it
data_retention: ~56 days (a chunk boundary, so the true horizon is 56-84d)
traps:
  - "**A huge error count is not a huge problem. Test it against a rate.** ~35M
     client warnings on 9963622286 cost nothing measurable in ARPDAU. Warnings
     are often guarded paths firing per-item per-frame. Convert count to affected
     players, or to a rate move, before reporting one. [Observed]"
  - "**Severity inverts — rank by mechanism, never by volume.** Same session, same
     game: a VFX signature at 2,927 events was purely cosmetic (both call sites
     Destroy() on the line before), while AnimalModule:547 at 4,303 killed the
     upgrade button outright, and the signature that actually mattered was
     **8,249** — a race on the line that fires the tutorial. The loudest row is
     routinely the cheapest. [Observed]"
  - "**A publish spikes LogSource:Server 20-50x for under 24h.** 10030829154:
     70-215K/day baseline, then 2.0-5.9M on **4 of 4** deploy days and no other
     day, back to baseline within 24h each time. It is the publish path, not the
     build. Only a finding if still elevated the NEXT day. [Observed]"
  - "**The MessageHash -> text lookup 500s** on these universes, so the API gives
     volumes without text. Error TEXT comes from the Studio export only.
     [Observed]"
confidence: Observed
```

```yaml
api_name: ClientCrashRate15m
ui_label: "Client crash rate"
unit: fraction (fractions on both sides)
denominator: ENDED sessions      # [Official]
data_retention: ~30 days
requires: filter Place
traps:
  - "**The denominator is ended sessions**, so a day with many sessions that never
     cleanly end moves the rate without the game becoming less stable. [Official]"
  - "**Read crash RATE, not crash COUNT** — count tracks DAU and falls when the
     game shrinks, which reads as an improvement. [Observed]"
  - "**Roblox draws the line DASHED when the sample is small** and says to read
     the count instead in that regime. That is the dashboard's own version of
     DATA_STATUS_NOT_STATISTICALLY_SIGNIFICANT. [Official]"
  - "**Do NOT request this at HALF_HOUR.** The inferred half-hour shape returns
     values up to **65% off** the dashboard export. Verified cell-by-cell and
     purged from the plan. Daily is fine. [Observed — G2]"
confidence: Observed + Official
```

```yaml
api_name: OomUnexpectedExits
ui_label: "Unexpected out of memory exits"
unit: exits (count)
traps:
  - "**Undercounts by design** — Roblox: 'does not cover all out-of-memory crashes
     due to telemetry limitations'. Directionally valid, never quotable as an
     absolute. Write 'OOM exits rose ~40%', never 'there were 943 OOM crashes'.
     [Official]"
  - "**An OOM exit is a lost session**, so this is never 'just performance'."
  - "Client memory % approaching 100% on Android is a crash PREDICTOR. Memory%
     climbing together with OOM exits is a leak with a known ending — that pairing
     is a finding on its own. [Official + Observed]"
  - "The half-hour shape is inferred and disagrees with the export. Daily only.
     [Observed — G2]"
confidence: Observed + Official
```

```yaml
api_name: ClientFpsP10 / ServerFrameRateP10 / CpuTimeAvg / ClientMemoryUsagePercentageAvg
official_targets:            # the rare case where Roblox publishes hard numbers
  frame_rate: 60 FPS
  cpu_time: "<16 ms per frame — this is what 60 FPS costs"
  server_memory: "<50% of total, or <3 GB"
  compute_efficiency: ">100% (better than the Roblox average)"
source: docs/production/analytics/performance      # [Official]
traps:
  - "**Split client from server to tell 'heavy' from 'broken'.** Brainrot's World
     3: OOM 610-746/day -> 5,213, client memory +21%, ClientFpsP10 -23%, while
     ServerFrameRateP10 sat flat at 59.6-59.7. That is content weight crushing
     low-end devices — the fix is an optimisation budget, not a patch. [Observed]"
  - "**If desktop fell more than phone, it is not a render regression.**
     [Inference — but it has held every time it was run]"
  - "ClientFpsAvg at HALF_HOUR is ~52% off the export (30.7 vs 46.7 fps). And the
     'Client frame rate' label -> ClientFpsAvg mapping is **disproven**; CLAUDE.md
     asserted it and it is wrong. [Observed — G2 / G3]"
confidence: Observed + Official
```

## Funnels

```yaml
api_name: FunnelCohortCompletionRate / FunnelCohortSessionCompletionRate
granularity_used: ONE_DAY, per named step, full history (94 days on 9963622286)
reads:
  - "**This is the funnel series that CAN be dated to a day.** It is true that
     FunnelUserChurnRate and FunnelUserStepCompletionRate 400 at ONE_DAY by
     FunnelStep, so those give levels not trends — but that was generalised to
     'no funnel can be dated', which was wrong and cost a finding.
     [Observed 2026-08-10 — G10]"
traps:
  - "**On NONE-granularity funnel rows the date column is the WINDOW START, not a
     day.** A row stamped 2026-08-07 on a 7->10 Aug grab is the aggregate over
     four days. And moving the window changes the number with no day changing:
     PlayerProgression FunnelUserOverallCompletionRate reads 26.73% from an 11 Jul
     window and 23.09% from a 7 Aug one. A producer comparing two screenshots
     taken at different ranges reports a drop that did not happen. [Observed]"
  - "**A window aggregate can hide a series that doubled.** Rebirth1 churn read
     0.6144 full-life vs 0.6137 post-break and was written up as an immovable
     structural gate. The daily series underneath ran 24% -> 48% -> 35%.
     **Before calling anything structural, plot it daily.** [Observed]"
official_semantics:            # all of these change what a funnel MEANS
  - "**Skipped steps are back-filled.** 'If you log step 3 without logging steps 1
     or 2, the funnel considers steps 1 and 2 as completed.' A game logging out of
     order shows completion that never happened, and intermediate drop-off becomes
     structurally invisible. **A suspiciously flat middle is this bug's
     signature.** [Official]"
  - "**A repeated step counts once** — only the first instance per user (or per
     funnelSessionId). A retry loop is invisible in the funnel. [Official]"
  - "**Filters apply to the FIRST STEP ONLY.** A filtered funnel describes 'users
     who ENTERED as X', not 'users who were X at that step'. [Official]"
  - "Quotas: 10 funnels/experience, 100 steps/funnel, 3 custom fields/event, and
     **8,000 unique custom-field combinations before the rest is bucketed as
     'Other'** — a large Other segment is an instrumentation fact, not behaviour.
     Events visible **90 days** from last receipt. Logging budget
     **120 + (20 x CCU) requests/minute** — a game that outgrows its event budget
     starts dropping events, which looks exactly like a metric decline. [Official]"
  - "One-time funnels (onboarding) take no funnelSessionId; recurring funnels
     (shop, progression) require one, and without it every visit collapses into a
     single run. [Official]"
confidence: Observed + Official
```

```yaml
api_name: FunnelStep (dimension)
trap:
  - "**Step values ship with a human name — use it.** breakdownValue[] carries
     displayValue next to value: FunnelStep '4' is `Rebirth1`. The exporter used
     to drop it, which turned the single largest leak in Become a Brainrot
     ('61.4% never reach step 4') into an unreadable curiosity instead of '61.4%
     never reach their first rebirth'. The names were in data/raw/ the whole time
     — never an API limit. Roblox sometimes sends displayValue: '' (PlayerProgression
     step 2); falling back to the integer is correct. **The raw value stays the
     series identity** — a display name in the key silently forks every merged
     series. [Observed — G9]"
confidence: Observed
```

## Feedback

```yaml
api_name: PlayerFeedbackVotesCount
ui_label: "User ratings"
breakdowns_that_work: [VoteType]
trap:
  - "**Use the downvote RATE, down/(up+down).** The `Total` series is upvotes
     MINUS downvotes and is useless alone. On 9963622286: 13.4% pre-break ->
     21.8% during the bleed -> 28.1% on the fix day -> 10.2% the day after.
     **It moved before any retention metric could.** [Observed]"
confidence: Observed
```

## Everything else — compact

| Metric | Unit | Gran | Verified vs export | Note |
|---|---|---|---|---|
| `DailyActiveUsers` | users | ONE_DAY | 27/27 | Split by `IsNewUser` — the fastest discrimination test there is |
| `MonthlyActiveUsers` | users | ONE_DAY | 27/27 | |
| `DauMauStickiness` | fraction | ONE_DAY | 30/30 | |
| `Visits` | count | ONE_DAY | 27/27 | **The dashboard's "Sessions" chart is this metric** — resolved by value over 27 cells |
| `TotalPlayTimeHours` | hours | ONE_DAY | 27/27 | Dashboard label is "Playtime" |
| `AveragePlayTimeMinutesPerDAU` | minutes | ONE_DAY | 27/27 | Same mechanism as session length — do not double-count |
| `DailyRevenue` | Robux | ONE_DAY | 27/27 + all 4 sources | Deliberately NOT alert-watched: ÷DAU it is ARPDAU |
| `PayingUsers` | users | ONE_DAY | 27/27 | The numerator to check before believing a CVR step |
| `AverageRevenuePerPayingUser` | Robux | ONE_DAY | 27/27 | ARPPU flat while CVR halves = "fewer payers", not "smaller payers" |
| `ServerCrashCount` | count | ONE_DAY | all overlap cells | 7-day max window. Peak 1,060,617 on 9963622286, 2026-08-01 |
| `ClientCrashCount` | count | ONE_DAY | — | 7-day max window |
| `SessionDurationSecondsAvg` | **seconds** | ONE_DAY | — | **CSV export is MINUTES — ×60 to join** |
| `RFYUniqueNotInterestedUsersPerMillionImpressions` | rate | ONE_DAY | 30/30 | |
| `UniqueUsersWithPlaySessions` | users | ONE_DAY | 30/30 | |
| `Attribution*` family | mixed | ONE_DAY | partial | Per-source value of acquired users |
| `RSVPCount` | count | ONE_DAY | — | An event's pull is measurable BEFORE it starts |
| `PotentialExtraEarningsTotalUsd` | USD | ONE_DAY | — | Has its own 28-day window, with no Place filter to reveal it |

## Label → metric map (resolved by cell-matching)

Established by matching values, not by assuming the label. Two are
counter-intuitive and one is outright disproven.

| Dashboard label | API metric |
|---|---|
| Sessions | **`Visits`** (by value, 27 cells) |
| Robux Spent (Realtime) | **`ItemMonetizationRevenue`** (by value, 56 cells) |
| Average revenue per DAU (ARPDAU) | `AverageRevenuePerUser` |
| Average playtime | `AveragePlayTimeMinutesPerDAU` |
| Playtime | `TotalPlayTimeHours` |
| Session time | `SessionDurationSecondsAvg` — **×60, CSV is minutes** |
| Stickiness (DAU/MAU) | `DauMauStickiness` |
| Client frame rate | **DISPROVEN** — asserted to be `ClientFpsAvg`; it is not |
| `Universe-` prefixed exports | the **`IsNewUser=New` slice**, proven cell-for-cell |

Display-value aliases needed to join a breakdown series: Platform crashes =
`Runtime`, Out of memory = `OutOfMemory`, Developer Products = `DevProduct`,
Passes = `GamePass`, Third-party avatar item commissions = `CommissionAvatar`,
Private Servers = `PrivateServer`, Unknown =
`RAQI_RESERVED_DIMENSION_VALUES_UNKNOWN`.

---

# PART A2 — DATA AVAILABILITY, LATENCY AND ARTEFACTS

This is the section a public-corpus answer cannot write, and it is where most
wrong diagnoses come from.

**This part is the most reliable in the document.** Everything in it is
reproducible API and pipeline behaviour — ask the same query and you get the same
refusal, the same truncation, the same omitted row. None of it is an
interpretation of a game, so none of it carries the n=1 problem that Parts B and
C do. Where a limit is a boundary we inferred rather than one Roblox states, it
says so.

## Retention horizon — technical history is gone after ~30 days

Measured 2026-08-09 by a chunked 430-request grab of 9963622286 back to
2026-03-23. 242 of the 245 failures were 400s on chunks older than the horizon.

| Metric class | Oldest data served | Horizon |
|---|---|---|
| Crash + performance (FPS, memory, CPU, PCU, session) | 2026-07-11 | **~30 days** |
| `ErrorCount` | 2026-06-15 | **~56 days** (a chunk boundary, so 56–84d) |
| Behavioural, retention, monetization, reach | 2026-03-23 (launch) | none found — full life |

**A game's technical history only exists for roughly the last month and is gone
forever after that.** Any technical question about a period more than ~30 days
before the grab is unanswerable — say so, rather than reading absence as health.
This corrects an earlier belief in this repo that a dead game's perf 400s were a
window-size problem; they were data ageing out. `[Observed]`

## Query window caps — the gateway 400s rather than truncating

| Class | Max window |
|---|---|
| Crash metrics (`ServerCrashCount`, `ClientCrashCount`, `ClientCrashRate15m`, `OomUnexpectedExits`) | **7 days** |
| Performance metrics, `ErrorCount`, `PotentialExtraEarningsTotalUsd` | **28 days** |
| `DailyCohortRetention` | **10 days** |
| Behavioural / monetization / reach | none observed |

Confirmed by the producer 2026-08-09 and visible in a 139-day grab that returned
38 behavioural metrics at full span while 400ing every one of the 19 perf/error
shapes that had worked on a 28-day window two days earlier. **The data still
exists across the whole span — it has to be asked for one legal window at a
time.** The grabber tiles them automatically; a 139-day plan becomes ~395
requests instead of ~143.

**Do not "solve" a 400 here by shortening the grab.** That silently produces a
game with no technical history, which reads exactly like a game that never
crashed. `[Observed]`

## Sub-daily clamping — the grabber cannot see today

`HALF_HOUR` and `ONE_HOUR` both stop at `{today}T00:00`, on every grab,
regardless of window length — a 28-day ask returns the same right edge as a
1-day ask. `ONE_MINUTE` (the live tile) is deliberately dropped from the plan
because replaying one over a 28-day window is meaningless.

**During a live incident the only route to the current day is a dashboard CSV
export**, which is cell-exact against our data (2026-08-20 17:00 = 7,265.229 in
both) and so can be mixed with grabbed history without reconciliation. Ask for
the export early rather than reasoning around the gap. `[Observed]`

Related: the gateway silently truncates long sub-daily windows — a 768-hour ask
returned 240 hours. **Absence outside the served span is "never served", not
zero.** An earlier zero-fill overreached here and read 12 hours of real revenue
(R$4,845) as R$0. `[Observed — G1]`

## Omitted zero rows

**The API omits zero rows entirely; a missing day is absent, not `0`.** The CSV
exports, by contrast, write explicit `0` rows — proven on the Robux-sources and
server-crash files. For counts, a missing day almost always means zero
(`ServerCrashCount` returned 10 days of a 27-day window). For rates a missing
day is genuinely unknown, and filling it is a fabrication. `[Observed]`

## Restatement — Roblox re-serves settled points with different values

Measured across 587 re-reads: **median divergence 0.0000%, p90 0.78%** — mostly
Roblox recomputing its averages. So a flag on every revision fires on every row
and carries no information; only material (>1%) divergence is worth logging.

**But the material ones are large and go both ways.** 3,092 → 747 (the dashboard
confirmed 3,092), and also 353 → 21,835, which looks like back-fill. Our policy
keeps the FIRST settled read. That is a defensible choice, not a proven-correct
one — it is recorded as an open question, and for anything labelled *Realtime* a
revision row should be read as "this hour is disputed" rather than as either
value being right. `[Observed — G4 / G5]`

Corollary for anyone switching data source: **Open Cloud serves the CURRENT
value while the corpus keeps the FIRST settled one.** Adopting it silently moves
published crash numbers. That is a decision, not an inheritance. `[Observed]`

## Partial points

A point whose interval had not elapsed when captured is `partial` and must be
excluded from every headline, delta and incident. This is what stopped
`ClientCrashCount` printing "▼85.6%" off a 7-hour day.

**The most common false alarm in this whole system arrives as an urgent message:
"we just dropped 50%".** On 2026-08-10 a grab captured at 07:39Z put PCU at
1,660 against 3,626 the day before. It was 7.6 hours of a day whose peak lands
at ~12:30Z; 134 rows in that grab carried `partial`. The last settled day was
flat against the week. `[Observed]`

## Timestamps

`ONE_DAY` points are stamped `T00:00:00Z` — all of them, verified across 5,571
points. (`data/README.md`'s claim of `08:00:00Z` is wrong.) Sub-daily series are
stamped at the interval boundary. Everything is UTC while the dashboard shows
local, so a one-hour event a user remembers as 19:00 is 17:00Z in CEST.
`[Observed]`

## Status flags

`DATA_STATUS_INVALID` is **99.5% of all points returned** — almost certainly the
protobuf zero-value ("unset"), NOT "estimated". Surfacing it as a per-row warning
produces a flag that fires on every row. The status that actually matters is
`DATA_STATUS_NOT_STATISTICALLY_SIGNIFICANT`: on 9610561918 it fires on exactly
one series (crash rate on Platform=TV, a tiny sample). Surface that one and
exclude it from conclusions. `[Observed]`

## Platform floors — "no data" usually means "too small"

Roblox gates analytics behind size thresholds. Below them charts are empty, and
**an empty chart reads exactly like a healthy one.** `[Official]`

| Feature | Floor |
|---|---|
| Dashboard KPIs at all | >10 DAU **and** 10 play hours, 7 consecutive days |
| Client/server performance charts | **100+ DAU** |
| Benchmarks (similar-experience or genre) | 100+ DAU |
| Insights | 100+ DAU |
| AI analytics reports | **1,000+ DAU** |
| Player-feedback reports | 20+ comments |

Before writing "no crash data, so the technical rung is clear" — check DAU
against 100. Combined with the ~30-day perf horizon there are now **two distinct
reasons a performance chart is blank, and neither is "nothing is wrong"**.

## The deploy log is unreliable, and everything dates off it

`develop.roblox.com`'s `saved-versions` call is **per-place, and a 500 on one
place drops it silently with no sign in the output file.**

- On 10030829154 the ROOT place returned 500, so `place-versions.md` read "373
  versions across 24 days", topped out at a sub-place's `v437`, and looked
  complete — while the root place was at `v1698`.
- Reproduced on 9610561918: the file topped out at **v3747, dated 10 May**, while
  the place open in Studio read **v3829**. Three months and ~80 versions stale,
  still reading as a finished file. It made "what shipped between 3 and 13 Aug"
  unanswerable while payer conversion halved.

**Every date-the-deploy test runs off this file.** Three fallbacks, all measured
to work:

1. `feedback.csv`'s `asset_version` column — group by version, take min/max date.
   Dated all six root publishes to the correct hour, and gives **downvote rate
   per version** free.
2. The error export's `First seen version` column — dates a deploy to the hour.
3. `ErrorCount` broken down by `PlaceVersion` via Open Cloud — 23 version series
   on 9963622286, each version's first data point dating its ship.

**Version first-seen dates are LEFT-CENSORED at the window edge.** On a 20-day
window, two versions both reported first-seen = the window's own start date;
they shipped earlier and were clipped. Only a version whose first point falls
strictly inside the window is genuinely dated — otherwise read it as "on or
before". Widen the window before quoting a ship date. `[Observed — F12]`

## Known-wrong derived files

`*.daily.csv` roll-ups sum/max `FILLED_ZERO` rows, so on 9963622286 both
`PeakConcurrentPlayers.daily.csv` and `ErrorCount.daily.csv` print **0 for
2026-08-14 — the day the update shipped** — while the genuine `ONE_DAY` series in
the same file says PCU 3,139.57 and 11.2M client errors. The same roll-up invents
a 2026-08-16 row on a day that had not happened. **Read the `ONE_DAY` rows
directly; treat every `*.daily.csv` as suspect.** `[Observed — F13, not yet fixed]`

And a rule that has cost an hour twice: **any script reading these CSVs must
filter on the `granularity` column.** One file holds ONE_MINUTE, HALF_HOUR and
ONE_DAY rows keyed by the same date; ignoring it lets a half-hour bucket
overwrite the daily value. That bug produced a fake "87% disagreement" on PCU and
a fake "fractional crash count" anomaly. `[Observed]`

## What is readable when — the table to check before writing any number

| Signal | Readable | Why |
|---|---|---|
| Script errors, crash counts | **immediately** | Event-stamped, no aggregation |
| Server errors per half hour | immediately | Half-hour buckets; the current one is `partial` |
| Concurrent players | immediately | But a publish restarts servers |
| Client crash **rate** | next day | Today's is a day-to-date average dominated by pre-update hours |
| DAU, revenue, session length, playtime | **next day** | Daily, UTC-bucketed |
| Downvote rate on the new version | next day | And only once players have voted |
| **D1 retention** | **2 days** | D+1 must finish, plus ~1 day of Roblox pipeline |
| D7 / D30 | 8 / 31 days | Same reason, longer cohort |
| Funnel completion by day | next day | `FunnelCohortCompletionRate`, daily per named step |

## Open Cloud vs the dashboard gateway

Roblox shipped a key-authenticated analytics READ API (beta). Measured on
9963622286: **71/71 metrics served**, granularities `None` / `OneMinute` /
`HalfHour` / `OneHour` / `OneDay` / `OneWeek` / `OneMonth`, and **717/726 cells
identical**. All 9 apparent differences were our own freeze policy, not a source
disagreement. `[Observed 2026-08-19 — F14]`

It replaces the metrics half only. Update annotations, genre benchmarks, the
place-versions deploy log and player reviews have no Open Cloud equivalent.

Two operational facts worth carrying: the `filter` operation enum accepts
`In` / `NotIn` / `GreaterThan` / `GreaterThanOrEqual` / `LessThan` and **`In` is
the equality operator**; and `PlaceVersion` requires Place as a **filter, not a
breakdown** — with `breakdown:["Place","PlaceVersion"]` the API answers 200 and
silently drops PlaceVersion, returning one series.

**A rate limit gets recorded as a metric that failed.** Pacing at exactly the
documented budget (30 POSTs/min = 2000ms) left no headroom and **39 of 135
requests came back HTTP 429** — each landing in the grab report as a failed
metric, indistinguishable from "this universe has no such data". 2200ms plus
retry-with-backoff took 51 failures to 5. **A 429 is never an answer about a
game.** `[Observed — F15]`

---

# PART B — DISCRIMINATION TESTS

> **Default provenance for this entire part is `[Our reading]`.** These are
> hypotheses that have survived a handful of tests on a handful of games at one
> studio. The *numbers* inside the worked examples are `[Observed]` and are
> reliable; the *inference drawn from them* is not established, has no external
> corroboration, and in several documented cases turned out to be wrong when a
> wider window was pulled. Where something here IS verified — an API behaviour, a
> cell-checked value — it is tagged individually.
>
> Read this part as "questions worth asking in this order", not as a diagnostic
> authority.

Not decision trees. For each pair of competing causes: the observation that
separates them, and the confound that makes the test lie. A hypothesis that
survives nothing is not a finding.

## B0 — Before any of them: pick the window, in this order

Two windows answer two different questions and mixing them is how a coincidence
becomes a finding.

| Window | Answers | Fails at |
|---|---|---|
| **~28 days** | *What changed, and when* — day-level resolution | No base rate. Every event looks causal because there is nothing to compare it to |
| **Full history** | *Is this event actually the story* — shape, cadence, how often this already happened | Smooths away the day a thing broke |

**Run full history FIRST.** If the recent move is unlike anything before it, it
is a real event — zoom to 28 days and find the day. If it looks like the previous
three, **do not explain the event; explain the pattern.** The cause is structural
and the "event" is its latest instance.

*Worked both ways, 2026-08-09.* Knife Farm was the pattern case and was
diagnosed as the event case — three collapses in four months, and only the last
one was explained. Become a Brainrot is genuinely an event case: it was climbing
to an all-time peak on 2026-06-28 and then turned, which resembles nothing
earlier in its life. `[Observed]`

**Do not let Roblox's storage limits choose your window.** Diagnosing off 28 days
because that is what the perf tab holds means the retention horizon picked your
analysis window.

## B1 — Discovery cut vs product break

| | |
|---|---|
| **Discriminating observation** | `ForwardD1Retention` (and session length) across the reach fall |
| **Discovery cut** | Reach ↓↓, **retention flat**, session flat, step change on one day, new users fall hardest |
| **Product break** | Reach flat at first, retention ↓, session ↓, starts at a publish, sustained |
| **Confound** | A login-reward quest running through the window inflates retention and can mask a product break |

**"Retention flat while reach collapses = discovery, not product" has carried
more diagnoses here than any other single contrast.** `[Our reading]` — and
being the heuristic we lean on hardest, it is the one whose failures we are
least likely to notice. It has never been tested against a case where we knew
the answer independently.

The corollary is the one people find counter-intuitive: **improving quality
metrics during a collapse is not a contradiction, it is a diagnosis.** Climb Up
Mountain died with retention, session length and paying conversion all *rising*
while QPTR halved (7.33% → 3.65%) and impressions fell 82% `[Observed]`. Our
explanation — the remaining players were the enthusiasts and there was nobody new
left to reach — is `[Our reading]` of one dead game. It is a plausible story
about a real pattern, not a demonstrated mechanism, and "do not fix the product
in that state" is advice we have never tested by trying the opposite.

## B2 — Within a reach fall: distribution withdrawn vs listing lost appeal

Read QPTR against impressions. Always as a pair — the pair is what carries the
information.

| Impressions | QPTR | Meaning | Lever |
|---|---|---|---|
| ↓ | flat | Roblox cut distribution; the listing still converts | Content cadence, re-qualify, paid — **not** QPTR work |
| flat | ↓ | The listing lost appeal | Thumbnail / title / icon A/B |
| ↓ | ↓ | Both — usually a demotion following an appeal drop | Fix appeal first, then re-qualify |

*The case behind the table:* Knife Farm's July cut ran impressions 3.09M → 1.16M
(−63%) while QPTR held at 3.37% → 3.29% `[Observed]`. "Distribution was withdrawn
and QPTR optimisation would not have restored it" is `[Our reading]` — nobody
tried QPTR optimisation, so the counterfactual is untested.

**Confound, and it is severe: CVR and impressions are inversely correlated
(r = −0.881).** A CVR rise during a reach collapse means fewer people were shown
the game, not that the listing improved. See the `EndToEndCVR` card.

**Second confound: which proxy.** `EndToEndCVR` and the home-surface ratio
(`DAU[HomeRecommendation] ÷ impressions[HomeRecommendation]`) do not always agree.
A claim that holds on only one is not a claim. A previous "−0.72%/week, steeper
than the dead game's final fortnight" reproduced on **neither**, and the figure
sat suspiciously close to the dead game's own slope — a number attached to the
wrong game. **Recompute a slope before quoting it, and state metric, window and
units every time**: "−0.72%/week" as percentage points and as percent-of-level
differ by more than 5×, and support opposite recommendations. `[Observed]`

## B3 — Acquisition problem vs retention problem

**Split DAU by `IsNewUser`. This is the fastest test there is and it kills the
most expensive wrong answer, "let's make the game more appealing to new
players".**

Knife Farm on 2026-08-07 was still taking **13,209 brand-new players a day, 36%
of DAU**, while D7 sat at 1.2% `[Observed]`. So new players were still arriving
in volume — that part is just the number. The step to "therefore the problem is
the return loop and creative work is wasted effort" is `[Our reading]`, and it
assumes the arriving players are the same *kind* of players, which we did not
check.

Read it against D1: **D1 healthy while D7 dies means they liked it and ran out of
game** — `[Our reading]`, and the interpretation that most needs someone who has
played the game to confirm it (see D3).

## B4 — Traffic-mix shift vs gameplay change

This is the test **Roblox shipped for exactly this purpose** (2025-10-16,
"View retention by acquisition source and select your benchmark set"), and it
belongs before any "the update hurt retention" conclusion. `[Official]`

Pull `ForwardD1Retention` broken down by `AcquisitionSource`:

- **Per-source flat, blend down → mix.** The fix is an acquisition conversation,
  not a design one.
- **One source dropped** → that source's audience or landing surface changed.
- **Every source dropped together** → now you may blame the build.

*Worked 2026-08-14 on 10030829154:* D1 fell 13–14% on Home, Search and Others and
**9% on Friends**, so the −2.0pp step survived the viral push ending and is a
product finding, not composition. `[Observed]`

Roblox states in the same announcement that **"running ads should not harm your
organic distribution"** — ads-acquired users are excluded from ranking signals, so
they neither help nor hurt. Producers routinely fear paid traffic poisons the
algorithm; say plainly that it does not. What it does is dilute blended averages,
which is a reporting problem, not a ranking one. `[Official]`

**The heavier alternative** is regressing the rate on returning share — but
**check the fit before controlling with it.** r = 0.718 on 9963622286 (93 days)
versus **r = 0.198** on 10030829154 (14 days). At that second strength the
"prediction" is just the fit window's mean, and calling the result mix-controlled
would be a lie. The `AcquisitionSource` split is cheaper, more direct, and needs
no baseline window. `[Observed]`

## B5 — Did the update do it? (the anchor case)

**A decline that starts before the update ships.** Four tests, in order:

1. **Date the publish to the minute** — and check the FULL deploy list. A report
   here once exonerated updates by citing Jul 20 while deploys on Jul 14 and
   Jul 17 existed. Cross-check `place-versions.csv` against `feedback.csv`'s
   `asset_version`, because the deploy log truncates silently (Part A2).
2. **Does the effect outlive the cause?** If X stopped and the metric kept
   falling, X is not the cause. *Become a Brainrot: crashes ended 2 Aug, DAU kept
   falling 492K → 277K through 5 Aug, so crashes were a confound and the 30 July
   deploy remained the answer.* `[Observed]`
3. **Does the pattern predate the cause you found?** The most dangerous
   explanation is a real, dated, external event that fits a short window. Knife
   Farm's July collapse was attributed to Roblox's 2026-06-15 algorithm change —
   documented, correctly dated, a clean fit across the 31 days held. Pulling 129
   days killed it: the game's **biggest** collapse ran 31 May to 12 June (−81%),
   before the change existed. **Always extend the window past the proposed cause.**
   `[Observed]`
4. **Rule out the publish signature.** Session duration and FPS dip in the
   publish hour and recover within ~2h; server errors spike 20–50× for under 24h;
   CCU dips as servers cycle. All four are the deploy, not the build. **Only a
   finding if still degraded 3h later (perf) or the next day (errors).**
   `[Observed]`

**If the decline genuinely predates the publish, the update can still be
contributory** — it can fail to arrest a decline it did not start, and on a
28-day RFY signal window a retention dip from *before* the ship is still feeding
the demotion that shows up after it. Say which claim you are making.

## B6 — Technical regression vs content weight vs neither

- **Split client from server.** Client FPS/memory/OOM degrading while
  `ServerFrameRateP10` sits flat = content weight crushing low-end devices, not a
  defect. The fix is an optimisation budget. `[Observed]`
- **If desktop fell more than phone, it is not a render regression.**
- **Rank by mechanism, not volume** — see the `ErrorCount` card. Read the call
  site before ranking anything.
- **Test a big error count against a rate before reporting it.** ~35M warnings
  cost nothing measurable in ARPDAU.
- **Establish blast radius before claiming impact.** Walk *up* from the error line
  to the enclosing connection or thread: a throw inside an event handler kills one
  invocation (find the statement it skipped — on `v587` an unguarded index skipped
  the `PromptProductPurchase:FireClient` 15 lines below it, **1,844 purchase
  prompts that never appeared**, invisible in every metric); a throw in the join
  thread kills everything after it for that player; a throw inside `task.spawn`
  kills only that thread **and escapes any enclosing `pcall`**. `[Observed]`
- **Check whether cash moves before or after the throw** — the same defect is a
  dead button or a theft depending on line order. Say which; producers hear
  "error" and assume the worst.

## B7 — Platform-side vs game-side

`annotations.md` → `ANNOTATION_TYPE_ENGINE_RELEASE` (RCC = server engine). Then
check whether an unrelated game moved the same way on the same days. *Both games
crashed 28 Jul–1 Aug after RCC v732.* **An engine release preceding a fault is an
association, never proof of a faulty release.** `[Observed]`

## B8 — Event contamination

**You do not have to ask anyone when an event ran.**
`ANNOTATION_TYPE_EXPERIENCE_EVENT_STATE` carries one row per event with
`eventName` and a `START`/`END` pair stamped to the second. On Knife Farm it dated
`ADMIN ABUSE` to `2026-08-15T17:00:25Z → 18:00:25Z`, **eliminating it as a cause**
for a break three days earlier, and printed the whole calendar back to June.

**Query a NARROW window to prove an event ended.** An absent END row in a
full-history grab is ambiguous (still running, or never captured); zero
EVENT_STATE rows in a tight 3-day window is evidence. `[Observed]`

An event **breaks per-player normalisation specifically**, because peak PCU is a
terrible denominator on a spike day — it is a max, not an average, so it
understates per-player rates in exactly the direction that reads as "improved".
What survives contamination: metrics that are already rates. What does not: every
volume, and every ratio built on one. Name the contaminated day, exclude it, give
the next clean date, and **record what the event was** — otherwise the spike
becomes an unexplained anomaly someone re-investigates in a fortnight. `[Observed]`

## B9 — Is the move real at all?

Six checks, in this order, before looking for any cause:

1. Is the latest point `partial`? (The 50%-drop false alarm.)
2. Is the comparison **same-weekday**? On 9963622286 PCU spiked 3–5× on **all
   five Saturdays** in the window — that is the game's rhythm.
3. What does the last **settled** full day say?
4. Is it the **diurnal curve**? These games fall −52% within one normal day
   (11,536 at 13:00Z → 5,550 at 20:30Z on 10399712766). Anyone checking at 7–9pm
   local sees a collapse that is not one.
5. Is it **growth confounding**? Use per-1k-DAU, never a raw volume delta.
6. Is it the **denominator**? Never call a step on a rate without looking at the
   numerator (the CVR retraction).

**Roblox audiences normally rise Fri–Sun. A weekend fall is anomalous; a weekend
rise is not a win.** `[Observed]`

## B10 — When every split says the same thing

Knife Farm's conversion fell on every platform (Phone 1.38→0.58, Computer
2.55→1.13, Tablet 1.84→0.79, Console 2.48→1.36), on both product types
(DevProduct and GamePass both −66%), with ARPPU flat. **That combination kills
mix, kills "one broken product", and kills "whales left" in one pass** — the cause
is global to the game. `[Observed]`

## B11 — Eliminating everything is a result

If the shape is a gradual decline and each named event lands before or after the
bulk of it, **say the cause is not identified and name the measurement that would
find it.** Inventing an attribution that fits the vibe is how a report loses its
warrant. `[Observed — this is a rule, learned by breaking it]`

---

# PART C — SOLUTIONS LIBRARY

> **This part is the weakest in the document and should be the first thing the
> deep research replaces.**
>
> A solutions library is supposed to answer "what did studios actually do, and
> did it work". We cannot answer that. **We have not run a single controlled
> experiment.** No A/B test, no holdout, no before/after with a comparison game.
> What is below is: Roblox's documented constraints on the levers (reliable,
> tagged `[Official]`), one studio's authored playbook targets (`[Indigo]` —
> teaching cases, not telemetry), and our own inferences about which lever fits
> which symptom (`[Our reading]` — untested).
>
> **Nothing here has a verified outcome attached.** The one apparent exception,
> C9, is a single incident where a fix coincided with a recovery; that is not the
> same as a demonstrated cause. Ask the research for outcomes with numbers,
> sources and dates, and prefer them over anything on this page.

A lever needs four things or it is not a lever: the mechanism, the expected
size, the timeline, and how it will be measured. If you cannot name all four,
say you are guessing.

## C0 — The structural map: which mechanic holds which day

For idle / simulator / brainrot-style games, the retention curve *appears* to map
onto game structure cleanly enough to suggest a missing mechanic from the numbers
alone. `[Our reading]`

**This table is the most speculative thing in the document and the most likely to
be quoted as fact.** It rests on a two-game comparison — same studio, same genre,
one with a rebirth ladder and one without — plus the general design logic that
makes it sound right. Two games is an anecdote. Treat it as a hypothesis to check
against the game in front of you, and ask the research whether anyone has
established these mappings properly.

| Mechanic | The day it holds | Absent ⇒ |
|---|---|---|
| Offline earnings, daily reward, streak | **D1 → D2** | D1 sags |
| Finite upgrade track | D2 → D5, then exhausted | D7 collapses once bought out |
| **Prestige / rebirth loop** | **D7 → D30** | D30 goes to ~0 |

*The two-game comparison it rests on, 2026-08-10.* Knife Farm has offline
earnings and daily rewards but no rebirth — only upgrades. Its curve: D1 17–20%,
D7 1.2%, D30 0.2% `[Observed]`. Become a Brainrot, same studio, has a rebirth
ladder and runs D7 ≈ 3% `[Observed]`. **Reading the absent mechanic off the curve
is the inference, and n = 2 games that differ in many other ways as well.**

**Content is not the same lever as structure.** A new world is consumed once and
buys one cycle — exactly the pattern Knife Farm ran three times since May, each
peak smaller. **A prestige loop regenerates the goal indefinitely from content
that already exists.** When both are on the table, ship the loop and use the
content as its reward.

## C1 — Diagnosis → lever → measurement

| Diagnosis | Lever | Measure it by |
|---|---|---|
| Reach cut, product healthy | Content update (resets the algorithm signal); thumbnail A/B; cross-network funnel; paid acquisition to rebuild top of funnel | Impressions and `RFYQualifiedPTR` within 1–2 weeks |
| Listing lost appeal | Thumbnail / title / icon A/B, weekly or bi-weekly | `EndToEndCVR` **and** impressions together |
| Hook broken | Fix the first-session experience; the onboarding funnel step that broke | `ForwardD1Retention`, session length |
| Return loop broken | The progression or economy gate blocking repeat play; add the missing structural mechanic from C0 | `ForwardD7Retention`, `DauMauStickiness` |
| Monetization gap | Close ARPDAU to the peer cohort; rebalance Passes vs Dev Products | `PayingUsersCVR`, ARPPU, `DailyRevenue` by `RevenueSource` |
| Technical | The specific defect, cited by file and line where code was read | Crash **rate**, never count |
| Audience exhaustion | Nothing product-side. New audience, or accept the curve | QPTR response to creative — if late thumbnail swaps do nothing, this is the diagnosis |

Always state **the measurement window and what to exclude**. If a platform event
contaminated days, say so, or the fix will look bigger than it was.

## C2 — Prefer the lever that ships without a republish

**The Configs API changes live balance without publishing** — item availability,
damage, cooldowns, UTC-scheduled releases. Scopes `universe:read` /
`universe:write`, callable from inside an experience via HttpService since
March 2026, propagation up to ~5 minutes, full version history. **Roblox names
rollback as an explicit use case: revert to a previous config version if metrics
spike negatively.** `[Official]`

A watch that detects a regression plus a config that undoes it without a
republish is the entire loop — **detection is only worth what the speed of the
fix makes it worth.** A config change is minutes and reversible; a build is a
deploy, a review, and a fresh set of `PlaceVersion` steps to disentangle from
every metric afterwards.

## C3 — Re-engagement: Experience Notifications

`POST https://apis.roblox.com/cloud/v2/users/{userId}/notifications` with
`source.universe`, `payload.message_id`, `type: "MOMENT"`. `[Official]`

Constraints that shape the design: **one per user per day per experience**;
recipients must be opted in and 13+; the experience needs 100+ visits; and the
message string must be pre-created in the Creator Dashboard — **there is no API
for the text**. Opt-in via `ExperienceNotificationService:PromptOptIn()`, which
will not re-show within 30 days.

**Delivery is not guaranteed and scales with engagement** — better-engaging
experiences get more of their notifications delivered. So notification reach is
itself a downstream health metric, not a fixed channel you can lean on to rescue
a game that is already losing engagement. Worked pattern from the field:
notifying offline users after two hours that idle earnings are ready to claim.

## C4 — Experience Events

Max 10 upcoming/ongoing; update announcements once per 3 days (60 chars); 7 days'
lead time for off-platform featuring; the "Trending Events" sort needs **1,000+
RSVPs**. `RSVPCount` is already in the grab plan, so **an event's pull is
measurable before it starts**. `[Official]`

## C5 — Cadence and creative, as levers

- **Content cadence resets the algorithm signal: updates every 2–3 weeks.**
  `[Indigo]`
- **Thumbnail A/B weekly or bi-weekly** is the other primary reach lever.
  `[Indigo]`
- **Post-peak decline of ~15–20% per month** is the general figure used at LARGE
  tier valuation. A decline matching it is expected, not a defect. `[Indigo]`
- **Escape is the only genre with a documented curve:** peaks at 6–8 weeks, then
  loses 60–70% of revenue in the following 2 weeks; extension to 4–5 months comes
  from cadence + thumbnails + cross-network funnel. `[Indigo]`
- **There is NO lifecycle curve for simulators**, and we checked whether one could
  be built from what we hold — it cannot; every universe in `data/games/` carried
  only 31–37 days of daily headline data at the time. **Do not apply the escape
  curve to a simulator and do not invent a substitute.** Say the expected curve is
  unknown and judge the decline on its own shape (step vs smooth). `[Observed]`

## C6 — QPTR as a lever, with the 2026-06-15 caveat

Indigo's canonical target is **above 3%**, and its scenario set calibrates the
ladder: <2% "very low" (the core opportunity), 2–3% below target and explicitly
caps the valuation, 3–5% at target, 8%+ strong (8% → 18% roughly doubles organic
traffic), 13–22% exceptional. Games at 13–22% run **$8–30 revenue per CCU per
month**; games under 5% run **$0.3–0.9**. `[Indigo]`

**But QPTR was removed from RFY ranking on 2026-06-15.** It remains a real health
signal — it is what the store listing does to a viewer — but it is no longer what
the recommender ranks on. **Say that plainly rather than selling QPTR work as
distribution work.** `[Official]`

What RFY ranks on now: play through rate; **first play bounce rate** (<60s and
61–180s); **play days per user across D1, D2–7, D8–28**; playtime per user
(capped 60 min/day/user). Secondary: intentional co-play days, qualified play
sessions, spend days, Robux per user. **Signals are per-user averages, not
totals**, so a small game with engaged users is not disadvantaged. `[Official]`

**The consequence that matters most: retention buys distribution, with a ~4-week
lag.** The signal window went from 7 days to 28 on 2026-06-15, so the change
reaches full effect about four weeks after rollout (~2026-07-13). A same-day
correlation between DAU and D1 is the WRONG test and reads ≈ 0 (measured −0.011
on 9963622286 over 130 days). The causal path is
retention → ranking → impressions → DAU. **Do not conclude "retention doesn't
matter here" from a flat contemporaneous correlation.** `[Observed + Official]`

## C7 — Sizing the prize, so a diagnosis becomes a business case

- **Robux → USD: × 0.0035** (the DevEx rate). `[Indigo]`
- **An owner's ask sits around 6× monthly revenue**; their private acceptable zone
  is roughly 4–8×. Indigo's target buy is 50–80% of that — about **3–4.8×
  monthly**. Below ~3× is a lowball that rarely closes. **Above the ask is not a
  win; the playbook models the owner reacting with suspicion.** `[Indigo]`

So a sustained change in monthly revenue moves asset value by roughly **6× that
change** at owner-ask.

*Worked — Become a Brainrot's July 30 break.* Daily revenue R$239,898 →
R$101,072. At ×30 days and the DevEx rate that is ~$25,200 → $10,600/month, a
**−$14,600/month** swing, worth roughly **$87,000 of asset value** at 6×
(≈$44k–$70k at the 3–4.8× buy band).

**"How much did we lose?" is a counterfactual, so the baseline dominates the
answer.** Same game, 19 settled days:

| Baseline | at 15%/mo decay | at 0% decay |
|---|---|---|
| Last 7d before the event | **$7,370** | $8,346 |
| 14d before | $11,261 | $12,430 |
| Peak week | $16,346 | $17,767 |

1. **Subtract expected decay.** ~15–20%/month post-peak is normal, so only the
   excess is a loss; the 0% column inflates by ~13%.
2. **Never baseline on the peak week** if the metric was already sliding — it more
   than doubles the figure and the case dies on inspection.
3. **A cumulative loss is usually the weaker number anyway.** The ongoing run-rate
   gap and the capitalised value argue better, because they describe what is still
   bleeding rather than what is already spent.

**And decompose before attributing.** Of Brainrot's drop, ~R$71,744/day traced to
a platform change (not the studio's doing), ~R$149,687/day to a forced model swap,
and ~R$103,555/day to a preventable deploy break. **Only the third is anyone's
fault, and only the third is worth a fix.** A blended "we lost $X" hides that and
invites the wrong response. `[Observed]`

## C8 — Keep the projection credible

**Believable without special justification:** QPTR improvement of 20–50%
(3.0% → 4.2%); CCU growth of 30–80% over 2–3 months with real services behind it;
revenue uplift tied to a specific change.

**Requires a named mechanism or do not say it:** anything beyond 2× those figures;
any projection needing 3–5× better performance than the game has ever shown;
"explode" / "skyrocket" / "massively"; any number without a timeline, a mechanism
and a comparable. `[Indigo]`

## C9 — The highest-value lever in the whole system is not analytical

**Become a Brainrot, and it is why the watch job exists.** v546 shipped 30 Jul
11:54 UTC. D1 retention went **16.8% → 9.72% the same day**. Two more deploys went
out (3 Aug, 4 Aug) without moving it, because nobody knew what to fix. The fix
landed **7 Aug 17:14 UTC — eight days later** — and moved `Rebirth1` +5.0pp in 24
hours. So the fix was cheap and available the whole time. Peak concurrents ran
~10,000 (29–31 Jul) and were at **1,607 on 12 Aug** (−84%). Revenue R$239,898 →
R$101,072/day. **The eight-day gap alone cost ~R$700k (~R$650k after normal decay,
≈ $2,275–2,450)**, and the reach damage ran weeks longer because Roblox ranks on a
28-day retention window.

**What is solid here and what is not.** The dates, the versions and every number
above are `[Observed]` off verified series. Everything else is `[Our reading]`:
that v546 caused the D1 fall, that the 7 Aug change was the fix, and that the
+5.0pp move 24 hours later was caused by it rather than coinciding with it. There
was no holdout and no rollback test. Two other deploys landed inside the window.
The cost figure is a counterfactual built on a chosen baseline, and the section
above on baselines shows that choice moving the answer by more than 2×.

The conclusion we draw from it — **a watch that catches a break on day 1 instead
of day 8 is worth more than any analysis performed on day 8** — does not actually
depend on the causal claim being right, which is the main reason we still believe
it.

The routine that captures it: **three grabs per update** — baseline before the
publish (the one people skip and the one that matters), an error check 2–3h after,
and the real read the next day — with the tripwires **pre-registered in the
baseline**, so the post-update read is a lookup rather than an argument.

## C10 — Fix classes that recur in the code

Worth grepping for directly, because each has produced a live defect here:

1. **The guard written then bypassed.** `FindFirstChild` allowed to return nil,
   then the nil passed straight into something that cannot take it. Or a safe
   default assigned and then overwritten by a lookup that can miss. Or a `pcall`
   that the real path `task.spawn`s out of. The author knew the hazard; the code
   just does not act on it.
2. **Check, yield, use.** `if player.Character then` … `task.wait(300)` … use it
   unchecked. Any yield invalidates the check; the longer the wait, the higher the
   count.
3. **New content shipped without the entry another system looks it up by.** The
   class that dominates content updates: on `v587`, four unrelated systems broke
   from one cause — the rarity table, the animation table, the model table and the
   trait multiplier each lacked an entry for newly added animals. **Report the
   class, not the four lines** — fixing the lines alone guarantees the same four on
   the next world. Ask for a publish-time check that fails when a new asset has no
   matching row in every table that indexes it.
4. **An unprotected iteration over a module registry.** Waterslide's `ServerInit`
   runs `for _, module in shared["Service"] do module.Update(dt) end` inside a
   Heartbeat with no protection. When one service threw on one player, **every
   service after it was skipped for that tick**, and the line clearing the dirty
   flag sat after the throw — so it repeated at 10 Hz for that player's whole
   session. One player's bad state becomes a partial server outage.
5. **Rate-limit warnings are a capacity finding, not a bug.** `502 … request rate
   exceeds the allowed maximum for the key` means a shared DataStore key is being
   hammered by every server. Count the stores the update added before blaming the
   code. `[Observed]`

---

# PART D — NEGATIVE SPACE

## D1 — What this data structurally cannot answer

- **"What is CCU right now."** Sub-daily windows clamp to the last settled 24h on
  every grab. Only a dashboard CSV export reaches today.
- **Any technical question about a period more than ~30 days ago.** It is gone,
  permanently. Absence is not health.
- **"Is this level bad?"** — see D3. Metrics date and rank changes; they do not
  tell you whether a number is bad.
- **Error message TEXT.** The `MessageHash` → text lookup 500s on these universes.
  Volumes without text; text comes from the Studio export only.
- **Anything on a game under the platform floors.** Below 100 DAU the performance
  charts are empty by policy.
- **Drop-off at an intermediate funnel step in a game that logs steps out of
  order** — back-filling makes it structurally invisible.
- **A retry loop inside a funnel** — a repeated step counts once.
- **Whether a version shipped before the window** — first-seen dates are
  left-censored at the window edge.

## D2 — The false-positive catalogue

Every one of these has produced a wrong finding here. They are the checklist.

| Looks like | Actually is | Ruled out by |
|---|---|---|
| "We dropped 50% today" | Today's `partial` point | Check `partial`; read the last settled day |
| "Still dipping this evening" | The diurnal curve (−52% within a normal day) | Same-clock-hour comparison |
| "CCU up 21.8%" during an incident | `PeakConcurrentPlayers` ONE_DAY summing platform peaks | Use HALF_HOUR / `ConcurrentPlayers` / the export |
| "The update spiked errors 20–50×" | The publish path | Is it still elevated the next day? |
| "Session length and FPS dropped at the publish" | Servers cycling; recovers in ~2h | Is it still degraded 3h later? |
| "Payer conversion broke" | The DAU denominator moved; payer count was flat | Matched-DAU comparison on the raw count |
| "Click-to-play up 17%, discovery is healthy" | Reach shrank; CVR is inversely correlated with impressions (r = −0.881) | Always quote CVR with impressions |
| "This funnel step is an immovable structural gate" | Two window aggregates agreeing while the daily series ran 24→48→35% | Plot it daily |
| "Retention fell, the build hurt it" | Traffic-mix shift | `ForwardD1Retention` by `AcquisitionSource` |
| "35M errors, the game is broken" | Guarded paths firing per-item per-frame; ARPDAU rose | Test the count against a rate |
| "The loudest error signature is the problem" | It was cosmetic; the 400×-smaller one killed the tutorial | Read the call site |
| "D1 is still dropping" | The last 1–2 points of every retention chart read low, always | Use the newest settled point |
| "D30 returns nothing, the metric is broken" | A 28-day window contains no ≥30-day-old cohort | Widen the window |
| "The deploy log says v437 is current" | The root place's call 500'd and was dropped silently | Cross-check `feedback.csv` `asset_version` |
| "Zero players and zero errors on launch day" | `*.daily.csv` rolling up `FILLED_ZERO` rows | Read the `ONE_DAY` rows |
| "87% of PCU values disagree between sources" | Not filtering the `granularity` column | Filter it |
| "39 metrics have no data for this game" | HTTP 429 recorded as failures | Pace at 2200ms; retry 429s |
| "The Open Cloud path ingests to zero" | A working tree 5 commits behind origin | `git fetch && git log HEAD..origin` **before** diagnosing a pipeline defect |
| "Retention improved during the quest" | The quest paid players to come back for 7 days | Grep the place for a login-reward module |
| "The algorithm change explains this collapse" | The bigger collapse predates the change | Extend the window past the proposed cause |

## D3 — The half of the job metrics cannot do

**Metrics date and rank changes. They cannot tell you whether a level is bad.**

Learned expensively on 2026-08-10: four separate claims about 9963622286 were
produced from correct readings of the code and the data, and all four were killed
within minutes by the producer, who had played the game.

| Claimed | Killed by |
|---|---|
| First rebirth is 6.58× too hard | The whole treadmill loop is gated behind the same flag, so the two ladders are denominated in currencies earned by different mechanics. "Flip the flag" would have disabled the core loop |
| A fresh player cannot train | The tutorial grants and equips it |
| The unchecked `pcall` load defect caused the D1 break | Error export: zero DataStore signatures |
| Backpack items are not saved | They are saved, three lines away |

**The pattern in every one: a level asserted as bad without knowing how the game
plays.** The half that does travel is the other one — the daily funnel dated a
tutorial replacement to 27–28 June off one step going 87% → 99.98% and staying,
later confirmed by the producer as a 26/27 June ship. **Nobody gets that from
playing.**

So: date it, rank it, quantify it, and hand the "is this bad" question to someone
who plays. **Never publish a level judgement that has not survived one.**
`[Observed]`

## D4 — Sources outside the analytics API that beat it

On 2026-08-10 these three beat every metric in the pipeline. `[Observed]`

- **Player comment text** (`Report_<epochMillis>.csv`, ~160/month on that title).
  It named the mechanism twice when the metrics could not — *"I get stuck at the
  very beginning"*, and on the break day itself *"its so hard to get speed and it
  takes too long"*, the only direct hint at what shipped in v546. **Read these
  before theorising about a cause.**
- **Error message text + `First seen version`**, which dates what a deploy
  introduced. **Capped at the top ~25 by count, so absence is never evidence** —
  and the counts understate whenever the message embeds a per-player value, since
  signatures are the message *text*. Treat any count on a userId-bearing message
  as a floor. When several signatures share a near-identical count, **treat the
  list as truncated and census the source of truth in Studio**: an export showing
  9 animals missing a rarity entry corresponded to **19** in the live place.
- **`feedback.csv`'s `asset_version`** — a second deploy log, and sometimes the
  only one for the root place. Gives downvote rate per version free.

**The two error instruments are not comparable and must never be mixed.** The
Studio export tallied ~335 events across all signatures in 24h on 10030829154
while the API counted 1.4–2.8M client script errors per day over the same period.
**Export counts are relative only** — they rank signatures and date them; they do
not count affected players.

## D5 — What we do not know

Listed because an absent row reads as an oversight.

- **Whether the freeze-first-read policy is correct.** The material divergences go
  both ways and our kept value is sometimes the low one. Open. `[Unknown]`
- **Whether the F18 impossible `ConcurrentPlayers` point self-corrects.** One
  observation, no re-read. `[Unknown]`
- **A lifecycle decline curve for simulators.** Does not exist in the playbook and
  cannot be built from what we hold. `[Unknown]`
- **Whether Indigo's QPTR is clicks or plays.** Every metric we hold counts plays;
  the definition says clicks. Levels shift, direction does not. Worth asking
  whoever runs QPTR optimisation. `[Unknown]`
- **Whether `UniqueUsersWithImpressions` breakdowns sum to the total.** Not
  verified; do not assume. `[Unknown]`
- **Multi-place Place-scoping.** The Open Cloud comparison ran on a single-place
  universe; a genuinely multi-place game is untested. `[Unknown]`
- **Roblox's exact aggregation for most rate metrics.** We know PCU's because it
  broke visibly. The others have not been stress-tested the same way. `[Unknown]`

---

# HOW TO USE THIS AGAINST THE DEEP-RESEARCH REPORT

**The division of labour is not symmetrical, and it matters which kind of claim
is in dispute.**

| Dispute is about | Who wins | Why |
|---|---|---|
| A metric's identity, unit, encoding, window cap, or how our files lie to us | **This file** | Cell-checked and reproducible. Research cannot see our pipeline |
| A number on one of our games | **This file** | It is a reading off a verified series |
| **Why a metric moved** | **The research**, usually | Our causal claims are n=1, one studio, no controls, and self-confirmed |
| A benchmark, threshold or "what good looks like" | **The research, if it has a primary source** — otherwise NEITHER | Our numbers are one genre cluster; the circulating figures are unsourced |
| A platform behaviour dated after our measurement | **The research** | Our measurement expired. Re-run it, do not delete it |

Three specific things to watch for when reading the research against this:

1. **Research says something we never measured.** Likely a real gap — pull it in,
   tagged with its source and date.
2. **Research asserts a benchmark with no primary source.** Treat as absent. The
   circulating "45–60% D1 for simulators" figures are the canonical example:
   unsourced SEO content, and Roblox publishes no retention benchmarks at all.
3. **Research contradicts one of our causal readings.** Assume the research is
   right until our reading can be re-tested on a wider window or a second studio.
   Our retraction rate on exactly this class of claim is not low.

**And the thing to actually chase:** a dated timeline of Roblox
discovery-algorithm and analytics changes. Every diagnosis in this file reaching
back more than a few weeks is exposed to a platform change we do not know about.
We hold exactly one such date (2026-06-15) and it has already invalidated one of
our own findings.
