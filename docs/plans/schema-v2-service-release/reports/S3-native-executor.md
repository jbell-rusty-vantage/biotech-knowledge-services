# S3 native executor: contracts v2 and the trusted native writer

Role: Native executor (work package S3). Date: 2026-10-11 (runs finished 2026-10-12T00:06Z). No commits, no pushes, no Aura access (local Docker only). Every claim below has a command and an evidence file; the lead should rerun the commands in section 4.

## 1. Outcome

- **Contracts v2** delivered in `packages/contracts` with JSON Schema exports, `bks-canonical-json.v2` with cross-language golden vectors, and the Python client updated to v2 (parity tests pass).
- **Trusted writer** rebuilt: register-driven write model, pure compiler over frozen observations, server-side plan custody with recompilation proof, writer fence + scoped effect markers, the SPECIFICATION 7.3 transaction order, Ed25519 admission witnesses with a local revocation fence, paginated complete effect verification.
- **Gate B**: 22/22 integration tests pass on a real disposable Neo4j 5.26 Community instance plus the Enterprise reader-authority test, against **S1's pinned release `biotech-schema-v2.0.0` (`schemaReleaseDigest sha256:b62036de…092f`)**. The same suite also passed earlier against the frozen candidate.
- **Release swap done.** S1's `loadRelease()` landed during this work. `packages/kg-ops/src/release-adapter.ts` now serves the pinned bundle by default (the one-file swap). `BKS_WRITE_RELEASE_SOURCE=candidate` still serves the frozen `schema/program/final` candidate for comparison.
- **Executor surfaces**: service auth is mandatory; capabilities are registered per role; raw Cypher is out of the default profile; the routes (`/kg/plan`, `/kg/apply`, `/kg/receipt?effectKey=`, `/kg/verify-effects`, `/describe`) live in discoverable modules; a live HTTP smoke through the Python client passes.
- **FU-03**: all 82 v1 intents (77 packet + the example + 4 cross-domain) migrate to v2, plan without throwing, and every non-admitted proposal states a reason. Each closed admitted subset was applied to the real graph with zero apply failures. The matrix is in section 7.

## 2. Changed files

Contracts (`packages/contracts`):
- New: `src/canonical.ts` (bks-canonical-json.v2), `src/errors.ts` (BKS_ codes, `BksServiceError`), `src/intent-v2.ts`, `src/plan-v2.ts`, `src/apply-v2.ts` (apply request, witness, receipt, effect verification), `src/custody.ts` (read-result status, digest triple, custody snapshot record, sealed verification), `src/canonical.test.ts`, `golden/canonical-json.v2.json` (59 vectors), `golden/intent-digest.v2.json` (normalized v2 example intent and plan body with digests).
- Changed: `src/index.ts` (exports, `CONTRACT_VERSIONS` now v2, `LEGACY_CONTRACT_VERSIONS`), `src/export-json-schema.ts`.
- v1 files (`ingest.ts`, `read.ts`, `digest.ts`) are unchanged. v1 decoding and digests are retained, and the v1 JSON Schemas are byte-identical.

kg-ops (`packages/kg-ops/src`):
- New: `release-adapter.ts`, `custody.ts`, `fence.ts`, `witness.ts`, `write/release-model.ts`, `write/context.ts`, `write/compile.ts`, `write/proposals.ts`, `write/observations.ts`, `write/uri.ts`, `write/migrate-v1.ts`, `write/offline.ts`, `write/service.ts` (KnowledgeWriter), `write/fixtures-v2.ts` (synthetic Gate B fixtures), `write/test-support.ts`, `write.test.ts`.
- Rewritten: `plan.ts` (v2 planner), `apply.ts` (v2 apply, receipt lookup, verifyEffects), `kg-ops.integration.test.ts` (Gate B; it keeps the old Cypher-baseline block).
- Changed: `index.ts`, `package.json` (adds the `yaml` dependency).

Outside the listed ownership (needed for the build or the brief; please review):
- `packages/kg-ops/src/cli.ts`: v1 `planIntent` / `applyPlan` were removed. `kg plan|admit|apply|receipt|verify|migrate-v1|bootstrap-dev` now use the v2 writer. `cypher write` is refused unless `BKS_ENABLE_BASELINE_TOOLS=1`.
- `vitest.config.ts`: adds an `executor` project (one line) so `apps/executor/src/app.test.ts` runs.

Executor (`apps/executor`):
- New: `src/auth.ts`, `src/context.ts`, `src/app.ts`, `src/app.test.ts`, `src/modules/{module,loader,schema,read-v1,write,baseline}.ts`.
- Rewritten: `src/index.ts`, `src/mcp.ts`. `tsconfig.json` now excludes tests.

Python client (`python/biotech-knowledge-client`):
- New: `src/biotech_knowledge_client/canonical.py`, `models_v2.py`, `tests/test_v2.py`.
- Changed: `client.py` (v2 write flow), `cli.py`, `models.py` (contract map: `intent`/`plan`/`receipt` are now v2; v1 is under `intent-v1` etc.), `__init__.py`, `tests/test_client.py` (v1 example validated as `intent-v1`).

Other:
- `scripts/neo4j-test.sh`: `BKS_NEO4J_EDITION=enterprise` selects image `neo4j:5.26-enterprise` with `NEO4J_ACCEPT_LICENSE_AGREEMENT=eval` (default container `bks-neo4j-test-ee`, bolt 7695). Community stays the default.
- Examples: `examples/ingestion-intent.v2.example.json` (the v1 example re-expressed in v2; plans `applicable`) and `examples/ingestion-intent.example.v2-migrated.json` (mechanical migration record of the v1 example; plans `rejected`, see matrix row 1). `examples/ingestion-intent.example.json` (v1) is unchanged.
- `pnpm-lock.yaml`: the `yaml` dependency for kg-ops. The lock also picks up other roles' concurrent manifest changes.
- Not touched: `read.ts`, `cypher.ts`, `resolve.ts`, `schema-workspace/**`, `apps/graphql-api/**`, `schema/**`, `workspace/**`, `evals/**`, skills, `.env.example`. The `.env.example` additions are listed in section 9.

## 3. Contract versions and JSON Schema paths

All exports are under `packages/contracts/json-schema/`:

| Contract | Version string | JSON Schema |
| --- | --- | --- |
| Ingestion intent | `biotech-knowledge-intent.v2` | `biotech-knowledge-intent.v2.json` |
| Plan (server-stored view) | `biotech-knowledge-plan.v2` | `biotech-knowledge-plan.v2.json` |
| Apply request (references only) | `biotech-knowledge-apply.v2` | `biotech-knowledge-apply.v2.json` |
| Receipt | `biotech-knowledge-receipt.v2` | `biotech-knowledge-receipt.v2.json` |
| Apply witness / claims | `bks-apply-witness.v1` | `bks-apply-witness.v1.json`, `bks-apply-witness-claims.v1.json` |
| Effect verification page | `bks-effect-verification.v1` | `bks-effect-verification.v1.json` |
| Custody snapshot record (S4 writes, S3 verifies) | `bks-custody-snapshot.v1` | `bks-custody-snapshot.v1.json` |
| Sealed verification result | `bks-sealed-verification.v1` | `bks-sealed-verification.v1.json` |
| Read-result status (shared enum) | `biotech-knowledge-read-result.v2` status | `biotech-knowledge-read-result-status.v2.json` |
| Error | `bks-error.v1` | `bks-error.v1.json` |
| Canonical JSON | `bks-canonical-json.v2` | golden: `packages/contracts/golden/canonical-json.v2.json` |
| v1 (decode only) | `…intent.v1`, `…plan.v1`, `…receipt.v1`, `bks-canonical-json.v1` | unchanged files |

**bks-canonical-json.v2 rules (KN-08).**
- Object keys are sorted by UTF-16 code units (RFC 8785 order); undefined members are dropped.
- Arrays are ordered sequences. A profile declares which paths are semantic sets; sets are sorted by canonical text and deduplicated. A profile can also declare explicit field sets; unknown keys then fail.
- Numbers use the ES6 `Number::toString` form, and `-0` becomes `0`.
- NaN and ±Infinity are errors. Integral values outside ±(2^53−1) are errors; large integers travel as decimal strings. `bigint` is an error.
- Strings are written as JSON.stringify writes them, with no NFC; lone surrogates are errors.
- Typed spellings: UTC instants are `…Z` with the stated fraction minus trailing zeros; date-only values are validated and kept; ISO durations are upper-cased; decimals use the plain form.
- The raw-byte digest (`rawBytesDigest`) and the canonical digest (`canonicalDigest`) are separate functions and fields.

## 4. Commands run (outcomes)

| Command | Result |
| --- | --- |
| `pnpm build` | pass (whole repo, tsc project references) |
| `pnpm test` (unit, no Docker) | 3 full runs: 192 passed / 30 skipped; 196 passed / 2 failed; 197 passed / 1 failed. **Every failure was S1's `packages/schema-workspace/src/release.test.ts` exceeding its 5 s default timeout under full parallel load.** In isolation: `npx vitest run --project schema-workspace packages/schema-workspace/src/release.test.ts` → 23/23 pass. My projects: contracts 62/62, kg-ops 23 passed / 22 skipped (integration), executor 4/4 |
| `npx vitest run --project contracts --project kg-ops --project executor` | 89 passed / 22 skipped |
| `BKS_INTEGRATION=1 NEO4J_TEST_URI=bolt://127.0.0.1:7696 NEO4J_EE_TEST_URI=bolt://127.0.0.1:7697 NEO4J_TEST_PASSWORD=bks-test-password npx vitest run --project kg-ops packages/kg-ops/src/kg-ops.integration.test.ts` | **22/22 pass** in 96.7 s, pinned release, 2026-10-12T00:03:02Z–00:04:47Z. An earlier run against the candidate release (2026-10-11 ~23:35Z) was also 22/22, after two fixes found by the first run (section 10) |
| `uv run --project python/biotech-knowledge-client pytest` | 66 passed (59 golden vectors, intent/plan digest golden, v2 JSON Schema validation, v1 decode, v1 TS/Python digest parity) |
| `pnpm contracts:json-schema` | 21 schemas written; the v1 files are unchanged |
| HTTP smoke: executor on :4920 (local DB, `BKS_LOCAL_DEV=1`, reader and writer tokens), driven by `bks_knowledge_client` | pass. Evidence: `runs/release-v2/s3/http-smoke.json` |
| `BKS_NEO4J_EDITION=enterprise … scripts/neo4j-test.sh up` | Enterprise evaluation instance started and used for the reader-role test |

Test databases were dedicated S3 containers (`bks-neo4j-s3` Community on 7696, `bks-neo4j-s3-ee` Enterprise on 7697). Other roles' containers on 7690–7694 were not touched, because the suite resets its database. Connect with `bolt://127.0.0.1:<port>`: `localhost` and `neo4j://` both time out here.

## 5. Gate B evidence rows

The Community identity is `bks-neo4j-s3` (Neo4j/5.26.31 Community, image `neo4j:5.26-community`). The Enterprise identity is `bks-neo4j-s3-ee` (5.26.31 Enterprise, evaluation licence). Each test resets the DB, installs the operational DDL and fence, and writes a `KsReleaseMarker` for `biotech-schema-v2.0.0`.

Unless a row says otherwise:
- Command: the integration command in section 4.
- Timestamp: 2026-10-12T00:03–00:05Z.
- Evidence: `runs/release-v2/s3/gate-b-tmv4hnwjl.json`.

| Gate B claim | Test | Result | Evidence |
| --- | --- | --- | --- |
| Same-context deterministic plan; recompilation reproduces it | `same-context deterministic plan…` | pass (same digest and planRef; another clock gives another digest) | `deterministic-plan` |
| Every ordinary proposal kind plans and applies; complete paginated readback | `plans and applies every ordinary proposal kind…` | pass. 19 proposals / 9 kinds; all declared effects checked in pages of 10; 0 failures | `every-ordinary-kind-applies` |
| Forged plan refusal (caller statements, tampered custody with recomputed hash, wrong digest, unknown ref, other tenant) | `forged plan refusal…` | pass (`BKS_PLAN_FORGED`, `BKS_PLAN_DIGEST_MISMATCH`, `BKS_PLAN_NOT_FOUND`, `BKS_FORBIDDEN_SCOPE`; 0 `:Pwned` nodes) | `forged-plan-refusal` |
| Identical replay → duplicate; changed bytes or plan → conflict; receipt scoped | `identical replay…` | pass | `replay-duplicate-and-conflict` |
| Concurrent identical apply → exactly one effect | `concurrent identical applies…` | pass ([applied, duplicate]; 1 node, 1 marker) | `concurrent-identical-apply` |
| Concurrent identifier race | `concurrent identifier race…` | pass ([applied, `BKS_IDENTITY_CONFLICT`]; 1 open HAS_IDENTIFIER) | `identifier-race` |
| Concurrent exclusive-slot race (subject, slot, asserter), OD-05 | `concurrent exclusive-slot race…` | pass ([applied, `BKS_SLOT_CONFLICT`]) | `slot-race` |
| Graph revision drift → `STALE_REVISION`, no implicit re-plan | `graph revision drift…` | pass | `revision-drift` |
| Response lost after commit → lookup applied, retry duplicate; lost commit ack reconciled via the marker | `response lost after commit…` | pass | `response-lost-after-commit` |
| Failed retry without marker deletion (history 2, then 3); complete rollback on mid-statement failure | `failed retry keeps the marker…` | pass (attempts [failed, failed, applied]; 0 nodes after the failures; graphRevision unchanged) | `failed-retry-history-and-rollback` |
| Failure-recorder race cannot overwrite applied | `failure-recorder race…` | pass (status applied; history [applied, failed]) | `failure-recorder-race` |
| Dependency-aware partial apply | `dependency-aware partial apply…` | pass (`BKS_PARTIAL_REFUSED`, `BKS_PARTIAL_NOT_CLOSED`, closed subset applied; excluded effects absent; readback 0 failures) | `partial-closed-subset` |
| Witness expired / invalid / revoked before witness, after witness before commit, after commit, delayed delivery | `witness expired / invalid / revoked…` | pass (`BKS_WITNESS_EXPIRED`; `BKS_WITNESS_INVALID` for a rogue signer and a binding mismatch; issuance refused after revocation; a delayed-delivery lease commits; after `deliverRevocation` an older witness fails in-transaction with `BKS_WITNESS_REVOKED`; the committed effect stays reported) | `witness-expiry-invalid-revocation` |
| Cancellation after commit reports the effect | `cancellation after commit…` | pass (applied + `cancellation.requestedAfterCommit`; cancel before commit writes nothing) | `cancellation` |
| edge.close, slot reuse after close, same-asserter supersession (P10, R-23) | `follow-up…` | pass | `close-slot-supersession` |
| Denied caller adjudication; forged verdict (rogue signature, wrong digest) refused; KN-15 table; OD-08 rendition exception (attempt recorded → ACCEPTED, no attempt → held PROPOSED); human AFFIRM of a held result; SUPPORT projection of the gated LEADS_TO; P16 VERIFIER_FOUND authority on HAS_EVIDENCE | `trusted adjudication delivery…` | pass | `adjudication-kn15-od08-support` |
| Privileged report.publish (P19, Claim.latestVerdict R-45) and projection.write (derived AFFECTS_MECHANISM, D10 Association); ordinary writers denied | `privileged report publication…` | pass | `report-and-projection-privileged` |
| Forged / tampered snapshot basis refused; custody-verified snapshot at the current revision plans (`revision-equal`) | `forged / tampered snapshot basis…` | pass | `snapshot-custody` |
| stable_revision read hook retries when a canonical write lands mid-read | `stable_revision read hook…` | pass (2 attempts) | `stable-revision-retry` |
| FU-03: 82 migrated intents plan on the real graph; admitted subsets apply | `FU-03 matrix…` | pass (1 applicable, 39 partial, 42 rejected; 624 proposals applied; 0 apply failures) | `runs/release-v2/s3/fixture-matrix.json` |
| Real read-only authority (Enterprise): the reader role plans but cannot write even in a WRITE session; the writer role applies | `Gate B on Neo4j Enterprise…` | pass | `runs/release-v2/s3/gate-b-ee-tmv4hnwjl.json` |
| P1–P21, OD-11, OD-17, EX-04, KN-15 offline (no Docker) | `packages/kg-ops/src/write.test.ts` | 17/17 | `npx vitest run --project kg-ops packages/kg-ops/src/write.test.ts` |
| Executor auth and role gating | `apps/executor/src/app.test.ts` | 4/4 | `npx vitest run --project executor` |
| Live HTTP flow via the Python client | HTTP smoke | pass. The reader gets 403 on plan; the writer plans, admits, applies (23 effects, graphRevision 63), and a replay returns a duplicate; the reader's receipt lookup and paginated verification report 0 failures | `runs/release-v2/s3/http-smoke.json` (2026-10-12T00:06:19Z) |

P1–P21 coverage in the fixtures:
- P1: lastWriterRunId on every node and edge write.
- P2: Activity carries runId, missionId and operationKind.
- P3: activityKind from the kernel enum.
- P4: HAS_EVIDENCE {role, origin}.
- P5: assertionKind; no agentRunUid.
- P6: identifier.attach on any Subjectable.
- P7: one Identifier type; gtin14 normalization.
- P8: mention.stage produces a RESOLUTION Assessment and no Mention node.
- P9: WAS_GENERATED_BY on created and updated nodes.
- P10: supersedesUid.
- P11: selectorJson and selectorDigest.
- P12: no archetype markers.
- P13: operational DDL plus per-label uid constraints and asserted-type relationshipUid indexes (`operationalDdl`).
- P14: Activity list fields.
- P15: lineage.start.
- P16: VERIFIER_FOUND authority, independence and facet.
- P17: recorded-only profiles carry no valid-time fields.
- P18: the refinesClaimUid cache is written from an accepted REFINES assessment. This path has unit-level coverage only; there is no integration fixture yet.
- P19: report.publish.
- P20: asserter types, Channel ACCOUNT only.
- P21: `segment:` qualifier.

