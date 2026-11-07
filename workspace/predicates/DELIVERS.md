---
id: "pred:DELIVERS"
kind: "predicate"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#DELIVERS"]
aliases: ["delivers"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:f0834b49cae37e0f257bc243a66f83a0a0c0ee1dcb253c923b016a8866eb522a"
---
# Predicate DELIVERS

| | |
| --- | --- |
| id | `pred:DELIVERS` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D4](../modules/D4.md) |
| subject types | [Product](../nodes/Product.md) |
| object types | [Device](../nodes/Device.md), [LabTest](../nodes/LabTest.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D4-01`, `Q-D4-08`, `Q-D4-09`, `Q-D4-10`, `Q-D4-13`, `Q-D4-18`, `Q-D4-24` |

## Typed edge or Assertion only

A typed edge exists: [DELIVERS](../relationships/DELIVERS.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'DELIVERS'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#DELIVERS`
