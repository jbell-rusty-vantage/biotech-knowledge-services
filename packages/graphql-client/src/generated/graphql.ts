/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
/** CAPTURE_FIDELITY judges the record against its declared span (feeds Assertion.status); SUPPORT judges whether located evidence supports the proposition (world question; never changes status). */
export type AdjudicationKind =
  | 'CAPTURE_FIDELITY'
  | 'SUPPORT';

/** Declared allergens (FDA major food allergens plus the EU Annex II list). */
export type AllergenCode =
  | 'CELERY'
  | 'CEREALS_CONTAINING_GLUTEN'
  | 'CRUSTACEAN_SHELLFISH'
  | 'EGG'
  | 'FISH'
  | 'LUPIN'
  | 'MILK'
  | 'MOLLUSCS'
  | 'MUSTARD'
  | 'OTHER'
  | 'PEANUTS'
  | 'SESAME'
  | 'SOYBEANS'
  | 'SULPHITES'
  | 'TREE_NUTS'
  | 'WHEAT';

/** verification.v1 AssertionKindSchema minus report_assertion (report assertions live in the sealed report ledger, not the graph). CLAIM = a claim occurrence. */
export type AssertionKind =
  | 'CLAIM'
  | 'COMPUTATION'
  | 'FIELD'
  | 'METRIC'
  | 'RELATIONSHIP';

/** Capture-fidelity status of an Assertion (is it an accurate record of what the asserter said at the span); never truth. Projection of CAPTURE_FIDELITY adjudications (see 09-reasoning.md, verdict mapping). */
export type AssertionStatus =
  | 'ACCEPTED'
  | 'DISPUTED'
  | 'EXTRACTED'
  | 'PROPOSED'
  | 'REJECTED'
  | 'SUPERSEDED'
  | 'UNRESOLVED';

/** Kind of Assessment. Domains request new values through their 11-open-questions.md; additions are additive kernel changes. */
export type AssessmentKind =
  | 'APPLICABILITY'
  | 'BREAKTHROUGH_JUDGMENT'
  | 'COMPARABILITY'
  | 'CONFLICT_RELEVANCE'
  | 'EQUIVALENCE'
  | 'EVENT_IMPACT'
  | 'EVIDENCE_SYNTHESIS'
  | 'INSIGHT'
  | 'OTHER'
  | 'QUALITY'
  | 'RESOLUTION'
  | 'RETELLING_FIDELITY'
  | 'SAFETY_SIGNAL'
  | 'SOURCE_AUTHORITY'
  | 'VETTING';

/** Workflow state of an Assessment or Report record; not a verdict. */
export type AssessmentStatus =
  | 'ACCEPTED'
  | 'PROPOSED'
  | 'SUPERSEDED'
  | 'WITHDRAWN';

/** Epistemic basis of a proposition; CALCULATED needs derivationRule and DERIVED_FROM inputs. THIRD_PARTY_ANECDOTE: the asserter reports another person's experience; MECHANISM_REASONING: argued from a mechanism, not measured (D9 request K-7); CURATOR_CLASSIFICATION: a curator's classification against a versioned curation Source (frontier, hallmark mapping, target operationalization, curator attachment; R-25). One basis per Assertion (split mixed-basis statements); projections rank bases by the one published kernel order (09-reasoning). */
export type BasisKind =
  | 'CALCULATED'
  | 'CITED_FROM_PRIOR_WORK'
  | 'CURATOR_CLASSIFICATION'
  | 'DIRECT_MEASUREMENT'
  | 'EXPERT_OPINION'
  | 'HYPOTHESIS'
  | 'INFERRED_FROM_MEASUREMENT'
  | 'MANUFACTURER_CLAIM'
  | 'MECHANISM_REASONING'
  | 'PERSONAL_EXPERIENCE'
  | 'THIRD_PARTY_ANECDOTE'
  | 'UNSTATED';

/** What kind of biological referent a Biomarker is. */
export type BiomarkerKind =
  | 'CELL_POPULATION'
  | 'COMPOSITE_AGING_INDEX'
  | 'DNA_METHYLATION_PATTERN'
  | 'GLYCAN_PROFILE'
  | 'METABOLITE'
  | 'OTHER'
  | 'PHYSIOLOGICAL_SIGNAL'
  | 'PROTEIN'
  | 'PROTEIN_MODIFICATION';

/** What a brand is presented on. An ingredient trade name ('Niagen', 'KSM-66') is D1 IngredientMaterial.brandName plus D8 mark ownership, not a Brand. */
export type BrandKind =
  | 'CLINIC_OR_SERVICE'
  | 'CONSUMER_PRODUCT'
  | 'FOOD_OR_RESTAURANT'
  | 'MEDIA'
  | 'OTHER';

/** Certainty of a graded assessment (GRADE-style levels; scheme in Assessment.gradeScheme). */
export type CertaintyLevel =
  | 'HIGH'
  | 'LOW'
  | 'MODERATE'
  | 'NOT_GRADED'
  | 'VERY_LOW';

/** Projection cache of where a Claim is in the scientific loop; authority is its Assessments and Reports. */
export type ClaimLifecycleState =
  | 'EXTRACTED'
  | 'IGNORED'
  | 'MONITORED'
  | 'QUEUED_FOR_RESEARCH'
  | 'REPORTED'
  | 'UNDER_RESEARCH';

/** verification.v1 ClaimTypeSchema. */
export type ClaimType =
  | 'ATTRIBUTE'
  | 'CAPABILITY'
  | 'CAUSAL'
  | 'COMPARATIVE'
  | 'COMPATIBILITY'
  | 'DEFINITION'
  | 'EVENT'
  | 'MEASUREMENT'
  | 'METHODOLOGICAL'
  | 'OTHER'
  | 'PROVENANCE'
  | 'RECOMMENDATION'
  | 'RELATIONSHIP'
  | 'TEMPORAL';

/** Kind of Condition (absorbs the pinned RiskFactor as RISK_STATE). */
export type ConditionKind =
  | 'DISEASE'
  | 'PHENOTYPE'
  | 'RISK_STATE'
  | 'SYNDROME';

/** Consumer-distinguishing dosage or serving form of a variant. */
export type DosageForm =
  | 'BAR'
  | 'CAPSULE'
  | 'DEVICE'
  | 'GUMMY'
  | 'KIT'
  | 'LIQUID'
  | 'MEAL_ITEM'
  | 'OTHER'
  | 'POWDER'
  | 'SOFTGEL'
  | 'STICK_PACK'
  | 'TABLET';

/** verification.v1 SourceAuthorityVector.authority, per evidence edge (is this source fit for this kind of claim). */
export type EvidenceAuthority =
  | 'AUTHORITATIVE_AGGREGATOR'
  | 'INDEPENDENT'
  | 'PRIMARY'
  | 'PROMOTIONAL'
  | 'SECONDARY'
  | 'UNKNOWN';

/** verification.v1 VerificationMetricObservation evidence binding facet (which part of a metric the span evidences). */
export type EvidenceFacet =
  | 'IDENTITY'
  | 'PERIOD_END'
  | 'PERIOD_START'
  | 'UNIT'
  | 'VALUE';

/** verification.v1 SourceAuthorityVector.independence, per evidence edge (is the source independent of the asserter and the subject). */
export type EvidenceIndependence =
  | 'INDEPENDENT'
  | 'INTERESTED_PARTY'
  | 'SAME_ORGANIZATION'
  | 'SELF_REPORTED'
  | 'UNKNOWN';

/** verification.v1 EvidenceEdge.origin. */
export type EvidenceOrigin =
  | 'DECLARED'
  | 'VERIFIER_FOUND';

/** verification.v1 EvidenceRoleSchema. */
export type EvidenceRole =
  | 'CONTEXT'
  | 'CONTRADICTS'
  | 'QUALIFIES'
  | 'SUPPORTS';

