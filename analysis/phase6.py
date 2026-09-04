"""Phase 6 — common shock, or independent failures?

Track A found nothing internal to a game that precedes its Home pullback. That
raises the external hypothesis by elimination, so it now has to be tested
properly rather than adopted by default.

Two alignments, as briefed:
  CALENDAR    — do games lose residual Home reach on the SAME DATES?
  LIFECYCLE   — or does each decline line up against its OWN peak?

The comparison must be on RESIDUALS, not raw reach. Every game is trending and
every game has the same weekday shape, so raw series correlate strongly for
reasons that have nothing to do with a shared shock. For each game:

    log(home reach) ~ linear time trend + weekday dummies

and everything below runs on what that model cannot explain.

Reading the result:
  * high mean pairwise residual correlation on CALENDAR alignment, and
    pullbacks clustering on shared dates
      -> platform / seasonality / competition gains credibility
  * correlation only appears under LIFECYCLE alignment
      -> the same curve at different offsets; independent lifecycles
"""
import csv, os, collections, datetime, math, itertools
import numpy as np

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

home = collections.defaultdict(dict)
for r in csv.DictReader(open(os.path.join(OUT, "by_source.csv"), encoding="utf-8")):
    if r["metric"] == "UniqueUsersWithImpressions" and r["source"] == "HomeRecommendation":
        v = float(r["value"])
        if v > 0:
            home[r["universe"]][r["date"]] = v


def residuals(uid):
    """log reach with trend + weekday removed."""
    s = home[uid]
    ds = sorted(s)
    if len(ds) < 40:
        return {}
    y = np.log([s[d] for d in ds])
    t = np.arange(len(ds), dtype=float)
    dow = np.array([datetime.date.fromisoformat(d).weekday() for d in ds])
    X = np.column_stack([np.ones(len(ds)), t] + [(dow == k).astype(float) for k in range(1, 7)])
    b, *_ = np.linalg.lstsq(X, y, rcond=None)
    return dict(zip(ds, y - X @ b))


res = {u: residuals(u) for u in GAMES}
res = {u: v for u, v in res.items() if v}
print(f"games with enough Home reach for a residual model: {len(res)}/12\n")

# ------------------------------------------------- calendar alignment
print("=" * 74)
print("CALENDAR ALIGNMENT — pairwise correlation of residual log Home reach")
print("=" * 74)
pairs, overlaps = [], []
for a, b in itertools.combinations(sorted(res), 2):
    common = sorted(set(res[a]) & set(res[b]))
    if len(common) < 45:
        continue
    x = np.array([res[a][d] for d in common])
    y = np.array([res[b][d] for d in common])
    if x.std() == 0 or y.std() == 0:
        continue
    r = float(np.corrcoef(x, y)[0, 1])
    pairs.append((r, GAMES[a], GAMES[b], len(common)))
    overlaps.append(len(common))
pairs.sort(reverse=True)
print(f"{len(pairs)} game pairs with 45+ overlapping days")
if pairs:
    rs = [p[0] for p in pairs]
    print(f"mean pairwise r = {np.mean(rs):+.3f}   median {np.median(rs):+.3f}   "
          f"range {min(rs):+.3f} to {max(rs):+.3f}")
    pos = sum(1 for r in rs if r > 0)
    print(f"positive: {pos}/{len(rs)}  ({100*pos/len(rs):.0f}%)")
    print("\nstrongest 6:")
    for r, a, b, n in pairs[:6]:
        print(f"   {r:+.3f}  {a:20s} x {b:20s}  ({n}d)")
    print("weakest 6:")
    for r, a, b, n in pairs[-6:]:
        print(f"   {r:+.3f}  {a:20s} x {b:20s}  ({n}d)")

# a shared shock should show up as a day where MANY games are simultaneously low
print("\n" + "=" * 74)
print("SHARED BAD DAYS — dates where many games sit below their own residual mean")
print("=" * 74)
bydate = collections.defaultdict(list)
for u, s in res.items():
    sd = np.std(list(s.values())) or 1.0
    for d, v in s.items():
        bydate[d].append(v / sd)
rows = [(d, len(v), float(np.mean(v))) for d, v in bydate.items() if len(v) >= 6]
rows.sort(key=lambda r: r[2])
print(f"{'date':>12s}{'games':>7s}{'mean z':>9s}   (most negative = most synchronised bad day)")
for d, n, m in rows[:12]:
    print(f"{d:>12s}{n:>7d}{m:>9.2f}")
print("\nfor reference, the most synchronised GOOD days:")
for d, n, m in rows[-5:]:
    print(f"{d:>12s}{n:>7d}{m:>9.2f}")

# ------------------------------------------------- lifecycle alignment
print("\n" + "=" * 74)
print("LIFECYCLE ALIGNMENT — same residuals, aligned on each game's own peak")
print("=" * 74)
import json
ev = json.load(open(os.path.join(OUT, "pullbacks.json")))
aligned = collections.defaultdict(dict)
for u in res:
    e = (ev.get(u, {}) or {}).get("0.7|3") or []
    if not e:
        continue
    pk = datetime.date.fromisoformat(e[0]["peak_date"])
    for d, v in res[u].items():
        k = (datetime.date.fromisoformat(d) - pk).days
        if -60 <= k <= 60:
            aligned[u][k] = v

