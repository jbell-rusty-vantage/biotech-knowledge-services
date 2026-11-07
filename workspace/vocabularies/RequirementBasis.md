---
id: "enum:RequirementBasis"
kind: "enum"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D5.graphql#L101-L105"]
aliases: ["requirement basis"]
capabilities: ["get"]
cardDigest: "sha256:1f41bb74226567be7b250782bd5f1fa66793797b83dcf57345aca43adab1c46d"
---
# Enum RequirementBasis

Pinned RequirementBasis (kept): who decided the requirement level.

Id `enum:RequirementBasis` · module [D5](../modules/D5.md) · 3 values · used by 1 fields · raw SDL [sdl:RequirementBasis](../sdl/RequirementBasis.graphql)

## Values (3)

| value | description |
| --- | --- |
| `STATED_BY_SOURCE` |  |
| `EDITORIAL_INFERENCE` |  |
| `NOT_STATED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [ProtocolStep](../nodes/ProtocolStep.md).`requirementBasis`
