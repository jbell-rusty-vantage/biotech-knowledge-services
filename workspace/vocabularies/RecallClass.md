---
id: "enum:RecallClass"
kind: "enum"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L167-L172"]
aliases: ["recall class"]
capabilities: ["get"]
cardDigest: "sha256:3c28cf728fd3feb34dd9201617957b36ec47a0bb441d5780ed70296322703725"
---
# Enum RecallClass

FDA recall classification as stated by the recall record.

Id `enum:RecallClass` · module [D8](../modules/D8.md) · 4 values · used by 1 fields · raw SDL [sdl:RecallClass](../sdl/RecallClass.graphql)

## Values (4)

| value | description |
| --- | --- |
| `CLASS_I` |  |
| `CLASS_II` |  |
| `CLASS_III` |  |
| `NOT_YET_CLASSIFIED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [RegulatoryRecord](../nodes/RegulatoryRecord.md).`recallClass`
