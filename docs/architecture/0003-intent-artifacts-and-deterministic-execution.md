# ADR 0003 — Intent artifacts and deterministic execution

Status: accepted · 2026-10-07

## Decision

An agent never writes Cypher for facts. It authors a `biotech-knowledge-intent.v1` JSON artifact; the executor (`packages/kg-ops`) **plans** it (validation against the pinned schema IR and the live graph, identity resolution, compilation into ordered parameterized Cypher, a plan digest) and **applies** the admitted statements in one transaction under an intent marker, producing a receipt. Reads go through `biotech-knowledge-read-intent.v1` operations that compile to fixed Cypher shapes (including the catalog's QS-1 trace and as-of validity classes).

### Intent shape

- `context`: actor and Mission Control run (`system`, `runId`, `missionId`, `activationId`). The run becomes an `Activity` node (`externalRunSystem`, `externalRunId`, one per run) that every written Assertion, snapshot, locator and mention is `WAS_GENERATED_BY`.
- `schemaDigest`, `inputSnapshot`, `preconditions[{uid, expectedUpdatedAt}]`, `onStale`: the author's pins; the planner and the apply transaction both check them.
- `sources[]`: Source → SourceSnapshot (`observedAt`, `contentHash`) → SourceLocator (selector kinds from the schema); locator refs are the only evidence currency.
- `subjects[]`: `resolved` (uid from a read) or `new` (type, name, properties, identifiers, `onMatch` policy).
- `proposals[]`: `node.upsert`, `identifier.attach`, `edge.assert`, `edge.structural`, `state.attach`, `assertion.literal`, `edge.close`, `mention.stage`.

### Create vs update

The planner resolves every `new` subject in a fixed basis order (uid > identifier > exact name > alias > fulltext). Strong matches (uid, identifier, exact name) trigger the author's `onMatch`: `review` holds, `use_existing` adopts, `fail` conflicts, `create_anyway` creates with a distinguishing uid segment. Weak matches (alias, fulltext) are reported, never adopted. Resolved subjects are checked for existence and label. Similar-name-implies-same-identity and shared-identifier-across-issuers are forbidden implications and are never used.

### Relationship classes

The relationship field's documented class decides the write path: `asserted` → an `Assertion` node (predicate, status PROPOSED, polarity, basis, validity, extraction metadata) with `HAS_SUBJECT`/`HAS_OBJECT`/`ASSERTED_BY`/`SUPPORTED_BY`/`WAS_GENERATED_BY`, plus one edge episode carrying the profile's executor-set fields (`relationshipUid`, `assertionUid`, validity copies, `recordedFrom`); `structural` → the edge (with `relationshipUid` when the profile has one), evidence optional; `derived` → rejected (projection jobs own them). Episodic profiles are detected from the schema (relationshipUid + assertionUid + recordedFrom), so `state.attach` works for HAS_STATE, HAS_FORMULATION_VERSION (FormulationEdgeProperties) and the other attachments. Exclusive types require the open episode to be closed first. Nothing deletes: `edge.close` writes `recordedTo` once and marks the Assertion SUPERSEDED.

### Determinism and idempotency

- Same intent bytes + same graph state → same plan digest. Minted uids derive from the intent digest and proposal ids; `recordedAt`/`recordedFrom` are `datetime()` at commit.
- Apply claims `(:KsIntentMarker {intentId})` first. Same intent and plan digests → the recorded receipt (`duplicate`); different digests → `INTENT_CONFLICT`; in flight → `DUPLICATE_PENDING`. Statements and the receipt projection commit atomically; a failure rolls back and records a `failed` marker that a retry with identical bytes replaces.
- `partial` plans (held or rejected proposals) are refused unless the caller passes `allowPartial`; the receipt names every disposition.

## Alternatives rejected

- Letting agents emit Cypher for writes (the biotech-kg workflow): no schema-level validation, no kernel-rule enforcement, no idempotent receipts. It stays as the explicit baseline tool under a guard (`bks cypher`), for comparison runs.
- GraphQL mutations as the write surface: `@neo4j/graphql` mutations cannot mint Assertions, copy validity onto edges or enforce forbidden implications; the API stays a read surface for clients, mutations disabled by default.
