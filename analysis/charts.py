import sys, os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from stats import *
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter
import matplotlib.dates as mdates

SURFACE='#fcfcfb'; INK='#0b0b0b'; INK2='#52514e'; MUTED='#8a8983'; GRID='#e6e5e1'
C={'Brainrot':'#2a78d6','Seal':'#eb6834','Verity':'#1baf7a','Waterslide':'#eda100'}
plt.rcParams.update({'figure.facecolor':SURFACE,'axes.facecolor':SURFACE,'savefig.facecolor':SURFACE,
 'font.family':'DejaVu Sans','text.color':INK,'axes.labelcolor':INK2,'xtick.color':INK2,'ytick.color':INK2,
 'axes.edgecolor':GRID,'grid.color':GRID,'axes.grid':True,'grid.linewidth':0.7,'axes.axisbelow':True,
 'font.size':9,'axes.titlesize':11,'figure.dpi':160})
def style(ax):
    for s in ('top','right'): ax.spines[s].set_visible(False)
    for s in ('left','bottom'): ax.spines[s].set_color(GRID)
    ax.tick_params(length=0)
def kfmt(v,_=None):
    a=abs(v)
    if a>=1e6: return f"{v/1e6:.1f}M".replace('.0M','M')
    if a>=1e3: return f"{v/1e3:.0f}k"
    return f"{v:.0f}"
OUT=os.path.join(ROOT,'charts')
def save(fig,name):
    fig.savefig(os.path.join(OUT,name),bbox_inches='tight'); plt.close(fig); print("saved",name)

# ---------------- Chart 1: DAU trajectories -----------------
dau=daily('DailyActiveUsers'); m=ma7(dau)
fig,ax=plt.subplots(figsize=(10.5,5.4))
ends=[]
for g in GAMES:
    s_=m[g].dropna()
    if s_.empty: continue
    ax.plot(s_.index,s_.values,color=C[g],lw=2,solid_capstyle='round')
    ends.append((s_.iloc[-1],g,s_.index[-1]))
    r=dau[g].dropna(); pk=r.idxmax()
    if pk>=pd.Timestamp('2026-07-12') and pk in m[g].index and not np.isnan(m[g].loc[pk]):
        ax.plot([pk],[m[g].loc[pk]],'o',ms=7,color=C[g],mec=SURFACE,mew=2,zorder=5)
ends.sort(reverse=True)
lo,hi=4e4,1.4e6
span=np.log10(hi)-np.log10(lo); minsep=0.062*span
placed=[]
for v,g,x in ends:
    y=np.log10(v)
    for py in placed:
        if abs(y-py)<minsep: y=py-minsep
    placed.append(y)
    ax.annotate(f"{g}  {kfmt(v)}",(x,10**y),xytext=(9,0),textcoords='offset points',
                color=INK,fontsize=9,fontweight='bold',va='center')
ax.set_yscale('log'); ax.set_ylim(lo,hi); ax.yaxis.set_major_formatter(FuncFormatter(kfmt))
ax.set_yticks([5e4,1e5,2e5,5e5,1e6])
ax.set_xlim(pd.Timestamp('2026-07-12'),pd.Timestamp('2026-09-14'))
ax.xaxis.set_major_formatter(mdates.DateFormatter('%d %b'))
ax.set_ylabel('Daily Active Users (7-day moving average, log scale)')
ax.set_title('All four games are past their peak and falling at a similar rate',loc='left',
             fontweight='bold',color=INK,pad=16)
ax.text(0,1.02,"Dots mark each game's DAU peak (Brainrot's was 28 Jun, off-scale left). Log scale: parallel slopes = the same % decline per day.",
        transform=ax.transAxes,fontsize=8.5,color=MUTED)
ax.legend([plt.Line2D([],[],color=C[g],lw=2) for g in GAMES],GAMES,frameon=False,
          loc='lower left',ncol=4,fontsize=8.5,labelcolor=INK2)
style(ax); save(fig,'01-dau-trajectories.png')

