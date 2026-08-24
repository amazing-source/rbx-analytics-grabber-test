// Shared style + chart runtime for the four game reports and the cover.
const HEAD = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>
:root{
  --ground:#edeff2; --surface:#ffffff; --surface-2:#f5f7f9;
  --ink:#171c24; --ink-2:#3d4551; --muted:#5c6674; --faint:#8b95a3;
  --rule:#d6dae1; --rule-strong:#b8bfc9;
  --accent:#15559e; --accent-soft:#e7eefa;
  --good:#1b7a4b; --watch:#b5820a; --crit:#b02b33;
  --good-bg:#e6f2eb; --watch-bg:#faf1dc; --crit-bg:#fbe9ea;
  --shadow:0 1px 2px rgba(23,28,36,.06),0 8px 24px -16px rgba(23,28,36,.28);
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --ground:#12161c; --surface:#1c2128; --surface-2:#232932;
    --ink:#e4e8ed; --ink-2:#c3cad3; --muted:#9aa5b4; --faint:#78838f;
    --rule:#2c333c; --rule-strong:#3d4650;
    --accent:#4a8cd8; --accent-soft:#1b2734;
    --good:#3fa971; --watch:#bc881f; --crit:#e4617c;
    --good-bg:#16261e; --watch-bg:#2a2213; --crit-bg:#2e1a20;
    --shadow:0 1px 2px rgba(0,0,0,.4),0 8px 24px -16px rgba(0,0,0,.8);
  }
}
:root[data-theme="dark"]{
  --ground:#12161c; --surface:#1c2128; --surface-2:#232932;
  --ink:#e4e8ed; --ink-2:#c3cad3; --muted:#9aa5b4; --faint:#78838f;
  --rule:#2c333c; --rule-strong:#3d4650;
  --accent:#4a8cd8; --accent-soft:#1b2734;
  --good:#3fa971; --watch:#bc881f; --crit:#e4617c;
  --good-bg:#16261e; --watch-bg:#2a2213; --crit-bg:#2e1a20;
  --shadow:0 1px 2px rgba(0,0,0,.4),0 8px 24px -16px rgba(0,0,0,.8);
}
*{box-sizing:border-box}
body{
  background:var(--ground); color:var(--ink);
  font-family:"Newsreader",Georgia,"Times New Roman",serif;
  font-size:17px; line-height:1.62; margin:0;
  -webkit-font-smoothing:antialiased;
}
.wrap{max-width:1040px;margin:0 auto;padding:0 24px 96px}
h1,h2,h3,h4,.disp{font-family:"Archivo","Helvetica Neue",Arial,sans-serif;text-wrap:balance}
h1{font-size:clamp(30px,4.6vw,46px);line-height:1.06;letter-spacing:-.022em;font-weight:700;margin:0 0 10px}
h2{font-size:clamp(21px,2.6vw,27px);line-height:1.18;letter-spacing:-.014em;font-weight:700;margin:0}
h3{font-size:18px;line-height:1.3;letter-spacing:-.008em;font-weight:600;margin:0 0 8px}
h4{font-size:14px;line-height:1.35;font-weight:600;margin:0 0 6px}
p{margin:0 0 14px;max-width:68ch}
a{color:var(--accent);text-decoration-thickness:1px;text-underline-offset:2px}
a:focus-visible,button:focus-visible,summary:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:2px}
code,.mono,.num{font-family:"IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace;font-variant-numeric:tabular-nums}
code{font-size:.86em;background:var(--surface-2);border:1px solid var(--rule);border-radius:3px;padding:.08em .34em;word-break:break-word}
.eyebrow{font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:.13em;text-transform:uppercase;color:var(--muted);font-weight:500}

.mast{border-bottom:2px solid var(--ink);padding:44px 0 20px}
.mast .kicker{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;margin-bottom:16px}
.mast .sub{font-size:19px;color:var(--ink-2);max-width:66ch;margin:6px 0 18px}
.metaline{display:flex;flex-wrap:wrap;gap:6px 22px;font-family:"IBM Plex Mono",monospace;font-size:11.5px;color:var(--muted);padding-top:14px;border-top:1px solid var(--rule)}
.metaline b{color:var(--ink-2);font-weight:600}

.verdict{background:var(--surface);border:1px solid var(--rule);border-left:3px solid var(--accent);border-radius:2px;padding:20px 22px;margin:28px 0 34px;box-shadow:var(--shadow)}
.verdict p{font-size:19px;line-height:1.5;margin:0;color:var(--ink)}
.verdict p+p{margin-top:12px;font-size:16.5px;color:var(--ink-2)}

.chip{display:inline-flex;align-items:center;gap:6px;font-family:"IBM Plex Mono",monospace;font-size:10.5px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;padding:4px 9px;border-radius:2px;border:1px solid;white-space:nowrap}
.chip::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}
.chip.good{color:var(--good);background:var(--good-bg);border-color:color-mix(in srgb,var(--good) 34%,transparent)}
.chip.watch{color:var(--watch);background:var(--watch-bg);border-color:color-mix(in srgb,var(--watch) 34%,transparent)}
.chip.crit{color:var(--crit);background:var(--crit-bg);border-color:color-mix(in srgb,var(--crit) 34%,transparent)}
.chip.flat{color:var(--muted);background:var(--surface-2);border-color:var(--rule)}

