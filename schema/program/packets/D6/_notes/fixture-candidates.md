# D6 — fixture candidates (research stage)

Agent A6, 2026-10-08. Ten candidates from real captures. The fixture stage picks at least three (contract: one unstructured-to-entity path per directive 3.8, one harm or disconfirmation case) and should cover the round-0001 variant-boundary cases where it can.

**Captures.** Raw bytes are in the scratch directory `C:\Users\Pinda\AppData\Local\Temp\claude\C--Users-Pinda-Proyectos-Biotech\d38640f3-1d90-4042-9623-ff67cb1b7809\scratchpad\ft\D6\` under the file name given. `sha256` is `sha256sum` of that file. Quotes are copied verbatim from the capture and were re-found programmatically (script `scratchpad\ft\D6-quotecheck.py`); offsets are **byte offsets** into the capture (character offsets differ where the file has multi-byte characters; both were checked). For Markdown captures made by Firecrawl, the snapshot is the Markdown rendition (contentHashBasis = firecrawl markdown); for JSON APIs, the raw response body. `\r\n` inside JSON quotes is the literal JSON escape sequence as it appears in the bytes.

Legend: **[3.8]** demonstrates the unstructured-to-entity path · **[HARM]** harm case · **[DISCONFIRM]** disconfirmation case · **[R0001]** supplies a round-0001 variant-boundary case.

---

## FC-1 — Tru Niagen 300 mg: two label versions of one UPC, and the 90-count label (NIH DSLD) [R0001] [DISCONFIRM-adjacent]

| capture | URL | title | retrieved | tool | sha256 |
| --- | --- | --- | --- | --- | --- |
| `dsld-label-295562.json` | https://api.ods.od.nih.gov/dsld/v9/label/295562 | NIH DSLD label 295562 "Tru Niagen 300 mg" (ChromaDex) | 2026-10-08 | curl (DSLD API v9) | 499b55edd212d6f2ace5081cbe1ac28266586bd522e6c6d46cf2c39091217ce5 |
| `dsld-label-323170.json` | https://api.ods.od.nih.gov/dsld/v9/label/323170 | NIH DSLD label 323170 "Tru Niagen 300 mg" (ChromaDex) | 2026-10-08 | curl (DSLD API v9) | d90025929a353034c6c549b41eb1558e7673ce3eba2a0109ca48fed9830c003d |
| `dsld-label-323171.json` | https://api.ods.od.nih.gov/dsld/v9/label/323171 | NIH DSLD label 323171 "Tru Niagen 300 mg", 90 capsules | 2026-10-08 | curl (DSLD API v9) | 4eea79012ed394df1eaf936c52ea1ee9f0243696b2f89bd469018132ed7c2f4c |
| `dsld-search-truniagen.json` | https://api.ods.od.nih.gov/dsld/v9/search-filter?q=%22tru%20niagen%22&size=20 | NIH DSLD search "tru niagen" (9 hits) | 2026-10-08 | curl | 7e444c4ac7387447a03c6318f54e836164810490a76e7b6ee35d2679a308852e |

Verbatim quotes:

1. `dsld-label-295562.json` byte 165: `"upcSku":"8 50015 31111 6","productVersionCode":"V09.2"`
2. `dsld-label-295562.json` byte 1301 (statements, Suggested/Recommended/Usage/Directions): `Suggested use: Adults take one capsule daily or as recommended by your healthcare professional.`
3. `dsld-label-295562.json` byte 1711 (statements, Seals/Symbols): `NSF\r\nCertified Sport\r\nCrescent M (Halal)\r\nStar-K (Kosher)`
4. `dsld-label-323170.json` byte 165: `"upcSku":"8 50015 31111 6","productVersionCode":"V12.3"`
5. `dsld-label-323170.json` byte 1498 (Directions): `Suggested use: Adults take one capsule 1-3 times daily as needed or as recommended by your healthcare professional.`
6. `dsld-label-323170.json` byte 1928 (Seals/Symbols): `Crescent M (Halal)\r\nStar-K (Kosher)\r\nAlkemist Assured`; and byte 390 (labelRelationships): `{"type":"Image difference, same product","labelId":295562}`

Supporting: `dsld-label-323171.json` byte 1537: `One capsule increases NAD+ by up to 51% to help support healthy aging at the cellular level.`; byte 165: `"upcSku":"8 56029 00855 4"`. Both 295562 and 323170 carry `"name":"Nicotinamide Riboside Chloride"` (295562 byte 3690) with UNII 8XM2XT8VWI and 300 mg per capsule; entry dates `"entryDate":"2023-05-24"` (295562 byte 4377) and `"entryDate":"2025-04-24"` (323170 byte 4427).

What it shows: same UPC, same composition, a **label-only change** (directions max daily servings 1 → 3; NSF seal removed, Alkemist Assured added), registered by DSLD as "Image difference, same product". Round-0001 case "same product name and SKU, changed …" — here the change is directions and seals, not chemical form (a useful negative: no new FormulationVersion, a new label version). The 90-count label carries a different GTIN family (856029…) than the brand store's 90-count barcode 850015311895 (see FC-3).

Questions: Q-D6-01, CQ-ID-05, CQ-PF-01, CQ-AX-25, Q-D6-02, Q-D6-09 (max daily declared intake 300 → 900 mg/day of NRC), CQ-PF-03 (pair with NSF listing below), Q-D6-15, Q-D6-18.

Supporting capture for CQ-PF-03: `nsf-listing-1263423.md`, https://www.nsfsport.com/certified-products/listing-detail.php?id=1263423, "NSF Certified for Sport: TRU NIAGEN® 300mg", 2026-10-08, Firecrawl CLI scrape, sha256 1155df8a1a13c6421458712d90d9770f1dbd60479e4bad870bf9f1e7350d6c35. Quotes: byte 1054 `| Country of Sale | United States |`; byte 1194 `| Lot # | All |`; byte 1261 `| Package Size | 30, 60, 90 |`.

