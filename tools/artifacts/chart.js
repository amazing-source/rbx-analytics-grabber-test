// SVG helpers. One scale per chart, room in the viewBox for the outermost
// labels, explicit fills, colour from theme tokens so both themes read.
const esc = (s)=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const fmtN = (v)=>v==null?"—":Math.abs(v)>=1000?Math.round(v).toLocaleString("en-US"):(Math.abs(v)>=10?v.toFixed(0):v.toFixed(2));
const sgn = (v,dp=1)=>v==null?"—":(v>=0?"+":"")+(v*100).toFixed(dp)+"%";

/**
 * Multi-series line chart. Series are indexed to a common base by the caller so
 * one axis serves — never two scales on one chart.
 * `clampZero` holds the domain at 0 for quantities that cannot go negative, so
 * no tick ever labels a value the chart could not reach.
 */
function lineChart({series, w=980, h=300, pad={t:22,r:132,b:34,l:50}, yLabel="", baseLabel="", clampZero=false}) {
  const dates=[...new Set(series.flatMap(s=>s.points.map(p=>p[0])))].sort();
  if(!dates.length) return `<p class="muted">no data</p>`;
  const xs=(d)=>pad.l+(dates.indexOf(d)/(dates.length-1||1))*(w-pad.l-pad.r);
  const all=series.flatMap(s=>s.points.map(p=>p[1])).filter(v=>Number.isFinite(v));
  let lo=Math.min(...all), hi=Math.max(...all);
  if(lo===hi){lo-=1;hi+=1;}
  const padY=(hi-lo)*0.10;
  hi+=padY; lo = clampZero ? 0 : lo-padY;
  const ys=(v)=>pad.t+(1-(v-lo)/(hi-lo))*(h-pad.t-pad.b);
  const ticks=4, out=[];
  for(let i=0;i<=ticks;i++){
    const v=lo+(hi-lo)*i/ticks, y=ys(v);
    out.push(`<line x1="${pad.l}" y1="${y.toFixed(1)}" x2="${w-pad.r}" y2="${y.toFixed(1)}" stroke="var(--rule)" stroke-width="1" fill="none"/>`);
    out.push(`<text x="${pad.l-9}" y="${(y+4).toFixed(1)}" text-anchor="end" class="ax">${yLabel==="pct"?(v*100).toFixed(0)+"%":fmtN(v)}</text>`);
  }
  const step=Math.max(1,Math.ceil(dates.length/7));
  dates.forEach((d,i)=>{ if(i%step&&i!==dates.length-1) return;
    out.push(`<text x="${xs(d).toFixed(1)}" y="${h-pad.b+18}" text-anchor="middle" class="ax">${d.slice(5)}</text>`); });
  const tags=[];
  series.forEach((s)=>{
    const pts=s.points.filter(p=>Number.isFinite(p[1]));
    if(!pts.length) return;
    const d=pts.map((p,i)=>`${i?"L":"M"}${xs(p[0]).toFixed(1)},${ys(p[1]).toFixed(1)}`).join(" ");
    out.push(`<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.muted?1.4:2.1}" stroke-linejoin="round" stroke-linecap="round" opacity="${s.muted?0.38:1}"/>`);
    const last=pts[pts.length-1];
    out.push(`<circle cx="${xs(last[0]).toFixed(1)}" cy="${ys(last[1]).toFixed(1)}" r="${s.muted?2.8:4.5}" fill="${s.color}" stroke="var(--surface)" stroke-width="2"/>`);
    if(s.label!==false) tags.push({y:ys(last[1]), name:s.name, color:s.color, op:s.muted?0.55:1});
  });
  tags.sort((a,b)=>a.y-b.y);
  for(let i=1;i<tags.length;i++) if(tags[i].y-tags[i-1].y<13) tags[i].y=tags[i-1].y+13;
  const over=tags.length?tags[tags.length-1].y-(h-pad.b):0;
  if(over>0) tags.forEach(t=>t.y-=over);
  for(const t of tags) out.push(`<text x="${(w-pad.r+11)}" y="${(t.y+4).toFixed(1)}" class="lbl" fill="${t.color}" opacity="${t.op}">${esc(t.name)}</text>`);
  (series[0]?.marks||[]).forEach(m=>{
    if(!dates.includes(m.date)) return;
    const x=xs(m.date);
    out.push(`<line x1="${x.toFixed(1)}" y1="${pad.t}" x2="${x.toFixed(1)}" y2="${h-pad.b}" stroke="var(--ink-2)" stroke-width="1" stroke-dasharray="3 3" fill="none" opacity="0.7"/>`);
    out.push(`<text x="${(x+5).toFixed(1)}" y="${pad.t+11}" class="mark">${esc(m.label)}</text>`);
  });
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(baseLabel||yLabel)}" preserveAspectRatio="xMidYMid meet">${out.join("")}</svg>`;
}

