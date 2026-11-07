# D5 tool log

Every research tool used for packet D5: what it fetched, what broke. Feeds 08-sources-and-tools.md and the D11 action-space registry.

## 2026-10-08 — Wave 0 targets vocabulary (A5)

| tool | call | fetched | result / what broke |
| --- | --- | --- | --- |
| Firecrawl CLI v1.23.1 | `firecrawl scrape https://examine.com/categories/ --only-main-content` | Examine category index (26 categories) | ok; markdown with category links |
| Firecrawl CLI | `firecrawl scrape https://www.healthmeasures.net/explore-measurement-systems/promis/intro-to-promis` | PROMIS intro | ok; domain list not on this page → second scrape |
| Firecrawl CLI | `firecrawl scrape https://healthmeasures.net/promis-basics/promis-domains/` | PROMIS adult/pediatric core domain definitions | ok; framework diagram is an image only (domain list for "Additional Domains" not in text) |
| Firecrawl CLI | `firecrawl scrape https://support.ouraring.com/hc/en-us/articles/360025589793-Readiness-Score` | Oura Readiness Score help page | ok |
| Firecrawl CLI | `firecrawl scrape https://www.whoop.com/us/en/thelocker/how-does-whoop-recovery-work-101/` | WHOOP Recovery explainer | ok |
| Firecrawl CLI | `firecrawl scrape <who.int ICF page>`; `--format links` on ICF checklist page; PDF scrape of icfchecklist.pdf | WHO ICF page, ICF checklist PDF (body-function codes) | ok; PDF parsed to markdown tables with codes. Modernized ICF browser (icd.who.int) not tried (JS app) |
| Tavily CLI v0.1.5 | `tvly search "...PROMIS ... domains" --json` / `tvly search "WHO intrinsic capacity domains ..." --json` | search results | **broke**: on Windows `tvly --json` crashed with `UnicodeEncodeError: 'charmap' codec can't encode character '≥'` (cp1252 console); fixed by `PYTHONIOENCODING=utf-8`. The first PROMIS output file was written cp1252 and is not valid UTF-8 (unused). Readiness finding: set PYTHONIOENCODING in the team env |
| PubMed MCP (claude.ai) | `search_articles`, `get_article_metadata` PMID 29288712 | Dodd 2018 outcome taxonomy abstract, PMCID, DOI | ok; an exact-title search for the ICOPE paper returned 0 hits (query translation mangled "the community" into an author field) |
| NCBI PMC ID converter (curl) | `https://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/` | PMID/DOI for PMC8993034 | old URL returns 301; new endpoint `https://pmc.ncbi.nlm.nih.gov/tools/idconv/api/v1/articles/?ids=…&format=json&tool=…` works (warns without email) |

## 2026-10-08 — Wave 1 research stage (A5): ecosystem, questions, fixture candidates

Raw captures and hashes: scratch `ft/D5/raw/` and `ft/D5/sha256.txt` (session scratchpad). Quote verification script: `ft/D5/quotes.py` (every quote in fixture-candidates.md re-found by exact substring match).

