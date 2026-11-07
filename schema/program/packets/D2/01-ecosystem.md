# D2 — ecosystem survey: mechanisms and the biology of aging

Stage: research (Wave 1), agent A3, 2026-10-08; corrected after the adversarial review (2026-10-08: NR lifespan row, primary licence sources, Altos and AgelessRx descriptors, readiness scores aligned with 08). Scope per brief: why a compound might work (mechanisms, pathways, molecular targets, hallmarks of aging, species and tissue context, measured versus inferred steps, the outcomes and conditions mechanisms plausibly influence), narrowed to longevity biology (NAD+ metabolism, mTOR/AMPK, senescence, autophagy, mitochondrial function, inflammation, epigenetic regulation).

**Citation rule.** Every factual claim carries a source key `[S#]`; the key resolves in the source table at the end to `URL · title · retrieval date`. All retrievals are 2026-10-08 unless stated. Raw captures and their sha256 digests are in scratch (`ft/D2/raw`, `ft/D2/SHA256SUMS.txt`); tools are logged in `_notes/tool-log.md`. Nothing here is medical advice.

**Lenses.** Each actor group ends with a four-lens note: **Sci** (what knowledge it produces and how reliable), **Econ** (who pays, licence, money at stake), **Comm** (how it reaches biohackers, investors, the public), **AI** (agent-readiness: API, stable ids, locators, versioning).

---

## 1. The one distinction the domain turns on: measured, inferred, cited, hypothesized

Mechanism knowledge about longevity compounds is overwhelmingly *transferred*: from yeast, worms, flies and mice to people; from cell lines to tissues; from blood to muscle; from an ingredient to a commercial product. The same compound carries a measured step in one context and a hypothesized step in another, and sources rarely say which. One worked chain, all from captured primaries:

| step claimed for nicotinamide riboside (NR) | who says it | basis in the source | species / compartment | result |
| --- | --- | --- | --- | --- |
| NR raises NAD+ / NAD+ metabolome | Elhassan 2019 (RCT, 12 aged men, 1 g/day, 21 days) [S1] | measured (LC-MS/MS) | human skeletal muscle, whole blood, urine | muscle NAAD 2-fold up (0.73 vs 0.35 pmol/mg, p = 0.004) **without** an increase in muscle NAD+ (210 vs 197 pmol/mg, p = 0.22) [S1] |
| raised NAD+ activates sirtuins | Elysium Basis product page [S20]; Tru Niagen page testimonial on mitochondrial function [S21] | asserted, no measurement on page | none stated | — |
| sirtuin deacetylation increases | Elhassan 2019 [S1] | measured proxy (pan-acetylation western blot) | human muscle | null: "did not detect NR-mediated changes to muscle protein acetylation" [S1] |
| mitochondrial bioenergetics improve | preclinical (cited in [S1]); marketing [S20][S21] | measured (high-resolution respirometry) in [S1] | human muscle | null: no differences in complex I/II OXPHOS or maximal respiratory capacity [S1]; corroborated by other human trials found via the research index (PMID 31710095, 33492681) [S30] |
| inflammation decreases | Elhassan 2019 [S1] | measured (serum multiplex cytokines) | human serum | IL-6, IL-5, IL-2, TNF-α decreased vs baseline [S1] |
| NR extends lifespan | NIA ITP, Harrison 2021 [S8]; DrugAge rows [S14] | measured (survival) | mice (UM-HET3 both sexes in the ITP; C57BL/6JRj outside it); yeast | mixed by setting. Null in the ITP, the strongest test: "neither it nor the other three increased lifespans significantly at the doses tested" [S8]; DrugAge ITP rows 0 % (F) and −3 % (M), NS [S14]. DrugAge also lists a non-ITP C57BL/6JRj row (400 ppm from 24 months, +5 % average lifespan, marked significant, PMID 27127236) and a yeast BY4741 row (+20 %, NS) [S14] |

This is the round-0003 rule (CQ-MX-01..05) made concrete, and the reason the D2 model needs per-step evidence context (species, compartment, setting, exposure) on assertions rather than a compound→mechanism edge with a confidence number.

---

## 2. Actor groups

### 2.1 Curated pathway and process knowledgebases (Reactome, KEGG, WikiPathways, Gene Ontology)

**Processes and operations.** Expert curators author reactions and pathways from literature, external reviewers sign off, releases are versioned; human events are propagated to other species by orthology. Reactome records carry a review status ("five stars", "externally reviewed" for Nicotinate metabolism; "four stars" for MTOR signalling), `isInferred`, 13–14 `orthologousEvent` links, a versioned stable id (`R-HSA-196807.8`) and a DOI that points to an earlier version (`10.3180/R-HSA-196807.7`) [S2]. GO terms carry a definition citing a PMID, a change history (14 entries for cellular senescence, 41 for macroautophagy) and taxon constraints (cellular senescence `never_in_taxon` Fungi; macroautophagy `only_in_taxon` Eukaryota) [S5]. KEGG publishes a human "Longevity regulating pathway" (hsa04211, CLASS "Organismal Systems; Aging") whose description names four calorie-restriction pathways (IGF-1/insulin, sirtuin, AMPK, TOR) and states that resveratrol extends lifespan "by activating SIRT1 activity" [S4].

**Artifacts and capturability.** Pathway records (JSON/flat file), participant lists (75 reference entities for R-HSA-196807, each with UniProt accession and function text) [S2], GO term records [S5], pathway diagrams (not captured).

