---
id: "node:Intervention"
kind: "node"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D5.graphql#L288-L304","release:registers/node-register.yaml#Intervention","release:workspace-inputs/identity-rules.yaml#Intervention"]
aliases: ["intervention","node:Exposure","node:Lifestyle","node:Procedure","node:Treatment","Exposure","Lifestyle","Procedure","Treatment"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:361adc6040c43d619d54961cfeaa7ea5cae88b3cec762a9a44c23b63b9e9e2b0"
---
# Intervention

Purpose: an intervention CONCEPT that is not simply a substance or a product: a practice (morning sunlight viewing, sauna bathing, resistance training), a procedure, a device-based practice, or a named regimen that clinics, trials and protocols treat as one thing (intermittent low-dose rapamycin). It is the subject of target, constraint and adverse-effect assertions for non-substance means, the thing D3 study arms administer (Q-D5-25, D3 seam) and D6 offerings sell (Q-D5-17, D6 seam). Plain intake of a compound or product is NOT an Intervention: the protocol step points straight at the D1 or D6 record. Collapses pinned Treatment, Procedure, Lifestyle and the practice side of Exposure (kind enum). An eating pattern (including time-restricted eating and fasting-mimicking diets) is never an Intervention: it is D12 DietaryPattern (R-63). Identity rule: (normalized name, kind, regimenQualifier when the regimen is the identity); MeSH / SNOMED CT / Wikidata ids attach through the kernel. uid token: `intervention` (hu:intervention:<slug>). Questions: Q-D5-02, Q-D5-04, Q-D5-17, Q-D5-25, Q-D5-28.

## Identity

| | |
| --- | --- |
| id | `node:Intervention` · raw SDL [sdl:Intervention](../sdl/Intervention.graphql) |
| module / domain | [D5](../modules/D5.md) / [Interventions, protocols, safety, food and nutrition](../domains/exposures-and-interventions.md) |
| uid | `hu:intervention:<opaque>` |
| stored labels | `Intervention` `Entity` (primary `Intervention`) |
| archetype | Entity (concept) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `normalizedName` + `kind` + `regimenQualifier` |
| identity keys | `uid`, `name`, `kind`, `regimenQualifier` |
| identifier schemes | `MESH` (active), `SNOMEDCT` (disabled), `WIKIDATA` (active) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (11)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D5.graphql:L292 |
| `uid` | `String!` | yes | create+update |  | D5.graphql:L293 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D5.graphql:L294 |
| `lastWriterRunId` | `String` |  | create+update |  | D5.graphql:L296 |
| `kind` | [InterventionKind](../vocabularies/InterventionKind.md) | yes | create+update |  | D5.graphql:L299 |
| `definition` | `String` |  | create+update |  | D5.graphql:L300 |
| `regimenQualifier` | `String` |  | create+update | Distinguishes regimens that share a name ('intermittent low-dose' vs 'transplant prophylaxis'); part of identity. | D5.graphql:L302 |
| `synonyms` | `[String!]` |  | create+update |  | D5.graphql:L303 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D5.graphql:L297 |
| `updatedAt` | `DateTime` |  | create+update |  | D5.graphql:L298 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D5.graphql:L295 |

## Outgoing relationships (3)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Intervention --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [AFFECTS_MECHANISM](../relationships/AFFECTS_MECHANISM.md) | [Mechanism](Mechanism.md) | derived | recorded-only | [MechanismProjectionProperties](../edge-properties/MechanismProjectionProperties.md) | Mechanism.affectedBy (IN) | read-only |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (12)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

| type | from | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [ADMINISTERS](../relationships/ADMINISTERS.md) | [InterventionComponent](InterventionComponent.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | InterventionComponent.administers (OUT) | `edge.assert` |
| [ASSERTED_BY](../relationships/ASSERTED_BY.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.assertedBy (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assessment](Assessment.md) | structural | recorded-only |  | Assessment.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Report](Report.md) | structural | recorded-only |  | Report.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ReportItem](ReportItem.md) | structural | recorded-only |  | ReportItem.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSOCIATES](../relationships/ASSOCIATES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Association](Association.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Association.members (OUT) | read-only |
| [EXPOSED_TO](../relationships/EXPOSED_TO.md) | [MechanismEvidenceContext](MechanismEvidenceContext.md) | structural | recorded-only | [ExposureRoleProperties](../edge-properties/ExposureRoleProperties.md) | MechanismEvidenceContext.exposures (OUT) | `edge.structural` |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (11)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [ADMINISTERS](../predicates/ADMINISTERS.md) | object | authorizing | typed-edge | D3 |
| [ATTENUATES_INDUCTION_OF](../predicates/ATTENUATES_INDUCTION_OF.md) | subject | relationship | assertion-only | D2 |
| [CAUSES_ADVERSE_EFFECT](../predicates/CAUSES_ADVERSE_EFFECT.md) | subject | literal | literal | D5 |
| [DECREASES_ACTIVITY_OF](../predicates/DECREASES_ACTIVITY_OF.md) | subject | relationship | assertion-only | D2 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [INCREASES_ACTIVITY_OF](../predicates/INCREASES_ACTIVITY_OF.md) | subject | relationship | assertion-only | D2 |
| [INTENDED_FOR_TARGET](../predicates/INTENDED_FOR_TARGET.md) | subject | relationship | assertion-only | D5 |
| [INTERACTS_WITH](../predicates/INTERACTS_WITH.md) | object | literal | literal | D5 |
| [INTERVENTION_INCLUDES](../predicates/INTERVENTION_INCLUDES.md) | subject+object | relationship | assertion-only | D5 |
| [OFFERS_INTERVENTION](../predicates/OFFERS_INTERVENTION.md) | object | relationship | assertion-only | D6 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a Intervention are Assertions with it as subject: `(:Intervention)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (2)

- [D5/Q-D5-17](../patterns/D5/Q-D5-17.md) (supported; Q-D5-17)
- [QP/P-12](../patterns/QP/P-12.md) (supported; Q-D1-08, Q-D2-02, Q-D2-03, Q-D4-01, Q-D4-17)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create, update; never delete (packet: create true, update true, delete false)
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `node:Exposure` (merged): D5: Intervention
- `node:Lifestyle` (split): D5: Intervention ‖ D12: D12.DietaryPattern
- `node:Procedure` (merged): D5: Intervention
- `node:Treatment` (merged): D5: Intervention

## Source definition

- `release:sdl/modules/D5.graphql#L288-L304`
- `release:registers/node-register.yaml#Intervention`
- `release:workspace-inputs/identity-rules.yaml#Intervention`
