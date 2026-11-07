# D10 — fixture candidates (research stage, 2026-10-08)

Ten candidates from real sources. Every quote below was found verbatim in the saved capture by `tools/findq.py` (scratch); "offset" is the 0-based character offset in the capture file named, unless the note says the quote was found after whitespace normalization (pdftotext layout breaks lines; the fixture locator should then use page + text-quote selector). Captures and digests: scratch `ft/D10/raw/` and `ft/D10/MANIFEST.sha256` (scratch root `C:\Users\Pinda\AppData\Local\Temp\claude\C--Users-Pinda-Proyectos-Biotech\d38640f3-1d90-4042-9623-ff67cb1b7809\scratchpad\`). Retrieval date for all: 2026-10-08.

Recommended set for the fixtures stage (contract needs ≥ 3, one unstructured-to-entity, one harm or disconfirmation):

| slot | candidate | why |
| --- | --- | --- |
| unstructured-to-entity (directive 3.8) | **FC-02** bisglycinate RCT full text | open-access JATS with section ids → clean chunk → assertion → locator → snapshot path; same span re-selectable by the verifier |
| disconfirmation | **FC-03** FDA magnesium QHC letter (or FC-01 Cochrane) | a claimed evidence strength attacked and downgraded by an assessor, with docket, petitioner, verdict and mandated qualifier — the evidence-report template (directive 3.4) |
| harm | **FC-06** LiverTox green tea extract / ashwagandha | graded harm assessment on the most specific preparation; avoidance statement |
| comparison / ranking (directive 3.5) | **FC-04** Labdoor + **FC-05** U.S. News | two rankings, two criteria sets, opposite treatment of magnesium oxide |
| association (directive 3.6) | **FC-08** Open Targets | materialized score with evidence-kind breakdown and release version; harm signals confounded by indication |

---

## FC-01 — Cochrane review: Magnesium for skeletal muscle cramps (disconfirmation)

- url: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=32956536&retmode=xml (landing: https://pubmed.ncbi.nlm.nih.gov/32956536/)
- title: Magnesium for skeletal muscle cramps. Garrison SR, Korownyk CS, Kolber MR, Allan GM, Musini VM, Sekhon RK, Dugré N. Cochrane Database Syst Rev 2020;9:CD009402
- ids: PMID 32956536 · DOI 10.1002/14651858.CD009402.pub3 · PMCID PMC8094171
- retrieved: 2026-10-08 · tool: PubMed MCP (discovery) + NCBI E-utilities efetch via curl (capture)
- capture: `raw/pubmed-32956536.xml` · sha256 `56d37e0502e7d958f8aa29815d247394b4d808fe9151dd918c51b7c917bb4304`
- kind: **disconfirmation** (also an evidence-report exemplar)
- quotes:
  1. "Magnesium supplements are marketed for the prophylaxis of cramps but the efficacy of magnesium for this purpose remains unclear." — `AbstractText Label="BACKGROUND"`, offset 1427
  2. "percentage change from baseline in the number of cramps per week at four weeks (mean difference (MD) -9.59%, 95% confidence interval (CI) -23.14% to 3.97%; 3 studies, 177 participants; moderate-certainty evidence)" — `MAIN RESULTS`, offset 4488
  3. "Overall, oral magnesium was associated with mostly gastrointestinal adverse events (e.g. diarrhoea), experienced by 11% (10% in control) to 37% (14% in control) of participants." — `MAIN RESULTS`, offset 6766
  4. "It is unlikely that magnesium supplementation provides clinically meaningful cramp prophylaxis to older adults experiencing skeletal muscle cramps." — `AUTHORS' CONCLUSIONS`, offset 7001
  5. "In contrast, for those experiencing pregnancy-associated rest cramps the literature is conflicting and further research in this population is needed." — `AUTHORS' CONCLUSIONS`, offset 7149
- answers: CQ-AX-24, Q-D10-03, Q-D10-04 (as an external evidence report to cite), Q-D10-14 (evidence-against section of a compound profile)
- modeling note: one source, two scopes with different verdicts (older adults with idiopathic cramps: unlikely; pregnancy: conflicting) → the assessment's scope (population) is part of its identity; never one verdict per compound.

## FC-02 — RCT: Magnesium bisglycinate in adults reporting poor sleep (UNSTRUCTURED-TO-ENTITY path)

- url: https://www.ebi.ac.uk/europepmc/webservices/rest/PMC12412596/fullTextXML (abstract record: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=40918053&retmode=xml)
- title: Magnesium Bisglycinate Supplementation in Healthy Adults Reporting Poor Sleep: A Randomized, Placebo-Controlled Trial. Schuster J, Cycelskij I, Lopresti A, Hahn A. Nat Sci Sleep 2025;17:2027-2040
- ids: PMID 40918053 · PMCID PMC12412596 · DOI 10.2147/NSS.S524348 · registry DRKS00031494
- retrieved: 2026-10-08 · tool: PubMed MCP (discovery), Europe PMC REST + NCBI efetch via curl (capture)
- captures: `raw/epmc-PMC12412596-fulltext.xml` · sha256 `85a35d77b404a5ad50f415f298cb618b90f9aab23d8bcbeb032ebdd8f742343c`; `raw/pubmed-40918053.xml` · sha256 `e1afe765af770185d9a44f62b88c91deef2d7cc167bfa7adc02cbb42741ea6b7`
- kind: **unstructured-to-entity** (also feeds a secondary-misindexing case)
- quotes (full-text JATS unless noted):
  1. "Each capsule contained 893 mg of magnesium bisglycinate, corresponding to 125 mg of magnesium and 761.5 mg of glycine, providing a total daily dose of 250 mg of magnesium and 1523 mg of glycine." — `sec` "Intervention", offset 20595
  2. "The magnesium bisglycinate supplement used in this study was manufactured by Biogena, Salzburg, Austria." — `sec` "Intervention", offset 20490
  3. "The magnesium bisglycinate group showed a significantly greater reduction in ISI scores compared to the placebo group from baseline to Week 4 (-3.9 [95% CI: -5.8 to -2.0] vs -2.3 [95% CI: -4.1 to -0.4], respectively; p = 0.049)." — PubMed XML, `AbstractText` Results, offset 1903
  4. "The effect size for this between-group difference, as measured by Cohen’s d, was small (d = 0.2), indicating a modest treatment effect." — `sec` "Primary Endpoint: Insomnia Severity Index", offset 53183
  5. "The validity of the sleep-related outcomes is limited by the exclusive reliance on self-reported data without objective verification." — `sec` "Study Strengths, Limitations and Directions for Future Research", offset 71682
  6. "Adrian Lopresti is the managing director of Clinical Research Australia, a contract research organization that receives research funding from nutraceutical companies." — `sec` "Disclosure", offset 76798
- also verbatim in the PubMed XML: `<PublicationType UI="D002363">Case Reports</PublicationType>` (offset 4542) next to "Clinical Trial" and "Journal Article" — an indexing error on an RCT.
- directive 3.8 walk-through (to build in the fixture):
  1. question: "Does magnesium help sleep, and which form?" (Q-D10-01, Q-D10-17)
  2. chunk: the "Primary Endpoint: Insomnia Severity Index" section of the DocumentTextVersion (found by vector search or by MENTIONS of magnesium bisglycinate / insomnia severity)
  3. assertion: subject = study arm material (magnesium bisglycinate, 250 mg/day elemental Mg + 1523 mg/day glycine), predicate = between-group change in ISI at week 4 vs placebo, value −3.9 vs −2.3, p = 0.049, d = 0.2, population adults 18–65 with self-reported poor sleep (D3 owns the result types)
  4. locator: text-quote selector on quote 4 (+ abstract quote 3 as a second locator), section id, offsets
  5. snapshot: the JATS bytes above, sha256 `85a35d77…343c`; verifier re-selects the same exact span
- answers: Q-D10-17, Q-D10-01, CQ-AX-01, Q-D10-14, Q-D10-18 (publication-type misindexing), CQ-RC-03 (missing objective sleep data)
- modeling notes: (a) the administered material co-delivers 1.5 g/day glycine, itself a sleep-marketed compound — an applicability/attribution caveat any "which form" comparison must carry; (b) a named manufacturer links the study to a Product (D6 seam); (c) COI and AI-assistance disclosures are capturable fields.

## FC-03 — FDA letter of enforcement discretion: magnesium and reduced risk of high blood pressure (DISCONFIRMATION; harm condition)

- url: https://www.fda.gov/media/155304/download (announcement: https://www.fda.gov/food/hfp-constituent-updates/fda-announces-qualified-health-claim-magnesium-and-reduced-risk-high-blood-pressure)
- title: FDA response to Petition for a Qualified Health Claim for Magnesium and Reduced Risk of High Blood Pressure (Hypertension), Docket No. FDA-2016-Q-3770 (signed 2022-01-08; announced 2022-01-10)
- retrieved: 2026-10-08 · tool: Tavily search (discovery), curl (PDF capture), pdftotext -layout (text)
- captures: `raw/fda-qhc-magnesium-letter.pdf` · sha256 `06bb4aff841eac559862dd496e63014284a46ad7311b1593e9c392fd4d35753f`; text `raw/fda-qhc-magnesium-letter.txt` · sha256 `e04e43448543a00aa73c0733c8397e76091f582639daef53d6a29a596941a29d`
- kind: **disconfirmation** (a party's characterization of evidence strength rejected by an assessor) with a **harm** condition (upper limit)
- quotes (offsets in the whitespace-normalized text; page from pdftotext form feeds):
  1. "Supportive but inconclusive scientific evidence suggests that diets with adequate magnesium may reduce the risk of high blood pressure (hypertension), a condition associated with many factors." — p. 1, petitioner's proposed model claim, offset 1123 (normalized)
  2. "However, this evidence is inconclusive because the results of the studies are inconsistent." — p. 22, section III, offset 75785 (normalized)
  3. "(181 mg/day to 960 g/day)" — p. 23, offset 76867 (raw text) — unit slip inside the regulator's review
  4. "we intend to consider, as a factor in the exercise of our enforcement discretion, that dietary supplements bearing the claim do not provide more than 350 mg magnesium combined when used according to their labeling." — p. 24, section IV.B, offset 80069 (normalized)
  5. "describing the level of evidence for the claim as "supportive" overstates and therefore mischaracterizes the strength of the evidence for a relationship between magnesium consumption and reduced risk of high blood pressure (hypertension)." — p. 27, offset 92796 (normalized)
  6. "Inconsistent and inconclusive scientific evidence suggests that diets with adequate magnesium may reduce the risk of high blood pressure (hypertension), a condition associated with many factors." — p. 28, offset 94039 (normalized)
- answers: Q-D10-09, Q-D10-03, Q-D10-04 (template of a claim-vetting outcome), CQ-RC-06 (350 mg condition), Q-D10-18 (unit slip), CQ-AX-24
- modeling notes: petitioner = interested organization (D7 seam); the letter is an external evidence report with verdict + qualifier + condition; the two claim texts (proposed vs allowed) are two ClaimOccurrences of one Claim with different strength qualifiers.

## FC-04 — Labdoor: Top 10 Magnesium ranking + "Our scoring process" (comparison / DecisionCriterion)

- urls: https://labdoor.com/rankings/magnesium · https://labdoor.com/about/scores
- titles: Top 10 Magnesium Supplements · Our scoring process - Labdoor
- retrieved: 2026-10-08 · tool: Tavily extract
- captures: `raw/labdoor-magnesium-rankings.md` · sha256 `c264a8d64ce9b1a07dde56ca07b356b50fe0301d3edc81296c27fdf1372fd275`; `raw/labdoor-scores.md` · sha256 `ebcdbb84939c52253b17eaec690c6a39b9ae7b3ce823f802591870412c72a0f5`
- kind: other (comparison/ranking); partially harm (Ingredient Safety, Product Purity criteria)
- quotes:
  1. "# TOP 10 MAGNESIUM" — ranking page, offset 237; first row "Legion Sucrosomial Magnesium" offset 491 (grade A+ with certification badge)
  2. "Penalties are twice as heavy if a product has less than what they claim (underage) compared to if they have more (overage)." — scores page, "Label Accuracy", offset 514
  3. "In 2017, we began applying FDA rounding rules to scoring." — scores page, "Label Accuracy", offset 638
  4. "Labdoor's Projected Efficacy score is based on a product's active ingredients, their levels, and their specific biochemical properties." — scores page, "Projected Efficacy", offset 5993
  5. "we retain the right to update our scoring algorithms, product data, and rankings at any time." — scores page, footnote, offset 7119
- answers: Q-D10-10, Q-D10-11, CQ-RC-01 (shape of a ranked, criterion-scored comparison), Q-D10-02 (external analog of a published comparison)
- modeling notes: five criteria with asymmetric penalties and dated rule changes = DecisionCriterion records with versions; certification status shown beside grade = producer interest (D7 seam); rows with "X … Upcoming" = candidates without values (unknown ≠ zero, CQ-AX-04 — K/D11 row).

## FC-05 — U.S. News "Best Magnesium Supplements Pharmacist Ranked" vs Examine (disagreeing rankings)

- urls: https://health.usnews.com/otc/rankings/magnesium-supplements · https://examine.com/supplements/magnesium/
- titles: Best Magnesium Supplements Pharmacist Ranked | U.S. News · Magnesium benefits, dosage, and side effects (Examine)
- retrieved: 2026-10-08 · tool: Tavily extract
- captures: `raw/usnews-mg-ranking.md` · sha256 `7a2b2e0f41c82bbc7829649a01acfa2212b2262cf306d27c67bf2e358426ace9`; `raw/examine-magnesium.md` · sha256 `52b8cd3b594a2505a210c73b5d5b86914bfd91e1b3509c9f781079360aa81fbd`
- kind: **disconfirmation** (a #1-ranked option contradicted on the criterion an evidence user cares about)
- quotes:
  1. "We surveyed 357 pharmacists to rank the Best Magnesium Supplements for supporting nerve function and reducing physical tension." — U.S. News, offset 116
  2. "Mag-Ox Magnesium Oxide:  Magnesium Oxide (482.6 mg  providing 241.3 mg elemental Magnesium)" — U.S. News rank #1 row, offset 1898
  3. "While U.S. News lists the results of the survey, U.S. News does not recommend or endorse any health products listed here." — U.S. News, offset 4812
  4. "On the other hand, magnesium oxide and magnesium carbonate have extremely poor absorption and aren’t recommended for the purpose of increasing magnesium levels in the body." — Examine, "Formulation", offset 2433
  5. "Last Updated:August 31, 2026" — Examine, offset 1303
- answers: Q-D10-11, Q-D10-10, Q-D10-01 (criteria choice changes the winner), CQ-RC-05 ("a source recommends" vs "evidence favors")
- modeling note: the U.S. News rows are claim occurrences of a survey (producer: U.S. News + The Harris Poll; affiliate links), never a BellLabs ranking.

## FC-06 — NIH LiverTox: Green Tea and Ashwagandha monographs (HARM)

- url: https://ftp.ncbi.nlm.nih.gov/pub/litarch/29/31/livertox_NBK547852.tar.gz (members `livertox_NBK547852/GreenTea.nxml`, `livertox_NBK547852/Ashwagandha.nxml`); HTML https://www.ncbi.nlm.nih.gov/books/NBK547925/ is reCAPTCHA-blocked
- title: LiverTox: Clinical and Research Information on Drug-Induced Liver Injury (NIDDK), monographs "Green Tea" (updated 2020-11-20) and "Ashwagandha" (updated 2024-12-03)
- retrieved: 2026-10-08 · tool: curl on NCBI litarch bulk archive (after Tavily, Firecrawl and curl failed on the HTML)
- captures: archive sha256 `c6d016bace6318bf9de5878cdf4a74956f2b2cbe3d6621e393f5d8f733c55f2d`; `raw/GreenTea.nxml` · sha256 `15012b346e687758703513375e452a594be4f4da7f7085445283c34715090e86`; `raw/Ashwagandha.nxml` · sha256 `4d8afc346940a13c8a70ed788d890e187a9b8dc393a65731dcd2d2ac0c9f2a36`
- kind: **harm**
- quotes:
  1. "Drinking green tea has not been associated with liver injury or serum aminotransferase elevations" — GreenTea.nxml `sec` GreenTea.Hepatotoxicity, offset 6311
  2. "In a large prospective study of GTE in postmenopausal woman at risk for breast cancer, GTE was associated with ALT elevations in 6.7% of patients compared to 0.7% of controls." — GreenTea.Hepatotoxicity, offset 6687
  3. "Likelihood score: A (well established cause of clinically apparent liver injury)." — GreenTea.nxml, offset 8755
  4. "its use should be avoided in patients with cirrhosis or advanced chronic liver disease." — Ashwagandha.nxml `sec` Ashwagandha.Hepatotoxicity, offset 7771
  5. "Likelihood score: B (likely cause of clinically apparent liver injury)." — Ashwagandha.nxml, offset 7876
  6. "The possibility of mislabeling or adulteration with hepatotoxic herbal products is always an issue in commercial multiingredient dietary supplements." — Ashwagandha.nxml `sec` Mechanism of Injury, offset 8221
- answers: Q-D10-07, Q-D10-08, CQ-RC-06, CQ-AX-24
- modeling notes: the harm grade's subject is the extract (D1/D12 seam: beverage vs extract); the grade is a named-scale assessment with an update date (supersession when LiverTox revises); the avoidance statement is population-scoped (cirrhosis).

## FC-07 — USPSTF 2022: Vitamin, Mineral, and Multivitamin Supplementation to Prevent CVD and Cancer (HARM; supersession)

- url: https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/vitamin-supplementation-to-prevent-cvd-and-cancer-preventive-medication (grade scheme: https://www.uspreventiveservicestaskforce.org/uspstf/about-uspstf/methods-and-processes/grade-definitions)
- title: Recommendation: Vitamin, Mineral, and Multivitamin Supplementation to Prevent Cardiovascular Disease and Cancer: Preventive Medication
- retrieved: 2026-10-08 · tool: Tavily search + extract
- captures: `raw/uspstf-vitamins.md` · sha256 `d3d217f70fbbbb4173df71348c3bdc3e2422fd7bd3e052673102668a0b91e7f4`; `raw/uspstf-grades.md` · sha256 `2b576b2a5a7b8effb2174b0fd2b03d308e8641ecacd680272a98465c15d87320`
- kind: **harm** (recommend against) + version chain
- quotes:
  1. "The USPSTF recommends against the use of beta carotene or vitamin E supplements for the prevention of cardiovascular disease or cancer." — "Recommendation Summary" table, offset 2976
  2. "However, an important harm of increased lung cancer incidence was reported with the use of beta carotene by persons who smoke tobacco or have occupational exposure to asbestos." — "Clinician Summary", offset 5791
  3. "This recommendation replaces the 2014 USPSTF recommendation statement on vitamin, mineral, and multivitamin supplements to prevent cardiovascular disease and cancer." — under heading "Other Related USPSTF Recommendations" (update-of-previous paragraph), offset 18102
  4. "The USPSTF concludes with moderate certainty that the harms of beta carotene supplementation for the prevention of cardiovascular disease or cancer outweigh the benefits." — end-of-page summary table, row "USPSTF assessment" (last heading before it: "Response to Public Comment"), offset 50364
- answers: Q-D10-08, Q-D10-03, Q-D10-12 (what changed since 2014: nothing, explicitly), CQ-RC-05 (a body "recommends against"), CQ-AX-24
- modeling note: grade letters are scheme@version values (definitions changed May 2007 and July 2012); the published recommendation supersedes the 2014 one.

## FC-08 — Open Targets Platform: APOE associations and sirolimus pharmacovigilance (association; harm signal)

- urls: https://api.platform.opentargets.org/api/v4/graphql (POST queries saved as `ot-q1.json`, `ot-q2.json` in scratch) · https://platform-docs.opentargets.org/associations.md · https://platform-docs.opentargets.org/drug/pharmacovigilance.md
- titles: Open Targets Platform GraphQL API (apiVersion 26.9.0, dataVersion 26.09) · Target–disease associations · Pharmacovigilance
- retrieved: 2026-10-08 · tool: curl (GraphQL POST; markdown docs)
- captures: `raw/opentargets-APOE-associations.json` · sha256 `92f608c0f2d87b716b6b7c8d0cd83c0f22896c3c2d465d62912015ab05b46fe8`; `raw/opentargets-sirolimus-adverse-events.json` · sha256 `2d765747e8cb9bfb40bbba4402019e17d275c08509c653955a696bba6e916c31`; `raw/ot-associations-doc-src.md` · sha256 `7af84ccd2f819bfd2c57091c1d9732ba0ce601043a7892d1d4b99309eff649d4`; `raw/ot-pharmacovigilance-doc.md` · sha256 `50f717513fab97982e5b7d96ff0bf25f8dfa7c0bac4e0b7b10978213a27f4b64`
- kind: other (materialized association) + **harm** (surveillance signal)
- quotes:
  1. `"name":"Alzheimer disease"},"score":0.695512952413486` — APOE JSON, offset 2104 (row continues with datatypeScores literature 0.9992…, genetic_association 0.8814…)
  2. `"dataVersion":{"year":"26","month":"09","iteration":null}` — APOE JSON, offset 103
  3. "they should not be interpreted as a confidence score for the target-disease association" — associations.md, "Interpreting association scores", offset 9361
  4. `{"name":"malignant neoplasm progression","meddraCode":"","count":1423,"logLR":2480.2412365213677}` — sirolimus JSON, offset 370; `"criticalValue":290.98842339916155` offset 250
  5. "Due to the nature of the surveillance reports, it's relatively common for the indication for which a drug was prescribed to appear in the list of significant ADRs." — pharmacovigilance.md, offset 3722
- answers: Q-D10-05, Q-D10-06, CQ-EV-02 (a score is a projection, not an assertion), CQ-AX-08 (release-bound regenerability)
- modeling note: an external association enters the graph as an *assertion by Open Targets* ("score s under release r") with a locator into the JSON snapshot; BellLabs' own association projection is a separate, regenerable record with its own method version. The two must not be conflated.

## FC-09 — NIH ODS magnesium fact sheet + change history vs the FDA letter (secondary misstatement; report versioning)

- urls: https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/ · https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/51/history?l=en
- titles: Magnesium - Health Professional Fact Sheet (Updated January 6, 2026) · history of changes
- retrieved: 2026-10-08 · tool: Tavily extract (direct curl on the history page returned HTTP 403)
- captures: `raw/ods-magnesium-hp.md` · sha256 `6f0ffe69dd9ed544ab541b462ae696280607d261e6f61c0780a52ca174c96a36`; `raw/ods-mg-history.md` · sha256 `fa0447629a0437e3514d28872d55498d7e1729884a653bdcda3f9dee09b8f60e`
- kind: **disconfirmation** (of a secondary statement) + harm (UL)
- quotes:
  1. "In 2022, the U.S. Food and Drug Administration (FDA) approved a qualified health claim for conventional foods and dietary supplements that contain magnesium" — fact sheet, "Magnesium and Health" › "Hypertension and cardiovascular disease", offset 49605 (contrast FC-03: enforcement discretion, "does not intend to object")
  2. "The Tolerable Upper Intake Level for supplemental magnesium is 350 mg for adults, and it ranges from 65 to 350 mg for children and adolescents, depending on age." — fact sheet, "Health Risks from Excessive Magnesium", offset 70365
  3. "and the aspartate, citrate, lactate, and chloride forms of magnesium tend to have higher bioavailability than magnesium oxide and magnesium sulfate." — fact sheet, "Dietary supplements", offset 28995
  4. "## March 1, 2022" (offset 1244) / "Added the new FDA approved qualified health claim for conventional foods and dietary supplements that contain magnesium." — history page, offset 1262
- answers: Q-D10-18, Q-D10-12, Q-D10-13, CQ-AX-11, CQ-RC-06
- modeling note: a government report sentence about regulatory status needs a locator into the regulator's letter; the history page is the report's version log (report versions with dates).

## FC-10 — ConsumerLab magnesium review, public part (post-publication re-adjudication; selection bias)

- url: https://www.consumerlab.com/reviews/magnesium-supplement-review/magnesium
- title: Magnesium Supplements Review & Top Picks - ConsumerLab.com
- retrieved: 2026-10-08 · tool: Tavily extract (body behind membership)
- capture: `raw/consumerlab-mg.md` · sha256 `3a8c10a2a0b5131f4b499dc0aef7b830574dfc4cef5890712ebc6e6c33646007`
- kind: **disconfirmation** (a published "approved" row withdrawn) + harm (mislabeling)
- quotes:
  1. "This feature is restricted to active members." — offset 1384
  2. "ConsumerLab generally does not select products that have previously failed testing because its goal is to find best quality products." — summary, offset 4850
  3. "Two popular magnesium supplements were NOT Approved in our Magnesium Review as we suspected the presence of the cheaper "oxide" form of magnesium instead of the claimed "glycinate" or "aspartate" forms." — "When Magnesium Labels Mislead", offset 34954
  4. "We have changed its status to ***Not* Approved**" — update note, offset 42542
- answers: CQ-RC-07, Q-D10-10, Q-D10-12, Q-D10-13
- modeling note: comparison rows are individually re-adjudicated after publication → each published row needs its own citation set and a supersession path, not one report-level verdict.

---

## Candidates considered and not retained

- EFSA NDA opinion on coenzyme Q10 claims (DOI 10.2903/j.efsa.2010.1793): landing metadata captured (`raw/efsa-coq10-landing.md`, sha256 `4dd9ad427ccd0341ddda9984310d95b94e4d8d0283b8c4e7268d48bebfe2266f`) but the opinion body (the verdict) was not capturable (Wiley block); no verdict quote available, so it cannot be a fixture this run.
- Consensus live answer for magnesium and sleep: login wall (`raw/consensus-mg-sleep.md` is the sign-up page). Not a source.
- Labdoor product review (Legion Sucrosomial Magnesium): only "LABDOOR SCORE 99.3 of 100" extractable; sub-scores JS-rendered.
