# D3 — ecosystem survey: clinical and preclinical evidence

Agent A4 · Wave 1 · 2026-10-08 · research, not medical advice.

How the evidence that BellLabs users ask about is produced, versioned, published, corrected, synthesized and graded; which artifacts are capturable sources; and how agent-ready each one is. Every factual statement carries a source key `[Sn]`; the source table at the end gives URL · title · retrieval date for each key. Raw captures (with sha256) are in the session scratch `ft/D3/raw/` and are listed in `_notes/fixture-candidates.md`; tool behaviour is in `_notes/tool-log.md`.

Reading guide: section 1 groups the ecosystem by actor type (what each actor does, what it emits, whether we can capture it); section 2 walks the evidence lifecycle as operations; section 3 is the artifact interview (two or more real instances per artifact type, end to end, with their fields); section 4 reads the domain through the four lenses; section 5 scores agent-readiness; section 6 lists what this means for the model.

## 1. Actors

### 1.1 Trial registries (primary record of what was planned, and sometimes what was found)

| actor | process and operations | artifacts | capturable? | agent-readiness |
| --- | --- | --- | --- | --- |
| **ClinicalTrials.gov** (NLM/NIH) | Sponsors register a protocol record, update it, submit summary results; NLM runs quality-control (QC) review before posting; FDA-regulated "applicable clinical trials" must report results under FDAAA 801 [S1][S2][S14]. The public API v2.0 (REST, OpenAPI 3.0) was announced in March 2024 (bulletin posted 19 March 2024); the classic API was retired in June 2024 [S3]. | Study record (protocol section: identification, status, sponsor/collaborators, oversight, design, arms/interventions, outcomes, eligibility, locations, references; results section: participant flow, baseline, outcome measures, adverse events, more-info; annotation section; derived section) [S4][S6][S7]. Record History (versions with diffs) on the website [S7]. | Current record: yes, JSON per study [S4]. History: **no** — the documented API has only `/studies/{nctId}` [S8]; the website's internal history endpoints returned 403 to every automated client on 2026-10-08 (`_notes/tool-log.md`). A 2022 study of registry histories states that the API "allows access to the most recent version of clinical trial registry entries, the API does not allow access to historical clinical trial registry data" [S9]. | current record 3; history 0 |
| **ISRCTN** (BMC/Springer Nature) | Registration with a DOI per record; edits are logged as dated Editorial Notes and older field values are kept inline ("Amended 02/03/2009:", "Provided at time of registration:") [S10]. Records cross-reference the NCT number [S10]. | Web record; XML API with a version counter (`version="138"` for ASPREE) [S11]. | Yes: web via Firecrawl; XML via API. Plain curl is redirected to a holding page [tool-log]. | web 1 (scrape-only; history only as prose) · XML API 2 |
| **WHO ICTRP** | Aggregates primary registries into one search portal; offers the Universal Trial Number; the crawling service is "currently not available" [S12]. | Aggregated trial record with "Last refreshed on" date, secondary IDs, monetary support [S13]. | HTML only. | 1 |
| **EU CTIS** (EMA, Regulation (EU) No 536/2014) | Sponsor–regulator workflow for EU/EEA trials; a public website shows trials "from 31 January 2022" [S15]. | CTIS public record. | Public portal; not exercised in this stage. | not scored (owner: D11 follow-up) |
| **AACT** (CTTI) | Downloads ClinicalTrials.gov daily into a public relational database of "40+ connected tables" with cloud access by account and downloadable historical snapshots [S16] (connection limits not stated on the cited page; an earlier "10 concurrent connections per account" was removed in the adversarial-review stage as unsourced). | Postgres tables of every CTG study. | Yes (account). | 2 (bulk; current state only) |

### 1.2 Sponsors, investigators, CROs and funders (who runs and pays)

| actor (example) | what they do | artifacts | notes for the model |
| --- | --- | --- | --- |
| Supplement brand as sponsor: **Amazentis SA** (urolithin A, Mitopure) | Industry sponsor of the ATLAS and ENERGIZE trials (NCT03464500, NCT03283462) [S4a]; also registers formulation pharmacokinetic studies on ISRCTN (ISRCTN60173424 compares "four different Mitopure formulations") [S17]. Company scientists co-author the paper (JAMA Netw Open 2022, PMID 35050355, Amazentis affiliations) [S18]. | Registry records, papers, product pages. | Sponsor = seller: the D7 seam (financial interest) is needed for almost every supplement trial. |
| Supplement brand as sponsor: **Elysium Health** (NR + pterostilbene, "Basis") | Sponsor of NCT02678611 [S4b]; the registry shows results were released for QC on 2018-03-14 and **reset** on 2018-10-12, and never posted [S4b]. A later Author Correction (PMID 30155270) corrected the paper [S19]. | Registry record with unposted-results annotation; paper; erratum. | "Results submitted but not posted" is a harm-relevant transparency signal. |
| Telehealth seller as sponsor: **AgelessRx** (rapamycin) | Lead sponsor of PEARL (NCT04488601) [S4c]; corresponding author institution on the medRxiv preprint [S20]. | Registry record (no results posted, no references) [S4c]; four preprint versions [S20]; journal article (PMID 40188830) [S21]. | Sponsor sells the intervention (D6/D7 seam). |
| Academic investigator-sponsor: **Mayo Clinic** (senolytics) | NCT04313634 lead sponsor is the investigator ("Sundeep Khosla, M.D.", responsible party SPONSOR_INVESTIGATOR) [S4d]. Three authors declare "a financial interest related to this research, including patents and pending patents covering senolytic drugs" held by Mayo Clinic [S22]. NIH grants fund the work [S22]. | Registry with posted results; paper (PMID 38956196, PMC11705617); follow-up biomarker paper (PMID 39823170) [S18]. | Funder ≠ sponsor ≠ patent holder: three different roles. |
| Academic consortium with an industry drug supplier: **ASPREE** (Monash University, Hennepin Healthcare Research Institute, NIA, NCI) | ISRCTN names Monash University as sponsor [S10]; ClinicalTrials.gov names Hennepin Healthcare Research Institute as lead sponsor and lists Bayer as a collaborator [S4e]; ISRCTN records that "Bayer provided the study drug, but did not fund the trial" [S10]. | Two registry records that disagree on sponsor; three NEJM papers [S23]. | Provider-of-material vs funder vs sponsor must be separate predicates; registries disagree. |
| Co-author affiliation, role unverified: **2KGK Synergize** (London, ON) | Affiliation of a co-author on the NRPT trial erratum record ("2KGK Synergize London, London, ON Canada") [S19]; the record states no role, so a CRO or site role is not established by this source. | Paper affiliations. | A CRO role, where one exists, appears only in affiliations or acknowledgements; not a registry field. |
| Public funder: **NIA** (Interventions Testing Program; ASPREE co-funder) | Funds ITP via three U01 testing sites and one U24 data coordinating center [S24]; co-funds ASPREE [S10]. | Grants (in PubMed/Europe PMC grant lists [S25]). | Funding is a D7 relationship; D3 needs only to reach it. |

