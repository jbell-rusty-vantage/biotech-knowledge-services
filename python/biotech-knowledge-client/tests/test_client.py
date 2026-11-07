import json
import subprocess
from pathlib import Path

import pytest

from biotech_knowledge_client import canonical_json, digest_of, validate_contract
from biotech_knowledge_client.models import Plan, Receipt, ReadSnapshot

REPO = Path(__file__).resolve().parents[3]
EXAMPLES = REPO / "examples"


def test_canonical_json_matches_typescript_digest():
    """The TypeScript digest of the example intent must equal the Python digest (cross-language wire truth)."""
    intent = json.loads((EXAMPLES / "ingestion-intent.example.json").read_text(encoding="utf-8"))
    py = digest_of(intent)
    script = "import { digestOf } from '@bks/contracts'; import { readFileSync } from 'node:fs'; console.log(digestOf(JSON.parse(readFileSync(process.argv[1], 'utf8'))));"
    ts = subprocess.run(
        ["node", "--input-type=module", "-e", script, str(EXAMPLES / "ingestion-intent.example.json")],
        cwd=REPO / "packages" / "kg-ops",
        capture_output=True,
        text=True,
        check=True,
    ).stdout.strip()
    assert py == ts


def test_canonical_json_sorts_keys_and_drops_integral_fraction():
    assert canonical_json({"b": 1, "a": [60.0, {"z": None, "y": "é"}]}) == '{"a":[60,{"y":"é","z":null}],"b":1}'


def test_example_intents_validate_against_exported_schemas():
    intent = json.loads((EXAMPLES / "ingestion-intent.example.json").read_text(encoding="utf-8"))
    assert validate_contract("intent-v1", intent) == []
    read_intent = json.loads((EXAMPLES / "read-intent.example.json").read_text(encoding="utf-8"))
    assert validate_contract("read-intent", read_intent) == []
    broken = {**intent, "proposals": [{"proposalId": "x", "kind": "edge.delete"}]}
    assert validate_contract("intent-v1", broken)


def test_models_parse_executor_outputs():
    runs = REPO / "runs" / "cli-smoke"
    if not (runs / "plan.json").exists():
        pytest.skip("no CLI smoke artifacts; run the kg plan/apply smoke first")
    plan = Plan.model_validate(json.loads((runs / "plan.json").read_text(encoding="utf-8")))
    assert plan.outcome in ("applicable", "partial", "noop", "rejected")
    receipt = Receipt.model_validate(json.loads((runs / "receipt.json").read_text(encoding="utf-8")))
    assert receipt.intent_id == plan.intent_id
    snapshot = ReadSnapshot.model_validate(json.loads((runs / "snapshot.json").read_text(encoding="utf-8")))
    assert snapshot.preconditions() and all("uid" in p for p in snapshot.preconditions())
