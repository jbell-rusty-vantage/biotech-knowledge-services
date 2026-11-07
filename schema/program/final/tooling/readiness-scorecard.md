# Readiness scorecard: bio-medical tooling action space (synthesis)

Synthesizer stage `tooling`, 2026-10-09. **Generated** by `final/_work/build-tooling-scorecard.mjs`; do not edit by hand. The registry is `final/tooling/action-space.yaml`, which is D11's generator output copied byte for byte (a re-run of D11's `build-action-space.mjs` against the packets in this worktree reproduced it exactly; see `_runlog/tooling.md`). This page differs from D11's `readiness-scorecard.md` in three ways:

1. Blocked questions are restricted to the questions that survived synthesis.
2. They include the questions of every final relationship-register entry whose rewritten `populatedBy` names the tool.
3. The gap list is re-ranked by value: value-1 count first, then value-2, value-3 and total. D11 ranked by the weighted score.

Readiness scale (PLAN 6.3) for external tools: **0** blocked · **1** scrape-only · **2** API without stable locators · **3** agent-ready. Internal BellLabs tools use K's scale: 0 not built · 1 designed · 2 partially built · 3 in use.

## 1. Summary

- **167 merged entries** (144 external, 23 internal) under **402 packet-local aliases**.
- External readiness: 3 → 35 · 2 → 51 · 1 → 35 · 0 → 21 · unscored → 2.
- Internal readiness (K scale): 3 → 3 · 2 → 8 · 1 → 8 · 0 → 4.
- **Surviving questions: 454.** The packets' catalog holds 453 ids. R-08 splits CQ-PF-03 into CQ-PF-03a (D8, v1) and CQ-PF-03b (D6, v2). "Cuts to budget" in `decision-report.md` records no cut, so no question was dropped. Value 1: 154; value 2: 249; value 3: 51.
- **430 surviving questions need at least one tool**, 149 of them value 1. Of the value-1 questions, **111 need at least one tool at readiness ≤ 1** (unscored counts as 0).
- Priority after synthesis (same rule as D11, never less urgent than D11's own score): P0 52 · P1 74 · P2 11 · P3 30. Priority changed from the registry's value for 0 entries.
- Final register additions: 4 entries gained questions from the final relationship register that D11's packet-level pass did not credit to them (6 entry-question links in all). 2 gap clusters gained questions this way.
- `populatedBy` rewrite (R-39, `_work/rewrite-populatedby.mjs`): 109 register entries and 378 values. 378 values were resolved through the alias map, 368 were renamed, and 31 duplicates were dropped where several local ids merge into one tool. The result is 347 values over 80 distinct action-space ids, with **0 unresolved**.
- Verified against the register now on disk: 0 `populatedBy` ids are not action-space entries. 0 register question ids are not surviving questions.

## 2. Scorecard by readiness level and domain (external entries)

An entry counts in every domain that lists it (`domains` in the registry), so the rows do not sum to the total. The last column counts the surviving value-1 questions of that domain that need at least one external entry at readiness ≤ 1.

| domain | 3 agent-ready | 2 API, no locators | 1 scrape-only | 0 blocked | unscored | entries | P0 | value-1 questions needing a readiness ≤ 1 entry |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| K | 9 | 11 | 3 | 1 | 0 | 24 | 11 | 2 |
| D1 | 9 | 14 | 4 | 5 | 0 | 32 | 11 | 0 |
| D2 | 11 | 11 | 5 | 1 | 0 | 28 | 10 | 9 |
| D3 | 9 | 17 | 5 | 2 | 0 | 33 | 11 | 4 |
| D4 | 11 | 11 | 5 | 1 | 0 | 28 | 7 | 7 |
| D5 | 10 | 15 | 2 | 3 | 0 | 30 | 7 | 7 |
| D6 | 8 | 19 | 13 | 8 | 0 | 48 | 19 | 6 |
| D7 | 12 | 19 | 10 | 2 | 0 | 43 | 14 | 8 |
| D8 | 11 | 13 | 11 | 4 | 0 | 39 | 17 | 11 |
| D9 | 13 | 19 | 11 | 4 | 0 | 47 | 18 | 6 |
| D10 | 6 | 13 | 2 | 4 | 0 | 25 | 8 | 0 |
| D11 | 13 | 18 | 7 | 2 | 0 | 40 | 16 | 3 |
| D12 | 6 | 12 | 4 | 5 | 2 | 29 | 12 | 10 |
| D13 | 8 | 16 | 4 | 4 | 0 | 32 | 12 | 4 |
| **all** | **35** | **51** | **35** | **21** | **2** | **144** | **41** | **72** |

## 3. Final relationship types by the readiness of their populating tools

The final register has 106 relationship types. "Best readiness" is the highest readiness among the action-space ids in the type's rewritten `populatedBy`, across all of the type's register entries. Internal tools are read on K's scale.

- Best readiness 3: 62 · 2: 36 · 1: 4 · 0: 4 · no scored tool: 0.
- **8 types have no populating tool above readiness 1.** Until a tool for them moves to readiness 2 or higher, these edges can only be written by scraping, by hand, or by an internal tool that is designed but not built. They are listed by their best question value:

| type | module(s) | best question value | populatedBy (readiness) |
| --- | --- | ---: | --- |
| `BLOCKED_BY` | D10 | 1 | `bks-comparison-engine` (0), `bks-report-publish` (1) |
| `CHUNK_OF` | D9 | 1 | `bks-chunker` (0) |
| `COVERS_LOCATOR` | D9 | 1 | `bks-projection-job` (0) |
| `MENTIONS` | D9 | 1 | `bks-entity-resolution` (1), `bks-projection-job` (0) |
| `OCCURS_IN` | D9 | 1 | `bks-claim-extraction` (1) |
| `RESOLVES_TO_CONSTRAINT` | D5 | 1 | `bks-projection-job` (0) |
| `STATES_CONSTRAINT` | D5 | 1 | `bks-projection-job` (0) |
| `USES_CRITERION` | D10 | 1 | `bks-criteria-registry` (1), `bks-report-publish` (1) |

## 4. Internal BellLabs tooling (K scale)

| id | readiness | priority | surviving questions (value-1) | of which from the final register only | gap |
| --- | ---: | --- | ---: | ---: | --- |
| `kg-executor` | 2 | P1 | 33 (18) | 0 | biotech-knowledge-intent.v1 cannot express Claim / OCCURRENCE_OF, assertionKind CLAIM, Assessment, Adjudication, Report, Activity ASSESSES … |
| `ks-verification` | 1 | P0 | 32 (18) | 0 | the graph ingest of judgments (Adjudication, per-evidence authority/independence, report-wide summary) is not built; fixtures used a determ… |
| `bks-entity-resolution` | 1 | P0 | 24 (16) | 3 | name variants need Assessments, not string match ("Das, D K" vs "Das, Dipak K"; "Bayer" vs "Bayer AG (Australia)"); condition text → D2 Con… |
| `bks-curation-agent` | 2 | P1 | 29 (14) | 0 | curated structural edges (HAS_ANALYTE, QUANTIFIES), rule-based inferences (RUNS_ON_DEVICE when a vendor names no model, Quest MEASURES_METR… |
| `bks-projection-job` | 0 | P0 | 31 (11) | 0 | Re-run on fixtures matched every declared edge (9 AFFECTS_MECHANISM after the adversarial review; 14 before the MolecularEntity pair was cu… |
| `mission-control` | 2 | P1 | 23 (11) | 0 | runs exist, but no evidence-mission template (vetting → mission → report) and no Activity write-back to the graph at run start; fixture ids… |
| `bks-claim-extraction` | 1 | P0 | 21 (9) | 0 | No runnable D9 extractor; `biotech-knowledge-intent.v1` cannot express a claim occurrence completely (no HAS_OBJECT, OCCURRENCE_OF, OCCURS_… |
| `d13-event-linker` | 1 | P0 | 15 (6) | 0 | specification only; the fixtures encode its expected output, including the CONTEXT_ONLY negative tests it must propose as assertions but ne… |
| `d13-frontier-curator` | 1 | P0 | 10 (6) | 0 | specification only (rule frontier-classification/v1, vocab-frontiers.yaml@0.2.0); in the fixtures its assertions are hand-written to the sp… |
| `poppler-pdftotext` | 3 | P1 | 14 (5) | 0 | Latin-1 output for some PDFs (decode explicitly); layout text interleaves columns; deterministic (same text sha256 on re-run) |
| `bks-report-publish` | 1 | P0 | 13 (5) | 0 | no `report.publish` intent kind in biotech-knowledge-intent.v1 (fixtures' `intent.json` notes list the Report/ReportItem records that canno… |
| `bks-comparison-engine` | 0 | P0 | 5 (3) | 0 | evaluator for DecisionCriterion `rule` expressions (BLOCK before SCORE; unknown BLOCK input → NOT_EVALUATED); the fixture ranking was compu… |
| `bks-criteria-registry` | 1 | P0 | 6 (2) | 0 | node.upsert of `DecisionCriterion` is expressible in v1 (validated in `mg-rankings-criteria-comparison/intent.json`), but no registry UI/ag… |
| `nova-classifier` | 1 | P0 | 5 (2) | 0 | does not exist yet: needs a versioned marker lexicon (hydrogenated / interesterified oils, hydrolysed proteins, HFCS, cosmetic additive cla… |
| `bks-chunker` | 0 | P0 | 3 (2) | 0 | Does not exist. The fixture chunker `fixture-turn-window/v0` (blank-line paragraphs packed to ≤ 1500 chars) shows the identity rule works b… |
| `neo4j-gds` | 2 | P1 | 7 (1) | 0 | GDS availability on the deployed Aura tier not checked; projections need per-question Cypher projections and a write-back as Association (S… |
| `d2-hallmark-curation` | 2 | P2 | 2 (0) | 0 | Mapping decisions have no external source; publication as a kernel Report is open (11 item 12). Fixture leaves Nicotinate metabolism unmapp… |
| `bks-entity-link-projection` | 0 | P3 | 0 (0) | 0 | not built; the fixture used an exact surface-form match (`fixture:entity-link-surface@0`) for 2 surface forms; needs a linker with a method… |
| `bks-intent-contract` | 3 | P3 | 0 (0) | 0 | intent v1 has no field for assertionKind/claimType, no assessment proposal kind, no asserter on edge.structural; refs must match `^[a-z0-9]… |
| `html-text-projection` | 2 | P3 | 0 (0) | 0 | must become the verifier's registered canonical projection (verification.v1 `canonicalProjectionArtifact`) or offsets are not reproducible;… |
| `local-contracts` | 3 | P3 | 0 (0) | 0 | internal only; benchmark excerpts carry rights restrictions |
| `locator-builder-verifier` | 2 | P3 | 0 (0) | 0 | this is the custom tooling D4 needed: a selector builder that re-derives text by a named rule and emits verification.v1-shaped selectors; s… |
| `poppler-pdftoppm` | 2 | P3 | 0 (0) | 0 | visual check of identifiers and table rows was manual (page images read by the agent); a BOUNDING_BOX selector from the text layer would ma… |

## 5. Prioritized gap list (custom-tooling clusters, surviving questions, re-ranked by value)

A gap blocks the surviving questions that need any of its entries and that belong to a packet that requested the gap, plus the question ids the requesters named explicitly (D11's scope rule). The ranking is by value-1 count, then value-2 count, value-3 count and total. The table also shows D11's rank by weighted score and the rank this page's counts give under that score (`score rank`). Priority is P0 when a value-1 question is blocked and the weakest entry is at readiness ≤ 1. "Related rulings" are a cross-reference by ruling title from `decision-report.md`.

| rank | gap | title | blocked | value-1 | value-2 | value-3 | harm | score | score rank | D11 rank | + from final register | weakest readiness | priority | owner | related rulings |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| 1 | G4 | Capture normalizer and text-projection registry (named, versioned JATS/SPL/HTML/PDF → text rules, UTF-8 + LF,… | 217 | 82 | 117 | 18 | 103 | 498 | 1 | 1 | 0 | 2 | P1 | tooling | R-35 contentHashBasis; R-38 selector normalization basis |
| 2 | G13 | Intent contract v1 extensions (predicate-only Assertions with an object node, claim occurrences, assessments,… | 137 | 65 | 63 | 9 | 61 | 330 | 2 | 2 | 1 | 1 | P0 | kernel | R-40 intent contract v1 cannot write the kernel evidence chain (owner decision) |
| 3 | G11 | Selector builder and verifier (locators computed from bytes; unique-occurrence growth of prefix/suffix; value… | 134 | 55 | 67 | 12 | 50 | 311 | 3 | 3 | 0 | 1 | P0 | tooling | R-38 selector normalization basis |
| 4 | G6 | Keys, quotas and service identity for team runs (data.gov, OpenAlex, Semantic Scholar, NCBI, Crossref polite … | 117 | 44 | 62 | 11 | 62 | 267 | 4 | 4 | 0 | 0 | P0 | owner |  |
| 5 | G12 | Byte-faithful capture, durable artifact storage and per-publisher snapshot-identity rules (raw bytes beside r… | 105 | 36 | 55 | 14 | 49 | 232 | 5 | 5 | 0 | 1 | P0 | kernel | R-35 contentHashBasis; R-37 snapshot identity vs change detection |
| 6 | G2 | Integrity checker (retraction, correction, expression of concern) reconciling Crossref updated-by, PubMed Com… | 68 | 31 | 33 | 4 | 31 | 163 | 8 | 8 | 0 | 1 | P0 | tooling | R-44 retraction and correction status |
| 7 | G8 | Change-tracked capture and scheduled re-capture for pages that version in place (FDA pages, certifier lists, … | 74 | 28 | 40 | 6 | 50 | 170 | 6 | 6 | 0 | 1 | P0 | tooling |  |
| 8 | G7 | Label image and PDF parsers (Supplement Facts / Nutrition Facts OCR, panel images, COA row parser, PDF table … | 73 | 26 | 42 | 5 | 35 | 167 | 7 | 7 | 0 | 1 | P0 | tooling |  |
| 9 | G5 | GTIN normalizer and listing resolver (UPC-A/EAN-13 → GTIN-14, check digit, ASIN/retailer id ↔ GTIN ↔ Package) | 60 | 21 | 34 | 5 | 25 | 136 | 9 | 9 | 0 | 0 | P0 | tooling |  |
| 10 | G17 | Archive-first capture with memento verification | 56 | 20 | 28 | 8 | 31 | 124 | 10 | 10 | 0 | 1 | P0 | tooling | R-37 snapshot identity; archive copies |
| 11 | G15 | Projection runner, entity-link projection and chunker (method-versioned derived edges with inputSetDigest) | 45 | 19 | 22 | 4 | 20 | 105 | 14 | 14 | 1 | 0 | P0 | kernel | R-22 projection gate; R-47 AFFECTS_MECHANISM vs Association |
| 12 | G1 | Self-observed registry versions (CT.gov history blocked) and an ISRCTN history-prose parser | 46 | 18 | 26 | 2 | 22 | 108 | 13 | 13 | 0 | 0 | P0 | tooling |  |
| 13 | G14 | Fixture-mode verification.v1 runner (locators.yaml + assertions.yaml → Adjudications) | 32 | 18 | 14 | 0 | 17 | 82 | 16 | 16 | 0 | 1 | P0 | kernel | R-36 tool-rendition evidence and ACCEPTED (owner decision) |
| 14 | G20 | Regulatory document parsers (warning-letter sections and index crawler, recall code_info lot parser, regulato… | 50 | 17 | 28 | 5 | 41 | 112 | 11 | 12 | 0 | 1 | P0 | D8 |  |
| 15 | G18 | SEC filing extractors (item-code routing, beneficial-ownership tables and footnotes, accession-keyed selectio… | 49 | 17 | 27 | 5 | 23 | 110 | 12 | 11 | 0 | 2 | P1 | D7 |  |
| 16 | G3 | Substance identity bridge with form awareness (GSRS authority; salt / moiety / quantity basis) | 37 | 14 | 20 | 3 | 14 | 85 | 15 | 15 | 0 | 2 | P1 | tooling |  |
| 17 | G19 | Trial results extractor (CT.gov resultsSection → one JSON pointer per reported number; paper numbers as TEXT_… | 32 | 14 | 16 | 2 | 14 | 76 | 17 | 17 | 0 | 3 | P1 | D3 |  |
| 18 | G16 | Audio and video capture with ASR, cue times and diarization; re-cut detection | 26 | 14 | 10 | 2 | 14 | 64 | 20 | 20 | 0 | 1 | P0 | D9 |  |
| 19 | G22 | Protocol and safety extractors (protocol step extractor and aligner, dose-vs-limit comparator, label sub-sect… | 29 | 12 | 12 | 5 | 20 | 65 | 18 | 18 | 0 | 2 | P1 | D5 |  |
| 20 | G9 | Person and organization identifier resolution as hypotheses (NPI homonyms, CIK↔LEI stale names, name-only per… | 30 | 8 | 19 | 3 | 15 | 65 | 19 | 19 | 0 | 0 | P0 | tooling |  |
| 21 | G21 | Food composition loaders and resolution (FDC bulk loader, Phenol-Explorer parser, NOVA classifier, food entit… | 19 | 8 | 8 | 3 | 8 | 43 | 22 | 22 | 0 | 0 | P0 | D12 |  |
| 22 | G24 | LOINC resolution and gated lab-menu capture | 27 | 6 | 15 | 6 | 10 | 54 | 21 | 21 | 0 | 1 | P0 | D4 |  |
| 23 | G23 | Comparison engine, criteria registry and report publication | 14 | 6 | 8 | 0 | 4 | 34 | 23 | 23 | 0 | 0 | P0 | kernel |  |
| 24 | G25 | Licence decisions (DrugBank, Natural Medicines, KEGG commercial, CAS, LOINC table, CPT, ConsumerLab/Labdoor, … | 8 | 3 | 4 | 1 | 3 | 18 | 24 | 24 | 0 | 0 | P0 | owner |  |
| 25 | G10 | Capture-attempt recorder (FAILED / PARTIAL CaptureAttempts, credential stripping, soft-failure detection, cap… | 4 | 1 | 3 | 0 | 2 | 9 | 25 | 25 | 0 | — | P0 | tooling |  |

Entries of each gap, in rank order:

1. **G4**: `europepmc-fulltext-jats` (3), `dailymed-spl` (3), `ctgov-v2-api` (3), `html-text-projection` (2), `poppler-pdftotext` (3), `ncbi-eutils-pubmed` (3), `sec-edgar` (2), `firecrawl-cli` (2), `tavily-cli` (2). Build: One registry of derivation rules (jats-xml2txt/v1, html2txt/v1, edgar-text/v5, h2t-v1, pdftotext -layout -enc UTF-8) with output encoding, newline convention and digest; shared normalization profile nbsp-nnbsp-hyphen/v1 with the verifier; the projection is part of the snapshot (kernel canonicalProjectionHash).
2. **G13**: `kg-executor` (2), `bks-intent-contract` (3), `bks-curation-agent` (2), `bks-claim-extraction` (1), `bks-entity-resolution` (1), `d2-hallmark-curation` (2), `d13-frontier-curator` (1), `d13-event-linker` (1), `bks-report-publish` (1), `bks-criteria-registry` (1). Build: Contract and executor work in packages/contracts and kg-ops: assertion.object, assertion.claim, assessment.record, assertion.hold / project-on-adjudication, qualifiers and supersedesUid on AssertionCore, asserter on identifier.attach and edge.structural, report.publish and projection.write intents.
3. **G11**: `locator-builder-verifier` (2), `ks-verification` (1), `firecrawl-cli` (2), `tavily-cli` (2), `uniprot-rest` (3), `reactome-content-service` (3), `sec-edgar` (2). Build: A locator compiler in the ingestion path (quotes from bytes, never from model output) that refuses ambiguous quotes, grows context until unique, keys JSON selectors by value (edgar-accession/v1, @displayName=…), and re-selects on every capture.
4. **G6**: `usda-fdc` (0), `openalex` (2), `semantic-scholar` (2), `regulations-gov-api` (2), `ncbi-eutils-pubmed` (3), `crossref-rest` (3), `fda-data-dashboard` (0), `uspto-tsdr` (0), `companies-house` (1), `keepa-api` (0), `cas-common-chemistry` (0). Build: A secret-store-backed service identity per provider (never printed, never in requestUri), quota accounting per run, and the repo .mcp.json servers loaded in agent sessions.
5. **G12**: `http-capture` (2), `firecrawl-cli` (2), `tavily-cli` (2), `sec-edgar` (2), `publisher-pages` (1), `internet-archive-wayback` (2), `ftc-pages` (1). Build: Store raw HTTP bytes (and PDF bytes) next to every rendition in durable blob storage (kernel storageUri); identity rules per publisher for rotating content; a contentHashBasis for tool renditions and extracted text (requested from K: TOOL_RENDITION / EXTRACTED_TEXT_BYTES).
6. **G2**: `crossref-rest` (3), `ncbi-eutils-pubmed` (3), `openalex` (2), `crossref-labs` (1). Build: literature.check_integrity: one HAS_REVISION_STATUS Assertion per authority (K M6) and REVISES episodes when the notice is identified (D3); RW reasons from the CSV; status-only flags (OpenAlex is_retracted) never become REVISES. Blocked on the K/D3 REVISES vs HAS_REVISION_STATUS ruling (D3 open question 33).
7. **G8**: `fda-web-pages` (1), `regulations-gov-attachments` (1), `certification-databases` (1), `brand-pages` (1), `protocol-pages` (2), `firecrawl-change-tracking` (2), `dailymed-spl` (3), `wearable-vendor-changelogs` (1). Build: Firecrawl monitor / scheduled re-capture with diff → NEW_VERSION snapshots; SPL version differ over DailyMed archived zips; certifier COVERS episodes from re-capture.
8. **G7**: `brand-pages` (1), `nih-dsld` (2), `coa-pdf` (1), `company-report-pdf` (1), `consumer-test-vendor-pages` (1), `poppler-pdftoppm` (2), `poppler-pdftotext` (3), `regulations-gov-attachments` (1). Build: OCR with BOUNDING_BOX selectors for label and panel images; COA row parser emitting resultBasis per row; PDF table reconstruction cross-checked against pdftoppm renders; page-addressed PDF_TEXT locators.
9. **G5**: `nih-dsld` (2), `openfda-food-enforcement` (2), `usda-fdc` (0), `brand-pages` (1), `shopify-storefront-json` (3), `amazon-pages` (1), `open-food-facts` (2), `gs1-verified` (0). Build: gtin14-v1 normalizer applied to DSLD upcSku, openFDA free text, FDC gtinUpc, Shopify barcode, OFF barcodes; listing resolver emitting EQUIVALENCE assessments; recall-to-listing matching from free-text lot codes.
10. **G17**: `internet-archive-wayback` (2), `self-disclosure-pages` (1), `protocol-pages` (2). Build: Internet Archive id_ copy of the pre-redirect URL (gzip-decode, hash, project), accepted only when the served memento-datetime and payload SHA1 match the CDX row; snapshot ordering by coalesce(observedAt, retrievedAt); browser capture only when no archive copy exists, logged as a readiness exception.
11. **G15**: `bks-projection-job` (0), `bks-entity-link-projection` (0), `bks-chunker` (0), `bks-entity-resolution` (1), `neo4j-gds` (2), `europepmc-annotations` (2). Build: Promote the fixture stand-ins (project.py, gen.mjs) into executor PROJECTION Activities with method versions and inputSetDigest; MENTIONS from entity linking with identifier-scheme checks; the chunker over DocumentTextVersions.
12. **G1**: `ctgov-record-history` (0), `ctgov-v2-api` (3), `isrctn` (2). Build: trials.observe_versions: poll CT.gov v2 by lastUpdatePostDate and snapshot every change as OBSERVED RegistrationVersions; ISRCTN 'Provided at time of registration / Updated as of / Amended' blocks and Editorial Notes → RECONSTRUCTED versions.
13. **G14**: `ks-verification` (1), `locator-builder-verifier` (2). Build: Run verification.v1 over a fixture's captured artifacts and emit SUPPORT / CONTRADICT adjudications so gated typed edges (LEADS_TO, RESPONDS_TO) can be projected.
14. **G20**: `fda-web-pages` (1), `openfda-food-enforcement` (2), `fda-gras-inventory` (1), `regulations-gov-attachments` (1), `ftc-pages` (1), `eurlex` (2). Build: Section parser and crawler for warning letters; recall code_info lot parser; FDA survey tables with group labels and sampling windows carried to every row.
15. **G18**: `sec-edgar` (2), `html-text-projection` (2). Build: EDGAR fetcher with 8-K item routing and a registered HTML→text projection; ownership-table parser (holder, shares, percent, basis wording, voting/dispositive power, cited 13D/13G).
16. **G3**: `fda-gsrs` (3), `pubchem-pug-rest` (3), `nih-dsld` (2), `ebi-ols4-chebi` (3), `chembl-rest` (3), `nlm-rxnav` (3). Build: substances.resolve: DSLD row + form UNII → GSRS record → ACTIVE MOIETY, never a PubChem name→CID hit alone; RESOLUTION assessments as output; rule table for mw-ratio / nutrient-equivalent / daily-max pinned to a GSRS record version.
17. **G19**: `ctgov-v2-api` (3), `europepmc-fulltext-jats` (3), `ncbi-eutils-pubmed` (3). Build: Estimates, bounds, n, P and AE affected / at risk mapped to arms; paper text numbers inside verified sentences.
18. **G16**: `podcast-rss` (3), `youtube-pages` (1), `publisher-episode-pages` (2). Build: Enclosure download + ASR with cue times + diarization writing a text version with textBasis ASR; audio fingerprint or transcript alignment for REPUBLISHES.
19. **G22**: `protocol-pages` (2), `openfda-drug-label` (2), `openfda-caers` (2), `openfda-faers` (3), `dailymed-spl` (3), `nih-ods-api` (2). Build: Canonical step payload + payloadHash + stepKey aligner across in-place editions; query-time dose-vs-limit comparator (unit, period, intake scope, population, elemental-vs-salt mass); openFDA section-blob splitter; reaction-term normalization before any count.
20. **G9**: `nppes-npi` (3), `sec-edgar` (2), `gleif-lei` (3), `orcid` (3), `nih-reporter` (3), `companies-house` (1), `opencorporates` (0). Build: RESOLUTION assessments requiring a second key (licence, address, ORCID-linked affiliation); never identity by name.
21. **G21**: `usda-fdc` (0), `usda-fdc-portal` (2), `phenol-explorer` (1), `open-food-facts` (2), `restaurant-menu-pages` (1), `nova-classifier` (1), `foodon` (?). Build: FDC bulk download → FoodItem and FOOD_CONTAINS with derivation code, n, min, max; food × compound rows from Phenol-Explorer; nova-markers/v<n> CALCULATED assertions; food RESOLUTION across FDC, menus, Phenol-Explorer and OFF.
22. **G24**: `loinc` (2), `lab-test-menus` (1), `consumer-test-vendor-pages` (1), `ucum` (2). Build: Licensed LOINC table or FHIR access to map vendor metric names to LOINC; Firecrawl interact or a browser profile for service-area-gated sections (recorded readiness exceptions); UCUM conversion as a deterministic compute tool.
23. **G23**: `bks-comparison-engine` (0), `bks-criteria-registry` (1), `bks-report-publish` (1). Build: DecisionCriterion rules with BLOCK-before-SCORE and NOT_EVALUATED on unknown inputs; report.publish transaction for Report + ReportItems with body and ledger digests.
24. **G25**: `licensed-out-sources` (0), `kegg-rest` (1), `cas-common-chemistry` (0), `altmetric` (0), `reddit` (0), `amazon-pa-api` (0), `retailer-partner-apis` (0), `impact-affiliate-api` (0), `efsa-journal-wiley` (0), `opencorporates` (0). Build: Owner decisions: license, store identifiers only, or skip; never store licensed content in the shared graph beyond identifiers and our own cited assertions.
25. **G10**: . Build: Every adapter emits a D11 CaptureAttempt for FAILED and PARTIAL requests, writes authoritative empties as COMPLETE snapshots plus FIELD_NOT_REPORTED, strips credentials, detects 200-with-challenge pages and stamps SourceSnapshot.captureMethod = '<entry id>/<version>'.

## 6. Entry-level gaps (readiness ≤ 2 or unscored, surviving questions, re-ranked by value)

103 entries are at readiness ≤ 2 or unscored and block at least one surviving question.

| rank | id | class | readiness | priority | blocked | value-1 | value-2 | value-3 | harm | D11 count | + final register | owner | gap |
| ---: | --- | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| 1 | `firecrawl-cli` | external | 2 | P0 | 140 | 53 | 71 | 16 | 68 | 140 | 0 | tooling | Fetches what curl cannot (bot-protected PDFs, publisher pages); keep raw bytes too (rawHtml / PDF) so the snapshot is n… |
| 2 | `sec-edgar` | external | 2 | P1 | 74 | 25 | 42 | 7 | 34 | 74 | 0 | D7 | filings.get with identity header from secret store; `lei` field null for this issuer → CIK↔LEI via GLEIF name match is … |
| 3 | `http-capture` | external | 2 | P1 | 53 | 21 | 27 | 5 | 31 | 53 | 0 | K | dynamic pages change bytes per request (CSRF token, Cloudflare parameters) so raw digests differ between captures with … |
| 4 | `nih-dsld` | external | 2 | P0 | 54 | 19 | 32 | 3 | 22 | 53 | 0 | D6 | Supplement Facts parser for the label PDF/image when JSON rows are incomplete; GTIN normalizer for upcSku ('8 50015 311… |
| 5 | `fda-web-pages` | external | 1 | P0 | 51 | 19 | 28 | 4 | 39 | 50 | 0 | D8 | Change-tracked scrape (Firecrawl monitor) of ingredient and letter pages; no API. |
| 6 | `publisher-episode-pages` | external | 2 | P1 | 36 | 19 | 14 | 3 | 18 | 36 | 0 | D9 | Transcript "under human review", no per-turn media time, sponsor reads removed from the transcript (present only as a c… |
| 7 | `tavily-cli` | external | 2 | P1 | 47 | 18 | 24 | 5 | 22 | 47 | 0 | tooling | Windows console crash on non-cp1252 output (write to file + UTF-8); extracted markdown is a derived rendition, so the s… |
| 8 | `kg-executor` | internal | 2 | P1 | 33 | 18 | 15 | 0 | 17 | 33 | 0 | kernel | biotech-knowledge-intent.v1 cannot express Claim / OCCURRENCE_OF, assertionKind CLAIM, Assessment, Adjudication, Report… |
| 9 | `ks-verification` | internal | 1 | P0 | 32 | 18 | 14 | 0 | 17 | 32 | 0 | kernel | the graph ingest of judgments (Adjudication, per-evidence authority/independence, report-wide summary) is not built; fi… |
| 10 | `internet-archive-wayback` | external | 2 | P1 | 41 | 16 | 21 | 4 | 21 | 41 | 0 | tooling | The only way to know what a self-disclosure page said at statement time, but an `id_` request can serve a **different c… |
| 11 | `bks-entity-resolution` | internal | 1 | P0 | 24 | 16 | 7 | 1 | 10 | 21 | 3 | kernel | name variants need Assessments, not string match ("Das, D K" vs "Das, Dipak K"; "Bayer" vs "Bayer AG (Australia)"); con… |
| 12 | `health-canada-lnhpd` | external | 2 | P1 | 38 | 15 | 20 | 3 | 22 | 37 | 0 | D8 | Name→NPN search tool; scrape status page. |
| 13 | `nih-ods-api` | external | 2 | P1 | 38 | 14 | 21 | 3 | 20 | 38 | 0 | D5 | Scrape with change tracking. |
| 14 | `bks-curation-agent` | internal | 2 | P1 | 29 | 14 | 12 | 3 | 12 | 29 | 0 | kernel | curated structural edges (HAS_ANALYTE, QUANTIFIES), rule-based inferences (RUNS_ON_DEVICE when a vendor names no model,… |
| 15 | `brand-pages` | external | 1 | P0 | 26 | 14 | 12 | 0 | 14 | 25 | 0 | D6 | Change-tracked capture (Firecrawl monitor) + Supplement Facts image parser; claims on the page become ClaimOccurrences. |
| 16 | `isrctn` | external | 2 | P1 | 27 | 12 | 14 | 1 | 12 | 26 | 1 | D3 | Self-observed versions, as for CT.gov. |
| 17 | `ncbi-web-pages` | external | 0 | P0 | 26 | 12 | 12 | 2 | 18 | 26 | 0 | tooling | the only path to non-OA research letters (JAMA melatonin, FC-06); no stable offsets across renders |
| 18 | `protocol-pages` | external | 2 | P1 | 27 | 12 | 10 | 5 | 14 | 27 | 0 | D5 | versioned in place with unchanged displayed dates; editions need scheduled capture + step extractor + `stepKey` alignme… |
| 19 | `bks-projection-job` | internal | 0 | P0 | 31 | 11 | 18 | 2 | 16 | 31 | 0 | kernel | Re-run on fixtures matched every declared edge (9 AFFECTS_MECHANISM after the adversarial review; 14 before the Molecul… |
| 20 | `fda-gras-inventory` | external | 1 | P0 | 29 | 11 | 16 | 2 | 21 | 28 | 0 | D8 | letter links for older notices go to an archive-it wayback copy that returns HTML to curl (GRN 635 letter not captured)… |
| 21 | `regulations-gov-api` | external | 2 | P1 | 29 | 11 | 16 | 2 | 23 | 28 | 0 | D8 | Metadata only; attachments need the next entry. |
| 22 | `mission-control` | internal | 2 | P1 | 23 | 11 | 12 | 0 | 9 | 23 | 0 | kernel | runs exist, but no evidence-mission template (vetting → mission → report) and no Activity write-back to the graph at ru… |
| 23 | `open-food-facts` | external | 2 | P1 | 23 | 10 | 12 | 1 | 11 | 23 | 0 | tooling | crowd data: per-country formulations collide under one barcode; NOVA is OFF-computed (store as CALCULATED by OFF, not s… |
| 24 | `telehealth-clinic-pages` | external | 2 | P1 | 20 | 10 | 9 | 1 | 12 | 20 | 0 | D5 | no version dates; clinic lists mix drugs and foods |
| 25 | `openfda-food-enforcement` | external | 2 | P1 | 29 | 9 | 19 | 1 | 21 | 28 | 0 | D8 | Free-text UPC and firm names (observed 'UPC: PHF-C023', not a GTIN); openfda harmonization block empty for food → GTIN … |
| 26 | `eurlex` | external | 2 | P1 | 29 | 9 | 17 | 3 | 21 | 28 | 0 | D8 | page bytes change between requests while the act text does not (research and fixtures captures differ) → identity must … |
| 27 | `cafc-opinions` | external | 2 | P1 | 27 | 9 | 15 | 3 | 20 | 26 | 0 | D8 | born-digital text layer is clean, but discovery has no API (web search found the URL); line-end hyphens stay in the tex… |
| 28 | `bks-claim-extraction` | internal | 1 | P0 | 21 | 9 | 9 | 3 | 14 | 21 | 0 | D9 | No runnable D9 extractor; `biotech-knowledge-intent.v1` cannot express a claim occurrence completely (no HAS_OBJECT, OC… |
| 29 | `usda-fdc` | external | 0 | P0 | 20 | 8 | 9 | 3 | 7 | 20 | 0 | tooling | Register a data.gov key (readiness 3 with key); bulk CSV/JSON downloads as fallback. |
| 30 | `hagr` | external | 1 | P0 | 17 | 7 | 8 | 2 | 8 | 17 | 0 | D2 | No stable per-compound URL; compound identity is a name (needs D1 resolution), so it needs an adapter (score 2, not 3; … |
| 31 | `biorxiv-api` | external | 2 | P1 | 16 | 7 | 8 | 1 | 9 | 16 | 0 | D3 | preprint→publication bridge is incomplete; reconcile with Crossref relation is-preprint-of and PubMed. |
| 32 | `openfda-drug-label` | external | 2 | P1 | 16 | 7 | 7 | 2 | 13 | 16 | 0 | D5 | Flattens SPL sections into strings and loses section ids/LOINC section codes; use for search, capture the SPL XML from … |
| 33 | `certification-databases` | external | 1 | P0 | 15 | 7 | 7 | 1 | 11 | 14 | 0 | D8 | Firecrawl with change tracking; certification claims on labels (DSLD 'Seals/Symbols') must be checked against these lis… |
| 34 | `health-canada-nhpid` | external | 2 | P1 | 11 | 7 | 3 | 1 | 7 | 11 | 0 | D5 | wrong `atid` returns a 404 page with HTTP 200 (silent failure; check body) |
| 35 | `self-disclosure-pages` | external | 1 | P0 | 24 | 6 | 15 | 3 | 15 | 24 | 0 | tooling | Pages version in place with a self-dated stamp that can lag content changes; only archive copies give an as-of view. |
| 36 | `coa-pdf` | external | 1 | P0 | 15 | 6 | 8 | 1 | 11 | 14 | 0 | D8 | discovery is ad hoc (search engine, marketplace listings); text extraction mis-orders result rows (Eurofins values prin… |
| 37 | `d13-event-linker` | internal | 1 | P0 | 15 | 6 | 8 | 1 | 8 | 15 | 0 | D13 | specification only; the fixtures encode its expected output, including the CONTEXT_ONLY negative tests it must propose … |
| 38 | `d13-frontier-curator` | internal | 1 | P0 | 10 | 6 | 3 | 1 | 2 | 10 | 0 | D13 | specification only (rule frontier-classification/v1, vocab-frontiers.yaml@0.2.0); in the fixtures its assertions are ha… |
| 39 | `consumer-test-vendor-pages` | external | 1 | P0 | 23 | 5 | 14 | 4 | 10 | 23 | 0 | D4 | no version, array, lab or reliability data; pages change within the hour; InsideTracker's panel list is an image ("BM L… |
| 40 | `companies-house` | external | 1 | P0 | 20 | 5 | 13 | 2 | 12 | 20 | 0 | D7 | no key held; pages carry month/year of birth and residence (must not be stored) |
| 41 | `company-press-releases` | external | 2 | P1 | 15 | 5 | 8 | 2 | 9 | 15 | 0 | D13 | some undated (Loyal); syndicated copies (BioSpace) must be traced to the issuer; harm events may exist only here (BioAg… |
| 42 | `bks-report-publish` | internal | 1 | P0 | 13 | 5 | 8 | 0 | 4 | 13 | 0 | kernel | no `report.publish` intent kind in biotech-knowledge-intent.v1 (fixtures' `intent.json` notes list the Report/ReportIte… |
| 43 | `regulations-gov-attachments` | external | 1 | P0 | 7 | 5 | 2 | 0 | 6 | 7 | 0 | D8 | Capture the PDF bytes (not only Firecrawl markdown) for the snapshot hash; PDF text loses Greek letters (β) → page-imag… |
| 44 | `ncbi-bookshelf-livertox` | external | 2 | P1 | 6 | 5 | 1 | 0 | 5 | 6 | 0 | D5 | Use bulk FTP; HTML is not agent-reachable. |
| 45 | `propublica-dollars-for-profs` | external | 1 | P0 | 15 | 4 | 8 | 3 | 11 | 15 | 0 | D7 | frozen 2019; web only |
| 46 | `mcp-pubmed` | external | 2 | P1 | 12 | 4 | 8 | 0 | 8 | 12 | 0 | tooling | Not a faithful capture (normalized text, CommentsCorrections dropped). Adopt for discovery; wrap E-utilities for captur… |
| 47 | `google-patents` | external | 1 | P0 | 13 | 4 | 7 | 2 | 9 | 13 | 0 | D8 | aggregator, not the office: legal status, priority date and assignees carry disclaimers ("is an assumption and is not a… |
| 48 | `ftc-pages` | external | 1 | P0 | 11 | 4 | 5 | 2 | 11 | 11 | 0 | D7 | curl gets HTTP 404; Firecrawl PDF parser output is not byte-stable across runs (two digests for one PDF today); scanned… |
| 49 | `loinc` | external | 2 | P1 | 11 | 4 | 5 | 2 | 2 | 11 | 0 | D4 | LOINC licence is free but requires account + attribution; NLM mirror gives abbreviated names only. Vendor test codes ↔ … |
| 50 | `restaurant-menu-pages` | external | 1 | P0 | 8 | 4 | 4 | 0 | 2 | 8 | 0 | tooling | nutrition rendered twice and split across lines; as-of statement ("correct as of January 2022") is page-wide boilerplat… |
| 51 | `youtube-oembed` | external | 2 | P1 | 9 | 4 | 3 | 2 | 4 | 9 | 0 | D9 | Metadata only: no publish date, description, chapters or captions; captions come only from a page scrape (no YouTube Da… |
| 52 | `youtube-pages` | external | 1 | P0 | 6 | 4 | 2 | 0 | 3 | 6 | 0 | D9 | Caption track has no speaker labels and no cue times in the scrape; wording differs from the publisher transcript. |
| 53 | `openfda-device` | external | 2 | P1 | 11 | 3 | 6 | 2 | 4 | 11 | 0 | D4 | 7.26 MB for 3 recall records (openfda.registration_number arrays); UDI-DI only inside `product_description` text; `res_… |
| 54 | `iherb-pages` | external | 1 | P0 | 9 | 3 | 6 | 0 | 1 | 9 | 0 | D6 | retailer copy mixes brand claims and retailer statements ("New formulation"); rendering size varies widely between fetc… |
| 55 | `lab-test-menus` | external | 1 | P0 | 9 | 3 | 5 | 1 | 5 | 9 | 0 | D4 | LOINC map is a markdown table (row = locator); performing lab only on the (synthetic) sample report; instrument and sof… |
| 56 | `product-label-contact` | external | 2 | P1 | 7 | 3 | 4 | 0 | 4 | 7 | 0 | D7 | owned by D6 capture; legal entity named but not identified |
| 57 | `in-container-disclosures` | external | 2 | P1 | 8 | 3 | 3 | 2 | 8 | 8 | 0 | D7 | one tie per sentence, present tense only; a page's date line does not date its disclosure (pages are revised: the Attia… |
| 58 | `bks-comparison-engine` | internal | 0 | P0 | 5 | 3 | 2 | 0 | 3 | 5 | 0 | kernel | evaluator for DecisionCriterion `rule` expressions (BLOCK before SCORE; unknown BLOCK input → NOT_EVALUATED); the fixtu… |
| 59 | `mcp-clinicaltrials` | external | 2 | P1 | 4 | 3 | 1 | 0 | 1 | 4 | 0 | tooling | Drops studyFirstSubmitDate and other status dates (retrospective registration invisible) and has no history. Adopt for … |
| 60 | `phenol-explorer` | external | 1 | P0 | 8 | 2 | 4 | 2 | 1 | 8 | 0 | D12 | http-only; numbers live in prose, not a table API; markdown bytes change between scrapes (page chrome), so locators mus… |
| 61 | `bks-criteria-registry` | internal | 1 | P0 | 6 | 2 | 4 | 0 | 0 | 6 | 0 | kernel | node.upsert of `DecisionCriterion` is expressible in v1 (validated in `mg-rankings-criteria-comparison/intent.json`), b… |
| 62 | `tga-safety-updates` | external | 2 | P1 | 6 | 2 | 4 | 0 | 4 | 6 | 0 | D1 | page chrome changes between captures (the B6 page gained a "Related content" block between 2026-10-08 research and fixt… |
| 63 | `ngsp` | external | 2 | P1 | 5 | 2 | 3 | 0 | 3 | 5 | 0 | D4 | methods named by analyzer/kit, not by lab; certificates expire yearly (as-of needed); PDF stored only as Firecrawl mark… |
| 64 | `nova-classifier` | internal | 1 | P0 | 5 | 2 | 2 | 1 | 5 | 5 | 0 | D12 | does not exist yet: needs a versioned marker lexicon (hydrogenated / interesterified oils, hydrolysed proteins, HFCS, c… |
| 65 | `camelcamelcamel` | external | 1 | P0 | 4 | 2 | 2 | 0 | 0 | 4 | 0 | D6 | only summary statistics are text (series is a chart image); price type encodes seller role; "Current +" date is last ch… |
| 66 | `europepmc-annotations` | external | 2 | P1 | 4 | 2 | 2 | 0 | 1 | 4 | 0 | K | Use only as candidate MENTIONS (derived, method-versioned). Observed mislinks: 'nicotinamide riboside' → ChEBI_80498 di… |
| 67 | `kegg-rest` | external | 1 | P0 | 4 | 2 | 2 | 0 | 2 | 4 | 0 | D2 | "made available only for academic use by academic users"; commercial licence required [S11]. Captured and asserted in t… |
| 68 | `bks-chunker` | internal | 0 | P0 | 3 | 2 | 1 | 0 | 1 | 3 | 0 | D9 | Does not exist. The fixture chunker `fixture-turn-window/v0` (blank-line paragraphs packed to ≤ 1500 chars) shows the i… |
| 69 | `rejuvenation-roadmap` | external | 2 | P1 | 2 | 2 | 0 | 0 | 1 | 2 | 0 | D13 | JS-rendered (Tavily got the shell); no ids; cross-check only |
| 70 | `company-report-pdf` | external | 1 | P0 | 6 | 1 | 4 | 1 | 4 | 6 | 0 | D8 | `-layout` misaligns table rows (Basis row "250 ND" in layout vs "250 261" in raw: E3) → TABLE selectors verified on pag… |
| 71 | `funder-award-pages` | external | 1 | P0 | 6 | 1 | 4 | 1 | 3 | 6 | 0 | D7 | press-release lists only; instrument and amounts often missing |
| 72 | `substack-api` | external | 2 | P1 | 6 | 1 | 3 | 2 | 2 | 6 | 0 | D9 | Undocumented and unversioned; paid posts truncated; no fixture in this packet uses it (FC-8 Topol retelling kept as a c… |
| 73 | `crossref-labs` | external | 1 | P0 | 4 | 1 | 3 | 0 | 2 | 4 | 0 | D3 | F: HTTP 403 `"message-type":"not-polite"` without mailto (R capture with mailto used; the address was not logged, its k… |
| 74 | `open-genes` | external | 2 | P1 | 4 | 1 | 3 | 0 | 0 | 4 | 0 | D2 | Undocumented API; the website is an SPA that Tavily cannot extract |
| 75 | `neo4j-gds` | internal | 2 | P1 | 7 | 1 | 2 | 4 | 2 | 7 | 0 | kernel | GDS availability on the deployed Aura tier not checked; projections need per-question Cypher projections and a write-ba… |
| 76 | `community-forums` | external | 2 | P1 | 5 | 1 | 2 | 2 | 3 | 5 | 0 | tooling | gives author and edit history the markdown lacks; handle → person resolution belongs to D9 |
| 77 | `firecrawl-change-tracking` | external | 2 | P1 | 4 | 1 | 2 | 1 | 3 | 3 | 0 | D8 | not exercised: the COVERS drop-off protocol (certification fixture) needs scheduled re-capture plus a diff that survive… |
| 78 | `trade-press` | external | 1 | P0 | 4 | 1 | 2 | 1 | 2 | 4 | 0 | D13 | undated captures; paywalls; used only for reported market moves and discovery |
| 79 | `wikidata` | external | 2 | P1 | 3 | 1 | 2 | 0 | 1 | 3 | 0 | tooling | `rvlimit=N` lists drift as the item is edited: pin by `revids`; a value repeats inside other statements' references, so… |
| 80 | `amazon-pages` | external | 1 | P0 | 2 | 1 | 1 | 0 | 0 | 2 | 0 | D6 | whitespace-heavy offer box; search by UPC returns nothing (ASIN discovery needs web search); unavailable listings show … |
| 81 | `ctgov-record-history` | external | 0 | P0 | 2 | 1 | 1 | 0 | 2 | 2 | 0 | D3 | No agent route to registry history. Build trials.observe_versions: poll v2 by lastUpdatePostDate and snapshot every cha… |
| 82 | `mpd-itp` | external | 1 | P0 | 2 | 1 | 1 | 0 | 2 | 2 | 0 | D3 | not exercised beyond landing pages |
| 83 | `repo-mcp-servers` | external | 0 | P0 | 2 | 1 | 1 | 0 | 0 | 2 | 0 | tooling | not loaded in the coordinator session; PubChem PUG REST via curl is the fallback; HAS_ANALYTE targets (NR, NAD+, NAAD) … |
| 84 | `sponsor-affiliate-pages` | external | 1 | P0 | 2 | 1 | 1 | 0 | 1 | 2 | 0 | D6 | link ownership is D9; disclosure is D7 |
| 85 | `ucum` | external | 2 | P1 | 2 | 1 | 0 | 1 | 1 | 2 | 0 | tooling | Unit normalization and conversion must be a BellLabs compute tool (deterministic, versioned), not a lookup. |
| 86 | `impact-affiliate-api` | external | 0 | P0 | 1 | 1 | 0 | 0 | 0 | 1 | 0 | D6 | D9/D7 seam (affiliate holder in CQ-CM-01) |
| 87 | `openalex` | external | 2 | P1 | 1 | 1 | 0 | 0 | 1 | 1 | 0 | tooling | Budget key before team runs; use for discovery and citation graph, never as the integrity authority (retraction flag is… |
| 88 | `publisher-pages` | external | 1 | P0 | 1 | 1 | 0 | 0 | 1 | 1 | 0 | tooling | Notice and article pages are capturable only as tool renditions; prefer Crossref / MEDLINE XML for integrity facts (G2)… |
| 89 | `supplier-pages` | external | 1 | P1 | 6 | 0 | 5 | 1 | 2 | 6 | 0 | D1 | domains are not obviously the supplier's (ksm66ashwagandhaa.com is reached by redirect from www.ixoreal.com; ksm66ashwa… |
| 90 | `open-targets` | external | 2 | P2 | 4 | 0 | 4 | 0 | 1 | 4 | 0 | D2 | Introspect schema before querying; pin release. |
| 91 | `openfda-caers` | external | 2 | P1 | 4 | 0 | 3 | 1 | 4 | 4 | 0 | D5 | Products are free-text brand strings (no GTIN, no UNII) → product resolution hypothesis; meta.disclaimer must travel wi… |
| 92 | `wearable-vendor-changelogs` | external | 1 | P1 | 3 | 0 | 3 | 0 | 1 | 3 | 0 | D4 | no version labels, no device model per change, dates without year in the entry (year from the page title); forum posts … |
| 93 | `who-ictrp` | external | 1 | P1 | 3 | 0 | 3 | 0 | 1 | 3 | 0 | D3 | Record pages are stale copies of source registries; useful for the prospective-registration flag and cross-registry ids… |
| 94 | `reddit` | external | 0 | P1 | 3 | 0 | 2 | 1 | 1 | 3 | 0 | D9 | Official API app or no community lens from Reddit. |
| 95 | `d2-hallmark-curation` | internal | 2 | P2 | 2 | 0 | 2 | 0 | 0 | 2 | 0 | D2 | Mapping decisions have no external source; publication as a kernel Report is open (11 item 12). Fixture leaves Nicotina… |
| 96 | `fda-clia-db` | external | 1 | P1 | 2 | 0 | 1 | 1 | 1 | 2 | 0 | D4 | form-POST only, no API (tool log #20) |
| 97 | `altmetric` | external | 0 | P1 | 1 | 0 | 1 | 0 | 0 | 1 | 0 | D9 | Licence decision. |
| 98 | `crossref-event-data` | external | 0 | P1 | 1 | 0 | 1 | 0 | 0 | 1 | 0 | D9 | Retired; remove from plans. |
| 99 | `fda-data-dashboard` | external | 0 | P1 | 1 | 0 | 1 | 0 | 1 | 1 | 0 | D8 | Register account. |
| 100 | `licensed-out-sources` | external | 0 | P1 | 1 | 0 | 1 | 0 | 1 | 1 | 0 | owner | Licence decisions for the owner; never store licensed content in the shared graph beyond identifiers and our own assert… |
| 101 | `mcp-biorxiv` | external | 2 | P2 | 1 | 0 | 1 | 0 | 1 | 1 | 0 | tooling | No keyword search (date/category only per MCP description). |
| 102 | `prospero` | external | 1 | P1 | 1 | 0 | 1 | 0 | 0 | 1 | 0 | D3 | JS app returned an empty shell to Tavily |
| 103 | `forecast-markets` | external | 2 | P3 | 1 | 0 | 0 | 1 | 0 | 1 | 0 | D13 | values change daily; capture time is part of the fact |

## 7. Method, inputs and caveats

- Inputs (sha256): `final/tooling/action-space.yaml` f891cf001d56045bc696739c097fa8820d008aa16a944139ec27ae01d7b71eeb; `final/relationship-register.yaml` 1db01e03e55d1708ae8c26f250ea9383ae5df6cce989f0ef27538163b506a501; `final/decision-report.md` fd7731b50f0aade84ca5a8ed3f0611c5a001dcdc7731353bd7877c678c0d8c05.
- Question values are the lowest value any packet's `02-questions.md` declares (R-08), parsed with D11's table rules. Harm is "polarity contains harm" in any packet.
- Questions are credited to an entry by D11's rules (a 05 `populatedBy`, the `02` sources column, or an id in the `08` row) plus the final register's `populatedBy`. Matching on the sources column is approximate, as D11's own caveat says. A tool can be credited for a question that a source it reaches merely mentions.
- The final register adds questions only where synthesis changed which tool populates a type, or which questions a type carries. Nothing is removed from D11's sets except non-surviving ids. Because no question was cut, only CQ-PF-03 is affected.
- `aliases` merges source families into one provider id (for example, D7's SEC form sources into `sec-edgar`, and D8's NSF and Informed Sport listings into `certification-databases`). Under R-39 `captureMethod` = `<action-space id>/<version>`, so the form or programme must be read from the Source record, not from the tool id.
- Readiness and gap text are D11's (cross-packet pass, 2026-10-08). Synthesis re-ranks the gaps but does not re-score readiness. Section 8 of D11's scorecard records the readiness disagreements across packets.
