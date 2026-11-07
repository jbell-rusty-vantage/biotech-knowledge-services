---
id: "pred:RECOMMENDS_RETEST_INTERVAL"
kind: "predicate"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#RECOMMENDS_RETEST_INTERVAL"]
aliases: ["recommends retest interval"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:c1f860d7bf60ba586be0236a35015fb9865d3cb24a4de27bfccd93309ab56c77"
---
# Predicate RECOMMENDS_RETEST_INTERVAL

| | |
| --- | --- |
| id | `pred:RECOMMENDS_RETEST_INTERVAL` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D4](../modules/D4.md) |
| subject types | [LabTest](../nodes/LabTest.md), [Organization](../nodes/Organization.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D4-05` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#RECOMMENDS_RETEST_INTERVAL`
