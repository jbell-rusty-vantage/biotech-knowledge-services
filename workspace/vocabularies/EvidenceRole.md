---
id: "enum:EvidenceRole"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L336-L341"]
aliases: ["evidence role"]
capabilities: ["get"]
cardDigest: "sha256:b9b118ec65bc3ea8ea8c2ae45d31821a64dc74785e501363eb661291a4ce2cb2"
---
# Enum EvidenceRole

verification.v1 EvidenceRoleSchema.

Id `enum:EvidenceRole` · module [K](../modules/K.md) · 4 values · used by 1 fields · raw SDL [sdl:EvidenceRole](../sdl/EvidenceRole.graphql)

## Values (4)

| value | description |
| --- | --- |
| `SUPPORTS` |  |
| `CONTRADICTS` |  |
| `QUALIFIES` |  |
| `CONTEXT` |  |

Any value not listed here is not allowed in this release.

## Used by

- `EvidenceEdgeProperties`.`role`
