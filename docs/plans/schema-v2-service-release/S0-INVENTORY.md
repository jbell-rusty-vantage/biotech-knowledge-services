# S0 inventory: actual state on 2026-10-11

Lead-authored, read-only inventory. Sanitized: no secret values, no raw production records. The full machine-readable inventory (labels, properties, indexes) is retained in protected custody at `runs/release-v2/custody/s0/aura-inventory.json` (gitignored), not in Git.

## 1. Baseline identity (verified)

| Item | Value |
| --- | --- |
| Candidate SDL | `schema/program/final/schema/final_biotech_schema_v2.graphql`, SHA-256 `c7cf1235dba876b26460c54a6510028d2dcfc65989787eacd5b446f9034b4793` (recomputed; matches `final_biotech_schema_v2.graphql.manifest.json`) |
| Module digests | kernel + D1-D13 recomputed; all 14 match the assembly manifest |
| Registers | `node-register.yaml`, `relationship-register.yaml` both stamp `sdl.sha256 = c7cf1235...`; `vocabularies/predicates.yaml` stamps the same digest (374 predicate entries: 286 registered, 35 proposed-new, 16 retired-by, 37 alias-of) |
| Decision ledger input | `open-questions.md` SHA-256 `ee1caf25...` (per DECISIONS.md), 160 entries |
| Current runtime pin | `schema/pinned/PIN.json` names `final_biotech_schema_proposal.graphql` SHA-256 `8313a6f8...` (v1, 935,817 B) plus operations/validation-params/modules.yaml. The loader hardcodes the v1 filename (`packages/schema-workspace/src/load.ts`) |
| Generated workspace | `workspace/` 1,394 files at fingerprint `sha256:72282103...`, rendererVersion 0.1.0, built from v1 |
| BKS commit | `main` @ `431c8a7c287ee3d914843390a080dbfbe949acdc`; dirty: `README.md`, `docs/deployment/graphql-api.md` (pre-existing, preserved), untracked `docs/plans/` (this packet) |
| biotech-meta | `main` @ `638aef572383062401b341802adcf01521136ff7`, clean; `docs/schema/` holds the v1 proposal, `catalog/schema.yaml`, `neo4j/*.cypher`, `ontology-lab/`; no AGENTS.md in that repository |
| platform/knowledge-services | `main` @ `28c44222...`, heavily dirty (user work in progress; untouched by this release) plus 5 retained maintenance worktrees |
| platform/mission-control | `main` @ `2d20f62f...`, heavily dirty (user work in progress; untouched by this release) |
| pnpm lockfile | present; dependency identity is recorded by S1 release qualification |

## 2. Repository build/test baseline (run 2026-10-11)

| Command | Result |
| --- | --- |
| `pnpm build` | passed (tsc project references) |
| `pnpm test` | passed: 4 files / 32 tests; 1 file / 4 tests skipped (integration, needs `BKS_INTEGRATION=1`) |
| `pnpm workspace:verify` | passed at v1 fingerprint (compares stored vs regenerated fingerprint only; does not hash each on-disk file: spec section 3.3 repair pending) |

Source size: contracts 821 lines, schema-workspace 2,708, kg-ops 2,468, executor 210, graphql-api 628 (TypeScript); Python client `python/biotech-knowledge-client` (httpx/jsonschema/pydantic, hatchling).

## 3. Toolchain and access (names only)

