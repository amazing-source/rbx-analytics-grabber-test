# DEV_LOG — engineering on Seal's codebase

**Scope boundary.** This file is code work: editing Seal A Driveway's scripts in a
test copy, profiling, and fixing defects. It is **not** analytics. Nothing here
belongs in `.claude/SESSION_LOG.md`, `baseline/`, `baselines/` or the diagnosis
docs — those are about what the numbers say, this is about what the code does.
Cross-references go one way: a defect found here may become a finding there, but
never the reverse.

---

## Places, and the standing rule

**Only ever edit a COPY, and ask before every edit — even in a copy.**
Verify by id, never by name, inside the same call that writes.

| | universe | place | may edit? |
|---|---|---|---|
| **Live** Seal A Driveway | `10638354731` | `120014184236770` | **never** |
| **Dev** place | `10762328612` | `140010128837133` | **never** |
| **Test copy** "seal test" | `10765298055` | `129941005706105` | yes, after asking |

The test copy was downloaded and republished by Ren on 2026-09-05 for this work.
Its `DrivewayClient` has had comments stripped (see below), so **fixes port back
to the dev place by re-applying the edit, never by copying the file over**.

---

## State at 2026-09-06 ~03:10 — live in the test copy

### Correctness fixes (keep these)

| # | file | change | why |
|---|---|---|---|
| 1 | `TutorialClient:2586` | inlined `IDLE_SOFT`/`IDLE_HARD` | script was over Luau's 200-register cap and **was not compiling at all** — dead tutorial, no error |
| 2 | `MapReach:240` | removed `IncrementAsync` on five global keys | **the data loss.** See `reports/2026-09-05/seal-data-loss.md` |
| 3 | `UpgradeService:657,1325` | Studio write-guard scoped to the live universe | test copy now saves across stop/play; live protection intact |

Fix 2 is the only one of the night with an end-to-end evidence chain, and it is
about production, not performance.

### Performance work (unproven — this is where tomorrow starts)

| # | file | change |
|---|---|---|
| 4 | `SurfaceGrid` (sweep loop) | blade-space `ahead` reject — completes the `along` filter at 1737, kills the 2.8× diagonal penalty |
| 5 | `SurfaceGrid:Step` | drying/slow-solve gate: `_sawFast` / `_dryOnly`, 1/5 cadence at 5× dt when only the shine ramp is changing |
| 6 | `SurfaceGrid:Step` | **cell budget** — `SOLVE_MS 3.0`, smoothed `_solveNs`, round-robin `_solveTurn`, `_looseAccum` across the cycle |
| 7 | `Config` | `CellSize 0.21 → 0.30`, `MeshStep 5 → 4` — **forced at the default for the experiment**, not a shipping decision |
| 8 | `DrivewayClient` | quality preset block (Low/Medium/High) + `SealerQualityActive` attribute |

### Test scaffolding — REMOVE BEFORE ANYTHING PORTS BACK

- `DrivewayClient` — **all comments stripped** (199,924 → ~54,000 chars) plus a
  three-line header saying so.
- `DrivewayClient` — ten `debug.profilebegin("DC:…")` / `profileend()` pairs
  around the Heartbeat body.
