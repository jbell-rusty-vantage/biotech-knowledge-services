"""Fixture sirolimus-label-interactions-harm (kind harm; FC-02 + FC-05)."""
import glob
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *  # noqa

FIX = "sirolimus-label-interactions-harm"
OUT = os.path.join(FIXTURES, FIX)
PB = produced(FIX)
D = os.path.join(FX, "siro")
SETID = "5908cd1a-fc5a-462f-99ed-1d8983e253c9"

V22 = Snap("snap-label-v22", "hu:snapshot:openfda-label-sirolimus-set-5908cd1a-v22", os.path.join(D, "openfda-label-nda021110.json"),
           f"https://api.fda.gov/drug/label.json?search=set_id:%22{SETID}%22&limit=1",
           "Sirolimus tablets label, Mylan Pharmaceuticals Inc., NDA021110, SPL set 5908cd1a-fc5a-462f-99ed-1d8983e253c9, SPL version 22 (openFDA drug/label)",
           "curl openFDA drug/label (no key)", "RAW_BYTES", "COMPLETE", "application/json", "API", published_at="2026-03-26T00:00:00Z", is_json=True,
           note="openFDA serves only the current SPL version; sections are whole-text strings (offsets are inside the string at the JSON pointer).")
v14 = glob.glob(os.path.join(D, "v14x", "*.xml"))[0]
v15 = glob.glob(os.path.join(D, "v15x", "*.xml"))[0]
V14 = Snap("snap-spl-v14", "hu:snapshot:dailymed-spl-sirolimus-set-5908cd1a-v14", v14,
           f"https://dailymed.nlm.nih.gov/dailymed/getFile.cfm?setid={SETID}&type=zip&version=14",
           "SIROLIMUS tablet SPL, set 5908cd1a-fc5a-462f-99ed-1d8983e253c9, version 14 (effectiveTime 20191204), DailyMed archived SPL zip, XML member " + os.path.basename(v14),
           "curl DailyMed getFile.cfm?type=zip&version=14, unzip (SPL XML member)", "RAW_BYTES", "COMPLETE", "application/xml", "REGISTRY",
           published_at="2019-12-04T00:00:00Z", retrieved_from=os.path.join(D, "v14.zip"), note="zip sha256 " + sha_file(os.path.join(D, "v14.zip")) + "; contentHash is of the SPL XML member. COMPLETE capture: supports the absence claim 'no cannabidiol text in v14'.")
V15 = Snap("snap-spl-v15", "hu:snapshot:dailymed-spl-sirolimus-set-5908cd1a-v15", v15,
           f"https://dailymed.nlm.nih.gov/dailymed/getFile.cfm?setid={SETID}&type=zip&version=15",
           "SIROLIMUS tablet SPL, set 5908cd1a-fc5a-462f-99ed-1d8983e253c9, version 15 (effectiveTime 20220923), DailyMed archived SPL zip, XML member " + os.path.basename(v15),
           "curl DailyMed getFile.cfm?type=zip&version=15, unzip (SPL XML member)", "RAW_BYTES", "COMPLETE", "application/xml", "REGISTRY",
           published_at="2022-09-23T00:00:00Z", retrieved_from=os.path.join(D, "v15.zip"), note="zip sha256 " + sha_file(os.path.join(D, "v15.zip")) + "; contentHash is of the SPL XML member.")
HIST = Snap("snap-spl-history", "hu:snapshot:dailymed-spl-history-5908cd1a-2026-10-08", os.path.join(D, "dailymed-history.json"),
            f"https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/{SETID}/history.json", "DailyMed SPL version history, set 5908cd1a-fc5a-462f-99ed-1d8983e253c9",
            "curl DailyMed web services v2", "RAW_BYTES", "COMPLETE", "application/json", "API", is_json=True)
AGL = Snap("snap-agelessrx", "hu:snapshot:agelessrx-rapamycin-2026-10-08", os.path.join(D, "agelessrx-rapamycin.md"),
           "https://www.agelessrx.com/rapamycin/", "Rapamycin | AgelessRx", "tavily-extract/cli-0.1.5 (raw_content markdown)", "EXTRACTED_TEXT_BYTES", "COMPLETE", "text/markdown", "WEB_PAGE")
