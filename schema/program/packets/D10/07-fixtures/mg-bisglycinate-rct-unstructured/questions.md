# mg-bisglycinate-rct-unstructured: questions answered

Ids are from `../../02-questions.md`; patterns from `../../03-retrieval-patterns.md`. Record ids refer to `assertions.yaml`, locator refs to `locators.yaml`.

| question | expected answer from this fixture |
| --- | --- |
| Q-D10-17 (trace) | One trace row per covered assertion: chunk `hu:chunk:fx-d10-pmc12412596-s0003-s2002` (JATS `<sec id="s0003-s2002">`, found by BM25 keyword retrieval, rank 1 of 28, score 7.0378, executed and recorded in `retrieval.chunk.keywordRetrieval`; the vector-index and MENTIONS hops are described, not executed) → `a-isi-between` and `a-effect-size` → `loc-isi-fulltext` [52887, 53130) and `loc-effect-size` [53183, 53318), both inside the chunk span [52697, 56007) → snapshot sha256:85a35d77…343c → CAPTURE_FIDELITY verdict DIRECTLY_SUPPORTED, re-selection match = true (the re-fetch is byte-identical and the selector re-selects the same span). |
| Q-D10-01 (computed, partial) | For target sleep and the form magnesium bisglycinate the only located input is this trial: 250 mg/day elemental magnesium for 4 weeks, ISI change −3.9 vs −2.3 (p = 0.049), Cohen's d = 0.2 "small"; the cell carries the caveat that the capsules also delivered 1523 mg/day glycine. Label: "not published". |
| Q-D10-14 | Draft profile `hu:report:fx-d10-mg-profile-draft-1` (status PROPOSED): sections EVIDENCE_FOR (1 row, 3 sentences, 0 uncited) and OPEN_QUESTIONS (2 sentences, 1 uncited: "The design does not separate a magnesium effect from a glycine effect."); report citation completeness 0.8; missingFactKeys objective-sleep-measure, glycine-co-delivery-control. |
| CQ-AX-01 | Per sentence of `composed-body.txt`: sentence 1 → `a-isi-between` → `loc-isi-fulltext`/`loc-isi-abstract` → sha256:85a35d77… / sha256:e1afe765… → DIRECTLY_SUPPORTED; sentence 2 → `a-effect-size` → `loc-effect-size` → DIRECTLY_SUPPORTED; sentence 3 → `a-dose-glycine` → `loc-dose` (no adjudication recorded); sentence 4 → `a-limitation` → `loc-limitation`; sentence 5 → none (flagged uncited). |
| Q-D10-18 | `s-fidelity-design-label`: RETELLING_FIDELITY, subkind D10.fidelity.design-label, verdict CONTRADICTED: MEDLINE publication type "Case Reports" (`loc-pubtype-case-reports`) vs the article title "A Randomized, Placebo-Controlled Trial" (`loc-design-title`). |
| CQ-RC-03 | Missing facts that could change a form ranking: objective sleep measure (`a-limitation`), glycine co-delivery control (`a-dose-glycine`). |
| CQ-EV-02 | `a-isi-between`, `a-effect-size`: source assertions (asserted by the authors); `s-fidelity-design-label`: BellLabs assessment; the chunk and its MENTIONS / COVERS_LOCATOR edges: derived retrieval projections (never evidence); `r-mg-profile` items: published-artifact rows (draft). |

Relationship types exercised (05-relationship-register.yaml): HAS_ITEM (Report → 3 items), ASSESSES (row → magnesium bisglycinate, target:sleep), DERIVED_FROM (ReportItem → Assertion).
