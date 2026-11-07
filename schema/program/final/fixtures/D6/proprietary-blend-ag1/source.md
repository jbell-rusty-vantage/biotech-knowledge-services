# Fixture proprietary-blend-ag1 — source

- url: https://api.ods.od.nih.gov/dsld/v9/label/262237
- title: NIH ODS Dietary Supplement Label Database, label 262237 "AG1" (brand Athletic Greens), API v9 JSON
- retrieved: 2026-10-08
- snapshot digest: sha256:6ed5982c512783e2dacc0437f87787167d52118c8e52a63790a94118e0ceb08a
- kind: harm
- tool: tool:nih-dsld-api (curl), tool:ecfr-api (curl --compressed)
- research candidate: FC-8

## Captures (retrieved 2026-10-08)

| source key | url | title | retrievedAt (UTC) | snapshot digest | fresh re-fetch |
| --- | --- | --- | --- | --- | --- |
| dsld-262237 | https://api.ods.od.nih.gov/dsld/v9/label/262237 | DSLD label 262237 "AG1", 360 g, entered 2021-11-19 | 2026-10-08T20:58:50Z | sha256:6ed5982c512783e2dacc0437f87787167d52118c8e52a63790a94118e0ceb08a | identical bytes |
| dsld-323512 | https://api.ods.od.nih.gov/dsld/v9/label/323512 | DSLD label 323512 "AG1", 350 g, entered 2025-03-25 | 2026-10-08T20:58:50Z | sha256:ba2abab0b86cf546ebb3d87b0c341009affeb75cca7e34d6c4f386deca5fe16b | identical bytes |
| ecfr-101-36 | https://www.ecfr.gov/api/versioner/v1/full/2026-10-01/title-21.xml?part=101&section=101.36 | eCFR 21 CFR 101.36 (as of 2026-10-01), XML | 2026-10-08T21:01:09Z | sha256:397d82db94e25b73dfb000c8368d724468326d676e47a644f7ba2b3d18779cee | identical bytes |

## Description

Harm (avoidance) case for undeclared doses. Both AG1 labels declare four proprietary blends with only their totals per 12 g scoop (e.g. "Nutrient Dense Extracts, Herbs & Antioxidants" 2732 mg; "Alkaline, Nutrient-Dense Raw Superfood Complex" 7388 mg); members such as Ashwagandha Root Extract and Rhodiola root extract carry quantity 0 with unit "NP" in DSLD (no amount printed), which 21 CFR 101.36(c) permits ("The quantitative amount by weight specified for the proprietary blend shall be the total weight of all other dietary ingredients contained in the proprietary blend"). The per-serving amount of ashwagandha (a botanical with a D1 harm fixture) cannot be known from the label. The two labels also differ: net contents 360 g → 350 g at the same 12 g serving and 30 servings per container, maxDailyServings 1 → not stated, the "Dairy Free Probiotics" blend 38 mg → 54 mg, and calcium sources (calcium carbonate, calcium phosphate) added. The research stage read this pair as a packaging-only change; the line-level comparison made in this stage shows a formulation change plus a net-contents change (Assessment as70 FORMULATION; two Packages by the 06 identity rule). A computed check also records that 12 g × 30 servings = 360 g while the newer label declares 350 g.

## Relationships exercised

HAS_VARIANT, HAS_PACKAGE ×2 (360 g, 350 g), HAS_LABEL_VERSION ×2, DECLARES_COMPONENT ×10 (BLEND_TOTAL lines with amounts, BLEND_MEMBER lines with amountReferent NOT_DECLARED and parentOrderIndex, a SOURCE_INGREDIENT without amount), NAMES_RESPONSIBLE_PARTY ×2. Predicate-only: CALCULATED_SERVING_MASS_TOTAL. Kernel: Assessments as70 (D6.change-kind FORMULATION), as71 (APPLICABILITY, D6.blend-disclosure-rule). LabelVersion.hasUndeclaredBlendAmounts = true on both.

## Files

`locators.yaml` (24), `assertions.yaml`, `intent.json` (validated), `questions.md`.
