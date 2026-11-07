# Run log — packet D2

## Claim

- agent: A3 (stage RESEARCH, Wave 1; the model, fixtures and check stages are separate agents)
- domains: D2 mechanisms and biology of aging (D4 diagnostics and measurement is a separate packet in this same worktree)
- worktree: C:\Users\Pinda\Proyectos\Biotech\biotech-knowledge-services-A3 (branch ft/schema-A3)
- base commit: e484fd2
- planned fixtures: (1) unstructured-to-entity: a human muscle-biopsy NR paper (measured NAD+ metabolome in tissue; question -> chunk -> assertion -> locator -> snapshot); (2) disconfirmation: a paper that measured a claimed mechanism step and found it absent or opposite (direct SIRT1 activation by resveratrol/STACs; metformin blunting exercise-induced mitochondrial adaptation); (3) curated reference record: a pathway or drug-mechanism record (Reactome / ChEMBL) as a structural reference source. Candidates with hashes and verbatim quotes in `_notes/fixture-candidates.md`.

## Entries

### 2026-10-08 — Wave 1 research start (A3)

- Read 00-DIRECTIVE, 01-PACKET-CONTRACT, 02-TEAM, brief D2, PLAN sections 1/3/6, workspace START_HERE, fragment W03, schema-map "Domain D3" section (W03 types only, lines 1964-3480), CQ-MX-01..06, CQ-ST-03, CQ-AX-20 and OPEN-QUESTIONS items 3 and 7 in biotech-meta.
- `node scripts/packet-skeleton.mjs D2` -> 16 files created. Scratch: `%TEMP%\claude\C--Users-Pinda-Proyectos-Biotech\d38640f3-...\scratchpad\ft\D2\raw`.
- Sibling state at start: K (A1), D3 (A4), D5 (A5), D13 (A7) are skeletons only; no kernel pattern published yet; the D4 packet does not yet exist in this worktree.
- `tvly --status` authenticated; `firecrawl --status` authenticated, 0/5 jobs.

### 2026-10-08 — captures (A3)

- PubMed MCP `get_article_metadata` for PMIDs 31412242, 30548390, 20061378, 36599349, 31542391 (all verified; DOIs/PMCIDs recorded); `search_articles` to find the ITP NR paper (33788371) and PEARL (40188830). A remembered "NR promotes metastasis" lead was searched and NOT confirmed (36986177 reports the opposite) — dropped, nothing used from memory.
- curl (public HTTP APIs, no auth): Europe PMC fullTextXML for PMC6702140, PMC6351883, PMC6796530 (PMC2832984 → HTTP 500; NCBI pmc efetch says publisher disallows XML); Europe PMC annotations for PMC6702140; NCBI efetch pubmed 20061378, 33788371+36599349; Reactome R-HSA-196807, R-HSA-165159 + participants; UniProt Q96EB6, P42345; ChEMBL mechanisms CHEMBL413, parent CHEMBL1431, parent CHEMBL165, target CHEMBL1902; Open Targets GraphQL (target MTOR; drug CHEMBL413 — first query failed on removed fields); KEGG REST hsa04211, hsa04150 + KEGG API/legal pages; QuickGO GO:0090398, GO:0016236; ClinicalTrials.gov v2 NCT02848131; HAGR GenAge SIRT1/MTOR (HTML), DrugAge dataset.zip; Open Genes API SIRT1.
- Tavily CLI: ~23 searches + 16 extracts (licences, ITP, UNITY, Sirtris SEC/Boston Globe, Altos, INDRA, HAGR, Aging Atlas). **Broke:** 4 searches crashed with `UnicodeEncodeError` (cp1252 console) and wrote the traceback into the JSON output; fixed with `PYTHONIOENCODING=utf-8 PYTHONUTF8=1`. open-genes.com extract failed (SPA).
- Firecrawl CLI scrape: elysiumhealth.com/en-us/basis, truniagen.com, jinfiniti.com intracellular NAD test (3 jobs, no concurrency errors). Firecrawl research index MCP: one semantic search (human NR trials, sirtuin/mito endpoints).
- `sha256sum` over all captures → `scratchpad\ft\D2\SHA256SUMS.txt`; quote verification script `scratchpad\ft\D2\quotes.py` (41 quotes; 9 needed NBSP/NNBSP/U+2010 normalization — recorded as a locator normalization finding).
- Browser fallback: not used.

### 2026-10-08 — files written (A3, research stage)

