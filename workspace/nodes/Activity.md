---
id: "node:Activity"
kind: "node"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L1145-L1215","release:registers/node-register.yaml#Activity","release:workspace-inputs/identity-rules.yaml#Activity"]
aliases: ["activity"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:f6950a5669cff6e6bd48efacaac83879b4e6bc3a714e27e86076eddc6eac4c7f"
---
# Activity

Purpose: the single lineage spine (00-DIRECTIVE 4). One Activity per Mission Control run (or verification run, projection job, answer composition): `externalRunSystem` + `runId` unique. Everything the run writes points at it (nodes by WAS_GENERATED_BY; edges by `lastWriterRunId` = runId). A verification.v1 run is an Activity of kind VERIFICATION carrying its sealed `bundleDigest` (no VerificationRun node). An evidence mission is an Activity of kind EVIDENCE_MISSION that ASSESSES the Claim it tries to disqualify and WAS_INFORMED_BY the VETTING activity whose Assessment queued the claim. Granularity (model stage): one Activity per run, never per applied intent; the intents a run applied are list-valued (`operationIds`, `intentDigests`, `planDigests`, `receiptIds`; each receipt is tied to its graph effects by the executor's KsIntentMarker). Retries (Mission Control attempts) keep the run's identity and never create another Activity. The Activity carries admission (`policyOutcome`) and times, never the KS operation state machine (queued … quarantined), which stays in Mission Control / Knowledge Services. WAS_GENERATED_BY is written for every node a run creates OR updates, so a node may point at several Activities; its creator is the earliest. Identity rule: (externalRunSystem, runId). uid token: `activity`. Questions: Q-K-03, Q-K-04, Q-K-05, Q-K-06, Q-K-07, Q-K-08, Q-K-19, Q-K-24, CQ-AX-07.

## Identity

| | |
| --- | --- |
| id | `node:Activity` · raw SDL [sdl:Activity](../sdl/Activity.graphql) |
| module / domain | [K](../modules/K.md) / [Kernel, identity, time and provenance](../domains/kernel-and-provenance.md) |
| uid | `hu:activity:<opaque>` |
| stored labels | `Activity` `Occurrence` (primary `Activity`) |
| archetype | Occurrence |
| interfaces | [Entity](../interfaces/Entity.md) |
| identity rule (register) | `externalRunSystem` + `runId` |
| identity keys | `uid`, `name`, `externalRunSystem`, `runId` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (32)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | kernel.graphql:L1149 |
| `uid` | `String!` | yes | create+update |  | kernel.graphql:L1150 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | kernel.graphql:L1151 |
| `lastWriterRunId` | `String` |  | create+update |  | kernel.graphql:L1153 |
| `activityKind` | [ActivityKind](../vocabularies/ActivityKind.md) | yes | create+update |  | kernel.graphql:L1156 |
| `externalRunSystem` | `String!` | yes | create+update | mission-control \| ks-verification \| projection \| manual. | kernel.graphql:L1158 |
| `runId` | `String!` | yes | create+update | Mission Control run.runId (or verification run UUID); replaces externalRunId / mongoResearchRunId. | kernel.graphql:L1160 |
| `missionId` | `String` |  | create+update |  | kernel.graphql:L1161 |
| `activationId` | `String` |  | create+update |  | kernel.graphql:L1162 |
| `operationIds` | `[String!]` |  | create+update | Operation intent ids (Mission Control) or the Knowledge Services operation id(s) this run executed. | kernel.graphql:L1164 |
| `operationKind` | `String` |  | create+update | The run's main step: knowledge.ingestion_apply, verification_claims, entity-link projection, ... | kernel.graphql:L1166 |
| `startedAt` | `DateTime` |  | create+update |  | kernel.graphql:L1167 |
| `endedAt` | `DateTime` |  | create+update |  | kernel.graphql:L1168 |
| `methodVersion` | `String` |  | create+update | Executor or method version that makes outputs interpretable. | kernel.graphql:L1170 |
| `intentDigests` | `[String!]` |  | create+update | biotech-knowledge-intent.v1 digests and plan digests of the intents the run applied (ADR 0003), in apply order. | kernel.graphql:L1172 |
| `planDigests` | `[String!]` |  | create+update |  | kernel.graphql:L1173 |
| `receiptIds` | `[String!]` |  | create+update | biotech-knowledge-receipt.v1 ids (the references Mission Control stores), in apply order. | kernel.graphql:L1175 |
| `bundleDigest` | `String` |  | create+update | verification.v1 sealed audit bundle digest, when the run produced one. | kernel.graphql:L1177 |
| `policyOutcome` | [PolicyOutcome](../vocabularies/PolicyOutcome.md) |  | create+update | verification.v1 policy outcome of the run, and the PolicyVersion id applied. | kernel.graphql:L1179 |
| `policyVersion` | `String` |  | create+update |  | kernel.graphql:L1180 |
| `verificationRunRef` | `String` |  | create+update | Knowledge Services verification run id (the common operational run; PostgreSQL owns the run and its manifests, R-SV10). | kernel.graphql:L1182 |
| `runManifestDigest` | `String` |  | create+update | sha256:<hex> of the canonical unsigned sealed run manifest this Activity references (R-SV10). | kernel.graphql:L1184 |
| `runSealKind` | [RunSealKind](../vocabularies/RunSealKind.md) |  | create+update | Which seal runManifestDigest names (verification, decision or admission snapshot, R-SV10). | kernel.graphql:L1186 |
| `useDecisionRef` | `String` |  | create+update | Immutable reference to the Knowledge Services use decision the applied effect was admitted under (R-SV10). | kernel.graphql:L1188 |
| `useDecisionDigest` | `String` |  | create+update | sha256:<hex> digest of that use decision record (R-SV11); official reads compare it with the authority's record before serving. | kernel.graphql:L1190 |
| `boundEffectDigest` | `String` |  | create+update | sha256:<hex> of the exact normalized native effect the use decision bound (R-SV10); the apply verifies it before writing. | kernel.graphql:L1192 |
| `effectKey` | `String` |  | create+update | Effect key of the applied effect (the KsIntentMarker scope key, R-SV10). | kernel.graphql:L1194 |
| `originatingOrigin` | `String` |  | create+update | Canonical JSON digest (or compact string) of the admitted original invocation (origin) the effect descends from (R-SV10). | kernel.graphql:L1196 |
| `revocationEpoch` | `Int` |  | create+update | Revocation epoch checked at admission under the native transaction (R-SV10). | kernel.graphql:L1198 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | kernel.graphql:L1154 |
| `updatedAt` | `DateTime` |  | create+update |  | kernel.graphql:L1155 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | kernel.graphql:L1152 |

## Outgoing relationships (4)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Activity --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [ASSESSES](../relationships/ASSESSES.md) | [Subjectable](../interfaces/Subjectable.md) (56 members) | structural | recorded-only |  | Activity.about (OUT) | planner-emitted (kernel plumbing) |
| [WAS_ASSOCIATED_WITH](../relationships/WAS_ASSOCIATED_WITH.md) | [Agent](Agent.md) | structural | recorded-only |  | Activity.agents (OUT) | planner-emitted (kernel plumbing) |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |
| [WAS_INFORMED_BY](../relationships/WAS_INFORMED_BY.md) | [Activity](Activity.md) | structural | recorded-only |  | Activity.informedBy (OUT) | planner-emitted (kernel plumbing) |

## Incoming relationships (5)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

| type | from | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) | [Adjudication](Adjudication.md) | structural | recorded-only |  | Activity.generated (IN); Adjudication.generatedBy (OUT) | planner-emitted (kernel plumbing) |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) | [Assertion](Assertion.md) | structural | recorded-only |  | Activity.generated (IN); Assertion.generatedBy (OUT) | planner-emitted (kernel plumbing) |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) | [Assessment](Assessment.md) | structural | recorded-only |  | Activity.generated (IN); Assessment.generatedBy (OUT) | planner-emitted (kernel plumbing) |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) | [Entity](../interfaces/Entity.md) (69 members) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) | [Report](Report.md) | structural | recorded-only |  | Activity.generated (IN); Report.generatedBy (OUT) | planner-emitted (kernel plumbing) |

