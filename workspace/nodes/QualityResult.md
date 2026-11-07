---
id: "node:QualityResult"
kind: "node"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L531-L588","release:registers/node-register.yaml#QualityResult","release:workspace-inputs/identity-rules.yaml#QualityResult"]
aliases: ["quality result","quality-result","qualityresult","node:MeasuredResult","node:PassFailInterpretation","node:SpecificationCriterion","node:TestExecution","node:TestMethod","node:TestSample","MeasuredResult","PassFailInterpretation","SpecificationCriterion","TestExecution","TestMethod","TestSample"]
capabilities: ["get","neighbors","path","slice","find","propose:node.upsert","pattern"]
cardDigest: "sha256:3d29e1d959413cdbaba934d32c296e5b0f6713372e8d08ae31074db195bc3661"
---
# QualityResult

Purpose: one reported outcome for one analyte or check, from one row of a COA, a lot test summary, a certifier batch page, a lot-identified survey table or a paper — with HOW it was obtained (resultBasis), the criterion printed beside it and the verdict the source printed. A survey row that names no lot is not a QualityResult: it stays the D1 predicate MEASURED_CONTENT_IN_PRODUCT or CONTAINS_UNDECLARED_SUBSTANCE on the Product (R-73). A "Certificate of Analysis" is not a node: it is a kernel Source (genre COA or TEST_SUMMARY) whose rows are QualityResults; "is it a real COA" is a kernel Assessment (QUALITY, subkind D8.coa-classification) over its rows (Q-D8-05). Merges pinned MeasuredResult, TestExecution, TestSample, TestMethod, SpecificationCriterion, PassFailInterpretation (source-stated part), CertificateOfAnalysis and LotTestSummary (row content). Identity rule: (issuer Organization uid, reportNumber or source canonicalUri, normalized analyteVerbatim, lot uid, testedAt); when the document names no issuer (a COA "manufactured for" a brand with no laboratory), (source canonicalUri, snapshot contentHash, row selector) replaces issuer and reportNumber. A re-capture of the same report re-anchors its locators and reuses the result. uid token: `quality-result`. Questions: CQ-AX-19, Q-D8-05, Q-D8-06, Q-D8-09, Q-D8-19.

## Identity

| | |
| --- | --- |
| id | `node:QualityResult` · raw SDL [sdl:QualityResult](../sdl/QualityResult.graphql) |
| module / domain | [D8](../modules/D8.md) / [Manufacturing, quality, regulation and intellectual property](../domains/manufacturing-quality-regulatory-ip.md) |
| uid | `hu:quality-result:<opaque>` |
| stored labels | `QualityResult` `Entity` (primary `QualityResult`) |
| archetype | Entity & Subjectable (observation record) |
| interfaces | [Entity](../interfaces/Entity.md), [Subjectable](../interfaces/Subjectable.md) |
| identity rule (register) | `issuedBy.uid (when named)` + `reportNumber or source canonicalUri` + `analyteVerbatim (normalized)` + `resultFor.uid` + `testedAt; when no issuer is named — source canonicalUri` + `snapshot contentHash` + `row selector` |
| identity keys | `uid`, `value`, `name` |
| identifier schemes | `LAB_REPORT` (disabled) |
| name match (workspace rule) | `name` · uid slug from `name` · rules [identity-rules](../rules/identity-rules.md) |

## Properties (29)

### Identity

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `id` | `ID!` | yes | create+update |  | D8.graphql:L535 |
| `uid` | `String!` | yes | create+update |  | D8.graphql:L536 |
| `value` | `Float` |  | create+update |  | D8.graphql:L546 |

