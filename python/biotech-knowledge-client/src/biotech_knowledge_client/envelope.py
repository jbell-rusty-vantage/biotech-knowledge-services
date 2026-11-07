"""mc.knowledge_request.v1 envelope (S7), byte-for-byte with packages/contracts/src/envelope.ts.

The envelope wraps a native payload; it never translates it:

* the payload bytes travel unchanged (camelCase stays camelCase; no Unicode normalization; no re-encoding);
  ``input.payloadDigest`` is ``raw_bytes_digest`` of exactly those bytes;
* ``input.nativeDigest`` is the digest the native service reports (Biotech: ``plan.binding.intentDigest``); this module
  never recomputes a native digest with another canonicalization;
* the wrapper digest is bks-canonical-json.v2 of the envelope dict exactly as validated (every member present,
  integers only), so it equals the TypeScript ``envelopeDigest``. Golden vectors:
  packages/contracts/golden/knowledge-request-envelope.v1.json.

Envelope dicts keep the wire (camelCase) keys. Structure is validated against the exported JSON Schema
``mc.knowledge_request.v1.json``; the cross-field rules the JSON Schema cannot express are checked here.
"""

from __future__ import annotations

import base64
import json
from typing import Any

from .canonical import canonical_digest, canonical_instant, canonicalize, raw_bytes_digest
from .models import validate_contract

KNOWLEDGE_REQUEST_V1 = "mc.knowledge_request.v1"
KNOWLEDGE_DELIVERY_V1 = "mc.knowledge_delivery.v1"
DELIVERY_STATES = ("pending", "applied", "rejected", "unresolved")
VERIFICATION_STATES = ("not_required", "pending", "completed", "failed")
EFFECT_OPERATIONS = ("knowledge.ingestion_apply", "knowledge.receipt_get", "knowledge.verify_result", "knowledge.classify_admit")
RETRYABLE_NO_EFFECT_CODES = ("BKS_WITNESS_EXPIRED", "BKS_TIMEOUT", "BKS_AUTHORITY_UNAVAILABLE", "BKS_EFFECT_PENDING")


class EnvelopeError(ValueError):
    def __init__(self, problems: list[str]):
        super().__init__("; ".join(problems))
        self.problems = problems


def semantic_problems(envelope: dict[str, Any]) -> list[str]:
    """Cross-field rules of KnowledgeRequestEnvelope.superRefine (envelope.ts `checkEnvelope`)."""
    problems: list[str] = []
    identity, target, inp, pre = envelope["identity"], envelope["target"], envelope["input"], envelope["preconditions"]
    mission, native_run = identity["mission"], identity["nativeRun"]
    if mission is not None:
        if native_run["system"] != "mission-control" or native_run["runId"] != mission["runId"]:
            problems.append("identity/nativeRun: a mission-correlated request uses nativeRun {system: mission-control, runId: mission.runId}")
    elif native_run["system"] == "mission-control":
        problems.append("identity/nativeRun/system: a standalone request uses a native run namespace, never mission-control")
    if target["operation"] in EFFECT_OPERATIONS and not identity["effectKey"]:
        problems.append(f"identity/effectKey: {target['operation']} requires a stable semantic effectKey")
    if target["operation"] == "knowledge.ingestion_apply" and (not pre["planRef"] or not pre["expectedPlanDigest"]):
        problems.append("preconditions: knowledge.ingestion_apply requires planRef and expectedPlanDigest")
    if target["schemaReleaseDigest"] != pre["releasePins"]["schemaReleaseDigest"]:
        problems.append("preconditions/releasePins/schemaReleaseDigest: release pin differs from the target binding release")
    present = [inp["payloadRef"] is not None, inp["payloadDigest"] is not None, inp["payloadBytes"] is not None]
    if any(present) and not all(present):
        problems.append("input: payloadRef, payloadDigest and payloadBytes are set together")
    deadline = envelope["governors"]["deadline"]
    if deadline is not None:
        try:
            if canonical_instant(deadline) != deadline:
                problems.append("governors/deadline: canonical UTC instant required")
        except ValueError:
            problems.append("governors/deadline: not an instant")
    return problems


def validate_envelope(envelope: dict[str, Any]) -> dict[str, Any]:
    """Validates structure (JSON Schema) and cross-field rules; returns the envelope unchanged."""
    problems = validate_contract(KNOWLEDGE_REQUEST_V1, envelope)
    if not problems:
        problems = semantic_problems(envelope)
    if problems:
        raise EnvelopeError(problems)
    return envelope


def envelope_canonical(envelope: dict[str, Any]) -> str:
    return canonicalize(validate_envelope(envelope))


def envelope_digest(envelope: dict[str, Any]) -> str:
    """Wrapper digest (bks-canonical-json.v2). Separate from payloadDigest (raw bytes) and nativeDigest (native)."""
    return canonical_digest(validate_envelope(envelope))


def payload_binding(payload: bytes) -> dict[str, Any]:
    return {"payloadDigest": raw_bytes_digest(payload), "payloadBytes": len(payload)}


def verify_envelope_payload(envelope: dict[str, Any], payload: bytes) -> bool:
    return envelope["input"]["payloadDigest"] == raw_bytes_digest(payload) and envelope["input"]["payloadBytes"] == len(payload)


def delivery_state_of_biotech_outcome(outcome: str, failure_code: str | None = None) -> str:
    """Same table as envelope.ts `deliveryStateOfBiotechOutcome`."""
    if outcome in ("applied", "partial", "noop", "duplicate"):
        return "applied"
    if outcome == "rejected":
        return "rejected"
    if outcome == "failed":
        return "pending" if failure_code in RETRYABLE_NO_EFFECT_CODES else "rejected"
    if outcome == "unresolved":
        return "unresolved"
    raise ValueError(f"unknown biotech receipt outcome {outcome}")


def wrapped_record(envelope: dict[str, Any], payload: bytes) -> dict[str, Any]:
    """A self-describing wrapper record (envelope + exact payload bytes as base64) for custody or cross-language checks."""
    if not verify_envelope_payload(envelope, payload):
        raise EnvelopeError(["input/payloadDigest: payload bytes do not match the envelope"])
    return {"format": "mc.knowledge_request.wrapped.v1", "envelope": envelope, "envelopeDigest": envelope_digest(envelope), "payloadBase64": base64.b64encode(payload).decode("ascii")}


def unwrap_record(record: dict[str, Any]) -> tuple[dict[str, Any], bytes]:
    envelope = record["envelope"]
    payload = base64.b64decode(record["payloadBase64"])
    if envelope_digest(envelope) != record["envelopeDigest"]:
        raise EnvelopeError(["envelopeDigest: wrapper digest mismatch"])
    if not verify_envelope_payload(envelope, payload):
        raise EnvelopeError(["input/payloadDigest: payload bytes were altered"])
    return envelope, payload


def dumps_record(record: dict[str, Any]) -> str:
    return json.dumps(record, ensure_ascii=False, indent=2) + "\n"
