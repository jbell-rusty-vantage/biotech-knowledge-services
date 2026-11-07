---
id: "enum:ConstituentKind"
kind: "enum"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D1.graphql#L151-L156"]
aliases: ["constituent kind"]
capabilities: ["get"]
cardDigest: "sha256:1bb181aaf03d9acb796a0aa8d7bd52f62c4fb770a02f7134328057d17d1bfb86"
---
# Enum ConstituentKind

Kind of Constituent (absorbs the pinned Nutrient node as NUTRIENT).

Id `enum:ConstituentKind` · module [D1](../modules/D1.md) · 4 values · used by 1 fields · raw SDL [sdl:ConstituentKind](../sdl/ConstituentKind.graphql)

## Values (4)

| value | description |
| --- | --- |
| `NUTRIENT` |  |
| `CHEMICAL_CLASS` |  |
| `ANALYTICAL_MEASURAND` |  |
| `NON_SPECIFIC_FRACTION` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Constituent](../nodes/Constituent.md).`constituentKind`
