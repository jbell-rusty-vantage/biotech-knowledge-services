---
id: "pred:STATED_CASE_COUNT"
kind: "predicate"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#STATED_CASE_COUNT"]
aliases: ["stated case count"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:09661ac4f0cbcfe6a4c214e655cfb492a632041bef1eef5765274391d99dcef9"
---
# Predicate STATED_CASE_COUNT

| | |
| --- | --- |
| id | `pred:STATED_CASE_COUNT` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D13](../modules/D13.md) |
| subject types | [Event](../nodes/Event.md) |
| object types | (none) |
| literal forms | `valueNumber` (unitCode {subjects}) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D13-26` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueNumber`, unit unitCode {subjects}) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#STATED_CASE_COUNT`
