# Fixture aspree-registry-history-harm — source

- url: https://www.isrctn.com/ISRCTN83772183
- title: ISRCTN83772183: ASPirin in Reducing Events in the Elderly (ISRCTN record page; ASPREE, also NCT01038583)
- retrieved: 2026-10-08
- snapshot digest: sha256:16517dbb9bfb5f27f44fd48762c21920fcc4c46dc41309171c279ffa5b8abd21 (Firecrawl markdown of the record page, 25,048 bytes; identical to the research-stage capture)
- kind: harm
- also: registry version history (packet direction), disconfirmation (primary outcome changed twice; futility stop)
- tool: `firecrawl scrape --wait-for 4000` (CLI 1.23.1; `tool:firecrawl-scrape` — plain curl is redirected to an ISRCTN bot holding page), curl to the ISRCTN query API (`tool:isrctn-api`), curl to ClinicalTrials.gov API v2 (`tool:ctgov-v2`), curl to NCBI E-utilities efetch (`tool:pubmed-eutils`). All re-fetched on 2026-10-08 in the fixtures stage; every quote was re-selected from these bytes by `../../../../packets/D3/_notes/tools/build_fixtures.py`.
- producedBy (fixture-scoped ids, not real Mission Control runs): mission `mission:ft-D3-fixtures`, run `run:ft-D3-aspree-registry-history-harm`.

## All snapshots of this fixture

| ref | url | title | digest (raw bytes) | tool |
| --- | --- | --- | --- | --- |
| s-isrctn-web | https://www.isrctn.com/ISRCTN83772183 | ISRCTN record page (history prose: "Provided at time of registration", "Updated as of 14/03/2008", "Amended 02/03/2009", Editorial Notes) | sha256:16517dbb9bfb5f27f44fd48762c21920fcc4c46dc41309171c279ffa5b8abd21 | tool:firecrawl-scrape |
| s-isrctn-api | https://www.isrctn.com/api/query/format/default?q=ISRCTN83772183 | ISRCTN API full-trial XML (`version="138"`, `lastUpdated="2026-07-20…"`) | sha256:a0fc09730ab340bfee2bdedb025d9f02c100aa9989eb13ba86564d656d26b53e | tool:isrctn-api |
| s-ctg-nct01038583 | https://clinicaltrials.gov/api/v2/studies/NCT01038583 | ClinicalTrials.gov v2 record (current version only; lastUpdatePostDate 2021-04-05) | sha256:35658b43d45bab45650acaf8c5bab1cb0ada4bd58bd8b8a6780716559d91755a | tool:ctgov-v2 |
| s-pubmed-aspree | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=30221597,30221596,30221595&retmode=xml | MEDLINE XML of the three NEJM 2018 papers: PMID 30221597 (doi 10.1056/NEJMoa1805819, PMC6289056), PMID 30221596 (doi 10.1056/NEJMoa1800722, PMC6426126), PMID 30221595 (doi 10.1056/NEJMoa1803955, PMC6433466) | sha256:66aac4d68b7cfa6b76e026dc5e53887491a81248bd67708df96a7719f76d057b | tool:pubmed-eutils |

## Description

ASPREE randomized 19,114 healthy older adults to 100 mg enteric-coated aspirin or placebo. The ISRCTN record is the only agent-reachable registry history in this run (ClinicalTrials.gov history is blocked, `../../../../packets/D3/_notes/tool-log.md`): its primary-outcome field keeps three dated texts, which the fixture turns into three RECONSTRUCTED `RegistrationVersion`s (valid from 2005-07-14 = registration date, 2008-03-14, 2009-03-02; recorded 2026-10-08) beside two OBSERVED versions (ISRCTN version 138, last edited 2026-07-20; CTG last updated 2021-04-05). The primary outcome moved from eight cardiovascular death and event outcomes at registration (coronary artery disease death, two cardiac failure deaths, other vascular death, non-coronary cardiac death, cerebrovascular disease death, non-fatal cardiovascular events, non-fatal cerebrovascular events) to three death-based outcomes (2008) to death, incident dementia and persistent physical disability (2009); the papers and CTG report one composite primary (disability-free survival, HR 1.01, P=0.79, trial stopped for futility at a median of 4.7 years), while the harms are on secondary end points (major hemorrhage HR 1.38, 1.18–1.62, P<0.001; death from any cause HR 1.14, 1.01–1.29, called "unexpected") and a post hoc cancer-death analysis; the registration-time non-fatal cardiovascular and cerebrovascular events reappear only inside the paper's secondary cardiovascular-disease composite (HR 0.95, 0.83–1.08). The two registries disagree on the sponsor (ISRCTN: Monash University; CTG: Hennepin Healthcare Research Institute), on the study type (CTG: OBSERVATIONAL) and on status (ISRCTN Completed; CTG UNKNOWN with four results submissions reset or unreleased), and ISRCTN's editorial note of 22/08/2018 removes Bayer from its record as funder (a record correction: Bayer "did not fund the trial") while stating Bayer supplied the study drug. Contact details printed on the ISRCTN page (name, e-mail, phone of the scientific contact) are not selected by any locator.

