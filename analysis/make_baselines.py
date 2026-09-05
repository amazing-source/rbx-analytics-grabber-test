"""Freeze the pre-update baseline for the five games shipping 2026-09-04.

Numbers come from the panel; the tripwires are judgement and are written HERE,
before any post-update number is read. Per baselines/README.md, nothing in the
generated file may be edited afterwards — follow-ups append a section.
"""
import csv, os, statistics, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "2026-09-03"            # last fully settled day, pre-update on all five
WK = ("2026-08-28", "2026-09-03")

GAMES = {
    "10399712766": ("Banana Monkey", "+1 Banana Monkey Destruction", "banana"),
    "10638354731": ("Seal", "Seal A Driveway", "seal"),
    "9963622286": ("Brainrot", "Become a Brainrot", "brainrot"),
    "10565445771": ("Verity", "Verity Companion [AI]", "verity"),
    "10030829154": ("Waterslide", "Climb Waterslide and Slide", "waterslide"),
}

ROWS = [
    ("Discovery", "UniqueUsersWithImpressions", "volume", "{:,.0f}"),
    ("Discovery", "EndToEndCVR", "rate", "{:.4f}"),
    ("Discovery", "RFYPlayThroughRate", "rate", "{:.4f}"),
    ("Discovery", "RFYDuration0To60", "rate", "{:.4f}"),
    ("Discovery", "RFYDuration61To180", "rate", "{:.4f}"),
    ("Discovery", "RFYD1Playtime", "rate", "{:.2f}"),
    ("Discovery", "RFYD2To7PlayDays", "rate", "{:.4f}"),
    ("Reach", "DailyActiveUsers", "volume", "{:,.0f}"),
    ("Reach", "MonthlyActiveUsers", "volume", "{:,.0f}"),
    ("Reach", "DauMauStickiness", "rate", "{:.4f}"),
    ("Retention", "ForwardD1Retention", "rate", "{:.4f}"),
    ("Retention", "ForwardD7Retention", "rate", "{:.4f}"),
    ("Engagement", "AverageSessionLengthMinutes", "rate", "{:.2f}"),
    ("Engagement", "AveragePlayTimeMinutesPerDAU", "rate", "{:.2f}"),
    ("Monetization", "DailyRevenue", "volume", "{:,.0f}"),
    ("Monetization", "PayingUsers", "volume", "{:,.0f}"),
    ("Monetization", "PayingUsersCVR", "rate", "{:.4f}"),
    ("Monetization", "AverageRevenuePerUser", "rate", "{:.4f}"),
    ("Monetization", "AverageRevenuePerPayingUser", "rate", "{:.2f}"),
    ("Performance", "ClientCrashRate15m", "rate", "{:.4f}"),
    ("Performance", "ClientFpsP10", "rate", "{:.2f}"),
    ("Performance", "ClientMemoryUsagePercentageAvg", "rate", "{:.4f}"),
    ("Performance", "OomUnexpectedExits", "volume", "{:,.0f}"),
    ("Performance", "ErrorCount", "volume", "{:,.0f}"),
]

