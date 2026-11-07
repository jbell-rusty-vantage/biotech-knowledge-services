# Fixture clock-noise-vs-retest-advice - source

- kind: reliability-gap
- url: https://www.ncbi.nlm.nih.gov/research/bionlp/RESTful/pmcoa.cgi/BioC_json/PMC9586209/unicode
- title: Higgins-Chen et al. 2022, A computational solution for bolstering reliability of epigenetic clocks, Nature Aging (PMID 36277076; PMC9586209; DOI 10.1038/s43587-022-00248-2) - NCBI BioC JSON
- retrieved: 2026-10-08
- snapshot digest: sha256:0d2ed3c4b76bb512c86ed6632e29c78a7b4ea2b7d06e50addb8dbab4513deb17
- tool: curl NCBI BioC PMC OA API (no key)
- candidate: FC-4 + FC-9 (claim side) in ../../../../packets/D4/_notes/fixture-candidates.md

## Description

Reliability-gap case (relabelled from 'disconfirmation' in the adversarial-review pass: no captured source measures the noise of DunedinPACE itself, so nothing here contradicts the vendor's advice; the class-level noise of other CpG clocks only qualifies it). A consumer epigenetic-age product (TruDiagnostic TruAge) reports 'DunedinPACE™' with no version, array or replicate data and tells the user to 'retest every 3 months to track your progress'. Higgins-Chen et al. 2022 (Nature Aging; PMID 36277076; PMCID PMC9586209; DOI 10.1038/s43587-022-00248-2) documents that technical replicates of the same blood specimen give clock values that differ by years (Horvath1 median 1.8, max 4.8 years); the paper does not evaluate DunedinPACE, whose own publication reports test-retest ICC 0.96. The vendor prints '*Based on the last 2-3 months' next to the pace score, the only stated rationale near its interval. The fixture exercises PERFORMED_WITH_VERSION (LabTest -> vendor AlgorithmVersion) and the vendor -> publication side of DERIVED_FROM_ALGORITHM_VERSION, and records the verdict as kernel Assessments (QUALITY, subkind D4.change-detectability; EQUIVALENCE, subkind D4.algorithm-equivalence) - never as a property of the clock. A second vendor (Elysium Index) claims replicate agreement within 0-1.5 years: a manufacturer claim with a locator, weighed but not adopted. The paper snapshot is the NCBI BioC JSON re-fetched today (byte-capturable); the research stage used the PubMed MCP full-text response (sha256 2344777949649a9bc2656192e62fcf0afc9c24925bf5b9612602d1ee208874cc), whose text the BioC capture reproduces for every quote.

## Snapshots

### S1 `snap-bioc`

- url: https://www.ncbi.nlm.nih.gov/research/bionlp/RESTful/pmcoa.cgi/BioC_json/PMC9586209/unicode
- title: Higgins-Chen et al. 2022, A computational solution for bolstering reliability of epigenetic clocks, Nature Aging (PMID 36277076; PMC9586209; DOI 10.1038/s43587-022-00248-2) - NCBI BioC JSON
- retrieved: 2026-10-08 (2026-10-08T17:41:00-04:00)
- snapshot digest: sha256:0d2ed3c4b76bb512c86ed6632e29c78a7b4ea2b7d06e50addb8dbab4513deb17 (137853 bytes, application/json, RAW_BYTES)
- tool: curl NCBI BioC PMC OA API (no key)
- source kind / genre: API / PEER_REVIEWED_PUBLICATION
- note: replaces the research-stage PubMed MCP response as the byte snapshot (MCP output cannot be hashed reproducibly); Europe PMC fullTextXML returns 150 bytes for this PMCID

### S2 `snap-truage`

- url: https://shop.trudiagnostic.com/products/truage-complete-epigenetic-collection
- title: TruDiagnostic - TruAge test page (shop)
- retrieved: 2026-10-08 (2026-10-08T17:40:00-04:00)
- snapshot digest: sha256:a65fa4334eb2a8283fcde656b0d1d1fdb4e6eb961be1121e2bea93feb168cb17 (33142 bytes, text/markdown, RAW_BYTES)
- tool: Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0
- source kind / genre: WEB_PAGE / MARKETING_PAGE
- research-stage capture differed: sha256:d29bf7c63dfe09bd6d63cc5258df7c7d0cad36437bcdd1d77855a0661387a414 (quotes re-verified on this capture; offsets are this capture's)

### S3 `snap-truage-report`

- url: https://cdn.shopify.com/s/files/1/0269/3332/9974/files/ExampleAdvancedTruAge.pdf?v=1749717681
- title: TruDiagnostic - Advanced TruAge Report (sample PDF)
- retrieved: 2026-10-08 (2026-10-08T17:39:00-04:00)
- snapshot digest: sha256:b5d7f9798de00dd73dd6f287f95876f0dce09cb085c701e630d99f14bd4f4ea1 (4019343 bytes, application/pdf, RAW_BYTES)
- derived text: sha256:f9859cb6fa904885221789b422bf101de915907f31e4ccc42dc167c2d9b2c02f (53466 chars) by pdftotext -layout (poppler), output decoded as Latin-1; pages separated by form feed
- tool: curl + pdftotext -layout
- source kind / genre: PDF / SAMPLE_REPORT
- research-stage capture: identical (re-fetch returned the same bytes)

### S4 `snap-elysium`

- url: https://www.elysiumhealth.com/pages/science-behind-index
- title: Elysium Health - The Science Behind Index
- retrieved: 2026-10-08 (2026-10-08T17:40:00-04:00)
- snapshot digest: sha256:a342e35966b79ea09eb9eccb0f48274312baf9d4e7aab16d72e7ca36f290fed7 (7490 bytes, text/markdown, RAW_BYTES)
- tool: Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0
- source kind / genre: WEB_PAGE / MARKETING_PAGE
- research-stage capture: identical (re-fetch returned the same bytes)

## Citation

https://doi.org/10.1038/s43587-022-00248-2 · Higgins-Chen AT et al., 'A computational solution for bolstering reliability of epigenetic clocks: implications for clinical trials and longitudinal tracking', Nature Aging 2022 (PMID 36277076, PMCID PMC9586209) · retrieved 2026-10-08 via NCBI BioC API; https://shop.trudiagnostic.com/products/truage-complete-epigenetic-collection · TruDiagnostic TruAge test page · 2026-10-08; https://cdn.shopify.com/s/files/1/0269/3332/9974/files/ExampleAdvancedTruAge.pdf?v=1749717681 · TruDiagnostic sample Advanced TruAge report · 2026-10-08; https://www.elysiumhealth.com/pages/science-behind-index · Elysium Health, The Science Behind Index · 2026-10-08
