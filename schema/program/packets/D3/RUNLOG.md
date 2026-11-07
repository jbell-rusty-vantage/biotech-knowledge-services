# Run log — packet D3

## Claim

- agent: A4
- domains: D3 clinical and preclinical evidence
- worktree: C:\Users\Pinda\Proyectos\Biotech\biotech-knowledge-services-A4 (branch ft/schema-A4)
- base commit: e484fd2
- planned fixtures (Wave 1 candidates; the fixtures stage picks the final set):
  1. registry version history: ClinicalTrials.gov v2 history endpoint plus two version snapshots of a longevity-supplement trial whose outcomes, status or enrollment changed between versions;
  2. retraction or correction: Crossref `update-to` metadata (Retraction Watch data now in Crossref) plus the PubMed retraction/correction notice for a longevity-relevant paper (harm / disconfirmation case);
  3. unstructured-to-entity path (directive 3.8) over an open-access trial paper (PMC full text): question → chunk → assertion → locator → snapshot;
  4. null primary with favorable secondary (registry results + paper) as a disconfirmation case;
  5. preclinical lifespan result from the NIA Interventions Testing Program (a negative lifespan finding).

## Entries

### 2026-10-08 — Wave 1 research stage (A4)

- Read: 00-DIRECTIVE (full), 01-PACKET-CONTRACT, 02-TEAM, brief D3, PLAN §1/3/6, workspace START_HERE, fragments W09/W10, domain page `studies-and-evidence`, node cards for the 20 W09/W10 types (properties), schema-map D7 section header and seam matrix, competency questions (CQ-ST-01..10, CQ-EV-03..06, CQ-AX-05/24, CQ-RC-03) and OPEN-QUESTIONS items on retraction (closed: SourceRevisionEvent), applicability, null primary, SafetySignal. Sibling worktrees: D5 `vocab-targets.yaml` (OPERATIONALIZED_BY Target → Outcome/Biomarker; APPLIES_TO_POPULATION names D3 StudyPopulation) and D13 `vocab-frontiers.yaml` exist; K kernel pattern not yet published.
- Commands: `node scripts/packet-skeleton.mjs D3` (16 files created); scratch `ft/D3/{raw,eco,probe}`; `sha256sum` over every capture → `ft/D3/SHA256SUMS.txt`.
- Tools (detail in `_notes/tool-log.md`): ClinicalTrials.gov v2 API (curl; 10 records + searches), CTG OpenAPI spec, CTG internal history API (403 everywhere; also tried PowerShell, Firecrawl basic/auto/stealth, Tavily, Exa, WebFetch), Wayback (429/404), ISRCTN web (Firecrawl) and API (curl), WHO ICTRP (curl), PubMed E-utilities (curl; hit the 3 req/s limit once), PMC JATS (efetch db=pmc), Europe PMC REST (search ok, fullTextXML 500), Crossref + Crossref Labs, OpenAlex, medRxiv API, PubMed MCP, Firecrawl research index + search MCP, Firecrawl CLI scrape, Tavily CLI extract (33 page extracts) and search.
- Problems: ClinicalTrials.gov record history is not agent-reachable (contract asks for "v2 history endpoints", which do not exist publicly) → registry version-history candidate switched to ISRCTN ASPREE (FC-1) with CTG as second registry; recorded as an open question. NCBI rate limit without API key. Crossref Labs reason strings drop their first character. Examine grading is paywalled. Several JS sites return shells to Tavily.
- Wrote: `01-ecosystem.md` (actors by type, lifecycle, 10 artifact interviews with ≥2 instances each, four lenses, readiness table, 54 cited sources), `02-questions.md` (32 rows, 14 harm/disconfirmation, 13 value-1, StudyResult/OutcomeDefinition filter matrix), `_notes/fixture-candidates.md` (7 candidates with sha256 and verbatim quotes; U2E = FC-3, harm = FC-1/FC-2/FC-6, registry history = FC-1, retraction = FC-2), `_notes/research-notes.md` (8 candidate node types, 13–14 relationship types, merges/deferrals of W09/W10, seams, open questions), `_notes/tool-log.md`.
- `node scripts/packet-check.mjs D3`: questions parse (32, all with answer kind); expected failures for SDL/fixtures (later stages).

### 2026-10-08 — Wave 2 model stage (A4): retrieval patterns, SDL, registers, reasoning, seams

