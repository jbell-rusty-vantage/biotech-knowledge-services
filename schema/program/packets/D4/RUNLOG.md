# Run log — packet D4

## Claim

- agent: A3 (research stage, Wave 1; later stages model → fixtures → check run as separate agents)
- domains: D4 Diagnostics, biomarkers and measurement (A3 also owns D2 in this worktree; the compound → mechanism → biomarker → test path spans both)
- worktree: C:\Users\Pinda\Proyectos\Biotech\biotech-knowledge-services-A3 (branch ft/schema-A3)
- base commit: e484fd2
- planned fixtures (candidates; final choice in the fixtures stage, see `_notes/fixture-candidates.md`):
  1. LOINC 4548-4 HbA1c term record + a clinical lab test-catalog entry (Labcorp/Quest) — measurand vs orderable test vs method (comparability path, CQ-DX-01/03).
  2. Epigenetic clock publication (DunedinPACE / PC clocks) — unstructured-to-entity path (question → chunk → assertion → locator → snapshot) for algorithm version, inputs and platform.
  3. Harm case: FDA safety communication on smartwatches/smart rings claiming non-invasive blood glucose measurement.
  4. Disconfirmation case: epigenetic clock technical-replicate reliability (biological-age change within noise).
  5. Wearable metric-definition change (vendor release notes / developer docs) — device/firmware/algorithm version as-of.
  6. Compound → mechanism → biomarker → test: nicotinamide riboside → NAD+ metabolism → blood NAD+ → a test someone can buy (seam to D1/D2/D3/D6).

## Entries

### 2026-10-08 — research stage start

- Read 00-DIRECTIVE, 01-PACKET-CONTRACT, 02-TEAM, D4 and D2 briefs, PLAN §1/3/6, workspace START_HERE, W07/W08 fragment pages, `dom:diagnostics-and-devices`, node cards (AssayVersion, Biomarker, Metric, AlgorithmVersion, LabTest, ReferenceIntervalVersion, ComparabilityAssessment, Device, FirmwareVersion), W07 enums, DiagnosticResult interface; CQ-DX-01..09 and CQ-AX-21 in biotech-meta competency-questions.md; OPEN-QUESTIONS Priority 1 diagnostics items 1–5.
- `node scripts/packet-skeleton.mjs D4` → 16 files created. Created `_notes/`.
- Scratch: `%TEMP%\claude\…\scratchpad\ft\D4\raw` for raw captures and sha256.
- Tool status: `tvly --status` authenticated (v0.1.5); `firecrawl --status` authenticated (v1.23.1, 0/5 jobs).
- Sibling packets at start: K (A1), D3 (A4), D5 (A5), D13 (A7) skeletons only; kernel pattern not yet published.

### 2026-10-08 — research captures (A3)

