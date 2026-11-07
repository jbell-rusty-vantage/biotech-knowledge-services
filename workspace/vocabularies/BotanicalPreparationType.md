---
id: "enum:BotanicalPreparationType"
kind: "enum"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D1.graphql#L130-L140"]
aliases: ["botanical preparation type"]
capabilities: ["get"]
cardDigest: "sha256:e630631cb5d29f04a1ddc8dea4988560379a35fa9f38afd39f5aa139afbc2fc7"
---
# Enum BotanicalPreparationType

Preparation type of a botanical material (Ph. Eur. / EMA herbal preparation categories; LNHPD extract_type_desc).

Id `enum:BotanicalPreparationType` · module [D1](../modules/D1.md) · 9 values · used by 1 fields · raw SDL [sdl:BotanicalPreparationType](../sdl/BotanicalPreparationType.graphql)

## Values (9)

| value | description |
| --- | --- |
| `POWDERED_HERBAL_SUBSTANCE` |  |
| `DRY_EXTRACT` |  |
| `SOFT_EXTRACT` |  |
| `LIQUID_EXTRACT` |  |
| `TINCTURE` |  |
| `ESSENTIAL_OIL` |  |
| `FATTY_OIL` |  |
| `EXPRESSED_JUICE` |  |
| `OTHER_PREPARATION` |  |

Any value not listed here is not allowed in this release.

## Used by

- [IngredientMaterial](../nodes/IngredientMaterial.md).`preparationType`
