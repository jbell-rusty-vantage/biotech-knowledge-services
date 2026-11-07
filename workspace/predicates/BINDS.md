---
id: "pred:BINDS"
kind: "predicate"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#BINDS"]
aliases: ["binds"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:f2fb016938cec4351a6782f0fad5c454d2712965a5366d26e1f1b5c942e0db90"
---
# Predicate BINDS

| | |
| --- | --- |
| id | `pred:BINDS` |
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

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'BINDS'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named BINDS.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#BINDS`
