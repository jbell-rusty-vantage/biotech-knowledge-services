---
id: "enum:OutcomeKind"
kind: "enum"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D2.graphql#L153-L160"]
aliases: ["outcome kind"]
capabilities: ["get"]
cardDigest: "sha256:6d2ab523a61b4c74e1b667bf9efd7208c9e79abda407d0f7177ec964ae594822"
---
# Enum OutcomeKind

Kind of Outcome concept (study-independent endpoint concept; study-specific measures are D3 OutcomeDefinitions).

Id `enum:OutcomeKind` · module [D2](../modules/D2.md) · 6 values · used by 1 fields · raw SDL [sdl:OutcomeKind](../sdl/OutcomeKind.graphql)

## Values (6)

| value | description |
| --- | --- |
| `SURVIVAL` |  |
| `CLINICAL_EVENT` |  |
| `FUNCTIONAL_PERFORMANCE` |  |
| `PATIENT_REPORTED` |  |
| `PHYSIOLOGICAL_STATE` |  |
| `COMPOSITE` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Outcome](../nodes/Outcome.md).`outcomeKind`
