# Baseline — 2026-08-26

Full-life LiveOps diagnosis of the two games handed to Indigo on 2026-08-26.
This folder is the **reference point**: every later claim about either game is
measured against what is written here.

| Game | Universe | Born | Public launch | State on 2026-08-26 |
|---|---|---|---|---|
| [Verity Companion \[AI\]](verity-companion-10565445771/BASELINE.md) | `10565445771` | 2026-07-25 | **2026-08-04** | **Past peak, in active decline** — CCU −49.6% vs its own last 7 days |
| [Seal A Driveway](seal-a-driveway-10638354731/BASELINE.md) | `10638354731` | 2026-08-05 | **2026-08-12** | **At its all-time high today** — CCU rank 1 of 14 |

They are different genres (Adventure/Story vs Simulation) with different
playbooks, and are diagnosed independently. The only place one is used to
explain the other is a single discrimination test, flagged where it appears.

## Published reports

Both diagnoses are also published as pages, for handing to a producer:

- **Verity Companion** — <https://claude.ai/code/artifact/9195610a-0284-46d0-a0fb-6d6f8726b3b1>
- **Seal A Driveway** — <https://claude.ai/code/artifact/66d91d26-7fa6-46f3-a9ae-6651fe889fc7>

Sources are `report.html` in each game's folder; republish from those paths to
update in place and keep the URLs.

## How this was measured

Open Cloud analytics API, full life for each game, pulled 2026-08-26 14:00–15:00 UTC.
Both games' full lifetimes fall inside every Roblox retention horizon, so —
unusually — the technical rung is complete from birth rather than truncated.

- Verity: window `2026-07-25 → 2026-08-27`, 198 requests, 107 metrics with data.
- Seal: window `2026-08-05 → 2026-08-27`, 159 requests, 95 metrics with data.
- Both are **single-place universes**, so the F12 sub-place truncation trap does
  not apply and the `Place` filter is unambiguous.

`series/headline-daily.csv` in each folder holds the settled daily points, with
`ONE_DAY` rows only, `FILLED_ZERO` dropped and `partial` dropped — so every row
is quotable as-is. The full corpus is in `data/games/<universe>/` as usual.

## What is NOT in this baseline, and why

State these limits before quoting anything as complete.

1. ~~Funnels~~ — **RESOLVED, and the earlier entry here was wrong.** Both games
   have full Funnels pages: **9 funnels on Verity**, **4 on Seal**. The failure
   was mine, twice over: funnel queries answer **HTTP 202 async** and my probes
   never polled, and I sent a **`FunnelName` filter, which is accepted and
   returns 0 series always** — even for a name read straight off the dashboard.
   The working shape is `breakdown:["FunnelStep"]`, no `FunnelName` filter, with
   polling. Full recipe in the `liveops-diagnosis` skill; F22 in `COVERAGE.md`.
   **One caveat survives:** without a working `FunnelName` filter the steps come
   back merged across funnels by index, so a merged completion rate is a blend
   and must never be quoted as a single funnel's (Seal: merged 66.65% against the
   dashboard's Onboarding 98.15%). Names, volumes and daily trends are sound.
2. ~~Error message TEXT~~ — **RESOLVED.** Both exports were downloaded on
   2026-08-26 and filed to `data/exports/<id>-<slug>/errors/`. They changed both
   diagnoses: Seal's single largest signature is a dead `ContextActionService`
   binding at 10.5M events (85% of its whole error volume), and Verity's is
   `Generated dialogue was rejected by filtering` at 512,734 — its core loop
   failing. The API still serves no text; these came from the dashboard.
3. **Annotations, genre benchmarks, player reviews, and the `develop.roblox.com`
   deploy log** are not served by Open Cloud (39 requests skipped and reported per
   game). `saved-versions` additionally returns 401 without a session cookie.
   The deploy dates below come instead from `ErrorCount` by `PlaceVersion`, which
   is key-authenticated — Roblox's own independent second source.
4. **D30 is not meaningful yet.** Verity is 32 days old and Seal 21; neither has
   a settled D30 cohort. Treat D30 as unknown, not as zero.
5. **The last one or two retention points always read low** (~2-day settle), and
   2026-08-26 is a partial day everywhere. Neither is a decline.

## A grabber defect this exposed, now fixed

For a universe whose dashboard was never opened, `perfSpecs()` and
`halfHourSpecs()` returned `[]` because no places had been discovered — so the
**entire technical rung plus `PeakConcurrentPlayers` were never requested at
all.** Not failed, not skipped: absent, and therefore absent from the grab
report too, which reads exactly like a game that never crashed.

Measured here: Verity's first grab issued 71 requests with zero perf shapes among
them. Places do not need the browser-only discovery phase — `develop.roblox.com/v1/universes/{id}/places`
is an unauthenticated GET, and is already the deploy log's source. `lastDiscovered()`
in `web/src/lib/opencloud-run.ts` now fetches it, preferring any place list
already in the corpus. Plan size went **107 → 198 requests** on Verity, and the
technical rung in this baseline is a direct result.

Gates after the change, measured not copied: `npm test` 44/44 · `npm run audit-plan`
140 templates, 0 failures · `npm run verify` 23 pass / 2 fail / 8 skip (both fails
documented and held).

## Refreshing this baseline

```bash
cd web && npm run dev                       # required: the grab runs in the app
curl -X POST localhost:3000/api/grab-opencloud \
  -H 'content-type: application/json' \
  -d '{"universe":"10565445771","start":"2026-07-29T00:00:00Z","end":"<tomorrow>T00:00:00Z"}'
npm run ccu-baseline -- 10565445771 10638354731
```

`endTime` must be **tomorrow 00:00 UTC** to include today, and no later —
`PeakConcurrentPlayers` fabricates a carried-forward row beyond that. Verity's
perf start must be **within 28 days**; asking earlier 400s the whole perf family
(that is what cost 27 requests on the first pass, and the API names the floor in
its error).

Neither game is in `data/dashboard-config.json` yet, so nothing is scheduled and
no alerting covers them. That is a deliberate hand-off, not an oversight — see
each game's *Watch list*.
