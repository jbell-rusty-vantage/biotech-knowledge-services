---
id: "enum:EventStatus"
kind: "enum"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D13.graphql#L75-L84"]
aliases: ["event status"]
capabilities: ["get"]
cardDigest: "sha256:b84ac3de4c3c81beadea0dec40d3e5f26881f51918ea0f24f4654324b9e84731"
---
# Enum EventStatus

Materialized lifecycle of an Event from its time Assertions (never truth, never a judgment). A slip or a missed date is computed (Q-D13-11), not a status.

Id `enum:EventStatus` · module [D13](../modules/D13.md) · 4 values · used by 1 fields · raw SDL [sdl:EventStatus](../sdl/EventStatus.graphql)

## Values (4)

| value | description |
| --- | --- |
| `PLANNED` | Only EVENT_SCHEDULED assertions exist (a guided readout, a PDUFA goal date, an expected launch). |
| `IN_PROGRESS` | A durative event has started (EVENT_OCCURRED with validFrom, no validTo yet). |
| `OCCURRED` | An accepted EVENT_OCCURRED assertion exists. |
| `CANCELLED` | An accepted EVENT_CANCELLED assertion exists (the sponsor or regulator called it off). |

Any value not listed here is not allowed in this release.

## Used by

- [Event](../nodes/Event.md).`eventStatus`
