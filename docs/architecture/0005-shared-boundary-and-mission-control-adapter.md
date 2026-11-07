# ADR 0005 — Shared boundary and Mission Control adapter (schema v2 release, S7)

Status: accepted for the schema v2 service release · 2026-10-12 · supersedes the capability mapping paragraph of ADR 0004 (run identity in ADR 0004 still stands)

## Question

How do Mission Control and Knowledge Services drive the Biotech native service: the envelope, the capability catalog, admission, revocation, receipt recovery and custody? What is implemented, what is unsupported, and what guarantee do we claim across Neo4j, the admission ledger, Mission Control PostgreSQL and Knowledge Services custody?

## Decision

### 1. Envelope `mc.knowledge_request.v1` wraps native bytes

- Published three times, field for field: Biotech `packages/contracts/src/envelope.ts` (Zod, JSON Schema `json-schema/mc.knowledge_request.v1.json` and `mc.knowledge_delivery.v1.json`), Python `biotech_knowledge_client/envelope.py`, and Knowledge Services `packages/contracts/src/knowledge-request-envelope.ts`. Mission Control's adapter mirrors it in strict Pydantic (`biotech_mission_adapters/knowledge/envelope.py`). Golden vectors: `packages/contracts/golden/knowledge-request-envelope.v1.json` (byte copies in KS and MC fixtures, checked for equality).
- Sections: identity (request id, installation/application/tenant, mission/run/activation/attempt or `null` for standalone, native namespaced run, generation, stable semantic effect key), target (capability binding id/revision/descriptor digest, endpoint audience, logical operation, native route, executor version, schema release digest), input (native contract name/version, payload ref, raw payload digest and length, `bks-canonical-json.v2`, native digest, upstream refs), authority (actor, requested scopes, admission ref, grant ref), preconditions (release pins, snapshot ref, graph revision, plan ref, expected plan digest, approval refs), governors (reservation, deadline, timeout, max items, partial policy).
- The payload bytes are never parsed and re-serialized by the wrapper. `payloadDigest` is sha256 of the exact bytes, `nativeDigest` is what the executor reports (`plan.binding.intentDigest`), the wrapper digest is bks-canonical-json.v2 of the envelope (all members required, integers only, so JCS, TypeScript and both Python ports agree). Python never renames camelCase and never recomputes a native digest.

### 2. Capability catalog entry

`apps/executor/capabilities/biotech-knowledge.capability.json` (`belllabs.knowledge-capability.v1`, written by `node apps/executor/scripts/capability.mjs write`, live at `GET /capability`) pins contracts, release/schema/query-catalog/DDL digests, workspace fingerprint, domain skill bundle digests, the admission policy digest, audience `bks-executor`, scopes, limits (500 proposals, 30 s apply transaction, 60 s witness), partial policy, receipt semantics and the consistency/recovery facts. The 11 logical `knowledge.*` interfaces map as follows; nothing planned-but-absent is advertised.

| Logical interface | Biotech | Native |
| --- | --- | --- |
| knowledge.describe | available | `GET /describe` |
| knowledge.query | available (typed read passthrough) | `POST /kg/read` |
| knowledge.ingestion_plan | available | `POST /kg/plan` |
| knowledge.ingestion_apply | available (witness required) | `POST /kg/admission/witness` then `POST /kg/apply` |
| knowledge.receipt_get | available | `GET /kg/receipt?effectKey=` |
| knowledge.verify_result | available (paginated) | `POST /kg/verify-effects` |
| knowledge.retrieve | unsupported | none in this release |
| knowledge.capture_prepare, knowledge.verify | unsupported here (Knowledge Services capabilities) | Biotech consumes sealed verification references |
| knowledge.classify_propose, knowledge.classify_admit | unsupported | no proved classification endpoint |

### 3. Domain admission: authorization at issuance plus bounded lease

`packages/kg-ops/src/admission/` (served by `apps/executor/src/modules/admission.ts` when `BKS_ADMISSION_ENABLED=1`):

