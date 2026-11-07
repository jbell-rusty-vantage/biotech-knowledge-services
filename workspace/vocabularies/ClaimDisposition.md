---
id: "enum:ClaimDisposition"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L481-L485"]
aliases: ["claim disposition"]
capabilities: ["get"]
cardDigest: "sha256:45d08a5b0c83b93daafe837b8c5d90910559380805b1e97b77426b4c99acc39d"
---
# Enum ClaimDisposition

Vetting disposition of a claim (00-DIRECTIVE 3.4).

Id `enum:ClaimDisposition` · module [K](../modules/K.md) · 3 values · used by 1 fields · raw SDL [sdl:ClaimDisposition](../sdl/ClaimDisposition.graphql)

## Values (3)

| value | description |
| --- | --- |
| `IGNORE` |  |
| `MONITOR` |  |
| `RESEARCH` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Assessment](../nodes/Assessment.md).`disposition`
