---
id: "enum:ValidTimeBasis"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L195-L201"]
aliases: ["valid time basis"]
capabilities: ["get"]
cardDigest: "sha256:a0b5f0f9c51df260431879396da773a63fb5c7f810cba1f36c5b532e2cacdd37"
---
# Enum ValidTimeBasis

Why a valid-time bound has its value; OBSERVATION_ONLY and UNKNOWN force a null bound.

Id `enum:ValidTimeBasis` · module [K](../modules/K.md) · 5 values · used by 20 fields · raw SDL [sdl:ValidTimeBasis](../sdl/ValidTimeBasis.graphql)

## Values (5)

| value | description |
| --- | --- |
| `STATED_BY_SOURCE` |  |
| `PUBLICATION_PROXY` |  |
| `OBSERVATION_ONLY` |  |
| `INFERRED` |  |
| `UNKNOWN` |  |

Any value not listed here is not allowed in this release.

## Used by

- `AssertedEdgeProperties`.`validFromBasis`
- `AssertedEdgeProperties`.`validToBasis`
- `IdentifierLinkProperties`.`validFromBasis`
- `IdentifierLinkProperties`.`validToBasis`
- [Assertion](../nodes/Assertion.md).`validFromBasis`
- [Assertion](../nodes/Assertion.md).`validToBasis`
- `ContentEdgeProperties`.`validFromBasis`
- `ContentEdgeProperties`.`validToBasis`
- `StudyRoleEdgeProperties`.`validFromBasis`
- `StudyRoleEdgeProperties`.`validToBasis`
- `RoleEdgeProperties`.`validFromBasis`
- `RoleEdgeProperties`.`validToBasis`
- `StakeEdgeProperties`.`validFromBasis`
- `StakeEdgeProperties`.`validToBasis`
- `ValueEdgeProperties`.`validFromBasis`
- `ValueEdgeProperties`.`validToBasis`
- `ControlEdgeProperties`.`validFromBasis`
- `ControlEdgeProperties`.`validToBasis`
- [Event](../nodes/Event.md).`startedAtBasis`
- [Event](../nodes/Event.md).`effectiveFromBasis`
