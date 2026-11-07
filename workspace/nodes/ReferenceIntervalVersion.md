---
id: "node:ReferenceIntervalVersion"
kind: "node"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L532-L572","release:registers/node-register.yaml#ReferenceIntervalVersion","release:workspace-inputs/identity-rules.yaml#ReferenceIntervalVersion"]
aliases: ["reference interval version","ri-version","referenceintervalversion","node:ReferenceRange","ReferenceRange"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert"]
cardDigest: "sha256:63541788c916251d0c407715731af1bed539663b5b3503a1f67d47ee6ab692e1"
---
# ReferenceIntervalVersion

Purpose: one interval or limit a laboratory or vendor applies for one Metric on one AssayVersion and one population partition, with its kind (reference interval, decision limit, guideline target, vendor 'optimal' target) and derivation (usually NOT_REPORTED), the verbatim interval text, and the source-stated effective period as payload. Absorbs the pinned legacy ReferenceRange (derivation NOT_REPORTED, partition as text). A Labcorp HbA1c page yields four of these from one list. Insert-only; a change is a new version. Identity rule: payloadHash over (assay version uid, metric uid, intervalKind, partition, bounds, unit, intervalText). uid token: `ri-version`. Questions: CQ-DX-06, Q-D4-12, Q-D4-02.

## Identity

| | |
| --- | --- |
| id | `node:ReferenceIntervalVersion` · raw SDL [sdl:ReferenceIntervalVersion](../sdl/ReferenceIntervalVersion.graphql) |
| module / domain | [D4](../modules/D4.md) / [Diagnostics, biomarkers, measurement and devices](../domains/diagnostics-and-devices.md) |
| uid | `hu:ri-version:<opaque>` |
| stored labels | `ReferenceIntervalVersion` `Entity` (primary `ReferenceIntervalVersion`) |
| archetype | Entity & Subjectable (versioned state; insert-only) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `payloadHash over (assay version uid` + `metric uid` + `intervalKind` + `partition` + `bounds` + `unit` + `intervalText)` |
| identity keys | `uid`, `name`, `intervalKind` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (23)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D4.graphql:L536 |
| `uid` | `String!` | yes | create+update |  | D4.graphql:L537 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D4.graphql:L538 |
| `lastWriterRunId` | `String` |  | create+update |  | D4.graphql:L540 |
| `intervalKind` | [ReferenceIntervalKind](../vocabularies/ReferenceIntervalKind.md) | yes | create+update |  | D4.graphql:L543 |
| `derivation` | [ReferenceIntervalDerivation](../vocabularies/ReferenceIntervalDerivation.md) | yes | create+update |  | D4.graphql:L544 |
| `intervalText` | `String!` | yes | create+update | Interval exactly as printed ('4.8% to 5.6%', 'Optimal 40–100 μM'). | D4.graphql:L546 |
| `lowerBound` | `Float` |  | create+update |  | D4.graphql:L547 |
| `upperBound` | `Float` |  | create+update |  | D4.graphql:L548 |
| `lowerInclusive` | `Boolean` |  | create+update |  | D4.graphql:L549 |
| `upperInclusive` | `Boolean` |  | create+update |  | D4.graphql:L550 |
| `unitCode` | `String` |  | create+update | UCUM code of the bounds. | D4.graphql:L552 |
| `sex` | [SexScope](../vocabularies/SexScope.md) |  | create+update | D3 population vocabulary (shared enum SexScope: ALL, FEMALE, MALE, NOT_REPORTED). | D4.graphql:L554 |
| `minAgeYears` | `Float` |  | create+update |  | D4.graphql:L555 |
| `maxAgeYears` | `Float` |  | create+update |  | D4.graphql:L556 |
| `partitionText` | `String` |  | create+update | Other partition as written (pregnancy, fasting state, ancestry). | D4.graphql:L558 |
| `effectiveFrom` | `Date` |  | create+update | Source-stated effective period (payload; query validity is the publishing source's snapshot time). | D4.graphql:L560 |
| `effectiveTo` | `Date` |  | create+update |  | D4.graphql:L561 |
| `notReported` | [MeasurementField](../vocabularies/MeasurementField.md)[] |  | create+update |  | D4.graphql:L562 |
| `payloadHash` | `String!` | yes | create+update |  | D4.graphql:L563 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D4.graphql:L541 |
| `updatedAt` | `DateTime` |  | create+update |  | D4.graphql:L542 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D4.graphql:L539 |

## Outgoing relationships (4)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:ReferenceIntervalVersion --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [INTERVAL_FOR](../relationships/INTERVAL_FOR.md) | [AssayVersion](AssayVersion.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ReferenceIntervalVersion.assayVersions (OUT) | `edge.structural` |
| [INTERVAL_FOR](../relationships/INTERVAL_FOR.md) | [Metric](Metric.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ReferenceIntervalVersion.metrics (OUT) | `edge.structural` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (10)

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
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (3)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [SETS_REFERENCE_RANGE](../predicates/SETS_REFERENCE_RANGE.md) | subject | literal | literal | D4 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a ReferenceIntervalVersion are Assertions with it as subject: `(:ReferenceIntervalVersion)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
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

- `node:ReferenceIntervalVersion` is unchanged from v1.
- `node:ReferenceRange` (merged): D4: ReferenceIntervalVersion

## Source definition

- `release:sdl/modules/D4.graphql#L532-L572`
- `release:registers/node-register.yaml#ReferenceIntervalVersion`
- `release:workspace-inputs/identity-rules.yaml#ReferenceIntervalVersion`
