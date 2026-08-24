const fs = require("fs");
const B = require("./build.js");
const { dauChart, ccuChart, chip, stats, table, fix, sec, page, OUT } = B;
const ID = "10399712766";

const FIXES = [
  fix(1, "There is no error export for this game — pull one",
    `<code>data/exports/10399712766-banana-monkey-destruction/</code> holds one feedback export and nothing else. The grabber's own <code>errors.md</code> has <strong>511 distinct MessageHash signatures over 133,397,839 events</strong>, top signature 46.7% (62.3M) — and every one of them is text-less, because the async MessageHash dimension lookup answers 500.`,
    `<p>This is the single biggest evidence gap in the portfolio. Three of the four games have message text; this one does not, and it is the one with an unexplained monetization break. A hash with a volume tells you something is loud. It does not tell you what it is, where it fires, or what statement it skipped.</p>
     <p><strong>What to pull:</strong> the “Errors and warnings by count” export from the Creator Dashboard, ideally two — one all-time and one filtered to the last week — so the chronic and the new separate. Tell me when it lands and it gets filed automatically under that folder.</p>`,
    [chip("crit", "blocks diagnosis"), chip("crit", "133M events, no text")]),

  fix(2, "The Plus discount makes an item cost more",
    `Reported 15 Aug on v1228 by a downvoting player. Not confirmed in code — no error export exists to cross-check, and this class of defect logs nothing.`,
    `<div class="quote"><span>“Why is 2x cash for non plus members 79 robux, while for plus members who have the 20% off it's 80 robux orginally 99? This is a bl[atant]…”</span></div>
     <p>If the base price is 99 and the member discount is 20%, the member price should be 79 and the non-member price 99 — the two look swapped, or the discount is being applied to the wrong base. Either way a paying subscriber is quoted a <em>higher</em> price than a non-subscriber on the same item, and they noticed.</p>
     <p>Cheap to verify and cheap to fix — it is a number in a config, not a build. Worth doing regardless of whether it turns out to explain any of the conversion fall.</p>`,
    [chip("crit", "revenue"), chip("watch", "player-reported, unconfirmed")]),

  fix(3, "Conversion halved on 12 August and nothing in the data explains it",
    `No publish that day — v1228 shipped 2 Aug, v1229/v1230 on 14 Aug. Payer conversion fell on <em>all four platforms simultaneously</em>: Computer 4.38 → 3.23, Console 2.81 → 2.17, Phone 0.81 → 0.58, Tablet 1.42 → 1.01.`,
    `<p>Every split says the same thing, which means the cause is global to the game rather than to one product, one platform or one audience. DevProduct and GamePass fell together and the pass share held at 41–48%, so it is not one broken purchase prompt. And ARPPU <em>rose</em> from 32.7 to 39.0 — the signature of losing the cheap tier while big spenders kept spending.</p>
     <p><strong>Ruled out: a Roblox-wide change.</strong> Over the same days Waterslide's payer conversion <em>rose</em> on every platform and its attributed 7-day payer conversion went 2.09 → 3.72; Brainrot's went 0.67 → 1.22. A platform event would not spare two games and halve two others.</p>
     <p><strong>I could not identify the cause.</strong> Reporting that as a result rather than inventing an attribution that fits the vibe. Two things would find it: the error export above, and a read of the purchase path as it stood on 11–12 August.</p>`,
    [chip("crit", "−R$100K+/day"), chip("watch", "cause not identified")]),

  fix(4, "The 9 August event was announced and never ran",
    `<code>annotations.md</code>: “AURAS/INDEX + ADMIN ABUSE” has an <code>EVENT_START</code> at 2026-08-09 19:00 UTC and <strong>no <code>EVENT_END</code> in the 15 days since</strong>. The event before it, “ITEMS/TAILS + ADMIN ABUSE”, ran a clean seven-day START→END.`,
    `<p>Six downvotes landed on 9 August, all saying the same thing, and one more the next day:</p>
     <div class="quote"><span>“He lied to us about an update and admin abuse that never arrived.”</span><span>“prometeu admin abuse e n entregou nada, ele prefere robux do que a comunidade do jogo”</span><span>“WHERE IS THE ASMIN ABUSE BRO LIKE BRO”</span><span>“update??? where????”</span><span>“did not update on the game updtae date. ghosted us” (10 Aug)</span></div>
     <p>Brainrot and Knife Farm both run a weekly event cadence. This game has run none for fifteen days, and the last one it announced did not happen. Roblox's own guidance is that content cadence resets the algorithm signal; the reverse also holds.</p>`,
    [chip("crit", "15 days no event"), chip("watch", "dated: 9 Aug 19:00Z")]),

  fix(5, "The funnel stops after the first banana",
    `<code>FUNNEL_TYPE_ONBOARDING</code> — three steps only: <code>Joined</code> → <code>Punched</code> → <code>Collected a Banana</code>.`,
    `<p>All three are healthy: 100% → 95.6% → 94.7% on 23 Aug, down from 98.7% on 24 July but with no break anywhere. That is genuinely good news about the first thirty seconds.</p>
     <p>It is also everything you can see. There is no instrumentation past the first banana, so “where do players quit” is currently unanswerable on this game, and D1 falling from 22.5% to 14.2% has nowhere to be localised. Brainrot has twenty steps across two named funnels and that is why its World 3 result could be measured at all.</p>
     <p>Roblox allows 10 funnels and 100 steps per experience. Instrument the first session properly: the first upgrade, the first purchase prompt, the first map transition, the first rebirth-equivalent.</p>`,
    [chip("watch", "blind past 30s")]),

  fix(6, "Client performance is degrading on low-end devices",
    `<code>ClientFpsP10</code> 32.97 (9 Aug) → 29.41 (23 Aug). <code>ClientFpsAvg</code> 44.9 → 41.3. <code>ClientMemoryUsagePercentageAvg</code> 0.213 → 0.224. <code>ClientCrashRate15m</code> 0.005 → 0.008. <code>ServerFrameRateP10</code> 59.0–59.3 — dead flat.`,
    `<p>Client degrading while the server holds is content weight crushing low-end devices, not a defect. Roblox publishes 60 FPS as the target; the bottom decile of this game's players is at half that and sliding. Errors per DAU went from 5.6–6.7 in early August to 8.1–10.7.</p>
     <p>The fix is an optimisation budget rather than a patch. It matters because an OOM exit is a lost session, and because a game currently taking 300–500K new players a day is spending a lot of first impressions on the worst hardware.</p>`,
    [chip("watch", "FpsP10 −11%"), chip("flat", "server unaffected")]),

  fix(7, "Mobile jump was broken on v1223 — confirm it stayed fixed",
    `Three downvotes on 1 Aug, all v1223.`,
    `<div class="quote"><span>“Some people on mobile cannot jump can you fly it please”</span><span>“Enable jump button or fix it at least cuz we are trying to go on builds but it's hard without the ability to jump like normal”</span><span>“I can't even jump. Your game sucks. I get trapped in holes”</span></div>
     <p>No further reports after v1228 shipped on 2 Aug, so it looks fixed. Worth one confirmation pass on phone given that phone is 70% of this game's audience and the platform where conversion fell hardest.</p>`,
    [chip("flat", "likely resolved")]),
];

