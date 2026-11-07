---
id: "enum:GenerationMode"
kind: "enum"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D9.graphql#L95-L100"]
aliases: ["generation mode"]
capabilities: ["get"]
cardDigest: "sha256:7f14b996e436bd1117784deb0bcbbf7e5a6cb9133e6d3b8b9c764bb406ea18e3"
---
# Enum GenerationMode

How an image or text was produced, as stated by the source (Q-D9-17); never a quality judgment.

Id `enum:GenerationMode` · module [D9](../modules/D9.md) · 4 values · used by 1 fields · raw SDL [sdl:GenerationMode](../sdl/GenerationMode.graphql)

## Values (4)

| value | description |
| --- | --- |
| `AUTHORED_OR_CAPTURED` |  |
| `AI_GENERATED` |  |
| `AI_ASSISTED` |  |
| `UNKNOWN` |  |

Any value not listed here is not allowed in this release.

## Used by

- [MediaWork](../nodes/MediaWork.md).`generationMode`
