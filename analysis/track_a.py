"""Track A — what moved before the six pre-RFY pullbacks.

These six events are on the games that peaked and died before Roblox served the
RFY ranking signals, so this asks the Phase-2 question with behaviour only:
does anything a studio controls deteriorate BEFORE Home distribution is pulled?

Windows, per the brief:
    J-28 .. J-8   baseline
    J-7  .. J-1   leading indicator window
    J0            pullback begins
    J+1  .. J+7   immediate consequence
    J+8  .. J+28  matured outcome

Two readings per metric per event:
  * LEAD SHIFT — mean(J-7..J-1) vs mean(J-28..J-8), expressed as a z-score
    against the baseline window's own day-to-day variation, so metrics on wildly
    different scales are comparable and a noisy series cannot look decisive.
  * DIRECTION — a symmetric Granger-style test on daily log-differences over the
    whole J-28..J+28 span. BOTH directions get the same 1..7 lag search and the
    same Sidak correction for that search; an asymmetric search manufactured five
    false "signal leads reach" results in earlier work.

Multiplicity is severe: 12 metrics x 6 events x 2 directions = 144 tests. At
p<0.05 about seven hits are expected by chance alone, so a single significant
result is reported as noise unless it repeats across events.
"""
import csv, os, collections, datetime, statistics, math

try:
    from scipy import stats
    HAVE_SCIPY = True
except ImportError:
    HAVE_SCIPY = False

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "analysis", "panel")

EVENTS = [
    ("8507699752", "Poison Treats", "2025-12-01", -33.2),
    ("7364907416", "Plane Training", "2025-05-06", -40.3),
    ("7364907416", "Plane Training", "2025-09-22", -32.2),
    ("8669915245", "Don't Wake Police", "2025-10-13", -30.6),
    ("9758414065", "Climb Up Mountain", "2026-04-07", -42.1),
    ("7888930431", "Moon Incremental", "2026-04-15", -38.0),
]

