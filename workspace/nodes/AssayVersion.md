---
id: "node:AssayVersion"
kind: "node"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L431-L463","release:registers/node-register.yaml#AssayVersion","release:workspace-inputs/identity-rules.yaml#AssayVersion"]
aliases: ["assay version","assay-version","assayversion","node:MeasurementMethod","node:ReferenceSystem","node:Specimen","node:TechnologyPlatform","MeasurementMethod","ReferenceSystem","Specimen","TechnologyPlatform"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:f373fb8e5a1f6a8ddf39955c310ae9437fc52d46be5fc82f2aa9e1f365a0fa43"
---
# AssayVersion

Purpose: how one laboratory ran one measurement procedure — performing lab (exactly one), method principle, instrument model, reagent kit, software version, specimen types, calibration traceability, reported unit — each field null and listed in `notReported` when the source is silent. The unit a comparability judgment (kernel Assessment, subkind D4.comparability) is about; absorbs pinned MeasurementMethod, Specimen and ReferenceSystem as properties and the instrument as text. Identity rule: payloadHash over the identity fields plus the performing lab uid; when any identity field is NOT_REPORTED the capture's snapshot digest joins the hash, so two NOT_REPORTED versions never merge. uid token: `assay-version`. Questions: CQ-DX-01, CQ-DX-03, CQ-DX-06, CQ-AX-21, Q-D4-02, Q-D4-11, Q-D4-19, Q-D4-23.

## Identity

| | |
| --- | --- |
| id | `node:AssayVersion` · raw SDL [sdl:AssayVersion](../sdl/AssayVersion.graphql) |
| module / domain | [D4](../modules/D4.md) / [Diagnostics, biomarkers, measurement and devices](../domains/diagnostics-and-devices.md) |
| uid | `hu:assay-version:<opaque>` |
| stored labels | `AssayVersion` `Entity` (primary `AssayVersion`) |
| archetype | Entity & Subjectable (versioned state; insert-only) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `payloadHash (identity fields + performing lab uid; + snapshot digest when any identity field is NOT_REPORTED)` |
| identity keys | `uid`, `name` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (19)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D4.graphql:L435 |
| `uid` | `String!` | yes | create+update |  | D4.graphql:L436 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D4.graphql:L437 |
| `lastWriterRunId` | `String` |  | create+update |  | D4.graphql:L439 |
| `methodPrinciple` | [MethodPrinciple](../vocabularies/MethodPrinciple.md) |  | create+update |  | D4.graphql:L442 |
| `methodText` | `String` |  | create+update | Method as written (e.g. 'Turbidimetric Inhibition Immunoassay', 'Roche Tina Quant'). | D4.graphql:L444 |
| `instrumentModelText` | `String` |  | create+update |  | D4.graphql:L445 |
| `reagentKitText` | `String` |  | create+update | Reagent kit / package insert as written (e.g. 'Tina-quant Hemoglobin A1c Gen.3'). | D4.graphql:L447 |
| `softwareVersion` | `String` |  | create+update |  | D4.graphql:L448 |
| `platform` | [MeasurementPlatform](../vocabularies/MeasurementPlatform.md) |  | create+update |  | D4.graphql:L449 |
| `specimenKinds` | [SpecimenKind](../vocabularies/SpecimenKind.md)[] |  | create+update |  | D4.graphql:L450 |
| `specimenOntologyIds` | `[String!]` |  | create+update | UBERON / CL ids of the specimen compartment(s); equality with Metric.systemOntologyId and D2 contexts. | D4.graphql:L452 |
| `calibrationTraceability` | [CalibrationTraceability](../vocabularies/CalibrationTraceability.md) |  | create+update |  | D4.graphql:L453 |
| `reportedUnitCode` | `String` |  | create+update | UCUM code of the unit the lab reports. | D4.graphql:L455 |
| `notReported` | [MeasurementField](../vocabularies/MeasurementField.md)[] |  | create+update |  | D4.graphql:L456 |
| `payloadHash` | `String!` | yes | create+update | sha256:<hex> identity digest (see Identity rule). | D4.graphql:L458 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D4.graphql:L440 |
| `updatedAt` | `DateTime` |  | create+update |  | D4.graphql:L441 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D4.graphql:L438 |

## Outgoing relationships (3)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:AssayVersion --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [PERFORMED_BY_LAB](../relationships/PERFORMED_BY_LAB.md) | [Organization](Organization.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | AssayVersion.performingLab (OUT) | `edge.assert` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (12)

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
| [INTERVAL_FOR](../relationships/INTERVAL_FOR.md) | [ReferenceIntervalVersion](ReferenceIntervalVersion.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ReferenceIntervalVersion.assayVersions (OUT) | `edge.structural` |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [PERFORMED_WITH_VERSION](../relationships/PERFORMED_WITH_VERSION.md) | [LabTest](LabTest.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | LabTest.assayVersions (OUT) | `edge.assert` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (11)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [CERTIFIED_TRACEABLE_TO](../predicates/CERTIFIED_TRACEABLE_TO.md) | subject | literal | literal | D4 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [FIELD_NOT_REPORTED](../predicates/FIELD_NOT_REPORTED.md) | subject | literal | literal | K |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [INTERFERES_WITH](../predicates/INTERFERES_WITH.md) | subject | literal | literal | D4 |
| [MEASURED_ON_INSTRUMENT](../predicates/MEASURED_ON_INSTRUMENT.md) | subject | relationship | assertion-only | D4 |
| [OUTCOME_MEASURED_WITH](../predicates/OUTCOME_MEASURED_WITH.md) | object | relationship | assertion-only | D3 |
| [PERFORMED_BY_LAB](../predicates/PERFORMED_BY_LAB.md) | subject | authorizing | typed-edge | D4 |
| [PERFORMED_WITH_VERSION](../predicates/PERFORMED_WITH_VERSION.md) | object | authorizing | typed-edge | D4 |
| [REPORTED_MEASUREMENT_ERROR](../predicates/REPORTED_MEASUREMENT_ERROR.md) | subject | literal | literal | D4 |
| [REPORTS_RELIABILITY](../predicates/REPORTS_RELIABILITY.md) | subject | literal | literal | D4 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a AssayVersion are Assertions with it as subject: `(:AssayVersion)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (1)

- [QP/P-12](../patterns/QP/P-12.md) (supported; Q-D1-08, Q-D2-02, Q-D2-03, Q-D4-01, Q-D4-17)

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

- `node:AssayVersion` is unchanged from v1.
- `node:MeasurementMethod` (merged): D4: AssayVersion
- `node:ReferenceSystem` (merged): D4: AssayVersion
- `node:Specimen` (merged): D4: AssayVersion
- `node:TechnologyPlatform` (merged): D4: AssayVersion

## Source definition

- `release:sdl/modules/D4.graphql#L431-L463`
- `release:registers/node-register.yaml#AssayVersion`
- `release:workspace-inputs/identity-rules.yaml#AssayVersion`
