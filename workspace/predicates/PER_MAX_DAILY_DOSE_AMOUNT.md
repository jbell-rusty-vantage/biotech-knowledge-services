---
id: "pred:PER_MAX_DAILY_DOSE_AMOUNT"
kind: "predicate"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#PER_MAX_DAILY_DOSE_AMOUNT"]
aliases: ["per max daily dose amount"]
capabilities: ["get"]
cardDigest: "sha256:248fd9a3a3a7f2f21234a61ff9017acfcf51a1f42c6f4c9b46fceb3f23a60e79"
---
# Predicate PER_MAX_DAILY_DOSE_AMOUNT

| | |
| --- | --- |
| id | `pred:PER_MAX_DAILY_DOSE_AMOUNT` |
| kind | **retired** |
| route | **alias** |
| status | alias-of:CALCULATED_DAILY_MAX_INTAKE |
| registrar | [D1](../modules/D1.md) |
| subject types | [LabelVersion](../nodes/LabelVersion.md) |
| object types | [ChemicalSubstance](../nodes/ChemicalSubstance.md), [Constituent](../nodes/Constituent.md), [IngredientMaterial](../nodes/IngredientMaterial.md) |
| literal forms |  |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D1-02`, `Q-D1-03`, `Q-D1-05`, `Q-D1-19` |

## Typed edge or Assertion only

Alias of [CALCULATED_DAILY_MAX_INTAKE](CALCULATED_DAILY_MAX_INTAKE.md): re-key to the target before ingest (`predicateAliases`).

## Write route

No ordinary proposal writes this predicate. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#PER_MAX_DAILY_DOSE_AMOUNT`
