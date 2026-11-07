"""Fixture antioxidant-exercise-disconfirmation (kind disconfirmation; FC-04)."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *  # noqa

FIX = "antioxidant-exercise-disconfirmation"
OUT = os.path.join(FIXTURES, FIX)
PB = produced(FIX)
D = os.path.join(FX, "antiox")

PA = Snap("snap-pmid19433800", "hu:snapshot:pubmed-19433800-2026-10-08", os.path.join(D, "pubmed-19433800.xml"), "https://pubmed.ncbi.nlm.nih.gov/19433800/",
          "Antioxidants prevent health-promoting effects of physical exercise in humans. PNAS 2009;106(21):8665-70 (PMID 19433800, DOI 10.1073/pnas.0903485106, PMCID PMC2680430)",
          "curl NCBI E-utilities efetch db=pubmed retmode=xml", "RAW_BYTES", "PARTIAL_EXCERPT", "application/xml", "API", published_at="2009-05-11T00:00:00Z",
          request_uri="https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=19433800&retmode=xml",
          note="PubMed record (abstract + metadata); PARTIAL_EXCERPT relative to the article. Byte-identical to the research-stage capture.")
PB2 = Snap("snap-pmid24492839", "hu:snapshot:pubmed-24492839-2026-10-08", os.path.join(D, "pubmed-24492839.xml"), "https://pubmed.ncbi.nlm.nih.gov/24492839/",
           "Vitamin C and E supplementation hampers cellular adaptation to endurance training in humans: a double-blind, randomised, controlled trial. J Physiol 2014;592(8):1887-901 (PMID 24492839, DOI 10.1113/jphysiol.2013.267419, PMCID PMC4001759)",
           "curl NCBI E-utilities efetch db=pubmed retmode=xml", "RAW_BYTES", "PARTIAL_EXCERPT", "application/xml", "API", published_at="2014-02-03T00:00:00Z",
           request_uri="https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=24492839&retmode=xml", note="Byte-identical to the research-stage capture.")
BT = Snap("snap-btsa", "hu:snapshot:btsa-vitamin-e-sport-performance-2026-10-08", os.path.join(D, "btsa-vitamin-e-sport.md"), "https://www.btsa.com/en/vitamin-e-sport-performance",
          "Vitamin E for athletes: recovery, performance and dosage - BTSA (manufacturer article)", "tavily-extract/cli-0.1.5 (raw_content markdown)", "EXTRACTED_TEXT_BYTES", "COMPLETE", "text/markdown", "WEB_PAGE",
          note="Found with tvly search (2026-10-08); BTSA is a natural vitamin E manufacturer. Contains a cp1252 apostrophe byte (U+0092) in places; quotes avoid those spans.")
SNAPS = [PA, PB2, BT]
L = {}


def loc(ref, snap, quote, **kw):
    L[ref] = Loc(ref, f"hu:locator:d5-antiox-{ref}", snap, quote, **kw)


loc("l01-dose", PA, "a combination of vitamin C (1000 mg/day) and vitamin E (400 IU/day)", section="Abstract")
loc("l02-population", PA, "previously untrained (n = 19) and pretrained (n = 20) healthy young men", section="Abstract")
loc("l03-gir-measure", PA, "insulin sensitivity as measured by glucose infusion rates (GIR) during a hyperinsulinemic, euglycemic clamp", section="Abstract")
loc("l04-duration", PA, "a 4 week intervention of physical exercise", section="Abstract")
loc("l05-result", PA, "Exercise increased parameters of insulin sensitivity (GIR and plasma adiponectin) only in the absence of antioxidants", section="Abstract")
loc("l06-conclusion", PA, "Supplementation with antioxidants may preclude these health-promoting effects of exercise in humans.", section="Abstract")
loc("l07-widely-used", PA, "Antioxidants are widely used as supplements but whether they affect the health-promoting effects of exercise is unknown.", section="Abstract")
loc("l08-pmid", PA, '<PMID Version="1">19433800</PMID>', kind="HTML")
loc("l09-author", PA, "<LastName>Ristow</LastName>", kind="HTML", note="first author")
loc("l11-design", PB2, "Fifty-four young men and women were randomly allocated to receive either 1000 mg of vitamin C and 235 mg of vitamin E or a placebo daily for 11 weeks.", section="Abstract")
loc("l12-mito", PB2, "Daily vitamin C and E supplementation attenuated increases in markers of mitochondrial biogenesis following endurance training.", section="Abstract")
loc("l13-vo2max", PB2, "However, no clear interactions were detected for improvements in VO2 max and running performance.", section="Abstract")
loc("l14-caution", PB2, "we advocate caution when considering antioxidant supplementation combined with endurance exercise.", section="Abstract")
loc("l15-vo2-measure", PB2, "Maximal oxygen uptake (VO2 max ), submaximal running and a 20 m shuttle run test were assessed", section="Abstract")
loc("l16-pmid", PB2, '<PMID Version="1">24492839</PMID>', kind="HTML")
loc("l17-author", PB2, "<LastName>Paulsen</LastName>", kind="HTML", note="first author")
loc("l18-rct", PB2, '<PublicationType UI="D016449">Randomized Controlled Trial', kind="HTML")
loc("l21-btsa-recommend", BT, "Therefore, **antioxidant supplements** are recommended in stressful situations to prevent free radical damage.")
loc("l22-btsa-recovery", BT, "How vitamin E supports muscle recovery and reduces oxidative stress")
loc("l23-btsa-title", BT, "# Vitamin E in sports performance for athletic excellence")
loc("l24-btsa-context", BT, "One of the essential side effects caused by moderate to high-intensity and short-duration physical activities is the increase of oxidative stress in skeletal muscle.")

REG = {"uid": "hu:intervention:vitamin-c-plus-vitamin-e-supplementation", "type": "D5.Intervention"}
GEN = {"uid": "hu:intervention:antioxidant-supplementation", "type": "D5.Intervention"}
EXT = {"uid": "hu:intervention:physical-exercise-training", "type": "D5.Intervention"}
END = {"uid": "hu:intervention:endurance-training", "type": "D5.Intervention"}
TGC = {"uid": "hu:target:glycemic-control", "type": "D5.Target"}
TEN = {"uid": "hu:target:endurance", "type": "D5.Target"}
TREC = {"uid": "hu:target:recovery", "type": "D5.Target"}
GIR = {"uid": "hu:metric:glucose-infusion-rate-euglycemic-clamp", "type": "D4.Metric"}
ADI = {"uid": "hu:biomarker:adiponectin-plasma", "type": "D4.Biomarker"}
VO2 = {"uid": "hu:metric:vo2max", "type": "D4.Metric"}
RUNPERF = {"uid": "hu:outcome:endurance-running-performance", "type": "D2.Outcome"}
POPA = "hu:study-population:pmid19433800-healthy-young-men"
POPB = "hu:study-population:pmid24492839-young-men-and-women"
RISTOW = {"uid": "hu:person:michael-ristow", "type": "D7.Person"}
PAULSEN = {"uid": "hu:person:goran-paulsen", "type": "D7.Person"}
BTSA = {"uid": "hu:org:btsa", "type": "D7.Organization"}
CLAIM = {"uid": "hu:claim:antioxidant-supplements-support-recovery-from-intense-exercise", "type": "K.Claim"}

UC = {}


def uc(ref, subject, scope, summary, extra):
    key, h = use_constraint("INTERACTION", subject, [scope])
    UC[ref] = {"ref": ref, "uid": f"hu:use-constraint:{h[7:23]}", "type": "D5.UseConstraint", "constraintKind": "INTERACTION", "identityKey": key, "identityKeyHash": h,
               "identityKeyVersion": UCK, "summary": summary, **extra}
    # exposureChange is per asserter (qualifier exposureChange:ANTAGONIZES_EFFECT on x03 / x05), never a constraint property (adversarial review)


uc("uc-cplus-e-with-exercise", REG["uid"], EXT["uid"], "vitamin C + E supplementation together with physical exercise training", {})
uc("uc-cplus-e-with-endurance", REG["uid"], END["uid"], "vitamin C + E supplementation together with endurance training", {})

A = []


def asrt(id_, predicate, subject, obj, asserter, locs, qualifiers, value=None, kind="RELATIONSHIP", polarity="POSITIVE", speech="STATES", basis="DIRECT_MEASUREMENT",
         validity=None, resolves=None, proposition=None, note=None, extra=None):
    a = {"id": id_, "uid": f"hu:assertion:d5-antiox-{id_}", "predicate": predicate, "assertionKind": kind, "subject": subject, "object": obj, "asserter": asserter,
         "locators": list(locs), "qualifiers": qualifiers, "valueString": value, "polarity": polarity, "speechAct": speech, "basisKind": basis, "proposition": proposition,
         "validity": validity, "status": "PROPOSED", "recordedAt": "<service-assigned at apply>", "resolvesToConstraint": resolves, "producedBy": PB, "note": note}
    if extra:
        a.update(extra)
    A.append({k: v for k, v in a.items() if v is not None})


VA = {"validFrom": "2009-05-11T00:00:00Z", "validFromPrecision": "DAY", "validFromBasis": "PUBLICATION_PROXY"}
VB = {"validFrom": "2014-02-03T00:00:00Z", "validFromPrecision": "DAY", "validFromBasis": "PUBLICATION_PROXY"}
QA = [f"population:{POPA}", f"coExposure:{EXT['uid']}", "dose:vitamin C 1000 mg/day + vitamin E 400 IU/day", "duration:P4W"]
QB = [f"population:{POPB}", f"coExposure:{END['uid']}", "dose:vitamin C 1000 mg + vitamin E 235 mg daily", "duration:P11W"]
asrt("x01-worsens-glycemic-gir", "WORSENS_TARGET", REG, TGC, RISTOW, ["l05-result", "l03-gir-measure", "l01-dose", "l02-population", "l04-duration", "l09-author"],
     QA + [f"outcomeUid:{GIR['uid']}"], validity=VA,
     proposition="With physical exercise, vitamin C + E supplementation prevented the exercise-induced increase in insulin sensitivity measured by GIR (increase seen only without antioxidants).",
     note="Direction is relative to exercise without antioxidants (co-exposure qualifier); not a claim that the regimen alone lowers insulin sensitivity.")
asrt("x02-worsens-glycemic-adiponectin", "WORSENS_TARGET", REG, TGC, RISTOW, ["l05-result", "l01-dose", "l02-population", "l09-author"],
     QA + [f"outcomeUid:{ADI['uid']}"], validity=VA,
     proposition="With physical exercise, vitamin C + E supplementation prevented the exercise-induced increase in plasma adiponectin.")
asrt("x03-interacts-exercise", "INTERACTS_WITH", REG, EXT, RISTOW, ["l06-conclusion", "l05-result"], [f"population:{POPA}", "exposureChange:ANTAGONIZES_EFFECT"],
     speech="SPECULATES", basis="INFERRED_FROM_MEASUREMENT", validity=VA, resolves=UC["uc-cplus-e-with-exercise"]["uid"],
     proposition="Supplementation with antioxidants may preclude the health-promoting effects of exercise.", note="No directive level stated by the source: valueString absent (never inferred).")
asrt("x04-mixed-endurance", "MIXED_EFFECT_ON_TARGET", REG, TEN, PAULSEN, ["l12-mito", "l13-vo2max", "l11-design", "l18-rct", "l17-author"],
     QB + [f"outcomeUid:{VO2['uid']}", "outcomeText:markers of mitochondrial biogenesis (COX4, PGC-1alpha)"], polarity="MIXED", validity=VB,
     proposition="Vitamin C + E attenuated training-induced increases in mitochondrial-biogenesis markers, while no clear interactions were detected for VO2max and running-performance improvements.",
     note="Per-outcome directions differ (cellular markers attenuated; performance not different): MIXED, never NO_EFFECT_ON_TARGET.")
asrt("x05-interacts-endurance-caution", "INTERACTS_WITH", REG, END, PAULSEN, ["l14-caution", "l12-mito"], [f"population:{POPB}", "exposureChange:ANTAGONIZES_EFFECT"],
     value="USE_WITH_CAUTION", speech="RECOMMENDS", basis="INFERRED_FROM_MEASUREMENT", validity=VB, resolves=UC["uc-cplus-e-with-endurance"]["uid"],
     proposition="The authors advocate caution when considering antioxidant supplementation combined with endurance exercise.")
asrt("x06-claim-btsa-recovery", "IMPROVES_TARGET", GEN, TREC, BTSA, ["l22-btsa-recovery", "l21-btsa-recommend", "l24-btsa-context", "l23-btsa-title"],
     ["population:ATHLETES", "claimClass:STRUCTURE_FUNCTION"], kind="CLAIM", speech="RECOMMENDS", basis="MANUFACTURER_CLAIM",
     validity={"validFrom": None, "validFromBasis": "OBSERVATION_ONLY"},
     proposition="Antioxidant supplements (vitamin E) support muscle recovery and are recommended in high-intensity exercise to prevent free radical damage.",
     extra={"claimType": "RECOMMENDATION", "occurrenceOf": CLAIM["uid"]},
     note="Claim occurrence (kernel: Assertion assertionKind CLAIM, extra label ClaimOccurrence, OCCURRENCE_OF -> Claim). claimClass is D5's reading of the wording.")

ASSESS = [
    {"uid": "hu:assessment:d5-antiox-glycemic-control", "assessmentKind": "EVIDENCE_SYNTHESIS", "assessmentSubkind": "D5.target-effect", "status": "PROPOSED",
     "methodVersion": "d5-target-effect/0 (fixture)", "about": [REG["uid"], TGC["uid"]], "effectDirection": "HARM", "inputAssertions": [A[0]["uid"], A[1]["uid"]],
     "evidence": [L["l05-result"].uid], "evidenceCutoffAt": "2026-10-08T00:00:00Z",
     "summary": "One controlled clinical trial (PubMed publication type) in previously untrained (n = 19) and pretrained (n = 20) healthy young men, 4 weeks of exercise: insulin-sensitivity gains (GIR, adiponectin) occurred only without vitamin C + E.",
     "rationale": "Single study; direction is relative to exercise alone (co-exposure). Not pooled with the endurance-target study.",
     "producedBy": {"missionId": MISSION, "runId": f"run:ft-D5-{FIX}-assessment"}},
    {"uid": "hu:assessment:d5-antiox-endurance", "assessmentKind": "EVIDENCE_SYNTHESIS", "assessmentSubkind": "D5.target-effect", "status": "PROPOSED",
     "methodVersion": "d5-target-effect/0 (fixture)", "about": [REG["uid"], TEN["uid"]], "effectDirection": "MIXED", "inputAssertions": [A[3]["uid"]],
     "evidence": [L["l12-mito"].uid, L["l13-vo2max"].uid], "evidenceCutoffAt": "2026-10-08T00:00:00Z",
     "summary": "One double-blind randomised controlled trial, 54 young men and women, 11 weeks: mitochondrial-biogenesis markers attenuated; VO2max and running-performance improvements not different between groups.",
     "producedBy": {"missionId": MISSION, "runId": f"run:ft-D5-{FIX}-assessment"}}
]
# Kernel claim lifecycle (00-DIRECTIVE 3.4; K 09 "Claim lifecycle"): VETTING Assessment (disposition RESEARCH) -> EVIDENCE_MISSION
# Activity that ASSESSES the Claim -> EVIDENCE_REPORT Report that ASSESSES it with the verification.v1 lattice verdict.
# Fixture records: they show the shape and the citations; no Mission Control run actually took place (ids are fixture ids).
VET_ACT = {"uid": "hu:activity:ft-d5-antiox-claim-vetting", "activityKind": "VETTING", "externalRunSystem": "mission-control", "missionId": MISSION, "runId": f"run:ft-D5-{FIX}-vetting"}
MISSION_ACT = {"uid": "hu:activity:ft-d5-antiox-evidence-mission", "activityKind": "EVIDENCE_MISSION", "externalRunSystem": "mission-control", "missionId": "mission:ft-D5-antiox-claim-test",
               "runId": f"run:ft-D5-{FIX}-evidence-mission", "about": [CLAIM["uid"]], "informedBy": [VET_ACT["uid"]]}
VETTING = {"uid": "hu:assessment:d5-antiox-claim-vetting", "assessmentKind": "VETTING", "status": "PROPOSED", "methodVersion": "vetting/0 (fixture)", "disposition": "RESEARCH",
           "about": [CLAIM["uid"]], "inputAssertions": [A[5]["uid"]],
           "rationale": "A manufacturer recommendation aimed at athletes that two controlled human studies in this fixture bear on: queued for an evidence mission that tries to disqualify it.",
           "generatedBy": VET_ACT["uid"]}
REPORT_SUMMARY = ("The recommendation to use antioxidant supplements around intense exercise meets two controlled human studies in which vitamin C + E blunted training adaptations "
                  "(insulin sensitivity; mitochondrial biogenesis) while performance gains were unchanged. Neither study measured 'muscle recovery' or 'free radical damage' as worded; "
                  "generic 'antioxidant supplements' vs the tested vitamin C + E regimens is an applicability gap (no EQUIVALENCE asserted).")
EVIDENCE_REPORT = {"uid": "hu:report:d5-antiox-claim-evidence-report", "reportKind": "EVIDENCE_REPORT", "status": "PROPOSED", "verdict": "MIXED_OR_CONFLICTING", "worldCorrectness": "UNKNOWN",
                   "policyVersion": "fixture-policy/0", "bodyDigest": "sha256:" + sha_text(REPORT_SUMMARY), "summaryAsBody (fixture)": REPORT_SUMMARY,
                   "about": [CLAIM["uid"]], "citesAssertions": [A[0]["uid"], A[1]["uid"], A[3]["uid"], A[4]["uid"], A[5]["uid"]],
                   "citesAssessments": ["hu:assessment:d5-antiox-glycemic-control", "hu:assessment:d5-antiox-endurance"],
                   "evidence": [L["l05-result"].uid, L["l12-mito"].uid, L["l13-vo2max"].uid, L["l22-btsa-recovery"].uid], "generatedBy": MISSION_ACT["uid"],
                   "note": "verdict is about the exact Claim it ASSESSES (its propositionHash); MIXED_OR_CONFLICTING because the cited studies show a cost on training adaptation the claim omits while not testing recovery as worded."}
CURATION = [
    {"type": "OPERATIONALIZED_BY", "class": "structural", "from": TGC["uid"], "to": GIR["uid"], "populatedBy": "tool:ks-curation", "rationaleLocator": L["l03-gir-measure"].uid},
    {"type": "OPERATIONALIZED_BY", "class": "structural", "from": TGC["uid"], "to": ADI["uid"], "populatedBy": "tool:ks-curation", "rationaleLocator": L["l05-result"].uid},
    {"type": "OPERATIONALIZED_BY", "class": "structural", "from": TEN["uid"], "to": VO2["uid"], "populatedBy": "tool:ks-curation", "rationaleLocator": L["l15-vo2-measure"].uid},
    {"type": "OPERATIONALIZED_BY", "class": "structural", "from": TEN["uid"], "to": RUNPERF["uid"], "populatedBy": "tool:ks-curation", "rationaleLocator": L["l13-vo2max"].uid,
     "memberNote": "TargetMeasure member D2.Outcome (adversarial review: first fixture edge into an Outcome)"},
]
for c in CURATION:
    c["edgeProperties"] = {"orderIndex": None, "lastWriterRunId": f"run:ft-D5-{FIX}-curation"}
    c["note"] = "curated vocabulary mapping (vocab-targets.yaml measuresSeam), not an effect claim; no Assertion"

entities = [
    {**REG, "name": "Vitamin C + vitamin E supplementation", "props": {"kind": "SUPPLEMENT_REGIMEN"}},
    {**GEN, "name": "Antioxidant supplementation (generic)", "props": {"kind": "SUPPLEMENT_REGIMEN"}},
    {**EXT, "name": "Physical exercise training", "props": {"kind": "LIFESTYLE_PRACTICE"}},
    {**END, "name": "Endurance training", "props": {"kind": "LIFESTYLE_PRACTICE"}},
    {**TGC, "name": "Glycemic control", "props": {"key": "target:glycemic-control", "parentKey": "target:cardiometabolic-health"}},
    {**TEN, "name": "Endurance", "props": {"key": "target:endurance"}},
    {**TREC, "name": "Recovery", "props": {"key": "target:recovery"}},
    {**GIR, "name": "Glucose infusion rate (hyperinsulinemic-euglycemic clamp)"}, {**ADI, "name": "Adiponectin (plasma)"}, {**VO2, "name": "VO2max"},
    {**RUNPERF, "name": "Endurance running performance", "props": {"key": "bellabs:outcome:endurance-running-performance", "outcomeKind": "FUNCTIONAL_PERFORMANCE"}},
    {"uid": POPA, "type": "D3.StudyPopulation", "name": "PMID 19433800: previously untrained (n = 19) and pretrained (n = 20) healthy young men"},
    {"uid": POPB, "type": "D3.StudyPopulation", "name": "PMID 24492839: 54 young men and women"},
    {**RISTOW, "name": "Michael Ristow (first author, PMID 19433800)"}, {**PAULSEN, "name": "Gøran Paulsen (first author, PMID 24492839)"}, {**BTSA, "name": "BTSA"},
    {**CLAIM, "name": "Antioxidant supplements support recovery from intense exercise", "props": {"claimType": "RECOMMENDATION", "propositionHash": "sha256:" + sha_text(norm("antioxidant supplementation | IMPROVES_TARGET | target:recovery | population:ATHLETES"))}},
]
os.makedirs(OUT, exist_ok=True)
dump_yaml(os.path.join(OUT, "locators.yaml"), {"fixture": FIX, "offsetBasis": OFFSET_BASIS, "note": FIXTURE_NOTE, "snapshots": [s.record() for s in SNAPS], "locators": [l.record() for l in L.values()]},
          "# Locators for fixture antioxidant-exercise-disconfirmation. Generated by scratch ft/D5/gen/gen_antiox.py from fresh captures (2026-10-08);\n# quotes re-found by exact match in the raw PubMed XML / markdown, offsets computed.")
dump_yaml(os.path.join(OUT, "assertions.yaml"), {
    "fixture": FIX, "note": FIXTURE_NOTE + " The two studies stay separate assertions and separate assessments (never collapsed into one fact).", "producedBy": PB,
    "activity": {"uid": "hu:activity:ft-d5-antioxidant-exercise-disconfirmation", "activityKind": "INGESTION", "externalRunSystem": "mission-control", "runId": PB["runId"], "missionId": MISSION, "agent": "hu:agent:a5-fixtures-stage"},
    "entities": entities, "useConstraints": list(UC.values()), "assertions": A,
    "adjudications": [{"uid": f"hu:adjudication:d5-antiox-cf-{a['id']}", "adjudicationKind": "CAPTURE_FIDELITY", "evaluates": a["uid"], "verdict": "DIRECTLY_SUPPORTED", "judgeKind": "DETERMINISTIC",
                       "methodVersion": "fixture-exact-reselect/1", "producedBy": {"missionId": MISSION, "runId": f"run:ft-D5-{FIX}-verify"}} for a in A],
    "assessments": ASSESS + [VETTING],
    "claimLifecycle (kernel, directive 3.4)": {"vettingActivity": VET_ACT, "vetting": VETTING["uid"], "evidenceMissionActivity": MISSION_ACT, "evidenceReport": EVIDENCE_REPORT},
    "edges": {"structural": CURATION,
              "derived": [{"type": "RESOLVES_TO_CONSTRAINT", "from": a["uid"], "to": a["resolvesToConstraint"], "edgeProperties": {"derivationRule": UCK, "derivedFromAssertionUids": [a["uid"]], "derivedAt": "<projection run>", "lastWriterRunId": f"run:ft-D5-{FIX}-constraint-projection"}} for a in A if a.get("resolvesToConstraint")],
              "kernel": [{"type": "OCCURRENCE_OF", "from": A[5]["uid"], "to": CLAIM["uid"]}] + [{"type": "ASSESSES", "from": s["uid"], "to": u} for s in ASSESS + [VETTING] for u in s["about"]] +
                        [{"type": "DERIVED_FROM", "from": s["uid"], "to": i} for s in ASSESS + [VETTING] for i in s.get("inputAssertions", []) + s.get("inputAssessments", [])] +
                        [{"type": "WAS_GENERATED_BY", "from": VETTING["uid"], "to": VET_ACT["uid"]},
                         {"type": "ASSESSES", "from": MISSION_ACT["uid"], "to": CLAIM["uid"]}, {"type": "WAS_INFORMED_BY", "from": MISSION_ACT["uid"], "to": VET_ACT["uid"]},
                         {"type": "ASSESSES", "from": EVIDENCE_REPORT["uid"], "to": CLAIM["uid"]}, {"type": "WAS_GENERATED_BY", "from": EVIDENCE_REPORT["uid"], "to": MISSION_ACT["uid"]}] +
                        [{"type": "DERIVED_FROM", "from": EVIDENCE_REPORT["uid"], "to": i} for i in EVIDENCE_REPORT["citesAssertions"] + EVIDENCE_REPORT["citesAssessments"]] +
                        [{"type": "HAS_EVIDENCE", "from": EVIDENCE_REPORT["uid"], "to": l_} for l_ in EVIDENCE_REPORT["evidence"]]},
}, "# Assertions, assessments and edges for fixture antioxidant-exercise-disconfirmation (kernel pattern: packets/K/09-reasoning.md).\n# Generated by scratch ft/D5/gen/gen_antiox.py. Subjects/objects typed <module>.<Type> per 10-seams.yaml; the Claim and Assessments are kernel records.")

refmap = {REG["uid"]: "regimen", GEN["uid"]: "antioxidants", EXT["uid"]: "exercise", END["uid"]: "endurance-training", TGC["uid"]: "t-glycemic", TEN["uid"]: "t-endurance", TREC["uid"]: "t-recovery",
          GIR["uid"]: "gir", ADI["uid"]: "adiponectin", VO2["uid"]: "vo2max", RUNPERF["uid"]: "running-performance", RISTOW["uid"]: "ristow", PAULSEN["uid"]: "paulsen", BTSA["uid"]: "btsa"}
subj = []
for e in entities:
    if e["uid"] in (POPA, POPB, CLAIM["uid"]):
        continue
    t = e["type"].split(".")[1]
    if t == "Target":
        subj.append({"ref": refmap[e["uid"]], "mode": "resolved", "uid": e["uid"], "nodeType": "Target"})
    else:
        subj.append({"ref": refmap[e["uid"]], "mode": "new", "nodeType": t, "name": e["name"], "properties": e.get("props", {}), "onMatch": "use_existing"})
for ref, u in UC.items():
    subj.append({"ref": ref, "mode": "new", "nodeType": "UseConstraint", "name": u["summary"], "uidSegment": u["uid"].split(":", 2)[2],
                 "properties": {k: u[k] for k in ["constraintKind", "identityKey", "identityKeyHash", "identityKeyVersion"]}, "onMatch": "use_existing"})
props = [{"proposalId": f"p-op-{refmap[c['from']]}-{refmap[c['to']]}", "kind": "edge.structural", "relationshipType": "OPERATIONALIZED_BY", "fromRef": refmap[c["from"]], "toRef": refmap[c["to"]],
          "evidence": [next(l.ref for l in L.values() if l.uid == c["rationaleLocator"])], "rationale": "curated measures mapping (tool:ks-curation)"} for c in CURATION]
for a in A:
    props.append({"proposalId": f"p-{a['id']}"[:64], "kind": "edge.assert", "relationshipType": a["predicate"], "fromRef": refmap[a["subject"]["uid"]], "toRef": refmap[a["object"]["uid"]],
                  "evidence": a["locators"], "asserterRef": refmap[a["asserter"]["uid"]],
                  "assertion": {"predicate": a["predicate"], "polarity": a["polarity"], "speechAct": a["speechAct"], "basisKind": a["basisKind"], "validity": {k: v for k, v in a["validity"].items() if v is not None}},
                  "rationale": "qualifiers=" + ";".join(a["qualifiers"]) + (f" valueString={a['valueString']}" if a.get("valueString") else "") + (" assertionKind=CLAIM occurrenceOf=" + CLAIM["uid"] if a["assertionKind"] == "CLAIM" else "") + " (OQ-D5-27)"})
srcs = [{"ref": s.ref.replace("snap-", "src-"), "source": {"canonicalUri": s.source_uri, "title": s.title, "sourceKind": s.source_kind},
         "snapshot": {"observedAt": s.observed_at or s.retrieved_at, "retrievedAt": s.retrieved_at, "contentHash": s.digest, "contentHashBasis": s.basis, "captureCompleteness": s.completeness},
         "locators": [l.intent() for l in L.values() if l.snap is s]} for s in SNAPS]
intent = {"schemaVersion": "biotech-knowledge-intent.v1", "intentId": "ft-d5-antioxidant-exercise-disconfirmation",
          "context": {"actor": {"kind": "agent", "id": "a5-fixtures-stage", "model": "claude-opus-5-5"}, "run": {"system": "mission-control", "runId": PB["runId"], "missionId": MISSION}, "activityKind": "EXTRACTION"},
          "onStale": "fail", "sources": srcs, "subjects": subj, "proposals": props,
          "notes": "Fixture intent (fixture ids). Covers capture, the curated OPERATIONALIZED_BY mappings and the six assertions. Not expressible in biotech-knowledge-intent.v1 (OQ-D5-27): Assertion qualifiers (population as a D3 StudyPopulation uid, coExposure, dose, outcomeUid), the claim occurrence's assertionKind CLAIM + OCCURRENCE_OF, the Claim node, and the kernel claim lifecycle records (VETTING Assessment, EVIDENCE_MISSION Activity, EVIDENCE_REPORT Report: written by vetting / evidence-mission runs, not an ingestion intent). D3 StudyPopulation and D4 records are referenced by uid only."}
dump_json(os.path.join(OUT, "intent.json"), intent)
dump_json(os.path.join(SCRATCH, "gen", f"summary-{FIX}.json"), {"snapshots": {s.ref: s.record() for s in SNAPS}, "uc": UC, "counts": {"locators": len(L), "assertions": len(A), "assessments": len(ASSESS) + 1, "proposals": len(props)}})
print({"locators": len(L), "assertions": len(A), "assessments": len(ASSESS), "proposals": len(props)})
