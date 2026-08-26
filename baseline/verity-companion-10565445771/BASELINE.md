# Verity Companion [AI] — `10565445771`

Baseline as at **2026-08-26**. Adventure / Story. Group *buzzword games* (`405191853`).
Single place `74542317333958`. Born 2026-07-25, public **2026-08-04**.
Lifetime to date: 18.4M visits, 7.47M MAU, R$5,795,318 (~$20,284 at DevEx).

---

## The claim

**Reach turned on 2026-08-23 after the hook and the return loop had been decaying
since 2026-08-13. This is a viral story title past its peak, not a broken one.**
No deploy in the window, no technical fault, and the highest-intent traffic
cohort never degraded at all.

The number that matters most is not the fall — it is **D2 hold of 35%**, the
worst of any game Indigo measures. Verity converts an unusually good first
session into almost no second one.

---

## Where it is right now

| | Peak | 2026-08-25 | Move |
|---|---|---|---|
| DAU | **1,281,398** (08-23) | 681,316 | **−46.8%** |
| Daily revenue | R$609,239 (08-21) | R$264,932 | −56.5% |
| Impressions | 14,609,314 (08-23) | 9,224,616 | −36.9% |
| Paying users | 9,803 (08-23) | 4,645 | −52.6% |
| ARPDAU | R$1.61 (08-13) | R$0.3889 | −75.8% |

Today (2026-08-26), on matched half-hour slots 00:00–14:30 UTC against complete
prior days — the only comparison that does not measure a part-day against whole
ones:

- **−49.6% vs its own last 7 days**, −29.2% vs 14 days, rank 11 of 22.
- The per-slot deficit **deepens monotonically through the day**: −24% at 00:00,
  −31% at 12:00, −38% at 14:30. A defect costs the same share in every slot;
  a deficit that widens as the day runs is a decline still in progress.

Run-rate gap from the 08-21 peak: **~$36,150/month**, ~$217k capitalised at the
6× owner-ask multiple. Two caveats, both material: ×30 on single days is a
simplification, and some of this fall is the unwind of a spike that was never a
sustainable level.

---

## The mechanism, in order

1. **Roblox scaled it, hard.** HomeRecommendation impressions went **266,428
   (08-13) → 12,522,663 (08-23) — 47×** in ten days. Home is 73% of DAU; this
   game is almost entirely algorithm-fed.
2. **Retention diluted as the marginal viewer got less interested.** Blended D1
   fell 24.76% (08-13) → 12.23% (08-23).
3. **But only on the pushed cohorts.** D1 by acquisition source, 08-13 → 08-24:

   | Source | 08-13 | 08-24 | Move |
   |---|---|---|---|
   | HomeRecommendation | 27.99% | 14.86% | **−47%** |
   | Friends | 19.82% | 12.00% | −39% |
   | Others | 19.15% | 12.09% | −37% |
   | **Search** | **19.94%** | **19.06%** | **−4%** |

   Search — people who typed the name — **did not degrade**. Three algorithmic
   cohorts fell 37–47% while the deliberate one held flat. That is the signature
   of reach outrunning appeal, and it is the single strongest evidence against a
   build problem: a broken build degrades the searchers too.
4. **The ranking gate then collapsed.** `RFYQualifiedPTR` 0.0399 (08-08) →
   0.0092 (08-24), **−77%**. Impression→play conversion (`EndToEndCVR`) fell
   14.37% → 6.67% over the same stretch.
5. **Roblox withdrew reach from 08-23** — impressions −36.9% in two days — and
   DAU followed within a day.

Both impressions *and* conversion are now falling together, which per the
playbook means a demotion following an appeal drop: **appeal first, then
re-qualify.** Reach work alone will not hold.

---

## What was ruled out, and by what test