const body = [

  sec("fixes", "01", "Fix list", "The first item is an ask rather than a fix, and it is first because the second-biggest question on this game cannot be answered without it.", FIXES.join("")),

  sec("verdict-detail", "02", "What actually happened",
    "This game is eight weeks old and went from 2,600 to 976,000 daily players in three weeks. Almost everything in the last fortnight is what that looks like on the way down — except the money, which is falling roughly twice as fast as the players.",
    `${stats([
      ["DAU, week of 17 Aug", "583.6K", "+5.3% on the prior week"],
      ["Revenue, last 7 settled", "R$151.3K/d", "≈ $15,883/mo · −35.5% WoW"],
      ["Payer conversion", "0.72%", "was 1.96% five weeks ago"],
      ["New players / day", "265–509K", "reach is not the problem"],
    ])}
     ${dauChart(ID, [{ d: "2026-08-02", t: "v1228" }, { d: "2026-08-09", t: "event START, no END" }, { d: "2026-08-14", t: "v1230" }])}
     <span class="cap">7-day mean DAU, 29 Jun – 22 Aug. Full life; the game was created 26 June. The crest is 1–5 August.</span>
     ${ccuChart(ID, [{ d: "2026-08-09T19:00", t: "event START" }, { d: "2026-08-12T00:00", t: "conversion halves" }])}
     <span class="cap">Half-hour concurrents, 22 days. The daily rhythm is intact; the level stepped down around 10 August and has been broadly flat since.</span>`),

  sec("mix", "03", "The test that decides it: retention by acquisition source",
    "Roblox shipped this breakdown in October 2025 for exactly this question — whether a retention change is a shift in traffic mix or a gameplay problem. It answers cleanly here.",
    `${table([{ t: "Source" }, { t: "24 Jul", c: "n" }, { t: "3 Aug", c: "n" }, { t: "13 Aug", c: "n" }, { t: "21 Aug", c: "n" }, { t: "Δ", c: "n" }, { t: "Reading", c: "w" }],
      [
        { __hl: 1, cells: ["Friends", { t: "22.2%", c: "n" }, { t: "21.2%", c: "n" }, { t: "20.9%", c: "n" }, { t: "21.2%", c: "n" }, { t: "−4.5%", c: "n fl" }, { t: "Flat. The least mix-sensitive source there is, and the truest read of the product.", c: "w" }] },
        { __hl: 1, cells: ["Search", { t: "22.0%", c: "n" }, { t: "27.6%", c: "n" }, { t: "28.9%", c: "n" }, { t: "24.8%", c: "n" }, { t: "+13%", c: "n up" }, { t: "Improved. High-intent traffic still retains.", c: "w" }] },
        ["HomeRecommendation", { t: "25.3%", c: "n" }, { t: "17.6%", c: "n" }, { t: "14.5%", c: "n" }, { t: "14.2%", c: "n" }, { t: "−44%", c: "n dn" }, { t: "Collapsed. This is the source Roblox scaled up.", c: "w" }],
        ["Others", { t: "20.8%", c: "n" }, { t: "16.0%", c: "n" }, { t: "14.4%", c: "n" }, { t: "13.6%", c: "n" }, { t: "−35%", c: "n dn" }, { t: "Collapsed alongside it.", c: "w" }],
        ["Blended D1", { t: "24.3%", c: "n" }, { t: "17.9%", c: "n" }, { t: "15.8%", c: "n" }, { t: "14.9%", c: "n" }, { t: "−39%", c: "n dn" }, { t: "The headline — and it is the mix moving, not the game.", c: "w" }],
      ], null,
      "<code>ForwardD1Retention</code> broken down by <code>AcquisitionSource</code>. Per-source flat while the blend falls is Roblox's own stated signature for a traffic-mix change rather than a gameplay problem.")}
     <p>Friends retention did not move. Search improved. The fall is entirely in the two sources Roblox controls the volume of — and those are precisely the sources that grew from a few hundred thousand impressions a day to nine million. A viral push reaches the highest-intent audience first and then broadens; every rate dilutes as it does, and none of that is the build getting worse.</p>
     <p>Worth saying plainly to anyone who reads the blended D1 chart and panics: <strong>the product did not degrade.</strong> It is being shown to a much wider and much less selected audience than it was three weeks ago.</p>`),

  sec("money", "04", "The money is a different story, and it is real",
    "The retention fall is composition. The revenue fall is not — it survives every control I could put on it.",
    `${table([{ t: "Comparison" }, { t: "DAU", c: "n" }, { t: "Paying users", c: "n" }, { t: "Revenue", c: "n" }, { t: "ARPPU", c: "n" }],
      [
        ["10 Aug (Mon)", { t: "529.0K", c: "n" }, { t: "8,468", c: "n" }, { t: "R$303.3K", c: "n" }, { t: "35.9", c: "n" }],
        { __hl: 1, cells: ["22 Aug (Sat)", { t: "555.8K", c: "n" }, { t: "4,700", c: "n dn" }, { t: "R$193.4K", c: "n dn" }, { t: "41.5", c: "n" }] },
        { __hl: 1, cells: ["20 Aug (Thu)", { t: "558.9K", c: "n" }, { t: "4,102", c: "n dn" }, { t: "R$153.2K", c: "n dn" }, { t: "37.3", c: "n" }] },
      ], null,
      "Matched-DAU comparison — the control for a rate whose denominator is moving. At the same audience size, twelve days apart, the game converts roughly half as many payers. That is not the denominator.")}
     ${table([{ t: "Platform" }, { t: "24 Jul", c: "n" }, { t: "10 Aug", c: "n" }, { t: "12 Aug", c: "n" }, { t: "22 Aug", c: "n" }, { t: "Reading", c: "w" }],
      [
        ["Computer", { t: "4.03%", c: "n" }, { t: "5.09%", c: "n" }, { t: "3.23%", c: "n" }, { t: "4.19%", c: "n" }, { t: "Fell on 12 Aug, fully recovered.", c: "w" }],
        ["Console", { t: "2.76%", c: "n" }, { t: "3.47%", c: "n" }, { t: "2.17%", c: "n" }, { t: "2.81%", c: "n" }, { t: "Fell on 12 Aug, fully recovered.", c: "w" }],
        { __hl: 1, cells: ["Phone", { t: "1.64%", c: "n" }, { t: "1.11%", c: "n" }, { t: "0.58%", c: "n dn" }, { t: "0.51%", c: "n dn" }, { t: "Fell and never recovered. 70% of the audience.", c: "w" }] },
        { __hl: 1, cells: ["Tablet", { t: "2.39%", c: "n" }, { t: "2.10%", c: "n" }, { t: "1.01%", c: "n dn" }, { t: "1.02%", c: "n dn" }, { t: "Fell and never recovered.", c: "w" }] },
      ], null,
      "<code>PayingUsersCVR</code> by <code>Platform</code>. The 12 Aug step is on all four. The <em>recovery</em> is only on the two desktop-class platforms — which is the most useful clue in this report and the one the error export would resolve.")}
     <p>That last split is worth a second look. Every platform stepped down together on 12 August, which points at something global. But Computer and Console came back to where they started and Phone and Tablet did not. Whatever happened on the 12th, the touch platforms are carrying a residual the desktop ones shed — and phone is 70% of this game's players.</p>
     <p>Platform mix is not the explanation: phone share was 76.5% on 2 Aug and 70.2% on 22 Aug, i.e. the audience got <em>less</em> phone-weighted while phone conversion fell 55%.</p>`),

  sec("ladder", "05", "The diagnostic ladder",
    "",
    `${table([{ t: "Rung" }, { t: "Reading" }, { t: "Verdict", c: "w" }],
      [
        ["1 · Reach", "Impressions 8.96M/day (week of 17 Aug), new users 265–509K/day, 60–72% of DAU. EndToEndCVR 5.37% → 5.84% and QPTR 1.31% → 1.60% — both recovering.", { t: "Not the problem. Roblox is delivering enormous volume and the listing is converting better than a fortnight ago.", c: "w" }],
        ["2 · Hook", "Blended D1 22.5% → 14.2%. Per source: Friends −4.5%, Search +13%, Home −44%, Others −35%. Session length 15.5 → 14.6 min.", { t: "Mix, not build. See section 03.", c: "w" }],
        ["3 · Return loop", "D7 3.32% → 1.46%. Returning users peaked at 284.1K on 6 Aug, now 178.9–224.3K. DAU/MAU 5.4% against MAU of 10.81M.", { t: "The genuine weakness. An enormous inflow is not compounding into a returning base.", c: "w" }],
        { __hl: 1, cells: ["4 · Money", "pCVR 1.96% → 0.72%. ARPU 0.77 → 0.26. Revenue R$405.8K/d → R$147.8K/d weekly mean.", { t: "The broken rung. Survives the matched-DAU control; falls on both product types; not platform-wide.", c: "w" }] },
        ["5 · Technical", "Server crashes 1–2/day since 3 Aug. ServerFrameRateP10 59.0–59.3 flat. ClientFpsP10 −11%, memory +5%, crash rate +60%.", { t: "Server clean. Client degrading — a weight problem, not a defect.", c: "w" }],
        ["6 · Funnel", "Three steps: 100% → 95.6% → 94.7%.", { t: "Healthy where instrumented, and instrumented almost nowhere.", c: "w" }],
      ])}
     <div class="note"><h4>The 31 Jul – 2 Aug server crash spike was not this game's fault</h4>
      <p><code>ServerCrashCount</code> hit 502,205 and 1,070,000 on 31 Jul and 1 Aug. The same window shows a crash spike on <em>all four</em> portfolio games, following Roblox engine release RCC 732. It cleared on its own by 3 Aug and has sat at 1–2/day since. An engine release preceding a fault is an association, never proof of a faulty release — but it is certainly not a Banana Monkey defect, and it should not be counted as one.</p></div>`),

  sec("hypotheses", "06", "Every hypothesis, and what killed it",
    "",
    table([{ t: "Hypothesis" }, { t: "Verdict" }, { t: "The test that decided it", c: "w" }],
      [
        ["An update broke retention", { t: "cut", c: "v", v: "cut" }, { t: "Friends D1 flat (22.2% → 21.2%) and Search D1 up (+13%). A build regression cannot spare two sources.", c: "w" }],
        ["Roblox cut reach", { t: "cut", c: "v", v: "cut" }, { t: "Impressions 8.96M/day, 265–509K new players a day, CVR and QPTR both recovering since 15 Aug.", c: "w" }],
        ["Traffic mix broadened after the viral push", { t: "kept", c: "v", v: "kept" }, { t: "D1 fell only on HomeRecommendation (−44%) and Others (−35%) — the two sources whose volume Roblox scaled.", c: "w" }],
        ["One product or purchase prompt broke", { t: "cut", c: "v", v: "cut" }, { t: "DevProduct and GamePass fell together; pass share held 41–48% throughout.", c: "w" }],
        ["A Roblox-wide monetization change on 12 Aug", { t: "cut", c: "v", v: "cut" }, { t: "Waterslide's payer conversion rose on every platform through the same days; its attributed 7-day conversion went 2.09 → 3.72 and Brainrot's 0.67 → 1.22.", c: "w" }],
        ["The rate fell because DAU rose", { t: "cut", c: "v", v: "cut" }, { t: "Matched-DAU: 8,468 payers at 529.0K DAU on 10 Aug, 4,700 at 555.8K on 22 Aug. Half the payers at the same size.", c: "w" }],
        ["Platform mix shifted toward phone", { t: "cut", c: "v", v: "cut" }, { t: "Phone share fell 76.5% → 70.2% over the same window while phone conversion fell 55%.", c: "w" }],
        ["Something game-side broke conversion on 11–12 Aug", { t: "open", c: "v", v: "kept" }, { t: "All four platforms −23% to −29% in a day, no publish, ARPPU up. Survives every control. Cause not identified — needs the error export.", c: "w" }],
        ["Event cadence stopped", { t: "kept", c: "v", v: "kept" }, { t: "No EVENT_END since 9 Aug; the announced admin abuse never ran; six dated downvotes name it.", c: "w" }],
        ["Client performance is degrading", { t: "kept", c: "v", v: "kept" }, { t: "FpsP10 −11%, memory +5%, crash rate +60%, server frame rate dead flat. Content weight, not a defect.", c: "w" }],
        ["The game is dying", { t: "cut", c: "v", v: "cut" }, { t: "DAU +5.3% week over week; hour-matched concurrents flat (mean of the seven weekday comparisons ≈ 0%); CVR recovering.", c: "w" }],
      ], "hyp")),

  sec("watch", "07", "The forward risk nobody is looking at",
    "",
    `${table([{ t: "Week (Mon)" }, { t: "Not-interested / M impressions", c: "n" }, { t: "vs Waterslide", c: "n" }, { t: "vs Brainrot", c: "n" }],
      [
        ["2026-07-20", { t: "60", c: "n" }, { t: "41", c: "n" }, { t: "58", c: "n" }],
        ["2026-07-27", { t: "75", c: "n" }, { t: "45", c: "n" }, { t: "50", c: "n" }],
        ["2026-08-03", { t: "72", c: "n" }, { t: "44", c: "n" }, { t: "49", c: "n" }],
        ["2026-08-10", { t: "83", c: "n" }, { t: "56", c: "n" }, { t: "55", c: "n" }],
        { __hl: 1, cells: ["2026-08-17", { t: "90", c: "n dn" }, { t: "58", c: "n" }, { t: "52", c: "n" }] },
      ], null,
      "<code>RFYUniqueNotInterestedUsersPerMillionImpressions</code> — Roblox's measure of people actively rejecting the listing. Highest of the four games and rising fastest: +50% in five weeks.")}
     <p>Comment sentiment is the best in the portfolio — a 10.6% downvote rate over the window, 0% in the last two weeks, and 473 upvote comments against 56 downvotes. People who play it like it.</p>
     <p>But nearly twice as many people per impression are pressing “not interested” as five weeks ago. That is the bill for distribution this broad, and it is the number that will start narrowing reach if nothing changes. Creative cadence is the counter-lever, and it has been thin: three thumbnail changes in a month (25 Jul, 13 Aug, 23 Aug) and icons only on 1–3 Aug, against Waterslide's twelve thumbnails in the same window.</p>`),

  sec("actions", "08", "What to do, in order",
    "",
    `<ol class="act">
      <li><strong>Pull the error export.</strong> Today, both windows. Everything below item 3 is guesswork without it, and the R$100K/day question depends on it.</li>
      <li><strong>Check the Plus pricing.</strong> One config read. A subscriber being quoted a higher price than a non-subscriber is a revenue bug and a trust bug at once.</li>
      <li><strong>Run an event, and end the one that is still open.</strong> Fifteen days without one on a game whose audience explicitly asked. Roblox allows 10 upcoming events and update announcements once per 3 days; use them.</li>
      <li><strong>Instrument the funnel past the first banana.</strong> D1 has fallen 8 points and there is nowhere to localise it. This is the difference between diagnosing the next problem in an hour and not diagnosing it at all.</li>
      <li><strong>Set an optimisation budget for phone.</strong> FpsP10 at 29 on 70% of the audience, and phone is the platform whose conversion did not recover.</li>
      <li><strong>Raise thumbnail cadence to weekly.</strong> Not-interested at 90/M is the leading indicator of the reach that is currently carrying this game.</li>
     </ol>
     <div class="note"><h4>What would overturn this diagnosis</h4>
      <p>Friends-source D1 dropping below ~18% while Home and Others hold. That would move this from “the mix broadened” to “the build got worse” and would make the whole retention section wrong. It has not happened in the 30 days measured.</p>
      <p>On the money: if the error export shows a purchase-path defect first seen 11–12 August, item 3 becomes a fix rather than an open question, and the recoverable revenue is on the order of R$100–150K/day.</p></div>`),

  sec("data", "09", "Data notes",
    "",
    `<ul class="tight">
      <li>All three repo gates green: <code>verify</code> 23 pass / 2 fail / 8 skip (both fails documented), <code>audit-plan</code> 0 failures, <code>npm test</code> 44 pass.</li>
      <li><strong>Full life was not held before today.</strong> The corpus had 30 days; a fresh Open Cloud pass extended the behavioural series back to 29 June (53 days), covering the whole life of the game.</li>
      <li><code>ItemMonetizationRevenue</code> is stored at <code>ONE_HOUR</code> but the gateway rolls it to daily stamps before 13 Aug and only serves genuine hourly buckets after. <strong>The small numbers from 13 Aug onward in that series are clamped coverage, not a revenue collapse</strong> — the revenue figures in this report all come from <code>DailyRevenue</code> by <code>RevenueSource</code>, which is complete.</li>
      <li><code>PeakConcurrentPlayers</code> <code>ONE_DAY</code> carries a phantom <strong>2026-08-25</strong> row identical to 08-24, and 21 Aug is flagged <code>partial</code>. Both excluded.</li>
      <li>Half-hour concurrents came from a fresh Open Cloud pull; the stored half-hour series is mostly <code>FILLED_ZERO</code> padding and must not be read as zeros.</li>
      <li><code>data-quality.md</code> records the gateway re-serving 20 Aug 23:00 <code>ItemMonetizationRevenue</code> as 657 against a kept 3,848. That hour is disputed; nothing here rests on it.</li>
      <li>An <code>EXTENDED_SERVICES_ENABLEMENT</code> annotation shows <code>data-store-storage / storage</code> set to <code>enabled: false</code> on 2026-08-13 08:39, and <code>rcc / ccu-cores</code> false on 27 Jul. Flagging them because they sit near the 12 Aug step; I have no evidence either is connected, and neither is a finding.</li>
      <li><strong>No error export exists.</strong> See fix 1.</li>
     </ul>`),
].join("");

