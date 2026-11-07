# Run log — packet D11

## Claim

- agent: A8
- domains: D11 (bio-medical tooling action space); A8 also owns D9 in the same worktree
- worktree: C:\Users\Pinda\Proyectos\Biotech\biotech-knowledge-services-A8 (branch ft/schema-A8)
- base commit: e484fd2
- planned fixtures: (1) Europe PMC / PMC open-access JATS full text of a longevity trial paper — unstructured-to-entity path (question → chunk → assertion → locator → snapshot); (2) Crossref record carrying a Retraction Watch retraction update — disconfirmation case; (3) DailyMed SPL boxed warning for sirolimus (rapamycin) — harm case; (4) GSRS + PubChem substance records for nicotinamide riboside — identifier-bridge case (UNII/CAS/InChIKey/CID); (5) ClinicalTrials.gov v2 record + version history — registry locator case; (6) openFDA CAERS / enforcement record for a supplement — harm case; (7) NIH DSLD label — Supplement Facts parser case.

## Entries

### 2026-10-08 — Wave 1 research stage (A8, D11)

- Read 00-DIRECTIVE, 01-PACKET-CONTRACT, 02-TEAM, brief D11, PLAN §1/§3/§6, workspace START_HERE, node cards Identifier/Source/SourceSnapshot/SourceLocator/SourceAuthorityAssessment, capability-layer checkpoint (biotech-meta 2026-07-19), competency questions CQ-ID-04, catalog:CQ-PV-01..06 (catalog; D11 adopted PV-02/03/04/05), CQ-AX-04/07/14.
- `node scripts/packet-skeleton.mjs D11` → 16 files created.
- Checked CLIs: `tvly --status` (v0.1.5, authenticated), `firecrawl --status` (v1.23.1, authenticated, 0/5 concurrency).
- K packet (A1 worktree) still skeleton at time of reading: no kernel identifier pattern published yet.
- Exercised first-tier tools by curl through a scratch helper (`bin/get.sh`, saves body + headers, logs status/latency/bytes/sha256 to `fetch-log.txt`): NCBI E-utilities (esearch, efetch), PMC ID converter, Europe PMC (search, fullTextXML ×2, annotations), OpenAlex, Crossref ×3, Unpaywall, Semantic Scholar (keyed + unkeyed), bioRxiv API, ClinicalTrials.gov v2 (×2) + version + internal history (403), WHO ICTRP (1 ok, 1 timeout), EU CTIS, PubChem PUG REST, FDA GSRS (two hosts, two UNIIs), CAS Common Chemistry (401), OLS4/ChEBI, UniProt, RxNav, NIH DSLD (search + 2 labels), USDA FDC (429 DEMO_KEY), openFDA (CAERS, drug label, food enforcement), DailyMed (list, history, SPL ×2), regulations.gov API, SEC EDGAR (identity header read in-shell from .env, never printed; 403 without it), GLEIF, NLM Clinical Tables (LOINC, UCUM), fhir.loinc.org (auth redirect), AccessGUDID, fda.gov warning-letters page.
- MCP connectors exercised: PubMed (convert ids, metadata), Clinical Trials (trial details), bioRxiv (get_preprint), Firecrawl research index (inspect ×2, search), NPI (name search; person data not stored), ICD-10 (search, lookup with as_of), Exa (web search), Firecrawl scrape (CT.gov history tab).
- CLIs: `tvly search` ×3 and `tvly extract` ×2 (crash on Windows console encoding; fixed with `-o file` + UTF-8); `firecrawl scrape` ×4 (regulations.gov PDFs ×2 — one image-only; publisher retraction notice; CT.gov history tab → blocked).
- Problems: curl cannot write MSYS paths (`/c/...`, exit 23) → use `C:/...`; `python -I` ignores PYTHONIOENCODING → reconfigure stdout; shared-IP quota exhaustion (FDC DEMO_KEY, Semantic Scholar unkeyed, OpenAlex daily USD budget); CT.gov record history blocked for every client (corroborates A4/A5/A7 logs).
- Correction made during the stage: an early read of DSLD said the NR row had no UNII; the row-level `uniiCode` is null but the nested form "Nicotinamide Riboside Chloride" carries UNII 8XM2XT8VWI. Fixed in 01-ecosystem, identifier-bridges, action-space and tool-log before handoff.
- Read sibling packets' `_notes/tool-log.md` (A1–A8) to score tier-2 action-space entries; attributed per row.
- Files written: `01-ecosystem.md`, `02-questions.md` (30 rows, 17 harm), `tooling/action-space.yaml` (58 entries: 44 exercised by D11, 14 tier-2 from sibling logs; 9 gaps), `identifier-bridges.yaml` (33 schemes, 22 bridges, 7 non-bridges), `_notes/tool-log.md`, `_notes/fixture-candidates.md` (FC-1…FC-9 with sha256 and verbatim quotes + offsets), `_notes/research-notes.md`.
- `node scripts/packet-check.mjs D11`: questions parsed (30); remaining failures belong to later stages — SDL "Unexpected <EOF>" (comment-only skeleton; a 0-type module needs at least one definition to parse) and fixtures (<3, none unstructured-to-entity). No SDL or registers written in this stage.

