# Indigo LiveOps Analytics — Status, Contribution & Roadmap

*Companion doc to the demo video. Explains what the tool is for, what already works
(Phase 1), where accuracy still needs hardening, and the proposed "raw data export
for AI" feature. Grounded in the current codebase — file paths are cited so anything
here can be checked.*

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

## 5. Accuracy — known gaps and how to close them

This is the area flagged for the showcase: **better accuracy on the metrics and what
they're for**, and it's also the precondition for the AI-export feature (§6). The
data pipeline is sound (dedupe, series identity, UTC dates); the gaps are in
**interpretation** — deltas, maturity, units, and completeness.

| # | Gap | Where | Impact | Fix |
|---|-----|-------|--------|-----|
| 1 | **Delta is index-based, not date-based** | `store.ts` `buildOverviewMetric` uses `prevIdx = length-8` (8th-from-last point) | With missing days or mixed granularity, "prior" isn't actually 7 days ago → wrong week-over-week % | Compute prior by **date arithmetic** (find the point nearest `latestDate − 7d`), not by array index |
| 2 | **Volume deltas shown raw** | tiles show `deltaPct` for volume metrics too | Contradicts §5.2 — a raw "+120% DAU" during growth is a non-insight | For volume metrics, either suppress the raw delta or annotate it with **"DAU grew X% over the same window"** as the denominator |
| 3 | **Maturity not enforced** | freshness is displayed but deltas ignore it | A D7 delta on a 3-day-old cohort is meaningless but still rendered | Gate/flag deltas when the window isn't matured vs `latestAvailableTime` (this is a Phase-2 comparison-engine rule the spec already calls for, §9 fix #4) |
| 4 | **Estimated points blended in** | `DATA_STATUS_INVALID` points are kept (correct) but counted in `latest`/`delta` without distinction | "Latest" can silently be an estimate | Keep the value, but mark per-point `isEstimated` and prefer the latest **validated** point for headline numbers |
| 5 | **Metric catalog completeness** | `metric-info.ts` maps a curated set; unmapped metrics fall to `category: "Other"` and are **hidden** | Newly-seen or renamed Roblox metrics silently disappear from the UI | Add a "coverage" surface (see §6) that lists captured-but-unmapped metrics so they get classified instead of dropped; audit the map against live captures |
| 6 | **No benchmark verdict** | p50/p90 are drawn but not evaluated | Producer still eyeballs "above/below" | Compute an automatic **"above/below Nth percentile for genre"** verdict per metric (spec §9 fix #5) |
| 7 | **Unit semantics are implicit** | percent metrics are stored as **fractions** (0.42 = 42%); Robux/minutes stored raw | Fine for the UI (which multiplies), but **an AI or CSV consumer will misread 0.42 as 42% unless told** | Make units explicit in any export (§6) — this is the single most important accuracy item for AI feeding |

**Also worth verifying for the "what they're for" concern:** the `kind`
(rate/volume), `higherIsBetter`, and `category` fields in `metric-info.ts` are
hand-authored. A quick pass to confirm each against Roblox's own definitions (esp.
the funnel metrics and the `L7Average*` smoothed variants) removes the risk of a
mislabeled metric driving a wrong-colored delta or a wrong AI conclusion.

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

- **Phase 1 — largely done.** Capture (passive + active), ingest/normalize/store,
  single-game dashboard with tiles/charts/breakdowns/benchmarks/freshness, manual
  update tagging.
- **Phase 1.5 — accuracy hardening (this doc, §5) + AI export (§6).** Highest
  leverage right now; unblocks trustworthy AI.
- **Phase 2 — comparison engine.** Before/after an update with the rate/volume rule
  enforced, maturity gating, and a warning when two updates fall in one window.
- **Phase 3 — AI diagnosis.** Deltas + changelog → Claude → producer-format
  post-update report. (The export from §6 is essentially its input contract.)
- **Phase 4 — multi-producer + portfolio.** Auth, RLS per producer, cross-game view.

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
