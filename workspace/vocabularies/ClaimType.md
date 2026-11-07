---
id: "enum:ClaimType"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L224-L239"]
aliases: ["claim type"]
capabilities: ["get"]
cardDigest: "sha256:f55e919624265ddc8d249c0eecda8bef38d8ea30f9bf0eaafa5313db39d878c5"
---
# Enum ClaimType

verification.v1 ClaimTypeSchema.

Id `enum:ClaimType` · module [K](../modules/K.md) · 14 values · used by 2 fields · raw SDL [sdl:ClaimType](../sdl/ClaimType.graphql)

## Values (14)

| value | description |
| --- | --- |
| `ATTRIBUTE` |  |
| `RELATIONSHIP` |  |
| `MEASUREMENT` |  |
| `CAPABILITY` |  |
| `COMPATIBILITY` |  |
| `TEMPORAL` |  |
| `CAUSAL` |  |
| `COMPARATIVE` |  |
| `METHODOLOGICAL` |  |
| `DEFINITION` |  |
| `EVENT` |  |
| `PROVENANCE` |  |
| `RECOMMENDATION` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Assertion](../nodes/Assertion.md).`claimType`
- [Claim](../nodes/Claim.md).`claimType`
