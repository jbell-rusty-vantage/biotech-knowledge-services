# ADR 0001 — Repository shape and languages

Status: accepted · 2026-10-07

## Decision

`biotech-knowledge-services` is one repository that hosts several deployable units: a pnpm/TypeScript workspace (`packages/*`, `apps/*`) and a uv/Python project (`python/*`). Each unit has its own build, tests and (where deployable) container image; they share versioned contracts through `packages/contracts` and its JSON Schema exports, not through imports across language boundaries.

TypeScript is the language of every executable service in this repo. Python is used for the client that Mission Control adapters consume and for analysis scripts (eval scoring).

## Why

- The chain SDL → `@neo4j/graphql` → Neo4j is TypeScript-native: `graphql-js` is the canonical SDL parser, `@neo4j/graphql` 7 builds the executable API, `neo4j-driver` 6 is first-class. Re-implementing SDL parsing or the directive semantics in Python would duplicate the exact surface the deployed API uses.
- The sibling AI Engineer knowledge services (TypeScript: `packages/knowledge-db` with intent/plan/executor/receipt, `skills/schema-explore`, `knowledge-ingest`) already set the shape that Mission Control's integration annex expects (`mission-control-general/.../expansion/KNOWLEDGE-SERVICES.md`). Matching it keeps the two apps' capability interfaces (`knowledge.query`, `knowledge.ingestion_plan`, `knowledge.ingestion_apply`, `knowledge.receipt_get`) structurally identical.
- Mission Control is Python ("Python adapters use strict Pydantic request/results and a typed protocol"). A thin pydantic client that validates against the exported JSON Schemas is the right seam; the algorithms stay in the service.
- One repo with multiple units keeps the contracts, the pinned schema, the workspace and the skills versioned together; a schema re-pin is one commit that rebuilds the workspace, re-runs the planner tests and re-exports the schemas.

## Consequences

- Cross-language truth is the JSON Schema export (`packages/contracts/json-schema/*.json`) and the canonical-JSON digest algorithm (sorted keys, no whitespace), implemented identically in TypeScript (`digest.ts`) and Python (`digest.py`).
- Each unit builds in isolation (the GraphQL API image only copies `packages/contracts`, `apps/graphql-api` and `schema/pinned`).
- Adding a service in another language means adding a top-level folder with its own toolchain and consuming the JSON Schemas; it never imports `@bks/*` internals.
