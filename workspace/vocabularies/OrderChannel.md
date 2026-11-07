---
id: "enum:OrderChannel"
kind: "enum"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L112-L117"]
aliases: ["order channel"]
capabilities: ["get"]
cardDigest: "sha256:3492a4154c108deec363c36f7f763fcaf0a546dc3cc669a01c038e399647e3d2"
---
# Enum OrderChannel

How a test is ordered.

Id `enum:OrderChannel` · module [D4](../modules/D4.md) · 4 values · used by 1 fields · raw SDL [sdl:OrderChannel](../sdl/OrderChannel.graphql)

## Values (4)

| value | description |
| --- | --- |
| `CLINICIAN_ORDERED` |  |
| `DIRECT_TO_CONSUMER` |  |
| `BOTH` |  |
| `RESEARCH_USE_ONLY` |  |

Any value not listed here is not allowed in this release.

## Used by

- [LabTest](../nodes/LabTest.md).`orderChannel`
