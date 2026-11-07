# Fixture — McDonald's USA medium fries (prepared food from a named organization) and its USDA reference-food records

- url: https://www.mcdonalds.com/us/en-us/product/medium-french-fries.html
- title: McDonald's USA — Medium French Fries (product page: nutrition, ingredients, allergens, as-of statement)
- retrieved: 2026-10-08
- snapshot digest: sha256:7a385ec59564b754f37c3abad5bae62f57765a7f67fa30acf946a9bd4a4a66e6
- kind: other
- prepared-food case (00-DIRECTIVE 3.2: a fast-food chain's product is a Product with a formulation and an organization behind it)
- tool: Firecrawl CLI 1.23.1 `scrape --only-main-content --wait-for 4000` (research capture 2026-10-08T20:52:46Z, scrape id 01a11d4a-2a6f-735f-ac63-042abb9b7011); fixture-stage re-scrape 2026-10-08T21:38:19Z with `--max-age 0` (scrape id 01a11d73-da32-7229-95b0-2db948972258) returned byte-identical markdown (same sha256). The digest is of Firecrawl's markdown rendering (contentHashBasis NORMALIZED_TEXT), not of the origin HTML.

## Companion sources (same fixture)

| url | title | retrieved | snapshot digest | tool |
| --- | --- | --- | --- | --- |
| https://api.nal.usda.gov/fdc/v1/food/170721 | FoodData Central SR Legacy 170721 "McDONALD'S, french fries" | 2026-10-08 | sha256:0d417572c814a9887b2b9eb18bb34fa0c583b70d2f54d5b4dd6553d5ec49eb8c | curl, FDC API v1, `api_key=DEMO_KEY` |
| https://api.nal.usda.gov/fdc/v1/food/170027 | FoodData Central SR Legacy 170027 "Potatoes, russet, flesh and skin, raw (…)" | 2026-10-08 | sha256:51e6625a1a3c27a19d558e88d9fa3f0e53483c9f519f17ef470db36bac23e738 | curl, FDC API v1 |
| https://api.nal.usda.gov/fdc/v1/food/170030 | FoodData Central SR Legacy 170030 "Potatoes, Russet, flesh and skin, baked" | 2026-10-08 | sha256:7dfd51b4217de64e97acf5290951b26745fa4e5a720f94cddc736bba05bfc69d | curl, FDC API v1 |
| https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id=10260459&retmode=xml | Monteiro CA et al. "Ultra-processed foods: what they are and how to identify them", Public Health Nutr 2019;22(5):936-941 (PMID 30744710, PMCID PMC10260459, DOI 10.1017/S1368980018003762) — abstract only in the XML | 2026-10-08 | sha256:df59db54aa7f464963ae54cc73b6693e113fd9f78f063e9094be2539728622d2 | curl, NCBI E-utilities |

Re-fetch for quote verification (fixture stage, 2026-10-08): the FDC API answered HTTP 429 `OVER_RATE_LIMIT` for `DEMO_KEY` (`X-Ratelimit-Limit: 10`, `Retry-After: 8561`); the values were re-verified on the keyless FDC web-app endpoint `https://fdc.nal.usda.gov/portal-data/external/{fdcId}` (different JSON shape; energy 323 NC, potassium 417/550 A with n, min, max, "medium serving" 117 g and the Fast Foods group all match). The E-utilities XML re-fetch was byte-identical. Raw captures stay in the session scratchpad `ft/D12/raw/` and `ft/D12/refetch/` (not committed).

## What it demonstrates

A menu item is a D6 `Product` (brand McDonald's, US variant, medium served portion, a MENU_DECLARATION `LabelVersion` "correct as of January 2022" with ingredients and allergens) that points at a D12 `FoodItem` through `HAS_REFERENCE_FOOD`: FDC 170721, a frozen SR Legacy record that names the chain and the item. The chain's 320 Cal per medium and FDC's 323 kcal per 100 g with a 117 g "medium serving" stay two dated statements with different asserters; the per-serving reference value (≈ 378 kcal) is computed at query time and never stored. Composition rows (`FOOD_CONTAINS`) carry amount, unit, basis, FDC derivation code (A analytical / NC calculated), n, min and max on the Assertion. Preparation is a record pair: baked russet (170030) is `VARIANT_OF` raw russet (170027), so "what does baking do to potassium" is 417 → 550 mg per 100 g, as two analytical rows, not a stored delta. Category membership is shown twice on one edge type: the source-stated FDC group "Fast Foods" (JSON pointer) and a BellLabs CALCULATED NOVA group 4 for the Product (rule `nova-markers/v1`, markers "Hydrogenated Soybean Oil" and "Hydrolyzed Wheat And Hydrolyzed Milk" against the Monteiro et al. 2019 marker list), DERIVED_FROM the D6 declaration assertion.

## Relationships exercised (05-relationship-register.yaml)

- HAS_REFERENCE_FOOD — `hu:assertion:ft-d12-mcd-01` (Product → FoodItem 170721)
- FOOD_CONTAINS — `ft-d12-mcd-02` (170721 → Energy 323 kcal/100 g, NC), `-03` (170027 → potassium 417 mg), `-04` (170030 → potassium 550 mg)
- VARIANT_OF — `ft-d12-mcd-05` (170030 baked → 170027 raw)
- IN_FOOD_CATEGORY — `ft-d12-mcd-06` (stated: 170721 → FDC "Fast Foods") and `ft-d12-mcd-08` (CALCULATED: Product → NOVA 4, derivationRule nova-markers/v1)
- predicate-only HAS_PORTION_WEIGHT — `ft-d12-mcd-09` (117 g, "medium serving")
- seam D6 HAS_LABEL_VERSION — `ft-d12-mcd-07` (input of the CALCULATED NOVA assertion)
