# Fixture — Hall et al. 2019, ultra-processed vs unprocessed diets (unstructured-to-entity path, 00-DIRECTIVE 3.8)

- url: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id=7946062&retmode=xml
- title: Ultra-Processed Diets Cause Excess Calorie Intake and Weight Gain: An Inpatient Randomized Controlled Trial of Ad Libitum Food Intake. Hall KD et al., Cell Metab 2019;30(1):67-77.e3 (PMID 31105044; PMCID PMC7946062, NIH author manuscript; DOI 10.1016/j.cmet.2019.05.008; NCT03407053)
- retrieved: 2026-10-08
- snapshot digest: sha256:e95aca1562741ad9a7534d8fdbef31032713b82bd3d975b63a4b5b47d0e29ae3
- kind: unstructured-to-entity
- also a harm case (UPF exposure → WORSENS_TARGET body composition)
- tool: curl, NCBI E-utilities `efetch db=pmc` (JATS XML; research capture 2026-10-08T20:55:29Z). Europe PMC `fullTextXML` returned HTTP 500 in the research stage. Fixture-stage re-fetch 2026-10-08T21:37:11Z: byte-identical (same sha256).

## Companion sources (same fixture)

| url | title | retrieved | snapshot digest | tool |
| --- | --- | --- | --- | --- |
| https://ars.els-cdn.com/content/image/1-s2.0-S1550413119302487-mmc1.pdf | Hall et al. 2019, Supplemental Information (Table S1 and the 7-day menus of both diets), 46 pages | 2026-10-08 | sha256:2543db7b6389ecbaeddb6d25c73ed6cb9a6fedb7208135a247e73dc86eee3aaa | curl (publisher CDN); PMC copy refused (proof-of-work challenge page), Firecrawl failed on the PMC URL, Europe PMC supplementaryFiles answered "not open access"; page text by pdftotext 4.00 `-layout` |
| https://clinicaltrials.gov/api/v2/studies/NCT03407053 | ClinicalTrials.gov NCT03407053 "Effect of Ultra Processed Versus Unprocessed Diets on Energy Intake" | 2026-10-08 | sha256:fedac9c5954d2efa94629aaf480e266b8eedd733818d166bf19019a8903f594c | curl, CT.gov API v2 (re-fetch byte-identical) |

| https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=31105044&retmode=xml | PubMed record of the article (CommentsCorrections: ErratumIn Cell Metab 2019;30(1):226, PMID 31269427; ErratumIn Cell Metab 2020;32(4):690, PMID 33027677) | 2026-10-09 | see locators.yaml snap-hall-pubmed | curl, E-utilities (adversarial review) |
| https://www.sciencedirect.com/science/article/pii/S1550413120304277 | Correction, Cell Metab 2020;32(4):690 ("This error did not affect the primary outcome …") | 2026-10-09 | see locators.yaml snap-hall-erratum-2020 | Firecrawl CLI `scrape --only-main-content --max-age 0` (adversarial review) |

The text version that the chunk spans is rebuilt from the snapshot bytes by the committed extractor `extract_text_version.py` (text-version/v1: UTF-8 decode; every tag `<[^>]+>` → one space; every run of `\s` whitespace → one space; no entity unescaping, no trim). Re-run in the adversarial review on the re-fetched JATS: 66,807 code points, textVersionHash sha256:25b62c8f9852e42ec2a35cd80a8104df4fbc84af3c37a7e4f42f9b58444c1faa, chunk [2050, 3130) sha256 e3772265… — identical to the research-stage scratch file. Only short quotes are stored in the repo.

Publication status (adversarial review): the article has two published errata. The 2020 correction concerns meal-level data and states that it did not affect the primary outcome (total daily ad libitum energy intake), which is the figure this fixture quotes; the 2019 erratum's text was not read (PubMed holds none). Recorded as `ft-d12-upf-07` (kernel HAS_REVISION_STATUS, valueString ERRATUM, asserter PubMed).

## What it demonstrates

The 3.8 effectiveness test on real bytes: question Q-D12-26 → D9 `Chunk` (the Summary paragraph, text-version offsets 2050–3130) found by `MENTIONS` of NOVA group 4 and of the two trial-arm `DietaryPattern`s (or by the chunk vector index) → `COVERS_LOCATOR` → the Assertions that cite those locators (`WORSENS_TARGET` target:body-composition by the UPF diet; the D3 StudyResult +508±106 kcal/d) → `SourceLocator` TEXT_QUOTE "Energy intake was greater during the ultra-processed diet (508±106 kcal/d; p=0.0001)" (snapshot offsets 10079–10163) → `SourceSnapshot` bytes (sha256 above). The verifier re-selects the same selector on the same bytes; the chunk is never evidence. The source's own guard ("Our study was not designed to identify the cause of the observed differences in energy intake.") travels as QUALIFIES evidence. The two diets are `DietaryPattern`s (definitionScope TRIAL_ARM) whose `PATTERN_COMPONENT` to NOVA 4 carries the paper's Table 1 energy share (81.3 % vs 0 %). The fixture also records what it refuses to infer: the supplement's menu lists "French fries (Monarch)" under the ultra-processed menu but prints no NOVA group per item, so no item-level `IN_FOOD_CATEGORY` is written (staged as a mention).

## Relationships exercised

- PATTERN_COMPONENT — `hu:assertion:ft-d12-upf-03` (UPF diet INCLUDES NOVA 4, 81.3 %), `-04` (unprocessed diet EXCLUDES NOVA 4, 0 %)
- predicate-only WORSENS_TARGET (D5 vocabulary) — `ft-d12-upf-01`
- seam D3 STATED_IN (StudyResult) — `ft-d12-upf-02`; D9 Chunk CHUNK_OF / COVERS_LOCATOR / MENTIONS — `path38` in assertions.yaml
- IN_FOOD_CATEGORY — deliberately not authorized here (refusedInferences); the register points IN_FOOD_CATEGORY at `mcdonalds-fries-prepared-food`, which exercises it source-stated and CALCULATED
