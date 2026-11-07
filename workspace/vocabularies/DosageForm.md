---
id: "enum:DosageForm"
kind: "enum"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D6.graphql#L105-L118"]
aliases: ["dosage form"]
capabilities: ["get"]
cardDigest: "sha256:d46bac6bc945ebd73842d094aca8b6c13854e9476e915846a2baa0fb22ddd1f7"
---
# Enum DosageForm

Consumer-distinguishing dosage or serving form of a variant.

Id `enum:DosageForm` · module [D6](../modules/D6.md) · 12 values · used by 1 fields · raw SDL [sdl:DosageForm](../sdl/DosageForm.graphql)

## Values (12)

| value | description |
| --- | --- |
| `CAPSULE` |  |
| `SOFTGEL` |  |
| `TABLET` |  |
| `GUMMY` |  |
| `POWDER` |  |
| `STICK_PACK` |  |
| `LIQUID` |  |
| `BAR` |  |
| `MEAL_ITEM` |  |
| `DEVICE` |  |
| `KIT` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [ProductVariant](../nodes/ProductVariant.md).`dosageForm`
