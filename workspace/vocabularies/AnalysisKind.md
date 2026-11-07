---
id: "enum:AnalysisKind"
kind: "enum"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L240-L247"]
aliases: ["analysis kind"]
capabilities: ["get"]
cardDigest: "sha256:899a372ed3b9846459b47eb4eceb71238ef0099bcd4d4b803c99eaffa883d483"
---
# Enum AnalysisKind

Confirmatory status of an analysis as the stating source declares it.

Id `enum:AnalysisKind` · module [D3](../modules/D3.md) · 6 values · used by 1 fields · raw SDL [sdl:AnalysisKind](../sdl/AnalysisKind.graphql)

## Values (6)

| value | description |
| --- | --- |
| `PRIMARY_PRESPECIFIED` |  |
| `SECONDARY_PRESPECIFIED` |  |
| `SUBGROUP_PRESPECIFIED` |  |
| `SUBGROUP_POST_HOC` |  |
| `EXPLORATORY` |  |
| `SAFETY` |  |

Any value not listed here is not allowed in this release.

## Used by

- [StudyResult](../nodes/StudyResult.md).`analysisKind`
