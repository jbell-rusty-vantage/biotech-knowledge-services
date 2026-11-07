---
id: "enum:LabTestKind"
kind: "enum"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L105-L109"]
aliases: ["lab test kind"]
capabilities: ["get"]
cardDigest: "sha256:e91b3a08e1c341cf1c1adbbacf0633b90dbe770958a55de68ada7ef26583df1f"
---
# Enum LabTestKind

An orderable/purchasable test as offered: one analyte, a panel of tests, or a report computed by algorithms.

Id `enum:LabTestKind` · module [D4](../modules/D4.md) · 3 values · used by 1 fields · raw SDL [sdl:LabTestKind](../sdl/LabTestKind.graphql)

## Values (3)

| value | description |
| --- | --- |
| `SINGLE` |  |
| `PANEL` |  |
| `ALGORITHM_REPORT` |  |

Any value not listed here is not allowed in this release.

## Used by

- [LabTest](../nodes/LabTest.md).`testKind`
