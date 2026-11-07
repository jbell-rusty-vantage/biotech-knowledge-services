---
id: "pred:CALCULATED_DAILY_MAX_INTAKE"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#CALCULATED_DAILY_MAX_INTAKE"]
aliases: ["calculated daily max intake","MAX_DAILY_SUPPLEMENTAL_AMOUNT","PER_MAX_DAILY_DOSE_AMOUNT","max daily supplemental amount","per max daily dose amount"]
capabilities: ["get"]
cardDigest: "sha256:c85a345febbe625332f9bf53d42df6df70ccbcf2d1e6aafc0d1c84691750eaa5"
---
# Predicate CALCULATED_DAILY_MAX_INTAKE

| | |
| --- | --- |
| id | `pred:CALCULATED_DAILY_MAX_INTAKE` |
| kind | **computation** |
| route | **computation** |
| status | registered |
| registrar | [D6](../modules/D6.md) |
| subject types | [LabelVersion](../nodes/LabelVersion.md) |
| object types | [ChemicalSubstance](../nodes/ChemicalSubstance.md), [Constituent](../nodes/Constituent.md), [IngredientMaterial](../nodes/IngredientMaterial.md) |
| literal forms | `valueNumber` |
| qualifiers | (none) |
| aliases | [MAX_DAILY_SUPPLEMENTAL_AMOUNT](MAX_DAILY_SUPPLEMENTAL_AMOUNT.md), [PER_MAX_DAILY_DOSE_AMOUNT](PER_MAX_DAILY_DOSE_AMOUNT.md) |
| questions | `CQ-PF-01`, `Q-D1-02`, `Q-D1-03`, `Q-D1-05`, `Q-D1-19`, `Q-D6-09` |

## Typed edge or Assertion only

Computation predicate: produced by a registered derivation rule / trusted job, never by an ordinary proposal; it is not source evidence.

## Write route

No ordinary proposal writes this predicate. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#CALCULATED_DAILY_MAX_INTAKE`
