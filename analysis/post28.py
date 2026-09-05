"""Post-update read on the five games that shipped 2026-08-28.

Publishes (root place, exact from place-versions):
  Banana Monkey v1244  08-28 14:26Z
  Brainrot      v607   08-28 15:21Z
  Verity        v679   08-28 19:53Z   (then v680 08-31 15:10Z)
  Waterslide    v1716  08-28 21:02Z
  Seal          v908   08-28 21:36Z

2026-08-28 is EXCLUDED from both windows — servers cycle onto a new build over
1-3 hours, so that day is a blend of both versions and is neither a before nor
an after.

A naive before/after would charge the update for whatever the game was already
doing, and every one of these games was already moving. So each metric is
reported three ways:
  step        post mean vs pre mean
  trend       what the pre-period slope alone predicted for the post window
  excess      step minus trend — what is left once the existing slide is removed
Only `excess` is evidence about the update.
"""
import csv, os, collections, datetime, statistics
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "analysis", "panel")
PRE = ("2026-08-21", "2026-08-27")
POST = ("2026-08-29", "2026-09-03")
GAMES = {
    "10399712766": "Banana Monkey", "9963622286": "Brainrot",
    "10565445771": "Verity", "10030829154": "Waterslide",
    "10638354731": "Seal",
}
METRICS = [
    ("DailyActiveUsers", "DAU", "volume"),
    ("DailyRevenue", "revenue R$", "volume"),
    ("PayingUsers", "paying users", "volume"),
    ("AverageRevenuePerUser", "ARPDAU", "rate"),
    ("ForwardD1Retention", "D1 retention", "rate"),
    ("AverageSessionLengthMinutes", "session min", "rate"),
    ("AveragePlayTimeMinutesPerDAU", "playtime/DAU", "rate"),
    ("DauMauStickiness", "stickiness", "rate"),
    ("RFYPlayThroughRate", "RFY PTR", "rate"),
    ("RFYDuration0To60", "RFY bounce<60", "rate"),
    ("RFYD1Playtime", "RFY D1 playtime", "rate"),
    ("RFYD2To7PlayDays", "RFY D2-7 days", "rate"),
    ("ClientCrashRate15m", "crash rate", "rate"),
    ("ClientFpsP10", "FPS p10", "rate"),
    ("ErrorCount", "errors", "volume"),
    ("PeakConcurrentPlayers", "peak CCU", "volume"),
    ("ConcurrentPlayers", "CCU", "volume"),
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
        home[r["universe"]][r["date"]] = float(r["value"])


def window(s, w):
    return [(d, s[d]) for d in sorted(s) if w[0] <= d <= w[1]]


def read(s):
    """-> (pre mean, post mean, step %, excess % after removing the pre-trend)"""
    pre, post = window(s, PRE), window(s, POST)
    if len(pre) < 4 or len(post) < 4:
        return None
    a = statistics.mean(v for _, v in pre)
    b = statistics.mean(v for _, v in post)
    if a == 0:
        return None
    step = 100 * (b / a - 1)
    # NO trend subtraction. Two attempts at it produced nonsense — a linear fit
    # on 7 days of a collapsing series predicts negative values, and a log-linear
    # one predicts near-zero, so both reported an 'excess' of +60% to +190% on
    # metrics that actually FELL by half. Seven pre-days on a game in freefall
    # cannot support extrapolation, and a number that cannot be computed should
    # not be printed. Report the pre-window's own decay rate instead and let the
    # reader judge whether the step is more than a continuation.
    x = np.arange(len(pre), dtype=float)
    yv = np.array([v for _, v in pre], float)
    rate = float("nan")
    if (yv > 0).all():
        m, _ = np.polyfit(x, np.log(yv), 1)
        rate = 100 * (np.exp(m) - 1)          # %/day during the pre-window
    return (a, b, step, rate)


print("POST-UPDATE READ — five games, all shipped 2026-08-28")
print(f"pre {PRE[0]}..{PRE[1]}   post {POST[0]}..{POST[1]}   (08-28 excluded, blended)\n")
print("'excess' = the move left after the pre-update trend is projected forward.")
print("It is the only column that is evidence about the update.\n")

for uid, name in GAMES.items():
    print(f"=== {name} ===")
    print(f"   {'metric':20s}{'pre':>13s}{'post':>13s}{'step':>9s}{'pre %/day':>11s}")
    h = read(home.get(uid, {}))
    if h:
        print(f"   {'Home reach':20s}{h[0]:>13,.0f}{h[1]:>13,.0f}{h[2]:>8.1f}%{h[3]:>10.2f}%")
    for m, lab, kind in METRICS:
        v = read(daily.get((uid, m), {}))
        if not v:
            continue
        a, b, step, exc = v
        fmt = "{:>13,.0f}" if kind == "volume" else "{:>13.4f}"
        # 6 post days: a continuation would show step ~= 6 x the daily rate
        expected = 6 * exc if exc == exc else float("nan")
        flag = "  <-- beyond trend" if (expected == expected and step < expected - 12) else ""
        print(f"   {lab:20s}" + fmt.format(a) + fmt.format(b) +
              f"{step:>8.1f}%{exc:>10.2f}%{flag}")
    print()
