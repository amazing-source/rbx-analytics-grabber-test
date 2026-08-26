# Data quality — universe 10565445771

Events that make a stored number less trustworthy than it looks. `implausible` = a value outside its unit's plausible range, kept but flagged.

`revision` = the gateway re-served an already-settled point with a **materially** different value (>1%; sub-1% recomputation drift on averaged metrics is normal and is not logged). The FIRST settled read is kept and the later one recorded here.

> **Open question — do not assume the kept value is the right one.** Keeping the first read was chosen after a re-grab replaced a dashboard-confirmed R$3,092 hour with R$747 seven minutes later. Wider evidence complicates that: the largest divergences run the other way (`ItemMonetizationRevenue` 353 → 21,835), which looks like back-fill, and against the dashboard's own export our kept value is sometimes the low one. For any metric labelled *Realtime*, treat a revision row as "this hour is disputed", check the dashboard, and do not build a conclusion on it either way.

| Kind | Metric | Series | Point | Detail | Observed |
|---|---|---|---|---|---|
| revision | ItemMonetizationRevenue | ProductType: GamePass | 2026-08-26T13:00:00Z | settled point re-served as 2674 (captured 2026-08-26T14:29:18.626Z); kept 2455 (captured 2026-08-26T14:06:31.094Z) | 2026-08-26T14:32Z |
| revision | ItemMonetizationRevenue | ProductType: DevProduct | 2026-08-26T13:00:00Z | settled point re-served as 3157 (captured 2026-08-26T14:29:18.626Z); kept 2513 (captured 2026-08-26T14:06:31.094Z) | 2026-08-26T14:32Z |
| revision | ItemMonetizationRevenue | Total | 2026-08-26T13:00:00Z | settled point re-served as 5831 (captured 2026-08-26T14:29:21.294Z); kept 4968 (captured 2026-08-26T14:06:33.717Z) | 2026-08-26T14:32Z |
| revision | ClientCpuTimeAvg | Place=74542317333958 | 2026-08-23T00:00:00Z | settled point re-served as 6.923684233755008 (captured 2026-08-26T14:31:29.552Z); kept 6.846074526947299 (captured 2026-08-26T14:16:13.388Z) | 2026-08-26T14:32Z |
| revision | ClientCpuTimeAvg | Place=74542317333958 | 2026-08-24T00:00:00Z | settled point re-served as 7.653538352991665 (captured 2026-08-26T14:31:29.552Z); kept 7.11402140142303 (captured 2026-08-26T14:16:13.388Z) | 2026-08-26T14:32Z |
| revision | ClientCpuTimeAvg | ClientCpuTimeCategory: Animation · Place=74542317333958 | 2026-08-23T00:00:00Z | settled point re-served as 0.9840007638548495 (captured 2026-08-26T14:31:51.032Z); kept 0.906391057047143 (captured 2026-08-26T14:16:51.895Z) | 2026-08-26T14:32Z |
| revision | ClientCpuTimeAvg | ClientCpuTimeCategory: Animation · Place=74542317333958 | 2026-08-24T00:00:00Z | settled point re-served as 1.4312985838314651 (captured 2026-08-26T14:31:51.032Z); kept 0.891781632262831 (captured 2026-08-26T14:16:51.895Z) | 2026-08-26T14:32Z |
| revision | SessionDurationSecondsAvg | Platform: Console · Place=74542317333958 | 2026-08-23T00:00:00Z | settled point re-served as 295.47939807676 (captured 2026-08-26T14:32:05.882Z); kept 303.2650429097411 (captured 2026-08-26T14:17:20.540Z) | 2026-08-26T14:32Z |
| revision | SessionDurationSecondsAvg | Platform: Console · Place=74542317333958 | 2026-08-24T00:00:00Z | settled point re-served as 324.3244540763536 (captured 2026-08-26T14:32:05.882Z); kept 337.8102069387788 (captured 2026-08-26T14:17:20.540Z) | 2026-08-26T14:32Z |
| revision | SessionDurationSecondsAvg | Platform: Console · Place=74542317333958 | 2026-08-25T00:00:00Z | settled point re-served as 275.13586343553226 (captured 2026-08-26T14:32:05.882Z); kept 286.1157614159291 (captured 2026-08-26T14:17:20.540Z) | 2026-08-26T14:32Z |
| revision | SessionDurationSecondsAvg | Platform: TV · Place=74542317333958 | 2026-08-23T00:00:00Z | settled point re-served as 739.6678832116789 (captured 2026-08-26T14:32:05.882Z); kept 764.2865362485616 (captured 2026-08-26T14:17:20.540Z) | 2026-08-26T14:32Z |
| revision | SessionDurationSecondsAvg | Platform: VR · Place=74542317333958 | 2026-08-25T00:00:00Z | settled point re-served as 446.0862068965482 (captured 2026-08-26T14:32:05.882Z); kept 459.55882352940586 (captured 2026-08-26T14:17:20.540Z) | 2026-08-26T14:32Z |
