---
id: "pred:MEDIATES_TARGET"
kind: "predicate"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#MEDIATES_TARGET"]
aliases: ["mediates target"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:a066eaf645a0e09a5f6615b479f8fa437a03af63ab972c6e7df5b9db1b04cd80"
---
# Predicate MEDIATES_TARGET

| | |
| --- | --- |
| id | `pred:MEDIATES_TARGET` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D2](../modules/D2.md) |
| subject types | [Mechanism](../nodes/Mechanism.md) |
| object types | [Target](../nodes/Target.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D2-10` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'MEDIATES_TARGET'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named MEDIATES_TARGET.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#MEDIATES_TARGET`
