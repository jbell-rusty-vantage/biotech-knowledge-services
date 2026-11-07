# ADR 0004 — Mission Control boundary and run identity

Status: accepted · 2026-10-07

## Question

Should intent artifacts be part of Mission Control? And what replaces the Mongo research run id in the schema now that Mission Control runs on PostgreSQL?

## Decision

**Intent artifacts belong to Knowledge Services, their envelope belongs to Mission Control.** This follows the integration annex (`mission-control-general/general-mission-control/expansion/KNOWLEDGE-SERVICES.md`): Mission Control owns mission authoring, operation intents, reservations, approvals, receipts accounting and recovery classification; Knowledge Services owns capture, verification, admission, query and domain-operation execution. The common wrapper `mc.knowledge_request.v1` carries the native domain payload unchanged, with its native canonicalization and digest recorded beside the wrapper digest.

Concretely:

- `biotech-knowledge-intent.v1`, `biotech-knowledge-plan.v1`, `biotech-knowledge-receipt.v1` and `biotech-knowledge-read-intent.v1` are native contracts of this repo (`packages/contracts`, JSON Schema exported). Mission Control wraps them; it never renames their fields or re-digests them.
- The capability interfaces map 1:1 onto executor operations: `knowledge.query` → `kg read`; `knowledge.ingestion_plan` → `kg plan` (read-only); `knowledge.ingestion_apply` → `kg apply` (requires the plan digest it approved); `knowledge.receipt_get` → `kg receipt`; `knowledge.verify_result` → `kg verify`; `knowledge.describe` → `schema manifest` + `ping`.
- The Neo4j writer contract the annex calls KS-04 is implemented by the intent marker (`KsIntentMarker {intentId, intentDigest, planDigest, status, receipt}`) written in the same transaction as the graph effects; a repeated identity returns its recorded result, a changed digest conflicts, and a lost response is settled by `kg receipt`. PostgreSQL (mission ledger) and Neo4j never share a transaction; the receipt id is the external authoritative reference Mission Control stores.
- The Python client (`python/biotech-knowledge-client`) is the adapter seam: pydantic models validated against the exported schemas, a typed HTTP client for the executor, and the same canonical-JSON digest so the adapter can verify native payload digests.

**Run identity.** `Entity.mongoResearchRunId` ("operational last-writer run id") is a legacy name from the Mongo era. Lineage is, per the schema's own rule (V-430), the `WAS_GENERATED_BY` Activity whose `externalRunId` equals it. The executor therefore:

- creates one `Activity` per Mission Control run (`externalRunSystem = "mission-control"`, `externalRunId = run.runId`, `activityKind` from the intent, `startedAt`/`endedAt`), associated with the executor `Agent`;
- links every Assertion, SourceSnapshot, SourceLocator and Mention it writes to that Activity;
- writes the run id into `mongoResearchRunId` on nodes and edges it touches, so existing readers of the property keep working.

The property rename (`mongoResearchRunId` → `lastWriterRunId`, with `externalRunSystem` moving to the Activity only) is recorded as a schema-refinement item for the upstream slimming pass; the executor will follow the IR when the pinned schema changes.

## Consequences

- Mission Control stores wrapper digest, native digest, plan digest and receipt id; it approves a plan digest, and `kg apply` refuses a plan whose intent or schema digest changed.
- Partial outcomes are explicit: the plan lists dispositions; Mission Control chooses all-required or an accepted subset via `allowPartial`.
- No Mission Control foreign keys or SQL enter this repo; the only shared identity is `run.runId`/`missionId`/`activationId` strings carried in the intent context.
