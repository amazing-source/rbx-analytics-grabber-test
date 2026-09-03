import io

p = 'analysis/cross-game-report.html'
s = io.open(p, encoding='utf-8').read()

# ---------- 1. new finding 09, inserted after finding 08 ----------
anchor = """  </div>
</div>
</section>

<section>
<div class="sec-head"><h2>Data quality</h2>"""
assert anchor in s, "finding-08 anchor not found"

new09 = """  </div>
</div>

<div class="finding">
  <div class="fnum">09</div>
  <div class="fbody">
    <h3>The games did not get worse for the players Roblox sent them &mdash; quality held as reach scaled, and no ranking signal leads the pullback <span class="tag t-conf">confirmed</span></h3>
    <p class="measure"><b>Added 3 September.</b> Roblox publishes the signals it ranks Home recommendations on, and states that an impressions drop <em>typically follows</em> a fall in play-through rate, play days or playtime, or a rise in first-play bounce. That is a testable mechanism, and it is the one this report was missing. Every one of those signals is served per-day over each game's life, so I pulled them: 152 days on Brainrot, 50 on Waterslide, 25 on Verity, 18 on Seal, plus the D8&ndash;28 segment matching Roblox's own 28-day ranking window. Both tests below use <span class="mono">UniqueUsersWithImpressions</span> filtered to <span class="mono">HomeRecommendation</span> &mdash; the correct denominator, not the all-source total finding 01 used.</p>

    <p class="measure"><b>Test 1 &mdash; does quality survive the expansion?</b> Roblox scales an experience by showing it to a wider audience, and warns that temporary PTR dilution during that expansion is normal. What matters is whether the <em>downstream</em> signals hold. Partial correlation of each signal against log Home reach, controlling for a linear time trend and weekday fixed effects:</p>
    <div class="tblwrap" style="margin:14px 0 10px">
    <table>
    <thead><tr><th>Signal (Roblox's own ranking inputs)</th><th>Brainrot<br><span class="dim">n=152</span></th><th>Waterslide<br><span class="dim">n=50</span></th><th style="text-align:left">Reading at higher reach</th></tr></thead>
    <tbody>
    <tr><td class="lbl">Play-through rate</td><td>&minus;0.68*</td><td>+0.52*</td><td style="text-align:left">Dilutes on Brainrot &mdash; the documented, normal expansion effect</td></tr>
    <tr><td class="lbl">First-play bounce &lt;60s</td><td>&minus;0.43*</td><td>&minus;0.54*</td><td style="text-align:left">Bounce <em>falls</em> as reach rises &mdash; better, both games</td></tr>
    <tr><td class="lbl">First-play bounce 61&ndash;180s</td><td>&minus;0.62*</td><td>&minus;0.45*</td><td style="text-align:left">Better, both games</td></tr>
    <tr><td class="lbl">D1 playtime</td><td>+0.70*</td><td class="dim">+0.15</td><td style="text-align:left">Better on Brainrot, flat on Waterslide</td></tr>
    <tr><td class="lbl">D2&ndash;7 play days</td><td>+0.67*</td><td>+0.37*</td><td style="text-align:left">Better, both games</td></tr>
    <tr><td class="lbl">D2&ndash;7 playtime</td><td>+0.82*</td><td class="dim">+0.18</td><td style="text-align:left">Better on Brainrot</td></tr>
    <tr><td class="lbl">D8&ndash;28 play days</td><td>+0.32*</td><td>+0.40*</td><td style="text-align:left">Better, both games</td></tr>
    <tr><td class="lbl">D8&ndash;28 playtime</td><td>+0.57*</td><td>+0.51*</td><td style="text-align:left">Better, both games</td></tr>
    <tr><td class="lbl">D8&ndash;28 qualified sessions</td><td>+0.47*</td><td>+0.47*</td><td style="text-align:left">Better, both games</td></tr>
    </tbody>
    </table>
    </div>
    <p class="measure" style="margin-top:-2px"><span class="dim">* p&lt;0.05. Verity and Seal are omitted from this table: at 25 and 18 days their series are too short to carry the test, and Roblox served no D8&ndash;28 data for either &mdash; an empty 200, meaning cohorts not yet matured, not a failed request.</span></p>
    <p class="measure">The marginal player Roblox added was <em>not</em> worse. On the two games with enough history, every long-horizon engagement signal moves in the game's favour when reach is high. Only PTR dilutes, on one game, and that is the effect Roblox documents as normal during an expansion. <b>These games passed the expansion test on quality and had the push withdrawn anyway.</b></p>

    <p class="measure"><b>Test 2 &mdash; does any signal lead the pullback?</b> Granger-style, on daily first differences, each direction given the same search over lags 1&ndash;7 and Sidak-corrected for that search. The symmetry matters: my first run gave the forward direction seven lags and the reverse only one, which manufactured five "signal leads reach" results on Waterslide that all vanished once both sides were tested the same way.</p>
    <div class="tblwrap" style="margin:14px 0 10px">
    <table>
    <thead><tr><th>Game</th><th>Signals leading reach</th><th>Signals following reach</th><th style="text-align:left">Reading</th></tr></thead>
    <tbody>
    <tr><td class="lbl">Brainrot</td><td>1 of 14 <span class="dim">(bounce 61&ndash;180s, p=0.022)</span></td><td>1 of 14</td><td style="text-align:left">Two more form a bidirectional loop; the rest are silent. One marginal hit across 32 tests is what chance produces.</td></tr>
    <tr><td class="lbl">Waterslide</td><td class="dim">0 of 14</td><td>6 of 14</td><td style="text-align:left">Every result runs reach&nbsp;&rarr;&nbsp;signal. Nothing leads.</td></tr>
    </tbody>
    </table>
    </div>
    <p class="measure"><b>No signal reliably leads the reach pullback in either game.</b> Waterslide is the cleanest case on the page: it lost <b>79.8%</b> of its Home reach from its 2 August peak while D8&ndash;28 play days moved &minus;2.8%, D8&ndash;28 playtime &minus;3.1%, PTR <em>+3.4%</em> and first-play bounce <em>improved</em> 9.6%. Everything Roblox says it ranks on was flat or better through an 80% withdrawal.</p>
    <p class="measure">One honest exception: Brainrot's own first-play bounce &lt;60s is 44% worse now than in the 28 days to its peak. But bounce on that game runs <em>inversely</em> to reach (&minus;0.43), so the current level is what the low-reach state produces, and it does not lead reach in test 2. It is a consequence, not the trigger.</p>
    <p class="measure"><b>What this does and does not settle.</b> It does not prove what caused the pullback &mdash; the ranking function is not published, and competition, seasonality and Discovery-side changes are unobserved. Finding 07's direction problem is untouched. What it removes is the most plausible product-side explanation: that these games degraded for the audience Roblox was testing them on. Measured against Roblox's own published signals, they did not. Note that the reverse direction is partly mechanical &mdash; the RFY signals are computed over RFY-acquired players, so a collapse in reach changes the cohort behind the signal. That makes "reach leads signal" weak evidence for its own arrow, and the <em>absence of a leading degradation</em> the robust result here.</p>
  </div>
</div>
</section>

<section>
<div class="sec-head"><h2>Data quality</h2>"""
s = s.replace(anchor, new09, 1)

