---
id: "node:Biomarker"
kind: "node"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D4.graphql#L292-L319","release:registers/node-register.yaml#Biomarker","release:workspace-inputs/identity-rules.yaml#Biomarker"]
aliases: ["biomarker"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:288483b86a91bbc168e64174b4a0794d35166b3acb87eee74b2ce03e24c7e6c2"
---
# Biomarker

Purpose: the biological referent a measurement is about (NAD+, glycated hemoglobin, IgG glycan profile, pace of biological aging). The join point of the compound → mechanism → biomarker → test path: D1 analytes and D2 mechanisms attach here, D3 outcome definitions and D5 targets (OPERATIONALIZED_BY) point here, and several Metrics QUANTIFY one Biomarker without ever being merged into one series (HbA1c % vs DNAm logA1C). Identity rule: curated BellLabs slug (`hu:biomarker:<slug>`). No identifiers of its own: a (scheme, value) such as a ChEBI or UniProt id identifies the analyte (D1 ChemicalSubstance / D2 MolecularEntity, reached by HAS_ANALYTE), never the Biomarker too. uid token: `biomarker`. Questions: Q-D4-01, Q-D4-02, Q-D4-16, Q-D4-17, Q-D4-03, CQ-DX-01.

## Identity

| | |
| --- | --- |
| id | `node:Biomarker` · raw SDL [sdl:Biomarker](../sdl/Biomarker.graphql) |
| module / domain | [D4](../modules/D4.md) / [Diagnostics, biomarkers, measurement and devices](../domains/diagnostics-and-devices.md) |
| uid | `hu:biomarker:<opaque>` |
| stored labels | `Biomarker` `Entity` (primary `Biomarker`) |
| archetype | Entity & Subjectable (curated vocabulary node) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `curated slug (hu:biomarker:<slug>)` |
| identity keys | `uid`, `name` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (10)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D4.graphql:L296 |
| `uid` | `String!` | yes | create+update |  | D4.graphql:L297 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D4.graphql:L298 |
| `lastWriterRunId` | `String` |  | create+update |  | D4.graphql:L300 |
| `biomarkerKind` | [BiomarkerKind](../vocabularies/BiomarkerKind.md) | yes | create+update |  | D4.graphql:L303 |
| `description` | `String` |  | create+update |  | D4.graphql:L304 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D4.graphql:L301 |
| `updatedAt` | `DateTime` |  | create+update |  | D4.graphql:L302 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D4.graphql:L299 |

### Search (derived, never evidence)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `searchText` | `String` |  | create+update | Names, synonyms and analyte names for fulltext entity linking (Q-D4-22). | D4.graphql:L306 |

## Outgoing relationships (5)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Biomarker --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_ANALYTE](../relationships/HAS_ANALYTE.md) | [ChemicalSubstance](ChemicalSubstance.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | Biomarker.analytes (OUT) | `edge.structural` |
| [HAS_ANALYTE](../relationships/HAS_ANALYTE.md) | [MolecularEntity](MolecularEntity.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | Biomarker.analyteEntities (OUT) | `edge.structural` |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [REFLECTS_MECHANISM](../relationships/REFLECTS_MECHANISM.md) | [Mechanism](Mechanism.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Biomarker.reflectsMechanisms (OUT) | `edge.assert` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (13)

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
| [MEASURES](../relationships/MEASURES.md) | [OutcomeDefinition](OutcomeDefinition.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | OutcomeDefinition.measures (OUT) | `edge.assert` |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [OPERATIONALIZED_BY](../relationships/OPERATIONALIZED_BY.md) | [Target](Target.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Target.operationalizedBy (OUT) | `edge.assert` |
| [QUANTIFIES](../relationships/QUANTIFIES.md) | [Metric](Metric.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | Metric.quantifies (OUT) | `edge.structural` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (10)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [DECREASES_LEVEL_OF](../predicates/DECREASES_LEVEL_OF.md) | object | relationship | assertion-only | D2 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [INCREASES_LEVEL_OF](../predicates/INCREASES_LEVEL_OF.md) | object | relationship | assertion-only | D2 |
| [INDICATES_CONDITION](../predicates/INDICATES_CONDITION.md) | subject | relationship | assertion-only | D4 |
| [MEASURES](../predicates/MEASURES.md) | object | authorizing | typed-edge | D3 |
| [MIXED_EFFECT_ON](../predicates/MIXED_EFFECT_ON.md) | object | relationship | assertion-only | D2 |
| [NO_CHANGE_IN](../predicates/NO_CHANGE_IN.md) | object | relationship | assertion-only | D2 |
| [OPERATIONALIZED_BY](../predicates/OPERATIONALIZED_BY.md) | object | authorizing | typed-edge | D5 |
| [REFLECTS_MECHANISM](../predicates/REFLECTS_MECHANISM.md) | subject | authorizing | typed-edge | D4 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a Biomarker are Assertions with it as subject: `(:Biomarker)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (1)

- [QP/P-12](../patterns/QP/P-12.md) (supported; Q-D1-08, Q-D2-02, Q-D2-03, Q-D4-01, Q-D4-17)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update descriptive fields; never delete
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `node:Biomarker` is unchanged from v1.
(none)

## Source definition

- `release:sdl/modules/D4.graphql#L292-L319`
- `release:registers/node-register.yaml#Biomarker`
- `release:workspace-inputs/identity-rules.yaml#Biomarker`