/** What kind of actual material an IngredientMaterial is (absorbs the pinned Branded/Botanical/Microbial/Mixture subtypes; branded = brandName set). */
export type MaterialKind =
  | 'BOTANICAL_PREPARATION'
  | 'CHEMICALLY_DEFINED'
  | 'MATERIAL_MIXTURE'
  | 'MICROBIAL_PREPARATION'
  | 'OTHER'
  | 'PROTEIN_OR_ENZYME'
  | 'UNRESOLVED';

/** Coarse, filterable kind of organization (trimmed from the pinned 37-value OrganizationType). Never a role (pinned INV-009): what an organization does for a product, study or event is an edge in the domain that asks. */
export type OrganizationKind =
  | 'ACADEMIC_OR_RESEARCH_INSTITUTE'
  | 'BIOTECH_OR_PHARMA'
  | 'CLINIC_OR_HEALTHCARE_PROVIDER'
  | 'CONTRACT_SERVICE_PROVIDER'
  | 'DIAGNOSTICS_OR_DEVICE'
  | 'FOOD_OR_BEVERAGE'
  | 'GOVERNMENT_OR_REGULATOR'
  | 'INVESTOR_OR_FUND'
  | 'MEDIA_OR_CREATOR_BUSINESS'
  | 'NONPROFIT_OR_FOUNDATION'
  | 'OTHER'
  | 'RETAILER_OR_MARKETPLACE'
  | 'SUPPLEMENT_OR_CONSUMER_HEALTH'
  | 'TESTING_OR_CERTIFICATION_BODY'
  | 'TRADE_OR_PROFESSIONAL_ASSOCIATION';

/** Registry or self-declared status of an organization record; the dated history is in Assertions (predicate ORGANIZATION_STATUS). */
export type OrganizationStatus =
  | 'ACTIVE'
  | 'DISSOLVED'
  | 'INACTIVE'
  | 'MERGED_OR_ACQUIRED'
  | 'UNKNOWN';

/** How a sellable package is composed. */
export type PackageKind =
  /** A bundle across products or brands. */
  | 'BUNDLE'
  /** One container of one variant (a bottle of 30 capsules, a 350 g pouch). */
  | 'CONTAINER'
  /** A seller-defined kit of different packages (brand SKU '-KIT'). */
  | 'KIT'
  /** N identical containers sold as one item (two-bottle supply). */
  | 'MULTIPACK'
  | 'OTHER'
  /** One served portion of a prepared food (a sandwich, a menu item); no container GTIN. */
  | 'SERVED_PORTION';

/** Which regulated or declared panel the label version is. */
export type PanelKind =
  | 'DRUG_FACTS'
  | 'INGREDIENT_STATEMENT'
  | 'MENU_DECLARATION'
  | 'NUTRITION_FACTS'
  | 'OTHER'
  /** Prescribing information (SPL / package insert) of a prescription drug (R-88). */
  | 'PRESCRIBING_INFORMATION'
  | 'SUPPLEMENT_FACTS';

/** Physical (solid-state or particle) form the structure authority does not register as a separate substance (absorbs the pinned ChemicalForm node). */
export type PhysicalFormKind =
  | 'AMORPHOUS_FORM'
  | 'CRYSTAL_FORM'
  | 'OTHER_PHYSICAL_FORM'
  | 'PARTICLE_SIZE_GRADE';

/** Affirms, denies, mixed or unknown; 'not reported' is never NEGATIVE. */
export type Polarity =
  | 'MIXED'
  | 'NEGATIVE'
  | 'POSITIVE'
  | 'UNKNOWN';

/** verification.v1 PolicyOutcomeSchema. */
export type PolicyOutcome =
  | 'ABSTAIN'
  | 'FAIL'
  | 'PASS'
  | 'PASS_WITH_WARNINGS'
  | 'REVIEW';

/** Access class. There is no private-personal value; null is not public (fail closed). */
export type PrivacyClass =
  | 'INTERNAL'
  | 'PUBLIC';

/** What kind of thing is sold. Replaces the pinned ProductKind (adds PREPARED_FOOD, SERVICE; drops BIOLOGIC, which is D8/D3 territory). The pinned drug-pipeline ProductStatus is not used by D6 (market status is assertions on offers and packages). */
export type ProductKind =
  | 'BEVERAGE'
  | 'CONSUMER_DEVICE'
  | 'CONVENTIONAL_FOOD'
  | 'COSMETIC'
  | 'DIAGNOSTIC_TEST_SERVICE'
  | 'DIETARY_SUPPLEMENT'
  | 'MEDICAL_DEVICE'
  | 'OTC_DRUG'
  | 'OTHER'
  | 'PREPARED_FOOD'
  /** A prescription drug product with a labeler of record (R-88); prescription-only status is a D8 LegalStatus (PRESCRIPTION_ONLY), scoped by jurisdiction. */
  | 'PRESCRIPTION_DRUG'
  | 'SERVICE';

/** verification.v1 PropertyObservation.status, for the five orthogonal properties. */
export type PropertyStatus =
  | 'NOT_ASSESSED'
  | 'NOT_SATISFIED'
  | 'SATISFIED'
  | 'UNKNOWN';

/** Why a natural person is a public actor (the privacy gate: a Person exists only in the role that makes them public). */
export type PublicActorBasis =
  | 'AUTHOR_OR_INVESTIGATOR'
  | 'CLINICIAN_PUBLIC_COMMENTATOR'
  | 'ENDORSER_NAMED_BY_REGULATOR'
  | 'FOUNDER_OR_INVESTOR'
  | 'OFFICER_OR_DIRECTOR'
  | 'OTHER_PUBLIC_ROLE'
  | 'SPEAKER_OR_CREATOR';

/** Recruitment status as a registry version states it (non-CTG vocabularies map here; the verbatim value is kept). */
export type RegistryStatus =
  | 'ACTIVE_NOT_RECRUITING'
  | 'COMPLETED'
  | 'ENROLLING_BY_INVITATION'
  | 'NOT_YET_RECRUITING'
  | 'OTHER'
  | 'RECRUITING'
  | 'SUSPENDED'
  | 'TERMINATED'
  | 'UNKNOWN'
  | 'WITHDRAWN';

/** Kind of published artifact. STUDY_APPRAISAL (R-SV11): the scientific appraisal of one or more studies (the Knowledge Services report kind study_appraisal); reportKindRef carries the versioned kind reference. */
export type ReportKind =
  | 'ANSWER'
  | 'COMPARISON'
  | 'EVIDENCE_REPORT'
  | 'PROFILE'
  | 'RECOMMENDATION'
  | 'STUDY_APPRAISAL';

/** verification.v1 selector kinds (VerificationSelectorKindSchema), one SourceLocator each. */
export type SelectorKind =
  | 'API_RECORD'
  | 'BOUNDING_BOX'
  | 'CHARACTER_POSITION'
  | 'DATASET'
  | 'HTML'
  | 'JSON_POINTER'
  | 'MEDIA_TIMECODE'
  | 'MULTI_FRAGMENT_TEXT'
  | 'PDF_TEXT'
  | 'REPOSITORY'
  | 'TABLE'
  | 'TEXT_QUOTE'
  | 'WHOLE_SNAPSHOT';

/** verification.v1 SemanticVerdictSchema (the verdict lattice), stored in SCREAMING_SNAKE spelling. */
export type SemanticVerdict =
  | 'CONTEXT_ONLY'
  | 'CONTRADICTED'
  | 'DERIVED_FAILED'
  | 'DERIVED_VERIFIED'
  | 'DIRECTLY_SUPPORTED'
  | 'INSUFFICIENT_EVIDENCE'
  | 'LOCATOR_ERROR'
  | 'MIXED_OR_CONFLICTING'
  | 'NOT_SUPPORTED'
  | 'PARSER_ERROR'
  | 'PARTIALLY_SUPPORTED'
  | 'PENDING_SEMANTIC_REVIEW'
  | 'SOURCE_UNAVAILABLE'
  | 'SUPPORTED_WITH_QUALIFICATION'
  | 'UNVERIFIABLE';

