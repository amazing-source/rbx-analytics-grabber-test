// Every feedback-driven claim must be dated against the build that targets it.
// A complaint from 3 Sep about a bug fixed on 10 Sep is not a live issue.
const fs = require("fs");
const p = __dirname + "/content.json";
const C = JSON.parse(fs.readFileSync(p, "utf8"));

// ---- Waterslide ----
const w = C.waterslide;
w.hypotheses = w.hypotheses.filter(h => !h.h.startsWith("Progress loss"));

// raft bug: confirmed still live on the newest build
const raft = w.hypotheses.find(h => h.h.includes("shop screens"));
raft.h = "Two shop screens cost a third of the tutorial, and the raft shop is still throwing";
raft.conf = "confirmed";
raft.why = "The tutorial's worst steps are <code>Tutorial_Main_5_ToRaftShop</code> (13.3% churn) and " +
  "<code>Tutorial_Main_10_BuyEgg</code> (14.3% churn) — both shop screens, together costing about a third of " +
  "everyone who starts. The raft shop throws <code>GoShop_Raft:102: attempt to index nil with &lsquo;Get&rsquo;</code> " +
  "inside <code>RefreshList</code>, called straight from <code>OnOpen</code>. <strong>This is on V1721, first seen " +
  "18:43 on 11 September — after the 10 September build that was meant to fix the raft UI.</strong> The scroll " +
  "complaints and the throw are the same screen, and the fix did not land.";
raft.against = "Two events on a build a few hours old. The volume is small; the point is that it is still there " +
  "after a fix aimed at it.";
raft.fix = "Make <code>RefreshList</code> tolerate a nil entry — the stack goes straight from <code>OnOpen</code>, " +
  "so the list fails to build the moment the shop is opened. Then watch steps 5 and 10; both compound through " +
  "every step below them.";

// progress loss: reframed as pre-fix, needs re-reading rather than action
w.hypotheses.push({
  h: "The progress-loss reports all predate the fix aimed at them",
  conf: "confirmed",
  why: "Three players reported losing everything, one explicitly after Robux purchases. <strong>Those comments " +
    "are dated 3–7 September.</strong> The 10 September build lists “some were complaining about not receiving " +
    "cash at all sometimes” as a fix. So the complaints sit before the remedy, not after it.",
  against: "Nothing in this window measures whether the fix worked — it shipped a day ago and the feedback " +
    "since is too thin to read.",
  fix: "Do not action this from these comments. Re-read feedback and paying users on <strong>17 September</strong>, " +
    "a week after the fix. If fresh reports appear on builds from 10 September onward, it is live again and " +
    "becomes a priority; if not, it is closed."
});
w.verdict.label = "Distribution withdrawn while the listing improved";

// ---- Verity: the message-cap complaints predate v689 ----
const cap = C.verity.hypotheses.find(h => h.h.includes("message cap"));
cap.against = "The quoted complaints are from <strong>3 September, five days before v689</strong> shipped the daily " +
  "and returning-player rewards that hand out more messages — so they describe the problem the studio has " +
  "already acted on, not the state after it. Bounce is also scoped to RFY-organic traffic only, and impressions " +
  "fell 54% across the window, so the population behind that rate changed too.";
cap.fix = "The 60–180s bounce rise is measured after v689 and is the part that still needs answering: the daily " +
  "rewards help someone who returns tomorrow, not someone hitting the wall in their first three minutes. Re-read " +
  "bounce at 60–180s on <strong>15 September</strong>, when v689 has a full week behind it.";

fs.writeFileSync(p, JSON.stringify(C, null, 1));
console.log("waterslide hypotheses:", C.waterslide.hypotheses.map(h => h.h.slice(0, 52)));
