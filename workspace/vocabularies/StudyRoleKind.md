---
id: "enum:StudyRoleKind"
kind: "enum"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L328-L340"]
aliases: ["study role kind"]
capabilities: ["get"]
cardDigest: "sha256:062a692769d07083dc71e190443b4b77e0d66b9bea5a733e4683b0217c1c9bbb"
---
# Enum StudyRoleKind

Role a party holds toward a study as one source states it (CTG sponsor/collaborators/responsible party, ISRCTN sponsor/funders, paper funding and acknowledgement sections). FUNDING_AWARD points at a D7 Award.

Id `enum:StudyRoleKind` · module [D3](../modules/D3.md) · 11 values · used by 1 fields · raw SDL [sdl:StudyRoleKind](../sdl/StudyRoleKind.graphql)

## Values (11)

| value | description |
| --- | --- |
| `LEAD_SPONSOR` |  |
| `SPONSOR` |  |
| `COLLABORATOR` |  |
| `FUNDER` |  |
| `FUNDING_AWARD` |  |
| `MATERIAL_PROVIDER` |  |
| `CRO` |  |
| `SITE` |  |
| `PRINCIPAL_INVESTIGATOR` |  |
| `RESPONSIBLE_PARTY` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- `StudyRoleEdgeProperties`.`roleKind`
