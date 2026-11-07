---
id: "enum:EvidenceFacet"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L369-L375"]
aliases: ["evidence facet"]
capabilities: ["get"]
cardDigest: "sha256:bf27cb16055a681b9232a02ff39c8e8d776d4d85a0a26d5a2c874b9bdceb161d"
---
# Enum EvidenceFacet

verification.v1 VerificationMetricObservation evidence binding facet (which part of a metric the span evidences).

Id `enum:EvidenceFacet` · module [K](../modules/K.md) · 5 values · used by 1 fields · raw SDL [sdl:EvidenceFacet](../sdl/EvidenceFacet.graphql)

## Values (5)

| value | description |
| --- | --- |
| `VALUE` |  |
| `UNIT` |  |
| `IDENTITY` |  |
| `PERIOD_START` |  |
| `PERIOD_END` |  |

Any value not listed here is not allowed in this release.

## Used by

- `EvidenceEdgeProperties`.`facet`