| tool | call | fetched | result / what broke |
| --- | --- | --- | --- |
| curl → openFDA drug/label | `api.fda.gov/drug/label.json?search=openfda.generic_name:"sirolimus"` (limit 1, 25), `search=set_id:"5908cd1a-…"` | 22 sirolimus SPL labels; NDA021110 label v22 (2026-03-26) as JSON with LOINC-section fields (`boxed_warning`, `contraindications`, `drug_interactions`, `overdosage`, `use_in_specific_populations` …) | ok, no key needed (240 req/min, 1,000/day without key). Brand search `openfda.brand_name:"rapamune"` → 404 (brand not indexed under that name; Pfizer NDA now listed under Mylan). Sections are whole-text blobs: sub-section locators (7.3 Grapefruit Juice) need offset selectors |
| curl → openFDA drug/label | metformin `_exists_:boxed_warning` | ZITUVIMET label (interaction table "Clinical Impact / Intervention / Examples") | ok; first query with `brand_name:"glucophage"` → 404 |
| curl → openFDA food/event (CAERS) | `products.name_brand:"melatonin"` (limit 2) and `count=reactions.exact` | 661 reports; reaction term counts | ok; reaction terms are not case-normalized (`Diarrhoea` 48 vs `DIARRHOEA` 21) → normalization needed before any count |
| curl → openFDA drug/event (FAERS) | sirolimus `count=patient.reaction.reactionmeddrapt.exact` | top-10 MedDRA PTs (OFF LABEL USE 2055, DRUG INTERACTION 448 …) | ok; counts are report counts, not incidence |
| curl → DailyMed v2 | `/spls/5908cd1a-…/history.json` | SPL version history v1 (2014-01-17) … v22 (2026-03-26) | ok — agent-ready label edition history |
| curl → ODS API | `ods.od.nih.gov/api/index.aspx?resourcename=Magnesium…` | — | **broke**: HTTP 403 Cloudflare "Attention Required" for curl. Readiness finding: ODS API not reachable headless |
| Tavily CLI `tvly extract` | ODS Magnesium HP fact sheet | full fact sheet (105 kB markdown incl. UL table, interactions, "Updated: January 6, 2026", history link) | ok after setting `PYTHONUTF8=1` (same cp1252 crash as Wave 0 without it) |
| Tavily CLI `tvly extract` | hubermanlab.com Toolkit for Sleep | 25 kB markdown, dated "September 20, 2021" but edited in place | ok |
| curl → Wayback CDX + `id_` replay | `web.archive.org/cdx/search/cdx?url=…toolkit-for-sleep…&collapse=digest`; replay 20211016002820 | 83 distinct-digest captures since 2023-09 for the new URL; old URL `hubermanlab.com/toolkit-for-sleep/` captured from 2021-10-16; 2021 HTML | ok; CDX intermittently returns "Temporarily Offline" HTML (2 of 4 calls) → retry. Digest changes include template noise, so digest ≠ content edition |
| Tavily CLI `tvly extract` (batch of 6) | protocol.bryanjohnson.com, AgelessRx rapamycin, NCCIH St John's wort, Examine sleep, LiverTox NBK548536, Health Canada NHPID melatonin | 4 ok | LiverTox → "Error fetching content"; HC `atid=melatonin` → failed; Examine sleep page content is JS-rendered (headings only) |
| Firecrawl MCP `firecrawl_scrape` | examine.com/categories/ | category → condition/goal tree | ok (cache hit) |
| Firecrawl CLI `firecrawl scrape` | examine.com/categories/ (to file); LiverTox NBK548536 | Examine ok; LiverTox | **broke**: NCBI Bookshelf returns reCAPTCHA "Checking your browser" to Firecrawl and curl. Readiness finding: LiverTox full text not agent-reachable; workaround = PubMed record PMID 31643854 (abstract + revision date) via E-utilities |
| curl → NCBI E-utilities | efetch PMIDs 19433800, 24492839, 35653284, 40188830, 31643854; esearch pubmed/books | abstracts XML (DOI, PMCID), LiverTox book record | ok, no key (3 req/s) |
| PubMed MCP (claude.ai) | `get_article_metadata` for 19433800, 24492839, 35653284, 35797208, 40188830 | metadata incl. DOI, PMCID, MeSH, erratum link | ok |
| curl → ClinicalTrials.gov v2 | `/api/v2/studies/NCT04488601` | PEARL registry record (sponsor AgelessRx, arms, primary outcome) | ok; `/api/int/studies/NCT04488601/history` → 403 (internal endpoint; D3 owns version history) |
| curl → Health Canada NHPID | `webprod.hc-sc.gc.ca/nhpid-bdipsn/atReq?atid=melatonin.oral2&lang=eng` | melatonin (oral) monograph dated 2025-12-19: uses, doses by subpopulation, directions, cautions, contraindication, known adverse reactions | ok once the right `atid` was found via `tvly search`; `atid=melatonin` → 404 page with HTTP 200 (silent failure) |
| curl → eCFR versioner API | `/api/versioner/v1/full/2026-10-06/title-21.xml?part=101&section=101.93` | 21 CFR 101.93 (structure/function vs disease claims, disclaimer text) | first call 406: endpoint requires `Accept-Encoding` compression (`curl --compressed`); also needs a date ≤ `up_to_date_as_of` (titles.json) |
| curl → NLM MeSH lookup | `id.nlm.nih.gov/mesh/lookup/descriptor?label=…&match=exact` | descriptor ids for 13 goal labels (Sleep D012890, Muscle Strength D053580, Cognition D003071, Body Composition D001823, Longevity D008136, Healthy Aging D000073656, Affect D000339, Fatigue D005221, Sleep Quality D000089943, Recovery of Function D020127, Physical Endurance D010807, Mental Fatigue D005222, Sexual Health D000074384) | ok, no auth — candidate identifier scheme for Target |
| Tavily CLI `tvly search` (×8) | RxNav DDI status, CAERS, FAERS FAQ, DDInter, NatMed, CTCAE, HC monograph, rapamycin.news | primary URLs | ok |
| Tavily CLI `tvly extract` (×3 batches) | RxNav FAQ, openFDA food/event docs, FAERS public dashboard FAQ, NatMed Pro product page, NCI CTCAE page, DDInter 2.0, openFDA authentication, DailyMed web services, 2 rapamycin.news threads | text | ok |
| curl → Europe PMC REST + NCBI esummary (books) | `europepmc/webservices/rest/search?query=livertox ashwagandha`; `esummary db=books` | located LiverTox Ashwagandha as NBK548536 / PMID 31643854 | ok, no auth; Europe PMC returns the PubMed record only (no Bookshelf full text) |

