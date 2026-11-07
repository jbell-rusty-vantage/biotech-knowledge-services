---
id: "node:Mechanism"
kind: "node"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D2.graphql#L255-L288","release:registers/node-register.yaml#Mechanism","release:workspace-inputs/identity-rules.yaml#Mechanism"]
aliases: ["mechanism","node:Pathway","Pathway"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:b9f348cf1f58140c12673d4474e465f6fe5085a7b56d9e40a02ce0e7a3a21a06"
---
# Mechanism

Purpose: a curated mechanism concept — hallmark of aging, biological process, curated pathway record or molecular function (mechanismKind) — the vocabulary every mechanism claim resolves to and the hub of the compound → mechanism → biomarker → test path. Pathway and Hallmark are kinds of Mechanism, not separate types. Identity rule: `key` — `<scheme>:<unversioned authority id>` for authority records (reactome:R-HSA-196807, go:GO:0090398), `bellabs:<slug>` for curated concepts (bellabs:hallmark-cellular-senescence); the authority id is also attached as a kernel Identifier (REACTOME, GO). The version seen lives in `referenceRelease`, never in the key. uid token: `mechanism` (hu:mechanism:<opaque>). Questions: CQ-MX-01, CQ-MX-05, Q-D2-01, Q-D2-02, Q-D2-03, Q-D2-06, Q-D2-10, Q-D2-11, Q-D2-12, Q-D2-14, Q-D2-15, Q-D2-18, Q-D2-19, Q-D2-26.

## Identity

| | |
| --- | --- |
| id | `node:Mechanism` · raw SDL [sdl:Mechanism](../sdl/Mechanism.graphql) |
| module / domain | [D2](../modules/D2.md) / [Substances, materials, mechanisms and biology](../domains/substances-and-biology.md) |
| uid | `hu:mechanism:<opaque>` |
| stored labels | `Mechanism` `Entity` (primary `Mechanism`) |
| archetype | vocabulary (curated, ~100–300 nodes; Reactome/GO mirrors added on demand) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `key` |
| identity keys | `uid`, `name`, `key` |
| identifier schemes | `REACTOME` (active), `GO` (active), `WIKIDATA` (active), `MESH` (active), `WIKIPATHWAYS` (disabled), `KEGG_PATHWAY` (disabled) |
| name match (workspace rule) | `name` · uid slug from `key` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (13)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D2.graphql:L259 |
| `uid` | `String!` | yes | create+update |  | D2.graphql:L260 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D2.graphql:L261 |
| `lastWriterRunId` | `String` |  | create+update |  | D2.graphql:L263 |
| `key` | `String` |  | create+update | Stable vocabulary key (identity); never reused. | D2.graphql:L267 |
| `mechanismKind` | [MechanismKind](../vocabularies/MechanismKind.md) |  | create+update |  | D2.graphql:L268 |
| `referenceScheme` | [MechanismReferenceScheme](../vocabularies/MechanismReferenceScheme.md) |  | create+update |  | D2.graphql:L269 |
| `referenceRelease` | `String` |  | create+update | Authority release currently loaded for this record (e.g. R-HSA-196807.8). | D2.graphql:L271 |
| `description` | `String` |  | create+update |  | D2.graphql:L272 |
| `synonyms` | `[String!]` |  | create+update | Alternative names; feed the fulltext index mechanism_text (name, description, synonyms) used for entity linking. | D2.graphql:L274 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D2.graphql:L264 |
| `updatedAt` | `DateTime` |  | create+update |  | D2.graphql:L265 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D2.graphql:L262 |

## Outgoing relationships (3)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Mechanism --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [PART_OF_MECHANISM](../relationships/PART_OF_MECHANISM.md) | [Mechanism](Mechanism.md) | asserted | recorded-only | [MechanismReferenceProperties](../edge-properties/MechanismReferenceProperties.md) | Mechanism.partOf (OUT) | `edge.assert` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (15)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

| type | from | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [AFFECTS_MECHANISM](../relationships/AFFECTS_MECHANISM.md) | [ChemicalSubstance](ChemicalSubstance.md) | derived | recorded-only | [MechanismProjectionProperties](../edge-properties/MechanismProjectionProperties.md) | Mechanism.affectedBy (IN) | read-only |
| [AFFECTS_MECHANISM](../relationships/AFFECTS_MECHANISM.md) | [Intervention](Intervention.md) | derived | recorded-only | [MechanismProjectionProperties](../edge-properties/MechanismProjectionProperties.md) | Mechanism.affectedBy (IN) | read-only |
| [ASSERTED_BY](../relationships/ASSERTED_BY.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.assertedBy (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assessment](Assessment.md) | structural | recorded-only |  | Assessment.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Report](Report.md) | structural | recorded-only |  | Report.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ReportItem](ReportItem.md) | structural | recorded-only |  | ReportItem.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSOCIATES](../relationships/ASSOCIATES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Association](Association.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Association.members (OUT) | read-only |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [PARTICIPATES_IN](../relationships/PARTICIPATES_IN.md) | [ChemicalSubstance](ChemicalSubstance.md) | asserted | recorded-only | [MechanismReferenceProperties](../edge-properties/MechanismReferenceProperties.md) | Mechanism.metaboliteParticipants (IN) | `edge.assert` |
| [PARTICIPATES_IN](../relationships/PARTICIPATES_IN.md) | [MolecularEntity](MolecularEntity.md) | asserted | recorded-only | [MechanismReferenceProperties](../edge-properties/MechanismReferenceProperties.md) | MolecularEntity.participatesIn (OUT) | `edge.assert` |
| [REFLECTS_MECHANISM](../relationships/REFLECTS_MECHANISM.md) | [Biomarker](Biomarker.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Biomarker.reflectsMechanisms (OUT) | `edge.assert` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (18)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [AFFECTS_ORGAN](../predicates/AFFECTS_ORGAN.md) | subject | literal | literal | D2 |
| [ATTENUATES_INDUCTION_OF](../predicates/ATTENUATES_INDUCTION_OF.md) | object | relationship | assertion-only | D2 |
| [DECREASES_ACTIVITY_OF](../predicates/DECREASES_ACTIVITY_OF.md) | object | relationship | assertion-only | D2 |
| [DECREASES_LEVEL_OF](../predicates/DECREASES_LEVEL_OF.md) | subject | relationship | assertion-only | D2 |
| [DECREASES_RISK_OF](../predicates/DECREASES_RISK_OF.md) | subject | relationship | assertion-only | D2 |
| [DEVELOPS_THERAPY_TARGETING](../predicates/DEVELOPS_THERAPY_TARGETING.md) | object | relationship | assertion-only | D7 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [INCREASES_ACTIVITY_OF](../predicates/INCREASES_ACTIVITY_OF.md) | object | relationship | assertion-only | D2 |
| [INCREASES_LEVEL_OF](../predicates/INCREASES_LEVEL_OF.md) | subject | relationship | assertion-only | D2 |
| [INCREASES_RISK_OF](../predicates/INCREASES_RISK_OF.md) | subject | relationship | assertion-only | D2 |
| [MECHANISM_OF](../predicates/MECHANISM_OF.md) | subject | relationship | assertion-only | D2 |
| [MEDIATES_TARGET](../predicates/MEDIATES_TARGET.md) | subject | relationship | assertion-only | D2 |
| [MIXED_EFFECT_ON](../predicates/MIXED_EFFECT_ON.md) | subject | relationship | assertion-only | D2 |
| [NO_CHANGE_IN](../predicates/NO_CHANGE_IN.md) | subject | relationship | assertion-only | D2 |
| [PARTICIPATES_IN](../predicates/PARTICIPATES_IN.md) | object | authorizing | typed-edge | D2 |
| [PART_OF_MECHANISM](../predicates/PART_OF_MECHANISM.md) | subject+object | authorizing | typed-edge | D2 |
| [REFLECTS_MECHANISM](../predicates/REFLECTS_MECHANISM.md) | object | authorizing | typed-edge | D4 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a Mechanism are Assertions with it as subject: `(:Mechanism)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (4)

- [D2/Q-D2-10](../patterns/D2/Q-D2-10.md) (supported; Q-D2-10)
- [D2/Q-D2-18](../patterns/D2/Q-D2-18.md) (supported; Q-D2-18)
- [QP/G-6#2](../patterns/QP/G-6--2.md) (unsupported; Q-D2-19)
- [QP/P-12](../patterns/QP/P-12.md) (supported; Q-D1-08, Q-D2-02, Q-D2-03, Q-D4-01, Q-D4-17)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

- [Record mechanism evidence (measured vs inferred) for a substance](../tasks/ingest-mechanism-evidence.md)

## v1 navigation aliases

- `node:Mechanism` is unchanged from v1.
- `node:Pathway` (merged): D2: Mechanism

## Source definition

- `release:sdl/modules/D2.graphql#L255-L288`
- `release:registers/node-register.yaml#Mechanism`
- `release:workspace-inputs/identity-rules.yaml#Mechanism`
