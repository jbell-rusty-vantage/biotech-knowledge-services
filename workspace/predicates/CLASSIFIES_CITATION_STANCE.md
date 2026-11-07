---
id: "pred:CLASSIFIES_CITATION_STANCE"
kind: "predicate"
module: "D10"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#CLASSIFIES_CITATION_STANCE"]
aliases: ["classifies citation stance"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:8ad1f1511da0defa32f7233ff7bcee71e83009bcf7c335ac05e6b24257da8cfd"
---
# Predicate CLASSIFIES_CITATION_STANCE

| | |
| --- | --- |
| id | `pred:CLASSIFIES_CITATION_STANCE` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D10](../modules/D10.md) |
| subject types | (none) |
| object types | (none) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'CLASSIFIES_CITATION_STANCE'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named CLASSIFIES_CITATION_STANCE.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#CLASSIFIES_CITATION_STANCE`
