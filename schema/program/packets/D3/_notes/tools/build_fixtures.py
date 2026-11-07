"""Build the D3 fixtures (A4, fixtures stage, 2026-10-08).

usage: python -I build_fixtures.py <scratch raw dir> <packet dir> [fixture ...]

Reads the fresh captures in <scratch raw dir> (never committed), computes and re-selects every locator, and writes
07-fixtures/<name>/{locators.yaml, assertions.yaml, intent.json} (+ directive-3.8-walk.yaml for the unstructured fixture).
source.md and questions.md are hand-written from the build summary (printed at the end).
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import importlib  # noqa: E402

import emit  # noqa: E402

RAW = Path(sys.argv[1])
PACKET = Path(sys.argv[2])
WANT = set(sys.argv[3:])
BUILDERS = {
    "aspree-registry-history-harm": ("fx_aspree", "ft-d3-aspree-2026-10-08"),
    "resveratrol-retraction": ("fx_resveratrol", "ft-d3-resveratrol-2026-10-08"),
    "dq-bone-trial-unstructured": ("fx_dq", "ft-d3-dq-bone-2026-10-08"),
}
summary = {}
for name, (mod, intent_id) in BUILDERS.items():
    if WANT and name not in WANT:
        continue
    fx, extra = importlib.import_module(mod).build(RAW)
    out = PACKET / "07-fixtures" / name
    out.mkdir(parents=True, exist_ok=True)
    walk = extra.pop("_walk", None) if extra else None
    emit.write_locators(fx, out / "locators.yaml")
    emit.write_assertions(fx, out / "assertions.yaml", extra)
    if walk is not None:
        (out / "directive-3.8-walk.yaml").write_text(emit.HEADER.format(name=name, what="directive 3.8 walk", today="2026-10-08") + emit.dump(walk), encoding="utf-8")
    files, nprops = emit.write_intents(fx, out, intent_id)
    rels = {}
    for a in fx.asserts:
        r = a.get("projectsTo", {}).get("relationshipType") or a["predicate"]
        rels[r] = rels.get(r, 0) + 1
    for s in fx.structural:
        rels[s["relationshipType"]] = rels.get(s["relationshipType"], 0) + 1
    summary[name] = {"snapshots": {s.ref: s.digest for s in fx.snaps.values()}, "locators": len(fx.locs), "entities": len(fx.ents),
                     "assertions": len(fx.asserts), "structural": len(fx.structural), "intentFiles": files, "proposals": nprops,
                     "byRelationshipOrPredicate": dict(sorted(rels.items()))}
print(json.dumps(summary, indent=1))
