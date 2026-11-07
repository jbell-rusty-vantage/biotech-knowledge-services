---
id: "enum:PublicActorBasis"
kind: "enum"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D7.graphql#L280-L288"]
aliases: ["public actor basis"]
capabilities: ["get"]
cardDigest: "sha256:d6aa8057797a736edfee3ce86ff1e3b7dc86a628aa95e140d9d041c188054303"
---
# Enum PublicActorBasis

Why a natural person is a public actor (the privacy gate: a Person exists only in the role that makes them public).

Id `enum:PublicActorBasis` · module [D7](../modules/D7.md) · 7 values · used by 1 fields · raw SDL [sdl:PublicActorBasis](../sdl/PublicActorBasis.graphql)

## Values (7)

| value | description |
| --- | --- |
| `OFFICER_OR_DIRECTOR` |  |
| `FOUNDER_OR_INVESTOR` |  |
| `AUTHOR_OR_INVESTIGATOR` |  |
| `SPEAKER_OR_CREATOR` |  |
| `CLINICIAN_PUBLIC_COMMENTATOR` |  |
| `ENDORSER_NAMED_BY_REGULATOR` |  |
| `OTHER_PUBLIC_ROLE` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Person](../nodes/Person.md).`publicActorBasis`
