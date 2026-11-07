# Fixture certification-listing-lot-scope — questions answered

Assertion ids (`k01` …) are in `assertions.yaml`; locators in `locators.yaml`.

| question | expected answer | rests on |
| --- | --- | --- |
| CQ-PF-03a (packet id CQ-PF-03; R-08) (what does a certification cover, under which programme, as of when) | (a) NSF Certified for Sport listing 1451522 (NSF): product Basis by Elysium Health and lots P043-01, M070-01, R212-01, observed 2026-10-08; certifier goal labels "Energy Enhancement, Pre-Workout, Post-Workout, Sleep Aid" kept verbatim. (b) NSF/ANSI 173 listing: Codeage LLC "Liposomal Nicotinamide Riboside+", Product ID "All" (all sizes), no lot list, "current as of" 2026-10-08 04:15 UTC. (c) Informed Sport (operator LGC, PROPOSED): Applied Nutrition Creatine Monohydrate Professional certified since 2022-08-05; batch H26246 (Unflavoured) covered from test date 2026-09-30 to batch expiry 2028-09-30. | k01–k05, k09, k10, k11–k13, k15 |
| Q-D8-08 (is lot L listed; test date and expiry; has it lapsed or dropped off) | H26246: listed, tested 2026-09-30, expires 2028-09-30. A24176: shown in a note as "tested but is not listed" (technical issue), tested 2024-07-17, expired 2026-06-30 → **not covered as of 2026-10-08** (episode closed by its stated expiry), even though the page still displays it. Lots that disappear before their expiry are the signal; disappearance at expiry is the certifier's stated rule ("Once a batch has expired, the test details are no longer displayed publicly"). | k13, k14, k16; `reobservation_protocol` |
| CQ-AX-19 (for my lot, what do measurements say) | The certifier pages state coverage, not measured values: Basis lots P043-01/M070-01/R212-01 are NSF Certified for Sport lots on 2026-10-08, with no per-lot result published. NSF/ANSI 173 lists no lots at all for Codeage's product. | k03–k05, k10 |

## Verification

`tools/verify.py` (scratch) re-selected 19 of 19 locators. Two captures on the same day show no lot drop-off yet; the drop-off variant is a protocol (re-capture → `edge.close` + successor episode), not a recorded event.