## 6. What the writer enforces (design summary)

- **Registry validation (release-driven).**
  - Labels: primary and stored labels come from `@node(labels:)`.
  - Executor ops come from register `mutations.executor`. Where the register leaves them unstated, ADR 0003 applies: create plus update. Projection-only types are Association and Chunk.
  - uid tokens come from the node register; routing is token → primary label, with no `:Entity` assumption. There is an explicit cross-label uid check (one union over all 69 primary labels) plus per-label uniqueness constraints.
  - Property types are checked against the SDL. Predicate status (registered, proposed-new with a warning, alias re-keyed, retired refused) and predicate kind are checked, along with subject and object types (declared ∪ observed), literal value fields and required qualifiers.
  - Qualifier grammar: with the release `qualifiers.yaml`, an unregistered prefix is refused, the value must match the registered grammar, and both `:` and `=` separators are accepted. The candidate falls back to the D12 grammar.
  - Asserter scope (P20). Identity: candidate uid, exact identifier (scheme, issuer, normalized value per the scheme register, pattern) and exact name. Names never establish identity alone. One identifier identifies at most one Subjectable (R-42).
  - Exclusive slots are scoped (subject, slot, asserter) with valid-time overlap (R-10, OD-05). Projection gates: derived edges are written only through `projection.write`, and SUPPORT-gated types project only from an admitting SUPPORT adjudication (R-22). Only one episode per (from, to, type, asserter); further assertions corroborate.
  - EX-04 canonical URI: tracking keys stripped, semantic keys (YouTube `v`) kept, query sorted, host aliases normalized, uid = slug + versioned digest; a collision is refused.
  - OD-08 rendition exception. OD-11: FIELD Assertions per registered field predicate, with evidence from `fieldEvidence`, locators that `reportsFields`, or the batch evidence.
  - OD-17: contacts stripped from Person properties; private-person predicates refused. KN-15 status table (EXTRACTED = captured, unadjudicated; the full table is in `write/proposals.ts`).
  - FU-06: `captureMethod` must be a registry id (`<tool>/<version>`; the tool is checked against `capture-methods.yaml`), with the free text kept in `captureMethodDescription`.
- **Pure compiler.** It runs over (normalized intent, release, frozen observations, injected clock, principal grants). The planner probes the graph in one read transaction until the compiler asks for no new key (`write/observations.ts`). The observation map digest is bound into the plan.
- **Plan custody.** `FilePlanStore` lives under `runs/release-v2/plans/` (gitignored), keyed by `planRef = pl-<40 hex of planDigest>`. A stored plan is immutable. At apply, the executor loads the record, checks its digest, recompiles it from the frozen context and requires an identical result (`BKS_PLAN_FORGED` otherwise).
- **Apply transaction order (SPECIFICATION 7.3).**
  1. Fence lock: an exclusive non-reading write, then the dependent `lockSeq` update and a fresh fence read.
  2. Release marker check (bypass only with `BKS_LOCAL_DEV=1`, recorded as an invariant note).
  3. Witness revocation generation against `KsRevocationFence`. Signature, audience, lifetime ≤60 s, expiry and bindings are verified before the transaction; expiry is checked again before commit.
  4. Scoped marker: duplicate, conflict, or retry of a failed attempt.
  5. Identity and slot invariants (most specific code first), then a strict graph-revision check.
  6. Compiler statements, each with exact row and counter expectations.
  7. Asserted-edge provenance and evidence-chain invariants.
  8. Activity P14 lists, marker receipt projection and attempt history, `graphRevision + 1`, then a single commit.
  The transaction budget is 30 s and the contract allows at most 500 proposals per intent. Failure records run in their own transaction under the fence and never overwrite an applied marker or delete one.

## 7. FU-03 fixture matrix (82 intents)

Columns:
- Offline plan: the pinned release against an empty graph (`packages/kg-ops/src/write.test.ts`, `runs/release-v2/s3/fixture-matrix.offline.json`).
- Real Neo4j: the same intents planned on the Gate B graph, with the closed admitted subset applied (`runs/release-v2/s3/fixture-matrix.json`).
- Gaps held: v1 rationale segments that mark a v1 gap and could not be mapped mechanically. Each holds its proposal through the R-22 `hold` flag, with the segment as the reason.
- Gaps recorded: notes sentences listing records that live only in `assertions.yaml` (Claims, Assessments and so on). They are recorded in the intent provenance, not invented.

Totals:
- Offline: 1 applicable, 40 partial, 41 rejected; 637 of 1625 proposals admitted.
- Real graph: 1 applicable, 39 partial, 42 rejected; 624 applied; 0 apply failures; no TypeError anywhere.

Dominant reasons:
- `SUBJECT_CONFLICT`: v2-required properties missing in the fixture subjects, e.g. `Organization.entityKind` in 140 subjects.
- `BKS_EVIDENCE_UNVERIFIED`: a locator without an R-38 selector basis on a non-RAW_BYTES capture.
- `SUBJECT_MISSING`: depends on entities created by other fixtures.
- `HELD_BY_AUTHOR`: unmappable v1 gaps.
- `PREDICATE_KIND_MISMATCH`: a literal written for a relationship predicate that needs an object.
- `QUALIFIER_REQUIRED` / `QUALIFIER_UNREGISTERED`, `LITERAL_VALUE_INVALID`, `RETIRED_PREDICATE`.

These are fixture data gaps for the next FU-03 edit round, not writer failures. The migration rules are in `packages/kg-ops/src/write/migrate-v1.ts`, and every edit is recorded in `provenance.edits`. The row-per-intent table is in section 12.

## 8. Interface for the reads role (S4) and other consumers

**stable_revision probes** (`packages/kg-ops/src/fence.ts`):
- `withStableRevision(client, fn, { maxAttempts?, timeoutMs?, bookmarks? })` runs `fn(tx, attempt)` inside ONE explicit READ transaction. It reads `KsWriteFence.graphRevision` before and after `fn` and retries the whole read when the revision moved, failing with `BKS_STALE_REVISION` after `maxAttempts`. It returns `{ result, graphRevision, attempts, bookmarks }`.
- `fn` must allocate its accumulators inside each call. An abandoned attempt's rows are discarded.
- `readFence(tx)` is a lock-free probe returning `{ graphRevision, lockSeq, revocationGeneration, releaseDigests }`.
- The guarantee holds because every canonical writer takes `lockFence` and bumps `graphRevision` once per committed effect. Unmanaged admin writes are outside it.

**Snapshots cited as `basis.snapshotRef`.**
- Persist through `SnapshotCustody.put(record, bytes)` (`packages/kg-ops/src/custody.ts`; file backend `runs/release-v2/custody/snapshots/`).
- The record is a `CustodySnapshotRecord` (`bks-custody-snapshot.v1`):
  - `bytesDigest = rawBytesDigest(bytes)`.
  - `issuer`: one of `BKS_SNAPSHOT_ISSUERS`.
  - `scope`: installation / application / tenant.
  - `pins.schemaReleaseDigest`.
  - `consistency.graphRevision`: the revision from `withStableRevision`.
  - `dependencies {complete, nodes[{uid, updatedAt}]}`.
- The planner accepts `revision-equal`, or `dependencies-unchanged` when `complete: true`; anything else is `BKS_STALE_REVISION`.

**Digests.**
- `queryDigest` and `resultDigest`: `canonicalDigest(value, profile)` (bks-canonical-json.v2; no timing in `resultDigest`).
- Retained bytes: `rawBytesDigest(bytes)`.
- `receiptDigest`: `canonicalDigest` including timing and server metadata.
- Shared types `ReadResultStatus`, `ReadDigests` and `ConsistencyMode` are in `@bks/contracts`. Python: `canonical_digest`, `raw_bytes_digest`.

**Executor module.**
- Add `apps/executor/src/modules/read.ts` exporting `executorModule` (interface in `modules/module.ts`), with capabilities `read.typed` v2 and `read.cypher`, role `reader`. It is discovered by HTTP and MCP; no other file changes.
- `BKS_DISABLE_READ_V1=1` retires `modules/read-v1.ts`.
- Use a read-only database role for reads. The Enterprise test proves `bks_reader` cannot write even through a WRITE session.

**Mission Control / S7.**
- Issue `bks-apply-witness.v1` (Ed25519, audience `bks-executor`, ≤60 s). It binds effectKey, scope, the intent/plan/release/evidence digests, `partialPolicyDigest`, the policy/decision versions and `revocationGeneration`.
- Pin the issuer public key via `BKS_WITNESS_ISSUER_KEYS`.
- Deliver revocations with `deliverRevocation(client, generation)`.
- Reconcile with `GET /kg/receipt?effectKey=` before any retry.

## 9. Environment variables (added to `.env.example` in the follow-up, names and comments only)

- `BKS_EXECUTOR_TOKENS`: JSON `[{token or tokenSha256, role reader/writer/admin, principalId, installationId, applicationId, tenantId, grants[]}]`.
- `BKS_LOCAL_DEV=1` with `BKS_LOCAL_DEV_ROLE` and `BKS_LOCAL_DEV_GRANTS`: explicit dev profile (no token, dev admission, release-marker bypass).
- `BKS_MCP_TOKEN`: the principal the MCP process acts as.
- `BKS_ENABLE_BASELINE_TOOLS=1`: raw Cypher for admin tokens only.
- `BKS_WITNESS_ISSUER_KEYS` (`kid:<base64 SPKI DER>,…`), `BKS_WITNESS_SIGNING_KEY` (`kid:<base64 PKCS8 DER>`, dev only) and `BKS_WITNESS_ISSUER`.
- `BKS_VERIFIER_ISSUER_KEYS`: pinned verifier keys for sealed verifications.
- `BKS_SNAPSHOT_ISSUERS`.
- `BKS_RELEASE_RUNS_DIR`: custody root, default `runs/release-v2`.
- `BKS_WRITE_RELEASE_SOURCE` (`pinned` or `candidate`) and `BKS_CANDIDATE_RELEASE_DIR`.
- `BKS_DISABLE_READ_V1`.

No keys are committed; tests generate key pairs at runtime.

## 10. Interface deltas vs INTERFACES v0 (for the lead to merge)

1. **Error codes added**: `BKS_PARTIAL_REFUSED`, `BKS_PARTIAL_NOT_CLOSED`, `BKS_PLAN_REJECTED`, `BKS_AUTHORITY_UNAVAILABLE`.
2. **KsIntentMarker** is unique on `markerKey = mk-<sha256(canonical{installationId, applicationId, tenantId, effectKey})>`. It also stores effectKey, scope, intentId, both digests, planRef, `attempts` (JSON history), `receipt`, `receiptId`, `lastAttemptId` and `graphRevision`. Persisted status is `applied | failed` only; `applying` is never committed, and `unresolved` is a receipt outcome reconciled by lookup.
3. **KsWriteFence** gains `lockSeq` and `locked`. `graphRevision` increments only on effect commits.
4. **New operational label** `KsRevocationFence {id: "canonical", generation}`.
5. **DDL for S1's `ddl/required.cypher`** (from `operationalDdl()`):
   - Uniqueness on KsWriteFence.id, KsRevocationFence.id, KsIntentMarker.markerKey, KsReleaseMarker.releaseId and Identifier (scheme, issuer, value).
   - Per-label uid uniqueness.
   - Indexes on Claim.propositionHash, CaptureAttempt.subjectUid and Activity (externalRunSystem, runId), plus relationshipUid per asserted type.
6. **Witness**: Ed25519 only (no HS256). The claims add `jti`, `partialPolicyDigest` and `decisionVersion`.
7. **Apply request** requires `intentDigest` (no `intentRef`). `statements` / `plan` / `cypher` keys are `BKS_PLAN_FORGED`.
8. **Plan**:
   - Dispositions are `admitted | noop_duplicate | held | rejected`.
   - Implicit `dependsOn` is filled in.
   - The plan carries `effects` and `invariants`.
   - Each statement carries `expectRows` / `expectNodesCreated` / `expectRelationshipsCreated` / `needs`.
9. **Receipt** adds `attempts`, `cancellation`, `recovery.lookup`, `invariants` and the complete declared effects.
10. **Intent v2**:
    - The proposal kind `lineage.start` (P15 / OD-06).
    - Proposal-level `hold` (R-22) and an intent `provenance` block.
    - `mention.stage.locator` with `typeHint` and `candidates`.
    - Evidence `{uid, selectorDigest}`.
    - `Qualifier` allows `:` and `=`.
    - A Source can be a `new` subject (EX-04 identity).
11. **`/describe`**:
    - Capabilities: `plan`, `apply`, `receipt.get`, `verifyEffects`, `admission.dev` (dev), `baseline.cypher` (evaluation), `read.typed` (advertised as v1).
    - Adds `schemaDigest`, `releaseSource` and `principal`.
    - `queryCatalogDigest` is null and `readModes` is `["observed"]` until S4.
12. **Python**: `intent` / `plan` / `receipt` mean v2; v1 is under `intent-v1` / `plan-v1` / `receipt-v1`.
13. **New contracts**: `bks-custody-snapshot.v1`, `bks-sealed-verification.v1`, `bks-effect-verification.v1`, `bks-error.v1`.

Invalidated artifacts:
- Clients of the v1 `/kg/plan`, `/kg/apply` or `/kg/receipt/:intentId` routes.
- Anything pinned to the pre-swap candidate digest `sha256:e1197679…`.
- Activity uids (they now end in an 8-hex suffix) and Source uids (now slug + canonical-URI digest). S8 should treat both as new identities.

## 11. Limitations, unrun checks, blockers

Limitations:
- **Executor ops** are derived from register text, with the default create plus update where the register is unstated (ADR 0003); each derivation is recorded per type (`WriteSchema.executorOpsTable()`). Prefer S1's `executorOps[]` once it is emitted.
- **OD-11** FIELD Assertions exist only for registered FIELD predicates. RegistrationVersion has none (MD-X-03), so that acceptance fixture is blocked on S1 registrations; PLANT_PART and MAX_DAILY_SERVINGS are exercised.
- **Partial registry shapes.** Predicate subject and object lists are enforced as declared ∪ observed; empty lists warn. The capture-method check only warns.
- **Partial admission infrastructure.**
  - Admission is the dev in-memory authority only; production admission and durable revocation delivery are S7/S9.
  - Serving-time revocation rechecks are not in S3.
  - Custody uses file backends; Supabase `knowledge-artifacts` (OD-14) is not implemented.
  - The KS verifier integration is S7.
- **Performance.** On a fresh DB the first plan and apply cost ≈11 s and ≈10 s (Neo4j query-plan compilation). Warm runs take ≈0.4 s and ≈0.9 s for the 19-proposal catalog. Writer-fence contention is not yet measured.
- **Modelling choices to review.** `mention.stage` without candidates ASSESSES the locator's Source (facet `candidate=none`). CaptureAttempts link to their Source by `subjectUid`.

Unrun or partial checks:
- MCP over stdio (typechecked only).
- Fence contention under concurrent load.
- A P18 integration fixture (unit-level only).
- Any Aura or production check (never touched).

Blockers, flakes and incidents:
- S1's `release.test.ts` times out under full parallel `pnpm test`. It passes alone; it needs a larger per-test timeout.
- Docker Desktop's engine hung with HTTP 500 for several minutes and recovered without a restart.
- First-run defects fixed:
  - A shared→exclusive fence-lock upgrade deadlock (fixed with a non-reading exclusive write first).
  - Verification custody keyed by ref only (now ref + digest).

## 12. Fixture matrix (row per intent)

