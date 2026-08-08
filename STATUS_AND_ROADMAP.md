# Indigo LiveOps Analytics — Status, Contribution & Roadmap

*Companion doc to the demo video. Explains what the tool is for, what already works,
what was done to make its numbers trustworthy, and the proposed "raw data export for
AI" feature. Grounded in the current codebase — file paths are cited so anything here
can be checked.*

> **Updated 2026-08-08.** The accuracy section of this document used to be a list of
> intentions. It is now a list of results: a full correctness overhaul landed, and
> the tool's output is checked against Roblox's own CSV exports on every change.
> Both production games have been re-grabbed with the fixed pipeline —
> **Knife Farm** (`9610561918`) and **Become a Brainrot** (`9963622286`).
> See `CORRECTNESS_PLAN.md` and `data/verify/COVERAGE.md` for the evidence.

---

## 1. The goal (why this exists)

Roblox's Creator Dashboard shows a producer everything about their game — but one
metric at a time, one CSV export at a time, with no memory of what changed between
updates. For a LiveOps studio like Indigo that ships frequent updates and lives or
dies on **post-update decisions**, that workflow is too slow and too manual.

The tool exists to turn the dashboard into a **decision instrument**:

1. **Pull everything in one shot** for an owned game and a date range, instead of
   exporting each chart by hand.
2. **Tag updates** on the timeline (name + date, later: changelog/items/prices).
3. **Compare before/after** an update — and do it *correctly*, distinguishing
   metrics that are safe to compare from ones that are confounded by growth.
4. **Diagnose** the result in a producer-ready format (Phase 3, AI).

The north-star use case is a **post-update LiveOps diagnosis**: did this update move
the hook (D1 retention), the return loop (D7/D30, stickiness), or the money
(conversion, ARPPU, ARPDAU) — and is it above or below the genre benchmark?
(See `CAHIER_DES_CHARGES.md` §1, §9 and `CLAUDE.md`.)

### Who it's for
Indigo producers. v1 is internal, multi-producer: each producer installs the thin
extension; everyone shares one web app. No public distribution, owned games only.

### Non-negotiable security posture
- **Never** reads, stores, logs, or transmits `.ROBLOSECURITY` or any auth cookie.
- The extension only **observes** requests the dashboard already makes; in the
  active mode it replays the *same* request shapes inside the user's already-authed
  session. It never asks for a cookie.
- Owned games only. Anthropic API key (Phase 3) stays server-side.

---

## 2. Architecture at a glance

Two deliberately separated parts (`CAHIER_DES_CHARGES.md` §2):

```
  create.roblox.com (authed tab)                 localhost / web app
  ┌───────────────────────────────┐              ┌────────────────────────────┐
  │  Extension "grabber" (MV3)     │   captures   │  Next.js + Supabase "brain"│
  │                                │  ──────────► │                            │
  │  interceptor.js  (MAIN world)  │   /api/ingest│  parse → normalize → store │
  │   • clones the Request body    │              │  charts, deltas, benchmarks│
  │   • replays grab-plan requests │  grab-plan   │  update tagging            │
  │  collector.js    (ISOLATED)    │  ◄────────── │  (Phase 2+: compare, AI)   │
  │   • UI panel, send/download    │              │                            │
  └───────────────────────────────┘              └────────────────────────────┘
```

The extension is intentionally dumb: **capture + forward only**. All value lives in
the web app.

---

## 3. What works today (Phase 1)

### 3.1 Extension — two capture modes
- **Passive capture** — as you browse the dashboard, `interceptor.js` (MAIN world)
  wraps `fetch`/XHR and, critically, **clones `args[0]` when it's a `Request`** to
  read the request body. That body carries the metric *name* — which the response
  does not (the response only has a hash). This is what makes name↔hash mapping
  automatic and durable (`CAHIER_DES_CHARGES.md` §3.5, §5.1). **"Send captured"**
  ships whatever rendered to `/api/ingest`.
- **Active grab** — **"Pull all metrics → web app"** asks `/api/grab-plan` for the
  request templates harvested from past captures, replays each one in the authed
  session (`collector.js` → `runActiveGrab`, concurrency 3), and forwards results.
  One click pulls the whole known metric set for a `universeId` without clicking
  through tabs.
- Utility: download raw capture JSON (↓), clear buffer (×), configurable ingest URL.

