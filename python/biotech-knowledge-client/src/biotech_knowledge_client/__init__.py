"""Typed client for the BellLabs biotech knowledge executor (apps/executor).

The wire truth is the JSON Schema export in packages/contracts/json-schema; this package validates
payloads against those files, computes the same canonical-JSON digests as the TypeScript executor
(bks-canonical-json.v2, golden vectors in packages/contracts/golden; v1 digests kept in `digest`), and wraps
the HTTP routes with pydantic result models. Mission Control adapters import this package; they never import
executor internals.
"""

from .canonical import CanonicalError, canonical_decimal, canonical_digest, canonical_instant, canonicalize, raw_bytes_digest
from .client import KnowledgeClient, KnowledgeClientError
from .digest import canonical_json, digest_of, sha256_hex
from .models import CONTRACTS, Plan, ReadSnapshot, Receipt, validate_contract
from .models_v2 import ApplyWitness, PlanV2, PlanView, ReceiptV2, VerifyEffectsPage, apply_request, intent_digest_v2

__all__ = [
    "CONTRACTS",
    "ApplyWitness",
    "CanonicalError",
    "KnowledgeClient",
    "KnowledgeClientError",
    "Plan",
    "PlanV2",
    "PlanView",
    "ReadSnapshot",
    "Receipt",
    "ReceiptV2",
    "VerifyEffectsPage",
    "apply_request",
    "canonical_decimal",
    "canonical_digest",
    "canonical_instant",
    "canonical_json",
    "canonicalize",
    "digest_of",
    "intent_digest_v2",
    "raw_bytes_digest",
    "sha256_hex",
    "validate_contract",
]
