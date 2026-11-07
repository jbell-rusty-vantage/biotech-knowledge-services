---
id: "enum:SourceRevisionKind"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L421-L430"]
aliases: ["source revision kind"]
capabilities: ["get"]
cardDigest: "sha256:198de5f785bd3b2414cc78ffa4dc74cfe3ad83112b43d60ee1c194979bff7428"
---
# Enum SourceRevisionKind

Publisher revision kind: the one revision vocabulary (R-44). Types SourceSnapshot.revisionKind (capture cache), the valueString of HAS_REVISION_STATUS Assertions, D3 REVISES revisionKind and the D3 Publication.revisionStatus cache (null = none known).

Id `enum:SourceRevisionKind` · module [K](../modules/K.md) · 8 values · used by 3 fields · raw SDL [sdl:SourceRevisionKind](../sdl/SourceRevisionKind.graphql)

## Values (8)

| value | description |
| --- | --- |
| `ERRATUM` |  |
| `RETRACTION` |  |
| `EXPRESSION_OF_CONCERN` |  |
| `CORRECTED_AND_REPUBLISHED` |  |
| `NEW_VERSION` |  |
| `SILENT_CONTENT_CHANGE` |  |
| `WITHDRAWAL` |  |
| `REINSTATEMENT` |  |

Any value not listed here is not allowed in this release.

## Used by

- [SourceSnapshot](../nodes/SourceSnapshot.md).`revisionKind`
- `RevisionEdgeProperties`.`revisionKind`
- [Publication](../nodes/Publication.md).`revisionStatus`
