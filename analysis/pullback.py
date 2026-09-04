"""Phase 1 — detect RFY pullback events objectively, then sensitivity-test them.

The rule is fixed HERE, before any other metric is inspected, so J0 cannot be
chosen to suit a story. Definition:

  reach   = UniqueUsersWithImpressions filtered to AcquisitionSource:
            HomeRecommendation  (NOT the all-source total, which mixes in
            Friends and Search and blunts the signal being dated)
  peak    = the maximum of the 3-day mean over the game's served span
  J0      = the first day at or after the peak where the 3-day mean is below
            THRESH x peak and stays below for HOLD consecutive days

Reported at THRESH in {0.60, 0.70, 0.80} x HOLD in {3, 5, 7} = 9 settings.
An event that only exists at one setting is not an event, and is labelled so.

A game may have several expansion/pullback cycles. After a J0 is recorded the
scan restarts from the next day the 3-day mean regains THRESH x peak, using the
running maximum from that point, so a second surge produces a second event.
"""
import csv, os, collections, datetime, statistics, json

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
THRESHOLDS = [0.60, 0.70, 0.80]
HOLDS = [3, 5, 7]


def home_reach(uid):
    """Daily Home-recommendation impressions, settled, gap-fills excluded."""
    out = {}
    f = os.path.join(OUT, "by_source.csv")
    for r in csv.DictReader(open(f, encoding="utf-8")):
        if r["universe"] != uid or r["metric"] != "UniqueUsersWithImpressions":
            continue
        if r["source"] != "HomeRecommendation":
            continue
        # unfiltered only — a population-filtered copy of the same source is a
        # different series and must not be mixed into the J0 input
        if r.get("filters"):
            continue
        out[r["date"]] = float(r["value"])
    return out


def ma(seq, n=3):
    return [statistics.mean(seq[max(0, i - n + 1):i + 1]) if i >= n - 1 else float("nan")
            for i in range(len(seq))]


def detect(dates, vals, thresh, hold):
    """All pullback events under one (thresh, hold) setting."""
    m = ma(vals)
    events, i, n = [], 0, len(vals)
    while i < n:
        # running peak of the 3-day mean from i onward
        seg = [x for x in m[i:] if x == x]
        if not seg:
            break
        peak = max(seg)
        pk_idx = i + m[i:].index(peak)
        j0 = None
        for k in range(pk_idx, n - hold + 1):
            if all(m[k + h] == m[k + h] and m[k + h] < thresh * peak for h in range(hold)):
                j0 = k
                break
        if j0 is None:
            break
        events.append({"peak_date": dates[pk_idx], "peak": peak,
                       "j0": dates[j0], "j0_value": m[j0],
                       "drop_pct": 100 * (m[j0] / peak - 1)})
        # restart once reach recovers above the threshold band
        nxt = None
        for k in range(j0 + hold, n):
            if m[k] == m[k] and m[k] >= thresh * peak:
                nxt = k
                break
        if nxt is None:
            break
        i = nxt
    return events


results = collections.defaultdict(dict)
for uid, name in GAMES.items():
    s = home_reach(uid)
    ds = sorted(d for d in s if s[d] > 0)
    if len(ds) < 21:
        results[uid]["error"] = f"only {len(ds)} days of Home reach"
        continue
    vals = [s[d] for d in ds]
    for t in THRESHOLDS:
        for h in HOLDS:
            results[uid][f"{t}|{h}"] = detect(ds, vals, t, h)
    results[uid]["span"] = (ds[0], ds[-1], len(ds))

# ---------------------------------------------------------------- report
print("PHASE 1 — pullback events, sensitivity across 9 settings\n")
print(f"{'game':20s}{'Home reach span':>26s}{'events @0.70/3':>16s}{'J0 @0.70/3':>13s}{'settings firing':>17s}")
canonical = {}
for uid, name in GAMES.items():
    r = results[uid]
    if "error" in r:
        print(f"{name:20s}{r['error']:>26s}")
        continue
    a, b, n = r["span"]
    base = r.get("0.7|3", [])
    fired = sum(1 for k, v in r.items() if "|" in str(k) and v)
    j0 = base[0]["j0"] if base else "—"
    canonical[uid] = base
    print(f"{name:20s}{a+' -> '+b+f' ({n}d)':>26s}{len(base):>16d}{j0:>13s}{str(fired)+'/9':>17s}")

print("\n\nPer-game detail at the canonical setting (0.70 x 3 days)\n")
for uid, name in GAMES.items():
    r = results[uid]
    if "error" in r:
        continue
    evs = r.get("0.7|3", [])
    if not evs:
        print(f"{name} — NO PULLBACK detected at any of the 9 settings"
              if not any(v for k, v in r.items() if "|" in str(k))
              else f"{name} — none at 0.70/3, but fires at other settings")
        continue
    for e in evs:
        # how many of the 9 settings produce a J0 within +/- 5 days of this one
        agree = 0
        for k, v in r.items():
            if "|" not in str(k):
                continue
            for e2 in v:
                d1 = datetime.date.fromisoformat(e["j0"])
                d2 = datetime.date.fromisoformat(e2["j0"])
                if abs((d1 - d2).days) <= 5:
                    agree += 1
                    break
        label = ("robust" if agree >= 7 else "moderate" if agree >= 4 else "FRAGILE")
        print(f"{name:20s} peak {e['peak_date']} ({e['peak']:>12,.0f})  ->  "
              f"J0 {e['j0']}  {e['drop_pct']:+6.1f}%   agreement {agree}/9 [{label}]")

json.dump({u: {k: v for k, v in r.items()} for u, r in results.items()},
          open(os.path.join(OUT, "pullbacks.json"), "w"), indent=1, default=str)
print(f"\nwrote analysis/panel/pullbacks.json")
