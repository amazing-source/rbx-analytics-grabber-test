# Seal A Driveway [RELEASE 🛢️] — `10638354731`

Baseline as at **2026-08-26**. Simulation. Group *Lunate Studios* (`261071327`).
Single place `120014184236770`. Born 2026-08-05, public **2026-08-12**.
Lifetime to date: 1.78M visits, 993,939 MAU, R$3,269,135 (~$11,442 at DevEx).

---

## The claim

**This game is healthy and still climbing — it set an all-time CCU high today —
and it monetizes at ~6× the rest of Indigo's portfolio. The two things worth
acting on are both invisible from the DAU chart:** a desktop-specific crash rate
that has quadrupled during the scale-up, and a revenue model that is 95.5% a
one-time toll.

Nothing here is on fire. This is the rare baseline written on a game while it is
still going up, which is the only time these are cheap to fix.

---

## Where it is right now

Every scale metric is at or near its all-time high.

| | 2026-08-25 | Note |
|---|---|---|
| DAU | **243,487** | all-time high, up every day since 08-18 |
| Peak concurrents | 5,284 | all-time high |
| Daily revenue | R$557,116 | ~$1,950/day ≈ **$58,500/month** |
| Session length | **17.13 min** | peak 21.61 (08-21) |
| Playtime per DAU | 22.19 min | |
| **ARPDAU** | **R$2.29** | peak R$3.57. For scale, Banana Monkey runs R$0.35 |
| ARPPU | R$182.60 | stable R$183–202 all window |
| Payer CVR | 1.25% | peak 1.89% — see the open question below |
| `EndToEndCVR` | 10.4% | in the playbook's "strong" band (8%+) |

Today (2026-08-26), matched half-hour slots 00:00–14:30 UTC against complete
prior days: **rank 1 of 14 — the highest day it has ever had**, +94% on its own
last 7 days, with every single slot up 550–1180% on the 13-day median.

**The ARPDAU is the headline number.** At R$2.29–3.57 this game earns 6–9× per
player what the existing portfolio does, on 17–21 minute sessions. That is not a
tuning difference; it is a different quality of game.

---

## Rung by rung

**Reach — strong and still being fed.** Impressions 2,140,285 (08-25) and rising.
`EndToEndCVR` 10.4%, holding 10–11% for a week. 76% of DAU arrives from
`HomeRecommendation`, so like everything else in the portfolio its distribution
is rented, not owned. `RFYQualifiedPTR` has fallen 0.0949 → 0.0196 as reach
widened — normal dilution of a qualification gate during a scale-up, and worth
watching rather than acting on.

**Hook — good, and improving as it scales.** D1 12.40% (08-24), and the
mix-vs-product test comes back clean: as `HomeRecommendation` DAU went 3,918 →
186,000 (**47×**), Home D1 fell only 15.31% → 12.90%, **−16%**. Friends and
Others actually *rose*. A game that holds its retention nearly flat through a 47×
reach expansion has genuine appeal, not a discovery accident.

**Return loop — the best D2 in the portfolio.**

| | D1 | **D2** | D3 | D5 | D7 |
|---|---|---|---|---|---|
| Seal | 12.40% | **6.56%** | 3.15% | 2.36% | 1.35% |
| hold vs prior day | — | **53%** | 48% | 85% | 80% |

53% D2 hold, against 43–49% on the four games Indigo already runs. That is what
the offline-earnings mechanic buys — the description's *AFK Yard* ("keep earning
while you're away"), daily rewards and quests are exactly the class the
retention table says holds D1→D2, and they are working.

**Where it lands with everyone else:** D7 1.35% and `RFYL7PlayDays` **1.32** —
the same structural ceiling as every other game in the portfolio (1.28–1.43),
well under the ~2.0 a promoted game needs. Strong D1→D2, then the same wall.
Do not promise a recovery that requires beating this.

**Money — high, and structurally one-shot.** See the two findings below.

