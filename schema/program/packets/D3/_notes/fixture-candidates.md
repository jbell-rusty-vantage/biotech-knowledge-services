# D3 — fixture candidates (Wave 1)

Agent A4 · 2026-10-08. Seven candidates from real sources. Each lists URL, title, retrieval date, tool, the sha256 of the captured bytes (raw file in the session scratch `ft/D3/raw/`; full list in `ft/D3/SHA256SUMS.txt`), and verbatim quotes copied from the capture with a locator hint (file, char offset of the first character in the raw file, and section/path). Question ids refer to `../02-questions.md`.

Quote conventions found during capture (the fixtures stage must keep them):
- **JATS XML** (PMC efetch): quotes are exact over the element's *text content*; the raw bytes contain inline tags (`<italic toggle="yes">P</italic>`) and non-breaking spaces (U+00A0) between numbers and units. A `TextQuoteSelector` must therefore be defined over normalized text content, with the raw offset kept as a hint.
- **Firecrawl markdown** (ISRCTN): list numbers are escaped (`1\.`) and line breaks inside table cells are `<br>`; quotes below avoid those spans.
- **JSON** (Crossref, CTG): quotes are exact raw substrings; Crossref escapes `/` as `\/`.

Flags: **U2E** = demonstrates the unstructured-to-entity path (directive 3.8: question → chunk → assertion → locator → snapshot); **HARM** = harm case; **DISC** = disconfirmation case; **REGHIST** = registry version history (packet direction); **RETR** = retraction or correction (packet direction).

## Summary

| id | candidate | flags | answers |
| --- | --- | --- | --- |
| FC-1 | ASPREE registry history (ISRCTN83772183 + NCT01038583) and its harm results (NEJM 2018) | REGHIST, HARM, DISC | CQ-ST-04, Q-D3-16, CQ-ST-08, Q-D3-08, Q-D3-05, Q-D3-18, CQ-ST-07, Q-D3-15 |
| FC-2 | Retracted resveratrol "longevity proteins" paper (PMID 19071213) with notice PMID 23016154, Crossref/Retraction Watch and OpenAlex records | RETR, HARM, DISC | CQ-EV-05, Q-D3-03, Q-D3-15 |
| FC-3 | Senolytic D+Q phase 2 trial: PMC11705617 full text + NCT04313634 registry results | **U2E**, DISC, HARM | Q-D3-13, Q-D3-14, CQ-ST-05, CQ-ST-06, Q-D3-01, Q-D3-15, Q-D3-08, CQ-ST-01, CQ-ST-07 |
| FC-4 | PEARL rapamycin: medRxiv v1–v4, journal version PMID 40188830, NCT04488601 | DISC | Q-D3-12, CQ-ST-02, CQ-EV-04, CQ-ST-05, Q-D3-02, Q-D3-08 |
| FC-5 | ITP nicotinamide riboside lifespan (PMC8135004) and fisetin (PMID 38041783) | DISC (preclinical), RETR (corrigendum) | Q-D3-06, Q-D3-07, CQ-ST-02 |
| FC-6 | Cochrane antioxidant supplements and mortality, pub1 → pub2 (PMIDs 18425980, 22419320) | HARM | Q-D3-05, Q-D3-11, CQ-ST-09, CQ-AX-24 |
| FC-7 | Basis/NRPT: unposted results (NCT02678611 RELEASE/RESET) and Author Correction (PMID 30155270) | RETR, DISC | Q-D3-02, CQ-ST-08, CQ-EV-05 |

Recommended minimum set for the fixtures stage: **FC-1** (registry version history), **FC-2** (retraction), **FC-3** (unstructured-to-entity, also disconfirmation and harm). FC-4 and FC-5 are the best fourth and fifth (applicability and preclinical).

---

## FC-1 — ASPREE: registered primary outcome changed twice; aspirin harms in healthy older adults