| # | Intent | Offline plan (empty graph) | Real Neo4j: plan -> apply | Admitted / held / rejected / noop (offline) | Reasons for non-admitted proposals, blocked subjects, plan errors | v1 gaps held / recorded |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | examples/ingestion-intent.example.json | rejected | rejected -> not applied | 0 / 0 / 5 / 0 | INVALID_SOURCE; SUBJECT_CONFLICT; RETIRED_PREDICATE; BKS_EVIDENCE_UNVERIFIED; subject UNKNOWN_PROPERTY; subject REQUIRED_PROPERTY_MISSING | 0 / 0 |
| 2 | D10/fda-qhc-magnesium-disconfirmation/intent.json | rejected | rejected -> not applied | 0 / 0 / 12 / 0 | SUBJECT_CONFLICT; LITERAL_VALUE_INVALID; subject REQUIRED_PROPERTY_MISSING | 0 / 2 |
| 3 | D10/livertox-green-tea-extract-harm/intent.json | rejected | rejected -> not applied | 0 / 0 / 8 / 0 | SUBJECT_CONFLICT; subject REQUIRED_PROPERTY_MISSING | 0 / 2 |
| 4 | D10/mg-bisglycinate-rct-unstructured/intent.json | rejected | rejected -> not applied | 0 / 0 / 11 / 0 | SUBJECT_CONFLICT; DEPENDS_ON_REJECTED; subject REQUIRED_PROPERTY_MISSING; subject SUBJECT_UNKNOWN | 0 / 2 |
| 5 | D10/mg-rankings-criteria-comparison/intent.json | rejected | rejected -> not applied | 0 / 0 / 39 / 0 | SUBJECT_CONFLICT; DEPENDS_ON_REJECTED; LITERAL_VALUE_INVALID; subject REQUIRED_PROPERTY_MISSING; subject SUBJECT_UNKNOWN | 0 / 2 |
| 6 | D10/opentargets-association-signal/intent.json | rejected | rejected -> not applied | 0 / 0 / 10 / 0 | INVALID_ASSERTION; SUBJECT_CONFLICT; PREDICATE_KIND_MISMATCH; subject REQUIRED_PROPERTY_MISSING | 0 / 2 |
| 7 | D11/capture-failures-coverage/intent.json | rejected | rejected -> not applied | 0 / 0 / 1 / 0 | SUBJECT_CONFLICT; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 8 | D11/nr-chloride-gsrs-identifier-bridge/intent.json | partial | partial -> partial | 9 / 0 / 1 / 0 | SUBJECT_CONFLICT; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 9 | D11/nr-trial-jats-unstructured/intent.json | partial | partial -> partial | 4 / 0 / 11 / 0 | SUBJECT_CONFLICT; INVALID_ASSERTION; PREDICATE_KIND_MISMATCH; SUBJECT_MISSING; subject REQUIRED_PROPERTY_MISSING; subject SUBJECT_UNKNOWN | 0 / 1 |
| 10 | D11/resveratrol-retraction-integrity/intent.json | partial | partial -> partial | 2 / 0 / 5 / 0 | SUBJECT_CONFLICT; RETIRED_PREDICATE; SUBJECT_MISSING; subject SUBJECT_UNKNOWN; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 11 | D11/sirolimus-spl-boxed-warning/intent.json | rejected | rejected -> not applied | 0 / 0 / 6 / 0 | SUBJECT_CONFLICT; subject REQUIRED_PROPERTY_MISSING | 0 / 0 |
| 12 | D12/acrylamide-fried-potato-harm/intent.json | rejected | rejected -> not applied | 0 / 0 / 7 / 0 | PREDICATE_KIND_MISMATCH; SUBJECT_MISSING; SUBJECT_CONFLICT; BKS_EVIDENCE_UNVERIFIED; QUALIFIER_REQUIRED; subject REQUIRED_PROPERTY_MISSING | 0 / 0 |
| 13 | D12/mcdonalds-fries-prepared-food/intent.json | rejected | rejected -> not applied | 0 / 2 / 10 / 0 | SUBJECT_CONFLICT; HELD_BY_AUTHOR; INVALID_ASSERTION; subject REQUIRED_PROPERTY_MISSING | 2 / 0 |
| 14 | D12/olive-oil-polyphenols-preparation/intent.json | rejected | rejected -> not applied | 0 / 0 / 6 / 0 | INVALID_EDGE_PROPERTY; SUBJECT_MISSING; subject REQUIRED_PROPERTY_MISSING; subject SUBJECT_UNKNOWN | 0 / 0 |
| 15 | D12/predimed-retraction-disconfirmation/intent.json | rejected | rejected -> not applied | 0 / 3 / 8 / 0 | HELD_BY_AUTHOR; PREDICATE_KIND_MISMATCH; SUBJECT_CONFLICT; INVALID_ASSERTION; subject REQUIRED_PROPERTY_MISSING; subject DUPLICATE_WITHIN_INTENT | 3 / 1 |
| 16 | D12/upf-diet-rct-unstructured/intent.json | partial | partial -> partial | 2 / 3 / 5 / 0 | PREDICATE_KIND_MISMATCH; HELD_BY_AUTHOR; SUBJECT_CONFLICT; INVALID_ASSERTION; subject REQUIRED_PROPERTY_MISSING; subject SUBJECT_UNKNOWN | 3 / 1 |
| 17 | D13/bioage-strides-discontinuation/intent.json | rejected | rejected -> not applied | 0 / 2 / 9 / 0 | PREDICATE_KIND_MISMATCH; HELD_BY_AUTHOR; SUBJECT_MISSING; subject SUBJECT_UNKNOWN | 2 / 1 |
| 18 | D13/lesne-2006-retraction/intent.json | rejected | rejected -> not applied | 0 / 0 / 7 / 0 | PREDICATE_KIND_MISMATCH; SUBJECT_MISSING; subject SUBJECT_UNKNOWN | 0 / 1 |
| 19 | D13/madrigal-financing-after-readout/intent.json | rejected | rejected -> not applied | 0 / 8 / 5 / 0 | PREDICATE_KIND_MISMATCH; HELD_BY_AUTHOR; SUBJECT_MISSING; subject SUBJECT_UNKNOWN | 8 / 1 |
| 20 | D13/madrigal-maestro-nash-topline-8k/intent.json | rejected | rejected -> not applied | 0 / 4 / 5 / 0 | PREDICATE_KIND_MISMATCH; SUBJECT_MISSING; HELD_BY_AUTHOR; subject SUBJECT_UNKNOWN | 4 / 1 |
| 21 | D13/madrigal-pdufa-to-accelerated-approval/intent.json | rejected | rejected -> not applied | 0 / 0 / 22 / 0 | SUBJECT_MISSING; PREDICATE_KIND_MISMATCH; subject SUBJECT_UNKNOWN | 0 / 1 |
| 22 | D1/ashwagandha-plant-part-harm/intent.json | partial | partial -> partial | 2 / 0 / 9 / 0 | SUBJECT_CONFLICT; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 23 | D1/lgg-strain-resolution/intent.json | partial | partial -> partial | 3 / 0 / 9 / 0 | SUBJECT_CONFLICT; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 24 | D1/nr-salt-moiety-us-canada/intent.json | partial | partial -> partial | 1 / 0 / 12 / 0 | SUBJECT_CONFLICT; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 25 | D1/nr-trial-unstructured/intent.json | partial | partial -> partial | 5 / 0 / 4 / 0 | SUBJECT_CONFLICT; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 26 | D1/vitamin-b6-threshold-harm/intent.json | rejected | rejected -> not applied | 0 / 0 / 15 / 0 | SUBJECT_CONFLICT; QUALIFIER_REQUIRED; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 27 | D2/dq-senescence-biomarker-path/intent.json | partial | partial -> partial | 9 / 0 / 4 / 1 | SUBJECT_CONFLICT; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 28 | D2/metformin-exercise-harm/intent.json | partial | partial -> partial | 1 / 0 / 6 / 2 | SUBJECT_CONFLICT; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 29 | D2/nr-muscle-unstructured/intent.json | partial | partial -> partial | 2 / 0 / 4 / 6 | SUBJECT_CONFLICT; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 30 | D2/reactome-chembl-reference/intent.json | partial | partial -> partial | 3 / 0 / 10 / 0 | SUBJECT_CONFLICT; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 31 | D2/sirt1-activation-disconfirmation/intent.json | partial | partial -> partial | 4 / 0 / 1 / 2 | SUBJECT_CONFLICT; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 32 | D3/aspree-registry-history-harm/intent.json | partial | partial -> partial | 70 / 0 / 49 / 0 | BKS_EVIDENCE_UNVERIFIED; SUBJECT_MISSING; subject SUBJECT_UNKNOWN | 0 / 1 |
| 33 | D3/dq-bone-trial-unstructured/intent.json | partial | partial -> partial | 81 / 0 / 39 / 0 | BKS_EVIDENCE_UNVERIFIED; SUBJECT_MISSING; PREDICATE_KIND_MISMATCH; subject SUBJECT_UNKNOWN | 0 / 1 |
| 34 | D3/resveratrol-retraction/intent.json | partial | partial -> partial | 5 / 0 / 19 / 0 | BKS_EVIDENCE_UNVERIFIED; SUBJECT_MISSING; subject SUBJECT_UNKNOWN | 0 / 1 |
| 35 | D4/clock-noise-vs-retest-advice/intent.json | rejected | rejected -> not applied | 0 / 0 / 7 / 0 | SUBJECT_CONFLICT; SUBJECT_MISSING; LITERAL_VALUE_INVALID; BKS_EVIDENCE_UNVERIFIED; subject SUBJECT_UNKNOWN; subject REQUIRED_PROPERTY_MISSING | 0 / 2 |
| 36 | D4/consumer-panel-and-blood-clock/intent.json | partial | partial -> partial | 10 / 0 / 18 / 0 | SUBJECT_CONFLICT; subject REQUIRED_PROPERTY_MISSING | 0 / 0 |
| 37 | D4/dunedinpace-paper-unstructured/intent.json | partial | partial -> partial | 2 / 0 / 4 / 0 | BKS_EVIDENCE_UNVERIFIED; LITERAL_VALUE_INVALID | 0 / 1 |
| 38 | D4/hba1c-two-labs-interference/intent.json | partial | partial -> partial | 12 / 0 / 9 / 0 | SUBJECT_CONFLICT; INVALID_ASSERTION; BKS_EVIDENCE_UNVERIFIED; subject REQUIRED_PROPERTY_MISSING | 0 / 0 |
| 39 | D4/noninvasive-glucose-cgm-recall/intent.json | partial | partial -> partial | 1 / 0 / 8 / 0 | SUBJECT_CONFLICT; INVALID_ASSERTION; BKS_EVIDENCE_UNVERIFIED; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 40 | D4/nr-nad-compound-to-test/intent.json | partial | partial -> partial | 6 / 0 / 8 / 0 | BKS_EVIDENCE_UNVERIFIED; SUBJECT_CONFLICT; subject REQUIRED_PROPERTY_MISSING | 0 / 0 |
| 41 | D4/wearable-hrv-algorithm-changes/intent.json | partial | partial -> partial | 5 / 0 / 6 / 0 | INVALID_ASSERTION; BKS_EVIDENCE_UNVERIFIED; SUBJECT_CONFLICT; subject REQUIRED_PROPERTY_MISSING | 0 / 0 |
| 42 | D5/antioxidant-exercise-disconfirmation/intent.json | rejected | rejected -> not applied | 0 / 1 / 9 / 0 | SUBJECT_MISSING; QUALIFIER_REQUIRED; HELD_BY_AUTHOR; subject SUBJECT_UNKNOWN; subject REQUIRED_PROPERTY_MISSING | 1 / 1 |
| 43 | D5/pregnancy-magnesium-upper-limit/intent.json | partial | partial -> partial | 48 / 0 / 41 / 0 | BKS_EVIDENCE_UNVERIFIED; SUBJECT_CONFLICT; QUALIFIER_REQUIRED; subject REQUIRED_PROPERTY_MISSING | 0 / 0 |
| 44 | D5/sirolimus-label-interactions-harm/intent.json | rejected | rejected -> not applied | 0 / 0 / 11 / 0 | SUBJECT_CONFLICT; QUALIFIER_REQUIRED; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 45 | D5/sleep-toolkit-unstructured/intent.json | partial | partial -> partial | 34 / 1 / 13 / 0 | BKS_EVIDENCE_UNVERIFIED; SUBJECT_CONFLICT; HELD_BY_AUTHOR; SUBJECT_MISSING; QUALIFIER_REQUIRED; subject SUBJECT_UNKNOWN | 1 / 1 |
| 46 | D6/filing-channels-niagen-10k/intent.json | rejected | rejected -> not applied | 0 / 4 / 5 / 0 | HELD_BY_AUTHOR; SUBJECT_CONFLICT; subject REQUIRED_PROPERTY_MISSING | 4 / 1 |
| 47 | D6/label-versions-truniagen-dsld/intent.json | partial | partial -> partial | 11 / 0 / 19 / 0 | SUBJECT_CONFLICT; INVALID_ASSERTION; PREDICATE_KIND_MISMATCH; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 48 | D6/offer-roles-price-kinds-truniagen/intent.json | partial | partial -> partial | 10 / 0 / 33 / 0 | SUBJECT_CONFLICT; INVALID_ASSERTION; BKS_EVIDENCE_UNVERIFIED; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 49 | D6/prepared-food-bigmac-mcdonalds/intent.json | partial | partial -> partial | 2 / 0 / 24 / 0 | SUBJECT_CONFLICT; INVALID_ASSERTION; LITERAL_VALUE_INVALID; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 50 | D6/proprietary-blend-ag1/intent.json | partial | partial -> partial | 7 / 0 / 13 / 0 | SUBJECT_CONFLICT; INVALID_ASSERTION; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 51 | D6/recall-moringa-mogo/intent.json | partial | partial -> partial | 7 / 1 / 21 / 0 | SUBJECT_CONFLICT; INVALID_ASSERTION; HELD_BY_AUTHOR; PREDICATE_KIND_MISMATCH; BKS_EVIDENCE_UNVERIFIED; subject REQUIRED_PROPERTY_MISSING | 1 / 1 |
| 52 | D6/retailer-reformulation-claim-iherb/intent.json | partial | partial -> partial | 2 / 0 / 14 / 0 | SUBJECT_CONFLICT; INVALID_ASSERTION; BKS_EVIDENCE_UNVERIFIED; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 53 | D7/attia-cgm-dexcom-recommendation-interest/intent.json | rejected | rejected -> not applied | 0 / 1 / 5 / 0 | INVALID_SOURCE; HELD_BY_AUTHOR; BKS_EVIDENCE_UNVERIFIED; PREDICATE_KIND_MISMATCH; subject REQUIRED_PROPERTY_MISSING | 1 / 3 |
| 54 | D7/bioage-group-vehicles-stale-role/intent.json | rejected | rejected -> not applied | 0 / 0 / 8 / 0 | BKS_EVIDENCE_UNVERIFIED | 0 / 2 |
| 55 | D7/elysium-paper-funding-award/intent.json | rejected | rejected -> not applied | 0 / 0 / 14 / 0 | BKS_EVIDENCE_UNVERIFIED; PREDICATE_KIND_MISMATCH; SUBJECT_CONFLICT; subject REQUIRED_PROPERTY_MISSING | 0 / 2 |
| 56 | D7/ftc-ameribev-paid-dieticians-harm/intent.json | rejected | rejected -> not applied | 0 / 0 / 4 / 0 | BKS_EVIDENCE_UNVERIFIED | 0 / 2 |
| 57 | D7/niagen-ownership-brand-history/intent.json | rejected | rejected -> not applied | 0 / 0 / 20 / 0 | BKS_EVIDENCE_UNVERIFIED; PREDICATE_KIND_MISMATCH; subject REQUIRED_PROPERTY_MISSING | 0 / 2 |
| 58 | D7/sinclair-self-disclosure-unstructured/intent.json | rejected | rejected -> not applied | 0 / 0 / 12 / 0 | BKS_EVIDENCE_UNVERIFIED | 0 / 2 |
| 59 | D8/certification-listing-lot-scope/intent.json | rejected | rejected -> not applied | 0 / 0 / 24 / 0 | SUBJECT_CONFLICT; subject REQUIRED_PROPERTY_MISSING | 0 / 0 |
| 60 | D8/eu-nrcl-authorisation-data-protection/intent.json | rejected | rejected -> not applied | 0 / 0 / 11 / 0 | SUBJECT_CONFLICT; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 61 | D8/eurofins-coa-quantity-by-input/intent.json | rejected | rejected -> not applied | 0 / 0 / 22 / 0 | SUBJECT_CONFLICT; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 62 | D8/imu-tek-warning-letter-recall/intent.json | rejected | rejected -> not applied | 0 / 2 / 18 / 0 | SUBJECT_CONFLICT; HELD_BY_AUTHOR; subject REQUIRED_PROPERTY_MISSING | 2 / 1 |
| 63 | D8/nmn-us-exclusion-reversal/intent-step2.json | rejected | rejected -> not applied | 0 / 0 / 16 / 0 | SUBJECT_CONFLICT; EPISODE_NOT_FOUND; subject REQUIRED_PROPERTY_MISSING | 0 / 0 |
| 64 | D8/nmn-us-exclusion-reversal/intent.json | rejected | rejected -> not applied | 0 / 1 / 10 / 0 | SUBJECT_CONFLICT; HELD_BY_AUTHOR; subject REQUIRED_PROPERTY_MISSING | 1 / 1 |
| 65 | D8/us8197807-claims-held-invalid/intent.json | rejected | rejected -> not applied | 0 / 0 / 18 / 0 | SUBJECT_CONFLICT; subject REQUIRED_PROPERTY_MISSING | 0 / 0 |
| 66 | D9/hl-essentials-recut-nmncom-retelling/intent.json | partial | partial -> partial | 2 / 0 / 14 / 0 | INVALID_ASSERTION; SUBJECT_MISSING; PREDICATE_KIND_MISMATCH; SUBJECT_CONFLICT; ASSERTER_TYPE_INVALID; subject SUBJECT_UNKNOWN | 0 / 1 |
| 67 | D9/hl52-transcript-nmn-practice/intent.json | partial | partial -> partial | 1 / 0 / 20 / 0 | SUBJECT_MISSING; INVALID_ASSERTION; IDENTIFIER_PATTERN_MISMATCH; SUBJECT_CONFLICT; PREDICATE_KIND_MISMATCH; RETIRED_PREDICATE | 0 / 1 |
| 68 | D9/lifespan-ep4-spermidine-correction/intent.json | partial | partial -> partial | 2 / 0 / 10 / 0 | SUBJECT_MISSING; PREDICATE_KIND_MISMATCH; SUBJECT_CONFLICT; subject SUBJECT_UNKNOWN; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 69 | D9/longecity-nmn-fatigue-pseudonymous/intent.json | partial | partial -> partial | 1 / 0 / 5 / 0 | SUBJECT_MISSING; PREDICATE_KIND_MISMATCH; QUALIFIER_REQUIRED; BKS_EVIDENCE_UNVERIFIED; subject SUBJECT_UNKNOWN; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 70 | D9/rapa-ex-01-attia-retelling/intent.json | partial | partial -> partial | 2 / 0 / 9 / 0 | SUBJECT_MISSING; ASSERTER_TYPE_INVALID; SUBJECT_CONFLICT; subject SUBJECT_UNKNOWN; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 71 | D9/sinclair-recommendation-disclosure-asof/intent.json | rejected | rejected -> not applied | 0 / 0 / 11 / 0 | SUBJECT_CONFLICT; BKS_EVIDENCE_UNVERIFIED; subject REQUIRED_PROPERTY_MISSING | 0 / 1 |
| 72 | K/hubbard-2013-unstructured-to-entity/intent.json | partial | partial -> partial | 2 / 1 / 0 / 0 | HELD_BY_AUTHOR | 1 / 1 |
| 73 | K/resveratrol-identifier-crosswalk/intent.json | applicable | applicable -> applied | 8 / 0 / 0 / 2 | - | 0 / 0 |
| 74 | K/resveratrol-sirt1-evidence-mission/intent.json | rejected | rejected -> not applied | 0 / 5 / 1 / 0 | HELD_BY_AUTHOR; RETIRED_PREDICATE | 5 / 1 |
| 75 | K/retracted-sah-2017-stale-evidence/intent.json | rejected | rejected -> not applied | 0 / 2 / 9 / 0 | HELD_BY_AUTHOR; INVALID_ASSERTION; SUBJECT_CONFLICT; subject REQUIRED_PROPERTY_MISSING; subject SUBJECT_UNKNOWN | 2 / 2 |
| 76 | K/seller-claim-occurrences/intent.json | partial | rejected -> not applied | 1 / 2 / 1 / 0 | HELD_BY_AUTHOR; SUBJECT_CONFLICT; subject REQUIRED_PROPERTY_MISSING | 2 / 1 |
| 77 | K/two-run-lineage/intent-r2.json | rejected | rejected -> not applied | 0 / 1 / 1 / 0 | HELD_BY_AUTHOR; EPISODE_NOT_FOUND; subject REQUIRED_PROPERTY_MISSING | 1 / 2 |
| 78 | K/two-run-lineage/intent.json | rejected | rejected -> not applied | 0 / 2 / 0 / 0 | HELD_BY_AUTHOR; subject REQUIRED_PROPERTY_MISSING | 2 / 2 |
| 79 | cross-domain/claim-mission-report/intent-r2.json | partial | partial -> partial | 2 / 6 / 19 / 0 | SUBJECT_CONFLICT; HELD_BY_AUTHOR; SUBJECT_MISSING; subject REQUIRED_PROPERTY_MISSING; subject SUBJECT_UNKNOWN | 6 / 1 |
| 80 | cross-domain/claim-mission-report/intent.json | rejected | rejected -> not applied | 0 / 2 / 0 / 0 | HELD_BY_AUTHOR; subject SUBJECT_UNKNOWN | 2 / 1 |
| 81 | cross-domain/compound-profile/intent.json | partial | partial -> partial | 102 / 0 / 1 / 0 | PRIVATE_CONTACT_DATA | 0 / 1 |
| 82 | cross-domain/product-comparison/intent.json | partial | partial -> partial | 154 / 0 / 1 / 0 | BKS_SLOT_CONFLICT | 0 / 1 |

