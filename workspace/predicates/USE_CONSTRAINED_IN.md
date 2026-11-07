---
id: "pred:USE_CONSTRAINED_IN"
kind: "predicate"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#USE_CONSTRAINED_IN"]
aliases: ["use constrained in"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:dfb181b19148d6197e7debc8cdeaceed73318c4193ac068b7c69df33d8686a44"
---
# Predicate USE_CONSTRAINED_IN

| | |
| --- | --- |
| id | `pred:USE_CONSTRAINED_IN` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D5](../modules/D5.md) |
| subject types | (none) |
| object types | [Condition](../nodes/Condition.md) |
| literal forms | `valueString` |
| qualifiers | `jurisdiction`, `population`, `route`, `section`, `window` · required `population` |
| aliases | (none) |
| questions | `Q-D11-11`, `Q-D5-03`, `Q-D5-11`, `Q-D5-16`, `Q-D5-17`, `Q-D5-21`, `Q-D5-23`, `Q-D5-24`, `Q-D5-26` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#USE_CONSTRAINED_IN`
