---
id: "enum:UseDisposition"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L524-L528"]
aliases: ["use disposition"]
capabilities: ["get"]
cardDigest: "sha256:1a5a676311cbdeffcb986c640ae8fe2e51aa26d45256bd594381db5d1a430a39"
---
# Enum UseDisposition

Disposition of a use decision for one exact effect, use and audience (R-SV10). The decision itself is owned by PostgreSQL (Knowledge Services common component); the graph records the reference and the disposition it was applied under.

Id `enum:UseDisposition` · module [K](../modules/K.md) · 3 values · used by 1 fields · raw SDL [sdl:UseDisposition](../sdl/UseDisposition.graphql)

## Values (3)

| value | description |
| --- | --- |
| `ADMITTED` |  |
| `HELD` |  |
| `REJECTED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Assessment](../nodes/Assessment.md).`useDisposition`
