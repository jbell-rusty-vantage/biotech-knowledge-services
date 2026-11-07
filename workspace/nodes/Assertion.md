---
id: "node:Assertion"
kind: "node"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L708-L803","release:registers/node-register.yaml#Assertion","release:workspace-inputs/identity-rules.yaml#Assertion"]
aliases: ["assertion","node:ClaimOccurrence","node:ContraindicationAssertion","node:InteractionAssertion","node:ManufacturingCapability","node:Observation","node:ProtocolResult","node:RelationshipAssertion","ClaimOccurrence","ContraindicationAssertion","InteractionAssertion","ManufacturingCapability","Observation","ProtocolResult","RelationshipAssertion"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:dfd18eed2dbe87b4a244730bff974daa800040ea12709a5398550a2ab9b41dfc"
---
# Assertion

Purpose: one attributable proposition (verification.v1 Assertion): exactly one subject, exactly one object or one typed literal, exactly one asserter, at least one located span (HAS_EVIDENCE role SUPPORTS origin DECLARED). It authorizes every asserted edge (AssertedEdgeProperties.assertionUid). A claim occurrence is an Assertion with `assertionKind: CLAIM` (stored with the `Assertion` label only, no extra label; F-05) and one OCCURRENCE_OF edge to its Claim; a recommendation is a claim occurrence with `speechAct: RECOMMENDS` (00-DIRECTIVE 3.9). Bitemporal: valid time declared (validFrom/validTo, half-open), recorded time service-assigned (recordedAt; recordedTo written once on supersession; the successor names it in `supersedesUid`, same asserter only, R-23). `status` is capture fidelity, never truth. An Assertion that authorizes a typed edge has assertionKind RELATIONSHIP; only propositions entering the Claim lifecycle are CLAIM; a node property read as a fact is written under a FIELD Assertion (registered field predicate) and the node value is a cache (R-14, R-19). Asserter (R-15, R-16): the issuer the document presents; a multi-author work (D3 Publication, D9 MediaWork) for what it states in its own voice; else the Source's publisher Organization with qualifier `asserterBasis:PUBLISHER_DEFAULT`; the BellLabs Agent only for BellLabs statements; an inferred speaker with `asserterBasis:INFERRED` plus a RESOLUTION Assessment citing the span. Kernel predicate conventions, registered once by K in the release registry vocabularies/predicates.yaml (R-52; values of `predicate`, no typed relationship): RATES_CLAIM (a third party's verdict on a Claim: subject the Claim, valueString the rating text, qualifier `scale=<...>`, asserter the rater, optional HAS_OBJECT the rating instrument record; never our Assessment; its lattice mapping is a versioned D10 query-time rule, R-31), HAS_REVISION_STATUS (subject a Source, valueString a SourceRevisionKind value, one Assertion per authority; only for non-scholarly Sources and for status flags with no identified notice; an identified notice or new version is D3 REVISES, never both for one asserter and notice, R-44), FIELD_NOT_REPORTED (subject the entity the field would describe, valueString the field the source was read for, locator the section read or WHOLE_SNAPSHOT), CORRECTS (a correction occurrence, plus DERIVED_FROM the corrected occurrence, R-20), CITES_AS_SUPPORT, HAS_CREDENTIAL, and HAS_IDENTIFIER (the authorization of each HAS_IDENTIFIER episode, written by identifier.attach). A qualification is HAS_EVIDENCE {role QUALIFIES} plus qualifier prefixes (R-20). A retelling (an occurrence restating someone else's finding) has `basisKind: CITED_FROM_PRIOR_WORK` and DERIVED_FROM the primary occurrence. A measured null is a positive statement of no change (`polarity: POSITIVE` with a NO_CHANGE / NO_EFFECT predicate and `basisKind: DIRECT_MEASUREMENT`); NEGATIVE is a denial, never "not reported". Identity rule: (subject, predicate, object or literal, asserter, locator set, validity) per intent; uid token: `assertion`. Questions: Q-K-01, Q-K-02, Q-K-06, Q-K-07, Q-K-09, Q-K-10, Q-K-11, Q-K-15, Q-K-16, Q-K-20, Q-K-21, Q-K-22, Q-K-27, Q-K-30, CQ-TM-02.

## Identity

| | |
| --- | --- |
| id | `node:Assertion` · raw SDL [sdl:Assertion](../sdl/Assertion.graphql) |
| module / domain | [K](../modules/K.md) / [Kernel, identity, time and provenance](../domains/kernel-and-provenance.md) |
| uid | `hu:assertion:<opaque>` |
| stored labels | `Assertion` (primary `Assertion`) |
| archetype | Assertion |
| interfaces | [Entity](../interfaces/Entity.md) |
| identity rule (register) | `subject` + `predicate` + `object or literal` + `asserter` + `locator set` + `validity` |
| identity keys | `uid`, `name`, `predicate` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (40)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | kernel.graphql:L712 |
| `uid` | `String!` | yes | create+update |  | kernel.graphql:L713 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | kernel.graphql:L714 |
| `lastWriterRunId` | `String` |  | create+update |  | kernel.graphql:L716 |
| `predicate` | `String!` | yes | create+update | Registered predicate (release vocabularies/predicates.yaml, status registered; an alias-of name is re-keyed to its target before ingest, a retired or… | kernel.graphql:L720 |
| `assertionKind` | [AssertionKind](../vocabularies/AssertionKind.md) | yes | create+update |  | kernel.graphql:L721 |
| `claimType` | [ClaimType](../vocabularies/ClaimType.md) |  | create+update | Required when assertionKind is CLAIM (verification.v1 rule). | kernel.graphql:L723 |
| `status` | [AssertionStatus](../vocabularies/AssertionStatus.md) | yes | create+update |  | kernel.graphql:L724 |
| `polarity` | [Polarity](../vocabularies/Polarity.md) |  | create+update |  | kernel.graphql:L725 |
| `speechAct` | [SpeechAct](../vocabularies/SpeechAct.md) |  | create+update |  | kernel.graphql:L726 |
| `basisKind` | [BasisKind](../vocabularies/BasisKind.md) |  | create+update |  | kernel.graphql:L727 |
| `proposition` | `String` |  | create+update | Natural-language proposition (verification.v1 proposition) when the record is not a typed literal. | kernel.graphql:L729 |
| `qualifiers` | `[String!]` |  | create+update | verification.v1 qualifiers (population, dose, condition) that must survive any retelling; registered prefixes such as `segment:<KIND>` (D9 segment of… | kernel.graphql:L731 |
| `valueString` | `String` |  | create+update |  | kernel.graphql:L732 |
| `valueNumber` | `Float` |  | create+update |  | kernel.graphql:L733 |
| `valueBoolean` | `Boolean` |  | create+update |  | kernel.graphql:L734 |
| `unitCode` | `String` |  | create+update | UCUM unit of valueNumber, or an ISO 4217 currency written `iso4217:<CODE>` for a price. | kernel.graphql:L736 |
| `validObservedAt` | `DateTime` |  | create+update | Date at which the source states the fact held when it gives no bounds (validFromBasis OBSERVATION_ONLY keeps validFrom null). | kernel.graphql:L744 |
| `validObservedAtPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update | Precision of validObservedAt (R-24). | kernel.graphql:L746 |
| `contentHash` | `String` |  | create+update | sha256:<hex> over the canonical immutable content. | kernel.graphql:L752 |
| `supersedesUid` | `String` |  | create+update | uid of the Assertion this one supersedes (newer → older); same asserter only (R-23). | kernel.graphql:L754 |
| `derivationRule` | `String` |  | create+update | Named rule for a CALCULATED assertion or an INFERRED bound. | kernel.graphql:L756 |
| `extractionConfidence` | `Float` |  | create+update | Extraction dimension of confidence; interpretable only with the generating Activity's methodVersion. | kernel.graphql:L758 |
| `riskClass` | `String` |  | create+update | verification.v1 riskClass (low\|medium\|high\|critical) when the producer declared one. | kernel.graphql:L760 |
| `verificationAssertionId` | `String` |  | create+update | verification.v1 assertionId when the verifier saw this record. | kernel.graphql:L762 |
| `assertionVersionRef` | `String` |  | create+update | Immutable reference to the Knowledge Services AssertionVersion this record materializes (R-SV10); the version store is PostgreSQL, not the graph. | kernel.graphql:L764 |
| `logicalAssertionId` | `String` |  | create+update | Logical assertion id shared by every version of the same proposition (Knowledge Services AssertionVersion.logicalId, R-SV10). | kernel.graphql:L766 |
| `supportSetDigest` | `String` |  | create+update | sha256:<hex> of the selected support set (conjunctive required premises and their evidence fragments) the use decision bound (R-SV10). | kernel.graphql:L768 |
| `qualifiersDigest` | `String` |  | create+update | sha256:<hex> over the canonical JSON of the profile-specific qualifiers of the AssertionVersion (R-SV10). The graph does not model profile qualifier… | kernel.graphql:L770 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | kernel.graphql:L717 |
| `updatedAt` | `DateTime` |  | create+update |  | kernel.graphql:L718 |
| `validFrom` | `DateTime` |  | create+update |  | kernel.graphql:L737 |
| `validTo` | `DateTime` |  | create+update |  | kernel.graphql:L738 |
| `validFromPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | kernel.graphql:L739 |
| `validToPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | kernel.graphql:L740 |
| `validFromBasis` | [ValidTimeBasis](../vocabularies/ValidTimeBasis.md) |  | create+update |  | kernel.graphql:L741 |
| `validToBasis` | [ValidTimeBasis](../vocabularies/ValidTimeBasis.md) |  | create+update |  | kernel.graphql:L742 |
| `recordedAt` | `DateTime!` | yes | create+update | Service-assigned commit time (recorded-time start); never before the cited snapshot's retrievedAt. | kernel.graphql:L748 |
| `recordedTo` | `DateTime` |  | create+update | Written once on supersession. | kernel.graphql:L750 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | kernel.graphql:L715 |

## Outgoing relationships (10)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Assertion --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [ASSERTED_BY](../relationships/ASSERTED_BY.md) | [Subjectable](../interfaces/Subjectable.md) (56 members) | structural | recorded-only |  | Assertion.assertedBy (OUT) | planner-emitted (kernel plumbing) |
| [DERIVED_FROM](../relationships/DERIVED_FROM.md) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.derivedFrom (OUT) | planner-emitted (kernel plumbing) |
| [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) | [SourceLocator](SourceLocator.md) | structural | recorded-only | [EvidenceEdgeProperties](../edge-properties/EvidenceEdgeProperties.md) | Assertion.evidence (OUT) | planner-emitted (kernel plumbing) |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) | [Subjectable](../interfaces/Subjectable.md) (56 members) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) | [Subjectable](../interfaces/Subjectable.md) (56 members) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [OBSERVED_IN_CONTEXT](../relationships/OBSERVED_IN_CONTEXT.md) | [MechanismEvidenceContext](MechanismEvidenceContext.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | MechanismEvidenceContext.assertions (IN) | `edge.structural` |
| [OCCURRENCE_OF](../relationships/OCCURRENCE_OF.md) | [Claim](Claim.md) | structural | recorded-only |  | Assertion.occurrenceOf (OUT); Claim.occurrences (IN) | planner-emitted (kernel plumbing) |
| [OCCURS_IN](../relationships/OCCURS_IN.md) | [MediaWork](MediaWork.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | MediaWork.occurrences (IN) | `edge.structural` |
| [RESOLVES_TO_CONSTRAINT](../relationships/RESOLVES_TO_CONSTRAINT.md) | [UseConstraint](UseConstraint.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | UseConstraint.resolvedFrom (IN) | read-only |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN); Assertion.generatedBy (OUT) | planner-emitted (kernel plumbing) |

## Incoming relationships (5)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

| type | from | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [ASSESSES](../relationships/ASSESSES.md) | [Adjudication](Adjudication.md) | structural | recorded-only |  | Adjudication.evaluates (OUT); Assertion.adjudications (IN) | planner-emitted (kernel plumbing) |
| [DERIVED_FROM](../relationships/DERIVED_FROM.md) | [Assessment](Assessment.md) | structural | recorded-only |  | Assessment.inputAssertions (OUT) | planner-emitted (kernel plumbing) |
| [DERIVED_FROM](../relationships/DERIVED_FROM.md) | [Association](Association.md) | structural | recorded-only |  | Association.inputs (OUT) | planner-emitted (kernel plumbing) |
| [DERIVED_FROM](../relationships/DERIVED_FROM.md) | [Report](Report.md) | structural | recorded-only |  | Report.citesAssertions (OUT) | planner-emitted (kernel plumbing) |
| [DERIVED_FROM](../relationships/DERIVED_FROM.md) | [ReportItem](ReportItem.md) | structural | recorded-only |  | ReportItem.citesAssertions (OUT) | planner-emitted (kernel plumbing) |

## Legal predicates (1)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [ADMINISTERED_MATERIAL_PURITY](../predicates/ADMINISTERED_MATERIAL_PURITY.md) | object | field | field | D3 |

## Evidence path

- Provenance requirement: ASSERTED_BY an asserter, HAS_EVIDENCE to a SourceLocator (role, origin), WAS_GENERATED_BY the writing Activity; status is capture fidelity, never truth
- Assertion does not implement Subjectable: no Assertion takes it as subject; its records carry lineage through `WAS_GENERATED_BY`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **bitemporal**.
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (116)

- [D1/CQ-ID-03](../patterns/D1/CQ-ID-03.md) (supported; CQ-ID-03)
- [D1/CQ-ID-04](../patterns/D1/CQ-ID-04.md) (supported; CQ-ID-04)
- [D1/CQ-PF-01](../patterns/D1/CQ-PF-01.md) (supported; CQ-PF-01)
- [D1/Q-D1-16](../patterns/D1/Q-D1-16.md) (supported; Q-D1-16)
- [D10/Q-D10-03](../patterns/D10/Q-D10-03.md) (supported; Q-D10-03)
- [D10/Q-D10-08](../patterns/D10/Q-D10-08.md) (supported; Q-D10-08)
- [D10/Q-D10-21](../patterns/D10/Q-D10-21.md) (supported; Q-D10-21)
- [D11/CQ-PV-05](../patterns/D11/CQ-PV-05.md) (supported; CQ-PV-05)
- [D11/Q-D11-05](../patterns/D11/Q-D11-05.md) (supported; Q-D11-05)
- [D11/Q-D11-08](../patterns/D11/Q-D11-08.md) (supported; Q-D11-08)
- [D11/Q-D11-19](../patterns/D11/Q-D11-19.md) (supported; Q-D11-19)
- [D12/Q-D12-03#option-a](../patterns/D12/Q-D12-03--option-a.md) (supported; Q-D12-03)
- [D12/Q-D12-06#option-a](../patterns/D12/Q-D12-06--option-a.md) (supported; Q-D12-06)
- [D12/Q-D12-18](../patterns/D12/Q-D12-18.md) (supported; Q-D12-18)
- [D13/Q-D13-04#1](../patterns/D13/Q-D13-04--1.md) (supported; Q-D13-04)
- [D13/Q-D13-12#1](../patterns/D13/Q-D13-12--1.md) (supported; Q-D13-12)
- [D13/Q-D13-14#1](../patterns/D13/Q-D13-14--1.md) (supported; Q-D13-14)
- [D13/Q-D13-22#1](../patterns/D13/Q-D13-22--1.md) (supported; Q-D13-22)
- [D2/Q-D2-10](../patterns/D2/Q-D2-10.md) (supported; Q-D2-10)
- [D2/Q-D2-18](../patterns/D2/Q-D2-18.md) (supported; Q-D2-18)
- … 96 more: `bks-schema find --kind pattern --label Assertion`

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `close`, `create`
- Policy: create; close once (recordedTo, status SUPERSEDED / status from adjudication); never delete
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

- [What do we already know about X? (run before every research mission)](../tasks/what-do-we-know-about-entity.md)
- [Ingest claims made in a podcast or video episode](../tasks/ingest-podcast-claims.md)
- [Record mechanism evidence (measured vs inferred) for a substance](../tasks/ingest-mechanism-evidence.md)
- [Trace an assertion to its source span and adjudication](../tasks/trace-answer-to-source.md)
- [Correct or end a fact that is no longer true](../tasks/correct-a-stale-fact.md)
- [Take a claim through vetting, an evidence mission and a published evidence report](../tasks/claim-to-evidence-report.md)
- [Record a financial interest or conflict and its disclosure](../tasks/interest-conflict-disclosure.md)

## v1 navigation aliases

- `node:Assertion` is unchanged from v1.
- `node:ClaimOccurrence` (merged): K: K.Assertion (assertionKind CLAIM, stored label ClaimOccurrence) + OCCURRENCE_OF (pinned in W21) ‖ D9: K.Assertion (assertionKind CLAIM, label ClaimOccurrenc…
- `node:ContraindicationAssertion` (merged): D5: Assertion
- `node:InteractionAssertion` (merged): D5: Assertion
- `node:ManufacturingCapability` (merged): D8: Assertion.predicate HAS_CAPABILITY_STAGE (deferred as node)
- `node:Observation` (merged): D5: Assertion
- `node:ProtocolResult` (merged): D5: Assertion
- `node:RelationshipAssertion` (merged): D9: K.Assertion

## Source definition

- `release:sdl/modules/kernel.graphql#L708-L803`
- `release:registers/node-register.yaml#Assertion`
- `release:workspace-inputs/identity-rules.yaml#Assertion`