---

## FC-2 — iHerb: "Discontinued Item" UPC 850015311116 → "New formulation available now" UPC 850015311857 [R0001] [DISCONFIRM]

| capture | URL | title | retrieved | tool | sha256 |
| --- | --- | --- | --- | --- | --- |
| `iherb-120467.md` | https://www.iherb.com/pr/tru-niagen-nicotinamide-riboside-chloride-300-mg-30-vegetarian-capsules/120467 | iHerb: Tru Niagen, Nicotinamide Riboside Chloride, 300 mg, 30 Vegetarian Capsules (Discontinued Item) | 2026-10-08 | Firecrawl CLI scrape `--country US` | d728d8d78184cd0ab1ffaf47b812146fc8af7e5363c5c6867022f584c878d577 |
| `iherb-162274.md` | https://www.iherb.com/pr/tru-niagen-age-better-300-mg-30-vegetarian-capsules/162274 | iHerb: Tru Niagen, Age Better®, 300 mg, 30 Vegetarian Capsules | 2026-10-08 | Firecrawl CLI scrape `--country US` | c06ff62ca89b9b85155d0310af27b6bd48b741cffe75d6e5ba58bc9556ea7712 |

Verbatim quotes:

1. `iherb-120467.md` byte 593 (title): `Tru Niagen, Nicotinamide Riboside Chloride, 300 mg, 30 Vegetarian Capsules (Discontinued Item)`
2. `iherb-120467.md` byte 3722: `## New formulation available now`
3. `iherb-120467.md` byte 14349 (Specifications): `- UPC: 850015311116` (and byte 14323 `- Product code: TNN-31111`; byte 14412 `3.3 x 1.75 x 1.75 in, 0.24 lb`)
4. `iherb-162274.md` byte 11620 (Specifications): `- UPC: 850015311857` (and byte 11683 `4.8 x 3.1 x 2.55 in, 0.4 lb`)
5. `iherb-162274.md` byte 11731 (Suggested use): `Adults take one capsule 1-3 times daily as needed or as recommended by your healthcare professional.`
6. `iherb-162274.md` byte 10722 (brand copy): `Tru Niagen is tested as safe up to 2,000mg/day .`

