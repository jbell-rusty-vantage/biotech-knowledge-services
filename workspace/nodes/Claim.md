---
id: "node:Claim"
kind: "node"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L885-L933","release:registers/node-register.yaml#Claim","release:workspace-inputs/identity-rules.yaml#Claim"]
aliases: ["claim"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:a8fcc1f28381178de4724a65ab7cb423c472b6db4ce4817e50203c24a2778dac"
---
# Claim

Purpose: the proposition itself, independent of who said it (00-DIRECTIVE 3.4): the unit that is vetted, monitored, researched and reported on. Occurrences are Assertions (assertionKind CLAIM) pointing at it with OCCURRENCE_OF. Identity rule: `propositionHash` = sha256 over the normalized proposition plus its structured binding (subject uid, predicate, object uid or literal, qualifiers); near-duplicates are separate Claims linked by an EQUIVALENCE Assessment, never merged by similarity. A qualified variant ("activates SIRT1 with hydrophobic-motif substrates") is its own Claim; an EQUIVALENCE Assessment (`assessmentSubkind: K.claim-relation`, `conclusionCode: REFINES`) ASSESSES both, and the narrower Claim caches the broader one's uid in `refinesClaimUid`. Lifecycle (00-DIRECTIVE 3.4): occurrences (Assertion CLAIM, OCCURRENCE_OF) → VETTING Assessment with disposition → EVIDENCE_MISSION Activity that ASSESSES the Claim → EVIDENCE_REPORT Report that ASSESSES it with a lattice verdict. uid token: `claim`. Implements Subjectable so Assessments, Reports, Activities and RATES_CLAIM Assertions can point at it. Questions: Q-K-08, Q-K-09, Q-K-11, Q-K-19, Q-K-21, Q-K-23, Q-K-26, Q-K-27, Q-K-28.

## Identity

| | |
| --- | --- |
| id | `node:Claim` · raw SDL [sdl:Claim](../sdl/Claim.graphql) |
| module / domain | [K](../modules/K.md) / [Kernel, identity, time and provenance](../domains/kernel-and-provenance.md) |
| uid | `hu:claim:<opaque>` |
| stored labels | `Claim` `Entity` (primary `Claim`) |
| archetype | Entity |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `propositionHash` |
| identity keys | `uid`, `name`, `propositionHash` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (20)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | kernel.graphql:L889 |
| `uid` | `String!` | yes | create+update |  | kernel.graphql:L890 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update | Short label. | kernel.graphql:L892 |
| `lastWriterRunId` | `String` |  | create+update |  | kernel.graphql:L894 |
| `proposition` | `String!` | yes | create+update | Normalized proposition text. | kernel.graphql:L898 |
| `propositionHash` | `String!` | yes | create+update |  | kernel.graphql:L899 |
| `claimType` | [ClaimType](../vocabularies/ClaimType.md) | yes | create+update |  | kernel.graphql:L900 |
| `lifecycleState` | [ClaimLifecycleState](../vocabularies/ClaimLifecycleState.md) |  | create+update | Projection cache maintained by the lifecycle projection; authority is the Assessments and Reports. | kernel.graphql:L902 |
| `latestVerdict` | [SemanticVerdict](../vocabularies/SemanticVerdict.md) |  | create+update | Projection cache of the latest published evidence report's verdict. | kernel.graphql:L904 |
| `refinesClaimUid` | `String` |  | create+update | Projection cache: uid of the broader Claim this one refines (authority: the accepted EQUIVALENCE Assessment with conclusionCode REFINES). | kernel.graphql:L906 |
| `discourseFirstHandCount` | `Int` |  | create+update | Discourse projection cache (R-49, CQ-CL-06): occurrences of this Claim whose asserter states it first-hand. Written by a PROJECTION Activity under di… | kernel.graphql:L908 |
| `discourseRetellingCount` | `Int` |  | create+update | Discourse projection cache (R-49, CQ-CL-06, Q-D9-08): occurrences that retell an earlier occurrence. | kernel.graphql:L910 |
| `discourseRecutCount` | `Int` |  | create+update | Discourse projection cache (R-49, CQ-CL-06, Q-D9-08): occurrences in re-published cuts of an earlier work. | kernel.graphql:L912 |
| `discourseIndependentCount` | `Int` |  | create+update | Discourse projection cache (R-49, CQ-CL-06): independent source families among the occurrences, under discourseMethodVersion. | kernel.graphql:L914 |
| `discourseFirstOccurrenceAt` | `DateTime` |  | create+update | Discourse projection cache (R-49, Q-D9-08): earliest valid time among the occurrences (first assertion). | kernel.graphql:L916 |
| `discourseMethodVersion` | `String` |  | create+update | Method version of the discourse projection cache (R-45 condition 3). | kernel.graphql:L918 |
| `discourseDerivedAt` | `DateTime` |  | create+update | When the PROJECTION Activity derived the discourse cache (R-45 condition 3). | kernel.graphql:L920 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | kernel.graphql:L895 |
| `updatedAt` | `DateTime` |  | create+update |  | kernel.graphql:L896 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | kernel.graphql:L893 |

## Outgoing relationships (2)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Claim --direction out --expand`.

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
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assessment](Assessment.md) | structural | recorded-only |  | Assessment.about (OUT); Claim.assessments (IN) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Report](Report.md) | structural | recorded-only |  | Claim.reports (IN); Report.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ReportItem](ReportItem.md) | structural | recorded-only |  | ReportItem.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSOCIATES](../relationships/ASSOCIATES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Association](Association.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Association.members (OUT) | read-only |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [OCCURRENCE_OF](../relationships/OCCURRENCE_OF.md) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.occurrenceOf (OUT); Claim.occurrences (IN) | planner-emitted (kernel plumbing) |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (7)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [CHARACTERIZES_EVIDENCE_STRENGTH](../predicates/CHARACTERIZES_EVIDENCE_STRENGTH.md) | subject | literal | literal | D10 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_CLAIM_CONDITION](../predicates/HAS_CLAIM_CONDITION.md) | subject | literal | literal | D8 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [RATES_CLAIM](../predicates/RATES_CLAIM.md) | subject | literal | literal | K |
| [REPORTS_DOSE_RANGE_STUDIED](../predicates/REPORTS_DOSE_RANGE_STUDIED.md) | subject | literal | literal | D1 |
| [REQUIRES_QUALIFIED_CLAIM_WORDING](../predicates/REQUIRES_QUALIFIED_CLAIM_WORDING.md) | subject | literal | literal | D10 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a Claim are Assertions with it as subject: `(:Claim)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (16)

- [D10/Q-D10-03](../patterns/D10/Q-D10-03.md) (supported; Q-D10-03)
- [D11/Q-D11-19](../patterns/D11/Q-D11-19.md) (supported; Q-D11-19)
- [D9/CQ-CL-04](../patterns/D9/CQ-CL-04.md) (supported; CQ-CL-04)
- [D9/CQ-CL-06](../patterns/D9/CQ-CL-06.md) (supported; CQ-CL-06)
- [D9/CQ-PV-04](../patterns/D9/CQ-PV-04.md) (supported; CQ-PV-04)
- [D9/Q-D9-08](../patterns/D9/Q-D9-08.md) (supported; Q-D9-08)
- [D9/Q-D9-22](../patterns/D9/Q-D9-22.md) (supported; Q-D9-22)
- [K/Q-K-09](../patterns/K/Q-K-09.md) (supported; Q-K-09)
- [K/Q-K-11](../patterns/K/Q-K-11.md) (supported; Q-K-11)
- [K/Q-K-21](../patterns/K/Q-K-21.md) (supported; Q-K-21)
- [K/Q-K-23](../patterns/K/Q-K-23.md) (supported; Q-K-23)
- [QP/G-4#1](../patterns/QP/G-4--1.md) (unsupported; CQ-ST-07)
- [QP/G-5#1](../patterns/QP/G-5--1.md) (unsupported; Q-D9-19)
- [QP/P-10c](../patterns/QP/P-10c.md) (supported; Q-K-03, Q-K-04, Q-K-05, Q-K-06, Q-K-07)
- [QP/P-11a](../patterns/QP/P-11a.md) (supported; CQ-AX-24, Q-D10-04, Q-D10-23, Q-K-08, Q-K-19)
- [QP/P-11b](../patterns/QP/P-11b.md) (supported; CQ-AX-24, Q-D10-04, Q-D10-23, Q-K-08, Q-K-19)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update projection caches (lifecycleState, latestVerdict, refinesClaimUid; discourse* by a PROJECTION Activity, R-49) only
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

- [Ingest claims made in a podcast or video episode](../tasks/ingest-podcast-claims.md)
- [Take a claim through vetting, an evidence mission and a published evidence report](../tasks/claim-to-evidence-report.md)

## v1 navigation aliases

- `node:Claim` is unchanged from v1.
(none)

## Source definition

- `release:sdl/modules/kernel.graphql#L885-L933`
- `release:registers/node-register.yaml#Claim`
- `release:workspace-inputs/identity-rules.yaml#Claim`