const html = page({
  title: "Banana Monkey Payer Collapse",
  eyebrow: "LiveOps diagnosis · 24 Aug 2026",
  chips: [chip("good", "players stabilising"), chip("crit", "revenue −35% WoW"), chip("crit", "no error export")],
  h1: "+1 Banana Monkey Destruction",
  sub: "Eight weeks old, 976,000 daily players at the crest, and now half the payers at the same audience size. The retention fall is traffic mix. The money is not.",
  meta: ["Universe <b>10399712766</b>", "Root place <b>83256791430098</b>", "Created <b>26 Jun 2026</b>", "Live version <b>v1242</b>",
    "Behavioural data through <b>22 Aug</b>", "Concurrents through <b>24 Aug 11:30 UTC</b>"],
  nav: [["fixes", "Fix list"], ["verdict-detail", "What happened"], ["mix", "Mix test"], ["money", "The money"], ["ladder", "Ladder"], ["hypotheses", "Hypotheses"], ["watch", "Forward risk"], ["actions", "Actions"], ["data", "Data notes"]],
  verdict: "The player decline has stopped — DAU is up 5.3% week over week and hour-matched concurrents are roughly flat. The D1 fall from 22.5% to 14.2% is <strong>traffic mix, not the build</strong>: retention held on Friends and rose on Search, and fell only on the two sources Roblox scaled from a few hundred thousand impressions a day to nine million.",
  verdict2: "Monetization is the real finding and it survives every control. At matched audience size the game converts <strong>half</strong> the payers it did twelve days ago — 8,468 at 529K DAU on 10 August, 4,700 at 556K on 22 August. It fell on all four platforms in one day, 12 August, with no publish that day, and only the desktop platforms recovered. I could not identify the cause from the data held, and the reason is that this is the one game in the portfolio with no error message text at all.",
  footer: `Built from <code>data/games/10399712766/</code> plus a full-life Open Cloud pass and a fresh half-hour concurrents pull, both run 24 Aug 2026. Player comments from <code>data/exports/10399712766-banana-monkey-destruction/feedback/</code> and the grabber's <code>feedback.csv</code>. There is no error export for this game; every statement that would need one is marked as open rather than answered.`,
  body,
});
fs.writeFileSync(OUT + "banana-monkey.html", html);
console.log("banana-monkey.html", html.length, "bytes");
