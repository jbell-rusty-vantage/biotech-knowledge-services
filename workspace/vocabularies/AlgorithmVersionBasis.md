---
id: "enum:AlgorithmVersionBasis"
kind: "enum"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L213-L219"]
aliases: ["algorithm version basis"]
capabilities: ["get"]
cardDigest: "sha256:37cd9fe3b1661a66da7433be2ddf7bd90139a4ebc4080f99417d3c7cf1ebcd6b"
---
# Enum AlgorithmVersionBasis

Pinned AlgorithmVersionBasis plus CHANGE_EVENT_UNLABELED (a vendor-announced change with no version label, pinned by its change date).

Id `enum:AlgorithmVersionBasis` · module [D4](../modules/D4.md) · 5 values · used by 1 fields · raw SDL [sdl:AlgorithmVersionBasis](../sdl/AlgorithmVersionBasis.graphql)

## Values (5)

| value | description |
| --- | --- |
| `VENDOR_VERSION_STRING` |  |
| `PUBLICATION_VERSION` |  |
| `SERVICE_ENDPOINT_UNVERSIONED` |  |
| `CHANGE_EVENT_UNLABELED` |  |
| `UNKNOWN` |  |

Any value not listed here is not allowed in this release.

## Used by

- [AlgorithmVersion](../nodes/AlgorithmVersion.md).`versionBasis`
