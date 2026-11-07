---
id: "rule:evidence-path"
kind: "rule"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/assembled.graphql","release:registers/node-register.yaml"]
aliases: ["evidence-path","evidence path"]
capabilities: ["get","slice"]
cardDigest: "sha256:bc3fc9630f2c6b1743d21f38a8be3e4cdafe7d970fa102cd9f1557f7400e98fd"
---
# Evidence path

Derived from the schema topology of the pinned release (`search/adjacency.json`, typed edges only).

## From an Assertion to its Source

`(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`

| hop | type | stored direction | traversal |
| --- | --- | --- | --- |
| 1 | [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) | Assertion → SourceLocator | along-direction |
| 2 | [HAS_LOCATOR](../relationships/HAS_LOCATOR.md) | SourceSnapshot → SourceLocator | against-direction |
| 3 | [HAS_SNAPSHOT](../relationships/HAS_SNAPSHOT.md) | Source → SourceSnapshot | against-direction |

## Joins into the path

- A Subjectable node: `(x)<-[:HAS_SUBJECT]-(a:Assertion)` (and `HAS_OBJECT` for the object of a predicate).
- An asserted edge `r`: its authorizing Assertion is `(a:Assertion {uid: r.assertionUid})`.
- Adjudications and Assessments of an Assertion: `ASSESSES`; derived results: `DERIVED_FROM`.
- Capture fidelity (`status`) is not scientific truth; a support verdict is an adjudication, never an agent's note.

Use `bks-schema path node:<From> node:SourceLocator --max-hops 5` for a concrete type; the result is a schema path, not an instance claim.

## Provenance requirement by archetype

| requirement | node types |
| --- | --- |
| ASSERTED_BY an asserter, HAS_EVIDENCE to a SourceLocator (role, origin), WAS_GENERATED_BY the writing Activity; status is capture fidelity, never truth | [Assertion](../nodes/Assertion.md) |
| ASSESSES its target, DERIVED_FROM its inputs, HAS_EVIDENCE for located support, WAS_GENERATED_BY the assessing Activity; method version recorded | [Adjudication](../nodes/Adjudication.md), [Assessment](../nodes/Assessment.md) |
| WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version | [Agent](../nodes/Agent.md), [AlgorithmVersion](../nodes/AlgorithmVersion.md), [AssayVersion](../nodes/AssayVersion.md), [Association](../nodes/Association.md), [Award](../nodes/Award.md), [Biomarker](../nodes/Biomarker.md), [Brand](../nodes/Brand.md), [CaptureAttempt](../nodes/CaptureAttempt.md), [CertificationListing](../nodes/CertificationListing.md), [Channel](../nodes/Channel.md), [ChemicalSubstance](../nodes/ChemicalSubstance.md), [Chunk](../nodes/Chunk.md), [Claim](../nodes/Claim.md), [Condition](../nodes/Condition.md), [Constituent](../nodes/Constituent.md), [DecisionCriterion](../nodes/DecisionCriterion.md), [Device](../nodes/Device.md), [DietaryPattern](../nodes/DietaryPattern.md), [FoodCategory](../nodes/FoodCategory.md), [FoodItem](../nodes/FoodItem.md), [Frontier](../nodes/Frontier.md), [Identifier](../nodes/Identifier.md), [IngredientMaterial](../nodes/IngredientMaterial.md), [Intervention](../nodes/Intervention.md), [InterventionComponent](../nodes/InterventionComponent.md), [LabTest](../nodes/LabTest.md), [LabelVersion](../nodes/LabelVersion.md), [LegalStatus](../nodes/LegalStatus.md), [Lot](../nodes/Lot.md), [Mechanism](../nodes/Mechanism.md), [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md), [MediaWork](../nodes/MediaWork.md), [MerchantListing](../nodes/MerchantListing.md), [Metric](../nodes/Metric.md), [MolecularEntity](../nodes/MolecularEntity.md), [Offer](../nodes/Offer.md), [Organization](../nodes/Organization.md), [Outcome](../nodes/Outcome.md), [OutcomeDefinition](../nodes/OutcomeDefinition.md), [Package](../nodes/Package.md), [Patent](../nodes/Patent.md), [Person](../nodes/Person.md), [Product](../nodes/Product.md), [ProductVariant](../nodes/ProductVariant.md), [Protocol](../nodes/Protocol.md), [ProtocolEdition](../nodes/ProtocolEdition.md), [ProtocolStep](../nodes/ProtocolStep.md), [Publication](../nodes/Publication.md), [QualityResult](../nodes/QualityResult.md), [ReferenceIntervalVersion](../nodes/ReferenceIntervalVersion.md), [RegistrationVersion](../nodes/RegistrationVersion.md), [RegulatoryRecord](../nodes/RegulatoryRecord.md), [Source](../nodes/Source.md), [Study](../nodes/Study.md), [StudyArm](../nodes/StudyArm.md), [StudyPopulation](../nodes/StudyPopulation.md), [StudyResult](../nodes/StudyResult.md), [Target](../nodes/Target.md), [Taxon](../nodes/Taxon.md), [UseConstraint](../nodes/UseConstraint.md) |
| an Activity is one Mission Control run or a native namespaced run (OD-07); lineage via WAS_INFORMED_BY; capture attempts keep sanitized request metadata (EX-03) | [Activity](../nodes/Activity.md), [Event](../nodes/Event.md) |
| captured bytes: SourceSnapshot contentHash and capture Activity; locators reference exactly one snapshot; reports cite locators | [Report](../nodes/Report.md), [ReportItem](../nodes/ReportItem.md), [SourceLocator](../nodes/SourceLocator.md), [SourceSnapshot](../nodes/SourceSnapshot.md) |
