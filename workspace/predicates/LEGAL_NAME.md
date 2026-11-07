---
id: "pred:LEGAL_NAME"
kind: "predicate"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#LEGAL_NAME"]
aliases: ["legal name"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:af02a75f55da4387263f59d1e8e1c20437351a985c2d0fd5c098c1938d95e1b2"
---
# Predicate LEGAL_NAME

| | |
| --- | --- |
| id | `pred:LEGAL_NAME` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D7](../modules/D7.md) |
| subject types | [Organization](../nodes/Organization.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-EC-02`, `Q-D7-09` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#LEGAL_NAME`
