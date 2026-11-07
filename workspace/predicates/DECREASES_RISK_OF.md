---
id: "pred:DECREASES_RISK_OF"
kind: "predicate"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#DECREASES_RISK_OF"]
aliases: ["decreases risk of"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:bfc2fb2762f6396419715db3652fbab3396e706a2e4b9ae918cf9d214f789b3e"
---
# Predicate DECREASES_RISK_OF

| | |
| --- | --- |
| id | `pred:DECREASES_RISK_OF` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D2](../modules/D2.md) |
| subject types | [Condition](../nodes/Condition.md), [Mechanism](../nodes/Mechanism.md), [MolecularEntity](../nodes/MolecularEntity.md) |
| object types | [Condition](../nodes/Condition.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D2-14`, `Q-D2-26` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'DECREASES_RISK_OF'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named DECREASES_RISK_OF.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#DECREASES_RISK_OF`
