---
id: "node:StudyPopulation"
kind: "node"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D3.graphql#L656-L688","release:registers/node-register.yaml#StudyPopulation","release:workspace-inputs/identity-rules.yaml#StudyPopulation"]
aliases: ["study population","study-population","studypopulation"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:65449616acb135484e76ee10ecddb32e2366022560fec0f5e67b109174e96dce"
---
# StudyPopulation

Purpose: who was eligible, enrolled, randomized or analyzed, as one source states it: size, sex and age bounds, healthy volunteers, species and strain for preclinical work (NCBI Taxonomy id as a string, so no taxon seam), eligibility and enrichment criteria text. Named by D5 target-effect Assertions through the kernel qualifier string `population:<uid>` (D5 vocab-targets.yaml 0.2.0; a string join, no edge), and assessed by the population dimension of applicability assessments. Replaces three pinned edges (eligible, enrolled, analyzed cohort). Identity rule: (study, sourceFamily, populationKind, analysisSet, payloadHash); sourceFamily as for StudyArm. uid token: `study-population`. Questions: Q-D3-17, Q-D3-06, CQ-EV-04, Q-D3-04.

## Identity

| | |
| --- | --- |
| id | `node:StudyPopulation` · raw SDL [sdl:StudyPopulation](../sdl/StudyPopulation.graphql) |
| module / domain | [D3](../modules/D3.md) / [Clinical and preclinical evidence](../domains/studies-and-evidence.md) |
| uid | `hu:study-population:<opaque>` |
| stored labels | `StudyPopulation` `Entity` (primary `StudyPopulation`) |
| archetype | Entity |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `study` + `sourceFamily (as StudyArm)` + `populationKind` + `analysisSet` + `payloadHash` |
| identity keys | `uid`, `name`, `populationKind`, `analysisSet`, `payloadHash` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (21)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D3.graphql:L660 |
| `uid` | `String!` | yes | create+update |  | D3.graphql:L661 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D3.graphql:L662 |
| `lastWriterRunId` | `String` |  | create+update |  | D3.graphql:L664 |
| `populationKind` | [StudyPopulationKind](../vocabularies/StudyPopulationKind.md) | yes | create+update |  | D3.graphql:L667 |
| `analysisSet` | [AnalysisSetKind](../vocabularies/AnalysisSetKind.md) |  | create+update |  | D3.graphql:L668 |
| `size` | `Int` |  | create+update |  | D3.graphql:L669 |
| `sizeText` | `String` |  | create+update |  | D3.graphql:L670 |
| `sexScope` | [SexScope](../vocabularies/SexScope.md) |  | create+update |  | D3.graphql:L671 |
| `minAgeYears` | `Float` |  | create+update |  | D3.graphql:L672 |
| `maxAgeYears` | `Float` |  | create+update |  | D3.graphql:L673 |
| `ageText` | `String` |  | create+update |  | D3.graphql:L674 |
| `healthyVolunteers` | `Boolean` |  | create+update |  | D3.graphql:L675 |
| `ncbiTaxonId` | `String` |  | create+update | NCBI Taxonomy id (9606 human, 10090 mouse). | D3.graphql:L677 |
| `strainOrLine` | `String` |  | create+update | Strain or line (UM-HET3, C57BL/6J). | D3.graphql:L679 |
| `eligibilityCriteriaText` | `String` |  | create+update |  | D3.graphql:L680 |
| `enrichmentText` | `String` |  | create+update | Enrichment as stated (e.g. 'highest tertile of p16 expression'). | D3.graphql:L682 |
| `payloadHash` | `String!` | yes | create+update |  | D3.graphql:L683 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D3.graphql:L665 |
| `updatedAt` | `DateTime` |  | create+update |  | D3.graphql:L666 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D3.graphql:L663 |

## Outgoing relationships (4)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:StudyPopulation --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [STATED_IN](../relationships/STATED_IN.md) | [Publication](Publication.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | StudyPopulation.statedIn (OUT) | `edge.assert` |
| [STATED_IN](../relationships/STATED_IN.md) | [RegistrationVersion](RegistrationVersion.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | StudyPopulation.statedIn (OUT) | `edge.assert` |
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
| [HAS_POPULATION](../relationships/HAS_POPULATION.md) | [Study](Study.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | Study.populations (OUT) | `edge.structural` |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (3)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [STATED_IN](../predicates/STATED_IN.md) | subject | authorizing | typed-edge | D3 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a StudyPopulation are Assertions with it as subject: `(:StudyPopulation)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (2)

- [D3/Q-D3-04](../patterns/D3/Q-D3-04.md) (supported; Q-D3-04)
- [QP/P-06b](../patterns/QP/P-06b.md) (supported; CQ-RC-05, Q-D10-03, Q-D5-01, Q-D5-02, Q-D5-03)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

- [Ingest a study with its registration versions, intervention material and results](../tasks/ingest-study-publication.md)

## v1 navigation aliases

- `node:StudyPopulation` is unchanged from v1.
(none)

## Source definition

- `release:sdl/modules/D3.graphql#L656-L688`
- `release:registers/node-register.yaml#StudyPopulation`
- `release:workspace-inputs/identity-rules.yaml#StudyPopulation`
