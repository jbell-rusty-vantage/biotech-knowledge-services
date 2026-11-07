---
name: biotech-kg-query
description: >-
  Use to read what the BellLabs biotech knowledge graph (Neo4j, schema v2 release) already holds: resolve
  identities (uid > identifier > exact name), read a card, neighbours, assertions, evidence traces, versioned history,
  reports, associations and status records, or answer a bounded graph question with a release catalog template or one
  governed parameterized Cypher 5 read. Produces a biotech-knowledge-read-result.v2 with status, query/result/receipt
  digests and the consistency mode; can persist a custody snapshot an ingestion intent cites as basis.snapshotRef.
  Never writes. Not for capture or canonical writes (biotech-kg-ingest), graph-global analytics (biotech-graph-analyze)
  or schema selection (biotech-schema-explore).
allowed-tools:
  - Bash(curl *)
  - Bash(node packages/kg-ops/dist/cli.js kg read *)
---

# biotech-kg-query v2

Surfaces (same service, same guarantees): executor HTTP `POST /kg/read` (typed v2), `POST /kg/read/cypher`,
`POST /kg/read/explain`, `GET /kg/catalog/templates`, `GET /describe`; MCP `kg_read_v2`, `kg_read_cypher`,
`kg_read_explain`, `kg_catalog_templates`. Reader token required (`x-api-key`). Contracts: `biotech-knowledge-read-intent.v2`,
`biotech-cypher-read-intent.v1`, `biotech-knowledge-read-result.v2`, values `bks-read-values.v1`.

**Overrides before any vendor skill** (state them before you load `neo4j-cypher-skill` or `neo4j-query-tuning-skill`;
see `references/vendor-overlay.md`): Cypher 5 only (`CYPHER 5` allowed, `CYPHER 25` and GQL clauses never); the schema
authority is the pinned release / `biotech-schema-context.v1`, not `db.schema.*` (the live graph still holds legacy
v0 records); `elementId()` is not identity, `uid` is; READ routing is not read-only enforcement; the vendor write,
MERGE, LOAD CSV, APOC and GDS examples do not apply.

## Trigger / non-trigger

Trigger: identity resolution; facts, history, evidence, provenance, report or status reads; a bounded question a
template or one read answers; a read-before-write basis for ingestion. Non-trigger: writes of any kind, capture, DDL,
graph-wide ranking / similarity / communities, schema design.

## Procedure (6 steps)

1. **Context and scope.** `GET /describe`: check `releaseId`, `schemaReleaseDigest`, `queryCatalogDigest`, your
   `read.typed` bindings (`default` = scope public; `internal` needs grant `read.internal`) and whether `read.cypher`
   is advertised (only when a proven read-only database principal exists). Take node/relationship choices from
   biotech-schema-explore. Resolve before you search: `resolve` with every identifier first; names never establish
   identity; `resolution: ambiguous|candidate` means present candidates, never pick one.
2. **Choose the route.** Familiar task -> typed operation (matrix: `references/typed-operations.md`) or a catalog
   template (`GET /kg/catalog/templates?questionId=`). New question -> draft ONE parameterized Cypher 5 read
   (`references/cypher-artifact.md`). Say the endpoint types, stored direction, and the provenance / temporal
   conditions you intend before running it.
3. **Validate.** Pin `pins.schemaReleaseDigest` from `/describe`. Templates: cite `{id, statementDigest}` and give every
   declared parameter. Ad hoc: declare `parameterSchema` for every `$param`, `resultSchema.columns`, `ordering`
   (`statement` needs a final ORDER BY), budgets. Run `POST /kg/read/explain` when unsure: it returns the policy
   verdict (labels, types, functions, procedures) and the server plan. A refusal is final: rewrite the read; never
   reach for a raw-write or baseline tool because policy said no.
4. **Execute and read the status honestly.** `ok`; `empty` (no visible record: the only "none" answer); `truncated`
   (a prefix: row cap with a one-row overflow probe, byte cap, or a list cut to `listCap`; narrow or page);
   `failed` (TIMEOUT, NESTING_CAP, DATABASE_ERROR, PARSE_REJECTED, RESULT_SCHEMA_MISMATCH); `skipped` (not executed:
   concurrency, earlier part aborted); `unsupported` (vectors, GDS, ontology expansion artifact absent, no read-only
   principal); `stale` (release / catalog pin mismatch, graph revision kept moving); `forbidden` (scope, label,
   property, procedure, write, whole-entity return). Only `empty` means absence. Cookbook: `references/status-cookbook.md`.
