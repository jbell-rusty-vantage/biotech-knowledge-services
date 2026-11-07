# Proposal matrix (biotech-knowledge-intent.v2)

Each proposal is one fact. Choose the kind by what the source states, then check the target type's executor operations
and the relationship class below. These tables are generated from the pinned release (register `executorOps`, relationship
register classes, projection gates); the release wins over any prose here.

## Proposal kinds

| Kind | Use for | Required fields (beyond `proposalId`, `kind`) | Evidence | Grant |
| --- | --- | --- | --- | --- |
| `node.upsert` | set descriptive properties of a subject (create or update per executorOps) | `subjectRef`, `properties` | `fieldEvidence {field: [locator]}` for FIELD-predicate properties (each gets its own Assertion); `asserterRef` names who states them | none |
| `identifier.attach` | an identifier of a subject (one identifier identifies at most one Subjectable, R-42) | `subjectRef`, `identifier {scheme, issuer, value}` | `evidence` | none |
| `edge.assert` | a relation with a typed asserted edge: an episode with valid time | `relationshipType`, `fromRef`, `toRef`, `assertion {validity}` | `evidence` (≥ 1 SUPPORTS) | none |
| `edge.close` | end an open episode (later source shows it ended) | `relationshipUid`, `reason` | optional | none |
| `edge.structural` | containment / composition (HAS_VARIANT, HAS_PACKAGE, ...) | `relationshipType`, `fromRef`, `toRef` | none (structural) | none |
| `assertion.relate` | a registered relationship predicate with an object but no typed edge (predicate-only), or a claim occurrence | `subjectRef`, `objectRef`, `assertion {predicate, validity}` | `evidence` | none |
| `assertion.literal` | a scalar value stated (or calculated) about a subject | `subjectRef`, `assertion {predicate, validity}`, `value {valueString / valueNumber + unitCode / valueBoolean ...}` (exactly one typed literal) | `evidence` | none |
| `assessment.record` | a structured assessment (VETTING, APPLICABILITY, RESOLUTION, ...) | `assessmentKind`, `about`, `methodVersion`, `inputs` | `evidence` with roles | `assessment.accept` for `status: ACCEPTED` |
| `mention.stage` | a surface form you cannot resolve yet (held for identity work) | `locator`, `surfaceForm` | the locator | none |
| `lineage.start` | open the lineage of a claim / mission (ties the run to what it is about) | `about` | none | none |
| `adjudication` | deliver a sealed verification result | `verificationRef {ref, digest}` | custody | `adjudication.deliver` |
| `report.publish` | publish an evidence report or (biotech-schema-v2.2.0) a `STUDY_APPRAISAL` that ASSESSES the appraised study | report fields, `about`, citations; optional Knowledge Services binding `reportRevisionRef`, `reportSchema`, `reportKindRef` (`<kind>@<semver>`), `structuredBodyDigest`, `supersedesReportRevisionRef`, `custodyKind` | cited locators | `report.publish` |
| `projection.write` | derived edges and associations from a trusted job | `projection {target, ...}` | derivation inputs | `projection.write` |

Assertion core (`assertion`): `predicate` (registered; aliases are rewritten, retired predicates are refused with
their replacement), `speechAct` (STATES default), `polarity` (POSITIVE / NEGATIVE; a NEGATIVE edge assertion is
recorded without an edge), `basisKind` (`CALCULATED` requires `derivation {rule, from}`), `qualifiers` (registered
prefixes only, `prefix:value` or `prefix=value`), `assertionKind: CLAIM` + `claimType` + `occurrenceOf {claimRef}`,
`supersedes {uid}` (same asserter corrects itself), `validity {validFrom, validTo, validFromPrecision, validFromBasis,
validObservedAt, statedAsOf}`.

## Separations that matter

- FIELD fact vs relation: a property with a FIELD predicate (`MAX_DAILY_SERVINGS` for `LabelVersion.maxDailyServings`)
  goes through `node.upsert` + `fieldEvidence`; a relation between two things is `edge.assert` / `assertion.relate`.
- Typed edge vs predicate-only: if the relationship register has an asserted type for the predicate, use `edge.assert`;
  otherwise `assertion.relate` records the Assertion with subject and object and no edge.
- Structural vs asserted: structural edges carry no assertion and no valid time.
- Derived outputs: never `edge.assert`; only `projection.write` by a principal with the grant.
- Source-stated vs calculated quantity: a label's "600 mg per day" is the label's statement; your 2 × 300 mg is
  `basisKind: CALCULATED` with `derivation.from` naming the inputs.
- Unknown stays unknown: omit the field, use the release's explicit unknown member only where the source says nothing
  and the field is a required kind (recorded as not stated), or hold the proposal.

