---
id: "asmt:EVIDENCE_SYNTHESIS"
kind: "assessment"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/assessments.yaml#EVIDENCE_SYNTHESIS"]
aliases: ["evidence synthesis","d10.harm-causality","d10.strength","d2.evidence-aggregate","d2.marketing-mechanism-support","d4.bio-age-claim-disconfirmation","d5.claim-disconfirmation","d5.step-evidence","d5.target-effect","d7.role-agreement"]
capabilities: ["get","propose:assessment.record"]
cardDigest: "sha256:6698f42f429afdfbbbe55c53a3f652dd442b842710d8dc1ef730025333fc9010"
---
# Assessment kind EVIDENCE_SYNTHESIS

An Assessment is a kernel record (`node:Assessment`) that judges its subjects through `ASSESSES` and cites evidence through `HAS_EVIDENCE`; `kind` is **EVIDENCE_SYNTHESIS**, `subkind` one of the 9 registered values below. See [Assessment](../nodes/Assessment.md) and [ASSESSES](../relationships/ASSESSES.md).

## Subkinds (9)

| subkind | registrar | status | conclusion codes | facets | admissible subjects | method versions |
| --- | --- | --- | --- | --- | --- | --- |
| `D10.harm-causality` | D10 | registered |  |  | [Condition](../nodes/Condition.md), [IngredientMaterial](../nodes/IngredientMaterial.md) | bl-harm/livertox-likelihood-mirror@0 (fixture) |
| `D10.strength` | D10 | registered |  |  | [Claim](../nodes/Claim.md) | bl-strength/regulator-review-mirror@0 (fixture) |
| `D2.evidence-aggregate` | D2 | registered |  |  | [ChemicalSubstance](../nodes/ChemicalSubstance.md), [Mechanism](../nodes/Mechanism.md), [MolecularEntity](../nodes/MolecularEntity.md) | bl-assoc/evidence-aggregate@1 |
| `D2.marketing-mechanism-support` | D2 | registered |  |  |  |  |
| `D4.bio-age-claim-disconfirmation` | D4 | registered |  |  | [Claim](../nodes/Claim.md) |  |
| `D5.claim-disconfirmation` | D5 | retired |  |  |  |  |
| `D5.step-evidence` | D5 | registered | `NOT_ASSESSED`, `NOT_SUPPORTED`, `PARTLY_SUPPORTED`, `SUPPORTED` | stepKey= |  |  |
| `D5.target-effect` | D5 | registered |  | outcomeUid= |  | d5-target-effect/0 (fixture) |
| `D7.role-agreement` | D7 | registered | `AGREE`, `CONFLICT_ON_INTERVAL`, `CONFLICT_ON_KIND`, `ONE_SIDED`, `ROLE_CLOSED` | intervalAgreement=AGREE\|CONFLICT\|ONE_SIDED; kindAgreement=AGREE\|CONFLICT | [Organization](../nodes/Organization.md), [Person](../nodes/Person.md) | D7.role-agreement@1 |

## Admissible subjects across subkinds

[ChemicalSubstance](../nodes/ChemicalSubstance.md), [Claim](../nodes/Claim.md), [Condition](../nodes/Condition.md), [IngredientMaterial](../nodes/IngredientMaterial.md), [Mechanism](../nodes/Mechanism.md), [MolecularEntity](../nodes/MolecularEntity.md), [Organization](../nodes/Organization.md), [Person](../nodes/Person.md)

## Source definition

- `release:vocabularies/assessments.yaml#EVIDENCE_SYNTHESIS`
