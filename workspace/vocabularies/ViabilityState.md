---
id: "enum:ViabilityState"
kind: "enum"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D1.graphql#L143-L148"]
aliases: ["viability state"]
capabilities: ["get"]
cardDigest: "sha256:ca957c8dc01ef278b28325a6e6c2fc207a9099de2bb2c5a41d6a878e6e2c02e8"
---
# Enum ViabilityState

Viability of a microbial preparation as stated.

Id `enum:ViabilityState` · module [D1](../modules/D1.md) · 4 values · used by 1 fields · raw SDL [sdl:ViabilityState](../sdl/ViabilityState.graphql)

## Values (4)

| value | description |
| --- | --- |
| `VIABLE` |  |
| `VIABLE_SPORES` |  |
| `INACTIVATED` |  |
| `CELL_FRACTION_OR_LYSATE` |  |

Any value not listed here is not allowed in this release.

## Used by

- [IngredientMaterial](../nodes/IngredientMaterial.md).`viabilityState`
