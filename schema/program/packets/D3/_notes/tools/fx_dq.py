"""Fixture dq-bone-trial-unstructured: Farr et al. 2024 (Nat Med) JATS full text + NCT04313634 registry results.
Unstructured-to-entity walk (00-DIRECTIVE 3.8): question -> D9 chunks (fulltext stand-in and MENTIONS) -> COVERS_LOCATOR ->
locator -> STATED_IN Assertions -> snapshot bytes, re-selected by the verifier."""
import hashlib
import math
import re

from fxlib import XML_NORM, Fixture

M = "−"  # minus sign used by the JATS text


def build(raw):
    fx = Fixture("dq-bone-trial-unstructured", raw)
    J = fx.snap("s-pmc-jats", "pmc-efetch-PMC11705617.xml", "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id=11705617&retmode=xml",
                "Farr JN et al. Effects of intermittent senolytic therapy on bone metabolism in postmenopausal women: a phase 2 randomized controlled trial. Nat Med 2024;30(9):2605-2612 (PMC11705617, JATS author manuscript)",
                "API", "FULL_TEXT_ARTICLE", "tool:pmc-jats", "curl -> NCBI E-utilities efetch db=pmc retmode=xml (human page https://pmc.ncbi.nlm.nih.gov/articles/PMC11705617/)",
                published_at="2024-07-02", research_digest="sha256:67e6b9b16b32949e5ecd98f69d1f8ee195b2c9f8d660a8d3caa7482aea015338")
    C = fx.snap("s-ctg-nct04313634", "ctg-v2-NCT04313634.json", "https://clinicaltrials.gov/api/v2/studies/NCT04313634",
                "ClinicalTrials.gov API v2 record NCT04313634 (results posted 2024-07-22)", "API", "REGISTRY_RECORD", "tool:ctgov-v2",
                "curl -> ClinicalTrials.gov API v2 /studies/{nctId}",
                note="the record carries a pointOfContact e-mail and phone; no locator selects them and the fixture does not copy them")
    P = fx.snap("s-pubmed-38956196", "pubmed-efetch-38956196.xml", "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=38956196&retmode=xml",
                "MEDLINE record PMID 38956196", "API", "BIBLIOGRAPHIC_RECORD", "tool:pubmed-eutils", "curl -> NCBI E-utilities efetch db=pubmed retmode=xml")
    j, c, p = J.ref, C.ref, P.ref

    # ------------------------------------------------------------------ entities
    fx.ent("study", "Study", "study", "nct04313634", "Targeting Cellular Senescence With Senolytics to Improve Skeletal Health in Older Humans (NCT04313634)",
           {"studyKind": "INTERVENTIONAL_RANDOMIZED", "phase": ["PHASE_2"], "overallStatus": "COMPLETED", "primaryCompletionDate": "2023-06-06T00:00:00Z",
            "primaryCompletionDateType": "ACTUAL", "resultsPosted": True, "projectionOfRegistrationVersionUid": "hu:registration-version:fx-ctgov-nct04313634-2024-07-22"})
    fx.ent("rv-ctg", "RegistrationVersion", "registration-version", "ctgov-nct04313634-2024-07-22", "NCT04313634 observed version 2024-07-22",
           {"registry": "CTGOV", "registrationId": "NCT04313634", "versionDate": "2024-07-22T00:00:00Z", "versionDatePrecision": "DAY",
            "populatingMode": "OBSERVED", "payloadHash": C.digest, "overallStatus": "COMPLETED", "overallStatusVerbatim": "COMPLETED",
            "enrollmentCount": 74, "enrollmentCountType": "ACTUAL", "firstSubmittedDate": "2020-03-17T00:00:00Z", "startDate": "2020-06-09T00:00:00Z",
            "startDateType": "ACTUAL", "primaryCompletionDate": "2023-06-06T00:00:00Z", "primaryCompletionDateType": "ACTUAL", "resultsPosted": True,
            "resultsFirstPostedDate": "2024-07-22T00:00:00Z", "phase": ["PHASE_2"], "allocation": "RANDOMIZED", "masking": "NONE",
            "primaryPurpose": "SUPPORTIVE_CARE", "interventionModel": "PARALLEL", "conditionsVerbatim": ["Healthy"],
            "interventionNamesVerbatim": ["Dasatinib", "Quercetin", "Fisetin"], "sponsorNameVerbatim": "Sundeep Khosla, M.D."})
    fx.ent("pub", "Publication", "publication", "doi-10-1038-s41591-024-03096-2",
           "Effects of intermittent senolytic therapy on bone metabolism in postmenopausal women: a phase 2 randomized controlled trial",
           {"publicationKind": "ARTICLE", "publishedAt": "2024-07-02T00:00:00Z", "publishedAtPrecision": "DAY", "venueName": "Nat Med",
            "citationText": "Nat Med. 2024 Sep;30(9):2605-2612", "revisionStatus": "NONE_KNOWN", "revisionStatusDerivedAt": "2026-10-08T00:00:00Z"},
           ids=[("PMID", "NLM", "38956196"), ("DOI", "Crossref", "10.1038/s41591-024-03096-2"), ("PMCID", "NLM", "PMC11705617")])
    for ref, slug, name in (("org-ctgov", "clinicaltrials-gov", "ClinicalTrials.gov (U.S. National Library of Medicine)"),
                            ("org-nlm", "us-national-library-of-medicine", "U.S. National Library of Medicine (MEDLINE/PubMed)"),
                            ("org-mayo", "mayo-clinic", "Mayo Clinic")):
        fx.ent(ref, "D7.Organization", "org", slug, name)
    fx.ent("person-khosla", "D7.Person", "person", "sundeep-khosla", "Sundeep Khosla", ids=[("ORCID", "ORCID", "0000-0002-2936-4372")],
           note="CTG lead sponsor 'Sundeep Khosla, M.D.' (sponsor-investigator); ORCID as printed in the MEDLINE author list")
    fx.ent("person-farr", "D7.Person", "person", "joshua-n-farr", "Joshua N Farr", ids=[("ORCID", "ORCID", "0000-0002-3179-6414")])
    fx.ent("person-kirkland", "D7.Person", "person", "james-l-kirkland", "James L Kirkland")
    fx.ent("person-lebrasseur", "D7.Person", "person", "nathan-k-lebrasseur", "Nathan K LeBrasseur")
    fx.ent("person-tchkonia", "D7.Person", "person", "tamara-tchkonia", "Tamara Tchkonia")
    fx.ent("award-r21", "D7.Award", "award", "nih-r21-ag065868", "NIH grant R21 AG065868")
    fx.ent("agent", "K.Agent", "agent", "d3-curation-agent", "agent:d3-curation-agent (BellLabs D3 extraction / curation run)")
    fx.ent("metric-ctx", "D4.Metric", "metric", "serum-ctx", "Serum C-terminal telopeptide of type I collagen (CTx), bone resorption marker")
    fx.ent("metric-p1np", "D4.Metric", "metric", "serum-p1np", "Serum procollagen type 1 N-terminal propeptide (P1NP), bone formation marker")
    fx.ent("cond-gi-bleed", "D2.Condition", "condition", "gastric-hemorrhage", "Gastric hemorrhage")
    fx.ent("mat-dasatinib", "D1.IngredientMaterial", "material", "dasatinib-100mg-tablet", "Dasatinib, 100 mg film-coated tablet (other name Sprycel)")
    fx.ent("mat-quercetin", "D1.IngredientMaterial", "material", "quercetin-phytosome-250mg", "Quercetin phytosome (Sophora japonica concentrate / phosphatidylcholine complex), 250 mg")
    fx.ent("mat-fisetin", "D1.IngredientMaterial", "material", "fisetin-100mg-capsule", "Fisetin, 100 mg capsules")
    # adversarial-review stage: a generic name in a chunk ('quercetin') names the D1 substance, never the specific material
    for ref, slug, name in (("subst-dasatinib", "dasatinib", "Dasatinib"), ("subst-quercetin", "quercetin", "Quercetin"), ("subst-fisetin", "fisetin", "Fisetin")):
        fx.ent(ref, "D1.ChemicalSubstance", "substance", slug, name)

    H = lambda s: "sha256:" + hashlib.sha256(s.encode()).hexdigest()

    def arm(ref, slug, name, key, typ, desc=None):
        fx.ent(ref, "StudyArm", "study-arm", slug, name, {"armKey": key, "armType": typ, "description": desc, "payloadHash": H(slug + "|" + name)})

    arm("arm-r-dq", "nct04313634-ctg-dq", "Dasatinib plus Quercetin Treatment Goup", "dasatinib-quercetin", "EXPERIMENTAL", "label printed with the registry's typo 'Goup'")
    arm("arm-r-fis", "nct04313634-ctg-fisetin", "Fisetin Treatment Group", "fisetin", "EXPERIMENTAL")
    arm("arm-r-ctl", "nct04313634-ctg-control", "Untreated Control Group", "control", "NO_INTERVENTION")
    arm("arm-p-dq", "farr2024-dq", "D + Q", "dasatinib-quercetin", "EXPERIMENTAL")
    arm("arm-p-ctl", "farr2024-control", "control", "control", "NO_INTERVENTION")

    def comp(ref, slug, name, **props):
        props.setdefault("payloadHash", H(slug + "|" + name))
        fx.ent(ref, "InterventionComponent", "intervention-component", slug, name, props)

    comp("comp-r-d", "nct04313634-ctg-dasatinib", "Dasatinib (registry)", componentRole="ACTIVE", materialTextVerbatim="Dasatinib",
         interventionTypeVerbatim="DRUG", quantity=100.0, unitCode="mg", quantityBasis="PER_DAY", massBasis="UNSPECIFIED", route="ORAL",
         dosageForm="film-coated tablet", scheduleText="100 mg for two days; intermittent, starting every 28 days, five dosing periods over 20 weeks",
         durationIso="P20W", verbatimDoseText="Dasatinib (D; 100 mg for two days)")
    comp("comp-r-q", "nct04313634-ctg-quercetin", "Quercetin (registry)", componentRole="ACTIVE", materialTextVerbatim="Quercetin",
         interventionTypeVerbatim="DRUG", quantity=1000.0, unitCode="mg", quantityBasis="PER_DAY", massBasis="UNSPECIFIED", route="ORAL",
         dosageForm="quercetin phytosome 250 mg", scheduleText="1000 mg total daily for three consecutive days, every 28 days", durationIso="P20W",
         verbatimDoseText="Quercetin (Q; 1000 mg total daily for three consecutive days")
    comp("comp-r-f", "nct04313634-ctg-fisetin", "Fisetin (registry)", componentRole="ACTIVE", materialTextVerbatim="Fisetin",
         interventionTypeVerbatim="DRUG", quantity=20.0, unitCode="mg/kg", quantityBasis="PER_KG_BODY_WEIGHT_PER_DAY", massBasis="UNSPECIFIED", route="ORAL",
         dosageForm="100 mg capsules", scheduleText="for three consecutive days, every 28 days", durationIso="P20W",
         verbatimDoseText="Fisetin (F; \\~20 mg/kg/day for three consecutive days)")
    comp("comp-p-d", "farr2024-dasatinib", "Dasatinib (paper)", componentRole="ACTIVE", materialTextVerbatim="D (Sprycel, Bristol Myers Squibb)", quantity=100.0, unitCode="mg",
         quantityBasis="PER_DAY", route="ORAL", scheduleText="two consecutive days", supplierNameVerbatim="Bristol Myers Squibb",
         verbatimDoseText="D (100 mg per day for two consecutive days; Sprycel, Bristol Myers Squibb)")
    comp("comp-p-q", "farr2024-quercetin", "Quercetin (paper)", componentRole="ACTIVE", materialTextVerbatim="Q (Quercetin Phytosome, Thorne Research)",
         quantity=1000.0, unitCode="mg", quantityBasis="PER_DAY", route="ORAL", scheduleText="250 mg four times a day for three consecutive days",
         supplierNameVerbatim="Thorne Research",
         verbatimDoseText="Q (250 mg four times a day (1,000 mg per day) for three consecutive days; Quercetin Phytosome, Thorne Research)")

    def pop(ref, slug, name, **props):
        props.setdefault("payloadHash", H(slug))
        props.setdefault("ncbiTaxonId", "9606")
        fx.ent(ref, "StudyPopulation", "study-population", slug, name, props)

    pop("pop-r-elig", "nct04313634-ctg-eligible", "CTG eligible population", populationKind="ELIGIBLE", sexScope="FEMALE", minAgeYears=60.0,
        healthyVolunteers=True, ageText="60 Years (minimumAge)")
    pop("pop-r-enr", "nct04313634-ctg-enrolled", "CTG enrolled (actual)", populationKind="ENROLLED", size=74, sexScope="FEMALE")
    pop("pop-p-rand", "farr2024-randomized", "Randomized postmenopausal women", populationKind="RANDOMIZED", size=60, sexScope="FEMALE",
        minAgeYears=60.0, maxAgeYears=90.0, ageText="aged 60–90 years", analysisSet="INTENTION_TO_TREAT")
    pop("pop-p-enrich", "farr2024-eligible-p16", "Eligible: p16 above the young-female 95th percentile", populationKind="ELIGIBLE", sexScope="FEMALE",
        enrichmentText="T cell p16 mRNA expression greater than the 95th percentile of young control women aged 22–31 years")

    def od(ref, slug, name, key, prio, mk, tp):
        fx.ent(ref, "OutcomeDefinition", "outcome-definition", slug, name, {"outcomeKey": key, "priority": prio, "measureKind": mk, "timepoint": tp})

    od("od-ctx20", "nct04313634-ctx-20w-primary", "Percent change in serum CTx, baseline to 20 weeks", "serum-ctx-pct-change@20w", "PRIMARY", "BIOMARKER", "20 weeks")
    od("od-p1np2", "nct04313634-p1np-2w-secondary", "Percent change in serum P1NP, baseline to 2 weeks", "serum-p1np-pct-change@2w", "SECONDARY", "BIOMARKER", "2 weeks")
    od("od-p1np4", "nct04313634-p1np-4w-secondary", "Percent change in serum P1NP, baseline to 4 weeks", "serum-p1np-pct-change@4w", "SECONDARY", "BIOMARKER", "4 weeks")
    od("od-p1np20", "nct04313634-p1np-20w-secondary", "Percent change in serum P1NP, baseline to 20 weeks", "serum-p1np-pct-change@20w", "SECONDARY", "BIOMARKER", "20 weeks")
    od("od-ae-gi", "nct04313634-ae-gastric-hemorrhage", "Serious adverse event: Gastric hemorrhage", "ae:gastric-hemorrhage", "SAFETY", "ADVERSE_EVENT",
       "baseline to end of study, approximately 20 weeks")
    od("od-ae-sae", "nct04313634-ae-serious-any", "Serious adverse events (any)", "ae:serious-any", "SAFETY", "ADVERSE_EVENT", "20 weeks")

    def sr(ref, slug, name, **props):
        fx.ent(ref, "StudyResult", "study-result", slug, name, props)

    reg = dict(estimateQualifier="AS_REPORTED", unitCode="%", dispersionKind="FULL_RANGE", resultKind="MEDIAN", comparisonKind="ARM_DESCRIPTIVE",
               statisticalConclusion="NOT_TESTED")
    sr("sr-r-ctx-dq", "nct04313634-ctg-ctx20-dq", "CTx 20 w, D+Q arm (registry)", analysisKind="PRIMARY_PRESPECIFIED", sampleSize=28, estimate=-4.1,
       intervalLower=-28.1, intervalUpper=114.6, **reg)
    sr("sr-r-ctx-fis", "nct04313634-ctg-ctx20-fisetin", "CTx 20 w, fisetin arm (registry)", analysisKind="PRIMARY_PRESPECIFIED", sampleSize=11, estimate=13.7,
       intervalLower=-42.7, intervalUpper=61.0, **reg)
    sr("sr-r-ctx-ctl", "nct04313634-ctg-ctx20-control", "CTx 20 w, control arm (registry)", analysisKind="PRIMARY_PRESPECIFIED", sampleSize=28, estimate=-7.7,
       intervalLower=-42.4, intervalUpper=22.5, **reg)
    sr("sr-r-ctx-cmp", "nct04313634-ctg-ctx20-dq-vs-control", "CTx 20 w, D+Q vs control, Wilcoxon (registry)", resultKind="OTHER",
       analysisKind="PRIMARY_PRESPECIFIED", comparisonKind="BETWEEN_ARM", statisticalConclusion="NOT_REPORTED", pValue=0.611, pValueText="0.611",
       comparatorArmKey="control", resultText="SUPERIORITY; Wilcoxon (Mann-Whitney); pValue 0.611")
    sr("sr-r-p1np2-cmp", "nct04313634-ctg-p1np2-dq-vs-control", "P1NP 2 w, D+Q vs control (registry)", resultKind="OTHER", analysisKind="SECONDARY_PRESPECIFIED",
       comparisonKind="BETWEEN_ARM", statisticalConclusion="NOT_REPORTED", pValue=0.020, pValueText="0.020", comparatorArmKey="control")
    sr("sr-r-p1np4-cmp", "nct04313634-ctg-p1np4-dq-vs-control", "P1NP 4 w, D+Q vs control (registry; fisetin group absent)", resultKind="OTHER",
       analysisKind="SECONDARY_PRESPECIFIED", comparisonKind="BETWEEN_ARM", statisticalConclusion="NOT_REPORTED", pValue=0.024, pValueText="0.024", comparatorArmKey="control")
    sr("sr-r-ae-gi-fis", "nct04313634-ctg-sae-gastric-hemorrhage-fisetin", "Serious AE gastric hemorrhage, fisetin arm (registry)", resultKind="ADVERSE_EVENT_COUNT",
       analysisKind="SAFETY", comparisonKind="ARM_DESCRIPTIVE", statisticalConclusion="NOT_TESTED", seriousness="SERIOUS", participantsAffected=1,
       participantsAtRisk=14, collectionMethod="SYSTEMATIC")
    sr("sr-r-sae-dq", "nct04313634-ctg-sae-any-dq", "Serious AEs (any), D+Q arm (registry)", resultKind="ADVERSE_EVENT_COUNT", analysisKind="SAFETY",
       comparisonKind="ARM_DESCRIPTIVE", statisticalConclusion="NOT_TESTED", seriousness="SERIOUS", participantsAffected=0, participantsAtRisk=30)
    pap = dict(analysisPopulation="INTENTION_TO_TREAT", estimateQualifier="AS_REPORTED")
    sr("sr-p-ctx-dq", "farr2024-ctx20-dq", "CTx 20 w, D+Q group (paper)", resultKind="MEDIAN", analysisKind="PRIMARY_PRESPECIFIED", comparisonKind="ARM_DESCRIPTIVE",
       statisticalConclusion="NOT_TESTED", estimate=-4.1, unitCode="%", dispersionKind="INTERQUARTILE_RANGE", intervalLower=-13.2, intervalUpper=2.6, **pap)
    sr("sr-p-ctx-ctl", "farr2024-ctx20-control", "CTx 20 w, control group (paper)", resultKind="MEDIAN", analysisKind="PRIMARY_PRESPECIFIED",
       comparisonKind="ARM_DESCRIPTIVE", statisticalConclusion="NOT_TESTED", estimate=-7.7, unitCode="%", dispersionKind="INTERQUARTILE_RANGE",
       intervalLower=-20.1, intervalUpper=14.3, **pap)
    sr("sr-p-ctx-cmp", "farr2024-ctx20-dq-vs-control", "CTx 20 w, D+Q vs control (paper)", resultKind="OTHER", analysisKind="PRIMARY_PRESPECIFIED",
       comparisonKind="BETWEEN_ARM", statisticalConclusion="NOT_SIGNIFICANT", direction="UNKNOWN", sampleSize=60, pValue=0.611, pValueText="0.611",
       comparatorArmKey="control", **pap)
    sr("sr-p-p1np2", "farr2024-p1np2-dq-vs-control", "P1NP 2 w, difference from control (paper)", resultKind="PERCENT_CHANGE", analysisKind="SECONDARY_PRESPECIFIED",
       comparisonKind="BETWEEN_ARM", statisticalConclusion="SIGNIFICANT", direction="INCREASED", estimate=16.0, unitCode="%", pValue=0.020,
       pValueText="0.020", comparatorArmKey="control", resultText="difference from control, +16%", **pap)
    sr("sr-p-p1np4", "farr2024-p1np4-dq-vs-control", "P1NP 4 w, difference from control (paper)", resultKind="PERCENT_CHANGE", analysisKind="SECONDARY_PRESPECIFIED",
       comparisonKind="BETWEEN_ARM", statisticalConclusion="SIGNIFICANT", direction="INCREASED", estimate=16.0, unitCode="%", pValue=0.024,
       pValueText="0.024", comparatorArmKey="control", resultText="difference from control, +16%", **pap)
    sr("sr-p-p1np20", "farr2024-p1np20-dq-vs-control", "P1NP 20 w (paper)", resultKind="PERCENT_CHANGE", analysisKind="SECONDARY_PRESPECIFIED",
       comparisonKind="BETWEEN_ARM", statisticalConclusion="NOT_SIGNIFICANT", direction="DECREASED", estimate=-9.0, unitCode="%", pValue=0.149,
       pValueText="0.149", comparatorArmKey="control", **pap)
    sr("sr-p-p16", "farr2024-p1np2-highest-p16-tertile", "P1NP 2 w in the highest p16 tertile (paper, exploratory)", resultKind="PERCENT_CHANGE",
       analysisKind="EXPLORATORY", comparisonKind="BETWEEN_ARM", statisticalConclusion="SIGNIFICANT", direction="INCREASED", estimate=34.0, unitCode="%",
       pValue=0.035, pValueText="0.035", comparatorArmKey="control", subgroupLabel="highest tertile for T cell p16 (also known as CDKN2A) mRNA levels")
    sr("sr-p-sae", "farr2024-sae-dq", "Serious or severe AEs related to D + Q (paper)", resultKind="ADVERSE_EVENT_COUNT", analysisKind="SAFETY",
       comparisonKind="ARM_DESCRIPTIVE", statisticalConclusion="NOT_TESTED", seriousness="SERIOUS", participantsAffected=0,
       resultText="No serious or severe adverse events related to D + Q administration occurred.")

    # ------------------------------------------------------------------ locators
    X = "xml"
    L = {}
    ab_ctx = (f"did not differ between groups (median (interquartile range), D + Q {M}4.1% ({M}13.2, 2.6), control {M}7.7% ({M}20.1, 14.3); P = 0.611)")
    L["ab-ctx-dq"] = fx.num(j, ab_ctx, f"{M}4.1", "estimate", basis=X)
    L["ab-ctx-dq-lo"] = fx.num(j, ab_ctx, f"{M}13.2", "intervalLower", basis=X)
    L["ab-ctx-dq-hi"] = fx.num(j, ab_ctx, "2.6", "intervalUpper", basis=X)
    L["ab-ctx-ctl"] = fx.num(j, ab_ctx, f"{M}7.7", "estimate", basis=X)
    L["ab-ctx-ctl-lo"] = fx.num(j, ab_ctx, f"{M}20.1", "intervalLower", basis=X)
    L["ab-ctx-ctl-hi"] = fx.num(j, ab_ctx, "14.3", "intervalUpper", basis=X)
    L["ab-ctx-p"] = fx.num(j, ab_ctx, "0.611", "pValue", basis=X)
    L["ab-iqr"] = fx.tq(j, "median (interquartile range)", basis=X, occurrence=0, field="dispersionKind")
    L["ab-n"] = fx.num(j, "in postmenopausal women (n = 60 participants)", "60", "sampleSize", basis=X)
    ab_p1np20 = f"but was not different from control at 20 weeks ({M}9%, P = 0.149)"
    L["ab-p1np20"] = fx.num(j, ab_p1np20, f"{M}9", "estimate", basis=X)
    L["ab-p1np20-p"] = fx.num(j, ab_p1np20, "0.149", "pValue", basis=X)
    L["ab-p1np20-concl"] = fx.tq(j, "but was not different from control at 20 weeks", basis=X, field="statisticalConclusion")
    ab_p16 = "in which D + Q concomitantly increased P1NP (+34%, P = 0.035)"
    L["ab-p16"] = fx.num(j, ab_p16, "+34", "estimate", basis=X)
    L["ab-p16-p"] = fx.num(j, ab_p16, "0.035", "pValue", basis=X)
    L["ab-p16-sub"] = fx.tq(j, "highest tertile for T cell p16 (also known as CDKN2A) mRNA levels", basis=X, field="subgroupLabel")
    L["ab-exploratory"] = fx.tq(j, "In exploratory analyses, the skeletal response to D + Q was driven principally by women with a high senescent cell burden", basis=X, field="analysisKind")
    L["ab-nosae"] = fx.tq(j, "No serious adverse events were observed.", basis=X)
    L["ab-nct"] = fx.tq(j, "ClinicalTrials.gov identifier: NCT04313634", basis=X)
    L["s3-third-arm"] = fx.tq(j, "The original study design included a third arm in which participants were to be administered a flavanol with senolytic properties (fisetin)", basis=X)
    L["s3-two-arm"] = fx.tq(j, "but because of the COVID pandemic and cost issues, the study was modified to a two-arm study (control versus D + Q).", basis=X)
    L["s3-open-label"] = fx.tq(j, "we elected to use an open-label design", basis=X)
    L["s3-primary"] = fx.tq(j, "our primary endpoint was the percentage changes in the bone resorption marker, serum CTx from baseline to 20 weeks", basis=X)
    L["s3-secondary"] = fx.tq(j, "we specified the key secondary endpoints as percentage changes in P1NP not only at 20 weeks, but also over intermediate time points", basis=X)
    L["s3-p16"] = fx.tq(j, "greater than the 95th percentile of young control women aged 22–31 years", basis=X)
    L["s4-null"] = fx.tq(j, "which did not differ between the D + Q versus the control groups.", basis=X, field="statisticalConclusion")
    s5 = "it was significantly higher (relative to control) in the D + Q group at 2 weeks (difference from control, +16%, P = 0.020) and 4 weeks (difference from control, +16%, P = 0.024)"
    L["s5-2w"] = fx.num(j, s5, "+16%", "estimate", basis=X, occurrence=0)
    L["s5-2w-p"] = fx.num(j, s5, "0.020", "pValue", basis=X)
    L["s5-4w"] = fx.num(j, s5, "+16%", "estimate", basis=X, occurrence=1)
    L["s5-4w-p"] = fx.num(j, s5, "0.024", "pValue", basis=X)
    L["s5-sig"] = fx.tq(j, "it was significantly higher (relative to control) in the D + Q group", basis=X, field="statisticalConclusion")
    L["s6-nosae"] = fx.tq(j, "No serious or severe adverse events related to D + Q administration occurred.", basis=X)
    L["s6-itt"] = fx.tq(j, "All randomized participants were analyzed in the intention-to-treat protocol", basis=X, field="analysisPopulation")
    L["s12-site"] = fx.tq(j, "All studies were performed at the Mayo Clinic", basis=X)
    L["s13-rand"] = fx.num(j, "We randomized 60 eligible postmenopausal women", "60", "size", basis=X)
    L["s13-age"] = fx.tq(j, "aged 60–90 years", basis=X, occurrence=0)
    L["s15-d"] = fx.tq(j, "The oral dose of D (100 mg per day)", basis=X)
    L["s15-q"] = fx.tq(j, "selected was 1,000 mg per day for three consecutive days", basis=X)
    L["coi"] = fx.tq(j, "N.K.L., T.T. and J.L.K. have a financial interest related to this research, including patents and pending patents covering senolytic drugs and their uses that are held by Mayo Clinic.", basis=X)
    L["grant"] = fx.tq(j, "This work was supported by National Institutes of Health grant nos R21 AG065868 (J.N.F. and S.K.)", basis=X)
    L["funders-role"] = fx.tq(j, "The funders played no role in the conduct or analyses in this study.", basis=X)

    Q = "/protocolSection/"
    R = "/resultsSection/outcomeMeasuresModule/outcomeMeasures/"
    for k, ptr in (("c-nct", Q + "identificationModule/nctId"), ("c-lead", Q + "sponsorCollaboratorsModule/leadSponsor"),
                   ("c-resp", Q + "sponsorCollaboratorsModule/responsibleParty"), ("c-mask", Q + "designModule/designInfo/maskingInfo/masking"),
                   ("c-enroll", Q + "designModule/enrollmentInfo"), ("c-lastupd", Q + "statusModule/lastUpdatePostDateStruct"),
                   ("c-arm0", Q + "armsInterventionsModule/armGroups/0/label"), ("c-arm1", Q + "armsInterventionsModule/armGroups/1/label"),
                   ("c-arm2", Q + "armsInterventionsModule/armGroups/2/label"), ("c-arm0-desc", Q + "armsInterventionsModule/armGroups/0/description"),
                   ("c-arm1-desc", Q + "armsInterventionsModule/armGroups/1/description"),
                   ("c-int0", Q + "armsInterventionsModule/interventions/0/description"), ("c-int1", Q + "armsInterventionsModule/interventions/1/description"),
                   ("c-int2", Q + "armsInterventionsModule/interventions/2/description"),
                   ("c-po", Q + "outcomesModule/primaryOutcomes/0/timeFrame"), ("c-po-m", Q + "outcomesModule/primaryOutcomes/0/measure"),
                   ("c-so0", Q + "outcomesModule/secondaryOutcomes/0/timeFrame"), ("c-so1", Q + "outcomesModule/secondaryOutcomes/1/timeFrame"),
                   ("c-so2", Q + "outcomesModule/secondaryOutcomes/2/timeFrame"), ("c-so-m", Q + "outcomesModule/secondaryOutcomes/0/description"),
                   ("c-sex", Q + "eligibilityModule/sex"), ("c-minage", Q + "eligibilityModule/minimumAge"), ("c-healthy", Q + "eligibilityModule/healthyVolunteers"),
                   ("c-ref", Q + "referencesModule/references/1/pmid"),
                   ("c-disp", R + "0/dispersionType"), ("c-param", R + "0/paramType"),
                   ("c-p1np4-groups", R + "2/groups/1/title"),
                   ("c-ae-term", "/resultsSection/adverseEventsModule/seriousEvents/0/term"),
                   ("c-ae-method", "/resultsSection/adverseEventsModule/seriousEvents/0/assessmentType"),
                   ("c-ae-timeframe", "/resultsSection/adverseEventsModule/timeFrame")):
        L[k] = fx.jp(c, ptr)
    m0 = R + "0/classes/0/categories/0/measurements/"
    for k, g in (("dq", 0), ("fis", 1), ("ctl", 2)):
        L[f"c-ctx-{k}"] = fx.jp(c, f"{m0}{g}/value", field="estimate")
        L[f"c-ctx-{k}-lo"] = fx.jp(c, f"{m0}{g}/lowerLimit", field="intervalLower")
        L[f"c-ctx-{k}-hi"] = fx.jp(c, f"{m0}{g}/upperLimit", field="intervalUpper")
        L[f"c-ctx-{k}-n"] = fx.jp(c, f"{R}0/denoms/0/counts/{g}/value", field="sampleSize")
    L["c-ctx-p"] = fx.jp(c, R + "0/analyses/0/pValue", field="pValue")
    L["c-ctx-method"] = fx.jp(c, R + "0/analyses/0/statisticalMethod")
    L["c-p1np2-p"] = fx.jp(c, R + "1/analyses/0/pValue", field="pValue")
    L["c-p1np4-p"] = fx.jp(c, R + "2/analyses/0/pValue", field="pValue")
    AE = "/resultsSection/adverseEventsModule/"
    L["c-ae-fis-n"] = fx.jp(c, AE + "seriousEvents/0/stats/1/numAffected", field="participantsAffected")
    L["c-ae-fis-risk"] = fx.jp(c, AE + "seriousEvents/0/stats/1/numAtRisk", field="participantsAtRisk")
    L["c-sae-dq-n"] = fx.jp(c, AE + "eventGroups/0/seriousNumAffected", field="participantsAffected")
    L["c-sae-dq-risk"] = fx.jp(c, AE + "eventGroups/0/seriousNumAtRisk", field="participantsAtRisk")
    L["c-fis-group"] = fx.jp(c, AE + "eventGroups/1/title")
    L["p-pmid"] = fx.tq(p, '<PMID Version="1">38956196</PMID>', occurrence=0)
    for k, nm in (("au-kirkland", "<LastName>Kirkland</LastName><ForeName>James L</ForeName>"),
                  ("au-lebrasseur", "<LastName>LeBrasseur</LastName><ForeName>Nathan K</ForeName>"),
                  ("au-tchkonia", "<LastName>Tchkonia</LastName><ForeName>Tamara</ForeName>"),
                  ("au-khosla", "<LastName>Khosla</LastName><ForeName>Sundeep</ForeName>"),
                  ("au-farr", "<LastName>Farr</LastName><ForeName>Joshua N</ForeName>")):
        L[k] = fx.tq(p, nm, occurrence=0)
    L["orcid-khosla"] = fx.tq(p, '<Identifier Source="ORCID">0000-0002-2936-4372</Identifier>')
    # adversarial-review stage (2026-10-08): the Methods sentence names product and supplier of both drugs; each secondary
    # outcome's own description; registry SAE counts per group for the 'serious adverse events (any)' declaration
    L["m-d-prod"] = fx.tq(j, "Sprycel, Bristol Myers Squibb", basis=X, field="materialTextVerbatim")
    L["m-q-prod"] = fx.tq(j, "Quercetin Phytosome, Thorne Research", basis=X, field="materialTextVerbatim")
    L["c-so1-m"] = fx.jp(c, Q + "outcomesModule/secondaryOutcomes/1/description")
    L["c-so2-m"] = fx.jp(c, Q + "outcomesModule/secondaryOutcomes/2/description")
    L["c-sae-ctl-n"] = fx.jp(c, AE + "eventGroups/2/seriousNumAffected", field="participantsAffected")
    L["c-sae-ctl-risk"] = fx.jp(c, AE + "eventGroups/2/seriousNumAtRisk", field="participantsAtRisk")
    # RegistrationVersion field facts are cited by the HAS_REGISTRATION_VERSION attach Assertion, one locator per field
    for k, fld in (("c-lastupd", "versionDate"), ("c-mask", "masking"), ("c-enroll", "enrollmentCount")):
        fx.locs[L[k]]["reportsField"] = fld

    # ------------------------------------------------------------------ assertions
    fx.ident("study", "NCT", "NLM ClinicalTrials.gov", "NCT04313634", "org-ctgov", [L["c-nct"]])
    fx.state("study", "rv-ctg", "org-ctgov", [L["c-lastupd"], L["c-mask"], L["c-enroll"]],
             valid={"validFrom": "2024-07-22T00:00:00Z", "validFromPrecision": "DAY", "validFromBasis": "STATED_BY_SOURCE"},
             note="OBSERVED: CTG v2 current version (lastUpdatePostDate 2024-07-22), captured 2026-10-08; one locator per RegistrationVersion field (versionDate, masking, enrollmentCount) on this attach Assertion, no per-field predicates")
    # arms: registry 3, paper 2
    for a_ in ("arm-r-dq", "arm-r-fis", "arm-r-ctl", "arm-p-dq", "arm-p-ctl"):
        fx.struct("HAS_ARM", "study", a_)
    fx.edge("STATED_IN", "arm-r-dq", "rv-ctg", "org-ctgov", [L["c-arm0"], L["c-arm0-desc"]])
    fx.edge("STATED_IN", "arm-r-fis", "rv-ctg", "org-ctgov", [L["c-arm1"], L["c-arm1-desc"]])
    fx.edge("STATED_IN", "arm-r-ctl", "rv-ctg", "org-ctgov", [L["c-arm2"]])
    fx.edge("STATED_IN", "arm-p-dq", "pub", "pub", [L["s3-two-arm"]])
    fx.edge("STATED_IN", "arm-p-ctl", "pub", "pub", [L["s3-two-arm"]])
    fx.lit("ARM_DROPPED_REASON", "arm-r-fis",
           "but because of the COVID pandemic and cost issues, the study was modified to a two-arm study (control versus D + Q).",
           "pub", [L["s3-third-arm"], L["s3-two-arm"]],
           note="05 predicateOnly ARM_DROPPED_REASON; subject = the registry's fisetin arm (which the registry reports with 14 participants started and results posted); Q-D3-01")
    # components and administered materials
    fx.struct("HAS_COMPONENT", "arm-r-dq", "comp-r-d", 0)
    fx.struct("HAS_COMPONENT", "arm-r-dq", "comp-r-q", 1)
    fx.struct("HAS_COMPONENT", "arm-r-fis", "comp-r-f", 0)
    fx.struct("HAS_COMPONENT", "arm-p-dq", "comp-p-d", 0)
    fx.struct("HAS_COMPONENT", "arm-p-dq", "comp-p-q", 1)
    fx.edge("ADMINISTERS", "comp-r-d", "mat-dasatinib", "org-ctgov", [L["c-int0"], L["c-arm0-desc"]])
    fx.edge("ADMINISTERS", "comp-r-q", "mat-quercetin", "org-ctgov", [L["c-int1"], L["c-arm0-desc"]])
    fx.edge("ADMINISTERS", "comp-r-f", "mat-fisetin", "org-ctgov", [L["c-int2"], L["c-arm1-desc"]])
    fx.edge("ADMINISTERS", "comp-p-d", "mat-dasatinib", "pub", [L["s15-d"], L["m-d-prod"]],
            note="the paper's Methods name the product and its maker: 'Sprycel, Bristol Myers Squibb'")
    fx.edge("ADMINISTERS", "comp-p-q", "mat-quercetin", "pub", [L["s15-q"], L["m-q-prod"]],
            note="the paper's Methods name the material and supplier: 'Quercetin Phytosome, Thorne Research' (adversarial-review correction: an earlier build attributed this to the curation agent on a misreading)")
    # populations
    for pp in ("pop-r-elig", "pop-r-enr", "pop-p-rand", "pop-p-enrich"):
        fx.struct("HAS_POPULATION", "study", pp)
    fx.edge("STATED_IN", "pop-r-elig", "rv-ctg", "org-ctgov", [L["c-sex"], L["c-minage"], L["c-healthy"]])
    fx.edge("STATED_IN", "pop-r-enr", "rv-ctg", "org-ctgov", [L["c-enroll"]])
    fx.edge("STATED_IN", "pop-p-rand", "pub", "pub", [L["s13-rand"], L["s13-age"], L["s6-itt"]])
    fx.edge("STATED_IN", "pop-p-enrich", "pub", "pub", [L["s3-p16"]])
    # outcome declarations
    for o in ("od-ctx20", "od-p1np2", "od-p1np4", "od-p1np20", "od-ae-gi", "od-ae-sae"):
        fx.struct("HAS_OUTCOME", "study", o)
    fx.edge("STATED_IN", "od-ctx20", "rv-ctg", "org-ctgov", [L["c-po-m"], L["c-po"]])
    fx.edge("STATED_IN", "od-ctx20", "pub", "pub", [L["s3-primary"]])
    fx.edge("STATED_IN", "od-p1np2", "rv-ctg", "org-ctgov", [L["c-so-m"], L["c-so0"]])
    fx.edge("STATED_IN", "od-p1np4", "rv-ctg", "org-ctgov", [L["c-so1-m"], L["c-so1"]])
    fx.edge("STATED_IN", "od-p1np20", "rv-ctg", "org-ctgov", [L["c-so2-m"], L["c-so2"]])
    for o in ("od-p1np2", "od-p1np4", "od-p1np20"):
        fx.edge("STATED_IN", o, "pub", "pub", [L["s3-secondary"]])
    fx.edge("STATED_IN", "od-ae-gi", "rv-ctg", "org-ctgov", [L["c-ae-term"], L["c-ae-timeframe"]])
    fx.edge("STATED_IN", "od-ae-sae", "pub", "pub", [L["s6-nosae"]])
    fx.edge("STATED_IN", "od-ae-sae", "rv-ctg", "org-ctgov", [L["c-sae-dq-n"], L["c-sae-dq-risk"], L["c-sae-ctl-n"], L["c-sae-ctl-risk"], L["c-ae-timeframe"]],
            note="the registry reports serious adverse events (any) per group: eventGroups seriousNumAffected / seriousNumAtRisk")
    fx.edge("MEASURES", "od-ctx20", "metric-ctx", "agent", [L["c-po-m"]])
    for o, k in (("od-p1np2", "c-so-m"), ("od-p1np4", "c-so1-m"), ("od-p1np20", "c-so2-m")):
        fx.edge("MEASURES", o, "metric-p1np", "agent", [L[k]])
    fx.edge("MEASURES", "od-ae-gi", "cond-gi-bleed", "agent", [L["c-ae-term"]])
    # results: registry (JSON pointer per number) and paper (TEXT_QUOTE per number)
    S = lambda r, rec, who, ev, **kw: fx.edge("STATED_IN", r, rec, who, [L[k] for k in ev], **kw)
    S("sr-r-ctx-dq", "rv-ctg", "org-ctgov", ["c-ctx-dq", "c-ctx-dq-lo", "c-ctx-dq-hi", "c-ctx-dq-n", "c-param", "c-disp"])
    S("sr-r-ctx-fis", "rv-ctg", "org-ctgov", ["c-ctx-fis", "c-ctx-fis-lo", "c-ctx-fis-hi", "c-ctx-fis-n", "c-param", "c-disp"],
      note="fisetin-arm primary result posted in the registry; the paper reports no fisetin arm")
    S("sr-r-ctx-ctl", "rv-ctg", "org-ctgov", ["c-ctx-ctl", "c-ctx-ctl-lo", "c-ctx-ctl-hi", "c-ctx-ctl-n", "c-param", "c-disp"])
    S("sr-r-ctx-cmp", "rv-ctg", "org-ctgov", ["c-ctx-p", "c-ctx-method"],
      note="registry states a P value only; statisticalConclusion NOT_REPORTED (never recomputed; 11-open-questions)")
    S("sr-r-p1np2-cmp", "rv-ctg", "org-ctgov", ["c-p1np2-p"])
    S("sr-r-p1np4-cmp", "rv-ctg", "org-ctgov", ["c-p1np4-p", "c-p1np4-groups"], note="the 4-week P1NP measure lists only two groups (fisetin absent)")
    S("sr-r-ae-gi-fis", "rv-ctg", "org-ctgov", ["c-ae-fis-n", "c-ae-fis-risk", "c-ae-term", "c-ae-method", "c-fis-group"])
    S("sr-r-sae-dq", "rv-ctg", "org-ctgov", ["c-sae-dq-n", "c-sae-dq-risk"])
    S("sr-p-ctx-dq", "pub", "pub", ["ab-ctx-dq", "ab-ctx-dq-lo", "ab-ctx-dq-hi", "ab-iqr", "s6-itt"])
    S("sr-p-ctx-ctl", "pub", "pub", ["ab-ctx-ctl", "ab-ctx-ctl-lo", "ab-ctx-ctl-hi", "ab-iqr", "s6-itt"])
    S("sr-p-ctx-cmp", "pub", "pub", ["ab-ctx-p", "ab-n", "s4-null", "s6-itt"])
    S("sr-p-p1np2", "pub", "pub", ["s5-2w", "s5-2w-p", "s5-sig", "s6-itt"])
    S("sr-p-p1np4", "pub", "pub", ["s5-4w", "s5-4w-p", "s5-sig", "s6-itt"])
    S("sr-p-p1np20", "pub", "pub", ["ab-p1np20", "ab-p1np20-p", "ab-p1np20-concl"])
    S("sr-p-p16", "pub", "pub", ["ab-p16", "ab-p16-p", "ab-p16-sub", "ab-exploratory"])
    S("sr-p-sae", "pub", "pub", ["s6-nosae", "ab-nosae"],
      note="scope 'related to D + Q administration'; the registry's serious gastric hemorrhage is in the fisetin arm the paper does not report")
    for r_, o_, arms in (("sr-r-ctx-dq", "od-ctx20", ["arm-r-dq"]), ("sr-r-ctx-fis", "od-ctx20", ["arm-r-fis"]), ("sr-r-ctx-ctl", "od-ctx20", ["arm-r-ctl"]),
                         ("sr-r-ctx-cmp", "od-ctx20", ["arm-r-dq", "arm-r-ctl"]), ("sr-r-p1np2-cmp", "od-p1np2", ["arm-r-dq", "arm-r-ctl"]),
                         ("sr-r-p1np4-cmp", "od-p1np4", ["arm-r-dq", "arm-r-ctl"]), ("sr-r-ae-gi-fis", "od-ae-gi", ["arm-r-fis"]),
                         ("sr-r-sae-dq", "od-ae-sae", ["arm-r-dq"]), ("sr-p-ctx-dq", "od-ctx20", ["arm-p-dq"]), ("sr-p-ctx-ctl", "od-ctx20", ["arm-p-ctl"]),
                         ("sr-p-ctx-cmp", "od-ctx20", ["arm-p-dq", "arm-p-ctl"]), ("sr-p-p1np2", "od-p1np2", ["arm-p-dq", "arm-p-ctl"]),
                         ("sr-p-p1np4", "od-p1np4", ["arm-p-dq", "arm-p-ctl"]), ("sr-p-p1np20", "od-p1np20", ["arm-p-dq", "arm-p-ctl"]),
                         ("sr-p-p16", "od-p1np2", ["arm-p-dq", "arm-p-ctl"]), ("sr-p-sae", "od-ae-sae", ["arm-p-dq"])):
        fx.struct("RESULT_FOR", r_, o_)
        for i, a_ in enumerate(arms):
            fx.struct("RESULT_FOR_ARM", r_, a_, i)
    # roles, publication links, authorship, interests
    fx.edge("HAS_STUDY_ROLE", "study", "person-khosla", "org-ctgov", [L["c-lead"]], props={"roleKind": "LEAD_SPONSOR", "roleTextVerbatim": "leadSponsor (class OTHER)"},
            note="a Person as lead sponsor (sponsor-investigator): the StudyParty union includes D7 Person")
    fx.edge("HAS_STUDY_ROLE", "study", "person-khosla", "org-ctgov", [L["c-resp"]],
            props={"roleKind": "RESPONSIBLE_PARTY", "roleTextVerbatim": "SPONSOR_INVESTIGATOR, Principal Investigator, affiliation Mayo Clinic"})
    fx.edge("HAS_STUDY_ROLE", "study", "org-mayo", "pub", [L["s12-site"]], props={"roleKind": "SITE", "roleTextVerbatim": "performed at the Mayo Clinic"})
    fx.edge("HAS_STUDY_ROLE", "study", "award-r21", "pub", [L["grant"]], props={"roleKind": "FUNDING_AWARD", "roleTextVerbatim": "supported by ... grant nos R21 AG065868"})
    fx.edge("REPORTS_ON", "pub", "study", "pub", [L["ab-nct"]])
    fx.edge("REPORTS_ON", "pub", "study", "org-ctgov", [L["c-ref"]], note="CTG referencesModule type DERIVED")
    fx.ident("pub", "PMID", "NLM", "38956196", "org-nlm", [L["p-pmid"]])
    for pr, k in (("person-farr", "au-farr"), ("person-kirkland", "au-kirkland"), ("person-lebrasseur", "au-lebrasseur"),
                  ("person-tchkonia", "au-tchkonia"), ("person-khosla", "au-khosla")):
        fx.pred("AUTHORED_BY", "pub", pr, "org-nlm", [L[k]], note="05 predicateOnly AUTHORED_BY")
    fx.ident("person-khosla", "ORCID", "ORCID", "0000-0002-2936-4372", "org-nlm", [L["orcid-khosla"]])
    fx.lit("COMPETING_INTEREST_STATED", "pub",
           "N.K.L., T.T. and J.L.K. have a financial interest related to this research, including patents and pending patents covering senolytic drugs and their uses that are held by Mayo Clinic.",
           "pub", [L["coi"]],
           note="authors' disclosure; the typed interest (Person -> Mayo Clinic patents) is D7's (predicate INVENTOR_ON_PATENT_ASSIGNED_TO is D7 predicate-only); initials resolve to the AUTHORED_BY Persons")
    fx.lit("FUNDER_ROLE_STATEMENT", "pub", "The funders played no role in the conduct or analyses in this study.", "pub", [L["funders-role"]])
    fx.lit("MASKING_STATED", "study", "open-label", "pub", [L["s3-open-label"]],
           note="agrees with RegistrationVersion.masking NONE (cited by the attach Assertion a02, locator c-mask) — Q-D3-15 agreement case")

    walk = directive_walk(fx, J, L)
    return fx, {"_walk": walk, "disagreements": [
        {"what": "dispersion of the primary CTx medians", "registry": "FULL_RANGE (-28.1, 114.6) D+Q; (-42.4, 22.5) control", "paper": "INTERQUARTILE_RANGE (−13.2, 2.6) D+Q; (−20.1, 14.3) control",
         "same estimate": "medians -4.1 and -7.7 agree", "results": ["sr-r-ctx-dq", "sr-p-ctx-dq", "sr-r-ctx-ctl", "sr-p-ctx-ctl"]},
        {"what": "n analyzed for the primary", "registry": "28 per arm (denoms)", "paper": "60 randomized, all analyzed by intention to treat", "results": ["sr-r-ctx-dq", "sr-p-ctx-cmp"]},
        {"what": "arms", "registry": "3 (D+Q 30, fisetin 14, control 30 started)", "paper": "2 (fisetin arm dropped: COVID and cost)", "arms": ["arm-r-fis"]},
        {"what": "serious adverse events", "registry": "gastric hemorrhage 1/14 in the fisetin arm (SYSTEMATIC_ASSESSMENT); 0/30 D+Q; 0/30 control",
         "paper": "No serious or severe adverse events related to D + Q administration occurred.", "results": ["sr-r-ae-gi-fis", "sr-r-sae-dq", "sr-p-sae"]},
        {"what": "statistical conclusion", "registry": "P values only (NOT_REPORTED)", "paper": "did not differ (CTx); significantly higher (P1NP 2 and 4 w)"},
        {"what": "masking", "registry": "NONE", "paper": "open-label", "agreement": True},
    ]}


