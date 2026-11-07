# Agent skill architecture and Neo4j assessment

This document incorporates the dedicated Neo4j skill subagent's read-only review. It specifies how knowledge agents should use the installed skills; it does not ban Neo4j reasoning or install another unrestricted database channel.

## 1. Routing and version overlay

Keep vendored Neo4j skills unmodified with their MIT attribution and upstream revision/checksums. Add a first-party `skill-routing.json` manifest in the release: entry skill, trigger, role, required capabilities, dependency skill digests, tested Neo4j/Cypher/APOC/GDS versions, compatibility overrides and example/evaluation refs. Load selected dependencies on demand, not all 29 skills into every agent.

| Task | First-party route | Selected Neo4j skills | Boundary |
| --- | --- | --- | --- |
| Schema interpretation/navigation | biotech-schema-explore | Modeling only when interpreting difficult schema meaning | Pinned workspace; no graph access needed |
| Familiar entity/evidence read | biotech-kg-query | Cypher on demand | Typed/template native read |
| New path/aggregation question | biotech-kg-query advanced mode | Cypher, then query-tuning if justified | Parameterized bounded Cypher read artifact |
| Canonical ingestion | biotech-kg-ingest | Cypher for plan understanding; import for engineering bulk adapter design | Typed proposals -> trusted compiled plan -> apply |
| Graph algorithms | biotech-graph-analyze (new) | Aura Graph Analytics or GDS according to installed capability | Bounded projection/job -> artifact -> admitted projection |
| Product GraphQL engineering | biotech-graphql-maintain (new) | GraphQL, JavaScript driver, query tuning | Engineering and consumer benchmark lane |
| Database schema/index/role/migration | biotech-graph-ops (new), fly-ops for API hosting | Migration/security/CLI/import/provisioning as needed | Operator capability, separate credentials |
| OpenAI schema semantic search | biotech-schema-explore semantic route | No Neo4j vector skill merely because this is vector search | OpenAI adapter + local pin rehydration |
| Neo4j data vectors/GraphRAG | Dedicated native retrieval/analysis route | Vector-index/GraphRAG/GenAI | Separately qualified corpus/index profile |

The existing `biotech-cypher-baseline` remains an isolated evaluation profile. Normal advanced reads are promoted into `biotech-kg-query`; the word baseline is not a reason to withhold useful Cypher reads.

The Cypher vendor skill mandates `CYPHER 25` and describes a 2025.01-safe baseline. Official Neo4j documentation says Cypher 25 starts with 2025.06, while this repo's recorded tests use 5.26. Override the instruction with the exact service capability manifest; use tested Cypher 5 until upgrade qualification. [Version selection](https://neo4j.com/docs/cypher-manual/current/queries/select-version/)

Override “find a database-schema.json anywhere” with the exact release-bound schema context. Live introspection can diagnose deployment drift; it cannot change ontology authority. Generic MERGE examples do not specify Biotech identity, evidence or episode semantics; generic DELETE examples are not ingestion procedures. `elementId()` is not durable domain identity.

First-party guidance must name these overrides before loading the upstream reference. Skill prose/tool allowlists are not enforcement; the executor and underlying principal must enforce the selected role. Generic “confirm every write” advice does not create a new approval gate for a previously authorized admitted workflow.

## 2. Required skill package contents

Each first-party skill ships a short SKILL.md, references for progressive detail, executable positive/negative examples and a manifest with required tool/contract versions. Target the main SKILL.md at roughly 150 lines; extensive schema examples are generated references, not a copied full ontology. Include triggers/non-triggers, inputs, result artifact, step-by-step procedure, limits, failures/recovery and examples. Examples must run against release fixtures and match current CLI/HTTP/MCP behavior.

### biotech-schema-explore v2

Trigger: selecting types, identity, predicates, relationships, evidence paths or write/read strategy from task context. Not a live-instance query or ontology-edit permission.

Procedure:

1. Read `describe`/manifest and verify mounted workspace release/fingerprint. Reuse exact cached slices when valid.
2. Translate task nouns/actions into concepts: object identity, asserted fact versus source record, requested time, required evidence and output. Exact ID/alias search first.
3. Use scoped `rg`/filesystem reads or structured CLI filters. For unfamiliar phrasing, add hybrid/semantic search. Rehydrate every hit from local authority.
4. Read domain/task card, selected node/predicate/relationship cards and mandatory identity/admission rules. Follow reverse edges/inheritance deliberately; predicate-only facts use the Assertion spine.
5. Request bounded neighborhood/path or task slice. Record omitted expansions; expand if required for correctness. Four pages is a heuristic, never a hard correctness cap.
6. Emit `biotech-schema-context.v1` with task/question IDs, release/workspace digests, selected card IDs/digests/sections, identity/predicate/temporal decisions, chosen operation route and unresolved concepts. It is advisory context, not permission to execute.