## Legal predicates (0)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

(none)

## Evidence path

- Provenance requirement: an Activity is one Mission Control run or a native namespaced run (OD-07); lineage via WAS_INFORMED_BY; capture attempts keep sanitized request metadata (EX-03)
- Activity does not implement Subjectable: no Assertion takes it as subject; its records carry lineage through `WAS_GENERATED_BY`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (33)

- [D10/Q-D10-03](../patterns/D10/Q-D10-03.md) (supported; Q-D10-03)
- [D2/Q-D2-18](../patterns/D2/Q-D2-18.md) (supported; Q-D2-18)
- [D5/Q-D5-13](../patterns/D5/Q-D5-13.md) (supported; Q-D5-13)
- [D5/Q-D5-17](../patterns/D5/Q-D5-17.md) (supported; Q-D5-17)
- [D5/Q-D5-20](../patterns/D5/Q-D5-20.md) (supported; Q-D5-20)
- [D6/CQ-PF-01#2](../patterns/D6/CQ-PF-01--2.md) (supported; CQ-PF-01)
- [D8/CQ-MF-01](../patterns/D8/CQ-MF-01.md) (supported; CQ-MF-01)
- [D8/Q-D8-10](../patterns/D8/Q-D8-10.md) (supported; Q-D8-10)
- [D8/Q-D8-18](../patterns/D8/Q-D8-18.md) (supported; Q-D8-18)
- [D9/CQ-CL-02](../patterns/D9/CQ-CL-02.md) (supported; CQ-CL-02)
- [D9/Q-D9-22](../patterns/D9/Q-D9-22.md) (supported; Q-D9-22)
- [K/CQ-AX-04](../patterns/K/CQ-AX-04.md) (supported; CQ-AX-04)
- [K/Q-K-23](../patterns/K/Q-K-23.md) (supported; Q-K-23)
- [QP/G-0](../patterns/QP/G-0.md) (held; CQ-ST-07, Q-D10-05, Q-D10-19, Q-D10-20, Q-D12-20, Q-D2-19, Q-D4-25, Q-D5-19, Q-D7-23, Q-D9-19)
- [QP/P-01a](../patterns/QP/P-01a.md) (supported; CQ-AX-01, CQ-AX-07, Q-K-01, Q-K-20)
- [QP/P-01b](../patterns/QP/P-01b.md) (supported; CQ-AX-01, CQ-AX-07, Q-K-01, Q-K-20)
- [QP/P-01c](../patterns/QP/P-01c.md) (supported; CQ-AX-01, CQ-AX-07, Q-K-01, Q-K-20)
- [QP/P-05b](../patterns/QP/P-05b.md) (supported; CQ-RC-01, CQ-RC-02, CQ-RC-03, CQ-RC-07, Q-D1-19, Q-D10-01, Q-D10-02, Q-D10-13, Q-D6-03)
- [QP/P-05c](../patterns/QP/P-05c.md) (supported; CQ-RC-01, CQ-RC-02, CQ-RC-03, CQ-RC-07, Q-D1-19, Q-D10-01, Q-D10-02, Q-D10-13, Q-D6-03)
- [QP/P-06a](../patterns/QP/P-06a.md) (supported; CQ-RC-05, Q-D10-03, Q-D5-01, Q-D5-02, Q-D5-03)
- … 13 more: `bks-schema find --kind pattern --label Activity`

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create at run start; update endedAt, receiptIds, digests, policyOutcome at apply
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

- [What do we already know about X? (run before every research mission)](../tasks/what-do-we-know-about-entity.md)
- [Trace an assertion to its source span and adjudication](../tasks/trace-answer-to-source.md)
- [Take a claim through vetting, an evidence mission and a published evidence report](../tasks/claim-to-evidence-report.md)

## v1 navigation aliases

- `node:Activity` is unchanged from v1.
(none)

## Source definition

- `release:sdl/modules/kernel.graphql#L1145-L1215`
- `release:registers/node-register.yaml#Activity`
- `release:workspace-inputs/identity-rules.yaml#Activity`
