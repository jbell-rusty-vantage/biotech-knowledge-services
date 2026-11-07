# Fixture filing-channels-niagen-10k — source

- url: https://www.sec.gov/Archives/edgar/data/1386570/000138657026000013/cdxc-20251231.htm
- title: Niagen Bioscience, Inc. Form 10-K for the fiscal year ended December 31, 2025 (accession 0001386570-26-000013, filed 2026-03-04)
- retrieved: 2026-10-08
- snapshot digest: sha256:0f823d4988919baf6ee581216ac10a0537edfffb5a0e2c5bdc1d9eb32e6483e6
- kind: unstructured-to-entity
- tool: tool:sec-edgar (curl, User-Agent from EDGAR_IDENTITY read in-shell, never printed); filing date from data.sec.gov/submissions/CIK0001386570.json
- research candidate: FC-6 (directive 3.8 path)

## Capture and text version

| item | value |
| --- | --- |
| raw snapshot (inline XBRL HTML, 2,046,533 bytes) | sha256:0f823d4988919baf6ee581216ac10a0537edfffb5a0e2c5bdc1d9eb32e6483e6, retrievedAt 2026-10-08T20:58:06Z; fresh re-fetch in this stage returned identical bytes |
| canonical projection = text version the locators and chunks use | sha256:454b17b606e9b5a7349b841b14e1f038956a7d5031ff56eeb9715dc2dd490aa0 (367,874 bytes) |
| normalization `edgar-text/v5` | replace every tag `<…>` by one space, `html.unescape`, collapse Python-regex `\s+` to one space, no strip; offsets in Unicode code points. Re-derived from the re-fetched HTML in this stage and reproduced the digest exactly (scratch `ft/D6-norm10k.py`; four other candidate rules did not) |

## Description

The unstructured-to-entity fixture (00-DIRECTIVE 3.8). Question: "Through which channels does Niagen Bioscience sell Tru Niagen in the US, who makes it, and how does that compare with what we observe on storefronts?" Three D9 chunks of the text version (Item 1 distribution, manufacturing and raw materials, product risk factors; fixture chunker `d6-fixture-section-window/v1`) are reached through derived MENTIONS (surface match on "Tru Niagen", "TruNiagen.com", "Amazon", "iHerb", "W.R. Grace", "NRC") or, in production, the D9 chunk vector index (not executed here: no embedding run in this stage). Each chunk COVERS_LOCATOR the TEXT_QUOTE locators of the assertions made from it: the filer states it sells Tru Niagen in the US through TruNiagen.com, third-party marketplaces including Amazon, specialty retailers and authorized healthcare-practitioner resellers, partners with iHerb for international reach, has finished products made by unnamed US contract manufacturers, and relies on W.R. Grace as single NRC supplier. Each locator resolves to the text version and, through the recorded normalization, to the raw snapshot bytes; the verifier re-selects the same span by exact quote + prefix/suffix and checks the code-point offsets (done in this stage on a fresh re-fetch: identical bytes, identical offsets). Q-D6-20 then compares these stated channels with the observed offers in `offer-roles-price-kinds-truniagen` and the iHerb listings in `retailer-reformulation-claim-iherb`.

## Relationships exercised

BRANDED_AS (Tru Niagen® → D7 Brand, asserter the filer). Predicate-only: SOLD_THROUGH_CHANNEL ×5 (two entity objects, two literal channel kinds, iHerb), AUTHORIZES_CHANNEL, MANUFACTURER_STATEMENT (unnamed manufacturers), SUPPLIES_MATERIAL (D1/D7 predicate, exclusivity=SOLE) (D7/D1). D9 seam: Chunk, MENTIONS (derived), COVERS_LOCATOR (derived).

## Files

`locators.yaml` (7 TEXT_QUOTE locators on the text version), `assertions.yaml` (assertions, chunks with MENTIONS offsets, and the question → chunk → assertion → locator → snapshot `trace`), `intent.json` (validated; chunks and MENTIONS are D9 projection output, not intent proposals), `questions.md`.
