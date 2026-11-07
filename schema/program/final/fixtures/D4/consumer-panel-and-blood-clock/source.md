# Fixture consumer-panel-and-blood-clock - source

- kind: other
- url: https://www.labcorp.com/tests/005009/complete-blood-count-cbc-with-differential-reflex-to-peripheral-smear-review
- title: Labcorp test menu - Complete Blood Count (CBC) With Differential, Reflex to Peripheral Smear Review, test 005009
- retrieved: 2026-10-08
- snapshot digest: sha256:2ea60309595962fa9069b892815e99b7d66e7586335bcd981357462f8151f815
- tool: Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0 (requested /tests/005009/complete-blood-count-cbc-with-differential-platelet; the site canonicalizes to the URL above)
- candidate: new in the fixtures stage (InsideTracker InnerAge 2.0 blog + store page; Labcorp 005009 panel page captured 2026-10-08)

## Description

A blood-chemistry clock and a panel that can feed it. InsideTracker InnerAge 2.0 (versionLabel '2.0', vendor implementation) states that it analyzes 17 biomarkers for males and 13 for females and that its inputs may change; nine sampled inputs are recorded as REQUIRES_INPUT_METRIC (vendor Metrics, unit and method not reported), its output as OUTPUTS_METRIC (InnerAge, years), the DTC test that runs it as PERFORMED_WITH_VERSION and the $249 store item as DELIVERS. No InsideTracker page lists its panel's component tests as text (the Ultimate biomarker list is an image), so INCLUDES_TEST is exercised on Labcorp's published panel 005009 (CBC with differential), whose LOINC map lists each component result with its LOINC code: seven components -> seven LOINC Metrics. Coverage of the InnerAge inputs is recorded as one RESOLUTION assessment per candidate pair (conclusionCode CANDIDATE: a name-level match, never an identity); the HbA1c input pairs with the LOINC 4548-4 Metric of ../hba1c-two-labs-interference, which carries an HbF interference SAFETY_SIGNAL, so InnerAge 2.0 inherits that risk (Q-D4-26, traversing REQUIRES_INPUT_METRIC in reverse). The retest advice (g28) is a claim occurrence of a kernel Claim.

## Snapshots

### S1 `snap-labcorp-cbc`

- url: https://www.labcorp.com/tests/005009/complete-blood-count-cbc-with-differential-reflex-to-peripheral-smear-review
- title: Labcorp test menu - Complete Blood Count (CBC) With Differential, Reflex to Peripheral Smear Review, test 005009
- retrieved: 2026-10-08 (2026-10-08T17:43:00-04:00)
- snapshot digest: sha256:2ea60309595962fa9069b892815e99b7d66e7586335bcd981357462f8151f815 (20873 bytes, text/markdown, RAW_BYTES)
- tool: Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0 (requested /tests/005009/complete-blood-count-cbc-with-differential-platelet; the site canonicalizes to the URL above)
- source kind / genre: WEB_PAGE / LAB_TEST_CATALOG
- note: new capture in the fixtures stage

### S2 `snap-it-blog`

- url: https://blog.insidetracker.com/the-key-biomarkers-in-innerage-2-calculation
- title: InsideTracker - The Key Biomarkers In the InnerAge 2.0 Calculation (blog, July 25, 2023)
- retrieved: 2026-10-08 (2026-10-08T17:41:00-04:00)
- snapshot digest: sha256:f11a9ed43900615fc14771ea0c77e53d570181ddf56ac5cf559e8a8eb78fc4f6 (24406 bytes, text/markdown, RAW_BYTES)
- tool: Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0
- source kind / genre: WEB_PAGE / VENDOR_BLOG
- research-stage capture differed: sha256:fc797415a890cac7b93892443f24346a26775ed00ad2eb0f8343e342b96e7be3 (quotes re-verified on this capture; offsets are this capture's)

### S3 `snap-it-store`

- url: https://store.insidetracker.com/products/innerage
- title: InsideTracker store - InnerAge 2.0
- retrieved: 2026-10-08 (2026-10-08T17:42:00-04:00)
- snapshot digest: sha256:71d71a78cb8432a19d8e39e12eea8ecfa7332348936ec920501dba12b9457e43 (21075 bytes, text/markdown, RAW_BYTES)
- tool: Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0 --wait-for 3000 (URL found with Tavily CLI search)
- source kind / genre: WEB_PAGE / PRODUCT_PAGE
- note: new capture in the fixtures stage

### S4 `snap-it-ultimate`

- url: https://store.insidetracker.com/products/ultimate
- title: InsideTracker store - Membership + Ultimate test
- retrieved: 2026-10-08 (2026-10-08T17:43:00-04:00)
- snapshot digest: sha256:832751b9fa26b4421d765115dd91b4772b41717f3a9ab869caf6475ebed4fd84 (27777 bytes, text/markdown, RAW_BYTES)
- tool: Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0 --wait-for 3000
- source kind / genre: WEB_PAGE / PRODUCT_PAGE
- note: new capture; negative finding: panel composition only as an image

## Citation

https://www.labcorp.com/tests/005009/complete-blood-count-cbc-with-differential-reflex-to-peripheral-smear-review · Labcorp 005009 · 2026-10-08; https://blog.insidetracker.com/the-key-biomarkers-in-innerage-2-calculation · InsideTracker, The Key Biomarkers In the InnerAge 2.0 Calculation (2023-07-25) · 2026-10-08; https://store.insidetracker.com/products/innerage · InsideTracker store, InnerAge 2.0 · 2026-10-08; https://store.insidetracker.com/products/ultimate · InsideTracker store, Ultimate test · 2026-10-08. LOINC® codes as printed by Labcorp (LOINC license).
