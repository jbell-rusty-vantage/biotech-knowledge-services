"""Fixture sleep-toolkit-unstructured (kind unstructured-to-entity; FC-01)."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *  # noqa

FIX = "sleep-toolkit-unstructured"
OUT = os.path.join(FIXTURES, FIX)
PB = produced(FIX)
D = os.path.join(FX, "sleep")

S26 = Snap("snap-2026", "hu:snapshot:hubermanlab-toolkit-for-sleep-2026-10-08", os.path.join(D, "huberman-sleep.md"),
           "https://www.hubermanlab.com/newsletter/toolkit-for-sleep", "Toolkit for Sleep (Huberman Lab newsletter)",
           "tavily-extract/cli-0.1.5 (raw_content markdown)", "EXTRACTED_TEXT_BYTES", "COMPLETE", "text/markdown", "WEB_PAGE",
           note="Tavily markdown of the live page; the stored representation that the locators select from.")
S21 = Snap("snap-2021", "hu:snapshot:hubermanlab-toolkit-for-sleep-wayback-2021-10-18", os.path.join(D, "wayback-20211016.html"),
           "https://hubermanlab.com/toolkit-for-sleep/", "Toolkit for Sleep - Huberman Lab (Internet Archive capture)",
           "curl wayback id_ replay (raw archived HTML)", "RAW_BYTES", "COMPLETE", "text/html", "WEB_PAGE",
           observed_at="2021-10-18T16:06:34Z",
           request_uri="http://web.archive.org/web/20211016002820id_/https://hubermanlab.com/toolkit-for-sleep/",
           note="Requested timestamp 20211016002820 redirects (HTTP 302) to capture 20211018160634 (Memento-Datetime Mon, 18 Oct 2021 16:06:34 GMT); archiveUri http://web.archive.org/web/20211018160634/https://hubermanlab.com/toolkit-for-sleep/ . Bytes identical to the research-stage capture (same sha256).")

L = {}


def loc(ref, snap, quote, **kw):
    L[ref] = Loc(ref, f"hu:locator:d5-sleep-{ref}", snap, quote, **kw)
    return ref


# ---- 2026 snapshot (live page)
loc("l01-title", S26, "Toolkit for Sleep", after="# Toolkit for Sleep", note="H1 title: the protocol's stated purpose")
loc("l02-date", S26, "September 20, 2021", note="displayed date; unchanged while the content was edited in place")
loc("l03-author", S26, "Join over 1M others in getting regular emails from Dr. Andrew Huberman.", note="newsletter sign-up box (page boilerplate naming the sender), not a byline")
loc("l03b-signoff", S26, "Best wishes,  \nAndrew", note="sign-off of the newsletter body (first-person text); no byline near the title (adversarial review)")
loc("l04-step01", S26, "1) View sunlight by going outside within 30-60 minutes of waking. Do that again in the late afternoon, prior to sunset.")
loc("l05-step02", S26, "2) Wake up at the same time each day and go to sleep when you first start to feel sleepy.")
loc("l06-step03", S26, "3) Avoid caffeine within 8-10 hours of bedtime")
loc("l07-step04", S26, "4) If you have sleep disturbances, insomnia, or anxiety about sleep, try the research-supported protocols on the")
loc("l08-step04b", S26, "Do the Reveri sleep self-hypnosis 3x a week at any time of day.")
loc("l09-step05", S26, "5) Avoid viewing bright lights", note="heading continues with an em dash; quote stops before it")
loc("l10-step06", S26, "6) Limit daytime naps to less than 90 min")
loc("l11-step07", S26, "consider doing an NSDR protocol when you wake up.")
loc("l12-step08", S26, "**8) You might consider taking (30-60 min before bed):**")
loc("l13-mg", S26, "145mg Magnesium Threonate or 200mg Magnesium Bisglycinate")
loc("l14-apigenin", S26, "50mg Apigenin")
loc("l15-theanine", S26, "100-400mg Theanine")
loc("l16-glycine-gaba", S26, "(3-4 nights per week I also take 2g of Glycine and 100mg GABA.)")
loc("l17-start-one", S26, "I would start with one supplement (or none!) and then add one at a time as needed.")
loc("l18-theanine-caution", S26, "Don’t take theanine if you have overly intense dreams, sleep-walk, or have night terrors.")
loc("l19-mg-stomach", S26, "some people (~5%), get an agitated stomach from magnesium supplementation, in which case, do not take it.")
loc("l20-momentous", S26, "I use supplements from Momentous for all of the above. You can get 20% off all Momentous supplements")
loc("l21-affiliate", S26, "utm_medium=affiliate", note="query parameter of the Momentous link printed on the page")
loc("l22-step09", S26, "9) Expect to feel really alert ~1 hour before your natural bedtime.")
loc("l23-step10", S26, "10) Keep the room you sleep in cool and dark and layer on blankets that you can remove.")
loc("l24-step11", S26, "11) Drinking alcohol messes up your sleep. As do most sleep medications.")
loc("l25-step12", S26, "12) Kids (and indeed all of us) have changing sleep needs over time. Adjust accordingly.")
# ---- 2021 snapshot (archived raw HTML); quotes chosen without markup or entities
loc("l31-step08-2021", S21, "8) You might consider taking (30-60 min before bed):", reanchors=None)
loc("l32-mg-2021", S21, "145mg Magnesium Threonate")
loc("l33-theanine-caution-2021", S21, "Don’t take theanine if you have overly intense dreams, sleep-walk, or have night terrors.")
loc("l34-mg-stomach-2021", S21, "some people (~5%), get an agitated stomach from magnesium supplementation, in which case, do not take it.")
loc("l35-thorne-2021", S21, "I use supplements from Thorne for all of the above, except the Apigenin, as they don’t make it.")
loc("l36-thorne-discount-2021", S21, "You can get 20% off all Thorne supplements at")
loc("l37-step04-2021", S21, "try the zero-cost research-supported protocols on the")
loc("l38-title-2021", S21, "Toolkit for Sleep - Huberman Lab")
loc("l39-swanson-2021", S21, "50mg Apigenin (Swanson is the only source I know of; we have no affiliation to Swanson)", note="removed by 2026: the 2026 step reads '50mg Apigenin' only (adversarial review)")
loc("l40-thorne-no-threonate-2021", S21, "Also, they do not manufacture Magnesium Threonate either. Magnesium Bisglycinate is a good replacement for Threonate.", note="supplier note, absent in 2026")
loc("l41-thorne-no-ship-2021", S21, "Thorne does not ship outside the USA.", note="supplier note, absent in 2026")
loc("l42-signoff-2021", S21, "Best wishes,<br>Andrew", kind="HTML", note="sign-off of the 2021 newsletter body")
# re-anchoring: the 2026 locators re-find 2021 spans (exact where the text is equal)
L["l12-step08"].reanchors, L["l12-step08"].reanchor_match = L["l31-step08-2021"].uid, "EXACT (markdown emphasis markers excluded)"
L["l18-theanine-caution"].reanchors, L["l18-theanine-caution"].reanchor_match = L["l33-theanine-caution-2021"].uid, "EXACT"
L["l19-mg-stomach"].reanchors, L["l19-mg-stomach"].reanchor_match = L["l34-mg-stomach-2021"].uid, "EXACT"
L["l07-step04"].reanchors, L["l07-step04"].reanchor_match = L["l37-step04-2021"].uid, "FUZZY ('zero-cost' removed; platform text '(for Apple or Android phones)' -> '(for iPhone)')"

# ---------------------------------------------------------------------------------------------------------------
# Entities (stubs typed to the D5 SDL and to other modules' types through 10-seams.yaml)
# ---------------------------------------------------------------------------------------------------------------
T_SLEEP = {"uid": "hu:target:sleep", "type": "D5.Target"}
PROTOCOL = {"uid": "hu:protocol:huberman-lab-toolkit-for-sleep", "type": "D5.Protocol"}
EDITION = {"uid": "hu:protocol-edition:huberman-toolkit-for-sleep-e1", "type": "D5.ProtocolEdition"}
HUBERMAN = {"uid": "hu:person:andrew-huberman", "type": "D7.Person"}
HLAB = {"uid": "hu:org:huberman-lab", "type": "D7.Organization"}
MOMENTOUS = {"uid": "hu:org:momentous", "type": "D7.Organization"}
THORNE = {"uid": "hu:org:thorne", "type": "D7.Organization"}
SWANSON = {"uid": "hu:org:swanson-health", "type": "D7.Organization"}

M = {
    "sunlight": {"uid": "hu:intervention:morning-and-late-afternoon-sunlight-viewing", "type": "D5.Intervention", "name": "Sunlight viewing after waking and before sunset", "props": {"kind": "LIFESTYLE_PRACTICE"}},
    "wake": {"uid": "hu:intervention:consistent-wake-time", "type": "D5.Intervention", "name": "Consistent wake time", "props": {"kind": "LIFESTYLE_PRACTICE"}},
    "caffeine": {"uid": "hu:substance:caffeine", "type": "D1.ChemicalSubstance", "name": "Caffeine"},
    "reveri": {"uid": "hu:product:reveri-app", "type": "D6.Product", "name": "Reveri app (sleep self-hypnosis)"},
    "brightlight": {"uid": "hu:intervention:bright-light-exposure-at-night", "type": "D5.Intervention", "name": "Bright (overhead) light exposure between 10 pm and 4 am", "props": {"kind": "LIFESTYLE_PRACTICE"}},
    "naps": {"uid": "hu:intervention:daytime-napping", "type": "D5.Intervention", "name": "Daytime napping", "props": {"kind": "LIFESTYLE_PRACTICE"}},
    "nsdr": {"uid": "hu:intervention:nsdr", "type": "D5.Intervention", "name": "Non-sleep deep rest (NSDR) / yoga nidra", "props": {"kind": "LIFESTYLE_PRACTICE"}},
    "mgthr": {"uid": "hu:substance:magnesium-l-threonate", "type": "D1.ChemicalSubstance", "name": "Magnesium L-threonate"},
    "mgbis": {"uid": "hu:substance:magnesium-bisglycinate", "type": "D1.ChemicalSubstance", "name": "Magnesium bisglycinate"},
    "mg": {"uid": "hu:substance:magnesium", "type": "D1.ChemicalSubstance", "name": "Magnesium (supplemental, form unspecified)"},
    "apigenin": {"uid": "hu:substance:apigenin", "type": "D1.ChemicalSubstance", "name": "Apigenin"},
    "theanine": {"uid": "hu:substance:l-theanine", "type": "D1.ChemicalSubstance", "name": "L-theanine"},
    "glycine": {"uid": "hu:substance:glycine", "type": "D1.ChemicalSubstance", "name": "Glycine"},
    "gaba": {"uid": "hu:substance:gaba", "type": "D1.ChemicalSubstance", "name": "Gamma-aminobutyric acid (GABA)"},
    "cooldark": {"uid": "hu:intervention:cool-dark-bedroom", "type": "D5.Intervention", "name": "Cool, dark sleeping room with removable layers", "props": {"kind": "LIFESTYLE_PRACTICE"}},
    "alcohol": {"uid": "hu:food:alcoholic-beverage", "type": "D12.FoodItem", "name": "Alcoholic beverages (drinking alcohol)"},
}
COND = {
    "dreams": {"uid": "hu:condition:overly-intense-dreams-as-stated", "type": "D2.Condition", "name": "Overly intense dreams (surface form as stated; unresolved, staged as a Mention)"},
    "sleepwalk": {"uid": "hu:condition:sleepwalking", "type": "D2.Condition", "name": "Sleepwalking (somnambulism)"},
    "terrors": {"uid": "hu:condition:sleep-terrors", "type": "D2.Condition", "name": "Night terrors (sleep terrors)"},
    "gi": {"uid": "hu:condition:gastrointestinal-upset", "type": "D2.Condition", "name": "Gastrointestinal upset ('agitated stomach' as stated)"},
}

# ---------------------------------------------------------------------------------------------------------------
# Steps of edition e1 (structured payload authored once; its source spans are re-found in both snapshots)
# ---------------------------------------------------------------------------------------------------------------
BASE = {"targetKeys": ["target:sleep"], "appliesToPopulations": ["UNSPECIFIED"], "requirementBasis": "STATED_BY_SOURCE"}
STEPS = [
    dict(stepKey="s01-sunlight", stepKind="PRACTICE", stepKindRaw="View sunlight", means=["sunlight"], requirementLevel="NOT_STATED", requirementBasis="NOT_STATED", timeAnchor="UPON_WAKING", occurrencesPerPeriodMin=2, occurrencesPerPeriodMax=2, occurrencePeriodUnit="DAY", scheduleText="within 30-60 minutes of waking. Do that again in the late afternoon, prior to sunset.", loc="l04-step01"),
    dict(stepKey="s02-consistent-wake", stepKind="PRACTICE", means=["wake"], requirementLevel="NOT_STATED", requirementBasis="NOT_STATED", timeAnchor="UPON_WAKING", scheduleText="Wake up at the same time each day", loc="l05-step02"),
    dict(stepKey="s03-caffeine-cutoff", stepKind="AVOID", statedLevel="AVOID", means=["caffeine"], requirementLevel="NOT_STATED", requirementBasis="NOT_STATED", timeAnchor="BEDTIME", offsetMinutesMin=-600, offsetMinutesMax=-480, scheduleText="within 8-10 hours of bedtime", constraints=["uc-caffeine-timing"], loc="l06-step03"),
    dict(stepKey="s04-reveri-self-hypnosis", stepKind="PRACTICE", means=["reveri"], requirementLevel="CONDITIONAL", conditionText="If you have sleep disturbances, insomnia, or anxiety about sleep", occurrencesPerPeriodMin=3, occurrencesPerPeriodMax=3, occurrencePeriodUnit="WEEK", timeAnchor="ANYTIME", scheduleText="3x a week at any time of day", loc="l07-step04"),
    dict(stepKey="s05-bright-light", stepKind="AVOID", statedLevel="AVOID", means=["brightlight"], requirementLevel="NOT_STATED", requirementBasis="NOT_STATED", scheduleText="between 10 pm and 4 am", notReportedFields=["offsetMinutesMin", "offsetMinutesMax"], loc="l09-step05"),
    dict(stepKey="s06-nap-limit", stepKind="PRACTICE", means=["naps"], requirementLevel="NOT_STATED", requirementBasis="NOT_STATED", scheduleText="Limit daytime naps to less than 90 min, or don’t nap at all.", loc="l10-step06"),
    dict(stepKey="s07-nsdr-night-waking", stepKind="PRACTICE", means=["nsdr"], requirementLevel="CONDITIONAL", conditionText="If you wake up in the middle of the night ... but you can’t fall back asleep", loc="l11-step07"),
    dict(stepKey="s08a-magnesium-threonate", stepKind="TAKE", means=["mgthr"], alternativeGroup="s08-magnesium", requirementLevel="OPTIONAL", doseMin=145, doseMax=145, doseUnit="mg", dosePeriod="PER_DOSE", intakeScope="SUPPLEMENTAL_ONLY", timeAnchor="BEDTIME", offsetMinutesMin=-60, offsetMinutesMax=-30, notReportedFields=["occurrencesPerPeriodMin", "occurrencesPerPeriodMax", "elementalVsSaltMass"], loc="l13-mg"),
    dict(stepKey="s08b-magnesium-bisglycinate", stepKind="TAKE", means=["mgbis"], alternativeGroup="s08-magnesium", requirementLevel="OPTIONAL", doseMin=200, doseMax=200, doseUnit="mg", dosePeriod="PER_DOSE", intakeScope="SUPPLEMENTAL_ONLY", timeAnchor="BEDTIME", offsetMinutesMin=-60, offsetMinutesMax=-30, notReportedFields=["occurrencesPerPeriodMin", "occurrencesPerPeriodMax", "elementalVsSaltMass"], loc="l13-mg"),
    dict(stepKey="s08c-apigenin", stepKind="TAKE", means=["apigenin"], requirementLevel="OPTIONAL", doseMin=50, doseMax=50, doseUnit="mg", dosePeriod="PER_DOSE", intakeScope="SUPPLEMENTAL_ONLY", timeAnchor="BEDTIME", offsetMinutesMin=-60, offsetMinutesMax=-30, loc="l14-apigenin"),
    dict(stepKey="s08d-theanine", stepKind="TAKE", means=["theanine"], requirementLevel="OPTIONAL", doseMin=100, doseMax=400, doseUnit="mg", dosePeriod="PER_DOSE", intakeScope="SUPPLEMENTAL_ONLY", timeAnchor="BEDTIME", offsetMinutesMin=-60, offsetMinutesMax=-30, loc="l15-theanine"),
    dict(stepKey="s08e-glycine", stepKind="TAKE", means=["glycine"], requirementLevel="OPTIONAL", speechAct="REPORTS_PRACTICE", doseMin=2, doseMax=2, doseUnit="g", dosePeriod="PER_DOSE", intakeScope="SUPPLEMENTAL_ONLY", timeAnchor="BEDTIME", offsetMinutesMin=-60, offsetMinutesMax=-30, occurrencesPerPeriodMin=3, occurrencesPerPeriodMax=4, occurrencePeriodUnit="WEEK", loc="l16-glycine-gaba"),
    dict(stepKey="s08f-gaba", stepKind="TAKE", means=["gaba"], requirementLevel="OPTIONAL", speechAct="REPORTS_PRACTICE", doseMin=100, doseMax=100, doseUnit="mg", dosePeriod="PER_DOSE", intakeScope="SUPPLEMENTAL_ONLY", timeAnchor="BEDTIME", offsetMinutesMin=-60, offsetMinutesMax=-30, occurrencesPerPeriodMin=3, occurrencesPerPeriodMax=4, occurrencePeriodUnit="WEEK", loc="l16-glycine-gaba"),
    dict(stepKey="s08g-theanine-caution", stepKind="AVOID", statedLevel="AVOID", speechAct="CAUTIONS", means=["theanine"], requirementLevel="CONDITIONAL", conditionText="if you have overly intense dreams, sleep-walk, or have night terrors", constraints=["uc-theanine-dreams", "uc-theanine-sleepwalking", "uc-theanine-sleep-terrors"], dependsOnStepKeys=["s08d-theanine"], loc="l18-theanine-caution"),
    dict(stepKey="s08h-magnesium-stomach-stop", stepKind="REVIEW", reviewAction="PAUSE_STEP", speechAct="CAUTIONS", means=["mg"], requirementLevel="CONDITIONAL", conditionText="get an agitated stomach from magnesium supplementation", dependsOnStepKeys=["s08a-magnesium-threonate", "s08b-magnesium-bisglycinate"], loc="l19-mg-stomach"),
    dict(stepKey="s09-evening-alertness", stepKind="OTHER", means=[], requirementLevel="NOT_STATED", requirementBasis="NOT_STATED", stepKindRaw="Expect to feel really alert", loc="l22-step09"),
    dict(stepKey="s10-cool-dark-room", stepKind="PRACTICE", means=["cooldark"], requirementLevel="NOT_STATED", requirementBasis="NOT_STATED", loc="l23-step10"),
    dict(stepKey="s11-alcohol", stepKind="OTHER", stepKindRaw="Drinking alcohol messes up your sleep", means=["alcohol"], requirementLevel="NOT_STATED", requirementBasis="NOT_STATED", notReportedFields=["statedLevel"], loc="l24-step11"),
    dict(stepKey="s12-changing-needs", stepKind="OTHER", means=[], requirementLevel="NOT_STATED", requirementBasis="NOT_STATED", loc="l25-step12"),
]
PAYLOAD_FIELDS = ["stepKey", "stepKind", "statedLevel", "requirementLevel", "conditionText", "alternativeGroup", "targetKeys",
                  "appliesToPopulations", "doseMin", "doseMax", "doseUnit", "dosePeriod", "intakeScope", "timeAnchor",
                  "offsetMinutesMin", "offsetMinutesMax", "occurrencesPerPeriodMin", "occurrencesPerPeriodMax",
                  "occurrencePeriodUnit", "reviewAction", "dependsOnStepKeys"]
step_records = []
for i, s in enumerate(STEPS):
    s = {**BASE, **s}
    payload = {k: s.get(k) for k in PAYLOAD_FIELDS if s.get(k) is not None}
    payload["means"] = sorted(M[m]["uid"] for m in s["means"])
    s["payloadHash"] = "sha256:" + sha_text(canon(payload))
    lc = L[s["loc"]]
    rec = {"uid": f"hu:protocol-step:huberman-sleep-e1-{s['stepKey']}", "type": "D5.ProtocolStep", "orderIndex": i}
    for k in ["stepKey", "payloadHash", "stepKind", "stepKindRaw", "sectionLabel", "alternativeGroup", "requirementLevel",
              "requirementBasis", "speechAct", "statedLevel", "targetKeys", "appliesToPopulations", "conditionText", "doseMin",
              "doseMax", "doseUnit", "dosePeriod", "intakeScope", "timeAnchor", "offsetMinutesMin", "offsetMinutesMax",
              "occurrencesPerPeriodMin", "occurrencesPerPeriodMax", "occurrencePeriodUnit", "scheduleText", "reviewAction",
              "dependsOnStepKeys", "notReportedFields"]:
        if s.get(k) is not None:
            rec[k] = s[k]
    rec["exactText"] = lc.quote
    rec["locatorUid"] = lc.uid
    rec["locatorRef"] = lc.ref
    rec["uses"] = [M[m]["uid"] for m in s["means"]]
    rec["statesConstraints"] = s.get("constraints", [])  # refs; uids under edges.derived (STATES_CONSTRAINT is derived)
    step_records.append(rec)
edition_payload = "sha256:" + sha_text(canon(sorted(r["payloadHash"] for r in step_records)))

# Re-finding each step's span in the 2021 capture (normalized text: tags stripped, entities and NBSP decoded)
t21 = norm(html_text(S21.text))
refind = []
for r in step_records:
    q = norm(r["exactText"].replace("**", ""))
    refind.append({"stepKey": r["stepKey"], "found2021": q in t21})

# ---------------------------------------------------------------------------------------------------------------
# UseConstraints and assertions
# ---------------------------------------------------------------------------------------------------------------
UC = {}


def uc(ref, kind, subject, scope=(), pops=(), timing=None, summary=None, extra=None):
    key, h = use_constraint(kind, subject, scope, pops, timing=timing)
    UC[ref] = {"ref": ref, "uid": f"hu:use-constraint:{h[7:23]}", "type": "D5.UseConstraint", "constraintKind": kind,
               "identityKey": key, "identityKeyHash": h, "identityKeyVersion": UCK,
               "scopePopulations": list(pops) or None, "summary": summary, **(extra or {})}
    UC[ref] = {k: v for k, v in UC[ref].items() if v is not None}


uc("uc-theanine-dreams", "CONDITION", M["theanine"]["uid"], [COND["dreams"]["uid"]], summary="L-theanine use when overly intense dreams are present")
uc("uc-theanine-sleepwalking", "CONDITION", M["theanine"]["uid"], [COND["sleepwalk"]["uid"]], summary="L-theanine use when sleepwalking is present")
uc("uc-theanine-sleep-terrors", "CONDITION", M["theanine"]["uid"], [COND["terrors"]["uid"]], summary="L-theanine use when night terrors are present")
uc("uc-caffeine-timing", "TIMING", M["caffeine"]["uid"], timing="BEDTIME-PT10H/BEDTIME-PT8H", summary="caffeine within 8-10 h of bedtime", extra={"timingWindow": "BEDTIME-PT10H/BEDTIME-PT8H"})

A = []


def asrt(id_, predicate, subject, obj=None, asserter=HUBERMAN, locs=(), qualifiers=None, kind="RELATIONSHIP", value=None,
         polarity="POSITIVE", speech="STATES", basis="UNSTATED", validity=None, resolves=None, proposition=None, note=None, extra=None):
    a = {"id": id_, "uid": f"hu:assertion:d5-sleep-{id_}", "predicate": predicate, "assertionKind": kind,
         "subject": subject, "object": obj, "asserter": asserter, "locators": list(locs), "qualifiers": qualifiers,
         "valueString": value, "polarity": polarity, "speechAct": speech, "basisKind": basis,
         "proposition": proposition, "validity": validity or {"validFrom": None, "validFromBasis": "OBSERVATION_ONLY"},
         "status": "PROPOSED", "recordedAt": "<service-assigned at apply>",
         "resolvesToConstraint": resolves, "producedBy": PB, "note": note}
    if extra:
        a.update(extra)
    A.append({k: v for k, v in a.items() if v is not None})


EP_VALID = {"validFrom": "2021-09-20T00:00:00Z", "validFromPrecision": "DAY", "validFromBasis": "PUBLICATION_PROXY", "validTo": None, "validToBasis": "UNKNOWN"}
asrt("a01-has-edition", "HAS_EDITION", PROTOCOL, EDITION, asserter=HLAB,
     locs=["l12-step08", "l13-mg", "l18-theanine-caution", "l19-mg-stomach", "l31-step08-2021", "l32-mg-2021", "l33-theanine-caution-2021", "l34-mg-stomach-2021", "l02-date"],
     validity=EP_VALID, kind="FIELD",
     proposition="The page shows the step payload of edition e1 (payloadHash below) in both captures (2021-10-18 archive, 2026-10-08 live).",
     note="state.attach authorizing Assertion of the HAS_EDITION episode (StateEpisodeProperties). validFrom = displayed date 'September 20, 2021' corroborated by the 2021-10-18 archive capture with the same payload; validTo unknown (page still shows e1 on 2026-10-08).")
asrt("a02-authored-by", "PROTOCOL_AUTHORED_BY", PROTOCOL, HUBERMAN, asserter=HLAB, locs=["l03b-signoff", "l42-signoff-2021", "l03-author"], kind="RELATIONSHIP",
     qualifiers=None, extra={"attributionBasis": "INFERRED (no byline: first-person body signed 'Best wishes, Andrew' in both captures; the sign-up box names Dr. Andrew Huberman as sender)"},
     note="D5 predicate, object D7.Person; no population qualifier (exempt per 05 predicateOnly). Authorship is inferred, not stated: the page has no byline (adversarial review); basisKind stays UNSTATED.")
asrt("a03-intended-for-sleep", "INTENDED_FOR_TARGET", EDITION, T_SLEEP, asserter=HLAB, locs=["l01-title"],
     qualifiers=["population:UNSPECIFIED", "claimClass:NONE_STATED"], proposition="The protocol's stated purpose is sleep ('Toolkit for Sleep').")
for ref, c in [("uc-theanine-dreams", "dreams"), ("uc-theanine-sleepwalking", "sleepwalk"), ("uc-theanine-sleep-terrors", "terrors")]:
    asrt(f"a04-theanine-avoid-{c}", "USE_CONSTRAINED_IN", {"uid": M["theanine"]["uid"], "type": M["theanine"]["type"]}, {"uid": COND[c]["uid"], "type": "D2.Condition"},
         locs=["l18-theanine-caution", "l33-theanine-caution-2021"], qualifiers=["population:UNSPECIFIED", "section:PROTOCOL_TEXT"], value="AVOID",
         speech="CAUTIONS", resolves=UC[ref]["uid"], proposition="Author caution: do not take L-theanine " + {"dreams": "if you have overly intense dreams", "sleepwalk": "if you sleep-walk", "terrors": "if you have night terrors"}[c] + ".")
asrt("a05-caffeine-window", "USE_CONSTRAINED_IN", {"uid": M["caffeine"]["uid"], "type": "D1.ChemicalSubstance"}, None,
     locs=["l06-step03"], qualifiers=["population:UNSPECIFIED", "section:PROTOCOL_TEXT", "window:BEDTIME-PT10H/BEDTIME-PT8H"], value="AVOID", speech="RECOMMENDS",
     resolves=UC["uc-caffeine-timing"]["uid"], proposition="Avoid caffeine within 8-10 hours of bedtime.")
asrt("a06-mg-gi-upset", "CAUSES_ADVERSE_EFFECT", {"uid": M["mg"]["uid"], "type": "D1.ChemicalSubstance"}, {"uid": COND["gi"]["uid"], "type": "D2.Condition"},
     locs=["l19-mg-stomach", "l34-mg-stomach-2021"], qualifiers=["population:UNSPECIFIED", "sourceKind:PROTOCOL_AUTHOR", "context:THERAPEUTIC", "severity:SOURCE_TEXT:agitated stomach"],
     value="~5%", proposition="Some people (~5%) get an agitated stomach from magnesium supplementation; in which case, do not take it.",
     note="frequency is the author's own figure, kept verbatim; no dose stated for the effect.")
asrt("a07-alcohol-worsens-sleep", "WORSENS_TARGET", {"uid": M["alcohol"]["uid"], "type": "D12.FoodItem"}, T_SLEEP, locs=["l24-step11"],
     qualifiers=["population:UNSPECIFIED"], proposition="Drinking alcohol messes up your sleep.",
     note="'As do most sleep medications' names no resolvable entity: staged as a Mention (intent mention.stage), no assertion.")
asrt("a08-interest-momentous-2026", "RECEIVES_VALUE_FROM", HUBERMAN, MOMENTOUS, locs=["l20-momentous", "l21-affiliate"],
     qualifiers=["valueKind:AFFILIATE_COMMISSION"], validity={"validFrom": None, "validFromBasis": "OBSERVATION_ONLY"},
     note="D7-owned predicate (asserted edge RECEIVES_VALUE_FROM, ValueEdgeProperties). valueKind from the printed link parameter 'utm_medium=affiliate'. NOT a new protocol edition (OQ-D5-08). firstObservedAt 2026-10-08.")
asrt("a09-interest-thorne-2021", "RECEIVES_VALUE_FROM", HUBERMAN, THORNE, locs=["l35-thorne-2021", "l36-thorne-discount-2021"],
     qualifiers=["valueKind:NOT_STATED"], validity={"validFrom": None, "validFromBasis": "OBSERVATION_ONLY"},
     note="D7-owned. The 2021 page names Thorne as the author's supplier with an audience discount link (thorne.com/u/huberman); what the author receives is not stated, so valueKind is left to D7. observedAt 2021-10-18. Overlap with the HAS_EDITION episode answers Q-D5-13 (same edition, two interests over time).")

asrt("a10-no-affiliation-swanson-2021", "RECEIVES_VALUE_FROM", HUBERMAN, SWANSON, locs=["l39-swanson-2021"], polarity="NEGATIVE", speech="DENIES",
     qualifiers=["interestScope:ANY_AFFILIATION", "subjectAsStated:we"], validity={"validFrom": None, "validFromBasis": "OBSERVATION_ONLY"}, extra={"validObservedAt": "2021-10-18T16:06:34Z"},
     proposition="We have no affiliation to Swanson (named as the only known apigenin source).",
     note="A stated non-interest (D7-owned predicate, polarity NEGATIVE = denial): it authorizes no RECEIVES_VALUE_FROM episode. The 2026 page drops the sentence (and names no apigenin source). 'we' is read as the author and his lab. How D7 records a denied interest is OQ-D5-44.")

ADJ = [{"uid": f"hu:adjudication:d5-sleep-cf-{a['id']}", "adjudicationKind": "CAPTURE_FIDELITY", "evaluates": a["uid"],
        "verdict": "DIRECTLY_SUPPORTED", "judgeKind": "DETERMINISTIC", "methodVersion": "fixture-exact-reselect/1",
        "rationale": "every declared locator's exact quote re-selected at its offsets in the snapshot bytes whose sha256 equals contentHash",
        "producedBy": {"missionId": MISSION, "runId": f"run:ft-D5-{FIX}-verify"}} for a in A]

# ---------------------------------------------------------------------------------------------------------------
# Directive 3.8 path: chunk (D9) over the 2026 snapshot text, MENTIONS (derived), span overlap with locators
# ---------------------------------------------------------------------------------------------------------------
c_start = L["l12-step08"].start
c_end = L["l19-mg-stomach"].end
chunk_text = S26.text[c_start:c_end]
covered = [r for r, l in L.items() if l.snap is S26 and l.start >= c_start and l.end <= c_end]
CHUNK = {"uid": "hu:chunk:d5-sleep-2026-step08", "type": "D9.Chunk", "snapshot": S26.uid, "chunkIndex": "<chunker-assigned>",
         "startOffset": c_start, "endOffset": c_end, "textSha256": "sha256:" + sha_text(chunk_text),
         "textVersionHash": S26.digest, "textBasis": "HTML_EXTRACT", "extractorVersion": "tavily-extract/cli-0.1.5",
         "normalizationVersion": "none (offsets on the stored markdown as captured)", "chunkerVersion": "fixture-span/0 (one chunk = step 8 block)",
         "embeddingModel": "<D9 index model>",
         "coversLocators (derived span-overlap/v1)": [L[r].uid for r in covered],
         "mentions (derived, entity-link fixture/0; candidates only, never evidence)": [M["mgthr"]["uid"], M["mgbis"]["uid"], M["apigenin"]["uid"], M["theanine"]["uid"], M["glycine"]["uid"], M["gaba"]["uid"], M["mg"]["uid"], COND["sleepwalk"]["uid"], COND["terrors"]["uid"]],
         "producedBy": {"missionId": MISSION, "runId": f"run:ft-D5-{FIX}-chunk-projection"}}
cited = sorted({a["id"] for a in A for lr in a["locators"] if lr in covered})

# ---------------------------------------------------------------------------------------------------------------
# Write locators.yaml, assertions.yaml, intent.json
# ---------------------------------------------------------------------------------------------------------------
os.makedirs(OUT, exist_ok=True)
dump_yaml(os.path.join(OUT, "locators.yaml"), {
    "fixture": FIX, "offsetBasis": OFFSET_BASIS, "note": FIXTURE_NOTE,
    "snapshots": [S26.record(), S21.record()],
    "locators": [l.record() for l in L.values()],
}, "# Locators for fixture sleep-toolkit-unstructured. Generated by scratch ft/D5/gen/gen_sleep.py from fresh captures\n# (2026-10-08); every exact quote was re-found by exact substring match and its offsets computed, not typed.")

structural = []
structural.append({"type": "HAS_EDITION", "class": "asserted (episode)", "from": PROTOCOL["uid"], "to": EDITION["uid"], "authorizingAssertion": "hu:assertion:d5-sleep-a01-has-edition",
                   "edgeProperties": {**EP_VALID, "recordedFrom": "<service-assigned>", "recordedTo": None, "lastWriterRunId": PB["runId"]}})
for r in step_records:
    structural.append({"type": "HAS_STEP", "from": EDITION["uid"], "to": r["uid"], "orderIndex": r["orderIndex"]})
for r in step_records:
    for u in r["uses"]:
        structural.append({"type": "STEP_USES", "from": r["uid"], "to": u})
derived = []
# STATES_CONSTRAINT (derived, adversarial review): the author's caution Assertion cites the step's own locator and resolves
# to a UseConstraint -> the step gets the edge. Checked here: every constraint a step lists is reached that way.
for r in step_records:
    for c in r["statesConstraints"]:
        src = [a["uid"] for a in A if a.get("resolvesToConstraint") == UC[c]["uid"] and r["locatorRef"] in a["locators"]]
        assert src, (r["stepKey"], c)
        derived.append({"type": "STATES_CONSTRAINT", "from": r["uid"], "to": UC[c]["uid"],
                        "edgeProperties": {"derivationRule": UCK + " (stated-by-step: caution Assertion cites the step locator)", "derivedFromAssertionUids": src, "derivedAt": "<projection run>", "lastWriterRunId": f"run:ft-D5-{FIX}-constraint-projection"}})
for a in A:
    if a.get("resolvesToConstraint"):
        derived.append({"type": "RESOLVES_TO_CONSTRAINT", "from": a["uid"], "to": a["resolvesToConstraint"],
                        "edgeProperties": {"derivationRule": UCK, "derivedFromAssertionUids": [a["uid"]], "derivedAt": "<projection run>", "lastWriterRunId": f"run:ft-D5-{FIX}-constraint-projection"}})

entities = [
    {**T_SLEEP, "name": "Sleep", "props": {"key": "target:sleep", "vocabVersion": "0.2.0", "status": "ACTIVE"}},
    {**PROTOCOL, "name": "Toolkit for Sleep (Huberman Lab)", "props": {"canonicalUri": S26.source_uri}},
    {**EDITION, "name": "Toolkit for Sleep, edition e1", "props": {"payloadHash": edition_payload, "payloadCanonicalizationVersion": "d5-step-payload/0 (fixture)", "stepKeyAlignmentVersion": "fixture-manual/0", "changeProvenance": "SNAPSHOT_DIFF", "displayedDateText": "September 20, 2021", "firstObservedAt": S21.observed_at, "lastObservedAt": S26.retrieved_at, "stepCount": len(step_records)}},
    {**HUBERMAN, "name": "Andrew Huberman"}, {**HLAB, "name": "Huberman Lab"}, {**MOMENTOUS, "name": "Momentous"}, {**THORNE, "name": "Thorne"}, {**SWANSON, "name": "Swanson (Swanson Health)"},
] + [{"uid": v["uid"], "type": v["type"], "name": v["name"], **({"props": v["props"]} if v.get("props") else {})} for v in M.values()] + \
    [{"uid": v["uid"], "type": v["type"], "name": v["name"]} for v in COND.values()]

dump_yaml(os.path.join(OUT, "assertions.yaml"), {
    "fixture": FIX, "note": FIXTURE_NOTE, "producedBy": PB,
    "activity": {"uid": "hu:activity:ft-d5-sleep-toolkit-unstructured", "activityKind": "INGESTION", "externalRunSystem": "mission-control", "runId": PB["runId"], "missionId": MISSION, "operationKind": "knowledge.ingestion_apply (fixture)", "agent": "hu:agent:a5-fixtures-stage"},
    "entities": entities,
    "steps": step_records,
    "stepSpanRefind2021": refind,
    "useConstraints": list(UC.values()),
    "assertions": A,
    "adjudications": ADJ,
    "edges": {"structuralAndEpisode": structural, "derived": derived},
    "retrievalPath": {"directive": "00-DIRECTIVE 3.8", "chunk": CHUNK, "assertionsCitingCoveredLocators": cited},
}, "# Assertions, entities, steps, constraints and edges for fixture sleep-toolkit-unstructured (kernel pattern: packets/K/09-reasoning.md).\n# Generated by scratch ft/D5/gen/gen_sleep.py. Subjects/objects are typed <module>.<Type> per 04-schema-proposal.graphql and 10-seams.yaml.")

# intent (biotech-knowledge-intent.v1)
subj = []


def ns(ref, ent, nodeType, props=None, onMatch="use_existing", seg=None):
    s = {"ref": ref, "mode": "new", "nodeType": nodeType, "name": ent.get("name", ref), "properties": props or {}, "onMatch": onMatch}
    if seg:
        s["uidSegment"] = seg
    subj.append(s)


ns("protocol", {"name": "Toolkit for Sleep (Huberman Lab)"}, "Protocol", {"canonicalUri": S26.source_uri})
ns("edition", {"name": "Toolkit for Sleep, edition e1"}, "ProtocolEdition", {"payloadHash": edition_payload, "changeProvenance": "SNAPSHOT_DIFF", "displayedDateText": "September 20, 2021"}, onMatch="create_anyway", seg="huberman-toolkit-for-sleep-e1")
subj.append({"ref": "t-sleep", "mode": "resolved", "uid": "hu:target:sleep", "nodeType": "Target"})
ns("huberman", {"name": "Andrew Huberman"}, "Person")
ns("hlab", {"name": "Huberman Lab"}, "Organization")
ns("momentous", {"name": "Momentous"}, "Organization")
ns("thorne", {"name": "Thorne"}, "Organization")
ns("swanson", {"name": "Swanson (Swanson Health)"}, "Organization")
for k, v in {**M, **COND}.items():
    ns(f"m-{k}", v, v["type"].split(".")[1], v.get("props"))
for r in step_records:
    props = {k: r[k] for k in ["stepKey", "payloadHash", "stepKind", "requirementLevel", "requirementBasis", "targetKeys", "appliesToPopulations", "exactText", "locatorUid"] if k in r}
    for k in ["alternativeGroup", "statedLevel", "speechAct", "conditionText", "doseMin", "doseMax", "doseUnit", "dosePeriod", "intakeScope", "timeAnchor", "offsetMinutesMin", "offsetMinutesMax", "occurrencesPerPeriodMin", "occurrencesPerPeriodMax", "occurrencePeriodUnit", "reviewAction", "dependsOnStepKeys", "scheduleText", "notReportedFields"]:
        if k in r:
            props[k] = r[k]
    ns(f"step-{r['stepKey']}", {"name": f"e1 {r['stepKey']}"}, "ProtocolStep", props, onMatch="create_anyway", seg=f"huberman-sleep-e1-{r['stepKey']}")
for ref, u in UC.items():
    ns(ref, {"name": u["summary"]}, "UseConstraint", {k: u[k] for k in ["constraintKind", "identityKey", "identityKeyHash", "identityKeyVersion", "timingWindow"] if k in u}, seg=u["uid"].split(":", 2)[2])

refmap = {"hu:protocol:huberman-lab-toolkit-for-sleep": "protocol", EDITION["uid"]: "edition", "hu:target:sleep": "t-sleep",
          HUBERMAN["uid"]: "huberman", HLAB["uid"]: "hlab", MOMENTOUS["uid"]: "momentous", THORNE["uid"]: "thorne", SWANSON["uid"]: "swanson"}
for k, v in {**M, **COND}.items():
    refmap[v["uid"]] = f"m-{k}"
props = []
props.append({"proposalId": "p-edition", "kind": "state.attach", "subjectRef": "protocol", "stateRef": "edition", "relationshipType": "HAS_EDITION",
              "evidence": A[0]["locators"], "assertion": {"speechAct": "STATES", "validity": {k: v for k, v in EP_VALID.items() if v is not None}}})
for r in step_records:
    props.append({"proposalId": f"p-hs-{r['stepKey']}"[:64], "kind": "edge.structural", "relationshipType": "HAS_STEP", "fromRef": "edition", "toRef": f"step-{r['stepKey']}", "properties": {"orderIndex": r["orderIndex"]}, "evidence": [r["locatorRef"]]})
    for u in r["uses"]:
        props.append({"proposalId": f"p-su-{r['stepKey']}-{refmap[u]}"[:64], "kind": "edge.structural", "relationshipType": "STEP_USES", "fromRef": f"step-{r['stepKey']}", "toRef": refmap[u], "evidence": [r["locatorRef"]]})
for a in A[1:]:
    p = {"proposalId": f"p-{a['id']}"[:64], "kind": "edge.assert", "relationshipType": a["predicate"], "fromRef": refmap[a["subject"]["uid"]],
         "toRef": refmap[a["object"]["uid"]] if a.get("object") else None, "evidence": a["locators"], "asserterRef": refmap[a["asserter"]["uid"]],
         "assertion": {"predicate": a["predicate"], "polarity": a["polarity"], "speechAct": a["speechAct"], "basisKind": a["basisKind"], "validity": {k: v for k, v in a["validity"].items() if v is not None}},
         "rationale": "qualifiers=" + ";".join(a.get("qualifiers") or []) + (f" valueString={a['valueString']}" if a.get("valueString") else "") + " (intent v1 cannot carry Assertion.qualifiers/valueString on edge.assert: OQ-D5-27)"}
    if p["toRef"] is None:
        p = {"proposalId": p["proposalId"], "kind": "assertion.literal", "subjectRef": p["fromRef"], "predicate": a["predicate"], "valueString": a.get("valueString"), "evidence": a["locators"], "asserterRef": p["asserterRef"], "assertion": p["assertion"], "rationale": p["rationale"]}
    props.append(p)
props.append({"proposalId": "p-mention-sleep-meds", "kind": "mention.stage", "locatorRef": "l24-step11", "surfaceForm": "most sleep medications", "candidateNodeType": "Intervention", "reason": "drug class named without members; a WORSENS_TARGET assertion needs a resolvable subject"})
props.append({"proposalId": "p-mention-intense-dreams", "kind": "mention.stage", "locatorRef": "l18-theanine-caution", "surfaceForm": "overly intense dreams", "candidateNodeType": "Condition", "reason": "lay phrase; D2 resolution (e.g. nightmare disorder) needs a RESOLUTION assessment"})
intent = {
    "schemaVersion": "biotech-knowledge-intent.v1", "intentId": "ft-d5-sleep-toolkit-unstructured",
    "context": {"actor": {"kind": "agent", "id": "a5-fixtures-stage", "model": "claude-opus-5-5"}, "run": {"system": "mission-control", "runId": PB["runId"], "missionId": MISSION}, "activityKind": "EXTRACTION"},
    "onStale": "fail",
    "sources": [
        {"ref": "src-2026", "source": {"canonicalUri": S26.source_uri, "title": S26.title, "sourceKind": "WEB_PAGE"}, "snapshot": {"observedAt": S26.retrieved_at, "retrievedAt": S26.retrieved_at, "contentHash": S26.digest, "contentHashBasis": S26.basis, "captureCompleteness": S26.completeness}, "locators": [l.intent() for l in L.values() if l.snap is S26]},
        {"ref": "src-2021", "source": {"canonicalUri": S21.source_uri, "title": S21.title, "sourceKind": "WEB_PAGE"}, "snapshot": {"observedAt": S21.observed_at, "retrievedAt": S21.retrieved_at, "contentHash": S21.digest, "contentHashBasis": S21.basis, "captureCompleteness": S21.completeness, "properties": {"archiveUri": "http://web.archive.org/web/20211018160634/https://hubermanlab.com/toolkit-for-sleep/"}}, "locators": [l.intent() for l in L.values() if l.snap is S21]},
    ],
    "subjects": subj,
    "proposals": props,
    "notes": "Fixture intent (fixture ids). Gaps against biotech-knowledge-intent.v1 recorded in 11-open-questions.md OQ-D5-27: (1) no proposal kind for a predicate-only Assertion with an object node (D5 predicates are written here as edge.assert with relationshipType = predicate, which the planner would reject because they are not schema relationship types); (2) AssertionCore has no qualifiers / valueString, so the mandatory population qualifier and the directive level travel in rationale; (3) the derived RESOLVES_TO_CONSTRAINT and STATES_CONSTRAINT edges and the D9 chunk/MENTIONS are projection outputs, not intent proposals; (4) the NEGATIVE RECEIVES_VALUE_FROM (a10, stated non-affiliation) authorizes no D7 episode.",
}
dump_json(os.path.join(OUT, "intent.json"), intent)

summary = {"snapshots": {s.ref: s.record() for s in [S26, S21]}, "edition_payload": edition_payload, "refind": refind,
           "chunk": {k: CHUNK[k] for k in ["startOffset", "endOffset", "textSha256"]}, "covered": covered, "cited": cited,
           "counts": {"locators": len(L), "assertions": len(A), "steps": len(step_records), "useConstraints": len(UC), "proposals": len(props)}}
dump_json(os.path.join(SCRATCH, "gen", f"summary-{FIX}.json"), summary)
print(json.dumps(summary["counts"]), edition_payload)
print("refind", refind)
