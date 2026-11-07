---
id: "enum:DeviceKind"
kind: "enum"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L251-L262"]
aliases: ["device kind"]
capabilities: ["get"]
cardDigest: "sha256:3bd5693415d9685f4363d77e0f6c0994f1cab4527050bcca285627a05012c360"
---
# Enum DeviceKind

Kind of device or instrument MODEL (absorbs pinned ToolOrInstrument).

Id `enum:DeviceKind` · module [D4](../modules/D4.md) · 10 values · used by 1 fields · raw SDL [sdl:DeviceKind](../sdl/DeviceKind.graphql)

## Values (10)

| value | description |
| --- | --- |
| `WEARABLE_RING` |  |
| `WEARABLE_WRIST` |  |
| `WEARABLE_CHEST_STRAP` |  |
| `CGM_SENSOR` |  |
| `HOME_METER` |  |
| `SMART_SCALE` |  |
| `LAB_ANALYZER` |  |
| `ARRAY_SCANNER` |  |
| `SEQUENCER` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Device](../nodes/Device.md).`deviceKind`
