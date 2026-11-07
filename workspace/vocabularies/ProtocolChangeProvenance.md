---
id: "enum:ProtocolChangeProvenance"
kind: "enum"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D5.graphql#L65-L72"]
aliases: ["protocol change provenance"]
capabilities: ["get"]
cardDigest: "sha256:215c5bda3ae12d33c86c9b7507448ecea82da72a6c80ad8076c1f39a4db69b8c"
---
# Enum ProtocolChangeProvenance

How a protocol edition was established (pinned ProtocolChangeProvenance, kept).

Id `enum:ProtocolChangeProvenance` · module [D5](../modules/D5.md) · 3 values · used by 1 fields · raw SDL [sdl:ProtocolChangeProvenance](../sdl/ProtocolChangeProvenance.graphql)

## Values (3)

| value | description |
| --- | --- |
| `SOURCE_VERSIONED` | The publisher versions the protocol (edition number, dated revision). |
| `SNAPSHOT_DIFF` | BellLabs observed a different canonical payload between two dated captures (pages versioned in place). |
| `THIRD_PARTY_REPORTED` | A third party reported the change. |

Any value not listed here is not allowed in this release.

## Used by

- [ProtocolEdition](../nodes/ProtocolEdition.md).`changeProvenance`