## 13. Follow-up (lead FU round): fixture round v2, release executorOps and DDL, v2.0.1, timeouts, S2 merge

Date 2026-10-11 (local). Release bound: **`biotech-schema-v2.0.1`** (`schemaReleaseDigest sha256:c0dd7837…`, `schemaDigest sha256:fe2cc50a…` unchanged, `ddlDigest sha256:3a42a440…`). Nothing committed or pushed. Aura not touched. No `.env` read.

### 13.1 SUBJECT_CONFLICT root cause (FU-03)

Not an intra-intent identity collision. Two causes:

1. **Fixture shape (dominant).** The release makes kind fields required (`Organization.entityKind` ×140, `Product.productKind/marketedName` ×31, `IngredientMaterial.materialKind` ×29, `Brand.brandKind` ×18, ...). The v1 fixtures never stated most of them. Every proposal that names such a subject (subject, object or asserter) was then refused with `SUBJECT_CONFLICT`. 108 further refusals were resolved subjects created by other fixtures (`SUBJECT_UNKNOWN` on an empty graph).
2. **Three planner strictness bugs** (fixed in `packages/kg-ops/src/write/compile.ts`):
   - A Source subject minting the uid of a declared `sources[]` entry collided with it (`DUPLICATE_WITHIN_INTENT`). It now reuses it (`SOURCE_DECLARED`).
   - A missing required property blocked a `new` subject with `onMatch: use_existing` even when it resolves to an existing node, where nothing is created. It is now deferred until resolution (`REQUIRED_PROPERTY_DEFERRED`). Identity inputs (`Source.canonicalUri`, Claim proposition) and invalid values still block.
   - Proposals targeting a resolved subject absent from the graph were rejected. They are now `held` (`SUBJECT_MISSING`), a dependency gap.

Also fixed in `migrate-v1.ts`: v1 literal bases map onto registered qualifiers (`massBasis` → `basis:`; `quantityBasis` → `amountBasis=` or `basis:` when the grammar accepts it). The old mapping produced the unregistered `massBasis:` and `basis:PER_DOSE`.

### 13.2 Fixture round v2 (`schema/program/final/fixtures-v2/`, originals untouched)

- Generator: `packages/kg-ops/src/write/fixture-round.ts` (`buildFixtureRound`, `loadFixtureRound`).
- Manifest: `ROUND.json` (`bks-fixture-round.v1`). It records the order, every edit with its provenance, before/after per intent, holds added and residual holds with gap class.
- 82 v2 intents: the 81 packet intents, plus the v1 example under `_examples/`.
- Reproducibility: the unit test rebuilds the round from the originals and requires byte-equal intents and equal totals; `BKS_UPDATE_ROUND=1` rewrites it.

Edits, all mechanical:

| Rule | Count | Source of the value |
| --- | --- | --- |
| `selector-basis` | 285 | `locators.yaml` `textBasis` (versioned projection id), a versioned `offsetBasis`, or an `offsetBasis` stated over the captured artifact itself (`raw-capture/v1`) |
| `required-property` | 88 | the fixture's own `assertions.yaml` node/entity record, or the record of the node it declares `sameAs`; enum-checked; nothing invented, no `UNSPECIFIED` chosen |
| `identifier-scheme` | 8 | `DOMAIN` → `WEB_DOMAIN`; `FDC_NUTRIENT_NUMBER` → `FDC_NUTRIENT` |
| `retired-predicate` | 7 | single registered replacement from `reports/predicate-registry-report.json`, with polarity NEGATIVE for DISCLAIMS_ENDORSEMENT |
| `source-order` | 1 | attia: a revised snapshot declared before its revision (order only) |
| `source-kind` | 1 | example: `MANUFACTURER_LABEL_PAGE` → `WEB_PAGE` for an http(s) page |
| `hold-added` | 670 | residual planner refusals turned into explicit holds: `FU-03 round v2 <CLASS>: <planner reason>` |

The 11 retired predicates without a single registered replacement (StudyResult remodels; `CLAIMS_THERAPEUTIC_EFFECT`, `HAS_OFF_TARGET_ACTIVITY` and `REDUCES_RISK_OF` per-occurrence choices; `QUALIFIES`) are held with the planner reason. Their `fixtureEdit` text stays in the report.

**Matrix totals (82 intents)**

| Run | Applicable | Partial | Rejected (all proposals held) | Admitted | Held | Rejected proposals |
| --- | --- | --- | --- | --- | --- | --- |
| Before (original fixtures migrated, offline, empty graph; current planner) | 1 | 40 | 41 | 638 | 215 | 759 |
| After: round v2 offline (round order, earlier effects seeded) | 2 | 50 | 30 | 710 | 902 | 0 |
| After: round v2, real Neo4j Community 5.26 (7696), applied in round order | 2 | 49 | 31 | 701 applied | 899 | 5 |
| After: round v2, real Neo4j Enterprise 5.26 with enterprise DDL (7697) | 2 | 49 | 31 | 701 applied | 899 | 5 |

There were zero apply failures in both real runs.

The 5 real-graph-only refusals are cross-fixture data conflicts the offline seed does not model:
- Two `BKS_IDENTITY_CONFLICT`: DSLD 323170 is already owned by `hu:label-version:tru-niagen-300mg-us-v12.3` (compound-profile, product-comparison).
- One `SUBJECT_CONFLICT`: `brand-tru-niagen` lacks `brandKind` (filing-channels-niagen-10k).
- Two more in compound-profile.

**The target "every intent applicable or partial" is not met.** 31 intents have every proposal held, which the planner reports as outcome `rejected`. Residual holds by class (offline round):

| Class | Holds | Meaning |
| --- | --- | --- |
| EVIDENCE_GAP | 534 | a value the release requires is not stated anywhere in the fixture |
| DEPENDENCY | 174 | a resolved subject that no fixture of the round creates |
| SEMANTIC | 194 | needs a fixture-owner remodel |

- **EVIDENCE_GAP**, by cause:
  - 217 `Organization.entityKind`.
  - 57 selector bases. The offsets are over an unversioned text projection (`*.txt`, pdftotext without a version, a JSON value at a pointer).
  - 40 `IngredientMaterial.materialKind`; 36 `Product.productKind/marketedName`; 20 `FoodItem.descriptionVerbatim/definingSystem`; 16 `Brand.brandKind`.
  - 26 `QUALIFIER_REQUIRED population`.
  - 12 `CALCULATED` without derivation inputs.
- **DEPENDENCY**, by cause:
  - 88 Organizations, for example `hu:org:fx-us-national-library-of-medicine` and the ctgov/isrctn registries.
  - Sources, Persons, Targets and Conditions named only as `externalNodes`.
- **SEMANTIC**, by cause:
  - 54 pre-existing v1 holds (claim occurrences without the claim, claimType missing, ...).
  - 29 unregistered free-text qualifiers (`*Verbatim:`).
  - 31 `PREDICATE_KIND_MISMATCH` (EVENT_OCCURRED, EVENT_ANNOUNCED, TAKES, ... are relationship predicates used as literals).
  - 17 `SUBJECT_REVIEW_REQUIRED` (onMatch review against a node another fixture created).
  - 5 two typed literals.
  - Asserter type Channel.

**Decision for the lead / schema authority.** `OrganizationEntityKind` has an `UNSPECIFIED` member and `MaterialKind` has `UNRESOLVED`. Allowing the round to state those designated "not stated" members (recorded as `explicit-unknown`, not as facts) would release about 260 of the evidence-gap holds. I did not do it, per "never invent a value".

The full per-proposal list is in `ROUND.json` (`rows[].residualHolds`). Evidence files:
- `runs/release-v2/s3/fixture-matrix.round-v2.offline.json`.
- `fixture-matrix.round-v2.community.json` (stamp `tmv4k2mpt`).
- `fixture-matrix.round-v2.enterprise.json` (stamp `tmv4ka524`).
- The pre-follow-up matrices are kept as `fixture-matrix*.before-fu03.json`.

#### Top residual gap reasons (normalized)

| Class | Reason (normalized) | Holds |
| --- | --- | --- |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: Organization.entityKind) | 217 |
| DEPENDENCY | SUBJECT_MISSING (SUBJECT_UNKNOWN: no Organization with uid <uid>) | 88 |
| EVIDENCE_GAP | BKS_EVIDENCE_UNVERIFIED: locator <ref> is invalid (selector.basis (projection id@version) is mandatory (R-38)) | 57 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: IngredientMaterial.materialKind) | 40 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: Product.productKind, marketedName) | 36 |
| SEMANTIC | INVALID_ASSERTION: QUALIFIER_UNREGISTERED: "…" has no registered prefix in vocabularies/qualifiers.yaml (the executor refuses unregistered prefixes) | 29 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: FoodItem.descriptionVerbatim, definingSystem) | 20 |
| SEMANTIC | SUBJECT_REVIEW_REQUIRED (MATCH_REVIEW: <uid> set onMatch use_existing, create_anyway or fail) | 17 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: Brand.brandKind) | 16 |
| SEMANTIC | FU-03 v1 semantics not mechanically mappable: assertionKind CLAIM stated without the claim it is an occurrence of (OCCURRENCE_OF target) | 14 |
| SEMANTIC | PREDICATE_KIND_MISMATCH: EVENT_OCCURRED is a relationship predicate; this proposal kind needs literal | 13 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: LabelVersion.panelKind, contentDigest, compositionDigest) | 13 |
| EVIDENCE_GAP | INVALID_ASSERTION: basisKind CALCULATED needs derivation.rule and derivation.from inputs | 12 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: FoodCategory.system, code) | 12 |
| EVIDENCE_GAP | QUALIFIER_REQUIRED: USE_CONSTRAINED_IN requires qualifier(s) population | 12 |
| DEPENDENCY | SUBJECT_MISSING (SUBJECT_UNKNOWN: no Source with uid <uid>) | 11 |
| DEPENDENCY | SUBJECT_MISSING (SUBJECT_UNKNOWN: no Person with uid <uid>) | 11 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: StudyArm.armKey) | 10 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: Study.studyKind) | 10 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: DecisionCriterion.criterionKey, version, criteriaSetKey, criteriaSetVersion, criterionKind, direction, de | 9 |
| EVIDENCE_GAP | INVALID_ASSERTION: QUALIFIER_UNREGISTERED: "…" has no registered prefix in vocabularies/qualifiers.yaml (the executor refuses unregistered prefixes);  | 9 |
| SEMANTIC | FU-03 v1 semantics not mechanically mappable: claim occurrence of <uid> names no claimType (required for assertionKind CLAIM) | 9 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: Constituent.constituentKind) | 8 |
| DEPENDENCY | SUBJECT_MISSING (SUBJECT_UNKNOWN: no Target with uid <uid>) | 8 |
| EVIDENCE_GAP | QUALIFIER_REQUIRED: CAUSES_ADVERSE_EFFECT requires qualifier(s) population | 7 |
| EVIDENCE_GAP | QUALIFIER_REQUIRED: HAS_UPPER_LIMIT requires qualifier(s) population | 7 |
| DEPENDENCY | SUBJECT_MISSING (SUBJECT_UNKNOWN: no Condition with uid <uid>) | 7 |
| SEMANTIC | PREDICATE_KIND_MISMATCH: EVENT_ANNOUNCED is a relationship predicate; this proposal kind needs literal | 6 |
| DEPENDENCY | SUBJECT_MISSING (SUBJECT_UNKNOWN: no Frontier with uid <uid>) | 6 |
| DEPENDENCY | SUBJECT_MISSING (SUBJECT_UNKNOWN: no IngredientMaterial with uid <uid>) | 6 |
| SEMANTIC | SUBJECT_REVIEW_REQUIRED (NAME_MATCH_REVIEW: <uid> share the exact name (names never establish identity); set onMatch) | 6 |
| SEMANTIC | LITERAL_VALUE_INVALID: exactly one typed literal (got valueString, valueNumber) | 5 |
| EVIDENCE_GAP | QUALIFIER_REQUIRED: INTERACTS_WITH requires qualifier(s) population | 5 |
| SEMANTIC | PREDICATE_KIND_MISMATCH: TAKES is a relationship predicate; this proposal kind needs literal | 5 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: Source.canonicalUri) | 5 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: Product.marketedName) | 4 |
| DEPENDENCY | SUBJECT_MISSING (SUBJECT_UNKNOWN: no Metric with uid <uid>) | 4 |
| SEMANTIC | FU-03 v1 semantics not mechanically mappable: 10-K for fiscal year ended 2025-12-31, filed 2026-03-04 (statedAsOf = filing date, PUBLICATION_PROXY rea | 4 |
| SEMANTIC | ASSERTER_TYPE_INVALID: Channel <uid> has channelKind BLOG_OR_SITE; only ACCOUNT channels assert (P20) | 4 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: StudyResult.resultKind, analysisKind, comparisonKind, statisticalConclusion) | 4 |
| SEMANTIC | RETIRED_PREDICATE: SERUM_NAD_CONCENTRATION is retired; use D3 StudyResult record | 4 |
| DEPENDENCY | DEPENDS_ON_REJECTED: p-a-administers | 3 |
| SEMANTIC | PREDICATE_KIND_MISMATCH: IMPROVES_TARGET is a relationship predicate; this proposal kind needs literal | 3 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: LabelVersion.compositionDigest) | 3 |
| DEPENDENCY | SUBJECT_MISSING (SUBJECT_UNKNOWN: no ChemicalSubstance with uid <uid>) | 3 |
| (other) | 88 further normalized reasons | 120 |

#### Per-intent before / after (offline; a = admitted, h = held, r = rejected; residual E/D/S = evidence-gap / dependency / semantic)

