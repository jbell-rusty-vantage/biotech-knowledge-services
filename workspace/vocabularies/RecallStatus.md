---
id: "enum:RecallStatus"
kind: "enum"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L175-L180"]
aliases: ["recall status"]
capabilities: ["get"]
cardDigest: "sha256:14d7c1f22a933f45cec5dffbb6495dd19349c1c556542356fa9a7961ddb24960"
---
# Enum RecallStatus

Recall status as last stated by the recall record (openFDA `status`).

Id `enum:RecallStatus` · module [D8](../modules/D8.md) · 4 values · used by 1 fields · raw SDL [sdl:RecallStatus](../sdl/RecallStatus.graphql)

## Values (4)

| value | description |
| --- | --- |
| `ONGOING` |  |
| `COMPLETED` |  |
| `TERMINATED` |  |
| `PENDING` |  |

Any value not listed here is not allowed in this release.

## Used by

- [RegulatoryRecord](../nodes/RegulatoryRecord.md).`recallStatus`
