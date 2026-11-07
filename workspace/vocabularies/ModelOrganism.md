---
id: "enum:ModelOrganism"
kind: "enum"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D2.graphql#L80-L94"]
aliases: ["model organism"]
capabilities: ["get"]
cardDigest: "sha256:0b111379677dbfce1c7c0017b59623d33ad8f2daaad9d4cf3adc3912098f1265"
---
# Enum ModelOrganism

Organism class of an evidence context or molecular entity (replaces the pinned Species node; exact taxon in ncbiTaxonId).

Id `enum:ModelOrganism` · module [D2](../modules/D2.md) · 12 values · used by 2 fields · raw SDL [sdl:ModelOrganism](../sdl/ModelOrganism.graphql)

## Values (12)

| value | description |
| --- | --- |
| `HUMAN` |  |
| `NONHUMAN_PRIMATE` |  |
| `MOUSE` |  |
| `RAT` |  |
| `DOG` |  |
| `OTHER_MAMMAL` |  |
| `ZEBRAFISH` |  |
| `FLY` |  |
| `WORM` |  |
| `YEAST` |  |
| `OTHER` |  |
| `NOT_APPLICABLE` | Cell-free or in-silico contexts with no organism. |

Any value not listed here is not allowed in this release.

## Used by

- [MolecularEntity](../nodes/MolecularEntity.md).`organism`
- [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md).`organism`
