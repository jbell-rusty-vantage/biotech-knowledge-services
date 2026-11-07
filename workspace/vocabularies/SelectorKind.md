---
id: "enum:SelectorKind"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L387-L401"]
aliases: ["selector kind"]
capabilities: ["get"]
cardDigest: "sha256:e70da3d56bc071a4bd26cd06f977d668ca4e28d565d4bc5ebdd02b195506dac6"
---
# Enum SelectorKind

verification.v1 selector kinds (VerificationSelectorKindSchema), one SourceLocator each.

Id `enum:SelectorKind` · module [K](../modules/K.md) · 13 values · used by 1 fields · raw SDL [sdl:SelectorKind](../sdl/SelectorKind.graphql)

## Values (13)

| value | description |
| --- | --- |
| `TEXT_QUOTE` |  |
| `CHARACTER_POSITION` |  |
| `MULTI_FRAGMENT_TEXT` |  |
| `JSON_POINTER` |  |
| `HTML` |  |
| `PDF_TEXT` |  |
| `BOUNDING_BOX` |  |
| `TABLE` |  |
| `MEDIA_TIMECODE` |  |
| `REPOSITORY` |  |
| `DATASET` |  |
| `API_RECORD` |  |
| `WHOLE_SNAPSHOT` |  |

Any value not listed here is not allowed in this release.

## Used by

- [SourceLocator](../nodes/SourceLocator.md).`selectorKind`
