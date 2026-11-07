---
id: "node:DietaryPattern"
kind: "node"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D12.graphql#L278-L309","release:registers/node-register.yaml#DietaryPattern","release:workspace-inputs/identity-rules.yaml#DietaryPattern"]
aliases: ["dietary pattern","dietary-pattern","dietarypattern","node:Lifestyle","Lifestyle"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach"]
cardDigest: "sha256:9ecdb5c00ea10c4d3820fb66a6c477713450d370be9c55224083649153a27b92"
---
# DietaryPattern

Purpose: a dietary pattern as one defining source states it — what foods, groups or nutrients it includes, emphasizes, limits or excludes, and when or how much one eats (Mediterranean diet + EVOO as the PREDIMED arm defined it; the DGA 2025–2030 pattern; Hall 2019's ultra-processed and unprocessed 14-day diets; time-restricted eating as TREAT defined it). It is what trial arms administer (D3 seam), what guidelines recommend, and the subject of pattern-level claims and target-effect assertions. It is the only node for any eating pattern defined by what, when or how much is eaten, including time-restricted eating and fasting-mimicking diets (R-63; OQ-D12-03 closed): D5 Intervention never mints a diet, D3 AdministeredMaterial administers an eating pattern as a DietaryPattern, and D5 STEP_USES reaches it through Subjectable as an admissible target. A new edition of a guideline or a different trial's definition is a new node; equivalence of two definitions is an EQUIVALENCE Assessment. Non-dietary practices (sauna, training) are D5 Interventions. Identity rule: (definedBySourceUid, patternKey, version) — the kernel Source uid of the defining document (DOI / PMID / normalized URL), a non-null key for the pattern within it, and the edition the source names (empty string when none); the free-text citation `definedBy` is presentation only. definedBySourceUid is a frozen identity key, never the provenance path: the "defined by" trace is the attach Assertion's HAS_EVIDENCE (R-46). uid token: `dietary-pattern` (hu:dietary-pattern:<opaque>). Questions: Q-D12-11, Q-D12-08, Q-D12-09, Q-D12-12, Q-D12-13, Q-D12-23, Q-D12-25.

## Identity

| | |
| --- | --- |
| id | `node:DietaryPattern` · raw SDL [sdl:DietaryPattern](../sdl/DietaryPattern.graphql) |
| module / domain | [D12](../modules/D12.md) / [Interventions, protocols, safety, food and nutrition](../domains/exposures-and-interventions.md) |
| uid | `hu:dietary-pattern:<opaque>` |
| stored labels | `DietaryPattern` `Entity` (primary `DietaryPattern`) |
| archetype | Entity & Subjectable (definition concept) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `definedBySourceUid` + `patternKey` + `version` |
| identity keys | `uid`, `name`, `definedBySourceUid`, `patternKey`, `version` |
| identifier schemes | `WIKIDATA` (active) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (15)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D12.graphql:L282 |
| `uid` | `String!` | yes | create+update |  | D12.graphql:L283 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D12.graphql:L284 |
| `lastWriterRunId` | `String` |  | create+update |  | D12.graphql:L286 |
| `definedBySourceUid` | `String!` | yes | create+update | uid of the kernel Source that defines the pattern (e.g. hu:source:pubmed-29897866; from DOI / PMID / normalized URL) (identity key). | D12.graphql:L290 |
| `patternKey` | `String!` | yes | create+update | Key of the pattern within its defining source, lower-kebab ('meddiet-evoo-arm', 'ultra-processed-diet') (identity key). | D12.graphql:L292 |
| `version` | `String!` | yes | create+update | Edition or version the defining source names; empty string when it names none (identity key). | D12.graphql:L294 |
| `definedBy` | `String` |  | create+update | Short human citation of the defining source ('DGA 2025-2030', 'PREDIMED protocol, MedDiet+EVOO arm'); presentation only. | D12.graphql:L296 |
| `patternKind` | [DietaryPatternKind](../vocabularies/DietaryPatternKind.md) | yes | create+update | What the pattern constrains (filter: Q-D12-11, Q-D12-13 timing patterns). | D12.graphql:L298 |
| `definitionScope` | [DietaryPatternScope](../vocabularies/DietaryPatternScope.md) |  | create+update | Who defines it and for what (filter: Q-D12-12 trial arms vs Q-D12-11 guidelines). | D12.graphql:L300 |
| `definitionVerbatim` | `String` |  | create+update | The defining text, verbatim (the locator lives on the defining Assertions). | D12.graphql:L302 |
| `synonyms` | `[String!]` |  | create+update | Names used in discourse ('MedDiet', 'TRE', 'carnivore'); feeds fulltext index dietary_pattern_search. | D12.graphql:L304 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D12.graphql:L287 |
| `updatedAt` | `DateTime` |  | create+update |  | D12.graphql:L288 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D12.graphql:L285 |

## Outgoing relationships (5)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:DietaryPattern --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [PATTERN_COMPONENT](../relationships/PATTERN_COMPONENT.md) | [Constituent](Constituent.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | DietaryPattern.components (OUT) | `edge.assert` |
| [PATTERN_COMPONENT](../relationships/PATTERN_COMPONENT.md) | [FoodCategory](FoodCategory.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | DietaryPattern.components (OUT) | `edge.assert` |
| [PATTERN_COMPONENT](../relationships/PATTERN_COMPONENT.md) | [FoodItem](FoodItem.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | DietaryPattern.components (OUT) | `edge.assert` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (11)

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
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (5)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [ADMINISTERS](../predicates/ADMINISTERS.md) | object | authorizing | typed-edge | D3 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [INTENDED_FOR_TARGET](../predicates/INTENDED_FOR_TARGET.md) | subject | relationship | assertion-only | D5 |
| [PATTERN_COMPONENT](../predicates/PATTERN_COMPONENT.md) | subject | authorizing | typed-edge | D12 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a DietaryPattern are Assertions with it as subject: `(:DietaryPattern)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
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
- Policy: create; update; never delete
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

(none)

## v1 navigation aliases

- `node:Lifestyle` (split): D5: Intervention ‖ D12: D12.DietaryPattern

## Source definition

- `release:sdl/modules/D12.graphql#L278-L309`
- `release:registers/node-register.yaml#DietaryPattern`
- `release:workspace-inputs/identity-rules.yaml#DietaryPattern`
