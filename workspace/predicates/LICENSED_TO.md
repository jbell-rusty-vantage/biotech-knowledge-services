---
id: "pred:LICENSED_TO"
kind: "predicate"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#LICENSED_TO"]
aliases: ["licensed to"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:3f6e0efe8900faf14407b1780d8948f398ddc88ab098e788bdb7790db75d52d0"
---
# Predicate LICENSED_TO

| | |
| --- | --- |
| id | `pred:LICENSED_TO` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D8](../modules/D8.md) |
| subject types | [Patent](../nodes/Patent.md) |
| object types | [Organization](../nodes/Organization.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-EC-01`, `Q-D8-11`, `Q-D8-21` |

## Typed edge or Assertion only

A typed edge exists: [LICENSED_TO](../relationships/LICENSED_TO.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'LICENSED_TO'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#LICENSED_TO`
