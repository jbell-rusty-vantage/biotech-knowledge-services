---
id: "pred:MECHANISM_OF"
kind: "predicate"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#MECHANISM_OF"]
aliases: ["mechanism of"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:3c6557748fa23a1da694cdc6e412601b64650ec91d41915e6035d6e66138f5da"
---
# Predicate MECHANISM_OF

| | |
| --- | --- |
| id | `pred:MECHANISM_OF` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D2](../modules/D2.md) |
| subject types | [Mechanism](../nodes/Mechanism.md) |
| object types | [Condition](../nodes/Condition.md), [Outcome](../nodes/Outcome.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D2-14`, `Q-D2-26` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'MECHANISM_OF'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named MECHANISM_OF.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#MECHANISM_OF`
