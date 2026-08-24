const fs=require("fs");
const BASE="https://apis.roblox.com/analytics-query-api/v1";
const KEY=fs.readFileSync("C:/Users/bfhdh/Desktop/rbx-analytics-grabber-test/web/.opencloud-key","utf8").trim();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function query(universe,body,{tries=4}={}){
  for(let i=0;i<tries;i++){
    const r=await fetch(`${BASE}/universes/${universe}/metrics`,{method:"POST",
      headers:{"x-api-key":KEY,"content-type":"application/json"},body:JSON.stringify(body)});
    const txt=await r.text();
    if(r.status===429){ await sleep(6000*(i+1)); continue; }
    let j; try{ j=JSON.parse(txt); }catch{ return {error:"nonjson:"+txt.slice(0,200)}; }
    if(!r.ok) return {error:`${r.status}:${(j.error&&j.error.message)||txt.slice(0,200)}`};
    // async poll
    let poll=0;
    while(j.done===false&&j.path&&poll<40){
      await sleep(1200);
      const p=await fetch(`https://apis.roblox.com/${j.path.replace(/^\//,"")}`,{headers:{"x-api-key":KEY}});
      j=await p.json(); poll++;
    }
    return j;
  }
  return {error:"429 after retries"};
}
// flatten to [{ts,value,breakdowns}]
function points(j){
  const out=[];
  const vals=(j.response&&j.response.values)||j.values||[];
  for(const v of vals){
    const bd={}; for(const b of (v.breakdowns||[])) bd[b.dimension||b.key]=b.displayValue??b.value;
    for(const p of (v.dataPoints||v.points||[])) out.push({ts:p.time||p.timestamp,value:p.value,bd});
  }
  return out;
}
module.exports={query,points,sleep};
