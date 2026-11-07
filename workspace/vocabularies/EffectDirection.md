---
id: "enum:EffectDirection"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L498-L504"]
aliases: ["effect direction"]
capabilities: ["get"]
cardDigest: "sha256:c1994954a05c393dc4b138e7f8bf58d0303e92b8b81eb59c4d354616fbb44f32"
---
# Enum EffectDirection

Direction of an effect on a target or goal (00-DIRECTIVE 3.2: harm is a direction on an assessment, never a property of an entity).

Id `enum:EffectDirection` · module [K](../modules/K.md) · 5 values · used by 1 fields · raw SDL [sdl:EffectDirection](../sdl/EffectDirection.graphql)

## Values (5)

| value | description |
| --- | --- |
| `BENEFIT` |  |
| `HARM` |  |
| `MIXED` |  |
| `NO_EFFECT` |  |
| `UNKNOWN` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Assessment](../nodes/Assessment.md).`effectDirection`