section{padding-top:44px;scroll-margin-top:56px}
.sechead{display:flex;align-items:baseline;gap:14px;border-bottom:1px solid var(--rule-strong);padding-bottom:10px;margin-bottom:22px}
.sechead .n{font-family:"IBM Plex Mono",monospace;font-size:12px;color:var(--accent);font-weight:600;letter-spacing:.06em;flex:none}
.lede{font-size:18px;color:var(--ink-2);max-width:66ch}

nav.toc{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--ground) 92%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--rule);margin:0 -24px;padding:9px 24px;display:flex;gap:4px;overflow-x:auto;scrollbar-width:thin}
nav.toc a{font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);text-decoration:none;padding:5px 9px;border-radius:2px;white-space:nowrap}
nav.toc a:hover{color:var(--ink);background:var(--surface-2)}

.tw{overflow-x:auto;border:1px solid var(--rule);border-radius:2px;background:var(--surface)}
table{border-collapse:collapse;width:100%;font-family:"IBM Plex Mono",monospace;font-size:12.5px;font-variant-numeric:tabular-nums}
th,td{padding:7px 12px;text-align:left;border-bottom:1px solid var(--rule);white-space:nowrap;vertical-align:top}
thead th{background:var(--surface-2);font-size:10.5px;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);font-weight:600}
tbody tr:last-child td{border-bottom:0}
td.n,th.n{text-align:right}
td.w,th.w{white-space:normal;font-family:"Newsreader",serif;font-size:15px;line-height:1.45;min-width:20ch}
.up{color:var(--good)}.dn{color:var(--crit)}.fl{color:var(--muted)}
tr.hl td{background:var(--accent-soft)}
.cap{display:block;font-family:"IBM Plex Mono",monospace;font-size:11px;color:var(--muted);padding:8px 2px 0;line-height:1.55;margin-bottom:26px;max-width:80ch}

.fix{background:var(--surface);border:1px solid var(--rule);border-radius:2px;padding:18px 20px;margin-bottom:14px;box-shadow:var(--shadow)}
.fix>header{display:flex;align-items:flex-start;gap:12px;margin-bottom:10px}
.fix .idx{font-family:"IBM Plex Mono",monospace;font-size:12px;font-weight:600;color:var(--surface);background:var(--ink);width:22px;height:22px;border-radius:2px;display:grid;place-items:center;flex:none;margin-top:2px}
.fix .ttl{flex:1;min-width:0}
.fix h3{margin:0 0 4px}
.fix .where{font-family:"IBM Plex Mono",monospace;font-size:11.5px;color:var(--muted);line-height:1.6;word-break:break-word}
.fix p{font-size:16px;margin:0 0 10px}
.fix p:last-child{margin-bottom:0}
.fix .quote{border-left:2px solid var(--rule-strong);padding:2px 0 2px 13px;margin:10px 0;color:var(--ink-2);font-style:italic;font-size:15.5px}
.fix .quote span{display:block}
.fix .quote span+span{margin-top:5px}
.badges{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}

.hyp td.v{font-weight:600;font-size:11px;letter-spacing:.06em;text-transform:uppercase}
.hyp td.v[data-v="kept"]{color:var(--crit)}
.hyp td.v[data-v="cut"]{color:var(--good)}
.hyp td.v[data-v="partial"]{color:var(--watch)}

.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(158px,1fr));gap:1px;background:var(--rule);border:1px solid var(--rule);border-radius:2px;overflow:hidden}
.stat{background:var(--surface);padding:14px 16px}
.stat .k{font-family:"IBM Plex Mono",monospace;font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);margin-bottom:5px}
.stat .v{font-family:"Archivo",sans-serif;font-size:25px;font-weight:600;letter-spacing:-.02em;line-height:1.05;font-variant-numeric:tabular-nums}
.stat .d{font-family:"IBM Plex Mono",monospace;font-size:11.5px;margin-top:4px;color:var(--muted);line-height:1.45}

