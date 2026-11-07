---
id: "iface:Subjectable"
kind: "interface"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L58-L61"]
aliases: ["subjectable"]
capabilities: ["get","neighbors"]
cardDigest: "sha256:6f165de45ceb8cd567a4e809d3d5c51fcf693f4d94763a1f1ab4d70db87068d7"
---
# Interface Subjectable

The thin interface for anything an Assertion can be about, an Identifier can identify, a D9 Chunk can mention, an Assessment, Report or Activity can assess, or an asserter can be. Every domain entity type implements `Entity & Subjectable`; kernel implementers are Source, Agent and Claim. A versioned state that carries a registry identifier, or that is the subject or object of an Assertion or the target of an Assessment, implements `Entity & Subjectable`; other payload and retrieval structures implement `Entity` only (R-18). The subject of an Assertion is the most specific record the source speaks about; evidence rolls up to the parent through the state episodes. It declares no relationship fields: the kernel edges that target it (HAS_SUBJECT, HAS_OBJECT, ASSERTED_BY, HAS_IDENTIFIER, ASSESSES) are declared once, on kernel types, and D9 declares MENTIONS (derived) on Chunk, so adding an implementer costs one enum value in the executable schema. Domain edges that target it: kernel-meaning types (ASSESSES, DERIVED_FROM, MENTIONS) plus two registered exceptions, D10 ASSOCIATES (derived) and D5 STEP_USES (structural, executor-checked type list); any other domain edge to Subjectable needs a kernel amendment (R-28). Questions: Q-K-01, Q-K-12, Q-K-14.

| | |
| --- | --- |
| id | `iface:Subjectable` · raw SDL [sdl:Subjectable](../sdl/Subjectable.graphql) |
| module | [K](../modules/K.md) |
| implementers | 56 |

## Fields

| property | type | required | description |
| --- | --- | --- | --- |
| `uid` | `String!` | yes |  |
| `name` | `String` |  |  |

## Relationship types with an endpoint declared as Subjectable (8)

These are kernel traversal edges or registered exceptions (OD-45): they reach every implementer. Expand members with `bks-schema neighbors iface:Subjectable --expand` only when you need them.

- [ASSERTED_BY](../relationships/ASSERTED_BY.md) · structural · kernel-traversal
- [ASSESSES](../relationships/ASSESSES.md) · structural · kernel-traversal
- [ASSOCIATES](../relationships/ASSOCIATES.md) · derived · registered-exception
- [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) · asserted · kernel-traversal
- [HAS_OBJECT](../relationships/HAS_OBJECT.md) · structural · kernel-traversal
- [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) · structural · kernel-traversal
- [MENTIONS](../relationships/MENTIONS.md) · derived · kernel-traversal
- [STEP_USES](../relationships/STEP_USES.md) · structural · registered-exception

## Implementers (56)

[Source](../nodes/Source.md), [Claim](../nodes/Claim.md), [Agent](../nodes/Agent.md), [ChemicalSubstance](../nodes/ChemicalSubstance.md), [IngredientMaterial](../nodes/IngredientMaterial.md), [Constituent](../nodes/Constituent.md), [Taxon](../nodes/Taxon.md), [Mechanism](../nodes/Mechanism.md), [MolecularEntity](../nodes/MolecularEntity.md), [Condition](../nodes/Condition.md), [Outcome](../nodes/Outcome.md), [Study](../nodes/Study.md), [RegistrationVersion](../nodes/RegistrationVersion.md), [StudyArm](../nodes/StudyArm.md), [InterventionComponent](../nodes/InterventionComponent.md), [StudyPopulation](../nodes/StudyPopulation.md), [OutcomeDefinition](../nodes/OutcomeDefinition.md), [StudyResult](../nodes/StudyResult.md), [Publication](../nodes/Publication.md), [Biomarker](../nodes/Biomarker.md), [Metric](../nodes/Metric.md), [LabTest](../nodes/LabTest.md), [AssayVersion](../nodes/AssayVersion.md), [AlgorithmVersion](../nodes/AlgorithmVersion.md), [ReferenceIntervalVersion](../nodes/ReferenceIntervalVersion.md), [Device](../nodes/Device.md), [Target](../nodes/Target.md), [Intervention](../nodes/Intervention.md), [Protocol](../nodes/Protocol.md), [ProtocolEdition](../nodes/ProtocolEdition.md), [ProtocolStep](../nodes/ProtocolStep.md), [UseConstraint](../nodes/UseConstraint.md), [Product](../nodes/Product.md), [ProductVariant](../nodes/ProductVariant.md), [Package](../nodes/Package.md), [LabelVersion](../nodes/LabelVersion.md), [MerchantListing](../nodes/MerchantListing.md), [Offer](../nodes/Offer.md), [Organization](../nodes/Organization.md), [Person](../nodes/Person.md), [Brand](../nodes/Brand.md), [Award](../nodes/Award.md), [RegulatoryRecord](../nodes/RegulatoryRecord.md), [LegalStatus](../nodes/LegalStatus.md), [Lot](../nodes/Lot.md), [QualityResult](../nodes/QualityResult.md), [CertificationListing](../nodes/CertificationListing.md), [Patent](../nodes/Patent.md), [Channel](../nodes/Channel.md), [MediaWork](../nodes/MediaWork.md), [DecisionCriterion](../nodes/DecisionCriterion.md), [FoodItem](../nodes/FoodItem.md), [FoodCategory](../nodes/FoodCategory.md), [DietaryPattern](../nodes/DietaryPattern.md), [Event](../nodes/Event.md), [Frontier](../nodes/Frontier.md)