RN = Snap("snap-rapanews", "hu:snapshot:rapamycin-news-t86-2026-10-08", os.path.join(D, "rapanews-grapefruit.md"),
          "https://www.rapamycin.news/t/improve-bioavailability-of-rapamycin-2/86", "Improve Bioavailability of Rapamycin (2) (Rapamycin Longevity News forum)",
          "tavily-extract/cli-0.1.5 (raw_content markdown)", "EXTRACTED_TEXT_BYTES", "PARTIAL_EXCERPT", "text/markdown", "WEB_PAGE",
          note="Topic page markdown; first post only plus part of the thread (273 posts). Post author and edit dates are not in the markdown: see snap-rapanews-api.")
RNJ = Snap("snap-rapanews-api", "hu:snapshot:rapamycin-news-t86-json-2026-10-08", os.path.join(D, "rapanews-86.json"),
           "https://www.rapamycin.news/t/86.json", "Discourse topic JSON for t/86 (first page of posts)", "curl Discourse topic JSON", "RAW_BYTES", "PARTIAL_EXCERPT", "application/json", "API", is_json=True)
SNAPS = [V22, V14, V15, HIST, AGL, RN, RNJ]

L = {}


def loc(ref, snap, quote, **kw):
    L[ref] = Loc(ref, f"hu:locator:d5-siro-{ref}", snap, quote, **kw)