STOP = set("the a an of and or in on at to for with by from was were is are be been did not no than that this these those as it its into over".split())


def toks(s):
    return [t for t in re.findall(r"[a-z0-9+]+", s.lower()) if t not in STOP]


def directive_walk(fx, J, L):
    text, spans, paras = J.xml()
    tv_hash = "sha256:" + hashlib.sha256(text.encode()).hexdigest()
    # chunker jats-paragraph/v1: the abstract and every <p> of the body / back matter, outermost first, no overlaps
    cands = sorted([p for p in paras if p["tag"] in ("abstract", "p") and p["end"] - p["start"] >= 40], key=lambda p: (p["start"], -p["end"]))
    chunks, last_end = [], -1
    for p in cands:
        if p["start"] >= last_end:
            chunks.append(p)
            last_end = p["end"]
    # MENTIONS projection (entity-link/v0 fixture rule: case-sensitive surface forms -> Subjectable)
    # adversarial-review stage: generic names resolve to D1 substances; only the product names stated in the text resolve to
    # the specific materials (entity-link/v1 fixture rule: case-sensitive surface forms found in the chunk's own text)
    surface = {"D + Q": "arm-p-dq", "dasatinib": "subst-dasatinib", "Dasatinib": "subst-dasatinib", "quercetin": "subst-quercetin",
               "Quercetin": "subst-quercetin", "fisetin": "subst-fisetin", "Fisetin": "subst-fisetin", "Sprycel": "mat-dasatinib",
               "Quercetin Phytosome": "mat-quercetin", "CTx": "metric-ctx", "P1NP": "metric-p1np", "adverse event": "od-ae-sae",
               "NCT04313634": "study"}
    docs = [toks(text[c["start"]:c["end"]]) for c in chunks]
    N = len(docs)
    avg = sum(len(d) for d in docs) / N
    df = {}
    for d in docs:
        for t in set(d):
            df[t] = df.get(t, 0) + 1

    def bm25(q):
        qs = toks(q)
        scores = []
        for i, d in enumerate(docs):
            s = 0.0
            for t in qs:
                f = d.count(t)
                if not f:
                    continue
                idf = math.log(1 + (N - df[t] + 0.5) / (df[t] + 0.5))
                s += idf * f * 2.2 / (f + 1.2 * (0.25 + 0.75 * len(d) / avg))
            scores.append((round(s, 3), i))
        return sorted(scores, reverse=True)

    question = "Did senolytics improve bone in older women, and were there harms?"
    subqueries = ["dasatinib quercetin senolytic effect on bone resorption CTx and bone formation P1NP",
                  "P1NP percentage change at 2 and 4 weeks relative to control",
                  "serious adverse events safety harms of D + Q"]
    ranked = {q: bm25(q)[:5] for q in subqueries}
    jl = {r: l for r, l in fx.locs.items() if l["snapshot"] == J.ref}
    by_loc = {}
    for a in fx.asserts:
        for e in a["evidence"]:
            by_loc.setdefault(e["locator"], []).append(a)
    out_chunks = []
    ab = next(((p["start"], p["end"]) for p in paras if p["tag"] == "abstract"), None)
    picked = sorted({i for q in subqueries for _, i in ranked[q]})
    for i in picked:
        ch = chunks[i]
        ctext = text[ch["start"]:ch["end"]]
        ment = sorted({ent for sf, ent in surface.items() if sf in ctext})
        covered = [r for r, l in jl.items() if ch["start"] <= l["startOffset"] and l["endOffset"] <= ch["end"]]
        rows = []
        for r in covered:
            l = jl[r]
            sel = text[l["startOffset"]:l["endOffset"]]
            ok = sel == l["quote"] and ("sha256:" + hashlib.sha256(sel.encode()).hexdigest()) == l["expectedSelectedContentDigest"]
            rows.append({"locator": r, "quote": l["quote"], "offsets": [l["startOffset"], l["endOffset"]],
                         "assertions": [{"ref": a["ref"], "predicate": a["predicate"], "subject": a["subject"]["ref"],
                                         "object": a.get("object", {}).get("ref"), "reportsField": l.get("reportsField")} for a in by_loc.get(r, [])],
                         "verifierReselect": {"selectedEqualsExact": ok, "expectedVerdict": "DIRECTLY_SUPPORTED" if ok else "LOCATOR_ERROR"}})
        out_chunks.append({
            "uid": f"hu:chunk:fx-d3-farr2024-jats-p{i:03d}", "chunkIndex": i, "section": f"sec#{ch['sec']}" if ch["sec"] else ("abstract" if ab and ab[0] <= ch["start"] < ab[1] else ch["tag"]),
            "startOffset": ch["start"], "endOffset": ch["end"], "textDigest": "sha256:" + hashlib.sha256(ctext.encode()).hexdigest(),
            "textHead": ctext[:60] + " ...", "rank": {q: next((k + 1 for k, (_, ii) in enumerate(ranked[q]) if ii == i), None) for q in subqueries},
            "mentions (derived, entity-link/v1)": [fx.ents[m]["uid"] for m in ment],
            "coversLocators (derived, span-overlap/v1)": rows,
        })
    return {
        "fixture": fx.name,
        "question": question,
        "agentQueryPlan": {"subqueries": subqueries,
                           "topK": 5, "index": "fulltext stand-in: BM25 (k1 1.2, b 0.75) over the chunks of this one text version, computed by the builder; production uses the D9 vector index over Chunk embeddings filtered by workUid (no embeddings were computed in this stage)",
                           "entityEntry": "alternative entry by MENTIONS: resolve 'senolytics' -> D1 dasatinib / quercetin / fisetin substances (materials only where the chunk names the product: Sprycel, Quercetin Phytosome), 'bone' -> D4 CTx / P1NP metrics, 'harms' -> OutcomeDefinition measureKind ADVERSE_EVENT; chunks whose MENTIONS include them are the same chunks listed below"},
        "textVersion": {"snapshotUid": J.uid, "snapshotDigest": J.digest, "textBasis": "JATS_XML", "normalizationVersion": XML_NORM,
                        "extractorVersion": "xml-textcontent/v1 (D3 fixture builder, Python ElementTree)", "chunkerVersion": "jats-paragraph/v1 (abstract + each <p>, outermost, >= 40 chars)",
                        "textVersionHash": tv_hash, "chunkCount": N, "chunkTextNote": "chunk text is not copied into the repo (copyright); textDigest + offsets re-derive it from the snapshot"},
        "path": "question -> Chunk (rank / MENTIONS) -COVERS_LOCATOR-> SourceLocator <-HAS_EVIDENCE- Assertion (STATED_IN / ADMINISTERS / literal) ; SourceLocator -> SourceSnapshot (contentHash) ; verifier re-selects the span",
        "chunks": out_chunks,
        "answerFromWalk": [
            "Primary (CTx at 20 weeks): no difference, P = 0.611 (sr-p-ctx-cmp; registry sr-r-ctx-cmp states the same P).",
            "Secondary P1NP: +16% at 2 weeks (P = 0.020) and at 4 weeks (P = 0.024), not different at 20 weeks (−9%, P = 0.149) — secondary, not confirmatory (CQ-ST-05).",
            "Exploratory: highest p16 tertile P1NP +34% (P = 0.035) — subgroup, exploratory.",
            "Harms: the paper reports no serious or severe adverse events related to D + Q; the registry adds a serious gastric hemorrhage (1/14) in the fisetin arm the paper dropped (Q-D3-01, CQ-ST-06).",
        ],
    }
