# Seal A Driveway — the painting FPS drop, and the fix

Universe `10638354731`. Code read 2026-09-05 in Studio (read-only) against the
dev copy — place `140010128837133`, universe `10762328612`. Line numbers are that
copy's; check them against live before applying.

**Diagnosis in one line:** every chunk holding uncured film is pinned awake, and
the solver steps the whole awake set every frame — so per-frame cost grows with
**total painted area**, whatever tool put the paint there.

That is why the wand, the bucket *and* the squeegee all cause drops. They differ
only in how fast each spreads film over new ground.

---

## The root cause

`SurfaceGrid:1395`, in the sleep pass:

```lua
if stillCuring then
    buffer.writef32(sleepT, c * 4, 0)   -- any film at all -> pinned awake
else
    buffer.writeu8(awake, c, 0)
end
```

`Step` (`:741`) calls `ActiveRegions` and runs `_stepRect` over every awake
region, every frame. A chunk cannot retire while it holds film, and film takes
time to cure — so the awake set only grows for the duration of a job.

Every tool feeds the same set, through the same call:

| tool | how it wakes chunks | swept width | limited by |
|---|---|---|---|
| **Wand** | `Pour` → `WakeCellRect` (`SurfaceGrid:1526`) | 4.8 studs (`WandRadius` 2.40) | **aim, over `WandReach` 15.0 studs** |
| **Bucket** | `Pour` → `WakeCellRect` (same line) | 6.0 studs (`PourRadius` 3.00) | walking speed, short reach |
| **Squeegee** | `Squeegee` → `WakeCellRect` (`SurfaceGrid:1971`), film written at `:1817` | ~10.8 studs (`BladeHalfLen` 3.20 ×2 + `BladeGather` 2.20 ×2) | walking speed |

**The wand is worst because of reach, not because of paint.** At
`WandReach = 15.0` the player sweeps an arc without moving their feet, so new
ground is covered as fast as the aim swings. The bucket and squeegee are
walking-limited, so they feed the awake set more slowly — which is exactly the
reported ordering: wand fastest, bucket slower, squeegee also present.

### Correction to an earlier draft of this document

An earlier version claimed the wand called `Pour` ~33× more often than the pail.
**That was wrong.** It compared the wand's stream against the pail's *tap*. A
held bucket streams per frame too — `DrivewayClient:3100-3101`,
`amount = Config.PourHold * dt` then `surface:Pour(...)` — and at
`PourHold = 88.0` units/s with the larger 3.00-stud radius it is **~1,752
cell-visits per call against the wand's ~1,140**, i.e. more expensive per call.
Pour frequency is not the differentiator, and it cannot be: the squeegee never
calls `Pour` and still causes drops.

---

## Fix A — let cure-only chunks step at a reduced cadence (the actual fix)

This is the one that fixes all three tools, because it fixes the awake set.

A chunk pinned by `stillCuring` is no longer moving sealer. It needs only the
cure integration, which is **linear in dt** — so stepping it every 4th tick with
`4 * dt` is numerically the same result. The fluid solve (gravity, velocity,
spread) can be skipped entirely for those chunks.

**Shape:**

1. Add a per-chunk `cureOnly` buffer beside `awake` / `sleepT` in
   `SurfaceGrid.new` (`:85`).
2. In the sleep pass (`:1395`), when a chunk would retire but for film, set
   `cureOnly = 1` and leave `awake = 1` — instead of resetting `sleepT` to 0.
   Clear `cureOnly` in `WakeCellRect` (`:186`), so any pour, squeegee pass or
   truck drop puts the chunk straight back on the full solve.
3. `ActiveRegions` (`:506`) decomposes twice: full-sim chunks
   (`awake AND NOT cureOnly`) and cure-only chunks.
4. `Step` (`:741`) runs the full-sim set every tick, and the cure-only set on a
   counter — every 4th tick, passing `4 * dt`.

**Do not weaken the invariant.** The `stillCuring` pin exists because removing it
produced "fully painted driveways that never count as sealed" — the history is in
the comment at `:1362`. Film must still finish curing and `Coverage` must still
reach `CompleteAt`; this changes only how often it is stepped.

**Expected:** on a large lot mid-job, where most awake chunks are curing rather
than flowing, the per-frame solver cost falls toward a quarter. It also bounds
the drift instead of letting it grow with painted area.

---

## Fix B — deposit on a fixed cadence (wand *and* held bucket)

A constant-factor win on top of Fix A, and it removes a genuine oddity: cost
currently scales with framerate, so a 120 fps client does twice the `Pour` work
of a 60 fps one for the same sealer.

Applies to **both** streaming tools. No balance change — volume is accumulated
and handed over whole.

### B1. `Config` — add beside `WandRate` (~line 1999)

```lua
--[[
    How often a held stream hands its sealer to the grid.

    Pour is two full passes over the brush's bounding box, so running it once a
    frame tied cost to framerate: a 120 fps client did twice the work of a 60 fps
    one for the same sealer.

    Chosen against the BRUSH, not the eye: at 15 Hz a sweep at 30 studs/s
    advances 2.0 studs between centres against a 4.8 stud brush, so consecutive
    discs still overlap by more than half and the ribbon stays unbroken.
]]
Config.StreamPourHz = 15
```

### B2. `DrivewayClient` — declare beside `wandImpact` (line 1250)

```lua
local wandOwed, wandClock = 0, 0
local pailOwed, pailClock = 0, 0
```

### B3. Wand block — replace the deposit at `DrivewayClient:2919-2933`