<!-- generated from release biotech-schema-v2.2.0 (sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74) by WriteSchema; node and relationship tables re-checked equal to the v2.2.0 WriteSchema on 2026-10-25 (69 node types, 106 relationship types, identical executor ops); do not edit by hand -->

### Node types

| Node type | uid token | Executor ops (release) | Subject? | Notes |
| --- | --- | --- | --- | --- |
| Activity | `activity` | create, update | resolved only | kernel record: written by proposal kinds, never declared as a subject |
| Adjudication | `adjudication` | close, create | resolved only | kernel record: written by proposal kinds, never declared as a subject |
| Agent | `agent` | create | new / resolved |  |
| AlgorithmVersion | `algorithm-version` | create | new / resolved |  |
| AssayVersion | `assay-version` | create | new / resolved |  |
| Assertion | `assertion` | close, create | resolved only | kernel record: written by proposal kinds, never declared as a subject |
| Assessment | `assessment` | close, create | resolved only | kernel record: written by proposal kinds, never declared as a subject |
| Association | `association` | close, create, delete-unreferenced | resolved only | projection Activity only (projection.write) |
| Award | `award` | create, update | new / resolved |  |
| Biomarker | `biomarker` | create, update | new / resolved |  |
| Brand | `brand` | create, update | new / resolved |  |
| CaptureAttempt | `capture-attempt` | create | resolved only | kernel record: written by proposal kinds, never declared as a subject |
| CertificationListing | `cert-listing` | create, update | new / resolved |  |
| Channel | `channel` | create, update | new / resolved |  |
| ChemicalSubstance | `substance` | create, update | new / resolved |  |
| Chunk | `chunk` | create, delete | resolved only | projection Activity only (projection.write) |
| Claim | `claim` | create, update | new / resolved | update limited to lifecycleState, latestVerdict, refinesClaimUid |
| Condition | `condition` | create, update | new / resolved |  |
| Constituent | `constituent` | create, update | new / resolved |  |
| DecisionCriterion | `decision-criterion` | create | new / resolved |  |
| Device | `device` | create, update | new / resolved |  |
| DietaryPattern | `dietary-pattern` | create, update | new / resolved |  |
| Event | `event` | create, update | new / resolved |  |
| FoodCategory | `food-category` | create, update | new / resolved |  |
| FoodItem | `food` | create, update | new / resolved |  |
| Frontier | `frontier` | create, update | new / resolved |  |
| Identifier | `identifier` | create | resolved only | kernel record: written by proposal kinds, never declared as a subject |
| IngredientMaterial | `material` | create, update | new / resolved |  |
| Intervention | `intervention` | create, update | new / resolved |  |
| InterventionComponent | `intervention-component` | create, update | new / resolved |  |
| LabTest | `lab-test` | create, update | new / resolved |  |
| LabelVersion | `label-version` | create, update | new / resolved |  |
| LegalStatus | `legal-status` | create | new / resolved |  |
| Lot | `lot` | create, update | new / resolved |  |
| Mechanism | `mechanism` | create, update | new / resolved |  |
| MechanismEvidenceContext | `mech-context` | create | new / resolved |  |
| MediaWork | `media-work` | create, update | new / resolved |  |
| MerchantListing | `listing` | create, update | new / resolved |  |
| Metric | `metric` | create, update | new / resolved |  |
| MolecularEntity | `molecular-entity` | create, update | new / resolved |  |
| Offer | `offer` | create, update | new / resolved |  |
| Organization | `org` | create, update | new / resolved |  |
| Outcome | `outcome` | create, update | new / resolved |  |
| OutcomeDefinition | `outcome-definition` | create, update | new / resolved |  |
| Package | `package` | create, update | new / resolved |  |
| Patent | `patent` | create, update | new / resolved |  |
| Person | `person` | create, update | new / resolved |  |
| Product | `product` | create, update | new / resolved |  |
| ProductVariant | `product-variant` | create, update | new / resolved |  |
| Protocol | `protocol` | create, update | new / resolved |  |
| ProtocolEdition | `protocol-edition` | create | new / resolved |  |
| ProtocolStep | `protocol-step` | create | new / resolved |  |
| Publication | `publication` | create, update | new / resolved |  |
| QualityResult | `quality-result` | create, update | new / resolved |  |
| ReferenceIntervalVersion | `ri-version` | create | new / resolved |  |
| RegistrationVersion | `registration-version` | create | new / resolved |  |
| RegulatoryRecord | `reg-record` | create, update | new / resolved |  |
| Report | `report` | close, create | resolved only | kernel record: written by proposal kinds, never declared as a subject |
| ReportItem | `report-item` | create | resolved only | kernel record: written by proposal kinds, never declared as a subject |
| Source | `source` | create, update | new / resolved | update limited to logicalIdentity, genre |
| SourceLocator | `locator` | create | resolved only | kernel record: written by proposal kinds, never declared as a subject |
| SourceSnapshot | `snapshot` | create | resolved only | kernel record: written by proposal kinds, never declared as a subject |
| Study | `study` | create, update | new / resolved |  |
| StudyArm | `study-arm` | create, update | new / resolved |  |
| StudyPopulation | `study-population` | create, update | new / resolved |  |
| StudyResult | `study-result` | create | new / resolved |  |
| Target | `target` | create, update | new / resolved |  |
| Taxon | `taxon` | create, update | new / resolved |  |
| UseConstraint | `use-constraint` | create | new / resolved |  |

