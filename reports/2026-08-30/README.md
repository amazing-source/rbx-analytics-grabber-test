# Reports — 2026-08-30

Post-update watch on four games that all shipped 2026-08-28, plus a LiveOps
diagnosis of Verity and Seal. **Not committed on purpose** (see bottom).

Grab: browser path, 2026-08-30 18:54–19:21 UTC, window 2026-07-28 → 2026-08-31.

## Documents

| File | Published artifact |
|---|---|
| `post-update-watch.html` | https://claude.ai/code/artifact/2a921639-b25e-4d97-9b57-f58ca823ad2f |
| `liveops-diagnosis.html` | https://claude.ai/code/artifact/de41f470-2824-4522-bc47-26aad5045cb0 |

Open the `.html` files directly in a browser — they are self-contained apart
from the Google Fonts link.

## Publish log (from `place-versions.csv`, `is_published: true`)

| Game | Universe | Version | Published UTC |
|---|---|---|---|
| Become a Brainrot | 9963622286 | v607 | 08-28 15:21 |
| Verity Companion | 10565445771 | v679 | 08-28 19:53 |
| Waterslide | 10030829154 | v1716 (root) | 08-28 21:02 |
| Seal A Driveway | 10638354731 | v908 | 08-28 21:36 |

Seal's v909/v910 (08-29 02:32 / 03:51) are `is_published: false` — saves, not
publishes. The public games API `updated` field shows v910 and would date the
publish six hours late.

## Headline findings

**Post-update:** no publish broke anything measurable. Nothing on 08-29 exceeds
2 sd against its own weekday baseline on either game with enough history to
score. 08-28 was a Friday and 08-29 a Saturday, so the raw "everything rose"
is seasonality.

**Verity** — revenue −53% from its 08-21 peak. D1 fell on *every* acquisition
source (Home 28.0%→12.5%, Friends 19.8%→11.3%, Others 19.2%→11.3%, Search held
19.9%→17.4%) while home-recommendation share stayed flat at 70–78%, so this is
product, not traffic mix. Impressions were withdrawn 14.6M → 5.7M (−61%)
between 08-23 and 08-27. D7 is 1.1–1.9%; `DauMauStickiness` 0.240 → 0.055.

**Seal** — best revenue day on record (R$810,220 on 08-29) with every rate
metric falling since 08-20/21: ARPDAU 3.57→1.94, payCVR 0.019→0.012, session
21.6→15.0 min, D1 15.7%→11.2% and falling on every source. Returning cohort is
compounding (997 → 104,103 daily returners), which Verity's never did.

**Monetisation breaks, both pre-dating the update:**
- Verity `MessagePack` prompt-open: 92.86% (08-06) → 24.51% (08-07) → 3.24%
  (08-08), flat since. Candidate deploys that day: v556 (live by 16:35 UTC),
  v584/v586 (21:16 / 21:45 UTC). Date certain, version probable.
- Verity `Notebook` prompt-open 3.24% → 1.24% over the month, and purchase-of-
  opened 14.68% → 7.62%. Compounded, pitch→purchase fell 0.48% → 0.09%.

**Ranking context (Roblox, 2026-06-15):** RFY signal window went 7 → 28 days;
QPTR removed from ranking, replaced by play-through and first-play bounce rate.
`RFYL7PlayDays` reads 1.28 (Verity) and 1.32 (Seal) — one or two sessions per
player per week, the ceiling every reach gain is multiplied by.

## A retracted claim, kept as a warning

An earlier draft said D1 below ~12.5% triggers a next-day traffic cut. The
association is real across all five games (median next-day home-rec change
−19.7% vs +3.3%) but it is **not a mechanism**: D1 does not settle for two
days, and on Verity and Seal the low-D1 days *were* their biggest traffic days
(same-day r = −0.44 and −0.69), so a surge depresses D1 and then mean-reverts.
The 28-day RFY window means withdrawal reflects weeks, not one day. Use the
per-source D1 split instead — that is the test that actually discriminates.

## Contents

```
post-update-watch.html     four-game post-update report
liveops-diagnosis.html     Verity + Seal diagnosis and fixes
analysis/daily-metrics.csv 145 rows, 5 games, 2026-08-01 onward, one row per
                           game-day with every series used in both documents
analysis/lib.py            CSV loader. Filters granularity and partial rows and
                           resolves the headline series — see the note below
analysis/funnel_trend.py   Open Cloud query+poll helper. Funnels are served only
                           at NONE granularity, so day-level funnel trends come
                           from re-querying successive narrow windows
error-exports/             the four dashboard CSVs, renamed to their universes
                           (mapped by 100% version overlap against each grab's
                           discovered PlaceVersion set)
```

**`lib.py` exists because of two traps.** One CSV holds ONE_MINUTE, HALF_HOUR
and ONE_DAY rows keyed by the same date, so anything reading these files must
filter the `granularity` column. And the headline is the unbroken-down series —
`Total`, or a bare `Place=` filter for Place-scoped metrics — never `series[0]`.
Falling back across series is what made an OOM figure read 0 → 36 → 50 when the
real series was 344 → 400 → … → 179; that was the Tablet slice.

## Not committed

Deliberate, per request. Nothing here is staged. `data/` is gitignored except
`raw/` and `verify/`, and the scheduler's auto-commit stages only `data/raw`
and `data/dashboard-config.json` (`web/src/lib/auto-commit.ts`), so this folder
cannot be swept in by a scheduled grab. It *would* be caught by a manual
`git add -A`.

## Open items

- Re-grab 2026-08-31: D1 for the 08-29 cohort settles, giving the first real
  read on whether these updates held anyone, and a second settled day lets the
  weekday scorer compare Saturday to Saturday.
- The dev server was left running with `RBX_SCHEDULER=off`, so Banana Monkey's
  hourly grab is paused until it restarts without that flag.
- Perf and crash history age out at ~30 days, error history at ~56. Anything
  not captured before late September is gone permanently.
