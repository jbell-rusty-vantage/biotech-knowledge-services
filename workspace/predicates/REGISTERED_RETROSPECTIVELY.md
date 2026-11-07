---
id: "pred:REGISTERED_RETROSPECTIVELY"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#REGISTERED_RETROSPECTIVELY"]
aliases: ["registered retrospectively"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:2a6506732b3b14c26cd24d3b261ee702e1f5106b6cebb566ef7a60e3a7b14cd0"
---
# Predicate REGISTERED_RETROSPECTIVELY

| | |
| --- | --- |
| id | `pred:REGISTERED_RETROSPECTIVELY` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [Study](../nodes/Study.md) |
| object types | (none) |
| literal forms | `valueBoolean` |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueBoolean`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#REGISTERED_RETROSPECTIVELY`
