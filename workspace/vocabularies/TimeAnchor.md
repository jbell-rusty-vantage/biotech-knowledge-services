---
id: "enum:TimeAnchor"
kind: "enum"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D5.graphql#L108-L122"]
aliases: ["time anchor"]
capabilities: ["get"]
cardDigest: "sha256:8368d40e234684bcf93789ca14fb1763134970805f61f9868fc8c3a7b83fb281"
---
# Enum TimeAnchor

Anchor a step's timing is relative to (pinned TimeOfDay, renamed; offsets in offsetMinutesMin/Max, negative = before).

Id `enum:TimeAnchor` · module [D5](../modules/D5.md) · 13 values · used by 1 fields · raw SDL [sdl:TimeAnchor](../sdl/TimeAnchor.graphql)

## Values (13)

| value | description |
| --- | --- |
| `UPON_WAKING` |  |
| `MORNING` |  |
| `AFTERNOON` |  |
| `EVENING` |  |
| `BEDTIME` |  |
| `PRE_MEAL` |  |
| `WITH_MEAL` |  |
| `POST_MEAL` |  |
| `FASTED` |  |
| `PRE_EXERCISE` |  |
| `POST_EXERCISE` |  |
| `ANYTIME` |  |
| `NOT_STATED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [ProtocolStep](../nodes/ProtocolStep.md).`timeAnchor`