/** verification.v1 SourceKindSchema (capture-level kind; the editorial kind is Source.genre). */
export type SourceKind =
  | 'API'
  | 'AUDIO'
  | 'DATASET'
  | 'IMAGE'
  | 'OTHER'
  | 'PDF'
  | 'REGISTRY'
  | 'REPOSITORY'
  | 'TABLE'
  | 'TRANSCRIPT'
  | 'UPLOAD'
  | 'VIDEO'
  | 'WEB_PAGE';

/** What the asserter does with the proposition. */
export type SpeechAct =
  | 'CAUTIONS'
  | 'DENIES'
  | 'QUESTIONS'
  | 'RECOMMENDS'
  | 'REPORTS_PRACTICE'
  | 'SPECULATES'
  | 'STATES';

/** Design of a study (identity-level; per-version registry design fields live on RegistrationVersion). A systematic review or meta-analysis is a Study when it reports pooled results; its versions are Publications. */
export type StudyKind =
  | 'CASE_REPORT'
  | 'CASE_SERIES'
  | 'CROSS_SECTIONAL'
  | 'INTERVENTIONAL_NONRANDOMIZED'
  | 'INTERVENTIONAL_RANDOMIZED'
  | 'INTERVENTIONAL_SINGLE_GROUP'
  | 'META_ANALYSIS'
  | 'OBSERVATIONAL_CASE_CONTROL'
  | 'OBSERVATIONAL_COHORT'
  | 'OTHER'
  | 'PRECLINICAL_IN_VITRO'
  | 'PRECLINICAL_IN_VIVO'
  | 'SYSTEMATIC_REVIEW';

/** FDA GSRS substance class of the defining record (structurally diverse covers plant parts and extracts GSRS registers, e.g. WITHANIA SOMNIFERA ROOT). */
export type SubstanceClass =
  | 'CHEMICAL'
  | 'CONCEPT'
  | 'MIXTURE'
  | 'NUCLEIC_ACID'
  | 'OTHER'
  | 'POLYMER'
  | 'PROTEIN'
  | 'STRUCTURALLY_DIVERSE';

/** Precision of a valid-time bound. */
export type TimePrecision =
  | 'DAY'
  | 'DECADE'
  | 'INSTANT'
  | 'MONTH'
  | 'QUARTER'
  | 'YEAR';

/** Trial phase as registered (ClinicalTrials.gov vocabulary). */
export type TrialPhase =
  | 'EARLY_PHASE_1'
  | 'NOT_APPLICABLE'
  | 'PHASE_1'
  | 'PHASE_1_2'
  | 'PHASE_2'
  | 'PHASE_2_3'
  | 'PHASE_3'
  | 'PHASE_4';

export type AssertionEvidenceTraceQueryVariables = Exact<{
  uid: string;
  first?: number | null | undefined;
  after?: string | null | undefined;
}>;


