const fs = require("fs");
const B = require("./build.js");
const { dauChart, ccuChart, chip, stats, table, fix, sec, page, OUT } = B;
const ID = "9610561918";

const FIXES = [
  fix(1, "A paid third-party service is switched off — 692,260 events",
    `<code>GamebeastSDK: Request failed (403) | Your billing status is blocked. Please check the Gamebeast dashboard for more details.</code> — Server warning, first seen <strong>2026-08-15 19:46 UTC</strong> on v3829. <strong>692,260 events</strong>, the single largest signature in the export by a factor of two.`,
    `<p>Check the Gamebeast dashboard. It is one login and it is the loudest thing in this game.</p>
     <p><strong>Timing, honestly:</strong> this cannot have caused the conversion collapse. Payer conversion stepped from 1.08% to 0.86% on <strong>12 August</strong> — three days before the first 403. A cause that arrives after the effect is not the cause, and I am not going to sell it as one.</p>
     <p>What it does line up with is the weekend after. The x5 LUCK event ran 15 Aug 20:00 → 16 Aug 01:00 UTC — <strong>fourteen minutes after the first billing 403</strong>. Revenue per player on LUCK weekends ran 1.13–2.26 through 9 August and 0.72–0.88 from 15 August onward. On the sister title, Gamebeast gates luck purchases directly (<code>[LuckGamebeast] purchase skipped…</code> appears 481,462 times in its export). If the same wiring exists here, a blocked account is a dead purchase path on the game's biggest recurring monetization moment.</p>
     <p>Also present and probably the same root: <code>GamebeastSDK: Gamebeast SDK is out of date! v0.10.0 -&gt; v0.10.1</code>, 4,495 events, first seen 16 June.</p>`,
    [chip("crit", "largest signature"), chip("crit", "revenue path"), chip("watch", "postdates the 12 Aug step")]),

  fix(2, "Players cannot sell knives since v3831",
    `Reported 22 Aug by an upvoting, paying player. v3831 published 2026-08-21 16:21 UTC. <strong>There is no error export covering it</strong> — the newest held is v3829 from 16 August.`,
    `<div class="quote"><span>“Hi devs after the last update i cant sell my knifes anymore, please fix it. I like the game and spend some money for continue play”</span></div>
     <p>Selling is the core economy loop on this game: sell knives → get cash → buy crates → get knives. If the sell path is dead, everything downstream of it stops converting, and the player who reported it explicitly says they spend money and want to keep playing.</p>
     <p>Worth noting the sister title had a structurally identical defect earlier this month — <code>ServerScriptService.OnPlayerAdded:1390: attempt to index nil with 'IsA'</code> inside <code>function sellTool</code>, which grew from 18 events to 979 over two days once it was live. If this is the same class, it will be obvious in a fresh export in seconds.</p>
     <p><strong>Pull the export at v3831/v3832 and check the sell path.</strong> This is the highest-value missing evidence on the game.</p>`,
    [chip("crit", "core loop"), chip("crit", "unconfirmed — no export"), chip("watch", "dated: v3831, 21 Aug")]),

  fix(3, "Gamepass ownership checks are failing",
    `<code>MarketplaceService::userOwnsGamePassAsync - GetGamePassOwnership failed: HTTP request failed with status code…</code> — 2,125 events, first seen 26 July on v3823, in <code>ServerScriptService.ServerScripts.AutospawnHandler</code>. Also <code>UserHasBadgeAsync: Internal error</code> at <code>ServerScriptService.ServerModules.MainModule</code>, 3,069 + 1,796 events, first seen 13–14 August on v3829.`,
    `<p>A failed ownership check treats a player who <em>owns</em> a pass as though they do not. On an autospawn handler that means a paid benefit silently not applying. Whether it also blocks the purchase or merely withholds the benefit depends on how the call site handles the failure — read the branch before deciding which it is, because “error” and “theft” are very different messages to a producer.</p>
     <p>The badge failures are first-seen 13–14 August, which is inside the conversion collapse window. That does not make them the cause, but they are the only server-side signature in the export whose first-seen date brackets it.</p>`,
    [chip("crit", "paid benefit withheld"), chip("watch", "first seen inside the break window")]),

  fix(4, "Tutorial client throws on a nil character",
    `Players.&lt;Player&gt;.PlayerGui.TutorialUI.TutorialClient:103 — <code>attempt to index nil with 'PrimaryPart'</code>. 3,168 events.`,
    `<p>The classic check-yield-use shape: a character reference validated, a yield in between, then used unchecked. Any yield invalidates the check, and the longer the wait the higher the count.</p>
     <p>Relevant because first-play bounce under 60 seconds on this game is <strong>18.9%</strong> — the worst of the four titles, against 9.7% on Waterslide and 7.0% on Banana Monkey — and first-play bounce is one of the signals Roblox's recommender actually ranks on.</p>`,
    [chip("watch", "ranking signal"), chip("watch", "3.2K events")]),

  fix(5, "There is no funnel instrumentation at all",
    `<code>FunnelCohortCompletionRate</code>: no series. <code>FunnelUserStepCompletionRate</code>: no series. Nothing.`,
    `<p>Both sister titles have named funnels — Brainrot has twenty steps across two, Waterslide fifteen. This game has none, which means no defect on it can be dated to a step and no first-session claim can be localised.</p>
     <p>The substitute used in this report is <code>TotalSessionsEndedInBucket</code>, which gives the session-length distribution and therefore the bounce bands. It is a poor second: it tells you 18.9% leave inside a minute and cannot tell you what they hit.</p>
     <p>Instrument the first session. It is the cheapest thing on this list and it is what makes the next investigation possible at all.</p>`,
    [chip("watch", "blocks future diagnosis")]),

  fix(6, "DataStore queue pressure",
    `<code>DataStore request was added to queue. If request queue fills, further requests will be dropped.</code> — 2,213 events, keyed by player id.`,
    `<p>Small in absolute terms and worth watching rather than fixing: at 21K DAU this should not be queueing. Count the stores recent updates added before assuming it is load.</p>`,
    [chip("flat", "watch")]),
];