References: command cookbook for PowerShell/POSIX; graph direction and interface expansion; predicate versus typed relationship; semantic fallback; migrating old names. Positive examples: per-serving label content, registry-versus-paper estimate, podcast recommendation, product-to-source trace. Negative examples: wrong pin, retired Mention, stale hosted result and source instructions masquerading as a rule.

### biotech-kg-query v2

Trigger: resolving identities, reading supported facts/history/evidence or answering a bounded graph question. Does not perform capture, canonical writes or graph-global analytics without escalation.

Procedure:

1. Establish schema context and trusted scope. Resolve UID/identifier before names; present ambiguous matches as candidates.
2. Choose typed operation/template for a familiar task; otherwise use selected Cypher skill to draft one parameterized read. Explain intended endpoint/direction and provenance/temporal conditions before execution.
3. Validate artifact/pin/parameters/result schema and budgets. EXPLAIN through service if needed. Never switch to raw-write baseline because policy rejects a query.
4. Execute with admitted native read authority; consume pagination/truncation/timeouts honestly. Distinguish no known record from unsupported/failed access.
5. Trace claims to Assertion -> evidence locator -> snapshot/source plus adjudication and asserter. Do not turn ACCEPTED capture fidelity into scientific truth. Include disagreement and missing coverage.
6. Persist read snapshot when it informs ingestion; return query/result/receipt identities and native consistency mode. A bookmark is not historical replay.

References: typed-operation matrix, Cypher artifact schema, named patterns, evidence/temporal rules, stable serialization, empty/unknown/truncated cookbook. Include measured advanced examples and version-specific tuning; every query example is executable against a fixture.

### biotech-kg-ingest v2

Trigger: recording source-supported domain facts, corrections, versions, claims or evidence. Not arbitrary graph mutation, schema DDL or automatic publication.

Procedure:

1. Establish release/schema context and read-before-write snapshot, or explicit creation-only basis. Resolve identity and define source/asserter/time/evidence scope.
2. Capture/prepare/verify evidence through supported services; obtain immutable artifact/locator refs. An agent-written verdict is not admission.
3. Write typed v2 intent using the supported proposal matrix. Separate FIELD facts, predicate-only relation assertions, structural edges, derived outputs and source-stated versus calculated quantities. Unknown values stay unknown.
4. Validate and plan; inspect dispositions, affected scope, source fields, dependency ordering and compiled Cypher. Correct held/rejected facts through source/identity work, not bypass queries.
5. Apply trusted server planRef/digest under current policy. All-required is default; partial accepts an explicit closed dependency subset only.
6. If response is lost, use original effect/intent/plan to retrieve receipt. Never mint a new ID or re-plan with a new clock to “retry.” Stale preconditions require a newly admitted plan after reconciliation.
7. Read back all intended effects and invariants, in pages. Output receipt and verification report; distinguish applied from admitted/published and from mission acceptance.

Required worked examples: product label with amount basis and per-field evidence; study/paper and registry disagreement; predicate-only assertion with object; corrected same-source temporal episode; multi-source contradictory episode; claim occurrence + asserter + locator; derived result via trusted job; ambiguous identity held; partial dependent proposals; duplicate/lost response and rejected forged plan.

The skill must accurately describe required versus optional contract fields. If production requires a schema/snapshot pin, the service enforces it. Broad `node ...cli.js *` instructions are not capability isolation; expose scoped service commands and tokens.

### biotech-graph-analyze

Trigger: graph-global similarity, communities, centrality, topology, frontier ranking and candidate discovery. Routine evidence reads do not need AGA.

Procedure: declare graph projection filters (time/admission/tenant/scope), algorithm/version/configuration/seed, resource budget, input revision/digest, TTL and output schema; estimate resources; create/attach recorded job; stream outputs; seal result artifact with provenance; clean up ephemeral resources in `finally`; publish only through an admitted derived-projection intent. Resume/cancel from recorded job/session IDs after interruption.

