---
id: "pred:RANKS_OPTION"
kind: "predicate"
module: "D10"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#RANKS_OPTION"]
aliases: ["ranks option"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:1b108a4bfe5078f47901bbe814afa50cb7d50ff3bc130d093ee4a41e3740c5d3"
---
# Predicate RANKS_OPTION

| | |
| --- | --- |
| id | `pred:RANKS_OPTION` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D10](../modules/D10.md) |
| subject types | [Product](../nodes/Product.md) |
| object types | (none) |
| literal forms | `valueNumber`, `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D10-10`, `Q-D10-11` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueNumber`, `valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#RANKS_OPTION`
