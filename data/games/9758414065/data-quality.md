# Data quality — universe 9758414065

Events that make a stored number less trustworthy than it looks. `implausible` = a value outside its unit's plausible range, kept but flagged.

`revision` = the gateway re-served an already-settled point with a **materially** different value (>1%; sub-1% recomputation drift on averaged metrics is normal and is not logged). The FIRST settled read is kept and the later one recorded here.

> **Open question — do not assume the kept value is the right one.** Keeping the first read was chosen after a re-grab replaced a dashboard-confirmed R$3,092 hour with R$747 seven minutes later. Wider evidence complicates that: the largest divergences run the other way (`ItemMonetizationRevenue` 353 → 21,835), which looks like back-fill, and against the dashboard's own export our kept value is sometimes the low one. For any metric labelled *Realtime*, treat a revision row as "this hour is disputed", check the dashboard, and do not build a conclusion on it either way.

| Kind | Metric | Series | Point | Detail | Observed |
|---|---|---|---|---|---|
| revision | SessionDurationSecondsAvg | Place=137768115850394 | 2026-09-02T00:00:00Z | settled point re-served as 536.8269027182317 (captured 2026-09-03T20:33:56.170Z); kept 515.317660177693 (captured 2026-09-03T20:33:08.486Z) | 2026-09-03T20:33Z |
| revision | SessionDurationSecondsAvg | Place=137768115850394 | 2026-09-02T00:00:00Z | settled point re-served as 536.8269027182317 (captured 2026-09-03T20:36:37.569Z); kept 515.317660177693 (captured 2026-09-03T20:33:08.486Z) | 2026-09-03T20:36Z |
| revision | SessionDurationSecondsAvg | Place=137768115850394 | 2026-08-29T00:00:00Z | settled point re-served as 420.93868563450013 (captured 2026-09-03T21:38:16.337Z); kept 429.0702599443891 (captured 2026-09-03T20:33:08.486Z) | 2026-09-03T21:38Z |
| revision | SessionDurationSecondsAvg | Place=137768115850394 | 2026-09-02T00:00:00Z | settled point re-served as 501.6040265847197 (captured 2026-09-03T21:38:16.337Z); kept 515.317660177693 (captured 2026-09-03T20:33:08.486Z) | 2026-09-03T21:38Z |
| revision | SessionDurationSecondsAvg | Platform: Phone · Place=137768115850394 | 2026-08-31T00:00:00Z | settled point re-served as 404.7673962959177 (captured 2026-09-03T21:38:16.340Z); kept 409.1176105626092 (captured 2026-09-03T20:33:08.594Z) | 2026-09-03T21:38Z |
| revision | SessionDurationSecondsAvg | Platform: Phone · Place=137768115850394 | 2026-09-01T00:00:00Z | settled point re-served as 477.342453674457 (captured 2026-09-03T21:38:16.340Z); kept 470.48502914489075 (captured 2026-09-03T20:33:08.594Z) | 2026-09-03T21:38Z |
| revision | SessionDurationSecondsAvg | Platform: TV · Place=137768115850394 | 2026-09-02T00:00:00Z | settled point re-served as 220 (captured 2026-09-03T21:38:16.340Z); kept 207.45833333333334 (captured 2026-09-03T20:33:08.594Z) | 2026-09-03T21:38Z |
| revision | SessionDurationSecondsAvg | Platform: Tablet · Place=137768115850394 | 2026-08-29T00:00:00Z | settled point re-served as 391.92004721621095 (captured 2026-09-03T21:38:16.340Z); kept 412.59474265651727 (captured 2026-09-03T20:33:08.594Z) | 2026-09-03T21:38Z |
| revision | SessionDurationSecondsAvg | Platform: Tablet · Place=137768115850394 | 2026-08-31T00:00:00Z | settled point re-served as 431.58446672501594 (captured 2026-09-03T21:38:16.340Z); kept 416.4612291168233 (captured 2026-09-03T20:33:08.594Z) | 2026-09-03T21:38Z |
| revision | SessionDurationSecondsAvg | Platform: Tablet · Place=137768115850394 | 2026-09-02T00:00:00Z | settled point re-served as 496.3823690572118 (captured 2026-09-03T21:38:16.340Z); kept 510.17426765015813 (captured 2026-09-03T20:33:08.594Z) | 2026-09-03T21:38Z |
