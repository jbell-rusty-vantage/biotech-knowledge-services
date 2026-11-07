---
id: "iface:Entity"
kind: "interface"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L34-L42"]
aliases: ["entity"]
capabilities: ["get","neighbors"]
cardDigest: "sha256:827cfa934d769dabade83cfea66e7b4a19b3583f7b477327c153aeb6255b6d31"
---
# Interface Entity

Every node type of every module implements Entity and lists these fields verbatim (GraphQL requires the listing; a module never changes their type, nullability or directives). `uid` (`hu:<token>:<opaque>`) is identity; `id` is the opaque segment; `name` is presentation only. `lastWriterRunId` is the Mission Control run id of the last intent that wrote the node (replaces `mongoResearchRunId`); authoritative lineage is WAS_GENERATED_BY an Activity with that `runId`. `createdAt`/`updatedAt` are executor-set (updatedAt is the precondition clock). Target of Activity.generated (WAS_GENERATED_BY). Questions: Q-K-03, Q-K-04, Q-K-05.

| | |
| --- | --- |
| id | `iface:Entity` · raw SDL [sdl:Entity](../sdl/Entity.graphql) |
| module | [K](../modules/K.md) |
| implementers | 69 |

## Fields

| property | type | required | description |
| --- | --- | --- | --- |
| `id` | `ID!` | yes |  |
| `uid` | `String!` | yes |  |
| `name` | `String` |  |  |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  |  |
| `lastWriterRunId` | `String` |  |  |
| `createdAt` | `DateTime` |  |  |
| `updatedAt` | `DateTime` |  |  |

## Relationship types with an endpoint declared as Entity (1)

These are kernel traversal edges or registered exceptions (OD-45): they reach every implementer. Expand members with `bks-schema neighbors iface:Entity --expand` only when you need them.

- [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) · structural · kernel-traversal

## Implementers (69)

[Source](../nodes/Source.md), [SourceSnapshot](../nodes/SourceSnapshot.md), [SourceLocator](../nodes/SourceLocator.md), [Assertion](../nodes/Assertion.md), [Adjudication](../nodes/Adjudication.md), [Claim](../nodes/Claim.md), [Assessment](../nodes/Assessment.md), [Report](../nodes/Report.md), [Activity](../nodes/Activity.md), [Agent](../nodes/Agent.md), [Identifier](../nodes/Identifier.md), [ChemicalSubstance](../nodes/ChemicalSubstance.md), [IngredientMaterial](../nodes/IngredientMaterial.md), [Constituent](../nodes/Constituent.md), [Taxon](../nodes/Taxon.md), [Mechanism](../nodes/Mechanism.md), [MolecularEntity](../nodes/MolecularEntity.md), [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md), [Condition](../nodes/Condition.md), [Outcome](../nodes/Outcome.md), [Study](../nodes/Study.md), [RegistrationVersion](../nodes/RegistrationVersion.md), [StudyArm](../nodes/StudyArm.md), [InterventionComponent](../nodes/InterventionComponent.md), [StudyPopulation](../nodes/StudyPopulation.md), [OutcomeDefinition](../nodes/OutcomeDefinition.md), [StudyResult](../nodes/StudyResult.md), [Publication](../nodes/Publication.md), [Biomarker](../nodes/Biomarker.md), [Metric](../nodes/Metric.md), [LabTest](../nodes/LabTest.md), [AssayVersion](../nodes/AssayVersion.md), [AlgorithmVersion](../nodes/AlgorithmVersion.md), [ReferenceIntervalVersion](../nodes/ReferenceIntervalVersion.md), [Device](../nodes/Device.md), [Target](../nodes/Target.md), [Intervention](../nodes/Intervention.md), [Protocol](../nodes/Protocol.md), [ProtocolEdition](../nodes/ProtocolEdition.md), [ProtocolStep](../nodes/ProtocolStep.md), [UseConstraint](../nodes/UseConstraint.md), [Product](../nodes/Product.md), [ProductVariant](../nodes/ProductVariant.md), [Package](../nodes/Package.md), [LabelVersion](../nodes/LabelVersion.md), [MerchantListing](../nodes/MerchantListing.md), [Offer](../nodes/Offer.md), [Organization](../nodes/Organization.md), [Person](../nodes/Person.md), [Brand](../nodes/Brand.md), [Award](../nodes/Award.md), [RegulatoryRecord](../nodes/RegulatoryRecord.md), [LegalStatus](../nodes/LegalStatus.md), [Lot](../nodes/Lot.md), [QualityResult](../nodes/QualityResult.md), [CertificationListing](../nodes/CertificationListing.md), [Patent](../nodes/Patent.md), [Channel](../nodes/Channel.md), [MediaWork](../nodes/MediaWork.md), [Chunk](../nodes/Chunk.md), [DecisionCriterion](../nodes/DecisionCriterion.md), [ReportItem](../nodes/ReportItem.md), [Association](../nodes/Association.md), [CaptureAttempt](../nodes/CaptureAttempt.md), [FoodItem](../nodes/FoodItem.md), [FoodCategory](../nodes/FoodCategory.md), [DietaryPattern](../nodes/DietaryPattern.md), [Event](../nodes/Event.md), [Frontier](../nodes/Frontier.md)
