"""Phase 0 — a trustworthy publish log, scoped to each game's ROOT place.

The problem was not truncation. `place-versions.csv` holds rows for EVERY place
in a universe, and version numbers are per-place, so sorting the file by
timestamp or taking max(version) mixes a root publish with a sub-place save.
That is how Waterslide read as "v3" — the newest timestamp in its file belongs
to a sub-place on v3 while its root sits at v1716.

Root place ids come from the public games API (`rootPlaceId`), not inferred.

Second source: feedback.csv `asset_version`. A player can only review a version
they played, so a version's first feedback row bounds its ship from above. Used
to CORROBORATE the root-place log and to date versions the log lacks — never to
override an exact `published_utc`.

Both sources are left-censored at their own window edge: a version already live
when coverage begins reads "on or before", never "on".

Writes analysis/panel/publish_log.csv.
"""
import csv, os, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "analysis", "panel")

GAMES = {
    "8507699752": "Poison Treats", "9963622286": "Become a Brainrot",
    "9610561918": "My Knife Farm", "7364907416": "Plane Training",
    "10030829154": "Climb Waterslide", "10399712766": "+1 Banana Monkey",
    "9758414065": "Climb Up Mountain", "10565445771": "Verity Companion",
    "8669915245": "Don't Wake Police", "10638354731": "Seal A Driveway",
    "10192528661": "KameHameHa Walls", "7888930431": "Moon Incremental",
}
ROOTS = {r["universeId"]: r["rootPlaceId"]
         for r in csv.DictReader(open(os.path.join(OUT, "root_places.csv"), encoding="utf-8"))}

rows, summary = [], []
for uid, name in GAMES.items():
    gdir = os.path.join(ROOT, "data", "games", uid)
    root = ROOTS.get(uid)

    # --- root-place publishes -------------------------------------------
    pub, other_places = {}, set()
    p = os.path.join(gdir, "place-versions.csv")
    if os.path.exists(p):
        for r in csv.DictReader(open(p, encoding="utf-8")):
            pid = r.get("place_id")
            if pid != root:
                other_places.add(pid)
                continue
            if str(r.get("is_published", "")).lower() not in ("true", "1"):
                continue
            try:
                pub[int(r["version"])] = r.get("published_utc") or ""
            except (KeyError, ValueError, TypeError):
                continue

    # --- feedback corroboration ------------------------------------------
    fb = collections.defaultdict(list)
    f = os.path.join(gdir, "feedback.csv")
    if os.path.exists(f):
        for r in csv.DictReader(open(f, encoding="utf-8")):
            try:
                v = int(r["asset_version"])
            except (KeyError, ValueError, TypeError):
                continue
            if r.get("created_utc"):
                fb[v].append(r["created_utc"])
    fb_first_overall = min((min(t) for t in fb.values()), default=None)

    for v in sorted(set(pub) | set(fb)):
        seen = sorted(fb.get(v, []))
        if v in pub and pub[v]:
            when, src, conf = pub[v], "root place-versions", "exact"
        elif seen:
            censored = fb_first_overall and seen[0][:10] == fb_first_overall[:10]
            when, src = seen[0], "feedback asset_version"
            conf = "on-or-before (left-censored)" if censored else "on-or-before"
        else:
            when, src, conf = "", "root place-versions", "version known, date unknown"
        rows.append([uid, name, root, v, when, src, conf, len(seen),
                     "yes" if v in pub else "no"])

    live = [v for v in pub if pub[v]]
    newest = max(live) if live else None
    newest_ts = pub[newest][:19] if newest else "-"
    last_fb = max((max(t) for t in fb.values()), default="")[:10]
    summary.append((name, root, len(other_places), len(pub), newest, newest_ts, last_fb))

print(f"{'game':20s}{'root place':>17s}{'sub':>5s}{'pubs':>6s}{'newest root publish':>34s}{'last feedback':>15s}")
for name, root, subs, npub, newest, ts, lastfb in summary:
    print(f"{name:20s}{root:>17s}{subs:>5d}{npub:>6d}"
          f"{('v'+str(newest)+'  '+ts if newest else '-'):>34s}{lastfb:>15s}")

with open(os.path.join(OUT, "publish_log.csv"), "w", newline="", encoding="utf-8") as fh:
    w = csv.writer(fh)
    w.writerow(["universe", "game", "root_place", "version", "when_utc", "source",
                "confidence", "feedback_rows", "in_root_place_versions"])
    w.writerows(rows)
print(f"\nwrote analysis/panel/publish_log.csv — {len(rows)} rows")
