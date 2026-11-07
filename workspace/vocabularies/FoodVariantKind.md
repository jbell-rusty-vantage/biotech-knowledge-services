---
id: "enum:FoodVariantKind"
kind: "enum"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D12.graphql#L87-L95"]
aliases: ["food variant kind"]
capabilities: ["get"]
cardDigest: "sha256:5a46c280c68f008a570b2a18e92ea6611490d77bf768948709ea46d156451892"
---
# Enum FoodVariantKind

Axis on which a FoodItem differs from the base food named by its VARIANT_OF Assertion (predicate-only; pinned FoodVariantKind plus BASE for records with no base).

Id `enum:FoodVariantKind` · module [D12](../modules/D12.md) · 7 values · used by 1 fields · raw SDL [sdl:FoodVariantKind](../sdl/FoodVariantKind.graphql)

## Values (7)

| value | description |
| --- | --- |
| `BASE` |  |
| `PREPARATION` |  |
| `PROCESSING` |  |
| `CULTIVAR_OR_BREED` |  |
| `PRODUCTION_SYSTEM` |  |
| `PLANT_OR_ANIMAL_PART` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [FoodItem](../nodes/FoodItem.md).`variantKind`
