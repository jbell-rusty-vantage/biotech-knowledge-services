"""Fixture aspree-registry-history-harm: ISRCTN83772183 history prose (3 reconstructed versions) + observed ISRCTN and CTG
versions + three NEJM 2018 papers (harm on secondary endpoints, futility stop)."""
import hashlib

from fxlib import Fixture, canon


def build(raw):
    fx = Fixture("aspree-registry-history-harm", raw)
    W = fx.snap("s-isrctn-web", "isrctn-web-ISRCTN83772183.md", "https://www.isrctn.com/ISRCTN83772183",
                "ISRCTN83772183: ASPirin in Reducing Events in the Elderly (ISRCTN record page)", "WEB_PAGE", "REGISTRY_RECORD",
                "tool:firecrawl-scrape", "firecrawl scrape --wait-for 4000 (CLI 1.23.1), markdown; curl gets a bot holding page")
    X = fx.snap("s-isrctn-api", "isrctn-api-ISRCTN83772183.xml", "https://www.isrctn.com/api/query/format/default?q=ISRCTN83772183",
                "ISRCTN API full-trial XML for ISRCTN83772183", "API", "REGISTRY_RECORD", "tool:isrctn-api", "curl -> ISRCTN query API (XML)")
    C = fx.snap("s-ctg-nct01038583", "ctg-v2-NCT01038583.json", "https://clinicaltrials.gov/api/v2/studies/NCT01038583",
                "ClinicalTrials.gov API v2 record NCT01038583 (ASPREE)", "API", "REGISTRY_RECORD", "tool:ctgov-v2",
                "curl -> ClinicalTrials.gov API v2 /studies/{nctId}")
    P = fx.snap("s-pubmed-aspree", "pubmed-efetch-aspree.xml",
                "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=30221597,30221596,30221595&retmode=xml",
                "MEDLINE XML of PMIDs 30221597, 30221596, 30221595 (ASPREE, N Engl J Med 2018;379(16))", "API", "BIBLIOGRAPHIC_RECORD",
                "tool:pubmed-eutils", "curl -> NCBI E-utilities efetch db=pubmed retmode=xml", published_at="2018-10-18")
    w, x, c, p = W.ref, X.ref, C.ref, P.ref

    # ------------------------------------------------------------------ entities
    fx.ent("study", "Study", "study", "aspree", "ASPREE (ASPirin in Reducing Events in the Elderly)",
           {"studyKind": "INTERVENTIONAL_RANDOMIZED", "acronym": "ASPREE", "overallStatus": "UNKNOWN", "resultsPosted": False,
            "projectionOfRegistrationVersionUid": "hu:registration-version:fx-ctgov-nct01038583-2021-04-05"})
    fx.ent("org-isrctn", "D7.Organization", "org", "isrctn-registry", "ISRCTN registry (BioMed Central, Springer Nature)")
    fx.ent("org-ctgov", "D7.Organization", "org", "clinicaltrials-gov", "ClinicalTrials.gov (U.S. National Library of Medicine)")
    fx.ent("org-nlm", "D7.Organization", "org", "us-national-library-of-medicine", "U.S. National Library of Medicine (MEDLINE/PubMed)")
    fx.ent("org-monash", "D7.Organization", "org", "monash-university", "Monash University")
    fx.ent("org-hennepin", "D7.Organization", "org", "hennepin-healthcare-research-institute", "Hennepin Healthcare Research Institute")
    fx.ent("org-nhmrc", "D7.Organization", "org", "nhmrc-australia", "National Health and Medical Research Council (Australia)")
    fx.ent("org-bayer", "D7.Organization", "org", "bayer-ag", "Bayer AG",
           note="CTG prints 'Bayer' (class INDUSTRY), ISRCTN prints 'Bayer AG (Australia)'; one Organization by a RESOLUTION Assessment (not in this fixture)")
    fx.ent("org-berman", "D7.Organization", "org", "berman-center", "Berman Center for Outcomes and Clinical Research")
    fx.ent("org-nia", "D7.Organization", "org", "us-nia", "National Institute on Aging (NIA)")
    fx.ent("org-nci", "D7.Organization", "org", "us-nci", "National Cancer Institute (NCI)")
    fx.ent("person-mcneil", "D7.Person", "person", "john-j-mcneil", "John J McNeil", ids=[("ORCID", "ORCID", "0000-0002-1049-5129")])
    fx.ent("agent", "K.Agent", "agent", "d3-curation-agent", "agent:d3-curation-agent (BellLabs D3 extraction / curation run)")
    fx.ent("cond-dementia", "D2.Condition", "condition", "dementia", "Dementia")
    fx.ent("cond-hemorrhage", "D2.Condition", "condition", "hemorrhage", "Hemorrhage (bleeding)")
    fx.ent("cond-physical-disability", "D2.Condition", "condition", "physical-disability", "Physical disability (functional disability)")
    fx.ent("outcome-acm", "D2.Outcome", "outcome", "all-cause-mortality", "All-cause mortality")
    fx.ent("outcome-dfs", "D2.Outcome", "outcome", "disability-free-survival", "Disability-free survival (death, dementia or persistent physical disability)")
    fx.ent("mat-aspirin", "D1.IngredientMaterial", "material", "acetylsalicylic-acid-enteric-coated-100mg",
           "Acetylsalicylic acid (aspirin), 100 mg enteric-coated tablet (study drug)")

    def pub(ref, pmid, doi, pmcid, title):
        fx.ent(ref, "Publication", "publication", f"doi-{doi.lower().replace('/', '-').replace('.', '-')}", title,
               {"publicationKind": "ARTICLE", "publishedAt": "2018-10-18T00:00:00Z", "publishedAtPrecision": "DAY",
                "venueName": "N Engl J Med", "revisionStatus": "NONE_KNOWN", "revisionStatusDerivedAt": "2026-10-08T00:00:00Z"},
               ids=[("PMID", "NLM", pmid), ("DOI", "Crossref", doi), ("PMCID", "NLM", pmcid)])

    pub("pub-cvd", "30221597", "10.1056/NEJMoa1805819", "PMC6289056", "Effect of Aspirin on Cardiovascular Events and Bleeding in the Healthy Elderly")
    pub("pub-dfs", "30221596", "10.1056/NEJMoa1800722", "PMC6426126", "Effect of Aspirin on Disability-free Survival in the Healthy Elderly")
    pub("pub-acm", "30221595", "10.1056/NEJMoa1803955", "PMC6433466", "Effect of Aspirin on All-Cause Mortality in the Healthy Elderly")

    # registration versions (payloadHash over the payload this fixture knows for each version)
    # the eight registration-time primary outcomes as printed (adversarial-review stage: all eight are OutcomeDefinitions)
    REG_PRIMARIES = ["Coronary artery disease death", "Cardiac failure death (with coronary cause), and other coronary death",
                     "Cardiac failure death - due to heart failure", "Other vascular death", "Non-coronary cardiac death",
                     "Cerebrovascular disease death", "Non-fatal cardiovascular events", "Non-fatal cerebrovascular events"]

    def rv(ref, slug, registry, regid, mode, vdate, payload, **props):
        ph = "sha256:" + hashlib.sha256(canon(payload).encode()).hexdigest()
        d = {"registry": registry, "registrationId": regid, "versionDate": f"{vdate}T00:00:00Z", "versionDatePrecision": "DAY",
             "populatingMode": mode, "payloadHash": ph}
        d.update(props)
        fx.ent(ref, "RegistrationVersion", "registration-version", slug, f"{regid} {mode.lower()} version {vdate}", d)

    rv("rv-reg", "isrctn83772183-2005-07-14-reconstructed", "ISRCTN", "ISRCTN83772183", "RECONSTRUCTED", "2005-07-14",
       {"primaryOutcomes": REG_PRIMARIES, "statedIn": "Provided at time of registration"})
    rv("rv-2008", "isrctn83772183-2008-03-14-reconstructed", "ISRCTN", "ISRCTN83772183", "RECONSTRUCTED", "2008-03-14",
       {"primaryOutcomes": ["Death from any cause", "Death from incident dementia ...", "Death from persistent physical disability ..."],
        "statedIn": "Updated as of 14/03/2008"})
    rv("rv-2009", "isrctn83772183-2009-03-02-reconstructed", "ISRCTN", "ISRCTN83772183", "RECONSTRUCTED", "2009-03-02",
       {"primaryOutcomes": ["Death from any cause", "Incident dementia ...", "Persistent physical disability ..."], "statedIn": "Amended 02/03/2009"})
    rv("rv-isrctn-obs", "isrctn83772183-v138", "ISRCTN", "ISRCTN83772183", "OBSERVED", "2026-07-20", {"snapshot": W.digest, "xml": X.digest},
       versionNumber=138, overallStatus="COMPLETED", overallStatusVerbatim="Completed", studyTypeVerbatim="Randomized controlled trial",
       enrollmentCount=19114, enrollmentCountType="ACTUAL",
       sponsorNameVerbatim="Monash University (Australia)",
       funderNamesVerbatim=["National Health and Medical Research Council (ref: 334047)", "National Institute on Aging", "National Cancer Institute",
                            "Monash University", "Victorian Cancer Agency"],
       conditionsVerbatim=["Mental and physical disability in the elderly"],
       interventionNamesVerbatim=["Acetylsalicylic acid 100 mg: enteric coated unscored white tablet"])
    rv("rv-ctg", "ctgov-nct01038583-2021-04-05", "CTGOV", "NCT01038583", "OBSERVED", "2021-04-05", {"snapshot": C.digest},
       overallStatus="UNKNOWN", overallStatusVerbatim="UNKNOWN (lastKnownStatus ACTIVE_NOT_RECRUITING)", studyTypeVerbatim="OBSERVATIONAL", enrollmentCount=19114,
       enrollmentCountType="ACTUAL", firstSubmittedDate="2009-12-21T00:00:00Z", resultsPosted=False,
       resultsSubmissionEvents=["RELEASE:2021-12-08", "UNRELEASE:2021-12-15", "RELEASE:2022-01-14", "RESET:2022-02-09",
                                "RELEASE:2022-12-09", "RESET:2023-01-03", "RELEASE:2025-10-31", "RESET:2025-11-14"],
       sponsorNameVerbatim="Hennepin Healthcare Research Institute",
       collaboratorNamesVerbatim=["National Health and Medical Research Council, Australia", "Bayer", "Monash University",
                                  "Berman Center for Outcomes and Clinical Research", "National Institute on Aging (NIA)", "National Cancer Institute (NCI)"],
       conditionsVerbatim=["Functional Disability", "Dementia", "Heart Disease", "Stroke", "Cancer", "Bleeding", "Depression"],
       interventionNamesVerbatim=["100 mg enteric-coated aspirin", "Placebo"])

    def od(ref, slug, name, key, prio, mk, tp=None):
        fx.ent(ref, "OutcomeDefinition", "outcome-definition", slug, name,
               {"outcomeKey": key, "priority": prio, "measureKind": mk, "timepoint": tp})

    od("od-cad", "aspree-cad-death-primary", "Coronary artery disease death", "coronary-artery-disease-death", "PRIMARY", "CLINICAL_EVENT")
    od("od-acm-p", "aspree-death-any-cause-primary", "Death from any cause", "death-from-any-cause", "PRIMARY", "SURVIVAL")
    od("od-death-dem", "aspree-death-incident-dementia-primary", "Death from incident dementia (DSM-IV)", "death-from-incident-dementia", "PRIMARY", "CLINICAL_EVENT")
    od("od-death-dis", "aspree-death-persistent-disability-primary", "Death from persistent physical disability (Katz ADL, 2 intervals)",
       "death-from-persistent-physical-disability", "PRIMARY", "CLINICAL_EVENT")
    od("od-dem", "aspree-incident-dementia-primary", "Incident dementia (DSM-IV)", "incident-dementia", "PRIMARY", "CLINICAL_EVENT")
    od("od-dis", "aspree-persistent-physical-disability-primary", "Persistent physical disability (Katz ADL)", "persistent-physical-disability",
       "PRIMARY", "CLINICAL_EVENT")
    od("od-dfs", "aspree-composite-dfs-primary", "Composite of death, dementia or persistent physical disability",
       "composite-death-dementia-persistent-physical-disability", "PRIMARY", "SURVIVAL", "median 4.7 years")
    od("od-acm-s", "aspree-death-any-cause-secondary", "Death from any cause", "death-from-any-cause", "SECONDARY", "SURVIVAL", "median 4.7 years")
    od("od-hem", "aspree-major-hemorrhage-secondary", "Major hemorrhage", "major-hemorrhage", "SECONDARY", "CLINICAL_EVENT", "median 4.7 years")
    od("od-cancer", "aspree-cancer-death-post-hoc", "Cancer-related death (cause-specific)", "cancer-related-death", "POST_HOC", "CLINICAL_EVENT", "median 4.7 years")
    # adversarial-review stage: the seven further registration-time primaries and the paper's cardiovascular secondary
    REG_OD = [("od-reg2", "cardiac-failure-death-coronary-and-other-coronary-death", REG_PRIMARIES[1]),
              ("od-reg3", "cardiac-failure-death-heart-failure-non-coronary", REG_PRIMARIES[2]),
              ("od-reg4", "other-vascular-death", REG_PRIMARIES[3]),
              ("od-reg5", "non-coronary-cardiac-death", REG_PRIMARIES[4]),
              ("od-reg6", "cerebrovascular-disease-death", REG_PRIMARIES[5]),
              ("od-reg7", "non-fatal-cardiovascular-events", REG_PRIMARIES[6]),
              ("od-reg8", "non-fatal-cerebrovascular-events", REG_PRIMARIES[7])]
    for ref, key, title in REG_OD:
        od(ref, f"aspree-{key}-primary", title, key, "PRIMARY", "CLINICAL_EVENT")
    od("od-cvd-s", "aspree-cardiovascular-disease-composite-secondary",
       "Cardiovascular disease (fatal coronary heart disease, nonfatal myocardial infarction, fatal or nonfatal stroke, or hospitalization for heart failure)",
       "cardiovascular-disease-composite", "SECONDARY", "CLINICAL_EVENT", "median 4.7 years")

    fx.ent("arm-ctg-asp", "StudyArm", "study-arm", "aspree-ctg-aspirin", "Aspirin",
           {"armKey": "aspirin-100mg-ec", "description": "100 mg enteric-coated aspirin", "armType": None, "payloadHash": "sha256:" + hashlib.sha256(b"ctg|Aspirin|100 mg enteric-coated aspirin").hexdigest()},
           note="CTG armGroups carry no type for this record (registered as OBSERVATIONAL)")
    fx.ent("arm-ctg-pbo", "StudyArm", "study-arm", "aspree-ctg-placebo", "Placebo",
           {"armKey": "placebo", "description": "Placebo", "payloadHash": "sha256:" + hashlib.sha256(b"ctg|Placebo|Placebo").hexdigest()})
    fx.ent("arm-pap-asp", "StudyArm", "study-arm", "aspree-nejm-aspirin", "Aspirin group (9525 randomized)",
           {"armKey": "aspirin-100mg-ec", "armType": "EXPERIMENTAL", "payloadHash": "sha256:" + hashlib.sha256(b"nejm|aspirin|9525").hexdigest()})
    fx.ent("arm-pap-pbo", "StudyArm", "study-arm", "aspree-nejm-placebo", "Placebo group (9589 randomized)",
           {"armKey": "placebo", "armType": "PLACEBO_COMPARATOR", "payloadHash": "sha256:" + hashlib.sha256(b"nejm|placebo|9589").hexdigest()})
    fx.ent("comp-asp", "InterventionComponent", "intervention-component", "aspree-ctg-aspirin-100mg", "100 mg enteric-coated aspirin, taken daily",
           {"componentRole": "ACTIVE", "materialTextVerbatim": "100 mg enteric-coated aspirin", "interventionTypeVerbatim": "DRUG", "quantity": 100.0,
            "unitCode": "mg", "quantityBasis": "PER_DAY", "massBasis": "UNSPECIFIED", "route": "ORAL", "dosageForm": "enteric-coated tablet",
            "scheduleText": "taken daily", "verbatimDoseText": "100 mg enteric-coated aspirin, taken daily", "supplierNameVerbatim": "Bayer",
            "payloadHash": "sha256:" + hashlib.sha256(b"ctg|100 mg enteric-coated aspirin, taken daily").hexdigest()})
    fx.ent("comp-pbo", "InterventionComponent", "intervention-component", "aspree-ctg-placebo", "100 mg enteric-coated placebo",
           {"componentRole": "PLACEBO", "materialTextVerbatim": "100 mg enteric-coated placebo", "interventionTypeVerbatim": "DRUG", "route": "ORAL",
            "verbatimDoseText": "100 mg enteric-coated placebo", "payloadHash": "sha256:" + hashlib.sha256(b"ctg|100 mg enteric-coated placebo").hexdigest()})
    fx.ent("pop-isrctn", "StudyPopulation", "study-population", "aspree-isrctn-eligible", "ISRCTN eligible population (current criteria as of 13/01/2017)",
           {"populationKind": "ELIGIBLE", "sexScope": "ALL", "minAgeYears": 65.0, "healthyVolunteers": True, "ncbiTaxonId": "9606",
            "ageText": "African American and Hispanic men and women 65 years of age and over (in the USA), all other men and women 70 years of age and over",
            "eligibilityCriteriaText": "excludes: A current or recurrent condition with a high risk of major bleeding, e.g. cerebral aneurysm ...",
            "payloadHash": "sha256:" + hashlib.sha256(b"isrctn|eligible|v138").hexdigest()})
    fx.ent("pop-ctg", "StudyPopulation", "study-population", "aspree-ctg-eligible", "CTG eligible population",
           {"populationKind": "ELIGIBLE", "sexScope": "ALL", "minAgeYears": 65.0, "healthyVolunteers": True, "ncbiTaxonId": "9606",
            "ageText": "65 Years (minimumAge)", "payloadHash": "sha256:" + hashlib.sha256(b"ctg|eligible|2021-04-05").hexdigest()})
    fx.ent("pop-pap", "StudyPopulation", "study-population", "aspree-nejm-randomized", "Randomized population (NEJM 2018)",
           {"populationKind": "RANDOMIZED", "size": 19114, "sexScope": "ALL", "ncbiTaxonId": "9606",
            "payloadHash": "sha256:" + hashlib.sha256(b"nejm|randomized|19114").hexdigest()})

    def sr(ref, slug, name, **props):
        fx.ent(ref, "StudyResult", "study-result", slug, name, props)

    sr("sr-dfs", "aspree-nejm-dfs-hr", "Disability-free survival composite, aspirin vs placebo (HR)", resultKind="HAZARD_RATIO",
       analysisKind="PRIMARY_PRESPECIFIED", comparisonKind="BETWEEN_ARM", statisticalConclusion="NOT_SIGNIFICANT", direction="INCREASED",
       estimate=1.01, estimateQualifier="AS_REPORTED", dispersionKind="CONFIDENCE_INTERVAL", intervalLower=0.92, intervalUpper=1.11, ciLevel=0.95,
       pValue=0.79, pValueText="0.79", comparatorArmKey="placebo", timepointText="median 4.7 years")
    sr("sr-acm", "aspree-nejm-acm-hr", "Death from any cause, aspirin vs placebo (HR)", resultKind="HAZARD_RATIO", analysisKind="SECONDARY_PRESPECIFIED",
       comparisonKind="BETWEEN_ARM", statisticalConclusion="NOT_REPORTED", direction="INCREASED", sampleSize=19114, estimate=1.14,
       estimateQualifier="AS_REPORTED", dispersionKind="CONFIDENCE_INTERVAL", intervalLower=1.01, intervalUpper=1.29, ciLevel=0.95,
       comparatorArmKey="placebo", timepointText="median 4.7 years")
    sr("sr-hem", "aspree-nejm-major-hemorrhage-hr", "Major hemorrhage, aspirin vs placebo (HR)", resultKind="HAZARD_RATIO",
       analysisKind="SECONDARY_PRESPECIFIED", comparisonKind="BETWEEN_ARM", statisticalConclusion="SIGNIFICANT", direction="INCREASED",
       estimate=1.38, estimateQualifier="AS_REPORTED", dispersionKind="CONFIDENCE_INTERVAL", intervalLower=1.18, intervalUpper=1.62, ciLevel=0.95,
       pValueText="<0.001", comparatorArmKey="placebo", timepointText="median 4.7 years")
    sr("sr-cancer", "aspree-nejm-cancer-death-hr", "Cancer-related death, aspirin vs placebo (HR, post hoc)", resultKind="HAZARD_RATIO",
       analysisKind="EXPLORATORY", comparisonKind="BETWEEN_ARM", statisticalConclusion="NOT_REPORTED", direction="INCREASED", estimate=1.31,
       estimateQualifier="AS_REPORTED", dispersionKind="CONFIDENCE_INTERVAL", intervalLower=1.10, intervalUpper=1.56, ciLevel=0.95,
       comparatorArmKey="placebo", timepointText="median 4.7 years")
    sr("sr-cvd", "aspree-nejm-cvd-hr", "Cardiovascular disease, aspirin vs placebo (HR)", resultKind="HAZARD_RATIO",
       analysisKind="SECONDARY_PRESPECIFIED", comparisonKind="BETWEEN_ARM", statisticalConclusion="NOT_SIGNIFICANT", direction="DECREASED",
       estimate=0.95, estimateQualifier="AS_REPORTED", dispersionKind="CONFIDENCE_INTERVAL", intervalLower=0.83, intervalUpper=1.08, ciLevel=0.95,
       comparatorArmKey="placebo", timepointText="median 4.7 years")

    # ------------------------------------------------------------------ locators
    PO = "| Primary outcome measure(s) |"
    L = {}
    L["regdate"] = fx.tq(w, "Registration date14/07/2005")
    L["lastedit"] = fx.tq(w, "Last edited20/07/2026")
    L["h09"] = fx.tq(w, "Amended 02/03/2009:", after=PO, occurrence=0)
    L["acm09"] = fx.tq(w, "Death from any cause", after="Amended 02/03/2009:", occurrence=0)
    L["dem09"] = fx.tq(w, "Incident dementia, defined according to the Diagnostic and Statistical Manual for Mental Disorders 4th edition (DSM-IV) criteria")
    L["dis09"] = fx.tq(w, "Persistent physical disability, defined as the onset of a lot of difficulty to inability to perform any one of 6 Katz Activities of Daily Living")
    L["h08"] = fx.tq(w, "Updated as of 14/03/2008:", after=PO, occurrence=0)
    L["acm08"] = fx.tq(w, "Death from any cause", after="Updated as of 14/03/2008:", occurrence=0)
    L["dem08"] = fx.tq(w, "Death from incident dementia, defined according to the Diagnostic and Statistical Manual for Mental Disorders 4th edition (DSM-IV) criteria")
    L["dis08"] = fx.tq(w, "Death from persistent physical disability, defined as progression by at least 2 intervals on a 5-point scale of any one of the 6 Katz Activities of Daily Living")
    L["hreg"] = fx.tq(w, "Provided at time of registration:", after=PO, occurrence=0)
    L["cad"] = fx.tq(w, "Coronary artery disease death", after=PO, occurrence=0)
    L["sponsor"] = fx.tq(w, "Monash University (Australia)", within="| Sponsor | Monash University (Australia) |")
    L["f-nhmrc"] = fx.tq(w, "National Health and Medical Research Council (ref: 334047)")
    L["f-nia"] = fx.tq(w, "National Institute on Aging", within="| Funders | National Health and Medical Research Council (ref: 334047), National Institute on Aging")
    L["bayer-removed"] = fx.tq(w, "22/08/2018: Bayer AG (Australia) was removed as a funder.")
    L["bayer-drug"] = fx.tq(w, "Bayer provided the study drug")
    L["bayer-nofund"] = fx.tq(w, "but did not fund the trial.")
    L["added-funders"] = fx.tq(w, "The National Institute on Aging, the National Cancer Institute, Monash University and the Victorian Cancer Agency have been added as funders.")
    L["interv"] = fx.tq(w, "Acetylsalicylic acid 100 mg: enteric coated unscored white tablet")
    L["cond"] = fx.tq(w, "Mental and physical disability in the elderly")
    L["status"] = fx.tq(w, "Overall study statusCompleted")
    L["design"] = fx.tq(w, "Randomized controlled trial", within="| Study design | Randomized controlled trial |")
    L["incl"] = fx.tq(w, "African American and Hispanic men and women 65 years of age and over (in the USA), all other men and women 70 years of age and over")
    L["excl-bleed"] = fx.tq(w, "A current or recurrent condition with a high risk of major bleeding, e.g. cerebral aneurysm")
    L["healthy"] = fx.tq(w, "Healthy volunteer", within="| Participant type(s) | Healthy volunteer |")
    L["enrol"] = fx.num(w, "| Total final enrolment | 19114 |", "19114", "enrollmentCount")
    L["frozen"] = fx.tq(w, "has confirmed that the ISRCTN record for ASPREE will not be further updated by the investigators")
    L["nct-on-isrctn"] = fx.tq(w, "NCT01038583", within="| ClinicalTrials.gov (NCT) | NCT01038583 |")
    L["xml-version"] = fx.tq(x, 'version="138"')
    L["xml-updated"] = fx.tq(x, 'lastUpdated="2026-07-20T12:57:16.538811799Z"')
    L["xml-isrctn"] = fx.tq(x, '<isrctn dateAssigned="2005-07-14T00:00:00.000Z">83772183</isrctn>')

    J = "/protocolSection/"
    L["c-lead"] = fx.jp(c, J + "sponsorCollaboratorsModule/leadSponsor")
    for i in range(6):
        L[f"c-collab{i}"] = fx.jp(c, J + f"sponsorCollaboratorsModule/collaborators/{i}")
    L["c-cond0"] = fx.jp(c, J + "conditionsModule/conditions/0")
    L["c-cond1"] = fx.jp(c, J + "conditionsModule/conditions/1")
    L["c-cond5"] = fx.jp(c, J + "conditionsModule/conditions/5")
    L["c-primary"] = fx.jp(c, J + "outcomesModule/primaryOutcomes/0/measure")
    L["c-studytype"] = fx.jp(c, J + "designModule/studyType")
    L["c-status"] = fx.jp(c, J + "statusModule/overallStatus")
    L["c-lastknown"] = fx.jp(c, J + "statusModule/lastKnownStatus")
    L["c-lastupdate"] = fx.jp(c, J + "statusModule/lastUpdatePostDateStruct")
    L["c-enroll"] = fx.jp(c, J + "designModule/enrollmentInfo", field="enrollmentCount")
    L["c-subm"] = fx.jp(c, "/derivedSection/miscInfoModule/submissionTracking/submissionInfos")
    L["c-hasresults"] = fx.jp(c, "/hasResults")
    L["c-nct"] = fx.jp(c, J + "identificationModule/nctId")
    L["c-arm0"] = fx.jp(c, J + "armsInterventionsModule/armGroups/0")
    L["c-arm1"] = fx.jp(c, J + "armsInterventionsModule/armGroups/1")
    L["c-int0"] = fx.jp(c, J + "armsInterventionsModule/interventions/0/description")
    L["c-int1"] = fx.jp(c, J + "armsInterventionsModule/interventions/1/description")
    L["c-minage"] = fx.jp(c, J + "eligibilityModule/minimumAge")
    L["c-sex"] = fx.jp(c, J + "eligibilityModule/sex")
    for i, k in ((57, "ref-cvd"), (58, "ref-dfs"), (59, "ref-acm")):
        L[k] = fx.jp(c, J + f"referencesModule/references/{i}/pmid")

    X_ = "xml"
    # NEJM abstracts (normalized XML text content). File order of the three articles: 30221597, 30221596, 30221595.
    reg_no = "ASPREE ClinicalTrials.gov number, NCT01038583"
    assert P.xml()[0].count(reg_no) == 3
    L["nct-cvd"] = fx.tq(p, reg_no, basis=X_, occurrence=0)
    L["nct-dfs"] = fx.tq(p, reg_no, basis=X_, occurrence=1)
    L["nct-acm"] = fx.tq(p, reg_no, basis=X_, occurrence=2)
    fund = "Funded by the National Institute on Aging and others"
    L["fund-dfs"] = fx.tq(p, fund, basis=X_, occurrence=1)
    rand = "9525 were assigned to receive aspirin and 9589 to receive placebo"
    L["rand-cvd"] = fx.tq(p, rand, basis=X_, occurrence=0)
    L["rand-acm"] = fx.tq(p, rand, basis=X_, occurrence=1)
    L["rand-dfs"] = fx.tq(p, "9525 were randomly assigned to receive aspirin and 9589 to receive placebo", basis=X_)
    L["n-dfs"] = fx.num(p, "A total of 19,114 persons with a median age of 74 years were enrolled", "19,114", "size", basis=X_)
    L["dfs-primary-def"] = fx.tq(p, "The primary end point was a composite of death, dementia, or persistent physical disability.", basis=X_)
    L["dfs-stop"] = fx.tq(p, "The trial was terminated at a median of 4.7 years of follow-up after a determination was made that there would be no benefit with continued aspirin use with regard to the primary end point.", basis=X_)
    dfs_s = "(hazard ratio, 1.01; 95% confidence interval [CI], 0.92 to 1.11; P=0.79)"
    L["dfs-est"] = fx.num(p, dfs_s, "1.01", "estimate", basis=X_)
    L["dfs-lo"] = fx.num(p, dfs_s, "0.92", "intervalLower", basis=X_)
    L["dfs-hi"] = fx.num(p, dfs_s, "1.11", "intervalUpper", basis=X_)
    L["dfs-p"] = fx.num(p, dfs_s, "0.79", "pValue", basis=X_)
    L["dfs-concl"] = fx.tq(p, "Aspirin use in healthy elderly persons did not prolong disability-free survival over a period of 5 years", basis=X_, field="statisticalConclusion")
    L["acm-secondary"] = fx.tq(p, "A numerically higher rate of the secondary end point of death from any cause was observed with aspirin than with placebo.", basis=X_, field="analysisKind")
    acm_s = "The risk of death from any cause was 12.7 events per 1000 person-years in the aspirin group and 11.1 events per 1000 person-years in the placebo group (hazard ratio, 1.14; 95% confidence interval [CI], 1.01 to 1.29)."
    L["acm-est"] = fx.num(p, acm_s, "1.14", "estimate", basis=X_)
    L["acm-lo"] = fx.num(p, acm_s, "1.01", "intervalLower", basis=X_)
    L["acm-hi"] = fx.num(p, acm_s, "1.29", "intervalUpper", basis=X_)
    L["acm-n"] = fx.num(p, "Of the 19,114 persons who were enrolled, 9525 were assigned", "19,114", "sampleSize", basis=X_)
    L["acm-caution"] = fx.tq(p, "this result was unexpected and should be interpreted with caution", basis=X_)
    L["hem-def"] = fx.tq(p, "Secondary end points included major hemorrhage and cardiovascular disease", basis=X_)
    hem_s = "The rate of major hemorrhage was 8.6 events per 1000 person-years and 6.2 events per 1000 person-years, respectively (hazard ratio, 1.38; 95% CI, 1.18 to 1.62; P<0.001)."
    L["hem-est"] = fx.num(p, hem_s, "1.38", "estimate", basis=X_)
    L["hem-lo"] = fx.num(p, hem_s, "1.18", "intervalLower", basis=X_)
    L["hem-hi"] = fx.num(p, hem_s, "1.62", "intervalUpper", basis=X_)
    L["hem-p"] = fx.num(p, hem_s, "<0.001", "pValueText", basis=X_)
    L["hem-concl"] = fx.tq(p, "resulted in a significantly higher risk of major hemorrhage", basis=X_, field="statisticalConclusion")
    L["posthoc"] = fx.tq(p, "post hoc exploratory analyses of specific causes of death were performed", basis=X_, field="analysisKind")
    can_s = "Cancer-related death occurred in 3.1% of the participants in the aspirin group and in 2.3% of those in the placebo group (hazard ratio, 1.31; 95% CI, 1.10 to 1.56)."
    L["can-est"] = fx.num(p, can_s, "1.31", "estimate", basis=X_)
    L["can-lo"] = fx.num(p, can_s, "1.10", "intervalLower", basis=X_)
    L["can-hi"] = fx.num(p, can_s, "1.56", "intervalUpper", basis=X_)
    # authorship (raw XML element of each article's first author)
    mc = "<LastName>McNeil</LastName><ForeName>John J</ForeName>"
    arts = [P.raw.find(f'<PMID Version="1">{pm}</PMID><DateCompleted>') for pm in ("30221597", "30221596", "30221595")]
    assert all(a > 0 for a in arts) and arts == sorted(arts)
    for k, pm in (("au-cvd", "30221597"), ("au-dfs", "30221596"), ("au-acm", "30221595")):
        L[k] = fx.tq(p, mc, after=f'<PMID Version="1">{pm}</PMID><DateCompleted>', occurrence=0)
    L["orcid"] = fx.tq(p, '<Identifier Source="ORCID">0000-0002-1049-5129</Identifier>', occurrence=0)
    # adversarial-review stage (2026-10-08): the seven further registration-time primaries, the paper's cardiovascular
    # secondary and its result
    for ref, _, title in REG_OD:
        L[ref] = fx.tq(w, title, after="Provided at time of registration:<br>1", occurrence=0)
    L["cvd-def"] = fx.tq(p, "cardiovascular disease (defined as fatal coronary heart disease, nonfatal myocardial infarction, fatal or nonfatal stroke, or hospitalization for heart failure)", basis=X_)
    cvd_s = "the rate of cardiovascular disease was 10.7 events per 1000 person-years in the aspirin group and 11.3 events per 1000 person-years in the placebo group (hazard ratio, 0.95; 95% confidence interval [CI], 0.83 to 1.08)"
    L["cvd-est"] = fx.num(p, cvd_s, "0.95", "estimate", basis=X_)
    L["cvd-lo"] = fx.num(p, cvd_s, "0.83", "intervalLower", basis=X_)
    L["cvd-hi"] = fx.num(p, cvd_s, "1.08", "intervalUpper", basis=X_)
    L["cvd-concl"] = fx.tq(p, "did not result in a significantly lower risk of cardiovascular disease than placebo", basis=X_, field="statisticalConclusion")
    # RegistrationVersion field facts: one locator per field on the HAS_REGISTRATION_VERSION attach Assertion (no per-field predicates)
    for k, fld in (("design", "studyTypeVerbatim"), ("status", "overallStatus"), ("c-studytype", "studyTypeVerbatim"), ("c-status", "overallStatus"),
                   ("c-lastknown", "overallStatusVerbatim"), ("c-subm", "resultsSubmissionEvents"), ("c-hasresults", "resultsPosted"),
                   ("c-lastupdate", "versionDate"), ("xml-updated", "versionDate"), ("xml-version", "versionNumber")):
        fx.locs[L[k]]["reportsField"] = fld

    # ------------------------------------------------------------------ assertions
    D = lambda d: {"validFrom": f"{d}T00:00:00Z", "validFromPrecision": "DAY", "validFromBasis": "STATED_BY_SOURCE"}
    fx.ident("study", "ISRCTN", "ISRCTN registry", "ISRCTN83772183", "org-isrctn", [L["xml-isrctn"]])
    fx.ident("study", "NCT", "NLM ClinicalTrials.gov", "NCT01038583", "org-ctgov", [L["c-nct"]])
    fx.ident("study", "NCT", "NLM ClinicalTrials.gov", "NCT01038583", "org-isrctn", [L["nct-on-isrctn"]])
    fx.asserts[-1]["note"] = ("ISRCTN record lists the NCT number: the two registrations are two Identifiers on one Study (identity rule); "
                              "a second asserter of the same kernel HAS_IDENTIFIER fact, not a D3 predicate (adversarial-review stage)")
    # registry history: reconstructed versions (valid time = the registry's stated date; recorded = capture date)
    fx.state("study", "rv-reg", "org-isrctn", [L["hreg"], L["regdate"], L["cad"]] + [L[r] for r, _, _ in REG_OD],
             valid={**D("2005-07-14"), "validTo": "2008-03-14T00:00:00Z", "validToPrecision": "DAY", "validToBasis": "STATED_BY_SOURCE"},
             basis="UNSTATED", note="RECONSTRUCTED from 'Provided at time of registration' + Registration date 14/07/2005 printed in the 2026 snapshot")
    fx.state("study", "rv-2008", "org-isrctn", [L["h08"]],
             valid={**D("2008-03-14"), "validTo": "2009-03-02T00:00:00Z", "validToPrecision": "DAY", "validToBasis": "STATED_BY_SOURCE"},
             note="RECONSTRUCTED from 'Updated as of 14/03/2008:'")
    fx.state("study", "rv-2009", "org-isrctn", [L["h09"]],
             valid={**D("2009-03-02"), "validTo": "2026-07-20T00:00:00Z", "validToPrecision": "DAY", "validToBasis": "INFERRED"},
             note="RECONSTRUCTED from 'Amended 02/03/2009:'; closed by the observed version (intermediate versions 2009-2026 are not recoverable; ISRCTN XML says version 138)")
    fx.state("study", "rv-isrctn-obs", "org-isrctn", [L["xml-version"], L["xml-updated"], L["lastedit"], L["design"], L["status"], L["enrol"]],
             valid={**D("2026-07-20")}, note="OBSERVED: BellLabs capture 2026-10-08 of ISRCTN version 138; one locator per field (versionNumber, versionDate, studyTypeVerbatim, overallStatus, enrollmentCount)")
    fx.state("study", "rv-ctg", "org-ctgov", [L["c-lastupdate"], L["c-studytype"], L["c-status"], L["c-lastknown"], L["c-enroll"], L["c-subm"], L["c-hasresults"]],
             valid={**D("2021-04-05")},
             note="OBSERVED: CTG v2 serves the current version only (versionHolder = capture date); valid from lastUpdatePostDate; one locator per field (versionDate, studyTypeVerbatim, overallStatus, overallStatusVerbatim, enrollmentCount, resultsSubmissionEvents, resultsPosted)")
    # outcome declarations per version and per paper (STATED_IN) + HAS_OUTCOME
    for o in ("od-cad", "od-acm-p", "od-death-dem", "od-death-dis", "od-dem", "od-dis", "od-dfs", "od-acm-s", "od-hem", "od-cancer"):
        fx.struct("HAS_OUTCOME", "study", o)
    fx.edge("STATED_IN", "od-cad", "rv-reg", "org-isrctn", [L["hreg"], L["cad"]])
    fx.edge("STATED_IN", "od-acm-p", "rv-2008", "org-isrctn", [L["h08"], L["acm08"]])
    fx.edge("STATED_IN", "od-death-dem", "rv-2008", "org-isrctn", [L["h08"], L["dem08"]])
    fx.edge("STATED_IN", "od-death-dis", "rv-2008", "org-isrctn", [L["h08"], L["dis08"]])
    fx.edge("STATED_IN", "od-acm-p", "rv-2009", "org-isrctn", [L["h09"], L["acm09"]])
    fx.edge("STATED_IN", "od-dem", "rv-2009", "org-isrctn", [L["h09"], L["dem09"]])
    fx.edge("STATED_IN", "od-dis", "rv-2009", "org-isrctn", [L["h09"], L["dis09"]])
    fx.edge("STATED_IN", "od-dem", "rv-isrctn-obs", "org-isrctn", [L["h09"], L["dem09"]], note="the 2009 text is still the current field text in version 138")
    fx.edge("STATED_IN", "od-dfs", "rv-ctg", "org-ctgov", [L["c-primary"]])
    fx.edge("STATED_IN", "od-dfs", "pub-dfs", "pub-dfs", [L["dfs-primary-def"]])
    fx.edge("STATED_IN", "od-acm-s", "pub-acm", "pub-acm", [L["acm-secondary"]])
    fx.edge("STATED_IN", "od-hem", "pub-cvd", "pub-cvd", [L["hem-def"]])
    fx.edge("STATED_IN", "od-cancer", "pub-acm", "pub-acm", [L["posthoc"]])
    # MEASURES (curated resolution of the measure; asserter = curation agent)
    fx.edge("MEASURES", "od-acm-p", "outcome-acm", "agent", [L["acm09"]])
    fx.edge("MEASURES", "od-acm-s", "outcome-acm", "agent", [L["acm-secondary"]])
    fx.edge("MEASURES", "od-dfs", "outcome-dfs", "agent", [L["dfs-primary-def"]])
    fx.edge("MEASURES", "od-dem", "cond-dementia", "agent", [L["dem09"]])
    fx.edge("MEASURES", "od-hem", "cond-hemorrhage", "agent", [L["hem-def"]])
    # results (STATED_IN with one locator per number) + RESULT_FOR + RESULT_FOR_ARM
    fx.edge("STATED_IN", "sr-dfs", "pub-dfs", "pub-dfs", [L["dfs-est"], L["dfs-lo"], L["dfs-hi"], L["dfs-p"], L["dfs-concl"]])
    fx.edge("STATED_IN", "sr-acm", "pub-acm", "pub-acm", [L["acm-est"], L["acm-lo"], L["acm-hi"], L["acm-n"], L["acm-secondary"]],
            note="statisticalConclusion NOT_REPORTED: the abstract gives the CI but no P value or significance statement for this secondary end point and the field is never recomputed; authors: 'unexpected and should be interpreted with caution'")
    fx.edge("STATED_IN", "sr-hem", "pub-cvd", "pub-cvd", [L["hem-est"], L["hem-lo"], L["hem-hi"], L["hem-p"], L["hem-concl"]])
    fx.edge("STATED_IN", "sr-cancer", "pub-acm", "pub-acm", [L["can-est"], L["can-lo"], L["can-hi"], L["posthoc"]])
    for r_, o_ in (("sr-dfs", "od-dfs"), ("sr-acm", "od-acm-s"), ("sr-hem", "od-hem"), ("sr-cancer", "od-cancer")):
        fx.struct("RESULT_FOR", r_, o_)
        fx.struct("RESULT_FOR_ARM", r_, "arm-pap-asp", 0)
        fx.struct("RESULT_FOR_ARM", r_, "arm-pap-pbo", 1, note="reference arm (comparatorArmKey placebo)")
    # arms, components, administered material
    for a_ in ("arm-ctg-asp", "arm-ctg-pbo", "arm-pap-asp", "arm-pap-pbo"):
        fx.struct("HAS_ARM", "study", a_)
    fx.edge("STATED_IN", "arm-ctg-asp", "rv-ctg", "org-ctgov", [L["c-arm0"]])
    fx.edge("STATED_IN", "arm-ctg-pbo", "rv-ctg", "org-ctgov", [L["c-arm1"]])
    for arm, ev in (("arm-pap-asp", ("rand-cvd", "rand-dfs", "rand-acm")), ("arm-pap-pbo", ("rand-cvd", "rand-dfs", "rand-acm"))):
        for k, pubref in zip(ev, ("pub-cvd", "pub-dfs", "pub-acm")):
            fx.edge("STATED_IN", arm, pubref, pubref, [L[k]])
    fx.struct("HAS_COMPONENT", "arm-ctg-asp", "comp-asp", 0)
    fx.struct("HAS_COMPONENT", "arm-ctg-pbo", "comp-pbo", 0)
    fx.edge("ADMINISTERS", "comp-asp", "mat-aspirin", "org-ctgov", [L["c-int0"]],
            note="object resolution (CTG text -> D1 IngredientMaterial) licensed by entity-link; ISRCTN states the same tablet")
    fx.pred("MATERIAL_PROVIDED_BY", "comp-asp", "org-bayer", "org-isrctn", [L["bayer-drug"]],
            note="05 predicateOnly: which component a supplier provided; the study-level role is HAS_STUDY_ROLE {MATERIAL_PROVIDER}")
    # populations
    for pp in ("pop-isrctn", "pop-ctg", "pop-pap"):
        fx.struct("HAS_POPULATION", "study", pp)
    fx.edge("STATED_IN", "pop-isrctn", "rv-isrctn-obs", "org-isrctn", [L["incl"], L["excl-bleed"], L["healthy"]])
    fx.edge("STATED_IN", "pop-ctg", "rv-ctg", "org-ctgov", [L["c-minage"], L["c-sex"]])
    fx.edge("STATED_IN", "pop-pap", "pub-dfs", "pub-dfs", [L["n-dfs"]])
    # roles (two registries disagree on the sponsor; Bayer's funder episode closed; material provider)
    fx.edge("HAS_STUDY_ROLE", "study", "org-monash", "org-isrctn", [L["sponsor"]], props={"roleKind": "SPONSOR", "roleTextVerbatim": "Sponsor"})
    fx.edge("HAS_STUDY_ROLE", "study", "org-hennepin", "org-ctgov", [L["c-lead"]], props={"roleKind": "LEAD_SPONSOR", "roleTextVerbatim": "leadSponsor"},
            note="disagrees with ISRCTN (Monash University) — both kept, per asserter (Q-D3-08, Q-D3-15)")
    for i, org in enumerate(("org-nhmrc", "org-bayer", "org-monash", "org-berman", "org-nia", "org-nci")):
        fx.edge("HAS_STUDY_ROLE", "study", org, "org-ctgov", [L[f"c-collab{i}"]], props={"roleKind": "COLLABORATOR", "roleTextVerbatim": "collaborators"})
    fx.edge("HAS_STUDY_ROLE", "study", "org-bayer", "org-isrctn", [L["bayer-removed"]],
            props={"roleKind": "FUNDER", "roleTextVerbatim": "funder"}, qualifiers=["sourceRecordRemovedAt:2018-08-22"],
            projected=False, intent=False, status="SUPERSEDED (withdrawn by the source's own record correction of 22/08/2018; successor: the next assertion)",
            note=("reconstructed earlier ISRCTN record statement (Bayer listed as funder), known only from the editorial note "
                  "'22/08/2018: Bayer AG (Australia) was removed as a funder.' 22/08/2018 is the registry's record (transaction) time, not the end "
                  "of a real-world role: the same note says Bayer never funded the trial. Valid time therefore UNKNOWN/UNKNOWN (no source states when "
                  "the listing began or that a funding role ever held); the statement is kept as SUPERSEDED, never projected as an episode "
                  "(adversarial-review correction: an earlier build closed a projected episode at validTo 2018-08-22 STATED_BY_SOURCE)"))
    fx.edge("HAS_STUDY_ROLE", "study", "org-bayer", "org-isrctn", [L["bayer-nofund"]], props={"roleKind": "FUNDER"},
            polarity="NEGATIVE", speech="DENIES", projected=False, intent=False,
            note="negative assertion: 'did not fund the trial' — the successor of the withdrawn listing (previous assertion); never projected to an edge; contradicts CTG listing Bayer (INDUSTRY) as collaborator only in role, not in fact")
    fx.edge("HAS_STUDY_ROLE", "study", "org-bayer", "org-isrctn", [L["bayer-drug"]],
            props={"roleKind": "MATERIAL_PROVIDER", "roleTextVerbatim": "provided the study drug"})
    fx.edge("HAS_STUDY_ROLE", "study", "org-nhmrc", "org-isrctn", [L["f-nhmrc"]], props={"roleKind": "FUNDER", "roleTextVerbatim": "Funders"})
    fx.edge("HAS_STUDY_ROLE", "study", "org-nia", "org-isrctn", [L["f-nia"], L["added-funders"]], props={"roleKind": "FUNDER", "roleTextVerbatim": "Funders"},
            note="added to the ISRCTN record on 22/08/2018 (record time); valid time not stated")
    fx.edge("HAS_STUDY_ROLE", "study", "org-nia", "pub-dfs", [L["fund-dfs"]], props={"roleKind": "FUNDER", "roleTextVerbatim": "Funded by"})
    # conditions investigated (each registry's own wording, resolved by entity-link)
    fx.edge("INVESTIGATES", "study", "cond-physical-disability", "org-ctgov", [L["c-cond0"]])
    fx.edge("INVESTIGATES", "study", "cond-dementia", "org-ctgov", [L["c-cond1"]])
    fx.edge("INVESTIGATES", "study", "cond-hemorrhage", "org-ctgov", [L["c-cond5"]])
    fx.edge("INVESTIGATES", "study", "cond-physical-disability", "org-isrctn", [L["cond"]],
            note="ISRCTN 'Mental and physical disability in the elderly' resolves to the same D2 Condition as CTG 'Functional Disability'")
    # publications report on the study (paper-asserted and registry-asserted)
    for pubref, k, rk in (("pub-cvd", "nct-cvd", "ref-cvd"), ("pub-dfs", "nct-dfs", "ref-dfs"), ("pub-acm", "nct-acm", "ref-acm")):
        fx.edge("REPORTS_ON", pubref, "study", pubref, [L[k]])
        fx.edge("REPORTS_ON", pubref, "study", "org-ctgov", [L[rk]], note="CTG referencesModule, type DERIVED")
    for pubref, pm, doi, pmc in (("pub-cvd", "30221597", "10.1056/NEJMoa1805819", "PMC6289056"),):
        pass
    # authorship: predicate-only (05 predicateOnly AUTHORED_BY)
    for pubref, k in (("pub-cvd", "au-cvd"), ("pub-dfs", "au-dfs"), ("pub-acm", "au-acm")):
        fx.pred("AUTHORED_BY", pubref, "person-mcneil", "org-nlm", [L[k]], note="predicate-only (05 predicateOnly); first author")
    fx.ident("person-mcneil", "ORCID", "ORCID", "0000-0002-1049-5129", "org-nlm", [L["orcid"]])
    # design / status disagreements and stop reason
    fx.lit("REGISTRY_NOT_MAINTAINED_NOTE", "rv-isrctn-obs", "ISRCTN record for ASPREE will not be further updated by the investigators (28/08/2018)",
           "org-isrctn", [L["frozen"]], note="05 predicateOnly REGISTRY_NOT_MAINTAINED_NOTE (CQ-ST-08, Q-D3-18)")
    fx.lit("STOPPED_EARLY_REASON", "study",
           "The trial was terminated at a median of 4.7 years of follow-up after a determination was made that there would be no benefit with continued aspirin use with regard to the primary end point.",
           "pub-dfs", [L["dfs-stop"]], note="05 predicateOnly STOPPED_EARLY_REASON (Q-D3-18); CTG has no whyStopped and still says UNKNOWN status")
    fx.lit("INTERPRETATION_CAVEAT", "sr-acm", "this result was unexpected and should be interpreted with caution", "pub-acm", [L["acm-caution"]],
           speech="CAUTIONS", note="05 predicateOnly INTERPRETATION_CAVEAT (Q-D3-05)")
    # adversarial-review stage additions (appended so earlier assertion refs stay stable)
    for ref, _, _ in REG_OD:
        fx.struct("HAS_OUTCOME", "study", ref)
        fx.edge("STATED_IN", ref, "rv-reg", "org-isrctn", [L["hreg"], L[ref]])
    fx.struct("HAS_OUTCOME", "study", "od-cvd-s")
    fx.edge("STATED_IN", "od-cvd-s", "pub-cvd", "pub-cvd", [L["hem-def"], L["cvd-def"]],
            note="the paper's cardiovascular secondary contains the non-fatal events that were registration-time primaries 7 and 8 (od-reg7, od-reg8); different outcomeKeys, so the move from registered primary to reported secondary composite is a curated EQUIVALENCE / switching judgment, not a key match")
    fx.edge("STATED_IN", "sr-cvd", "pub-cvd", "pub-cvd", [L["cvd-est"], L["cvd-lo"], L["cvd-hi"], L["cvd-concl"]])
    fx.struct("RESULT_FOR", "sr-cvd", "od-cvd-s")
    fx.struct("RESULT_FOR_ARM", "sr-cvd", "arm-pap-asp", 0)
    fx.struct("RESULT_FOR_ARM", "sr-cvd", "arm-pap-pbo", 1, note="reference arm (comparatorArmKey placebo)")

    extra = {
        "projections": [
            {"what": "Study status cache (method study-registry-projection/v1)", "from": "latest open HAS_REGISTRATION_VERSION episode per registry",
             "result": {"CTGOV": "UNKNOWN, resultsPosted false (rv-ctg)", "ISRCTN": "COMPLETED (rv-isrctn-obs)"},
             "note": "registries disagree; the Study cache names its source version (projectionOfRegistrationVersionUid = rv-ctg, the registry ISRCTN defers to)"},
            {"what": "Publication.revisionStatus (publication-revision-status/v1)", "result": "NONE_KNOWN for all three NEJM papers (no incoming REVISES captured)"},
        ],
        "asOfExamples": [
            {"asOfValid": "2008-01-01", "registry": "ISRCTN", "openEpisode": "rv-reg", "primaryOutcomes": ["od-cad", "od-reg2", "od-reg3", "od-reg4", "od-reg5", "od-reg6", "od-reg7", "od-reg8"]},
            {"asOfValid": "2008-06-01", "registry": "ISRCTN", "openEpisode": "rv-2008", "primaryOutcomes": ["od-acm-p", "od-death-dem", "od-death-dis"]},
            {"asOfValid": "2018-10-18", "registry": "ISRCTN", "openEpisode": "rv-2009", "primaryOutcomes": ["od-acm-p", "od-dem", "od-dis"],
             "paperPrimary": "od-dfs (composite; CTG states the same composite)"},
            {"asOfRecorded": "2026-10-07", "note": "nothing of this fixture is visible: every episode has recordedFrom 2026-10-08 (bitemporal: valid history is reconstructed, recorded history starts at capture)"},
        ],
    }
    return fx, extra
