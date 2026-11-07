# D8 — fixture candidates (research stage, A7, 2026-10-08)

Eight candidates from real captures. Raw bytes are in scratch `…\scratchpad\ft\D8\raw\` (path in `tool-log.md`); sha256 is of the raw capture file named. Quotes are copied verbatim from the capture and were string-matched against it; **offset** = character offset of the quote in the whitespace-normalized extracted text of the named extraction file (HTML via `h2t.py`, PDF via `pdftotext -layout` unless `-raw` is stated, Firecrawl markdown as returned). Every quote is ≤ 60 words.

Recommended set for the fixtures stage (contract minimum is three):

| pick | candidate | role |
| --- | --- | --- |
| 1 | **FC-2** Imu-Tek warning letter + recall | **unstructured-to-entity path (directive 3.8)**; harm |
| 2 | **FC-1** NMN exclusion (2022) → reversal (2025) | **harm / disconfirmation** of a regulatory status over time; bitemporal |
| 3 | **FC-3** Eurofins "COA" that measures nothing | **disconfirmation** of "has a COA"; COA-vs-test-summary rule |
| 4 | FC-4 '807 patent claims held invalid | disconfirmation of "patented"; IP |
| 5 | FC-6 certification listings with lot/batch scope | certification scope; positive control |

---

## FC-1 — NMN: excluded from the supplement definition (2022-10-11), then not excluded (2025-09-29)

- **Sources (two snapshots, one subject):**
  - A. https://downloads.regulations.gov/FDA-2022-S-0023-0051/attachment_1.pdf · FDA letter re NDI 1259 β-Nicotinamide Mononucleotide (Inner Mongolia Kingdomway Pharmaceutical Limited), dated 2022-10-11 · retrieved 2026-10-08 · tool: Firecrawl CLI `scrape` (curl → 403) · capture `fda-ndi1259-kingdomway.md` · sha256 `4f600af2e7d70242bc38fb213ca897f451c07b2ce5534f484dccde0c37be8f35`
  - B. https://downloads.regulations.gov/FDA-2023-P-0872-2754/attachment_1.pdf · FDA response to NPA/ANH citizen petition, Docket FDA-2023-P-0872 · retrieved 2026-10-08 · tool: Firecrawl CLI `scrape` · capture `fda-nmn-cp-response.md` · sha256 `0a1de62449e40fdd6a9001ecb84a5b3b250fdfff4b342747742ed07da3e706b9`
  - C (identifier check). https://clinicaltrials.gov/api/v2/studies/NCT05040321 · retrieved 2026-10-08 · curl · `ctgov-NCT05040321.json` · sha256 `b71ebf427557eba94548a0895ba51941fdfabb3724742ee8a9b92639d9dee419`
- **Quotes:**
  1. A, determination paragraph (page 2), offset 4366: "Accordingly, we conclude that NMN is excluded from the dietary supplement definition under 21 U.S.C. § 321(ff)(3)(B)(ii) and may not be marketed as or in a dietary supplement."
  2. A, footnote 1, offset 5421: "See “A Phase 2a Randomized Controlled Trial of MIB-626 (NAD-boosting Drug) vs. Placebo in Adults With COVID-19 Infection and Early Acute Kidney Injury,” available at https://clinicaltrials.gov/ct2/show/study/NCT05040321?term=MIB-626&draw=1&rank=1." (C shows NCT05040321 is "Sirtuin-NAD Activator in Alzheimer's Disease" — identifier/title mismatch in the regulator's citation.)
  3. B, header, offset 290: "Re: Docket Number FDA-2023-P-0872"
  4. B, decision summary (page 2), offset 4093: "we are granting your petition in part and denying it in part."
  5. B, conclusion section, offset 75291: "In light of FDA’s revised interpretation of the race-to-market clause in section 201(ff)(3)(B), we now conclude that NMN is not excluded from the definition of dietary supplement under section 201(ff)(3)(B)."
  6. B, same section, offset 75499: "Specifically, although NMN was authorized for investigation as a new drug and substantial clinical investigations of NMN have been instituted and made public, NMN was marketed as a dietary supplement in the United States before such authorization."
- **Kind:** harm / disconfirmation (a status that was true as recorded in 2022 is superseded in 2025; a regulator's identifier citation that does not resolve to the cited title). Bitemporal: valid-time episodes of one status; recorded-time answer "as known on 2024-01-01" differs from today.
- **Caveat for the fixture:** the parsed date in B reads "September 29, 2029" (parse error, tool-log E5); the fixture must take 2025-09-29 from the docket / a second capture, not from the parsed text.
- **Answers:** CQ-MF-02, Q-D8-01, CQ-AX-23, Q-D8-15, Q-D8-20.

## FC-2 — Imu-Tek: inspection → Form 483 → recall → warning letter (unstructured-to-entity path)

- **Sources:**
  - A. https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/imu-tek-animal-health-incorporated-724610-06052026 · Imu-Tek Animal Health, Incorporated - 724610 - 06/05/2026 · retrieved 2026-10-08 · curl (browser UA) · capture `wl-imu-tek-animal-health-incorporated-724610-06052026.html` · sha256 `148c70a77b2491854cebba1d6e61348a432d21b251ad431ad9683253cca6c9bb` (quotes from `…-06052026.txt`)
  - B. https://api.fda.gov/food/enforcement.json?search=product_description:%22dietary+supplement%22+AND+reason_for_recall:(lead+OR+undeclared+OR+sildenafil)&sort=report_date:desc&limit=5 · openFDA food enforcement search (contains record H-0483-2026) · retrieved 2026-10-08 · curl · capture `openfda-enf-ds.json` · sha256 `b28b2e505751868cbc1a07aaa6f3d6c06caf0828d4f1f83ebc90bd3fef34c55c` (the fixture stage should re-capture the single record by `recall_number:"H-0483-2026"` for a minimal snapshot)
- **Quotes:**
  1. A, opening paragraph, offset 2058: "The U.S. Food and Drug Administration (FDA) conducted an inspection of your facility located at 3541 E. Vine Dr., Fort Collins, CO 80524 from October 6 through October 14, 2025."
  2. A, opening, offset 2529: "At the conclusion of the inspection on October 14, 2025, our investigator provided you with a Form FDA 483, Inspectional Observations (FDA 483). We acknowledge receipt of your response dated October 29, 2025."
  3. A, "Unapproved New Drugs", offset 3407: "“ImuTek Colostrum-5 Capsules and Powder. . . . has been shown to kill bacteria and viral invaders. It can also help correct bowel dysfunction by stimulating tissue repair.”"
  4. A, "Adulterated Dietary Supplements" item 3, offset 9182: "Specifically, during the inspection you stated that you have not established finished product specifications for any of your dietary supplements."
  5. A, item 4, offset 10227: "Specifically, during the inspection the investigator requested your MMRs for Colostrum-5 Capsules and Colostrum-5 Powder, and you stated that you did not have an MMR."
  6. B, record fields (JSON), offsets 3221 / 3596 / 3784: `"recall_number": "H-0483-2026"` · `"reason_for_recall": "Undeclared milk allergen"` · `"code_info": "Lot #216, Expiration 4/16/2027"`
- **Directive 3.8 path:** question Q-D8-03 "what is the enforcement chain for Imu-Tek?" → chunks of the letter text (DocumentTextVersion of A; chunk found by MENTIONS of the firm or by vector search on "inspection Form 483 response") → assertions (enforcement record = warning letter 724610 issued 2026-06-05 by HFP to firm; inspection 2025-10-06..14; finding "no finished product specifications" with CFR 111.70(e); quoted drug claim) → locators (quotes 1–5 with offsets) → snapshot A bytes; the recall record B is a second, structured snapshot for the same firm and the recall assertion (lot #216). The verifier re-selects exactly these quotes.
- **Kind:** harm; the canonical unstructured-to-entity demonstrator.
- **Answers:** Q-D8-02, Q-D8-03, Q-D8-04, Q-D8-16, CQ-MF-06.

## FC-3 — "Certificate of Analysis" whose only result is "Quantity by Input" (plus a contrast COA)

- **Sources:**
  - A. https://m.media-amazon.com/images/I/614wRFVDiqL.pdf · Eurofins Certificate of Analysis, report 3921057-0, Orgabay Liposomal NAD, lot LNA-199-0715 · retrieved 2026-10-08 · curl · capture `amazon-coa-614wRFVDiqL.pdf` · sha256 `402d7c3b68b3f1e8c4f209e698bb004a905fab381e820584115ce1ff2e8c94e8` (quotes from `amazon-coa-614wRFVDiqL.txt`, layout mode)
  - B (contrast). https://m.media-amazon.com/images/I/71N+Qjd8YlL.pdf · Certificate of Analysis, Organic Ashwagandha Extract, lot 2404101ORA · retrieved 2026-10-08 · curl · capture `amazon-coa-71N.pdf` · sha256 `6499603381688ec5e71a52a1f036f99c4998be9e5645841d995552987131ef44` (quotes from `amazon-coa-71N-raw.txt`, `pdftotext -raw`)
- **Quotes:**
  1. A, page 1 title, offset 72: "Certificate of Analysis"
  2. A, sample block, offset 270: "Lot Number LNA-199-0715"
  3. A, Method References, offset 841: "Quantity of ingredients verified through batch record review."
  4. A, footer disclaimer, offset 1201: "These results apply only to the items tested."
  5. B, Ingredients table, offset 918: "Organic Ashwagandha Root Extract (2.5% Withanolides) Withania somnifera 450 mg IPC"
  6. B, Chemical assay / heavy metals rows, offsets 1212 and 1262: "2.5% Withanolides Conforms HPLC" · "Lead 0.5 �g / serving 0.380 �g / serving ICP-MS" (the comparator and µ glyphs are lost in extraction — tool-log E4; the fixture must read them from the PDF text layer or mark the comparator unknown)
- **Kind:** disconfirmation of "this lot has a COA" → the COA measures nothing (A); a COA where label amounts are in-process-control values and the assay is a bare "Conforms" while only heavy metals carry numbers (B). Drives the per-result `resultBasis` enum and the COA-vs-test-summary rule (OPEN-QUESTIONS quality #1).
- **Answers:** Q-D8-05, CQ-AX-19, Q-D8-09.

## FC-4 — U.S. 8,197,807: licensed exclusively, asserted against a competitor, asserted claims held invalid; aggregator still says "Active"

- **Sources:**
  - A. https://www.cafc.uscourts.gov/opinions-orders/22-1116.OPINION.2-13-2023_2079642.pdf · ChromaDex, Inc. v. Elysium Health, Inc., No. 2022-1116 (Fed. Cir. 2023-02-13) · retrieved 2026-10-08 · curl · `cafc-22-1116.pdf` · sha256 `f1b39bc48cf1e093a86067cdd1bf253f1c2b5ff4e221c76410ba1fd6e2eb8dfb`
  - B. https://patents.google.com/patent/US8197807B2/en · Google Patents US8197807B2 · retrieved 2026-10-08 · curl · `gp-US8197807B2.html` · sha256 `5d97286e02347657c6e836b225984b2a4f93a0fd359429066d2378496fd0924e`
  - C. https://www.sec.gov/Archives/edgar/data/1386570/000138657026000013/cdxc-20251231.htm · Niagen Bioscience 10-K FY2025 · retrieved 2026-10-08 · curl with EDGAR UA · `edgar-10k-2025.htm` · sha256 `0f823d4988919baf6ee581216ac10a0537edfffb5a0e2c5bdc1d9eb32e6483e6`
- **Quotes:**
  1. A, page 3 (Background II), offset 3144: "It licenses the patent from Dartmouth."
  2. A, page 11 (Conclusion), offset 17560: "above, we affirm the district court's judgment that the as- serted claims of the '807 patent are invalid under 35 U.S.C." (line-break hyphen "as- serted" is in the PDF text; the following "§ 101." is on the next line)
  3. B, Info panel, offset 811: "Active , expires 2026-11-19"
  4. B, Info panel, offset 634: "The legal status is an assumption and is not a legal conclusion."
  5. C, Notes — litigation, offset 326958: "The complaint alleges that Elysium’s BASIS® dietary supplement infringes U.S. Patent Nos. 8,197,807 (‘807 Patent) and 8,383,086 (‘086 Patent) that comprise compositions containing isolated nicotinamide riboside held by Dartmouth and licensed exclusively to Niagen Bioscience."
- **Kind:** disconfirmation ("NR is patented by X") and IP status at claim level; licence as an asserted relation with valid time.
- **Answers:** Q-D8-12, Q-D8-11, Q-D8-13, Q-D8-21, CQ-EC-01.

## FC-5 — Company characterization of FDA actions vs the agency's own words

- **Sources:**
  - A. https://www.truniagen.com/pages/quality · Our Quality | Tru Niagen® · retrieved 2026-10-08 · Firecrawl CLI `scrape --only-main-content` (also MCP firecrawl_scrape) · `truniagen-quality.md` · sha256 `b2eb8a1dc20f75c99698df03adce3421034c19e5eb5752cbb8d22d86ddc16ccc`
  - B. https://www.hfpappexternal.fda.gov/scripts/fdcc/index.cfm?set=GRASNotices&id=635 · GRN No. 635 · retrieved 2026-10-08 · curl · `grn635.html` · sha256 `843eb80cbec633dd9e68e249af031e305b2176cd1a602d80a530946befa9a9e3`
  - C. https://www.fda.gov/media/187487/download · FDA letter GRN 000791 (same office, same response type; shows the standard "not an affirmation" language) · retrieved 2026-10-08 · curl · `grn791-letter.pdf` · sha256 `053d252d06a8a479a790d4292437fb9711d9b60b38286525bf738520f722710b`
- **Quotes:**
  1. A, section heading, offset 2929: "Accepted by the United States FDA & multiple international regulatory bodies"
  2. A, same section, offset 3232: "While the FDA does not regulate the dietary supplement industry, few companies go through the notification process with the FDA."
  3. A, same section, offset 3361: "Successful FDA notifications are an extra level of assurance that our key ingredient is safe and effective."
  4. B, Intended Use, offset 316: "Source of vitamin B3 in vitamin waters, protein shakes, nutrition bars, gum, chews, and powdered beverages at a maximum level of 0.0057% by weight as consumed."
  5. B, FDA's Letter, offset 739: "FDA has no questions"
  6. C, Conclusions, offset 10062: "This letter is not an affirmation that urolithin A is GRAS under 21 CFR 170.35."
- **Kind:** disconfirmation (CQ-MF-03): "accepted", "does not regulate", "safe and effective" vs a no-questions letter for food uses at 0.0057 % and FDA's standard non-affirmation language. The GRN 635 letter itself was not captured (wayback link returns HTML to curl) — the fixture stage should capture it to compare like with like; C is the same office's template.
- **Answers:** CQ-MF-03, CQ-AX-23, CQ-MF-02.

## FC-6 — Certification listings scoped to lots/batches (positive control)

- **Sources:**
  - A. https://sport.wetestyoutrust.com/node/1146294 · Creatine Monohydrate Professional — Informed Sport · retrieved 2026-10-08 · Firecrawl CLI (curl → 403) · `informedsport-1146294.md` · sha256 `82a224e0a940ae7a8abcd175842a47ec346240beb080bee98e4a353120bf2ff3`
  - B. https://www.nsfsport.com/certified-products/listing-detail.php?id=1451522 · Basis Elysium Health - NSF Certified for Sport · retrieved 2026-10-08 · curl · `nsfsport-1451522.html` · sha256 `53addb3c6028600310fefb273f17887bf72cf7f91803085d8456e4b960e764b5`
  - C. http://info.nsf.org/Certified/Dietary/Listings.asp?TradeName=nicotinamide& · NSF Product and Service Listings (NSF/ANSI 173) · retrieved 2026-10-08 · curl · `infonsf-dietary.html` · sha256 `3d30b2873118bb5388116a3a0697c8a349d4015600b72d1dec1df94d2fe2068a`
- **Quotes:**
  1. A, product facts, offsets 1404/1420: "Date Certified:" … "05-Aug-2022"
  2. A, product description note, offset 2099: "Due to a technical issue, the following batch has been tested but is not listed below:"
  3. A, batch table row, offset 4288: "**Batch ID** H26246" (row continues: Unflavoured · Batch Expiration 30 September 2028 · Test Date 30 September 2026)
  4. B, product details, offsets 1076/1082: "Lot #" … "P043-01" (also M070-01, R212-01)
  5. C, header, offset 125: "These NSF Official Listings are current as of Thursday, October 8, 2026 at 12:15 a.m. Eastern Time."
  6. C, scope note, offset 936: "NSF has tested and Certified that these products contain the identity and quantity of dietary ingredients declared on the product label and do not contain unacceptable quantities of unwanted contaminants."
- **Kind:** benefit/neutral positive control; harm variant available by re-observing later (lot drops off / listing lapses → Q-D8-08 with change tracking).
- **Answers:** CQ-PF-03, Q-D8-08, CQ-AX-19.

## FC-7 — Label claim vs measured content: competitor survey and independent peer-reviewed study

- **Sources:**
  - A. https://s23.q4cdn.com/937095816/files/doc_downloads/2021/Quantitative-Analysis-of-22-NMN-Consumer-Products-Oct-2021.pdf · Quantitative Analysis of Twenty-Two NMN Consumer Products (ChromaDex, 20-Oct-2021) · retrieved 2026-10-08 · curl · `chromadex-nmn22.pdf` · sha256 `80689a544392b37c5bb20c9e07a46a680c3d6815e3f6d14445fc132f71e44896`
  - B. https://www.ebi.ac.uk/europepmc/webservices/rest/PMC11335992/fullTextXML · Sandalova E et al., GeroScience 2024 — PMID 38935229, PMCID PMC11335992, DOI 10.1007/s11357-024-01257-2 (CC BY) · retrieved 2026-10-08 · curl (Europe PMC REST) · `PMC11335992.xml` · sha256 `b20a9f4ad251f45bdb5bb0dbdee4bcb48e0493b760945203243eb60c0bedd162`
  - C. https://s205.q4cdn.com/770776702/files/doc_downloads/MarketSurveillance/2025/Quantitative-Analysis-of-Nicotinamide-Riboside-Consumer-Products-and-Counterfeit-Tru-Niagen-June-2025.pdf · Niagen Bioscience NR + counterfeit report (June 2025) · retrieved 2026-10-08 · curl · `niagen-nr50-counterfeit-2025.pdf` · sha256 `6669fffcd6e3e3f85669dd5b48456c8114edff0c72821dfdb84b3d4bb2f74574`
- **Quotes:**
  1. A, page 2 Method, offset 2095: "Samples were analyzed by High Performance Liquid Chromatography (HPLC) using a UV-Vis detector."
  2. A, page 2 Results, offset 2858: "The remaining fourteen samples (64%) had NMN content below the method's reporting limit or detection limit, which indicates less than 1% of the claimed NMN was present."
  3. B, abstract, offset 2793: "Results showed a significant deviation from the labeled amounts, ranging from + 28.6% to -100%."
  4. B, Results (NMN content), offset 19193: "The difference from adjusted label claim ranged from -100% (NMN#15, NMN#16, NMN#18)"
  5. C, page 7, offset 10226: "Indicators of counterfeit status included the use of plastic bottles, flip-top caps, multiple label misspellings, yellow powder in the capsules, missing bottle seals or cotton filler, the usage of outdated and out-of-market lot numbers, and other inconsistencies."
  6. C, Table 1 row (`pdftotext -raw`, file `niagen-nr50-raw.txt`), offset 7223: "Elysium Health Basis Capsule 250 261" — the same row in `-layout` mode reads `250 ND` (tool-log E3); a fixture locator must record the extraction mode or use a page/table/row selector verified against the PDF.
- **Kind:** harm (products far below claim; counterfeits); also a source-independence case — A and C are by a competitor of the tested brands (D7 financial-interest seam), B is independent but anonymized (cannot join to brand or lot). B is a clean alternative unstructured-to-entity fixture (section-level locators from JATS XML).
- **Answers:** Q-D8-06, Q-D8-07, CQ-AX-19.

## FC-8 — EU authorisation with conditions, specification and data protection

- **Source:** https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32020R0016 · Commission Implementing Regulation (EU) 2020/16 · retrieved 2026-10-08 · curl · `eurlex-2020-16.html` · sha256 `6dcae43509f74477298bee99a79912973793aa5c7f884f4c73aef662a17bb1b8`
- **Quotes:**
  1. Annex, Table 1 "Data Protection" column, offset 11822: "End date of the data protection: 20 February 2025."
  2. Conditions of use, offset 3644 (also restated in the Annex): "300 mg/day for the general adult population, excluding pregnant and lactating women"
  3. Annex, Table 2 Specifications, offset 12294: "The novel food contains ≥ 90 % nicotinamide riboside chloride, predominantly in its β form, the remaining components being residual solvents, reaction by-products and degradation products."
- **Kind:** neutral (authorisation) with an IP-like exclusivity that **expired** (2025-02-20) — useful as the "protection ended" case for Q-D8-13; a regulator-owned specification for Q-D8-09; conditions for CQ-PF-04.
- **Answers:** CQ-PF-04, Q-D8-13, CQ-MF-02, Q-D8-09.

---

## Other captures usable as secondary fixture material

| capture | sha256 | use |
| --- | --- | --- |
| openfda-F-0729-2025.json (spermidine Class I recall) | d4da11ff0b5ad2f4bbd156f6f48373b3fc1e5b8927bf16b7cd740368f2d9a49d | longevity product harm; lot-level recall |
| wl-genogenix-llc-718739-01202026.html (503B NAD+/5-Amino-1MQ) | 5e813f75b583c9a5c8fc93d0db4a4ae82233602a5943e5490c17ff6d9bee74b8 | Q-D8-17 |
| lnhpd-25281828-productpurpose.json (+ licence, dose, risk) | 00d0f9a0ed47fea3a32792e8205dae85aeaa3da402cbb54eb10c668085b3ef05 | Q-D8-16 authorised claims; CQ-MF-02 Canada |
| grn791-letter.pdf (manufacturing + specification restated by FDA) | 053d252d06a8a479a790d4292437fb9711d9b60b38286525bf738520f722710b | Q-D8-09, CQ-MF-01 |
| mitopure-patents.md | d3ab223ec8eb61e48458490cb5946c5a3f0b77593558275d3d39c482a3a16cad | Q-D8-14 |
| epmc-PMC13158811.json (EFSA β-NMN opinion 2026) | 6fe95ab25f98c19c9106ae5f6607a227d1c870c5977d2283289e0b4c2a613db7 | Q-D8-20 opinion ≠ authorisation |

---

## Fixtures-stage corrections (A7, 2026-10-08)

Built fixtures: FC-2 → `07-fixtures/imu-tek-warning-letter-recall`, FC-1 → `nmn-us-exclusion-reversal`, FC-3 → `eurofins-coa-quantity-by-input`, FC-4 → `us8197807-claims-held-invalid`, FC-6 → `certification-listing-lot-scope`, FC-8 → `eu-nrcl-authorisation-data-protection`. Offsets in the fixture `locators.yaml` files supersede the offsets above (different normalization: `nfc-ws-collapse/1`).

- **FC-1 quote 2 is wrong.** The NCT05040321 URL for the COVID-19/AKI title came from Firecrawl's PDF parser. The PDF text layer and the rendered page give `https://clinicaltrials.gov/ct2/show/study/NCT05038488?term=MIB-626&draw=1&rank=1`; ClinicalTrials.gov resolves NCT05038488 to "A Phase 2a Randomized Controlled Trial of MIB-626 (NAD-boosting Drug) vs. Placebo in Adults With COVID-19 Infection and Early Acute Kidney Injury". FDA's citation is correct (tool-log E6).
- **FC-1 caveat on the date is wrong in its cause.** The response letter itself prints "September 29, 2029" (text layer and page image); it is not a parse error. The date of record 2025-09-29 comes from the signature "Date: 2025.09.29 09:36:52 -04'00'" and regulations.gov `postedDate`.
- **FC-1 sources A and B are now raw PDFs:** curl succeeds with browser User-Agent + Referer + Accept headers (E7).
- **FC-2:** the recall H-0483-2026 product is "Imu-Tek Immuno-5 Colostrum Powder 7 oz", not one of the letter's "Colostrum-5" products; status Terminated (2026-08-14), Class II.
- **FC-3 quote 6:** with `pdftotext -enc UTF-8` the glyphs are intact: "Lead ≤ 0.5 µg / serving 0.380 µg / serving ICP-MS" (E4 was an encoding default). The Eurofins result values print one row above their labels in every text mode; NAD+ is 500 mg and trimethylglycine 250 mg (page render).
- **FC-6 quote 6 is not displayed:** the NSF/ANSI 173 scope sentence is inside HTML comments (E8). Not used.