export type AssertionEvidenceTraceQuery = { assertions: Array<{ uid: string, predicate: string, assertionKind: AssertionKind, claimType: ClaimType | null, status: AssertionStatus, polarity: Polarity | null, speechAct: SpeechAct | null, basisKind: BasisKind | null, proposition: string | null, qualifiers: Array<string> | null, valueString: string | null, valueNumber: number | null, valueBoolean: boolean | null, unitCode: string | null, validFrom: string | null, validTo: string | null, recordedAt: string, recordedTo: string | null, subject: Array<
      | { __typename: 'Agent', uid: string, name: string | null }
      | { __typename: 'AlgorithmVersion', uid: string, name: string | null }
      | { __typename: 'AssayVersion', uid: string, name: string | null }
      | { __typename: 'Award', uid: string, name: string | null }
      | { __typename: 'Biomarker', uid: string, name: string | null }
      | { __typename: 'Brand', uid: string, name: string | null }
      | { __typename: 'CertificationListing', uid: string, name: string | null }
      | { __typename: 'Channel', uid: string, name: string | null }
      | { __typename: 'ChemicalSubstance', uid: string, name: string | null }
      | { __typename: 'Claim', uid: string, name: string | null }
      | { __typename: 'Condition', uid: string, name: string | null }
      | { __typename: 'Constituent', uid: string, name: string | null }
      | { __typename: 'DecisionCriterion', uid: string, name: string | null }
      | { __typename: 'Device', uid: string, name: string | null }
      | { __typename: 'DietaryPattern', uid: string, name: string | null }
      | { __typename: 'Event', uid: string, name: string | null }
      | { __typename: 'FoodCategory', uid: string, name: string | null }
      | { __typename: 'FoodItem', uid: string, name: string | null }
      | { __typename: 'Frontier', uid: string, name: string | null }
      | { __typename: 'IngredientMaterial', uid: string, name: string | null }
      | { __typename: 'Intervention', uid: string, name: string | null }
      | { __typename: 'InterventionComponent', uid: string, name: string | null }
      | { __typename: 'LabTest', uid: string, name: string | null }
      | { __typename: 'LabelVersion', uid: string, name: string | null }
      | { __typename: 'LegalStatus', uid: string, name: string | null }
      | { __typename: 'Lot', uid: string, name: string | null }
      | { __typename: 'Mechanism', uid: string, name: string | null }
      | { __typename: 'MediaWork', uid: string, name: string | null }
      | { __typename: 'MerchantListing', uid: string, name: string | null }
      | { __typename: 'Metric', uid: string, name: string | null }
      | { __typename: 'MolecularEntity', uid: string, name: string | null }
      | { __typename: 'Offer', uid: string, name: string | null }
      | { __typename: 'Organization', uid: string, name: string | null }
      | { __typename: 'Outcome', uid: string, name: string | null }
      | { __typename: 'OutcomeDefinition', uid: string, name: string | null }
      | { __typename: 'Package', uid: string, name: string | null }
      | { __typename: 'Patent', uid: string, name: string | null }
      | { __typename: 'Person', uid: string, name: string | null }
      | { __typename: 'Product', uid: string, name: string | null }
      | { __typename: 'ProductVariant', uid: string, name: string | null }
      | { __typename: 'Protocol', uid: string, name: string | null }
      | { __typename: 'ProtocolEdition', uid: string, name: string | null }
      | { __typename: 'ProtocolStep', uid: string, name: string | null }
      | { __typename: 'Publication', uid: string, name: string | null }
      | { __typename: 'QualityResult', uid: string, name: string | null }
      | { __typename: 'ReferenceIntervalVersion', uid: string, name: string | null }
      | { __typename: 'RegistrationVersion', uid: string, name: string | null }
      | { __typename: 'RegulatoryRecord', uid: string, name: string | null }
      | { __typename: 'Source', uid: string, name: string | null }
      | { __typename: 'Study', uid: string, name: string | null }
      | { __typename: 'StudyArm', uid: string, name: string | null }
      | { __typename: 'StudyPopulation', uid: string, name: string | null }
      | { __typename: 'StudyResult', uid: string, name: string | null }
      | { __typename: 'Target', uid: string, name: string | null }
      | { __typename: 'Taxon', uid: string, name: string | null }
      | { __typename: 'UseConstraint', uid: string, name: string | null }
    >, object: Array<
      | { __typename: 'Agent', uid: string, name: string | null }
      | { __typename: 'AlgorithmVersion', uid: string, name: string | null }
      | { __typename: 'AssayVersion', uid: string, name: string | null }
      | { __typename: 'Award', uid: string, name: string | null }
      | { __typename: 'Biomarker', uid: string, name: string | null }
      | { __typename: 'Brand', uid: string, name: string | null }
      | { __typename: 'CertificationListing', uid: string, name: string | null }
      | { __typename: 'Channel', uid: string, name: string | null }
      | { __typename: 'ChemicalSubstance', uid: string, name: string | null }
      | { __typename: 'Claim', uid: string, name: string | null }
      | { __typename: 'Condition', uid: string, name: string | null }
      | { __typename: 'Constituent', uid: string, name: string | null }
      | { __typename: 'DecisionCriterion', uid: string, name: string | null }
      | { __typename: 'Device', uid: string, name: string | null }
      | { __typename: 'DietaryPattern', uid: string, name: string | null }
      | { __typename: 'Event', uid: string, name: string | null }
      | { __typename: 'FoodCategory', uid: string, name: string | null }
      | { __typename: 'FoodItem', uid: string, name: string | null }
      | { __typename: 'Frontier', uid: string, name: string | null }
      | { __typename: 'IngredientMaterial', uid: string, name: string | null }
      | { __typename: 'Intervention', uid: string, name: string | null }
      | { __typename: 'InterventionComponent', uid: string, name: string | null }
      | { __typename: 'LabTest', uid: string, name: string | null }
      | { __typename: 'LabelVersion', uid: string, name: string | null }
      | { __typename: 'LegalStatus', uid: string, name: string | null }
      | { __typename: 'Lot', uid: string, name: string | null }
      | { __typename: 'Mechanism', uid: string, name: string | null }
      | { __typename: 'MediaWork', uid: string, name: string | null }
      | { __typename: 'MerchantListing', uid: string, name: string | null }
      | { __typename: 'Metric', uid: string, name: string | null }
      | { __typename: 'MolecularEntity', uid: string, name: string | null }
      | { __typename: 'Offer', uid: string, name: string | null }
      | { __typename: 'Organization', uid: string, name: string | null }
      | { __typename: 'Outcome', uid: string, name: string | null }
      | { __typename: 'OutcomeDefinition', uid: string, name: string | null }
      | { __typename: 'Package', uid: string, name: string | null }
      | { __typename: 'Patent', uid: string, name: string | null }
      | { __typename: 'Person', uid: string, name: string | null }
      | { __typename: 'Product', uid: string, name: string | null }
      | { __typename: 'ProductVariant', uid: string, name: string | null }
      | { __typename: 'Protocol', uid: string, name: string | null }
      | { __typename: 'ProtocolEdition', uid: string, name: string | null }
      | { __typename: 'ProtocolStep', uid: string, name: string | null }
      | { __typename: 'Publication', uid: string, name: string | null }
      | { __typename: 'QualityResult', uid: string, name: string | null }
      | { __typename: 'ReferenceIntervalVersion', uid: string, name: string | null }
      | { __typename: 'RegistrationVersion', uid: string, name: string | null }
      | { __typename: 'RegulatoryRecord', uid: string, name: string | null }
      | { __typename: 'Source', uid: string, name: string | null }
      | { __typename: 'Study', uid: string, name: string | null }
      | { __typename: 'StudyArm', uid: string, name: string | null }
      | { __typename: 'StudyPopulation', uid: string, name: string | null }
      | { __typename: 'StudyResult', uid: string, name: string | null }
      | { __typename: 'Target', uid: string, name: string | null }
      | { __typename: 'Taxon', uid: string, name: string | null }
      | { __typename: 'UseConstraint', uid: string, name: string | null }
    >, assertedBy: Array<
      | { __typename: 'Agent', uid: string, name: string | null }
      | { __typename: 'AlgorithmVersion', uid: string, name: string | null }
      | { __typename: 'AssayVersion', uid: string, name: string | null }
      | { __typename: 'Award', uid: string, name: string | null }
      | { __typename: 'Biomarker', uid: string, name: string | null }
      | { __typename: 'Brand', uid: string, name: string | null }
      | { __typename: 'CertificationListing', uid: string, name: string | null }
      | { __typename: 'Channel', uid: string, name: string | null }
      | { __typename: 'ChemicalSubstance', uid: string, name: string | null }
      | { __typename: 'Claim', uid: string, name: string | null }
      | { __typename: 'Condition', uid: string, name: string | null }
      | { __typename: 'Constituent', uid: string, name: string | null }
      | { __typename: 'DecisionCriterion', uid: string, name: string | null }
      | { __typename: 'Device', uid: string, name: string | null }
      | { __typename: 'DietaryPattern', uid: string, name: string | null }
      | { __typename: 'Event', uid: string, name: string | null }
      | { __typename: 'FoodCategory', uid: string, name: string | null }
      | { __typename: 'FoodItem', uid: string, name: string | null }
      | { __typename: 'Frontier', uid: string, name: string | null }
      | { __typename: 'IngredientMaterial', uid: string, name: string | null }
      | { __typename: 'Intervention', uid: string, name: string | null }
      | { __typename: 'InterventionComponent', uid: string, name: string | null }
      | { __typename: 'LabTest', uid: string, name: string | null }
      | { __typename: 'LabelVersion', uid: string, name: string | null }
      | { __typename: 'LegalStatus', uid: string, name: string | null }
      | { __typename: 'Lot', uid: string, name: string | null }
      | { __typename: 'Mechanism', uid: string, name: string | null }
      | { __typename: 'MediaWork', uid: string, name: string | null }
      | { __typename: 'MerchantListing', uid: string, name: string | null }
      | { __typename: 'Metric', uid: string, name: string | null }
      | { __typename: 'MolecularEntity', uid: string, name: string | null }
      | { __typename: 'Offer', uid: string, name: string | null }
      | { __typename: 'Organization', uid: string, name: string | null }
      | { __typename: 'Outcome', uid: string, name: string | null }
      | { __typename: 'OutcomeDefinition', uid: string, name: string | null }
      | { __typename: 'Package', uid: string, name: string | null }
      | { __typename: 'Patent', uid: string, name: string | null }
      | { __typename: 'Person', uid: string, name: string | null }
      | { __typename: 'Product', uid: string, name: string | null }
      | { __typename: 'ProductVariant', uid: string, name: string | null }
      | { __typename: 'Protocol', uid: string, name: string | null }
      | { __typename: 'ProtocolEdition', uid: string, name: string | null }
      | { __typename: 'ProtocolStep', uid: string, name: string | null }
      | { __typename: 'Publication', uid: string, name: string | null }
      | { __typename: 'QualityResult', uid: string, name: string | null }
      | { __typename: 'ReferenceIntervalVersion', uid: string, name: string | null }
      | { __typename: 'RegistrationVersion', uid: string, name: string | null }
      | { __typename: 'RegulatoryRecord', uid: string, name: string | null }
      | { __typename: 'Source', uid: string, name: string | null }
      | { __typename: 'Study', uid: string, name: string | null }
      | { __typename: 'StudyArm', uid: string, name: string | null }
      | { __typename: 'StudyPopulation', uid: string, name: string | null }
      | { __typename: 'StudyResult', uid: string, name: string | null }
      | { __typename: 'Target', uid: string, name: string | null }
      | { __typename: 'Taxon', uid: string, name: string | null }
      | { __typename: 'UseConstraint', uid: string, name: string | null }
    >, evidenceConnection: { totalCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, edges: Array<{ cursor: string, properties: { role: EvidenceRole, origin: EvidenceOrigin, expectedSelectedContentDigest: string | null, authority: EvidenceAuthority | null, independence: EvidenceIndependence | null, facet: EvidenceFacet | null }, node: { uid: string, selectorKind: SelectorKind, exact: string | null, prefix: string | null, suffix: string | null, page: number | null, startOffset: number | null, endOffset: number | null, mediaStartSeconds: number | null, mediaEndSeconds: number | null, snapshot: Array<{ uid: string, retrievedAt: string, publishedAt: string | null, contentHash: string, mimeType: string | null, language: string | null, captureCompleteness: string | null, source: Array<{ uid: string, name: string | null, canonicalUri: string, sourceKind: SourceKind, genre: string | null }> }> } }> }, adjudications: Array<{ uid: string, adjudicationKind: AdjudicationKind, verdict: SemanticVerdict, mechanicalStatus: string | null, policyOutcome: PolicyOutcome | null, recordedAt: string }> }> };

export type ClaimViewQueryVariables = Exact<{
  uid: string;
  first?: number | null | undefined;
}>;