- Sources:
  - https://www.isrctn.com/ISRCTN83772183 · "ISRCTN83772183: ASPirin in Reducing Events in the Elderly" · retrieved 2026-10-08 · Firecrawl CLI scrape (markdown) · file `isrctn-web-ISRCTN83772183.md` · sha256 `16517dbb9bfb5f27f44fd48762c21920fcc4c46dc41309171c279ffa5b8abd21`
  - https://www.isrctn.com/api/query/format/default?q=ISRCTN83772183 · ISRCTN API full-trial XML · retrieved 2026-10-08 · curl · `isrctn-api-ISRCTN83772183.xml` · sha256 `a0fc09730ab340bfee2bdedb025d9f02c100aa9989eb13ba86564d656d26b53e`
  - https://clinicaltrials.gov/api/v2/studies/NCT01038583 · ClinicalTrials.gov v2 record (ASPREE) · retrieved 2026-10-08 · curl · `ctg-v2-NCT01038583.json` · sha256 `35658b43d45bab45650acaf8c5bab1cb0ada4bd58bd8b8a6780716559d91755a`
  - https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=30221597,30221596,30221595&retmode=xml · MEDLINE XML of the three NEJM 2018 ASPREE papers (PMIDs 30221595 doi 10.1056/NEJMoa1803955; 30221596 doi 10.1056/NEJMoa1800722; 30221597 doi 10.1056/NEJMoa1805819) · retrieved 2026-10-08 · curl · `pubmed-efetch-aspree.xml` · sha256 `66aac4d68b7cfa6b76e026dc5e53887491a81248bd67708df96a7719f76d057b`
- Quotes:
  1. `isrctn-web` offset 7398, Primary outcome field, "Provided at time of registration" block: "Coronary artery disease death"
  2. `isrctn-web` offset 6984 and 7046, Primary outcome field: "Updated as of 14/03/2008:" … "Death from incident dementia, defined according to the Diagnostic and Statistical Manual for Mental Disorders 4th edition (DSM-IV) criteria"
  3. `isrctn-web` offset 6645 and 6836, Primary outcome field: "Amended 02/03/2009:" … "Persistent physical disability, defined as the onset of a lot of difficulty to inability to perform any one of 6 Katz Activities of Daily Living"
  4. `isrctn-web` offset 23693, Editorial Notes: "22/08/2018: Bayer AG (Australia) was removed as a funder. Bayer provided the study drug, but did not fund the trial."
  5. `ctg-v2-NCT01038583.json` offset 1121, `protocolSection.sponsorCollaboratorsModule.leadSponsor`: "\"name\":\"Hennepin Healthcare Research Institute\"" (ISRCTN names "Monash University (Australia)" as sponsor — two registries, two sponsors)
  6. `pubmed-efetch-aspree.xml` offset 668795, PMID 30221595 Abstract RESULTS: "The risk of death from any cause was 12.7 events per 1000 person-years in the aspirin group and 11.1 events per 1000 person-years in the placebo group (hazard ratio, 1.14; 95% confidence interval [CI], 1.01 to 1.29)."
- Additional verified spans (for the fixtures stage, not counted as the 2–6 quotes): ISRCTN API `<trial … version="138">` (offset 86 of the XML); NEJM major hemorrhage "hazard ratio, 1.38; 95% CI, 1.18 to 1.62" (offset 2600, PMID 30221597); disability-free survival "terminated at a median of 4.7 years of follow-up … no benefit" (offset 349954, PMID 30221596); cause-of-death analyses described as "post hoc exploratory" (offset 668494).
- Why it matters: the only agent-reachable registry history in this run (ClinicalTrials.gov history is blocked, `tool-log.md`). It shows three registered versions of the primary outcome with dates, a funder correction, a cross-registry sponsor disagreement, an early stop for futility, and harm on secondary endpoints (bleeding, mortality) — the biohacker avoidance question for "aspirin for longevity".
- Flags: REGHIST (valid time = registry dates 2005-07-14, 2008-03-14, 2009-03-02; recorded time = our capture 2026-10-08), HARM, DISC.

## FC-2 — Retraction: "Expression of the longevity proteins by both red and white wines …" (resveratrol)

