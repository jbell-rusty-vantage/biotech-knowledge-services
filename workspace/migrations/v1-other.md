---
id: "migration:v1-other"
kind: "migration"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:migration/v1-map.yaml#unions","release:migration/v1-map.yaml#interfaces","release:migration/v1-map.yaml#edgePropertyTypes","release:migration/v1-map.yaml#properties"]
aliases: ["v1-other","v1 unions, interfaces, edge-property types and properties"]
capabilities: ["get"]
cardDigest: "sha256:80410d5cd64a5aa22bca761cd5e882e3bf63dbf60f8d67661878b4e97a698566"
---
# v1 unions, interfaces, edge-property types and properties

Navigation only: how a v1-proposal name maps to release biotech-schema-v2.2.0. This is never an execution script; data migration is owned by S8. A removed concept points here, never at a silently substituted type. Legend: [README](README.md).

## Unions

| v1 | disposition | v2 | ruling | note |
| --- | --- | --- | --- | --- |
| `ApplicabilityUseTarget` | retired | — |  | members 8 |
| `AsserterTarget` | replaced | — |  | K: K.Subjectable interface target (DocumentAuthorTarget → D9) |
| `AssertionSubjectTarget` | replaced | — |  | K: K.Subjectable interface target (DocumentAuthorTarget → D9) |
| `CertificationCoverageTarget` | kept-changed | [CertificationCoverageTarget](../unions/CertificationCoverageTarget.md) |  |  |
| `ClaimSpeakerTarget` | replaced | — |  | D9: kernel ASSERTED_BY → Subjectable |
| `CommerceItemTarget` | retired | — |  | members 9 |
| `ComparableVersionTarget` | retired | — |  | members 3 |
| `ConstraintBasisTarget` | retired | — |  | members 4 |
| `DocumentAuthorTarget` | replaced | — |  | D9: APPEARS_IN {AUTHOR} → Person |
| `EpisodeMentionableTarget` | replaced | — |  | D9: Chunk.mentions → Subjectable (MENTIONS, derived) |
| `EquipmentModelTarget` | retired | — |  | members 2 |
| `EventParticipantTarget` | replaced | — |  | D9: D13 |
| `EventRecordTarget` | replaced | — |  | D9: D13 |
| `EventSubjectTarget` | replaced | — |  | D9: D13 |
| `EvidenceTargetTarget` | retired | — |  | members 2 |
| `ExposureAgentTarget` | retired | — |  | members 6 |
| `InterventionDefinitionTarget` | retired | — |  | members 5 |
| `IpRightStatusSubjectTarget` | retired | — |  | members 4 |
| `LegacyEvaluatedIntervention` | retired | — |  | members 9 |
| `ListingTarget` | retired | — |  | members 3 |
| `MaterialContentTarget` | retired | — |  | members 3 |
| `MediaSubjectTarget` | replaced | — |  | D9: kernel Subjectable pattern (predicate DEPICTS) |
| `MediaVisualizableRelationshipTarget` | replaced | — |  | D9: deferred (GraphView cut) |
| `OccurrenceContainerTarget` | replaced | — |  | D9: OCCURS_IN → MediaWork only (scholarly retellings are Assertion → Assertion) |
| `PatentLicenseTarget` | retired | — |  | members 4 |
| `ProtocolResultMentionTarget` | retired | — |  | members 11 |
| `RecommendableTarget` | replaced | — |  | D11: nothing (not a D11 concept: the pinned catalog's D11 is an assembly artifact; the union is replaced by the kernel Subje… |
| `RegulatorySubjectTarget` | retired | — |  | members 7 |
| `RoleHolderTarget` | replaced | — |  | D7: two declared fields (Person.holdsStakes, Organization.holdsStakes) |
| `SafetySignalInputTarget` | retired | — |  | members 3 |
| `SafetySubjectTarget` | retired | — |  | members 8 |
| `SponsorableTarget` | replaced | — |  | D9: CONTENT_SPONSORED_BY from MediaWork only (2-member ContentSponsor target) |
| `StepInstrumentTarget` | retired | — |  | members 6 |
| `StepSubstanceTarget` | retired | — |  | members 6 |
| `SupportedRecordTarget` | replaced | — |  | K: K.Subjectable interface target (DocumentAuthorTarget → D9) |
| `SynthesisInputTarget` | retired | — |  | members 2 |
| `TherapeuticTargetTarget` | retired | — |  | members 3 |
| `TreatmentComponentTarget` | retired | — |  | members 9 |
| `UseConstraintScopeTarget` | retired | — |  | members 10 |

## Interfaces

| v1 | disposition | v2 | ruling | note |
| --- | --- | --- | --- | --- |
| `ActorIdentity` | replaced | — |  | K: K.Entity + K.Subjectable; archetype kept as a stored label |
| `AssertionArchetype` | replaced | — |  | K: K.Entity + K.Subjectable; archetype kept as a stored label |
| `DiagnosticResult` | retired | — |  |  |
| `Entity` | unchanged | [Entity](../interfaces/Entity.md) |  |  |
| `EntityArchetype` | replaced | — |  | K: K.Entity + K.Subjectable; archetype kept as a stored label |
| `EvidenceAssessmentArchetype` | replaced | — |  | K: K.Entity + K.Subjectable; archetype kept as a stored label |
| `InformationArtifactArchetype` | replaced | — |  | K: K.Entity + K.Subjectable; archetype kept as a stored label |
| `OccurrenceArchetype` | replaced | — |  | K: K.Entity + K.Subjectable; archetype kept as a stored label |
| `SearchIndexable` | replaced | — |  | K: K.Entity + K.Subjectable; archetype kept as a stored label |
| `TemporalSnapshot` | replaced | — |  | K: K.Entity + K.Subjectable; archetype kept as a stored label |
| `VersionedStateArchetype` | replaced | — |  | K: K.Entity + K.Subjectable; archetype kept as a stored label |

## Edge-property types

| v1 | disposition | v2 | ruling | note |
| --- | --- | --- | --- | --- |
| `AppearanceProperties` | retired | — |  | usedBy 2 |
| `AssertedEdgeProperties` | unchanged | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) |  |  |
| `AssociationProjectionProperties` | retired | — |  | usedBy 10 |
| `AuthorizationProperties` | retired | — |  | usedBy 1 |
| `CausalEdgeProperties` | replaced | — |  | D13: kernel AssertedRecordedProperties on LEADS_TO / RESPONDS_TO; basisKind and speechAct live on the authorizing Assertion |
| `ChunkResolutionProperties` | retired | — |  | usedBy 1 |
| `ConstraintRoleProperties` | retired | — |  | usedBy 1 |
| `ConstraintScopeProperties` | retired | — |  | usedBy 1 |
| `DatasetAnalysisProperties` | retired | — |  | usedBy 1 |
| `DerivedEdgeProperties` | unchanged | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) |  |  |
| `DerivedSupportProperties` | retired | — |  | usedBy 3 |
| `EventRoleEdgeProperties` | unchanged | [EventRoleEdgeProperties](../edge-properties/EventRoleEdgeProperties.md) |  |  |
| `EvidenceChangeProperties` | retired | — |  | usedBy 1 |
| `FacilityEdgeProperties` | replaced | — |  | D7: D8 (with Facility) |
| `FoodVariantProperties` | replaced | — |  | D12: D12.FoodItem |
| `FormulationEdgeProperties` | retired | — |  | usedBy 1 |
| `IdentifierLinkProperties` | unchanged | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) |  |  |
| `InterventionMaterialProperties` | retired | — |  | usedBy 2 |
| `LegacyInterventionArmProperties` | retired | — |  | usedBy 1 |
| `ListingEdgeProperties` | retired | — |  | usedBy 2 |
| `MeasurementEdgeProperties` | retired | — |  | usedBy 1 |
| `MechanismLinkProperties` | retired | — |  | usedBy 10 |
| `MediaLinkProperties` | retired | — |  | usedBy 4 |
| `MediaSourceProperties` | retired | — |  | usedBy 1 |
| `OwnershipEdgeProperties` | replaced | — |  | D7: StakeEdgeProperties + ControlEdgeProperties |
| `ProcessIoProperties` | retired | — |  | usedBy 2 |
| `PublicationRevisionProperties` | retired | — |  | usedBy 2 |
| `QualificationProperties` | retired | — |  | usedBy 1 |
| `QuantitativeContentProperties` | replaced | — |  | D12: D12.FoodContentProperties + the FOOD_CONTAINS Assertion |
| `ReanchorProperties` | retired | — |  | usedBy 1 |
| `RecordingEdgeProperties` | replaced | — |  | D13: D9 (RECORDING_OF deferred to D9) |
| `ResultArmProperties` | retired | — |  | usedBy 1 |
| `RetellingProperties` | retired | — |  | usedBy 1 |
| `RetrievalEdgeProperties` | retired | — |  | usedBy 2 |
| `RoleEdgeProperties` | unchanged | [RoleEdgeProperties](../edge-properties/RoleEdgeProperties.md) |  |  |
| `SafetyEdgeProperties` | retired | — |  | usedBy 1 |
| `SignalInputProperties` | retired | — |  | usedBy 1 |
| `StateEpisodeProperties` | replaced | — |  | AssertedEdgeProperties + register exclusive: true (R-10) |
| `StepDependencyProperties` | retired | — |  | usedBy 1 |
| `StepDoseProperties` | retired | — |  | usedBy 1 |
| `StepOrderProperties` | retired | — |  | usedBy 1 |
| `StructuralEdgeProperties` | unchanged | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) |  |  |
| `SupersessionProperties` | retired | — |  | usedBy 1 |
| `SynthesisInputProperties` | retired | — |  | usedBy 1 |
| `TreatmentComponentProperties` | retired | — |  | usedBy 1 |
| `TreatmentTargetProperties` | retired | — |  | usedBy 1 |
| `UsageEdgeProperties` | retired | — |  | usedBy 4 |

