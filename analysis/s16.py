import sys, os, json; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from stats import *
REPO=os.path.dirname(ROOT)
GID={'Brainrot':'9963622286','Seal':'10638354731','Verity':'10565445771','Waterslide':'10030829154'}
KEY=['ForwardD1Retention','ForwardD7Retention','ForwardD30Retention','PayingUsersCVR',
     'AverageRevenuePerPayingUser','AverageRevenuePerUser','AverageSessionLengthMinutes',
     'DauMauStickiness','AveragePlayTimeMinutesPerDAU']
print("### Game vs Roblox benchmark cohort (last 14 settled days, mean)")
print("NOTE benchmark COHORT differs per game — Brainrot/Waterslide=SIMILARITY, Seal=TOP_EXPERIENCES,")
print("Verity=GENRE(adventure). Percentile position is comparable WITHIN a game, not across games.\n")
rows=[]
for g,uid in GID.items():
    j=json.load(open(os.path.join(REPO,'data','games',uid,'series.json'),encoding='utf-8'))
    b=j.get('benchmarks') or {}
    for m in KEY:
        if m not in b: continue
        entry=b[m]
        df=daily(m)
        if g not in df.columns: continue
        mine=df[g].dropna().iloc[-14:].mean()
        def grab(e):
            # find p50/p90 series
            out={}
            for s in (e.get('series') or []):
                lab=(s.get('label') or '')+str(s.get('breakdown') or '')
                pts=[p['value'] for p in (s.get('points') or []) if p.get('value') is not None]
                if not pts: continue
                v=float(np.mean(pts[-14:]))
                if '50' in lab: out['p50']=v
                elif '90' in lab: out['p90']=v
            return out
        pc=grab(entry)
        if not pc: continue
        p50,p90=pc.get('p50'),pc.get('p90')
        pos = 'above p90' if (p90 and mine>=p90) else ('p50-p90' if (p50 and mine>=p50) else 'below p50')
        rows.append(dict(game=g,metric=m,mine=mine,p50=p50,p90=p90,
                         vs_p50=(mine/p50-1)*100 if p50 else np.nan, position=pos))
r=pd.DataFrame(rows)
for m in KEY:
    s=r[r.metric==m]
    if s.empty: continue
    print(f"\n-- {m}")
    print(s[['game','mine','p50','p90','vs_p50','position']].to_string(index=False,float_format=lambda v:f"{v:,.4g}"))
r.to_csv(os.path.join(ROOT,'benchmarks.csv'),index=False)
