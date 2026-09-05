import sys, os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from stats import *
dau=daily('DailyActiveUsers'); rev=daily('DailyRevenue'); imp=daily('UniqueUsersWithImpressions')
print("### Post-peak decay — every game measured from ITS OWN peak, so the launch ramp cannot flatter anyone")
print(f"{'game':12s} {'peak day':>11s} {'days':>5s} {'peak DAU':>11s} {'now':>10s} {'DAU %/day':>10s} {'rev %/day':>10s} {'reach %/day':>12s} {'half-life':>10s}")
out={}
for g in GAMES:
    d=dau[g].dropna(); pk=d.idxmax()
    post=d.loc[pk:]
    if len(post)<4: continue
    s=slope_pct_per_day(post)
    rp=rev[g].dropna().loc[pk:]; ip=imp[g].dropna().loc[pk:]
    sr=slope_pct_per_day(rp) if len(rp)>=4 else np.nan
    si=slope_pct_per_day(ip) if len(ip)>=4 else np.nan
    hl=np.log(0.5)/np.log(1+s/100) if s<0 else np.nan
    out[g]=dict(days=len(post)-1,dau_dec=s,rev_dec=sr,reach_dec=si,halflife=hl)
    print(f"{g:12s} {str(pk.date()):>11s} {len(post)-1:5d} {d.max():11,.0f} {d.iloc[-1]:10,.0f} "
          f"{s:+9.2f}% {sr:+9.2f}% {si:+11.2f}% {hl:9.1f}d" if s<0 else
          f"{g:12s} {str(pk.date()):>11s} {len(post)-1:5d} {d.max():11,.0f} {d.iloc[-1]:10,.0f} {s:+9.2f}% {sr:+9.2f}% {si:+11.2f}%      n/a")
print("\n  half-life = days for DAU to halve again if the current post-peak slope holds.")
print("  Seal has only 4 post-peak days, so its slope is the least certain of the four.")
print("\n### Same-length comparison: first 4 days after each game's own peak (all four measurable)")
print(f"{'game':12s} {'DAU d0':>11s} {'DAU d+4':>11s} {'change':>9s}")
for g in GAMES:
    d=dau[g].dropna(); pk=d.idxmax(); post=d.loc[pk:]
    if len(post)<5: continue
    print(f"{g:12s} {post.iloc[0]:11,.0f} {post.iloc[4]:11,.0f} {(post.iloc[4]/post.iloc[0]-1)*100:+8.1f}%")
