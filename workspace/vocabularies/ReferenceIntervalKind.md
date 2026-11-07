---
id: "enum:ReferenceIntervalKind"
kind: "enum"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L232-L237"]
aliases: ["reference interval kind"]
capabilities: ["get"]
cardDigest: "sha256:7d667310393d06a67b622227572a7660e53f6e0db07ce9d4542b332db5f57e94"
---
# Enum ReferenceIntervalKind

Pinned ReferenceIntervalKind plus VENDOR_TARGET (a seller-defined 'optimal' band).

Id `enum:ReferenceIntervalKind` · module [D4](../modules/D4.md) · 4 values · used by 1 fields · raw SDL [sdl:ReferenceIntervalKind](../sdl/ReferenceIntervalKind.graphql)

## Values (4)

| value | description |
| --- | --- |
| `REFERENCE_INTERVAL` |  |
| `DECISION_LIMIT` |  |
| `GUIDELINE_TARGET` |  |
| `VENDOR_TARGET` |  |

Any value not listed here is not allowed in this release.

## Used by

- [ReferenceIntervalVersion](../nodes/ReferenceIntervalVersion.md).`intervalKind`
