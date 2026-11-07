---
id: "enum:RegulatoryRecordFamily"
kind: "enum"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L63-L69"]
aliases: ["regulatory record family"]
capabilities: ["get"]
cardDigest: "sha256:c9fe63ea80d5c34b082970196b8efa1a8b942ef9da145660c62ebc9093a205b1"
---
# Enum RegulatoryRecordFamily

Coarse family of a RegulatoryRecordKind, stored for one-hop filtering (all enforcement records of a firm; all market-access records of an ingredient).

Id `enum:RegulatoryRecordFamily` · module [D8](../modules/D8.md) · 5 values · used by 1 fields · raw SDL [sdl:RegulatoryRecordFamily](../sdl/RegulatoryRecordFamily.graphql)

## Values (5)

| value | description |
| --- | --- |
| `MARKET_ACCESS` |  |
| `SCIENTIFIC_ASSESSMENT` |  |
| `PETITION` |  |
| `ENFORCEMENT` |  |
| `ADJUDICATION` |  |

Any value not listed here is not allowed in this release.

## Used by

- [RegulatoryRecord](../nodes/RegulatoryRecord.md).`recordFamily`
