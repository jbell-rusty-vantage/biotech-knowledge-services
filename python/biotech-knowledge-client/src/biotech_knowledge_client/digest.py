"""Canonical JSON and digests, byte-identical to packages/contracts/src/digest.ts.

Rules: object keys sorted recursively, no insignificant whitespace, `undefined` (absent) keys dropped,
non-ASCII kept as UTF-8, integers written without a fractional part. Floats that are integral in JSON
terms (e.g. 60.0) are written as `60` to match JavaScript's JSON.stringify.
"""

from __future__ import annotations

import hashlib
import json
from typing import Any


def _normalize(value: Any) -> Any:
    if isinstance(value, dict):
        return {k: _normalize(v) for k, v in sorted(value.items()) if v is not None or True}
    if isinstance(value, (list, tuple)):
        return [_normalize(v) for v in value]
    if isinstance(value, float) and value.is_integer() and abs(value) < 2**53:
        return int(value)
    return value


def canonical_json(value: Any) -> str:
    return json.dumps(_normalize(value), sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def sha256_hex(text: str | bytes) -> str:
    data = text.encode("utf-8") if isinstance(text, str) else text
    return hashlib.sha256(data).hexdigest()


def digest_of(value: Any) -> str:
    """`sha256:<hex>` over the canonical JSON form (contract D-016 spelling)."""
    return f"sha256:{sha256_hex(canonical_json(value))}"


def digest_of_text(text: str) -> str:
    return f"sha256:{sha256_hex(text)}"
