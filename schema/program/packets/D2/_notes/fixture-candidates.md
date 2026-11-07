# D2 — fixture candidates (research stage, A3, 2026-10-08)

Twelve candidate real sources for the fixtures stage. Every candidate was captured today; raw bytes are in scratch `…\scratchpad\ft\D2\raw\` and the digests below were produced by `sha256sum` over those files (full list: `…\ft\D2\SHA256SUMS.txt`).

**How offsets work.** For XML captures (JATS / PubMed XML) the quotes and offsets are on the tag-stripped text produced by `…\ft\D2\xml2txt.py` (removes `<ref-list>`, strips tags, unescapes entities, collapses runs of spaces/tabs; the `.txt` digest is given too). Offsets are Python character offsets `[start, end)` into that `.txt`. For JSON/CSV/markdown captures offsets are into the raw file decoded as UTF-8. Where the source uses U+00A0 / U+202F no-break spaces or U+2010 hyphens, the quote below is written with ordinary spaces/hyphens and marked **(norm)**; the locator stage must record the normalization (`NBSP|NNBSP→space; U+2010|U+2011→'-'`) as the locator's `normalizationVersion`. All quotes are ≤ 60 words and copied from the capture.

Fixture kind tags use the packet-check vocabulary: `unstructured-to-entity`, `harm`, `disconfirmation`, plus `reference` (curated structural source) and `seam` (path into another domain).

## Recommended set for the fixtures stage

| pick | candidate | kind | why |
| --- | --- | --- | --- |
| 1 | FC-1 (+ FC-1b mentions) | unstructured-to-entity | Full human paper with measured and null mechanism steps in a named tissue; Europe PMC mentions show the derived MENTIONS projection and its noise; question → chunk → assertion → locator → snapshot is demonstrable end to end. |
| 2 | FC-2 (+ FC-10) | disconfirmation | A curated KB statement (KEGG: resveratrol activates SIRT1) against the primary study that tested and rejected the step; two sources, two asserters, one contested Claim. |
| 3 | FC-3 | harm | Metformin blunts an exercise-induced mitochondrial adaptation in older adults, with a curated mechanism record (complex I inhibitor) beside the human measurement. |
| alt | FC-4 | disconfirmation | ITP lifespan null for NR in both sexes, as paper + structured DrugAge rows. |
| alt | FC-5 | reference | Reactome pathway + ChEMBL MoA as structural reference records with versions. |
| alt | FC-7 (+ FC-8) | seam | Compound → mechanism → biomarker → test in one human study (D2 → D4). |

---

## FC-1 — Elhassan 2019, NR in aged human skeletal muscle (full text)

- **URL:** https://www.ebi.ac.uk/europepmc/webservices/rest/PMC6702140/fullTextXML (landing: https://europepmc.org/article/PMC/PMC6702140)
- **Title:** Nicotinamide Riboside Augments the Aged Human Skeletal Muscle NAD+ Metabolome and Induces Transcriptomic and Anti-inflammatory Signatures. Cell Rep 2019;28(7):1717-1728.e6. PMID 31412242 · PMCID PMC6702140 · DOI 10.1016/j.celrep.2019.07.043 · trial NCT02950441
- **Retrieved:** 2026-10-08 · **tool:** curl → Europe PMC REST (metadata cross-checked with PubMed MCP `get_article_metadata`)
- **sha256 (raw JATS XML, 189,550 bytes):** `fb1c0ad79ed4a06783c98d48dd51e7ec0a9640f71d8233626bdbd7c245820a03`
- **sha256 (tag-stripped text):** `881f2fda46e35e047cf5e0f31fa5486bb9e7ce3e2ffa1b65f35cca21da369b71`
- **Kind:** **unstructured-to-entity** (primary); also a **disconfirmation** of the marketing claims in FC-6 (sirtuin activation, mitochondrial function).
- **Answers:** CQ-MX-01, CQ-MX-02, CQ-MX-03, Q-D2-01, Q-D2-03, Q-D2-04, Q-D2-06, Q-D2-13, Q-D2-16 (with FC-6), Q-D2-21, Q-D2-23, Q-D2-24, Q-D2-26.
- **Verbatim quotes:**
  1. Highlights, offset 3187–3265: "NR supplementation does not affect skeletal muscle mitochondrial bioenergetics"
  2. Results, section "Oral NR Augments the Skeletal Muscle NAD+ Metabolome", offset 10693–10891 **(norm)**: "we found that oral NR resulted in a 2-fold increase in muscle NAAD (NR 0.73 pmol/mg versus placebo 0.35 pmol/mg; p = 0.004), without an increase in NAD+ (NR 210 pmol/mg versus 197 pmol/mg; p = 0.22)"
  3. Results, "Three Weeks of Oral NR Does Not Alter Skeletal Muscle Mitochondrial Bioenergetics…", offset 20000–20175: "No differences were detected between the NR and placebo groups in skeletal muscle complex I- and complex II-mediated oxidative phosphorylation and maximal respiratory capacity"
  4. same section, offset 20866–21004: "we performed western blotting to assess pan-acetylation status, but again did not detect NR-mediated changes to muscle protein acetylation"
  5. Results, "Oral NR Depresses Circulating Levels of Inflammatory Cytokines", offset 29654–29843 **(norm)**: "NR significantly decreased the levels of the interleukins IL-6 (Figure 6A), IL-5 (Figure 6B), and IL-2 (Figure 6C) and tumor necrosis factor alpha (TNF-α) (Figure 6D), compared to baseline."
  6. Declaration of Interests, offset 61982–62117: "C.B. is the inventor of patents licensed by ChromaDex, owns stock in ChromaDex, and serves as an adviser to ChromaDex and Cytokinetics."
- **Design facts for the assertions stage (from the same capture):** abstract offset 2450–2577 **(norm)** "We supplemented 12 aged men with 1 g NR per day for 21 days in a placebo-controlled, randomized, double-blind, crossover trial." → evidence context: setting HUMAN_INTERVENTIONAL, species Homo sapiens, sex male, n 12, exposure 1 g/day ABSOLUTE_PER_DAY, oral, P21D, compartments skeletal muscle / whole blood / urine / serum.
- **Unstructured-to-entity path to demonstrate:** question CQ-MX-03 ("has NR's sirtuin step been measured in humans?") → chunk containing quote 4 (found by vector search or by MENTIONS of NR + acetylation) → Assertion {subject NR, predicate e.g. `modulates_activity` / object mechanism "sirtuin deacylation (proxy: protein acetylation)", polarity NULL, basis MEASURED} with evidence context above → SourceLocator TEXT_QUOTE (exact = quote 4, prefix/suffix from text, offsets 20866–21004 on the DocumentTextVersion) → SourceSnapshot (sha256 above) → Adjudication (directly_supported).

### FC-1b — Europe PMC text-mined annotations for the same article (MENTIONS projection demo)

- **URL:** https://www.ebi.ac.uk/europepmc/annotations_api/annotationsByArticleIds?articleIds=PMC%3A6702140&format=JSON
- **Title:** Europe PMC Annotations API — PMC6702140 (1,017 annotations)
- **Retrieved:** 2026-10-08 · **tool:** curl · **sha256:** `740de0f5570670c783f3a49a8dd815a658bc6904848982a50858f95902e6281e`
- **Kind:** supports the **unstructured-to-entity** fixture (derived MENTIONS; shows why mentions are never evidence).
- **Answers:** Q-D2-24, Q-D2-23.
- **Verbatim fragments (JSON values):**
  1. `"prefix": "show that oral", "exact": "nicotinamide riboside", … "tags": [{"name": "dihydrozeatin riboside", "uri": "http://purl.obolibrary.org/obo/CHEBI_80498"}]` (section "Abstract") — a wrong ChEBI link.
  2. `"prefix": "metabolomics showed that", "exact": "NR", "postfix": "elevated the muscle", "tags": [{"name": "NorRed", "uri": "https://www.uniprot.org/uniprotkb/A0A1A9TAK5/entry"}]` — a wrong protein link.
  3. `"prefix": "ents the Aged Human ", "exact": "Skeletal", "postfix": " Muscle NAD+ Metabol", "tags": [{"name": "skeleton", "uri": "http://purl.obolibrary.org/obo/UBERON_0004288"}]` — wrong anatomy.

## FC-2 — Pacholec 2010, resveratrol and STACs are not direct SIRT1 activators

- **URL:** https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=20061378&retmode=xml (landing https://pubmed.ncbi.nlm.nih.gov/20061378/)
- **Title:** SRT1720, SRT2183, SRT1460, and resveratrol are not direct activators of SIRT1. J Biol Chem 2010;285(11):8340-51. PMID 20061378 · PMCID PMC2832984 · DOI 10.1074/jbc.M109.088682
- **Retrieved:** 2026-10-08 · **tool:** curl → NCBI efetch (full text XML refused by publisher; Europe PMC fullText HTTP 500)
- **sha256 (PubMed XML):** `ef3a2a1ca835bfbcbdac6e1805d5488ca7757cf1d5f5d8e75f40211f7834a381` · tag-stripped text `401ab28892cc1d2de8ba401c3b7f7e742f344f065dde9db6f5bf197cdecc0e48`
- **Kind:** **disconfirmation** (mechanism step tested with native substrates and rejected; pairs with FC-10 KEGG and FC-9 GenAge narrative).
- **Answers:** Q-D2-05, Q-D2-17, Q-D2-25, CQ-MX-01, Q-D2-28.
- **Verbatim quotes (abstract):**
  1. offset 1184–1463: "SRT1720, its structurally related compounds SRT2183 and SRT1460, and resveratrol do not lead to apparent activation of SIRT1 with native peptide or full-length protein substrates, whereas they do activate SIRT1 with peptide substrate containing a covalently attached fluorophore."
  2. offset 1652–1787: "Furthermore, we demonstrate that SRT1720 neither lowers plasma glucose nor improves mitochondrial capacity in mice fed a high fat diet."
  3. offset 1930–2041: "Taken together, we conclude that SRT1720, SRT2183, SRT1460, and resveratrol are not direct activators of SIRT1."
- **Note:** setting IN_VITRO_CELL_FREE (biochemical assays, NMR/SPR/ITC) and IN_VIVO_MAMMAL (HFD mice). Authors at Pfizer — the asserter's affiliation is itself an investor-relevant fact (D7 seam).

## FC-3 — Konopka 2019, metformin blunts exercise-induced mitochondrial adaptation (harm)

- **URL:** https://www.ebi.ac.uk/europepmc/webservices/rest/PMC6351883/fullTextXML
- **Title:** Metformin inhibits mitochondrial adaptations to aerobic exercise training in older adults. Aging Cell 2019;18(1):e12880. PMID 30548390 · PMCID PMC6351883 · DOI 10.1111/acel.12880 · trial NCT02552355
- **Retrieved:** 2026-10-08 · **tool:** curl → Europe PMC REST
- **sha256 (raw JATS XML):** `0db6113a1389bb9e7a0be7cfb90008a02f725c1ad0573fb925ae8d0bb10e1b32` · tag-stripped text `a6838d40a419f6b18441f33ac5a69240565746520e5a5052ca99731c30ff367a`
- **Companion curated record:** https://www.ebi.ac.uk/chembl/api/data/mechanism.json?parent_molecule_chembl_id=CHEMBL1431 · sha256 `bc010bd9aac21551304d7bf334909658c6f843e3a023341cae655890b0670612` · offset 228–282: "Mitochondrial complex I (NADH dehydrogenase) inhibitor"
- **Kind:** **harm** (an intervention counteracts a beneficial adaptation via a measured mechanism step; relevant to biohackers stacking metformin with training).
- **Answers:** Q-D2-09, Q-D2-10, Q-D2-26, CQ-MX-02, Q-D2-08.
- **Verbatim quotes:**
  1. Abstract, offset 2778–2879 **(norm)**: "Metformin also abrogated the exercise-mediated increase in skeletal muscle mitochondrial respiration."
  2. Abstract, offset 3247–3459: "These data suggest that prior to prescribing metformin to slow aging, additional studies are needed to understand the mechanisms that elicit positive and negative responses to metformin with and without exercise."
  3. Methods (dosing paragraph), offset 39215–39379 **(norm)**: "The dose for both placebo and metformin was 500 mg/day the first week and increased by 500 mg each week until reaching 2000 mg/day (1,000 mg twice daily) by week 4."
  4. Results "Skeletal muscle mitochondrial respiration", offset 16339–16461: "Since a putative role of metformin is to inhibit complex I (CI), we used two protocols to assess mitochondrial respiration"
- **Design facts (abstract, PubMed MCP metadata):** placebo n = 26, metformin n = 27, 12 weeks AET, older adults 62 ± 1 years.

## FC-4 — NIA ITP: nicotinamide riboside does not extend lifespan (paper + DrugAge rows)

- **URL (paper):** https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=33788371,36599349&retmode=xml
- **Title:** 17-a-estradiol late in life extends lifespan in aging UM-HET3 male mice; nicotinamide riboside and three other drugs do not affect lifespan in either sex. Aging Cell 2021;20(5):e13328. PMID 33788371 · DOI 10.1111/acel.13328
- **Retrieved:** 2026-10-08 · **tool:** curl → NCBI efetch · **sha256 (XML, both PMIDs):** `40f9a5ca6cff43badcd6a7d74ee2b51ba3c03412a39edb5e385240ddd615c758` · tag-stripped `a873f3f78cd60052b2688309f1f08d5e9f3d3066dff0688b62b14b5f7a2ab2cb`
- **URL (structured):** https://genomics.senescence.info/drugs/dataset.zip → `drugage.csv` (DrugAge Build 5) · **sha256 (csv):** `7ed9771440fa4e1e30be0d3c8e92d919254b572ab40c81e2440ba78c885401d4` · zip `d12f59717de60a207748f53bdbcdb484ed07e30d8608eb8e4a101e2a08d7fa80` · tool curl
- **Kind:** **disconfirmation** (robust multi-site mouse lifespan null for a compound whose mechanism story predicts benefit).
- **Answers:** Q-D2-07, CQ-MX-03, Q-D2-26, Q-D2-06.
- **Verbatim quotes:**
  1. Abstract, offset 834–995: "Despite some data suggesting that nicotinamide riboside would be effective, neither it nor the other three increased lifespans significantly at the doses tested."
  2. drugage.csv header, offset 0–250: "compound_name,species,strain,dosage,age_at_initiation,treatment_duration,avg_lifespan_change_percent,avg_lifespan_significance,max_lifespan_change_percent,max_lifespan_significance,gender,weight_change_percent,weight_change_significance,ITP,pubmed_id"
  3. drugage.csv row, offset 294403–294517: "Nicotinamide riboside,Mus musculus,UM-HET3,1000 ppm food,8 months,until death,0,NS,2,NS,Female,-14,NA,Yes,33788371"
  4. drugage.csv row, offset 294518–294631: "Nicotinamide riboside,Mus musculus,UM-HET3,1000 ppm food,8 months,until death,-3,NS,-3,NS,Male,-5,NA,Yes,33788371"
- **Note:** exposure basis DIET_CONCENTRATION (1000 ppm) — not comparable to a human mg/day dose without a stated conversion (INV-203).

## FC-5 — Reactome "Nicotinate metabolism" + ChEMBL sirolimus mechanism (curated reference records)

- **URL A:** https://reactome.org/ContentService/data/query/R-HSA-196807 · **title:** Reactome pathway "Nicotinate metabolism" (R-HSA-196807.8, Homo sapiens, review status "five stars") · retrieved 2026-10-08 · tool curl · **sha256:** `dcb9f006696da212347945542f2ec9cf20e2afa337efdb99e4c147e5f024ed19`
  - participants: https://reactome.org/ContentService/data/participants/R-HSA-196807/referenceEntities · sha256 `6fb2fb339bd8eee2fd9f906453297b7ae3cbfc09f33e645e18fda9be2032d395`
- **URL B:** https://www.ebi.ac.uk/chembl/api/data/mechanism.json?molecule_chembl_id=CHEMBL413 · **title:** ChEMBL mechanism record for SIROLIMUS (CHEMBL413) · retrieved 2026-10-08 · tool curl · **sha256:** `d489e4f77fbebff09c1fe6e46dadbb980c95786cfcb48da7a2398659fe26d1fe`
- **Kind:** **reference** (structural, versioned authority records; no evidence of a compound effect in people).
- **Answers:** Q-D2-08, Q-D2-11, Q-D2-02, Q-D2-19, CQ-MX-05.
- **Verbatim quotes:**
  1. A, `summation[0].text`, offset 7238–7449: "Nicotinate (niacin) and nicotinamide are precursors of the coenzymes nicotinamide-adenine dinucleotide (NAD+) and nicotinamide-adenine dinucleotide phosphate (NADP+), essential cofactors in many redox reactions."
  2. A, offset 75–105: `"stIdVersion":"R-HSA-196807.8"`
  3. B, offset 181–240: `"mechanism_of_action": "FK506-binding protein 1A inhibitor"`
  4. B, offset 17–43 and 642–674: `"action_type": "INHIBITOR"` … `"target_chembl_id": "CHEMBL1902"`
- **Note:** ChEMBL's curated first step for sirolimus is FKBP1A binding, while Reactome/KEGG/marketing talk about mTOR inhibition — a two-step chain, a good test of whether the model can hold "compound → molecular target → pathway" without a MechanismChain node.

## FC-6 — Elysium Basis product page (mechanism claims in marketing)

- **URL:** https://www.elysiumhealth.com/en-us/basis
- **Title:** Elysium Health — Basis (NAD+ Supplement for Cellular Aging) product page
- **Retrieved:** 2026-10-08 · **tool:** Firecrawl CLI `firecrawl scrape --format markdown --only-main-content` (scrape id 01a11d4b-f674-729f-b5d8-8906b456bbf1)
- **sha256 (markdown):** `42fbd69b1ea2a91f9900c6721bff44a6776ccf1c13d27c1a8cbe50d4e8116b51`
- **Kind:** **harm** / **disconfirmation** target: mechanism claims with no species, compartment or exposure; when joined with FC-1 the sirtuin and mitochondrial steps are measured-null in human muscle.
- **Answers:** CQ-MX-01, CQ-MX-04, Q-D2-01, Q-D2-05, Q-D2-16, CQ-MX-05.
- **Verbatim quotes:**
  1. offset 6754–6931: "The potent combination of NR and pterostilbene in Basis is designed to increase NAD+ levels and counter the decrease in the activity of sirtuins, which occurs with normal aging."
  2. offset 8758–8931: "Boosted NAD+ activates sirtuins, supports cellular energy and metabolism, targets cellular aging to promote a healthy cellular aging process, and helps maintain healthy DNA."
  3. offset 10837–11014: "You can expect support for increased cellular energy, improved mitochondrial function, housekeeping for your proteome and genome, and cellular protection from everyday stressors"
  4. offset 11349–11443: "If you had all the gear for NAD+ analysis from whole-blood lysate, you could see for yourself."
- **Note:** page versions in place (D6/D9 change tracking); the ClaimOccurrence asserter is the organization (D7), the cited trial is a D3 seam.

## FC-7 — Hickson 2019, dasatinib + quercetin reduce senescent cells in human adipose tissue (D2 → D4 path)

- **URL:** https://www.ebi.ac.uk/europepmc/webservices/rest/PMC6796530/fullTextXML · registry https://clinicaltrials.gov/api/v2/studies/NCT02848131
- **Title:** Senolytics decrease senescent cells in humans: Preliminary report from a clinical trial of Dasatinib plus Quercetin in individuals with diabetic kidney disease. EBioMedicine 2019;47:446-456. PMID 31542391 · PMCID PMC6796530 · DOI 10.1016/j.ebiom.2019.08.069 · NCT02848131
- **Retrieved:** 2026-10-08 · **tool:** curl → Europe PMC REST; curl → ClinicalTrials.gov API v2
- **sha256 (JATS XML):** `082579b077477d9807f52160acc1b39d64ab9f5571aead17aba7c1c613ed9fc8` · tag-stripped `395c53fd64f2584f9c3a8e519f7a378c06d2e46eca3caf1b56381a430a7a7529` · registry JSON `43a4e7a23925156c9a04dfd25f288943d23e180e4f0fe1918bbe5f7276b404d5`
- **Kind:** **seam** (compound → mechanism → biomarker → test in one source; coordinate with D4) and a measured human mechanism step.
- **Answers:** Q-D2-03, Q-D2-22, Q-D2-02, Q-D2-06, CQ-MX-02.
- **Verbatim quotes:**
  1. Abstract (methods), offset 3263–3395 **(norm)**: "In an open label Phase 1 pilot study, we administered 3 days of oral D 100 mg and Q 1000 mg to subjects with diabetic kidney disease"
  2. Abstract (findings), offset 3709–3953 **(norm)**: "D + Q reduced adipose tissue senescent cell burden within 11 days, with decreases in p16INK4A-and p21CIP1-expressing cells, cells with senescence-associated β-galactosidase activity, and adipocyte progenitors with limited replicative potential."
  3. Registry, primary outcome measure (JSON `outcomesModule.primaryOutcomes[0].measure`): "Change in proportion of senescent cells (representing the total senescent cell burden) present"
- **Path:** dasatinib + quercetin (D1) → cellular senescence (D2, GO:0090398) → p16INK4A+/p21CIP1+ cell counts, SA-β-gal, circulating SASP factors IL-1α, IL-6, MMP-9/-12 (D4 biomarkers) → immunohistochemistry / SA-β-gal staining on adipose and skin biopsy, plasma assays (D4 methods).

## FC-8 — Jinfiniti Intracellular NAD® Test product page (D4/D6 seam; risk framing)

- **URL:** https://www.jinfiniti.com/product/intracellular-nad-test
- **Title:** Intracellular NAD® Test: At-Home NAD+ Test Kit
- **Retrieved:** 2026-10-08 · **tool:** Firecrawl CLI scrape (scrape id 01a11d4e-1d9b-765d-94e9-a321215711d9) · **sha256:** `edb294193347b80e72a64f5cf58eb2a9b419829e0982eeff43687b66255659b5`
- **Kind:** **seam** (the "test" end of the compound → mechanism → biomarker → test path) with a **harm**-adjacent claim (overdosing).
- **Answers:** Q-D2-03, Q-D2-04.
- **Verbatim quotes:**
  1. offset 3925–4051: "This is the first-to-market, most trusted, CLIA-certified, and only reliable at-home test that measures NAD+ inside your cells"
  2. offset 5080–5113: "How to avoid potential overdosing"
  3. offset 5414–5472: "An estimated 2–3% may be taking more NAD+ than they need"
- **Note:** D4 owns the test/method; D6 owns the offer ($198 single test on the page). D2 needs only the biomarker the test measures (whole-blood intracellular NAD+) to close the path.

## FC-9 — GenAge human entry SIRT1 (curated aging-gene narrative with built-in disconfirmation)

- **URL:** https://genomics.senescence.info/genes/entry.php?hgnc=SIRT1
- **Title:** The SIRT1 gene and its putative association with human ageing (GenAge, HAGRID 150; build 21, 28/08/2023)
- **Retrieved:** 2026-10-08 · **tool:** curl (HTML) → tag-stripped text · **sha256 (HTML):** `25258525786d32b5fa9fd2a52550710ce4c97d9581b9267a43d15b8c9a248e09` · text `933a396731ec9908f5bd0461545859353c6e6e20ca5188642faa9468208daf40`
- **Kind:** **reference** with **disconfirmation** content.
- **Answers:** Q-D2-20, Q-D2-11, Q-D2-25, CQ-MX-06.
- **Verbatim quotes (offsets in the tag-stripped text):**
  1. offset 3570–3748: "Increasing the levels of SIRT1 homologues in fruit flies [ 1284 ] and roundworms [ 199 ] extends lifespan, although these findings have been questioned by other studies [ 3321 ]."
  2. offset 4693–4815: "Overall, whole-body moderate overexpression of Sirt1 improves healthy ageing but does not increase mice lifespan [ 3266 ]."

## FC-10 — KEGG hsa04211 "Longevity regulating pathway" (curated reference that asserts a contested step)

- **URL:** https://rest.kegg.jp/get/hsa04211
- **Title:** Longevity regulating pathway - Homo sapiens (human)
- **Retrieved:** 2026-10-08 · **tool:** curl → KEGG REST · **sha256:** `29c83f0fe919a156cbac6685c418c5154730644d6d223a06cc616a60b7f39778`
- **Kind:** **disconfirmation** counterpart to FC-2 (the reference assertion that FC-2 rejects). **Licence caveat:** KEGG REST is "made available only for academic use by academic users"; use as a cited reference in a fixture only if the owner accepts that; otherwise substitute the GenAge narrative (FC-9).
- **Answers:** Q-D2-05, Q-D2-25.
- **Verbatim quotes:**
  1. DESCRIPTION, offset 902–1206: "there is evidence supporting that life span extension can be achieved with pharmacologic agents that mimic the effects of caloric restriction, such as rapamycin, via mTOR signaling blockade, resveratrol, by activating SIRT1 activity, and metformin, which seems to be a robust stimulator of AMPK activity."
  2. offset 1327–1364: "CLASS       Organismal Systems; Aging"

## FC-11 — UNITY Biotechnology UBX0101 Phase 2 press release (investor disconfirmation)

- **URL:** https://www.globenewswire.com/news-release/2020/08/17/2079116/0/en/unity-biotechnology-announces-12-week-data-from-ubx0101-phase-2-clinical-study-in-patients-with-painful-osteoarthritis-of-the-knee.html
- **Title:** UNITY Biotechnology Announces 12-week data from UBX0101 Phase 2 Clinical Study in Patients with Painful Osteoarthritis of the Knee (2020-08-17)
- **Retrieved:** 2026-10-08 · **tool:** Tavily CLI `tvly extract --format markdown` (raw_content saved) · **sha256:** `0af2bf0b04cfec332697b1938c4c7c4070adabc6b9836beaf5d23fa6f3fbe00a`
- **Kind:** **disconfirmation** (clinical readout against a senolytic mechanism thesis); primarily D13/D3, used by D2 for Q-D2-17.
- **Answers:** Q-D2-17, Q-D2-27.
- **Verbatim quote:** offset 705–896: "There was no statistically significant difference between any arm of UBX0101 and placebo at the 12-week endpoint for change from baseline in WOMAC-A, an established measurement of pain in OA."

## FC-12 — Hallmarks of aging 2023 (vocabulary source)

- **URL:** https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=33788371,36599349&retmode=xml (same capture as FC-4)
- **Title:** Hallmarks of aging: An expanding universe. Cell 2023;186(2):243-278. PMID 36599349 · DOI 10.1016/j.cell.2022.11.001
- **Retrieved:** 2026-10-08 · **tool:** curl → NCBI efetch · **sha256:** `40f9a5ca6cff43badcd6a7d74ee2b51ba3c03412a39edb5e385240ddd615c758`
- **Kind:** **reference** (seeds a small hallmark vocabulary).
- **Answers:** Q-D2-12, Q-D2-02.
- **Verbatim quote:** offset 17529–17866 (tag-stripped text): "We propose the following twelve hallmarks of aging: genomic instability, telomere attrition, epigenetic alterations, loss of proteostasis, disabled macroautophagy, deregulated nutrient-sensing, mitochondrial dysfunction, cellular senescence, stem cell exhaustion, altered intercellular communication, chronic inflammation, and dysbiosis."
