---
id: "pred:MEMBER_OF_CLASS"
kind: "predicate"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#MEMBER_OF_CLASS"]
aliases: ["member of class"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:0e3787aa8ce29d2f72495f4cf2801c0c7e2e61e73888a037558945d2be83051a"
---
# Predicate MEMBER_OF_CLASS

| | |
| --- | --- |
| id | `pred:MEMBER_OF_CLASS` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D1](../modules/D1.md) |
| subject types | [ChemicalSubstance](../nodes/ChemicalSubstance.md) |
| object types | [Constituent](../nodes/Constituent.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'MEMBER_OF_CLASS'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named MEMBER_OF_CLASS.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#MEMBER_OF_CLASS`