### 3.2 Ingest pipeline (`web/src/lib/parse-captures.ts`, `store.ts`)
Pure, unit-testable parser turns raw captures into normalized rows:
- **Metric snapshots** — one row per `(game, metric, granularity, series, ts)`.
  Breakdowns (`breakdownValue[]`) and request filters are folded into a
  deterministic `series_key`, so retention-by-Platform, revenue-by-source, and
  funnel-by-step never overwrite each other or the Total series.
- **Name↔hash catalog** — rebuilt on every ingest from the request body. No static
  hash table is ever shipped.
- **Benchmarks** — genre p50/p90 series.
- **Freshness** — `latestAvailableTime` per metric (from `metrics/metadata`).
- **Grab templates** — universe-independent request shapes for the active grabber.
- De-dupe + last-write-wins on re-capture; chunked upserts to Supabase.

### 3.3 Storage (`web/supabase/schema.sql`)
Seven tables: `games`, `metric_catalog`, `metric_snapshots`, `benchmarks`,
`metric_freshness`, `grab_templates`, `updates`. Cascade deletes off `games`.

### 3.4 Web dashboard (`web/src/app/page.tsx`)
- Game selector; **category tabs** (Engagement / Retention / Monetization / Funnel)
  with live counts.
- **Metric tiles** — latest value (unit-formatted), a week-over-week delta chip
  colored by whether the move is *good* for that metric, and a sparkline.
- **Detail chart** (Recharts) — multi-series with per-breakdown toggles, genre
  benchmark overlay (dashed p50/p90), and **update markers** as vertical reference
  lines across the timeline.
- **Freshness** — "Fresh through <date>" and an "estimated (unvalidated)" flag when
  points carry `DATA_STATUS_INVALID`.
- **Rate vs volume legibility** — every metric is tagged `rate` or `volume`, and the
  UI explains in-line that rate metrics are comparable across a growth window while
  volume metrics should be read as a trend, not compared raw.
- **Update tagging** — inline form drops a marker (title + date) on every chart.

### 3.5 Metric legibility layer (`web/src/lib/metric-info.ts`)
This is "which metric is for what," in one place: plain-language **label**,
**category**, **unit**, **kind (rate/volume)**, **higherIsBetter**, and a one-line
**blurb** per metric — plus unit-aware formatting (percent, Robux, minutes, hours,
count). This is what turns raw metric IDs into something a producer can read.

---

## 4. How it contributes

- **Speed:** a full pull replaces dozens of manual CSV exports — minutes → one click.
- **Correct comparisons:** the rate/volume split (`CAHIER_DES_CHARGES.md` §5.2) stops
  the classic false win — *"revenue +300% after the update"* when the game simply
  grew. Producers see the honest signal.
- **Context on every number:** genre benchmarks and freshness mean a value is read
  against "good for this genre" and "is this data even mature yet," not in a vacuum.
- **Institutional memory:** tagged updates on the timeline make "what did v1.4 do to
  D1?" answerable months later.
- **Foundation for AI diagnosis:** once the data is normalized, self-describing, and
  accurate, feeding it to Claude for a producer-format post-mortem (Phase 3) is a
  small step — *if* the accuracy work below is done first.

---

## 5. Accuracy — what was wrong, and what was done

This was the area flagged for the showcase: **better accuracy on the metrics and
what they're for**. An audit on 2026-08-08 found the pipeline's mechanics were sound
(dedupe, series identity, UTC dates) but its *interpretation* was not — and that some
printed numbers were simply wrong in ways indistinguishable from real findings.

The worst case: `ServerCrashCount` had no series literally labelled "Total", so the
summary fell back to the first series it found — an `OutOfMemory` slice — and
reported **5 server crashes** on a day the game had **30,393**. The incident detector
read the same wrong series and stayed silent.

All seven remediation phases have landed. The original gap list, with outcomes:

