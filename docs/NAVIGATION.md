# Biotech service map

Verified against the local checkout on 2026-10-15. Canonical repository: `BellLabs/biotech/biotech-knowledge-services`. Read [../AGENTS.md](../AGENTS.md) and the [domain map](../../README.md).

This is **Biotech Knowledge Services**, the domain graph/schema/ingestion/API service. Shared **Knowledge Services** is `BellLabs/platform/knowledge-services`; general **Mission Control** is `BellLabs/platform/mission-control`. Folder names do not merge their contracts.

| Responsibility | Actual source / contract | Guide and boundary |
| --- | --- | --- |
| Schema discovery and retrieval | `packages/schema-workspace/src/cli.ts`; `schema/pinned/PIN.json`; `workspace/manifest.json`, `workspace/search/index.jsonl` | [Generated start](../workspace/START_HERE.md); [sidecar authority](../schema/sidecars/README.md). Pinned release v2.2.0: 69 node types, 106 relationship types. Counts describe schema possibilities, not live graph data. |
| Native ingestion and graph reads | `packages/kg-ops/src/write/`, `read/`, `admission/`; `packages/contracts/src/{intent-v2,plan-v2,apply-v2,read-v2,envelope}.ts`; `packages/contracts/json-schema/` | [Accepted boundary ADR 0005](architecture/0005-shared-boundary-and-mission-control-adapter.md); [release interfaces](plans/schema-v2-service-release/INTERFACES.md). Legacy `plan.ts`/`apply.ts` and v1 contracts coexist; select the endpoint's version deliberately. |
| Executor HTTP / MCP | `apps/executor/src/index.ts`, `mcp.ts`, `modules/`; `apps/executor/capabilities/biotech-knowledge.capability.json` | [Executor runbook](deployment/executor.md). Supports a bounded capability catalog; ADR 0005 lists unsupported logical interfaces. No live endpoint was queried by this navigation audit. |
| Consumer GraphQL API | `apps/graphql-api/src/main.ts`, `app.ts`, `projection.ts`, `registry.ts`; `apps/graphql-api/projection/`, `operations/`, `generated/` | [Specification](plans/schema-v2-service-release/SPECIFICATION.md), [GraphQL runbook](deployment/graphql-api.md). Reviewed bounded persisted operations and projection, distinct from native ingestion. |
| Product/user API BFF | `apps/product-bff/src/main.ts`, `app.ts`, `config.ts` | Reference BFF validates user sessions and entitlements, signs actor context, keeps service credentials server-side. Source exists; a frontend application was not found. The dated v2 release record ([RELEASE-MANIFEST](plans/schema-v2-service-release/RELEASE-MANIFEST.md)) reports the BFF undeployed; no fresh deployment check here. |
| GraphQL client | `packages/graphql-client/src/index.ts`, `compatibility.ts`, generated operation types | `packages/graphql-client/codegen.ts` binds reviewed operations to printed schema. Regeneration is a code task, not this navigation repair. |
| Mission Control integration client | `python/biotech-knowledge-client/` | [Client README](../python/biotech-knowledge-client/README.md); native contracts/envelope retain domain meaning. Platform adapter is under `platform/mission-control/integrations/biotech`. |
| Skills | `.agents/skills/skill-routing.json`, `.agents/skills/*/SKILL.md` | First-party `biotech-schema-explore`, `biotech-kg-query`, `biotech-kg-ingest`, `biotech-graphql-maintain`; read version/authority overlays before upstream Neo4j skill use. |

## Authority and historical status

