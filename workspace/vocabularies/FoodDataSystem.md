---
id: "enum:FoodDataSystem"
kind: "enum"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D12.graphql#L98-L108"]
aliases: ["food data system"]
capabilities: ["get"]
cardDigest: "sha256:b7f16b266eb0890d2ef374bc16d0b72881600c251aa9c2922c507aa13bec05ac"
---
# Enum FoodDataSystem

The reference system that defines a FoodItem record. Branded/GTIN records (FDC Branded Foods, Open Food Facts) are D6 Products, not FoodItems.

Id `enum:FoodDataSystem` · module [D12](../modules/D12.md) · 9 values · used by 1 fields · raw SDL [sdl:FoodDataSystem](../sdl/FoodDataSystem.graphql)

## Values (9)

| value | description |
| --- | --- |
| `FDC_FOUNDATION` |  |
| `FDC_SR_LEGACY` |  |
| `FDC_SURVEY_FNDDS` |  |
| `FDC_EXPERIMENTAL` |  |
| `PHENOL_EXPLORER` |  |
| `FOODON` |  |
| `NATIONAL_COMPOSITION_TABLE` |  |
| `CURATED` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [FoodItem](../nodes/FoodItem.md).`definingSystem`