What it shows: a retailer asserts a reformulation ("New formulation") for what the labels (FC-1, and the Supplement Facts tables on both iHerb pages: 300 mg NRC, same three other ingredients) show to be a GTIN and packaging change (bottle → larger box dimensions). The verdict "retailer claim not supported by label evidence; packaging/GTIN change supported" is an **assessment** (disconfirmation of the retailer's characterization). Also a discontinuation-with-successor pair (Q-D6-19) and a safety claim to route to D5/K (Q-D6-09, Q-D6-18).

Questions: CQ-ID-05, CQ-PF-02, Q-D6-15, Q-D6-19, CQ-CM-05, Q-D6-18, Q-D6-09.

---

## FC-3 — One package, three channels: Amazon offer roles and price kinds, brand-store Shopify JSON, tracker history

| capture | URL | title | retrieved | tool | sha256 |
| --- | --- | --- | --- | --- | --- |
| `amazon-B07TK5K5TQ.md` | https://www.amazon.com/dp/B07TK5K5TQ | Amazon.com: TRU NIAGEN NAD+ Supplement, Nicotinamide Riboside 300mg, 30 Daily Servings | 2026-10-08 | Firecrawl CLI scrape `--country US` | 96bb5fe165d907767bed4335e005afa358b1c90f9554b5092d1f67b302916183 |
| `shopify-truniagen-300mg.js.json` | https://www.truniagen.com/products/tru-niagen-300mg.js | Tru Niagen® 300mg (Shopify product JSON) | 2026-10-08 | curl | 4c2f6a1c3c33b4e5f64353b733bb18fa1ec1249e62054b30c2cd8681255c090a |
| `wb-truniagen-300mg-js-20250520175310.json` | https://web.archive.org/web/20250520175310id_/https://www.truniagen.com/products/tru-niagen-300mg.js | Internet Archive capture 2025-05-20 of the same JSON | 2026-10-08 | curl `--compressed` (Wayback raw) | d858af8b297bed42c22a86e387e5f92a57a3d6b4c529ca8593087127de71de10 |
| `camel-B07TK5K5TQ.md` | https://camelcamelcamel.com/product/B07TK5K5TQ | camelcamelcamel: Amazon price history for B07TK5K5TQ | 2026-10-08 | Firecrawl CLI scrape | 1adef616df132957171823b3fc95b782e678368815ac821d1978368573d551c4 |

Verbatim quotes:

1. `amazon-B07TK5K5TQ.md` byte 30472 (details table): `| UPC | 850015311857 |`; byte 30799: `| Model Number | PHTNB001-30-300NSFS |`; byte 30838: `| Manufacturer Part Number | 30-300MG-PARENT |`
2. `amazon-B07TK5K5TQ.md` byte 3162 (Sold by link): `seller=A1W0QC6JE0QLDF&asin=B07TK5K5TQ`
3. `amazon-B07TK5K5TQ.md` byte 4687 (Subscribe & Save): `$41.65 with 15 percent savings`; byte 15749: `The 'One-time Price' refers to the current Featured Offer price for a one time purchase of the item.`
4. `shopify-truniagen-300mg.js.json` byte 3671 / 4396: `"sku":"CTNUS3006030010"` … `"barcode":"850015311857"`; byte 7007 / 7271: `"sku":"CTNUS3006090010-KIT"` … `"barcode":"850064273106"`; byte 16397: `"app_id":"ordergroove-subscribe-and-save"`
5. `wb-truniagen-300mg-js-20250520175310.json` byte 17461: `Delivered every month and get 20% off future orders.`; byte 3848: `"barcode":"850015311857"`
6. `camel-B07TK5K5TQ.md` byte 2285: `| Amazon | $42.99<br> (Oct 31, 2024) | $49.00<br> (Jan 19, 2025) | - | $47.44 |`; byte 2636: `"Amazon" means the price of an item Sold By and Shipped By Amazon itself`

What it shows: seller of record (TRU NIAGEN, Amazon seller A1W0QC6JE0QLDF) vs fulfiller (Amazon); price kinds (one-time, S&S tiers, per count, kit); the same GTIN at the brand store; a kit SKU (`-KIT`) with its own GTIN; subscription terms changing wording while platform price adjustments stay zero; a tracker whose price type encodes seller role. Also `camel` prints `**EAN**: 085001531185` (byte 1420), a malformed identifier to reject in identifier validation.

Questions: CQ-CM-01, CQ-CM-02, CQ-CM-03, CQ-AX-06, Q-D6-02, Q-D6-14, Q-D6-15, Q-D6-17.

---

## FC-4 — Prepared food from a named organization: McDonald's Big Mac declaration + The Economist's price series (seam D12, D7)

| capture | URL | title | retrieved | tool | sha256 |
| --- | --- | --- | --- | --- | --- |
| `mcd-bigmac.md` | https://www.mcdonalds.com/us/en-us/product/big-mac.html | McDonald's USA: Big Mac® product page | 2026-10-08 | Firecrawl CLI scrape `--wait-for 3000` | 3abf681e36d3e81ce490c69d85a230eb7cf7d8509d6a9919b6ee68e00a7103c9 |
| `bigmac-source-v2.csv` | https://raw.githubusercontent.com/TheEconomist/big-mac-data/master/source-data/big-mac-source-data-v2.csv | The Economist big-mac-data: big-mac-source-data-v2.csv | 2026-10-08 | curl (GitHub raw) | 8d7f1b6019ffdc9c705ab4530d416ae5106863aa2b5dc15c1f0820680a82c322 |
| `bigmac-README.md` | https://raw.githubusercontent.com/TheEconomist/big-mac-data/master/README.md | The Economist big-mac-data: README | 2026-10-08 | curl (GitHub raw) | f7ff5ddb2e4878c00089586df4668c7120b38d0630424ce8482234873162f1c0 |

Verbatim quotes:

1. `mcd-bigmac.md` byte 10468: `There are 580 calories in a Big Mac from McDonald's.`
2. `mcd-bigmac.md` byte 15437 (Big Mac Sauce allergens): `Contains: Egg, Soy, Wheat.`; byte 14910 (beef patty): `Prepared With Grill Seasoning (salt, Black Pepper).`; byte 13354 (sodium line): `1060milligrams`
3. `mcd-bigmac.md` byte 19764: `In addition, product formulations change periodically.`; byte 20172: `This information is correct as of January 2022, unless stated otherwise.`
4. `bigmac-source-v2.csv` byte 121336: `United States,USA,USD,5.36,1,71365.73,71365.73,2023-01-01`; byte 151350: `United States,USA,USD,6.22,1,89991.152,89991.152,2026-07-01`
5. `bigmac-README.md` byte 326: `In July 2022 we updated the Big Mac index to use a McDonalds-provided price for the United States (previously, we averaged the price from four major US cities).`

What it shows: a prepared-food Product owned and declared by a named organization (no GTIN, no price on the page, per-component ingredient statements, allergen lines, preparation note, an "as of" statement), with price observations made by a third party under a method that changed in July 2022. Variant boundary question for menus: jurisdiction (US page) and the declaration's as-of date.

Questions: Q-D6-10, Q-D6-11, Q-D6-12 (sodium 46 % DV, saturated fat 56 % DV are on the page), Q-D6-13.

---

## FC-5 — MOGO moringa capsules: Class I recall, outbreak, channels, and the company's claims vs the agency record [HARM] [DISCONFIRM] [3.8 alternative]

| capture | URL | title | retrieved | tool | sha256 |
| --- | --- | --- | --- | --- | --- |
| `fda-mogo-recall.md` | https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/mogo-moringa-llc-announces-voluntary-recall-select-lots-moringa-capsules-due-possible-salmonella | FDA: Mogo Moringa LLC Announces Voluntary Recall of Select Lots of Moringa Capsules Due to Possible Salmonella Contamination | 2026-10-08 | Firecrawl CLI scrape | 12133742feb0720ad19cfbb89935a1b1b726e1cc60a02643003585ff510a8d02 |
| `fda-moringa-outbreak-may2026.md` | https://www.fda.gov/food/outbreaks-foodborne-illness/outbreak-investigation-salmonella-moringa-leaf-powder-may-2026 | FDA: Outbreak Investigation of Salmonella: Moringa Leaf Powder (May 2026) | 2026-10-08 | Firecrawl CLI scrape | 48dfb0bfed9d8adbad3a4cca1953ef5a728a8109410f6d9a75e269836e45c9de |
| `openfda-H-1128-2026.json` | https://api.fda.gov/food/enforcement.json?search=recall_number:%22H-1128-2026%22 | openFDA food enforcement report H-1128-2026 | 2026-10-08 | curl (openFDA) | 98773668603a9aeacab65a07313a6fe681d1b4703496b120015c71552f6a0802 |

Verbatim quotes:

1. `fda-mogo-recall.md` byte 2553: `Mogo Moringa LLC does not authorize any third‑party sellers to distribute its products, and customers are encouraged to purchase only from official sources.` (note: U+2011 non-breaking hyphen in "third‑party")
2. `fda-mogo-recall.md` byte 2713: `Independent third‑party laboratory testing was conducted on retained samples from the affected lots, and no _Salmonella_ was detected.`
3. `fda-mogo-recall.md` byte 3056: `Affected Lots: • Lot 15525AA – Exp 06/2027 • Lot 00926AA – Exp 01/2028`
4. `fda-moringa-outbreak-may2026.md` byte 2228: `Sold at online stores including Amazon, eBay, and mogomoringa.com.`
5. `fda-moringa-outbreak-may2026.md` byte 5534: `The Washington Department of Health collected an open container of MOGO-brand moringa powder capsules that was positive for the strain of _Salmonella_ causing illnesses in this outbreak.`
6. `openfda-H-1128-2026.json` byte 1028: `Products were sold nationwide via ecommerce (Amazon, Ebay, Etsy, and mogomiranga.com)`

Also in the outbreak capture (data-quality finding, do not resolve silently): byte 4506 `a total of 34 people infected with the outbreak strain of _Salmonella_ were reported from 14 states.` vs byte 6898 `States with Cases: CA, FL, GA, IA, ID, IL, MA, MD, MI, MN, NC, ND, NE, NH, OK, OR, PA, SC, TN, TX, WA, WI` (22 codes).

What it shows: harm (Class I, 34 ill, 11 hospitalized per the page), recall scope by lot, channels named only in free text, the company's "no authorized third-party sellers" against the agency's "sold at Amazon, eBay", the company's negative retained-sample test against state-lab positives on open containers. Two adjudications (channel claim, safety-test claim) and one commerce-match assessment (which current listings match the recalled lots). Could also serve as the 3.8 path if FC-6 is not chosen: question "Where was the recalled MOGO product sold?" → chunk (Stores affected) → assertion (product SOLD_THROUGH channel Amazon, asserter FDA) → locator (byte 2228) → snapshot.

Questions: Q-D6-04, Q-D6-05, Q-D6-06, Q-D6-07, Q-D6-21.

---

## FC-6 — Niagen Bioscience FY2025 Form 10-K: channels, manufacturing model, supplier dependence [3.8]

| capture | URL | title | retrieved | tool | sha256 |
| --- | --- | --- | --- | --- | --- |
| `edgar-niagen-10k-2025.htm` (snapshot bytes) | https://www.sec.gov/Archives/edgar/data/1386570/000138657026000013/cdxc-20251231.htm | Niagen Bioscience, Inc. Form 10-K for the fiscal year ended December 31, 2025 (accession 0001386570-26-000013) | 2026-10-08 | curl (SEC EDGAR, User-Agent from EDGAR_IDENTITY) | 0f823d4988919baf6ee581216ac10a0537edfffb5a0e2c5bdc1d9eb32e6483e6 |
| `edgar-niagen-10k-2025.txt` (normalized text version: tags stripped, entities unescaped, whitespace collapsed) | derived from the above | — | 2026-10-08 | python normalization | 454b17b606e9b5a7349b841b14e1f038956a7d5031ff56eeb9715dc2dd490aa0 |

Verbatim quotes (byte offsets into the normalized text version; locators should be TEXT_POSITION bound to that DocumentTextVersion, with the snapshot digest above):

1. byte 44722 (Item 1, "Distribution: Domestic"): `In the United States, we distribute Tru Niagen® products directly to consumers through our proprietary e-commerce platform TruNiagen.com, as well as through third-party online marketplaces, including Amazon.`
2. byte 44931: `We also distribute through specialty retailers and authorized healthcare practitioners resellers.`
3. byte 68059 (Manufacturing, Sources and Availability of Raw Materials): `Our finished consumer products are manufactured by third-party, FDA-registered contract manufacturers located in the United States.`
4. byte 77691 (risk factor summary): `We rely on a single supplier, W.R. Grace, for NRC and a limited number of third-party suppliers for the raw materials required to produce our products.`
5. byte 200711 (MD&A segment table): `Net sales: Consumer Products $ 97,672 $ 76,772 27 %`

Unstructured-to-entity path (directive 3.8): user question "Through which channels does Niagen Bioscience sell Tru Niagen in the US, and who makes it?" → chunks of the 10-K text version found via MENTIONS (Organization Niagen Bioscience, Product Tru Niagen, Organization Amazon, Organization W.R. Grace) or the vector index → assertions: (Niagen Bioscience) DISTRIBUTES_THROUGH (channel: own e-commerce TruNiagen.com), (… third-party marketplace Amazon), (… specialty retailers), (… practitioner resellers); (contract manufacturers, unnamed) MANUFACTURES (Tru Niagen finished products); (W.R. Grace) SOLE_SUPPLIER_OF (NRC) → locators 1–4 → snapshot (htm sha256). The verifier re-selects the same spans by quote + offsets on the same text version. The filing is a SEC-filing source kind; FC-3 provides the observed offers for the same channels (Q-D6-20 compares them).

Questions: Q-D6-16, Q-D6-20, Q-D6-06 (brand's authorized-channel statement).

---

## FC-7 — Nordic Naturals Baby's Vitamin D3: over-dosing recall, Amazon purchasers unknown [HARM]

| capture | URL | title | retrieved | tool | sha256 |
| --- | --- | --- | --- | --- | --- |
| `openfda-F-1109-2024.json` | https://api.fda.gov/food/enforcement.json?search=recall_number:%22F-1109-2024%22 | openFDA food enforcement report F-1109-2024 (Nordic Naturals, Inc.) | 2026-10-08 | curl (openFDA) | 6ed30b41e8c8b4f69af3c1f72a3cdb3489b8b93d01ce20706770204a83d4a728 |

Verbatim quotes:

1. byte 1652 (reason_for_recall): `Elevated levels of vitamin D3`
2. byte 1134 (distribution_pattern): `Number of consignees who purchased through Amazon are unknown.`
3. byte 1867 (code_info): `Lot number 234909`

What it shows: an over-dose hazard on an infant product (the product description field carries "400 IU (10 mcg) D3" as declared), recall unit = lot, channel exposure unknown. Smaller than FC-5; use if a second harm fixture is wanted. A press release with GTIN was not searched.

Questions: Q-D6-04, Q-D6-09 (declared vs hazardous dose belongs to D5/D8; D6 holds the product and lot link).

---

## FC-8 — AG1: proprietary blends without member amounts; net contents 360 g → 350 g at the same 12 g × 30 servings [HARM] [R0001]

| capture | URL | title | retrieved | tool | sha256 |
| --- | --- | --- | --- | --- | --- |
| `dsld-label-262237.json` | https://api.ods.od.nih.gov/dsld/v9/label/262237 | NIH DSLD label 262237 "AG1" (Athletic Greens) | 2026-10-08 | curl | 6ed5982c512783e2dacc0437f87787167d52118c8e52a63790a94118e0ceb08a |
| `dsld-label-323512.json` | https://api.ods.od.nih.gov/dsld/v9/label/323512 | NIH DSLD label 323512 "AG1" (Athletic Greens) | 2026-10-08 | curl | ba2abab0b86cf546ebb3d87b0c341009affeb75cca7e34d6c4f386deca5fe16b |
| `ecfr-21-101-36.xml` | https://www.ecfr.gov/api/versioner/v1/full/2026-10-01/title-21.xml?part=101&section=101.36 | eCFR: 21 CFR 101.36 Nutrition labeling of dietary supplements | 2026-10-08 | curl `--compressed` | 397d82db94e25b73dfb000c8368d724468326d676e47a644f7ba2b3d18779cee |

Verbatim quotes:

1. `dsld-label-262237.json` byte 791: `"display":"360 Gram(s)"`; byte 41017: `"entryDate":"2021-11-19"`
2. `dsld-label-323512.json` byte 788: `"display":"350 Gram(s)"`; byte 41982: `"entryDate":"2025-03-25"`
3. `dsld-label-262237.json` byte 29627: `"name":"Alkaline, Nutrient-Dense Raw Superfood Complex"` (blend row, 7388 mg per 12 g serving; members carry `"unit":"NP"`, e.g. byte 20103)
4. `ecfr-21-101-36.txt` (normalized text of the XML, sha256 238d5f871f82b602654b7b753994ca4c5818103f99c093ef1c9c4ebfec634dac) byte 16559: `The quantitative amount by weight specified for the proprietary blend shall be the total weight of all other dietary ingredients contained in the proprietary blend`

What it shows: dose of a blend member (e.g. ashwagandha root extract, rhodiola) is legally undeclared; a net-contents change with unchanged serving size and servings per container (a package/label change, round-0001 "packaging-only" candidate). DSLD has no `labelRelationships` between the two AG1 entries.

Questions: Q-D6-08, CQ-AX-25, CQ-ID-05.

---

## FC-9 — David protein bar: brand page vs Open Food Facts for one GTIN (packaged prepared food, seam D12) [DISCONFIRM]

| capture | URL | title | retrieved | tool | sha256 |
| --- | --- | --- | --- | --- | --- |
| `david-spb.md` | https://davidprotein.com/products/salted-peanut-butter-carton | David Protein: Salted Peanut Butter Carton | 2026-10-08 | Firecrawl CLI scrape `--wait-for 2000` | d1da048b8c5c8362a858dbd59cd9fe2b7c73e13e7c0f959315f0f1ffdc03e0d4 |
| `off-850064303186-full.json` | https://world.openfoodfacts.org/api/v2/product/850064303186.json | Open Food Facts product 0850064303186 (David, Salted Peanut Butter Flavored Bar) | 2026-10-08 | curl (OFF API v2) | 910ed134df9249b4af7efabc8f9c8cf8ba9ee22b56bbf25dd882a53f634d4ac7 |

Verbatim quotes:

1. `david-spb.md` byte 134429: `UPC 850064303186`
2. `david-spb.md` byte 134200 / 134229 / 134239: `150CALORIES` … `12gCARBS` … `2.5gFATS`
3. `david-spb.md` byte 134597: `soluble corn fiber`; byte 134854: `**May Contain:** Soy, Sesame, Tree Nuts.`
4. `off-850064303186-full.json` byte 19659: `"energy-kcal_serving":140`; byte 19476: `"carbohydrates_serving":4`
5. `off-850064303186-full.json` byte 14737: `TAPIOCA, STARCH, SOY LECITHIN`; byte 23384: `"rev":13`

What it shows: two declarations for one GTIN disagree (energy, carbohydrate, fat; soy lecithin as ingredient vs "may contain" soy). Either the product changed (OFF last image 2025-06-13) or the crowd record is wrong; the graph keeps both assertions with their asserters (brand vs crowd database) and an assessment decides "changed / transcription error / unknown". Also a seam to D9/D7: the brand page's testimonial image `Positive testimonial about the David protein bar from Dr. Andrew Huberman` (byte 127779) and FC-10.

Questions: Q-D6-10, Q-D6-11, CQ-ID-05.

---

## FC-10 — Sponsorship and affiliate links pointing at products (seams D9, D7)

| capture | URL | title | retrieved | tool | sha256 |
| --- | --- | --- | --- | --- | --- |
| `huberman-sponsors.md` | https://www.hubermanlab.com/sponsors | Sponsors - Huberman Lab | 2026-10-08 | Firecrawl CLI scrape | 8b678b4a13aa23c5fa7489a8cf617780ed598139940472a54051ed6f9526a2c5 |
| `cdx-truniagen-300mg.json` | https://web.archive.org/cdx/search/cdx?url=truniagen.com/products/tru-niagen-300mg*&output=json&limit=200&collapse=timestamp:6&filter=statuscode:200 | Internet Archive CDX index for truniagen.com/products/tru-niagen-300mg* | 2026-10-08 | curl | 3f72a4552f956ca7e995d7a6716dc5ce43303e7239c38bebe31096b4ce4c571a |

Verbatim quotes:

1. `huberman-sponsors.md` byte 6217: `We only work with brands whose products we personally use and love.`
2. `huberman-sponsors.md` byte 2852: `davidprotein.com/huberman](https://davidprotein.com/pages/huberman)`
3. `huberman-sponsors.md` byte 2057: `drinkag1.com/huberman](https://drinkag1.com/partner/huberman/017a?utm_source=podcast`
4. `cdx-truniagen-300mg.json` byte 12619: `utm_source=impact&utm_medium=affiliate&utm_campaign=Online+Tracking+Link&irgwc=1&afsrc=1&irclickid=&sharedid=&irpid=1343647`

What it shows: tracked links (vanity URL → landing URL with partner/UTM ids; affiliate network partner id) from a media actor or affiliate to a merchant page; with FC-9's testimonial, a sponsor relationship visible on both sides. The link is a D6/D9 artifact; the financial interest is D7.

Questions: CQ-CM-04 (and D9/D7 questions on disclosure).

---

## Coverage summary

| contract requirement | candidate(s) |
| --- | --- |
| unstructured-to-entity path (3.8) | FC-6 (primary), FC-5 (alternative) |
| harm case | FC-5 (primary), FC-7, FC-8 |
| disconfirmation case | FC-5 (company vs agency), FC-2 (retailer "new formulation" vs labels), FC-9 (brand vs crowd record) |
| prepared food from a named organization (coordinator direction) | FC-4 (McDonald's), FC-9 (David) |
| price over time | FC-3 (Wayback + CamelCamelCamel), FC-4 (Economist series) |
| product changes | FC-1 (label-only), FC-2 (GTIN/package), FC-8 (net contents), FC-9 (possible reformulation) |
| round-0001 variant-boundary cases supplied | label-only change with same UPC (FC-1); GTIN/package change with unchanged composition (FC-1+FC-2); packaging-only net-contents change (FC-8); same formula in capsule and stick-pack forms is available in the Tru Niagen catalog (`tru-niagen-300mg-stick-packs`, NSF "TRU NIAGEN® 300mg (Stickpack)") but was not captured end to end; jurisdictional label (NSF "TRU NIAGEN® 500mg (Canada)") not captured |