- Sources:
  - https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=19071213&retmode=xml · MEDLINE record of the retracted article (Free Radic Biol Med 2009;46(5):573-8, doi 10.1016/j.freeradbiomed.2008.11.005) · retrieved 2026-10-08 · curl · `pubmed-efetch-19071213.xml` · sha256 `88796be4f321d421f90164097cdff3acfa477ea380c25e2f2a1c974f803178ec`
  - https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=23016154&retmode=xml · MEDLINE record of the retraction notice (doi 10.1016/j.freeradbiomed.2012.06.017) · retrieved 2026-10-08 · curl · `pubmed-efetch-23016154.xml` · sha256 `901a03db450b2c75a2fab5e8b6415279ac8c1ae7a7b9527c04d194e404804c2e`
  - https://api.crossref.org/works/10.1016/j.freeradbiomed.2008.11.005 · Crossref work JSON · retrieved 2026-10-08 · curl · `crossref-10.1016-j.freeradbiomed.2008.11.005.json` · sha256 `dee9cfe7654c67f96fb111edccea0794d1f3804777eb11b5f11a5c8d94f90609`
  - https://api.labs.crossref.org/works/10.1016/j.freeradbiomed.2008.11.005 · Crossref Labs work JSON (Retraction Watch reasons) · retrieved 2026-10-08 · curl · `crossref-labs-19071213.json` · sha256 `9b5920ea04544a01e0d555596dc2c2cf752ed861dda51d3d1494e1126598a102`
  - https://api.openalex.org/works/doi:10.1016/j.freeradbiomed.2008.11.005 · OpenAlex W2101407999 · retrieved 2026-10-08 · curl · `openalex-19071213.json` · sha256 `7b738306e1e6b84ad216220604f3d5a346f201822dc827c492aa27bcff5939b0`
- Quotes:
  1. `pubmed-efetch-19071213.xml` offset 1204, AbstractText: "Resveratrol increases longevity through SirT1, which is activated with NAD(+) supplied by an anti-aging enzyme PBEF."
  2. `pubmed-efetch-23016154.xml` offset 1155, PublicationTypeList: "<PublicationType UI=\"D016440\">Retraction Notice</PublicationType>"
  3. `pubmed-efetch-23016154.xml` offset 1462, CommentsCorrectionsList: "<CommentsCorrections RefType=\"RetractionOf\"><RefSource>Free Radic Biol Med. 2009 Mar 1;46(5):573-8. doi: 10.1016/j.freeradbiomed.2008.11.005.</RefSource><PMID Version=\"1\">19071213</PMID>"
  4. `crossref-…json` offset 14290 and 14417, `message.updated-by[0]`: "\"source\":\"retraction-watch\"" … "\"record-id\":\"4565\""
  5. `crossref-…json` offset 14483, `message.updated-by[1]`: "\"type\":\"erratum\",\"label\":\"Erratum\",\"source\":\"publisher\"" (the publisher labels the same notice DOI an erratum)
  6. `crossref-labs-19071213.json` offset 936, `cr-labs-updates[1].reasons[0]`: "alsification/Fabrication of Data" (verbatim, first character missing in the source)
- Why it matters: a longevity mechanism claim (resveratrol → SirT1) whose source is retracted; three asserters (NLM, publisher via Crossref, Retraction Watch via Crossref) label the same notice differently (retraction vs erratum), the publisher also deposits a self-referencing retraction dated 2009-03-01, and citation counts differ (Crossref 97, OpenAlex 113). Nine resveratrol papers by the same author are flagged "Retracted Publication" in PubMed (`pubmed-efetch-das.xml`, sha256 `4c97685f578a4330ca49760f0026e4cc83dd1620ff451fe1053cca3f6ac01b07`), which feeds Q-D3-03.
- Flags: RETR, HARM (users citing the claim), DISC.

## FC-3 — Senolytic D+Q trial: the unstructured-to-entity path (recommended U2E fixture)

- Sources:
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC11705617/ (captured as JATS via https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id=11705617&retmode=xml) · Farr JN et al. "Effects of intermittent senolytic therapy on bone metabolism in postmenopausal women: a phase 2 randomized controlled trial." Nat Med 2024;30(9):2605-2612 · PMID 38956196 · doi 10.1038/s41591-024-03096-2 · retrieved 2026-10-08 · curl · `pmc-efetch-PMC11705617.xml` · sha256 `67e6b9b16b32949e5ecd98f69d1f8ee195b2c9f8d660a8d3caa7482aea015338`
  - https://clinicaltrials.gov/api/v2/studies/NCT04313634 · "Targeting Cellular Senescence With Senolytics to Improve Skeletal Health in Older Humans" (results posted 2024-07-22) · retrieved 2026-10-08 · curl · `ctg-v2-NCT04313634.json` · sha256 `a3c441396bc30921120a8e15a642e294c04d6ca92f395aaf51ab995ff7218eb1`
  - https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=38956196&retmode=xml · MEDLINE record · retrieved 2026-10-08 · curl · `pubmed-efetch-38956196.xml` · sha256 `e7879f51fafd7277ed3ef08e86d574b207bd3af00bb1e1155b68a7122d898375`
