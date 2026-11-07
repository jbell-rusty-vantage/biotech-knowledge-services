---
id: "node:MolecularEntity"
kind: "node"
module: "D2"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D2.graphql#L300-L323","release:registers/node-register.yaml#MolecularEntity","release:workspace-inputs/identity-rules.yaml#MolecularEntity"]
aliases: ["molecular entity","molecular-entity","molecularentity"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:2739925d51d52d8e215d254d463cfa86fad145cb0572141a918a246f9dbd0199"
---
# MolecularEntity

Purpose: a gene, protein, protein complex, protein family or non-coding RNA that is a curated participant in a mechanism or the object of a compound's molecular-target Assertion (ChEMBL: sirolimus INHIBITS FKBP1A), so that "compound → molecular target → pathway" is an Assertion hop plus PARTICIPATES_IN, without a MechanismChain node. Default organism human; orthologs are separate nodes only when a question needs them (Q-D2-20 model-organism genes). Identity rule: (organism ncbiTaxonId, primary identifier) — UniProt accession for proteins, HGNC id for human genes (NCBI Gene / Ensembl otherwise); identifiers attach through the kernel (UNIPROT, HGNC, NCBI_GENE, ENSEMBL_GENE). uid token: `molecular-entity` (hu:molecular-entity:<opaque>). Questions: Q-D2-08, Q-D2-11, Q-D2-19, Q-D2-20, Q-D2-03.

## Identity

| | |
| --- | --- |
| id | `node:MolecularEntity` · raw SDL [sdl:MolecularEntity](../sdl/MolecularEntity.graphql) |
| module / domain | [D2](../modules/D2.md) / [Substances, materials, mechanisms and biology](../domains/substances-and-biology.md) |
| uid | `hu:molecular-entity:<opaque>` |
| stored labels | `MolecularEntity` `Entity` (primary `MolecularEntity`) |
| archetype | reference entity (mirrors UniProt/HGNC; human default, orthologs only on demand) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `ncbiTaxonId` + `primary identifier (UNIPROT for proteins, HGNC for human genes, NCBI_GENE / ENSEMBL_GENE otherwise)` |
| identity keys | `uid`, `name`, `ncbiTaxonId` |
| identifier schemes | `UNIPROT` (active), `HGNC` (active), `NCBI_GENE` (disabled), `ENSEMBL_GENE` (disabled), `WIKIDATA` (active), `CHEMBL` (active) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (13)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D2.graphql:L304 |
| `uid` | `String!` | yes | create+update |  | D2.graphql:L305 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D2.graphql:L306 |
| `lastWriterRunId` | `String` |  | create+update |  | D2.graphql:L308 |
| `entityKind` | [MolecularEntityKind](../vocabularies/MolecularEntityKind.md) |  | create+update |  | D2.graphql:L311 |
| `geneSymbol` | `String` |  | create+update | Official symbol (HGNC for human), e.g. SIRT1, MTOR, FKBP1A. | D2.graphql:L313 |
| `organism` | [ModelOrganism](../vocabularies/ModelOrganism.md) |  | create+update |  | D2.graphql:L314 |
| `ncbiTaxonId` | `String` |  | create+update | NCBI Taxonomy id as a string (9606 human, 10090 mouse). | D2.graphql:L316 |
| `description` | `String` |  | create+update |  | D2.graphql:L317 |
| `synonyms` | `[String!]` |  | create+update |  | D2.graphql:L318 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D2.graphql:L309 |
| `updatedAt` | `DateTime` |  | create+update |  | D2.graphql:L310 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D2.graphql:L307 |

## Outgoing relationships (3)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:MolecularEntity --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [PARTICIPATES_IN](../relationships/PARTICIPATES_IN.md) | [Mechanism](Mechanism.md) | asserted | recorded-only | [MechanismReferenceProperties](../edge-properties/MechanismReferenceProperties.md) | MolecularEntity.participatesIn (OUT) | `edge.assert` |
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
| [HAS_ANALYTE](../relationships/HAS_ANALYTE.md) | [Biomarker](Biomarker.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | Biomarker.analyteEntities (OUT) | `edge.structural` |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (17)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [ACTIVATES](../predicates/ACTIVATES.md) | object | relationship | assertion-only | D2 |
| [BINDS](../predicates/BINDS.md) | object | relationship | assertion-only | D2 |
| [DECREASES_ACTIVITY_OF](../predicates/DECREASES_ACTIVITY_OF.md) | object | relationship | assertion-only | D2 |
| [DECREASES_LEVEL_OF](../predicates/DECREASES_LEVEL_OF.md) | subject+object | relationship | assertion-only | D2 |
| [DECREASES_RISK_OF](../predicates/DECREASES_RISK_OF.md) | subject | relationship | assertion-only | D2 |
| [DEVELOPS_THERAPY_TARGETING](../predicates/DEVELOPS_THERAPY_TARGETING.md) | object | relationship | assertion-only | D7 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [INCREASES_ACTIVITY_OF](../predicates/INCREASES_ACTIVITY_OF.md) | object | relationship | assertion-only | D2 |
| [INCREASES_LEVEL_OF](../predicates/INCREASES_LEVEL_OF.md) | subject+object | relationship | assertion-only | D2 |
| [INCREASES_RISK_OF](../predicates/INCREASES_RISK_OF.md) | subject | relationship | assertion-only | D2 |
| [INHIBITS](../predicates/INHIBITS.md) | object | relationship | assertion-only | D2 |
| [MIXED_EFFECT_ON](../predicates/MIXED_EFFECT_ON.md) | subject+object | relationship | assertion-only | D2 |
| [NO_CHANGE_IN](../predicates/NO_CHANGE_IN.md) | subject+object | relationship | assertion-only | D2 |
| [ORTHOLOG_OF](../predicates/ORTHOLOG_OF.md) | subject+object | relationship | assertion-only | D2 |
| [PARTICIPATES_IN](../predicates/PARTICIPATES_IN.md) | subject | authorizing | typed-edge | D2 |
| [REPORTS_ASSOCIATION_SCORE](../predicates/REPORTS_ASSOCIATION_SCORE.md) | subject | relationship | assertion-only | D10 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a MolecularEntity are Assertions with it as subject: `(:MolecularEntity)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (1)

- [QP/G-6#1](../patterns/QP/G-6--1.md) (unsupported; Q-D2-19)

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

- `node:MolecularEntity` is unchanged from v1.
(none)

## Source definition

- `release:sdl/modules/D2.graphql#L300-L323`
- `release:registers/node-register.yaml#MolecularEntity`
- `release:workspace-inputs/identity-rules.yaml#MolecularEntity`
