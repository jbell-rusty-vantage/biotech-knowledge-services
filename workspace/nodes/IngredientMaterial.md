---
id: "node:IngredientMaterial"
kind: "node"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D1.graphql#L305-L350","release:registers/node-register.yaml#IngredientMaterial","release:workspace-inputs/identity-rules.yaml#IngredientMaterial"]
aliases: ["ingredient material","material","ingredientmaterial","node:BotanicalPreparation","node:BrandedIngredientMaterial","node:ChemicalForm","node:MaterialMixture","node:MicrobialPreparation","BotanicalPreparation","BrandedIngredientMaterial","ChemicalForm","MaterialMixture","MicrobialPreparation"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:9bd873780e204d9d77d90d88b31a42c598d5b2bfdfaeb0f4e59374079ac5b1ef"
---
# IngredientMaterial

Purpose: the canonical identity of an actual material used as an ingredient or administered in a study — a supplier's grade of one substance, a branded material (NIAGEN: a crystal form of NR chloride, food grade, one exclusive manufacturer), a botanical preparation (KSM-66: root-only full-spectrum dry extract), a microbial preparation (LGG), a material mixture — or an UNRESOLVED material known only as what a source says was used. Labels and trial methods name materials as often as substances, and the harm-relevant facts (plant part, preparation, grade, viability) are material facts, so D6 (DECLARES_COMPONENT) and D3 (ADMINISTERS) point here. Absorbs BrandedIngredientMaterial, BotanicalPreparation, MicrobialPreparation, MaterialMixture and ChemicalForm (kind + properties). Identity rule: (materialKind, defining substance or source taxon, brandName, specification owner, physicalForm, formDescriptor, grade, plantPart, preparationType, extract ratio, extractionSolvent, viabilityState); a change of any of these is a new material, a supplier change under the same specification is an Assertion (D7/D8), and "same material?" across records is a kernel EQUIVALENCE Assessment, never a merge. UNRESOLVED materials stay valid; competing identities are RESOLUTION Assessments. uid token: `material` (hu:material:<opaque>; pinned BrandedIngredientMaterial/BotanicalPreparation/MicrobialPreparation/ MaterialMixture uids keep the same token). Questions: Q-D1-05, Q-D1-07, CQ-ID-03, CQ-ID-06, CQ-ST-02, Q-D1-08, Q-D1-11, Q-D1-12, Q-D1-13, Q-D1-14, Q-D1-15, Q-D1-16, Q-D1-17, Q-D1-26, Q-D1-27.

## Identity

| | |
| --- | --- |
| id | `node:IngredientMaterial` · raw SDL [sdl:IngredientMaterial](../sdl/IngredientMaterial.graphql) |
| module / domain | [D1](../modules/D1.md) / [Substances, materials, mechanisms and biology](../domains/substances-and-biology.md) |
| uid | `hu:material:<opaque>` |
| stored labels | `IngredientMaterial` `Entity` (primary `IngredientMaterial`) |
| archetype | Entity |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `materialKind` + `defining substance or source taxon` + `brandName` + `specification owner (D7 assertion)` + `physicalForm` + `formDescriptor` + `grade` + `plantPart` + `preparationType` + `extractRatioLow/High` + `extractionSolvent` + `viabilityState` |
| identity keys | `uid`, `name`, `materialKind`, `brandName`, `physicalForm`, `formDescriptor`, `grade`, `plantPart`, `preparationType`, `extractionSolvent`, `viabilityState` |
| identifier schemes | `SUPPLIER_CODE` (disabled), `DSLD_INGREDIENT` (disabled), `LNHPD_INGREDIENT` (disabled) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (19)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D1.graphql:L309 |
| `uid` | `String!` | yes | create+update |  | D1.graphql:L310 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D1.graphql:L311 |
| `lastWriterRunId` | `String` |  | create+update |  | D1.graphql:L313 |
| `materialKind` | [MaterialKind](../vocabularies/MaterialKind.md) | yes | create+update |  | D1.graphql:L316 |
| `brandName` | `String` |  | create+update | Brand or trade name of a branded material as printed ('Niagen', 'KSM-66', 'LGG'); null for unbranded materials. Mark ownership is a predicate-only As… | D1.graphql:L318 |
| `physicalForm` | [PhysicalFormKind](../vocabularies/PhysicalFormKind.md) |  | create+update |  | D1.graphql:L319 |
| `formDescriptor` | `String` |  | create+update | Polymorph or form designation as the source states it ('crystalline form', 'micronized'). | D1.graphql:L321 |
| `grade` | [MaterialGrade](../vocabularies/MaterialGrade.md) |  | create+update |  | D1.graphql:L322 |
| `plantPart` | [PlantPart](../vocabularies/PlantPart.md) |  | create+update |  | D1.graphql:L323 |
| `preparationType` | [BotanicalPreparationType](../vocabularies/BotanicalPreparationType.md) |  | create+update |  | D1.graphql:L324 |
| `extractRatioLow` | `Float` |  | create+update | Native herbal substance : preparation ratio (DER), lower bound (5 means 5:1). | D1.graphql:L326 |
| `extractRatioHigh` | `Float` |  | create+update | DER upper bound (equal to extractRatioLow for a single ratio). | D1.graphql:L328 |
| `extractionSolvent` | `String` |  | create+update | Extraction solvent as stated ('water', 'ethanol 70% v/v', 'milk' for KSM-66). | D1.graphql:L330 |
| `viabilityState` | [ViabilityState](../vocabularies/ViabilityState.md) |  | create+update |  | D1.graphql:L331 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D1.graphql:L314 |
| `updatedAt` | `DateTime` |  | create+update |  | D1.graphql:L315 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D1.graphql:L312 |

### Search (derived, never evidence)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `searchText` | `String` |  | create+update | Names, brand spellings, label strings and synonyms joined for the fulltext index d1_identity_fulltext (Q-D1-26). | D1.graphql:L333 |

## Outgoing relationships (6)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:IngredientMaterial --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [DERIVED_FROM_TAXON](../relationships/DERIVED_FROM_TAXON.md) | [Taxon](Taxon.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | IngredientMaterial.sourceTaxa (OUT) | `edge.assert` |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [MATERIAL_CONTAINS](../relationships/MATERIAL_CONTAINS.md) | [ChemicalSubstance](ChemicalSubstance.md) | asserted | episode | [ContentEdgeProperties](../edge-properties/ContentEdgeProperties.md) | IngredientMaterial.containsSubstances (OUT) | `edge.assert` |
| [MATERIAL_CONTAINS](../relationships/MATERIAL_CONTAINS.md) | [Constituent](Constituent.md) | asserted | episode | [ContentEdgeProperties](../edge-properties/ContentEdgeProperties.md) | IngredientMaterial.containsConstituents (OUT) | `edge.assert` |
| [REALIZES_SUBSTANCE](../relationships/REALIZES_SUBSTANCE.md) | [ChemicalSubstance](ChemicalSubstance.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | IngredientMaterial.substances (OUT) | `edge.assert` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (16)

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
| [CONCERNS](../relationships/CONCERNS.md) | [RegulatoryRecord](RegulatoryRecord.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | RegulatoryRecord.concerns (OUT) | `edge.assert` |
| [DECLARES_COMPONENT](../relationships/DECLARES_COMPONENT.md) | [LabelVersion](LabelVersion.md) | asserted | recorded-only | [ComponentLineProperties](../edge-properties/ComponentLineProperties.md) | LabelVersion.components (OUT) | `edge.assert` |
| [EXPOSED_TO](../relationships/EXPOSED_TO.md) | [MechanismEvidenceContext](MechanismEvidenceContext.md) | structural | recorded-only | [ExposureRoleProperties](../edge-properties/ExposureRoleProperties.md) | MechanismEvidenceContext.exposures (OUT) | `edge.structural` |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MEASURES_ANALYTE](../relationships/MEASURES_ANALYTE.md) | [QualityResult](QualityResult.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | QualityResult.analyte (OUT) | `edge.assert` |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [STATUS_OF](../relationships/STATUS_OF.md) | [LegalStatus](LegalStatus.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | LegalStatus.statusOf (OUT) | `edge.assert` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (30)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [ADMINISTERS](../predicates/ADMINISTERS.md) | object | authorizing | typed-edge | D3 |
| [ASSIGNS_LIKELIHOOD_SCORE](../predicates/ASSIGNS_LIKELIHOOD_SCORE.md) | subject | literal | literal | D10 |
| [CALCULATED_DAILY_MAX_INTAKE](../predicates/CALCULATED_DAILY_MAX_INTAKE.md) | object | computation | computation | D6 |
| [CAUSES_ADVERSE_EFFECT](../predicates/CAUSES_ADVERSE_EFFECT.md) | subject | literal | literal | D5 |
| [CHARACTERIZES_ABSORPTION](../predicates/CHARACTERIZES_ABSORPTION.md) | subject | literal | literal | D1 |
| [CHARACTERIZES_INCIDENCE](../predicates/CHARACTERIZES_INCIDENCE.md) | subject | relationship | assertion-only | D10 |
| [CONCERNS](../predicates/CONCERNS.md) | object | authorizing | typed-edge | D8 |
| [DECLARES_COMPONENT](../predicates/DECLARES_COMPONENT.md) | object | authorizing | typed-edge | D6 |
| [DECREASES_ACTIVITY_OF](../predicates/DECREASES_ACTIVITY_OF.md) | subject | relationship | assertion-only | D2 |
| [DERIVED_FROM_TAXON](../predicates/DERIVED_FROM_TAXON.md) | subject | authorizing | typed-edge | D1 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [EXTRACT_RATIO](../predicates/EXTRACT_RATIO.md) | subject | field | field | D1 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [HAS_MIXTURE_COMPONENT](../predicates/HAS_MIXTURE_COMPONENT.md) | subject+object | relationship | assertion-only | D1 |
| [HIGHER_BIOAVAILABILITY_THAN](../predicates/HIGHER_BIOAVAILABILITY_THAN.md) | subject+object | relationship | assertion-only | D1 |
| [INCREASES_ACTIVITY_OF](../predicates/INCREASES_ACTIVITY_OF.md) | subject | relationship | assertion-only | D2 |
| [INTENDED_FOR_TARGET](../predicates/INTENDED_FOR_TARGET.md) | subject | relationship | assertion-only | D5 |
| [MANUFACTURES](../predicates/MANUFACTURES.md) | object | relationship | assertion-only | D7 |
| [MARKETED_UNDER_MARK](../predicates/MARKETED_UNDER_MARK.md) | subject | literal | literal | D1 |
| [MATERIAL_CONTAINS](../predicates/MATERIAL_CONTAINS.md) | subject | authorizing | typed-edge | D1 |
| [MATERIAL_GRADE](../predicates/MATERIAL_GRADE.md) | subject | field | field | D1 |
| [MEASURES_ANALYTE](../predicates/MEASURES_ANALYTE.md) | object | authorizing | typed-edge | D8 |
| [PHYSICAL_FORM](../predicates/PHYSICAL_FORM.md) | subject | field | field | D1 |
| [PLANT_PART](../predicates/PLANT_PART.md) | subject | field | field | D1 |
| [PROCESS_ALLERGEN_NOTE](../predicates/PROCESS_ALLERGEN_NOTE.md) | subject | relationship | assertion-only | D1 |
| [REALIZES_SUBSTANCE](../predicates/REALIZES_SUBSTANCE.md) | subject | authorizing | typed-edge | D1 |
| [SOURCED_FROM_COUNTRY](../predicates/SOURCED_FROM_COUNTRY.md) | subject | field | field | D1 |
| [STATES_ATTRIBUTION_CAVEAT](../predicates/STATES_ATTRIBUTION_CAVEAT.md) | subject | literal | literal | D1 |
| [STATUS_OF](../predicates/STATUS_OF.md) | object | authorizing | typed-edge | D8 |
| [SUPPLIES_MATERIAL](../predicates/SUPPLIES_MATERIAL.md) | object | relationship | assertion-only | D7 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a IngredientMaterial are Assertions with it as subject: `(:IngredientMaterial)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (10)

- [D1/CQ-ID-03](../patterns/D1/CQ-ID-03.md) (supported; CQ-ID-03)
- [D1/CQ-PF-01](../patterns/D1/CQ-PF-01.md) (supported; CQ-PF-01)
- [D1/Q-D1-16](../patterns/D1/Q-D1-16.md) (supported; Q-D1-16)
- [D6/CQ-AX-25#1](../patterns/D6/CQ-AX-25--1.md) (supported; CQ-AX-25)
- [D7/Q-D7-22#1](../patterns/D7/Q-D7-22--1.md) (supported; Q-D7-22)
- [D8/CQ-MF-01](../patterns/D8/CQ-MF-01.md) (supported; CQ-MF-01)
- [D8/Q-D8-10](../patterns/D8/Q-D8-10.md) (supported; Q-D8-10)
- [D8/Q-D8-13](../patterns/D8/Q-D8-13.md) (supported; Q-D8-13)
- [D8/Q-D8-18](../patterns/D8/Q-D8-18.md) (supported; Q-D8-18)
- [QP/P-12](../patterns/QP/P-12.md) (supported; Q-D1-08, Q-D2-02, Q-D2-03, Q-D4-01, Q-D4-17)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

- `MEASURED_CONTENT_IN_PRODUCT` does NOT imply `DECLARES_COMPONENT`
- `LICENSED_TO` does NOT imply `STATUS_OF`

## Tasks

- [Ingest a product label (supplement facts) as a label version with its component lines](../tasks/ingest-product-label.md)
- [Ingest a study with its registration versions, intervention material and results](../tasks/ingest-study-publication.md)

## v1 navigation aliases

- `node:IngredientMaterial` is unchanged from v1.
- `node:BotanicalPreparation` (merged): D1: IngredientMaterial
- `node:BrandedIngredientMaterial` (merged): D1: IngredientMaterial
- `node:ChemicalForm` (merged): D1: IngredientMaterial
- `node:MaterialMixture` (merged): D1: IngredientMaterial
- `node:MicrobialPreparation` (merged): D1: IngredientMaterial

## Source definition

- `release:sdl/modules/D1.graphql#L305-L350`
- `release:registers/node-register.yaml#IngredientMaterial`
- `release:workspace-inputs/identity-rules.yaml#IngredientMaterial`
