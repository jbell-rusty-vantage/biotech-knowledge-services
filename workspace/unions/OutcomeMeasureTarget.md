---
id: "union:OutcomeMeasureTarget"
kind: "union"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L401-L401"]
aliases: ["outcome measure target"]
capabilities: ["get","neighbors"]
cardDigest: "sha256:a2132a35f879746cd0ff957c38d2dd076ece107ce5995f4692169712cc002f4e"
---
# Union OutcomeMeasureTarget

What an outcome definition measures: D4 metric or biomarker, D2 outcome (study-independent endpoint concept: all-cause mortality, lifespan, VO2max), D2 condition (incident disease and adverse-event terms).

Id `union:OutcomeMeasureTarget` · module [D3](../modules/D3.md) · 4 members · raw SDL [sdl:OutcomeMeasureTarget](../sdl/OutcomeMeasureTarget.graphql)

## Members

- [Metric](../nodes/Metric.md) — Purpose: the measurand or feature definition — what exactly a number is: LOINC 4548-4 (HbA1c mass fraction in blood), '…
- [Biomarker](../nodes/Biomarker.md) — Purpose: the biological referent a measurement is about (NAD+, glycated hemoglobin, IgG glycan profile, pace of biologi…
- [Outcome](../nodes/Outcome.md) — Purpose: a study-independent endpoint concept (lifespan, all-cause mortality, handgrip strength, VO2max, sleep quality)…
- [Condition](../nodes/Condition.md) — Purpose: a disease, syndrome, phenotype or risk state (conditionKind) that mechanisms are linked to and that other modu…

## Used by

- [OutcomeDefinition](../nodes/OutcomeDefinition.md).`measures`
