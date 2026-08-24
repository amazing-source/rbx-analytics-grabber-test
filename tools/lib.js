const fs=require("fs");
const ROOT="C:/Users/bfhdh/Desktop/rbx-analytics-grabber-test/";
const GAMES={
 "10030829154":"Climb Waterslide and Slide",
 "10399712766":"+1 Banana Monkey Destruction",
 "9963622286":"Become a Brainrot",
 "9610561918":"My Knife Farm",
 "9758414065":"Climb Up Mountain (dead ref)",
};
const cache={};
function load(id){ return cache[id]||(cache[id]=JSON.parse(fs.readFileSync(`${ROOT}data/games/${id}/series.json`,"utf8"))); }

// headline = empty breakdown; Place filter still counts as whole; population filter does not
function isHeadline(s){
  if(Object.keys(s.breakdown||{}).length) return false;
  const f=s.filters||[];
  return f.every(x=>(x.dimension||x.name)==="Place");
}
function seriesOf(id,metric,{gran="METRIC_GRANULARITY_ONE_DAY",breakdownDim=null,filterDim=null}={}){
  const m=load(id).metrics[metric]; if(!m) return [];
  return (m.series||[]).filter(s=>{
    if(gran && s.granularity!==gran) return false;
    if(breakdownDim!==null){ const bk=Object.keys(s.breakdown||{}); if(breakdownDim===false){ if(bk.length) return false; } else if(!bk.includes(breakdownDim)) return false; }
    if(filterDim){ if(!(s.filters||[]).some(f=>(f.dimension||f.name)===filterDim)) return false; }
    return true;
  });
}
// returns Map date->value for the headline series
function daily(id,metric,{gran="METRIC_GRANULARITY_ONE_DAY",dropFilled=true,dropPartial=true}={}){
  const m=load(id).metrics[metric]; if(!m) return null;
  const cands=(m.series||[]).filter(s=>s.granularity===gran && isHeadline(s));
  if(!cands.length) return null;
  const out=new Map();
  for(const s of cands) for(const p of s.points){
    if(dropPartial && p.partial) continue;
    if(dropFilled && p.status==="FILLED_ZERO") continue;
    if(!out.has(p.date)) out.set(p.date,p.value);
  }
  return new Map([...out].sort((a,b)=>a[0]<b[0]?-1:1));
}
// breakdown: Map label -> Map date->value
function byBreakdown(id,metric,dim,{gran="METRIC_GRANULARITY_ONE_DAY",dropFilled=true,dropPartial=true}={}){
  const m=load(id).metrics[metric]; if(!m) return null;
  const cands=(m.series||[]).filter(s=>s.granularity===gran && Object.keys(s.breakdown||{}).includes(dim));
  if(!cands.length) return null;
  const out=new Map();
  for(const s of cands){
    const lbl=(s.breakdownLabels&&s.breakdownLabels[dim])||s.breakdown[dim]||s.label;
    if(!out.has(lbl)) out.set(lbl,new Map());
    const mm=out.get(lbl);
    for(const p of s.points){
      if(dropPartial&&p.partial) continue;
      if(dropFilled&&p.status==="FILLED_ZERO") continue;
      if(!mm.has(p.date)) mm.set(p.date,p.value);
    }
  }
  for(const [k,v] of out) out.set(k,new Map([...v].sort((a,b)=>a[0]<b[0]?-1:1)));
  return out;
}
function listMetrics(id){ return Object.keys(load(id).metrics); }
function metricInfo(id,metric){
  const m=load(id).metrics[metric]; if(!m) return null;
  return {label:m.label,category:m.category,unit:m.unit,kind:m.kind,latest:m.latestAvailableTime,
    series:(m.series||[]).map(s=>({key:s.key,label:s.label,gran:s.granularity,bd:s.breakdown,bdl:s.breakdownLabels,f:s.filters,n:s.points.length,
      first:s.points[0]&&s.points[0].date,last:s.points[s.points.length-1]&&s.points[s.points.length-1].date}))};
}
const DOW=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const dow=d=>DOW[new Date(d+"T00:00:00Z").getUTCDay()];
const fmt=(v,p=1)=>v==null?"—":(Math.abs(v)>=1e6?(v/1e6).toFixed(2)+"M":Math.abs(v)>=1e3?(v/1e3).toFixed(1)+"K":v.toFixed(p));
function tail(map,n=30){ return [...map].slice(-n); }
function mean(a){ return a.length?a.reduce((x,y)=>x+y,0)/a.length:null; }
function pearson(x,y){ const n=Math.min(x.length,y.length); if(n<3)return null;
  const mx=mean(x.slice(0,n)),my=mean(y.slice(0,n)); let a=0,b=0,c=0;
  for(let i=0;i<n;i++){const dx=x[i]-mx,dy=y[i]-my;a+=dx*dy;b+=dx*dx;c+=dy*dy;}
  return b&&c?a/Math.sqrt(b*c):null; }
module.exports={ROOT,GAMES,load,daily,byBreakdown,seriesOf,listMetrics,metricInfo,isHeadline,dow,fmt,tail,mean,pearson};
