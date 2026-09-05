import json, numpy as np, pandas as pd, duckdb
d=json.load(open('analysis/oc_rfy_lifetime.json'))
con=duckdb.connect('analysis/analytics.duckdb', read_only=True)
pd.set_option('display.width',260)
def rfy(g,m):
    x=d[g].get(m)
    if not x or not x.get('points'): return None
    return pd.Series({pd.Timestamp(a):b for a,b in x['points']}).sort_index()
q="""SELECT game,date,value,status FROM pts WHERE metric='UniqueUsersWithImpressions'
     AND granularity='METRIC_GRANULARITY_ONE_DAY' AND series='Total' AND NOT is_partial"""
r=con.execute(q).df(); r=r[r.status!='FILLED_ZERO']; r['date']=pd.to_datetime(r['date'])
reach=r.pivot_table(index='date',columns='game',values='value')

SIG=["RFYPlayThroughRate","RFYQualifiedPTR","RFYDuration0To60","RFYDuration61To180",
     "RFYD1Playtime","RFYD1QualifiedPlaySessions","RFYD2To7PlayDays","RFYD2To7Playtime","RFYL7PlayDays"]

for g in ["Brainrot","Waterslide","Verity","Seal"]:
    df=pd.DataFrame({'reach':reach[g]})
    for m in SIG:
        s=rfy(g,m)
        if s is not None: df[m]=s
    df=df.dropna(subset=['reach'])
    df=df[df.reach>0]
    df=df.dropna(thresh=4)
    if len(df)<12: print(f"\n### {g}: only {len(df)} joint days, skipped"); continue
    nq=5 if len(df)>=40 else 3
    df['q']=pd.qcut(df.reach, nq, labels=[f'Q{i+1}' for i in range(nq)])
    g2=df.groupby('q',observed=True).agg(days=('reach','size'), reach=('reach','mean'),
        **{m:(m,'mean') for m in SIG if m in df})
    print(f"\n### {g}  — reach quintiles (Q1 = lowest-reach days), n={len(df)} joint days")
    out=g2.copy()
    out['reach']=out['reach'].map(lambda v:f"{v/1e6:.2f}M")
    for c in out.columns:
        if c.startswith('RFY'):
            out[c]=out[c].map(lambda v:f"{v:.4f}")
    ren={'RFYPlayThroughRate':'PTR','RFYQualifiedPTR':'qPTR','RFYDuration0To60':'bounce<60',
         'RFYDuration61To180':'bounce61-180','RFYD1Playtime':'D1play(min)',
         'RFYD1QualifiedPlaySessions':'D1qSess','RFYD2To7PlayDays':'D2-7days',
         'RFYD2To7Playtime':'D2-7play','RFYL7PlayDays':'L7days'}
    print(out.rename(columns=ren).to_string())
    # correlation of each signal with log reach
    lr=np.log(df.reach)
    print("  corr(log reach, signal):", {ren.get(m,m):round(float(np.corrcoef(lr[df[m].notna()],df[m].dropna())[0,1]),2) for m in SIG if m in df and df[m].notna().sum()>10})
