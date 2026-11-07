---
id: "pred:CONTAINS_PACKAGE"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#CONTAINS_PACKAGE"]
aliases: ["contains package"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:120d51f0cff485318cc5807d951cef6efb5ae0f1223cf885ced93aad7d9da93e"
---
# Predicate CONTAINS_PACKAGE

| | |
| --- | --- |
| id | `pred:CONTAINS_PACKAGE` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D6](../modules/D6.md) |
| subject types | [Package](../nodes/Package.md) |
| object types | [Package](../nodes/Package.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D6-14` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'CONTAINS_PACKAGE'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named CONTAINS_PACKAGE.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#CONTAINS_PACKAGE`
