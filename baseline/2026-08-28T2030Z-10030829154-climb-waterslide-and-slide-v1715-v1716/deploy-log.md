# Deploy log — Climb Waterslide and Slide (10030829154)

Reconstructed from `ErrorCount` broken down by `PlaceVersion` with `Place` as a
FILTER — Roblox's own key-authenticated second source for dating a ship.
`develop.roblox.com/v1/assets/<place>/saved-versions` returns **HTTP 401** without a
session cookie, so it was not available on this pass (checked, not assumed).

**Caveats.** A version that emitted zero errors is invisible to this method. A version
whose first point falls on the window start is LEFT-CENSORED — read it as "on or before".
Daily window starts 2026-08-01.

## Daily — 2026-08-01 → 2026-08-30 (exclusive)

| version | first seen | last seen | days live | errors |
|---|---|---|---|---|
| v1679 | 2026-08-07 | 2026-08-23 | 2 | 8 |
| v1683 | 2026-08-01 | 2026-08-11 | 7 | 212 |
| v1685 | 2026-08-01 | 2026-08-15 | 12 | 14 026 764 |
| v1691 | 2026-08-08 | 2026-08-25 | 11 | 7 285 929 |
| v1696 | 2026-08-14 | 2026-08-14 | 1 | 7 112 |
| v1698 | 2026-08-14 | 2026-08-27 | 11 | 10 286 098 |
| v1705 | 2026-08-21 | 2026-08-28 | 6 | 2 737 087 |
| v1706 | 2026-08-22 | 2026-08-23 | 2 | 1 234 951 |
| v1708 | 2026-08-23 | 2026-08-27 | 5 | 1 745 095 |
| v1711 | 2026-08-24 | 2026-08-29 | 6 | 6 579 190 |
| v1715 | 2026-08-28 | 2026-08-29 | 2 | 35 946 |
| v1716 | 2026-08-28 | 2026-08-29 | 2 | 1 010 814 |

## Half-hour — 2026-08-28 → now (dates the publish to the bucket)

| version | first bucket (UTC) | last bucket (UTC) | buckets | errors |
|---|---|---|---|---|
| v1705 | 2026-08-28 10:30 | 2026-08-28 10:30 | 1 | 110 |
| v1711 | 2026-08-28 00:00 | 2026-08-29 04:30 | 49 | 1 435 342 |
| v1715 | 2026-08-28 20:30 | 2026-08-29 11:00 | 4 | 35 946 |
| v1716 | 2026-08-28 21:00 | 2026-08-29 11:00 | 29 | 1 010 814 |

_Pulled 2026-08-29T11:15:34Z._