## 2026-10-08 — fixtures stage (A5, Wave 2 part 2)

Fresh captures: scratch `ft/D5/fx/{sleep,siro,mg,antiox}/`; generators `ft/D5/gen/gen_*.py` (quotes located by exact match, offsets and hashes computed); verifier `ft/D5/gen/verify.py`; intent validator `ft/D5/gen/validate-intent.mjs` (zod `IngestionIntent` from `packages/contracts/dist`).

| tool | call | fetched | result / what broke |
| --- | --- | --- | --- |
| Tavily CLI `tvly extract` (PYTHONUTF8=1) | one batch of 5 URLs, `--json -o` | Huberman Toolkit for Sleep, Blueprint protocol, ODS magnesium HP fact sheet, AgelessRx rapamycin, rapamycin.news t/86 | ok, 0 failed; markdown differs in size from the research-stage captures (dynamic page furniture) → new digests; all fixture quotes re-found |
| Tavily CLI `tvly search` + `tvly extract` | "vitamin C vitamin E supplement athletes recovery …" → btsa.com/en/vitamin-e-sport-performance | manufacturer claim occurrence for the disconfirmation fixture | ok; source text contains U+0092 bytes (cp1252 apostrophes) → quotes chosen around them |
| curl → openFDA drug/label | `search=set_id:"5908cd1a-…"&limit=1` | sirolimus label v22 | ok; byte-identical to the research capture (sha256 ab1a2c27…51c2) |
| curl → DailyMed v2 history | `/spls/5908cd1a-…/history.json` | 21 versions | ok; byte-identical |
| curl → DailyMed archived SPL | `getFile.cfm?setid=…&type=zip&version=14` and `version=15` | SPL zips (XML + images) | ok (new tool use); v14 effectiveTime 20191204 has 0 "cannabidiol"; v15 effectiveTime 20220923 adds 5.21 / 7.5 cannabidiol; SPL author Greenstone LLC in both. Unzip keeps the publisher's member mtimes → retrieval time taken from the zip file |
| curl → Wayback `id_` replay | `web/20211016002820id_/https://hubermanlab.com/toolkit-for-sleep/` | 2021 edition HTML | first call without `-L` returned an empty body (HTTP 302); with `-L` served capture 20211018160634 (Memento-Datetime 2021-10-18T16:06:34Z), bytes identical to the research capture |
| curl → Wayback CDX | `cdx/search/cdx?url=hubermanlab.com/toolkit-for-sleep/…` ×3 with backoff | — | **broke**: "Internet Archive: Temporarily Offline" every time; edition change point stays unbounded |
| curl → Wayback replay of the new URL | `web/20230929061534id_/https://www.hubermanlab.com/newsletter/toolkit-for-sleep` | served 20231112003927 | 21.7 kB script shell with none of the page text (Webflow JS rendering) → unusable as an edition observation |
| curl → Discourse topic JSON | `https://www.rapamycin.news/t/86.json` | post 1 author handle, created_at 2021-10-22, updated_at 2023-03-07, version 20 | ok (new tool use; fills what the Tavily markdown lacks) |
| curl → NCBI E-utilities efetch | PMIDs 19433800, 24492839 | PubMed XML | ok; byte-identical to the research captures |
| node + `packages/contracts/dist` | `IngestionIntent.safeParse` on the 4 intent.json | — | all VALID; contract gaps recorded as OQ-D5-27 (no predicate-only assertion kind; no qualifiers/valueString/supersedesUid) |
| python | `-I` ignores PYTHONUTF8 → cp1252 print crash; fixed with `python -X utf8` | — | environment finding |
| Firecrawl | not used | — | team concurrency reserved; every page was reachable with Tavily or curl |

