---
id: "enum:ConstraintLevel"
kind: "enum"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D5.graphql#L174-L189"]
aliases: ["constraint level"]
capabilities: ["get"]
cardDigest: "sha256:7b700ad159b7beb9564d1ee6078aac107341b41ade85a35480c4b524ea6d7d1e"
---
# Enum ConstraintLevel

Directive level a source states (pinned ConstraintLevel + ADJUST_DOSE, SEPARATE_ADMINISTRATION, DISCONTINUE_BEFORE). Used typed on ProtocolStep.statedLevel; it is also the value domain of `Assertion.valueString` on the D5 safety predicates (USE_CONSTRAINED_IN, INTERACTS_WITH, HAS_UPPER_LIMIT). The level is per asserter and is never part of a UseConstraint's identity.

Id `enum:ConstraintLevel` · module [D5](../modules/D5.md) · 11 values · used by 1 fields · raw SDL [sdl:ConstraintLevel](../sdl/ConstraintLevel.graphql)

## Values (11)

| value | description |
| --- | --- |
| `CONTRAINDICATED` |  |
| `DO_NOT_EXCEED_DOSE` |  |
| `AVOID` |  |
| `NOT_RECOMMENDED` |  |
| `USE_WITH_CAUTION` |  |
| `MONITOR` |  |
| `MAINTAIN_CONSISTENT_INTAKE` |  |
| `CONSULT_CLINICIAN` |  |
| `ADJUST_DOSE` | e.g. sirolimus label: cannabidiol 'dose reduction ... should be considered'. |
| `SEPARATE_ADMINISTRATION` | e.g. bisphosphonates 'at least 2 hours before or after' magnesium; window in the assertion qualifier `window:PT2H`. |
| `DISCONTINUE_BEFORE` | e.g. 'Stop taking ... at least one month before surgery'. |

Any value not listed here is not allowed in this release.

## Used by

- [ProtocolStep](../nodes/ProtocolStep.md).`statedLevel`
