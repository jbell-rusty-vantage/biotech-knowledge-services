# D8 — tool log (research stage, A7, 2026-10-08)

Every tool call that fetched something for this packet, what it fetched, and what broke. Feeds `08-sources-and-tools.md` and the D11 action-space registry. Raw captures live in scratch: `%TEMP%\claude\C--Users-Pinda-Proyectos-Biotech\d38640f3-1d90-4042-9623-ff67cb1b7809\scratchpad\ft\D8\raw\` (file names below). sha256 values are in `fixture-candidates.md` and in the capture table at the end of this file.

## Environment findings (readiness, apply to every source)

| # | finding | impact | workaround |
| --- | --- | --- | --- |
| E1 | `tvly … --json` to stdout crashes on Windows: `UnicodeEncodeError: 'charmap' codec can't encode character '\u03b2'` (cp1252 console). | Any Tavily result with non-Latin-1 characters (β-NMN, µg, ≤) kills the call. | `PYTHONIOENCODING=utf-8` and `-o <file>`; read files with `encoding='utf-8'`. |
| E2 | Python on Git Bash does not resolve `/c/...` paths. | Scripts that read captures fail. | Use `C:/...` paths. |
| E3 | `pdftotext -layout` misaligns table rows on multi-column PDFs (Niagen 2025 NR report: the Basis row reads `250  ND` in layout mode and `250 261` in raw mode). | A locator built from layout text would cite the wrong value. **Verification risk.** | Extract tables with `-raw` and cross-check, or use a layout-aware parser; record the extraction mode in the locator. |
| E4 | Comparator glyphs (`≤`, `µ`, `±`) come out as `�` from `pdftotext` on two COAs. | Specification comparators are lost: "≤ 0.5 µg" becomes "� 0.5 �g". | Keep the PDF bytes as the snapshot; re-read the glyph from the PDF text layer with a Unicode-aware extractor before asserting a comparator. |
| E5 | Firecrawl PDF parsing (regulations.gov FDA-2023-P-0872-2754) produced the date "September 29, 2029" for a letter dated 2025 (the docket, the NPA page and the signature context say 2025). | OCR/parse errors in dates on regulator letters. | Never take a date from parsed PDF text alone; cross-check with the docket metadata or a second capture. |

## Calls

