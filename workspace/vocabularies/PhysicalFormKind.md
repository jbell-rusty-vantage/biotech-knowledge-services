---
id: "enum:PhysicalFormKind"
kind: "enum"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D1.graphql#L95-L100"]
aliases: ["physical form kind"]
capabilities: ["get"]
cardDigest: "sha256:ee06a2b4bcdd32600c248791296f80f0f64c51a1501b56c6b55141f213305af4"
---
# Enum PhysicalFormKind

Physical (solid-state or particle) form the structure authority does not register as a separate substance (absorbs the pinned ChemicalForm node).

Id `enum:PhysicalFormKind` · module [D1](../modules/D1.md) · 4 values · used by 1 fields · raw SDL [sdl:PhysicalFormKind](../sdl/PhysicalFormKind.graphql)

## Values (4)

| value | description |
| --- | --- |
| `CRYSTAL_FORM` |  |
| `AMORPHOUS_FORM` |  |
| `PARTICLE_SIZE_GRADE` |  |
| `OTHER_PHYSICAL_FORM` |  |

Any value not listed here is not allowed in this release.

## Used by

- [IngredientMaterial](../nodes/IngredientMaterial.md).`physicalForm`
