const fs = require('fs');
const path = require('path');

const B = [];
const h1 = t => B.push({ type: 'h1', text: t });
const h2 = t => B.push({ type: 'h2', text: t });
const h3 = t => B.push({ type: 'h3', text: t });
const p = (...runs) => B.push({ type: 'para', runs: runs.map(r => typeof r === 'string' ? { t: r } : r) });
const li = (...runs) => B.push({ type: 'bullet', runs: runs.map(r => typeof r === 'string' ? { t: r } : r) });
const gap = () => B.push({ type: 'spacer' });
const call = (runs, accent, fill) => B.push({ type: 'callout', runs: runs.map(r => typeof r === 'string' ? { t: r } : r), accent, fill });
const tbl = (widths, header, rows) => B.push({ type: 'table', widths, header, rows });
const b = t => ({ t, b: true });
const i = t => ({ t, i: true });

// ---------------------------------------------------------------- title
h1('LiveOps Analytics at Indigo');
p({ t: 'What tracking updates has found across four titles, and the case for making it a full-time role', i: true, sz: 26, color: '3F3BA0' });
p({ t: 'Dilan Djematene, QA. 16 August 2026.', sz: 21, color: '5A5F7A' });

// ---------------------------------------------------------------- summary
h2('The short version');

p('I test games for Indigo. Over the last few weeks I started doing something outside that remit: pulling the full metrics history for a title, tracking what an update does to it after it ships, and reading the code when the numbers point somewhere specific.');

p('This is what that found across four games. Three of them needed completely different answers, and in two cases the obvious answer would have been the wrong one to act on.');

tbl([20, 44, 36],
  [{ t: 'Game' }, { t: 'What the data said' }, { t: 'What to do about it' }],
  [
    [{ runs: [b('Become a Brainrot')] }, { t: 'A forced model swap on 30 July broke week one retention, and the build carried real defects.' }, { t: 'Fix them. Done, and the save guard is still catching writes today.' }],
    [{ runs: [b('Knife Farm')] }, { t: 'Not a bug and not the algorithm. Both were ruled out. The problem is structural week one retention.' }, { t: 'Do not spend a sprint bug hunting. It would have found nothing.' }],
    [{ runs: [b('Waterslide')] }, { t: 'Healthy through its 14 August update. Every check passed and money never moved.' }, { t: 'Keep shipping.' }],
    [{ runs: [b('Climb Up Mountain')] }, { t: 'Died of audience exhaustion. Its technical history has already expired and cannot be recovered.' }, { t: 'Unanswerable now. This is the reason to measure earlier.' }],
  ]);

p('The numbers behind that:');

call([b('8 days'), ' passed between Become a Brainrot dropping on 30 July and anyone looking at why.'], '3F3BA0', 'EEEEF7');
call([b('16.8% to 9.7%'), '. Day one retention over the four days after that deploy. It has still not fully returned.'], '3F3BA0', 'EEEEF7');
call([b('$7,400 to $11,300'), ' lost since 21 July on the conservative baseline. The current run rate gap is ', b('$21,392 a month'), ', which is ', b('$128,352'), ' of asset value at the multiple the owner is asking.'], '3F3BA0', 'EEEEF7');
call([b('4,229 saves refused'), ' in the last 7 days by a guard that only exists because this work happened. Each one is a session that failed to load and would previously have written over a real inventory.'], '2E7D32', 'EDF6ED');
call([b('13 minutes'), '. How long after the Waterslide update published that a complete before and after baseline was already captured.'], '2E7D32', 'EDF6ED');

// ---------------------------------------------------------------- brainrot
h2('Become a Brainrot: the one that was bleeding');

h3('The change was forced, so this is not about a bad decision');

p('After the game was sold, the previous owner told the studio the brainrot models were stolen and the game could be taken down for it. The models had to be replaced. That is a legal problem with a deadline attached, not a design choice, and swapping that much content that fast is genuinely hard to do safely.');

p('That matters for reading everything below. Nothing here says the swap should not have happened. It says the swap shipped and then ran without anyone measuring what it did.');