DI = "/results/0/drug_interactions/0"
loc("l01-v22-version", V22, "22", pointer="/results/0/version", kind="JSON_POINTER")
loc("l02-v22-effective", V22, "20260326", pointer="/results/0/effective_time", kind="JSON_POINTER")
loc("l03-v22-labeler", V22, "Mylan Pharmaceuticals Inc.", pointer="/results/0/openfda/manufacturer_name/0", kind="JSON_POINTER")
loc("l04-v22-grapefruit", V22, "Because grapefruit juice inhibits the CYP3A4-mediated metabolism of sirolimus, it must not be taken with sirolimus", pointer=DI, kind="JSON_POINTER", section="7.3 Grapefruit Juice")
loc("l05-v22-modulators-caution", V22, "Exercise caution when using sirolimus with drugs or agents that are modulators of CYP3A4 and P-gp.", pointer=DI, kind="JSON_POINTER", section="7.4 Weak and Moderate Inducers or Inhibitors of CYP3A4 and P-gp")
loc("l06-v22-sjw", V22, "Drugs and other agents that could decrease sirolimus concentrations: Carbamazepine, phenobarbital, phenytoin, rifapentine, St. John's Wort ( Hypericum perforatum )", pointer=DI, kind="JSON_POINTER", section="7.4")
loc("l07-v22-cbd-increase", V22, "The blood levels of sirolimus may increase upon concomitant use with cannabidiol.", pointer=DI, kind="JSON_POINTER", section="7.5 Cannabidiol")
loc("l08-v22-cbd-monitor", V22, "When cannabidiol and sirolimus are co-administered, closely monitor for an increase in sirolimus blood levels and for adverse reactions suggestive of sirolimus toxicity.", pointer=DI, kind="JSON_POINTER", section="7.5 Cannabidiol")
loc("l09-v22-cbd-dose", V22, "A dose reduction of sirolimus should be considered as needed when sirolimus is co-administered with cannabidiol", pointer=DI, kind="JSON_POINTER", section="7.5 Cannabidiol")
loc("l10-v22-contraindication", V22, "Sirolimus is contraindicated in patients with a hypersensitivity to sirolimus", pointer="/results/0/contraindications/0", kind="JSON_POINTER", section="4 CONTRAINDICATIONS")
loc("l11-v22-boxed", V22, "Increased susceptibility to infection and the possible development of lymphoma and other malignancies may result from immunosuppression", pointer="/results/0/boxed_warning/0", kind="JSON_POINTER", section="BOXED WARNING")
loc("l12-v22-indication", V22, "indicated for the prophylaxis of organ rejection in patients aged ≥13 years receiving renal transplants", pointer="/results/0/indications_and_usage/0", kind="JSON_POINTER", section="1 INDICATIONS AND USAGE")
loc("l13-v22-overdose", V22, "Reports of overdose with sirolimus have been received; however, experience has been limited.", pointer="/results/0/overdosage/0", kind="JSON_POINTER", section="10 OVERDOSAGE")
loc("l21-v14-grapefruit", V14, "Because grapefruit juice inhibits the CYP3A4-mediated metabolism of sirolimus, it must not be taken with sirolimus", section="7.3 Grapefruit Juice")
loc("l22-v14-version", V14, '<versionNumber value="14"/>', kind="HTML")
loc("l23-v14-effective", V14, '<effectiveTime value="20191204"', kind="HTML", note="first effectiveTime element = document effective time")
loc("l24-v14-author", V14, "<name>Greenstone LLC</name>", kind="HTML", note="SPL author (labeler of record) of version 14")
loc("l31-v15-cbd-monitor", V15, "When cannabidiol and sirolimus are co-administered, closely monitor for an increase in sirolimus", section="5.21 Cannabidiol Drug Interactions / 7.5")
loc("l32-v15-version", V15, '<versionNumber value="15"/>', kind="HTML")
loc("l33-v15-effective", V15, '<effectiveTime value="20220923"', kind="HTML")
loc("l34-v15-author", V15, "<name>Greenstone LLC</name>", kind="HTML")
loc("l41-hist-v15", HIST, "Oct 04, 2022", pointer="/data/history/7/published_date", kind="JSON_POINTER", note="DailyMed publication date of version 15 (history[7].spl_version = 15)")
loc("l42-hist-v14", HIST, "Dec 05, 2019", pointer="/data/history/8/published_date", kind="JSON_POINTER", note="history[8].spl_version = 14")
loc("l43-hist-v22", HIST, "Mar 26, 2026", pointer="/data/history/0/published_date", kind="JSON_POINTER", note="history[0].spl_version = 22")
loc("l51-agl-mechanism", AGL, "As a substrate for p-glycoprotein and cytochrome P-450 3A4, Rapamycin may have certain interactions with other drugs or supplements that act on these proteins.")
loc("l52-agl-list", AGL, "These include cyclosporine, rifampin, ketoconazole, cidofovir, ritonavir, mifepristone, posaconazole, fluconazole, and grapefruit juice.")
loc("l53-agl-consult", AGL, "talk to your healthcare provider about any medications you are currently taking.")
loc("l61-rn-warning", RN, "be extremely careful with the information below, and be sure to consult your doctor.")
loc("l62-rn-boost", RN, "Taking rapamycin with grapefruit juice can dramatically increase the “effective dose” by a factor of 3X to 7X or higher.")
loc("l63-rn-disclaimer", RN, "This is not a recommended protocol for people, but is only offered here for informational purposes.")
loc("l64-rn-practice", RN, "If instead you take your rapamycin with grapefruit juice (an 8oz glass) and you want the same effective dose")
loc("l71-rnj-username", RNJ, "RapAdmin", pointer="/post_stream/posts/0/username", kind="JSON_POINTER")
loc("l72-rnj-updated", RNJ, json_pointer(RNJ.doc, "/post_stream/posts/0/updated_at"), pointer="/post_stream/posts/0/updated_at", kind="JSON_POINTER", note="last edit of post 1 (post version " + str(json_pointer(RNJ.doc, "/post_stream/posts/0/version")) + ")")
loc("l73-rnj-created", RNJ, json_pointer(RNJ.doc, "/post_stream/posts/0/created_at"), pointer="/post_stream/posts/0/created_at", kind="JSON_POINTER")
assert json_pointer(HIST.doc, "/data/history/7/spl_version") == 15 and json_pointer(HIST.doc, "/data/history/8/spl_version") == 14
ABSENT_CBD_V14 = V14.text.lower().count("cannabidiol")
assert ABSENT_CBD_V14 == 0
L["l04-v22-grapefruit"].reanchors, L["l04-v22-grapefruit"].reanchor_match = L["l21-v14-grapefruit"].uid, "EXACT"
L["l08-v22-cbd-monitor"].reanchors, L["l08-v22-cbd-monitor"].reanchor_match = L["l31-v15-cbd-monitor"].uid, "EXACT (prefix)"

