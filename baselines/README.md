# Baselines

A **baseline** is a frozen "before" for one update on one game, plus the
tripwires that were written *before* anyone knew what happened. It exists so the
next session — or the next device — can do the follow-up check as a **lookup
rather than an argument**.

Kept at the top level on purpose: `data/` is gitignored except `raw/` and
`verify/`, and a baseline must travel. Nothing in here is regenerable, because
half of it is a judgement made at a specific moment.

## Naming

    baselines/<universeId>-<YYYY-MM-DD>-<shortname>.md

One file per update. Never edit the numbers in a baseline after the fact — that
is the entire point of freezing it. Append a `## Follow-up <date>` section
instead, so the original prediction and the outcome sit side by side.

## What a baseline must contain

1. **Header** — universe, version shipped, how the publish was dated and how
   confidently, which grab this is in the three-grab cadence, and the raw bundle
   path so the numbers are re-derivable.
2. **What this grab can and cannot answer**, per `update-watch`'s readability
   table. An absent measurement must never read as a clean bill of health.
3. **The pre-update table** — settled values only, each with the date it is as
   of, marked `rate` or `volume`.
4. **Pre-registered tripwires** — a threshold per signal, written now. If it is
   written after the follow-up grab it is not a tripwire, it is a rationalisation.
5. **Open questions for the studio** — anything needing someone who plays the
   game (`liveops-diagnosis` §5b).

## Using one on the follow-up

Read the tripwire table first and mark each row OK / WATCH / FIX / NO DATA.
Only then look for causes. If a threshold was wrong, say it was wrong — do not
quietly move it.

## Index

| Universe | Game | Update | Baseline | Follow-up due |
|---|---|---|---|---|
| 10030829154 | Waterslide | v1705 (probable), 2026-08-21 | [10030829154-2026-08-21-waterslide.md](10030829154-2026-08-21-waterslide.md) | 2026-08-22 |
| 10399712766 | +1 Banana Monkey | 2026-09-04 (grab 1, pre-publish) | [10399712766-2026-09-04-banana.md](10399712766-2026-09-04-banana.md) | 2026-09-05, D1 on 09-06 |
| 10638354731 | Seal A Driveway | 2026-09-04 (grab 1, pre-publish) | [10638354731-2026-09-04-seal.md](10638354731-2026-09-04-seal.md) | 2026-09-05, D1 on 09-06 |
| 9963622286 | Become a Brainrot | v608, 2026-09-04 12:17Z (grab 2) | [9963622286-2026-09-04-brainrot.md](9963622286-2026-09-04-brainrot.md) | 2026-09-05, D1 on 09-06 |
| 10565445771 | Verity Companion | 2026-09-04 (grab 1, pre-publish) | [10565445771-2026-09-04-verity.md](10565445771-2026-09-04-verity.md) | 2026-09-05, D1 on 09-06 |
| 10030829154 | Climb Waterslide | 2026-09-04 (grab 1, pre-publish) | [10030829154-2026-09-04-waterslide.md](10030829154-2026-09-04-waterslide.md) | 2026-09-05, D1 on 09-06 |

## The 2026-09-04 set

Five games updating the same day. Baseline day is **2026-09-03**, the last fully
settled day and pre-update on all five. Four are genuine grab 1 (pre-publish);
Brainrot had already shipped v608 at 12:17Z, so its file is grab 2 and says so.

Each metric carries its **position within that game's own full history**, not
just a 7-day mean — a value cannot be called abnormal without knowing what the
game normally does. Several were already extreme before the update: Seal's
first-play bounce sits at the 89th percentile of its own record and its
`EndToEndCVR` at its all-time low, both pre-existing and not attributable to
whatever ships today.

**Cross-game controls are unavailable today.** All five candidate controls are
themselves being treated, so a "the others didn't move" argument is not
available for this cohort.
