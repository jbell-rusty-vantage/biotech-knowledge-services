---
id: "enum:SpecPeriod"
kind: "enum"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L265-L270"]
aliases: ["spec period"]
capabilities: ["get"]
cardDigest: "sha256:24e020b54d0b762b1185f137ecc30c35fd5d0213ef54cb821e2801cf7ccb7094"
---
# Enum SpecPeriod

Period a criterion applies to: release limit, shelf-life limit, both.

Id `enum:SpecPeriod` · module [D8](../modules/D8.md) · 4 values · used by 1 fields · raw SDL [sdl:SpecPeriod](../sdl/SpecPeriod.graphql)

## Values (4)

| value | description |
| --- | --- |
| `RELEASE` |  |
| `SHELF_LIFE` |  |
| `BOTH` |  |
| `NOT_STATED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [QualityResult](../nodes/QualityResult.md).`specPeriod`
