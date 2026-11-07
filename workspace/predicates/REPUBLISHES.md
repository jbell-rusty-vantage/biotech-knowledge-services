---
id: "pred:REPUBLISHES"
kind: "predicate"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#REPUBLISHES"]
aliases: ["republishes"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:dd169173f1760678ba848b7e0a211cdea9aaadfa57c62020620e77cd7bdc78ca"
---
# Predicate REPUBLISHES

| | |
| --- | --- |
| id | `pred:REPUBLISHES` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D9](../modules/D9.md) |
| subject types | [MediaWork](../nodes/MediaWork.md) |
| object types | [MediaWork](../nodes/MediaWork.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-CL-06`, `Q-D9-07` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'REPUBLISHES'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named REPUBLISHES.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#REPUBLISHES`
