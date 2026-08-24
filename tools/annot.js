const fs=require("fs");
function annotations(id){
  const t=fs.readFileSync(`C:/Users/bfhdh/Desktop/rbx-analytics-grabber-test/data/games/${id}/annotations.md`,"utf8");
  const out=[];
  for(const m of t.matchAll(/`(\{.*?\})`/g)){
    try{ const a=JSON.parse(m[1]); out.push(a); }catch{}
  }
  return out.sort((a,b)=>a.createdUtcTime<b.createdUtcTime?-1:1);
}
function events(id){
  return annotations(id).filter(a=>a.annotationType==="ANNOTATION_TYPE_EXPERIENCE_EVENT_STATE")
    .map(a=>({t:a.createdUtcTime,name:a.metadata.experienceEventState.eventName,
              state:a.metadata.experienceEventState.eventStateType.replace("EVENT_STATE_TYPE_EVENT_",""),
              id:String(a.metadata.experienceEventState.eventId)}));
}
function creative(id){
  return annotations(id).filter(a=>a.annotationType==="ANNOTATION_TYPE_PLACE_THUMBNAIL"||a.annotationType==="ANNOTATION_TYPE_PLACE_ICON")
    .map(a=>({t:a.createdUtcTime,kind:a.annotationType.replace("ANNOTATION_TYPE_PLACE_","")}));
}
function other(id){
  return annotations(id).filter(a=>!["ANNOTATION_TYPE_EXPERIENCE_EVENT_STATE","ANNOTATION_TYPE_PLACE_THUMBNAIL","ANNOTATION_TYPE_PLACE_ICON","ANNOTATION_TYPE_ENGINE_RELEASE"].includes(a.annotationType))
    .map(a=>({t:a.createdUtcTime,type:a.annotationType.replace("ANNOTATION_TYPE_",""),meta:JSON.stringify(a.metadata)}));
}
module.exports={annotations,events,creative,other};
