# D5 — ecosystem survey: interventions, protocols, safety and targets

Agent A5 · research stage (Wave 1) · 2026-10-08 · research is not medical advice.

Scope reminder (brief): what people are told to do (interventions and public protocols with editions, steps, doses, cadences, constraints, measurement plans), what they must not do (adverse effects, safety signals, contraindications, interactions, use constraints by population, over-dosing), and the targets (goals) all of it is "for". Out of scope: personal adherence (private store), trial protocols as studies (D3), commerce of the intervention (D6).

**Citation convention.** Every factual claim carries a bracketed source id. The id resolves in the source table at the end of this file to `URL · title · retrieval date`. All retrievals were made on 2026-10-08 by the tools named in `_notes/tool-log.md`; raw captures and sha256 digests are in the session scratch (`ft/D5/raw/`, `ft/D5/sha256.txt`). Statements marked *(analysis)* are this agent's modeling inferences, not source facts.

---

## 1. Actor map (grouped by actor type)

| actor type | examples captured | what they do (processes, operations) | artifacts they produce | capturable? |
| --- | --- | --- | --- | --- |
| A. Regulators and pharmacovigilance | FDA (drug labels via SPL; FAERS; CAERS), Health Canada NNHPD, NIH/NLM as publisher | approve and label drugs; publish versioned labels; collect spontaneous adverse-event reports; license natural health products against monographs; define permitted claim types | SPL drug label (versioned), AE report records, AE dashboards, product monographs, regulations (21 CFR 101.93) | yes: APIs (openFDA, DailyMed, eCFR); HC monograph by URL |
| B. Government reference publishers | NIH ODS, NCCIH, NIH LiverTox (NCBI Bookshelf), CDC MMWR, NCI CTEP (CTCAE) | synthesize safety and efficacy for clinicians and consumers; set upper limits; grade adverse-event severity; report surveillance findings | fact sheets with history, herb safety pages, hepatotoxicity monographs, surveillance reports with errata, grading terminologies | partly: ODS API and default-UA curl get 403, the fact-sheet page loads with a browser User-Agent or an extractor (adversarial review re-test, `_notes/tool-log.md`); LiverTox blocked (reCAPTCHA) except PubMed record; MMWR via PubMed |
| C. Commercial clinical-decision databases | Natural Medicines (NatMed Pro), DrugBank, Lexicomp/Stockley's (not fetched), DDInter 2.0 (open) | curate interaction ratings, monographs, product databases; sell subscriptions | interaction pairs with severity/mechanism/management; monographs | licensed (NatMed, DrugBank); DDInter open web; NLM's free interaction API is gone |
| D. Protocol publishers (influencers, authors) | Huberman Lab newsletter toolkits; Bryan Johnson "Don't Die" Blueprint protocol | publish step lists with doses, timing and caveats; revise pages in place; monetize through affiliate codes and own product lines | protocol pages (versioned in place), newsletters, product links | yes (Tavily/Firecrawl); history only through the Wayback Machine |
| E. Longevity clinics and telehealth | AgelessRx (rapamycin, metformin, LDN, NAD+, tirzepatide programs) | prescribe off-label drugs for longevity targets after a screening visit; titrate; monitor labs; run and publish their own trials | program pages (dose model, contraindication screening, side effects, price), sponsored trials, trial publications | yes (page); trial via ClinicalTrials.gov and PubMed |
| F. Researchers and trialists | Ristow et al. 2009; Paulsen et al. 2014; PEARL (AgelessRx with UCLA) | run controlled studies of interventions on target-relevant outcomes, including null and harmful findings | papers (abstract, MeSH, DOI), registry records | yes (E-utilities, PubMed MCP, CT.gov v2) — study modeling is D3 |
| G. Community | rapamycin.news forum (topic URLs of the form /t/<slug>/<id>) | share dosing practices, side-effect anecdotes, cost hacks; sometimes deliberately exploit interactions | threads, posts | yes (Tavily extract); low evidence class |
| H. Consumer evidence synthesizers / goal taxonomies | Examine.com; MeSH (NLM) as identifier source | organize supplements and conditions by goal category; grade evidence (paywalled) | category → condition/goal trees, supplement guides | category tree yes; content largely JS/paywalled |

---

## 2. Actors in depth: processes, artifacts, fields

### A. Regulators and pharmacovigilance

**FDA drug labels (SPL) via openFDA and DailyMed.** openFDA returns 22 sirolimus labels from different labelers (generic ANDA holders, repackagers, and the NDA holder) [S8]. The NDA021110 label (Mylan, SPL set `5908cd1a-fc5a-462f-99ed-1d8983e253c9`) is at version 22, effective 2026-03-26 [S6]; DailyMed's history endpoint lists versions 1 (published Jan 17, 2014) through 22 (Mar 26, 2026) for the same set id [S7]. The DailyMed web services expose `/spls/{SETID}/history` ("Returns version history for specific SET ID") [S19]. *(analysis)* A label is therefore a natively versioned source with a stable set id and integer versions — the cleanest "edition" model in this domain, and a template for protocol editions.

Harm content in the label is not concentrated in "Contraindications": the sirolimus label contraindicates only hypersensitivity [S6], while the interactions that matter to longevity users sit in section 7: avoid strong CYP3A4/P-gp inducers and inhibitors; grapefruit juice "must not be taken with sirolimus"; St. John's Wort listed among agents that could decrease sirolimus concentrations; monitor and consider dose reduction with cannabidiol [S6]. The boxed warning covers immunosuppression, infection and lymphoma risk [S6]. A repackager's copy of the label carries a "Recent Major Changes" entry "Warnings and Precautions, Cannabidiol Drug Interactions ( 5.21 ) 8/2022" [S8] — safety content changes over label versions. *(analysis)* So the safety layer must model directive strength (contraindicated vs avoid vs caution vs monitor) as a value on the constraint, not infer harm from the section name.