### 2026-10-08 — Wave 2 model stage (A8, D11)

- Read: 00-DIRECTIVE, 01-PACKET-CONTRACT, 02-TEAM, brief D11, PLAN §3/§6; research outputs (01, 02, _notes/research-notes, fixture-candidates, tool-log); A1 kernel `packets/K/09-reasoning.md` (pattern section, verification.v1 mapping, decisions), `04-schema-proposal.graphql` (sha256 0ad41559…ea2c), `domain-template.graphql`, `identifier-schemes.yaml`, `11-open-questions.md`; sibling SDLs D1 (A2), D3 (A4), D5 (A5), D6/D7 (A6), D8 (A7), D9 (A8) for the names D11 patterns read; pinned W19 SourceCoverageRequirement / SourceDiscoveryRecord cards in `schema-map.md` (lines 13124–13210 only); skills neo4j-modeling, neo4j-graphql (full), neo4j-cypher, neo4j-vector-index, neo4j-gds (relevant sections).
- Kernel facts that changed research proposals: Identifier.scheme is a String register (scheme enum withdrawn); SelectorKind = verification.v1 kinds incl. JSON_POINTER and HTML (SECTION+sectionScheme withdrawn); ResolutionHypothesis → Assessment RESOLUTION; SourceRevisionEvent → SourceSnapshot.revisionKind; SourceDiscoveryRecord deferred by A1 to D11.
- Decision: one node type `CaptureAttempt` (absorbs SourceDiscoveryRecord; 0 relationship fields; written only for non-captures) instead of 0 types, because CQ-AX-04 and Q-D11-17 (value 1) cannot be answered from the kernel. 0 relationship types. Enums ToolActionKind, CaptureOutcome, CaptureFailureKind.
- Files written/updated: 03-retrieval-patterns.md (30 sections), 04-schema-proposal.graphql, 05-relationship-register.yaml (0 relationships, 9 predicateOnly, 9 deferred), 06-node-register.yaml (1 node, 8 deferred, 3 mergedInto), 09-reasoning.md, 10-seams.yaml (20 implicit seams, kernel types, sharedVocabularies), 11-open-questions.md (24 items), 02-questions.md (ids unchanged; 8 answer-shape/source cells updated; 3 questions gained a fixture), identifier-bridges.yaml (kernelCode per scheme; kernelRecommendations rewritten), tooling/action-space.yaml (locatorKinds → kernel SelectorKind; gap G10; modelStageUpdate), 07-fixtures/ (skeleton fixture-01 removed; five named folders with source.md stubs).
- Compile check: scratch `ft/D11/compile.graphql` = kernel SDL + D11 module (no seam stubs needed). Commands: `BKS_SCHEMA_PATH=<abs> NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <abs out>`. Kernel alone 326,564 bytes / 6,582 lines / 185 inputs; kernel + D11 341,945 / 6,910 / 190 (+15,381 bytes, +5 inputs). Alternative measured (SourceSnapshot + 3 properties, no node): 330,594 / 6,698 / 187.
- Problems: a bash heredoc chain with five files failed on quoting before running (no files touched) → wrote fixture stubs with the Write tool; YAML compact-mapping error in 06 (unquoted colon) fixed; research-stage tool id `firecrawl-cli-scrape` is not a registry id → replaced with `firecrawl-cli`.
- SUMMARY.md left as the skeleton (contract: written last, after fixtures).
- `node scripts/packet-check.mjs D11`: only fixture-content failures remain (locators.yaml / assertions.yaml / questions.md missing in the five stubs — fixtures stage). Counts: nodeTypes 1, relationshipTypes 0, pairs 0, questions 30, fixtures 5.

### 2026-10-08 — Wave 2 fixtures stage (A8, D11)

