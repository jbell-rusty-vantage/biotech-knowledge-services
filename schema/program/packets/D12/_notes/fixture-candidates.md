# D12 fixture candidates (research stage, 2026-10-08)

Raw captures are in the session scratchpad `C:\Users\Pinda\AppData\Local\Temp\claude\C--Users-Pinda-Proyectos-Biotech\d38640f3-1d90-4042-9623-ff67cb1b7809\scratchpad\ft\D12\raw\` (not committed). Every quote below was checked as an exact substring of the capture by `scratchpad/ft/D12/scripts/verify_quotes.py` (log: `scratchpad/ft/D12/quote-verification-2026-10-08.txt`); "line" and "char" are the 1-based line and 0-based character offset in the capture file, "byte" is the UTF-8 byte offset. The sha256 is of the captured file as saved. For Firecrawl captures the file is Firecrawl's markdown rendering, not the origin's bytes (readiness note: the fixture stage should decide whether the snapshot is the rendered markdown or a raw-HTML capture; recapture with `--format rawHtml` if the kernel requires origin bytes). Quotes that contain U+00A0 (no-break space) are marked `[NBSP]`; the space shown there is U+00A0 in the capture.

Summary

| id | what it demonstrates | kind | questions |
| --- | --- | --- | --- |
| FC1 | prepared food from a named organization (McDonald's medium fries): Product with formulation, ingredients, allergens, as-of date | prepared-food (brief requirement) | Q-D12-04, 05, 14, 17, 27, 30, 34 |
| FC2 | reference foods at a named preparation (raw vs baked russet) and a restaurant-branded reference record | composition / preparation | Q-D12-01, 02, 04, 05, 21, 24, 30, 34 |
| FC3 | preparation-formed contaminant at brand level (acrylamide in chain fries) | **harm** | Q-D12-03, 06, 02 |
| FC4 | ultra-processed vs unprocessed diet RCT, full text → chunk → assertion → locator → snapshot | **unstructured-to-entity (directive 3.8)**, harm | Q-D12-26, 08, 12, 14, 25 |
| FC5 | PREDIMED retraction and republication: claim wording downgraded | **disconfirmation** | Q-D12-09, 10, 12, 23 |
| FC6 | what frying, microwave and fermentation do to olive-oil polyphenols | preparation → composition | Q-D12-02, 01, 21, 19 |
| FC7 | longevity-food product claim (Blueprint EVOO) against the EU authorised olive-polyphenol claim | harm (misleading claim risk) / recommendation with interest | Q-D12-18, 22, 19, 32 |
| FC8 | contaminated packaged food: lead/chromium in cinnamon applesauce, supply chain, recalls | **harm** | Q-D12-06, 07, 28, 32 |
| FC9 | hazard classification of a food group (IARC processed meat) | harm | Q-D12-15, 03, 08 |
| FC10 | crowd product record with computed NOVA group and two national formulations under one barcode | harm (UPF) / conflict | Q-D12-14, 30, 17, 24 |

Recommended trio for the fixture stage: FC1 (prepared food, brief requirement) + FC4 (unstructured-to-entity) + FC3 or FC8 (harm), with FC5 as the disconfirmation case and FC2/FC6 as the composition-and-preparation fixture.

---

## FC1 — McDonald's USA, Medium French Fries (prepared food from a named organization)

- URL: https://www.mcdonalds.com/us/en-us/product/medium-french-fries.html
- Title: McDonald's USA — Medium French Fries (product page)
- Retrieved: 2026-10-08 · Tool: Firecrawl CLI `scrape --only-main-content --wait-for 4000` (scrape id 01a11d4a-2a6f-735f-ac63-042abb9b7011)
- Capture: `raw/mcd-medium-fries.md` · sha256 `7a385ec59564b754f37c3abad5bae62f57765a7f67fa30acf946a9bd4a4a66e6` · 9,866 bytes
- Quotes (verbatim):
  1. "There are 320 calories in a medium McDonald's Fries." — product description, line 27, char 1295
  2. "made with premium potatoes such as the Russet Burbank and the Shepody" — product description, line 25, char 948
  3. "natural Beef Flavor Contains Hydrolyzed Wheat And Hydrolyzed Milk As Starting Ingredients." — Allergen Information › ingredient statement footnote, line 325, char 4343
  4. "Contains: Wheat, Milk." — Allergen Information, line 328, char 4436
  5. "The nutrition information is based on standard product formulations and serving sizes." — nutrition disclaimer, line 375, char 7494
  6. "This information is correct as of January 2022, unless stated otherwise." — nutrition disclaimer, line 375, char 8549
- Demonstrates: a prepared food is a D6 Product (organization D7, formulation/ingredient statement, declared nutrition with an as-of date) that realizes a D12 reference food (FDC 170721, FC2); NOVA markers in the ingredient statement (hydrolysed proteins, hydrogenated oil) for a computed classification; allergens. Secondary candidate for the unstructured-to-entity path (page chunk → ingredient/allergen assertion → text locator).
- Answers: Q-D12-04, 05, 14, 17, 27, 30, 34.

## FC2 — USDA FoodData Central: reference foods at a preparation, and a branded reference record

- URLs and titles (all retrieved 2026-10-08, curl against the FDC API with `api_key=DEMO_KEY`; the key is a public demo key, not a secret):
  - https://api.nal.usda.gov/fdc/v1/food/170721 — SR Legacy "McDONALD'S, french fries" · `raw/fdc-170721.json` · sha256 `0d417572c814a9887b2b9eb18bb34fa0c583b70d2f54d5b4dd6553d5ec49eb8c`
  - https://api.nal.usda.gov/fdc/v1/food/170027 — SR Legacy "Potatoes, russet, flesh and skin, raw (…)" · `raw/fdc-170027.json` · sha256 `51e6625a1a3c27a19d558e88d9fa3f0e53483c9f519f17ef470db36bac23e738`
  - https://api.nal.usda.gov/fdc/v1/food/170030 — SR Legacy "Potatoes, Russet, flesh and skin, baked" · `raw/fdc-170030.json` · sha256 `7dfd51b4217de64e97acf5290951b26745fa4e5a720f94cddc736bba05bfc69d`
  - (context) 748608 EVOO Foundation `76c72b3f9c6d0c8523e5dfae2ea35d1ac69b8fad9f398158942b74cb3200c888`; 2346401 russet raw Foundation `ada3fcd1965f57abd0554b22052ae233a31e65d15259de845b8c44b9f012e1b0`; 2706892 FNDDS cheeseburger `110b1a2550c0de9d03f9de0e459fa22f677591f0d6036e975a409390fe96eba1`
- Quotes (verbatim JSON fragments; locator kind = JSON pointer, char offset given for the text-span fallback):
  1. `"description":"McDONALD'S, french fries"` — fdc-170721.json char 16 (JSON `/description`)
  2. `"id":1546510,"amount":323.00000000,"dataPoints":0` — fdc-170721.json char 824 (the Energy kcal row, derivation `NC` Calculated)
  3. `"gramWeight":117.00000000,"sequenceNumber":2,"amount":1.00000000,"modifier":"medium serving"` — fdc-170721.json char 35274 (`/foodPortions`)
  4. `"isHistoricalReference":true` — fdc-170721.json char 35876
  5. `"description":"Potatoes, russet, flesh and skin, raw (Includes foods for USDA's Food Distribution Program)"` — fdc-170027.json char 16
  6. `"description":"Potatoes, Russet, flesh and skin, baked"` — fdc-170030.json char 16
- Demonstrates: reference food identity includes preparation (raw vs baked are two records → two FoodItems or one FoodItem + preparation variant); composition rows with derivation code, n, min/max; portions with gram weights; a restaurant-branded item living in a reference DB (frozen, historical) that must not be merged with the chain's current Product declaration (FC1).
- Answers: Q-D12-01, 02, 04, 05, 21, 24, 30, 34.

## FC3 — FDA Survey Data on Acrylamide in Food (harm: preparation-formed contaminant, brand level)

- URL: https://www.fda.gov/food/process-contaminants-food/survey-data-acrylamide-food
- Title: FDA — Survey Data on Acrylamide in Food · Retrieved 2026-10-08 · Tool: Firecrawl CLI scrape (scrape id 01a11d4b-6a80-774f-90fd-f59beab4cd84)
- Capture: `raw/fda-acrylamide-survey.md` · sha256 `b792fc7ab29390b0eff419cc7d1abef1936796f68e48d9fd1e006a5259fae318` · 59,934 bytes
- Quotes (verbatim):
  1. "Acrylamide forms during high-temperature cooking, such as frying, roasting, and baking." — intro, line 16, char 1246
  2. "Because of unit-to-unit and lot-to-lot variation in acrylamide levels within food products, data are not designed to be used to inform consumer food choices." — intro, line 26, char 3049
  3. "| McDonald's French Fries | 428 |" — table "Data through October 7, 2004", group "French Fries and Other Potato Foods, Restaurant and Take-Out", line 456, char 25254
  4. "| Chick-fil-A Waffle Potato Fries | 271 |" — same table and group, line 449, char 24983
  5. "Values below 20 ppb are reported as NDs." — Notes (3), line 44, char 4484
  6. "Frozen products were not given additional cooking prior to testing." — Notes (4), line 45, char 4699
- Demonstrates: harm formed by a preparation (frying) at brand/organization level; measured level with LOQ; the source's own scoping caveat (not for consumer choice) must travel with any assertion; valid time = sampling period (2002–2004), not today; table-row locator must carry the group label (category appears only on the first row).
- Answers: Q-D12-03, 06, 02. **Harm case.**

## FC4 — Hall et al. 2019, ultra-processed vs unprocessed diets (unstructured-to-entity path)

- URL: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id=7946062&retmode=xml (article https://pmc.ncbi.nlm.nih.gov/articles/PMC7946062/)
- Title: Ultra-Processed Diets Cause Excess Calorie Intake and Weight Gain: An Inpatient Randomized Controlled Trial of Ad Libitum Food Intake. Cell Metab 2019. PMID 31105044 · PMCID PMC7946062 (NIH author manuscript) · DOI 10.1016/j.cmet.2019.05.008 · registry NCT03407053
- Retrieved 2026-10-08 · Tool: NCBI E-utilities efetch db=pmc by curl (Europe PMC fullTextXML returned HTTP 500 first)
- Capture: `raw/pmc-PMC7946062.xml` (JATS) · sha256 `e95aca1562741ad9a7534d8fdbef31032713b82bd3d975b63a4b5b47d0e29ae3` · 162,623 bytes. Companion registry capture `raw/ctgov-NCT03407053.json` · sha256 `fedac9c5954d2efa94629aaf480e266b8eedd733818d166bf19019a8903f594c`.
- Quotes (verbatim, from the JATS text; offsets are in the raw XML file):
  1. "Meals were designed to be matched for presented calories, energy density, macronutrients, sugar, sodium, and fiber." — Summary, char 9894
  2. "Energy intake was greater during the ultra-processed diet (508±106 kcal/d; p=0.0001)" — Summary, char 10079
  3. "Our study was not designed to identify the cause of the observed differences in energy intake." — Limitations of Study, char 40438
  4. "Foods and beverages were categorized according to the NOVA system" — STAR Methods › Diets, char 46191
- Demonstrates the directive 3.8 path: question Q-D12-26 ("does UPF exposure worsen body composition / energy balance?") → chunk of the `DocumentTextVersion` of PMC7946062 found via MENTIONS of the diet concept "ultra-processed diet" (and/or vector search) → Assertion (study result: ad libitum energy intake +508 kcal/d on the UPF diet vs unprocessed, n = 20, inpatient crossover; target-effect assertion WORSENS_TARGET target:body-composition qualified by population) → SourceLocator (TextQuoteSelector = quote 2, offsets) → SourceSnapshot (sha256 above). The limitations quote (3) is the disconfirmation guard: the source itself denies a mechanism claim. Also shows the seam D12 → D3: the arm administers a dietary pattern classified by NOVA (quote 4); the registry types the diets as `DIETARY_SUPPLEMENT`.
- Answers: Q-D12-26, 08, 12, 14, 25. **Unstructured-to-entity; also harm.**

## FC5 — PREDIMED 2013 (retracted) and 2018 (corrected and republished) (disconfirmation)

- URL: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=23432189,29897866&retmode=xml
- Title: PubMed XML for Estruch R et al., "Primary prevention of cardiovascular disease with a Mediterranean diet", NEJM 2013 (PMID 23432189, DOI 10.1056/NEJMoa1200303) and "Primary Prevention of Cardiovascular Disease with a Mediterranean Diet Supplemented with Extra-Virgin Olive Oil or Nuts", NEJM 2018 (PMID 29897866, DOI 10.1056/NEJMoa1800389); retraction notice PMID 29897867 (DOI 10.1056/NEJMc1806491); ISRCTN35739639
- Retrieved 2026-10-08 · Tool: NCBI E-utilities efetch by curl (the PubMed MCP metadata tool did not return publication types or retraction links)
- Capture: `raw/pubmed-predimed-23432189-29897866.xml` · sha256 `29d54857a3360ca03356e68e434f90d2bf587f7e015618858d5dab0133bc77a3` · 133,425 bytes
- Quotes (verbatim):
  1. `<PublicationType UI="D016441">Retracted Publication</PublicationType>` — PMID 23432189 record, char 6221
  2. `<CommentsCorrections RefType="RetractionIn">` — PMID 23432189 record, char 10193
  3. "a Mediterranean diet supplemented with extra-virgin olive oil or nuts reduced the incidence of major cardiovascular events" — 2013 abstract CONCLUSIONS, char 3019
  4. "We have withdrawn our previously published report and now report revised effect estimates based on analyses that do not rely exclusively on the assumption that all the participants were randomly assigned." — 2018 abstract METHODS, char 42973
  5. "the incidence of major cardiovascular events was lower among those assigned to a Mediterranean diet supplemented with extra-virgin olive oil or nuts than among those assigned to a reduced-fat diet" — 2018 abstract CONCLUSIONS, char 44104
  6. `<PublicationType UI="D016439">Corrected and Republished Article</PublicationType>` — PMID 29897866 record, char 107340
- Demonstrates: an alleged longevity food claim (EVOO, nuts, Mediterranean pattern) whose flagship evidence was retracted and republished with weaker (associational) wording; claim timeline with two occurrences by the same asserters, publication-status events, and a vetting verdict that changes as of 2018-06-21. Effect estimates barely changed (HR 0.70 → 0.69), so the disconfirmation is of the causal wording and randomization, not of the direction — a good test of the verdict lattice.
- Answers: Q-D12-09, 10, 12, 23. **Disconfirmation case.**

## FC6 — Phenol-Explorer, report on oils (preparation → composition)

- URL: http://phenol-explorer.eu/reports/45
- Title: Phenol-Explorer 3.6 — Showing report on Oils · Retrieved 2026-10-08 · Tool: Firecrawl CLI scrape
- Capture: `raw/phenolexplorer-report45-oils.md` · sha256 `c58fa6bd84243ed83aea3e282489a66c830060c8138472be09e49f5794ac4f70` · 23,597 bytes
- Quotes (verbatim):
  1. "Tyrosol and hydroxytyrosol are present in minor amounts (1.1 and 0.8 mg/100 g respectively)." — Olive and olive oil, line 36, char 8833
  2. "Hydroxytyrosol, 3,4-DHPEA-EDA and 3,4-DHPEA-EA in virgin olive oil are reduced by 40-50% after 10 minutes frying at 180°C, and by about 90% after six frying operations." — line 46, char 13539
  3. "Microwave heating provokes only minor losses of polyphenols." — line 46, char 13898
  4. "Fermentation has a great impact on the polyphenol concentration" — olives, line 42, char 11126
- Demonstrates: a preparation as a transformation with conditions (temperature, duration, cycles) and a stated percent change per compound — the case for a `PreparationEffect`-style assertion rather than a node per cooking method; composition per 100 g for compounds absent from FDC.
- Answers: Q-D12-02, 01, 21, 19.

## FC7 — Blueprint Extra Virgin Olive Oil vs EU authorised olive-polyphenol claim

- URL A: https://blueprint.bryanjohnson.com/products/extra-virgin-olive-oil — Blueprint EVOO product page · Retrieved 2026-10-08 · Tool: Firecrawl CLI scrape · `raw/blueprint-evoo.md` · sha256 `34897edc1720c515e5fb90e784891735217dcb2fb5316a7ab37b957f78c37e86`
- URL B: https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32012R0432 — Commission Regulation (EU) No 432/2012 · Retrieved 2026-10-08 · Tool: Firecrawl CLI scrape · `raw/eurlex-32012R0432.md` · sha256 `6f955613e880b7c0a4ad364e550e2c1bbfd8348e38e8b085871a9b1580d66c6f`
- Quotes (verbatim):
  1. "is cold-pressed extra virgin olive oil made for longevity with 400 mg/kg polyphenols." — A, product summary, line 291, char 31429
  2. "harvested in Portugal, during the harvest month of November 2025" — A, Description, line 406, char 38216
  3. "425 mg/kg total biophenols (HPLC)" — A, FAQ "Where is the Blueprint EVOO sourced?", line 1411, char 53180
  4. "Take 1-3 tablespoons daily on its own or with food." — A, How to Use, line 423, char 38673
  5. "The claim may be used only for olive oil which contains at least 5[NBSP]mg of hydroxytyrosol and its derivatives (e.g. oleuropein complex and tyrosol) per 20[NBSP]g of olive oil." — B, Annex table row "Olive oil polyphenols", line 273, char 53746
- Demonstrates: an alleged longevity food as a D6 Product from a named organization whose founder recommends it (D9/D7 interest seam); a lot/harvest-specific composition statement with method (D8 COA seam); a regulatory claim condition expressed in a different measurand (hydroxytyrosol and derivatives per 20 g vs total biophenols per kg) → assessment NOT_COMPARABLE unless a hydroxytyrosol figure is found. No verdict is drawn here.
- Answers: Q-D12-18, 22, 19, 32. Harm (misleading-claim risk) and recommendation-with-interest case.

## FC8 — Lead and chromium in cinnamon applesauce pouches (harm, supply chain, recalls)

- URL A: https://www.fda.gov/food/outbreaks-foodborne-illness/investigation-elevated-lead-chromium-levels-cinnamon-applesauce-pouches-november-2023 — FDA investigation page · Retrieved 2026-10-08 · Tool: Firecrawl CLI scrape · `raw/fda-wanabana-investigation.md` · sha256 `a737a6ba6ae9fc1c334ccba928fd2544b08819d15052cb43dcb48037b217cf95`
- URL B: https://api.fda.gov/food/enforcement.json?search=recalling_firm:"WanaBana"&limit=3 — openFDA food enforcement · Retrieved 2026-10-08 · Tool: curl · `raw/openfda-enf-wanabana.json` · sha256 `925726a43af314a4875dd74d9472a1ab5795f5a57fe364a9be58611ae3fd0545`
- Quotes (verbatim):
  1. "The highest result was 5,110 parts per million (ppm), which was more than 2,000 times the level of 2.5 ppm being considered for bark spices (including cinnamon)" — A, dated update block, line 277, char 41135
  2. "the testing results previously reported for the sample of recalled WanaBana cinnamon apple puree pouch collected from Dollar Tree had a lead concentration of 2.18 ppm" — A, line 279, char 41539
  3. "likely an act of economically motivated adulteration" — A, line 171, char 22629
  4. "As of March 22, CDC has received reports of[NBSP]136 confirmed cases,[NBSP]345 probable cases, and 38 suspected cases for a total of 519 cases" — A, line 155, char 19612
  5. `"recall_number": "F-0404-2024"` — B, char 1182
  6. `"recalling_firm": "WANABANA USA LLC"` — B, char 761
- Demonstrates: contaminant level in ingredient (cinnamon) vs finished food (puree) with reference levels of two authorities (Codex proposed ML; FDA proposed action level); supply chain organizations by role; regulatory events; a page that versions in place (dated case counts → valid-time episodes); firm-name resolution across two FDA sources.
- Answers: Q-D12-06, 07, 28, 32. **Harm case.**

## FC9 — IARC Q&A, red meat and processed meat (hazard classification of a food group)

- URL: https://www.iarc.who.int/wp-content/uploads/2018/11/Monographs-QA_Vol114.pdf — IARC Q&A on the carcinogenicity of the consumption of red meat and processed meat · Retrieved 2026-10-08 · Tool: Firecrawl CLI scrape (PDF) · `raw/iarc-qa-vol114.md` · sha256 `911c355e2e0429d06018d272bbb174ceac8b1c17c88a4a706975c76032a49a43`
- Quotes (verbatim; the PDF keeps hard line breaks, so each quote stays within one line):
  1. "An analysis of data from 10 studies estimated that every 50 gram portion of" — Q "Could you quantify the risk…", line 117, char 6292 (continues on line 118: "processed meat eaten daily increases the risk of colorectal cancer by about 18%.")
  2. "High-temperature cooking methods generate compounds that may contribute to carcinogenic" — Q "Do methods of cooking meat change the risk?", line 33, char 1779
  3. "tobacco smoking and asbestos (IARC Group 1, *carcinogenic to humans*), but this does **NOT**" — Q on tobacco comparison, line 79, char 4275
- Demonstrates: a classifier's hazard group for a food group (not a specific product), a portion-based quantified risk, and the classifier's own caveat; page locators need the PDF parser with page numbers (lost in markdown).
- Answers: Q-D12-15, 03, 08. Harm case (secondary).

## FC10 — Open Food Facts, Nutella 3017620422003 (computed NOVA, conflicting formulations)

- URL: https://world.openfoodfacts.org/api/v2/product/3017620422003.json — Open Food Facts product record · Retrieved 2026-10-08 · Tool: curl (custom User-Agent) · `raw/off-3017620422003.json` · sha256 `5d48ecc4c9013b792af8495de5d7c569714949cdaf9eaa3d8b51eb8d3ef86ea4`
- Quotes (verbatim JSON fragments):
  1. `"nova_group":4` — char 61859
  2. "skimmed milk powder (8.7%)" — `ingredients_text_en`, char 52707
  3. "LAIT écrémé en poudre 6,6%" — `ingredients_text` (fr), char 51834
- Demonstrates: NOVA group as a classification computed by a third party (OFF markers `en:e322`, `en:whey`) → materialized/derived, never a source fact about the product; two national formulations under one GTIN → Product variants by market (D6) with conflicting composition assertions.
- Answers: Q-D12-14, 30, 17, 24.

---

Other captures available for later stages (all retrieved 2026-10-08; files in the scratchpad `raw/`):

| file | sha256 | use |
| --- | --- | --- |
| wendys-uk-medium-fries.md | 0d73eb1ca9a466bb182fc03739d024fa36b2e52e12159a53bcc89eaed404be10 | UK component ingredient lists, salt, allergens (Q-D12-04, 17) |
| off-0028400090896.json | d4a5d8d98a91b7e3cef75e46a82c3fc0fc18e9a88f41375ffd39377d06f4f643 | Doritos, crowd data-quality warning (Q-D12-24) |
| dga-2025-2030.md | c46dfb4ba4acda818dae8bbf03e77eee05deffd850fc91d3db51cd13a64c004e | US guidance, "highly processed", thresholds (Q-D12-11, 31, 33) |
| ecfr-21cfr101.11.md | ca961e3f2912dca1d1937dd36d0a978ba955c1a1f7d25e355d2c1417eeedf705 | menu labeling, basis of declarations |
| fda-grapefruit.md | 0802f5c027031ee708045a06ed21d43375985b1b1f56e6d049a1370ce97715b5 | food-drug interaction (Q-D12-16) |
| biorxiv-newman-704080.md | 77a6b3c9a91d102821fe6aff177f36b816d949f1a4562a4bc0f77963c6029435 | blue-zones disconfirmation (Q-D12-29) |
| prolon-ingredients.md | fb83a9d51ec2e1bd966cdc6c595e1d2ae96f03f49e49d8012e71bae16bf3456d | fasting-mimicking kit, image-only facts (Q-D12-32) |
| pubmed-abstracts-batch1.txt | e9215a7924f8e18db0647ea36bbeba1bda24684d4a47f26c1466e4144b1ffb93 | Lane 2024, Ramsden 2016, TREAT 2020, Wastyk 2021 abstracts (Q-D12-13, 26, 33) |
| pmc-PMC10260459-nova.xml | df59db54aa7f464963ae54cc73b6693e113fd9f78f063e9094be2539728622d2 | NOVA definition abstract (Q-D12-14) |
| fdc-748608.json | 76c72b3f9c6d0c8523e5dfae2ea35d1ac69b8fad9f398158942b74cb3200c888 | EVOO Foundation record (Q-D12-01, 19) |
| fdc-2346401.json | ada3fcd1965f57abd0554b22052ae233a31e65d15259de845b8c44b9f012e1b0 | russet raw Foundation record with sample inputs (Q-D12-24) |
| fdc-2706892.json | 110b1a2550c0de9d03f9de0e459fa22f677591f0d6036e975a409390fe96eba1 | FNDDS recipe food (Q-D12-05) |
| ctgov-NCT03407053.json | fedac9c5954d2efa94629aaf480e266b8eedd733818d166bf19019a8903f594c | registry record for FC4 (Q-D12-12) |
| iarc-redmeat-news.md | 5519872e8bfd8247b167c447d3ab851cb4c3f5126256bddaa7131750a833e4ec | IARC Vol 114 news page (Q-D12-15) |
| cronometer-data-sources.md | cd2ca27f3fa3544e22fb3601501d12e425cde8120a63d5bcadc38838b6500c20 | app data provenance (Q-D12-24) |
| foodon-home.md | d0ea2537964e96e2b04d0c549b23b32c358f936dc74bcc02be1c003a57b840a8 | FoodOn identifier scheme (Q-D12-34) |
