"""Phase 7 — can a pullback be predicted from information available before J0?

Framed to avoid the two ways this goes wrong.

LEAKAGE. Every feature is built only from data dated <= the prediction day, and
the label looks FORWARD. Nothing from J0 or after enters a feature.

CIRCULARITY. J0 is DEFINED on Home reach, so any reach-derived feature predicts
it trivially. Reach features are therefore excluded from the model and reported
separately as the BASELINE to beat. The real question is whether behaviour and
the RFY signals add anything over "reach is already falling".

Validation is leave-one-GAME-out, never random rows: days from one game are
serially correlated, so a random split lets the model memorise a game rather
than learn a pattern.

Model is logistic regression with standardised features — interpretable, and with
~18 positives anything with more capacity would fit noise.
"""
import csv, os, collections, datetime, json, math, random
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "analysis", "panel")
HORIZON = 7          # predict a J0 occurring within the next 7 days
LOOKBACK = 7         # feature = change over the trailing 7 days

GAMES = {
    "8507699752": "Poison Treats", "9963622286": "Become a Brainrot",
    "9610561918": "My Knife Farm", "7364907416": "Plane Training",
    "10030829154": "Climb Waterslide", "10399712766": "+1 Banana Monkey",
    "9758414065": "Climb Up Mountain", "10565445771": "Verity Companion",
    "8669915245": "Don't Wake Police", "10638354731": "Seal A Driveway",
    "10192528661": "KameHameHa Walls", "7888930431": "Moon Incremental",
}
FEATURES = [
    "ForwardD1Retention", "AverageSessionLengthMinutes", "AveragePlayTimeMinutesPerDAU",
    "DauMauStickiness", "PayingUsersCVR", "AverageRevenuePerUser",
    "RFYPlayThroughRate", "RFYDuration0To60", "RFYD1Playtime", "RFYD2To7PlayDays",
]

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
for r in csv.DictReader(open(os.path.join(OUT, "by_source.csv"), encoding="utf-8")):
    if (r["metric"] == "UniqueUsersWithImpressions" and r["source"] == "HomeRecommendation"
            and not r.get("filters")):
        v = float(r["value"])
        if v > 0:
            home[r["universe"]][r["date"]] = v

ev = json.load(open(os.path.join(OUT, "pullbacks.json")))
j0s = collections.defaultdict(list)
for u in GAMES:
    for e in (ev.get(u, {}) or {}).get("0.7|3") or []:
        j0s[u].append(datetime.date.fromisoformat(e["j0"]))

X, y, groups, meta, base_reach, base_age = [], [], [], [], [], []
for uid in GAMES:
    h = home.get(uid, {})
    ds = sorted(h)
    if len(ds) < 45:
        continue
    peak_so_far, peak_day = 0.0, None
    for i, d in enumerate(ds):
        if h[d] > peak_so_far:
            peak_so_far, peak_day = h[d], d
        if i < LOOKBACK + 7:
            continue
        dd = datetime.date.fromisoformat(d)
        # label: does a J0 fall in (d, d+HORIZON]?
        lab = int(any(0 < (j - dd).days <= HORIZON for j in j0s[uid]))
        # never train on a day at/after a J0 — that is the event, not its run-up
        if any((j - dd).days <= 0 for j in j0s[uid]):
            continue
        prev = ds[i - LOOKBACK]
        feats = []
        ok = True
        for m in FEATURES:
            s = daily.get((uid, m), {})
            a, b = s.get(prev), s.get(d)
            if a is None or b is None or a == 0:
                ok = False
                break
            feats.append((b - a) / abs(a))          # trailing 7-day relative change
        if not ok:
            continue
        X.append(feats); y.append(lab); groups.append(uid)
        meta.append((GAMES[uid], d))
        base_reach.append((h[d] / peak_so_far) - 1.0)                     # reach vs own peak
        base_age.append((dd - datetime.date.fromisoformat(peak_day)).days)

X = np.array(X, float); y = np.array(y, int)
groups = np.array(groups); base_reach = np.array(base_reach, float)
base_age = np.array(base_age, float)
print(f"rows {len(y)}   positives {y.sum()} ({100*y.mean():.1f}%)   "
      f"games {len(set(groups))}   features {X.shape[1]}")
if y.sum() < 8:
    print("too few positives to model — stopping"); raise SystemExit

def fit(Xtr, ytr, iters=400, lr=0.2, l2=1.0):
    mu, sd = Xtr.mean(0), Xtr.std(0)
    sd[sd == 0] = 1
    Z = np.column_stack([np.ones(len(Xtr)), (Xtr - mu) / sd])
    w = np.zeros(Z.shape[1])
    for _ in range(iters):
        p = 1 / (1 + np.exp(-Z @ w))
        g = Z.T @ (p - ytr) / len(ytr)
        g[1:] += l2 * w[1:] / len(ytr)
        w -= lr * g
    return w, mu, sd

def predict(w, mu, sd, Xte):
    Z = np.column_stack([np.ones(len(Xte)), (Xte - mu) / sd])
    return 1 / (1 + np.exp(-Z @ w))

def auc(yt, s):
    pos, neg = s[yt == 1], s[yt == 0]
    if len(pos) == 0 or len(neg) == 0:
        return float("nan")
    return float((pos[:, None] > neg[None, :]).mean()
                 + 0.5 * (pos[:, None] == neg[None, :]).mean())

print("\nLEAVE-ONE-GAME-OUT\n")
print(f"{'held-out game':20s}{'n':>6s}{'pos':>5s}{'model AUC':>11s}{'reach AUC':>11s}{'age AUC':>9s}")
rows = []
for g in sorted(set(groups)):
    tr, te = groups != g, groups == g
    if y[te].sum() == 0 or y[tr].sum() < 5:
        print(f"{GAMES[g]:20s}{te.sum():>6d}{int(y[te].sum()):>5d}{'—  no positives':>31s}")
        continue
    w, mu, sd = fit(X[tr], y[tr])
    a_m = auc(y[te], predict(w, mu, sd, X[te]))
    a_r = auc(y[te], -base_reach[te])     # more negative reach-vs-peak = more at risk
    a_a = auc(y[te], base_age[te])        # older past peak = more at risk
    rows.append((a_m, a_r, a_a))
    print(f"{GAMES[g]:20s}{te.sum():>6d}{int(y[te].sum()):>5d}{a_m:>11.3f}{a_r:>11.3f}{a_a:>9.3f}")

if rows:
    m = np.array(rows)
    print(f"\n{'MEAN':20s}{'':>11s}{m[:,0].mean():>11.3f}{m[:,1].mean():>11.3f}{m[:,2].mean():>9.3f}")
    print("\n0.5 = coin flip. The model uses NO reach feature; the two baselines are")
    print("reach-relative-to-own-peak and days-since-peak, both purely reach-derived.")
    beat = sum(1 for a, r, ag in rows if a > max(r, ag))
    print(f"model beats both baselines on {beat} of {len(rows)} held-out games.")

w, mu, sd = fit(X, y)
print("\nCoefficients on the full sample (standardised; sign = direction of risk):")
for name, c in sorted(zip(FEATURES, w[1:]), key=lambda kv: -abs(kv[1])):
    print(f"   {name:34s}{c:+7.3f}")
print("\nWith ~%d positives across %d games these coefficients are unstable and are"
      % (y.sum(), len(set(groups))))
print("hypothesis generation, not a finding. Read the LOGO table, not these.")
