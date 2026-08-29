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

## Added on 2026-08-29 — the post-update batch for the 08-28 evening publishes

Four exports, downloaded 14:07–14:10 local, covering roughly 3–4 versions back
per game so the new build's signatures can be separated from the old build's.
Attributed by version band; all three bands are disjoint (Verity v6xx, Seal
v8xx-v9xx, Waterslide v17xx).

| filed as | game | versions | signatures | events |
|---|---|---|---|---|
| `10565445771/errors/errors_2026-08-29_1408_v664-v679_5990ev.csv` | Verity Companion | v664–v679 | 25 | 5,990 |
| `10565445771/errors/errors_2026-08-29_1408_v664-v679_3788ev.csv` | Verity Companion | v664–v679 | 25 | 3,788 |
| `10638354731/errors/errors_2026-08-29_1407_v888-v901.csv` | Seal A Driveway | v888–v901 | 25 | 3,943 |
| `10030829154/errors/errors_2026-08-29_1410_v1711-v1716.csv` | Climb Waterslide | v1711–v1716 | 25 | 9,953 |

**The two Verity files are the same top-25 table over two different count
windows** (the wider one first — the `First seen at` values are identical, only
`Count` differs). The dashboard caps this export at 25 rows, so the distinguishing
detail in the filename is the total event count rather than a date range, which
was not recoverable from the file.

**The Seal export does not reach v908**, the build published 2026-08-28 21:00.
It therefore cannot evaluate that game's "new signature on this version"
tripwire; `ErrorCount` filtered to `FirstSeenPlaceVersion >= 908` was used
instead and returned 539 events on 08-29, 0.0075% of the day.

**What these three exports established**, each written up in the relevant
`baseline/2026-08-28T*/BASELINE.md`:

- **Verity — a live defect.** `MysticLibraryService:144: attempt to call missing
  method 'FireAllClients' of table`, first seen 20:10 on 08-28 (40 min after the
  v679 publish), largest signature in both files, and **still rising** —
  `FirstSeenPlaceVersion >= 678` gives 2,069 on 08-28 → 4,018 on 08-29.
- **Waterslide — a defect that was already hotfixed.** `MuFa is not a valid
  member of Folder ReplicatedStorage.Model` (9,129) plus four `Egg model not
  found` warnings, all first seen 20:50 on v1715. The same filter gives 9,826 on
  08-28 → **174** on 08-29, a 98% collapse: **v1716 fixed it.**
- **Seal — nothing from v908, but a pre-existing core-loop warning.**
  `[DrivewaySealer] Sealing is disabled: this place cannot use the Editable
  Image/Mesh APIs` (132, v901, first seen 08-18) — sealing *is* the game, and the
  message names its own fix (Game Settings > Security > Allow Mesh & Image APIs).

**Method note worth keeping.** "First seen version" dates a signature's *first*
appearance, not the only build it fires on — so an export alone cannot tell you
whether a defect is still live. Pair every export with `ErrorCount` filtered to
`FirstSeenPlaceVersion >= <new version>` at `OneDay`: a deploy artefact decays
across the day boundary, a live defect does not. That single test separated
Verity's live bug from Waterslide's fixed one.

## Added on 2026-08-29 evening — Verity post-update

| filed as | kind | game | note |
|---|---|---|---|
| `10565445771/errors/errors_2026-08-29_1801_v678-v679_6159ev.csv` | by-count | Verity | filtered to v678–v679; 6,159 events, matching the API's `FirstSeenPlaceVersion >= 678` figure |
| `10565445771/metrics/errors-halfhour_2026-08-29_1808_aug27-aug29_total-client-server.csv` | chart | Verity | half-hour series, three `Type` rows: Total / Client / Server |

**Attribution of the chart export was exact, not inferred.** Its `Total` rows sum to
**1,179,708** on 08-27 and **1,557,188** on 08-28 — identical to `ErrorCount` for
`10565445771` from Open Cloud on the same days. That is a stronger fingerprint
than the version band, and worth reaching for first when a chart export has no
version column at all.

**Watch the `Type` column on chart exports.** The file carries `Total`, `Client`
and `Server` as separate row sets over the same timestamps, so a naive sum of the
value column **double-counts** (Total already contains the other two). A 2-day
half-hour export is 291 rows, not 97.

**Useful decomposition it gives:** Verity is client-dominated and getting more so
— 08-27 Client 840,146 / Server 339,562 (71% client), 08-28 Client 1,204,404 /
Server 352,784 (77%). The day-on-day rise is almost entirely client
(+364,258 against +13,222 server).

### Still missing, and it is the one that matters

Neither file names a signature: the by-count export is version-filtered, and the
chart export has **no `Message` column at all**. The signature that is
**30–57% of every error this game throws** (`MessageHash 8447699130433435152`,
~2M/day at its 08-21 peak, pre-dating the update by at least eight days) has
never appeared in any export filed here. What names it is **"Errors and warnings
by count" with the version filter cleared**.

## Parked — unattributed

`errors-halfhour_2026-08-29_1803_UNATTRIBUTED_5757perday.csv` (downloaded 18:03,
same chart shape) totals **5,757 on 08-27 and 8,676 on 08-28**. That matches no
game in this corpus — Verity 1.18M, Waterslide 2.98M, Seal 12.56M, Banana Monkey
2.36M, Brainrot 3.24M on 08-27. Volume that low suggests a **development place**
rather than a live one. Held in the session scratchpad rather than filed to a
game folder, because a wrong attribution is worse than an unfiled export.
