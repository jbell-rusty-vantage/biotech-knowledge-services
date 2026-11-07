---
id: "migration:v1-relationship-types"
kind: "migration"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:migration/v1-map.yaml#relationshipTypes"]
aliases: ["v1-relationship-types","v1 relationship types"]
capabilities: ["get"]
cardDigest: "sha256:f9709c0a329cc157958947594b4bb648a08a40838be7302e5ac4a0bc75b3b5e8"
---
# v1 relationship types

Navigation only: how a v1-proposal name maps to release biotech-schema-v2.2.0. This is never an execution script; data migration is owned by S8. A removed concept points here, never at a silently substituted type. Legend: [README](README.md).

`predicate-only`: no typed edge, an Assertion with the named predicate. `carried-by-pattern`: the meaning is carried by the listed kernel pattern edges.

| v1 | disposition | v2 | ruling | note |
| --- | --- | --- | --- | --- |
| `ABOUT` | merged | [ASSESSES](../relationships/ASSESSES.md) |  | K: ASSESSES: Replaces EVALUATES, ABOUT, ASSESSES_SOURCE_AUTHORITY, PROPOSES_MATCH, COMPARES_IDENTITIES |
| `ABOUT_CONDITION` | unmapped | — |  | see unmappedEdges (DECISIONS.md 'Seven unmapped legacy relationships') |
| `ABOUT_PRODUCT` | retired | — |  | D9: W22 media graph cut; regions are kernel BOUNDING_BOX locators, depiction is predicate-only, label regions are D6 + kernel locators |
| `ABOUT_PROTOCOL` | retired | — |  | D5: Observation and ProtocolResult are kernel Assertions (METRIC) about the protocol; comparisons are computed (directive 3.5) |
| `ACCEPTS_SPECIMEN_TYPE` | retired | — |  | D4: Specimen is an enum + ontology ids (AssayVersion.specimenKinds/specimenOntologyIds, LabTest.collectionModes) |
| `ACCOMPANIES_TALK` | retired | — | R-65, R-81 | D9: events are D13; talk recordings are MediaWorks; RECORDING_OF is predicate-only (value-3 question); a recurring meeting is a Channel EVENT_SERIES, the object of D13's PRESENTED_AT_CONFERENCE predi… |
| `ACTED_ON_BEHALF_OF` | retired | — |  | K: deferred to a D7 seam if a question asks which organization's agent asserted ‖ D7: kernel deferred it to D7 (K 11-open-questions item 9); no D7 question asks which organization a software Agent ac… |
| `ACTS_IN` | retired | — |  | D2: same as APPLIES_TO_SPECIES for compartments (Q-D2-13 groups contexts) |
| `ADVISES_ORGANIZATION` | merged | [HOLDS_ROLE](../relationships/HOLDS_ROLE.md) |  | D7: HOLDS_ROLE: Replaces pinned BOARD_MEMBER_OF, EMPLOYED_BY, ADVISES_ORGANIZATION, FOUNDED_ORGANIZATION and the role half of AFFILIATED_WITH |
| `AFFECTS_MECHANISM` | kept | [AFFECTS_MECHANISM](../relationships/AFFECTS_MECHANISM.md) | R-47 | D2 derived projections over mechanism assertions (D2 declares, seam) |
| `AFFECTS_ORGAN` | predicate-only | predicate [AFFECTS_ORGAN](../predicates/AFFECTS_ORGAN.md) |  | D2: never as an edge: compartments are enum + ontology id (pinned AFFECTS_ORGAN) |
| `AFFILIATED_WITH` | merged | [HOLDS_ROLE](../relationships/HOLDS_ROLE.md) |  | D7: HOLDS_ROLE: Replaces pinned BOARD_MEMBER_OF, EMPLOYED_BY, ADVISES_ORGANIZATION, FOUNDED_ORGANIZATION and the role half of AFFILIATED_WITH |
| `AFFILIATE_FOR_OFFER` | predicate-only | predicate [LINKS_TO_OFFER](../predicates/LINKS_TO_OFFER.md) | R-67 | D6: AffiliateLink → D9 (tracked link inside a page/episode); D9 keeps it predicate-only LINKS_TO_OFFER (MediaWork → D6 Offer \| MerchantListing) |
| `AGAINST_ORIGINAL` | carried-by-pattern | [ASSESSES](../relationships/ASSESSES.md), [DERIVED_FROM](../relationships/DERIVED_FROM.md), [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) | R-20 | D9: kernel Assessment (RETELLING_FIDELITY, CONFLICT_RELEVANCE): the Assessment ASSESSES the Claim (and the speaker) and is DERIVED_FROM the judged occurrence, facets occurrence= / retelling= / origin… |
| `ANALYZES_DATASET` | merged | [REPORTS_ON](../relationships/REPORTS_ON.md) |  | D3: REPORTS_ON: replaces pinned ANALYZES_DATASET / PRODUCED_DATASET: a reused cohort is a Study that secondary analyses report on |
| `ANNOTATES_SUBJECT` | retired | — |  | D9: W22 media graph cut; regions are kernel BOUNDING_BOX locators, depiction is predicate-only, label regions are D6 + kernel locators |
| `ANNOUNCED_IN` | carried-by-pattern | [REVISES](../relationships/REVISES.md) | R-44 | K: an identified notice is a D3 Publication that REVISES the work (R-44); otherwise the notice is its own Source and a HAS_REVISION_STATUS assertion cites its locator ‖ K: the notice is its own Sourc… |
| `APPEARS_IN` | kept | [APPEARS_IN](../relationships/APPEARS_IN.md) | R-79, R-80 | media roles; D9 declares MediaWork.sponsors (CONTENT_SPONSORED_BY) and MediaWork.appearances (APPEARS_IN) on its containers (seam); OPERATED_BY is a D9 predicate with subject Channel (R-79); AUTHORED… |
| `APPLICATION_GRANTED_AS` | retired | — |  | D8: family id and publication type are Patent properties; claim text stays in the snapshot; claim numbers on LegalStatus |
| `APPLIES_CRITERION` | retired | — |  | D8: specifications are not nodes; the criterion printed beside a result is inline on QualityResult, a regulator's specification is text on its record ‖ D10: Assessments that apply a criteria set (e.g… |
| `APPLIES_TO_SPECIES` | retired | — |  | D2: derived from contexts at query time (Q-D2-13); projection field `organisms` not needed by any filter |
| `ARC_ABOUT` | carried-by-pattern | [ASSESSES](../relationships/ASSESSES.md), [INVOLVES](../relationships/INVOLVES.md), [LEADS_TO](../relationships/LEADS_TO.md), [RESPONDS_TO](../relationships/RESPONDS_TO.md) |  | D9: W18 event layer belongs to D13 (Event, LEADS_TO, RESPONDS_TO, INVOLVES) ‖ D13: NarrativeArc → kernel Report (D10 composition); ASSESSES is kernel |
| `ARC_INCLUDES_EVENT` | carried-by-pattern | [DERIVED_FROM](../relationships/DERIVED_FROM.md), [INVOLVES](../relationships/INVOLVES.md), [LEADS_TO](../relationships/LEADS_TO.md), [RESPONDS_TO](../relationships/RESPONDS_TO.md) |  | D9: W18 event layer belongs to D13 (Event, LEADS_TO, RESPONDS_TO, INVOLVES) ‖ D13: a published brief cites its events through kernel DERIVED_FROM → Assertion (the events' time and link assertions) |
| `ASSAY_FOR_METRIC` | carried-by-pattern | [INTERVAL_FOR](../relationships/INTERVAL_FOR.md) |  | D4: derivable LabTest → Metric + LabTest → AssayVersion; the dual-unit case is carried by INTERVAL_FOR.metrics and AssayVersion.reportedUnitCode |
| `ASSAY_OPERATED_BY` | merged | [PERFORMED_BY_LAB](../relationships/PERFORMED_BY_LAB.md) |  | D4: renamed PERFORMED_BY_LAB |
| `ASSERTED_BY` | kept | [ASSERTED_BY](../relationships/ASSERTED_BY.md) | R-23 | kernel (HAS_EVIDENCE -> SourceLocator, MENTIONS derived, Assertion.supersedesUid same asserter only, R-23) |
| `ASSESSED_BY` | merged | [WAS_ASSOCIATED_WITH](../relationships/WAS_ASSOCIATED_WITH.md) | R-20 | K: WAS_ASSOCIATED_WITH: replaces ASSESSED_BY |
| `ASSESSED_ON_SNAPSHOT` | carried-by-pattern | [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) |  | K: SOURCE_AUTHORITY Assessment HAS_EVIDENCE the snapshot's locator (WHOLE_SNAPSHOT) |
| `ASSESSED_ON_VARIANT` | retired | — |  | D9: rights are a verbatim property on MediaWork; media suitability has no D9 question |
| `ASSESSES_APPLICABILITY_TO` | carried-by-pattern | [ASSESSES](../relationships/ASSESSES.md) |  | D3: kernel Assessment ASSESSES (use side: D6 ProductVariant, D5 Intervention/Protocol) |
| `ASSESSES_CLAIM` | carried-by-pattern | [ASSESSES](../relationships/ASSESSES.md) |  | D3: kernel Assessment (EVIDENCE_SYNTHESIS) ASSESSES Claim |
| `ASSESSES_CLAIM_EVIDENCE` | unmapped | — |  | see unmappedEdges (DECISIONS.md 'Seven unmapped legacy relationships') |
| `ASSESSES_EVENT` | merged | [ASSESSES](../relationships/ASSESSES.md) |  | D13: kernel ASSESSES (Assessment.about → Subjectable) |
| `ASSESSES_INTEREST` | carried-by-pattern | [ASSESSES](../relationships/ASSESSES.md), [DERIVED_FROM](../relationships/DERIVED_FROM.md), [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) | R-20 | D9: kernel Assessment (RETELLING_FIDELITY, CONFLICT_RELEVANCE): the Assessment ASSESSES the Claim (and the speaker) and is DERIVED_FROM the judged occurrence, facets occurrence= / retelling= / origin… |
| `ASSESSES_MEDIA` | retired | — |  | D9: rights are a verbatim property on MediaWork; media suitability has no D9 question |
| `ASSESSES_RETELLING` | carried-by-pattern | [ASSESSES](../relationships/ASSESSES.md), [DERIVED_FROM](../relationships/DERIVED_FROM.md), [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) | R-20 | D9: kernel Assessment (RETELLING_FIDELITY, CONFLICT_RELEVANCE): the Assessment ASSESSES the Claim (and the speaker) and is DERIVED_FROM the judged occurrence, facets occurrence= / retelling= / origin… |
| `ASSESSES_SOURCE_AUTHORITY` | merged | [ASSESSES](../relationships/ASSESSES.md) |  | K: ASSESSES: Replaces EVALUATES, ABOUT, ASSESSES_SOURCE_AUTHORITY, PROPOSES_MATCH, COMPARES_IDENTITIES |
| `ASSESSES_STRENGTH_OF` | carried-by-pattern | [ASSESSES](../relationships/ASSESSES.md) |  | D3: kernel Assessment (kind QUALITY, subkind D3.evidence-strength) ASSESSES |
| `ASSESSES_SUITABILITY_FOR` | retired | — |  | D9: rights are a verbatim property on MediaWork; media suitability has no D9 question |
| `ASSIGNED_PATENT` | renamed | [ASSIGNED_TO](../relationships/ASSIGNED_TO.md) |  | D8: ASSIGNED_TO: Replaces ASSIGNED_PATENT |
| `ASSIGNS_INTERVENTION` | merged | [HAS_COMPONENT](../relationships/HAS_COMPONENT.md) |  | D3: HAS_COMPONENT: Replaces pinned ASSIGNS_INTERVENTION + HAS_INTERVENTION_COMPONENT (StudyIntervention absorbed) |
| `ASSOCIATED_WITH_CONDITION` | predicate-only | predicate [MECHANISM_OF](../predicates/MECHANISM_OF.md) |  | D2: predicate MECHANISM_OF / INCREASES_RISK_OF (Mechanism → Condition); computed associations are D10 Association records |
| `ASSOCIATED_WITH_OUTCOME` | carried-by-pattern | [ASSOCIATES](../relationships/ASSOCIATES.md), [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) |  | D1: D12/D5/D10 or the kernel HAS_EVIDENCE pattern; never D1 ‖ D2: Lifestyle → Outcome: D5 Intervention reaches outcomes through D5 target predicates and D3 results |
| `ATTENDS` | carried-by-pattern | [HOLDS_STAKE](../relationships/HOLDS_STAKE.md), [INVOLVES](../relationships/INVOLVES.md) | R-81, R-65 | D7: event participation, including round participation as INVESTOR / LEAD_INVESTOR and a presentation as PRESENTER (R-81); D13 INVOLVES (Event → Organization \| Person, role enum) (seam). A persisting… |
| `ATTRIBUTES_TO` | merged | [APPEARS_IN](../relationships/APPEARS_IN.md) |  | D9: APPEARS_IN: Replaces pinned APPEARS_IN, SPEAKS_AT (talks are works), ATTRIBUTES_TO |
| `AUTHORED_BY` | predicate-only | predicate [AUTHORED_BY](../predicates/AUTHORED_BY.md) | R-80, R-79 | D3: Q-D3-03 (integrity contamination through shared authors) becomes value 1, or a D7 conflict-of-interest question traverses authorship from the person side at volume; today both walk Assertion → HA… |
| `AUTHORIZED_BY` | retired | — | R-33 | K: policyVersion string on Report and Activity (R-33); D10 promotes PolicyVersion if a question traverses it ‖ D10: Use authorization is Activity.policyVersion / Report.policyVersion (kernel strings,… |
| `AVAILABLE_IN` | carried-by-pattern | [COVERS](../relationships/COVERS.md) | R-67, R-94 | D6: store-level availability; no question ‖ D7: not D7 questions (D9, D8, D6 own them); D8 COVERS has no Organization member (R-67, R-94) |
| `BASED_ON` | retired | — |  | D5: no question traverses protocol composition; sections are sectionLabel; derivation is an Assertion if ever needed |
| `BASED_ON_EVIDENCE` | carried-by-pattern | [ASSESSES](../relationships/ASSESSES.md), [DERIVED_FROM](../relationships/DERIVED_FROM.md) | R-11 | D3: kernel ASSESSES / DERIVED_FROM ‖ D10: Kernel Assessment.inputAssertions / inputAssessments (DERIVED_FROM, R-11). D10 adds nothing. |
| `BOARD_MEMBER_OF` | merged | [HOLDS_ROLE](../relationships/HOLDS_ROLE.md) |  | D7: HOLDS_ROLE: Replaces pinned BOARD_MEMBER_OF, EMPLOYED_BY, ADVISES_ORGANIZATION, FOUNDED_ORGANIZATION and the role half of AFFILIATED_WITH |
| `CALIBRATION_TRACEABLE_TO` | retired | — |  | D4: ReferenceSystem is the CalibrationTraceability enum; certificate details are CERTIFIED_TRACEABLE_TO assertions |
| `CAPABILITY_FOR_MATERIAL` | retired | — |  | D1: D8 (quality/manufacturing) declares into IngredientMaterial if a D8 question traverses them ‖ D8: CQ-MF-04 is value 3; HAS_CAPABILITY_STAGE predicate with valid time |
| `CAPABILITY_FOR_PROCESS` | retired | — |  | D8: CQ-MF-04 is value 3; HAS_CAPABILITY_STAGE predicate with valid time |
| `CAUSED_BY` | renamed | [LEADS_TO](../relationships/LEADS_TO.md) |  | D13: LEADS_TO: Replaces pinned CAUSED_BY (effect → cause) with the forward direction investors read ("readout leads to filing leads to approval") |
| `CERTIFIED_UNDER` | merged | [COVERS](../relationships/COVERS.md) | R-74 | D8: COVERS: Replaces COVERS (W12), HAS_CERTIFICATION_SCOPE, CERTIFIED_UNDER, PROGRAM_HAS_LISTING, CERTIFIES_RESULTS_FOR |
| `CERTIFIES_RESULTS_FOR` | merged | [COVERS](../relationships/COVERS.md) |  | D8: COVERS: Replaces COVERS (W12), HAS_CERTIFICATION_SCOPE, CERTIFIED_UNDER, PROGRAM_HAS_LISTING, CERTIFIES_RESULTS_FOR |
| `CITES_ASSERTION` | merged | [DERIVED_FROM](../relationships/DERIVED_FROM.md) | R-11 | R-11: DERIVED_FROM replaces CITES_ASSERTION |
| `CITES_ASSESSMENT` | merged | [DERIVED_FROM](../relationships/DERIVED_FROM.md) | R-11 | R-11: DERIVED_FROM replaces CITES_ASSESSMENT |
| `CLAIMS_OUTCOME` | retired | — |  | D5: Observation and ProtocolResult are kernel Assertions (METRIC) about the protocol; comparisons are computed (directive 3.5) |
| `CLAIM_EVIDENCE_BASED_ON` | unmapped | — |  | see unmappedEdges (DECISIONS.md 'Seven unmapped legacy relationships') |
| `CLASSIFIED_AS` | retired | — |  | D6: Product.productKind enum |
| `CLASSIFIES_BIOMARKER` | retired | — |  | D3: general context-of-use classification belongs to D4 (Biomarker) |
| `CLASSIFIES_OUTCOME` | carried-by-pattern | [ASSESSES](../relationships/ASSESSES.md) |  | D3: EndpointClassification → kernel Assessment ASSESSES OutcomeDefinition (kind requested in 11-open-questions) |
| `COA_ISSUED_BY` | merged | [ISSUED_BY](../relationships/ISSUED_BY.md) |  | D8: ISSUED_BY: Replaces the pinned RegulatoryAgency and TestingLaboratory node types and COA_ISSUED_BY / PERFORMED_BY_LAB / CONDUCTED_BY |
| `COMPARED_TO` | retired | — |  | D5: Observation and ProtocolResult are kernel Assertions (METRIC) about the protocol; comparisons are computed (directive 3.5) |
| `COMPARED_WITH_CONTEXT` | retired | — |  | D3: no question traverses classification-to-classification |
| `COMPARES` | carried-by-pattern | [ASSESSES](../relationships/ASSESSES.md) |  | D4: ComparabilityAssessment is a kernel Assessment; its targets are kernel ASSESSES → Subjectable |
| `COMPARES_IDENTITIES` | merged | [ASSESSES](../relationships/ASSESSES.md) |  | K: ASSESSES: Replaces EVALUATES, ABOUT, ASSESSES_SOURCE_AUTHORITY, PROPOSES_MATCH, COMPARES_IDENTITIES |
| `COMPATIBLE_WITH_ASSAY_VERSION` | carried-by-pattern | [INTERVAL_FOR](../relationships/INTERVAL_FOR.md) |  | D4: ReferenceIntervalVersion → AssayVersion is INTERVAL_FOR; compatibility judgments are Assessments |
| `COMPETES_WITH` | retired | — |  | K: competing hypotheses are sibling RESOLUTION Assessments citing the same span |
| `COMPONENT_PRODUCT` | predicate-only | predicate [CONTAINS_PACKAGE](../predicates/CONTAINS_PACKAGE.md) |  | D6: kit components are predicate-only CONTAINS_PACKAGE (Q-D6-14 value 3) |
| `COMPUTED_BY_ALGORITHM_VERSION` | retired | — |  | D5: measurement provenance of public observations belongs to D4 and the kernel assertion |
| `CONDUCTED_BY` | merged | [ISSUED_BY](../relationships/ISSUED_BY.md) |  | D8: ISSUED_BY: Replaces the pinned RegulatoryAgency and TestingLaboratory node types and COA_ISSUED_BY / PERFORMED_BY_LAB / CONDUCTED_BY |
| `CONSIDERS` | carried-by-pattern | [DERIVED_FROM](../relationships/DERIVED_FROM.md) | R-11 | D3: W10 → kernel Assessment DERIVED_FROM (inputAssertions) ‖ D10: Kernel Assessment.inputAssertions / inputAssessments (DERIVED_FROM, R-11). D10 adds nothing. |
| `CONSIDERS_ASSESSMENT` | merged | [DERIVED_FROM](../relationships/DERIVED_FROM.md) | R-11 | R-11: DERIVED_FROM replaces CONSIDERS_ASSESSMENT |
| `CONSTRAINS_USE_OF` | carried-by-pattern | [HAS_SUBJECT](../relationships/HAS_SUBJECT.md), [RESOLVES_TO_CONSTRAINT](../relationships/RESOLVES_TO_CONSTRAINT.md) |  | D5: UseConstraint -> subject means (union 5): duplicates the resolving Assertions' HAS_SUBJECT; every question reaches the subject through RESOLVES_TO_CONSTRAINT + HAS_SUBJECT (09 D-07) |
| `CONSTRAINT_SCOPE` | carried-by-pattern | [HAS_OBJECT](../relationships/HAS_OBJECT.md) |  | D5: UseConstraint -> condition / population / co-exposure (union 6+): duplicates HAS_OBJECT and the population qualifier; population codes are the scopePopulations property |
| `CONTAINS` | retired | — |  | D6: derived shortcut product → compound; CQ-AX-25 is answered by the two-hop path label → material → (D1) substance; no stored shortcut |
| `CONTAINS_COMPOUND_FORM` | retired | — |  | D6: same as CONTAINS |
| `CONTRACTS_MANUFACTURING` | predicate-only | predicate [CONTRACT_MANUFACTURES_FOR](../predicates/CONTRACT_MANUFACTURES_FOR.md) | R-68 | D6: predicate-only CONTRACT_MANUFACTURES_FOR, registered by D7 (R-68) |
| `CONTRACT_MANUFACTURES_FOR` | predicate-only | predicate [CONTRACT_MANUFACTURES_FOR](../predicates/CONTRACT_MANUFACTURES_FOR.md) | R-68 | D7: as MANUFACTURES |
| `CONTRADICTED_BY` | merged | [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) |  | K: HAS_EVIDENCE: Replaces SUPPORTED_BY, CONTRADICTED_BY, SUPPORTED_BY_CHUNK and locator → Mention MENTIONS (the surface-form span is now cited by the RESOLUTION Assessment directly) |
| `CONTRIBUTES_TO` | carried-by-pattern | [PARTICIPATES_IN](../relationships/PARTICIPATES_IN.md) |  | D2: mergedInto PARTICIPATES_IN |
| `CORRECTS` | merged | [REVISES](../relationships/REVISES.md) | R-20, R-52 | D3: REVISES: Replaces pinned CORRECTS and RETRACTS (+ PublicationRevisionProperties) |
| `COVERS` | kept | [COVERS](../relationships/COVERS.md) | R-67, R-94 | not D7 questions (D9, D8, D6 own them); D8 COVERS has no Organization member (R-67, R-94) |
| `CRITERION_OF_SPECIFICATION` | retired | — |  | D8: specifications are not nodes; the criterion printed beside a result is inline on QualityResult, a regulator's specification is text on its record |
| `DECLARATION_IDENTIFIES_MATERIAL` | merged | [DECLARES_COMPONENT](../relationships/DECLARES_COMPONENT.md) |  | D6: merged into DECLARES_COMPONENT |
| `DECLARES_CRITERION` | renamed | [USES_CRITERION](../relationships/USES_CRITERION.md) | R-33 | D10: USES_CRITERION: Replaces pinned DECLARES_CRITERION (PolicyVersion → DecisionCriterion): PolicyVersion is not a node (R-33) |
| `DECLARES_FORMULATION` | merged | [HAS_LABEL_VERSION](../relationships/HAS_LABEL_VERSION.md) |  | D6: HAS_LABEL_VERSION: Replaces the pinned LABEL_FOR, DECLARES_FORMULATION and HAS_FORMULATION_VERSION: composition time is label time |
| `DEFINED_IN` | renamed | [STATED_IN](../relationships/STATED_IN.md) |  | D3: STATED_IN: Replaces pinned DEFINED_IN, the DECLARES_OUTCOME_PRIORITY predicate and the SUPPORTED_BY fields on StudyResult / AdverseEventResult |
| `DEFINES_OUTCOME` | renamed | [HAS_OUTCOME](../relationships/HAS_OUTCOME.md) |  | D3: renamed HAS_OUTCOME |
| `DELIMITED_BY` | retired | — |  | D9: EpisodeSegment cut; the segment is a qualifier on the occurrence (kernel request K-5 segmentKind) and a media-time locator |
| `DELIVERS_LABTEST` | merged | [DELIVERS](../relationships/DELIVERS.md) |  | D4: merged into DELIVERS (Product → LabTest) |
| `DEPENDS_ON` | unmapped | — |  | see unmappedEdges (DECISIONS.md 'Seven unmapped legacy relationships') |
| `DEPICTS` | predicate-only | predicate [DEPICTS](../predicates/DEPICTS.md) |  | D9: Q-D9-17 rises above value 3 |
| `DERIVED_FROM_ALGORITHM_VERSION` | kept | [DERIVED_FROM_ALGORITHM_VERSION](../relationships/DERIVED_FROM_ALGORITHM_VERSION.md) |  |  |
| `DERIVED_FROM_ASSERTION` | merged | [DERIVED_FROM](../relationships/DERIVED_FROM.md) | R-11 | R-11: DERIVED_FROM replaces DERIVED_FROM_ASSERTION |
| `DERIVED_FROM_PROTOCOL` | retired | — |  | D5: no question traverses protocol composition; sections are sectionLabel; derivation is an Assertion if ever needed |
| `DERIVED_FROM_SOURCE` | retired | — |  | D9: rights are a verbatim property on MediaWork; media suitability has no D9 question |
| `DERIVED_FROM_TAXON` | kept | [DERIVED_FROM_TAXON](../relationships/DERIVED_FROM_TAXON.md) | R-53 | D12 predicate FOOD_FROM_TAXON (R-53) |
| `DEVELOPS_PLATFORM` | retired | — |  | D4: platform is an enum; developer of a technology is D7/D13 (predicate) ‖ D7: device/platform roles; D4 (predicate-only unless D4 promotes) |
| `DEVELOPS_TREATMENT` | predicate-only | predicate [OFFERS_INTERVENTION](../predicates/OFFERS_INTERVENTION.md) | R-52 | D5: D6/D7 own offerings and development; predicate OFFERS_INTERVENTION, registered by D6 (R-52) |
| `DISCOVERED_SOURCE` | carried-by-pattern | [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) | R-41 | K: operational discovery log → D11 action-space registry ‖ D11: a successful discovery is a SourceSnapshot generated by the same Activity (WAS_GENERATED_BY); the attempt record is written only for no… |
| `DISTRIBUTES_PRODUCT` | predicate-only | predicate [DISTRIBUTES](../predicates/DISTRIBUTES.md) | R-68, R-67 | D6: label 'Distributed by' is NAMES_RESPONSIBLE_PARTY + responsiblePartyRole; filing channel statements are SOLD_THROUGH_CHANNEL predicates; other distributor statements are the D7 predicate DISTRIBU… |
| `DISTRIBUTES_RENDITION` | merged | [PUBLISHES](../relationships/PUBLISHES.md) |  | D9: PUBLISHES: Replaces pinned HAS_EPISODE, HAS_SERIES, DISTRIBUTES_RENDITION, ON_PLATFORM (platform is a Channel property) |
| `DOCUMENTED_BY_RECORD` | kept | [DOCUMENTED_BY_RECORD](../relationships/DOCUMENTED_BY_RECORD.md) |  | declared by D13 on Event (Event.regulatoryRecords, typed, AssertedRecordedProperties, since D13's adversarial-review pass); D8 declares no inverse because no D8 question traverses from an event |
| `EMBODIES_MODEL` | merged | [DELIVERS](../relationships/DELIVERS.md) |  | D4: merged into DELIVERS (Product → Device) |
| `EMPLOYED_BY` | merged | [HOLDS_ROLE](../relationships/HOLDS_ROLE.md) |  | D7: HOLDS_ROLE: Replaces pinned BOARD_MEMBER_OF, EMPLOYED_BY, ADVISES_ORGANIZATION, FOUNDED_ORGANIZATION and the role half of AFFILIATED_WITH |
| `EMPLOYS` | merged | [STEP_USES](../relationships/STEP_USES.md) |  | D5: merged into STEP_USES (union 6); instruments are D6 Products, measured quantities D4 Metrics |
| `ENCODES` | carried-by-pattern | [HAS_ANALYTE](../relationships/HAS_ANALYTE.md) |  | D2: MolecularEntity → Biomarker becomes D4 HAS_ANALYTE (Biomarker → MolecularEntity), owned by D4 ‖ D4: gene → protein biomarker is D2 territory; UNIPROT/HGNC identifiers on Biomarker through the ker… |
| `ENDORSES_PRODUCT` | predicate-only | predicate [RECOMMENDS_USE](../predicates/RECOMMENDS_USE.md) | R-83 | D9: never as a stored edge; directive 3.9 allows only a derived projection (see deferred RECOMMENDS) |
| `EVALUATED_AGAINST` | retired | — |  | D8: specifications are not nodes; the criterion printed beside a result is inline on QualityResult, a regulator's specification is text on its record |
| `EVALUATES` | merged | [ASSESSES](../relationships/ASSESSES.md) |  | K: ASSESSES: Replaces EVALUATES, ABOUT, ASSESSES_SOURCE_AUTHORITY, PROPOSES_MATCH, COMPARES_IDENTITIES |
| `EVENT_ABOUT` | predicate-only | predicate [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) |  | D13: Q-D13-05 / Q-D13-16 latency over the 2-hop Assertion path is measured above budget on the assembled graph; then a typed ABOUT edge with ≤ 6 members (Study, Compound, Product, Intervention, Condi… |
| `EVIDENCES` | retired | — |  | D9: W22 media graph cut; regions are kernel BOUNDING_BOX locators, depiction is predicate-only, label regions are D6 + kernel locators |
| `EXHIBITS_AT` | carried-by-pattern | [HOLDS_STAKE](../relationships/HOLDS_STAKE.md), [INVOLVES](../relationships/INVOLVES.md) | R-81, R-65 | D7: event participation, including round participation as INVESTOR / LEAD_INVESTOR and a presentation as PRESENTER (R-81); D13 INVOLVES (Event → Organization \| Person, role enum) (seam). A persisting… |
| `EXPLAINS` | retired | — |  | D9: W22 media graph cut; regions are kernel BOUNDING_BOX locators, depiction is predicate-only, label regions are D6 + kernel locators |
| `EXPOSED_TO` | kept | [EXPOSED_TO](../relationships/EXPOSED_TO.md) |  |  |
| `EXPRESSED_IN` | retired | — |  | D2: D4 Biomarker → Organ; no question traverses expression site ‖ D4: D2 context property (compartmentOntologyId); no D4 question traverses expression |
| `EXPRESSED_IN_CONTEXT` | retired | — |  | D2: same as EXPRESSED_IN ‖ D4: as EXPRESSED_IN |
| `FAMILY_HAS_APPLICATION` | retired | — |  | D8: family id and publication type are Patent properties; claim text stays in the snapshot; claim numbers on LegalStatus |
| `FIRMWARE_VERSION_OF` | merged | [RUNS_ON_DEVICE](../relationships/RUNS_ON_DEVICE.md) |  | D4: RUNS_ON_DEVICE: Replaces RUNS_FIRMWARE_VERSION, FIRMWARE_VERSION_OF and the device side of pinned RUNS_ON_DEVICE |
| `FOLLOWED_BY` | carried-by-pattern | [INVOLVES](../relationships/INVOLVES.md), [LEADS_TO](../relationships/LEADS_TO.md), [RESPONDS_TO](../relationships/RESPONDS_TO.md) |  | D9: W18 event layer belongs to D13 (Event, LEADS_TO, RESPONDS_TO, INVOLVES) ‖ D13: computed (FOLLOWS above) |
| `FOLLOWS_INTERVENTION_DEFINITION` | merged | [ADMINISTERS](../relationships/ADMINISTERS.md) |  | D3: ADMINISTERS: Replaces pinned USES_INTERVENTION_MATERIAL, USES_INTERVENTION_DEVICE and FOLLOWS_INTERVENTION_DEFINITION |
| `FOLLOWS_PATHWAY` | retired | — |  | D6: D8 ‖ D8: pathway is an enum, legal basis a citation string; no question traverses a pathway node |
| `FORM_OF_SUBSTANCE` | merged | [REALIZES_SUBSTANCE](../relationships/REALIZES_SUBSTANCE.md) |  | D1: REALIZES_SUBSTANCE: absorbs FORM_OF_SUBSTANCE / HAS_CHEMICAL_FORM (ChemicalForm cut) |
| `FOR_ASSAY_VERSION` | merged | [INTERVAL_FOR](../relationships/INTERVAL_FOR.md) |  | D4: merged into INTERVAL_FOR |
| `FOR_COVERAGE_REQUIREMENT` | retired | — |  | K: operational coverage plan → D11 action-space registry ‖ D11: coverage requirements are CONFIG (registry `domains` + packets' question source lists); no question traverses a requirement node |
| `FOR_METRIC` | merged | [INTERVAL_FOR](../relationships/INTERVAL_FOR.md) |  | D4: merged into INTERVAL_FOR |
| `FOR_OCCURRENCE` | carried-by-pattern | [ASSESSES](../relationships/ASSESSES.md), [DERIVED_FROM](../relationships/DERIVED_FROM.md), [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) | R-20 | D9: kernel Assessment (RETELLING_FIDELITY, CONFLICT_RELEVANCE): the Assessment ASSESSES the Claim (and the speaker) and is DERIVED_FROM the judged occurrence, facets occurrence= / retelling= / origin… |
| `FOR_PROTOCOL` | retired | — |  | D5: Observation and ProtocolResult are kernel Assertions (METRIC) about the protocol; comparisons are computed (directive 3.5) |
| `FOR_USE_CONTEXT` | retired | — |  | D3: UseContextProfile deferred (11-open-questions); use-context facts are the assessed D5/D6 entity plus assessment fields |
| `FOUNDED_ORGANIZATION` | merged | [HOLDS_ROLE](../relationships/HOLDS_ROLE.md) |  | D7: HOLDS_ROLE: Replaces pinned BOARD_MEMBER_OF, EMPLOYED_BY, ADVISES_ORGANIZATION, FOUNDED_ORGANIZATION and the role half of AFFILIATED_WITH |
| `FROM_ANNOTATION` | retired | — |  | D9: W22 media graph cut; regions are kernel BOUNDING_BOX locators, depiction is predicate-only, label regions are D6 + kernel locators |
| `FROM_DEVICE` | retired | — |  | D5: measurement provenance of public observations belongs to D4 and the kernel assertion |
| `FROM_LAB_TEST` | retired | — |  | D5: measurement provenance of public observations belongs to D4 and the kernel assertion |
| `FROM_TEXT_VERSION` | merged | [CHUNK_OF](../relationships/CHUNK_OF.md) | R-80 | D9: CHUNK_OF: Replaces pinned HAS_CHUNK, FROM_TEXT_VERSION, HAS_TEXT_VERSION, TEXT_OF_SNAPSHOT, HAS_SEGMENTATION (text version and segmentation are chunk properties) |
| `FULFILLS_OFFER` | carried-by-pattern | [NAMES_RESPONSIBLE_PARTY](../relationships/NAMES_RESPONSIBLE_PARTY.md), [SELLER_OF_RECORD](../relationships/SELLER_OF_RECORD.md) | R-67 | D6: Offer.fulfillmentKind + fulfillerNameAsDisplayed; FULFILLED_BY predicate-only ‖ D7: commerce roles; D6 declares Offer.sellerOfRecord (SELLER_OF_RECORD) and LabelVersion.responsibleParty (NAMES_RE… |
| `GOVERNED_BY_SPECIFICATION` | retired | — |  | D1: D8 (quality/manufacturing) declares into IngredientMaterial if a D8 question traverses them ‖ D8: specifications are not nodes; the criterion printed beside a result is inline on QualityResult, a… |
| `GRANTS_PATENT_LICENSE` | merged | [LICENSED_TO](../relationships/LICENSED_TO.md) |  | D8: LICENSED_TO: Replaces the PatentLicense node, LICENSES_PATENT and GRANTS_PATENT_LICENSE |
| `HAS_ACTIVE_MOIETY` | kept | [HAS_ACTIVE_MOIETY](../relationships/HAS_ACTIVE_MOIETY.md) |  |  |
| `HAS_ADJUSTMENT_RULE` | retired | — |  | D5: MeasurementPlan and ProtocolAdjustmentRule are step kinds MEASURE / REVIEW |
| `HAS_ANALYTE` | kept | [HAS_ANALYTE](../relationships/HAS_ANALYTE.md) |  |  |
| `HAS_ANALYZED_COHORT` | merged | [HAS_POPULATION](../relationships/HAS_POPULATION.md) |  | D3: HAS_POPULATION: replaces three pinned edges (HAS_ELIGIBLE_POPULATION, HAS_ENROLLED_COHORT, HAS_ANALYZED_COHORT) |
| `HAS_ANNOTATION` | retired | — |  | D9: W22 media graph cut; regions are kernel BOUNDING_BOX locators, depiction is predicate-only, label regions are D6 + kernel locators |
| `HAS_ARM` | kept | [HAS_ARM](../relationships/HAS_ARM.md) |  |  |
| `HAS_BUNDLE_COMPONENT` | retired | — |  | D6: Bundle/BundleComponent absorbed into Package.packageKind + CONTAINS_PACKAGE predicate |
| `HAS_CAPABILITY_STATE` | retired | — | R-68 | D7: manufacturing and supply roles; predicate-only in every module, under the one name set D7 registers in predicateOnly (MANUFACTURES, CONTRACT_MANUFACTURES_FOR, SUPPLIES_MATERIAL, MANUFACTURER_UNNA… |
| `HAS_CERTIFICATION_SCOPE` | merged | [COVERS](../relationships/COVERS.md) |  | D8: COVERS: Replaces COVERS (W12), HAS_CERTIFICATION_SCOPE, CERTIFIED_UNDER, PROGRAM_HAS_LISTING, CERTIFIES_RESULTS_FOR |
| `HAS_CHEMICAL_FORM` | merged | [REALIZES_SUBSTANCE](../relationships/REALIZES_SUBSTANCE.md) |  | D1: REALIZES_SUBSTANCE: absorbs FORM_OF_SUBSTANCE / HAS_CHEMICAL_FORM (ChemicalForm cut) |
| `HAS_CHUNK` | merged | [CHUNK_OF](../relationships/CHUNK_OF.md) | R-80 | D9: CHUNK_OF: Replaces pinned HAS_CHUNK, FROM_TEXT_VERSION, HAS_TEXT_VERSION, TEXT_OF_SNAPSHOT, HAS_SEGMENTATION (text version and segmentation are chunk properties) |
| `HAS_CONSTRAINT` | renamed | [STATES_CONSTRAINT](../relationships/STATES_CONSTRAINT.md) |  | D5: STATES_CONSTRAINT: Replaces pinned HAS_CONSTRAINT -> Constraint and its ConstraintRole edge properties (role is derivable from stepKind + statedLevel) |
| `HAS_CURRENT_PROTOCOL_STEP` | carried-by-pattern | [HAS_EDITION](../relationships/HAS_EDITION.md) |  | D5: current = the step of the edition whose HAS_EDITION episode is open; a cached shortcut is not needed |
| `HAS_DECLARATION` | retired | — |  | D6: LabelDeclaration rows are component lines or LabelVersion text properties |
| `HAS_DIMENSION` | retired | — |  | D3: applicability dimensions are child Assessments the parent DERIVES_FROM (kernel inputAssessments) |
| `HAS_ELIGIBLE_POPULATION` | merged | [HAS_POPULATION](../relationships/HAS_POPULATION.md) |  | D3: HAS_POPULATION: replaces three pinned edges (HAS_ELIGIBLE_POPULATION, HAS_ENROLLED_COHORT, HAS_ANALYZED_COHORT) |
| `HAS_ENROLLED_COHORT` | merged | [HAS_POPULATION](../relationships/HAS_POPULATION.md) |  | D3: HAS_POPULATION: replaces three pinned edges (HAS_ELIGIBLE_POPULATION, HAS_ENROLLED_COHORT, HAS_ANALYZED_COHORT) |
| `HAS_EPISODE` | merged | [PUBLISHES](../relationships/PUBLISHES.md) |  | D9: PUBLISHES: Replaces pinned HAS_EPISODE, HAS_SERIES, DISTRIBUTES_RENDITION, ON_PLATFORM (platform is a Channel property) |
| `HAS_EVENT` | predicate-only | predicate [PRESENTED_AT_CONFERENCE](../predicates/PRESENTED_AT_CONFERENCE.md) | R-65 | D13: Conference → Event structural edge cut; no Conference node in D9 or D13 (D9 Channel EVENT_SERIES is the recurring meeting); presentation link is predicate-only PRESENTED_AT_CONFERENCE (R-65) |
| `HAS_EVIDENCE_TARGET` | carried-by-pattern | [ASSESSES](../relationships/ASSESSES.md) |  | D3: EvidenceApplicability → kernel Assessment ASSESSES (evidence side) |
| `HAS_EXPOSURE_AGENT` | retired | — |  | D1: D5 (Exposure) declares into ChemicalSubstance if kept ‖ D12: Exposure deferred (no D12 question filters through a characterized exposure); contaminant exposure is D8 QualityResult + D5 safety ass… |
| `HAS_FORMULATION_VERSION` | merged | [HAS_LABEL_VERSION](../relationships/HAS_LABEL_VERSION.md) |  | D6: HAS_LABEL_VERSION: Replaces the pinned LABEL_FOR, DECLARES_FORMULATION and HAS_FORMULATION_VERSION: composition time is label time |
| `HAS_FUNCTIONAL_GOAL` | retired | — |  | D5: FunctionalGoal -> Target; protocol purpose = INTENDED_FOR_TARGET assertion or step targetKeys |
| `HAS_IDENTIFIER` | kept | [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) | R-52, R-23 | kernel pattern (Identifier.identifies → Subjectable); D1 declares nothing; K registers the predicate (R-52) |
| `HAS_INGREDIENT_COMPONENT` | merged | [DECLARES_COMPONENT](../relationships/DECLARES_COMPONENT.md) |  | D6: IngredientComponent became DECLARES_COMPONENT edge properties |
| `HAS_INTERVENTION_COMPONENT` | merged | [HAS_COMPONENT](../relationships/HAS_COMPONENT.md) |  | D3: HAS_COMPONENT: Replaces pinned ASSIGNS_INTERVENTION + HAS_INTERVENTION_COMPONENT (StudyIntervention absorbed) |
| `HAS_IP_INTEREST_IN` | merged | [RECEIVES_VALUE_FROM](../relationships/RECEIVES_VALUE_FROM.md) |  | D7: RECEIVES_VALUE_FROM: Replaces pinned RECEIVES_COMPENSATION_FROM and HAS_IP_INTEREST_IN |
| `HAS_LOCATOR` | kept | [HAS_LOCATOR](../relationships/HAS_LOCATOR.md) |  |  |
| `HAS_MEASUREMENT_PLAN` | retired | — |  | D5: MeasurementPlan and ProtocolAdjustmentRule are step kinds MEASURE / REVIEW |
| `HAS_MECHANISM` | predicate-only | predicate [MECHANISM_OF](../predicates/MECHANISM_OF.md) |  | D2: predicate MECHANISM_OF (Q-D2-14 promotes) |
| `HAS_MEDIA_VARIANT` | merged | [RENDITION_OF](../relationships/RENDITION_OF.md) |  | D9: RENDITION_OF: Replaces pinned RENDITION_OF, IN_RENDITION, HAS_MEDIA_VARIANT |
| `HAS_MIXTURE_COMPONENT` | predicate-only | predicate [HAS_MIXTURE_COMPONENT](../predicates/HAS_MIXTURE_COMPONENT.md) |  | D1: a question traverses branded complex materials (Q-D1-21 is about D6 label blends, not materials) |
| `HAS_OBJECT` | kept | [HAS_OBJECT](../relationships/HAS_OBJECT.md) | R-23 | kernel (HAS_EVIDENCE -> SourceLocator, MENTIONS derived, Assertion.supersedesUid same asserter only, R-23) |
| `HAS_OFFER` | kept | [HAS_OFFER](../relationships/HAS_OFFER.md) |  |  |
| `HAS_PACKAGE_CONFIGURATION` | renamed | [HAS_PACKAGE](../relationships/HAS_PACKAGE.md) |  | D6: renamed HAS_PACKAGE |
| `HAS_PATENT_CLAIM` | retired | — |  | D8: family id and publication type are Patent properties; claim text stays in the snapshot; claim numbers on LegalStatus |
| `HAS_PATHWAY_VERSION` | retired | — |  | D8: pathway is an enum, legal basis a citation string; no question traverses a pathway node |
| `HAS_PRICE_OBSERVATION` | retired | — |  | D6: PriceObservation became a typed-literal Assertion on the Offer (predicate family OFFER_PRICE_*); see predicateOnly |
| `HAS_PROTOCOL_EDITION` | renamed | [HAS_EDITION](../relationships/HAS_EDITION.md) |  | D5: renamed HAS_EDITION (D5-internal, one meaning) |
| `HAS_PROTOCOL_STEP` | merged | [HAS_STEP](../relationships/HAS_STEP.md) |  | D5: renamed HAS_STEP |
| `HAS_PROTOCOL_VERSION` | carried-by-pattern | [REVISES](../relationships/REVISES.md) |  | D3: protocols and analysis plans are Publications (PROTOCOL / ANALYSIS_PLAN) that REPORT_ON the study; versions chain by REVISES |
| `HAS_QUANTITY_DECLARATION` | retired | — |  | D6: amount fields on ComponentLineProperties |
| `HAS_REFERENCE_RANGE` | carried-by-pattern | [INTERVAL_FOR](../relationships/INTERVAL_FOR.md) |  | D4: ReferenceRange merged into ReferenceIntervalVersion; INTERVAL_FOR covers it |
| `HAS_REGISTRATION_VERSION` | kept | [HAS_REGISTRATION_VERSION](../relationships/HAS_REGISTRATION_VERSION.md) |  |  |
| `HAS_REGULATORY_STATUS` | merged | [STATUS_OF](../relationships/STATUS_OF.md) |  | D8: STATUS_OF: Replaces HAS_REGULATORY_STATUS, STATUS_OF (W13) and IP_STATUS_OF |
| `HAS_REGULATORY_STEP` | retired | — |  | D8: pathway is an enum, legal basis a citation string; no question traverses a pathway node |
| `HAS_RIGHTS_RECORD` | retired | — |  | D9: rights are a verbatim property on MediaWork; media suitability has no D9 question |
| `HAS_SAFETY_SIGNAL` | carried-by-pattern | [ASSESSES](../relationships/ASSESSES.md), [DERIVED_FROM](../relationships/DERIVED_FROM.md) |  | D1: kernel Assessment SAFETY_SIGNAL (D5 kind) ASSESSES the D1 node; no typed edge ‖ D5: SafetySignal is a kernel Assessment (SAFETY_SIGNAL) using kernel ASSESSES and DERIVED_FROM |
| `HAS_SEGMENT` | retired | — |  | D9: EpisodeSegment cut; the segment is a qualifier on the occurrence (kernel request K-5 segmentKind) and a media-time locator |
| `HAS_SEGMENTATION` | merged | [CHUNK_OF](../relationships/CHUNK_OF.md) | R-80 | D9: CHUNK_OF: Replaces pinned HAS_CHUNK, FROM_TEXT_VERSION, HAS_TEXT_VERSION, TEXT_OF_SNAPSHOT, HAS_SEGMENTATION (text version and segmentation are chunk properties) |
| `HAS_SENSOR` | retired | — |  | D4: Sensor is the SensingModality enum list on Device |
| `HAS_SERIES` | merged | [PUBLISHES](../relationships/PUBLISHES.md) |  | D9: PUBLISHES: Replaces pinned HAS_EPISODE, HAS_SERIES, DISTRIBUTES_RENDITION, ON_PLATFORM (platform is a Channel property) |
| `HAS_SNAPSHOT` | kept | [HAS_SNAPSHOT](../relationships/HAS_SNAPSHOT.md) |  |  |
| `HAS_STATE` | retired | — |  | D6: ProductSnapshot compatibility type dropped (R1); label state is LabelVersion ‖ D7: OrganizationSnapshot dropped; name and status history are valid-time Assertions |
| `HAS_STEP` | kept | [HAS_STEP](../relationships/HAS_STEP.md) | R-68 | W11 process graph; no D8 question traverses a process; manufacturer roles are predicate-only, registered by D7 (MANUFACTURES, CONTRACT_MANUFACTURES_FOR, SUPPLIES_MATERIAL, MANUFACTURER_UNNAMED, DISTR… |
| `HAS_STRAIN` | merged | [DERIVED_FROM_TAXON](../relationships/DERIVED_FROM_TAXON.md) |  | D1: DERIVED_FROM_TAXON: replaces pinned HAS_STRAIN) |
| `HAS_SUBJECT` | kept | [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) | R-23 | kernel (HAS_EVIDENCE -> SourceLocator, MENTIONS derived, Assertion.supersedesUid same asserter only, R-23) |
| `HAS_SUBPROTOCOL` | retired | — |  | D5: no question traverses protocol composition; sections are sectionLabel; derivation is an Assertion if ever needed |
| `HAS_TARGET` | carried-by-pattern | [STEP_USES](../relationships/STEP_USES.md) |  | D5: pinned numeric Target and MeasurementPlan absorbed into ProtocolStep threshold properties + STEP_USES -> Metric |
| `HAS_TEXT_VERSION` | merged | [CHUNK_OF](../relationships/CHUNK_OF.md) |  | D9: CHUNK_OF: Replaces pinned HAS_CHUNK, FROM_TEXT_VERSION, HAS_TEXT_VERSION, TEXT_OF_SNAPSHOT, HAS_SEGMENTATION (text version and segmentation are chunk properties) |
| `HAS_VARIANT` | kept | [HAS_VARIANT](../relationships/HAS_VARIANT.md) |  |  |
| `HOLDS_EQUITY_IN` | merged | [HOLDS_STAKE](../relationships/HOLDS_STAKE.md) |  | D7: HOLDS_STAKE: Replaces pinned INVESTED_IN and HOLDS_EQUITY_IN (kept apart by stakeKind EQUITY vs INVESTOR_UNSPECIFIED) |
| `HOSTS_CHANNEL` | unmapped | — |  | see unmappedEdges (DECISIONS.md 'Seven unmapped legacy relationships') |
| `HOSTS_EVENT` | merged | [INVOLVES](../relationships/INVOLVES.md) | R-81, R-65 | D13: folded into INVOLVES (no host role needed by any D13 question; Community cut) |
| `HOSTS_LISTING` | carried-by-pattern | [NAMES_RESPONSIBLE_PARTY](../relationships/NAMES_RESPONSIBLE_PARTY.md), [SELLER_OF_RECORD](../relationships/SELLER_OF_RECORD.md) | R-67 | D6: MerchantListing.hostDomain; HOSTED_BY predicate-only ‖ D7: commerce roles; D6 declares Offer.sellerOfRecord (SELLER_OF_RECORD) and LabelVersion.responsibleParty (NAMES_RESPONSIBLE_PARTY, stays ty… |
| `HOSTS_PROCESS` | retired | — | R-68 | D7: manufacturing and supply roles; predicate-only in every module, under the one name set D7 registers in predicateOnly (MANUFACTURES, CONTRACT_MANUFACTURES_FOR, SUPPLIES_MATERIAL, MANUFACTURER_UNNA… |
| `IDENTIFIES_LOST_QUALIFICATION` | carried-by-pattern | [ASSESSES](../relationships/ASSESSES.md), [DERIVED_FROM](../relationships/DERIVED_FROM.md), [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) | R-20 | D9: kernel Assessment (RETELLING_FIDELITY, CONFLICT_RELEVANCE): the Assessment ASSESSES the Claim (and the speaker) and is DERIVED_FROM the judged occurrence, facets occurrence= / retelling= / origin… |
| `IMPACT_ON` | carried-by-pattern | [INVOLVES](../relationships/INVOLVES.md), [LEADS_TO](../relationships/LEADS_TO.md), [RESPONDS_TO](../relationships/RESPONDS_TO.md) |  | D9: W18 event layer belongs to D13 (Event, LEADS_TO, RESPONDS_TO, INVOLVES) ‖ D13: impact is a kernel Assessment (assessmentKind EVENT_IMPACT, facets impactDomain=<value>), not an edge |
| `IMPLEMENTS_PANEL` | carried-by-pattern | [INCLUDES_TEST](../relationships/INCLUDES_TEST.md) |  | D4: PanelDefinition merged into LabTest(PANEL); composition is INCLUDES_TEST episodes ‖ D6: D4 (diagnostic test service semantics) |
| `IMPLEMENTS_PLATFORM` | retired | — |  | D4: platform enum ‖ D6: D4 |
| `INCLUDES_BIOMARKER` | carried-by-pattern | [INCLUDES_TEST](../relationships/INCLUDES_TEST.md), [MEASURES_METRIC](../relationships/MEASURES_METRIC.md), [QUANTIFIES](../relationships/QUANTIFIES.md) |  | D4: panel → biomarker is the two-hop INCLUDES_TEST → MEASURES_METRIC → QUANTIFIES |
| `INCLUDES_LABTEST` | renamed | [INCLUDES_TEST](../relationships/INCLUDES_TEST.md) |  | D4: renamed INCLUDES_TEST (LabTest → LabTest) |
| `INCLUDES_OBSERVATION` | retired | — |  | D5: Observation and ProtocolResult are kernel Assertions (METRIC) about the protocol; comparisons are computed (directive 3.5) |
| `INCLUDES_PROTOCOL` | retired | — |  | D5: no question traverses protocol composition; sections are sectionLabel; derivation is an Assertion if ever needed |
| `INCLUDES_RESULT` | merged | [DERIVED_FROM](../relationships/DERIVED_FROM.md) | R-11 | D3: kernel DERIVED_FROM to the StudyResults' STATED_IN Assertions; pinned inputRole lost (11-open-questions, kernel) |
| `INCLUDES_SUBJECT` | retired | — |  | D9: W22 media graph cut; regions are kernel BOUNDING_BOX locators, depiction is predicate-only, label regions are D6 + kernel locators |
| `INCREASES_RISK_FOR` | predicate-only | predicate [INCREASES_RISK_OF](../predicates/INCREASES_RISK_OF.md) | R-47 | D2: predicate INCREASES_RISK_OF (Q-D2-15) |
| `INDICATES` | predicate-only | predicate [INDICATES_CONDITION](../predicates/INDICATES_CONDITION.md) |  | D4: predicate-only INDICATES_CONDITION; clinical interpretation is out of scope |
| `INFLUENCES_OUTCOME` | carried-by-pattern | [AFFECTS_MECHANISM](../relationships/AFFECTS_MECHANISM.md), [ASSOCIATES](../relationships/ASSOCIATES.md) | R-47 | D2: adversarial review 2026-10-08: demoted from a derived Mechanism → Outcome\|Condition projection to predicate-only. All its questions are value 2; Q-D2-15's pattern never traversed it; Q-D2-14 alre… |
| `INPUTS` | retired | — | R-68 | D1: D8 (quality/manufacturing) declares into IngredientMaterial if a D8 question traverses them ‖ D8: W11 process graph; no D8 question traverses a process; manufacturer roles are predicate-only, reg… |
| `INSPECTED_FACILITY` | merged | [CONCERNS](../relationships/CONCERNS.md) |  | D8: CONCERNS: replaces SUBMISSION_ABOUT, INSPECTED_FACILITY's product side, the recall→product/lot links and LICENSE_COVERS' topical half |
| `INSTANCE_OF` | renamed | [OCCURRENCE_OF](../relationships/OCCURRENCE_OF.md) |  | K: OCCURRENCE_OF (structural); re-clustering is an EQUIVALENCE Assessment |
| `INTERPRETED_WITH_REFERENCE_INTERVAL_VERSION` | retired | — |  | D5: measurement provenance of public observations belongs to D4 and the kernel assertion |
| `INTERPRETS_RESULT` | carried-by-pattern | [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md), [ISSUED_BY](../relationships/ISSUED_BY.md), [MEASURES_ANALYTE](../relationships/MEASURES_ANALYTE.md), [QUALITY_RESULT_FOR](../relationships/QUALITY_RESULT_FOR.md) |  | D8: W12 test chain collapsed into one QualityResult row (QUALITY_RESULT_FOR, MEASURES_ANALYTE, ISSUED_BY); SUPPORTED_BY is kernel HAS_EVIDENCE |
| `INTERPRETS_RESULT_OF` | carried-by-pattern | [ASSESSES](../relationships/ASSESSES.md) |  | D3: ResultInterpretation → kernel Assessment ASSESSES StudyResult |
| `INTERPRETS_TESTING_OF` | merged | [QUALITY_RESULT_FOR](../relationships/QUALITY_RESULT_FOR.md) |  | D8: QUALITY_RESULT_FOR: Replaces SAMPLE_FROM, TESTED_SAMPLE, PRODUCED_RESULT, INTERPRETS_TESTING_OF and SUMMARIZES_TESTING |
| `INVENTORY_INSTANCE_OF` | retired | — |  | D6: InventoryItem dropped: no public source exposes merchant inventory records |
| `INVESTED_IN` | merged | [HOLDS_STAKE](../relationships/HOLDS_STAKE.md) |  | D7: HOLDS_STAKE: Replaces pinned INVESTED_IN and HOLDS_EQUITY_IN (kept apart by stakeKind EQUITY vs INVESTOR_UNSPECIFIED) |
| `INVESTIGATED_BY` | merged | [HAS_STUDY_ROLE](../relationships/HAS_STUDY_ROLE.md) | R-82 | D3: HAS_STUDY_ROLE: Replaces pinned derived SPONSORED_BY, OPERATED_BY and INVESTIGATED_BY |
| `INVESTIGATES` | kept | [INVESTIGATES](../relationships/INVESTIGATES.md) |  |  |
| `INVOLVES` | kept | [INVOLVES](../relationships/INVOLVES.md) | R-81 | event participation, including round participation as INVESTOR / LEAD_INVESTOR and a presentation as PRESENTER (R-81); D13 INVOLVES (Event → Organization \| Person, role enum) (seam). A persisting hol… |
| `INVOLVES_PATHWAY` | renamed | [PART_OF_MECHANISM](../relationships/PART_OF_MECHANISM.md) |  | D2: PART_OF_MECHANISM: Replaces pinned INVOLVES_PATHWAY (Mechanism→Pathway, Condition→Pathway) and the implicit hallmark grouping |
| `IN_PATHWAY` | merged | [REFLECTS_MECHANISM](../relationships/REFLECTS_MECHANISM.md) |  | D2: D4 Biomarker → Pathway: replaced by REFLECTS_MECHANISM (D4) |
| `IN_RENDITION` | merged | [RENDITION_OF](../relationships/RENDITION_OF.md) |  | D9: RENDITION_OF: Replaces pinned RENDITION_OF, IN_RENDITION, HAS_MEDIA_VARIANT |
| `IN_SPECIES` | retired | — |  | D2: Species is an enum (ModelOrganism) + ncbiTaxonId on the context; no question traverses through a species |
| `IN_STUDY_ARM` | kept | [IN_STUDY_ARM](../relationships/IN_STUDY_ARM.md) |  |  |
| `IP_STATUS_OF` | merged | [STATUS_OF](../relationships/STATUS_OF.md) |  | D8: STATUS_OF: Replaces HAS_REGULATORY_STATUS, STATUS_OF (W13) and IP_STATUS_OF |
| `ISSUED_BY` | kept | [ISSUED_BY](../relationships/ISSUED_BY.md) |  |  |
| `LABEL_FOR` | merged | [HAS_LABEL_VERSION](../relationships/HAS_LABEL_VERSION.md) | R-10 | D6: HAS_LABEL_VERSION: Replaces the pinned LABEL_FOR, DECLARES_FORMULATION and HAS_FORMULATION_VERSION: composition time is label time |
| `LEGACY_EVALUATES` | merged | [HAS_ARM](../relationships/HAS_ARM.md) |  | D3: legacy 9-member union; replaced by HAS_ARM → HAS_COMPONENT → ADMINISTERS |
| `LICENSES_PATENT` | merged | [LICENSED_TO](../relationships/LICENSED_TO.md) |  | D8: LICENSED_TO: Replaces the PatentLicense node, LICENSES_PATENT and GRANTS_PATENT_LICENSE |
| `LICENSE_COVERS` | merged | [CONCERNS](../relationships/CONCERNS.md) |  | D8: CONCERNS: replaces SUBMISSION_ABOUT, INSPECTED_FACILITY's product side, the recall→product/lot links and LICENSE_COVERS' topical half |
| `LINKS_TO` | retired | — |  | D6: same (D9) |
| `LISTING_FOR` | kept | [LISTING_FOR](../relationships/LISTING_FOR.md) |  |  |
| `LISTS` | merged | [HAS_OFFER](../relationships/HAS_OFFER.md) |  | D6: generic; replaced by HAS_OFFER / LISTING_FOR |
| `LISTS_OFFER` | carried-by-pattern | [NAMES_RESPONSIBLE_PARTY](../relationships/NAMES_RESPONSIBLE_PARTY.md), [SELLER_OF_RECORD](../relationships/SELLER_OF_RECORD.md) | R-67 | D6: the party that placed the offer is the seller of record in every captured case; no question separates them ‖ D7: commerce roles; D6 declares Offer.sellerOfRecord (SELLER_OF_RECORD) and LabelVersi… |
| `LISTS_PROCEDURE` | predicate-only | predicate [OFFERS_INTERVENTION](../predicates/OFFERS_INTERVENTION.md) | R-52 | D5: D6/D7 own offerings and development; predicate OFFERS_INTERVENTION, registered by D6 (R-52) |
| `LISTS_PRODUCT` | merged | [LISTING_FOR](../relationships/LISTING_FOR.md) |  | D6: LISTING_FOR: Replaces LISTS_PRODUCT (legacy) and the 5-member ListingTarget union |
| `LOCATES_REGION` | retired | — |  | K: BOUNDING_BOX selector in SourceLocator.selectorJson; regions of media assets are D9 ‖ D9: W22 media graph cut; regions are kernel BOUNDING_BOX locators, depiction is predicate-only, label regions… |
| `LOCATOR_IN_TEXT_VERSION` | merged | [COVERS_LOCATOR](../relationships/COVERS_LOCATOR.md) | R-38 | D9: COVERS_LOCATOR: Replaces pinned LOCATOR_IN_TEXT_VERSION, RESOLVES_TO_CHUNK and SUPPORTED_BY_CHUNK (the last was a document→record support edge, forbidden by 3 |
| `LOT_OF` | kept | [LOT_OF](../relationships/LOT_OF.md) |  | union members considered and not added (addressee is ADDRESSED_TO; facility listing is predicate-only until Facility; Package not a lot or listing scope in any D8 source; MediaWork and LabTest would… |
| `MANUFACTURED_UNDER` | retired | — |  | D8: specifications are not nodes; the criterion printed beside a result is inline on QualityResult, a regulator's specification is text on its record |
| `MANUFACTURES` | predicate-only | predicate [MANUFACTURES](../predicates/MANUFACTURES.md) | R-68 | D7: CQ-MF-01 needs a GraphQL filter at volume; then the asking domain declares Product.manufacturers / IngredientMaterial.manufacturers -> Organization (D6/D1), never a field on Organization |
| `MANUFACTURES_PRODUCT` | retired | — | R-68 | D7: manufacturing and supply roles; predicate-only in every module, under the one name set D7 registers in predicateOnly (MANUFACTURES, CONTRACT_MANUFACTURES_FOR, SUPPLIES_MATERIAL, MANUFACTURER_UNNA… |
| `MARKETED_UNDER_MARK` | predicate-only | predicate [MARKETED_UNDER_MARK](../predicates/MARKETED_UNDER_MARK.md) |  | D1: Q-D1-16 needs mark-owner traversal across many materials (D8 would own Trademark) |
| `MARKETS_PRODUCT` | carried-by-pattern | [NAMES_RESPONSIBLE_PARTY](../relationships/NAMES_RESPONSIBLE_PARTY.md), [SELLER_OF_RECORD](../relationships/SELLER_OF_RECORD.md) | R-67 | D7: commerce roles; D6 declares Offer.sellerOfRecord (SELLER_OF_RECORD) and LabelVersion.responsibleParty (NAMES_RESPONSIBLE_PARTY, stays typed, R-67) pointing at Organization (seam); a non-label dis… |
| `MATCHES_COMMERCE_ITEM` | carried-by-pattern | [ASSESSES](../relationships/ASSESSES.md) |  | D6: CommerceMatch → kernel Assessment ASSESSES (EQUIVALENCE, subkind D6.listing-to-package / D6.identifier-equivalence / D6.recall-scope) ‖ D8: no public source for individual units; commerce matchin… |
| `MEASURED_BY_METRIC` | merged | [MEASURES](../relationships/MEASURES.md) |  | D3: MEASURES: Replaces pinned MEASURES_BIOMARKER, MEASURED_BY_METRIC and REFERS_TO_OUTCOME |
| `MEASURED_IN` | retired | — |  | D2: AnatomicalContext is CompartmentKind + compartmentOntologyId on the context; cross-domain compartment check is equality on the ontology id |
| `MEASURED_IN_MATRIX` | retired | — |  | D2: D4 Biomarker/Metric specimen is an ontology-id property (D4 systemOntologyId) ‖ D4: Metric.systemOntologyId + AssayVersion.specimenOntologyIds (equality join, no node) |
| `MEASURES` | kept | [MEASURES](../relationships/MEASURES.md) |  | Biomarker-level 'measures' is LabTest -MEASURES_METRIC-> Metric -QUANTIFIES-> Biomarker; D3 OutcomeDefinition → Biomarker MEASURES is D3's own edge |
| `MEASURES_BIOMARKER` | merged | [MEASURES](../relationships/MEASURES.md) |  | D3: MEASURES: Replaces pinned MEASURES_BIOMARKER, MEASURED_BY_METRIC and REFERS_TO_OUTCOME |
| `MEASURES_METRIC` | kept | [MEASURES_METRIC](../relationships/MEASURES_METRIC.md) |  | every device value is an algorithm output: Device ← RUNS_ON_DEVICE ← AlgorithmVersion → OUTPUTS_METRIC (versionBasis UNKNOWN when unlabeled) |
| `MEDIATES_RISK_THROUGH` | predicate-only | `predicate MEDIATES_RISK_THROUGH` |  | D2: predicate; RiskFactor merged into Condition RISK_STATE |
| `MENTIONS` | kept | [MENTIONS](../relationships/MENTIONS.md) | R-09 | cut with Mention in the adversarial review (owner confirms, R-09): it restated what the RESOLUTION Assessment records; MENTIONS stays a kernel-meaning type declared and registered by D9 on Chunk |
| `MENTIONS_ENTITY` | merged | [MENTIONS](../relationships/MENTIONS.md) | R-23, R-27 | D9: MENTIONS: Replaces pinned MENTIONS_ENTITY (chunk/episode → EpisodeMentionableTarget union) and the MediaSubjectTarget union (75 members) |
| `MODIFIES_STEP` | retired | — |  | D5: MeasurementPlan and ProtocolAdjustmentRule are step kinds MEASURE / REVIEW |
| `MODIFIES_TARGET` | carried-by-pattern | [STEP_USES](../relationships/STEP_USES.md) |  | D5: pinned numeric Target and MeasurementPlan absorbed into ProtocolStep threshold properties + STEP_USES -> Metric |
| `MODULATES` | carried-by-pattern | [AFFECTS_MECHANISM](../relationships/AFFECTS_MECHANISM.md) |  | D1: D2 derived projections over mechanism assertions (D2 declares, seam) ‖ D2: pinned compound → molecular target; first mergedInto AFFECTS_MECHANISM (→ MolecularEntity pair), that pair cut in the ad… |
| `NESTED_COMPONENT` | retired | — |  | D6: parentOrderIndex on ComponentLineProperties |
| `NEXT_CHUNK` | retired | — | R-80 | K: D9 (documents, chunks, containers, sponsorship); AUTHORED_BY is a predicate registered by D3 (R-80) ‖ D9: Chunk.chunkIndex; no question walks chunk order |
| `OBSERVED_IN_CONTEXT` | kept | [OBSERVED_IN_CONTEXT](../relationships/OBSERVED_IN_CONTEXT.md) | R-29 | qualifier or D3/D4 context node owned by the domain (D2 declares it IN on MechanismEvidenceContext, R-29) |
| `OCCURS_IN` | kept | [OCCURS_IN](../relationships/OCCURS_IN.md) |  |  |
| `OCCURS_IN_SEGMENT` | merged | [OCCURS_IN](../relationships/OCCURS_IN.md) | R-80 | D9: OCCURS_IN: Replaces pinned OCCURS_IN (OccurrenceContainerTarget union of 3) and OCCURS_IN_SEGMENT |
| `OFFERS` | carried-by-pattern | [SELLER_OF_RECORD](../relationships/SELLER_OF_RECORD.md) |  | D6: pinned Organization → Offer duplicate of SELLER_OF_RECORD |
| `OFFERS_PROCEDURE` | predicate-only | predicate [OFFERS_INTERVENTION](../predicates/OFFERS_INTERVENTION.md) | R-52 | D5: D6/D7 own offerings and development; predicate OFFERS_INTERVENTION, registered by D6 (R-52) |
| `OFFERS_TREATMENT` | predicate-only | predicate [OFFERS_INTERVENTION](../predicates/OFFERS_INTERVENTION.md) | R-52 | D5: D6/D7 own offerings and development; predicate OFFERS_INTERVENTION, registered by D6 (R-52) |
| `ON_PLATFORM` | merged | [PUBLISHES](../relationships/PUBLISHES.md) | R-79, R-80 | D9: PUBLISHES: Replaces pinned HAS_EPISODE, HAS_SERIES, DISTRIBUTES_RENDITION, ON_PLATFORM (platform is a Channel property) |
| `OPERATED_BY` | merged | [HAS_STUDY_ROLE](../relationships/HAS_STUDY_ROLE.md) | R-79, R-80 | D3: HAS_STUDY_ROLE: Replaces pinned derived SPONSORED_BY, OPERATED_BY and INVESTIGATED_BY |
| `OPERATES_CHANNEL` | predicate-only | predicate [OPERATED_BY](../predicates/OPERATED_BY.md) | R-79, R-80 | D9: a fixture answers CQ-CL-05 through a channel operator at a dated T and a measured CQ-CL-05 latency shows the two-hop Assertion read is too slow (R-79) |
| `OPERATES_FACILITY` | predicate-only | predicate [LISTING_COVERS_FACILITY_OF](../predicates/LISTING_COVERS_FACILITY_OF.md) | R-67 | D7: no Facility node (R-67, OQ-D7-05 closed): a certified site is the operating Organization plus verbatim scope; the facility branch is the D8 predicate LISTING_COVERS_FACILITY_OF; D8 is the designa… |
| `OPERATIONALIZED_BY` | kept | [OPERATIONALIZED_BY](../relationships/OPERATIONALIZED_BY.md) | R-70, R-26 | pinned Outcome → Metric; D5 owns Target OPERATIONALIZED_BY → D4 Biomarker \| D4 Metric \| D2 Outcome \| D2 Condition (union TargetMeasure, R-70; asserted, recorded only, R-26); Outcome → D4 Metric not n… |
| `OUTPUTS` | retired | — | R-68 | D1: D8 (quality/manufacturing) declares into IngredientMaterial if a D8 question traverses them ‖ D8: W11 process graph; no D8 question traverses a process; manufacturer roles are predicate-only, reg… |
| `OUTPUTS_METRIC` | kept | [OUTPUTS_METRIC](../relationships/OUTPUTS_METRIC.md) |  |  |
| `OVERSEES` | retired | — |  | D8: pathway is an enum, legal basis a citation string; no question traverses a pathway node |
| `OWNS_BRAND` | kept | [OWNS_BRAND](../relationships/OWNS_BRAND.md) |  |  |
| `OWNS_TRADEMARK` | carried-by-pattern | [ASSIGNED_TO](../relationships/ASSIGNED_TO.md), [LICENSED_TO](../relationships/LICENSED_TO.md) |  | D7: IP and regulatory roles; D8 declares Patent.assignees (ASSIGNED_TO), Patent.licensees (LICENSED_TO), RegulatoryRecord.issuedBy / addressedTo (seam) ‖ D8: Trademark deferred (no question at value… |
| `PARENT_OF` | kept | [PARENT_OF](../relationships/PARENT_OF.md) |  |  |
| `PARTICIPATES_IN` | kept | [PARTICIPATES_IN](../relationships/PARTICIPATES_IN.md) |  |  |
| `PART_OF_MEDIA` | retired | — |  | D9: W22 media graph cut; regions are kernel BOUNDING_BOX locators, depiction is predicate-only, label regions are D6 + kernel locators |
| `PART_OF_PLAN` | unmapped | — |  | see unmappedEdges (DECISIONS.md 'Seven unmapped legacy relationships') |
| `PERFORMED_BY_LAB` | kept | [PERFORMED_BY_LAB](../relationships/PERFORMED_BY_LAB.md) |  | W12 test chain collapsed into one QualityResult row (QUALITY_RESULT_FOR, MEASURES_ANALYTE, ISSUED_BY); SUPPORTED_BY is kernel HAS_EVIDENCE |
| `PERFORMED_WITH_ASSAY_VERSION` | renamed | [PERFORMED_WITH_VERSION](../relationships/PERFORMED_WITH_VERSION.md) |  | D4: PERFORMED_WITH_VERSION: Replaces pinned PERFORMED_WITH_ASSAY_VERSION and the LabTest side of the algorithm link with one type and two fields |
| `PERFORMS_PROCESS` | retired | — | R-68 | D7: manufacturing and supply roles; predicate-only in every module, under the one name set D7 registers in predicateOnly (MANUFACTURES, CONTRACT_MANUFACTURES_FOR, SUPPLIES_MATERIAL, MANUFACTURER_UNNA… |
| `POSTS_RESULT` | carried-by-pattern | [HAS_STUDY_ROLE](../relationships/HAS_STUDY_ROLE.md) | R-82 | D5: Observation and ProtocolResult are kernel Assertions (METRIC) about the protocol; comparisons are computed (directive 3.5) ‖ D7: study roles; D3 HAS_STUDY_ROLE (Study → Organization \| Person \| Aw… |
| `PRESENTED_AT` | predicate-only | predicate [PRESENTED_AT_CONFERENCE](../predicates/PRESENTED_AT_CONFERENCE.md) | R-80, R-65, R-81 | D13: D9 decides (Document → session); D13 keeps predicate-only PRESENTED_AT_CONFERENCE |
| `PRIOR_SNAPSHOT` | merged | [HAS_SNAPSHOT](../relationships/HAS_SNAPSHOT.md) |  | K: HAS_SNAPSHOT: Replaces PRIOR_SNAPSHOT / RESULTING_SNAPSHOT / REVISES_SOURCE (revisionKind + revisesSnapshotUid on the later snapshot |
| `PRODUCED_BY_ASSAY_VERSION` | retired | — |  | D5: measurement provenance of public observations belongs to D4 and the kernel assertion |
| `PRODUCED_BY_PROCESS` | retired | — | R-68 | D1: D8 (quality/manufacturing) declares into IngredientMaterial if a D8 question traverses them ‖ D8: W11 process graph; no D8 question traverses a process; manufacturer roles are predicate-only, reg… |
| `PRODUCED_DATASET` | merged | [REPORTS_ON](../relationships/REPORTS_ON.md) |  | D3: REPORTS_ON: replaces pinned ANALYZES_DATASET / PRODUCED_DATASET: a reused cohort is a Study that secondary analyses report on |
| `PRODUCED_RESULT` | merged | [QUALITY_RESULT_FOR](../relationships/QUALITY_RESULT_FOR.md) |  | D8: QUALITY_RESULT_FOR: Replaces SAMPLE_FROM, TESTED_SAMPLE, PRODUCED_RESULT, INTERPRETS_TESTING_OF and SUMMARIZES_TESTING |
| `PROGRAM_HAS_LISTING` | merged | [COVERS](../relationships/COVERS.md) |  | D8: COVERS: Replaces COVERS (W12), HAS_CERTIFICATION_SCOPE, CERTIFIED_UNDER, PROGRAM_HAS_LISTING, CERTIFIES_RESULTS_FOR |
| `PROPOSES_MATCH` | merged | [ASSESSES](../relationships/ASSESSES.md) |  | K: ASSESSES: Replaces EVALUATES, ABOUT, ASSESSES_SOURCE_AUTHORITY, PROPOSES_MATCH, COMPARES_IDENTITIES |
| `PROVIDES_CONSTITUENT` | merged | [MATERIAL_CONTAINS](../relationships/MATERIAL_CONTAINS.md) |  | D1: merged into MATERIAL_CONTAINS (statementKind QUALITATIVE_PROVIDES, quantity null) |
| `QUALIFIED_BY` | carried-by-pattern | [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) | R-20 | K: Assertion.qualifiers (verification.v1 qualifiers); a qualification is HAS_EVIDENCE {role QUALIFIES} (R-20) ‖ D9: both ends kernel; kernel convention HAS_EVIDENCE {role QUALIFIES} + qualifier prefi… |
| `QUANTIFIES` | kept | [QUANTIFIES](../relationships/QUANTIFIES.md) |  |  |
| `QUANTITATIVELY_CONTAINS` | merged | [MATERIAL_CONTAINS](../relationships/MATERIAL_CONTAINS.md) |  | D1: merged into MATERIAL_CONTAINS (statementKind distinguishes declared/standardized/measured/calculated) |
| `REALIZES_SUBSTANCE` | kept | [REALIZES_SUBSTANCE](../relationships/REALIZES_SUBSTANCE.md) |  |  |
| `REANCHORS` | retired | — |  | K: SourceLocator.reanchorsLocatorUid + reanchorMatch |
| `RECEIVES_COMPENSATION_FROM` | merged | [RECEIVES_VALUE_FROM](../relationships/RECEIVES_VALUE_FROM.md) |  | D7: RECEIVES_VALUE_FROM: Replaces pinned RECEIVES_COMPENSATION_FROM and HAS_IP_INTEREST_IN |
| `RECOMMENDS` | predicate-only | predicate [RECOMMENDS_USE](../predicates/RECOMMENDS_USE.md) | R-83 | D7: never a stored record (00-DIRECTIVE 3.9); a recommendation is a claim occurrence with predicate RECOMMENDS_USE or RECOMMENDS_AGAINST, registered by D9 (R-83) |
| `RECORDING_OF` | predicate-only | predicate [RECORDING_OF](../predicates/RECORDING_OF.md) | R-65, R-81, R-52 | D9: Q-D9-18 rises above value 3 or D13 asks for "events with recordings" as a filter |
| `RECORDS` | carried-by-pattern | [COVERS](../relationships/COVERS.md) | R-67, R-94 | D5: Observation and ProtocolResult are kernel Assertions (METRIC) about the protocol; comparisons are computed (directive 3.5) ‖ D7: not D7 questions (D9, D8, D6 own them); D8 COVERS has no Organizat… |
| `REFERS_TO_OUTCOME` | merged | [MEASURES](../relationships/MEASURES.md) |  | D3: MEASURES: Replaces pinned MEASURES_BIOMARKER, MEASURED_BY_METRIC and REFERS_TO_OUTCOME |
| `REFLECTS_MECHANISM` | kept | [REFLECTS_MECHANISM](../relationships/REFLECTS_MECHANISM.md) |  | owned by D4 (declared on Biomarker, AssertedRecordedProperties); D2 consumes it in Q-D2-03 / Q-D2-22 (10-seams owner: other) |
| `REGION_HAS_DECLARATION` | retired | — | R-94 | D6: label regions are kernel SourceLocator BOUNDING_BOX selectors (an image is a D9 MediaWork, R-94) ‖ D9: W22 media graph cut; regions are kernel BOUNDING_BOX locators, depiction is predicate-only,… |
| `REGISTERED_AS` | merged | [HAS_REGISTRATION_VERSION](../relationships/HAS_REGISTRATION_VERSION.md) |  | D3: HAS_REGISTRATION_VERSION: Replaces pinned TrialRegistration -HAS_REGISTRATION_VERSION-> and Study -REGISTERED_AS-> (registration ids are kernel Identifiers on Study) |
| `RELATES_TO_CONDITION` | retired | — |  | D5: adverse-effect and condition links are Assertion objects (CAUSES_ADVERSE_EFFECT, USE_CONSTRAINED_IN); organ is a D2 property |
| `RELATES_TO_EFFECT` | retired | — |  | D5: adverse-effect and condition links are Assertion objects (CAUSES_ADVERSE_EFFECT, USE_CONSTRAINED_IN); organ is a D2 property |
| `RENDITION_OF` | kept | [RENDITION_OF](../relationships/RENDITION_OF.md) | R-43 | not declared in the K SDL: kernel meaning (Source → MediaWork \| Publication, asserted, AssertedRecordedProperties, recorded-only); declared IN on D9 MediaWork.renditions and D3 Publication.renditions… |
| `REPORTED_IN` | carried-by-pattern | [INVOLVES](../relationships/INVOLVES.md), [LEADS_TO](../relationships/LEADS_TO.md), [RESPONDS_TO](../relationships/RESPONDS_TO.md) |  | D9: W18 event layer belongs to D13 (Event, LEADS_TO, RESPONDS_TO, INVOLVES) ‖ D13: computed: assertions → locators → snapshots → sources (Q-D13-22); a stored derived copy adds nothing at expected vol… |
| `REPORTS_ON` | kept | [REPORTS_ON](../relationships/REPORTS_ON.md) |  |  |
| `REPORTS_SAFETY_SIGNAL` | carried-by-pattern | [ASSESSES](../relationships/ASSESSES.md), [DERIVED_FROM](../relationships/DERIVED_FROM.md) |  | D3: SafetySignal is a kernel Assessment (kind SAFETY_SIGNAL, D5 owns the kind) that ASSESSES the StudyResults; no D3 edge ‖ D5: SafetySignal is a kernel Assessment (SAFETY_SIGNAL) using kernel ASSESS… |
| `REQUIRES_INPUT_METRIC` | kept | [REQUIRES_INPUT_METRIC](../relationships/REQUIRES_INPUT_METRIC.md) |  |  |
| `RESOLVES_MENTION` | carried-by-pattern | [MENTIONS](../relationships/MENTIONS.md) | R-27 | K: MENTIONS is licensed by its entity-link/vN derivationRule; a RESOLUTION Assessment (named in derivedFromAssessmentUids) only when a binding rests on the surface form (R-27) ‖ K: the accepted RESOL… |
| `RESOLVES_TO_CHUNK` | merged | [COVERS_LOCATOR](../relationships/COVERS_LOCATOR.md) |  | D9: COVERS_LOCATOR: Replaces pinned LOCATOR_IN_TEXT_VERSION, RESOLVES_TO_CHUNK and SUPPORTED_BY_CHUNK (the last was a document→record support edge, forbidden by 3 |
| `RESOLVES_TO_CONSTRAINT` | kept | [RESOLVES_TO_CONSTRAINT](../relationships/RESOLVES_TO_CONSTRAINT.md) |  |  |
| `RESULTING_SNAPSHOT` | merged | [HAS_SNAPSHOT](../relationships/HAS_SNAPSHOT.md) |  | K: HAS_SNAPSHOT: Replaces PRIOR_SNAPSHOT / RESULTING_SNAPSHOT / REVISES_SOURCE (revisionKind + revisesSnapshotUid on the later snapshot |
| `RESULTS_FROM_RESPONSE` | merged | [STATUS_FROM](../relationships/STATUS_FROM.md) |  | D8: STATUS_FROM: Replaces RESULTS_FROM_RESPONSE and SUBMISSION_HAS_RESPONSE |
| `RESULT_FOR` | kept | [RESULT_FOR](../relationships/RESULT_FOR.md) | R-53 | R-53: QUALITY_RESULT_FOR replaces RESULT_FOR (D8) |
| `RESULT_FOR_ARM` | kept | [RESULT_FOR_ARM](../relationships/RESULT_FOR_ARM.md) |  |  |
| `RETELLS` | carried-by-pattern | [DERIVED_FROM](../relationships/DERIVED_FROM.md) | R-21 | D9: both ends are kernel types; kernel convention DERIVED_FROM with basisKind CITED_FROM_PRIOR_WORK (K-1 closed; R-21) ‖ D9: both ends are kernel types; requested from the kernel (11-open-questions K… |
| `RETRACTS` | merged | [REVISES](../relationships/REVISES.md) |  | D3: REVISES: Replaces pinned CORRECTS and RETRACTS (+ PublicationRevisionProperties) |
| `REVISES_SOURCE` | merged | [HAS_SNAPSHOT](../relationships/HAS_SNAPSHOT.md) | R-44 | K: HAS_SNAPSHOT: Replaces PRIOR_SNAPSHOT / RESULTING_SNAPSHOT / REVISES_SOURCE (revisionKind + revisesSnapshotUid on the later snapshot |
| `RULE_TRIGGERED_BY` | retired | — |  | D5: MeasurementPlan and ProtocolAdjustmentRule are step kinds MEASURE / REVIEW |
| `RUNS_FIRMWARE_VERSION` | merged | [RUNS_ON_DEVICE](../relationships/RUNS_ON_DEVICE.md) |  | D4: RUNS_ON_DEVICE: Replaces RUNS_FIRMWARE_VERSION, FIRMWARE_VERSION_OF and the device side of pinned RUNS_ON_DEVICE |
| `RUNS_ON_DEVICE` | kept | [RUNS_ON_DEVICE](../relationships/RUNS_ON_DEVICE.md) |  | D4 |
| `RUNS_ON_INSTRUMENT` | predicate-only | predicate [MEASURED_ON_INSTRUMENT](../predicates/MEASURED_ON_INSTRUMENT.md) |  | D4: instrument model is NOT_REPORTED on 9/9 coded artifacts; text property + predicate MEASURED_ON_INSTRUMENT |
| `RUNS_ON_PLATFORM` | retired | — |  | D4: TechnologyPlatform is the MeasurementPlatform enum |
| `SAME_TEST_AS` | retired | — |  | D4: sameness of two tests is a kernel Assessment (COMPARABILITY, D4.comparability), never a plain edge (00-DIRECTIVE 3.6) |
| `SAMPLE_FROM` | merged | [QUALITY_RESULT_FOR](../relationships/QUALITY_RESULT_FOR.md) |  | D8: QUALITY_RESULT_FOR: Replaces SAMPLE_FROM, TESTED_SAMPLE, PRODUCED_RESULT, INTERPRETS_TESTING_OF and SUMMARIZES_TESTING |
| `SELLER_OF_RECORD_FOR` | carried-by-pattern | [NAMES_RESPONSIBLE_PARTY](../relationships/NAMES_RESPONSIBLE_PARTY.md), [SELLER_OF_RECORD](../relationships/SELLER_OF_RECORD.md) | R-67 | D7: commerce roles; D6 declares Offer.sellerOfRecord (SELLER_OF_RECORD) and LabelVersion.responsibleParty (NAMES_RESPONSIBLE_PARTY, stays typed, R-67) pointing at Organization (seam); a non-label dis… |
| `SELLS_PRODUCT` | carried-by-pattern | [HAS_OFFER](../relationships/HAS_OFFER.md), [LISTING_FOR](../relationships/LISTING_FOR.md), [NAMES_RESPONSIBLE_PARTY](../relationships/NAMES_RESPONSIBLE_PARTY.md), [SELLER_OF_RECORD](../relationships/SELLER_OF_RECORD.md) | R-67 | D6: derived: SELLER_OF_RECORD ← Offer ← HAS_OFFER ← listing → LISTING_FOR → package ← variant ← product; computed at query time ‖ D7: commerce roles; D6 declares Offer.sellerOfRecord (SELLER_OF_RECOR… |
| `SERVES_ON_CHANNEL` | carried-by-pattern | [APPEARS_IN](../relationships/APPEARS_IN.md), [CONTENT_SPONSORED_BY](../relationships/CONTENT_SPONSORED_BY.md) | R-79, R-80 | D7: media roles; D9 declares MediaWork.sponsors (CONTENT_SPONSORED_BY) and MediaWork.appearances (APPEARS_IN) on its containers (seam); OPERATED_BY is a D9 predicate with subject Channel (R-79); AUTH… |
| `SIGNAL_BASED_ON` | carried-by-pattern | [ASSESSES](../relationships/ASSESSES.md), [DERIVED_FROM](../relationships/DERIVED_FROM.md) |  | D5: SafetySignal is a kernel Assessment (SAFETY_SIGNAL) using kernel ASSESSES and DERIVED_FROM |
| `SPEAKS_AT` | merged | [APPEARS_IN](../relationships/APPEARS_IN.md) | R-81, R-65 | D9: APPEARS_IN: Replaces pinned APPEARS_IN, SPEAKS_AT (talks are works), ATTRIBUTES_TO |
| `SPONSORED_BY` | merged | [HAS_STUDY_ROLE](../relationships/HAS_STUDY_ROLE.md) | R-82 | D3: HAS_STUDY_ROLE: Replaces pinned derived SPONSORED_BY, OPERATED_BY and INVESTIGATED_BY |
| `SPONSORS_CONTENT` | renamed | [CONTENT_SPONSORED_BY](../relationships/CONTENT_SPONSORED_BY.md) | R-80, R-79 | D9: CONTENT_SPONSORED_BY: Replaces pinned SPONSORS_CONTENT (SponsorableTarget union) |
| `STATUS_OF` | kept | [STATUS_OF](../relationships/STATUS_OF.md) | R-67, R-94, R-72 | not D7 questions (D9, D8, D6 own them); D8 COVERS has no Organization member (R-67, R-94) |
| `STRAIN_OF` | renamed | [PARENT_TAXON](../relationships/PARENT_TAXON.md) |  | D1: PARENT_TAXON: Replaces pinned STRAIN_OF and the implicit genus/species links |
| `STUDIED_IN` | retired | — |  | D2: D3 Study → Species; D3 carries organism as ncbiTaxonId on StudyPopulation (seam note in 11-open-questions) ‖ D3: species is StudyPopulation.ncbiTaxonId + strainOrLine (no taxon node; D2 cuts Anat… |
| `SUBMISSION_ABOUT` | merged | [CONCERNS](../relationships/CONCERNS.md) |  | D8: CONCERNS: replaces SUBMISSION_ABOUT, INSPECTED_FACILITY's product side, the recall→product/lot links and LICENSE_COVERS' topical half |
| `SUBMISSION_HAS_RESPONSE` | merged | [STATUS_FROM](../relationships/STATUS_FROM.md) |  | D8: STATUS_FROM: Replaces RESULTS_FROM_RESPONSE and SUBMISSION_HAS_RESPONSE |
| `SUBMITTED_BY` | renamed | [ADDRESSED_TO](../relationships/ADDRESSED_TO.md) |  | D8: ADDRESSED_TO: Replaces SUBMITTED_BY |
| `SUMMARIZES_TESTING` | merged | [QUALITY_RESULT_FOR](../relationships/QUALITY_RESULT_FOR.md) |  | D8: QUALITY_RESULT_FOR: Replaces SAMPLE_FROM, TESTED_SAMPLE, PRODUCED_RESULT, INTERPRETS_TESTING_OF and SUMMARIZES_TESTING |
| `SUPERSEDES` | carried-by-pattern | [ASSERTED_BY](../relationships/ASSERTED_BY.md), [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md), [HAS_OBJECT](../relationships/HAS_OBJECT.md), [HAS_SUBJECT](../relationships/HAS_SUBJECT.md), [MENTIONS](../relationships/MENTIONS.md), [OCCURRENCE_OF](../relationships/OCCURRENCE_OF.md), [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) | R-23 | K: supersedesUid (same asserter only, R-23) + recordedTo on the older record; no question walks chains deeper than one hop ‖ D3: kernel supersedesUid property |
| `SUPERSEDES_SUBMISSION` | carried-by-pattern | [ADDRESSED_TO](../relationships/ADDRESSED_TO.md), [CONCERNS](../relationships/CONCERNS.md), [STATUS_FROM](../relationships/STATUS_FROM.md) |  | D8: submission and response are both RegulatoryRecords (ADDRESSED_TO, CONCERNS, STATUS_FROM); inspections are reported by the warning letter (inspection window properties) or are INSPECTION_CLASSIFIC… |
| `SUPPLIES_INGREDIENT_MATERIAL` | retired | — | R-68 | D7: manufacturing and supply roles; predicate-only in every module, under the one name set D7 registers in predicateOnly (MANUFACTURES, CONTRACT_MANUFACTURES_FOR, SUPPLIES_MATERIAL, MANUFACTURER_UNNA… |
| `SUPPORTED_BY` | merged | [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) | R-23 | K: HAS_EVIDENCE: Replaces SUPPORTED_BY, CONTRADICTED_BY, SUPPORTED_BY_CHUNK and locator → Mention MENTIONS (the surface-form span is now cited by the RESOLUTION Assessment directly) |
| `SUPPORTED_BY_CHUNK` | merged | [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) | R-23, R-27 | K: HAS_EVIDENCE: Replaces SUPPORTED_BY, CONTRADICTED_BY, SUPPORTED_BY_CHUNK and locator → Mention MENTIONS (the surface-form span is now cited by the RESOLUTION Assessment directly) |
| `SUPPORTED_BY_DOCUMENT` | carried-by-pattern | [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md), [MENTIONS](../relationships/MENTIONS.md) | R-23 | D1: D12/D5/D10 or the kernel HAS_EVIDENCE pattern; never D1 ‖ D5: kernel (HAS_EVIDENCE -> SourceLocator, MENTIONS derived, Assertion.supersedesUid same asserter only, R-23) |
| `TARGETS` | retired | — |  | D5: therapeutic target = Condition (D2) or Target; captured purpose is targetKeys, disease intent is an Assertion |
| `TARGETS_CONDITION` | retired | — | R-88 | D5: disease intent is an Assertion (INTENDED_FOR_TARGET is for goals; indication is D8 HAS_APPROVED_INDICATION, R-88) |
| `TESTED_SAMPLE` | merged | [QUALITY_RESULT_FOR](../relationships/QUALITY_RESULT_FOR.md) |  | D8: QUALITY_RESULT_FOR: Replaces SAMPLE_FROM, TESTED_SAMPLE, PRODUCED_RESULT, INTERPRETS_TESTING_OF and SUMMARIZES_TESTING |
| `TEXT_OF_SNAPSHOT` | merged | [CHUNK_OF](../relationships/CHUNK_OF.md) |  | D9: CHUNK_OF: Replaces pinned HAS_CHUNK, FROM_TEXT_VERSION, HAS_TEXT_VERSION, TEXT_OF_SNAPSHOT, HAS_SEGMENTATION (text version and segmentation are chunk properties) |
| `TRACKS_METRIC` | carried-by-pattern | [STEP_USES](../relationships/STEP_USES.md) |  | D5: pinned numeric Target and MeasurementPlan absorbed into ProtocolStep threshold properties + STEP_USES -> Metric |
| `TRIGGERED_BY` | merged | [DERIVED_FROM](../relationships/DERIVED_FROM.md) |  | D3: kernel DERIVED_FROM + Assessment.evidenceCutoffAt + supersedesUid |
| `UNDER_LEGAL_BASIS` | retired | — |  | D8: pathway is an enum, legal basis a citation string; no question traverses a pathway node |
| `UNDER_LEGAL_BASIS_VERSION` | retired | — |  | D8: pathway is an enum, legal basis a citation string; no question traverses a pathway node |
| `UNDER_PATHWAY` | retired | — |  | D8: pathway is an enum, legal basis a citation string; no question traverses a pathway node |
| `UNIT_FROM_LOT` | retired | — |  | D6: IndividualUnit dropped; a tested unit's lot is D8 (Lot, QualityResult) ‖ D8: no public source for individual units; commerce matching is a D6 EQUIVALENCE assessment |
| `USED` | carried-by-pattern | [ASSESSES](../relationships/ASSESSES.md), [DERIVED_FROM](../relationships/DERIVED_FROM.md) |  | K: PROV used; the claim a mission tests is Activity ASSESSES Claim, inputs of judgments are DERIVED_FROM; no question traverses generic usage |
| `USED_METHOD` | carried-by-pattern | [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md), [ISSUED_BY](../relationships/ISSUED_BY.md), [MEASURES_ANALYTE](../relationships/MEASURES_ANALYTE.md), [QUALITY_RESULT_FOR](../relationships/QUALITY_RESULT_FOR.md) |  | D8: W12 test chain collapsed into one QualityResult row (QUALITY_RESULT_FOR, MEASURES_ANALYTE, ISSUED_BY); SUPPORTED_BY is kernel HAS_EVIDENCE |
| `USES` | merged | [STEP_USES](../relationships/STEP_USES.md) |  | D5: merged into STEP_USES (union 6); instruments are D6 Products, measured quantities D4 Metrics |
| `USES_COMPONENT` | unmapped | — |  | see unmappedEdges (DECISIONS.md 'Seven unmapped legacy relationships') |
| `USES_EQUIPMENT` | retired | — | R-68 | D4: D8 manufacturing / D3 study equipment; no D4 question ‖ D7: manufacturing and supply roles; predicate-only in every module, under the one name set D7 registers in predicateOnly (MANUFACTURES, CON… |
| `USES_INTERVENTION_DEVICE` | merged | [ADMINISTERS](../relationships/ADMINISTERS.md) | R-72 | D3: ADMINISTERS: Replaces pinned USES_INTERVENTION_MATERIAL, USES_INTERVENTION_DEVICE and FOLLOWS_INTERVENTION_DEFINITION |
| `USES_INTERVENTION_MATERIAL` | merged | [ADMINISTERS](../relationships/ADMINISTERS.md) |  | D3: ADMINISTERS: Replaces pinned USES_INTERVENTION_MATERIAL, USES_INTERVENTION_DEVICE and FOLLOWS_INTERVENTION_DEFINITION |
| `USES_MATERIAL` | merged | [DECLARES_COMPONENT](../relationships/DECLARES_COMPONENT.md) |  | D6: merged into DECLARES_COMPONENT (target D1 IngredientMaterial) |
| `USES_METHOD` | retired | — |  | D4: MeasurementMethod is the MethodPrinciple enum + methodText |
| `USES_MODALITY` | retired | — |  | D4: Device.sensingModalities |
| `USES_PLATFORM` | retired | — | R-68 | D4: platform enum (AssayVersion.platform, AlgorithmVersion.inputPlatforms) ‖ D7: device/platform roles; D4 (predicate-only unless D4 promotes) |
| `USES_SERVING_DEFINITION` | retired | — |  | D6: serving fields on LabelVersion |
| `USES_SUBSCRIPTION_PLAN` | retired | — |  | D6: SubscriptionPlan → Offer.purchaseMode, subscriptionTermsVerbatim, subscriptionApp + OFFER_SUBSCRIPTION_TERMS predicate |
| `USES_THRESHOLD_SOURCE` | merged | [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) |  | D3: kernel HAS_EVIDENCE (role CONTEXT) on the interpretation Assessment |
| `VARIANT_OF` | predicate-only | predicate [VARIANT_OF](../predicates/VARIANT_OF.md) |  | D12: a source publishes base ↔ variant links as data (FoodEx2 facets, FNDDS inputFoods) and a question traverses variant chains across many foods; then a typed edge with AssertedRecordedProperties |
| `VERSION_OF_ALGORITHM` | retired | — |  | D4: Algorithm family merged into AlgorithmVersion.algorithmFamily/familyKey |
| `VERSION_OF_SPECIFICATION` | retired | — |  | D8: specifications are not nodes; the criterion printed beside a result is inline on QualityResult, a regulator's specification is text on its record |
| `VISUALIZES` | retired | — |  | D9: W22 media graph cut; regions are kernel BOUNDING_BOX locators, depiction is predicate-only, label regions are D6 + kernel locators |
| `VISUALIZES_TRAVERSAL` | retired | — |  | D9: W22 media graph cut; regions are kernel BOUNDING_BOX locators, depiction is predicate-only, label regions are D6 + kernel locators |
| `WAS_ASSOCIATED_WITH` | kept | [WAS_ASSOCIATED_WITH](../relationships/WAS_ASSOCIATED_WITH.md) |  |  |
| `WAS_GENERATED_BY` | kept | [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) | R-23 | kernel (HAS_EVIDENCE -> SourceLocator, MENTIONS derived, Assertion.supersedesUid same asserter only, R-23) |
