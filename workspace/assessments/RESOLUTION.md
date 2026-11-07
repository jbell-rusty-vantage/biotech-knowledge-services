---
id: "asmt:RESOLUTION"
kind: "assessment"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/assessments.yaml#RESOLUTION"]
aliases: ["resolution","d1.common-name-resolution","d1.label-string-resolution","d1.mass-basis-resolution","d1.mention-resolution","d1.strain-resolution","d11.authority-identity-check","d11.text-mining-proposal","d3.registry-id-resolution","d4.measurement-name-resolution","d6.seller-account-to-organization","d7.organization-resolution","d7.person-resolution","d8.cited-identifier-resolution"]
capabilities: ["get","propose:assessment.record"]
cardDigest: "sha256:f79713c8f9f1e8e2b2661cb58b5823a1f7381fa8ad9e8c7a2db2aadc35aa20d8"
---
# Assessment kind RESOLUTION

An Assessment is a kernel record (`node:Assessment`) that judges its subjects through `ASSESSES` and cites evidence through `HAS_EVIDENCE`; `kind` is **RESOLUTION**, `subkind` one of the 13 registered values below. See [Assessment](../nodes/Assessment.md) and [ASSESSES](../relationships/ASSESSES.md).

## Subkinds (13)

| subkind | registrar | status | conclusion codes | facets | admissible subjects | method versions |
| --- | --- | --- | --- | --- | --- | --- |
| `D1.common-name-resolution` | D1 | registered |  |  | [Taxon](../nodes/Taxon.md) | d1-resolve/v1 |
| `D1.label-string-resolution` | D1 | registered |  |  | [ChemicalSubstance](../nodes/ChemicalSubstance.md), [IngredientMaterial](../nodes/IngredientMaterial.md) | d1-resolve/v1; d1-resolve/v1 (name normalization + GSRS name search; manual che… |
| `D1.mass-basis-resolution` | D1 | registered | `INSUFFICIENT_EVIDENCE` |  | [IngredientMaterial](../nodes/IngredientMaterial.md), [LabelVersion](../nodes/LabelVersion.md) | d1-resolve/v1 |
| `D1.mention-resolution` | D1 | registered |  |  | [ChemicalSubstance](../nodes/ChemicalSubstance.md), [IngredientMaterial](../nodes/IngredientMaterial.md) | entity-link/v1 |
| `D1.strain-resolution` | D1 | registered |  |  | [Taxon](../nodes/Taxon.md) | d1-strain-resolve/v1 |
| `D11.authority-identity-check` | D11 | registered |  |  | [ChemicalSubstance](../nodes/ChemicalSubstance.md) | identity-check/v1 |
| `D11.text-mining-proposal` | D11 | registered |  |  |  | europepmc-annotations (provider 'Europe PMC', type Chemicals; API exposes no an… |
| `D3.registry-id-resolution` | D3 | registered |  |  | [Publication](../nodes/Publication.md), [Source](../nodes/Source.md), [Study](../nodes/Study.md) | d3-registry-resolve/v1 (manual in this fixture); d3-registry-resolve/v1 (manual… |
| `D4.measurement-name-resolution` | D4 | registered | `AMBIGUOUS`, `CANDIDATE`, `NO_MATCH`, `RESOLVED` |  | [Metric](../nodes/Metric.md), [SourceLocator](../nodes/SourceLocator.md) | d4-name-resolution/0.1 (fixture: exact analyte-name match) |
| `D6.seller-account-to-organization` | D6 | registered | `PROPOSED_MATCH`, `RESOLVED`, `UNRESOLVED` |  | [Offer](../nodes/Offer.md), [Organization](../nodes/Organization.md) | d6-seller-resolution/v1 |
| `D7.organization-resolution` | D7 | registered |  |  | [Organization](../nodes/Organization.md) | entity-link/v1 + manual |
| `D7.person-resolution` | D7 | registered |  | surfaceForm=; typeHint= | [Organization](../nodes/Organization.md), [Person](../nodes/Person.md) | manual |
| `D8.cited-identifier-resolution` | D8 | registered |  |  |  |  |

## Admissible subjects across subkinds

[ChemicalSubstance](../nodes/ChemicalSubstance.md), [IngredientMaterial](../nodes/IngredientMaterial.md), [LabelVersion](../nodes/LabelVersion.md), [Metric](../nodes/Metric.md), [Offer](../nodes/Offer.md), [Organization](../nodes/Organization.md), [Person](../nodes/Person.md), [Publication](../nodes/Publication.md), [Source](../nodes/Source.md), [SourceLocator](../nodes/SourceLocator.md), [Study](../nodes/Study.md), [Taxon](../nodes/Taxon.md)

## Source definition

- `release:vocabularies/assessments.yaml#RESOLUTION`
