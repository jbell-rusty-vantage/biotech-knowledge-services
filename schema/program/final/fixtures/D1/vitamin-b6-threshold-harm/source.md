# Fixture vitamin-b6-threshold-harm — source (harm)

- url: https://www.tga.gov.au/news/safety-updates/medicines-containing-vitamin-b6-pyridoxine-pyridoxal-or-pyridoxamine
- title: TGA Medicine Safety Update "Medicines containing vitamin B6 (pyridoxine, pyridoxal or pyridoxamine)" — final scheduling decision released 25 November 2025, implementation 1 June 2027
- retrieved: 2026-10-08
- snapshot digest: sha256:1fde192f063285fe0590ba77f4e854de631cc6ee331c85ba20c42600caba2bb2
- kind: harm
- tool: tool:tga-safety-updates (Firecrawl CLI 1.23.1 `scrape --only-main-content --max-age 0`, Markdown; the digest is of the Markdown capture, captureCompleteness PARTIAL_EXCERPT)
- fixture ids: mission:ft-D1-fixtures / run:ft-D1-vitamin-b6-threshold-harm (fixture ids, not live Mission Control ids)

## Companion snapshots (re-captured 2026-10-08)

| snapshot | url | tool | sha256 |
| --- | --- | --- | --- |
| NIH ODS "Vitamin B6 — Health Professional Fact Sheet" (Firecrawl Markdown) | https://ods.od.nih.gov/factsheets/VitaminB6-HealthProfessional/ | tool:nih-ods-factsheets | ae2193892e2c851288e9a40368d85727f74536f90ff53f5147de42e68a24ba7d |
| NIH DSLD label 326829 "P-5-P 50 mg" (Country Life) | https://api.ods.od.nih.gov/dsld/v9/label/326829 | tool:dsld-api | f63958566cc707f701b6cd1f06a50ad92b859ce184cf8dcadd9f178915b04ec3 |
| NIH DSLD label 309443 "Magnesium + P-5-P" (EuroMedica) | https://api.ods.od.nih.gov/dsld/v9/label/309443 | tool:dsld-api | 8d84822407fbc7bd336709bf555e9073c74a3745c662f4be4df3a7ce87db5b02 |
| FDA GSRS "Pyridoxal phosphate anhydrous" (UNII F06SGE49M6, version 32) | https://gsrs.ncats.nih.gov/api/v1/substances(F06SGE49M6)?view=full | tool:gsrs-api | 792e5a24603f323772e33058a7f80787a8fb29f6e42ceb7d5c599677661c7859 |
| FDA GSRS PYRIDOXINE (UNII KV2JZ1BI6Z, version 38) | https://gsrs.ncats.nih.gov/api/v1/substances(KV2JZ1BI6Z)?view=full | tool:gsrs-api | b0f2dc8c79b55146a83ebaf27bf2b09455f4ad09515d588bf84fbe37111d5475 |
| FDA GSRS PYRIDOXINE HYDROCHLORIDE (UNII 68Y4CF58BV, version 54) | https://gsrs.ncats.nih.gov/api/v1/substances(68Y4CF58BV)?view=full | tool:gsrs-api | fdd7a45eab90a93bca3a401559949d4556c99acea61e33053e440b0690711dd7 |

The TGA Markdown differs from the research capture (digest e825eb19…) only by an added "Related content" block at the end and in the on-page menu line; every quote was re-selected in the new capture and the offsets in locators.yaml are those of the new capture. All other bytes are identical to the research captures.

## Description

The harm case. The Australian regulator reschedules oral vitamin B6 above 50 mg per (maximum) recommended daily dose from 1 June 2027, says peripheral neuropathy "cannot be excluded for doses less than 50 mg/day", has required a warning above 10 mg/day "or equivalent" since 1 March 2022, and reports that consumers miss B6 when a label lists only the chemical name. It states the convention every comparison needs: TGA says ARTG PDF summaries give the amount "as the equivalent amount of pyridoxine" (TGA's description; no ARTG PDF was fetched). Two US labels show the two bases in the wild: Country Life declares 50 mg pyridoxal 5-phosphate **and** 34 mg vitamin B6 (the brand's own pyridoxine equivalent, which the stoichiometry check reproduces: 50 × 169.1782/247.1422 = 34.23 mg); EuroMedica declares "Vitamin B6 10 mg" with P5P as the form and 4 capsules a day, without saying which basis. GSRS gives P5P as its own active moiety, so the vitamer → nutrient equivalence cannot ride on HAS_ACTIVE_MOIETY; it rides on COUNTS_TOWARD_NUTRIENT, the predicate-only NUTRIENT_EXPRESSED_AS Assertion and the versioned rule `rule:nutrient-equivalent.v1`. Harm is a D5 SAFETY_SIGNAL assessment (effectDirection HARM) on the nutrient; D1 holds identity and the derived amounts only.

## What it exercises

- `COUNTS_TOWARD_NUTRIENT` P5P → vitamin B6 (b01 TGA, b02 ODS), pyridoxine HCl → B6 (b03), pyridoxine → B6 (b04).
- NUTRIENT_EXPRESSED_AS vitamin B6 → pyridoxine, jurisdiction AU (b05) — a predicate-only Assertion since the adversarial review (no typed edge).
- `HAS_ACTIVE_MOIETY` pyridoxine HCl → pyridoxine (b06); P5P self-moiety recorded and no edge written (b07).
- `REALIZES_SUBSTANCE` label P5P material → F06SGE49M6 (b10).
- CALCULATED `rule:nutrient-equivalent.v1` (c06), stoichiometry check (c07), `rule:daily-max.v1` (c08, c09), threshold screens c10a–c10d (one CALCULATED Assertion per label × threshold) against D5 `HAS_UPPER_LIMIT` assertions with `limitKind:SCHEDULING_THRESHOLD` (d01, from 2027) and `limitKind:LABEL_WARNING_THRESHOLD` (d02, since 2022).
- D5 SAFETY_SIGNAL assessment s01 (HARM).
