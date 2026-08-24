const fs = require("fs");
const B = require("./build.js");
const { chip, stats, table, sec, page, OUT } = B;

const U = {
  water: "https://claude.ai/code/artifact/a9f7079a-00d8-4a94-b997-51e092dde567",
  monkey: "https://claude.ai/code/artifact/8a4cebf0-536c-45a0-95be-f8208539389f",
  brain: "https://claude.ai/code/artifact/1ae25776-9b79-42f6-a4ca-287cd2cacd19",
  knife: "https://claude.ai/code/artifact/f7043b01-1af9-4795-a257-ed47710e6323",
};

const card = (o) => `<article class="fix">
  <header><div class="idx">${o.rank}</div><div class="ttl">
    <h3><a href="${o.url}">${o.name}</a></h3>
    <div class="where">Universe ${o.id} · ${o.meta}</div>
  </div></header>
  <div class="badges" style="margin:0 0 12px">${o.chips.join("")}</div>
  <p>${o.body}</p>
  <p style="font-size:15px;color:var(--muted);margin:0"><strong>Do first:</strong> ${o.first}</p>
</article>`;

const body = [

  sec("board", "01", "The board",
    "Ranked by how much is still bleeding, not by size. Each name links to that game's full diagnosis.",
    [
      card({
        rank: 1, name: "My Knife Farm", id: "9610561918", url: U.knife,
        meta: "R$20.6K/day ≈ $2,160/mo · 21.3K DAU",
        chips: [chip("crit", "still falling"), chip("crit", "conversion −48%"), chip("watch", "paid dependency blocked")],
        body: "The only one of the four with no bottom — a new all-time low on 12 of the last 14 days, and hour-matched concurrents down 33–44% week over week on five of seven weekdays. The cause is not what it looks like: D1 retention is at a three-month high of 20.4% and session length has not moved all year. It is the money. Payer conversion fell 48% in three weeks; at matched audience size the game converts <strong>half</strong> the payers it did eight days earlier, on every platform and both product types.",
        first: "log into the Gamebeast dashboard — 692,260 events say a paid dependency is switched off — then pull an error export at v3831 and confirm a paying player's report that selling knives is broken.",
      }),
      card({
        rank: 2, name: "+1 Banana Monkey Destruction", id: "10399712766", url: U.monkey,
        meta: "R$151.3K/day ≈ $15,883/mo · 555.8K DAU",
        chips: [chip("good", "players stabilising"), chip("crit", "revenue −35% WoW"), chip("crit", "no error export")],
        body: "The player decline has stopped — DAU is up 5.3% week over week. The D1 fall from 22.5% to 14.2% is <strong>traffic mix, not the build</strong>: retention held on Friends and rose on Search, and fell only on the two sources Roblox scaled. The money is the real finding and it survives every control — half the payers at matched DAU, a step dated 12 August with no publish, on all four platforms. I could not identify the cause, and the reason is that this is the one game with no error message text at all.",
        first: "pull an “Errors and warnings by count” export. 133 million events with no text attached is why the biggest question on this game is still open.",
      }),
      card({
        rank: 3, name: "Climb Waterslide and Slide", id: "10030829154", url: U.water,
        meta: "R$270.6K/day ≈ $28,417/mo · 408.9K DAU",
        chips: [chip("good", "commercially healthy"), chip("crit", "tutorial regression"), chip("watch", "sentiment turning")],
        body: "The 52% concurrents drop is a pullback off a surge that crested on 18 August, not a break. Hour-matched, this game is <strong>up</strong> week over week on six weekdays of seven; 7-day DAU is 5.9% off its all-time peak and rising; revenue and payer conversion are both at all-time highs. Two things are genuinely broken and neither shows in the headline: a chronic scroll defect that costs ~350,000 players every six days at tutorial step 5, and v1706, which cost 4.3 points of tutorial completion in a day.",
        first: "fix the raft/dance shop scroll. Largest identified leak in the portfolio and the most-repeated complaint of the last fortnight.",
      }),
      card({
        rank: 4, name: "Become a Brainrot", id: "9963622286", url: U.brain,
        meta: "R$121.7K/day ≈ $12,783/mo · 227.3K DAU",
        chips: [chip("good", "bleed stopped"), chip("good", "World 3 worked"), chip("watch", "rebirth loop untouched")],
        body: "Eighty-one percent down from the July peak and <strong>recovering for the first time since</strong> — the drawdown bottomed on 15 August, weekday concurrents are up 21–54% week over week, revenue up 20%. The fall was reach, not the build: impressions −81% and new players −90% while click-appeal <em>rose</em>. World 3 is a genuine win that survives the mix control — deep base-upgrade completion up 12.2 to 12.6 points at identical returning-player mix — but the rebirth ladder over the same days is flat to −4 points.",
        first: "decide on the rebirth ladder. It is the only lever attached to D7 and D30, and D7/D30 is what the recommender now ranks on.",
      }),
    ].join("")),

  sec("today", "02", "All four fell today, and that needs an outside check",
    "The one finding that belongs to no single game.",
    `${table([{ t: "Game" }, { t: "3 Aug", c: "n" }, { t: "10 Aug", c: "n" }, { t: "17 Aug", c: "n" }, { t: "24 Aug", c: "n" }, { t: "vs last Mon", c: "n" }],
      [
        ["Climb Waterslide", { t: "10,857", c: "n" }, { t: "3,080", c: "n" }, { t: "5,062", c: "n" }, { t: "2,577", c: "n dn" }, { t: "−49.1%", c: "n dn" }],
        ["+1 Banana Monkey", { t: "15,411", c: "n" }, { t: "7,955", c: "n" }, { t: "6,654", c: "n" }, { t: "3,986", c: "n dn" }, { t: "−40.1%", c: "n dn" }],
        ["Become a Brainrot", { t: "4,936", c: "n" }, { t: "1,692", c: "n" }, { t: "2,464", c: "n" }, { t: "1,546", c: "n dn" }, { t: "−37.3%", c: "n dn" }],
        ["My Knife Farm", { t: "377", c: "n" }, { t: "382", c: "n" }, { t: "398", c: "n" }, { t: "180", c: "n dn" }, { t: "−54.8%", c: "n dn" }],
      ], null,
      "Mean concurrents across the 24 half-hour slots from 00:00 to 11:30 UTC — the window today has completed. Same weekday, identical clock times, so this is not a partial-day artifact.")}
     <p>Four unrelated games, four different genres, no shared publish, all down 37–55% against the same weekday a week earlier. And 24 August is the lowest Monday in the four-week window for every one of them, not just against last week.</p>
     <p><strong>It is not an outage.</strong> The deficit is smooth across all 24 slots on all four games — roughly −35% to −52% at every half hour, with no discontinuity anywhere. An outage leaves a cliff; this is a level shift across the whole day.</p>
     <div class="note"><h4>What I cannot tell you, and the test that would</h4>
      <p>The most parsimonious reading is a platform-wide contraction — late August is the northern-hemisphere school return, and Roblox traffic has a known seasonal dip through September. <strong>But I cannot measure Roblox-wide traffic from this repo</strong>, and four correlated games from one studio is not evidence about a platform.</p>
      <p>The test is cheap: compare against any game outside this portfolio over the same window, or against Roblox's own published platform DAU. Until one of those runs, treat today's number as a signal to watch and not as a finding about any individual game. Every per-game verdict in the four reports rests on data through 22–23 August and does not depend on this.</p></div>`),

  sec("money", "03", "Where the money is",
    "",
    `${table([{ t: "Game" }, { t: "Last 7 settled days", c: "n" }, { t: "≈ USD / month", c: "n" }, { t: "Prior 7 days", c: "n" }, { t: "4 weeks ago", c: "n" }, { t: "WoW", c: "n" }, { t: "vs 4wk", c: "n" }],
      [
        { __hl: 1, cells: ["Climb Waterslide", { t: "R$270.6K/d", c: "n" }, { t: "$28,417", c: "n" }, { t: "R$117.6K", c: "n" }, { t: "R$197.9K", c: "n" }, { t: "+130.1%", c: "n up" }, { t: "+36.8%", c: "n up" }] },
        ["+1 Banana Monkey", { t: "R$151.3K/d", c: "n" }, { t: "$15,883", c: "n" }, { t: "R$234.7K", c: "n" }, { t: "R$32.0K", c: "n" }, { t: "−35.5%", c: "n dn" }, { t: "+373.1%", c: "n up" }],
        ["Become a Brainrot", { t: "R$121.7K/d", c: "n" }, { t: "$12,783", c: "n" }, { t: "R$101.4K", c: "n" }, { t: "R$216.3K", c: "n" }, { t: "+20.0%", c: "n up" }, { t: "−43.7%", c: "n dn" }],
        { __hl: 1, cells: ["My Knife Farm", { t: "R$20.6K/d", c: "n" }, { t: "$2,160", c: "n" }, { t: "R$37.7K", c: "n" }, { t: "R$86.7K", c: "n" }, { t: "−45.4%", c: "n dn" }, { t: "−76.3%", c: "n dn" }],
        },
      ], null,
      "Mean daily revenue over the last seven settled days (16–22 Aug), converted at the DevEx rate of 0.0035 and × 30. Multiplying a seven-day mean by 30 is a simplification and 0.0035 is the developer payout rate — the right unit for “what the owner earns”, not for every valuation context.")}
     <p>Portfolio run-rate is about <strong>$59,200 a month</strong>, and the composition has shifted hard in four weeks. Waterslide has gone from the third-largest earner to the largest and is now roughly half of it. Knife Farm has gone from about $9,100/month to $2,160 — at the playbook's 6× owner-ask multiple that is roughly <strong>$41,600 of asset value lost in a month</strong>.</p>`),

  sec("gaps", "04", "What is missing, and what to pull",
    "Three of the four evidence gaps below can be closed with a browser and five minutes.",
    `${table([{ t: "Game" }, { t: "Newest error export", c: "n" }, { t: "Live version", c: "n" }, { t: "Gap" }, { t: "Why it matters", c: "w" }],
      [
        { __hl: 1, cells: ["+1 Banana Monkey", { t: "none", c: "n dn" }, { t: "v1242", c: "n" }, "everything", { t: "511 signatures over 133M events, all text-less. The 12 Aug payer halving cannot be diagnosed without it.", c: "w" }] },
        { __hl: 1, cells: ["My Knife Farm", { t: "v3829 (16 Aug)", c: "n" }, { t: "v3832", c: "n" }, "3 versions", { t: "A paying player reports selling is broken since v3831. No data covers it.", c: "w" }] },
        ["Become a Brainrot", { t: "v587 (16 Aug)", c: "n" }, { t: "v599", c: "n" }, "12 versions", { t: "Nine publishes and the whole CIRCUS EVENT ship are unmeasured.", c: "w" }],
        ["Climb Waterslide", { t: "v1708 (23 Aug)", c: "n" }, { t: "v1709", c: "n" }, "current", { t: "Fine.", c: "w" }],
      ])}
     <p style="margin-top:20px">Two structural gaps that are not one-click:</p>
     <ul class="tight">
       <li><strong>Knife Farm has no funnel instrumentation at all</strong>, and Banana Monkey's stops after three steps. Nothing on either game can be dated to a step. Brainrot's twenty steps across two funnels are the only reason its World 3 result could be measured — that is the difference instrumentation makes, and it is the cheapest item on either game's list.</li>
       <li><strong>The <code>MessageHash</code> → text lookup answers HTTP 500 on every game.</strong> That is why the dashboard exports matter at all: the API gives volumes, the export gives mechanisms. Until that endpoint works, a manual export is the only route to error text.</li>
     </ul>
     <div class="note"><h4>Filing is automatic now</h4>
      <p>Everything that came out of the Creator Dashboard is filed under <code>data/exports/&lt;universe&gt;-&lt;slug&gt;/{errors,feedback,metrics,reports}/</code>, renamed so it is attributable a week later. 36 files moved, 5 exact duplicates deleted, and 33 metric CSVs removed because they were already committed byte-identical in <code>data/verify/9610561918/</code>. <code>data/exports/INDEX.md</code> carries the layout and the attribution method. From here on, say “read this error report” and it gets filed in the same turn.</p></div>`),

  sec("method", "05", "How these numbers were produced",
    "",
    `<ul class="tight">
      <li><strong>All three repo gates green</strong> before and after: <code>npm run verify</code> 23 pass / 2 fail / 8 skip (both fails documented and held in the test's known-open list), <code>npm run audit-plan</code> 140 templates / 0 failures, <code>npm test</code> 44 pass.</li>
      <li><strong>Full life was pulled for the two games that lacked it.</strong> Waterslide went from 40 days to 118 and Banana Monkey from 30 to 53 — both covering the whole life of the game. Without that, Waterslide's current dip looks unprecedented; with it, the game has done two larger ones and recovered both.</li>
      <li><strong>Every concurrents number here came from a fresh half-hour pull</strong>, 1,032 buckets per game across 22 days. The stored half-hour series is mostly gap-fill padding and reads as an empty game if taken literally.</li>
      <li><strong>New-versus-returning splits</strong> were pulled the same day via <code>DailyActiveUsers</code> broken down by <code>IsNewUser</code> — the fastest test there is for separating “Roblox stopped sending players” from “the game stopped keeping them”.</li>
      <li><strong>Comparisons are weekday- and hour-matched throughout.</strong> Peak concurrents is a daily maximum, so a partial day can only undercount and a raw comparison manufactures a collapse that is not there. Where a raw number is quoted it is labelled as such.</li>
      <li><strong>Known-bad data is excluded and named</strong> in each report's Data notes: the phantom 2026-08-25 concurrents row on all four games, Knife Farm's gap-filled zero on 21 August, Knife Farm's corrupted <code>ItemMonetizationRevenue</code> for 30 Jul – 9 Aug, and Waterslide's DAU zeros for 16–17 August that today's grab repaired.</li>
      <li><strong>Where a cause could not be identified, that is reported as the result.</strong> Two games stepped down in payer conversion on 12 August and neither has an explanation that survives its own falsification test. Naming the measurement that would find it is the honest end of the analysis.</li>
     </ul>`),
].join("");