The ZITUVIMET (sitagliptin/metformin) label presents interactions as a table of rows with "Clinical Impact", "Intervention" and "Examples" (e.g., carbonic anhydrase inhibitors; drugs that reduce metformin clearance; alcohol — "Warn patients against alcohol intake") and contraindicates severe renal impairment (eGFR below 30 mL/min/1.73 m2) and metabolic acidosis [S9]. *(analysis)* Contraindications are often population/condition thresholds with numbers (eGFR < 30), so a constraint needs a comparator, value and unit, not only text.

**FAERS (drugs) and CAERS (foods, supplements, cosmetics).** The openFDA CAERS documentation states that reporting is voluntary for dietary supplements except that "manufacturers, packers, and distributers must notify the FDA if they receive reports about serious adverse events", that reports "do not undergo extensive validation or verification", and that "a causal relationship cannot be established between product and reactions listed in a report" [S14]. The FAERS dashboard FAQ adds that there is "no certainty that the reported event was due to the product", that duplicates exist, and that FAERS data "cannot be used to calculate the incidence of an adverse event" [S17]. A CAERS query for products named "melatonin" returns 661 reports; reaction counts include Diarrhoea 48, Nausea 46, Vomiting 43 — and the same MedDRA term appears in two casings (`Diarrhoea` 48, `DIARRHOEA` 21) [S15]. A FAERS count for sirolimus returns OFF LABEL USE 2,055, DRUG INEFFECTIVE 1,116 and DRUG INTERACTION 448 report mentions among its top terms [S16]. *(analysis)* A report count is never a safety fact; a SafetySignal must be an assessment with a method version over such inputs, and the counts need term normalization first.

**Health Canada natural health product monographs.** The melatonin (oral) monograph, dated December 19, 2025, is a structured artifact: proper/common names; route; uses phrased as permitted claims with an explicit sleep facet ("sleep onset latency aspect of sleep quality"; "total sleep time (aspect of sleep quality)"; "re-set the body's sleep-wake cycle"); doses by subpopulation and use ("Adults 18 years and older … All uses except jet lag 0.1-10 milligrams of melatonin, per day"; jet lag 0.5–10 mg); directions ("Take as needed, 30 to 60 minutes before bedtime"); cautions naming co-medications and conditions; a contraindication ("Do not use if you are pregnant or breastfeeding"); and known adverse reactions ("Stop use if allergy occurs or if you experience headache, confusion, or nausea") [S12]. *(analysis)* This is the best-structured "what is it for / how much / who must not" artifact found; its "aspect of" phrasing argues for child facets under a target (sleep → onset latency, total sleep time, circadian timing).

**21 CFR 101.93.** Dietary supplement labels may bear structure/function statements "provided that such statements are not disease claims"; a product bearing a disease claim "will be subject to regulation as a drug"; the regulation defines a disease as "damage to an organ, part, structure, or system of the body such that it does not function properly … or a state of health leading to such dysfunctioning", and prescribes the disclaimer "This statement has not been evaluated by the Food and Drug Administration…" [S13]. *(analysis)* This regulatory line is a principled boundary for the targets vocabulary: targets are structure/function goals (sleep, strength, energy); disease intent goes to Condition (D2). AgelessRx carries the disclaimer on its rapamycin page [S5].

### B. Government reference publishers

**NIH ODS fact sheets.** The Magnesium Health Professional fact sheet states the Tolerable Upper Intake Level (UL) for supplemental magnesium is 350 mg for adults (65–350 mg for children by age), that the UL covers only supplements and medications ("they do not include magnesium found naturally in food and beverages"), gives a UL table by life stage including pregnant and lactating columns (350 mg for 19–30 and 31–50), lists toxicity effects of very high doses, and lists medication interactions (bisphosphonates, tetracyclines, quinolones; diuretics and PPIs affecting status) with spacing advice ("at least 2 hours before or after oral bisphosphonates") [S10]. It ends with "Updated: January 6, 2026" and a "History of changes to this fact sheet" link [S10]. *(analysis)* ODS gives population-specific, dose-thresholded harm (over-dosing) — exactly the "dose band × population" scope of the pinned `UseConstraint` — and it versions in place with a public change history.

**NCCIH herb pages.** The St. John's wort page states that "It has been clearly shown that St. John's wort can interact in dangerous, sometimes life-threatening ways with a variety of medicines", lists drug classes whose effects it weakens (including cyclosporine "which prevents the body from rejecting transplanted organs", birth control pills, warfarin, some statins), flags serotonin-related effects, and pregnancy and breastfeeding risks [S11]. *(analysis)* Same interaction, two independent authorities (NCCIH from the herb side; the sirolimus label from the drug side [S6]) — the model must merge both into one interaction pair with two asserters, not two facts.

**LiverTox.** The LiverTox record for ashwagandha (PubMed 31643854; the PubMed record carries the date 2024-12-03) says ashwagandha "has not been implicated in causing serum enzyme elevations during therapy but recently has been implicated in cases of clinically apparent liver injury" [S29]. The NCBI Bookshelf page itself was unreachable by Tavily, Firecrawl and curl (reCAPTCHA) [S34]. Blueprint's female protocol lists "Ashwagandha 300-600 mg and Rhodiola Rosea 200-400 mg daily" [S4] — *(analysis)* a cross-source harm join (protocol step × hepatotoxicity monograph) the graph must support.

