---
id: "enum:NutrientKind"
kind: "enum"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D1.graphql#L159-L166"]
aliases: ["nutrient kind"]
capabilities: ["get"]
cardDigest: "sha256:fac9fc8381f58834b82847644edf06e93b6eaa3d949b419f9b6f46240c08fea6"
---
# Enum NutrientKind

Nutrient family (NUTRIENT constituents only).

Id `enum:NutrientKind` · module [D1](../modules/D1.md) · 6 values · used by 1 fields · raw SDL [sdl:NutrientKind](../sdl/NutrientKind.graphql)

## Values (6)

| value | description |
| --- | --- |
| `VITAMIN` |  |
| `MINERAL` |  |
| `MACRONUTRIENT` |  |
| `FATTY_ACID` |  |
| `AMINO_ACID` |  |
| `OTHER_NUTRIENT` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Constituent](../nodes/Constituent.md).`nutrientKind`
