---
id: "asmt:OTHER"
kind: "assessment"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/assessments.yaml#OTHER"]
aliases: ["other","d3.dose-translation","d3.endpoint-classification","d3.result-interpretation","d6.authorized-channel","d6.certification-scope","d6.change-kind","d6.max-intake-vs-reference","d6.price-conflict","d6.recall-scope","d9.claim-spread","d9.independence","d9.influence"]
capabilities: ["get","propose:assessment.record"]
cardDigest: "sha256:8dee660797325edec9411089eb606ce5042cd9f7ed5f8e0a82d621ed59f6954d"
---
# Assessment kind OTHER

An Assessment is a kernel record (`node:Assessment`) that judges its subjects through `ASSESSES` and cites evidence through `HAS_EVIDENCE`; `kind` is **OTHER**, `subkind` one of the 12 registered values below. See [Assessment](../nodes/Assessment.md) and [ASSESSES](../relationships/ASSESSES.md).

## Subkinds (12)

| subkind | registrar | status | conclusion codes | facets | admissible subjects | method versions |
| --- | --- | --- | --- | --- | --- | --- |
| `D3.dose-translation` | D3 | registered | `HED_COMPUTED`, `NOT_TRANSLATABLE` | method=allometric\|bsa-km\|pk-based | [InterventionComponent](../nodes/InterventionComponent.md) | D3.dose-translation@1 |
| `D3.endpoint-classification` | D3 | registered | `BIOMARKER_NOT_SURROGATE`, `CANDIDATE_SURROGATE`, `CLINICAL_OUTCOME`, `REASONABLY_LIKELY_SURROGATE`, `UNCLASSIFIED`, `VALIDATED_SURROGATE` | bestCategory=DIAGNOSTIC\|MONITORING\|PHARMACODYNAMIC_RESPONSE\|PREDICTIVE\|P…; coaType=ClinRO\|ObsRO\|PRO\|PerfO; contextOfUse= | [OutcomeDefinition](../nodes/OutcomeDefinition.md) | D3.endpoint-classification@1 |
| `D3.result-interpretation` | D3 | registered | `BELOW_THRESHOLD`, `CLINICALLY_MEANINGFUL`, `NO_THRESHOLD_AVAILABLE`, `UNCERTAIN` | thresholdKind=MCID\|MID\|REFERENCE_RANGE\|REGULATORY | [StudyResult](../nodes/StudyResult.md) |  |
| `D6.authorized-channel` | D6 | registered | `AUTHORIZED`, `UNAUTHORIZED`, `UNKNOWN` |  | [Organization](../nodes/Organization.md), [Product](../nodes/Product.md) | d6-authorized-channel/v1 |
| `D6.certification-scope` | D6 | registered | `NOT_SUPPORTED`, `SUPPORTED`, `SUPPORTED_WITH_QUALIFICATION`, `UNKNOWN` |  | [CertificationListing](../nodes/CertificationListing.md), [LabelVersion](../nodes/LabelVersion.md) | d6-certification-scope/v1 |
| `D6.change-kind` | D6 | registered | `FORMULATION`, `IDENTITY`, `LABEL_ONLY`, `PACKAGE_ONLY`, `UNKNOWN` |  | [LabelVersion](../nodes/LabelVersion.md), [MerchantListing](../nodes/MerchantListing.md), [Package](../nodes/Package.md) | d6-change-kind/v1 |
| `D6.max-intake-vs-reference` | D6 | registered | `EXCEEDS_REFERENCE`, `NO_REFERENCE`, `WITHIN_REFERENCE` |  |  |  |
| `D6.price-conflict` | D6 | registered | `MIXED_OR_CONFLICTING` |  | [Offer](../nodes/Offer.md) | d6-price-conflict/v1 |
| `D6.recall-scope` | D6 | registered | `IN_SCOPE`, `NOT_IN_SCOPE`, `UNKNOWN` |  | [MerchantListing](../nodes/MerchantListing.md), [Package](../nodes/Package.md) | d6-recall-scope/v1 |
| `D9.claim-spread` | D9 | requested |  |  | [Claim](../nodes/Claim.md) |  |
| `D9.independence` | D9 | requested |  |  | [Claim](../nodes/Claim.md) |  |
| `D9.influence` | D9 | registered |  |  |  |  |

## Admissible subjects across subkinds

[CertificationListing](../nodes/CertificationListing.md), [Claim](../nodes/Claim.md), [InterventionComponent](../nodes/InterventionComponent.md), [LabelVersion](../nodes/LabelVersion.md), [MerchantListing](../nodes/MerchantListing.md), [Offer](../nodes/Offer.md), [Organization](../nodes/Organization.md), [OutcomeDefinition](../nodes/OutcomeDefinition.md), [Package](../nodes/Package.md), [Product](../nodes/Product.md), [StudyResult](../nodes/StudyResult.md)

## Source definition

- `release:vocabularies/assessments.yaml#OTHER`