- Quotes:
  1. JATS offset 24426, `sec#S3` "Study participants and study design": "The original study design included a third arm in which participants were to be administered a flavanol with senolytic properties (fisetin)" … (offset 24617) "but because of the COVID pandemic and cost issues, the study was modified to a two-arm study (control versus D + Q)."
  2. JATS offset 27226, `sec#S4` "Primary endpoint": "which did not differ between the D + Q versus the control groups."
  3. JATS offset 27905, `sec#S5` "Secondary endpoints" (exact over text content; raw has `<italic>` around P): "it was significantly higher (relative to control) in the D + Q group at 2 weeks (difference from control, +16%, P = 0.020) and 4 weeks (difference from control, +16%, P = 0.024)"
  4. JATS offset 28681, `sec#S6` "Safety and adverse events": "No serious or severe adverse events related to D + Q administration occurred."
  5. `ctg-v2-NCT04313634.json` offsets 36312 and 36655, `resultsSection.adverseEventsModule` (fisetin group EG001): "\"seriousNumAffected\":1,\"seriousNumAtRisk\":14" … "\"term\":\"Gastric hemorrhage\""
  6. JATS offset 102761, `fn-group` Competing interests: "have a financial interest related to this research, including patents and pending patents covering senolytic drugs and their uses that are held by Mayo Clinic."
- Additional verified spans: registry primary analysis `"pValue":"0.611"` (offset 22334); `"masking":"NONE"` (offset 1935) matching the paper's "we elected to use an open-label design" (JATS offset 26052); `"title":"Fisetin Treatment Group"` (offset 13686); "The funders played no role in the conduct or analyses in this study." (JATS offset 102565); Data availability states individual participant data are in the Supplementary Information (JATS offset 104581, text content).
- U2E walk (directive 3.8), to be built in the fixtures stage: question "Did senolytics improve bone in older women, and were there harms?" → chunks from `sec#S4`, `sec#S5`, `sec#S6` (vector/fulltext over the DocumentTextVersion of this snapshot) → assertions: OutcomeDefinition CTx 20 weeks (primary), StudyResult NOT_SIGNIFICANT; P1NP 2 and 4 weeks (secondary) SIGNIFICANT_FAVORABLE; AE statement → locators (JATS section id + exact quote + offsets) → snapshot digest above; the registry snapshot supplies the fisetin-arm SAE that the paper does not report (second asserter).
- Flags: **U2E**, DISC (null primary; favorable secondary; exploratory p16 tertile; dropped arm), HARM (gastric hemorrhage SAE in the unreported arm).

## FC-4 — PEARL rapamycin: preprint versions, dose equivalence, sponsor that sells the drug

- Sources:
  - https://api.biorxiv.org/details/medrxiv/10.1101/2024.08.21.24312372/na/json · medRxiv "Safety and efficacy of rapamycin on healthspan metrics after one year: PEARL Trial Results" v1–v4 · retrieved 2026-10-08 · curl · `medrxiv-api-10.1101-2024.08.21.24312372.json` · sha256 `0475069c9e74278246bdfe4c796e1979295688211a3ae1810a33e8a108c6d367`
  - https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=40188830&retmode=xml · "Influence of rapamycin on safety and healthspan metrics after one year: PEARL trial results." Aging 2025 · doi 10.18632/aging.206235 · PMC12074816 · retrieved 2026-10-08 · curl · `pubmed-efetch-40188830.xml` · sha256 `9edc2c99ca70246cf7f04222de9171962631c804d8a6a4af53dee0a4d5694573`
  - https://clinicaltrials.gov/api/v2/studies/NCT04488601 · PEARL registry record · retrieved 2026-10-08 · curl · `ctg-v2-NCT04488601.json` · sha256 `66cb873f0bc554adb1eb5dcd9d80fc04930fb1f208f8d10898acdb91f959a662`
