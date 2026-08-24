const fs = require("fs");
const B = require("./build.js");
const { dauChart, ccuChart, chip, stats, table, fix, sec, page, OUT } = B;
const ID = "9963622286";

const FIXES = [
  fix(1, "The rebirth ladder is the half World 3 did not touch",
    `<code>FunnelCohortCompletionRate</code>, funnel <code>PlayerProgression</code>, steps <code>Rebirth1</code>–<code>Rebirth4</code>.`,
    `<p>World 3 moved the base-upgrade ladder by 12 points and the rebirth ladder by nothing — measured at identical returning-player mix, so it is not a veteran-composition artifact. Full working in section 04.</p>
     <p>That is the content-versus-structure distinction and it decides what to build next. A world is consumed once and buys one cycle; a prestige loop regenerates the goal indefinitely out of content that already exists. This game has the loop — it is just not reachable. The treadmill gap already on file is <strong>5M against 75B to clear</strong>, a factor of about 15,000, and any rebalance has to be sized against that number rather than against a feel.</p>
     <p><strong>This is a level judgement and I am not making it.</strong> The metrics date the change and rank it; whether 15,000× is wrong for this game is a question for someone who plays it. What the data does say is that the ladder did not move when everything around it did.</p>`,
    [chip("watch", "structural"), chip("flat", "needs a design call")]),

  fix(2, "New content keeps shipping without the table entries that index it",
    `<code>[OddsController] Unknown rarity: &lt;Tier&gt; Animal: &lt;Name&gt;</code> — 38 signatures in an 18-event band around 550,340, on v587. Same class hit <code>Animations.Animals[x].Idle</code>, <code>Models.Animals[name]</code> and <code>TraitMultiplier[trait]</code>.`,
    `<p>Report the class, not the lines. On v587 four unrelated systems broke from one cause: newly added animals, traits and rarities had no matching row in the tables that look them up. Fixing the four lines guarantees the same four on the next world.</p>
     <p><strong>The export understates the breadth and cannot be used to size it.</strong> The dashboard showed 9 animals missing a rarity entry; reading the live place showed <strong>19</strong>, across five tiers. All 38 signatures sat inside an 18-event band, so the ~26-row cap cut arbitrarily among equals rather than dropping the small ones. When several signatures share a near-identical count, treat the list as truncated and census the source of truth in Studio.</p>
     <p><strong>The ask:</strong> a publish-time check that fails the build when a new asset has no matching row in every table that indexes it. That is the fix; the four line edits are the symptom.</p>`,
    [chip("crit", "recurs every content update"), chip("watch", "export cap hides breadth")]),

  fix(3, "A guard that skipped a purchase prompt",
    `ServerScriptService.OnPlayerAdded:1778 — unguarded index inside an event handler, with <code>PromptProductPurchase:FireClient</code> fifteen lines below it.`,
    `<p>Recorded from a code read on v587 and repeated here because it is the cleanest example of why error counts are the wrong ranking. The throw kills that one invocation of the handler — so the real impact is the statement it skipped, and the statement it skipped was the purchase prompt. <strong>1,844 purchase prompts that never appeared</strong>, and not one metric moved in a way that would have found it.</p>
     <p>Always walk <em>up</em> from the error line to the enclosing connection or thread; that is what bounds the damage. A throw in an event handler kills one invocation. A throw in the join thread kills everything after it for that player — that is the shape that produced the July inventory wipe. A throw inside <code>task.spawn</code> kills only that thread <em>and escapes any enclosing <code>pcall</code></em>, which is how <code>GuardClient:299-322</code> ended up with protection that never applies.</p>`,
    [chip("crit", "revenue"), chip("flat", "code read, confirmed")]),

  fix(4, "The error export is twelve versions stale",
    `Newest export held: <strong>v587</strong>, pulled 16 Aug. Live version is <strong>v599</strong>. Nine publishes in between, including the whole CIRCUS EVENT ship.`,
    `<p>Everything in this report's technical section describes v587. v592, v596, v597, v598 and v599 have shipped since and none of them has message text on file. The 22 August Saturday event was also the first one to lose ground in three weeks (section 05) and there is no error data covering it.</p>
     <p>Pull an “Errors and warnings by count” export at the current version. It gets filed automatically.</p>`,
    [chip("watch", "evidence gap")]),

  fix(5, "Warnings at 35M are not the finding — check the rate before ranking",
    `Kept as a standing note rather than an action.`,
    `<p>On 31 July this game shipped roughly 35 million client warnings — <code>[OddsController] Unknown rarity</code>, a broken season pass, a broken shop UI, about 3M each. All three are monetization or aspiration surfaces, so if they cost anything ARPDAU would step. It did not: 0.368 on 29 Jul → <strong>0.433</strong> on 31 Jul → 0.438 on 8 Aug, the highest of that window. Revenue fell purely with DAU.</p>
     <p>The signature that actually mattered in the same export was <strong>8,249</strong> events — <code>TrainedSpeed is not a valid member of Player</code>, a race on the line that fires the tutorial. Four hundred times smaller and the only one with a mechanism behind it.</p>
     <p>Warnings are usually guarded paths firing per-item per-frame. Convert a count to affected players, or to a rate that moved, before it reaches a priority list.</p>`,
    [chip("flat", "method note")]),
];

