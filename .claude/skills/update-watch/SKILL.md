---
name: update-watch
description: Run the watch around a game update — the grab cadence before and after a publish, what is actually readable at each stage, and the "all metrics on paper" report a producer receives. Use when an update is about to ship or just shipped, when asked to keep an eye on a game or check nothing broke, or when writing a pre/post-update report.
---

# Update watch

The recurring job, not the one-off investigation. `liveops-diagnosis` answers
*why did this move* — load it when something has actually moved. This file is
the routine that runs on **every** update whether or not anything is wrong, and
the report that comes out the other end.

## Why the routine exists

Producers do not have time to check every game after every ship. So nobody
looks, and a broken update sits in production until the revenue drop is large
enough to notice on its own. That gap is the entire cost centre.

**The reference case — Become a Brainrot (`9963622286`), and it is the reason
this job exists.** v546 shipped 30 Jul 11:54 UTC. D1 retention went **16.8% →
9.72% the same day**. Two more deploys went out (3 Aug, 4 Aug) without moving it
because nobody knew what to fix. The fix landed **7 Aug 17:14 UTC — eight days
later** — and moved `Rebirth1` +5.0pp in 24 hours, so the fix was cheap and
available the whole time. Daily peak concurrents ran ~10,000 (29–31 Jul) and
were at **1,607 on 12 Aug** (last settled day, −84%). Revenue R$239,898 →
R$101,072/day. The eight-day gap alone cost **~R$700k (~R$650k after normal
decay, ≈ $2,275–2,450)**, and the reach damage ran weeks longer because Roblox
ranks on a 28-day retention window.

**None of that needed a data scientist. It needed somebody to look on 31 July.**
A watch that catches a break on day 1 instead of day 8 is worth more than any
analysis performed on day 8.

## The cadence — three grabs per update

| # | When | Purpose | What it can prove |
|---|---|---|---|
| **1. Baseline** | **Before the publish**, same day | Freeze the "before" | Everything. This is the only grab where all metrics are settled |
| **2. Error check** | **2–3 h after** the publish | Did we break it *right now* | Errors, crashes, server health, concurrents. **Nothing else** |
| **3. Next-day** | **Next day**, after the day rolls over UTC | The real read | CCU, DAU, revenue, session length. D1 the day after that |

**Grab 1 is the one people skip and the one that matters.** Without it there is
no before, and "did it drop" becomes unanswerable — every metric is being read
against a version that is already gone. If the publish already happened and no
baseline exists, say so in the report rather than reconstructing one from the
28-day chart, which mixes the old build's good days with its bad ones.

Grab 2 is deliberately narrow. Two hours after a publish the only honest
questions are *is it throwing errors* and *is it crashing*. Everything else is
a partial day.

**Timing note for grab 2:** servers pick up a new build as they cycle, not at
the moment of publish. Error counts rise for 1–3 h purely from adoption. Take
grab 2 late enough that most servers have turned over, and never read a rising
count in the first hour as "getting worse".

## What is readable when — check this before writing any number

The most common failure of this routine is reading a metric before it exists.

| Signal | Readable | Why |
|---|---|---|
| Script errors, crash counts | **immediately** | Event-stamped, no aggregation |
| Server errors per half hour | immediately | Half-hour buckets; the current one is `partial` |
| Concurrent players | immediately | Half-hour; but a publish restarts servers, see below |
| Client crash **rate** | next day | Daily metric; today's is a day-to-date average dominated by pre-update hours |
| DAU, revenue, session length, playtime | **next day** | Daily, UTC-bucketed |
| Downvote rate on the new version | next day | Feedback export, and only once players have voted |
| **D1 retention** | **2 days** | D1 for day D needs D+1 to finish, plus ~1 day of Roblox pipeline |
| D7 / D30 | 8 / 31 days | Same reason, longer cohort |
| Funnel completion by day | next day | Use `FunnelCohortCompletionRate` — it is served daily per named step |

A deploy at 17:29 UTC means that day's cohort is mostly **pre**-update, so the
first day that genuinely tests the update is the day **after** it ships.

## Pre-register the tripwires — in the baseline, before the update lands

In the baseline report, write the table of *what broken looks like* with a
threshold per signal. Doing it before means the post-update read is a lookup,
not an argument, and it stops a number being re-interpreted after the fact to
fit whatever happened. Worked example from `10030829154` on 2026-08-14 — the
baseline named `PetBag:484 index nil with 'Get'` at 3 events as a tripwire, and
90 minutes later it was at 33, which took the finding from "some errors exist"
to "the thing we said to watch fired".

