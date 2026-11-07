# Team protocol and ownership register

Lead: release integrator (this session). Subagent model: Opus 5.5. Roles run in waves. The lead verifies every delegated result independently before marking a gate.

## Ownership register (primary editor per path)

| Path | Primary editor | Notes |
| --- | --- | --- |
| `biotech-meta/docs/schema/releases/**`, `biotech-meta/docs/schema/CHANGELOG.md`, `OPEN-QUESTIONS.md`, `ontology-lab/proposal-index.md` | Schema authority (S1) | upstream authority |
| `schema/pinned/**`, `schema/sidecars/**`, `scripts/{assemble-schema,packet-check,release-*}.mjs`, `packages/schema-workspace/src/{load,parse,ir,sidecars,release}.ts`, root `package.json` scripts `schema:*` | Schema authority (S1) | |
| `packages/schema-workspace/src/{render,search,slice,workspace,build,cli,map,find,neighbors,path,pattern,doctor}.ts`, `packages/schema-workspace/src/semantic/**`, `workspace/**` (generated), `.agents/skills/biotech-schema-explore/**`, content of `packages/contracts/src/workspace.ts` (S3 merges) | Workspace / retrieval (S2, S5) | wave 2 |
| `packages/contracts/**` (except workspace.ts content), `packages/contracts/json-schema/**`, `python/biotech-knowledge-client/**`, `packages/kg-ops/src/{plan,apply,schema-access,uid,operations,neo4j,witness,fence,custody,canonical}.ts`, `apps/executor/src/**`, `scripts/neo4j-test.sh` | Native executor (S3) | other roles submit contract or neo4j.ts changes as patches in their report; the executor owns HTTP/MCP registration for this release by lead delegation |
| `packages/kg-ops/src/{read,cypher,resolve,templates,visibility}.ts`, `packages/kg-ops/src/read/**`, `.agents/skills/biotech-kg-query/**`, `platform/knowledge-services` adapter seam files (named in the S7 brief), `platform/mission-control/integrations/biotech/**` adapter files (named in the S7 brief) | Reads / integration (S4, S7) | wave 2 |
| `apps/graphql-api/**`, `apps/product-bff/**`, `packages/graphql-client/**`, `docs/deployment/graphql-api.md` (append-only section) | Consumer API (S6) | |
| `scripts/migration/**`, `packages/kg-ops/src/migration/**`, `evals/**`, `.agents/skills/skill-routing.json`, `.agents/skills/biotech-graph-ops/**`, `.agents/skills/biotech-graph-analyze/**`, `docs/plans/schema-v2-service-release/{MIGRATION-ACCOUNTING,SKILL-REVIEW,INDEPENDENT-REVIEW}.md` | Migration / qualification (S8, S9 review) | |
| `docs/plans/schema-v2-service-release/{STATUS,VALIDATION,INTERFACES,TEAM-PROTOCOL,S0-INVENTORY,RELEASE-MANIFEST,CUTOVER}.md`, `.agents/skills/biotech-kg-ingest/**` (final integration), `runs/release-v2/custody/**` | Lead | roles append to STATUS/VALIDATION through their reports; the lead edits |

Nobody edits `workspace/**` or `schema/pinned/**` by hand. Vendored `_vendor-neo4j` skills stay unmodified.

## Frozen inputs for wave 1

- Candidate SDL, modules, registers, vocabularies and fixtures: `schema/program/final/**` at BKS commit `431c8a7`, SDL digest `c7cf1235...`.
- Decision ledger: `DECISIONS.md` (160 dispositions) in this directory.
- Interface checkpoint: `INTERFACES.md` v0.
- S0 inventory: `S0-INVENTORY.md`; machine inventory `runs/release-v2/custody/s0/aura-inventory.json`.

## Every assignment states

objective, owned files, read-only dependencies, frozen input versions, acceptance tests, expected artifact, whom to notify on interface change.

## Every handoff reports

changed files, contract/release identities, tests run with outcomes (commands plus pass/fail counts), unrun checks, limitations, remaining blockers, interface deltas (if any) with invalidated artifacts. A subagent's "done" is not integration evidence; the lead reruns the stated commands.

## Rules that bind every role

- Run Git, pnpm and uv commands only inside the owning repository. No commits, no pushes, no production writes, no Fly operations, no credential rotation, no OpenAI uploads (the S5 live proof is lead-authorized in its brief only).
- Never print `.env` contents or secret values. Receipts and exports go to `runs/release-v2/custody/`.
- Do not hand-edit generated files. Do not weaken budgets or delete failing tests; fix or report.
- Use pnpm; Node 22 or newer; tests with vitest; integration tests behind `BKS_INTEGRATION=1`.
- Cypher 5 baseline (`CYPHER 5` prefix allowed; never `CYPHER 25`).
- Legacy data in the live graph is never deleted.
