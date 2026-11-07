---
id: "enum:AlgorithmRealization"
kind: "enum"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L205-L210"]
aliases: ["algorithm realization"]
capabilities: ["get"]
cardDigest: "sha256:8fd0513c6263adb8f8fa01618b1bf1c76e35a4a92fbce8779349af69c486f7d8"
---
# Enum AlgorithmRealization

Which realization of an algorithm family a version is.

Id `enum:AlgorithmRealization` · module [D4](../modules/D4.md) · 4 values · used by 1 fields · raw SDL [sdl:AlgorithmRealization](../sdl/AlgorithmRealization.graphql)

## Values (4)

| value | description |
| --- | --- |
| `PUBLICATION_REFERENCE` |  |
| `VENDOR_IMPLEMENTATION` |  |
| `DEVICE_SOFTWARE` |  |
| `SERVICE_ENDPOINT` |  |

Any value not listed here is not allowed in this release.

## Used by

- [AlgorithmVersion](../nodes/AlgorithmVersion.md).`realization`
