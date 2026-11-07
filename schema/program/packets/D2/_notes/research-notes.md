# D2 — research notes for the model stage (A3, research stage, 2026-10-08)

Audience: the agent that writes 03–11 for D2. Read `01-ecosystem.md` §1 and §3 first; questions are in `02-questions.md`; real sources in `_notes/fixture-candidates.md`. Kernel pattern (A1) was **not published** when this was written: subject/object/identifier/mention edges below are written against the placeholder `Subjectable` and must be rebased.

## 1. What the evidence says the model must hold

1. **Mechanism knowledge is per-context, not per-pair.** The same compound→step pair is measured-positive in one species/compartment, measured-null in another, and hypothesized on a product page (NR: muscle NAAD up, muscle NAD+ unchanged, acetylation null, respiration null, serum cytokines down, mouse lifespan null — FC-1, FC-4; marketing says sirtuins activated, mitochondria improved — FC-6). So the record is an **Assertion with an evidence context**, and any compound→mechanism edge is a **derived projection** over those assertions. This confirms the pinned design (MechanismEvidenceContext + derived AFFECTS_MECHANISM) and argues against any asserted typed compound→mechanism edge.
2. **Basis kind is the most valuable single field** (CQ-MX-01, -05; Q-D2-04, -16, -25). Sources already carry it natively: UniProt ECO codes (ECO:0000269 experimental vs ECO:0000250 by similarity), Reactome `isInferred`, product pages (no measurement at all). Proposed enum `MechanismBasis`: `MEASURED`, `INFERRED_ORTHOLOGY`, `INFERRED_REASONING`, `CITED`, `HYPOTHESIZED`, `COMPUTED`. Whether it lives on kernel `Assertion` (as `basisKind`, round 0003) or on the evidence context is a kernel question — prefer the kernel Assertion so D3/D4/D5 reuse it; ask A1.
3. **Null results must be first-class**: polarity needs `NO_CHANGE` (measured null) distinct from `UNKNOWN`. FC-1 (acetylation, respiration), FC-4 (lifespan), FC-2 (no direct activation) all are nulls. Proposed `EffectDirection`: `INCREASE`, `DECREASE`, `NO_CHANGE`, `MIXED`, `NOT_ASSESSED`. Kernel's `Polarity` enum may already cover this; reuse if so.
4. **Curated references can be wrong or contested** (KEGG: resveratrol "by activating SIRT1 activity", FC-10, vs Pacholec FC-2). A reference record is just another asserter; it gets Assertions, not privileged structural truth, when it states an effect. Only *membership topology* (gene X participates in pathway P, per Reactome release R) is structural.
5. **Two-step molecular mechanisms are common**: ChEMBL's curated MoA for sirolimus is FKBP1A inhibition, while the longevity narrative is mTOR inhibition (FC-5). This is handled without a `MechanismChain` node: an assertion `sirolimus –inhibits→ FKBP1A` (from ChEMBL, MolecularEntity object) plus reference membership FKBP1A/MTOR → "MTOR signalling" (Reactome). Keep `MechanismChain` deferred (OPEN-QUESTIONS item 7); the ordered chain is a query-time path or a published report.
6. **Mentions are noisy**: Europe PMC tagged "nicotinamide riboside" as dihydrozeatin riboside and "NR" as a protein (FC-1b). MENTIONS stays derived, versioned by linker method, never a write input. It is still the cheapest chunk finder for CQ-MX-01 and Q-D2-24.
7. **Versions matter on reference links**: Reactome `stIdVersion` R-HSA-196807.8 while its DOI is version .7; UniProt `entryVersion` 226; GenAge build 21; DrugAge build 5. Structural reference edges need `referenceRelease` (or the snapshot uid) as an edge property; they do **not** need bitemporal episodes.

## 2. Candidate node types (budget ≤ 8; recommended 4, optional 5)

