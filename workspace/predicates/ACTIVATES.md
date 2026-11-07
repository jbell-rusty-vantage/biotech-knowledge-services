---
id: "pred:ACTIVATES"
kind: "predicate"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#ACTIVATES"]
aliases: ["activates","DIRECTLY_ACTIVATES","directly activates"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:abc6eaf4ded36281305146eb8785905d573119bdb6316301419c758605f3d548"
---
# Predicate ACTIVATES

| | |
| --- | --- |
| id | `pred:ACTIVATES` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D2](../modules/D2.md) |
| subject types | [ChemicalSubstance](../nodes/ChemicalSubstance.md) |
| object types | [MolecularEntity](../nodes/MolecularEntity.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | [DIRECTLY_ACTIVATES](DIRECTLY_ACTIVATES.md) |
| questions | `Q-D2-08`, `Q-D2-19` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'ACTIVATES'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named ACTIVATES.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#ACTIVATES`
