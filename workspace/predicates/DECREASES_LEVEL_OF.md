---
id: "pred:DECREASES_LEVEL_OF"
kind: "predicate"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#DECREASES_LEVEL_OF"]
aliases: ["decreases level of"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:c45e17b51397403cd66d954ff448fc65c8aa7ca38ed20532deab5add835d07f3"
---
# Predicate DECREASES_LEVEL_OF

| | |
| --- | --- |
| id | `pred:DECREASES_LEVEL_OF` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D2](../modules/D2.md) |
| subject types | [Mechanism](../nodes/Mechanism.md), [MolecularEntity](../nodes/MolecularEntity.md) |
| object types | [Biomarker](../nodes/Biomarker.md), [ChemicalSubstance](../nodes/ChemicalSubstance.md), [MolecularEntity](../nodes/MolecularEntity.md), [Outcome](../nodes/Outcome.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-MX-06`, `Q-D2-05`, `Q-D2-09`, `Q-D2-14`, `Q-D2-22`, `Q-D2-25`, `Q-D2-26` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'DECREASES_LEVEL_OF'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named DECREASES_LEVEL_OF.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#DECREASES_LEVEL_OF`