## 2026-10-08 — adversarial review (A5)

Re-fetches made to verify reviewer findings; raw files in scratch `review-a5/raw/` (not committed).

| tool | call | fetched | result |
| --- | --- | --- | --- |
| curl → Discourse topic JSON | `https://www.rapamycin.news/t/86.json` | post 1 metadata | username RapAdmin, `wiki: false`, post_type 1, version 20, created_at 2021-10-22T20:42:48.946Z, updated_at 2023-03-07T06:03:54.522Z, category_id 1, archetype regular, posts_count 273 → "wiki post" wording removed |
| curl → ODS fact sheet, default User-Agent | `https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/` | — | HTTP 403 (5,484 bytes) |
| curl → ODS fact sheet, browser User-Agent (`-A "Mozilla/5.0 … Chrome/129.0 …"`) | same URL | fact-sheet HTML | HTTP 200, 253,520 bytes (sha256 89359d8b…5069); contains Table 3 row "14&ndash;18 years" and "January 6, 2026" → ODS readiness 1 → 2; the API endpoint (`/api/index.aspx`, research stage) stays 403 |
| curl → Wayback, `-D -` headers only | `web/20211018160634id_/https://hubermanlab.com/toolkit-for-sleep/` | — | HTTP 200, Memento-Datetime Mon, 18 Oct 2021 16:06:34 GMT |
| curl → Wayback, `-D -` | `web/20211016002820id_/https://hubermanlab.com/toolkit-for-sleep/` | 2021-10-16 capture | today HTTP 200 with Memento-Datetime Sat, 16 Oct 2021 00:28:20 GMT (no redirect; the fixtures stage got a 302 to 20211018160634); decompressed body (`--compressed`) 85,287 bytes, sha256 65ec04d1…949a, carries the same Swanson and Thorne lines |
| python (local) | diff of the 2021 archive text vs the 2026 Tavily capture (scratch `ft/D5/fx/sleep/`) | — | confirmed lines absent in 2026: "50mg Apigenin (Swanson is the only source I know of; we have no affiliation to Swanson)", "Also, they do not manufacture Magnesium Threonate either. Magnesium Bisglycinate is a good replacement for Threonate.", "Thorne does not ship outside the USA."; the 2026 body is signed "Best wishes, Andrew" (2021: "Best wishes,<br>Andrew"), no byline |
| python (local) | Blueprint Pregnancy section in the stored capture (sha256 da7eb359…) | — | items 1.1–1.5, 3.1 (prenatal), 3.5 (omega-3), 4.1–4.5 (nutrition), 5.1–5.3 (exercise) exist and were not modeled → fixture completed (33 steps) |
| curl → RxNav FAQ (browser UA) | `https://lhncbc.nlm.nih.gov/RxNav/information/FAQs.html` | FAQ HTML | HTTP 200, 15,033 bytes; former DDI sources quoted verbatim; the string "ONC" does not occur → 01 wording corrected |
| code read + python (local) | `common.py` Snap.digest = sha256 of the stored file bytes; `verify.py` re-hashes every stored snapshot file | 6 Tavily snapshots (stored file = extractor `raw_content`) | every recorded contentHash matches its stored bytes; no normalization before hashing (normalization is applied only to quote and selector hashes) → basis relabeled EXTRACTED_TEXT_BYTES (OQ-D5-46). Not re-run through Tavily in this stage |
| pnpm print-schema | kernel, kernel + 7 stubs, kernel + stubs + D5 (scratch `review-a5/compile/`) | — | 345,273 / 380,828 / 509,817 bytes; 192 / 206 / 261 input types; printer "in 1s" each; wall 44–73 s (machine under load) |
| node `bks-schema map --sdl` | compile and kernel-stubs inputs | — | 25 / 20 / 193 vs 19 / 14 / 116 (node types / relationship types / expanded pairs) |
