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
