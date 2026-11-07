---
id: "enum:EvidenceAuthority"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L350-L357"]
aliases: ["evidence authority"]
capabilities: ["get"]
cardDigest: "sha256:7bb7b49876037f855be181cbf9adbb6f0ec5921e51ba6f4383d0c32bc72114bb"
---
# Enum EvidenceAuthority

verification.v1 SourceAuthorityVector.authority, per evidence edge (is this source fit for this kind of claim).

Id `enum:EvidenceAuthority` · module [K](../modules/K.md) · 6 values · used by 1 fields · raw SDL [sdl:EvidenceAuthority](../sdl/EvidenceAuthority.graphql)

## Values (6)

| value | description |
| --- | --- |
| `PRIMARY` |  |
| `AUTHORITATIVE_AGGREGATOR` |  |
| `INDEPENDENT` |  |
| `SECONDARY` |  |
| `PROMOTIONAL` |  |
| `UNKNOWN` |  |

Any value not listed here is not allowed in this release.

## Used by

- `EvidenceEdgeProperties`.`authority`
