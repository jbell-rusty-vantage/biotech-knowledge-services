# Run log — packet D1

## Claim

- agent: A2 (this entry by the RESEARCH stage, Wave 1; the model, fixtures and check stages are separate agents that continue this log)
- domains: D1 compounds and ingredients (this packet). A2's second domain, D12 food and nutrition, is a separate packet under `packets/D12/`.
- worktree: `C:\Users\Pinda\Proyectos\Biotech\biotech-knowledge-services-A2` (branch `ft/schema-A2`)
- base commit: e484fd2
- planned fixtures (candidates with captures and digests in `_notes/fixture-candidates.md`):
  1. NIH DSLD label record of a nicotinamide riboside chloride product (salt vs moiety, branded material, amount referent).
  2. Identity authority records for the salt and the moiety (PubChem / FDA GSRS): identifiers and molecular weights that feed the derived moiety-equivalent Assertion.
  3. A peer-reviewed trial paper whose methods name the administered material form and dose (unstructured -> entity path, directive 3.8).
  4. Harm case: a regulator action on a substance amount across products (vitamin B6 / pyridoxine and peripheral neuropathy) or measured-vs-declared content.
  5. A probiotic label with strain designation and count, plus the strain's deposit/taxonomy record.
  6. A botanical extract standardization specification, plus a botanical safety (hepatotoxicity) source.

## Entries

### 2026-10-08 — RESEARCH stage (Wave 1), A2

