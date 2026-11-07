---
id: "enum:AssessmentKind"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L454-L470"]
aliases: ["assessment kind"]
capabilities: ["get"]
cardDigest: "sha256:7a51240bf17cb94e74ab588017a8bfacfd10e3759a4d32f8e4a20001a7b4895b"
---
# Enum AssessmentKind

Kind of Assessment. Domains request new values through their 11-open-questions.md; additions are additive kernel changes.

Id `enum:AssessmentKind` · module [K](../modules/K.md) · 15 values · used by 1 fields · raw SDL [sdl:AssessmentKind](../sdl/AssessmentKind.graphql)

## Values (15)

| value | description |
| --- | --- |
| `VETTING` |  |
| `INSIGHT` |  |
| `EVIDENCE_SYNTHESIS` |  |
| `SAFETY_SIGNAL` |  |
| `APPLICABILITY` |  |
| `QUALITY` |  |
| `RESOLUTION` |  |
| `EQUIVALENCE` |  |
| `SOURCE_AUTHORITY` |  |
| `RETELLING_FIDELITY` |  |
| `CONFLICT_RELEVANCE` |  |
| `COMPARABILITY` |  |
| `EVENT_IMPACT` |  |
| `BREAKTHROUGH_JUDGMENT` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Assessment](../nodes/Assessment.md).`assessmentKind`