- Read: RUNLOG, 02-questions, 04 SDL, 05/06 registers, `_notes/fixture-candidates.md`, `_notes/tool-log.md`, five stub `source.md`; 00-DIRECTIVE (in full), 01-PACKET-CONTRACT, `scripts/packet-check.mjs`; kernel pattern and SDL (A1 `packets/K/09-reasoning.md`, `04-schema-proposal.graphql`: SelectorKind, Assertion, SourceSnapshot, SourceLocator, enums); `examples/ingestion-intent.example.json` and `packages/contracts/src/{ingest,common}.ts`; seam SDL fields in D3 (A4: InterventionComponent, Publication, REVISES / RevisionEdgeProperties, HAS_STUDY_ROLE, enums), D6 (A6: Package, LabelVersion, DECLARES_COMPONENT, enums), D1 (A2: HAS_ACTIVE_MOIETY, REALIZES_SUBSTANCE), D9 (A8: Chunk, TextBasis); sibling fixtures for uid compatibility: D1 `nr-trial-unstructured` and `nr-salt-moiety-us-canada` (A2), D3 `resveratrol-retraction` (A4, stub).
- Re-fetched every fixture source into scratch `ft/D11/fresh/` (`bin/getf.sh`, `fresh-log.txt`): 19 curl requests and 1 Firecrawl scrape. 13 research-stage URLs returned byte-identical content (sha256 unchanged), and the CT.gov history 403 and the CAS 401 re-checks were identical. pmc-idconv differs because the response echoes the request and the time. The Firecrawl rendition of the APS notice differs by one random anchor id. Three new calls: openFDA by `set_id`, a PubChem property subset, and curl of the publisher page (Cloudflare 403).
- `bin/build_locators.py` (python -I) wrote the five `locators.yaml`. Every exact quote is re-selected from the fresh bytes, with code-point offsets, prefix/suffix, quoteHash, occurrences, and JSON pointers verified by parsing. It also computes the six D9 chunk spans of the JATS (enclosing `sec`/`p`/`ack`/`notes`). Result: 0 failures, 78 locators.
- Wrote `assertions.yaml` in the five folders (kernel Assertion shape; `producedBy` fixture ids `mission:ft-D11-fixtures` / `run:ft-D11-<fixture>`). Counts: 16, 9, 8, 9 and 1 assertions, 5 assessments, 1 adjudication, 9 CaptureAttempts (8 + `ca-aps-notice-curl`). Also wrote `questions.md` and rewrote `source.md`; the first `kind:` line is now unstructured-to-entity / disconfirmation / harm / other / other, because the model stubs had non-contract kinds `identifier-bridge` and `capture-failure`.
- `bin/build_intents.mjs` wrote five `intent.json` files and validated them with `@bks/contracts` IngestionIntent (dist). All five pass. capture-failures is partial by design (CaptureAttempts come from the capture layer). Requested schemes `SPL_SET_ID` and `GRAS_NOTICE` are flagged.
- `bin/check_fixtures.mjs` checks the records: every assertion has asserter, locators, predicate, subject, object/literal, validTime and producedBy; every locator reference resolves (including cross-fixture `#` refs); every question id is in 02. The first run found 11 identifier/structural assertions without validTime, which were fixed.
- Corrections to model-stage stubs:
  - The ICTRP timeout's subject is NCT04488601 (PEARL), not the NR trial.
  - The Firecrawl CT.gov md hash is `c5dfbf2b…`.
  - The DailyMed history has 10 versions (no v8).
  - Retraction Watch is the only Crossref `updated-by` source for PMID 12003802, so there is no publisher/erratum disagreement in this case.
- Registry and packet updates:
  - `tooling/action-space.yaml`: `publisher-pages` entry added (59 entries), `fixturesStageUpdate`, openfda-drug-label `exercised` extended.
  - `08-sources-and-tools.md` generated from the registry (59 rows plus the exercise, breakage, rendition and gap sections).
  - `_notes/tool-log.md` §C rows 43–50.
  - `11-open-questions.md` items 25–30.
  - `02-questions.md` Q-D11-01 fixture → yes.
  - `06-node-register.yaml` populatedBy + publisher-pages.
- Problems:
  - A bash heredoc holding the whole 08 file failed on quoting. It was rewritten with the Write tool and concatenated.
  - HAS_IDENTIFIER direction in a Cypher sketch was reversed; fixed to holder → Identifier.
  - One unverifiable qualifier ("24 completed") was removed before it reached a file of record.
- `node scripts/packet-check.mjs D11`: ok (nodeTypes 1, relationshipTypes 0, pairs 0, questions 30, fixtures 5).

### 2026-10-08 — Wave 2 check stage (A8, D11)

