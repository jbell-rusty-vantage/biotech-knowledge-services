---
id: "enum:OutcomePriority"
kind: "enum"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L200-L207"]
aliases: ["outcome priority"]
capabilities: ["get"]
cardDigest: "sha256:42cd15973750c5d831ab575982335521ee48c79099127a676b20fddd1f16967b"
---
# Enum OutcomePriority

Priority one source declares for an outcome (registry version or publication).

Id `enum:OutcomePriority` · module [D3](../modules/D3.md) · 6 values · used by 1 fields · raw SDL [sdl:OutcomePriority](../sdl/OutcomePriority.graphql)

## Values (6)

| value | description |
| --- | --- |
| `PRIMARY` |  |
| `SECONDARY` |  |
| `OTHER_PRESPECIFIED` |  |
| `EXPLORATORY` |  |
| `POST_HOC` |  |
| `SAFETY` |  |

Any value not listed here is not allowed in this release.

## Used by

- [OutcomeDefinition](../nodes/OutcomeDefinition.md).`priority`