# metric -> (short label, +1 if higher is better)
METRICS = {
    "ForwardD1Retention": ("D1 retention", +1),
    "ForwardD7Retention": ("D7 retention", +1),
    "AverageSessionLengthMinutes": ("session length", +1),
    "AveragePlayTimeMinutesPerDAU": ("playtime/DAU", +1),
    "DauMauStickiness": ("stickiness", +1),
    "EndToEndCVR": ("impression->play CVR", +1),
    "PayingUsersCVR": ("payer CVR", +1),
    "AverageRevenuePerUser": ("ARPDAU", +1),
    "AverageRevenuePerPayingUser": ("ARPPU", +1),
    "DailyActiveUsers": ("DAU", +1),
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
for r in csv.DictReader(open(os.path.join(OUT, "by_source.csv"), encoding="utf-8")):
    if r["metric"] == "UniqueUsersWithImpressions" and r["source"] == "HomeRecommendation":
        home[r["universe"]][r["date"]] = float(r["value"])


def window(series, j0, lo, hi):
    d0 = datetime.date.fromisoformat(j0)
    out = []
    for k in range(lo, hi + 1):
        d = (d0 + datetime.timedelta(days=k)).isoformat()
        if d in series:
            out.append(series[d])
    return out


def ols_p(y, X, j):
    b, *_ = np.linalg.lstsq(X, y, rcond=None)
    e = y - X @ b
    dof = len(y) - X.shape[1]
    if dof <= 0:
        return 1.0
    cov = (e @ e / dof) * np.linalg.pinv(X.T @ X)
    se = math.sqrt(max(cov[j, j], 1e-30))
    t = b[j] / se
    if not HAVE_SCIPY:
        return 2 * math.exp(-0.717 * abs(t) - 0.416 * t * t)
    return float(2 * (1 - stats.t.cdf(abs(t), dof)))


LAGS = range(1, 8)


def minp(cause, effect):
    best = (None, 1.0)
    for k in LAGS:
        n = len(effect)
        if n - k < 20:
            continue
        X = np.column_stack([np.ones(n - k), effect[k - 1:-1], cause[:-k]])
        p = ols_p(effect[k:], X, 2)
        if p < best[1]:
            best = (k, p)
    k, p = best
    return k, 1 - (1 - p) ** len(list(LAGS))


print("TRACK A — the six pre-RFY pullbacks, behaviour only\n")
print("LEAD SHIFT: mean(J-7..J-1) vs mean(J-28..J-8), as z against baseline variation.")
print("Negative = deteriorating before the pullback. |z|>2 flagged.\n")

hdr = f"{'metric':24s}" + "".join(f"{n[:9]:>11s}" for _, n, _, _ in EVENTS)
print(hdr)
print("-" * len(hdr))
lead_table = collections.defaultdict(dict)
for m, (label, good) in METRICS.items():
    row = f"{label:24s}"
    for uid, name, j0, _ in EVENTS:
        s = daily.get((uid, m), {})
        base = window(s, j0, -28, -8)
        lead = window(s, j0, -7, -1)
        if len(base) < 10 or len(lead) < 4:
            row += f"{'-':>11s}"
            continue
        sd = statistics.pstdev(base)
        z = (statistics.mean(lead) - statistics.mean(base)) / sd if sd > 0 else 0.0
        z *= good
        lead_table[m][name + j0] = z
        row += f"{z:>+10.1f}{'*' if abs(z) > 2 else ' '}"
    print(row)

print("\n\nDIRECTION: does the signal lead Home reach, or follow it?")
print("Symmetric 1-7 lag search both ways, Sidak-corrected. 144 tests in total —")
print("about 7 hits at p<0.05 are expected by chance, so single hits mean nothing.\n")

counts = collections.Counter()
detail = []
for uid, name, j0, drop in EVENTS:
    h = home.get(uid, {})
    hw = {}
    d0 = datetime.date.fromisoformat(j0)
    for k in range(-28, 29):
        d = (d0 + datetime.timedelta(days=k)).isoformat()
        if d in h and h[d] > 0:
            hw[d] = h[d]
    hd = sorted(hw)
    if len(hd) < 30:
        print(f"{name} {j0}: only {len(hd)} days of Home reach in window — skipped")
        continue
    dR = np.diff(np.log([hw[d] for d in hd]))
    for m, (label, good) in METRICS.items():
        s = daily.get((uid, m), {})
        vals = [s.get(d) for d in hd]
        if any(v is None for v in vals) or len(vals) < 31:
            continue
        dS = np.diff(np.array(vals, dtype=float))
        n = min(len(dR), len(dS))
        k1, p1 = minp(dS[:n], dR[:n])
        k2, p2 = minp(dR[:n], dS[:n])
        v = ("LEADS" if p1 < .05 <= p2 else "follows" if p2 < .05 <= p1
             else "both" if p1 < .05 and p2 < .05 else "neither")
        counts[(label, v)] += 1
        if v in ("LEADS", "both"):
            detail.append((name, j0, label, k1, p1, k2, p2, v))

print(f"{'metric':24s}{'LEADS':>8s}{'follows':>9s}{'both':>6s}{'neither':>9s}")
for m, (label, good) in METRICS.items():
    print(f"{label:24s}{counts[(label,'LEADS')]:>8d}{counts[(label,'follows')]:>9d}"
          f"{counts[(label,'both')]:>6d}{counts[(label,'neither')]:>9d}")

if detail:
    print("\nEvery event where a signal led reach:")
    for name, j0, label, k1, p1, k2, p2, v in detail:
        print(f"  {name:20s} {j0}  {label:22s} lead k={k1} p={p1:.3f} | rev k={k2} p={p2:.3f}  [{v}]")
else:
    print("\nNo signal led Home reach in any of the six events.")

# ---------------------------------------------------------------- PLACEBO
# The same test at dates where no pullback was detected. If "LEADS" appears
# about as often at fake cut dates as at real ones, the result is measuring the
# trending shape of a game's lifecycle, not the event. This check is the reason
# an earlier analysis did not publish "Seal's update cost 71% of DAU, p=0.002".
print("\n\nPLACEBO — identical test at cut dates with no detected pullback\n")

real = {(u, j0) for u, _, j0, _ in EVENTS}
placebo_counts = collections.Counter()
n_placebo = 0
for uid, name, j0, _ in EVENTS:
    h = home.get(uid, {})
    hd_all = sorted(d for d in h if h[d] > 0)
    d0 = datetime.date.fromisoformat(j0)
    for offset in (-90, -60, +60, +90):
        fake = (d0 + datetime.timedelta(days=offset)).isoformat()
        if any(abs((datetime.date.fromisoformat(fake) -
                    datetime.date.fromisoformat(r)).days) < 30
               for u2, r in real if u2 == uid):
            continue
        hw = {}
        fd = datetime.date.fromisoformat(fake)
        for k in range(-28, 29):
            d = (fd + datetime.timedelta(days=k)).isoformat()
            if d in h and h[d] > 0:
                hw[d] = h[d]
        hd = sorted(hw)
        if len(hd) < 30:
            continue
        n_placebo += 1
        dR = np.diff(np.log([hw[d] for d in hd]))
        for m, (label, good) in METRICS.items():
            s = daily.get((uid, m), {})
            vals = [s.get(d) for d in hd]
            if any(v is None for v in vals) or len(vals) < 31:
                continue
            dS = np.diff(np.array(vals, dtype=float))
            n = min(len(dR), len(dS))
            k1, p1 = minp(dS[:n], dR[:n])
            k2, p2 = minp(dR[:n], dS[:n])
            v = ("LEADS" if p1 < .05 <= p2 else "follows" if p2 < .05 <= p1
                 else "both" if p1 < .05 and p2 < .05 else "neither")
            placebo_counts[(label, v)] += 1

real_leads = sum(counts[(l, "LEADS")] for l, _ in METRICS.values())
real_both = sum(counts[(l, "both")] for l, _ in METRICS.values())
pl_leads = sum(placebo_counts[(l, "LEADS")] for l, _ in METRICS.values())
pl_both = sum(placebo_counts[(l, "both")] for l, _ in METRICS.values())
n_real = len(EVENTS)

print(f"{'':24s}{'real events':>14s}{'placebo cuts':>15s}")
print(f"{'windows tested':24s}{n_real:>14d}{n_placebo:>15d}")
if n_placebo:
    print(f"{'LEADS per window':24s}{real_leads/n_real:>14.2f}{pl_leads/n_placebo:>15.2f}")
    print(f"{'both per window':24s}{real_both/n_real:>14.2f}{pl_both/n_placebo:>15.2f}")
    print()
    print(f"{'metric':24s}{'real LEADS':>12s}{'placebo LEADS':>15s}")
    for m, (label, good) in METRICS.items():
        print(f"{label:24s}{counts[(label,'LEADS')]:>12d}"
              f"{placebo_counts[(label,'LEADS')]:>15d}")
    print("\nIf the placebo rate matches the real rate, the test is detecting a")
    print("game's decline shape, not the pullback. Only a metric that leads at real")
    print("cut dates and NOT at fake ones is a candidate leading indicator.")
else:
    print("no usable placebo windows — every offset landed inside another event")
