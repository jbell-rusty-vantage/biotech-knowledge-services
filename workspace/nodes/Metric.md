---
id: "node:Metric"
kind: "node"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L330-L368","release:registers/node-register.yaml#Metric","release:workspace-inputs/identity-rules.yaml#Metric"]
aliases: ["metric"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:53b69586b50074edc753ee8b37e09378a2ba6c95f0af76d8dc6d81802ef94e48"
---
# Metric

Purpose: the measurand or feature definition — what exactly a number is: LOINC 4548-4 (HbA1c mass fraction in blood), 'NAD+ in red blood cells (µM)', WHOOP 'hrv_rmssd_milli', Apple 'heartRateVariabilitySDNN', 'DunedinPACE pace of aging'. Compartment (`systemOntologyId`) and method (`methodText`: RMSSD vs SDNN) live here, so two measurements are comparable only if they share a Metric (or a COMPARABLE_WITH_CONVERSION assessment links them). Identity rule: LOINC code when one exists (kernel Identifier, scheme LOINC); else (definitionSource, definitionIssuerName, verbatim name, canonicalUnitCode). uid token: `metric`. Questions: CQ-DX-01, CQ-DX-02, Q-D4-01, Q-D4-02, Q-D4-07, Q-D4-16, Q-D4-17, Q-D4-21, Q-D4-22, Q-D4-26.

## Identity

| | |
| --- | --- |
| id | `node:Metric` · raw SDL [sdl:Metric](../sdl/Metric.graphql) |
| module / domain | [D4](../modules/D4.md) / [Diagnostics, biomarkers, measurement and devices](../domains/diagnostics-and-devices.md) |
| uid | `hu:metric:<opaque>` |
| stored labels | `Metric` `Entity` (primary `Metric`) |
| archetype | Entity & Subjectable (definition node) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `LOINC code via kernel Identifier when one exists` + `else (definitionSource, definitionIssuerName, verbatim name, canonicalUnitCode)` |
| identity keys | `uid`, `name` |
| identifier schemes | `LOINC` (active) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (21)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D4.graphql:L334 |
| `uid` | `String!` | yes | create+update |  | D4.graphql:L335 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D4.graphql:L336 |
| `lastWriterRunId` | `String` |  | create+update |  | D4.graphql:L338 |
| `metricKind` | [MetricKind](../vocabularies/MetricKind.md) | yes | create+update |  | D4.graphql:L341 |
| `defaultResultKind` | [DiagnosticResultKind](../vocabularies/DiagnosticResultKind.md) | yes | create+update |  | D4.graphql:L342 |
| `definitionSource` | [MetricDefinitionSource](../vocabularies/MetricDefinitionSource.md) | yes | create+update |  | D4.graphql:L343 |
| `definitionIssuerName` | `String` |  | create+update | Issuer named by the definition (LOINC, WHOOP, Apple, Belsky et al. 2022, BellLabs); presentation and identity only. | D4.graphql:L345 |
| `definitionText` | `String` |  | create+update | Verbatim definition text from the defining source. | D4.graphql:L347 |
| `propertyText` | `String` |  | create+update | LOINC property (e.g. MFr, SCnc) or the source's equivalent. | D4.graphql:L349 |
| `systemText` | `String` |  | create+update | LOINC system / compartment as written (Bld, RBC, PBMC, Ser/Plas, wrist skin). | D4.graphql:L351 |
| `systemOntologyId` | `String` |  | create+update | UBERON / CL id of the compartment (e.g. CL:0000232 erythrocyte, CL:0000842 PBMC); equality join with D2 contexts. | D4.graphql:L353 |
| `scale` | [MetricScale](../vocabularies/MetricScale.md) |  | create+update |  | D4.graphql:L354 |
| `timeAspect` | `String` |  | create+update | LOINC time aspect or window (Pt, night, 24H). | D4.graphql:L356 |
| `methodText` | `String` |  | create+update | Method inside the definition when it changes the number (RMSSD, SDNN, NGSP %, IFCC mmol/mol). | D4.graphql:L358 |
| `canonicalUnitCode` | `String` |  | create+update | UCUM code of the canonical unit. | D4.graphql:L360 |
| `notReported` | [MeasurementField](../vocabularies/MeasurementField.md)[] |  | create+update |  | D4.graphql:L361 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D4.graphql:L339 |
| `updatedAt` | `DateTime` |  | create+update |  | D4.graphql:L340 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D4.graphql:L337 |

### Search (derived, never evidence)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `searchText` | `String` |  | create+update | Names, LOINC long/short/consumer names, vendor field names and definition text for fulltext and vector linking (Q-D4-22). | D4.graphql:L363 |

## Outgoing relationships (3)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Metric --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [QUANTIFIES](../relationships/QUANTIFIES.md) | [Biomarker](Biomarker.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | Metric.quantifies (OUT) | `edge.structural` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (16)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

| type | from | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [ASSERTED_BY](../relationships/ASSERTED_BY.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.assertedBy (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assessment](Assessment.md) | structural | recorded-only |  | Assessment.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Report](Report.md) | structural | recorded-only |  | Report.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ReportItem](ReportItem.md) | structural | recorded-only |  | ReportItem.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSOCIATES](../relationships/ASSOCIATES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Association](Association.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Association.members (OUT) | read-only |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [INTERVAL_FOR](../relationships/INTERVAL_FOR.md) | [ReferenceIntervalVersion](ReferenceIntervalVersion.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ReferenceIntervalVersion.metrics (OUT) | `edge.structural` |
| [MEASURES](../relationships/MEASURES.md) | [OutcomeDefinition](OutcomeDefinition.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | OutcomeDefinition.measures (OUT) | `edge.assert` |
| [MEASURES_METRIC](../relationships/MEASURES_METRIC.md) | [LabTest](LabTest.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | LabTest.metrics (OUT) | `edge.assert` |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [OPERATIONALIZED_BY](../relationships/OPERATIONALIZED_BY.md) | [Target](Target.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Target.operationalizedBy (OUT) | `edge.assert` |
| [OUTPUTS_METRIC](../relationships/OUTPUTS_METRIC.md) | [AlgorithmVersion](AlgorithmVersion.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | AlgorithmVersion.outputs (OUT) | `edge.structural` |
| [REQUIRES_INPUT_METRIC](../relationships/REQUIRES_INPUT_METRIC.md) | [AlgorithmVersion](AlgorithmVersion.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | AlgorithmVersion.inputs (OUT) | `edge.structural` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (9)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [CLAIMS_TO_MEASURE](../predicates/CLAIMS_TO_MEASURE.md) | object | relationship | assertion-only | D4 |
| [DEFINITION_CHANGED](../predicates/DEFINITION_CHANGED.md) | subject | literal | literal | D4 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [FIELD_NOT_REPORTED](../predicates/FIELD_NOT_REPORTED.md) | subject | literal | literal | K |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [MEASURES](../predicates/MEASURES.md) | object | authorizing | typed-edge | D3 |
| [MEASURES_METRIC](../predicates/MEASURES_METRIC.md) | object | authorizing | typed-edge | D4 |
| [OPERATIONALIZED_BY](../predicates/OPERATIONALIZED_BY.md) | object | authorizing | typed-edge | D5 |
| [REQUIRES_INPUT_METRIC](../predicates/REQUIRES_INPUT_METRIC.md) | object | authorizing | typed-edge | D4 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a Metric are Assertions with it as subject: `(:Metric)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (2)

- [QP/G-7#1](../patterns/QP/G-7--1.md) (unsupported; Q-D4-25)
- [QP/P-12](../patterns/QP/P-12.md) (supported; Q-D1-08, Q-D2-02, Q-D2-03, Q-D4-01, Q-D4-17)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update descriptive fields; never delete
- Proposal kinds: `node.upsert`, `identifier.attach`
- Fields a source may explicitly not report: `METHOD_PRINCIPLE`, `INSTRUMENT_MODEL`, `REAGENT_KIT`, `SOFTWARE_VERSION`, `SPECIMEN`, `CALIBRATION_TRACEABILITY`, `PERFORMING_LAB`, `UNIT`, `MEASURAND_SYSTEM`, `METRIC_METHOD`, `VERSION_LABEL`, `INPUT_PLATFORM`, `INPUT_FEATURES`, `TRAINING_POPULATION`, `RELIABILITY`, `INTERVAL_DERIVATION`, `INTERVAL_PARTITION`, `EFFECTIVE_DATE`, `FIRMWARE_VERSION`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `node:Metric` is unchanged from v1.
(none)

## Source definition

- `release:sdl/modules/D4.graphql#L330-L368`
- `release:registers/node-register.yaml#Metric`
- `release:workspace-inputs/identity-rules.yaml#Metric`