const body = [

  sec("headline", "01", "This is the one still falling",
    "Of the four titles, three have either stabilised or are inside a normal oscillation. This one made a new low on every single day of the last fortnight.",
    `${stats([
      ["Drawdown from 1 May peak", "−96.5%", "and deepening daily"],
      ["Revenue, last 7 settled", "R$20.6K/d", "≈ $2,160/mo · −45% WoW"],
      ["Payer conversion", "0.77%", "was 1.47% three weeks ago"],
      ["D1 retention", "20.4%", "best since June — see section 03"],
    ])}
     ${dauChart(ID, [{ d: "2026-05-01", t: "peak 769K" }, { d: "2026-06-15", t: "RFY change" }, { d: "2026-08-21", t: "v3831" }])}
     <span class="cap">7-day mean DAU, 1 Apr – 22 Aug. Three separate collapses: late May (−83%), mid-July (−58% in one week), and the current grind. The 7-day mean has set a new all-time low on 12 of the last 14 days.</span>
     ${table([{ t: "Date" }, { t: "MA7 DAU", c: "n" }, { t: "Drawdown from peak", c: "n" }],
      [
        ["9 Aug", { t: "43.1K", c: "n" }, { t: "−94.4%", c: "n" }],
        ["13 Aug", { t: "36.0K", c: "n" }, { t: "−95.3%", c: "n" }],
        ["17 Aug", { t: "34.8K", c: "n" }, { t: "−95.5%", c: "n" }],
        ["19 Aug", { t: "32.6K", c: "n" }, { t: "−95.8%", c: "n" }],
        ["20 Aug", { t: "30.9K", c: "n" }, { t: "−96.0%", c: "n" }],
        ["21 Aug", { t: "29.1K", c: "n" }, { t: "−96.2%", c: "n" }],
        { __hl: 1, cells: ["22 Aug", { t: "27.2K", c: "n dn" }, { t: "−96.5%", c: "n dn" }] },
      ], null,
      "Measured on the 7-day mean, so no single weekend can manufacture a trough. Every row is a new all-time low. Compare Brainrot, whose equivalent series bottomed on 15 August and has improved since.")}
     ${table([{ t: "Weekday" }, { t: "wk 03–09 Aug", c: "n" }, { t: "wk 10–16 Aug", c: "n" }, { t: "wk 17–23 Aug", c: "n" }, { t: "wk3 / wk2", c: "n" }, { t: "wk3 / wk1", c: "n" }],
      [
        ["Mon", { t: "498", c: "n" }, { t: "443", c: "n" }, { t: "428", c: "n" }, { t: "−3.2%", c: "n fl" }, { t: "−13.9%", c: "n dn" }],
        ["Tue", { t: "582", c: "n" }, { t: "443", c: "n" }, { t: "469", c: "n" }, { t: "+6.1%", c: "n fl" }, { t: "−19.4%", c: "n dn" }],
        ["Wed", { t: "916", c: "n" }, { t: "563", c: "n" }, { t: "358", c: "n" }, { t: "−36.4%", c: "n dn" }, { t: "−60.9%", c: "n dn" }],
        ["Thu", { t: "863", c: "n" }, { t: "477", c: "n" }, { t: "301", c: "n" }, { t: "−37.0%", c: "n dn" }, { t: "−65.2%", c: "n dn" }],
        ["Fri", { t: "523", c: "n" }, { t: "449", c: "n" }, { t: "297", c: "n" }, { t: "−33.8%", c: "n dn" }, { t: "−43.2%", c: "n dn" }],
        ["Sat", { t: "456", c: "n" }, { t: "453", c: "n" }, { t: "304", c: "n" }, { t: "−32.9%", c: "n dn" }, { t: "−33.4%", c: "n dn" }],
        { __hl: 1, cells: ["Sun", { t: "546", c: "n" }, { t: "438", c: "n" }, { t: "247", c: "n" }, { t: "−43.5%", c: "n dn" }, { t: "−54.7%", c: "n dn" }] },
      ], null,
      "Mean concurrents across the half-hour slots the three days share, same weekday each row. Five of seven weekdays are down more than 30% week over week. This is the only game in the portfolio with no positive column.")}`),

  sec("paradox", "02", "The paradox: retention improved while the money halved",
    "Everything that measures whether people enjoy the game got better over the last six weeks. Everything that measures whether they pay collapsed. That combination is unusual and it narrows the search a lot.",
    `${table([{ t: "Week (Mon)" }, { t: "D1", c: "n" }, { t: "Session", c: "n" }, { t: "EndToEndCVR", c: "n" }, { t: "QPTR", c: "n" }, { t: "Payer CVR", c: "n" }, { t: "ARPU", c: "n" }, { t: "Revenue/d", c: "n" }],
      [
        ["2026-07-06", { t: "18.6%", c: "n" }, { t: "12.9", c: "n" }, { t: "3.38%", c: "n" }, { t: "0.55%", c: "n" }, { t: "1.60%", c: "n" }, { t: "1.87", c: "n" }, { t: "R$200.9K", c: "n" }],
        ["2026-07-13", { t: "17.1%", c: "n" }, { t: "12.2", c: "n" }, { t: "3.38%", c: "n" }, { t: "0.61%", c: "n" }, { t: "1.44%", c: "n" }, { t: "1.70", c: "n" }, { t: "R$170.2K", c: "n" }],
        ["2026-07-20", { t: "17.9%", c: "n" }, { t: "11.2", c: "n" }, { t: "3.36%", c: "n" }, { t: "0.53%", c: "n" }, { t: "1.42%", c: "n" }, { t: "1.88", c: "n" }, { t: "R$78.7K", c: "n" }],
        ["2026-07-27", { t: "18.4%", c: "n" }, { t: "12.0", c: "n" }, { t: "3.54%", c: "n" }, { t: "0.62%", c: "n" }, { t: "1.45%", c: "n" }, { t: "1.64", c: "n" }, { t: "R$76.4K", c: "n" }],
        ["2026-08-03", { t: "17.0%", c: "n" }, { t: "12.7", c: "n" }, { t: "3.76%", c: "n" }, { t: "0.85%", c: "n" }, { t: "1.47%", c: "n" }, { t: "1.64", c: "n" }, { t: "R$69.3K", c: "n" }],
        ["2026-08-10", { t: "19.3%", c: "n up" }, { t: "12.1", c: "n" }, { t: "4.07%", c: "n up" }, { t: "1.04%", c: "n up" }, { t: "0.92%", c: "n dn" }, { t: "0.97", c: "n dn" }, { t: "R$33.4K", c: "n dn" }],
        { __hl: 1, cells: ["2026-08-17", { t: "20.4%", c: "n up" }, { t: "12.0", c: "n" }, { t: "3.77%", c: "n" }, { t: "0.93%", c: "n up" }, { t: "0.77%", c: "n dn" }, { t: "0.78", c: "n dn" }, { t: "R$20.1K", c: "n dn" }] },
      ], null,
      "Weekly means. D1 is at a three-month high, session length is flat to the minute, and click-appeal is up — while payer conversion is down 48% and revenue down 71% over the same six weeks.")}
     <p>Read that table carefully, because it kills the obvious story. If the last update had broken the game, D1 and session length would not be at their best levels since June. If the listing had lost its pull, click-appeal would not have risen from 3.38% to 3.77% with qualified play-through nearly doubling. The players who arrive stay just as long as they ever did, and slightly more of them come back the next day.</p>
     <p>They just stopped paying.</p>`),

  sec("money", "03", "The conversion collapse, and every control run against it",
    "Payer conversion fell 48% in three weeks. Rate metrics move when their denominator moves, so the first job is to prove this one did not.",
    `${table([{ t: "Comparison" }, { t: "DAU", c: "n" }, { t: "Paying users", c: "n" }, { t: "Revenue", c: "n" }, { t: "ARPPU", c: "n" }],
      [
        ["4 Aug (Tue)", { t: "41.2K", c: "n" }, { t: "716", c: "n" }, { t: "R$63.9K", c: "n" }, { t: "89.3", c: "n" }],
        { __hl: 1, cells: ["12 Aug (Wed)", { t: "41.5K", c: "n" }, { t: "356", c: "n dn" }, { t: "R$44.2K", c: "n dn" }, { t: "124.3", c: "n" }] },
      ], null,
      "Matched-DAU comparison, eight days apart at effectively identical audience size. Half the payers. The rate did not move because the denominator moved — it moved because the numerator did.")}
     ${table([{ t: "Split" }, { t: "5 Aug", c: "n" }, { t: "11 Aug", c: "n" }, { t: "12 Aug", c: "n" }, { t: "22 Aug", c: "n" }, { t: "Verdict", c: "w" }],
      [
        ["Computer", { t: "2.50%", c: "n" }, { t: "1.85%", c: "n" }, { t: "1.62%", c: "n" }, { t: "1.70%", c: "n" }, { t: "fell", c: "w" }],
        ["Console", { t: "2.22%", c: "n" }, { t: "1.82%", c: "n" }, { t: "1.45%", c: "n" }, { t: "1.13%", c: "n" }, { t: "fell", c: "w" }],
        ["Phone", { t: "1.17%", c: "n" }, { t: "0.72%", c: "n" }, { t: "0.59%", c: "n" }, { t: "0.48%", c: "n" }, { t: "fell", c: "w" }],
        ["Tablet", { t: "1.67%", c: "n" }, { t: "1.15%", c: "n" }, { t: "1.03%", c: "n" }, { t: "0.68%", c: "n" }, { t: "fell", c: "w" }],
        ["DevProduct revenue", { t: "R$74.8K", c: "n" }, { t: "R$31.5K", c: "n" }, { t: "R$38.6K", c: "n" }, { t: "R$13.4K", c: "n" }, { t: "fell −82%", c: "w" }],
        ["GamePass revenue", { t: "R$9.2K", c: "n" }, { t: "R$4.9K", c: "n" }, { t: "R$5.6K", c: "n" }, { t: "R$1.1K", c: "n" }, { t: "fell −88%", c: "w" }],
      ], null,
      "<code>PayingUsersCVR</code> by <code>Platform</code> and <code>DailyRevenue</code> by <code>RevenueSource</code>. Every split falls together. When every split says the same thing the cause is global to the game — it is not one platform, not one product, and not a shift in who is showing up.")}
     <p>Roblox's own attributed measure agrees and is worth quoting because it is computed independently of anything above: <code>Attribution7DPayerConversionRatio</code> went <strong>3.21 on 3 August to 1.02 on 12 August</strong>, and sits at 1.14 now. A 68% fall.</p>
     <div class="note"><h4>It is not a platform-wide Roblox change — and this is the check that proves it</h4>
      <p>The same window on the sister titles: Waterslide's attributed payer conversion went <strong>2.09 → 3.72</strong> and Brainrot's <strong>0.67 → 1.22</strong>. Both <em>rose</em>. Waterslide's payer conversion rose on all four platforms across exactly the days this game's fell on all four. A platform event does not spare two games and halve two others.</p>
      <p>Banana Monkey stepped down on 12 August too, by a similar magnitude and on all four platforms. Two of four is not a pattern I can call — but it is worth checking whether these two share anything the other two do not, and Gamebeast is the obvious candidate to check first.</p></div>
     <p><strong>The 12 August step has no identified cause and I am reporting that as a result.</strong> No publish that day — v3825 shipped 3 August, v3828/v3829 on 13 August. The Gamebeast 403 postdates it by three days. What I can say is what it is not: not the denominator, not one platform, not one product, not a Roblox-wide change, and not audience composition.</p>`),

  sec("fixes", "04", "Fix list",
    "Six items. The first two are the ones that could still be costing money today; the rest are hygiene and instrumentation.",
    FIXES.join("")),

  sec("structure", "05", "Underneath all of it: there is no reason to come back",
    "The August collapse is an event. The four-month shape is a structure, and no fix in section 04 touches it.",
    `${table([{ t: "Metric" }, { t: "Knife Farm", c: "n" }, { t: "Brainrot (same studio)", c: "n" }, { t: "Reading", c: "w" }],
      [
        ["D1 retention", { t: "20.4%", c: "n up" }, { t: "13.6%", c: "n" }, { t: "Better. The daily mechanics work — offline earnings, daily rewards.", c: "w" }],
        { __hl: 1, cells: ["D7 retention", { t: "1.32%", c: "n dn" }, { t: "2.27%", c: "n" }, { t: "Worse, and flat all year.", c: "w" }] },
        { __hl: 1, cells: ["D30 retention", { t: "0.19–0.22%", c: "n dn" }, { t: "0.4–1%", c: "n" }, { t: "Effectively zero.", c: "w" }] },
        ["RFYL7PlayDays", { t: "1.43", c: "n" }, { t: "1.41", c: "n" }, { t: "Flat all year on both.", c: "w" }],
        ["First-play bounce &lt;60s", { t: "18.9%", c: "n dn" }, { t: "13.4%", c: "n" }, { t: "Worst of the four titles.", c: "w" }],
        ["Prestige / rebirth loop", { t: "none", c: "n dn" }, { t: "present", c: "n" }, { t: "The difference.", c: "w" }],
      ], null,
      "Bounce computed from <code>TotalSessionsEndedInBucket</code>: 20.42M sessions at the 0s bucket, 16.57M surviving past 60s.")}
     <p>The retention curve maps onto game structure cleanly enough to read a missing mechanic straight off it. Offline earnings, daily rewards and streaks hold D1→D2 — and this game's D1 is fine, in fact the best of the four. A finite upgrade track holds D2→D5 and then exhausts. A prestige or rebirth loop is what holds D7→D30, and without one D30 goes to roughly zero.</p>
     <p>Knife Farm has offline earnings and daily rewards. It has upgrades. <strong>It has no rebirth.</strong> D1 20.4%, D7 1.32%, D30 0.2% is exactly the curve that predicts. Brainrot — same studio, same genre — has a rebirth ladder and runs D7 around 2.3–3%.</p>
     <p><code>RFYL7PlayDays</code> at 1.43, flat all year, is the same fact in the recommender's own units: the average player plays once or twice a week and never more. Since 15 June 2026 Roblox ranks on play days per user across a 28-day window. <strong>That number is the ceiling on this game's distribution, and no amount of reach work moves it.</strong></p>
     <p>Content is not the same lever. A new world is consumed once and buys one cycle — which is precisely the pattern this game has already run three times since May, each peak smaller than the last. A prestige loop regenerates the goal indefinitely from content that already exists.</p>`),

  sec("ladder", "06", "The diagnostic ladder",
    "",
    `${table([{ t: "Rung" }, { t: "Reading" }, { t: "Verdict", c: "w" }],
      [
        ["1 · Reach", "Impressions 600.1K/d (week of 17 Aug), −21.7% WoW. New users 10.5K/d, returning 15.7K/d — both down ~85% since June. MAU 8.97M (May) → 837.8K.", { t: "Shrinking, but the listing is not failing: CVR 3.77% and QPTR 0.93% are both above where they were in July. This is demand contracting, not appeal.", c: "w" }],
        ["2 · Hook", "D1 20.4% weekly, best since June. Session 12.0 min, flat all year. Play time per DAU 18.5 min.", { t: "Intact and improving. Not the problem.", c: "w" }],
        { __hl: 1, cells: ["3 · Return loop", "D7 1.32%, D30 0.19–0.22%, DAU/MAU 3.1%, RFYL7PlayDays 1.43, first-play bounce 18.9%.", { t: "Structurally broken and always has been. This is the ceiling — section 05.", c: "w" }] },
        { __hl: 1, cells: ["4 · Money", "pCVR 1.47% → 0.77%. ARPU 1.64 → 0.78. Half the payers at matched DAU. Falls on every platform and both product types.", { t: "The acute break, dated 12 August, cause not identified.", c: "w" }] },
        ["5 · Technical", "692,260 Gamebeast billing 403s from 15 Aug. Gamepass ownership failures from 26 Jul. Badge failures from 13–14 Aug. Server crash spike 28 Jul – 2 Aug (peak 30,393), then clean.", { t: "One live third-party outage and two ownership-check defects. The July crash spike hit all four portfolio games after RCC 732 and cleared on its own.", c: "w" }],
        ["6 · Funnel", "Not instrumented.", { t: "Nothing can be dated to a step on this game. Fix 5.", c: "w" }],
      ])}
     ${ccuChart(ID, [{ d: "2026-08-15T19:46", t: "Gamebeast 403" }, { d: "2026-08-21T16:21", t: "v3831" }])}
     <span class="cap">Half-hour concurrents, 22 days. The weekly rhythm survives; the level steps down twice, around 13 and 19 August, and the final week sits below every previous one at every hour of the day.</span>`),

  sec("hypotheses", "07", "Every hypothesis, and what killed it",
    "",
    table([{ t: "Hypothesis" }, { t: "Verdict" }, { t: "The test that decided it", c: "w" }],
      [
        ["Bugs are driving players away", { t: "cut", c: "v", v: "cut" }, { t: "Six downvote comments in a month, none in the last two weeks. D1 at a three-month high, session length flat to the minute.", c: "w" }],
        ["Roblox cut reach", { t: "partial", c: "v", v: "partial" }, { t: "Impressions −21.7% WoW — but EndToEndCVR and QPTR both rose over the same six weeks. Demand contracting, not the listing failing.", c: "w" }],
        ["The rate fell because DAU moved", { t: "cut", c: "v", v: "cut" }, { t: "Matched-DAU: 716 payers at 41.2K on 4 Aug, 356 at 41.5K on 12 Aug.", c: "w" }],
        ["One product or platform broke", { t: "cut", c: "v", v: "cut" }, { t: "All four platforms fell; DevProduct −82% and GamePass −88%. Every split agrees, so the cause is global to the game.", c: "w" }],
        ["A Roblox-wide monetization change", { t: "cut", c: "v", v: "cut" }, { t: "Waterslide's attributed payer conversion rose 2.09 → 3.72 and Brainrot's 0.67 → 1.22 across the same days.", c: "w" }],
        ["The Gamebeast block caused the 12 Aug step", { t: "cut", c: "v", v: "cut" }, { t: "First 403 is 15 Aug 19:46 UTC — three days after the step. The effect precedes the cause.", c: "w" }],
        ["The Gamebeast block is why it has not recovered", { t: "kept", c: "v", v: "kept" }, { t: "692,260 events; the x5 LUCK weekend began 14 minutes after the first 403; LUCK-weekend ARPU halved from that event onward. Plausible, not proven — check the dashboard.", c: "w" }],
        ["The v3831 sell bug is compounding it", { t: "kept", c: "v", v: "kept" }, { t: "Dated first-hand report from a paying player, 22 Aug, naming the update. No error export covers v3831, so unconfirmed.", c: "w" }],
        ["Something broke conversion on 12 Aug", { t: "open", c: "v", v: "kept" }, { t: "Survives every control above. No publish that day. Cause not identified — reporting that rather than inventing one.", c: "w" }],
        ["It is structural — no prestige loop", { t: "kept", c: "v", v: "kept" }, { t: "D7 1.32%, D30 0.2%, RFYL7PlayDays 1.43 flat all year, three collapses in four months each with a smaller peak.", c: "w" }],
        ["Audience exhaustion", { t: "kept", c: "v", v: "kept" }, { t: "MAU 8.97M in May to 837.8K now. The reachable pool has been spent and the loop does not regenerate it.", c: "w" }],
        ["The July 2026 RFY change explains the collapse", { t: "cut", c: "v", v: "cut" }, { t: "Documented and correctly dated, but this game's biggest collapse ran 31 May – 12 June (−81%), before the change existed. A cause that only explains the last instance of a repeating pattern is not the cause.", c: "w" }],
      ], "hyp")),

  sec("actions", "08", "What to do, in order",
    "",
    `<ol class="act">
      <li><strong>Log into the Gamebeast dashboard today.</strong> 692,260 events say a paid dependency is switched off. It is one login, it costs nothing to check, and it is the largest signature in the game.</li>
      <li><strong>Pull an error export at v3831 or v3832</strong> and confirm the sell path. A paying player reported it by name three days ago and there is no data covering it.</li>
      <li><strong>Read the two ownership-check call sites</strong> (<code>AutospawnHandler</code>, <code>MainModule</code>) and establish whether a failed check withholds a benefit or blocks a purchase.</li>
      <li><strong>Instrument the first session.</strong> Cheapest item on the list and the one that makes every future investigation possible.</li>
      <li><strong>Then take the structural decision.</strong> At R$20.6K/day this asset earns about $2,160/month. At the playbook's 6× owner-ask multiple that is roughly <strong>$13,000</strong> of value, against about <strong>$54,600</strong> four weeks ago. A prestige loop is the only lever with a named mechanism behind it — and it is a build, not a config, so it needs a decision rather than a ticket.</li>
     </ol>
     <div class="note"><h4>On that valuation figure</h4>
      <p>Two caveats worth stating with it. Multiplying a seven-day average by 30 is a simplification, and 0.0035 is the DevEx developer payout rate — the right unit for “what the owner earns”, not necessarily for every valuation context. The direction is not in doubt; the precision is.</p>
      <p>And subtract expected decay before calling any of it a loss. Post-peak decline of 15–20% per month is normal at this tier; only the excess is a defect. Between 3 and 22 August this game went from R$85.2K to R$14.6K per day, which is far outside that band whichever baseline you pick.</p></div>`),

  sec("data", "09", "Data notes",
    "",
    `<ul class="tight">
      <li>All three repo gates green: <code>verify</code> 23 pass / 2 fail / 8 skip (both fails documented and held), <code>audit-plan</code> 0 failures, <code>npm test</code> 44 pass. This game is the verify corpus, so its cell-level agreement with the dashboard is directly measured, not assumed.</li>
      <li>Full life held natively — 144 days from 1 April.</li>
      <li><strong><code>ItemMonetizationRevenue</code> by <code>ProductType</code> is corrupted for 30 Jul – 9 Aug in the corpus.</strong> <code>data-quality.md</code> shows the first reads were partial captures frozen at roughly a tenth of the settled value (5,732 kept against 70,454 re-served on 30 Jul, and so on for eleven days). <strong>Every revenue figure in this report comes from <code>DailyRevenue</code> by <code>RevenueSource</code></strong>, which is clean.</li>
      <li><code>PeakConcurrentPlayers</code> for <strong>2026-08-21 is stored as 0 and tagged <code>FILLED_ZERO</code></strong> — a gap-fill artifact, not a reading. It is excluded here; anything that treats it as a real zero will show a false one-day collapse.</li>
      <li>Same series carries a phantom <strong>2026-08-25</strong> row identical to 08-24. Excluded.</li>
      <li><code>Attribution7DRobuxPerUser</code> returns 81.92 on 12 Aug and 94.07 on 16 Aug against a normal range of 1.03–3.83. Implausible; not used anywhere in this report.</li>
      <li>Half-hour concurrents came from a fresh Open Cloud pull. The stored half-hour series is largely <code>FILLED_ZERO</code> padding.</li>
      <li>Newest error export held: <strong>v3829 (16 Aug)</strong>. Live version is <strong>v3832</strong>. The sell-path report in fix 2 sits entirely inside that gap.</li>
      <li>Comment volume is very low — 23 feedback rows in the window, 6 of them downvotes. Roblox's own floor for a player-feedback report is 20+ comments. Sentiment readings on this game are directional at best and no percentage from them is quoted as a rate.</li>
     </ul>`),
].join("");

