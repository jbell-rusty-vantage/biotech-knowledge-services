---
id: "enum:EstimateDirection"
kind: "enum"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L274-L280"]
aliases: ["estimate direction"]
capabilities: ["get"]
cardDigest: "sha256:fb4f5b3182070af8ee990955c6d1e9ad32513ac1862192334599b2cfe5207f00"
---
# Enum EstimateDirection

Direction of the reported point estimate relative to the comparator arm (BETWEEN_ARM) or to baseline (WITHIN_ARM_CHANGE): ratios against 1, differences and changes against 0. Read off the stated estimate (no recomputation of significance); NO_CHANGE only when the estimate equals the null value; UNKNOWN when no estimate is stated. For an event-risk result kind (HAZARD_RATIO, RISK_RATIO, ODDS_RATIO, RISK_DIFFERENCE, RATE, PROPORTION, ADVERSE_EVENT_COUNT) on an outcome of measureKind CLINICAL_EVENT, SURVIVAL or ADVERSE_EVENT, INCREASED means more events on the intervention (the Q-D3-05 event-risk reading, d3-event-risk-reading/v1, applied at query time); for a survival time (MEAN / MEDIAN / PERCENT_CHANGE of lifespan) INCREASED means longer survival. Never a benefit / harm verdict (directive 3.2): that is a D3.result-interpretation Assessment (effectDirection) or a D5 target assertion. Replaces the pinned OutcomeDirection (IMPROVED / WORSENED).

Id `enum:EstimateDirection` · module [D3](../modules/D3.md) · 5 values · used by 2 fields · raw SDL [sdl:EstimateDirection](../sdl/EstimateDirection.graphql)

## Values (5)

| value | description |
| --- | --- |
| `INCREASED` |  |
| `DECREASED` |  |
| `NO_CHANGE` |  |
| `MIXED` |  |
| `UNKNOWN` |  |

Any value not listed here is not allowed in this release.

## Used by

- `MechanismProjectionProperties`.`direction`
- [StudyResult](../nodes/StudyResult.md).`direction`
