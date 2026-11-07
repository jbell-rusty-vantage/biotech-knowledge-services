---
id: "pred:INHIBITS"
kind: "predicate"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#INHIBITS"]
aliases: ["inhibits"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:3782f73d7c2b42013ceec9cae187190005befe8bd7197c57db1dc21bc875c820"
---
# Predicate INHIBITS

| | |
| --- | --- |
| id | `pred:INHIBITS` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D2](../modules/D2.md) |
| subject types | [ChemicalSubstance](../nodes/ChemicalSubstance.md) |
| object types | [MolecularEntity](../nodes/MolecularEntity.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D2-08`, `Q-D2-19` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'INHIBITS'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named INHIBITS.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#INHIBITS`
