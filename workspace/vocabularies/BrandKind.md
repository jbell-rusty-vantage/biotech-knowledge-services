---
id: "enum:BrandKind"
kind: "enum"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D7.graphql#L257-L263"]
aliases: ["brand kind"]
capabilities: ["get"]
cardDigest: "sha256:96a5809226c37388a98b1b3b00a57f2222c57f7e4ee673678145e645eb9e5955"
---
# Enum BrandKind

What a brand is presented on. An ingredient trade name ('Niagen', 'KSM-66') is D1 IngredientMaterial.brandName plus D8 mark ownership, not a Brand.

Id `enum:BrandKind` · module [D7](../modules/D7.md) · 5 values · used by 1 fields · raw SDL [sdl:BrandKind](../sdl/BrandKind.graphql)

## Values (5)

| value | description |
| --- | --- |
| `CONSUMER_PRODUCT` |  |
| `CLINIC_OR_SERVICE` |  |
| `FOOD_OR_RESTAURANT` |  |
| `MEDIA` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Brand](../nodes/Brand.md).`brandKind`
