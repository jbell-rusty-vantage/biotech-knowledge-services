---
id: "enum:ActivityKind"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L433-L441"]
aliases: ["activity kind"]
capabilities: ["get"]
cardDigest: "sha256:f28507dac79c6150ca8e3ebee44a21be7fd6ca3ed78810c6c549c5c054b93f8c"
---
# Enum ActivityKind

Kind of process (00-DIRECTIVE section 4); finer steps go in Activity.operationKind.

Id `enum:ActivityKind` · module [K](../modules/K.md) · 7 values · used by 1 fields · raw SDL [sdl:ActivityKind](../sdl/ActivityKind.graphql)

## Values (7)

| value | description |
| --- | --- |
| `RESEARCH` |  |
| `INGESTION` |  |
| `VETTING` |  |
| `EVIDENCE_MISSION` |  |
| `VERIFICATION` |  |
| `PROJECTION` |  |
| `ANSWER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Activity](../nodes/Activity.md).`activityKind`
