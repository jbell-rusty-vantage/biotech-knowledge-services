---
id: "enum:SubstanceClass"
kind: "enum"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D1.graphql#L72-L81"]
aliases: ["substance class"]
capabilities: ["get"]
cardDigest: "sha256:efe63f548351839a713aa0db7838941b2d069f80d88e396f44a6d5aea4f2e0cc"
---
# Enum SubstanceClass

FDA GSRS substance class of the defining record (structurally diverse covers plant parts and extracts GSRS registers, e.g. WITHANIA SOMNIFERA ROOT).

Id `enum:SubstanceClass` · module [D1](../modules/D1.md) · 8 values · used by 1 fields · raw SDL [sdl:SubstanceClass](../sdl/SubstanceClass.graphql)

## Values (8)

| value | description |
| --- | --- |
| `CHEMICAL` |  |
| `PROTEIN` |  |
| `NUCLEIC_ACID` |  |
| `POLYMER` |  |
| `STRUCTURALLY_DIVERSE` |  |
| `MIXTURE` |  |
| `CONCEPT` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [ChemicalSubstance](../nodes/ChemicalSubstance.md).`substanceClass`
