---
id: "asmt:EQUIVALENCE"
kind: "assessment"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/assessments.yaml#EQUIVALENCE"]
aliases: ["equivalence","d1.identity-level.*","d12.food-equivalence","d4.algorithm-equivalence","d6.identifier-equivalence","d6.listing-to-package","d6.package-identity","d6.study-material-match","k.claim-relation"]
capabilities: ["get","propose:assessment.record"]
cardDigest: "sha256:6e7cf5f77a04ede66e040c02711635e53b21d72ee753780f6bad4a40526fba80"
---
# Assessment kind EQUIVALENCE

An Assessment is a kernel record (`node:Assessment`) that judges its subjects through `ASSESSES` and cites evidence through `HAS_EVIDENCE`; `kind` is **EQUIVALENCE**, `subkind` one of the 8 registered values below. See [Assessment](../nodes/Assessment.md) and [ASSESSES](../relationships/ASSESSES.md).

## Subkinds (8)

| subkind | registrar | status | conclusion codes | facets | admissible subjects | method versions |
| --- | --- | --- | --- | --- | --- | --- |
| `D1.identity-level.*` | D1 | registered |  |  | [IngredientMaterial](../nodes/IngredientMaterial.md), [LabelVersion](../nodes/LabelVersion.md) | d1-equivalence/v1 |
| `D12.food-equivalence` | D12 | registered | `EQUIVALENT`, `NOT_EQUIVALENT`, `PARTIAL` |  |  |  |
| `D4.algorithm-equivalence` | D4 | registered | `DISTINCT`, `SAME`, `UNRESOLVED` |  | [AlgorithmVersion](../nodes/AlgorithmVersion.md) | d4-algorithm-equivalence/0.1 (fixture) |
| `D6.identifier-equivalence` | D6 | registered | `DIFFERENT_PACKAGE`, `INSUFFICIENT_EVIDENCE`, `SAME_PACKAGE` |  | [Package](../nodes/Package.md) | d6-identifier-equivalence/v1 |
| `D6.listing-to-package` | D6 | registered | `DIRECTLY_SUPPORTED`, `INSUFFICIENT_EVIDENCE`, `NOT_SAME`, `PROPOSED_MATCH` |  | [MerchantListing](../nodes/MerchantListing.md), [Package](../nodes/Package.md) | d6-listing-match/v1 |
| `D6.package-identity` | D6 | registered | `INSUFFICIENT_EVIDENCE` |  | [Package](../nodes/Package.md) | d6-package-identity/v1 |
| `D6.study-material-match` | D6 | registered | `DIFFERENT_MATERIAL`, `SAME_MATERIAL`, `UNKNOWN` |  |  |  |
| `K.claim-relation` | K | registered | `REFINES` |  | [Claim](../nodes/Claim.md) |  |

## Admissible subjects across subkinds

[AlgorithmVersion](../nodes/AlgorithmVersion.md), [Claim](../nodes/Claim.md), [IngredientMaterial](../nodes/IngredientMaterial.md), [LabelVersion](../nodes/LabelVersion.md), [MerchantListing](../nodes/MerchantListing.md), [Package](../nodes/Package.md)

## Source definition

- `release:vocabularies/assessments.yaml#EQUIVALENCE`
