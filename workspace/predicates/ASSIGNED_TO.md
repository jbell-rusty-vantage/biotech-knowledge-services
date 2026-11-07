---
id: "pred:ASSIGNED_TO"
kind: "predicate"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#ASSIGNED_TO"]
aliases: ["assigned to"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:9de6250ad754d2e480593ba17202aed80f5d49ad380d1098f2dde71a231bfdef"
---
# Predicate ASSIGNED_TO

| | |
| --- | --- |
| id | `pred:ASSIGNED_TO` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D8](../modules/D8.md) |
| subject types | [Patent](../nodes/Patent.md) |
| object types | [Organization](../nodes/Organization.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-EC-01`, `Q-D8-10`, `Q-D8-11` |

## Typed edge or Assertion only

A typed edge exists: [ASSIGNED_TO](../relationships/ASSIGNED_TO.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'ASSIGNED_TO'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#ASSIGNED_TO`
