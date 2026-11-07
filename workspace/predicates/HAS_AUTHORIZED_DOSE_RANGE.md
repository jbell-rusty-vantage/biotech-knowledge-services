---
id: "pred:HAS_AUTHORIZED_DOSE_RANGE"
kind: "predicate"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#HAS_AUTHORIZED_DOSE_RANGE"]
aliases: ["has authorized dose range"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:ca921a83e2baeb1f89b669157f5e5e9278398d3dc4b74059e120c25f61c6e59e"
---
# Predicate HAS_AUTHORIZED_DOSE_RANGE

| | |
| --- | --- |
| id | `pred:HAS_AUTHORIZED_DOSE_RANGE` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D5](../modules/D5.md) |
| subject types | [Constituent](../nodes/Constituent.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | `jurisdiction`, `population`, `use` · required `population` |
| aliases | (none) |
| questions | `Q-D5-06`, `Q-D5-21` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#HAS_AUTHORIZED_DOSE_RANGE`
