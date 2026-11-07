---
id: "pred:APPEARS_IN"
kind: "predicate"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#APPEARS_IN"]
aliases: ["appears in"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:c92b577aa6270997810f943fee273ceaa631ed793bf35efc9be77f17f1b05431"
---
# Predicate APPEARS_IN

| | |
| --- | --- |
| id | `pred:APPEARS_IN` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D9](../modules/D9.md) |
| subject types | [Person](../nodes/Person.md) |
| object types | [MediaWork](../nodes/MediaWork.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-CL-08`, `Q-D9-16`, `Q-D9-18` |

## Typed edge or Assertion only

A typed edge exists: [APPEARS_IN](../relationships/APPEARS_IN.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'APPEARS_IN'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#APPEARS_IN`
