# Fixture offer-roles-price-kinds-truniagen — source

- url: https://www.amazon.com/dp/B07TK5K5TQ
- title: Amazon.com: TRU NIAGEN NAD+ Supplement, Nicotinamide Riboside 300mg, 30 Daily Servings
- retrieved: 2026-10-08
- snapshot digest: sha256:96bb5fe165d907767bed4335e005afa358b1c90f9554b5092d1f67b302916183
- kind: other
- tool: tool:firecrawl-scrape (Amazon, camelcamelcamel), tool:shopify-storefront-json (truniagen.com `.js`), tool:wayback-cdx (archived JSON)
- research candidate: FC-3

## Captures (retrieved 2026-10-08)

| source key | url | title | retrievedAt (UTC) | observedAt | snapshot digest | fresh re-fetch |
| --- | --- | --- | --- | --- | --- | --- |
| amz-B07TK5K5TQ | https://www.amazon.com/dp/B07TK5K5TQ | Amazon detail page B07TK5K5TQ (Firecrawl markdown, `--country US`) | 2026-10-08T20:55:15Z | same | sha256:96bb5fe165d907767bed4335e005afa358b1c90f9554b5092d1f67b302916183 | rendering changed (sha256:70a1d36c…), every quote re-found, prices unchanged |
| shopify-tn-live | https://www.truniagen.com/products/tru-niagen-300mg.js | Tru Niagen® 300mg, Shopify product JSON | 2026-10-08T20:56:01Z | same | sha256:4c2f6a1c3c33b4e5f64353b733bb18fa1ec1249e62054b30c2cd8681255c090a | identical bytes |
| shopify-tn-wb20250520 | https://web.archive.org/web/20250520175310id_/https://www.truniagen.com/products/tru-niagen-300mg.js | same JSON as archived by the Internet Archive | 2026-10-08T20:56:48Z | 2025-05-20T17:53:10Z | sha256:d858af8b297bed42c22a86e387e5f92a57a3d6b4c529ca8593087127de71de10 | identical bytes |
| camel-B07TK5K5TQ | https://camelcamelcamel.com/product/B07TK5K5TQ | camelcamelcamel price history for B07TK5K5TQ | 2026-10-08T20:57:10Z | same | sha256:1adef616df132957171823b3fc95b782e678368815ac821d1978368573d551c4 | rendering changed (sha256:1157a6b6…), statistics rows identical |

## Description

One 30-count package seen through three channels. On Amazon the featured offers (one-time $49.00, $1.63 per count; Subscribe & Save $44.10, or $41.65 at the "15 percent savings" tier) are "Sold by: TRU NIAGEN" (seller account A1W0QC6JE0QLDF) and "Ships from: Amazon" (isAmazonFulfilled=1): seller of record and fulfiller are different parties. The brand's own Shopify store lists the same GTIN 850015311857 (variant "30", $49.00 = 4900 minor units), a "90" variant ($127.00, GTIN 850015311895) and a "180" kit (SKU CTNUS3006090010-KIT, GTIN 850064273106, $244.00). The Wayback copy of the same JSON (observed 2025-05-20) shows the same $49.00 price and the same GTIN, and subscription plan names that then read "Delivered every month and get 20% off future orders." while the platform price adjustment of that plan is 0 percent; the live plan name is "Delivered every month". The price tracker separates price types by seller role ("Amazon" = sold and shipped by Amazon itself: low $42.99 on Oct 31, 2024, high $49.00 on Jan 19, 2025, no current price; "3rd Party New": low $30.74 on Jan 14, 2022, high $49.00 on May 16, 2025, current $49.00 since Jun 27, 2026) and prints a malformed EAN (085001531185, fails the GS1 check digit). Prices are kernel typed-literal Assertions on Offers (OFFER_PRICE_<KIND>); the tracker's "3rd Party New" values aggregate over third-party sellers, so their subject is the MerchantListing with qualifier sellerClass=THIRD_PARTY_NEW, not an Offer (adversarial-review stage); live-page prices carry validFrom null (OBSERVATION_ONLY) and take their instant from the snapshot per 03 OBSERVED_AT; tracker prices carry the tracker's stated dates.

## Relationships exercised

HAS_OFFER ×7, SELLER_OF_RECORD ×3 (asserter Amazon for the marketplace offers, the brand for its store), LISTING_FOR ×4, HAS_PACKAGE (kit). Predicate-only: OFFER_PRICE_ONE_TIME / _PER_UNIT / _SUBSCRIPTION / _LIST / _TRACKER_LOW / _TRACKER_HIGH, OFFER_AVAILABILITY, OFFER_SUBSCRIPTION_TERMS (two captures, wording change), CONTAINS_PACKAGE (kit → 2 × 90-count, CALCULATED and PROPOSED because the store does not state kit contents). Identifiers: GTIN ×4, ASIN, SKU ×2, marketplace seller id (requested scheme). Kernel: Assessments as20 (RESOLUTION seller account → Niagen Bioscience, PROPOSED), as21 (identifier equivalence of the two 90-count GTINs, INSUFFICIENT_EVIDENCE), as22 (listing-to-package, ACCEPTED); Mentions m20 (malformed EAN), m21.

## Files

`locators.yaml` (36), `assertions.yaml`, `intent.json` (validated), `questions.md`.
