# Inspection, research and evidence limits

Inspected 2026-10-11. This document distinguishes source observations, historical measurements, new design choices and unperformed runtime verification. Official documentation was opened during research; installation-specific version support must still be checked by the implementation team.

## 1. Repository observations

| Source | Finding used in this packet |
| --- | --- |
| [Repository contract](../../../AGENTS.md) | Schema design promoted upstream; pinned/generated files are not hand-authored; pure planner and single apply transaction; no commit/push requested |
| [Candidate SDL](../../../schema/program/final/schema/final_biotech_schema_v2.graphql), [manifest](../../../schema/program/final/schema/final_biotech_schema_v2.graphql.manifest.json) | Actual SDL hash agrees with assembly manifest: c7cf1235…; this is the selected design baseline |
| [Current PIN](../../../schema/pinned/PIN.json) | Runtime input still names the original proposal, hash 8313a6f8…; v2 is not yet pinned by this work |
| [Migration analysis](../../../schema/program/final/migration-notes.md) | Existing planner fails candidate intents, sidecars mismatch, validation params/DDL need regeneration, seven legacy edges lack mappings; early report hashes predate final closeout |
| [Size report](../../../schema/program/final/size-report.md) | Historical candidate: 69 nodes, 106 relationship types, 181 collapsed/848 expanded pairs, 960 input types, 1,743,672 executable bytes; five deprecated exclusions: 732,065 bytes. Not measured again here |
| [Open questions](../../../schema/program/final/open-questions.md) | 160 actual distinct row IDs, including closeout additions; header counts stale. All are covered once in this packet |
| [Final patterns](../../../schema/program/final/query-patterns.md), [question catalog](../../../schema/program/final/questions-catalog.md) | Query and fixture coverage has multiple historical stages; final acceptance must regenerate against the chosen release, not use the earliest report verbatim |
| [Node register](../../../schema/program/final/node-register.yaml), [relationship register](../../../schema/program/final/relationship-register.yaml), [verdict rules](../../../schema/program/final/vocabularies/verdict-lattice.yaml) | Executor permissions, temporal/projection and capture-fidelity semantics must survive generation; SDL alone is not the whole operational contract |
| [Workspace loader](../../../packages/schema-workspace/src/load.ts), [builder](../../../packages/schema-workspace/src/build.ts), [renderer](../../../packages/schema-workspace/src/render.ts) | Old filename/fragment assumptions; sidecars validated before render; useful progressive layers already exist |
| [Search](../../../packages/schema-workspace/src/search.ts), [slice](../../../packages/schema-workspace/src/slice.ts), [CLI](../../../packages/schema-workspace/src/cli.ts) | Deterministic lexical ranking and endpoint closure already ship; structured/semantic/traversal extensions should build on them; verify must inspect actual files |
| [Read contracts](../../../packages/contracts/src/read.ts), [ingest contracts](../../../packages/contracts/src/ingest.ts), [digest](../../../packages/contracts/src/digest.ts) | Versioned Zod types exist; schema/snapshot/clock/canonicalization upgrades need JSON Schema and Python parity |
| [Read executor](../../../packages/kg-ops/src/read.ts), [Cypher baseline](../../../packages/kg-ops/src/cypher.ts) | v1 evidence paths and timing-dependent result hash; baseline caps after materializing rows |
| [Planner](../../../packages/kg-ops/src/plan.ts), [apply](../../../packages/kg-ops/src/apply.ts) | Current trusted-plan, replay, failed-marker, scope and concurrency gaps must be repaired before production v2 writes |
| [HTTP executor](../../../apps/executor/src/index.ts), [MCP executor](../../../apps/executor/src/mcp.ts) | Existing schema/native tools can be extended; raw baseline write and optional auth require capability-specific production boundaries |
| [GraphQL server](../../../apps/graphql-api/src/server.ts), [limits](../../../apps/graphql-api/src/limits.ts), [package](../../../apps/graphql-api/package.json) | Apollo/Neo4j GraphQL, shared printer/server builder, default/maximum limits, depth/cost/time/body controls already exist; empty deprecation exclusions, fallback SDL and startup DDL need change |
| [Mission Control boundary ADR](../../../docs/architecture/0004-mission-control-boundary-and-run-identity.md) | Intent/plan/receipt and one-Activity-per-run direction already documented; not proof general integration is deployed |
| [Evaluation harness](../../../evals/baseline-comparison/README.md) | Comparative evaluation structure exists; no recorded run establishes reliability |
| [Fly skill](../../../.agents/skills/fly-ops/SKILL.md) | Canonical flyctl wrapper, app/config and operational rollout guidance; old memory/startup numbers require v2 remeasurement |