| Capability | State |
| --- | --- |
| Node / pnpm | v24.18.0 / 11.15.1 (packageManager pin) |
| Docker | 29.7.2, daemon up; local image `neo4j:5.26-community` present; enterprise evaluation image not yet pulled |
| flyctl | present at `~/.fly/bin/flyctl`; `scripts/fly.sh` resolves the token from `.env` |
| uv / Python | uv 0.12.23, Python 3.12.2 |
| `.env` (BKS) | defines `NEO4J_URI`, `NEO4J_AURA_*`, `OPENAI_API_KEY`, `FLY_TOKEN`, `GRAPHQL_API_KEY`, `SUPABASE_URL/JWKS_URL/SECRET_KEY/PUBLISHABLE_KEY`, `CLERK_*`, `OPENAI_HUMAN_UPGRADE_VECTOR_STORE_ID`, many unrelated keys. No Aura API client credentials (only instance id/name/user/password/query-api), so Aura console snapshots cannot be scripted from here |
| OpenAI | `GET /v1/models` 200 (133 models incl. `text-embedding-3-small`, `-3-large`, `ada-002`); `GET /v1/vector_stores` 200 with 0 existing stores |
| Fly | app `bks-biotech-graphql-api` (owner personal, region iad), 1 machine started, 1/1 checks passing, image `deployment-01M4E5VAVC97ZSGMPS9V44W2PB`, last deploy 2026-10-08; secrets set: `GRAPHQL_API_KEY`, `NEO4J_PASSWORD`, `NEO4J_URI`, `NEO4J_USERNAME`, `OPENAI_API_KEY`; vm 4 GB shared-2x, `NODE_OPTIONS=--max-old-space-size=3072`, `GRAPHQL_ENABLE_VECTOR=true`, introspection on |
| Executor / BFF deployment | none exists. No Fly app, container or binding for the executor or any BFF. Deployment targets for these must be created in S9 (new Fly apps) or explicitly left local-only with the gap recorded |
| Product app / client repos | none found in the workspace. GRAPHQL-CLIENT.md names TypeScript web and React Native/Expo as target consumers; no such app exists under `BellLabs/` (`aiengineer/agents_dashboard` is a Next.js app owned by AI Engineer, not a Biotech consumer). The BFF deliverable is therefore a reference BFF in this repository bound to the configured issuer (Supabase JWKS is configured in `.env`; Clerk keys also present but belong to AI Engineer surfaces) |

## 4. Live Neo4j (read-only inventory, database `neo4j`)

| Fact | Observation |
| --- | --- |
| Server | Neo4j Kernel `5.27-aura`, edition enterprise; Cypher versions `5` and `25` available |
| Instance | Aura, URI host `8032ec07.databases.neo4j.io`; databases: `neo4j` (standard, online, default), `system`. One user database only (Aura Pro): no second database can be created for a shadow graph on the instance |
| Principal in `.env` | role `console_admin_pro_8032ec07` + PUBLIC; grants include `user_management`, `assign_role`, `database_management`, `constraint`, `index`, `token`, match/write all properties on `neo4j`. Denied: `aura.*` and `gds.internal.*` procedures. Separate reader/writer/migrator principals can be created via Cypher by the lead |
| Procedures | 703: apoc 162 (incl. `apoc.export.*`), gds 454 (installed), genai 1, cdc 3, db 39, dbms 42, tx 2; 399 functions |
| Size | 210 nodes, 288 relationships, 468 property keys, 0 nodes with `uid`, 0 `KsIntentMarker` |
| Labels (19) | Biomarker 41, Person 36, CompoundForm 26, Product 23, Compound 19, ProductSnapshot 10, Listing 10, ListingSnapshot 10, TechnologyPlatform 7, RegulatoryStatus 6, LabTest 4, PanelDefinition 4, Organization 3, Event 3, PhysicalLocation 2, Study 2, Document 2, OrganizationSnapshot 1, BellLabsSchemaDeploymentEvidence 1 (operational) |
| Relationship types (25) | MEASURES 45 (LabTest to Biomarker), INCLUDES_BIOMARKER 38, CONTAINS_COMPOUND_FORM 27, HAS_SNAPSHOT 21, ADVISES 18, USES_PLATFORM 17, EMPLOYS 15, OFFERS 14, IMPLEMENTS 14, LISTS 10, LISTS_PRODUCT 10, IMPLEMENTS_PANEL 8, DELIVERS_LABTEST 7, DEVELOPS_PLATFORM 7, HAS_REGULATORY_STATUS 6, INVESTIGATED_BY 5, ABOUT 5, FOUNDED_BY 4, INCLUDES_LABTEST 4, REPORTED_IN 3, HAS_LOCATION 2, HAS_CEO 2, SPONSORED_BY 2, HAS_PRIMARY_SOURCE 2, AUTHORED_BY 2 |
| Shape | This is the legacy biotech-kg schema (`id`, `mongoResearchRunId`, `searchEmbedding` 1536-d arrays, `*Snapshot` state caches, `confidence/role/roleType` edge properties). It is not the pinned v1 proposal. The migration source is these 19 labels / 25 types, not the 192/393 v1 inventory assumed by `migration-notes.md`. The seven unmapped v1 edges (ABOUT_CONDITION and others) do not occur in live data; their dispositions remain policy for any future v1-shaped import |
| Indexes | 46 FULLTEXT/VECTOR indexes from the legacy schema (many on labels with 0 nodes), 24 constraints (Chunk/Document/DocumentTextVersion/Segmentation from the shared Knowledge Services ingestion), RANGE indexes on Organization/Product/Chunk/Document/Segmentation; all ONLINE. Legacy vector indexes `OrganizationSearchEmbedding`, `ProductSearchEmbedding` and others exist on `searchEmbedding` |
| Backup / restore | No Aura API credentials, so console snapshots cannot be triggered from this environment. Export-based backup is feasible and sufficient at this size: full streamed export (nodes, relationships, all properties, indexes, constraints) to protected custody with digests, restored into a disposable local Neo4j and count/digest-verified (Gate F). On-demand console snapshots remain an operator option outside this tooling |

