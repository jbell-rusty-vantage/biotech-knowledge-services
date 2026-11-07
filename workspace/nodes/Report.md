---
id: "node:Report"
kind: "node"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L1048-L1124","release:registers/node-register.yaml#Report","release:workspace-inputs/identity-rules.yaml#Report"]
aliases: ["report","node:AnswerRecord","node:NarrativeArc","AnswerRecord","NarrativeArc"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:dcafc8dcdcbc9f50a75456d33f9ca48613750fca36a6f4355691d8883f694028"
---
# Report

Purpose: the in-graph skeleton of a published artifact (PLAN 6.1): evidence report (the outcome of an evidence mission, with the verification.v1 verdict on the claim it tried to disqualify), published answer (absorbs AnswerRecord), comparison report, profile, recommendation. The body lives in the store (`bodyUri`, `bodyDigest`); the graph holds the minimum citation set: every Assertion and Assessment the content rests on (DERIVED_FROM), every SourceLocator it quotes (HAS_EVIDENCE), what it is about (ASSESSES), and the composing Activity, which names the PolicyVersion and the sealed bundle. Insert-only; a revision is a new Report naming `supersedesUid`. Minimum citation set to publish: bodyDigest; ASSESSES → what it is about (the Claim for an evidence report); DERIVED_FROM → every Assertion and Assessment a report sentence rests on (the sealed ledger's citations resolve to these); HAS_EVIDENCE → every SourceLocator it quotes; WAS_GENERATED_BY → the composing Activity (EVIDENCE_MISSION, ANSWER, or PROJECTION for a PROFILE) carrying policyVersion and bundleDigest; citationCompleteness recorded. ASSESSES is required for an EVIDENCE_REPORT (its Claim) and a COMPARISON (the compared entities); a PROFILE about the graph itself (D11 identifier coverage) has none. Report sentences stay in the ledger (ledgerDigest). Identity rule: (reportKind, bodyDigest). uid token: `report`. Questions: Q-K-04, Q-K-06, Q-K-08, Q-K-11, Q-K-17, Q-K-20, Q-K-21, Q-K-23, Q-K-25, Q-K-26.

## Identity

| | |
| --- | --- |
| id | `node:Report` · raw SDL [sdl:Report](../sdl/Report.graphql) |
| module / domain | [K](../modules/K.md) / [Kernel, identity, time and provenance](../domains/kernel-and-provenance.md) |
| uid | `hu:report:<opaque>` |
| stored labels | `Report` `InformationArtifact` (primary `Report`) |
| archetype | InformationArtifact |
| interfaces | [Entity](../interfaces/Entity.md) |
| identity rule (register) | `reportKind` + `bodyDigest` |
| identity keys | `uid`, `name`, `reportKind`, `bodyDigest` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (34)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | kernel.graphql:L1052 |
| `uid` | `String!` | yes | create+update |  | kernel.graphql:L1053 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update | Title. | kernel.graphql:L1055 |
| `lastWriterRunId` | `String` |  | create+update |  | kernel.graphql:L1057 |
| `reportKind` | [ReportKind](../vocabularies/ReportKind.md) | yes | create+update |  | kernel.graphql:L1060 |
| `skeletonKey` | `String` |  | create+update | D10 skeleton name and version (e.g. d10.compound-profile@1, d10.frontier-brief@1); refines reportKind without new enum values. | kernel.graphql:L1062 |
| `status` | [AssessmentStatus](../vocabularies/AssessmentStatus.md) | yes | create+update |  | kernel.graphql:L1063 |
| `verdict` | [SemanticVerdict](../vocabularies/SemanticVerdict.md) |  | create+update | EVIDENCE_REPORT: the verification.v1 lattice verdict on the Claim it ASSESSES (the exact proposition: that Claim's propositionHash), after the missio… | kernel.graphql:L1065 |
| `worldCorrectness` | [PropertyStatus](../vocabularies/PropertyStatus.md) |  | create+update | EVIDENCE_REPORT: verification.v1 world-correctness of the judged Claim (orthogonal to verdict; no aggregate erases either). | kernel.graphql:L1067 |
| `policyOutcome` | [PolicyOutcome](../vocabularies/PolicyOutcome.md) |  | create+update |  | kernel.graphql:L1068 |
| `policyVersion` | `String!` | yes | create+update | PolicyVersion id the publication was admitted under (node in D10 if promoted). | kernel.graphql:L1070 |
| `bodyDigest` | `String!` | yes | create+update | sha256:<hex> of the registered report bytes (verification-report-ledger.v1 reportArtifact). | kernel.graphql:L1072 |
| `bodyUri` | `String` |  | create+update |  | kernel.graphql:L1073 |
| `ledgerDigest` | `String` |  | create+update | sha256:<hex> of the verification report ledger and of the sealed audit bundle. | kernel.graphql:L1075 |
| `bundleDigest` | `String` |  | create+update |  | kernel.graphql:L1076 |
| `citationCompleteness` | `Float` |  | create+update | verification.v1 report-wide metrics: claimWeightedCitationCompleteness, citationCorrectness (nullable in v1). | kernel.graphql:L1078 |
| `citationCorrectness` | `Float` |  | create+update |  | kernel.graphql:L1079 |
| `independentSourceFamilyCount` | `Int` |  | create+update | verification.v1 reportWide independentSourceFamilyCount / distinctSourceFamilyCount (independence of the cited evidence). Source family = the evidenc… | kernel.graphql:L1081 |
| `distinctSourceFamilyCount` | `Int` |  | create+update |  | kernel.graphql:L1082 |
| `unsupportedHighSeverityCount` | `Int` |  | create+update | Count of verification.v1 reportWide.unsupportedHighSeverityAssertionIds (a publication gate input). | kernel.graphql:L1084 |
| `queryDigest` | `String` |  | create+update | ANSWER: digest of the read intent (query shape) that produced it, for replay. | kernel.graphql:L1086 |
| `reportRevisionRef` | `String` |  | create+update | Immutable reference to the Knowledge Services report revision (ReportRevision) this Report materializes (R-SV10). | kernel.graphql:L1088 |
| `reportSchema` | `String` |  | create+update | Report contract of that revision, e.g. research-report.v2 (R-SV10). | kernel.graphql:L1090 |
| `reportKindRef` | `String` |  | create+update | Versioned report-kind reference of the revision (R-SV10); refines reportKind without new enum values. | kernel.graphql:L1092 |
| `structuredBodyDigest` | `String` |  | create+update | sha256:<hex> of the structured report body the rendered body (bodyDigest) was compiled from (R-SV10). | kernel.graphql:L1094 |
| `supersedesReportRevisionRef` | `String` |  | create+update | Report revision this one supersedes (R-SV10); the graph-level revision link stays supersedesUid. | kernel.graphql:L1096 |
| `custodyKind` | `String` |  | create+update | Custody kind of bodyUri (e.g. supabase-knowledge-artifacts, content-addressed and immutable; OD-14) (R-SV10). | kernel.graphql:L1098 |
| `publishedAt` | `DateTime` |  | create+update |  | kernel.graphql:L1099 |
| `supersedesUid` | `String` |  | create+update |  | kernel.graphql:L1103 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | kernel.graphql:L1058 |
| `updatedAt` | `DateTime` |  | create+update |  | kernel.graphql:L1059 |
| `recordedAt` | `DateTime!` | yes | create+update |  | kernel.graphql:L1100 |
| `recordedTo` | `DateTime` |  | create+update | Written once when a revision (a new Report naming supersedesUid) or a withdrawal replaces this one. | kernel.graphql:L1102 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | kernel.graphql:L1056 |

## Outgoing relationships (7)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Report --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [ASSESSES](../relationships/ASSESSES.md) | [Subjectable](../interfaces/Subjectable.md) (56 members) | structural | recorded-only |  | Claim.reports (IN); Report.about (OUT) | planner-emitted (kernel plumbing) |
| [DERIVED_FROM](../relationships/DERIVED_FROM.md) | [Assertion](Assertion.md) | structural | recorded-only |  | Report.citesAssertions (OUT) | planner-emitted (kernel plumbing) |
| [DERIVED_FROM](../relationships/DERIVED_FROM.md) | [Assessment](Assessment.md) | structural | recorded-only |  | Report.citesAssessments (OUT) | planner-emitted (kernel plumbing) |
| [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) | [SourceLocator](SourceLocator.md) | structural | recorded-only | [EvidenceEdgeProperties](../edge-properties/EvidenceEdgeProperties.md) | Report.evidence (OUT) | planner-emitted (kernel plumbing) |
| [HAS_ITEM](../relationships/HAS_ITEM.md) | [ReportItem](ReportItem.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ReportItem.report (IN) | `edge.structural` |
| [USES_CRITERION](../relationships/USES_CRITERION.md) | [DecisionCriterion](DecisionCriterion.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | DecisionCriterion.usedByReports (IN) | `edge.structural` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN); Report.generatedBy (OUT) | planner-emitted (kernel plumbing) |

## Incoming relationships (0)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

(none)

## Legal predicates (0)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

(none)

## Evidence path

- Provenance requirement: captured bytes: SourceSnapshot contentHash and capture Activity; locators reference exactly one snapshot; reports cite locators
- Report does not implement Subjectable: no Assertion takes it as subject; its records carry lineage through `WAS_GENERATED_BY`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **recorded**.
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (19)

- [D10/Q-D10-03](../patterns/D10/Q-D10-03.md) (supported; Q-D10-03)
- [D10/Q-D10-08](../patterns/D10/Q-D10-08.md) (supported; Q-D10-08)
- [D3/CQ-EV-05#2](../patterns/D3/CQ-EV-05--2.md) (supported; CQ-EV-05)
- [D8/Q-D8-19](../patterns/D8/Q-D8-19.md) (supported; Q-D8-19)
- [D9/CQ-RC-05](../patterns/D9/CQ-RC-05.md) (supported; CQ-RC-05)
- [D9/Q-D9-22](../patterns/D9/Q-D9-22.md) (supported; Q-D9-22)
- [K/CQ-AX-04](../patterns/K/CQ-AX-04.md) (supported; CQ-AX-04)
- [K/Q-K-11](../patterns/K/Q-K-11.md) (supported; Q-K-11)
- [K/Q-K-17](../patterns/K/Q-K-17.md) (supported; Q-K-17)
- [K/Q-K-23](../patterns/K/Q-K-23.md) (supported; Q-K-23)
- [QP/P-01a](../patterns/QP/P-01a.md) (supported; CQ-AX-01, CQ-AX-07, Q-K-01, Q-K-20)
- [QP/P-02d](../patterns/QP/P-02d.md) (supported; CQ-TM-02, CQ-TM-03, Q-D10-12, Q-K-02)
- [QP/P-05b](../patterns/QP/P-05b.md) (supported; CQ-RC-01, CQ-RC-02, CQ-RC-03, CQ-RC-07, Q-D1-19, Q-D10-01, Q-D10-02, Q-D10-13, Q-D6-03)
- [QP/P-05c](../patterns/QP/P-05c.md) (supported; CQ-RC-01, CQ-RC-02, CQ-RC-03, CQ-RC-07, Q-D1-19, Q-D10-01, Q-D10-02, Q-D10-13, Q-D6-03)
- [QP/P-07](../patterns/QP/P-07.md) (supported; CQ-RC-06, Q-D10-08, Q-D10-24, Q-D5-02, Q-D5-06, Q-D5-07)
- [QP/P-10a.3](../patterns/QP/P-10a.3.md) (supported; Q-K-03, Q-K-04, Q-K-05, Q-K-06, Q-K-07)
- [QP/P-10b](../patterns/QP/P-10b.md) (supported; Q-K-03, Q-K-04, Q-K-05, Q-K-06, Q-K-07)
- [QP/P-10c](../patterns/QP/P-10c.md) (supported; Q-K-03, Q-K-04, Q-K-05, Q-K-06, Q-K-07)
- [QP/P-11a](../patterns/QP/P-11a.md) (supported; CQ-AX-24, Q-D10-04, Q-D10-23, Q-K-08, Q-K-19)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `close`, `create`
- Policy: create (report.publish); close once on revision or withdrawal
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

- [Take a claim through vetting, an evidence mission and a published evidence report](../tasks/claim-to-evidence-report.md)

## v1 navigation aliases

- `node:AnswerRecord` (merged): K: K.Report (reportKind ANSWER, queryDigest) ‖ D10: K.Report (reportKind ANSWER, queryDigest) — kernel decision; D10 adds ReportItem for its sections
- `node:NarrativeArc` (merged): D13: kernel Report (see deferred)

## Source definition

- `release:sdl/modules/kernel.graphql#L1048-L1124`
- `release:registers/node-register.yaml#Report`
- `release:workspace-inputs/identity-rules.yaml#Report`
