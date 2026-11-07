---
id: "enum:MeasureKind"
kind: "enum"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L210-L219"]
aliases: ["measure kind"]
capabilities: ["get"]
cardDigest: "sha256:6783c25ef6381f7ad075f0ab4ec9041c3f7e57886b86ddeca777828d8bacb16e"
---
# Enum MeasureKind

What kind of measure an outcome is (FDA COA taxonomy plus clinical events, survival and adverse events).

Id `enum:MeasureKind` · module [D3](../modules/D3.md) · 8 values · used by 1 fields · raw SDL [sdl:MeasureKind](../sdl/MeasureKind.graphql)

## Values (8)

| value | description |
| --- | --- |
| `BIOMARKER` |  |
| `PERFORMANCE_OUTCOME` |  |
| `PATIENT_REPORTED_OUTCOME` |  |
| `CLINICIAN_REPORTED_OUTCOME` |  |
| `OBSERVER_REPORTED_OUTCOME` |  |
| `CLINICAL_EVENT` |  |
| `SURVIVAL` |  |
| `ADVERSE_EVENT` |  |

Any value not listed here is not allowed in this release.

## Used by

- [OutcomeDefinition](../nodes/OutcomeDefinition.md).`measureKind`
