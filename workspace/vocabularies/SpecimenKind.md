---
id: "enum:SpecimenKind"
kind: "enum"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L165-L180"]
aliases: ["specimen kind"]
capabilities: ["get"]
cardDigest: "sha256:49d56dc345d191f22f643404b7c470b7d089e1965b074eedb134cd351b064c0a"
---
# Enum SpecimenKind

Specimen type (absorbs pinned Specimen; ontology ids ride beside it in specimenOntologyIds).

Id `enum:SpecimenKind` · module [D4](../modules/D4.md) · 14 values · used by 1 fields · raw SDL [sdl:SpecimenKind](../sdl/SpecimenKind.graphql)

## Values (14)

| value | description |
| --- | --- |
| `WHOLE_BLOOD` |  |
| `SERUM` |  |
| `PLASMA` |  |
| `RED_BLOOD_CELLS` |  |
| `PBMC` |  |
| `DRIED_BLOOD_SPOT` |  |
| `CAPILLARY_BLOOD` |  |
| `SALIVA` |  |
| `BUCCAL_CELLS` |  |
| `URINE` |  |
| `STOOL` |  |
| `INTERSTITIAL_FLUID` |  |
| `TISSUE_BIOPSY` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [AssayVersion](../nodes/AssayVersion.md).`specimenKinds`
