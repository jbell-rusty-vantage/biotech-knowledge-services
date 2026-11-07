---
id: "enum:PublicationKind"
kind: "enum"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L312-L325"]
aliases: ["publication kind"]
capabilities: ["get"]
cardDigest: "sha256:d702290813a1efc433bd3a2b09879ac1cffb6bab27d5c2b5fe91c87f3134b74a"
---
# Enum PublicationKind

Kind of scholarly work. Notices are their own Publications; the revision they make is REVISES.

Id `enum:PublicationKind` · module [D3](../modules/D3.md) · 12 values · used by 1 fields · raw SDL [sdl:PublicationKind](../sdl/PublicationKind.graphql)

## Values (12)

| value | description |
| --- | --- |
| `ARTICLE` |  |
| `PREPRINT` |  |
| `SYSTEMATIC_REVIEW` |  |
| `PROTOCOL` |  |
| `ANALYSIS_PLAN` |  |
| `CONFERENCE_ABSTRACT` |  |
| `CORRECTION_NOTICE` |  |
| `RETRACTION_NOTICE` |  |
| `EXPRESSION_OF_CONCERN` |  |
| `WITHDRAWAL_NOTICE` |  |
| `COMMENT` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Publication](../nodes/Publication.md).`publicationKind`
