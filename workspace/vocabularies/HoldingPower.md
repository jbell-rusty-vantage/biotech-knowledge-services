---
id: "enum:HoldingPower"
kind: "enum"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D7.graphql#L221-L226"]
aliases: ["holding power"]
capabilities: ["get"]
cardDigest: "sha256:f173ff0943ae28aef8cad050fae6216bc0bc1ad8c0967b6c06a7f3b6707f6865"
---
# Enum HoldingPower

Voting or dispositive power over a holding, as stated.

Id `enum:HoldingPower` · module [D7](../modules/D7.md) · 4 values · used by 2 fields · raw SDL [sdl:HoldingPower](../sdl/HoldingPower.graphql)

## Values (4)

| value | description |
| --- | --- |
| `SOLE` |  |
| `SHARED` |  |
| `NONE` |  |
| `UNSTATED` |  |

Any value not listed here is not allowed in this release.

## Used by

- `StakeEdgeProperties`.`votingPower`
- `StakeEdgeProperties`.`dispositivePower`
