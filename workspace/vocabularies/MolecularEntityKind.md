---
id: "enum:MolecularEntityKind"
kind: "enum"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D2.graphql#L71-L77"]
aliases: ["molecular entity kind"]
capabilities: ["get"]
cardDigest: "sha256:e78a55d498d8deabfb9999906c97686327a137ed9ee6553f55f3a69311896518"
---
# Enum MolecularEntityKind

Kind of molecular entity. Endogenous small molecules (NAD+, NAAD) are not here: they are D1 ChemicalSubstances.

Id `enum:MolecularEntityKind` · module [D2](../modules/D2.md) · 5 values · used by 1 fields · raw SDL [sdl:MolecularEntityKind](../sdl/MolecularEntityKind.graphql)

## Values (5)

| value | description |
| --- | --- |
| `GENE` |  |
| `PROTEIN` |  |
| `PROTEIN_COMPLEX` |  |
| `PROTEIN_FAMILY` |  |
| `NCRNA` |  |

Any value not listed here is not allowed in this release.

## Used by

- [MolecularEntity](../nodes/MolecularEntity.md).`entityKind`