**CDC MMWR surveillance.** "Pediatric Melatonin Ingestions — United States, 2012–2021" reports 260,435 pediatric melatonin ingestions to the National Poison Data System over ten years, a 530% increase, with five children requiring mechanical ventilation and two deaths [S28]; an erratum to that report was published (PMID 35797208) [S28]. *(analysis)* Surveillance reports are assessments of exposure risk at population level (unintended exposure, not use for a target), and they get corrected — the correction chain must stay visible.

**NCI CTCAE.** NCI states that CTCAE v6.0 was released in 2025 (mapped to MedDRA 28.0), with v5.0 (2017, MedDRA 20.1) and earlier versions still published [S23]. *(analysis)* Severity grading is versioned terminology; the pinned `SafetySeverity` enum (MILD … LIFE_THREATENING) should record which grading scheme a severity came from.

### C. Commercial and open clinical-decision databases

NLM's RxNav "drug/drug interaction features were discontinued on January 2, 2024", pointing users to its former sources: "(1) 'High-priority drug–drug interactions for use in electronic health records', supplemented using CredibleMeds' list of drugs that have a known risk of Torsades de Pointes (TdP); and (2) DrugBank's drug/drug interaction dataset" [S20]. *(analysis: the high-priority list is the ONC-sponsored expert-panel list published by Phansalkar et al. 2012, PMC3422823; the FAQ itself does not name ONC — corrected in the adversarial review.)* DDInter 2.0 presents itself as "open-access" with drug-drug, drug-food and drug-disease interactions, "mechanism descriptions, risk levels, management strategies" [S21]. Natural Medicines (NatMed Pro) sells an interaction checker "between drugs and natural medicines, including multi-ingredient supplements" with "evidence-based interaction ratings", starting at $15.17 per month ($182 one-time) [S22]; ODS itself cites the Natural Medicines Comprehensive Database as a reference for magnesium interactions [S10]. *(analysis)* There is no free, agent-ready, authoritative supplement–drug interaction API. The graph's interaction layer will be assembled from labels, ODS/NCCIH pages and papers (each a located assertion), with licensed databases as a later source; interaction severity values are source-specific vocabularies that must be stored verbatim plus mapped.

### D. Protocol publishers

**Huberman Lab — "Toolkit for Sleep".** The page is dated "September 20, 2021" [S1] and is a numbered list of 12 items mixing behaviors (morning sunlight viewing with durations by cloud cover; fixed wake time; "**3) Avoid caffeine within 8-10 hours of bedtime**"; temperature; "**11) Drinking alcohol messes up your sleep. As do most sleep medications.**") and a supplement step "**8) You might consider taking (30-60 min before bed):**" with alternatives ("145mg Magnesium Threonate or 200mg Magnesium Bisglycinate"), fixed doses (50mg apigenin; 100–400mg theanine), a partial cadence ("3-4 nights per week I also take 2g of Glycine and 100mg GABA"), a population caution ("Don't take theanine if you have overly intense dreams, sleep-walk, or have night terrors"), an adverse-effect frequency ("some people (~5%), get an agitated stomach from magnesium supplementation, in which case, do not take it") and an affiliate line for Momentous ("You can get 20% off all Momentous supplements") [S1].

The October 2021 Wayback capture of the earlier URL shows the same doses but a different commercial line: "I use supplements from Thorne for all of the above, except the Apigenin" with a 20% Thorne discount, and "50mg Apigenin (Swanson is the only source I know of; we have no affiliation to Swanson)" [S2]. The CDX index lists 83 distinct-digest captures of the current URL since 2023-09 [S3]. *(analysis)* The page kept its 2021 date while its content changed in place: the "date" on a protocol page is not an edition date; editions must be derived from dated captures (snapshot diff), and the diff here changes the financial interest, not the steps.

**Bryan Johnson — Blueprint / "Don't Die" protocol.** One long page signed "Planet Earth, 2026" [S4], organized by target-like sections (Sleep, Exercise, Nutrition, skin, oral care, hair, female protocol, pregnancy, measurement, daily routine). It contains: a table of what raises resting heart rate before bed ("Alcohol before bedtime | 5-10 bpm", late-day caffeine, large evening meals …) framed as harms to sleep; numbered sleep habits; exercise prescriptions ("Exercise 6 hours a week … 3 sessions of strength training … 3 sessions of cardio"); a pregnancy section listing stack items to be **avoided** during pregnancy ("Longevity Mix, Ashwagandha, Curcumin, Red Yeast Rice, Nicotinamide Riboside, CA-AKG, Glucosamine Sulfate, Creatine, Sodium Hyaluronate, N-Acetyl-Cysteine.") and supplements to "Consider **adding**", including "2. Magnesium 500-600 mg daily."; a measurement plan ("Blood draw, every 3-6 months"); and many links to the author's own product store [S4]. The page links a "protocol museum" of earlier states [S4]. *(analysis)* Two modeling consequences: (1) the protocol is a container of sub-protocols per target, so "which target does this step serve" is per step, not per protocol; (2) the pregnancy magnesium dose (500–600 mg, listed as a supplement to add) exceeds the ODS UL for supplemental magnesium in pregnancy (350 mg) [S10] — a computed cross-source conflict, not a stored "unsafe" flag.

