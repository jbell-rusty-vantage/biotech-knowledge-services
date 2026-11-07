---
id: "pred:MANUFACTURER_UNNAMED"
kind: "predicate"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#MANUFACTURER_UNNAMED"]
aliases: ["manufacturer unnamed","CONTRACT_MANUFACTURING_UNNAMED","MANUFACTURER_STATEMENT","contract manufacturing unnamed","manufacturer statement"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:ed34e2f5bccb54b410d98b01fe6837db1e767cc1f74c891cf20aa2df2f5d7c1d"
---
# Predicate MANUFACTURER_UNNAMED

| | |
| --- | --- |
| id | `pred:MANUFACTURER_UNNAMED` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D7](../modules/D7.md) |
| subject types | [Organization](../nodes/Organization.md) |
| object types | (none) |
| literal forms |  |
| qualifiers | `manufacturingKind` |
| aliases | [CONTRACT_MANUFACTURING_UNNAMED](CONTRACT_MANUFACTURING_UNNAMED.md), [MANUFACTURER_STATEMENT](MANUFACTURER_STATEMENT.md) |
| questions | `CQ-MF-01`, `Q-D7-21` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (value fields) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#MANUFACTURER_UNNAMED`
