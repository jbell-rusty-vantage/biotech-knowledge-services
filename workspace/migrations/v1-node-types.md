---
id: "migration:v1-node-types"
kind: "migration"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:migration/v1-map.yaml#nodeTypes"]
aliases: ["v1-node-types","v1 node types"]
capabilities: ["get"]
cardDigest: "sha256:55c0aa8a12c12e921a9ecb04ad9c357b5166880558e511145df178a529598d9a"
---
# v1 node types

Navigation only: how a v1-proposal name maps to release biotech-schema-v2.2.0. This is never an execution script; data migration is owned by S8. A removed concept points here, never at a silently substituted type. Legend: [README](README.md).

| v1 | disposition | v2 | ruling | note |
| --- | --- | --- | --- | --- |
| `Activity` | kept | [Activity](../nodes/Activity.md) | R-13 | K.Activity (one per run; Mission Control identity) |
| `Adjudication` | kept | [Adjudication](../nodes/Adjudication.md) |  | K.Adjudication (15-value verdict lattice, five orthogonal properties) |
| `AdverseEffect` | merged | [Condition](../nodes/Condition.md) | R-84 | D5: D2.Condition |
| `AdverseEventResult` | merged | [StudyResult](../nodes/StudyResult.md) |  | D3: StudyResult (resultKind ADVERSE_EVENT_COUNT; seriousness, participantsAffected/AtRisk, eventCount, collectionMethod) with an OutcomeDefinition of measureKind A… |
| `AffiliateLink` | retired | — |  | D6: D9 owns tracked links as media/occurrence artifacts (they are published inside pages and episodes); D9 declares the edge into D6 Offer/MerchantListing (OQ-D6-07) |
| `Agent` | kept | [Agent](../nodes/Agent.md) |  | K.Agent |
| `Algorithm` | merged | [AlgorithmVersion](../nodes/AlgorithmVersion.md) |  | D4: AlgorithmVersion |
| `AlgorithmVersion` | kept | [AlgorithmVersion](../nodes/AlgorithmVersion.md) |  | AlgorithmVersion |
| `AnatomicalContext` | merged | [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md) |  | D2: MechanismEvidenceContext properties |
| `AnonymousActor` | retired | — |  | D7: An unnamed class of asserter ('anonymous commenter', 'unnamed employee') is the kernel asserter pattern's concern (ASSERTED_BY → the publishing Organization or the D9 account with an asserterClas… |
| `AnswerRecord` | merged | [Report](../nodes/Report.md) |  | K: K.Report (reportKind ANSWER, queryDigest) ‖ D10: K.Report (reportKind ANSWER, queryDigest) — kernel decision; D10 adds ReportItem for its sections |
| `ApplicabilityDimension` | merged | [Assessment](../nodes/Assessment.md) |  | D3: K.Assessment (child, subkind D3.applicability.dimension, facets dimension=<...>, missing=<fact>; conclusionCode) ‖ D10: D3 (owner of evidence assessment content; kernel Assessment kinds APPLICABI… |
| `AssayVersion` | kept | [AssayVersion](../nodes/AssayVersion.md) |  | AssayVersion |
| `Assertion` | kept | [Assertion](../nodes/Assertion.md) |  | K.Assertion |
| `Biomarker` | kept | [Biomarker](../nodes/Biomarker.md) |  | Biomarker |
| `BotanicalPreparation` | merged | [IngredientMaterial](../nodes/IngredientMaterial.md) |  | D1: IngredientMaterial |
| `BotanicalTaxon` | merged | [Taxon](../nodes/Taxon.md) |  | D1: Taxon |
| `BrandedIngredientMaterial` | merged | [IngredientMaterial](../nodes/IngredientMaterial.md) |  | D1: IngredientMaterial |
| `Bundle` | merged | [Package](../nodes/Package.md) |  | D6: Package |
| `BundleComponent` | merged | [Package](../nodes/Package.md) |  | D6: Package |
| `CertificateOfAnalysis` | merged | [Source](../nodes/Source.md) |  | D8: K.Source (genre COA) + QualityResult rows |
| `CertificationListing` | kept | [CertificationListing](../nodes/CertificationListing.md) |  | CertificationListing |
| `CertificationProgram` | merged | [CertificationListing](../nodes/CertificationListing.md) |  | D8: CertificationListing |
| `CertificationScope` | merged | [CertificationListing](../nodes/CertificationListing.md) |  | D8: CertificationListing |
| `Channel` | kept | [Channel](../nodes/Channel.md) |  | Channel |
| `ChemicalForm` | merged | [IngredientMaterial](../nodes/IngredientMaterial.md) | R-73 | D1: IngredientMaterial |
| `ChemicalSubstance` | kept | [ChemicalSubstance](../nodes/ChemicalSubstance.md) |  | ChemicalSubstance |
| `Chunk` | kept | [Chunk](../nodes/Chunk.md) |  | D9.Chunk |
| `Claim` | kept | [Claim](../nodes/Claim.md) |  | K.Claim (pinned in W21, recorded also by D9) |
| `ClaimEvidenceAssessment` | merged | [Assessment](../nodes/Assessment.md) |  | K: K.Assessment (EVIDENCE_SYNTHESIS) / K.Report EVIDENCE_REPORT (pinned in W21) ‖ D9: K.Assessment (EVIDENCE_SYNTHESIS; D3/D10 own the kind) ‖ D10: K.Assessment (assessmentKind EVIDENCE_SYNTHESIS or… |
| `ClaimOccurrence` | merged | [Assertion](../nodes/Assertion.md) |  | K: K.Assertion (assertionKind CLAIM, stored label ClaimOccurrence) + OCCURRENCE_OF (pinned in W21) ‖ D9: K.Assertion (assertionKind CLAIM, label ClaimOccurrence) + D9 OCCURS_IN |
| `CohortParticipant` | retired | — |  | D7: A participant token issued by a study is study data; no D7 question. Owner D3 if any D3 question needs it. |
| `CommerceMatch` | retired | — |  | D6: kernel Assessment (assessmentKind EQUIVALENCE or OTHER; subkinds D6.listing-to-package, D6.identifier-equivalence, D6.recall-scope, D6.authorized-channel, D6.change-kind, D6.seller-account-to-org… |
| `Community` | merged | [Channel](../nodes/Channel.md) |  | D9: Channel (channelKind FORUM) for online communities; offline deferred |
| `ComparabilityAssessment` | merged | [Assessment](../nodes/Assessment.md) |  | K: K.Assessment (COMPARABILITY, conclusionCode vocabulary D4) ‖ D4: K.Assessment |
| `Condition` | kept | [Condition](../nodes/Condition.md) |  |  |
| `Conference` | merged | [Channel](../nodes/Channel.md) | R-65 | D9: D9 Channel (channelKind EVENT_SERIES) for the recurring meeting + D13 DATA_PRESENTATION Events for presentations with a data claim; edition and session are qua… ‖ D13: D9 Channel EVENT_SERIES + q… |
| `ConflictRelevanceAssessment` | merged | [Assessment](../nodes/Assessment.md) | R-55, R-20 | K: K.Assessment (CONFLICT_RELEVANCE, subkind and questions D7) ‖ D9: K.Assessment (CONFLICT_RELEVANCE; one register entry D7.conflict-relevance, registrar D7; D9 contributes the disclosure facets dis… |
| `Constituent` | kept | [Constituent](../nodes/Constituent.md) |  | Constituent |
| `Constraint` | merged | [UseConstraint](../nodes/UseConstraint.md) |  | D5: UseConstraint |
| `ConsumerBrand` | renamed | [Brand](../nodes/Brand.md) |  | D7: Brand |
| `ContraindicationAssertion` | merged | [Assertion](../nodes/Assertion.md) |  | D5: Assertion |
| `Dataset` | merged | [Study](../nodes/Study.md) |  | D3: Study (kind OBSERVATIONAL_COHORT) + REPORTS_ON |
| `DecisionCriterion` | kept | [DecisionCriterion](../nodes/DecisionCriterion.md) | R-46 | D10.DecisionCriterion |
| `Device` | kept | [Device](../nodes/Device.md) |  | Device |
| `Document` | merged | [MediaWork](../nodes/MediaWork.md), [Source](../nodes/Source.md) |  | K: D9 (MediaWork / Source) ‖ D9: K.Source |
| `DocumentTextVersion` | merged | [Chunk](../nodes/Chunk.md) |  | K: D9.Chunk properties (textVersionHash, extractorVersion) ‖ D9: Chunk properties (textBasis, textVersionHash, extractorVersion, normalizationVersion) |
| `DrugApproval` | merged | [LegalStatus](../nodes/LegalStatus.md) |  | D8: LegalStatus |
| `EndpointClassification` | merged | [Assessment](../nodes/Assessment.md) |  | D3: K.Assessment (kind OTHER, subkind D3.endpoint-classification, ASSESSES OutcomeDefinition; conclusionCode = endpoint class, facets bestCategory=<BEST category>,… ‖ D10: D3 (owner of evidence asses… |
| `Episode` | merged | [MediaWork](../nodes/MediaWork.md) |  | D9: MediaWork (workKind PODCAST_EPISODE, VIDEO, LIVESTREAM, TALK_RECORDING) |
| `EpisodeSegment` | folded | — |  | D9: deferred (occurrence qualifier segment:<KIND> + MEDIA_TIMECODE locator) |
| `EquivalenceAssessment` | merged | [Assessment](../nodes/Assessment.md) |  | K: K.Assessment (assessmentKind EQUIVALENCE) |
| `Event` | kept | [Event](../nodes/Event.md) |  | D13.Event |
| `EventImpactAssessment` | merged | [Assessment](../nodes/Assessment.md) |  | K: K.Assessment (EVENT_IMPACT; questions D13) ‖ D9: K.Assessment (D13 kind) ‖ D13: kernel Assessment (see deferred) |
| `EvidenceApplicability` | merged | [Assessment](../nodes/Assessment.md) |  | D3: K.Assessment (assessmentKind APPLICABILITY, ASSESSES study evidence + use-side entity) ‖ D10: D3 (owner of evidence assessment content; kernel Assessment kinds APPLICABILITY etc.); D10 only cites… |
| `EvidenceStrengthAssessment` | merged | [Assessment](../nodes/Assessment.md) |  | K: K.Assessment (EVIDENCE_SYNTHESIS with gradeScheme / grade / certainty; questions D3) ‖ D3: K.Assessment (assessmentKind QUALITY, subkind D3.evidence-strength; gradeScheme + grade + certainty) ‖ D1… |
| `EvidenceSynthesis` | merged | [Assessment](../nodes/Assessment.md) |  | D3: K.Assessment (assessmentKind EVIDENCE_SYNTHESIS, ASSESSES Claim, DERIVED_FROM the StudyResults' STATED_IN Assertions) ‖ D10: K.Assessment (assessmentKind EVIDENCE_SYNTHESIS) |
| `Exposure` | merged | [Intervention](../nodes/Intervention.md) |  | D5: Intervention |
| `Facility` | retired | — | R-67 | D7: Closed by R-67 (OQ-D7-05): no Facility node. A certified site is the operating Organization plus verbatim scope, and the facility branch uses the D8 predicate LISTING_COVERS_FACILITY_OF. D8 is th… |
| `FigurePanel` | merged | [SourceLocator](../nodes/SourceLocator.md) |  | D9: K.SourceLocator (BOUNDING_BOX) on an IMAGE work's rendition |
| `FirmwareVersion` | merged | [AlgorithmVersion](../nodes/AlgorithmVersion.md) |  | D4: AlgorithmVersion |
| `FoodItem` | kept | [FoodItem](../nodes/FoodItem.md) |  | D12.FoodItem |
| `FormulationVersion` | merged | [LabelVersion](../nodes/LabelVersion.md) |  | D6: LabelVersion |
| `FunctionalGoal` | merged | [Target](../nodes/Target.md) |  | D5: Target |
| `GrantedPatent` | merged | [Patent](../nodes/Patent.md) |  | D8: Patent |
| `GraphView` | folded | — |  | D9: deferred |
| `Identifier` | kept | [Identifier](../nodes/Identifier.md) | R-42 | K.Identifier |
| `IndividualUnit` | retired | — |  | D6: a physically tested unit is a D8 sample (QualityResult on Lot or Product) |
| `IngredientComponent` | merged | [LabelVersion](../nodes/LabelVersion.md) |  | D6: LabelVersion |
| `IngredientMaterial` | kept | [IngredientMaterial](../nodes/IngredientMaterial.md) |  | IngredientMaterial |
| `InteractionAssertion` | merged | [Assertion](../nodes/Assertion.md) |  | D5: Assertion |
| `InterventionComponent` | kept | [InterventionComponent](../nodes/InterventionComponent.md) |  |  |
| `InventoryItem` | retired | — |  | D6: no public source exposes merchant inventory records; no question ≥ value 2 |
| `IpRightStatus` | merged | [LegalStatus](../nodes/LegalStatus.md) |  | D8: LegalStatus |
| `LabTest` | kept | [LabTest](../nodes/LabTest.md) |  | LabTest |
| `LabelDeclaration` | merged | [LabelVersion](../nodes/LabelVersion.md) |  | D6: LabelVersion |
| `LabelSnapshot` | merged | [LabelVersion](../nodes/LabelVersion.md) |  | D6: LabelVersion |
| `LegalEntity` | merged | [Organization](../nodes/Organization.md) |  | D7: Organization |
| `Lifestyle` | merged | [Intervention](../nodes/Intervention.md), [DietaryPattern](../nodes/DietaryPattern.md) |  | D5: Intervention ‖ D12: D12.DietaryPattern |
| `LotTestSummary` | merged | [Source](../nodes/Source.md) |  | D8: K.Source (genre TEST_SUMMARY) + QualityResult rows |
| `ManufacturingCapability` | merged | [Assertion](../nodes/Assertion.md) |  | D8: Assertion.predicate HAS_CAPABILITY_STAGE (deferred as node) |
| `ManufacturingProcess` | folded | — |  | D8: deferred |
| `ManufacturingSpecification` | folded | — |  | D8: deferred (see deferred Specification) |
| `ManufacturingStep` | folded | — |  | D8: deferred |
| `MaterialMixture` | merged | [IngredientMaterial](../nodes/IngredientMaterial.md) |  | D1: IngredientMaterial |
| `MeasuredResult` | merged | [QualityResult](../nodes/QualityResult.md) |  | D8: QualityResult |
| `MeasurementMethod` | merged | [AssayVersion](../nodes/AssayVersion.md) |  | D4: AssayVersion |
| `MeasurementPlan` | merged | [ProtocolStep](../nodes/ProtocolStep.md) |  | D5: ProtocolStep |
| `Mechanism` | kept | [Mechanism](../nodes/Mechanism.md) |  |  |
| `MechanismEvidenceContext` | kept | [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md) |  |  |
| `MediaAnnotation` | merged | [SourceLocator](../nodes/SourceLocator.md) |  | D9: K.SourceLocator (BOUNDING_BOX / MEDIA_TIMECODE selector) |
| `MediaAsset` | merged | [MediaWork](../nodes/MediaWork.md) |  | D9: MediaWork (workKind IMAGE) |
| `MediaRightsRecord` | merged | [MediaWork](../nodes/MediaWork.md) |  | D9: MediaWork.rightsStatementVerbatim |
| `MediaSuitabilityAssessment` | folded | — |  | D9: deferred (K.Assessment QUALITY if ever needed) |
| `MediaVariant` | merged | [Source](../nodes/Source.md) |  | D9: K.Source + K.SourceSnapshot (one rendition endpoint, its captures) |
| `Mention` | merged | [SourceLocator](../nodes/SourceLocator.md) | R-09 | K: K.SourceLocator (the surface-form span) + K.Assessment RESOLUTION (surfaceForm / normalizedForm / typeHint in facets); derived D9 Chunk MENTIONS |
| `MerchantListing` | kept | [MerchantListing](../nodes/MerchantListing.md) |  | MerchantListing |
| `Metric` | kept | [Metric](../nodes/Metric.md) |  | Metric |
| `MicrobialPreparation` | merged | [IngredientMaterial](../nodes/IngredientMaterial.md) |  | D1: IngredientMaterial |
| `MicrobialStrain` | merged | [Taxon](../nodes/Taxon.md) |  | D1: Taxon |
| `MicrobialTaxon` | merged | [Taxon](../nodes/Taxon.md) |  | D1: Taxon |
| `Modality` | merged | [Device](../nodes/Device.md) |  | D4: Device |
| `MolecularEntity` | kept | [MolecularEntity](../nodes/MolecularEntity.md) |  |  |
| `NarrativeArc` | merged | [Report](../nodes/Report.md) |  | D13: kernel Report (see deferred) |
| `Nutrient` | merged | [Constituent](../nodes/Constituent.md) |  | D1: Constituent |
| `Observation` | merged | [Assertion](../nodes/Assertion.md) |  | D5: Assertion |
| `Offer` | kept | [Offer](../nodes/Offer.md) |  | Offer |
| `Organ` | merged | [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md) |  | D2: MechanismEvidenceContext properties |
| `Organization` | kept | [Organization](../nodes/Organization.md) |  |  |
| `OrganizationSnapshot` | merged | [Organization](../nodes/Organization.md) |  | D7: Organization |
| `OrphanDesignation` | merged | [LegalStatus](../nodes/LegalStatus.md) |  | D8: LegalStatus |
| `Outcome` | kept | [Outcome](../nodes/Outcome.md) |  |  |
| `OutcomeDefinition` | kept | [OutcomeDefinition](../nodes/OutcomeDefinition.md) |  |  |
| `PackageConfiguration` | merged | [Package](../nodes/Package.md) |  | D6: Package |
| `PanelDefinition` | merged | [LabTest](../nodes/LabTest.md) |  | D4: LabTest |
| `PassFailInterpretation` | merged | [QualityResult](../nodes/QualityResult.md) |  | D8: QualityResult |
| `PatentApplication` | merged | [Patent](../nodes/Patent.md) |  | D8: Patent |
| `PatentClaim` | merged | [LegalStatus](../nodes/LegalStatus.md) |  | D8: LegalStatus |
| `PatentFamily` | merged | [Patent](../nodes/Patent.md) |  | D8: Patent |
| `PatentLicense` | merged | [Patent](../nodes/Patent.md) |  | D8: Patent.licensees (LICENSED_TO episodes; terms as Assertion qualifiers) |
| `Pathway` | merged | [Mechanism](../nodes/Mechanism.md) |  | D2: Mechanism |
| `Person` | kept | [Person](../nodes/Person.md) |  |  |
| `Platform` | merged | [Channel](../nodes/Channel.md) |  | D9: Channel.platform (MediaPlatform enum) |
| `PolicyVersion` | folded | — | R-33 | K: string id on K.Report / K.Activity; node decision D10 ‖ D10: kernel string id Report.policyVersion / Activity.policyVersion (node deferred, see deferred; R-33) |
| `PriceObservation` | merged | [Offer](../nodes/Offer.md) |  | D6: Offer |
| `Procedure` | merged | [Intervention](../nodes/Intervention.md) |  | D5: Intervention |
| `Product` | kept | [Product](../nodes/Product.md) |  | Product |
| `ProductLabelRegion` | merged | [SourceLocator](../nodes/SourceLocator.md) |  | D9: K.SourceLocator on a D6 label snapshot (deferred as a type) |
| `ProductLot` | renamed | [Lot](../nodes/Lot.md) | R-74 | D8: Lot |
| `ProductSnapshot` | merged | [LabelVersion](../nodes/LabelVersion.md) |  | D6: LabelVersion |
| `ProductVariant` | kept | [ProductVariant](../nodes/ProductVariant.md) |  | ProductVariant |
| `Protocol` | kept | [Protocol](../nodes/Protocol.md) |  | Protocol |
| `ProtocolAdjustmentRule` | merged | [ProtocolStep](../nodes/ProtocolStep.md) |  | D5: ProtocolStep |
| `ProtocolEdition` | kept | [ProtocolEdition](../nodes/ProtocolEdition.md) |  | ProtocolEdition |
| `ProtocolResult` | merged | [Assertion](../nodes/Assertion.md) |  | D5: Assertion |
| `ProtocolStep` | kept | [ProtocolStep](../nodes/ProtocolStep.md) |  | ProtocolStep |
| `ProtocolVersion` | merged | [Publication](../nodes/Publication.md) |  | D3: Publication (publicationKind PROTOCOL / ANALYSIS_PLAN; versions chain by REVISES) |
| `PseudonymousActor` | retired | — | R-79 | D7: A handle is an account on a platform (D9 owns platforms, channels and accounts); D9 research lists actor types as D7 (contested, OQ-D7-06). Check stage: D9 models the handle as a Channel (platfor… |
| `Publication` | kept | [Publication](../nodes/Publication.md) |  | D3 owns scholarly works (agreed with A4's research notes); MediaWork excludes them |
| `QuantityDeclaration` | merged | [LabelVersion](../nodes/LabelVersion.md) |  | D6: LabelVersion |
| `ReferenceIntervalVersion` | kept | [ReferenceIntervalVersion](../nodes/ReferenceIntervalVersion.md) |  | ReferenceIntervalVersion |
| `ReferenceRange` | merged | [ReferenceIntervalVersion](../nodes/ReferenceIntervalVersion.md) |  | D4: ReferenceIntervalVersion |
| `ReferenceSystem` | merged | [AssayVersion](../nodes/AssayVersion.md) |  | D4: AssayVersion |
| `RegistrationVersion` | kept | [RegistrationVersion](../nodes/RegistrationVersion.md) |  |  |
| `RegulatoryAgency` | merged | [Organization](../nodes/Organization.md) |  | D8: D7.Organization |
| `RegulatoryInspection` | merged | [RegulatoryRecord](../nodes/RegulatoryRecord.md) |  | D8: RegulatoryRecord |
| `RegulatoryPathway` | folded | — |  | D8: enum RegulatoryPathway |
| `RegulatoryPathwayVersion` | merged | [RegulatoryRecord](../nodes/RegulatoryRecord.md) |  | D8: RegulatoryRecord.legalBasisCitation |
| `RegulatoryResponse` | merged | [RegulatoryRecord](../nodes/RegulatoryRecord.md) |  | D8: RegulatoryRecord |
| `RegulatoryStatus` | merged | [LegalStatus](../nodes/LegalStatus.md) |  | D8: LegalStatus |
| `RegulatoryStep` | folded | — |  | D8: deferred |
| `RegulatorySubmission` | merged | [RegulatoryRecord](../nodes/RegulatoryRecord.md) |  | D8: RegulatoryRecord |
| `RelationshipAssertion` | merged | [Assertion](../nodes/Assertion.md) |  | D9: K.Assertion |
| `ResolutionHypothesis` | merged | [Assessment](../nodes/Assessment.md) |  | K: K.Assessment (assessmentKind RESOLUTION; HAS_EVIDENCE role CONTEXT to the surface-form SourceLocator; ASSESSES the candidate) |
| `ResultInterpretation` | merged | [Assessment](../nodes/Assessment.md) |  | D3: K.Assessment (kind OTHER, subkind D3.result-interpretation, ASSESSES StudyResult; effectDirection + conclusionCode; threshold source = HAS_EVIDENCE role CONTEX… ‖ D10: D3 (owner of evidence asses… |
| `RetellingFidelityAssessment` | merged | [Assessment](../nodes/Assessment.md) |  | K: K.Assessment (RETELLING_FIDELITY, subkind and questions D9) ‖ D9: K.Assessment (RETELLING_FIDELITY; D9 owns kind values and questions) |
| `RiskFactor` | merged | [Condition](../nodes/Condition.md) |  | D2: Condition |
| `SafetySignal` | merged | [Assessment](../nodes/Assessment.md) | R-54 | D5: Assessment |
| `Segmentation` | merged | [Chunk](../nodes/Chunk.md) |  | K: D9.Chunk.chunkerVersion ‖ D9: Chunk.chunkerVersion |
| `Sensor` | merged | [Device](../nodes/Device.md) |  | D4: Device |
| `Series` | merged | [Channel](../nodes/Channel.md) |  | D9: Channel (channelKind SHOW); sub-series such as Essentials → MediaWork.republicationKind |
| `ServingDefinition` | merged | [LabelVersion](../nodes/LabelVersion.md) |  | D6: LabelVersion |
| `Source` | kept | [Source](../nodes/Source.md) |  | K.Source |
| `SourceAuthorityAssessment` | merged | [Assessment](../nodes/Assessment.md) |  | K: K.Assessment (assessmentKind SOURCE_AUTHORITY, register content D9) + EvidenceEdgeProperties.authority/independence ‖ D9: K.Assessment (SOURCE_AUTHORITY); register content D9 (vocab-source-genres.… |
| `SourceCoverageRequirement` | folded | — |  | K: D11 action-space registry (deferred from the graph) ‖ D9: D11 action-space registry (not graph); answer-time coverage per 03#Q-D9-16 ‖ D11: CONFIG tooling/action-space.yaml (+ each packet's 02-que… |
| `SourceDiscoveryRecord` | renamed | [CaptureAttempt](../nodes/CaptureAttempt.md) |  | K: D11.CaptureAttempt (A8; lineage through the kernel WAS_GENERATED_BY) ‖ D11: D11.CaptureAttempt |
| `SourceLocator` | kept | [SourceLocator](../nodes/SourceLocator.md) |  | K.SourceLocator |
| `SourceRevisionEvent` | merged | [SourceSnapshot](../nodes/SourceSnapshot.md) | R-44 | K: K.SourceSnapshot.revisionKind + revisesSnapshotUid (capture cache); identified notice = D3 REVISES; status flag per authority without a notice = HAS_REVISION_S… |
| `SourceSnapshot` | kept | [SourceSnapshot](../nodes/SourceSnapshot.md) |  | K.SourceSnapshot |
| `Species` | merged | [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md) |  | D2: MechanismEvidenceContext / MolecularEntity properties |
| `SpecificationCriterion` | merged | [QualityResult](../nodes/QualityResult.md) |  | D8: QualityResult |
| `SpecificationVersion` | folded | — |  | D8: deferred (see deferred Specification) |
| `Specimen` | merged | [AssayVersion](../nodes/AssayVersion.md) |  | D4: AssayVersion |
| `Study` | kept | [Study](../nodes/Study.md) |  |  |
| `StudyArm` | kept | [StudyArm](../nodes/StudyArm.md) |  |  |
| `StudyIntervention` | merged | [StudyArm](../nodes/StudyArm.md) |  | D3: StudyArm (arm-level facts) + InterventionComponent (route, dosageForm, schedule, duration, registry intervention type) |
| `StudyPopulation` | kept | [StudyPopulation](../nodes/StudyPopulation.md) |  |  |
| `StudyResult` | kept | [StudyResult](../nodes/StudyResult.md) |  |  |
| `SubscriptionPlan` | merged | [Offer](../nodes/Offer.md) |  | D6: Offer |
| `Target` | kept | [Target](../nodes/Target.md) |  | ProtocolStep |
| `TechnologyPlatform` | merged | [AssayVersion](../nodes/AssayVersion.md) |  | D4: AssayVersion |
| `TestExecution` | merged | [QualityResult](../nodes/QualityResult.md) |  | D8: QualityResult |
| `TestMethod` | merged | [QualityResult](../nodes/QualityResult.md) |  | D8: QualityResult |
| `TestSample` | merged | [QualityResult](../nodes/QualityResult.md) |  | D8: QualityResult |
| `TestingLaboratory` | merged | [Organization](../nodes/Organization.md) |  | D8: D7.Organization |
| `ToolOrInstrument` | merged | [Device](../nodes/Device.md) |  | D4: Device |
| `TradeItemIdentifier` | merged | [Identifier](../nodes/Identifier.md) |  | K: K.Identifier (schemes GTIN, ASIN, SKU) |
| `Trademark` | folded | — |  | D8: deferred |
| `Treatment` | merged | [Intervention](../nodes/Intervention.md) |  | D5: Intervention |
| `TrialRegistration` | merged | [Study](../nodes/Study.md) |  | D3: Study (kernel Identifier per registration) + RegistrationVersion.registry / registrationId |
| `UseConstraint` | kept | [UseConstraint](../nodes/UseConstraint.md) |  | UseConstraint |
| `UseContextProfile` | folded | — |  | D3: deferred (assessed entity + assessment fields) |