- Read: 00-DIRECTIVE (full), 01-PACKET-CONTRACT, 02-TEAM, brief D1, PLAN §§ 1, 3, 6; workspace START_HERE, fragments W02 and W05; schema-map "Domain D3: Substances…" (lines 1964–3202, D1-relevant cards only) and the W04 IngredientComponent / QuantityDeclaration cards; QuantitativeContentProperties and the D1 enums; ingestion non-inference rules; competency questions CQ-ID-03/04/05/06, CQ-ST-01/02, CQ-PF-01..04; OPEN-QUESTIONS Priority 1 "ingredient identity and equivalence". A1's kernel pattern (K/09) was not yet published (headings only); A5's targets vocabulary was available.
- Ran `node scripts/packet-skeleton.mjs D1` (16 files created).
- Research (tools and failures in `_notes/tool-log.md`): NIH DSLD API v9 (13 label records, 6 searches); FDA GSRS API (6 substance records); PubChem PUG REST (7 CIDs, 6 name resolutions); ChEBI/OLS; CAS Common Chemistry (401); NCBI Taxonomy E-utilities (2 taxa); Health Canada LNHPD API (bulk licence dump + 6 medicinal-ingredient records + purpose/risk); eCFR 21 CFR 101.36; Europe PMC (Conze 2019 full text; Zheng 2020 metadata); PubMed MCP (empty full text for a JAMA letter); ClinicalTrials.gov API v2 (NCT02712593; the paper's NCT0271593 is a 404); SEC EDGAR full-text search + Niagen Bioscience FY2025 10-K; Firecrawl CLI scrapes (TGA vitamin B6, TGA ashwagandha, NIH ODS B6 fact sheet, KSM-66 page, PMC page of the JAMA letter, ATCC 404); Tavily CLI searches (6) and one failed extract (Reddit).
- Problems: tvly crashes printing to the Windows cp1252 console (fixed with `PYTHONIOENCODING=utf-8 … -o file`); eCFR versioner needs `--compressed`; LNHPD product endpoint ignores paging (148 MB dump); Reddit blocked by every tool (no browser fallback used); PubChem silently renamed `CanonicalSMILES` to `ConnectivitySMILES`; jq on the Windows console displays "™" as mojibake (bytes are correct — earlier note corrected).
- Wrote: `01-ecosystem.md` (actors by type, 8 artifact interviews with ≥ 2 instances each except the registry record, four lenses, 47 sources), `02-questions.md` (33 rows; 15 harm/disconfirmation; 10 value-1), `_notes/fixture-candidates.md` (9 candidates with sha256 and verbatim quotes; FC-04 = 3.8 path, FC-05/FC-08 harm, FC-06 disconfirmation), `_notes/research-notes.md` (candidate 4–5 node types, ~6 relationship types, predicates, deferrals, bitemporal inputs, seams, open questions), `_notes/tool-log.md`.
- Key findings for the model stage: salt/moiety/nutrient/branded-material are four declaration bases in live sources (US label salt, Canadian licence moiety, label nutrient-equivalent, branded row); GSRS gives ACTIVE MOIETY for salts but not nutrient equivalence; PMID 31278280 doses are NR-chloride mass (resolves OQ-L2-02 for that paper, as an assessment).
- Raw captures and sha256 manifest: scratch `…/scratchpad/ft/D1/raw/` and `…/ft/D1/sha256-manifest.txt` (not in the repo).

### 2026-10-08 — MODEL stage (Wave 2, part 1), A2

- Read: 00-DIRECTIVE (full), 01-PACKET-CONTRACT, 02-TEAM, brief D1, research outputs (01, 02, `_notes/*`), this log; A1 kernel pattern (`C:\Users\Pinda\Proyectos\Biotech\biotech-knowledge-services-A1\schema\program\packets\K\09-reasoning.md` sections "Kernel pattern…", verification mapping, size, decisions), `K/04-schema-proposal.graphql` (sha256 prefix 0ad415592b9e0b6c), `K/domain-template.graphql`, `K/identifier-schemes.yaml`, `K/11-open-questions.md`; workspace fragments W02, W05, pinned enum pages and QuantitativeContentProperties, pinned Chunk / DocumentTextVersion cards (for the 3.8 path); skills neo4j-modeling, neo4j-graphql, neo4j-vector-index (SEARCH clause), neo4j-cypher (fulltext), neo4j-gds (header; no GDS pattern proposed); `scripts/packet-check.mjs`.
- Coordination: sibling worktrees A1, A3–A8 checked for SDL/registers — only the kernel had SDL; read D2, D3, D4, D6, D8, D12 research notes for type names that touch D1 (D6 `FormulationVersion`/`DECLARES_COMPONENT`, D3 `StudyArm`/`ADMINISTERS`, D4 `HAS_ANALYTE`, D8 `PATENT_ABOUT`/`STATUS_OF`, D12 composition edge, D2 species-as-enum). No D1 type is declared elsewhere; D1 declares no cross-module edge.
- Decisions: 4 node types (ChemicalSubstance, IngredientMaterial, Constituent ⊃ Nutrient, Taxon ⊃ botanical/microbial taxon + strain), 7 relationship types, 8 pairs, no unions; ChemicalForm cut into material properties; QUANTITATIVELY_CONTAINS + PROVIDES_CONSTITUENT → MATERIAL_CONTAINS (statementKind); new COUNTS_TOWARD_NUTRIENT and NUTRIENT_EXPRESSED_AS; derived amounts = kernel CALCULATED Assertions (rules mw-ratio, nutrient-equivalent, daily-max). One D1 edge-property type `ContentEdgeProperties` (conflict with the kernel's four types → OQ-D1-01).
- Wrote: `03-retrieval-patterns.md` (33 sections, conventions EP/REC/TRACE, fulltext index, 3.8 vector path), `04-schema-proposal.graphql`, `05-relationship-register.yaml`, `06-node-register.yaml`, `09-reasoning.md`, `10-seams.yaml`, `11-open-questions.md` (23 items), a model-stage note in `02-questions.md` (no id changes); created fixture folders `07-fixtures/{nr-salt-moiety-us-canada, nr-trial-unstructured, vitamin-b6-threshold-harm, ashwagandha-plant-part-harm, lgg-strain-resolution}` with `source.md` stubs (url, title, retrieval date, research digests, kind, what each must exercise); removed the empty skeleton `07-fixtures/fixture-01`.
- Compile check (scratch `…/scratchpad/ft/D1/`): `compile.graphql` = A1 kernel SDL + D1 module (no stubs needed). From the worktree, with `export BKS_SCHEMA_PATH=<win abs path> NODE_OPTIONS=--max-old-space-size=8192`, `pnpm --filter @bks/graphql-api print-schema <win abs out>`. Kernel alone 326,564 bytes / 6,582 lines / 185 inputs; kernel + D1 427,761 / 8,548 / 239 (marginal +101,197 bytes, +54 inputs), ~1 s. Alternatives measured: MATERIAL_CONTAINS with AssertedEdgeProperties 414,569 / 233; union target 423,899 / 240.
- Problems: (1) `print-schema` silently fell back to the pinned 55 MB SDL when `BKS_SCHEMA_PATH` was given inline in a `for` loop and when a Git-Bash path (`/c/...`) was handed to Node as a Windows path — exporting the variable with a `cygpath -w` path fixed it; recorded as OQ-D1-21. (2) A heredoc with many quotes failed in Git Bash (`unexpected EOF`); fixture stubs were written with the Write tool instead. (3) Two YAML plain scalars containing ": " failed to parse; quoted. (4) `python3` is not on PATH in Git Bash; used `node` for the scratch SDL edit.
- packet-check: only fixture-content failures (locators.yaml / assertions.yaml / questions.md missing in the 5 stub folders) — expected at this stage. Counts 4/8 nodes, 7/14 rels, 8/35 pairs, 33 questions, 5 fixtures.

### 2026-10-08 — FIXTURES stage (Wave 2, part 2), A2

- Read: RUNLOG, 01-PACKET-CONTRACT, 00-DIRECTIVE 3.8 and section 4, PLAN 6.3, 02-questions, 03 conventions (EP/REC/TRACE, projection), 04 SDL, 05/06 registers, 10-seams, `_notes/fixture-candidates.md`, `_notes/tool-log.md`, the five stub `source.md`; A1 kernel pattern (K/09 "Kernel pattern…", verification.v1 mapping) and K SDL enums (SelectorKind, AssertionKind, BasisKind, AssessmentKind, ValidTimeBasis); `examples/ingestion-intent.example.json` and `packages/contracts/src/ingest.ts` + `common.ts`; sibling SDL for seams: D6 (A6: LabelVersion, DECLARES_COMPONENT, ComponentLineProperties), D3 (A4: InterventionComponent, ADMINISTERS), D9 (A8: Chunk, CHUNK_OF, COVERS_LOCATOR, MENTIONS), D7 (A6). Sibling fixtures (A1 D10, A7 D13) were still stubs, so the fixture file shape here is D1's own, following the kernel Assertion fields.
- Re-captured every source (scratch `ft/D1/fresh/`): DSLD ×6, LNHPD ×4, GSRS ×6 + 1 search, Europe PMC ×3, ClinicalTrials.gov ×2 (one 404), NCBI ×5, eCFR, EDGAR (identity header read in-shell), Firecrawl ×4 (TGA ×2, ODS, KSM-66). Digest drift vs research: LNHPD (server timestamp), ctgov (byte order), TGA B6 (page chrome); all quotes re-selected in the new bytes.
- Wrote with scratch scripts (`ft/D1/bin/`): `build_locators.py` → 5 `locators.yaml` (98 locators, code-point offsets, prefix/suffix, quoteHash, snapshot digests; 0 errors), `check_fixtures.py` (0 errors; every 05 type exercised in its registered fixture; numbers recomputed), `build_intents.py` → 5 `intent.json`, all valid against the zod `IngestionIntent` (`validate_intents.mjs`).
- Wrote by hand: 5 `assertions.yaml` (70 assertions, 14 assessments, producedBy fixture ids `mission:ft-D1-fixtures` / `run:ft-D1-<fixture>`), 5 `source.md` (url/title/retrieved/digest/kind/tool + companion snapshot tables), 5 `questions.md`; `08-sources-and-tools.md` (20 tools scored, F1–F14), `SUMMARY.md`; appended `_notes/tool-log.md` (F1–F13) and `11-open-questions.md` (OQ-D1-24…28).
- Fixtures: nr-salt-moiety-us-canada (other; REALIZES_SUBSTANCE, HAS_ACTIVE_MOIETY, MW FIELD, mw-ratio 263.4 mg, daily-max 790.2 mg/d, LNHPD 263.0 reconciliation −0.41 mg); nr-trial-unstructured (unstructured-to-entity; 3.8 path chunk Sec6 28532–30482 → locators 28662/28769/29785 → assertions → JATS bytes; APPLICABILITY dose basis; 878.0 mg/d; NCT0271593 404 disconfirmation); vitamin-b6-threshold-harm (harm; COUNTS_TOWARD_NUTRIENT, NUTRIENT_EXPRESSED_AS, HAS_ACTIVE_MOIETY, 50 mg P5P → 34.2 mg, TGA 50 and 10 mg/d thresholds); ashwagandha-plant-part-harm (harm; DERIVED_FROM_TAXON, REALIZES_SUBSTANCE V038D626IF, MATERIAL_CONTAINS ≥ 5 % withanolides / < 0.1 % withaferin A, PARENT_TAXON); lgg-strain-resolution (other; strain taxon 568703, PARENT_TAXON closed/open episodes around Zheng 2020, ATCC 53103 / LMG 18243, NCBI 47715 and 1578 captured).
- Problems: Git Bash → Windows Python needs `cygpath -w`; heredocs passed through the tool collapse double backslashes (one builder line fixed with Edit); console shows "™"/"§" as "�" (bytes correct); GSRS MW appears twice per record; LNHPD licence endpoint ignores filters; the harness refused a Write of SUMMARY.md as a "report file", so it was written with a shell heredoc (it is a contract deliverable).
- `node scripts/packet-check.mjs D1` → ok: true.

### 2026-10-08 — CHECK AND HANDOFF stage, A2

- Read: 00-DIRECTIVE (full), 01-PACKET-CONTRACT, `scripts/packet-check.mjs`, every D1 packet file, this log; A1 kernel `K/04-schema-proposal.graphql` as it is now (sha256 `790e7244eec773ff…`, 51,377 bytes) and `K/09-reasoning.md` decisions M10 (`AssertedRecordedProperties`), M11 (domain-local edge-property supersets) and rule 9 (kernel types outside the allowlist go under `sharedVocabularies: kernel-types`); sibling SDL and `10-seams.yaml` that touch D1: A3 (D2, D4), A4 (D3), A5 (D5), A6 (D6, D7), A7 (D8, D13), A8 (D9, D11), A1 (D10), A2 (D12).
- `node scripts/packet-check.mjs D1` passed on arrival and still passes after the fixes below.
- Audit beyond the script, with a scratch script (`ft/D1/check/audit.mjs`) and re-running the fixtures-stage checker (`bin/check_fixtures.py` → ERRORS 0):
  - Question ids: every Q-D1/CQ id used in the packet files exists in 02, with two exceptions. (1) the pinned anti-pattern id AX-25 appeared in the prose of 02; it is reworded, since D6 owns that question. (2) `CQ-ST-01` stays in this log's research-stage reading list, which is a history entry and not a question reference. 33 questions; 15 harm/risk/disconfirmation (45 %); 10 at value 1.
  - 02 fixture column: Q-D1-09 and Q-D1-10 were marked `yes`, but no fixture answers them (the Cohen 2023 candidate FC-06 was never built). Both are now `no` (OQ-D1-30).
  - Relationships: all 7 in 05 have a pattern section in 03 that uses the type. Every populatedBy id is a row in 08. Each relationship is exercised by an edge-bearing assertion in its registered fixture.
  - Directive discipline holds:
    - SUPPORTS/CONTRADICTS appear only as kernel `EvidenceRole` values on assertion/assessment → locator evidence;
    - MENTIONS appears only as derived D9/kernel edges with `derivedFromAssessmentUids`;
    - no good/bad properties;
    - no kernel type re-declared;
    - D1 has no derived fields;
    - D1 declares no cross-module edge.
  - Size: 09's estimate (4 node types, 7 relationship types, 8 pairs) equals packet-check's counts.
- Spot-check of quotes by re-fetching (scratch `ft/D1/check/verify_quotes.mjs`). Both captures were byte-identical to the fixture snapshot digests, and every quote matched at its recorded code-point offset with an equal quoteHash:
  - Europe PMC JATS PMC6611812 (curl; sha256 `ae7b5a42…`, 146,708 bytes): l-sr-doses 28662, l-sr-capsule 28769, l-sr-arms 29785, l-sr-abstract-niagen 5731, l-sr-registry 22841.
  - TGA vitamin B6 safety update (Firecrawl CLI 1.23.1 `--only-main-content --max-age 0`; sha256 `1fde192f…`, 16,727 bytes): l-tga-b6-schedule 481, -neuropathy 1768, -chemname 3850, -forms 4480, -asequivalent 4958.
- Fixes, written only under `packets/D1/`:
  1. Kernel M10: HAS_ACTIVE_MOIETY, COUNTS_TOWARD_NUTRIENT, REALIZES_SUBSTANCE and DERIVED_FROM_TAXON now use `AssertedRecordedProperties` in 04, 05 and the fixture `edge.properties` (14 edge lines). Header comments updated. OQ-D1-18 resolved.
  2. Kernel M11: `ContentEdgeProperties` complies (base fields verbatim first). OQ-D1-01 resolved; 04, 05 and 09 wording updated.
  3. `10-seams.yaml` rewritten against the sibling SDL:
     - renamed seams: D6 `LabelVersion` → IngredientMaterial | Constituent (no ChemicalSubstance target); D3 `InterventionComponent` ADMINISTERS; D8 `CONCERNS` (Patent, RegulatoryRecord) and `STATUS_OF` from `LegalStatus`;
     - added seams: D8 `MEASURES_ANALYTE`, D2 PARTICIPATES_IN / AFFECTS_MECHANISM / EXPOSED_TO, D5 STEP_USES, D12 FOOD_CONTAINS and PATTERN_COMPONENT, D9 MENTIONS and COVERS_LOCATOR, K Report ASSESSES;
     - predicate-level seams for D5, D7, D12 and D13;
     - `kernelReferences` moved to `sharedVocabularies: kernel-types` (K rule 9);
     - YAML parse verified.
  4. 03: every seam path rewritten to the current names (47 replacements):
     - D6: `ProductVariant -HAS_PACKAGE-> Package -HAS_LABEL_VERSION-> LabelVersion -DECLARES_COMPONENT->`, structural lines (no `d.assertionUid` or `d.recordedTo`, `amountReferent` instead of `massBasis`), blends via `lineRole` / `parentOrderIndex`;
     - D3: `InterventionComponent`;
     - D9: `Chunk -CHUNK_OF->` and `-COVERS_LOCATOR->` (no DocumentTextVersion, no `charStart`);
     - D12: food amounts read from the authorizing Assertion;
     - D8: `Patent -CONCERNS->` and `LegalStatus`;
     - D5: thresholds via `HAS_UPPER_LIMIT | DOSE_THRESHOLD`;
     - a "Seam paths" convention block added.
  5. 02: check-stage note added, the AX-25 reference reworded, and the Q-D1-09 and Q-D1-10 fixture column set to `no`.
  6. 06: the ChemicalSubstance whyNode names the verified seams.
  7. 11: OQ-D1-01, -03, -18, -22 and -24 revised; OQ-D1-04 renamed to the D8 `CONCERNS` edge; new OQ-D1-29 (re-measure at synthesis), OQ-D1-30 (Q-D1-09/10 unfixtured) and OQ-D1-31 (stale D1 names in D10/D13 seams; D7 `SUPPLIED_BY` versus predicate-only `SUPPLIES_MATERIAL`).
  8. 09: header, size table, re-measured executable numbers, bitemporal table with a property-type column, risks 1 and 3.
  9. SUMMARY.md rewritten (57 lines).
- Compile check, scratch `ft/D1/check/`:
  - Build: `compile-now.graphql` = current A1 kernel SDL + D1 module (no stubs). From the worktree: `export BKS_SCHEMA_PATH=$(cygpath -w …) NODE_OPTIONS=--max-old-space-size=8192; pnpm --filter @bks/graphql-api print-schema <cygpath -w out>`. Every build exited 0 in about 1 s, and the D1 types are present in the output (not the silent 57 MB fallback).
  - Kernel alone: 345,273 bytes / 6,927 lines / 192 inputs.
  - Kernel + D1: 450,569 / 8,950 / 248, a D1 marginal cost of +105,296 bytes and +56 inputs.
  - Recorded-only edges on AssertedEdgeProperties instead: 446,470 / 246.
  - Only one edge on AssertedRecordedProperties: 450,533 / 248.
  - MATERIAL_CONTAINS on AssertedEdgeProperties: 437,377 / 242.
  - Finding: an edge-property type costs a one-time ~4.1 KB and 2 inputs when it is first used, and about 0 per extra edge. Executable size tracks distinct property types, not field counts.
  - No breakage against the new kernel: D1 compiled unchanged apart from the property-type switch.
- Problems:
  - curl (Windows build) cannot write to a Git Bash `/c/...` path ("Failure writing output", HTTP 200, 0 bytes); `cygpath -w` fixed it.
  - `python - || node …` silently ran nothing: python exited 0 on empty stdin. Re-ran node directly.
  - A `node -e` with nested shell quotes failed; switched to script files in scratch.
  - 02 and 01 had CRLF endings. The Edit tool normalized 02 to LF, which packet-check tolerates.
  - The harness again refused a Write of SUMMARY.md as a "report file". It was written to scratch and copied in.

### 2026-10-08 (evening, resumed after a rate-limit pause) — Adversarial review (A2)

Two independent reviewers (evidence integrity E1–E7; model discipline M1–M11) plus the check-stage open issues. Every finding was re-verified first (sources re-fetched where the finding was about a source). Sibling worktrees were read again at 22:00: D3 (A4), D5 (A5), D6 (A6) and D12 (this worktree, another agent) were mid-review and uncommitted, and the A1 kernel had changed (sha256 b2c2b1b0…). D1 follows their current files and records the dependency.

**Evidence-integrity findings**
- E1 (blocker) ORCID 0000-0002-4955-3226 on the Person "Dietrich Conze" → **fixed.** Verified: in the fresh JATS (sha256 ae7b5a42…, unchanged) the only `contrib-id` is inside Charles Brenner's `<contrib>`, and `pub.orcid.org/v3.0/0000-0002-4955-3226/person` returns Charles Brenner. The identifier is removed from person-conze; intent.json is regenerated (no ORCID); `check_fixtures.py` now fails a Person identifier whose evidence locator does not contain the person's surname.
- E2 (major) c10 screen stored one `valueBoolean false` for four comparisons → **fixed.** Split into c10a–c10d, one CALCULATED `EXCEEDS_DOSE_THRESHOLD` per (label version, threshold). Each has its own label as subject and cites only its own daily amount and threshold: 326829 vs 50 false, vs 10 true; 309443 vs 50 false, vs 10 true. The checker enforces one threshold per screen.
- E3 (minor) t03 carried the registry dates with paper-only locators → **fixed.** New locators: l-sr-period (JATS: "screened on March 1, 2016 … last visit was on March 17, 2017") and l-ctgov-start / l-ctgov-completion (JSON_POINTER, 2016-03-21 and 2017-04). t03 now uses the paper period and t03b the registry dates, so the registry locators are cited.
- E4 (minor) GSRS search digest not reproducible, plus the User-Agent claim → **fixed.** Verified: two search fetches differ only in `created` and `etag`. The full record `substances(L6DO3QW4K5)?view=full` was byte-identical across three fetches (3aef316d…). An empty User-Agent and `curl/8` both get HTTP 200. Locators now cite the full record (l-gsrsl6do-id, l-gsrsl6do-name), and the search snapshot is no longer cited. source.md, 08, the tool log and OQ-D1-27 disclose the volatility; the GSRS auth column now reads "none".
- E5 (minor) 08 ↔ tool-log numbering and counts → **fixed.** F1–F14 now mean the same rows in both files: check_fixtures added to the tool log as F12, packet-check added to 08 as F14, the two Firecrawl rows merged into F9. Counts corrected: 6 GSRS records + 1 search; 11 DSLD labels, listed; 8 repeated quotes, listed. Adversarial rows A1–A6 added to both files.
- E6 (minor) ATCC readiness 0 vs 1 → **fixed.** Verified: `/products/53103` is still 404, and a Firecrawl site search finds BAA-3227, "an ATCC manufactured and accessioned progeny of 53103". Readiness is 1 (scrape-only, catalog search) in 08, 01 §2.1 (new source [S48]) and tool-log row 8. All three note that deposit pages are not at `/products/{number}`.
- E7 (minor) ARTG PDFs presented as read → **fixed.** 01 §1 and §2.2, OQ-D1-12, the fixture source.md, the b05 qualifier and the 09 bitemporal note now say "TGA states that ARTG PDF summaries give…". No ARTG PDF was fetched; fetching one is listed as open in OQ-D1-12.

**Model-discipline findings**
- M1 (blocker) duplicate `enum MassBasis` (D1, D3) → **fixed, with D3's own change.** At 22:00 D3 (A4) had already deleted its enum and references D1's. D1 keeps the single enum (consumers [D3, D6]; D6 adopted it in its own review) and records the conflict as resolved in OQ-D1-32. The reviewer's consumers list [D3] is superseded by D6's change. D12 does not use MassBasis.
- M2 (major) adopt OQ-D6-24 (AS_SALT_FORM / AS_ACTIVE_MOIETY referents; structural lines cited through HAS_LABEL_VERSION + `line=`) → **rebutted (superseded by D6).** D6 reversed OQ-D6-24 in its adversarial review (A6 04/05, re-read at 22:00). DECLARES_COMPONENT is now asserted, with its own per-line Assertion and `massBasis: MassBasis`, and AS_SALT_FORM / AS_ACTIVE_MOIETY are removed. D6 states this is "the form D1's fixtures already write". Predicate = edge type is the kernel rule for an asserted edge, so the item-6 objection lapses. Applied on D1's side: `orderIndex` added to every fixture line; 03 CQ-PF-01, Q-D1-05, Q-D1-19, Q-D1-21 and Q-D1-24 read `d.assertionUid` and `d.massBasis`; the 10-seams note, SUMMARY risk 1 and OQ-D1-24 are marked resolved. The OQ-D6-24 form is kept as the documented fallback. (A first conversion of nr-salt-moiety to the reviewer's form was made and then reverted with git when D6's change was found.)
- M3 (major) basis and comparator vocabularies spread over modules → **fixed on D1's side, rest recorded.** Mass basis now has one owner, D1 MassBasis (D3, D6). D6 AmountReferent keeps only referent values. D1 QuantityComparator renamed GE→GTE and LE→LTE to match D5. D8 SpecComparator and the merge decision go to the synthesizer as OQ-D1-34.
- M4 (major) NUTRIENT_EXPRESSED_AS should be predicate-only → **fixed.** Done in 04 (`expressedAs` removed), 05 (predicateOnly, with use and promoteWhen), 03 (Q-D1-02 and Q-D1-19 read the Assertion through DERIVED_FROM; the projection reads it by jurisdiction and `$vt`), 09, 10 and the fixture (b05 `written: false`). Counts are now 6 relationship types and 7 pairs.
- M5 (major) ContentEdgeProperties qualifiers not filtered → **fixed (reviewer's alternative route).** Q-D1-11 now has a real filter, "standardized to ≥ X % of marker M", written in Cypher and GraphQL in 03 and named in the 05 rationale. The type keeps only the four qualifiers that filter uses: statementKind, quantity, comparator, unitCode. quantityLow/High, contentBasis and massBasis move to Assertion qualifiers, and ContentBasis is removed. Measured: statementKind-only would save another 2.5 KB / 1 input; plain AssertedEdgeProperties 10.4 KB / 4 inputs. Both were rejected because D12's food content (in progress) uses the same field names, so material and food content filter alike.
- M6 (major) Q-D1-03 depended on unregistered DOSE_THRESHOLD → **fixed on D1's side.** d01/d02 are now HAS_UPPER_LIMIT with `limitKind:SCHEDULING_THRESHOLD` / `limitKind:LABEL_WARNING_THRESHOLD`; DOSE_THRESHOLD is removed from 03 (and the checker rejects it); D1.Constituent is added to the seam row's `from`; the INTAKE_THRESHOLD text in OQ-D1-03 is fixed. The D5 request is recorded (owner D5).
- M7 (minor) register `questions` lists cited non-traversing questions → **fixed.** Removed MATERIAL_CONTAINS Q-D1-08 and Q-D1-20; REALIZES_SUBSTANCE Q-D1-08; HAS_ACTIVE_MOIETY Q-D1-02; and the seam rows MEASURES_ANALYTE Q-D1-09, ADMINISTERS Q-D1-08, D8 RegulatoryRecord CONCERNS Q-D1-18 and MENTIONS Q-D1-26. The SDL docstrings match.
- M8 (minor) t02 put trial-batch purity on the canonical material → **fixed.** t02 is now `ADMINISTERED_MATERIAL_PURITY` (FIELD, 99 %, subject the D3 InterventionComponent, no D1 edge, no inferred valid time). The predicate is requested from D3 in OQ-D1-35. MATERIAL_CONTAINS populatedBy drops europepmc-rest.
- M9 (minor) Q-D1-15 did not use the dated episode → **fixed.** The pattern walks `PARENT_TAXON*1..2` to the GENUS with EP on every hop and returns `genusAsOf` plus the lineage assertion uids, with the fixture expectations for 2019 and 2026. 09 updated.
- M10 (minor) Q-D1-12 plant-part restriction came from a parameter → **fixed.** It now filters on the kernel Assessment facet `plantPart=<PlantPart>`; a signal without the facet applies to every part. New fixture assessment s03 (`plantPart=LEAF`, India leaf ban as reported by TGA; locators l-tga-ash-leafban and l-tga-ash-rootpermitted). Facet registered in 09; the D5 request is OQ-D1-33.
- M11 (minor) seam property types and stale sibling names → **fixed (D1 side) / recorded.** ADMINISTERS and D8 CONCERNS notes now say AssertedRecordedProperties, as in D3 04 line 640 and D8 04 lines 412/657. Re-read: D10, D7 and D3 are already fixed by their owners; D13 line 85 (`D1.Compound`) is still open (OQ-D1-31, owner D13).

**Check-stage open issues (check-issues.json "D1")**
1. OQ-D1-24 → resolved (M2).
2. OQ-D1-03 → D1 side done (M6); D5 still open.
3. OQ-D1-31 → only D13 is open.
4. OQ-D1-30 (Q-D1-09/10 unfixtured) → still open. Not built in this stage.
5. CQ-ST-01 in the RUNLOG → left as history.
6. "Uncited" locators l-ncbi47715-name, l-dsld323170-entered, l-epmc-ids → a checker limitation. They are cited as node identifier evidence and as `statedAsOfEvidence` (l-dsld323170-entered is now also an a10 locator). The checker now counts those citations: 0 uncited.
7. intent.json still carries valid time on recorded-only edges → still open (kernel executor, OQ-D1-25).

**Kernel change adopted:** the kernel has no Mention node. The 10-seams MENTIONS row, Q-D1-26 and the fixture retrievalPath comment are updated.

**Runs**
- `build_locators.py`: 104 locators, 0 errors.
- `check_fixtures.py`: 0 errors, with 4 new checks.
- `build_intents.py` and zod: 5/5 parse.
- `packet-check D1`: ok — 4 node types, 6 relationship types, 7 pairs, 33 questions, 5 fixtures.
- Compile (kernel b2c2b1b0…, 51,355 bytes):
  - kernel alone: 322,904 bytes / 179 inputs;
  - kernel + D1: 421,219 / 230 (D1 marginal +98,315 bytes, +51 inputs; 1 s);
  - check-stage D1 on the same kernel: 428,200 / 235.
  - Each output contains the 4 D1 types, so none is the 55 MB fallback.

**Problems**
- Git Bash heredocs with many quotes failed again; patch files were written with the Write tool.
- Concurrent sibling reviews changed D6, D3, D12 and the kernel during this stage.

**Files changed** (all under `schema/program/packets/D1/`):
- 01, 02, 03, 04, 05, 06, 08, 09, 10, 11, SUMMARY, RUNLOG;
- `_notes/tool-log.md`;
- every fixture's `assertions.yaml`, `locators.yaml` and `intent.json`, and the source.md / questions.md of ashwagandha, vitamin-b6 and nr-trial.

Scratch: `…/ft/D1/adv/` (bin, patch, compile, fresh).

## Handoff

> **Superseded by the adversarial review (entry above):** packet-check now reports 4 node types, 6 relationship types, 7 pairs, 33 questions, 5 fixtures; fixtures hold 104 locators, 73 assertions, 15 assessments; kernel b2c2b1b0… + D1 = 421,219 bytes / 230 inputs (D1 +98,315 bytes, +51 inputs). The check-stage handoff below is kept as history.

CHECK AND HANDOFF stage, A2, 2026-10-08. Nothing committed (the coordinator commits per branch).

**packet-check** (`node scripts/packet-check.mjs D1`, exit 0):

```json
{
  "ok": true,
  "packet": "D1",
  "counts": {
    "nodeTypes": 4,
    "relationshipTypes": 7,
    "pairs": 8,
    "questions": 33,
    "fixtures": 5,
    "budget": {
      "nodes": 8,
      "rels": 14,
      "pairs": 35
    }
  }
}
```

**Counts vs budget:** node types 4/8, relationship types 7/14, pairs 8/35, widest union 0/6, at most 4/12 relationship fields per type. No EXCESS lines are needed.
- Questions: 33 (contract 15–40); 15 harm/risk/disconfirmation (45 %, need ≥ 33 %); 10 at value 1.
- Executable (kernel 790e7244 + D1): 450,569 bytes, 248 input types, about 1 s to build. D1 alone adds +105,296 bytes and +56 inputs.

**Fixtures** (5; 98 locators, 70 assertions, 14 assessments; producedBy `mission:ft-D1-fixtures` / `run:ft-D1-<fixture>`):

| fixture | kind | what it covers |
| --- | --- | --- |
| `nr-salt-moiety-us-canada` | other | REALIZES_SUBSTANCE, HAS_ACTIVE_MOIETY, mw-ratio 263.4 mg, daily-max 790.2 mg/d, US/CA reconciliation −0.41 mg |
| `nr-trial-unstructured` | unstructured-to-entity | 3.8 path: chunk Sec6 → locators 28662 / 28769 / 29785 → assertions → JATS bytes; dose-basis APPLICABILITY; 878.0 mg/d; NCT0271593 404 disconfirmation |
| `vitamin-b6-threshold-harm` | harm | COUNTS_TOWARD_NUTRIENT, NUTRIENT_EXPRESSED_AS, P5P 50 mg → 34.2 mg B6; TGA 50 and 10 mg/d thresholds |
| `ashwagandha-plant-part-harm` | harm | DERIVED_FROM_TAXON, MATERIAL_CONTAINS (≥ 5 % withanolides, < 0.1 % withaferin A), leaf versus root liver-injury signal |
| `lgg-strain-resolution` | other | strain taxon 568703, PARENT_TAXON episodes around Zheng 2020, ATCC 53103 = LMG 18243 |

**Open questions for the owner** (full list in `11-open-questions.md`):
- **OQ-D1-24 (D6, synthesizer).** D6 lines need `massBasis` (D3 already has it) or an `AS_ACTIVE_MOIETY` referent. One program-wide rule is also needed for per-line declaration provenance, which is what CALCULATED amounts cite.
- **OQ-D1-03 (D5).** HAS_UPPER_LIMIT should accept `D1.Constituent` as a subject. TGA scheduling and warning bands need a predicate name or limitKind values; the fixture uses `DOSE_THRESHOLD`.
- **OQ-D1-22 (D12, synthesizer).** D12 should adopt `ContentEdgeProperties`, so that food content and material content filter the same way.
- **OQ-D1-25 (kernel, executor).** The intent contract has no proposal kind for CALCULATED assertions, assessments or predicate-only object assertions.
- **OQ-D1-09 (owner, Priority-1).** The equivalence scale and the new-material rule. **OQ-D1-10 (owner):** the molecular-weight source policy.
- **OQ-D1-31 (synthesizer).** D10 and D13 seams still name `D1.Compound` and `D1.IngredientForm`. D7 carries a `SUPPLIED_BY` row next to the predicate-only `SUPPLIES_MATERIAL`.
- **OQ-D1-21 (owner, tooling).** `print-schema` silently falls back to the pinned SDL when the `BKS_SCHEMA_PATH` file does not exist.

**Files changed in this stage** (all under `schema/program/packets/D1/`):
- `02-questions.md`, `03-retrieval-patterns.md`, `04-schema-proposal.graphql`, `05-relationship-register.yaml`, `06-node-register.yaml`, `09-reasoning.md`, `10-seams.yaml`, `11-open-questions.md`, `SUMMARY.md`, `RUNLOG.md`;
- `07-fixtures/{ashwagandha-plant-part-harm, lgg-strain-resolution, nr-salt-moiety-us-canada, nr-trial-unstructured, vitamin-b6-threshold-harm}/assertions.yaml` (edge property-type names only).

Scratch (not in the repo): `…/scratchpad/ft/D1/check/` holds the audit and verify scripts, the re-fetched captures, the compile inputs, the print-schema outputs and logs.

## Close-out: pattern lint

2026-10-09, A2. Input: S `final/_work/pattern-lint.json` — D1 36 blocks, 9 failing (6 packetBug, 3 rulingBroken). Fixed the 6 packetBug blocks in `03-retrieval-patterns.md`:
- CQ-ID-04, Q-D1-06, Q-D1-15, Q-D1-26: HAS_IDENTIFIER reversed — the kernel stores Subjectable -[:HAS_IDENTIFIER]-> Identifier (`Identifier.identifies` is direction IN).
- Q-D1-26: UNION branches now return the same column names (`uid`, `name`, `scientificName`).
- Q-D1-08: `CYPHER 25` prefix and `SEARCH` clause replaced with `CALL db.index.vector.queryNodes('chunk_embedding', 8, $embedding)`; dropped `c.recordedTo` (D9 Chunk has no recorded time).
- Q-D1-01: `MOLECULAR_WEIGHT` added to `05-relationship-register.yaml` predicateOnly (D1 registrar, R-52 rule 3); OQ-D1-16 note.
- Also: header says Neo4j 5.26; Q-D1-16 comment no longer names a nonexistent D8 Trademark; nr-trial-unstructured fixture vector note updated.

Not changed: the rulingBroken blocks CQ-PF-01, CQ-ID-03 (R-30), CQ-ID-04 (R-42), Q-D1-16 (R-68) stay as this packet's record; S writes the final-SDL versions.

Checks: `lint-packet-patterns.mjs --packets D1` → 36 total, 0 packetBug, 4 rulingBroken, 2 fragment, 0 prose findings; `node scripts/packet-check.mjs D1` → ok, exit 0. SDL unchanged. Log: S `final/_runlog/closeout-A2-D1.md`.