# ---------------- Chart 2: reach vs conversion -----------------
# Role-coloured, not game-coloured: the entity here is the MEASURE, and it is the
# same measure in all four panels. Game identity comes from the panel title.
R_REACH='#2a78d6'; R_CONV='#eb6834'
imp=daily('UniqueUsersWithImpressions'); ply=daily('UniqueUsersWithPlaySessions')
conv=(ply/imp)*100
conv=conv.where(dau>=10000)          # tiny-denominator launch days are not a conversion rate
fig,axes=plt.subplots(2,2,figsize=(10.5,6.6))
for ax,g in zip(axes.ravel(),GAMES):
    pk=dau[g].dropna().idxmax()
    d=ma7(dau)[g].dropna(); r=ma7(imp)[g].dropna(); c=ma7(conv)[g].dropna()
    idx=lambda s:(s/s.loc[pk]*100)
    lo=max(pk-pd.Timedelta(days=21), c.index.min())
    for s_,col,lw,ls in ((idx(d),MUTED,1.3,'-'),(idx(r),R_REACH,2,'-'),(idx(c),R_CONV,2,'--')):
        s_=s_[s_.index>=lo]
        ax.plot(s_.index,s_.values,color=col,lw=lw,ls=ls,solid_capstyle='round')
    ax.axvline(pk,color='#cfcec9',lw=1.2,zorder=0)
    ax.annotate('DAU peak',(pk,168),xytext=(4,0),textcoords='offset points',fontsize=7.5,color=MUTED)
    dr=(imp[g].dropna().iloc[-1]/imp[g].dropna().loc[pk]-1)*100
    dc=(conv[g].dropna().iloc[-1]/conv[g].dropna().loc[pk]-1)*100
    ax.set_title(f"{g}", loc='left',fontsize=10.5,color=INK,fontweight='bold',pad=20)
    ax.text(0,1.03,f"reach {dr:+.0f}%   ·   conversion {dc:+.0f}%   (peak → 1 Sep)",
            transform=ax.transAxes,fontsize=8.5,color=INK2)
    ax.axhline(100,color=GRID,lw=0.9,zorder=0); ax.set_ylim(0,180)
    ax.set_xlim(lo,pd.Timestamp('2026-09-02'))
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%d %b'))
    ax.xaxis.set_major_locator(mdates.AutoDateLocator(minticks=3,maxticks=5)); style(ax)
axes[0,0].set_ylabel('indexed to 100 at that game\'s DAU peak')
axes[1,0].set_ylabel('indexed to 100 at that game\'s DAU peak')
fig.suptitle('Reach is the larger term in all four - but Seal and Waterslide also lost conversion',
             x=0.005,ha='left',fontweight='bold',fontsize=13,color=INK,y=1.05)
CAP2 = ("Reach = unique users Roblox showed the game. Conversion = share of them who played. "
        "Reach fell 56-95% everywhere; conversion ROSE on Brainrot and Verity and FELL on Seal and Waterslide." + chr(10) +
        "Lines are 7-day moving averages, so they lag the raw peak-to-1-Sep figures quoted under each "
        "title (visible on Seal, which peaked 4 days before the window ends).")
fig.text(0.005,1.005,CAP2,fontsize=8.5,color=MUTED,ha='left',va='top')
fig.legend([plt.Line2D([],[],color=R_REACH,lw=2),plt.Line2D([],[],color=R_CONV,lw=2,ls='--'),
            plt.Line2D([],[],color=MUTED,lw=1.3)],
           ['Reach — unique users shown the game','Conversion — share of them who played','DAU'],
           frameon=False,loc='lower center',ncol=3,fontsize=8.5,labelcolor=INK2,bbox_to_anchor=(0.5,-0.05))
fig.tight_layout(); save(fig,'02-reach-vs-conversion.png')

# ---------------- Chart 3: benchmark position -----------------
bm=pd.read_csv(os.path.join(ROOT,'benchmarks.csv'))
METS=['ForwardD1Retention','ForwardD7Retention','AveragePlayTimeMinutesPerDAU',
      'PayingUsersCVR','AverageRevenuePerUser','AverageRevenuePerPayingUser']
NICE={'ForwardD1Retention':'D1 retention','ForwardD7Retention':'D7 retention',
      'AveragePlayTimeMinutesPerDAU':'Playtime / DAU (min)','PayingUsersCVR':'Paying-user CVR',
      'AverageRevenuePerUser':'ARPDAU (R$)','AverageRevenuePerPayingUser':'ARPPU (R$)'}
fig,axes=plt.subplots(2,3,figsize=(11.5,5.8))
for ax,m in zip(axes.ravel(),METS):
    sub=bm[bm['metric']==m].set_index('game').reindex(GAMES).dropna(subset=['mine'])
    ys=np.arange(len(sub))[::-1]
    for y,(g,row) in zip(ys,sub.iterrows()):
        ax.plot([row['p50'],row['p90']],[y,y],color='#dedcd6',lw=5,solid_capstyle='butt',zorder=1)
        ax.plot([row['p50']],[y],'|',ms=13,color=MUTED,mew=1.6,zorder=3)
        ax.plot([row['p90']],[y],'|',ms=13,color=MUTED,mew=1.6,zorder=3)
        ax.plot([row['mine']],[y],'o',ms=9,color=C[g],mec=SURFACE,mew=2,zorder=4)
    ax.set_yticks(ys); ax.set_yticklabels(sub.index,fontsize=8.5,color=INK)
    ax.set_title(NICE[m],loc='left',fontsize=9.5,color=INK,fontweight='bold')
    ax.grid(axis='y',visible=False); ax.set_xlim(left=0); style(ax)
    ax.tick_params(axis='x',labelsize=8)
fig.suptitle('Every game clears its cohort on payer conversion; Waterslide misses on four of six',
             x=0.005,ha='left',fontweight='bold',fontsize=13,color=INK,y=1.06)
