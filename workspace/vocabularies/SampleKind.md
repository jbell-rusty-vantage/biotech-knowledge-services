---
id: "enum:SampleKind"
kind: "enum"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L281-L287"]
aliases: ["sample kind"]
capabilities: ["get"]
cardDigest: "sha256:639b0e3c5aab3cc97ccc3e74959ef99ad7706471e6c38c7622f3fa99dedba949"
---
# Enum SampleKind

What was tested (replaces pinned TestSample node type).

Id `enum:SampleKind` · module [D8](../modules/D8.md) · 5 values · used by 1 fields · raw SDL [sdl:SampleKind](../sdl/SampleKind.graphql)

## Values (5)

| value | description |
| --- | --- |
| `LOT_RETAIN` |  |
| `RETAIL_PURCHASE` |  |
| `INGREDIENT_MATERIAL` |  |
| `FINISHED_PRODUCT_UNSPECIFIED` |  |
| `NOT_STATED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [QualityResult](../nodes/QualityResult.md).`sampleKind`