/**
 * Horizontal change bars. The value sits in its OWN right-hand column at a fixed
 * x rather than floating at the bar's end, so a long label and a long value can
 * never collide — which they did when the value tracked the bar.
 */
function deltaBars({rows, w=980, rowH=30, padT=10, padB=28, labelW=250, valueW=78}) {
  const h=padT+rows.length*rowH+padB;
  const trackL=labelW, trackR=w-valueW;
  const max=Math.max(0.12,...rows.map(r=>Math.abs(r.delta??0)));
  const zero=trackL+(trackR-trackL)*0.46;
  const half=Math.min(zero-trackL, trackR-zero)*0.95;
  const out=[`<line x1="${zero}" y1="${padT}" x2="${zero}" y2="${h-padB}" stroke="var(--rule-2)" stroke-width="1" fill="none"/>`];
  rows.forEach((r,i)=>{
    const y=padT+i*rowH, cy=y+rowH/2;
    out.push(`<text x="${trackL-14}" y="${cy+4}" text-anchor="end" class="lbl">${esc(r.label)}</text>`);
    if(r.delta==null){ out.push(`<text x="${w-8}" y="${cy+4}" text-anchor="end" class="ax">no data</text>`); return; }
    const len=(r.delta/max)*half;
    out.push(`<rect x="${Math.min(zero,zero+len).toFixed(1)}" y="${(cy-7).toFixed(1)}" width="${Math.max(1.5,Math.abs(len)).toFixed(1)}" height="14" rx="3" fill="${r.color}"/>`);
    out.push(`<text x="${w-8}" y="${cy+4}" text-anchor="end" class="val" fill="${r.color}">${sgn(r.delta)}</text>`);
  });
  out.push(`<text x="${zero}" y="${h-9}" text-anchor="middle" class="ax">no change</text>`);
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="change, before against after" preserveAspectRatio="xMidYMid meet">${out.join("")}</svg>`;
}
module.exports={lineChart,deltaBars,esc,fmtN,sgn};

/** Inline sparkline of the daily run. Nulls break the line rather than interpolate. */
function spark(vals, {w=108,h=22,color="var(--ink-2)",lower=false}={}) {
  const v = vals.filter(x => x != null && Number.isFinite(x));
  if (v.length < 2) return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"></svg>`;
  let lo = Math.min(...v), hi = Math.max(...v);
  if (lo === hi) { lo -= 1; hi += 1; }
  const n = vals.length - 1;
  const x = i => (i/n)*(w-3)+1.5;
  const y = t => h-3 - ((t-lo)/(hi-lo))*(h-6);
  let d = "", pen = false;
  vals.forEach((t,i) => { if (t == null || !Number.isFinite(t)) { pen = false; return; }
    d += `${pen?"L":"M"}${x(i).toFixed(1)},${y(t).toFixed(1)}`; pen = true; });
  const last = [...vals].map((t,i)=>[t,i]).filter(([t])=>t!=null&&Number.isFinite(t)).pop();
  const first = [...vals].map((t,i)=>[t,i]).filter(([t])=>t!=null&&Number.isFinite(t))[0];
  const rose = last[0] >= first[0];
  const good = lower ? !rose : rose;
  const c = `var(${good ? "--ok" : "--fix"})`;
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="daily path">
    <path d="${d}" fill="none" stroke="${c}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" opacity="0.85"/>
    <circle cx="${x(last[1]).toFixed(1)}" cy="${y(last[0]).toFixed(1)}" r="2.2" fill="${c}"/></svg>`;
}
module.exports.spark = spark;