The hash in the candidate migration report's introduction is stale relative to the assembled final candidate. This packet verified the actual file and manifest rather than treating that earlier text as authority. The pnpm lockfile digest at inspection was `dcee4393460e5bde37d9b3e8821433c9420af0e90fe72b9ba301a6f7cca3d68a`; release qualification must record its own dependency identity.

## 2. Existing platform direction

| Source | Architectural implication |
| --- | --- |
| [Platform specification](../../../../../platform/knowledge-services/docs/specs/belllabs-knowledge-platform/SPECIFICATION.md) | Four owners; native database semantics; current PostgreSQL bindings are not magically generalized by repository move |
| [Consumer/native boundary ADR](../../../../../platform/knowledge-services/docs/architecture/0014-product-graphql-and-native-agent-access.md) | GraphQL serves web/Expo; current and planned product-facing agents use native tools |
| [Native retrieval ADR](../../../../../platform/knowledge-services/docs/architecture/0015-native-retrieval-and-embedding-decision-gates.md), [native detail](../../../../../platform/knowledge-services/docs/specs/belllabs-knowledge-platform/NATIVE-RETRIEVAL-INGESTION.md) | Cypher artifacts are an explicit viable read choice; write determinism is more than fixed text; bookmarks are not historical snapshots |
| [GraphQL client plan](../../../../../platform/knowledge-services/docs/specs/belllabs-knowledge-platform/GRAPHQL-CLIENT.md) | Exact executable client, bounds/union caveat, authorization and measured Fly resource tuning already required |
| [Native delivery ADR](../../../../../platform/knowledge-services/docs/architecture/0012-native-delivery-and-reconciliation.md) | Operational outbox and native marker reconcile without distributed transaction |
| [Schema/read/ingest concept](../../../../../platform/knowledge-services/knowledge/schema-read-and-ingestion.md) | Existing AI Engineer SQL read catalog, migration head, repeatable-read snapshot and ingestion are native semantics to preserve |
| [Mission Control specification](../../../../../platform/mission-control/mission-control-general/general-mission-control/SPECIFICATION.md), [knowledge annex](../../../../../platform/mission-control/mission-control-general/general-mission-control/expansion/KNOWLEDGE-SERVICES.md) | `mc.knowledge_request.v1`, scoped capability/effect identity, domain-owned writes/custody and receipt-first uncertain recovery are already specified |
| [Mission Control current boundary](../../../../../platform/mission-control/docs/knowledge/knowledge-services.md) | Optional Biotech code implements grounding/reads, not the complete general knowledge writer/receipt adapter |

The old AI Engineer Mission Control/research-ingestion names in some historical READMEs are not new service targets. All work packages use canonical `platform/mission-control`, `platform/knowledge-services` and domain repositories. This packet does not override the AI Engineer db-contract migration authority or the platform's final two-application-fixture gate.

## 3. Official research and selected consequences

The following are primary references. Statements about project thresholds, topology, fusion weights, fixtures and rollout policy are **our design choices**, not recommendations claimed to come from the providers.