figure{margin:0}
.chart{background:var(--surface);border:1px solid var(--rule);border-radius:2px;padding:16px 16px 10px;position:relative}
.chart .ct{font-family:"Archivo",sans-serif;font-size:14px;font-weight:600;margin-bottom:2px}
.chart .cs{font-family:"IBM Plex Mono",monospace;font-size:11px;color:var(--muted);margin-bottom:12px}
.chart svg{display:block;width:100%;height:auto;overflow:visible}
.tip{position:absolute;pointer-events:none;background:var(--ink);color:var(--ground);font-family:"IBM Plex Mono",monospace;font-size:11px;line-height:1.5;padding:6px 9px;border-radius:2px;white-space:nowrap;opacity:0;transition:opacity .1s;z-index:5;left:0;top:0}
.tip.on{opacity:1}
details{background:var(--surface);border:1px solid var(--rule);border-radius:2px;padding:12px 16px;margin-bottom:10px}
summary{cursor:pointer;font-family:"Archivo",sans-serif;font-weight:600;font-size:15px}
summary::marker{color:var(--muted)}
details[open] summary{margin-bottom:12px;padding-bottom:9px;border-bottom:1px solid var(--rule)}
.note{background:var(--surface-2);border:1px solid var(--rule);border-left:3px solid var(--watch);border-radius:2px;padding:14px 18px;margin:0 0 14px}
.note p{margin:0;font-size:16px}.note p+p{margin-top:9px}
.note h4{font-family:"IBM Plex Mono",monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--watch);margin:0 0 6px}
ul.tight{margin:0 0 14px;padding-left:20px}ul.tight li{margin-bottom:7px;max-width:66ch}
ol.act{margin:0 0 14px;padding-left:20px}ol.act li{margin-bottom:9px;max-width:66ch}
footer{margin-top:60px;padding-top:20px;border-top:2px solid var(--ink);font-family:"IBM Plex Mono",monospace;font-size:11.5px;color:var(--muted);line-height:1.7}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
@media (max-width:640px){
  body{font-size:16px}.wrap{padding:0 16px 64px}nav.toc{margin:0 -16px;padding:8px 16px}
  .mast{padding-top:30px}
}
</style>`;

const SCRIPT_OPEN = "<" + "script>";
const SCRIPT_CLOSE = "<" + "/script>";

const CHARTJS = SCRIPT_OPEN + `
(function(){
  var css=function(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim();};
  function fmt(v){
    if(v==null) return "—";
    var a=Math.abs(v);
    if(a>=1e6) return (v/1e6).toFixed(2)+"M";
    if(a>=1e4) return Math.round(v/1e3)+"K";
    if(a>=1e3) return (v/1e3).toFixed(1)+"K";
    return String(Math.round(v));
  }
  function draw(el){
    var d=JSON.parse(el.getAttribute("data-series"));
    var labels=JSON.parse(el.getAttribute("data-labels"));
    var marks=JSON.parse(el.getAttribute("data-marks")||"[]");
    var names=JSON.parse(el.getAttribute("data-x"));
    var W=880,H=el.getAttribute("data-h")?+el.getAttribute("data-h"):190,PL=54,PR=12,PT=12,PB=24;
    var iw=W-PL-PR, ih=H-PT-PB;
    var vals=d.filter(function(v){return v!=null;});
    if(!vals.length) return;
    var max=Math.max.apply(null,vals), min=0;
    var x=function(i){return PL+(d.length<2?0:i/(d.length-1)*iw);};
    var y=function(v){return PT+ih-((v-min)/((max-min)||1))*ih;};
    var accent=css("--accent"), rule=css("--rule"), muted=css("--muted"), surface=css("--surface");
    var g="";
    [0,0.5,1].forEach(function(f){
      var t=min+(max-min)*f, yy=y(t).toFixed(1);
      g+='<line x1="'+PL+'" x2="'+(W-PR)+'" y1="'+yy+'" y2="'+yy+'" stroke="'+rule+'" stroke-width="1"/>'
        +'<text x="'+(PL-8)+'" y="'+(y(t)+3.5).toFixed(1)+'" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="10" fill="'+muted+'">'+fmt(t)+'</text>';
    });
    marks.forEach(function(m){
      var mx=x(m.i);
      g+='<line x1="'+mx.toFixed(1)+'" x2="'+mx.toFixed(1)+'" y1="'+PT+'" y2="'+(PT+ih)+'" stroke="'+muted+'" stroke-width="1" stroke-dasharray="2 3" opacity=".8"/>'
        +'<text x="'+(mx+4).toFixed(1)+'" y="'+(PT+10)+'" font-family="IBM Plex Mono,monospace" font-size="9.5" fill="'+muted+'">'+m.t+'</text>';
    });
    var dp="",open=false,firstI=null,lastI=null;
    d.forEach(function(v,i){
      if(v==null){ open=false; return; }
      var px=x(i).toFixed(1), py=y(v).toFixed(1);
      if(!open){ dp+=" M"+px+","+py; open=true; if(firstI===null) firstI=i; }
      else dp+=" L"+px+","+py;
      lastI=i;
    });
    var ap="";
    if(firstI!==null){
      ap="M"+x(firstI).toFixed(1)+","+(PT+ih);
      d.forEach(function(v,i){ if(v==null) return; ap+=" L"+x(i).toFixed(1)+","+y(v).toFixed(1); });
      ap+=" L"+x(lastI).toFixed(1)+","+(PT+ih)+" Z";
    }
    var xl="";
    labels.forEach(function(l){
      xl+='<text x="'+x(l.i).toFixed(1)+'" y="'+(H-6)+'" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" fill="'+muted+'">'+l.t+'</text>';
    });
    var uid="g"+Math.random().toString(36).slice(2,8);
    var svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+(el.getAttribute("data-alt")||"chart")+'">'
      +'<defs><linearGradient id="'+uid+'" x1="0" y1="0" x2="0" y2="1">'
      +'<stop offset="0%" stop-color="'+accent+'" stop-opacity=".22"/><stop offset="100%" stop-color="'+accent+'" stop-opacity="0"/></linearGradient></defs>'
      +g+'<path d="'+ap+'" fill="url(#'+uid+')"/>'
      +'<path d="'+dp.replace(/^\s+/,"")+'" fill="none" stroke="'+accent+'" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>'
      +(lastI!==null?'<circle cx="'+x(lastI).toFixed(1)+'" cy="'+y(d[lastI]).toFixed(1)+'" r="3.5" fill="'+accent+'" stroke="'+surface+'" stroke-width="2"/>':"")
      +'<line class="ch-cross" x1="0" x2="0" y1="'+PT+'" y2="'+(PT+ih)+'" stroke="'+accent+'" stroke-width="1" opacity="0"/>'
      +'<circle class="ch-dot" r="4" fill="'+accent+'" stroke="'+surface+'" stroke-width="2" opacity="0"/>'
      +'<rect class="ch-hit" x="'+PL+'" y="'+PT+'" width="'+iw+'" height="'+ih+'" fill="transparent"/>'
      +xl+'</svg>';
    el.querySelector(".plot").innerHTML=svg;
    var tip=el.querySelector(".tip"), s=el.querySelector("svg");
    var cross=s.querySelector(".ch-cross"), dot=s.querySelector(".ch-dot"), hit=s.querySelector(".ch-hit");
    function move(ev){
      var r=s.getBoundingClientRect();
      var cx=(ev.touches?ev.touches[0].clientX:ev.clientX)-r.left;
      var rel=(cx/r.width)*W;
      var i=Math.round((rel-PL)/(iw||1)*(d.length-1));
      i=Math.max(0,Math.min(d.length-1,i));
      var j=i,k=1;
      while(d[j]==null&&k<16){ j=i+(k%2?Math.ceil(k/2):-Math.ceil(k/2)); k++; if(j<0||j>=d.length) j=i; }
      if(d[j]==null) return;
      cross.setAttribute("x1",x(j)); cross.setAttribute("x2",x(j)); cross.setAttribute("opacity",".55");
      dot.setAttribute("cx",x(j)); dot.setAttribute("cy",y(d[j])); dot.setAttribute("opacity","1");
      tip.textContent=names[j]+"  ·  "+fmt(d[j]);
      tip.classList.add("on");
      var lft=(x(j)/W)*r.width;
      tip.style.left=Math.max(4,Math.min(r.width-tip.offsetWidth-4,lft-tip.offsetWidth/2))+"px";
      tip.style.top=Math.max(0,(y(d[j])/H)*r.height-36)+"px";
    }
    function out(){ cross.setAttribute("opacity","0"); dot.setAttribute("opacity","0"); tip.classList.remove("on"); }
    hit.addEventListener("mousemove",move);
    hit.addEventListener("mouseleave",out);
    hit.addEventListener("touchmove",function(e){move(e);e.preventDefault();},{passive:false});
    hit.addEventListener("touchend",out);
  }
  function all(){
    var els=document.querySelectorAll(".chart[data-series]");
    for(var i=0;i<els.length;i++){ try{ draw(els[i]); }catch(e){} }
  }
  all();
  var t; window.addEventListener("resize",function(){ clearTimeout(t); t=setTimeout(all,180); });
  if(window.matchMedia){
    var mq=window.matchMedia("(prefers-color-scheme: dark)");
    if(mq.addEventListener) mq.addEventListener("change",all);
  }
})();
` + SCRIPT_CLOSE;

module.exports = { HEAD, CHARTJS };
