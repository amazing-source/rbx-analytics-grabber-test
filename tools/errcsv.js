const fs=require("fs");
function parseCSV(t){const rows=[];let f="",r=[],q=false;for(let i=0;i<t.length;i++){const c=t[i];
 if(q){ if(c==='"'){ if(t[i+1]==='"'){f+='"';i++;} else q=false;} else f+=c; }
 else { if(c==='"'){q=true;} else if(c===","){r.push(f);f="";} else if(c==="\n"){r.push(f);rows.push(r);r=[];f="";} else if(c==="\r"){} else f+=c; } }
 if(f!==""||r.length){r.push(f);rows.push(r);} return rows;}
function readErrors(p){
  const rows=parseCSV(fs.readFileSync(p,"utf8"));
  const h=rows[0].map(x=>x.trim());
  const iv=h.indexOf("First seen version");
  const im=iv>=0?5:4, it=iv>=0?6:5;
  return rows.slice(1).filter(r=>r[0]&&/^\d+$/.test(r[0].trim())).map(r=>({
    n:+r[0], sev:r[1], type:r[2], seen:r[3], ver:iv>=0?r[4]:"",
    msg:(r[im]||"").replace(/\s+/g," ").trim(), tr:(r[it]||"").replace(/\s+/g," ").trim()}));
}
module.exports={parseCSV,readErrors};
