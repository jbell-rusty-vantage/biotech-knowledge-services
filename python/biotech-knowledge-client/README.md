# biotech-knowledge-client

Typed Python client for the BellLabs biotech knowledge executor (`apps/executor`). This is the seam
Mission Control adapters use: pydantic result models, payload validation against the exported JSON
Schemas (`packages/contracts/json-schema`), and the same canonical-JSON digest as the TypeScript
executor so native payload digests can be verified independently.

```bash
cd python/biotech-knowledge-client
uv sync --extra dev
uv run pytest                                   # digest parity with TypeScript, schema validation, model parsing
uv run bks-py health                            # BKS_EXECUTOR_URL (default http://127.0.0.1:4020)
uv run bks-py validate intent ../../examples/ingestion-intent.example.json
uv run bks-py digest ../../examples/ingestion-intent.example.json
```

```python
from biotech_knowledge_client import KnowledgeClient

with KnowledgeClient("http://127.0.0.1:4020") as kc:
    snapshot = kc.read(read_intent)                 # ReadSnapshot; snapshot.preconditions() -> intent preconditions
    plan = kc.plan(intent)                          # Plan; plan.outcome, plan.held
    receipt = kc.apply(intent, plan)                # Receipt; idempotent on identical bytes
    kc.receipt(intent["intentId"])                  # authoritative after a lost response
```

Errors surface as `KnowledgeClientError(code, message, details, status)` with the executor's codes
(`VALIDATION`, `INTENT_CONFLICT`, `DUPLICATE_PENDING`, `PARTIAL_PLAN_REFUSED`, `STALE_PRECONDITION`, …).
The client never embeds Cypher, credentials or Mission Control tables; it carries run identity in the intent context only.
