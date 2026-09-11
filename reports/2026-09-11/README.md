# LiveOps diagnosis — 2026-09-03/04 → 2026-09-11

D+7 read on the updates that shipped **09-03 and 09-04**. The publishes of
**09-10 and 09-11 are deliberately out of scope** — that is the separate baseline
thread. Verity's **09-08** publish (daily rewards + group rewards) is included as
a **partial** read only: two days of data, one of them the publish day.

| Game | Doc | Update in window | Dated by |
|---|---|---|---|
| Become a Brainrot | [brainrot.md](brainrot.md) | v608, 09-04 12:17 | place-versions (no event annotation) |
| Climb Waterslide and Slide | [waterslide.md](waterslide.md) | `NEW UPDATE` 09-03 18:00 | event annotation; sub-place publishes 09-04 |
| +1 Banana Monkey Destruction | [monkey.md](monkey.md) | v1246 + `NEW UPDATE - AURAS`, 09-04 17:35/18:00 | both, 25 min apart |
| Verity Companion [AI] | [verity.md](verity.md) | v684 09-04, v688 09-06, **v689 09-08** | place-versions + event annotation |
| Seal A Driveway | [seal.md](seal.md) | v914, 09-04 20:22 | place-versions + event annotation |
| My Knife Farm | **out of scope** | `NEW GAMEMODE` 09-03 18:00; v3852 09-03 16:29 | — |

## The frame: these are five slices of one decay curve

Every game in the pack is descending from its **own** peak, and the peaks are
staggered. **The declines in this window predate every update in it.**

| Game | Peak | Peak DAU | 2026-09-09 |
|---|---|---|---|
| Brainrot | 2026-07-25 | 776,393 | **10–12% of peak, and no longer falling** |
| Waterslide | 2026-08-02 | 688,061 | 11% |
| Banana Monkey | 2026-08-05 | 975,727 | **5%** |
| Verity | 2026-08-23 | 1,281,398 | 19% |
| Seal | 2026-08-28 | 533,776 | 11% |

Brainrot reached ~9–12% and **flattened**; the others are still descending toward
that level and Monkey is already through it. So the right question for this window
was never "why is it declining" — it is **"did anything change on top of the
decline"**, which is what each document answers.

## What moved, matched weekday

Before = **08-29 → 09-02**, after = **09-05 → 09-09**. Both spans are
Sat·Sun·Mon·Tue·Wed, five days each, so the weekly shape divides out instead of
being averaged away. All days settled; no partials.

| Game | DAU | Impressions | Impr→play CVR | D1 | Session | ARPU | Shape |
|---|---|---|---|---|---|---|---|
| **Brainrot** | −4.4% | −2.9% | −3.3% | **+19.7%** | **+4.3%** | −12.2% | **improved** |
| **Waterslide** | −34.4% | −18.1% | −20.9% | −7.1% | −0.4% | −17.2% | conversion |
| **Monkey** | −71.2% | −59.0% | −32.5% | **−19.9%** | **−10.3%** | −6.3% | **regression** |
| **Verity** | −23.4% | **−4.4%** | **−25.8%** | −6.5% | +2.5% | **+24.7%** | conversion |
| **Seal** | −68.6% | −51.2% | −39.0% | **−3.5%** | +0.7% | +14.5% | distribution |

Read the **rate** columns, not the volumes — a volume delta across a shrinking
audience is not like-for-like.

## What each update did, in one line

- **Brainrot / v608** (new morphs · Exotic limited brainrot · reworked lucky block ·
  **new-players-only quest track, 4-day timer**) — the only game to improve against
  its own trajectory.
  D1 up on *every* acquisition source including `Friends`, so it is the game and
  not the traffic. **But the first movement is 09-03, a day before the publish**,
  so v608 cannot be given clean credit.
- **Waterslide / 09-03** (**Raft Ascension**, a cosmetic 200-Win sink · Autumn
  Harvest Egg at the same price and odds) — barely moved the game either way. In-game rates flat;
  the loss is conversion. One funnel step (`Tutorial_Main_5_ToRaftShop`) lost 2pp
  and everything downstream carries it.
- **Monkey / v1246** (new map, visuals only · **Aura system**: six rarities, cash and
  Robux crates, dust from duplicates) — the only game that fell **below** its own already
  −8%/day decline, on all fourteen metrics tested. Engagement broke on the publish
  day; reach followed two days later. Bounce +21.7%. **The v1246 error export has
  been run: 659 of 600,812 events, 0.11% — no defect visible.** That is the fourth
  converging negative (creative, mix, performance, errors), so the remaining
  candidates are non-throwing content changes and the next step is playing it, not
  querying it.
