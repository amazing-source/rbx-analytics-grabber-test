"""Where in the first week do players actually leave?

Brainrot is EXCLUDED. Ren: it died of verified data wipes and a broken core loop
over seven days, so it is evidence about one incident, not about structural
retention, and including it muddies the portfolio question.

The level of a cohort curve says where a game ended up. The CONDITIONAL step —
of the players present on day N, what share return on N+1 — says where it lost
them. Only the second is actionable.

Roblox day indexing: CohortDay 2 is the player's THIRD day.
"""
import csv, os, collections, re, statistics

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAMES = {
    "10638354731": "Seal", "10399712766": "Banana", "10030829154": "Waterslide",
    "10565445771": "Verity", "9758414065": "Climb Up Mtn",
    "8507699752": "Poison Treats", "7888930431": "Moon Incremental",
}

print("CONDITIONAL SURVIVAL — of the cohort present on day N, what share return on N+1?\n")
print(f"{'game':15s}" + "".join(f"{f'd{k}->d{k+1}':>9s}" for k in range(1, 7)) + f"{'floor':>9s}")
for uid, name in GAMES.items():
    f = os.path.join(ROOT, "data", "games", uid, "metrics", "DailyCohortRetention.csv")
    if not os.path.exists(f):
        continue
    per = collections.defaultdict(list)
    for r in csv.DictReader(open(f, encoding="utf-8")):
        if not r.get("value"):
            continue
        m = re.search(r"CohortDay: (\d+)", r.get("series") or "")
        if m:
            per[int(m.group(1))].append(float(r["value"]))
    v = {k: statistics.mean(x) for k, x in per.items()}
    if 1 not in v or len(v) < 3:
        print(f"{name:15s}{'insufficient CohortDay coverage':>60s}")
        continue
    row = f"{name:15s}"
    for k in range(1, 7):
        row += (f"{100*v[k+1]/v[k]:>8.0f}%" if k in v and k + 1 in v and v[k] else f"{'—':>9s}")
    row += f"{100*v[max(v)]:>8.2f}%"
    print(row)

print("\nfloor = the share of a cohort that becomes a real player — the multiplier")
print("between traffic and DAU, and the number that actually differs across games.")
print("\nThe loss is concentrated in the 2nd and 3rd visit; by day 5 survival is")
print("72-97% and the curve is flat. Every funnel in the portfolio measures the")
print("FIRST session only, so this locates WHEN players leave and cannot show WHY.")
