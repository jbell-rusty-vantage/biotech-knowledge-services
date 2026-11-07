---
id: "enum:AppearanceRole"
kind: "enum"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D9.graphql#L103-L114"]
aliases: ["appearance role"]
capabilities: ["get"]
cardDigest: "sha256:13fb0c027f97a3b025aab677dc0f26bb624ae5d2c56175cfa0e2808fdf2b30ec"
---
# Enum AppearanceRole

Role of a person in a media work (APPEARS_IN).

Id `enum:AppearanceRole` · module [D9](../modules/D9.md) · 9 values · used by 1 fields · raw SDL [sdl:AppearanceRole](../sdl/AppearanceRole.graphql)

## Values (9)

| value | description |
| --- | --- |
| `HOST` |  |
| `CO_HOST` |  |
| `GUEST` |  |
| `INTERVIEWER` |  |
| `PANELIST` |  |
| `PRESENTER` |  |
| `MODERATOR` |  |
| `AUTHOR` |  |
| `READER` | Reads a sponsor segment or narration without being host or guest. |

Any value not listed here is not allowed in this release.

## Used by

- `AppearanceEdgeProperties`.`appearanceRole`
