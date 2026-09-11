const fs = require("fs");
const p = __dirname + "/content.json";
const C = JSON.parse(fs.readFileSync(p, "utf8"));

// ---- Verity: drop the privacy framing entirely ----
// Username and country are Roblox metadata every experience receives, and an
// unsettling companion is the product, not a defect.
const v = C.verity;
v.hypotheses = v.hypotheses.filter(h => !/privacy/i.test(h.h));
v.feedback.quotes = v.feedback.quotes.filter(q => !/Privacy/i.test(q[2]));
v.feedback.note = "264 comments since 3 Sep, 194 of them downvotes — by far the most feedback volume of the " +
  "five, though net votes improved from −7.5 to +35. The one recurring product complaint is the message cap.";

// ---- Seal: lead the save hypothesis on today's error, not on 3 Sep comments ----
const s = C.seal.hypotheses.find(h => h.h.startsWith("Saves are failing"));
s.why = "<code>[UpgradeService] save failed for &lt;player&gt; after 3 tries: 502</code> and " +
  "<code>[MapReach] … the mark did not save</code> are both on <strong>v915, exported today</strong> — this is " +
  "current, not a leftover. Players reported losing progress on 3 September, including a road unlock lost across " +
  "a rebirth, and the save layer is still failing a week later. The D2–7 block is up (play days +13.6%, playtime " +
  "+16.9%), so the return loop is improving <em>despite</em> this, which makes the save failures a ceiling on a " +
  "mechanic that is otherwise working.";
s.against = "The counts are small — three or so each — but they embed usernames, so one defect shreds across " +
  "many rows and every count is a floor. The export also caps at 25 signatures.";

fs.writeFileSync(p, JSON.stringify(C, null, 1));
console.log("verity hypotheses:", C.verity.hypotheses.map(h => h.h.slice(0, 56)));
console.log("verity quotes:", C.verity.feedback.quotes.length);
