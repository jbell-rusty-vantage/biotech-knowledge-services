---
id: "pred:DOCUMENTED_BY_RECORD"
kind: "predicate"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#DOCUMENTED_BY_RECORD"]
aliases: ["documented by record"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:8133024bba23c19c7e5bd11710db94c3b2982765931fefd088d4b3c8d6129d0a"
---
# Predicate DOCUMENTED_BY_RECORD

| | |
| --- | --- |
| id | `pred:DOCUMENTED_BY_RECORD` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D13](../modules/D13.md) |
| subject types | [Event](../nodes/Event.md) |
| object types | [RegulatoryRecord](../nodes/RegulatoryRecord.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D13-12`, `Q-D13-14`, `Q-D13-22`, `Q-D13-23`, `Q-D13-33` |

## Typed edge or Assertion only

A typed edge exists: [DOCUMENTED_BY_RECORD](../relationships/DOCUMENTED_BY_RECORD.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'DOCUMENTED_BY_RECORD'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#DOCUMENTED_BY_RECORD`