# Per-game tripwires — written before any post-update number is read.
TRIP = {
    "brainrot": [
        ("ForwardD1Retention", "any settled day below 0.115", "THE reference tripwire: v546 took D1 16.8% -> 9.72% in one day and nobody looked for 8 days"),
        ("DailyRevenue (R$/day)", "below 18,000 for 2 settled days", "7d mean 51,388, already declining; a step below the trend is the signal"),
        ("AverageSessionLengthMinutes", "below 9.2", "baseline 10.22, stable to +/-5%"),
        ("ClientCrashRate15m", "above 0.0045", "7d mean 0.0032; 1.4x rule"),
        ("ErrorCount Server, settled", "above 400,000 on 09-05", "09-03 server errors 133,656; a publish spike on 09-04 is expected and is NOT a finding unless still elevated on 09-05"),
        ("OomUnexpectedExits", "above 6", "7d mean 3.7"),
        ("Downvote rate on v608", "above the v607 rate", "compute from feedback.csv asset_version"),
    ],
    "seal": [
        ("ForwardD1Retention", "below 0.105 for 2 settled days", "lowest D1 in the portfolio already; the progress-reset defect is the suspected cause"),
        ("Progress-loss mentions in feedback", "any increase in share on v>=909", "6.3% of 318 comments reported lost progress pre-update; if the update touched persistence this is the read"),
        ("AverageRevenuePerUser", "below 2.05", "09-03 = 2.596, the portfolio's best ARPDAU by 3.5x — this is the most expensive number in the set"),
        ("AverageSessionLengthMinutes", "below 13.2", "09-03 = 14.65"),
        ("RFYDuration0To60", "above 0.165", "09-03 = 0.1474; first-play bounce is the Home signal most likely to move on a bad FTUE change"),
        ("ErrorCount Server, settled", "above 60,000 on 09-05", "09-03 = 26,361"),
    ],
    "verity": [
        ("ForwardD1Retention", "below 0.115 for 2 settled days", "D1 is ordinary (~14.6%), not exceptional — the earlier '+115%, best hook' read was a cohort artifact and is retracted"),
        ("Message-cap mentions in feedback", "any increase in share", "8.6% of 2,097 comments named the refill timer/message limit; if the update changed the cap this is the primary read"),
        ("AverageSessionLengthMinutes", "below 7.8", "09-03 = 8.70, already the shortest in the portfolio"),
        ("Cohort day-2 survival", "below 0.36", "the loop dies on day 3, not day 2 — 39.0% of day-1 players survive to cohort-day 2"),
        ("OomUnexpectedExits", "above 45", "09-03 = 30, already the highest of the five"),
        ("ClientCrashRate15m", "above 0.0027", "09-03 = 0.0026, the only non-zero crash rate in the set"),
    ],
    "waterslide": [
        ("AverageRevenuePerPayingUser", "below 18.5", "09-03 = 20.96, already 66% below cohort median; the pass-ladder gap is the known structural weakness"),
        ("PayingUsersCVR", "below 0.024", "09-03 = 0.0272, the portfolio's best payer conversion and the thing not to break"),
        ("ForwardD7Retention", "below 0.008", "weakest D7 in the set; first read 2026-09-12"),
        ("ClientFpsP10", "below 33", "09-03 = 36.02, already the lowest of the five"),
        ("ErrorCount Server, settled", "above 900,000 on 09-05", "09-03 = 652,821; this game's publish signature is a 20-50x server spike that clears in 24h"),
        ("AverageSessionLengthMinutes", "below 13.0", "09-03 = 14.33"),
    ],
    "banana": [
        ("ForwardD1Retention", "below 0.115 for 2 settled days", "first read 2026-09-06"),
        ("DailyActiveUsers", "below 95,000 for 2 settled days", "09-03 = 124,158 against a 7d mean of 229,342 — already falling steeply, so the tripwire is a step below the existing slope"),
        ("AverageSessionLengthMinutes", "below 12.2", "09-03 = 13.54"),
        ("RFYDuration0To60", "above 0.125", "09-03 = 0.1091, the best first-play bounce of the five"),
        ("OomUnexpectedExits", "above 35", "7d mean 24.7"),
        ("ErrorCount Server, settled", "above 4,000 on 09-05", "09-03 = 1,023"),
    ],
}

STUDIO = {
    "brainrot": ["Which build is v608 — what shipped, and did it touch progression, saves or the rebirth path?",
                 "v546's collision/rebirth regression is the reference failure. Has that code path changed again?"],
    "seal": ["Does this update touch surface persistence? A surface currently saves at 100% or 0% and nothing between, so a rejoin mid-surface loses the work.",
             "Does rebirth still wipe skill upgrades? Several players ask for those to persist."],
    "verity": ["Did the message cap or refill timer change? It is the single most-named complaint (8.6% of 2,097 comments).",
               "18.8% of comments concern the AI knowing personal details — a retention and possibly policy risk. Any change here?"],
    "waterslide": ["Does the update add anything above the R$21 price point? 88% of revenue is one-shot dev products with no pass ladder.",
                   "What is the root place's real current version? place-versions.csv reports v3, which is a sub-place (F12)."],
    "banana": ["What shipped, and does it touch the tutorial? Steps are named 'Completed Tutorial (Part 1-3)' and the funnel is readable.",
               "DAU is down sharply into this update; was anything else changed in the last week (thumbnail, icon, ads)?"],
}


