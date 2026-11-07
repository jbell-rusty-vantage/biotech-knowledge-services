# Fixture — certification listings scoped to products, lots and batches; a batch that expired but is still shown

- url: https://sport.wetestyoutrust.com/node/1146294
- title: Creatine Monohydrate Professional — Informed Sport (Applied Nutrition)
- retrieved: 2026-10-08
- snapshot digest: sha256:fc0b2e6908d5f473cbae45ebe95254a39cb147c0b5d8fb2c543e9f08353e0d87 (Firecrawl markdown, 42,334 B, fetched 2026-10-08T21:38:41Z; NORMALIZED_TEXT basis — curl gets 403, no raw page bytes)
- kind: harm
- also: positive control (what a certification covers, by whom, as of when)
- tool: Firecrawl CLI 1.23.1 `scrape --max-age 0` (Informed Sport); curl 8.x (NSF pages); HTML text by scratch `tools/h2t.py` v2
- second source: https://www.nsfsport.com/certified-products/listing-detail.php?id=1451522 · Basis Elysium Health - NSF Certified for Sport · retrieved 2026-10-08 · sha256:d01cc35130aa60f8e8cfc8f83988faba76824d2a494745a2678b17020d24e18c (raw HTML, 19,800 B)
- third source: http://info.nsf.org/Certified/Dietary/Listings.asp?TradeName=nicotinamide& · NSF Product and Service Listings, NSF/ANSI 173 · retrieved 2026-10-08 · sha256:3d30b2873118bb5388116a3a0697c8a349d4015600b72d1dec1df94d2fe2068a (raw HTML, 10,051 B)
- candidate: FC-6 in `../../../../packets/D8/_notes/fixture-candidates.md`

## What the fixture shows

Three `CertificationListing`s with three coverage scopes, each ISSUED_BY its certifier and COVERS-ing with a bitemporal episode: the NSF Certified for Sport listing 1451522 covers the product Basis and three named lots (P043-01, M070-01, R212-01; coverage observed on 2026-10-08, start unknown); the NSF/ANSI 173 listing covers Codeage "Liposomal Nicotinamide Riboside+" with Product ID "All" and no lots (PRODUCT_ALL_SIZES, listing "current as of" 2026-10-08 04:15 UTC); the Informed Sport page covers Applied Nutrition Creatine Monohydrate Professional since 2022-08-05 and lists batches with test date and expiry — batch H26246 is covered [2026-09-30, 2028-09-30). Lots are LOT_OF the product, or of the Unflavoured variant when the certifier names the flavour. The harm case (Q-D8-08): the page states that batch rows disappear at batch expiry, yet it still shows batch A24176 ("tested but is not listed", expiry 2026-06-30) — its COVERS episode is closed by its own expiry, so a buyer holding A24176 on 2026-10-08 holds an expired batch whose certification row is no longer current. Correction to research: the NSF/ANSI 173 scope sentence quoted at research stage sits inside HTML comments and is not displayed (new finding E8); it is not used.

## Files

- `locators.yaml` — 3 snapshots, 19 locators (TEXT_QUOTE, TABLE).
- `assertions.yaml` — 15 entities, 16 assertions (ISSUED_BY ×3, COVERS ×8, LOT_OF ×5) and the re-observation protocol for lots dropping off.
- `intent.json` — zod-valid (24 proposals).
- `questions.md` — CQ-PF-03, Q-D8-08, CQ-AX-19.
