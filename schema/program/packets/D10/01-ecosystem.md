# D10 — ecosystem survey: who derives knowledge from evidence, how, and what they publish

Stage: research (Wave 1), agent A1, 2026-10-08. Scope per brief: everything that is *produced* rather than captured — associations, insights/assessments, reports, rankings and comparisons, recommendations, answers with traces. The survey is organized by actor type; each section lists the actors' processes and operations, the artifacts they produce, whether those artifacts are capturable sources, and how agent-ready they are (readiness 0 blocked · 1 scrape-only · 2 API/file without locators · 3 agent-ready with stable ids and locatable structure). The artifact interviews (section 8) read two or more real instances of every artifact type end to end and list their fields. Sections 9 and 10 draw the lens-by-lens conclusions and the findings the model stage needs.

Citation format: URL · title · retrieval date. All retrievals 2026-10-08 unless stated. Raw captures and their sha256 are in the scratch directory listed in `_notes/tool-log.md` (manifest `MANIFEST.sha256`). This is research, not medical advice.

Running example: magnesium. It was chosen because every actor type below has published on it, so the artifacts can be compared on one compound: a graded summary (Examine), a government fact sheet (NIH ODS), a regulator's claim assessment (FDA), a Cochrane review (cramps), a recent RCT (sleep), three rankings with different methods (Labdoor, U.S. News, ConsumerLab), and the "which form for sleep" comparison question from directive 3.5.

---

## 1. Evidence graders and synthesizers (science lens)

### 1.1 Cochrane and systematic reviewers

