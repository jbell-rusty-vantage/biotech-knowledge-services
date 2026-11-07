---
id: "pred:ADDRESSED_TO"
kind: "predicate"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#ADDRESSED_TO"]
aliases: ["addressed to"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:664b236edac6519a2c33cd78bd797b419d27f992d2c941491cdcd90623ee6979"
---
# Predicate ADDRESSED_TO

| | |
| --- | --- |
| id | `pred:ADDRESSED_TO` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D8](../modules/D8.md) |
| subject types | [RegulatoryRecord](../nodes/RegulatoryRecord.md) |
| object types | [Organization](../nodes/Organization.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-EC-01`, `CQ-MF-06`, `Q-D8-02`, `Q-D8-03`, `Q-D8-17`, `Q-D9-12` |

## Typed edge or Assertion only

A typed edge exists: [ADDRESSED_TO](../relationships/ADDRESSED_TO.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'ADDRESSED_TO'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#ADDRESSED_TO`
