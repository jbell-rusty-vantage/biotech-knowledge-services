---
id: "pred:STATUS_FROM"
kind: "predicate"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#STATUS_FROM"]
aliases: ["status from"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:00dde079f48898c95378042eecb1b62aabfd2214fc5f07f07ecc1fc9ce2c4994"
---
# Predicate STATUS_FROM

| | |
| --- | --- |
| id | `pred:STATUS_FROM` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D8](../modules/D8.md) |
| subject types | [LegalStatus](../nodes/LegalStatus.md) |
| object types | [RegulatoryRecord](../nodes/RegulatoryRecord.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-AX-23`, `CQ-MF-02`, `CQ-PF-04`, `Q-D11-14`, `Q-D8-01`, `Q-D8-12`, `Q-D8-20`, `Q-D8-23` |

## Typed edge or Assertion only

A typed edge exists: [STATUS_FROM](../relationships/STATUS_FROM.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'STATUS_FROM'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#STATUS_FROM`