| # | Intent (fixtures-v2 path) | Before (original, empty graph) | After (round, seeded order) | Edits | Holds added | Residual holds E/D/S |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | D10/fda-qhc-magnesium-disconfirmation/intent.json | rejected 0a/0h/12r | rejected 0a/12h/0r | 2 | 12 | 11/0/1 |
| 2 | D10/livertox-green-tea-extract-harm/intent.json | rejected 0a/0h/8r | rejected 0a/8h/0r | 0 | 8 | 8/0/0 |
| 3 | D10/mg-bisglycinate-rct-unstructured/intent.json | rejected 0a/0h/11r | rejected 0a/11h/0r | 2 | 11 | 7/4/0 |
| 4 | D10/mg-rankings-criteria-comparison/intent.json | rejected 0a/0h/39r | rejected 0a/39h/0r | 22 | 39 | 23/15/1 |
| 5 | D10/opentargets-association-signal/intent.json | rejected 0a/0h/10r | rejected 0a/10h/0r | 0 | 10 | 7/0/3 |
| 6 | D11/capture-failures-coverage/intent.json | rejected 0a/0h/1r | rejected 0a/1h/0r | 0 | 1 | 1/0/0 |
| 7 | D11/nr-chloride-gsrs-identifier-bridge/intent.json | partial 9a/0h/1r | partial 9a/1h/0r | 0 | 1 | 1/0/0 |
| 8 | D11/resveratrol-retraction-integrity/intent.json | partial 2a/1h/4r | partial 2a/5h/0r | 4 | 4 | 3/1/1 |
| 9 | D11/sirolimus-spl-boxed-warning/intent.json | rejected 0a/0h/6r | rejected 0a/6h/0r | 1 | 6 | 6/0/0 |
| 10 | D12/acrylamide-fried-potato-harm/intent.json | rejected 0a/2h/5r | partial 1a/6h/0r | 13 | 4 | 3/2/1 |
| 11 | D12/mcdonalds-fries-prepared-food/intent.json | rejected 0a/2h/10r | rejected 0a/12h/0r | 9 | 10 | 10/0/2 |
| 12 | D12/olive-oil-polyphenols-preparation/intent.json | rejected 0a/4h/2r | rejected 0a/6h/0r | 10 | 2 | 2/4/0 |
| 13 | D12/predimed-retraction-disconfirmation/intent.json | rejected 0a/3h/8r | rejected 0a/11h/0r | 2 | 8 | 3/0/8 |
| 14 | D12/upf-diet-rct-unstructured/intent.json | partial 2a/3h/5r | partial 2a/8h/0r | 2 | 5 | 3/0/5 |
| 15 | D13/bioage-strides-discontinuation/intent.json | rejected 0a/7h/4r | rejected 0a/11h/0r | 0 | 4 | 0/5/6 |
| 16 | D13/lesne-2006-retraction/intent.json | rejected 0a/6h/1r | rejected 0a/7h/0r | 0 | 1 | 0/6/1 |
| 17 | D13/madrigal-maestro-nash-topline-8k/intent.json | rejected 0a/6h/3r | rejected 0a/9h/0r | 0 | 3 | 0/2/7 |
| 18 | D13/madrigal-financing-after-readout/intent.json | rejected 0a/9h/4r | rejected 0a/13h/0r | 0 | 4 | 0/1/12 |
| 19 | D13/madrigal-pdufa-to-accelerated-approval/intent.json | rejected 0a/14h/8r | rejected 0a/22h/0r | 0 | 10 | 0/12/10 |
| 20 | D1/ashwagandha-plant-part-harm/intent.json | partial 2a/0h/9r | partial 2a/9h/0r | 0 | 9 | 9/0/0 |
| 21 | D1/lgg-strain-resolution/intent.json | partial 3a/0h/9r | partial 3a/9h/0r | 2 | 9 | 9/0/0 |
| 22 | D1/nr-trial-unstructured/intent.json | partial 5a/0h/4r | partial 7a/2h/0r | 1 | 2 | 2/0/0 |
| 23 | D1/vitamin-b6-threshold-harm/intent.json | rejected 0a/0h/15r | rejected 0a/15h/0r | 0 | 15 | 15/0/0 |
| 24 | D2/dq-senescence-biomarker-path/intent.json | partial 9a/0h/4r | partial 9a/4h/0r | 0 | 4 | 4/0/0 |
| 25 | D2/metformin-exercise-harm/intent.json | partial 1a/0h/6r | partial 1a/6h/0r | 0 | 6 | 6/0/0 |
| 26 | D2/nr-muscle-unstructured/intent.json | partial 2a/0h/4r | partial 2a/4h/0r | 0 | 4 | 4/0/0 |
| 27 | D2/reactome-chembl-reference/intent.json | partial 3a/0h/10r | partial 3a/10h/0r | 0 | 10 | 10/0/0 |
| 28 | D2/sirt1-activation-disconfirmation/intent.json | partial 4a/0h/1r | partial 4a/1h/0r | 0 | 1 | 1/0/0 |
| 29 | D3/aspree-registry-history-harm/intent.json | partial 70a/47h/2r | partial 70a/49h/0r | 0 | 2 | 2/47/0 |
| 30 | D3/dq-bone-trial-unstructured/intent.json | partial 81a/36h/3r | partial 80a/40h/0r | 0 | 3 | 2/35/3 |
| 31 | D3/resveratrol-retraction/intent.json | partial 5a/18h/1r | partial 5a/19h/0r | 0 | 1 | 1/18/0 |
| 32 | D4/consumer-panel-and-blood-clock/intent.json | partial 10a/0h/18r | partial 10a/18h/0r | 26 | 18 | 18/0/0 |
| 33 | D4/dunedinpace-paper-unstructured/intent.json | partial 2a/0h/4r | partial 2a/4h/0r | 0 | 4 | 3/0/1 |
| 34 | D4/clock-noise-vs-retest-advice/intent.json | rejected 0a/1h/6r | rejected 0a/7h/0r | 6 | 7 | 5/0/2 |
| 35 | D4/hba1c-two-labs-interference/intent.json | partial 12a/0h/9r | partial 13a/8h/0r | 24 | 8 | 8/0/0 |
| 36 | D4/noninvasive-glucose-cgm-recall/intent.json | partial 1a/0h/8r | partial 1a/8h/0r | 6 | 8 | 8/0/0 |
| 37 | D4/nr-nad-compound-to-test/intent.json | partial 6a/0h/8r | partial 7a/7h/0r | 11 | 7 | 7/0/0 |
| 38 | D4/wearable-hrv-algorithm-changes/intent.json | partial 5a/0h/6r | partial 6a/5h/0r | 11 | 5 | 5/0/0 |
| 39 | D5/antioxidant-exercise-disconfirmation/intent.json | rejected 0a/8h/2r | rejected 0a/10h/0r | 4 | 2 | 2/7/1 |
| 40 | D5/pregnancy-magnesium-upper-limit/intent.json | partial 48a/0h/41r | partial 50a/39h/0r | 52 | 39 | 39/0/0 |
| 41 | D5/sirolimus-label-interactions-harm/intent.json | rejected 0a/0h/11r | rejected 0a/11h/0r | 7 | 11 | 11/0/0 |
| 42 | D5/sleep-toolkit-unstructured/intent.json | partial 34a/2h/12r | partial 35a/13h/0r | 26 | 11 | 11/1/1 |
| 43 | D6/prepared-food-bigmac-mcdonalds/intent.json | partial 2a/0h/24r | partial 2a/24h/0r | 0 | 24 | 18/0/6 |
| 44 | D6/proprietary-blend-ag1/intent.json | partial 7a/0h/13r | partial 7a/13h/0r | 0 | 13 | 13/0/0 |
| 45 | D6/recall-moringa-mogo/intent.json | partial 7a/1h/21r | partial 7a/22h/0r | 0 | 21 | 16/0/6 |
| 46 | D7/attia-cgm-dexcom-recommendation-interest/intent.json | rejected 0a/1h/5r err | rejected 0a/6h/0r | 9 | 5 | 4/0/2 |
| 47 | D7/bioage-group-vehicles-stale-role/intent.json | rejected 0a/0h/8r | rejected 0a/8h/0r | 0 | 8 | 8/0/0 |
| 48 | D7/elysium-paper-funding-award/intent.json | rejected 0a/0h/14r | partial 9a/5h/0r | 20 | 5 | 0/0/5 |
| 49 | D7/ftc-ameribev-paid-dieticians-harm/intent.json | rejected 0a/0h/4r | applicable 4a/0h/0r | 12 | 0 | 0/0/0 |
| 50 | D7/niagen-ownership-brand-history/intent.json | rejected 0a/0h/20r | partial 3a/17h/0r | 6 | 17 | 15/0/2 |
| 51 | D11/nr-trial-jats-unstructured/intent.json | partial 5a/1h/9r | partial 6a/9h/0r | 0 | 8 | 7/1/1 |
| 52 | D1/nr-salt-moiety-us-canada/intent.json | partial 1a/0h/12r | rejected 0a/13h/0r | 0 | 8 | 8/0/5 |
| 53 | D6/label-versions-truniagen-dsld/intent.json | partial 11a/0h/19r | partial 11a/19h/0r | 0 | 19 | 17/0/2 |
| 54 | D6/filing-channels-niagen-10k/intent.json | rejected 0a/4h/5r | partial 3a/6h/0r | 0 | 2 | 0/0/6 |
| 55 | D6/offer-roles-price-kinds-truniagen/intent.json | partial 10a/0h/33r | partial 18a/25h/0r | 0 | 25 | 18/0/7 |
| 56 | D6/retailer-reformulation-claim-iherb/intent.json | partial 2a/0h/14r | partial 2a/14h/0r | 0 | 14 | 12/0/2 |
| 57 | D7/sinclair-self-disclosure-unstructured/intent.json | rejected 0a/0h/12r | partial 11a/1h/0r | 13 | 1 | 0/0/1 |
| 58 | D8/certification-listing-lot-scope/intent.json | rejected 0a/0h/24r | partial 8a/16h/0r | 14 | 16 | 15/0/1 |
| 59 | D8/eu-nrcl-authorisation-data-protection/intent.json | rejected 0a/0h/11r | partial 3a/8h/0r | 10 | 8 | 8/0/0 |
| 60 | D8/eurofins-coa-quantity-by-input/intent.json | rejected 0a/0h/22r | partial 7a/15h/0r | 12 | 15 | 15/0/0 |
| 61 | D8/imu-tek-warning-letter-recall/intent.json | rejected 0a/2h/18r | partial 3a/17h/0r | 9 | 15 | 15/0/2 |
| 62 | D8/nmn-us-exclusion-reversal/intent-step2.json | rejected 0a/0h/16r | partial 4a/12h/0r | 14 | 12 | 10/0/2 |
| 63 | D8/nmn-us-exclusion-reversal/intent.json | rejected 0a/1h/10r | rejected 0a/11h/0r | 7 | 0 | 0/0/11 |
| 64 | D8/us8197807-claims-held-invalid/intent.json | rejected 0a/0h/18r | partial 3a/15h/0r | 11 | 15 | 12/0/3 |
| 65 | D9/hl-essentials-recut-nmncom-retelling/intent.json | partial 2a/2h/12r | partial 2a/14h/0r | 0 | 12 | 5/2/7 |
| 66 | D9/hl52-transcript-nmn-practice/intent.json | partial 1a/2h/18r | partial 1a/20h/0r | 0 | 19 | 14/1/5 |
| 67 | D9/lifespan-ep4-spermidine-correction/intent.json | partial 2a/1h/9r | partial 2a/10h/0r | 0 | 9 | 6/1/3 |
| 68 | D9/longecity-nmn-fatigue-pseudonymous/intent.json | partial 1a/1h/4r | partial 1a/5h/0r | 0 | 2 | 1/1/3 |
| 69 | D9/rapa-ex-01-attia-retelling/intent.json | partial 2a/1h/8r | partial 2a/9h/0r | 0 | 8 | 5/1/3 |
| 70 | D9/sinclair-recommendation-disclosure-asof/intent.json | rejected 0a/0h/11r | rejected 0a/11h/0r | 0 | 11 | 11/0/0 |
| 71 | K/hubbard-2013-unstructured-to-entity/intent.json | partial 2a/1h/0r | partial 2a/1h/0r | 0 | 0 | 0/0/1 |
| 72 | K/resveratrol-identifier-crosswalk/intent.json | applicable 8a/0h/0r | applicable 8a/0h/0r | 0 | 0 | 0/0/0 |
| 73 | K/resveratrol-sirt1-evidence-mission/intent.json | rejected 0a/5h/1r | rejected 0a/6h/0r | 0 | 1 | 0/0/6 |
| 74 | K/retracted-sah-2017-stale-evidence/intent.json | rejected 0a/2h/9r | rejected 0a/11h/0r | 0 | 9 | 7/0/4 |
| 75 | K/seller-claim-occurrences/intent.json | partial 1a/2h/1r | partial 1a/3h/0r | 0 | 1 | 1/0/2 |
| 76 | K/two-run-lineage/intent-r2.json | rejected 0a/1h/1r | rejected 0a/2h/0r | 0 | 1 | 0/0/2 |
| 77 | K/two-run-lineage/intent.json | rejected 0a/2h/0r | rejected 0a/2h/0r | 0 | 0 | 0/0/2 |
| 78 | cross-domain/claim-mission-report/intent-r2.json | partial 2a/14h/11r | partial 4a/23h/0r | 8 | 10 | 1/7/15 |
| 79 | cross-domain/claim-mission-report/intent.json | rejected 0a/2h/0r | rejected 0a/2h/0r | 0 | 0 | 0/0/2 |
| 80 | cross-domain/compound-profile/intent.json | partial 102a/0h/1r | partial 98a/5h/0r | 0 | 1 | 0/0/5 |
| 81 | cross-domain/product-comparison/intent.json | partial 154a/0h/1r | partial 154a/1h/0r | 0 | 1 | 0/0/1 |
| 82 | _examples/ingestion-intent.example.json | rejected 0a/0h/5r err | rejected 0a/5h/0r | 2 | 5 | 2/0/3 |

### 13.3 Executor operations from the release; DDL authority (v2.0.1)

- **Executor operations.** `WriteSchema` takes node-type operations from the release (`ReleaseInputs.executorOps` = `params.executorOps` = IR `NodeType.executorOps`). `ExecutorOp` adds `delete` and `delete-unreferenced`; intents never issue them. The register-text derivation remains a cross-check only. Disagreements are logged once per release and kept in `WriteSchema.executorOpsDisagreements`. For v2.0.1 there are three, and the release wins:
  - Association: `close+create+delete-unreferenced` vs a projection-only derivation.
  - Chunk: `create+delete` vs projection-only. Both stay projection-only for intents.
  - QualityResult: `create+update` vs `create`. QualityResult is now updatable.
- **RegistrationVersion FIELD evidence.** S1's release has no field predicates for RegistrationVersion: `fieldPredicate()` finds none, and executorOps is `create` only. The explicit block stays.
- **DDL.** The `operationalDdl()` statement list is removed from `fence.ts`.
  - `ensureOperationalState(client, schema?, {enterprise?, ddl?})` applies `loadRelease().ddl.required`, plus `.enterprise` (edition auto-detected via `dbms.components()`), then the `ddl.json` bootstrap (both fences).
  - It verifies that every writer-required name (`writerDdlNames`) is present as the kind the release defines. This catches a same-named rule of another kind, such as the old `CREATE INDEX claim_proposition_hash`.
  - `operationalDdlDrift(ddl, schema)` is empty for v2.0.1.
  - `bks kg ensure-operations [--enterprise|--community]` uses the same path. `loadOperationsCypher` (schema/pinned/operations.cypher) is no longer used by the CLI.
- **Release marker.** `installReleaseMarker` now records the release `ddlDigest` by default, because the Enterprise DDL requires `KsReleaseMarker.ddlDigest`. That failure was found by the Enterprise run and fixed.
- **v2.0.1 override.** A unit test serves `../biotech-meta/docs/schema/releases/biotech-schema-v2.0.1` through `loadPinnedRelease({dir})` → `loadRelease({dir})` (source `override`). It plans the v2 example `applicable` with release executorOps and zero DDL drift.
- **Re-pin effects.**
  - The example intents are re-pinned to `c0dd7837…`.
  - The plan golden (`packages/contracts/golden/intent-digest.v2.json`) was regenerated; only the release digest changed.

### 13.4 Integration timeouts (lead note)

- **Cause of the lead's (b) timeout.** Vitest does not cancel a timed-out test body. The aborted matrix kept planning and applying through the shared driver while later tests ran, so the `cypher baseline` read waited behind it on a loaded machine.
- **Fix.** The round matrix has an explicit budget (900 s, test timeout 960 s) and stops itself 30 s before it, reporting `truncated`. It no longer outlives its test. On my containers it took 108 s (Community) and 152 s (Enterprise).
- **Transactions and isolation.**
  - Apply and stable-revision reads already release their transaction in `catch` / `finally`, and the fence lock lives only inside the apply transaction, which is bounded by the plan budget timeout.
  - Each test uses its own stamp-prefixed effect keys. Matrix effect keys now include the round index.
- **First rerun at 20:44.** It hit a Docker Desktop engine stall: transactions were terminated, then connection acquisition timed out, and the containers restarted. It was not a code failure; the containers were recreated and the suite rerun.

### 13.5 S2 workspace merge (lead item)

- **Contracts.**
  - `packages/contracts/src/workspace.ts` keeps the v1 shapes for decoding. It adds the v2 shapes taken from `@bks/schema-workspace` `schema-contracts.ts`: `WorkspaceManifestV2`, `CardRecord`, `CardKind`, `CARD_ID_PREFIX`, `LOOKUP_KINDS`, `FileEntry`, `SliceRequestV2`, `SchemaContext`, and the format constants.
  - `CONTRACT_VERSIONS.workspace` is now `bks-schema-workspace.v2`. It also gains `schemaContext`, `schemaCard` and `schemaSlice`. `LEGACY_CONTRACT_VERSIONS.workspace` is `v1`.
  - New JSON Schemas: `bks-schema-workspace-manifest.v2`, `bks-schema-card.v1`, `bks-schema-slice-request.v2` and `biotech-schema-context.v1` (25 files).
- **schema-workspace imports.** The switch to the contracts shapes is not a one-line change: `schema-contracts.ts` is a 230-line module consumed by several files of the schema role. It stays the local source. `apps/executor/src/schema.test.ts` proves parity: JSON Schema of each shape, the version strings and `CARD_ID_PREFIX`.
- **Executor HTTP routes** (`apps/executor/src/modules/schema.ts`):
  - `/schema/manifest` returns no inventory, with `inventoryCount` instead.
  - `/schema/search` takes `q`, `mode`, `kind`, `module`, `domain` and `limit`, and returns `status` / `degradation`.
  - `/schema/find`, `/schema/neighbors/:id`, `/schema/path`, `/schema/pattern`, `/schema/doctor` and `POST /schema/context`.
  - `/schema/page/:id` with `section` / `field`.
  - `POST /schema/slice` takes `SliceRequestV2`; a v1 request is still accepted.