- Read: 01-PACKET-CONTRACT, 00-DIRECTIVE (in full), `scripts/packet-check.mjs`, every D11 file. Also read A1's current kernel (`packets/K/04-schema-proposal.graphql`, sha256 `790e7244…8c71`, 1,193 lines) with K `identifier-schemes.yaml` v2, `10-seams.yaml` and `11-open-questions.md`. Read the D3 (A4), D1 (A2), D6/D7 (A6), D8 (A7) and D9 SDLs for the seam names. Read the competency catalog rows for the external CQ ids.
- `node scripts/packet-check.mjs D11` → ok at the start and at the end.
- Audit beyond the script. Scratch scripts are in `ft/D11/bin/` (`audit.mjs`, `audit2.mjs`, `spotcheck.mjs`, `codes.mjs`, `dist.mjs`, `bcount.mjs`, `yamlcheck.mjs`); output is in `ft/D11/check/`.
  - Question ids. Five ids were referenced but not declared in 02:
    - CQ-ST-08 belongs to D3; CQ-ID-02 and CQ-AX-06 belong to D6. They are now written `D3:CQ-ST-08`, `D6:CQ-ID-02` and `D6:CQ-AX-06`, with a new `blocksOtherPackets` list in action-space gaps G1, G7 and G8 and the matching 08 table cells.
    - CQ-AX-27 and CQ-PV-01 are catalog-only references in notes and RUNLOG; they are now marked `catalog:`. CQ-PV-01 is unowned by any packet, recorded as open question 31.
    - Re-check: every unqualified id resolves in 02 (30/30).
  - 05 → 03: 0 relationships. All 9 predicateOnly entries cite questions that have a 03 section (30 sections for 30 questions).
  - populatedBy: 06 held one prose item ("every tool in …"). It now lists only registry ids, and all 11 are rows in 08; the prose moved to `populatedByNote`. 59/59 registry ids are rows in 08, and every entry has all PLAN 6.3 fields. Readiness distribution 3:18 · 2:23 · 1:6 · 0:12; 10 gaps.
  - Fixture vs node:
    - `capture-failures-coverage` had `requestDigest` (`String!`, an identity key) missing on 7 of 8 attempts and a placeholder sentence on ca-01. The APS attempt in `resveratrol-retraction-integrity` had none.
    - Computed `sha256("GET " + requestUri)` for all nine from the stored, credential-free URIs. Rule documented in the fixture header; the ca-02 note was corrected (same digest as ca-01, distinct by attemptedAt; open question 28).
    - All other fields and enum values match the SDL, and no requestUri carries a credential parameter. `check_fixtures.mjs` → consistent.
  - Quote spot-check: re-fetched the DailyMed SPL XML (set 19880f51, v11) and the Europe PMC JATS (PMC5876407) into `ft/D11/check/refetch/` at 2026-10-08T22:21Z.
    - Both are byte-identical to the fixture snapshots (sha256 `78a1edf8…` and `dd620181…`).
    - All 21 locators on them re-select at their code-point offsets with matching quoteHash: 10/10 SPL, 11/11 JATS.
  - Directive discipline:
    - SUPPORTS/CONTRADICTS appear only as HAS_EVIDENCE roles from an Assertion or Assessment to a SourceLocator.
    - MENTIONS appears only as the D9 Chunk → entity derived projection.
    - There are no good/bad properties (readiness lives in config).
    - 17/30 questions are harm (57 %).
    - SDL: CaptureAttempt + 3 enums; no kernel type or enum re-declared (names checked against the kernel); Entity fields listed verbatim.
    - No derived fields exist. No unions.
  - Seams: every relationship type and label used in 03 and in the fixtures exists in some packet SDL.
    - Fixed: `SPONSORED_BY` (Q-D11-08 pattern, 10-seams) does not exist in A4's D3. Re-pointed to `HAS_STUDY_ROLE` (Study → StudyParty, `roleKind`), as the fixture already used. `funded_by` predicateOnly narrowed to Publication.
    - Open question 32.
  - Kernel identifier register v2: five D11 requests already exist under kernel spellings.
    - Renamed in identifier-bridges, the GSRS fixture, questions.md, 08, 09 and 11: FDA_NDI, FDA_GRN, RW_RECORD, UDI_DI, NIH_PROJECT.
    - Regenerated the five intents with `build_intents.mjs`; all validate against `@bks/contracts`. Only the GSRS intent changed (GRAS_NOTICE → FDA_GRN).
    - SPL_SET_ID, EIN and ORG_STUDY_ID are still missing from K (open question 34).
  - Size estimate in 09 = packet-check counts (1 / 0 / 0, questions 30, fixtures 5); stale "58 entries" in 09 fixed to 59.
- Compile check against the current kernel.
  - Recipe: `compile.graphql` = A1 `04` + blank line + D11 `04`. Command: `BKS_SCHEMA_PATH=<abs> NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <abs out>`; files in `ft/D11/check/compile/`. No breakage.
  - Kernel alone: 345,273 bytes / 6,927 lines / 192 inputs. This reproduces A1's model-stage number.
  - Kernel + D11: 360,647 / 7,255 / 197, i.e. +15,374 bytes and +5 inputs. The five inputs are CaptureAttemptWhere, CaptureAttemptSort and three enum filters.
  - Alternative (SourceSnapshot properties): 349,303 / 7,043 / 194.
  - Output is deterministic. Build is under 1 s; about 3.9 s wall including pnpm start-up.
  - 09-reasoning size table and decisions, plus 11 item 1, updated. 09 risk 8 updated with A1's response (K reads CaptureAttempt in its CQ-AX-04 pattern and lists the seam).
- SUMMARY.md written (46 lines).
- Problems:
  - The Write tool refused SUMMARY.md as a "report file"; it was written with a bash heredoc instead, since it is a contract deliverable.
  - A bash heredoc containing a fenced code block failed to parse; this entry was staged as a scratch text file and appended with Python.
  - `node` cannot resolve MSYS `/c/...` script paths; used `C:/...`.
  - The first audit regex counted packet-qualified ids as bare ids; it was fixed with a lookbehind.

### 2026-10-08 — Adversarial review (A8, D11)

Two reviewers (evidence integrity E1–E8, model discipline M1–M12, numbered in the order received). Each finding was verified first; sources were re-fetched (tool-log section D, rows 51–55; scratch `ft/D11/review/`). Nothing was deleted without saying so.

