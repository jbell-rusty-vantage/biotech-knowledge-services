---
id: "enum:SourceKind"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L404-L418"]
aliases: ["source kind"]
capabilities: ["get"]
cardDigest: "sha256:8d0e8140a1fbb5c1cd584bd06e2b7cda644470c737d04f2942ce29ec11cdaa7b"
---
# Enum SourceKind

verification.v1 SourceKindSchema (capture-level kind; the editorial kind is Source.genre).

Id `enum:SourceKind` · module [K](../modules/K.md) · 13 values · used by 1 fields · raw SDL [sdl:SourceKind](../sdl/SourceKind.graphql)

## Values (13)

| value | description |
| --- | --- |
| `WEB_PAGE` |  |
| `API` |  |
| `REPOSITORY` |  |
| `PDF` |  |
| `IMAGE` |  |
| `TABLE` |  |
| `TRANSCRIPT` |  |
| `AUDIO` |  |
| `VIDEO` |  |
| `DATASET` |  |
| `REGISTRY` |  |
| `UPLOAD` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Source](../nodes/Source.md).`sourceKind`
