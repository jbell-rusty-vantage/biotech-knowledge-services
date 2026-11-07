---
id: "pred:OPERATED_BY"
kind: "predicate"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#OPERATED_BY"]
aliases: ["operated by","OPERATES_CHANNEL","operates channel"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:e9d24b3fb0a45bd175ceda724e984fdd528145709328ce0694b6e5c3fb6f50fe"
---
# Predicate OPERATED_BY

| | |
| --- | --- |
| id | `pred:OPERATED_BY` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D9](../modules/D9.md) |
| subject types | [Channel](../nodes/Channel.md) |
| object types | [Channel](../nodes/Channel.md), [Organization](../nodes/Organization.md), [Person](../nodes/Person.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | [OPERATES_CHANNEL](OPERATES_CHANNEL.md) |
| questions | `CQ-CL-05`, `Q-D9-12` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'OPERATED_BY'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named OPERATED_BY.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#OPERATED_BY`
