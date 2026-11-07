---
id: "enum:RepublicationKind"
kind: "enum"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D9.graphql#L85-L92"]
aliases: ["republication kind"]
capabilities: ["get"]
cardDigest: "sha256:a0b100cfb475d0f7ddaa66f49edc40f07df4f617369c7c32a6583e587deedf39"
---
# Enum RepublicationKind

How a work re-publishes an earlier one (the link to the original is a predicate-only REPUBLISHES Assertion); null on an original.

Id `enum:RepublicationKind` · module [D9](../modules/D9.md) · 6 values · used by 1 fields · raw SDL [sdl:RepublicationKind](../sdl/RepublicationKind.graphql)

## Values (6)

| value | description |
| --- | --- |
| `RECUT` |  |
| `CLIP` |  |
| `REPOST` |  |
| `REUPLOAD` |  |
| `COMPILATION` |  |
| `TRANSLATION` |  |

Any value not listed here is not allowed in this release.

## Used by

- [MediaWork](../nodes/MediaWork.md).`republicationKind`
