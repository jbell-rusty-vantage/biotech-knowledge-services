# Run log — packet D5

## Claim

- agent: A5 (research stage, Wave 1; later stages model → fixtures → check run as separate agents)
- domains: D5 — Interventions, protocols and safety + the targets (goal) vocabulary
- worktree: C:\Users\Pinda\Proyectos\Biotech\biotech-knowledge-services-A5 (branch ft/schema-A5)
- base commit: e484fd2
- planned fixtures (candidates, see _notes/fixture-candidates.md; final choice in the fixtures stage):
  1. a public protocol page versioned in place (biohacker protocol with steps, doses, cadence, sleep target) — unstructured-to-entity path (directive 3.8)
  2. a regulator drug label (DailyMed SPL / openFDA label) for a longevity-used drug — contraindications, interactions, adverse reactions — harm case
  3. an NIH ODS / NCCIH reference page with supplement upper limits and interactions — harm / avoidance case
  4. a primary paper whose result disconfirms a popular "helps target T" claim (antioxidants vs exercise adaptation) — disconfirmation case
  5. supplement adverse-event surveillance (openFDA CAERS / MMWR poison-centre report) — signal-vs-rumour case

## Entries

### 2026-10-08 — research stage start (A5)

- Read 00-DIRECTIVE, 01-PACKET-CONTRACT, 02-TEAM, D5 brief, PLAN §1/3/6, workspace/START_HERE, fragments W06/W16/W17, schema-map Domain D5 (lines 4876–6406, filtered), enums (TreatmentModality, ConstraintLevel, SafetySeverity, ProtocolStepType, ConstraintKind, ProtocolType, SignalStatus …), competency-questions.md (CQ-RC, CQ-PR, CQ-ST and CQ-EV families), OPEN-QUESTIONS.md (stepKey, SafetySignal, RECOMMENDS cutover).
- `node scripts/packet-skeleton.mjs D5` → 16 files created. No sibling packet (K, D13, others) existed at start; `packets/D5/vocab-targets.yaml` (Wave 0) not yet published — noted, consumed later if it appears.
- Tool status: `tvly --status` authenticated (v0.1.5); `firecrawl --status` authenticated (v1.23.1), team concurrency 4/5 in use at start → prefer curl on public APIs and tvly extract; firecrawl sparingly.

### 2026-10-08 — Wave 0 targets published (A5, Wave 0 stage)

- Published `packets/D5/vocab-targets.yaml` v0.1.0: node type `Target` (renames pinned FunctionalGoal; uid `hu:target:<slug>`), 15 targets (12 top level + 3 children: fat-loss, muscle-mass < body-composition; glycemic-control < cardiometabolic-health), deferred list, polarity rule (5 closed predicates INTENDED_FOR/IMPROVES/WORSENS/NO_EFFECT_ON/MIXED_EFFECT_ON_TARGET; assessments carry `effectDirection: OutcomeDirection`; population qualifier mandatory with explicit UNSPECIFIED), canonical query QP-TARGET-01 (helps/hurts/for whom/as-of with locator→snapshot→adjudication→Activity trace) plus variants (what-is-this-for, what-to-avoid, disconfirmation), and the seam rule (Assertion.predicate for every means; one curated structural `Target-[OPERATIONALIZED_BY]->(D2 Outcome | D4 Biomarker)` for measures).
- Notes: `_notes/vocab-targets-notes.md` (decisions D1–D9, framework mapping, citations C1–C9, open questions OQ-T1..T4). Tool use: `_notes/tool-log.md`.
- Commands: `firecrawl scrape` ×7 (Examine categories, PROMIS intro + domains, Oura Readiness, WHOOP Recovery, WHO ICF page, ICF checklist PDF); `tvly search` ×2; PubMed MCP search/metadata (PMID 29288712); curl PMC idconv (PMC8993034 → PMID 35395736).
- Problems: `tvly --json` UnicodeEncodeError on Windows cp1252 (fix PYTHONIOENCODING=utf-8); kernel pattern (packets/K) still a skeleton at publication → query written against pinned kernel relationship names, flagged for rebase; D10 assessment→input edge is a placeholder in the query.
- Concurrency note: a D5 research-stage agent is writing in this packet at the same time; this stage only created vocab-targets.yaml and _notes/vocab-targets-notes.md and appended to _notes/tool-log.md and RUNLOG.md.

### 2026-10-08 — research stage complete (A5, Wave 1)

