---
id: "enum:PropertyStatus"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L321-L326"]
aliases: ["property status"]
capabilities: ["get"]
cardDigest: "sha256:673c320b824c651a7cf236d6ff6eee9c7c4518f44e7a26ab900b924072c82b6b"
---
# Enum PropertyStatus

verification.v1 PropertyObservation.status, for the five orthogonal properties.

Id `enum:PropertyStatus` · module [K](../modules/K.md) · 4 values · used by 6 fields · raw SDL [sdl:PropertyStatus](../sdl/PropertyStatus.graphql)

## Values (4)

| value | description |
| --- | --- |
| `SATISFIED` |  |
| `NOT_SATISFIED` |  |
| `UNKNOWN` |  |
| `NOT_ASSESSED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Adjudication](../nodes/Adjudication.md).`evidenceSupport`
- [Adjudication](../nodes/Adjudication.md).`worldCorrectness`
- [Adjudication](../nodes/Adjudication.md).`attributionFaithfulness`
- [Adjudication](../nodes/Adjudication.md).`sourceAuthority`
- [Adjudication](../nodes/Adjudication.md).`provenanceIntegrity`
- [Report](../nodes/Report.md).`worldCorrectness`
