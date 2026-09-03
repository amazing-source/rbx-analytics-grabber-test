import json, os, numpy as np, pandas as pd, duckdb
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'analysis') if False else 'analysis'
d=json.load(open('analysis/oc_rfy_lifetime.json'))
con=duckdb.connect('analysis/analytics.duckdb', read_only=True)
pd.set_option('display.width',250); pd.set_option('display.max_columns',40)

def rfy(game, metric):
    m=d[game].get(metric)
    if not m or not m.get('points'): return None
    s=pd.Series({pd.Timestamp(a):b for a,b in m['points']}).sort_index()
    return s

# reach = UniqueUsersWithImpressions Total ONE_DAY
q="""SELECT game,date,value,status FROM pts WHERE metric='UniqueUsersWithImpressions'
     AND granularity='METRIC_GRANULARITY_ONE_DAY' AND series='Total' AND NOT is_partial"""
r=con.execute(q).df()
r=r[r.status!='FILLED_ZERO']
r['date']=pd.to_datetime(r['date'])
reach=r.pivot_table(index='date',columns='game',values='value')
print("REACH span per game:")
for g in reach.columns:
    s=reach[g].dropna(); print(f"  {g:11s} n={len(s):4d}  {s.index.min().date()} -> {s.index.max().date()}  peak={s.max():,.0f} on {s.idxmax().date()}  last={s.iloc[-1]:,.0f}")

# maturity check: do the trailing days of a D2To7 series collapse? (cohort-date stamping = immature tail)
print("\nMATURITY CHECK - last 10 values vs the series' own trailing-28d median")
for g in ['Brainrot','Waterslide']:
    for m in ['RFYPlayThroughRate','RFYDuration0To60','RFYD1Playtime','RFYD2To7PlayDays','RFYL7PlayDays']:
        s=rfy(g,m)
        if s is None: continue
        med=s.iloc[-38:-10].median()
        tail=s.iloc[-10:]
        print(f"  {g:11s} {m:34s} med(-38:-10)={med:10.4f}  tail={' '.join(f'{v:.4f}' for v in tail.values)}")
    print()
