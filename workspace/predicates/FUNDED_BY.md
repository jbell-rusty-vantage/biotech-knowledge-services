---
id: "pred:FUNDED_BY"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#FUNDED_BY"]
aliases: ["funded by","FUNDER_ROLE_STATEMENT","funder role statement"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:0d2d44987d3376013d3dbd308e7f9c44feba28eea38b7cabba097d780c6281d9"
---
# Predicate FUNDED_BY

| | |
| --- | --- |
| id | `pred:FUNDED_BY` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [Publication](../nodes/Publication.md) |
| object types | [Organization](../nodes/Organization.md) |
| literal forms | (none) |
| qualifiers | `roleText` |
| aliases | [FUNDER_ROLE_STATEMENT](FUNDER_ROLE_STATEMENT.md) |
| questions | `Q-D11-08`, `Q-D3-08` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'FUNDED_BY'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named FUNDED_BY.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#FUNDED_BY`