| Candidate | Killed by |
|---|---|
| **A bad deploy** | Last publish is **v664, first seen 2026-08-17**, still the live version on 08-26 — **nine days with no ship**, dated from `ErrorCount` by `PlaceVersion` (Roblox's independent second source; first point strictly inside the window, so genuinely dated, not left-censored). The turn on 08-23 has no deploy anywhere near it. *Caveat: a version emitting zero errors would be invisible here — implausible at 680K DAU, but it is how the instrument works.* |
| **A technical fault** | `ClientCrashRate15m` **flat at 0.21–0.32% across the entire 47× scale-up**; `ServerFrameRateP10` 59.94 (target 60); client memory 21%; errors **~2.9–3.7 per DAU and falling**. Rung 5 is clean — a genuine rule-out, not an absence of data. |
| **A platform-wide event** | *(the one cross-game test used here)* Seal A Driveway, same platform, same days, **grew +8% on 08-24 and +8% on 08-25**. 24 Aug was not something that happened to everyone. |
| **Traffic-mix artifact only** | Rejected in the other direction too: if it were purely mix, per-source rates would be flat. Three of four sources fell 37–47%. Mix explains *why the blend fell faster than any source*; it does not explain the sources themselves. |
| **Content exhaustion alone** | Would predict retention flat-or-improving while reach fell (§2). Retention fell first, from 08-13, while reach was still climbing. |

---

## The structural constraint — read this before planning anything

`DailyCohortRetention`, 8 cohort days:

| | D1 | **D2** | D3 | D5 | D7 | D8 |
|---|---|---|---|---|---|---|
| Verity | 14.23% | **4.91%** | 2.55% | 1.85% | 1.89% | 1.80% |
| hold vs prior day | — | **35%** | 52% | 66% | 101% | 95% |

**Only 35% of day-1 returners come back on day 2** — against 43–49% on the four
games Indigo already runs, which was already the studio-level weak spot. Past D2
the curve is *fine* (66%, 101%, 95%): whoever survives day 2 is genuinely stuck
to it. The entire loss is one cliff, one day wide.

That is exactly what the genre predicts. Verity is a story you finish:

- Session length **8.17 min and falling** (peak 10.20), and the session-length
  distribution **truncates at 18 minutes** — there is no long tail.
- Public badge data: `WELCOME!` is awarded to 100% of players; the ending badges
  `RETURN TO SENDER` and `THAT'S EVERYTHING` sit at **9.1% and 9.2%**. About one
  player in eleven reaches an ending, and that ratio is stable day-over-day, so
  it is a design level and not a regression.
- `RFYL7PlayDays` **1.38** against the ~2.0 a promoted game needs. The first six
  days sum to ~25pp; the bar is ~100pp.
- The description states a **40-message cap** — a hard per-session ceiling, which
  is consistent with both the 18-minute truncation and the D2 cliff.

There is no offline-earnings / daily-reward / streak mechanic — precisely the
class the retention table says holds D1→D2, and precisely the day Verity loses.

---

## Funnels — 9 of them, and they name the failure

**Corrected 2026-08-26.** An earlier version of this document said funnels were
unreadable. They were not; the query was wrong (unpolled 202 + a `FunnelName`
filter that silently matches nothing — see `../README.md` and F22). The
dashboard carries **nine funnels**: Conversation, Onboarding, Session, FollowMe,
Messages, MessagePack, EndingOthers, Notebook, Ending.

Step completion and churn, whole life, merged across funnels by step index:

| # | Step | Users | Step completion | Churn |
|---|---|---|---|---|
| 1 | Submitted | 84,749,451 | 100% | 0% |
| 2 | Accepted | 73,418,992 | 86.63% | 13.37% |
| 3 | Delivered | 58,588,133 | 79.80% | 20.20% |
| 4 | **First Reply Received** | 15,318,870 | **26.15%** | **73.85%** |
| 5 | Day 2 Reached | 9,107,671 | 59.45% | 40.55% |
| 6 | Day 3 Reached | 6,405,862 | 70.33% | 29.67% |
| 7 | Day 4 Reached | 4,944,595 | 77.19% | 22.81% |
| 8 | Day 5 Reached | 3,931,910 | 79.52% | 20.48% |
| 9 | Ending Completed | 1,839,575 | 46.79% | 53.21% |

**Read the merged rates as a blend, not as one funnel's** — with no working
`FunnelName` filter the API sums across all nine by index. The *names*, the
*volumes* and the *daily trends* are sound.

Two things fall straight out:

- **Steps 5–8 are a day-by-day retention ladder, and it is decaying fast.**
  Daily `FunnelCohortCompletionRate`, last seven days: Day 4 Reached
  **67.2% → 55.5%**, Day 5 Reached **53.0% → 39.8%**, Ending Completed
  **22.9% → 14.3%**. That is the D2 cliff of the section above, visible a second
  independent way, and getting worse through the dilution.
- **`Delivered` is flat at ~68–70%** across the same days, so the conversation
  mechanic itself is not degrading — the *coming back* is.

## What the error export says — and it names the core-loop failure

Filed at `data/exports/10565445771-verity-companion/errors/`. 25 signatures,
1,394,626 events. Three are material; the rest are asset-load and cosmetic.

1. **`Generated dialogue was rejected by filtering for <Player>` — 512,734
   events, Server, first seen v446.** This is *the core loop failing*: the AI
   composed a reply and Roblox's text filter blocked it, so the player asked
   Verity something and got nothing back. It is by far the largest non-cosmetic
   signature in the game, and it is the most plausible mechanism behind the
   **73.85% churn at `First Reply Received`**. A player whose very first message
   returns silence has been shown the product failing.
2. **`Monetize:PromptProductPurchase() called with prompt in progress,
   aborting` — 13,912 events.** A purchase prompt that never appears is revenue
   lost outright, and this is the same class of defect that cost 1,844 prompts
   on Become a Brainrot. Small next to (1), but it is money.
3. **`cannot resume non-suspended coroutine` at
   `ReplicatedStorage.Packages.Packet:316` — 12,570 events, first seen v609.**
   A networking-library bug introduced by a specific deploy; worth a look
   because it is in the transport every feature rides on.

Not material, listed so nobody re-reports them: `AnimationTrack limit of 64
exceeded` (332,195), TopbarPlus version notices, `[DayMusicClient]` soundtrack
warnings, and the sound/mesh/PBR asset-load failures — all cosmetic or
self-healing.

## Monetization

64% GamePass / 36% DevProduct — a healthier mix than a pure-pass game, since
DevProducts are repeatable. But every rate is falling with the dilution:

| | Peak | 08-25 |
|---|---|---|
| Payer CVR | 1.82% (08-13) | 0.68% |
| ARPPU | R$106.86 (08-08) | R$57.04 |
| ARPDAU | R$1.61 (08-13) | R$0.3889 |

**Open question, and it is Verity-specific: this is the only game in the
portfolio with a variable cost per player.** The description says the AI is paid
for per use ("*AI costs money to run, so unlimited free messages may not always
be possible*"). Revenue per DAU is R$0.39 ≈ **$0.00136 per player per day**. If
inference costs more than that per player, the game loses money as it grows, and
every DAU number in this document reads the opposite way. **Nobody has told us
the unit cost — ask before recommending any growth spend.** I have deliberately
not modelled it rather than guess.

---

## Confidence

**Confirmed** (measured, cell-level): every figure above; the deploy dates; the
crash-rate rule-out; the per-source D1 split; the cohort curve.

**Likely** (consistent with the pattern, not independently proven): that the
reach withdrawal on 08-23 is *caused by* the retention decay rather than
coincident with it. The documented RFY mechanism runs on a 28-day signal window,
which implies a slower lag than the ~10 days seen here.

**Unknown:** D30 (game is 32 days old) and the AI unit cost. Funnels and error
text are now IN HAND — see the two sections above; the earlier claim that they
were unreachable was a query mistake, not a data gap.

**What would overturn this:** impressions recovering to 12M+ with no product
change, which would make 08-23 an algorithmic reshuffle rather than a demotion.
Read `UniqueUsersWithImpressions` and `RFYQualifiedPTR` on **2026-08-29**.

---

## The action

Ranked by expected size. The decline is not patchable — there is no defect to
fix — so every lever here is a design one.

1. **Build a reason to open it tomorrow.** Target `DailyCohortRetention`
   `CohortDay: 2`, currently 4.91% / 35% hold. The class of lever the retention
   table names for this exact day is a daily reset — a new daily message
   allowance, a daily scenario, a streak. Getting D2 hold from 35% to the 48%
   the rest of the portfolio manages is a ~20–50% improvement on one step, which
   is inside the believable band. Read it 2 days after ship, mix-controlled.
2. **Instrument a first-session funnel (8–12 steps) before any content
   decision.** Right now the *only* completion signal is a public badge. Nothing
   can be diagnosed at step level until this exists.
3. **Do not spend on reach yet.** Impressions and conversion are falling
   together; the playbook's own table says fix appeal first, and reach bought at
   6.67% conversion into a 35% D2 hold leaks straight back out.
4. **Get the AI unit cost from the studio**, and re-read the monetization section
   against it.
5. **Fix the filtered-dialogue path** (512,734 events). Options are a retry with
   a re-composed reply, or a graceful in-character fallback line so the player
   never sees silence. Measure on step 4 churn, currently 73.85%.
   Then pull the **player-comment report**, which is the one export still
   missing — comments named the mechanism twice on Brainrot when metrics could not.

## Watch list

Not scheduled — this game is not in `data/dashboard-config.json`, so nothing is
grabbing it and no alerting covers it. Decide that deliberately.

| Read | When | Why |
|---|---|---|
| `UniqueUsersWithImpressions`, `RFYQualifiedPTR` | 2026-08-29 | Settles demotion vs reshuffle |
| `DailyCohortRetention` D2 | 2 days after any ship | The one number the fix targets |
| `ForwardD1Retention` by `AcquisitionSource` | weekly | Search flat = appeal intact; Search falling = a real product problem |
| `ClientCrashRate15m` | weekly | Currently the clean rule-out; keep it that way |
