---
id: "enum:DiscontinuationScope"
kind: "enum"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D13.graphql#L104-L108"]
aliases: ["discontinuation scope"]
capabilities: ["get"]
cardDigest: "sha256:7199088923283052524bd46c5b0a69ee0cc8998dd11141c1a26bb238813a6b6e"
---
# Enum DiscontinuationScope

How much a PROGRAM_DISCONTINUATION stops: one trial, the whole program, or the company (wind-down, dissolution).

Id `enum:DiscontinuationScope` · module [D13](../modules/D13.md) · 3 values · used by 1 fields · raw SDL [sdl:DiscontinuationScope](../sdl/DiscontinuationScope.graphql)

## Values (3)

| value | description |
| --- | --- |
| `TRIAL` |  |
| `PROGRAM` |  |
| `COMPANY` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Event](../nodes/Event.md).`discontinuationScope`
