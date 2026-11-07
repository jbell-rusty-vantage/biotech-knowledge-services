---
id: "enum:MaterialGrade"
kind: "enum"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D1.graphql#L103-L109"]
aliases: ["material grade"]
capabilities: ["get"]
cardDigest: "sha256:558dc861f490ef4b6c2c37a725457b2671b5790e17d492075303463093086a6f"
---
# Enum MaterialGrade

Grade under which a material is sold (10-K: food-grade vs pharmaceutical-grade Niagen).

Id `enum:MaterialGrade` · module [D1](../modules/D1.md) · 5 values · used by 1 fields · raw SDL [sdl:MaterialGrade](../sdl/MaterialGrade.graphql)

## Values (5)

| value | description |
| --- | --- |
| `FOOD_GRADE` |  |
| `PHARMACEUTICAL_GRADE` |  |
| `COMPENDIAL` |  |
| `TECHNICAL` |  |
| `UNSPECIFIED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [IngredientMaterial](../nodes/IngredientMaterial.md).`grade`
