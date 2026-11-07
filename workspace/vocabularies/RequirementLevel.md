---
id: "enum:RequirementLevel"
kind: "enum"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D5.graphql#L92-L98"]
aliases: ["requirement level"]
capabilities: ["get"]
cardDigest: "sha256:3a6dd0c35bd6ec624108099c8252ccc300fed9b8a6b418cae770cf90baed0843"
---
# Enum RequirementLevel

Pinned RequirementLevel (kept): how strongly the source requires the step (CQ-PR-02).

Id `enum:RequirementLevel` · module [D5](../modules/D5.md) · 5 values · used by 1 fields · raw SDL [sdl:RequirementLevel](../sdl/RequirementLevel.graphql)

## Values (5)

| value | description |
| --- | --- |
| `ESSENTIAL` |  |
| `RECOMMENDED` |  |
| `OPTIONAL` |  |
| `CONDITIONAL` |  |
| `NOT_STATED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [ProtocolStep](../nodes/ProtocolStep.md).`requirementLevel`
