---
id: "pred:INCREASES_LEVEL_OF"
kind: "predicate"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#INCREASES_LEVEL_OF"]
aliases: ["increases level of","INCREASES_LEVEL","increases level"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:112c487c6b608cdd1c070d072344bfd6ef615c2252b75843dbe97ab59b4069df"
---
# Predicate INCREASES_LEVEL_OF

| | |
| --- | --- |
| id | `pred:INCREASES_LEVEL_OF` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D2](../modules/D2.md) |
| subject types | [Mechanism](../nodes/Mechanism.md), [MolecularEntity](../nodes/MolecularEntity.md) |
| object types | [Biomarker](../nodes/Biomarker.md), [ChemicalSubstance](../nodes/ChemicalSubstance.md), [MolecularEntity](../nodes/MolecularEntity.md), [Outcome](../nodes/Outcome.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | [INCREASES_LEVEL](INCREASES_LEVEL.md) |
| questions | `CQ-MX-06`, `Q-D2-04`, `Q-D2-14`, `Q-D2-22`, `Q-D2-26`, `Q-D4-13` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'INCREASES_LEVEL_OF'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named INCREASES_LEVEL_OF.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#INCREASES_LEVEL_OF`