### Relationship types

| Relationship type | Class | Exclusive slot | Gate | Proposal kind |
| --- | --- | --- | --- | --- |
| ADDRESSED_TO | asserted | no |  | edge.assert / edge.close |
| ADMINISTERS | asserted | no |  | edge.assert / edge.close |
| AFFECTS_MECHANISM | derived | no |  | projection.write (derived) |
| APPEARS_IN | asserted | no |  | edge.assert / edge.close |
| ASSERTED_BY | structural | no |  | executor-owned (written by the compiler) |
| ASSESSES | structural | no |  | executor-owned (written by the compiler) |
| ASSIGNED_TO | asserted | no |  | edge.assert / edge.close |
| ASSOCIATES | derived | no |  | projection.write (derived) |
| AWARDED_BY | asserted | no |  | edge.assert / edge.close |
| AWARDED_TO | asserted | no |  | edge.assert / edge.close |
| BLOCKED_BY | structural | no |  | edge.structural |
| BRANDED_AS | asserted | no |  | edge.assert / edge.close |
| CHUNK_OF | structural | no |  | edge.structural |
| CONCERNS | asserted | no |  | edge.assert / edge.close |
| CONTENT_SPONSORED_BY | asserted | no |  | edge.assert / edge.close |
| COUNTS_TOWARD_NUTRIENT | asserted | no |  | edge.assert / edge.close |
| COVERS | asserted | no |  | edge.assert / edge.close |
| COVERS_LOCATOR | derived | no |  | projection.write (derived) |
| DECLARES_COMPONENT | asserted | no |  | edge.assert / edge.close |
| DELIVERS | asserted | no |  | edge.assert / edge.close |
| DERIVED_FROM | structural | no |  | executor-owned (written by the compiler) |
| DERIVED_FROM_ALGORITHM_VERSION | asserted | no |  | edge.assert / edge.close |
| DERIVED_FROM_TAXON | asserted | no |  | edge.assert / edge.close |
| DOCUMENTED_BY_RECORD | asserted | no |  | edge.assert / edge.close |
| EXPOSED_TO | structural | no |  | edge.structural |
| FOOD_CONTAINS | asserted | no |  | edge.assert / edge.close |
| HAS_ACTIVE_MOIETY | asserted | no |  | edge.assert / edge.close |
| HAS_ANALYTE | structural | no |  | edge.structural |
| HAS_ARM | structural | no |  | edge.structural |
| HAS_COMPONENT | structural | no |  | edge.structural |
| HAS_EDITION | asserted | yes |  | edge.assert / edge.close |
| HAS_EVIDENCE | structural | no |  | executor-owned (written by the compiler) |
| HAS_IDENTIFIER | asserted | no |  | executor-owned (written by the compiler) |
| HAS_ITEM | structural | no |  | executor-owned (written by the compiler) |
| HAS_LABEL_VERSION | asserted | yes |  | edge.assert / edge.close |
| HAS_LOCATOR | structural | no |  | executor-owned (written by the compiler) |
| HAS_OBJECT | structural | no |  | executor-owned (written by the compiler) |
| HAS_OFFER | structural | no |  | edge.structural |
| HAS_OUTCOME | structural | no |  | edge.structural |
| HAS_PACKAGE | structural | no |  | edge.structural |
| HAS_POPULATION | structural | no |  | edge.structural |
| HAS_REFERENCE_FOOD | asserted | no |  | edge.assert / edge.close |
| HAS_REGISTRATION_VERSION | asserted | yes |  | edge.assert / edge.close |
| HAS_SNAPSHOT | structural | no |  | executor-owned (written by the compiler) |
| HAS_STEP | structural | no |  | edge.structural |
| HAS_STUDY_ROLE | asserted | no |  | edge.assert / edge.close |
| HAS_SUBJECT | structural | no |  | executor-owned (written by the compiler) |
| HAS_VARIANT | structural | no |  | edge.structural |
| HOLDS_ROLE | asserted | no |  | edge.assert / edge.close |
| HOLDS_STAKE | asserted | no |  | edge.assert / edge.close |
| INCLUDES_TEST | asserted | no |  | edge.assert / edge.close |
| INTERVAL_FOR | structural | no |  | edge.structural |
| INVESTIGATES | asserted | no |  | edge.assert / edge.close |
| INVOLVES | asserted | no |  | edge.assert / edge.close |
| IN_FOOD_CATEGORY | asserted | no |  | edge.assert / edge.close |
| IN_STUDY_ARM | structural | no |  | edge.structural |
| ISSUED_BY | asserted | no |  | edge.assert / edge.close |
| LEADS_TO | asserted | no | SUPPORT | edge.assert / edge.close |
| LICENSED_TO | asserted | no |  | edge.assert / edge.close |
| LISTING_FOR | asserted | no |  | edge.assert / edge.close |
| LOT_OF | asserted | no |  | edge.assert / edge.close |
| MATERIAL_CONTAINS | asserted | no |  | edge.assert / edge.close |
| MEASURES | asserted | no |  | edge.assert / edge.close |
| MEASURES_ANALYTE | asserted | no |  | edge.assert / edge.close |
| MEASURES_METRIC | asserted | no |  | edge.assert / edge.close |
| MENTIONS | derived | no |  | projection.write (derived) |
| NAMES_RESPONSIBLE_PARTY | asserted | no |  | edge.assert / edge.close |
| OBSERVED_IN_CONTEXT | structural | no |  | edge.structural |
| OCCURRENCE_OF | structural | no |  | executor-owned (written by the compiler) |
| OCCURS_IN | structural | no |  | executor-owned (written by the compiler) |
| ON_FRONTIER | asserted | no |  | edge.assert / edge.close |
| OPERATIONALIZED_BY | asserted | no |  | edge.assert / edge.close |
| OUTPUTS_METRIC | structural | no |  | edge.structural |
| OWNS_BRAND | asserted | no |  | edge.assert / edge.close |
| PARENT_OF | asserted | no |  | edge.assert / edge.close |
| PARENT_TAXON | asserted | no |  | edge.assert / edge.close |
| PARTICIPATES_IN | asserted | no |  | edge.assert / edge.close |
| PART_OF_MECHANISM | asserted | no |  | edge.assert / edge.close |
| PATTERN_COMPONENT | asserted | no |  | edge.assert / edge.close |
| PERFORMED_BY_LAB | asserted | no |  | edge.assert / edge.close |
| PERFORMED_WITH_VERSION | asserted | no |  | edge.assert / edge.close |
| PUBLISHES | structural | no |  | edge.structural |
| QUALITY_RESULT_FOR | asserted | no |  | edge.assert / edge.close |
| QUANTIFIES | structural | no |  | edge.structural |
| REALIZES_SUBSTANCE | asserted | no |  | edge.assert / edge.close |
| RECEIVES_VALUE_FROM | asserted | no |  | edge.assert / edge.close |
| REFLECTS_MECHANISM | asserted | no |  | edge.assert / edge.close |
| RENDITION_OF | asserted | no |  | edge.assert / edge.close |
| REPORTS_ON | asserted | no |  | edge.assert / edge.close |
| REQUIRES_INPUT_METRIC | structural | no |  | edge.structural |
| RESOLVES_TO_CONSTRAINT | derived | no |  | projection.write (derived) |
| RESPONDS_TO | asserted | no | SUPPORT | edge.assert / edge.close |
| RESULT_FOR | structural | no |  | edge.structural |
| RESULT_FOR_ARM | structural | no |  | edge.structural |
| REVISES | asserted | no |  | edge.assert / edge.close |
| RUNS_ON_DEVICE | asserted | no |  | edge.assert / edge.close |
| SELLER_OF_RECORD | asserted | no |  | edge.assert / edge.close |
| STATED_IN | asserted | no |  | edge.assert / edge.close |
| STATES_CONSTRAINT | derived | no |  | projection.write (derived) |
| STATUS_FROM | asserted | no |  | edge.assert / edge.close |
| STATUS_OF | asserted | no |  | edge.assert / edge.close |
| STEP_USES | structural | no |  | edge.structural |
| USES_CRITERION | structural | no |  | edge.structural |
| WAS_ASSOCIATED_WITH | structural | no |  | executor-owned (written by the compiler) |
| WAS_GENERATED_BY | structural | no |  | executor-owned (written by the compiler) |
| WAS_INFORMED_BY | structural | no |  | executor-owned (written by the compiler) |
