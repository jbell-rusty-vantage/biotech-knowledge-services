---
id: "pred:NAMES_RESPONSIBLE_PARTY"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#NAMES_RESPONSIBLE_PARTY"]
aliases: ["names responsible party"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:bfd08197b8068bea70584e37a907ed9e66c12c615ce899d0531f48a8a9a2cfdb"
---
# Predicate NAMES_RESPONSIBLE_PARTY

| | |
| --- | --- |
| id | `pred:NAMES_RESPONSIBLE_PARTY` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D6](../modules/D6.md) |
| subject types | [LabelVersion](../nodes/LabelVersion.md) |
| object types | [Organization](../nodes/Organization.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D6-04`, `Q-D6-16`, `Q-D9-02` |

## Typed edge or Assertion only

A typed edge exists: [NAMES_RESPONSIBLE_PARTY](../relationships/NAMES_RESPONSIBLE_PARTY.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'NAMES_RESPONSIBLE_PARTY'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#NAMES_RESPONSIBLE_PARTY`