### E. Longevity clinics and telehealth

**AgelessRx — Rapamycin Rx.** The program page describes once-weekly dosing on a "provider-guided titration schedule", generic vs compounded sirolimus, common side effects (mouth ulcers, nausea, diarrhea), an interaction list ("These include cyclosporine, rifampin, ketoconazole, cidofovir, ritonavir, mifepristone, posaconazole, fluconazole, and grapefruit juice."), use constraints ("Do not take Rapamycin if you are pregnant or breastfeeding…"; "Stop taking Rapamycin at least one month before surgery."; chronic infection or immune dysfunction), eligibility ("adults aged 40 and older who are clinically stable, willing to complete required blood work"), a price ("$65/month"), and the regulatory caveat "It is not FDA approved to slow aging, extend lifespan, or improve healthspan." [S5]. It promotes its own PEARL trial and states "The trial's primary measure–visceral fat–didn't show a significant change" while highlighting secondary findings [S5]. The site navigation has a "Health Goals" menu [S5]. *(analysis)* A clinic program is an intervention offering (D6 commerce) wrapped around a protocol (titration, monitoring) and a constraint set; its trial is sponsor-run (financial interest seam to D7).

**PEARL trial.** ClinicalTrials.gov NCT04488601: lead sponsor AgelessRx (INDUSTRY), collaborator UCLA, arms "Rapamycin 5", "Rapamycin 10", placebo, primary outcome visceral fat by DXA, status COMPLETED, no results posted on the registry [S27]. The publication (Moel et al., Aging 2025; PMID 40188830; DOI 10.18632/aging.206235; PMCID PMC12074816) reports 5 or 10 mg compounded rapamycin weekly for 48 weeks; "Adverse and serious adverse events were similar across all groups"; "Visceral adiposity did not change significantly"; improvements in lean tissue mass and pain in women on 10 mg and some self-reported measures; all listed authors are affiliated with AgelessRx [S26]. *(analysis)* A disconfirmation case (null primary) that is also a harm case (safety at a specific dose/schedule) and a conflict-of-interest case — and an applicability case: the clinic's titrated prescription is not the trial's fixed 5/10 mg arms.

### F. Researchers (harm and disconfirmation literature on interventions × targets)

Ristow et al. (PNAS 2009; PMID 19433800; DOI 10.1073/pnas.0903485106; PMCID PMC2680430): vitamin C (1000 mg/day) plus vitamin E (400 IU/day) during 4 weeks of exercise in young men; "Exercise increased parameters of insulin sensitivity (GIR and plasma adiponectin) only in the absence of antioxidants"; "Supplementation with antioxidants may preclude these health-promoting effects of exercise in humans" [S24]. Paulsen et al. (J Physiol 2014; PMID 24492839; DOI 10.1113/jphysiol.2013.267419; PMCID PMC4001759): double-blind RCT, 1000 mg vitamin C + 235 mg vitamin E for 11 weeks; supplementation "attenuated increases in markers of mitochondrial biogenesis" but "no clear interactions were detected for improvements in VO2 max and running performance" [S25]. *(analysis)* This pair shows (1) an intervention–intervention interaction where a supplement worsens the effect of a lifestyle practice on a target (glycemic control / endurance), which the pinned `InteractionAssertion` (drug–drug framing) does not obviously cover; (2) the result depends on the outcome measured (molecular markers vs performance) — direction of effect must be per outcome/measure, i.e. MIXED at the target level.

### G. Community

The rapamycin.news thread "Improve Bioavailability of Rapamycin (2)" states "Taking rapamycin with grapefruit juice can dramatically increase the "effective dose" by a factor of 3X to 7X or higher" and frames it as a cost reduction, while adding "This is not a recommended protocol for people, but is only offered here for informational purposes" [S30]. A second thread asks "has anyone had experience with ritonavir to boost" sirolimus because of cost in Europe [S31]. The sirolimus label says grapefruit juice "must not be taken with sirolimus" and lists ritonavir among drugs that could increase sirolimus concentrations [S6]. Forum search also surfaces threads on cold sores, mouth sores and side effects [S35]. *(analysis)* The same interaction is asserted by a regulator as a hazard and by a community as a dose-sparing practice: the interaction (mechanism and direction of exposure change) is one fact; "avoid" and "use deliberately" are two directives by two asserters. The model must keep these apart, and the biohacker question "is this hack dangerous" is a harm question answered by joining them.

### H. Goal taxonomies (input to the targets vocabulary)

Examine organizes content as a two-level tree of categories (e.g., Sleep; Muscle Gain & Exercise; Healthy Aging & Longevity; Energy & Fatigue; Brain Health; Fat Loss; Mental Health) whose children mix goals ("Muscle Size & Strength", "Healthy Muscle Aging", "Aerobic Exercise Performance") with diseases ("Insomnia", "Obstructive Sleep Apnea (OSA)", "Sarcopenia") [S32]. NLM MeSH has exact descriptors for most owner-named goals: Sleep D012890, Sleep Quality D000089943, Muscle Strength D053580, Cognition D003071, Body Composition D001823, Longevity D008136, Healthy Aging D000073656, Affect D000339, Fatigue D005221, Mental Fatigue D005222, Physical Endurance D010807, Recovery of Function D020127, Sexual Health D000074384 [S33]. Health Canada's melatonin uses decompose "sleep quality" into aspects (onset latency, total sleep time, circadian rhythm) [S12]; 21 CFR 101.93 separates structure/function from disease claims [S13]; Blueprint's sections and AgelessRx's "Health Goals" menu show publishers and clinics organizing by goal [S4][S5]. The Wave 0 vocabulary (`vocab-targets.yaml` 0.1.0) already maps 15 targets to Examine, PROMIS, ICF, ICOPE and wearable scores (citations in `_notes/vocab-targets-notes.md`). *(analysis)* Examine's mixing of goals and diseases is exactly the ambiguity the vocabulary resolves by excluding Conditions; MeSH descriptors are a free, agent-ready identifier scheme for Target nodes (add as `identifierSchemes: [MESH]`).