h3('The first swap recovered. The second one did not.');

p('This is the part that is only visible with a daily series, and it is the reason the early read at the time was correct.');

tbl([24, 19, 19, 19, 19],
  [{ t: '' }, { t: '19 Jul' }, { t: '22 Jul swap' }, { t: '25 Jul' }, { t: 'After 30 Jul' }],
  [
    [{ runs: [b('Daily active users')] }, { t: '855,710' }, { t: '361,151' }, { runs: [{ t: '776,393', b: true, color: '2E7D32' }] }, { runs: [{ t: '123,316', b: true, color: 'B3261E' }] }],
    [{ runs: [b('Day one retention')] }, { t: '15.1%' }, { t: '16.4%' }, { t: '16.5%' }, { runs: [{ t: '9.7%', b: true, color: 'B3261E' }] }],
    [{ runs: [b('Session length')] }, { t: '12.4 min' }, { t: '10.9 min' }, { t: '12.3 min' }, { runs: [{ t: '10.6 min', b: true, color: 'B3261E' }] }],
  ]);

p('The 22 July swap dipped for a single day and was fully recovered three days later. Retention never moved at all. On that evidence the models were not the problem, and that was the right call to make at the time.');

p('The 30 July build was different. It replaced more models, including most of the ones players see in the first minutes. Day one retention fell on the publish day and kept falling for four days. Session length broke on the same day and stayed broken. Neither has returned to where it was.');

p({ t: 'The crash wave everyone noticed was a red herring.', b: true });
p('There was a large crash event on 1 August, over a million server crashes. It looks like the obvious cause and it is not. Retention broke before the crashes started, and the decline carried on for three days after they stopped. If that had been treated as the cause, the real problem would have kept running.');

h3('What was actually in the build');

p('Once the metrics pointed at the deploy, the code answered the rest. These were traced to specific lines and confirmed against the live place:');

li('Permanent inventory loss. Older save records were missing a key the new code assumed was there, so loading threw before the player inventory ran. The player joined empty, and the next save wrote that empty inventory over the real one.');
li('An economy breaking duplication bug.');
li('Server side failures that could take out a whole server, and softlocks that left players stuck until they rejoined.');

p([{ t: 'For scale, not as a bill: ', i: true }, 'Do Big Studios publishes a bug bounty that puts item duplication and systemic economy compromise in its top tier at up to $5,000 for a single report. That is what one finding of that class is worth on the open market.'].map(x => typeof x === 'string' ? { t: x } : x));

h3('The fix is holding, and it has a number');

p('The inventory loss was fixed by refusing to save a session that did not load correctly. That guard fired ', { t: '4,229 times in the last 7 days', b: true }, '. Every one of those is a save that would previously have destroyed a player’s inventory permanently.');
p('That is the clearest measure of what this work is worth. It is not a projection. It is a count of damage that is being prevented right now, every day, on a game that is still live.');

// ---------------------------------------------------------------- ruling out
h2('Knowing which problem you have before you spend a sprint on it');

p('The expensive mistake in LiveOps is not missing a bug. It is spending two weeks fixing the wrong thing. Two of the four games came back with an answer that stopped work rather than starting it.');

p({ t: 'Knife Farm', b: true });
p('The concern was that bugs or the recommendation algorithm had caused the decline. Both were checked and neither held up. Day one retention is fine and always has been, sitting between 16 and 25 percent, which is above its peer cohort. Day seven fell from 4.5% to 1.3% and day thirty from 2.7% to 0.2%. Roblox sends players, the game holds them for a day, almost none come back in a week, and distribution gets withdrawn.');
p('That is a structural problem with week one, not a defect. A bug hunting sprint there would have found nothing and cost the time anyway. Content updates only buy another cycle.');

p({ t: 'Waterslide', b: true });
p('Its 14 August update was measured against thresholds set before it shipped. Day one retention came in at 14.1 to 14.7 percent against a 12.5 percent fail line. Session length held at 15.1 to 15.5 minutes. Crash rate went down. Server errors stayed inside their normal band, and payer conversion actually rose. Daily users went from 219,574 to 295,154 and revenue from R$107,236 to R$131,194.');
p('The answer there was to do nothing and keep shipping, which is only a useful answer because it was measured rather than assumed.');

