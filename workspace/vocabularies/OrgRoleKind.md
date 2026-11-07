---
id: "enum:OrgRoleKind"
kind: "enum"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D7.graphql#L176-L189"]
aliases: ["org role kind"]
capabilities: ["get"]
cardDigest: "sha256:0c7cdb2e600808a35eec976b8e2b800c3f95c5e868d158bd4c6f0a85d606daed"
---
# Enum OrgRoleKind

Normalized role kind on HOLDS_ROLE (source codes such as Sinclair's F/A/B, SEC 'Director' / 'Executive Officer' / 'Promoter', ICMJE items map here; the printed code stays in the authorizing Assertion's qualifier roleText:, R-30).

Id `enum:OrgRoleKind` · module [D7](../modules/D7.md) · 12 values · used by 1 fields · raw SDL [sdl:OrgRoleKind](../sdl/OrgRoleKind.graphql)

## Values (12)

| value | description |
| --- | --- |
| `FOUNDER` |  |
| `DIRECTOR` |  |
| `CHAIR` |  |
| `BOARD_OBSERVER` |  |
| `EXECUTIVE_OFFICER` |  |
| `EMPLOYEE` |  |
| `ADVISOR` |  |
| `CONSULTANT` |  |
| `MANAGING_MEMBER_OR_GENERAL_PARTNER` |  |
| `PROMOTER` |  |
| `EDITOR` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- `RoleEdgeProperties`.`roleKind`
