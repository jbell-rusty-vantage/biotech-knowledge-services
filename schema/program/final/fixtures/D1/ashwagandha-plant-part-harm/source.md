# Fixture ashwagandha-plant-part-harm — source (harm)

- url: https://www.tga.gov.au/news/safety-updates/withania-somnifera-ashwagandha-and-very-rare-risk-liver-injury
- title: TGA Medicine Safety Update "Withania somnifera (Ashwagandha) and very rare risk of liver injury"
- retrieved: 2026-10-08
- snapshot digest: sha256:73026f28ed71050441d585e8c9337539f7335a8742f081ab8b6b5a5e210b75c8
- kind: harm
- tool: tool:tga-safety-updates (Firecrawl CLI 1.23.1 `scrape --only-main-content --max-age 0`, Markdown capture)
- fixture ids: mission:ft-D1-fixtures / run:ft-D1-ashwagandha-plant-part-harm (fixture ids, not live Mission Control ids)

## Companion snapshots (re-captured 2026-10-08)

| snapshot | url | tool | sha256 |
| --- | --- | --- | --- |
| NIH DSLD label 306237 "KSM-66 600 mg" (Nutricost) | https://api.ods.od.nih.gov/dsld/v9/label/306237 | tool:dsld-api | 60d4c1eb9952795a08879c32f72dd52d05a0358992c61e548b9514e74f07f1a8 |
| FDA GSRS WITHANIA SOMNIFERA ROOT (UNII V038D626IF, structurallyDiverse, version 13) | https://gsrs.ncats.nih.gov/api/v1/substances(V038D626IF)?view=full | tool:gsrs-api | e70046354b677c2aebed32c490bdb46f49ca28a6d2afe9f323e8e30465ad69f6 |
| FDA GSRS WITHAFERIN A (UNII L6DO3QW4K5, record version 8; captured 2026-10-09T01:45Z UTC in the adversarial review, three fetches byte-identical) | https://gsrs.ncats.nih.gov/api/v1/substances(L6DO3QW4K5)?view=full | tool:gsrs-api | 3aef316d8992b5a1405a2cbcd7bf811212da0e10e616dc1f6f2d706a4f205812 |
| Ixoreal "What is KSM66" (Firecrawl Markdown; https://www.ixoreal.com/ redirects to this domain) | https://ksm66ashwagandhaa.com/what-is-ksm66.php | tool:supplier-pages | 3d82b3358198aa3e12d134b738b1c11d358a4fa52d2db2d01e5ce4e4249347ad |
| Health Canada LNHPD medicinal ingredient, lnhpd_id 4846413 (Withania somnifera, NPN 80003831) | https://health-products.canada.ca/api/natural-licences/medicinalingredient/?lang=en&type=json&id=4846413 | tool:lnhpd-api | 9f964626b3852ada3a8bb995d41aad073cf4b50b5698c1d68dfd3a941dbb75b3 |
| NCBI Taxonomy 126910 Withania somnifera | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=taxonomy&id=126910&retmode=xml | tool:ncbi-taxonomy-eutils | f0192f39c020f7a017dce88bd08087e3a4b8b9bcee58b4806273f67ea7e9e8e1 |
| NCBI Taxonomy 126908 Withania (genus) | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=taxonomy&id=126908&retmode=xml | tool:ncbi-taxonomy-eutils | a784871b352ad611611aadde86ba697d5e93ad60208fb09c66e8d4694fe58478 |
| eCFR 21 CFR 101.36 as of 2026-09-01 | https://www.ecfr.gov/api/versioner/v1/full/2026-09-01/title-21.xml?part=101&section=101.36 | tool:ecfr-versioner | 397d82db94e25b73dfb000c8368d724468326d676e47a644f7ba2b3d18779cee |

TGA, DSLD, GSRS root, KSM-66 page, NCBI 126910 and eCFR bytes are identical to the research captures; the LNHPD record differs only in its `metadata.dateReceived` timestamp.

Adversarial review (2026-10-08): the fixtures stage cited a GSRS **search** response for WITHAFERIN A (`substances/search?q=root_names_name:"WITHAFERIN A"&top=3`, digest de10438a…). That response embeds a per-request `"created"` timestamp and `"etag"` (two fetches 54 s apart differ only there), so its digest can never be reproduced; it was not disclosed as volatile. The locators now cite the stable full record `substances(L6DO3QW4K5)?view=full` (`/approvalID`, `/names/3/name`), whose bytes are identical across fetches; the search snapshot is no longer cited. GSRS needs no special User-Agent (HTTP 200 with `curl/8` and with an empty User-Agent).

## Description

Plant part and preparation are harm-relevant identity facts. The TGA says withanolide composition "can vary depending on whether the leaf or root part has been used" and on "the extraction method and extraction ratio", advises that W. somnifera products be avoided in people with existing liver disorders, and counts 11 possible liver-injury cases. A branded root-only extract (KSM-66, supplier page) appears on a US label (Nutricost, DSLD 306237) whose branded row carries the sentinel UNII "0" and whose form row maps the **extract** to the GSRS record of the **root** (structurally diverse, part root) — an identity-granularity mismatch the fixture records as a QUALITY assessment, not a fix. The label's "min. 5% total withanolides, less than 0.1% withaferin A" becomes two MATERIAL_CONTAINS standardization statements (GE / LT). A Canadian 1:5 liquid extract of dried root (LNHPD) shows the structured fields a botanical needs, and its 15 mL dose reproduces the declared 3 g dried-herb equivalent. NCBI places W. somnifera under the genus Withania (combination "(L.) Dunal, 1852"). Harm is a D5 SAFETY_SIGNAL about the taxon and the root substance; an APPLICABILITY assessment says why a signal transfers only through plantPart, preparation and ratio.

## What it exercises

- `DERIVED_FROM_TAXON` KSM-66 → Withania somnifera (w01), LNHPD tincture → W. somnifera (w06).
- `REALIZES_SUBSTANCE` KSM-66 → V038D626IF (w03; identity-granularity mismatch, Q-D1-06).
- `MATERIAL_CONTAINS` KSM-66 → total withanolides {STANDARDIZATION_CLAIM, 5, GTE, %} (w04) and → withaferin A {STANDARDIZATION_CLAIM, 0.1, LT, %} (w05); content basis w/w is an Assertion qualifier. Q-D1-11's "standardized to ≥ 5 % total withanolides" filter passes w04; w05 (a limit) never passes a minimum filter.
- `PARENT_TAXON` W. somnifera → Withania, open episode from 1852 (w09).
- FIELD PLANT_PART (w02), EXTRACT_RATIO (w07); CALCULATED dried-herb-equivalent check (c11); RESOLUTION r04, QUALITY q01, SAFETY_SIGNAL s02 (HARM, all plant parts) and s03 (HARM, facet `plantPart=LEAF`: India's leaf ban as reported by TGA), APPLICABILITY ap02.
