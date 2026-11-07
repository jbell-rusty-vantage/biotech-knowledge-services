---
id: "enum:BiomarkerKind"
kind: "enum"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L60-L70"]
aliases: ["biomarker kind"]
capabilities: ["get"]
cardDigest: "sha256:0602232a63aef6a7725be6c0cc1a7e559f4625d25e1f03818f803ef28cc83877"
---
# Enum BiomarkerKind

What kind of biological referent a Biomarker is.

Id `enum:BiomarkerKind` · module [D4](../modules/D4.md) · 9 values · used by 1 fields · raw SDL [sdl:BiomarkerKind](../sdl/BiomarkerKind.graphql)

## Values (9)

| value | description |
| --- | --- |
| `METABOLITE` |  |
| `PROTEIN` |  |
| `PROTEIN_MODIFICATION` |  |
| `CELL_POPULATION` |  |
| `DNA_METHYLATION_PATTERN` |  |
| `GLYCAN_PROFILE` |  |
| `PHYSIOLOGICAL_SIGNAL` |  |
| `COMPOSITE_AGING_INDEX` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Biomarker](../nodes/Biomarker.md).`biomarkerKind`
