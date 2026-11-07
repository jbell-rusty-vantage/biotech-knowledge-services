---
id: "enum:CertificationListingStatus"
kind: "enum"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L290-L296"]
aliases: ["certification listing status"]
capabilities: ["get"]
cardDigest: "sha256:600ca3e695e3d3943215dfe699e67a163bb0236afc64a250902a491839acc115"
---
# Enum CertificationListingStatus

Certifier listing status, latest observed (history is COVERS episodes plus snapshots).

Id `enum:CertificationListingStatus` · module [D8](../modules/D8.md) · 5 values · used by 1 fields · raw SDL [sdl:CertificationListingStatus](../sdl/CertificationListingStatus.graphql)

## Values (5)

| value | description |
| --- | --- |
| `LISTED` |  |
| `SUSPENDED` |  |
| `WITHDRAWN` |  |
| `EXPIRED` |  |
| `NOT_FOUND` |  |

Any value not listed here is not allowed in this release.

## Used by

- [CertificationListing](../nodes/CertificationListing.md).`status`
