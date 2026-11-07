---
id: "node:Adjudication"
kind: "node"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L815-L865","release:registers/node-register.yaml#Adjudication","release:workspace-inputs/identity-rules.yaml#Adjudication"]
aliases: ["adjudication"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:13eaeb900dcc00fd139d9a1b7df1b50e3e8574a9c43d64922229fbb0c2033e60"
---
# Adjudication

Purpose: one verification.v1 judgment about one Assertion, immutable (a re-review is a new node naming `supersedesUid`). CAPTURE_FIDELITY judges the record against its declared span and feeds Assertion.status through the verdict mapping; SUPPORT judges whether located evidence supports the proposition and never changes status. The judge's evidence (supporting, contradicting, qualifying, context fragments) is HAS_EVIDENCE with a role. The five orthogonal properties are stored separately; no aggregate erases a component. The verification run is the generating Activity (activityKind VERIFICATION, bundleDigest), not a node of its own. Identity rule: verification.v1 judgmentId when present, else (assertion, kind, methodVersion, recordedAt). uid token: `adjudication`. Questions: Q-K-01, Q-K-08, Q-K-11, Q-K-16.

## Identity

| | |
| --- | --- |
| id | `node:Adjudication` · raw SDL [sdl:Adjudication](../sdl/Adjudication.graphql) |
| module / domain | [K](../modules/K.md) / [Kernel, identity, time and provenance](../domains/kernel-and-provenance.md) |
| uid | `hu:adjudication:<opaque>` |
| stored labels | `Adjudication` `EvidenceAssessment` (primary `Adjudication`) |
| archetype | EvidenceAssessment |
| interfaces | [Entity](../interfaces/Entity.md) |
| identity rule (register) | `judgmentId` + `else (assertion, adjudicationKind, methodVersion, recordedAt)` |
| identity keys | `uid`, `name`, `judgmentId` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (27)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | kernel.graphql:L819 |
| `uid` | `String!` | yes | create+update |  | kernel.graphql:L820 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | kernel.graphql:L821 |
| `lastWriterRunId` | `String` |  | create+update |  | kernel.graphql:L823 |
| `adjudicationKind` | [AdjudicationKind](../vocabularies/AdjudicationKind.md) | yes | create+update |  | kernel.graphql:L826 |
| `verdict` | [SemanticVerdict](../vocabularies/SemanticVerdict.md) | yes | create+update |  | kernel.graphql:L827 |
| `mechanicalStatus` | `String` |  | create+update | Deterministic stage result (passed \| failed \| review_required). | kernel.graphql:L829 |
| `policyOutcome` | [PolicyOutcome](../vocabularies/PolicyOutcome.md) |  | create+update |  | kernel.graphql:L830 |
| `judgeKind` | [JudgeKind](../vocabularies/JudgeKind.md) | yes | create+update |  | kernel.graphql:L831 |
| `methodVersion` | `String!` | yes | create+update | verification.v1 graderVersion; the method that makes the verdict interpretable. | kernel.graphql:L833 |
| `evidenceSupport` | [PropertyStatus](../vocabularies/PropertyStatus.md) |  | create+update |  | kernel.graphql:L834 |
| `worldCorrectness` | [PropertyStatus](../vocabularies/PropertyStatus.md) |  | create+update |  | kernel.graphql:L835 |
| `attributionFaithfulness` | [PropertyStatus](../vocabularies/PropertyStatus.md) |  | create+update |  | kernel.graphql:L836 |
| `sourceAuthority` | [PropertyStatus](../vocabularies/PropertyStatus.md) |  | create+update |  | kernel.graphql:L837 |
| `provenanceIntegrity` | [PropertyStatus](../vocabularies/PropertyStatus.md) |  | create+update |  | kernel.graphql:L838 |
| `unsupportedFacets` | `[String!]` |  | create+update | Facets of the claim the evidence did not support. | kernel.graphql:L840 |
| `calibratedProbability` | `Float` |  | create+update |  | kernel.graphql:L841 |
| `rationale` | `String` |  | create+update | verification.v1 publicRationale. | kernel.graphql:L843 |
| `decision` | [AdjudicationDecision](../vocabularies/AdjudicationDecision.md) |  | create+update | Human decision on a held result. Only AFFIRM with decisionProvenance HUMAN_ORIGIN moves a held Assertion to ACCEPTED; DEFER changes nothing. | kernel.graphql:L845 |
| `decisionProvenance` | `String` |  | create+update | HUMAN_ORIGIN \| SYNTHETIC_ENGINEERING (verification.v1 decision provenance); synthetic decisions never change Assertion.status. | kernel.graphql:L847 |
| `judgmentId` | `String` |  | create+update | verification.v1 judgmentId. | kernel.graphql:L849 |
| `supersedesUid` | `String` |  | create+update |  | kernel.graphql:L852 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | kernel.graphql:L824 |
| `updatedAt` | `DateTime` |  | create+update |  | kernel.graphql:L825 |
| `recordedAt` | `DateTime!` | yes | create+update |  | kernel.graphql:L850 |
| `recordedTo` | `DateTime` |  | create+update |  | kernel.graphql:L851 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | kernel.graphql:L822 |

## Outgoing relationships (3)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Adjudication --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [ASSESSES](../relationships/ASSESSES.md) | [Assertion](Assertion.md) | structural | recorded-only |  | Adjudication.evaluates (OUT); Assertion.adjudications (IN) | planner-emitted (kernel plumbing) |
| [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) | [SourceLocator](SourceLocator.md) | structural | recorded-only | [EvidenceEdgeProperties](../edge-properties/EvidenceEdgeProperties.md) | Adjudication.evidence (OUT) | planner-emitted (kernel plumbing) |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN); Adjudication.generatedBy (OUT) | planner-emitted (kernel plumbing) |

