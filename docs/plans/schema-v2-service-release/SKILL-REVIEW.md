# Neo4j skill review (S8)

Date: 2026-10-11. Reviewer: S8 migration / independent qualification. Scope: the 29 vendored `neo4j-*-skill` folders
(upstream `neo4j-contrib/neo4j-skills` snapshot `9005c19`, MIT, unmodified) and how first-party Biotech skills route to
them. Machine form: [`.agents/skills/skill-routing.json`](../../../.agents/skills/skill-routing.json) (`bks-skill-routing.v1`,
draft; the lead binds `skillBundleVersion` and release identities in S9). Check: `node scripts/migration/skill-digests.mjs --check`.

## 1. Byte identity of the vendored skills

All 153 files under `_vendor-neo4j/` and the 29 `neo4j-*-skill/` folders were hashed before any S8 work and again after
the last S8 edit; `diff` of the two `sha256sum` lists is empty (byte-identical). Per-skill digests in
`skill-routing.json` use: sha256 over the `LC_ALL=C`-sorted lines `<file sha256>  <relative path>` (the same value as
`find . -type f | LC_ALL=C sort | xargs sha256sum | sha256sum` inside the folder). `--check` recomputes all 29.

## 2. Tested version matrix

| Component | Local disposable, Community | Local disposable, Enterprise eval | Production target |
| --- | --- | --- | --- |
| Neo4j | 5.26.31 community (`neo4j:5.26-community`, `sha256:c7d25c0e...`) | 5.26.31 enterprise, `NEO4J_ACCEPT_LICENSE_AGREEMENT=eval` (`neo4j:5.26-enterprise`, `sha256:02d30e0a...`) | 5.27-aura enterprise (Aura instance, READ-only in S8) |
| Cypher | 5 (`CYPHER 5` prefix accepted) | 5 (`CYPHER 5` accepted) | 5 and 25 offered; **release baseline 5** (TL-03) |
| APOC | core plugin 5.26.31 | core plugin 5.26.31 | 2026.09.0 (162 procedures) |
| GDS | absent | absent | installed (454 procedures; `gds.version()` = "Aura Graph Analytics is versionless."), **not admitted** (OD-22) |
| GenAI | absent | absent | 1 `genai.*` procedure; not admitted |
| Roles | none (Community) | RBAC proven (`rehearse-principals.mjs`, 10/10) | admin principal only today; `bks_*` principals created by the lead before S9 |
| JS driver | neo4j-driver 6.2.0 (repo) | same | same |

What was exercised on each: export (Aura, READ), restore and verify (both local editions), migration dry run with all 47
invariants (both local editions), principal separation (Enterprise eval). Nothing was run against Aura except READ
sessions.

## 3. Compatibility overrides first-party guidance must state before loading a vendor reference

| Id | Vendor guidance | Release rule |
| --- | --- | --- |
| OV-CYPHER-VERSION | `neo4j-cypher-skill` (v1.0.27): "`CYPHER 25` — first token"; compatibility "Neo4j >= 2025.01 (safe baseline); Cypher 25". Also used by getting-started, vector-index, import, query-tuning, genai, graphrag, migration, document-import, spark | Cypher 5 only; `CYPHER 5` prefix allowed, `CYPHER 25` never. GQL clauses `LET`, `FINISH`, `FILTER`, `INSERT`, `SEARCH`, `DISJOINT BY` are unavailable on 5.26/5.27 until upgrade qualification |
| OV-SCHEMA-SOURCE | `neo4j-cypher-skill`: "`<db-name>-schema.json` anywhere in project → read directly ... skip live inspection"; otherwise `db.schema.*` | schema authority is the release-bound `biotech-schema-context.v1` from the pinned workspace. Live introspection diagnoses drift only. (The live graph is the legacy v0 shape until migration, so introspection would actively mislead) |
| OV-GENERIC-WRITES | MERGE/CREATE/SET/DELETE/DETACH DELETE/LOAD CSV examples (cypher, import, getting-started, spring-data, document-import, graphrag, kafka, spark) | generic MERGE encodes no Biotech identity/evidence/episode semantics; DELETE examples are not ingestion procedures; canonical writes go intent -> plan -> apply; migration goes through `biotech-graph-ops`; legacy data is never deleted |
| OV-ELEMENT-ID | `elementId()` used as an address (cypher, driver-javascript, kafka, migration, modeling, query-tuning) | not durable identity: every elementId changed across the S8 restore (map files in custody). Domain identity is `uid`; legacy rows are matched by their durable legacy key |
| OV-GDS-WRITEBACK | `gds.<algo>.write`, AGA write-back (gds, aura-graph-analytics, snowflake, getting-started) | not a fact writer (AGA writes concurrent batches, one transaction each). Stream or mutate, seal an artifact, publish through an admitted derived-projection intent; not admitted now |
| OV-READ-ROUTING | READ access mode / `executeRead` as "read-only" | routing is not enforcement; the principal (`bks_reader`) plus executor checks enforce it (a WRITE-routed session as `bks_reader` was denied with `Neo.ClientError.Security.Forbidden`) |
| OV-CONFIRM-WRITES | "confirm with the user before every write" | does not create an approval gate in an already-authorized admitted workflow |
| OV-VECTOR-SEARCH | `SEARCH` clause (vector-index: "requires 2026.01+"), `ai.text.*`, `db.index.vector.*` | native data vectors disabled (OD-44 recorded, not served); schema semantic search is the OpenAI Vector Store route, never a Neo4j vector skill |
| OV-OPERATOR-ONLY | provisioning, user/role DDL, `neo4j-admin`, bulk import | operator capability with separate credentials; never loaded into knowledge agents; no Aura API client credentials in this environment |

