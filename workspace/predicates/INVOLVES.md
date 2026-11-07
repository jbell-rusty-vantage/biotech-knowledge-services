---
id: "pred:INVOLVES"
kind: "predicate"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#INVOLVES"]
aliases: ["involves"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:94dd4967c114e6470801fa56dbe3af1408dd6f3ebd7a7a381cdb49e4477dc726"
---
# Predicate INVOLVES

| | |
| --- | --- |
| id | `pred:INVOLVES` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D13](../modules/D13.md) |
| subject types | [Event](../nodes/Event.md) |
| object types | [Organization](../nodes/Organization.md), [Person](../nodes/Person.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D13-03`, `Q-D13-06`, `Q-D13-14`, `Q-D13-15`, `Q-D13-21`, `Q-D13-23`, `Q-D13-25`, `Q-D13-33` |

## Typed edge or Assertion only

A typed edge exists: [INVOLVES](../relationships/INVOLVES.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'INVOLVES'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#INVOLVES`