Evidence integrity:
- E1 Crossref NR record (01 lines 52/59) → **fixed**. Re-fetched: `abstract` present, `funder` and `clinical-trial-number` keys absent, deposited 2022-12-20. 01 now says "no `funder` field" and "no funder and no clinical-trial-number deposit; an abstract is deposited" (row 51).
- E2 nppes-npi readiness 3 never exercised by number → **fixed** by exercising it. `npi_search` (organisation) → `npi_validate` → `npi_lookup` 1881018208 (Mayo Clinic, organisational): found with status, enumeration and update dates, taxonomy and address. Readiness 3 kept for lookup by number; the 08 row and the registry `exercised` now say "identity by name 1; lookup by number 3" (row 54). No personal data stored.
- E3 DailyMed "versions 1–11" → **fixed** in 01, `_notes/tool-log.md` row 24 and identifier-bridges.yaml: 10 published versions (1–7, 9–11; no v8), re-fetched (row 52). The sirolimus fixture's questions.md already said so.
- E4 history.json hash drift → **fixed**: the snapshot entry in sirolimus `locators.yaml` now notes that the hash covers `metadata.db_published_date`. Re-fetch: 1,046 B, sha256 473e69a1…; reproduction by quote re-selection or a projection without the metadata.
- E5 01 headline and firecrawl-cli count → **fixed**. Regenerated from action-space.yaml: 45 tools; 17/20/5/3. The firecrawl-cli `exercised` field now adds the fixtures-stage 4th scrape (row 48) and the review's MCP metadata scrape (row 55).
- E6 PubChem xrefs count → **fixed**: "106 and 89 strings" (re-fetched, row 53).
- E7 brand-page alt text → **fixed**: leading ellipsis, the opening words of the full alt text, Tavily capture sha256 `4f1ea6f5…2df2`, and a variant dependence note (30-ct vs the live 180-ct image). Not re-verified live; the alt text is only in the Tavily capture, and the text says so.
- E8 APS TDM reservation → **fixed**: confirmed by a Firecrawl MCP scrape (row 55): tdm-reservation 1, tdm-policy URL, robots noarchive/noindex, dc.Rights. Recorded under `rights` on the snapshot in resveratrol `locators.yaml`, and in the 08 and registry `publisher-pages` gap. Handling: short quotes only; the full rendition stays in scratch. Related K item 15 (per-fragment rights).

Model discipline:
- M1 CQ-AX-04 pattern wrong on D11's own fixture, contradicting K → **fixed**. The pattern is rebuilt on K's definitions: MEASURED_ABSENT is a POSITIVE NO_* assertion with DIRECT_MEASUREMENT; NOT_REPORTED_BY_SOURCE is a FIELD_NOT_REPORTED on a COMPLETE snapshot; FIELD_NOT_REPORTED and NEGATIVE assertions are excluded from REPORTED; FAILED/PARTIAL gives UNKNOWN_BLOCKED; otherwise UNKNOWN_NEVER_QUERIED. Subject or object matching lets REPORTS_ON count. The fixture query is now byte-identical to the pattern, and its state names match 02. Hand check on the fixture: pubmed → NOT_REPORTED_BY_SOURCE. 11 item 35 (request to K), item 26 addendum.
- M2 CaptureAttempt broader than its justification → **fixed**. Dropped the EMPTY_RESULT and CAPTURED outcomes, `resultCount`, and the ToolActionKind/`actionKind` enum and field. `snapshotUid` is kept for PARTIAL only. whyNode and 11 item 1 now give K's value 2 / neutral for CQ-AX-04. The fixture's former ca-08 is now snapshot + f01 only (7 attempts plus `ca-aps-notice-curl`). 11 item 36.
- M3 re-declared shared question ids → **fixed**. Six rows (K CQ-AX-04 and CQ-AX-07; D1 CQ-ID-04; D9 CQ-PV-02, 04 and 05) now copy the owner's text, audience, value and polarity verbatim. Harm count is 15/30 (50 %). Merge rule: 11 item 37.
- M4 bitemporal table / Q-D11-04 `r.validFrom` → **fixed**. REPORTS_ON, REVISES, ADMINISTERS and HAS_ACTIVE_MOIETY are marked recorded-only in 09, 03 and 10, each verified in the sibling SDLs. Q-D11-04 returns `notice.publishedAt AS revisedOn`, `r.revisionKind` and `r.recordedFrom`. No D3 request is needed (11 item 38).
- M5 predicate overlaps with D5/D6/D8 → **fixed**. Dropped has_boxed_warning, recall_names_product, adverse_event_report_names_product and label_version_of. Q-D11-11 now reads D5 USE_CONSTRAINED_IN with `section:BOXED_WARNING`; Q-D11-18 reads D8 RECALL `CONCERNS` (+ `LOT_OF`) and D5 CAUSES_ADVERSE_EFFECT `sourceKind:SPONTANEOUS_REPORT`. The sirolimus fixture (assertions, intent, questions, source) was re-pointed. Seams (`CONCERNS`, `LOT_OF`, predicateSeams) were added, and D5 was asked to add BOXED_WARNING (11 item 39). All 5 intents re-validated against `@bks/contracts`.
- M6 filterable actionKind/httpStatus → **fixed**. ToolActionKind was dropped; `httpStatus` is non-filterable and removed from 06 filterProperties. Compile: −1,346 B and −1 input.
- M7 Occurrence label → **fixed**: `["CaptureAttempt", "Entity"]`; archetype-label question is 11 item 40.
- M8 identity keys and privacy → **fixed**. `identityKeys: [uid]` with uid = hash(runId|toolId|requestDigest|attemptedAt). The privacy rule now covers queryText: person names are stored as a digest only, with privacyClass INTERNAL, because the kernel has no RESTRICTED (11 item 44).
- M9 Q-D11-07 → **fixed**. The floor is read from registry gap G1. The attempt lookup moved before the diff, so a study with fewer than two versions still returns its evidence. The trace is corrected: the 403 page was hashed, not kept, and there is no snapshotUid.
- M10 predicate casing → **fixed**: SCREAMING_SNAKE in 05, 03 and the fixtures (assertions and intent). DECLARES_NO_COMPETING_INTEREST keeps NEGATIVE/DENIES, as a denial in K's sense. 11 item 43.
- M11 D5 targets consumer list → **fixed on D11's side**; the request to D5 is 11 item 41.
- M12 conflicts missing from 11 → **fixed**: items 35–44 (owners K, synthesizer, D3/D1, D5, D8/D6).

