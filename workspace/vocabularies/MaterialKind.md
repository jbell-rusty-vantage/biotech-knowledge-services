---
id: "enum:MaterialKind"
kind: "enum"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D1.graphql#L84-L92"]
aliases: ["material kind"]
capabilities: ["get"]
cardDigest: "sha256:e02cc9ddfcb1a38706362cbe535ed515866aaf848c4c058995e8bccdbf9b57e3"
---
# Enum MaterialKind

What kind of actual material an IngredientMaterial is (absorbs the pinned Branded/Botanical/Microbial/Mixture subtypes; branded = brandName set).

Id `enum:MaterialKind` · module [D1](../modules/D1.md) · 7 values · used by 1 fields · raw SDL [sdl:MaterialKind](../sdl/MaterialKind.graphql)

## Values (7)

| value | description |
| --- | --- |
| `CHEMICALLY_DEFINED` |  |
| `BOTANICAL_PREPARATION` |  |
| `MICROBIAL_PREPARATION` |  |
| `MATERIAL_MIXTURE` |  |
| `PROTEIN_OR_ENZYME` |  |
| `UNRESOLVED` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [IngredientMaterial](../nodes/IngredientMaterial.md).`materialKind`
