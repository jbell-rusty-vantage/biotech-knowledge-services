---
id: "pred:OFFER_AVAILABILITY"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#OFFER_AVAILABILITY"]
aliases: ["offer availability"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:cbfba05b499c0848f5a99b105ec720dca27eac5a0c89ec5602f279559bc25af4"
---
# Predicate OFFER_AVAILABILITY

| | |
| --- | --- |
| id | `pred:OFFER_AVAILABILITY` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D6](../modules/D6.md) |
| subject types | [Offer](../nodes/Offer.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-CM-03`, `CQ-CM-05` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#OFFER_AVAILABILITY`
