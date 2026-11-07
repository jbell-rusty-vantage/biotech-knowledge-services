---
id: "enum:MetricKind"
kind: "enum"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L73-L79"]
aliases: ["metric kind"]
capabilities: ["get"]
cardDigest: "sha256:71430b7d1b8acf9b80597deb94e14f08ffb48f6c8e58ef1147a2c6c59fa160e8"
---
# Enum MetricKind

What a Metric defines: a terminology measurand, an algorithm output, a device estimate, a calculated quantity or a model feature.

Id `enum:MetricKind` · module [D4](../modules/D4.md) · 5 values · used by 1 fields · raw SDL [sdl:MetricKind](../sdl/MetricKind.graphql)

## Values (5)

| value | description |
| --- | --- |
| `MEASURAND` |  |
| `ALGORITHM_OUTPUT` |  |
| `DEVICE_ESTIMATE` |  |
| `CALCULATED_QUANTITY` |  |
| `MODEL_FEATURE` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Metric](../nodes/Metric.md).`metricKind`
