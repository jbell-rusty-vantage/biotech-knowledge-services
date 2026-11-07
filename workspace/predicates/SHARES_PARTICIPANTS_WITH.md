---
id: "pred:SHARES_PARTICIPANTS_WITH"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#SHARES_PARTICIPANTS_WITH"]
aliases: ["shares participants with"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:3a66fc55f2e209c5fba74d6532b1d1b7fd4c629b46f3df0856b7fea0ce2c9dd9"
---
# Predicate SHARES_PARTICIPANTS_WITH

| | |
| --- | --- |
| id | `pred:SHARES_PARTICIPANTS_WITH` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [Study](../nodes/Study.md) |
| object types | [Study](../nodes/Study.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-ST-07` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'SHARES_PARTICIPANTS_WITH'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named SHARES_PARTICIPANTS_WITH.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#SHARES_PARTICIPANTS_WITH`