**Sci.** High-quality structure (which genes take part in which process) but it is *reference topology*, not evidence that a compound changes anything in a person. Curated descriptions can carry contested mechanism claims: KEGG's resveratrol → SIRT1 activation statement [S4] is the claim Pacholec 2010 tested and rejected with native substrates [S6].
**Econ.** Reactome data is CC0 and illustrations CC BY 4.0 [S9]; GO is CC BY 4.0 [S10]; WikiPathways is CC0 [S12]. KEGG: "KEGG API at rest.kegg.jp is made available only for academic use by academic users" and "Non-academic use of KEGG requires a commercial license" [S11]; public funding covers a fraction of KEGG's cost and FTP access is a paid subscription [S13].
**Comm.** Invisible to biohackers directly; reaches them through enrichment plots in papers and through supplement copy that names pathways.
**AI.** Reactome and QuickGO are agent-ready (REST, stable versioned ids, no auth) [T6, T11 in tool-log]. KEGG is fetchable but licence-blocked for a commercial product: treat as reference-only, do not ingest.

### 2.2 Gene, protein and target resources (UniProt, Open Targets, ChEMBL, DrugBank)

**Processes.** UniProt curators annotate function per statement with evidence codes; SIRT1 (Q96EB6) and MTOR (P42345) are reviewed Swiss-Prot entries at entry versions 226 and 245, last annotation update 2026-09-02 [S3]. Function statements carry ECO codes: `ECO:0000269` (experimental, with PubMed id) and `ECO:0000250` (by similarity to the mouse entry) [S3] — a native "measured versus inferred" flag at statement level. ChEMBL curates drug mechanism-of-action records: sirolimus (CHEMBL413) has exactly one, "FK506-binding protein 1A inhibitor", action type INHIBITOR, target CHEMBL1902 (FKBP1A, P62942), referenced to the DailyMed label section [S7]; metformin's two mechanisms ("Mitochondrial complex I (NADH dehydrogenase) inhibitor", "Mitochondrial glycerol-3-phosphate dehydrogenase inhibitor") are recorded on the hydrochloride salt CHEMBL1703 and are found only by querying the parent id [S7]; resveratrol (CHEMBL165) has no mechanism record [S7]. Open Targets integrates these into target and drug pages: the MTOR target lists 15 Reactome pathways and 2,545 associated diseases, each association a score with per-datatype scores (genetic_association, somatic_mutation, literature, animal_model …) [S15].

**Sci.** Sirolimus' curated molecular mechanism is FKBP12 binding; "mTOR inhibitor" is the downstream pathway mechanism that longevity literature and Reactome/KEGG describe [S7][S2][S4]. A schema that records only one "target" per compound loses that distinction — mechanism steps are chains, and the curated first step differs from the narrative one.
**Econ.** ChEMBL data CC BY-SA 3.0 [S16]; Open Targets CC0 1.0 [S17]; UniProt applies "the Creative Commons Attribution 4.0 International (CC BY 4.0) License to all copyrightable parts of our databases" [S18]. DrugBank requires a licence, and its own release page states "All Academic downloads are temporarily paused." [S19]; a widely used downloader's README dates the pause to May 2026 [S44] — a dependency risk; prefer ChEMBL/Open Targets.
**Comm.** Investors meet these indirectly (target validation in pitch decks); not consumer-facing.
**AI.** All agent-ready by API; Open Targets GraphQL drifted (fields `maximumClinicalTrialPhase`, `isApproved` removed) and broke a first query [tool-log T9]. Open Targets association scores are a ready-made example of a *materialized projection with a method* (00-DIRECTIVE 3.6): useful for ranking, never evidence.

### 2.3 Aging-specific curated resources (HAGR, Open Genes, Aging Atlas, the hallmarks frame)

**Processes and artifacts.** The Human Ageing Genomic Resources (HAGR) maintain GenAge (genes), DrugAge (compounds that modulate lifespan in model organisms), CellAge (senescence genes), GenDR (dietary restriction), LongevityMap (human variants), AnAge and the Digital Ageing Atlas [S22][S23]. The GenAge human entry for SIRT1 (HAGRID 150) states its selection reason ("evidence directly linking the gene product to ageing in a mammalian model organism"), a narrative that already contains disconfirmation ("extends lifespan, although these findings have been questioned by other studies"; "whole-body moderate overexpression of Sirt1 improves healthy ageing but does not increase mice lifespan"), GO terms, interactors and homologs [S22]; build 21 (28/08/2023) lists 307 human genes [S22]. DrugAge build 5 (release 2024-11-29, 3,406 entries, 1,045 drugs per release notes; 3,423 data rows in the CSV captured today) gives one row per experiment: compound, species, strain, dosage, age at initiation, duration, average and maximum lifespan change and significance, sex, weight change, ITP flag, PMID [S14]. Open Genes exposes a per-gene JSON with `agingMechanisms` (for SIRT1: nuclear DNA instability, histone modifications, chromatin remodeling, TOR pathway dysregulation, AMPK pathway dysregulation, senescent cells accumulation, SIRT pathway dysregulation …), a `confidenceLevel`, and `researches` grouped as increaseLifespan (67 records for SIRT1, each with organism, line, sex, diet, cohort sizes, lifespan statistics, intervention method and DOI), longevity-associated variants, age-related changes and regulated genes [S24]. Aging Atlas is a multi-omics aging database of the Aging Atlas Consortium [S26], hosted at ngdc.cncb.ac.cn and still updated (latest update shown 28 July 2026) [S25]. The organizing frame is the hallmarks of aging; the 2023 update lists twelve: "genomic instability, telomere attrition, epigenetic alterations, loss of proteostasis, disabled macroautophagy, deregulated nutrient-sensing, mitochondrial dysfunction, cellular senescence, stem cell exhaustion, altered intercellular communication, chronic inflammation, and dysbiosis" [S27].

