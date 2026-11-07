---
id: "pred:HAS_IDENTIFIER"
kind: "predicate"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#HAS_IDENTIFIER"]
aliases: ["has identifier"]
capabilities: ["get","neighbors","propose:identifier.attach"]
cardDigest: "sha256:7876f23b0aadea984a9052b3bb9333151265b4516b92a51b90f1cfe175a86cd5"
---
# Predicate HAS_IDENTIFIER

| | |
| --- | --- |
| id | `pred:HAS_IDENTIFIER` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [K](../modules/K.md) |
| subject types | [Agent](../nodes/Agent.md), [AlgorithmVersion](../nodes/AlgorithmVersion.md), [AssayVersion](../nodes/AssayVersion.md), [Award](../nodes/Award.md), [Biomarker](../nodes/Biomarker.md), [Brand](../nodes/Brand.md), [CertificationListing](../nodes/CertificationListing.md), [Channel](../nodes/Channel.md), [ChemicalSubstance](../nodes/ChemicalSubstance.md), [Claim](../nodes/Claim.md), [Condition](../nodes/Condition.md), [Constituent](../nodes/Constituent.md), [DecisionCriterion](../nodes/DecisionCriterion.md), [Device](../nodes/Device.md), [DietaryPattern](../nodes/DietaryPattern.md), [Event](../nodes/Event.md), [FoodCategory](../nodes/FoodCategory.md), [FoodItem](../nodes/FoodItem.md), [Frontier](../nodes/Frontier.md), [IngredientMaterial](../nodes/IngredientMaterial.md), [Intervention](../nodes/Intervention.md), [InterventionComponent](../nodes/InterventionComponent.md), [LabTest](../nodes/LabTest.md), [LabelVersion](../nodes/LabelVersion.md), [LegalStatus](../nodes/LegalStatus.md), [Lot](../nodes/Lot.md), [Mechanism](../nodes/Mechanism.md), [MediaWork](../nodes/MediaWork.md), [MerchantListing](../nodes/MerchantListing.md), [Metric](../nodes/Metric.md), [MolecularEntity](../nodes/MolecularEntity.md), [Offer](../nodes/Offer.md), [Organization](../nodes/Organization.md), [Outcome](../nodes/Outcome.md), [OutcomeDefinition](../nodes/OutcomeDefinition.md), [Package](../nodes/Package.md), [Patent](../nodes/Patent.md), [Person](../nodes/Person.md), [Product](../nodes/Product.md), [ProductVariant](../nodes/ProductVariant.md), [Protocol](../nodes/Protocol.md), [ProtocolEdition](../nodes/ProtocolEdition.md), [ProtocolStep](../nodes/ProtocolStep.md), [Publication](../nodes/Publication.md), [QualityResult](../nodes/QualityResult.md), [ReferenceIntervalVersion](../nodes/ReferenceIntervalVersion.md), [RegistrationVersion](../nodes/RegistrationVersion.md), [RegulatoryRecord](../nodes/RegulatoryRecord.md), [Source](../nodes/Source.md), [Study](../nodes/Study.md), [StudyArm](../nodes/StudyArm.md), [StudyPopulation](../nodes/StudyPopulation.md), [StudyResult](../nodes/StudyResult.md), [Target](../nodes/Target.md), [Taxon](../nodes/Taxon.md), [UseConstraint](../nodes/UseConstraint.md) |
| object types | [Identifier](../nodes/Identifier.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-ID-04`, `CQ-ID-05`, `CQ-PV-05`, `Q-D11-02`, `Q-D11-05`, `Q-D11-13`, `Q-D11-15`, `Q-D11-16`, `Q-D11-22`, `Q-D2-23`, `Q-D6-15`, `Q-K-02`, `Q-K-03`, `Q-K-04`, `Q-K-05`, `Q-K-06`, `Q-K-07`, `Q-K-12`, `Q-K-29` |

## Typed edge or Assertion only

A typed edge exists: [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'HAS_IDENTIFIER'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `identifier.attach`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#HAS_IDENTIFIER`