## 5. Consequences adopted by the lead (S0 exit)

1. The migration source is the live legacy schema above. S8 maps the 19 legacy labels and 25 relationship types to v2 using the registers, with explicit per-label and per-edge dispositions. Legacy properties without a v2 home are retained on the legacy node or quarantined in the migration manifest; nothing is deleted.
2. Legacy nodes are preserved physically and excluded from v2 reads by construction. Default mechanism: after the verified export, legacy nodes are relabeled `LegacyV0_<Label>` and tagged `:LegacyV0 {legacyLabels, legacyExportDigest}`; v2 nodes are created with `uid` and v2 labels and linked by an operational `MIGRATED_FROM` relationship to their legacy node. Reverse mapping is relabeling back; recovery material is the export plus the manifest. S8 may propose an alternative with justification.
3. Legacy edges without source evidence become v2 Assertions with asserter = a `legacy-import` Agent, lifecycle `EXTRACTED` (captured, unadjudicated), evidence `HAS_EVIDENCE{role: CONTEXT, origin: DECLARED}` to a SourceLocator on a `Source{sourceKind: DATASET}` representing the legacy export (digest-identified). Structural-class v2 edges are created directly. No fabricated evidence, dates or verdicts; legacy `confidence` values are retained as source-stated extraction hints, never as support verdicts.
4. The shadow/staging graph is a disposable local Neo4j (Enterprise evaluation image for role and constraint parity, Community as fallback) loaded from the verified export. Production migration applies the identical migration manifests to Aura `neo4j` after rehearsal; the export is the rollback.
5. Principals: the lead creates `bks_reader` (read-only), `bks_writer` (executor, no DDL) and `bks_migrator` (DDL plus write) roles/users on Aura before S9 and proves them; integration tests prove role enforcement on the local Enterprise evaluation instance. Community edition has no roles; tests requiring real read-only authority must run on Enterprise.
6. Analytics: GDS is installed on the instance; AGA/GDS use remains optional and capability-gated (OD-22). Native data vectors remain disabled in this release (OD-44 profile recorded, not served). Product vector search is unsupported (explicit).
7. Consumer access: no product app exists; ship the generated client plus a reference BFF bound to the Supabase JWKS issuer configured in `.env`, with GraphQL verifying a short-lived BFF-signed actor context. Executor and BFF get new Fly apps in S9 if Gate G passes.
8. Protected custody for exports, receipts, backups and provider generation refs: `runs/release-v2/custody/` (gitignored). Secrets stay in `.env` and Fly secrets.
