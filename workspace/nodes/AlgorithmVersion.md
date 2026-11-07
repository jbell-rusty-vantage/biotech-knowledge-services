---
id: "node:AlgorithmVersion"
kind: "node"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L475-L520","release:registers/node-register.yaml#AlgorithmVersion","release:workspace-inputs/identity-rules.yaml#AlgorithmVersion"]
aliases: ["algorithm version","algorithm-version","algorithmversion","node:Algorithm","node:FirmwareVersion","Algorithm","FirmwareVersion"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert"]
cardDigest: "sha256:83b8b5167027126e4ec6281663df67b8ccddfe5159d6ecd62a5ace371daed110"
---
# AlgorithmVersion

Purpose: one fixed realization of a clock, risk score, wearable score, signal-processing or firmware build: the publication reference version (DunedinPACE, Belsky 2022), a vendor implementation ('DunedinPACE™' in TruAge, version not stated), a device software state pinned by a vendor change date (WHOOP heart-rate algorithm of 2026-07-06, CHANGE_EVENT_UNLABELED), or an unversioned service endpoint pinned by retrieval date. Absorbs the pinned Algorithm family (`algorithmFamily`, `familyKey`) and FirmwareVersion (algorithmKind FIRMWARE). Identity rule: (familyKey, realization, versionLabel) when a label exists; else (familyKey, realization, issuer, versionPinnedAt) with versionBasis saying why. uid token: `algorithm-version`. Questions: CQ-DX-02, CQ-DX-04, CQ-DX-05, CQ-DX-07, CQ-DX-09, Q-D4-04, Q-D4-05, Q-D4-06, Q-D4-14, Q-D4-15, Q-D4-20, Q-D4-23, Q-D4-26.

## Identity

| | |
| --- | --- |
| id | `node:AlgorithmVersion` · raw SDL [sdl:AlgorithmVersion](../sdl/AlgorithmVersion.graphql) |
| module / domain | [D4](../modules/D4.md) / [Diagnostics, biomarkers, measurement and devices](../domains/diagnostics-and-devices.md) |
| uid | `hu:algorithm-version:<opaque>` |
| stored labels | `AlgorithmVersion` `Entity` (primary `AlgorithmVersion`) |
| archetype | Entity & Subjectable (versioned state; insert-only) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `(familyKey, realization, versionLabel)` + `else (familyKey, realization, issuer, versionPinnedAt) with versionBasis` |
| identity keys | `uid`, `name` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (20)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D4.graphql:L479 |
| `uid` | `String!` | yes | create+update |  | D4.graphql:L480 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D4.graphql:L481 |
| `lastWriterRunId` | `String` |  | create+update |  | D4.graphql:L483 |
| `algorithmFamily` | `String!` | yes | create+update | Family name as sources write it (DunedinPACE, GrimAge, InnerAge, WHOOP heart rate). | D4.graphql:L487 |
| `familyKey` | `String!` | yes | create+update | Normalized family slug (dunedinpace, grimage, innerage); questions group and filter by family. | D4.graphql:L489 |
| `algorithmKind` | [AlgorithmKind](../vocabularies/AlgorithmKind.md) | yes | create+update |  | D4.graphql:L490 |
| `realization` | [AlgorithmRealization](../vocabularies/AlgorithmRealization.md) | yes | create+update |  | D4.graphql:L491 |
| `versionLabel` | `String` |  | create+update |  | D4.graphql:L492 |
| `versionBasis` | [AlgorithmVersionBasis](../vocabularies/AlgorithmVersionBasis.md) | yes | create+update |  | D4.graphql:L493 |
| `versionPinnedAt` | `Date` |  | create+update | Source-stated date of the change or release that pins this version (payload, not query validity). | D4.graphql:L495 |
| `outputKind` | [AlgorithmOutputKind](../vocabularies/AlgorithmOutputKind.md) |  | create+update |  | D4.graphql:L496 |
| `inputPlatforms` | [MeasurementPlatform](../vocabularies/MeasurementPlatform.md)[] |  | create+update |  | D4.graphql:L497 |
| `inputFeatureCount` | `Int` |  | create+update | Number of input features (173 CpG sites for DunedinPACE). | D4.graphql:L499 |
| `trainingPopulationText` | `String` |  | create+update |  | D4.graphql:L500 |
| `componentLabel` | `String` |  | create+update | Component a device software state applies to (heart rate, sleep staging, firmware). | D4.graphql:L502 |
| `notReported` | [MeasurementField](../vocabularies/MeasurementField.md)[] |  | create+update |  | D4.graphql:L503 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D4.graphql:L484 |
| `updatedAt` | `DateTime` |  | create+update |  | D4.graphql:L485 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D4.graphql:L482 |

## Outgoing relationships (6)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:AlgorithmVersion --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [DERIVED_FROM_ALGORITHM_VERSION](../relationships/DERIVED_FROM_ALGORITHM_VERSION.md) | [AlgorithmVersion](AlgorithmVersion.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | AlgorithmVersion.derivedFrom (OUT) | `edge.assert` |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [OUTPUTS_METRIC](../relationships/OUTPUTS_METRIC.md) | [Metric](Metric.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | AlgorithmVersion.outputs (OUT) | `edge.structural` |
| [REQUIRES_INPUT_METRIC](../relationships/REQUIRES_INPUT_METRIC.md) | [Metric](Metric.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | AlgorithmVersion.inputs (OUT) | `edge.structural` |
| [RUNS_ON_DEVICE](../relationships/RUNS_ON_DEVICE.md) | [Device](Device.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | AlgorithmVersion.devices (OUT) | `edge.assert` |
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
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [PERFORMED_WITH_VERSION](../relationships/PERFORMED_WITH_VERSION.md) | [LabTest](LabTest.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | LabTest.algorithmVersions (OUT) | `edge.assert` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (15)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [DEFINITION_CHANGED](../predicates/DEFINITION_CHANGED.md) | subject | literal | literal | D4 |
| [DERIVED_FROM_ALGORITHM_VERSION](../predicates/DERIVED_FROM_ALGORITHM_VERSION.md) | subject+object | authorizing | typed-edge | D4 |
| [DEVELOPED_WITH](../predicates/DEVELOPED_WITH.md) | subject | relationship | assertion-only | D4 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [FIELD_NOT_REPORTED](../predicates/FIELD_NOT_REPORTED.md) | subject | literal | literal | K |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [IMPLEMENTS_PUBLICATION](../predicates/IMPLEMENTS_PUBLICATION.md) | subject | relationship | assertion-only | D4 |
| [INPUT_FEATURE_COUNT](../predicates/INPUT_FEATURE_COUNT.md) | subject | field | field | D4 |
| [INPUT_PLATFORMS](../predicates/INPUT_PLATFORMS.md) | subject | field | field | D4 |
| [OUTCOME_MEASURED_WITH](../predicates/OUTCOME_MEASURED_WITH.md) | object | relationship | assertion-only | D3 |
| [PERFORMED_WITH_VERSION](../predicates/PERFORMED_WITH_VERSION.md) | object | authorizing | typed-edge | D4 |
| [REPORTS_INPUT_SET](../predicates/REPORTS_INPUT_SET.md) | subject | literal | literal | D4 |
| [REPORTS_RELIABILITY](../predicates/REPORTS_RELIABILITY.md) | subject | literal | literal | D4 |
| [REQUIRES_INPUT_METRIC](../predicates/REQUIRES_INPUT_METRIC.md) | subject | authorizing | typed-edge | D4 |
| [RUNS_ON_DEVICE](../predicates/RUNS_ON_DEVICE.md) | subject | authorizing | typed-edge | D4 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a AlgorithmVersion are Assertions with it as subject: `(:AlgorithmVersion)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (0)

(none)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`
- Policy: create only (insert-only versioned state)
- Proposal kinds: `node.upsert`
- Fields a source may explicitly not report: `METHOD_PRINCIPLE`, `INSTRUMENT_MODEL`, `REAGENT_KIT`, `SOFTWARE_VERSION`, `SPECIMEN`, `CALIBRATION_TRACEABILITY`, `PERFORMING_LAB`, `UNIT`, `MEASURAND_SYSTEM`, `METRIC_METHOD`, `VERSION_LABEL`, `INPUT_PLATFORM`, `INPUT_FEATURES`, `TRAINING_POPULATION`, `RELIABILITY`, `INTERVAL_DERIVATION`, `INTERVAL_PARTITION`, `EFFECTIVE_DATE`, `FIRMWARE_VERSION`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `node:AlgorithmVersion` is unchanged from v1.
- `node:Algorithm` (merged): D4: AlgorithmVersion
- `node:FirmwareVersion` (merged): D4: AlgorithmVersion

## Source definition

- `release:sdl/modules/D4.graphql#L475-L520`
- `release:registers/node-register.yaml#AlgorithmVersion`
- `release:workspace-inputs/identity-rules.yaml#AlgorithmVersion`
