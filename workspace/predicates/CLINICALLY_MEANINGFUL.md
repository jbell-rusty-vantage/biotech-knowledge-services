---
id: "pred:CLINICALLY_MEANINGFUL"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#CLINICALLY_MEANINGFUL"]
aliases: ["clinically meaningful"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:5a43c2ff2af1bb93d3374615d9e8ace9ff946f17ae1581d9167437f9d9c409c8"
---
# Predicate CLINICALLY_MEANINGFUL

| | |
| --- | --- |
| id | `pred:CLINICALLY_MEANINGFUL` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [StudyResult](../nodes/StudyResult.md) |
| object types | (none) |
| literal forms | `valueBoolean` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-ST-10` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueBoolean`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#CLINICALLY_MEANINGFUL`
