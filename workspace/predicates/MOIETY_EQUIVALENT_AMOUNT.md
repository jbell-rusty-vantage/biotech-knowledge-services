---
id: "pred:MOIETY_EQUIVALENT_AMOUNT"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#MOIETY_EQUIVALENT_AMOUNT"]
aliases: ["moiety equivalent amount"]
capabilities: ["get"]
cardDigest: "sha256:17985c939842f5b6d8b9ed1053afb94993da95ae2c3356c3cf00835c75bb1a49"
---
# Predicate MOIETY_EQUIVALENT_AMOUNT

| | |
| --- | --- |
| id | `pred:MOIETY_EQUIVALENT_AMOUNT` |
| kind | **computation** |
| route | **computation** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [StudyArm](../nodes/StudyArm.md) |
| object types | [ChemicalSubstance](../nodes/ChemicalSubstance.md) |
| literal forms |  |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-PF-01`, `Q-D1-02`, `Q-D1-24`, `Q-D6-02` |

## Typed edge or Assertion only

Computation predicate: produced by a registered derivation rule / trusted job, never by an ordinary proposal; it is not source evidence.

## Write route

No ordinary proposal writes this predicate. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#MOIETY_EQUIVALENT_AMOUNT`