Rebutted: none. Two findings were narrowed rather than rejected: E2 was resolved by running the missing lookup instead of lowering the score, and E7 is cited to the Tavily capture because it cannot be re-verified live.

Check-stage open issues (check-issues.json D11):
- Cross-packet ids: still the synthesizer's call (items 31 and 37). catalog:CQ-PV-01 is still unowned.
- requestDigest canonical form: still open (items 28 and 33, G10).
- SPL_SET_ID, EIN and ORG_STUDY_ID: still absent from A1's register. FDA_GRN and FDA_NDI are still `requested`; re-checked 2026-10-08.
- TOOL_RENDITION: still absent from the kernel.
- D9 files touched by another agent: unchanged by D11.

Compile, from the A8 worktree with A1's current kernel (sha256 `b2c2b1b0…d5c7`, uncommitted A1 edits, so a snapshot):
- kernel alone: 322,904 B / 6,466 lines / 179 inputs.
- kernel + D11: 336,932 / 6,745 / 183, i.e. +14,028 B (+4.3 %), +4 inputs, +3 object types, +2 enums.
- The pre-review module on the same kernel gives 338,278 (+15,374 / +5), the same marginal cost as before.
- The output is deterministic and ~0.3 MB, not the 55 MB pinned schema.
- Files: scratch `ft/D11/review/compile/`.

Other checks:
- packet-check D11 → ok: 1 / 0 / 0 / 30 / 5.
- SUMMARY and 09 updated to match (harm 15, 50 %; cost; 7 attempts).
- Problems: one bash heredoc with nested quotes failed to parse. Edits were moved to Python scripts in scratch `ft/D11/review/*.py`, run with `python -I`.

### 2026-10-08 — Cross-packet pass: merged action space (A8, D11)

- Scope: all fourteen packets final after adversarial review. Read every packet's `08-sources-and-tools.md` and `_notes/tool-log.md` from its worktree (A1–A8), plus each `05` (populatedBy), `02` (value, polarity, sources), `01` (S-key definitions) and `06` (identifierSchemes), and the K register `packets/K/identifier-schemes.yaml` v2. Read-only outside `packets/D11/`; nothing committed.
- Generator (reproducible, deterministic; `--check` exits 0 on a second run): `_notes/action-space/build-action-space.mjs`, with the judgment in `_notes/action-space/merge-spec.yaml` (160 alias rules, 108 new canonical entries, match patterns, 6 readiness overrides with reasons, 25 gap clusters, scheme detection with include/exclude lists) and D11's own 59 scored entries moved to `_notes/action-space/d11-local-registry.yaml` (formerly `tooling/action-space.yaml`). Run: `node schema/program/packets/D11/_notes/action-space/build-action-space.mjs` from the worktree root.
- `tooling/action-space.yaml` (generated, version 2): 167 merged entries (144 external, 23 internal BellLabs tools) from 343 sibling rows + 59 D11 rows; top-level `aliases` maps all 402 packet-local ids to canonical ids (D11 ids kept as canonical); 0 unmatched rows, 0 unresolved `populatedBy`, 0 unknown question ids. Each entry carries the PLAN 6.3 fields plus `exercisedBy` and `blockedQuestions`; 429 of 453 catalogued questions resolve to at least one entry.
  - External readiness: 3 → 35 · 2 → 51 · 1 → 35 · 0 → 21 · unscored → 2 (`foodon`, `efsa-food-composition`). Internal (K scale): 3 → 3 · 2 → 8 · 1 → 8 · 0 → 4.
  - Priority: P0 52 · P1 74 · P2 11 · P3 30.