### 1.3 Publishers and indexers (what was reported, and how it changes)

| actor | operations | artifacts | capturable? | readiness |
| --- | --- | --- | --- | --- |
| **PubMed / MEDLINE** (NLM) | Indexes citations; assigns publication types (e.g. "Randomized Controlled Trial", "Retracted Publication", "Retraction Notice", "Published Erratum"); links notices to articles via CommentsCorrections (`RetractionIn`/`RetractionOf`, `UpdateOf`/`UpdateIn`, `CommentIn`) [S19][S26][S27][S28]. | MEDLINE XML record. | Yes, E-utilities (3 req/s without key [tool-log]). | 3 |
| **PubMed Central** | Hosts full text (JATS XML) with section ids [S22][S29]. | JATS article. | Yes for OA/author manuscripts. | 3 (best locator surface) |
| **Europe PMC** | REST search with grants, publication types, text-mined accession numbers (`hasTMAccessionNumbers`) [S25][S30]. | JSON core record; OA full text. | Metadata yes; full text for PMC11705617 returned HTTP 500 [tool-log]. | 2 |
| **Crossref** | DOI registration; `update-to`/`updated-by` carries corrections and retractions with a `source` of `publisher` or `retraction-watch`; acquired the Retraction Watch database in September 2023 and made it public [S31][S32]. | Work JSON; Retraction Watch CSV (git, daily) [S32]. | Yes. | 3 |
| **OpenAlex** | Open scholarly graph with `is_retracted` and citation counts [S33]. | Work JSON. | Yes. | 3 |
| **Unpaywall** | OA location API; email parameter required; 100,000 calls/day [S34]. | OA locations per DOI. | Yes. | 3 |
| **Semantic Scholar** | Academic Graph API with API keys [S35]. | Paper JSON, citations. | Yes (key present by name in `.env`). | 3 (not exercised) |

### 1.4 Preprint servers

| actor | operations | artifacts | readiness |
| --- | --- | --- | --- |
| **bioRxiv / medRxiv** (openRxiv) | Versioned preprints; API endpoint `details/[server]/[DOI]/na/[format]` returns every version [S36]. | Version rows with date, version, authors, license, category, JATS URL, `published` (journal DOI or "NA") [S20][S37]. | 2: PEARL is published (PMID 40188830) but every preprint row still says `"published":"NA"` [S20][S21]; the NMNH-Ca preprint shows two rows both labelled version 1 with different dates [S37]. |

### 1.5 Research-integrity actors (corrections, retractions, outcome switching, results reporting)

| actor | operations | artifacts | readiness |
| --- | --- | --- | --- |
| **Retraction Watch** (Center for Scientific Integrity; data now distributed by Crossref) | Curates retractions, expressions of concern and corrections with reasons, nature of notice, subjects, countries [S32][S38][S39]. | Database record (Record ID, reasons, notice DOI, URLs). | 3 via Crossref REST; Crossref Labs 1 (reasons flagged "unstable", drop the first character of each reason — `"alsification/Fabrication of Data"` — and requests without a `mailto` get HTTP 403) [S40][tool-log]. |
| **COMPare** (outcome switching) | Compared each trial report "with its protocol or registry entry", counted pre-specified outcomes never reported and new outcomes "silently added" [S41]. | Letters, dataset. | 1 (historical project). |
| **FDAAA TrialsTracker** (AllTrials) | Tracks which applicable trials reported results under FDAAA 2007 [S14]. | Per-trial overdue table. | 1 (JS shell via Tavily shows "0 out of 0") [S14]. |
| **ICMJE** | Requires registration "at or before the time of first patient consent for enrollment as a condition of consideration for publication" [S42]. | Policy. | n/a (rule, not data). |

### 1.6 Evidence synthesis and grading

| actor | operations | artifacts | readiness |
| --- | --- | --- | --- |
| **Cochrane** | Systematic reviews published as versioned reviews; a new version cites the one it updates (PubMed `UpdateOf`/`UpdateIn`) [S27][S28]. | Review (pub1, pub2 …) with included-trial counts and pooled estimates [S27][S28]. | 2 via PubMed; Cochrane Library page is a JS shell via Tavily [S43]. |
| **GRADE Working Group** | "A common, sensible and transparent approach to grading quality (or certainty) of evidence and strength of recommendations", described as "now considered the standard in guideline development" [S44]. | Certainty ratings inside reviews and guidelines. | n/a (method). |
| **PROSPERO** (CRD, NIHR) | "International systematic review registry that aims to promote transparency … reduce reporting bias" [S45]. | Review protocol record. | 1 (JS app; count rendered as "0" in extraction) [S45]. |
| **Examine** (consumer evidence grading) | Self-described "largest database of nutrition and supplement research"; "not affiliated with any supplement or food company" [S46]. | Supplement pages with research feed; grading details behind a paywall ("unlock these insights") [S47]. | 0–1 (paywalled). |