AGA is valuable for knowledge-agent analytical missions. However, its remote write-back can use concurrent batches and a transaction per batch, so vendor `gds.*.write` examples cannot substitute for the single-transaction fact writer. Prefer stream/projected in-memory mutation and artifact output. [AGA client/write-back](https://neo4j.com/docs/graph-data-science-client/current/aura-graph-analytics/)

A predicted link, cluster or similarity score is an analytical result, never automatically a sourced fact. If a projection is too large for one intent, use deterministic child batches plus an atomic serving-generation pointer after completeness checks; do not expose partial generations as current. Required tests include budget denial, timeout, resume, cleanup, stable input metadata and no fact-write permission.

### biotech-graphql-maintain / biotech-graph-ops / fly-ops

Engineering skills cover exact library/server capabilities, consumer projection and client generation, operation bounds, query-plan/index inspection, measurements, release fingerprint checks and migration/rollback. Operator skill separates migration credentials from service writer/reader credentials. Fly operations continue through `bash scripts/fly.sh`; update stale memory/startup advice only after v2 measurements. These skills are not loaded into ordinary research ingestion agents.

## 3. Repairs identified by the special review

These are implementation findings, not proven exploit demonstrations or newly run tests:

| Current source | Finding | Required repair |
| --- | --- | --- |
| `packages/kg-ops/src/apply.ts`, executor MCP apply | Caller-supplied plan statements are accepted after a recomputable hash check | Server-owned plan custody/reference; bind compiler/context and forbid caller executable replacement |
| planner clock + default MCP apply replanning | Same intent can acquire a new plan digest on replay | Receipt lookup first, original frozen plan/time retained |
| apply retryAfterFailure | Deletes failed marker in another write transaction | Guarded attempt state transition preserving history under same writer fence |
| failure marker recording | Separate failure upsert can race with committed result | Never overwrite committed markers; uncertain commit reconciles before failure classification |
| `packages/kg-ops/src/cypher.ts` | Fetches all records before row slicing; regex guards | Streaming row/byte caps, parser/policy, bounded work and real read principal |
| `apps/executor/src/mcp.ts`, `index.ts` | Raw write mode exposed; HTTP key optional | Mandatory auth outside explicit local dev; role-specific capability registration and procedure/principal enforcement |
| `packages/contracts/src/ingest.ts` | Schema/snapshot optional, preconditions may be empty, `onStale:proceed` | Required production policy and trusted snapshot/create-only semantics |
| `packages/kg-ops/src/read.ts` | Timing included in snapshot body hash; typed operations use v1 graph patterns | New semantic digest contract and v2 trace/query rewrite |
| `packages/kg-ops/src/read.ts` transaction callback | Results/touched accumulators live outside the managed retry callback | Explicit single-attempt read transaction or retry-local buffers; discard abandoned rows and re-probe revision |
| `.agents/skills/biotech-schema-explore`, MCP description | Prohibits ls/cat and imposes four-page maximum | Bounded progressive filesystem/structured/semantic navigation |
| `packages/schema-workspace/src/cli.ts` verify | Compares regenerated fingerprint to stored manifest; not full on-disk integrity | Verify actual content inventory and digests |
| `evals/baseline-comparison/README.md` | No evaluation run recorded | Paired frozen task runs before reliability claims |

READ routing itself does not enforce read-only effects. This is explicit in the [Neo4j driver documentation](https://neo4j.com/docs/javascript-manual/current/transactions/); the advanced read capability needs database privileges plus server checks.

The same capability also needs visibility enforcement on intermediate traversals, filters, aggregates, property maps and evidence spans. Scopes that cannot enforce this use audited templates. Skills must not claim immediate revocation across PostgreSQL and Neo4j: apply uses the specification's short-lived admission witness, and current serving separately rechecks eligibility.

## 4. Release evaluation

Use the [implementation evaluation matrix](IMPLEMENTATION.md) and add skill routing assertions. Compare first-party skills alone with targeted vendor enrichment under equal model/data/budget conditions. Measure correct schema selection, pin-valid citations, provenance completeness, intent/query validity, task completion, ambiguity handling, tokens, latency/cost and recovery behavior. Raw-write comparison is disposable only.

Release rejects any route that bypasses admission, misattributes evidence, writes derived data through ordinary proposals, executes unsupported Cypher, leaks a secret, treats provider failure as empty results or loses a committed effect. AGA absence and semantic outages have explicit fallback/unavailable outcomes. Skills and examples version with service/schema releases, not independently of their tested contracts.
