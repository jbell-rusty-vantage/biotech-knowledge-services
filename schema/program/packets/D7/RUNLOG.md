# Run log — packet D7

## Claim

- agent: A6 (stage: RESEARCH, Wave 1; research → model → fixtures → check run as separate agents by the coordinator workflow)
- domains: D7 — Organizations, people and money
- worktree: C:\Users\Pinda\Proyectos\Biotech\biotech-knowledge-services-A6 (branch ft/schema-A6)
- base commit: e484fd2
- planned fixtures (candidates, final choice by the fixtures stage):
  1. Public scientist self-disclosure page (financial interests by company, role kinds, start years) — unstructured-to-entity path (directive 3.8) and the D9 recommendation → financial-interest seam.
  2. SEC proxy statement (DEF 14A) of a longevity consumer company — board, officers, beneficial-ownership table (stake percent), related-party transactions.
  3. SEC Form D of a private longevity biotech — related persons (executive officer / director / promoter), offering amount, date of first sale (investor lens).
  4. FTC action on undisclosed material connections of health influencers — harm / disconfirmation case (undisclosed financial interest).
  5. Journal article competing-interests / funding statement (ICMJE) — author affiliation versus funding versus equity (CQ-EC-04).
  6. Registry records (ClinicalTrials.gov sponsor/collaborator, NIH RePORTER, ORCID, NPI, GLEIF) as structured role sources.

## Entries

### 2026-10-08 — research stage start (A6)

