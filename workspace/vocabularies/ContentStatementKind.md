---
id: "enum:ContentStatementKind"
kind: "enum"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D1.graphql#L215-L222"]
aliases: ["content statement kind"]
capabilities: ["get"]
cardDigest: "sha256:03c011a63968e29392c3b29749eef8c6e38c9ae5f12690e74514df559b2c73b5"
---
# Enum ContentStatementKind

What kind of content statement a MATERIAL_CONTAINS episode records (declared vs measured vs calculated stay distinct).

Id `enum:ContentStatementKind` · module [D1](../modules/D1.md) · 6 values · used by 2 fields · raw SDL [sdl:ContentStatementKind](../sdl/ContentStatementKind.graphql)

## Values (6)

| value | description |
| --- | --- |
| `STANDARDIZATION_CLAIM` |  |
| `DEFINITIONAL_COMPOSITION` |  |
| `TYPICAL_COMPOSITION_REPORTED` |  |
| `MEASURED_IN_SAMPLE` |  |
| `QUALITATIVE_PROVIDES` |  |
| `CALCULATED` |  |

Any value not listed here is not allowed in this release.

## Used by

- `ContentEdgeProperties`.`statementKind`
- `FoodContentProperties`.`statementKind`