**Technical — the one real defect.** See finding 1.

---

## Finding 1 — the crash rate is desktop-specific and has quadrupled

`ClientCrashRate15m` overall went 0.19% (08-13) → **0.53–0.61%** (08-22 onward).
Split by platform, it is not evenly spread:

| Platform | 08-13/14 | 08-25 | Move |
|---|---|---|---|
| **Computer** | 0.28% | **1.12%** | **4×** |
| Phone | 0.25% | 0.31% | +24% |
| Tablet | 0.07% | 0.20% | — (small base) |

Desktop now crashes at **3.6× the phone rate**. That direction is the diagnosis:
a render or memory regression hits *weak* devices hardest, so desktop failing
harder than phone rules it out. Client memory is flat at 18–21% (no leak) and
`ServerFrameRateP10` is 59.95 (server untouched). `ClientFpsP10` fell 54.7 → 47.3,
worst on Computer.

Supporting load: **~48 errors per DAU per day, 99.3% of them client-side** —
11.7M client errors on 08-25. For calibration, Become a Brainrot ran 110–130 per
DAU when it was considered broken and ~30 after it was fixed.

Rough size: at 81,305 desktop DAU, closing the desktop rate to the phone rate is
**≥659 fewer crashed sessions per day** (a floor — sessions outnumber DAU). Every
one is a lost session on the platform that converts best (desktop payer CVR
1.94% vs phone 0.83%).

**The error export now names a likely cause.** 85% of this game's entire error
volume is one signature — `ContextActionService could not find the function
passed in, doing nothing`, 10,468,796 events, first seen v488. A dead input
binding lands hardest on the platform that uses keyboard and gamepad input,
which is exactly where the crash rate quadrupled. See the error section below;
confirm with a code read at v901 before treating it as settled.

---

## Finding 2 — revenue is a one-time toll, not a loop

| Source | Share of lifetime revenue |
|---|---|
| **GamePass** | **95.5%** |
| DevProduct | 4.3% |
| PrivateServer / CommissionAvatar | 0.1% |

With ARPPU flat at ~R$183–202, this is one pass bought once. 82% of DAU is new
every day, so revenue is currently a direct function of **new-player inflow** and
almost nothing else. The day reach stops growing, revenue stops with it — and
`RFYL7PlayDays` at 1.32 says reach will stop growing.

For an idle/simulator this is the classic gap: repeatable DevProducts (currency
packs, boosts, rebirth accelerators) are what let a *retained* player keep
spending. At 4.3% that surface is effectively absent, and the game already has
the loop to hang it on — the description lists rebirths, four truck tiers and
five upgrade tracks.

This is upside, not a fault. Low ARPDAU alongside healthy CCU would be the
undertapped case; here ARPDAU is *already* high, which makes the missing
repeatable surface more valuable, not less.

---

## Funnels — 4 of them, and onboarding is genuinely good

**Corrected 2026-08-26.** An earlier version of this document said the funnel
rung was dark. It was not; the query was wrong (unpolled 202 + a `FunnelName`
filter that silently matches nothing — see `../README.md` and F22). The dashboard
carries **four funnels**: Onboarding, Progression, MapReach 2, MapReach.

**The Onboarding funnel, per the dashboard (by user, last 28 days):**

| # | Step | Users | Step completion | Churn |
|---|---|---|---|---|
| 1 | Started | 1,140,668 | 100% | 0% |
| 2 | ReachedDriveway | 1,119,615 | 98.15% | 1.85% |
| 3 | PouredOut | 1,098,645 | 98.13% | 1.87% |
| 4 | FirstPass | 1,069,852 | 97.38% | 2.62% |
| 5 | DrivewaySealed | 1,026,604 | 95.96% | 4.04% |
| 6 | **Complete** | 881,756 | **85.89%** | **14.11%** |

