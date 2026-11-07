---
id: "enum:DietaryPatternKind"
kind: "enum"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D12.graphql#L123-L128"]
aliases: ["dietary pattern kind"]
capabilities: ["get"]
cardDigest: "sha256:e5dbc204b7fc9cb816dcfcbef9b13616a97f5863346cf50bed67216bd58cbe0b"
---
# Enum DietaryPatternKind

What a dietary pattern constrains.

Id `enum:DietaryPatternKind` · module [D12](../modules/D12.md) · 4 values · used by 1 fields · raw SDL [sdl:DietaryPatternKind](../sdl/DietaryPatternKind.graphql)

## Values (4)

| value | description |
| --- | --- |
| `COMPOSITION` |  |
| `TIMING` |  |
| `ENERGY_RESTRICTION` |  |
| `MIXED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [DietaryPattern](../nodes/DietaryPattern.md).`patternKind`
