---
id: "enum:ReportItemKind"
kind: "enum"
module: "D10"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D10.graphql#L50-L53"]
aliases: ["report item kind"]
capabilities: ["get"]
cardDigest: "sha256:e7d5e0671f345a029b78ac5f6b4b01f09e8ad4431ade4243c3283e10a9fbc938"
---
# Enum ReportItemKind

Granularity of a ReportItem. Sentences are not graph nodes: they stay in the sealed report ledger (verification.v1 report_assertion with offsets) and are reached through the item's body offsets.

Id `enum:ReportItemKind` · module [D10](../modules/D10.md) · 2 values · used by 1 fields · raw SDL [sdl:ReportItemKind](../sdl/ReportItemKind.graphql)

## Values (2)

| value | description |
| --- | --- |
| `SECTION` |  |
| `ROW` |  |

Any value not listed here is not allowed in this release.

## Used by

- [ReportItem](../nodes/ReportItem.md).`itemKind`
