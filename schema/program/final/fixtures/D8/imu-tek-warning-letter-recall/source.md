# Fixture — Imu-Tek: inspection → Form 483 → recall → warning letter (unstructured-to-entity; harm)

- url: https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/imu-tek-animal-health-incorporated-724610-06052026
- title: Imu-Tek Animal Health, Incorporated - 724610 - 06/05/2026 (FDA warning letter, MARCS-CMS 724610)
- retrieved: 2026-10-08
- snapshot digest: sha256:148c70a77b2491854cebba1d6e61348a432d21b251ad431ad9683253cca6c9bb (raw HTML bytes, 48,994 B, fetched 2026-10-08T21:38:07Z; byte-identical to the research capture)
- kind: unstructured-to-entity
- also: harm (enforcement chain; recalled lot of a dietary supplement)
- tool: curl 8.x with a browser User-Agent (fda.gov pages); text by scratch `tools/h2t.py` v2 (HTML comments stripped) + `nfc-ws-collapse/1` normalization; locators computed and re-selected by scratch `tools/fxlib.py` / `tools/verify.py`
- second source: https://api.fda.gov/food/enforcement.json?search=recall_number:%22H-0483-2026%22 · openFDA food enforcement record H-0483-2026 · retrieved 2026-10-08 · sha256:0091f10f5766ba18e51dba44dd263d61e09e1a5c0832f54230e9c898633f30b2 (raw JSON, 1,815 B; `meta.last_updated` 2026-09-30) · tool: curl (openFDA REST, no key)
- candidate: FC-2 in `../../../../packets/D8/_notes/fixture-candidates.md`

## What the fixture shows

An FDA warning letter is free text: the letter names the firm, the products, the inspection window, the Form 483 and the firm's response, quotes the firm's website claims, and lists Part 111 CGMP findings. The fixture turns that text into D8 records — a `RegulatoryRecord` (WARNING_LETTER, family ENFORCEMENT) ISSUED_BY FDA, ADDRESSED_TO the firm and CONCERNS two products — and joins it to a structured openFDA recall record for the same firm (`RegulatoryRecord` RECALL H-0483-2026, Class II, firm-initiated 2025-11-25, terminated 2026-08-14) that CONCERNS a third product and its `Lot` 216 (LOT_OF that product, expiry 2027-04-16). It walks the directive 3.8 path for Q-D8-03 in `directive-3.8-walk.yaml`: question → chunks found by MENTIONS of the firm or by a fulltext query → the locators those chunks cover → the assertions citing them → the snapshot bytes, and every locator was re-selected from the bytes (23 of 23). The harm lesson is identity: the recall names "Imu-Tek Immuno-5 Colostrum Powder 7 oz" (UPC 7 38654 00033 5) while the letter names "Colostrum-5 Capsules" and "Colostrum-5 Powder" (also spelled "Colostrom-5"); they stay three products until a D6 EQUIVALENCE assessment says otherwise, so "is my lot recalled" (Q-D8-04) answers for lot 216 of Immuno-5 only.

## Files

- `locators.yaml` — 2 snapshots, 25 locators (13 TEXT_QUOTE on the letter, 12 JSON_POINTER on the recall record; loc-wl-drugrating and loc-wl-webreview added in the adversarial-review revision).
- `assertions.yaml` — 9 entities (incl. kernel Claim claim-c5), 17 assertions (9 typed edges: ISSUED_BY ×2, ADDRESSED_TO ×2, CONCERNS ×4, LOT_OF ×1; 6 literals; i12 claim occurrence retold by FDA; i17 RATES_CLAIM by FDA).
- `directive-3.8-walk.yaml` — chunks (stand-in for D9 `Chunk`), MENTIONS, fulltext ranking, chunk → locator → assertion → snapshot, the chain answer.
- `intent.json` — `biotech-knowledge-intent.v1`, zod-valid against `packages/contracts` (20 proposals).
- `questions.md` — Q-D8-02, Q-D8-03, Q-D8-04, Q-D8-16, CQ-MF-06.

## Adversarial-review recheck (2026-10-08)

Re-fetched the letter with curl and a browser User-Agent: raw bytes now hash to sha256:252af690a84b08255639d8e237cbe04d03af33262a0db8d38a6047530dfaee05 (page markup changed), while the normalized text extraction is identical to the captured one (17,831 characters), so every TEXT_QUOTE locator re-selects unchanged against the stored snapshot. The openFDA record H-0483-2026 re-fetched byte-identical (sha256:0091f10f…).
