"""Fixture pregnancy-magnesium-upper-limit (kind harm; FC-03)."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *  # noqa

FIX = "pregnancy-magnesium-upper-limit"
OUT = os.path.join(FIXTURES, FIX)
PB = produced(FIX)
D = os.path.join(FX, "mg")

BP = Snap("snap-blueprint", "hu:snapshot:blueprint-protocol-2026-10-08", os.path.join(D, "blueprint-protocol.md"), "https://protocol.bryanjohnson.com/",
          "protocol - DON'T DIE (Blueprint protocol page; Pregnancy section)", "tavily-extract/cli-0.1.5 (raw_content markdown)", "EXTRACTED_TEXT_BYTES", "COMPLETE", "text/markdown", "WEB_PAGE",
          note="Page carries no edition date (sign-off 'Planet Earth, 2026'); first observation by BellLabs = this capture.")
ODS = Snap("snap-ods", "hu:snapshot:ods-magnesium-hp-2026-10-08", os.path.join(D, "ods-magnesium-hp.md"), "https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/",
           "Magnesium - Fact Sheet for Health Professionals (NIH Office of Dietary Supplements)", "tavily-extract/cli-0.1.5 (raw_content markdown)", "EXTRACTED_TEXT_BYTES", "COMPLETE", "text/markdown", "WEB_PAGE",
           published_at="2026-01-06T00:00:00Z", note="ODS API returned HTTP 403 (Cloudflare) to curl in the research stage; Tavily extract used. Page states 'Updated: January 6, 2026'.")
SNAPS = [BP, ODS]
L = {}


def loc(ref, snap, quote, **kw):
    L[ref] = Loc(ref, f"hu:locator:d5-mg-{ref}", snap, quote, **kw)


AV = "should be **avoided** during pregnancy:"
loc("l01-protocol-title", BP, "## **Bryan’s Protocol**")
loc("l02-signature", BP, "Don’t Die,Bryan Johnson")
loc("l03-pregnancy-heading", BP, "**If pregnant and on the stack.. What do you do:**")
loc("l04-consult", BP, "However, we suggest you consult your doctor before use if pregnant or breastfeeding:")
loc("l05-avoid-header", BP, "The following supplements included in the Blueprint stack should be **avoided** during pregnancy:")
loc("l06-avoid-list", BP, "Longevity Mix, Ashwagandha, Curcumin, Red Yeast Rice, Nicotinamide Riboside, CA-AKG, Glucosamine Sulfate, Creatine, Sodium Hyaluronate, N-Acetyl-Cysteine.")
loc("l07-add-header", BP, "3. Consider **adding** the following supplements:")
loc("l08-magnesium", BP, "2. Magnesium 500-600 mg daily.")
loc("l09-iron", BP, "3. Iron 30 mg daily.", after="3. Consider **adding**")
loc("l10-calcium", BP, "4. Calcium 1200 mg daily.", after="3. Consider **adding**")
CONSULT_ANCHOR = "consult your doctor before use"
NUTR = "4. Nutritional recommendations:"
loc("l11-prenatal", BP, "Prenatal Vitamin with adequate methylated B vitamins (at least 600 mcg Methylfolate, 2.5 mcg methylcobalamin).", after="3. Consider **adding**")
loc("l12-omega3", BP, "Omega 3 Fatty Acids DHA/EPA 1000-2000 mg daily", after="3. Consider **adding**", note="item continues '(Low metal source, Blueprint DHA/EPA out in Q1 2025) .' (product availability note, not modeled)")
loc("l13-nutrition-header", BP, NUTR)
loc("l14-protein", BP, "Balanced diet with at least 100 g of protein daily.", after=NUTR)
loc("l15-sugars-foods", BP, "Avoid processed sugars and foods to reduce gestational diabetes risk.", after=NUTR)
loc("l16-fiber", BP, "Consume at least 30 g of fiber daily.", after=NUTR)
loc("l17-foods-avoid", BP, "Avoid raw meat, processed meat, unpasteurized cheeses, and high mercury fish.", after=NUTR)
loc("l18-alcohol", BP, "Avoid alcohol", after=NUTR, note="first clause of item 4.5")
loc("l19-caffeine", BP, "limit caffeine to 200 mg daily", after=NUTR, note="second clause of item 4.5")
loc("l20-exercise-header", BP, "5. Exercise Recommendations:")
loc("l21-moderate-exercise", BP, "Aim for at least 150 minutes of moderate-intensity exercise per week.", after="5. Exercise Recommendations:")
loc("l22-strength", BP, "Strength training at least 90 minutes per week.", after="5. Exercise Recommendations:")
loc("l23-pelvic-floor", BP, "Consider adding in pelvic floor exercises.", after="5. Exercise Recommendations:")
CONSULT_ITEMS = [
    ("longevity-protein", "Longevity Protein", {"uid": "hu:product:blueprint-longevity-protein", "type": "D6.Product"}),
    ("blueberry-nut-mix", "Blueberry Nut Mix", {"uid": "hu:product:blueprint-blueberry-nut-mix", "type": "D6.Product"}),
    ("evoo", "EVOO", {"uid": "hu:product:blueprint-extra-virgin-olive-oil", "type": "D6.Product"}),
    ("protein-powders", "Protein powders", None),
    ("collagen", "Collagen", {"uid": "hu:product:blueprint-collagen-peptides", "type": "D6.Product"}),
]
for slug, word, _ in CONSULT_ITEMS:
    loc(f"l0c-consult-{slug}", BP, word, after=CONSULT_ANCHOR, note="item of the consult list (1.1-1.5)")
FOOD_AVOID = [
    ("processed-sugars", "processed sugars", "l15-sugars-foods", {"uid": "hu:food-category:processed-sugars", "type": "D12.FoodCategory"}, "Processed sugars"),
    ("processed-foods", "Avoid processed sugars and foods to reduce gestational diabetes risk.", "l15-sugars-foods", {"uid": "hu:food-category:processed-foods", "type": "D12.FoodCategory"}, "Processed foods"),
    ("raw-meat", "raw meat", "l17-foods-avoid", {"uid": "hu:food-category:raw-meat", "type": "D12.FoodCategory"}, "Raw meat"),
    ("processed-meat", "processed meat", "l17-foods-avoid", {"uid": "hu:food-category:processed-meat", "type": "D12.FoodCategory"}, "Processed meat"),
    ("unpasteurized-cheeses", "unpasteurized cheeses", "l17-foods-avoid", {"uid": "hu:food-category:unpasteurized-cheese", "type": "D12.FoodCategory"}, "Unpasteurized cheeses"),
    ("high-mercury-fish", "high mercury fish", "l17-foods-avoid", {"uid": "hu:food-category:high-mercury-fish", "type": "D12.FoodCategory"}, "High-mercury fish"),
    ("alcohol", "Avoid alcohol", "l18-alcohol", {"uid": "hu:food:alcoholic-beverage", "type": "D12.FoodItem"}, "Alcoholic beverages"),
]
for slug, word, parent, _, _ in FOOD_AVOID:
    if slug in ("processed-foods", "alcohol"):
        continue  # whole-item / clause locator already exists
    loc(f"l3x-food-{slug}", BP, word, after=NUTR, note=f"item inside {parent}")
AVOID_ITEMS = [
    ("longevity-mix", "Longevity Mix", {"uid": "hu:product:blueprint-longevity-mix", "type": "D6.Product"}),
    ("ashwagandha", "Ashwagandha", {"uid": "hu:material:ashwagandha", "type": "D1.IngredientMaterial"}),
    ("curcumin", "Curcumin", {"uid": "hu:substance:curcumin", "type": "D1.ChemicalSubstance"}),
    ("red-yeast-rice", "Red Yeast Rice", {"uid": "hu:material:red-yeast-rice", "type": "D1.IngredientMaterial"}),
    ("nicotinamide-riboside", "Nicotinamide Riboside", {"uid": "hu:substance:nicotinamide-riboside", "type": "D1.ChemicalSubstance"}),
    ("ca-akg", "CA-AKG", {"uid": "hu:substance:calcium-alpha-ketoglutarate", "type": "D1.ChemicalSubstance"}),
    ("glucosamine-sulfate", "Glucosamine Sulfate", {"uid": "hu:substance:glucosamine-sulfate", "type": "D1.ChemicalSubstance"}),
    ("creatine", "Creatine", {"uid": "hu:substance:creatine", "type": "D1.ChemicalSubstance"}),
    ("sodium-hyaluronate", "Sodium Hyaluronate", {"uid": "hu:substance:sodium-hyaluronate", "type": "D1.ChemicalSubstance"}),
    ("n-acetyl-cysteine", "N-Acetyl-Cysteine", {"uid": "hu:substance:n-acetylcysteine", "type": "D1.ChemicalSubstance"}),
]
for slug, word, _ in AVOID_ITEMS:
    loc(f"l2x-avoid-{slug}", BP, word, after=AV, note="item inside the avoid list (l06)")
TBL = "Table 3: Tolerable Upper Intake Levels (ULs) for Supplemental Magnesium in Milligrams (mg)"
loc("l31-ul-prose", ODS, "The Tolerable Upper Intake Level for supplemental magnesium is 350 mg for adults")
loc("l32-ul-basis", ODS, "The ULs only include magnesium from dietary supplements and medications; they do not include magnesium found naturally in food and beverages.")
loc("l33-ul-table-title", ODS, TBL)
loc("l34-ul-header", ODS, "| Age | Male | Female | Pregnant | Lactating |", after=TBL, kind="TABLE", section="Table 3", note="header of the UL table (columns Male, Female, Pregnant, Lactating); anchored after the Table 3 title")
loc("l35-ul-14-18", ODS, "| 14–18 years | 350 mg | 350 mg | 350 mg | 350 mg |", after=TBL, kind="TABLE", section="Table 3, row 14-18 years")
loc("l36-ul-19-30", ODS, "| 19–30 years | 350 mg | 350 mg | 350 mg | 350 mg |", after=TBL, kind="TABLE", section="Table 3, row 19-30 years")
loc("l37-ul-31-50", ODS, "| 31–50 years | 350 mg | 350 mg | 350 mg | 350 mg |", after=TBL, kind="TABLE", section="Table 3, row 31-50 years")
loc("l38-high-dose-effects", ODS, "high doses of magnesium from dietary supplements or medications can cause diarrhea, nausea, and abdominal cramping")
loc("l39-updated", ODS, "**Updated:**January 6, 2026")
for r in ["l35-ul-14-18", "l36-ul-19-30", "l37-ul-31-50"]:
    assert L[r].start > L["l33-ul-table-title"].start

PROTOCOL = {"uid": "hu:protocol:blueprint-bryan-johnson", "type": "D5.Protocol"}
EDITION = {"uid": "hu:protocol-edition:blueprint-2026-10-08-pregnancy-section", "type": "D5.ProtocolEdition"}
BRYAN = {"uid": "hu:person:bryan-johnson", "type": "D7.Person"}
ODSORG = {"uid": "hu:org:nih-office-of-dietary-supplements", "type": "D7.Organization"}
MG = {"uid": "hu:substance:magnesium", "type": "D1.ChemicalSubstance"}
IRON = {"uid": "hu:substance:iron", "type": "D1.ChemicalSubstance"}
CALC = {"uid": "hu:substance:calcium", "type": "D1.ChemicalSubstance"}
OMEGA3 = {"uid": "hu:substance:omega-3-dha-epa", "type": "D1.ChemicalSubstance"}
CAFF = {"uid": "hu:substance:caffeine", "type": "D1.ChemicalSubstance"}
MODEX = {"uid": "hu:intervention:moderate-intensity-exercise", "type": "D5.Intervention"}
STRENGTH = {"uid": "hu:intervention:resistance-training", "type": "D5.Intervention"}
PELVIC = {"uid": "hu:intervention:pelvic-floor-exercises", "type": "D5.Intervention"}
GI = {"diarrhea": {"uid": "hu:condition:diarrhea", "type": "D2.Condition"}, "nausea": {"uid": "hu:condition:nausea", "type": "D2.Condition"},
      "abdominal-cramping": {"uid": "hu:condition:abdominal-cramping", "type": "D2.Condition"}}

UC = {}


def uc(ref, kind, subject, scope=(), pops=(), dose=None, summary=None, extra=None):
    key, h = use_constraint(kind, subject, scope, pops, dose=dose)
    UC[ref] = {k: v for k, v in {"ref": ref, "uid": f"hu:use-constraint:{h[7:23]}", "type": "D5.UseConstraint", "constraintKind": kind, "identityKey": key,
                                  "identityKeyHash": h, "identityKeyVersion": UCK, "scopePopulations": list(pops) or None,
                                  "summary": summary, **(extra or {})}.items() if v is not None}


for slug, word, m in AVOID_ITEMS:
    uc(f"uc-avoid-{slug}", "POPULATION", m["uid"], pops=["PREGNANT"], summary=f"{word} in pregnancy")
DOSE = "GT 350 mg PER_DAY SUPPLEMENTAL_ONLY"
DL = {"doseComparator": "GT", "doseValue": 350, "doseUnit": "mg", "dosePeriod": "PER_DAY", "intakeScope": "SUPPLEMENTAL_ONLY"}
uc("uc-mg-ul-pregnant", "DOSE_LIMIT", MG["uid"], pops=["PREGNANT"], dose=DOSE, summary="supplemental magnesium above 350 mg/day in pregnancy", extra=DL)
uc("uc-mg-ul-adults", "DOSE_LIMIT", MG["uid"], pops=["GENERAL_ADULTS"], dose=DOSE, summary="supplemental magnesium above 350 mg/day in adults", extra=DL)
for slug, _, _, m, name in FOOD_AVOID:
    uc(f"uc-avoid-{slug}", "POPULATION", m["uid"], pops=["PREGNANT"], summary=f"{name} in pregnancy")
uc("uc-caffeine-limit-pregnant", "DOSE_LIMIT", CAFF["uid"], pops=["PREGNANT"], dose="GT 200 mg PER_DAY NOT_STATED", summary="caffeine above 200 mg/day in pregnancy",
   extra={"doseComparator": "GT", "doseValue": 200, "doseUnit": "mg", "dosePeriod": "PER_DAY", "intakeScope": "NOT_STATED"})

STEPS = []
for slug, word, m in CONSULT_ITEMS:
    STEPS.append(dict(stepKey=f"preg-01-consult-{slug}", stepKind="CONSULT", stepKindRaw="we suggest you consult your doctor before use", requirementLevel="RECOMMENDED", requirementBasis="STATED_BY_SOURCE",
                      conditionText="if pregnant or breastfeeding", appliesToPopulations=["PREGNANT", "LACTATING"], means=[m["uid"]] if m else [], loc=f"l0c-consult-{slug}",
                      note="Item 1 ('consult your doctor before use if pregnant or breastfeeding', l04) applied to list item " + word + ". The sentence's 'known to be safe' wording is not modeled as any property (directive 3.2)." + ("" if m else " 'Protein powders' names no product: no STEP_USES.")))
for i, (slug, word, m) in enumerate(AVOID_ITEMS):
    STEPS.append(dict(stepKey=f"preg-02-avoid-{slug}", stepKind="AVOID", statedLevel="AVOID", speechAct="CAUTIONS", requirementLevel="RECOMMENDED", requirementBasis="STATED_BY_SOURCE",
                      appliesToPopulations=["PREGNANT"], means=[m["uid"]], constraints=[f"uc-avoid-{slug}"], loc=f"l2x-avoid-{slug}"))
STEPS.append(dict(stepKey="preg-03-add-prenatal-vitamin", stepKind="TAKE", requirementLevel="OPTIONAL", requirementBasis="STATED_BY_SOURCE", speechAct="RECOMMENDS", appliesToPopulations=["PREGNANT"],
                  means=[], scheduleText="at least 600 mcg Methylfolate, 2.5 mcg methylcobalamin", notReportedFields=["doseMin", "doseMax"], loc="l11-prenatal",
                  note="A generic product class (prenatal multivitamin) with two nutrient minima: no D6 product is named, so no STEP_USES; the minima stay verbatim in scheduleText (one step names one primary means)."))
STEPS.append(dict(stepKey="preg-03-add-magnesium", stepKind="TAKE", requirementLevel="OPTIONAL", requirementBasis="STATED_BY_SOURCE", speechAct="RECOMMENDS",
                  appliesToPopulations=["PREGNANT"], means=[MG["uid"]], doseMin=500, doseMax=600, doseUnit="mg", dosePeriod="PER_DAY", intakeScope="SUPPLEMENTAL_ONLY",
                  notReportedFields=["timeAnchor", "elementalVsSaltMass", "magnesiumForm"], loc="l08-magnesium",
                  note="intakeScope SUPPLEMENTAL_ONLY because the step sits in the list 'Consider adding the following supplements' (l07); the source does not say whether 500-600 mg is elemental magnesium."))
STEPS.append(dict(stepKey="preg-03-add-iron", stepKind="TAKE", requirementLevel="OPTIONAL", requirementBasis="STATED_BY_SOURCE", speechAct="RECOMMENDS", appliesToPopulations=["PREGNANT"],
                  means=[IRON["uid"]], doseMin=30, doseMax=30, doseUnit="mg", dosePeriod="PER_DAY", intakeScope="SUPPLEMENTAL_ONLY", loc="l09-iron"))
STEPS.append(dict(stepKey="preg-03-add-calcium", stepKind="TAKE", requirementLevel="OPTIONAL", requirementBasis="STATED_BY_SOURCE", speechAct="RECOMMENDS", appliesToPopulations=["PREGNANT"],
                  means=[CALC["uid"]], doseMin=1200, doseMax=1200, doseUnit="mg", dosePeriod="PER_DAY", intakeScope="SUPPLEMENTAL_ONLY", loc="l10-calcium"))
STEPS.append(dict(stepKey="preg-03-add-omega-3", stepKind="TAKE", requirementLevel="OPTIONAL", requirementBasis="STATED_BY_SOURCE", speechAct="RECOMMENDS", appliesToPopulations=["PREGNANT"],
                  means=[OMEGA3["uid"]], doseMin=1000, doseMax=2000, doseUnit="mg", dosePeriod="PER_DAY", intakeScope="SUPPLEMENTAL_ONLY", loc="l12-omega3"))
STEPS.append(dict(stepKey="preg-04-protein-minimum", stepKind="PRACTICE", stepKindRaw="Balanced diet with at least 100 g of protein daily", requirementLevel="RECOMMENDED", requirementBasis="STATED_BY_SOURCE",
                  appliesToPopulations=["PREGNANT"], means=[], doseMin=100, doseUnit="g", dosePeriod="PER_DAY", intakeScope="TOTAL_INTAKE", notReportedFields=["doseMax"], loc="l14-protein",
                  note="Nutrient intake target (protein, total intake); no D1/D12 node is minted for the nutrient class in this fixture."))
for slug, _, parent, m, _ in FOOD_AVOID[:2]:
    STEPS.append(dict(stepKey=f"preg-04-avoid-{slug}", stepKind="AVOID", statedLevel="AVOID", speechAct="CAUTIONS", requirementLevel="RECOMMENDED", requirementBasis="STATED_BY_SOURCE",
                      appliesToPopulations=["PREGNANT"], means=[m["uid"]], constraints=[f"uc-avoid-{slug}"], loc=(f"l3x-food-{slug}" if slug != "processed-foods" else parent),
                      note="Stated rationale 'to reduce gestational diabetes risk' is kept verbatim in the locator; gestational diabetes is a D2 Condition, not a Target, so no targetKeys."))
STEPS.append(dict(stepKey="preg-04-fiber-minimum", stepKind="PRACTICE", stepKindRaw="Consume at least 30 g of fiber daily", requirementLevel="RECOMMENDED", requirementBasis="STATED_BY_SOURCE",
                  appliesToPopulations=["PREGNANT"], means=[], doseMin=30, doseUnit="g", dosePeriod="PER_DAY", intakeScope="TOTAL_INTAKE", notReportedFields=["doseMax"], loc="l16-fiber"))
for slug, _, parent, m, _ in FOOD_AVOID[2:6]:
    STEPS.append(dict(stepKey=f"preg-04-avoid-{slug}", stepKind="AVOID", statedLevel="AVOID", speechAct="CAUTIONS", requirementLevel="RECOMMENDED", requirementBasis="STATED_BY_SOURCE",
                      appliesToPopulations=["PREGNANT"], means=[m["uid"]], constraints=[f"uc-avoid-{slug}"], loc=f"l3x-food-{slug}"))
STEPS.append(dict(stepKey="preg-04-avoid-alcohol", stepKind="AVOID", statedLevel="AVOID", speechAct="CAUTIONS", requirementLevel="RECOMMENDED", requirementBasis="STATED_BY_SOURCE",
                  appliesToPopulations=["PREGNANT"], means=["hu:food:alcoholic-beverage"], constraints=["uc-avoid-alcohol"], loc="l18-alcohol"))
STEPS.append(dict(stepKey="preg-04-limit-caffeine", stepKind="AVOID", stepKindRaw="limit caffeine to 200 mg daily", statedLevel="DO_NOT_EXCEED_DOSE", speechAct="CAUTIONS", requirementLevel="RECOMMENDED",
                  requirementBasis="STATED_BY_SOURCE", appliesToPopulations=["PREGNANT"], means=[CAFF["uid"]], doseMax=200, doseUnit="mg", dosePeriod="PER_DAY", intakeScope="NOT_STATED",
                  constraints=["uc-caffeine-limit-pregnant"], loc="l19-caffeine", note="A limit, not a prohibition: AVOID step with statedLevel DO_NOT_EXCEED_DOSE and doseMax 200 mg/day; intake scope not stated."))
STEPS.append(dict(stepKey="preg-05-moderate-exercise", stepKind="PRACTICE", requirementLevel="RECOMMENDED", requirementBasis="STATED_BY_SOURCE", speechAct="RECOMMENDS", appliesToPopulations=["PREGNANT"],
                  means=[MODEX["uid"]], doseMin=150, doseUnit="min", dosePeriod="PER_WEEK", notReportedFields=["doseMax"], loc="l21-moderate-exercise"))
STEPS.append(dict(stepKey="preg-05-strength-training", stepKind="PRACTICE", requirementLevel="RECOMMENDED", requirementBasis="STATED_BY_SOURCE", speechAct="RECOMMENDS", appliesToPopulations=["PREGNANT"],
                  means=[STRENGTH["uid"]], doseMin=90, doseUnit="min", dosePeriod="PER_WEEK", notReportedFields=["doseMax"], loc="l22-strength"))
STEPS.append(dict(stepKey="preg-05-pelvic-floor", stepKind="PRACTICE", requirementLevel="OPTIONAL", requirementBasis="STATED_BY_SOURCE", speechAct="RECOMMENDS", appliesToPopulations=["PREGNANT"],
                  means=[PELVIC["uid"]], loc="l23-pelvic-floor"))
PF = ["stepKey", "stepKind", "statedLevel", "requirementLevel", "conditionText", "appliesToPopulations", "doseMin", "doseMax", "doseUnit", "dosePeriod", "intakeScope", "scheduleText", "means"]
recs = []
for i, s in enumerate(STEPS):
    payload = {k: s.get(k) for k in PF if s.get(k) is not None}
    payload["sectionLabel"] = "Pregnancy"
    rec = {"uid": f"hu:protocol-step:blueprint-2026-preg-{s['stepKey']}", "type": "D5.ProtocolStep", "orderIndex": i, "stepKey": s["stepKey"],
           "payloadHash": "sha256:" + sha_text(canon(payload)), "sectionLabel": "Pregnancy", "targetKeys": None}
    for k in ["stepKind", "stepKindRaw", "statedLevel", "speechAct", "requirementLevel", "requirementBasis", "conditionText", "appliesToPopulations", "doseMin", "doseMax", "doseUnit", "dosePeriod", "intakeScope", "scheduleText", "notReportedFields", "note"]:
        if s.get(k) is not None:
            rec[k] = s[k]
    rec["exactText"] = L[s["loc"]].quote
    rec["locatorUid"] = L[s["loc"]].uid
    rec["locatorRef"] = s["loc"]
    rec["uses"] = s["means"]
    rec["statesConstraints"] = [UC[c]["uid"] for c in s.get("constraints", [])]  # derived edges, see edges.derived
    rec["notReportedFields"] = sorted(set(rec.get("notReportedFields", []) + ["targetKeys"]))
    del rec["targetKeys"]
    recs.append(rec)
edition_payload = "sha256:" + sha_text(canon(sorted(r["payloadHash"] for r in recs)))

A = []


def asrt(id_, predicate, subject, obj, asserter, locs, qualifiers, value=None, literal=None, kind="RELATIONSHIP", polarity="POSITIVE", speech="STATES",
         basis="UNSTATED", validity=None, resolves=None, proposition=None, note=None):
    a = {"id": id_, "uid": f"hu:assertion:d5-mg-{id_}", "predicate": predicate, "assertionKind": kind, "subject": subject, "object": obj, "literal": literal,
         "asserter": asserter, "locators": list(locs), "qualifiers": qualifiers, "valueString": value, "polarity": polarity, "speechAct": speech, "basisKind": basis,
         "proposition": proposition, "validity": validity or {"validFrom": None, "validFromBasis": "OBSERVATION_ONLY"}, "status": "PROPOSED",
         "recordedAt": "<service-assigned at apply>", "resolvesToConstraint": resolves, "producedBy": PB, "note": note}
    A.append({k: v for k, v in a.items() if v is not None})


asrt("m01-has-edition", "HAS_EDITION", PROTOCOL, EDITION, BRYAN, ["l03-pregnancy-heading", "l04-consult", "l05-avoid-header", "l06-avoid-list", "l07-add-header", "l08-magnesium", "l13-nutrition-header", "l20-exercise-header"], None, kind="FIELD",
     proposition="The page shows the Pregnancy-section step payload of this edition (every numbered item of items 1-5).", note="state.attach authorizing Assertion; only one observation, so validFrom is null (OBSERVATION_ONLY); firstObservedAt = lastObservedAt = retrieval time.")
asrt("m02-authored-by", "PROTOCOL_AUTHORED_BY", PROTOCOL, BRYAN, BRYAN, ["l02-signature", "l01-protocol-title"], None)
for slug, word, m in AVOID_ITEMS:
    asrt(f"m03-avoid-{slug}", "USE_CONSTRAINED_IN", {"uid": m["uid"], "type": m["type"]}, None, BRYAN, [f"l2x-avoid-{slug}", "l05-avoid-header"],
         ["population:PREGNANT", "section:PROTOCOL_TEXT"], value="AVOID", speech="CAUTIONS", resolves=UC[f"uc-avoid-{slug}"]["uid"],
         proposition=f"{word} (in the Blueprint stack) should be avoided during pregnancy.")
for slug, word, parent, m, name in FOOD_AVOID:
    lref = f"l3x-food-{slug}" if slug not in ("processed-foods", "alcohol") else ("l15-sugars-foods" if slug == "processed-foods" else "l18-alcohol")
    asrt(f"m07-avoid-{slug}", "USE_CONSTRAINED_IN", {"uid": m["uid"], "type": m["type"]}, None, BRYAN, sorted({lref, parent}),
         ["population:PREGNANT", "section:PROTOCOL_TEXT"], value="AVOID", speech="CAUTIONS", resolves=UC[f"uc-avoid-{slug}"]["uid"],
         proposition=f"Avoid {name.lower()} during pregnancy (Blueprint nutritional recommendations).")
asrt("m08-caffeine-limit", "HAS_UPPER_LIMIT", CAFF, None, BRYAN, ["l19-caffeine"], ["population:PREGNANT", "intakeScope:NOT_STATED", "limitKind:PROTOCOL_MAX"],
     value="DO_NOT_EXCEED_DOSE", literal={"valueNumber": 200, "unitCode": "mg/d"}, kind="METRIC", speech="CAUTIONS", resolves=UC["uc-caffeine-limit-pregnant"]["uid"],
     proposition="Limit caffeine to 200 mg daily during pregnancy.", note="limitKind PROTOCOL_MAX is a new code (05 HAS_UPPER_LIMIT qualifiers): a protocol's own ceiling, not a regulator UL.")
VUL = {"validFrom": "2026-01-06T00:00:00Z", "validFromPrecision": "DAY", "validFromBasis": "PUBLICATION_PROXY"}
for r, band in [("l35-ul-14-18", "14-18"), ("l36-ul-19-30", "19-30"), ("l37-ul-31-50", "31-50")]:
    asrt(f"m04-ul-pregnant-{band}", "HAS_UPPER_LIMIT", MG, None, ODSORG, [r, "l34-ul-header", "l33-ul-table-title", "l32-ul-basis"],
         ["population:PREGNANT", f"ageBand:{band}", "intakeScope:SUPPLEMENTAL_ONLY", "limitKind:UL"], value="DO_NOT_EXCEED_DOSE",
         literal={"valueNumber": 350, "unitCode": "mg/d"}, kind="METRIC", basis="CITED_FROM_PRIOR_WORK", validity=VUL, resolves=UC["uc-mg-ul-pregnant"]["uid"],
         proposition=f"UL for supplemental magnesium in pregnancy, ages {band} years: 350 mg (per day).", note="Pregnancy column of Table 3; the UL excludes magnesium from food and beverages (l32).")
asrt("m05-ul-adults", "HAS_UPPER_LIMIT", MG, None, ODSORG, ["l31-ul-prose", "l32-ul-basis"], ["population:GENERAL_ADULTS", "intakeScope:SUPPLEMENTAL_ONLY", "limitKind:UL"],
     value="DO_NOT_EXCEED_DOSE", literal={"valueNumber": 350, "unitCode": "mg/d"}, kind="METRIC", basis="CITED_FROM_PRIOR_WORK", validity=VUL, resolves=UC["uc-mg-ul-adults"]["uid"],
     proposition="The UL for supplemental magnesium is 350 mg for adults.")
for slug, c in GI.items():
    asrt(f"m06-high-dose-{slug}", "CAUSES_ADVERSE_EFFECT", MG, c, ODSORG, ["l38-high-dose-effects"],
         ["population:UNSPECIFIED", "dose:high doses from dietary supplements or medications", "context:OVERDOSE", "sourceKind:REFERENCE_MONOGRAPH"], speech="CAUTIONS", basis="CITED_FROM_PRIOR_WORK",
         validity=VUL, proposition=f"High doses of magnesium from dietary supplements or medications can cause {slug.replace('-', ' ')}.",
         note="sourceKind REFERENCE_MONOGRAPH is a proposed new code (11-open-questions OQ-D5-28); context OVERDOSE is the closest existing code for 'high doses'.")

# Q-D5-06: computed at query time, never stored
step = next(r for r in recs if r["stepKey"] == "preg-03-add-magnesium")
lim = UC["uc-mg-ul-pregnant"]
checks = {"unit": step["doseUnit"] == lim["doseUnit"], "period": step["dosePeriod"] == lim["dosePeriod"], "intakeScope": step["intakeScope"] == lim["intakeScope"],
          "population": "PREGNANT" in step["appliesToPopulations"] and "PREGNANT" in lim["scopePopulations"]}
if all(checks.values()):
    verdict = "ABOVE" if step["doseMin"] > lim["doseValue"] else ("PARTLY_ABOVE" if step["doseMax"] > lim["doseValue"] else "WITHIN")
else:
    verdict = "NOT_COMPARABLE"
Q06 = {"question": "Q-D5-06", "stored": False, "method": "dose-vs-limit/0 (query-time Cypher, 03-retrieval-patterns.md ## Q-D5-06)",
       "protocolEdition": EDITION["uid"], "step": step["uid"], "statedDose": f"{step['doseMin']:g}-{step['doseMax']:g} {step['doseUnit']} {step['dosePeriod']} {step['intakeScope']}",
       "population": "PREGNANT", "limitConstraint": lim["uid"], "limit": f"{lim['doseComparator']} {lim['doseValue']} {lim['doseUnit']} {lim['dosePeriod']} {lim['intakeScope']}",
       "limitAssertions": [a["uid"] for a in A if a.get("resolvesToConstraint") == lim["uid"]], "limitSource": ODS.source_uri,
       "comparabilityChecks": checks, "verdict": verdict,
       "caveats": ["the step does not state whether 500-600 mg is elemental magnesium (notReportedFields elementalVsSaltMass); the UL is for supplemental magnesium; the row is returned with this flag",
                   "intakeScope of the step is inferred from its list heading ('Consider adding the following supplements')",
                   "statement of comparison only: the stated range exceeds the stated UL; no clinical conclusion"],
       "locators": [step["locatorUid"], L["l36-ul-19-30"].uid, L["l32-ul-basis"].uid]}
Q11 = {"question": "Q-D5-11", "scope": "every numbered item of the Pregnancy section (items 1-5, 33 steps)", "stepsWithStatedConstraints": [r["stepKey"] for r in recs if r["statesConstraints"]],
       "externalConstraintOmittedByProtocol": [{"step": step["stepKey"], "useConstraint": lim["uid"], "resolvedFrom": Q06["limitAssertions"], "reason": "no STATES_CONSTRAINT from the step to this UseConstraint (anti-join)"}]}

os.makedirs(OUT, exist_ok=True)
dump_yaml(os.path.join(OUT, "locators.yaml"), {"fixture": FIX, "offsetBasis": OFFSET_BASIS, "note": FIXTURE_NOTE, "snapshots": [s.record() for s in SNAPS], "locators": [l.record() for l in L.values()]},
          "# Locators for fixture pregnancy-magnesium-upper-limit. Generated by scratch ft/D5/gen/gen_mg.py from fresh captures (2026-10-08);\n# quotes re-found by exact match, offsets computed.")
structural = [{"type": "HAS_EDITION", "class": "asserted (episode)", "from": PROTOCOL["uid"], "to": EDITION["uid"], "authorizingAssertion": "hu:assertion:d5-mg-m01-has-edition",
               "edgeProperties": {"validFrom": None, "validFromBasis": "OBSERVATION_ONLY", "validTo": None, "validToBasis": "UNKNOWN", "recordedFrom": "<service-assigned>", "lastWriterRunId": PB["runId"]}}]
structural += [{"type": "HAS_STEP", "from": EDITION["uid"], "to": r["uid"], "orderIndex": r["orderIndex"]} for r in recs]
structural += [{"type": "STEP_USES", "from": r["uid"], "to": u} for r in recs for u in r["uses"]]
derived = []
# STATES_CONSTRAINT is derived (adversarial review): the author's caution Assertion cites the step's own locator and resolves to the UseConstraint.
for r in recs:
    for c in r["statesConstraints"]:
        src = [a["uid"] for a in A if a.get("resolvesToConstraint") == c and r["locatorRef"] in a["locators"]]
        assert src, (r["stepKey"], c)
        derived.append({"type": "STATES_CONSTRAINT", "from": r["uid"], "to": c, "edgeProperties": {"derivationRule": UCK + " (stated-by-step: caution Assertion cites the step locator)", "derivedFromAssertionUids": src, "derivedAt": "<projection run>", "lastWriterRunId": f"run:ft-D5-{FIX}-constraint-projection"}})
derived += [{"type": "RESOLVES_TO_CONSTRAINT", "from": a["uid"], "to": a["resolvesToConstraint"], "edgeProperties": {"derivationRule": UCK, "derivedFromAssertionUids": [a["uid"]], "derivedAt": "<projection run>", "lastWriterRunId": f"run:ft-D5-{FIX}-constraint-projection"}} for a in A if a.get("resolvesToConstraint")]
entities = [{**PROTOCOL, "name": "Blueprint protocol (Bryan Johnson)", "props": {"canonicalUri": BP.source_uri}},
            {**EDITION, "name": "Blueprint protocol, edition observed 2026-10-08 (Pregnancy section modeled, every item)", "props": {"payloadHash": edition_payload, "payloadCanonicalizationVersion": "d5-step-payload/0 (fixture, Pregnancy section only: items 1-5 complete)", "changeProvenance": "SNAPSHOT_DIFF", "firstObservedAt": BP.retrieved_at, "lastObservedAt": BP.retrieved_at, "stepCount": len(recs)}},
            {**BRYAN, "name": "Bryan Johnson"}, {**ODSORG, "name": "NIH Office of Dietary Supplements"},
            {**MG, "name": "Magnesium (supplemental)"}, {**IRON, "name": "Iron"}, {**CALC, "name": "Calcium"}, {**OMEGA3, "name": "Omega-3 fatty acids DHA/EPA"}, {**CAFF, "name": "Caffeine"},
            {**MODEX, "name": "Moderate-intensity exercise", "props": {"kind": "LIFESTYLE_PRACTICE"}}, {**STRENGTH, "name": "Strength (resistance) training", "props": {"kind": "LIFESTYLE_PRACTICE"}},
            {**PELVIC, "name": "Pelvic floor exercises", "props": {"kind": "LIFESTYLE_PRACTICE"}}] + \
           [{**m, "name": w} for _, w, m in AVOID_ITEMS] + [{**c, "name": s.replace("-", " ").capitalize()} for s, c in GI.items()] + \
           [{**m, "name": "Blueprint " + w} for _, w, m in CONSULT_ITEMS if m] + [{**m, "name": n} for _, _, _, m, n in FOOD_AVOID]
dump_yaml(os.path.join(OUT, "assertions.yaml"), {
    "fixture": FIX, "note": FIXTURE_NOTE + " Scope: the edition models the Pregnancy section only, and every numbered item of it (items 1-5: 5 CONSULT, 10 stack AVOID, 5 TAKE, 10 nutrition steps (8 AVOID or limit, 2 PRACTICE), 3 exercise PRACTICE = 33 steps); other sections of the page are out of scope (fixture limitation; a real ingestion hashes every step of the page, OQ-D5-35). Adversarial review 2026-10-08 added items 1.1-1.5, 3.1, 3.5, 4.x and 5.x, which the fixtures stage had omitted.", "producedBy": PB,
    "activity": {"uid": "hu:activity:ft-d5-pregnancy-magnesium-upper-limit", "activityKind": "INGESTION", "externalRunSystem": "mission-control", "runId": PB["runId"], "missionId": MISSION, "agent": "hu:agent:a5-fixtures-stage"},
    "entities": entities, "steps": recs, "useConstraints": list(UC.values()), "assertions": A,
    "adjudications": [{"uid": f"hu:adjudication:d5-mg-cf-{a['id']}", "adjudicationKind": "CAPTURE_FIDELITY", "evaluates": a["uid"], "verdict": "DIRECTLY_SUPPORTED", "judgeKind": "DETERMINISTIC",
                       "methodVersion": "fixture-exact-reselect/1", "producedBy": {"missionId": MISSION, "runId": f"run:ft-D5-{FIX}-verify"}} for a in A],
    "edges": {"structuralAndEpisode": structural, "derived": derived},
    "computedNotStored": {"Q-D5-06": Q06, "Q-D5-11": Q11},
}, "# Assertions, steps, constraints and edges for fixture pregnancy-magnesium-upper-limit (kernel pattern: packets/K/09-reasoning.md).\n# Generated by scratch ft/D5/gen/gen_mg.py. Q-D5-06 is computed at query time and shown under computedNotStored; nothing 'unsafe' is stored.")

refmap = {PROTOCOL["uid"]: "protocol", EDITION["uid"]: "edition", BRYAN["uid"]: "bryan", ODSORG["uid"]: "ods", MG["uid"]: "mg", IRON["uid"]: "iron", CALC["uid"]: "calcium",
          OMEGA3["uid"]: "omega3", CAFF["uid"]: "caffeine", MODEX["uid"]: "moderate-exercise", STRENGTH["uid"]: "strength-training", PELVIC["uid"]: "pelvic-floor"}
refmap.update({m["uid"]: f"p-{s_}" for s_, _, m in CONSULT_ITEMS if m})
refmap.update({m["uid"]: f"f-{s_}" for s_, _, _, m, _ in FOOD_AVOID})
refmap.update({m["uid"]: f"m-{s}" for s, _, m in AVOID_ITEMS})
refmap.update({c["uid"]: f"c-{s}" for s, c in GI.items()})
subj = []
for e in entities:
    t = e["type"].split(".")[1]
    if e["uid"] == EDITION["uid"]:
        subj.append({"ref": "edition", "mode": "new", "nodeType": t, "name": e["name"], "uidSegment": "blueprint-2026-10-08-pregnancy-section", "properties": {"payloadHash": edition_payload, "changeProvenance": "SNAPSHOT_DIFF"}, "onMatch": "create_anyway"})
    else:
        subj.append({"ref": refmap[e["uid"]], "mode": "new", "nodeType": t, "name": e["name"], "properties": e.get("props", {}), "onMatch": "use_existing"})
for r in recs:
    p = {k: r[k] for k in ["stepKey", "payloadHash", "stepKind", "sectionLabel", "requirementLevel", "requirementBasis", "appliesToPopulations", "exactText", "locatorUid"]}
    for k in ["statedLevel", "speechAct", "conditionText", "doseMin", "doseMax", "doseUnit", "dosePeriod", "intakeScope", "scheduleText", "notReportedFields"]:
        if k in r:
            p[k] = r[k]
    subj.append({"ref": f"st-{r['stepKey']}"[:64], "mode": "new", "nodeType": "ProtocolStep", "name": r["stepKey"], "uidSegment": r["uid"].split(":", 2)[2], "properties": p, "onMatch": "create_anyway"})
for ref, u in UC.items():
    subj.append({"ref": ref, "mode": "new", "nodeType": "UseConstraint", "name": u["summary"], "uidSegment": u["uid"].split(":", 2)[2],
                 "properties": {k: u[k] for k in ["constraintKind", "identityKey", "identityKeyHash", "identityKeyVersion", "scopePopulations"] + [k for k in DL if k in u]}, "onMatch": "use_existing"})
ucref = {u["uid"]: k for k, u in UC.items()}
props = [{"proposalId": "p-edition", "kind": "state.attach", "subjectRef": "protocol", "stateRef": "edition", "relationshipType": "HAS_EDITION", "evidence": A[0]["locators"], "assertion": {"speechAct": "STATES", "validity": {"validFromBasis": "OBSERVATION_ONLY"}}}]
for r in recs:
    sr = f"st-{r['stepKey']}"[:64]
    props.append({"proposalId": f"p-hs-{r['stepKey']}"[:64], "kind": "edge.structural", "relationshipType": "HAS_STEP", "fromRef": "edition", "toRef": sr, "properties": {"orderIndex": r["orderIndex"]}, "evidence": [r["locatorRef"]]})
    for u in r["uses"]:
        props.append({"proposalId": f"p-su-{r['stepKey']}"[:64], "kind": "edge.structural", "relationshipType": "STEP_USES", "fromRef": sr, "toRef": refmap[u], "evidence": [r["locatorRef"]]})
for a in A[1:]:
    rat = "qualifiers=" + ";".join(a.get("qualifiers") or []) + (f" valueString={a['valueString']}" if a.get("valueString") else "") + " (intent v1 lacks qualifiers/valueString on edge.assert: OQ-D5-27)"
    core = {"predicate": a["predicate"], "polarity": a["polarity"], "speechAct": a["speechAct"], "basisKind": a["basisKind"], "validity": {k: v for k, v in a["validity"].items() if v is not None}}
    if a.get("object"):
        props.append({"proposalId": f"p-{a['id']}"[:64], "kind": "edge.assert", "relationshipType": a["predicate"], "fromRef": refmap[a["subject"]["uid"]], "toRef": refmap[a["object"]["uid"]], "evidence": a["locators"], "asserterRef": refmap[a["asserter"]["uid"]], "assertion": core, "rationale": rat})
    else:
        p = {"proposalId": f"p-{a['id']}"[:64], "kind": "assertion.literal", "subjectRef": refmap[a["subject"]["uid"]], "predicate": a["predicate"], "evidence": a["locators"], "asserterRef": refmap[a["asserter"]["uid"]], "assertion": core, "rationale": rat}
        if a.get("literal"):
            p["valueNumber"] = a["literal"]["valueNumber"]
            p["unitCode"] = a["literal"]["unitCode"]
            p["valueString"] = a["valueString"]
        else:
            p["valueString"] = a["valueString"]
        props.append(p)
srcs = [{"ref": s.ref.replace("snap-", "src-"), "source": {"canonicalUri": s.source_uri, "title": s.title, "sourceKind": s.source_kind},
         "snapshot": {"observedAt": s.observed_at or s.retrieved_at, "retrievedAt": s.retrieved_at, "contentHash": s.digest, "contentHashBasis": s.basis, "captureCompleteness": s.completeness},
         "locators": [l.intent() for l in L.values() if l.snap is s]} for s in SNAPS]
intent = {"schemaVersion": "biotech-knowledge-intent.v1", "intentId": "ft-d5-pregnancy-magnesium-upper-limit",
          "context": {"actor": {"kind": "agent", "id": "a5-fixtures-stage", "model": "claude-opus-5-5"}, "run": {"system": "mission-control", "runId": PB["runId"], "missionId": MISSION}, "activityKind": "EXTRACTION"},
          "onStale": "fail", "sources": srcs, "subjects": subj, "proposals": props,
          "notes": "Fixture intent (fixture ids). STATES_CONSTRAINT and RESOLVES_TO_CONSTRAINT are projection outputs (derived), not proposals. HAS_UPPER_LIMIT and the population-scoped USE_CONSTRAINED_IN have no object node and are assertion.literal proposals; the population qualifier cannot be expressed in intent v1 and travels in rationale (OQ-D5-27). The Q-D5-06 comparison is computed at read time and is not part of any intent."}
dump_json(os.path.join(OUT, "intent.json"), intent)
dump_json(os.path.join(SCRATCH, "gen", f"summary-{FIX}.json"), {"snapshots": {s.ref: s.record() for s in SNAPS}, "Q06": Q06, "edition": edition_payload, "uc": UC, "counts": {"locators": len(L), "assertions": len(A), "steps": len(recs), "useConstraints": len(UC), "proposals": len(props)}})
print({"locators": len(L), "assertions": len(A), "steps": len(recs), "useConstraints": len(UC), "proposals": len(props)}, verdict, checks)
