"""mc.knowledge_request.v1 parity with packages/contracts/src/envelope.ts: golden envelope digests, byte-exact payload
binding (no NFC, no re-encoding), invalid envelopes and the Biotech delivery-state table."""

import base64
import json
import unicodedata
from pathlib import Path

import pytest

from biotech_knowledge_client.canonical import raw_bytes_digest
from biotech_knowledge_client.envelope import (
    DELIVERY_STATES,
    EnvelopeError,
    delivery_state_of_biotech_outcome,
    envelope_canonical,
    envelope_digest,
    unwrap_record,
    verify_envelope_payload,
    wrapped_record,
)

REPO = Path(__file__).resolve().parents[3]
GOLDEN = json.loads((REPO / "packages" / "contracts" / "golden" / "knowledge-request-envelope.v1.json").read_text(encoding="utf-8"))
PAYLOAD = base64.b64decode(GOLDEN["payload"]["base64"])


@pytest.mark.parametrize("vector", GOLDEN["vectors"], ids=[v["id"] for v in GOLDEN["vectors"]])
def test_envelope_digest_matches_typescript(vector):
    assert envelope_canonical(vector["envelope"]) == vector["canonical"]
    assert envelope_digest(vector["envelope"]) == vector["envelopeDigest"]
    assert verify_envelope_payload(vector["envelope"], PAYLOAD)


@pytest.mark.parametrize("vector", GOLDEN["invalid"], ids=[v["id"] for v in GOLDEN["invalid"]])
def test_invalid_envelopes_are_refused(vector):
    with pytest.raises(EnvelopeError):
        envelope_digest(vector["envelope"])


def test_payload_bytes_are_bound_exactly_and_never_normalized():
    assert raw_bytes_digest(PAYLOAD) == GOLDEN["payload"]["payloadDigest"]
    assert len(PAYLOAD) == GOLDEN["payload"]["payloadBytes"]
    nfc = unicodedata.normalize("NFC", PAYLOAD.decode("utf-8")).encode("utf-8")
    assert nfc != PAYLOAD
    envelope = GOLDEN["vectors"][0]["envelope"]
    assert not verify_envelope_payload(envelope, nfc)
    # Parsing and re-serializing the native JSON is a different byte string: the wrapper never does it.
    reserialized = json.dumps(json.loads(PAYLOAD), separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    assert not verify_envelope_payload(envelope, reserialized)


def test_wrapped_record_round_trip_preserves_bytes_and_digests():
    envelope = GOLDEN["vectors"][2]["envelope"]
    record = json.loads(json.dumps(wrapped_record(envelope, PAYLOAD)))
    env2, payload2 = unwrap_record(record)
    assert payload2 == PAYLOAD
    assert envelope_digest(env2) == GOLDEN["vectors"][2]["envelopeDigest"]
    tampered = dict(record, payloadBase64=base64.b64encode(PAYLOAD + b" ").decode())
    with pytest.raises(EnvelopeError):
        unwrap_record(tampered)


def test_wrapper_and_native_digests_are_separate():
    envelope = json.loads(json.dumps(GOLDEN["vectors"][0]["envelope"]))
    before = envelope_digest(envelope)
    assert before != envelope["input"]["payloadDigest"]
    envelope["input"]["nativeDigest"] = "sha256:" + "e" * 64
    assert envelope_digest(envelope) != before


@pytest.mark.parametrize("row", GOLDEN["deliveryMapping"], ids=[f"{r['outcome']}:{r['failureCode']}" for r in GOLDEN["deliveryMapping"]])
def test_delivery_state_table(row):
    assert delivery_state_of_biotech_outcome(row["outcome"], row["failureCode"]) == row["delivery"]
    assert row["delivery"] in DELIVERY_STATES
