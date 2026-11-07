# Fixture imu-tek-warning-letter-recall — questions answered

Assertion ids (`i01` …) are in `assertions.yaml`; locator ids (`loc-…`) in `locators.yaml`. Patterns are in `../../../../packets/D8/03-retrieval-patterns.md`.

| question | expected answer (from this fixture only) | rests on |
| --- | --- | --- |
| Q-D8-02 (which firms got warning letters or recalls, for what, when) | Imu-Tek Animal Health, Incorporated: warning letter CMS 724610 issued 2026-06-05 by FDA Human Foods Program — UNAPPROVED_NEW_DRUG_CLAIMS, MISBRANDING, CGMP_DIETARY_SUPPLEMENT — about Colostrum-5 Capsules and Colostrum-5 Powder; recall H-0483-2026 (Class II, UNDECLARED_ALLERGEN "Undeclared milk allergen") about Imu-Tek Immuno-5 Colostrum Powder 7 oz, lot 216. | i01–i08; node properties of `wl-724610`, `rc-h04832026` (evidence `loc-wl-cms`, `loc-wl-office`, `loc-rc-*`) |
| Q-D8-03 (enforcement chain with dates) — **directive 3.8 walk** | inspection 2025-10-06 → 2025-10-14; Form FDA 483 on 2025-10-14; firm response dated 2025-10-29; recall initiated by the firm 2025-11-25; FDA classification Class II 2026-02-05; warning letter 2026-06-05; recall terminated 2026-08-14. Each step cites one locator (`chain_answer` in `directive-3.8-walk.yaml`). | i10, i11, i15, i05, i16; `up-wl-724610` |
| Q-D8-04 (is my lot recalled, which class, still ongoing) | Lot "216" (expiry 2027-04-16) of Imu-Tek Immuno-5 Colostrum Powder 7 oz: yes, recall H-0483-2026, Class II, reason undeclared milk allergen, status TERMINATED since 2026-08-14 (as stated by openFDA, last updated 2026-09-30). A lot of "Colostrum-5 Powder": no recall record found in these sources as of 2026-10-08 — the two products are not merged (no EQUIVALENCE assessment). | i07, i08, i09, i16 |
| Q-D8-16 (claims a regulator treated as drug claims) | "ImuTek Colostrum-5 Capsules and Powder. . . . has been shown to kill bacteria and viral invaders. It can also help correct bowel dysfunction by stimulating tissue repair." — website claim quoted by FDA, rated by FDA as a drug claim: "The claims on your website establish that these products are drugs under section 201(g)(1)(B) of the Act"; US. | i12 (claim occurrence retold by FDA, basisKind CITED_FROM_PRIOR_WORK, OCCURRENCE_OF claim-c5), i17 (RATES_CLAIM by FDA, object the letter) |
| CQ-MF-06 (does a cGMP signal support a quality conclusion) | Negative signal for the firm's facility at 3541 E. Vine Dr., Fort Collins, CO (period of inspection 2025-10-06..14): no finished product specifications (21 CFR 111.70(e)); no master manufacturing record (111.205(a)); FDA "unable to evaluate the sufficiency" of the responses. Firm-level, because Facility is deferred (OQ-D8-03). | i13, i14; `facilityAddressVerbatim` |

## Directive 3.8 path, as exercised

1. Question Q-D8-03, subject "Imu-Tek".
2. Chunks: MENTIONS of `imutek` (exact-alias stand-in for D9 entity linking) → chunks 000, 002, 003, 006; fulltext "inspection 483 response" → chunks 004 (score 6), 005 (5), 002 (2). MENTIONS finds the header and claim chunks; fulltext finds the chain chunks — both are needed, and neither is evidence.
3. Chunk → locators by span overlap (D9 `COVERS_LOCATOR`, derived): chunk 004 → `loc-wl-inspection`, `loc-wl-483`; chunk 005 → `loc-wl-483`, `loc-wl-products`.
4. Locator → assertions: `loc-wl-inspection` → i10 and the `wl-724610` property upsert; `loc-wl-483` → i11; `loc-wl-products` → i03, i04.
5. Locator → snapshot `snap-wl` (sha256:148c70a7…, RAW_BYTES). The answer never cites a chunk.
5b. Recall steps (initiated 2025-11-25, classified 2026-02-05, terminated 2026-08-14) are not in any chunk: the walk reaches them by the entity hop `imutek` ← ADDRESSED_TO (i06) ← `rc-h04832026`, then its locators `loc-rc-*` on `snap-recall` (sha256:0091f10f…, JSON). Recorded as `step2b_entity_hop` (adversarial-review revision).
6. Verifier re-selection: scratch `tools/verify.py` re-extracted the text from the snapshot bytes, recomputed the text hash, and found every `exact` at its stored offsets; JSON_POINTER values re-read from the recall bytes. Result on 2026-10-08: 23 of 23 locators re-selected, 0 failures.

## Not answered here

The Form 483 itself and FDA's inspection classification (FDA Data Dashboard needs an account, OQ-D8-03); whether "Colostrum-5 Powder" and "Immuno-5 Colostrum Powder" are the same product (D6 EQUIVALENCE).