- Quotes:
  1. medRxiv JSON offset 1032, `collection[0].abstract`: "Participants received placebo, 5mg or 10mg compounded rapamycin (equivalent to 1.43mg or 2.86mg of generic formulations) weekly."
  2. PubMed XML offset 1328, AbstractText DESIGN: "Participants received placebo, 5 mg or 10 mg compounded rapamycin weekly."
  3. medRxiv JSON offset 1546, abstract Results: "Visceral adiposity did not change significantly ({eta}p2=0.001, p=0.942)"
  4. PubMed XML offset 2153, AbstractText RESULTS: "improved significantly for women using 10 mg rapamycin."
  5. medRxiv JSON offset 2397 (every version row): "\"published\":\"NA\""
  6. CTG JSON offset 1150 and 12988: "\"name\":\"AgelessRx\",\"class\":\"INDUSTRY\"" … "\"hasResults\":false"
- Why it matters: the dose a biohacker would buy (compounded) is claimed equivalent to a lower generic dose in the preprint only; the published abstract drops the equivalence. Primary outcome null; positive findings are sex/dose subgroups. Preprint not linked to its publication by the server; registry has no results and no references; sponsor sells rapamycin prescriptions (D6/D7 seam).
- Flags: DISC.

## FC-5 — ITP: nicotinamide riboside does not extend mouse lifespan (with measured diet dose); fisetin neither

- Sources:
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC8135004/ (JATS via efetch db=pmc id=8135004) · "17-a-estradiol late in life extends lifespan in aging UM-HET3 male mice; nicotinamide riboside and three other drugs do not affect lifespan in either sex." Aging Cell 2021 · PMID 33788371 · doi 10.1111/acel.13328 · retrieved 2026-10-08 · curl · `pmc-efetch-PMC8135004.xml` · sha256 `6a6dd53c742dec51dec4aaa4a7f965d3e5e438a1d782cf83a7da5a000f440973`
  - https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=38041783&retmode=xml · "Astaxanthin and meclizine extend lifespan in UM-HET3 male mice; fisetin, SG1002 (hydrogen sulfide donor), dimethyl fumarate, mycophenolic acid, and 4-phenylbutyrate do not significantly affect lifespan …" GeroScience 2024 · doi 10.1007/s11357-023-01011-0 · retrieved 2026-10-08 · curl · `pubmed-efetch-38041783.xml` · sha256 `1077ff3232c992685ac4b791e17650769d1b7185fcaff4035dd9c6b4285cb918`
- Quotes:
  1. JATS offset 30218, Discussion: "Our new data show that Nicotinamide riboside (NR) failed to increase lifespan."
  2. JATS offset 73187 → 73304, Methods (text content; raw has U+00A0 before "mg" and "ppm"): "Nicotinamide riboside (NR) was generously provided by ChromaDex" … "as the chloride salt, and mixed at a dose of 1,000 mg NR Chloride per kilogram diet (1,000 ppm)."
  3. JATS offset 73720, Methods (text content; raw has U+00A0 around "+"): "Assaying four different batches of diet pellets, amounts of nicotinamide +NR in ppm were as follows: 196 + 393 = 589 (67% of the expected level)"
  4. JATS offset 54008, Results: "NR led to a marginally significant increase in female lifespan at one site, but this was balanced by a marginally significant decline in female lifespan at another"
  5. JATS offset 15972, related-article/corrigendum note: "Corrigendum to: 17‐a‐estradiol late in life extends lifespan"
  6. PubMed 38041783 offset 851, ArticleTitle: "fisetin, SG1002 (hydrogen sulfide donor), dimethyl fumarate, mycophenolic acid, and 4-phenylbutyrate do not significantly affect lifespan in either sex at the doses and schedules used"
- Why it matters: preclinical disconfirmation of two popular longevity supplements; the administered material (ChromaDex NR chloride), nominal dose (ppm in diet), measured delivery (67–89% of nominal) and per-site heterogeneity are exactly the properties a preclinical StudyIntervention/StudyResult needs. The paper also carries a corrigendum.
- Flags: DISC (preclinical), RETR (corrigendum present; content not yet read).

## FC-6 — Cochrane: antioxidant supplements and mortality, two review versions

