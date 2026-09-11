# Seal A Driveway — 10638354731 — update specs

Supplied by Ren 2026-09-11. See [README.md](README.md) for how to read these.

| Spec header | Shipped as | Evidence |
|---|---|---|
| Update 10.09 | **yesterday — OUT OF SCOPE**. A live **v915** was observed today by a `PlaceVersion` dimension query | |
| Update 04.09 | **v914, 2026-09-04 20:22 UTC** | `NEW UPDATE` event annotation 09-04 18:00 |
| Update 28.08 | v908, 2026-08-28 21:36 | baselined in `baseline/2026-08-28T2130Z-…` |

v911 (09-03), v912 and v913 (09-04) all carry `is_published = false` — not live.

---

## Update 10.09  — YESTERDAY, out of scope

1) **BUGS** — FPS, airport driveway, mobile UI again. **Rewriting core part of the
   AI code**
2) Invite friend bonus — if an invited friend joins, +15% cash boost on work earnings;
   Friend boost shown on the top or bottom bar
3) Reward for liking the game and joining the group — 50k cash + 1 use instant refill
4) Change sealer colour — separate Colors icon, UI like the squeegee skins menu;
   4 new colours, 2 for cash (100k, 500k) and 2 for Robux (29R, 49R)

> The airport driveway fix here is the **coverage blocker** already established on
> this game (server discards finished roads below 0.93 coverage). `seal.md` records
> `Airport` at 0.2% and `ParkingGarage` at 0.0% completion in the 09-03→09-11 window,
> i.e. before this fix.

## Update 04.09  — v914

1) **Mobile UI rework** — UI on mobile needs to be scaled properly, lots of complaints
2) Squeegee skins — add VFX on each one starting from Rare
3) Bugs — performance + QoL
4) **Rebirth UI rework** — make rewards and multipliers look more valuable and noticeable
5) Refill teleport — **PAUSED** (not live)
6) **Tutorial rework**
   1. Tutorial navigation — after the pouring step, guide the player to the Refill
      Station then to Upgrades; the arrows are not visible enough, make them clearer
      and guide directly to the stands
   2. Tutorial ending — "The map is yours." + an arrow guiding the player out
   3. Quick Upgrades — highlight the button once with an exclamation mark as soon as
      the player can afford an upgrade; red dots on affordable upgrades
   4. Vehicles — at 250K show "You can buy a Sealcoat Rig!" then an arrow to the
      vehicle shop and the cheapest vehicle

> The tutorial rework is the most likely origin of the **six funnel steps that
> improved** in `seal.md` (`Complete` +6.0pp, `FirstUpgrade` +4.6pp, `FirstPass`
> +3.4pp, `DrivewaySealed` +2.3pp, `FirstTruck` +1.9pp, `PouredOut` +1.5pp).
> Association, not proof — no A/B ran.

## Update 28.08  — v908

1) Skip rebirth button — saves all progress, 79R
2) Instant coat offer — appealing offer on the main screen for the existing product
3) D7 rework — Unlock All 119R; D3 keeps cash + one-time Brush Steel skin; D7 gives
   1 free use of Instant Coat
4) **Cash packs** — 25k/19R, 100k/29R, 500k/129R, 2.5M/399R, 10M/699R
5) Cash redirect — when the player lacks cash, redirect to the cash shop section
