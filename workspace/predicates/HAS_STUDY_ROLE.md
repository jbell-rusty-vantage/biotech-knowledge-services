---
id: "pred:HAS_STUDY_ROLE"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#HAS_STUDY_ROLE"]
aliases: ["has study role"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:382d8f523628604bfa76d146e6bfcb40f569e91d43c080052bc8252a54705299"
---
# Predicate HAS_STUDY_ROLE

| | |
| --- | --- |
| id | `pred:HAS_STUDY_ROLE` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [Study](../nodes/Study.md) |
| object types | [Award](../nodes/Award.md), [Organization](../nodes/Organization.md), [Person](../nodes/Person.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D10-22`, `Q-D11-08`, `Q-D13-01`, `Q-D13-02`, `Q-D13-03`, `Q-D3-02`, `Q-D3-08`, `Q-D3-09`, `Q-D3-10`, `Q-K-04`, `Q-K-07` |

## Typed edge or Assertion only

A typed edge exists: [HAS_STUDY_ROLE](../relationships/HAS_STUDY_ROLE.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'HAS_STUDY_ROLE'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#HAS_STUDY_ROLE`
