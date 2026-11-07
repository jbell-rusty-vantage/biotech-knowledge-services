---
id: "pred:PART_OF_MECHANISM"
kind: "predicate"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#PART_OF_MECHANISM"]
aliases: ["part of mechanism"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:15f68d4eaa7f663e072eec9f4135aaed9410565d09038ce84c8fe455d95cbb16"
---
# Predicate PART_OF_MECHANISM

| | |
| --- | --- |
| id | `pred:PART_OF_MECHANISM` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D2](../modules/D2.md) |
| subject types | [Mechanism](../nodes/Mechanism.md) |
| object types | [Mechanism](../nodes/Mechanism.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D2-02`, `Q-D2-12`, `Q-D2-14`, `Q-D2-26` |

## Typed edge or Assertion only

A typed edge exists: [PART_OF_MECHANISM](../relationships/PART_OF_MECHANISM.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'PART_OF_MECHANISM'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#PART_OF_MECHANISM`
