---
id: "asmt:SAFETY_SIGNAL"
kind: "assessment"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/assessments.yaml#SAFETY_SIGNAL"]
aliases: ["safety signal","d10.signal-interpretation","d4.interference-risk","d4.measurement-error-recall","d4.unauthorized-measurement","d5.hepatotoxicity","d5.interaction-risk","d5.regulatory-restriction","d5.safety-signal","d5.surveillance-trend","d5.threshold-harm","d6.recalled-product-harm"]
capabilities: ["get","propose:assessment.record"]
cardDigest: "sha256:e71544ff3a01b5c3caf74af6bfad776ffe3ffe8bd85797c2a075da37628ef005"
---
# Assessment kind SAFETY_SIGNAL

An Assessment is a kernel record (`node:Assessment`) that judges its subjects through `ASSESSES` and cites evidence through `HAS_EVIDENCE`; `kind` is **SAFETY_SIGNAL**, `subkind` one of the 11 registered values below. See [Assessment](../nodes/Assessment.md) and [ASSESSES](../relationships/ASSESSES.md).

## Subkinds (11)

| subkind | registrar | status | conclusion codes | facets | admissible subjects | method versions |
| --- | --- | --- | --- | --- | --- | --- |
| `D10.signal-interpretation` | D10 | registered |  |  | [ChemicalSubstance](../nodes/ChemicalSubstance.md), [Condition](../nodes/Condition.md) | bl-signal/indication-check@0 (fixture) |
| `D4.interference-risk` | D4 | registered |  |  | [AssayVersion](../nodes/AssayVersion.md), [Condition](../nodes/Condition.md), [Metric](../nodes/Metric.md) | d4-safety-signal/0.1 (fixture) |
| `D4.measurement-error-recall` | D4 | registered |  |  | [Device](../nodes/Device.md), [Metric](../nodes/Metric.md) | d4-safety-signal/0.1 (fixture) |
| `D4.unauthorized-measurement` | D4 | registered |  |  | [Claim](../nodes/Claim.md), [Device](../nodes/Device.md), [Metric](../nodes/Metric.md), [Product](../nodes/Product.md) | d4-safety-signal/0.1 (fixture) |
| `D5.hepatotoxicity` | D5 | registered |  |  | [ChemicalSubstance](../nodes/ChemicalSubstance.md), [Taxon](../nodes/Taxon.md) | d5-safety-signal/v1 (fixture) |
| `D5.interaction-risk` | D5 | registered | `CONFIRMED_ASSOCIATION`, `INSUFFICIENT_DATA`, `NOT_SUPPORTED`, `POTENTIAL` | exposureChange=INCREASES_EXPOSURE |  |  |
| `D5.regulatory-restriction` | D5 | registered |  | jurisdiction=IN; plantPart=LEAF | [Taxon](../nodes/Taxon.md) | d5-safety-signal/v1 (fixture) |
| `D5.safety-signal` | D5 | registered | `CLOSED_NO_ACTION`, `CONFIRMED_ASSOCIATION`, `INSUFFICIENT_DATA`, `NOT_SUPPORTED`, `POTENTIAL`, `UNDER_EVALUATION` | coExposure=; dataSystem=CAERS\|FAERS\|NPDS\|OTHER\|VAERS; plantPart=AERIAL_PARTS\|BARK\|FLOWER\|FRUIT\|FRUITING_BODY\|LEAF\|MYCELIUM\|… | [ChemicalSubstance](../nodes/ChemicalSubstance.md), [IngredientMaterial](../nodes/IngredientMaterial.md), [Taxon](../nodes/Taxon.md) |  |
| `D5.surveillance-trend` | D5 | registered | `DECREASING`, `INCREASING`, `NOT_ASSESSABLE`, `STABLE` | dataSystem=; exposurePopulation=; period= |  |  |
| `D5.threshold-harm` | D5 | registered |  |  | [Constituent](../nodes/Constituent.md) | d5-safety-signal/v1 (fixture) |
| `D6.recalled-product-harm` | D6 | registered | `CONTAMINATION_CONFIRMED`, `CONTAMINATION_SUSPECTED`, `NOT_CONFIRMED` |  | [Package](../nodes/Package.md), [Product](../nodes/Product.md) | d6-recall-harm/v1 |

## Admissible subjects across subkinds

[AssayVersion](../nodes/AssayVersion.md), [ChemicalSubstance](../nodes/ChemicalSubstance.md), [Claim](../nodes/Claim.md), [Condition](../nodes/Condition.md), [Constituent](../nodes/Constituent.md), [Device](../nodes/Device.md), [IngredientMaterial](../nodes/IngredientMaterial.md), [Metric](../nodes/Metric.md), [Package](../nodes/Package.md), [Product](../nodes/Product.md), [Taxon](../nodes/Taxon.md)

## Source definition

- `release:vocabularies/assessments.yaml#SAFETY_SIGNAL`
