---
id: "enum:VersionPopulatingMode"
kind: "enum"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L106-L109"]
aliases: ["version populating mode"]
capabilities: ["get"]
cardDigest: "sha256:79a66d46e235f2d4b008f07896295e2fc1bfb48149cae1fecaf112729d1dbe5c"
---
# Enum VersionPopulatingMode

How a RegistrationVersion entered the graph: captured by BellLabs (its own snapshot) or reconstructed from a dated history statement inside a later snapshot (ISRCTN 'Amended dd/mm/yyyy', editorial notes).

Id `enum:VersionPopulatingMode` · module [D3](../modules/D3.md) · 2 values · used by 1 fields · raw SDL [sdl:VersionPopulatingMode](../sdl/VersionPopulatingMode.graphql)

## Values (2)

| value | description |
| --- | --- |
| `OBSERVED` |  |
| `RECONSTRUCTED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [RegistrationVersion](../nodes/RegistrationVersion.md).`populatingMode`