SIRO = {"uid": "hu:substance:sirolimus", "type": "D1.ChemicalSubstance"}
GFJ = {"uid": "hu:food:grapefruit-juice", "type": "D12.FoodItem"}
SJW = {"uid": "hu:material:st-johns-wort-hypericum-perforatum", "type": "D1.IngredientMaterial"}
CBD = {"uid": "hu:substance:cannabidiol", "type": "D1.ChemicalSubstance"}
HYP = {"uid": "hu:condition:hypersensitivity-to-sirolimus", "type": "D2.Condition"}
INF = {"uid": "hu:condition:infection", "type": "D2.Condition"}
LYM = {"uid": "hu:condition:lymphoma-and-other-malignancies", "type": "D2.Condition"}
MYLAN = {"uid": "hu:org:mylan-pharmaceuticals", "type": "D7.Organization"}
GREEN = {"uid": "hu:org:greenstone", "type": "D7.Organization"}
AGELESS = {"uid": "hu:org:agelessrx", "type": "D7.Organization"}
RAPADMIN = {"uid": "hu:person:rapamycin-news-rapadmin", "type": "D7.Person"}
NAMES = {SIRO["uid"]: "Sirolimus (rapamycin)", GFJ["uid"]: "Grapefruit juice", SJW["uid"]: "St. John's wort (Hypericum perforatum)", CBD["uid"]: "Cannabidiol",
         HYP["uid"]: "Hypersensitivity to sirolimus", INF["uid"]: "Infection (increased susceptibility)", LYM["uid"]: "Lymphoma and other malignancies",
         MYLAN["uid"]: "Mylan Pharmaceuticals Inc.", GREEN["uid"]: "Greenstone LLC", AGELESS["uid"]: "AgelessRx",
         RAPADMIN["uid"]: "RapAdmin (pseudonymous forum administrator handle; D9 owns handle-to-speaker resolution)"}

UC = {}


def uc(ref, kind, subject, scope=(), pops=(), summary=None, extra=None):
    key, h = use_constraint(kind, subject, scope, pops)
    UC[ref] = {k: v for k, v in {"ref": ref, "uid": f"hu:use-constraint:{h[7:23]}", "type": "D5.UseConstraint", "constraintKind": kind,
                                  "identityKey": key, "identityKeyHash": h, "identityKeyVersion": UCK,
                                  "scopePopulations": list(pops) or None, "summary": summary, **(extra or {})}.items() if v is not None}


uc("uc-gfj", "INTERACTION", SIRO["uid"], [GFJ["uid"]], summary="sirolimus together with grapefruit juice")
uc("uc-sjw", "INTERACTION", SIRO["uid"], [SJW["uid"]], summary="sirolimus together with St. John's wort")
uc("uc-cbd", "INTERACTION", SIRO["uid"], [CBD["uid"]], summary="sirolimus together with cannabidiol")
uc("uc-hypersens", "CONDITION", SIRO["uid"], [HYP["uid"]], summary="sirolimus in hypersensitivity to sirolimus")

A = []


def asrt(id_, predicate, subject, obj, asserter, locs, qualifiers, value=None, kind="RELATIONSHIP", polarity="POSITIVE", speech="STATES",
         basis="UNSTATED", validity=None, resolves=None, proposition=None, note=None, status="PROPOSED", extra=None):
    a = {"id": id_, "uid": f"hu:assertion:d5-siro-{id_}", "predicate": predicate, "assertionKind": kind, "subject": subject, "object": obj,
         "asserter": asserter, "locators": list(locs), "qualifiers": qualifiers, "valueString": value, "polarity": polarity, "speechAct": speech,
         "basisKind": basis, "proposition": proposition, "validity": validity, "status": status, "recordedAt": "<service-assigned at apply>",
         "resolvesToConstraint": resolves, "producedBy": PB, "note": note}
    if extra:
        a.update(extra)
    A.append({k: v for k, v in a.items() if v is not None})


def vday(d, basis="STATED_BY_SOURCE", to=None, to_basis=None):
    v = {"validFrom": f"{d}T00:00:00Z", "validFromPrecision": "DAY", "validFromBasis": basis}
    if to:
        v.update({"validTo": f"{to}T00:00:00Z", "validToPrecision": "DAY", "validToBasis": to_basis or "STATED_BY_SOURCE"})
    return v