## 4. Per-skill decisions

`keep-for-role` = loaded on demand by the named first-party route after its overrides; `not-loaded` = not routed by any
Biotech agent in this release (the files stay vendored, unmodified).

| Vendored skill | Version | Decision | Route(s) | Reason |
| --- | --- | --- | --- | --- |
| neo4j-agent-memory-skill | 1.0.7 | not-loaded | none | agent memory product is out of scope; would add an unrestricted write channel |
| neo4j-aura-agent-skill | 1.0.4 | not-loaded | none | Aura Agents unused; needs Aura API credentials that do not exist here |
| neo4j-aura-graph-analytics-skill | 1.0.11 | keep-for-role | analytics.graph | AGA sessions for admitted analytics only; OV-GDS-WRITEBACK; disabled this release |
| neo4j-aura-provisioning-skill | 1.0.5 | keep-for-role | operations.graph | operator reference; no Aura API credentials; OV-OPERATOR-ONLY |
| neo4j-cli-tools-skill | 1.0.15 | keep-for-role | operations.graph | cypher-shell, docker, neo4j-admin for rehearsals |
| neo4j-cypher-skill | 1.0.27 | keep-for-role | read.familiar, read.advanced, write.canonical, baseline.raw-cypher | the main Cypher reference, under OV-CYPHER-VERSION / OV-SCHEMA-SOURCE / OV-GENERIC-WRITES / OV-ELEMENT-ID |
| neo4j-document-import-skill | 1.0.6 | not-loaded | none | document capture is the Knowledge Services lane; generic chunk writes conflict with D9 Chunk and the live KS constraints |
| neo4j-driver-dotnet-skill | 1.0.7 | not-loaded | none | no .NET code |
| neo4j-driver-go-skill | 1.0.7 | not-loaded | none | no Go code |
| neo4j-driver-java-skill | 1.0.12 | not-loaded | none | no Java code |
| neo4j-driver-javascript-skill | 1.0.6 | keep-for-role | engineering.graphql, operations.graph | the repo and the S8 scripts use neo4j-driver 6.2.0 (byte[] is `Int8Array`, lossless Integer) |
| neo4j-driver-python-skill | 1.0.9 | not-loaded | none | the Python client talks HTTP to the executor, not Bolt |
| neo4j-gds-skill | 1.0.18 | keep-for-role | analytics.graph | embedded GDS present on Aura; gated, not admitted |
| neo4j-genai-plugin-skill | 1.0.7 | not-loaded | none | in-Cypher embedding/LLM calls are not admitted; OD-44 |
| neo4j-getting-started-skill | 1.0.6 | not-loaded | none | zero-to-app bootstrap with Cypher 25, generic writes and write-back |
| neo4j-graphql-skill | 1.0.5 | keep-for-role | engineering.graphql | `@neo4j/graphql` 7.x (repo 7.6.3); consumer lane only, no mutations |
| neo4j-graphrag-skill | 1.1.1 | keep-for-role | retrieval.native-vectors | only after separate qualification; route unavailable now |
| neo4j-import-skill | 1.0.11 | keep-for-role | write.canonical (engineering only), operations.graph | bulk adapter design and restore mechanics; never ordinary ingestion |
| neo4j-kafka-skill | 1.0.4 | not-loaded | none | CDC procedures exist (3) but no Kafka connector in scope |
| neo4j-mcp-skill | 1.0.2 | not-loaded | none | the official Neo4j MCP server would be a second unrestricted DB channel; the executor MCP is first-party |
| neo4j-migration-skill | 1.0.11 | keep-for-role | operations.graph | driver/Cypher version upgrades (e.g. a later Cypher 25 qualification); not data migration |
| neo4j-modeling-skill | 1.0.7 | keep-for-role | schema.navigate | only to interpret difficult schema meaning; the release schema stays authority |
| neo4j-nvl-skill | 2.0.0 | not-loaded | none | no visualization surface |
| neo4j-query-tuning-skill | 1.0.7 | keep-for-role | read.advanced, engineering.graphql | EXPLAIN/PROFILE when budgets are at risk |
| neo4j-security-skill | 1.0.11 | keep-for-role | operations.graph | Enterprise RBAC for the three principals (rehearsed) |
| neo4j-snowflake-graph-analytics-skill | 1.2.0 | not-loaded | none | no Snowflake |
| neo4j-spark-skill | 1.0.3 | not-loaded | none | no Spark/Databricks |
| neo4j-spring-data-skill | 1.0.5 | not-loaded | none | no Spring code |
| neo4j-vector-index-skill | 1.0.16 | keep-for-role | retrieval.native-vectors, operations.graph | legacy vector-index inventory only now; serving needs qualification |

