---
id: "node:ChemicalSubstance"
kind: "node"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D1.graphql#L256-L285","release:registers/node-register.yaml#ChemicalSubstance","release:workspace-inputs/identity-rules.yaml#ChemicalSubstance"]
aliases: ["chemical substance","substance","chemicalsubstance"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","propose:identifier.attach","pattern"]
cardDigest: "sha256:8886c4271d9b8b0eba9ed670d4d2685595df1a30cb0069f1c22f72af8363a4ea"
---
# ChemicalSubstance

Purpose: a chemical substance at the granularity of its FDA GSRS substance record — salts, esters, hydrates and the free moiety are DIFFERENT substances (NR chloride UNII 8XM2XT8VWI vs NR 0I8H2M0L7N; pyridoxine HCl vs pyridoxine vs P5P), and GSRS "structurally diverse" records (WITHANIA SOMNIFERA ROOT, V038D626IF) are substances too. It is the join point across labels (D6), trials (D3), foods (D12), analytes (D4), mechanisms (D2) and safety (D5); the salt→moiety and form→nutrient edges below are what make "every form that converts to M" one traversal. Identity rule: UNII when GSRS registers one; else InChIKey (structure-defined) ; else (normalized preferred name, substanceClass) as a provisional record. Identifiers (UNII, INCHIKEY, PUBCHEM_CID, CAS_RN, CHEBI, DRUGBANK, RXCUI, MESH, WIKIDATA) attach through the kernel HAS_IDENTIFIER, never as fields. A PubChem name→CID hit is never accepted without a salt-vs-moiety check (the "Niagen" → CID 439924 trap). uid token: `substance` (hu:substance:<opaque>). Questions: CQ-PF-01, Q-D1-01, Q-D1-02, Q-D1-03, Q-D1-04, Q-D1-05, CQ-ID-03, CQ-ID-04, Q-D1-06, CQ-ST-02, Q-D1-08, Q-D1-10, Q-D1-18, Q-D1-19, Q-D1-20, Q-D1-22, Q-D1-24, Q-D1-26, Q-D1-28.

## Identity

| | |
| --- | --- |
| id | `node:ChemicalSubstance` · raw SDL [sdl:ChemicalSubstance](../sdl/ChemicalSubstance.graphql) |
| module / domain | [D1](../modules/D1.md) / [Substances, materials, mechanisms and biology](../domains/substances-and-biology.md) |
| uid | `hu:substance:<opaque>` |
| stored labels | `ChemicalSubstance` `Entity` (primary `ChemicalSubstance`) |
| archetype | Entity |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `UNII` + `INCHIKEY (when no UNII)` + `(normalized preferred name, substanceClass) provisional` |
| identity keys | `uid`, `name` |
| identifier schemes | `UNII` (active), `INCHIKEY` (active), `PUBCHEM_CID` (active), `CAS_RN` (disabled), `CHEBI` (active), `DRUGBANK` (disabled), `RXCUI` (active), `MESH` (active), `WIKIDATA` (active) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (12)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D1.graphql:L260 |
| `uid` | `String!` | yes | create+update |  | D1.graphql:L261 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D1.graphql:L262 |
| `lastWriterRunId` | `String` |  | create+update |  | D1.graphql:L264 |
| `substanceClass` | [SubstanceClass](../vocabularies/SubstanceClass.md) |  | create+update | GSRS substance class of the defining record. | D1.graphql:L268 |
| `molecularFormula` | `String` |  | create+update | Hill formula as the authority prints it, counter-ions included ('C11H15N2O5.Cl'). | D1.graphql:L270 |
| `molecularWeight` | `Float` |  | create+update | Average molecular weight of the defining record (g/mol). A derivation cites the FIELD Assertion that recorded it (authority snapshot + record version… | D1.graphql:L272 |
| `charge` | `Int` |  | create+update | Net formal charge of the defining structure. | D1.graphql:L274 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D1.graphql:L265 |
| `updatedAt` | `DateTime` |  | create+update |  | D1.graphql:L266 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D1.graphql:L263 |

### Search (derived, never evidence)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `searchText` | `String` |  | create+update | Normalized preferred name, synonyms and label spellings joined for the fulltext index d1_identity_fulltext (Q-D1-26). | D1.graphql:L276 |

## Outgoing relationships (6)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:ChemicalSubstance --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [AFFECTS_MECHANISM](../relationships/AFFECTS_MECHANISM.md) | [Mechanism](Mechanism.md) | derived | recorded-only | [MechanismProjectionProperties](../edge-properties/MechanismProjectionProperties.md) | Mechanism.affectedBy (IN) | read-only |
| [COUNTS_TOWARD_NUTRIENT](../relationships/COUNTS_TOWARD_NUTRIENT.md) | [Constituent](Constituent.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | ChemicalSubstance.nutrients (OUT) | `edge.assert` |
| [HAS_ACTIVE_MOIETY](../relationships/HAS_ACTIVE_MOIETY.md) | [ChemicalSubstance](ChemicalSubstance.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | ChemicalSubstance.activeMoieties (OUT) | `edge.assert` |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [PARTICIPATES_IN](../relationships/PARTICIPATES_IN.md) | [Mechanism](Mechanism.md) | asserted | recorded-only | [MechanismReferenceProperties](../edge-properties/MechanismReferenceProperties.md) | Mechanism.metaboliteParticipants (IN) | `edge.assert` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (19)

Stored direction is source -> this type. A field marked `(IN)` is the inverse GraphQL view of the stored edge.

| type | from | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [ASSERTED_BY](../relationships/ASSERTED_BY.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.assertedBy (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assessment](Assessment.md) | structural | recorded-only |  | Assessment.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Report](Report.md) | structural | recorded-only |  | Report.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSESSES](../relationships/ASSESSES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ReportItem](ReportItem.md) | structural | recorded-only |  | ReportItem.about (OUT) | planner-emitted (kernel plumbing) |
| [ASSOCIATES](../relationships/ASSOCIATES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Association](Association.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Association.members (OUT) | read-only |
| [CONCERNS](../relationships/CONCERNS.md) | [Patent](Patent.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | Patent.concerns (OUT) | `edge.assert` |
| [CONCERNS](../relationships/CONCERNS.md) | [RegulatoryRecord](RegulatoryRecord.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | RegulatoryRecord.concerns (OUT) | `edge.assert` |
| [EXPOSED_TO](../relationships/EXPOSED_TO.md) | [MechanismEvidenceContext](MechanismEvidenceContext.md) | structural | recorded-only | [ExposureRoleProperties](../edge-properties/ExposureRoleProperties.md) | MechanismEvidenceContext.exposures (OUT) | `edge.structural` |
| [FOOD_CONTAINS](../relationships/FOOD_CONTAINS.md) | [FoodItem](FoodItem.md) | asserted | recorded-only | [FoodContentProperties](../edge-properties/FoodContentProperties.md) | FoodItem.components (OUT) | `edge.assert` |
| [HAS_ANALYTE](../relationships/HAS_ANALYTE.md) | [Biomarker](Biomarker.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | Biomarker.analytes (OUT) | `edge.structural` |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.object (OUT) | planner-emitted (kernel plumbing) |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Assertion](Assertion.md) | structural | recorded-only |  | Assertion.subject (OUT) | planner-emitted (kernel plumbing) |
| [MATERIAL_CONTAINS](../relationships/MATERIAL_CONTAINS.md) | [IngredientMaterial](IngredientMaterial.md) | asserted | episode | [ContentEdgeProperties](../edge-properties/ContentEdgeProperties.md) | IngredientMaterial.containsSubstances (OUT) | `edge.assert` |
| [MEASURES_ANALYTE](../relationships/MEASURES_ANALYTE.md) | [QualityResult](QualityResult.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | QualityResult.analyte (OUT) | `edge.assert` |
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [REALIZES_SUBSTANCE](../relationships/REALIZES_SUBSTANCE.md) | [IngredientMaterial](IngredientMaterial.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | IngredientMaterial.substances (OUT) | `edge.assert` |
| [STATUS_OF](../relationships/STATUS_OF.md) | [LegalStatus](LegalStatus.md) | asserted | episode | [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | LegalStatus.statusOf (OUT) | `edge.assert` |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (44)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [ACTIVATES](../predicates/ACTIVATES.md) | subject | relationship | assertion-only | D2 |
| [ATTENUATES_INDUCTION_OF](../predicates/ATTENUATES_INDUCTION_OF.md) | subject | relationship | assertion-only | D2 |
| [BINDS](../predicates/BINDS.md) | subject | relationship | assertion-only | D2 |
| [CALCULATED_DAILY_MAX_INTAKE](../predicates/CALCULATED_DAILY_MAX_INTAKE.md) | object | computation | computation | D6 |
| [CAUSES_ADVERSE_EFFECT](../predicates/CAUSES_ADVERSE_EFFECT.md) | subject | literal | literal | D5 |
| [CONCERNS](../predicates/CONCERNS.md) | object | authorizing | typed-edge | D8 |
| [CONTAINS_UNDECLARED_SUBSTANCE](../predicates/CONTAINS_UNDECLARED_SUBSTANCE.md) | object | relationship | assertion-only | D6 |
| [CORRECTS](../predicates/CORRECTS.md) | subject | literal | literal | K |
| [COUNTS_TOWARD_NUTRIENT](../predicates/COUNTS_TOWARD_NUTRIENT.md) | subject | authorizing | typed-edge | D1 |
| [DECLARATION_STOICHIOMETRY_CHECK](../predicates/DECLARATION_STOICHIOMETRY_CHECK.md) | object | computation | computation | D6 |
| [DECREASES_ACTIVITY_OF](../predicates/DECREASES_ACTIVITY_OF.md) | subject | relationship | assertion-only | D2 |
| [DECREASES_LEVEL_OF](../predicates/DECREASES_LEVEL_OF.md) | object | relationship | assertion-only | D2 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [FOOD_CONTAINS](../predicates/FOOD_CONTAINS.md) | object | authorizing | typed-edge | D12 |
| [FORMS_DURING_PREPARATION](../predicates/FORMS_DURING_PREPARATION.md) | subject | relationship | assertion-only | D1 |
| [HAS_ACTION_LEVEL](../predicates/HAS_ACTION_LEVEL.md) | subject | literal | literal | D8 |
| [HAS_ACTIVE_MOIETY](../predicates/HAS_ACTIVE_MOIETY.md) | subject+object | authorizing | typed-edge | D1 |
| [HAS_APPROVED_INDICATION](../predicates/HAS_APPROVED_INDICATION.md) | subject | relationship | assertion-only | D8 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [INCREASES_ACTIVITY_OF](../predicates/INCREASES_ACTIVITY_OF.md) | subject | relationship | assertion-only | D2 |
| [INCREASES_LEVEL_OF](../predicates/INCREASES_LEVEL_OF.md) | object | relationship | assertion-only | D2 |
| [INHIBITS](../predicates/INHIBITS.md) | subject | relationship | assertion-only | D2 |
| [INTENDED_FOR_TARGET](../predicates/INTENDED_FOR_TARGET.md) | subject | relationship | assertion-only | D5 |
| [INTERPRETS_RESULT](../predicates/INTERPRETS_RESULT.md) | subject | literal | literal | D3 |
| [MATERIAL_CONTAINS](../predicates/MATERIAL_CONTAINS.md) | object | authorizing | typed-edge | D1 |
| [MEASURED_CONTENT_IN_PRODUCT](../predicates/MEASURED_CONTENT_IN_PRODUCT.md) | object | relationship | assertion-only | D6 |
| [MEASURES_ANALYTE](../predicates/MEASURES_ANALYTE.md) | object | authorizing | typed-edge | D8 |
| [MEMBER_OF_CLASS](../predicates/MEMBER_OF_CLASS.md) | subject | relationship | assertion-only | D1 |
| [MIXED_EFFECT_ON](../predicates/MIXED_EFFECT_ON.md) | object | relationship | assertion-only | D2 |
| [MOIETY_EQUIVALENT_AMOUNT](../predicates/MOIETY_EQUIVALENT_AMOUNT.md) | object | computation | computation | D3 |
| [MOLECULAR_FORMULA](../predicates/MOLECULAR_FORMULA.md) | subject | field | field | D1 |
| [MOLECULAR_WEIGHT](../predicates/MOLECULAR_WEIGHT.md) | subject | field | field | D1 |
| [NO_CHANGE_IN](../predicates/NO_CHANGE_IN.md) | object | relationship | assertion-only | D2 |
| [NUTRIENT_EXPRESSED_AS](../predicates/NUTRIENT_EXPRESSED_AS.md) | object | relationship | assertion-only | D1 |
| [PARTICIPATES_IN](../predicates/PARTICIPATES_IN.md) | subject | authorizing | typed-edge | D2 |
| [PREPARATION_CHANGES_CONTENT](../predicates/PREPARATION_CHANGES_CONTENT.md) | object | literal | literal | D12 |
| [REALIZES_SUBSTANCE](../predicates/REALIZES_SUBSTANCE.md) | object | authorizing | typed-edge | D1 |
| [RECOMMENDS_USE](../predicates/RECOMMENDS_USE.md) | subject | literal | literal | D9 |
| [REPORTS_CONCLUSION](../predicates/REPORTS_CONCLUSION.md) | subject | literal | literal | D1 |
| [REPORTS_DISPROPORTIONALITY_SIGNAL](../predicates/REPORTS_DISPROPORTIONALITY_SIGNAL.md) | subject | relationship | assertion-only | D10 |
| [REPORTS_DOSE_RANGE_STUDIED](../predicates/REPORTS_DOSE_RANGE_STUDIED.md) | subject | literal | literal | D1 |
| [REPORTS_REPORT_COUNT](../predicates/REPORTS_REPORT_COUNT.md) | subject | relationship | assertion-only | D10 |
| [STATUS_OF](../predicates/STATUS_OF.md) | object | authorizing | typed-edge | D8 |
| [TAKES](../predicates/TAKES.md) | object | relationship | assertion-only | D9 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a ChemicalSubstance are Assertions with it as subject: `(:ChemicalSubstance)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (15)

- [D1/CQ-ID-03](../patterns/D1/CQ-ID-03.md) (supported; CQ-ID-03)
- [D1/CQ-ID-04](../patterns/D1/CQ-ID-04.md) (supported; CQ-ID-04)
- [D1/CQ-PF-01](../patterns/D1/CQ-PF-01.md) (supported; CQ-PF-01)
- [D12/Q-D12-03#option-a](../patterns/D12/Q-D12-03--option-a.md) (supported; Q-D12-03)
- [D12/Q-D12-06#option-a](../patterns/D12/Q-D12-06--option-a.md) (supported; Q-D12-06)
- [D2/Q-D2-10](../patterns/D2/Q-D2-10.md) (supported; Q-D2-10)
- [D2/Q-D2-18](../patterns/D2/Q-D2-18.md) (supported; Q-D2-18)
- [D6/CQ-AX-25#1](../patterns/D6/CQ-AX-25--1.md) (supported; CQ-AX-25)
- [D8/Q-D8-10](../patterns/D8/Q-D8-10.md) (supported; Q-D8-10)
- [D8/Q-D8-13](../patterns/D8/Q-D8-13.md) (supported; Q-D8-13)
- [D8/Q-D8-18](../patterns/D8/Q-D8-18.md) (supported; Q-D8-18)
- [D8/Q-D8-19](../patterns/D8/Q-D8-19.md) (supported; Q-D8-19)
- [D9/Q-D9-21](../patterns/D9/Q-D9-21.md) (supported; Q-D9-21)
- [QP/G-6#1](../patterns/QP/G-6--1.md) (unsupported; Q-D2-19)
- [QP/P-12](../patterns/QP/P-12.md) (supported; Q-D1-08, Q-D2-02, Q-D2-03, Q-D4-01, Q-D4-17)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; update
- Proposal kinds: `node.upsert`, `identifier.attach`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

- `HOLDS_ROLE` does NOT imply `RECOMMENDS_USE`
- `RECEIVES_VALUE_FROM` does NOT imply `RECOMMENDS_USE`
- `CONTENT_SPONSORED_BY` does NOT imply `RECOMMENDS_USE`
- `MEASURED_CONTENT_IN_PRODUCT` does NOT imply `DECLARES_COMPONENT`
- `LICENSED_TO` does NOT imply `STATUS_OF`

## Tasks

- [Ingest a product label (supplement facts) as a label version with its component lines](../tasks/ingest-product-label.md)
- [Ingest a regulatory record (filing, letter, recall, inspection) and the status it establishes](../tasks/ingest-regulatory-filing.md)
- [Record mechanism evidence (measured vs inferred) for a substance](../tasks/ingest-mechanism-evidence.md)
- [Compare measured content of a sold product with its label declaration (OD-10 option A)](../tasks/measured-versus-declared-content.md)

## v1 navigation aliases

- `node:ChemicalSubstance` is unchanged from v1.
(none)

## Source definition

- `release:sdl/modules/D1.graphql#L256-L285`
- `release:registers/node-register.yaml#ChemicalSubstance`
- `release:workspace-inputs/identity-rules.yaml#ChemicalSubstance`
