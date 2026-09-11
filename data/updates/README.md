# Update specs, as supplied by Ren

Source documents for what each build contains. They were previously pasted in
conversation and never filed, which is how a build got credited with features it
did not contain (see `spec-blocks-may-be-unreleased`, 2026-09-08, and the
retraction in `DIAGNOSIS_LOG.md`).

**Rules for reading these, learned the hard way:**

1. **The date header is the marker, and a block can describe an UNSHIPPED
   update.** A spec dated later than today has not shipped. Check the header
   before crediting any build.
2. **A dated header is not proof of the ship date either** — Verity's
   `Update 10.09` block shipped early, as **v689 on 2026-09-08** (confirmed by
   Ren, 2026-09-11). Cross-check `place-versions.csv` for a published version on
   or near the date.
3. **Items marked DELAYED, PAUSED or POSTPONED inside a shipped block are not
   live.** Several are.
4. Roblox's own `ANNOTATION_TYPE_EXPERIENCE_EVENT_STATE` rows in
   `data/games/<id>/annotations.md` name some updates directly
   (`NEW UPDATE - AURAS` dated Banana Monkey's aura block to v1246) and are the
   strongest independent evidence.

| Game | File |
|---|---|
| Become a Brainrot | [9963622286-become-a-brainrot.md](9963622286-become-a-brainrot.md) |
| Climb Waterslide and Slide | [10030829154-climb-waterslide-and-slide.md](10030829154-climb-waterslide-and-slide.md) |
| +1 Banana Monkey Destruction | [10399712766-banana-monkey-destruction.md](10399712766-banana-monkey-destruction.md) |
| Verity Companion [AI] | [10565445771-verity-companion.md](10565445771-verity-companion.md) |
| Seal A Driveway | [10638354731-seal-a-driveway.md](10638354731-seal-a-driveway.md) |