| # | Gap | Status |
|---|-----|--------|
| 1 | **Delta is index-based, not date-based** | **Closed for the file mirror.** Headlines now compare settled points only and print the real span when it isn't ~7 days. The web-app tile path (`store.ts`) still uses the index and is unchanged — it reads from Supabase, which is offline. |
| 2 | **Volume deltas shown raw** | **Closed.** Every volume row in `summary.md` carries a per-1,000-DAU value and the DAU delta over the same span. |
| 3 | **Maturity not enforced** | **Closed.** A point whose interval hadn't elapsed when captured is flagged `partial` and excluded from headlines, deltas and incidents. |
| 4 | **Estimated points blended in** | **Closed — and it was backwards.** `DATA_STATUS_INVALID` is the protobuf zero-value, not "estimated"; it fired on 56 of 56 rows and carried no information. The status that matters, `NOT_STATISTICALLY_SIGNIFICANT`, was being ignored and is now surfaced and excluded from conclusions. |
| 5 | **Metric catalog completeness** | **Partially closed.** Units are now validated against plausibility ranges on every export. Unmapped metrics still fall to `Other`. |
| 6 | **No benchmark verdict** | **Closed, with a correction.** Verdicts now name the cohort they compared against — these universes are served *similarity* benchmarks with an empty genre, so "above genre median" would have been false precision. |
| 7 | **Unit semantics are implicit** | **Closed at the storage layer.** A "Session time" export is in minutes while the metric is in seconds; that class of trap is now handled explicitly and tested. The self-describing export manifest (§6) is still to build. |

### 5.1 The verification layer (new)

Accuracy claims are only worth what checks them. Three commands, all offline:

| Command | What it proves |
|---|---|
| `npm run verify` | Diffs every stored cell against Roblox's own CSV exports. Fails on a value mismatch **or** a cell missing from a window we hold. |
| `npm run audit-plan` | Every query shape is tagged `observed` / `proven` / `inferred` and checked against the capture corpus. A non-optional guess fails the build. |
| `npm test` | 30 regression tests over real captured data. Each was verified to **fail** against the original buggy code, not merely pass against the fixed code. |

That layer immediately earned its keep. When both games were re-grabbed, it caught
four defects in the *fixes themselves*: a zero-fill that turned hours the dashboard
shows as R$4,845 into R$0, and four half-hour query shapes returning numbers up to
65% away from the dashboard's own export. Those four are no longer requested —
shipping a number proven wrong is worse than shipping none.

**The standing rule that produced most of the original defects:** an invented query
shape that fails, or returns an empty result, tells you nothing about the game. Only
the dashboard's own request shape is evidence. A live example: funnel discovery
returns an empty result on Knife Farm, which has funnels configured — so that
emptiness is a discovery problem, never a finding about the game.

---

## 6. Proposed feature — Raw data export for AI (accuracy-first)

**The ask:** a way to download the raw data to feed to an AI — *but the data has to
be accurate.* The right design is a **self-describing export**: the file carries not
just numbers but everything needed to interpret them correctly, so the AI can't
misread units, maturity, or coverage.

### 6.1 Endpoint
`GET /api/export?game={universeId}&from=…&to=…&format=json|csv`

Server-side (reuses `store.ts`), so no logic lives in the extension.

### 6.2 What makes it *accurate* (the whole point)
The export is a manifest + data, not a bare table:

```jsonc
{
  "game":   { "universeId": "10192528661", "genre": "simulation" },
  "window": { "from": "2026-06-05", "to": "2026-07-03", "timezone": "UTC",
              "note": "points are stamped 08:00:00Z; date is the UTC day" },
  "metrics": [
    {
      "id": "PayingUsersCVR",
      "label": "Payer Conversion",
      "category": "Monetization",
      "unit": "percent",              // <-- explicit
      "valueEncoding": "fraction",    // <-- 0.042 means 4.2%  (CRITICAL for AI)
      "kind": "rate",                 // rate = comparable across growth
      "higherIsBetter": true,
      "freshThrough": "2026-07-01",   // maturity
      "benchmark": { "p50": [...], "p90": [...] },
      "series": [
        { "label": "Total", "breakdown": {},
          "points": [ { "dateUTC": "2026-06-05", "value": 0.041,
                        "status": "OK", "isEstimated": false } ] },
        { "label": "Platform: Phone", "breakdown": { "Platform": "Phone" },
          "points": [ ... ] }
      ]
    }
  ],
  "updates": [ { "title": "v1.4 rebirth rework", "occurredAt": "2026-06-20" } ],
  "coverage": {
    "captured":  ["PayingUsersCVR", "ForwardD1Retention", ...],
    "unmapped":  ["SomeNewMetric"],   // captured but not in metric-info — flag, don't hide
    "missing":   ["ForwardD30Retention"], // in the LiveOps must-have set, not captured
    "estimatedPointCount": 12
  }
}
```

