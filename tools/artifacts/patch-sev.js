const fs = require("fs");
let r = fs.readFileSync(__dirname + "/render.js", "utf8");
r = r.replace(/const SEV = \{[\s\S]*?\n\};/,
`const SEV = {
  good:     { cls:"ok",    word:"improved" },
  neutral:  { cls:"flat",  word:"held" },
  warning:  { cls:"watch", word:"soft" },
  serious:  { cls:"fix",   word:"down" },
  critical: { cls:"fix",   word:"sharp drop" },
  // verdict-level aliases used by content.json
  watch:    { cls:"watch", word:"watch" },
  fix:      { cls:"fix",   word:"needs work" },
};`);

// cover priorities, rewritten
r = r.replace(/  <section><h2>What is worth doing first<\/h2>[\s\S]*?<\/section>\n\n  <section><h2>Caveats/,
`  <section><h2>What is worth doing first</h2>
    <article class="hyp hyp--confirmed"><h3>Seal — progression stops at ten jobs</h3>
      <p style="margin-bottom:0"><code>TenJobs</code> churns 76%: three quarters of players who buy an upgrade
      never finish ten jobs, and the funnel ends at 9.2% end to end. Onboarding was fixed and works; what follows
      it was never built to carry them.</p></article>
    <article class="hyp hyp--confirmed"><h3>Waterslide — the raft shop is still throwing after its fix</h3>
      <p style="margin-bottom:0"><code>GoShop_Raft:102</code> fails inside <code>RefreshList</code> the moment the
      shop opens, first seen on <strong>V1721, 11 September</strong> — after the 10 September build that was meant
      to fix the raft UI. That screen is step 5 of the tutorial, and steps 5 and 10 together cost about a third of
      everyone who starts.</p></article>
    <article class="hyp hyp--likely"><h3>Banana Monkey — pacing, not a patch</h3>
      <p style="margin-bottom:0">Listing rejection fell 46% and play-through rose 14%, so the thumbnail is pulling
      better than ever. Both bounce windows then rose about 20% and session duration fell 23%. They arrive better
      and leave faster — that gap is the work.</p></article>
    <article class="hyp hyp--confirmed"><h3>Brainrot — the new players are not paying</h3>
      <p style="margin-bottom:0">DAU up 23% and paying users flat at 744, which is the entire reason ARPU looks
      bad. The quest track hands new players rewards and never introduces them to anything priced.</p></article>
    <article class="hyp hyp--unknown"><h3>All five — D8–28 is falling together</h3>
      <p style="margin-bottom:0">The long-horizon cohort is down on every game in the pack: Brainrot −6.8%,
      Waterslide −18.2%, Monkey −22.5%, Verity −46.0%. That is the horizon Roblox re-weighted its recommender to
      in June. Five unrelated games moving as a block is a reason to check the platform before checking any one
      codebase.</p></article>
  </section>

  <section><h2>Caveats`);
fs.writeFileSync(__dirname + "/render.js", r);
console.log("sev aliases + cover priorities patched");