def series(u, m):
    f = os.path.join(ROOT, "data", "games", u, "metrics", m + ".csv")
    if not os.path.exists(f):
        return {}
    o = {}
    for r in csv.DictReader(open(f, encoding="utf-8")):
        if r.get("granularity") != "METRIC_GRANULARITY_ONE_DAY" or not r.get("value"):
            continue
        s = r.get("series") or "Total"
        if s != "Total" and "Place=" not in s:
            continue
        if str(r.get("partial", "")).lower() in ("true", "1"):
            continue
        o[r["date"]] = float(r["value"])
    return o


for uid, (short, full, slug) in GAMES.items():
    lines = []
    A = lines.append
    shipped = slug == "brainrot"
    A(f"# {short} — universe {uid} — pre-update baseline, 2026-09-04\n")
    A("**Frozen 2026-09-04. Do not edit the numbers below.** Follow-up goes in a")
    A("`## Follow-up <date>` section at the bottom.\n")
    A(f"- **Game:** {full}")
    A(f"- **Baseline day:** `{BASE}` — the last fully settled day, and pre-update on this game")
    A("- **Grab:** browser path, window 2026-09-01 -> 2026-09-05, run 2026-09-04 ~14:15 UTC+2,")
    A("  on top of a lifetime grab taken 2026-09-03/04 (so the full history is present)")
    A("- **Gates at freeze time:** verify 23 pass / 2 fail / 8 skip (documented `KNOWN_OPEN`),")
    A("  audit-plan 180 templates / 0 failures, test 51/51\n")

    A("## Which grab this is\n")
    if shipped:
        A("**This is grab 2 — the update has ALREADY shipped.** `place-versions.csv` records")
        A("**v608 published 2026-09-04T12:17:52Z**. The baseline is therefore not a snapshot")
        A("taken before the publish; it is the settled history inside the same grab, with")
        A("`2026-09-03` as the last wholly pre-update day. That is legitimate and is what the")
        A("rest of this file uses, but it is weaker than a true grab 1 and must be stated")
        A("whenever quoted.\n")
        A("**2026-09-04 is a blended day** — servers cycle onto a new build over 1-3 hours, so")
        A("that day contains both versions and must not be used as either a before or an after.\n")
    else:
        A("**This is grab 1 — a genuine pre-publish baseline.** The newest published version on")
        A("record predates today, and no publish-signature server-error spike is visible. Every")
        A("number below is from a build that is still live at freeze time.\n")
        A("If the update ships later today, `2026-09-04` becomes a blended day and must not be")
        A("used as a before or an after; the first day that genuinely tests the update is")
        A("`2026-09-05`.\n")

    A("## What this baseline can and cannot answer\n")
    A("| Signal | First honest read | Why |")
    A("|---|---|---|")
    A("| Script errors, crashes, server errors | immediately | event-stamped, no aggregation |")
    A("| Concurrents | immediately | but a publish restarts servers — expect a dip |")
    A("| Client crash **rate** | 2026-09-05 | daily metric; today's is dominated by pre-update hours |")
    A("| DAU, revenue, session length, playtime | 2026-09-05 | daily, UTC-bucketed |")
    A("| **D1 retention** | **2026-09-06** | D1 for 09-04 needs 09-05 to finish, plus pipeline |")
    A("| D7 retention | 2026-09-12 | same reason, longer cohort |")
    A("| D30 retention | 2026-10-05 | same |")
    A("| RFY ranking signals | 2026-09-05 | daily, and they carry **no** maturation lag |")
    A("")
    A("**An absent measurement is not a clean bill of health.** Any row without data on the")
    A("follow-up is marked NO DATA, never OK.\n")

    A(f"## Pre-update metrics — settled at {BASE}, against the game's whole life\n")
    A("`Life pct` is where the baseline value sits in that metric's own full history for this")
    A("game (0% = its all-time low, 100% = its all-time high). A 7-day mean alone cannot say")
    A("whether a value is normal or already extreme; this can, and it is the reference the")
    A("follow-up should be read against.\n")
    A("| Rung | Metric | Type | Value | 7-day mean | Life pct | Life range | Days since peak | As of |")
    A("|---|---|---|---|---|---|---|---|---|")
    for rung, m, typ, fmt in ROWS:
        s = series(uid, m)
        if not s:
            A(f"| {rung} | `{m}` | {typ} | — | — | — | — | — | not served |")
            continue
        ds = sorted(s)
        wk = [s[d] for d in ds if WK[0] <= d <= WK[1]]
        cur = s.get(BASE)
        asof = BASE if cur is not None else ds[-1]
        if cur is None:
            cur = s[ds[-1]]
        mean = statistics.mean(wk) if wk else float("nan")
        vals = sorted(s.values())
        lo, hi = vals[0], vals[-1]
        pct = 100.0 * sum(1 for v in vals if v < cur) / max(1, len(vals) - 1)
        peakday = max(s, key=lambda d: s[d])
        dsp = (datetime.date.fromisoformat(asof) - datetime.date.fromisoformat(peakday)).days
        A(f"| {rung} | `{m}` | {typ} | {fmt.format(cur)} | "
          f"{(fmt.format(mean) if wk else '—')} | {pct:.0f}% | "
          f"{fmt.format(lo)} – {fmt.format(hi)} | {dsp} ({peakday}) | {asof} |")
    A("")
    A(f"Life history used: **{len(series(uid, 'DailyActiveUsers'))} settled days** of")
    A("`DailyActiveUsers`, from the lifetime grab of 2026-09-03/04 topped up on 2026-09-04.")
    A("Metrics with a shorter horizon — the RFY set starts 2026-05-01 on every game; crash and")
    A("performance age out at ~30 days, `ErrorCount` at ~56 — have their percentile computed")
    A("over the span that exists, not over the game's life. The `Life range` column is only as")
    A("long as the metric itself.\n")
    A("Values are the unbroken-down headline series (a bare `Place` filter still counts as")
    A("total; a population filter does not). Partial intervals are excluded. Where a metric's")
    A(f"last settled day is earlier than {BASE}, the *as-of* column says so — that is")
    A("maturation lag, not missing data.\n")

    A("## Pre-registered tripwires\n")
    A("Written **before** any post-update number was read. On the follow-up, mark each row")
    A("OK / WATCH / FIX / NO DATA *first*, and only then look for causes. If a threshold was")
    A("wrong, say it was wrong — do not quietly move it.\n")
    A("| Signal | Broken if | Why this threshold | Follow-up |")
    A("|---|---|---|---|")
    for sig, cond, why in TRIP[slug]:
        A(f"| {sig} | {cond} | {why} | |")
    A("")

    A("## Four things that look like breakage and are not\n")
    A("Check all four before escalating anything above.\n")
    A("1. **The publish server-error spike.** A deploy day spikes `ErrorCount` `LogSource: Server`")
    A("   20-50x and clears within 24h. It is the publish, not the build. Only a finding if")
    A("   **still** elevated on 2026-09-05.")
    A("2. **The restart dip in concurrents.** A publish cycles every server. Compare against the")
    A("   day's own pre-publish slope, not yesterday's peak.")
    A("3. **Today's partial point.** 2026-09-04 is in progress and reads low. Never compare a")
    A("   partial day to a full one.")
    A("4. **Version adoption.** Error counts climb while servers cycle. Rate per player, not raw")
    A("   count, and give it 2-3 hours.\n")

    A("## Preferred test — split by PlaceVersion, not before/after\n")
    A("During the adoption overlap both builds run on the same day, same traffic mix, same")
    A("event calendar. Holding the window fixed and splitting by `PlaceVersion` attributes a")
    A("difference in a way a day-over-day delta cannot. Supported on `ClientCrashRate15m`,")
    A("`ClientCrashCount`, `ClientFpsP10`, `ClientMemoryUsagePercentageAvg`,")
    A("`OomUnexpectedExits`, `SessionDurationSecondsAvg`.\n")
    A("Also: **onset vs exposure.** A movement starting before any player could be served the")
    A("new build cannot have been initiated by it. Date the first *served* version, not the ship.\n")

    A("## Open questions for the studio\n")
    for q in STUDIO[slug]:
        A(f"- {q}")
    A("")

    A("## Contamination log\n")
    A("Anything that could confound attribution, recorded as it is learned.\n")
    A("| Date | Event | Effect on attribution |")
    A("|---|---|---|")
    A("| 2026-09-04 | Updates shipping the same day on all five watched games | Cross-game")
    A("  comparison cannot be used as a control today — every candidate control is also treated |")
    if shipped:
        A("| 2026-09-04 12:17Z | v608 published | 09-04 is a blended day on this game |")
    A("")

    path = os.path.join(ROOT, "baselines", f"{uid}-2026-09-04-{slug}.md")
    open(path, "w", encoding="utf-8").write("\n".join(lines))
    print("wrote", os.path.relpath(path, ROOT))
