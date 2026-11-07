---
id: "enum:StatisticalConclusion"
kind: "enum"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L256-L261"]
aliases: ["statistical conclusion"]
capabilities: ["get"]
cardDigest: "sha256:d280f7debc936f92c66f95d66f578baf63f1adf9e1e24d6b8f0166fd70b69f6e"
---
# Enum StatisticalConclusion

Statistical conclusion as stated by the source (never recomputed into this field); carries no favorable / unfavorable judgment (directive 3.2).

Id `enum:StatisticalConclusion` · module [D3](../modules/D3.md) · 4 values · used by 1 fields · raw SDL [sdl:StatisticalConclusion](../sdl/StatisticalConclusion.graphql)

## Values (4)

| value | description |
| --- | --- |
| `SIGNIFICANT` |  |
| `NOT_SIGNIFICANT` |  |
| `NOT_TESTED` |  |
| `NOT_REPORTED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [StudyResult](../nodes/StudyResult.md).`statisticalConclusion`
