---
id: "node:LabTest"
kind: "node"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L379-L418","release:registers/node-register.yaml#LabTest","release:workspace-inputs/identity-rules.yaml#LabTest"]
aliases: ["lab test","lab-test","labtest","node:PanelDefinition","PanelDefinition"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:21f235f0e91d53c66857252295f2d7e02ece2ced5097ea64cc3972fb76a552f5"
---
# LabTest

Purpose: the orderable or purchasable test as a laboratory or vendor offers it (Labcorp 001453 'Hemoglobin (Hb) A1c', Quest 496, Jinfiniti Intracellular NAD test, TruAge report). Panels are LabTests of kind PANEL that INCLUDE other LabTests (absorbs pinned PanelDefinition; composition changes are episodes). What it measures (MEASURES_METRIC) and how (PERFORMED_WITH_VERSION) change over time and are therefore episodes; price and offers are D6. Identity rule: (issuer, issuer's test code) via the kernel Identifier (scheme LAB_TEST_CODE, requested); else (issuer, verbatim test name). uid token: `lab-test`. Questions: CQ-DX-01, Q-D4-01, Q-D4-03, Q-D4-04, Q-D4-12, Q-D4-13, Q-D4-18, Q-D4-19, Q-D4-23, Q-D4-24, Q-D4-25.

## Identity

| | |
| --- | --- |
| id | `node:LabTest` · raw SDL [sdl:LabTest](../sdl/LabTest.graphql) |
| module / domain | [D4](../modules/D4.md) / [Diagnostics, biomarkers, measurement and devices](../domains/diagnostics-and-devices.md) |
| uid | `hu:lab-test:<opaque>` |
| stored labels | `LabTest` `Entity` (primary `LabTest`) |
| archetype | Entity & Subjectable |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `(issuer, issuer test code) via kernel Identifier scheme LAB_TEST_CODE (requested)` + `else (issuer, verbatim test name)` |
| identity keys | `uid`, `name` |
| identifier schemes | `LAB_TEST_CODE` (disabled), `CPT` (disabled) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (13)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D4.graphql:L383 |
| `uid` | `String!` | yes | create+update |  | D4.graphql:L384 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D4.graphql:L385 |
| `lastWriterRunId` | `String` |  | create+update |  | D4.graphql:L387 |
| `testKind` | [LabTestKind](../vocabularies/LabTestKind.md) | yes | create+update |  | D4.graphql:L390 |
| `orderChannel` | [OrderChannel](../vocabularies/OrderChannel.md) |  | create+update |  | D4.graphql:L391 |
| `collectionModes` | [CollectionMode](../vocabularies/CollectionMode.md)[] |  | create+update |  | D4.graphql:L392 |
| `specimenText` | `String` |  | create+update | Specimen requirements as written (tube, volume, container). | D4.graphql:L394 |
| `preAnalyticalText` | `String` |  | create+update | Patient preparation, stability and rejection criteria as written (Q-D4-19). | D4.graphql:L396 |
| `notReported` | [MeasurementField](../vocabularies/MeasurementField.md)[] |  | create+update |  | D4.graphql:L397 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D4.graphql:L388 |
| `updatedAt` | `DateTime` |  | create+update |  | D4.graphql:L389 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D4.graphql:L386 |

## Outgoing relationships (6)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:LabTest --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [INCLUDES_TEST](../relationships/INCLUDES_TEST.md) | [LabTest](LabTest.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | LabTest.components (OUT) | `edge.assert` |
| [MEASURES_METRIC](../relationships/MEASURES_METRIC.md) | [Metric](Metric.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | LabTest.metrics (OUT) | `edge.assert` |
| [PERFORMED_WITH_VERSION](../relationships/PERFORMED_WITH_VERSION.md) | [AlgorithmVersion](AlgorithmVersion.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | LabTest.algorithmVersions (OUT) | `edge.assert` |
| [PERFORMED_WITH_VERSION](../relationships/PERFORMED_WITH_VERSION.md) | [AssayVersion](AssayVersion.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | LabTest.assayVersions (OUT) | `edge.assert` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (11)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

| type | from | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [ASSERTED_BY](../relationships/ASSERTED_BY.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.assertedBy (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assessment](Assessment.md) | structural | recorded-only |  | Assessment.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Report](Report.md) | structural | recorded-only |  | Report.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ReportItem](ReportItem.md) | structural | recorded-only |  | ReportItem.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSOCIATES](../relationships/ASSOCIATES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Association](Association.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Association.members (OUT) | read-only |
| [DELIVERS](../relationships/DELIVERS.md) | [Product](Product.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | LabTest.products (IN) | `edge.assert` |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (10)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [CLAIMS_TO_MEASURE](../predicates/CLAIMS_TO_MEASURE.md) | subject | relationship | assertion-only | D4 |
| [DELIVERS](../predicates/DELIVERS.md) | object | authorizing | typed-edge | D4 |
| [DEVELOPED_WITH](../predicates/DEVELOPED_WITH.md) | subject | relationship | assertion-only | D4 |
| [DISCLAIMS_DIAGNOSTIC_USE](../predicates/DISCLAIMS_DIAGNOSTIC_USE.md) | subject | literal | literal | D4 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [INCLUDES_TEST](../predicates/INCLUDES_TEST.md) | subject+object | authorizing | typed-edge | D4 |
| [MEASURES_METRIC](../predicates/MEASURES_METRIC.md) | subject | authorizing | typed-edge | D4 |
| [PERFORMED_WITH_VERSION](../predicates/PERFORMED_WITH_VERSION.md) | subject | authorizing | typed-edge | D4 |
| [RECOMMENDS_RETEST_INTERVAL](../predicates/RECOMMENDS_RETEST_INTERVAL.md) | subject | literal | literal | D4 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a LabTest are Assertions with it as subject: `(:LabTest)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
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
- Proposal kinds: `node.upsert`
- Fields a source may explicitly not report: `METHOD_PRINCIPLE`, `INSTRUMENT_MODEL`, `REAGENT_KIT`, `SOFTWARE_VERSION`, `SPECIMEN`, `CALIBRATION_TRACEABILITY`, `PERFORMING_LAB`, `UNIT`, `MEASURAND_SYSTEM`, `METRIC_METHOD`, `VERSION_LABEL`, `INPUT_PLATFORM`, `INPUT_FEATURES`, `TRAINING_POPULATION`, `RELIABILITY`, `INTERVAL_DERIVATION`, `INTERVAL_PARTITION`, `EFFECTIVE_DATE`, `FIRMWARE_VERSION`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `node:LabTest` is unchanged from v1.
- `node:PanelDefinition` (merged): D4: LabTest

## Source definition

- `release:sdl/modules/D4.graphql#L379-L418`
- `release:registers/node-register.yaml#LabTest`
- `release:workspace-inputs/identity-rules.yaml#LabTest`
