# Data quality — universe 8507699752

Events that make a stored number less trustworthy than it looks. `implausible` = a value outside its unit's plausible range, kept but flagged.

`revision` = the gateway re-served an already-settled point with a **materially** different value (>1%; sub-1% recomputation drift on averaged metrics is normal and is not logged). The FIRST settled read is kept and the later one recorded here.

> **Open question — do not assume the kept value is the right one.** Keeping the first read was chosen after a re-grab replaced a dashboard-confirmed R$3,092 hour with R$747 seven minutes later. Wider evidence complicates that: the largest divergences run the other way (`ItemMonetizationRevenue` 353 → 21,835), which looks like back-fill, and against the dashboard's own export our kept value is sometimes the low one. For any metric labelled *Realtime*, treat a revision row as "this hour is disputed", check the dashboard, and do not build a conclusion on it either way.

| Kind | Metric | Series | Point | Detail | Observed |
|---|---|---|---|---|---|
| revision | SessionDurationSecondsAvg | Platform: Console · Place=73257710123935 | 2026-09-01T00:00:00Z | settled point re-served as 591.0620411160035 (captured 2026-09-03T21:23:26.458Z); kept 610.6344501718185 (captured 2026-09-03T20:59:34.631Z) | 2026-09-03T21:23Z |
| revision | SessionDurationSecondsAvg | Platform: Console · Place=73257710123935 | 2026-09-02T00:00:00Z | settled point re-served as 520.705490405116 (captured 2026-09-03T21:23:26.458Z); kept 528.4171874999986 (captured 2026-09-03T20:59:34.631Z) | 2026-09-03T21:23Z |
| revision | SessionDurationSecondsAvg | Platform: TV · Place=73257710123935 | 2026-09-01T00:00:00Z | settled point re-served as 732.4411764705883 (captured 2026-09-03T21:23:26.458Z); kept 920.4666666666667 (captured 2026-09-03T20:59:34.631Z) | 2026-09-03T21:23Z |
| revision | SessionDurationSecondsAvg | Platform: TV · Place=73257710123935 | 2026-09-02T00:00:00Z | settled point re-served as 512.5833333333334 (captured 2026-09-03T21:23:26.458Z); kept 493.39130434782606 (captured 2026-09-03T20:59:34.631Z) | 2026-09-03T21:23Z |
