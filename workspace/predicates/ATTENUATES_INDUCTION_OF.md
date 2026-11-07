---
id: "pred:ATTENUATES_INDUCTION_OF"
kind: "predicate"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#ATTENUATES_INDUCTION_OF"]
aliases: ["attenuates induction of"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:217c6a81137df2a47fa46d46098f04f1a492f34a798021f778f6332c36c98239"
---
# Predicate ATTENUATES_INDUCTION_OF

| | |
| --- | --- |
| id | `pred:ATTENUATES_INDUCTION_OF` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D2](../modules/D2.md) |
| subject types | [ChemicalSubstance](../nodes/ChemicalSubstance.md), [Intervention](../nodes/Intervention.md) |
| object types | [Mechanism](../nodes/Mechanism.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D2-09` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'ATTENUATES_INDUCTION_OF'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named ATTENUATES_INDUCTION_OF.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#ATTENUATES_INDUCTION_OF`
