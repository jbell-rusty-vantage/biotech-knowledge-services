# Fixture hba1c-two-labs-interference - source

- kind: harm
- url: https://www.labcorp.com/tests/001453/hemoglobin-hb-a1c
- title: Labcorp test menu - Hemoglobin (Hb) A1c, test 001453
- retrieved: 2026-10-08
- snapshot digest: sha256:0073f5495274f0e65cea44fb39a65206b064925dc17412b4cda3743a4d50e958
- tool: Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0
- candidate: FC-1 + FC-2 in ../../_notes/fixture-candidates.md

## Description

One measurand, two laboratories, two methods, two kinds of 'range', and a harm branch. Labcorp test 001453 maps its result to LOINC 4548-4 (Hemoglobin A1c/Hemoglobin.total in Blood, mass fraction) and names its method only as 'Roche Tina Quant'; Quest test 496 states 'Turbidimetric Inhibition Immunoassay' and hides its LOINC codes and performing lab behind a service-area selector. Neither states the instrument or software version, so the comparability Assessment (COMPARABILITY, subkind D4.comparability) is UNKNOWN, never 'same test'. Labcorp lists four intervals of three kinds (reference interval, two decision limits, a guideline target); Quest prints one '<5.7 %' with a disclaimer. Harm branch: Labcorp states that high HbF (>10 %) may give lower than expected HbA1c; NGSP's interference table (updated June 2026) marks Roche Cobas c513 with '$' = immunoassays can generally be assumed to show HbF interference. A person with elevated HbF using either lab cannot exclude a falsely low result. Exercises MEASURES_METRIC, PERFORMED_WITH_VERSION (episode), PERFORMED_BY_LAB (a curator inference at organization level: no capture names the performing site), INTERVAL_FOR (both fields), QUANTIFIES, HAS_ANALYTE (Biomarker.analyteEntities -> D2 MolecularEntity) and INTERFERES_WITH assertions.

## Snapshots

### S1 `snap-labcorp`

- url: https://www.labcorp.com/tests/001453/hemoglobin-hb-a1c
- title: Labcorp test menu - Hemoglobin (Hb) A1c, test 001453
- retrieved: 2026-10-08 (2026-10-08T17:40:00-04:00)
- snapshot digest: sha256:0073f5495274f0e65cea44fb39a65206b064925dc17412b4cda3743a4d50e958 (11823 bytes, text/markdown, RAW_BYTES)
- tool: Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0
- source kind / genre: WEB_PAGE / LAB_TEST_CATALOG
- research-stage capture: identical (re-fetch returned the same bytes)

### S2 `snap-labcorp-sample`

- url: https://files.labcorp.com/testmenu-d8/sample_reports/001453.pdf
- title: Labcorp SAMPLE REPORT, 001453 (PDF, synthetic sample patient)
- retrieved: 2026-10-08 (2026-10-08T17:39:00-04:00)
- snapshot digest: sha256:a2d50898e8ab617000a7b93216304b4daba18381ff0c6e8400e12fee4241a1c9 (58417 bytes, application/pdf, RAW_BYTES)
- derived text: sha256:6158f955ba337abeac56c398724cdce1aebe390d19b83dd8e65d0c3a5d5f9703 (5710 chars) by pdftotext -layout (poppler); pages separated by form feed
- tool: curl + pdftotext -layout
- source kind / genre: PDF / SAMPLE_REPORT
- research-stage capture: identical (re-fetch returned the same bytes)

### S3 `snap-quest`

- url: https://testdirectory.questdiagnostics.com/test/test-detail/496/hemoglobin-a1c?cc=MASTER
- title: Quest Diagnostics Test Directory - Hemoglobin A1c, test 496
- retrieved: 2026-10-08 (2026-10-08T17:40:00-04:00)
- snapshot digest: sha256:1816564448ca5e9165c524b1443ca05ed51ba5b25f158e07e7cf031f2b662aa6 (7623 bytes, text/markdown, RAW_BYTES)
- tool: Firecrawl CLI 1.23.1 scrape --only-main-content --wait-for 3000 --max-age 0
- source kind / genre: WEB_PAGE / LAB_TEST_CATALOG
- research-stage capture: identical (re-fetch returned the same bytes)
- note: LOINC codes and performing lab are behind a service-area selector (not rendered without a selection); capture is PARTIAL for those sections

### S4 `snap-loinc`

- url: https://loinc.org/4548-4
- title: LOINC 4548-4 Hemoglobin A1c/Hemoglobin.total in Blood (LOINC 2.73 page)
- retrieved: 2026-10-08 (2026-10-08T17:40:00-04:00)
- snapshot digest: sha256:d15f1f233a744677aedea5c6570d279ebf5ae4e990080260ba258bad14d393b9 (14531 bytes, text/markdown, RAW_BYTES)
- tool: Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0
- source kind / genre: WEB_PAGE / TERMINOLOGY_RECORD
- research-stage capture: identical (re-fetch returned the same bytes)

### S5 `snap-ngsp-interf`

- url: https://ngsp.org/interf.asp
- title: NGSP - HbA1c Assay Interferences (Updated June 2026)
- retrieved: 2026-10-08 (2026-10-08T17:40:00-04:00)
- snapshot digest: sha256:d7498836c93ec989942fa4265d1ff675cbb10c70a5580da639caf08e41a76215 (5487 bytes, text/markdown, RAW_BYTES)
- tool: Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0
- source kind / genre: WEB_PAGE / REFERENCE_PROGRAM_PAGE
- research-stage capture: identical (re-fetch returned the same bytes)

### S6 `snap-ngsp-methods`

- url: https://ngsp.org/docs/methods.pdf
- title: NGSP - List of NGSP Certified Methods (updated 10/26), PDF parsed to markdown by Firecrawl
- retrieved: 2026-10-08 (2026-10-08T17:40:00-04:00)
- snapshot digest: sha256:21a24ece3b4dcd8f8294e57a2167d51a9ecf9fa15e78e4a3105234b8cc1dd05c (91374 bytes, text/markdown, RAW_BYTES)
- tool: Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0
- source kind / genre: PDF / REFERENCE_PROGRAM_LIST
- research-stage capture: identical (re-fetch returned the same bytes)
- note: snapshot digest is of the Firecrawl markdown rendition of the PDF (the PDF bytes were not stored)

## Citation

https://www.labcorp.com/tests/001453/hemoglobin-hb-a1c · Labcorp, Hemoglobin (Hb) A1c 001453 · 2026-10-08; https://files.labcorp.com/testmenu-d8/sample_reports/001453.pdf · Labcorp SAMPLE REPORT 001453 · 2026-10-08; https://testdirectory.questdiagnostics.com/test/test-detail/496/hemoglobin-a1c?cc=MASTER · Quest Test Directory, Hemoglobin A1c 496 · 2026-10-08; https://loinc.org/4548-4 · LOINC 4548-4 · 2026-10-08; https://ngsp.org/interf.asp · NGSP HbA1c Assay Interferences (updated June 2026) · 2026-10-08; https://ngsp.org/docs/methods.pdf · NGSP List of Certified Methods (updated 10/26) · 2026-10-08. LOINC content: LOINC® is copyright Regenstrief Institute, used under the LOINC license.