- **Verity / v684** (alternative endings, **best-friends ending DELAYED** · paid
  **personality/skin shop**, first free after 50 messages) — reach held (−4.4%) while
  conversion fell (−25.8%).
  Monetization went hard the other way: **revenue flat on 23% fewer players**.
  **v689 (daily + group rewards) is not assessed** — first clean read ~09-15.
- **Seal / v914** (**mobile UI rework** · **tutorial rework**: clearer arrows, Quick
  Upgrades highlight, vehicle hint at 250K · rebirth UI · refill teleport **PAUSED**)
  — first session measurably better (six funnel steps up, bounce
  −12.1%) while distribution collapsed and the **return** loop fell
  (D2–7 play days −19.0%).

## Method, and where it failed

Departure from each game's **own** pre-publish decay trend (log-linear fit, 
Saturdays excluded) is the instrument for "what moved first" — a level baseline is
useless on a decaying series, because every metric reads as departed on day one.

**That instrument works for Brainrot, Waterslide and Monkey only.** Verity peaked
08-23 and Seal 08-28, leaving 8 and 4 non-Saturday days respectively between peak
and publish. Fits that short collapse the residual scale and returned implausible
z-scores (Seal: 127, 38, 26). **Those are not reported.** Both games are carried on
the fit-free matched-weekday comparison instead, and neither document makes a
trend-relative claim.

## Splits from the Explore engine (added 2026-09-11)

The corpus does not hold new-vs-returning or per-platform retention. The
dashboard's **Explore** tab does, through `analytics-query-gateway/v1/dag/execute`,
and 13 breakdown dimensions were tested and reconciled on DailyActiveUsers:
`IsNewUser`, `Platform`, `AgeGroupV2`, `Gender`, `Country` (229), `Locale` (51),
`AcquisitionSource`, and six `UserSegmentation*` dimensions — all within 0.6% of
the unbroken-down total. Files: [split-isnewuser.md](split-isnewuser.md),
[split-platform-age.md](split-platform-age.md). Tool: `web/scripts/explore-split.ts`.

**New vs returning changes two readings:**

| Game | New DAU | Returning DAU | |
|---|---|---|---|
| **Brainrot** | **+7.1%** | −6.6% | **acquiring again** — the floor reading |
| Waterslide | −37.4% | −26.9% | |
| Monkey | **−78.0%** | −60.0% | both collapsing |
| **Verity** | **−30.9%** | **−8.9%** | loss is new users; base holds |
| Seal | −74.5% | −54.9% | |

**D1 by platform rules a hypothesis out on Monkey.** Computer −28.8% and Console
−34.1% against Phone −18.0%: a render or performance regression hits **weak**
devices hardest, so this is not one. Brainrot's D1 rose on every platform
(+13% to +21%); Seal's held on every platform.

**`TopAcquisitionSources` is a UI alias and returns nothing** — `AcquisitionSource`
is the real dimension.

## Open / blocked

- **Update specs are now filed** at [`data/updates/`](../../data/updates/) — supplied
  by Ren 2026-09-11, one file per game, with the rules for reading them (a dated
  block can be unshipped; a dated block can also ship EARLY, as Verity's v689 did).
  Every doc now names what its build contained.
- **Knife Farm is out of scope** — Ren, 2026-09-11: *"knife farm has been dead for a fortnight, i dont think it rly matters tbh"*. It was re-grabbed anyway (it had no data past 09-02, being `dailyGrab: false`), so its corpus is current through 09-09 and `knife-farm-measurements.md` holds the numbers if it is ever wanted. **No diagnosis was written and none of its figures are interpreted here.** One factual note kept because it would otherwise mislead a later reader: its 08-29 DAU spike to 45,666 is an `ADMIN ABUSE` hour plus a five-hour `x5 LUCK EVENT`, not demand.
- `RFYD2To7PlayDays` fell on **all five** games (−1.4% to −19.0%). A signal moving
  the same way on five unrelated universes is a candidate for a platform or
  telemetry effect and should not be read as five findings.
- Engine **RCC 737 (09-01)** and **RCC 738 (09-08, 09-09)** both sit inside the
  window on every game.
- **Standing defects on Monkey, neither from v1246:** `AnimationTrack limit of 64
  tracks exceeded` at ~20,771/day (animations silently stop on a punching game),
  and `EditableImage is not accessible` at 2,472, which names its own one-toggle fix.
