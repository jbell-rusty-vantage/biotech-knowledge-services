---
id: "enum:RegistryStatus"
kind: "enum"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L92-L103"]
aliases: ["registry status"]
capabilities: ["get"]
cardDigest: "sha256:fba3fb647d7dc4491d5d5d1aecdefdedb2c505fa5d3571060f0eaada0a0ea050"
---
# Enum RegistryStatus

Recruitment status as a registry version states it (non-CTG vocabularies map here; the verbatim value is kept).

Id `enum:RegistryStatus` · module [D3](../modules/D3.md) · 10 values · used by 2 fields · raw SDL [sdl:RegistryStatus](../sdl/RegistryStatus.graphql)

## Values (10)

| value | description |
| --- | --- |
| `NOT_YET_RECRUITING` |  |
| `RECRUITING` |  |
| `ENROLLING_BY_INVITATION` |  |
| `ACTIVE_NOT_RECRUITING` |  |
| `SUSPENDED` |  |
| `TERMINATED` |  |
| `COMPLETED` |  |
| `WITHDRAWN` |  |
| `UNKNOWN` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Study](../nodes/Study.md).`overallStatus`
- [RegistrationVersion](../nodes/RegistrationVersion.md).`overallStatus`