**A threshold must never be computed over the in-progress day.** A pre-registered
number is the one thing in the report that cannot be revised later, so a partial
day inside its baseline mean poisons every subsequent comparison — and it reads
low, so it biases toward declaring the update fine. Compute means over complete
UTC days only; show today's value beside them if useful, but excluded and
labelled. Applied 2026-08-28 to the funnel 7-day means on both baselines.

**An error export cannot tell you whether a defect is still live — pair it with
`FirstSeenPlaceVersion`.** The export's *First seen version* column dates a
signature's **first** appearance, not the only build it fires on, so a signature
stamped with the new version may already be gone. The discriminator is
`ErrorCount` at `OneDay` filtered to `FirstSeenPlaceVersion >= <new version>`
(with `Place` present) — "errors this deploy introduced". **A deploy artefact
decays across the day boundary; a live defect does not.** Measured 2026-08-29 on
two publishes that looked identical in their exports:

| | publish day | next day | verdict |
|---|---|---|---|
| Verity `>= 678` | 2,069 | **4,018** | rising — live defect (`MysticLibraryService:144`) |
| Waterslide `>= 1715` | 9,826 | **174** | −98% — the next publish fixed it |

Without this test, Waterslide's 9,129-event signature would have been reported as
a live breakage and Verity's would have been ranked below it on volume.

