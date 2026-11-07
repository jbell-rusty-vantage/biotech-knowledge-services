---
id: "pred:REPORTED_COUNTERFEIT"
kind: "predicate"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#REPORTED_COUNTERFEIT"]
aliases: ["reported counterfeit"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:51c2650cef3e5af4b773d09ffb76711e69bd8f25b306093170bbbb794f48f7de"
---
# Predicate REPORTED_COUNTERFEIT

| | |
| --- | --- |
| id | `pred:REPORTED_COUNTERFEIT` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D8](../modules/D8.md) |
| subject types | (none) |
| object types | (none) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D8-07` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'REPORTED_COUNTERFEIT'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named REPORTED_COUNTERFEIT.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#REPORTED_COUNTERFEIT`