LABEL_Q = ["population:UNSPECIFIED", "section:DRUG_INTERACTIONS"]
asrt("r00-v14-grapefruit", "INTERACTS_WITH", SIRO, GFJ, GREEN, ["l21-v14-grapefruit", "l22-v14-version", "l23-v14-effective", "l24-v14-author"],
     LABEL_Q + ["exposureChange:INCREASES_EXPOSURE", "mechanism:CYP3A4"], value="AVOID", speech="CAUTIONS", basis="CITED_FROM_PRIOR_WORK",
     validity=vday("2019-12-04"), resolves=UC["uc-gfj"]["uid"], status="SUPERSEDED",
     proposition="Grapefruit juice must not be taken with sirolimus (it inhibits CYP3A4-mediated metabolism of sirolimus).",
     extra={"recordedTo": "= recordedAt of r01-v22-grapefruit (written once on supersession)"},
     note="Label version 14 (effectiveTime 20191204), labeler of record Greenstone LLC. Superseded in recorded time by r01 (same proposition, version 22); drops out of RESOLVES_TO_CONSTRAINT as-of queries after recordedTo.")
asrt("r01-v22-grapefruit", "INTERACTS_WITH", SIRO, GFJ, MYLAN, ["l04-v22-grapefruit", "l01-v22-version", "l02-v22-effective", "l03-v22-labeler"],
     LABEL_Q + ["exposureChange:INCREASES_EXPOSURE", "mechanism:CYP3A4"], value="AVOID", speech="CAUTIONS", basis="CITED_FROM_PRIOR_WORK",
     validity=vday("2026-03-26"), resolves=UC["uc-gfj"]["uid"], extra={"supersedesUid": "hu:assertion:d5-siro-r00-v14-grapefruit"},
     proposition="Grapefruit juice must not be taken with sirolimus (it inhibits CYP3A4-mediated metabolism of sirolimus).",
     note="'must not be taken with' is recorded as AVOID (section 7, not section 4 CONTRAINDICATIONS); the label's own words stay in the locator.")
asrt("r02-v22-sjw", "INTERACTS_WITH", SIRO, SJW, MYLAN, ["l06-v22-sjw", "l05-v22-modulators-caution", "l01-v22-version"],
     LABEL_Q + ["exposureChange:DECREASES_EXPOSURE", "mechanism:CYP3A4/P-gp modulation"], value="USE_WITH_CAUTION", speech="CAUTIONS",
     validity=vday("2026-03-26"), resolves=UC["uc-sjw"]["uid"], proposition="St. John's Wort could decrease sirolimus concentrations; exercise caution with modulators of CYP3A4 and P-gp.")
asrt("r03-v15-cbd-monitor", "INTERACTS_WITH", SIRO, CBD, GREEN, ["l31-v15-cbd-monitor", "l32-v15-version", "l33-v15-effective", "l34-v15-author", "l41-hist-v15"],
     LABEL_Q + ["exposureChange:INCREASES_EXPOSURE"], value="MONITOR", speech="CAUTIONS", validity=vday("2022-09-23"), resolves=UC["uc-cbd"]["uid"], status="SUPERSEDED",
     extra={"recordedTo": "= recordedAt of r04-v22-cbd-monitor"},
     proposition="When cannabidiol and sirolimus are co-administered, closely monitor for an increase in sirolimus blood levels.",
     note="First label version (15, effectiveTime 20220923) carrying the cannabidiol interaction; version 14 (COMPLETE capture) contains no 'cannabidiol' text (0 matches).")
asrt("r04-v22-cbd-monitor", "INTERACTS_WITH", SIRO, CBD, MYLAN, ["l07-v22-cbd-increase", "l08-v22-cbd-monitor", "l01-v22-version"],
     LABEL_Q + ["exposureChange:INCREASES_EXPOSURE"], value="MONITOR", speech="CAUTIONS", validity=vday("2026-03-26"), resolves=UC["uc-cbd"]["uid"],
     extra={"supersedesUid": "hu:assertion:d5-siro-r03-v15-cbd-monitor"},
     proposition="Sirolimus blood levels may increase with cannabidiol; closely monitor sirolimus levels and toxicity when co-administered.")
asrt("r05-v22-cbd-dose", "INTERACTS_WITH", SIRO, CBD, MYLAN, ["l09-v22-cbd-dose", "l01-v22-version"],
     LABEL_Q + ["exposureChange:INCREASES_EXPOSURE"], value="ADJUST_DOSE", speech="RECOMMENDS", validity=vday("2026-03-26"), resolves=UC["uc-cbd"]["uid"],
     proposition="A dose reduction of sirolimus should be considered as needed when co-administered with cannabidiol.",
     note="Second directive of the same source on the same pair: two assertions, one UseConstraint (levels per statement, never on the constraint).")