**Sci.** These resources are the closest thing to a curated "mechanism of aging" layer, but each uses its own vocabulary (Open Genes' agingMechanisms ≠ the 12 hallmarks ≠ GO BP terms ≠ KEGG map names). A small curated hallmark vocabulary that maps to GO/Reactome ids is the lowest-cost organizing frame.
**Econ.** Academic, grant-funded, free with attribution (HAGR conditions) [S14]. Low commercial risk, moderate sustainability risk.
**Comm.** Hallmarks are the lingua franca of longevity marketing and podcasts; "targets the hallmarks of aging" is a common unfalsifiable product claim.
**AI.** DrugAge: bulk CSV, agent-ready. GenAge entries: HTML-only per gene (scrape), bulk zip exists. Open Genes: an undocumented JSON API works while the SPA website fails to fetch [tool-log T15, T17]. Aging Atlas: web portal, no API probed.

### 2.4 Producers of primary mechanism evidence (labs, trials, the NIA Interventions Testing Program)

**Processes.** (a) Preclinical labs establish a mechanism in cells or rodents. (b) Human mechanistic trials then measure a step in a specific compartment: NR in aged human muscle (Elhassan 2019; NCT02950441; disclosed conflict: an author "is the inventor of patents licensed by ChromaDex, owns stock in ChromaDex") [S1]; metformin plus aerobic exercise training in older adults (Konopka 2019; NCT02552355), dosed up to 2000 mg/day, where "Metformin also abrogated the exercise-mediated increase in skeletal muscle mitochondrial respiration" [S28]; dasatinib + quercetin in diabetic kidney disease (Hickson 2019; NCT02848131), where D + Q "reduced adipose tissue senescent cell burden within 11 days" by p16INK4A, p21CIP1 and SA-β-gal markers, with lower circulating SASP factors [S29][S31]. (c) Disconfirmation studies test a claimed step directly: Pacholec 2010 (Pfizer) showed SRT1720, SRT2183, SRT1460 and resveratrol activate SIRT1 only with a fluorophore-tagged substrate, and "are not direct activators of SIRT1" [S6]. (d) The NIA Interventions Testing Program tests orally administered agents for lifespan in genetically heterogeneous UM-HET3 mice at three sites (The Jackson Laboratory, University of Michigan, UT Health San Antonio) [S32][S33]; it confirmed late-life rapamycin [S34] and found nicotinamide riboside did not extend lifespan in either sex [S8].

**Sci.** These are the only sources that can turn a hypothesized step into a measured one. Fields that matter are scattered between Methods (species, strain, tissue, dose, route, duration) and Results (direction, magnitude, null). Human nulls on the step marketing relies on (sirtuin activity, mitochondrial respiration) exist and are rarely surfaced [S1][S30].
**Econ.** Trials are often sponsor-linked (ChromaDex patent/stock disclosure in [S1]; the PEARL rapamycin trial lists AgelessRx affiliations for its authors [S35], and AgelessRx sells longevity prescriptions, including rapamycin, by subscription [S45]). The ITP is NIA-funded and independent [S32].
**Comm.** Preclinical wins travel to podcasts and product pages; human nulls and ITP nulls travel slowly (community blogs such as Fight Aging! summarize ITP negatives [S36]).
**AI.** Papers: PubMed XML agent-ready; Europe PMC full-text JATS for OA articles; non-OA full text unavailable (JBC: "The publisher of this article does not allow downloading of the full text in XML form") [tool-log T3, T4]. Quotes need a declared normalization (no-break spaces, U+2010 hyphens) [tool-log].

### 2.5 Literature infrastructure and machine reading (PubMed/PMC, Europe PMC, preprints, INDRA)

**Processes.** Europe PMC runs entity recognition over full text and publishes annotations with W3C-style text-quote selectors (`prefix`, `exact`, `postfix`), section and ontology URI: 1,017 annotations for the Elhassan paper, including Open Targets "Gene Disease Relationship" sentence-level links [S37]. INDRA collects "mechanistic and causal assertions" from reading systems and databases and represents them as INDRA Statements with evidence [S38]. Preprints (bioRxiv/medRxiv) carry early mechanism claims; the Firecrawl research index pairs a preprint DOI with its published DOI (10.1101/2020.06.23.143446 ↔ 10.1113/jp280825) [S30].

**Sci.** Machine-read mentions are noisy in exactly the places D2 cares about: "nicotinamide riboside" was tagged as CHEBI_80498 *dihydrozeatin riboside*, "NR" as a UniProt protein *NorRed*, "Skeletal" as UBERON *skeleton*, "oral" as *mouth* [S37]. Mention links are retrieval aids, never evidence.
**Econ.** Free (Europe PMC, PubMed, INDRA open source).
**Comm.** Not consumer-facing.
**AI.** Highly agent-ready, and the selector model (prefix/exact/postfix + section) matches our `SourceLocator` kinds; this is the cheapest source for the derived MENTIONS projection.

### 2.6 Companies and capital (economics lens)

| actor | what happened | mechanism at stake | source |
| --- | --- | --- | --- |
| Sirtris → GSK | GSK agreed to acquire Sirtris for approximately USD 720 million (2008), describing sirtuin modulation as the thesis | SIRT1 activation by small molecules (resveratrol, SRT compounds) | [S39] |
| GSK / Sirtris, 2013 | GSK moved Sirtris out of Cambridge; "we aren't really pursuing resveratrol at all" | same; directly contradicted by [S6] | [S40] |
| UNITY Biotechnology | UBX0101 (senolytic) Phase 2, 183 patients with knee OA: "no statistically significant difference between any arm of UBX0101 and placebo at the 12-week endpoint" (2020-08-17) | cellular senescence | [S41] |
| Altos Labs | launched with a stated mission "to restore cell health and resilience through cell rejuvenation" [S42]; the launch release describes a company "dedicated to unraveling the deep biology of cellular rejuvenation programming" and cites work showing that cells can be rejuvenated, "resetting their epigenetic clocks" [S46] | cellular rejuvenation programming (epigenetic reset) | [S42][S46] |
| Niagen Bioscience (ChromaDex) | sells Tru Niagen (NR); page claims a 300 mg serving "is clinically shown to increase NAD+ levels by over 50% in most individuals" and "Supports cellular health and mitochondrial function" | NAD+ → mitochondrial function | [S21] |
| Elysium Health | sells Basis (NR + pterostilbene); page: "Boosted NAD+ activates sirtuins, supports cellular energy and metabolism…" | NAD+ → sirtuins → cellular aging | [S20] |
| Jinfiniti | sells an at-home "Intracellular NAD® Test" (finger prick, CLIA-certified claim), from $198 per test, marketed partly to "avoid potential overdosing" | measurement of the mechanism's proximal biomarker | [S43] |

**Sci.** Capital follows mechanism narratives; the narrative's weakest step (direct SIRT1 activation; senescent-cell clearance translating to a clinical endpoint) is where the value was lost [S6][S40][S41].
**Econ.** Investors need: which mechanism a company's thesis depends on, which step is measured in humans, and which readouts disconfirmed it. That is a D2×D3×D7×D13 path.
**Comm.** Founder-scientists front products (Elysium names its co-founder and chief scientist on the product page [S20]).
**AI.** Press releases and SEC filings are agent-ready (GlobeNewswire, EDGAR) [tool-log T17].

### 2.7 How mechanism claims travel into marketing (community lens)

Product pages restate mechanism steps as outcomes without species, compartment or measurement: "The potent combination of NR and pterostilbene in Basis is designed to increase NAD+ levels and counter the decrease in the activity of sirtuins" and, after a month, "You can expect support for increased cellular energy, improved mitochondrial function…" [S20]. A Tru Niagen testimonial refers to "the known ability of NR to enhance mitochondrial function and cellular energy" [S21], while human muscle respirometry found no change [S1][S30]. Testing vendors close the loop by selling the proximal biomarker as proof of benefit: "Benefits are ONLY realized when NAD+ level is optimized" [S43]. The pattern is a *measured proximal biomarker* (blood NAD+) used to imply *unmeasured distal steps* (sirtuins, mitochondria, aging) — the CQ-AX-20 / CQ-MX-04 transfer failure.

### 2.8 AI and knowledge-graph lens (summary)

- Ready-made mechanism graphs exist (Reactome, Open Targets, INDRA) and each already separates reference structure, scored associations and evidence-bearing statements [S2][S15][S38]; our schema should not re-host their topology, only the slice our questions traverse, keyed by their versioned ids.
- Every authority versions in place (Reactome stIdVersion vs DOI version; UniProt entryVersion; GenAge build; DrugAge build) [S2][S3][S22][S14]; a pathway reference used as evidence must cite the release.
- Measured/inferred flags exist natively in sources (UniProt ECO codes, Reactome `isInferred`) [S3][S2]; the schema should carry them through as properties of the evidence context or assertion, not invent a new mechanism.
- APIs drift (Open Targets) and licences differ (KEGG academic-only, DrugBank paused, ChEMBL share-alike) [S11][S19][S16][tool-log].

---

## 3. Artifact interviews (at least two real instances per artifact type, fields read end to end)

| # | artifact type | instances read | fields observed |
| --- | --- | --- | --- |
| A1 | Pathway record (Reactome) | R-HSA-196807 Nicotinate metabolism; R-HSA-165159 MTOR signalling [S2] | className, dbId, displayName, stId, stIdVersion, doi, releaseDate, lastUpdatedDate, reviewStatus (+definition), previousReviewStatus, speciesName/species, isInferred, orthologousEvent[], hasEvent[] (28 / 19), literatureReference[] (PMID, year), summation[].text, goBiologicalProcess (196807 only: GO:1901847), hasDiagram, hasEHLD, isInDisease, maxDepth |
| A2 | Pathway record (KEGG flat file) | hsa04211 Longevity regulating pathway; hsa04150 mTOR signaling pathway [S4] | ENTRY, NAME, DESCRIPTION, CLASS, PATHWAY_MAP, DRUG, ORGANISM, GENE (Entrez id; symbol; name; [KO]; [EC]), COMPOUND, REFERENCE (PMID, AUTHORS, TITLE, JOURNAL), REL_PATHWAY, KO_PATHWAY |
| A3 | Pathway participant list | R-HSA-196807 referenceEntities (75) [S2] | stId (uniprot:…), databaseName, identifier, name[], otherIdentifier[] (probe ids, GO ids), url, moleculeType, checksum, comment[] (UniProt FUNCTION/CATALYTIC ACTIVITY/PATHWAY text), description, geneName[], keyword[], secondaryIdentifier[], sequenceLength, chain |
| A4 | Protein entry (UniProt) | Q96EB6 SIRT1; P42345 MTOR [S3] | primaryAccession, uniProtkbId, entryType (reviewed), entryAudit (firstPublicDate, lastAnnotationUpdateDate, entryVersion, sequenceVersion), organism (taxonId 9606), proteinExistence, annotationScore, genes, proteinDescription, comments[] by commentType (FUNCTION, CATALYTIC ACTIVITY, ACTIVITY REGULATION, TISSUE SPECIFICITY, INDUCTION, PTM, SUBCELLULAR LOCATION, DISEASE …) each with evidences[] (evidenceCode ECO:…, source, id), features, keywords, references, uniProtKBCrossReferences (286 / 507; GO, PDB, Reactome, DrugBank …), sequence |
| A5 | Aging-gene curation entry | GenAge SIRT1 (HAGRID 150); GenAge MTOR (HAGRID 221) [S22]; Open Genes SIRT1 [S24] | GenAge: HAGRID, HGNC symbol, aliases, common name, selection reason, narrative description with numbered references, cytogenetic band and location, GO process/component/function, interacting partners, homologs in model organisms, build/date. Open Genes: id, symbol, ncbiId, uniprot, ensembl, confidenceLevel, commentCause[], agingMechanisms[], proteinClasses, functionalClusters, diseaseCategories, researches{increaseLifespan[], geneAssociatedWithLongevityEffects[], ageRelatedChangesOfGene[], interventionToGeneImprovesVitalProcesses[], proteinRegulatesOtherGenes[]}, expression, terms, ortholog, timestamp |
| A6 | Lifespan-intervention record | DrugAge rows for nicotinamide riboside (4 rows: yeast BY4741; C57BL/6JRj; UM-HET3 F; UM-HET3 M) [S14]; Open Genes increaseLifespan record id 728 [S24]; ITP paper abstract [S8] | DrugAge: compound_name, species, strain, dosage, age_at_initiation, treatment_duration, avg_lifespan_change_percent, avg_lifespan_significance, max_lifespan_change_percent, max_lifespan_significance, gender, weight_change_percent, weight_change_significance, ITP, pubmed_id. Open Genes: modelOrganism, organismLine, sex, diet, cohort sizes, min/mean/median/max lifespan control and experiment, change percents and significance flags, intervention method/way, tissue-specific promoter, doi |
| A7 | Drug mechanism-of-action record | ChEMBL CHEMBL413 (1 record), CHEMBL1703 metformin HCl (2 records) [S7]; Open Targets drug CHEMBL413 [S15] | ChEMBL: mec_id, record_id, molecule_chembl_id, parent_molecule_chembl_id, mechanism_of_action, action_type, target_chembl_id, direct_interaction, molecular_mechanism, disease_efficacy, max_phase, binding_site_comment, selectivity_comment, mechanism_comment, site_id, variant_sequence, mechanism_refs[] (ref_type DailyMed/PubMed, ref_id, ref_url). Open Targets: mechanismOfAction, actionType, targetName, targets[] (Ensembl id, symbol), references[] (source, urls), drugType, maximumClinicalStage |
| A8 | Ontology term (GO) | GO:0090398 cellular senescence; GO:0016236 macroautophagy [S5] | id, name, aspect, definition.text, definition.xrefs (PMID), synonyms, children[], history[], taxonConstraints[], usage, isObsolete, replaces/secondaryIds, xRefs, credits |
| A9 | Target–disease association | Open Targets MTOR associatedDiseases top rows (e.g. EFO_0009050, MONDO_0011818) [S15] | score (overall), disease {id, name}, datatypeScores[] {id: genetic_association, somatic_mutation, literature, genetic_literature, animal_model; score}, count |
| A10 | Human mechanistic study (full text) | Elhassan 2019 PMC6702140 [S1]; Konopka 2019 PMC6351883 [S28]; Hickson 2019 PMC6796530 [S29] | JATS front (PMID, PMCID, DOI, journal, authors, affiliations), abstract + highlights, trial registration (NCT02950441, NCT02552355, NCT02848131), methods (population, n, age, sex, dose, route, duration, tissue sampled, assay e.g. LC-MS/MS, high-resolution respirometry, IHC/SA-β-gal, multiplex cytokines), results with numeric values and p values, figure legends, declaration of interests, references |
| A11 | Text-mined annotation record | Europe PMC annotations for PMC6702140 (Chemicals, Gene_Proteins, Organ Tissue, Organisms, Gene Ontology, Gene Disease Relationship types) [S37] | source, extId, pmcid, annotations[] {prefix, exact, postfix, tags[] {name, uri}, id, type, section, provider}, fullTextIdList |
| A12 | Mechanism claim on a product page | Elysium Basis [S20]; Tru Niagen home [S21] | product name, claim sentences (mechanism verbs: "activates", "supports", "boost"), quantified biomarker claim ("40%", "over 50%"), cited study link, named scientist/endorser with role, ingredient names and branded forms (NR-E, Niagen), timeline claims ("Month 1…"), disclaimers/footnotes, price/subscription |
| A13 | Trial registry record (seam, D3 owns) | NCT02848131 [S31] | protocolSection modules: identification (officialTitle), status (overallStatus ENROLLING_BY_INVITATION), sponsorCollaborators, oversight, description, conditions, design, armsInterventions, outcomes (primary: "Change in proportion of senescent cells …"), eligibility, contactsLocations, references, ipdSharingStatement; hasResults false |

Observed regularities that matter for the model:

1. **Context fields recur across every evidence artifact**: species (and strain/line), sex, tissue/compartment or specimen, setting (cell-free, cell, animal, human interventional), exposure (amount, unit, basis, route, duration), direction and significance. They are the `MechanismEvidenceContext` properties of the pinned proposal, confirmed from A6, A10 and A5.
2. **Reference records version in place** (A1, A4, A5, A6): a reference link used as evidence must carry the authority's id plus release/version.
3. **Native measured/inferred markers exist** (UniProt ECO codes, Reactome isInferred/orthologousEvent, DrugAge species) and can populate a basis-kind field without NLP.
4. **Mention artifacts (A11) are cheap but wrong often enough** that they must never authorize an edge.
5. **Product-page artifacts (A12) never carry species, compartment or exposure** for the mechanism they claim; the absence itself is the signal the CQ-MX-04 question needs.

---

## 4. Capturable sources and agent-readiness (scored for 08 and the D11 registry)

Scores use the scale defined in `08-sources-and-tools.md`; where the two files ever differ, 08 supersedes this table (adversarial review 2026-10-08 aligned DrugAge 2, Europe PMC full text 2, GenAge entries 1).

| source | artifact(s) | access exercised | ids emitted | locator kinds possible | readiness 0–3 | licence / gap |
| --- | --- | --- | --- | --- | ---: | --- |
| Europe PMC full text | A10 | REST fullTextXML | PMID, PMCID, DOI | TEXT_QUOTE, TEXT_POSITION on a derived text, section | 2 (OA only) | 5xx for non-OA; offsets need a declared text derivation and normalization (adapter) |
| Europe PMC annotations | A11 | REST | ontology URIs (ChEBI, UniProt, UBERON, GO, NCBITaxon, EFO/MONDO) | TEXT_QUOTE (prefix/exact/postfix) | 3 for mentions | noisy entity links; derived only |
| PubMed E-utilities / PubMed MCP | abstracts, metadata | efetch, MCP | PMID, DOI, PMCID, MeSH | TEXT_QUOTE on abstract | 3 (efetch) / 2 (MCP text lossy) | MCP strips superscripts |
| Reactome ContentService | A1, A3 | REST | R-HSA stable ids + version, UniProt, GO, PMID | record field (JSON pointer) | 3 | CC0 data |
| UniProt REST | A4 | REST | UniProt acc, entry version, ECO, PMID | JSON pointer | 3 | CC BY 4.0 |
| ChEMBL REST | A7 | REST | CHEMBL ids, target ids, DailyMed setid, PMID | JSON pointer | 3 | CC BY-SA 3.0 (share-alike) |
| Open Targets GraphQL | A7, A9 | GraphQL | Ensembl, EFO/MONDO, CHEMBL, Reactome | JSON pointer | 2 | CC0; schema drift |
| QuickGO | A8 | REST | GO ids, PMID | JSON pointer | 3 | CC BY 4.0 |
| KEGG REST | A2 | REST | hsa map ids, Entrez, KO, EC, PMID | line/field | 1 for us | academic-only; commercial licence required |
| WikiPathways | (not captured) | — | WP ids | — | not exercised | CC0 [S12] |
| HAGR GenAge | A5 | HTML scrape; bulk zip | HAGRID, HGNC, Entrez | TEXT_QUOTE on derived text (html2txt/v1) | 1 (entries) / 2 (bulk) | no entry API |
| HAGR DrugAge | A6 | bulk CSV | compound name, PMID | CSV row (row number + header) | 2 | names not normalized to ids |
| Open Genes | A5, A6 | undocumented JSON API | Entrez, Ensembl, UniProt, DOI/PMID | JSON pointer | 2 | site not fetchable; API undocumented |
| Aging Atlas | omics portal | Tavily extract (home only) | gene symbols | — | 1 | not probed further |
| ClinicalTrials.gov v2 | A13 | REST | NCT | JSON pointer, version history | 3 | D3 owns |
| Product pages (Elysium, Tru Niagen) | A12 | Firecrawl scrape | none (URLs) | TEXT_QUOTE on rendered markdown | 2 | versioned in place; needs change tracking (D6/D9) |
| Consumer test page (Jinfiniti) | biomarker test listing | Firecrawl scrape | none | TEXT_QUOTE | 2 | D4/D6 own |
| Press releases / SEC (UNITY, Sirtris) | corporate events | Tavily extract | none / CIK | TEXT_QUOTE | 3 | D7/D13 own |

---

## 5. Sources

| key | URL · title · retrieval date |
| --- | --- |
| S1 | https://www.ebi.ac.uk/europepmc/webservices/rest/PMC6702140/fullTextXML · Elhassan YS et al. "Nicotinamide Riboside Augments the Aged Human Skeletal Muscle NAD+ Metabolome and Induces Transcriptomic and Anti-inflammatory Signatures", Cell Rep 2019;28(7):1717-1728.e6, PMID 31412242, PMCID PMC6702140, DOI 10.1016/j.celrep.2019.07.043 · 2026-10-08 |
| S2 | https://reactome.org/ContentService/data/query/R-HSA-196807 and /R-HSA-165159 and /data/participants/R-HSA-196807/referenceEntities · Reactome "Nicotinate metabolism" (R-HSA-196807.8) and "MTOR signalling" (R-HSA-165159.10) · 2026-10-08 |
| S3 | https://rest.uniprot.org/uniprotkb/Q96EB6.json and https://rest.uniprot.org/uniprotkb/P42345.json · UniProtKB SIR1_HUMAN, MTOR_HUMAN · 2026-10-08 |
| S4 | https://rest.kegg.jp/get/hsa04211 and https://rest.kegg.jp/get/hsa04150 · KEGG PATHWAY "Longevity regulating pathway - Homo sapiens (human)", "mTOR signaling pathway - Homo sapiens (human)" · 2026-10-08 |
| S5 | https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/GO:0090398/complete and …/GO:0016236/complete · QuickGO "cellular senescence", "macroautophagy" · 2026-10-08 |
| S6 | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=20061378&retmode=xml · Pacholec M et al. "SRT1720, SRT2183, SRT1460, and resveratrol are not direct activators of SIRT1", J Biol Chem 2010;285(11):8340-51, PMID 20061378, PMCID PMC2832984, DOI 10.1074/jbc.M109.088682 · 2026-10-08 |
| S7 | https://www.ebi.ac.uk/chembl/api/data/mechanism.json?molecule_chembl_id=CHEMBL413 ; …?parent_molecule_chembl_id=CHEMBL1431 ; …?parent_molecule_chembl_id=CHEMBL165 ; https://www.ebi.ac.uk/chembl/api/data/target/CHEMBL1902.json · ChEMBL mechanism and target records · 2026-10-08 |
| S8 | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=33788371,36599349&retmode=xml · Harrison DE et al. "17-a-estradiol late in life extends lifespan in aging UM-HET3 male mice; nicotinamide riboside and three other drugs do not affect lifespan in either sex", Aging Cell 2021;20(5):e13328, PMID 33788371, DOI 10.1111/acel.13328 · 2026-10-08 |
| S9 | https://reactome.org/license · Reactome "License Agreement" · 2026-10-08 |
| S10 | http://geneontology.org/docs/go-citation-policy · GO "GO citation policy and license" · 2026-10-08 |
| S11 | https://www.kegg.jp/kegg/rest/ and https://www.kegg.jp/kegg/legal.html · KEGG API page ("Restriction") and KEGG legal notice · 2026-10-08 |
| S12 | https://www.wikipathways.org/terms.html · WikiPathways "Terms of Use" ("WikiPathways content is covered by the Creative Commons CC0 Waiver"; curl, sha256 d4d0a830…) · 2026-10-08 (adversarial review; replaces a search snippet) |
| S13 | https://www.kegg.jp/kegg/docs/plea.html · KEGG "Plea to Support KEGG" · 2026-10-08 |
| S14 | https://genomics.senescence.info/drugs/dataset.zip (drugage.csv + release.html "DrugAge Build 5: Release Notes") · HAGR DrugAge · 2026-10-08 |
| S15 | https://api.platform.opentargets.org/api/v4/graphql (target ENSG00000198793; drug CHEMBL413) · Open Targets Platform API · 2026-10-08 |
| S16 | https://chembl.gitbook.io/chembl-interface-documentation/about · ChEMBL Interface Documentation "About" (data licensing) · 2026-10-08 |
| S17 | https://platform-docs.opentargets.org/licence · Open Targets Platform Documentation "Licence" · 2026-10-08 |
| S18 | https://rest.uniprot.org/help/license (the API form of https://www.uniprot.org/help/license) · UniProt "License & disclaimer" (lastModified 2024-12-18; curl, sha256 5960c22b…) · 2026-10-08 (adversarial review; replaces a search snippet of a 2021 NAR paper) |
| S19 | https://go.drugbank.com/releases/latest · DrugBank "Release Version 5.1.22" ("Important: All Academic downloads are temporarily paused."; curl, sha256 dff378e4…) · 2026-10-08 (adversarial review; DrugBank's own notice) |
| S20 | https://www.elysiumhealth.com/en-us/basis · Elysium Health "Basis" product page · 2026-10-08 |
| S21 | https://www.truniagen.com/ · Tru Niagen home page · 2026-10-08 |
| S22 | https://genomics.senescence.info/genes/entry.php?hgnc=SIRT1 and …?hgnc=MTOR · "The SIRT1 gene and its putative association with human ageing", "The MTOR gene and its putative association with human ageing" (GenAge) · 2026-10-08 |
| S23 | https://genomics.senescence.info/help.html · "Using the Human Ageing Genomic Resources" · 2026-10-08 |
| S24 | https://open-genes.com/api/gene/SIRT1 · Open Genes gene record SIRT1 · 2026-10-08 |
| S25 | https://ngdc.cncb.ac.cn/aging/index · Aging Atlas home ("Recent Update … 28 July 2026") · 2026-10-08 |
| S26 | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=33119753&retmode=xml · Aging Atlas Consortium "Aging Atlas: a multi-omics database for aging biology", Nucleic Acids Res 2021;49(D1):D825-D830, PMID 33119753 (PubMed record; curl, sha256 4001d606…) · 2026-10-08 (adversarial review; replaces a search snippet) |
| S27 | PubMed efetch (as S8) · López-Otín C et al. "Hallmarks of aging: An expanding universe", Cell 2023;186(2):243-278, PMID 36599349, DOI 10.1016/j.cell.2022.11.001 · 2026-10-08 |
| S28 | https://www.ebi.ac.uk/europepmc/webservices/rest/PMC6351883/fullTextXML · Konopka AR et al. "Metformin inhibits mitochondrial adaptations to aerobic exercise training in older adults", Aging Cell 2019;18(1):e12880, PMID 30548390, PMCID PMC6351883, DOI 10.1111/acel.12880 · 2026-10-08 |
| S29 | https://www.ebi.ac.uk/europepmc/webservices/rest/PMC6796530/fullTextXML · Hickson LJ et al. "Senolytics decrease senescent cells in humans: Preliminary report from a clinical trial of Dasatinib plus Quercetin in individuals with diabetic kidney disease", EBioMedicine 2019;47:446-456, PMID 31542391, PMCID PMC6796530, DOI 10.1016/j.ebiom.2019.08.069 · 2026-10-08 |
| S30 | Firecrawl research index (MCP `firecrawl_research_search_papers`), results: PMID 33492681 (DOI 10.1113/JP280825; preprint 10.1101/2020.06.23.143446), PMID 31710095 (DOI 10.1113/JP278752), PMID 32320006, PMID 35028529 · titles as returned (e.g. "Nicotinamide riboside does not alter mitochondrial respiration, content or morphology in skeletal muscle from obese and insulin-resistant men.") · 2026-10-08 (abstract snippets only; not captured in full) |
| S31 | https://clinicaltrials.gov/api/v2/studies/NCT02848131 · "Senescence, Frailty, and Mesenchymal Stem Cell Functionality in Chronic Kidney Disease: Effect of Senolytic Agents" · 2026-10-08 |
| S32 | https://www.jax.org/research-and-faculty/research-centers/aging-center/research/itp · JAX "Interventions Testing Program (ITP)" · 2026-10-08 |
| S33 | https://www.richmillerlab.com/Drugs · "Drugs that Slow Aging (ITP)" · 2026-10-08 |
| S34 | https://pmc.ncbi.nlm.nih.gov/articles/PMC2786175 · Harrison DE et al. "Rapamycin fed late in life extends lifespan in genetically heterogeneous mice", Nature 2009 (search result; DOI 10.1038/nature08221) · 2026-10-08 |
| S35 | PubMed MCP metadata · Moel M et al. "Influence of rapamycin on safety and healthspan metrics after one year: PEARL trial results", Aging (Albany NY) 2025;17(4):908-936, PMID 40188830, NCT04488601, DOI 10.18632/aging.206235 · 2026-10-08 |
| S36 | https://www.fightaging.org/archives/2026/04/the-interventions-testing-program-shows-that-another-eleven-compounds-do-not-slow-aging-in-mice · Fight Aging! (secondary, community) · 2026-10-08 |
| S37 | https://www.ebi.ac.uk/europepmc/annotations_api/annotationsByArticleIds?articleIds=PMC%3A6702140&format=JSON · Europe PMC Annotations for PMC6702140 · 2026-10-08 |
| S38 | http://www.indra.bio · "INDRA" (Integrated Network and Dynamical Reasoning Assembler) · 2026-10-08 |
| S39 | https://www.sec.gov/Archives/edgar/data/1388775/000095012308004519/y55298sc14d9c.htm · Sirtris SC 14D9-C, joint press release "GlaxoSmithKline To Acquire Sirtris Pharmaceuticals…" (2008) · 2026-10-08 |
| S40 | https://www.bostonglobe.com/business/2013/03/12/glaxosmithkline-moving-sirtris-five-years-after-buyout/unHXAjB3ZxfSAtMp0LQi5I/story.html · Boston Globe "GlaxoSmithKline to close Sirtris unit in Cambridge" (2013-03-12; secondary, quotes GSK) · 2026-10-08 |
| S41 | https://www.globenewswire.com/news-release/2020/08/17/2079116/0/en/unity-biotechnology-announces-12-week-data-from-ubx0101-phase-2-clinical-study-in-patients-with-painful-osteoarthritis-of-the-knee.html · "UNITY Biotechnology Announces 12-week data from UBX0101 Phase 2 Clinical Study in Patients with Painful Osteoarthritis of the Knee" · 2026-10-08 |
| S42 | https://www.altoslabs.com/ · Altos Labs home page (mission statement; link to launch press release) · 2026-10-08 |
| S43 | https://www.jinfiniti.com/product/intracellular-nad-test · "Intracellular NAD® Test: At-Home NAD+ Test Kit" · 2026-10-08 |
| S44 | https://github.com/cthoyt/drugbank-downloader · drugbank-downloader README (secondary; "Update from May 2026 - DrugBank has temporarily paused academic downloads") · 2026-10-08 |
| S45 | https://agelessrx.com/ · "AgelessRx: Anti-Aging Treatments Backed by Longevity Science" (Firecrawl scrape; curl returns a script shell only; page description "AgelessRx offers science-backed longevity prescriptions like Metformin, NAD+, and LDN"; Rapamycin listed "Starting at $65/ mo") · 2026-10-08 (adversarial review) |
| S46 | https://www.prnewswire.com/news-releases/altos-labs-launches-with-the-goal-to-transform-medicine-through-cellular-rejuvenation-programming-301463541.html · "Altos Labs launches with the goal to transform medicine through cellular rejuvenation programming" (PR Newswire, 2022-01-19; curl, sha256 94ee270e…) · 2026-10-08 (adversarial review) |