### 1.7 Data-sharing platforms

| actor | operations | readiness |
| --- | --- | --- |
| **YODA Project** (Yale) | Mission "to advocate for the responsible sharing of clinical research data" via partnerships with Data Partners [S48]. | 1 (request-based access). |
| **Vivli** | Clinical research data sharing platform with members and an independent review panel [S49]. | 1 (request-based access). |
| **Journal supplements** | Farr 2024 provides "Individual deidentified participant data … as an Excel file in the Supplementary Information" and the protocol with SAP [S22]. | 2 (per-paper). |

### 1.8 Preclinical evidence producers

| actor | operations | artifacts | readiness |
| --- | --- | --- | --- |
| **NIA Interventions Testing Program (ITP)** | Tests agents in genetically heterogeneous UM-HET3 mice at the Jackson Laboratory, University of Michigan and UT Health San Antonio under shared SOPs; external "sponsors" propose agents [S24][S50]. "15 agents and 2 combinations" significantly increased median lifespan as of the page capture [S24]. | Lifespan papers per cohort (e.g. 2015 cohort: NR no effect, PMID 33788371 [S29]; 17aE2 effective; 2018/2019 cohorts (fisetin in C2018): no effect, PMID 38041783 [S51]; adversarial-review correction, re-fetched PMC10828146: "Lifespan data for cohort 2018 (C2018) are shown separately from cohort 2019 (C2019)", "cohort 2018: … Fisetin (Fis), 600 ppm"). Data at the Mouse Phenome Database project ITP1 [S52]. | 2–3 (papers + MPD data). |
| **Mouse Phenome Database** (JAX) | Hosts ITP lifespan, body composition and other phenotype data 2004–2026 [S52]. | Datasets. | 2 (not exercised beyond the project page). |

## 2. The evidence lifecycle as operations

1. **Register** (planned design, arms, interventions, outcomes, sponsor). ICMJE requires it before first enrollment [S42]. Registration may be retrospective; ISRCTN marks ASPREE "Prospectively registered" [S10].
2. **Amend** the registration. ISRCTN keeps the old text: ASPREE's primary outcome at registration was a list of cardiovascular death endpoints, "Updated as of 14/03/2008" to death, death from incident dementia and death from persistent physical disability, and "Amended 02/03/2009" to death, incident dementia and persistent physical disability [S10]. ClinicalTrials.gov keeps versions in its Record History [S7] but these are not API-reachable (section 1.1).
3. **Run and report results to the registry.** NLM QC: NCT04313634 results first submitted 2024-06-01, met QC 2024-07-19, posted 2024-07-22 [S4d]. Submissions can be reset (NCT02678611: RELEASE 2018-03-14, RESET 2018-10-12, never posted) [S4b].
4. **Preprint** (optional, versioned). PEARL: four medRxiv versions between 2024-08-22 and 2024-09-24; version 4 drops one author [S20].
5. **Publish** (journal article; sometimes several papers from one trial). ASPREE produced three NEJM papers in 2018 on the primary endpoint, cardiovascular/bleeding, and all-cause mortality [S23]; the ISRCTN record lists 35 study outputs (results papers, rationale, design, secondary analyses) [S10].
6. **Correct / retract / express concern.** NRPT Author Correction (PMID 30155270) [S19]; Das resveratrol paper retracted (notice PMID 23016154) [S26]; ITP NR paper carries a corrigendum (title "Corrigendum to: 17‐a‐estradiol late in life extends lifespan …" inside the PMC record) [S29].
7. **Synthesize** (systematic review / meta-analysis), then **update** the synthesis as a new version (Cochrane CD007176 pub1 2008 → pub2 2012) [S27][S28].
8. **Grade** (GRADE certainty in guidelines [S44]; consumer grading at Examine [S47]).
9. **Share data** (IPD in supplements [S22]; YODA/Vivli request-based [S48][S49]).

## 3. Artifact interviews (fields read end to end, two or more real instances each)

### 3.1 Registry study record — ClinicalTrials.gov API v2 JSON

Instances read: NCT04313634 (senolytics, results posted) [S4d]; NCT01038583 (ASPREE) [S4e]; NCT02678611 (Basis/NRPT) [S4b]; NCT04488601 (PEARL) [S4c]; also NCT03464500, NCT03283462, NCT02921659, NCT02950441, NCT02432287, NCT04571008 [S4][S4a].

