# Seal A Driveway — players losing progress. Cause found, one-line fix.

Universe `10638354731`. 2026-09-05. Evidence: feedback export (355 comments,
14 Aug – 5 Sep), dashboard error exports, and a code read in the test copy.

**One line:** an analytics counter nobody reads is writing to five *global*
DataStore keys from every server, saturating the per-server request queue, and
the profile save is what gets starved. Players lose their session.

---

## The chain, end to end

| # | link | evidence |
|---|---|---|
| 1 | `MapReach` increments **five global keys** — `d_Neighbourhood`, `d_EstateDistrict`, `d_RetailPark`, `d_Airport`, `d_ParkingGarage` — once per player per district, from every server | `MapReach:240`, `s:IncrementAsync(COUNT_PREFIX .. DISTRICTS[i].name, 1)` |
| 2 | Roblox throttles writes **per key**, so five keys absorb the whole population's traffic | 10,584 × `InternalServerError ... API: IncrementAsync, MapReach_v2` |
| 3 | The request queue fills. It is **per-server and shared across every store** | **238,793** × `DataStore request was added to queue. If request queue fills, further requests will be dropped.` (all-time export, first seen 2026-08-09) |
| 4 | `UpgradeService.save()` gets 502s, retries 3× (1s, 2s), then writes the session off | 408 × `[UpgradeService] save failed for <Player> after 3 tries: 502` |
| 5 | The player rejoins onto their last successful save | **29** player reports of lost progress |

### It amplifies itself

`MapReach:249-260` — when the per-player mark fails to save, the player is
**counted again on the next join**. More writes, onto the same failing keys. The
warning says so in its own words: *"counted to %d but the mark did not save, so
they may be counted again"* — 1,289 events.

### The design intent that failed

`MapReach:47-57` argues the counter lives in its own store precisely so it can
never hurt the profile:

> *"telemetry must never be able to take down the thing it is measuring. So it
> lives here, in its own store, under its own key, where the worst a bug can do
> is miscount."*

**A separate store is not a separate budget.** The DataStore request queue is
per-server and shared. The isolation this rests on does not exist, and the
failure it was written to prevent is the one that happened.

The other stated assumption — *"the writes only happen on the join where a player
first crosses into somewhere new — once each, in a whole account's lifetime"* —
holds per account but not per key. Five keys carry every new player in the game,
and Seal has been scaling hard.

---

## The fix (applied in the test copy)

`ServerScriptService.MapReach:240` — delete the increment:

```lua
-- was:
s:IncrementAsync(COUNT_PREFIX .. DISTRICTS[i].name, 1)
-- now:
-- REMOVED 2026-09-05: five GLOBAL keys written by every server.
```

**Safe, because the counter is dead weight:**

- **Nothing in the place reads the `d_` counters back.** Full-tree search for
  `COUNT_PREFIX` returns only `MapReach` itself. Write-only.
- `AnalyticsService:LogFunnelStepEvent` at `MapReach:287` already carries the
  same measurement, under funnel `"MapReach 2"` — and unlike the DataStore
  totals, it actually reaches the dashboard.
- The surrounding `pcall`/`high = i`/mark logic is untouched, so per-player marks
  still persist and the funnel still dedupes across sessions.

**Verified after the edit:** `IncrementAsync` occurrences in `MapReach` = 0.

---

## What this is NOT

**Not a v914 regression.** Genuine loss reports run 1–2 a day, steadily, from
**15 Aug to 5 Sep**. The queue warning is first seen 09 Aug. This is three weeks
old and predates the last two publishes — do not roll back v914 for it.

**Not the rebirth complaints.** Of 34 loss-mentioning comments, **5** are
players objecting that rebirth resets their money and upgrades. That is the
design working as intended and is a separate product conversation:

> *"I spent hours getting money for a truck and I rebirth and my money is all
> gone"* · *"When you rebirth stop resetting EVERYTHING let them keep their skill
> upgrades atleast"*

The other **29** are the defect above:

> *"I'VE LOST ALL MY PROGRESS, I HAD 2 TRUCKS AND 2MILLON DOLLA"*
> *"i did allot of work to make allmost ALL OF THE ROAD ... BUT WHEN I JOIN BACK ITS ALL RESETED"*
> *"lost my progress two times when i left and rejoined, fix your game up hire some real devs"*

29 of 355 comments — **8.2% of all player feedback** — is one defect.

---

## Still open, in priority order

1. **`SAVE_TRIES = 3` writes the session off silently.** After 1s and 2s of
   retry, `UpgradeService.save()` gives up and the player is never told. Even
   with the queue pressure gone, a throttle at a bad moment still loses a
   session. Consider a longer backoff, and surfacing "couldn't save" to the
   player rather than failing quietly.
2. **Duplicate store accessors.** `MapReach:70` opens `MapReach_v2` inline while
   `:160` uses `STORE_NAME`; `UpgradeService:755` opens `Grants_v1` inline while
   `:862` uses `GRANTS_STORE`. Config already records this exact pattern biting
   once before (`DepotGate` vs `DrivewayServer` rate limiters, "silently
   disagreed by fifty times").
3. **Unfinished driveways are not saved**, and players read that as data loss
   too — *"Please make un finished jobs save. I left the game in the middle of
   doing a road and it's gone now."* Design decision, not a bug, but it is
   feeding the same complaint stream.

---

## Cross-check before shipping to live

The counter's totals are a closed book once this ships — that is fine, since
nothing read them. But confirm with whoever owns the dashboard that no external
report pulls `MapReach_v2`'s `d_*` keys through Open Cloud DataStore APIs before
deleting it permanently rather than commenting it out.