---

## 3. Artifact interviews (≥ 2 real instances per artifact type, fields observed)

### 3.1 Public protocol page (instances: Huberman Toolkit for Sleep [S1][S2]; Blueprint protocol [S4]; AgelessRx Rapamycin program [S5])

| field observed | Huberman | Blueprint | AgelessRx |
| --- | --- | --- | --- |
| title / protocol identity | "Toolkit for Sleep" | "Bryan's Protocol" / Blueprint | "Rapamycin Rx" |
| displayed date | "September 20, 2021" (unchanged across content edits) | "Planet Earth, 2026" sign-off; "2025" in text | none |
| edition evidence | Wayback captures; content diff (Thorne → Momentous) | "protocol museum" link to earlier states | none |
| goal / target framing | whole page = sleep | per section (Sleep, Exercise, Nutrition, skin …) | longevity / healthspan; site "Health Goals" menu |
| steps (ordered) | numbered 1–12 | numbered lists per section | titration "schedule" (not public) |
| step kind | behavior, avoidance, supplement intake | behavior, avoidance, intake, measurement | drug administration, lab monitoring |
| substance + dose | fixed (50 mg), range (100–400 mg), alternatives (145 mg threonate OR 200 mg bisglycinate) | ranges (300–600 mg), daily totals, macros | not stated (provider-set) |
| timing / cadence | "30-60 min before bed"; "3-4 nights per week" | "four hours before bed"; "every 3-6 months"; weekly session counts | "once weekly" |
| constraints / cautions | theanine: intense dreams, sleep-walking, night terrors | pregnancy avoid-list; injury caveats | pregnancy, breastfeeding, surgery (stop ≥ 1 month), chronic infection, immune dysfunction |
| adverse effects | "~5%" stomach upset from magnesium | — | mouth ulcers, nausea, diarrhea; infection susceptibility "being investigated" |
| interactions | — | — | named drugs + grapefruit juice |
| measurement plan | — | blood draw 3–6 months; MRI if > 40 | "required blood work", continued monitoring |
| evidence cited | podcast episodes, expert names | PubMed links per claim | own PEARL trial, footnotes |
| financial interest | affiliate discount (Momentous; Thorne in 2021) | links to own product store | sells the intervention ($65/month) and ran the trial |

### 3.2 Regulator drug label (SPL) (instances: sirolimus NDA021110 v22 [S6]; sirolimus repackager v1 [S8]; ZITUVIMET [S9])

Fields (openFDA JSON keys, LOINC-backed SPL sections): `set_id`, `id` (SPL version id), `version`, `effective_time`, `openfda.{application_number, brand_name, generic_name, manufacturer_name, product_ndc, route, substance_name, rxcui, unii, pharm_class_epc, pharm_class_moa, spl_set_id}`, `boxed_warning`, `recent_major_changes` (when present), `indications_and_usage`, `dosage_and_administration`, `dosage_forms_and_strengths`, `contraindications`, `warnings_and_cautions`, `adverse_reactions` (+ `_table`), `drug_interactions`, `use_in_specific_populations`, `pregnancy`, `pediatric_use`, `geriatric_use`, `overdosage`, `mechanism_of_action`, `pharmacokinetics`, `clinical_studies`, `information_for_patients`, `spl_medguide`, `package_label_principal_display_panel` [S6][S8][S9]. Version history: `spl_version`, `published_date` [S7]. Observations: contraindications can be minimal while warnings/interactions carry the harm [S6]; interaction rows are structured as impact / intervention / examples in some labels [S9]; sub-section numbers (7.3, 5.21) are stable locator anchors inside text blobs *(analysis)*.

### 3.3 Reference fact sheet / monograph (instances: ODS Magnesium HP [S10]; NCCIH St. John's wort [S11]; Health Canada melatonin monograph [S12]; LiverTox ashwagandha record [S29])

| field | ODS | NCCIH | Health Canada | LiverTox (PubMed record) |
| --- | --- | --- | --- | --- |
| identity | ingredient fact sheet, HP/consumer variants | herb page (common + Latin names) | ingredient monograph (proper/common names, source, route) | book chapter title, PMID |
| version | "Updated: January 6, 2026" + change history | page date (not captured) | "Date December 19, 2025" | record date 2024-12-03 |
| uses / purpose | health roles by condition | "most widely promoted for symptoms of depression" | permitted claims with sleep aspects | "general tonic … reduce stress and anxiety" |
| dose | RDAs, UL table by life stage incl. pregnant/lactating | "up to 12 weeks" safety statement | dose ranges by subpopulation and use; directions; duration | — |
| harms | toxicity signs, fatal cases, forms causing diarrhea | photosensitivity, side effects, pregnancy/breastfeeding | cautions (co-meds, conditions, alcohol, driving 5 h), contraindication, known adverse reactions | liver injury implication |
| interactions | per drug class with mechanism and spacing advice | per drug class (weakens effects; serotonin) | "ask a practitioner" if on listed drug classes | — |
| citations | numbered references with PubMed links | links | inline author-year | references (book) |

