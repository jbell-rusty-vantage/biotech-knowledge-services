---
id: "node:ProtocolEdition"
kind: "node"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D5.graphql#L353-L382","release:registers/node-register.yaml#ProtocolEdition","release:workspace-inputs/identity-rules.yaml#ProtocolEdition"]
aliases: ["protocol edition","protocol-edition","protocoledition"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:4dc45c7c26284718150fc19cbe989778a5a28952bf6f915af7c4a3f4703636d8"
---
# ProtocolEdition

Purpose: the immutable content of one observed or published state of a Protocol: its ordered steps (with their doses, timing, stated constraints, stated targets and review rules). Pages are versioned in place and their displayed date can stay unchanged while content changes (Huberman 2021 vs 2026), so an edition is minted only when the canonical step payload changes (`payloadHash`: hash over the steps' own fields, including the caution fields statedLevel and conditionText, never over UseConstraint uids, which a projection-rule bump may re-mint); disclosure or sponsor changes do NOT mint an edition (D7 interest assertions with valid time carry them; 11-open-questions OQ-D5-08). Which edition was current when lives on the HAS_EDITION episode, not on this node. Implements Subjectable because applicability assessments (CQ-EV-04) and stated-purpose assertions (INTENDED_FOR_TARGET) are about an edition. Identity rule: (protocol, payloadHash). uid token: `protocol-edition` (hu:protocol-edition:<opaque>). Questions: Q-D5-10, CQ-PR-01, CQ-PR-02, Q-D5-11, Q-D5-13, CQ-EV-04.

## Identity

| | |
| --- | --- |
| id | `node:ProtocolEdition` · raw SDL [sdl:ProtocolEdition](../sdl/ProtocolEdition.graphql) |
| module / domain | [D5](../modules/D5.md) / [Interventions, protocols, safety, food and nutrition](../domains/exposures-and-interventions.md) |
| uid | `hu:protocol-edition:<opaque>` |
| stored labels | `ProtocolEdition` `Entity` (primary `ProtocolEdition`) |
| archetype | VersionedState (Subjectable, because assessments and INTENDED_FOR_TARGET assertions are about it; R-18) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `protocolUid` + `payloadHash` |
| identity keys | `uid`, `name`, `payloadHash` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (16)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D5.graphql:L357 |
| `uid` | `String!` | yes | create+update |  | D5.graphql:L358 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D5.graphql:L359 |
| `lastWriterRunId` | `String` |  | create+update |  | D5.graphql:L361 |
| `payloadHash` | `String!` | yes | create+update | sha256:<hex> over the canonical step payload (sorted by stepKey; payloadCanonicalizationVersion). | D5.graphql:L365 |
| `payloadCanonicalizationVersion` | `String` |  | create+update |  | D5.graphql:L366 |
| `stepKeyAlignmentVersion` | `String` |  | create+update | Version of the stepKey alignment rule used to carry stepKeys across in-place editions (OPEN-QUESTIONS P2-4). | D5.graphql:L368 |
| `changeProvenance` | [ProtocolChangeProvenance](../vocabularies/ProtocolChangeProvenance.md) | yes | create+update |  | D5.graphql:L369 |
| `editionLabel` | `String` |  | create+update | Publisher's edition label when one exists. | D5.graphql:L371 |
| `displayedDateText` | `String` |  | create+update | The date the page displays, verbatim ('September 20, 2021'); never used as valid time without corroboration. | D5.graphql:L373 |
| `firstObservedAt` | `DateTime` |  | create+update | First and last capture in which this payload was observed (snapshot retrievedAt); unobserved gaps stay unknown. | D5.graphql:L375 |
| `lastObservedAt` | `DateTime` |  | create+update |  | D5.graphql:L376 |
| `stepCount` | `Int` |  | create+update |  | D5.graphql:L377 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D5.graphql:L362 |
| `updatedAt` | `DateTime` |  | create+update |  | D5.graphql:L363 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D5.graphql:L360 |

## Outgoing relationships (3)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:ProtocolEdition --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [HAS_STEP](../relationships/HAS_STEP.md) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolEdition.steps (OUT) | `edge.structural` |
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
| [HAS_EDITION](../relationships/HAS_EDITION.md) | [Protocol](Protocol.md) | asserted | episode, exclusive | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | Protocol.editions (OUT) | `state.attach` |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (5)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [AUTHORED_BY](../predicates/AUTHORED_BY.md) | subject | relationship | assertion-only | D3 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_EDITION](../predicates/HAS_EDITION.md) | object | authorizing | typed-edge | D5 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [INTENDED_FOR_TARGET](../predicates/INTENDED_FOR_TARGET.md) | subject | relationship | assertion-only | D5 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a ProtocolEdition are Assertions with it as subject: `(:ProtocolEdition)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (3)

- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported; Q-D5-13)
- [D5/Q-D5-17](../patterns/D5/Q-D5-17.md) (supported; Q-D5-17)
- [QP/G-9#1](../patterns/QP/G-9--1.md) (unsupported; Q-D5-19)

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

- `node:ProtocolEdition` is unchanged from v1.
(none)

## Source definition

- `release:sdl/modules/D5.graphql#L353-L382`
- `release:registers/node-register.yaml#ProtocolEdition`
- `release:workspace-inputs/identity-rules.yaml#ProtocolEdition`