| candidate | recommendation | whyNode (question that filters/joins/traverses through it) | notes |
| --- | --- | --- | --- |
| `Mechanism` | **keep** | Q-D2-01, Q-D2-02, Q-D2-06, Q-D2-12, Q-D2-14, CQ-MX-05; traversal hub of compound→mechanism→biomarker (Q-D2-03) | Small curated vocabulary (target ~100–300 nodes). `mechanismKind` enum: `HALLMARK`, `PROCESS`, `PATHWAY` (reference pathway record), `MOLECULAR_FUNCTION`. Identity: authority id when one exists (GO / Reactome stable id **without** version), else BellLabs curated slug. SearchIndexable (vector over description, brief asks for it). |
| `Pathway` | **merge into Mechanism** (`mechanismKind: PATHWAY`, `referenceScheme`, `externalId`, `referenceRelease`) | Same questions as Mechanism; no question needs to distinguish a pathway node from a process node except by kind filter | Saves one type and two edge families (`INVOLVES_PATHWAY` becomes `PART_OF`). Risk: Reactome topology and BellLabs concepts share a label — mitigated by kind + scheme. Alternative (keep Pathway) costs +1 node, +1–2 rels. |
| `MolecularEntity` | **keep** | Q-D2-08 (curated MoA target, e.g. FKBP1A), Q-D2-11 (players in M), Q-D2-20 (gene manipulation lifespan effects), Q-D2-19 (GDS co-membership) | Genes/proteins/complexes/families/ncRNA. **Not** endogenous small molecules (NAD+, NAAD, NMN): those are D1 compounds (ChEBI) — contest with D1 below. Identity: UniProt acc (protein) or HGNC/Entrez (gene); `entityKind` enum; `speciesTaxonId` property (orthologs are separate nodes only when a question needs them — default human only). |
| `MechanismEvidenceContext` | **keep** (occurrence archetype) | CQ-MX-01/02/03, Q-D2-04, Q-D2-13, Q-D2-26: every "in which species / tissue / dose" filter | Absorbs Species and AnatomicalContext as properties (§3). One context = one exposure group measured in one compartment (round 0003 M3). |
| `Condition` | **keep** (D2 is default owner) | Q-D2-14, Q-D2-15; seams: D3 Study investigates Condition, D5 contraindication/adverse effect, D4 Biomarker indicates Condition | Absorbs `RiskFactor` via `conditionKind` (`DISEASE`, `PHENOTYPE`, `RISK_STATE`) — obesity, insulin resistance; behavioural risk factors (smoking, inactivity) go to D5 exposures. Keep ontology ids as properties (MONDO, ICD-10/11, Orphanet, OMIM), plus Identifier per kernel. |
| `Species` | **enum + properties, no node** | No question traverses *through* a species; all filter on it (CQ-MX-02/03, Q-D2-13, Q-D2-20) | See §3 decision. |
| `AnatomicalContext` / `Organ` | **enum + ontology-id properties, no node** | Filter only (CQ-MX-02, Q-D2-04, Q-D2-13); the cross-domain join (mechanism step compartment = biomarker specimen compartment) is an equality on `compartmentOntologyId` | See §3; coordinate with D4 (specimen matrix). |
| `Outcome` | **defer / merge out** | Every Outcome question is answered by another domain's type: biohacker goals → D5 `Target` vocabulary; trial endpoints → D3 `OutcomeDefinition`; measurable quantities → D4 `Biomarker`/`Metric`; lifespan → D5 target "longevity" + D3 endpoint | Brief flags the Outcome/OutcomeDefinition boundary. Recommendation: no D2 Outcome node; `INFLUENCES_OUTCOME` retargets to D5 `Target` (derived) and to `Condition`. |
| `RiskFactor` | **merge into Condition** (kind RISK_STATE) or D5 exposure | Q-D2-15 only indirectly | Genotype-class risk factors (APOE ε4) → assertion on MolecularEntity variant; defer variants. |
| `Hallmark` (new) | **no separate type** → `Mechanism{mechanismKind: HALLMARK}` (12 nodes seeded from FC-12) | Q-D2-12, Q-D2-02 | Map hallmark → GO/Reactome mechanisms via `PART_OF`. Open Genes' `agingMechanisms` vocabulary maps onto it (curation task). |

