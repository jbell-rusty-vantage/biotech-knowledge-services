---
id: "dom:exposures-and-interventions"
kind: "domain"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/domains.yaml#exposures-and-interventions"]
aliases: ["exposures-and-interventions","exposures and interventions"]
capabilities: ["get","slice"]
cardDigest: "sha256:652e0e890d8f77674c199505a33bdea91644adc18b16536fc14983f7dbb33ad6"
---
# Domain: Interventions, protocols, safety, food and nutrition

Id `dom:exposures-and-interventions` · modules [D5](../modules/D5.md), [D12](../modules/D12.md) · 9 node types · 3 internal relationship types · seams to 6 other domains.

Targets (what helps or hurts), interventions, protocols with editions and steps, use constraints (dose limits, contraindications, interactions); foods, food categories and dietary patterns with their sourced content.

## Questions this domain answers

- What does edition N of this protocol prescribe, in what order, with which dose and timing?
- Which use constraints (upper limits, contraindications, interactions) apply to this substance in this population?
- What does this food contain per stated basis, and which source states it (FOOD_CONTAINS statementKind)?

## Write guidance

Help and harm toward a Target are Assertions or Assessments (IMPROVES_TARGET, WORSENS_TARGET ...), never a typed edge from a means to a Target. A changed protocol instruction is a new ProtocolEdition; disclosure-only changes are not.

## Start with these types