- **MCP tools.** `schema_manifest|search|find|neighbors|path|pattern|doctor|context|get|slice` mirror the routes. The `schema_search` description now says to search first and then follow cards / neighbors / paths, and it states the modes served. The cited "never list the tree" text was not present in `mcp.ts` at merge time.
- **Errors.** `WorkspaceError` `RELEASE_MISMATCH` → `BKS_RELEASE_MISMATCH` (409, with `workspaceCode`). `PAGE_NOT_FOUND` / `SECTION_NOT_FOUND` → 404. `LIMIT_EXCEEDED` / `PAGE_PATH_INVALID` → 400. Neighbor/Path `UNKNOWN_*` → 404 and other neighbor/path/slice errors → 400.
- **`/describe`.** `schema.search.modes` is `["lexical"]` unless the workspace manifest `semantic.status` is `available` or a semantic retriever is bound (`semanticFromEnv`); then it is lexical, semantic and hybrid. It also adds `schema.find|neighbors|path|pattern|doctor|context`.
- **Tests.** `apps/executor/src/schema.test.ts` runs against the generated `workspace/` (fingerprint `sha256:1e38ee06…`). It covers the manifest without inventory, the modes, lexical / hybrid-degraded / semantic-unavailable search, the limit error, find, neighbors (plus 404), path, pattern (plus 400), doctor, `SchemaContext` parse, page, and slice v1, v2 and an invalid v2.

### 13.6 Documentation

- `.env.example`: S3 variables appended (names and comments only, no values).
- `INTERFACES.md`: section 10 "Revision v2 (S3)" appended. It contains:
  - 10.1: the section-10 deltas of this report, verbatim.
  - 10.2: the follow-up deltas (DDL authority, executorOps, override, planner, fixture round).
  - 10.3: the reads-role interface, verbatim: `withStableRevision`, `readFence`, `SnapshotCustody.put`, `canonicalDigest` / `rawBytesDigest`, and the `modules/read.ts` drop-in.
- No other section was edited.

### 13.7 Results of this follow-up

| Check | Result |
| --- | --- |
| `pnpm build` | pass |
| contracts unit | 62/62 |
| executor unit | 6/6 (adds schema v2 routes and contract parity) |
| kg-ops unit (S3 files) | 25 pass (adds round reproducibility and the v2.0.1 override). The kg-ops project run also loads S4's `src/read/read.integration.test.ts`, which currently fails to transform (S4-owned, in progress; not an S3 file) |
| Python client | 66/66 (`uv run pytest`) |
| Gate B, Community 5.26 (`bks-neo4j-s3`, bolt 7696, fresh container, release DDL required) | 21 passed, 1 skipped (EE block without EE URI), 260 s, stamp `tmv4k2mpt`. Includes the round matrix: 2 applicable / 49 partial / 31 all-held, 701 proposals applied, 0 apply failures, 108 s |
| Gate B, Enterprise reader authority (`bks-neo4j-s3-ee`, bolt 7697, release DDL required + enterprise) | 1/1 after the `ddlDigest` fix (the first run failed at the marker existence constraint) |
| Gate B full suite against Enterprise with enterprise DDL (7697) | 21 passed, 1 skipped, stamp `tmv4ka524`. The writer satisfies all 569 required + enterprise rules; matrix identical to Community, 152 s |

### 13.8 Lead decision applied: schema unknown markers (OD-24 / OD-25)

Rule as implemented (`fixture-round.ts`, edit class `schema-unknown-marker`):
- **When it applies.** A missing **required kind / discriminator field** takes the enum's explicit unknown member when all of these hold:
  - the field name ends in `Kind`, `Family` or `Type`, and the field is a scalar enum;
  - the enum has an explicit unknown member. The members checked are `UNSPECIFIED`, `UNRESOLVED`, `UNKNOWN`, `NOT_REPORTED` and `NOT_STATED`, in that order;
  - the fixture's own records yield no value.
- **Never used** for `OTHER`, `NOT_APPLICABLE`, numbers, dates, identifiers or relationships. A `NOT_REPORTED` fill of `StudyResult.statisticalConclusion` was excluded because that field is a finding, not a discriminator.
- **Recorded** with the note "not stated by the fixture source; <Enum>.<member> is the release's explicit unknown member (OD-24 / OD-25), not a sourced fact", in three places:
  - `ROUND.json`;
  - the intent's `provenance.edits` (rule `schema-unknown-marker`);
  - `notReportedFields` where the node type has that field (only D5 `ProtocolStep`).
  A unit test checks that ROUND.json and the intent provenance agree.
- **Applied.** 168 fills: 141 `Organization.entityKind = UNSPECIFIED` and 27 `IngredientMaterial.materialKind = UNRESOLVED`. `ProductKind`, `BrandKind`, `FoodDataSystem`, `PanelKind` and `AgentKind` have no unknown member, so those subjects stay evidence gaps.
- **Hold stability.** Every proposal the offline planner does not admit is now an explicit hold. This covers rejections, dependency holds, review-required subjects and held dependencies, and each hold carries the planner reason and a gap class.
  - In addition, each intent is planned with its unresolved resolved subjects presumed present, so a deeper gap behind a dependency is held as well.
  - As a result, the admitted set no longer depends on which graph the round runs against.
  - The lead's 7700 run of the marker round, taken before this change (`fixture-matrix.round-v2.lead-7700.json`), had 22 real-graph refusals. 18 of them were gaps behind a planner hold: selector bases, a population qualifier and a predicate-kind mismatch. My Community rerun after the change has 4.

**Limitation.** The intent `provenance` block lives in plan/receipt custody and is not written to graph nodes. A graph reader therefore cannot tell a marker value from a sourced one, except on types with `notReportedFields`. If reads need that, the schema authority would add a generic not-reported field on Subjectable types; the executor would then write it.

**New matrix totals (82 intents).** These use the additive plan outcome `held` (section 13.10).

| Run | Applicable | Partial | Held (all proposals held) | Rejected plans | Admitted | Held | Rejected proposals |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Before (original fixtures migrated, offline, empty graph) | 1 | 40 | 2 | 39 | 638 | 215 | 759 |
| Round v2 without markers (offline) | 2 | 50 | 30* | 0 | 710 | 902 | 0 |
| **Round v2 with markers (offline, round order, seeded)** | **5** | **59** | **18** | **0** | **907** | **704** | **0** |
| **Real Neo4j Community 5.26** (`bks-neo4j-s3`, fresh, 7696; stamp `tmv4of5i7`) | **5** | **58** | **19** | **0** | **896 applied** | **704** | **4** |
| Real Neo4j Enterprise 5.26 with enterprise DDL (`bks-neo4j-s3-ee`, fresh, 7697; stamp `tmv4okc51`) | 5 | 58 | 19 | 0 | 896 applied | 704 | 4 (same four) |

\* reported as `rejected` before the `held` outcome existed.

The 4 real-graph-only refusals are cross-fixture data conflicts that offline planning cannot see:
- `brand-tru-niagen` in two D6 intents. Offline, the subject resolves to a Brand seeded from an earlier intent's planned create. On the real graph no node matches its identity, so the missing `brandKind` blocks the create, which is an evidence gap.
- DSLD 323170 is claimed by two label versions (compound-profile, product-comparison).

There were 0 apply failures. Evidence: `runs/release-v2/s3/fixture-matrix.round-v2.community.json` (copy of `fixture-matrix-tmv4of5i7.json`).

Residual holds (offline, with markers):

| Class | Holds |
| --- | --- |
| EVIDENCE_GAP | 367 |
| DEPENDENCY | 80 |
| SEMANTIC | 257 |

Edits: selector-basis 285, schema-unknown-marker 168, required-property 88, identifier-scheme 8, retired-predicate 7, source-order 1, source-kind 1, hold-added 650 (every non-admitted proposal is now an explicit hold).

#### Top residual gap reasons (with markers)

| Class | Reason (normalized) | Holds |
| --- | --- | --- |
| EVIDENCE_GAP | BKS_EVIDENCE_UNVERIFIED: locator <ref> is invalid (selector.basis (projection id@version) is mandatory (R-38)) | 133 |
| SEMANTIC | INVALID_ASSERTION: QUALIFIER_UNREGISTERED: "…" has no registered prefix in vocabularies/qualifiers.yaml (the executor refuses unregistered prefixes) | 65 |
| DEPENDENCY | SUBJECT_MISSING (SUBJECT_UNKNOWN: no Organization with uid <uid>) | 45 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: Product.productKind, marketedName) | 37 |
| SEMANTIC | SUBJECT_REVIEW_REQUIRED (MATCH_REVIEW: <uid> set onMatch use_existing, create_anyway or fail) | 30 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: FoodItem.descriptionVerbatim, definingSystem) | 20 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: Brand.brandKind) | 16 |
| EVIDENCE_GAP | QUALIFIER_REQUIRED: USE_CONSTRAINED_IN requires qualifier(s) population | 15 |
| SEMANTIC | FU-03 v1 semantics not mechanically mappable: assertionKind CLAIM stated without the claim it is an occurrence of (OCCURRENCE_OF target) | 14 |
| SEMANTIC | PREDICATE_KIND_MISMATCH: EVENT_OCCURRED is a relationship predicate; this proposal kind needs literal | 13 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: LabelVersion.panelKind, contentDigest, compositionDigest) | 13 |
| EVIDENCE_GAP | INVALID_ASSERTION: basisKind CALCULATED needs derivation.rule and derivation.from inputs | 12 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: FoodCategory.system, code) | 12 |
| SEMANTIC | SUBJECT_REVIEW_REQUIRED (NAME_MATCH_REVIEW: <uid> share the exact name (names never establish identity); set onMatch) | 11 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: StudyArm.armKey) | 10 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: Study.studyKind) | 10 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: DecisionCriterion.criterionKey, version, criteriaSetKey, criteriaSetVersion, criterionKind, direction, de | 9 |
| EVIDENCE_GAP | INVALID_ASSERTION: QUALIFIER_UNREGISTERED: "…" has no registered prefix in vocabularies/qualifiers.yaml (the executor refuses unregistered prefixes);  | 9 |
| SEMANTIC | FU-03 v1 semantics not mechanically mappable: claim occurrence of <uid> names no claimType (required for assertionKind CLAIM) | 9 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: Constituent.constituentKind) | 8 |
| EVIDENCE_GAP | QUALIFIER_REQUIRED: CAUSES_ADVERSE_EFFECT requires qualifier(s) population | 7 |
| EVIDENCE_GAP | QUALIFIER_REQUIRED: HAS_UPPER_LIMIT requires qualifier(s) population | 7 |
| SEMANTIC | INVALID_ASSERTION: QUALIFIER_UNREGISTERED: "…" has no registered prefix in vocabularies/qualifiers.yaml (the executor refuses unregistered prefixes);  | 6 |
| SEMANTIC | PREDICATE_KIND_MISMATCH: EVENT_ANNOUNCED is a relationship predicate; this proposal kind needs literal | 6 |
| EVIDENCE_GAP | QUALIFIER_REQUIRED: INTERACTS_WITH requires qualifier(s) population | 6 |
| SEMANTIC | LITERAL_VALUE_INVALID: exactly one typed literal (got valueString, valueNumber) | 5 |
| SEMANTIC | PREDICATE_KIND_MISMATCH: TAKES is a relationship predicate; this proposal kind needs literal | 5 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: Source.canonicalUri) | 5 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: Product.marketedName) | 4 |
| SEMANTIC | FU-03 v1 semantics not mechanically mappable: 10-K for fiscal year ended 2025-12-31, filed 2026-03-04 (statedAsOf = filing date, PUBLICATION_PROXY rea | 4 |
| SEMANTIC | ASSERTER_TYPE_INVALID: Channel <uid> has channelKind BLOG_OR_SITE; only ACCOUNT channels assert (P20) | 4 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: StudyResult.resultKind, analysisKind, comparisonKind, statisticalConclusion) | 4 |
| SEMANTIC | RETIRED_PREDICATE: SERUM_NAD_CONCENTRATION is retired; use D3 StudyResult record | 4 |
| DEPENDENCY | DEPENDS_ON_REJECTED: p-a-administers | 3 |
| SEMANTIC | PREDICATE_KIND_MISMATCH: DISCLOSES_INTEREST is a relationship predicate; this proposal kind needs literal | 3 |
| SEMANTIC | PREDICATE_KIND_MISMATCH: REPORTS_REPORT_COUNT is a relationship predicate; this proposal kind needs literal | 3 |
| SEMANTIC | PREDICATE_KIND_MISMATCH: IMPROVES_TARGET is a relationship predicate; this proposal kind needs literal | 3 |
| EVIDENCE_GAP | SUBJECT_CONFLICT (REQUIRED_PROPERTY_MISSING: LabelVersion.compositionDigest) | 3 |
| DEPENDENCY | SUBJECT_MISSING (SUBJECT_UNKNOWN: no ChemicalSubstance with uid <uid>) | 3 |
| SEMANTIC | PREDICATE_KIND_MISMATCH: EVENT_SCHEDULED is a relationship predicate; this proposal kind needs literal | 3 |
| (other) | 93 further normalized reasons | 125 |

#### Per-intent before / after (with markers; offline)