## Properties

| v1 | disposition | v2 | at | note |
| --- | --- | --- | --- | --- |
| `attemptedUri` | renamed | requestUri | SourceDiscoveryRecord→CaptureAttempt | node-register mergedInto (D11): attemptedUri → requestUri ‖ packets/D11 05/06/09: attemptedUri → requestUri |
| `blockEvidence` | renamed | errorText | SourceDiscoveryRecord→CaptureAttempt | node-register mergedInto (D11): blockEvidence → errorText ‖ packets/D11 05/06/09: blockEvidence → errorText |
| `ciLower` | renamed | intervalLower | StudyResult | packets/D3 05/06/09: `ciLower/ciUpper` → `intervalLower/intervalUpper` |
| `ciUpper` | renamed | intervalUpper | StudyResult | packets/D3 05/06/09: `ciLower/ciUpper` → `intervalLower/intervalUpper` |
| `description` | renamed | summaryText | Event | node-register mergedInto (D13): description → summaryText ‖ packets/D13 05/06/09: description → summaryText |
| `impactDomain` | renamed | facets | EventImpactAssessment→Assessment | packets/K 05/06/09: impactDomain → `facets` |
| `mongoResearchRunId` | renamed | lastWriterRunId | Activity, Adjudication, AdverseEffect→Condition, AdverseEventResult→StudyResult, Agent, Algorithm→AlgorithmVersion, AlgorithmVersion, AnatomicalContext→MechanismEvidenceContext, AnswerRecord→Report, ApplicabilityDimension→Assessment, AssayVersion, AssertedEdgeProperties, Assertion, Biomarker, BotanicalPreparation→IngredientMaterial, BotanicalTaxon→Taxon, BrandedIngredientMaterial→IngredientMaterial, Bundle→Package, BundleComponent→Package, CertificateOfAnalysis→Source, CertificationListing, CertificationProgram→CertificationListing, CertificationScope→CertificationListing, Channel, ChemicalForm→IngredientMaterial, ChemicalSubstance, Chunk, Claim, ClaimEvidenceAssessment→Assessment, ClaimOccurrence→Assertion, Community→Channel, ComparabilityAssessment→Assessment, Condition, Conference→Channel, ConflictRelevanceAssessment→Assessment, Constituent, Constraint→UseConstraint, ConsumerBrand→Brand, ContraindicationAssertion→Assertion, Dataset→Study, DecisionCriterion, DerivedEdgeProperties, Device, Document→MediaWork, DocumentTextVersion→Chunk, DrugApproval→LegalStatus, EndpointClassification→Assessment, Entity, Episode→MediaWork, EquivalenceAssessment→Assessment, Event, EventImpactAssessment→Assessment, EventRoleEdgeProperties, EvidenceApplicability→Assessment, EvidenceStrengthAssessment→Assessment, EvidenceSynthesis→Assessment, Exposure→Intervention, FigurePanel→SourceLocator, FirmwareVersion→AlgorithmVersion, FoodItem, FormulationVersion→LabelVersion, FunctionalGoal→Target, GrantedPatent→Patent, Identifier, IdentifierLinkProperties, IngredientComponent→LabelVersion, IngredientMaterial, InteractionAssertion→Assertion, InterventionComponent, IpRightStatus→LegalStatus, LabelDeclaration→LabelVersion, LabelSnapshot→LabelVersion, LabTest, LegalEntity→Organization, Lifestyle→Intervention, LotTestSummary→Source, ManufacturingCapability→Assertion, MaterialMixture→IngredientMaterial, MeasuredResult→QualityResult, MeasurementMethod→AssayVersion, MeasurementPlan→ProtocolStep, Mechanism, MechanismEvidenceContext, MediaAnnotation→SourceLocator, MediaAsset→MediaWork, MediaRightsRecord→MediaWork, MediaVariant→Source, Mention→SourceLocator, MerchantListing, Metric, MicrobialPreparation→IngredientMaterial, MicrobialStrain→Taxon, MicrobialTaxon→Taxon, Modality→Device, MolecularEntity, NarrativeArc→Report, Nutrient→Constituent, Observation→Assertion, Offer, Organ→MechanismEvidenceContext, Organization, OrganizationSnapshot→Organization, OrphanDesignation→LegalStatus, Outcome, OutcomeDefinition, PackageConfiguration→Package, PanelDefinition→LabTest, PassFailInterpretation→QualityResult, PatentApplication→Patent, PatentClaim→LegalStatus, PatentFamily→Patent, PatentLicense→Patent, Pathway→Mechanism, Person, Platform→Channel, PriceObservation→Offer, Procedure→Intervention, Product, ProductLabelRegion→SourceLocator, ProductLot→Lot, ProductSnapshot→LabelVersion, ProductVariant, Protocol, ProtocolAdjustmentRule→ProtocolStep, ProtocolEdition, ProtocolResult→Assertion, ProtocolStep, ProtocolVersion→Publication, Publication, QuantityDeclaration→LabelVersion, ReferenceIntervalVersion, ReferenceRange→ReferenceIntervalVersion, ReferenceSystem→AssayVersion, RegistrationVersion, RegulatoryAgency→Organization, RegulatoryInspection→RegulatoryRecord, RegulatoryPathwayVersion→RegulatoryRecord, RegulatoryResponse→RegulatoryRecord, RegulatoryStatus→LegalStatus, RegulatorySubmission→RegulatoryRecord, RelationshipAssertion→Assertion, ResolutionHypothesis→Assessment, ResultInterpretation→Assessment, RetellingFidelityAssessment→Assessment, RiskFactor→Condition, RoleEdgeProperties, SafetySignal→Assessment, Segmentation→Chunk, Sensor→Device, Series→Channel, ServingDefinition→LabelVersion, Source, SourceAuthorityAssessment→Assessment, SourceDiscoveryRecord→CaptureAttempt, SourceLocator, SourceRevisionEvent→SourceSnapshot, SourceSnapshot, Species→MechanismEvidenceContext, SpecificationCriterion→QualityResult, Specimen→AssayVersion, StructuralEdgeProperties, Study, StudyArm, StudyIntervention→StudyArm, StudyPopulation, StudyResult, SubscriptionPlan→Offer, Target, TechnologyPlatform→AssayVersion, TestExecution→QualityResult, TestingLaboratory→Organization, TestMethod→QualityResult, TestSample→QualityResult, ToolOrInstrument→Device, TradeItemIdentifier→Identifier, Treatment→Intervention, TrialRegistration→Study, UseConstraint | node-register mergedInto (D7): mongoResearchRunId → lastWriterRunId ‖ packets/D7 05/06/09: mongoResearchRunId → lastWriterRunId ‖ v2 SDL Entity: `lastWriterRun… |
| `responseStatusCode` | renamed | httpStatus | SourceDiscoveryRecord→CaptureAttempt | node-register mergedInto (D11): responseStatusCode → httpStatus ‖ packets/D11 05/06/09: responseStatusCode → httpStatus |
| `severity` | renamed | gradeScheme | SafetySignal→Assessment | packets/K 05/06/09: severity → gradeScheme ‖ packets/D5 05/06/09: severity → `gradeScheme` |
