# Seal A Driveway — code reads

Everything read out of Studio via MCP, stamped with where it was read. The live
universe is `10638354731`; the places below are **not** it — check the stamp
before carrying any of this into a claim about production.

---

## 2026-09-10 — the wet-driveway frame collapse, and the fix

**Read from:** `[DEV] Seal A Driveaway` place `140010128837133` (gameId
`10762328612`) in play mode, then `seal test` place `129941005706105` in edit
mode. **Not the live place, and no PlaceVersion applies** — the test copy was
opened in edit mode and already carried prior fix attempts from both the studio
and from me.

### Symptom, measured

Client, not server: the server script profiler's top function was 0.36% of
capture (10.7 ms of Lua across 3 s). All cost sat in the
`RunService.Heartbeat` handler in `StarterPlayerScripts.DrivewayClient`,
**94–95% exclusive** — raw Luau compute, not engine-boundary churn (LuaBridge
children `$newindex`/`$namecall`/`$index` totalled ~5%).

| Phase | Frame p50 | `DrivewaySurface:Step` share of handler |
|---|---|---|
| Before pouring | 17.3 ms | — |
| Pouring | **76.9 ms** | 81.2% |
| Squeegeeing | **53.3 ms** | **92.5%** |
| After slab completed | 17.6 ms | — |

**Negative control (the strongest evidence):** the cost vanished when the slab
settled — handler 34.6 → 8.0 ms/frame. Predicted before measuring: if cost
tracks live wet cells, completion puts them to sleep and it disappears; if it
tracked grid *size* it would persist. It disappeared.

### Root cause — two bounds that multiply

Neither is fixable alone, which is why **three** prior rounds of fixes (studio's
and mine) each measured as doing nothing.

1. **`SurfaceGrid:Step` could not subdivide a region.** `_decompose` merges
   contiguous awake chunks into ONE rect, so a flooded slab arrives as a single
   ~24,480-cell region. The `if ran > 0 and spent + area > budget then break`
   rule then served region 1 whole regardless of size — so the cell budget only
   ever stopped regions 2..8, i.e. the fragmented case that was never slow.
   `ActiveRegions` caps *rect count* (`MAX_ACTIVE_RECTS`), not area.
2. **`SOLVE_MS` is spent PER GRID.** 19 registered surfaces, 7–8 awake during a
   spread, ~3 ms each = **~22 ms/frame**. `DrivewayClient` stepped every awake
   grid every solve; the repaint 30 lines below had round-robined for exactly
   this reason since before either fix.

### Fix applied in the test copy

- `SurfaceGrid:Step` — serve a **chunk-aligned band** of an oversized region,
  resuming from `self._solveY`. **Bands must be chunk-aligned**: `_stepRect`
  derives its chunk range by flooring the cell rect and the sleep pass writes
  `awake` per chunk, so a band ending mid-chunk sleeps rows that were never
  stepped and freezes sealer in place. `Config.ChunkCells = 10`.
- Two knock-ons required: `_dryOnly` may only be decided on a **complete** sweep
  (a partial sweep's `_sawFast` describes the band, not the surface), and
  `self.loose` must accumulate across bands or `LooseVolume` and the tutorial's
  "pour it all out" gate read a partial sum.
- `DrivewayClient` — working slab **plus 3** others per frame, rotating, cursor
  in a new file-scope `solveAt`.
- `SOLVE_MS` 3.0 → 8.0; Medium/High `MaxGridCells` 120,000 → 48,000.

**Result:** whole zone flooded, frame p50 **19.1 ms (~52 FPS)**, `DC:solve`
1.26 ms/frame against its 2.4 ms budget. `solveEvery` relaxed back to 1 from
`SEALER_MAX_SKIP = 3`, i.e. the throttle left its degraded mode entirely.

### Constants, live values (test copy, Medium quality)

`SimHz` 30 · `MaxCatchUp` **1** · `MaxStepSeconds` 0.0333 (= the fixed step, so
**there is no headroom to hand a starved grid a bigger dt**) · `CellSize` 0.30 ·
`MaxGridCells` 120,000 (was) · `ChunkCells` 10 · `BucketCapacity` 20,000, and
**500 on stock gear** — a stock pail was enough to reach 13 FPS.

`SEALER_SOLVE_MS` 2.4 · `SEALER_PAINT_MS` 2.4 · `SEALER_MAX_SKIP` 3 ·
`SEALER_WORK_MS` 6.0 · `SEALER_FRAME_MAX` **3** in this copy (it is **1** in the
DEV place, which closes a paint-budget feedback loop — `frameScale` multiplies
`paintCells` and `paintCapMs` on slow frames). `AfkClient`'s `AFK_FRAME_MAX = 3`
is commented "same cap, and same reason, as SEALER_FRAME_MAX", which is no longer
true anywhere it was tightened.

### Quality presets set SIMULATION, not just visuals

    Low    CellSize 0.45  MaxGridCells  16000  SimHz 24  MeshStep 3
    Medium CellSize 0.30  MaxGridCells 120000  SimHz 30  MeshStep 4
    High   CellSize 0.21  MaxGridCells 120000  SimHz 30  MeshStep 5

From `Set_SealerQuality`, else `Low` on touch, else `Medium`; published to
`SealerQualityActive`. **Read this before comparing two copies of the game** —
the DEV place caps at 48,000 where this copy allowed 120,000, so the same road
built 92,500 cells here against ~48,000 there, 1.93x the solver cost for
identical tarmac.

**Trap measured:** after capping, cost per cell rose **90 → 149 ns** (bigger
cells hold more liquid, so more of each rect does real work). The full-sweep
saving was ~22%, not the 2x the cell count implies. **Never size a cell change
off cell counts alone.**

### Still open

- Tail not flat: `DC:solve` max invocation 14,518 µs vs a 1,283 µs mean. Likely
  the `chunkRows = 1` floor on a very wide region; `DirtyRegions` solves the same
  problem at `:624` by also narrowing the band in X.
- **Untested across every other consumer of `SurfaceGrid`** — Duel, Squeegee
  Battle, the Race, the AFK yard, rebirth restore/`FillSealed`, and the pail HUD
  after a large spread. The band split is live for all of them.
- A temporary diagnostic writes `Dbg*` attributes on `workspace` from
  `SurfaceGrid:Step` in the test copy. **Strip it before that copy is used for
  anything else.**