export type ClaimViewQuery = { claims: Array<{ uid: string, proposition: string, propositionHash: string, claimType: ClaimType, lifecycleState: ClaimLifecycleState | null, latestVerdict: SemanticVerdict | null, discourseFirstHandCount: number | null, discourseRetellingCount: number | null, discourseRecutCount: number | null, discourseIndependentCount: number | null, discourseFirstOccurrenceAt: string | null, discourseMethodVersion: string | null, discourseDerivedAt: string | null, occurrencesConnection: { totalCount: number, edges: Array<{ node: { uid: string, predicate: string, status: AssertionStatus, polarity: Polarity | null, speechAct: SpeechAct | null, recordedAt: string, assertedBy: Array<
            | { __typename: 'Agent', uid: string, name: string | null }
            | { __typename: 'AlgorithmVersion', uid: string, name: string | null }
            | { __typename: 'AssayVersion', uid: string, name: string | null }
            | { __typename: 'Award', uid: string, name: string | null }
            | { __typename: 'Biomarker', uid: string, name: string | null }
            | { __typename: 'Brand', uid: string, name: string | null }
            | { __typename: 'CertificationListing', uid: string, name: string | null }
            | { __typename: 'Channel', uid: string, name: string | null }
            | { __typename: 'ChemicalSubstance', uid: string, name: string | null }
            | { __typename: 'Claim', uid: string, name: string | null }
            | { __typename: 'Condition', uid: string, name: string | null }
            | { __typename: 'Constituent', uid: string, name: string | null }
            | { __typename: 'DecisionCriterion', uid: string, name: string | null }
            | { __typename: 'Device', uid: string, name: string | null }
            | { __typename: 'DietaryPattern', uid: string, name: string | null }
            | { __typename: 'Event', uid: string, name: string | null }
            | { __typename: 'FoodCategory', uid: string, name: string | null }
            | { __typename: 'FoodItem', uid: string, name: string | null }
            | { __typename: 'Frontier', uid: string, name: string | null }
            | { __typename: 'IngredientMaterial', uid: string, name: string | null }
            | { __typename: 'Intervention', uid: string, name: string | null }
            | { __typename: 'InterventionComponent', uid: string, name: string | null }
            | { __typename: 'LabTest', uid: string, name: string | null }
            | { __typename: 'LabelVersion', uid: string, name: string | null }
            | { __typename: 'LegalStatus', uid: string, name: string | null }
            | { __typename: 'Lot', uid: string, name: string | null }
            | { __typename: 'Mechanism', uid: string, name: string | null }
            | { __typename: 'MediaWork', uid: string, name: string | null }
            | { __typename: 'MerchantListing', uid: string, name: string | null }
            | { __typename: 'Metric', uid: string, name: string | null }
            | { __typename: 'MolecularEntity', uid: string, name: string | null }
            | { __typename: 'Offer', uid: string, name: string | null }
            | { __typename: 'Organization', uid: string, name: string | null }
            | { __typename: 'Outcome', uid: string, name: string | null }
            | { __typename: 'OutcomeDefinition', uid: string, name: string | null }
            | { __typename: 'Package', uid: string, name: string | null }
            | { __typename: 'Patent', uid: string, name: string | null }
            | { __typename: 'Person', uid: string, name: string | null }
            | { __typename: 'Product', uid: string, name: string | null }
            | { __typename: 'ProductVariant', uid: string, name: string | null }
            | { __typename: 'Protocol', uid: string, name: string | null }
            | { __typename: 'ProtocolEdition', uid: string, name: string | null }
            | { __typename: 'ProtocolStep', uid: string, name: string | null }
            | { __typename: 'Publication', uid: string, name: string | null }
            | { __typename: 'QualityResult', uid: string, name: string | null }
            | { __typename: 'ReferenceIntervalVersion', uid: string, name: string | null }
            | { __typename: 'RegistrationVersion', uid: string, name: string | null }
            | { __typename: 'RegulatoryRecord', uid: string, name: string | null }
            | { __typename: 'Source', uid: string, name: string | null }
            | { __typename: 'Study', uid: string, name: string | null }
            | { __typename: 'StudyArm', uid: string, name: string | null }
            | { __typename: 'StudyPopulation', uid: string, name: string | null }
            | { __typename: 'StudyResult', uid: string, name: string | null }
            | { __typename: 'Target', uid: string, name: string | null }
            | { __typename: 'Taxon', uid: string, name: string | null }
            | { __typename: 'UseConstraint', uid: string, name: string | null }
          > } }> }, assessments: Array<{ uid: string, assessmentKind: AssessmentKind, assessmentSubkind: string | null, status: AssessmentStatus, verdict: SemanticVerdict | null, certainty: CertaintyLevel | null, grade: string | null, summary: string | null, recordedAt: string }>, reports: Array<{ uid: string, reportKind: ReportKind, status: AssessmentStatus, verdict: SemanticVerdict | null, policyOutcome: PolicyOutcome | null, publishedAt: string | null, citationCompleteness: number | null, citationCorrectness: number | null, independentSourceFamilyCount: number | null, distinctSourceFamilyCount: number | null }> }> };

export type EntityCardQueryVariables = Exact<{
  uid: string;
}>;


