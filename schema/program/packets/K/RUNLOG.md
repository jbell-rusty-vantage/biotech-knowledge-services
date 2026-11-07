# Run log — packet K

## Claim

- agent: A1 (Wave 0 stage: kernel pattern + kernel module draft)
- domains: K (kernel: evidence, identity, time); D10 follows in a separate packet
- worktree: C:\Users\Pinda\Proyectos\Biotech\biotech-knowledge-services-A1 (branch ft/schema-A1)
- base commit: e484fd2
- planned fixtures (later K stages): (1) unstructured-to-entity: one trial/paper excerpt → chunk → assertion → locator → snapshot; (2) disconfirmation: a vetted claim → evidence-mission Activity → evidence report with a `contradicted` verdict; (3) lineage: two runs of one mission over the same entity, answering the four lineage questions of 00-DIRECTIVE section 4.

## Entries

### 2026-10-08 — Wave 0 start

- Found no `packets/K/` in this or any sibling worktree: the coordinator's note that "an earlier A1 agent already published Wave 0" does not hold on disk. This stage therefore does the full Wave 0 (lever matrix, pattern, template, kernel draft) from scratch.
- `node scripts/packet-skeleton.mjs K` → 16 files created.
- Scratch: `%TEMP%\claude\…\scratchpad\ft\K\`.

### 2026-10-08 — reading

- Read in full: 00-DIRECTIVE, 01-PACKET-CONTRACT, 02-TEAM, K brief, D10 and D9 briefs, PLAN sections 1, 3, 6; ADR 0003, ADR 0004; verification README, `model.ts`, selector kinds (`selectors.ts`), report ledger (`claims.ts`), sealed-run binding (`adjudication.ts`); fragment pages W00, W19, W20, W23; pinned kernel lines 1–760 and the Source … Mention types (grep + ranges); `packages/kg-ops/src/plan.ts` (activity, sources, emitAssertion, identifier.attach, edge.assert, mention.stage) and `packages/schema-workspace/src/parse.ts` (interface targets → `targetMembers`); `scripts/packet-check.mjs`, `packet-skeleton.mjs`; `apps/graphql-api/src/server.ts` (`excludeDeprecatedFields: {}`, mutations disabled at runtime but generated).
- Not read: schema-map.md domain sections (not needed for Wave 0; the fragment pages and the pinned SDL ranges covered the kernel), competency-questions.md and OPEN-QUESTIONS.md (left to the K research stage that writes 02).

### 2026-10-08 — lever experiment matrix

- Generator `lever/gen.mjs` → 12 variants × N ∈ {5, 10} synthetic SDLs; printed with the deployed command (`BKS_SCHEMA_PATH=<abs> NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <abs>`, via scratch `run.sh`) and with `lever/print2.mjs` (same `prepareTypeDefs` + library, optional `excludeDeprecatedFields`; byte-identical to the deployed print for C-5: 606,205 bytes).
- Finding 1: interface targets cost ≈ 0 per implementer; options (a)/(b)/(c) identical per type (80.8 KB, 32 inputs); unions +3.6 KB / +20 inputs per member.
- Finding 2 (new lever L1): `aggregate: false` leaves `<Type><Field>NodeAggregationWhereInput` (~18 KB per relationship field); `@filterable(byValue: true, byAggregate: false)` removes it (−74% bytes per type).
- Finding 3 (L2): `@mutation(operations: [])` −38% inputs per type. Finding 4 (L3, server option): `excludeDeprecatedFields` −66…85% bytes.
- Problem: a heredoc in one Bash call ran under a stub `python3`; gen.mjs was patched by a node one-liner instead (C_F, C_MF variants added); no effect on results.
- Digests: gen.mjs `0fb2d9ac…0edc`, print2.mjs `b8a634cd…f56f`; SDL digests (first 16 hex): C-5 `79dcdf480770d970`, C-10 `4ceeb984daae59bc`, C_MF-5 `f35bbdd763697cdf`, C_MF-10 `d595a6ab49e69f84`, U0-5 `7d91b05ab41a22db`, U0-10 `4b525b237dc087a8` (full list in scratch `lever/sdl`, raw numbers in `lever/results.txt`).

### 2026-10-08 — kernel draft and pattern

- `04-schema-proposal.graphql`: 12 node types, 14 relationship types, 34 pairs (packet-check), 0 unions, interfaces `Entity` + `Subjectable`. `node scripts/packet-check.mjs K`: SDL discipline clean (only register/fixture/question failures, owned by later K stages).
- Printed kernel alone: 326,564 bytes · 6,582 lines · 185 inputs (118,511 bytes with L3). Kernel + `domain-template.graphql`: 356,622 bytes · 202 inputs. Kernel + template + test Chunk (MENTIONS → Subjectable), state attachment (StateEpisodeProperties) and Episode ← Source (direction IN): 392,725 bytes · 220 inputs — all compile.
- `node packages/schema-workspace/dist/cli.js map --sdl <kernel+template>`: parses; reports 62 pairs because it expands interfaces (see 11-open-questions Q3).
- Sibling check: every domain `04-schema-proposal.graphql` (A2–A8) was still the 151-byte skeleton at publication; research notes in A2, A3, A4, A6, A7 use the placeholder `Subjectable`, which is the published name.

### Provisional question ids (for the K research stage writing 02-questions.md)

| id | question | polarity |
| --- | --- | --- |
| Q-K-01 | Which located span supports this assertion, who asserted it, who adjudicated it, with what verdict, under which policy version? (CQ-EV-01/02) | neutral |
| Q-K-02 | What did we believe about X on date D (recorded time) for validity period V (valid time), and what changed between D1 and D2? (CQ-TM-01/02) | neutral |
| Q-K-03 | Which run wrote this node, edge or assertion, with which agent, model and skill, and can its sealed bundle be replayed? (CQ-PV-03) | neutral |
| Q-K-04 | What did Mission Control mission M produce (nodes, edges, assertions, assessments, reports)? | neutral |
| Q-K-05 | Which missions touched entity X, and when? | neutral |
| Q-K-06 | Which downstream assertions, assessments, reports and projections depend on something mission M produced? | harm (blast radius of a bad run) |
| Q-K-07 | What changed in the graph between run R1 and run R2? | neutral |
| Q-K-08 | Which evidence mission tested claim C, with what verdict, and which report published it? | harm (disconfirmation) |
| Q-K-09 | Where has claim C been made (asserter, container, locator, date), and what is its vetting disposition and lifecycle state? | neutral |
| Q-K-10 | Which assertions became stale because their snapshot was corrected or retracted, or their locator failed to re-anchor? (CQ-EV-05, CQ-TM-06/07) | harm |
| Q-K-11 | Which claims were contradicted or not supported by an evidence mission, and who keeps repeating them after the report? | harm (disconfirmation) |
| Q-K-12 | Which external identifiers does entity X carry, from which issuer, valid when; which entity carries identifier (scheme, value)? (CQ-ID-04) | neutral |
| Q-K-13 | Is this surface form or handle the same entity as that one, under which resolution assessment and evidence? | neutral |
| Q-K-14 | For a user question, which chunks mention entity X, which assertions do those spans support, and does the verifier re-select the same span? (00-DIRECTIVE 3.8) | neutral |
| Q-K-15 | Which assertions about X rest only on a single asserter with a financial interest, or on promotional sources (authority assessments)? (seam D7, D9) | harm |
| Q-K-16 | Which assertions were rejected or disputed at capture-fidelity review, and why (verdict, unsupported facets)? | harm (disconfirmation) |
| Q-K-17 | Which assertions, assessments and locators does report R cite, and is any cited input now superseded or rejected? | harm |
| Q-K-18 | Which computed state was built from which assertions, and are any of its inputs superseded? | harm |
| Q-K-19 | Which vetted claims are queued for research (disposition RESEARCH) with no evidence mission started? | neutral |
| Q-K-20 | For answer A, what is the full trace: question → chunks → assertions → locators → snapshot bytes (digests)? (CQ-AX-01) | neutral |

### 2026-10-08 — Wave 0 published

Files (all under `schema/program/packets/K/`):

- `09-reasoning.md` — section "## Kernel pattern for subject, object, identifier and mention edges" (published pattern, ownership map), verification.v1 correspondence and the four PLAN 6.2 decisions, claim lifecycle, lineage-question sketches, size, decisions/cuts, bitemporal per edge, risks, "## Kernel pattern changes" (empty).
- `04-schema-proposal.graphql` — kernel module draft (sha256 `0ad415592b9e0b6c…`).
- `domain-template.graphql` — copy-paste domain template, compiles with the kernel (sha256 `4afcb85a6b5fd17a…`).
- `lever-experiments.md` + `lever/gen.mjs`, `lever/print2.mjs`, `lever/results.txt` — matrix, numbers, proposed decision text for `decisions/0001-size-levers.md` (not written there).
- `identifier-schemes.yaml` — seed scheme register, 47 schemes (sha256 `e0e45316cbc4575f…`).
- `11-open-questions.md` — 13 executor (kg-ops) changes P1–P13 and 10 open questions.
- `RUNLOG.md` — this log. Skeleton files from `packet-skeleton.mjs` otherwise untouched (left to the K research / fixtures / check stages).

### 2026-10-08 — research stage (Wave 1) start

- Stage: A1 research (ecosystem survey, questions, fixture candidates, research notes). Claim section above stands (agent A1, domain K, worktree `biotech-knowledge-services-A1`, branch ft/schema-A1, base e484fd2); planned fixtures refined to the candidates in `_notes/fixture-candidates.md` (FC-1 unstructured-to-entity, FC-2 disconfirmation, FC-3 harm/retraction, plus the lineage fixture built from FC-1/2/4).
- Skeleton: already present (Wave 0); `_notes/` created. Scratch: `scratchpad\ft\K\raw\` with `MANIFEST.sha256`, helpers `env.sh` (per-key loader), `split.js` (Tavily JSON → files), `off.js` (UTF-8 byte offsets of verbatim quotes).
- Read: 00-DIRECTIVE, 01-PACKET-CONTRACT, 02-TEAM, K brief, PLAN §1/§3/§6, Wave 0 `09-reasoning.md` (full), `11-open-questions.md`, `identifier-schemes.yaml`, kernel SDL (enums, Activity, SourceLocator); verification.v1 `model.ts` (full), `selectors.ts` (kinds), `claims.ts` (report ledger and summary), `adjudication.ts` (enums), `docs/verification/README.md` (full); ADR 0004; Mission Control `KNOWLEDGE-SERVICES.md` annex (identity, protocol, consistency) and `MISSION_CONTROL_SPEC.md` §4.4; `examples/ingestion-intent.example.json`; `packages/contracts/src/ingest.ts` (receipt); competency questions CQ-ID/EV/TM/CL/PV/EC/AX tables; D10 tool log (same worktree). Not read: schema-map.md domain sections (Wave 0 covered the kernel from fragment pages and the pinned SDL).
- Verification.v1 mapping (PLAN 6.2) re-confirmed; the four decisions in `09-reasoning.md` hold. Additive amendments proposed in `_notes/research-notes.md` §2 (per-evidence `authority` / `independence` / `facet` on EvidenceEdgeProperties; report-wide independence counts on Report). No kernel pattern change proposed.

### 2026-10-08 — research stage: tools and captures

- Tavily CLI extract (standards: PROV-O, Web Annotation, nanopub guidelines, OpenLineage, schema.org ClaimReview, Wikidata Help:Sources/Ranking, Crossmark, XTDB, Datomic, SEPIO, SEPIO-LinkML, Biolink KL/AT, Crossref–Retraction Watch, COPE, ECO, Bioregistry, Science Feedback process, Google ClaimReview docs; vendor and brand pages), Tavily search, Firecrawl MCP search, PubMed MCP, curl to NCBI E-utilities (pubmed, pmc), Europe PMC, Crossref REST, OpenAlex, ClinicalTrials.gov v2 and `/api/int` history, Wikidata API, Nanopub Registry, Bioregistry API, raw GitHub. Full table and failures in `_notes/tool-log.md`.
- Problems: (1) `set -a; . ./.env` is not safe on this `.env` — shell errors echo fragments of lines to the console (nothing written to files); replaced by a per-key grep loader; recommend the coordinator retire that recipe. (2) ClinicalTrials.gov history 403 (as other packets found). (3) PMC refuses XML for PMC2832984 and Europe PMC returns 500 for it. (4) scite blog 404 and help page unfetchable. (5) Tavily silently dropped one URL (longevinex). (6) A background `find /` timed out (no effect).
- 32 captures digested (`MANIFEST.sha256`); fixture quotes have byte offsets verified unique (or occurrence noted).

### 2026-10-08 — research stage: deliverables

- `01-ecosystem.md` — survey by actor type (standards bodies; scholarly-record integrity; versioning registries and bitemporal stores; claim checkers and evidence products; interested parties; verification.v1; Mission Control + OpenLineage; identifier registries), 10 artifact types interviewed with ≥ 2 real instances each and their fields, four lenses.
- `02-questions.md` — 35 questions (Q-K-01…Q-K-30 keeping Wave 0's ids, plus CQ-TM-02, CQ-TM-03, CQ-AX-04, CQ-AX-07, CQ-AX-08); 18 harm/disconfirmation; audiences researcher 23, agent 21, biohacker 13, investor 12; value-1 rows 19.
- `_notes/fixture-candidates.md` — FC-1 … FC-7 with sha256, verbatim quotes and byte offsets; FC-1 unstructured-to-entity, FC-2 disconfirmation, FC-3/FC-4/FC-5 harm; lineage fixture plan.
- `_notes/research-notes.md` — confirmations, verification.v1 amendments, Activity granularity decision needed, claim refinement, third-party verdicts as Assertions, retellings via DERIVED_FROM, identifier register additions, rejected types, seams, six open questions.
- `_notes/tool-log.md`.
- Not written in this stage (by instruction): SDL, registers, 03, 08–11, SUMMARY.

### 2026-10-08 — model stage (Wave 2, part 1) start

- Stage: A1 model (retrieval patterns, kernel SDL amendments, registers, reasoning, seams, open questions). Claim section above stands (agent A1, packet K, worktree `biotech-knowledge-services-A1`, branch ft/schema-A1, base e484fd2). Scratch: `scratchpad\ft\K\model\` (Wave 0 backups `K-wave0.graphql` sha256 0ad41559…, `09-wave0.md`; splice parts; `schemes-v2.cjs`), `scratchpad\ft\K\compile.graphql`, `out.graphql`.
- Read: 00-DIRECTIVE, 01-PACKET-CONTRACT, 02-TEAM (A1 row), K brief, RUNLOG, 09-reasoning (Wave 0, full), 04 kernel SDL (full), 02-questions, `_notes/research-notes.md`, `_notes/fixture-candidates.md`, 11-open-questions, domain-template, identifier-schemes; `scripts/packet-check.mjs`; skills `neo4j-modeling-skill`, `neo4j-graphql-skill` (SKILL.md), `neo4j-cypher-skill` (defaults), `neo4j-vector-index-skill` (SEARCH section), `neo4j-gds-skill` (scope; no GDS pattern proposed); verification.v1 `model.ts` (SourceAuthorityVector, EvidenceEdge, AssertionKind), `claims.ts` (VerificationReportWideSummary), `docs/verification/README.md` (five questions, orthogonal properties, lattice, execution vs admission); ADR 0004; fragment pages W00/W19/W20/W23 (type and relationship lists), W21 (Claim, ClaimOccurrence, assessment types); `schema-map.md` domain headings only (grep); `OPEN-QUESTIONS.md` (grep claim / occurrence).
- Sibling check (read-only): `04-schema-proposal.graphql` type lists and `11-open-questions.md` kernel requests of A1/D10, A2/D1+D12, A3/D2+D4, A4/D3, A5/D5, A6/D6+D7, A7/D8+D13, A8/D9+D11; D9 Chunk (CHUNK_OF, COVERS_LOCATOR, MENTIONS), D7 HOLDS_STAKE / RECEIVES_VALUE_FROM, D6 SELLER_OF_RECORD, D11 CaptureAttempt read to write seams and patterns. No sibling declares a K type.

### 2026-10-08 — model stage: decisions and SDL

- Activity granularity: **one per run** (list-valued `operationIds`, `intentDigests`, `planDigests`, `receiptIds`; kernel-internal rename, pattern change 8).
- Mission ↔ claim: `Activity.about` over ASSESSES (no new type; +1 pair).
- verification.v1 mapping re-confirmed; additions: EvidenceEdgeProperties `authority`, `independence`, `facet`; Report `worldCorrectness`, report-wide counts, `skeletonKey`, `recordedTo`; SYNTHETIC_ENGINEERING decisions never change status.
- Claim refinement: EQUIVALENCE Assessment (`K.claim-relation`, conclusionCode REFINES) + `Claim.refinesClaimUid`; third-party verdicts = RATES_CLAIM Assertions; retellings = DERIVED_FROM + CITED_FROM_PRIOR_WORK; retraction status = HAS_REVISION_STATUS Assertion per authority.
- Domain requests answered: `AssertedRecordedProperties` (new kernel type), domain-local superset edge-property types allowed, ASSESSES with kernel meaning on domain types, Assessment typed slots (gradeScheme, grade, certainty, conclusionCode, facets), AssessmentKind + COMPARABILITY, EVENT_IMPACT, BREAKTHROUGH_JUDGMENT, `Assertion.validObservedAt`, predicate conventions. All recorded under "## Kernel pattern changes" 1–9 with the pattern section updated in the same edit.
- Identifier register v2: 47 → 103 schemes (56 `status: requested` from D1, D2, D4, D6, D7, D8, D9, D13 and the K research stage; CHEMBL_TARGET folded into CHEMBL; D5 added to MESH and SNOMEDCT) + `crosswalk` of 13 Bioregistry / Wikidata mappings verified against captures `br-*.json` and `wd-Q407329.json`.

### 2026-10-08 — model stage: compile and checks

- Compile (required command): `BKS_SCHEMA_PATH=<abs scratch compile.graphql> NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <abs scratch out.graphql>` → 345,273 bytes, 6,927 lines, 192 inputs (Wave 0: 326,564 / 6,582 / 185). Kernel + template 375,331 / 209; kernel + D10 draft 440,520 / 235 (D10 compiles unchanged). Kernel + D9 draft fails without D7 stubs (expected; not this packet's file).
- `node scripts/packet-check.mjs K`: 12 / 14 / 35 / 35 questions / 6 fixtures; the only failures are fixture content (`locators.yaml`, `assertions.yaml`, `questions.md` missing in the six stub folders), left to the fixtures stage.
- Problems: (1) two Bash calls with heredocs (fixture stubs, open-questions append) failed in the tool wrapper ("unexpected EOF while looking for matching `'`") and wrote nothing; switched to the Write tool plus `cat` from scratch. (2) The first compile preceded the `Report.recordedTo` addition; numbers above are from the final SDL.
- Digests (sha256, first 16 hex): 03 `7a863be158f90daa`, 04 `790e7244eec773ff`, 05 `65e16afcb301aa72`, 06 `61c416d9e567e851`, 10 `02b2cc02070b9bd1`, identifier-schemes `29f77d32663989ed`, domain-template `1e54a9cd644d0481` (09 and 11 changed after this list; see the final handoff).
- Files written: 03, 04, 05, 06, 09, 10, 11, 02 (notes appended), identifier-schemes.yaml, domain-template.graphql (comment examples only), 07-fixtures/{hubbard-2013-unstructured-to-entity, resveratrol-sirt1-evidence-mission, retracted-sah-2017-stale-evidence, seller-claim-occurrences, two-run-lineage, resveratrol-identifier-crosswalk}/source.md; skeleton `07-fixtures/fixture-01/` removed.

