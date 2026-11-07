---
id: "node:UseConstraint"
kind: "node"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D5.graphql#L499-L535","release:registers/node-register.yaml#UseConstraint","release:workspace-inputs/identity-rules.yaml#UseConstraint"]
aliases: ["use constraint","use-constraint","useconstraint","node:Constraint","Constraint"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:77ed8817695b3e22efc2899f535456d0a0af2ad492a9f165b9493873981dc3a7"
---
# UseConstraint

Purpose: the shared, stable identity of one scoped use concern, "use of S [above a dose band] [by a route] [in a jurisdiction] together with these scope members (population codes, D2 conditions, co-exposures)". Many sources state the same concern with different levels (a label: "must not be taken"; a clinic: "interaction"; a forum: deliberate use); each statement is a kernel Assertion (predicate USE_CONSTRAINED_IN | INTERACTS_WITH | HAS_UPPER_LIMIT, level in valueString, population in qualifiers) and resolves here by RESOLVES_TO_CONSTRAINT (derived, identity rule use-constraint-key/v2). Recommendations and answers cite its uid as the blocking constraint (CQ-RC-06; D10 ReportItem -BLOCKED_BY-> UseConstraint, declared by D10, R-75); an empty result means "no constraint recorded", never "safe". The subject means and the scope members are the subject and object of the resolving Assertions (kernel HAS_SUBJECT / HAS_OBJECT); they are not duplicated as typed edges here. It carries scope descriptors only (R-76): no level, verdict, direction-of-effect or "safe/unsafe" property; the level and the exposure change belong to each asserter (Assertion.valueString; qualifier exposureChange:<code>). It is a projection-minted grouping of safety Assertions: not a kernel Claim and never vetted (R-76; 09 D-17). A Claim's identity binds the predicate and the stated value, while one UseConstraint groups statements across three predicates and every level, and its typed dose band, scope and timing window are what Q-D5-06 / Q-D5-23 filter. Identity rule (use-constraint-key/v2): identityKeyHash = sha256(identityKey) where identityKey = canonical string of (kind, subject uid, sorted scope member uids and population codes, dose band, route, jurisdiction, timing window; empty components kept empty) under identityKeyVersion. v1 had no timing component (OQ-D5-29). uid token: `use-constraint`. Questions: Q-D5-03, Q-D5-04, Q-D5-05, Q-D5-06, Q-D5-09, Q-D5-11, Q-D5-21, Q-D5-23, CQ-RC-06, Q-D5-24, Q-D5-26.

## Identity

| | |
| --- | --- |
| id | `node:UseConstraint` · raw SDL [sdl:UseConstraint](../sdl/UseConstraint.graphql) |
| module / domain | [D5](../modules/D5.md) / [Interventions, protocols, safety, food and nutrition](../domains/exposures-and-interventions.md) |
| uid | `hu:use-constraint:<opaque>` |
| stored labels | `UseConstraint` `Entity` (primary `UseConstraint`) |
| archetype | Entity (shared identity; immutable identity key) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `identityKeyHash` + `identityKeyVersion` |
| identity keys | `uid`, `name`, `identityKeyHash`, `identityKeyVersion` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (21)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D5.graphql:L503 |
| `uid` | `String!` | yes | create+update |  | D5.graphql:L504 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D5.graphql:L505 |
| `lastWriterRunId` | `String` |  | create+update |  | D5.graphql:L507 |
| `constraintKind` | [UseConstraintKind](../vocabularies/UseConstraintKind.md) | yes | create+update |  | D5.graphql:L510 |
| `identityKey` | `String!` | yes | create+update | Canonical identity string (readable; contains the member uids and codes). | D5.graphql:L512 |
| `identityKeyHash` | `String!` | yes | create+update |  | D5.graphql:L513 |
| `identityKeyVersion` | `String!` | yes | create+update |  | D5.graphql:L514 |
| `scopePopulations` | [PopulationGroup](../vocabularies/PopulationGroup.md)[] |  | create+update | Population codes in scope (empty when the scope is a condition or a co-exposure only). | D5.graphql:L516 |
| `doseComparator` | [QuantityComparator](../vocabularies/QuantityComparator.md) |  | create+update | DOSE_LIMIT only: the dose band the concern starts at (350 mg/day supplemental magnesium -> GT 350 mg PER_DAY SUPPLEMENTAL_ONLY). D1 QuantityComparato… | D5.graphql:L518 |
| `doseValue` | `Float` |  | create+update |  | D5.graphql:L519 |
| `doseUnit` | `String` |  | create+update |  | D5.graphql:L520 |
| `dosePeriod` | [AmountBasis](../vocabularies/AmountBasis.md) |  | create+update | Time basis of the dose band (D6 AmountBasis, R-58). | D5.graphql:L522 |
| `intakeScope` | [IntakeScope](../vocabularies/IntakeScope.md) |  | create+update |  | D5.graphql:L523 |
| `route` | `String` |  | create+update |  | D5.graphql:L524 |
| `timingWindow` | `String` |  | create+update | TIMING only: the window relative to an anchor in ISO 8601 durations ('BEDTIME-PT10H/BEDTIME-PT8H' = from 10 h to 8 h before bedtime; 'PT2H' = 2 h sep… | D5.graphql:L526 |
| `jurisdiction` | `String` |  | create+update | ISO 3166 code when the concern is jurisdiction-specific. | D5.graphql:L528 |
| `summary` | `String` |  | create+update |  | D5.graphql:L529 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D5.graphql:L508 |
| `updatedAt` | `DateTime` |  | create+update |  | D5.graphql:L509 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D5.graphql:L506 |

## Outgoing relationships (2)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:UseConstraint --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (13)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

| type | from | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [ASSERTED_BY](../relationships/ASSERTED_BY.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.assertedBy (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assessment](Assessment.md) | structural | recorded-only |  | Assessment.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Report](Report.md) | structural | recorded-only |  | Report.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ReportItem](ReportItem.md) | structural | recorded-only |  | ReportItem.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSOCIATES](../relationships/ASSOCIATES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Association](Association.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Association.members (OUT) | read-only |
| [BLOCKED_BY](../relationships/BLOCKED_BY.md) | [ReportItem](ReportItem.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ReportItem.blockedBy (OUT) | `edge.structural` |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [RESOLVES_TO_CONSTRAINT](../relationships/RESOLVES_TO_CONSTRAINT.md) | [Assertion](Assertion.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | UseConstraint.resolvedFrom (IN) | read-only |
| [STATES_CONSTRAINT](../relationships/STATES_CONSTRAINT.md) | [ProtocolStep](ProtocolStep.md) | derived | recorded-only (derivedAt) | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | ProtocolStep.statesConstraints (OUT) | read-only |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (2)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a UseConstraint are Assertions with it as subject: `(:UseConstraint)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (2)

- [D10/Q-D10-08](../patterns/D10/Q-D10-08.md) (supported; Q-D10-08)
- [QP/P-07](../patterns/QP/P-07.md) (supported; CQ-RC-06, Q-D10-08, Q-D10-24, Q-D5-02, Q-D5-06, Q-D5-07)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`
- Policy: create only; never update or delete (packet: create true, update false, delete false)
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `node:UseConstraint` is unchanged from v1.
- `node:Constraint` (merged): D5: UseConstraint

## Source definition

- `release:sdl/modules/D5.graphql#L499-L535`
- `release:registers/node-register.yaml#UseConstraint`
- `release:workspace-inputs/identity-rules.yaml#UseConstraint`