asrt("r06-v22-contraindicated", "USE_CONSTRAINED_IN", SIRO, HYP, MYLAN, ["l10-v22-contraindication", "l01-v22-version"],
     ["population:UNSPECIFIED", "section:CONTRAINDICATIONS"], value="CONTRAINDICATED", speech="CAUTIONS", validity=vday("2026-03-26"), resolves=UC["uc-hypersens"]["uid"],
     proposition="Sirolimus is contraindicated in patients with a hypersensitivity to sirolimus.", note="The only formal contraindication; the interaction harms live in section 7.")
for rid, cond in [("r07-v22-infection", INF), ("r08-v22-lymphoma", LYM)]:
    asrt(rid, "CAUSES_ADVERSE_EFFECT", SIRO, cond, MYLAN, ["l11-v22-boxed", "l12-v22-indication", "l01-v22-version"],
         ["population:IMMUNOSUPPRESSED", "section:BOXED_WARNING", "sourceKind:LABEL", "context:THERAPEUTIC", "severity:LABEL_TEXT:boxed warning"],
         speech="CAUTIONS", validity=vday("2026-03-26"),
         proposition="Increased susceptibility to infection and possible lymphoma and other malignancies may result from immunosuppression.",
         note="Approved-population harm (renal-transplant prophylaxis, indication locator l12). Applicability to intermittent low-dose longevity use is a CQ-EV-04 applicability Assessment, not a property of this assertion.")
asrt("r09-agelessrx-grapefruit", "INTERACTS_WITH", SIRO, GFJ, AGELESS, ["l52-agl-list", "l51-agl-mechanism", "l53-agl-consult"],
     ["population:UNSPECIFIED", "section:WEB_PAGE", "mechanism:P-gp/CYP3A4", "exposureChange:UNKNOWN"], value="CONSULT_CLINICIAN", speech="CAUTIONS",
     validity={"validFrom": None, "validFromBasis": "OBSERVATION_ONLY"}, resolves=UC["uc-gfj"]["uid"],
     proposition="Rapamycin may interact with grapefruit juice (P-gp / CYP3A4); talk to your healthcare provider.",
     note="Clinic/telehealth asserter; states no direction of exposure change (UNKNOWN), level = its own directive.")
asrt("r10-rapanews-grapefruit", "INTERACTS_WITH", SIRO, GFJ, RAPADMIN, ["l62-rn-boost", "l61-rn-warning", "l63-rn-disclaimer", "l64-rn-practice", "l71-rnj-username", "l72-rnj-updated"],
     ["population:UNSPECIFIED", "section:FORUM_POST", "exposureChange:INCREASES_EXPOSURE", "magnitude:3X to 7X or higher", "stance:DELIBERATE_USE"],
     value="CONSULT_CLINICIAN", speech="STATES", basis="CITED_FROM_PRIOR_WORK",
     validity={"validFrom": json_pointer(RNJ.doc, "/post_stream/posts/0/updated_at")[:10] + "T00:00:00Z", "validFromPrecision": "DAY", "validFromBasis": "PUBLICATION_PROXY"},
     resolves=UC["uc-gfj"]["uid"],
     proposition="Grapefruit juice increases rapamycin's effective dose 3x-7x; presented as a cost-saving option with a consult-your-doctor warning and a not-a-recommended-protocol disclaimer.",
     note="Same interaction, opposite stance (deliberate boosting) from a community asserter: resolves to the SAME UseConstraint as the label (Q-D5-05, Q-D5-27). validFrom = last edit of post 1 (Discourse updated_at); created_at is in l73.")

ADJ = [{"uid": f"hu:adjudication:d5-siro-cf-{a['id']}", "adjudicationKind": "CAPTURE_FIDELITY", "evaluates": a["uid"], "verdict": "DIRECTLY_SUPPORTED",
        "judgeKind": "DETERMINISTIC", "methodVersion": "fixture-exact-reselect/1",
        "rationale": "every declared locator re-selected at its offsets (JSON pointer + offsets for openFDA / Discourse JSON) in bytes whose sha256 equals contentHash",
        "producedBy": {"missionId": MISSION, "runId": f"run:ft-D5-{FIX}-verify"}} for a in A]

