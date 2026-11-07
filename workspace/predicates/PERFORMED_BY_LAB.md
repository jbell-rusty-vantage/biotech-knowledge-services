---
id: "pred:PERFORMED_BY_LAB"
kind: "predicate"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#PERFORMED_BY_LAB"]
aliases: ["performed by lab"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:d2256ff6296d80d6ee8a8ff9106b79d189cb04e4ee08fd4433ddf411773bdda3"
---
# Predicate PERFORMED_BY_LAB

| | |
| --- | --- |
| id | `pred:PERFORMED_BY_LAB` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D4](../modules/D4.md) |
| subject types | [AssayVersion](../nodes/AssayVersion.md) |
| object types | [Organization](../nodes/Organization.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-DX-01`, `CQ-DX-03`, `Q-D4-04` |

## Typed edge or Assertion only

A typed edge exists: [PERFORMED_BY_LAB](../relationships/PERFORMED_BY_LAB.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'PERFORMED_BY_LAB'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#PERFORMED_BY_LAB`
