const fs = require("fs");
const B = require("./build.js");
const { dauChart, ccuChart, chip, stats, table, fix, sec, page, OUT } = B;
const ID = "10030829154";

const FIXES = [
  fix(1, "The raft / dance shop cannot be scrolled",
    `Players.&lt;Player&gt;.PlayerScripts.UI.GoShop_Raft:102 — <code>attempt to index nil with 'Get'</code> in <code>RefreshList</code>, called from <code>OnOpen</code>. 257 events on v1705, 77 on v1708.`,
    `<p>The logged nil index is the visible half. The mechanism was already read out of the place on 23 Aug and is recorded in <code>CLAUDE.md</code>: a tutorial helper holds the shop's <code>CanvasPosition</code> inside a <code>while</code> loop whose exit test is float equality against a value Roblox <em>clamps</em>. The test never passes, the loop never exits, and every 0.2 s it overwrites whatever the player just scrolled to. Working code doing the wrong thing — it throws nothing, so most of its damage never reaches the error export at all.</p>
     <p>Its footprint is the funnel: <strong>tutorial step 5 <code>ToRaftShop</code> loses about 350,000 players</strong> in the six days from 18 Aug (1.57M reach step 4, 1.31M reach step 5). Conditional pass rate 82.5–86.8% against 97–100% for every step either side.</p>
     <div class="quote"><span>“Does not even let me scroll down”</span><span>“It won't let me scroll up on the raft choice menu”</span><span>“Fix the scroll on dance purchases, fun game but the scroll on the dance purchases don't work. Frustrating as heck.”</span><span>“when I go to buy new rafts, I can't scroll down further than the teacups raft, which means I'm stuck with…”</span></div>
     <p>And it blocks the tutorial outright for some players — which is a progression dead-end, not a cosmetic annoyance:</p>
     <div class="quote"><span>“no deja comprar y/o equipar otra balza para terminar el tutorial y no puedo avanzar”</span><span>“I'm now only stuck at tutorial and can't get out I already bought it's given me and yet I'm still stuck at tutorial”</span></div>
     <p><strong>Grep for the class, not just this line:</strong> <code>while &lt;property&gt; ~= &lt;computed&gt;</code> against any engine property the engine clamps is an infinite loop by construction. Also check for coroutines spawned per UI-open with no <code>task.cancel</code> on close.</p>`,
    [chip("crit", "progression blocker"), chip("crit", "~350K players / 6d"), chip("watch", "chronic, not new")]),

  fix(2, "v1706 broke the pet step of the tutorial",
    `ReplicatedStorage.ToolScripts.Convert:274 <code>GetPetQualityColor</code> — <code>Argument 1 missing or nil</code>, called from ServerScriptService.Manager.PetBagMgr:249. First seen v1706. Also Players.&lt;Player&gt;.PlayerScripts.Service.PlayerService:52 <code>PlayerDataInit</code>, 46 events, v1706.`,
    `<p>v1706 published <strong>2026-08-22 16:55 UTC</strong>. Tutorial completion fell the same day and kept falling the next: full-funnel completion 52.0% (21 Aug) → 47.7% (22 Aug) → 45.8% (23 Aug, partial). Only ~7 hours of the 22nd's cohort saw v1706, and the 23rd — fully post-v1706 — is worse, which is what a real regression looks like.</p>
     <p>The damage sits precisely where the pet code runs. Conditional pass rates, 21 Aug → 23 Aug: step 9→10 <code>BuyEgg</code> 88.6% → 85.9% → 84.2%; step 10→11 <code>OpenPetBag</code> 93.9% → 92.1%; step 11→12 <code>EquipPet</code> 90.1% → 88.4%.</p>
     <div class="quote"><span>“Ok so i bought something in the game and it was the sea dragon king I think. it was a pet uhm but I never got it?? when I literally payed for it.”</span></div>
     <p>Check line order before assuming the worst: if the Robux deduction sits <em>before</em> the throw the player was charged for nothing; if after, the button is merely dead. Say which.</p>`,
    [chip("crit", "revenue"), chip("crit", "−4.3pp tutorial completion"), chip("watch", "dated: v1706, 22 Aug 16:55Z")]),

  fix(3, "Saves are failing, and players are losing progress",
    `<code>[SaveLoadDataMgr] SavePlayerData failed: &lt;userId&gt;</code> with two distinct causes — ReplicatedStorage.ToolScripts.CopyTableScript:5 <code>invalid argument #1 to 'pairs' (table expected, got nil)</code> in <code>DeepCopy</code> (4,565 all-time), and DataStore <code>502: API Services rejected request</code>. Alongside <code>DataStoreService: KeyThrottled … API: UpdateAsync, GlobalDataStore</code> — 50,212 all-time, 15,783 in the recent window.`,
    `<p>Two separate problems wearing one message. <code>DeepCopy</code> receiving nil is a code defect. <code>KeyThrottled</code> on <code>GlobalDataStore</code> is a capacity problem — a shared key being hammered by every server. Both end the same way for the player.</p>
     <p><strong>Counts on a message that embeds a userId are a floor, never a total.</strong> Each player id makes its own signature row, and the export caps at ~26 rows, so the long tail is invisible. Size it against <code>ErrorCount</code> <code>LogSource: Server</code> per DAU before quoting a number.</p>
     <div class="quote"><span>“Game randomly reset while playing, I lost all of my potions, lost my timed rewards, claimed a pet, and it didn't show up when it reset.”</span><span>“갑자기 다 재설정 되있어요 제발 고쳐주세요” (everything suddenly got reset, please fix)</span><span>“mis monedas del juego se reinician y eso me impide avanzar”</span></div>`,
    [chip("crit", "data loss"), chip("watch", "count is a floor")]),

  fix(4, "MemoryStore is throttled — the largest server signature in the game",
    `<code>MemoryStoreService: RequestThrottled: Recent MemoryStores requests hit one or more limits. API: SortedMap</code> — <strong>430,428 events</strong> on v1681. Plus <code>PartitionRequestsOverLimit</code> (2,773) and <code>Timeout: The service is temporarily unavailable</code> (1,842).`,
    `<p>A capacity finding, not a bug: a shared SortedMap is over its request-unit budget. Count the stores the recent updates added before blaming the code. This is worth fixing <em>before</em> the next reach surge rather than during it — the game just ran its highest-traffic week ever and this is what was straining.</p>`,
    [chip("watch", "capacity"), chip("watch", "430K events")]),

  fix(5, "Teleports between places are failing",
    `<code>TeleportService: All players in teleport request are already in progress or throttled</code> — 549,959 all-time, 69,788 in the recent window. Plus <code>raiseTeleportInitFailedEvent</code> (19,336) and <code>The previous teleport is in processing (IsTeleporting)</code> (4,283).`,
    `<p>Waterslide runs six places. A failed teleport is a lost session, and on this game it also loses progress:</p>
     <div class="quote"><span>“cuando llegas a la meta y entras a la tienda de bailes el juego te saca del mundo y pierdes tu dinero y el progreso es super malo el juego por ese bug”</span></div>
     <p>The <code>IsTeleporting</code> variant says the code is re-issuing a teleport for a player already mid-teleport — guard the call site rather than retrying harder.</p>`,
    [chip("crit", "lost sessions"), chip("crit", "lost progress")]),

  fix(6, "Trade: nil index on close, and no way to refuse a trade",
    `Players.&lt;Player&gt;.PlayerScripts.UI.Trade:305 — <code>attempt to index nil with 'Name'</code> in <code>OnCloseTradeBtn</code>. 79,516 all-time, 4,472 in the recent window.`,
    `<p>Two things in one surface. The nil index is a defect. The absence of a decline/mute control is a design gap, and both arrive as the same complaint:</p>
     <div class="quote"><span>“bro i got scammed multiple times for my best pets yall gotta fix ur damn trading system because if i accept i cant unaccept”</span><span>“Put option to turn off TRADE. PEOPLE KEEP SPAMMING TRADE ONLY TO CANCEL. it's frustrating!”</span><span>“Turn off or on trade. Kids keeps on spamming it, which blocks my screen.”</span></div>`,
    [chip("watch", "trust / scams"), chip("watch", "79.5K events")]),

  fix(7, "One player's bad state can skip every service for that tick",
    `ServerScriptService.ServerInit — <code>for _, module in shared["Service"] do module.Update(dt) end</code> inside a Heartbeat, with no <code>pcall</code> anywhere.`,
    `<p>Recorded from a code read already in <code>CLAUDE.md</code>, repeated here because nothing has changed. When <code>PlayerService.Update</code> threw on one player (<code>pairs(nil)</code> via an uninitialised manager), <strong>every service after it in the iteration was skipped for that tick</strong> — and the line clearing the dirty flag sat after the throw, so it repeated at 10 Hz for that player's whole session.</p>
     <p>Wrap the iteration. The guard usually already exists elsewhere in the same file: <code>IsHavePass</code> checks the exact field <code>GetData</code> does not.</p>`,
    [chip("crit", "partial server outage"), chip("flat", "code read, confirmed")]),
];

