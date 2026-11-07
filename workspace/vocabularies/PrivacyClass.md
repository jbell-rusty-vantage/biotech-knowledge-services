---
id: "enum:PrivacyClass"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L179-L182"]
aliases: ["privacy class"]
capabilities: ["get"]
cardDigest: "sha256:d5867b1725e76af68cccc78045bdda62d4d5d7f586a39bd192d9ab256a8c47ad"
---
# Enum PrivacyClass

Access class. There is no private-personal value; null is not public (fail closed).

Id `enum:PrivacyClass` · module [K](../modules/K.md) · 2 values · used by 70 fields · raw SDL [sdl:PrivacyClass](../sdl/PrivacyClass.graphql)

## Values (2)

| value | description |
| --- | --- |
| `PUBLIC` |  |
| `INTERNAL` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Entity](../interfaces/Entity.md).`privacyClass`
- [Source](../nodes/Source.md).`privacyClass`
- [SourceSnapshot](../nodes/SourceSnapshot.md).`privacyClass`
- [SourceLocator](../nodes/SourceLocator.md).`privacyClass`
- [Assertion](../nodes/Assertion.md).`privacyClass`
- [Adjudication](../nodes/Adjudication.md).`privacyClass`
- [Claim](../nodes/Claim.md).`privacyClass`
- [Assessment](../nodes/Assessment.md).`privacyClass`
- [Report](../nodes/Report.md).`privacyClass`
- [Activity](../nodes/Activity.md).`privacyClass`
- [Agent](../nodes/Agent.md).`privacyClass`
- [Identifier](../nodes/Identifier.md).`privacyClass`
- [ChemicalSubstance](../nodes/ChemicalSubstance.md).`privacyClass`
- [IngredientMaterial](../nodes/IngredientMaterial.md).`privacyClass`
- [Constituent](../nodes/Constituent.md).`privacyClass`
- [Taxon](../nodes/Taxon.md).`privacyClass`
- [Mechanism](../nodes/Mechanism.md).`privacyClass`
- [MolecularEntity](../nodes/MolecularEntity.md).`privacyClass`
- [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md).`privacyClass`
- [Condition](../nodes/Condition.md).`privacyClass`
- [Outcome](../nodes/Outcome.md).`privacyClass`
- [Study](../nodes/Study.md).`privacyClass`
- [RegistrationVersion](../nodes/RegistrationVersion.md).`privacyClass`
- [StudyArm](../nodes/StudyArm.md).`privacyClass`
- [InterventionComponent](../nodes/InterventionComponent.md).`privacyClass`
- [StudyPopulation](../nodes/StudyPopulation.md).`privacyClass`
- [OutcomeDefinition](../nodes/OutcomeDefinition.md).`privacyClass`
- [StudyResult](../nodes/StudyResult.md).`privacyClass`
- [Publication](../nodes/Publication.md).`privacyClass`
- [Biomarker](../nodes/Biomarker.md).`privacyClass`
- [Metric](../nodes/Metric.md).`privacyClass`
- [LabTest](../nodes/LabTest.md).`privacyClass`
- [AssayVersion](../nodes/AssayVersion.md).`privacyClass`
- [AlgorithmVersion](../nodes/AlgorithmVersion.md).`privacyClass`
- [ReferenceIntervalVersion](../nodes/ReferenceIntervalVersion.md).`privacyClass`
- [Device](../nodes/Device.md).`privacyClass`
- [Target](../nodes/Target.md).`privacyClass`
- [Intervention](../nodes/Intervention.md).`privacyClass`
- [Protocol](../nodes/Protocol.md).`privacyClass`
- [ProtocolEdition](../nodes/ProtocolEdition.md).`privacyClass`
- [ProtocolStep](../nodes/ProtocolStep.md).`privacyClass`
- [UseConstraint](../nodes/UseConstraint.md).`privacyClass`
- [Product](../nodes/Product.md).`privacyClass`
- [ProductVariant](../nodes/ProductVariant.md).`privacyClass`
- [Package](../nodes/Package.md).`privacyClass`
- [LabelVersion](../nodes/LabelVersion.md).`privacyClass`
- [MerchantListing](../nodes/MerchantListing.md).`privacyClass`
- [Offer](../nodes/Offer.md).`privacyClass`
- [Organization](../nodes/Organization.md).`privacyClass`
- [Person](../nodes/Person.md).`privacyClass`
- [Brand](../nodes/Brand.md).`privacyClass`
- [Award](../nodes/Award.md).`privacyClass`
- [RegulatoryRecord](../nodes/RegulatoryRecord.md).`privacyClass`
- [LegalStatus](../nodes/LegalStatus.md).`privacyClass`
- [Lot](../nodes/Lot.md).`privacyClass`
- [QualityResult](../nodes/QualityResult.md).`privacyClass`
- [CertificationListing](../nodes/CertificationListing.md).`privacyClass`
- [Patent](../nodes/Patent.md).`privacyClass`
- [Channel](../nodes/Channel.md).`privacyClass`
- [MediaWork](../nodes/MediaWork.md).`privacyClass`
- [Chunk](../nodes/Chunk.md).`privacyClass`
- [DecisionCriterion](../nodes/DecisionCriterion.md).`privacyClass`
- [ReportItem](../nodes/ReportItem.md).`privacyClass`
- [Association](../nodes/Association.md).`privacyClass`
- [CaptureAttempt](../nodes/CaptureAttempt.md).`privacyClass`
- [FoodItem](../nodes/FoodItem.md).`privacyClass`
- [FoodCategory](../nodes/FoodCategory.md).`privacyClass`
- [DietaryPattern](../nodes/DietaryPattern.md).`privacyClass`
- [Event](../nodes/Event.md).`privacyClass`
- [Frontier](../nodes/Frontier.md).`privacyClass`