- Sources:
  - https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=18425980&retmode=xml · Bjelakovic G et al. Cochrane Database Syst Rev 2008, CD007176 (doi 10.1002/14651858.CD007176) · retrieved 2026-10-08 · curl · `pubmed-efetch-18425980.xml` · sha256 `efd45f4e2e0683ea7be3bc2c48e7e1f0fefcfc9f94034cac769393b208c7f1ca`
  - https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=22419320&retmode=xml · same review, 2012 update (doi 10.1002/14651858.CD007176.pub2, PMC8407395) · retrieved 2026-10-08 · curl · `pubmed-efetch-22419320.xml` · sha256 `807b74c49e70d70ab3e3150a4e575c12bd62bd6ceac472d7b6ee3bbf7bee676d`
- Quotes:
  1. 18425980 offset 3806, MAIN RESULTS: "found significantly increased mortality by vitamin A (RR 1.16, 95% CI 1.10 to 1.24), beta-carotene (RR 1.07, 95% CI 1.02 to 1.11), and vitamin E (RR 1.04, 95% CI 1.01 to 1.07)"
  2. 18425980 offset 7291, CommentsCorrectionsList: "RefType=\"UpdateIn\"" (→ PMID 22419320)
  3. 22419320 offset 8121: "RefType=\"UpdateOf\"" (→ PMID 18425980)
  4. 22419320 offset 2722, MAIN RESULTS: "Seventy-eight randomised trials with 296,707 participants were included."
- Why it matters: a published synthesis with a version chain and a harm finding by supplement form; the avoidance answer for "antioxidant megadoses for longevity".
- Flags: HARM.

## FC-7 — Basis (NR + pterostilbene): results submitted then reset, never posted; paper corrected

- Sources:
  - https://clinicaltrials.gov/api/v2/studies/NCT02678611 · "A Study to Evaluate Safety and Health Benefits of Basis Among Elderly Subjects." · retrieved 2026-10-08 · curl · `ctg-v2-NCT02678611.json` · sha256 `61806a4283a9461f1d569f1e2cfddf38bbc292622f4e78b92dc026bcd8e1cd89`
  - https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=30155270&retmode=xml · "Erratum: Author Correction: Repeat dose NRPT …" npj Aging Mech Dis 2018 · doi 10.1038/s41514-018-0027-1 · retrieved 2026-10-08 · curl · `pubmed-efetch-30155270.xml` · sha256 `2ec72c0e4fd82ca9132ba027ccd39161cf975c470d141e5fcabab8381f7aad6d`
- Quotes:
  1. CTG offset 7324, `annotationSection.annotationModule.unpostedAnnotation`: "\"unpostedResponsibleParty\":\"Elysium Health\""
  2. CTG offset 7386: "{\"type\":\"RELEASE\",\"date\":\"2018-03-14\"},{\"type\":\"RESET\",\"date\":\"2018-10-12\"}"
  3. PubMed offset 3000, PublicationType: "Published Erratum"
  4. PubMed offset 1141, AbstractText: "This corrects the article DOI: 10.1038/s41514-017-0016-9."
- Why it matters: registry-process history without the history endpoint (submission events), a supplement brand's unposted results, and a correction that (per the competency-question lab, CQ-EV-05 example) changed material provenance, not results. Overlaps with the earlier ontology-lab NRPT case, so it is a backup rather than a first choice.
- Flags: RETR (correction), DISC (missing results).

## Also captured (not candidates)

- ISRCTN60173424 (Mitopure formulation PK, Editorial Notes "29/12/2025: The date of final enrolment was changed from 15/03/2026 to 28/11/2025." at offset 14514) · `isrctn-web-ISRCTN60173424.md` · sha256 `a303e5570cf91428317ef8a3c71cb6e34ef93298765ab6ad0beee8b28bdc1488` — second ISRCTN history instance; links D3 to D6 formulations.
- NMNH-Ca medRxiv preprint (10.64898/2026.08.11.26360226) · `medrxiv-api-10.64898-2026.08.11.26360226.json` · sha256 `f58036ff572a579e0d5360812c6eb608f47564a6dac35a95191249e1539a86dc` — two rows labelled version 1; unit symbol lost in API abstract.
- ClinicalTrials.gov history attempt for NCT03464500: `ctg-int-history-NCT03464500.raw` (the 403 body, sha256 `ca5744a124a28b7620febf9fd1104acaa1a1d18adec4ebc4782c727ec32b5cef`) and `ctg-web-history-NCT03464500.md` (rendered page without the history table).
