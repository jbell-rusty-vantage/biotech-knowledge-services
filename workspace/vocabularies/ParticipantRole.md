---
id: "enum:ParticipantRole"
kind: "enum"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D2.graphql#L61-L68"]
aliases: ["participant role"]
capabilities: ["get"]
cardDigest: "sha256:c4111196f48ccfccb1bc76d357d1a994d5042ca57acf8370ef5d244fb5d5a7f9"
---
# Enum ParticipantRole

Role of a participant in a mechanism, as the reference authority states it (absorbs the pinned RegulatorySign).

Id `enum:ParticipantRole` · module [D2](../modules/D2.md) · 6 values · used by 1 fields · raw SDL [sdl:ParticipantRole](../sdl/ParticipantRole.graphql)

## Values (6)

| value | description |
| --- | --- |
| `MEMBER` |  |
| `CATALYST` |  |
| `INPUT` |  |
| `OUTPUT` |  |
| `POSITIVE_REGULATOR` |  |
| `NEGATIVE_REGULATOR` |  |

Any value not listed here is not allowed in this release.

## Used by

- `MechanismReferenceProperties`.`participantRole`