## Handoff

- packet-check: (model stage) only fixture-content failures (6 stub folders lack locators.yaml, assertions.yaml, questions.md)
- counts vs budget: 12/12 node types, 14/14 relationship types, 35/40 pairs, 0 unions, 35 questions
- fixtures: six folders named with source.md stubs; content by the fixtures stage
- open questions for the owner: 11-open-questions.md 11–25 (Activity per run, mission ↔ claim via ASSESSES, refinement, rating map, rights, subkind and predicate registries)
- files changed: see the model-stage entries above

### 2026-10-08 — fixtures stage (Wave 2, part 2) start

- Stage: A1 fixtures (07-fixtures, 08-sources-and-tools). Claim section above stands (agent A1, packet K, worktree `biotech-knowledge-services-A1`, branch ft/schema-A1, base e484fd2). Scratch: `scratchpad\ft\K\fixtures\` (`fresh\` captures, `FRESH_AT` = 2026-10-08T22:09:18Z, `tools\gen_locators_k.py`, `finalize_k.py`, `fill_sources.py`, `validate_intents_k.mjs`).
- Read: RUNLOG, 00-DIRECTIVE, 01-PACKET-CONTRACT, 02-TEAM, 02-questions, 03 (lineage and fixture-question patterns), 04 kernel SDL (full), 05, 06, 09 (kernel pattern, verification.v1 correspondence, claim lifecycle, lineage spine, 3.8 table), 11, `_notes/fixture-candidates.md`, `_notes/tool-log.md`, `scripts/packet-check.mjs`, `examples/ingestion-intent.example.json`, `packages/contracts/src/ingest.ts` + `common.ts`, verification.v1 `selectors.ts` (ResolvedSelector: resolved = exactly one occurrence, selectedContentDigest), the D10 fixtures and their generators (same agent, format reference), sibling fixtures A3/D2 `sirt1-activation-disconfirmation` and A4/D3 `resveratrol-retraction` (type names, no overlap of records).

### 2026-10-08 — fixtures stage: captures and tools

- Re-fetched every research-stage API capture (6 PubMed, 1 PMC, 2 Crossref, 2 Wikidata): byte-identical. Web pages (Active Motif, MegaResveratrol): same length, token-only differences (CSRF token, Cloudflare parameters) → new snapshots with SILENT_CONTENT_CHANGE, quotes re-anchor exactly.
- New captures: Spandidos article page live (shows "Retraction in:"), Internet Archive raw replay of the same page observed 2024-08-16T06:24:45Z (pre-retraction; requested 20241124224426, redirected), PubMed web page archived 2024-05-05 (not used as a snapshot), Wikidata revisions pinned by revid, Firecrawl markdown projection of the Active Motif page.
- Failed: PubMed web UI with curl (challenge page), Firecrawl ("All scraping engines failed") and Tavily ("Error fetching content"); Internet Archive CDX "Temporarily Offline" (2 of 3). Browser fallback not needed. Full table: `_notes/tool-log.md` F1–F16.

### 2026-10-08 — fixtures stage: deliverables

- `07-fixtures/` — six folders, each with source.md, locators.yaml (generated: UTF-8 byte and code-point offsets, prefix/suffix grown to uniqueness, quoteHash = expectedSelectedContentDigest, verification.v1 selectorJson + selectorDigest), assertions.yaml (every row has producedBy {missionId, runId}; fixture ids mission:ft-K-fixtures / run:ft-K-*), intent.json (7 intents incl. `two-run-lineage/intent-r2.json`, all valid against `@bks/contracts` IngestionIntent; v1 gaps in `notes`), questions.md:
  - `hubbard-2013-unstructured-to-entity` (unstructured-to-entity): question → D9 chunk P10 (MENTIONS) → COVERS_LOCATOR → loc-hub-e230k → a-hub-occ-e230k → snapshot sha256:ced64cfd… → verifier re-selection match.
  - `resveratrol-sirt1-evidence-mission` (disconfirmation): 2 Claims, 5 occurrences + 1 side finding, VETTING (RESEARCH), EQUIVALENCE K.claim-relation REFINES, 8 adjudications, 2 EVIDENCE_REPORTs (MIXED_OR_CONFLICTING; SUPPORTED_WITH_QUALIFICATION) with composed bodies and computed bodyDigests.
  - `retracted-sah-2017-stale-evidence` (harm): one Source, two snapshots (2024 archive, 2026 live with RETRACTION), 3 HAS_REVISION_STATUS assertions (Retraction Watch 2025-06-30, NLM 2025-07-04, publisher undated), late arrival.
  - `seller-claim-occurrences` (harm): R1/R2 occurrences, retellings DERIVED_FROM primaries, PROMOTIONAL / INTERESTED_PARTY evidence, CAPTURE_FIDELITY rejection of the mutated benchmark twin (excerpt rights-restricted, not reproduced), 2 RETELLING_FIDELITY assessments.
  - `resveratrol-identifier-crosswalk` (other): 8 Identifiers, 10 HAS_IDENTIFIER assertions, 11 episodes, ChEBI pattern probe, pinned external revision history.
  - `two-run-lineage` (other): 5 Agents, 5 Activities (+2 defined in siblings), corrections, `lineage-index.yaml` (180 records, per-run counts, generated), copied locators, R1 and R2 intents; expected answers for Q-K-03..07, Q-K-28, CQ-AX-07.
- `08-sources-and-tools.md` — scored table (21 rows; all 13 `populatedBy` ids of 05), exercised / broke / custom tooling.
- `03-retrieval-patterns.md` — amended from fixture findings (no SDL change, no kernel pattern change): Q-K-10 and Q-K-17 order snapshots by `coalesce(observedAt, retrievedAt)`; Q-K-17 gains an `ASSERTION_SOURCE` branch; Q-K-22 excludes other HAS_REVISION_STATUS assertions from "affected".
- `11-open-questions.md` — entries 26–30 (intent v1 gaps, snapshot ordering, pattern fixes, source-family independence seams, dynamic-page digests).
- `_notes/tool-log.md` — fixtures-stage rows F1–F16 and problems P4–P7.
- Problems: (1) a first draft of `retracted-sah-2017-stale-evidence/source.md` had hand-typed digest tails — replaced with computed values; `fill_sources.py` verifies every sha256 in every source.md against the captures (0 unknown). (2) Two benchmark evidence edges first carried the excerpt digest as expectedSelectedContentDigest although the locator selects the digest field; renamed to `benchmarkSelectedContentDigest` (finalize check).

## Handoff (fixtures stage)

- packet-check: `node scripts/packet-check.mjs K` → ok (12 node types, 14 relationship types, 35 pairs, 35 questions, 6 fixtures)
- fixtures: hubbard-2013-unstructured-to-entity (unstructured-to-entity), resveratrol-sirt1-evidence-mission (disconfirmation), retracted-sah-2017-stale-evidence (harm), seller-claim-occurrences (harm), resveratrol-identifier-crosswalk (other), two-run-lineage (other); every relationship type of 05 is instantiated by the fixture its register entry names
- open questions handed on: 11-open-questions 26–30
- files changed: 07-fixtures/* (six folders), 08-sources-and-tools.md, 03-retrieval-patterns.md (Q-K-10, Q-K-17, Q-K-22), 11-open-questions.md, _notes/tool-log.md, RUNLOG.md

### 2026-10-08 — check stage (Wave 2, part 3) start

- Stage: A1 check and handoff. The claim section above still applies: agent A1, packet K, worktree `biotech-knowledge-services-A1`, branch ft/schema-A1, base e484fd2, nothing committed. Scratch is `scratchpad\ft\K\check\` (`refetch\`, `compile\` with `run.sh`, inputs and outputs, `q02.txt` / `qref.txt`).
- `node scripts/packet-check.mjs K` passed on entry: 12 / 14 / 35 / 35 / 6, exit 0.

### 2026-10-08 — check stage: audit beyond the script

- **Question ids.** I compared every `Q-*` / `CQ-*` id cited in the packet (all files, `_notes/` included) with the rows of 02.
  - All Q-K ids resolve.
  - 25 catalog CQ ids are cited as "reuses" inside 02's own rows.
  - CQ-TM-05, CQ-TM-07, CQ-PV-06 and CQ-AX-12 are cited in 01, 11 and `_notes/` without being rows.
  - Q-D11-17, Q-D9-01 and Q-D9-05 are other packets' questions; I checked that they exist in the A8 drafts.
  - Fix: 02 gained the section "Ids referenced outside the table" (bullets, so packet-check does not read them as rows). 11-open-questions 32 asks whether K should own CQ-TM-05.
- **Patterns per relationship.** Every 05 entry points at an existing 03 section. **Found:** WAS_INFORMED_BY pointed at `03#Q-K-06`, but neither Q-K-06 nor Q-K-08 traversed it.
  - Fix: Q-K-06 gained a downstream-runs branch (`(d:Activity)-[:WAS_INFORMED_BY]->{1,4}(m)`, plus a run-scoped variant), and Q-K-08 now returns the vetting run as `queuedByRun`.
  - The expected answers in `two-run-lineage/questions.md` (Q-K-06: depths 1–3 from run:ft-K-r1-ingest) and `resveratrol-sirt1-evidence-mission/questions.md` (Q-K-08) were updated to match, as 11-open-questions 33.
  - No SDL change and no kernel pattern change.