| # | Intent (fixtures-v2 path) | Before (original, empty graph) | After (round, seeded order) | Edits | Unknown markers | Holds added | Residual holds E/D/S |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | D10/fda-qhc-magnesium-disconfirmation/intent.json | rejected 0a/0h/12r | partial 11a/1h/0r | 7 | 5 | 1 | 0/0/1 |
| 2 | D10/livertox-green-tea-extract-harm/intent.json | rejected 0a/0h/8r | partial 2a/6h/0r | 4 | 4 | 6 | 3/0/3 |
| 3 | D10/mg-bisglycinate-rct-unstructured/intent.json | rejected 0a/0h/11r | held 0a/11h/0r | 6 | 4 | 11 | 6/4/1 |
| 4 | D10/mg-rankings-criteria-comparison/intent.json | rejected 0a/0h/39r | partial 4a/35h/0r | 32 | 10 | 35 | 18/15/2 |
| 5 | D10/opentargets-association-signal/intent.json | rejected 0a/0h/10r | partial 2a/8h/0r | 2 | 2 | 8 | 4/0/4 |
| 6 | D11/capture-failures-coverage/intent.json | rejected 0a/0h/1r | held 0a/1h/0r | 1 | 1 | 1 | 1/0/0 |
| 7 | D11/nr-chloride-gsrs-identifier-bridge/intent.json | partial 9a/0h/1r | applicable 10a/0h/0r | 1 | 1 | 0 | 0/0/0 |
| 8 | D11/nr-trial-jats-unstructured/intent.json | partial 5a/1h/9r | partial 7a/8h/0r | 4 | 4 | 8 | 6/0/2 |
| 9 | D11/resveratrol-retraction-integrity/intent.json | partial 2a/1h/4r | partial 5a/2h/0r | 7 | 3 | 2 | 0/0/2 |
| 10 | D11/sirolimus-spl-boxed-warning/intent.json | rejected 0a/0h/6r | partial 1a/5h/0r | 3 | 2 | 5 | 5/0/0 |
| 11 | D12/acrylamide-fried-potato-harm/intent.json | rejected 0a/2h/5r | partial 3a/4h/0r | 14 | 1 | 4 | 1/1/2 |
| 12 | D12/mcdonalds-fries-prepared-food/intent.json | rejected 0a/2h/10r | partial 2a/10h/0r | 11 | 2 | 8 | 8/0/2 |
| 13 | D12/olive-oil-polyphenols-preparation/intent.json | rejected 0a/4h/2r | held 0a/6h/0r | 11 | 1 | 6 | 2/4/0 |
| 14 | D12/predimed-retraction-disconfirmation/intent.json | rejected 0a/3h/8r | partial 3a/8h/0r | 4 | 2 | 5 | 0/0/8 |
| 15 | D12/upf-diet-rct-unstructured/intent.json | partial 2a/3h/5r | partial 3a/7h/0r | 3 | 1 | 4 | 2/0/5 |
| 16 | D13/bioage-strides-discontinuation/intent.json | rejected 0a/7h/4r | held 0a/11h/0r | 0 | 0 | 9 | 2/1/8 |
| 17 | D13/lesne-2006-retraction/intent.json | rejected 0a/6h/1r | held 0a/7h/0r | 0 | 0 | 7 | 0/1/6 |
| 18 | D13/madrigal-maestro-nash-topline-8k/intent.json | rejected 0a/6h/3r | held 0a/9h/0r | 0 | 0 | 5 | 0/1/8 |
| 19 | D13/madrigal-financing-after-readout/intent.json | rejected 0a/9h/4r | held 0a/13h/0r | 0 | 0 | 5 | 0/1/12 |
| 20 | D13/madrigal-pdufa-to-accelerated-approval/intent.json | rejected 0a/14h/8r | held 0a/22h/0r | 0 | 0 | 22 | 3/7/12 |
| 21 | D1/ashwagandha-plant-part-harm/intent.json | partial 2a/0h/9r | partial 10a/1h/0r | 7 | 7 | 1 | 1/0/0 |
| 22 | D1/lgg-strain-resolution/intent.json | partial 3a/0h/9r | partial 8a/4h/0r | 5 | 3 | 4 | 4/0/0 |
| 23 | D1/nr-salt-moiety-us-canada/intent.json | partial 1a/0h/12r | partial 5a/8h/0r | 6 | 6 | 8 | 3/0/5 |
| 24 | D1/nr-trial-unstructured/intent.json | partial 5a/0h/4r | partial 7a/2h/0r | 2 | 1 | 2 | 2/0/0 |
| 25 | D1/vitamin-b6-threshold-harm/intent.json | rejected 0a/0h/15r | partial 8a/7h/0r | 5 | 5 | 7 | 7/0/0 |
| 26 | D2/dq-senescence-biomarker-path/intent.json | partial 9a/0h/4r | partial 9a/4h/0r | 0 | 0 | 4 | 4/0/0 |
| 27 | D2/metformin-exercise-harm/intent.json | partial 1a/0h/6r | partial 1a/6h/0r | 0 | 0 | 6 | 6/0/0 |
| 28 | D2/nr-muscle-unstructured/intent.json | partial 2a/0h/4r | partial 3a/2h/0r | 1 | 1 | 2 | 2/0/0 |
| 29 | D2/reactome-chembl-reference/intent.json | partial 3a/0h/10r | applicable 13a/0h/0r | 1 | 1 | 0 | 0/0/0 |
| 30 | D2/sirt1-activation-disconfirmation/intent.json | partial 4a/0h/1r | applicable 5a/0h/0r | 1 | 1 | 0 | 0/0/0 |
| 31 | D3/aspree-registry-history-harm/intent.json | partial 70a/47h/2r | partial 70a/49h/0r | 0 | 0 | 49 | 20/28/1 |
| 32 | D3/dq-bone-trial-unstructured/intent.json | partial 81a/36h/3r | partial 80a/40h/0r | 0 | 0 | 40 | 31/5/4 |
| 33 | D3/resveratrol-retraction/intent.json | partial 5a/18h/1r | partial 5a/19h/0r | 0 | 0 | 19 | 8/10/1 |
| 34 | D4/consumer-panel-and-blood-clock/intent.json | partial 10a/0h/18r | partial 27a/1h/0r | 28 | 2 | 1 | 1/0/0 |
| 35 | D4/dunedinpace-paper-unstructured/intent.json | partial 2a/0h/4r | partial 2a/4h/0r | 0 | 0 | 4 | 3/0/1 |
| 36 | D4/clock-noise-vs-retest-advice/intent.json | rejected 0a/1h/6r | partial 3a/4h/0r | 8 | 2 | 4 | 2/0/2 |
| 37 | D4/hba1c-two-labs-interference/intent.json | partial 12a/0h/9r | partial 19a/2h/0r | 28 | 4 | 2 | 2/0/0 |
| 38 | D4/noninvasive-glucose-cgm-recall/intent.json | partial 1a/0h/8r | partial 4a/5h/0r | 8 | 2 | 5 | 5/0/0 |
| 39 | D4/nr-nad-compound-to-test/intent.json | partial 6a/0h/8r | partial 10a/4h/0r | 12 | 1 | 4 | 4/0/0 |
| 40 | D4/wearable-hrv-algorithm-changes/intent.json | partial 5a/0h/6r | partial 7a/4h/0r | 14 | 3 | 4 | 4/0/0 |
| 41 | D5/antioxidant-exercise-disconfirmation/intent.json | rejected 0a/8h/2r | held 0a/10h/0r | 5 | 1 | 9 | 8/1/1 |
| 42 | D5/pregnancy-magnesium-upper-limit/intent.json | partial 48a/0h/41r | partial 52a/37h/0r | 55 | 3 | 37 | 37/0/0 |
| 43 | D5/sirolimus-label-interactions-harm/intent.json | rejected 0a/0h/11r | held 0a/11h/0r | 11 | 4 | 11 | 11/0/0 |
| 44 | D5/sleep-toolkit-unstructured/intent.json | partial 34a/2h/12r | partial 35a/13h/0r | 30 | 4 | 12 | 11/0/2 |
| 45 | D6/prepared-food-bigmac-mcdonalds/intent.json | partial 2a/0h/24r | partial 3a/23h/0r | 2 | 2 | 23 | 17/0/6 |
| 46 | D6/proprietary-blend-ag1/intent.json | partial 7a/0h/13r | partial 19a/1h/0r | 8 | 8 | 1 | 1/0/0 |
| 47 | D6/recall-moringa-mogo/intent.json | partial 7a/1h/21r | partial 9a/20h/0r | 7 | 7 | 19 | 8/0/12 |
| 48 | D7/attia-cgm-dexcom-recommendation-interest/intent.json | rejected 0a/1h/5r err | held 0a/6h/0r | 9 | 0 | 5 | 4/0/2 |
| 49 | D7/bioage-group-vehicles-stale-role/intent.json | rejected 0a/0h/8r | held 0a/8h/0r | 0 | 0 | 8 | 8/0/0 |
| 50 | D7/elysium-paper-funding-award/intent.json | rejected 0a/0h/14r | partial 9a/5h/0r | 20 | 0 | 5 | 0/0/5 |
| 51 | D7/ftc-ameribev-paid-dieticians-harm/intent.json | rejected 0a/0h/4r | applicable 4a/0h/0r | 12 | 0 | 0 | 0/0/0 |
| 52 | D7/niagen-ownership-brand-history/intent.json | rejected 0a/0h/20r | partial 1a/19h/0r | 7 | 1 | 19 | 0/0/19 |
| 53 | D6/label-versions-truniagen-dsld/intent.json | partial 11a/0h/19r | partial 23a/7h/0r | 8 | 8 | 7 | 5/0/2 |
| 54 | D6/filing-channels-niagen-10k/intent.json | rejected 0a/4h/5r | partial 3a/6h/0r | 5 | 5 | 2 | 0/0/6 |
| 55 | D6/offer-roles-price-kinds-truniagen/intent.json | partial 10a/0h/33r | partial 18a/25h/0r | 3 | 3 | 25 | 18/0/7 |
| 56 | D6/retailer-reformulation-claim-iherb/intent.json | partial 2a/0h/14r | partial 2a/14h/0r | 1 | 1 | 14 | 12/0/2 |
| 57 | D7/sinclair-self-disclosure-unstructured/intent.json | rejected 0a/0h/12r | partial 11a/1h/0r | 13 | 0 | 1 | 0/0/1 |
| 58 | D8/certification-listing-lot-scope/intent.json | rejected 0a/0h/24r | partial 13a/11h/0r | 16 | 2 | 11 | 10/0/1 |
| 59 | D8/eu-nrcl-authorisation-data-protection/intent.json | rejected 0a/0h/11r | partial 8a/3h/0r | 13 | 3 | 3 | 1/0/2 |
| 60 | D8/eurofins-coa-quantity-by-input/intent.json | rejected 0a/0h/22r | partial 19a/3h/0r | 16 | 4 | 3 | 3/0/0 |
| 61 | D8/imu-tek-warning-letter-recall/intent.json | rejected 0a/2h/18r | partial 14a/6h/0r | 11 | 2 | 4 | 4/0/2 |
| 62 | D8/nmn-us-exclusion-reversal/intent-step2.json | rejected 0a/0h/16r | partial 14a/2h/0r | 17 | 3 | 2 | 0/0/2 |
| 63 | D8/nmn-us-exclusion-reversal/intent.json | rejected 0a/1h/10r | held 0a/11h/0r | 9 | 2 | 10 | 0/0/11 |
| 64 | D8/us8197807-claims-held-invalid/intent.json | rejected 0a/0h/18r | partial 12a/6h/0r | 17 | 6 | 6 | 0/0/6 |
| 65 | D9/hl-essentials-recut-nmncom-retelling/intent.json | partial 2a/2h/12r | partial 4a/12h/0r | 1 | 1 | 12 | 3/0/9 |
| 66 | D9/hl52-transcript-nmn-practice/intent.json | partial 1a/2h/18r | partial 3a/18h/0r | 2 | 2 | 18 | 12/0/6 |
| 67 | D9/lifespan-ep4-spermidine-correction/intent.json | partial 2a/1h/9r | partial 5a/7h/0r | 1 | 1 | 7 | 3/0/4 |
| 68 | D9/longecity-nmn-fatigue-pseudonymous/intent.json | partial 1a/1h/4r | partial 1a/5h/0r | 0 | 0 | 5 | 1/0/4 |
| 69 | D9/rapa-ex-01-attia-retelling/intent.json | partial 2a/1h/8r | partial 3a/8h/0r | 1 | 1 | 8 | 4/0/4 |
| 70 | D9/sinclair-recommendation-disclosure-asof/intent.json | rejected 0a/0h/11r | partial 5a/6h/0r | 3 | 3 | 6 | 6/0/0 |
| 71 | K/hubbard-2013-unstructured-to-entity/intent.json | partial 2a/1h/0r | partial 2a/1h/0r | 0 | 0 | 0 | 0/0/1 |
| 72 | K/resveratrol-identifier-crosswalk/intent.json | applicable 8a/0h/0r | applicable 8a/0h/0r | 0 | 0 | 0 | 0/0/0 |
| 73 | K/resveratrol-sirt1-evidence-mission/intent.json | rejected 0a/5h/1r | held 0a/6h/0r | 0 | 0 | 1 | 0/0/6 |
| 74 | K/retracted-sah-2017-stale-evidence/intent.json | rejected 0a/2h/9r | partial 1a/10h/0r | 3 | 3 | 8 | 6/0/4 |
| 75 | K/seller-claim-occurrences/intent.json | partial 1a/2h/1r | partial 1a/3h/0r | 2 | 2 | 1 | 1/0/2 |
| 76 | K/two-run-lineage/intent-r2.json | rejected 0a/1h/1r | held 0a/2h/0r | 1 | 1 | 1 | 0/0/2 |
| 77 | K/two-run-lineage/intent.json | held 0a/2h/0r | held 0a/2h/0r | 2 | 2 | 0 | 0/0/2 |
| 78 | cross-domain/claim-mission-report/intent-r2.json | partial 2a/14h/11r | partial 4a/23h/0r | 8 | 0 | 17 | 1/1/21 |
| 79 | cross-domain/claim-mission-report/intent.json | held 0a/2h/0r | held 0a/2h/0r | 0 | 0 | 0 | 0/0/2 |
| 80 | cross-domain/compound-profile/intent.json | partial 102a/0h/1r | partial 98a/5h/0r | 0 | 0 | 5 | 0/0/5 |
| 81 | cross-domain/product-comparison/intent.json | partial 154a/0h/1r | partial 154a/1h/0r | 0 | 0 | 1 | 0/0/1 |
| 82 | _examples/ingestion-intent.example.json | rejected 0a/0h/5r err | held 0a/5h/0r | 3 | 1 | 5 | 2/0/3 |

### 13.9 Workspace follow-ups (lead)

- **CardRecord fields.** `packages/contracts/src/workspace.ts` `CardRecord` gains `keywords` and `bodyTokens` (optional string arrays, after `tokens`). The JSON Schema `bks-schema-card.v1.json` was re-exported. The parity test against `schema-contracts.ts` stays green.
- **Search modes.** `/describe` and the MCP `schema_search` description advertise `semantic` / `hybrid` only when the workspace manifest says `semantic.status: available` **and** S5 `generationCompatibility(ws).state === "compatible"`. A semantic retriever (`semanticFromEnv`) is bound only in that case. Otherwise searches use `notConfiguredRetriever`: semantic returns unavailable, hybrid degrades to lexical-only, and no provider is called. The generation id is never advertised or logged.
- **Route tests.** The executor route tests ran against the regenerated `workspace/` (fingerprint `sha256:f2fbe6c7…`; its manifest says `semantic.status: not-configured`, so only lexical is advertised). Executor 13/13 (the suite includes modules added by other roles), contracts green, `pnpm build` green.

### 13.10 S7 patches and the `held` plan outcome (lead)

**S7 patches**

