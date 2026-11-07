---
name: biotech-kg-ingest
description: >-
  Use to record source-supported biotech facts, corrections, versions, claims or evidence in the BellLabs knowledge
  graph (schema release v2): write a biotech-knowledge-intent.v2 (sources with snapshots and locators, subjects,
  typed proposals), plan it on the executor, inspect dispositions and compiled Cypher, apply the stored plan by
  planRef + expectedPlanDigest with an admission witness, recover by receipt lookup, and read back every effect.
  The executor writes; you never write Cypher. Not for arbitrary graph mutation, schema DDL, publication decisions
  or graph analytics.
allowed-tools:
  - Bash(curl *)
  - Bash(node packages/kg-ops/dist/cli.js kg plan *)
  - Bash(node packages/kg-ops/dist/cli.js kg receipt *)
  - Bash(node packages/kg-ops/dist/cli.js kg verify *)
---

# biotech-kg-ingest v2

Surfaces (same service, same guarantees): executor HTTP `POST /kg/plan`, `POST /kg/apply`, `GET /kg/receipt?effectKey=`,
`POST /kg/verify-effects`, `GET /describe`; MCP `kg_plan`, `kg_apply`, `kg_receipt`, `kg_verify_effects`
(`kg_admit` / `POST /kg/admit` exist only in local development). Writer token required (`x-api-key`); a reader cannot
plan or apply. Contracts: intent `biotech-knowledge-intent.v2`, plan `biotech-knowledge-plan.v2`, apply
`biotech-knowledge-apply.v2`, receipt `biotech-knowledge-receipt.v2`, witness `bks-apply-witness.v1`, digests
`bks-canonical-json.v2`.

**Overrides before any vendor skill** (state them before loading `neo4j-cypher-skill` or `neo4j-import-skill`; see
`references/vendor-overlay.md`): Cypher 5 only (never `CYPHER 25`); the schema is the release-bound context of
biotech-schema-explore, not `db.schema.*` or a database-schema.json; generic MERGE / CREATE / SET / DELETE examples are
not ingestion (they bypass identity, evidence, episodes and the writer fence); `elementId()` is not identity, `uid` is.
Load the Cypher skill only to read compiled plan statements; load the import skill only to design a bulk adapter.

## Trigger / non-trigger

Trigger: a source states something (fact, field value, relation, version, ownership, claim) that belongs in the graph,
a correction of an earlier record, a new label or protocol version, a claim occurrence with its asserter. Non-trigger:
"fix the data" without a source; schema or index changes (biotech-graph-ops); publishing a verdict (report.publish is a
privileged service, not this skill); graph-global scoring (biotech-graph-analyze); reading (biotech-kg-query).

## Inputs

Release identity from `GET /describe` (`releaseId`, `schemaReleaseDigest`) and the admission policy version your mission
uses (today `bks-admission-policy/v1`); schema context
(types, identity rules, predicates, proposal routes) from biotech-schema-explore; a read-before-write result
(biotech-kg-query, `snapshotRef`) or a written creation-only reason; captured, verified evidence (snapshot hash,
locators with selectors); the mission/run context (actor, run system, runId, activityKind).

## Result artifact

A plan (`planRef`, `planDigest`, outcome, per-proposal dispositions), a receipt (`biotech-knowledge-receipt.v2`:
outcome, per-proposal outcomes, effects, graph revision, recovery lookup), and a verification report (all effect pages,
failures = 0). Report applied separately from admitted, published and mission acceptance.

## Procedure (7 steps)

1. **Context and basis.** Check `/describe`; copy `schemaReleaseDigest` into `pins` (any other release is refused:
   `BKS_RELEASE_MISMATCH`) with the admission `policyVersion` (bound into the plan and the witness; a mismatch fails
   the witness check). Read before you write: resolve every subject
   by uid > identifier > exact name and cite the read as `basis.snapshotRef {ref, digest}`. Use
   `basis.creationOnly {reason, expectAbsent, expectPresent}` only for a genuinely first capture, and name what you
   expect absent or present. Fix source, asserter (who says it), valid time (when it holds) and evidence scope.
2. **Evidence.** Capture and verify through the capture / verification services; cite immutable refs: snapshot
   `contentHash` + `contentHashBasis`, locators with `selector.basis` (a versioned projection such as `raw-capture/v1`),
   `exact` quote and offsets, or existing `{uid, selectorDigest}`. Your own verdict is not admission; trusted
   adjudications arrive as `adjudication` proposals from the verification run (`adjudication.deliver` grant).
