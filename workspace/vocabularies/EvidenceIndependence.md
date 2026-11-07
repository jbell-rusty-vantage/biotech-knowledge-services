---
id: "enum:EvidenceIndependence"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L360-L366"]
aliases: ["evidence independence"]
capabilities: ["get"]
cardDigest: "sha256:ad2a4562295db216847a04c12ceeebc69c992cf69489f5c439fc9ce824a1e4d2"
---
# Enum EvidenceIndependence

verification.v1 SourceAuthorityVector.independence, per evidence edge (is the source independent of the asserter and the subject).

Id `enum:EvidenceIndependence` · module [K](../modules/K.md) · 5 values · used by 1 fields · raw SDL [sdl:EvidenceIndependence](../sdl/EvidenceIndependence.graphql)

## Values (5)

| value | description |
| --- | --- |
| `INDEPENDENT` |  |
| `SAME_ORGANIZATION` |  |
| `SELF_REPORTED` |  |
| `INTERESTED_PARTY` |  |
| `UNKNOWN` |  |

Any value not listed here is not allowed in this release.

## Used by

- `EvidenceEdgeProperties`.`independence`