5. **Trace claims, not graph shapes.** For any fact: Assertion -> HAS_EVIDENCE {role, origin} -> SourceLocator ->
   SourceSnapshot <- Source, plus Adjudications (ASSESSES) and the asserter (ASSERTED_BY) and lineage
   (WAS_GENERATED_BY Activity.runId). `status: ACCEPTED` is capture fidelity, not truth; support lives on SUPPORT
   Adjudications; disagreement between asserters is preserved (report both). Use `gaps` and `evidenceState`
   (CURRENT / HISTORICAL / REVISED / UNKNOWN). Status records never imply other statuses (`notImplied`, PR-01).
   Recorded time and valid time are independent; null bounds are unknown, never "ongoing" (`references/patterns.md`).
6. **Return identities.** Report `digests.queryDigest`, `digests.resultDigest`, `digests.receiptDigest`,
   `consistency.mode` and `graphRevision`. For ingestion, read with `consistency.mode: stable_revision` and
   `persistSnapshot: true`, then cite `snapshot.ref` + `snapshot.bytesDigest` as `basis.snapshotRef`. A bookmark is
   causal ordering, not a historical replay; replay reads the retained snapshot bytes.

## Typed operations (biotech-knowledge-read-intent.v2)

| op | input | returns |
|---|---|---|
| `resolve` | `mentions[{mentionId, nodeType?, uid?, name?, identifiers[{scheme,value,issuer?}]}]`, `identifierChain` | candidates with `basis` (uid / identifier / name_exact), `score`, `rank`, `resolution`, open identifiers (KN-07 chain) |
| `card` | `uid` | release properties of the type, labels, open identifiers, visible relationship counts |
| `list` | `nodeType`, `where{prop: value}`, `after`, `limit` | nodes ordered by uid (keyset page: pass the last uid as `after`) |
| `neighbors` | `uid`, `relationshipTypes[]`, `direction`, `view{recordedAsOf?, validAt?}` | type, direction, node summary, episode fields, `validityClass` |
| `assertion` | `assertionUids[]` or `about{uid, role, predicate?}`, `includeSuperseded`, `view` | assertion, subject, object, asserter, evidence chain, adjudications, generatedBy, derivedFrom, occurrenceOf, `statusMeaning`, `gaps` |
| `evidence` | `uid` of an Assertion / Adjudication / Assessment / Report | edge {role, origin, authority, ...}, locator, snapshot, source, later captures, `evidenceState` |
| `history` | `uid`, `relationshipType` (e.g. HAS_LABEL_VERSION), `view` | every episode open and closed, authorizing assertion, `recordedState`, `currentAtRecordedAsOf`, `validityClass` |
| `report` | `reportUid` | report, about, cited assertions / assessments, quoted locators, composing Activity, items, `sentenceTrace` (KN-11 ledger) |
| `association` | `anchorUid`, `expansion?` | D10 Associations (derived, never sourced facts); MONDO expansion is `unsupported` until a mapping artifact ships (MD-D2-03) |
| `status` | `uid`, `view` | LegalStatus records via STATUS_OF episodes, establishing records, `notImplied` (MD-D10-05) |

### Official or consequential use (biotech-knowledge-read-intent.v3, SV-11)

When the answer will be used officially (publication, a decision, an export), send `schemaVersion: biotech-knowledge-read-intent.v3` with `use: {officialUse: true, useName, audience}` to the same `POST /kg/read` (MCP `kg_read_v3`). The v3 operations are the v2 operations plus `marker` (`dispatchId` | `markerDigest` | `effectKey`, scoped to your principal). Every `report`, `assertion` and `marker` row is revalidated against the Knowledge Services authority (use decision digest, supersession, expiry, invalidation, revocation epoch): ineligible rows are excluded and listed in `eligibility.items`; when the authority is unavailable the part is `skipped` with `READ_AUTHORITY_UNAVAILABLE` and nothing is served as eligible. Read `eligibility.state` (`eligible | revoked | stale | authority_unavailable`) before using the rows; a graph row without an admitted use decision is `unadmitted`, never official.

## Cypher artifact (biotech-cypher-read-intent.v1), minimum

