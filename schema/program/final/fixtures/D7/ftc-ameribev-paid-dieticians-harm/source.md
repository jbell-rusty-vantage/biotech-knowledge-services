# Fixture: ftc-ameribev-paid-dieticians-harm

- url: https://www.ftc.gov/system/files/ftc_gov/pdf/warning-letter-american-bev.pdf
- title: Warning Letter to American Beverage Association (Federal Trade Commission staff, dated November 13, 2023; 4 pages)
- retrieved: 2026-10-08
- snapshot digest: sha256:a262b2e3827a53a7558d58fd3d3b1b965d63311ea3e1621486598cd138f50cd3
- kind: harm
- tool: Firecrawl CLI 1.23.1 `firecrawl scrape <pdf-url> --max-age 0` (PDF parsed to markdown, 8,533 bytes; digest basis NORMALIZED_TEXT, the parser output, not the PDF bytes). Plain curl gets an Akamai "Page Not Found" (HTTP 404) from ftc.gov (research-stage tool log #7), so Firecrawl is the capture path. The research-stage capture of the same PDF had a different digest (926704…, 8,649 bytes): PDF-to-markdown output is not byte-stable across runs, a readiness finding for snapshot identity (08-sources-and-tools.md).
- second source: https://www.ftc.gov/system/files/ftc_gov/pdf/warning-letter-bonci.pdf · Warning letter to Leslie Bonci (dated November 13, 2023) · retrieved 2026-10-08 · snapshot digest sha256:01bee3aedf7244415b2b26fb6f6db25d9b826fb71956335b5b85e26b6dee1d17 · Firecrawl CLI; a scanned PDF, so the text is OCR output (noise such as "aspaiiame", "tmth" elsewhere in the letter; the quoted sentences are clean).
- third source: https://www.ftc.gov/news-events/news/press-releases/2023/11/ftc-warns-two-trade-associations-dozen-influencers-about-social-media-posts-promoting-consumption · press release, November 15, 2023 · retrieved 2026-10-08 · snapshot digest sha256:0b0abcdc7e40a37e83e69f5d3b1b8d363237d2148d922f1d2ca3dba0a4712d69 · Firecrawl CLI `--only-main-content`.
- capture files (scratch, not committed): `ft/D7/fix/ftc_ameribev.fc.md`, `ft/D7/fix/ftc_bonci.fc.md`, `ft/D7/fix/ftc_pr_aspartame.fc.md`.

## Description

The harm case. FTC staff wrote to the American Beverage Association that registered dieticians who posted about the safety of aspartame appear to have been paid by the association, and that some posts had no disclosure of that material connection; the individual letter to one of those dieticians says "It appears that you were paid by the American Beverage Association ("ABA") to make those posts." The fixture records one RECEIVES_VALUE_FROM episode (Person → Organization, valueKind PAID_ENDORSEMENT) asserted by the regulator, with the hedge "It appears" kept in the Assertion's qualifiers rather than turned into a settled fact; two predicate-only MATERIAL_CONNECTION_NOT_ADEQUATELY_DISCLOSED Assertions (endorser side and marketer side); a source-quality Assertion about the letter's own inconsistent dates (page 1 "November 13, 2023", page headers "November 6, 2023"); and a kernel CONFLICT_RELEVANCE Assessment with effectDirection HARM. The regulatory action as a record (warning letter, penalty notice) belongs to D8 (ACTION_AGAINST seam); the promoted substance to D1/D12. Only one endorser is named in this fixture (privacy rule).
