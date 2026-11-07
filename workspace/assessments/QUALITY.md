---
id: "asmt:QUALITY"
kind: "assessment"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/assessments.yaml#QUALITY"]
aliases: ["quality","d1.identity-granularity","d3.evidence-strength","d4.change-detectability","d7.disclosure-coverage","d8.coa-classification","d8.gmp-signal","d8.spec-conformance","d9.capture-error","d9.dose-statement-risk","d9.source-internal-inconsistency"]
capabilities: ["get","propose:assessment.record"]
cardDigest: "sha256:618782c929bb88d8ea431d805562d53cc7ddb63d6fc32396806579eaafe1d3cd"
---
# Assessment kind QUALITY

An Assessment is a kernel record (`node:Assessment`) that judges its subjects through `ASSESSES` and cites evidence through `HAS_EVIDENCE`; `kind` is **QUALITY**, `subkind` one of the 10 registered values below. See [Assessment](../nodes/Assessment.md) and [ASSESSES](../relationships/ASSESSES.md).

## Subkinds (10)

| subkind | registrar | status | conclusion codes | facets | admissible subjects | method versions |
| --- | --- | --- | --- | --- | --- | --- |
| `D1.identity-granularity` | D1 | registered |  |  | [ChemicalSubstance](../nodes/ChemicalSubstance.md), [IngredientMaterial](../nodes/IngredientMaterial.md) | d1-identity-quality/v1 |
| `D3.evidence-strength` | D3 | registered |  | downgrade=imprecision\|inconsistency\|indirectness\|publication-bias\|ris…; upgrade=confounding\|dose-response\|large-effect | [Claim](../nodes/Claim.md), [Study](../nodes/Study.md) |  |
| `D4.change-detectability` | D4 | registered | `CHANGE_DETECTABLE`, `NOT_ESTABLISHED`, `NO_RELIABILITY_SOURCE` |  | [AlgorithmVersion](../nodes/AlgorithmVersion.md), [Assertion](../nodes/Assertion.md) | d4-change-detectability/0.1 (fixture) |
| `D7.disclosure-coverage` | D7 | registered | `COMPLETE_NONE_FOUND`, `NOT_FOUND_IN_PARTIAL_CAPTURE`, `SOURCE_DECLARED_INCOMPLETE` | captureCompleteness=COMPLETE\|NOT_CAPTURABLE\|PARTIAL_EXCERPT | [Person](../nodes/Person.md) |  |
| `D8.coa-classification` | D8 | registered |  |  |  | d8-coa-classification/0.1 (fixture) |
| `D8.gmp-signal` | D8 | registered |  |  |  |  |
| `D8.spec-conformance` | D8 | registered |  |  |  |  |
| `D9.capture-error` | D9 | registered |  | errorKind=ASR\|ATTRIBUTION\|OCR\|QUANTITY_BASIS\|TRANSCRIPT_DIVERGENCE\|UN… |  |  |
| `D9.dose-statement-risk` | D9 | registered | `CORRECTED_QUANTITY` | correctionPlacement=SHOW_NOTES_ONLY; errorKind=; ratioSpokenToCorrected= |  |  |
| `D9.source-internal-inconsistency` | D9 | requested |  |  | [LabelVersion](../nodes/LabelVersion.md), [Source](../nodes/Source.md) | d6-source-consistency/v1 |

## Admissible subjects across subkinds

[AlgorithmVersion](../nodes/AlgorithmVersion.md), [Assertion](../nodes/Assertion.md), [ChemicalSubstance](../nodes/ChemicalSubstance.md), [Claim](../nodes/Claim.md), [IngredientMaterial](../nodes/IngredientMaterial.md), [LabelVersion](../nodes/LabelVersion.md), [Person](../nodes/Person.md), [Source](../nodes/Source.md), [Study](../nodes/Study.md)

## Source definition

- `release:vocabularies/assessments.yaml#QUALITY`
