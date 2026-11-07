---
id: "enum:PlantPart"
kind: "enum"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D1.graphql#L112-L127"]
aliases: ["plant part"]
capabilities: ["get"]
cardDigest: "sha256:62d8e0c28f793f8622e20ae62c90d61912e15706c92a45916a5b57a74143e964"
---
# Enum PlantPart

Plant or fungal part a botanical preparation is made from (21 CFR 101.36 requires it; TGA ashwagandha leaf vs root).

Id `enum:PlantPart` · module [D1](../modules/D1.md) · 14 values · used by 1 fields · raw SDL [sdl:PlantPart](../sdl/PlantPart.graphql)

## Values (14)

| value | description |
| --- | --- |
| `ROOT` |  |
| `RHIZOME` |  |
| `LEAF` |  |
| `AERIAL_PARTS` |  |
| `FLOWER` |  |
| `FRUIT` |  |
| `SEED` |  |
| `BARK` |  |
| `STEM` |  |
| `WHOLE_PLANT` |  |
| `RESIN_OR_EXUDATE` |  |
| `FRUITING_BODY` |  |
| `MYCELIUM` |  |
| `OTHER_PART` |  |

Any value not listed here is not allowed in this release.

## Used by

- [IngredientMaterial](../nodes/IngredientMaterial.md).`plantPart`