Totals: 14 keep-for-role, 15 not-loaded.

## 5. Routing table

| Route | Entry skill | Trigger | Vendor dependencies (on demand) | Boundary | Capability |
| --- | --- | --- | --- | --- | --- |
| schema.navigate | biotech-schema-explore | choose types/identity/predicates/evidence paths | modeling | pinned workspace, no graph access | schema.search/get/slice |
| read.familiar | biotech-kg-query | typed/template reads | cypher (syntax traps) | typed native read | read.typed |
| read.advanced | biotech-kg-query (advanced mode) | new path/aggregation question | cypher, query-tuning if needed | bounded parameterized Cypher 5 read artifact | read.cypher |
| write.canonical | biotech-kg-ingest | record source-supported facts | cypher (plan reading), import (engineering only) | intent -> trusted plan -> apply | plan/apply/receipt.get |
| analytics.graph | biotech-graph-analyze | graph-global analytics | gds, aura-graph-analytics | projection/job -> artifact -> admitted projection | analytics: **unavailable** |
| engineering.graphql | biotech-graphql-maintain (S6, pending) | consumer projection, client, bounds | graphql, driver-javascript, query-tuning | engineering lane | n/a |
| operations.graph | biotech-graph-ops | export, restore, migration, DDL, roles | cli-tools, security, import, driver-javascript, migration, aura-provisioning, vector-index | operator, separate credentials | operator |
| hosting.api | fly-ops | Fly hosting | none | `bash scripts/fly.sh` | n/a |
| retrieval.schema-semantic | biotech-schema-explore (semantic) | unfamiliar phrasing | none | OpenAI adapter + local rehydration | schema.search:semantic |
| retrieval.native-vectors | biotech-kg-query | data/chunk vector retrieval | vector-index, graphrag | separately qualified profile | retrieve: **unavailable** |
| baseline.raw-cypher | biotech-cypher-baseline | isolated evaluation arm | cypher | disposable graph only | n/a |

## 6. Findings for other roles

1. `biotech-graphql-maintain` (S6) does not exist yet; `skill-routing.json` marks it pending.
2. Existing first-party skills (`biotech-kg-query`, `biotech-kg-ingest`, `biotech-schema-explore`) do not yet name the
   overrides above before vendor references; their owners (S2/S4/lead) should add a short override block mirroring
   section 3. S8 did not edit them.
3. The live Aura graph holds Knowledge Services existence constraints on `:Chunk` (`chunkId`, `chunkKey`, `index`,
   `text`) that the v2 D9 `Chunk` shape would violate. Any vendor chunk/document import guidance is therefore doubly
   unsafe until S1 DDL reconciles them (see OPTIONAL-CAPABILITIES.md).
4. Evaluations: the paired first-party-only versus vendor-enriched protocol is frozen in `evals/v2/protocol.md`; no LLM
   run has happened.
