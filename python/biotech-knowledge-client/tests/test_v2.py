"""Cross-language parity for contracts v2: bks-canonical-json.v2 golden vectors, intent/plan digest golden over the v2
example, and JSON Schema validation of v2 payloads (the same files the TypeScript suites check)."""

import json
from pathlib import Path

import pytest

from biotech_knowledge_client import (
    CanonicalError,
    PlanV2,
    apply_request,
    canonical_digest,
    canonicalize,
    intent_digest_v2,
    validate_contract,
)
from biotech_knowledge_client.canonical import canonical_date, canonical_decimal, canonical_duration, canonical_instant

REPO = Path(__file__).resolve().parents[3]
GOLDEN = REPO / "packages" / "contracts" / "golden"
EXAMPLES = REPO / "examples"

VECTORS = json.loads((GOLDEN / "canonical-json.v2.json").read_text(encoding="utf-8"))


@pytest.mark.parametrize("vector", VECTORS["vectors"], ids=[v["id"] for v in VECTORS["vectors"]])
def test_canonical_json_v2_golden_vectors(vector):
    value = json.loads(vector["input"])
    profile = vector.get("profile")
    if "error" in vector:
        with pytest.raises(CanonicalError) as info:
            canonicalize(value, profile)
        assert info.value.code == vector["error"]
    else:
        assert canonicalize(value, profile) == vector["canonical"]
        assert canonical_digest(value, profile) == vector["digest"]


SCALAR_FNS = {"instant": canonical_instant, "date": canonical_date, "duration": canonical_duration, "decimal": canonical_decimal}


@pytest.mark.parametrize("scalar", VECTORS["scalars"], ids=[f"{s['kind']}:{s['input']}" for s in VECTORS["scalars"]])
def test_typed_scalar_spellings(scalar):
    fn = SCALAR_FNS[scalar["kind"]]
    if "error" in scalar:
        with pytest.raises(CanonicalError):
            fn(scalar["input"])
    else:
        assert fn(scalar["input"]) == scalar["output"]


def test_intent_and_plan_digest_golden_matches_typescript():
    golden = json.loads((GOLDEN / "intent-digest.v2.json").read_text(encoding="utf-8"))
    assert intent_digest_v2(golden["intent"]["normalized"]) == golden["intent"]["digest"]
    assert canonical_digest(golden["intent"]["normalized"], golden["intent"]["profile"]) == golden["intent"]["digest"]
    assert canonical_digest(golden["plan"]["body"], golden["plan"]["profile"]) == golden["plan"]["digest"]
    plan = PlanV2.model_validate({"schemaVersion": "biotech-knowledge-plan.v2", "planRef": "pl-x", "planDigest": golden["plan"]["digest"], **golden["plan"]["body"]})
    assert plan.outcome == "applicable"
    assert plan.binding.intent_digest == golden["intent"]["digest"]


def test_v2_payloads_validate_against_exported_schemas():
    example = json.loads((EXAMPLES / "ingestion-intent.v2.example.json").read_text(encoding="utf-8"))
    assert validate_contract("intent", example) == []
    golden = json.loads((GOLDEN / "intent-digest.v2.json").read_text(encoding="utf-8"))
    plan_doc = {"schemaVersion": "biotech-knowledge-plan.v2", "planRef": "pl-0123", "planDigest": golden["plan"]["digest"], **golden["plan"]["body"]}
    assert validate_contract("plan", plan_doc) == []
    # onStale and statements are not part of v2: the strict schemas refuse them.
    assert validate_contract("intent", {**example, "onStale": "proceed"})
    plan = PlanV2.model_validate(plan_doc)
    witness = {"format": "bks-apply-witness.v1", "alg": "Ed25519", "kid": "k", "payload": "eyJ4IjoxfQ", "signature": "c2ln"}
    request = apply_request(plan, "ek-1", witness)
    assert validate_contract("apply", request) == []
    assert validate_contract("apply", {**request, "statements": [{"cypher": "CREATE (:X)"}]})


def test_v1_intent_contract_still_decodes():
    v1 = json.loads((EXAMPLES / "ingestion-intent.example.json").read_text(encoding="utf-8"))
    assert validate_contract("intent-v1", v1) == []
    assert validate_contract("intent", v1)  # not a v2 intent


def test_read_v2_contracts_are_exported_and_registered():
    from biotech_knowledge_client.models import CONTRACTS, schema_dir
    from biotech_knowledge_client.models_v2 import ReadResultV2

    assert "empty" in str(ReadResultV2.model_fields["status"].annotation)

    for key in ("read-intent-v2", "cypher-read-intent", "read-result", "read-explain"):
        assert (schema_dir() / f"{CONTRACTS[key]}.json").exists(), key
    from biotech_knowledge_client.models_v2 import PlanV2

    assert "held" in str(PlanV2.model_fields["outcome"].annotation)


def test_sv11_admission_and_read_v3_contracts_are_exported():
    """SV-11: the new wire contracts exist as JSON Schemas and the typed models parse minimal records."""
    from biotech_knowledge_client.models import validate_contract
    from biotech_knowledge_client.models_v2 import AdmissionAckV1, ReadEligibility

    ack = {
        "schemaVersion": "biotech-knowledge-admission-ack.v1",
        "tenantId": "8a3e5c1d-2f4b-4c6d-9e8f-0a1b2c3d4e5f",
        "dispatchId": "dsp-1",
        "effectKey": "ks:effect/1",
        "outcome": "applied",
        "markerDigest": "sha256:" + "0" * 64,
        "payloadDigest": "sha256:" + "1" * 64,
        "planDigest": "sha256:" + "2" * 64,
        "receiptId": "rc-1",
        "graph": {"bookmark": None, "graphRevision": 3, "markerKey": "mk-1"},
        "appliedAt": "2026-10-25T10:00:00.000Z",
        "componentState": "acknowledged",
        "acknowledged": True,
        "reason": None,
        "retryAfterSeconds": None,
        "processedAt": "2026-10-25T10:00:00.000Z",
    }
    assert validate_contract("biotech-knowledge-admission-ack.v1", ack) == []
    assert AdmissionAckV1.model_validate(ack).outcome == "applied"
    assert ReadEligibility.model_validate({"checkedAt": "2026-10-25T10:00:00Z", "state": "authority_unavailable", "excluded": 0, "held": 2}).held == 2