### 3.4 Spontaneous adverse-event report (instances: CAERS melatonin report 66384 and aggregate counts [S15]; FAERS sirolimus aggregate counts [S16])

CAERS record fields: `report_number`, `date_created`, `date_started`, `outcomes[]`, `reactions[]` (MedDRA terms, inconsistent casing), `consumer.{age, age_unit, gender}`, `products[].{role (SUSPECT…), name_brand, industry_code, industry_name}` [S15]. FAERS count endpoint: `patient.reaction.reactionmeddrapt` term counts by drug [S16]. Caveats from the publisher: no causality, no verification, under-reporting, duplicates, no incidence [S14][S17].

### 3.5 Intervention trial (paper + registry) (instances: PEARL paper and NCT04488601 [S26][S27]; Ristow 2009 [S24]; Paulsen 2014 [S25])

Fields D5 depends on (D3 owns the study model): intervention material and form (compounded vs commercial), dose and schedule (5 or 10 mg weekly; 1000 mg vitamin C + 400 IU / 235 mg vitamin E daily), duration (48 / 4 / 11 weeks), co-intervention (exercise program), population, primary/secondary outcomes, direction per outcome, adverse-event summary, sponsor and author affiliations, DOI/PMID/PMCID/NCT.

### 3.6 Surveillance and hepatotoxicity reports (instances: MMWR pediatric melatonin + erratum [S28]; LiverTox ashwagandha [S29])

Fields: exposure population (≤ 19 years), data system (NPDS), period, counts and trend, severity outcomes (ventilation, deaths), recommendations ("report … to MedWatch"), correction link (erratum PMID); for LiverTox: likelihood statement, revision date.

### 3.7 Community thread (instances: rapamycin.news "Improve Bioavailability of Rapamycin (2)" [S30]; "Introduction // Ritonavir for rapamycin-boosting" [S31])

Fields: thread title, URL/topic id, posts (author handle, self-described credentials e.g. "acute care physician", text), quoted literature, explicit disclaimers, cost figures, images. Evidence class: personal experience / opinion; useful for "what people actually do" and for harm discovery, never for effect evidence *(analysis)*.

### 3.8 Goal taxonomy (instances: Examine categories [S32]; MeSH descriptors [S33]; Health Canada "aspect of sleep quality" uses [S12])

Fields: category label, child entries (goals mixed with conditions), stable URL slugs (Examine); descriptor UI + label (MeSH); claim text with aspect qualifiers (HC).

---

## 4. Lenses

**Science.** Primary harm knowledge lives in regulator labels (versioned, sectioned) [S6][S7], government fact sheets and monographs with upper limits and population rules [S10][S11][S12], hepatotoxicity monographs [S29], surveillance reports [S28], and controlled studies including null and harmful findings [S24][S25][S26]. Spontaneous reports are hypothesis-generating only [S14][S17]. Severity terminology is versioned (CTCAE v6.0, 2025) [S23].

**Economics.** Clinics sell longevity interventions as subscriptions ($65/month rapamycin program) and run their own trials [S5][S27]; protocol publishers monetize through affiliate discounts and their own stores, and the commercial partner of a protocol can change without the protocol changing (Thorne → Momentous) [S1][S2][S4]; interaction intelligence is a licensed product (NatMed Pro from $15.17/month) [S22] and NLM withdrew its free interaction API [S20]; community members trade safety for cost (grapefruit or ritonavir boosting) [S30][S31]. Supplement makers must forward serious AE reports to FDA [S14].

**Community.** Influencer protocols reach large audiences and change in place [S1][S3]; forum users share regimens, side effects and hacks [S30][S31][S35]. These sources assert recommendations and personal experience; they are the main source of "what people actually do" and of harm hypotheses.

**AI / agent readiness.** See §5. Key findings: regulator data is agent-ready (openFDA, DailyMed, eCFR, CT.gov v2, E-utilities); LiverTox is behind bot protection (reCAPTCHA) for direct HTTP [S34]; the NIH ODS API and the fact-sheet page answer 403 to curl's default User-Agent but the page answers 200 with a browser User-Agent (`_notes/tool-log.md`, adversarial review; the earlier wording cited S34 for ODS, which was wrong); protocol history requires the Wayback CDX (intermittent) [S3]; no free interaction API exists [S20]; label sections are long text blobs, so locators need offsets within LOINC sections *(analysis)*.

---

## 5. Capturable sources and agent-readiness (scored 0–3: blocked, scrape-only, api-no-locators, agent-ready)

