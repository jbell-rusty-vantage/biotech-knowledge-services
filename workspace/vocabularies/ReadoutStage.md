---
id: "enum:ReadoutStage"
kind: "enum"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D13.graphql#L87-L93"]
aliases: ["readout stage"]
capabilities: ["get"]
cardDigest: "sha256:913c6e497c5b004a390a831dd86513583d0251171d6b31e0dcb1b0ac88ecf544"
---
# Enum ReadoutStage

Stage of a readout as the source names it (qualifier on READOUT).

Id `enum:ReadoutStage` · module [D13](../modules/D13.md) · 5 values · used by 1 fields · raw SDL [sdl:ReadoutStage](../sdl/ReadoutStage.graphql)

## Values (5)

| value | description |
| --- | --- |
| `TOPLINE` |  |
| `INTERIM` |  |
| `PRIMARY` |  |
| `FINAL` |  |
| `LONG_TERM_FOLLOW_UP` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Event](../nodes/Event.md).`readoutStage`