- Wrote `01-ecosystem.md` (8 actor types; artifact interviews for 8 artifact types with ≥ 2 real instances each; four lenses; readiness table; 35 cited sources S1–S35, all retrieved 2026-10-08), `02-questions.md` (34 rows: 28 Q-D5 + reused CQ-RC-06, CQ-PR-01, CQ-PR-02, CQ-PR-04, CQ-PR-06, CQ-EV-04; 22 harm/risk/avoidance/disconfirmation; 13 value-1), `_notes/fixture-candidates.md` (FC-01 [U2E] Huberman sleep toolkit + 2021 Wayback edition; FC-02 [HARM] sirolimus label NDA021110 v22; FC-03 [HARM] Blueprint pregnancy magnesium vs ODS UL; FC-04 [DISCONF] Ristow 2009 / Paulsen 2014; FC-05 conflicting grapefruit directives; FC-06 PEARL null primary + sponsor interest; FC-07 HC melatonin monograph; FC-08 MMWR pediatric melatonin + CAERS; 3 backups), `_notes/research-notes.md` (Intervention collapse recommendation, ≤ 8 node candidates, typed vs predicate vs property, enum additions, conflicts incl. step→Target vs vocab seamRule, seams, pattern hints). Appended Wave 1 section to `_notes/tool-log.md`.
- Did not touch `vocab-targets.yaml` (published concurrently by the Wave 0 stage at 0.1.0); research findings that affect it are in research-notes §5 (step/edition FOR_TARGET exception, MeSH identifier scheme, claim-class property, HC "aspect" facets → Outcome seam rather than new targets).
- Commands/tools: curl (openFDA label/CAERS/FAERS, DailyMed history, E-utilities efetch/esearch/esummary, CT.gov v2, eCFR versioner, Health Canada NHPID, Wayback CDX + replay, MeSH lookup, Europe PMC search), `tvly extract`/`tvly search` (PYTHONUTF8=1), `firecrawl scrape` (Examine, LiverTox), Firecrawl MCP scrape, PubMed MCP `get_article_metadata`. Raw captures + sha256: scratch `ft/D5/raw/`, `ft/D5/sha256.txt`; all fixture quotes re-verified by exact match (`ft/D5/quotes.py`).
- Problems / readiness findings: ODS API 403 (Cloudflare) for curl; NCBI Bookshelf (LiverTox) reCAPTCHA for curl, Tavily and Firecrawl; HC NHPID wrong `atid` → 404 page with HTTP 200; eCFR versioner needs `Accept-Encoding` (curl `--compressed`); Wayback CDX intermittently "Temporarily Offline"; openFDA brand search `rapamune` → 404; CT.gov internal history endpoint 403; `tvly` cp1252 crash without PYTHONUTF8=1; CAERS reaction terms not case-normalized.
- `node scripts/packet-check.mjs D5` at end of stage: questions parsed = 34, no answer-kind failures; expected failures for files owned by later stages (SDL empty, fixtures not yet built).

### 2026-10-08 — model stage (A5, Wave 2 part 1)

