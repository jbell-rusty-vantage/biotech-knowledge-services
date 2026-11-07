---
id: "pred:RECOMMENDS_AGAINST"
kind: "predicate"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#RECOMMENDS_AGAINST"]
aliases: ["recommends against"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:ff0de558eaed1af3344d5b82b43c590cf0fca8f2df47f1add9711790853201d7"
---
# Predicate RECOMMENDS_AGAINST

| | |
| --- | --- |
| id | `pred:RECOMMENDS_AGAINST` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D9](../modules/D9.md) |
| subject types | (none) |
| object types | (none) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-RC-06`, `Q-D10-03`, `Q-D10-07`, `Q-D10-08`, `Q-D10-24`, `Q-D5-02`, `Q-D5-06`, `Q-D5-07` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'RECOMMENDS_AGAINST'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named RECOMMENDS_AGAINST.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#RECOMMENDS_AGAINST`
