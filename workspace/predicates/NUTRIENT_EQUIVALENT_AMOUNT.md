---
id: "pred:NUTRIENT_EQUIVALENT_AMOUNT"
kind: "predicate"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#NUTRIENT_EQUIVALENT_AMOUNT"]
aliases: ["nutrient equivalent amount"]
capabilities: ["get"]
cardDigest: "sha256:6da7d87d919b4b573c025d37803f6bcff7c790ed6aef70d0fea39d77fc0e3971"
---
# Predicate NUTRIENT_EQUIVALENT_AMOUNT

| | |
| --- | --- |
| id | `pred:NUTRIENT_EQUIVALENT_AMOUNT` |
| kind | **computation** |
| route | **computation** |
| status | registered |
| registrar | [D1](../modules/D1.md) |
| subject types | (none) |
| object types | [Constituent](../nodes/Constituent.md) |
| literal forms |  |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-PF-01`, `Q-D1-02` |

## Typed edge or Assertion only

Computation predicate: produced by a registered derivation rule / trusted job, never by an ordinary proposal; it is not source evidence.

## Write route

No ordinary proposal writes this predicate. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#NUTRIENT_EQUIVALENT_AMOUNT`
