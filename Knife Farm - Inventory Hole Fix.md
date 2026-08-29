# Knife Farm — selling & placing knives is broken for long-time players

Universe `9610561918` · read-only investigation, 2026-08-27 · page version:
https://claude.ai/code/artifact/5755f142-2777-4079-98e8-dc971494f48f

Paste-ready message for the devs below the line.

---

**Knife Farm — selling & placing knives is broken for long-time players. Found the cause, it's a 6-line fix.**

**Symptom:** a player can't sell knives and can't place them on plot slots. Buying is blocked downstream because they can't free up cash. Silent — no errors, just `warn`s.

**Cause:** `KnifeInventory` in the save has `nil` holes in it. `CaseModule.FindKnife` (line ~1055) walks it with `ipairs`, and **`ipairs` stops at the first `nil`**. Every knife after that hole is invisible to it. `FindKnife` is the gate on all three actions:

- `SellKnives:47` — sell one → `if not itemPos then return end`
- `SellKnives:149` — sell all → `continue`
- `MainModule:1094` — place on a slot → `if not knifePos then return end`

So one hole at index 12 = 3,829 unsellable knives.

**Where the holes come from:** `dedupeByItemId` → `clean()` in `Data/DataInit` (line ~144). It rebuilds the inventory as `newContainer[key] = item`, **keeping the original numeric key** and skipping deleted entries. That leaves a gap. It re-runs every join and copies the keys verbatim, so once an account is holed it stays holed forever — which is why the fixes you pushed didn't help anyone already affected.

**Proof, from the live `Game_1` datastore (read-only):** 20 of ~510 top players sampled are corrupted, 0 of 243 casual players. Examples:

```
Player_3870112879   3840 knives, max index 3846, holes @12,24,542,856,2973,3040  -> ipairs reaches 11   = 99.7% unsellable
Player_4347265041   1979 knives, max index 1983, holes @60,267,1511,1519         -> ipairs reaches 59   = 97.0% unsellable
Player_589476123    1687 knives, max index 1691, holes @19,170,623,912           -> ipairs reaches 18   = 98.9% unsellable
Player_10079500484  1605 knives, max index 1611, holes @232,325,695,759,805,1153 -> ipairs reaches 231  = 85.6% unsellable
Player_10005867630   877 knives, max index  881, holes @1,214,438,706            -> ipairs reaches 0    = 100%  unsellable
Player_11060669747   292 knives, max index  293, hole  @1                        -> ipairs reaches 0    = 100%  unsellable
```

**It is not the storage limit.** Every affected account is maxed (`Upgrades.Storage = 11`, limit 150) and way over it, which is why it *looks* like a limit bug — but that's just "played a lot". Granting yourself 200 knives won't reproduce it. You need a duplicate itemID to have existed on a past join.

**The fix** — in `ServerScriptService.Data.DataInit`, replace `clean()` and its four call sites:

```lua
	local function clean(container, getId, isArray)
		if typeof(container) ~= "table" then return container end

		local newContainer = {}

		for key, item in pairs(container) do
			local id = nil
			if typeof(item) == "table" then
				id = getId(item)
			end

			if id and countMap[id] == 1 then
				if isArray then
					table.insert(newContainer, item) -- pack: never leave a nil hole
				else
					newContainer[key] = item         -- PlotCases/PlotKnives are keyed by SLOT NAME, do not renumber
				end
			else
				player:SetAttribute(
					"Duped",
					(player:GetAttribute("Duped") or 0) + 1
				)
			end
		end

		return newContainer
	end

	profile.Data.CaseInventory  = clean(profile.Data.CaseInventory,  function(v) return v and v[3] end, true)
	profile.Data.KnifeInventory = clean(profile.Data.KnifeInventory, function(v) return v and v[5] end, true)
	profile.Data.PlotCases      = clean(profile.Data.PlotCases,      function(v) return v and v[4] end, false)
	profile.Data.PlotKnives     = clean(profile.Data.PlotKnives,     function(v) return v and v[5] end, false)
```