derived = [{"type": "RESOLVES_TO_CONSTRAINT", "from": a["uid"], "to": a["resolvesToConstraint"],
            "edgeProperties": {"derivationRule": UCK, "derivedFromAssertionUids": [a["uid"]], "derivedAt": "<projection run>",
                               "lastWriterRunId": f"run:ft-D5-{FIX}-constraint-projection"},
            "asOfNote": ("excluded from as-of-now reads after the superseding assertion is recorded (recordedTo set)" if a.get("status") == "SUPERSEDED" else None)}
           for a in A if a.get("resolvesToConstraint")]
derived = [{k: v for k, v in d.items() if v is not None} for d in derived]
grouping = {u["uid"]: sorted(a["id"] for a in A if a.get("resolvesToConstraint") == u["uid"]) for u in UC.values()}

entities = [{"uid": u, "type": t, "name": NAMES[u]} for u, t in [(SIRO["uid"], SIRO["type"]), (GFJ["uid"], GFJ["type"]), (SJW["uid"], SJW["type"]), (CBD["uid"], CBD["type"]),
                                                                 (HYP["uid"], HYP["type"]), (INF["uid"], INF["type"]), (LYM["uid"], LYM["type"]), (MYLAN["uid"], MYLAN["type"]),
                                                                 (GREEN["uid"], GREEN["type"]), (AGELESS["uid"], AGELESS["type"]), (RAPADMIN["uid"], RAPADMIN["type"])]]
labelchange = {
    "question": "Q-D5-24",
    "source": "SPL set " + SETID,
    "olderVersion": {"version": 14, "effectiveTime": "2019-12-04", "snapshot": V14.uid, "cannabidiolMatches": ABSENT_CBD_V14, "captureCompleteness": "COMPLETE"},
    "firstVersionWithChange": {"version": 15, "effectiveTime": "2022-09-23", "dailyMedPublished": "Oct 04, 2022", "snapshot": V15.uid, "locator": L["l31-v15-cbd-monitor"].uid},
    "currentVersion": {"version": 22, "effectiveTime": "2026-03-26", "snapshot": V22.uid},
    "newConstraint": UC["uc-cbd"]["uid"],
    "supersessionChains": [["r03-v15-cbd-monitor", "r04-v22-cbd-monitor"], ["r00-v14-grapefruit", "r01-v22-grapefruit"]],
    "labelerOfRecordChange": "Greenstone LLC (v14, v15) -> Mylan Pharmaceuticals Inc. (v22): a D7 fact, recorded here only as the asserter of each version's assertions",
}

os.makedirs(OUT, exist_ok=True)
dump_yaml(os.path.join(OUT, "locators.yaml"), {"fixture": FIX, "offsetBasis": OFFSET_BASIS, "note": FIXTURE_NOTE,
                                              "snapshots": [s.record() for s in SNAPS], "locators": [l.record() for l in L.values()]},
          "# Locators for fixture sirolimus-label-interactions-harm. Generated by scratch ft/D5/gen/gen_siro.py from fresh captures (2026-10-08);\n# quotes re-found by exact match, offsets computed. JSON_POINTER locators carry offsets inside the string at the pointer.")
dump_yaml(os.path.join(OUT, "assertions.yaml"), {
    "fixture": FIX, "note": FIXTURE_NOTE, "producedBy": PB,
    "activity": {"uid": "hu:activity:ft-d5-sirolimus-label-interactions-harm", "activityKind": "INGESTION", "externalRunSystem": "mission-control", "runId": PB["runId"], "missionId": MISSION, "agent": "hu:agent:a5-fixtures-stage"},
    "entities": entities,
    "useConstraints": list(UC.values()),
    "assertions": A,
    "adjudications": ADJ,
    "edges": {"derived": derived, "typedD5EdgesFromSirolimus": "none: sirolimus reaches its constraints only through kernel Assertions (HAS_SUBJECT/HAS_OBJECT) and the derived RESOLVES_TO_CONSTRAINT"},
    "constraintGrouping (RESOLVES_TO_CONSTRAINT by UseConstraint uid)": grouping,
    "labelVersionChange": labelchange,
}, "# Assertions, constraints and derived edges for fixture sirolimus-label-interactions-harm (kernel pattern: packets/K/09-reasoning.md).\n# Generated by scratch ft/D5/gen/gen_siro.py. Subjects/objects typed <module>.<Type> per 10-seams.yaml.")

