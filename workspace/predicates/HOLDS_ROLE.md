---
id: "pred:HOLDS_ROLE"
kind: "predicate"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#HOLDS_ROLE"]
aliases: ["holds role"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:d8017ea4fe2deceee25ff8ed15766db4117c398a5b183880375305a8abef24b5"
---
# Predicate HOLDS_ROLE

| | |
| --- | --- |
| id | `pred:HOLDS_ROLE` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D7](../modules/D7.md) |
| subject types | [Person](../nodes/Person.md) |
| object types | [Organization](../nodes/Organization.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-AX-18`, `CQ-CL-05`, `CQ-EC-01`, `CQ-EC-03`, `CQ-EC-04`, `Q-D2-21`, `Q-D5-13`, `Q-D7-02`, `Q-D7-03`, `Q-D7-06`, `Q-D7-08`, `Q-D7-12`, `Q-D7-14`, `Q-D7-17`, `Q-D7-25` |

## Typed edge or Assertion only

A typed edge exists: [HOLDS_ROLE](../relationships/HOLDS_ROLE.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'HOLDS_ROLE'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#HOLDS_ROLE`