const body = [

  sec("fixes", "01", "Fix list", "Seven items, ranked by what they cost rather than by how loudly they log. Item 1 emits almost nothing and is the biggest leak in the game; item 4 is the largest signature and is a capacity note.", FIXES.join("")),

  sec("ccu", "02", "The CCU fall, measured properly",
    "Daily peak concurrents fell 52% between 18 and 23 August. Almost all of that is the shape of the week and the end of a discovery surge — and on a matched comparison the game is up, not down.",
    `${stats([
      ["Daily PCU, 18 → 23 Aug", "−52%", "11,086 → 5,331 · raw daily peaks"],
      ["Sun → Sun, hour-matched", "−28.4%", "24 identical half-hour slots, 00:00–11:30Z"],
      ["Week over week, hour-matched", "+37% to +215%", "positive on 6 of 7 weekdays"],
      ["MA7 DAU vs all-time peak", "−5.9%", "459.0K on 22 Aug, and rising"],
    ])}
     <span class="cap">A raw daily PCU comparison can only ever undercount a partial day, and the intraday shape differs by weekday — so the raw −52% is true and answers the wrong question. The matched readings answer <em>is this day unusual for this weekday</em>.</span>
     ${ccuChart(ID, [{ d: "2026-08-14T19:00", t: "NEW UPDATE" }, { d: "2026-08-21T17:00", t: "NEW WORLD ends" }, { d: "2026-08-22T16:55", t: "v1706" }])}
     <span class="cap">The surge crests 18–20 Aug and gives back through the 23rd. The two dashed rules on the right are the days both live experience events ended.</span>
     ${table(
      [{ t: "Weekday" }, { t: "wk 03–09 Aug", c: "n" }, { t: "wk 10–16 Aug", c: "n" }, { t: "wk 17–23 Aug", c: "n" }, { t: "wk3 / wk2", c: "n" }, { t: "wk3 / wk1", c: "n" }],
      [
        ["Mon", { t: "8,773", c: "n" }, { t: "3,909", c: "n" }, { t: "6,326", c: "n" }, { t: "+61.9%", c: "n up" }, { t: "−27.9%", c: "n dn" }],
        ["Tue", { t: "4,848", c: "n" }, { t: "4,438", c: "n" }, { t: "7,980", c: "n" }, { t: "+79.8%", c: "n up" }, { t: "+64.6%", c: "n up" }],
        ["Wed", { t: "5,006", c: "n" }, { t: "2,494", c: "n" }, { t: "7,860", c: "n" }, { t: "+215.2%", c: "n up" }, { t: "+57.0%", c: "n up" }],
        ["Thu", { t: "5,113", c: "n" }, { t: "3,279", c: "n" }, { t: "7,848", c: "n" }, { t: "+139.3%", c: "n up" }, { t: "+53.5%", c: "n up" }],
        ["Fri", { t: "4,294", c: "n" }, { t: "3,962", c: "n" }, { t: "7,408", c: "n" }, { t: "+87.0%", c: "n up" }, { t: "+72.5%", c: "n up" }],
        ["Sat", { t: "4,292", c: "n" }, { t: "4,459", c: "n" }, { t: "6,126", c: "n" }, { t: "+37.4%", c: "n up" }, { t: "+42.7%", c: "n up" }],
        { __hl: 1, cells: ["Sun", { t: "3,829", c: "n" }, { t: "5,938", c: "n" }, { t: "3,861", c: "n" }, { t: "−35.0%", c: "n dn" }, { t: "+0.8%", c: "n fl" }] },
      ], null,
      "Mean concurrent players across the half-hour slots the three days share, same weekday each row. Sunday is the only negative column — and Sunday 16 Aug was itself the strongest Sunday of the month, so wk3/wk1 reads flat.")}
     <div class="note"><h4>The one genuinely open number</h4>
      <p>Today, Monday 24 Aug, 00:00–11:30 UTC: mean 2,577 against 5,062 last Monday — <strong>−49.1%</strong>, and below 10 Aug as well. That is a real level shift, not a partial-day artifact, because it is measured on identical clock slots.</p>
      <p>It is also <em>not specific to this game</em>: all four titles in the portfolio are down 37–55% on the same comparison, with a smooth deficit across all 24 slots and no discontinuity. See the portfolio note. Do not act on it as a Waterslide finding until an unrelated game rules the platform in or out.</p></div>`),

  sec("shape", "03", "The shape, over the game's whole life",
    "The 28-day window says “falling”. The full 118 days say this game oscillates violently and has recovered from two larger drawdowns already.",
    `${dauChart(ID, [{ d: "2026-06-07", t: "peak" }, { d: "2026-07-30", t: "peak" }])}
     <span class="cap">7-day mean DAU, 24 Apr – 22 Aug. Data begins 24 Apr; the game was created 13 Apr.</span>
     ${table([{ t: "Drawdown" }, { t: "From" }, { t: "Trough" }, { t: "Depth", c: "n" }, { t: "Outcome" }],
      [
        ["1", "7 Jun (200.6K)", "22 Jun (83.2K)", { t: "−58.5%", c: "n dn" }, "fully recovered by 7 Jul"],
        ["2", "3 Aug (487.7K)", "14 Aug (238.3K)", { t: "−51.1%", c: "n dn" }, "fully recovered by 22 Aug"],
        { __hl: 1, cells: ["current", "3 Aug peak", "22 Aug (459.0K)", { t: "−5.9%", c: "n fl" }, "MA7 still rising"] },
      ], null,
      "Measured on the 7-day mean so a single weekend cannot manufacture a trough. The week of 17 Aug is the highest-DAU week of this game's life at 470.6K.")}`),

  sec("ladder", "04", "The diagnostic ladder",
    "Bottom-up. The lowest broken rung is the diagnosis, and on this game nothing below the funnel is broken.",
    `${table([{ t: "Rung" }, { t: "Reading" }, { t: "Verdict", c: "w" }],
      [
        ["1 · Reach", "Impressions 6.65M/d (22 Aug), Home 5.33M. −33% from 19→22 Aug. New users 329.3K/d, 2nd highest ever.", { t: "Narrowed, not cut. Both events ended 21–22 Aug.", c: "w" }],
        ["2 · Hook", "D1 14.6% weekly — inside the 14–16% band this game has held all life. By source: Friends 18.7→17.6, Home 12.9→15.0, Search 15.0→13.1, Others 10.7→11.3.", { t: "Intact. Flat on every source, which rules out both a build regression and a traffic-mix story.", c: "w" }],
        ["3 · Return loop", "D7 1.04%, D30 0.22–0.45%, DAU/MAU 5.6%, RFYL7PlayDays 1.28.", { t: "Chronically weak and chronically flat. Not what changed — but it is the ceiling.", c: "w" }],
        ["4 · Money", "pCVR 3.65% weekly (all-time high), ARPU 0.60, revenue R$270.6K/d over the last 7 settled days ≈ $28.4K/mo. Rose on every platform.", { t: "Best in the portfolio and improving.", c: "w" }],
        ["5 · Technical", "Server crashes 1–3/day. ClientFpsP10 31–34. Client errors 4.3–5.1 per DAU — the lowest of the window.", { t: "Clear. Server ErrorCount spikes 20–50× on exactly the 4 publish days and clears within 24h — publish-path signature, not breakage.", c: "w" }],
        { __hl: 1, cells: ["6 · Funnel", "Step 5 loses ~350K players; v1706 cost 4.3pp of full completion; 839K of 1.66M finish.", { t: "The broken rung. One chronic defect and one dated regression.", c: "w" }] },
      ])}
     <span class="cap">Impressions, DAU, retention and revenue read through 22 Aug (Roblox's latest available day for those series); concurrents and errors through 23–24 Aug.</span>`),

  sec("funnel", "05", "The tutorial, step by step",
    "Fifteen steps, 1.66 million entrants in the six days from 18 August. Half of them never finish.",
    `${table([{ t: "Step" }, { t: "18 Aug", c: "n" }, { t: "19 Aug", c: "n" }, { t: "20 Aug", c: "n" }, { t: "21 Aug", c: "n" }, { t: "22 Aug", c: "n" }, { t: "23 Aug*", c: "n" }, { t: "Δ 21→23", c: "n" }],
      [
        ["1 StartSwim", { t: "100.0", c: "n" }, { t: "100.0", c: "n" }, { t: "100.0", c: "n" }, { t: "100.0", c: "n" }, { t: "100.0", c: "n" }, { t: "100.0", c: "n" }, { t: "0.0", c: "n fl" }],
        ["2 WaitGetCash", { t: "97.0", c: "n" }, { t: "97.2", c: "n" }, { t: "97.7", c: "n" }, { t: "97.8", c: "n" }, { t: "97.2", c: "n" }, { t: "97.3", c: "n" }, { t: "−0.5", c: "n fl" }],
        ["3 ClickSlide", { t: "94.2", c: "n" }, { t: "94.4", c: "n" }, { t: "95.0", c: "n" }, { t: "95.2", c: "n" }, { t: "94.0", c: "n" }, { t: "93.7", c: "n" }, { t: "−1.5", c: "n fl" }],
        ["4 WaitSlideEnd", { t: "93.9", c: "n" }, { t: "94.1", c: "n" }, { t: "94.8", c: "n" }, { t: "94.9", c: "n" }, { t: "93.8", c: "n" }, { t: "93.4", c: "n" }, { t: "−1.5", c: "n fl" }],
        { __hl: 1, cells: ["5 ToRaftShop", { t: "77.5", c: "n" }, { t: "77.5", c: "n" }, { t: "78.1", c: "n" }, { t: "80.2", c: "n" }, { t: "81.4", c: "n" }, { t: "79.8", c: "n" }, { t: "−0.4", c: "n fl" }] },
        ["6 StartSwim", { t: "76.5", c: "n" }, { t: "76.5", c: "n" }, { t: "77.2", c: "n" }, { t: "79.1", c: "n" }, { t: "79.8", c: "n" }, { t: "78.3", c: "n" }, { t: "−0.8", c: "n fl" }],
        ["7 WaitGetCash", { t: "76.2", c: "n" }, { t: "76.2", c: "n" }, { t: "76.9", c: "n" }, { t: "78.9", c: "n" }, { t: "79.5", c: "n" }, { t: "78.0", c: "n" }, { t: "−0.9", c: "n fl" }],
        ["8 ClickSlide", { t: "73.8", c: "n" }, { t: "73.9", c: "n" }, { t: "74.6", c: "n" }, { t: "76.5", c: "n" }, { t: "76.8", c: "n" }, { t: "75.1", c: "n" }, { t: "−1.4", c: "n fl" }],
        ["9 WaitSlideEnd", { t: "73.7", c: "n" }, { t: "73.8", c: "n" }, { t: "74.4", c: "n" }, { t: "76.3", c: "n" }, { t: "76.5", c: "n" }, { t: "74.9", c: "n" }, { t: "−1.4", c: "n fl" }],
        { __hl: 1, cells: ["10 BuyEgg", { t: "65.2", c: "n" }, { t: "65.5", c: "n" }, { t: "66.1", c: "n" }, { t: "67.7", c: "n" }, { t: "65.7", c: "n" }, { t: "63.1", c: "n" }, { t: "−4.6", c: "n dn" }] },
        { __hl: 1, cells: ["11 OpenPetBag", { t: "61.4", c: "n" }, { t: "61.7", c: "n" }, { t: "62.3", c: "n" }, { t: "63.6", c: "n" }, { t: "60.6", c: "n" }, { t: "58.1", c: "n" }, { t: "−5.5", c: "n dn" }] },
        { __hl: 1, cells: ["12 EquipPet", { t: "55.8", c: "n" }, { t: "55.9", c: "n" }, { t: "56.6", c: "n" }, { t: "57.3", c: "n" }, { t: "53.6", c: "n" }, { t: "51.8", c: "n" }, { t: "−5.5", c: "n dn" }] },
        ["13 ClosePetBag", { t: "55.7", c: "n" }, { t: "55.8", c: "n" }, { t: "56.5", c: "n" }, { t: "57.2", c: "n" }, { t: "53.4", c: "n" }, { t: "51.7", c: "n" }, { t: "−5.5", c: "n dn" }],
        ["14 Final", { t: "55.7", c: "n" }, { t: "55.8", c: "n" }, { t: "56.5", c: "n" }, { t: "57.2", c: "n" }, { t: "53.4", c: "n" }, { t: "51.7", c: "n" }, { t: "−5.5", c: "n dn" }],
        { __hl: 1, cells: ["15 AddFriendTip", { t: "50.4", c: "n" }, { t: "50.7", c: "n" }, { t: "51.4", c: "n" }, { t: "52.0", c: "n" }, { t: "47.7", c: "n" }, { t: "45.8", c: "n" }, { t: "−6.2", c: "n dn" }] },
      ], null,
      "<code>FunnelCohortCompletionRate</code>, funnel <code>TutorialFunnel</code>, % of entrants reaching each step. *23 Aug is a partial point — direction only, not quotable. Step 5 is the chronic defect; steps 10–15 are the v1706 regression.")}
     <div class="note"><h4>Two problems, two priorities — don't let the fix for one close the other</h4>
      <p>Step 5 read <strong>0.824</strong> pre-publish and <strong>0.866</strong> post-publish in an earlier measurement, and 82.5% → 86.8% now. It is the worst step in the funnel in <em>every</em> window. It was broken for weeks before the complaints arrived; the deploy only changed how many people hit it.</p>
      <p>A step at 0.83 is not a 17% problem, it is a compounding one. Fourteen steps at 0.97–1.00 with one at 0.83 still compounds to ~50% overall — so “half your new players never finish the tutorial” was true before v1706 and will still be true after it is rolled back. Size the chronic leak against the incident before choosing what to fix first.</p></div>`),

  sec("sentiment", "06", "Sentiment turned, and that is the forward risk",
    "Nothing in reach, retention or revenue is broken today. What is moving in the wrong direction is how people feel about the listing — and that is the input to next month's distribution.",
    `${table([{ t: "Week (Mon)" }, { t: "Upvote comments", c: "n" }, { t: "Downvotes", c: "n" }, { t: "Downvote rate", c: "n" }, { t: "Not-interested / M impressions", c: "n" }],
      [
        ["2026-07-13", { t: "12", c: "n" }, { t: "7", c: "n" }, { t: "36.8%", c: "n" }, { t: "42", c: "n" }],
        ["2026-07-20", { t: "28", c: "n" }, { t: "22", c: "n" }, { t: "44.0%", c: "n" }, { t: "41", c: "n" }],
        ["2026-07-27", { t: "36", c: "n" }, { t: "12", c: "n" }, { t: "25.0%", c: "n" }, { t: "45", c: "n" }],
        ["2026-08-03", { t: "21", c: "n" }, { t: "6", c: "n" }, { t: "22.2%", c: "n" }, { t: "44", c: "n" }],
        ["2026-08-10", { t: "11", c: "n" }, { t: "6", c: "n" }, { t: "35.3%", c: "n" }, { t: "56", c: "n" }],
        { __hl: 1, cells: ["2026-08-17", { t: "25", c: "n" }, { t: "26", c: "n" }, { t: "51.0%", c: "n dn" }, { t: "58", c: "n dn" }] },
      ], null,
      "Downvote rate is <code>down / (up + down)</code> on comment-bearing feedback. The <code>PlayerFeedbackVotesCount</code> Total series is upvotes minus downvotes and is useless on its own.")}
     ${table([{ t: "Version" }, { t: "Live" }, { t: "Up", c: "n" }, { t: "Down", c: "n" }, { t: "Rate", c: "n" }],
      [
        ["v1685", "31 Jul – 7 Aug", { t: "29", c: "n" }, { t: "5", c: "n" }, { t: "14.7%", c: "n up" }],
        ["v1691", "8 – 13 Aug", { t: "8", c: "n" }, { t: "7", c: "n" }, { t: "46.7%", c: "n dn" }],
        ["v1698", "14 – 21 Aug", { t: "24", c: "n" }, { t: "18", c: "n" }, { t: "42.9%", c: "n dn" }],
        ["v1705", "21 – 22 Aug", { t: "6", c: "n" }, { t: "4", c: "n" }, { t: "40.0%", c: "n dn" }],
        { __hl: 1, cells: ["v1706", "22 – 23 Aug", { t: "1", c: "n" }, { t: "6", c: "n" }, { t: "85.7%", c: "n dn" }] },
      ], null,
      "Grouped by the <code>asset_version</code> column on the feedback export — a second deploy log, and the only one that dates the root place reliably. <strong>v1706's n = 7. Treat 85.7% as a direction, not a rate.</strong>")}
     <p>Not-interested per million impressions has gone from 32–34 in June to 58. That is Roblox's own measure of people actively rejecting the listing, and it nearly doubled while impressions grew — the cost of broad distribution is being shown to people who do not want the game.</p>`),

  sec("hypotheses", "07", "Every hypothesis, and what killed it",
    "",
    table([{ t: "Hypothesis" }, { t: "Verdict" }, { t: "The test that decided it", c: "w" }],
      [
        ["The update broke the game", { t: "cut", c: "v", v: "cut" }, { t: "D1 flat on all four acquisition sources; payer conversion rose on every platform; MA7 DAU still climbing. A break shows up in at least one of those.", c: "w" }],
        ["Errors caused the CCU drop", { t: "cut", c: "v", v: "cut" }, { t: "Server ErrorCount spikes 20–50× on 4 of 4 publish days and no other day, clearing within 24h. Client errors per DAU are the lowest of the window (4.3–5.1).", c: "w" }],
        ["Roblox cut reach", { t: "partial", c: "v", v: "partial" }, { t: "Impressions −33% from 19→22 Aug while EndToEndCVR held 5.0–5.6%. Distribution narrowed; the listing still converts. QPTR work is not the lever.", c: "w" }],
        ["The two live events ending drove it", { t: "kept", c: "v", v: "kept" }, { t: "“NEW WORLD” ended 21 Aug 17:00Z and “NEW UPDATE” 22 Aug 20:00Z. The steep leg is 21→23 Aug. Association, correctly timed — not proof.", c: "w" }],
        ["It is normal oscillation for this game", { t: "kept", c: "v", v: "kept" }, { t: "Two prior drawdowns of −58.5% and −51.1%, both fully recovered. MA7 is −5.9% off the all-time peak and rising.", c: "w" }],
        ["It is seasonal / platform-wide", { t: "open", c: "v", v: "partial" }, { t: "All four portfolio games are down 37–55% today on identical clock slots, smoothly across all 24. Needs an unrelated game to settle.", c: "w" }],
        ["Sentiment will cost reach later", { t: "kept", c: "v", v: "kept" }, { t: "Downvote rate 22.2% → 51.0% in three weeks; not-interested 33 → 58. Neither has hit distribution yet. Both are inputs to it.", c: "w" }],
        ["The tutorial is broken", { t: "kept", c: "v", v: "kept" }, { t: "Step 5 loses ~350K players in 6 days; v1706 cost 4.3pp of full completion inside 24h, and the fully-post-v1706 day is worse than the partial one.", c: "w" }],
      ], "hyp")),

  sec("actions", "08", "What to do, in order",
    "",
    `<ol class="act">
      <li><strong>Fix the shop scroll.</strong> Largest identified leak in the game and the most-repeated complaint of the last fortnight. Success looks like step-5 conditional pass above 90% and step-15 completion above 55%.</li>
      <li><strong>Patch or roll back v1706's pet path.</strong> It cost 4.3pp of tutorial completion in one day; a config-level revert would take minutes, a build takes a deploy and a fresh set of <code>PlaceVersion</code> steps to disentangle from every metric afterwards.</li>
      <li><strong>Raise the MemoryStore / DataStore budget.</strong> The game just ran its biggest week and this is what strained. Do it before the next surge, not during.</li>
      <li><strong>Ship the next event.</strong> Both live events ended 21–22 Aug and reach fell with them. Cadence is the lever here — content resets the algorithm signal. QPTR optimisation would not restore this because click-appeal never dropped.</li>
      <li><strong>Give trade a decline/mute control.</strong> Cheap, and it is two of the last fortnight's downvotes on its own.</li>
      <li><strong>Watch the downvote rate weekly.</strong> Under 30% means the sentiment turn was v1706 and is fixed. Still above 45% in a week means it is the chronic scroll bug, and it will start costing reach.</li>
     </ol>
     <div class="note"><h4>What would overturn this diagnosis</h4>
      <p>A second consecutive week of hour-matched CCU below the 10–16 Aug week, <em>with</em> D1 falling on the Friends source. Friends retention is the truest read of the product because it is the least mix-sensitive; it has not moved (18.7% → 17.6%). If it drops below ~16% while the other sources hold, this stops being a reach story and becomes a build story.</p></div>`),

  sec("data", "09", "Data notes",
    "",
    `<ul class="tight">
      <li>All three repo gates green at time of writing: <code>verify</code> 23 pass / 2 fail / 8 skip (both fails documented and held), <code>audit-plan</code> 140 templates / 0 failures, <code>npm test</code> 44 pass.</li>
      <li><strong>Full life was not held before today.</strong> The corpus had 40 days; a fresh Open Cloud pass extended DAU, impressions, retention and revenue back to 24 Apr (118 days). Perf and crash metrics could not be extended — Roblox stores roughly 30 days of them and the rest has aged out permanently.</li>
      <li><code>PeakConcurrentPlayers</code> <code>ONE_DAY</code> carries a phantom <strong>2026-08-25</strong> row byte-identical to 08-24. That is the API carrying its last value into a day that has not happened, and it is excluded everywhere here.</li>
      <li>Half-hour PCU inside <code>series.json</code> is 78% <code>FILLED_ZERO</code> padding — the gateway clamps sub-daily windows to the final 24h and the exporter gap-fills the rest with zeros. <strong>Every half-hour number in this report came from a fresh Open Cloud pull</strong>, not from the stored series.</li>
      <li>DAU for 16–17 Aug was previously stored as <code>0</code> / <code>FILLED_ZERO</code> where Roblox serves 389,477 and 401,742. Today's grab repaired it. Any weekday baseline computed before today was wrong.</li>
      <li>The error export caps at ~26 rows and splits per-userId messages into separate signatures, so every count on a userId-bearing message is a floor.</li>
      <li>Newest error export held: <strong>v1708 (23 Aug)</strong>. Live version is v1709. Close enough to trust.</li>
     </ul>`),
].join("");