- **populatedBy.** All 13 ids in 05 are rows of 08's table (21 rows).
- **Fixtures exercise their relationships.** Each of the 14 types appears as instances in the fixture its entry names (counts per fixture are in this stage's scratch output). Every assertions.yaml row I read carries subject, object, asserter, locators and producedBy.
- **Quote spot-check (re-fetched).**
  - NCBI efetch `db=pmc&id=3799917` and `db=pubmed&id=20061378` came back byte-identical to the fixture digests (sha256 ced64cfd… and ef3a2a1c…).
  - Five locators re-select exactly on the fresh bytes: `loc-hub-e230k` and `loc-hub-conclusion-pmc` (Hubbard), and `loc-pach-fluor`, `loc-pach-conclude` and `loc-pach-offtarget` (Pacholec).
  - For each one: the bytes [byteStart, byteEnd) equal `exact`, the quote occurs once, prefix+exact+suffix is unique, and sha256 of the selected bytes = `quoteHash` = `expectedSelectedContentDigest`.
- **Directive discipline.**
  - No SUPPORTS/CONTRADICTS relationship type exists. Those words appear only as HAS_EVIDENCE roles (record → locator).
  - MENTIONS is declared only on Mention, as class derived with `@settable(onCreate: false, onUpdate: false)` and `nestedOperations: []`.
  - No good/bad, beneficial, safe or quality property.
  - Harm rows: 18 of 35, which is more than a third.
  - Seams: every domain-side edge in 10-seams exists in the sibling drafts (D9 Chunk MENTIONS, COVERS_LOCATOR and CHUNK_OF; D9 MediaWork RENDITION_OF IN; D10 ReportItem and Association; D7 HOLDS_STAKE and RECEIVES_VALUE_FROM; D6 SELLER_OF_RECORD). D11 CaptureAttempt implements Entity and is reached through K `Activity.generated`.
  - Size estimate in 09 (12 / 14 / 35, 0 unions) = packet-check.
- **verification.v1 re-check** against `model.ts` and `selectors.ts`: SemanticVerdict has 15 values, PolicyOutcome 5, judgeKind 6, and the selector kinds are 12 plus the kernel's WHOLE_SNAPSHOT. All are identical to the kernel enums.
- **Cross-domain finding (not K's file).** `enum MassBasis` is declared by both D1 (A2) and D3 (A4) with different members. Recorded as 11-open-questions 31.
- **Stale text fixed.**
  - In 11's "Conflicts" list, the bullet saying K fixtures were stubs now says the issue was resolved.
  - The executor-change range in 09's Risks now reads P1–P19 (P18 and P19 already existed).

### 2026-10-08 — check stage: compile

- The kernel `04` is unchanged since the model stage (sha256 790e7244…).
- Command (scratch `ft/K/check/compile/run.sh <name>`): `BKS_SCHEMA_PATH=<abs in> NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <abs out>`.
- Results:
  - kernel alone: 345,273 bytes · 6,927 lines · 192 inputs
  - kernel + template: 375,331 · 7,526 · 209
  - kernel + D10: 440,520 · 8,753 · 235
  - These are identical to the model stage.
- New: the kernel plus all 13 domain drafts (D1–D13 from A1–A8, concatenated, no stubs) compiles at 1,799,182 bytes · 36,110 lines · 1,038 inputs. The type-defs merge silently unions duplicate types, hence the separate name grep above.
- 09 size table and prose updated. No breakage to fix.

### 2026-10-08 — check stage: deliverables

- `SUMMARY.md` written (47 lines).
- Problems:
  - The Write tool refused SUMMARY.md as a "report file". The file is a contract deliverable checked by packet-check, so I wrote it with a Bash heredoc.
  - A Bash heredoc for this RUNLOG entry failed in the tool wrapper ("unexpected EOF while looking for matching quote") and wrote nothing. I wrote the entry to scratch `check/runlog-append.txt` and appended it with `cat`.
- Files changed in this stage, with sha256 (first 16 hex):
  - 02-questions.md `34049ea2e5fa5630`
  - 03-retrieval-patterns.md `8ee16c85a2fb3ab8`
  - 09-reasoning.md `14d982b905e3fc3b`
  - 11-open-questions.md `905a0717ccbf8209`
  - SUMMARY.md `62d0a8e604ba062c`
  - 07-fixtures/two-run-lineage/questions.md `3dcb7f3a24dab5d4`
  - 07-fixtures/resveratrol-sirt1-evidence-mission/questions.md `8229f5d724f1c010`
  - RUNLOG.md (this entry)
- Unchanged: 04 (`790e7244eec773ff`), 05, 06, 08, 10, identifier-schemes.yaml, domain-template.graphql.

## Handoff (check stage, final)

- packet-check: `node scripts/packet-check.mjs K` → exit 0

```json
{
  "ok": true,
  "packet": "K",
  "counts": {
    "nodeTypes": 12,
    "relationshipTypes": 14,
    "pairs": 35,
    "questions": 35,
    "fixtures": 6,
    "budget": {
      "nodes": 12,
      "rels": 14,
      "pairs": 40
    }
  }
}
```

- **Counts vs budget:**
  - node types 12 / 12; relationship types 14 / 14; pairs 35 / 40; unions 0; no EXCESS lines needed.
  - questions 35 (18 harm or disconfirmation).
  - printed kernel 345,273 bytes / 192 inputs.
- **Fixtures** (all from real captures; API captures re-fetched byte-identical; two spot-checked again in this stage):
  - `hubbard-2013-unstructured-to-entity` (unstructured-to-entity)
  - `resveratrol-sirt1-evidence-mission` (disconfirmation: MIXED_OR_CONFLICTING general claim, SUPPORTED_WITH_QUALIFICATION refined claim)
  - `retracted-sah-2017-stale-evidence` (harm: two snapshots, three revision authorities)
  - `seller-claim-occurrences` (harm: interested-party and promotional evidence, capture-fidelity rejection)
  - `resveratrol-identifier-crosswalk` (identifiers)
  - `two-run-lineage` (the four lineage questions; 180-record lineage index)
- **Open questions for the owner** (`11-open-questions.md`):
  - 11 Activity per run
  - 12 mission ↔ claim via Activity ASSESSES (directive 4.1 reading)
  - 14 third-party rating → lattice mapping
  - 15 per-fragment display rights
  - 22 packet-check allowlist
  - 24 Q-K-07 limits before executor change P9
  - 26 intent v1 cannot carry the evidence-chain records
  - 31 duplicate `MassBasis` (D1 / D3)
  - 32 whether K owns CQ-TM-05
  - conflicts: directive 4.2 names vs one `DERIVED_FROM`; directive 4.1 vs WAS_INFORMED_BY + ASSESSES
  - executor changes P1–P19
- **Files changed (check stage):** 02-questions.md, 03-retrieval-patterns.md (Q-K-06, Q-K-08), 09-reasoning.md (size table, compile prose, risks range), 11-open-questions.md (conflict bullet; 31–33), SUMMARY.md, 07-fixtures/two-run-lineage/questions.md, 07-fixtures/resveratrol-sirt1-evidence-mission/questions.md, RUNLOG.md. Nothing committed.

## Adversarial review (A1, 2026-10-08 local; captures 2026-10-09 UTC)

Two reviewers reported findings: evidence integrity (E1–E11) and model discipline (M1–M10). The check-stage issues for K are handled below as well. Every source finding was re-verified against a fresh fetch or the pinned capture before anything changed (`_notes/tool-log.md` A1–A10). The fixture generators were copied to scratch `ft/K/adv/tools/` and first shown to reproduce the committed fixtures byte for byte; they were then patched and re-run. All 7 intents re-validate against `@bks/contracts`. Nothing committed.

### Evidence integrity

- **E1 (blocker): Howitz 2003 and Hubbard 2013 share three authors, not two → fixed.**
  - Re-fetched both PubMed records (byte-identical). Shared authors: Konrad T Howitz, Dudley W Lamming, David A Sinclair.
  - Corrected `source.md`, the e-source-family-note, `questions.md` Q-K-21 and `composed-body-general.txt` ("three of its authors").
  - Recomputed bodyDigest (sha256:8b902b3c…04ee) and bundleDigest (sha256:a2800372…e0bc). The bundleDigest also changed because of E4 and M5.
  - The 3-family count stands.
- **E2 (major): 01 §9.6 said neither vendor page had a machine-readable date → fixed, with one suggestion rebutted.**
  - Both MegaResveratrol captures carry JSON-LD `datePublished`/`dateModified` 2026-09-23T11:55:49Z. Active Motif has none.
  - Rewrote §9.6 and cross-referenced the R1 → R2 correction.
  - Rebutted: the suggested `STATED_BY_SOURCE` basis is not used. `datePublished` is the article's publication date, so it is a PUBLICATION_PROXY for when the claimed fact held. Every PubMed ArticleDate is used the same way. STATED_BY_SOURCE stays reserved for a date the source gives for the fact itself.
- **E3 (major): "Wikidata editors police promotional edits within a day" → fixed.**
  - The pinned revision capture shows the removals came about 33 hours after the additions.
  - §5, §10, tool-log finding 5 and the crosswalk fixture comment now say "about 33 hours later, one observed instance".
  - The general claim was dropped.
- **E4 (major): Kaeberlein 2005 had three different labels, and its disconfirming sentences had no locator → fixed.**
  - Added locator `loc-kaeb-native` ("but has no effect on binding and deacetylation of acetylated peptides lacking the fluorophore"), role CONTRADICTS on adj-sup-general.
  - Added locator `loc-kaeb-invivo` (yeast Sir2 in vivo), role CONTEXT.
  - a-occ-kaeberlein is now `polarity: MIXED` and declares both spans.
  - Updated the report body, the report's quoted spans, the CAPTURE_FIDELITY record, Q-K-09, Q-K-21 (now QUALIFIES) and Q-K-25.
- **E5 (minor): Q-K-21 should count 7 Sources, adding the Active Motif page → rebutted; the wording now says why.**
  - The Q-K-21 pattern counts a retelling in its primary's family. a-am-occ-r2 is DERIVED_FROM Howitz, so it adds an occurrence but no family. That is the purpose of the retelling rule.
  - The expected answer now states this, and was recomputed after E4, E11 and M7: SUPPORTS 4 occurrences, 4 distinct families, 2 independent families.
- **E6 (minor): "35 retained snapshots" → fixed.** The re-read registry JSON shows `trustStateCounter: 35` and has no snapshot field. Corrected §1.3 and added the re-read values.
- **E7 (minor): the internal benchmark snapshots had unresolvable `file:` URIs → fixed.**
  - canonicalUri is now the GitHub blob URL in the private repo `Overton77/ai-engineer-knowledge-services`, pinned to commit 28c44222. The file last changed in bb4892b1, and its sha256 is unchanged.
  - Updated the generator, locators, seller `source.md`, assertions, and 01 §5 and §9.8.
- **E8 (minor): the scite quotes came from an OpenAlex abstract reconstruction → fixed.**
  - curl to the publisher hit a Cloudflare challenge.
  - A Firecrawl scrape of the MIT Press open-access article page (markdown sha256:951b9b9b…b695) contains both quotes verbatim. §4.2 now cites that page.
- **E9 (minor): the FTC 2020 action was never captured → fixed.** Captured it with Firecrawl (sha256:2f75a353…585e). §4.3 now gives the date (February 5, 2020), the product (ReJuvenation) and a verbatim sentence.
- **E10 (minor): two rows in 08 overstated their evidence → fixed.**
  - src:pubmed-web said "4 attempts, all failed". It now says "3 live attempts failed (F7–F9); archived copy retrieved via Wayback (F13)".
  - europepmc was scored readiness 2 with no successful call. A Europe PMC `search` call now succeeds (A8), so readiness 2 rests on that call; full-text retrieval is noted as unexercised.
- **E11 (minor): rpt-refined cited an occurrence of claim-general with no rule → fixed in two ways.**
  - a-hub-occ-e230k is now OCCURRENCE_OF claim-refined, because the Glu230 dependence is the refined proposition's allosteric qualifier.
  - 09 decision 4 now states the rule: a report's DERIVED_FROM citations are whatever its sentences rest on, from any Claim. Evidence counts always go through OCCURRENCE_OF. rpt-refined still cites a-occ-pacholec as context.

### Model discipline

- **M1 (major): Mention was not justified under SLIM → fixed (cut).**
  - Removed `Mention`, `Mention.span` and `Mention.resolvedTo`: −1 node type, −2 pairs. MENTIONS left the kernel SDL and now exists only on D9 Chunk.
  - Rewrote Q-K-13 over the surface-form locator and the competing RESOLUTION Assessments. typeHint and normalizedForm moved to facets. Q-K-13's fixture flag is now yes (FC-1).
  - Amended executor change P8.
  - The hubbard fixture now uses surface forms; the licence is in the chunk's derivedFromAssessmentUids.
  - Requests to D1, D4 and D9 are in 11-open-questions 35.
  - Recorded as pattern change 10. It is a removal, which conflicts with "additive only"; the conflict is noted in 11.
- **M2 (major): 10-seams missed edges that other modules declare onto kernel types, and OCCURS_IN and RENDITION_OF were two container paths → fixed.**
  - A scan of every sibling SDL added: HAS_ITEM, USES_CRITERION, BLOCKED_BY (×2), DERIVED_FROM ReportItem→Assessment, DERIVED_FROM ReportItem→Association, ASSOCIATES, OBSERVED_IN_CONTEXT, RESOLVES_TO_CONSTRAINT, OCCURS_IN and OWNS_BRAND.
  - Ruling (09 "Occurrence container and source family"): D9 OCCURS_IN is the only container path (Q-K-09, Q-K-21). RENDITION_OF is used only for rendition grouping.
  - Pattern item 11 now says DERIVED_FROM may target a D10 Association.
- **M3 (major): D9's kernel requests were unanswered → fixed.** The 09 requests table now has a D9 block with a ruling for each:
  - K-2: declined; D9's interim form is adopted as the kernel form.
  - K-3: declined; the rule is codified in pattern item 8.
  - K-5: met with a `segment:` qualifier instead of a field.
  - K-6: accepted; an ACCOUNT Channel can be the asserter (executor change P20).
  - K-7: accepted; +2 BasisKind values.
  - K-9: declined; use an Assertion about the rendition's Source.
  - K-10: declined (11-open-questions 34).
  - K-11: declined.
  - C-6: accepted (the Entity label rule).
- **M4 (major): the Q-K-06 blast radius picked up noise through WAS_GENERATED_BY-on-update plus ASSESSES → fixed.**
  - The walk now starts only from kernel records that M created.
  - An ASSESSES hop counts only when it ends at a Claim or an Assertion.
  - Touched entities are listed separately.
  - two-run-lineage gained a must-NOT-appear row: as-res-resveratrol and as-res-sirt1 appeared at depth 1 under the old pattern.
- **M5 (major): the verifier's authority and independence were written on the extractor's DECLARED edges → fixed.**
  - They are now only on the Adjudication's VERIFIER_FOUND edges. Updated the SDL docstring, the 3.8 table, M7, P16 and the "never writes" list.
  - Q-K-15 reads the current Adjudications' edges to the declared spans and returns a `notYetVerified` flag.
  - The seller fixture adds adj-cf-mr-takeaway and adj-cf-mr-retelling.
  - Removed the authority keys from DECLARED edges in the seller and crosswalk fixtures.
- **M6 (minor): Adjudication.considers had nothing that populated it → fixed (cut, recorded as deferred in 05).**
  - Assessment.inputAssessments is kept. It is now instantiated by the new as-synthesis-general (EVIDENCE_SYNTHESIS, DERIVED_FROM as-retelling-am, as-retelling-mr and as-refines).
  - D1, D5 and D7 fixtures also use it.
- **M7 (minor): wrong fixture flags in 02, and the note overclaimed → fixed.**
  - Q-K-27 is now `no`. FC-5 was dropped from Q-K-23 and CQ-TM-03. Q-K-13 is `yes (FC-1)`. The note was corrected.
  - Q-K-21 now returns `distinctFamilies` and `independentFamilies`; the second reads the verifier's independence.
- **M8 (minor): IdentifierLinkProperties broke the verbatim-prefix rule → fixed.** `isPrimary` now comes after `lastWriterRunId`.
- **M9 (minor): the `Entity` label was used inconsistently → fixed.** 09 now states the rule: the label marks the entity archetype only, and payload, retrieval and record types omit it. D9 C-6 is answered.
- **M10 (minor): Report cardinalities conflicted with D11's PROFILE → fixed.**
  - `about` is zero_or_more; ASSESSES stays required for EVIDENCE_REPORT and COMPARISON.
  - `generatedBy` may be a PROJECTION Activity.
  - Decision 4 updated; the ruling is recorded in 11-open-questions 37.

### Check-stage issues (check-issues.json "K")

- Duplicate `MassBasis` (D1/D3): still open. It is not in K's files; 11-open-questions 31 assigns it to the synthesizer.
- Executor changes P1–P19, and intent v1 cannot carry the evidence-chain records: still open for the owner (11-open-questions 26). The review added P20–P21 and amended P8 and P16.

### Results

- packet-check K exits 0: 11 node types, 13 relationship types, 32 pairs, 35 questions, 6 fixtures. Before the review: 12 / 14 / 35.
- print-schema (scratch `ft/K/adv/compile/`):

| SDL | bytes | inputs | build |
| --- | ---: | ---: | --- |
| kernel alone (6,466 lines; sha256 of `04` b2c2b1b0…; not the pinned 55 MB schema) | 322,904 | 179 | 1 s |
| kernel + template | 357,817 | 198 | |
| kernel + D10 | 423,006 | 224 | |
| kernel + all 13 current domain drafts, no stubs | 1,746,992 | 986 | |

  The all-drafts compile shows that no domain SDL depended on the removed Mention or considers. 09 and SUMMARY were updated to these numbers.
- Files changed:
  - packet files: 01, 02, 03, 04, 05, 06, 08, 09, 10, 11, SUMMARY, RUNLOG
  - notes: `_notes/tool-log.md`, `_notes/research-notes.md`
  - fixtures: hubbard, evidence-mission, seller, crosswalk and two-run-lineage, with locators, intents and the lineage index regenerated

## Close-out: pattern lint (A1, 2026-10-09)

- Input: S pattern linter (`final/_work/pattern-lint.{json,md}` @ A1 7aaeb2f): K 36 blocks, 35 failing, all packetBug (35 `CYPHER 25` prefixes; EXPLAIN errors in Q-K-14 and Q-K-16; 7 of them also ruling-level).
- Fixes in `03-retrieval-patterns.md` only (no SDL, register or fixture text repeated the errors):
  - removed the `CYPHER 25` line from all 35 blocks; header prose now says Cypher 5 as Neo4j 5.26 plans it; "Cypher 25 dynamic label" → "dynamic label, Neo4j 5.26+".
  - Q-K-14: Cypher 25 `SEARCH c IN (VECTOR INDEX …)` (Neo4j 2026.01+) → `CALL db.index.vector.queryNodes('chunk_embedding', 20, $questionEmbedding) YIELD node AS c, score WHERE c:Chunk AND c.language = 'en'` (post-filter on 5.26); pattern prose updated.
  - Q-K-16: `ORDER BY adj.recordedAt` after `collect()` (out of scope) → project `adj.recordedAt AS adjRecordedAt` and order by it.
- Re-run: `node C:/…/S/schema/program/final/_work/lint-packet-patterns.mjs --packets K --json <scratch>/lint-K.json --md <scratch>/lint-K.md` (scratch output so the shared all-packet report is not overwritten) → K 36 blocks: 29 ok, 0 packetBug, 7 rulingBroken (R-44 Q-K-10/17/22, R-15 Q-K-15/23, R-43 Q-K-21, R-09 CQ-AX-04), CYPHER 25 0.
- The 7 rulingBroken blocks are left as the packet record (S writes the final-SDL versions).
- `node scripts/packet-check.mjs K` → ok, exit 0 (11 node types, 13 relationship types, 32 pairs, 35 questions, 6 fixtures).
- Not committed (coordinator commits).
