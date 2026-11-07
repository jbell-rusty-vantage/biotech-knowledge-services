---
id: "pred:ORTHOLOG_OF"
kind: "predicate"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#ORTHOLOG_OF"]
aliases: ["ortholog of"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:b86a8693d179f3c78bcf20d832edae2c428dd616ef19e95a13431e83370b21b4"
---
# Predicate ORTHOLOG_OF

| | |
| --- | --- |
| id | `pred:ORTHOLOG_OF` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D2](../modules/D2.md) |
| subject types | [MolecularEntity](../nodes/MolecularEntity.md) |
| object types | [MolecularEntity](../nodes/MolecularEntity.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'ORTHOLOG_OF'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named ORTHOLOG_OF.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#ORTHOLOG_OF`
