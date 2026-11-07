---
id: "enum:CollectionMode"
kind: "enum"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L120-L130"]
aliases: ["collection mode"]
capabilities: ["get"]
cardDigest: "sha256:6fcedff570a5392822235c155c3a2a39a8297d44ec8ce5eef65f260548568d9f"
---
# Enum CollectionMode

How the specimen is collected.

Id `enum:CollectionMode` · module [D4](../modules/D4.md) · 9 values · used by 1 fields · raw SDL [sdl:CollectionMode](../sdl/CollectionMode.graphql)

## Values (9)

| value | description |
| --- | --- |
| `VENIPUNCTURE` |  |
| `CAPILLARY_FINGERPRICK` |  |
| `DRIED_BLOOD_SPOT` |  |
| `SALIVA` |  |
| `BUCCAL_SWAB` |  |
| `URINE` |  |
| `STOOL` |  |
| `CONTINUOUS_SENSOR` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [LabTest](../nodes/LabTest.md).`collectionModes`
