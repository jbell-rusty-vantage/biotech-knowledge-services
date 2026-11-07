# D8 — reasoning

MODEL stage (Wave 2, part 1), agent A7, 2026-10-08; revised after the adversarial review (section "Adversarial-review revision" at the end; the size table and decisions below are current). Inputs: `01-ecosystem.md`, `02-questions.md` (32 questions), `_notes/research-notes.md`, `_notes/fixture-candidates.md`, A1's kernel pattern (`packets/K/09-reasoning.md`, `04-schema-proposal.graphql` sha256 `0ad41559…`, `domain-template.graphql`), sibling research notes for D1, D6, D7, D13 (no sibling SDL existed at 17:20).

## The model in one paragraph

Almost every D8 fact is a dated record from one issuer with a fixed scope, and the main harm is reading more into a record than it says ("no questions" read as "approved", a COA that measures nothing read as a test, an "Active" patent whose asserted claims are invalid read as protection). So the module is six record-shaped node types whose scope lives in enums, and four bitemporal episode edges that carry when a standing, a coverage or a right holds. **RegulatoryRecord** is every authority act (regulator, court, tribunal) including enforcement; **LegalStatus** is a standing of one subject (market access, exclusivity or IP right) whose valid time is the STATUS_OF episode and whose basis is STATUS_FROM → record; **Lot** is the join key for "is the thing I hold real and lawful"; **QualityResult** is one reported row with its `resultBasis`; **CertificationListing** is one certifier listing whose COVERS episodes say what it covered when; **Patent** is one publication whose ownership and licences are episodes and whose claim-level standing is a LegalStatus. Everything else is a property, an enum value, a kernel Assertion predicate or a kernel Assessment.

## Size estimate

- node types: **6** (budget 8): RegulatoryRecord, LegalStatus, Lot, QualityResult, CertificationListing, Patent.
- relationship types: **11** (budget 14): ISSUED_BY, ADDRESSED_TO, CONCERNS, STATUS_OF, STATUS_FROM, LOT_OF, QUALITY_RESULT_FOR, MEASURES_ANALYTE, COVERS, ASSIGNED_TO, LICENSED_TO.
- from→to pairs: **29** (budget 35), union members counted:

| relationship | declaring fields | targets | pairs |
| --- | --- | --- | ---: |
| ISSUED_BY | RegulatoryRecord.issuedBy, QualityResult.issuedBy, CertificationListing.issuedBy | Organization | 3 |
| ADDRESSED_TO | RegulatoryRecord.addressedTo | Organization | 1 |
| CONCERNS | RegulatoryRecord.concerns (RegulatoryRecordTopic ∪5), Patent.concerns (PatentTopic ∪2) | ChemicalSubstance, IngredientMaterial, Product, Lot, Device (D4) / ChemicalSubstance, IngredientMaterial | 7 |
| STATUS_OF | LegalStatus.statusOf (LegalStatusSubject ∪5) | ChemicalSubstance, IngredientMaterial, Product, Patent, Device (D4) | 5 |
| STATUS_FROM | LegalStatus.establishedBy | RegulatoryRecord | 1 |
| LOT_OF | Lot.lotOf (LotOfTarget ∪2) | Product, ProductVariant | 2 |
| QUALITY_RESULT_FOR | QualityResult.resultFor (QualityResultFor ∪2) | Lot, Product | 2 |
| MEASURES_ANALYTE | QualityResult.analyte (QualityAnalyte ∪3) | ChemicalSubstance, IngredientMaterial, Constituent | 3 |
| COVERS | CertificationListing.covers (CertificationCoverageTarget ∪3) | Product, ProductVariant, Lot | 3 |
| ASSIGNED_TO | Patent.assignees | Organization | 1 |
| LICENSED_TO | Patent.licensees | Organization | 1 |
| **total** | 15 fields | | **29** |

- widest union target: **5** (RegulatoryRecordTopic, LegalStatusSubject). Most relationship fields on one type: 3 (limit 12). No inverse fields are declared (reverse reads go from the D8 side or by Cypher), so D8 adds no field to any other module's type.
- How computed: `node scripts/packet-check.mjs D8` (counts `nodeTypes 6, relationshipTypes 11, pairs 29`), cross-checked by hand above.

### Measured executable cost (compile check, 2026-10-08)

