---
id: "enum:SensingModality"
kind: "enum"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L265-L276"]
aliases: ["sensing modality"]
capabilities: ["get"]
cardDigest: "sha256:7967932d5160fa763893bca953d1277951f8b0cfc88adc93862ccdc64326e1e8"
---
# Enum SensingModality

Sensing modality (absorbs pinned Modality and Sensor).

Id `enum:SensingModality` · module [D4](../modules/D4.md) · 10 values · used by 1 fields · raw SDL [sdl:SensingModality](../sdl/SensingModality.graphql)

## Values (10)

| value | description |
| --- | --- |
| `PPG` |  |
| `ECG` |  |
| `ACCELEROMETRY` |  |
| `SKIN_TEMPERATURE` |  |
| `ELECTRODERMAL` |  |
| `BIOIMPEDANCE` |  |
| `ELECTROCHEMICAL_GLUCOSE` |  |
| `OPTICAL_ABSORBANCE` |  |
| `FLUORESCENCE` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Device](../nodes/Device.md).`sensingModalities`