```json
{ "schemaVersion": "biotech-cypher-read-intent.v1", "intentId": "lv-uids-01",
  "pins": { "schemaReleaseDigest": "<from /describe>" }, "purpose": "Label versions of a package",
  "statement": "MATCH (p:Package {uid: $uid})-[:HAS_LABEL_VERSION]->(v:LabelVersion) RETURN v.uid AS uid ORDER BY uid LIMIT $limit",
  "parameters": { "uid": "hu:package:<id>", "limit": 25 },
  "parameterSchema": { "uid": { "type": "string", "pattern": "^hu:" }, "limit": { "type": "integer" } },
  "resultSchema": { "columns": [{ "name": "uid" }] }, "ordering": "statement",
  "limits": { "rowCap": 25, "byteCap": 262144, "timeoutMs": 5000 }, "consistency": { "mode": "observed" } }
```

Accepted subset: MATCH / OPTIONAL MATCH / WHERE / WITH / UNWIND / RETURN / ORDER BY / SKIP / LIMIT / UNION, read
CALL {} subqueries, EXISTS / COUNT / COLLECT subqueries, comprehensions, CASE, named map projections, bounded
variable-length (`*1..n`, n <= maxDepth), pure functions, `db.index.fulltext.queryNodes` on release indexes. Every node
pattern carries a release label (or re-uses a labelled variable in scope); every relationship pattern names release
types. Refused: writes, LOAD CSV, USE, admin/SHOW, CALL {} IN TRANSACTIONS, other procedures, `properties()`,
`keys()`, `elementId()`, `{.*}`, `n[$k]`, whole node/relationship/path returns, operational labels (Ks*, LegacyV0*),
MIGRATED_FROM, restricted span text (`SourceLocator.exact/prefix/suffix/selectorJson`) in scope public.

## Limits

Ceilings: rowCap 2000, byteCap 4 MiB, timeoutMs 30000, maxDepth 6, listCap 1000, nestingCap 8; defaults 100 / 1 MiB /
10000 / 4 / 200 / 6. Concurrency 8 per service, 4 per principal (`skipped` beyond). PROFILE is not available on the
read routes (benchmark harness only); EXPLAIN is not a correctness or cost certificate.

Shape limits (an artifact outside them is refused at parse, `BKS_PARSE_REJECTED`): at most 20 operations per intent; a
`resolve` takes at most 50 mentions (split larger batches) and 20 identifiers per mention, `limitPerMention` <= 25;
`opId` and `mentionId` are lower case, `^[a-z0-9][a-z0-9._-]{0,63}$`; uids are `hu:<token>:<opaque>`. Every mention
needs a uid, an identifier or a name: a `name` without `nodeType` fans out over every Entity-labelled type, capped at
`limitPerMention` per mention (`truncated` when more exist); a uid without a release token needs `nodeType`.
Per-operation `limit` ceilings: `list` <= 500 (keyset-page with `after` beyond), `neighbors` <= 500, `assertion`,
`evidence`, `history`, `association`, `status` <= 200; `rowCap` still caps every part.

By design, database-wide counts of legacy (`LegacyV0*`) or operational (`Ks*`, `MIGRATED_FROM`, foreign) records are
not measurable through governed reads: typed reads, templates and Cypher artifacts never see them, and on the reader
roles the database hides them too. Such inventory belongs to the migration/operator route (biotech-graph-ops).

## Failure and recovery

Release mismatch -> re-read `/describe`, re-pin. `CATALOG_MISMATCH` -> re-fetch the template. `STALE_REVISION` ->
the graph kept changing; retry later (a new observation). `TIMEOUT` / `truncated` -> narrow the anchor, lower depth,
page. `READ_AUTHORITY_UNAVAILABLE` -> no proven read-only principal: use typed reads or templates.
`VISIBILITY_UNPROVEN` -> the binding cannot prove the scope in the database: use typed reads (scope compiled in).

## Examples

Executable against the fixture graph (`examples/examples.json`, run by
`packages/kg-ops/src/read/read.integration.test.ts` and `read-enterprise.integration.test.ts`): resolve by identifier with chain, provenance trace of
a claim occurrence (two asserters disagree), label-version history as of two recorded times, report trace, evidence
states, an artifact accepted and three refused (write, procedure, unlabelled pattern), a truncated read, a measured
advanced read (`references/advanced-examples.md`). References: `references/typed-operations.md`,
`references/cypher-artifact.md`, `references/patterns.md`, `references/status-cookbook.md`,
`references/serialization.md`, `references/vendor-overlay.md`, `references/advanced-examples.md`.
