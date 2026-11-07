---
id: "enum:AnalysisSetKind"
kind: "enum"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L182-L190"]
aliases: ["analysis set kind"]
capabilities: ["get"]
cardDigest: "sha256:fcbfcb4197382ca75047f0dccd43a1a32bcfd89e12e0cd177d264ef6dab84336"
---
# Enum AnalysisSetKind

(no description)

Id `enum:AnalysisSetKind` · module [D3](../modules/D3.md) · 7 values · used by 2 fields · raw SDL [sdl:AnalysisSetKind](../sdl/AnalysisSetKind.graphql)

## Values (7)

| value | description |
| --- | --- |
| `INTENTION_TO_TREAT` |  |
| `MODIFIED_INTENTION_TO_TREAT` |  |
| `PER_PROTOCOL` |  |
| `SAFETY_SET` |  |
| `COMPLETERS` |  |
| `OTHER` |  |
| `NOT_REPORTED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [StudyPopulation](../nodes/StudyPopulation.md).`analysisSet`
- [StudyResult](../nodes/StudyResult.md).`analysisPopulation`
