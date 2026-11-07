---
id: "pred:DISCLOSES_INTEREST"
kind: "predicate"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#DISCLOSES_INTEREST"]
aliases: ["discloses interest","COMPETING_INTEREST_STATED","DECLARES_NO_COMPETING_INTEREST","DISCLOSES_AFFILIATE_COMMISSION","DISCLOSES_SUPPORT_FROM","competing interest stated","declares no competing interest","discloses affiliate commission","discloses support from"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:2bc78f2575996464126ddd0922c3191686a4e73a3ca18e80c0757e8321fc7b9d"
---
# Predicate DISCLOSES_INTEREST

| | |
| --- | --- |
| id | `pred:DISCLOSES_INTEREST` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D9](../modules/D9.md) |
| subject types | [MediaWork](../nodes/MediaWork.md), [Organization](../nodes/Organization.md), [Person](../nodes/Person.md), [Publication](../nodes/Publication.md) |
| object types | [Organization](../nodes/Organization.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | [COMPETING_INTEREST_STATED](COMPETING_INTEREST_STATED.md), [DECLARES_NO_COMPETING_INTEREST](DECLARES_NO_COMPETING_INTEREST.md), [DISCLOSES_AFFILIATE_COMMISSION](DISCLOSES_AFFILIATE_COMMISSION.md), [DISCLOSES_SUPPORT_FROM](DISCLOSES_SUPPORT_FROM.md) |
| questions | `CQ-CL-05`, `CQ-CL-08`, `Q-D10-21`, `Q-D9-01`, `Q-K-15` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'DISCLOSES_INTEREST'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named DISCLOSES_INTEREST.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#DISCLOSES_INTEREST`