1. `POST /kg/admission/witness` loads the stored plan, refuses revoked effects, grants and principals from the durable ledger, checks the Mission Control grant reference (`GrantSource`: registry file or `POST <mc>/grants/check`), hydrates every sealed verification the plan cites from custody (pinned verifier key, digest) and its current Knowledge Services state, records the issuance durably, then signs `bks-apply-witness.v1` (Ed25519, audience `bks-executor`, lifetime ≤ 60 s) at the ledger's revocation generation. Any unavailable required authority is `BKS_AUTHORITY_UNAVAILABLE` (503): no witness, no apply.
2. `POST /kg/admission/revocations` advances the generation and appends an outbox entry. New witnesses for the revoked target are refused immediately.
3. `POST /kg/admission/deliver` delivers the outbox into `KsRevocationFence` at least once (generation is max-monotonic, redelivery is idempotent). `POST /kg/admission/reconcile` compares ledger and fence, marks fence-acknowledged entries delivered and redelivers after a fence regression (restore).
4. The executor's apply transaction (S3) refuses any witness older than the delivered fence (`BKS_WITNESS_REVOKED`).
5. `GET /kg/eligibility?effectKey=` is the serving/publication recheck: an effect retained in graph history is denied when its effect, grant or principal is revoked, when the grant authority no longer allows it, or when any authority is unavailable (fail closed). History and receipts are never rewritten; compensation is a new admitted action.

This is **not** atomic cross-store revocation. A witness issued before a revocation can commit during its lease unless the revocation already reached the graph fence. Tests cover revocation before witness, after witness before commit (delivered and not yet delivered), after commit, delayed delivery with a crash between graph write and ledger update, fence regression and an expired witness (`packages/kg-ops/src/admission/admission.integration.test.ts`).

### 4. Mission Control adapter

`platform/mission-control/integrations/biotech/src/biotech_mission_adapters/knowledge/` implements describe, query, ingestion_plan, ingestion_apply, receipt_get and verify_result over HTTP with the envelope. It appends the dispatch/effect intent to a durable ledger before any effectful call, maps receipts to delivery `pending | applied | rejected | unresolved` (verification completion is a separate field), reconciles a lost response by receipt lookup with the original effect key before any repeat, resumes a crashed client from the ledger, treats cancellation as stop-new-work plus reconciliation (native HTTP cancellation is unsupported and reported as such), reports held graph admission as `pending` even when verification completed, and returns `unsupported` without a call for unavailable interfaces or binding drift (live `/describe` differing from the pinned descriptor). Registration is explicit (`knowledge/composition.py`); the kernel imports nothing from Biotech and Biotech imports nothing from the kernel.

### 5. Custody

The Supabase `knowledge-artifacts` adapter (`admission/custody-supabase.ts`) implements S3's `PlanStore` and `SnapshotCustody` plus a receipt copy store: content-addressed keys (`<prefix>/<kind>/sha256/<hh>/<hex>`), create-if-absent (`x-upsert: false`), digest verification before use, immutable ref indexes, authenticated reads with the server-side key, no signed URL as custody. It is exercised against a local emulation of the Storage API. **Blocked:** the Biotech Supabase project has no `knowledge-artifacts` bucket (read-only listing on 2026-10-12 returned no buckets), so the executor keeps its file custody (`runs/release-v2/`).

### 6. Agent lanes

`apps/executor/lanes/workspace-mount.json` lists the read-only, digest-bound mounts (generated workspace, release pin, contract schemas and golden vectors, domain skill bundles, skill routing) with tree digests and a manifest fingerprint (`node apps/executor/scripts/lane-mount.mjs write|check`). Lanes get no `.env`, no `runs/` custody, no database password, no Supabase secret or signed URL, no witness signing key. They reach the executor with a short-lived, scoped service token minted host-side per activation (reader for schema/read lanes, writer only for an admitted ingestion operation), which maps to one `BKS_EXECUTOR_TOKENS` principal by sha256 and is revoked with the activation.

## Consequences

- No distributed transaction is claimed anywhere. `recovery.atomicCrossStore` is `false` in `/describe`, in the catalog file, and the Mission Control binding refuses a descriptor that says otherwise.
- The admission ledger file backend serializes processes on one host. A multi-host deployment needs a database-backed ledger behind the same interface (Mission Control PostgreSQL outbox); not part of this release.
- The executor's custody stays file-based until the bucket exists and a context switch selects the Supabase stores (patch listed in the S7 report).
- `@bks/kg-ops` and `@bks/contracts` do not yet re-export the admission package and the envelope. The executor imports `packages/kg-ops/dist/admission/index.js` by relative path until the owner adds the one-line exports.

## Alternatives rejected

- Atomic revocation through a shared transaction or a lock held across stores: Neo4j and PostgreSQL do not share transactions; holding the writer fence across provider calls is forbidden (SPECIFICATION 7.2).
- Translating native payloads into Mission Control lower_snake models, or re-digesting them with Mission Control's NFC canonical form: that changes the native digest.
- Treating a missing receipt as a failed write, or minting a new effect key after a timeout.
- Dev in-memory admission (`/kg/admit`) as the production issuer.