const body = [

  sec("headline", "01", "The bleed stopped",
    "This game lost 81% of its players between 9 July and 15 August. The most important number in this report is that the drawdown stopped deepening nine days ago and has been recovering since.",
    `${stats([
      ["Drawdown from 9 Jul peak", "−79.7%", "trough was −81.4% on 15 Aug"],
      ["Weekday concurrents, WoW", "+21% to +54%", "hour-matched, Mon–Thu"],
      ["Revenue, last 7 settled", "R$121.7K/d", "≈ $12,783/mo · +20% WoW"],
      ["Payer conversion", "0.82%", "highest weekly since April"],
    ])}
     ${dauChart(ID, [{ d: "2026-07-09", t: "peak 972K" }, { d: "2026-07-30", t: "v546" }, { d: "2026-08-14", t: "WORLD 3" }])}
     <span class="cap">7-day mean DAU across the game's full life, 30 Mar – 22 Aug. The peak is 972,246 on 9 July; the trough 180,400 on 15 August. The uptick at the right edge is World 3.</span>
     ${table([{ t: "Weekday" }, { t: "wk 03–09 Aug", c: "n" }, { t: "wk 10–16 Aug", c: "n" }, { t: "wk 17–23 Aug", c: "n" }, { t: "wk3 / wk2", c: "n" }],
      [
        ["Mon", { t: "4,589", c: "n" }, { t: "1,917", c: "n" }, { t: "2,421", c: "n" }, { t: "+26.3%", c: "n up" }],
        ["Tue", { t: "3,388", c: "n" }, { t: "1,944", c: "n" }, { t: "2,360", c: "n" }, { t: "+21.4%", c: "n up" }],
        ["Wed", { t: "2,931", c: "n" }, { t: "1,349", c: "n" }, { t: "2,078", c: "n" }, { t: "+54.0%", c: "n up" }],
        ["Thu", { t: "3,149", c: "n" }, { t: "1,332", c: "n" }, { t: "1,941", c: "n" }, { t: "+45.8%", c: "n up" }],
        ["Fri", { t: "2,925", c: "n" }, { t: "2,172", c: "n" }, { t: "2,139", c: "n" }, { t: "−1.5%", c: "n fl" }],
        { __hl: 1, cells: ["Sat", { t: "4,340", c: "n" }, { t: "4,579", c: "n" }, { t: "3,434", c: "n" }, { t: "−25.0%", c: "n dn" }] },
        { __hl: 1, cells: ["Sun", { t: "2,636", c: "n" }, { t: "3,095", c: "n" }, { t: "2,391", c: "n" }, { t: "−22.7%", c: "n dn" }] },
      ], null,
      "Mean concurrents across the half-hour slots the three days share, same weekday each row. Weekdays are recovering strongly and the weekend is not — which is the whole story of this game right now, and it is section 05.")}`),

  sec("cause", "02", "Why it fell — reach was withdrawn, and the deploy steepened it",
    "Two things happened and the order matters. Getting it backwards would send someone to fix the wrong half.",
    `${table([{ t: "Week (Mon)" }, { t: "Impressions", c: "n" }, { t: "New users/d", c: "n" }, { t: "Returning/d", c: "n" }, { t: "EndToEndCVR", c: "n" }, { t: "Not-int / M", c: "n" }, { t: "D1", c: "n" }],
      [
        ["2026-06-29", { t: "14.41M", c: "n" }, { t: "382.1K", c: "n" }, { t: "484.7K", c: "n" }, { t: "5.43%", c: "n" }, { t: "63", c: "n" }, { t: "15.1%", c: "n" }],
        { __hl: 1, cells: ["2026-07-06", { t: "13.76M", c: "n" }, { t: "361.9K", c: "n" }, { t: "546.5K", c: "n" }, { t: "6.04%", c: "n" }, { t: "67", c: "n" }, { t: "17.2%", c: "n" }] },
        ["2026-07-13", { t: "11.73M", c: "n dn" }, { t: "270.6K", c: "n dn" }, { t: "516.2K", c: "n" }, { t: "6.12%", c: "n" }, { t: "61", c: "n" }, { t: "17.3%", c: "n" }],
        ["2026-07-20", { t: "8.75M", c: "n dn" }, { t: "188.3K", c: "n dn" }, { t: "407.8K", c: "n" }, { t: "6.19%", c: "n" }, { t: "58", c: "n" }, { t: "16.4%", c: "n" }],
        { __hl: 1, cells: ["2026-07-27", { t: "9.14M", c: "n" }, { t: "199.9K", c: "n" }, { t: "389.3K", c: "n" }, { t: "5.82%", c: "n" }, { t: "50", c: "n" }, { t: "14.2%", c: "n dn" }] },
        ["2026-08-03", { t: "5.15M", c: "n dn" }, { t: "86.1K", c: "n dn" }, { t: "218.6K", c: "n dn" }, { t: "5.36%", c: "n" }, { t: "49", c: "n" }, { t: "11.4%", c: "n dn" }],
        ["2026-08-10", { t: "2.50M", c: "n dn" }, { t: "41.4K", c: "n dn" }, { t: "140.9K", c: "n dn" }, { t: "6.41%", c: "n up" }, { t: "55", c: "n" }, { t: "13.3%", c: "n" }],
        ["2026-08-17", { t: "2.58M", c: "n" }, { t: "40.4K", c: "n" }, { t: "149.5K", c: "n" }, { t: "6.43%", c: "n up" }, { t: "52", c: "n" }, { t: "13.6%", c: "n" }],
      ], null,
      "Weekly means. New/returning split pulled from <code>DailyActiveUsers</code> by <code>IsNewUser</code>.")}
     <p><strong>Impressions were falling two weeks before retention moved.</strong> −15% in the week of 13 July and −25% in the week of 20 July, with D1 still at 16–17% and click-appeal <em>rising</em>. That is distribution being withdrawn from a listing that was working.</p>
     <p><strong>Then v537–v546 shipped on 30 July</strong> and D1 fell 14.3% → 13.4% → 11.8% → 9.7% across four days, with session length 11.7 → 10.2 minutes. Impressions then fell a further −44% and −51% in the two weeks after.</p>
     <p>So the honest finding is: the deploy did not start the decline, it steepened it. Reporting either half alone gets a producer to the wrong remedy — “the update killed the game” sends someone to revert a build that was not the origin, and “Roblox cut us” lets a real, preventable regression close as environmental.</p>
     <div class="note"><h4>Why reach was withdrawn — and why QPTR work will not get it back</h4>
      <p>Impressions fell 81% and <code>EndToEndCVR</code> went <em>up</em>, 6.04% → 6.43%. Not-interested per million impressions went <em>down</em>, 67 → 52. That is unambiguously the "distribution narrowed, listing still converts" quadrant: the store page is doing its job and is not the constraint.</p>
      <p>The structural reason is the return loop. Roblox re-weighted its recommender on 15 June 2026 to value long-term retention, moving the signal window from 7 days to 28 (D1, D2–7, D8–28) and removing QPTR from ranking. A game with D7 around 2–3% and D30 under 1% is exactly what that change demotes, and a 28-day signal window reaches full effect about four weeks after rollout — roughly 13 July, which is where the impression slide begins.</p>
      <p>Two consequences worth stating plainly. Retention buys distribution with about a four-week lag, so a same-day correlation between DAU and D1 is the wrong test and reads near zero. And QPTR is still a real health signal but it is <strong>not what the recommender ranks on any more</strong> — selling QPTR work as distribution work on this game would be selling the wrong thing.</p></div>`),

  sec("world3", "03", "World 3 worked — and it survives the mix control",
    "Shipped 14 August 17:00 UTC alongside v586/v587. Everything moved at once, which is exactly when a veteran-mix artifact is easiest to mistake for a win.",
    `${table([{ t: "Metric" }, { t: "13 Aug (trough)", c: "n" }, { t: "15 Aug", c: "n" }, { t: "22 Aug", c: "n" }, { t: "Δ trough → 22 Aug", c: "n" }],
      [
        ["DAU", { t: "123.3K", c: "n" }, { t: "260.1K", c: "n" }, { t: "227.3K", c: "n" }, { t: "+84%", c: "n up" }],
        ["EndToEndCVR", { t: "6.07%", c: "n" }, { t: "8.45%", c: "n" }, { t: "7.19%", c: "n" }, { t: "+1.12pp", c: "n up" }],
        ["Payer conversion", { t: "0.58%", c: "n" }, { t: "1.12%", c: "n" }, { t: "0.99%", c: "n" }, { t: "+0.41pp", c: "n up" }],
        ["ARPU", { t: "0.60", c: "n" }, { t: "0.85", c: "n" }, { t: "0.75", c: "n" }, { t: "+25%", c: "n up" }],
        ["Daily revenue", { t: "R$73.1K", c: "n" }, { t: "R$221.9K", c: "n" }, { t: "R$170.4K", c: "n" }, { t: "+133%", c: "n up" }],
        ["Session length", { t: "9.7 min", c: "n" }, { t: "11.8 min", c: "n" }, { t: "11.4 min", c: "n" }, { t: "+18%", c: "n up" }],
      ])}
     <p class="lede" style="margin-top:22px">The funnel is where it gets interesting, and where the obvious reading is wrong.</p>
     <p>The population changed while World 3 shipped: returning share went from 60% in early July to 78–82% now, and returning players complete funnels far better than new ones. A headline funnel gain on a veteran-heavy population can be pure composition — that has happened on this exact game before. So the test is not “did completion rise”, it is <strong>“did completion rise at the same mix”</strong>.</p>
     <p>The regression control is unusable here and that is worth stating: fitting completion on returning share over the 74 pre-World-3 days gives <strong>r = 0.092</strong> for the BaseUpgrades ladder. At that strength the “prediction” is just the fit window's mean, and calling the result mix-controlled would be a lie. So instead — matched pairs, days either side of World 3 whose returning share differs by less than one point:</p>
     ${table([{ t: "Step" }, { t: "Pre (10 Aug)", c: "n" }, { t: "Post (18 Aug)", c: "n" }, { t: "Δ", c: "n" }, { t: "Pre (13 Aug)", c: "n" }, { t: "Post (19 Aug)", c: "n" }, { t: "Δ", c: "n" }, { t: "r vs mix", c: "n" }],
      [
        { __hl: 1, cells: ["BaseUpgrade20", { t: "24.8%", c: "n" }, { t: "37.4%", c: "n" }, { t: "+12.6pp", c: "n up" }, { t: "26.1%", c: "n" }, { t: "38.3%", c: "n" }, { t: "+12.2pp", c: "n up" }, { t: "0.39", c: "n" }] },
        { __hl: 1, cells: ["BaseUpgrade10", { t: "57.0%", c: "n" }, { t: "67.4%", c: "n" }, { t: "+10.5pp", c: "n up" }, { t: "58.6%", c: "n" }, { t: "66.4%", c: "n" }, { t: "+7.7pp", c: "n up" }, { t: "0.43", c: "n" }] },
        ["Rebirth1", { t: "42.0%", c: "n" }, { t: "39.9%", c: "n" }, { t: "−2.1pp", c: "n dn" }, { t: "43.0%", c: "n" }, { t: "38.7%", c: "n" }, { t: "−4.3pp", c: "n dn" }, { t: "0.73", c: "n" }],
        ["Rebirth4", { t: "26.4%", c: "n" }, { t: "26.4%", c: "n" }, { t: "0.0pp", c: "n fl" }, { t: "27.3%", c: "n" }, { t: "25.7%", c: "n" }, { t: "−1.6pp", c: "n dn" }, { t: "0.71", c: "n" }],
      ], null,
      "Returning share: 77.7% on 10 Aug vs 77.5% on 18 Aug; 78.0% on 13 Aug vs 78.0% on 19 Aug. <code>r vs mix</code> is the 83-day correlation between returning share and that step's completion rate.")}
     <p>Two things fall out of that table. <strong>The BaseUpgrades gain is real</strong> — twelve points at the same mix, on two independent pairs, on a ladder whose completion barely tracks mix at all (r = 0.39). <strong>The rebirth ladder did not move</strong>, and it is the one that does track mix strongly (r = 0.71–0.73), which is precisely why its flat-to-slightly-negative reading is credible rather than noise.</p>
     <p>World 3 bought a cycle of content progression and left the structure alone. That is fix 1.</p>`),

  sec("saturday", "04", "The Saturday event, at half-hour resolution",
    "The producer read is “the event spikes get smaller every week”. At daily resolution that is true. At half-hour resolution it is true for a different reason than it looks, and only became true in the last week.",
    `${ccuChart(ID, [{ d: "2026-08-08T15:00", t: "19,593" }, { d: "2026-08-15T15:00", t: "19,546" }, { d: "2026-08-22T15:00", t: "14,791" }])}
     <span class="cap">Half-hour concurrents, 22 days. The three spikes are the weekly ADMIN ABUSE event, which starts at 15:00 UTC every Saturday — and the peak lands in exactly that bucket each time.</span>
     ${table([{ t: "Saturday" }, { t: "Event peak (15:00Z)", c: "n" }, { t: "Preceding Friday peak", c: "n" }, { t: "Multiplier", c: "n" }, { t: "WoW peak", c: "n" }],
      [
        ["8 Aug", { t: "19,593", c: "n" }, { t: "3,556", c: "n" }, { t: "5.5×", c: "n" }, { t: "—", c: "n" }],
        ["15 Aug", { t: "19,546", c: "n" }, { t: "3,430", c: "n" }, { t: "5.7×", c: "n" }, { t: "−0.2%", c: "n fl" }],
        { __hl: 1, cells: ["22 Aug", { t: "14,791", c: "n dn" }, { t: "2,777", c: "n" }, { t: "5.3×", c: "n" }, { t: "−24.3%", c: "n dn" }] },
      ], null,
      "All six numbers are peaks from the same fresh half-hour pull, so the multiplier column compares like with like. The half-hour window starts 3 Aug, so the 1 Aug Saturday is outside it — from the daily series its peak was 21,662 against 9,043 the day before, a 2.4× multiplier on a far larger base.")}
     <p><strong>The event did not lose effectiveness until 22 August.</strong> Its peak was flat between 8 and 15 August — 19,593 then 19,546, a difference of 0.2% — while the weekday baseline underneath it was collapsing. The multiplier has been steady all month (5.5× → 5.7× → 5.3×, and 2.4× on 1 Aug off a far bigger base), which says the mechanic still pulls exactly as hard; the absolute number shrank because the audience it pulls from shrank.</p>
     <p>22 August is the first week the event itself gave ground, −24.3%, and it is worth watching rather than acting on yet. A CIRCUS EVENT started 21 August 17:00 UTC and has no recorded end — it overlaps the weakest Saturday, and whether it competed with the admin abuse or simply coincided is not answerable from one week.</p>
     <div class="note"><h4>The shape says something the daily number hides</h4>
      <p>The 15 August spike ran 3,591 in the small hours, <strong>19,546</strong> at 15:00, and 2,585 in the evening band — settling <em>below</em> where the day started. A daily peak of 14,932 reads as a recovery. The half-hour trace says the game can still buy an hour of attention and cannot hold it past the hour.</p>
      <p>That is not a criticism of the event — it is doing what it is for. It is a reason not to read Saturday numbers as evidence about the game's health, and to exclude them from any per-player ratio, since peak concurrents is a maximum and makes a terrible denominator on a spike day.</p></div>`),

  sec("fixes", "05", "Fix list",
    "Ranked by mechanism. The largest count in the export is not on this list and section 05's last item explains why.",
    FIXES.join("")),

  sec("ladder", "06", "The diagnostic ladder",
    "",
    `${table([{ t: "Rung" }, { t: "Reading" }, { t: "Verdict", c: "w" }],
      [
        { __hl: 1, cells: ["1 · Reach", "Impressions 13.76M/d → 2.58M/d (−81%). New users 401.6K/d → 40.4K/d (−90%). Returning 546.5K → 149.5K (−73%). CVR up, not-interested down.", { t: "The lowest broken rung and the origin of the decline. Distribution withdrawn from a listing that still converts.", c: "w" }] },
        ["2 · Hook", "D1 17.3% (wk 13 Jul) → 11.4% (wk 3 Aug) → 13.6% now. Session 12.7 → 10.1 → 10.9 min.", { t: "Broke on the 30 Jul deploy, partially repaired. Still below the 16–20% healthy band for this portfolio.", c: "w" }],
        ["3 · Return loop", "D7 3.66% → 1.90% → 2.27%. D30 0.4–1%. DAU/MAU 2.9%. RFYL7PlayDays 1.41.", { t: "Weak, and it is the structural reason reach was withdrawn — see the note in section 02.", c: "w" }],
        ["4 · Money", "pCVR 0.45% (wk 3 Aug) → 0.82%. ARPU 0.36 → 0.60. Revenue flat at ~R$111–122K/d while DAU fell.", { t: "Recovering hard. ARPDAU is the highest since May; revenue per player is up while player count is flat.", c: "w" }],
        ["5 · Technical", "Server crash spike 28 Jul – 2 Aug (peak 1,060,617 on 1 Aug), then 1–3/day. Error text only through v587.", { t: "The crash spike hit all four portfolio games in the same window after RCC 732 — association, not a Brainrot defect. And it ended 2 Aug while DAU kept falling to 13 Aug, so it is not the cause of anything.", c: "w" }],
        { __hl: 1, cells: ["6 · Funnel", "BaseUpgrade20 +12.2 to +12.6pp at matched mix. Rebirth1 −2.1 to −4.3pp. FirstMorph 99.4% and OnboardingComplete 100%.", { t: "Content ladder repaired, prestige ladder untouched. Onboarding is not a problem on this game.", c: "w" }] },
      ])}`),

  sec("hypotheses", "07", "Every hypothesis, and what killed it",
    "",
    table([{ t: "Hypothesis" }, { t: "Verdict" }, { t: "The test that decided it", c: "w" }],
      [
        ["Roblox withdrew distribution", { t: "kept", c: "v", v: "kept" }, { t: "Impressions −81%, new users −90%, while EndToEndCVR rose 6.04% → 6.43% and not-interested fell 67 → 52. The listing was not the constraint.", c: "w" }],
        ["The 30 Jul deploy caused the collapse", { t: "partial", c: "v", v: "partial" }, { t: "D1 14.3% → 9.7% across 30 Jul – 2 Aug. But impressions were already −15% and −25% in the two weeks before it, with D1 at 17%. It steepened, it did not start.", c: "w" }],
        ["The crash incident caused it", { t: "cut", c: "v", v: "cut" }, { t: "Crashes ended 2 Aug; DAU kept falling from 492K to 123K through 13 Aug. The effect outlived the cause, so it was not the cause.", c: "w" }],
        ["Weak D8–28 got the game structurally demoted", { t: "kept", c: "v", v: "kept" }, { t: "D7 ≈ 2–3%, D30 < 1%, and the impression slide starts ~13 July — four weeks after Roblox's 15 June re-weighting to a 28-day retention window, which is when a 28-day signal reaches full effect.", c: "w" }],
        ["QPTR work would restore reach", { t: "cut", c: "v", v: "cut" }, { t: "QPTR was removed from RFY ranking on 15 June 2026, and this game's click-appeal rose while reach fell. Wrong lever.", c: "w" }],
        ["The game is still dying", { t: "cut", c: "v", v: "cut" }, { t: "Drawdown bottomed at −81.4% on 15 Aug and is −79.7% now. Weekday concurrents +21% to +54% WoW. Revenue +20% WoW.", c: "w" }],
        ["World 3's funnel gain is a veteran-mix artifact", { t: "cut", c: "v", v: "cut" }, { t: "Matched at 77.5–78.0% returning share on two independent pairs: +12.2 and +12.6pp on BaseUpgrade20. And that step's correlation with mix is only r = 0.39.", c: "w" }],
        ["World 3 fixed the retention problem", { t: "cut", c: "v", v: "cut" }, { t: "Rebirth1 is −2.1 to −4.3pp at matched mix and Rebirth4 flat. The loop that holds D7→D30 did not move.", c: "w" }],
        ["The Saturday event is losing its pull", { t: "partial", c: "v", v: "partial" }, { t: "Peak was flat 8 → 15 Aug (19,593 vs 19,546) and the multiplier held at ~5×. Only 22 Aug is a genuine −24%. One week is not a trend.", c: "w" }],
        ["The 35M-warning ship on 31 Jul cost money", { t: "cut", c: "v", v: "cut" }, { t: "ARPDAU 0.368 → 0.433 → 0.438 across the same days — the highest of the window. Revenue fell purely with DAU.", c: "w" }],
      ], "hyp")),

  sec("actions", "08", "What to do, in order",
    "",
    `<ol class="act">
      <li><strong>Decide on the rebirth ladder.</strong> It is the only lever with a mechanism attached to D7 and D30, and D7/D30 is what the recommender now ranks on. World 3 proved this team can move a ladder 12 points; the question is which ladder. Size any rebalance against the 15,000× treadmill gap, and get the level judgement from someone who plays.</li>
      <li><strong>Ship the publish-time table check.</strong> The unknown-rarity class has now recurred across worlds. A check that fails the build when a new asset has no row in every table that indexes it costs one afternoon and closes the class.</li>
      <li><strong>Pull a current error export.</strong> Twelve versions of blind spot, including the week the Saturday event first lost ground.</li>
      <li><strong>Census the rarity, animation, model and trait tables in Studio.</strong> The export showed 9 missing animals; the place had 19. Do not size this from the dashboard.</li>
      <li><strong>Watch two numbers weekly.</strong> D7 above 3% would say the return loop is genuinely repairing. Weekday concurrents holding above 2,500 would say World 3's gain is durable rather than a launch bump.</li>
     </ol>
     <div class="note"><h4>What would overturn this diagnosis</h4>
      <p>Weekday concurrents falling back under 2,000 in the week of 24 August would mean World 3 bought a bump rather than a floor, and the “bleed stopped” call was premature. Equally, a second consecutive Saturday under 15,000 would turn section 04's “watch it” into a finding about the event mechanic itself.</p></div>`),

  sec("data", "09", "Data notes",
    "",
    `<ul class="tight">
      <li>All three repo gates green: <code>verify</code> 23 pass / 2 fail / 8 skip (both fails documented), <code>audit-plan</code> 0 failures, <code>npm test</code> 44 pass.</li>
      <li>Full life held natively — 146 days of daily headline series from 30 March. No extension pass was needed for this game.</li>
      <li><code>PeakConcurrentPlayers</code> <code>ONE_DAY</code> carries a phantom <strong>2026-08-25</strong> row identical to 08-24, and 21 Aug is flagged <code>partial</code>. Both excluded from every reading here.</li>
      <li>Half-hour concurrents came from a fresh Open Cloud pull. The stored half-hour series is largely <code>FILLED_ZERO</code> padding — the gateway clamps sub-daily windows to the final 24 hours and the exporter gap-fills the rest with zeros, which would read as an empty game.</li>
      <li><code>data-quality.md</code> logs the gateway re-serving <code>FunnelCohortCompletionRate</code> for <code>BaseUpgrade19</code> about 0.5pp higher on a later read across 31 Jul – 14 Aug. Sub-1% recomputation drift; it does not move the +12pp result, which is measured on <code>BaseUpgrade20</code> and <code>BaseUpgrade10</code>.</li>
      <li>A <code>FUNNEL_STEP_NAME_CHANGE</code> annotation on 2026-06-28 (minStep 2) marks the tutorial replacement. Funnel comparisons in this report are all inside August and unaffected by it.</li>
      <li>This game uses Roblox's experimentation platform (<code>new_speed_mechanic</code>, <code>starter_pack_test</code>) and has four recorded <code>CONFIG_CHANGE</code> versions. That means the Configs API is already wired — live balance can be changed without a republish, and reverted the same way. Worth remembering when the rebirth rebalance in action 1 comes up: it may not need a build.</li>
      <li>Newest error export held: <strong>v587 (16 Aug)</strong>. Live version is v599.</li>
     </ul>`),
].join("");

