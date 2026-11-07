---
id: "pred:CORRECTS"
kind: "predicate"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#CORRECTS"]
aliases: ["corrects"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:e9e23e81a11612dbf29a8b58392f150c93739f6715cd8a5c11ace637d1d3545a"
---
# Predicate CORRECTS

| | |
| --- | --- |
| id | `pred:CORRECTS` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [K](../modules/K.md) |
| subject types | [ChemicalSubstance](../nodes/ChemicalSubstance.md) |
| object types | (none) |
| literal forms | `valueNumber` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D9-04`, `Q-D9-05` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueNumber`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#CORRECTS`
