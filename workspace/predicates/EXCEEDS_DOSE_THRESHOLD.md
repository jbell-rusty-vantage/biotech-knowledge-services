---
id: "pred:EXCEEDS_DOSE_THRESHOLD"
kind: "predicate"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#EXCEEDS_DOSE_THRESHOLD"]
aliases: ["exceeds dose threshold"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:50058305d05a0bffe4257856a9f14735ea28cfa5262c3f3a83c6485299e4a718"
---
# Predicate EXCEEDS_DOSE_THRESHOLD

| | |
| --- | --- |
| id | `pred:EXCEEDS_DOSE_THRESHOLD` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D1](../modules/D1.md) |
| subject types | (none) |
| object types | (none) |
| literal forms | `valueBoolean` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D1-03` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueBoolean`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#EXCEEDS_DOSE_THRESHOLD`