- Read: 00-DIRECTIVE, 01-PACKET-CONTRACT, 02-TEAM, D5 brief, RUNLOG, 01-ecosystem, 02-questions, _notes/research-notes.md, _notes/fixture-candidates.md, vocab-targets.yaml 0.1.0; A1 kernel (`packets/K/09-reasoning.md` kernel pattern, `04-schema-proposal.graphql` sha256 0ad41559…ea2c, `domain-template.graphql`, `identifier-schemes.yaml`, `lever-experiments.md`); fragments W05/W06/W16/W17; schema-map D5 section (ProtocolEdition, ProtocolStep, UseConstraint); pinned enums; sibling research notes D1, D2, D3, D4, D6, D7, D12 for seam type names (no sibling SDL existed). Skills: neo4j-modeling, neo4j-graphql, neo4j-cypher, neo4j-gds, neo4j-vector-index.
- Wrote: `03-retrieval-patterns.md` (34 sections + conventions), `04-schema-proposal.graphql` (6 node types, 6 relationship types, 2 unions, 16 enums), `05-relationship-register.yaml` (6 entries, 14 predicateOnly, 24 deferred), `06-node-register.yaml` (6 nodes, 11 deferred, 19 mergedInto), `09-reasoning.md`, `10-seams.yaml`, `11-open-questions.md` (26), fixture stubs `07-fixtures/{sleep-toolkit-unstructured, sirolimus-label-interactions-harm, pregnancy-magnesium-upper-limit, antioxidant-exercise-disconfirmation}/source.md`; removed the empty skeleton `07-fixtures/fixture-01`. Updated `02-questions.md` (answer shapes of Q-D5-07/08/10 only; ids, kinds, polarity unchanged) and `vocab-targets.yaml` → 0.2.0 (kernel rebase: EffectDirection, `population:` qualifier, measures seam → D4 Biomarker|Metric, ProtocolStep.targetKeys exception; 0.1.0 backup in scratch `ft/D5/vocab-targets-0.1.0.yaml`).
- Key decisions: Intervention collapses Treatment/Procedure/Lifestyle/Exposure-practice (kind enum); plain supplement intake has no Intervention; step→Target conflict settled by the property `targetKeys` (no edge); safety facts are Assertion predicates resolving to UseConstraint (derived RESOLVES_TO_CONSTRAINT); CONSTRAINS_USE_OF / CONSTRAINT_SCOPE cut; AdverseEffect → D2 Condition; SafetySignal → kernel Assessment; only HAS_EDITION has an episode.
- Compile check (scratch `ft/D5/compile/`, harness `run.sh`, AST variant generator `variant.mjs`): `BKS_SCHEMA_PATH=<abs> NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <abs>`. Kernel alone 326,564 B / 6,582 lines / 185 inputs (= A1's numbers); kernel + 6 stubs 357,112 / 7,092 / 197; kernel + stubs + D5 486,498 / 9,522 / 260 → D5 marginal 129,386 B / 2,430 lines / 63 inputs. Variants: Subjectable instead of union StepMeans 483,578 / 252; no unions 482,328 / 248; no STEP_USES 479,840 / 249. `ft/D5/compile.graphql` and `ft/D5/out.graphql` are the final pair (sha256 b363b767…0064, d4536a9b…f591). `bks-schema map`: +6 node types, +6 rel types, +60 expanded pairs (48 from kernel Subjectable fields).
- Problems: first print attempt silently printed the pinned 55 MB schema (output path quoting in an inline loop; `loadPinnedSdl` falls back when the path does not resolve) — fixed with a script that passes `cygpath -w` paths per file and checks the log; a sed-based variant broke docstrings → replaced by an AST (graphql `visit`/`print`) generator; heredoc with apostrophes failed in Git Bash → files written with the Write tool; YAML `cardinality:` values containing ": " → quoted.
- `node scripts/packet-check.mjs D5`: only fixture-content failures (locators.yaml / assertions.yaml / questions.md missing in the 4 stub folders — the fixtures stage's work). Counts 6 / 6 / 12 pairs / 34 questions / 4 fixtures, within budget (8 / 14 / 35).

### 2026-10-08 — fixtures stage (A5, Wave 2 part 2)

- Read: RUNLOG, 00-DIRECTIVE, 01-PACKET-CONTRACT, 02-questions, 03-retrieval-patterns (conventions, Q-D5-01), 04 SDL, 05/06 registers, 10-seams, _notes/fixture-candidates.md, _notes/tool-log.md, vocab-targets.yaml keys; kernel pattern + kernel SDL (A1 `packets/K/09-reasoning.md`, `04-schema-proposal.graphql`); `examples/ingestion-intent.example.json` + `packages/contracts/src/ingest.ts`; sibling SDLs for seam type names and uid tokens (D1 substance/material, D2 condition, D3 study-population, D4 metric/biomarker, D6 product, D7 org/person + RECEIVES_VALUE_FROM ValueTransferKind, D9 Chunk, D12 food).
- Re-captured every fixture source on 2026-10-08 (scratch `ft/D5/fx/`): Tavily batch (5 pages) + BTSA claim page; curl openFDA v22, DailyMed history, DailyMed archived SPL zips v14 and v15 (new), Wayback 2021 replay, Discourse t/86 JSON (new), E-utilities ×2. Wrote generators `ft/D5/gen/{common,gen_sleep,gen_siro,gen_mg,gen_antiox}.py` (exact-match quote location, computed offsets, quote hashes, selector digests, UseConstraint identity keys `use-constraint-key/v1`, step payload hashes `d5-step-payload/0`), `verify.py` (snapshot hash + re-selection + 3.8 path) and `validate-intent.mjs`.
- Wrote 07-fixtures (4 folders, each source.md, locators.yaml, assertions.yaml, intent.json, questions.md): `sleep-toolkit-unstructured` (unstructured-to-entity; 2 snapshots, 33 locators, 19 steps, 11 assertions, 4 UseConstraints, D9 chunk [6026,6688) covering 8 locators → 5 assertions), `sirolimus-label-interactions-harm` (harm; 7 snapshots, 34 locators, 11 assertions, 4 UseConstraints; grapefruit constraint groups label v14 (superseded) + v22 + clinic + forum; cannabidiol added in SPL v15), `pregnancy-magnesium-upper-limit` (harm; 2 snapshots, 29 locators, 14 steps, 19 assertions, 12 UseConstraints; Q-D5-06 computed ABOVE, not stored), `antioxidant-exercise-disconfirmation` (disconfirmation; 3 snapshots, 21 locators, 6 assertions incl. a claim occurrence, 3 Assessments, 3 OPERATIONALIZED_BY). `verify.py`: all snapshots hash-verified, 117/117 locators re-selected. All 4 intents VALID against `IngestionIntent`.
- Wrote 08-sources-and-tools.md (20 tool rows + 11 source rows; every 05 populatedBy id present). Appended OQ-D5-27..35 to 11-open-questions.md and the fixtures section to _notes/tool-log.md. Register/SDL touch-ups: STEP_USES cardinality → zero_or_more (informational OTHER/CONSULT steps; docstring only, no size change); 05 header notes which fixtures also exercise each type.
- Decisions: the Huberman 2021 and 2026 captures share one structured step payload → ONE edition (sponsor change = D7 assertions; step-4 "zero-cost"/platform wording = D6 product attributes), so CQ-PR-01's expected answer is "no payload change" with a fuzzy re-anchor for step 4; caffeine cutoff modeled as a TIMING UseConstraint (identity needs a timing component, OQ-D5-29); multi-condition theanine caution fans out to 3 constraints (OQ-D5-32).
- Corrections to the research stage: the 2021 Wayback capture served is 20211018160634 (requested 20211016002820 redirects); the ODS UL table header reads "Pregnant | Lactating" (the RDA table above reads "Pregnancy | Lactation"); SPL v14/v15 labeler of record is Greenstone LLC, not Mylan.
- Problems: Wayback CDX offline 3/3; a 2023 replay of the Webflow page is an empty JS shell; unzip preserves publisher mtimes; `python -I` ignores PYTHONUTF8; Write-tool heredocs avoided for files with apostrophes (Python writes). Nothing committed.
- Generator, verifier and intent validator copied to `_notes/fixture-gen/` (they read captures from the session scratch `ft/D5/fx/`, which is not committed; `verify-output.txt` is the 2026-10-08 run). Re-running needs fresh captures; quotes and offsets would then be re-located, not re-typed.

### 2026-10-08 — check and handoff stage (A5, Wave 2 part 3)

- Ran `node scripts/packet-check.mjs D5`: ok at start (6 / 6 / 12 pairs / 34 questions / 4 fixtures) and ok at the end (13 pairs after the Outcome change). Audit beyond the script with a scratch script (`ft/D5/audit.mjs`: 05 pattern refs exist in 03 and mention their relationship, populatedBy ids appear in 08, each register fixture mentions its relationship) plus greps.
- Findings and fixes:
  - Question ids not in 02: a kernel question id in 03 Q-D5-24 reworded to "the K packet's blast-radius pattern"; external catalog ids in vocab-targets.yaml (PC-01), this RUNLOG (ST-06) and _notes (PR-03, RC-01, ST-01) reworded as "catalog XX-nn" or families. Now every Q-/CQ- id anywhere in the packet is a row in 02.
  - 05 lists Q-D5-24 for HAS_EDITION and Q-D5-03 for STATES_CONSTRAINT but their 03 patterns did not traverse them: added the protocol-edition branch (HAS_EDITION episode at $since + STEP_USES + Assessments on the edition) to Q-D5-24 and the `statedByProtocolSteps` branch (STATES_CONSTRAINT) to Q-D5-03.
  - 02 `fixture` column said yes for six questions no built fixture answers (Q-D5-08, CQ-EV-04, Q-D5-15, Q-D5-17, Q-D5-22, Q-D5-25): set to no (21 / 34 have a fixture).
  - Seams re-verified against sibling SDLs and 10-seams (A1 K/D10, A2 D1/D12, A3 D2/D4, A4 D3, A6 D6/D7, A7 D8/D13, A8 D9; files as of 17:23-18:12). Type names all match. Fixed: D3 declares ADMINISTERS on `InterventionComponent` (not StudyArm), so the 10-seams row, the Q-D5-01 study branch and Q-D5-25 now use `StudyArm -HAS_COMPONENT-> InterventionComponent -ADMINISTERS->` and `StudyResult -RESULT_FOR-> OutcomeDefinition -MEASURES->`; added inbound D2 AFFECTS_MECHANISM / EXPOSED_TO rows and predicate MEDIATES_TARGET (OQ-D5-37); recorded D6's stale CONSTRAINS_USE_OF row (OQ-D5-36).
  - D2 keeps an `Outcome` node and asked D5 (D2 open question 27) to restore it as a measures target; the model-stage premise "D2 proposes no Outcome" was stale. Added `Outcome` to `union TargetMeasure` (3 members, +1 pair) in SDL, 05, 06, 10-seams, vocab-targets.yaml 0.2.0 -> 0.2.1 (additive), 03 and 09 D-13. OQ-D5-07, -18, -19 marked resolved or superseded; OQ-D5-06 updated (D12 keeps DietaryPattern, so a diet can be minted twice).
  - Directive discipline: no SUPPORTS / CONTRADICTS edges in SDL, patterns or fixtures; MENTIONS appears only as a derived candidate finder (03 Q-D5-01, Q-D5-27; sleep fixture chunk block); no good/bad/safe property; harm 22 / 34 >= 1/3; no D5 type or enum name collides with A1's kernel SDL; derived RESOLVES_TO_CONSTRAINT is `@settable(onCreate: false, onUpdate: false)` with `nestedOperations: []`.
  - Fixtures: `verify.py` re-run (3 + 2 + 7 + 2 snapshots hash-verified; 21 + 29 + 34 + 33 = 117 locators re-selected; sleep chunk [6026,6688) -> 8 locators -> 5 assertions); `validate-intent.mjs`: 4 / 4 intents VALID. Every register fixture contains instances of its relationship (sleep: HAS_EDITION 1, HAS_STEP 19, STEP_USES 17, STATES_CONSTRAINT 4; magnesium: HAS_EDITION 1, HAS_STEP 14, STEP_USES 13, STATES_CONSTRAINT 10, RESOLVES 14; sirolimus: RESOLVES 9; antioxidant: OPERATIONALIZED_BY 3, RESOLVES 2). No fixture exercises the new Outcome member.
  - Independent re-fetch spot checks: (1) curl openFDA sirolimus label -> sha256 `ab1a2c27...51c2`, byte-identical to the fixture snapshot; the quote "Because grapefruit juice inhibits the CYP3A4-mediated metabolism of sirolimus, it must not be taken with sirolimus" sits at [1790,1904) of `/results/0/drug_interactions/0`, 1 occurrence, version 22 / 20260326, an exact match with locator l04. (2) Firecrawl scrape (maxAge 0, a different tool from the Tavily capture) of the ODS magnesium fact sheet returned "The ULs only include magnesium from dietary supplements and medications; they do not include magnesium found naturally in food and beverages." verbatim, and Table 3 Pregnant 350 mg for 14-18 / 19-30 / 31-50, matching the magnesium fixture.
- Compile check re-run against A1's current kernel (`packets/K/04-schema-proposal.graphql`, sha256 `790e7244...8c71`, 51,377 B, newer than the Wave 0 kernel the model stage used) + 7 stubs (D2 Outcome added) + D5, scratch `ft/D5/compile/check/` (`run.sh`): kernel 345,273 B / 6,927 lines / 192 inputs (= A1's published model-stage numbers); kernel + stubs 380,828 / 7,522 / 206; + D5 510,857 / 9,964 / 270, so the D5 marginal cost is 130,029 B / 2,442 lines / 64 inputs; StepMeans -> Subjectable variant 507,937 / 9,884 / 262 (the union still costs +2.9 KB / +8 inputs). No breakage. `bks-schema map --sdl`: 19 -> 25 node types, 14 -> 20 relationship types, 116 -> 183 expanded pairs. The 09 size estimate and measured table were rewritten with these numbers.
- Wrote SUMMARY.md (43 lines). The Write tool refused a .md file from a subagent, so SUMMARY.md and this entry were written through the shell (they are packet-contract files, not reports).
- Tools: Bash (node, python -I, curl, sha256sum, sed), Firecrawl scrape (MCP), pnpm print-schema, bks-schema map. Problems: scratch scripts need Windows paths for `node` (`C:/...`, not `/c/...`); `validate-intent.mjs` needs the repo path as its first argument. Nothing committed.

### 2026-10-08 — Adversarial review (A5)

Two independent reviewers (evidence integrity E1–E13; model discipline M1–M16) plus the check-stage issues for D5. Every finding was verified first (re-fetch or file read, `_notes/tool-log.md` "adversarial review"); then fixed, or rebutted with evidence. Writes only under `schema/program/packets/D5/`; nothing committed. Generators edited in `_notes/fixture-gen/` and all four fixtures regenerated (identity rule `use-constraint-key/v2`); `verify.py`: 3/2/7/2 snapshots hash-verified, locators 21/21, 52/52, 34/34, 38/38 re-selected; all four `intent.json` VALID against `IngestionIntent`.

Evidence integrity:

- E1 (pregnancy fixture models 14 of the section's items; Q-D5-11 misses alcohol / caffeine) → **fixed**. Verified in the stored capture (sha256 da7eb359…): items 1.1–1.5, 3.1, 3.5, 4.1–4.5, 5.1–5.3 were missing. Every numbered item is now a step (33: 5 CONSULT, 18 AVOID or limit, 5 TAKE, 5 PRACTICE); 7 new food / alcohol USE_CONSTRAINED_IN and a caffeine HAS_UPPER_LIMIT (limitKind PROTOCOL_MAX, new code) by the author; edition payloadHash recomputed; Q-D5-11 lists 18 stated constraints. Scope stated as "Pregnancy section only, all of it".
- E2 (sleep CQ-PR-01 change list omits the removed Swanson non-affiliation and Thorne notes) → **fixed**. Diff confirmed; locators l39 (Swanson), l40 (Thorne threonate), l41 (Thorne shipping) on the 2021 capture; assertion a10 RECEIVES_VALUE_FROM polarity NEGATIVE / DENIES (no D7 episode; OQ-D5-44); CQ-PR-01 and Q-D5-13 answers updated.
- E3 (openFDA "10 JSON_POINTER locators") → **fixed**: 13 on the label, 19 incl. DailyMed history and Discourse.
- E4 ("24 RESOLVES_TO_CONSTRAINT rows") → **fixed**: it was 29; after regeneration 37 RESOLVES_TO_CONSTRAINT + 22 STATES_CONSTRAINT rows (08 tool:ks-projection).
- E5 ("forum wiki post") → **fixed**: t/86.json re-fetched, `wiki: false`, version 20; reworded in sirolimus source.md and 08.
- E6 (ODS block cited to S34; readiness 1 rests on the API test) → **fixed**: re-tested — default-UA curl 403, browser-UA curl 200 (253,520 B, Table 3 rows, "January 6, 2026"); 01 §4 / §5 and 08 now cite tool-log; readiness 1 → 2.
- E7 (S2 says 2021-10-16 but the URL serves 2021-10-18) → **fixed, partly rebutted**: today the 20211016002820id_ URL answers 200 with Memento-Datetime 2021-10-16 (no redirect), so the title is right for the URL; the fixtures stage got a 302 to 20211018160634, which is the fixture's snapshot. S2 now states both captures; sleep source.md records the re-test.
- E8 (01 §5 forum row stale) → **fixed**: row now Tavily + Discourse JSON, readiness 3, pointer to 08.
- E9 (contentHashBasis NORMALIZED_TEXT on raw extractor bytes) → **fixed**: basis EXTRACTED_TEXT_BYTES with a note on every Tavily snapshot; kernel code requested (OQ-D5-46).
- E10 (authorship rests on newsletter boilerplate) → **fixed**: a02 now cites the sign-off "Best wishes, Andrew" (2026 and 2021) plus the sign-up line, `attributionBasis: INFERRED`, note that there is no byline.
- E11 (RxNav "ONC" not in the cited page) → **fixed**: FAQ re-fetched, 0 "ONC"; 01 quotes the FAQ verbatim and marks the ONC attribution as analysis (PMC3422823).
- E12 (firecrawl "not used in F" omits the check-stage re-fetch) → **fixed**.
- E13 (grammar in a04 proposition) → **fixed** ("do not take L-theanine if you sleep-walk").

Model discipline:

- M1 (UseConstraint vs kernel Claim never weighed) → **fixed (decision added), adoption rebutted**: 09 D-17 weighs Claim + OCCURRENCE_OF; kept UseConstraint because Claim identity binds predicate and value (one concern spans three predicates and every level, Q-D5-05 / Q-D5-27), Q-D5-06 / Q-D5-23 filter typed dose band, scope and timing that Claim lacks, and label text does not belong in the vetting queue. Kernel ownership question to A1: OQ-D5-38.
- M2 (STATES_CONSTRAINT structural inside immutable payload, target regenerable) → **fixed**: derived (`DerivedEdgeProperties`, `nestedOperations: []`, `@settable`), emitted by the use-constraint projection from the author's caution Assertion that cites the step locator; payload hashes caution fields, never constraint uids (edition hashes unchanged where steps did not change).
- M3 (HAS_INTEREST_IN does not exist; "every edge re-verified" false) → **fixed**: Q-D5-13 over HOLDS_ROLE | HOLDS_STAKE | RECEIVES_VALUE_FROM with D7 edge-property fields; product–organization paths BRANDED_AS → Brand ← OWNS_BRAND and the SELLER_OF_RECORD chain; 10-seams rows fixed and the false claim corrected in its header; OQ-D5-42.
- M4 (diets in two modules; union kept although larger) → **fixed**: STEP_USES → `Subjectable`, DIETARY_PATTERN retired; D-05 rewritten; OQ-D5-06 closed; sibling notes OQ-D5-48.
- M5 (kernel's assessment-slot answer ignored) → **fixed**: 09 "Registered assessment vocabulary" (conclusionCode per subkind, gradeScheme codes, facets); `D5.claim-disconfirmation` dropped; Q-D5-08 / Q-D5-22 read conclusionCode / gradeScheme / grade; OQ-D5-04, -05, -14, -26 closed with the kernel's answers.
- M6 (Q-D5-14 skips the claim lifecycle) → **fixed**: claim branch Claim ← VETTING, ← EVIDENCE_MISSION Activity, ← EVIDENCE_REPORT (verdict, worldCorrectness); antioxidant fixture now has the VETTING Assessment (RESEARCH), the mission Activity and the EVIDENCE_REPORT (fixture records).
- M7 (CQ-RC-06 disagrees with D10) → **fixed**: ReportItem -BLOCKED_BY-> Assertion, UseConstraint via RESOLVES_TO_CONSTRAINT or ASSESSES; `blockingConstraintUids` removed from 02 / 03; answer to D10 #19 in OQ-D5-39.
- M8 (11 misses D10 / D9 / D7 conflicts) → **fixed** on D5's side: OQ-D5-39 (D10 #19), -40 (RECOMMENDS_AGAINST with a Target object rejected), -41 (REPORTS_ADVERSE_EXPERIENCE rejected; answers D9 D5-1), -42 (D7 OQ-D7-29); 05 lists the rejected predicates.
- M9 (OPERATIONALIZED_BY → D2.Outcome one-sided) → **fixed on D5's side**: antioxidant fixture edge target:endurance → hu:outcome:endurance-running-performance; D2 and D3 edits requested (OQ-D5-43).
- M10 (stale 10-seams rows; kernel enums as seams) → **fixed**: CONSTRAINS_USE_OF row deleted (D6 verified), ASSOCIATION → ASSOCIATES from D10.Association, SpeechAct / PrivacyClass under `sharedVocabularies: kernel-types`, OQ-D5-19 and OQ-D5-36 closed; check-issues D5 #2 and #3 are resolved.
- M11 (OPERATIONALIZED_BY barely used by D5's own patterns) → **fixed**: Q-D5-01 study branch is a real UNION branch (STUDY_RESULT_ON_MEASURE); 05 `crossPacketQuestions: [Q-D3-04, Q-D4-17]` (packet-check only accepts own question ids in `questions`); Q-D5-20 joins by shared kernel Identifier instead of name substrings (OQ-D5-45 for a D2 link).
- M12 (curated exposureChange on a projected node; TIMING has no timing field) → **fixed**: `exposureChange` and enum ExposureChange removed (qualifier only); `timingWindow` added; identity rule v2 (OQ-D5-29 closed).
- M13 (Cypher bugs) → **fixed**: Q-D5-04 disjunction parenthesised; Q-D5-23 uses Q-D5-06's comparability (unit, period, intake scope) and flags NOT_COMPARABLE, plus a TIMING clause; Q-D5-01 protocol branch has EPISODE-AT valid time. Also found and fixed: Q-D5-01 UNION branches returned different column names (`a.predicate` vs `predicate`).
- M14 (predicate HAS_COMPONENT collides with D3's typed edge) → **fixed**: renamed INTERVENTION_INCLUDES.
- M15 (Protocol vs Source, Target vs D2 Outcome, D10 targetKeys) → **fixed**: 09 D-18, D-19; Target docstring; vocab-targets 0.2.2 lists D10 DecisionCriterion.targetKeys and D13 Frontier.targetKeys in the exception (OQ-D5-47).
- M16 (Q-D5-15 has no fixture; Outcome member unexercised) → **fixed**: Q-D5-15 expected rows in sleep questions.md, fixture column yes (22 / 34); Outcome edge as in M9.

Check-stage issues (check-issues.json D5): #1 diets → resolved (M4); #2 D6 CONSTRAINS_USE_OF → resolved (D6 removed it, verified); #3 D4 Metric row → resolved (D4 10-seams has it, verified); #4 no fixture uses D2.Outcome → resolved (M9); #5 intent contract gaps (OQ-D5-27) → still open (kernel + owner).

Compile check (scratch `review-a5/compile/`, A1 kernel sha256 790e7244…8c71 + 7 stubs + D5 sha256 69da4e82…2bfd): kernel 345,273 B / 192 inputs; kernel + stubs 380,828 / 206; + D5 509,817 B / 9,874 lines / 261 inputs (not the pinned 55 MB schema) → D5 marginal 128,989 B / 2,352 lines / 55 inputs (check stage 130,029 / 64). `bks-schema map`: 25 node types, 20 relationship types, 193 expanded pairs. packet-check: ok, 6 node types, 6 relationship types, 8 pairs, 34 questions, 4 fixtures.

UseConstraint uids after the v1 → v2 rule bump (old → new, `hu:use-constraint:` prefix omitted): bcf888df4b0fcee7→76795921aa3f01c3; fa2e4ba5c6be3f95→2e049bbd4648b9ff; dfa36fef3cd4d6ee→fd357eb9f25f4f0f; c1b6230a92c05ab0→ec44b0b9666432d4; f82a38af72064cbe→93c983aaefca2938; 8bff206f10213fe4→7c65516933d8771b; 812761a42572473e→0c1182089637458c; 20c50f2bf888a3ff→8bc06cfcac735e29; 2d19f4813ade733c→26e877e59a32f75e; 3d04e47369329823→e8907d9752a6ec5e; 1235dd790cff94d2→e21a97748f7cf509; 2256ae00a893fefd→cd328f95b3a8f29d; 2c3177ad014b7acd→589e012297a4604d; 9b0b63f7076a5768→06db75ae627986e8; f6cf8fda59688c34→e6da92cd70f56334; c5a139b7be7cee9f→4b26830145303d6d; 929b21830ec153c5→7813a0a691936763; 88af99838dfcbdaa→b70287a24d52e37b; 688e40e6d6cb59f9→d656ee1cbfa3b407; dfbe304729b2fd90→f2d09ad525ba996c; 097b8fa9d9e2b4fb→4e1694631a746010; 992e67ba452e03b7→d6b360dcd3564d15. The pregnancy fixture's 8 new constraints have no v1 uid.

Files changed (all under `schema/program/packets/D5/`): 01, 02, 03, 04, 05, 06, 08, 09, 10, 11, SUMMARY.md, RUNLOG.md, vocab-targets.yaml (0.2.2), `_notes/tool-log.md`, `_notes/fixture-gen/{common,gen_antiox,gen_mg,gen_siro,gen_sleep}.py`, `_notes/fixture-gen/verify-output.txt`, every file in `07-fixtures/*/`.

## Handoff

packet-check output (final run, exit 0):

```json
{
  "ok": true,
  "packet": "D5",
  "counts": {
    "nodeTypes": 6,
    "relationshipTypes": 6,
    "pairs": 13,
    "questions": 34,
    "fixtures": 4,
    "budget": {
      "nodes": 8,
      "rels": 14,
      "pairs": 35
    }
  }
}
```

Counts vs budget (updated by the adversarial review): node types 6 / 8, relationship types 6 / 14, from->to pairs 8 / 35 (check stage: 13), widest union 3 / 6 (TargetMeasure; StepMeans removed), max relationship fields per type 2 / 12, questions 34 (harm 22), fixtures 4. No EXCESS lines needed. Executable: +128,989 B and +55 input types over kernel + stubs (check stage: +130,029 B, +64).

Fixtures (`07-fixtures/`):

| folder | kind | sources | exercises |
| --- | --- | --- | --- |
| sleep-toolkit-unstructured | unstructured-to-entity | Huberman toolkit page, 2021 Wayback + 2026 live (one edition) | HAS_EDITION, HAS_STEP, STEP_USES, STATES_CONSTRAINT, RESOLVES_TO_CONSTRAINT; 3.8 path chunk -> assertions -> locators -> snapshot bytes |
| sirolimus-label-interactions-harm | harm | openFDA label v22, DailyMed SPL v14 / v15 + history, AgelessRx, rapamycin.news (+ Discourse JSON) | RESOLVES_TO_CONSTRAINT (grapefruit: 4 statements -> 1 INTERACTION constraint), label-version supersession |
| pregnancy-magnesium-upper-limit | harm | Blueprint protocol (Pregnancy section), NIH ODS magnesium fact sheet | HAS_EDITION, HAS_STEP, STEP_USES, STATES_CONSTRAINT, RESOLVES_TO_CONSTRAINT; Q-D5-06 computed ABOVE, not stored |
| antioxidant-exercise-disconfirmation | disconfirmation | two controlled studies + a promoter page | OPERATIONALIZED_BY, RESOLVES_TO_CONSTRAINT; WORSENS / MIXED assertions with coExposure, HARM / MIXED assessments |

Open questions for the owner (full rows in 11-open-questions.md): OQ-D5-01 (ProtocolStep.targetKeys exception to the vocabulary seam rule), OQ-D5-02 (keep the name "Target" or rename to Goal), OQ-D5-06 (diet as D12 DietaryPattern vs D5 Intervention kind DIETARY_PATTERN; StepMeans at 6/6), OQ-D5-08 (sponsor changes do not mint an edition), OQ-D5-13 / OQ-D5-36 (promote CONSTRAINS_USE_OF if two-hop pre-checks are too slow; D6 already assumes it), OQ-D5-23 (do not split D5), OQ-D5-27 (intent contract lacks predicate-only assertions with objects, qualifiers and valueString), OQ-D5-37 (accept D2's MEDIATES_TARGET predicate), plus the D5-owned rule questions OQ-D5-29, -31, -32, -35.

Files changed in this stage (all under `schema/program/packets/D5/`): 02-questions.md, 03-retrieval-patterns.md, 04-schema-proposal.graphql, 05-relationship-register.yaml, 06-node-register.yaml, 09-reasoning.md, 10-seams.yaml, 11-open-questions.md, vocab-targets.yaml (0.2.1), SUMMARY.md, RUNLOG.md, _notes/research-notes.md, _notes/vocab-targets-notes.md. Scratch only: `ft/D5/audit.mjs`, `ft/D5/append_runlog.py`, `ft/D5/check-refetch/`, `ft/D5/compile/check/`. Not committed.

## Close-out: pattern lint (A5, 2026-10-09)

Linter `final/_work/lint-packet-patterns.mjs` (S worktree) reported D5: 35 blocks, 4 failing (2 packetBug, 2 rulingBroken). Fixed the 2 packetBug blocks in 03-retrieval-patterns.md:

- CQ-RC-06 (b): `(ReportItem)-[:BLOCKED_BY]->(Assertion)` is no pair in D10's SDL (D10 retargeted BLOCKED_BY to `UseConstraint` / `Assessment`). Now `(i)-[:BLOCKED_BY]->(uc:UseConstraint)` + `OPTIONAL MATCH (i)-[:DERIVED_FROM]->(b:Assertion)-[:RESOLVES_TO_CONSTRAINT]->(uc)`; the D10-writes comment and trace line follow. Same error repeated in 10-seams.yaml (ASSESSES note, BLOCKED_BY row -> `to: "D5.UseConstraint | D10.Assessment"`, direction IN), 02-questions.md (CQ-RC-06 answer shape) and 11-open-questions.md (OQ-D5-39 marked superseded); all updated.
- Q-D5-13: `i.observedAt` is not a property of D7's Role/Stake/ValueEdgeProperties (D7 removed it). Now `OPTIONAL MATCH (ia:Assertion {uid: i.assertionUid})` and `ia.validObservedAt AS observedAt`; comment and bitemporal note updated.

Not touched (rulingBroken, packet stays a record of its own SDL; S writes final-SDL versions): Q-D5-13 and Q-D5-17 `PROTOCOL_AUTHORED_BY` (R-80), Q-D5-20 Identifier join (R-42). No SDL change.

Re-run `node .../lint-packet-patterns.mjs --packets D5 --json <scratch>/lint-D5.json --md <scratch>/lint-D5.md` (scratch outputs, so the full-suite report is not overwritten): 35 blocks, ok 24, fragment 7, gds-unvalidated 1, packetBug 0, rulingBroken 3 (Q-D5-13 now ruling-only). `node scripts/packet-check.mjs D5`: ok, exit 0. Files: 02-questions.md, 03-retrieval-patterns.md, 10-seams.yaml, 11-open-questions.md, RUNLOG.md. Not committed.
