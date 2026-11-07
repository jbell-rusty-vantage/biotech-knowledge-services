---
id: "enum:CompartmentKind"
kind: "enum"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D2.graphql#L109-L120"]
aliases: ["compartment kind"]
capabilities: ["get"]
cardDigest: "sha256:f9e77e9dafd02e9921afcb4842fc29bc6104fb3dc1ddd05b6ad521947a161e63"
---
# Enum CompartmentKind

Kind of compartment measured (replaces the pinned AnatomicalContext and Organ nodes; exact term in compartmentOntologyId).

Id `enum:CompartmentKind` · module [D2](../modules/D2.md) · 9 values · used by 1 fields · raw SDL [sdl:CompartmentKind](../sdl/CompartmentKind.graphql)

## Values (9)

| value | description |
| --- | --- |
| `WHOLE_ORGANISM` |  |
| `ORGAN` |  |
| `TISSUE` |  |
| `CELL_TYPE` |  |
| `CELL_LINE` |  |
| `BODY_FLUID` | Blood, plasma, serum, urine, CSF: the specimen matrix a D4 Metric also names. |
| `SUBCELLULAR` |  |
| `CELL_FREE` |  |
| `NOT_REPORTED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md).`compartmentKind`