- `tooling/readiness-scorecard.md` (generated): summary, readiness × domain scorecard, entries by level, internal tooling, 25 gaps ranked by blocked questions, top 40 entry-level gaps, custom tooling to build, readiness disagreements, identifier coverage, method and caveats. Top five gaps: G4 capture normalizer / text-projection registry (217 questions, 82 value-1), G13 intent contract v1 extensions (136, 64), G11 selector builder and verifier (134, 55), G6 keys, quotas and service identity (116, 44), G12 byte-faithful capture and durable artifact storage (105, 36).
- `identifier-bridges.yaml`: header note plus a generated `reconciliation` block (114 codes: K v2's 103, every node register's schemes, D11 bridge rows), with kernel status, node types, D11 row, detected routes and pattern differences. Missing from K: SPL_SET_ID, EIN, ORG_STUDY_ID, NCIT (optional), and D12's FNDDS_FOOD_CODE, NDB_NUMBER, FOODON, PHENOL_EXPLORER_FOOD, FOODEX2, LANGUAL, WWEIA_CATEGORY.
- `11-open-questions.md`: item 23 marked resolved; new items 45–52 (populatedBy/captureMethod rewrite, scheme requests to K, pattern differences, schemes with no route, `access: internal`, priority scales, readiness adjudications, build order).
- Also updated: `08-sources-and-tools.md` (intro: D11-local rows vs merged registry), `09-reasoning.md` (registry line), `SUMMARY.md` (registry line).
- `node scripts/packet-check.mjs D11` → exit 0 (`ok: true`; nodeTypes 1, relationshipTypes 0, pairs 0, questions 30, fixtures 5).

### 2026-10-08 — Cross-packet pass: finalize (A8, D11)

- `node scripts/packet-check.mjs D11` → exit 0 (`ok: true`; 1 / 0 / 0 / 30 / 5). `build-action-space.mjs --check` → exit 0: the generated registry, scorecard and reconciliation block match the sibling packets as they stand now.
- `SUMMARY.md`: header; new sections "Cross-packet deliverables" and "Open questions for the owner".
- `09-reasoning.md`: header; decision 4 lists the D12 schemes missing from K; new section "Cross-packet pass: merged action space" covering the generator, canonical ids, readiness, priority and gap-ranking rules, `access: internal`, and the free-text `captureMethod` limit. Risk 7 updated.
- `08-sources-and-tools.md`: removed the stale "cross-packet pass pending" phrase from the intro.
- Handoff below rewritten to the final state.

### 2026-10-09 — Close-out: pattern lint (A8, D11)

- Input: S `final/_work/pattern-lint.json` D11: 30 blocks, 30 failing, 30 packetBug, 0 rulingBroken.
- `03-retrieval-patterns.md`, packetBug fixes:
  - All 30 blocks: removed the `CYPHER 25` prefix. Neo4j 5.26 rejects it; the blocks are Cypher 5.
  - CQ-AX-04 and Q-D11-22: Cypher 5 allows a dynamic label only in MATCH, not WHERE. Changed `WHERE x:$($label)` to `MATCH (x:$($label) {uid: $uid})`, and `WHERE n:$(e.label)` to `MATCH (n:$(e.label))`.
  - Q-D11-16: removed the implicit grouping key. The hypotheses are now collected in a `WITH`, and the verdict reads `size(hypotheses)`.
  - CQ-AX-14 and Q-D11-10: the kernel has no `Mention` node. The surface form is now the `SourceLocator` that a RESOLUTION Assessment cites with role CONTEXT, following K Q-K-13. The licensed `MENTIONS` edge is read from a D9 `Chunk` through `derivedFromAssessmentUids`.
  - CQ-PV-04: `DECLARES_COMPONENT` (ComponentLineProperties) has no `quantityBasis`, and `QuantityBasis` has no `UNSPECIFIED` value. The query now reads `line.massBasis` / `line.amountBasis` and `ic.massBasis`. `basisRisk` is true when the D1 `MassBasis` is UNSPECIFIED or null on either side.
  - The Conventions line no longer lists `Mention` among the HAS_EVIDENCE holders.
- The same errors appeared outside `03` and were fixed there too:
  - `07-fixtures/capture-failures-coverage/assertions.yaml` `queries.CQ-AX-04`: no `CYPHER 25`, MATCH dynamic label. It is still identical to `03`.
  - `05-relationship-register.yaml` (deferred-edge reason), `06-node-register.yaml` (deferred-node reason) and `09-reasoning.md`: the text no longer says "Mention + RESOLUTION Assessment".
  - No SDL change.
  - The `Mention` node in fixture `nr-chloride-gsrs-identifier-bridge` is left as is. It is the FU-03 residual already listed in S `fixtures/README.md`.
- Lint: `node C:/…/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D11 --json <scratchpad>/lint-D11.json --md <scratchpad>/lint-D11.md` → D11: 30 total, 26 ok, **0 packetBug**, 4 rulingBroken, cypher25 0.
  - The 4 rulingBroken blocks were left in packet names: Q-D11-05, Q-D11-19 and CQ-PV-05 (R-42), and Q-D11-08 (R-82). S writes the final-SDL versions.
