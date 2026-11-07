---
id: "pred:RECORDING_OF"
kind: "predicate"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#RECORDING_OF"]
aliases: ["recording of"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:3ab90eadb7b38f819aa20c9f2a9e49ea3f8c7777597b3ecf5260ba507c53061e"
---
# Predicate RECORDING_OF

| | |
| --- | --- |
| id | `pred:RECORDING_OF` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D9](../modules/D9.md) |
| subject types | [Event](../nodes/Event.md), [MediaWork](../nodes/MediaWork.md) |
| object types | [Event](../nodes/Event.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D13-25`, `Q-D9-18` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'RECORDING_OF'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named RECORDING_OF.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#RECORDING_OF`
