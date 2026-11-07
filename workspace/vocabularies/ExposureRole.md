---
id: "enum:ExposureRole"
kind: "enum"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D2.graphql#L138-L142"]
aliases: ["exposure role"]
capabilities: ["get"]
cardDigest: "sha256:f79f2cdfe05fa0c07a125de22dc24812cdf9d1e7da3b2fb2499bdaeca073b246"
---
# Enum ExposureRole

Role of an exposure attached to a context: the tested agent, a background co-exposure (e.g. exercise training), or the comparator.

Id `enum:ExposureRole` · module [D2](../modules/D2.md) · 3 values · used by 1 fields · raw SDL [sdl:ExposureRole](../sdl/ExposureRole.graphql)

## Values (3)

| value | description |
| --- | --- |
| `TESTED` |  |
| `BACKGROUND` |  |
| `COMPARATOR` |  |

Any value not listed here is not allowed in this release.

## Used by

- `ExposureRoleProperties`.`exposureRole`