## Incoming relationships (0)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

(none)

## Legal predicates (0)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

(none)

## Evidence path

- Provenance requirement: ASSESSES its target, DERIVED_FROM its inputs, HAS_EVIDENCE for located support, WAS_GENERATED_BY the assessing Activity; method version recorded
- Adjudication does not implement Subjectable: no Assertion takes it as subject; its records carry lineage through `WAS_GENERATED_BY`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **recorded**.
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (59)

- [D1/CQ-ID-03](../patterns/D1/CQ-ID-03.md) (supported; CQ-ID-03)
- [D1/CQ-ID-04](../patterns/D1/CQ-ID-04.md) (supported; CQ-ID-04)
- [D1/CQ-PF-01](../patterns/D1/CQ-PF-01.md) (supported; CQ-PF-01)
- [D1/Q-D1-16](../patterns/D1/Q-D1-16.md) (supported; Q-D1-16)
- [D10/Q-D10-03](../patterns/D10/Q-D10-03.md) (supported; Q-D10-03)
- [D10/Q-D10-21](../patterns/D10/Q-D10-21.md) (supported; Q-D10-21)
- [D11/Q-D11-08](../patterns/D11/Q-D11-08.md) (supported; Q-D11-08)
- [D12/Q-D12-18](../patterns/D12/Q-D12-18.md) (supported; Q-D12-18)
- [D13/Q-D13-14#1](../patterns/D13/Q-D13-14--1.md) (supported; Q-D13-14)
- [D2/Q-D2-10](../patterns/D2/Q-D2-10.md) (supported; Q-D2-10)
- [D2/Q-D2-18](../patterns/D2/Q-D2-18.md) (supported; Q-D2-18)
- [D3/CQ-EV-05#1](../patterns/D3/CQ-EV-05--1.md) (supported; CQ-EV-05)
- [D3/Q-D3-04](../patterns/D3/Q-D3-04.md) (supported; Q-D3-04)
- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported; Q-D5-13)
- [D5/Q-D5-17](../patterns/D5/Q-D5-17.md) (supported; Q-D5-17)
- [D5/Q-D5-20](../patterns/D5/Q-D5-20.md) (supported; Q-D5-20)
- [D6/CQ-PF-01#2](../patterns/D6/CQ-PF-01--2.md) (supported; CQ-PF-01)
- [D8/CQ-MF-01](../patterns/D8/CQ-MF-01.md) (supported; CQ-MF-01)
- [D8/Q-D8-10](../patterns/D8/Q-D8-10.md) (supported; Q-D8-10)
- [D9/CQ-CL-01](../patterns/D9/CQ-CL-01.md) (supported; CQ-CL-01)
- … 39 more: `bks-schema find --kind pattern --label Adjudication`

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `close`, `create`
- Policy: create; close once on supersession
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

- [Trace an assertion to its source span and adjudication](../tasks/trace-answer-to-source.md)
- [Take a claim through vetting, an evidence mission and a published evidence report](../tasks/claim-to-evidence-report.md)

## v1 navigation aliases

- `node:Adjudication` is unchanged from v1.
(none)

## Source definition

- `release:sdl/modules/kernel.graphql#L815-L865`
- `release:registers/node-register.yaml#Adjudication`
- `release:workspace-inputs/identity-rules.yaml#Adjudication`
