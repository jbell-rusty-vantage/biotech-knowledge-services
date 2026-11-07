---
id: "enum:ControlKind"
kind: "enum"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D7.graphql#L245-L254"]
aliases: ["control kind"]
capabilities: ["get"]
cardDigest: "sha256:5e354c242b5dfb5ab848e8a3ca1cd863c65999e5a811c13f4ed1c96c4a5a3409"
---
# Enum ControlKind

Kind of control on PARENT_OF. GROUP_MEMBER_UNSPECIFIED is 'an X company' / 'entities affiliated with X' with no ownership detail; ownership-chain questions exclude it unless asked.

Id `enum:ControlKind` · module [D7](../modules/D7.md) · 8 values · used by 1 fields · raw SDL [sdl:ControlKind](../sdl/ControlKind.graphql)

## Values (8)

| value | description |
| --- | --- |
| `DIRECT_CONSOLIDATION` |  |
| `ULTIMATE_CONSOLIDATION` |  |
| `WHOLLY_OWNED` |  |
| `MAJORITY_OWNED` |  |
| `GENERAL_PARTNER_OR_MANAGING_MEMBER` |  |
| `GROUP_MEMBER_UNSPECIFIED` |  |
| `DIVISION_OR_UNIT` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- `ControlEdgeProperties`.`controlKind`