Accuracy guarantees baked in:
- **Explicit units + `valueEncoding`** — no AI ever has to guess whether `0.42` is
  42% or 0.42 Robux. (Fixes §5 gap #7.)
- **UTC labeling** — every point dated on the UTC day it's stamped; timezone stated
  once. No silent off-by-one.
- **Per-point `isEstimated`** — `DATA_STATUS_INVALID` surfaced, not dropped or
  silently trusted. (Gap #4.)
- **Freshness per metric** — the AI knows which windows are mature. (Gap #3.)
- **`kind` on every metric** — the AI is told which numbers are safe to compare
  across a growth window and which need DAU-normalization. (Gap #2.)
- **Coverage manifest** — the AI is told what's present, what's estimated, what's
  *absent*, so it never infers a trend from a gap. (Gap #5.)

### 6.3 Formats
- **JSON** — for AI/programmatic use (the manifest above).
- **CSV** — one tidy long table `game,metric,label,unit,kind,series,dateUTC,value,
  isEstimated,status` for spreadsheets, with a companion header row explaining the
  encoding. Same accuracy fields, flattened.

### 6.4 Where it plugs in
- Extension: a "Download for AI" button next to the existing ↓ (or leave export
  purely on the web app — cleaner, keeps the extension dumb).
- Web app: a download button on the dashboard header, scoped to the selected game +
  visible date range.

---

## 7. Roadmap (from the cahier)

- **Phase 1 — done.** Capture (passive + active), ingest/normalize/store, single-game
  dashboard with tiles/charts/breakdowns/benchmarks/freshness, manual update tagging.
- **Phase 1.5 — accuracy hardening — done (§5).** Seven phases landed 2026-08-08,
  both production games re-grabbed and verified against the dashboard's own exports.
  The AI export (§6) is the remaining piece of this phase.
- **Phase 2 — comparison engine.** Before/after an update with the rate/volume rule
  enforced, maturity gating, and a warning when two updates fall in one window. Much
  of the groundwork now exists: rate/volume classification, per-1k-DAU normalisation,
  maturity guards and settled-point semantics are all in the export layer.
- **Phase 3 — AI diagnosis.** Deltas + changelog → Claude → producer-format
  post-update report. (The export from §6 is essentially its input contract.)
- **Phase 4 — multi-producer + portfolio.** Auth, RLS per producer, cross-game view.

### Known blockers, carried forward

- **Supabase is offline.** The project no longer resolves in DNS, so charts and the
  learned-template store are dead. This does not block grabbing: the file mirror in
  `data/` is written before the database is touched, and the seeded plan is
  self-sufficient. Restoring it needs a new project and `web/supabase/schema.sql`.
- **`MessageHash` → text returns HTTP 500**, so `errors.md` lists error signatures by
  hash with volumes but no readable text. The volumes are still actionable: on Knife
  Farm one signature is 52.3% of 12.4M events.
- **Funnel discovery is unreliable per game.** It works on Become a Brainrot
  (`BaseUpgrades`, `PlayerProgression`) but returns empty on Knife Farm, which has
  funnels configured; `FunnelStep` discovery there returns 403. Treat an empty funnel
  result as a discovery failure, not as an absence of funnels.

---

## 8. Suggested order of attack

| Priority | Item | Why now |
|----------|------|---------|
| 1 | Fix delta (date-based, maturity-aware, volume-annotated) — §5 #1–#3 | Wrong deltas are visible in the demo and poison any AI input |
| 2 | Explicit units / `valueEncoding` + per-point `isEstimated` — §5 #4,#7 | Cheap, and the foundation of a trustworthy export |
| 3 | `/api/export` JSON+CSV with coverage manifest — §6 | The requested feature; near-free once #2 is done |
| 4 | Metric-map audit + coverage surface for unmapped — §5 #5 | Stops metrics silently vanishing; improves "what they're for" |
| 5 | Automatic benchmark verdicts — §5 #6 | Turns a chart into a judgment; big demo value |

---

*Test universe: KameHameHa Walls For Brainrots = `10192528661`, genre `simulation`.*