- **Process.** Protocolized search, dual screening, risk-of-bias assessment, meta-analysis, GRADE certainty per outcome, plain conclusions; reviews are re-issued as numbered versions. The magnesium cramps review is "an update of a Cochrane Review first published in 2012" and its search ran "On 9 September 2019" (https://pubmed.ncbi.nlm.nih.gov/32956536/ · Magnesium for skeletal muscle cramps (Garrison et al., Cochrane Database Syst Rev 2020;9:CD009402, DOI 10.1002/14651858.CD009402.pub3, PMID 32956536, PMCID PMC8094171) · 2026-10-08, via NCBI E-utilities efetch XML).
- **Artifact.** A versioned review (DOI suffix `.pub3` = third publication) whose abstract states per-outcome effect estimates with certainty labels, e.g. "(MD -0.18 cramps/week, 95% CI -0.84 to 0.49; 5 studies, 307 participants; moderate-certainty evidence)" and an overall verdict: "It is unlikely that magnesium supplementation provides clinically meaningful cramp prophylaxis to older adults experiencing skeletal muscle cramps." (same source).
- **Capturable / readiness.** Abstract: readiness 3 (PubMed XML with labelled `AbstractText` sections). Full text: Europe PMC `fullTextXML` for PMC8094171 returned HTTP 500 on 2026-10-08 (https://www.ebi.ac.uk/europepmc/webservices/rest/PMC8094171/fullTextXML · Europe PMC REST · 2026-10-08), so the forest plots and Summary-of-Findings tables are not reachable without the Cochrane Library.
- **Why D10 cares.** A Cochrane verdict is the archetype of an *evidence report that tried to disqualify a marketed use and largely succeeded* (directive 3.4). Its unit of judgment is outcome × population × comparison, not "magnesium is good/bad".

### 1.2 GRADE Working Group (the certainty scheme everyone reuses)

- **Process / artifact.** A published method (handbook) defining four certainty levels and the domains that downgrade them. Level definitions, verbatim: "High | We are very confident that the true effect lies close to that of the estimate of the effect." … "Very Low | We have very little confidence in the effect estimate: The true effect is likely to be substantially different from the estimate of effect" (https://gdt.gradepro.org/app/handbook/handbook.html · GRADE handbook · 2026-10-08). Section "5.2 Factors that can reduce the quality of the evidence" lists the downgrade domains (same source).
- **Readiness.** 2 (one very large HTML page, 300 KB markdown; stable anchors). It is a *scheme*, not data: in the graph it is a named, versioned scheme value on an assessment, never a node per level.

### 1.3 U.S. Preventive Services Task Force (graded recommendations, including "recommend against")

- **Process.** Commissions a systematic evidence review, drafts a statement, opens public comment ("posted for public comment on the USPSTF website from May 4 to June 1, 2021"), publishes the final statement in JAMA, and replaces the prior statement (https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/vitamin-supplementation-to-prevent-cvd-and-cancer-preventive-medication · Recommendation: Vitamin, Mineral, and Multivitamin Supplementation to Prevent Cardiovascular Disease and Cancer · 2026-10-08).
- **Artifact.** A recommendation table (population · recommendation · grade) plus a certainty assessment. Two rows of the 2022 statement: "The USPSTF recommends against the use of beta carotene or vitamin E supplements for the prevention of cardiovascular disease or cancer." (grade D) and an I statement for multivitamins ("the current evidence is insufficient to assess the balance of benefits and harms") (same source). It names a harm with its population: "an important harm of increased lung cancer incidence was reported with the use of beta carotene by persons who smoke tobacco or have occupational exposure to asbestos" (same source). It supersedes its predecessor: "This recommendation replaces the 2014 USPSTF recommendation statement on vitamin, mineral, and multivitamin supplements to prevent cardiovascular disease and cancer." (same source).
- **The grading scheme itself is versioned.** "The USPSTF changed its grade definitions based on a change in methods in May 2007 and again in July 2012, when it updated the definition of and suggestions for practice for the grade C recommendation." (https://www.uspreventiveservicestaskforce.org/uspstf/about-uspstf/methods-and-processes/grade-definitions · Grade Definitions · 2026-10-08). Certainty is defined as "likelihood that the USPSTF assessment of the net benefit of a preventive service is correct" (same source).
- **Readiness.** 2 (clean HTML; stable URL per topic; no machine-readable recommendation feed was exercised).
- **Why D10 cares.** It is the cleanest real example of a *published recommendation that is a harm/avoidance statement* (grade D), with an explicit certainty level, a population scope and a supersession chain — the shape our published artifacts need.

### 1.4 NIH Office of Dietary Supplements (government evidence summaries)

- **Process.** Writes and periodically revises fact sheets (health-professional and consumer versions) and keeps a public change history.
- **Artifact.** The magnesium health-professional fact sheet, "Updated: January 6, 2026", with numbered references linked to PubMed, RDA and UL tables, and a safety section: "The Tolerable Upper Intake Level for supplemental magnesium is 350 mg for adults, and it ranges from 65 to 350 mg for children and adolescents, depending on age." (https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/ · Magnesium - Health Professional Fact Sheet · 2026-10-08). On forms: "the aspartate, citrate, lactate, and chloride forms of magnesium tend to have higher bioavailability than magnesium oxide and magnesium sulfate" (same source).
- **Change history.** Dated entries, e.g. "March 1, 2022 — Added the new FDA approved qualified health claim for conventional foods and dietary supplements that contain magnesium." (https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/51/history?l=en · Magnesium fact sheet history · 2026-10-08; direct curl returned HTTP 403, Tavily extract succeeded).
- **Finding (transmission error in a secondary report).** ODS says FDA "approved a qualified health claim" (fact sheet, same source). FDA's constituent update of 2022-01-10 says FDA "does not intend to object to the use of certain qualified health claims" (https://www.fda.gov/food/hfp-constituent-updates/fda-announces-qualified-health-claim-magnesium-and-reduced-risk-high-blood-pressure · FDA Announces Qualified Health Claim for Magnesium and Reduced Risk of High Blood Pressure · 2026-10-08), and the letter itself says "FDA intends to consider exercising enforcement discretion for the following qualified health claims" (https://www.fda.gov/media/155304/download · p. 28 · 2026-10-08); neither says "approved". A report sentence must trace to the primary's locator, or a careful secondary still misstates regulatory status (this is CQ-AX-23's (owned by D8) "naive graph" error committed by a government page).
- **Readiness.** 2–3 (HTML with numbered references and a change log; per-section summaries collapsed since the 2026-01-06 reformat).

### 1.5 Regulators assessing claims (FDA qualified health claims; EFSA Article 13 opinions)

- **FDA process.** A petitioner submits a claim; FDA files it, reviews the totality of evidence, and either authorizes, denies, or issues a letter of enforcement discretion with mandated qualifying language. Magnesium/hypertension: petition "submitted … on behalf of The Center for Magnesium Education and Research, LLC on October 4, 2016" (Docket No. FDA-2016-Q-3770) (https://www.fda.gov/media/155304/download · FDA letter of enforcement discretion, Petition for a Qualified Health Claim for Magnesium and Reduced Risk of High Blood Pressure · 2026-10-08; digitally signed 2022-01-08, announced 2022-01-10).
- **The claim was attacked and downgraded.** The petitioner proposed "Supportive but inconclusive scientific evidence suggests that diets with adequate magnesium may reduce the risk of high blood pressure (hypertension), a condition associated with many factors." FDA ruled that "describing the level of evidence for the claim as "supportive" overstates and therefore mischaracterizes the strength of the evidence" and listed three qualified claim wordings for which it intends to consider enforcement discretion, the first being "Inconsistent and inconclusive scientific evidence suggests that diets with adequate magnesium may reduce the risk of high blood pressure (hypertension), a condition associated with many factors." (same source, pages 1 and 27–28). The evidence basis: "Based on the findings of these 38 intervention studies, FDA concludes there is some credible evidence … However, this evidence is inconclusive because the results of the studies are inconsistent." (page 22). The letter also names a safety factor: FDA intends to consider, "as a factor in the exercise of our enforcement discretion, that dietary supplements bearing the claim do not provide more than 350 mg magnesium combined when used according to their labeling" (page 24).
- **Data-quality finding.** The same letter states the whole studied range as "(181 mg/day to 960 g/day)" (page 23) — a unit slip inside a regulator's evidence review: on page 22 the same letter gives "181 mg/day to 960 mg/day" for the 18 studies that showed a benefit and "240 mg/day to 720 mg/day" for the 20 that did not (adversarial-review stage correction: the earlier text inferred the slip; the letter itself settles it). A report that re-uses this number without a locator and a unit check would propagate a 1000× error (CQ-PV-04, owned by D9/D11).
- **EFSA process.** The NDA Panel issues scientific opinions on Article 13(1) claims with claim IDs and EFSA question numbers. Example landing record: "Scientific Opinion on the substantiation of health claims related to coenzyme Q10 and contribution to normal energy-yielding metabolism (ID 1508, 1512, 1720, 1912, 4668), maintenance of normal blood pressure (ID 1509, 1721, 1911) …", "Adoption date: 10 September 2010", "Published date: 19 October 2010", "On request from: European Commission" (https://www.efsa.europa.eu/en/efsajournal/pub/1793 → efsa.onlinelibrary.wiley.com · EFSA Journal 2010;8(10):1793, DOI 10.2903/j.efsa.2010.1793 · 2026-10-08).
- **Readiness.** FDA letters 2 (stable PDF URL, page numbers, no structure). EFSA opinions 0–1 in this environment: the landing page gives metadata only; the PDF was blocked ("wiley.scienceconnect.io is blocked") for Firecrawl and returned a Cloudflare page to curl; Crossref has no abstract. See `_notes/tool-log.md`.
- **Why D10 cares.** These are the institutional form of the *claim → vetting → disqualification attempt → published verdict* loop (directive 3.4), with a petitioner (interested party), a docket, a verdict on strength, and mandated qualifiers. Our evidence report needs the same parts.

### 1.6 Harm and causality graders (NIH LiverTox)

- **Process.** NIDDK/NLM editors maintain one monograph per agent, with a structured hepatotoxicity narrative, case reports and a graded likelihood that the agent causes clinically apparent liver injury.
- **Artifact (two instances).** Green tea: "Likelihood score: A (well established cause of clinically apparent liver injury)." — while the same page states "Drinking green tea has not been associated with liver injury or serum aminotransferase elevations" and reports "GTE was associated with ALT elevations in 6.7% of patients compared to 0.7% of controls" in a prospective study (LiverTox GreenTea.nxml, updated 2020-11-20). Ashwagandha: "Likelihood score: B (likely cause of clinically apparent liver injury)."; "its use should be avoided in patients with cirrhosis or advanced chronic liver disease."; and "The possibility of mislabeling or adulteration with hepatotoxic herbal products is always an issue in commercial multiingredient dietary supplements." (Ashwagandha.nxml, updated 2024-12-03). Source for both: https://ftp.ncbi.nlm.nih.gov/pub/litarch/29/31/livertox_NBK547852.tar.gz · LiverTox: Clinical and Research Information on Drug-Induced Liver Injury (NBK547852), bulk archive Last-Modified 2026-10-08T06:40:21Z (the archive's `file_list.csv` prints `2026-10-08 02:40:21` with no zone, i.e. US Eastern) · 2026-10-08; HTML page https://www.ncbi.nlm.nih.gov/books/NBK547925/ was reCAPTCHA-blocked.
- **Why D10 cares.** (a) A harm grade attaches to a *specific preparation* (green tea extract), not the food — an association computed at the compound or food level would be wrong in both directions. (b) The grade is an assessment by a named body under a named scale, with an update date — exactly the derived-insight shape (assessment with scheme, scope, supersession), not an edge property.
- **Readiness.** HTML 0 (reCAPTCHA for curl, Tavily, Firecrawl); bulk JATS 3 (section ids such as `GreenTea.Hepatotoxicity`, update dates, stable file names).

## 2. Consumer evidence publishers and paid databases (science + economics lenses)

### 2.1 Examine.com (graded summaries, subscription)

- **Process.** A research team writes and updates supplement pages and an "Examine Database" that grades outcomes per condition/goal; pages carry an update history typed "minor"/"major" (e.g. "Safety Information added major", "Large update major") with writer/editor/reviewer roles.
- **Artifact.** Magnesium page, "Last Updated: September 29, 2026" as rendered to a Firecrawl scrape with maxAge 0 on 2026-10-08 (Tavily rendered "September 30, 2026" the same day; the research-stage Tavily extraction's "August 31, 2026" was a stale cached extraction: the page's own update history lists updates "9 days ago" and on "August 30, 2026"; see 08 "Broke" item 2), with a database table `Health Condition/Goal | Health Outcome | Grade | Effect | Evidence` (e.g. "Insomnia | 5 outcomes | … | 3 Studies"; "Muscle Cramps | 1 outcome | … | 3 Studies"), a form statement ("magnesium oxide and magnesium carbonate have extremely poor absorption and aren’t recommended for the purpose of increasing magnesium levels in the body"), and an interactions table with `Agent | Effect | Level of Evidence | Level of Severity` (e.g. blood-thinning drugs: "Level of Evidence: Theoretical | Level of Severity: Unknown") (https://examine.com/supplements/magnesium/ · Magnesium benefits, dosage, and side effects · 2026-10-08).
- **Economics.** Grades and safety detail are partly paywalled: "Full safety information is available to Examine Clinician Edition members." (same source). The page says "Magnesium is most often used for Sleep" — the goal vocabulary (directive 3.1) is the navigation spine of a commercial evidence product.
- **Readiness.** 1–2: grades and effect directions render as images/widgets and come back empty in extracted markdown; FAQ answers are collapsed. Fields are visible, values are not reliably capturable.

### 2.2 Natural Medicines / DrugBank (interaction and effectiveness databases)

- ODS cites "Natural Medicines Comprehensive Database. Magnesium. 2013." for the laxative mechanism of magnesium salts (ODS fact sheet, reference 57, source above). These databases are subscription products; no instance was captured in this stage (no access). Recorded as a gap: interaction severity/evidence ratings are a known artifact type that D5 owns; D10 only needs the pattern (rating = assessment with scheme), already shown by Examine's interaction table and LiverTox.

## 3. Product testers and rankers (economics + community lenses)

### 3.1 Labdoor (lab testing → letter grades → ranked lists; certification business)

- **Process.** Tests products, computes five sub-scores and an overall grade, ranks products per category, and sells certification; scoring rules change over time.
- **Ranking artifact.** "# TOP 10 MAGNESIUM … See our 11 product reports." Rows carry a grade (A+, B-, X), product name, link to a review, and a certification status ("Expired", "Upcoming", "None", or a certification badge). The list mixes graded, expired-certification and not-yet-tested ("X … Upcoming") products (https://labdoor.com/rankings/magnesium · Top 10 Magnesium Supplements · 2026-10-08).
- **Method artifact (the criteria).** Five criteria with stated rules: Label Accuracy ("Penalties are twice as heavy if a product has less than what they claim (underage) compared to if they have more (overage)." and "In 2017, we began applying FDA rounding rules to scoring."), Product Purity (heavy metals vs Prop 65 MADLs/NSRLs, EPA RfDs, ATSDR MRLs), Nutritional Value (vs DRIs), Ingredient Safety (vs ULs/NOAELs; excipients weighted by GRAS status), Projected Efficacy ("based on a product's active ingredients, their levels, and their specific biochemical properties"). The method is explicitly mutable: "we retain the right to update our scoring algorithms, product data, and rankings at any time." (https://labdoor.com/about/scores · Our scoring process - Labdoor · 2026-10-08).
- **Product review artifact.** Only "LABDOOR SCORE 99.3 of 100" was extractable for Legion Sucrosomial Magnesium (https://labdoor.com/review/legion-sucrosomial-magnesium · Legion Sucrosomial Magnesium · 2026-10-08); sub-scores are JS-rendered.
- **Economics.** Labdoor's public certification standards page exists (https://labdoor.com/enterprise/certifications/standards, found by search, not captured); rankings display certification badges next to grades — the ranked party may be a paying customer. A comparison report must expose who paid whom (D7 seam).
- **Readiness.** Ranking and method pages 2; product reviews 1.

### 3.2 ConsumerLab (membership testing reports with Approved / Not Approved status)

- **Process.** Selects products, tests them, publishes Approved/Not Approved status and "Top Picks", and updates status after publication.
- **Artifact.** Public preview of the magnesium review: two supplements marked Not Approved because they did not accurately list their chemical forms of magnesium (paraphrase; the capture carries markdown emphasis inside the sentence); dose range "from 77 mg to 566 mg daily"; cost "from less than 10 cents to more than $1 to obtain 200 mg of magnesium"; brands tested listed (https://www.consumerlab.com/reviews/magnesium-supplement-review/magnesium · Magnesium Supplements Review & Top Picks - ConsumerLab.com · 2026-10-08).
- **Selection bias, stated by the publisher.** "ConsumerLab generally does not select products that have previously failed testing because its goal is to find best quality products." (same source). A ranking's denominator is a choice; a comparison must record its candidate set.
- **Post-publication status change.** "We have changed its status to ***Not* Approved**" after finding a mislabeled form; and "Two popular magnesium supplements were NOT Approved in our Magnesium Review as we suspected the presence of the cheaper "oxide" form of magnesium instead of the claimed "glycinate" or "aspartate" forms." (same source). A published comparison row is re-adjudicated after publication — rows need their own provenance and supersession.
- **Economics.** "This feature is restricted to active members." (same source). Readiness 1 for the body; 2 for the public update notes.

### 3.3 U.S. News "pharmacist-ranked" lists (survey ranking, affiliate commerce)

- **Process.** "U.S. News partnered with The Harris Poll … randomly assigned 128 over-the-counter categories … to 357 pharmacists and 129 dermatologists … and asked them to rank their top three brands for each category based on what brands they would most recommend to consumers." (https://health.usnews.com/otc/rankings/magnesium-supplements · Best Magnesium Supplements Pharmacist Ranked | U.S. News · 2026-10-08).
- **Artifact.** Rank + score (#1 Score 100 "Mag-Ox Magnesium Oxide: Magnesium Oxide (482.6 mg providing 241.3 mg elemental Magnesium)"; #2 84 Slow-Mag; #3 54 Nature Made; #4 19 Nature's Bounty) with "Buy on Amazon" affiliate links (amzn.to) and a disclaimer: "While U.S. News lists the results of the survey, U.S. News does not recommend or endorse any health products listed here." (same source).
- **Conflict with the evidence publishers.** The #1 product is magnesium oxide, which Examine says has "extremely poor absorption" and ODS ranks below aspartate/citrate/lactate/chloride for bioavailability (sources above). Both rankings are "true" under their criteria (familiarity/availability vs bioavailability). This is the strongest argument for directive 3.5: **a ranking is a function of its criteria and candidate set; storing "best magnesium" as a fact is wrong for every user whose criteria differ.**
- **Readiness.** 2 (clean HTML table, stable URL; ranks change by survey year — "2026-2027 rankings").

### 3.4 Community rankings (forums, Reddit)

- Reddit threads were not fetchable (Tavily: "Failed to fetch url" for a reddit.com thread, 2026-10-08). Community "stack rankings" are therefore treated as claim occurrences (D9) when captured through other routes, never as rankings the graph stores.

## 4. Association scorers and knowledge-graph platforms (science + AI lenses)

### 4.1 Open Targets Platform (association scores with an evidence breakdown)

- **Process.** Aggregates evidence from many sources per target–disease pair, scores each source with a harmonic sum, weights sources, and computes datatype and overall scores per release. "Each unique target–disease pair in the Open Targets Platform is defined as an **association**." Direct vs indirect associations differ by ontology propagation (https://platform-docs.opentargets.org/associations · Target–disease associations · 2026-10-08; markdown twin at `associations.md`).
- **Explicit warning that an association is not a confidence.** "While scores are useful to rank lists of targets or diseases, **they should not be interpreted as a confidence score for the target-disease association**." (same source). Weights are user-adjustable: "The default weights used in the web application can be modified by the user to adjust to different prioritisation strategies" (same source; defaults include Europe PMC 0.2, Expression Atlas 0.2, IMPC 0.2, others 1).
- **Association artifact (instance 1, APOE).** GraphQL `associatedDiseases` for ENSG00000130203 returned `count 2836`; e.g. "Alzheimer disease" (MONDO_0004975) overall `score 0.695512952413486` with `datatypeScores` literature 0.9992, genetic_association 0.8814, affected_pathway 0.2670, rna_expression 0.0173 and `datasourceScores` gwas_credible_sets 0.9726, europepmc 0.9992, eva 0.5167, crispr_screen 0.2670, expression_atlas 0.0173; `meta.apiVersion 26.9.0`, `dataVersion 26.09` (https://api.platform.opentargets.org/api/v4/graphql · Open Targets Platform GraphQL API · 2026-10-08).
- **Association artifact (instance 2, harm: sirolimus FAERS signals).** `adverseEvents` for CHEMBL413: `count 32`, `criticalValue 290.98842339916155`; top rows stomatitis (count 1545, logLR 3111.31), "malignant neoplasm progression" (1423, 2480.24), transplant rejection (686, 1895.67); `meddraCode` is empty in every row (same API, 2026-10-08). The method page says: "Due to the nature of the surveillance reports, it's relatively common for the indication for which a drug was prescribed to appear in the list of significant ADRs." (https://platform-docs.opentargets.org/drug/pharmacovigilance.md · Pharmacovigilance · 2026-10-08). Filters: health-professional reports only, deaths excluded, suspect drug only, likelihood-ratio test after Huang et al. 2013 (PMID 23331230) and Maciejewski et al. 2017 (PMID 28786378, PMCID PMC5548487).
- **Why D10 cares.** This is the reference design for a **materialized association**: a score between two entities, per release (method version), with a component breakdown by evidence kind, explicitly not a confidence and explicitly confounded (indication appears as "adverse event"). It answers the brief's seed question "association between X and Y broken down by evidence kind, with the method version and input set".
- **Readiness.** 3 (public GraphQL, release-versioned, markdown docs and `llms.txt`); schema drift between releases (`maximumClinicalTrialPhase` → `maximumClinicalStage`) is a stored-query hazard.

### 4.2 Other association resources (named in the brief, not exercised this stage)

DisGeNET, STRING, CTD inference scores, Hetionet/SPOKE follow the same pattern (pairwise score + evidence channels + release). Not captured in this stage; the model stage does not need a second platform to fix the pattern, and D2 owns mechanism-level sources.

## 5. AI evidence-answer engines (AI lens)

### 5.1 Consensus (stance classification over top papers)

- **Process.** "Our AI analyzes the top 20 papers returned for your search query and categorizes their conclusions based on the claims they support." The Meter shows "Yes", "No", "Possibly", or "Mixed", "requires at least 5 relevant papers", and a Snapshot with quality indicators (Recency, Methods, Journals SJR, Citations) (https://help.consensus.app/en/articles/10069920-the-consensus-meter · The Consensus Meter | The Consensus Help Center · 2026-10-08).
- **Stated failure modes.** "**The Consensus Meter is not a perfect reflection of all the science on a topic.**" and, on scope mismatch, "if you ask, “Is ibuprofen safe for adult consumption?” and the potential result reads, “We found that ibuprofen was safe and well tolerated in children,” our model may classify that result as “Yes.”" (same source). This is the applicability failure (population mismatch) that CQ-EV-04 (owned by D3/D5) / CQ-AX-02 (competency catalog; no packet row) exist to prevent.
- **Capturability.** A live answer for "Does magnesium supplementation improve sleep quality?" returned a sign-up wall ("Create a free account to continue") to Firecrawl (https://consensus.app/results/?q=… · 2026-10-08). Answers are not capturable sources and not reproducible artifacts. Readiness 0 for answers, 2 for documentation.

### 5.2 Elicit (systematic-review workflow with quote-backed screening and extraction)

- **Process.** Setup → gather → title/abstract screening → optional full-text screening → extraction → report. "Elicit screens every gathered paper against your criteria. A paper that fails any one of them is excluded, and every decision shows the quote from the paper behind it." Extraction cells show "supporting quotes from the paper". The report includes "the 80 papers with the highest screening scores by default" (135 on Pro, 200 on Scale/Enterprise) (https://support.elicit.com/en/articles/14759154-systematic-reviews-in-elicit · Systematic Reviews in Elicit | Elicit Help Center · 2026-10-08).
- **Why D10 cares.** Quote-per-decision is the locator discipline we require; a plan-dependent paper cap shows that a report's input set must be recorded, or two reports on the same question are incomparable. Readiness 0 for reports (behind account), 2 for docs.

### 5.3 scite (citation statements classified as supporting / contrasting / mentioning)

- **Process / artifact.** scite "categorizes citations based on context … indicates whether the statement provides supporting or contrasting evidence for a referenced work, or simply mentions it", built from "over 25 million full-text scientific articles" with "more than 880 million classified citation statements" at publication (https://direct.mit.edu/qss/article/2/3/882/102990/scite-A-smart-citation-index-that-displays-the · Nicholson et al., scite: A smart citation index…, Quantitative Science Studies 2021, DOI 10.1162/qss_a_00146 · 2026-10-08). The help article (help.scite.ai) was not fetchable by Tavily.
- **Why D10 cares.** This is the industrial version of directive 3.8's SUPPORTS/CONTRADICTS between *a statement at a located span* and *a referenced claim* — not document→entity. It also shows the classifier is a model output (method-versioned), i.e. a derived judgment that must carry its producer.

### 5.4 Perplexity-style traces, OpenEvidence

Named in the brief; not captured this stage (no stable public artifact to interview without an account). The pattern they share with Consensus — an answer with inline citations, no stored viewpoint, no policy version — is the gap CQ-AX-01/03 already name.

## 6. GraphRAG and graph-analytics practice (AI lens)

### 6.1 Microsoft GraphRAG

- **Process.** LLM extraction of entities, relationships and (optional) claims per text unit; entity merge; community detection; LLM community reports; embeddings. Entity merge is name-based: "any entities with the same *title* and *type* are merged by creating an array of their descriptions." Claims are optional and "turned off by default"; community reports "contain an executive overview and reference the key entities, relationships, and claims within the community sub-structure"; embeddings cover "entity descriptions, text unit text, and community report text" (https://microsoft.github.io/graphrag/index/default_dataflow/ · GraphRAG default dataflow · 2026-10-08).
- **Lesson for D10.** Community reports are *derived summaries over a projection* — useful as retrieval aids, but without locators per sentence and with name-based identity they are not evidence. In our model a community is a regenerable projection (method version), and anything published from it must be re-grounded on assertions and locators.

### 6.2 Neo4j GraphRAG (Python) retrievers

- Retrievers: VectorRetriever, VectorCypherRetriever ("The returned results can be configured through a retrieval query parameter that will be executed after the index search"), HybridRetriever, HybridCypherRetriever, ToolsRetriever, Text2Cypher ("Translates the user question into a Cypher query"). Caveat: "The LLM-generated query is not guaranteed to be syntactically correct." (https://neo4j.com/docs/neo4j-graphrag-python/current/user_guide_rag.html · User Guide: RAG — neo4j-graphrag-python · 2026-10-08).
- **Lesson.** VectorCypher = directive 3.8's path (vector hit on a chunk → Cypher expansion to assertions/locators). Text2Cypher works only against a small schema slice; the slim schema is what makes it viable.

### 6.3 Neo4j Graph Data Science

- Node Similarity "compares a set of nodes based on the nodes they are connected to" using Jaccard, Overlap or Cosine (https://neo4j.com/docs/graph-data-science/current/algorithms/node-similarity/ · Node Similarity · 2026-10-08). Editions: "The Enterprise Edition (EE) of the library requires a *license key*"; "Neo4j AuraDS is the fully managed version of Neo4j GDS Enterprise Edition"; Aura Graph Analytics is "on-demand analytics-as-a-service" (https://neo4j.com/docs/graph-data-science/current/installation/ · Installation · 2026-10-08).
- **Lesson.** GDS outputs (similarity, communities, centrality, link prediction) are materialized projections with an algorithm, parameters and an input projection; they need a run (Activity), a method version and a refresh cadence. Which edition the deployment has decides what can be materialized in-database versus computed offline (open question for the owner).

### 6.4 This repo's surfaces

- Read operations available to agents today: `node.resolve`, `node.card`, `node.search`, `node.list`, `node.neighbors`, `assertion.trace`, `assertion.about`, `count.relationships` (repo `packages/contracts/src/read.ts`, read 2026-10-08). There is no read operation for an answer, report, comparison or association — D10's retrieval patterns will need new read kinds or `@cypher` fields.
- The planner already refuses writes to derived edges: `DERIVED_EDGE_READ_ONLY: … is a derived projection; write the assertion it is projected from instead` (repo `packages/kg-ops/src/plan.ts`, line 683, read 2026-10-08). Directive rule 8 is enforced in code.
- `evals/baseline-comparison` scores correctness, kernel compliance, safety, cost and recoverability; "No run in this repo yet" (repo `evals/baseline-comparison/README.md`, read 2026-10-08). It is the natural harness for answer-faithfulness checks on D10 answers.

## 7. Investors' derived artifacts (economics lens)

- Investor-grade comparisons (pipeline rankings, frontier trackers, analyst notes) are mostly paywalled or JS apps. The Lifespan.io Rejuvenation Roadmap returned 937 characters of shell to Tavily (https://www.lifespan.io/road-maps/the-rejuvenation-roadmap/ · The Rejuvenation Roadmap · 2026-10-08) — not capturable this stage. Short-seller and analyst reports were not surveyed (D7/D13 own the actors; D10 owns only the pattern).
- What the investor audience needs from D10 is therefore the *computed* side: "rank companies in frontier F by latest clinical stage", "what changed since my last report on company X", "which claims a company makes survived an evidence mission" — all answerable from D3/D7/D13 assertions plus D10's comparison and report patterns, with a published comparison only when BellLabs signs it.
- Economic incentives visible in the artifacts above are themselves D10-relevant facts about *who produced a ranking*: subscription walls (Examine Clinician Edition, ConsumerLab membership), certification sales next to grades (Labdoor), affiliate links (U.S. News), an industry-linked petitioner (FDA docket), nutraceutical-funded CRO ties of a trial author (bisglycinate RCT disclosure, section 8.10).

## 8. Artifact interviews (two or more real instances per type, fields read end to end)

### 8.1 Graded evidence summary

| field | Examine magnesium (Last Updated 2026-09-29 per Firecrawl, 2026-10-08) | NIH ODS magnesium HP (2026-01-06) |
| --- | --- | --- |
| subject | supplement (Magnesium) | nutrient (Magnesium) |
| version / date | "Last Updated" date + typed update history (minor/major) with writer/editor/reviewer | "Updated" date + dated change log page |
| goal/condition axis | condition/goal rows (Insomnia, Sleep Health, Muscle Cramps …) × outcomes | none (sections by topic: intake, deficiency, health, safety, interactions) |
| grade | per outcome letter grade (rendered as image; not capturable) | none (narrative) |
| effect direction / size | per outcome (image) | narrative |
| evidence count | "N Studies" per row | numbered references |
| dose | "30 to 960 milligrams per day" studied range; RDA, UL | RDA table; UL table (350 mg supplemental adults) |
| forms | bioavailability by salt form | bioavailability by salt form |
| harms | side-effects table (diarrhea), interactions table (agent, effect, level of evidence, severity) | toxicity narrative, UL, interactions |
| paywall | partial | none |
| locators | headings; references `#ref-n` | headings; references `#enN` |

### 8.2 Systematic review / graded recommendation

| field | Cochrane CD009402.pub3 (2020) | USPSTF vitamins (2022) |
| --- | --- | --- |
| question | magnesium vs placebo/no treatment/other for muscle cramps | supplementation to prevent CVD and cancer |
| population scope | idiopathic (older adults), pregnancy-associated, cirrhosis — separately | community-dwelling, nonpregnant adults |
| search date | 9 September 2019 | evidence review commissioned for the update |
| inputs | 11 trials, 735 individuals | systematic review (refs 31, 32) |
| per-outcome estimate | MD/RR with 95% CI, n studies, n participants | benefits/harms adequacy per supplement |
| certainty | GRADE label per outcome (high/moderate/low) | "moderate certainty" per conclusion |
| verdict | authors' conclusions (unlikely to provide clinically meaningful prophylaxis in older adults; conflicting in pregnancy) | grade per row (D, I) + suggestion for practice |
| harms | AE pooled: GI events 11–37% vs 10–14% | lung cancer with beta carotene in smokers/asbestos; hemorrhagic stroke with vitamin E (two trials) |
| version chain | update of 2012 review | replaces 2014 statement |
| identifiers | DOI, PMID, PMCID | URL slug, JAMA publication |

### 8.3 Regulatory claim assessment

| field | FDA QHC letter, magnesium/hypertension | EFSA NDA opinion, CoQ10 (landing record) |
| --- | --- | --- |
| identifier | Docket FDA-2016-Q-3770 | EFSA Journal 2010;8(10):1793; question numbers EFSA-Q-2008-2245 …; claim IDs 1508 … |
| petitioner / requester | The Center for Magnesium Education and Research, LLC (via Johnson Nutrition Solutions LLC) | European Commission |
| dates | petition 2016-10-04; filed 2016-11-18; signed 2022-01-08; announced 2022-01-10 | adopted 2010-09-10; published 2010-10-19 |
| claim as proposed | "Supportive but inconclusive …" | claim IDs grouped by function |
| evidence reviewed | 38 intervention studies + observational | references list (captured); body not captured |
| verdict | inconclusive and inconsistent; qualified claims allowed under enforcement discretion | not captured (PDF blocked) |
| mandated wording | three qualified claim texts | n/a |
| safety condition | ≤ 350 mg Mg combined per labeled use, a factor FDA intends to consider in its enforcement discretion | n/a |
| panel / signer | Director, Office of Nutrition and Food Labeling, CFSAN | NDA Panel members listed |

### 8.4 Product ranking / comparison

| field | Labdoor magnesium ranking | U.S. News pharmacist ranking | ConsumerLab magnesium review (public part) |
| --- | --- | --- | --- |
| candidate set | 11 product reports | brands named by surveyed pharmacists | products CL selected (excludes prior failures) |
| criteria | 5 lab-based sub-scores, published rules | "most recommend" top-3 survey | lab test pass/fail (amount, form, purity) + Top Pick judgment |
| method version | mutable ("update our scoring algorithms … at any time"; Labdoor's 2017 adoption of FDA rounding rules) | survey year ("2026-2027 rankings") | test years ("Products tested in 2024 and 2025") |
| row fields | rank, grade, product, certification status, review link | rank, score, brand, sample product + amounts, considerations, affiliate link | Approved/Not Approved, Top Pick, cost per 200 mg, daily dose |
| post-publication change | rankings updated at any time | annual | status changed to Not Approved after publication |
| commercial tie | certification badges | affiliate links | membership |
| capturability | ranking 2, review 1 | 2 | 1 (body), 2 (updates) |

### 8.5 Association score record

| field | Open Targets APOE–Alzheimer disease | Open Targets sirolimus–ADR (FAERS) |
| --- | --- | --- |
| pair | target (Ensembl) × disease (MONDO/EFO) | drug (ChEMBL) × adverse event (MedDRA name; code empty) |
| score | overall harmonic-sum score 0–1 | logLR with per-drug critical value |
| breakdown | datatypeScores + datasourceScores | count of reports |
| method | harmonic sum, source weights, direct/indirect propagation | LRT after filters (HP reporters, no deaths, suspect drug only, blacklist) |
| version | apiVersion 26.9.0, dataVersion 26.09 | same |
| stated caveat | not a confidence score | indication appears as ADR |

### 8.6 Harm monograph with graded causality

| field | LiverTox Green Tea | LiverTox Ashwagandha |
| --- | --- | --- |
| sections | OVERVIEW, Introduction, Background, Hepatotoxicity, Mechanism of Injury, Outcome and Management, CASE REPORTS (Key Points, Laboratory Values, Comment ×3), PRODUCT INFORMATION … | OVERVIEW, Introduction, Background, Hepatotoxicity, Mechanism of Injury, Outcome and Management, PRODUCT INFORMATION, CHEMICAL FORMULA AND STRUCTURE, ANNOTATED BIBLIOGRAPHY, OTHER REFERENCE LINKS |
| graded judgment | Likelihood score A | Likelihood score B |
| scope of the judgment | green tea *extract* (beverage explicitly not associated) | commercial ashwagandha products (contamination caveat) |
| avoidance statement | (cases, recovery on stopping) | avoid in cirrhosis / advanced chronic liver disease |
| updated | 2020-11-20 | 2024-12-03 |
| locator | `sec@id` (e.g. `GreenTea.Hepatotoxicity`) + offset in nxml | same |

### 8.7 AI evidence answer (documentation interviews; live answers not capturable)

| field | Consensus Meter | Elicit systematic review report | scite smart citation |
| --- | --- | --- | --- |
| input set | top 20 papers for the query, ≥ 5 needed | gathered + screened papers, report capped at 80/135/200 by plan | citing statements in full texts |
| unit of judgment | paper → Yes/No/Possibly/Mixed | paper × criterion decision with quote; extraction cell with quote | citation statement → supporting/contrasting/mentioning |
| quality signals | recency, methods count, journal SJR, citations | screening score | model classification |
| reproducibility | not stated; account wall | account; plan-dependent caps | index updates |
| known failure | population/scope mismatch | (not stated in captured doc) | classifier error (model output) |

### 8.8 Derived graph summaries (GraphRAG)

| field | GraphRAG community report | Neo4j GDS node similarity result |
| --- | --- | --- |
| input | community from hierarchical detection over LLM-extracted graph | in-memory projection of a bipartite pattern |
| content | executive overview + references to entities, relationships, claims | node pairs + similarity score (Jaccard/Overlap/Cosine) |
| identity basis | entity title + type (name merge) | node ids in projection |
| stored as | Community Reports table + embeddings | stream / mutate / write mode |
| version | pipeline config | algorithm + parameters + projection |

### 8.9 Report change records

| field | ODS fact sheet history | Examine update history | USPSTF supersession | ConsumerLab status update |
| --- | --- | --- | --- | --- |
| granularity | dated entry per change | typed entry (minor/major) | whole statement replaces 2014 | per product status |
| content | what changed (e.g. QHC added 2022-03-01) | label only ("Safety Information added") | "same conclusions as it did in 2014" | Approved → Not Approved |
| machine-usable | dates + text | labels, no dates in capture | prose | prose |

### 8.10 Primary study as an evidence-mission input (D3-owned type, read for what D10 cites)

| field | bisglycinate RCT (Schuster et al. 2025) | Cochrane review (as input to a mission) |
| --- | --- | --- |
| ids | PMID 40918053, PMCID PMC12412596, DOI 10.2147/NSS.S524348, DRKS00031494 | PMID 32956536, DOI …pub3 |
| design / n | randomized, double-blind, placebo-controlled; 155 enrolled | 11 RCTs, 735 participants |
| intervention | "250 mg elemental magnesium, daily" bisglycinate | magnesium in any form |
| primary result | ISI −3.9 vs −2.3 at week 4, p = 0.049, Cohen's d = 0.2 | MD −9.59% (CI −23.14% to 3.97%) |
| authors' limits | "exclusive reliance on self-reported data without objective verification" | high risk of bias in pregnancy trials |
| funding / COI | institute-funded; one author directs a CRO "that receives research funding from nutraceutical companies" | — |
| AI use disclosed | "the authors used DeepL and ChatGPT (versions 3 and 4o)" | — |
| indexing error | PubMed lists publication types "Case Reports", "Clinical Trial", "Journal Article" for this RCT | — |
| full-text locators | JATS `sec` titles (Primary Endpoint, Adverse Events, Limitations, Disclosure) | abstract sections only |

## 9. Lens summary

| lens | what the ecosystem does | what it means for D10 |
| --- | --- | --- |
| science | Graders publish verdicts under named, versioned schemes (GRADE levels; USPSTF grades changed 2007/2012; LiverTox likelihood letters; Cochrane `.pubN` versions) and scope every verdict to population × outcome × preparation. | An assessment = verdict + scheme@version + scope + inputs + producer + supersession. Never a "goodness" property on an entity (directive 3.2). |
| economics | Evidence and rankings sit behind memberships; rankers sell certification or earn affiliate fees; petitioners and authors have interests. | A comparison or report must expose its producer, candidate set, criteria version and the producer's interests (seam to D7); BellLabs' own published comparisons must declare the same. |
| community | Survey-based "most recommended" lists diverge from evidence-based ones (Mag-Ox #1 vs oxide "extremely poor absorption"). Forums are not capturable. | "Best X" is never a stored fact; it is computed under DecisionCriterion versions, and a community recommendation is a ClaimOccurrence (D9), not a ranking. |
| AI | Answer engines classify stance over a bounded paper set, admit scope errors, are login-walled and unreproducible; GraphRAG summarizes communities without per-sentence locators and merges by name; Text2Cypher can emit invalid queries. | Our AnswerRecord/report must store viewpoint (as-of, schema digest, query shape, policy), cite assertions/locators per sentence, and treat communities/similarities as retrieval aids with method versions. |

## 10. Findings that drive the model (handed to research notes)

1. **Comparisons are criterion-relative.** Three magnesium rankings, three criteria sets, three different #1s (Labdoor A+ certified products; U.S. News Mag-Ox; ConsumerLab Top Picks with absorption + laxation criteria). Directive 3.5's position is confirmed by the market itself.
2. **Every grader versions its method and changes published rows.** Labdoor ("update … at any time"), USPSTF (grade definitions 2007, 2012; statement replaces 2014), ConsumerLab (status → Not Approved), ODS (dated history), Examine (typed update history), Open Targets (release 26.09). Published artifacts need version, supersession and row-level provenance.
3. **Secondary reports mis-transmit primaries.** ODS "FDA approved" vs FDA "enforcement discretion"; FDA "960 g/day"; PubMed "Case Reports" for an RCT. Each report sentence needs a locator into the primary and a verifier pass; this is the D10 reason the evidence chain cannot be shortcut.
4. **Associations are not confidence and can be confounded.** Open Targets says so in its documentation; FAERS signals include the indication. An association must never be read as an asserted relation; it is a materialized projection with method version and component breakdown.
5. **Harm grades are preparation-specific.** Green tea beverage (no association) vs green tea extract (LiverTox A). The subject of a harm assessment must be the most specific entity the source supports (D1/D6/D12 seam).
6. **Disqualification attempts are institutional and visible.** FDA downgraded "supportive" to "inconsistent and inconclusive"; Cochrane found no clinically meaningful effect on cramps in older adults; USPSTF recommends against beta carotene. These are real-world evidence reports with verdicts — the templates for BellLabs' evidence-mission reports.
7. **AI engines are not sources.** Their answers cannot be captured; only their documentation can. D10's AnswerRecord is BellLabs' own artifact, never a mirror of a third-party AI answer.