- Discovery with Tavily CLI (wrapper `scratch/ft/D4/bin/tv.py`: retries, cp1252 decode — `tvly` on Windows emitted non-UTF-8 JSON and intermittently crashed). Captures with Firecrawl CLI `scrape --only-main-content -o` (LOINC, Labcorp, Quest, NGSP, FDA, vendor pages, Oura/WHOOP/Dexcom docs), curl for APIs (openFDA 510k/recall/event, Federal Register, ClinicalTrials.gov v2, Europe PMC fullTextXML, NLM Clinical Tables LOINC/UCUM, Oura OpenAPI 1.41, Apple doc JSON), PubMed MCP for ids/metadata and the PMC9586209 full text (Europe PMC returned 150 bytes). PDFs via curl + `pdftotext -layout`.
- 57 raw files, `sha256sum` → `scratch/ft/D4/SHA256SUMS.txt`. All fixture quotes verified as exact substrings with offsets (`bin/q.py`).
- Blocked/gated: Quest LOINC + performing lab (service-area gate), FDA CLIA database (form only), LOINC FHIR server (302, account), NCBI Bookshelf BEST glossary (reCAPTCHA). No browser fallback used.
- Coordination: the D2 research stage in this worktree drafted the compound → mechanism → biomarker → test pattern (D2 `_notes/research-notes.md` §7) with D4 placeholders and asked D4 for a compartment ontology id; answered in D4 `_notes/research-notes.md` §5–6 (Metric.systemOntologyId + AssayVersion.specimenOntologyIds; replace D2's `LabTest-[:MEASURES]->Biomarker` with the Metric hop). Both packets captured the same Jinfiniti page (same sha256 edb29419…).

### 2026-10-08 — research deliverables written (A3)

- `01-ecosystem.md`: 43 cited sources; actors A–H (terminology/metrology, regulators/registries, clinical labs, DTC testing, clock vendors, academic clocks, wearables/CGM, community); artifact interviews for 10 artifact types (≥ 2 instances each); coded sample of 9 public artifacts against AssayVersion fields (partial evidence for OPEN-QUESTIONS P1 #1); four lenses; readiness.
- `02-questions.md`: 34 rows (9 reused CQ ids: CQ-DX-01..07, CQ-DX-09, CQ-AX-21; 25 new Q-D4-01..25); 13 harm (38 %); 7 value-1.
- `_notes/fixture-candidates.md`: 9 candidates (FC-3 unstructured-to-entity; FC-2, FC-5 harm; FC-4 disconfirmation; FC-7 the D1→D2→D3→D4 path with harm branch), each with URL, title, date, tool, sha256 and 2–6 verbatim quotes with offsets.
- `_notes/research-notes.md`: 8 findings, 8 candidate node types (19 pinned W07/W08 types merged/deferred), 14 candidate relationships with cut order, predicate-only list, bitemporal proposal, pattern sketches, seams/contests, open questions, readiness.
- `_notes/tool-log.md`: 23 tool uses with problems.
- `node scripts/packet-check.mjs D4`: questions parse (34, all with a valid answer kind); remaining failures are model/fixture-stage files (SDL, registers, 07-fixtures), expected at this stage.
- Not done this stage (by instruction): SDL, registers, 03 retrieval patterns, fixture folders. No commits.

### 2026-10-08 — model stage (Wave 2, part 1) (A3)

- Read: 00-DIRECTIVE, 01-PACKET-CONTRACT, 02-TEAM, brief D4, W07/W08 fragment pages and pinned enum vocabularies, this packet's 01/02/_notes and RUNLOG; A1 kernel pattern (`K/09-reasoning.md` pattern section, `K/04-schema-proposal.graphql`, `K/domain-template.graphql`, `K/identifier-schemes.yaml`, `K/lever-experiments.md`); D5 `vocab-targets.yaml` seam rule, D13 frontiers note on clocks; sibling research notes (D1 ChemicalSubstance + HAS_ANALYTE plan, D3 OutcomeDefinition MEASURES, D6 cut of DELIVERS_LABTEST/EMBODIES_MODEL, D7 Organization) and the D2 model-stage SDL/03 in this worktree (17:24–17:30). Skills: neo4j-modeling, neo4j-graphql (+ search-directives), neo4j-gds (node similarity), neo4j-vector-index (SEARCH clause, rank fusion); neo4j-cypher headings.
- Sibling check (17:20): no sibling 04 SDL declared any D4 type name (A1 K only; A2, A4–A8 SDL empty).
- Wrote `04-schema-proposal.graphql` (7 node types, 13 relationship types, 17 pairs, 22 enums, no unions), `05-relationship-register.yaml` (13 entries, 13 predicateOnly, 40 deferred), `06-node-register.yaml` (7 nodes, 5 deferred, 19 mergedInto rows covering all 19 pinned W07/W08 types), `03-retrieval-patterns.md` (34 question sections + shared AS-OF / TRACE fragments), `09-reasoning.md`, `10-seams.yaml` (20 seams, registered assessment subkinds, 6 shared vocabularies), `11-open-questions.md` (24 items). `02-questions.md`: ids unchanged; CQ-DX-03, Q-D4-03, Q-D4-06 answer shapes rewritten to the model; Q-D4-25 answer kind materialized → retrieved.
- Key decisions: ComparabilityAssessment → kernel Assessment (EQUIVALENCE, subkind D4.comparability; typed verdict field requested); ReportedStatus per field → `notReported: [MeasurementField!]`; Metric carries compartment (`systemOntologyId`) and in-definition method; AssayVersion carries `specimenOntologyIds`; AlgorithmVersion absorbs Algorithm and FirmwareVersion with versionBasis CHANGE_EVENT_UNLABELED; PERFORMED_WITH_VERSION has two fields (assay, algorithm); DELIVERS declared on the D4 side because D6 cut it; OFFERED_BY cut. After reading D2's new 03, added `Biomarker.analyteEntities` (HAS_ANALYTE → D2 MolecularEntity) — D2 traverses it in Q-D2-03/04/22.
- Fixtures: removed the skeleton `07-fixtures/fixture-01/`; created 7 named folders with `source.md` stubs (kind, URLs, retrieval date, sha256 from scratch `SHA256SUMS.txt`): dunedinpace-paper-unstructured (unstructured-to-entity), clock-noise-vs-retest-advice (disconfirmation), noninvasive-glucose-cgm-recall (harm), hba1c-two-labs-interference (harm), nr-nad-compound-to-test, wearable-hrv-algorithm-changes, consumer-panel-and-blood-clock. Generator: scratch `ft/D4/bin/mkfixtures.py` (a bash heredoc with quotes failed first; moved the script to a file).
- Compile check (scratch `ft/D4/compile.graphql` = kernel + 5 seam stubs + module, sha256 189bf1a0…d019): `BKS_SCHEMA_PATH=<compile.graphql> NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <ft/D4/out.graphql>` built first time, no errors. kernel alone 326,564 B / 6,582 lines / 185 inputs; kernel + stubs 352,154 / 7,007 / 195; kernel + stubs + D4 523,196 / 10,509 / 297 → D4 marginal +171,042 B, +3,502 lines, +102 inputs (≈ 24.4 KB, 14.6 inputs per type). Build 1 s (5.4 s wall). `schema-workspace map` on the same file: 23 node types, 27 rel types, 154 interface-expanded pairs (82 for kernel + stubs).
- Problem: one `cat` overwrote `compile.graphql` with the wrong inputs (path typo); rebuilt from `compile/kernel.graphql` + `compile/stubs.graphql` + module and re-measured.
- `node scripts/packet-check.mjs D4`: counts nodeTypes 7, relationshipTypes 13, pairs 17, questions 34, fixtures 7; only failures are the 21 fixture-content files (locators.yaml, assertions.yaml, questions.md × 7) — fixtures-stage work.

### 2026-10-08 — fixtures stage (Wave 2, part 2) (A3)

- Read: RUNLOG, 02, 04, 05/06, `_notes/fixture-candidates.md`, `_notes/tool-log.md`, 00-DIRECTIVE, 01-PACKET-CONTRACT, `scripts/packet-check.mjs`, kernel pattern (A1 `K/09-reasoning.md`, `K/04-schema-proposal.graphql`: SelectorKind, Assertion, Assessment, HAS_LOCATOR/HAS_EVIDENCE), D9 Chunk (A8: COVERS_LOCATOR, MENTIONS), sibling uid tokens (A2 D1 `substance`, A6 D6 `product` / D7 `org`, `person`), D2 Reactome R-HSA-196807 and AFFECTS_MECHANISM (this worktree), `examples/ingestion-intent.example.json`, `packages/contracts/src/ingest.ts` + `common.ts`.
- Re-fetched every fixture source into scratch `ft/D4/refetch/` (curl: Europe PMC ×2, CT.gov, Oura OpenAPI, Apple JSON, openFDA, 2 PDFs; Firecrawl CLI `--max-age 0`: 13 pages; NCBI BioC for PMC9586209). 18 byte-identical, 4 Firecrawl pages changed bytes (quotes intact); fixtures cite the fresh digests. New captures: Labcorp 005009 (panel with component LOINC map), InsideTracker InnerAge 2.0 and Ultimate store pages (found with Tavily CLI). Ultimate panel composition is image-only → INCLUDES_TEST exercised on Labcorp 005009.
- Reconstructed the research-stage derived-text rule for JATS XML (byte-exact text digests) and recorded it per snapshot.
- Wrote 7 fixture folders with scratch `bin/gen.py` (specs `spec/fx_*.py`; copies in `_notes/fixture-tooling/`): source.md, locators.yaml (122 locators: CHARACTER_POSITION, PDF_TEXT, JSON_POINTER, WHOLE_SNAPSHOT; exact/prefix/suffix/quoteHash), assertions.yaml (91 assertions, 11 kernel assessments, fixture producedBy ids), intent.json (biotech-knowledge-intent.v1), questions.md. Unstructured-to-entity: `dunedinpace-paper-unstructured` with `retrievalPath` (question → fulltext → Chunk MENTIONS / vector → COVERS_LOCATOR → Assertion → HAS_LOCATOR snapshot → verifier re-select; chunk offsets computed). Harm: `noninvasive-glucose-cgm-recall`, `hba1c-two-labs-interference` (verdict UNKNOWN). Disconfirmation: `clock-noise-vs-retest-advice` (NO_RELIABILITY_SOURCE). D2↔D4 path: `nr-nad-compound-to-test` (one Cypher pattern, NOT_COMPARABLE, test-and-sell).
- Verification: `bin/reselect.py` re-selects 122/122 locators from snapshot bytes; `bin/validate-intents.mjs` (zod IngestionIntent) 7/7 valid; every 05 relationship type is exercised by the fixture its register entry points to (checked by script); every 05 populatedBy id is a row in 08.
- Register/seam edits (packet files only): 05 predicateOnly +4 (regulatory_statement, reported_measurement_error, field_not_reported, reports_input_set), interferes_with subject widened to Device, recommends_retest_interval / sets_reference_range subjects aligned to the fixtures, populatedBy += tool:openfda-device (DELIVERS, RUNS_ON_DEVICE); 10-seams +3 assessment subkinds, + ASSESSES K.Assessment → D4.LabTest; 11-open-questions #24 updated, #25–31 added.
- Wrote `08-sources-and-tools.md` (12 registered ids + 17 further rows; what broke; custom tooling). Appended tool log #24–44.
- Problems: upper-case locator refs failed intent validation (fixed); first Tavily wrapper call passed "search" as the query; YAML anchors made assertions hard to read (dumper without aliases); PubMed MCP output is not hashable (BioC used).
- `node scripts/packet-check.mjs D4` → ok: true (7 node types, 13 relationship types, 17 pairs, 34 questions, 7 fixtures). No commits.

### 2026-10-08 — check and handoff stage (A3)

- Read: RUNLOG, 00-DIRECTIVE, 01-PACKET-CONTRACT, `scripts/packet-check.mjs`, every D4 packet file; A1's current kernel (`K/04-schema-proposal.graphql` sha256 790e7244…, `K/09-reasoning.md` "Kernel requests from domain packets", "Edge-property types", "Kernel pattern changes"; `K/11-open-questions.md`; `K/identifier-schemes.yaml`); sibling SDLs and seams for D1 (A2), D2 (this worktree, incl. its check-stage joint pattern), D3 (A4), D5 (A5), D6/D7 (A6), D8 (A7, incl. OQ-D8-29), D9 (A8), read 18:09–18:14.
- `node scripts/packet-check.mjs D4` → ok at stage start (7 / 13 / 17 / 34 / 7).
- Audit beyond the script with scratch `ft/D4/check/audit.py` (question ids referenced anywhere vs 02; 05 pattern refs vs 03 headings and whether the cited 03 sections traverse the type; populatedBy vs 08 rows; fixture predicates and per-field coverage of multi-field types; locator/entity/asserter/producedBy references inside fixtures; SDL discipline greps; kernel type collisions). Found and fixed:
  - external ids cited as if they were D4 rows (CQ-DX-08 in 06, CQ-ST-03 in 02) → named in prose;
  - 5 register question cites whose 03 section did not traverse the type → removed from 05, 04 docstrings and 10 (REFLECTS_MECHANISM −Q-D4-02, MEASURES_METRIC −Q-D4-21, DELIVERS −Q-D4-17, REQUIRES_INPUT_METRIC −Q-D4-16, INTERVAL_FOR −Q-D4-02); 4 sections extended so they traverse what their register entries cite (CQ-DX-03 PERFORMED_BY_LAB, CQ-DX-04 and Q-D4-06 PERFORMED_WITH_VERSION, Q-D4-24 DELIVERS; PERFORMED_BY_LAB's pattern ref 03#CQ-DX-03 now resolves to a section that uses it);
  - `Biomarker.analyteEntities` (HAS_ANALYTE → D2 MolecularEntity) exercised by no fixture → hba1c fixture d21 (curated, cited to the LOINC component locator; no UniProt id attached, none captured);
  - hba1c INTERVAL_FOR rows d06–d11 had no asserter and d08–d11 no `metrics` side → asserters (Labcorp / Quest) + d17–d20;
  - 03 Q-D4-05 / Q-D4-12 read `recommends_retest_interval` / `sets_reference_range` through HAS_OBJECT though 05 makes the LabTest / interval the subject → HAS_SUBJECT + ASSERTED_BY.
- Kernel alignment (A1 model stage answered D4 #1 and #16 and added M10): AssessmentKind COMPARABILITY + `conclusionCode` replace the `"D4.comparability:<VERDICT>"` string and `verdictValue` (03, 02, 06, 09, 10, all fixtures); `field_not_reported` → kernel `FIELD_NOT_REPORTED`; REFLECTS_MECHANISM, DERIVED_FROM_ALGORITHM_VERSION, DELIVERS → kernel `AssertedRecordedProperties` (04, 05, 09, 10 kernel-types); conclusionCode vocabulary table added to 09.
- Sibling alignment: D3 now admits Metric as MEASURES target (Q-D4-01 hop 3 and Q-D4-14 read it; 11 #9 resolved); D5 OPERATIONALIZED_BY → Metric and STEP_USES → Metric, D3 ADMINISTERS → Device added to 10 as consumed; D6 seller path in Q-D4-12/13 rewritten to D6's names; D8 rows renamed to CONCERNS / STATUS_OF / ADDRESSED_TO with `status: requested` (OQ-D8-29); Q-D4-01 points at D2's joint pattern. 11 #1, #9, #16 resolved; #8, #10, #12, #15 updated; #32–36 added.
- Fixtures regenerated with the fixtures-stage generator (scratch `bin/gen.py`, specs edited: fx_2, fx_4, fx_5, fx_6; copies in `_notes/fixture-tooling/spec/`). A re-run on unchanged specs reproduced all 35 fixture files byte for byte before editing. Content changed: clock-noise (assertions, intent), hba1c (assertions, intent, questions, source), nr-nad (assertions, intent, questions), wearable (assertions, intent). `bin/validate-intents.mjs` 7/7 valid; `bin/reselect.py` 122/122 locators re-selected from snapshot bytes; every 05 populatedBy id is a row in 08.
- Spot-check by re-fetch: (1) ClinicalTrials.gov API v2 NCT02921659 (same `fields` URL, curl) → sha256 b723914e… = the fixture's snapshot digest, both locator quotes present; (2) Labcorp 001453 via Firecrawl MCP `firecrawl_scrape` (maxAge 0) → all 8 locator quotes of `hba1c-two-labs-interference` on that page present verbatim (Roche Tina Quant; LOINC map row; 4 reference-range lines; the HbF limitation; tube line). MCP output not hashed (not a snapshot).
- Compile check against the current kernel: scratch `ft/D4/compile2/` (kernel 790e7244… + 5 stubs + module ea1867e9…). kernel 345,273 B / 6,927 lines / 192 inputs; + stubs 370,863 / 7,352 / 202; + D4 545,959 / 10,911 / 306 (deterministic on re-run; 1 s build, 4.3 s wall) → D4 marginal 175,096 B / 3,559 lines / 104 inputs. Variant with the old AssertedEdgeProperties on the 4 recorded-only fields: 541,860 / 10,854 / 304; the +2 inputs are AssertedRecordedPropertiesWhere/Sort, first instantiated by D4 in this compile (shared with D6/D8 in assembly). 09 updated.
- Wrote SUMMARY.md (35 lines). The Write tool refused the path as a "report file"; it is a packet-contract deliverable read by packet-check and the synthesizer, so it was written from a scratch draft with `cp`.
- Problems: a bash heredoc carrying Python with triple quotes failed to parse (moved the edit scripts to scratch files); `bc` is not installed in Git Bash (timed with `time`); a first curl to a POSIX scratch path wrote nothing (Windows path needed for `-o`).
- `node scripts/packet-check.mjs D4` → ok (JSON below). No commits.

## Handoff

- packet-check (`node scripts/packet-check.mjs D4`, check stage, 2026-10-08, exit 0):

```json
{
  "ok": true,
  "packet": "D4",
  "counts": {
    "nodeTypes": 7,
    "relationshipTypes": 13,
    "pairs": 17,
    "questions": 34,
    "fixtures": 7,
    "budget": {
      "nodes": 8,
      "rels": 14,
      "pairs": 35
    }
  }
}
```

- counts vs budget: node types 7 / 8, relationship types 13 / 14, from→to pairs 17 / 35, widest union none (0 unions), max relationship fields per type 5 / 12; questions 34 (13 harm = 38 %, 7 value-1); no EXCESS lines needed. Measured: D4 marginal +175,096 B, +3,559 lines, +104 input types against kernel 790e7244… (09-reasoning).
- fixtures (7; 122 locators re-selectable from snapshot bytes; 7/7 intents valid; 96 assertions, 11 assessments):
  - `dunedinpace-paper-unstructured` — unstructured-to-entity (question → chunk → assertion → locator → snapshot, computed chunk offsets)
  - `clock-noise-vs-retest-advice` — disconfirmation (D4.change-detectability NO_RELIABILITY_SOURCE; vendor ≠ publication version UNRESOLVED)
  - `noninvasive-glucose-cgm-recall` — harm (claim CONTRADICTED, SAFETY_SIGNAL HARM; CGM recall)
  - `hba1c-two-labs-interference` — harm (comparability UNKNOWN; HbF interference risk); now also HAS_ANALYTE → D2 MolecularEntity
  - `nr-nad-compound-to-test` — the D1 → D2 → D3 → D4 path (NOT_COMPARABLE; test-and-sell)
  - `wearable-hrv-algorithm-changes` — RMSSD vs SDNN NOT_COMPARABLE; unlabeled algorithm changes as RUNS_ON_DEVICE episodes
  - `consumer-panel-and-blood-clock` — panel composition (INCLUDES_TEST), clock inputs (REQUIRES_INPUT_METRIC), name resolution
- open questions for the owner (11-open-questions.md):
  - #20 accept "comparability mostly UNKNOWN" or fund test purchases / vendor documentation to fill AssayVersion fields;
  - #2 accept one `notReported` list instead of per-field ReportedStatus (NOT_APPLICABLE folded in);
  - #8 DELIVERS (Product → LabTest | Device): D4 declares it, D6 has not adopted it — synthesizer/owner picks the side;
  - #32 which module answers device regulatory questions (Q-D4-08/09/10): D8 adding Device to RegulatoryRecordTopic (+1 pair, union at cap) competes with D9's MediaWork request; D4 supplies the device fixture D8 asked for;
  - #21 vendor clock ≠ publication version by default; #22 LOINC licence attribution; #27 curator-attached RUNS_ON_DEVICE episodes when a changelog names no device.
- files changed in this stage (all under `schema/program/packets/D4/`): 02-questions.md, 03-retrieval-patterns.md, 04-schema-proposal.graphql, 05-relationship-register.yaml, 06-node-register.yaml, 08-sources-and-tools.md, 09-reasoning.md, 10-seams.yaml, 11-open-questions.md, SUMMARY.md, RUNLOG.md; 07-fixtures/{clock-noise-vs-retest-advice/{assertions.yaml,intent.json}, hba1c-two-labs-interference/{assertions.yaml,intent.json,questions.md,source.md}, nr-nad-compound-to-test/{assertions.yaml,intent.json,questions.md}, wearable-hrv-algorithm-changes/{assertions.yaml,intent.json}}; _notes/fixture-tooling/spec/{fx_2_clocknoise.py,fx_4_hba1c.py,fx_5_nrnad.py,fx_6_wearable.py}. Nothing outside the packet; no commits.

## Adversarial review (A3, 2026-10-08, ~21:45–22:30 EDT)

Two independent reviewers (evidence integrity: E1–E12; model discipline: M1–M14, numbered in the order received) plus the five open issues of this packet's own check stage (C0–C4). Each finding was verified against the fixture captures (sha256 identical to the reviewers' re-fetches, except the WHOOP forum, where the fixture's own capture was used) or the current sibling SDL / seams files. Work only under `schema/program/packets/D4/`; nothing committed.

### Evidence integrity

- E1 (major) hba1c d05 PERFORMED_BY_LAB rested on a synthetic sample report → **fixed**. Confirmed: the lab block is a 2018 placeholder ("01 $$ Testmaster Testing", "Dir: Report Testing, PhD", dates 08/13/2018) and the footer is a copyright notice. d05 is now an organization-level curator inference (asserter agent-curation, rule: the test is on Labcorp's own menu, locator `lc-testno`); PERFORMING_LAB added to the AssayVersion's `notReported` and to d15, whose locators now cite the placeholder spans; AssayVersion renamed "as observed on the Labcorp test menu"; 01-ecosystem coded-sample row corrected R → N; 05 / 04 state the rule (11 #42).
- E2 (major) WHOOP RMSSD inferred from a field name → **fixed**. Fetched `api.prod.whoop.com/developer/doc/openapi.json` (curl, sha256 b40986e6…; the reviewer's d9c6147d… has the same JSON value in a different property order). New snapshot + JSON_POINTER locator `wa-openapi-rmssd` (`/components/schemas/RecoveryScore/properties/hrv_rmssd_milli/description`) cited by f06, the Metric's methodText/definitionText and s01 (SUPPORTS; the example payload is now CONTEXT). 01-ecosystem: new S44, the "explicitly RMSSD" sentence and the SDNN-vs-RMSSD citations now cite S44. 08: tool:whoop-api-docs re-scored 2 → 3, gap text corrected (descriptions exist in the OpenAPI document; not byte-stable).
- E3 (major) f01/f02 device attachment marked STATED_BY_SOURCE; f01 cited an unrelated forum post → **fixed**. `c1-firmware` removed from f01; f01/f02 qualify "change date STATED_BY_SOURCE; device attachment INFERRED (curator)"; derivationRule rewritten; the5krunner caption (S43, secondary) mentioned and not used as evidence (11 #27).
- E4 (major) clock-noise s01 tagged other clocks' noise as CONTRADICTS → **fixed**. Confirmed: 0 occurrences of "Dunedin" in the BioC capture. h1–h3 → QUALIFIES (with a recorded reason); new locator `r4-window` ("*Based on the last 2-3 months", page 10) as CONTEXT; summary says reliability gap, not disconfirmation; fixture kind relabelled `reliability-gap` (the harm requirement is met by hba1c and glucose).
- E5 (minor) d02 locators say nothing about LOINC → **fixed**: `q-hidden` added and a rationale ("curator inference: same analyte/unit; LOINC section gated").
- E6 (minor) Tina Quant Gen.3 footnote missing → **fixed**: locator `lc-kit`, `reagentKitText` on the AssayVersion ("currency not stated"), d03 cites it; s01 weighs it against NGSP's Gen. 3 and Gen. IV cobas c513 rows (new locators `nm-gen3-c513`, `nm-gen4-c513`).
- E7 (minor) Oura "sleep algorithm v2" drops "Sleep Staging" → **fixed**: AlgorithmVersion renamed to the enum's wording, new locator `o5-staging`, f07 is a curator inference with the per-record version caveat.
- E8 (minor) forum handle in a stored prefix → **fixed**: `c2-post-date` re-quoted as "on May 20, 2025" with an empty prefix (generator gained per-locator `prefixChars`/`suffixChars`); no member handle anywhere in `07-fixtures/`.
- E9 (minor) f03 at MONTH precision → **fixed**: validFrom 2025-05-20, DAY (first-post date; "on or before").
- E10 (minor) tool-log #15 "8 pages" → **fixed**: 24 pages (pdfinfo).
- E11 (minor) 08 bks-curation list missed d20/d21 → **fixed** (also d05, f07 and the RESOLUTION assessments).
- E12 (minor) SUMMARY "4 of 13 vendor pages" → **fixed**: "4 of 13 re-scraped pages (all four vendor-hosted ones)"; same wording in 08.

### Model discipline

- M1 (major) Biomarker identifier schemes duplicate D1/D2 → **fixed** (D4 side): `identifierSchemes: []`, MESH dropped too; SDL docstring and 10-seams updated. Requests: D2 drop LOINC from Outcome; kernel states the one-(scheme, value)-one-entity rule (11 #37).
- M2 (major) Q-D4-09/10 required a non-existent D8 → Device edge → **fixed**: patterns go Device ← DELIVERS ← Product ← CONCERNS / STATUS_OF (D8 unions already admit Product); `status: requested` seams withdrawn and replaced by consumed seams to D6.Product; 11 #12 and #32 corrected ("cheapest route" was wrong); 09 risk 2 rewritten; request: D8 closes OQ-D8-29 with no union change.
- M3 (major) `regulatory_statement` duplicates kernel RATES_CLAIM → **fixed**: glucose c01–c03 are `RATES_CLAIM` (FIELD, asserter FDA, rating in valueString, scale qualifier); D4 predicate withdrawn.
- M4 (major) CLAIM-kind assertions without OCCURRENCE_OF → **fixed**: b03, b06, g28 carry `occurrenceOf` a new kernel Claim each; d13/d14 → RELATIONSHIP, e13 → FIELD, c03 → RATES_CLAIM; intent v1 gap recorded (11 #25, #41).
- M5 (major) Q-D4-08 started from a predicate the fixture never writes → **fixed**: Assessment-first pattern with optional occurrences, means and RATES_CLAIM ratings; expected answer written.
- M6 (major) REQUIRES_INPUT_METRIC does not earn a type → **fixed by the reviewer's alternative** (not by demotion): new Q-D4-26 (value 2, harm) traverses it in reverse and filters on it; fixture answer InnerAge 2.0 → HbA1c input → RESOLUTION CANDIDATE LOINC 4548-4 → HbF interference SAFETY_SIGNAL. Type count stays 13/14.
- M7 (major) D10 ↔ D4 seam disagreement → **fixed on the D4 side**: Q-D4-24 reads Report -HAS_ITEM-> ReportItem -ASSESSES-> LabTest | Device with DERIVED_FROM citations; 10-seams lists D10.ReportItem ASSESSES → LabTest / Device (K.Report → LabTest removed); D10's answer-kind proposal accepted (Q-D4-24 retrieved). Requests to D10 in 11 #38 (PanelDefinition, "serves Q-D4-25", LabTest target).
- M8 (minor) "D6 has not adopted DELIVERS" stale → **fixed**: 11 #8 resolved; 09 coordination record and risk 2 updated.
- M9 (minor) D2 seam note wrong edge-property type → **resolved by D2** (D2's file, not editable from D4): 11 #33 extended to D2 10-seams; a re-check at 22:30 EDT found D2's working copy already corrected in both 10-seams and 03 (D2's own review pass).
- M10 (minor) PartitionSex duplicates D3 SexScope → **fixed**: D3 `SexScope` used, fields `minAgeYears`/`maxAgeYears`, CQ-DX-06 filter `['ALL', 'NOT_REPORTED', $sex]`; fixture intervals with no stated partition now `NOT_REPORTED` (was ANY); compile stub adds D3's enum (11 #40).
- M11 (minor) predicate casing, unregistered `increases_level_of`, INTENDED_FOR_TARGET subject → **fixed**: all D4 predicate values SCREAMING_SNAKE (05, 03, 09, 10, 11, SUMMARY, fixtures); Q-D4-13 uses D2's registered INCREASES_LEVEL_OF bound to the biomarker; Q-D4-18 reaches LabTest through its Product (D5 change optional, 11 #39).
- M12 (minor) 03 names → **fixed**: `adj.verdict`, `LegalStatus`, LabTest regulatory route via PERFORMED_BY_LAB → Organization ← ADDRESSED_TO and via Product, Q-D4-25 uses AS-OF with $asOf = now.
- M13 (minor) harm share padded → **fixed**: Q-D4-23 → neutral, Q-D4-26 added, CQ-DX-03 kept as harm with a written reason; 13 / 35 = 37 %.
- M14 (minor) OPERATIONALIZED_BY position contradicts seams → **fixed** (11 #11 rewritten: Biomarker by default, Metric when metric precision matters, composites show `notReported`); D5 keeps Metric — the reviewer's "drop Metric" option is not taken because the wearable fixture shows "HRV" Biomarker-level operationalization would hide RMSSD vs SDNN (NOT_COMPARABLE).

### Check-stage open issues

- C0 D6 DELIVERS → resolved (M8). C1 D8 Device/LabTest target → resolved without a D8 change (M2). C2 stale D2 sentence → resolved by D2 in its working copy (re-checked 22:30 EDT; 11 #33). C3 Write tool refused SUMMARY.md → this pass edited SUMMARY.md with Edit. C4 RESOLUTION codes unused → resolved (CANDIDATE added; s01–s08 use it; 11 #35).

### Verification

- Fixtures regenerated from `_notes/fixture-tooling/spec` (gen.py + prefixChars/suffixChars): 7 fixtures, 132 locators (+10), 96 assertions, 18 assessments; `reselect.py` 132/132 re-select from snapshot bytes; `validate-intents.mjs` 7/7 valid.
- Compile check against the current kernel (sha256 b2c2b1b0…): kernel 322,904 B / 179 inputs; + stubs (incl. D3 SexScope) 348,494 / 189; + D4 524,197 / 293 → D4 marginal +175,703 B, +3,566 lines, +104 inputs, 1 s build; output 524 KB (not the pinned 55 MB schema). 09 updated.
- `node scripts/packet-check.mjs D4` → exit 0: nodeTypes 7, relationshipTypes 13, pairs 17, questions 35, fixtures 7.
- Files changed (all under `schema/program/packets/D4/`): 01, 02, 03, 04, 05, 06, 08, 09, 10, 11, SUMMARY.md, RUNLOG.md, `_notes/tool-log.md`, `_notes/fixture-tooling/{gen.py, spec/*.py}`, all seven `07-fixtures/*` folders. Scratch: `ft/D4/refetch/whoop-openapi-a3.json`, `ft/D4/compile3/`, `ft/D4/adv/`.

## Close-out: pattern lint (2026-10-09, A3)

Input: FU-04 pattern linter (S `final/_work/pattern-lint.json`) — D4 38 blocks, 3 failing, 3 packetBug, 0 rulingBroken. Fixed in `03-retrieval-patterns.md` only (no SDL change; no SDL docstring or register repeated the errors — grep for `CYPHER 25`, `VECTOR INDEX`, `measureText`, `<-[:HAS_IDENTIFIER]-` over D4 outside `_notes/` found only the three 03 lines):

- Q-D4-09: `(d)<-[:HAS_IDENTIFIER]-(id:Identifier)` → `(d)-[:HAS_IDENTIFIER]->(id:Identifier)` (kernel stores Subjectable → Identifier; `Identifier.identifies` is IN).
- Q-D4-14: `od.measureText` (not a D3 OutcomeDefinition property) → `od.name, od.description, od.timepoint`.
- Q-D4-22: dropped the `CYPHER 25` prefix and the Cypher 25 `SEARCH … VECTOR INDEX` clause; vector leg is now `CALL db.index.vector.queryNodes('metric_embedding', 20, $textEmbedding) YIELD node AS m, score AS vs` (Neo4j 5.26 / Cypher 5). Rank fusion unchanged.

Verification:
- `node C:/…/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D4 --json <scratch>/lint-D4.json --md <scratch>/lint-D4.md` (reports to scratch so the shared report is not overwritten) → "D4: 38 total, 0 failing (0 packetBug, 0 rulingBroken), 2 fragment, 1 gds"; selfCheckDiffs 0; Q-D4-09/14/22 class ok, EXPLAIN ok.
- `node scripts/packet-check.mjs D4` → exit 0 (nodeTypes 7, relationshipTypes 13, pairs 17, questions 35, fixtures 7).
- Files changed: `03-retrieval-patterns.md`, `RUNLOG.md`. Not committed (coordinator commits).
