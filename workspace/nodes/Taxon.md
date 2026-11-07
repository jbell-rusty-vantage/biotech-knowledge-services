---
id: "node:Taxon"
kind: "node"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D1.graphql#L396-L417","release:registers/node-register.yaml#Taxon","release:workspace-inputs/identity-rules.yaml#Taxon"]
aliases: ["taxon","node:BotanicalTaxon","node:MicrobialStrain","node:MicrobialTaxon","BotanicalTaxon","MicrobialStrain","MicrobialTaxon"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach"]
cardDigest: "sha256:c9582d1242fdfd6c2cee3b4aa89815ec70c6e0fd91a8db103c1ccf89f2adb480"
---
# Taxon

Purpose: an organism taxon a material is derived from — botanical source species (Withania somnifera, NCBI 126910), microbial species (Lacticaseibacillus rhamnosus, 47715) and microbial strain (rank STRAIN: L. rhamnosus GG, 568703, deposits ATCC 53103 = LMG 18243). One type, because NCBI Taxonomy itself treats a strain as a taxon and the questions traverse strain → species → genus uniformly (strain-matched vs species-only evidence; legacy genus names). Absorbs BotanicalTaxon, MicrobialTaxon and MicrobialStrain. Identity rule: NCBI Taxonomy taxid when one exists; a strain without a taxid by its culture-collection deposits (identifiers through the kernel; equal deposits in two collections are one strain); otherwise (accepted scientific name, rank) provisionally. Renaming never changes the uid: legacy names stay searchable in searchText and as Identifier/Assertion history; reclassification is a PARENT_TAXON episode change. uid token: `taxon` (hu:taxon:<opaque>; pinned botanical-taxon, microbial-taxon and microbial-strain uids migrate here). Questions: Q-D1-11, Q-D1-12, Q-D1-14, Q-D1-15, Q-D1-26.

## Identity

| | |
| --- | --- |
| id | `node:Taxon` · raw SDL [sdl:Taxon](../sdl/Taxon.graphql) |
| module / domain | [D1](../modules/D1.md) / [Substances, materials, mechanisms and biology](../domains/substances-and-biology.md) |
| uid | `hu:taxon:<opaque>` |
| stored labels | `Taxon` `Entity` (primary `Taxon`) |
| archetype | Entity |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `NCBI taxid (requested scheme NCBI_TAXON)` + `culture-collection deposits for strains without a taxid (requested ATCC/DSMZ/LMG/CCUG)` + `(accepted scientific name, rank) provisional` |
| identity keys | `uid`, `name`, `scientificName` |
| identifier schemes | `NCBI_TAXON` (active), `CULTURE_COLLECTION` (disabled), `WIKIDATA` (active) |
| name match (workspace rule) | `name`, `scientificName` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (11)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D1.graphql:L400 |
| `uid` | `String!` | yes | create+update |  | D1.graphql:L401 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D1.graphql:L402 |
| `lastWriterRunId` | `String` |  | create+update |  | D1.graphql:L404 |
| `scientificName` | `String` |  | create+update | Currently accepted scientific name (with strain designation for rank STRAIN). | D1.graphql:L408 |
| `rank` | [TaxonRank](../vocabularies/TaxonRank.md) | yes | create+update |  | D1.graphql:L409 |
| `organismGroup` | [OrganismGroup](../vocabularies/OrganismGroup.md) |  | create+update |  | D1.graphql:L410 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D1.graphql:L405 |
| `updatedAt` | `DateTime` |  | create+update |  | D1.graphql:L406 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D1.graphql:L403 |

### Search (derived, never evidence)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `searchText` | `String` |  | create+update | Accepted name, legacy names (e.g. Lactobacillus rhamnosus GG), common names and deposit strings for the fulltext index. | D1.graphql:L412 |

## Outgoing relationships (3)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:Taxon --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [PARENT_TAXON](../relationships/PARENT_TAXON.md) | [Taxon](Taxon.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | Taxon.parents (OUT) | `edge.assert` |
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
| [DERIVED_FROM_TAXON](../relationships/DERIVED_FROM_TAXON.md) | [IngredientMaterial](IngredientMaterial.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | IngredientMaterial.sourceTaxa (OUT) | `edge.assert` |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (7)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [DECLARATION_STOICHIOMETRY_CHECK](../predicates/DECLARATION_STOICHIOMETRY_CHECK.md) | object | computation | computation | D6 |
| [DERIVED_FROM_TAXON](../predicates/DERIVED_FROM_TAXON.md) | object | authorizing | typed-edge | D1 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [FOOD_FROM_TAXON](../predicates/FOOD_FROM_TAXON.md) | object | relationship | assertion-only | D12 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [PARENT_TAXON](../predicates/PARENT_TAXON.md) | subject+object | authorizing | typed-edge | D1 |
| [SAMPLE_TESTED_POSITIVE_FOR](../predicates/SAMPLE_TESTED_POSITIVE_FOR.md) | object | relationship | assertion-only | D8 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a Taxon are Assertions with it as subject: `(:Taxon)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (0)

(none)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `node:BotanicalTaxon` (merged): D1: Taxon
- `node:MicrobialStrain` (merged): D1: Taxon
- `node:MicrobialTaxon` (merged): D1: Taxon

## Source definition

- `release:sdl/modules/D1.graphql#L396-L417`
- `release:registers/node-register.yaml#Taxon`
- `release:workspace-inputs/identity-rules.yaml#Taxon`
