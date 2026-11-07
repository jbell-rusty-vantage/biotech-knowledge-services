---
id: "pred:RECORD_LAST_UPDATED"
kind: "predicate"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#RECORD_LAST_UPDATED"]
aliases: ["record last updated"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:28d33d99d9526bf0f12505769e88301316167a0588f1a89bc64f8a44ccdd3887"
---
# Predicate RECORD_LAST_UPDATED

| | |
| --- | --- |
| id | `pred:RECORD_LAST_UPDATED` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [K](../modules/K.md) |
| subject types | [Source](../nodes/Source.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-PV-05` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#RECORD_LAST_UPDATED`
