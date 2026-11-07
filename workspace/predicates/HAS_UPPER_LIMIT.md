---
id: "pred:HAS_UPPER_LIMIT"
kind: "predicate"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#HAS_UPPER_LIMIT"]
aliases: ["has upper limit","UPPER_LIMIT_FOR_POPULATION","upper limit for population"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:57b35783401cf40f5e0fc970314490dcfec752adb203972234259c1d05d42813"
---
# Predicate HAS_UPPER_LIMIT

| | |
| --- | --- |
| id | `pred:HAS_UPPER_LIMIT` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D5](../modules/D5.md) |
| subject types | [Constituent](../nodes/Constituent.md) |
| object types | (none) |
| literal forms | `valueNumber`, `valueString` (unitCode (UCUM) |
| qualifiers | `ageBand`, `e.g.`, `intakeScope`, `limitKind`, `population` · required `population` |
| aliases | [UPPER_LIMIT_FOR_POPULATION](UPPER_LIMIT_FOR_POPULATION.md) |
| questions | `CQ-PF-01`, `Q-D1-02`, `Q-D1-03`, `Q-D1-11`, `Q-D1-12`, `Q-D1-15`, `Q-D1-19`, `Q-D1-24`, `Q-D5-03`, `Q-D5-06`, `Q-D5-09`, `Q-D5-11`, `Q-D5-21`, `Q-D5-24`, `Q-D5-26`, `Q-D6-09` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueNumber`, `valueString`, unit unitCode (UCUM) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#HAS_UPPER_LIMIT`
