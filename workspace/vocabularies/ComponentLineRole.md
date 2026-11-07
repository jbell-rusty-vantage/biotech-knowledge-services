---
id: "enum:ComponentLineRole"
kind: "enum"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D6.graphql#L179-L190"]
aliases: ["component line role"]
capabilities: ["get"]
cardDigest: "sha256:e3c6f95e086d26240c8795c23ac0e03ebaa96ff3fb7b45337308e2dec43b1ef0"
---
# Enum ComponentLineRole

Role of one declared composition line (absorbs the pinned DeclarationKind values that are composition rows).

Id `enum:ComponentLineRole` · module [D6](../modules/D6.md) · 9 values · used by 1 fields · raw SDL [sdl:ComponentLineRole](../sdl/ComponentLineRole.graphql)

## Values (9)

| value | description |
| --- | --- |
| `ACTIVE_INGREDIENT` | Active ingredient of a drug panel (Drug Facts, prescribing information) (R-88). |
| `DIETARY_INGREDIENT` |  |
| `NUTRIENT` |  |
| `BLEND_TOTAL` |  |
| `BLEND_MEMBER` |  |
| `OTHER_INGREDIENT` |  |
| `SOURCE_INGREDIENT` |  |
| `SUB_COMPONENT` |  |
| `ENERGY` |  |

Any value not listed here is not allowed in this release.

## Used by

- `ComponentLineProperties`.`lineRole`