// ---------------------------------------------------------------- watching live
h2('Watching an update while it ships');

p('Nina changed what I was doing a few weeks ago. Instead of testing a build and signing off, the job became tracking the update for hours after it publishes, confirming it is healthy, and catching problems while they are still cheap. Two updates have now been run that way.');

h3('Waterslide, 14 August');

p('The update published at 17:29 UTC. A complete baseline of the game before it was captured at 17:43, thirteen minutes later, along with the exact thresholds that would count as broken. When the post update data arrived, the comparison was already defined. Nobody had to argue about what normal looked like.');

h3('Become a Brainrot, World 3, 14 August');

p('Engagement was good. Daily users rose 46.3% and revenue 39.9% against the day before. That number is flagged rather than claimed, because the update only had 3.8 hours of exposure that day and something else was also running.');

p('Eight issues came out of it. Four were the same mistake repeated: new content added without an entry in a table that another system looks it up by. Two of them are still live in the current build and both are one line:');

li('A misspelled name means a purchase prompt never fires. It has produced 3,030 errors and the count is still climbing, so the last three publishes did not fix it.');
li('An upgrade button does nothing for any item saved without a particular field. 4,303 errors. The player clicks, no money is taken, nothing happens, and no error is shown. The correct pattern for this is already written 40 lines above in the same file.');

p({ t: 'The update also has a cost that no error log would show you.', b: true });
p('Out of memory exits went from about 700 a day to 5,213. Client memory is up 21% and frame rate on the weakest devices is down 23%, while server performance never moved at all. The new world is heavier than the hardware at the bottom of the player base can carry, and every one of those exits is a lost session. That is a budgeting decision, not a bug fix, and it is only visible if somebody is looking at the performance series.');

// ---------------------------------------------------------------- coverage
h2('Why nobody was watching');

p('The 8 day gap on Become a Brainrot is the single most expensive fact in this document, and it is worth being precise about what caused it.');

p('It was not an oversight. The model swap was an emergency with a legal deadline. Producers were doing the work of getting a large content replacement out of the door under time pressure, which is exactly the situation where a portfolio has the least attention to spare. It is also exactly the situation where an update is most likely to break something, because it was built fast and shipped fast.');

call([b('That is the gap. The moments that most need watching are the moments when nobody has capacity to watch.'), ' A producer running several live titles cannot also be reading daily retention series on each of them, and no part of the current cycle assigns that to anyone.'], 'E3B341', 'FDF7E7');

p('This is a resourcing problem, and it gets worse with scale. Indigo runs a portfolio far larger than the four games in this document. Every title in it is either being watched by someone with other priorities, or not watched at all.');

p({ t: 'None of this is specific to one producer or one set of games.', b: true });
p('The four games in this document sit across different studios, different genres and different problems, and the same method worked on all of them. Nothing in it is tuned to a particular title. It reads whatever Roblox serves for whichever universe it is pointed at.');
p('So the same coverage applies to any producer carrying live games, and the forced emergency that started this will happen again somewhere else in the portfolio. A rushed content replacement, a takedown notice, a platform change nobody controls. When it does, the question is whether someone is measuring what it did within hours or within weeks. I would rather that be answered for every portfolio than only for the games I happen to be assigned.');

p({ t: 'There is also a deadline on the evidence itself.', b: true });
p('Roblox only keeps technical history for roughly the last 30 days, and error history for around 56. After that it is gone permanently. Climb Up Mountain is the proof: every one of its technical metrics now fails to return, so whether something broke it can never be answered. A game that is not measured while it is alive cannot be diagnosed later. The data does not wait.');

// ---------------------------------------------------------------- can do
h2('What I can do now');

p('The tooling for this already exists. I built it, it runs, and it is what produced every number in this document.');

