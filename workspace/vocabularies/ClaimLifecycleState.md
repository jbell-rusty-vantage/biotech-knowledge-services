---
id: "enum:ClaimLifecycleState"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L488-L495"]
aliases: ["claim lifecycle state"]
capabilities: ["get"]
cardDigest: "sha256:1a1cd7c85a35e5aabb22e0582dd7d8f704ed52e3d18eff0bbc7f3fd4c19f2f87"
---
# Enum ClaimLifecycleState

Projection cache of where a Claim is in the scientific loop; authority is its Assessments and Reports.

Id `enum:ClaimLifecycleState` · module [K](../modules/K.md) · 6 values · used by 1 fields · raw SDL [sdl:ClaimLifecycleState](../sdl/ClaimLifecycleState.graphql)

## Values (6)

| value | description |
| --- | --- |
| `EXTRACTED` |  |
| `IGNORED` |  |
| `MONITORED` |  |
| `QUEUED_FOR_RESEARCH` |  |
| `UNDER_RESEARCH` |  |
| `REPORTED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Claim](../nodes/Claim.md).`lifecycleState`