| step | tool | target | result | notes |
| --- | --- | --- | --- | --- |
| 1 | `tvly --status`, `firecrawl --status` | — | both authenticated | Firecrawl 0/5 jobs at start. |
| 2 | curl → openFDA food enforcement API | `api.fda.gov/food/enforcement.json` searches (dietary supplement + lead/undeclared/sildenafil; NMN/nicotinamide; resveratrol/spermidine/urolithin/fisetin/quercetin; creatine; melatonin) | 200, JSON | Agent-ready. No NMN/NR recalls found (`NOT_FOUND`). Lot codes only in free text `code_info`. `openfda` block empty for food records (no UNII/brand harmonization). |
| 3 | curl → openFDA | `recall_number:"F-0729-2025"`, `"H-0594-2025"`, `"F-0728-2022"` | 200 | Captured as `openfda-*.json`. |
| 4 | tvly search | "FDA NMN … citizen petition response 2025" | 200 (after E1 fix) | Found NPA pages, trade press; secondary only, used to find the docket id FDA-2023-P-0872. |
| 5 | tvly extract | `npanational.org/nicotinamide-mononucleotide-nmn` | 200 | Advocate (interested party) page; used only to locate the primary letter. |
| 6 | curl | `downloads.regulations.gov/FDA-2023-P-0872-2754/attachment_1.pdf` | **403** (HTML) | regulations.gov blocks plain curl. |
| 7 | firecrawl scrape (CLI) | same PDF | 200, markdown 89,751 bytes | Works; E5 date error. Saved `fda-nmn-cp-response.md`. |
| 8 | curl | FDA GRAS Notice Inventory `hfpappexternal.fda.gov/scripts/fdcc/index.cfm?set=GRASNotices&id=635`, `id=791`, `id=1044` | 200 HTML | Stable per-notice HTML; fields listed in 01-ecosystem. GRN 635 letter link points to an archive-it wayback PDF that returns HTML to curl (not captured). |
| 9 | curl | `fda.gov/media/187487/download` (GRN 791 response letter) | 200 PDF 139,264 B | fda.gov media downloads work with a browser UA. `pdftotext` warns "Invalid entry in bfchar block". |
| 10 | tvly search (include fda.gov) | warning letters: NAD+ claims; CGMP part 111; BPC-157 | 200 | Found WL index and letters. |
| 11 | curl | three warning letters (Imu-Tek 724610, GenoGenix 718739, LXR Biotech 714568) | 200 HTML | Agent-ready as HTML; no API. Letter body has stable headings (Delivery Method, Product, Recipient, Issuing Office, CMS #). |
| 12 | MCP firecrawl_search | NSF Certified for Sport Basis | 200 | Found `nsfsport.com/certified-products/listing-detail.php?id=1451522` and `info.nsf.org/certified/dietary/Listings.asp`. |
| 13 | curl | nsfsport listing 1451522 | 200 | Lot numbers listed on the page. |
| 14 | curl | `info.nsf.org/Certified/Sport/Listings.asp?TradeName=Basis&Standard=306` | **404** | Guessed query form wrong. |
| 15 | curl | `info.nsf.org/Certified/Dietary/Listings.asp?TradeName=nicotinamide&` | 200 | NSF/ANSI 173 listing (Codeage). Page carries an anti-tampering alert. |
| 16 | MCP firecrawl_search | NMN COA / third-party testing | 200 | Found PMC11335992 and the ChromaDex 2021 NMN report. |
| 17 | curl → Europe PMC REST | `search?query=PMCID:PMC11335992`, `PMC11335992/fullTextXML` | 200 | Agent-ready: PMID 38935229, DOI 10.1007/s11357-024-01257-2, CC BY. |
| 18 | curl | ChromaDex "Quantitative Analysis of Twenty-Two NMN Consumer Products" (q4cdn PDF) | 200 PDF | Brand-named results, no lot numbers. |
| 19 | MCP firecrawl_search | COA lot NR/NMN/urolithin | 200 | Found Niagen 2025 NR + counterfeit report and an Amazon-hosted Eurofins COA. |
| 20 | curl | Niagen 2025 report PDF; `m.media-amazon.com/images/I/614wRFVDiqL.pdf` | 200 PDF | E3 found on the Niagen report. |
| 21 | MCP firecrawl_scrape | `truniagen.com/pages/quality` | 200 | Brand quality page with regulatory characterization; lot-lookup lives at `transparency.truniagen.com` (interactive; not exercised). |
| 22 | firecrawl scrape (CLI) | same page to file `truniagen-quality.md` | 200 | CLI output deterministic enough to hash; no `.firecrawl/` folder created in the worktree. |
| 23 | curl → Health Canada LNHPD API | `productlicence/?lang=en&type=json&page=1` | **timeout (000)** | Unfiltered paging of the whole licence table times out. |
| 24 | curl → LNHPD API | `medicinalingredient/?id=1` | 200 empty | Child endpoints take `lnhpd_id`, not the NPN. |
| 25 | tvly extract | LNHPD API documentation | 200 | Confirms: lookup by id or full paging; **no text search**. |
| 26 | tvly search | NR NPN | 200 | NPN 80112429 found through a search engine (the only way to discover NPNs by name). |
| 27 | curl → LNHPD API | `productlicence?id=80112429`; `medicinalingredient|productpurpose|productdose|productrisk ?id=25281828`; `productstatus` | 200 / productstatus **404** | Market status is NOT in the API; only on the web page `lnhpd-bdpsnh/info?licence=80112429` ("Market status: Not Marketed"; "Licence Status: Active"). |
| 28 | curl → LNHPD API | `productlicence?id=80112465`, `medicinalingredient?id=25384203` | 200 | One licence → 8 product names. |
| 29 | curl | Google Patents `US8197807B2`, `US9872850B2` | 200 HTML (1.1–1.2 MB) | Scrapeable; "Legal status … is an assumption and is not a legal conclusion". |
| 30 | tvly search | ChromaDex v. Elysium 22-1116 | 200 | Found the CAFC opinion URL. |
| 31 | curl | `cafc.uscourts.gov/opinions-orders/22-1116.OPINION.2-13-2023_2079642.pdf` | 200 PDF | Court primary source; agent-ready as PDF. |
| 32 | curl → SEC EDGAR | `data.sec.gov/submissions/CIK0001386570.json`; 10-K FY2025 `cdxc-20251231.htm` | 200 | UA from `EDGAR_IDENTITY` read in-shell, never printed. The repo `edgartools` MCP was not loaded in this session; plain HTTP works. |
| 33 | tvly search | EU novel food: NR chloride, urolithin A, NMN | 200 | Found EUR-Lex 2020/16, EFSA NMN opinion (2026). Urolithin A EU authorisation not located in this pass. |
| 34 | curl | EUR-Lex `CELEX:32020R0016` HTML | 200 | Agent-ready HTML; annex tables flatten to lines. |
| 35 | curl → Europe PMC | `PMCID:PMC13158811` (EFSA β-NMN opinion) | 200 | DOI 10.2903/j.efsa.2026.10007, PMID 42125559. |
| 36 | curl → FDA Data Dashboard API | `api-datadashboard.fda.gov/v1/inspections_classifications` | 400 then **401 Not Authorized** | Needs registered user + key headers. Inspection classifications and 483 citations not reachable without an account. |
| 37 | curl → openFDA drugsfda | `NDA021083` (Rapamune), `NDA217785` (Rezdiffra) | 200 | Agent-ready; submissions with letters/labels URLs. |
| 38 | firecrawl scrape (CLI) | `mitopure.com/patents` | 200 | Patent-marking page; numbers only. |
| 39 | curl | Google Patents `US9872850B2` | 200 | — |
| 40 | curl → eCFR versioner API | `title-21.xml?part=111&section=111.70` | **406** without compression, 200 with `--compressed` | eCFR requires `Accept-Encoding`. |
| 41 | MCP firecrawl_search | Informed Sport creatine | 200 | — |
| 42 | curl | `sport.wetestyoutrust.com/node/1146294` | **403** | Informed Sport blocks curl. |
| 43 | firecrawl scrape (CLI) | same | 200 markdown | Batch table captured. |
| 44 | curl | USPTO TSDR `tsdrapi.uspto.gov/ts/cd/casestatus/rn…/info` | **401** — "you'll need to register for an API key" | Trademark status not reachable without a USPTO API key. |
| 45 | curl | PatentsView `search.patentsview.org/api/v1/patent/` | **000** (no response) | Not reachable in this session (PatentsView now needs an API key as well; not verified). |
| 46 | firecrawl scrape (CLI) | `downloads.regulations.gov/FDA-2022-S-0023-0051/attachment_1.pdf` (NDI 1259 response) | 200 markdown | — |
| 47 | curl → ClinicalTrials.gov v2 | `NCT05040321`, `NCT04817111` | 200 | Verified the trials FDA cited; found that FDA's NDI 1259 footnote gives NCT05040321's URL for a differently titled COVID-19 trial. |
| 48 | MCP firecrawl_search (category pdf) | finished-product COA | 200 | Found a second Amazon-hosted COA. |
| 49 | curl | `m.media-amazon.com/images/I/71N+Qjd8YlL.pdf` | 200 PDF | E4 found. |

## Not exercised (scored from documentation or prior knowledge only; mark as such in 08)

PubMed MCP, ClinicalTrials MCP, bioRxiv MCP, Exa MCP, ICD-10 and NPI MCP (no D8 need in this stage); FDA Inspection Classification Database web UI; FDA Form 483 FOIA reading room; EFSA OpenFoodTox; EU novel food status catalogue (only the consultation-request PDF was found by search); TGA ARTG; EPO OPS; USP Verified directory; Labdoor/ConsumerLab (paywalled); Drugs@FDA Orange Book patent/exclusivity files; DailyMed SPL.

## Capture table (scratch `raw/`)

| file | sha256 |
| --- | --- |
| openfda-F-0729-2025.json | d4da11ff0b5ad2f4bbd156f6f48373b3fc1e5b8927bf16b7cd740368f2d9a49d |
| openfda-H-0594-2025.json | cb8df8c3065e6c627800d7cbd6b8223efd61ffb54f880115b0fa24a7eca5542c |
| openfda-F-0728-2022.json | 53cd9425f698b6b53ebfc354b81b4b095fb2879e0c5972278e685bf22f662614 |
| openfda-enf-ds.json (incl. H-0483-2026 Imu-Tek) | b28b2e505751868cbc1a07aaa6f3d6c06caf0828d4f1f83ebc90bd3fef34c55c |
| fda-nmn-cp-response.md | 0a1de62449e40fdd6a9001ecb84a5b3b250fdfff4b342747742ed07da3e706b9 |
| fda-ndi1259-kingdomway.md | 4f600af2e7d70242bc38fb213ca897f451c07b2ce5534f484dccde0c37be8f35 |
| grn635.html | 843eb80cbec633dd9e68e249af031e305b2176cd1a602d80a530946befa9a9e3 |
| grn791.html | bb74bd010e3f38da75eedbb9d101fa4626575adfecb12e6a5d6055ca7de44e1e |
| grn791-letter.pdf | 053d252d06a8a479a790d4292437fb9711d9b60b38286525bf738520f722710b |
| wl-imu-tek-animal-health-incorporated-724610-06052026.html | 148c70a77b2491854cebba1d6e61348a432d21b251ad431ad9683253cca6c9bb |
| wl-genogenix-llc-718739-01202026.html | 5e813f75b583c9a5c8fc93d0db4a4ae82233602a5943e5490c17ff6d9bee74b8 |
| wl-lxr-biotech-llc-714568-12232025.html | fc29cc02cf417a3d9435a95181dd3d10a52e2fd5d5787cffa4970ffbdf2ae279 |
| PMC11335992.xml | b20a9f4ad251f45bdb5bb0dbdee4bcb48e0493b760945203243eb60c0bedd162 |
| chromadex-nmn22.pdf | 80689a544392b37c5bb20c9e07a46a680c3d6815e3f6d14445fc132f71e44896 |
| niagen-nr50-counterfeit-2025.pdf | 6669fffcd6e3e3f85669dd5b48456c8114edff0c72821dfdb84b3d4bb2f74574 |
| amazon-coa-614wRFVDiqL.pdf | 402d7c3b68b3f1e8c4f209e698bb004a905fab381e820584115ce1ff2e8c94e8 |
| amazon-coa-71N.pdf | 6499603381688ec5e71a52a1f036f99c4998be9e5645841d995552987131ef44 |
| truniagen-quality.md | b2eb8a1dc20f75c99698df03adce3421034c19e5eb5752cbb8d22d86ddc16ccc |
| lnhpd-80112429-productlicence.json | 726aa5e577e489c9b179ab115a79b314cf00a518b0c6d24de03a7c265253479d |
| lnhpd-25281828-medicinalingredient.json | aa767c8a3caeeaa293ca0f0d763683cb764da4df082226e6e11d430c6403ada4 |
| lnhpd-25281828-productpurpose.json | 00d0f9a0ed47fea3a32792e8205dae85aeaa3da402cbb54eb10c668085b3ef05 |
| lnhpd-25281828-productdose.json | 5ef16d382367c3d419f9f9c832819d44c195334e6780d0c8c6a2f108db7eefb5 |
| lnhpd-25281828-productrisk.json | 0d718416f483309d66c5556b9d54157df45bd597688778508f9b057b899a7e4f |
| lnhpd-80112465-productlicence.json | ed06185fe8349bae23e4fab10db15e38d9e4aa1bb68201c580ba1d798310743d |
| lnhpd-25384203-medicinalingredient.json | 670e28ca42e4922c76170838142753bcdcf53532361b35748651f017c22580e7 |
| nsfsport-1451522.html | 53addb3c6028600310fefb273f17887bf72cf7f91803085d8456e4b960e764b5 |
| infonsf-dietary.html | 3d30b2873118bb5388116a3a0697c8a349d4015600b72d1dec1df94d2fe2068a |
| lnhpd-web-80112429.html | 41c009487bedac76c1419c6be446c93dee900a0a23df276aee2ffc991e8baeb5 |
| ctgov-NCT05040321.json | b71ebf427557eba94548a0895ba51941fdfabb3724742ee8a9b92639d9dee419 |
| ctgov-NCT04817111.json | c41f87e991fa49166419f69bcaeb647ef19a21258db28c4d2cd699e9517e908d |
| epmc-PMC13158811.json | 6fe95ab25f98c19c9106ae5f6607a227d1c870c5977d2283289e0b4c2a613db7 |
| gp-US8197807B2.html | 5d97286e02347657c6e836b225984b2a4f93a0fd359429066d2378496fd0924e |
| gp-US9872850B2.html | d903a0c5f4d03fde729df2d573e7c2441e43e90a768b053c5d813696333b3022 |
| cafc-22-1116.pdf | f1b39bc48cf1e093a86067cdd1bf253f1c2b5ff4e221c76410ba1fd6e2eb8dfb |
| edgar-10k-2025.htm | 0f823d4988919baf6ee581216ac10a0537edfffb5a0e2c5bdc1d9eb32e6483e6 |
| eurlex-2020-16.html | 6dcae43509f74477298bee99a79912973793aa5c7f884f4c73aef662a17bb1b8 |
| openfda-drugsfda-NDA021083.json | fbc161eb922c851919fb2a7f2b107ad94fe852b3bf6cca465cf8014804a06c8d |
| openfda-drugsfda-NDA217785.json | 00ebeded2522cbfe637cca57a3b46d78012ac06db8a64840cbf9a99537d72645 |
| mitopure-patents.md | d3ab223ec8eb61e48458490cb5946c5a3f0b77593558275d3d39c482a3a16cad |
| ecfr-111.70.xml | 294c96699de3af6833e3d20ea4fef7fa25884bad9a8e5c821c39ace3f03e7388 |
| informedsport-1146294.md | 82a224e0a940ae7a8abcd175842a47ec346240beb080bee98e4a353120bf2ff3 |

---

# Fixtures stage (A7, 2026-10-08, ~21:35–22:30 UTC)

Fresh captures in scratch `…\scratchpad\ft\D8\fx\<area>\`; scripts in `…\scratchpad\ft\D8\tools\` (kept outside the capture folders): `h2t.py` v2 (HTML → text, comments stripped), `loc.py` (find a quote, offsets, page), `fxlib.py` + `gen_*.py` (build `locators.yaml` / `assertions.yaml` / `intent.json` from a spec; every quote string-verified), `verify.py` (re-select every locator from the snapshot bytes), `check-intent.mjs` (zod `IngestionIntent` from `packages/contracts/dist` + SDL name check against the model-stage compile file).

## Environment findings added or corrected

| # | finding | impact | workaround |
| --- | --- | --- | --- |
| E4 (corrected) | Glyph loss on COAs is `pdftotext`'s default output encoding, not the PDFs: with `-enc UTF-8` "≤ 0.5 µg", "≥ 450 mg", "± 5%" come through intact. | Comparators are recoverable; `specComparator` UNKNOWN is rarely needed. | Always `pdftotext -raw -enc UTF-8`. |
| E5 (corrected) | The FDA NMN petition response prints "September 29, 2029" in its own text layer and on the rendered page; Firecrawl reproduced it faithfully. The signature block says "Date: 2025.09.29 09:36:52 -04'00'"; regulations.gov `postedDate` is 2025-09-29. | A source typo, not a parser error: dates on regulator letters need a second, structured source. | Date of record from the signature timestamp + docket API; the printed date kept as its own literal (n20). |
| E6 (new) | Firecrawl's PDF parser printed `NCT05040321` for footnote 1 of FDA's NDI 1259 letter, where the PDF text layer and the rendered page read `NCT05038488` (the same parser output produced the research-stage claim that FDA mis-cited a trial). Re-selecting the quote against the Firecrawl projection succeeds, so projection-based verification cannot catch it. | False findings about regulators; identifier errors that pass verification. | Capture document bytes (E7), keep projections as `NORMALIZED_TEXT`, verify identifiers against the text layer and a page render. |
| E7 (new) | `downloads.regulations.gov` attachments return 200 to curl with a browser User-Agent + `Referer: https://www.regulations.gov/` + `Accept: application/pdf` (403 without). regulations.gov API v4 answers single document lookups with the public `DEMO_KEY`. | Raw PDF bytes and structured docket metadata without a browser. | Use these headers; register an api.data.gov key for volume. |
| E8 (new) | info.nsf.org keeps a scope note inside `<!-- … -->`; a regex HTML-to-text that does not drop comments returns text the page does not display (the research stage quoted it). | Quoting invisible text as a certifier's scope. | Strip comments (h2t v2); prefer a DOM renderer. |
| E9 (new) | Python launched from Git Bash resolves `/c/Users/...` as `C:\c\Users\...` (E2 variant): one generator run wrote four fixture files under `C:\c\Users\Pinda\Proyectos\Biotech\biotech-knowledge-services-A7\schema\program\packets\D8\07-fixtures\imu-tek-warning-letter-recall\`. The stray copies were not removed (a safety check blocked `rm -r C:/c`); the owner may delete `C:\c`. | Stray files outside the worktree. | Pass `C:/...` paths to Python. |

## Calls

| step | tool | target | result | notes |
| --- | --- | --- | --- | --- |
| F1 | curl (browser UA) | FDA warning letter 724610 | 200, 48,994 B | byte-identical to the research capture (148c70a7…) |
| F2 | curl → openFDA | `food/enforcement.json?search=recall_number:"H-0483-2026"` | 200, 1,815 B | single-record snapshot; `meta.last_updated` 2026-09-30; status Terminated |
| F3 | curl | Eurofins COA PDF, ashwagandha COA PDF (Amazon CDN) | 200 | both byte-identical to research captures |
| F4 | curl | CAFC opinion 22-1116 PDF; Google Patents US8197807B2 | 200 | byte-identical to research captures |
| F5 | curl | nsfsport listing 1451522; info.nsf.org NSF/ANSI 173 listing | 200 | nsfsport bytes differ from the research capture (same lots); info.nsf.org identical |
| F6 | curl | EUR-Lex CELEX 32020R0016 HTML | 200, 40,645 B | bytes differ from the research capture, act text the same (OQ-D8-24) |
| F7 | curl (EDGAR UA from `.env`, not printed) | Niagen 10-K FY2025 HTML | 200, 2,046,533 B | byte-identical |
| F8 | curl → regulations.gov API v4 | documents FDA-2023-P-0872-2754, FDA-2022-S-0023-0051 (`DEMO_KEY`) | 200 JSON | postedDate 2025-09-29 / 2022-11-08; subtype "Partial Petition Approval and Denial" |
| F9 | firecrawl CLI `scrape --max-age 0` | both regulations.gov PDFs; Informed Sport node 1146294 | 200 | NDI and CP markdown byte-identical to research captures; Informed Sport markdown differs (dynamic), same 24 batch rows |
| F10 | curl with browser UA + Referer + Accept | both regulations.gov PDFs | **200** application/pdf (345,052 B; 743,063 B) | E7 (research stage got 403) |
| F11 | pdftotext 4.00 `-raw` / `-layout` `-enc UTF-8` | all PDFs | ok | E4 corrected; NDI page 2 is an Acrobat Paper Capture OCR layer |
| F12 | pdftoppm | NDI page 2, CP page 1, Eurofins page 1, ashwagandha page 1 | PNG | page images read to confirm NCT05038488 (E6), the printed 2029 date (E5), the Eurofins row alignment and the ashwagandha table structure |
| F13 | curl → ClinicalTrials.gov v2 | NCT05038488, NCT05040321, NCT04817111 | 200 | all three official titles equal FDA's footnote titles; all list MIB-626 |
| F14 | scratch `loc.py` | ~80 candidate quotes | found / occurrences | ambiguous quotes lengthened or given an occurrence index |
| F15 | scratch `gen_*.py` | six fixtures | 125 locators, 90 assertions | quote not found or ambiguous = hard failure |
| F16 | scratch `verify.py` | six fixtures | **125 / 125 re-selected**, 0 failures | snapshot hash, re-extracted text hash and exact-at-offset all match |
| F17 | node `check-intent.mjs` (zod `IngestionIntent`) | 7 intent files | all zod-valid | only "nodeType Study not in SDL" (D3 type outside the D8 compile file; expected) |
| F18 | `node scripts/packet-check.mjs D8` | packet | ok: true | 6 fixtures |
| F19 | read sibling SDLs (A2, A4, A6 worktrees) | `04-schema-proposal.graphql` type names | — | seam names confirmed (OQ-D8-06 update) |
| F20 | python from Git Bash with a `/c/...` output path | gen_imutek.py | wrote to `C:\c\...` | E9 |
| F21 | `rm -r C:/c` | stray directory | blocked by a safety check | left for the owner |
| F22 | `date -u` / file mtimes | capture times | — | `retrievedAt` in snapshots = file mtime in UTC |

## Fixtures-stage capture table (scratch `fx/`)

| file | sha256 |
| --- | --- |
| imutek/wl-724610.html | 148c70a77b2491854cebba1d6e61348a432d21b251ad431ad9683253cca6c9bb |
| imutek/openfda-H-0483-2026.json | 0091f10f5766ba18e51dba44dd263d61e09e1a5c0832f54230e9c898633f30b2 |
| nmn/ndi1259.pdf | 6321a2bb36896f5d4a0f4037ca688532468e12739bc03eeb8ea37d9611ab5ad2 |
| nmn/ndi1259.md (Firecrawl) | 4f600af2e7d70242bc38fb213ca897f451c07b2ce5534f484dccde0c37be8f35 |
| nmn/cp-response.pdf | 371a4b936e4cb7dcd5eb87837baa08612ccfb302c01863895e09c33aeb559dc4 |
| nmn/cp-response.md (Firecrawl) | 0a1de62449e40fdd6a9001ecb84a5b3b250fdfff4b342747742ed07da3e706b9 |
| nmn/regsgov-FDA-2023-P-0872-2754.json | f20364e08cc7b3dfec391eea256e0b64fe6a9b5b628fd51cf1df0718d5d37fd6 |
| nmn/regsgov-FDA-2022-S-0023-0051.json | 5dd6548cab88481d503d2281d057e5cc5d6e686894265b4c5cad84c247765415 |
| nmn/ctgov-NCT05038488.json | bab34b5909660fbf59beb01742ac8efccc99249c6506dd5b8e6c373413071060 |
| nmn/ctgov-NCT05040321.json | 0abadb797f5cf3e92eee82323c74c1de2043a51543ae40a7734d387ee23e56a4 |
| nmn/ctgov-NCT04817111.json | ecd8140fd8ddf8b96d9256dbbcb75679640d3f4cfab54e7c3aa8fcb7f84497ed |
| coa/eurofins-614wRFVDiqL.pdf | 402d7c3b68b3f1e8c4f209e698bb004a905fab381e820584115ce1ff2e8c94e8 |
| coa/ashwa-71N.pdf | 6499603381688ec5e71a52a1f036f99c4998be9e5645841d995552987131ef44 |
| patent/cafc-22-1116.pdf | f1b39bc48cf1e093a86067cdd1bf253f1c2b5ff4e221c76410ba1fd6e2eb8dfb |
| patent/gp-US8197807B2.html | 5d97286e02347657c6e836b225984b2a4f93a0fd359429066d2378496fd0924e |
| patent/edgar-10k-2025.htm | 0f823d4988919baf6ee581216ac10a0537edfffb5a0e2c5bdc1d9eb32e6483e6 |
| cert/nsfsport-1451522.html | d01cc35130aa60f8e8cfc8f83988faba76824d2a494745a2678b17020d24e18c |
| cert/infonsf-dietary.html | 3d30b2873118bb5388116a3a0697c8a349d4015600b72d1dec1df94d2fe2068a |
| cert/informedsport-1146294.md (Firecrawl) | fc0b2e6908d5f473cbae45ebe95254a39cb147c0b5d8fb2c543e9f08353e0d87 |
| eu/eurlex-32020R0016.html | f53290e3c90af7f77e58f58dc7a7e038d7fefd792629be81cc98a7a7cb1c93af |