fig.text(0.005,1.005,'Grey bar spans the cohort\'s 50th→90th percentile; the tick marks are p50 and p90. Dot = the game (mean of last 14 settled days).\n'
                     'Cohorts differ per game (Brainrot/Waterslide = similar experiences, Seal = top experiences, Verity = adventure genre), so read each row against its own bar, not across games.',
         fontsize=8.5,color=MUTED,ha='left',va='top')
fig.tight_layout(rect=[0,0,1,0.98]); save(fig,'03-benchmark-position.png')

# ---------------- Chart 4: monetization structure -----------------
LO,HI='2026-08-19','2026-09-01'
cvr_=daily('PayingUsersCVR').loc[LO:HI].mean()*100
arppu=daily('AverageRevenuePerPayingUser').loc[LO:HI].mean()
arpdau=daily('AverageRevenuePerUser').loc[LO:HI].mean()
mix=con.execute("""SELECT game, dim_value, sum(value) v FROM pts
  WHERE metric='DailyRevenue' AND dim='RevenueSource' AND granularity='METRIC_GRANULARITY_ONE_DAY'
  AND NOT is_partial AND status<>'FILLED_ZERO' AND date>=DATE '2026-08-19' GROUP BY 1,2""").df()
mx=mix.pivot_table(index='game',columns='dim_value',values='v',fill_value=0).reindex(GAMES)
other=mx[[c for c in mx.columns if c not in ('DevProduct','GamePass')]].sum().sum()/mx.sum().sum()*100
mx=mx[[c for c in ['DevProduct','GamePass'] if c in mx.columns]]
mxs=mx.div(mx.sum(axis=1),axis=0)*100
fig,axes=plt.subplots(1,3,figsize=(12,4.2))
x=np.arange(len(GAMES))
for ax,(vals,lab,note) in zip(axes[:2],[
    (cvr_.reindex(GAMES),'Paying-user conversion rate (%)','share of DAU who spend'),
    (arppu.reindex(GAMES),'ARPPU (R$ per paying user)','how much each spender spends')]):
    ax.bar(x,vals.values,color=[C[g] for g in GAMES],width=0.62,zorder=2)
    for i,v in enumerate(vals.values):
        ax.text(i,v,f"{v:,.2f}" if v<10 else f"{v:,.0f}",ha='center',va='bottom',
                fontsize=9,fontweight='bold',color=INK)
    ax.set_xticks(x); ax.set_xticklabels(GAMES,fontsize=8.5,color=INK)
    ax.set_title(lab,loc='left',fontsize=9.5,color=INK,fontweight='bold',pad=18)
    ax.text(0,1.03,note,transform=ax.transAxes,fontsize=8.5,color=MUTED)
    ax.grid(axis='x',visible=False); style(ax)
    ax.set_ylim(0,vals.max()*1.22)
# Different hue family from the game colours on purpose: blue must not mean
# "Brainrot" in one panel and "DevProduct" in the next.
ax=axes[2]; SRC={'DevProduct':'#4a3aa7','GamePass':'#e87ba4'}
bottom=np.zeros(len(GAMES))
for c_ in mxs.columns:
    v=mxs[c_].values
    ax.bar(x,v,bottom=bottom,color=SRC[c_],width=0.62,zorder=2,linewidth=1.6,edgecolor=SURFACE)
    for i,(b,h) in enumerate(zip(bottom,v)):
        if h>8: ax.text(i,b+h/2,f"{h:.0f}%",ha='center',va='center',fontsize=8.5,color='white',fontweight='bold')
    bottom+=v
ax.set_xticks(x); ax.set_xticklabels(GAMES,fontsize=8.5,color=INK); ax.set_ylim(0,100)
ax.set_title('Revenue mix by source (%)',loc='left',fontsize=9.5,color=INK,fontweight='bold',pad=18)
ax.text(0,1.03,f'Seal has only 3 days of breakdown coverage · private servers + avatar = {other:.1f}%, omitted',
        transform=ax.transAxes,fontsize=8.5,color=MUTED)
ax.legend([plt.Rectangle((0,0),1,1,color=SRC[c_]) for c_ in mxs.columns],list(mxs.columns),
          frameon=False,fontsize=8.5,labelcolor=INK2,loc='lower center',ncol=2,bbox_to_anchor=(0.5,-0.26))
ax.grid(axis='x',visible=False); style(ax)
fig.suptitle('Two different monetization machines — and Waterslide is the fragile one',
             x=0.005,ha='left',fontweight='bold',fontsize=13,color=INK,y=1.09)
fig.text(0.005,1.015,'Means over 19 Aug – 1 Sep. Waterslide converts the most players but extracts the least from each; Seal is the mirror image.',
         fontsize=8.5,color=MUTED,ha='left')
fig.tight_layout(); save(fig,'04-monetization-structure.png')