refmap = {SIRO["uid"]: "siro", GFJ["uid"]: "gfj", SJW["uid"]: "sjw", CBD["uid"]: "cbd", HYP["uid"]: "hyp", INF["uid"]: "inf", LYM["uid"]: "lym",
          MYLAN["uid"]: "mylan", GREEN["uid"]: "greenstone", AGELESS["uid"]: "agelessrx", RAPADMIN["uid"]: "rapadmin"}
subj = [{"ref": r, "mode": "new", "nodeType": next(e["type"] for e in entities if e["uid"] == u).split(".")[1], "name": NAMES[u], "properties": {}, "onMatch": "use_existing"} for u, r in refmap.items()]
for ref, u in UC.items():
    subj.append({"ref": ref, "mode": "new", "nodeType": "UseConstraint", "name": u["summary"], "uidSegment": u["uid"].split(":", 2)[2],
                 "properties": {k: u[k] for k in ["constraintKind", "identityKey", "identityKeyHash", "identityKeyVersion"]}, "onMatch": "use_existing"})
props = []
for a in A:
    props.append({"proposalId": f"p-{a['id']}"[:64], "kind": "edge.assert", "relationshipType": a["predicate"], "fromRef": refmap[a["subject"]["uid"]], "toRef": refmap[a["object"]["uid"]],
                  "evidence": a["locators"], "asserterRef": refmap[a["asserter"]["uid"]],
                  "assertion": {"predicate": a["predicate"], "polarity": a["polarity"], "speechAct": a["speechAct"], "basisKind": a["basisKind"], "validity": {k: v for k, v in a["validity"].items() if v is not None}},
                  "rationale": "qualifiers=" + ";".join(a["qualifiers"]) + (f" valueString={a['valueString']}" if a.get("valueString") else "") + (f" supersedesUid={a['supersedesUid']}" if a.get("supersedesUid") else "") + " (intent v1 cannot carry qualifiers/valueString/supersedesUid: OQ-D5-27)"})
srcs = []
for s in SNAPS:
    srcs.append({"ref": s.ref.replace("snap-", "src-"), "source": {"canonicalUri": s.source_uri, "title": s.title[:600], "sourceKind": s.source_kind},
                 "snapshot": {"observedAt": s.observed_at or s.retrieved_at, "retrievedAt": s.retrieved_at, "contentHash": s.digest, "contentHashBasis": s.basis, "captureCompleteness": s.completeness},
                 "locators": [l.intent() for l in L.values() if l.snap is s]})
intent = {"schemaVersion": "biotech-knowledge-intent.v1", "intentId": "ft-d5-sirolimus-label-interactions-harm",
          "context": {"actor": {"kind": "agent", "id": "a5-fixtures-stage", "model": "claude-opus-5-5"}, "run": {"system": "mission-control", "runId": PB["runId"], "missionId": MISSION}, "activityKind": "EXTRACTION"},
          "onStale": "fail", "sources": srcs, "subjects": subj, "proposals": props,
          "notes": "Fixture intent (fixture ids). The D5 safety predicates are predicate-only Assertions (05 predicateOnly), written here as edge.assert with relationshipType = predicate because biotech-knowledge-intent.v1 has no 'assertion with object node, no typed edge' proposal kind; qualifiers (population, exposureChange, section, stance), valueString (directive level) and supersedesUid travel in rationale (OQ-D5-27). RESOLVES_TO_CONSTRAINT is a projection output, not a proposal; the UseConstraint subjects are listed so the projection's targets are explicit."}
dump_json(os.path.join(OUT, "intent.json"), intent)
dump_json(os.path.join(SCRATCH, "gen", f"summary-{FIX}.json"), {"snapshots": {s.ref: s.record() for s in SNAPS}, "grouping": grouping, "uc": UC, "counts": {"locators": len(L), "assertions": len(A), "useConstraints": len(UC), "proposals": len(props)}})
print({"locators": len(L), "assertions": len(A), "useConstraints": len(UC), "proposals": len(props)})
print(grouping)