**⚠️ The `isArray` flag is the important part.** `PlotCases` and `PlotKnives` are dictionaries keyed by slot name (`"Slot3"`), not arrays. If you compact those you renumber them to 1,2,3… and every plot breaks. Only `CaseInventory` and `KnifeInventory` get `true`.

**Why this is safe:**

- It runs at join, before `CaseModule.UpdateKnives` builds the tools, so tools are still created from `pairs()` over the same entries — nothing changes about what a player sees.
- Nothing in the codebase stores an inventory index across sessions. Everything is keyed by `ItemID` (`EquippedKnives`, `KnifeAscensions`, tool attributes), so renumbering is invisible.
- `KnifePower.GetKnifePower` falls back to `RarityPower.Common` and rank `1` — it can never return nil, so a `pairs` sweep in `EquipBestHandler` can't blow up the `table.sort` comparator.
- It actually *repairs* a second latent bug: today `#KnifeInventory` (3846) disagrees with the real entry count (3840), and `CaseModule.GiveKnife` compares those two. After packing they match.
- Every affected player is fixed on their next join. No migration script needed.

**Does it wipe anyone's data? No.** The keep/drop condition (`if id and countMap[id] == 1`) is untouched — the patch only changes *where a kept item lands*. And on the poisoned accounts that condition drops nothing: across the ~510-profile sweep and in detail on 12 accounts, `missingId = 0`, `dupInside = 0`, `crossDup = 0`. Every surviving entry has a unique non-nil id, so every one takes the keep branch. Player_3870112879 goes in with 3,840 knives at indices 1–3846 and comes out with 3,840 at 1–3840. If a player *does* join with a live duplicate, today's code deletes both copies and leaves two holes; the patched code deletes both copies and leaves none — identical deletion, strictly less damage.

Test in Studio against a copied profile first. `DataInit.GetStoreState()` returns `"Studio_87"` in Studio and `"Game_1"` live, so Studio testing can't touch live saves by accident.

**Optional hardening** (not required, but cheap) — make `FindKnife` tolerant so a hole can never brick anything again:

```lua
	-- CaseModule.FindKnife, line ~1055
	for i, knife in pairs(profile.Data.KnifeInventory) do   -- was ipairs
		if typeof(knife) == "table"
			and knife[1] == knifeName
			and knife[2] == rarity
			and knife[3] == eventRarity
			and knife[4] == level
			and knife[5] == ItemID then
			knifePos = i
			break
		end
	end
```

Every caller uses the return value either as a truthiness check or as `KnifeInventory[pos]`, so a non-sequential key is fine. Same change is worth making at `EquipBestHandler:106`.

**Two things this does not do:**

1. It won't bring back knives `clean()` already deleted — those are gone from the save. (Datastore version history goes back ~30 days if you want to restore a specific whale by hand.)
2. It doesn't fix whatever creates the **duplicate itemIDs** that `clean()` reacts to in the first place. It just makes them harmless. My suspects are the plot↔inventory moves that call `AddKnifeToSlot`/`AddKnife` before `RemoveKnife` without checking the return value (`MainModule:1099`, `EquipBestHandler:127`) — if the remove silently fails, the knife ends up in two containers and next join `clean()` deletes **both copies**. Worth considering keeping one copy instead of deleting both; right now a legit knife gets destroyed alongside its duplicate.

---

## Not proven (do not state these to the devs as findings)

- **Which path creates the duplicate itemID.** No live duplicate was found in the ~510 profiles read. The pair-deletion fingerprint (hole counts dominated by 1, 2, 4, 6, 8) is what points at duplicates; the specific call sites are candidates only. Whether new corruption is still being produced is unknown.
- **Whether v3831 is where this started.** The DataStore version-history read that would date the first hole hung on throttling and was killed. Re-runnable in small batches.

## Ruled out

- Ascension and Mutation machines — all 12 accounts inspected in detail have `KnifeAscensions = {}` and empty machine states.