Estimated D2 size: **4 node types** (Mechanism, MolecularEntity, MechanismEvidenceContext, Condition); 5 if Pathway is kept separate.

## 3. Decision requested by the packet direction: Species and AnatomicalContext — nodes or enums?

**Recommendation: enums (plus an ontology id string), not nodes.**

Evidence from the questions: no D2/D3/D4 question we found traverses *from* a species or compartment to something else; they filter by it, group by it, or compare it across two records (mechanism step in muscle vs biomarker in blood — Q-D2-04; mouse vs human — CQ-MX-03). Property filters on the context node do all of that. A node would add, per referencing type, a relationship family (pinned: IN_SPECIES, MEASURED_IN, MEASURED_IN_MATRIX, APPLIES_TO_SPECIES, ACTS_IN, STUDIED_IN, AFFECTS_ORGAN, EXPRESSED_IN, EXPRESSED_IN_CONTEXT = 9 relationship types and 27+ incoming fields on AnatomicalContext alone in the pinned schema-map).

Proposed shape:
- `ModelOrganism` enum (shared vocabulary; D2 owns, D3/D4 consume): `HUMAN`, `MOUSE`, `RAT`, `NONHUMAN_PRIMATE`, `DOG`, `OTHER_MAMMAL`, `ZEBRAFISH`, `FLY`, `WORM`, `YEAST`, `OTHER` — plus `ncbiTaxonId` (String, e.g. "9606", "10090"; DrugAge and Europe PMC tags emit taxon ids/names) and `strainOrLine` (String, e.g. "UM-HET3", "C57BL/6JRj").
- `CompartmentKind` enum (from pinned AnatomicalContextKind, extended): `WHOLE_ORGANISM`, `ORGAN`, `TISSUE`, `CELL_TYPE`, `CELL_LINE`, `SPECIMEN_MATRIX` (blood, plasma, serum, urine), `SUBCELLULAR`, `CELL_FREE` — plus `compartmentOntologyId` (UBERON / CL / Cellosaurus id) and `compartmentLabel`.
- `MechanismSetting` enum kept as pinned (8 values); IN_VITRO_CELL_FREE and IN_SILICO may lack species (INV-210 rule survives as a validation, not a cardinality).

What would reverse it: a question that needs to traverse species → something (e.g. "all models used by lab L", or a species hierarchy query "any rodent") — the rodent case is covered by enum grouping; or D4 needing specimen matrix as a node with its own relationships (collection device, stability). Ask D4 (same worktree) before SDL; if D4 makes `SpecimenType` a node, D2 should still not point at it from evidence contexts unless a question traverses it.

## 4. Candidate relationships (typed only where a question traverses)