export type EntityCardQuery = { entities: Array<
    | { __typename: 'Activity', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Adjudication', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Agent', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'AlgorithmVersion', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'AssayVersion', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Assertion', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Assessment', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Association', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Award', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Biomarker', biomarkerKind: BiomarkerKind, description: string | null, uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Brand', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'CertificationListing', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Channel', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'ChemicalSubstance', substanceClass: SubstanceClass | null, molecularFormula: string | null, molecularWeight: number | null, uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Chunk', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Claim', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Condition', conditionKind: ConditionKind | null, description: string | null, uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Constituent', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'DecisionCriterion', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Device', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'DietaryPattern', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Event', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'FoodCategory', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'FoodItem', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Frontier', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Identifier', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'IngredientMaterial', materialKind: MaterialKind, brandName: string | null, physicalForm: PhysicalFormKind | null, uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Intervention', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'InterventionComponent', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'LabTest', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'LabelVersion', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'LegalStatus', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Lot', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Mechanism', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'MechanismEvidenceContext', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'MediaWork', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'MerchantListing', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Metric', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'MolecularEntity', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Offer', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Organization', organizationKind: OrganizationKind | null, legalName: string | null, jurisdiction: string | null, status: OrganizationStatus | null, description: string | null, uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Outcome', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'OutcomeDefinition', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Package', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Patent', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Person', publicActorBasis: Array<PublicActorBasis> | null, credentialsVerbatim: string | null, description: string | null, uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Product', productKind: ProductKind, marketedName: string, jurisdiction: string | null, uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'ProductVariant', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Protocol', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'ProtocolEdition', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'ProtocolStep', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Publication', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'QualityResult', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'ReferenceIntervalVersion', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'RegistrationVersion', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'RegulatoryRecord', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Report', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'ReportItem', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Source', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'SourceLocator', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'SourceSnapshot', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Study', studyKind: StudyKind, acronym: string | null, phase: Array<TrialPhase> | null, overallStatus: RegistryStatus | null, uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'StudyArm', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'StudyPopulation', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'StudyResult', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Target', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'Taxon', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
    | { __typename: 'UseConstraint', uid: string, name: string | null, privacyClass: PrivacyClass | null, createdAt: string | null, updatedAt: string | null }
  > };

export type PackageLabelHistoryPageQueryVariables = Exact<{
  packageUid: string;
  first?: number | null | undefined;
  after?: string | null | undefined;
}>;


export type PackageLabelHistoryPageQuery = { packages: Array<{ uid: string, name: string | null, packageKind: PackageKind, labelVersionsConnection: { totalCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, edges: Array<{ cursor: string, properties: { validFrom: string | null, validTo: string | null, validFromPrecision: TimePrecision | null, validToPrecision: TimePrecision | null, recordedFrom: string, recordedTo: string | null }, node: { uid: string, labelVersionCode: string | null, panelKind: PanelKind, jurisdiction: string | null, contentDigest: string, compositionDigest: string, servingSizeVerbatim: string | null, servingsPerContainer: number | null, directionsText: string | null, warningsText: string | null, containsAllergens: Array<AllergenCode> | null, firstObservedAt: string | null, lastObservedAt: string | null } }> } }> };

export type ProductCardQueryVariables = Exact<{
  uid: string;
}>;


export type ProductCardQuery = { products: Array<{ uid: string, name: string | null, privacyClass: PrivacyClass | null, productKind: ProductKind, marketedName: string, jurisdiction: string | null, createdAt: string | null, updatedAt: string | null, brand: Array<{ uid: string, name: string | null, brandKind: BrandKind, owners: Array<{ uid: string, name: string | null }> }>, variantsConnection: { totalCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, edges: Array<{ node: { uid: string, name: string | null, dosageForm: DosageForm | null, strengthVerbatim: string | null, flavor: string | null, jurisdiction: string | null } }> } }> };

export type ProductLabelHistoryQueryVariables = Exact<{
  uid: string;
  first?: number | null | undefined;
}>;


export type ProductLabelHistoryQuery = { products: Array<{ uid: string, name: string | null, variants: Array<{ uid: string, name: string | null, packages: Array<{ uid: string, name: string | null, packageKind: PackageKind, labelVersionsConnection: { totalCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, edges: Array<{ cursor: string, properties: { validFrom: string | null, validTo: string | null, validFromPrecision: TimePrecision | null, validToPrecision: TimePrecision | null, recordedFrom: string, recordedTo: string | null }, node: { uid: string, labelVersionCode: string | null, panelKind: PanelKind, jurisdiction: string | null, contentDigest: string, servingSizeVerbatim: string | null, firstObservedAt: string | null, lastObservedAt: string | null } }> } }> }> }> };

export type ProductVariantsPageQueryVariables = Exact<{
  uid: string;
  first?: number | null | undefined;
  after?: string | null | undefined;
}>;


export type ProductVariantsPageQuery = { products: Array<{ uid: string, variantsConnection: { totalCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, edges: Array<{ cursor: string, properties: { orderIndex: number | null }, node: { uid: string, name: string | null, dosageForm: DosageForm | null, strengthVerbatim: string | null, flavor: string | null, jurisdiction: string | null, packages: Array<{ uid: string, name: string | null, packageKind: PackageKind, unitCount: number | null, unitNoun: string | null }> } }> } }> };

export type ReportViewQueryVariables = Exact<{
  uid: string;
  first?: number | null | undefined;
  after?: string | null | undefined;
}>;


export type ReportViewQuery = { reports: Array<{ uid: string, reportKind: ReportKind, skeletonKey: string | null, status: AssessmentStatus, verdict: SemanticVerdict | null, worldCorrectness: PropertyStatus | null, policyOutcome: PolicyOutcome | null, policyVersion: string, bodyDigest: string, citationCompleteness: number | null, citationCorrectness: number | null, independentSourceFamilyCount: number | null, distinctSourceFamilyCount: number | null, unsupportedHighSeverityCount: number | null, publishedAt: string | null, recordedAt: string, about: Array<
      | { __typename: 'Agent', uid: string, name: string | null }
      | { __typename: 'AlgorithmVersion', uid: string, name: string | null }
      | { __typename: 'AssayVersion', uid: string, name: string | null }
      | { __typename: 'Award', uid: string, name: string | null }
      | { __typename: 'Biomarker', uid: string, name: string | null }
      | { __typename: 'Brand', uid: string, name: string | null }
      | { __typename: 'CertificationListing', uid: string, name: string | null }
      | { __typename: 'Channel', uid: string, name: string | null }
      | { __typename: 'ChemicalSubstance', uid: string, name: string | null }
      | { __typename: 'Claim', uid: string, name: string | null }
      | { __typename: 'Condition', uid: string, name: string | null }
      | { __typename: 'Constituent', uid: string, name: string | null }
      | { __typename: 'DecisionCriterion', uid: string, name: string | null }
      | { __typename: 'Device', uid: string, name: string | null }
      | { __typename: 'DietaryPattern', uid: string, name: string | null }
      | { __typename: 'Event', uid: string, name: string | null }
      | { __typename: 'FoodCategory', uid: string, name: string | null }
      | { __typename: 'FoodItem', uid: string, name: string | null }
      | { __typename: 'Frontier', uid: string, name: string | null }
      | { __typename: 'IngredientMaterial', uid: string, name: string | null }
      | { __typename: 'Intervention', uid: string, name: string | null }
      | { __typename: 'InterventionComponent', uid: string, name: string | null }
      | { __typename: 'LabTest', uid: string, name: string | null }
      | { __typename: 'LabelVersion', uid: string, name: string | null }
      | { __typename: 'LegalStatus', uid: string, name: string | null }
      | { __typename: 'Lot', uid: string, name: string | null }
      | { __typename: 'Mechanism', uid: string, name: string | null }
      | { __typename: 'MediaWork', uid: string, name: string | null }
      | { __typename: 'MerchantListing', uid: string, name: string | null }
      | { __typename: 'Metric', uid: string, name: string | null }
      | { __typename: 'MolecularEntity', uid: string, name: string | null }
      | { __typename: 'Offer', uid: string, name: string | null }
      | { __typename: 'Organization', uid: string, name: string | null }
      | { __typename: 'Outcome', uid: string, name: string | null }
      | { __typename: 'OutcomeDefinition', uid: string, name: string | null }
      | { __typename: 'Package', uid: string, name: string | null }
      | { __typename: 'Patent', uid: string, name: string | null }
      | { __typename: 'Person', uid: string, name: string | null }
      | { __typename: 'Product', uid: string, name: string | null }
      | { __typename: 'ProductVariant', uid: string, name: string | null }
      | { __typename: 'Protocol', uid: string, name: string | null }
      | { __typename: 'ProtocolEdition', uid: string, name: string | null }
      | { __typename: 'ProtocolStep', uid: string, name: string | null }
      | { __typename: 'Publication', uid: string, name: string | null }
      | { __typename: 'QualityResult', uid: string, name: string | null }
      | { __typename: 'ReferenceIntervalVersion', uid: string, name: string | null }
      | { __typename: 'RegistrationVersion', uid: string, name: string | null }
      | { __typename: 'RegulatoryRecord', uid: string, name: string | null }
      | { __typename: 'Source', uid: string, name: string | null }
      | { __typename: 'Study', uid: string, name: string | null }
      | { __typename: 'StudyArm', uid: string, name: string | null }
      | { __typename: 'StudyPopulation', uid: string, name: string | null }
      | { __typename: 'StudyResult', uid: string, name: string | null }
      | { __typename: 'Target', uid: string, name: string | null }
      | { __typename: 'Taxon', uid: string, name: string | null }
      | { __typename: 'UseConstraint', uid: string, name: string | null }
    >, citesAssertionsConnection: { totalCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, edges: Array<{ cursor: string, node: { uid: string, predicate: string, status: AssertionStatus, polarity: Polarity | null, proposition: string | null, recordedAt: string } }> } }> };

export type ResolveIdentifierQueryVariables = Exact<{
  scheme: string;
  value: string;
}>;


export type ResolveIdentifierQuery = { identifiers: Array<{ uid: string, scheme: string, issuer: string, value: string, normalizationRule: string | null, validFrom: string | null, validTo: string | null, identifies: Array<
      | { __typename: 'Agent', uid: string, name: string | null }
      | { __typename: 'AlgorithmVersion', uid: string, name: string | null }
      | { __typename: 'AssayVersion', uid: string, name: string | null }
      | { __typename: 'Award', uid: string, name: string | null }
      | { __typename: 'Biomarker', uid: string, name: string | null }
      | { __typename: 'Brand', uid: string, name: string | null }
      | { __typename: 'CertificationListing', uid: string, name: string | null }
      | { __typename: 'Channel', uid: string, name: string | null }
      | { __typename: 'ChemicalSubstance', uid: string, name: string | null }
      | { __typename: 'Claim', uid: string, name: string | null }
      | { __typename: 'Condition', uid: string, name: string | null }
      | { __typename: 'Constituent', uid: string, name: string | null }
      | { __typename: 'DecisionCriterion', uid: string, name: string | null }
      | { __typename: 'Device', uid: string, name: string | null }
      | { __typename: 'DietaryPattern', uid: string, name: string | null }
      | { __typename: 'Event', uid: string, name: string | null }
      | { __typename: 'FoodCategory', uid: string, name: string | null }
      | { __typename: 'FoodItem', uid: string, name: string | null }
      | { __typename: 'Frontier', uid: string, name: string | null }
      | { __typename: 'IngredientMaterial', uid: string, name: string | null }
      | { __typename: 'Intervention', uid: string, name: string | null }
      | { __typename: 'InterventionComponent', uid: string, name: string | null }
      | { __typename: 'LabTest', uid: string, name: string | null }
      | { __typename: 'LabelVersion', uid: string, name: string | null }
      | { __typename: 'LegalStatus', uid: string, name: string | null }
      | { __typename: 'Lot', uid: string, name: string | null }
      | { __typename: 'Mechanism', uid: string, name: string | null }
      | { __typename: 'MediaWork', uid: string, name: string | null }
      | { __typename: 'MerchantListing', uid: string, name: string | null }
      | { __typename: 'Metric', uid: string, name: string | null }
      | { __typename: 'MolecularEntity', uid: string, name: string | null }
      | { __typename: 'Offer', uid: string, name: string | null }
      | { __typename: 'Organization', uid: string, name: string | null }
      | { __typename: 'Outcome', uid: string, name: string | null }
      | { __typename: 'OutcomeDefinition', uid: string, name: string | null }
      | { __typename: 'Package', uid: string, name: string | null }
      | { __typename: 'Patent', uid: string, name: string | null }
      | { __typename: 'Person', uid: string, name: string | null }
      | { __typename: 'Product', uid: string, name: string | null }
      | { __typename: 'ProductVariant', uid: string, name: string | null }
      | { __typename: 'Protocol', uid: string, name: string | null }
      | { __typename: 'ProtocolEdition', uid: string, name: string | null }
      | { __typename: 'ProtocolStep', uid: string, name: string | null }
      | { __typename: 'Publication', uid: string, name: string | null }
      | { __typename: 'QualityResult', uid: string, name: string | null }
      | { __typename: 'ReferenceIntervalVersion', uid: string, name: string | null }
      | { __typename: 'RegistrationVersion', uid: string, name: string | null }
      | { __typename: 'RegulatoryRecord', uid: string, name: string | null }
      | { __typename: 'Source', uid: string, name: string | null }
      | { __typename: 'Study', uid: string, name: string | null }
      | { __typename: 'StudyArm', uid: string, name: string | null }
      | { __typename: 'StudyPopulation', uid: string, name: string | null }
      | { __typename: 'StudyResult', uid: string, name: string | null }
      | { __typename: 'Target', uid: string, name: string | null }
      | { __typename: 'Taxon', uid: string, name: string | null }
      | { __typename: 'UseConstraint', uid: string, name: string | null }
    > }> };

type SubjectRef_Agent_Fragment = { __typename: 'Agent', uid: string, name: string | null };

type SubjectRef_AlgorithmVersion_Fragment = { __typename: 'AlgorithmVersion', uid: string, name: string | null };

type SubjectRef_AssayVersion_Fragment = { __typename: 'AssayVersion', uid: string, name: string | null };

type SubjectRef_Award_Fragment = { __typename: 'Award', uid: string, name: string | null };

type SubjectRef_Biomarker_Fragment = { __typename: 'Biomarker', uid: string, name: string | null };

type SubjectRef_Brand_Fragment = { __typename: 'Brand', uid: string, name: string | null };

type SubjectRef_CertificationListing_Fragment = { __typename: 'CertificationListing', uid: string, name: string | null };

type SubjectRef_Channel_Fragment = { __typename: 'Channel', uid: string, name: string | null };

type SubjectRef_ChemicalSubstance_Fragment = { __typename: 'ChemicalSubstance', uid: string, name: string | null };

type SubjectRef_Claim_Fragment = { __typename: 'Claim', uid: string, name: string | null };

type SubjectRef_Condition_Fragment = { __typename: 'Condition', uid: string, name: string | null };

type SubjectRef_Constituent_Fragment = { __typename: 'Constituent', uid: string, name: string | null };

type SubjectRef_DecisionCriterion_Fragment = { __typename: 'DecisionCriterion', uid: string, name: string | null };

type SubjectRef_Device_Fragment = { __typename: 'Device', uid: string, name: string | null };

type SubjectRef_DietaryPattern_Fragment = { __typename: 'DietaryPattern', uid: string, name: string | null };

type SubjectRef_Event_Fragment = { __typename: 'Event', uid: string, name: string | null };

type SubjectRef_FoodCategory_Fragment = { __typename: 'FoodCategory', uid: string, name: string | null };

type SubjectRef_FoodItem_Fragment = { __typename: 'FoodItem', uid: string, name: string | null };

type SubjectRef_Frontier_Fragment = { __typename: 'Frontier', uid: string, name: string | null };

type SubjectRef_IngredientMaterial_Fragment = { __typename: 'IngredientMaterial', uid: string, name: string | null };

type SubjectRef_Intervention_Fragment = { __typename: 'Intervention', uid: string, name: string | null };

type SubjectRef_InterventionComponent_Fragment = { __typename: 'InterventionComponent', uid: string, name: string | null };

type SubjectRef_LabTest_Fragment = { __typename: 'LabTest', uid: string, name: string | null };

type SubjectRef_LabelVersion_Fragment = { __typename: 'LabelVersion', uid: string, name: string | null };

type SubjectRef_LegalStatus_Fragment = { __typename: 'LegalStatus', uid: string, name: string | null };

type SubjectRef_Lot_Fragment = { __typename: 'Lot', uid: string, name: string | null };

type SubjectRef_Mechanism_Fragment = { __typename: 'Mechanism', uid: string, name: string | null };

type SubjectRef_MediaWork_Fragment = { __typename: 'MediaWork', uid: string, name: string | null };

type SubjectRef_MerchantListing_Fragment = { __typename: 'MerchantListing', uid: string, name: string | null };

type SubjectRef_Metric_Fragment = { __typename: 'Metric', uid: string, name: string | null };

type SubjectRef_MolecularEntity_Fragment = { __typename: 'MolecularEntity', uid: string, name: string | null };

type SubjectRef_Offer_Fragment = { __typename: 'Offer', uid: string, name: string | null };

type SubjectRef_Organization_Fragment = { __typename: 'Organization', uid: string, name: string | null };

type SubjectRef_Outcome_Fragment = { __typename: 'Outcome', uid: string, name: string | null };

type SubjectRef_OutcomeDefinition_Fragment = { __typename: 'OutcomeDefinition', uid: string, name: string | null };

type SubjectRef_Package_Fragment = { __typename: 'Package', uid: string, name: string | null };

type SubjectRef_Patent_Fragment = { __typename: 'Patent', uid: string, name: string | null };

type SubjectRef_Person_Fragment = { __typename: 'Person', uid: string, name: string | null };

type SubjectRef_Product_Fragment = { __typename: 'Product', uid: string, name: string | null };

type SubjectRef_ProductVariant_Fragment = { __typename: 'ProductVariant', uid: string, name: string | null };

type SubjectRef_Protocol_Fragment = { __typename: 'Protocol', uid: string, name: string | null };

type SubjectRef_ProtocolEdition_Fragment = { __typename: 'ProtocolEdition', uid: string, name: string | null };

type SubjectRef_ProtocolStep_Fragment = { __typename: 'ProtocolStep', uid: string, name: string | null };

type SubjectRef_Publication_Fragment = { __typename: 'Publication', uid: string, name: string | null };

type SubjectRef_QualityResult_Fragment = { __typename: 'QualityResult', uid: string, name: string | null };

type SubjectRef_ReferenceIntervalVersion_Fragment = { __typename: 'ReferenceIntervalVersion', uid: string, name: string | null };

type SubjectRef_RegistrationVersion_Fragment = { __typename: 'RegistrationVersion', uid: string, name: string | null };

type SubjectRef_RegulatoryRecord_Fragment = { __typename: 'RegulatoryRecord', uid: string, name: string | null };

type SubjectRef_Source_Fragment = { __typename: 'Source', uid: string, name: string | null };

type SubjectRef_Study_Fragment = { __typename: 'Study', uid: string, name: string | null };

type SubjectRef_StudyArm_Fragment = { __typename: 'StudyArm', uid: string, name: string | null };

type SubjectRef_StudyPopulation_Fragment = { __typename: 'StudyPopulation', uid: string, name: string | null };

type SubjectRef_StudyResult_Fragment = { __typename: 'StudyResult', uid: string, name: string | null };

type SubjectRef_Target_Fragment = { __typename: 'Target', uid: string, name: string | null };

type SubjectRef_Taxon_Fragment = { __typename: 'Taxon', uid: string, name: string | null };

type SubjectRef_UseConstraint_Fragment = { __typename: 'UseConstraint', uid: string, name: string | null };

export type SubjectRefFragment =
  | SubjectRef_Agent_Fragment
  | SubjectRef_AlgorithmVersion_Fragment
  | SubjectRef_AssayVersion_Fragment
  | SubjectRef_Award_Fragment
  | SubjectRef_Biomarker_Fragment
  | SubjectRef_Brand_Fragment
  | SubjectRef_CertificationListing_Fragment
  | SubjectRef_Channel_Fragment
  | SubjectRef_ChemicalSubstance_Fragment
  | SubjectRef_Claim_Fragment
  | SubjectRef_Condition_Fragment
  | SubjectRef_Constituent_Fragment
  | SubjectRef_DecisionCriterion_Fragment
  | SubjectRef_Device_Fragment
  | SubjectRef_DietaryPattern_Fragment
  | SubjectRef_Event_Fragment
  | SubjectRef_FoodCategory_Fragment
  | SubjectRef_FoodItem_Fragment
  | SubjectRef_Frontier_Fragment
  | SubjectRef_IngredientMaterial_Fragment
  | SubjectRef_Intervention_Fragment
  | SubjectRef_InterventionComponent_Fragment
  | SubjectRef_LabTest_Fragment
  | SubjectRef_LabelVersion_Fragment
  | SubjectRef_LegalStatus_Fragment
  | SubjectRef_Lot_Fragment
  | SubjectRef_Mechanism_Fragment
  | SubjectRef_MediaWork_Fragment
  | SubjectRef_MerchantListing_Fragment
  | SubjectRef_Metric_Fragment
  | SubjectRef_MolecularEntity_Fragment
  | SubjectRef_Offer_Fragment
  | SubjectRef_Organization_Fragment
  | SubjectRef_Outcome_Fragment
  | SubjectRef_OutcomeDefinition_Fragment
  | SubjectRef_Package_Fragment
  | SubjectRef_Patent_Fragment
  | SubjectRef_Person_Fragment
  | SubjectRef_Product_Fragment
  | SubjectRef_ProductVariant_Fragment
  | SubjectRef_Protocol_Fragment
  | SubjectRef_ProtocolEdition_Fragment
  | SubjectRef_ProtocolStep_Fragment
  | SubjectRef_Publication_Fragment
  | SubjectRef_QualityResult_Fragment
  | SubjectRef_ReferenceIntervalVersion_Fragment
  | SubjectRef_RegistrationVersion_Fragment
  | SubjectRef_RegulatoryRecord_Fragment
  | SubjectRef_Source_Fragment
  | SubjectRef_Study_Fragment
  | SubjectRef_StudyArm_Fragment
  | SubjectRef_StudyPopulation_Fragment
  | SubjectRef_StudyResult_Fragment
  | SubjectRef_Target_Fragment
  | SubjectRef_Taxon_Fragment
  | SubjectRef_UseConstraint_Fragment
;

export type PageInfoFieldsFragment = { hasNextPage: boolean, endCursor: string | null };

export type EvidenceLocatorFragment = { uid: string, selectorKind: SelectorKind, exact: string | null, prefix: string | null, suffix: string | null, page: number | null, startOffset: number | null, endOffset: number | null, mediaStartSeconds: number | null, mediaEndSeconds: number | null, snapshot: Array<{ uid: string, retrievedAt: string, publishedAt: string | null, contentHash: string, mimeType: string | null, language: string | null, captureCompleteness: string | null, source: Array<{ uid: string, name: string | null, canonicalUri: string, sourceKind: SourceKind, genre: string | null }> }> };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const SubjectRefFragmentDoc = new TypedDocumentString(`
    fragment SubjectRef on Subjectable {
  __typename
  uid
  name
}
    `, {"fragmentName":"SubjectRef"}) as unknown as TypedDocumentString<SubjectRefFragment, unknown>;
export const PageInfoFieldsFragmentDoc = new TypedDocumentString(`
    fragment PageInfoFields on PageInfo {
  hasNextPage
  endCursor
}
    `, {"fragmentName":"PageInfoFields"}) as unknown as TypedDocumentString<PageInfoFieldsFragment, unknown>;
export const EvidenceLocatorFragmentDoc = new TypedDocumentString(`
    fragment EvidenceLocator on SourceLocator {
  uid
  selectorKind
  exact
  prefix
  suffix
  page
  startOffset
  endOffset
  mediaStartSeconds
  mediaEndSeconds
  snapshot(limit: 1) {
    uid
    retrievedAt
    publishedAt
    contentHash
    mimeType
    language
    captureCompleteness
    source(limit: 1) {
      uid
      name
      canonicalUri
      sourceKind
      genre
    }
  }
}
    `, {"fragmentName":"EvidenceLocator"}) as unknown as TypedDocumentString<EvidenceLocatorFragment, unknown>;
export const AssertionEvidenceTraceDocument = {"__meta__":{"hash":"sha256:8ff08a5bb3edeee4e25b4d26771955801ac2d11340af385b231e4aabe8a83684"}} as unknown as TypedDocumentString<AssertionEvidenceTraceQuery, AssertionEvidenceTraceQueryVariables>;
export const ClaimViewDocument = {"__meta__":{"hash":"sha256:df53b7d1793b7c742b102289fe1c43d89d097f1276361b823d519c0f40f0b9cb"}} as unknown as TypedDocumentString<ClaimViewQuery, ClaimViewQueryVariables>;
export const EntityCardDocument = {"__meta__":{"hash":"sha256:adb887e8f0469b5e3ee9676ac6a6438082112074193d750a7902cf2004efc9b7"}} as unknown as TypedDocumentString<EntityCardQuery, EntityCardQueryVariables>;
export const PackageLabelHistoryPageDocument = {"__meta__":{"hash":"sha256:b6deb813211190a646060472daedc32116fce03d1d121f47168224e010f6ef23"}} as unknown as TypedDocumentString<PackageLabelHistoryPageQuery, PackageLabelHistoryPageQueryVariables>;
export const ProductCardDocument = {"__meta__":{"hash":"sha256:aafdccfb0f9896556f93b3d28c2711d4a2373b87b5bb54574c68c9ef3ca978aa"}} as unknown as TypedDocumentString<ProductCardQuery, ProductCardQueryVariables>;
export const ProductLabelHistoryDocument = {"__meta__":{"hash":"sha256:bcbd32f1decd95e21c908d2b3781bbee105a8ded7dd6066849acf881ab70da0c"}} as unknown as TypedDocumentString<ProductLabelHistoryQuery, ProductLabelHistoryQueryVariables>;
export const ProductVariantsPageDocument = {"__meta__":{"hash":"sha256:cab147183a195200d1360c1e437e3718342e485d0f936be48c8f64fa3f765b73"}} as unknown as TypedDocumentString<ProductVariantsPageQuery, ProductVariantsPageQueryVariables>;
export const ReportViewDocument = {"__meta__":{"hash":"sha256:909f7d82a486363d29a1ac74951aa4888fb978b49b0d69dd755e4ec35c84b7f7"}} as unknown as TypedDocumentString<ReportViewQuery, ReportViewQueryVariables>;
export const ResolveIdentifierDocument = {"__meta__":{"hash":"sha256:1a737a18137d7ba8f5a3199e0a6d762a81623a984e04a4b9b3ea8e7c19eee05d"}} as unknown as TypedDocumentString<ResolveIdentifierQuery, ResolveIdentifierQueryVariables>;