**Rank by mechanism, not by export count, and read the message text for the
fix.** Roblox's own warnings often name the remedy: `[DrivewaySealer] Sealing is
disabled: this place cannot use the Editable Image/Mesh APIs. Fix: File > Game
Settings > Security > turn on "Allow Mesh & Image APIs"` was **132 events** on a
game doing R$689K/day — near the bottom of its export by volume, and pointed at
the game's core verb. Export counts are relative; they rank and date signatures,
they do not count affected players.

**Funnel tripwires need a two-day-old day, and the mean must exclude the newest
one.** `FunnelCohortCompletionRate`'s newest point moves by up to **5.5 pp** in
the days after it is first served — the entire width of a 5 pp tripwire — while
every point four or more days old moves by less than ±0.6 pp. The direction is
per-game: on `10565445771` the shallow steps read *high* and settle down, on
`10638354731` and `10030829154` every step reads ~1–4 pp *low* and settles up.
So a step that is "3 pp down" on a one-day-old day may be nothing at all.
**Compute the pre-update mean over days that exclude the newest, never fire on a
day less than two days old, and treat anything under four days as provisional.**
Measured 2026-08-29 by pulling the same dates twice, three days apart; F25 in
`data/verify/COVERAGE.md`.

**Check whether the baseline day itself is anomalous before freezing on it.** A
freeze inherits whatever happened that day. On 2026-08-27 `ClientCpuTimeAvg`
tripled on `10030829154` and doubled on `9963622286` while three other universes
did not move — and 08-27 was the freeze day for five update baselines, so the
contaminated value would have become the reference every later build was scored
against. Cross-check a suspicious baseline row against the other games in the
portfolio on the same date, and if it is anomalous, set the tripwire on the
pre-anomaly band and say so. F26 in `data/verify/COVERAGE.md`.

**When the publish already happened, say which day the freeze is at.** Both
2026-08-28 baselines were grabbed *after* their publish (15:25 UTC for a 15:00
ship). That is still a valid freeze — every quoted number comes from a UTC day
that closed before the publish, so no post-update player is inside it — but it
must be stated, and the report must not imply a clean pre-publish partial-day
shape it does not have. Label it **T+0, frozen at `<last closed day>`**.

| Signal | Pre-update value | Broken if |
|---|---|---|
| D1, settled | *baseline mean* | below *X* for 2+ settled days |
| Session length | *baseline* | below *X* |
| Client crash rate | *baseline* | above 1.4× baseline |
| Server errors/day | *baseline* | still elevated 24 h after the publish |
| Named error signature | *count at baseline* | any real volume |
| Downvote rate | *rate on the previous version* | above the previous version's |
| ARPDAU | *baseline* | **any** move, if it has been flat |

## Four things that look like breakage and are not

Check every one of these before escalating. Each has produced a false alarm.

1. **The publish-path server-error spike.** A deploy day spikes `ErrorCount`
   `LogSource: Server` 20–50× and returns to baseline within 24 h. On
   `10030829154`: 71–197K/day baseline, then 5.04M / 5.85M / 2.03M / 2.84M on
   four deploy days and no other day. **It is the publish, not the build.** It
   is only a finding if it is *still* elevated the next day.
2. **The restart dip in concurrents.** A publish cycles every server, so CCU
   dips and partially recovers over the next hour. Compare against the day's own
   pre-publish slope, not against yesterday's peak.
3. **Today's partial point.** The current half-hour and the current day are
   in-progress and read low. `partial` is marked in every CSV — never quote a
   partial point, and never compare a partial day to a full one.
4. **Version adoption.** New-build error counts climb while servers cycle. Rate
   per player, not raw count, and give it 2–3 h.

## The report — "all the metrics on paper"

One document per update. A producer who did not ask for it should be able to
read it in three minutes and know whether to act.

**Order matters, and errors go last.** The metrics are the state of the
business; the errors are the diagnostic appendix. A reader who stops after the
verdict has still got what they came for.

1. **Header** — game name + universe id, version shipped, publish timestamp
   (UTC, to the minute), which grabs this report holds and when they ran.
2. **Bottom line** — three bullets maximum. Is anything broken; what is the one
   item to act on; what cannot be answered yet.
3. **All metrics, before the update.** The full table, not a curated selection —
   this is the "on paper" part and the point of holding it. Every metric with:
   latest **settled** value, the date it is as of, the 7-day delta, `rate` or
   `volume`. Group by rung (Discovery / Retention / Monetization / Engagement /
   Performance). `data/games/<id>/summary.md` is already this table; do not
   retype it, carry it and add the reading.
4. **After the update** — only rows that are mature per the table above.
   Everything else gets a **NO DATA — first read on <date>** row. An absent
   measurement is not a clean bill of health, and the report must not let it
   read as one.
5. **Tripwires** — the pre-registered table with each row marked OK / WATCH /
   FIX / NO DATA.
6. **Errors — count, and what they are.** At the end. Per signature: count,
   message, script and line, call path, first-seen timestamp, and whether the
   version stamp says it is new to this build. Separate **new on this version**
   from pre-existing noise; the new ones are the report.
7. **Watchlist with dates**, and **questions for the studio** — anything that
   needs someone who plays the game (see `liveops-diagnosis` §5b: never publish
   a level judgement that has not survived one).

Deliver as `.docx` — that is the format the producers read. Write the styled
HTML, then convert with Word COM:

```powershell
$w = New-Object -ComObject Word.Application; $w.Visible=$false; $w.DisplayAlerts=0
$doc = $w.Documents.Open($src, $false, $true)
$doc.PageSetup.TopMargin=40; $doc.PageSetup.BottomMargin=40
$doc.PageSetup.LeftMargin=45; $doc.PageSetup.RightMargin=45
$doc.SaveAs2($dst, 16); $doc.Close(0); $w.Quit()
```

Keep it to ~4 pages. Tables over prose. Status chips (OK / WATCH / FIX / NO
DATA) so the eye finds the problem without reading.

## Where each number comes from

| Need | Source |
|---|---|
| All metrics, one table | `data/games/<id>/summary.md` |
| A specific series, daily | `data/games/<id>/metrics/<Metric>.csv` |
| Sub-daily (errors, CCU) | same file, `METRIC_GRANULARITY_HALF_HOUR` rows |
| Error **text** + first-seen version | Studio export — the API has no text |
| Error **volume** | `ErrorCount` metric — the export's counts are not totals |
| Deploy timestamps | `place-versions.md`, and `feedback.csv`'s `asset_version` when the root place's `saved-versions` call 500s |
| Roblox-side events | `annotations.md` (engine releases, experience events) |
| Disputed points | `data-quality.md` — read before quoting a sub-daily number |
| What the grab failed to fetch | `grab-report.md` — a 400 is missing data, never a zero |

**The two error instruments are not comparable and must never be mixed.** The
Studio export tallied ~335 events across all signatures in 24 h on
`10030829154` while the API counted 1.4–2.8M client script errors per day over
the same period. Export counts are **relative only** — they rank signatures and
date them, they do not count affected players. Say so whenever quoting one. The
`MessageHash` dimension lookup would join the two; it currently 500s on that
universe.

## Running it

```bash
cd web && npm run dev              # must be up; the extension posts to it
# grab from the extension on the game's dashboard, then:
npm run ingest:file -- ../data/raw/<bundle>.json   # only if ingesting offline
```

Gates before quoting anything (`liveops-diagnosis` §0): `npm run verify`,
`npm run audit-plan`, `npm test`.

## Where this is going

The extension is manual today: open the dashboard, click grab, three times per
update. That does not scale past a handful of games, and the whole value is
coverage. The intended path, in order:

1. **Scheduled grabs** — fire on a cron instead of a click, so a game is
   watched whether or not anyone remembered.
2. **Publish-triggered grabs** — poll `saved-versions` per universe; a new
   version is the trigger for the T+2h and T+1d grabs. This removes the need to
   be told an update shipped.
3. **Persistence + alerting** — tripwires evaluated automatically against the
   stored baseline; a message only when a threshold is crossed.
4. **Portfolio view** — many games, one page, sorted by what moved.

Until then the routine is manual and the discipline *is* the product: the
baseline grab always happens, and the report always ships.