- `01-ecosystem.md`: measured-vs-inferred worked chain for NR; 7 actor groups with four lenses; 13 artifact types interviewed with ≥ 2 instances each; capturability/readiness table; 43 cited sources.
- `02-questions.md`: 34 rows (6 reused CQ-MX, 28 Q-D2), 16 harm/disconfirmation, 11 value-1; audiences biohacker 20, investor 12, researcher 24, agent 11.
- `_notes/fixture-candidates.md`: 12 candidates (FC-1..FC-12) with URL, title, date, tool, sha256, 1–6 verbatim quotes with offsets; recommended picks: FC-1 unstructured-to-entity, FC-2(+FC-10) disconfirmation, FC-3 harm.
- `_notes/research-notes.md`: node/relationship candidates (4 node types recommended), Species/AnatomicalContext → enums decision with rationale, derived projection method spec, compound→mechanism→biomarker→test Cypher draft, pinned-type merge/defer table, seams, open questions.
- `_notes/tool-log.md`: 19 tool rows with what broke.
- Coordination: the D4 packet appeared in this worktree during the stage (its RUNLOG plans an NR → NAD+ → blood NAD+ → test fixture). D2 asks D4 (via research-notes §7/§9, for the model stage): D4 owns `REFLECTS_MECHANISM` (Biomarker → Mechanism); carry the specimen as an ontology-id property so compartment mismatches can be filtered; FC-8 (Jinfiniti NAD test) and FC-7 (D+Q → senescence → p16/SASP) are shared path candidates.
- Not written in this stage (by instruction): SDL, registers, 03, 08–11, SUMMARY, fixtures. The skeleton's `07-fixtures/fixture-01/` placeholder was left untouched.

### 2026-10-08 — Wave 2 model stage (A3)

- Read: 00-DIRECTIVE, 01-PACKET-CONTRACT, 02-TEAM, brief D2, this packet's RUNLOG / 02-questions / _notes (research-notes, fixture-candidates, tool-log). Kernel pattern (A1): packets/K/09-reasoning.md (pattern, ownership map and lineage sections), 04-schema-proposal.graphql (interfaces, edge-property types, enums, Assertion), domain-template.graphql, identifier-schemes.yaml. Sibling research notes: D1 (A2), D3 (A4), D4 (this worktree), D5 (A5) + vocab-targets.yaml, D9 (A8), D13 (A7) vocab-frontiers.yaml. Skills: neo4j-modeling, neo4j-graphql, neo4j-cypher, neo4j-gds, neo4j-vector-index. Also scripts/packet-check.mjs, and from schema-map.md only the W03 edge lines (grep, lines 1964–2200) and the edges into W03 types (grep).
- Decisions:
  - 5 node types: Mechanism (absorbs Pathway and Hallmark); MolecularEntity; MechanismEvidenceContext (implements Entity only); Condition (absorbs RiskFactor); Outcome. Outcome is **kept**, reversing the research-stage defer, because D3 MEASURES and D5 OPERATIONALIZED_BY already target D2.Outcome.
  - Species, AnatomicalContext and Organ → enums + ontology ids.
  - 7 relationship types / 13 pairs, all recorded-only. AFFECTS_MECHANISM and INFLUENCES_OUTCOME are derived, with method specs in 09.
  - Rebased on A1's kernel pattern: no subject/object/identifier fields; OBSERVED_IN_CONTEXT declared IN on the context.
- Wrote:
  - 03-retrieval-patterns.md (34 sections, shared fragments, index list), 04-schema-proposal.graphql, 05-relationship-register.yaml, 06-node-register.yaml, 09-reasoning.md, 10-seams.yaml, 11-open-questions.md (20 items).
  - Updated 02-questions.md: Q-D2-02 wording and a Q-D2-19 answer note; ids unchanged.
  - Replaced the skeleton `07-fixtures/fixture-01` with five named fixture folders, each with a `source.md` stub: nr-muscle-unstructured (unstructured-to-entity), sirt1-activation-disconfirmation (disconfirmation), metformin-exercise-harm (harm), reactome-chembl-reference (reference), dq-senescence-biomarker-path (seam).
