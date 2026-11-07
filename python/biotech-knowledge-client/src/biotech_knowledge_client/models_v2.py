"""Pydantic models for contracts v2 (biotech-knowledge-intent.v2 / plan.v2 / apply.v2 / receipt.v2, bks-apply-witness.v1,
bks-effect-verification.v1). Full structure is validated against the exported JSON Schemas (`validate_contract`);
these models give typed access to the fields adapters read."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import Field

from .canonical import canonical_digest
from .models import Model

INTENT_V2 = "biotech-knowledge-intent.v2"
PLAN_V2 = "biotech-knowledge-plan.v2"
APPLY_V2 = "biotech-knowledge-apply.v2"
RECEIPT_V2 = "biotech-knowledge-receipt.v2"
WITNESS_V1 = "bks-apply-witness.v1"

# Same semantic-set paths as INTENT_V2_DIGEST_PROFILE in packages/contracts/src/intent-v2.ts.
INTENT_V2_DIGEST_PROFILE = {
    "sets": [
        "proposals[].dependsOn",
        "proposals[].assertion.qualifiers",
        "proposals[].qualifiers",
        "proposals[].facets",
        "basis.creationOnly.expectAbsent",
        "basis.creationOnly.expectPresent",
        "sources[].locators[].reportsFields",
    ]
}


def intent_digest_v2(normalized_intent: dict[str, Any]) -> str:
    """bks-canonical-json.v2 digest of a NORMALIZED intent (the executor's parsed form, defaults filled in)."""
    return canonical_digest(normalized_intent, INTENT_V2_DIGEST_PROFILE)


class PlanBinding(Model):
    intent_id: str = Field(alias="intentId")
    intent_digest: str = Field(alias="intentDigest")
    observations_digest: str = Field(alias="observationsDigest")
    observed_graph_revision: int = Field(alias="observedGraphRevision")
    planned_at: str = Field(alias="plannedAt")
    executor_version: str = Field(alias="executorVersion")
    schema_release_digest: str = Field(alias="schemaReleaseDigest")
    rules_digest: str = Field(alias="rulesDigest")
    policy_version: str = Field(alias="policyVersion")
    evidence_digest: str = Field(alias="evidenceDigest")


class ProposalPlanV2(Model):
    proposal_id: str = Field(alias="proposalId")
    kind: str
    disposition: Literal["admitted", "noop_duplicate", "held", "rejected"]
    reasons: list[str] = []
    warnings: list[str] = []
    mints: dict[str, str] = {}
    depends_on: list[str] = Field(default=[], alias="dependsOn")


class PlanV2(Model):
    schema_version: Literal["biotech-knowledge-plan.v2"] = Field(alias="schemaVersion")
    plan_ref: str = Field(alias="planRef")
    plan_digest: str = Field(alias="planDigest")
    binding: PlanBinding
    outcome: Literal["applicable", "partial", "noop", "held", "rejected"]
    proposals: list[ProposalPlanV2]
    errors: list[dict[str, Any]] = []
    warnings: list[dict[str, Any]] = []

    def admitted(self) -> list[str]:
        return [p.proposal_id for p in self.proposals if p.disposition == "admitted"]


class PlanView(Model):
    """POST /kg/plan response: planRef + planDigest + the full plan view (statements visible, never submittable)."""

    plan_ref: str = Field(alias="planRef")
    plan_digest: str = Field(alias="planDigest")
    outcome: Literal["applicable", "partial", "noop", "held", "rejected"]
    plan: PlanV2


class ApplyWitness(Model):
    format: Literal["bks-apply-witness.v1"]
    alg: Literal["Ed25519"]
    kid: str
    payload: str
    signature: str


class ProposalReceiptV2(Model):
    proposal_id: str = Field(alias="proposalId")
    outcome: Literal["applied", "noop", "held", "rejected", "excluded", "failed"]
    reason: str | None = None


class ReceiptV2(Model):
    schema_version: Literal["biotech-knowledge-receipt.v2"] = Field(alias="schemaVersion")
    receipt_id: str = Field(alias="receiptId")
    outcome: Literal["applied", "noop", "partial", "rejected", "failed", "duplicate", "unresolved"]
    duplicate_of: str | None = Field(default=None, alias="duplicateOf")
    effect: dict[str, Any]
    intent: dict[str, Any]
    plan: dict[str, Any]
    release: dict[str, Any]
    attempt_id: str = Field(alias="attemptId")
    prior_graph_revision: int | None = Field(default=None, alias="priorGraphRevision")
    next_graph_revision: int | None = Field(default=None, alias="nextGraphRevision")
    witness: dict[str, Any] | None = None
    proposals: list[ProposalReceiptV2]
    effects: dict[str, Any]
    failure: dict[str, Any] | None = None
    recovery: dict[str, Any]
    attempts: list[dict[str, Any]] = []
    # SV-11: set when a Knowledge Services dispatch applied the effect (witness is then null).
    admission: dict[str, Any] | None = None


class VerifyEffectsPage(Model):
    schema_version: Literal["bks-effect-verification.v1"] = Field(alias="schemaVersion")
    effect_key: str = Field(alias="effectKey")
    receipt_id: str = Field(alias="receiptId")
    total: int
    cursor: int
    next_cursor: int | None = Field(default=None, alias="nextCursor")
    complete: bool
    checked: int
    failures: int
    items: list[dict[str, Any]]


def apply_request(plan: PlanV2 | PlanView, effect_key: str, witness: dict[str, Any] | ApplyWitness, partial_policy: Any = "all") -> dict[str, Any]:
    """biotech-knowledge-apply.v2: references only (planRef + expected digest + intent digest + effect key + witness)."""
    p = plan.plan if isinstance(plan, PlanView) else plan
    w = witness.model_dump(by_alias=True) if isinstance(witness, ApplyWitness) else witness
    return {
        "schemaVersion": APPLY_V2,
        "planRef": p.plan_ref,
        "expectedPlanDigest": p.plan_digest,
        "intentDigest": p.binding.intent_digest,
        "effectKey": effect_key,
        "partialPolicy": partial_policy,
        "witness": w,
    }


# ---- native reads (S4 contracts, merged into packages/contracts/src/read-v2.ts) ---------------------------------
READ_INTENT_V2 = "biotech-knowledge-read-intent.v2"
CYPHER_READ_INTENT_V1 = "biotech-cypher-read-intent.v1"
READ_RESULT_V2 = "biotech-knowledge-read-result.v2"
READ_EXPLAIN_V1 = "biotech-cypher-read-explain.v1"


class ReadReason(Model):
    code: str
    message: str | None = None


class ReadPart(Model):
    columns: list[Any] = []
    rows: list[Any] = []


class ReadResultV2(Model):
    """biotech-knowledge-read-result.v2. Only status "empty" means "no visible record"."""

    schema_version: Literal["biotech-knowledge-read-result.v2"] = Field(alias="schemaVersion")
    intent_id: str = Field(alias="intentId")
    intent_kind: Literal["biotech-knowledge-read-intent.v2", "biotech-cypher-read-intent.v1"] = Field(alias="intentKind")
    status: Literal["ok", "empty", "truncated", "failed", "skipped", "unsupported", "stale", "forbidden"]
    reasons: list[dict[str, Any]] = []
    parts: list[dict[str, Any]] = []
    serialization: Literal["bks-read-values.v1"]
    pins: dict[str, Any]
    consistency: dict[str, Any]
    digests: dict[str, str]
    snapshot: dict[str, Any] | None = None


class ExplainResultV1(Model):
    schema_version: Literal["biotech-cypher-read-explain.v1"] = Field(alias="schemaVersion")
    intent_id: str = Field(alias="intentId")
    accepted: bool
    reasons: list[dict[str, Any]] = []


# ---- SV-11: Knowledge Services dispatch admission and official-use reads ---------------------------------------
ADMISSION_DISPATCH_V1 = "biotech-knowledge-admission.v1"
ADMISSION_ACK_V1 = "biotech-knowledge-admission-ack.v1"
ADMISSION_CONSUME_REQUEST_V1 = "biotech-knowledge-admission-consume-request.v1"
ADMISSION_CONSUME_REPORT_V1 = "biotech-knowledge-admission-consume.v1"
INTENT_MARKER_V2 = "bks-intent-marker.v2"
READ_INTENT_V3 = "biotech-knowledge-read-intent.v3"
READ_RESULT_V3 = "biotech-knowledge-read-result.v3"


class AdmissionAckV1(Model):
    """One dispatch outcome of the BKS outbox consumer (applied / duplicate are acknowledged with the marker digest)."""

    schema_version: Literal["biotech-knowledge-admission-ack.v1"] = Field(alias="schemaVersion")
    tenant_id: str = Field(alias="tenantId")
    dispatch_id: str = Field(alias="dispatchId")
    effect_key: str = Field(alias="effectKey")
    outcome: Literal["applied", "duplicate", "revoked", "refused", "deferred"]
    marker_digest: str | None = Field(default=None, alias="markerDigest")
    acknowledged: bool
    component_state: str | None = Field(default=None, alias="componentState")
    reason: dict[str, Any] | None = None
    retry_after_seconds: int | None = Field(default=None, alias="retryAfterSeconds")


class AdmissionConsumeReportV1(Model):
    schema_version: Literal["biotech-knowledge-admission-consume.v1"] = Field(alias="schemaVersion")
    tenant_id: str = Field(alias="tenantId")
    claimed: int
    results: list[AdmissionAckV1]


class ReadEligibility(Model):
    """bks-read-eligibility.v1: present on an official-use biotech-knowledge-read-result.v3."""

    checked_at: str = Field(alias="checkedAt")
    authoritative_epoch: int | None = Field(default=None, alias="authoritativeEpoch")
    decision_epoch: int | None = Field(default=None, alias="decisionEpoch")
    state: Literal["eligible", "revoked", "stale", "authority_unavailable"]
    items: list[dict[str, Any]] = []
    excluded: int
    held: int


class ReadResultV3(Model):
    """biotech-knowledge-read-result.v3: v2 result + use + eligibility (authority unavailable holds)."""

    schema_version: Literal["biotech-knowledge-read-result.v3"] = Field(alias="schemaVersion")
    intent_id: str = Field(alias="intentId")
    intent_kind: Literal["biotech-knowledge-read-intent.v3"] = Field(alias="intentKind")
    status: Literal["ok", "empty", "truncated", "failed", "skipped", "unsupported", "stale", "forbidden"]
    reasons: list[dict[str, Any]] = []
    parts: list[dict[str, Any]] = []
    use: dict[str, Any]
    eligibility: ReadEligibility | None = None
    digests: dict[str, str]