const html = page({
  title: "Waterslide Decline Watch",
  eyebrow: "LiveOps diagnosis · 24 Aug 2026",
  chips: [chip("good", "commercially healthy"), chip("crit", "tutorial regression"), chip("watch", "sentiment turning")],
  h1: "Climb Waterslide and Slide",
  sub: "The concurrents fell by half in five days. The game did not — it is inside the best week of its life, and the two things actually broken are in the tutorial.",
  meta: ["Universe <b>10030829154</b>", "Root place <b>139617346573330</b>", "6 places", "Live version <b>v1709</b>",
    "Behavioural data through <b>22 Aug</b>", "Concurrents through <b>24 Aug 11:30 UTC</b>"],
  nav: [["fixes", "Fix list"], ["ccu", "The CCU fall"], ["shape", "Shape"], ["ladder", "Ladder"], ["funnel", "Funnel"], ["sentiment", "Sentiment"], ["hypotheses", "Hypotheses"], ["actions", "Actions"], ["data", "Data notes"]],
  verdict: "The 52% concurrents drop is a pullback off a discovery surge that crested on 18 August, not a break. Hour-matched against the same weekday and the same clock hours, this game is <strong>up</strong> week over week on six days of seven; 7-day DAU sits 5.9% below its all-time peak and is still rising; revenue and payer conversion are both at all-time highs.",
  verdict2: "Two things <em>are</em> broken, and neither shows in the headline. A chronic scroll defect at tutorial step 5 costs roughly 350,000 players every six days and blocks progression outright for some of them. And v1706, published 22 Aug 16:55 UTC, cost 4.3 percentage points of tutorial completion in a day. Sentiment has turned hard alongside them — the comment downvote rate went 22% to 51% in three weeks.",
  footer: `Built from <code>data/games/10030829154/</code> plus a full-life Open Cloud pass and a fresh half-hour concurrents pull, both run 24 Aug 2026. Error message text from <code>data/exports/10030829154-climb-waterslide-and-slide/errors/</code>; player comments from the same folder's <code>feedback/</code> and from the grabber's <code>feedback.csv</code>. Everything marked <em>confirmed</em> is cell-verified or read out of the place; everything else is labelled.`,
  body,
});
fs.writeFileSync(OUT + "waterslide.html", html);
console.log("waterslide.html", html.length, "bytes");
