# Fixture prepared-food-bigmac-mcdonalds — source

- url: https://www.mcdonalds.com/us/en-us/product/big-mac.html
- title: McDonald's USA: Big Mac® product page (nutrition, ingredients, allergens)
- retrieved: 2026-10-08
- snapshot digest: sha256:3abf681e36d3e81ce490c69d85a230eb7cf7d8509d6a9919b6ee68e00a7103c9
- kind: other
- tool: tool:firecrawl-scrape (`--wait-for 3000`, markdown); tool:economist-bigmac-data (curl, GitHub raw)
- research candidate: FC-4 (prepared food from a named organization; seam D12, D7)

## Captures (retrieved 2026-10-08)

| source key | url | title | retrievedAt (UTC) | snapshot digest | fresh re-fetch |
| --- | --- | --- | --- | --- | --- |
| mcd-bigmac | https://www.mcdonalds.com/us/en-us/product/big-mac.html | McDonald's USA Big Mac® page | 2026-10-08T20:52:52Z | sha256:3abf681e36d3e81ce490c69d85a230eb7cf7d8509d6a9919b6ee68e00a7103c9 | identical bytes |
| econ-csv | https://raw.githubusercontent.com/TheEconomist/big-mac-data/master/source-data/big-mac-source-data-v2.csv | The Economist big-mac-data, source-data/big-mac-source-data-v2.csv (CC BY 4.0) | 2026-10-08T20:53:09Z | sha256:8d7f1b6019ffdc9c705ab4530d416ae5106863aa2b5dc15c1f0820680a82c322 | identical bytes |
| econ-readme | https://raw.githubusercontent.com/TheEconomist/big-mac-data/master/README.md | The Economist big-mac-data README (methodology changes) | 2026-10-08T20:53:14Z | sha256:f7ff5ddb2e4878c00089586df4668c7120b38d0630424ce8482234873162f1c0 | identical bytes |

## Description

A prepared food from a named organization: McDonald's USA's own page for the Big Mac® declares, per served item, 580 Cal, sodium 1060 mg (46 % DV), saturated fat 11 g (56 % DV), added sugars 5 g (10 % DV), an ingredient statement per component (bun, beef patty, lettuce, Big Mac Sauce, cheese, pickle slices, onions), per-component allergen lines ("Contains: Wheat, Sesame." / "Contains: Egg, Soy, Wheat." / "Contains: Milk, Soy."), a preparation note on the patty ("Prepared With Grill Seasoning (salt, Black Pepper)."), and an as-of statement ("This information is correct as of January 2022, unless stated otherwise.") with the warning that "product formulations change periodically". The page shows no price. Price over time comes from a third party: The Economist's Big Mac index source data give the US price at 5.04 (2022-01-01), 5.15 (2022-07-01), 5.36 (2023-01-01) and 6.22 USD (2026-07-01); its README states that in July 2022 the US price switched from a four-city average to a McDonald's-provided price, so the series has a method change between the first and second point. Modeled as Product (PREPARED_FOOD) → US variant → SERVED_PORTION package → MENU_DECLARATION label version (validObservedAt January 2022; the intent carries it as statedAsOf), SUB_COMPONENT / SOURCE_INGREDIENT lines to D12 FoodItems and NUTRIENT / ENERGY lines to D1 Constituents with %DV, and MARKET_REFERENCE_PRICE assertions by The Economist whose subject is the US served-portion Package (no Offer: an index price has no seller; adversarial-review stage). The as-of sentence is page-wide boilerplate closing the site's nutrition paragraph, so d02 carries it with extractionConfidence 0.5 and a scope qualifier. The seam to D12 (`HAS_REFERENCE_FOOD`, D12-owned) and the brand owner (D7 `OWNS_BRAND`) are not asserted here.

## Relationships exercised

BRANDED_AS (Product → D7 Brand McDonald's, asserter McDonald's USA) — the register's fixture for BRANDED_AS; HAS_VARIANT, HAS_PACKAGE (SERVED_PORTION), HAS_LABEL_VERSION (MENU_DECLARATION), DECLARES_COMPONENT ×14 (asserted lines ddc01–ddc14 by McDonald's USA; D12 FoodItem and D1 Constituent targets, %DV, nesting via parentOrderIndex, per-component allergen statements), LISTING_FOR. Predicate-only: PREPARED_WITH, MARKET_REFERENCE_PRICE ×4 (subject the Package), PRICE_SERIES_METHOD_CHANGE, PRICE_SCOPE_STATEMENT. TABLE selectors on the CSV rows.

## Files

`locators.yaml` (30), `assertions.yaml`, `intent.json` (validated), `questions.md`.