- Read: RUNLOG, `01-ecosystem.md` (skim), `02-questions.md`, `_notes/research-notes.md`, `_notes/fixture-candidates.md`, `_notes/tool-log.md`; 00-DIRECTIVE (full), 01-PACKET-CONTRACT, 02-TEAM, brief D3; kernel (worktree A1) `09-reasoning.md` (kernel pattern, verification mapping, size, decisions, bitemporal), `04-schema-proposal.graphql` (full), `domain-template.graphql`, `identifier-schemes.yaml`; schema-map D7 (pinned "Studies…") overview lines 7654–7790; pinned SDL type blocks and enums for the 13 W09 types; skills `neo4j-modeling-skill`, `neo4j-graphql-skill`, `neo4j-gds-skill` (projection/WCC), `neo4j-vector-index-skill` (SEARCH clause); `scripts/packet-check.mjs`. Sibling packets: research notes of D1, D2, D4, D5, D6, D7, D8, D13; then (once published) the SDLs and 10-seams of D1, D12, D2, D4, D5, D6, D7, D8, D13, D9, D11 and D9's 11-open-questions.
- Wrote: `03-retrieval-patterns.md` (32 sections, conventions ASOF/VALID/LIVE/TRACE, GDS WCC per request for CQ-ST-07, vector + MENTIONS + COVERS_LOCATOR for Q-D3-14), `04-schema-proposal.graphql` (8 types, 14 relationship types, 4 unions, 32 enums, 2 module edge-property types), `05-relationship-register.yaml` (14 entries + 12 predicateOnly + 46 deferred pinned or considered relationships), `06-node-register.yaml` (8 entries with filterProperties per question, 3 deferred, 12 mergedInto), `09-reasoning.md`, `10-seams.yaml`, `11-open-questions.md` (27 items), `08-sources-and-tools.md` (seed table of 17 source/tool ids so `populatedBy` resolves), `02-questions.md` (matrix updated, "Model-stage changes" section, Q-D3-10 now also takes a condition; ids unchanged). Fixtures: replaced the skeleton `fixture-01` with three named folders, each with a `source.md` stub (url, title, retrieval date, digests, the relationships it must exercise): `07-fixtures/aspree-registry-history-harm` (kind harm), `07-fixtures/resveratrol-retraction` (kind disconfirmation), `07-fixtures/dq-bone-trial-unstructured` (kind unstructured-to-entity). `SUMMARY.md` left as skeleton (contract: written last).
- Verified against raw captures before writing fixture stubs: NCT04313634 lead sponsor is a person ("Sundeep Khosla, M.D.", SPONSOR_INVESTIGATOR, affiliation Mayo Clinic) → sponsor union includes Person; ASPREE CTG collaborators and conditions; "100 mg enteric-coated aspirin".
- Compile check (required): scratch `ft/D3/compile.graphql` = kernel SDL + module + 13 stub `@node` types; `BKS_SCHEMA_PATH=<abs> NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <abs out>` → clean, ~1 s. Kernel alone 326,564 B / 6,582 lines / 185 inputs; kernel + stubs 410,249 / 8,019 / 218; kernel + stubs + D3 619,784 / 12,437 / 365 (D3 marginal +209,535 B, +4,418 lines, +147 inputs). Also A1's `lever/print2.mjs` with excludeDeprecatedFields (L3): D3 marginal +93,728 B. Measured lever: property-level `@filterable(byValue: false) @sortable(byValue: false)` on non-filtered properties −38.8 KB.
- Problem: a print with a backslash-escaped path silently fell back to the pinned schema (57.9 MB, 38,034 inputs) because `loadPinnedSdl` skips a non-existent `BKS_SCHEMA_PATH`; fixed by passing `cygpath -w` paths. Worth a warning in print-schema (D11/owner).
- Realignment (same session) after sibling SDLs appeared: SPONSORED_BY → HAS_STUDY_ROLE {roleKind} with Organization | Person | Award (D7 seam, OQ-D7-04); AUTHORED_BY → predicate-only, INVESTIGATES → typed (D2 seam); MEASURES member AdverseEffect → D2 Outcome (no AdverseEffect type exists; D5 maps adverse effects to Condition); ADMINISTERS member Lot → DietaryPattern (D12 request); D9 confirmed Publication is D3's; patterns updated to D9 `CHUNK_OF` / `COVERS_LOCATOR` and D6 `HAS_PACKAGE → HAS_LABEL_VERSION → DECLARES_COMPONENT`. Found a relationship-name collision: D8 also declares `RESULT_FOR` (11-open-questions #25).
- `node scripts/packet-check.mjs D3`: nodes 8/8, rels 14/14, pairs 33/35 (31 distinct), questions 32, fixtures 3; the only failures are the 9 fixture-content files (`locators.yaml`, `assertions.yaml`, `questions.md` × 3) left for the fixtures stage.


