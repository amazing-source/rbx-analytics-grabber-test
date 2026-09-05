import json, time, urllib.request, urllib.error, os, sys
KEY=open('web/.opencloud-key',encoding='utf-8').read().strip()
BASE="https://apis.roblox.com/analytics-query-api/v1/universes/%s/metrics"
GAMES={'9963622286':('Brainrot','2026-03-01'),'10030829154':('Waterslide','2026-05-01'),
       '10565445771':('Verity','2026-06-15'),'10638354731':('Seal','2026-06-15')}
MET=["RFYPlayThroughRate","RFYQualifiedPTR","RFYDuration0To60","RFYDuration61To180",
     "RFYD1Playtime","RFYD1QualifiedPlaySessions","RFYD1CoplayDays","RFYD1RobuxSpend",
     "RFYD1SpendDay","RFYD2To7PlayDays","RFYD2To7Playtime","RFYD2To7CoplayDays",
     "RFYD2To7RobuxSpend","RFYD2To7SpendDays","RFYL7PlayDays",
     "RFYUniqueNotInterestedUsersPerMillionImpressions"]
END="2026-09-02T00:00:00Z"
def req(url, body=None):
    r=urllib.request.Request(url, data=json.dumps(body).encode() if body else None,
        headers={"x-api-key":KEY,"Content-Type":"application/json"}, method="POST" if body else "GET")
    with urllib.request.urlopen(r, timeout=60) as f: return json.load(f)
out={}
for uid,(name,start) in GAMES.items():
    out[name]={}
    for m in MET:
        body={"metric":m,"granularity":"OneDay","startTime":start+"T00:00:00Z","endTime":END,"limit":500}
        try:
            r=req(BASE%uid, body)
        except urllib.error.HTTPError as e:
            out[name][m]={"error":e.read().decode()[:160]}; time.sleep(2.2); continue
        # async: poll the operation path until done
        tries=0
        while not r.get("done") and r.get("path") and tries<40:
            time.sleep(1.0); tries+=1
            try: r=req("https://apis.roblox.com/analytics-query-api/"+r["path"])
            except urllib.error.HTTPError as e:
                r={"error":e.read().decode()[:160]}; break
        resp=(r.get("response") or {})
        vals=resp.get("values") or []
        pts=[]
        for v in vals:
            if v.get("breakdowns"): continue
            for dp in (v.get("dataPoints") or []):
                if dp.get("value") is not None: pts.append((dp["time"][:10], dp["value"]))
        out[name][m]={"n":len(pts),"first":pts[0][0] if pts else None,"last":pts[-1][0] if pts else None,
                      "points":pts}
        print(f"{name:11s} {m:46s} {len(pts):4d} pts  {pts[0][0] if pts else '-'}..{pts[-1][0] if pts else '-'}", flush=True)
        time.sleep(2.2)
json.dump(out, open('analysis/oc_rfy_lifetime.json','w'), indent=1)
print("\nwritten analysis/oc_rfy_lifetime.json")
