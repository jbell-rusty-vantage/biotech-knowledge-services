---
id: "enum:CertaintyLevel"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L378-L384"]
aliases: ["certainty level"]
capabilities: ["get"]
cardDigest: "sha256:f907dac840faebfaa9a6ca204e5650fe8b95b0ae02b5c10da6551f3bdaf3c1cd"
---
# Enum CertaintyLevel

Certainty of a graded assessment (GRADE-style levels; scheme in Assessment.gradeScheme).

Id `enum:CertaintyLevel` · module [K](../modules/K.md) · 5 values · used by 1 fields · raw SDL [sdl:CertaintyLevel](../sdl/CertaintyLevel.graphql)

## Values (5)

| value | description |
| --- | --- |
| `HIGH` |  |
| `MODERATE` |  |
| `LOW` |  |
| `VERY_LOW` |  |
| `NOT_GRADED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Assessment](../nodes/Assessment.md).`certainty`
