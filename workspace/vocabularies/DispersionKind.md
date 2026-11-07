---
id: "enum:DispersionKind"
kind: "enum"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L283-L290"]
aliases: ["dispersion kind"]
capabilities: ["get"]
cardDigest: "sha256:ffaa149f21be6ac37f0ce91efc0a40b8969da7df7cc4a9b2df27f7d97bb5858e"
---
# Enum DispersionKind

Kind of spread or interval the source reports around the estimate.

Id `enum:DispersionKind` · module [D3](../modules/D3.md) · 6 values · used by 1 fields · raw SDL [sdl:DispersionKind](../sdl/DispersionKind.graphql)

## Values (6)

| value | description |
| --- | --- |
| `CONFIDENCE_INTERVAL` |  |
| `STANDARD_DEVIATION` |  |
| `STANDARD_ERROR` |  |
| `INTERQUARTILE_RANGE` |  |
| `FULL_RANGE` |  |
| `NOT_REPORTED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [StudyResult](../nodes/StudyResult.md).`dispersionKind`