Assembled in scratch `…\scratchpad\ft\D8\compile.graphql` = A1 kernel SDL (sha256 `0ad415592b9e0b6c…`) + this module + 6 scratch stubs (`ChemicalSubstance`, `IngredientMaterial`, `Constituent`, `Product`, `ProductVariant`, `Organization`, each `Entity & Subjectable` with the 7 Entity fields and no relationships). Printed from the worktree with `BKS_SCHEMA_PATH=<abs compile.graphql> NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <abs out>`; every build reported "in 1s".

| SDL | bytes | lines | `grep -c '^input '` |
| --- | ---: | ---: | ---: |
| kernel alone | 326,564 | 6,582 | 185 |
| kernel + 6 stubs | 357,823 | 7,098 | 197 |
| **kernel + D8 + 6 stubs** (final compile.graphql, sha256 `8f599a4e5da65182…`) | **532,512** | **10,670** | **313** |
| kernel + D8 + 6 stubs, first build (before `facilityAddressVerbatim`, `facilityFei`; sha256 `97db20c3c13bf036…`) | 530,713 | 10,649 | 313 |
| variant of the first build: EnforcementAction kept separate (7 types, 32 pairs) | 559,116 | 11,162 | 327 |

- **D8 marginal cost** (final module vs kernel + stubs): **+174,689 bytes, +3,572 lines, +116 input types** (two added string properties cost 1,799 bytes and no input type). Of the 116 inputs, 22 are enum scalar filters (one per D8 enum used in a filter), 4 are first-use shared inputs any module pays once (`AssertedEdgePropertiesWhere`/`Sort`, `IntListFilters`, `OrganizationRelationshipFilters`), 22 are per-union-member `…ConnectionWhere` inputs (one per union pair), the rest are per-type `Where`/`Sort` and per-field connection filters. Per node type ≈ 29.1 KB and ≈ 19 inputs, in line with A1's C_MF lever (17.7 KB and 12 inputs for a three-relationship synthetic type; D8 types carry more properties and union targets).
- **Folding EnforcementAction** (measured against the first build) saves 28,403 bytes (5.1 % of the 7-type print; 14.1 % of the 7-type module's marginal 201,293 bytes) and 14 input types, one node type and 3 pairs, for no question lost (measured with the variant above).
- `node packages/schema-workspace/dist/cli.js map --sdl compile.graphql` parses (first build, schema digest `sha256:97db20c3…`); it expands the kernel's interface targets, so its pair total (175) is kernel-dominated and not the module figure.

### Re-measured in the check stage (2026-10-08, against A1's current kernel)

The model-stage numbers above were taken against the Wave 0 kernel (`0ad41559…`). A1's model-stage kernel (`packets/K/04-schema-proposal.graphql`, sha256 `790e7244eec773ff…`, 51,377 B) is additive and still compiles with D8 unchanged except for the switch of the seven recorded-only edges to `AssertedRecordedProperties`. Same recipe and stubs, files in scratch `…\scratchpad\ft\D8\check\`; every build "in 1s", no errors; `schema-workspace map` parses the assembled SDL (digest `sha256:aab28abf…`).

| SDL | bytes | lines | `grep -c '^input '` |
| --- | ---: | ---: | ---: |
| kernel alone (current) | 345,273 | 6,927 | 192 |
| kernel + 6 stubs | 376,532 | 7,443 | 204 |
| **kernel + D8 + 6 stubs** (check-stage compile.graphql, sha256 `aab28abfe2c8b9f1…`) | **555,428** | **11,072** | **322** |
| variant: same, all 11 edges on AssertedEdgeProperties (the model-stage choice) | 551,221 | 11,015 | 320 |

- **D8 marginal cost now: +178,896 bytes, +3,629 lines, +118 input types** (vs +174,689 / +116 against the Wave 0 kernel). The +2 inputs and +4,207 bytes are `AssertedRecordedPropertiesWhere` / `Sort`, a first-use cost: D1 and D13 also use the type, so the assembled schema pays it once. D8 keeps the switch because rule 9 asks recorded-only edges not to carry valid-time fields that a query could read as "always valid".
- Packet-check counts are unchanged: 6 node types, 11 relationship types, 29 pairs, widest union 5.

## Decisions (alternatives considered, what was cut and why)

### Node types

1. **RegulatoryRecord (kept; absorbs EnforcementAction, court decisions, submissions and responses).** Alternatives: (a) research recommendation of 7 types with a separate EnforcementAction; (b) separate Submission and Response (pinned); (c) court decisions as D13 Events only. Chosen: one "authority act" type, because every candidate shares one identity rule (issuer, kind, number), one issuer edge and one addressee edge, and every question that filters enforcement can filter `recordFamily: ENFORCEMENT`. Measured cost of (a): +28 KB, +14 inputs, +3 pairs. Cost of the fold: recall-only properties (`recallClass`, `recallStatus`, `terminatedAt`, `lotCodesVerbatim`) are nullable on a general type — acceptable, they are filters on a known `recordKind`. (b) is cut because a submission and its response are two records of the same type linked by docket and by the status they establish; no question traverses submission → response. (c) is rejected for D8: a decision is a document-backed act with a docket and a holding, the same shape as a regulator's letter; D13 may still have an Event documented by it (seam, owner D13).
2. **LegalStatus (kept; renamed from RegulatoryStatus; absorbs IpRightStatus, DrugApproval, OrphanDesignation).** Alternatives: (a) no status node — the standing is an `Assertion` with predicate `HAS_REGULATORY_STATUS` and a literal; (b) status episodes directly on a record → subject edge; (c) separate RegulatoryStatus and IpRightStatus. (a) fails CQ-MF-02/Q-D8-20 because the Assertion's object slot cannot hold both the record and the status literal, and GraphQL filters on `qualifiers` strings are weak; (b) fails because one standing is established by more than one record (NMN: NDI 1259 and sibling letters, then the 2025 petition response) and its valid time is not any record's date. (c) costs a type and a union for the same shape. The evidence the brief asked to honour decided the merge: patent standing is per claim and adjudicated (the '807 asserted claims held invalid while Google Patents shows "Active"), which is exactly a status with `claimNumbers`, established by a court record, with valid time. Exclusivity (EU data protection ended 2025-02-20) is the same shape with `statusFamily: EXCLUSIVITY`. Rename to LegalStatus because "regulatory status of a patent" would mislead agents.
3. **Lot (kept; renamed from ProductLot).** Alternative: lot code as a property on recalls, results and listings. Rejected: a lot code is not unique (scoped to a product and an issuer) and Q-D8-04, CQ-AX-19, Q-D8-08 and Q-D8-07 all join across sources on the same lot. D6 explicitly leaves lots to D8 (D6 notes §5).
4. **QualityResult (kept; one row; absorbs MeasuredResult, TestExecution, TestSample, TestMethod, SpecificationCriterion, PassFailInterpretation, and the row content of CertificateOfAnalysis and LotTestSummary).** Alternatives: (a) a COA node with result children (pinned); (b) results as Assertions with literals only. (a) rejected by the evidence: the Eurofins "Certificate of Analysis" measures nothing — its only result is "Quantity by Input" — so the document type says nothing and the per-row `resultBasis` says everything; the COA is a kernel `Source` and "is it a real COA" is a QUALITY assessment over its rows (Q-D8-05). (b) rejected because Q-D8-06 and CQ-AX-19 filter rows by basis, qualifier, analyte and percent of claim and join them to lot, analyte and tester; a node with typed properties is the cheapest filterable carrier. The criterion is inline (comparator, low, high, basis, period) because no question traverses a specification. The verdict field is **source-stated only** (`statedVerdict`); an evaluated conformance is a kernel Assessment (QUALITY, subkind D8.spec-conformance), so no D8 property is a judgment made by BellLabs.
5. **CertificationListing (kept; absorbs CertificationProgram and CertificationScope).** Alternative: certification as an Assertion predicate `CERTIFIED_BY` from product to certifier. Rejected: listings change in place (lots appear and drop off, listings lapse), carry a programme, standard and scope sentence, and are observed repeatedly — the COVERS episodes are where that history lives (Q-D8-08). Programme and scope are properties: no question traverses a programme.
6. **Patent (kept; absorbs GrantedPatent, PatentApplication, PatentFamily, PatentLicense; PatentClaim and IpRightStatus go to LegalStatus).** Alternatives: patent family as the node (rejected: adjudication, assignment and expiry are per publication), PatentClaim nodes (rejected: the only claim-level question, Q-D8-12, needs claim numbers on a status, and claim text stays in the snapshot), PatentLicense node (rejected: a licence version is one Assertion with qualifiers; its time is the LICENSED_TO episode).
7. **Cut: Facility** (offered to D8 by D7). No value-1 question traverses a facility; warning letters name the firm and print the address, and FEI-keyed data (FDA Data Dashboard) needs an account (research tool-log). Facility address stays verbatim on the record; a GMP-certified facility is covered as an Organization. Promotion trigger in `11-open-questions.md` OQ-D8-03.
8. **Cut: Specification types, ManufacturingProcess/Step, ManufacturingCapability, Trademark, CertificationProgram, PatentFamily, PatentClaim** — see `06-node-register.yaml deferred` and `mergedInto` (all 35 pinned W11–W14 types are listed there).

### Relationship types

- **ISSUED_BY** one type for four record types' issuers (regulator, court, laboratory, certifier). Alternative: a string `issuer` property. Rejected because Q-D8-06 must reach the tester's financial interests in D7 and Q-D8-22 dedupes on the issuer's uid; regulators are few, so the hub degree on FDA is high but bounded (queries start from the record side). TESTED_BY merged into it: the laboratory that reported a row is its issuer; who commissioned the test is predicate-only `COMMISSIONED_TEST`.
- **ADDRESSED_TO** kept separate from CONCERNS: "which firms received warning letters" must not return the products, and the two edges share the recorded-only base type, so the split costs no edge-property type. Alternatives: Organization as a sixth member of RegulatoryRecordTopic (same pair count, one fewer type) — rejected for that ambiguity; one edge with a domain-local role property (allowed since K change 2) — not taken, the role would be the only field and Q-D8-02 filters on it on every call.
- **CONCERNS** one type on two declaring types (record → topic ∪5; patent → topic ∪2), because the meaning is the same ("is about"). The patent leg is topical only; claim coverage of a formulation is an APPLICABILITY assessment (Q-D8-21) — never an edge. Since the adversarial review the record-topic union holds D4 `Device` instead of `Patent`: D4's value-1 harm question (Q-D4-08, mirrored as Q-D8-23) had no path, while the only patent question (Q-D8-12) reaches the court record through STATUS_OF / STATUS_FROM; infringement-only holdings are predicate-only ADJUDICATES_PATENT.
- **STATUS_OF / STATUS_FROM** asserted. STATUS_FROM could have been structural; it is asserted because "this letter establishes that standing" is an interpretation the verifier must check against the record's locator. ADJUDICATES cut: a court decision establishes a CLAIMS_HELD_INVALID status (claim numbers on the LegalStatus) that is STATUS_FROM the decision.
- **ASSIGNED_TO + LICENSED_TO** instead of one HOLDS_PATENT_RIGHT with a role property. The model stage's reason (kernel edge-property types carry no role) was removed by K change 2, so the choice was re-made on size in the adversarial review: a merged variant with a domain-local `PatentRightProperties` (AssertedEdgeProperties fields verbatim + `role: PatentRightRole!` + `exclusive: Boolean`) printed **517,624 B / 309 inputs** against **513,555 B / 309 inputs** for the split (current kernel, same stubs) — the merge saves a relationship type but costs +4,069 B, and no D8 question filters by exclusivity (Q-D8-11 returns it). Licence terms (exclusivity, field, territory, royalty) stay on the authorizing Assertion's `qualifiers`; a change of terms that neither starts nor ends a licence is a dated literal `D8.LICENCE_TERMS_AMENDED` (fixture us8197807 p05), never a new episode. OQ-D8-09 resolved.
- **MEASURES_ANALYTE** added beyond the research list: Q-D8-06 starts from the analyte ("products containing NMN measured far below claim"); free-text `analyteVerbatim` alone cannot join to D1.
- **Predicate-only** (no typed edge; `05-relationship-register.yaml predicateOnly` gives the promotion question for each): REVISES_DETERMINATION_OF, CITES_AS_EVIDENCE, CHARACTERIZES_REGULATORY_RECORD, MANUFACTURES, CONTRACT_MANUFACTURES_FOR, SUPPLIES_INGREDIENT, EXCLUSIVE_SUPPLIER_OF, DISTRIBUTES, REPORTED_COUNTERFEIT, MARKED_WITH_PATENT, CLAIMS_CGMP_COMPLIANCE, HAS_CAPABILITY_STAGE, COMMISSIONED_TEST; since the adversarial review also RATES_CLAIM (kernel convention, regulator findings on claims), CLAIMS_THERAPEUTIC_EFFECT (claim occurrences quoted in enforcement letters), HAS_APPROVED_INDICATION (named for D5), ADJUDICATES_PATENT, LISTING_COVERS_FACILITY_OF and the thirteen `D8.<FIELD>` literal predicates (property provenance, OQ-D8-12). The manufacturer/supplier roles (CQ-MF-01, value 1) stay predicate-only for a structural reason, not a budget one: D8 owns no type at either end (Organization → Product / IngredientMaterial), and the kernel rule is that a module declares edges only on its own types. If a GraphQL traversal is needed, D7 or D6 declares it (OQ-D8-05).
- **Kernel edges used, not declared:** HAS_SUBJECT/HAS_OBJECT/ASSERTED_BY (claim occurrences, predicate-only facts), HAS_IDENTIFIER (all record numbers), HAS_EVIDENCE (every trace), ASSESSES (six D8 assessment subkinds), WAS_GENERATED_BY (lineage), MENTIONS (D9 chunks, Q-D8-03).

### Directive and kernel conformance

- Every node: `implements Entity & Subjectable`, the 7 Entity fields verbatim, `@node(labels: [X, "Entity"]) @query(aggregate: false) @mutation(operations: [])`, docstring with Purpose, Identity rule, uid token, Questions. No `@id`, `@timestamp`, mutations.
- Every relationship: docstring `class; cardinality; questions`, `aggregate: false`, `nestedOperations: [CONNECT]` (all asserted), `@filterable(byValue: true, byAggregate: false)`, `properties: "AssertedEdgeProperties"` on the four episode edges and `"AssertedRecordedProperties"` on the seven recorded-only edges (check stage). No derived edges (D8 has no regenerable projection; Q-D8-19 is a published report, Q-D8-18 a query-time answer).
- No good/bad property (3.2): every "negative" fact is a record with an issuer (enforcement, status) or a source-stated row; evaluated verdicts are kernel Assessments. No SUPPORTS/CONTRADICTS, no MENTIONS declared (3.8). No union wider than 5; no any-entity union.

### GDS

None. D8 answers are as-of traversals over dated, issuer-scoped records; no D8 question asks for centrality, community, similarity or path ranking. The one candidate (supplier concentration, Q-D8-10) is a count over assertions. If D7's ownership/interest projection (Louvain/betweenness, D7 notes §6) exists, D8 reads it for testers' independence; D8 adds no projection.

## Bitemporal decision per edge

| edge | temporal | why |
| --- | --- | --- |
| STATUS_OF | **episode** | Standing changes: NMN excluded 2022-10-11 → not excluded 2025-09-29; EU data protection ended 2025-02-20; claims held invalid 2023-02-13. Q-D8-01 asks what the graph would have answered at D as recorded then — needs both valid and recorded time. |
| COVERS | **episode** | Certifier pages change in place; a lot dropping off a batch table or a lapsed listing is an episode closing (Q-D8-08). Valid time = observed coverage window. |
| ASSIGNED_TO | **episode** | Assignments change (university → company, mergers); Q-D8-11 "as disclosed when". |
| LICENSED_TO | **episode** | Licences are granted, amended (royalties waived after the litigation), terminated; Q-D8-21 lists versions over time. |
| ISSUED_BY, ADDRESSED_TO, CONCERNS, STATUS_FROM, LOT_OF, QUALITY_RESULT_FOR, MEASURES_ANALYTE | recorded-only (`AssertedRecordedProperties`) | Each links an immutable record to what it names; the record's own date is a property and its meaning never changes in valid time. A correction is a new Assertion (supersession), closing the old episode by `recordedTo`. Since the check stage these edges use the kernel's `AssertedRecordedProperties` (no valid-time fields; K change 1, answering OQ-D8-13); any valid time the source states stays on the authorizing Assertion. |

The brief's draft had three episode edges (STATUS_OF, COVERS, HOLDS_IP_RIGHT). Splitting HOLDS_IP_RIGHT into ASSIGNED_TO and LICENSED_TO makes four; the number of episode-bearing *facts* is unchanged.

## Budget excess (one line per element, prefixed EXCESS:)

No element exceeds budget (6/8 node types, 11/14 relationship types, 29/35 pairs, widest union 5/6, most fields per type 3/12). Headroom kept on purpose for the promotions most likely to be asked for: Facility (node, +1 type, +2–3 pairs), a D8-owned manufacturer role edge if D7 declines it (OQ-D8-05), and the sixth `RegulatoryRecordTopic` slot (D9 MediaWork, OQ-D8-29).

## Risks

1. **Seam drift.** The seven seam target names are confirmed against the sibling SDLs on disk (D1 `ChemicalSubstance`, `IngredientMaterial`, `Constituent`; D4 `Device`; D6 `Product`, `ProductVariant`; D7 `Organization`), and the sibling seam files already use D8's model names (OQ-D8-28 closed). What can still drift is this revision's own changes: D6 and D12 must rename `RESULT_FOR` → `QUALITY_RESULT_FOR` (OQ-D8-30), D7 must drop `COVERS → Organization`, D4 must mark its Device rows declared, and D13 must adopt D8's pathway vocabulary (OQ-D8-02). Mitigation: every seam is listed per member in `10-seams.yaml`, all `owner: this`.
2. **Lot identity depends on product resolution.** A recall's `code_info` names lots in free text and products by description; if the product does not resolve, the lot cannot be created and Q-D8-04 falls back to fulltext over `lotCodesVerbatim` (03#Q-D8-04). Fixture imu-tek-warning-letter-recall tests the resolved path only.
3. **QualityResult identity on re-capture** relies on (issuer, reportNumber or URI, analyte, subject, testedAt); surveys without report numbers and PDFs whose extraction differs by mode (tool-log E3: `250 ND` vs `250 261`) can create duplicates or wrong values. Mitigation: locator records extraction mode; verifier re-selection.
4. **The "is not" table lives in the answer layer**, not the graph (03 conventions). If an agent answers from `statusKind` without it, "NO_QUESTIONS" can still be read as approval. Mitigation: the table is small and fixed; propose it as a D10 answer policy rule (OQ-D8-10).
5. **Enum growth.** `RegulatoryRecordKind`, `RegulatoryRecordOutcome` and `RegulatoryPathway` will grow per jurisdiction (TGA, UK, Japan FOSHU). Each value is cheap (enum values add no inputs), but the vocabularies need an owner.
6. **ISSUED_BY hub on regulators** (FDA will issue most records). Queries start from the record or the subject; the regulator node is never the traversal start except for "all records by FDA", which filters by `recordKind` first.
7. **Directive tension**: harm signals for Q-D8-18 are assembled at query time; a published "avoid" list would be a Report and must cite every signal (no stored flag).

## With twice the budget

- **Facility** (FEI identity) with ADDRESSED_TO/COVERS/INSPECTED edges, once FDA Data Dashboard access exists: inspection classifications (NAI/VAI/OAI) per facility over time, and contract-manufacturer → brand chains (CQ-MF-06, Q-D8-17).
- **Specification** as a versioned node owned by its setter (regulator annex specs, compendial monographs), so results could be evaluated against the specification in force at the test date (Q-D8-09 at value 1).
- **Licence** as a node (licensor, licensee, patents, field, territory, royalty) with versions, for licence-chain questions across sublicences (Q-D8-21 at value 1).
- **Typed manufacturer/supplier role edges** with episodes (CQ-MF-01 traversal in GraphQL) in whichever module owns Organization.
- **Trademark** with TSDR access, for brand-identity and counterfeit questions.

## Kernel pattern changes consumed

Model stage: none beyond the 2026-10-08 publication. D8 requests additive kernel changes in `11-open-questions.md`: identifier schemes (OQ-D8-08), typed licence-term qualifiers (OQ-D8-09), assessment subkind registry entries (OQ-D8-11).

Check stage (2026-10-08, against A1's model-stage kernel, sha256 `790e7244eec773ff…`): **K change 1** (`AssertedRecordedProperties`) adopted on ISSUED_BY, ADDRESSED_TO, CONCERNS, STATUS_FROM, LOT_OF, RESULT_FOR, MEASURES_ANALYTE (SDL, 05, every fixture `assertions.yaml` edge block); **K change 9** (seam rule) applied: `PrivacyClass` and `AssertedRecordedProperties` moved from a pseudo-seam to `sharedVocabularies: kernel-types` in `10-seams.yaml`. **K change 2** (domain-local edge-property types) noted for OQ-D8-09: licence exclusivity/field/territory stay Assertion qualifiers because no D8 question filters LICENSED_TO by them at value ≤ 2. K changes 3–8 touch nothing D8 declares; the Assessment slots (`conclusionCode`, `grade`, `facets`) give the D8 subkinds a place for their verdicts without new fields. Identifier schemes requested in OQ-D8-08 are now `status: requested` rows in K `identifier-schemes.yaml` v2.

Adversarial-review revision (2026-10-08, kernel sha256 `b2c2b1b0094ead58…`): **K change 2** re-applied to OQ-D8-09 — measured and declined on size (above). **K change 6 / items 9 and 12 (M4, M5)** adopted: a regulator's finding on a claim is `RATES_CLAIM` by the regulator (fixture imu-tek i17), a claim quoted only inside a regulator's letter is a CLAIM occurrence asserted by the regulator with `basisKind: CITED_FROM_PRIOR_WORK` (i12, was MAKES_CLAIM asserted by the firm), and the observation date uses `validObservedAt` / OBSERVATION_ONLY. The research-stage `CITED_AS_DRUG_CLAIM` is dropped. The relationship-name rule ("unique to the module") drove the `QUALITY_RESULT_FOR` rename.

## Fixtures stage: what the real documents confirmed or changed (A7, 2026-10-08)

Six fixtures, 125 locators re-selected from snapshot bytes, 90 assertions, 7 zod-valid intents (`07-fixtures/`) — fixtures-stage counts; the current ones are in "Adversarial-review revision" below. Every one of the 11 relationship types is exercised by real assertions: ISSUED_BY 11, ADDRESSED_TO 9, CONCERNS 9, STATUS_OF 6, STATUS_FROM 6, LOT_OF 8, RESULT_FOR 5, MEASURES_ANALYTE 5, COVERS 8, ASSIGNED_TO 2, LICENSED_TO 3. No node type or relationship type was added or removed.

- **Confirmed: status as a node with an episode edge.** NMN needed three STATUS_OF episodes over two LegalStatus nodes and two ingestion steps; the as-of answers (2024 vs 2026; recorded before vs after the 2025 response) come out of edge episodes alone. The EU data protection (ended 2025-02-20) and the '807 claims-held-invalid status fit the same shape with no extra type.
- **Confirmed: lot as a node.** Lot 216 joins a recall to a product; the certifier batches H26246 and A24176 carry their own coverage windows; COA lots join rows to products.
- **Confirmed: QualityResult.resultBasis is the decisive field.** The Eurofins "Certificate of Analysis" has only INPUT_VERIFIED rows; the contrast COA shows IN_PROCESS_CONTROL, STATED_WITHOUT_VALUE and MEASURED on one page. A boolean "has COA" would have answered Q-D8-05 wrongly.
- **Changed (open):** ISSUED_BY on QualityResult cannot be `exactly_one` — one real COA names no issuer (OQ-D8-22).
- **Changed (fixture rule):** identity is never merged on name similarity in a fixture: "Colostrum-5 Powder" vs "Immuno-5 Colostrum Powder" (D6) and ChromaDex, Inc. vs Niagen Bioscience, Inc. (D7) stay separate nodes with an open question each (OQ-D8-25, OQ-D8-26).
- **Kept predicate-only:** CITES_AS_EVIDENCE and REVISES_DETERMINATION_OF were exercised as assertions with object nodes; no question in the fixtures needed to traverse them in GraphQL, so they are not promoted.
- **Provenance for properties:** evidence-bearing node properties (recordKind, outcome, recallClass, resultBasis, claimNumbers, …) travel as `node.upsert` proposals with evidence locators, plus `D8.*` literal assertions for dated facts that a question reads (inspection window, recall status). This is the fixture answer to OQ-D8-12 pending the kernel's confirmation.
- **Research findings retracted by the fixtures:** the claim that FDA mis-cited a trial in the NDI 1259 letter (a Firecrawl parse error, E6), the claim that the "2029" date was a parse error (it is printed in the letter, E5), the NSF/ANSI 173 scope sentence (commented-out HTML, E8). Each correction is recorded where the original claim was (01-ecosystem, 03-retrieval-patterns, fixture-candidates, tool-log). The lesson for the verifier: re-select against document bytes, never only against a parser projection.

## Adversarial-review revision (A7, 2026-10-08)

Two reviewers (evidence integrity, model discipline) raised 8 + 15 findings; every one was re-verified against re-fetched sources or sibling packets before it was fixed or rebutted (RUNLOG "Adversarial review").

**Model changes (counts unchanged: 6 node types, 11 relationship types, 29 pairs, widest union 5).**

- `RESULT_FOR` → `QUALITY_RESULT_FOR` (D3 declares RESULT_FOR with another meaning and edge-property type; K: names unique to a module; Neo4j relationship-property indexes are per type).
- `RegulatoryRecordTopic` = ChemicalSubstance | IngredientMaterial | Product | Lot | **Device** (Patent out); `LegalStatusSubject` + **Device** (4 → 5): +1 pair. Question Q-D8-23 (value 1, harm) mirrors D4's Q-D4-08/-09/-10; fixture is D4's `noninvasive-glucose-cgm-recall`. `recordKind` DEVICE_CLEARANCE and pathway US_DEVICE_PMA added.
- `CertificationCoverageTarget` loses Organization (−1 pair): no fixture, no fixtured question (CQ-MF-06 is value 2, fixture no), and it overloaded "covers"; predicate-only LISTING_COVERS_FACILITY_OF carries a facility listing's operator until Facility is promoted.
- `RegulatoryPathway` gains approval routes and designation programmes so D8 owns one regulatory vocabulary for the assembled schema (D13 maps its ApprovalPathway / DesignationType onto it; OQ-D8-02). Enum values add no input types.
- `QualityResult.issuedBy` is zero_or_one with an identity fallback when a COA names no issuer (OQ-D8-22, fixture finding).
- The 37 node properties outside `06 filterProperties` carry `@filterable(byValue: false, byAggregate: false) @sortable(byValue: false)` (verbatim texts, citations, secondary dates, spec details); they stay readable and Cypher-filterable (Q-D8-04's lot-text fallback is a Neo4j fulltext index, not a GraphQL filter).

**Measured (current kernel `packets/K/04-schema-proposal.graphql` sha256 `b2c2b1b0094ead58…`, 7 scratch stubs: the six earlier ones + D4 `Device`; same print command; every build "in 1–2 s", no errors; files in scratch `…\scratchpad\ft\D8\adv\c\`; `schema-workspace map` parses the assembled SDL, digest `sha256:c1372459…`).**

| SDL | bytes | lines | `grep -c '^input '` |
| --- | ---: | ---: | ---: |
| kernel alone | 322,904 | 6,466 | 179 |
| kernel + 7 stubs | 359,208 | 7,068 | 193 |
| kernel + D8 as of the check stage + 7 stubs | 538,104 | 10,697 | 311 |
| kernel + D8 revised, without the filterability lever | 539,582 | 10,721 | 311 |
| **kernel + D8 revised + 7 stubs (final)** | **513,555** | **10,452** | **309** |
| variant: ASSIGNED_TO + LICENSED_TO merged into HOLDS_PATENT_RIGHT (PatentRightProperties) | 517,624 | 10,472 | 309 |

- **D8 marginal now: +154,347 bytes, +3,384 lines, +116 input types** (was +178,896 B / +118 against the same kernel and stubs). The filterability lever saves 26,027 B and 2 inputs; the union changes and the rename cost +1,478 B and no input.
- The 55 MB pinned schema is not what was printed (the outputs are 0.5 MB; the path resolved).

**Fixture tallies after the revision.** 70 typed-edge assertions: ISSUED_BY 11, ADDRESSED_TO 9, CONCERNS 8, STATUS_OF 6, STATUS_FROM 6, LOT_OF 8, QUALITY_RESULT_FOR 5, MEASURES_ANALYTE 5, COVERS 8, ASSIGNED_TO 2, LICENSED_TO 2. Every relationship type is exercised. 23 of 29 pairs are exercised by D8 fixtures; **unfixtured pairs** (each with the question and source that would exercise it, OQ-D8-32): COVERS → ProductVariant (CQ-PF-03, a variant-level listing), QUALITY_RESULT_FOR → Product (Q-D8-06, survey rows without lots: S37, S39), STATUS_OF → Product (CQ-MF-02, LNHPD product licence S32), CONCERNS Patent → IngredientMaterial (Q-D8-11, a crystal-form patent), STATUS_OF → Device (Q-D8-23, an openFDA 510(k) record), CONCERNS → Device (Q-D8-23; exercised only in D4's fixture). Fixture edits: imu-tek i12 (retelling by FDA) and new i17 (RATES_CLAIM) with two new locators re-selected from the snapshot bytes; the 3.8 walk gains `step2b_entity_hop` (ADDRESSED_TO i06 → recall record → `loc-rc-*` → `snap-recall`); certification k13/k14 validFromBasis INFERRED (the page states test dates, not a coverage start); us8197807 p05 is a dated literal D8.LICENCE_TERMS_AMENDED (the 2024 Supplemental Agreement amends licences dated 2012 and 2014) and p11 is predicate-only ADJUDICATES_PATENT. `tools/verify.py`: 127/127 locators re-selected from snapshot bytes across all six fixtures (125 + 2 new); `check-intent.mjs`: 7/7 intents zod-valid.
