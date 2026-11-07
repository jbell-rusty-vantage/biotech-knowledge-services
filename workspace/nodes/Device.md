---
id: "node:Device"
kind: "node"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L583-L606","release:registers/node-register.yaml#Device","release:workspace-inputs/identity-rules.yaml#Device"]
aliases: ["device","node:Modality","node:Sensor","node:ToolOrInstrument","Modality","Sensor","ToolOrInstrument"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:7d6b6feec1db8aa824e5bbe7f642729275e85792005994a3731d78b99637f4cb"
---
# Device

Purpose: a device or instrument MODEL as its maker designates it, in its role as a measuring instrument (Oura Ring Gen3, WHOOP MG, Dexcom G7, FreeStyle Libre 3 sensor, Roche cobas c513, Illumina iScan). Software states attach by RUNS_ON_DEVICE episodes; the purchasable item is a D6 Product (DELIVERS); clearances, recalls and adverse-event records are D8 records about that Product (D8 CONCERNS / STATUS_OF -> Product), reached from here through DELIVERS. Absorbs pinned ToolOrInstrument, Modality, Sensor and TechnologyPlatform as enums. Identity rule: (maker, model designation, generation); UDI-DI / 510(k) numbers attach through the kernel (schemes UDI_DI, FDA_510K requested). uid token: `device`. Questions: CQ-DX-09, Q-D4-07, Q-D4-08, Q-D4-09, Q-D4-10, Q-D4-17, Q-D4-18, Q-D4-24.

## Identity

| | |
| --- | --- |
| id | `node:Device` · raw SDL [sdl:Device](../sdl/Device.graphql) |
| module / domain | [D4](../modules/D4.md) / [Diagnostics, biomarkers, measurement and devices](../domains/diagnostics-and-devices.md) |
| uid | `hu:device:<opaque>` |
| stored labels | `Device` `Entity` (primary `Device`) |
| archetype | Entity & Subjectable |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `(maker, model designation, generation)` |
| identity keys | `uid`, `name` |
| identifier schemes | `UDI_DI` (active), `FDA_510K` (active), `FDA_PRODUCT_CODE` (disabled) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (13)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D4.graphql:L587 |
| `uid` | `String!` | yes | create+update |  | D4.graphql:L588 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D4.graphql:L589 |
| `lastWriterRunId` | `String` |  | create+update |  | D4.graphql:L591 |
| `deviceKind` | [DeviceKind](../vocabularies/DeviceKind.md) | yes | create+update |  | D4.graphql:L594 |
| `sensingModalities` | [SensingModality](../vocabularies/SensingModality.md)[] |  | create+update |  | D4.graphql:L595 |
| `deviceFamily` | `String` |  | create+update | Model family as written (Oura Ring, WHOOP, FreeStyle Libre). | D4.graphql:L597 |
| `generationLabel` | `String` |  | create+update |  | D4.graphql:L598 |
| `makerName` | `String` |  | create+update | Maker as written on the source (identity of the Organization is a D6/D7 join). | D4.graphql:L600 |
| `notReported` | [MeasurementField](../vocabularies/MeasurementField.md)[] |  | create+update |  | D4.graphql:L601 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D4.graphql:L592 |
| `updatedAt` | `DateTime` |  | create+update |  | D4.graphql:L593 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D4.graphql:L590 |

## Outgoing relationships (2)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Device --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
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
| [DELIVERS](../relationships/DELIVERS.md) | [Product](Product.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Device.products (IN) | `edge.assert` |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [RUNS_ON_DEVICE](../relationships/RUNS_ON_DEVICE.md) | [AlgorithmVersion](AlgorithmVersion.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | AlgorithmVersion.devices (OUT) | `edge.assert` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (11)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [CLAIMS_TO_MEASURE](../predicates/CLAIMS_TO_MEASURE.md) | subject | relationship | assertion-only | D4 |
| [DELIVERS](../predicates/DELIVERS.md) | object | authorizing | typed-edge | D4 |
| [DISCLAIMS_DIAGNOSTIC_USE](../predicates/DISCLAIMS_DIAGNOSTIC_USE.md) | subject | literal | literal | D4 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [INTENDED_FOR_TARGET](../predicates/INTENDED_FOR_TARGET.md) | subject | relationship | assertion-only | D5 |
| [INTERFERES_WITH](../predicates/INTERFERES_WITH.md) | subject | literal | literal | D4 |
| [MEASURED_ON_INSTRUMENT](../predicates/MEASURED_ON_INSTRUMENT.md) | object | relationship | assertion-only | D4 |
| [RECOMMENDS_USE](../predicates/RECOMMENDS_USE.md) | subject | literal | literal | D9 |
| [REPORTED_MEASUREMENT_ERROR](../predicates/REPORTED_MEASUREMENT_ERROR.md) | subject | literal | literal | D4 |
| [RUNS_ON_DEVICE](../predicates/RUNS_ON_DEVICE.md) | object | authorizing | typed-edge | D4 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a Device are Assertions with it as subject: `(:Device)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (1)

- [D8/Q-D8-23](../patterns/D8/Q-D8-23.md) (supported; Q-D8-23)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update descriptive fields; never delete
- Proposal kinds: `node.upsert`, `identifier.attach`
- Fields a source may explicitly not report: `METHOD_PRINCIPLE`, `INSTRUMENT_MODEL`, `REAGENT_KIT`, `SOFTWARE_VERSION`, `SPECIMEN`, `CALIBRATION_TRACEABILITY`, `PERFORMING_LAB`, `UNIT`, `MEASURAND_SYSTEM`, `METRIC_METHOD`, `VERSION_LABEL`, `INPUT_PLATFORM`, `INPUT_FEATURES`, `TRAINING_POPULATION`, `RELIABILITY`, `INTERVAL_DERIVATION`, `INTERVAL_PARTITION`, `EFFECTIVE_DATE`, `FIRMWARE_VERSION`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

- `HOLDS_ROLE` does NOT imply `RECOMMENDS_USE`
- `RECEIVES_VALUE_FROM` does NOT imply `RECOMMENDS_USE`
- `CONTENT_SPONSORED_BY` does NOT imply `RECOMMENDS_USE`

## Tasks

(none)

## v1 navigation aliases

- `node:Device` is unchanged from v1.
- `node:Modality` (merged): D4: Device
- `node:Sensor` (merged): D4: Device
- `node:ToolOrInstrument` (merged): D4: Device

## Source definition

- `release:sdl/modules/D4.graphql#L583-L606`
- `release:registers/node-register.yaml#Device`
- `release:workspace-inputs/identity-rules.yaml#Device`
