---
id: "asmt:APPLICABILITY"
kind: "assessment"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/assessments.yaml#APPLICABILITY"]
aliases: ["applicability","d1.dose-mass-basis","d1.form-transfer","d1.preparation-relevance","d11.quantity-basis","d3.applicability","d3.applicability.dimension","d5.applicability","d6.blend-disclosure-rule","d8.conditions-of-use","d8.licence-coverage"]
capabilities: ["get","propose:assessment.record"]
cardDigest: "sha256:8978a76bf3b40ed81621fdff54b0d48870805458284a1bf1aa9e1fd006281b58"
---
# Assessment kind APPLICABILITY

An Assessment is a kernel record (`node:Assessment`) that judges its subjects through `ASSESSES` and cites evidence through `HAS_EVIDENCE`; `kind` is **APPLICABILITY**, `subkind` one of the 10 registered values below. See [Assessment](../nodes/Assessment.md) and [ASSESSES](../relationships/ASSESSES.md).

## Subkinds (10)

| subkind | registrar | status | conclusion codes | facets | admissible subjects | method versions |
| --- | --- | --- | --- | --- | --- | --- |
| `D1.dose-mass-basis` | D1 | registered |  |  | [InterventionComponent](../nodes/InterventionComponent.md) | d1-dose-basis/v1 (manual in this fixture); d1-dose-basis/v1 (manual) |
| `D1.form-transfer` | D1 | registered |  |  |  |  |
| `D1.preparation-relevance` | D1 | registered |  |  | [IngredientMaterial](../nodes/IngredientMaterial.md) | d1-preparation-relevance/v1 |
| `D11.quantity-basis` | D11 | requested |  |  |  |  |
| `D3.applicability` | D3 | registered | `APPLIES`, `APPLIES_WITH_ADJUSTMENT`, `DOES_NOT_APPLY`, `UNKNOWN_MISSING_FACTS` | contextOfUse=product-on-sale\|protocol | [Intervention](../nodes/Intervention.md), [InterventionComponent](../nodes/InterventionComponent.md), [ProductVariant](../nodes/ProductVariant.md), [Protocol](../nodes/Protocol.md), [Study](../nodes/Study.md), [StudyResult](../nodes/StudyResult.md) | d3-applicability/v1 (manual; parent conclusion = weakest dimension) |
| `D3.applicability.dimension` | D3 | registered | `APPLIES`, `APPLIES_WITH_ADJUSTMENT`, `UNKNOWN_MISSING_FACTS` | dimension=dose\|duration\|material\|outcome\|population\|setting; missing= | [ProductVariant](../nodes/ProductVariant.md), [Study](../nodes/Study.md) | d3-applicability/v1 (manual) |
| `D5.applicability` | D5 | registered | `APPLIES`, `APPLIES_WITH_DIFFERENCES`, `DOES_NOT_APPLY`, `UNKNOWN` | dimension=DOSE\|DURATION\|FORM\|OUTCOME\|POPULATION\|SCHEDULE |  |  |
| `D6.blend-disclosure-rule` | D6 | registered | `BLEND_TOTAL_ONLY_PERMITTED`, `NON_COMPLIANT_DISCLOSURE`, `NOT_APPLICABLE` |  | [LabelVersion](../nodes/LabelVersion.md) | d6-blend-rule/v1 |
| `D8.conditions-of-use` | D8 | registered |  |  |  |  |
| `D8.licence-coverage` | D8 | registered |  |  |  |  |

## Admissible subjects across subkinds

[IngredientMaterial](../nodes/IngredientMaterial.md), [Intervention](../nodes/Intervention.md), [InterventionComponent](../nodes/InterventionComponent.md), [LabelVersion](../nodes/LabelVersion.md), [ProductVariant](../nodes/ProductVariant.md), [Protocol](../nodes/Protocol.md), [Study](../nodes/Study.md), [StudyResult](../nodes/StudyResult.md)

## Source definition

- `release:vocabularies/assessments.yaml#APPLICABILITY`
