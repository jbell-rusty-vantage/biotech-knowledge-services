# Fixture — FDA survey data on acrylamide in food (harm formed by a preparation, at brand level)

- url: https://www.fda.gov/food/process-contaminants-food/survey-data-acrylamide-food
- title: FDA — Survey Data on Acrylamide in Food (table "Data through October 7, 2004")
- retrieved: 2026-10-08
- snapshot digest: sha256:b792fc7ab29390b0eff419cc7d1abef1936796f68e48d9fd1e006a5259fae318
- kind: harm
- origin HTML sibling (adversarial review): same URL by curl, retrieved 2026-10-09T01:50:03Z, RAW_BYTES sha256:562593dba2738cbb784302e5296199d0d417c030112df9df1265b6163119b584 (170,927 bytes); every locator re-found in its text (html-text/v1) or its table cells (`originHtml` in locators.yaml)
- tool: Firecrawl CLI 1.23.1 `scrape <url> --only-main-content` (research capture 2026-10-08T20:54:05Z, scrape id 01a11d4b-6a80-774f-90fd-f59beab4cd84; markdown output, contentHashBasis NORMALIZED_TEXT). Re-scraped with the same options in the adversarial review (2026-10-09T02:10:59Z, scrape id 01a11e6d-8c5e-77fb-b842-207e42673e24): byte-identical. Fixture-stage re-scrape 2026-10-08T21:38:15Z with `--max-age 0` and without `--only-main-content` (scrape id 01a11d73-da66-75f8-bdfe-1653aa203794): different bytes (sha256:8ac1f7b3c99bfe4a618ac4aea22f21b2c5f21f57d1dd4cbc9b6a710c7a31ebb1, navigation included); every quote of this fixture re-found verbatim at shifted offsets (recorded per locator).

## Companion sources (same fixture)

| url | title | retrieved | snapshot digest | tool |
| --- | --- | --- | --- | --- |
| https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/acrylamide/property/IUPACName,InChIKey,MolecularFormula/JSON | PubChem PUG REST — acrylamide (CID 6579) | 2026-10-08 | sha256:e84a12c01a391d58bb0be9d5bfc0ec44f2a97bba5c2269b5cc12fab1e16ccaba | curl |
| ../mcdonalds-fries-prepared-food | the Product and its HAS_REFERENCE_FOOD episode (reused, not re-asserted) | 2026-10-08 | see that fixture | — |

## What it demonstrates

Harm that a preparation forms, reachable from a branded prepared food. FDA states that acrylamide forms during frying, roasting and baking of plant-based foods including potato (`FORMS_DURING_PREPARATION`, predicate-only, D1 substance → a SOURCE_DEFINED FoodCategory, preparation methods as qualifiers). Its survey table lists "McDonald's French Fries" at 428 ppb under the group "French Fries and Other Potato Foods, Restaurant and Take-Out"; the level is a D8 `QualityResult` (MEASURED, 428 µg/kg, reporting limit 20 ppb, restaurant/take-out sample) with `RESULT_FOR` the same D6 Product as the prepared-food fixture, so the harm question reaches the reference food FDC 170721 through the existing `HAS_REFERENCE_FOOD` episode. The FDA also states the hazard that makes this a harm case — "high levels of acrylamide caused cancer in laboratory animals", with its own caveat that those levels "were much greater than those found in human food" (`CAUSES_ADVERSE_EFFECT`, D5 predicate, `ft-d12-acr-05`). Valid time is the reporting window of the incremental table that first lists the row (previous cutoff 2003-10-01, INFERRED → data through 2004-10-07), not the retrieval date; the table-group label is printed only on the first row of the group, so the row locator carries it explicitly. The source's own caveat ("data are not designed to be used to inform consumer food choices") rides as QUALIFIES evidence, and the fixture refuses to write any `WORSENS_TARGET` or a `FOOD_CONTAINS` on the reference food from this page.

## Relationships exercised

- HAS_REFERENCE_FOOD — reused: `hu:assertion:ft-d12-mcd-01` (Product → FDC 170721)
- IN_FOOD_CATEGORY — `hu:assertion:ft-d12-acr-02` (Product → FDA survey group, source-stated)
- predicate-only FORMS_DURING_PREPARATION — `ft-d12-acr-01`
- seam D8 RESULT_FOR / MEASURES_ANALYTE / ISSUED_BY (QualityResult 428 µg/kg) — `ft-d12-acr-03`; predicate-only CAUSES_ADVERSE_EFFECT (D5) — `ft-d12-acr-05`; kernel RESOLUTION Assessment — `hu:assessment:ft-d12-acr-04`
