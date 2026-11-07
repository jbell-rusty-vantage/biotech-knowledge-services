---
id: "node:ReportItem"
kind: "node"
module: "D10"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D10.graphql#L187-L247","release:registers/node-register.yaml#ReportItem","release:workspace-inputs/identity-rules.yaml#ReportItem"]
aliases: ["report item","report-item","reportitem"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:596812d6a7e25062c73495b37e67e059d09c615fa56efba35ac222b6a9f86376"
---
# ReportItem

Purpose: one section or one option row of a published kernel Report (comparison, profile, protocol review, evidence report, published answer). It exists because questions filter and traverse below the report level: which rows were BLOCKED and by which use constraint or assessment (CQ-RC-06), which option was rejected and why (CQ-RC-01), which row or section of a report cites an input that has since been superseded (Q-D10-13, CQ-AX-11), and which sections carry uncited sentences (CQ-AX-01, Q-D10-14). The Report keeps the kernel minimum citation set; each item cites the subset its own content rests on, so one row can be re-checked without parsing the body. Sentences stay in the sealed report ledger; an item points into the body with offsets. Insert-only with its Report: a revision is a new Report with new items. Row rule: a ROW ASSESSES exactly one entity, its option; the target, population or other context of a row is on the enclosing SECTION's or the Report's ASSESSES, and a blocking scope is the UseConstraint's (report-skeletons.md rule 9). Identity rule: (report uid, itemKey). uid token: `report-item` (hu:report-item:<opaque>). Questions: CQ-AX-01, CQ-AX-11, CQ-RC-01, CQ-RC-02, CQ-RC-03, CQ-RC-06, CQ-RC-07, Q-D10-02, Q-D10-08, Q-D10-13, Q-D10-14, Q-D10-16.

## Identity

| | |
| --- | --- |
| id | `node:ReportItem` · raw SDL [sdl:ReportItem](../sdl/ReportItem.graphql) |
| module / domain | [D10](../modules/D10.md) / [Derived knowledge, reports, rankings and recommendations](../domains/derived-knowledge-and-reports.md) |
| uid | `hu:report-item:<opaque>` |
| stored labels | `ReportItem` `InformationArtifact` (primary `ReportItem`) |
| archetype | InformationArtifact |
| interfaces | [Entity](../interfaces/Entity.md) |
| identity rule (register) | `reportUid` + `itemKey` |
| identity keys | `uid`, `name`, `itemKey` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (21)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D10.graphql:L191 |
| `uid` | `String!` | yes | create+update |  | D10.graphql:L192 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update | Heading of the section, or display label of the option row. | D10.graphql:L194 |
| `lastWriterRunId` | `String` |  | create+update |  | D10.graphql:L196 |
| `itemKind` | [ReportItemKind](../vocabularies/ReportItemKind.md) | yes | create+update |  | D10.graphql:L199 |
| `sectionKind` | [ReportSectionKind](../vocabularies/ReportSectionKind.md) |  | create+update |  | D10.graphql:L200 |
| `itemKey` | `String!` | yes | create+update | Stable key inside the report (e.g. sec:evidence-against, row:mg-bisglycinate); with the report uid, identity. | D10.graphql:L202 |
| `parentItemKey` | `String` |  | create+update | itemKey of the enclosing section for a row (rows live inside an OPTIONS, HARMS_AND_AVOIDANCE or PROTOCOL_STEP section). | D10.graphql:L204 |
| `disposition` | [OptionDisposition](../vocabularies/OptionDisposition.md) |  | create+update | ROW only. | D10.graphql:L206 |
| `rank` | `Int` |  | create+update | ROW only; null when BLOCKED or NOT_EVALUATED. Rank under the report's criteria set, never a property of the option. | D10.graphql:L208 |
| `cellValues` | `[String!]` |  | create+update | ROW only: one entry per criterion cell, '<criterion uid>=<value>[ <unit>]\|<assertion or assessment uid>,…'. | D10.graphql:L210 |
| `reason` | `String` |  | create+update | Rejection or blocking reason as published. | D10.graphql:L212 |
| `missingFactKeys` | `[String!]` |  | create+update | Fact keys the method needed and could not find for this item (CQ-RC-03). | D10.graphql:L214 |
| `bodyStartOffset` | `Int` |  | create+update | Character offsets of the item in the registered report body (bodyDigest), so ledger sentences resolve to items. | D10.graphql:L216 |
| `bodyEndOffset` | `Int` |  | create+update |  | D10.graphql:L217 |
| `citationCompleteness` | `Float` |  | create+update | verification.v1 claim-weighted citation completeness over the sentences in this item's span. | D10.graphql:L219 |
| `uncitedSentenceCount` | `Int` |  | create+update | Sentences in the span with no ledger citation (CQ-AX-01). | D10.graphql:L221 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D10.graphql:L197 |
| `updatedAt` | `DateTime` |  | create+update |  | D10.graphql:L198 |
| `recordedAt` | `DateTime!` | yes | create+update |  | D10.graphql:L222 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D10.graphql:L195 |

## Outgoing relationships (6)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:ReportItem --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [ASSESSES](../relationships/ASSESSES.md) | [Subjectable](../interfaces/Subjectable.md) (56 members) | structural | recorded-only |  | ReportItem.about (OUT) | planner-emitted (kernel plumbing) |
| [BLOCKED_BY](../relationships/BLOCKED_BY.md) | [Assessment](Assessment.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ReportItem.blockedByAssessments (OUT) | `edge.structural` |
| [BLOCKED_BY](../relationships/BLOCKED_BY.md) | [UseConstraint](UseConstraint.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ReportItem.blockedBy (OUT) | `edge.structural` |
| [DERIVED_FROM](../relationships/DERIVED_FROM.md) | [Assertion](Assertion.md) | structural | recorded-only |  | ReportItem.citesAssertions (OUT) | planner-emitted (kernel plumbing) |
| [DERIVED_FROM](../relationships/DERIVED_FROM.md) | [Assessment](Assessment.md) | structural | recorded-only |  | ReportItem.citesAssessments (OUT) | planner-emitted (kernel plumbing) |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (1)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

| type | from | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_ITEM](../relationships/HAS_ITEM.md) | [Report](Report.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ReportItem.report (IN) | `edge.structural` |

## Legal predicates (0)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

(none)

## Evidence path

- Provenance requirement: captured bytes: SourceSnapshot contentHash and capture Activity; locators reference exactly one snapshot; reports cite locators
- ReportItem does not implement Subjectable: no Assertion takes it as subject; its records carry lineage through `WAS_GENERATED_BY`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **recorded**.
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (9)

- [D10/Q-D10-08](../patterns/D10/Q-D10-08.md) (supported; Q-D10-08)
- [K/CQ-AX-04](../patterns/K/CQ-AX-04.md) (supported; CQ-AX-04)
- [K/Q-K-23](../patterns/K/Q-K-23.md) (supported; Q-K-23)
- [QP/P-01a](../patterns/QP/P-01a.md) (supported; CQ-AX-01, CQ-AX-07, Q-K-01, Q-K-20)
- [QP/P-05b](../patterns/QP/P-05b.md) (supported; CQ-RC-01, CQ-RC-02, CQ-RC-03, CQ-RC-07, Q-D1-19, Q-D10-01, Q-D10-02, Q-D10-13, Q-D6-03)
- [QP/P-05c](../patterns/QP/P-05c.md) (supported; CQ-RC-01, CQ-RC-02, CQ-RC-03, CQ-RC-07, Q-D1-19, Q-D10-01, Q-D10-02, Q-D10-13, Q-D6-03)
- [QP/P-07](../patterns/QP/P-07.md) (supported; CQ-RC-06, Q-D10-08, Q-D10-24, Q-D5-02, Q-D5-06, Q-D5-07)
- [QP/P-10b](../patterns/QP/P-10b.md) (supported; Q-K-03, Q-K-04, Q-K-05, Q-K-06, Q-K-07)
- [QP/P-11a](../patterns/QP/P-11a.md) (supported; CQ-AX-24, Q-D10-04, Q-D10-23, Q-K-08, Q-K-19)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`
- Policy: create only, with its Report (report.publish); insert-only
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

- [Take a claim through vetting, an evidence mission and a published evidence report](../tasks/claim-to-evidence-report.md)

## v1 navigation aliases

(none)

## Source definition

- `release:sdl/modules/D10.graphql#L187-L247`
- `release:registers/node-register.yaml#ReportItem`
- `release:workspace-inputs/identity-rules.yaml#ReportItem`