**Total conversion 77.30%**, and the only meaningful leak is the last step. For
scale, Climb Waterslide's tutorial ran ~50% overall with one step at 0.83. This
is a well-built onboarding and it is not where this game is losing anyone —
which usefully redirects effort away from the tutorial and toward the day-7 wall.

**The API's merged view disagrees, and that is the F22 caveat in action.**
Pulled with `breakdown:["FunnelStep"]`, steps come back as the union across all
four funnels keyed by index, so MapReach's much larger step 1 (`Neighbourhood`,
3,327,274 users) dilutes everything below it:

| # | Merged label | Users | Merged completion |
|---|---|---|---|
| 1 | Neighbourhood | 3,327,274 | 100% |
| 2 | ReachedDriveway | 2,217,629 | 66.65% |
| 3 | PouredOut | 1,413,041 | 63.72% |
| 4 | FirstPass | 1,312,485 | 92.88% |
| 5 | DrivewaySealed | 1,249,603 | 95.21% |
| 6 | Complete | 1,001,899 | 80.18% |

66.65% vs the dashboard's 98.15% for the same named step. **Never quote a merged
rate as one funnel's completion.** What the API *is* good for here is the daily
trend, and it shows every step drifting down as reach widens over the last seven
days — ReachedDriveway 70.3% → 63.9%, PouredOut 45.7% → 39.0%, Complete
50.2% → 42.7%. Consistent with dilution, not with a break.

## What the error export says

Filed at `data/exports/10638354731-seal-a-driveway/errors/`. 25 signatures,
12,257,089 events — and **one signature is 85% of them**.

1. **`ContextActionService could not find the function passed in, doing nothing.`
   — 10,468,796 events, Client, first seen v488.** An input binding pointing at a
   function that does not exist: the player presses something and *nothing
   happens*. That is functional, not cosmetic. It is also the leading candidate
   for **finding 1's desktop concentration** — `ContextActionService` is how
   keyboard and gamepad actions bind, so a dead binding lands hardest on the
   platform that uses them, which is exactly where the crash rate quadrupled.
   Stated as **likely, not confirmed**: the link needs a code read at v901.
2. **`Native code generation of script
   =ReplicatedStorage.DrivewaySealer.SurfaceGrid failed` — 3,650 events.**
   Small count, real consequence: the *core mechanic's* script cannot be natively
   compiled, so it runs interpreted. That is a direct, named explanation for
   `ClientFpsP10` falling 54.7 → 47.3 while the server sits at 59.95.
3. **`Failed to play animation. AnimationTrack limit of 64 tracks exceeded` —
   1,596,039 events.** Animations silently not playing; the 64-track ceiling
   means something is loading tracks without releasing them.
4. **`Player appears to be spamming remote events` — 42,801, Server, v884.**
   Recent and server-side. Either a real exploit surface or the game's own client
   over-firing a remote; worth knowing which before it becomes a capacity issue.
5. `[TruckServer] a rig was 5.15 studs into the ground -- lifted out` — 7,714.
   Self-healing placement bug, low priority, but it is the truck the player buys.

Not material, listed so nobody re-reports them: the mesh/PBR/sound asset-load
failures (~100k combined, all `Failed to load …: HttpError`) and the DataStore
queue warning — CDN flakiness and back-pressure, not defects in this build.

## Open question — conversion fell ~31% on 08-24, and I cannot yet call it

Payer CVR 1.82% (08-23) → 1.37% (08-24) → 1.25% (08-25), while DAU rose 17%.
The numerator moved too, so this is not a denominator artifact: **3,778 payers →
3,051**, −727 in absolute terms on 35,343 *more* players.

What that rules out, in one pass:

- **Not mix** — new/returning share flat at 83% → 82%; source mix flat (Home 77% both days).
- **Not one broken product** — GamePass and DevProduct fell proportionally.
- **Not whales leaving** — R$/payer flat at 190 → 191 → 183.
- **Not one platform** — Computer 2.79%→1.94%, Phone 1.19%→0.83%, Tablet 1.35%→1.03%. All ~−30% together.
- **Not a deploy** — last publish is **v901, first seen 2026-08-18**, still live on 08-26. *But note a config change needs no publish, so "no deploy" is weaker evidence here than usual.*