Owner decision SV-D10 (2026-10-24) makes this repository the schema author. Source trees are `schema/source/biotech-schema-v2.1.0/` and `schema/source/biotech-schema-v2.2.0/`; `PIN.json` pins **biotech-schema-v2.2.0** (2026-10-25, Sprint V SV-11: `ReportKind.STUDY_APPRAISAL`, `useDecisionDigest`, `KsIntentMarker` dispatch/marker indexes; `schemaReleaseDigest sha256:2df9d3bc…5a74`) with provenance `sourceRepository: biotech-knowledge-services`. The Sprint OC W0 disposable reinstall installed its graph DDL and `KsReleaseMarker` on Biotech Aura `8032ec07` on 2026-10-28 ([W0 release bundle](../../../platform/mission-control/docs/specs/provider-consolidation-2026-10/sprint-oc/release/RELEASE-BUNDLE.md), installer `graph-release` `applied`); not re-verified live since, not qualified, and the Fly services were not redeployed. Change the schema in a new `schema/source/<release>/` and follow [schema/source/README.md](../schema/source/README.md): generate with `node scripts/release/generate.mjs --release schema/source/<release>`, pin with `pnpm schema:pin -- --release schema/source/<release>`, then run `pnpm workspace:build`. Releases v2.0.0 to v2.0.2 were authored in the now-absent `../biotech-meta`; that checkout is history, not an edit destination. Never edit the pinned release or generated workspace as a substitute. The release loader verifies the frozen bytes.

Read [STATUS](plans/schema-v2-service-release/STATUS.md), [VALIDATION](plans/schema-v2-service-release/VALIDATION.md) and [RELEASE-MANIFEST](plans/schema-v2-service-release/RELEASE-MANIFEST.md) together for the dated v2 release record. The older `schema/program/PLAN.md` and kickoff packet remain design/history; they do not override current pinned identities. Historical dirty-state/deployment descriptions are not fresh checks. This service's schema-release handoff is separate from the active platform Mission Control sprint.

The domain's authored product roadmap is [../../BellLabs/index.md](../../BellLabs/index.md). Future dynamic/specialized service composition remains a proposal unless a specific capability is implemented and advertised. This service does not own general mission scheduling, AI Engineer schemas, or all future Biotech user applications.

## Local retrieval and generated outputs

From this repository, with its existing built CLI:

```powershell
node packages/schema-workspace/dist/cli.js search 'ingest product label per serving' --mode lexical --limit 5
node packages/schema-workspace/dist/cli.js get node:LabelVersion --field id
node packages/schema-workspace/dist/cli.js doctor --json
node packages/schema-workspace/dist/cli.js verify
rg -n 'product|ingestion|Mission Control|shared|authority' docs/NAVIGATION.md
```

Schema search indexes graph cards, not the BellLabs service inventory. Use the domain/service guides for service selection and API ownership. `workspace/START_HERE.md` documents `find`, `get`, `neighbors`, `path`, `pattern` and bounded `slice`. Schema discovery can run without database access. Semantic and hybrid search are separate optional provider-backed modes; a lexical pass is not an embedding test.

**Known task-card drift (verified 2026-10-15):** `workspace/tasks/ingest-product-label.md` lines 22–29 still advertises `state.attach` as a v2 proposal pending S3 and recommends it for `HAS_LABEL_VERSION`. Current [ProposalV2](../packages/contracts/src/intent-v2.ts) excludes `state.attach`; [v1 migration](../packages/kg-ops/src/write/migrate-v1.ts) lines 416–421 maps it to `edge.assert`. For executable v2 ingestion, follow the [current ingest skill](../.agents/skills/biotech-kg-ingest/SKILL.md), its proposal matrix and the contract, using the supported `edge.assert` route with required temporal/evidence fields. The lexical query finds the intended card, but that card's executable guidance fails current-contract validation. Hash/link/rerender checks cannot detect this semantic drift. Correct the upstream task-route source through a reviewed release/re-pin once its authoring checkout is located; do not patch the generated card or frozen release directly. **Resolved in biotech-schema-v2.1.0 (2026-10-24):** `workspace-inputs/task-routes.yaml` drops `state.attach` from ingest-product-label, ingest-study-publication and correct-a-stale-fact, and the regenerated card uses `edge.assert`. Some node, predicate and edge-property cards still mention `state.attach` in SDL or vocabulary text; that text was not changed in this release.

Generated chain: upstream authored release -> verified `schema/pinned/release/` -> `packages/schema-workspace` renderer -> `workspace/**` and manifest/index. `pnpm workspace:build` is the supported regeneration; `pnpm workspace:verify` compares hashes and a clean rerender. No upstream source was changed in this documentation audit, so it did not rewrite the generated graph workspace. The curated OKF catalog at workspace path `biotech/biotech-knowledge-catalog/obsidian-vault` is separate and hand-authored.
