import json, time, urllib.request, urllib.error

KEY = open('web/.opencloud-key', encoding='utf-8').read().strip()
BASE = "https://apis.roblox.com/analytics-query-api/v1/universes/%s/metrics"
UID = '9963622286'   # Brainrot - mature, 30d cohorts exist
SOURCES = [{"dimension": "AcquisitionSource", "operation": "In", "values": [
    "HomeRecommendation", "Search", "Friends", "CrossGame", "SponsoredAds",
    "PortalAds", "Curation", "Charts", "SearchAds", "Others"]}]

# Column headers seen in the dashboard export -> candidate metric names.
CANDIDATES = [
    "Attribution1DPayerConversionRatio",
    "Attribution1DRobuxPerUser",
    "Attribution7DPayerConversionRatio",
    "Attribution7DRobuxPerUser",
    "Attribution30DPayerConversionRatio",   # control: known-good name
    "Attribution30DRobuxPerUser",           # control: known-good name
    "AttributionD1RetentionRatio",          # control
    "UniqueUsersWithPlaySessions",          # the missing denominator
]

def req(url, body=None):
    r = urllib.request.Request(
        url, data=json.dumps(body).encode() if body else None,
        headers={"x-api-key": KEY, "Content-Type": "application/json"},
        method="POST" if body else "GET")
    with urllib.request.urlopen(r, timeout=60) as f:
        return json.load(f)

def probe(metric):
    body = {"metric": metric, "granularity": "None",
            "startTime": "2026-08-01T00:00:00Z", "endTime": "2026-09-02T00:00:00Z",
            "breakdown": ["AcquisitionSource"], "filter": SOURCES, "limit": 200}
    try:
        r = req(BASE % UID, body)
    except urllib.error.HTTPError as e:
        return f"HTTP {e.code}", e.read().decode()[:130]
    tries = 0
    while not r.get("done") and r.get("path") and tries < 40:
        time.sleep(1.0); tries += 1
        try:
            r = req("https://apis.roblox.com/analytics-query-api/" + r["path"])
        except urllib.error.HTTPError as e:
            return f"poll HTTP {e.code}", e.read().decode()[:130]
    vals = (r.get("response") or {}).get("values") or []
    n = sum(len(v.get("dataPoints") or []) for v in vals)
    sample = []
    for v in vals[:4]:
        bd = ",".join(b.get("displayValue") or b.get("value", "")
                      for b in (v.get("breakdowns") or []))
        dp = (v.get("dataPoints") or [{}])[0].get("value")
        sample.append(f"{bd or 'Total'}={dp}")
    return f"200, {len(vals)} series / {n} pts", "  ".join(sample)

for m in CANDIDATES:
    status, detail = probe(m)
    print(f"{m:38s} {status:24s} {detail}", flush=True)
    time.sleep(2.2)
