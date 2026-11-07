---
id: "pred:ISSUED_AT"
kind: "predicate"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#ISSUED_AT"]
aliases: ["issued at"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:0d4ee739feb684811df7981e462952e9ed7215b7fb80f40d5c03031459bd8c23"
---
# Predicate ISSUED_AT

| | |
| --- | --- |
| id | `pred:ISSUED_AT` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D8](../modules/D8.md) |
| subject types | [RegulatoryRecord](../nodes/RegulatoryRecord.md) |
| object types | (none) |
| literal forms |  |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D8-01` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (value fields) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#ISSUED_AT`
