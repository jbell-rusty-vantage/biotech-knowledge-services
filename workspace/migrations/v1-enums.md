---
id: "migration:v1-enums"
kind: "migration"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:migration/v1-map.yaml#enums"]
aliases: ["v1-enums","v1 enums"]
capabilities: ["get"]
cardDigest: "sha256:79a4b12807d067ae81e1909400c0976e1e336eb89da61228fbdbf4f83db9020b"
---
# v1 enums

Navigation only: how a v1-proposal name maps to release biotech-schema-v2.2.0. This is never an execution script; data migration is owned by S8. A removed concept points here, never at a silently substituted type. Legend: [README](README.md).

| v1 | disposition | v2 | ruling | note |
| --- | --- | --- | --- | --- |
| `AccessTier` | retired | — |  | used by AnswerRecord.accessTier; owner fate AnswerRecord:merged |
| `AccreditationScopeStatus` | retired | — |  | used by TestExecution.accreditationScopeStatus; owner fate TestExecution:merged |
| `ActivityKind` | kept-changed | [ActivityKind](../vocabularies/ActivityKind.md) |  |  |
| `AdjudicationKind` | unchanged | [AdjudicationKind](../vocabularies/AdjudicationKind.md) |  |  |
| `AdjudicationVerdict` | retired | — |  | used by Adjudication.verdict, EvidenceSynthesis.verdict; owner fate Adjudication:kept, EvidenceSynthesis:merged |
| `AeCollectionMethod` | unchanged | [AeCollectionMethod](../vocabularies/AeCollectionMethod.md) |  |  |
| `AeSeriousness` | unchanged | [AeSeriousness](../vocabularies/AeSeriousness.md) |  |  |
| `AgentKind` | unchanged | [AgentKind](../vocabularies/AgentKind.md) |  |  |
| `AlgorithmOutputKind` | unchanged | [AlgorithmOutputKind](../vocabularies/AlgorithmOutputKind.md) |  |  |
| `AlgorithmVersionBasis` | kept-changed | [AlgorithmVersionBasis](../vocabularies/AlgorithmVersionBasis.md) |  |  |
| `AmountReferent` | kept-changed | [AmountReferent](../vocabularies/AmountReferent.md) |  |  |
| `AnalysisKind` | unchanged | [AnalysisKind](../vocabularies/AnalysisKind.md) |  |  |
| `AnalysisSetKind` | unchanged | [AnalysisSetKind](../vocabularies/AnalysisSetKind.md) |  |  |
| `AnatomicalContextKind` | retired | — |  | used by AnatomicalContext.contextKind, Organ.contextKind; owner fate AnatomicalContext:merged, Organ:merged |
| `AnchorMatch` | retired | — |  | used by ReanchorProperties.anchorMatch; owner fate ReanchorProperties:removed-edge |
| `AnnotationType` | retired | — |  | used by MediaAnnotation.annotationType; owner fate MediaAnnotation:merged |
| `ApplicabilityDimensionKind` | retired | — |  | used by ApplicabilityDimension.dimension; owner fate ApplicabilityDimension:merged |
| `ApplicabilityVerdict` | retired | — |  | used by EvidenceApplicability.identityMatch, EvidenceApplicability.doseMatch, EvidenceApplicability.routeMatch, EvidenceApplicability.scheduleMatch; owner fate ApplicabilityDimension:merged, Evidence… |
| `ArmRole` | retired | — |  | used by ResultArmProperties.armRole; owner fate ResultArmProperties:removed-edge |
| `ArmType` | unchanged | [ArmType](../vocabularies/ArmType.md) |  |  |
| `AssertionBasis` | retired | — |  | used by AssertionArchetype.assertionBasis, Assertion.assertionBasis, ContraindicationAssertion.assertionBasis, InteractionAssertion.assertionBasis; owner fate Assertion:kept, AssertionArchetype:remov… |
| `AssertionStatus` | unchanged | [AssertionStatus](../vocabularies/AssertionStatus.md) |  |  |
| `AssessmentStatus` | unchanged | [AssessmentStatus](../vocabularies/AssessmentStatus.md) |  |  |
| `AuthorityScope` | retired | — |  | used by SourceAuthorityAssessment.authorityScopes, SourceCoverageRequirement.requiredAuthorityScopes; owner fate SourceAuthorityAssessment:merged, SourceCoverageRequirement:removed |
| `BasisKind` | kept-changed | [BasisKind](../vocabularies/BasisKind.md) |  |  |
| `BiomarkerCategory` | retired | — |  | used by EndpointClassification.biomarkerCategory; owner fate EndpointClassification:merged |
| `BotanicalPreparationType` | unchanged | [BotanicalPreparationType](../vocabularies/BotanicalPreparationType.md) |  |  |
| `CadenceUnit` | kept-changed | [CadenceUnit](../vocabularies/CadenceUnit.md) |  |  |
| `CapabilityStage` | retired | — |  | used by ManufacturingCapability.stage; owner fate ManufacturingCapability:merged |
| `CapacityBasis` | retired | — |  | used by ManufacturingCapability.capacityBasis; owner fate ManufacturingCapability:merged |
| `CaptureCompleteness` | retired | — |  | used by SourceSnapshot.captureCompleteness, LabelSnapshot.captureCompleteness, SpecificationVersion.criteriaCaptureCompleteness; owner fate LabelSnapshot:merged, SourceSnapshot:kept, SpecificationVer… |
| `CertificationListingStatus` | kept-changed | [CertificationListingStatus](../vocabularies/CertificationListingStatus.md) |  |  |
| `CertifiedObjectKind` | kept-changed | [CertifiedObjectKind](../vocabularies/CertifiedObjectKind.md) |  |  |
| `ChemicalFormKind` | retired | — |  | used by ChemicalForm.formKind; owner fate ChemicalForm:merged |
| `ClaimType` | kept-changed | [ClaimType](../vocabularies/ClaimType.md) |  |  |
| `ComparabilityVerdict` | retired | — |  | used by ComparabilityAssessment.verdict; owner fate ComparabilityAssessment:merged |
| `ComparisonKind` | unchanged | [ComparisonKind](../vocabularies/ComparisonKind.md) |  |  |
| `CompensationKind` | replaced | `ValueTransferKind (D7 mergedInto)` |  | used by RoleEdgeProperties.compensationKind; owner fate RoleEdgeProperties:kept-edge |
| `ConstituentKind` | kept-changed | [ConstituentKind](../vocabularies/ConstituentKind.md) |  |  |
| `ConstraintKind` | retired | — |  | used by Constraint.constraintKind; owner fate Constraint:merged |
| `ConstraintLevel` | kept-changed | [ConstraintLevel](../vocabularies/ConstraintLevel.md) |  |  |
| `ConstraintRole` | retired | — |  | used by ConstraintRoleProperties.constraintRole; owner fate ConstraintRoleProperties:removed-edge |
| `ConstraintScopeRole` | retired | — |  | used by ConstraintScopeProperties.scopeRole; owner fate ConstraintScopeProperties:removed-edge |
| `ContentBasis` | retired | — |  | used by QuantitativeContentProperties.basis; owner fate QuantitativeContentProperties:removed-edge |
| `ContentHashBasis` | retired | — |  | used by SourceSnapshot.contentHashBasis, LabelSnapshot.contentHashBasis, MediaAsset.contentHashBasis, MediaVariant.contentHashBasis; owner fate LabelSnapshot:merged, MediaAsset:merged, MediaVariant:m… |
| `ContentStatementKind` | kept-changed | [ContentStatementKind](../vocabularies/ContentStatementKind.md) |  |  |
| `ContextOfUseMatch` | retired | — |  | used by EndpointClassification.contextMatch; owner fate EndpointClassification:merged |
| `CorporateRoleType` | replaced | `OrgRoleKind (D7 mergedInto)` |  | used by RoleEdgeProperties.corporateRoleType; owner fate RoleEdgeProperties:kept-edge |
| `CriterionBasis` | unchanged | [CriterionBasis](../vocabularies/CriterionBasis.md) |  |  |
| `CriterionPurpose` | retired | — |  | used by SpecificationCriterion.criterionPurpose; owner fate SpecificationCriterion:merged |
| `DatasetAccessLevel` | retired | — |  | used by Dataset.accessLevel; owner fate Dataset:merged |
| `DatasetAnalysisRole` | retired | — |  | used by DatasetAnalysisProperties.analysisRole; owner fate DatasetAnalysisProperties:removed-edge |
| `DayOfWeek` | retired | — |  | used by ProtocolEdition.daysOfWeek, ProtocolStep.daysOfWeek; owner fate ProtocolEdition:kept, ProtocolStep:kept |
| `DeclarationKind` | retired | — |  | used by LabelDeclaration.declarationKind; owner fate LabelDeclaration:merged |
| `DiagnosticResultKind` | unchanged | [DiagnosticResultKind](../vocabularies/DiagnosticResultKind.md) |  |  |
| `DimensionClass` | retired | — |  | used by ApplicabilityDimension.dimensionClass; owner fate ApplicabilityDimension:merged |
| `DisclosureFinding` | retired | — |  | used by ConflictRelevanceAssessment.disclosureFinding; owner fate ConflictRelevanceAssessment:merged |
| `DiscoveryOutcome` | retired | — |  | used by SourceDiscoveryRecord.discoveryOutcome; owner fate SourceDiscoveryRecord:renamed |
| `DocumentDomain` | retired | — |  | used by Document.documentDomain; owner fate Document:merged |
| `DocumentType` | retired | — |  | used by Document.documentType; owner fate Document:merged |
| `EmployeeCountBand` | retired | — |  | used by OrganizationSnapshot.employeeCountBand; owner fate OrganizationSnapshot:merged |
| `EndpointClass` | retired | — |  | used by EndpointClassification.endpointClass; owner fate EndpointClassification:merged |
| `EnrollmentCountType` | unchanged | [EnrollmentCountType](../vocabularies/EnrollmentCountType.md) |  |  |
| `EquivalenceKind` | retired | — |  | used by EquivalenceAssessment.equivalenceKind; owner fate EquivalenceAssessment:merged |
| `EstimateQualifier` | unchanged | [EstimateQualifier](../vocabularies/EstimateQualifier.md) |  |  |
| `EventCategory` | replaced | `EventKind (D13 mergedInto)` |  | used by Event.eventCategory; owner fate Event:kept |
| `EventStatus` | kept-changed | [EventStatus](../vocabularies/EventStatus.md) |  |  |
| `EvidenceChangeEffect` | retired | — |  | used by EvidenceChangeProperties.effectOnVerdict; owner fate EvidenceChangeProperties:removed-edge |
| `EvidenceStrength` | retired | — |  | used by TreatmentTargetProperties.legacyEvidenceStrengthHint, SafetySignal.legacyEvidenceStrengthHint, ClaimEvidenceAssessment.evidenceStrength; owner fate ClaimEvidenceAssessment:merged, SafetySigna… |
| `ExposureBasis` | retired | — |  | used by MechanismEvidenceContext.exposureBasis, Exposure.intensityBasis; owner fate Exposure:merged, MechanismEvidenceContext:kept |
| `ExposureDurationCategory` | retired | — |  | used by Exposure.durationCategory; owner fate Exposure:merged |
| `ExposureRoute` | retired | — |  | used by Exposure.route; owner fate Exposure:merged |
| `ExposureSetting` | retired | — |  | used by Exposure.setting; owner fate Exposure:merged |
| `FoodVariantKind` | kept-changed | [FoodVariantKind](../vocabularies/FoodVariantKind.md) |  |  |
| `FundingStage` | retired | — |  | used by OrganizationSnapshot.fundingStage; owner fate OrganizationSnapshot:merged |
| `GraphViewType` | retired | — |  | used by GraphView.graphViewType; owner fate GraphView:removed |
| `ImpactLevel` | retired | — |  | used by EventImpactAssessment.impactLevel; owner fate EventImpactAssessment:merged |
| `LabelRegionType` | retired | — |  | used by ProductLabelRegion.labelRegionType; owner fate ProductLabelRegion:merged |
| `LocationType` | retired | — |  | used by FacilityEdgeProperties.facilityRole, Facility.facilityKind; owner fate Facility:removed, FacilityEdgeProperties:removed-edge |
| `MassBasis` | kept-changed | [MassBasis](../vocabularies/MassBasis.md) |  |  |
| `MaterialIdentityLevel` | retired | — |  | used by ApplicabilityDimension.identityLevel; owner fate ApplicabilityDimension:merged |
| `MaterialKind` | kept-changed | [MaterialKind](../vocabularies/MaterialKind.md) |  |  |
| `MeaningfulnessVerdict` | retired | — |  | used by ResultInterpretation.meaningfulnessVerdict; owner fate ResultInterpretation:merged |
| `MeasureKind` | kept-changed | [MeasureKind](../vocabularies/MeasureKind.md) |  |  |
| `MeasurementPlanTiming` | retired | — |  | used by MeasurementPlan.planTiming; owner fate MeasurementPlan:merged |
| `MechanismSetting` | unchanged | [MechanismSetting](../vocabularies/MechanismSetting.md) |  |  |
| `MediaAssetType` | retired | — |  | used by MediaAsset.assetType; owner fate MediaAsset:merged |
| `MediaCaptureRelation` | retired | — |  | used by MediaSourceProperties.captureRelation; owner fate MediaSourceProperties:removed-edge |
| `MediaFormat` | retired | — |  | used by MediaVariant.mediaFormat; owner fate MediaVariant:merged |
| `MediaGenerationMode` | retired | — |  | used by MediaAsset.generationMode; owner fate MediaAsset:merged |
| `MediaPurpose` | retired | — |  | used by MediaAsset.mediaPurpose; owner fate MediaAsset:merged |
| `MediaRelationRole` | retired | — |  | used by MediaSuitabilityAssessment.intendedRole, MediaLinkProperties.role; owner fate MediaLinkProperties:removed-edge, MediaSuitabilityAssessment:removed |
| `MediaRightsStatus` | retired | — |  | used by MediaRightsRecord.rightsStatus; owner fate MediaRightsRecord:merged |
| `MediaSourceType` | retired | — |  | used by MediaSourceProperties.sourceType; owner fate MediaSourceProperties:removed-edge |
| `MediaSuitabilityDimension` | retired | — |  | used by MediaSuitabilityAssessment.dimension; owner fate MediaSuitabilityAssessment:removed |
| `MediaVariantKind` | retired | — |  | used by MediaVariant.variantKind; owner fate MediaVariant:merged |
| `MixtureKind` | retired | — |  | used by MaterialMixture.mixtureKind; owner fate MaterialMixture:merged |
| `NodeMaturity` | retired | — |  | used by Source.maturity, SourceSnapshot.maturity, SourceLocator.maturity, SourceRevisionEvent.maturity; owner fate Activity:kept, Adjudication:kept, AdverseEffect:merged, AdverseEventResult:merged, A… |
| `NutrientKind` | unchanged | [NutrientKind](../vocabularies/NutrientKind.md) |  |  |
| `ObservedAvailability` | retired | — |  | used by Offer.availabilityStatus, PriceObservation.availabilityObserved; owner fate Offer:kept, PriceObservation:merged |
| `OfferKind` | retired | — |  | used by Offer.offerKind; owner fate Offer:kept |
| `OrganizationType` | replaced | `OrganizationKind (D7 mergedInto)` |  | used by Organization.organizationType, LegalEntity.organizationType, OrganizationSnapshot.organizationType; owner fate LegalEntity:merged, Organization:kept, OrganizationSnapshot:merged |
| `OutcomeDirection` | retired | — |  | used by StudyResult.direction; owner fate StudyResult:kept |
| `OutcomePriority` | kept-changed | [OutcomePriority](../vocabularies/OutcomePriority.md) |  |  |
| `PassFailVerdict` | kept-changed | [PassFailVerdict](../vocabularies/PassFailVerdict.md) |  |  |
| `PathwayKind` | retired | — |  | used by RegulatoryPathway.pathwayKind, RegulatorySubmission.submissionKind; owner fate RegulatoryPathway:removed, RegulatorySubmission:merged |
| `Polarity` | unchanged | [Polarity](../vocabularies/Polarity.md) |  |  |
| `PolicyKind` | retired | — |  | used by PolicyVersion.policyKind; owner fate PolicyVersion:removed |
| `PredicateClass` | retired | — |  | used by AssertionArchetype.predicateClass, Assertion.predicateClass, ContraindicationAssertion.predicateClass, InteractionAssertion.predicateClass; owner fate Assertion:kept, AssertionArchetype:remov… |
| `PriceKind` | retired | — |  | used by MerchantListing.priceKindProjected, PriceObservation.priceKind; owner fate MerchantListing:kept, PriceObservation:merged |
| `PrivacyClass` | unchanged | [PrivacyClass](../vocabularies/PrivacyClass.md) |  |  |
| `PrivateContextMode` | retired | — |  | used by AnswerRecord.privateContext; owner fate AnswerRecord:merged |
| `ProcessKind` | retired | — |  | used by ManufacturingProcess.processKind; owner fate ManufacturingProcess:removed |
| `ProductKind` | kept-changed | [ProductKind](../vocabularies/ProductKind.md) |  |  |
| `ProductStatus` | retired | — |  | used by Product.status, ProductSnapshot.status; owner fate Product:kept, ProductSnapshot:merged |
| `ProtocolChangeProvenance` | unchanged | [ProtocolChangeProvenance](../vocabularies/ProtocolChangeProvenance.md) |  |  |
| `ProtocolStepType` | retired | — |  | used by ProtocolStep.stepKind; owner fate ProtocolStep:kept |
| `ProtocolType` | retired | — |  | used by Protocol.protocolType; owner fate Protocol:kept |
| `PublicationKind` | kept-changed | [PublicationKind](../vocabularies/PublicationKind.md) |  |  |
| `QualificationKind` | retired | — |  | used by RetellingFidelityAssessment.lostQualificationKinds, QualificationProperties.qualificationKind; owner fate QualificationProperties:removed-edge, RetellingFidelityAssessment:merged |
| `QuantityBasis` | replaced | `AmountBasis (R-58)` |  | used by AssertionArchetype.quantityBasis, Assertion.quantityBasis, IngredientComponent.quantityBasis, QuantityDeclaration.quantityBasis; owner fate ApplicabilityDimension:merged, Assertion:kept, Asse… |
| `QuantityComparator` | kept-changed | [QuantityComparator](../vocabularies/QuantityComparator.md) |  |  |
| `ReferenceIntervalDerivation` | kept-changed | [ReferenceIntervalDerivation](../vocabularies/ReferenceIntervalDerivation.md) |  |  |
| `ReferenceIntervalKind` | kept-changed | [ReferenceIntervalKind](../vocabularies/ReferenceIntervalKind.md) |  |  |
| `RegistryDateType` | unchanged | [RegistryDateType](../vocabularies/RegistryDateType.md) |  |  |
| `RegulatoryResponseKind` | retired | — |  | used by RegulatoryResponse.responseKind; owner fate RegulatoryResponse:merged |
| `RegulatorySign` | retired | — |  | used by MechanismLinkProperties.regulatorySign; owner fate MechanismLinkProperties:removed-edge |
| `RegulatoryStatusKind` | retired | — |  | used by RegulatoryStatus.statusKind, OrphanDesignation.statusKind, DrugApproval.statusKind; owner fate DrugApproval:merged, OrphanDesignation:merged, RegulatoryStatus:merged |
| `RelatednessAssessor` | retired | — |  | used by AdverseEventResult.relatednessAssessor; owner fate AdverseEventResult:merged |
| `RelevanceBasis` | retired | — |  | used by ConflictRelevanceAssessment.relevanceBasis; owner fate ConflictRelevanceAssessment:merged |
| `RelevanceLevel` | retired | — |  | used by ConflictRelevanceAssessment.relevanceLevel; owner fate ConflictRelevanceAssessment:merged |
| `RenditionCoverage` | retired | — |  | used by Source.renditionCoverage; owner fate Source:kept |
| `ReportedStatus` | retired | — |  | used by QuantityDeclaration.dailyValueStatus, Metric.unitStatus, AssayVersion.softwareVersionStatus, ReferenceIntervalVersion.lowerBoundStatus; owner fate AssayVersion:kept, BundleComponent:merged, I… |
| `RequirementBasis` | unchanged | [RequirementBasis](../vocabularies/RequirementBasis.md) |  |  |
| `RequirementLevel` | unchanged | [RequirementLevel](../vocabularies/RequirementLevel.md) |  |  |
| `ResultInterpretationKind` | retired | — |  | used by ResultInterpretation.interpretation; owner fate ResultInterpretation:merged |
| `ResultQualifier` | retired | — |  | used by DiagnosticResult.valueStatus, MeasuredResult.qualifier, Observation.valueStatus; owner fate DiagnosticResult:removed-iface, MeasuredResult:merged, Observation:merged |
| `RetellingLinkBasis` | retired | — |  | used by RetellingProperties.linkBasis; owner fate RetellingProperties:removed-edge |
| `RetellingMode` | retired | — |  | used by RetellingProperties.retellingMode; owner fate RetellingProperties:removed-edge |
| `ReviewRuleBasis` | retired | — |  | used by ProtocolAdjustmentRule.ruleBasis; owner fate ProtocolAdjustmentRule:merged |
| `ReviewTriggerAction` | retired | — |  | used by ProtocolAdjustmentRule.triggerAction; owner fate ProtocolAdjustmentRule:merged |
| `ReviewTriggerKind` | retired | — |  | used by ProtocolAdjustmentRule.triggerKind; owner fate ProtocolAdjustmentRule:merged |
| `ReviewerType` | retired | — |  | used by Adjudication.reviewerType; owner fate Adjudication:kept |
| `RightsStatementKind` | retired | — |  | used by MediaRightsRecord.statementKind; owner fate MediaRightsRecord:merged |
| `RightsStatementScope` | retired | — |  | used by MediaRightsRecord.statementScope; owner fate MediaRightsRecord:merged |
| `RoleType` | replaced | `OrgRoleKind (D7 mergedInto)` |  | used by RoleEdgeProperties.roleType, AppearanceProperties.roleType; owner fate AppearanceProperties:removed-edge, RoleEdgeProperties:kept-edge |
| `SafetySeverity` | retired | — |  | used by SafetySignal.severity; owner fate SafetySignal:merged |
| `SafetySubjectRole` | retired | — |  | used by SafetyEdgeProperties.subjectRole; owner fate SafetyEdgeProperties:removed-edge |
| `SchedulePattern` | retired | — |  | used by ProtocolEdition.schedulePattern, ProtocolStep.schedulePattern; owner fate ProtocolEdition:kept, ProtocolStep:kept |
| `SelectorKind` | kept-changed | [SelectorKind](../vocabularies/SelectorKind.md) |  |  |
| `SeniorityLevel` | replaced | `OrgRoleKind (D7 mergedInto)` |  | used by RoleEdgeProperties.seniorityLevel; owner fate RoleEdgeProperties:kept-edge |
| `SignalStatus` | retired | — |  | used by SafetySignal.signalStatus; owner fate SafetySignal:merged |
| `SignatureEvidence` | retired | — |  | used by CertificateOfAnalysis.signatureEvidence; owner fate CertificateOfAnalysis:merged |
| `SourceKind` | kept-changed | [SourceKind](../vocabularies/SourceKind.md) |  |  |
| `SourceRevisionKind` | unchanged | [SourceRevisionKind](../vocabularies/SourceRevisionKind.md) |  |  |
| `SpecComparator` | replaced | `QuantityComparator (R-57)` |  | used by SpecificationCriterion.comparator; owner fate SpecificationCriterion:merged |
| `SpeechAct` | unchanged | [SpeechAct](../vocabularies/SpeechAct.md) |  |  |
| `StatisticalConclusion` | kept-changed | [StatisticalConclusion](../vocabularies/StatisticalConclusion.md) |  |  |
| `StepDependencyKind` | retired | — |  | used by StepDependencyProperties.dependencyKind; owner fate StepDependencyProperties:removed-edge |
| `StudyKind` | kept-changed | [StudyKind](../vocabularies/StudyKind.md) |  |  |
| `StudyPopulationKind` | unchanged | [StudyPopulationKind](../vocabularies/StudyPopulationKind.md) |  |  |
| `StudyResultKind` | kept-changed | [StudyResultKind](../vocabularies/StudyResultKind.md) |  |  |
| `SuitabilityVerdict` | retired | — |  | used by MediaSuitabilityAssessment.verdict; owner fate MediaSuitabilityAssessment:removed |
| `SupersessionKind` | retired | — |  | used by SupersessionProperties.supersessionKind; owner fate SupersessionProperties:removed-edge |
| `SurrogateValidationLevel` | retired | — |  | used by EndpointClassification.surrogateValidationLevel; owner fate EndpointClassification:merged |
| `SynthesisInputRole` | retired | — |  | used by SynthesisInputProperties.inputRole; owner fate SynthesisInputProperties:removed-edge |
| `TaxonRank` | kept-changed | [TaxonRank](../vocabularies/TaxonRank.md) |  |  |
| `TemporalOverlap` | retired | — |  | used by ConflictRelevanceAssessment.temporalOverlap; owner fate ConflictRelevanceAssessment:merged |
| `TestExecutionStatus` | retired | — |  | used by TestExecution.status; owner fate TestExecution:merged |
| `TestPurpose` | retired | — |  | used by TestExecution.testPurpose; owner fate TestExecution:merged |
| `ThresholdComparator` | replaced | `D1 QuantityComparator (GT GTE LT LTE BETWEEN OUTSIDE_REFERENCE_RANGE map 1:1) (R-57)` |  | used by Constraint.comparator, ProtocolAdjustmentRule.comparator, Target.comparator, ConstraintScopeProperties.doseComparator; owner fate Constraint:merged, ConstraintScopeProperties:removed-edge, Co… |
| `TimeOfDay` | retired | — |  | used by ProtocolEdition.timeOfDay, ProtocolStep.timeOfDay; owner fate ProtocolEdition:kept, ProtocolStep:kept |
| `TimePrecision` | unchanged | [TimePrecision](../vocabularies/TimePrecision.md) |  |  |
| `TraceDepth` | retired | — |  | used by AnswerRecord.traceDepth; owner fate AnswerRecord:merged |
| `TreatmentComponentRole` | retired | — |  | used by TreatmentComponentProperties.componentRole; owner fate TreatmentComponentProperties:removed-edge |
| `TreatmentIntentBasis` | retired | — |  | used by TreatmentTargetProperties.intentBasis; owner fate TreatmentTargetProperties:removed-edge |
| `TreatmentIntentKind` | retired | — |  | used by TreatmentTargetProperties.intentKind; owner fate TreatmentTargetProperties:removed-edge |
| `TreatmentModality` | retired | — |  | used by Treatment.modalities, Treatment.modality; owner fate Treatment:merged |
| `UncertaintyKind` | retired | — |  | used by MeasuredResult.uncertaintyKind; owner fate MeasuredResult:merged |
| `UseKind` | retired | — |  | used by AuthorizationProperties.useKind, PolicyVersion.permittedUseKinds; owner fate AuthorizationProperties:removed-edge, PolicyVersion:removed |
| `ValidTimeBasis` | unchanged | [ValidTimeBasis](../vocabularies/ValidTimeBasis.md) |  |  |
| `VerdictBasis` | retired | — |  | used by PassFailInterpretation.verdictBasis; owner fate PassFailInterpretation:merged |
| `ViabilityState` | unchanged | [ViabilityState](../vocabularies/ViabilityState.md) |  |  |

## Value mappings

- `QuantityComparator`: {"v2Enum":"QuantityComparator","owner":"D1","ruling":"R-57","sources":["schema/program/final/decision-report.md R-57","schema/program/final/_work/rulings.yaml (remove-enum SpecComparator)","schema/program/final/node-register.yaml retiredEnums ThresholdComparator"],"from":{"SpecComparator":{"owner":"D8","values":[{"v1":"NOT_LESS_THAN","v2":"GTE"},{"v1":"NOT_MORE_THAN","v2":"LTE"},{"v1":"RANGE","v2…
- `RegulatoryPathway`: {"v2Enum":"RegulatoryPathway","owner":"D8","ruling":"R-56, R-66 (OQ-D8-02)","sources":["schema/program/final/vocabularies/frontiers.yaml synthesis.regulatoryPathwayMapping","schema/program/final/schema/D8.graphql enum RegulatoryPathway"],"from":{"ApprovalPathway":{"owner":"D13","field":"Event.approvalPathway","values":[{"v1":"FULL","v2":null,"disposition":"conditional","options":["US_DRUG_NDA","U…
