---
id: "pred:SELLER_OF_RECORD"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#SELLER_OF_RECORD"]
aliases: ["seller of record"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:5acdf65edd445cba41291fb39d9d3d8b8f516fed273452f6a7edda1c69e09615"
---
# Predicate SELLER_OF_RECORD

| | |
| --- | --- |
| id | `pred:SELLER_OF_RECORD` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D6](../modules/D6.md) |
| subject types | [Offer](../nodes/Offer.md) |
| object types | [Organization](../nodes/Organization.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-CM-01`, `CQ-RC-06`, `Q-D5-01`, `Q-D5-04`, `Q-D5-06`, `Q-D5-08`, `Q-D5-13`, `Q-D5-14`, `Q-D5-20`, `Q-D5-22`, `Q-D5-23`, `Q-D6-06`, `Q-D6-16`, `Q-D6-20`, `Q-D9-02`, `Q-D9-21` |

## Typed edge or Assertion only

A typed edge exists: [SELLER_OF_RECORD](../relationships/SELLER_OF_RECORD.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'SELLER_OF_RECORD'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#SELLER_OF_RECORD`
