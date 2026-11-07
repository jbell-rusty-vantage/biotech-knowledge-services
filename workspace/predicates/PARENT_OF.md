---
id: "pred:PARENT_OF"
kind: "predicate"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#PARENT_OF"]
aliases: ["parent of"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:08a6db407097dcc453d530f5cde7f449466a88221a63093bfbe1fb9b13ebb278"
---
# Predicate PARENT_OF

| | |
| --- | --- |
| id | `pred:PARENT_OF` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D7](../modules/D7.md) |
| subject types | [Organization](../nodes/Organization.md) |
| object types | [Organization](../nodes/Organization.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-CL-05`, `CQ-CL-08`, `CQ-EC-02`, `CQ-EC-03`, `Q-D10-21`, `Q-D7-01`, `Q-D7-09`, `Q-D7-13`, `Q-D7-14`, `Q-D7-19`, `Q-D9-01`, `Q-K-15` |

## Typed edge or Assertion only

A typed edge exists: [PARENT_OF](../relationships/PARENT_OF.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'PARENT_OF'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#PARENT_OF`
