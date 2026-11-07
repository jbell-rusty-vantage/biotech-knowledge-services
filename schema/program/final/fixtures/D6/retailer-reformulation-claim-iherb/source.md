# Fixture retailer-reformulation-claim-iherb — source

- url: https://www.iherb.com/pr/tru-niagen-nicotinamide-riboside-chloride-300-mg-30-vegetarian-capsules/120467
- title: iHerb: Tru Niagen, Nicotinamide Riboside Chloride, 300 mg, 30 Vegetarian Capsules (Discontinued Item)
- retrieved: 2026-10-08
- snapshot digest: sha256:d728d8d78184cd0ab1ffaf47b812146fc8af7e5363c5c6867022f584c878d577
- kind: disconfirmation
- tool: tool:firecrawl-scrape (Firecrawl CLI 1.23.1 `scrape --country US`, markdown)
- research candidate: FC-2

## Captures (retrieved 2026-10-08)

| source key | url | title | retrievedAt (UTC) | snapshot digest | fresh re-fetch |
| --- | --- | --- | --- | --- | --- |
| iherb-120467 | https://www.iherb.com/pr/tru-niagen-nicotinamide-riboside-chloride-300-mg-30-vegetarian-capsules/120467 | iHerb item 120467 (Discontinued Item) | 2026-10-08T21:00:00Z | sha256:d728d8d78184cd0ab1ffaf47b812146fc8af7e5363c5c6867022f584c878d577 | rendering changed (sha256:5be5f9b0…, 105 KB vs 16 KB), every quote re-found |
| iherb-162274 | https://www.iherb.com/pr/tru-niagen-age-better-300-mg-30-vegetarian-capsules/162274 | iHerb item 162274, Tru Niagen, Age Better®, 300 mg, 30 Vegetarian Capsules | 2026-10-08T21:00:18Z | sha256:c06ff62ca89b9b85155d0310af27b6bd48b741cffe75d6e5ba58bc9556ea7712 | rendering changed (sha256:702a1997…), every quote re-found |
| amz-B07TK5K5TQ | https://www.amazon.com/dp/B07TK5K5TQ | Amazon listing (UPC 850015311857, sold by TRU NIAGEN); same capture as offer-roles-price-kinds-truniagen | 2026-10-08T20:55:15Z | sha256:96bb5fe165d907767bed4335e005afa358b1c90f9554b5092d1f67b302916183 | rendering changed (sha256:70a1d36c…), every quote re-found |
| truniagen-300mg-page | https://www.truniagen.com/products/tru-niagen-300mg | brand product page with Supplement Facts (Firecrawl MCP, onlyMainContent, maxAge 0; the registered mark renders as U+FFFD) | 2026-10-09T01:51:31Z | sha256:5902699d3f9106ddb91104c84dfef129ba42b3a00cf77bffc35120731634f490 | fresh capture of this stage |

The DSLD label versions of fixture `label-versions-truniagen-dsld` (295562 / 323170) carry the OLD UPC 850015311116 and are context for the predecessor package only; the new GTIN's composition evidence is the brand page and the Amazon listing above.

## Description

iHerb marks item 120467 (UPC 850015311116, product code TNN-31111, first available 05/2023) as "Discontinued Item" and shows a block "New formulation available now" linking to item 162274 (UPC 850015311857, TNN-31185, first available 09/2026). Both pages print the same Supplement Facts row (NIAGEN® (nicotinamide riboside chloride) 300 mg per one-capsule serving) and the same other ingredients, and the two DSLD label versions have equal compositionDigest. The retailer's reformulation statement is recorded as a claim occurrence (asserter iHerb) and adjudicated NOT_SUPPORTED (disconfirmation) against composition evidence for the new GTIN that is not iHerb's own copy: the brand's product page Supplement Facts (captured in this stage) and the brand-sold Amazon listing with UPC 850015311857. The DSLD label versions carry the old UPC and serve only as context for the predecessor package; what the evidence supports is a package-only change (new GTIN, new item code, larger carton, "Age Better" title), recorded as `D6.change-kind` PACKAGE_ONLY. Both listings resolve to the same 30-count Package: 120467's LISTING_FOR episode is closed (end inferred from the successor's first-available month, flagged INFERRED), 162274's is open; the GTIN change is two identifier episodes on one Package, not a new Package. A second claim on the page ("tested as safe up to 2,000mg/day") is captured for the D5/K evidence loop.

## Relationships exercised

LISTING_FOR ×2 (closed and open episodes), HAS_OFFER ×2. Predicate-only: OFFER_AVAILABILITY, OFFER_PRICE_ONE_TIME, RETAILER_DISCONTINUED, SUCCEEDED_BY, RETAILER_REFORMULATION_STATEMENT (claim), PRODUCT_SAFETY_STATEMENT (claim). Identifiers: GTIN ×2 on one Package, iHerb item codes. Kernel: Adjudication adj01 (SUPPORT, NOT_SUPPORTED; the claim-match verdict, no separate Assessment), Assessment as10 (PACKAGE_ONLY).

## Files

`locators.yaml` (30), `assertions.yaml`, `intent.json` (validated), `questions.md`.
