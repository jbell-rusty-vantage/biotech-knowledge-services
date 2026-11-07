---
id: "enum:LegalStatusKind"
kind: "enum"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L187-L214"]
aliases: ["legal status kind"]
capabilities: ["get"]
cardDigest: "sha256:9dec5b1921c81d17220ed29834a8a61775ecc8745f58a89937c84e50257c5338"
---
# Enum LegalStatusKind

Kind of legal standing. Each value is narrow on purpose: NO_QUESTIONS is not APPROVED, NOTIFICATION_ON_FILE is not AUTHORISED, FAVOURABLE_OPINION_ONLY is not AUTHORISED, REGISTERED is not CLEARED, PATENT_IN_FORCE says nothing about which claims survive (CLAIMS_HELD_INVALID with claimNumbers does). Replaces pinned RegulatoryStatusKind.

Id `enum:LegalStatusKind` · module [D8](../modules/D8.md) · 25 values · used by 1 fields · raw SDL [sdl:LegalStatusKind](../sdl/LegalStatusKind.graphql)

## Values (25)

| value | description |
| --- | --- |
| `APPROVED` |  |
| `AUTHORISED` |  |
| `LICENSED` |  |
| `CLEARED` |  |
| `DESIGNATED` |  |
| `REGISTERED` |  |
| `NO_QUESTIONS` |  |
| `NOTIFICATION_ON_FILE` |  |
| `NOTIFICATION_OBJECTED` |  |
| `EXCLUDED_FROM_DEFINITION` |  |
| `NOT_EXCLUDED_FROM_DEFINITION` |  |
| `FAVOURABLE_OPINION_ONLY` |  |
| `NOT_AUTHORISED` |  |
| `ENFORCEMENT_DISCRETION` |  |
| `WITHDRAWN` |  |
| `REVOKED` |  |
| `DATA_PROTECTED` |  |
| `MARKET_EXCLUSIVITY` |  |
| `PATENT_IN_FORCE` |  |
| `PATENT_EXPIRED` |  |
| `PATENT_LAPSED` |  |
| `CLAIMS_HELD_INVALID` |  |
| `CLAIMS_NOT_INVALID` |  |
| `CLAIMS_CANCELLED` |  |
| `PRESCRIPTION_ONLY` | Prescription-only status of a product or substance, scoped by jurisdiction (R-88). |

Any value not listed here is not allowed in this release.

## Used by

- [LegalStatus](../nodes/LegalStatus.md).`statusKind`