- [Target](../nodes/Target.md) — Purpose: one curated goal people pursue (sleep, strength, brain fitness, body composition, longevity, energy, mood, recovery ...): the shared targets…
- [Intervention](../nodes/Intervention.md) — Purpose: an intervention CONCEPT that is not simply a substance or a product: a practice (morning sunlight viewing, sauna bathing, resistance trainin…
- [Protocol](../nodes/Protocol.md) — Purpose: the enduring identity of a public protocol (a creator's toolkit page, a published longevity protocol, a clinic's program definition).
- [ProtocolEdition](../nodes/ProtocolEdition.md) — Purpose: the immutable content of one observed or published state of a Protocol: its ordered steps (with their doses, timing, stated constraints, sta…
- [ProtocolStep](../nodes/ProtocolStep.md) — Purpose: one step of a protocol edition: what to do (stepKind), with what (STEP_USES -> substance, product, food, practice, or the Metric a MEASURE s…
- [UseConstraint](../nodes/UseConstraint.md) — Purpose: the shared, stable identity of one scoped use concern, "use of S [above a dose band] [by a route] [in a jurisdiction] together with these sc…
- [FoodItem](../nodes/FoodItem.md) — Purpose: a reference food concept as one composition or food-ontology source defines it, at the preparation it names ("Potatoes, russet, flesh and sk…
- [FoodCategory](../nodes/FoodCategory.md) — Purpose: a food group as one classification system defines it (NOVA group 4 "ultra-processed food and drink products"; IARC agent "processed meat"; W…
- [DietaryPattern](../nodes/DietaryPattern.md) — Purpose: a dietary pattern as one defining source states it — what foods, groups or nutrients it includes, emphasizes, limits or excludes, and when o…

## Node types (9)

| type | module | uid token | summary |
| --- | --- | --- | --- |
| [DietaryPattern](../nodes/DietaryPattern.md) | D12 | `hu:dietary-pattern:` | Purpose: a dietary pattern as one defining source states it — what foods, groups or nutrients it includes, emphasizes, limits or excludes,… |
| [FoodCategory](../nodes/FoodCategory.md) | D12 | `hu:food-category:` | Purpose: a food group as one classification system defines it (NOVA group 4 "ultra-processed food and drink products"; IARC agent "processe… |
| [FoodItem](../nodes/FoodItem.md) | D12 | `hu:food:` | Purpose: a reference food concept as one composition or food-ontology source defines it, at the preparation it names ("Potatoes, russet, fl… |
| [Intervention](../nodes/Intervention.md) | D5 | `hu:intervention:` | Purpose: an intervention CONCEPT that is not simply a substance or a product: a practice (morning sunlight viewing, sauna bathing, resistan… |
| [Protocol](../nodes/Protocol.md) | D5 | `hu:protocol:` | Purpose: the enduring identity of a public protocol (a creator's toolkit page, a published longevity protocol, a clinic's program definitio… |
| [ProtocolEdition](../nodes/ProtocolEdition.md) | D5 | `hu:protocol-edition:` | Purpose: the immutable content of one observed or published state of a Protocol: its ordered steps (with their doses, timing, stated constr… |
| [ProtocolStep](../nodes/ProtocolStep.md) | D5 | `hu:protocol-step:` | Purpose: one step of a protocol edition: what to do (stepKind), with what (STEP_USES -> substance, product, food, practice, or the Metric a… |
| [Target](../nodes/Target.md) | D5 | `hu:target:` | Purpose: one curated goal people pursue (sleep, strength, brain fitness, body composition, longevity, energy, mood, recovery ...): the shar… |
| [UseConstraint](../nodes/UseConstraint.md) | D5 | `hu:use-constraint:` | Purpose: the shared, stable identity of one scoped use concern, "use of S [above a dose band] [by a route] [in a jurisdiction] together wit… |

## Relationship types inside the domain (3)

| type | class | temporal | endpoints |
| --- | --- | --- | --- |
| [HAS_EDITION](../relationships/HAS_EDITION.md) | asserted | episode, exclusive | Protocol → ProtocolEdition |
| [HAS_STEP](../relationships/HAS_STEP.md) | structural | recorded-only | ProtocolEdition → ProtocolStep |
| [STATES_CONSTRAINT](../relationships/STATES_CONSTRAINT.md) | derived | recorded-only (derivedAt) | ProtocolStep → UseConstraint |

## Seams to other domains

### → [derived-knowledge-and-reports](derived-knowledge-and-reports.md) (1)

- [BLOCKED_BY](../relationships/BLOCKED_BY.md) · structural · ReportItem → UseConstraint|Assessment

### → [diagnostics-and-devices](diagnostics-and-devices.md) (1)

- [OPERATIONALIZED_BY](../relationships/OPERATIONALIZED_BY.md) · asserted · Target → Biomarker|Metric|Outcome|Condition

### → [kernel-and-provenance](kernel-and-provenance.md) (1)

- [RESOLVES_TO_CONSTRAINT](../relationships/RESOLVES_TO_CONSTRAINT.md) · derived · Assertion → UseConstraint

### → [products-and-commerce](products-and-commerce.md) (3)

- [DECLARES_COMPONENT](../relationships/DECLARES_COMPONENT.md) · asserted · LabelVersion → IngredientMaterial|Constituent|FoodItem
- [HAS_REFERENCE_FOOD](../relationships/HAS_REFERENCE_FOOD.md) · asserted · Product → FoodItem
- [IN_FOOD_CATEGORY](../relationships/IN_FOOD_CATEGORY.md) · asserted · FoodItem|Product → FoodCategory

### → [studies-and-evidence](studies-and-evidence.md) (1)

- [ADMINISTERS](../relationships/ADMINISTERS.md) · asserted · InterventionComponent → IngredientMaterial|ProductVariant|Intervention|FoodItem|DietaryPattern

### → [substances-and-biology](substances-and-biology.md) (5)

- [AFFECTS_MECHANISM](../relationships/AFFECTS_MECHANISM.md) · derived · ChemicalSubstance|Intervention → Mechanism
- [EXPOSED_TO](../relationships/EXPOSED_TO.md) · structural · MechanismEvidenceContext → ChemicalSubstance|IngredientMaterial|Intervention
- [FOOD_CONTAINS](../relationships/FOOD_CONTAINS.md) · asserted · FoodItem → ChemicalSubstance|Constituent
- [OPERATIONALIZED_BY](../relationships/OPERATIONALIZED_BY.md) · asserted · Target → Biomarker|Metric|Outcome|Condition
- [PATTERN_COMPONENT](../relationships/PATTERN_COMPONENT.md) · asserted · DietaryPattern → FoodItem|FoodCategory|Constituent

## Tasks

(none)

## v1 navigation aliases

(none)