When every split says the same thing, the cause is global to the game. **Except
that the fall lands exactly on Monday 08-24 and Tuesday 08-25, and the three
highest days in the series are Fri 08-21, Sat 08-22 and Sun 08-23.** The game has
only one prior week at anything like this scale, and in that week it was still
ramping steeply, so a same-weekday comparison is not yet possible. The hourly
revenue series shows a gradual evening-over-evening decline, not a step at one
hour — which argues against a config flip at a moment.

**Verdict: unresolved. Do not act on it yet, and do not report it as a break.**

**The test:** read payer CVR on **Fri 2026-08-28 and Sat 2026-08-29**. Back to
~1.7–1.9% ⇒ it was the weekly shape and there is nothing here. Still ~1.25% ⇒ it
is a real step, and at that point the gap is worth roughly **$26–29k/month**
(counterfactual: 08-23 CVR applied to 08-25 DAU = 4,431 expected payers vs 3,051
actual; or 08-23 ARPDAU × 08-25 DAU, which agrees). I have quoted the range from
both methods rather than one, because the whole figure rests on a baseline that
may itself be a weekend peak.

---

## Confidence

**Confirmed:** all scale, retention, revenue and technical figures; the platform
crash split; the deploy dates (`ErrorCount` by `PlaceVersion`, first points
strictly inside the window); the 95.5% pass share.

**Likely:** that the desktop crash concentration is a defect rather than a
device-mix artifact. Desktop DAU share is stable at ~33%, which supports it, but
the error text would settle it.

**Unknown:** D30 (game is 21 days old) and whether the 08-24 conversion move is
real. Funnels and error text are now IN HAND — see the two sections above; the
earlier claim that they were unreachable was a query mistake, not a data gap.

**What would overturn the healthy verdict:** D1 by `AcquisitionSource` falling on
**Search** as well as Home. Search is the deliberate-intent cohort; while it
holds, appeal is intact.

---

## The action

1. **Export the error report** from the Creator Dashboard and file it. 48 errors
   per DAU with a 4× desktop crash rate is the one thing here that is actively
   costing sessions, and it is unreadable from the API by design.
2. **Read payer CVR on 08-28/08-29** before anyone acts on the conversion move.
3. **Add repeatable DevProducts** against the existing rebirth/upgrade ladders.
   Moving DevProduct share from 4.3% toward 15–20% on a game already at
   ARPDAU R$2.29 is a believable 20–50% revenue change with a named mechanism;
   measure on `DailyRevenue` by `RevenueSource` and ARPPU, 2 weeks after ship.
4. **Do not rebuild onboarding.** It converts at 77.30% with only the final step
   leaking (14.11%), which is the best in the portfolio. If anything is worth
   instrumenting it is the gap *after* Complete — the path from finishing the
   tutorial to the first rebirth, which no funnel currently covers.
5. **No badges exist on this universe at all** (`badges.roblox.com` returns an
   empty list). Badges are a cheap, visible progression hook and a Roblox
   surface; their complete absence on a game with rebirths is an easy miss.

## Watch list

Not scheduled — this game is not in `data/dashboard-config.json`, so nothing is
grabbing it and no alerting covers it.

| Read | When | Why |
|---|---|---|
| Payer CVR, ARPDAU | **2026-08-28/29** | Settles the conversion question |
| `ClientCrashRate15m` by `Platform` | weekly | Desktop is the one to watch; phone is fine |
| D1 by `AcquisitionSource` (Search) | weekly | Early warning that appeal, not just reach, has turned |
| `DailyCohortRetention` D2 | weekly | 53% is the asset here — protect it through updates |
| `RFYL7PlayDays` | weekly | 1.32 is the ceiling on how far reach can go |
