---
id: "pred:CITED_BY_COUNT"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#CITED_BY_COUNT"]
aliases: ["cited by count"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:7ab2a8fbec81c40167dded7ea0a9bb596c5ac63cc12b4c59dbe25bb2f5f519b3"
---
# Predicate CITED_BY_COUNT

| | |
| --- | --- |
| id | `pred:CITED_BY_COUNT` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [Publication](../nodes/Publication.md) |
| object types | (none) |
| literal forms | `valueNumber` ({citations}) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D3-15` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueNumber`, unit {citations}) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#CITED_BY_COUNT`