| module | fields observed (selection that a D3 question touches) |
| --- | --- |
| identificationModule | nctId, orgStudyIdInfo.id, organization.fullName/class, briefTitle, officialTitle, acronym |
| statusModule | overallStatus, statusVerifiedDate, startDateStruct{date,type ACTUAL/ESTIMATED}, primaryCompletionDateStruct, completionDateStruct, studyFirstSubmitDate, studyFirstPostDateStruct, resultsFirstSubmitDate, resultsFirstSubmitQcDate, resultsFirstPostDateStruct, lastUpdateSubmitDate, lastUpdatePostDateStruct |
| sponsorCollaboratorsModule | responsibleParty{type, investigatorFullName, investigatorAffiliation}, leadSponsor{name,class INDUSTRY/OTHER/NIH}, collaborators[] |
| designModule | studyType, phases[], designInfo{allocation, interventionModel, primaryPurpose, maskingInfo.masking}, enrollmentInfo{count,type ACTUAL/ESTIMATED} |
| armsInterventionsModule | armGroups[{label,type EXPERIMENTAL/PLACEBO_COMPARATOR/NO_INTERVENTION,description,interventionNames}], interventions[{type DRUG/DIETARY_SUPPLEMENT/OTHER,name,description}] — dose, form and supplier are free text inside `description` (e.g. "quercetin phytosome (sophora japonica concentrate (leaf) / phosphatidylcholine complex from Sunflower) 250 mg") [S4d] |
| outcomesModule | primaryOutcomes[{measure,description,timeFrame}], secondaryOutcomes[…] — no priority flag beyond the list it sits in; the same measure can repeat with different time frames (P1NP at 2, 4, 20 weeks) [S4d] |
| referencesModule | references[{pmid,type DERIVED/RESULT/BACKGROUND,citation}] — NCT04313634 lists the two Farr papers as DERIVED [S4d]; NCT04488601 lists none although the trial is published [S4c] |
| annotationSection | unpostedAnnotation{unpostedResponsibleParty, unpostedEvents[{type RELEASE/RESET,date}]} [S4b] |
| derivedSection | miscInfoModule.versionHolder (= capture date, e.g. "2026-10-08"), submissionTracking{estimatedResultsFirstSubmitDate, submissionInfos[{releaseDate,resetDate}]} [S4b] |
| contacts | pointOfContact name, email and phone (personal data; must not be copied into the graph) [S4d] |

### 3.2 Registry results section — ClinicalTrials.gov

Instances read: NCT04313634 [S4d]; NCT04571008 (NMN, WashU) and NCT02432287 (metformin MILES) [S4].

| block | fields |
| --- | --- |
| participantFlowModule | groups[{id FG000…,title,description}], periods[{title, milestones[{type STARTED/COMPLETED/NOT COMPLETED, achievements[{groupId,numSubjects}]}]}] |
| outcomeMeasuresModule.outcomeMeasures[] | type PRIMARY/SECONDARY, title, description, reportingStatus POSTED, paramType (MEDIAN/MEAN/NUMBER), dispersionType ("Full Range"), unitOfMeasure ("percent change"), timeFrame, groups[{id OG000…,title,description}], denoms[{units,counts[{groupId,value}]}], classes[{categories[{measurements[{groupId,value,lowerLimit,upperLimit}]}]}], analyses[{groupIds[], nonInferiorityType SUPERIORITY, pValue (string, e.g. "0.611"), statisticalMethod ("Wilcoxon (Mann-Whitney)")}] |
| adverseEventsModule | frequencyThreshold, timeFrame, description, eventGroups[{id EG000…,deathsNumAffected/AtRisk, seriousNumAffected/AtRisk, otherNumAffected/AtRisk}], seriousEvents[{term, organSystem, assessmentType SYSTEMATIC_ASSESSMENT, stats[{groupId,numAffected,numAtRisk}]}], otherEvents[{…,numEvents}] |
| moreInfoModule | certainAgreement{piSponsorEmployee}, pointOfContact (personal data) |

Observed facts relevant to questions: NCT04313634 primary CTX analysis p "0.611" (D+Q vs control); secondary P1NP p "0.020" and "0.024" [S4d]; a **fisetin arm** (14 at risk) appears in results with one serious event "Gastric hemorrhage" [S4d], while the paper says the study "was modified to a two-arm study (control versus D + Q)" [S22]. MILES posts primary outcome counts with no `analyses` (no statistical test posted) [S4].

### 3.3 Registry version history

Instances read: ISRCTN83772183 (ASPREE) and ISRCTN60173424 (Mitopure PK) [S10][S17]; ClinicalTrials.gov history attempted for NCT03464500 (blocked) [S7].

| source | how history is expressed | fields |
| --- | --- | --- |
| ISRCTN Editorial Notes | dated lines: "29/12/2025: The date of final enrolment was changed from 15/03/2026 to 28/11/2025." [S17]; "20/02/2009: The target number of participants was changed from 18,000 to 19,000." [S10]; "28/08/2018: … the ISRCTN record for ASPREE will not be further updated by the investigators" [S10] | note date, field changed, old value, new value (prose) |
| ISRCTN inline field history | "Provided at time of registration:" / "Updated as of 14/03/2008:" / "Amended 02/03/2009:" blocks inside Primary outcome, Study objectives, Exclusion criteria [S10] | version label, version date, full prior text |
| ISRCTN API | `<trial lastUpdated="2026-07-20T12:57:16.538811799Z" version="138" …>` [S11] | version counter, last-updated timestamp (no per-version content) |
| ClinicalTrials.gov Record History | version list and side-by-side diffs on the website [S7] | not capturable by agents on 2026-10-08 |
| ClinicalTrials.gov annotation | RELEASE/RESET events for results submissions [S4b] | event type, date, responsible party |

### 3.4 Bibliographic record — PubMed MEDLINE XML

Instances read: PMID 38956196 (Farr 2024) [S18]; 30221595/30221596/30221597 (ASPREE NEJM) [S23]; 23016154 (retraction notice) [S26]; 30155270 (erratum) [S19]; 22419320 and 18425980 (Cochrane) [S27][S28]; 33788371 and 38041783 (ITP) [S29][S51]; 40188830 (PEARL) [S21].

