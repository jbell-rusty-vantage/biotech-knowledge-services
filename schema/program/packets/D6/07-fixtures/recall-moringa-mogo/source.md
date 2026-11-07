# Fixture recall-moringa-mogo — source

- url: https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/mogo-moringa-llc-announces-voluntary-recall-select-lots-moringa-capsules-due-possible-salmonella
- title: FDA: Mogo Moringa LLC Announces Voluntary Recall of Select Lots of Moringa Capsules Due to Possible Salmonella Contamination
- retrieved: 2026-10-08
- snapshot digest: sha256:12133742feb0720ad19cfbb89935a1b1b726e1cc60a02643003585ff510a8d02
- kind: harm
- tool: tool:firecrawl-scrape (FDA pages, Amazon), tool:openfda-enforcement (curl -g), tool:shopify-storefront-json (mogomoringa.com), tool:firecrawl-search (listing discovery)
- research candidate: FC-5 (harm + disconfirmation)

## Captures (retrieved 2026-10-08)

| source key | url | title | retrievedAt (UTC) | snapshot digest | fresh re-fetch |
| --- | --- | --- | --- | --- | --- |
| fda-mogo-recall | (url above) | FDA-posted company announcement, 2026-05-25 / FDA publish 2026-05-26 | 2026-10-08T20:54:10Z | sha256:12133742feb0720ad19cfbb89935a1b1b726e1cc60a02643003585ff510a8d02 | identical bytes |
| fda-mogo-outbreak | https://www.fda.gov/food/outbreaks-foodborne-illness/outbreak-investigation-salmonella-moringa-leaf-powder-may-2026 | FDA: Outbreak Investigation of Salmonella: Moringa Leaf Powder (May 2026) | 2026-10-08T20:54:19Z | sha256:48dfb0bfed9d8adbad3a4cca1953ef5a728a8109410f6d9a75e269836e45c9de | identical bytes |
| openfda-H-1128-2026 | https://api.fda.gov/food/enforcement.json?search=recall_number:%22H-1128-2026%22 | openFDA food enforcement report H-1128-2026 | 2026-10-08T20:53:54Z | sha256:98773668603a9aeacab65a07313a6fe681d1b4703496b120015c71552f6a0802 | identical bytes |
| mogo-store | https://www.mogomoringa.com/products.json?limit=250 | mogomoringa.com Shopify products.json (empty catalog) | 2026-10-08T21:46:16Z | sha256:86d8b086af0fc30d06856e218fcfdb6b803f91b45f50b1b753d8deac627fc054 | fresh capture of this stage |
| amz-B084FRXSTX | https://www.amazon.com/dp/B084FRXSTX | Amazon: MOGO Fresh Moringa Powder 1 Lb (found with `firecrawl search`) | 2026-10-08T21:46:37Z | sha256:c7403a307b85f55c1a8da2c41f263ba76a413584dc76f4925c5b066da9569f7d | fresh capture of this stage |

## Description

Harm case. MOGO Moringa LLC recalled two lots (15525AA exp 6/2027, 00926AA exp 1/2028) of MOGO Pure Moringa Oleifera capsules (180 capsules, 350 mg per capsule, "MORINGA POWDER 1050 mg" on the supplement facts as transcribed by FDA) for Salmonella Typhimurium; openFDA classifies it Class I (23,186 bottles, recall initiated 2026-05-24, status "Ongoing"). The FDA/CDC outbreak advisory reports 34 illnesses and 11 hospitalizations, open containers positive for the outbreak strain in Washington, Tennessee and Florida (Florida's also for one other Salmonella strain), moringa leaf powder traced to India, and the outbreak declared over on 2026-07-17. Two company statements are tested against the agency record: (1) "sold online through authorized channels" / "does not authorize any third‑party sellers" versus FDA's "Sold at online stores including Amazon, eBay, and mogomoringa.com." and the enforcement report's "Amazon, Ebay, Etsy" — adjudicated MIXED_OR_CONFLICTING (a MOGO brand store exists on Amazon, so that channel may be the firm's own); (2) "no Salmonella was detected" in retained samples — adjudicated UNVERIFIABLE literally, while the safety implication is contradicted by the open-container positives in three states (SAFETY_SIGNAL Assessment as50, conclusionCode CONTAMINATION_CONFIRMED; no D5 target is named, so no effectDirection). Commerce follow-up done in this stage: the brand's Shopify store now returns an empty catalog, and the only MOGO listing found on Amazon (B084FRXSTX) is a different product (1 lb powder, "Currently unavailable.") — out of recall scope but declaring the same material (Q-D6-21). Data-quality findings kept verbatim: "from 14 states" versus 22 state codes on the same page; the enforcement record misspells the firm ("MOGO MIRINGA LLC") and domain ("mogomiranga.com"), staged as mentions. No seller of record could be asserted for B084FRXSTX (no offer displayed); SELLER_OF_RECORD is exercised in offer-roles-price-kinds-truniagen.

## Relationships exercised

HAS_VARIANT ×2, HAS_PACKAGE ×2, HAS_LABEL_VERSION (label as transcribed by FDA), DECLARES_COMPONENT (moringa leaf powder 1050 mg → D1 material), NAMES_RESPONSIBLE_PARTY ("Marketed by"), BRANDED_AS ×2, LISTING_FOR, HAS_OFFER. Predicate-only: SOLD_THROUGH_CHANNEL ×4 (asserter FDA) vs AUTHORIZES_CHANNEL ×2 (asserter the firm, claims), RETAINED_SAMPLE_TEST_RESULT (claim), SAMPLE_POSITIVE_OUTBREAK_STRAIN ×3 (Washington, Tennessee, Florida; provisional name requested from D8), OFFER_AVAILABILITY, MANUFACTURES, SOURCED_FROM_COUNTRY (provisional name requested from D1/D8), STOREFRONT_CATALOG_ITEM_COUNT. Kernel: Adjudications adj50, adj51; Assessments as50 (SAFETY_SIGNAL, CONTAMINATION_CONFIRMED), as51 (D6.recall-scope NOT_IN_SCOPE), as52 (D6.authorized-channel UNKNOWN), as53 (source internal inconsistency). D8 seam nodes: RegulatoryRecord H-1128-2026, Lots.

## Files

`locators.yaml` (38), `assertions.yaml`, `intent.json` (validated), `questions.md`.