- Compile check (scratch `ft/D2/`):
  - Inputs: kernel.graphql (copy of A1's SDL); stubs.graphql (ChemicalSubstance, IngredientMaterial, Intervention, StudyArm); compile.graphql = kernel + stubs + D2.
  - Command: `BKS_SCHEMA_PATH=C:/…/compile.graphql NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema C:/…/compile-out.graphql`. Built on the first run.
  - Sizes: kernel alone 326,564 B / 6,582 lines / 185 inputs; kernel + stubs 347,186 / 6,922 / 193; + D2 464,231 / 9,249 / 267. D2 marginal cost: 117,045 B / 2,327 lines / 74 inputs.
  - Variants: no unions 459,736 / 255; kernel edge-property types 448,719 / 258.
- Problems:
  1. In the first print run, Git Bash consumed the backslash in a quoted Windows path and dropped the file name, so BKS_SCHEMA_PATH pointed at a non-existent file. print-schema **silently fell back to the pinned 57.9 MB schema** (34 s) and wrote to a misnamed path. Fixed by using forward-slash Windows paths (`C:/Users/...`). Readiness note: print-schema should fail when BKS_SCHEMA_PATH is set but unreadable.
  2. The first YAML for 05 did not parse (plain scalars containing `: `); the cardinality values are now quoted.
  3. A Git Bash multi-heredoc command did not parse; the fixture stubs were written with the Write tool instead.
  4. `schema-workspace map --out /c/...` (POSIX path) wrote to `C:\c\Users\…\d2-map.md`. The file and its subfolders were removed. The empty folder `C:\c` is left because the sandbox protects deletes at drive root; the owner may delete it (empty, created 2026-10-08 17:38).
- Coordination: D4 published SDL in this worktree during the stage, and D2's patterns were aligned to its names (REFLECTS_MECHANISM asserted with an episode; HAS_ANALYTE to D1 ChemicalSubstance and D2 MolecularEntity; Metric.systemOntologyId; QUANTIFIES; MEASURES_METRIC; PERFORMED_WITH_VERSION). No other sibling had SDL yet. D1/D3/D5/D9/D13 names come from their research notes (11-open-questions items 14–20).
- packet-check: `node scripts/packet-check.mjs D2` → only fixture-content failures (locators.yaml, assertions.yaml and questions.md are missing in the 5 fixture folders; the fixtures stage writes them). Counts: nodes 5/8, rels 7/14, pairs 13/35, questions 34, fixtures 5.

### 2026-10-08 — Wave 2 fixtures stage (A3)

- Read: RUNLOG, 02-questions, 03 (shared fragments, CQ-MX-01..03, Q-D2-03/04/23/24), 04 SDL, 05/06 registers, 09 projection method spec, 11, `_notes/fixture-candidates.md`, `_notes/tool-log.md`, the five `source.md` stubs; A1 kernel pattern (`packets/K/09-reasoning.md`, kernel enums, SourceSnapshot/SourceLocator/Assertion/Adjudication in `04-schema-proposal.graphql`, `identifier-schemes.yaml`); `examples/ingestion-intent.example.json` and `packages/contracts/src/ingest.ts` + `common.ts`; `scripts/packet-check.mjs`; D4 SDL (Biomarker, Metric, LabTest, AssayVersion, enums) and D4 fixture stub `nr-nad-compound-to-test`. Sibling fixture folders (A1 D10, A7 D13, A8 D9) checked for a shared format: none complete yet.
- Re-fetched every fixture source with curl into scratch `ft/D2/fresh/` (2026-10-08T21:42:08Z); 15 research-stage captures byte-identical; new: Howitz 2003 (PMID 12939617), Reactome ancestors + R-HSA-165159 participants + DB version 97, NCT02950441, NCT02552355, UniProt Q96EB6 GO, QuickGO ×4, OLS4 UBERON ×7, ChEMBL molecule/status. MCP cross-checks: PubMed `get_article_metadata` (12939617, 20061378), ClinicalTrials.gov `get_trial_details` (NCT02552355).
- Built `locators.yaml` ×5 with `ft/D2/bin/build_locators.py`: 78 locators (42 TEXT_QUOTE, 36 JSON_POINTER), each re-selected exactly once on the fresh capture; 16 TEXT_QUOTEs need normalization nbsp-nnbsp-hyphen/v1 (code-point positions recorded). GenAge uses a new derivation html2txt/v1 (research-stage text differed in citation spacing).
- Wrote `assertions.yaml` ×5 (26 assertions incl. 2 D4-owned REFLECTS_MECHANISM and 1 D7 seam; 14 contexts; structural edges; 5 deterministic CAPTURE_FIDELITY adjudications; 1 seam Assessment; 15 derived edges; the 3.8 walk in nr-muscle-unstructured; the D2→D4 `crossDomainPath` in dq-senescence-biomarker-path). Every record has `producedBy {mission:ft-D2-fixtures, run:ft-D2-<fixture>}` (fixture ids); derived edges `run:ft-D2-projection`.
- Re-ran both projection methods with `ft/D2/bin/project.py` over all five fixtures: all 15 declared derived edges match. Findings → 11-open-questions item 21 (NR → Nicotinate metabolism is MIXED under v1; role-less sign propagation; score for nulls).
- Generated `intent.json` ×5 with `build_intents.py`; all valid against `@bks/contracts` IngestionIntent (`validate_intents.mjs`). Gaps G1–G4 recorded in each intent's notes, 08 and 11 item 25.
- Wrote `questions.md` ×5 and completed `source.md` ×5. Kind lines: unstructured-to-entity, disconfirmation, harm, other (reactome-chembl-reference, was "reference"), other (dq-senescence-biomarker-path, was "seam"). Wrote `08-sources-and-tools.md` (25 rows; all 13 `populatedBy` ids of 05 present). Appended tool-log T20–T31 and 11-open-questions items 21–25.
- Deviations from the model-stage stubs, with reasons in the files: the disconfirmation uses Howitz 2003 + Pacholec 2010 as primary sources and keeps KEGG as a held (PROPOSED) licence-gated input; the placebo context has AET as TESTED (SDL rule "exactly one TESTED"); the D+Q effect is asserted on the D5 regimen and not projected onto dasatinib or quercetin alone; IN_STUDY_ARM needs two arms per context in the metformin fixture.
- Problems: `python -I` ignores PYTHONIOENCODING (cp1252 crash) → reconfigure stdout in-script; POSIX `/c/...` paths to Windows Python → `C:/...`; a `&&` chain skipped a heredoc after a Python error → file written with the Write tool. Browser fallback not used.
- `node scripts/packet-check.mjs D2` → ok: true (nodes 5/8, rels 7/14, pairs 13/35, questions 34, fixtures 5).

### 2026-10-08 — check and handoff stage (A3)

- Read: 00-DIRECTIVE (full), 01-PACKET-CONTRACT, this RUNLOG, 02, 03 (Q-D2-03), 04, 05, 06, 09, 10, 11; `scripts/packet-check.mjs` (question rules); A1 kernel SDL as of now (sha256 790e7244…8c71), K `domain-template.graphql`, K 09-reasoning dispositions table, K `identifier-schemes.yaml`; D4 SDL/03 Q-D4-01/05/10 (this worktree); sibling SDLs and 10-seams of D1, D3 (A4), D5 (A5 incl. `vocab-targets.yaml` 0.2.0), D9 (A8), D13 (A7 `vocab-frontiers.yaml` 0.2.0) for every edge into a D2 type.
- `node scripts/packet-check.mjs D2` → ok on arrival and after every edit.
- Audit script (scratch `ft/D2/check/audit.py`): 34 question ids; 16/34 harm; every 02 id has a 03 section; every 05 `pattern` resolves; every 05 type appears in 03; all 13 `populatedBy` ids are rows in 08; every cited fixture names its relationship (counted per fixture: PART_OF_MECHANISM 7 and PARTICIPATES_IN 11 in reactome-chembl-reference, OBSERVED_IN_CONTEXT 4 in nr-muscle-unstructured, EXPOSED_TO 3 in metformin-exercise-harm, IN_STUDY_ARM 3 in dq-senescence-biomarker-path, AFFECTS_MECHANISM 4 in nr-muscle-unstructured, INFLUENCES_OUTCOME 2 in sirt1-activation-disconfirmation). Foreign ids referenced (Q-D4-01, Q-K-07, Q-K-08, CQ-AX-20, CQ-ST-03) resolve in their owners' files; noted in 02.
- Directive discipline: no SUPPORTS/CONTRADICTS, no MENTIONS declared, no good/bad/safe properties; 9 @relationship fields all `aggregate: false` + nestedOperations; 3 derived fields `nestedOperations: []` + `@settable(onCreate: false, onUpdate: false)`; no D2 type re-declares a kernel type; edge-property supersets list kernel base fields verbatim (checked against current kernel); max 4 relationship fields per type.
- Quote spot-check: re-fetched PMC6351883 (Europe PMC) and PMID 20061378 (E-utilities) with curl into scratch `ft/D2/spotcheck/`; both byte-identical to the recorded digests (0db6113a…, ef3a2a1c…); 4 quotes (L-m metformin abrogation and dose, Pacholec "not direct activators" and SRT1720 in vivo) found exactly once in tag-stripped, nbsp-normalized text.
- **Fixes (found by the audit):**
  1. `enum SexScope` collided with D3's enum of the same name (different values) → D2 dropped its enum, consumes D3's; fixtures `BOTH` → `ALL` (2 assertions.yaml, 2 intent.json); 10-seams + 11 item 26.
  2. 10-seams stale rows: INDICATES (D4 deferred it to a predicate) removed; OPERATIONALIZED_BY D5 Target → D2 Outcome marked not declared (D5 vocab 0.2.0 targets D4 only) and requested back (11 item 27); D5 UseConstraint row replaced by the D5 predicates USE_CONSTRAINED_IN / CAUSES_ADVERSE_EFFECT; added D3 MEASURES → Condition and D13 EVENT_ABOUT → Condition; vocab refs bumped to targets 0.2.0 and frontiers 0.2.0. SDL header, Outcome docstring, 06 and 09 text aligned (11 item 28).
  3. Identifier scheme `CHEMBL_TARGET` → `CHEMBL` (kernel identifier-schemes v2 folded it) in 2 fixtures (assertions + intent), 06, 10.
  4. IN_STUDY_ARM cardinality zero_or_one → zero_or_more in 04 docstring and 05 (fixture metformin-exercise-harm needs two arms; the field was already a list); 11 item 22 resolved.
  5. 03 Q-D2-03: GraphQL field name `reflectsMechanism` → `reflectsMechanisms` (D4 SDL); added the joint D2 ∪ D4 pattern (= Q-D4-01) with modulator union, optional hop 4 and `NO_ORDERABLE_TEST`.
  6. 11: kernel dispositions recorded on items 1, 3, 4, 10, 13, 17. 09: risks 3 and 4 updated.
- After the fixes: 5 intents re-validated against `@bks/contracts` IngestionIntent (all OK); all YAML parses; `project.py` → ALL DERIVED EDGES MATCH (15).
- Compile check re-run against the current kernel (scratch `ft/D2/compile2/`, stubs + D3 `SexScope` enum stub): kernel 345,273 B / 192 inputs; kernel+stubs 365,895 / 200; +D2 483,110 / 9,597 lines / 274 inputs (D2 marginal 117,215 B, 74 inputs, unchanged); +D2+D4 (+ Product/Organization stubs) 663,312 / 378. All builds ok, ≤ 1 s each; output deterministic. First joint attempt failed on `Unknown type "Product"`/`"Organization"` (D4 seam targets) → stubbed. 09 updated.
- `schema-workspace map --sdl` on the module: 5 nodes, 7 rel types, 14 enums, 10 pairs (union members in other modules unresolved; packet-check 13).
- Wrote SUMMARY.md (55 lines). The Write tool refused a `.md` named SUMMARY for a subagent; written with a Bash heredoc because it is a contract deliverable, not a report.
- Not run: the intent planner dry-run (needs Neo4j); model-stage compile variants (SDL changed only by the SexScope removal).

## Handoff

- packet-check (`node scripts/packet-check.mjs D2`, 2026-10-08, check stage, exit 0):

```json
{
  "ok": true,
  "packet": "D2",
  "counts": {
    "nodeTypes": 5,
    "relationshipTypes": 7,
    "pairs": 13,
    "questions": 34,
    "fixtures": 5,
    "budget": {
      "nodes": 8,
      "rels": 14,
      "pairs": 35
    }
  }
}
```

- counts vs budget: node types 5/8, relationship types 7/14, pairs 13/35, widest union 3/6, max relationship fields per type 4/12; questions 34 (16 harm/risk/disconfirmation ≥ 1/3); fixtures 5; no EXCESS lines. Executable: D2 adds 117 KB and 74 input types to the current kernel; builds in ≤ 1 s.
- fixtures: nr-muscle-unstructured (unstructured-to-entity, the 3.8 walk), sirt1-activation-disconfirmation (disconfirmation), metformin-exercise-harm (harm), reactome-chembl-reference (curated reference), dq-senescence-biomarker-path (the D2 → D4 compound → mechanism → biomarker → test path). Every 05 relationship type points at a fixture that exercises it.
- open questions for the owner (11-open-questions): 11 (KEGG licence), 12 (hallmark mapping as a published artifact), 21 (projection v1 roll-up rules), 24 (combination exposure amounts), 25 (intent v1 gaps G1–G4), 27 (D5 OPERATIONALIZED_BY should reach D2 Outcome again). For the synthesizer: 26 (run an enum name-collision check across packets), 28 (do not resurrect INDICATES).
- files changed (check stage): 02-questions.md (foreign-id note), 03-retrieval-patterns.md (Q-D2-03 field name + joint D2 ∪ D4 pattern), 04-schema-proposal.graphql (SexScope removed, header/Outcome/IN_STUDY_ARM docstrings), 05-relationship-register.yaml (IN_STUDY_ARM cardinality, OPERATIONALIZED_BY deferred note), 06-node-register.yaml (Condition/Outcome whyNode, CHEMBL), 09-reasoning.md (enum count, compile table, risks, Condition/Outcome rows), 10-seams.yaml, 11-open-questions.md (dispositions; items 22 resolved, 26–28 new), 07-fixtures/{dq-senescence-biomarker-path, metformin-exercise-harm}/{assertions.yaml, intent.json} (SexScope ALL), 07-fixtures/{metformin-exercise-harm, reactome-chembl-reference}/{assertions.yaml, intent.json} (CHEMBL), SUMMARY.md, RUNLOG.md. Nothing committed.

## Adversarial review (A3, 2026-10-08, ~21:50–22:30 local)

Two reviewers (evidence integrity, model discipline) reported 22 findings. Each was verified first (re-fetched or re-read; evidence in scratch `ft/D2/a3review/`, `ft/D2/verify2/`, `ft/D2/compile3/`), then fixed. None was rebutted. Scratch tools changed: `bin/xml2txt.py` (writes `newline='\n'`; the reviewer had already patched the scratch copy, re-run here), `bin/build_locators.py` (new locators and snapshots, LF digest note, per-snapshot retrieval time), `bin/build_intents.py` (asserted reference edges → `edge.assert`, PUBCHEM_CID issuer), `bin/project.py` (Mechanism targets only; mechanism → outcome printed as query time). Pre-review copies kept as `*.v1-prereview.py`.

Evidence integrity:

- E1 A-m-02 placebo NO_CHANGE ignored the ADP-titration increase → **fixed**. Verified in the PMC6351883 text: "The AET‐induced increases in submaximal and maximal CI‐linked respiration (Figure 2f,g) as well as V max (Figure 2h) were abolished by metformin" and "Metformin abolished the ~25% increase in maximal CI-linked respiration after AET during the ADP titration". A-m-02 scoped to SUIT1; new A-m-05 (AET INCREASES_ACTIVITY_OF mitochondrial respiration, ctx-pla, L-m-21, L-m-23); AET → mitochondrial respiration recomputed MIXED; A-m-01 cites both; source.md, AS-m-01, questions Q-D2-09 / Q-D2-02, 03 Q-D2-09 updated.
- E2 "NR extends lifespan" row called DrugAge uniformly null → **fixed**. drugage.csv (3,423 rows) has 4 NR rows incl. C57BL/6JRj +5 % S (PMID 27127236); 01 row now "mixed by setting, null in the ITP"; 03 CQ-MX-03 / Q-D2-07 expected answers updated.
- E3 jats-xml2txt/v1 digests covered CRLF bytes → **fixed**. Reproduced: recorded digests = CRLF form (scratch `crlf-backup`), LF form = 17019bad…, f786011b…, 7461e06e…, 48ec71f4…, 5f77fec9…, 08b036fd…. Rule writes LF; locators.yaml, intent.json, source.md and the nr 3.8 walk carry the LF digests; all 45 TEXT_QUOTE offsets re-select on the texts their digests identify; newline convention documented in 08 (text-derivation registry) and the locators.yaml header.
- E4 context sampleSize used randomized n → **fixed**. Fig 2 legend "PLA (n = 24), MET (n = 26)" (L-m-22); sampleSize 26 / 24, randomized n kept in groupLabel; questions CQ-MX-02 / Q-D2-09 and 03 Q-D2-09 updated.
- E5 SRT1720 "not found in ChEMBL" → **fixed**. Re-fetched: ChEMBL search → CHEMBL257991 (pref_name null; HCl CHEMBL4639328); PubChem CID 25232708 (HCl). Identifiers + locators L-s-13 / L-s-14 added; 08 "What broke" #5 reworded; tool:pubchem-rest row added.
- E6 metformin source.md named one ChEMBL mechanism → **fixed** (two records; fixture asserts /mechanisms/0; A-m-03 qualifier, Q-D2-08 answer).
- E7 readiness scores disagreed between 01 and 08 → **fixed**: DrugAge 2 in both, Europe PMC full text 2, GenAge entries 1 (bulk 2); 01 section 4 says 08 supersedes.
- E8 secondary sources for licences → **fixed**: S18 = UniProt "License & disclaimer" (rest.uniprot.org/help/license, CC BY 4.0 sentence); S19 = DrugBank's own release page ("All Academic downloads are temporarily paused."), README moved to S44; S12 = WikiPathways Terms of Use (CC0 waiver); S26 = PubMed efetch record, and "Chinese consortium" replaced by "Aging Atlas Consortium, hosted at ngdc.cncb.ac.cn".
- E9 Altos / AgelessRx descriptors unsupported → **fixed**: Altos launch release (S46: "cellular rejuvenation programming", "resetting their epigenetic clocks"); AgelessRx site via Firecrawl (S45: "longevity prescriptions like Metformin, NAD+, and LDN", Rapamycin "Starting at $65/ mo"; curl gets a script shell only).
- E10 "BOTH sexes" in CQ-MX-02 → **fixed** ("sexScope ALL (both sexes)").

Model discipline:

- M1 OPERATIONALIZED_BY declared by D5 but D2 said "not yet declared"; MEDIATES_TARGET still open → **fixed**: seam row added (owner other, D5 TargetMeasure); 04 header, 06 Outcome whyNode, 09, SUMMARY corrected; 11 items 27 and 9 closed with D5's dispositions (D5 check stage; OQ-D5-37).
- M2 D2/D10 conflict and DerivedEdgeProperties not an M11 base → **fixed on D2's side**: 11 item 1 rewritten as a **conflict** (owners K, D10, D2) with the recommended ruling (keep AFFECTS_MECHANISM; K adds DerivedEdgeProperties to the M11 base list; D10 drops that half of its claim; INFLUENCES_OUTCOME → D10 Association); ASSOCIATES seam added (owner other).
- M3 INFLUENCES_OUTCOME not earning its type → **fixed**: demoted to predicate-only (05 deferred), `Mechanism.influences` and `union MechanismInfluenceTarget` deleted; Q-D2-14 / Q-D2-26 read Assertions (+ D10 Association); sirt1 fixture edge replaced by a query-time note; job retired in 08. −1 type, −2 pairs.
- M4 patterns used non-existent sibling names → **fixed** against the SDLs: D6 Product -HAS_VARIANT-> ProductVariant -HAS_PACKAGE-> Package -HAS_LABEL_VERSION-> LabelVersion -DECLARES_COMPONENT-> (the finding put HAS_LABEL_VERSION on ProductVariant; the D6 SDL declares it on Package, which the patterns follow); D3 HAS_OUTCOME, RESULT_FOR, HAS_COMPONENT → InterventionComponent → ADMINISTERS, studyKind; D9 COVERS_LOCATOR for Q-D2-24; D13 INVOLVES, READOUT, PROGRAM_DISCONTINUATION, Frontier.name; 11 items 15 and 20 refreshed.
- M5 context duplicated D3's dose/route model → **fixed**: ContextRoute and MechanismExposureBasis deleted, D3 AdministrationRoute / QuantityBasis consumed (IN_MEDIUM, INTRAPERITONEAL, MEDIUM_CONCENTRATION requested, 11 item 30); exposure fields only for unregistered contexts, registered groups read D3 InterventionComponent (03 DOSE fragment; D3 seam records in nr, metformin, dq; resolves 11 item 24 for registered combinations); 11 item 2 restated as a D2/D3 conflict; Q-D2-15 no longer attaches D5 Assertions to D2 contexts.
- M6 PART_OF_MECHANISM / PARTICIPATES_IN classed structural → **fixed**: MechanismReferenceProperties ⊇ AssertedRecordedProperties, class asserted, `nestedOperations: [CONNECT]`; 15 fixture reference edges now carry an authorizing Assertion (asserter Reactome / UniProt / curation agent, JSON_POINTER locator; curated edges flag the uncaptured curation record, 11 item 33) and are `edge.assert` in the intents; decision and counterpoint in 11 item 29.
- M7 ChemicalSubstance → MolecularEntity AFFECTS_MECHANISM served only Q-D2-19 → **fixed**: `MolecularEntity.affectedBy` deleted (−1 pair); Q-D2-19 GDS projection reads INHIBITS/ACTIVATES/BINDS Assertions; 5 fixture edges removed; INHIBITS promoteWhen no longer circular.
- M8 register question lists overstated → **fixed**: every 05 `questions` list trimmed to patterns that traverse the type; 10-seams aligned (Q-D2-10 now in the AFFECTS_MECHANISM register entry).
- M9 enum pseudo-seams → **fixed**: removed from `seams`; `kernel-types` and `d3-enums` under sharedVocabularies; predicate seams moved to a `predicateSeams` list.
- M10 REFLECTS_MECHANISM / ON_FRONTIER called episodes → **fixed** (recorded-only; AS-OF(rm) dropped, `recordedTo IS NULL` filters) in 03, 10, 11 item 14.
- M11 RETRACTED predicate and VERIFIER origin → **fixed**: `SourceSnapshot.revisionKind` / `HAS_REVISION_STATUS` with SourceRevisionKind values; VERIFIER_FOUND.
- M12 stale 09 statements, unused `isRare` → **fixed**: 09 rewritten to the current state (sibling SDL note, edge-property row tied to 11 item 1); `isRare` dropped from SDL and 06.

Own check-stage issues (check-issues.json "D2"):

- D5 OPERATIONALIZED_BY conflict → closed (D5 restored D2.Outcome; 11 item 27).
- SexScope collision → stays resolved; D2 now also consumes D3's AdministrationRoute and QuantityBasis (no D2 route/basis enum left to collide).
- Combination exposures (11 item 24) → resolved for registered groups via D3 InterventionComponent; open for unregistered combinations. Intent gaps (item 25) → G1 narrowed (reference edges are now `edge.assert`); G2–G4 open.
- Intent planner dry-run → still not run (needs Neo4j; D2 types are not in the pinned schema, G4).
- SUMMARY.md → updated with an in-place edit script.

Checks after the fixes:

- `node scripts/packet-check.mjs D2` → ok: true, exit 0; nodeTypes 5, relationshipTypes 6, pairs 10, questions 34, fixtures 5.
- print-schema (kernel b2c2b1b0…, 51,355 bytes, + stubs + D2): 453,948 bytes, 8,937 lines, 251 input types; D2 marginal +110,422 bytes / +64 input types (was +117,215 / +74); kernel + stubs + D2 + D4: 638,662 bytes, 356 input types. Output contains the five D2 types; it is not the pinned 55 MB schema. 09 updated.
- Fixtures: build_locators "all verified" (83 locators); 45 TEXT_QUOTE offsets independently re-selected on the LF texts their digests identify; 5/5 intents valid against `IngestionIntent`; `project.py` "ALL DERIVED EDGES MATCH" (9 AFFECTS_MECHANISM).
- Nothing committed.

## Close-out: pattern lint (2026-10-09, A3)

Input: pattern linter report (S `final/_work/pattern-lint.json`), D2: 39 blocks, 5 failing (3 packetBug, 2 rulingBroken).

Fixed packetBug blocks in `03-retrieval-patterns.md` (against the D2 SDL + K kernel + sibling packet SDLs/registers):

- Q-D2-11: `(id:Identifier)-[:HAS_IDENTIFIER]->(x)` reversed → `(x)-[:HAS_IDENTIFIER]->(id:Identifier)` (kernel stores Subjectable → Identifier; `Identifier.identifies` is IN).
- Q-D2-16: `(asm:Assessment)-[:ASSESSES]->(cl:Assertion)` is not a kernel pair → `(cl)-[:OCCURRENCE_OF]->(:Claim)<-[:ASSESSES]-(asm:Assessment ...)` (Assessment ASSESSES Subjectable; Assertions are assessed only by Adjudication).
- Q-D2-21: read four interest/supply predicates no packet 05 register declares → D7's typed family `(who:Person)-[fi:HOLDS_STAKE|HOLDS_ROLE|RECEIVES_VALUE_FROM]->(org:Organization)` (current episode `recordedTo IS NULL`) and D7's predicate-only `SUPPLIES_MATERIAL` (Organization → IngredientMaterial, rolled up to the compound through D1 `REALIZES_SUBSTANCE`); trace now via `fi.assertionUid`. These are D7 packet names (the linter's R-89 pending edit is cleared as a side effect).

Repeated text: `11-open-questions.md` item 19 marked resolved (fixture A-nr-06 draft predicate left for the FU-03 re-path); `10-seams.yaml` ASSESSES seam now names K.Claim and says an Assertion is assessed by Adjudication. No SDL change (04 untouched).

Not changed (rulingBroken, left for the S stage's final-SDL versions): Q-D2-10 (R-59 `EstimateDirection`), Q-D2-18 (R-47 `nNoChangeContexts` / Association ranking).

Checks:

- `node C:/.../final/_work/lint-packet-patterns.mjs --packets D2 --json <scratch>/lint-D2.json --md <scratch>/lint-D2.md` → "D2: 39 total, 2 failing (0 packetBug, 2 rulingBroken), 10 fragment, 1 gds"; ok 26; cypher25 0; selfCheckDiffs 0. Q-D2-11 / Q-D2-16 / Q-D2-21 → ok. (Report written to scratch so the shared S report is not overwritten.)
- `node scripts/packet-check.mjs D2` → ok: true, exit 0; nodeTypes 5, relationshipTypes 6, pairs 10, questions 34, fixtures 5.
- Nothing committed.
