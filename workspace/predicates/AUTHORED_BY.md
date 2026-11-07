---
id: "pred:AUTHORED_BY"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#AUTHORED_BY"]
aliases: ["authored by","AUTHORED","PROTOCOL_AUTHORED_BY","authored","protocol authored by"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:f99783d22965a3dff463bcd80bd505a7410666e18d32c336e24d00559cc1bcb0"
---
# Predicate AUTHORED_BY

| | |
| --- | --- |
| id | `pred:AUTHORED_BY` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [Protocol](../nodes/Protocol.md), [ProtocolEdition](../nodes/ProtocolEdition.md), [Publication](../nodes/Publication.md) |
| object types | [Organization](../nodes/Organization.md), [Person](../nodes/Person.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | [AUTHORED](AUTHORED.md), [PROTOCOL_AUTHORED_BY](PROTOCOL_AUTHORED_BY.md) |
| questions | `Q-D3-03`, `Q-D3-08`, `Q-D3-12`, `Q-D9-13` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'AUTHORED_BY'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named AUTHORED_BY.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#AUTHORED_BY`
