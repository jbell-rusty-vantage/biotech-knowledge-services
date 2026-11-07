# K — tool log (research stage, Wave 1, 2026-10-08)

Every tool used during the K research stage, what it fetched, and what broke. Feeds `08-sources-and-tools.md` and the D11 action-space registry. Raw captures: `C:\Users\Pinda\AppData\Local\Temp\claude\C--Users-Pinda-Proyectos-Biotech\d38640f3-1d90-4042-9623-ff67cb1b7809\scratchpad\ft\K\raw\`, digests in `..\MANIFEST.sha256` (`sha256sum *`). Keys were loaded per key (`grep '^KEY=' .env`) by `scratch\ft\K\env.sh`, never printed (see problem P1).

## Summary table

| # | tool | access path | target | result | readiness finding |
| ---: | --- | --- | --- | --- | --- |
| 1 | Tavily CLI `tvly extract --extract-depth advanced --format markdown --json -o` | CLI v0.1.5, authenticated | W3C PROV-O; W3C Web Annotation Data Model; nanopub.net guidelines; OpenLineage object model; schema.org ClaimReview; Wikidata Help:Sources, Help:Ranking; Crossref Crossmark docs | all 8 ok (8.8–148 KB markdown) | W3C/schema.org/Wikidata/OpenLineage docs are agent-ready (3) as markdown; selectors = heading + paragraph |
| 2 | Tavily CLI `tvly extract` (batch 2) | CLI | XTDB key concepts; Datomic filters; SEPIO-ontology GitHub page; Biolink KnowledgeLevelEnum, AgentTypeEnum; Crossref blog (Retraction Watch acquisition); COPE retraction guidelines; OpenLineage parent run facet; ECO home; Bioregistry home | all 10 ok | GitHub repo pages extract as navigation chrome (README body missing) — use `raw.githubusercontent.com` instead (row 13) |
| 3 | Tavily CLI `tvly extract` | CLI | sepio-framework.github.io/sepio-linkml; scite.ai blog "what are smart citations"; help.scite.ai citation classification | SEPIO-linkml ok (21 KB); **scite blog URL 404** (page moved); **help.scite.ai "Failed to fetch url"** | scite's method pages are not stable; the QSS paper (row 11) is the citable primary |
| 4 | Tavily CLI `tvly extract` | CLI | science.feedback.org/process/ (verdict scale); a guessed `/process/verdicts-claim-reviews/` | process page ok (18 KB); guessed URL 404 | Science Feedback verdict definitions agent-ready (3) |
| 5 | Tavily CLI `tvly extract` | CLI | Google Search Central "Fact check (ClaimReview) structured data" | ok (18 KB) | agent-ready (3) |
| 6 | Tavily CLI `tvly extract` | CLI | longevinex.com NMN+resveratrol blog; doublewoodsupplements bundle page; activemotif.com catalog 14022 (resveratrol); megaresveratrol.net sirtuins blog | doublewood, Active Motif, MegaResveratrol ok; **longevinex returned no result** (silently absent from `results`, no `failed_results` entry) | silent drop is a Tavily behaviour to check for: compare requested vs returned URLs |
| 7 | Tavily CLI `tvly search --json` | CLI | ClaimReview / fact-check discovery; resveratrol "activates SIRT1" occurrences | ok; found STAT/WSJ coverage of a disputed longevity claim, FTC 2020 anti-aging action, vendor pages | discovery only; `site:` with two hosts OR'd returned one hit |
| 8 | Firecrawl MCP `firecrawl_search` (`sources: [web]`) | MCP | `site:science.feedback.org/review supplement` | ok, 10 claim-review URLs (2 credits) | good site-scoped discovery |
| 9 | curl (browser UA) | public HTTP | 2 Science Feedback review pages; Active Motif and MegaResveratrol raw HTML | 200; raw bytes kept for digests | ClaimReview JSON-LD embedded in `<script type="application/ld+json">` (agent-ready 2: structured but dirty, see 01 §4) |
| 10 | NCBI E-utilities `esearch` (by `[doi]`) and `efetch db=pubmed retmode=xml` | curl, no key | DOIs → PMIDs 29039533, 40613201; PMIDs 12939617, 15684413, 20061378, 23471411, 26261718 | ok | agent-ready (3): `PublicationType` "Retracted Publication" / "Retraction Notice", `CommentsCorrections RefType="RetractionIn"/"RetractionOf"`, `DateRevised` |
| 11 | PubMed MCP `search_articles` | MCP (claude.ai PubMed) | resveratrol–SIRT1 claim set; Hubbard 2013; micropublications paper | ok: PMIDs 20061378, 15684413, 14605207, 12939617, 23471411, 26261718 | discovery agent-ready; metadata via E-utilities is richer (CommentsCorrections) |
| 12 | NCBI `efetch db=pmc` | curl | PMC2832984 (Pacholec 2010, JBC); PMC3799917 (Hubbard 2013, NIH author manuscript) | PMC3799917 ok (51,695 bytes JATS with `<body>` paragraphs); **PMC2832984 returns an 11 KB stub: "The publisher of this article does not allow downloading of the full text in XML form."** | free-to-read ≠ machine-readable: PMC full text is per-publisher; abstract is the only locator-grade text for JBC 2010 |
| 13 | Europe PMC REST `PMC2832984/fullTextXML` | curl | Pacholec full text | **HTTP 500** `{"status":500,"error":"Internal Server Error"}` (not in OA subset) | same as D10 finding #4 |
| 14 | Crossref REST `api.crossref.org/v1/works` (`query.bibliographic` + `filter=update-type:retraction`; `/works/{doi}`) | curl with polite UA (mailto) | resveratrol/SIRT1 retractions (170 results); 10.3892/mmr.2017.7773 and its notice 10.3892/mmr.2025.13603 | ok | agent-ready (3): `updated-by` / `update-to` with `type`, `source` (`retraction-watch` or `publisher`), `record-id`, `updated.date-time`; **no abstract** for either record |
| 15 | OpenAlex `api.openalex.org/works/doi:` | curl | scite QSS paper 10.1162/qss_a_00146 | ok (abstract as inverted index) | agent-ready (3) |
| 16 | ClinicalTrials.gov v2 `GET /api/v2/studies/NCT04488601?fields=…` | curl | PEARL rapamycin trial status module | ok (current version only) | — |
| 17 | ClinicalTrials.gov internal `GET /api/int/studies/NCT04488601/history` | curl | record history | **403 Forbidden** (134-byte HTML) | confirms A4/D3, A5/D5, A7/D13 finding: registry version history readiness 0; BellLabs must snapshot versions itself |
| 18 | Wikidata `w/api.php?action=query&list=search&srsearch=haswbstatement:P652=…` | curl, polite UA | UNII Q369O8926L → Q407329 | ok | agent-ready (3): identifier → item in one call |
| 19 | Wikidata `Special:EntityData/Q407329.json` | curl | resveratrol item (268 KB, lastrevid 2497216568, modified 2026-05-25T10:22:48Z) | ok | statements with ranks, qualifiers, references (`P248` stated in, `P813` retrieved, `P854` reference URL) |
| 20 | Wikidata `action=query&prop=revisions` | curl | last 8 revisions of Q407329 | ok | transaction-time history with user, comment, sha1 per revision: agent-ready (3) |
| 21 | Wikidata `action=wbgetentities&props=labels` | curl | labels for Q-ids and P-ids | ok | — |
| 22 | Nanopub registry `registry.knowledgepixels.com` (`/`, `/nanopubs`, `/np/{id}.trig`) | curl | registry status (93,615 nanopubs, 732 agents); two nanopubs in TriG | ok | agent-ready (3): signed, trusty-URI, TriG; retraction is a nanopub of type `npx:retracts` |
| 23 | Bioregistry `bioregistry.io/api/registry/{prefix}` | curl | `unii`, `pubchem.compound`, `clinicaltrials` | ok (JSON: pattern, uri_format, example, synonyms, mappings incl. `wikidata.property`, `miriam`, `n2t`) | agent-ready (3): the cross-registry prefix map the K scheme register should cite |
| 24 | raw.githubusercontent.com | curl | SEPIO-ontology README.md | ok (4,343 bytes) | use raw files, not repo HTML |
| 25 | local files (Read/grep) | filesystem | `ai-engineer-knowledge-services` verification contracts (`model.ts`, `selectors.ts`, `claims.ts`, `adjudication.ts`) and `docs/verification/README.md`; ADR 0004; `mission-control-general/general-mission-control/expansion/KNOWLEDGE-SERVICES.md`; `MISSION_CONTROL_SPEC.md` §4.4; this repo's `examples/ingestion-intent.example.json` and `packages/contracts/src/ingest.ts` (receipt) | ok | internal contracts are the primary source for verification.v1 and Mission Control |

## Problems and workarounds

- **P1 — `.env` is not shell-sourceable.** `set -a; . ./.env` (the recipe some sibling packets use) fails on several lines and the shell's error messages echo fragments of the offending lines to the console. Nothing was written to any file, but the recipe is unsafe. Workaround used for the rest of the stage: `scratch\ft\K\env.sh` exports only `TAVILY_API_KEY`, `FIRECRAWL_API_KEY`, `EXA_API_KEY`, `EDGAR_IDENTITY` via `grep -m1 '^KEY=' .env | cut -d= -f2-`. Recommendation for the coordinator: retire the `. ./.env` recipe (readiness finding for D11 and for the team protocol).
- **P2 — background `find /`** (looking for the Mission Control annex) hit the 120 s timeout; resolved by listing known directories instead.
- **P3 — Tavily silent drop** (row 6): a URL can be missing from both `results` and `failed_results`.
- Tools **not** used: Exa, bioRxiv, ICD-10, NPI, ClinicalTrials MCP, Firecrawl CLI scrape/crawl, Firecrawl research index, browser fallback (no page required it). Repo `.mcp.json` servers (pubmed, pubchem, clinicaltrialsgov, edgartools) are not loaded in this coordinator session; public HTTP APIs were used instead (readiness finding, same as the other packets).

## Readiness findings for D11 (kernel-relevant)

1. **Retraction and correction status is agent-ready through two independent channels**: Crossref `updated-by`/`update-to` (with `source: retraction-watch` vs `publisher`, `record-id`, date) and PubMed `CommentsCorrections` + `PublicationType`. They can disagree in date and existence (Crossref showed both a Retraction Watch and a publisher entry for several notices). A retraction watcher is buildable today with no scraping.
2. **Registry version history is not** (ClinicalTrials.gov `/api/int` 403). Bitemporal "what did the registry say on date D" requires BellLabs' own periodic snapshots (Wave 0 design already assumes snapshots are ours).
3. **Free full text is per-publisher**: PMC serves an NIH author manuscript as JATS (locator-grade, paragraph structure) but refuses XML for a JBC 2010 article that is free to read on the web. The abstract in PubMed XML is the guaranteed locator-grade text.
4. **ClaimReview is structured but dirty**: real Science Feedback JSON-LD carries `"headline": "TBD"`, `"url": "TBD"`, `itemReviewed` typed `CreativeWork` (Google's spec says `Claim`), and mixed date formats (`"05-01-2024"`, `"15 Dec. 2023"`). Treat it as a capture to verify, not as a trusted feed.
5. **Wikidata and the nanopub registry expose transaction-time history natively** (revisions with sha1; signed, immutable nanopubs with explicit retraction records). Wikidata's revision log also shows one interested-party edit set added (2026-04-24 11:49–12:10Z) and removed by another editor about 33 hours later (2026-04-25 20:30–20:49Z; one observed instance, 01 §5; corrected in the adversarial review from "within a day") — authority must be per statement, not per site.
6. **Bioregistry** publishes, per prefix, the regex, the resolver URI format, and the mapping to Wikidata property, MIRIAM and N2T: it is the natural upstream for the kernel identifier-scheme register's `pattern` / `resolver` columns and for D11's bridge table.

## Fixtures stage (Wave 2, part 2, A1, 2026-10-08)

Captures in scratch `ft\K\fixtures\fresh\` (start of re-fetch `2026-10-08T22:09:18Z`, file `ft\K\fixtures\FRESH_AT`); generators in `ft\K\fixtures\tools\` (`gen_locators_k.py`, `finalize_k.py`, `fill_sources.py`, `validate_intents_k.mjs`). Keys loaded per key by `ft\K\env.sh`, never printed.

| # | tool | access path | target | result | readiness finding |
| ---: | --- | --- | --- | --- | --- |
| F1 | NCBI E-utilities `efetch db=pubmed retmode=xml` | curl, no key, 0.4 s spacing | PMIDs 12939617, 15684413, 20061378, 23471411, 29039533, 40613201 | 200; all six byte-identical to the research-stage captures | agent-ready (3); byte-stable |
| F2 | NCBI E-utilities `efetch db=pmc` | curl | PMC3799917 (JATS) | 200; byte-identical (51,695 bytes) | agent-ready (3) |
| F3 | Crossref REST `/v1/works/{doi}` | curl, User-Agent | 10.3892/mmr.2017.7773, 10.3892/mmr.2025.13603 | 200; byte-identical | agent-ready (3) |
| F4 | Wikidata `Special:EntityData/Q407329.json`; `prop=revisions&rvlimit=8` | curl | resveratrol item and revisions | 200; both byte-identical | agent-ready (3) |
| F5 | Wikidata `prop=revisions&revids=…` (6 pinned revisions) | curl | the 2026-04-24/25 edits | 200 (new capture, sha256:32db66fb…) | pin by revid for reproducibility |
| F6 | curl, browser User-Agent | raw HTML | Active Motif 14022, MegaResveratrol blog | 200; same byte length as research captures, different sha256: only `_csrf_token` (Active Motif) and Cloudflare `__CF$cv$params` (MegaResveratrol) differ | dynamic pages: raw digest unstable, content stable → SILENT_CONTENT_CHANGE + exact re-anchor |
| F7 | curl, browser User-Agent | raw HTML | `pubmed.ncbi.nlm.nih.gov/29039533/` | 203, 5,590-byte cookie/JavaScript challenge page | PubMed web UI not capturable (0) |
| F8 | Firecrawl CLI 1.23.1 `scrape --format markdown,rawHtml --max-age 0` | CLI | PubMed 29039533 page | **failed**: "All scraping engines failed … fire-engine;chrome-cdp;stealth …" (scrape id 01a11d91-8c22-77ac-9952-cc451c40ccad) | same block |
| F9 | Tavily CLI `tvly extract` | CLI | PubMed 29039533 page | **failed**: `failed_results` "Error fetching content" | same block |
| F10 | Firecrawl CLI `scrape --format markdown --only-main-content --max-age 0` | CLI | Active Motif 14022 | ok (157,499 bytes markdown) → canonical projection hash of snap-am-r2 | projection usable beside the raw digest |
| F11 | Internet Archive availability API | curl | PubMed 29039533 page @2024-01-01, @2026-09-01 | 2024: closest 20240505132007; 2026: empty | — |
| F12 | Internet Archive CDX API | curl | PubMed page, Spandidos article page, doi.org link | **"Temporarily Offline"** HTML for PubMed and doi.org; Spandidos: 13 captures 2018-06-02 … 2024-11-24 | intermittent (2) |
| F13 | Internet Archive `id_` raw replay | curl -L | PubMed page @20240505132007; Spandidos page @20241124224426 | PubMed archived page fetched (pre-retraction, 1 occurrence of the abstract's last sentence); Spandidos: 302 → **redirected to the 20240816062445 capture** (149,484 bytes, no "retract") | the archive picks the capture; record the served timestamp as observedAt |
| F14 | curl, browser User-Agent | raw HTML | `www.spandidos-publications.com/10.3892/mmr.2017.7773` (live) | 200, 215,575 bytes; "Retraction in:" link to /10.3892/mmr.2025.13603; `<title>` appends "Retraction in /10.3892/mmr.2025.13603"; abstract no longer repeated in meta tags | publisher page is capturable (2) |
| F15 | local files | filesystem | verification.v1 benchmark `gl-interested-comparison-{source,mutated}.json`, `dataset.json` labels | read; evidence `rights`: "restricted internal preparation; not approved for provider upload or public redistribution" → excerpt not quoted | per-fragment rights (11-open-questions 15) |
| F16 | `@bks/contracts` `IngestionIntent.safeParse` | node (worktree dist) | 7 fixture intents | all valid | v1 gaps listed in each intent's `notes` |

### Problems and workarounds (fixtures stage)

- **P4 — snapshot order.** The archive capture and the live capture were both retrieved at 2026-10-08T22:09:18Z; ordering by `retrievedAt` cannot tell which is older. Fixed in 03 (Q-K-10, Q-K-17) with `coalesce(observedAt, retrievedAt)`.
- **P5 — uniqueness of TEXT_QUOTE.** The archived publisher page repeats the abstract three times (twitter:description, og:description, body); the generator grows prefix/suffix until prefix + exact + suffix is unique (512 characters needed for one quote).
- **P6 — Wikidata offsets.** The research-stage byte offset of the UNII value pointed at a copy inside another statement's reference; the generator anchors JSON_POINTER offsets on the statement's `mainsnak`.
- **P7 — typed digests.** A first draft of one `source.md` carried hand-typed digest tails; replaced by computed values, and `fill_sources.py` now checks every sha256 in every `source.md` against the captures (0 unknown).

## Adversarial review (A1, 2026-10-08 local / 2026-10-09 UTC)

Captures in scratch `ft\K\adv\fetch\` (first pass, 01:46–01:47Z) and `ft\K\adv\fetch2\` (01:53Z); fixture generators copied to `ft\K\adv\tools\` and re-run (they reproduced the committed fixtures byte for byte before any edit).

| # | tool | access path | target | result | readiness finding |
| ---: | --- | --- | --- | --- | --- |
| A1 | NCBI E-utilities `efetch db=pubmed retmode=xml` | curl | PMIDs 12939617, 15684413, 23471411 | 200; byte-identical to the fixture captures (sha256 eefeb546…, 6cc06a1b…, 7dbca239…) | AuthorLists: 12939617 and 23471411 share three authors (Konrad T Howitz, Dudley W Lamming, David A Sinclair); Kaeberlein and Pacholec share none with any other |
| A2 | Knowledge Pixels registry `GET /` (JSON) | curl | registry status | 200: `trustStateCounter` 35, `nanopubCount` 93620, `agentCount` 732, `lastTrustStateUpdate` 2026-10-09T01:34:24Z; no retained-snapshot field | corrects 01 §1.3 |
| A3 | local read | filesystem | `ft\K\fixtures\fresh\wd-Q407329-revs-pinned.json` (sha256 32db66fb…) | additions 2026-04-24T11:49:22Z / 11:49:30Z / 12:10:28Z, removals 2026-04-25T20:30:45Z / 20:35:09Z / 20:49:47Z (about 33 h) | corrects 01 §5, §10 and readiness finding 5 |
| A4 | local read | filesystem | MegaResveratrol and Active Motif raw captures (R1 and R2) | MegaResveratrol: JSON-LD `datePublished` and `dateModified` 2026-09-23T11:55:49Z in both captures; Active Motif: none | corrects 01 §9.6 |
| A5 | curl, browser User-Agent | raw | `direct.mit.edu` QSS article page and PDF for 10.1162/qss_a_00146 | **blocked**: both returned a Cloudflare "Just a moment..." challenge page | publisher page needs a rendering scraper |
| A6 | Firecrawl CLI 1.23.1 `scrape --format markdown,links --json --max-age 0` | CLI | https://direct.mit.edu/qss/article/2/3/882/102990/scite-A-smart-citation-index-that-displays-the | 200; markdown projection sha256:951b9b9b6c776ac15ac3fcd67807f8b12732929898e9166eed5219a9cd25b695 contains both scite quotes once; links list the PDF (`/qss/article-pdf/2/3/882/1970740/qss_a_00146.pdf`) | Firecrawl gets through where curl is challenged (2) |
| A7 | Firecrawl CLI `scrape --format markdown --max-age 0` | CLI | FTC press release 2020-02-05 (ReJuvenation) | 200; markdown sha256:2f75a353e2a89c8d658016012f75f376cfc3c5fd5c7ed46138a70e75ed9a585e; title, date and the "sellers of a pill called ReJuvenation" sentence present | agent-ready for regulator press releases (3) |
| A8 | Europe PMC REST `search?query=EXT_ID:23471411 AND SRC:MED&resultType=core&format=json` | curl | Hubbard 2013 | 200 (10,906 bytes, sha256:079186f2…6716): PMCID PMC3799917, DOI, author string | search works; `fullTextXML` still unexercised for an OA article |
| A9 | aiengineer repository identity | git (local checkout) | `Overton77/ai-engineer-knowledge-services` | HEAD 28c4422228826c41f92dd837f3c5f0b561471b3b; benchmark case inputs tracked and clean, last changed in bb4892b1; sha256 unchanged (d678ff4a…, ed620b7d…) | internal snapshots now carry a repo URL pinned to the commit |
| A10 | `@bks/contracts` `IngestionIntent.safeParse` | node (worktree dist) | the 7 regenerated fixture intents | all valid | — |