li('It pulls the complete metric set Roblox serves for a title, across the full life of the game, not just what a dashboard page happens to render.');
li('It dates every metric change against the actual publish log, which is what turns a step in a chart into a specific build.');
li('It reads the error export down to the script and line number, then checks that against the live place to work out what the failure actually costs. That is the difference between a scary looking log and a real problem.');
li('It checks itself. Every figure it produces is verified cell by cell against Roblox’s own exports, so a number that does not match gets caught before it reaches a report rather than after.');

p('In practice that means a game can go from nothing to a full diagnosis in a day, and an update can be checked the same afternoon it ships. The write ups attached to this document were produced that way.');

p('The limit is that it is manual. I run it, I read it, and I write it up. That works for a handful of games at a time and it does not scale past that.');

// ---------------------------------------------------------------- will build
h2('What I would build');

p('Full time, the job is not just running this more often. It is removing me from the loop for the parts that do not need a person.');

tbl([32, 68],
  [{ t: 'Build' }, { t: 'What it changes' }],
  [
    [{ runs: [b('Automatic publish tracking')] }, { t: 'The moment a title publishes, a baseline is captured and the post update comparison is scheduled. No one has to remember, and the before half is never lost again.' }],
    [{ runs: [b('Scheduled grabs on every title')] }, { t: 'Technical history stops expiring unwatched. Any game in the portfolio can be diagnosed later because the evidence was collected while it existed.' }],
    [{ runs: [b('Threshold alerts')] }, { t: 'Retention, crash rate, conversion and error volume checked against each game’s own baseline, so a producer gets told a title moved instead of finding out weeks later.' }],
    [{ runs: [b('A dashboard the team opens')] }, { t: 'Portfolio health in one place, so this stops depending on me being the person who looks.' }],
  ]);

p('Built inside Indigo and owned by Indigo. The point of automating it is that the coverage keeps working whether or not I am the one running it, and any producer can use it without going through me.');

p('Ordered by what pays back first: publish tracking and scheduled grabs come before the dashboard, because those two stop the losses that are happening now.');

// ---------------------------------------------------------------- ask
h2('What I am asking for');

p({ t: 'A full time LiveOps analytics role.', b: true, sz: 26 });

p('Right now this is happening in the gaps around QA work, on the games I happen to be assigned to. That is why it caught Become a Brainrot on 7 August instead of 30 July, and it is why coverage stops at whatever I can personally get to.');

p('What changes with the role is that update tracking becomes something the studio does by default rather than something that happens when a tester goes looking. Every publish gets a baseline. Every title keeps its history. Producers get told when a number moves instead of discovering it a fortnight later, and they get told which of the three answers they are looking at before they spend a sprint.');

p('It also stops being tied to one producer. I want this pointed at other portfolios too, not because anything is going wrong on them, but because nobody knows either way until someone measures, and by the time a decline is obvious the technical evidence has already expired. Any producer with a live title should be able to ask what an update did and get an answer the same day.');

p('I am also asking to be closer to the portfolio than I am now. Part of the reason I cannot give a coverage number in this document is that I only see the games I am handed. The value of this scales with how much of the portfolio it can see.');

// ---------------------------------------------------------------- appendix
h2('Attached');

p('Full write ups, each with the underlying data and the checks behind every claim:');

li([b('Become a Brainrot, LiveOps Bleed Report'), { t: '. The 30 July decline, the three separate causes, and what was ruled out.' }]);
li([b('Brainrot Error Analysis, 12 August'), { t: '. Seven defects traced to code, including two of my own theories that turned out to be wrong and are marked as such.' }]);
li([b('Brainrot, World 3 update check, 15 August'), { t: '. The first update tracked end to end from publish.' }]);
li([b('Knife Farm, Decline Diagnosis'), { t: '. Why it is retention and not bugs or reach.' }]);

p({ t: 'One note on all of them. Where a finding of mine turned out to be wrong, it is struck and corrected in place rather than quietly removed. Four conclusions have been withdrawn that way. A report that is only right when nobody checks it is not worth having.', i: true });

fs.writeFileSync(path.join(__dirname, 'blocks.json'), JSON.stringify(B, null, 1));
console.log('wrote ' + B.length + ' blocks');
