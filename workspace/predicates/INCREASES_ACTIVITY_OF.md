---
id: "pred:INCREASES_ACTIVITY_OF"
kind: "predicate"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#INCREASES_ACTIVITY_OF"]
aliases: ["increases activity of"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:d421814349926bdf106c07c79301ec4a5f50fe26367b7960649c55d261c883ca"
---
# Predicate INCREASES_ACTIVITY_OF

| | |
| --- | --- |
| id | `pred:INCREASES_ACTIVITY_OF` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D2](../modules/D2.md) |
| subject types | [ChemicalSubstance](../nodes/ChemicalSubstance.md), [IngredientMaterial](../nodes/IngredientMaterial.md), [Intervention](../nodes/Intervention.md) |
| object types | [Mechanism](../nodes/Mechanism.md), [MolecularEntity](../nodes/MolecularEntity.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-MX-06`, `Q-D2-04`, `Q-D2-05`, `Q-D2-19` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'INCREASES_ACTIVITY_OF'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named INCREASES_ACTIVITY_OF.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#INCREASES_ACTIVITY_OF`
