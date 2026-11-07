---
id: "enum:PreparationMethod"
kind: "enum"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D12.graphql#L62-L84"]
aliases: ["preparation method"]
capabilities: ["get"]
cardDigest: "sha256:230676cd47712360d6ffa326521e94822caab083d960c7b7500483166dccc2d1"
---
# Enum PreparationMethod

The preparation a reference-food record names (FDC 170027 raw vs 170030 baked). Verbatim descriptors stay in FoodItem.processingVerbatim.

Id `enum:PreparationMethod` · module [D12](../modules/D12.md) · 21 values · used by 1 fields · raw SDL [sdl:PreparationMethod](../sdl/PreparationMethod.graphql)

## Values (21)

| value | description |
| --- | --- |
| `RAW` |  |
| `BOILED` |  |
| `STEAMED` |  |
| `BAKED` |  |
| `ROASTED` |  |
| `FRIED_DEEP` |  |
| `FRIED_PAN` |  |
| `GRILLED_OR_BARBECUED` |  |
| `MICROWAVED` |  |
| `SOUS_VIDE` |  |
| `FERMENTED` |  |
| `DRIED` |  |
| `SMOKED` |  |
| `CURED` |  |
| `CANNED` |  |
| `REFINED` |  |
| `PASTEURIZED` |  |
| `STORED` |  |
| `MULTIPLE` |  |
| `OTHER` |  |
| `NOT_STATED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [FoodItem](../nodes/FoodItem.md).`preparationMethod`