```lua
			local rate = Config.WandRate * (rigState.pump or 1)
			-- Accumulate, then deposit on a fixed cadence. See Config.StreamPourHz.
			-- The tank clamp stays on the ACCUMULATOR so a held trigger can never
			-- owe more than the truck holds.
			wandOwed = math.min(wandOwed + rate * dt, rigState.tank)
			wandClock += dt
			if wandClock >= 1 / Config.StreamPourHz and wandOwed > 0 then
				local amount = wandOwed
				wandClock, wandOwed = 0, 0
				local placed = if surface and not waitingOn
					then surface:Pour(impact, amount, Config.WandRadius)
					else 0
				if placed > 0 then relayDraw += amount end
			end
```

…and flush the remainder on release, in the `else` at `:2938`, or a tapping
player loses up to one interval of sealer every time they let go:

```lua
			if wandOwed > 0 and surface and not waitingOn and wandImpact then
				if surface:Pour(wandImpact :: Vector3, wandOwed, Config.WandRadius) > 0 then
					relayDraw += wandOwed
				end
			end
			wandClock, wandOwed = 0, 0
```

### B4. Bucket block — same treatment at `DrivewayClient:3099-3115`

**The glug must stay per-frame.** A tap is a whole `PourDump` landing in one
frame and that is deliberate (`:3088`, the owner asked for it on 2026-08-12).
Only the `streaming` branch is accumulated:

```lua
			if glug then
				local amount = math.min(dumpOwed, bucket)
				local placed = surface:Pour(impactPos :: Vector3, amount)
				if placed > 0 then
					bucket -= amount
					dumpOwed -= amount
					if dumpOwed <= 1e-4 then
						dumpOwed = 0
						dumpGap = Config.PourDumpGap
					end
				end
			else
				pailOwed = math.min(pailOwed + Config.PourHold * dt, bucket)
				pailClock += dt
				if pailClock >= 1 / Config.StreamPourHz and pailOwed > 0 then
					local amount = pailOwed
					pailClock, pailOwed = 0, 0
					if surface:Pour(impactPos :: Vector3, amount) > 0 then bucket -= amount end
				end
			end
```

Flush `pailOwed` on release for the same reason as the wand.

---

## Fix C — one line, measure before committing to it

`SurfaceGrid:273-274`:

```lua
local MAX_ACTIVE_RECTS = 8    -- sim: each rect re-reads Config into locals
local MAX_DIRTY_RECTS  = 6    -- render: each rect is one WritePixelsBuffer call
```

When the awake set has more components than the budget, `_decompose` merges the
cheapest pair repeatedly (`:443`), and if the merged set costs more than one box
it **collapses to a single bounding box over the whole awake extent** (`:489`) —
which then includes every untouched cell between strokes. A swept trail is
exactly that shape.

Try `MAX_ACTIVE_RECTS = 16`. It cuts both over-covered area and merge iterations,
at the cost of per-rect overhead and an O(n²) scan that only runs while
`count > maxRects`. **Measure it; do not assume it helps.**

---

## Order, and how to know it worked

Ship **Fix A alone first** — it is the one that addresses all three tools, and
shipping it alone keeps the effect attributable. Then B, then measure C.

- **Target:** `ClientFpsP10` on 10638354731. Baseline **48.60** (09-03), 46.64
  (09-04), 46.87 (09-05). Read the settled day two days after the ship.
- **Guardrail — payout must not move.** `AverageRevenuePerUser` baseline 09-03 =
  **2.596**, the portfolio's best ARPDAU by 3.5×. Fix B changes when sealer is
  handed over, never how much; if ARPDAU moves, the accumulator is losing volume.
- **Guardrail — coverage must still complete.** Watch for any return of
  `[DrivewayServer] ... not paid and NOT recorded`. Fix A touches the pass whose
  previous bug was driveways that never counted as sealed.
- **Thesis test:** `RFYDuration61To180` (first-play bounce, 61–180s). 09-03 =
  **0.2420**, worst in the portfolio, and it rose 27.8% → 41.6% across 16–30 Aug.
  If performance is what drives the bounce this should fall. If it does not move,
  the thesis is wrong and needs re-testing rather than the fix extending.

Cross-check with a `PlaceVersion` split during adoption overlap — `ClientFpsP10`,
`ClientCrashRate15m` and `SessionDurationSecondsAvg` all support it, and old vs
new build on the same day beats any day-over-day comparison.

---

## Found in the same read, not part of this fix

- **`DrivewayClient` has zero `pcall`s in 4,191 lines.** That is what turned
  today's `EditableImage is not accessible` throw at `SurfaceRenderer:565` into
  lost player payouts: the throw at `:3776` (`surface:Render`) skips the coverage
  reports at `:3972` and `:4002`, so `DrivewayServer:661` refuses the completion —
  no cash, no record. Fix the Game Settings toggle (Security → Mesh & Image APIs)
  first; wrap the render call second.
- **`ServerStorage._OldTycoonWall_HasBackdoor_DoNotReuse`** still holds a live
  `require(script:WaitForChild("TextureConfiguration", 4).Module.Value)` with asset
  id `71773222643933` in a `NumberPose`. Disabled and unreferenced — delete it.
- **Duplicate DataStore accessors.** `UpgradeService:755` opens `"Grants_v1"`
  inline while `:862` opens it via `GRANTS_STORE`; `MapReach:70` opens
  `"MapReach_v2"` inline while `:160` uses `STORE_NAME`. Same divergence pattern
  Config already records biting once (`DepotGate` vs `DrivewayServer` rate
  limiters, "silently disagreed by fifty times"), and `MapReach_v2` is exactly
  where production is throttling today.