# ---------- 2. the health-check overreach ----------
old2 = """<p class="measure">The practical consequence: <b>no product fix will restore these DAU numbers</b>, because nothing about the product is what changed. Product fixes change what happens to the traffic you still get, and that is where the money is.</p>"""
assert old2 in s, "health-check sentence not found"
new2 = """<p class="measure">The practical consequence: <b>a product fix should not be expected to restore these DAU numbers</b>, because this traffic is allocated rather than earned week to week. That is a claim about what a fix can be expected to <em>move</em>, and it is deliberately weaker than the one an earlier draft made. Saying "nothing about the product is what changed" was wrong on this page's own evidence &mdash; finding 02 dates a real product break on three of the four games. What finding 09 adds is that those breaks are not what the recommender responded to: the ranking signals held or improved right through the withdrawal. Both things are true at once. The bugs are real and worth fixing, and fixing them buys better outcomes on the traffic you still get rather than the return of the traffic you lost.</p>"""
s = s.replace(old2, new2, 1)

# ---------- 3. what this cannot tell you ----------
old3 = """  <p>Why the reach fell, or even whether it fell first. The RFY ranking signals are captured and none is falling hard enough on its own to explain a 56&ndash;95% reach loss, and the ranking function is not published. Worse, the lead&ndash;lag test in finding 07 cannot separate reach&nbsp;&rarr;&nbsp;DAU from DAU&nbsp;&rarr;&nbsp;reach, and on Brainrot it leans the wrong way for this report. "The algorithm withdrew the push" is a description of the shape, not a mechanism and not a proven direction. Treat it as the question to answer, not the answer.</p>"""
assert old3 in s, "cannot-tell-you block not found"
new3 = """  <p><b>Updated 3 September.</b> Why the reach fell. The ranking function is not published, and competition, seasonality and Roblox-side Discovery changes are all unobserved here. Finding 07's direction problem stands: the lead&ndash;lag test cannot separate reach&nbsp;&rarr;&nbsp;DAU from DAU&nbsp;&rarr;&nbsp;reach, and on Brainrot it leans the wrong way for this report. "The algorithm withdrew the push" remains a description of the shape, not a mechanism.</p>
  <p>What changed since the first version is the sentence that used to sit here. It said the ranking signals were "captured and none is falling hard enough to explain a 56&ndash;95% reach loss" &mdash; an eyeballed claim, not a test. Finding 09 now runs the test properly on 152 days of Brainrot and 50 of Waterslide, and it rules out one specific mechanism: these games did not degrade for the audience Roblox was scaling them to. That is narrower and better supported than the sentence it replaces.</p>
  <p>Still genuinely open, and not answerable from what we grab: whether the pullback is competitive (other titles outranking these on the same signals), seasonal, or a Discovery-side change. Roblox lists all three as reach factors alongside game changes, and we observe none of them. The country-level ARPDAU test for the market-mix explanation, and whether Seal's save loss is a bug or a data-store design limit, both remain open too.</p>
  <p>One instrumentation gap is worth naming on its own: none of this can locate <em>where</em> a new player gives up, because these games do not emit onboarding funnel steps. That is in-game code (<span class="mono">LogOnboardingFunnelStepEvent</span>), not something the grabber can add, and it is the difference between "bounce rose" and "they quit at the third tutorial step, on Phone".</p>"""
s = s.replace(old3, new3, 1)

io.open(p, 'w', encoding='utf-8').write(s)
print("edits applied; file now", len(s), "chars")