const html = page({
  title: "Brainrot Recovery Check",
  eyebrow: "LiveOps diagnosis · 24 Aug 2026",
  chips: [chip("good", "bleed stopped"), chip("good", "World 3 worked"), chip("watch", "rebirth loop untouched")],
  h1: "Become a Brainrot",
  sub: "Eighty-one percent down from the July peak — and recovering for the first time since. World 3 moved the content ladder twelve points at matched player mix, and left the prestige loop exactly where it was.",
  meta: ["Universe <b>9963622286</b>", "Root place <b>99255447043899</b>", "Created <b>30 Mar 2026</b>", "Live version <b>v599</b>",
    "Behavioural data through <b>22 Aug</b>", "Concurrents through <b>24 Aug 11:30 UTC</b>"],
  nav: [["headline", "The bleed stopped"], ["cause", "Why it fell"], ["world3", "World 3"], ["saturday", "Saturday event"], ["fixes", "Fix list"], ["ladder", "Ladder"], ["hypotheses", "Hypotheses"], ["actions", "Actions"], ["data", "Data notes"]],
  verdict: "The decline has stopped. The drawdown from the 9 July peak bottomed at <strong>−81.4% on 15 August</strong> and has been recovering since; weekday concurrents are up 21–54% week over week on an hour-matched comparison, and revenue is up 20%. The cause of the fall was reach, not the build: impressions fell 81% and new players 90% <em>while</em> click-appeal rose and not-interested fell — distribution withdrawn from a listing that still converts.",
  verdict2: "World 3 (14 August) is a genuine win and it survives the control that usually kills this kind of claim. At <strong>identical returning-player mix</strong>, deep base-upgrade completion is up 12.2 to 12.6 points on two independent matched pairs. The rebirth ladder over the same days is flat to −4 points — so the content got better and the structure did not, which is the difference between buying one cycle and buying a floor.",
  footer: `Built from <code>data/games/9963622286/</code> — 146 days of full-life series held natively — plus a fresh half-hour concurrents pull run 24 Aug 2026. New-versus-returning splits pulled the same day via <code>DailyActiveUsers</code> by <code>IsNewUser</code>. Error message text from <code>data/exports/9963622286-become-a-brainrot/errors/</code>, newest v587. Code-read findings are marked as such and come from earlier sessions recorded in <code>CLAUDE.md</code>.`,
  body,
});
fs.writeFileSync(OUT + "brainrot.html", html);
console.log("brainrot.html", html.length, "bytes");
