import sys, os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from stats import *
SIG = ['RFYPlayThroughRate','RFYQualifiedPTR','RFYDuration0To60','RFYDuration61To180',
       'RFYD1Playtime','RFYD1CoplayDays','RFYD1QualifiedPlaySessions','RFYD1RobuxSpend','RFYD1SpendDay',
       'RFYD2To7PlayDays','RFYD2To7Playtime','RFYD2To7CoplayDays','RFYD2To7RobuxSpend','RFYD2To7SpendDays',
       'RFYL7PlayDays','RFYUniqueNotInterestedUsersPerMillionImpressions']
print("### RFY ranking signals — mean over last 14 settled days, and 14-day slope")
print("These are the inputs Roblox's Home recommender scores a game on. Falling signals -> demotion -> less reach.\n")
out=[]
for m in SIG:
    df=daily(m)
    if df.empty: continue
    row={'signal':m}
    for g in GAMES:
        if g not in df.columns: row[g]=np.nan; row[g+'_t']=np.nan; continue
        s=df[g].dropna().iloc[-14:]
        row[g]=s.mean(); row[g+'_t']=slope_abs_per_day(s)
    out.append(row)
o=pd.DataFrame(out).set_index('signal')
lvl=o[GAMES]; trd=o[[g+'_t' for g in GAMES]]; trd.columns=GAMES
print("-- LEVEL (mean, last 14d)"); print(lvl.to_string(float_format=lambda v:f"{v:,.5g}"))
print("\n-- SLOPE per day (last 14d)"); print(trd.to_string(float_format=lambda v:f"{v:+,.4g}"))
print("\n### Genre benchmarks from Roblox (50th / 90th pct) where captured")
import json
for uid,g in [('9963622286','Brainrot'),('10638354731','Seal'),('10565445771','Verity'),('10030829154','Waterslide')]:
    j=json.load(open(os.path.join(os.path.dirname(ROOT),'data','games',uid,'series.json'),encoding='utf-8'))
    b=j.get('benchmarks') or {}
    if not b: print(f"  {g:12s} (no benchmarks captured)"); continue
    ks=list(b.keys())[:6]
    print(f"  {g:12s} genre={j.get('genre')} benchmarkType={j.get('benchmarkType')} metrics={len(b)} e.g. {ks}")