const html = page({
  title: "Knife Farm Free Fall",
  eyebrow: "LiveOps diagnosis · 24 Aug 2026",
  chips: [chip("crit", "still falling"), chip("crit", "conversion −48%"), chip("watch", "paid dependency blocked")],
  h1: "My Knife Farm",
  sub: "Ninety-six percent down from May and setting a new low almost every day. Retention is at a three-month high — it is the money that broke, and one of the two candidates is a billing page.",
  meta: ["Universe <b>9610561918</b>", "Root place <b>125003919504672</b>", "Created <b>23 Jan 2026</b>", "Live version <b>v3832</b>",
    "Behavioural data through <b>22 Aug</b>", "Concurrents through <b>24 Aug 11:30 UTC</b>"],
  nav: [["headline", "Still falling"], ["paradox", "The paradox"], ["money", "The collapse"], ["fixes", "Fix list"], ["structure", "Structure"], ["ladder", "Ladder"], ["hypotheses", "Hypotheses"], ["actions", "Actions"], ["data", "Data notes"]],
  verdict: "This is the only one of the four games with no bottom. The 7-day mean set a new all-time low on 12 of the last 14 days, and hour-matched concurrents are down 33–44% week over week on five of seven weekdays — the only game in the portfolio without a single positive column.",
  verdict2: "The cause is not what people usually assume. D1 retention is at <strong>20.4%</strong>, its best since June; session length has not moved all year; click-appeal is up. Payer conversion fell <strong>48%</strong> in three weeks and revenue <strong>71%</strong>. At matched audience size the game converts half the payers it did eight days earlier. It falls on every platform and both product types, it is not a Roblox-wide change — and the step is dated 12 August with no publish and no identified cause. Two live defects sit alongside it: a blocked Gamebeast billing account logging 692,260 events, and a paying player reporting that selling knives has been broken since v3831.",
  footer: `Built from <code>data/games/9610561918/</code> — 144 days of full-life series, and the universe that backs the repo's verify corpus — plus a fresh half-hour concurrents pull run 24 Aug 2026. Error message text from <code>data/exports/9610561918-my-knife-farm/errors/</code>, newest v3829. Where a claim depends on evidence that does not exist yet it is marked open, not answered.`,
  body,
});
fs.writeFileSync(OUT + "knife-farm.html", html);
console.log("knife-farm.html", html.length, "bytes");
