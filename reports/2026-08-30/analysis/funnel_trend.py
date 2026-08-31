import json,time,urllib.request,sys
KEY=open('C:/Users/bfhdh/Downloads/rbx-analytics-grabber-test/web/.opencloud-key').read().strip()
BASE='https://apis.roblox.com/analytics-query-api/v1'
def post(url,body):
    req=urllib.request.Request(url,data=json.dumps(body).encode(),
        headers={'x-api-key':KEY,'content-type':'application/json'},method='POST')
    with urllib.request.urlopen(req,timeout=60) as r: return json.load(r)
def get(path):
    req=urllib.request.Request(f'https://apis.roblox.com/analytics-query-api/{path}',
        headers={'x-api-key':KEY})
    with urllib.request.urlopen(req,timeout=60) as r: return json.load(r)
def query(uid,body,tries=25):
    r=post(f'{BASE}/universes/{uid}/metrics',body)
    if r.get('done'): return r.get('response')
    p=r.get('path')
    for _ in range(tries):
        time.sleep(1.2)
        s=get(p)
        if s.get('done'): return s.get('response')
    return None
def steps(uid,funnel,start,end,metric='FunnelStepCompletionRate'):
    b={'metric':metric,'granularity':'None','startTime':start,'endTime':end,
       'breakdown':['FunnelStep'],'limit':60}
    if funnel: b['filter']=[{'dimension':'FunnelName','values':[funnel],'operation':'In'}]
    resp=query(uid,b)
    out={}
    if not resp: return out
    for v in resp.get('values',[]):
        lbl=None
        for bd in (v.get('breakdowns') or []):
            lbl=bd.get('displayValue') or bd.get('value')
        pts=v.get('dataPoints') or []
        if pts and lbl is not None: out[str(lbl)]=pts[-1].get('value')
    return out
