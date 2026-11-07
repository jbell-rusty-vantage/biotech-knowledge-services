---
id: "pred:INCLUDES_TEST"
kind: "predicate"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#INCLUDES_TEST"]
aliases: ["includes test"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:a436f6e7d25b597d1e51c6612d708322ea842b271907b6c5da56c7e97cc6a69c"
---
# Predicate INCLUDES_TEST

| | |
| --- | --- |
| id | `pred:INCLUDES_TEST` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D4](../modules/D4.md) |
| subject types | [LabTest](../nodes/LabTest.md) |
| object types | [LabTest](../nodes/LabTest.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D4-03`, `Q-D4-25` |

## Typed edge or Assertion only

A typed edge exists: [INCLUDES_TEST](../relationships/INCLUDES_TEST.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'INCLUDES_TEST'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#INCLUDES_TEST`
