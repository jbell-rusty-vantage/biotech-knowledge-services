---
id: "pred:INVESTIGATES"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#INVESTIGATES"]
aliases: ["investigates"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:0d93704f0d66c537ec3a3cf9b43ba05af00ac38b31a7c3fbb6c7ada7df285080"
---
# Predicate INVESTIGATES

| | |
| --- | --- |
| id | `pred:INVESTIGATES` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [Study](../nodes/Study.md) |
| object types | [Condition](../nodes/Condition.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D2-06`, `Q-D3-10` |

## Typed edge or Assertion only

A typed edge exists: [INVESTIGATES](../relationships/INVESTIGATES.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'INVESTIGATES'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#INVESTIGATES`