### Core

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` |  | create+update |  | D8.graphql:L537 |
| `lastWriterRunId` | `String` |  | create+update |  | D8.graphql:L539 |
| `resultBasis` | [ResultBasis](../vocabularies/ResultBasis.md) | yes | create+update | How the row was obtained; MEASURED is the only basis that is a measurement. | D8.graphql:L543 |
| `analyteVerbatim` | `String!` | yes | create+update | Analyte or check as printed (e.g. 'NMN', '2.5% Withanolides', 'Lead'). | D8.graphql:L545 |
| `unitCode` | `String` |  | create+update | UCUM unit of value (and of labelClaimValue). | D8.graphql:L548 |
| `valueQualifier` | [ResultValueQualifier](../vocabularies/ResultValueQualifier.md) |  | create+update |  | D8.graphql:L549 |
| `valueVerbatim` | `String` |  | create+update | Value cell verbatim (keeps '<0.5', 'ND', 'Conforms', 'Quantity by Input'). | D8.graphql:L551 |
| `reportingLimit` | `Float` |  | create+update | Detection or reporting limit printed for the row. | D8.graphql:L553 |
| `labelClaimValue` | `Float` |  | create+update | Label claim the row compares against, when the source prints it. | D8.graphql:L555 |
| `percentOfLabelClaimStated` | `Float` |  | create+update | Percent of label claim when the source states it; otherwise computed at query time, never stored. | D8.graphql:L557 |
| `method` | `String` |  | create+update | Method as printed (e.g. HPLC-UV, ICP-MS, 'batch record review'); replaces pinned TestMethod. | D8.graphql:L559 |
| `methodReference` | `String` |  | create+update | Compendial or published method reference (e.g. USP <2091>, AOAC 2012.15). | D8.graphql:L561 |
| `sampleKind` | [SampleKind](../vocabularies/SampleKind.md) |  | create+update |  | D8.graphql:L562 |
| `reportNumber` | `String` |  | create+update | Lab report or certificate number (e.g. Eurofins 3921057-0). | D8.graphql:L564 |
| `testedAt` | `DateTime` |  | create+update |  | D8.graphql:L565 |
| `reportedAt` | `DateTime` |  | create+update |  | D8.graphql:L566 |
| `specComparator` | [QuantityComparator](../vocabularies/QuantityComparator.md) |  | create+update | Criterion printed beside the result (inline; replaces pinned SpecificationCriterion). specComparator uses D1 QuantityComparator (R-57); UNKNOWN is ke… | D8.graphql:L568 |
| `specLow` | `Float` |  | create+update |  | D8.graphql:L569 |
| `specHigh` | `Float` |  | create+update |  | D8.graphql:L570 |
| `specVerbatim` | `String` |  | create+update |  | D8.graphql:L571 |
| `specBasis` | [CriterionBasis](../vocabularies/CriterionBasis.md) |  | create+update |  | D8.graphql:L572 |
| `specPeriod` | [SpecPeriod](../vocabularies/SpecPeriod.md) |  | create+update |  | D8.graphql:L573 |
| `statedVerdict` | [PassFailVerdict](../vocabularies/PassFailVerdict.md) |  | create+update | Verdict as the source printed it; an evaluated verdict is a kernel Assessment. | D8.graphql:L575 |

### Temporal

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `createdAt` | `DateTime` |  | create+update |  | D8.graphql:L540 |
| `updatedAt` | `DateTime` |  | create+update |  | D8.graphql:L541 |

### Operational

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `privacyClass` | [PrivacyClass](../vocabularies/PrivacyClass.md) |  | create+update |  | D8.graphql:L538 |

## Outgoing relationships (7)

Stored direction is this type -> target. Interface and union targets are collapsed; expand with `bks-schema neighbors node:QualityResult --direction out --expand`.

| type | to | class | temporal | edge properties | declared on | write with |
| --- | --- | --- | --- | --- | --- | --- |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Identifier](Identifier.md) | asserted | episode | [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | Identifier.identifies (IN) | `identifier.attach` |
| [ISSUED_BY](../relationships/ISSUED_BY.md) | [Organization](Organization.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | QualityResult.issuedBy (OUT) | `edge.assert` |
| [MEASURES_ANALYTE](../relationships/MEASURES_ANALYTE.md) | [ChemicalSubstance](ChemicalSubstance.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | QualityResult.analyte (OUT) | `edge.assert` |
| [MEASURES_ANALYTE](../relationships/MEASURES_ANALYTE.md) | [Constituent](Constituent.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | QualityResult.analyte (OUT) | `edge.assert` |
| [MEASURES_ANALYTE](../relationships/MEASURES_ANALYTE.md) | [IngredientMaterial](IngredientMaterial.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | QualityResult.analyte (OUT) | `edge.assert` |
| [QUALITY_RESULT_FOR](../relationships/QUALITY_RESULT_FOR.md) | [Lot](Lot.md) | asserted | recorded-only | [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | QualityResult.resultFor (OUT) | `edge.assert` |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) (via [Entity](../interfaces/Entity.md)) | [Activity](Activity.md) | structural | recorded-only |  | Activity.generated (IN) | planner-emitted (kernel plumbing) |

## Incoming relationships (10)

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
| [MENTIONS](../relationships/MENTIONS.md) (via [Subjectable](../interfaces/Subjectable.md)) | [Chunk](Chunk.md) | derived | recorded-only | [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | Chunk.mentions (OUT) | read-only |
| [STEP_USES](../relationships/STEP_USES.md) (via [Subjectable](../interfaces/Subjectable.md)) | [ProtocolStep](ProtocolStep.md) | structural | recorded-only | [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | ProtocolStep.uses (OUT) | `edge.structural` |

## Legal predicates (6)

Predicates whose registered subject or object type is this type or an interface it implements. `typed-edge`: the fact is a stored relationship authorized by an Assertion with that predicate; `assertion-only`: no typed edge, the fact is `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)`.

| predicate | role | kind | route | registrar |
| --- | --- | --- | --- | --- |
| [COMMISSIONED_TEST](../predicates/COMMISSIONED_TEST.md) | object | relationship | assertion-only | D7 |
| [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | object | relationship | assertion-only | D13 |
| [HAS_IDENTIFIER](../predicates/HAS_IDENTIFIER.md) | subject | authorizing | typed-edge | K |
| [ISSUED_BY](../predicates/ISSUED_BY.md) | subject | authorizing | typed-edge | D8 |
| [MEASURES_ANALYTE](../predicates/MEASURES_ANALYTE.md) | subject | authorizing | typed-edge | D8 |
| [QUALITY_RESULT_FOR](../predicates/QUALITY_RESULT_FOR.md) | subject | authorizing | typed-edge | D8 |

## Evidence path

- Provenance requirement: WAS_GENERATED_BY the writing Activity on create and update (P9); node facts read as facts are FIELD Assertions with evidence (R-14); caches carry authority and method version
- Facts about a QualityResult are Assertions with it as subject: `(:QualityResult)<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`.
- An asserted edge from or to this type is authorized by exactly one Assertion (`r.assertionUid`); trace it with [the evidence path](../rules/evidence-path.md).

## Temporal and exclusivity

- Temporal scope of the node: **none** (time lives on the edges / Assertions that describe it).
- Valid time: (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged
- Recorded time: x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)
- Exclusive slots: (none)
- Rules: [temporal-rules](../rules/temporal-rules.md)

## Read patterns (4)

- [D12/Q-D12-03#option-a](../patterns/D12/Q-D12-03--option-a.md) (supported; Q-D12-03)
- [D12/Q-D12-06#option-a](../patterns/D12/Q-D12-06--option-a.md) (supported; Q-D12-06)
- [D8/Q-D8-18](../patterns/D8/Q-D8-18.md) (supported; Q-D8-18)
- [D8/Q-D8-19](../patterns/D8/Q-D8-19.md) (supported; Q-D8-19)

## Allowed executor proposals

- Executor operations (node register `mutations.executor`): `create`, `update`
- Policy: create; a re-capture of the same report re-anchors its locators and reuses the row; never delete
- Proposal kinds: `node.upsert`
- GraphQL `@mutation` flags are all off (lever L2) and grant nothing; creatability is the register's executor operations.

## Forbidden implications

(none)

## Tasks

- [Compare measured content of a sold product with its label declaration (OD-10 option A)](../tasks/measured-versus-declared-content.md)

## v1 navigation aliases

- `node:MeasuredResult` (merged): D8: QualityResult
- `node:PassFailInterpretation` (merged): D8: QualityResult
- `node:SpecificationCriterion` (merged): D8: QualityResult
- `node:TestExecution` (merged): D8: QualityResult
- `node:TestMethod` (merged): D8: QualityResult
- `node:TestSample` (merged): D8: QualityResult

## Source definition

- `release:sdl/modules/D8.graphql#L531-L588`
- `release:registers/node-register.yaml#QualityResult`
- `release:workspace-inputs/identity-rules.yaml#QualityResult`
