import sys, os, csv, re, collections; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
ROOT=os.path.dirname(os.path.abspath(__file__)); REPO=os.path.dirname(ROOT)
GID={'Brainrot':'9963622286','Seal':'10638354731','Verity':'10565445771','Waterslide':'10030829154'}
THEMES={
 'energy/limit/refill gate':r'\b(refill|recharg|energy|stamina|limit|limited|out of (words|messages)|unlimited|cooldown|wait(ing)? (for|to)|timer|run out)\b',
 'paywall / too expensive':r'\b(pay ?wall|too expensive|expensive|robux|p2w|pay ?to ?win|greedy|money grab|scam)\b',
 'lag / performance':r'\b(lag|laggy|fps|frame|freeze|frozen|crash|glitch|bug|glitchy|slow)\b',
 'progress lost / save':r'\b(lost (my|all)|reset|wipe|save|progress|didn\'?t get|not receive|stole)\b',
 'boring / repetitive':r'\b(boring|bored|repetitive|nothing to do|grind|too long|slow progress)\b',
 'too hard / unfair':r'\b(too hard|impossible|unfair|difficult)\b',
 'creepy / privacy (AI)':r'\b(creep|creepy|knows (too much|abt|about) me|scary|personal info|privacy|weird)\b',
}
print("### Player-feedback themes — % of that game's comments matching (regex over comment text)")
print("Small, self-selected samples: this ranks WHAT people complain about, it does not measure how many feel it.\n")
rows={}
for g,uid in GID.items():
    p=os.path.join(REPO,'data','games',uid,'feedback.csv')
    txt=[];votes=collections.Counter()
    with open(p,encoding='utf-8',errors='replace') as f:
        for r in csv.DictReader(f):
            votes[r.get('category','')]+=1
            c=(r.get('comment') or '').strip()
            if c: txt.append(c.lower())
    n=len(txt); tot=sum(votes.values())
    rows[g]={'n_comments':n,'n_votes':tot,
             'downvote %':round(100*votes.get('Downvote',0)/tot,1) if tot else 0}
    for th,rx in THEMES.items():
        rows[g][th]=round(100*sum(1 for t in txt if re.search(rx,t))/n,1) if n else 0
import pandas as pd; pd.set_option('display.width',220)
df=pd.DataFrame(rows).T
print(df.to_string())