| source | access exercised | auth / limits | identifiers emitted | locator kinds | readiness | gap |
| --- | --- | --- | --- | --- | ---: | --- |
| openFDA drug/label | curl JSON | none; 240/min, 1,000/day without key; 120,000/day with key [S18] | set_id, SPL id, version, NDC, RxCUI, UNII, application number | section field + char offset | 3 | brand search inconsistent; no sub-section split |
| DailyMed v2 SPL + history | curl JSON | none | set id, spl_version | SPL section (LOINC), version | 3 | — |
| openFDA food/event (CAERS) | curl JSON | as above | report_number, MedDRA terms | record id + field | 3 (as data; not evidence) | term casing normalization |
| openFDA drug/event (FAERS) | curl JSON counts | as above | safetyreportid, MedDRA PT | record id + field | 3 (as data) | dedup; no incidence |
| NIH ODS fact sheets | Tavily extract; Firecrawl scrape; curl with a browser User-Agent (review re-test: HTTP 200, 253,520 bytes, Table 3 rows and "January 6, 2026" present) | API and default-UA curl → 403 | none (URL) | heading anchors (#h20 …) + quote | 2 | API blocked headless; page fetchable with a browser UA or an extractor; history page not captured (readiness 1 → 2 in the review) |
| NCCIH herb pages | Tavily extract | none | URL | heading + quote | 2 | no API |
| Health Canada NHPID monographs | curl HTML | none; wrong `atid` returns 404 page with HTTP 200 | monograph atid, date | section heading + quote | 2 | silent-failure detection |
| eCFR versioner API | curl XML | compression header required; date ≤ up_to_date_as_of | CFR citation, date | paragraph (f), (g) | 3 | — |
| LiverTox (NCBI Bookshelf) | blocked (reCAPTCHA); PubMed record via E-utilities | — | NBK id, PMID | abstract only | 1 | full text needs browser fallback or bulk download |
| PubMed / E-utilities, PubMed MCP | curl XML; MCP | none (3 req/s) | PMID, DOI, PMCID | abstract sentence offset | 3 | full text only for PMC subset |
| ClinicalTrials.gov v2 | curl JSON | none | NCT | JSON path | 3 (history endpoint 403 → D3) | version history via public API pending |
| Protocol pages (Huberman, Blueprint, clinics) | Tavily extract; Firecrawl | none | URL only | text quote + offset in snapshot | 2 | no versioning; needs scheduled capture or change tracking |
| Wayback CDX + replay | curl | none; intermittent "Temporarily Offline" | capture timestamp, digest | snapshot timestamp + quote | 2 | retries; digest noise |
| Community forums (Discourse) | Tavily extract + Discourse topic JSON (`/t/<id>.json`) | none | topic id, post number, username, created_at / updated_at, post version | post id + quote; JSON_POINTER | 3 | research-stage row said "Discourse JSON not yet tried"; the fixtures stage used it (t/86: RapAdmin, version 20, wiki false) — see `08-sources-and-tools.md` tool:discourse-json |
| Examine | Firecrawl (JS) | paywall for detail | category slugs | — | 1 | goal tree only |
| MeSH lookup | curl JSON | none | MeSH descriptor UI | — | 3 | — |
| NatMed Pro, DrugBank, Lexicomp | not exercised | licensed | proprietary ids | — | 0 | licence decision |
| DDInter 2.0 | home page only | open web | DDInter ids | — | 1 | API/bulk terms not checked |
| RxNav interactions | discontinued 2024-01-02 [S20] | — | — | — | 0 | use labels/ONC list |

---

## 6. Sources (id · URL · title · retrieval date)

| id | URL | title | retrieved |
| --- | --- | --- | --- |
| S1 | https://www.hubermanlab.com/newsletter/toolkit-for-sleep | Toolkit for Sleep (Huberman Lab Neural Network newsletter) | 2026-10-08 |
| S2 | http://web.archive.org/web/20211016002820id_/https://hubermanlab.com/toolkit-for-sleep/ | Toolkit for Sleep — Internet Archive capture of 2021-10-16 (re-tested 2026-10-08 in the adversarial review: HTTP 200, Memento-Datetime 2021-10-16 00:28:20 GMT, same supplier text). The fixtures stage was redirected (HTTP 302) to capture 20211018160634 (Memento-Datetime 2021-10-18 16:06:34 GMT); the sleep fixture's 2021 snapshot is that 2021-10-18 capture: http://web.archive.org/web/20211018160634id_/https://hubermanlab.com/toolkit-for-sleep/ | 2026-10-08 |
| S3 | http://web.archive.org/cdx/search/cdx?url=hubermanlab.com/newsletter/toolkit-for-sleep&output=json&collapse=digest | Wayback Machine CDX index for the Toolkit for Sleep URL | 2026-10-08 |
| S4 | https://protocol.bryanjohnson.com/ | protocol - DON'T DIE (Bryan Johnson, Blueprint protocol) | 2026-10-08 |
| S5 | https://www.agelessrx.com/rapamycin/ | Rapamycin \| AgelessRx | 2026-10-08 |
| S6 | https://api.fda.gov/drug/label.json?search=set_id:%225908cd1a-fc5a-462f-99ed-1d8983e253c9%22&limit=1 | openFDA drug label — Sirolimus, Mylan Pharmaceuticals, NDA021110, SPL version 22, effective 2026-03-26 | 2026-10-08 |
| S7 | https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/5908cd1a-fc5a-462f-99ed-1d8983e253c9/history.json | DailyMed SPL history — SIROLIMUS TABLET, SUGAR COATED [MYLAN PHARMACEUTICALS INC.] | 2026-10-08 |
| S8 | https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22sirolimus%22&limit=25 | openFDA drug label search — 22 sirolimus labels (incl. REMEDYREPACK set 09f24e7a-0bea-4e02-b557-c60eb842d41a v1, "Recent Major Changes") | 2026-10-08 |
| S9 | https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22metformin%22+AND+_exists_:boxed_warning&limit=1 | openFDA drug label — ZITUVIMET (sitagliptin and metformin), Zydus, set 0098dec4-f0e5-45d5-8aa4-5d0faf9ab142 | 2026-10-08 |
| S10 | https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/ | Magnesium — Fact Sheet for Health Professionals (NIH Office of Dietary Supplements) | 2026-10-08 |
| S11 | https://www.nccih.nih.gov/health/st-johns-wort | St. John's Wort: Usefulness and Safety \| NCCIH | 2026-10-08 |
| S12 | https://webprod.hc-sc.gc.ca/nhpid-bdipsn/atReq?atid=melatonin.oral2&lang=eng | Natural Health Products Ingredients Database — Melatonin (oral) monograph, Health Canada | 2026-10-08 |
| S13 | https://www.ecfr.gov/api/versioner/v1/full/2026-10-06/title-21.xml?part=101&section=101.93 | 21 CFR 101.93 Certain types of statements for dietary supplements (eCFR, as of 2026-10-06) | 2026-10-08 |
| S14 | https://open.fda.gov/apis/food/event | Adverse Food Event Overview (openFDA, CAERS) | 2026-10-08 |
| S15 | https://api.fda.gov/food/event.json?search=products.name_brand:%22melatonin%22&count=reactions.exact&limit=15 (and `&limit=2` record query) | openFDA CAERS — melatonin reports and reaction counts | 2026-10-08 |
| S16 | https://api.fda.gov/drug/event.json?search=patient.drug.openfda.generic_name:%22sirolimus%22&count=patient.reaction.reactionmeddrapt.exact&limit=10 | openFDA FAERS — sirolimus reaction term counts | 2026-10-08 |
| S17 | https://fis.fda.gov/extensions/FPD-FAQ-OCAC/FPD-FAQ-OCAC.html | FAERS Public Dashboard — FAQ | 2026-10-08 |
| S18 | https://open.fda.gov/apis/authentication/ | openFDA — Authentication (rate limits) | 2026-10-08 |
| S19 | https://dailymed.nlm.nih.gov/dailymed/app-support-web-services.cfm | DailyMed Web Services | 2026-10-08 |
| S20 | https://lhncbc.nlm.nih.gov/RxNav/information/FAQs.html | FAQs — RxNav | 2026-10-08 |
| S21 | https://ddinter2.scbdd.com | DDInter 2.0 | 2026-10-08 |
| S22 | https://trchealthcare.com/product/natmed-pro | NatMed Pro \| Natural Medicines Database \| TRC Healthcare | 2026-10-08 |
| S23 | https://dctd.cancer.gov/research/ctep-trials/for-sites/adverse-events | CTCAE and AE Reporting — NCI | 2026-10-08 |
| S24 | https://pubmed.ncbi.nlm.nih.gov/19433800/ (efetch XML) | Ristow M et al. Antioxidants prevent health-promoting effects of physical exercise in humans. PNAS 2009;106(21):8665-70. PMID 19433800 · DOI 10.1073/pnas.0903485106 · PMCID PMC2680430 | 2026-10-08 |
| S25 | https://pubmed.ncbi.nlm.nih.gov/24492839/ (efetch XML) | Paulsen G et al. Vitamin C and E supplementation hampers cellular adaptation to endurance training in humans. J Physiol 2014;592(8):1887-901. PMID 24492839 · DOI 10.1113/jphysiol.2013.267419 · PMCID PMC4001759 | 2026-10-08 |
| S26 | https://pubmed.ncbi.nlm.nih.gov/40188830/ (efetch XML) | Moel M et al. Influence of rapamycin on safety and healthspan metrics after one year: PEARL trial results. Aging 2025;17(4):908-936. PMID 40188830 · DOI 10.18632/aging.206235 · PMCID PMC12074816 · NCT04488601 | 2026-10-08 |
| S27 | https://clinicaltrials.gov/api/v2/studies/NCT04488601 | ClinicalTrials.gov — PEARL (NCT04488601) | 2026-10-08 |
| S28 | https://pubmed.ncbi.nlm.nih.gov/35653284/ (efetch XML); erratum https://pubmed.ncbi.nlm.nih.gov/35797208/ | Lelak K et al. Pediatric Melatonin Ingestions — United States, 2012–2021. MMWR 2022;71(22):725-729. PMID 35653284 · DOI 10.15585/mmwr.mm7122a1 · PMCID PMC9169525; Erratum PMID 35797208 · DOI 10.15585/mmwr.mm7127a4 | 2026-10-08 |
| S29 | https://pubmed.ncbi.nlm.nih.gov/31643854/ (efetch XML) | LiverTox: Ashwagandha (NCBI Bookshelf NBK548536). PMID 31643854 | 2026-10-08 |
| S30 | https://www.rapamycin.news/t/improve-bioavailability-of-rapamycin-2/86 | Improve Bioavailability of Rapamycin (2) — Rapamycin Longevity News forum | 2026-10-08 |
| S31 | https://www.rapamycin.news/t/introduction-ritonavir-for-rapamycin-boosting/12779 | Introduction // Ritonavir for rapamycin-boosting — Rapamycin Longevity News forum | 2026-10-08 |
| S32 | https://examine.com/categories/ | All Health Categories on Examine | 2026-10-08 |
| S33 | https://id.nlm.nih.gov/mesh/lookup/descriptor?label=Sleep&match=exact (and 12 further labels) | NLM MeSH RDF lookup — descriptor ids | 2026-10-08 |
| S34 | https://www.ncbi.nlm.nih.gov/books/NBK548536/ | LiverTox Ashwagandha (Bookshelf page; reCAPTCHA interstitial returned) | 2026-10-08 |
| S35 | `tvly search "rapamycin.news forum side effects mouth ulcers weekly dose grapefruit" --include-domains rapamycin.news` | result list: "Cold sores raging early on into rapa", "Rapamycin: How to handle mouth sores", "Lots of side effects, Opinions needed" | 2026-10-08 |
