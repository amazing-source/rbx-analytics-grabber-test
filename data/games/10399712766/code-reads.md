# Live-place code reads — universe 10399712766

Read out of the running place through the Studio MCP. **Every entry is stamped
with the `PlaceVersion` it was read at**, because the place moves and a read is
only true of the version it came from. Nothing here was edited; all reads.

Place `83256791430098` · universe `10399712766`.

---

## 2026-08-21 · PlaceVersion 1241 · read-only

Studio reported `game.PlaceVersion = 1241`. `feedback.csv` shows `asset_version`
1228 still live at 2026-08-21T02:18Z, so 1229–1241 shipped during 08-21. Note
`place-versions.csv` is **stale for this universe** — it tops out at v1153
(2026-07-13), a fresh instance of F12 — so it cannot date any of this.

### `ReplicatedStorage.Client.Modules.Game.EventController` (ModuleScript)

Event RSVP / x2 banana signup. Reads `EventConfig.EventId`, a hardcoded string
literal in `ReplicatedStorage.Shared.Modules.Config.EventConfig`:

    EventConfig.EventId = "6858286705385014015"
    EventConfig.BananaMultiplier = 2

Two consumers, both `pcall`-wrapped and both only `warn` on failure:
- `isRsvped()` -> `SocialService:GetEventRsvpStatusAsync(EventConfig.EventId)`
- `promptSignup()` -> `SocialService:PromptRsvpToEventAsync(EventConfig.EventId)`

**Volume mechanism:** `EventController.Init()` ends with
`task.spawn(checkStatus, false)`, so `isRsvped()` runs **once per client per
session, unconditionally at join**. Any failure mode is therefore amplified to
DAU scale. The prompt path fires only on the lobby ProximityPrompt.

**Reward chain, confirmed end to end:**

    markSignedUp() -> signupEvent:FireServer()
      -> EventService:21  ProgressionService.SetEventBoost(player, true)
        -> ProgressionService:1016  entry.EventBoost = true
          -> ProgressionService:118  eventBoost = EventConfig.BananaMultiplier

`markSignedUp()` is reachable only from a `RsvpStatus.Going`, so if the RSVP
calls never succeed, `EventBoost` stays `false` (its init value at lines 493 and
534) and line 118 multiplies by 1 forever.

**RETRACTED — "the ID is stale, that's why it 404s."** It is not. The live
`AURAS/INDEX + ADMIN ABUSE` event in `annotations.md` carries
`eventId: 6858286705385014000`, and `Number("6858286705385014015")` **is**
6858286705385014000 — the gap is `JSON.parse` precision loss in our own
pipeline, above 2^53. The hardcoded ID matches the real, currently-running event
(started 2026-08-09T19:00:33Z; its END row is absent from a grab that did
capture the previous event's END).

**Still open:** why the calls fail is unknown. `errors.md` has null text for all
899 hashes because the async MessageHash lookup never polls. What survives as a
finding is structural: the ID is a hand-edited literal, so the x2 promo dies
silently at every event rollover unless someone edits and republishes.

### `ServerStorage.Server.Modules.Services.ProgressionService` (1,359 lines)

The player-data and economy authority. Four tables keyed by player: `profiles`
(ProfileStore), `stats` (authoritative `entry`), `replicas` (ReplicaServer),
`troves`. Owns currency, the multiplier stack (`bananaMultiplier`, 114-131),
rebirths, inventory, mailbox, daily rewards, spins, shop state, admin controls.

**The reported trace `ProgressionService:568 (AddMailboxGift nil index)` does not
line up with v1241.** At v1241, line 568 is `otherEntry.Friends[player] = true`
in the friend-sync loop. `AddMailboxGift` is **defined at 789** and **called at
583**. The trace is against v1240 numbering; the file has shifted >=15 lines.

What v1241 shows:
- The 568 neighbourhood is correctly guarded — it yields across
  `pcall(player.IsFriendsWith, ...)` then re-checks
  `stats[player] == entry and stats[other] == otherEntry`, and `entry.Friends`
  is initialised `{}` at 515 on the only construction path. No nil index there.
- `AddMailboxGift` (789-806) looks defensively closed. `entry` is guarded; if
  `profile.Data.Mailbox` were nil the `table.clone` at 526 would throw at join,
  not inside the function.
- The caller (576-585, `profile:MessageHandler`) validates only
  `type(message) == "table"` and `message.Kind ~= nil`, then passes it straight
  in as `gift`. If v1240 indexed a deeper field of `gift`, a malformed
  cross-server message is exactly a nil index inside `AddMailboxGift`.

**Why it matters beyond its count:** a throw there aborts the handler before
`processed()` at 584, so the gift is never acknowledged — neither delivered nor
cleared.

**Unresolved.** v1241 may already be the fix. **Test that settles it, read-only:
`ErrorCount` broken down by `PlaceVersion` across the v1240 -> v1241 boundary**
(Place as a *filter*, PlaceVersion as the breakdown — see CLAUDE.md).

### `StarterGui.MenuHUD.Wheel` + `MenuController` / `SpinController`

Gamepad path is three lines in `MenuController.refreshBackground()`:
`GamepadService:EnableGamepadCursor(openMenuFrame())` / `DisableGamepadCursor()`,
behind a `if shown == backgroundShown then return end` transition guard.
Wheel's four controls (`SpinButton`, `Three`, `Ten`, `Close`) are all
`Selectable=true`. Wheel has no LeftPanel button (Buttons = Upgrade, Rebirth,
Shop, Reward, Backpack) and no `Header.Close`, so `setupCloseButton` early-
returns — harmless, SpinController wires `MainFrame.Close` itself at :183.
Opened by `openWheelPart.Touched` (:195), closed by `TouchEnded` + 0.05s (:206).

**Verdict: clean. Two of my own claims retracted.**
1. *"The Wheel locks you out until you step off the pad."* False. `Touched`
   re-fires continuously for an animated character, so :201 reopens it. I
   asserted this from lines 155-230 without reading the whole file.
2. *"`openMenuFrame()` can bind the gamepad cursor to the wrong frame."*
   Unreachable — every open path closes `activePopup` first, so only one popup
   is ever open and the dictionary iteration order never matters.
