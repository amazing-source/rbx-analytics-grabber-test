"""Phase 3 (explore -> expand) and Phase 4 (acquisition-source quality).

PHASE 3 asks the discriminating question: when Roblox scales an experience, does
the marginal player behave worse, or is it just dilution?

  dilution         PTR falls, but bounce / playtime / play-days HOLD
  failure at scale PTR falls AND bounce rises AND play-days fall

Method: partial correlation of each signal against log Home reach, controlling
for a linear time trend AND weekday. The trend control is not optional — on a
young game, reach is almost perfectly collinear with time-since-launch (r=+0.81
measured on Seal), so without it novelty decay reads as audience dilution.

PHASE 4 compares acquisition sources on downstream quality, WEIGHTED by
UniqueUsersWithPlaySessions. Rates alone mislead: on Seal, Friends converts at
40.5% against Home's 19.5%, which reads as the better channel until you see
343,887 users against 2,084,897.

Kept strictly separate from Phase 3: aggregate acquisition quality is NOT an RFY
ranking signal. Roblox states the ranking runs on RFY-acquired behaviour.
"""
import csv, os, collections, datetime, math
import numpy as np
try:
    from scipy import stats
    HAVE = True
except ImportError:
    HAVE = False

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

daily = collections.defaultdict(dict)
for r in csv.DictReader(open(os.path.join(OUT, "daily.csv"), encoding="utf-8")):
    for k, v in r.items():
        if k in ("universe", "game", "date", "filled_zero_metrics") or v == "":
            continue
        try:
            daily[(r["universe"], k)][r["date"]] = float(v)
        except ValueError:
            pass

home = collections.defaultdict(dict)
src = collections.defaultdict(dict)   # (uid, source, metric) -> date -> value
for r in csv.DictReader(open(os.path.join(OUT, "by_source.csv"), encoding="utf-8")):
    if r.get("filters"):
        continue
    src[(r["universe"], r["source"], r["metric"])][r["date"]] = float(r["value"])
    if r["metric"] == "UniqueUsersWithImpressions" and r["source"] == "HomeRecommendation":
        v = float(r["value"])
        if v > 0:
            home[r["universe"]][r["date"]] = v

SIG = [("RFYPlayThroughRate", "PTR", +1),
       ("RFYDuration0To60", "bounce<60", -1),
       ("RFYDuration61To180", "bounce61-180", -1),
       ("RFYD1Playtime", "D1 playtime", +1),
       ("RFYD1QualifiedPlaySessions", "D1 qual sess", +1),
       ("RFYD2To7PlayDays", "D2-7 playdays", +1),
       ("RFYD2To7Playtime", "D2-7 playtime", +1),
       ("RFYD8To28PlayDays", "D8-28 playdays", +1)]


def partial(uid, metric):
    """corr(log home reach, signal | linear trend + weekday). -> (r, p, n)"""
    h, s = home.get(uid, {}), daily.get((uid, metric), {})
    ds = sorted(set(h) & set(s))
    if len(ds) < 25:
        return None
    x = np.log([h[d] for d in ds])
    y = np.array([s[d] for d in ds], dtype=float)
    t = np.arange(len(ds), dtype=float)
    dow = np.array([datetime.date.fromisoformat(d).weekday() for d in ds])
    X = np.column_stack([np.ones(len(ds)), t] + [(dow == k).astype(float) for k in range(1, 7)])
    def res(v):
        b, *_ = np.linalg.lstsq(X, v, rcond=None)
        return v - X @ b
    rx, ry = res(x), res(y)
    if rx.std() == 0 or ry.std() == 0:
        return None
    r = float(np.corrcoef(rx, ry)[0, 1])
    dof = len(ds) - X.shape[1] - 1
    if dof <= 1:
        return None
    tstat = r * math.sqrt(dof / max(1e-12, 1 - r * r))
    p = float(2 * (1 - stats.t.cdf(abs(tstat), dof))) if HAVE else float("nan")
    return (r, p, len(ds))


print("=" * 78)
print("PHASE 3 — does quality survive the expansion?")
print("partial corr(log Home reach, signal | trend + weekday).  * = p<0.05")
print("bounce rows: NEGATIVE is good (bounce falls as reach rises)")
print("=" * 78)
hdr = f"{'game':20s}" + "".join(f"{lab[:11]:>13s}" for _, lab, _ in SIG)
print(hdr)
verdicts = {}
for uid, name in GAMES.items():
    row, good, bad, n_sig = f"{name:20s}", 0, 0, 0
    for m, lab, sign in SIG:
        v = partial(uid, m)
        if not v:
            row += f"{'—':>13s}"
            continue
        r, p, n = v
        star = "*" if p < 0.05 else " "
        row += f"{r:>+12.2f}{star}"
        if p < 0.05 and lab != "PTR":
            n_sig += 1
            if r * sign > 0:
                good += 1
            else:
                bad += 1
    print(row)
    if n_sig:
        verdicts[name] = ("quality HOLDS" if good > bad * 2 else
                          "quality FAILS at scale" if bad > good else "mixed", good, bad)

print("\nverdict per game (PTR excluded — Roblox documents PTR dilution as normal):")
for n, (v, g, b) in verdicts.items():
    print(f"  {n:20s} {v:24s} ({g} signals better with reach, {b} worse)")
print("\nDilution = PTR falls while downstream holds. Failure at scale = downstream")
print("falls too. Only the second is a product problem.")

print("\n\n" + "=" * 78)
print("PHASE 4 — acquisition-source quality, weighted by volume")
print("=" * 78)
SOURCES = ["HomeRecommendation", "Search", "Friends", "SponsoredAds", "Others", "Charts"]
for uid, name in GAMES.items():
    rows = []
    for s in SOURCES:
        users = src.get((uid, s, "UniqueUsersWithPlaySessions"), {})
        cvr = src.get((uid, s, "EndToEndCVR"), {})
        d7 = src.get((uid, s, "AttributionD7RetentionRatio"), {})
        pt = src.get((uid, s, "Attribution7DPlaytimePerUserInMinutes"), {})
        rev = src.get((uid, s, "Attribution30DRobuxPerUser"), {})
        if not users:
            continue
        tot = sum(users.values())
        if tot <= 0:
            continue
        mean = lambda d: (sum(d.values()) / len(d)) if d else float("nan")
        rows.append((s, tot, mean(cvr), mean(d7), mean(pt), mean(rev)))
    if not rows:
        continue
    grand = sum(r[1] for r in rows)
    print(f"\n  {name}")
    print(f"     {'source':20s}{'users':>12s}{'share':>8s}{'CVR':>9s}{'D7':>9s}{'7d play':>9s}{'30d R$':>9s}")
    for s, tot, cvr, d7, pt, rev in sorted(rows, key=lambda r: -r[1]):
        f = lambda v: f"{v:.4f}" if v == v else "—"
        print(f"     {s:20s}{tot:>12,.0f}{100*tot/grand:>7.1f}%{f(cvr):>9s}{f(d7):>9s}"
              f"{(f'{pt:.1f}' if pt==pt else '—'):>9s}{(f'{rev:.3f}' if rev==rev else '—'):>9s}")