lpairs = []
for a, b in itertools.combinations(sorted(aligned), 2):
    common = sorted(set(aligned[a]) & set(aligned[b]))
    if len(common) < 45:
        continue
    x = np.array([aligned[a][k] for k in common])
    y = np.array([aligned[b][k] for k in common])
    if x.std() == 0 or y.std() == 0:
        continue
    lpairs.append(float(np.corrcoef(x, y)[0, 1]))
if lpairs:
    print(f"{len(lpairs)} pairs with 45+ overlapping offsets")
    print(f"mean pairwise r = {np.mean(lpairs):+.3f}   median {np.median(lpairs):+.3f}")
    pos = sum(1 for r in lpairs if r > 0)
    print(f"positive: {pos}/{len(lpairs)}  ({100*pos/len(lpairs):.0f}%)")

print("\n" + "=" * 74)
print("VERDICT INPUTS")
print("=" * 74)
if pairs and lpairs:
    print(f"calendar-aligned  mean r = {np.mean([p[0] for p in pairs]):+.3f}")
    print(f"lifecycle-aligned mean r = {np.mean(lpairs):+.3f}")
    print()
    print("A shared external shock should make CALENDAR correlation clearly the")
    print("larger of the two. A shared LIFECYCLE SHAPE at different offsets makes")
    print("the lifecycle number the larger. Neither being materially above zero")
    print("means the residuals are close to independent noise and neither story")
    print("is supported by this test.")

# ------------------------------------------------- pullback date clustering
print("\n" + "=" * 74)
print("DO THE PULLBACKS THEMSELVES CLUSTER ON THE CALENDAR?")
print("=" * 74)
j0s = []
for u in GAMES:
    for e in (ev.get(u, {}) or {}).get("0.7|3") or []:
        j0s.append((e["j0"], GAMES[u]))
j0s.sort()
for d, n in j0s:
    print(f"   {d}  {n}")
months = collections.Counter(d[:7] for d, _ in j0s)
print("\nby month:", dict(sorted(months.items())))
print(f"{len(j0s)} events over {len(set(d[:7] for d, _ in j0s))} distinct months — "
      "clustering would show as most events in one or two months.")

# ------------------------------------------------- confound check
print("\n" + "=" * 74)
print("CONFOUND — is the lifecycle correlation built in by the alignment itself?")
print("=" * 74)
print("Aligning on peaks forces every series to peak at offset 0, so an inverted-V")
print("shape is shared BY CONSTRUCTION. Test: shuffle which peak each game is")
print("aligned to (use another game's peak date), and re-measure.\n")
import random
random.seed(7)
keys = sorted(aligned)
null_means = []
for trial in range(200):
    perm = keys[:]
    random.shuffle(perm)
    fake = {}
    for u, donor in zip(keys, perm):
        if donor == u:
            continue
        e = (ev.get(donor, {}) or {}).get("0.7|3") or []
        if not e:
            continue
        pk = datetime.date.fromisoformat(e[0]["peak_date"])
        fake[u] = {}
        for d, v in res[u].items():
            k = (datetime.date.fromisoformat(d) - pk).days
            if -60 <= k <= 60:
                fake[u][k] = v
    rs = []
    for a, b in itertools.combinations(sorted(fake), 2):
        common = sorted(set(fake[a]) & set(fake[b]))
        if len(common) < 45:
            continue
        x = np.array([fake[a][k] for k in common]); y = np.array([fake[b][k] for k in common])
        if x.std() == 0 or y.std() == 0:
            continue
        rs.append(float(np.corrcoef(x, y)[0, 1]))
    if rs:
        null_means.append(float(np.mean(rs)))

if null_means:
    obs = float(np.mean(lpairs))
    hi = sum(1 for m in null_means if m >= obs)
    print(f"observed lifecycle-aligned mean r : {obs:+.3f}")
    print(f"null (peaks shuffled), {len(null_means)} draws: mean {np.mean(null_means):+.3f}, "
          f"p95 {np.percentile(null_means,95):+.3f}")
    print(f"p = {hi/len(null_means):.3f}  ({hi} of {len(null_means)} shuffles matched or beat it)")
    print()
    if hi / len(null_means) > 0.05:
        print("NOT SIGNIFICANT. The lifecycle correlation is what peak-alignment produces on")
        print("its own; it is not evidence that these games share a lifecycle mechanism.")
    else:
        print("Survives the shuffle: alignment alone does not produce this.")

# ------------------------------------------------- the August cluster
print("\n" + "=" * 74)
print("THE 2026-08 CLUSTER — is a shared bad fortnight real?")
print("=" * 74)
full = [(d, n, m) for d, n, m in rows if n >= 9]
full.sort()
if full:
    ms = np.array([m for _, _, m in full])
    aug = [(d, m) for d, _, m in full if "2026-08-12" <= d <= "2026-08-24"]
    if aug:
        augm = float(np.mean([m for _, m in aug]))
        z = (augm - ms.mean()) / (ms.std() or 1)
        print(f"days with 9+ games observed : {len(full)}  ({full[0][0]} -> {full[-1][0]})")
        print(f"mean cross-game residual z, all days      : {ms.mean():+.3f}  (sd {ms.std():.3f})")
        print(f"mean over 2026-08-12..08-24 ({len(aug)} days)  : {augm:+.3f}   z = {z:+.2f}")
        print()
        print("Note the window is only comparable across the span where 9+ games are")
        print("observed simultaneously, which is itself recent — so this compares August")
        print("against a mostly-recent reference, not against the full panel.")
