---
id: "node:MechanismEvidenceContext"
kind: "node"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D2.graphql#L343-L396","release:registers/node-register.yaml#MechanismEvidenceContext","release:workspace-inputs/identity-rules.yaml#MechanismEvidenceContext"]
aliases: ["mechanism evidence context","mech-context","mechanismevidencecontext","node:AnatomicalContext","node:Organ","node:Species","AnatomicalContext","Organ","Species"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:b9929508740674b0a38e90cbfdc4e1adb34dec60a2f252b6253e78d9a87567d5"
---
# MechanismEvidenceContext

Purpose: the per-context qualifier of mechanism findings (round 0003 M3): one exposure group measured in one compartment of one organism in one setting. Every mechanism Assertion that reports an observation points at exactly one context (OBSERVED_IN_CONTEXT), so "where, in what, at what exposure was this step measured — and was it null" (CQ-MX-01..03) is a filter on this node, and compound → mechanism edges exist only as projections over these records. Species, anatomical context and organ are properties here (ModelOrganism + ncbiTaxonId, CompartmentKind + compartmentOntologyId), not nodes; species joins D3 populations by ncbiTaxonId equality (R-90). Payload record: implements Entity only, stored label MechanismEvidenceContext only (R-17). Exposure fields (exposureAmount, exposureUnitCode, exposureBasis, route, exposureDurationIso) are filled only for contexts with no IN_STUDY_ARM (unregistered preclinical, in-vitro and non-trial human groups). For a registered group the dose of record is D3's InterventionComponent (StudyArm -HAS_COMPONENT-> InterventionComponent -ADMINISTERS-> material), which also carries per-component amounts for combinations; patterns coalesce the two (03 shared fragment DOSE). Identity rule: `contextKey` = sha256 over (source snapshot uid, verbatim groupLabel, setting, compartmentOntologyId or compartmentLabel, and for unregistered contexts exposureAmount + exposureUnitCode + exposureBasis); immutable — a corrected context is a new node. uid token: `mech-context` (hu:mech-context:<opaque>). Questions: CQ-MX-01, CQ-MX-02, CQ-MX-03, CQ-MX-04, CQ-MX-06, Q-D2-04, Q-D2-09, Q-D2-13, Q-D2-20, Q-D2-22, Q-D2-26, Q-D2-27.

## Identity

| | |
| --- | --- |
| id | `node:MechanismEvidenceContext` · raw SDL [sdl:MechanismEvidenceContext](../sdl/MechanismEvidenceContext.graphql) |
| module / domain | [D2](../modules/D2.md) / [Substances, materials, mechanisms and biology](../domains/substances-and-biology.md) |
| uid | `hu:mech-context:<opaque>` |
| stored labels | `MechanismEvidenceContext` (primary `MechanismEvidenceContext`) |
| archetype | occurrence / qualifier payload (implements Entity only; stored label MechanismEvidenceContext only, R-17; immutable; a correction is a new node) |
| interfaces | [Entity](../interfaces/Entity.md) |
| identity rule (register) | `contextKey` |
| identity keys | `uid`, `name`, `contextKey` |
| identifier schemes | (none) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (26)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D2.graphql:L347 |
| `uid` | `String!` | yes | create+update |  | D2.graphql:L348 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D2.graphql:L349 |
| `lastWriterRunId` | `String` |  | create+update |  | D2.graphql:L351 |
| `contextKey` | `String` |  | create+update |  | D2.graphql:L354 |
| `groupLabel` | `String` |  | create+update | Verbatim group label from the source (e.g. 'NR 1 g/day, vastus lateralis biopsy'). | D2.graphql:L356 |
| `setting` | [MechanismSetting](../vocabularies/MechanismSetting.md) |  | create+update |  | D2.graphql:L357 |
| `organism` | [ModelOrganism](../vocabularies/ModelOrganism.md) |  | create+update |  | D2.graphql:L358 |
| `ncbiTaxonId` | `String` |  | create+update |  | D2.graphql:L359 |
| `strainOrLine` | `String` |  | create+update | Strain, line or cell line as the source names it (UM-HET3, C57BL/6JRj, HEK293). | D2.graphql:L361 |
| `sexScope` | [SexScope](../vocabularies/SexScope.md) |  | create+update | Sex composition of the measured group (D3 enum SexScope: ALL \| FEMALE \| MALE \| NOT_REPORTED). | D2.graphql:L363 |
| `ageDescriptor` | `String` |  | create+update | Verbatim age description (e.g. '75 ± 5 y', '8 months at start'). | D2.graphql:L365 |
| `sampleSize` | `Int` |  | create+update |  | D2.graphql:L366 |
| `compartmentKind` | [CompartmentKind](../vocabularies/CompartmentKind.md) |  | create+update |  | D2.graphql:L367 |
| `compartmentOntologyId` | `String` |  | create+update | UBERON / CL / Cellosaurus id; equality with D4 Metric.systemOntologyId is the cross-domain compartment check (Q-D2-04). | D2.graphql:L369 |
| `compartmentLabel` | `String` |  | create+update |  | D2.graphql:L370 |
| `geneticManipulation` | [GeneticManipulation](../vocabularies/GeneticManipulation.md) |  | create+update |  | D2.graphql:L371 |
| `exposureAmount` | `Float` |  | create+update | Unregistered contexts only (registered groups: D3 InterventionComponent.quantity). | D2.graphql:L373 |
| `exposureUnitCode` | `String` |  | create+update | UCUM unit of exposureAmount. | D2.graphql:L375 |
| `exposureBasis` | [AmountBasis](../vocabularies/AmountBasis.md) |  | create+update | D6 enum AmountBasis (PER_DAY, PER_KG_BODY_WEIGHT_PER_DAY, PER_KG_DIET, SINGLE_DOSE, MEDIUM_CONCENTRATION …; R-58); never inferred across bases. | D2.graphql:L377 |
| `route` | [AdministrationRoute](../vocabularies/AdministrationRoute.md) |  | create+update | D3 enum AdministrationRoute. | D2.graphql:L379 |
| `exposureDurationIso` | `String` |  | create+update | ISO 8601 duration (P21D, P12W). | D2.graphql:L381 |
| `assayText` | `String` |  | create+update | Verbatim assay / method text (western blot pan-acetylation, LC-MS/MS targeted metabolomics) until a question needs a D4 AssayVersion edge. | D2.graphql:L383 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D2.graphql:L352 |
| `updatedAt` | `DateTime` |  | create+update |  | D2.graphql:L353 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D2.graphql:L350 |

## Outgoing relationships (5)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:MechanismEvidenceContext --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [EXPOSED_TO](../relationships/EXPOSED_TO.md) | [ChemicalSubstance](ChemicalSubstance.md) | structural | recorded-only | [ExposureRoleProperties](../edge-properties/ExposureRoleProperties.md) | MechanismEvidenceContext.exposures (OUT) | `edge.structural` |
| [EXPOSED_TO](../relationships/EXPOSED_TO.md) | [IngredientMaterial](IngredientMaterial.md) | structural | recorded-only | [ExposureRoleProperties](../edge-properties/ExposureRoleProperties.md) | MechanismEvidenceContext.exposures (OUT) | `edge.structural` |
| [EXPOSED_TO](../relationships/EXPOSED_TO.md) | [Intervention](Intervention.md) | structural | recorded-only | [ExposureRoleProperties](../edge-properties/ExposureRoleProperties.md) | MechanismEvidenceContext.exposures (OUT) | `edge.structural` |
| [IN_STUDY_ARM](../relationships/IN_STUDY_ARM.md) | [StudyArm](StudyArm.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | MechanismEvidenceContext.studyArm (OUT) | `edge.structural` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (1)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

| type | from | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [OBSERVED_IN_CONTEXT](../relationships/OBSERVED_IN_CONTEXT.md) | [Assertion](Assertion.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | MechanismEvidenceContext.assertions (IN) | `edge.structural` |

## Legal predicates (0)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

(none)

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- MechanismEvidenceContext does not implement Subjectable: no Assertion takes it as subject; its records carry lineage through `WAS_GENERATED_BY`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (4)

- [D2/Q-D2-18](../patterns/D2/Q-D2-18.md) (supported; Q-D2-18)
- [K/CQ-AX-04](../patterns/K/CQ-AX-04.md) (supported; CQ-AX-04)
- [K/Q-K-23](../patterns/K/Q-K-23.md) (supported; Q-K-23)
- [QP/P-12](../patterns/QP/P-12.md) (supported; Q-D1-08, Q-D2-02, Q-D2-03, Q-D4-01, Q-D4-17)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`
- Policy: create
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

- [Record mechanism evidence (measured vs inferred) for a substance](../tasks/ingest-mechanism-evidence.md)

## v1 navigation aliases

- `node:MechanismEvidenceContext` is unchanged from v1.
- `node:AnatomicalContext` (merged): D2: MechanismEvidenceContext properties
- `node:Organ` (merged): D2: MechanismEvidenceContext properties
- `node:Species` (merged): D2: MechanismEvidenceContext / MolecularEntity properties

## Source definition

- `release:sdl/modules/D2.graphql#L343-L396`
- `release:registers/node-register.yaml#MechanismEvidenceContext`
- `release:workspace-inputs/identity-rules.yaml#MechanismEvidenceContext`
