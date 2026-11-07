"""Pydantic result models plus JSON Schema validation against the exported contracts."""

from __future__ import annotations

import json
import os
from functools import lru_cache
from pathlib import Path
from typing import Any, Literal

from jsonschema import Draft202012Validator
from pydantic import BaseModel, ConfigDict, Field

CONTRACTS = {
    "read-intent": "biotech-knowledge-read-intent.v1",
    "read-snapshot": "biotech-knowledge-read-snapshot.v1",
    "read-intent-v2": "biotech-knowledge-read-intent.v2",
    "cypher-read-intent": "biotech-cypher-read-intent.v1",
    "read-result": "biotech-knowledge-read-result.v2",
    "read-explain": "biotech-cypher-read-explain.v1",
    "intent": "biotech-knowledge-intent.v2",
    "plan": "biotech-knowledge-plan.v2",
    "apply": "biotech-knowledge-apply.v2",
    "receipt": "biotech-knowledge-receipt.v2",
    "witness": "bks-apply-witness.v1",
    "effect-verification": "bks-effect-verification.v1",
    "custody-snapshot": "bks-custody-snapshot.v1",
    "sealed-verification": "bks-sealed-verification.v1",
    "error": "bks-error.v1",
    "intent-v1": "biotech-knowledge-intent.v1",
    "plan-v1": "biotech-knowledge-plan.v1",
    "receipt-v1": "biotech-knowledge-receipt.v1",
    "cypher-request": "biotech-cypher-request.v1",
    "cypher-result": "biotech-cypher-result.v1",
    "workspace-manifest": "bks-schema-workspace-manifest.v1",
}


def schema_dir() -> Path:
    """packages/contracts/json-schema, from BKS_JSON_SCHEMA_DIR or the repository layout."""
    env = os.environ.get("BKS_JSON_SCHEMA_DIR")
    if env:
        return Path(env)
    here = Path(__file__).resolve()
    for parent in here.parents:
        candidate = parent / "packages" / "contracts" / "json-schema"
        if candidate.is_dir():
            return candidate
    raise FileNotFoundError("packages/contracts/json-schema not found; set BKS_JSON_SCHEMA_DIR or run `pnpm contracts:json-schema`")


@lru_cache(maxsize=None)
def _validator(contract: str) -> Draft202012Validator:
    name = CONTRACTS.get(contract, contract)
    path = schema_dir() / f"{name}.json"
    schema = json.loads(path.read_text(encoding="utf-8"))
    return Draft202012Validator(schema)


def validate_contract(contract: str, payload: Any) -> list[str]:
    """Returns a list of validation messages (empty when valid). `contract` is a short name or the full schemaVersion."""
    errors = sorted(_validator(contract).iter_errors(payload), key=lambda e: list(e.path))
    return [f"{'/'.join(str(p) for p in e.path) or '$'}: {e.message}" for e in errors]


class Model(BaseModel):
    model_config = ConfigDict(extra="allow", populate_by_name=True)


class TouchedNode(Model):
    uid: str
    labels: list[str]
    updated_at: str | None = Field(default=None, alias="updatedAt")


class ReadOperationResult(Model):
    op_id: str = Field(alias="opId")
    kind: str
    status: Literal["ok", "empty", "truncated", "failed", "skipped"]
    rows: list[dict[str, Any]]
    row_count: int = Field(alias="rowCount")
    truncated: bool = False
    error: str | None = None


class ReadSnapshot(Model):
    schema_version: str = Field(alias="schemaVersion")
    snapshot_id: str = Field(alias="snapshotId")
    intent_id: str = Field(alias="intentId")
    intent_digest: str = Field(alias="intentDigest")
    schema_digest: str = Field(alias="schemaDigest")
    executed_at: str = Field(alias="executedAt")
    database: str
    operations: list[ReadOperationResult]
    touched: list[TouchedNode]
    snapshot_digest: str = Field(alias="snapshotDigest")

    def preconditions(self) -> list[dict[str, Any]]:
        """`preconditions[]` rows for an ingestion intent, one per touched node."""
        return [{"uid": t.uid, "expectedUpdatedAt": t.updated_at} for t in self.touched]


class SubjectPlan(Model):
    ref: str
    node_type: str = Field(alias="nodeType")
    disposition: Literal["use_existing", "create", "review_required", "conflict", "missing"]
    uid: str | None
    reasons: list[str] = []


class ProposalPlan(Model):
    proposal_id: str = Field(alias="proposalId")
    kind: str
    disposition: Literal["admitted", "no_op_duplicate", "review_required", "held", "rejected"]
    reasons: list[str] = []
    mints: dict[str, str] = {}


class Plan(Model):
    schema_version: str = Field(alias="schemaVersion")
    plan_id: str = Field(alias="planId")
    intent_id: str = Field(alias="intentId")
    intent_digest: str = Field(alias="intentDigest")
    schema_digest: str = Field(alias="schemaDigest")
    outcome: Literal["applicable", "partial", "noop", "rejected"]
    subjects: list[SubjectPlan]
    proposals: list[ProposalPlan]
    errors: list[dict[str, Any]]
    plan_digest: str = Field(alias="planDigest")

    @property
    def held(self) -> list[ProposalPlan]:
        return [p for p in self.proposals if p.disposition in ("held", "review_required", "rejected")]


class ProposalReceipt(Model):
    proposal_id: str = Field(alias="proposalId")
    outcome: Literal["applied", "noop", "held", "rejected", "failed", "skipped"]
    created: dict[str, list[str]] = {}
    reason: str | None = None


class Receipt(Model):
    schema_version: str = Field(alias="schemaVersion")
    receipt_id: str = Field(alias="receiptId")
    intent_id: str = Field(alias="intentId")
    intent_digest: str = Field(alias="intentDigest")
    plan_id: str = Field(alias="planId")
    plan_digest: str = Field(alias="planDigest")
    outcome: Literal["applied", "noop", "partial", "rejected", "failed", "duplicate"]
    duplicate_of: str | None = Field(default=None, alias="duplicateOf")
    executed_at: str = Field(alias="executedAt")
    marker_uid: str = Field(alias="markerUid")
    activity_uid: str | None = Field(default=None, alias="activityUid")
    counters: dict[str, int] | None = None
    proposals: list[ProposalReceipt]
    affected: list[TouchedNode]
    failure: dict[str, Any] | None = None
