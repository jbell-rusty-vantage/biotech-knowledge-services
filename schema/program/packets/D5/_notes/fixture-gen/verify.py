"""Effectiveness test (directive 3.8): for every fixture, re-select every locator from the snapshot bytes named by its
contentHash, and walk assertion -> locator -> snapshot. Prints one line per fixture; exits 1 on any mismatch."""
import json
import os
import sys

import yaml

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import FIXTURES, SCRATCH, json_pointer, sha_file  # noqa

bad = 0
for fx in sorted(os.listdir(FIXTURES)):
    d = os.path.join(FIXTURES, fx)
    if not os.path.isdir(d):
        continue
    locs = yaml.safe_load(open(os.path.join(d, "locators.yaml"), encoding="utf-8"))
    asr = yaml.safe_load(open(os.path.join(d, "assertions.yaml"), encoding="utf-8"))
    snaps = {}
    for s in locs["snapshots"]:
        p = os.path.join(SCRATCH, s["scratchFile"])
        ok = "sha256:" + sha_file(p) == s["contentHash"]
        text = open(p, encoding="utf-8").read()
        snaps[s["ref"]] = (s, text, json.loads(text) if s["mimeType"] == "application/json" else None)
        if not ok:
            bad += 1
            print("HASH MISMATCH", fx, s["ref"])
    byref = {}
    reselect_ok = 0
    for l in locs["locators"]:
        s, text, doc = snaps[l["snapshot"]]
        base = text if "jsonPointer" not in l else str(json_pointer(doc, l["jsonPointer"]))
        if base[l["startOffset"]:l["endOffset"]] == l["exact"]:
            reselect_ok += 1
        else:
            bad += 1
            print("RESELECT FAIL", fx, l["ref"])
        byref[l["ref"]] = l
    walked = 0
    for a in asr["assertions"]:
        for r in a["locators"]:
            if r not in byref:
                bad += 1
                print("MISSING LOCATOR", fx, a["id"], r)
        if a.get("producedBy", {}).get("missionId") and a.get("producedBy", {}).get("runId"):
            walked += 1
        else:
            bad += 1
            print("NO producedBy", fx, a["id"])
        if a["predicate"] not in ("PROTOCOL_AUTHORED_BY", "HAS_EDITION", "RECEIVES_VALUE_FROM") and not any(q.startswith("population:") for q in a.get("qualifiers") or []):
            bad += 1
            print("NO population qualifier", fx, a["id"])
    extra = ""
    rp = asr.get("retrievalPath")
    if rp:
        ch = rp["chunk"]
        s, text, _ = snaps[[k for k, v in snaps.items() if v[0]["uid"] == ch["snapshot"]][0]]
        import hashlib
        ctext = text[ch["startOffset"]:ch["endOffset"]]
        cok = "sha256:" + hashlib.sha256(ctext.encode("utf-8")).hexdigest() == ch["textSha256"]
        covered = [l for l in locs["locators"] if l["uid"] in ch["coversLocators (derived span-overlap/v1)"]]
        inside = all(ch["startOffset"] <= l["startOffset"] and l["endOffset"] <= ch["endOffset"] for l in covered)
        extra = f" chunk[{ch['startOffset']},{ch['endOffset']}) textHash={'ok' if cok else 'BAD'} covers {len(covered)} locators inside={inside} -> assertions {len(rp['assertionsCitingCoveredLocators'])}"
        if not (cok and inside):
            bad += 1
    print(f"{fx}: snapshots {len(snaps)} hash-verified; locators {reselect_ok}/{len(locs['locators'])} re-selected; assertions {walked} with producedBy + resolvable locators{extra}")
sys.exit(1 if bad else 0)
