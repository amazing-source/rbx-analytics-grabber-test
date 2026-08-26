# `data/exports/` — dashboard downloads, filed per game

Everything here came out of the **Creator Dashboard export buttons**, not the
grabber. It is the half the API cannot serve: **error message TEXT**,
**player comment TEXT**, and hand-pulled metric CSVs. Treat it as evidence of
record — the grabber gives volumes, these give mechanisms.

## Layout

```
data/exports/<universeId>-<slug>/
  errors/     "Errors and warnings by count" exports (message text + first-seen version)
  feedback/   Report_<epochMillis>.csv  (player comments, rating, device)
  metrics/    individual metric chart CSVs
  reports/    written deliverables (.docx) about that game
```

## Naming

`<kind>_<downloadDate>_<HHMM>[_<detail>].csv` — download date/time is local
(Europe/Paris), because that is what the browser stamped. `<detail>` carries
the place-version span the export covers, or the data window.

Renaming on filing is deliberate: `Errors and warnings by count (17).csv` is
unattributable a week later; `errors_2026-08-16_1514_v3727-v3829.csv` under
`9610561918-my-knife-farm/` is not.

## Games

| Universe | Folder | Name |
|---|---|---|
| `10030829154` | `10030829154-climb-waterslide-and-slide` | Climb Waterslide and Slide |
| `10399712766` | `10399712766-banana-monkey-destruction` | [UPD] +1 Banana Monkey Destruction |
| `9963622286` | `9963622286-become-a-brainrot` | [WORLD 3] Become a Brainrot |
| `9610561918` | `9610561918-my-knife-farm` | My Knife Farm [UPD] |
| `10565445771` | `10565445771-verity-companion` | Verity Companion [AI] |
| `10638354731` | `10638354731-seal-a-driveway` | Seal A Driveway [RELEASE] |

## How a download gets attributed

Roblox does not put the universe in the filename, so attribution is done by
evidence, in this order:

1. **`First seen version` column → `data/games/<id>/place-versions.csv`.**
   Version bands are disjoint across this portfolio: Brainrot ~v400-599,
   Banana Monkey ~v1143-1242, Knife Farm ~v3733-3832, Waterslide root
   ~v1610-1709 **plus sub-places at v1-71, v1-8, v5-104, v114-213, v342-441
   and an unlisted band at v1294-1304**. A single export can mix bands when a
   universe has several places — that mix is itself the fingerprint.
2. **Script paths in the message.** `GoShop_Raft`, `Workspace.Rafts`,
   `ServerInit` → Waterslide. `[OddsController]`, `AnimalModule` → Brainrot.
   `GamebeastSDK`, `StellarQuest` → Knife Farm.
3. **Feedback exports carry no version at all** — match the comment text
   against `data/games/<id>/feedback.csv`, which the grabber already holds.
   That is exact, and it is what attributed all 10 `Report_*.csv` files.

## Added later on 2026-08-24

- `10030829154/errors/errors_2026-08-24_1749_all-time_v1708_381rows.csv` —
  **381 rows**, far richer than the ~26-row filtered exports. Worth a dedicated
  pass; the defect report was written before it landed.
- `10030829154/feedback/feedback_2026-08-24_1745_jul28-aug24.csv`
- `9963622286/errors/errors_2026-08-24_1831_v600.csv` — 25 rows, **70 events
  total**. A narrow slice: the deploy log shows 384,123 errors for v600 that
  day, so this file cannot clear a version on its own. Use `ErrorCount` by
  `PlaceVersion` at HalfHour for the rate instead.
- `9963622286/metrics/errors-halfhour_FILTERED-unknown_*.csv` — a filtered
  half-hour series totalling 5,276 events against ~5.4M/day for that universe.
  The dashboard filter that produced it is unknown; do not treat it as a total.

## Deleted on filing (2026-08-24)

- 5 byte-identical re-downloads (4× the same feedback export, 1× an error
  export, 1× a duplicated .docx).
- 33 metric CSVs from the 2026-08-08 Knife Farm batch — **already committed**
  in `data/verify/9610561918/`, byte-identical ignoring CRLF. That directory
  remains the ground-truth corpus; do not re-file copies of it here.

## Gap

**Banana Monkey Destruction has no error export.** Its folder holds one
feedback export and nothing else. Every other game has error message text; on
10399712766 the only error evidence is `MessageHash` volumes from the grabber,
which have no text attached. Pull an "Errors and warnings by count" export for
it when the dashboard is next open.