- Read 00-DIRECTIVE, 01-PACKET-CONTRACT, 02-TEAM, D7 brief, PLAN §1/3/6, workspace START_HERE, W01 fragment page, actors domain page, Organization/Person cards, RoleEdgeProperties/OwnershipEdgeProperties, ConflictRelevanceAssessment card and enums, schema-map "Domain D2: Actors and institutions" (lines 1173–1963, read by range), size-report attribution table.
- Read competency questions CQ-CL-05, CQ-EC-01..04, CQ-MF-01, CQ-AX-18 and OPEN-QUESTIONS (priority 1 item 3, priority 2 items 2–4).
- `node scripts/packet-skeleton.mjs D7` → 16 files created. Scratch: `%TEMP%\claude\…\scratchpad\ft\D7\`.
- Tool status: `tvly --status` authenticated (v0.1.5); `firecrawl --status` authenticated (v1.23.1, 0/5 jobs). EDGAR_IDENTITY present in .env (read in-shell only, never printed).
- Kernel pattern (packets/K in worktree A1) not yet published at start of this stage (skeleton only).

### 2026-10-08 — research stage (A6): survey, questions, fixture candidates

- Tools (full list with failures in `_notes/tool-log.md`, 35 entries): Tavily CLI (search, extract), Firecrawl CLI (scrape) and MCP (search, scrape with PDF parser), PubMed MCP, NPI Registry MCP, curl against SEC EDGAR (submissions, Archives, EFTS), GLEIF, NIH RePORTER, ORCID, Europe PMC, ClinicalTrials.gov v2, CMS Open Payments, eCFR, Companies House web; probes of Companies House API and OpenCorporates (401 without keys).
- Captured 60+ raw artifacts in scratch `ft/D7/cap/`; sha256 for 17 candidates in `ft/D7/sha256.txt`.
- Problems: Tavily CLI cp1252 crash on Windows (fixed with PYTHONIOENCODING=utf-8); FTC bot-blocks curl (fake 404) — Firecrawl worked; eCFR needs `--compressed`; Attia disclosure list behind a JS modal (not capturable without browser); scanned FTC letter OCR noise; guessed brand/podcast URLs 404'd.
- Wrote `01-ecosystem.md` (actor types, artifact interviews for 10 artifact types with ≥ 2 instances except the frozen NIH FCOI record, four lenses, readiness table, 41 source keys), `02-questions.md` (33 rows: 8 reused CQ ids, 25 Q-D7; 18 harm/disconfirmation; answer kinds 25 retrieved / 6 assessment / 2 materialized), `_notes/fixture-candidates.md` (11 candidates with sha256 and verbatim quotes; unstructured-to-entity FC1 (also FC4, FC7); harm FC3; financial-interest D9 seam FC4), `_notes/research-notes.md` (before numbers for the Organization split, shapes A/B for the interest family, node candidates, enums, seams, privacy rule, open questions), `_notes/tool-log.md`.
- Before numbers (pinned IR): Organization 59 fields, 61 pairs via own fields, 104 pairs as endpoint; Person 22 fields; 305 pairs touch W01 types.
- `node scripts/packet-check.mjs D7`: questions = 33 parsed; remaining FAILs are SDL/fixtures (later stages).
- Not done in this stage (by instruction): SDL, registers, fixtures folders, 03/08–11, SUMMARY.

### 2026-10-08 — model stage (A6, Wave 2 part 1): retrieval patterns, module SDL, registers, reasoning, seams

- Read: 00-DIRECTIVE, 01-PACKET-CONTRACT, 02-TEAM, D7 brief, RUNLOG, 01-ecosystem (source keys), 02-questions, `_notes/research-notes.md`, `_notes/fixture-candidates.md`; kernel (worktree A1) `packets/K/09-reasoning.md` (pattern, ownership map, edge-property types), `04-schema-proposal.graphql` (interfaces, edge props, enums, Assertion/Assessment/Source*), `domain-template.graphql`, `identifier-schemes.yaml`, `11-open-questions.md`; W01 fragment page, Organization/Person cards, RoleEdgeProperties/OwnershipEdgeProperties cards, OrganizationType values; skills neo4j-modeling-skill, neo4j-graphql-skill, neo4j-gds-skill (projection/betweenness/nodeSimilarity syntax); sibling research notes for seam names (D3 HAS_STUDY_ROLE; D6 Product → D7 Brand and commerce roles on D6 types; D8 Facility/ACTION_AGAINST/RECORD_CONCERNS; D9 CQ-CL-05/CQ-CL-07 and "actor types are D7"; D13 INVOLVES and "money pattern → D7"). No sibling packet had SDL or a node register yet (only K).
- Wrote: `03-retrieval-patterns.md` (33 sections, one per question; conventions AS-OF / TRACE / OVERLAP), `04-schema-proposal.graphql` (4 node types, 7 relationship types, 9 pairs, 4 edge-property types, 13 enums), `05-relationship-register.yaml` (7 entries, 18 predicateOnly, 24 deferred), `06-node-register.yaml` (4 nodes, 9 deferred, 12 mergedInto), `09-reasoning.md`, `10-seams.yaml` (25 seams + 4 shared vocabularies), `11-open-questions.md` (24 entries), notes appended to `02-questions.md` (ids unchanged; CQ-CL-07 sources cell updated), id list appended to `08-sources-and-tools.md`.
- Fixture folders created with `source.md` stubs (url, title, retrieved, kind, capture digest, relationships to exercise): `07-fixtures/sinclair-self-disclosure-unstructured` (FC1+FC2, kind unstructured-to-entity), `ftc-ameribev-paid-dieticians-harm` (FC3, harm), `attia-cgm-dexcom-recommendation-interest` (FC4, D9 seam), `niagen-ownership-brand-history` (FC5+FC9+FC10), `elysium-paper-funding-award` (FC7, +FC8 optional), `bioage-group-vehicles-stale-role` (FC6, optional, disconfirmation). Removed the skeleton placeholder `07-fixtures/fixture-01`.
- Compile check (scratch `ft/D7/`): `compile.graphql` = A1 kernel SDL (copied to `compile/kernel.graphql`, sha256 0ad41559…39ea2c) + D7 module; no stub types needed (D7's SDL references only allowlisted kernel types). `BKS_SCHEMA_PATH=<abs compile.graphql> NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <abs out.graphql>` → builds first time. Kernel alone 326,564 B / 6,582 lines / 185 inputs; kernel + D7 452,069 B / 8,896 lines / 245 inputs (D7 marginal +125,505 B, +2,314 lines, +60 inputs).
- Shape A vs B measured with `ft/D7/variants/make.py` (generated variant SDLs, each compiled with the kernel): A 426,692 B / 233 inputs; B-plain 410,427 B / 230; pinned-style 9 typed edges 432,627 B / 248. Chose B (table and argument in 09-reasoning.md).
- `node packages/schema-workspace/dist/cli.js map --sdl <compile.graphql>`: kernel 12 types / 14 rel types / 50 expanded pairs → kernel + D7 16 / 21 / 91; Organization 2 relationship fields, 14 incoming (interface-expanded).
- Problems: two long Git Bash commands with several quoted heredocs failed to parse in the tool wrapper (cause not isolated; "unexpected EOF while looking for matching quote"); wrote the fixture stubs with the file tool instead. Python in Git Bash needs Windows paths (`cygpath -w`) for script arguments.
- `node scripts/packet-check.mjs D7`: counts nodeTypes 4, relationshipTypes 7, pairs 9, questions 33, fixtures 6; the only FAILs are fixture contents (locators.yaml, assertions.yaml, questions.md missing in the six folders) — for the fixtures stage.

### 2026-10-08 — fixtures stage (A6, Wave 2 part 2): fixtures from real sources; sources and tools

- Read: RUNLOG, 02-questions, 04 SDL, 05/06 registers, `_notes/fixture-candidates.md`, `_notes/tool-log.md`, fixture stubs; 00-DIRECTIVE §3.8–3.10 and §4; 01-PACKET-CONTRACT; kernel pattern and SDL in worktree A1 (`packets/K/09-reasoning.md`, `04-schema-proposal.graphql`: Assertion, SourceSnapshot, SourceLocator, Assessment, Mention, enums); `examples/ingestion-intent.example.json` and `packages/contracts/src/ingest.ts` / `common.ts`; `scripts/packet-check.mjs` fixture rules; D7 `03-retrieval-patterns.md` conventions (AS-OF, TRACE, OVERLAP).
- Re-captured every fixture source (tool log #36–47): Firecrawl CLI for the Sinclair page, three FTC documents (incl. the individual letter to the one named endorser) and three Attia pages; curl for SEC (Form D, two DEF 14A, 10-K, submissions JSON, declared User-Agent read in-shell), GLEIF, Europe PMC, NIH RePORTER (POST). SEC, GLEIF, Europe PMC and the Sinclair page are byte-identical to the research captures; the FTC PDF parse and the Attia full-page captures have new digests (recorded).
- Built in scratch `ft/D7/tools/`: `h2t.py` (LF projection), `build_locators.py` (85 locators from the captures; every `exact` copied at its offsets), `build_intents.mjs` (6 intent.json validated with the repo's zod IngestionIntent), `reselect.mjs` (verifier-style re-selection, evidence-ref and register-coverage check).
- Wrote 6 fixtures (each: source.md, locators.yaml, assertions.yaml, intent.json, questions.md): `sinclair-self-disclosure-unstructured` (kind unstructured-to-entity; 13 assertions incl. a held Form D assertion, 2 mentions, 4 assessments, the 3.8 walk with chunk spans), `ftc-ameribev-paid-dieticians-harm` (kind harm; RECEIVES_VALUE_FROM PAID_ENDORSEMENT asserted by the FTC with "It appears" in qualifiers), `attia-cgm-dexcom-recommendation-interest` (kind other; RECOMMENDS claim occurrence + in-container disclosure → HOLDS_ROLE ADVISOR + RECEIVES_VALUE_FROM; HOLDS_STAKE Kosterina; CONFLICT_RELEVANCE and QUALITY assessments; Q-D7-20 ceiling), `niagen-ownership-brand-history` (kind other; MAY_BE_DEEMED chain, directors, NHSc threshold exit, GLEIF PARENT_OF, Healthspan PARENT_OF/OWNS_BRAND episodes, FORMER_NAME), `elysium-paper-funding-award` (kind other; Award/AWARDED_BY/AWARDED_TO incl. NIH RePORTER AWARDED_TO → Person), optional `bioage-group-vehicles-stale-role` (kind disconfirmation). producedBy ids are fixture-scoped (mission:ft-D7-fixtures / run:ft-D7-<fixture>).
- Wrote `08-sources-and-tools.md` (scored table: 32 registered ids + 6 more; what broke; custom tooling). Appended tool log #36–52 and 11-open-questions (OQ-D7-17/18 resolved; new OQ-D7-25..27).
- Problems: (1) Windows CRLF in the HTML text projection broke 29 of 85 locators until projections were written with LF; (2) FTC PDF-to-markdown output differs between runs (snapshot identity); (3) Attia disclosure list still script-gated; (4) intent v1 cannot express object-bound Assertions without edges, claim occurrences, Assessments or a Source subject (carried as literals or omitted with a note); (5) two Git Bash heredoc edits of Python source mangled `'\n'` escapes — rewrote the file with the file tool.
- `node scripts/packet-check.mjs D7` → ok: true (nodeTypes 4, relationshipTypes 7, pairs 9, questions 33, fixtures 6). `reselect.mjs` → 85/85 locators re-selected, all 7 register relationship types exercised by their register fixture.

### 2026-10-08 — check and handoff stage (A6)

- Read: 00-DIRECTIVE, 01-PACKET-CONTRACT, RUNLOG, 02, 03, 04, 05, 09, 10, 11, all fixture assertions; the current kernel in worktree A1 (`packets/K/04-schema-proposal.graphql` sha256 `790e7244…8c71`, diffed against the model-stage copy `0ad41559…39ea2c`; `09-reasoning.md` M9–M11 and "Kernel requests from domain packets"; `11-open-questions.md`); sibling packets' `04-schema-proposal.graphql` and `10-seams.yaml` in worktrees A1–A8 (D1, D3, D4, D5, D6, D8, D9, D10, D11, D13) for every edge into Organization / Person / Brand / Award.
- Audit beyond packet-check (scratch `ft/D7/check/aud.py` + greps):
  - question ids: every id referenced in the packet exists in 02, after two cross-packet ids (a D13 and a D1 question) were replaced by descriptions;
  - patterns: every 05 relationship has its 03 section; three cited questions did not use the relationship in their section (PARENT_OF in CQ-EC-02; AWARDED_TO in CQ-EC-04, Q-D7-16), so the patterns were extended;
  - populatedBy: all 32 populatedBy ids are rows in 08;
  - directive discipline: no SUPPORTS/CONTRADICTS/MENTIONS declared; no good/bad properties; no kernel or sibling type name re-declared; 18/33 harm; aggregate false, and nestedOperations is set on all 9 fields;
  - size: 09 equals packet-check (4/7/9).
- Kernel changes absorbed:
  - AWARDED_TO → `AssertedRecordedProperties` (M10).
  - The superset rule (M11) resolves OQ-D7-01: field order was checked against `AssertedEdgeProperties`.
  - Conflict-relevance facets → `conclusionCode` / `facets` (M9). The fixtures had used 3 unregistered values; these are now registered, and every fixture Assessment carries `conclusionCode`.
  - `observedAt` stays on D7 edges as the copy of `Assertion.validObservedAt` (OQ-D7-07).
- Seams reconciled with sibling SDL (10-seams rewritten):
  - Renamed: HAS_BRAND → BRANDED_AS; FUNDED_BY_AWARD → HAS_STUDY_ROLE {roleKind FUNDING_AWARD} (D3 StudyParty union); SELLER_OF_RECORD_FOR → SELLER_OF_RECORD; ACTION_AGAINST / RECORD_CONCERNS → ADDRESSED_TO / ISSUED_BY; SPONSORS → CONTENT_SPONSORED_BY; D9.Account → D9.Channel.
  - Added: NAMES_RESPONSIBLE_PARTY, COVERS, ASSIGNED_TO, LICENSED_TO, PERFORMED_BY_LAB, APPEARS_IN, ASSOCIATES (D10).
  - Removed: Facility OPERATED_BY (D8 deferred Facility).
  - MANUFACTURED_BY / SUPPLIED_BY → predicate-only MANUFACTURES / SUPPLIES_MATERIAL, because no module types them (OQ-D7-28). The 03 patterns were updated to match (incl. D6 productKind instead of IN_CATEGORY; D3 arm/component path in Q-D7-22).
- Spot-check of two quotes by re-fetching:
  - (1) BioAge DEF 14A via curl with the SEC User-Agent (read in-shell, not printed): bytes identical to the fixture snapshot (sha256 `d6c25348…`), both Pande quotes present.
  - (2) Attia CGM article via Firecrawl MCP (`directQuote`, `maxAge 0`): both quotes verbatim, but page metadata reads `article:modified_time` 2024-12-09. An Internet Archive `id_` capture of 2021-06-21 (sha256 `6a0f500a…b63f`; availability API worked, CDX endpoint "Temporarily Offline") has the recommendation and **no** Dexcom disclosure.
  - Attia fixture corrected:
    - new snapshot `snap-attia-cgm-wb2021` and 4 locators (loc-cgm-closing, loc-wb-date, loc-wb-proponent, loc-wb-closing);
    - r-02 / r-03 now have observedAt 2026-10-08, with validObservedAt and a qualifier;
    - new r-06 FIELD_NOT_REPORTED;
    - as-cr-01 now reads temporalOverlap UNKNOWN and disclosureFinding DISCLOSED_IN_LATER_REVISION (new registered value);
    - questions.md and source.md updated; rule DISCLOSURE TIMING added to 03; OQ-D7-31; 08 row `tool:wayback-archive`.
- Tools rerun (scratch `ft/D7/tools/`; fixtures-stage copies kept as `*.fixtures-stage.*`):
  - `build_locators.py`: 89 locators;
  - `build_intents.mjs`: 6 intents valid; the 5 untouched fixtures were rebuilt byte-identical, which confirms their locators are unchanged;
  - `reselect.mjs`: 89/89 re-selected, all 7 relationship types exercised by their register fixture.
- Compile check (scratch `ft/D7/compile2/`): `cat <A1 kernel> 04-schema-proposal.graphql > compile.graphql`; `BKS_SCHEMA_PATH=<abs> NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <abs out>`.
  - Kernel alone: 345,273 B / 6,927 lines / 192 inputs.
  - Kernel + D7: 474,849 B / 9,298 lines / 254 inputs (D7 marginal +129,576 B / +2,371 / +62), about 1 s each, no stubs, no breakage.
  - `schema-workspace map`: 53 → 98 expanded pairs.
- Problems:
  - The Write tool refused a full rewrite of SUMMARY.md (subagent report-file guard); the skeleton was filled with Edit instead.
  - Long Git Bash heredocs with mixed quotes still fail to parse in the tool wrapper; patches were written as scratch Python files.
  - Curl in Git Bash needs a Windows path for `-o`.
  - The Internet Archive CDX listing was offline.

## Handoff

**packet-check** (`node scripts/packet-check.mjs D7`, exit 0, 2026-10-08 after the last edit):

```json
{ "ok": true, "packet": "D7", "counts": { "nodeTypes": 4, "relationshipTypes": 7, "pairs": 9, "questions": 33, "fixtures": 6, "budget": { "nodes": 8, "rels": 14, "pairs": 35 } } }
```

**Counts vs budget:**

| measure | count | budget |
| --- | --- | --- |
| node types | 4 | 8 |
| relationship types | 7 | 14 |
| pairs | 9 | 35 |
| relationship fields per type (Person 3, Award 3, Organization 2, Brand 1) | max 3 | 12 |
| unions | 0 | — |
| derived edges | 0 | — |
| questions (18 harm = 55 %) | 33 | 15–40 |
| fixtures | 6 | ≥ 3 |

- No EXCESS lines are needed.
- Executable marginal: +129.6 KB / +62 inputs over the kernel.
- Organization fields: 59 → 2.
- W01 pairs: 305 → 30.

**Fixtures** (`07-fixtures/`):

| fixture | kind | covers |
| --- | --- | --- |
| `sinclair-self-disclosure-unstructured` | unstructured-to-entity (3.8 walk) | HOLDS_ROLE; Form D link held behind RESOLUTION |
| `ftc-ameribev-paid-dieticians-harm` | harm | RECEIVES_VALUE_FROM, regulator-hedged |
| `bioage-group-vehicles-stale-role` | disconfirmation | group vs vehicles; closed role |
| `attia-cgm-dexcom-recommendation-interest` | D9 financial-interest seam | recommendation → reachable interest; disclosure timing disconfirmed in this stage |
| `niagen-ownership-brand-history` | ownership | HOLDS_STAKE, PARENT_OF, OWNS_BRAND |
| `elysium-paper-funding-award` | funding | AWARDED_BY, AWARDED_TO |

**Open questions for the owner** (full list in `11-open-questions.md`, 31 entries):

- OQ-D7-05: no module owns Facility (D7 and D8 both defer it).
- OQ-D7-28: manufacturer and supplier roles are predicate-only in D6, D8 and D1. Should any be typed, and on which asking type?
- OQ-D7-31: dating in-container disclosures by rendition, which needs a kernel clock for page revisions and a D9 model of container revisions.
- OQ-D7-09 / OQ-D7-23: privacy of family ties and of named non-public persons.
- OQ-D7-21: organizations never point at a Frontier (D13 rule vs directive 3.7).
- OQ-D7-29: stale seam names in D5, D11 and D13 for the synthesizer.
- OQ-D7-02: Shape A as the 25 KB fallback.

**Files changed in this stage** (all under `schema/program/packets/D7/`; nothing committed):

- `SUMMARY.md`
- `RUNLOG.md`
- `03-retrieval-patterns.md`
- `04-schema-proposal.graphql`
- `05-relationship-register.yaml`
- `06-node-register.yaml`
- `08-sources-and-tools.md`
- `09-reasoning.md`
- `10-seams.yaml`
- `11-open-questions.md`
- `07-fixtures/*/locators.yaml` (regenerated; only Attia's content changed)
- `07-fixtures/attia-cgm-dexcom-recommendation-interest/{assertions.yaml, intent.json, questions.md, source.md}`
- `07-fixtures/{ftc-ameribev-paid-dieticians-harm, sinclair-self-disclosure-unstructured, bioage-group-vehicles-stale-role, elysium-paper-funding-award}/assertions.yaml`: conclusionCode / facets added and stale seam comments fixed.

## Adversarial review (A6, 2026-10-08)

Two reviewers (evidence integrity E1–E10, model discipline M1–M15). Every finding verified first: sources re-fetched with curl (Internet Archive `id_`, live Attia pages, EDGAR with the `.env` User-Agent, never printed), sibling SDL / registers read in worktrees A1–A8. Tools (scratch `ft/D7/tools/`): `build_locators.py` (+1 snapshot, +9 locators, archive clocks), `build_intents.mjs` (AWARDED_BY as `edge.assert`, `validObservedAt` → `validity.statedAsOf`, archived snapshots under the original `canonicalUri`), `rv_*.py` (one-off edit scripts), `strip_akamai.py`; backups `*.check-stage.*`, pre-review fixtures in `ft/D7/before-review/`.

| id | finding | outcome |
| --- | --- | --- |
| E1 | Dexcom tie dated by the author's archived list, not open/UNKNOWN | **fixed** — verified (decoded sha256 `b001b739…712c`, "Dexcom (September 2020 – Aug 2021)" under "Previous:"); snapshot snap-attia-disclosures-wb2025 + 6 locators; r-02 2020-09 → 2021-08 MONTH STATED_BY_SOURCE; as-cr-01 OVERLAPS + DISCLOSED_IN_LATER_REVISION; stale present-tense line is r-07 + as-stale-01 (ROLE_CLOSED, Q-D7-17); CQ-AX-18 / CQ-CL-05 rewritten. Partial rebuttal: r-03 (payment) basis is INFERRED, not STATED_BY_SOURCE — the list does not say "paid" and the article gives no dates |
| E2 | list was capturable via the archive; coverage wrong | **fixed** — as-cov-01 SOURCE_DECLARED_INCOMPLETE (COMPLETE as of 2025-09-30 within the list's own scope note; live /about/ PARTIAL_EXCERPT, re-checked by curl); 08 archive-first capture path; 01 §1.1 / §2.1 corrected |
| E3 | 01 still dated the disclosure 2021 | **fixed** — 01 §1.1, §2.1 table (interval, page status, relation to content), S3a / S5a keys |
| E4 | SEC raw digests not reproducible (injected script) | **fixed** — reproduced (bioa 743,833 vs 743,827; cdxc 766,975 vs 766,969; only the trailing tag differs); projection digests and stripped raw digests reproduce; 08 What broke #6 + correction note, bioage/niagen source.md, OQ-D7-36 |
| E5 | n-10 validFrom is an observation | **fixed** — validFrom null UNKNOWN, validObservedAt 2022-10-10 |
| E6 | award note cites e-10 | **fixed** — e-11 |
| E7 | July 14, 2023 not located | **fixed** — loc-bonci-post-date (verified in capture sha256 `01bee3ad…`), QUALIFIES on h-01, cited in questions |
| E8 | b-01 percent on the wrong clock | **fixed** — split: b-01 share count @2024-09-27, b-01p 7.28 % @2026-04-16 + loc-bio-outstanding (44,397,817); Q-D7-03 answer corrected (the percent falls after the overlap window) |
| E9 | mentions lack producedBy | **fixed** |
| E10 | Claim name over-generalizes | **fixed** — name narrowed to the speaker's patients, nameBasis = BellLabs paraphrase |
| M1 | AWARDED_BY structural | **fixed** — asserted, AssertedRecordedProperties, [CONNECT], one or more; Award identity = number + issuer as printed; 05, 06, 09, 03, fixture e-01..e-03, e-08 |
| M2 | Q-D7-06 returns no rows | **fixed** — reads HAS_SUBJECT\|HAS_OBJECT, driven by the CONFLICT_RELEVANCE inputs, no productKind test; Device note corrected; D4 Device HAS_SUBJECT seam |
| M3 | Award vs D13 AWARD Event | **fixed (D7 side)** — rule in 04/05/09/10; OQ-D7-32 request to D13 |
| M4 | investors twice (INVOLVES vs HOLDS_STAKE) | **fixed (D7 side)** — write rule in 05/09/03; Q-D7-04 returns INVOLVES investors; Q-D7-13 unions with basis label; OQ-D7-33 shared with D13 |
| M5 | manufacturer/supplier names differ | **fixed** — one set in 05 (MANUFACTURES, CONTRACT_MANUFACTURES_FOR, SUPPLIES_MATERIAL + exclusivity, MANUFACTURER_UNNAMED); n-19 names Grace (new locator) as SUPPLIES_MATERIAL exclusivity=SOLE; 03 uses only these; requests to D1/D6/D8 in OQ-D7-28. Partial rebuttal: no separate SOLE_SUPPLIER_OF — D6's current (uncommitted) revision already writes SUPPLIES_MATERIAL + exclusivity=SOLE, and already uses `hu:org:niagen-bioscience-inc` (40 hits, 0 of the old uid) |
| M6 | D5 HAS_INTEREST_IN seam broken | **D7 side fixed** — inverse listing with Q-D5-13 in 10-seams; rename request to D5 (OQ-D7-29) |
| M7 | observedAt on edges | **fixed** — removed from all four types; OVERLAP and patterns read `a.validObservedAt`; fixtures move the value to the Assertion; OQ-D7-07 closed |
| M8 | predicates missing from registry | **fixed** — all fixture/pattern predicates registered; REPORTED_MARKET_MOVE left to D13. Partial rebuttal: D13's own register assigns the financing-amount pattern to D7 ("owner other"), so D7 registers FINANCING_AMOUNT (D13's name, qualifier amountKind) / DATE_OF_FIRST_SALE / INVESTOR_COUNT on the D13 Event instead of asking D13 to |
| M9 | Open Payments in populatedBy | **fixed** — removed; Q-D7-18 comment corrected |
| M10 | 3.8 walk uses non-existent D9 names | **fixed** — CHUNK_OF / COVERS_LOCATOR / MENTIONS per D9 SDL |
| M11 | h-04 attributed to the FTC | **fixed** — asserter = BellLabs extraction Agent; registered DOCUMENT_DATE_INCONSISTENT |
| M12 | BrandKind INGREDIENT_TRADE_NAME dead | **fixed** — dropped (no fixture used it) |
| M13 | chain hops not valid-time filtered | **fixed** — Q-D7-01, Q-D7-14, CQ-EC-03 filter every hop as of $V and return bound bases |
| M14 | vocab pins, D4, D10 seams | **fixed** — targets pinned @0.2.2 (current; reviewer said 0.2.1, which D5 still accepts), frontiers @0.2.0; D4 listed as consumer (OQ-D7-35); D10 publisherUid listed + request (OQ-D7-34) |
| M15 | stale numbers / D11 clause / Q-D7-05 coverage | **fixed** — re-measured (below); D11 clause removed (D11 already uses HAS_STUDY_ROLE); Elysium fixture gains a D3 Study → HAS_STUDY_ROLE{FUNDING_AWARD} → Award (e-12..e-14) |

Check-stage issues (check-issues.json "D7"): Attia timing — resolved by the archived list (kernel clocks already exist: snapshot `publishedAt` = version date, `observedAt`, `archiveUri`, `revisionKind`; D9 rendition modelling left open). Manufacturer roles — names unified; no GraphQL filter still (OQ-D7-28). Facility — still unowned (OQ-D7-05). Stale sibling names — D11 fixed by D11, REPORTED_MARKET_MOVE settled on D13's side, D5 still open. SUMMARY Write guard — SUMMARY edited with Edit.

Measurements: `node scripts/packet-check.mjs D7` → ok; nodeTypes 4, relationshipTypes 7, pairs 9, questions 33, fixtures 6. Compile (kernel A1 sha256 `b2c2b1b0…d5c7`, scratch `ft/D7/compile3/`): kernel alone 322,904 B / 6,466 lines / 179 inputs; kernel + D7 449,924 B / 8,805 lines / 241 inputs (not the pinned 55 MB schema); D7 marginal +127,020 B / +2,339 lines / +62 inputs; control (check-stage D7 SDL on the same kernel) +129,576 / +2,371 / +62. Expanded pairs 47 → 88. Locators re-selected 98/98; 6 intents valid.

Files changed (all under `schema/program/packets/D7/`; nothing committed): `01`, `03`, `04`, `05`, `06`, `08`, `09`, `10`, `11`, `SUMMARY.md`, `RUNLOG.md`; `07-fixtures/*/{assertions.yaml, locators.yaml, intent.json}` (locators: additions only), `questions.md` of attia, bioage, elysium, ftc, niagen; `source.md` of attia, bioage, niagen.

## Close-out: pattern lint (2026-10-09)

Linter report (`final/_work/pattern-lint.json`, S): D7 34 blocks, 8 failing = 1 packetBug + 7 rulingBroken.

- packetBug fixed (1 block): **Q-D7-04** — `EXPLAIN` failed with `Type mismatch: inv defined with conflicting type Relationship (expected Node)`: the issuer edge was bound as `inv:INVOLVES` and the investor node later reused `inv`. Renamed the issuer edge variable to `iss` and made the commented "role ISSUER" explicit (`AND iss.role = 'ISSUER'`; D13 `EventRoleEdgeProperties.role: EventRole!`, value `ISSUER` declared). No CYPHER 25 prefix, no direction or undeclared-name findings in D7; no SDL docstring / register text repeated the error, so only `03-retrieval-patterns.md` changed.
- rulingBroken (7) left as-is by instruction (packet stays a record of its own SDL; S writes final-SDL versions): R-19 pendingEdit (CQ-CL-05, Q-D7-06, …), R-30 `roleTitleVerbatim` (Q-D7-02, Q-D7-08), R-80 predicate `AUTHORED` (CQ-EC-04, Q-D7-22).
- Re-run: `node C:/…/S/schema/program/final/_work/lint-packet-patterns.mjs --packets D7 --json <scratch>/lint-D7.json --md <scratch>/lint-D7.md` → `D7: 34 total, 7 failing (0 packetBug, 7 rulingBroken), 0 fragment, 2 gds`; Q-D7-04 now `ok` (EXPLAIN ok, 0 findings). The shared S report was not overwritten (scratch output).
- `node scripts/packet-check.mjs D7` → exit 0, ok (nodeTypes 4, relationshipTypes 7, pairs 9, questions 33, fixtures 6). SDL unchanged. Nothing committed.