| Reference | Verified point and design consequence |
| --- | --- |
| [Neo4j GraphQL optimization](https://neo4j.com/docs/graphql/current/optimization/) | Disabling generated deprecated fields is a supported schema-size optimization. Adopt all five after client operation migration. |
| [Neo4jGraphQL feature settings](https://neo4j.com/docs/graphql/current/neo4jgraphql-class/) | Features include deprecation exclusions and bounded-query helpers; confirm availability in installed version before use. |
| [Avoid unbounded queries](https://neo4j.com/docs/graphql/current/security/avoid-unbounded-queries/) | Node/interface limits and required-limit/complexity controls support bounded API design. Verify generated execution and cover unsupported shapes with operation policy. |
| [JWT configuration](https://neo4j.com/docs/graphql/current/security/configuration/) | Verified token configuration is distinct from putting a token string in context. Bind BFF identity and actor scope explicitly. |
| [JavaScript transactions](https://neo4j.com/docs/javascript-manual/current/transactions/) | Sessions/transactions and retry behavior require disciplined use; routing READ is not access control. Enforce reader privileges and stable external effects. |
| [Concurrent data access](https://neo4j.com/docs/operations-manual/current/database-internals/concurrent-data-access/) | Neo4j read committed and locking semantics do not justify PostgreSQL-style repeatable snapshots. Introduce a tested native writer fence and honest read modes. |
| [Cypher language selection](https://neo4j.com/docs/cypher-manual/current/queries/select-version/) | Cypher 25 introduced in Neo4j 2025.06. The vendored 2025.01 claim cannot govern this service's 5.26 queries. |
| [AGA client](https://neo4j.com/docs/graph-data-science-client/current/aura-graph-analytics/) | Remote write-back can batch in multiple transactions. Analytical outputs need artifacts and controlled projection admission, not canonical fact bypass. |
| [OpenAI retrieval guide](https://developers.openai.com/api/docs/guides/retrieval) | Managed retrieval offers ranked chunks/filtering, asynchronous indexing and eventual file removal. Use immutable generations and local validation. |
| [OpenAI Vector Store creation](https://developers.openai.com/api/reference/resources/vector_stores/methods/create) | Exposed creation contract configures files/chunking/metadata, not an arbitrary chosen embedding model. Keep managed schema indexing separate from explicit Neo4j data embeddings. |
| [OpenAI Vector Store search](https://developers.openai.com/api/reference/resources/vector_stores/methods/search) | Direct search accepts query, filters, result count and ranking/rewrite options. It suits a schema lookup service without an answer model. |
| [OpenAI embeddings guide](https://developers.openai.com/api/docs/guides/embeddings) | Explicit embeddings are a separate API/model contract; text-embedding-3-small has a 1,536-dimension default. Native Chunk use still needs a pinned profile and task evaluation. |

No source here establishes the user's current Aura tier, availability of GDS/AGA, provider access, billing arrangement, live graph contents, source licences or current clinical/regulatory facts. S0/S8 and provider-specific evidence gates obtain those facts. This plan deliberately uses truthful unknown/unavailable states instead of assumptions.

## 4. Validation performed for this packet

- Read owning repository instructions and inspected targeted implementation/planning/skill files. Dedicated requested subagent assessed Neo4j skills and native execution risks.
- Recomputed candidate SDL SHA-256 and compared it to the provided assembly manifest; recorded current pin and source-question identity.
- Parsed decision IDs from the current question file and this ledger: all 160 present exactly once, no extra or missing IDs.
- Checked local Markdown file links and packet formatting after writing; reviewed architectural consistency and current-versus-target language.
- Preserved pre-existing dirty README/deployment edits. Only the new standalone planning directory is authored by this task.

Not run: application/unit/integration tests, schema generation/pinning, EXPLAIN/PROFILE, live database queries, load tests, paid OpenAI calls, uploads/store creation, Fly operations, migrations, deployment, commits or pushes. Existing benchmark/fixture claims are attributed to their reports rather than presented as fresh proof.
