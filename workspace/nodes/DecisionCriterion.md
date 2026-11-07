---
id: "node:DecisionCriterion"
kind: "node"
module: "D10"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D10.graphql#L113-L167","release:registers/node-register.yaml#DecisionCriterion","release:workspace-inputs/identity-rules.yaml#DecisionCriterion"]
aliases: ["decision criterion","decision-criterion","decisioncriterion"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:40126b3602a98142dfec4fc517f0234fa050a34a6cc329d62d9cfb1ccec7abde"
---
# DecisionCriterion

Purpose: one versioned criterion of a ranking or comparison method ("elemental magnesium per maximum daily dose", "block if the daily dose exceeds the supplemental upper limit stated for the population", Labdoor's "Label Accuracy" weight). A ranking is a function of (candidate set, criteria set @ version, inputs as recorded at R); the criteria are the only stored part of an unpublished ranking (Q-D10-01 is computed at query time from them). Criteria of a third-party ranker are DecisionCriterion records too, so two rankings can be compared criterion by criterion (Q-D10-11); the ranker's method statement is a kernel Assertion whose subject is the criterion. The publisher is reached through the criterion set's authorizing Assertion: ASSERTED_BY the publisher for a third-party criterion, or WAS_GENERATED_BY the BellLabs Activity for our own (Q-D10-10); `publisherUid` is only a cache of it (R-46). A criteria set is the group of records sharing (criteriaSetKey, criteriaSetVersion); no separate node. Identity rule: (criterionKey, version); a changed definition, weight, input predicate or direction is a new version naming `supersedesUid`; nothing is edited after publication. uid token: `decision-criterion` (hu:decision-criterion:<opaque>). Questions: CQ-RC-01, CQ-RC-02, CQ-RC-07, Q-D10-01, Q-D10-02, Q-D10-10, Q-D10-11, Q-D10-22.

## Identity

| | |
| --- | --- |
| id | `node:DecisionCriterion` · raw SDL [sdl:DecisionCriterion](../sdl/DecisionCriterion.graphql) |
| module / domain | [D10](../modules/D10.md) / [Derived knowledge, reports, rankings and recommendations](../domains/derived-knowledge-and-reports.md) |
| uid | `hu:decision-criterion:<opaque>` |
| stored labels | `DecisionCriterion` `Entity` (primary `DecisionCriterion`) |
| archetype | Entity |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `criterionKey` + `version` |
| identity keys | `uid`, `name`, `criterionKey`, `version` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (30)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D10.graphql:L117 |
| `uid` | `String!` | yes | create+update |  | D10.graphql:L118 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D10.graphql:L119 |
| `lastWriterRunId` | `String` |  | create+update |  | D10.graphql:L121 |
| `criterionKey` | `String!` | yes | create+update | Stable controlled key shared by all versions (e.g. bl:mg-sleep:elemental-mg-per-max-daily-dose). | D10.graphql:L125 |
| `version` | `String!` | yes | create+update | Version of this criterion; part of identity. | D10.graphql:L127 |
| `criteriaSetKey` | `String!` | yes | create+update | Ranking method family this criterion belongs to (e.g. bl:compare:mg-forms-for-sleep, labdoor:score). | D10.graphql:L129 |
| `criteriaSetVersion` | `String!` | yes | create+update |  | D10.graphql:L130 |
| `criterionKind` | [CriterionKind](../vocabularies/CriterionKind.md) | yes | create+update |  | D10.graphql:L131 |
| `direction` | [CriterionDirection](../vocabularies/CriterionDirection.md) | yes | create+update |  | D10.graphql:L132 |
| `weight` | `Float` |  | create+update | Weight inside its criteria set (SCORE criteria); null for BLOCK, FILTER, TIEBREAK. | D10.graphql:L134 |
| `evaluationOrder` | `Int` |  | create+update | Tie-break or evaluation order inside the set. | D10.graphql:L136 |
| `definition` | `String!` | yes | create+update | Human-readable definition, as published. | D10.graphql:L138 |
| `rule` | `String` |  | create+update | Machine rule (expression over input values) the comparison engine evaluates; versioned with the criterion. | D10.graphql:L140 |
| `inputPredicates` | `[String!]` |  | create+update | Registered Assertion.predicate values the criterion reads (e.g. DECLARES_COMPONENT, IMPROVES_TARGET, HAS_UPPER_LIMIT; vocabularies/predicates.yaml). | D10.graphql:L142 |
| `inputAssessmentKinds` | `[String!]` |  | create+update | Assessment kinds/subkinds the criterion reads (e.g. EVIDENCE_SYNTHESIS/D10.strength). | D10.graphql:L144 |
| `valueUnitCode` | `String` |  | create+update | UCUM unit of the criterion value when it is a quantity. | D10.graphql:L146 |
| `targetKeys` | `[String!]` |  | create+update | D5 Target keys the criteria set serves (shared vocabulary targets@0.2.2, e.g. target:sleep); a property, not an edge (the acknowledged exception OQ-D… | D10.graphql:L148 |
| `publisherUid` | `String` |  | create+update | Cache only (R-45, R-46, MD-D10-06): uid of the Organization or Agent that defines the criterion (BellLabs, or a third-party ranker). The authority is… | D10.graphql:L150 |
| `publisherUidMethodVersion` | `String` |  | create+update | Provenance stamp of the publisherUid cache (MD-D10-06): versioned derivation method that computed it (e.g. bl-cache/decision-criterion-publisher@1). | D10.graphql:L152 |
| `publisherUidDerivedAt` | `DateTime` |  | create+update | Provenance stamp of the publisherUid cache (MD-D10-06): when the executor derived it from its authority. | D10.graphql:L154 |
| `publisherUidAuthorityUid` | `String` |  | create+update | Provenance stamp of the publisherUid cache (MD-D10-06): uid of the authorizing Assertion (third-party criterion) or Activity (BellLabs criterion) the… | D10.graphql:L156 |
| `supersedesUid` | `String` |  | create+update |  | D10.graphql:L162 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D10.graphql:L122 |
| `updatedAt` | `DateTime` |  | create+update |  | D10.graphql:L123 |
| `validFrom` | `DateTime` |  | create+update | Policy validity of the criterion version as BellLabs applies it (e.g. from a ranker's method change date), not world valid time (R-24). | D10.graphql:L158 |
| `validTo` | `DateTime` |  | create+update |  | D10.graphql:L159 |
| `recordedAt` | `DateTime!` | yes | create+update |  | D10.graphql:L160 |
| `recordedTo` | `DateTime` |  | create+update |  | D10.graphql:L161 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D10.graphql:L120 |

## Outgoing relationships (2)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:DecisionCriterion --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
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
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |
| [USES_CRITERION](../relationships/USES_CRITERION.md) | [Report](Report.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | DecisionCriterion.usedByReports (IN) | `edge.structural` |

## Legal predicates (3)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [USES_RANKING_CRITERION](../predicates/USES_RANKING_CRITERION.md) | subject | literal | literal | D10 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a DecisionCriterion are Assertions with it as subject: `(:DecisionCriterion)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **bitemporal**.
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (3)

- [QP/P-05a](../patterns/QP/P-05a.md) (supported; CQ-RC-01, CQ-RC-02, CQ-RC-03, CQ-RC-07, Q-D1-19, Q-D10-01, Q-D10-02, Q-D10-13, Q-D6-03)
- [QP/P-05b](../patterns/QP/P-05b.md) (supported; CQ-RC-01, CQ-RC-02, CQ-RC-03, CQ-RC-07, Q-D1-19, Q-D10-01, Q-D10-02, Q-D10-13, Q-D6-03)
- [QP/P-05c](../patterns/QP/P-05c.md) (supported; CQ-RC-01, CQ-RC-02, CQ-RC-03, CQ-RC-07, Q-D1-19, Q-D10-01, Q-D10-02, Q-D10-13, Q-D6-03)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`
- Policy: create (node.upsert); a new version is a new node naming supersedesUid; never update or delete
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `node:DecisionCriterion` is unchanged from v1.
(none)

## Source definition

- `release:sdl/modules/D10.graphql#L113-L167`
- `release:registers/node-register.yaml#DecisionCriterion`
- `release:workspace-inputs/identity-rules.yaml#DecisionCriterion`