- TL-04, `_notes/action-space/build-action-space.mjs`:
  - New `quoteFlowScalars()` double-quotes every string inside a flow sequence or flow map. A flow-map key stays plain only when it is a bare word.
  - It also quotes, anywhere, any string that a YAML 1.1 resolver would type as non-string: bool, int, float, null, merge, value or timestamp. One example is `scoredAt: 2026-10-08`, which PyYAML reads as a date.
  - It applies to `tooling/action-space.yaml` and to the generated reconciliation block of `identifier-bridges.yaml`.
  - The hand-written `identifier-bridges.yaml` `scoredAt` is now quoted as well.
  - Regenerated. `--check` → exit 0. The summary JSON is byte-identical to the run before the change, and `readiness-scorecard.md` is unchanged.
  - Node yaml parse before vs after: deep-equal for both files. Node yaml vs PyYAML `safe_load` after: deep-equal for both files.
  - Every D11 `*.yaml` file now loads with PyYAML.
- `node scripts/packet-check.mjs D11` → exit 0.
- Not committed.

## Handoff

- packet-check: `node scripts/packet-check.mjs D11` → exit 0 (2026-10-08, re-run after the cross-packet pass):

```json
{
  "ok": true,
  "packet": "D11",
  "counts": {
    "nodeTypes": 1,
    "relationshipTypes": 0,
    "pairs": 0,
    "questions": 30,
    "fixtures": 5,
    "budget": {
      "nodes": 8,
      "rels": 14,
      "pairs": 35
    }
  }
}
```

- Counts vs budget: node types 1/8, relationship types 0/14, pairs 0/35, widest union none, questions 30 (15 harm = 50 % at owner polarities), fixtures 5 (78 locators). No EXCESS lines needed.
- Executable cost vs A1's kernel (sha256 `b2c2b1b0…`, adversarial review): +14,028 bytes (+4.3 %), +4 input types, +3 object types, +2 enums. The cross-packet pass did not touch `04`.
- Fixtures (`07-fixtures/`):
  - `nr-trial-jats-unstructured`: unstructured-to-entity, the 3.8 path on PMC5876407 / NCT02921659.
  - `resveratrol-retraction-integrity`: disconfirmation. Three REVISES asserters and the Q-D11-05 taint query; the notice is a tool rendition.
  - `sirolimus-spl-boxed-warning`: harm. SPL boxed warning, LOINC 34066-1, valid from 2024-04-30, using D5 predicates.
  - `nr-chloride-gsrs-identifier-bridge`: other. Identifier co-attachment and a rejected Europe PMC ChEBI mislink.
  - `capture-failures-coverage`: other. 7 FAILED CaptureAttempts under one Activity, plus snapshot + FIELD_NOT_REPORTED for the empty PubMed search; credentials stripped, requestDigest computed.
- Cross-packet deliverables (all generated; regenerate with `node schema/program/packets/D11/_notes/action-space/build-action-space.mjs` from the worktree root, verify with `--check`):
  - `tooling/action-space.yaml` v2: 167 entries (144 external, 23 internal) from 343 sibling rows + 59 D11 rows, 402 aliases, 25 ranked gaps; 0 unmatched rows, 0 unresolved `populatedBy`, 0 unknown question ids; 429 / 453 questions resolve. External readiness 3/2/1/0/unscored = 35/51/35/21/2; internal 3/8/8/4; priority P0 52 · P1 74 · P2 11 · P3 30.
  - `tooling/readiness-scorecard.md`: readiness × domain, gaps ranked, custom tooling to build, readiness disagreements, identifier coverage.
  - `identifier-bridges.yaml`: 33 schemes, 22 bridges, and a generated `reconciliation` block (114 codes).
  - Inputs: `_notes/action-space/merge-spec.yaml` (all merge judgments), `_notes/action-space/d11-local-registry.yaml` (D11's 59 scored entries, the source for `08`).
- Open questions for the owner (`11-open-questions.md`):
  - Item 1: keep `CaptureAttempt` in the graph. A1 reads it in K's CQ-AX-04; the final call is the owner's.
  - Items 3 / 25: TOOL_RENDITION hash basis.
  - Items 12–17: registry home, G1 history, G6 keys and quotas, G10 recorder, MCP policy, licences.
  - Items 28 / 33: the canonical requestDigest form.
  - Items 31 / 37: `<packet>:<id>` cross-packet question form and how shared catalog ids merge.
  - Item 44: a stricter PrivacyClass for operational records that touch personal data.
  - Item 45: kernel fixes `captureMethod` = `<registry id>/<version>`; synthesizer rewrites `populatedBy` through `aliases`.
  - Items 46 / 47: eleven schemes missing from K v2 (SPL_SET_ID, EIN, ORG_STUDY_ID, seven D12 food schemes, NCIT optional), and whether `pattern` validates raw or normalized values.
  - Item 48: sixteen node-register schemes with no exercised route.
  - Items 49–51: accept `access: internal`, one program-wide priority rule, the six readiness overrides.
  - Item 52: build order G4 → G13 → G11 → G6 → G12.
- Files changed since commit 24944b3 (adversarial review + cross-packet pass): 32 modified, i.e. every top-level packet file, `_notes/tool-log.md` and the files of four fixtures (the `nr-chloride-gsrs-identifier-bridge` fixture is unchanged); new files `tooling/readiness-scorecard.md`, `_notes/action-space/{build-action-space.mjs,merge-spec.yaml,d11-local-registry.yaml}`.
- Not committed (the coordinator commits per branch).