- `Config` — the forced `CellSize`/`MeshStep` (#7).

### Reverted during the session

- `MAX_ACTIVE_RECTS` 8→24 and `MAX_DIRTY_RECTS` 6→16 — **back to 8 and 6.**
- `WetDecay` 0.040→0.160 / `GlossDecay` 0.055→0.220 — **back.** Feel constants
  must not pay for a performance bug; players use the spread to fill zones.

---

## Measurements — Studio, wand pour ~140 L unless noted

Parsed with `node tools/mp-summary.js <dump.html> <out.json>`. Dumps land in
`%LOCALAPPDATA%\Roblox\logs\microprofile-*.html`.

| capture | CPU median | `Script_DrivewayClient` | note |
|---|---|---|---|
| 00:58 pour | 33.4 ms | 12.90 ms | baseline |
| 00:58 squeegee | 67.0 ms | 23.08 ms | baseline |
| 02:50 wand pour | 62.8 ms | **23.80 ms** | **my regressions live** (rect budgets) |
| 03:04 wand pour | **47.3 ms** | **17.26 ms** | after reverts + `CellSize 0.30` + instrumentation |

**Section breakdown at 03:04** — this is the whole point:

```
DC:solve   14.63 ms   <- 85% of the script
DC:paint    2.08 ms
DC:rig      0.37 ms
DC:wand     0.09 ms
DC:pick / truck / fill / tool / tail / hud  -- did not register
```

Machine: Ryzen 7 7800X3D, RX 9070 XT, `QualityLevel 1 (manual)`.
**GPU ext median 0.12–0.16 ms, 0/64 frames GPU-heavy, 63/64 jobs-heavy.**
This is Luau on the main thread. It is not graphics and not hardware.

**Studio caveat:** Studio renders on the main thread (`Perform`/`Present` nested
inside `RenderViewUpdate` on `RBX Main`), so frame ≈ Heartbeat + Render there.
A real client threads rendering. The `Script_DrivewayClient` figure is the part
that transfers; the frame total does not.

---

## The finding tomorrow builds on

`DrivewayClient:1454`:

```lua
local solveEvery = math.clamp(math.ceil(sealerStepMs / SEALER_SOLVE_MS), 1, SEALER_MAX_SKIP)
if solveFrame >= solveEvery then  ... run the whole solve, unbounded ...
```

**That is a frame-skip divisor, not a budget.** At ~44 ms per solve it computes
`ceil(44/2.4) = 19`, clamps to 3, and runs the lot every third frame → 14.6 ms
average with a 44 ms spike. That is the 57.6 ms max against a 47.3 ms median.

`SEALER_MAX_SKIP = 3` exists so the solver never drops below ~20 Hz — correct
instinct, but it means the per-call cost *must* be bounded and nothing bounded
it. Change #6 is that bound, and it is **untested**.

---

## Next session

1. **Measure #6.** Same test: wand, ~140 L, no squeegee, dump. `DC:solve` should
   fall from 14.63 toward ~3 ms and the max should flatten. `SOLVE_MS` is the
   knob — raise if flow feels sluggish under heavy pours, lower if frames spike.
2. **If solve drops but frames don't**, render is next: `Render::Perform` 14.33 /
   `Present` 13.36 at 03:04, GPU idle, so it is `WritePixelsBuffer` uploads and
   `LiquidMesh` deform. `DC:paint` (2.08) bounds how much of it the script can
   even reach.
3. **Decide `CellSize` for real.** 0.30 is forced for the experiment. It halves
   cells for ~27% off the script, at the cost of a visibly blockier coat — one
   cell is one texture pixel. Either ship the preset properly or revert #7.
4. **Strip the scaffolding** (`DC:` profiler scopes, forced Config) before
   anything ports to the dev place.

---

## Found, not fixed

- **`DrivewayClient` is at 184/200 top-level Luau registers.** One more
  top-level `local` and it stops compiling with no runtime error — exactly how
  `TutorialClient` died. It also carries 72–85% of frame time. **Splitting it is
  the structural fix** and it removes the character ceiling too.
- **`ServerStorage._OldTycoonWall_HasBackdoor_DoNotReuse`** still contains a live
  `require(script:WaitForChild("TextureConfiguration", 4).Module.Value)` with
  asset id `71773222643933` in a `NumberPose`. Disabled, unreferenced, inert
  where it sits. **Delete the model.**
- **Duplicate DataStore accessors** — `UpgradeService:755` vs `:862`
  (`Grants_v1`), `MapReach:70` vs `:160` (`MapReach_v2`). Config already records
  this pattern biting once (`DepotGate` vs `DrivewayServer` rate limiters,
  "silently disagreed by fifty times").
- **`SAVE_TRIES = 3` gives up silently.** After 1 s and 2 s of retry the session
  is written off and the player is never told.
- **`DrivewayClient` has zero `pcall`s in 4,191 lines** (pre-strip). That is what
  turned the `EditableImage` throw at `SurfaceRenderer:565` into lost payouts —
  the throw at `:3776` skips the coverage reports at `:3972` and `:4002`.
- **Unfinished driveways are not saved.** Design, not a bug, but players report
  it as data loss and it feeds the same complaint stream.

---

## Tooling notes, learned the hard way

- **MicroProfiler dumps cannot be hand-parsed.** The `GAK` container is
  proprietary and compressed. `tools/mp-summary.js` runs the viewer's own WASM
  in headless Chrome and captures its "Summary to JSON" — use it.
- **`run_code` reaches only the EDIT datamodel**, even while play is running.
  `run_script_in_play_mode` reaches the server but starts and stops its own
  session, so it cannot inject into a session already being played.
- **The MCP plugin caps `Source` writes at 200,000 characters.**
- **`debug.profilebegin`/`profileend`** is how you split one script's blob into
  named scopes. It is what finally located `DC:solve`.

## Mistakes made 2026-09-05, worth not repeating

- **Serviced a theory instead of the measurement.** The profiler named
  `Script_DrivewayClient` in the first dump; three changes went into
  `SurfaceGrid` on an awake-chunk theory before anything was instrumented. Two
  of them were neutral and one **doubled the cost of pouring**.
- **Raising `MAX_DIRTY_RECTS` 6→16** meant up to 16 `WritePixelsBuffer` uploads
  per surface per frame. The comment says "each rect is one WritePixelsBuffer
  call" — it was right there.
- **Called a comment strip safe after testing for `[[` but not `[=[`.** A
  `--[==[` block's opener matched the plain `--` rule, so its body became bare
  code and `DrivewayClient` stopped compiling. Presented as "the truck is
  broken"; the whole script was dead. Correct test is `%[=*%[`.
- **Indexed `self._energyFast` in a per-chunk loop** twelve lines below where the
  file hoists that exact buffer to a local, for exactly this reason.
- **Shipped the drying gate as the fix for what Ren was seeing.** It only helps
  surfaces you have walked away from; while you are pouring or sweeping,
  `_sawFast` is true every frame and it cannot engage.
