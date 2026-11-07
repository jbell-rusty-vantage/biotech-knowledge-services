---
id: "enum:TargetStatus"
kind: "enum"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D5.graphql#L59-L62"]
aliases: ["target status"]
capabilities: ["get"]
cardDigest: "sha256:6f67b02591437c020f9d524628a5ad07ac17de4864dd1df2e2066fb5ae87ff5c"
---
# Enum TargetStatus

Lifecycle of a vocabulary target (vocab-targets.yaml); a deprecated target keeps its node and names `replacedBy`.

Id `enum:TargetStatus` · module [D5](../modules/D5.md) · 2 values · used by 1 fields · raw SDL [sdl:TargetStatus](../sdl/TargetStatus.graphql)

## Values (2)

| value | description |
| --- | --- |
| `ACTIVE` |  |
| `DEPRECATED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Target](../nodes/Target.md).`status`
