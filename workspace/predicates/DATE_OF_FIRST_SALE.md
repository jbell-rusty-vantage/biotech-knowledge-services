---
id: "pred:DATE_OF_FIRST_SALE"
kind: "predicate"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#DATE_OF_FIRST_SALE"]
aliases: ["date of first sale"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:4181b15c81eca57ec5fe14575c07d4b9dadba50ba01e313bd8792788911d0485"
---
# Predicate DATE_OF_FIRST_SALE

| | |
| --- | --- |
| id | `pred:DATE_OF_FIRST_SALE` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D13](../modules/D13.md) |
| subject types | [Event](../nodes/Event.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D7-04` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#DATE_OF_FIRST_SALE`
