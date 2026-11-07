# Readiness scorecard — bio-medical tooling action space

Packet D11, agent A8, 2026-10-08. **Generated** by `_notes/action-space/build-action-space.mjs` from `tooling/action-space.yaml`'s inputs; do not edit by hand. Readiness scale (PLAN 6.3): **0** blocked · **1** scrape-only · **2** API without stable locators · **3** agent-ready. Internal BellLabs tools use K's scale (0 not built … 3 in use) and are scored separately in section 4.

## 1. Summary

- **167 merged entries** (144 external, 23 internal) from 343 packet rows in 13 sibling `08` tables plus D11's 59 local entries, under **402 packet-local aliases** (top-level `aliases` in the registry).
- External readiness: 3 → 35 · 2 → 51 · 1 → 35 · 0 → 21 · unscored → 2. Internal (K scale): 3 → 3 · 2 → 8 · 1 → 8 · 0 → 4 · unscored → 0.
- Priority: P0 52 · P1 74 · P2 11 · P3 30. Exercised by at least one packet: 160. Needed by at least one question: 132.
- 429 of the 453 catalogued questions (all packets' `02`) name a tool or source the registry resolves.
- P0 entries: `amazon-pages` (1), `brand-pages` (1), `camelcamelcamel` (1), `certification-databases` (1), `coa-pdf` (1), `companies-house` (1), `company-report-pdf` (1), `consumer-test-vendor-pages` (1), `crossref-labs` (1), `crossref-rest` (3), `ctgov-record-history` (0), `ctgov-v2-api` (3), `europepmc-fulltext-jats` (3), `fda-gras-inventory` (1), `fda-gsrs` (3), `fda-web-pages` (1), `firecrawl-cli` (2), `ftc-pages` (1), `funder-award-pages` (1), `google-patents` (1), `hagr` (1), `iherb-pages` (1), `impact-affiliate-api` (0), `kegg-rest` (1), `lab-test-menus` (1), `mpd-itp` (1), `ncbi-eutils-pubmed` (3), `ncbi-web-pages` (0), `nih-dsld` (2), `phenol-explorer` (1), `propublica-dollars-for-profs` (1), `pubchem-pug-rest` (3), `publisher-pages` (1), `regulations-gov-attachments` (1), `repo-mcp-servers` (0), `restaurant-menu-pages` (1), `self-disclosure-pages` (1), `sponsor-affiliate-pages` (1), `trade-press` (1), `usda-fdc` (0), `youtube-pages` (1), `bks-chunker` (0), `bks-claim-extraction` (1), `bks-comparison-engine` (0), `bks-criteria-registry` (1), `bks-entity-resolution` (1), `bks-projection-job` (0), `bks-report-publish` (1), `d13-event-linker` (1), `d13-frontier-curator` (1), `ks-verification` (1), `nova-classifier` (1).

## 2. Scorecard by readiness level and domain (external entries)

An entry counts in every domain that lists it in `08` or whose questions need it, so rows do not sum to the total.

| domain | 3 agent-ready | 2 API, no locators | 1 scrape-only | 0 blocked | unscored | entries | P0 | value-1 questions needing a readiness ≤ 1 entry |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| K | 9 | 11 | 3 | 1 | 0 | 24 | 11 | 2 |
| D1 | 9 | 14 | 4 | 5 | 0 | 32 | 11 | 0 |
| D2 | 11 | 11 | 5 | 1 | 0 | 28 | 10 | 9 |
| D3 | 9 | 17 | 5 | 2 | 0 | 33 | 11 | 4 |
| D4 | 11 | 11 | 5 | 1 | 0 | 28 | 7 | 7 |
| D5 | 10 | 15 | 2 | 3 | 0 | 30 | 7 | 7 |
| D6 | 8 | 19 | 13 | 8 | 0 | 48 | 19 | 7 |
| D7 | 12 | 19 | 10 | 2 | 0 | 43 | 14 | 8 |
| D8 | 11 | 13 | 11 | 4 | 0 | 39 | 17 | 11 |
| D9 | 13 | 19 | 11 | 4 | 0 | 47 | 18 | 6 |
| D10 | 6 | 13 | 2 | 4 | 0 | 25 | 8 | 0 |
| D11 | 13 | 18 | 7 | 2 | 0 | 40 | 16 | 3 |
| D12 | 6 | 12 | 4 | 5 | 2 | 29 | 12 | 10 |
| D13 | 8 | 16 | 4 | 4 | 0 | 32 | 12 | 4 |
| **all** | **35** | **51** | **35** | **21** | **2** | **144** | **41** | |

## 3. External entries by readiness level

**readiness 3** (35): `bioregistry`, `chembl-rest`, `cms-open-payments`, `crossref-rest`, `ctgov-v2-api`, `dailymed-spl`, `ebi-ols4-chebi`, `ecfr-versioner`, `economist-bigmac-data`, `europepmc-fulltext-jats`, `europepmc-rest`, `fda-gsrs`, `fda-gudid`, `federal-register-api`, `gleif-lei`, `icd10cm-pcs`, `itunes-search-api`, `nanopub-registry`, `ncbi-bioc-pmcoa`, `ncbi-eutils-pubmed`, `nih-reporter`, `nlm-mesh-rdf`, `nlm-rxnav`, `nppes-npi`, `openfda-drugsfda`, `openfda-faers`, `orcid`, `pmc-idconv`, `podcast-rss`, `pubchem-pug-rest`, `quickgo`, `reactome-content-service`, `shopify-storefront-json`, `uniprot-rest`, `wearable-api-docs`.

**readiness 2** (51): `biorxiv-api`, `cafc-opinions`, `community-forums`, `company-press-releases`, `eu-ctis-public`, `eurlex`, `europepmc-annotations`, `exa-mcp`, `firecrawl-change-tracking`, `firecrawl-cli`, `firecrawl-research-index`, `forecast-markets`, `health-canada-lnhpd`, `health-canada-nhpid`, `http-capture`, `in-container-disclosures`, `internet-archive-wayback`, `isrctn`, `loinc`, `manufacturer-articles`, `mcp-biorxiv`, `mcp-clinicaltrials`, `mcp-pubmed`, `ncbi-bookshelf-livertox`, `ngsp`, `nih-dsld`, `nih-ods-api`, `open-food-facts`, `open-genes`, `open-targets`, `openalex`, `openfda-caers`, `openfda-device`, `openfda-drug-label`, `openfda-food-enforcement`, `product-label-contact`, `protocol-pages`, `publisher-episode-pages`, `regulations-gov-api`, `rejuvenation-roadmap`, `sec-edgar`, `semantic-scholar`, `substack-api`, `tavily-cli`, `telehealth-clinic-pages`, `tga-safety-updates`, `ucum`, `unpaywall`, `usda-fdc-portal`, `wikidata`, `youtube-oembed`.

**readiness 1** (35): `amazon-pages`, `atcc-catalog`, `brand-pages`, `browser-fallback`, `camelcamelcamel`, `certification-databases`, `coa-pdf`, `companies-house`, `company-report-pdf`, `consumer-test-vendor-pages`, `crossref-labs`, `fda-clia-db`, `fda-gras-inventory`, `fda-web-pages`, `ftc-pages`, `funder-award-pages`, `google-patents`, `hagr`, `iherb-pages`, `kegg-rest`, `lab-test-menus`, `mpd-itp`, `phenol-explorer`, `propublica-dollars-for-profs`, `prospero`, `publisher-pages`, `regulations-gov-attachments`, `restaurant-menu-pages`, `self-disclosure-pages`, `sponsor-affiliate-pages`, `supplier-pages`, `trade-press`, `wearable-vendor-changelogs`, `who-ictrp`, `youtube-pages`.

**readiness 0** (21): `ai-answer-engines`, `altmetric`, `amazon-pa-api`, `cas-common-chemistry`, `crossref-event-data`, `ctgov-record-history`, `efsa-journal-wiley`, `fda-data-dashboard`, `fsis-recall-api`, `gs1-verified`, `impact-affiliate-api`, `keepa-api`, `licensed-out-sources`, `ncbi-web-pages`, `opencorporates`, `patentsview`, `reddit`, `repo-mcp-servers`, `retailer-partner-apis`, `usda-fdc`, `uspto-tsdr`.

**unscored** (2): `efsa-food-composition`, `foodon`.

## 4. Internal BellLabs tooling (K scale: 0 not built · 1 designed · 2 partially built · 3 in use)

| id | readiness | priority | questions needing it (value-1) | registered by | gap |
| --- | ---: | --- | ---: | --- | --- |
| `kg-executor` | 2 | P1 | 33 (18) | K, D9, D13 | biotech-knowledge-intent.v1 cannot express Claim / OCCURRENCE_OF, assertionKind CLAIM, Assessment, Adjudication, Report, Activity ASSESSES Claim, supersedesUid… |
| `ks-verification` | 1 | P0 | 32 (18) | K, D13 | the graph ingest of judgments (Adjudication, per-evidence authority/independence, report-wide summary) is not built; fixtures used a deterministic re-selection… |
| `bks-curation-agent` | 2 | P1 | 29 (14) | D3, D4, D5, D9 | curated structural edges (HAS_ANALYTE, QUANTIFIES), rule-based inferences (RUNS_ON_DEVICE when a vendor names no model, Quest MEASURES_METRIC PROPOSED) and `FI… |
| `bks-entity-resolution` | 1 | P0 | 21 (13) | D3, D9, D12 | name variants need Assessments, not string match ("Das, D K" vs "Das, Dipak K"; "Bayer" vs "Bayer AG (Australia)"); condition text → D2 Condition (CTG "Bleedin… |
| `bks-projection-job` | 0 | P0 | 31 (11) | D2, D5, D9, D10 | Re-run on fixtures matched every declared edge (9 AFFECTS_MECHANISM after the adversarial review; 14 before the MolecularEntity pair was cut). Findings: SUIT1 … |
| `mission-control` | 2 | P1 | 23 (11) | K, D10 | runs exist, but no evidence-mission template (vetting → mission → report) and no Activity write-back to the graph at run start; fixture ids `mission:ft-K-fixtu… |
| `bks-claim-extraction` | 1 | P0 | 21 (9) | D9 | No runnable D9 extractor; `biotech-knowledge-intent.v1` cannot express a claim occurrence completely (no HAS_OBJECT, OCCURRENCE_OF, OCCURS_IN, multi-subject, o… |
| `d13-event-linker` | 1 | P0 | 15 (6) | D13 | specification only; the fixtures encode its expected output, including the CONTEXT_ONLY negative tests it must propose as assertions but never as edges |
| `d13-frontier-curator` | 1 | P0 | 10 (6) | D13 | specification only (rule frontier-classification/v1, vocab-frontiers.yaml@0.2.0); in the fixtures its assertions are hand-written to the spec; basisKind has no… |
| `poppler-pdftotext` | 3 | P1 | 14 (5) | D4, D8, D10, D12 | Latin-1 output for some PDFs (decode explicitly); layout text interleaves columns; deterministic (same text sha256 on re-run) |
| `bks-report-publish` | 1 | P0 | 13 (5) | D10 | no `report.publish` intent kind in biotech-knowledge-intent.v1 (fixtures' `intent.json` notes list the Report/ReportItem records that cannot be expressed); nee… |
| `bks-comparison-engine` | 0 | P0 | 5 (3) | D10 | evaluator for DecisionCriterion `rule` expressions (BLOCK before SCORE; unknown BLOCK input → NOT_EVALUATED); the fixture ranking was computed by hand from the… |
| `bks-criteria-registry` | 1 | P0 | 6 (2) | D10 | node.upsert of `DecisionCriterion` is expressible in v1 (validated in `mg-rankings-criteria-comparison/intent.json`), but no registry UI/agent, no rule grammar… |
| `nova-classifier` | 1 | P0 | 5 (2) | D12 | does not exist yet: needs a versioned marker lexicon (hydrogenated / interesterified oils, hydrolysed proteins, HFCS, cosmetic additive classes) with multiling… |
| `bks-chunker` | 0 | P0 | 3 (2) | D9 | Does not exist. The fixture chunker `fixture-turn-window/v0` (blank-line paragraphs packed to ≤ 1500 chars) shows the identity rule works but that chunks are n… |
| `neo4j-gds` | 2 | P1 | 7 (1) | D10 | GDS availability on the deployed Aura tier not checked; projections need per-question Cypher projections and a write-back as Association (SIMILARITY) records |
| `d2-hallmark-curation` | 2 | P2 | 2 (0) | D2 | Mapping decisions have no external source; publication as a kernel Report is open (11 item 12). Fixture leaves Nicotinate metabolism unmapped |
| `bks-entity-link-projection` | 0 | P3 | 0 (0) | K | not built; the fixture used an exact surface-form match (`fixture:entity-link-surface@0`) for 2 surface forms; needs a linker with a method version, RESOLUTION… |
| `bks-intent-contract` | 3 | P3 | 0 (0) | D2, D4, D7 | intent v1 has no field for assertionKind/claimType, no assessment proposal kind, no asserter on edge.structural; refs must match `^[a-z0-9]…` (upper-case locat… |
| `html-text-projection` | 2 | P3 | 0 (0) | D7, D8, D13 | must become the verifier's registered canonical projection (verification.v1 `canonicalProjectionArtifact`) or offsets are not reproducible; research copy wrote… |
| `local-contracts` | 3 | P3 | 0 (0) | K | internal only; benchmark excerpts carry rights restrictions |
| `locator-builder-verifier` | 2 | P3 | 0 (0) | D4, D7, D8, D13 | this is the custom tooling D4 needed: a selector builder that re-derives text by a named rule and emits verification.v1-shaped selectors; should move into the … |
| `poppler-pdftoppm` | 2 | P3 | 0 (0) | D8 | visual check of identifiers and table rows was manual (page images read by the agent); a BOUNDING_BOX selector from the text layer would make it repeatable |

## 5. Prioritized gap list (custom-tooling clusters, ranked by number and value of blocked questions)

A gap blocks the questions that need any of its entries (plus question ids named by the requesting packets). Score = 3 per value-1, 2 per value-2, 1 per value-3 question; ties break on value-1 count, then total. Priority: P0 when a value-1 question is blocked and the weakest entry is at readiness ≤ 1.

| rank | gap | title | blocked | value-1 | value-2 | value-3 | harm | score | weakest readiness | priority | owner | requested by |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| 1 | G4 | Capture normalizer and text-projection registry (named, versioned JATS/SPL/HTML/PDF → text rules, UTF-8 + LF,… | 217 | 82 | 117 | 18 | 103 | 498 | 2 | P1 | tooling | K, D2, D3, D4, D6, D7, D8, D10, D11, D13 |
| 2 | G13 | Intent contract v1 extensions (predicate-only Assertions with an object node, claim occurrences, assessments,… | 136 | 64 | 63 | 9 | 61 | 327 | 1 | P0 | kernel | K, D1, D2, D3, D4, D5, D6, D7, D9, D10, D12, D13 |
| 3 | G11 | Selector builder and verifier (locators computed from bytes; unique-occurrence growth of prefix/suffix; value… | 134 | 55 | 67 | 12 | 50 | 311 | 1 | P0 | tooling | K, D1, D2, D4, D6, D8, D10, D13 |
| 4 | G6 | Keys, quotas and service identity for team runs (data.gov, OpenAlex, Semantic Scholar, NCBI, Crossref polite … | 116 | 44 | 61 | 11 | 61 | 265 | 0 | P0 | owner | D3, D6, D7, D8, D11, D12 |
| 5 | G12 | Byte-faithful capture, durable artifact storage and per-publisher snapshot-identity rules (raw bytes beside r… | 105 | 36 | 55 | 14 | 49 | 232 | 1 | P0 | kernel | K, D4, D5, D7, D11, D13 |
| 6 | G8 | Change-tracked capture and scheduled re-capture for pages that version in place (FDA pages, certifier lists, … | 73 | 28 | 39 | 6 | 49 | 168 | 1 | P0 | tooling | D5, D6, D8, D11 |
| 7 | G7 | Label image and PDF parsers (Supplement Facts / Nutrition Facts OCR, panel images, COA row parser, PDF table … | 72 | 26 | 41 | 5 | 34 | 165 | 1 | P0 | tooling | D4, D6, D8, D11, D12 |
| 8 | G2 | Integrity checker (retraction, correction, expression of concern) reconciling Crossref updated-by, PubMed Com… | 68 | 31 | 33 | 4 | 31 | 163 | 1 | P0 | tooling | K, D3, D11, D13 |
| 9 | G5 | GTIN normalizer and listing resolver (UPC-A/EAN-13 → GTIN-14, check digit, ASIN/retailer id ↔ GTIN ↔ Package) | 60 | 22 | 33 | 5 | 25 | 137 | 0 | P0 | tooling | D6, D11, D12 |
| 10 | G17 | Archive-first capture with memento verification | 56 | 20 | 28 | 8 | 31 | 124 | 1 | P0 | tooling | D5, D7, D9, K |
| 11 | G18 | SEC filing extractors (item-code routing, beneficial-ownership tables and footnotes, accession-keyed selectio… | 49 | 17 | 27 | 5 | 23 | 110 | 2 | P1 | D7 | D7, D13 |
| 12 | G20 | Regulatory document parsers (warning-letter sections and index crawler, recall code_info lot parser, regulato… | 49 | 17 | 27 | 5 | 40 | 110 | 1 | P0 | D8 | D8, D12, D6, D7 |
| 13 | G1 | Self-observed registry versions (CT.gov history blocked) and an ISRCTN history-prose parser | 46 | 18 | 26 | 2 | 22 | 108 | 0 | P0 | tooling | D3, D11, D13 |
| 14 | G15 | Projection runner, entity-link projection and chunker (method-versioned derived edges with inputSetDigest) | 44 | 18 | 22 | 4 | 19 | 102 | 0 | P0 | kernel | K, D2, D5, D9, D10, D12 |
| 15 | G3 | Substance identity bridge with form awareness (GSRS authority; salt / moiety / quantity basis) | 37 | 14 | 20 | 3 | 14 | 85 | 2 | P1 | tooling | D1, D11, D5 |
| 16 | G14 | Fixture-mode verification.v1 runner (locators.yaml + assertions.yaml → Adjudications) | 32 | 18 | 14 | 0 | 17 | 82 | 1 | P0 | kernel | D13, K, D10 |
| 17 | G19 | Trial results extractor (CT.gov resultsSection → one JSON pointer per reported number; paper numbers as TEXT_… | 32 | 14 | 16 | 2 | 14 | 76 | 3 | P1 | D3 | D3 |
| 18 | G22 | Protocol and safety extractors (protocol step extractor and aligner, dose-vs-limit comparator, label sub-sect… | 29 | 12 | 12 | 5 | 20 | 65 | 2 | P1 | D5 | D5 |
| 19 | G9 | Person and organization identifier resolution as hypotheses (NPI homonyms, CIK↔LEI stale names, name-only per… | 30 | 8 | 19 | 3 | 15 | 65 | 0 | P0 | tooling | D7, D9, D11 |
| 20 | G16 | Audio and video capture with ASR, cue times and diarization; re-cut detection | 26 | 14 | 10 | 2 | 14 | 64 | 1 | P0 | D9 | D9 |
| 21 | G24 | LOINC resolution and gated lab-menu capture | 27 | 6 | 15 | 6 | 10 | 54 | 1 | P0 | D4 | D4 |
| 22 | G21 | Food composition loaders and resolution (FDC bulk loader, Phenol-Explorer parser, NOVA classifier, food entit… | 19 | 8 | 8 | 3 | 8 | 43 | 0 | P0 | D12 | D12 |
| 23 | G23 | Comparison engine, criteria registry and report publication | 14 | 6 | 8 | 0 | 4 | 34 | 0 | P0 | kernel | D10 |
| 24 | G25 | Licence decisions (DrugBank, Natural Medicines, KEGG commercial, CAS, LOINC table, CPT, ConsumerLab/Labdoor, … | 8 | 3 | 4 | 1 | 3 | 18 | 0 | P0 | owner | D1, D2, D5, D6, D7, D9, D11, D12 |
| 25 | G10 | Capture-attempt recorder (FAILED / PARTIAL CaptureAttempts, credential stripping, soft-failure detection, cap… | 4 | 1 | 3 | 0 | 2 | 9 | – | P0 | tooling | D11, K |

## 6. Entry-level gaps (readiness ≤ 2, ranked by blocked questions)

| rank | id | class | readiness | priority | questions | value-1 | harm | score | gap |
| ---: | --- | --- | ---: | --- | ---: | ---: | ---: | ---: | --- |
| 1 | `firecrawl-cli` | external | 2 | P0 | 140 | 53 | 68 | 317 | Fetches what curl cannot (bot-protected PDFs, publisher pages); keep raw bytes too (rawHtml / PDF) so the snapshot is not only a markdown derivative. |
| 2 | `sec-edgar` | external | 2 | P1 | 74 | 25 | 34 | 166 | filings.get with identity header from secret store; `lei` field null for this issuer → CIK↔LEI via GLEIF name match is a hypothesis. |
| 3 | `http-capture` | external | 2 | P1 | 53 | 21 | 31 | 122 | dynamic pages change bytes per request (CSRF token, Cloudflare parameters) so raw digests differ between captures with identical content; record SILENT_CONTENT_CHANGE an… |
| 4 | `nih-dsld` | external | 2 | P0 | 53 | 19 | 21 | 122 | Supplement Facts parser for the label PDF/image when JSON rows are incomplete; GTIN normalizer for upcSku ('8 50015 31111 6' → 00850015311116, check digit valid); read U… |
| 5 | `fda-web-pages` | external | 1 | P0 | 50 | 19 | 38 | 115 | Change-tracked scrape (Firecrawl monitor) of ingredient and letter pages; no API. |
| 6 | `tavily-cli` | external | 2 | P1 | 47 | 18 | 22 | 107 | Windows console crash on non-cp1252 output (write to file + UTF-8); extracted markdown is a derived rendition, so the snapshot hash is of the extraction, not of the byte… |
| 7 | `internet-archive-wayback` | external | 2 | P1 | 41 | 16 | 21 | 94 | The only way to know what a self-disclosure page said at statement time, but an `id_` request can serve a **different capture**, with HTTP 200 or with a redirect, depend… |
| 8 | `publisher-episode-pages` | external | 2 | P1 | 36 | 19 | 18 | 88 | Transcript "under human review", no per-turn media time, sponsor reads removed from the transcript (present only as a chapter label). |
| 9 | `nih-ods-api` | external | 2 | P1 | 38 | 14 | 20 | 87 | Scrape with change tracking. |
| 10 | `health-canada-lnhpd` | external | 2 | P1 | 37 | 15 | 21 | 86 | Name→NPN search tool; scrape status page. |
| 11 | `kg-executor` | internal | 2 | P1 | 33 | 18 | 17 | 84 | biotech-knowledge-intent.v1 cannot express Claim / OCCURRENCE_OF, assertionKind CLAIM, Assessment, Adjudication, Report, Activity ASSESSES Claim, supersedesUid, Evidence… |
| 12 | `ks-verification` | internal | 1 | P0 | 32 | 18 | 17 | 82 | the graph ingest of judgments (Adjudication, per-evidence authority/independence, report-wide summary) is not built; fixtures used a deterministic re-selection (`gen_loc… |
| 13 | `bks-projection-job` | internal | 0 | P0 | 31 | 11 | 16 | 71 | Re-run on fixtures matched every declared edge (9 AFFECTS_MECHANISM after the adversarial review; 14 before the MolecularEntity pair was cut). Findings: SUIT1 trend + AD… |
| 14 | `bks-curation-agent` | internal | 2 | P1 | 29 | 14 | 12 | 69 | curated structural edges (HAS_ANALYTE, QUANTIFIES), rule-based inferences (RUNS_ON_DEVICE when a vendor names no model, Quest MEASURES_METRIC PROPOSED) and `FIELD_NOT_RE… |
| 15 | `fda-gras-inventory` | external | 1 | P0 | 28 | 11 | 20 | 65 | letter links for older notices go to an archive-it wayback copy that returns HTML to curl (GRN 635 letter not captured); no API |
| 16 | `regulations-gov-api` | external | 2 | P1 | 28 | 11 | 22 | 65 | Metadata only; attachments need the next entry. |
| 17 | `brand-pages` | external | 1 | P0 | 25 | 14 | 13 | 64 | Change-tracked capture (Firecrawl monitor) + Supplement Facts image parser; claims on the page become ClaimOccurrences. |
| 18 | `openfda-food-enforcement` | external | 2 | P1 | 28 | 9 | 20 | 64 | Free-text UPC and firm names (observed 'UPC: PHF-C023', not a GTIN); openfda harmonization block empty for food → GTIN extractor + firm resolution. |
| 19 | `ncbi-web-pages` | external | 0 | P0 | 26 | 12 | 18 | 62 | the only path to non-OA research letters (JAMA melatonin, FC-06); no stable offsets across renders |
| 20 | `isrctn` | external | 2 | P1 | 26 | 11 | 12 | 62 | Self-observed versions, as for CT.gov. |
| 21 | `eurlex` | external | 2 | P1 | 28 | 9 | 20 | 62 | page bytes change between requests while the act text does not (research and fixtures captures differ) → identity must use a canonical text projection hash; annex tables… |
| 22 | `protocol-pages` | external | 2 | P1 | 27 | 12 | 14 | 61 | versioned in place with unchanged displayed dates; editions need scheduled capture + step extractor + `stepKey` alignment + payload hash; sponsor text must be split from… |
| 23 | `cafc-opinions` | external | 2 | P1 | 26 | 9 | 19 | 58 | born-digital text layer is clean, but discovery has no API (web search found the URL); line-end hyphens stay in the text ("as- serted"); claim numbers must be read from … |
| 24 | `mission-control` | internal | 2 | P1 | 23 | 11 | 9 | 57 | runs exist, but no evidence-mission template (vetting → mission → report) and no Activity write-back to the graph at run start; fixture ids `mission:ft-K-fixtures` / `ru… |
| 25 | `open-food-facts` | external | 2 | P1 | 23 | 10 | 11 | 55 | crowd data: per-country formulations collide under one barcode; NOVA is OFF-computed (store as CALCULATED by OFF, not source fact); field provenance per contributor not … |
| 26 | `bks-entity-resolution` | internal | 1 | P0 | 21 | 13 | 8 | 54 | name variants need Assessments, not string match ("Das, D K" vs "Das, Dipak K"; "Bayer" vs "Bayer AG (Australia)"); condition text → D2 Condition (CTG "Bleeding" → hemor… |
| 27 | `self-disclosure-pages` | external | 1 | P0 | 24 | 6 | 15 | 51 | Pages version in place with a self-dated stamp that can lag content changes; only archive copies give an as-of view. |
| 28 | `telehealth-clinic-pages` | external | 2 | P1 | 20 | 10 | 12 | 49 | no version dates; clinic lists mix drugs and foods |
| 29 | `bks-claim-extraction` | internal | 1 | P0 | 21 | 9 | 14 | 48 | No runnable D9 extractor; `biotech-knowledge-intent.v1` cannot express a claim occurrence completely (no HAS_OBJECT, OCCURRENCE_OF, OCCURS_IN, multi-subject, or assessme… |
| 30 | `consumer-test-vendor-pages` | external | 1 | P0 | 23 | 5 | 10 | 47 | no version, array, lab or reliability data; pages change within the hour; InsideTracker's panel list is an image ("BM List") → OCR or vendor docs needed for INCLUDES_TEST |
| 31 | `usda-fdc` | external | 0 | P0 | 20 | 8 | 7 | 45 | Register a data.gov key (readiness 3 with key); bulk CSV/JSON downloads as fallback. |
| 32 | `companies-house` | external | 1 | P0 | 20 | 5 | 12 | 43 | no key held; pages carry month/year of birth and residence (must not be stored) |
| 33 | `hagr` | external | 1 | P0 | 17 | 7 | 8 | 39 | No stable per-compound URL; compound identity is a name (needs D1 resolution), so it needs an adapter (score 2, not 3; adversarial review) |
| 34 | `biorxiv-api` | external | 2 | P1 | 16 | 7 | 9 | 38 | preprint→publication bridge is incomplete; reconcile with Crossref relation is-preprint-of and PubMed. |
| 35 | `openfda-drug-label` | external | 2 | P1 | 16 | 7 | 13 | 37 | Flattens SPL sections into strings and loses section ids/LOINC section codes; use for search, capture the SPL XML from DailyMed for locators. |
| 36 | `d13-event-linker` | internal | 1 | P0 | 15 | 6 | 8 | 35 | specification only; the fixtures encode its expected output, including the CONTEXT_ONLY negative tests it must propose as assertions but never as edges |
| 37 | `certification-databases` | external | 1 | P0 | 14 | 7 | 10 | 34 | Firecrawl with change tracking; certification claims on labels (DSLD 'Seals/Symbols') must be checked against these lists. |
| 38 | `coa-pdf` | external | 1 | P0 | 14 | 6 | 10 | 33 | discovery is ad hoc (search engine, marketplace listings); text extraction mis-orders result rows (Eurofins values print one row above their labels in `-raw` and `-layou… |
| 39 | `company-press-releases` | external | 2 | P1 | 15 | 5 | 9 | 33 | some undated (Loyal); syndicated copies (BioSpace) must be traced to the issuer; harm events may exist only here (BioAge: no 8-K) |
| 40 | `bks-report-publish` | internal | 1 | P0 | 13 | 5 | 4 | 31 | no `report.publish` intent kind in biotech-knowledge-intent.v1 (fixtures' `intent.json` notes list the Report/ReportItem records that cannot be expressed); needs an inse… |

103 entries at readiness ≤ 2 are needed by at least one question; the 40 highest are listed.

## 7. Custom tooling to build (in gap-rank order)

1. **G4 — Capture normalizer and text-projection registry (named, versioned JATS/SPL/HTML/PDF → text rules, UTF-8 + LF, NBSP/hyphen normalization, canonicalProjectionHash)** (P1; owner tooling; requested by K, D2, D3, D4, D6, D7, D8, D10, D11, D13). One registry of derivation rules (jats-xml2txt/v1, html2txt/v1, edgar-text/v5, h2t-v1, pdftotext -layout -enc UTF-8) with output encoding, newline convention and digest; shared normalization profile nbsp-nnbsp-hyphen/v1 with the verifier; the projection is part of the snapshot (kernel canonicalProjectionHash).
   - Entries: `europepmc-fulltext-jats` (3), `dailymed-spl` (3), `ctgov-v2-api` (3), `html-text-projection` (2), `poppler-pdftotext` (3), `ncbi-eutils-pubmed` (3), `sec-edgar` (2), `firecrawl-cli` (2), `tavily-cli` (2).
   - Blocks 217 questions, 82 of value 1: CQ-AX-23, CQ-AX-24, CQ-AX-25, CQ-CL-05, CQ-CM-01, CQ-DX-01, CQ-DX-02, CQ-DX-03, CQ-DX-04, CQ-EC-03, CQ-EV-04, CQ-EV-05, CQ-ID-02, CQ-ID-05, CQ-MF-01, CQ-MF-03, CQ-MX-01, CQ-MX-02, … (+64).
2. **G13 — Intent contract v1 extensions (predicate-only Assertions with an object node, claim occurrences, assessments, qualifiers, supersedesUid, held proposals, report.publish, projection.write)** (P0; owner kernel; requested by K, D1, D2, D3, D4, D5, D6, D7, D9, D10, D12, D13). Contract and executor work in packages/contracts and kg-ops: assertion.object, assertion.claim, assessment.record, assertion.hold / project-on-adjudication, qualifiers and supersedesUid on AssertionCore, asserter on identifier.attach and edge.structural, report.publish and projection.write intents.
   - Entries: `kg-executor` (2), `bks-intent-contract` (3), `bks-curation-agent` (2), `bks-claim-extraction` (1), `bks-entity-resolution` (1), `d2-hallmark-curation` (2), `d13-frontier-curator` (1), `d13-event-linker` (1), `bks-report-publish` (1), `bks-criteria-registry` (1).
   - Blocks 136 questions, 64 of value 1: CQ-AX-01, CQ-AX-07, CQ-CL-01, CQ-CL-02, CQ-CL-05, CQ-CL-08, CQ-DX-01, CQ-DX-02, CQ-DX-03, CQ-DX-04, CQ-EV-05, CQ-RC-01, CQ-RC-06, CQ-ST-01, CQ-ST-02, CQ-ST-05, CQ-ST-06, Q-D3-04, … (+46).
3. **G11 — Selector builder and verifier (locators computed from bytes; unique-occurrence growth of prefix/suffix; value-keyed JSON selectors; re-anchoring store)** (P0; owner tooling; requested by K, D1, D2, D4, D6, D8, D10, D13). A locator compiler in the ingestion path (quotes from bytes, never from model output) that refuses ambiguous quotes, grows context until unique, keys JSON selectors by value (edgar-accession/v1, @displayName=…), and re-selects on every capture.
   - Entries: `locator-builder-verifier` (2), `ks-verification` (1), `firecrawl-cli` (2), `tavily-cli` (2), `uniprot-rest` (3), `reactome-content-service` (3), `sec-edgar` (2).
   - Blocks 134 questions, 55 of value 1: CQ-AX-25, CQ-CM-01, CQ-DX-01, CQ-DX-02, CQ-DX-03, CQ-DX-04, CQ-EV-05, CQ-ID-02, CQ-ID-05, CQ-ID-06, CQ-MF-01, CQ-MF-03, CQ-MX-01, CQ-PF-01, CQ-RC-05, CQ-ST-02, Q-D1-05, Q-D1-07, … (+37).
4. **G6 — Keys, quotas and service identity for team runs (data.gov, OpenAlex, Semantic Scholar, NCBI, Crossref polite pool, FDA Data Dashboard, USPTO, Companies House, Keepa)** (P0; owner owner; requested by D3, D6, D7, D8, D11, D12). A secret-store-backed service identity per provider (never printed, never in requestUri), quota accounting per run, and the repo .mcp.json servers loaded in agent sessions.
   - Entries: `usda-fdc` (0), `openalex` (2), `semantic-scholar` (2), `regulations-gov-api` (2), `ncbi-eutils-pubmed` (3), `crossref-rest` (3), `fda-data-dashboard` (0), `uspto-tsdr` (0), `companies-house` (1), `keepa-api` (0), `cas-common-chemistry` (0).
   - Blocks 116 questions, 44 of value 1: CQ-AX-23, CQ-AX-24, CQ-CL-05, CQ-EC-03, CQ-EV-04, CQ-EV-05, CQ-MF-01, CQ-MF-02, CQ-MF-03, CQ-PF-03, CQ-ST-01, CQ-ST-02, CQ-ST-04, CQ-ST-05, CQ-ST-06, CQ-ST-07, Q-D3-04, Q-D3-05, … (+26).
5. **G12 — Byte-faithful capture, durable artifact storage and per-publisher snapshot-identity rules (raw bytes beside renditions; EDGAR injected-script strip rule; TOOL_RENDITION hash basis)** (P0; owner kernel; requested by K, D4, D5, D7, D11, D13). Store raw HTTP bytes (and PDF bytes) next to every rendition in durable blob storage (kernel storageUri); identity rules per publisher for rotating content; a contentHashBasis for tool renditions and extracted text (requested from K: TOOL_RENDITION / EXTRACTED_TEXT_BYTES).
   - Entries: `http-capture` (2), `firecrawl-cli` (2), `tavily-cli` (2), `sec-edgar` (2), `publisher-pages` (1), `internet-archive-wayback` (2), `ftc-pages` (1).
   - Blocks 105 questions, 36 of value 1: CQ-CL-05, CQ-DX-01, CQ-DX-02, CQ-DX-03, CQ-DX-04, CQ-EC-03, CQ-EV-05, CQ-MF-01, CQ-PV-04, Q-D4-01, Q-D4-08, Q-D4-17, Q-D5-06, Q-D5-10, Q-D5-11, Q-D5-13, Q-D7-01, Q-D7-04, … (+18).
6. **G8 — Change-tracked capture and scheduled re-capture for pages that version in place (FDA pages, certifier lists, brand and protocol pages, SPL archives)** (P0; owner tooling; requested by D5, D6, D8, D11). Firecrawl monitor / scheduled re-capture with diff → NEW_VERSION snapshots; SPL version differ over DailyMed archived zips; certifier COVERS episodes from re-capture.
   - Entries: `fda-web-pages` (1), `regulations-gov-attachments` (1), `certification-databases` (1), `brand-pages` (1), `protocol-pages` (2), `firecrawl-change-tracking` (2), `dailymed-spl` (3), `wearable-vendor-changelogs` (1).
   - Blocks 73 questions, 28 of value 1: CQ-AX-23, CQ-MF-01, CQ-MF-02, CQ-MF-03, CQ-PF-03, CQ-PV-04, CQ-RC-06, Q-D5-01, Q-D5-02, Q-D5-03, Q-D5-04, Q-D5-06, Q-D5-07, Q-D5-10, Q-D5-11, Q-D5-13, Q-D5-15, Q-D5-23, … (+10).
7. **G7 — Label image and PDF parsers (Supplement Facts / Nutrition Facts OCR, panel images, COA row parser, PDF table reconstruction with page-render cross-check)** (P0; owner tooling; requested by D4, D6, D8, D11, D12). OCR with BOUNDING_BOX selectors for label and panel images; COA row parser emitting resultBasis per row; PDF table reconstruction cross-checked against pdftoppm renders; page-addressed PDF_TEXT locators.
   - Entries: `brand-pages` (1), `nih-dsld` (2), `coa-pdf` (1), `company-report-pdf` (1), `consumer-test-vendor-pages` (1), `poppler-pdftoppm` (2), `poppler-pdftotext` (3), `regulations-gov-attachments` (1).
   - Blocks 72 questions, 26 of value 1: CQ-AX-23, CQ-AX-25, CQ-DX-01, CQ-DX-02, CQ-DX-03, CQ-DX-04, CQ-ID-02, CQ-ID-05, CQ-MF-01, CQ-MF-02, CQ-MF-03, CQ-PF-01, CQ-PF-03, CQ-PV-04, Q-D4-01, Q-D6-01, Q-D6-04, Q-D6-10, … (+8).
8. **G2 — Integrity checker (retraction, correction, expression of concern) reconciling Crossref updated-by, PubMed CommentsCorrections and Retraction Watch** (P0; owner tooling; requested by K, D3, D11, D13). literature.check_integrity: one HAS_REVISION_STATUS Assertion per authority (K M6) and REVISES episodes when the notice is identified (D3); RW reasons from the CSV; status-only flags (OpenAlex is_retracted) never become REVISES. Blocked on the K/D3 REVISES vs HAS_REVISION_STATUS ruling (D3 open question 33).
   - Entries: `crossref-rest` (3), `ncbi-eutils-pubmed` (3), `openalex` (2), `crossref-labs` (1).
   - Blocks 68 questions, 31 of value 1: CQ-AX-24, CQ-EV-04, CQ-EV-05, CQ-ST-01, CQ-ST-02, CQ-ST-04, CQ-ST-05, CQ-ST-06, CQ-ST-07, Q-D3-04, Q-D3-05, Q-D3-06, Q-D3-08, Q-D3-13, Q-D11-04, Q-D11-05, Q-D13-01, Q-D13-02, … (+13).
9. **G5 — GTIN normalizer and listing resolver (UPC-A/EAN-13 → GTIN-14, check digit, ASIN/retailer id ↔ GTIN ↔ Package)** (P0; owner tooling; requested by D6, D11, D12). gtin14-v1 normalizer applied to DSLD upcSku, openFDA free text, FDC gtinUpc, Shopify barcode, OFF barcodes; listing resolver emitting EQUIVALENCE assessments; recall-to-listing matching from free-text lot codes.
   - Entries: `nih-dsld` (2), `openfda-food-enforcement` (2), `usda-fdc` (0), `brand-pages` (1), `shopify-storefront-json` (3), `amazon-pages` (1), `open-food-facts` (2), `gs1-verified` (0).
   - Blocks 60 questions, 22 of value 1: CQ-AX-25, CQ-CM-01, CQ-CM-03, CQ-ID-02, CQ-ID-05, CQ-PF-01, CQ-PF-03, CQ-PV-04, Q-D6-01, Q-D6-04, Q-D6-10, Q-D6-15, Q-D6-16, Q-D12-01, Q-D12-02, Q-D12-03, Q-D12-04, Q-D12-05, … (+4).
10. **G17 — Archive-first capture with memento verification** (P0; owner tooling; requested by D5, D7, D9, K). Internet Archive id_ copy of the pre-redirect URL (gzip-decode, hash, project), accepted only when the served memento-datetime and payload SHA1 match the CDX row; snapshot ordering by coalesce(observedAt, retrievedAt); browser capture only when no archive copy exists, logged as a readiness exception.
   - Entries: `internet-archive-wayback` (2), `self-disclosure-pages` (1), `protocol-pages` (2).
   - Blocks 56 questions, 20 of value 1: CQ-CL-01, CQ-CL-02, CQ-CL-05, CQ-EC-03, CQ-RC-05, Q-D5-01, Q-D5-02, Q-D5-03, Q-D5-06, Q-D5-07, Q-D5-10, Q-D5-11, Q-D5-13, Q-D7-01, Q-D7-06, Q-D7-09, Q-D7-20, Q-D9-01, … (+2).
11. **G18 — SEC filing extractors (item-code routing, beneficial-ownership tables and footnotes, accession-keyed selection)** (P1; owner D7; requested by D7, D13). EDGAR fetcher with 8-K item routing and a registered HTML→text projection; ownership-table parser (holder, shares, percent, basis wording, voting/dispositive power, cited 13D/13G).
   - Entries: `sec-edgar` (2), `html-text-projection` (2).
   - Blocks 49 questions, 17 of value 1: CQ-CL-05, CQ-EC-03, CQ-EV-05, CQ-MF-01, Q-D7-01, Q-D7-04, Q-D7-06, Q-D7-09, Q-D13-01, Q-D13-02, Q-D13-03, Q-D13-04, Q-D13-05, Q-D13-06, Q-D13-08, Q-D13-10, Q-D13-16.
12. **G20 — Regulatory document parsers (warning-letter sections and index crawler, recall code_info lot parser, regulator survey tables)** (P0; owner D8; requested by D8, D12, D6, D7). Section parser and crawler for warning letters; recall code_info lot parser; FDA survey tables with group labels and sampling windows carried to every row.
   - Entries: `fda-web-pages` (1), `openfda-food-enforcement` (2), `fda-gras-inventory` (1), `regulations-gov-attachments` (1), `ftc-pages` (1), `eurlex` (2).
   - Blocks 49 questions, 17 of value 1: CQ-AX-23, CQ-CL-05, CQ-EC-03, CQ-MF-01, CQ-MF-02, CQ-MF-03, CQ-PF-03, Q-D6-04, Q-D7-06, Q-D8-01, Q-D8-02, Q-D8-04, Q-D8-05, Q-D8-12, Q-D8-23, Q-D12-03, Q-D12-06.
13. **G1 — Self-observed registry versions (CT.gov history blocked) and an ISRCTN history-prose parser** (P0; owner tooling; requested by D3, D11, D13). trials.observe_versions: poll CT.gov v2 by lastUpdatePostDate and snapshot every change as OBSERVED RegistrationVersions; ISRCTN 'Provided at time of registration / Updated as of / Amended' blocks and Editorial Notes → RECONSTRUCTED versions.
   - Entries: `ctgov-record-history` (0), `ctgov-v2-api` (3), `isrctn` (2).
   - Blocks 46 questions, 18 of value 1: CQ-EV-04, CQ-ST-01, CQ-ST-02, CQ-ST-04, CQ-ST-05, CQ-ST-06, CQ-ST-07, Q-D3-04, Q-D3-05, Q-D3-06, Q-D3-08, Q-D3-13, Q-D13-01, Q-D13-02, Q-D13-03, Q-D13-04, Q-D13-08, Q-D13-16.
14. **G15 — Projection runner, entity-link projection and chunker (method-versioned derived edges with inputSetDigest)** (P0; owner kernel; requested by K, D2, D5, D9, D10, D12). Promote the fixture stand-ins (project.py, gen.mjs) into executor PROJECTION Activities with method versions and inputSetDigest; MENTIONS from entity linking with identifier-scheme checks; the chunker over DocumentTextVersions.
   - Entries: `bks-projection-job` (0), `bks-entity-link-projection` (0), `bks-chunker` (0), `bks-entity-resolution` (1), `neo4j-gds` (2), `europepmc-annotations` (2).
   - Blocks 44 questions, 18 of value 1: CQ-AX-01, CQ-EV-02, CQ-PV-04, CQ-RC-06, Q-D2-03, Q-D2-06, Q-D2-23, Q-D5-03, Q-D5-04, Q-D5-11, Q-D5-23, Q-D9-16, Q-D9-20, Q-D12-03, Q-D12-04, Q-D12-05, Q-D12-08, Q-D12-34.
15. **G3 — Substance identity bridge with form awareness (GSRS authority; salt / moiety / quantity basis)** (P1; owner tooling; requested by D1, D11, D5). substances.resolve: DSLD row + form UNII → GSRS record → ACTIVE MOIETY, never a PubChem name→CID hit alone; RESOLUTION assessments as output; rule table for mw-ratio / nutrient-equivalent / daily-max pinned to a GSRS record version.
   - Entries: `fda-gsrs` (3), `pubchem-pug-rest` (3), `nih-dsld` (2), `ebi-ols4-chebi` (3), `chembl-rest` (3), `nlm-rxnav` (3).
   - Blocks 37 questions, 14 of value 1: CQ-AX-14, CQ-ID-06, CQ-PF-01, CQ-PV-04, CQ-ST-02, Q-D1-01, Q-D1-02, Q-D1-03, Q-D1-04, Q-D1-05, Q-D1-07, Q-D1-26, Q-D11-03, Q-D11-09.
16. **G14 — Fixture-mode verification.v1 runner (locators.yaml + assertions.yaml → Adjudications)** (P0; owner kernel; requested by D13, K, D10). Run verification.v1 over a fixture's captured artifacts and emit SUPPORT / CONTRADICT adjudications so gated typed edges (LEADS_TO, RESPONDS_TO) can be projected.
   - Entries: `ks-verification` (1), `locator-builder-verifier` (2).
   - Blocks 32 questions, 18 of value 1: Q-D10-17, Q-D13-01, Q-D13-05, Q-D13-06, Q-D13-08, Q-K-01, Q-K-05, Q-K-06, Q-K-08, Q-K-09, Q-K-10, Q-K-11, Q-K-14, Q-K-15, Q-K-17, Q-K-20, Q-K-21, Q-K-28.
17. **G19 — Trial results extractor (CT.gov resultsSection → one JSON pointer per reported number; paper numbers as TEXT_QUOTE)** (P1; owner D3; requested by D3). Estimates, bounds, n, P and AE affected / at risk mapped to arms; paper text numbers inside verified sentences.
   - Entries: `ctgov-v2-api` (3), `europepmc-fulltext-jats` (3), `ncbi-eutils-pubmed` (3).
   - Blocks 32 questions, 14 of value 1: CQ-AX-24, CQ-EV-04, CQ-EV-05, CQ-ST-01, CQ-ST-02, CQ-ST-04, CQ-ST-05, CQ-ST-06, CQ-ST-07, Q-D3-04, Q-D3-05, Q-D3-06, Q-D3-08, Q-D3-13.
18. **G22 — Protocol and safety extractors (protocol step extractor and aligner, dose-vs-limit comparator, label sub-section splitter, CAERS reaction normalizer)** (P1; owner D5; requested by D5). Canonical step payload + payloadHash + stepKey aligner across in-place editions; query-time dose-vs-limit comparator (unit, period, intake scope, population, elemental-vs-salt mass); openFDA section-blob splitter; reaction-term normalization before any count.
   - Entries: `protocol-pages` (2), `openfda-drug-label` (2), `openfda-caers` (2), `openfda-faers` (3), `dailymed-spl` (3), `nih-ods-api` (2).
   - Blocks 29 questions, 12 of value 1: CQ-RC-06, Q-D5-01, Q-D5-02, Q-D5-03, Q-D5-04, Q-D5-06, Q-D5-07, Q-D5-10, Q-D5-11, Q-D5-13, Q-D5-15, Q-D5-23.
19. **G9 — Person and organization identifier resolution as hypotheses (NPI homonyms, CIK↔LEI stale names, name-only persons across filings and pages)** (P0; owner tooling; requested by D7, D9, D11). RESOLUTION assessments requiring a second key (licence, address, ORCID-linked affiliation); never identity by name.
   - Entries: `nppes-npi` (3), `sec-edgar` (2), `gleif-lei` (3), `orcid` (3), `nih-reporter` (3), `companies-house` (1), `opencorporates` (0).
   - Blocks 30 questions, 8 of value 1: CQ-CL-05, CQ-EC-03, CQ-MF-01, Q-D7-01, Q-D7-04, Q-D7-05, Q-D7-06, Q-D7-09.
20. **G16 — Audio and video capture with ASR, cue times and diarization; re-cut detection** (P0; owner D9; requested by D9). Enclosure download + ASR with cue times + diarization writing a text version with textBasis ASR; audio fingerprint or transcript alignment for REPUBLISHES.
   - Entries: `podcast-rss` (3), `youtube-pages` (1), `publisher-episode-pages` (2).
   - Blocks 26 questions, 14 of value 1: CQ-CL-01, CQ-CL-02, CQ-CL-03, CQ-CL-04, CQ-CL-05, CQ-CL-08, CQ-PV-04, CQ-RC-05, Q-D9-01, Q-D9-02, Q-D9-04, Q-D9-05, Q-D9-16, Q-D9-20.
21. **G24 — LOINC resolution and gated lab-menu capture** (P0; owner D4; requested by D4). Licensed LOINC table or FHIR access to map vendor metric names to LOINC; Firecrawl interact or a browser profile for service-area-gated sections (recorded readiness exceptions); UCUM conversion as a deterministic compute tool.
   - Entries: `loinc` (2), `lab-test-menus` (1), `consumer-test-vendor-pages` (1), `ucum` (2).
   - Blocks 27 questions, 6 of value 1: CQ-DX-01, CQ-DX-02, CQ-DX-03, CQ-DX-04, Q-D4-01, Q-D4-17.
22. **G21 — Food composition loaders and resolution (FDC bulk loader, Phenol-Explorer parser, NOVA classifier, food entity resolution)** (P0; owner D12; requested by D12). FDC bulk download → FoodItem and FOOD_CONTAINS with derivation code, n, min, max; food × compound rows from Phenol-Explorer; nova-markers/v<n> CALCULATED assertions; food RESOLUTION across FDC, menus, Phenol-Explorer and OFF.
   - Entries: `usda-fdc` (0), `usda-fdc-portal` (2), `phenol-explorer` (1), `open-food-facts` (2), `restaurant-menu-pages` (1), `nova-classifier` (1), `foodon` (–).
   - Blocks 19 questions, 8 of value 1: Q-D12-01, Q-D12-02, Q-D12-03, Q-D12-04, Q-D12-05, Q-D12-08, Q-D12-26, Q-D12-34.
23. **G23 — Comparison engine, criteria registry and report publication** (P0; owner kernel; requested by D10). DecisionCriterion rules with BLOCK-before-SCORE and NOT_EVALUATED on unknown inputs; report.publish transaction for Report + ReportItems with body and ledger digests.
   - Entries: `bks-comparison-engine` (0), `bks-criteria-registry` (1), `bks-report-publish` (1).
   - Blocks 14 questions, 6 of value 1: CQ-AX-01, CQ-RC-01, CQ-RC-06, Q-D10-01, Q-D10-08, Q-D10-14.
24. **G25 — Licence decisions (DrugBank, Natural Medicines, KEGG commercial, CAS, LOINC table, CPT, ConsumerLab/Labdoor, Altmetric, Reddit, Amazon PA, retailer and affiliate APIs)** (P0; owner owner; requested by D1, D2, D5, D6, D7, D9, D11, D12). Owner decisions: license, store identifiers only, or skip; never store licensed content in the shared graph beyond identifiers and our own cited assertions.
   - Entries: `licensed-out-sources` (0), `kegg-rest` (1), `cas-common-chemistry` (0), `altmetric` (0), `reddit` (0), `amazon-pa-api` (0), `retailer-partner-apis` (0), `impact-affiliate-api` (0), `efsa-journal-wiley` (0), `opencorporates` (0).
   - Blocks 8 questions, 3 of value 1: CQ-CM-01, CQ-MX-01, Q-D2-01.
25. **G10 — Capture-attempt recorder (FAILED / PARTIAL CaptureAttempts, credential stripping, soft-failure detection, captureMethod stamping)** (P0; owner tooling; requested by D11, K). Every adapter emits a D11 CaptureAttempt for FAILED and PARTIAL requests, writes authoritative empties as COMPLETE snapshots plus FIELD_NOT_REPORTED, strips credentials, detects 200-with-challenge pages and stamps SourceSnapshot.captureMethod = '<entry id>/<version>'.
   - Entries: every adapter.
   - Blocks 4 questions, 1 of value 1: Q-D11-17.

## 8. Readiness disagreements across packets (spread ≥ 2 among the packets' own scores)

| id | merged readiness | packet scores | basis |
| --- | ---: | --- | --- |
| `ecfr-versioner` | 3 | D1 3; D5 3; D6 3; D8 3; D9 2; D12 1; D13 2 | lower median of 7 packet score(s) |
| `europepmc-fulltext-jats` | 3 | K 2; D1 3; D2 2; D3 2; D4 3; D7 3; D7 3; D8 3; D9 3; D10 3; D12 1 | D11-local score (exercised or scored by D11; PLAN 6.3 definition) |
| `firecrawl-cli` | 2 | K 2; K 3; D1 2; D2 2; D4 2; D5 2; D6 1.5; D6 2; D7 3 (static pages) / 1 (script-gated); D8 2; D9 2; D9 2; D9 3; D10 2; D12 2; D13 2 | override (D11): Every packet: renditions are not byte-stable across fetches (D4, D6, D9, D12, D13); quotes re-anchor by… |
| `ncbi-bookshelf-livertox` | 2 | D4 0; D5 1; D10 3; D10 0 | D11-local score (exercised or scored by D11; PLAN 6.3 definition) |
| `usda-fdc` | 0 | D6 0 today / 3 with a key; D12 2 (this run); 3 only with a key | D11-local score (exercised or scored by D11; PLAN 6.3 definition) |
| `bks-projection-job` | 0 | D2 2; D2 0; D5 1; D9 0; D10 0 | lower median of 5 packet score(s) |

## 9. Identifier schemes: kernel register coverage and tool routes

Reconciled 114 scheme codes (K register v2: 103 codes, 56 of them `requested`; node registers of all packets: 103 codes; D11 bridge rows). Full table: generated block at the end of `identifier-bridges.yaml`.

- **Missing from the K register** (requests to K in `11-open-questions.md`): `EIN` (D11 bridge); `FNDDS_FOOD_CODE` (D12.FoodItem); `FOODEX2` (D12.FoodCategory); `FOODON` (D12.FoodItem); `LANGUAL` (D12.FoodCategory); `NCIT` (D11 optional); `NDB_NUMBER` (D12.FoodItem); `ORG_STUDY_ID` (D11 bridge); `PHENOL_EXPLORER_FOOD` (D12.FoodItem); `SPL_SET_ID` (D11 bridge); `WWEIA_CATEGORY` (D12.FoodCategory).
- **Used by a node register but no registry entry emits it** (no detected authority route): `ISBN`, `LNHPD_INGREDIENT`, `OMIM`, `ORPHANET`, `PHENOL_EXPLORER_FOOD`, `PODCAST_INDEX_FEED`, `PTAB_TRIAL`, `SNOMEDCT`, `SPOTIFY`, `SUPPLIER_CODE`, `WEB_DOMAIN`, `WIKIPATHWAYS`, `WWEIA_CATEGORY`, `X_ACCOUNT`, `X_POST`, `YOUTUBE_CHANNEL`.
- **Best route at readiness ≤ 1**: `CPT` (lab-test-menus (1)), `CULTURE_COLLECTION` (atcc-catalog (1)), `FDA_WARNING_LETTER` (fda-web-pages (1)), `FDC_ID` (usda-fdc (0)), `FNDDS_FOOD_CODE` (usda-fdc (0)), `FOODEX2` (efsa-food-composition (?)), `FOODON` (foodon (?)), `KEGG_PATHWAY` (kegg-rest (1)), `LAB_REPORT` (coa-pdf (1)), `LAB_TEST_CODE` (lab-test-menus (1)), `NCBI_GENE` (kegg-rest (1)), `PATENT_APPLICATION` (google-patents (1)), `PATENT_PUB` (google-patents (1)), `RETAILER_ITEM_ID` (iherb-pages (1)), `YOUTUBE_VIDEO` (youtube-pages (1)).
- **Pattern differences between D11 bridge rows and K**: `MESH`: D11 '^[DCQ][0-9]{6,9}$' vs K '^[DC][0-9]{6,9}$' · `SEC_CIK`: D11 '^[0-9]{1,10}$' vs K '^[0-9]{10}$'.

## 10. Method and caveats

- Deduplication is a judgment recorded line by line in `_notes/action-space/merge-spec.yaml` (`rules`); the script refuses any packet row no rule matches. Source families reached through one provider API (SEC forms, Europe PMC JATS sections, FDA web pages) merge into the provider entry; distinct routes with different readiness (CT.gov v2 vs its blocked history, FDC API vs its undocumented portal JSON, Europe PMC metadata vs JATS full text) stay separate.
- `blockedQuestions` means "questions that need it" (populatedBy, `02` sources column, or a question id in the `08` row). S-key citations in the sources column (`S12`, `[S28]–[S31]`) are expanded to their definition lines in the packet's `01-ecosystem.md` (URL and title) before matching; K and D10 name sources in words. Pattern matching is approximate: it can credit a tool that a source was merely fetched through.
- `exercisedBy` combines each packet's own `exercised` cell with tool-log pattern hits; a hit is a log line that mentions the tool, which includes recorded failures (a failed call is still an exercise and a readiness finding).
- Readiness when packets disagree: D11's score stands for D11-local entries unless an override with a reason is listed; other entries take the lower median of the packets' current scores ("0 today / 3 with a key" counts as 0).
- Unresolved references: 0 populatedBy ids not found in any `08` row; 0 question ids named in rows or gaps but absent from every `02`.