const html = page({
  title: "Four Games, One Board",
  eyebrow: "Portfolio diagnosis · 24 Aug 2026",
  chips: [chip("crit", "1 still falling"), chip("watch", "2 monetization breaks"), chip("good", "1 at all-time high")],
  h1: "Four games, one board",
  sub: "A LiveOps diagnosis of the whole portfolio, and the four full case studies behind it. One game is in free fall, two have an unexplained payer collapse dated to the same day, and the one that looks worst on the surface is having its best week ever.",
  meta: ["4 universes", "Behavioural data through <b>22 Aug</b>", "Concurrents through <b>24 Aug 11:30 UTC</b>", "Portfolio run-rate <b>≈ $59,200/mo</b>"],
  nav: [["board", "The board"], ["today", "Today's drop"], ["money", "Revenue"], ["gaps", "Evidence gaps"], ["method", "Method"]],
  verdict: "<strong>Knife Farm is the only emergency.</strong> It is the sole title still making new lows, its payer conversion has halved at matched audience size, and two live defects sit on top of that — a blocked third-party billing account logging 692,260 events, and a paying player reporting the core sell loop broken since v3831.",
  verdict2: "The two most surprising results are inversions of the obvious read. <strong>Waterslide's alarming 52% concurrents drop is not a decline</strong> — hour-matched it is up on six weekdays of seven and the game is inside the best week of its life. And <strong>Banana Monkey's retention collapse is traffic mix, not the build</strong> — Friends-source retention never moved. Meanwhile Brainrot, which fell 81%, stopped falling nine days ago.",
  footer: `Four case studies: <a href="${U.knife}">My Knife Farm</a> · <a href="${U.monkey}">+1 Banana Monkey Destruction</a> · <a href="${U.water}">Climb Waterslide and Slide</a> · <a href="${U.brain}">Become a Brainrot</a>. Built from <code>data/games/</code> and <code>data/exports/</code> in the analytics grabber repo, plus full-life and half-hour Open Cloud passes run 24 Aug 2026. Every claim is traceable to a metric, a series label and a date; where the evidence does not exist, the report says so rather than filling the gap.`,
  body,
});
fs.writeFileSync(OUT + "portfolio.html", html);
console.log("portfolio.html", html.length, "bytes");