Fields: PMID; ArticleTitle; Abstract/AbstractText with `Label` (BACKGROUND, METHODS, RESULTS, CONCLUSIONS, MAIN RESULTS …); Journal (ISSN, volume, issue, PubDate); AuthorList with affiliations; PublicationTypeList (with MeSH UI, e.g. `D016440` Retraction Notice); MeshHeadingList; GrantList; CommentsCorrectionsList (RefType RetractionIn/RetractionOf, UpdateOf/UpdateIn, CommentIn, ErratumIn); PubmedData/History (entrez, pubmed, medline dates); ArticleIdList (pubmed, doi, pmc, mid, pii); ReferenceList (cited works — their ArticleIds are **not** the article's own ids [tool-log]); DataBankList/accession for NCT numbers when indexed. Abstract text names the registry id ("ClinicalTrials.gov identifier: NCT04313634") [S18].

### 3.5 Full-text article — PMC JATS

Instances read: PMC11705617 (Farr 2024, Nat Med) [S22]; PMC8135004 (ITP NR cohort, Aging Cell 2021) [S29].

Fields: `article-meta` (ids, history, permissions); `abstract`; `body/sec[@id]` with titles (Farr: S3 "Study participants and study design", S4 "Primary endpoint", S5 "Secondary endpoints", S6 "Safety and adverse events", S7 "Exploratory and post hoc analyses", S15 "Dosages of D + Q", S17 "Study endpoints", S27 "Data availability"); `fig`/`table-wrap` with captions; `fn-group` (competing interests, code availability); `ack` (grants and funder role statement: "The funders played no role in the conduct or analyses in this study.") [S22]; `ref-list`. The ITP paper's Methods give the administered material and the measured delivery: NR "provided by ChromaDex … as the chloride salt, and mixed at a dose of 1,000 mg NR Chloride per kilogram diet (1,000 ppm)" and four diet batches assayed at 67–89% of the expected NR + nicotinamide level [S29].

### 3.6 Correction and retraction notices

Instances read: retraction notice PMID 23016154 / DOI 10.1016/j.freeradbiomed.2012.06.017 for PMID 19071213 [S26][S53]; Author Correction PMID 30155270 / DOI 10.1038/s41514-018-0027-1 for the NRPT paper [S19]; corrigendum linked from the ITP NR paper [S29]; nine Das resveratrol papers flagged "Retracted Publication" with `RetractionIn` links (e.g. PMID 24669285 → 35996378, 12003802 → 22833916) [S54].

| field | PubMed | Crossref | Crossref Labs (Retraction Watch) | OpenAlex |
| --- | --- | --- | --- | --- |
| notice type | PublicationType "Retraction Notice" / "Published Erratum" | `updated-by[].type` = retraction **and** erratum for the same notice DOI, from different `source`s | `update-nature` "Retraction" (RW) vs "Crossmark Retraction" (publisher) | `is_retracted: true` |
| link | CommentsCorrections RetractionOf/RetractionIn | `updated-by[].DOI` | `target-doi` | — |
| date | notice PubDate (2012 Aug 1) | `updated.date-time` 2012-08-01 (RW) and 2009-03-01 (publisher self-reference) | `update-date` | — |
| reasons | — | — | `reasons[]` (first character missing) | — |
| who asserts | NLM indexers | publisher vs Retraction Watch (`record-id` 4565) | `asserted-by` (ROR of Retraction Watch vs Crossmark) | — |
| citations | — | `is-referenced-by-count` 97 | — | `cited_by_count` 113 |

Sources: [S26][S53][S40][S33]. The retracted paper's title in Crossref is prefixed "RETRACTED:" [S53].

### 3.7 Preprint record — medRxiv API

Instances read: PEARL 10.1101/2024.08.21.24312372 (v1–v4) [S20]; NMNH-Ca 10.64898/2026.08.11.26360226 [S37].

Fields: title, authors, author_corresponding, author_corresponding_institution, doi, date, version, type (PUBLISHAHEADOFPRINT), license, category, jatsxml URL, published, server, abstract. Observations: PEARL preprint abstract states "5mg or 10mg compounded rapamycin (equivalent to 1.43mg or 2.86mg of generic formulations)"; the journal abstract says "5 mg or 10 mg compounded rapamycin weekly" without the equivalence [S20][S21]. The preprint title says "Safety and efficacy …"; the journal title says "Influence of rapamycin on safety and healthspan metrics …" [S20][S21].

### 3.8 Systematic review record

Instances read: Cochrane CD007176 pub1 (PMID 18425980, 67 trials) and pub2 (PMID 22419320, 78 trials, 296,707 participants) [S27][S28].

Fields (from PubMed): PublicationType "Meta-Analysis", "Systematic Review"; DOI with `.pubN` version suffix; `UpdateOf`/`UpdateIn` links; structured abstract (MAIN RESULTS with trial counts, participants, risk-of-bias split, pooled RR with 95% CI under random- and fixed-effect models, heterogeneity I²). Pub1 reports increased mortality with vitamin A (RR 1.16), beta-carotene (RR 1.07) and vitamin E (RR 1.04) in low-bias trials [S28].

### 3.9 Preclinical lifespan report (ITP)

Instances read: PMID 33788371 / PMC8135004 (2015 cohort; NR, candesartan, GGA, MIF098; 17aE2) [S29]; PMID 38041783 (astaxanthin, meclizine; fisetin and four others without effect) [S51].

Fields: species and stock (UM-HET3, CByB6F1 × C3D2F1), sites (TJL, UM, UT), sex-stratified median lifespan change with log-rank p, 90th-percentile lifespan with Wang–Allison test, agent dose in diet (ppm), age at start (months), diet assay (measured ppm vs nominal), material supplier and salt form, per-site results [S29][S51].

### 3.10 Consumer evidence-grading page

Instances read: Examine "Nicotinamide Riboside" (written by a named author, "Last Updated: August 28, 2025") and "Fisetin"; Examine About page [S46][S47].

Fields visible without subscription: name, author, last-updated date, primary category ("Healthy Aging & Longevity"), research feed link; the grading matrix is behind Examine+ [S47]. Independence statement on About [S46].

## 4. The four lenses

### 4.1 Science

- **Registered vs published primary outcomes diverge, and registries rewrite their own past.** ASPREE's registered primary outcome went from cardiovascular death endpoints to disability-free survival over 2008–2009 [S10]; COMPare documented that trial reports drop pre-specified outcomes and silently add new ones [S41].
- **Null primary with favorable secondary or subgroup is common in longevity trials.** Farr 2024: primary CTx "did not differ" while P1NP rose at 2 and 4 weeks, and the high-p16 tertile is an exploratory/post hoc analysis [S22]; urolithin A (JAMA Netw Open 2022): 6-minute walk and ATPmax not significant, muscle endurance improved [S18]; PEARL: visceral adiposity unchanged, lean mass improved in women on 10 mg [S21].
- **Arms disappear between registry and paper.** The Farr registry results include a fisetin arm with a serious gastric hemorrhage [S4d]; the paper reports a two-arm study [S22].
- **One trial, many papers.** ASPREE: three primary NEJM papers [S23] plus 35 study outputs listed on ISRCTN [S10]; the Farr trial: the Nat Med paper and a follow-up biomarker paper [S18]. Counting papers overstates independent evidence (CQ-AX-05).
- **Administered material ≠ product.** The ITP NR diet delivered 67–89% of nominal [S29]; PEARL dosed compounded rapamycin claimed equivalent to a lower generic dose [S20].
- **Preclinical negatives matter.** ITP: NR "failed to increase lifespan" [S29]; fisetin did not significantly affect lifespan "at the doses and schedules used" [S51].
- **Harm is often only in secondary endpoints.** ASPREE: major hemorrhage HR 1.38 [S23] and all-cause mortality HR 1.14 with cancer deaths the main contributor (post hoc cause analyses) [S23]; Cochrane: some antioxidants increase mortality [S28].

### 4.2 Economics

- Supplement and longevity companies sponsor and co-author their own trials (Amazentis, Elysium, AgelessRx) [S4a][S4b][S4c][S18][S20]; academic patents tie investigators to outcomes (Mayo senolytic patents) [S22]. Investors and biohackers need "who paid, who sells, who holds the patent" next to every result (seam D7).
- Results reporting is legally required only for applicable clinical trials under FDAAA [S14]; dietary-supplement trials frequently never post results (NCT02678611 reset, NCT04488601 none, NCT03464500/NCT03283462 none) [S4a][S4b][S4c].
- Data access is a gatekept market (YODA/Vivli request-based) [S48][S49]; consumer grading is a subscription product (Examine+) [S47].

### 4.3 Community

- Community discourse retells results (podcasts, newsletters); the question "how many independent lines of evidence" (CQ-AX-05) exists because retellings multiply. D9 owns the retelling chain; D3 must expose the study/dataset identity that retellings collapse onto.
- Integrity communities (Retraction Watch, COMPare, AllTrials) produce machine-readable signals that are directly useful to BellLabs users [S32][S41][S14].
- Biohackers act on preprints: PEARL circulated as a preprint for months with four versions before the journal version [S20][S21].

### 4.4 AI and agents

- Agent-ready: CTG v2 current records, PubMed XML, PMC JATS, Crossref, OpenAlex, medRxiv API [tool-log].
- Not agent-ready: CTG history (blocked), ICTRP (HTML; crawling service unavailable [S12]), Cochrane Library pages, PROSPERO UI, Examine grading (paywall) [tool-log][S43][S45][S47].
- Locators: PMC JATS gives stable section ids (`sec id="S4"`) and paragraph text for `SourceLocator` exact quotes; CTG JSON gives JSON-pointer-style locators (e.g. `resultsSection.outcomeMeasuresModule.outcomeMeasures[0].analyses[0].pValue`); ISRCTN gives dated note lines.
- Data-quality traps an agent must handle: identifiers of cited references inside a PubMed record; disagreeing notice types across Crossref sources; dropped characters in Crossref Labs reasons; unit symbols stripped in medRxiv API abstracts ("18.53 M" for µM) [S37][tool-log].

## 5. Agent-readiness scores (0 blocked · 1 scrape-only · 2 API without locators or partial · 3 agent-ready)

| source | readiness | identifiers emitted | locator kinds |
| --- | ---: | --- | --- |
| ClinicalTrials.gov v2 current record | 3 | NCT, org study id, PMID (references) | JSON path |
| ClinicalTrials.gov record history | 0 | version number, date (website only) | — |
| ISRCTN web page (Firecrawl) | 1 | ISRCTN, DOI 10.1186/ISRCTNnnn, NCT cross-ref | note line, field block (scrape-only) |
| ISRCTN XML API | 2 | ISRCTN, NCT (secondary ids), version counter | XML attribute / element |
| WHO ICTRP | 1 | primary registry id, secondary ids | HTML text |
| PubMed E-utilities | 3 | PMID, DOI, PMCID, MID, PII | XML path (AbstractText Label) |
| PMC JATS | 3 | PMCID | section id + quote + char offset |
| Europe PMC | 2 | PMID, PMCID, DOI, grants, text-mined accessions | — |
| Crossref (+ Retraction Watch) | 3 | DOI, RW record id | JSON path |
| Crossref Labs | 1 | DOI, ROR of asserter | JSON path (unstable keys; `mailto` required) |
| OpenAlex | 3 | OpenAlex W id, DOI | JSON path |
| medRxiv/bioRxiv API | 2 | DOI, version | JSON path; JATS via `jatsxml` |
| Cochrane via PubMed | 2 | CD number via DOI `.pubN` | AbstractText Label |
| ITP papers + MPD | 2–3 | PMID/PMCID; MPD project id | section id |
| Examine | 0–1 | — | — |
| COMPare / TrialsTracker | 1 | NCT | HTML |

## 6. Implications for the D3 model (handed to the model stage)

1. Registration history must be modelled as **observed versions with valid time** (the registry's own dates) separate from **BellLabs capture time**; ISRCTN prose history and CTG annotation events are the realistic populating sources; CTG history needs a non-agent route.
2. The registry and the paper are **two asserters** about the same study; disagreements (sponsor, arms, primary outcome, dispersion statistic) are assertions with different asserters, not overwrites.
3. **Arm-level material and dose** are free text in registries; structured dose needs extraction with a locator (and measured-vs-nominal delivery for preclinical diets).
4. **Results need analysisKind / comparison / conclusion / p and dispersion type** because null-primary-with-favorable-secondary is the dominant pattern in this domain.
5. **Corrections and retractions arrive from several asserters with different labels**; the model needs the notice as a publication plus per-asserter assertions, and a way to find every assertion that rests on a retracted source.
6. **Synthesis versions** (Cochrane pub1 → pub2) and **preprint versions** (medRxiv v1–v4) are version chains of publications; the same supersession pattern should serve both.
7. **Sponsor, funder, drug provider, patent holder** are distinct roles that cross into D7; D3 should only reach them.

## Sources

Retrieval date for every source: 2026-10-08. Tool per source in `_notes/tool-log.md`.

| key | URL · title |
| --- | --- |
| S1 | https://clinicaltrials.gov/data-api/api · ClinicalTrials.gov API (glossary and data API page) |
| S2 | https://clinicaltrials.gov/policy/fdaaa-801-final-rule · FDAAA 801 and the Final Rule, ClinicalTrials.gov |
| S3 | https://www.nlm.nih.gov/pubs/techbull/ma24/ma24_clinicaltrials_api.html · ClinicalTrials.gov API Version 2.0 Now Available. NLM Technical Bulletin 2024 Mar–Apr |
| S4 | https://clinicaltrials.gov/api/v2/studies/NCT02432287 and https://clinicaltrials.gov/api/v2/studies/NCT04571008 (also NCT02921659, NCT02950441) · ClinicalTrials.gov API v2 study records |
| S4a | https://clinicaltrials.gov/api/v2/studies/NCT03464500 and https://clinicaltrials.gov/api/v2/studies/NCT03283462 · ATLAS and ENERGIZE (Amazentis SA) study records |
| S4b | https://clinicaltrials.gov/api/v2/studies/NCT02678611 · A Study to Evaluate Safety and Health Benefits of Basis Among Elderly Subjects (Elysium Health) |
| S4c | https://clinicaltrials.gov/api/v2/studies/NCT04488601 · PEARL (AgelessRx) study record |
| S4d | https://clinicaltrials.gov/api/v2/studies/NCT04313634 · Targeting Cellular Senescence With Senolytics to Improve Skeletal Health in Older Humans |
| S4e | https://clinicaltrials.gov/api/v2/studies/NCT01038583 · ASPREE study record (ClinicalTrials.gov) |
| S5 | merged into S7 (same URL; adversarial-review stage) |
| S6 | https://clinicaltrials.gov/api/oas/v2 · ClinicalTrials.gov API v2 OpenAPI specification |
| S7 | https://clinicaltrials.gov/study/NCT03464500?tab=history · ClinicalTrials.gov Record History tab: glossary text captured from the page; the history table rendered "Error" for automated clients |
| S8 | https://clinicaltrials.gov/api/oas/v2 · paths section (`/studies/{nctId}` only) |
| S9 | https://pmc.ncbi.nlm.nih.gov/articles/PMC9249399 · Analysis of clinical trial registry entry histories using the novel R package cthist (Carlisle 2022) — full open-access article (PMC JATS via E-utilities efetch, re-fetched 2026-10-08 in the adversarial-review stage, sha256 ffab7354…; the quote is in the article body) |
| S10 | https://www.isrctn.com/ISRCTN83772183 · ISRCTN83772183: ASPirin in Reducing Events in the Elderly |
| S11 | https://www.isrctn.com/api/query/format/default?q=ISRCTN83772183 · ISRCTN API full-trial XML for ASPREE |
| S12 | https://www.who.int/tools/clinical-trials-registry-platform · International Clinical Trials Registry Platform (ICTRP) |
| S13 | https://trialsearch.who.int/Trial2.aspx?TrialID=ISRCTN83772183 · ICTRP record for ASPREE |
| S14 | https://fdaaa.trialstracker.net/ · FDAAA TrialsTracker — Who's sharing their clinical trial results? |
| S15 | https://www.ema.europa.eu/en/human-regulatory-overview/research-development/clinical-trials-human-medicines/clinical-trials-information-system · Clinical Trials Information System (CTIS), EMA |
| S16 | https://aact.ctti-clinicaltrials.org/ · AACT: Improving Public Access to Aggregate Content of ClinicalTrials.gov |
| S17 | https://www.isrctn.com/ISRCTN60173424 · ISRCTN60173424: The effect of four Mitopure food supplement formulations on the amount of Urolithin A in blood |
| S18 | PubMed records PMID 38956196 (doi 10.1038/s41591-024-03096-2), 39823170 (doi 10.1111/acel.14489), 35050355 (doi 10.1001/jamanetworkopen.2021.44279), 29599478 (doi 10.1038/s41467-018-03421-7) via PubMed MCP and https://pubmed.ncbi.nlm.nih.gov/38956196/ |
| S19 | https://pubmed.ncbi.nlm.nih.gov/30155270/ · Author Correction: Repeat dose NRPT … (doi 10.1038/s41514-018-0027-1, PMC6102308) |
| S20 | https://api.biorxiv.org/details/medrxiv/10.1101/2024.08.21.24312372/na/json · medRxiv: Safety and efficacy of rapamycin on healthspan metrics after one year: PEARL Trial Results (v1–v4) |
| S21 | https://pubmed.ncbi.nlm.nih.gov/40188830/ · Influence of rapamycin on safety and healthspan metrics after one year: PEARL trial results (doi 10.18632/aging.206235, PMC12074816) |
| S22 | https://pmc.ncbi.nlm.nih.gov/articles/PMC11705617/ · Farr JN et al. Effects of intermittent senolytic therapy on bone metabolism in postmenopausal women: a phase 2 randomized controlled trial. Nat Med 2024 (PMID 38956196) — JATS via E-utilities efetch db=pmc |
| S23 | https://pubmed.ncbi.nlm.nih.gov/30221595/, /30221596/, /30221597/ · ASPREE NEJM 2018: all-cause mortality (doi 10.1056/NEJMoa1803955), disability-free survival (doi 10.1056/NEJMoa1800722), cardiovascular events and bleeding (doi 10.1056/NEJMoa1805819) |
| S24 | https://www.nia.nih.gov/research/dab/interventions-testing-program-itp/about-itp · About the ITP, National Institute on Aging |
| S25 | https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:38956196%20AND%20SRC:MED&format=json&resultType=core · Europe PMC core record for PMID 38956196 |
| S26 | https://pubmed.ncbi.nlm.nih.gov/23016154/ · Retraction notice to "Expression of the longevity proteins by both red and white wines …" FRB 46 (2009) 573–578 |
| S27 | https://pubmed.ncbi.nlm.nih.gov/22419320/ · Antioxidant supplements for prevention of mortality in healthy participants and patients with various diseases (Cochrane 2012, doi 10.1002/14651858.CD007176.pub2, PMC8407395) |
| S28 | https://pubmed.ncbi.nlm.nih.gov/18425980/ · same title, Cochrane 2008 (doi 10.1002/14651858.CD007176) |
| S29 | https://pmc.ncbi.nlm.nih.gov/articles/PMC8135004/ · 17-a-estradiol late in life extends lifespan in aging UM-HET3 male mice; nicotinamide riboside and three other drugs do not affect lifespan in either sex (PMID 33788371, doi 10.1111/acel.13328) |
| S30 | https://europepmc.org/RestfulWebService · Europe PMC Articles RESTful API |
| S31 | https://www.crossref.org/blog/news-crossref-and-retraction-watch/ · Crossref acquires Retraction Watch data and opens it for the scientific community (12 Sep 2023) |
| S32 | https://www.crossref.org/documentation/retrieve-metadata/retraction-watch/ · Retraction Watch — Crossref documentation |
| S33 | https://api.openalex.org/works/doi:10.1016/j.freeradbiomed.2008.11.005 · OpenAlex work W2101407999 |
| S34 | https://unpaywall.org/products/api · Unpaywall REST API |
| S35 | https://www.semanticscholar.org/product/api · Semantic Scholar API — Overview |
| S36 | https://api.biorxiv.org/ · bioRxiv API Summary |
| S37 | https://api.biorxiv.org/details/medrxiv/10.64898/2026.08.11.26360226/na/json · medRxiv: Safety and Exploratory Efficacy of Reduced β-Nicotinamide Mononucleotide Calcium Salt (NMNH-Ca) … |
| S38 | https://retractionwatch.com/retraction-watch-database-user-guide/ · Retraction Watch Database User Guide |
| S39 | https://retractionwatch.com/retraction-watch-database-user-guide/retraction-watch-database-user-guide-appendix-a-fields/ and …-appendix-c-article-types/ · RW user guide appendices A (fields) and C (article types) |
| S40 | https://api.labs.crossref.org/works/10.1016/j.freeradbiomed.2008.11.005 · Crossref Labs work record with `cr-labs-updates` |
| S41 | https://www.compare-trials.org/ · COMPare: Tracking switched outcomes in clinical trials |
| S42 | https://www.icmje.org/recommendations/browse/publishing-and-editorial-issues/clinical-trial-registration.html · ICMJE Clinical Trial Registration |
| S43 | https://www.cochranelibrary.com/about/about-cochrane-reviews · About Cochrane Reviews (JS shell in extraction) |
| S44 | https://www.gradeworkinggroup.org/ · Welcome to the GRADE working group |
| S45 | https://www.crd.york.ac.uk/prospero/ · PROSPERO International prospective register of systematic reviews |
| S46 | https://examine.com/about/ · About Examine |
| S47 | https://examine.com/supplements/nicotinamide-riboside/ · Nicotinamide Riboside — Examine |
| S48 | https://yoda.yale.edu/ · The YODA Project |
| S49 | https://vivli.org/about/overview/ · Vivli — Overview |
| S50 | https://www.nia.nih.gov/research/dab/interventions-testing-program-itp · Interventions Testing Program (ITP), NIA |
| S51 | https://pubmed.ncbi.nlm.nih.gov/38041783/ · Astaxanthin and meclizine extend lifespan in UM-HET3 male mice; fisetin, SG1002 … do not significantly affect lifespan … (doi 10.1007/s11357-023-01011-0, PMC10828146) |
| S52 | https://phenome.jax.org/projects/ITP1 · ITP: Interventions Testing Program … (Mouse Phenome Database) |
| S53 | https://api.crossref.org/works/10.1016/j.freeradbiomed.2008.11.005 · Crossref work: RETRACTED: Expression of the longevity proteins by both red and white wines … (PMID 19071213) |
| S54 | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=24669285,22414106,19071213,18821770,18789672,18045550,17125593,17015251,12003802 · MEDLINE records of nine Das DK resveratrol papers flagged Retracted Publication |
