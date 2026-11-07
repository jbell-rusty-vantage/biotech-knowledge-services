# Fixture — Phenol-Explorer report on oils: what frying and microwaving do to olive-oil polyphenols

- url: http://phenol-explorer.eu/reports/45
- title: Phenol-Explorer 3.6 — Showing report on Oils
- retrieved: 2026-10-08
- snapshot digest: sha256:c58fa6bd84243ed83aea3e282489a66c830060c8138472be09e49f5794ac4f70
- kind: other
- preparation-changes-composition case
- origin HTML sibling (adversarial review): same URL by curl, retrieved 2026-10-09T01:50:05Z, RAW_BYTES (62,763 bytes; not byte-stable: each response carries a fresh csrf-token and New Relic timing); every locator re-found in its text (`originHtml` in locators.yaml)
- tool: Firecrawl CLI 1.23.1 `scrape <url> --only-main-content` (research capture 2026-10-08T20:56:40Z; markdown output, contentHashBasis NORMALIZED_TEXT; the site is http-only). Re-scraped with the same options in the adversarial review (scrape id 01a11e6d-707a-722c-8d9e-a2f1cb79592a): byte-identical. Fixture-stage re-scrape 2026-10-08T21:38:07Z with `--max-age 0` (scrape id 01a11d73-beaa-738c-824d-90b2a5502e2c): different bytes (sha256:ffcac09fa504782a3dca527ea3c0adfe0e381d0987312dbacc3fcac7a1d904d8, page chrome), every quote re-found verbatim at shifted offsets.

## Companion sources (same fixture)

| url | title | retrieved | snapshot digest | tool |
| --- | --- | --- | --- | --- |
| https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/hydroxytyrosol/property/IUPACName,InChIKey,MolecularFormula/JSON | PubChem PUG REST — hydroxytyrosol (CID 82755) | 2026-10-08 | sha256:0ccad5625a5e95cdd7860eb05db2afe8a5b2e47fef41a5bd362268b1f0585ad6 | curl |
| https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/tyrosol/property/IUPACName,InChIKey,MolecularFormula/JSON | PubChem PUG REST — tyrosol (CID 10393) | 2026-10-08 | sha256:a80fca94df54bf96fdd693eb107b0a1ece803c497149aa4d6f8e4b8bfc65cfbc | curl |

## What it demonstrates

Composition at a stated grade and what a preparation does to it, for compounds FDC does not carry. `FOOD_CONTAINS`: extra virgin olive oil (Phenol-Explorer) → hydroxytyrosol 0.8 mg/100 g and tyrosol 1.1 mg/100 g ("Tyrosol and hydroxytyrosol are present in minor amounts (1.1 and 0.8 mg/100 g respectively)."). `PREPARATION_CHANGES_CONTENT` (predicate-only): in virgin olive oil hydroxytyrosol is "reduced by 40-50% after 10 minutes frying at 180°C, and by about 90% after six frying operations"; in olive oil (the paragraph names no grade for them) "Tyrosol, p-HPEA-EDA and p-HPEA-EA however are much more stable. Their contents are only reduced by 20% during up to 12 frying operations."; microwave heating "provokes only minor losses of polyphenols". Preparation is a transformation with conditions (temperature, duration, cycles) and a percent change per compound on an Assertion — not a node per cooking method. The fixture corrects the model-stage stub: the content is printed for extra virgin oil and the frying loss for virgin oil, so they are two FoodItems and the "remaining after frying" number is not computed across them.

## Relationships exercised

- FOOD_CONTAINS — `hu:assertion:ft-d12-olive-01` (hydroxytyrosol 0.8 mg/100 g), `-02` (tyrosol 1.1 mg/100 g)
- predicate-only PREPARATION_CHANGES_CONTENT — `ft-d12-olive-03` (−40 to −50 %, 180 °C, 10 min), `-04` (≈ −90 %, 6 fryings), `-05` (olive oil, grade not stated: tyrosol −20 %, ≤ 12 fryings), `-06` (microwave, minor losses)