| relationship | class | from → to | questions | populating source | keep? |
| --- | --- | --- | --- | --- | --- |
| `PART_OF` (absorbs pinned INVOLVES_PATHWAY, HAS_MECHANISM hierarchy part) | structural | Mechanism → Mechanism | Q-D2-02, Q-D2-12, Q-D2-11 | Reactome hierarchy (hasEvent), GO is_a/part_of, BellLabs hallmark mapping | yes |
| `PARTICIPATES_IN` (absorbs CONTRIBUTES_TO) | structural | MolecularEntity → Mechanism | Q-D2-11, Q-D2-02, Q-D2-19 | Reactome participants (FC-5), GO annotations, GenAge | yes; edge props `role` (enzyme/regulator/substrate), `referenceScheme`, `referenceRelease`, `regulatorySign` (pinned RegulatorySign enum) |
| `OBSERVED_IN_CONTEXT` | structural | (kernel) Assertion → MechanismEvidenceContext | CQ-MX-01/02/03, Q-D2-13, Q-D2-26 | papers' Methods (FC-1, FC-3, FC-7), DrugAge rows (FC-4) | yes; seam to K (declared by D2 or by K — ask A1) |
| `EXPOSED_TO` | structural | MechanismEvidenceContext → D1 compound/material | CQ-MX-02, CQ-MX-04, Q-D2-22 | papers, DrugAge | yes; collapse the pinned three fields (IngredientMaterial / ChemicalForm / ChemicalSubstance) to **one** target: whatever D1 exposes (single type or interface ≤ 6) |
| `IN_STUDY_ARM` | structural | MechanismEvidenceContext → D3 StudyArm | CQ-MX-02, Q-D2-06 (human join) | registry + paper (FC-1 NCT02950441, FC-3 NCT02552355, FC-7 NCT02848131) | yes (seam D3) |
| `AFFECTS_MECHANISM` (absorbs MODULATES) | derived, read-only | D1 compound → Mechanism **and** → MolecularEntity (union of 2, or two fields) | CQ-MX-05, Q-D2-02, Q-D2-06, Q-D2-18, Q-D2-03 first hop | projection job over Assertions + contexts, method version | yes; properties below |
| `INFLUENCES` (replaces INFLUENCES_OUTCOME, ASSOCIATED_WITH_CONDITION) | derived, read-only | Mechanism → Condition, Mechanism → D5 Target | Q-D2-14, Q-D2-10 | projection over assertions with predicate `influences` / curated hallmark→target mapping | probably yes (one field per target type, or predicate-only until telemetry) |
| `REFLECTS_MECHANISM` | structural | D4 Biomarker → Mechanism | Q-D2-03, Q-D2-04, Q-D2-22 | curated (FC-1 cites Trammell et al. 2016a for NAAD as "a highly sensitive biomarker of NR supplementation" and Trammell and Brenner 2013 for the LC-MS/MS method; p16/SA-β-gal markers in FC-7) | yes, **owned by D4** (declared on Biomarker); D2 lists it in seams |
| `ENCODES` / biomarker measures molecular entity | structural | MolecularEntity → D4 Biomarker (or reverse) | Q-D2-03 (IL-6 protein as SASP biomarker) | UniProt/HGNC id on biomarker | decide with D4; prefer a property `molecularEntityUid` on Biomarker unless a question traverses |
| IN_SPECIES, MEASURED_IN, ACTS_IN, APPLIES_TO_SPECIES, MEASURED_IN_MATRIX, STUDIED_IN | — | — | — | — | **cut** → enum properties (§3) |
| HAS_MECHANISM (Condition → Mechanism), INCREASES_RISK_FOR, MEDIATES_RISK_THROUGH, AFFECTS_ORGAN | — | — | Q-D2-14, Q-D2-15 | — | **predicate-only** (`Assertion.predicate`) until a question traverses them often; promotion question: Q-D2-14 |
| INDICATES (Biomarker → Condition) | derived | D4 → D2 | — | — | D4 decides; D2 seam only |
| INVESTIGATES (Study → Condition), TARGETS_CONDITION (Treatment → Condition), RELATES_TO_CONDITION (SafetySignal → Condition) | — | other domains → Condition | D3/D5 questions | — | owned by D3/D5; D2 lists as incoming seams |

Estimated relationship types declared by D2: 5 (PART_OF, PARTICIPATES_IN, EXPOSED_TO, IN_STUDY_ARM, AFFECTS_MECHANISM) + 1 optional (INFLUENCES) + OBSERVED_IN_CONTEXT if K does not declare it = **6–7**; pairs ≈ 8–12 depending on D1's compound targets. Widest union: 2.

### Derived projection method spec (brief deliverable; for 03/09)

`AFFECTS_MECHANISM` edge properties (read-only, `@settable(onCreate:false,onUpdate:false)`, `nestedOperations: []`, `aggregate: false`): `methodVersion` (e.g. `d2.affects-mechanism.rule.v1`), `derivedAt`, `derivedByActivityUid` (kernel Activity of kind projection — 00-DIRECTIVE §4.2), `inputAssertionSetDigest`, `direction` (EffectDirection; MIXED when contexts disagree), `bestBasis` (MechanismBasis), `highestSetting` (MechanismSetting), `humanMeasured` (Boolean), `nMeasuredPositive`, `nMeasuredNull`, `nHypothesized`, `organisms` ([ModelOrganism]), `compartmentIds` ([String]). Rule v1: one edge per (compound, mechanism) with ≥ 1 non-retracted Assertion whose object is the mechanism (or a MolecularEntity that PARTICIPATES_IN it, flagged `viaMolecularEntity`); never created from MENTIONS, GDS or marketing-only assertions unless `bestBasis` says so explicitly. CQ-MX-05 reads `bestBasis IN [CITED, HYPOTHESIZED]`.

