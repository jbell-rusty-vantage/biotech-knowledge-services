---
id: "node:Association"
kind: "node"
module: "D10"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D10.graphql#L271-L314","release:registers/node-register.yaml#Association","release:workspace-inputs/identity-rules.yaml#Association"]
aliases: ["association"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:43480af196ec1ce14f05a343f74dc59b86e79092e33ff253ddae6b9aa31a7473"
---
# Association

Purpose: a regenerable score between two entities computed by a projection Activity under a method version (PLAN 6.1 "materialized"): evidence aggregate (compound X ↔ outcome or target Y with a per-evidence-kind breakdown), surveillance disproportionality signal, co-occurrence, similarity, link-prediction lead. It is a retrieval and ranking aid, never evidence, never a confidence, never an asserted edge between the two entities; any answer that uses it shows the method version and its inputs. BellLabs-computed only: an external score (Open Targets, a producer's FAERS statistic, a third-party ranking) is an Assertion by its producer and is never copied into an Association. It implements Entity only: no question makes an Association the subject of an Assertion or an Assessment (a signal interpretation ASSESSES the drug and the event and cites the signal's inputs). Only the projection job writes it (WAS_GENERATED_BY a PROJECTION Activity whose methodVersion equals `methodVersion`); a recompute writes a new record naming `supersedesUid` and closes the old one with `recordedTo`. A superseded Association is kept while any Report or ReportItem cites it; otherwise the projection job may remove it (R-48). The score lives on this node only, never on ASSOCIATES. Not Associations: discourse metrics (projection-cache properties on the measured node, R-49), rule-based per-record classifications (CALCULATED Assertions, the NOVA pattern, R-51). D2's derived AFFECTS_MECHANISM stays a traversal shortcut without a method score; Q-D2-18 ranks on EVIDENCE_AGGREGATE Associations (R-47). Identity rule: (associationKind, sorted member uids, methodVersion, inputSetDigest). uid token: `association` (hu:association:<opaque>). Questions: CQ-EV-02, CQ-AX-08, Q-D10-05, Q-D10-06, Q-D10-19.

## Identity

| | |
| --- | --- |
| id | `node:Association` · raw SDL [sdl:Association](../sdl/Association.graphql) |
| module / domain | [D10](../modules/D10.md) / [Derived knowledge, reports, rankings and recommendations](../domains/derived-knowledge-and-reports.md) |
| uid | `hu:association:<opaque>` |
| stored labels | `Association` (primary `Association`) |
| archetype | Entity |
| interfaces | [Entity](../interfaces/Entity.md) |
| identity rule (register) | `associationKind` + `memberUids` + `methodVersion` + `inputSetDigest` |
| identity keys | `uid`, `name`, `associationKind`, `methodVersion`, `inputSetDigest` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (22)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D10.graphql:L275 |
| `uid` | `String!` | yes | create+update |  | D10.graphql:L276 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D10.graphql:L277 |
| `lastWriterRunId` | `String` |  | create+update |  | D10.graphql:L279 |
| `associationKind` | [AssociationKind](../vocabularies/AssociationKind.md) | yes | create+update |  | D10.graphql:L282 |
| `anchorUid` | `String!` | yes | create+update | uid of the member the score is oriented from (exposure, drug, compound); the other member is the partner. For symmetric kinds, the lower uid. | D10.graphql:L284 |
| `score` | `Float!` | yes | create+update | The method's own score. Not a confidence, not a probability, not evidence (Open Targets states the same of its score). | D10.graphql:L286 |
| `components` | `[String!]` |  | create+update | Breakdown by evidence kind or data source, '<kind>=<value>' (e.g. literature=0.99, clinical=0.61). | D10.graphql:L288 |
| `statistic` | `String` |  | create+update | Named statistic for SIGNAL_DISPROPORTIONALITY (e.g. LLR, PRR, ROR), its value and the method's threshold. | D10.graphql:L290 |
| `statisticValue` | `Float` |  | create+update |  | D10.graphql:L291 |
| `threshold` | `Float` |  | create+update |  | D10.graphql:L292 |
| `inputCount` | `Int` |  | create+update | Number of input records (assertions, studies, reports) behind the score. | D10.graphql:L294 |
| `inputSetDigest` | `String!` | yes | create+update | sha256:<hex> over the sorted input uids and their contentHashes. | D10.graphql:L296 |
| `methodVersion` | `String!` | yes | create+update | Method and version (derivationRule), e.g. bl-assoc/evidence-aggregate@1, gds-nodesimilarity/jaccard@1. | D10.graphql:L298 |
| `computedAt` | `DateTime!` | yes | create+update |  | D10.graphql:L299 |
| `staleAfter` | `DateTime` |  | create+update | Staleness bound: after this time the record must be recomputed before an answer uses it. | D10.graphql:L301 |
| `supersedesUid` | `String` |  | create+update |  | D10.graphql:L304 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D10.graphql:L280 |
| `updatedAt` | `DateTime` |  | create+update |  | D10.graphql:L281 |
| `recordedAt` | `DateTime!` | yes | create+update |  | D10.graphql:L302 |
| `recordedTo` | `DateTime` |  | create+update |  | D10.graphql:L303 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D10.graphql:L278 |

## Outgoing relationships (3)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Association --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [ASSOCIATES](../relationships/ASSOCIATES.md) | [Subjectable](../interfaces/Subjectable.md) (56 members) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Association.members (OUT) | read-only |
| [DERIVED_FROM](../relationships/DERIVED_FROM.md) | [Assertion](Assertion.md) | structural | recorded-only |  | Association.inputs (OUT) | planner-emitted (kernel plumbing) |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (0)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

(none)

## Legal predicates (0)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

(none)

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Association does not implement Subjectable: no Assertion takes it as subject; its records carry lineage through `WAS_GENERATED_BY`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **recorded**.
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (5)

- [D2/Q-D2-18](../patterns/D2/Q-D2-18.md) (supported; Q-D2-18)
- [K/CQ-AX-04](../patterns/K/CQ-AX-04.md) (supported; CQ-AX-04)
- [K/Q-K-23](../patterns/K/Q-K-23.md) (supported; Q-K-23)
- [QP/G-0](../patterns/QP/G-0.md) (held; CQ-ST-07, Q-D10-05, Q-D10-19, Q-D10-20, Q-D12-20, Q-D2-19, Q-D4-25, Q-D5-19, Q-D7-23, Q-D9-19)
- [QP/P-10a.3](../patterns/QP/P-10a.3.md) (supported; Q-K-03, Q-K-04, Q-K-05, Q-K-06, Q-K-07)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `close`, `create`, `delete-unreferenced`
- Policy: projection job only: create; close with recordedTo on recompute; may delete a superseded record no Report or ReportItem cites (R-48)
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

(none)

## Source definition

- `release:sdl/modules/D10.graphql#L271-L314`
- `release:registers/node-register.yaml#Association`
- `release:workspace-inputs/identity-rules.yaml#Association`
