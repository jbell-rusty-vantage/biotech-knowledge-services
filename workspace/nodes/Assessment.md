---
id: "node:Assessment"
kind: "node"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L953-L1030","release:registers/node-register.yaml#Assessment","release:workspace-inputs/identity-rules.yaml#Assessment"]
aliases: ["assessment","node:ApplicabilityDimension","node:ClaimEvidenceAssessment","node:ComparabilityAssessment","node:ConflictRelevanceAssessment","node:EndpointClassification","node:EquivalenceAssessment","node:EventImpactAssessment","node:EvidenceApplicability","node:EvidenceStrengthAssessment","node:EvidenceSynthesis","node:ResolutionHypothesis","node:ResultInterpretation","node:RetellingFidelityAssessment","node:SafetySignal","node:SourceAuthorityAssessment","ApplicabilityDimension","ClaimEvidenceAssessment","ComparabilityAssessment","ConflictRelevanceAssessment","EndpointClassification","EquivalenceAssessment","EventImpactAssessment","EvidenceApplicability","EvidenceStrengthAssessment","EvidenceSynthesis","ResolutionHypothesis","ResultInterpretation","RetellingFidelityAssessment","SafetySignal","SourceAuthorityAssessment"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:df0b6377e8c5e8ecafdce0d19213cddec9a000434f8ef528d926e5b24b49cfab"
---
# Assessment

Purpose: an immutable, versioned, supersedable judgment asserted by an agent or analyst with named inputs (PLAN 6.1 "assessment"): claim vetting (with `disposition`), derived insight, evidence synthesis, safety signal, resolution hypothesis (a surface form or handle at a located span → candidate entity: the span is HAS_EVIDENCE role CONTEXT, the candidate is ASSESSES, and `surfaceForm=`, `normalizedForm=`, `typeHint=` go in facets; there is no Mention node), equivalence of two identities, source authority per claim kind. An assessment that judges one occurrence (retelling fidelity, conflict relevance) ASSESSES that occurrence's Claim (and the speaker) and is DERIVED_FROM the judged occurrence(s), with `occurrence=<uid>` / `retelling=<uid>` / `original=<uid>` facets (R-20). Domain-specific assessment kinds are values of `assessmentKind` with their detail in `assessmentSubkind`; a domain needing typed, filterable properties on an assessment requests a kernel addition rather than declaring its own type. Harm is `effectDirection: HARM` on an assessment about a target, never a property of an entity. Typed slots shared by every domain (model stage): `gradeScheme` + `grade` + `certainty` (evidence grades, severity grades such as CTCAE), `conclusionCode` (one categorical outcome from the vocabulary the owning domain registers for its subkind, e.g. COMPARABLE, CONFIRMED_ASSOCIATION, REFINES for K.claim-relation), `facets` (registered `<facet>=<value>` codes). A third party's verdict is never an Assessment (it is a RATES_CLAIM Assertion by that party). Identity rule: (kind, subjects, methodVersion, inputs digest, recordedAt). uid token: `assessment`. Questions: Q-K-06, Q-K-09, Q-K-11, Q-K-13, Q-K-15, Q-K-19, Q-K-21, Q-K-30.

## Identity

| | |
| --- | --- |
| id | `node:Assessment` · raw SDL [sdl:Assessment](../sdl/Assessment.graphql) |
| module / domain | [K](../modules/K.md) / [Kernel, identity, time and provenance](../domains/kernel-and-provenance.md) |
| uid | `hu:assessment:<opaque>` |
| stored labels | `Assessment` `EvidenceAssessment` (primary `Assessment`) |
| archetype | EvidenceAssessment |
| interfaces | [Entity](../interfaces/Entity.md) |
| identity rule (register) | `assessmentKind` + `subjects` + `methodVersion` + `inputSetDigest` + `recordedAt` |
| identity keys | `uid`, `name`, `assessmentKind`, `methodVersion`, `inputSetDigest`, `recordedAt` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (35)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | kernel.graphql:L957 |
| `uid` | `String!` | yes | create+update |  | kernel.graphql:L958 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | kernel.graphql:L959 |
| `lastWriterRunId` | `String` |  | create+update |  | kernel.graphql:L961 |
| `assessmentKind` | [AssessmentKind](../vocabularies/AssessmentKind.md) | yes | create+update |  | kernel.graphql:L964 |
| `assessmentSubkind` | `String` |  | create+update | Domain detail of the kind, registered by the owning domain (e.g. D5.interaction-risk). | kernel.graphql:L966 |
| `status` | [AssessmentStatus](../vocabularies/AssessmentStatus.md) | yes | create+update |  | kernel.graphql:L967 |
| `methodVersion` | `String!` | yes | create+update |  | kernel.graphql:L968 |
| `disposition` | [ClaimDisposition](../vocabularies/ClaimDisposition.md) |  | create+update | VETTING only. | kernel.graphql:L970 |
| `verdict` | [SemanticVerdict](../vocabularies/SemanticVerdict.md) |  | create+update | When the assessment judges support of a proposition. | kernel.graphql:L972 |
| `effectDirection` | [EffectDirection](../vocabularies/EffectDirection.md) |  | create+update |  | kernel.graphql:L973 |
| `score` | `Float` |  | create+update | The method's own score (e.g. resolution score); never a truth value. | kernel.graphql:L975 |
| `gradeScheme` | `String` |  | create+update | Named grading scheme (GRADE, OCEBM-2011, USPSTF-2012, CTCAE_V5, LIVERTOX-LIKELIHOOD, BELLLABS-<name>@<version>). | kernel.graphql:L977 |
| `grade` | `String` |  | create+update | Grade under gradeScheme, as the scheme spells it. | kernel.graphql:L979 |
| `certainty` | [CertaintyLevel](../vocabularies/CertaintyLevel.md) |  | create+update |  | kernel.graphql:L980 |
| `conclusionCode` | `String` |  | create+update | Categorical outcome from the vocabulary registered for assessmentSubkind by the owning domain. | kernel.graphql:L982 |
| `facets` | `[String!]` |  | create+update | Registered `<facet>=<value>` codes for further categorical facets (filter with includes). | kernel.graphql:L984 |
| `summary` | `String` |  | create+update |  | kernel.graphql:L985 |
| `rationale` | `String` |  | create+update |  | kernel.graphql:L986 |
| `evidenceCutoffAt` | `DateTime` |  | create+update | Latest evidence the assessment considered (as-of cutoff). | kernel.graphql:L988 |
| `inputSetDigest` | `String` |  | create+update | sha256:<hex> over the sorted input uids and their contentHashes. | kernel.graphql:L990 |
| `rubricRef` | `String` |  | create+update | Versioned rubric reference (assessment kind version) the judgment applied (R-SV10). | kernel.graphql:L992 |
| `policyRef` | `String` |  | create+update | Versioned policy reference the use decision was taken under (R-SV10). | kernel.graphql:L994 |
| `useDecisionRef` | `String` |  | create+update | Immutable reference to the Knowledge Services use decision (PostgreSQL authority) this assessment records (R-SV10). | kernel.graphql:L996 |
| `useDecisionDigest` | `String` |  | create+update | sha256:<hex> digest of that use decision record (R-SV11); official reads compare it with the authority's record before serving. | kernel.graphql:L998 |
| `useDisposition` | [UseDisposition](../vocabularies/UseDisposition.md) |  | create+update | Disposition of that use decision for the exact effect, use and audience (R-SV10). Separate from disposition (claim vetting). | kernel.graphql:L1000 |
| `revocationEpoch` | `Int` |  | create+update | Revocation epoch (authoritative per-scope high-water mark) the decision was checked against (R-SV10). A projection never authorizes use after an obse… | kernel.graphql:L1002 |
| `expiresAt` | `DateTime` |  | create+update | Expiry of the use decision, when it has one (R-SV10). | kernel.graphql:L1004 |
| `reviewerAdjudicationRef` | `String` |  | create+update | Reference to the qualified human reviewer adjudication that signed the exact bindings, when one did (R-SV10). | kernel.graphql:L1006 |
| `supersedesUid` | `String` |  | create+update |  | kernel.graphql:L1009 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | kernel.graphql:L962 |
| `updatedAt` | `DateTime` |  | create+update |  | kernel.graphql:L963 |
| `recordedAt` | `DateTime!` | yes | create+update |  | kernel.graphql:L1007 |
| `recordedTo` | `DateTime` |  | create+update |  | kernel.graphql:L1008 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | kernel.graphql:L960 |

## Outgoing relationships (5)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Assessment --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [ASSESSES](../relationships/ASSESSES.md) | [Subjectable](../interfaces/Subjectable.md) (56 members) | structural | recorded-only |  | Assessment.about (OUT); Claim.assessments (IN) | planner-emitted (kernel plumbing) |
| [DERIVED_FROM](../relationships/DERIVED_FROM.md) | [Assertion](Assertion.md) | structural | recorded-only |  | Assessment.inputAssertions (OUT) | planner-emitted (kernel plumbing) |
| [DERIVED_FROM](../relationships/DERIVED_FROM.md) | [Assessment](Assessment.md) | structural | recorded-only |  | Assessment.inputAssessments (OUT) | planner-emitted (kernel plumbing) |
| [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) | [SourceLocator](SourceLocator.md) | structural | recorded-only | [EvidenceEdgeProperties](../edge-properties/EvidenceEdgeProperties.md) | Assessment.evidence (OUT) | planner-emitted (kernel plumbing) |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN); Assessment.generatedBy (OUT) | planner-emitted (kernel plumbing) |