## What this fixture exercises (assertion refs in `assertions.yaml`)

| relationship / node | exercised by |
| --- | --- |
| HAS_REGISTRATION_VERSION (StateEpisodeProperties) | a04–a06 RECONSTRUCTED ISRCTN 2005-07-14 (citing all eight registration-time primaries) / 2008-03-14 / 2009-03-02 (valid time STATED_BY_SOURCE; 2009 closed INFERRED by the observed version), a07 OBSERVED ISRCTN v138, a08 OBSERVED CTG |
| HAS_OUTCOME (structural) + STATED_IN (OutcomeDefinition → RegistrationVersion / Publication) | 18 OutcomeDefinitions; a09 and a75–a81 the eight registration-time primaries (one locator each, l12 and l96–l102), a10–a16 per later registry version, a17 CTG, a18–a21 and a82 (cardiovascular-disease secondary) papers |
| MEASURES → D2 Outcome / D2 Condition | a22–a26 (all-cause mortality, disability-free survival, dementia, hemorrhage) |
| STATED_IN (StudyResult, one locator per number) + RESULT_FOR + RESULT_FOR_ARM | a27 DFS HR 1.01 (PRIMARY_PRESPECIFIED, NOT_SIGNIFICANT), a28 death HR 1.14 (SECONDARY_PRESPECIFIED, direction INCREASED, conclusion NOT_REPORTED), a29 major hemorrhage HR 1.38 (SIGNIFICANT, INCREASED), a30 cancer death HR 1.31 (EXPLORATORY, post hoc), a83 cardiovascular disease HR 0.95 (NOT_SIGNIFICANT, DECREASED); structural RESULT_FOR / RESULT_FOR_ARM (aspirin arm, placebo reference). Directions are neutral EstimateDirection values (directive 3.2) |
| HAS_ARM, STATED_IN (arms), HAS_COMPONENT, ADMINISTERS | CTG arms a31–a32, paper arms a33–a38; components aspirin / placebo; a39 ADMINISTERS → D1 IngredientMaterial; a40 MATERIAL_PROVIDED_BY (predicate-only) → Bayer |
| HAS_POPULATION + STATED_IN | a41 ISRCTN eligible (65+ US minorities / 70+, bleeding-risk exclusion), a42 CTG eligible, a43 NEJM randomized 19,114 |
| HAS_STUDY_ROLE (StudyRoleEdgeProperties) | a44 ISRCTN SPONSOR Monash vs a45 CTG LEAD_SPONSOR Hennepin; a46–a51 CTG COLLABORATOR ×6 (NHMRC, Bayer, Monash, Berman Center, NIA, NCI); a52 Bayer FUNDER listing withdrawn by ISRCTN's record correction of 22/08/2018 (SUPERSEDED, valid time UNKNOWN, not projected; qualifier `sourceRecordRemovedAt:2018-08-22`); a53 Bayer FUNDER NEGATIVE ("did not fund", not projected); a54 Bayer MATERIAL_PROVIDER; a55–a57 FUNDER NHMRC / NIA (registry and paper) |
| INVESTIGATES → D2 Condition | a58–a60 CTG conditions, a61 ISRCTN condition |
| REPORTS_ON | a62–a67 (three papers → one Study; asserted by each Publication and by CTG's references module) |
| AUTHORED_BY (predicate-only) | a68–a70 (+ a71 ORCID identifier) |
| RegistrationVersion field facts | one locator per field on the attach Assertions (a07 ISRCTN: versionNumber, versionDate, studyTypeVerbatim, overallStatus, enrollmentCount; a08 CTG: versionDate, studyTypeVerbatim, overallStatus, overallStatusVerbatim, enrollmentCount, resultsSubmissionEvents, resultsPosted); no per-field predicates (adversarial-review stage) |
| literals (05 predicateOnly) | a72 REGISTRY_NOT_MAINTAINED_NOTE, a73 STOPPED_EARLY_REASON, a74 INTERPRETATION_CAVEAT; a03 the NCT number as the ISRCTN record lists it is a kernel HAS_IDENTIFIER by a second asserter |
