"""HTTP client for the knowledge executor (apps/executor). Strict: payloads are validated against the
exported JSON Schemas before they are sent, and responses are parsed into pydantic models.

Write flow (contracts v2): ``plan(intent)`` -> server-stored plan (planRef + planDigest) -> an admission witness from
the domain admission service (``admit`` only in the executor's local development profile) -> ``apply(request)`` with
plan references only (never statements) -> ``receipt(effect_key)`` (authoritative after a lost response) ->
``verify_effects(effect_key)`` (paginated readback of every declared effect)."""

from __future__ import annotations

from typing import Any, Iterator

import httpx

from .models import ReadSnapshot, validate_contract
from .models_v2 import ApplyWitness, ExplainResultV1, PlanView, ReadResultV2, ReceiptV2, VerifyEffectsPage, apply_request


class KnowledgeClientError(RuntimeError):
    def __init__(self, code: str, message: str, details: Any = None, status: int | None = None):
        super().__init__(f"{code}: {message}")
        self.code = code
        self.message = message
        self.details = details
        self.status = status


class KnowledgeClient:
    def __init__(self, base_url: str = "http://127.0.0.1:4020", api_key: str | None = None, timeout: float = 120.0):
        headers = {"content-type": "application/json"}
        if api_key:
            headers["x-api-key"] = api_key
        self._http = httpx.Client(base_url=base_url.rstrip("/"), headers=headers, timeout=timeout)

    def close(self) -> None:
        self._http.close()

    def __enter__(self) -> "KnowledgeClient":
        return self

    def __exit__(self, *exc: object) -> None:
        self.close()

    # -- transport -------------------------------------------------------------------------
    def _request(self, method: str, path: str, json: Any = None, params: dict[str, Any] | None = None, ok_statuses: tuple[int, ...] = ()) -> Any:
        response = self._http.request(method, path, json=json, params=params)
        body: Any
        try:
            body = response.json()
        except ValueError:
            body = {"ok": False, "code": "BAD_RESPONSE", "message": response.text[:500]}
        if response.status_code >= 400 and response.status_code not in ok_statuses and isinstance(body, dict) and "code" in body:
            raise KnowledgeClientError(str(body.get("code")), str(body.get("message", "")), body.get("details") or body.get("issues"), response.status_code)
        return body

    # -- handshake and schema (no database) ------------------------------------------------
    def health(self) -> dict[str, Any]:
        return self._request("GET", "/healthz")

    def describe(self) -> dict[str, Any]:
        """Capability handshake for this token (INTERFACES section 8)."""
        return self._request("GET", "/describe")

    def schema_manifest(self) -> dict[str, Any]:
        return self._request("GET", "/schema/manifest")

    def schema_search(self, query: str, limit: int = 10) -> list[dict[str, Any]]:
        return self._request("GET", "/schema/search", params={"q": query, "limit": limit})["hits"]

    def schema_page(self, page_id: str, max_bytes: int = 24_000) -> dict[str, Any]:
        return self._request("GET", f"/schema/page/{page_id}", params={"maxBytes": max_bytes})

    def schema_slice(self, **request: Any) -> dict[str, Any]:
        return self._request("POST", "/schema/slice", json=request)

    # -- legacy reads (biotech-knowledge-read-intent.v1; the executor route decodes v1 bodies) --
    def read(self, intent: dict[str, Any]) -> ReadSnapshot:
        self._validate("read-intent", intent)
        return ReadSnapshot.model_validate(self._request("POST", "/kg/read", json=intent))

    # -- native reads (v2, S4) --------------------------------------------------------------
    def read_v2(self, intent: dict[str, Any]) -> ReadResultV2:
        """Typed read (biotech-knowledge-read-intent.v2). Results come back with HTTP 200; the status is in the body."""
        self._validate("read-intent-v2", intent)
        return ReadResultV2.model_validate(self._request("POST", "/kg/read", json=intent))

    def read_cypher(self, intent: dict[str, Any]) -> ReadResultV2:
        """Cypher read (biotech-cypher-read-intent.v1): one parameterized Cypher 5 statement or a catalog template."""
        self._validate("cypher-read-intent", intent)
        return ReadResultV2.model_validate(self._request("POST", "/kg/read/cypher", json=intent))

    def read_explain(self, intent: dict[str, Any]) -> ExplainResultV1:
        self._validate("cypher-read-intent", intent)
        return ExplainResultV1.model_validate(self._request("POST", "/kg/read/explain", json=intent))

    # -- native writes (contracts v2) ------------------------------------------------------
    def plan(self, intent: dict[str, Any]) -> PlanView:
        self._validate("intent", intent)
        return PlanView.model_validate(self._request("POST", "/kg/plan", json=intent, ok_statuses=(422,)))

    def admit(self, plan_ref: str, effect_key: str, partial_policy: Any = "all") -> ApplyWitness:
        """Development admission witness (executor local-dev profile only; production witnesses come from Mission Control)."""
        return ApplyWitness.model_validate(self._request("POST", "/kg/admit", json={"planRef": plan_ref, "effectKey": effect_key, "partialPolicy": partial_policy}))

    def apply(self, request: dict[str, Any]) -> ReceiptV2:
        self._validate("apply", request)
        return ReceiptV2.model_validate(self._request("POST", "/kg/apply", json=request, ok_statuses=(422, 202)))

    def apply_plan(self, plan: PlanView, effect_key: str, witness: dict[str, Any] | ApplyWitness, partial_policy: Any = "all") -> ReceiptV2:
        return self.apply(apply_request(plan, effect_key, witness, partial_policy))

    def receipt(self, effect_key: str) -> dict[str, Any]:
        return self._request("GET", "/kg/receipt", params={"effectKey": effect_key}, ok_statuses=(404,))

    def verify_effects(self, effect_key: str, cursor: int = 0, page_size: int = 100) -> VerifyEffectsPage:
        return VerifyEffectsPage.model_validate(self._request("POST", "/kg/verify-effects", json={"effectKey": effect_key, "cursor": cursor, "pageSize": page_size}))

    def iter_effect_pages(self, effect_key: str, page_size: int = 100) -> Iterator[VerifyEffectsPage]:
        cursor: int | None = 0
        while cursor is not None:
            page = self.verify_effects(effect_key, cursor, page_size)
            yield page
            cursor = page.next_cursor

    @staticmethod
    def _validate(contract: str, payload: dict[str, Any]) -> None:
        errors = validate_contract(contract, payload)
        if errors:
            raise KnowledgeClientError("BKS_PARSE_REJECTED", f"{contract} payload is invalid", errors)