## Incoming relationships (3)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

| type | from | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [BLOCKED_BY](../relationships/BLOCKED_BY.md) | [ReportItem](ReportItem.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ReportItem.blockedByAssessments (OUT) | `edge.structural` |
| [DERIVED_FROM](../relationships/DERIVED_FROM.md) | [Report](Report.md) | structural | recorded-only |  | Report.citesAssessments (OUT) | planner-emitted (kernel plumbing) |
| [DERIVED_FROM](../relationships/DERIVED_FROM.md) | [ReportItem](ReportItem.md) | structural | recorded-only |  | ReportItem.citesAssessments (OUT) | planner-emitted (kernel plumbing) |

## Legal predicates (0)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

(none)

## Evidence path

- Provenance requirement: ASSESSES its target, DERIVED_FROM its inputs, HAS_EVIDENCE for located support, WAS_GENERATED_BY the assessing Activity; method version recorded
- Assessment does not implement Subjectable: no Assertion takes it as subject; its records carry lineage through `WAS_GENERATED_BY`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **recorded**.
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (39)

- [D1/CQ-ID-04](../patterns/D1/CQ-ID-04.md) (supported; CQ-ID-04)
- [D10/Q-D10-03](../patterns/D10/Q-D10-03.md) (supported; Q-D10-03)
- [D10/Q-D10-08](../patterns/D10/Q-D10-08.md) (supported; Q-D10-08)
- [D12/Q-D12-18](../patterns/D12/Q-D12-18.md) (supported; Q-D12-18)
- [D13/Q-D13-04#1](../patterns/D13/Q-D13-04--1.md) (supported; Q-D13-04)
- [D3/CQ-EV-05#2](../patterns/D3/CQ-EV-05--2.md) (supported; CQ-EV-05)
- [D3/Q-D3-04](../patterns/D3/Q-D3-04.md) (supported; Q-D3-04)
- [D7/CQ-CL-05#1](../patterns/D7/CQ-CL-05--1.md) (supported; CQ-CL-05)
- [D7/Q-D7-06#1](../patterns/D7/Q-D7-06--1.md) (supported; Q-D7-06)
- [D7/Q-D7-08#1](../patterns/D7/Q-D7-08--1.md) (supported; Q-D7-08)
- [D9/CQ-CL-04](../patterns/D9/CQ-CL-04.md) (supported; CQ-CL-04)
- [D9/CQ-CL-05](../patterns/D9/CQ-CL-05.md) (supported; CQ-CL-05)
- [D9/CQ-CL-06](../patterns/D9/CQ-CL-06.md) (supported; CQ-CL-06)
- [D9/CQ-CL-07](../patterns/D9/CQ-CL-07.md) (supported; CQ-CL-07)
- [D9/CQ-PV-04](../patterns/D9/CQ-PV-04.md) (supported; CQ-PV-04)
- [D9/CQ-RC-05](../patterns/D9/CQ-RC-05.md) (supported; CQ-RC-05)
- [D9/Q-D9-02](../patterns/D9/Q-D9-02.md) (supported; Q-D9-02)
- [D9/Q-D9-05](../patterns/D9/Q-D9-05.md) (supported; Q-D9-05)
- [D9/Q-D9-09](../patterns/D9/Q-D9-09.md) (supported; Q-D9-09)
- [D9/Q-D9-11](../patterns/D9/Q-D9-11.md) (supported; Q-D9-11)
- … 19 more: `bks-schema find --kind pattern --label Assessment`

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `close`, `create`
- Policy: create; close once on supersession
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

- [What do we already know about X? (run before every research mission)](../tasks/what-do-we-know-about-entity.md)
- [Should I update an existing node or create a new one?](../tasks/decide-update-or-create.md)
- [Stage something you found but cannot resolve or place](../tasks/stage-unresolved-mention.md)
- [Take a claim through vetting, an evidence mission and a published evidence report](../tasks/claim-to-evidence-report.md)
- [Record a financial interest or conflict and its disclosure](../tasks/interest-conflict-disclosure.md)

## v1 navigation aliases

- `node:ApplicabilityDimension` (merged): D3: K.Assessment (child, subkind D3.applicability.dimension, facets dimension=<...>, missing=<fact>; conclusionCode) ‖ D10: D3 (owner of evidence assessment co…
- `node:ClaimEvidenceAssessment` (merged): K: K.Assessment (EVIDENCE_SYNTHESIS) / K.Report EVIDENCE_REPORT (pinned in W21) ‖ D9: K.Assessment (EVIDENCE_SYNTHESIS; D3/D10 own the kind) ‖ D10: K.Assessmen…
- `node:ComparabilityAssessment` (merged): K: K.Assessment (COMPARABILITY, conclusionCode vocabulary D4) ‖ D4: K.Assessment
- `node:ConflictRelevanceAssessment` (merged): K: K.Assessment (CONFLICT_RELEVANCE, subkind and questions D7) ‖ D9: K.Assessment (CONFLICT_RELEVANCE; one register entry D7.conflict-relevance, registrar D7;…
- `node:EndpointClassification` (merged): D3: K.Assessment (kind OTHER, subkind D3.endpoint-classification, ASSESSES OutcomeDefinition; conclusionCode = endpoint class, facets bestCategory=<BEST catego…
- `node:EquivalenceAssessment` (merged): K: K.Assessment (assessmentKind EQUIVALENCE)
- `node:EventImpactAssessment` (merged): K: K.Assessment (EVENT_IMPACT; questions D13) ‖ D9: K.Assessment (D13 kind) ‖ D13: kernel Assessment (see deferred)
- `node:EvidenceApplicability` (merged): D3: K.Assessment (assessmentKind APPLICABILITY, ASSESSES study evidence + use-side entity) ‖ D10: D3 (owner of evidence assessment content; kernel Assessment k…
- `node:EvidenceStrengthAssessment` (merged): K: K.Assessment (EVIDENCE_SYNTHESIS with gradeScheme / grade / certainty; questions D3) ‖ D3: K.Assessment (assessmentKind QUALITY, subkind D3.evidence-strengt…
- `node:EvidenceSynthesis` (merged): D3: K.Assessment (assessmentKind EVIDENCE_SYNTHESIS, ASSESSES Claim, DERIVED_FROM the StudyResults' STATED_IN Assertions) ‖ D10: K.Assessment (assessmentKind E…
- `node:ResolutionHypothesis` (merged): K: K.Assessment (assessmentKind RESOLUTION; HAS_EVIDENCE role CONTEXT to the surface-form SourceLocator; ASSESSES the candidate)
- `node:ResultInterpretation` (merged): D3: K.Assessment (kind OTHER, subkind D3.result-interpretation, ASSESSES StudyResult; effectDirection + conclusionCode; threshold source = HAS_EVIDENCE role CO…
- `node:RetellingFidelityAssessment` (merged): K: K.Assessment (RETELLING_FIDELITY, subkind and questions D9) ‖ D9: K.Assessment (RETELLING_FIDELITY; D9 owns kind values and questions)
- `node:SafetySignal` (merged): D5: Assessment
- `node:SourceAuthorityAssessment` (merged): K: K.Assessment (assessmentKind SOURCE_AUTHORITY, register content D9) + EvidenceEdgeProperties.authority/independence ‖ D9: K.Assessment (SOURCE_AUTHORITY); r…

## Source definition

- `release:sdl/modules/kernel.graphql#L953-L1030`
- `release:registers/node-register.yaml#Assessment`
- `release:workspace-inputs/identity-rules.yaml#Assessment`
