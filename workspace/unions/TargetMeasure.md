---
id: "union:TargetMeasure"
kind: "union"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D5.graphql#L221-L221"]
aliases: ["target measure"]
capabilities: ["get","neighbors"]
cardDigest: "sha256:2cecf37e900da320eed1ae72cbadfbc3725abb7d0843616f70b26f94cca89b11"
---
# Union TargetMeasure

How progress toward a Target is measured (OPERATIONALIZED_BY): D4 Biomarker, D4 Metric, D2 Outcome (a study-independent endpoint concept such as all-cause mortality or handgrip strength, the node D3 OutcomeDefinitions MEASURE), or D2 Condition (incidence of this condition measures the target; the direction lives in the vocab-targets rule). D2.Outcome added in the check stage at D2's request (D2 11-open-questions item 27); D2.Condition added in synthesis (R-70: condition-coded outcomes reach a Target through a typed member, not a shared Identifier; the pair is value 1 and carries a fixture request). 4 members.

Id `union:TargetMeasure` · module [D5](../modules/D5.md) · 4 members · raw SDL [sdl:TargetMeasure](../sdl/TargetMeasure.graphql)

## Members

- [Biomarker](../nodes/Biomarker.md) — Purpose: the biological referent a measurement is about (NAD+, glycated hemoglobin, IgG glycan profile, pace of biologi…
- [Metric](../nodes/Metric.md) — Purpose: the measurand or feature definition — what exactly a number is: LOINC 4548-4 (HbA1c mass fraction in blood), '…
- [Outcome](../nodes/Outcome.md) — Purpose: a study-independent endpoint concept (lifespan, all-cause mortality, handgrip strength, VO2max, sleep quality)…
- [Condition](../nodes/Condition.md) — Purpose: a disease, syndrome, phenotype or risk state (conditionKind) that mechanisms are linked to and that other modu…

## Used by

- [Target](../nodes/Target.md).`operationalizedBy`
