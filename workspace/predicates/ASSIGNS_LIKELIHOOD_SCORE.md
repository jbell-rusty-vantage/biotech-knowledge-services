---
id: "pred:ASSIGNS_LIKELIHOOD_SCORE"
kind: "predicate"
module: "D10"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#ASSIGNS_LIKELIHOOD_SCORE"]
aliases: ["assigns likelihood score"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:1736494fd4c5f54b2784777dc08bb6adc1d4cd78f3e79607794af4b0d5f8005a"
---
# Predicate ASSIGNS_LIKELIHOOD_SCORE

| | |
| --- | --- |
| id | `pred:ASSIGNS_LIKELIHOOD_SCORE` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D10](../modules/D10.md) |
| subject types | [IngredientMaterial](../nodes/IngredientMaterial.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-AX-24`, `Q-D10-07` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#ASSIGNS_LIKELIHOOD_SCORE`
