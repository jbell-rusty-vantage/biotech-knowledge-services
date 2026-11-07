---
id: "pred:INTERPRETS_RESULT"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#INTERPRETS_RESULT"]
aliases: ["interprets result"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:05b8cf64dae84f1e40efd57b8ce6a7cd3d7ff51a5e0ab86fb40ea89e32e6db56"
---
# Predicate INTERPRETS_RESULT

| | |
| --- | --- |
| id | `pred:INTERPRETS_RESULT` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [ChemicalSubstance](../nodes/ChemicalSubstance.md), [StudyResult](../nodes/StudyResult.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#INTERPRETS_RESULT`
