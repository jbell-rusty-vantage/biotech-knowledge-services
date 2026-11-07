# D1 — ecosystem survey: compounds and ingredients

Stage: RESEARCH (Wave 1), agent A2, 2026-10-08. Scope per brief: what a consumer supplement (and, through the D12 seam, a food or exposure) is made of — chemical substances and their forms (salts, esters, hydrates, crystal forms), branded ingredient materials and their suppliers, botanical preparations, microbial strains and counts, nutrients, constituents, and declared amounts — from label text to chemical identity.

**Citation convention.** Every factual claim carries a key `[Sn]`; the key resolves in "Sources" at the end to `URL · title · retrieval date`. All sources were retrieved on 2026-10-08 by this stage (tool per source in `_notes/tool-log.md`). Numbers marked **(calc)** are BellLabs calculations from cited inputs, shown so the model stage can see what a *derived* Assertion would hold; they are never source declarations. Research is not medical advice.

---

## 1. The core finding in one paragraph

The same chemical thing is named and quantified on at least four different bases across the ecosystem, and every actor silently picks one: the **salt or ester as weighed** (US Supplement Facts "Nicotinamide Riboside Chloride 300 mg" [S1]), the **active moiety** (Health Canada licences declare "Nicotinamide riboside 263.0 mg" with source material "Nicotinamide riboside chloride" for the same 300 mg product line [S30]), the **nutrient-as-nutrient equivalent** (US label "Vitamin B6 34 mg" beside "Pyridoxal 5-Phosphate 50 mg" [S5]; TGA states that Australian ARTG PDF summaries give B6 "as the equivalent amount of pyridoxine" [S39] — TGA's description; no ARTG PDF was read), and the **branded material** ("Niagen 300 mg" with the salt as a form [S1]). Identity authorities agree on structure but disagree on what the *equivalence* basis is: FDA GSRS names nicotinamide riboside (cation) as the active moiety of the chloride [S13], but names pyridoxal phosphate as its *own* active moiety, not pyridoxine [S16] — so "vitamin B6 equivalents" is a nutrition convention, not a chemistry relation. Regulators set harm thresholds on the equivalent basis ("per recommended daily dose of vitamin B6" [S39]). A schema that cannot hold *declared basis* separately from *derived equivalent* will both mis-rank products and mis-answer the harm questions.

---

## 2. Actors, grouped by type

### 2.1 Identity authorities for substances (science lens; agent-ready)

| actor | what they do (process / operation) | artifacts | capturable? agent-ready? |
| --- | --- | --- | --- |
| **FDA Global Substance Registration System (GSRS / UNII)**, run with NCATS | Registers substances at the granularity of a defined structure including counter-ions (a salt and its free base are separate records), assigns UNIIs, curates typed relationships between records: `ACTIVE MOIETY`, `SALT/SOLVATE->PARENT`, `PARENT->SALT/SOLVATE`, `SOLVATE->ANHYDROUS`, `IONIC MOIETY`, `CONSTITUENT ALWAYS PRESENT->PARENT`, `METABOLITE ACTIVE->PARENT` [S13][S14][S15][S16][S17][S18]. Each record carries a `version` (NR chloride at version 18, NR at version 24) [S13][S14]. Also registers "structurally diverse" substances such as plant parts ("WITHANIA SOMNIFERA ROOT", parent "WITHANIA SOMNIFERA WHOLE", part "root") [S18]. | Substance record (JSON): names with types, codes (CAS, PubChem, ChEBI, DrugBank, GRAS notice number, NCI Thesaurus, DSLD count), structure (formula, mwt, charge, SMILES, stereochemistry), moieties, relationships, definitionLevel [S13]. | Yes, keyless JSON API; readiness 3. The cross-reference code `DSLD=11 (Number of products:1393)` on the ashwagandha root record shows GSRS itself links substance identity to the label database [S18]. |
| **NCBI PubChem** | Aggregates depositor records into compounds (CID) with computed properties; resolves names and synonyms to CIDs. | Compound property table (formula, MW, exact mass, InChIKey, IUPAC name, charge) [S19]; synonym list (NR chloride's includes "Niagen", "SRT647;NIAGEN", the UNII, CAS, ChEBI ids) [S20]. | Yes, keyless PUG REST; readiness 3 for structure, **unsafe for label names**: the name "Niagen" resolves to CID 439924, the cation, although Niagen is the chloride salt; the name "vitamin B6" resolves to CID 104817, a single phosphate dianion structure (C8H10NO5P-2) titled "Vitamin B6" [S21][S22]. |
| **EBI ChEBI** | Curated chemical ontology (roles, classes) with star rating. | Entity record: name "N-ribosylnicotinamide", definition, 3 stars, synonyms with their source (KEGG, ChemIDplus) [S23]. | Yes, keyless; readiness 3. |
| **CAS Common Chemistry** | CAS Registry Number lookup. | Substance detail. | API returned HTTP 401 without a key [S24]; CAS RNs are available as codes inside GSRS and PubChem records [S13][S20]. Readiness 1. |
| **NCBI Taxonomy** | Taxa for botanical sources and microbes, with ranks, lineage and synonym names. | Taxon record: `Lacticaseibacillus rhamnosus GG`, rank `strain`, parent 47715, lineage through `Lacticaseibacillus`, synonyms `Lactobacillus rhamnosus ATCC 53103`, `Lactobacillus rhamnosus LMG 18243` [S25]; `Withania somnifera`, rank species, common name ashwagandha, taxid 126910 [S26]. | Yes; readiness 3, but culture-collection deposits are only synonym strings [S25]. |
| **Culture collections (ATCC, LMG, DSMZ)** | Hold strain deposits that anchor strain identity. | Catalog pages. | The guessed ATCC URL `/products/53103` returned a 404 page [S46] (still 404 in the adversarial review), but the catalog is reachable through search: ATCC BAA-3227 is "an ATCC manufactured and accessioned progeny of 53103" (L. rhamnosus GG) [S48]. Deposit pages are not at `/products/{deposit number}` for every strain. Readiness 1 (scrape-only, catalog search). |
| **Taxonomists (IJSEM)** | Rename genera, which changes label names without changing strains. | Zheng et al. 2020 reclassified the genus *Lactobacillus* into 25 genera including *Lacticaseibacillus* [S27] (PMID 32293557, DOI 10.1099/ijsem.0.004107). | Abstract via Europe PMC; not OA [S27]. |

### 2.2 Label and licence registries (government; the main "what is in it" sources)

| actor | process | artifacts | capturable? |
| --- | --- | --- | --- |
| **NIH Office of Dietary Supplements — Dietary Supplement Label Database (DSLD)** | Transcribes US supplement labels into structured records; links label versions ("Package size difference, same product", "Image difference, same product") [S1]; maps ingredients to groups and UNIIs. | Label record (see artifact A below) [S1]–[S12]; search API [S4]. The JAMA melatonin study used DSLD to sample products: "products formulated as gummies with “melatonin” on the label were identified in the National Institutes of Health’s Dietary Supplement Label Database" [S38]. | Yes, keyless JSON; readiness 3. Data defects: UNII missing or sentinel `"0"` [S2][S11]; CFU counts only in notes [S9]. |
| **Health Canada — Licensed Natural Health Products Database (LNHPD)** | Licenses natural health products with a medicinal-ingredient table that separates the ingredient (moiety or herb), its quantity, its **source material**, extract ratio and dried-herb equivalent. | Medicinal ingredient rows (artifact D) [S28]–[S32]; purpose and risk text [S34]; product licence dump (307,186 rows, 148 MB) [S33]. | Yes, keyless; per-id endpoints readiness 3, product search only via bulk download (readiness 2). |
| **Australian TGA — ARTG** | Lists/registers medicines; according to TGA, ARTG PDF summaries "state how much is in the medicine as the equivalent amount of pyridoxine" for vitamin B6 [S39] (secondary: TGA describing its own register; no ARTG PDF was fetched in any stage). | ARTG PDF summary (not fetched). | To be scored by D8/D11. |
| **US FDA (labeling law)** | 21 CFR 101.36 defines how amounts are declared: the quantity of an "other dietary ingredient" "shall be the weight of the other dietary ingredient listed and not the weight of any component, or the source, of that dietary ingredient"; for an extract with solvent removed "the weight of the ingredient shall be the weight of the dried extract"; a source ingredient "may be identified … preceded by the words “as” or “from”, e.g., “Calcium (as calcium carbonate)”"; botanicals "shall specify the part of the plant" [S35]. | eCFR section XML with point-in-time URL [S35]. | Yes (eCFR versioner API needs `--compressed`); readiness 3. |
| **ClinicalTrials.gov** (D3 owns) | Registers trial interventions by name. | NCT02712593 lists interventions "Niagen™ 100/300/1000" of type DIETARY_SUPPLEMENT with null arm descriptions and no dose basis or material grade [S37]. | Yes; readiness 3 for access, poor for material identity. |

### 2.3 Regulators and safety monitors (harm lens)

| actor | process | artifacts (what we read) |
| --- | --- | --- |
| **TGA (Australia)** — vitamin B6 | Scheduling decision on vitamin B6 by dose per recommended daily dose: ≤ 50 mg general sale; > 50 to ≤ 200 mg pharmacist-only from 1 June 2027; > 200 mg prescription [S39]. Label warning required since 1 March 2022 for daily doses "over 10 mg or equivalent" [S39]. Counted "at least 125 medicines … providing more than 50 mg but not more than 200 mg vitamin B6 per maximum recommended daily dose", 116 of them listed complementary medicines whose ARTG entries "will be cancelled" [S39]. As of 31 October 2025, 250 DAEN reports of peripheral neuropathy terms for products containing vitamin B6 [S39]. Names three B6 forms on the Australian market: pyridoxine hydrochloride, pyridoxal 5-phosphate, pyridoxal 5-phosphate monohydrate [S39]. | Safety update page (Medicine Safety Update) [S39]. |
| **TGA** — ashwagandha | Safety review of *Withania somnifera* and liver injury: 11 possible liver-injury cases reported to TGA; withanolide composition "can vary depending on whether the leaf or root part has been used"; "the extraction method and extraction ratio influence the composition"; avoid in existing liver disorders [S40]. Points to primaries: Philips et al. 2023 case series (PMID 37756041), Lareb alerts 2023/2025, RIVM report 2024-0029, India FSSAI advisory of 16 April 2026 on non-use of ashwagandha **leaves** in food, and the Ministry of Ayush safety dossier 2.0 that found "no evidence of intrinsic liver toxicity" [S40]. | Safety update page [S40]. Plant part and preparation are harm-relevant properties, and the regulators themselves disagree (TGA vs Ayush dossier) [S40]. |
| **NIH ODS** | Fact sheets with intake reference values: the vitamin B6 UL for adults 19+ is 100 mg [S41]; "chronic administration of 1–6 g oral pyridoxine per day for 12–40 months can cause severe and progressive sensory neuropathy" [S41]; vitamin B6 "is the generic name for six compounds (vitamers)" [S41]. | Health-professional fact sheet [S41]. |
| **US FDA** — NMN status (D8 owns) | Niagen Bioscience's FY2025 10-K states: "In September 2025, the FDA determined that nicotinamide mononucleotide (NMN) may be lawfully marketed as a dietary ingredient" [S43]. The FDA letter itself was not captured in this stage (D8). | 10-K risk factor [S43]. |

### 2.4 Branded-ingredient owners and material suppliers (economics lens)

| actor | what we can establish | artifacts |
| --- | --- | --- |
| **Niagen Bioscience, Inc.** (formerly ChromaDex; CIK 1386570) | Describes "food-grade Niagen®, a proprietary form of nicotinamide riboside chloride (“NRC” or “NRCL,” commonly referred to as “NR”)" and, since 2024, products featuring "pharmaceutical-grade Niagen®" [S43]. Relies on "a single supplier, W.R. Grace, for NRC" [S43]; "Grace holds patents related to the crystalline form of NR chloride that provide Grace with exclusive manufacturing rights for certain forms of NRCL" [S43]; supply agreement effective 1 April 2025 with an initial term through 30 April 2029 [S43]. Total ingredient sales "increased by $8.9 million, or 45%, compared to 2024" [S43]. | 10-K (EDGAR) [S43][S44]; trademark statements on labels: "Niagen and TRU Niagen are trademarks of ChromaDex, Inc." [S1]; third-party brands state "Niagen is the trademark of Chromadex, Inc." [S2]. |
| **W.R. Grace & Co.-Conn.** | Exclusive manufacturer of NRCL for Niagen Bioscience; owns crystal-form patents (as stated by Niagen Bioscience) [S43]. | Only via the customer's filing in this stage. |
| **Ixoreal Biomed** (KSM-66) | "KSM-66 is a registered trademark of Ixoreal Biomed Private Limited" (as printed on a third-party label) [S12]. The KSM-66 page describes "a high-concentration, full-spectrum, root-only ashwagandha extract" produced "without using alcohol or any other chemical solvent", and says "the price of leaves is often less than 1/15th the price of roots" [S42]. Domain ownership of `ksm66ashwagandhaa.com` was not independently verified in this stage. | Supplier marketing page [S42]; label notes "organic, min. 5% total withanolides, less than 0.1% withaferin A" [S11]. |
| **Chr. Hansen / DSM** (LGG, Culturelle) | Label: "Culturelle is a trademark of DSM. LGG & LGG logo are trademarks of Chr. Hansen A/S." [S9]. | DSLD label statements [S9][S10]. |
| **Sabinsa** (BioPerine) | Label: "BioPerine is a trademark of Sabinsa Corporation." with "min. 95% piperine" [S11]. | DSLD label [S11]. |
| Not surveyed in this stage (named in the brief) | Elysium, Kaneka, Lonza, Indena, Gnosis; USP monographs; EFSA botanical compendium; Phenol-Explorer; FoodData Central (D12 owns food composition). | Gap: listed for the fixtures/model stage only if a question needs them. |

### 2.5 Finished-product brands (D6 owns the product; D1 consumes their ingredient statements)

Tru Niagen (ChromaDex) [S1]; Pure Encapsulations NR Longevity [S2]; SuperSmart Nicotinamide Riboside Chloride 125 mg [S3]; Country Life P-5-P 50 mg [S5]; EuroMedica Magnesium + P-5-P [S6]; KAL Magnesium Glycinate 400 [S7]; BulkSupplements.com Magnesium Glycinate [S8]; Culturelle Digestive Daily and Pro Strength [S9][S10]; Nutricost KSM-66 600 mg [S11]; Swanson Ultimate Ashwagandha 250 mg KSM-66 [S12]. The DSLD search for "nicotinamide riboside chloride" reports 50 matching labels; its first page of 25 hits spans 11 brand-name strings (Thorne and Thorne Research counted separately), including Life Extension, Blueprint Bryan Johnson, Renue By Science, Xtendlife and Mindbodygreen [S4].

### 2.6 Researchers and analytical testers (science + disconfirmation)

- **Sponsor-affiliated trial authors.** Conze, Brenner, Kruger 2019 (Sci Rep; PMID 31278280; PMCID PMC6611812; DOI 10.1038/s41598-019-46120-z) report doses as "100 mg, 300 mg, 1000 mg NR per day" while the capsule "consisted of 100 mg or 250 mg of NR chloride (99% purity)" and "1000 mg NR (4 capsules containing 250 mg NR)" [S36] — i.e. the paper's "NR" doses are NR-chloride masses. The paper registers the trial as "NCT0271593" [S36], an id that returns 404 at ClinicalTrials.gov; the registry record is NCT02712593 [S37]. Two of the three authors list the affiliation "Chromadex Spherix Consulting" [S36].
- **Independent analytical testing.** Cohen et al. 2023 (JAMA; PMID 37097362; PMCID PMC10130950; DOI 10.1001/jama.2023.2296) measured 25 melatonin gummy products: "the actual quantity of melatonin ranged from 74% to 347% of the labeled quantity", "Twenty-two of 25 products (88%) were inaccurately labeled", and declared CBD measured "104% to 118% of the labeled quantity"; limitation: "only 1 sample of each brand was analyzed" [S38].

### 2.7 Community and trade discourse (community lens)

- Biohacker discussion of label bases (elemental vs compound magnesium) exists on Reddit: a Tavily search surfaced a r/Supplements thread titled "Confused by label" [S47], but its content could not be fetched by Tavily extract, Firecrawl ("we do not support this site") or curl (HTTP 403) [S47]. **Readiness finding**: the community lens for D1 is not reachable with the current CLI stack; D9/D11 own the fix (official Reddit API or the browser fallback).
- Trade press and trade associations relay regulatory changes on compound status (e.g. NMN) and are secondary pointers to FDA primaries (D8) [S43 for the company statement; trade sources not used as evidence].

### 2.8 AI and agent tooling (AI lens)

Observed in this session (tool-log rows cited): DSLD, GSRS, PubChem, ChEBI, NCBI Taxonomy, LNHPD per-id, eCFR, Europe PMC and EDGAR are all keyless or identity-header JSON/XML APIs and are agent-ready for *access*. What is not agent-ready is **identity resolution across them**: name→CID resolution silently returns the moiety for a salt brand name and a single structure for a nutrient concept [S21][S22]; DSLD UNIIs are missing or sentinel-valued on some rows [S2][S11]; DSLD maps "Ashwagandha Root Extract" to UNII V038D626IF, which GSRS defines as the root ("WITHANIA SOMNIFERA ROOT"), not an extract [S11][S18]; strain deposits live in taxonomy synonym strings [S25]; registry intervention names are brand strings with no form or basis [S37]. The custom tooling we need is a **resolver that returns (substance, form, basis) triples with the authority record version**, not a name→id lookup.

---

## 3. Artifact interviews (≥ 2 real instances each, read end to end)

### A. US supplement label record (NIH DSLD v9 `label/{id}`) — 11 instances read

Instances: 323170 Tru Niagen 300 mg [S1]; 313541 NR Longevity [S2]; 222934 SuperSmart NRC 125 mg [S3]; 326829 Country Life P-5-P 50 mg [S5]; 309443 EuroMedica Magnesium + P-5-P [S6]; 255079 KAL Magnesium Glycinate 400 [S7]; 310750 BulkSupplements Magnesium Glycinate [S8]; 250851 and 273846 Culturelle [S9][S10]; 306237 Nutricost KSM-66 [S11]; 191089 Swanson KSM-66 [S12].

Fields (top level): `id`, `src` (DSLD raw path with ingest date), `fullName`, `brandName`, `brandIpSymbol`, `bundleName`, `upcSku`, `productVersionCode`, `pdf`, `thumbnail`, `servingsPerContainer`, `servingSizes[]` (`minQuantity`, `maxQuantity`, `minDailyServings`, `maxDailyServings`, `unit`, `inSFB`), `netContents[]`, `physicalState` (LanguaL code), `productType` (LanguaL), `targetGroups[]`, `userGroups[]` (DV target group), `claims[]` (LanguaL), `statements[]` (`type`, `notes`: directions, precautions, storage, FDA disclaimer, seals, brand IP statement, statement of identity), `contacts[]` (role "Distributor", address), `labelRelationships[]` (`type`, `labelId`), `events[]`, `entryDate`, `offMarket`, `percentDvFootnote`, `hasOuterCarton`, `nhanesId`.
Ingredient row fields: `order`, `ingredientId`, `name`, `category` (vitamin, mineral, botanical, bacteria, blend, other…), `ingredientGroup`, `uniiCode`, `alternateNames[]`, `notes`, `quantity[]` (`servingSizeOrder`, `operator` "=" or "<", `quantity`, `unit`, `dailyValueTargetGroup[]` with `percent` and `footnote`), `forms[]` (`prefix` e.g. "as", `name`, `uniiCode`, `ingredientGroup`, `percent`), `nestedRows[]`; `otheringredients.ingredients[]`.

What the instances teach:
- **Branded material as the row, salt as the form.** Tru Niagen: row `name` "Niagen", `ingredientGroup` "Vitamin B3 (Nicotinamide riboside)", 300 mg, `forms[0]` "Nicotinamide Riboside Chloride" UNII 8XM2XT8VWI, DV "Daily Value not established" [S1]. Pure Encapsulations declares the salt directly as the row ("Nicotinamide Riboside Chloride" 300 mg, `uniiCode` null) and names Niagen only in the trademark statement [S2]. SuperSmart's product name says "125 mg" while the row is 250 mg per 2-capsule serving [S3].
- **Nutrient-as-nutrient vs listed ingredient on one label.** Country Life: "Vitamin B6" 34 mg (2000% DV, UNII KV2JZ1BI6Z = pyridoxine) with form Pyridoxal 5-Phosphate, *and* a second row "Pyridoxal 5-Phosphate" 50 mg [S5]; 50 mg × (169.18/247.14) = 34.2 mg pyridoxine **(calc)** from GSRS molecular weights [S15][S16], so the label's nutrient amount is a pyridoxine-equivalent the brand computed.
- **Max recommended daily dose is a product of fields.** EuroMedica: B6 10 mg per capsule, "may be taken up to 4 times daily" (`maxDailyServings` 4) [S6] → 40 mg/day at maximum **(calc)**; Tru Niagen `maxDailyServings` 3 → 900 mg NR chloride/day **(calc)** [S1]. The TGA thresholds are defined on exactly this quantity [S39].
- **Elemental vs compound.** KAL "Magnesium Glycinate 400": row "Magnesium" 400 mg (95% DV) "as Magnesium Glycinate"; the product name's "400" is the elemental amount [S7]. BulkSupplements: serving 1250 mg powder, "Magnesium" 225 mg (18% of the serving mass) "as Magnesium Glycinate" [S8]; magnesium in PubChem's "Magnesium Glycinate" (C4H8MgN2O4, MW 172.42) is 14.1% by mass **(calc)** [S22] — a stoichiometry check a derived Assertion can flag, not a fact about the product.
- **Microbes: mass declared, count in notes.** Culturelle Digestive Daily and Pro Strength both declare "Lactobacillus rhamnosus GG" 40 mg; counts "10 billion CFUs" and "12 billion CFUs" appear only in `notes` [S9][S10]; no deposit number on either label; the old genus name is used [S9][S25][S27].
- **Botanicals: standardization in notes; UNII granularity mismatch.** Nutricost "KSM-66" 600 mg, notes "organic, min. 5% total withanolides, less than 0.1% withaferin A", form "Ashwagandha Root Extract" mapped to UNII V038D626IF, row `uniiCode` "0" [S11]; Swanson records plant part and genus/species only in notes [S12]. The Nutricost label says "Contains: Milk." [S11].

### B. Substance authority record (FDA GSRS, `substances({UNII})?view=full`) — 6 instances read

Instances: 8XM2XT8VWI NR chloride [S13]; 0I8H2M0L7N NR [S14]; KV2JZ1BI6Z pyridoxine [S15]; F06SGE49M6 pyridoxal phosphate anhydrous [S16]; 68Y4CF58BV pyridoxine hydrochloride [S17]; V038D626IF Withania somnifera root [S18].
Fields: `uuid`, `approvalID` (UNII), `substanceClass` (chemical, structurallyDiverse), `status`, `version`, `definitionType`, `definitionLevel`, `names[]` (`name`, `type`, `displayName`, languages), `codes[]` (`codeSystem`, `code`, `type`), `structure` (`formula`, `mwt`, `charge`, `stereochemistry`, `smiles`), `moieties[]` (`formula`, `mwt`, `count`, `charge`), `relationships[]` (`type`, `relatedSubstance.refPname`, `approvalID`), `structurallyDiverse` (`part`, `sourceMaterialType`, `parentSubstance`), audit fields (`created`, `lastEdited`).
What they teach: salt formula "C11H15N2O5.Cl", mwt 290.7006; moiety record mwt 255.2476, charge 1 [S13][S14] → mass ratio 0.8780 **(calc)**; GSRS normalizes the moieties of the salt record into neutral pieces (C11H14N2O5 mwt 254.2397 + ClH 36.4609) [S13], so "moiety MW" differs by authority view (255.25 PubChem/GSRS moiety record vs 254.24 inside the salt record) — the derivation rule must name which record it used. Pyridoxal phosphate's ACTIVE MOIETY is itself [S16] while pyridoxine hydrochloride's is pyridoxine [S17]; pyridoxine carries a `PARENT->CONSTITUENT ALWAYS PRESENT -> BROCCOLI` relationship [S15] (GSRS models food constituents too, a D12 seam).

### C. Compound record (PubChem PUG REST) — 7 CIDs read

Instances: 90480033, 439924 [S19]; 1054, 6019, 1051, 104817, 84645 [S22]. Fields: `CID`, `Title`, `MolecularFormula`, `MolecularWeight` (string), `ExactMass`, `InChIKey`, `IUPACName`, `Charge`, `ConnectivitySMILES`; synonyms list [S20]. InChIKeys differ between salt (YABIFCKURFRPPO-IVOJBTPCSA-N) and cation (JLEBZPBDRKPWTD-TURQNECASA-O) [S19] — InChIKey is a usable identity key for ChemicalSubstance only at the salt/moiety granularity GSRS uses.

### D. Licensed-product medicinal ingredient record (Health Canada LNHPD) — 6 instances read

Instances: Tru Niagen licences lnhpd_id 25281828 (439.0 mg), 9465261 (263.0 milligrams), 23195874 (263.0 mg + inulin 3650.0 mg from "Cichorium intybus - Root"), 22641333 (110.0 mg), 23184993 (132.0 mg) [S28][S29][S30][S31]; ashwagandha tincture 4846413 [S32].
Fields: `lnhpd_id`, `ingredient_name`, `ingredient_Text`, `potency_amount`, `potency_constituent`, `potency_unit_of_measure`, `quantity`, `quantity_minimum`, `quantity_maximum`, `quantity_unit_of_measure`, `ratio_numerator`, `ratio_denominator`, `dried_herb_equivalent`, `dhe_unit_of_measure`, `extract_type_desc`, `source_material`.
What they teach: every NR licence declares the **moiety** with the **salt as source material**: 263.0 = 300 × 0.878, 439.0 = 500 × 0.878, 110.0 ≈ 125 × 0.878, 132.0 ≈ 150 × 0.878 **(calc)** [S29][S28][S31][S13][S14]. One licence names the ingredient by its CAS index name "Pyridinium, 3-(aminocarbonyl)-1-beta-D-ribofuranosyl-" and unit "milligrams" instead of "mg" [S29]. The ashwagandha record carries the botanical normalization fields directly: quantity 15.0 mL, ratio 1:5, dried herb equivalent 3 g, source material "Dried root(s)" [S32]. Purpose text includes "(Source of vitamin B3 which) increases levels of NAD+ in the blood" [S34].

### E. Trial publication methods section + registry record — 2 papers, 1 registry record

Instances: Conze 2019 full text [S36] and NCT02712593 [S37]; Cohen 2023 research letter [S38]. Fields that matter to D1 (paper): intervention material name and grade ("NR chloride (99% purity)"), capsule composition, per-capsule amount, capsules per day, placebo composition, who labelled the product ("Unblinded personnel at KGK Science Inc."), registration id as printed [S36]; analytical studies add measured amount vs declared, method, sample count [S38]. Registry fields: `interventions[]` (`type`, `name`, `armGroupLabels`), `armGroups[]` (`label`, `description`), lead sponsor (KGK Science Inc., INDUSTRY) [S37] — **no amount basis or material identity** in the registry for this trial.

### F. Regulator safety communication — 2 instances

TGA vitamin B6 [S39]; TGA ashwagandha [S40]. Fields: issue date (implicit), summary, "what health professionals should do", background with dose thresholds and implementation dates, adverse-event counts with a data cut-off date, named forms or plant parts, links to the decision documents and to international primaries, disclaimer. Locators: heading anchors (`#summary`, `#adverse-events-reported-to-us`) plus exact quotes.

### G. Taxonomy record (NCBI Taxonomy) — 2 instances

568703 *Lacticaseibacillus rhamnosus* GG (rank strain) [S25]; 126910 *Withania somnifera* (rank species) [S26]. Fields: `TaxId`, `ScientificName`, `OtherNames` (`Synonym`, `EquivalentName`, `CommonName`), `ParentTaxId`, `Rank`, `Division`, `Lineage`, `LineageEx`, genetic code ids.

### H. Supplier-side disclosures — 2 instances of different kinds

Branded-ingredient marketing page (KSM-66) [S42]: claims about plant part, solvent, "full-spectrum", clinical-study counts; no lot or specification numbers. Annual report (Niagen Bioscience 10-K FY2025) [S43]: supplier identity, exclusivity, crystal-form patents, grades (food vs pharmaceutical), supply term, ingredient revenue. Neither is a specification or COA (D8 owns those).

---

## 4. Lens summaries

**Science.** Identity is well served at the structure level (GSRS, PubChem, ChEBI) and poorly served at the *material* level (grade, crystal form, extract, strain lot). GSRS relationships give a clean ACTIVE MOIETY edge for salts [S13][S17] but not nutrient equivalence [S16]. Botanical identity needs taxon + plant part + preparation + ratio + marker standardization, and regulators already distinguish root vs leaf for harm [S40][S32][S11]. Strain identity needs taxon + strain designation + deposit, while labels give a renamed species and a mass [S9][S25][S27].

**Economics.** Branded materials are IP-protected forms of a commodity substance: the crystal form of NR chloride is patented and single-sourced [S43]; the same substance is sold in food and pharmaceutical grades [S43]; root vs leaf price differences create an adulteration incentive the supplier itself states [S42]. Investors need "who supplies the material in product X" and "does a substance-status change (NMN) open competition" [S43].

**Community.** Biohackers argue about forms (NR vs NMN, magnesium salts, P5P vs pyridoxine) and about elemental vs compound amounts; the main community venue (Reddit) is not fetchable with our tools [S47]. Recommendations by people (D9) will name branded materials and forms, so D1 must resolve those strings.

**AI.** Access is agent-ready; resolution is not. Agents will mis-join salt and moiety unless the schema carries basis, and will mis-count harm exposure unless amounts are normalized by a derived, method-versioned rule (see `_notes/research-notes.md`).

---

## 5. Sources

All retrieved 2026-10-08. Tool per source in `_notes/tool-log.md`; sha256 of captured bytes for fixture candidates in `_notes/fixture-candidates.md`.

- [S1] https://api.ods.od.nih.gov/dsld/v9/label/323170 · NIH DSLD label 323170 "Tru Niagen 300 mg" (ChromaDex) · 2026-10-08
- [S2] https://api.ods.od.nih.gov/dsld/v9/label/313541 · NIH DSLD label 313541 "NR Longevity" (Pure Encapsulations) · 2026-10-08
- [S3] https://api.ods.od.nih.gov/dsld/v9/label/222934 · NIH DSLD label 222934 "Nicotinamide Riboside Chloride 125 mg" (SuperSmart) · 2026-10-08
- [S4] https://api.ods.od.nih.gov/dsld/v9/search-filter?q=%22nicotinamide%20riboside%20chloride%22&size=25 · NIH DSLD search results for "nicotinamide riboside chloride" · 2026-10-08
- [S5] https://api.ods.od.nih.gov/dsld/v9/label/326829 · NIH DSLD label 326829 "P-5-P 50 mg" (Country Life) · 2026-10-08
- [S6] https://api.ods.od.nih.gov/dsld/v9/label/309443 · NIH DSLD label 309443 "Magnesium + P-5-P" (EuroMedica) · 2026-10-08
- [S7] https://api.ods.od.nih.gov/dsld/v9/label/255079 · NIH DSLD label 255079 "Magnesium Glycinate 400" (KAL) · 2026-10-08
- [S8] https://api.ods.od.nih.gov/dsld/v9/label/310750 · NIH DSLD label 310750 "Magnesium Glycinate" (BulkSupplements.com) · 2026-10-08
- [S9] https://api.ods.od.nih.gov/dsld/v9/label/250851 · NIH DSLD label 250851 "Digestive Daily Probiotic" (Culturelle) · 2026-10-08
- [S10] https://api.ods.od.nih.gov/dsld/v9/label/273846 · NIH DSLD label 273846 "Pro Strength Digestive Daily Probiotic" (Culturelle) · 2026-10-08
- [S11] https://api.ods.od.nih.gov/dsld/v9/label/306237 · NIH DSLD label 306237 "KSM-66 600 mg" (Nutricost) · 2026-10-08
- [S12] https://api.ods.od.nih.gov/dsld/v9/label/191089 · NIH DSLD label 191089 "Ultimate Ashwagandha 250 mg KSM-66" (Swanson) · 2026-10-08
- [S13] https://gsrs.ncats.nih.gov/api/v1/substances(8XM2XT8VWI)?view=full · FDA GSRS substance "NICOTINAMIDE RIBOSIDE CHLORIDE" (UNII 8XM2XT8VWI, version 18) · 2026-10-08
- [S14] https://gsrs.ncats.nih.gov/api/v1/substances(0I8H2M0L7N)?view=full · FDA GSRS substance "NICOTINAMIDE RIBOSIDE" (UNII 0I8H2M0L7N, version 24) · 2026-10-08
- [S15] https://gsrs.ncats.nih.gov/api/v1/substances(KV2JZ1BI6Z)?view=full · FDA GSRS substance "PYRIDOXINE" (UNII KV2JZ1BI6Z) · 2026-10-08
- [S16] https://gsrs.ncats.nih.gov/api/v1/substances(F06SGE49M6)?view=full · FDA GSRS substance "Pyridoxal phosphate anhydrous" (UNII F06SGE49M6) · 2026-10-08
- [S17] https://gsrs.ncats.nih.gov/api/v1/substances(68Y4CF58BV)?view=full · FDA GSRS substance "PYRIDOXINE HYDROCHLORIDE" (UNII 68Y4CF58BV) · 2026-10-08
- [S18] https://gsrs.ncats.nih.gov/api/v1/substances(V038D626IF)?view=full · FDA GSRS substance "WITHANIA SOMNIFERA ROOT" (UNII V038D626IF) · 2026-10-08
- [S19] https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/90480033,439924/property/MolecularFormula,MolecularWeight,ExactMass,InChIKey,IUPACName,Charge,CanonicalSMILES/JSON · PubChem PUG REST properties for CID 90480033 and 439924 · 2026-10-08
- [S20] https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/90480033/synonyms/JSON · PubChem synonyms for CID 90480033 (nicotinamide riboside chloride) · 2026-10-08
- [S21] https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/Niagen/cids/TXT (and the same pattern for "nicotinamide riboside", "magnesium glycinate", "magnesium bisglycinate", "vitamin B6", "KSM-66") · PubChem name-to-CID resolution · 2026-10-08
- [S22] https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/104817,84645,1054,6019,1051/property/Title,MolecularFormula,MolecularWeight/JSON · PubChem titles and properties for CIDs 104817, 84645, 1054, 6019, 1051 · 2026-10-08
- [S23] https://www.ebi.ac.uk/chebi/backend/api/public/compound/15927/ · ChEBI entity CHEBI:15927 "N-ribosylnicotinamide" · 2026-10-08
- [S24] https://commonchemistry.cas.org/api/detail?cas_rn=23111-00-4 · CAS Common Chemistry detail API (HTTP 401 Unauthorized) · 2026-10-08
- [S25] https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=taxonomy&id=568703&retmode=xml · NCBI Taxonomy 568703 "Lacticaseibacillus rhamnosus GG" · 2026-10-08
- [S26] https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=taxonomy&id=126910&retmode=xml · NCBI Taxonomy 126910 "Withania somnifera" · 2026-10-08
- [S27] https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.1099/ijsem.0.004107%22&format=json&resultType=core · Europe PMC record: Zheng et al. 2020 "A taxonomic note on the genus Lactobacillus…" (PMID 32293557, DOI 10.1099/ijsem.0.004107) · 2026-10-08
- [S28] https://health-products.canada.ca/api/natural-licences/medicinalingredient/?lang=en&type=json&id=25281828 · Health Canada LNHPD medicinal ingredient, lnhpd_id 25281828 (Tru Niagen, licence 80112429) · 2026-10-08
- [S29] https://health-products.canada.ca/api/natural-licences/medicinalingredient/?lang=en&type=json&id=9465261 · Health Canada LNHPD medicinal ingredient, lnhpd_id 9465261 (Tru Niagen, licence 80092534) · 2026-10-08
- [S30] https://health-products.canada.ca/api/natural-licences/medicinalingredient/?lang=en&type=json&id=23195874 · Health Canada LNHPD medicinal ingredient, lnhpd_id 23195874 (Tru Niagen) · 2026-10-08
- [S31] https://health-products.canada.ca/api/natural-licences/medicinalingredient/?lang=en&type=json&id=22641333 and …&id=23184993 · Health Canada LNHPD medicinal ingredients, Tru Niagen licences (110.0 mg; 132.0 mg) · 2026-10-08
- [S32] https://health-products.canada.ca/api/natural-licences/medicinalingredient/?lang=en&type=json&id=4846413 · Health Canada LNHPD medicinal ingredient, lnhpd_id 4846413 ("Master Formulae - Ashwagandha root") · 2026-10-08
- [S33] https://health-products.canada.ca/api/natural-licences/productlicence/?lang=en&type=json · Health Canada LNHPD product licence list (bulk) · 2026-10-08
- [S34] https://health-products.canada.ca/api/natural-licences/productpurpose/?lang=en&type=json&id=25281828 and …/productrisk/… · Health Canada LNHPD purpose and risk text, lnhpd_id 25281828 · 2026-10-08
- [S35] https://www.ecfr.gov/api/versioner/v1/full/2026-09-01/title-21.xml?part=101&section=101.36 · eCFR 21 CFR 101.36 "Nutrition labeling of dietary supplements" (as of 2026-09-01) · 2026-10-08
- [S36] https://www.ebi.ac.uk/europepmc/webservices/rest/PMC6611812/fullTextXML · Conze D, Brenner C, Kruger CL. "Safety and Metabolism of Long-term Administration of NIAGEN (Nicotinamide Riboside Chloride) in a Randomized, Double-Blind, Placebo-controlled Clinical Trial of Healthy Overweight Adults." Sci Rep 2019 (PMID 31278280; PMCID PMC6611812; DOI 10.1038/s41598-019-46120-z) · 2026-10-08
- [S37] https://clinicaltrials.gov/api/v2/studies/NCT02712593 · ClinicalTrials.gov record NCT02712593 · 2026-10-08
- [S38] https://pmc.ncbi.nlm.nih.gov/articles/PMC10130950/ · Cohen PA, Avula B, Wang YH, Katragunta K, Khan I. "Quantity of Melatonin and CBD in Melatonin Gummies Sold in the US." JAMA 2023;329(16):1401–1402 (PMID 37097362; PMCID PMC10130950; DOI 10.1001/jama.2023.2296) · 2026-10-08
- [S39] https://www.tga.gov.au/news/safety-updates/medicines-containing-vitamin-b6-pyridoxine-pyridoxal-or-pyridoxamine · TGA "Medicines containing vitamin B6 (pyridoxine, pyridoxal or pyridoxamine)" · 2026-10-08
- [S40] https://www.tga.gov.au/news/safety-updates/withania-somnifera-ashwagandha-and-very-rare-risk-liver-injury · TGA "Withania somnifera (Ashwagandha) and very rare risk of liver injury" · 2026-10-08
- [S41] https://ods.od.nih.gov/factsheets/VitaminB6-HealthProfessional/ · NIH ODS "Vitamin B6 — Fact Sheet for Health Professionals" · 2026-10-08
- [S42] https://ksm66ashwagandhaa.com/what-is-ksm66.php · "What is KSM66 | KSM Ashwagandha" · 2026-10-08
- [S43] https://www.sec.gov/Archives/edgar/data/1386570/000138657026000013/cdxc-20251231.htm · Niagen Bioscience, Inc. Form 10-K for fiscal year 2025 (accession 0001386570-26-000013, filed 2026-03-04) · 2026-10-08
- [S44] https://efts.sec.gov/LATEST/search-index?q=%22W.R.%20Grace%22%20%22nicotinamide%20riboside%22&forms=10-K&dateRange=custom&startdt=2025-01-01&enddt=2026-10-08 · SEC EDGAR full-text search hits · 2026-10-08
- [S45] https://api.ods.od.nih.gov/dsld/v9/search-filter?q=%22Tru%20Niagen%22&size=10 · NIH DSLD search results for "Tru Niagen" (incl. label 323172 "Tru Niagen Immune" with a "VegD3" blend row) · 2026-10-08
- [S46] https://www.atcc.org/products/53103 · ATCC "Page Not Found (404 Error)" · 2026-10-08
- [S47] https://www.reddit.com/r/Supplements/comments/1vt81zl/confused_by_label · r/Supplements "Confused by label" (title from Tavily search; content not fetchable: Tavily extract failed, Firecrawl unsupported site, curl HTTP 403) · 2026-10-08
- [S48] https://www.atcc.org/products/baa-3227 · ATCC "Lacticaseibacillus rhamnosus (Hansen) Zheng et al. - BAA-3227" (search result snippet via Firecrawl search "ATCC 53103 Lacticaseibacillus rhamnosus site:atcc.org"; page not scraped) · 2026-10-08 (adversarial review)
