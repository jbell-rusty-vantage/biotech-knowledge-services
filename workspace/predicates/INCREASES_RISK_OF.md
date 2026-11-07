---
id: "pred:INCREASES_RISK_OF"
kind: "predicate"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#INCREASES_RISK_OF"]
aliases: ["increases risk of"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:734341b9049987d45892b1e3e2cd6ae9094194251c4fd36ecaebd6678acf9ef8"
---
# Predicate INCREASES_RISK_OF

| | |
| --- | --- |
| id | `pred:INCREASES_RISK_OF` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D2](../modules/D2.md) |
| subject types | [Condition](../nodes/Condition.md), [Mechanism](../nodes/Mechanism.md), [MolecularEntity](../nodes/MolecularEntity.md) |
| object types | [Condition](../nodes/Condition.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D2-14`, `Q-D2-15`, `Q-D2-26` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'INCREASES_RISK_OF'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named INCREASES_RISK_OF.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#INCREASES_RISK_OF`
