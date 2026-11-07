# D4 — tool log (research stage, A3, 2026-10-08)

Feeds `08-sources-and-tools.md` and the D11 action-space registry. Raw captures and hashes: run scratch `ft\D4\raw\`, `ft\D4\SHA256SUMS.txt`. No `.env` value was printed or copied; CLIs read keys from the environment.

| # | tool / access | what it fetched | result | problems / readiness finding |
| --- | --- | --- | --- | --- |
| 1 | `tvly --status`, `firecrawl --status` | auth check | Tavily v0.1.5 authenticated; Firecrawl v1.23.1 authenticated, 0/5 jobs, credits 5,448 | — |
| 2 | Firecrawl CLI `scrape --only-main-content -o` | loinc.org/4548-4, loinc.org/1884-6 (and 1884-4 by mistake) | clean markdown incl. part model, release versions | 1884-4 returned LOINC's "Invalid check digit" page — LOINC validates check digits (useful for identifier validation) |
| 3 | Firecrawl CLI | Labcorp 001453 test page | full page incl. LOINC map table | — |
| 4 | Firecrawl CLI (`--wait-for 3000`) | Quest test 496 | methodology, specimen, range | LOINC codes and performing lab hidden behind service-area selector (readiness 1 for those fields); cookie-banner text in capture |
| 5 | curl | NLM Clinical Tables LOINC + UCUM APIs | JSON; LOINC search by text and by code; UCUM codes | SYSTEM/SCALE_TYP/EXAMPLE_UCUM_UNITS returned null for 4548-4 — partial part model; no hits for RMSSD/epigenetic/DNAm age/NAD+ |
| 6 | curl | fhir.loinc.org `CodeSystem/$lookup` | HTTP 302 | LOINC FHIR server needs an account (readiness: auth) |
| 7 | Tavily CLI `search --json` (via wrapper `bin/tv.py`) | discovery: FDA glucose warning, LDT rule status, vendor pages, wearable docs, WHOOP changelog, Jinfiniti, InsideTracker, CLIA databases | URLs for primaries | On Windows `tvly` emitted cp1252 bytes → JSON decode errors; intermittent Python traceback with empty stdout; wrapper retries ×3 and decodes cp1252 |
| 8 | curl | Federal Register API `documents/2025-18239.json` + full text | JSON (title, dates, abstract, citation) + raw text | agent-ready (readiness 3) |
| 9 | Firecrawl CLI | FDA safety communication (smartwatch glucose) | clean markdown | page includes feedback-form noise |
| 10 | Firecrawl CLI | NGSP interf.asp, certified.asp, docs/methods.pdf | interference table; certified-methods PDF parsed to markdown tables (91 KB) | PDF table headers repeated per page; parse acceptable |
| 11 | curl | openFDA device/510k (Stelo), device/recall (FreeStyle Libre 3), device/event count (Stelo) | 4 clearances; 6 recalls; event-type counts (2,611 reports, last updated 2026-09-29) | no API key needed at this volume; recall response for limit=3 was 7.3 MB; a `date_received:[A TO B]` range in the event search returned non-JSON (syntax) |
| 12 | PubMed MCP `convert_article_ids`, `get_article_metadata`, `search_articles`, `get_full_text_article` | PMIDs → PMCIDs/DOIs for 7 papers; metadata for BAC papers, GrimAge2, Martens, DunedinPACE; full text of PMC9586209 | ok | natural-language PubMed queries over-expanded and returned 0 hits; field-tagged queries worked |
| 13 | curl Europe PMC REST `fullTextXML` | PMC8853656 (DunedinPACE), PMC5876407 (NR trial), PMC9792204 (GrimAge2), PMC9586209 | XML for three; PMC9586209 returned 150 bytes (no OA XML) | fallback to PubMed MCP full text for PMC9586209 |
| 14 | Firecrawl CLI | TruDiagnostic TruAge page, Elysium Index science page, GlycanAge FAQ, Function Health home, InsideTracker InnerAge blog, Jinfiniti NAD test page | clean markdown | Elysium capture includes a "shop.app is blocked" iframe artifact |
| 15 | curl + `pdftotext -layout` | TruDiagnostic sample report PDF (24 pages per pdfinfo; corrected from "8 pages" in the adversarial-review pass), Labcorp sample report PDF | text | pdftotext output is Latin-1 (decode accordingly) |
| 16 | Firecrawl CLI | Oura blog (OSSA 2.0), Oura support CVA, WHOOP developer API, WHOOP What's new 2026, WHOOP locker HR article, WHOOP community firmware thread, the5krunner (secondary), Dexcom API v3 overview | clean markdown | Oura blog capture dominated by language/nav lists before content |
| 17 | curl | Oura `cloud.ouraring.com/v2/docs` → discovered `openapi-1.41.json`; fetched OpenAPI | 75 schemas, field descriptions | agent-ready (readiness 3) once the versioned file name is discovered |
| 18 | curl | Apple developer doc JSON `…/heartratevariabilitysdnn.json` | abstract, discussion, platforms | the HTML doc page is JS-rendered; the `tutorials/data/documentation/*.json` endpoint is agent-ready |
| 19 | curl | ClinicalTrials.gov v2 `studies/NCT02921659`, `studies/NCT07220473`, `studies?query.outc=DunedinPACE&countTotal=true` | outcomes modules; 9 studies | `query.outcome` is not a valid parameter (non-JSON error); `query.outc` works |
| 20 | curl (browser UA) | FDA CLIA database `cfCLIA/search.cfm` and a GET to `results.cfm` | form fields only; results page chrome without rows | CLIA DB is form-POST only, no API (readiness 1) |
| 21 | Firecrawl CLI, then curl | NCBI Bookshelf NBK338448 (FDA-NIH BEST glossary) | reCAPTCHA page for both | blocked (readiness 0 for automation); not needed for D4 core |
| 22 | Python (`bin/q.py`) | exact-substring verification of every fixture quote with offsets | all quotes found after replacing two multi-line quotes | — |
| 23 | `sha256sum` | all raw captures | `SHA256SUMS.txt` | — |

Not used this stage: Firecrawl research-paper index, bioRxiv MCP, ClinicalTrials MCP (the v2 API was used directly), ICD-10, NPI, Exa, browser fallback (never needed).

## Fixtures stage (A3, 2026-10-08, 17:39–18:05 -04:00)

Fresh captures in run scratch `ft\D4\refetch\` (re-fetch of every fixture source plus 4 new pages). Generator, re-selector and intent validator are copied to `_notes/fixture-tooling/` (run from the scratch dir; see the header of `gen.py`).

| # | tool / access | what it fetched | result | problems / readiness finding |
| --- | --- | --- | --- | --- |
| 24 | curl | Europe PMC fullTextXML PMC8853656, PMC5876407 | byte-identical to research captures (sha256 dd24c218…, dd620181…) | derived-text rule reconstructed and confirmed byte-exact: `re.sub(r'\s+',' ', html.unescape(re.sub(r'<[^>]+>',' ', xml)))` (no strip) |
| 25 | curl | CT.gov v2 NCT02921659 | without `fields=` 6,946 B (different digest); with `fields=protocolSection.identificationModule,protocolSection.outcomesModule` byte-identical (b723914e…) | the request URL (incl. `fields`) is part of the snapshot identity |
| 26 | curl | Oura OpenAPI 1.41, Apple HKQuantityTypeIdentifier JSON, TruDiagnostic sample PDF, Labcorp sample PDF | all byte-identical | — |
| 27 | curl | openFDA `device/recall` original query (`product_description:"FreeStyle Libre 3"`, limit 3) and `res_event_number:98049` | original byte-identical (7.26 MB, meta.last_updated 2026-10-05); 98049 query: 4 products, 8.6 MB | payload size dominated by openfda.registration_number arrays; UDI-DI only in free text |
| 28 | curl | NCBI BioC JSON `pmcoa.cgi/BioC_json/PMC9586209/unicode` | 137,853 B (0d2ed3c4…); all 4 Higgins-Chen quotes found in passage 4 and 14 | replaces the PubMed MCP response as the hashable snapshot (MCP output is not byte-capturable); BioC has no publication day |
| 29 | Firecrawl CLI `scrape --only-main-content --max-age 0` | Labcorp 001453, Quest 496 (`--wait-for 3000`), LOINC 4548-4, NGSP interf + methods.pdf, FDA safety communication | all 6 byte-identical to research captures | Quest LOINC/performing lab still gated |
| 30 | Firecrawl CLI (same) | TruDiagnostic TruAge, Elysium Index, Jinfiniti NAD test, WHOOP 2026 changelog, WHOOP API, WHOOP community thread, InsideTracker InnerAge blog | 3 identical; 4 changed bytes (TruAge a65fa433…, Jinfiniti 405e28c0…, WHOOP forum 783ada6e…, InsideTracker blog f11a9ed4…) | every fixture quote still present (same offsets for the changed pages); fixtures cite the fresh digests |
| 31 | `pdftotext -layout` | TruDiagnostic and Labcorp sample PDFs | text sha256 identical to research (f9859cb6…, 6158f955…) | page = form-feed count + 1 (retest quote on page 10) |
| 32 | Python `bin/derive2.py` | derived texts of the two Europe PMC XMLs | identical to research text digests | — |
| 33 | Tavily CLI via `bin/tv.py` | "InsideTracker InnerAge test biomarkers included…" | found store.insidetracker.com/products/innerage, /ultimate | first call failed: the wrapper's first argument is the query, not the sub-command (usage error, not an API error) |
| 34 | Firecrawl CLI `--wait-for 3000` | store.insidetracker.com/products/innerage | $249 price, "analyzes 17 biomarkers for men and 13 for women", retest 3–6 months | Shopify Liquid errors in the page text; no component list |
| 35 | Firecrawl CLI `--wait-for 3000` | store.insidetracker.com/products/ultimate | plan description | **biomarker list only as an image** ("BM List") → INCLUDES_TEST cannot be populated from text (readiness 1, OCR needed) |
| 36 | Firecrawl CLI | Labcorp 005009 (requested `…/complete-blood-count-cbc-with-differential-platelet`) | site canonicalized to `…-reflex-to-peripheral-smear-review`; LOINC map with 24 component rows (order LOINC 57021-8) | the panel's composition is the LOINC map table (agent-ready as text) |
| 37 | Python `bin/kwic.py` | context search in captures (DunedinPoAm successor statement, ICC context, NAAD marker sentence, ref 34 LC-MS title) | quotes for new locators | — |
| 38 | Python `bin/gen.py` (new) | 7 fixture specs → source.md, locators.yaml, assertions.yaml, intent.json, questions.md | 122 locators, 91 assertions, 11 assessments; every quote exact-substring verified on the fresh capture, offsets/prefix/suffix/page/JSON pointer/quoteHash computed | first run of fixture 1 had upper-case locator refs → intent validation failed (see #40) |
| 39 | Python `bin/reselect.py` (new) | independent verifier: opens each snapshot by sha256, re-derives text by the recorded rule, re-selects by offsets or JSON pointer | 122/122 locators re-select to the exact quote and quoteHash | — |
| 40 | node `bin/validate-intents.mjs` (zod `IngestionIntent` from packages/contracts/dist) | 7 intent.json | 7/7 valid after fixing refs | locator `ref` must match `^[a-z0-9][a-z0-9._-]{0,63}$`; v1 lacks assertionKind/claimType, assessments, structural-edge asserter, derivationRule |
| 41 | `node scripts/packet-check.mjs D4` | packet | ok: true (7 node types, 13 rel types, 17 pairs, 34 questions, 7 fixtures) | — |
| 42 | PubMed MCP | — | not re-called in this stage (BioC used as snapshot instead) | — |
| 43 | sibling worktrees (read only) | A1 K kernel SDL (SelectorKind, Assessment, HAS_LOCATOR, HAS_EVIDENCE), A8 D9 Chunk (COVERS_LOCATOR, MENTIONS), A2 D1 / A6 D6–D7 uid tokens, D2 (this worktree) Reactome R-HSA-196807 and AFFECTS_MECHANISM | names aligned in fixtures | no sibling fixture assertions existed yet to copy a format from (D13 stubs only) |
| 44 | not used | bioRxiv, ICD-10, NPI, Exa, Firecrawl research index MCPs; browser fallback | — | not needed for D4 fixtures; browser never used |

## Adversarial-review pass (A3, 2026-10-08, ~21:45-22:30 EDT)

| # | tool / access | what it fetched | result | problems / readiness finding |
| --- | --- | --- | --- | --- |
| 45 | curl 8.2.1 (no auth) | https://api.prod.whoop.com/developer/doc/openapi.json | 77,417 bytes, sha256 b40986e6... (21:55 EDT); an earlier fetch the same evening and the reviewer's both gave d9c6147d... (same size, same JSON value, different property order). /components/schemas/RecoveryScore/properties/hrv_rmssd_milli/description states RMSSD in milliseconds | not byte-stable; JSON_POINTER is the stable reference. Missed in the research stage (the rendered docs page shows field names only) |
| 46 | local re-reads of fixture captures (sha256 identical to the reviewers') | Labcorp sample PDF text (lab block "01 $$ Testmaster Testing", "Dir: Report Testing, PhD", dates 08/13/2018; footer "1995-2018 Laboratory Corporation of America Holdings"), Labcorp 001453 footnote 1 (Tina Quant Gen.3 package insert, 2017-06), NGSP methods (Gen. 3 and Gen. IV cobas c513), TruAge sample PDF (24 pages; "*Based on the last 2-3 months" on page 10), BioC PMC9586209 (0 occurrences of "Dunedin"), WHOOP 2026 changelog (no model named on Feb 25 / Jul 6), WHOOP forum (first post "on May 20, 2025"), Oura OpenAPI 1.41 ("Oura Sleep Staging Algorithms.") | every reviewer quote and count confirmed | the5krunner (secondary, S43) captions an image "WHOOP 5.0 and MG wearables" for the February update; not used as evidence |
| 47 | Python gen.py (+ per-locator prefixChars/suffixChars), reselect.py, validate-intents.mjs | 7 fixture specs regenerated | 132/132 locators re-select (10 new); 7/7 intents valid; no forum handle in any stored prefix/suffix | intent v1 has no OCCURRENCE_OF field (11 #25) |