| Patch | Status |
| --- | --- |
| P1: `@bks/kg-ops` re-exports `./admission/index.js` | Applied. `apps/executor/src/modules/admission.ts` now imports from `@bks/kg-ops` instead of `../../../../packages/kg-ops/dist/admission/index.js`. |
| P2: `@bks/contracts` exports `envelope.ts`; `CONTRACT_VERSIONS` adds `knowledgeRequest: "mc.knowledge_request.v1"` and `knowledgeDelivery: "mc.knowledge_delivery.v1"` | Applied. `/describe` contracts change, so the Mission Control catalog descriptor / binding needs a refresh (S7 / lead). |
| P3: JSON-schema exporter adds `mc.knowledge_request.v1` and `mc.knowledge_delivery.v1` | Applied (27 schemas). |
| S7 P7 (the lead's "P5"): env names in `.env.example` | Applied: the `BKS_ADMISSION_*` names with comments. The Mission Control-side `BIOTECH_*` names are listed as a reference comment. |
| P4: Supabase custody switch (`BKS_CUSTODY_BACKEND=supabase`) | **Blocked** until the bucket exists (`verifyBucket()` must report `exists && !public`). Not applied. |
| P5 (S7, KS owner): `knowledge-request-envelope.js` | Not applicable: no such file exists; the envelope is `envelope.ts` (P2). |
| P6 (Python envelope re-export) | Optional; not done. The client imports `biotech_knowledge_client.envelope`. |

**`held` plan outcome.** This is small and backward compatible: an additive enum member.
- `PlanOutcomeV2` = `applicable | partial | noop | held | rejected`.
- The planner emits `held` when there are no errors, no proposal is admitted or rejected, and at least one is held. Such a plan carries no statements.
- `applyV2`, witness issuance and (through the witness) admission refuse it with `BKS_PLAN_REJECTED` and an explicit message ("every proposal of this plan is held; it writes nothing").
- `POST /kg/plan` returns HTTP 200 for it, where `rejected` keeps 422.
- The Python `PlanV2` / `PlanView` literals accept `held`.
- JSON Schemas were regenerated. The plan golden is unchanged, because the example plan is `applicable`.
- Behavior change for clients: an all-held plan used to be reported as `rejected`. A client that switched on `rejected` for "nothing to apply" should also treat `held` that way.
- `packages/kg-ops/src/admission/service.ts` (S7-authored) still checks only `rejected` before issuing. A held plan is refused one step later, by `issueWitness`. S7 may add the explicit check.

**Results after these changes**

| Check | Result |
| --- | --- |
| `pnpm build` | pass |
| contracts + executor | 81/81 (executor 13, including the route tests against the regenerated `workspace/` with fingerprint `sha256:f2fbe6c7…`) |
| kg-ops unit (whole project, other roles' unit files included) | 101 passed, 54 skipped |
| Python client | 89/89 (the suite grew with S7's envelope tests) |
| Gate B Community (`bks-neo4j-s3`, fresh, capped, 7696; stamp `tmv4of5i7`) | 21 passed, 1 skipped (the Enterprise-only test), 168 s; matrix 97 s |
| Gate B Enterprise (`bks-neo4j-s3-ee`, fresh, capped, 7697; Community stopped meanwhile, one container at a time) | 22/22 including the Enterprise reader-authority test, 261 s; matrix identical to Community (5 / 58 / 19 held, 896 applied, the same 4 refusals), 146 s; the container was stopped afterwards |
| Docker | three engine hangs during this follow-up (about 20:45, 21:55 and 22:50 local). Every run they interrupted was environmental and was rerun on fresh containers created through `scripts/neo4j-test.sh` (page cache 256M, heap 1G, `--memory 1536m`). |
| Matrix evidence | written per stamp (`fixture-matrix-<stamp>.json`) so that concurrent runs from the same checkout no longer overwrite each other |

### 13.11 Phase-aware DDL (v2.0.2 staging)

- **Selection.** `releaseDdlSelection(ddl, {enterprise, phase})` now selects from `ddl.json` statements; the `.cypher` files are projections of it.
  - It includes every `requirement: required` statement, plus every `edition: enterprise` statement on an Enterprise server. The 3 community-optional vector indexes are not installed, as before.
  - `phase: post-migration` statements run in `post`. Everything else runs in `pre`, including v2.0.1 statements, which carry no phase.
  - Statements whose `status` is not active (v2.0.2 `blocked-by-legacy-data`) are never run and are reported in `blocked`, with reason and enabling condition.
- **Install entry points.** `ensureOperationalState(..., {phase})` and `bks kg ensure-operations --phase pre|post|all` (default `all`) report `phase`, `counts` and `blocked`.
  - `pre` and `all` verify the writer names and run the bootstrap. `post` only adds rules.
  - The integration setup passes `{ phase: "all" }` explicitly on its fresh containers.
- **Unit tests** (`write.test.ts`):
  - On v2.0.1, `pre` equals `all` and `post` is empty. With no phase field present, the selection equals `required.cypher` + `enterprise.cypher`.
  - On staged v2.0.2 (`loadRelease({dir})` when it verifies, otherwise the raw `ddl.json`): `all` = `pre` + `post`, and `rel_MEASURES_assertion_exists` is in `post.blocked`, never selected, and not blocked on Community. Every writer name is in `pre`.
  - The writer stamps `assertionUid` on a new `MEASURES` edge (OutcomeDefinition → Biomarker). The effect and the statement both carry the minted assertion uid.
- **Rerun on fresh containers, one at a time** (Community stopped during the Enterprise run):
  - Community (7696, stamp `tmv4oxwpo`): 21 passed, 1 skipped (Enterprise-only test).
  - Enterprise (7697, stamp `tmv4p3lc4`): 22/22.
  - Both matrices: 5 applicable / 58 partial / 19 held, 896 applied, 704 held, the same 4 real-graph conflicts, 0 apply failures.
  - kg-ops `write.test.ts`: 22/22.

### 13.12 S4 patches, writer fixes (P-6) and the final v2.0.2 pin

**S4 patches**

| Patch | Status |
| --- | --- |
| P-1: read contracts into `@bks/contracts` | Applied. `packages/contracts/src/read-v2.ts` copies S4's `read/contracts.ts` with local imports and is exported from the index. `packages/kg-ops/src/read/contracts.ts` now re-exports it, so there is a single definition. `CONTRACT_VERSIONS`: `readIntent` → `biotech-knowledge-read-intent.v2`; new `cypherReadIntent`, `readResult`, `readExplain`, `readValues`. `LEGACY_CONTRACT_VERSIONS`: `readIntent` v1, `readSnapshot` v1. New JSON Schemas: read-intent v2, cypher-read-intent v1, read-result v2, read-explain v1 (31 files in total). Python: `CONTRACTS` keys `read-intent-v2`, `cypher-read-intent`, `read-result`, `read-explain`; models `ReadResultV2` and `ExplainResultV1`; client `read_v2`, `read_cypher`, `read_explain`. |
| P-2: `modules/read-v1.ts` | Applied. The HTTP route is removed; only MCP `kg_read` remains, advertised as `read.typed.v1`. `POST /kg/read` is S4's `read.ts`, which decodes both v1 and v2. S7's `boundary.test.ts` implemented-capability set gained `read.typed.v1`. |
| P-3: `/describe` | Applied. `queryCatalogDigest` and `consistency.readModes` come from `capabilities["read.typed"]` (`["observed","stable_revision"]` with S4's module). |
| P-4: `withStableRevision({fetchSize})` | Applied. |
| P-7: env names | Applied in `.env.example`: `BKS_READ_BINDINGS`, `BKS_READ_AUTHORITY`, `BKS_READ_VISIBILITY`, `BKS_READ_MAX_CONCURRENT`, `BKS_READ_MAX_CONCURRENT_PER_PRINCIPAL`, `BKS_READ_V1_RETIRED`. |
| P-6 (e): `bks kg read` | Fixed. It accepts `biotech-knowledge-read-intent.v2` and `biotech-cypher-read-intent.v1` (read result v2). It uses session-routed `default` (public) and `internal` bindings over the CLI connection, so arbitrary Cypher stays unavailable without a database-role binding. Legacy v1 intents still return a snapshot. |

**Writer bugs (P-6)**

- **(a) Retry-local accumulators.** `planIntentV2` now creates its observation accumulator inside the managed read callback. A driver retry starts from an empty set and one snapshot instead of inheriting keys a failed attempt cleared. `verifyEffects` had the same defect class (its page accumulator lived outside the callback) and was fixed the same way.
  - New integration test: the first read attempt throws a transient error on its third statement and the callback runs again on a fresh transaction. The plan succeeds with the same digest as an unperturbed plan (`failedAttempts: 1`); the old code fails this test.
- **(b) CaptureAttempt privacy.** CaptureAttempt nodes are written `INTERNAL`.
  - The node register's `privacy: privacyClass INTERNAL by default` is parsed into `NodeSpec.defaultPrivacy`, and an `INTERNAL` default cannot be loosened by the intent default or by the author.
  - Integration test: the stored `privacyClass` is `INTERNAL`.
- **(c) Integers.** `Int`-typed node and edge properties are stored as Integer.
  - The compiled `SET` re-assigns them with `toInteger($…Props.k)`, element-wise for lists, after the map merge. This covers node creates and updates, asserted episodes, structural and derived edges.
  - Integration round-trip: `Package.unitCount`, `HAS_PACKAGE.orderIndex` and `CaptureAttempt.httpStatus` all read back as `INTEGER NOT NULL`.
  - Because the compiled Cypher changed, plan digests changed; the plan golden was regenerated and the Python golden check passes.
- **(d) Cold path.**
  - `ensureOperationalState` now runs `CALL db.awaitIndexes(300)` after the DDL, so the first plan never runs against POPULATING indexes.
  - Gate B records `plan-latency` and `apply-latency`. On a fresh container with the full DDL: cold plan 7.1 s (Community) and 11.5 s (Enterprise), warm 0.4 s; first apply (79 statements) 7.5 to 11.5 s. All are within the 30 s budgets, which are not changed.
  - One loaded-machine run (Community, stamp `tmv4qdo42`) timed out the largest matrix intent (`cross-domain/product-comparison`, 515 statements in one transaction: `BKS_TIMEOUT` at 30 s). The rerun on an idle container applied it in 4.5 s. The per-intent `applyMs` and `statements` are now in the matrix evidence.
  - Under machine load, the large cross-domain intents are the ones close to the budget. A fixture owner could split them into bounded child intents; the budget is unchanged.

**Final pin `biotech-schema-v2.0.2`** (`schemaReleaseDigest sha256:5fffb593…`, phased DDL, `ddlDigest sha256:943f8c29…`):
- The example intents are re-pinned. The plan golden and `fixtures-v2` (`ROUND.json` + 82 intents) were regenerated; the round totals are unchanged (5 / 59 / 18 held offline).
- The phase tests now use the pinned v2.0.2 (phased) and v2.0.1 as an override (no phase field).
- The integration setup runs `ensureOperationalState(..., { phase: "all" })`, the equivalent of `kg ensure-operations --phase all`.

**Final results (pin v2.0.2)**

| Check | Result |
| --- | --- |
| `pnpm build` | pass |
| contracts | pass |
| executor | 80/81. The 1 failure is S4's `modules/read.test.ts`, which expects 120 supported templates; v2.0.2's catalog has 123. |
| kg-ops unit | 103 passed, 55 skipped. 2 failures, both in S4's `read/read.test.ts`: it hard-codes the v2.0.1 catalog count (153 templates; v2.0.2 has 157) and the v2.0.0-override equality. All S3 unit files pass, including round reproducibility, phases, MEASURES and the v2.0.1 override. |
| Python | 90/90 |
| Gate B Community (`bks-neo4j-s3`, fresh, capped, one container; stamp `tmv4qrr1w`) | 22 passed, 1 skipped (the Enterprise-only test), 148 s. Matrix: 5 applicable / 58 partial / 19 held, 896 applied, 704 held, 4 real-graph conflicts, 0 apply failures, 88 s |
| Gate B Enterprise (`bks-neo4j-s3-ee`, fresh, capped, Community stopped; phased enterprise DDL with `rel_MEASURES_assertion_exists` blocked; stamp `tmv4qksdg`) | 23/23, 240 s. Matrix identical, 0 apply failures |
| Containers | both stopped at the end |

### 13.13 Ingest skill v2, eval findings, release-marker rule, executor image

**`.agents/skills/biotech-kg-ingest/` v2** (AGENT-SKILLS section 2)

- **`SKILL.md`** (122 lines) covers:
  - trigger / non-trigger, inputs and the result artifact;
  - the 7-step procedure: basis → evidence → typed intent → plan and inspect → apply → lost-response recovery → paginated readback;
  - required vs optional contract fields; the `held` plan outcome;
  - admission and witness semantics, with no cross-store atomic revocation;
  - limits, and the vendor-overlay statement that comes before any `neo4j-cypher-skill` / `neo4j-import-skill` reference.
- **`manifest.json`** (`bks-skill-manifest.v1`).
- **References:**
  - `proposal-matrix.md`: hand-written proposal-kind table, plus node and relationship tables generated from the v2.0.2 registers and `executorOps`.
  - `intent-v2-fields.md`, `evidence-custody.md`, `plan-receipt-guide.md`, `recovery-cookbook.md`, `error-codes.md` (INTERFACES section 5 + section 10 codes, HTTP statuses, planner reasons) and `vendor-overlay.md`.
- **Worked examples:** `examples/examples.json` (runner spec, `bks-skill-examples.v1`) and 12 intent files for ex01 to ex10:
  - ex01: label with amount basis and per-field evidence;
  - ex02: paper vs registry disagreement;
  - ex03: predicate-only assertion with object;
  - ex04: corrected same-source episode (supersession);
  - ex05: contradictory multi-source episodes;
  - ex06: claim occurrence with asserter and locator;
  - ex07: derived output via `projection.write`, refused for the ordinary writer and admitted for the projector;
  - ex08: ambiguous identity held (plan outcome `held`, admission refused);
  - ex09: partial plan (all → `BKS_PARTIAL_REFUSED`, open subset → `BKS_PARTIAL_NOT_CLOSED`, closed subset → partial);
  - ex10: duplicate, receipt lookup, re-plan under the same key → `BKS_EFFECT_CONFLICT`, statements → `BKS_PLAN_FORGED`, wrong digest → `BKS_PLAN_DIGEST_MISMATCH`.
- **Runner:** `apps/executor/src/skill-examples.integration.test.ts` drives the real executor HTTP path (plan → admit → apply → receipt → verify-effects, readback 0 failures) on a fresh container: **10/10**.
- **Writer bugs the examples found:**
  - **Supersession between the same endpoints.** A corrected episode between the same endpoints by the same asserter failed the `episode-absent` pre-invariant, because the episode being closed by the same plan was counted. The invariant now carries `closing[]` and excludes those episodes.
  - **Readback lineage.** Readback demanded that the closing run be lineage of a superseded Assertion. A supersession close is now checked for `closed` only; the closing run is recorded on the superseding Assertion.
  - Both change plan digests, so the plan golden was regenerated.
- **`skill-routing.json`** (migration role's file; not edited). One-line change for route `write.canonical`:
  `"examples": [".agents/skills/biotech-kg-ingest/examples/examples.json"]`.

**Evaluation findings (lead)**

1. **Subject identifiers.**
   - `IdentifierDeclarationV2` gains optional `evidence` (additive).
   - The planner attaches a new-mode subject's declared identifiers in the same plan when the subject is created or resolves to an existing node. The conditions are an active scheme and stated evidence. The attach is an implicit `identifier.attach` (`id.<ref>.<scheme>`): Identifier node + asserted HAS_IDENTIFIER (KN-06, R-42).
   - Without evidence the identifier stays a resolution key, with the warning `IDENTIFIER_NOT_ATTACHED`; nothing is invented.
   - Fixture round: 17 `identifier-evidence` edits fill the locator from the fixture's own `assertions.yaml` (`identifiers: [{scheme, value, locator}]`). Example: acrylamide PUBCHEM_CID 6579 and INCHIKEY now cite `loc-pubchem-acrylamide`.
   - Tests: the unit round test checks that `id.acrylamide.pubchem-cid` is admitted and creates Identifier + HAS_IDENTIFIER; Gate B checks `hu:substance:acrylamide -[:HAS_IDENTIFIER]-> PUBCHEM_CID 6579` on the real graph.
2. **Production guard.**
   - `GraphClient` refuses any `*.databases.neo4j.io` host unless `BKS_TARGET=production` (`TargetGuardError`, URI never printed). This covers the executor, the MCP server, the CLI and the tests.
   - The executor and MCP entrypoints refuse to start (exit 78).
   - `import "dotenv/config"` is replaced by `load-env.ts`, which loads `./.env` (or `BKS_ENV_FILE`; `BKS_NO_ENV_FILE=1` loads none) and prints only the loaded path to stderr.
3. **Health and readiness.**
   - `/healthz` is liveness (always 200) with an honest bounded probe: `database: reachable | unreachable | unconfigured`.
   - New `/readyz`, same semantics as the GraphQL API: database answers, writer fence present, latest release marker is the served release, writer-required DDL present / ONLINE; 503 otherwise.
   - Driver timeouts are now bounded: acquisition 10 s and connect 5 s by default (5 s / 3 s in `fly.toml`), configurable with `BKS_NEO4J_ACQUISITION_TIMEOUT_MS` / `BKS_NEO4J_CONNECT_TIMEOUT_MS`. They were 30 s.
   - Unit test: against an unreachable database, `/healthz` is 200 with `unreachable` and `/readyz` is 503, both within 15 s.
4. **Custody directory.** `.env.example` now documents both: `BKS_RUNS_DIR` is CLI convenience output only; `BKS_RELEASE_RUNS_DIR` is the custody root (plans, receipts, snapshots, verifications, admission ledger).

**Release-marker rule (review finding).**
- `lockFence` / `readFence` return `latestMarkers`, the marker(s) with the greatest `installedAt`. `releaseMarkerVerdict` requires the served `releaseId`, `schemaReleaseDigest` and `ddlDigest`, and refuses a tie.
- Apply refuses otherwise with `BKS_RELEASE_MISMATCH`: a failed receipt, nothing written. The same verdict feeds `/readyz`.
- New Gate B test: a newer foreign marker is refused, an older foreign marker is accepted, a tie is refused.

**Executor image (S9 prerequisite).**
- `apps/executor/Dockerfile`:
  - Multi-stage, pnpm 11.15.1, `node:22-alpine`.
  - Copies the contracts, schema-workspace, kg-ops and executor dists; `schema/pinned` (PIN.json + release/); `workspace/`; `apps/executor/capabilities` and `lanes`.
  - Copies the 5 domain skills plus `skill-routing.json`, because the capability descriptor digests them. The vendored skills are not copied.
  - `BKS_NO_ENV_FILE=1`, `USER node`, `/data/runs`, HEALTHCHECK on `/healthz`, `CMD node apps/executor/dist/index.js`.
  - `.dockerignore` no longer excludes `workspace/schema-ir.json`, which the schema routes need.
- `apps/executor/fly.toml`:
  - App `bks-biotech-executor`, iad, internal port 4020, `NODE_ENV=production`, `BKS_TARGET=production`.
  - `min_machines_running=1`, 1 GB shared-1x.
  - Volume `bks_executor_data` mounted on `/data` with `BKS_RELEASE_RUNS_DIR=/data/runs`. Supabase custody replaces it once the bucket exists.
  - Checks on `/healthz` and `/readyz`; secrets listed as names only.
- Built locally: `bks-executor:v2.0.2`, image id `36aa4bda6048`, 609 MB.
- Image smoke against the test container (`host.docker.internal:7712`):
  - Aura-shaped URI with `BKS_TARGET` unset: refused at startup (exit 78).
  - Local URI: `/healthz` 200 `database: reachable`; `/readyz` 200 `ready: true` (first cold check about 2 to 4 s; the readiness budget is 7 s); `/describe` serves v2.0.2 with 17 capabilities and `readModes [observed, stable_revision]`.
  - The smoke container was removed.
- Deploy command for the lead (not run): `bash scripts/fly.sh deploy . --config apps/executor/fly.toml --dockerfile apps/executor/Dockerfile --remote-only`. Create the volume first: `fly volumes create bks_executor_data --region iad --size 1 -a bks-biotech-executor`.

**Results (pin v2.0.2, one container `bks-neo4j-s3-skill` 7712/7512, removed afterwards)**

| Check | Result |
| --- | --- |
| `pnpm build` | pass |
| unit: contracts + kg-ops + executor | 190 passed, 68 skipped |
| Python | 90/90 |
| Gate B (kg-ops integration, Community, stamp `tmv5fxlbt`) | 23 passed, 1 skipped (Enterprise-only test). Includes the release-marker rule, the planner retry, Int/privacy round-trip and the identifier attach on the real graph. Matrix: 5 applicable / 59 partial / 18 held, 908 applied, 704 held, 5 real-graph conflicts, 0 apply failures; cold plan 1.3 s, first apply 1.9 s |
| Skill examples (executor HTTP) | 10/10 |

### 13.14 WR-19: future-dated snapshot refused (BKS_STALE_PRECONDITION)

- **Planner.** `snapshotTemporalProblem` lives in `packages/kg-ops/src/write/compile.ts` and is used with the injected `plannedAt`, so the planner stays pure. A declared snapshot with `retrievedAt > plannedAt`, or with `observedAt > retrievedAt`, adds the plan error `BKS_STALE_PRECONDITION`. The error names the source ref and both instants, and the plan is `rejected`. Instants compare exactly: there is no skew allowance, consistent with the writer's other time checks, and equal instants are accepted.
- **Apply.** `packages/kg-ops/src/apply.ts` re-checks every frozen snapshot with the apply clock before the witness check and the transaction, and throws `BKS_STALE_PRECONDITION`. Nothing is written. Readback and verify-effects are unchanged.
- **Contracts.** `BKS_STALE_PRECONDITION` already existed in the enum, the JSON Schema and the Python model, so there is no contract change. INTERFACES section 5 already lists it; section 10 has the delta line.
- **Docs.** The ingest skill's `error-codes.md` row and the limits line of `SKILL.md` now state the temporal rule.
- **Tests.**
  - Unit: a future `retrievedAt` is rejected at plan time; `observedAt > retrievedAt` is rejected; the equal-instant boundary is applicable. At apply time, one second before the snapshot instant is refused with `BKS_STALE_PRECONDITION`, and the instant itself passes the rule.
  - Gate B: a 2099 snapshot is refused at plan time, and its admission is refused with `BKS_PLAN_REJECTED`.
- **Digests.** No digest changed: the plan golden and `fixtures-v2/ROUND.json` reproduce unchanged.
- **Concurrent DDL.** `runOperationsCypher` now retries schema statements on a transient deadlock (up to 5 attempts). The full kg-ops integration project in parallel (S3, S4 and S7 files on one database) deadlocked on label schema locks during concurrent `ensureOperationalState`. Integration files are meant to run serially on one container: `--fileParallelism=false`.
- **Results.** `pnpm build` passes. `pnpm test`: 369 passed, 77 skipped. kg-ops integration project on a fresh capped Community container (`bks-neo4j-s3-fix`, 7702, removed afterwards; stamp `tmv5hvchs`): 157 passed, 11 skipped across 8 files, including Gate B, S4 reads and S7 admission.
- **Not changed.** `.agents/skills/biotech-graph-analyze/scripts/capability-probe.mjs` is not an S3 file; its owner is the graph-analyze role. Its release literal `biotech-schema-v2.0.0` (lines 8 and 13) should read the pin, e.g. `JSON.parse(readFileSync("schema/pinned/PIN.json")).releaseId`.
