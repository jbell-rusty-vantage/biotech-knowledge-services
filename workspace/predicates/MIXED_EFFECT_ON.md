---
id: "pred:MIXED_EFFECT_ON"
kind: "predicate"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#MIXED_EFFECT_ON"]
aliases: ["mixed effect on"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:12c9223f8c4c5ef3c368c4787d08e3c91b4a009860d64469b3c68ecc5f83aa63"
---
# Predicate MIXED_EFFECT_ON

| | |
| --- | --- |
| id | `pred:MIXED_EFFECT_ON` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D2](../modules/D2.md) |
| subject types | [Mechanism](../nodes/Mechanism.md), [MolecularEntity](../nodes/MolecularEntity.md) |
| object types | [Biomarker](../nodes/Biomarker.md), [ChemicalSubstance](../nodes/ChemicalSubstance.md), [MolecularEntity](../nodes/MolecularEntity.md), [Outcome](../nodes/Outcome.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D2-14`, `Q-D2-26` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'MIXED_EFFECT_ON'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named MIXED_EFFECT_ON.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#MIXED_EFFECT_ON`
