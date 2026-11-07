---
id: "pred:AWARDED_BY"
kind: "predicate"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#AWARDED_BY"]
aliases: ["awarded by"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:e0520e3fa1fc7f30e8292a0bdaeac827b6825c1cea2934f2eaa112181c0913c5"
---
# Predicate AWARDED_BY

| | |
| --- | --- |
| id | `pred:AWARDED_BY` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D7](../modules/D7.md) |
| subject types | [Award](../nodes/Award.md) |
| object types | [Organization](../nodes/Organization.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-EC-04`, `Q-D7-05`, `Q-D7-15`, `Q-D7-22` |

## Typed edge or Assertion only

A typed edge exists: [AWARDED_BY](../relationships/AWARDED_BY.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'AWARDED_BY'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#AWARDED_BY`