GDS candidates (all materialized, suggestion-only, method-versioned, never Assertions): PageRank/degree of Mechanism over the evidence subgraph (Q-D2-06 ranking aid); Louvain/Leiden over MolecularEntity–Mechanism co-membership to propose hallmark groupings; link prediction compound → mechanism from target co-membership (Q-D2-19), output stored as a projection with `suggestion: true`.

Vector: one index on `Mechanism.searchText` (name + description + synonyms), used to resolve free-text mechanism mentions in claims to the curated vocabulary; chunk-level vectors are K/D9.

## 5. Properties, enums and `Assertion.predicate` values

- **Mechanism**: `name`, `description`, `mechanismKind` (enum), `referenceScheme` (enum `REACTOME | GO | KEGG | WIKIPATHWAYS | BELLLABS`), `externalId` (unversioned), `referenceRelease`, `hallmarkCode` (only for HALLMARK kind), `biologicalLayer` (enum: MOLECULAR, CELLULAR, TISSUE, SYSTEMIC), search fields.
- **MolecularEntity**: `entityKind` (enum GENE, PROTEIN, COMPLEX, FAMILY, NCRNA), `geneSymbol`, `hgncId`, `uniprotId`, `ensemblId`, `entrezId`, `speciesTaxonId`.
- **MechanismEvidenceContext**: `setting`, `organism` (ModelOrganism), `ncbiTaxonId`, `strainOrLine`, `sexScope` (enum MALE/FEMALE/MIXED/UNKNOWN), `ageDescriptor`, `sampleSize`, `compartmentKind`, `compartmentOntologyId`, `compartmentLabel`, `exposureAmount`, `exposureUnit`, `exposureBasis` (pinned ExposureBasis), `route`, `exposureDurationIso`, `assayDescription` (free text until D4 seam decides a method link), `hedValue/hedUnitCode/hedMethod` (keep; CQ-MX-04 dose transfer).
- **Condition**: `conditionKind`, `mondoId`, `icd10Code`, `icd11Code`, `orphaCode`, `omimId`, `isRare`.
- **Predicate-only values (with the question that would promote each)**: `inhibits`, `activates`, `binds` (Q-D2-08), `increases_level_of`, `decreases_level_of`, `no_change_in` (CQ-MX-03), `increases_activity_of`, `decreases_activity_of`, `is_precursor_of` (NR → NAD+; D1 seam), `mediates` (Q-D2-10), `counteracts_adaptation` (Q-D2-09), `extends_lifespan`, `does_not_extend_lifespan` (Q-D2-07), `has_mechanism` (Condition → Mechanism; Q-D2-14), `increases_risk_of` (Q-D2-15), `affects_organ`.
- **Assertion-level fields D2 depends on from K**: basis kind, effect direction/polarity, statistical significance flag (DrugAge `NS`/`S`; papers' p values), effect magnitude + unit (optional), valid time (mostly null for mechanism facts; recorded time only).

## 6. Bitemporal decision (input to 09)

None of D2's typed edges needs a valid-time episode: reference membership is versioned by authority release (property), derived projections are regenerated (recorded time + method version), evidence-context edges are structural parts of one occurrence. Mechanism *claims* live on kernel Assertions, which already carry valid/recorded time. So D2 proposes **recorded-only on every edge**; the only time-sensitive thing is the authority release on PARTICIPATES_IN/PART_OF.

## 7. The compound → mechanism → biomarker → test query pattern (D2 × D4; packet direction)

Worked on FC-1 / FC-7 / FC-8. Draft (rebase on A1's subject/object pattern; D4 names are placeholders until the D4 packet publishes):

```cypher
// 1. compound -> mechanism (derived projection, cheap), keep only measured human steps
MATCH (c:Compound {uid: $compoundUid})-[am:AFFECTS_MECHANISM]->(m:Mechanism)
WHERE am.methodVersion = $method AND am.humanMeasured = true
// 2. mechanism -> biomarker (D4 owns REFLECTS_MECHANISM, declared on Biomarker)
MATCH (b:Biomarker)-[:REFLECTS_MECHANISM]->(m)
// 3. biomarker -> test / method (D4 internal; placeholder names)
OPTIONAL MATCH (t:LabTest)-[:MEASURES]->(b)
// 4. trace: the assertions behind hop 1, their contexts and locators
MATCH (a:Assertion)-[:OBSERVED_IN_CONTEXT]->(ctx:MechanismEvidenceContext)
WHERE a.uid IN am.inputAssertionUids     // or via the kernel subject/object pattern
MATCH (a)-[:CITES_LOCATOR]->(loc:SourceLocator)-[:IN_SNAPSHOT]->(snap:SourceSnapshot)  // K names TBD
RETURN m.name, ctx.organism, ctx.compartmentLabel, a.predicate, a.basisKind, a.polarity,
       b.name, t.name, loc.exact, snap.contentHash
```

Expected answers from the fixtures: NR → "NAD+ metabolism" (Reactome R-HSA-196807) → muscle NAAD (measured, up) / blood NAD+ (measured, up) → LC-MS/MS targeted metabolomics (research) or consumer intracellular NAD test (FC-8); D+Q → "cellular senescence" (GO:0090398) → p16INK4A+ cells, SA-β-gal, plasma IL-6 → IHC/staining on biopsy, multiplex assay (FC-7). The disconfirming branch Q-D2-04 is the same pattern with a second mechanism (sirtuin deacylation) that the biomarker did **not** move (FC-1 quote 4).

Compartment mismatch check (Q-D2-04): `WHERE ctx.compartmentOntologyId <> b.specimenOntologyId` — needs D4 to carry the specimen as an ontology-id property too (ask D4).

## 8. Pinned W03 types and relationships: merge / defer table (for 06 `mergedInto` / `deferred`)

| pinned type | disposition |
| --- | --- |
| Mechanism | keep |
| Pathway | mergedInto Mechanism (kind PATHWAY) — or keep if the model stage finds a question that distinguishes them |
| MolecularEntity | keep |
| MechanismEvidenceContext | keep |
| Condition | keep (absorbs RiskFactor) |
| RiskFactor | mergedInto Condition (`conditionKind: RISK_STATE`); behavioural factors → D5 |
| Species | deferred → `ModelOrganism` enum + `ncbiTaxonId` |
| AnatomicalContext | deferred → `CompartmentKind` enum + `compartmentOntologyId` |
| Organ | deferred (same; `CompartmentKind.ORGAN`) |
| Outcome | deferred → D5 Target / D3 OutcomeDefinition / D4 Biomarker-Metric |

Pinned W03 relationships (28): keep PART_OF (new name for INVOLVES_PATHWAY + hierarchy), PARTICIPATES_IN (absorbs CONTRIBUTES_TO), OBSERVED_IN_CONTEXT, EXPOSED_TO (1 field), IN_STUDY_ARM, AFFECTS_MECHANISM (absorbs MODULATES), optional INFLUENCES (absorbs INFLUENCES_OUTCOME, ASSOCIATED_WITH_CONDITION). HAS_IDENTIFIER → kernel pattern. Cut to enums: IN_SPECIES, MEASURED_IN, ACTS_IN, APPLIES_TO_SPECIES, MEASURED_IN_MATRIX, STUDIED_IN. Predicate-only: HAS_MECHANISM, INCREASES_RISK_FOR, MEDIATES_RISK_THROUGH, AFFECTS_ORGAN. Other owners: ENCODES, REFLECTS_MECHANISM, INDICATES, OPERATIONALIZED_BY (D4), INVESTIGATES (D3), TARGETS_CONDITION (D5), RELATES_TO_CONDITION (D5 safety).

## 9. Seams and contested ownership

| seam | other domain | direction | note |
| --- | --- | --- | --- |
| EXPOSED_TO → compound/material | D1 (A2) | D2 → D1 | Need D1's single compound type (or ≤ 6 interface). **Contest:** endogenous metabolites (NAD+, NAAD, NMN, MeNAM) are measured as biomarkers and named as mechanism nodes in marketing. Proposal: they are D1 compounds (ChEBI identity); D2 Mechanism "NAD+ metabolism" is the process; D4 Biomarker "muscle NAAD" references the D1 compound. Raise in 11-open-questions. |
| AFFECTS_MECHANISM from compound | D1 | D1 type → D2 | Derived edge declared in D2 on a D1 type? Contract: one owning module per node type; a derived edge field lives on the declaring type. Decide with A2 whether D2 declares it as an incoming `@relationship(direction: IN)` field on Mechanism only (preferred: no field added to D1's hub). |
| IN_STUDY_ARM, human join | D3 (A4) | D2 → D3 | Contexts from trials point at the arm; Q-D2-06 joins StudyResult. |
| REFLECTS_MECHANISM, specimen compartment, biomarker ↔ MolecularEntity | D4 (same worktree) | D4 → D2 | D4 declares; D2 consumes. Ask D4 to carry `specimenOntologyId` for compartment comparison. |
| INFLUENCES → Target, adverse effects, interactions | D5 (A5) | D2 → D5 | Q-D2-09/-10/-15; uses `vocab-targets.yaml` when published. Metformin-blunts-exercise (FC-3) is an interaction-by-mechanism: D5 owns the interaction record, D2 supplies the mechanism step. |
| frontier tagging | D13 (A7) | D13 → D2 | "Senolytics in humans", "NAD+ restoration", "partial reprogramming" frontiers attach to Mechanism; Q-D2-27. |
| company thesis mechanism | D7 (A6) / D13 | D7 → D2 | Q-D2-17: Organization → mechanism thesis probably predicate-only (`develops_therapy_targeting`) unless D7/D13 traverse it. |
| claims about mechanisms in media/marketing | D9 (A8), K | D9 → D2 | ClaimOccurrence objects are Mechanisms/MolecularEntities via the kernel pattern; Mechanism must be a member of whatever subject/object interface A1 chooses (≤ 30 types). |
| COI on mechanism sources | D7 | D7 → K | Q-D2-21 (ChromaDex disclosure in FC-1, AgelessRx authors in PEARL). |

## 10. Open questions for 11-open-questions.md

1. Does `basisKind` (measured / inferred / cited / hypothesized) live on the kernel Assertion or on MechanismEvidenceContext? Evidence that decides: whether D3/D4/D5 assertions need it too (likely yes) → kernel (owner: A1).
2. Pathway as a separate node vs `Mechanism{kind: PATHWAY}`. Decides: a question that must distinguish curated pathway records from BellLabs mechanism concepts in a traversal (owner: D2 model stage).
3. Species/compartment as enums: confirm no D3/D4 question traverses them (owner: D2 with D3, D4).
4. Endogenous metabolites ownership (D1 vs D2 vs D4) — see seams (owner: owner/D1).
5. KEGG licence: may BellLabs cite KEGG records as reference sources at all? (owner: owner). Until decided, use Reactome/GO/WikiPathways (CC0/CC BY) only.
6. Who declares OBSERVED_IN_CONTEXT — K (as an Assertion qualifier edge) or D2? (owner: A1).
7. Should a curated hallmark mapping (hallmark → GO/Reactome ids) be a BellLabs-authored reference set (an Activity with a version) — and is it a published artifact? (owner: owner/D10).
8. `MechanismChain` stays deferred: an ordered, source-asserted chain (e.g. Elysium's NR → NAD+ → sirtuins → healthy DNA) can be represented as a ClaimOccurrence plus per-step Assertions; revisit only if a question needs chain identity (OPEN-QUESTIONS item 7).
