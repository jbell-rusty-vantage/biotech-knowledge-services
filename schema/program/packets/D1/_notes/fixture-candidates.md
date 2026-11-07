# D1 — fixture candidates (RESEARCH stage, A2, 2026-10-08)

Nine candidates from real sources, all captured on 2026-10-08. Raw bytes are saved in the scratch directory `C:\Users\Pinda\AppData\Local\Temp\claude\C--Users-Pinda-Proyectos-Biotech\d38640f3-1d90-4042-9623-ff67cb1b7809\scratchpad\ft\D1\raw\` under the file name given; `sha256` is `sha256sum` of exactly those bytes (manifest: `…\ft\D1\sha256-manifest.txt`). The fixtures stage should re-capture into the fixture folder and record the new digest if the bytes differ (DSLD/LNHPD/GSRS JSON carries server timestamps in some fields; the TGA and PMC pages were captured as Firecrawl Markdown, not raw HTML).

Quotes are verbatim from the capture. Offsets are 0-based **character** offsets (Python `str.find`) into the decoded UTF-8 capture file. For JSON captures the quote is the raw JSON fragment as it appears in the file, plus a JSON path. Two special characters occur in quotes and must be preserved: U+2009 THIN SPACE between number and unit in the Sci Rep JATS XML (written below as `100 mg` with a thin space), and U+00A0 NO-BREAK SPACE in `1000 mg NR`.

Markers: **[3.8]** demonstrates the unstructured-to-entity path (question → chunk → assertion → locator → snapshot); **[HARM]** harm case; **[DISCONF]** disconfirmation case.

**Recommended set for the fixtures stage** (contract needs ≥ 3): FC-04 [3.8] (with FC-03 for the moiety numbers), FC-05 [HARM], and FC-02 + FC-01 (cross-jurisdiction salt vs moiety). Good fourth/fifth: FC-06 [DISCONF] and FC-07 (strain).

---

## FC-01 — US label: Tru Niagen 300 mg (NIH DSLD label 323170)

- URL: https://api.ods.od.nih.gov/dsld/v9/label/323170
- Title: NIH DSLD label 323170 "Tru Niagen 300 mg" (ChromaDex), productVersionCode V12.3, UPC 8 50015 31111 6
- Retrieved: 2026-10-08 · tool: curl (DSLD API v9) · file `dsld_label_323170.json`
- sha256: `d90025929a353034c6c549b41eb1558e7673ce3eba2a0109ca48fed9830c003d`
- Comparators (same substance, other declaration styles): `dsld_label_313541.json` (Pure Encapsulations, salt as row, UNII null) sha256 `6bd8442efb3e52dfb5b97c6613b57d38c42353b90a973a040dbf6572f9c43ecc`; `dsld_label_222934.json` (SuperSmart, salt as row, UNII present) sha256 `05215b051bfdc2cfa60e80270eaf12273957e8c19a81b5a16cad8c381549c37e`.
- Quotes:
  1. offset 3540, path `/ingredientRows/0/name…` — `"name":"Niagen","category":"vitamin","ingredientGroup":"Vitamin B3 (Nicotinamide riboside)","uniiCode":null`
  2. offset 3301, path `/ingredientRows/0/quantity/0` — `"quantity":300,"unit":"mg"`
  3. offset 3739, path `/ingredientRows/0/forms/0` — `"name":"Nicotinamide Riboside Chloride","category":"vitamin","ingredientGroup":"Niacin","uniiCode":"8XM2XT8VWI"`
  4. offset 1216, path `/servingSizes/0/maxDailyServings` — `"maxDailyServings":3,"unit":"Vegetarian Capsule(s)"`
  5. offset 2189, path `/statements[type=Brand IP Statement(s)…]/notes` — `Niagen and TRU Niagen are trademarks of ChromaDex, Inc.`
- Answers: CQ-PF-01, CQ-ID-03, Q-D1-01, Q-D1-02, Q-D1-05, Q-D1-16, Q-D1-24, Q-D1-26.
- What it demonstrates: a branded material declared as the row, the salt as its form, the amount on the salt (listed-ingredient) basis; maximum daily dose = 3 servings; the derived NR-cation amount is 263.4 mg per serving (300 × 255.2476 / 290.7006, calc from FC-03) and must be a derived Assertion.

## FC-02 — Canadian licence: Tru Niagen medicinal ingredients (Health Canada LNHPD)

- URLs: https://health-products.canada.ca/api/natural-licences/medicinalingredient/?lang=en&type=json&id=23195874 ; …&id=9465261 ; …&id=25281828
- Title: Health Canada LNHPD medicinal ingredient records for "Tru Niagen" (Chromadex Inc.), lnhpd_id 23195874, 9465261 (licence 80092534), 25281828 (licence 80112429)
- Retrieved: 2026-10-08 · tool: curl (LNHPD API); licence ids found by filtering the bulk `productlicence` dump with jq
- sha256: `lnhpd_mi_23195874.json` `a0e7fda6df64da21231069c6f69636adf20e65496b3a2e9f1504508eb0e7dca2`; `lnhpd_mi_9465261.json` `25330d9de5bc0cb6770152079826278d806703792cb5ec38118894c846f698ce`; `lnhpd_mi_25281828.json` `aa767c8a3caeeaa293ca0f0d763683cb764da4df082226e6e11d430c6403ada4`
- Quotes:
  1. `lnhpd_mi_23195874.json` offset 107, path `/data/0` — `"ingredient_name":"Nicotinamide riboside","ingredient_Text":null,"potency_amount":0.0,"potency_constituent":"","potency_unit_of_measure":"","quantity":263.0`
  2. same file, path `/data/0/source_material` — `"source_material":"Nicotinamide riboside chloride"`
  3. `lnhpd_mi_9465261.json` offset 106, path `/data/0` — `"ingredient_name":"Pyridinium, 3-(aminocarbonyl)-1-beta-D-ribofuranosyl-","ingredient_Text":null,"potency_amount":0.0,"potency_constituent":"","potency_unit_of_measure":"","quantity":263.0`
  4. `lnhpd_mi_25281828.json` offset 107, path `/data/0` — `"ingredient_name":"Nicotinamide riboside","ingredient_Text":null,"potency_amount":0.0,"potency_constituent":"","potency_unit_of_measure":"","quantity":439.0`
- Answers: CQ-PF-01, Q-D1-02, Q-D1-24, CQ-ID-04, Q-D1-26.
- What it demonstrates: the same product line declares the **moiety** with the salt as source material; 263.0 = 300 × 0.87804 and 439.0 = 500 × 0.87804 (calc) — the cross-jurisdiction reconciliation is a derived Assertion over two declarations. One licence names the ingredient by its CAS index name (resolution needed).

## FC-03 — Identity authority: NR chloride and NR (FDA GSRS) + PubChem

- URLs: https://gsrs.ncats.nih.gov/api/v1/substances(8XM2XT8VWI)?view=full ; https://gsrs.ncats.nih.gov/api/v1/substances(0I8H2M0L7N)?view=full ; https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/90480033,439924/property/MolecularFormula,MolecularWeight,ExactMass,InChIKey,IUPACName,Charge,CanonicalSMILES/JSON
- Title: FDA GSRS "NICOTINAMIDE RIBOSIDE CHLORIDE" (UNII 8XM2XT8VWI, version 18) and "NICOTINAMIDE RIBOSIDE" (UNII 0I8H2M0L7N, version 24); PubChem properties CID 90480033 / 439924
- Retrieved: 2026-10-08 · tool: curl (GSRS API with browser User-Agent; PubChem PUG REST)
- sha256: `gsrs_8XM2XT8VWI_full.json` `1a3167f256ef0426c33d505f49e91c523392046d0edcbec97c9d36c976eab58b`; `gsrs_0I8H2M0L7N_full.json` `3316792f5779d6e2a6c179ae2d5956d662250736e9c35a209f678ed434a8a9ad`; `pubchem_props_nr.json` `33f8a9f20a1f3ef0b958fa0eee9c0e8c056bb06d914472917f6ffe0ace075fd2`
- Quotes:
  1. `gsrs_8XM2XT8VWI_full.json` offset 11719, path `/structure/formula` — `"formula":"C11H15N2O5.Cl"`
  2. same, offset 11860, path `/structure/mwt` — `"mwt":290.7006`
  3. same, offset 6147, path `/relationships[0]/type` (related substance NICOTINAMIDE RIBOSIDE, 0I8H2M0L7N) — `"type":"ACTIVE MOIETY"`
  4. `gsrs_0I8H2M0L7N_full.json` offset 15669, path `/structure/mwt` — `"mwt":255.2476`
  5. `pubchem_props_nr.json`, path `/PropertyTable/Properties/1` — `"MolecularFormula": "C11H15N2O5+"`, `"MolecularWeight": "255.25"`
- Answers: Q-D1-01, CQ-ID-04, CQ-PF-01 (inputs), Q-D1-02 (inputs), Q-D1-24 (inputs).
- What it demonstrates: the authority relation (ACTIVE MOIETY) and the two molecular weights that the moiety-equivalent derivation cites; the record `version` belongs on the SourceSnapshot. Note GSRS also lists in-record moieties normalized to C11H14N2O5 mwt 254.2397, so the rule must name the record it reads.

## FC-04 — Trial publication methods (Conze et al. 2019, Sci Rep) + registry NCT02712593  **[3.8] [DISCONF]**

- URL: https://www.ebi.ac.uk/europepmc/webservices/rest/PMC6611812/fullTextXML (registry: https://clinicaltrials.gov/api/v2/studies/NCT02712593)
- Title: "Safety and Metabolism of Long-term Administration of NIAGEN (Nicotinamide Riboside Chloride) in a Randomized, Double-Blind, Placebo-controlled Clinical Trial of Healthy Overweight Adults" — Conze D, Brenner C, Kruger CL. Sci Rep 2019. PMID 31278280 · PMCID PMC6611812 · DOI 10.1038/s41598-019-46120-z · CC BY
- Retrieved: 2026-10-08 · tool: curl (Europe PMC REST full-text JATS XML; ClinicalTrials.gov API v2)
- sha256: `epmc_PMC6611812_fulltext.xml` `ae7b5a420c48282b6604bd3c6e22ac818dcd0fc5a9fbaba0d45abf62e34661d2`; `ctgov_NCT02712593.json` `b4f637f2a707990d2b651a3c926982fdbc2e78a02be6ac5488f7d4c0ab1ffdaf`
- Quotes (offsets into the XML file, section "Methods › Study product"):
  1. offset 28662 — `Participants received either 100 mg, 300 mg, 1000 mg NR per day or placebo during the 8-week intervention.` (thin spaces before "mg")
  2. offset 28769 (immediately following quote 1) — `The NR capsule consisted of 100 mg or 250 mg of NR chloride (99% purity) as the active ingredient and microcrystalline cellulose and vegetarian capsule as non-active ingredients.` (thin spaces)
  3. offset 29785 — `The 4 capsules amounted to a single dose of either placebo (a total of 4 placebo capsules) or 100 mg NR (1 capsule containing 100 mg NR and three placebo capsules), 300 mg NR (3 capsules containing 100 mg NR and 1 capsule containing placebo) or 1000 mg NR (4 capsules containing 250 mg NR).` (55 words; thin spaces; NBSP before the last "NR" of "1000 mg NR")
  4. offset 22841 (section "Methods › Study design") — `registered on clinicaltrials.org on March 18, 2016 as NCT0271593`
  5. offset 5731 (Abstract) — `A crystal form of NR chloride termed NIAGEN is generally recognized as safe (GRAS) for use in foods`
  6. `ctgov_NCT02712593.json`, path `/protocolSection/armsInterventionsModule/interventions/2/name` — `Niagen™ 1000` (U+2122 in valid UTF-8; an earlier jq display on the Windows console showed it as mojibake, the bytes are correct)
- Answers: Q-D1-08, CQ-ID-06, CQ-ST-02, Q-D1-01, Q-D1-26.
- **[3.8] path**: question Q-D1-08 "In Conze 2019, is '1000 mg NR' salt or cation mass?" → chunks of the JATS DocumentTextVersion found by MENTIONS of `NR chloride` / `NIAGEN` (entity linking to the FC-03 substances and the Niagen branded material) or by vector search on "capsule contained mg NR chloride" → assertions: (a) administered material = NR chloride, 99% purity (locator quote 2); (b) per-capsule amount 250 mg of that material (quote 2); (c) arm dose 1000 mg printed as "NR" = 4 × 250 mg capsules (quote 3); (d) **derived/assessed**: the printed "NR" doses are on the salt (NR chloride) basis, inputs (a)–(c), so the 1000 mg arm delivers ≈ 878 mg NR cation (calc, FC-03 ratio) → locators: TEXT_POSITION offsets 28769 and 29785 with exact quotes → snapshot: the XML bytes above. The verifier re-selects the same two spans.
- **[DISCONF]**: the printed registry id "NCT0271593" does not resolve (HTTP 404); NCT02712593 is the record whose interventions are "Niagen™ 100/300/1000"; the registry gives no dose basis. This partially answers open question OQ-L2-02 for PMID 31278280 (the paper's "NR" doses are NR-chloride masses) — as an assessment with two locators, not a declaration.

## FC-05 — Vitamin B6 thresholds and labels (TGA safety update + two US labels + GSRS vitamers)  **[HARM]**

- URL: https://www.tga.gov.au/news/safety-updates/medicines-containing-vitamin-b6-pyridoxine-pyridoxal-or-pyridoxamine
- Title: TGA "Medicines containing vitamin B6 (pyridoxine, pyridoxal or pyridoxamine)" (Medicine Safety Update; final decision released 25 November 2025)
- Retrieved: 2026-10-08 · tool: Firecrawl CLI scrape (`--only-main-content`, Markdown) · file `tga_b6_safety_update.md`
- sha256: `e825eb19efb921e91e8620936df8fa0ddd68e3e8371d619896b86edcfad16ca9`
- Companion captures: `dsld_label_326829.json` (Country Life P-5-P 50 mg) `f63958566cc707f701b6cd1f06a50ad92b859ce184cf8dcadd9f178915b04ec3`; `dsld_label_309443.json` (EuroMedica Magnesium + P-5-P) `8d84822407fbc7bd336709bf555e9073c74a3745c662f4be4df3a7ce87db5b02`; `gsrs_F06SGE49M6_full.json` `792e5a24603f323772e33058a7f80787a8fb29f6e42ceb7d5c599677661c7859`; `gsrs_KV2JZ1BI6Z_full.json` `b0f2dc8c79b55146a83ebaf27bf2b09455f4ad09515d588bf84fbe37111d5475`; NIH ODS fact sheet `ods_b6_hp.md` `ae2193892e2c851288e9a40368d85727f74536f90ff53f5147de42e68a24ba7d`
- Quotes (TGA Markdown):
  1. offset 466, section "Summary" — `Oral preparations containing more than 50 mg but not more than 200 mg per recommended daily dose of vitamin B6 will be`
  2. offset 1753, "Summary" — `Vitamin B6 can cause peripheral neuropathy, and while the risk is greatest for higher intakes of vitamin B6, it cannot be excluded for doses less than 50 mg/day.`
  3. offset 3835, "What health professionals should do" — `Adverse event reports also suggest a lack of awareness about the presence of vitamin B6 in medicines, particularly if the label lists the chemical name without the common name ‘vitamin B6’.`
  4. offset 4943, same section — `The available PDF summary will list the vitamin B6 ingredient, if present, using one of the above names and state how much is in the medicine as the equivalent amount of pyridoxine.`
  5. offset 9312, "Background" — `At the time of the final decision, there were at least 125 medicines on the Australian market providing more than 50 mg but not more than 200 mg vitamin B6 per maximum recommended daily dose.`
- Quotes (labels): `dsld_label_326829.json` offset 4858 `"quantity":34,"unit":"mg"` (row "Vitamin B6", UNII KV2JZ1BI6Z, offset 5058) and offset 5489 `"quantity":50,"unit":"mg"` (row "Pyridoxal 5-Phosphate", UNII F06SGE49M6); `dsld_label_309443.json` offset 1166 `"maxDailyServings":4,"unit":"Capsule(s)"` with B6 row offset 3561 `"quantity":10,"unit":"mg"`.
- Answers: Q-D1-03, Q-D1-04, Q-D1-02, CQ-PF-01, Q-D1-28.
- What it demonstrates: harm thresholds are stated on a nutrient-equivalent basis per **maximum** recommended daily dose; the same nutrient hides behind chemical names; the US label's 34 mg is the brand's own pyridoxine equivalent of 50 mg P5P (50 × 169.18/247.14 = 34.2, calc). GSRS does **not** give pyridoxine as P5P's active moiety (its ACTIVE MOIETY is itself), so the nutrient-equivalence rule is a nutrition convention that needs its own rule id. A person's stack total is a materialized projection, never a stored fact.

## FC-06 — Measured vs declared: melatonin gummies (Cohen et al. 2023, JAMA)  **[DISCONF] [HARM]**

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC10130950/
- Title: "Quantity of Melatonin and CBD in Melatonin Gummies Sold in the US" — Cohen PA, Avula B, Wang YH, Katragunta K, Khan I. JAMA 2023;329(16):1401–1402. PMID 37097362 · PMCID PMC10130950 · DOI 10.1001/jama.2023.2296 (not OA in Europe PMC; PubMed MCP full_text empty)
- Retrieved: 2026-10-08 · tool: Firecrawl CLI scrape of the PMC page · file `pmc_PMC10130950.md`
- sha256: `5fdfa33442b2d1855ca01e16522a4492989cffff0c7aa40cb613fe83ba690ac4`
- Quotes:
  1. offset 9554, "Results" — `In products that contained melatonin, the actual quantity of melatonin ranged from 74% to 347% of the labeled quantity.`
  2. offset 9674, "Results" — `Twenty-two of 25 products (88%) were inaccurately labeled, and only 3 products (12%) contained a quantity of melatonin that was within ±10% of the declared quantity.`
  3. offset 9953, "Results" — `The actual quantity of CBD ranged from 104% to 118% of the labeled quantity.`
  4. offset 14525, "Discussion" (limitations) — `only 1 sample of each brand was analyzed, and only gummies were analyzed.`
- Answers: Q-D1-09, Q-D1-10, Q-D1-05 (shows why "declared" must be explicit).
- What it demonstrates: a measured-content assertion contradicts the label declaration without replacing it; both coexist with different asserters; the measured value is scoped to one sample (lot seam to D8). The per-product table (Table 1) was not parsed in this stage; the fixtures stage should read it for one product row.

## FC-07 — Probiotic strain: Culturelle (DSLD 250851, 273846) + NCBI Taxonomy 568703

- URLs: https://api.ods.od.nih.gov/dsld/v9/label/250851 ; https://api.ods.od.nih.gov/dsld/v9/label/273846 ; https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=taxonomy&id=568703&retmode=xml
- Title: NIH DSLD "Digestive Daily Probiotic" and "Pro Strength Digestive Daily Probiotic" (Culturelle); NCBI Taxonomy "Lacticaseibacillus rhamnosus GG"
- Retrieved: 2026-10-08 · tool: curl (DSLD API; NCBI E-utilities)
- sha256: `dsld_label_250851.json` `94a4657250fbbe647c84c0b2f0b21046574da277839a1b63d12c9890088f831d`; `dsld_label_273846.json` `2c80f347e496e14715aa628e634e38b7f06355408fc88b4e4795abc973ce95b8`; `ncbi_tax_568703.xml` `d895c84b7882c30c974dd626b9ecfcad7c658eb321eab3c823a094fef68db85f`
- Quotes:
  1. `dsld_label_250851.json` offset 9794, path `/ingredientRows[name=Lactobacillus rhamnosus GG]/notes` — `"notes":"Lactobacillus rhamnosus GG Genus: Lactobacillus Species: rhamnosus Note: 10 billion CFUs "`
  2. same file, offset 9967 — `"quantity":40,"unit":"mg"`
  3. `dsld_label_273846.json` offset 1651 — `12 billion CFUs of the proven effective LGG probiotic strain`
  4. `dsld_label_250851.json` offset 5311 — `LGG & LGG logo are trademarks of Chr. Hansen A/S.`
  5. `ncbi_tax_568703.xml` offset 197 — `<ScientificName>Lacticaseibacillus rhamnosus GG</ScientificName>`; offset 287 — `<Synonym>Lactobacillus rhamnosus ATCC 53103</Synonym>`
- Answers: Q-D1-14, Q-D1-15, Q-D1-26, Q-D1-16.
- What it demonstrates: identical 40 mg material declarations with different counts (10 vs 12 billion CFU) that live only in notes; legacy genus on the label vs current name in the authority; the deposit id is reachable only as a taxonomy synonym string. Strain resolution is an assertion with a locator, not a name match.

## FC-08 — Botanical: ashwagandha (TGA safety update + KSM-66 label + GSRS root record + supplier page)  **[HARM]**

- URLs: https://www.tga.gov.au/news/safety-updates/withania-somnifera-ashwagandha-and-very-rare-risk-liver-injury ; https://api.ods.od.nih.gov/dsld/v9/label/306237 ; https://gsrs.ncats.nih.gov/api/v1/substances(V038D626IF)?view=full ; https://ksm66ashwagandhaa.com/what-is-ksm66.php ; https://health-products.canada.ca/api/natural-licences/medicinalingredient/?lang=en&type=json&id=4846413
- Titles: TGA "Withania somnifera (Ashwagandha) and very rare risk of liver injury"; DSLD "KSM-66 600 mg" (Nutricost); GSRS "WITHANIA SOMNIFERA ROOT" (UNII V038D626IF); "What is KSM66 | KSM Ashwagandha"; LNHPD "Master Formulae - Ashwagandha root"
- Retrieved: 2026-10-08 · tools: Firecrawl CLI (TGA, KSM-66 page); curl (DSLD, GSRS, LNHPD)
- sha256: `tga_ashwagandha_liver.md` `73026f28ed71050441d585e8c9337539f7335a8742f081ab8b6b5a5e210b75c8`; `dsld_label_306237.json` `60d4c1eb9952795a08879c32f72dd52d05a0358992c61e548b9514e74f07f1a8`; `gsrs_V038D626IF_full.json` `e70046354b677c2aebed32c490bdb46f49ca28a6d2afe9f323e8e30465ad69f6`; `ksm66_what_is.md` `3d82b3358198aa3e12d134b738b1c11d358a4fa52d2db2d01e5ce4e4249347ad`; `lnhpd_mi_4846413.json` `8567d12efe4fe5bb05950c3f2802c59aa0971945e39bc07d8b549da0b2a925f0`
- Quotes:
  1. TGA offset 3832, "Background" — `The presence and concentration of these withanolides can vary depending on whether the leaf or root part has been used.`
  2. TGA offset 4084, "Background" — `Additionally, the extraction method and extraction ratio influence the composition of the final product.`
  3. TGA offset 2046, "What health professionals should do" — `The use of products containing _W. somnifera_ should be avoided in individuals with existing liver disorders.` (underscores are Firecrawl's Markdown italics)
  4. TGA offset 8378, "Adverse events reported to us" — `This brings the total number of possible liver injury cases reported to us to 11.`
  5. `dsld_label_306237.json` offset 3461 — `organic, min. 5% total withanolides, less than 0.1% withaferin A` and offset 4099 `"uniiCode":"V038D626IF"` (form "Ashwagandha Root Extract")
  6. `ksm66_what_is.md` offset 174 — `KSM-66 is a high-concentration, full-spectrum, root-only ashwagandha extract.`
- Answers: Q-D1-12, Q-D1-11, Q-D1-13, Q-D1-06, Q-D1-27.
- What it demonstrates: plant part, preparation and extraction ratio are harm-relevant identity properties of a BotanicalPreparation; the label maps an extract to the root's UNII (identity granularity mismatch); a marker standardization claim ("min. 5%") is a content statement with a comparator; the LNHPD record carries ratio 1:5 and dried-herb equivalent 3 g as structured fields (`/data/0/ratio_numerator` "1", `/ratio_denominator` "5", `/dried_herb_equivalent` "3", `/source_material` "Dried root(s)").

## FC-09 — Supplier and form IP: Niagen Bioscience 10-K FY2025 (investor lens)

- URL: https://www.sec.gov/Archives/edgar/data/1386570/000138657026000013/cdxc-20251231.htm
- Title: Niagen Bioscience, Inc. Form 10-K for the fiscal year ended 2025-12-31 (accession 0001386570-26-000013, filed 2026-03-04)
- Retrieved: 2026-10-08 · tool: curl with SEC identity User-Agent (EDGAR full-text search, then Archives) · file `edgar_nage_10k_2025.htm`
- sha256: `0f823d4988919baf6ee581216ac10a0537edfffb5a0e2c5bdc1d9eb32e6483e6`
- Quotes (offsets into the raw HTML; text contains HTML entities such as `&#8217;`):
  1. offset 339309, Item 1A summary — `We rely on a single supplier, W.R. Grace, for NRC and a limited number of third-party suppliers for the raw materials required to produce our products.`
  2. offset 1280736, notes to financial statements — `Grace holds patents related to the crystalline form of NR chloride that provide Grace with exclusive manufacturing rights for certain forms of NRCL, which limit the Company&#8217;s ability to source alternative suppliers.`
  3. Item 1 Business, offset 32981 in the tag-stripped, entity-decoded, whitespace-collapsed text — `In 2013, we commercialized food-grade Niagen®, a proprietary form of nicotinamide riboside chloride (“NRC” or “NRCL,” commonly referred to as “NR”)` (decoded from entities)
  4. Item 1A, offset 92922 in the same decoded text — `In September 2025, the FDA determined that nicotinamide mononucleotide (NMN) may be lawfully marketed as a dietary ingredient.`
- Answers: Q-D1-07, Q-D1-16, Q-D1-17, Q-D1-18.
- What it demonstrates: branded material = substance + crystal form + grade + exclusive manufacturer; the filer itself writes "commonly referred to as NR" for the salt (salt/moiety conflation at the source); a status change on a *different* substance (NMN) is an investor risk event reachable through substance identity.

---

## Not captured (and why)

- Reddit community thread on magnesium label bases: blocked by Tavily extract, Firecrawl and curl (403) — no fixture possible with the CLI stack.
- ATCC 53103 catalog page: 404 at the guessed product URL.
- FDA NMN response letter (D8's primary), TGA ARTG PDF summaries, USP monographs, EFSA botanical compendium, FoodData Central (D12): not needed for the recommended set.