3. **Typed intent.** One proposal per fact, chosen from `references/proposal-matrix.md`:
   FIELD facts are `node.upsert` with `fieldEvidence` (each field gets its own Assertion); relations with a typed edge
   are `edge.assert` (episode with valid time, per-asserter slot) and without one are `assertion.relate`
   (predicate-only, `objectRef`); scalar statements are `assertion.literal`; containment is `edge.structural`;
   identifiers are `identifier.attach`; claims are a `Claim` subject + `assertionKind: CLAIM` + `occurrenceOf`.
   A quantity the source states is `basisKind` of the source; a number you computed is `basisKind: CALCULATED` with
   `derivation {rule, from}`. Unknown stays unknown: leave the field out or hold the proposal; never fill a value the
   source does not state. Derived outputs (projections, associations) are `projection.write` by a trusted job only.
4. **Plan and inspect.** `POST /kg/plan` stores the plan server-side. Read `outcome`
   (`applicable | partial | held | rejected | noop`), each proposal's `disposition` and first `reasons[]`, subject
   dispositions, `dependsOn`, `effects`, `invariants` and the compiled `statements` (read-only; never submitted).
   `held` means every proposal is held and nothing would be written. Correct a held or rejected proposal by source or
   identity work and plan again; never route around it with a raw query.
5. **Apply.** Get a witness for `{planRef, effectKey, partialPolicy}` from the admission service (60 s, audience
   `bks-executor`), then `POST /kg/apply` with `planRef`, `expectedPlanDigest`, `intentDigest`, `effectKey`,
   `partialPolicy`, `witness`. Default `partialPolicy: "all"` (every admitted proposal or nothing). For a `partial` plan
   send `{include: [...]}` naming a closed dependency subset; anything else is `BKS_PARTIAL_REFUSED` /
   `BKS_PARTIAL_NOT_CLOSED`. The request carries no statements (`BKS_PLAN_FORGED`).
6. **Lost response.** `GET /kg/receipt?effectKey=<the original key>` first. `applied` → done (re-sending the same
   request returns `duplicate`). `failed` → read the failure; a stale precondition needs reconciliation and a newly
   admitted plan. Never mint a new intentId, effect key or clock to "retry": a re-plan has a new digest and the
   original key then refuses it (`BKS_EFFECT_CONFLICT`). See `references/recovery-cookbook.md`.
7. **Read back.** `POST /kg/verify-effects {effectKey, cursor, pageSize}` until `nextCursor` is null; every page
   must report `failures: 0`. Then report: receipt id, applied proposals, held / rejected ones with reasons, graph
   revision, verification result. Applied ≠ admitted by a mission ≠ published.

## Required vs optional contract fields

Required: `schemaVersion`, `intentId`, `pins.schemaReleaseDigest`, `pins.policyVersion`, `context.actor`,
`context.run {system, runId}`, `context.activityKind`, `basis` (snapshotRef or creationOnly with a reason ≥ 8 chars),
`proposals` (1..500). Optional: `pins.workspaceFingerprint`, `pins.schemaDigest`, `defaults.privacyClass` (PUBLIC;
INTERNAL only tightens), `sources`, `subjects`, `notes` (never interpreted), `provenance`. The service enforces the
release pin, the policy version, the basis and every register rule; skill text is guidance, not enforcement. Field
guide: `references/intent-v2-fields.md`; evidence: `references/evidence-custody.md`.

## Admission and revocation

Admission authorizes at issuance and bounds the in-flight lease (≤ 60 s witness). There is no atomic revocation
across the mission database and Neo4j: a revocation delivered after commit does not undo an applied effect; serving
rechecks eligibility separately. A plan with outcome `held` or `rejected` is never admitted.

## Limits

≤ 500 proposals and ≤ 6000 statements per intent (split into bounded child intents); a cited snapshot must have
`observedAt ≤ retrievedAt ≤` the service instant at plan and at apply (`BKS_STALE_PRECONDITION`, no skew allowance); one transaction per apply within
the 30 s budget; ≤ 200 sources, 1000 subjects; witness lifetime 60 s; verify pages ≤ 500.

## Failures and recovery

Error codes and what to do: `references/error-codes.md`. Reading plans and receipts: `references/plan-receipt-guide.md`.

## Examples (executable)

`examples/examples.json` (runner spec) and its intents run through the executor HTTP path in
`apps/executor/src/skill-examples.integration.test.ts`: label with amount basis and per-field evidence (ex01);
paper vs registry disagreement (ex02); predicate-only assertion (ex03); corrected same-source episode (ex04);
contradictory multi-source episodes (ex05); claim occurrence (ex06); derived output via a trusted job, refused for an
ordinary writer (ex07); ambiguous identity held (ex08); partial closed subset (ex09); duplicate, lost-response
recovery and forged plans (ex10).
