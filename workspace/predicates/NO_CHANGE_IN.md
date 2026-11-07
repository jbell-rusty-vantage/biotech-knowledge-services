---
id: "pred:NO_CHANGE_IN"
kind: "predicate"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#NO_CHANGE_IN"]
aliases: ["no change in"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:001a7e4188242f609dfe600c0423950356927683063283a1e44a1a3250f0b892"
---
# Predicate NO_CHANGE_IN

| | |
| --- | --- |
| id | `pred:NO_CHANGE_IN` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D2](../modules/D2.md) |
| subject types | [Mechanism](../nodes/Mechanism.md), [MolecularEntity](../nodes/MolecularEntity.md) |
| object types | [Biomarker](../nodes/Biomarker.md), [ChemicalSubstance](../nodes/ChemicalSubstance.md), [MolecularEntity](../nodes/MolecularEntity.md), [Outcome](../nodes/Outcome.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-MX-03`, `CQ-MX-06`, `Q-D2-04`, `Q-D2-05`, `Q-D2-14`, `Q-D2-16`, `Q-D2-17`, `Q-D2-20`, `Q-D2-22`, `Q-D2-25`, `Q-D2-26` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'NO_CHANGE_IN'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named NO_CHANGE_IN.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#NO_CHANGE_IN`