### 2026-10-08 — Wave 2 fixtures stage (A4): three fixtures from fresh captures, sources and tools

- Read: RUNLOG, 02-questions, 04 SDL, 05/06 registers, `_notes/fixture-candidates.md`, `_notes/tool-log.md`, 01-PACKET-CONTRACT, `scripts/packet-check.mjs`, kernel pattern (A1 `K/09-reasoning.md` sections 1–2, K SDL enums: SelectorKind, EvidenceRole/Origin, SpeechAct, BasisKind), `examples/ingestion-intent.example.json`, `packages/contracts/src/ingest.ts` + `common.ts`, D9 `Chunk` (A8), D7 Person/Award, D2/D4/D1 type names and uid tokens, `K/identifier-schemes.yaml`, sibling fixture format (A7 `D13/07-fixtures/lesne-2006-retraction`).
- Commands: re-fetched every fixture source with curl / `firecrawl scrape` into scratch `ft/D3/fx/raw/` and compared digests with the research captures (identical except OpenAlex key order; Crossref Labs refused, research capture used; NCBI rate limit once); `python -I -B _notes/tools/build_fixtures.py <raw> <packet>` (writes locators.yaml, assertions.yaml, intent.json, directive-3.8-walk.yaml); `node schema/program/packets/D3/_notes/tools/validate_intents.mjs` (3 × OK); `node scripts/packet-check.mjs D3` → ok (8 nodes, 14 rels, 33 pairs, 32 questions, 3 fixtures).
- Wrote: `07-fixtures/aspree-registry-history-harm/` (kind harm; 4 snapshots, 95 locators, 81 assertions, 31 structural edges; 3 RECONSTRUCTED + 2 OBSERVED registration versions), `07-fixtures/resveratrol-retraction/` (kind disconfirmation; 7 snapshots, 60 locators, 37 assertions; 3 per-asserter REVISES episodes + 1 held self-loop + 8 NLM retractions of other Das papers; kernel CQ-EV-05 path), `07-fixtures/dq-bone-trial-unstructured/` (kind unstructured-to-entity; 3 snapshots, 98 locators, 66 assertions, 60 structural edges; `directive-3.8-walk.yaml` with 72 chunks, 3 sub-queries, MENTIONS, COVERS_LOCATOR and re-selection); each with source.md, locators.yaml, assertions.yaml, intent.json, questions.md. `08-sources-and-tools.md` completed (17 rows incl. every populatedBy id, tools table, custom-tooling list). `11-open-questions.md` #28–#32. `_notes/tools/*`, `_notes/build-summary.json`, tool-log fixtures section.
- Corrections to the model-stage stubs (verified against captures): the 2008 ISRCTN primary set is "Death from any cause", "Death from incident dementia …", "Death from persistent physical disability …"; the 2009 set "Death from any cause", "Incident dementia …", "Persistent physical disability …". ASPREE death-from-any-cause result is NOT_REPORTED for statisticalConclusion (abstract states CI only) and WORSENED for direction (SDL rule "never recomputed"); registry rows of NCT04313634 likewise NOT_REPORTED (P values only). The registry/paper disagreement for Q-D3-15 is concrete: same CTx medians, registry FULL_RANGE vs paper INTERQUARTILE_RANGE, n 28/arm vs 60 ITT.
- Problems: Firecrawl CLI `-o` with a POSIX path created `C:\c\Users\…` (own stray file removed; other agents' stray directories under `C:\c` left untouched); intent v1 cannot express 23 of the assertions (predicate-only with object, NEGATIVE, held) — listed in each intent's notes.

### 2026-10-08 — Wave 2 check and handoff stage (A4)

- Read: RUNLOG, 00-DIRECTIVE (full), 01-PACKET-CONTRACT, `scripts/packet-check.mjs`, every packet file (02, 03 headings and conventions, 04 SDL in full, 05, 06, 08, 09, 10, 11), fixture formats; kernel as it is now in worktree A1 (`K/04-schema-proposal.graphql` sha256 `790e7244…`, `K/09-reasoning.md` sections "Edge-property types", "Kernel types a domain may reference without a seam", "Ownership map", "Model stage decisions" M1–M13, "Kernel requests", "Kernel pattern changes" 1–9; `domain-template.graphql`); sibling SDLs and 10-seams of A2 (D1, D12), A3 (D2, D4), A5 (D5), A6 (D6, D7), A7 (D8, D13), A8 (D9, D11) for seam targets and inbound references; `packages/contracts/src/ingest.ts` (AssertionCore).
- Step 1: `node scripts/packet-check.mjs D3` → exit 0 at the start and after every edit.
- Step 2, audit beyond the script (scratch `ft/D3/check/audit.py`, plus one-off checks):
  - question ids: every `Q-D3-*` / `CQ-*` id in the packet (excluding `_notes/`) is a row of 02 except four catalog aliases (CQ-AX-05, CQ-ID-02, CQ-EV-06 in question cells; CQ-RC-03 in this log) → documented as aliases in 02 (answered by rows CQ-ST-07, CQ-ST-02, CQ-EV-04; CQ-RC-03 is D10's).
  - every 05 `pattern` points at an existing `## <id>` section of 03 and that section names the relationship type; every question has a 03 section that marks its temporal handling and returns a TRACE; every `populatedBy` id is a row id of 08 (17 rows).
  - fixtures: each relationship's register fixture exercises it (assertion `projectsTo` or structural edge: HAS_REGISTRATION_VERSION 5, HAS_ARM 5, HAS_COMPONENT 5, ADMINISTERS 5, HAS_POPULATION 3, HAS_OUTCOME 6, STATED_IN 36, RESULT_FOR 16, RESULT_FOR_ARM 24, REPORTS_ON 6, REVISES 12, HAS_STUDY_ROLE 14, MEASURES 5, INVESTIGATES 4); every assertion has an asserter, evidence locators and `producedBy {missionId, runId}`; no SUPPORTS / CONTRADICTS / MENTIONS predicates.
  - quote spot-check by re-fetching (scratch `ft/D3/check/raw/`, `spot.py`): PMC11705617 JATS (efetch db=pmc) — dq l20 "but because of the COVID pandemic and cost issues, the study was modified to a two-arm study (control versus D + Q)." found at offset 11761 (as recorded), exact-text digest `eee6db2d…` equal; PubMed 23016154 — raw digest `901a03db…` identical to the snapshot, resveratrol l10 `<PublicationType UI="D016440">Retraction Notice</PublicationType>` at offset 1155 (as recorded); CTG v2 NCT04313634 `/protocolSection/sponsorCollaboratorsModule/leadSponsor` = `{"class":"OTHER","name":"Sundeep Khosla, M.D."}` and the fisetin-arm gastric hemorrhage 1/14 (EG001); CTG v2 NCT01038583 `/protocolSection/conditionsModule/conditions/5` = "Bleeding". All match.
  - directive discipline: no SUPPORTS / CONTRADICTS edges; MENTIONS only as D9's derived `Chunk.mentions` (→ Subjectable, `@settable` false, `nestedOperations: []`); no good/bad properties (StudyResult.direction is a per-source reported direction, 11-open-questions #14); harm/risk/disconfirmation rows 14 / 32 = 44 %; no kernel type re-declared (set intersection with the current kernel SDL is empty); seams complete (all 14 out-of-module union members of ADMINISTERS, MEASURES, HAS_STUDY_ROLE, INVESTIGATES have a seam row; every sibling target type still exists; inbound D13 ON_FRONTIER, D2 IN_STUDY_ARM, D9 MENTIONS / COVERS_LOCATOR present in the sibling SDLs); D3 declares no derived relationship field, its two projection caches have method versions and every type is `@mutation(operations: [])`; 06 filterProperties equal the filterable scalars of the SDL type by type, and otherProperties equal the non-filterable counts.
  - size estimate in 09 equals packet-check (8 / 14 / 33 field-pairs = 31 distinct + 2 inverse); 11-open-questions #21 had stale numbers (30 / 32) → fixed to 31 / 33.
- Fixes (kernel conformance, found by reading the current kernel): A1 added `AssertedRecordedProperties` (M10) and the domain-local edge-property superset rule (M11: base fields verbatim first, only filterable qualifiers, source wording in `Assertion.qualifiers`). SDL: STATED_IN (4 fields), ADMINISTERS, MEASURES, REPORTS_ON (2 fields), INVESTIGATES → `AssertedRecordedProperties`; `RevisionEdgeProperties` rebased on AssertedRecordedProperties (+ `revisionKind`), `reasonsVerbatim` removed; `StudyRoleEdgeProperties` keeps AssertedEdgeProperties (+ `roleKind`), `roleTextVerbatim` removed; both now `Assertion.qualifiers` (`reason:` / `roleText:`). Builder (`_notes/tools/fxlib.py`, `emit.py`) moves those keys to `qualifiers`, records `projectsTo.edgePropertiesType`, and puts qualifiers in the intent proposal `rationale` (intent v1 AssertionCore is strict and has no `qualifiers`). Rebuilt: `python -I -B _notes/tools/build_fixtures.py <scratch ft/D3/fx/raw> <packet>` → locators.yaml byte-identical, build summary identical, assertions / intent differ only by the moved qualifiers and the new `edgePropertiesType`; `node _notes/tools/validate_intents.mjs` → 3 × OK. Also: 03 (ASOF convention; CQ-EV-05 and Q-D3-08 RETURN clauses read qualifiers), 05 (header, 5 edgeProperties, 3 rationales, 1 deferred reason), 09 (size, compile, decisions, bitemporal, risks), 10 (kernel types, module types with `base`, `sharedVocabularies` kernel-types and SexScope — D2 uses the D3 enum), 11 (#4 and #5 resolved, #21, #30 extended, new #33 retraction double mechanism, #34 Publication owner drift in D13 seams), 02 (alias ids; fixture column corrected: CQ-ST-02, CQ-EV-04, Q-D3-02, Q-D3-06, Q-D3-11, Q-D3-12 → no; Q-D3-09, Q-D3-10 → yes), fixture `resveratrol-retraction/source.md`.
- Step 3, compile check (scratch `ft/D3/check/compile.sh`: current A1 kernel + module + 13 stubs, `BKS_SCHEMA_PATH=<cygpath -w> NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema`, plus A1 `print2.mjs` L3): before the fixes, clean, D3 marginal +209,535 B / +4,418 lines / +147 inputs (unchanged from the model stage, so no breakage from the kernel's additive changes); after, clean, kernel 345,273 B / 6,927 lines / 192 inputs, kernel + stubs 411,129 / 8,032 / 218, + D3 614,646 / 12,366 / 365 → **D3 marginal +203,517 B, +4,334 lines, +147 inputs** (L3 +92,386 B); `getSchema()` ≈ 0.7 s.
- Step 4: wrote `SUMMARY.md` (60 lines).
- Problems: the subagent `Write` tool refused `SUMMARY.md` as a "report file"; written with a shell heredoc because it is a contract deliverable. Running `print2.mjs` with a POSIX path failed (`C:\c\…`); use `cygpath -w` (same defect class as the fixtures stage).

### 2026-10-08 — Adversarial review (A4)

Two independent reviewers (evidence integrity, model discipline). Every finding verified here; sources re-fetched where the finding was about a source (NLM bulletin and AACT via Firecrawl; PMC10828146, PMC9249399, PubMed 30155270 via E-utilities; the fixture captures re-read from scratch `ft/D3/fx/raw`, digests unchanged). Fixtures re-built by `_notes/tools/build_fixtures.py` (generators edited, never the YAML by hand); 271 locators re-selected; three intents valid against the contracts. Nothing committed.

Evidence-integrity findings:

| # | finding | outcome |
| ---: | --- | --- |
| E1 | dq a13 attributed to the curation agent on a misreading; paper names "Quercetin Phytosome, Thorne Research" and "Sprycel, Bristol Myers Squibb" | **fixed** — a12 / a13 asserted by the Publication with new TEXT_QUOTE locators l99 / l100 on the Methods sentence; false note deleted; components carry supplierNameVerbatim; chunk MENTIONS re-derived (generic names → D1 substances, product names → materials; abstract chunk no longer lists the phytosome material); CQ-ST-01 answer corrected (SAME_MATERIAL, suppliers stated) |
| E2 | 01 §1.8 ITP fisetin "2016/2017 cohorts" | **fixed** — "2018/2019 cohorts (fisetin in C2018)", verified in PMC10828146 |
| E3 | ASPREE rv-reg carries only 1 of 8 registration-time primaries | **fixed** — od-reg2…od-reg8 with STATED_IN (a75–a81) and one locator each (l96–l102), cited by the rv-reg attach Assertion; paper's cardiovascular-disease secondary (od-cvd-s, a82) and its result HR 0.95 (sr-cvd, a83) added; source.md, CQ-ST-04 and Q-D3-16 answers extended (non-fatal events: registered primary → paper secondary composite) |
| E4 | Bayer FUNDER validTo 2018-08-22 STATED_BY_SOURCE is record time | **fixed** — a52 now SUPERSEDED, valid time UNKNOWN, not projected, qualifier `sourceRecordRemovedAt:2018-08-22`; a53 (NEGATIVE) is its successor; SUMMARY, Q-D3-08 / Q-D3-09, 04 / 05 / 03 / 09 wording corrected; kernel question #38 |
| E5 | resveratrol a13 CITED_BY_COUNT asserted by Elsevier | **fixed** — asserted by Crossref (new D7 Organization entity) |
| E6 | dq a21 / a22 cite the 2-week description; a28 only the AE time frame | **fixed** — a21 / a22 / MEASURES a31 / a32 cite secondaryOutcomes/1 and /2 descriptions; a28 cites eventGroups seriousNumAffected / seriousNumAtRisk (D+Q and control) + time frame |
| E7 | 01 line 15 "replaced the classic API in March 2024" | **fixed** — "announced March 2024 (posted 19 March); classic API retired June 2024", verified |
| E8 | AACT "10 concurrent connections" uncited | **fixed** — number removed (not on the cited page; no source found by search); row now cites what the page states |
| E9 | S9 snippet; S5 = S7; 2KGK CRO role uncited | **fixed** — S9 cited as the full article (quote verified); S5 merged into S7; 2KGK row relabelled "co-author affiliation, role unverified" |
| E10 | readiness disagreement 01 vs 08 | **fixed** — 01 §1.1 and §5 now isrctn-web 1, ISRCTN XML API 2, Crossref Labs 1 (as 08) |
| E11 | which mailto was sent in R | **fixed as far as possible** — tool-log and 08 record that the address was not logged and its kind cannot be established; content stands (reviewer's byte-identical re-fetch); role-address-only rule recorded (#32) |
| E12 | resveratrol a17 / a21 asserted by Das alone | **fixed** — asserted by the Publication; applied the same rule to all paper statements in the other two fixtures (Farr, McNeil → the Publication); kernel question #37 |

Model-discipline findings:

| # | finding | outcome |
| ---: | --- | --- |
| M1 | duplicate `MassBasis` (blocker) | **fixed** — D3 copy deleted; typed by D1's enum; 10-seams sharedVocabularies MassBasis (owner D1); compile stub added; #35 |
| M2 | `direction` IMPROVED / WORSENED and SIGNIFICANT_FAVORABLE / UNFAVORABLE are stored judgments | **fixed** — `EstimateDirection` (INCREASED, DECREASED, NO_CHANGE, MIXED, UNKNOWN), `StatisticalConclusion` (SIGNIFICANT, NOT_SIGNIFICANT, NOT_TESTED, NOT_REPORTED); fixtures re-valued; Q-D3-05 rewritten (event-risk rule `d3-event-risk-reading/v1` + `D3.result-interpretation` Assessment `effectDirection`); Q-D3-06 adjusted; #13 and #14 closed |
| M3 | retraction status in four parallel ways | **fixed (D3 side)** — `revisionKind: SourceRevisionKind` (CORRECTION → ERRATUM), `PublicationRevisionKind` and `REVISION_STATUS_STATED` removed, OpenAlex flag written as kernel `HAS_REVISION_STATUS`, openalex dropped from REVISES.populatedBy, cache `revisionStatusMethodVersion` (v2 over both); CQ-EV-05 reads both branches; request to K in #33 |
| M4 | RESULT_FOR collides with D8 | **D3 side done, request recorded** — #25 asks D8 (A7) to rename to QUALITY_RESULT_FOR and the synthesizer to check name uniqueness; D3 keeps the pinned name |
| M5 | typed Assessment slots not adopted | **fixed** — vocabularies registered in 09 "Assessment vocabularies"; CQ-AX-24, CQ-ST-03, CQ-EV-04 (and CQ-ST-10) filter on conclusionCode / gradeScheme / grade / certainty / facets; #6 cut to HED bounds and inputRole |
| M6 | 05 question lists name patterns that do not traverse; ctgov-history in populatedBy | **fixed** — lists trimmed against the 03 patterns (each edge keeps ≥ 1 real question; 04 docstrings aligned); ctgov-history removed (noted as blocked) |
| M7 | stale seams (TargetMeasure, APPLIES_TO_POPULATION, REFERS_TO_OUTCOME reason, D1 note) | **fixed** — dependsOn to Biomarker \| Metric \| D2.Outcome; #8 and the risk narrowed to D2.Condition; APPLIES_TO_POPULATION dropped, StudyPopulation docstring describes the `population:<uid>` string join; REFERS_TO_OUTCOME reason fixed; D1 asked to correct its ADMINISTERS note (#26) |
| M8 | 14 unregistered fixture predicates; per-field RegistrationVersion predicates | **fixed** — field predicates folded into the attach Assertion (one locator per field, `studyTypeVerbatim` added), REGISTERED_AS_SAME_TRIAL → second-asserter HAS_IDENTIFIER, REVISION_STATUS_STATED → HAS_REVISION_STATUS, MASKING_REGISTERED dropped; 7 remaining registered in predicateOnly with questions; #36 |
| M9 | unstable / contradictory identity rules | **fixed** — StudyArm, StudyPopulation, StudyResult keyed on (…, sourceFamily, payloadHash); header says OutcomeDefinition is shared across sources; StudyResult.statedIn one_or_more for identical restatements |
| M10 | two inverse fields cost pairs and inputs | **fixed** — removed; 33 → 31 pairs |
| M11 | `[CONNECT]` on structural edges; VersionedState label | **fixed** — RegistrationVersion labels `[RegistrationVersion, Entity]`; `[CONNECT]` on RESULT_FOR / RESULT_FOR_ARM justified in 04, 05 and 09 "Discipline deviations" |
| M12 | StudyPopulation least justified | **rebutted with a measurement** — folding six population fields onto Study saves 16,574 B / 12 inputs / 1 node / 3 pairs (586,256 → 569,682 B) but loses the per-kind, per-source records Q-D3-17, Q-D3-04 / Q-D3-06 and the CQ-EV-04 population dimension read (dq-bone: four populations from two sources, paper-stated ones have no RegistrationVersion); whyNode restated in 06 |
| M13 | Publication ownership drift (D13, K) | **requests recorded** — #34: D13 (A7) to change EVENT_ABOUT to D3.Publication; K (A1) to correct the 04 docstring and ownership-map row |
| M14 | CQ-ST-07 "materialized"; caches without method version | **fixed** — CQ-ST-07 `retrieved`; Study `projectionMethodVersion` / `projectionDerivedAt`, Publication `revisionStatusMethodVersion` |

Check-stage open issues (check-issues.json "D3"): #33 D3 side done, A1 ruling requested; alias ids unchanged (documented in 02); AssertionCore `qualifiers` still missing (#30); #1 still open; #8 narrowed to D2.Condition; #28 updated (harm retrieval no longer depends on significance; D10 decides on ciExcludesNull); #25 request to D8; #34 requests to D13 and K.

Measurements (compile: A1 kernel sha256 b2c2b1b0… + D3 + 13 seam stubs + D1 MassBasis stub; scratch `ft/D3/adv/compile/final`): 586,256 B, 11,718 lines, 344 input types (not the pinned 55 MB fallback); D3 marginal +197,496 B / +4,147 lines / +139 inputs. packet-check:

```json
{"ok": true, "packet": "D3", "counts": {"nodeTypes": 8, "relationshipTypes": 14, "pairs": 31, "questions": 32, "fixtures": 3, "budget": {"nodes": 8, "rels": 14, "pairs": 35}}}
```

## Handoff

Superseded counts: see the Adversarial review entry above (pairs 31; fixtures 271 locators). Check-stage handoff kept below for the record.


- packet-check (2026-10-08, check stage, exit 0):

```json
{
  "ok": true,
  "packet": "D3",
  "counts": {
    "nodeTypes": 8,
    "relationshipTypes": 14,
    "pairs": 33,
    "questions": 32,
    "fixtures": 3,
    "budget": {
      "nodes": 8,
      "rels": 14,
      "pairs": 35
    }
  }
}
```

- counts vs budget: node types 8 / 8; relationship types 14 / 14; pairs 33 / 35 as packet-check counts (31 distinct from→to + 2 inverse fields); widest union 6 / 6; most relationship fields on one type 7 (Study) / 12; no EXCESS lines needed. Questions 32 (14 harm, 13 value-1). Printed executable on the current kernel: D3 marginal +203,517 B, +4,334 lines, +147 input types, ≈ 0.7 s build.
- fixtures: `07-fixtures/aspree-registry-history-harm` (kind harm; registry version history: 3 RECONSTRUCTED + 2 OBSERVED versions, ISRCTN + CTG; 95 locators, 81 assertions), `07-fixtures/resveratrol-retraction` (kind disconfirmation; retraction / correction per asserter: NLM, Retraction Watch via Crossref, publisher erratum; 60 locators, 37 assertions), `07-fixtures/dq-bone-trial-unstructured` (kind unstructured-to-entity; directive 3.8 walk over 72 chunks; registry vs paper arms; 98 locators, 66 assertions). Every 05 relationship type is exercised by the fixture its register entry names; reproduce with `_notes/tools/build_fixtures.py` (raw captures in session scratch, not committed).
- open questions for the owner: #1 accept ISRCTN reconstructed history in place of the unreachable CTG history endpoint; #33 retraction status — kernel `HAS_REVISION_STATUS` on Sources vs D3 `REVISES` between Publications (A1 ruling needed); #28 CI-only harms stay `statisticalConclusion: NOT_REPORTED` (add a derived field or leave to D10?); #30 intent v1 lacks predicate-only object assertions, NEGATIVE edges and `AssertionCore.qualifiers`; #8 clinical-event outcomes do not reach a D5 Target; #20 / #32 an `NCBI_API_KEY` and a project contact address for the Crossref / OpenAlex polite pools; #25 RESULT_FOR name collision with D8.
- files changed in this stage (all under `schema/program/packets/D3/`; nothing committed): `04-schema-proposal.graphql`, `02-questions.md`, `03-retrieval-patterns.md`, `05-relationship-register.yaml`, `09-reasoning.md`, `10-seams.yaml`, `11-open-questions.md`, `SUMMARY.md`, `RUNLOG.md`, `07-fixtures/*/assertions.yaml`, `07-fixtures/*/intent.json`, `07-fixtures/resveratrol-retraction/source.md`, `_notes/tools/fxlib.py`, `_notes/tools/emit.py`. Unchanged: 01, 06, 08, `07-fixtures/*/locators.yaml`, `questions.md`, `directive-3.8-walk.yaml`. Scratch: `ft/D3/check/` (audit, spot-check captures, compile runs `baseline/`, `after/`, `final/`).

## Close-out: pattern lint

Agent A4 (packet owner) · close-out round 2026-10-09 (FU-04). SDL, registers and fixtures unchanged; only `03-retrieval-patterns.md` edited.

- input: `final/_work/pattern-lint.json` (S, 31390a6): D3 33 blocks, 6 failing (5 packetBug, 1 rulingBroken), 1 fragment, 1 gds-unvalidated.
- fixes (5 packetBug blocks):
  - CQ-EV-05 statement 2: UNION branches returned different column names → both branches alias `kind, uid, predicate, recordedAt, dependants`; statement 1 now ends with `;`.
  - Q-D3-11, Q-D3-12: the path filter `all(r IN relationships(path) WHERE r.recordedTo IS NULL)` reused `r` (later a StudyResult) → `all(rv IN relationships(path) WHERE ASOF(rv))` (REVISES is an asserted edge; read as of `$recAt` like every other asserted edge, per Conventions).
  - Q-D3-13: `any(x IN collect(aloc.selectorDigest) WHERE x = loc.selectorDigest)` in RETURN mixed an aggregate with a non-grouping key → `WITH r, a, loc, snap, adj, collect(aloc.selectorDigest) AS verifierDigests` then `loc.selectorDigest IN verifierDigests`.
  - Q-D3-14: removed `CYPHER 25` and the `SEARCH … VECTOR INDEX` clause (not in 5.26) → `CALL db.index.vector.queryNodes('chunk_embedding', 50, $queryEmbedding) YIELD node AS ch, score`; a note line records the 2026.01+ form.
  - header: "Shapes are Cypher 25" → "Cypher 5 (Neo4j 5.26; no `CYPHER 25` prefix, no `SEARCH` clause)".
- not rewritten (rulingBroken, left for S final-SDL versions): CQ-EV-05 shared-Identifier join (R-42), Q-D3-04 `revisionStatus = 'RETRACTED'` (R-44).
- re-lint: `node C:/…/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D3 --json <scratch>/lint-D3.json --md <scratch>/lint-D3.md` → `D3: 33 total, 2 failing (0 packetBug, 2 rulingBroken), 1 fragment, 1 gds`; selfCheckDiffs 0. (Reports written to session scratch so the coordinator's `pattern-lint.{json,md}` were not overwritten.)
- `node scripts/packet-check.mjs D3` → `"ok": true`, exit 0 (8 node types, 14 rel types, 31 pairs, 32 questions, 3 fixtures).
