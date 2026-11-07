# Fixture label-versions-truniagen-dsld — source

- url: https://api.ods.od.nih.gov/dsld/v9/label/295562
- title: NIH ODS Dietary Supplement Label Database, label 295562 "Tru Niagen 300 mg" (brand ChromaDex), API v9 JSON
- retrieved: 2026-10-08
- snapshot digest: sha256:499b55edd212d6f2ace5081cbe1ac28266586bd522e6c6d46cf2c39091217ce5
- kind: other
- tool: tool:nih-dsld-api (curl, no key); tool:firecrawl-scrape (NSF listing)
- research candidate: FC-1 (`../../_notes/fixture-candidates.md`)

## Captures (all retrieved 2026-10-08; raw bytes in the session scratchpad `ft/D6/`, not committed)

| source key | url | title | retrievedAt (UTC) | snapshot digest | fresh re-fetch |
| --- | --- | --- | --- | --- | --- |
| dsld-295562 | https://api.ods.od.nih.gov/dsld/v9/label/295562 | DSLD label 295562 "Tru Niagen 300 mg", 30 capsules, version V09.2 | 2026-10-08T20:52:16Z | sha256:499b55edd212d6f2ace5081cbe1ac28266586bd522e6c6d46cf2c39091217ce5 | identical bytes |
| dsld-323170 | https://api.ods.od.nih.gov/dsld/v9/label/323170 | DSLD label 323170 "Tru Niagen 300 mg", 30 capsules, version V12.3 | 2026-10-08T20:52:16Z | sha256:d90025929a353034c6c549b41eb1558e7673ce3eba2a0109ca48fed9830c003d | identical bytes |
| dsld-323171 | https://api.ods.od.nih.gov/dsld/v9/label/323171 | DSLD label 323171 "Tru Niagen 300 mg", 90 capsules, version V08.2 | 2026-10-08T20:52:17Z | sha256:4eea79012ed394df1eaf936c52ea1ee9f0243696b2f89bd469018132ed7c2f4c | identical bytes |
| nsf-1263423 | https://www.nsfsport.com/certified-products/listing-detail.php?id=1263423 | NSF Certified for Sport: TRU NIAGEN® 300mg (Firecrawl markdown) | 2026-10-08T20:57:51Z | sha256:1155df8a1a13c6421458712d90d9770f1dbd60479e4bad870bf9f1e7350d6c35 | rendering changed (sha256:3cb3e5d1…), every quote re-found |

## Description

One Tru Niagen 300 mg capsule variant, two packages (30 and 90 count) and three label versions registered by NIH ODS in DSLD. Labels 295562 (V09.2, entered 2023-05-24) and 323170 (V12.3, entered 2025-04-24) carry the same UPC `8 50015 31111 6` and declare the same composition (Niagen as nicotinamide riboside chloride 300 mg per capsule; microcrystalline cellulose, hypromellose, magnesium stearate), so their compositionDigest is equal; the directions change from one capsule daily (maxDailyServings 1) to 1-3 times daily (maxDailyServings 3) and the seals change (NSF Certified Sport removed, Alkemist Assured added). DSLD itself relates the pair both as "Image difference, same product" and as "Package size difference, same product" (both labels are 30-count), so the registry relation is recorded as a data-quality conflict (as03), not used as a basis. The fixture therefore records a label-only change (Assessment `D6.change-kind` LABEL_ONLY), the computed maximum declared daily intake rising from 300 to 900 mg/day of the salt form, the label's responsible party ("Distributed by ChromaDex, Inc", resolved to the D7 Organization ChromaDex, Inc., a wholly owned subsidiary of Niagen Bioscience, Inc. — formerly ChromaDex Corporation — per the 10-K's Note 1), and a certification-scope check against the NSF listing (package sizes 30, 60, 90; lot scope All; United States).

## Relationships exercised

HAS_VARIANT (structural), HAS_PACKAGE ×2 (structural), HAS_LABEL_VERSION ×3 (asserted episodes, asserter NIH ODS, valid time from the DSLD entry date as a publication proxy), DECLARES_COMPONENT ×9 (asserted lines adc01–adc09, each its own Assertion by NIH ODS, with ComponentLineProperties: DIETARY_INGREDIENT AS_NAMED + massBasis SALT_FORM 300 mg, plus OTHER_INGREDIENT lines), NAMES_RESPONSIBLE_PARTY ×2 (→ ChromaDex, Inc.), BRANDED_AS (also exercised by prepared-food-bigmac-mcdonalds). Predicate-only: BEARS_SEAL, CALCULATED_DAILY_MAX_INTAKE (COMPUTATION, derivationRule d6-max-daily-intake/v1), D8 listing-scope literals. Identifiers: GTIN ×2 (check digits verified), DSLD ×3. Kernel records: Assessments as01 (D6.change-kind), as02 (D6.certification-scope), as03 (DSLD relation conflict); Mention m01 (Alkemist Assured).

## Files

`locators.yaml` (42 locators: JSON_POINTER selectors with the verbatim raw-JSON substring, TEXT_QUOTE on the NSF page; code-point and byte offsets; re-fetch verification), `assertions.yaml`, `intent.json` (biotech-knowledge-intent.v1, validated with `@bks/contracts` IngestionIntent), `questions.md`. Build and quote verification: scratch `ft/D6fx/build.py` (fails on any quote not found in the capture or the fresh re-fetch).
