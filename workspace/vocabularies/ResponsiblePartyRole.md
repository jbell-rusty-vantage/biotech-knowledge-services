---
id: "enum:ResponsiblePartyRole"
kind: "enum"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D6.graphql#L168-L176"]
aliases: ["responsible party role"]
capabilities: ["get"]
cardDigest: "sha256:f16c6a3348de6912df1852b96ad79668c6b54b4dc35267c5a698d71c8ebee68f"
---
# Enum ResponsiblePartyRole

Role the label prints for the responsible party ('Distributed by', 'Manufactured for', ...).

Id `enum:ResponsiblePartyRole` · module [D6](../modules/D6.md) · 7 values · used by 1 fields · raw SDL [sdl:ResponsiblePartyRole](../sdl/ResponsiblePartyRole.graphql)

## Values (7)

| value | description |
| --- | --- |
| `MANUFACTURED_BY` |  |
| `MANUFACTURED_FOR` |  |
| `DISTRIBUTED_BY` |  |
| `PACKED_FOR` |  |
| `IMPORTED_BY` |  |
| `MARKETED_BY` |  |
| `UNSTATED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [LabelVersion](../nodes/LabelVersion.md).`responsiblePartyRole`
