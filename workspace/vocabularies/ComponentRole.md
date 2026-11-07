---
id: "enum:ComponentRole"
kind: "enum"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L148-L155"]
aliases: ["component role"]
capabilities: ["get"]
cardDigest: "sha256:6976df5643ea0761c7b6e339faf4df18cdbf8761729755f5a06bd018a2210d11"
---
# Enum ComponentRole

Role of one administered component inside an arm.

Id `enum:ComponentRole` · module [D3](../modules/D3.md) · 6 values · used by 1 fields · raw SDL [sdl:ComponentRole](../sdl/ComponentRole.graphql)

## Values (6)

| value | description |
| --- | --- |
| `ACTIVE` |  |
| `PLACEBO` |  |
| `ACTIVE_COMPARATOR` |  |
| `SHAM` |  |
| `BACKGROUND` |  |
| `CO_INTERVENTION` |  |

Any value not listed here is not allowed in this release.

## Used by

- [InterventionComponent](../nodes/InterventionComponent.md).`componentRole`
