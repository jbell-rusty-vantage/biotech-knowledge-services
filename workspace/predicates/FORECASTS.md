---
id: "pred:FORECASTS"
kind: "predicate"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#FORECASTS"]
aliases: ["forecasts"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:fd413e4ce4f6af12960ab385235069aca29ddfe17b5a5a67a5d14998197d8ef8"
---
# Predicate FORECASTS

| | |
| --- | --- |
| id | `pred:FORECASTS` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D13](../modules/D13.md) |
| subject types | (none) |
| object types | [Event](../nodes/Event.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D13-20` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'FORECASTS'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named FORECASTS.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#FORECASTS`
