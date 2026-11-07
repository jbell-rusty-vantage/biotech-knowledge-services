# S2 handoff: workspace / retrieval (work package S2)

Role: workspace / retrieval. Date: 2026-10-11 (local; UTC 2026-10-12T00:52Z at the final run). Nothing was committed or
pushed. No provider (OpenAI) calls. `workspace/**` was written only by `pnpm workspace:build`; `schema/pinned/**`,
S1-owned sources, `packages/contracts`, `apps/**`, `packages/kg-ops`, `evals/**` and vendored skills were not edited.
Evidence: `runs/release-v2/custody/s2/` (gitignored).

**Release bound at the end:** the lead re-pinned mid-session. The final workspace is rendered from
**`biotech-schema-v2.0.1`** (`schemaReleaseDigest sha256:c0dd7837df029695e26f00d99f482483fb715e1cbcd4c4c4b1d8e3d31d6d3b06`,
`schemaDigest sha256:fe2cc50a…` unchanged, `queryCatalogDigest sha256:84232dbf…`). The renderer is release-agnostic
(v2.0.x); every test runs against whatever `schema/pinned` binds.

## 1. Identities

| identity | value |
| --- | --- |
| `workspaceFingerprint` | **`sha256:1e38ee06a34caf08f76123092dbba0bfc88b9967d6d2e415b9b74a66202c80b9`** |
| workspace format / renderer | `bks-schema-workspace.v2` / `2.0.0` |
| generatedAt (frozen, = release `createdAt`; outside the fingerprint) | `2026-10-11T23:45:00.000Z` |
| fingerprint rule | sha256 over `<path>\0<sha256>\n` of every inventory entry sorted by path (all files except `manifest.json`) |
| files | 1,337 (1,336 in the inventory + `manifest.json`); 1,029 cards; 2,318 index records |
| previous fingerprint (v1 layout, S1) | `sha256:1ba36b12…` (755 files) — invalidated |

## 2. File counts per layer

| layer | files | layer | files |
| --- | ---: | --- | ---: |
| `modules/` | 14 | `predicates/` | 374 |
| `domains/` | 11 | `assessments/` (one per kind) | 15 |
| `tasks/` | 16 | `vocabularies/` (193 enums + 11 release vocabularies + INDEX) | 205 |
| `nodes/` | 69 | `rules/` (identity, ingestion, temporal, projection, evidence-path, compatibility) | 6 |
| `relationships/` | 106 | `sdl/` | 300 |
| `edge-properties/` | 20 | `patterns/` (153 templates + 14 question sets + `catalog.json`) | 168 |
| `interfaces/` | 2 | `migrations/` | 9 |
| `unions/` | 16 | `search/` (`index.jsonl`, `adjacency.json`) | 2 |
| top level | 4 (`START_HERE.md`, `INDEX.md`, `schema-ir.json`, `manifest.json`) | | |

Topology: 848 typed arcs, 177 predicate joins. Index rows: 1,029 cards + lookup rows (943 v1 aliases − live/kept, legacy
labels/types, operational names, 454 questions, terms).

## 3. Changed files

**Package `packages/schema-workspace/src`** (owned):
- rewritten: `render.ts` (v2 renderer, staged atomic write, link check, inventory/fingerprint, legacy map, operational
  names, compatibility), `search.ts` (lexical v2, RRF), `workspace.ts` (v2 open/resolve/page/section/field, search
  modes, on-disk integrity), `slice.ts` (budgeted, evidence-aware, closure check, schema context), `build.ts`
  (`build`, `verifyWorkspace`), `cli.ts` (all commands)
- new: `card.ts` (front matter + `cardDigest`), `schema-contracts.ts` (zod v2 shapes; patch for contracts),
  `topology.ts`, `neighbors.ts`, `path.ts`, `pattern.ts`, `find.ts`, `doctor.ts`, `context.ts`, `eval.ts`,
  `semantic/retriever.ts`
- tests new: `workspace-v2.test.ts` (28), `skill-examples.test.ts` (9); edited: `schema-workspace.test.ts` (S1 had
  moved it to my API; I added a 60 s timeout because two full renders exceed 5 s under the parallel suite)
- `index.ts`: additive exports (S1 concurrently added `classifyName`; both kept)

**Skill** `.agents/skills/biotech-schema-explore/`: `SKILL.md` (rewritten, 120 lines), `manifest.json`,
`references/{command-cookbook,graph-direction-and-interfaces,predicate-vs-typed-relationship,semantic-fallback,migrating-old-names}.md`,
`examples/` (4 positive + 4 negative `*.example.json`, `stale-hits.json`, `README.md`).

**Docs**: `docs/architecture/0002-schema-workspace-progressive-disclosure.md` (sidecars → release workspace-inputs,
v2 tree, commands, integrity). This report.

**Generated**: `workspace/**` (1,082 v1 files removed incl. `fragments/` and `search/index.json`; 312 modified;
440 new).

## 4. Capability equivalence (v1 navigation → v2)

| v1 capability | v2 equivalent |
| --- | --- |
| `START_HERE.md` (navigation rule, "never list/cat", 4-page cap) | `START_HERE.md`: workflow, identities, context budget + progressive disclosure, `rg`/`jq`/PowerShell recipes, limits, compatibility |
| `INDEX.md` | `INDEX.md` (+ modules, predicate routes, assessments, rules, question sets) |
| `domains/<slug>.md`, `dom:` | unchanged ids/paths; modules instead of fragments |
| `fragments/<W##>.md`, `frag:W##` | `modules/<K\|D1..D13>.md`, `mod:<id>`; `frag:W##` → alias record → `mod:`; `frag:D6` is an alias of `mod:D6`; `slice --fragments W04` resolves through aliases |
| cards `nodes/ relationships/ edge-properties/ vocabularies/ unions/ interfaces/` (`node: rel: edge: enum: union: iface:`) | same ids and paths, plus front matter and v2 sections |
| `sdl/<Name>.graphql`, `sdl:` | unchanged |
| `tasks/<slug>.md`, `task:` | unchanged ids; pending proposal kinds, mandatory rules |
| `rules/ingestion-rules.md`, `rules/identity-rules.md` | same paths (`rule:` ids) + temporal, projection, evidence-path, compatibility |
| `search/index.json` (SearchEntry) | `search/index.jsonl` (CardRecord, filterable fields); `Workspace.index` |
| `term:` rows | unchanged (lookup rows) |
| `schema-ir.json` | unchanged (parsedAt frozen to release createdAt) |
| `manifest.json` v1 | `manifest.json` v2 (renamed fields, inventory) |
| `bks-schema build/verify/search/get/manifest/slice/ir/map` | same commands; `verify` hashes on-disk files + rerenders; `get` adds `--section/--field`; `slice` adds budget, questions, predicates, closure, `schema-context.json` |
| v1 node/rel/enum/union/iface/edge ids that no longer exist | 943-entry alias records (`get node:Mention` explains; removed ⇒ no substitute) |
| — (new) | `find`, `neighbors`, `path`, `pattern`, `doctor`, `context`, `rehydrate`, `eval`; `predicates/`, `assessments/`, `patterns/`, `migrations/`, `search/adjacency.json`, `legacy:` and `op:` lookup rows |
| executor `/schema/*`, MCP `schema_*` (openWorkspace, `search`, `page`, `buildSlice`) | signatures preserved (repo `pnpm build` passes); see section 6 |

## 5. Commands and results (final state)

| command | result |
| --- | --- |
| `pnpm --filter @bks/schema-workspace build` | passed |
| `pnpm build` (repo) | passed (exit 0; executor compiles against the v2 API) |
| `pnpm exec vitest run --project schema-workspace` | 6 files: 5 passed, 1 failed; 78 tests: 77 passed, 1 failed. Failure: S1's `release.test.ts` "emits required DDL … (FU-07)" expects `ks_intent_marker_effect_key`, which v2.0.1 replaced by `ks_intent_marker_key` / `…_effect_key_lookup` (S1-owned, not caused by S2) |
| `pnpm test` (repo) | 21 files: 18 passed, 1 failed, 2 skipped; 269 tests: 238 passed, 1 failed (same S1 test), 30 skipped |
| `pnpm workspace:build` | ok, 1,337 files, `sha256:1e38ee06…` |
| `pnpm workspace:verify` | ok: 1,336 files hashed, 0 missing / altered / unexpected, inventory fingerprint matches, clean rerender identical |
| `bks-schema doctor` | ok: version, integrity, cards (2,318 records; all digests recompute), links, query-catalog, pinned-release pass; compatibility pass; semantic skip (not configured) |
| `bks-schema eval --tasks evals/v2/schema-discovery/tasks.json --mode lexical` | 68 tasks: **Recall@10 0.9054, hit@10 0.9559**, exact-ID top-1 0.5735 (exact category 0.7917), MRR 0.7074; exact 1.00 / 1.00, negative 0.96 / 1.00, paraphrase 0.85 / 0.85, cross-domain 0.71 / 1.00 (recall / hit@10) |

New S2 tests cover: clean-room rerender equality (independent render + directory + `verifyWorkspace`), timestamp
outside the fingerprint, on-disk altered / missing / unexpected detection, edited inventory, owned-output and path
validation, zero broken links, card digests vs index, layer retention, START_HERE filesystem recipes and absence of
the old rules, deterministic ties independent of index order, kind/module filters, semantic `unavailable` and hybrid
`degraded`, RRF with stale/unknown hosted hits rejected, structured `find`, adjacency ≤ 100 / 250 with truncation and
depth > 5 refused, interface collapse/expand, ≤ 5 paths with every hop a real arc/join and `instanceClaim: false`,
`--via` routing, pattern statuses, v1 alias resolution, legacy/operational rendering, write slice keeps identity and
admission rules beyond budget, default 12k budget, incomplete closure never compileable, schema context validity,
doctor without env leakage, deterministic eval; all 8 skill examples executed through the CLI against a clean build.

## 6. Exported API for the executor (`@bks/schema-workspace`)

```ts
openWorkspace(dir?: string, opts?: { expectRelease?: string; expectFingerprint?: string }): Workspace
// Workspace: { dir, manifest: WorkspaceManifestV2, index: CardRecord[], ir(), adjacency(), catalog(), prepared(),
//   record(id), resolve(idOrName), cardDigest(id), search(query, limit?) /* sync lexical, v1-compatible */,
//   page(idOrPath, { maxBytes?, section?, field? }): Page }
searchWorkspace(ws: Workspace, opts: { query: string; mode?: "lexical"|"semantic"|"hybrid"; kind?: string|string[];
  module?: string|string[]; domain?: string|string[]; limit?: number; retriever?: SemanticRetriever; deadlineMs?: number }): Promise<SearchResponse>
findCards(ws: Workspace | CardRecord[], q: FindQuery): FindResult
neighbors(ws: Workspace, id: string, opts?: { direction?: "out"|"in"|"both"; depth?: number; expand?: boolean; predicates?: boolean }): NeighborsResult
paths(ws: Workspace, from: string, to: string, opts?: { maxHops?: number; limit?: number; joins?: "fill"|"include"|"exclude"; via?: string[]; avoid?: string[]; predicates?: boolean }): PathsResult
pattern(ws: Workspace, req: { question?: string; template?: string }): PatternResult        // alias of patternLookup
buildSlice(ws: Workspace, ir: SchemaIR, sidecars: Sidecars, req: SliceRequest | Partial<SliceRequestV2>): SliceBundle  // v1 request still accepted
writeSlice(bundle: SliceBundle, outDir: string, workspaceDir?: string): string[]
doctor(dir: string, opts?: { expectRelease?: string; pinned?: boolean; retriever?: SemanticRetriever }): Promise<DoctorReport>
schemaContext(ws: Workspace, input: { intent?; taskIds?; questionIds?; cardIds?; sections?; reasons?; omissions?; budget? }): SchemaContext
validateHostedHits(local, hits): { accepted, rejected }      // S5 seam; SemanticRetriever interface in semantic/retriever.ts
verifyWorkspace(dir?): VerifyReport;  verifyWorkspaceFiles(dir?): IntegrityReport
evalSearch(ws, { tasks, mode?, k?, retriever? }): Promise<EvalReport>;  loadEvalTasks(tasksFile, goldFile?)
// zod: WorkspaceManifestV2, CardRecord, SliceRequestV2, SchemaContext (+ format constants) from schema-contracts
```

Wiring notes for S3: `/schema/search` → `searchWorkspace` (mode, kind, module; return `status`/`degradation`);
`/schema/find`, `/schema/neighbors/:id`, `/schema/path`, `/schema/pattern`, `/schema/doctor`, `/schema/context`;
`/schema/slice` should parse `SliceRequestV2` (v1 `SliceRequest` still works); strip `manifest.inventory` (~1,336
entries) from `/schema/manifest` and MCP `schema_manifest` or return a count. Update the MCP `schema_search`
description in `apps/executor/src/mcp.ts:27` ("never list the tree" is obsolete). Map `WorkspaceError.code
RELEASE_MISMATCH` → `BKS_RELEASE_MISMATCH`. Semantic stays `notConfiguredRetriever` until S5.

## 7. Contracts patch for `packages/contracts/src/workspace.ts` (native-executor role merges)

Replace the file with the following (v1 shapes kept for decoding; v2 added). The same shapes are exported today from
`@bks/schema-workspace` (`schema-contracts.ts`), so switch imports after the merge.

```ts
import { z } from "zod";
import { Digest, Timestamp, TypeName } from "./common.js";

// ---- v1 (decode only) ----------------------------------------------------------------------------------------
export const WORKSPACE_FORMAT = "bks-schema-workspace.v1" as const;
export const SearchEntryKind = z.enum(["node", "relationship", "edge-properties", "enum", "union", "interface", "domain", "fragment", "task", "term"]);
export type SearchEntryKind = z.infer<typeof SearchEntryKind>;
export const SearchEntry = z.strictObject({ id: z.string().min(1), kind: SearchEntryKind, name: z.string().min(1), path: z.string().min(1), domain: z.string().optional(), fragment: z.string().optional(), aliases: z.array(z.string()).default([]), tokens: z.array(z.string()).default([]), summary: z.string().default("") });
export type SearchEntry = z.infer<typeof SearchEntry>;
// WorkspaceManifest (v1) and SliceRequest (v1): keep the current definitions unchanged.

// ---- v2 ------------------------------------------------------------------------------------------------------
export const WORKSPACE_FORMAT_V2 = "bks-schema-workspace.v2" as const;
export const CARD_FORMAT = "bks-schema-card.v1" as const;
export const SLICE_FORMAT_V2 = "bks-schema-slice.v2" as const;
export const SCHEMA_CONTEXT_VERSION = "biotech-schema-context.v1" as const;
export const ADJACENCY_FORMAT = "bks-schema-adjacency.v1" as const;

export const CardKind = z.enum(["node", "relationship", "edge-properties", "interface", "union", "enum", "vocabulary", "predicate", "assessment", "module", "domain", "task", "rule", "pattern", "question-set", "migration", "term", "question", "alias", "operational"]);
export type CardKind = z.infer<typeof CardKind>;
export const LOOKUP_KINDS: readonly CardKind[] = ["term", "question", "alias", "operational"];

export const CardRecord = z.object({
  id: z.string().min(1), kind: CardKind, name: z.string().min(1), path: z.string().min(1),
  module: z.string().optional(), domain: z.string().optional(),
  aliases: z.array(z.string()).default([]), tokens: z.array(z.string()).default([]), summary: z.string().default(""),
  cardDigest: Digest.optional(), capabilities: z.array(z.string()).default([]), sourceRefs: z.array(z.string()).default([]),
  properties: z.array(z.string()).optional(), labels: z.array(z.string()).optional(), interfaces: z.array(z.string()).optional(),
  executorOps: z.array(z.string()).optional(), proposalKinds: z.array(z.string()).optional(),
  pendingProposalKinds: z.array(z.string()).optional(), readOperations: z.array(z.string()).optional(),
  identifierSchemes: z.array(z.string()).optional(), uidToken: z.string().optional(), archetype: z.string().optional(),
  temporalScope: z.string().optional(), relClass: z.string().optional(), temporal: z.string().optional(), exclusive: z.boolean().optional(),
  from: z.array(z.string()).optional(), to: z.array(z.string()).optional(), edgePropertyType: z.string().optional(),
  predicateKind: z.string().optional(), status: z.string().optional(), registrar: z.string().optional(),
  subjectTypes: z.array(z.string()).optional(), objectTypes: z.array(z.string()).optional(), typedEdge: z.string().optional(),
  questionIds: z.array(z.string()).optional(), templateIds: z.array(z.string()).optional(), requiredIndexes: z.array(z.string()).optional(),
  migrationKind: z.string().optional(), targets: z.array(z.string()).optional(), seeAlso: z.array(z.string()).optional(),
});
export type CardRecord = z.infer<typeof CardRecord>;

export const FileEntry = z.strictObject({ sha256: Digest, bytes: z.number().int().nonnegative() });

export const WorkspaceManifestV2 = z.strictObject({
  format: z.literal(WORKSPACE_FORMAT_V2),
  rendererVersion: z.string(),
  generatedAt: Timestamp,                                   // frozen; outside the fingerprint
  release: z.strictObject({
    releaseId: z.string(),                                  // v1: schema.sourceRun
    schemaDigest: Digest,                                   // v1: schema.digest
    schemaReleaseDigest: Digest,                            // v1: schema.catalogVersion
    queryCatalogDigest: Digest.optional(),
    irVersion: z.string(),
    sdlPath: z.string(),                                    // v1: schema.pinnedPath
    pinnedAt: z.string(),                                   // v1: schema.pinnedAt
    source: z.enum(["pinned", "override"]),
  }),
  workspaceInputs: z.record(z.string(), Digest),            // v1: sidecars
  workspaceFingerprint: Digest,
  fingerprintRule: z.string(),
  counts: z.record(z.string(), z.number().int()),
  layers: z.array(z.strictObject({ depth: z.number().int(), name: z.string(), path: z.string(), purpose: z.string() })),
  entryPoints: z.array(z.string()),
  domains: z.array(z.strictObject({ slug: z.string(), title: z.string(), modules: z.array(z.string()), nodeCount: z.number().int() })),
  modules: z.array(z.strictObject({ id: z.string(), title: z.string(), owner: z.string(), nodeCount: z.number().int() })),
  cardIdPrefixes: z.record(z.string(), z.string()),
  limits: z.strictObject({
    policyVersion: z.string(),
    search: z.strictObject({ defaultLimit: z.number().int(), maxLimit: z.number().int(), maxQueryChars: z.number().int() }),
    traversal: z.strictObject({ defaultDepth: z.number().int(), maxDepth: z.number().int(), maxNodes: z.number().int(), maxArcs: z.number().int() }),
    paths: z.strictObject({ defaultMaxHops: z.number().int(), maxHops: z.number().int(), maxPaths: z.number().int() }),
    slice: z.strictObject({ targetTokens: z.number().int(), estimator: z.string() }),
  }),
  semantic: z.strictObject({ status: z.enum(["not-configured", "available", "unavailable"]), generationId: z.string().nullable(), note: z.string() }),
  compatibility: z.record(z.string(), z.strictObject({ status: z.string(), reason: z.string() })).optional(),
  contracts: z.record(z.string(), z.string()),
  inventory: z.record(z.string(), FileEntry),               // every file except manifest.json
});
export type WorkspaceManifestV2 = z.infer<typeof WorkspaceManifestV2>;

export const SliceRequestV2 = z.strictObject({
  intent: z.string().max(500).optional(),
  nodeTypes: z.array(z.string()).default([]), relationshipTypes: z.array(z.string()).default([]),
  domains: z.array(z.string()).default([]), fragments: z.array(z.string()).default([]), modules: z.array(z.string()).default([]),
  tasks: z.array(z.string()).default([]), questions: z.array(z.string()).default([]), predicates: z.array(z.string()).default([]),
  endpointDepth: z.number().int().min(0).max(5).default(1),
  includeSdl: z.boolean().default(true),
  maxTokens: z.number().int().min(1000).max(200_000).default(12_000),
  purpose: z.enum(["auto", "read", "write"]).default("auto"),
});
export type SliceRequestV2 = z.infer<typeof SliceRequestV2>;

export const SchemaContext = z.strictObject({
  schemaVersion: z.literal(SCHEMA_CONTEXT_VERSION),
  contextId: Digest,
  advisory: z.literal(true),
  grantsAuthority: z.literal(false),
  producer: z.strictObject({ tool: z.string(), version: z.string() }),
  release: z.strictObject({ releaseId: z.string(), schemaDigest: Digest, schemaReleaseDigest: Digest, workspaceFingerprint: Digest, queryCatalogDigest: Digest.optional() }),
  intent: z.string().optional(),
  taskIds: z.array(z.string()),
  questionIds: z.array(z.string()),
  selected: z.array(z.strictObject({ cardId: z.string(), cardDigest: Digest.optional(), path: z.string(), sections: z.array(z.string()).default([]), reason: z.string() })),
  decisions: z.strictObject({
    identity: z.array(z.strictObject({ type: z.string(), uidToken: z.string().nullable(), rule: z.array(z.string()), identifierSchemes: z.array(z.string()), executorOps: z.array(z.string()) })),
    predicates: z.array(z.strictObject({ name: z.string(), kind: z.string(), status: z.string(), route: z.enum(["typed-edge", "assertion-only", "literal", "field", "computation", "alias", "retired"]), typedEdge: z.string().nullable() })),
    temporal: z.array(z.strictObject({ element: z.string(), temporal: z.string(), exclusive: z.boolean(), scope: z.string().nullable() })),
  }),
  route: z.strictObject({ operation: z.enum(["navigation", "read", "write", "read+write"]), readOperations: z.array(z.string()), proposalKinds: z.array(z.string()), pendingProposalKinds: z.array(z.string()), patternTemplates: z.array(z.string()) }),
  scope: z.strictObject({ modules: z.array(z.string()), domains: z.array(z.string()), nodeTypes: z.array(z.string()), relationshipTypes: z.array(z.string()) }),
  omissions: z.array(z.strictObject({ element: z.string(), reason: z.string() })),
  unresolved: z.array(z.string()),
  budget: z.strictObject({ maxTokens: z.number().int(), estimatedTokens: z.number().int(), exceeded: z.boolean(), estimator: z.string() }).optional(),
});
export type SchemaContext = z.infer<typeof SchemaContext>;
```

Also in `packages/contracts/src/index.ts`: `CONTRACT_VERSIONS.workspace = "bks-schema-workspace.v2"`, add
`schemaContext: "biotech-schema-context.v1"`, add `LEGACY_CONTRACT_VERSIONS.workspace = "bks-schema-workspace.v1"`;
`export-json-schema.ts`: add `bks-schema-workspace-manifest.v2`, `bks-schema-card.v1`, `bks-schema-slice-request.v2`,
`biotech-schema-context.v1`. Python client: mirror `SchemaContext` if it consumes schema context. (`TypeName` stays
used by the v1 `SliceRequest`.)

## 8. Unrun checks

- Semantic / hybrid with a real provider (S5); no OpenAI calls were made. Only `notConfiguredRetriever` and a
  test double exercised the hybrid path.
- The paired evaluation arms of `evals/v2/protocol.md` (filesystem-only vs structured CLI vs hybrid, with an agent):
  only the deterministic lexical retrieval scorer ran.
- Executor `/schema/*` and MCP `schema_*` wiring of the new functions (S3); contracts merge (S3); Python models.
- `BKS_INTEGRATION=1` suites (no graph work in S2).
- `skill-routing.json` binding of `${WORKSPACE_FINGERPRINT}` (S8 / lead).

## 9. Limitations and risks

- **Lexical discovery is below the 0.95 Recall@10 gate** (0.905; hit@10 0.956). Weak spots: paraphrase (0.85) and
  cross-domain tasks whose gold is a multi-hop path; `bks-schema path` answers those directly (e.g. `path LabTest
  Biomarker --joins exclude` returns MEASURES_METRIC → QUANTIFIES first) but the scorer measures `search` only.
- I saw the frozen task prompts and gold while building the runner. Two ranking changes followed (full description
  tokens; a soft bonus when the query names a kind). Both are general mechanisms, not per-task rules, but the lead
  should treat the S2 number as indicative and rely on the blinded paired run.
- A 12,000-token write slice spends ~7.4k on the mandatory rules (identity, ingestion, temporal and evidence path,
  scoped to the slice's types), so primary node cards come in as head excerpts. This is reported in `omissions`;
  callers can admit a larger budget.
- The workspace swap is two renames (old → `.previous-*`, staging → target), with restore on failure; on Windows it
  is not a single atomic syscall.
- Each CLI call costs ~1.3–2 s (parsing the 1.8 MB `index.jsonl`). Long-lived executor processes pay it once.
- `migrations/legacy-map.md` shows S8's frozen map as published. Its `target.releaseId` still says v2.0.0 and the
  digest placeholder `${SCHEMA_RELEASE_DIGEST}` is unbound; that is S8/S1 content.
- `assessments/`: one subkind has no kind (`D6.label-claim-match`, retired). It is listed on `vocab:assessments`
  rather than getting a card.

## 10. Blockers

None for S2. Open items for others: S1's failing `release.test.ts` FU-07 assertion after v2.0.1; S3 contract merge
and route wiring.

## 11. Interface deltas (against INTERFACES v1)

| area | before | now | who adapts |
| --- | --- | --- | --- |
| workspace manifest | `bks-schema-workspace.v1`; `schema.{pinnedPath,digest,pinnedAt,sourceRun,catalogVersion}`, `sidecars`, fixed `counts` | `bks-schema-workspace.v2`; `release.{sdlPath,schemaDigest,pinnedAt,releaseId,schemaReleaseDigest,queryCatalogDigest,irVersion,source}`, `workspaceInputs`, open `counts`, `inventory`, `limits`, `cardIdPrefixes`, `modules`, `semantic`, `compatibility`, `contracts`, `fingerprintRule` | S3 (contracts, handshake `workspaceFingerprint` unchanged name), S7 |
| search index | `search/index.json` (SearchEntry) | `search/index.jsonl` (CardRecord); `SearchHit.fragment` → `module`, plus `cardDigest`, `via` | S3 executor responses, S5 corpus |
| ids | `frag:W##` live | `mod:<id>`; `frag:*` are alias records; new `pred: asmt: mod: rule: vocab: pattern: qset: migration: q: legacy: op:` | evals runner adapter (`cardIdPrefixes` in the manifest), S5 |
| fingerprint | regenerated-tree digest including `parsedAt` | inventory digest, timestamp excluded; frozen `generatedAt` = release `createdAt` | anyone caching fingerprints |
| renderer API | `renderWorkspace(ir, sidecars, pin, at)` | `renderWorkspace({ release, sidecars, generatedAt? })` | tests (already moved) |
| errors | `WORKSPACE_MISSING/CORRUPT`, `PAGE_*` | + `WORKSPACE_UNSUPPORTED`, `RELEASE_MISMATCH` (`bksCode BKS_RELEASE_MISMATCH`), `SECTION_NOT_FOUND`, `LIMIT_EXCEEDED` | S3 error mapping |
| new artifact | — | `biotech-schema-context.v1` (advisory), `bks-schema-slice.v2`, `bks-schema-adjacency.v1`, `bks-schema-card.v1`, `bks-schema-eval.v1` | S3, S5, S9 |

Invalidated: workspace fingerprints `sha256:1ba36b12…` and earlier; anything parsing the v1 manifest or
`search/index.json`.

## 12. Gate C (workspace) evidence rows

| check | identity | env | command | timestamp (UTC) | result | evidence |
| --- | --- | --- | --- | --- | --- | --- |
| regenerate workspace v2 | release v2.0.1 `sha256:c0dd7837…`; fingerprint `sha256:1e38ee06…` | local Windows, Node 24.18.0 | `pnpm workspace:build` | 2026-10-12T00:50Z | passed (1,337 files) | `runs/release-v2/custody/s2/ws-build.json` |
| on-disk integrity + clean rerender | same | same | `pnpm workspace:verify` | 2026-10-12T00:51Z | passed (1,336 hashed; 0 missing/altered/unexpected; rerender identical) | `custody/s2/ws-verify.json` |
| doctor (versions, cards, links, catalog, pin, compatibility) | same | same | `bks-schema doctor --json` | 2026-10-12T00:52Z | passed (semantic: skip, not configured) | `custody/s2/doctor.json` |
| tamper detection / clean-room / links / bounds / slice rules / context | same | same, vitest 5 | `pnpm exec vitest run --project schema-workspace` | 2026-10-12T00:55Z | S2 suites passed (28 + 9 new tests); project 77/78 (1 S1 failure) | `custody/s2/vitest-sw.txt` |
| skill examples executed on packaged workspace | skill `biotech-schema-explore` 2.0.0 | same | `skill-examples.test.ts` (4 positive + 4 negative via CLI) | 2026-10-12T00:55Z | passed (9/9) | same |
| lexical discovery eval | 68 frozen tasks (`evals/v2/schema-discovery`, FREEZE `sha256:cb79e68a…`) | same | `bks-schema eval --tasks evals/v2/schema-discovery/tasks.json --mode lexical --json` | 2026-10-12T00:52Z | Recall@10 0.9054, hit@10 0.9559, exact-ID 0.5735 (exact category 0.7917): **below the 0.95 gate** | `custody/s2/eval-final.json` |
| repo build | BKS working tree (all roles' edits) | same | `pnpm build` | 2026-10-12T00:45Z | passed | `custody/s2/build.txt` |
| repo unit tests | same | same | `pnpm test` | 2026-10-12T00:48Z | 238 passed, 1 failed (S1 `release.test.ts` FU-07), 30 skipped | `custody/s2/pnpm-test.txt` |
| semantic degradation | no generation bound | same | vitest + example `stale-hosted-result` | 2026-10-12T00:55Z | passed (semantic `unavailable` exit 4; hybrid `degraded`; stale/unknown hosted hits rejected) | `custody/s2/vitest-sw.txt` |


---

# S5: OpenAI Vector Store schema retrieval

Same role, 2026-10-12 (UTC). Live provider calls were made only through code with the server-side `OPENAI_API_KEY`
read from `.env`, within the lead's scoped authorization: **one** generation (budget 2), **94** search calls
(budget 600), 2.54 MB uploaded (ceiling 25 MB), no quota or billing error, nothing deleted. No commit, no Fly, no Aura.
Store and file ids are only in custody (`runs/release-v2/custody/semantic/<generationId>/{generation,progress}.json`,
gitignored); they are not in this report, in Git or in any log.

## S5.1 Identities

| identity | value |
| --- | --- |
| release | `biotech-schema-v2.0.1`, schemaReleaseDigest `sha256:c0dd7837df029695e26f00d99f482483fb715e1cbcd4c4c4b1d8e3d31d6d3b06` |
| workspaceFingerprint | `sha256:1e38ee06a34caf08f76123092dbba0bfc88b9967d6d2e415b9b74a66202c80b9` (unchanged by S5) |
| generationId | `g20261012T011448Z-4d8bdb77` (status **ready**, published as current 2026-10-12T01:24:45Z; no previous generation) |
| store | name `bks-schema-biotech-schema-v2.0.1-g20261012T011448Z-4d8bdb77`; id: custody path `runs/release-v2/custody/semantic/g20261012T011448Z-4d8bdb77/generation.json#storeId` |
| corpusDigest | `sha256:4d8bdb7728a5247a5a65fde1fd39ebabadb9141760a77f13661ae1f9bb38dee5` |
| corpus-manifest.json (custody) sha256 | `db4cceec147c0a655348c4dc3e137259a486909ee57fbb50cd7f80d1a4913ba0` |
| SDK | `openai` **7.23.0** (pinned exact in `packages/schema-workspace/package.json`; newest release at least two weeks old) |
| API | REST v1 through the SDK: `files.create(purpose=assistants)`, `vectorStores.create`, `vectorStores.fileBatches.createAndPoll` (per-file `attributes` + `chunking_strategy`), `vectorStores.files.list`, `vectorStores.retrieve`, `vectorStores.search` (shapes verified in the installed `.d.ts`, not from memory) |
| chunking | static, `max_chunk_size_tokens` 800, `chunk_overlap_tokens` 100 |
| embedding model | not exposed by the Vector Store create / retrieve contract (provider-managed); recorded as such, not invented |

## S5.2 Corpus (committed-safe summary; full manifest in custody)

Approved content only, exported from the verified packaged workspace (every source file's sha256 is checked against
the workspace inventory before export). Included: node, relationship, edge-property, interface, union and enum cards,
domain and module cards, task routes, predicate and assessment cards, release rule cards, and pattern explanations
(pattern cards with the Cypher statement removed). Excluded: SDL, `schema-ir.json`, `patterns/catalog.json`,
`search/**`, `migrations/**`, release vocabulary dumps, question sets, START_HERE/INDEX, anything under `runs/`,
receipts, `.env` or source code.

| measure | value |
| --- | --- |
| cards / documents | 995 cards → **1,189** documents (79 cards split into stable sections sharing the parent card id, `<cardId>#p<n>`) |
| by corpus kind | card 583 · predicate 374 · pattern 153 · assessment 15 · rule 14 · task-route 16 (some kinds span multiple documents) |
| bytes / estimated tokens (pre-upload estimate) | **2,535,616 B / ~632,900 tokens** (`ceil(chars/4)`); median document ~396 tokens, maximum ~1,201 |
| attributes per file (9 of 16 allowed) | `release_digest`, `workspace_fingerprint`, `card_id`, `card_digest`, `kind`, `module`, `language`, `corpus_kind`, `section` |
| each document embeds | title, card id, section id and headings, kind, module, release id + digest, workspace fingerprint, card summary |

## S5.3 Generation flow (as run)

`bks-schema semantic generate --live` → 1,189 uploads (bounded retries with backoff; quota / billing / auth abort;
resumable by document sha256) → store created with metadata (release, workspace, generation, corpus digests) → 3 file
batches (500 / 500 / 189), each polled to completion → every store file listed and its attributes compared with the
corpus manifest → local mapping `fileId → {docId, cardId, cardDigest, filename, sha256, attributes}` written →
status **ready** (1,189 / 1,189 completed, 0 failed, 0 attribute mismatches; provider store status `completed`,
`usage_bytes` 4,206,086) → `semantic publish` wrote `current.json` atomically (temp + rename) with a history list.
Indexing took ~9.5 minutes (01:14:49Z → 01:24:29Z).

Partial indexing is never served: `publishGeneration` refuses anything but `ready` with a complete mapping (tested
with a fake failed file). Retirement is deactivate-before-delete: `retireGeneration` refuses the current generation
and sets `retainUntil` (default 14 days); `deleteGeneration` refuses a current, active or still-retained generation,
needs `confirm: true`, and keeps files shared with other retained generations. Tested offline only; nothing was
deleted live.

## S5.4 Retriever, fusion and fallback

`createVectorStoreRetriever` (`src/semantic/vector-store-retriever.ts`): exact `release_digest` eq filter (plus
`kind` / `module` `in` filters), `max_num_results` 20, `rewrite_query` false, ranker `auto`, score threshold 0
(logged in `config()`), 5 s deadline with no SDK retries inside it, 2,000-character queries, request ceiling (default
600) and optional spend ceiling. Every hosted hit must map to a known file id whose provider attributes equal the
mapped card id, card digest, section, release and workspace. `searchWorkspace` then re-checks the card digest against
the local workspace (`validateHostedHits`) and rehydrates local cards. The cache key is generation + normalized
query + filters + result count + ranker + threshold. Hybrid fuses lexical top 20 with semantic top 20 by RRF
(k = 60), keeps exact id / name / alias hits (score ≥ 900) first, dedupes by card and returns the top 10. Failures
become explicit statuses: hybrid → `degraded` / `lexical-only`; semantic-only → `unavailable` with no hits.

## S5.5 Gate C search evaluation (frozen 68 schema-discovery tasks)

`bks-schema semantic qualify --live --tasks evals/v2/schema-discovery/tasks.json`. 95% CIs: percentile bootstrap,
10,000 resamples, seed 20261011.

| mode | Recall@10 [95% CI] | hit@10 [95% CI] | exact-ID top-1 (all / exact category) | MRR | median discovery tokens | latency p50 / p95 |
| --- | --- | --- | --- | --- | --- | --- |
| lexical | **0.905** [0.839, 0.961] | **0.956** [0.897, 1.000] | 0.574 / 0.792 | 0.707 | 62 | 6 / 14 ms |
| semantic | 0.821 [0.734, 0.900] | 0.882 [0.809, 0.956] | 0.588 / 0.750 | 0.695 | 62 | 1,429 / 1,913 ms |
| hybrid | 0.882 [0.806, 0.946] | 0.927 [0.853, 0.985] | **0.809 / 0.958** | **0.843** | 61 | see note |

Hybrid latency: within the run the semantic call was served from the per-query cache filled by the semantic pass,
so the measured 10 / 19 ms is local fusion only. A cold hybrid query costs about the semantic latency (p95 ~1.9 s).
Semantic retrieval is not faster.

| category (n) | lexical R@10 / hit@10 | semantic | hybrid |
| --- | --- | --- | --- |
| exact (24) | 1.00 / 1.00 | 0.96 / 0.96 | 1.00 / 1.00 |
| paraphrase (20) | 0.85 / 0.85 | 0.75 / 0.75 | 0.85 / 0.85 |
| negative (14) | 0.96 / 1.00 | 0.93 / 1.00 | 1.00 / 1.00 |
| cross-domain (10) | 0.71 / 1.00 | 0.48 / 0.80 | 0.50 / 0.80 |

| module (n) | lexical | semantic | hybrid | | module (n) | lexical | semantic | hybrid |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| K (6) | 0.89 / 1.00 | 0.61 / 0.67 | 0.89 / 1.00 | | D7 (5) | 1.00 / 1.00 | 1.00 / 1.00 | 1.00 / 1.00 |
| D1 (4) | 0.75 / 0.75 | 0.75 / 0.75 | 0.75 / 0.75 | | D8 (4) | 1.00 / 1.00 | 1.00 / 1.00 | 1.00 / 1.00 |
| D2 (4) | 0.75 / 0.75 | 0.75 / 0.75 | 0.75 / 0.75 | | D9 (5) | 1.00 / 1.00 | 0.90 / 1.00 | 0.90 / 1.00 |
| D3 (5) | 0.90 / 1.00 | 0.90 / 1.00 | 0.90 / 1.00 | | D10 (4) | 1.00 / 1.00 | 1.00 / 1.00 | 1.00 / 1.00 |
| D4 (6) | 0.64 / 0.83 | 0.42 / 0.50 | 0.50 / 0.50 | | D11 (4) | 1.00 / 1.00 | 1.00 / 1.00 | 1.00 / 1.00 |
| D5 (5) | 1.00 / 1.00 | 0.87 / 1.00 | 0.87 / 1.00 | | D12 (4) | 0.88 / 1.00 | 0.88 / 1.00 | 1.00 / 1.00 |
| D6 (7) | 0.91 / 1.00 | 0.76 / 0.86 | 0.97 / 1.00 | | D13 (5) | 1.00 / 1.00 | 0.90 / 1.00 | 0.90 / 1.00 |

Paired hybrid − lexical: paraphrase Recall@10 **+0.0 pp** (CI [0, 0]); overall Recall@10 −2.35 pp (CI [−6.27, +1.32]);
hit@10 −2.94 pp; median discovery tokens −1.6%.

**Default-routing decision: lexical stays the default; hybrid is not promoted.** Rule (IMPLEMENTATION section 3):
hybrid becomes default only with paraphrase Recall@10 +5 pp or median discovery tokens −15%, without regression.
Observed: +0.0 pp and −1.6%, with a small Recall@10 / hit@10 regression. **Semantic-on-demand is qualified.** The
generation is complete, round trips 20/20, every fallback test passes, and hybrid lifts exact-ID top-1 from 0.574 to
0.809 and MRR from 0.707 to 0.843. Hybrid stays available as an explicit mode for unfamiliar phrasing. Neither
lexical (0.905) nor hybrid (0.882) reaches the 0.95 discovery Recall@10 gate on this scorer.

Evaluation-integrity note: I saw these task prompts and gold while building the S2 runner (stated in S2 section 9).
I made no further ranking changes for S5, and did not tune corpus, chunking or fusion on these tasks. **The
certifying run should be the migration role's blinded paired run** (`evals/v2/protocol.md` arms A1/A2/A3).

## S5.6 Round trip and fallback (live)

| test | expected | observed | result |
| --- | --- | --- | --- |
| exact round trip: 20 evenly sampled documents searched under their own `card_id` + release filter | own file returned, attributes match | 20 / 20 found, 20 / 20 top-1 | passed |
| wrong generation (non-existent store) | hybrid → lexical-only with hits | `degraded/lexical-only`, `not-found: 404`, 10 hits | passed |
| wrong generation, semantic-only | explicit `unavailable`, no hits | `unavailable`, 0 hits | passed |
| provider timeout (1 ms deadline) | hybrid → lexical-only | `degraded/lexical-only`, `timeout` | passed |
| wrong release filter | no hosted hit passes | 0 hits | passed |
| stale generation (workspace fingerprint differs) | no provider call; lexical-only | `degraded/lexical-only`, `stale generation` | passed |
| injected unknown hosted hit | rejected, never shown | 1 rejected | passed |

## S5.7 Usage accounting (ledger `runs/release-v2/custody/semantic/usage-ledger.json`)

| item | count |
| --- | --- |
| generations started | 1 (of 2 allowed) |
| file uploads | 1,189 (2,535,616 bytes) |
| other API calls (store create, batch create+poll, file list pages, retrieve) | 17 |
| search calls | **94** (68 eval queries; the hybrid pass reused them from cache; 20 round trips; 5 fallback probes; 1 CLI smoke search) |
| provider-reported storage | `usage_bytes` 4,206,086 (~4.2 MB) |
| errors | none (no quota, billing, auth or rate-limit responses) |

Paid amounts: the Vector Store API does not return a charge, and I did not hardcode provider prices. The billable
drivers are 4.2 MB of vector storage per day while the generation is retained, 94 searches, and indexing of ~0.63M
estimated tokens. The lead can read the actual charge in the provider dashboard. The generation is kept (lead
instruction); retire it with `semantic retire` and delete only after retention.

## S5.8 Files and wiring

New / changed (owned):
- `packages/schema-workspace/src/semantic/{provider,corpus,generation,vector-store-retriever,config,qualify,env,cli}.ts`, `semantic/semantic.test.ts` (10 offline tests on an in-memory provider)
- `retriever.ts`: `SemanticResult.rejected`
- `workspace.ts`: counts adapter rejections
- `eval.ts`: discovery tokens, bootstrap CIs, latency, paired CI
- `doctor.ts`: offline generation compatibility check
- `cli.ts`: `semantic` subcommands; search / eval / doctor use the env-bound retriever
- `index.ts`: exports
- `package.json`: `openai@7.23.0`; `pnpm-lock.yaml` updated by pnpm
- `workspace-v2.test.ts`, `skill-examples.test.ts`: hermetic semantic env
- `.agents/skills/biotech-schema-explore/references/semantic-fallback.md`: rewritten

Executor wiring (S3), from `@bks/schema-workspace`:
- `semanticFromEnv(ws).retriever` → pass as `retriever` to `searchWorkspace` and `doctor`.
- `generationCompatibility(ws)` for `describe`: `capabilities["schema.search"].modes` should advertise `semantic` / `hybrid` only when it returns `compatible` and credentials are configured.
- The workspace `manifest.json` `semantic.status` stays a static `not-configured`. The runtime binding is the custody pointer, not the generated tree, so the workspace fingerprint does not change when a generation is published.

Proposed `.env.example` lines (I did not edit that file):

```bash
BKS_SEMANTIC_ENABLED=false            # true: serve semantic / hybrid schema search from the bound generation
BKS_SEMANTIC_CUSTODY_DIR=             # default runs/release-v2/custody/semantic (current.json pointer, mappings)
BKS_SEMANTIC_GENERATION=              # optional: bind a generation id instead of current.json
BKS_SEMANTIC_DEADLINE_MS=5000         # hosted search deadline
BKS_SEMANTIC_MAX_REQUESTS=600         # per-process hosted search ceiling
BKS_SEMANTIC_MAX_SPEND_USD=           # optional spend ceiling (with BKS_SEMANTIC_COST_PER_SEARCH_USD)
BKS_SEMANTIC_COST_PER_SEARCH_USD=
# OPENAI_API_KEY (already listed) is read server-side only; sandbox agents call the admitted executor endpoint.
```

## S5.9 Commands and results

| command | result |
| --- | --- |
| `pnpm exec vitest run --project schema-workspace` | 7 files, **88 / 88 passed** (offline; includes 10 semantic tests) |
| `pnpm workspace:verify` | ok (fingerprint unchanged `sha256:1e38ee06…`) |
| `bks-schema semantic export` (pre-upload estimate) | 1,189 documents, 2,535,616 B, ~632.9k tokens, within the 25 MB ceiling |
| `bks-schema semantic generate --live` | ready: 1,189 / 1,189, 0 failed, 0 attribute mismatches |
| `bks-schema semantic publish --generation g20261012T011448Z-4d8bdb77` | ok |
| `bks-schema doctor` (`BKS_SEMANTIC_ENABLED=true`) | all pass; `semantic: generation ready and built from this workspace (1189 documents); retriever available` |
| `bks-schema semantic qualify --live --tasks evals/v2/schema-discovery/tasks.json` | completed: section S5.5 / S5.6; 93 provider searches |

Unrun / limits:
- Not run here: the blinded agent-paired arms (S9), a cold-cache hybrid latency series, and live retirement / deletion.
- Hosted rank order is provider-defined and may drift; results are bound to this generation id.
- With `BKS_SEMANTIC_ENABLED` unset, the CLI and executor serve lexical only; semantic requests then return explicit `unavailable` / `degraded`.

## S5.10 Gate C search evidence rows

| check | identity | env | command | timestamp (UTC) | result | evidence |
| --- | --- | --- | --- | --- | --- | --- |
| corpus export + estimate | release `sha256:c0dd7837…`, workspace `sha256:1e38ee06…`, corpus `sha256:4d8bdb77…` | local Windows, Node 24.18.0, `openai` 7.23.0 | `bks-schema semantic export` / `generate` | 2026-10-12T01:14Z | 1,189 docs, 2.54 MB, ~633k tokens; approved paths only | `runs/release-v2/custody/semantic/g20261012T011448Z-4d8bdb77/corpus-manifest.json` |
| schema-index generation | generationId `g20261012T011448Z-4d8bdb77`; store id at `custody/semantic/g20261012T011448Z-4d8bdb77/generation.json#storeId` | same + OpenAI Vector Stores (server-side key) | `bks-schema semantic generate --live` | 2026-10-12T01:24Z | ready 1,189 / 1,189; 0 failed; 0 attribute mismatches; usage_bytes 4,206,086 | `custody/semantic/g20261012T011448Z-4d8bdb77/generation.json`, `mapping.json`, `custody/semantic/generate-run.json` |
| atomic publish | same | same | `bks-schema semantic publish --generation …` | 2026-10-12T01:24:45Z | current.json bound; history empty (first generation) | `custody/semantic/current.json` |
| generation compatibility | same | same | `bks-schema doctor` | 2026-10-12T01:31Z | pass (ready, same release / workspace / corpus) | doctor output (this session) |
| discovery eval: lexical / semantic / hybrid | 68 frozen tasks (FREEZE `sha256:cb79e68a…`), same generation | same | `bks-schema semantic qualify --live --tasks evals/v2/schema-discovery/tasks.json` | 2026-10-12T01:28Z | R@10 0.905 / 0.821 / 0.882; hit@10 0.956 / 0.882 / 0.927; below the 0.95 gate | `custody/semantic/g20261012T011448Z-4d8bdb77/qualification/{qualification,eval-lexical,eval-semantic,eval-hybrid}.json` |
| default-routing decision | same | same | same | 2026-10-12T01:28Z | lexical default kept (paraphrase +0.0 pp, tokens −1.6%); semantic-on-demand qualified | `qualification.json#decision` |
| exact round trip | 20 sampled documents | same | same (round-trip step) | 2026-10-12T01:28Z | 20 / 20 found, 20 / 20 top-1 | `qualification.json#roundTrip` |
| stale / outage / wrong-release / injected-hit fallback | same | same | same (fallback step) | 2026-10-12T01:28Z | 6 / 6 passed (lexical-only or explicit unavailable; hits rejected) | `qualification.json#fallback` |
| usage accounting | ledger | same | ledger | 2026-10-12T01:31Z | 1 generation, 1,189 uploads (2,535,616 B), 94 searches, 17 other calls, 0 errors | `custody/semantic/usage-ledger.json` |
| offline tests (no provider) | package `@bks/schema-workspace` | local | `pnpm exec vitest run --project schema-workspace` | 2026-10-12T01:31Z | 88 / 88 passed | this session |


---

# Lexical improvement round (lead-authorized, general mechanisms only)

2026-10-12 (UTC). **The 68 frozen tasks had been seen before** (S2 runner development). For this round I did not
re-read the task or gold files, did not touch `evals/**`, and special-cased no phrase. The eval was run once per mode
after the change.

## R.1 Changes (all in `packages/schema-workspace/src`)

1. **Query expansion through release vocabulary.**
   - Single-word `terminology.yaml` terms and aliases found as a word in a query now match their `term:` row as a weak +40 boost; previously only multi-word phrases and whole-query exact matches counted.
   - Lookup rows (`aliases.yaml` v1 ids, terms, questions) expand to their targets in proportion to match strength: all targets for id / name / alias / code-name / phrase matches, at most 2 for weak matches.
   - Enum, predicate and type names that a card links or code-spans become field-level keywords of that card (see 3).
2. **Multi-hop phrasing.** When a query names two or more node types, the relationship types on the shortest typed
   schema paths between consecutive named types (release topology, `joins: exclude`, ≤ 4 hops, 2 paths per pair) are
   inserted right after the named types (`matchedOn: "path"`). Exact / mention matches of node cards stay first.
   Pattern and task cards now carry their node types (pattern labels, task node / relationship types) as keywords.
3. **Section-level matching.** Each index row gains `keywords` (title, `##`/`###` headings, code spans, link texts, field / type names) and `bodyTokens` (the remaining card words). Token-class weights: name / alias 1.0 > keywords 0.8 > tokens / summary 0.6 > body 0.35.
4. **Normalization.** snake_case is split in queries and names; plurals ending in `-ves` → `-f` were added to the light stemmer. Ties are deterministic as before (score, kind priority, id).
5. **Defect fix (disclosed).** The S2 "kind hint" regexes (`which relationship`, `node type`, `predicate`) contained literal backspace characters instead of `\b`, an escaping slip when I patched the file. **The hint was inert in every S2 and S5 measurement.** It works from this round on.

`CardRecord` gains optional `keywords` and `bodyTokens` (contracts patch in section 7: add both as optional string
arrays). `search/index.jsonl` grows from 1.78 MB to 2.69 MB.

## R.2 Results (frozen 68 tasks, seen previously)

| measure | before (S5, lexical) | after (lexical) | after (hybrid) |
| --- | --- | --- | --- |
| Recall@10 [95% CI] | 0.905 [0.839, 0.961] | **0.893** [0.816, 0.959] | 0.893 (degraded to lexical-only: stale generation) |
| hit@10 [95% CI] | 0.956 [0.897, 1.000] | 0.912 [0.838, 0.971] | same |
| exact-ID top-1 (all / exact category) | 0.574 / 0.792 | **0.632 / 0.958** | same |
| MRR | 0.707 | 0.711 | same |
| paraphrase Recall@10 [CI] | 0.85 [0.70, 1.00] | 0.80 [0.60, 0.95] | same |
| negative Recall@10 / hit@10 | 0.96 / 1.00 | 1.00 / 1.00 | same |
| cross-domain Recall@10 / hit@10 | 0.71 / 1.00 | 0.67 / 0.80 | same |
| median discovery tokens | 62 | 62 | 62 |

Paired after − before (lexical): Recall@10 −1.3 pp, 95% CI **[−8.1, +4.9]**; paraphrase CI [−15, 0]; 5 tasks
improved, 5 got worse.

**Recall did not improve.** The round improves exact-ID top-1 (exact category 0.79 → 0.96) and negatives. It loses
some paraphrase and cross-domain top-10 coverage. The paired difference is not distinguishable from zero. No mode
reaches the 0.95 gate. I made no further adjustment after the single run. The certifying measurement should be the
qualification role's freshly seeded blinded task set. The lead may keep this round (better exact-ID, unchanged
overall within the CI) or revert it: the changes are isolated to `search.ts` scoring and the two new index fields. The
kind-hint fix should be kept either way.

## R.3 Workspace and semantic generation state

| item | value |
| --- | --- |
| new workspaceFingerprint | **`sha256:f2fbe6c75c75140348622fc6b9d74e56e3986fe10cfc88dad6c7a18db55f509e`** (1,337 files; `pnpm workspace:build && pnpm workspace:verify` ok) |
| package tests | `pnpm exec vitest run --project schema-workspace`: 7 files, **90 / 90 passed** (2 new tests: path expansion, field keywords) |
| live generation | `g20261012T011448Z-4d8bdb77` reported **stale** by `bks-schema semantic status` and `doctor` (warn): workspace fingerprint differs; corpus digest differs |
| hybrid behavior now | `degraded` / `lexical-only` with reason `stale generation: built for workspace sha256:1e38ee06…`; no provider calls (ledger unchanged: 94 searches) |

Why the corpus digest changed although no card body changed: each corpus document embeds the workspace fingerprint
in its header, and the `workspace_fingerprint` attribute carries it too. Any workspace rebuild therefore stales the
generation.

**Cost of a refresh (not run; needs the lead's go):**
- a new generation: 1,189 uploads (~2.54 MB, ~633k estimated tokens to index), ~10 minutes, ~4.2 MB more vector storage per day while both generations are retained (until the old one is retired and, after retention, deleted);
- it uses the last of the 2 authorized generations;
- re-qualifying costs ~93 searches (ledger would reach ~187 of 600).

**Cheaper path for future rebuilds (recommendation, not implemented):** drop the workspace fingerprint from the
document text and bind it only through attributes plus the local mapping. A rebuild that leaves card bodies unchanged
would then need only per-file attribute updates (`vectorStores.files.update`, 1,189 calls, no re-upload or
re-embedding). Card-body changes would still require a new generation.

## R.4 Evidence rows

| check | identity | env | command | timestamp (UTC) | result | evidence |
| --- | --- | --- | --- | --- | --- | --- |
| workspace rebuild + verify | release `sha256:c0dd7837…`, workspace `sha256:f2fbe6c7…` | local Windows, Node 24.18.0 | `pnpm workspace:build && pnpm workspace:verify` | 2026-10-12T01:53Z | passed | this session |
| package tests | `@bks/schema-workspace` | same | `pnpm exec vitest run --project schema-workspace` | 2026-10-12T01:52Z | 90 / 90 | this session |
| lexical eval after round | 68 frozen tasks (seen previously) | same | `bks-schema eval --tasks evals/v2/schema-discovery/tasks.json --mode lexical --json` | 2026-10-12T01:55Z | R@10 0.893 [0.816, 0.959], hit@10 0.912 (no improvement) | `runs/release-v2/custody/semantic/round2/eval-lexical.json` |
| hybrid eval after round | same; generation `g20261012T011448Z-4d8bdb77` | same, `BKS_SEMANTIC_ENABLED=true` | `bks-schema eval … --mode hybrid --json` | 2026-10-12T01:55Z | 68 / 68 degraded to lexical-only (stale generation); no provider calls | `runs/release-v2/custody/semantic/round2/eval-hybrid.json` |
| generation staleness | same | same | `bks-schema semantic status`; `bks-schema doctor` | 2026-10-12T01:54Z | `stale` (fingerprint and corpus digest differ); doctor warn, overall ok | this session |


---

# Final state after the lead's decision (round not kept; fingerprint moved to attributes; second generation)

2026-10-12 (UTC). No tuning after the revert. The frozen tasks had been seen previously; the numbers below come from
the required `qualify` rerun, not from an optimization loop.

## F.1 Search configuration

- **Reverted** to the pre-round scoring (the 0.905 configuration): names / aliases 1.0, tokens + summary 0.6; phrase-alias, code-name mention, prefix and contains tiers; full lookup-row expansion. Removed: path-relationship insertion, confidence-capped lookup expansion, single-word term boost, keyword / body weighting.
- **Kept:**
  - the kind-hint fix (word boundaries instead of backspace characters), so the soft "which relationship / node type / predicate" hint now actually works;
  - the index fields `keywords` and `bodyTokens` (carried, not scored).
- **Normalization:** `_` splitting is kept; it is a strict no-op because `tokenize` already splits on `_`. The `-ves → -f` stemmer rule was **dropped as not neutral**: it stops "derivatives" matching "derivative", which the plain plural rule handled.
- **Result:** the only scoring difference from the S2 / S5 0.905 configuration is the now-working kind hint.

## F.2 Corpus header and refresh

- **Document header:** keeps the title, card id, card digest, section, kind, module, `releaseId` and `schemaReleaseDigest`. The **workspace fingerprint is now only an attribute** (`workspace_fingerprint`).
- **`contentDigest`:** the corpus manifest now also has a `contentDigest` that excludes the fingerprint. A rebuild that leaves card bytes unchanged keeps the `contentDigest` and every document sha256.
- **`semantic refresh --live [--from <generation>]`:** creates a new generation and a new store, so the old store is never mutated and generations stay immutable. It reuses every uploaded file whose document sha256 is unchanged, uploads only changed or new documents, and attaches all files with the current attributes.
  - Attribute-only case: 0 uploads.
  - Tests: offline, a fingerprint-only rebuild gives 0 uploads, every file is reused and the old store's attributes are untouched; one changed document gives exactly 1 upload.
  - `semantic recheck` keeps the old resume-polling behaviour.
- **Why not update attributes in place on the old store:** that would mutate the active generation, which SPECIFICATION 4.2 forbids. The provider re-indexes reused files when attaching them to the new store; the cost is indexing, not uploading.
- **Stale detection** now compares the corpus document by document (sha256 plus attributes without the fingerprint):
  - `compatible`: identical documents, same fingerprint;
  - `refreshable`: identical documents, only the fingerprint attribute differs;
  - `stale`: documents changed (`changedDocuments: {changed, added, removed}`);
  - `not-ready`.
  - `doctor` and `semantic status` report these states.

## F.3 Identities (final)

| identity | value |
| --- | --- |
| release | `biotech-schema-v2.0.1`, `sha256:c0dd7837df029695e26f00d99f482483fb715e1cbcd4c4c4b1d8e3d31d6d3b06` |
| **workspaceFingerprint (final)** | **`sha256:f2fbe6c75c75140348622fc6b9d74e56e3986fe10cfc88dad6c7a18db55f509e`** (1,337 files; unchanged by the scoring revert, which touches no rendered file) |
| **current generation** | **`g20261012T020930Z-31d7388f`**: ready 1,189 / 1,189, 0 failed, 0 attribute mismatches, `usage_bytes` 4,207,871; published 2026-10-12T02:20:21Z |
| store id | custody only: `runs/release-v2/custody/semantic/g20261012T020930Z-31d7388f/generation.json#storeId` |
| corpusDigest / contentDigest | `sha256:31d7388fcfb685f0f8951b34a63a38535842ace8ce33777a881b275f7f27b0de` / `sha256:b22a09b4eb319982eed534032085868fccda1533cb5e4e854e128811d3fcf2bc` |
| previous generation | `g20261012T011448Z-4d8bdb77`: **deactivated**, retained until 2026-10-26T02:20:22Z, not deleted, kept in pointer history |
| reuse | the refresh path reused 0 files: every document header changed when the fingerprint left the text, so a full generation was expected and authorized (1,189 uploads) |

## F.4 Qualification on the final generation (`semantic qualify --live`; tasks seen previously)

| mode | Recall@10 [95% CI] | hit@10 [95% CI] | exact-ID top-1 (all / exact category) | MRR | median tokens | latency p50 / p95 |
| --- | --- | --- | --- | --- | --- | --- |
| lexical | **0.942** [0.891, 0.983] | **0.985** [0.956, 1.000] | 0.632 / 0.917 | 0.742 | 62 | 6 / 10 ms |
| semantic | 0.840 [0.760, 0.909] | 0.927 [0.853, 0.985] | 0.603 / 0.875 | 0.716 | 62 | 1,369 / 2,301 ms |
| hybrid | 0.903 [0.837, 0.959] | 0.956 [0.897, 1.000] | 0.794 / 1.000 | 0.854 | 61 | cached semantic (cold ≈ semantic latency) |

| category | lexical R@10 / hit@10 | semantic | hybrid |
| --- | --- | --- | --- |
| exact (24) | 1.00 / 1.00 | 1.00 / 1.00 | 1.00 / 1.00 |
| paraphrase (20) | 0.95 / 0.95 | 0.75 / 0.75 | 0.85 / 0.85 |
| negative (14) | 1.00 / 1.00 | 0.93 / 1.00 | 1.00 / 1.00 |
| cross-domain (10) | 0.71 / 1.00 | 0.51 / 1.00 | 0.64 / 1.00 |

- **Lexical vs the S5 baseline (0.905):** the gain to 0.942 comes from the kind-hint fix alone, since the scoring is otherwise identical.
- **Gate:** lexical is still below the 0.95 Recall@10 gate. Its CI [0.891, 0.983] includes it. The certifying number is the qualification role's fresh blinded set.
- **Hybrid vs lexical, paired:** paraphrase −10 pp (CI [−25, 0]); Recall@10 −3.9 pp (CI [−8.8, −0.05]); median tokens −1.6%. **Decision: lexical stays the default; hybrid is not promoted.**
- **Semantic-on-demand stays qualified:** round trips 20 / 20 found, 20 / 20 top-1; all 6 fallback tests passed (wrong generation, semantic-only unavailable, timeout, wrong release filter, stale fingerprint, injected hit).
- **What hybrid still improves:** exact-ID top-1 (0.632 → 0.794) and MRR (0.742 → 0.854).

## F.5 Usage (cumulative ledger)

| item | value | ceiling |
| --- | --- | --- |
| generations started | 2 (`g20261012T011448Z-4d8bdb77`, `g20261012T020930Z-31d7388f`) | 2 |
| uploads | 2,378 files, 5,073,610 bytes (1,189 + 1,189) | 25 MB per generation |
| search calls | **187** (94 before + 93 this qualification) | 600 |
| other calls | 34 | — |
| provider storage | 4,206,086 B (deactivated, retained) + 4,207,871 B (current) | — |
| errors | none (no quota, billing, auth or rate-limit responses) | — |

The generation budget is now exhausted. A future rebuild that leaves card bytes unchanged is `refreshable` and
needs 0 uploads, but it still creates a store and counts as a generation; it needs the lead's authorization.

## F.6 Contracts patch line for the executor role (`packages/contracts/src/workspace.ts`, `CardRecord`)

Add to the section 7 `CardRecord` shape, after `tokens`:

```ts
  keywords: z.array(z.string()).optional(),   // field-level tokens: headings, code spans, link texts, field / type names (carried, not scored)
  bodyTokens: z.array(z.string()).optional(), // remaining card body words (carried, not scored)
```

(Already listed in section 7 and also needed: `pendingProposalKinds`, `readOperations` optional string arrays, and the
`operational` CardKind with `LOOKUP_KINDS` including it.)

## F.7 Commands and evidence

| check | identity | env | command | timestamp (UTC) | result | evidence |
| --- | --- | --- | --- | --- | --- | --- |
| package tests | `@bks/schema-workspace` | local Windows, Node 24.18.0, `openai` 7.23.0 | `pnpm exec vitest run --project schema-workspace` | 2026-10-12T02:05Z | 7 files, **91 / 91** passed | this session |
| rebuild + verify | workspace `sha256:f2fbe6c7…` | same | `pnpm workspace:build && pnpm workspace:verify` | 2026-10-12T02:08Z | ok, 1,337 files | this session |
| final generation | `g20261012T020930Z-31d7388f`; store id at custody path | same + OpenAI Vector Stores (server-side key) | `bks-schema semantic refresh --live --from g20261012T011448Z-4d8bdb77` | 2026-10-12T02:20Z | ready 1,189 / 1,189; 0 reused (headers changed); 0 failed | `runs/release-v2/custody/semantic/refresh-run.json`, `.../g20261012T020930Z-31d7388f/generation.json` |
| publish + retire | same; previous `g20261012T011448Z-4d8bdb77` | same | `semantic publish`; `semantic retire` | 2026-10-12T02:20Z | current bound; previous deactivated, retained to 2026-10-26 | `custody/semantic/current.json`, `.../g20261012T011448Z-4d8bdb77/generation.json` |
| compatibility | same | same | `semantic status`; `doctor` (`BKS_SEMANTIC_ENABLED=true`) | 2026-10-12T02:21Z | `compatible` (0 changed documents); doctor all pass, semantic pass | this session |
| qualification | 68 frozen tasks (seen previously) | same | `bks-schema semantic qualify --live --tasks evals/v2/schema-discovery/tasks.json` | 2026-10-12T02:22Z | R@10 lexical 0.942 / semantic 0.840 / hybrid 0.903; lexical default kept; round trip 20 / 20; fallback 6 / 6 | `custody/semantic/g20261012T020930Z-31d7388f/qualification/qualification.json`, `custody/semantic/qualify-run-2.json` |
| usage | ledger | same | ledger | 2026-10-12T02:22Z | 2 / 2 generations, 187 / 600 searches, 0 errors | `custody/semantic/usage-ledger.json` |


---

# Structured discovery mode (`--expand paths`, eval `structured` / `structured-hybrid`)

2026-10-12 (UTC). Implemented without reading `evals/**`; tests use synthetic queries only. No eval run was made in
this step, and no semantic generation was created.

## S.1 Definition (as implemented in `searchWorkspace(ws, { ..., expand: "paths" })`)

1. **Base search:** lexical, or hybrid for the hybrid variant, with limit 10. The candidates are the **cards** among those 10 hits; lookup rows (old ids, terms, questions) are dropped after their targets have been expanded, so they can leave room.
2. **Path runs:** take the node-kind cards among the top 5 search cards, in rank order. With at least two distinct node types, run `path top1 top2 --max-hops 3 --limit 2 --joins fill`. With a third node type, also run `path top1 top3`.
3. **Append:** add the cards on those paths in path order (start node, relationship or predicate-join card, next node, ...), deduplicated and skipping cards already present, until there are 10 candidates.
4. **Result:**
   - the 10 candidates;
   - `route[]`: `{id, rank, source: "search"|"path", via: <the exact path call>}`;
   - `calls[]`: the exact `bks-schema` invocations;
   - `expansion`: `{baseLimit, nodesConsidered, pathRuns[{from, to, paths, truncated}], instanceClaim: false}`.

Constants are in `STRUCTURED_EXPANSION` (candidates 10, node window 5, max hops 3, path limit 2, joins `fill`). Path
ranking is the existing `findPaths` order: length, typed before joins, evidence spine, signature, so the result is
deterministic.

**Note for the measurement:** with `baseLimit` 10 (the default, per the definition), path cards only enter when the
10 search hits contain lookup rows or fewer than 10 cards. `--base-limit N` (N ≤ 10) reserves room for path cards; it
is offered for the qualification role's arm design, not chosen by me.

## S.2 Surfaces

- **CLI:**
  - `bks-schema search "<words>" [--mode lexical|hybrid] --expand paths [--base-limit N] [--json]` (text output also prints the calls);
  - `bks-schema eval --tasks <file> --mode structured|structured-hybrid` (per-task `fromPath` count).
- **Library:** `searchWorkspace` options `expand`, `baseLimit`; `SearchResponse.route`, `.calls`, `.expansion`; `EvalMode` type; `STRUCTURED_EXPANSION`. The executor can pass `expand: "paths"` through `/schema/search` and MCP `schema_search` unchanged.
- **Docs:**
  - START_HERE command table gains the `search --expand paths` row; this is the change that moved the fingerprint;
  - skill `references/command-cookbook.md` gains a "Structured discovery" section (POSIX, `jq`, PowerShell);
  - `SKILL.md` step 5 names the command; the file is now 122 lines.

## S.3 Tests (synthetic queries; no eval tasks)

`workspace-v2.test.ts`, 3 new tests:
- a two-type query yields search cards first, then path cards only, each lying on the stated legal path; at most 10 unique cards, no lookup rows, exact `calls`, deterministic;
- a single-node-type query performs no expansion; `baseLimit` 4 leaves room for path cards;
- `evalSearch` in `structured` mode is deterministic on synthetic tasks.

## S.4 Results

| check | result |
| --- | --- |
| `pnpm build` | passed |
| `pnpm exec vitest run --project schema-workspace` | 8 files, **98 / 98** passed (the 8th file is not mine) |
| `pnpm workspace:build && pnpm workspace:verify` | ok; **new workspaceFingerprint `sha256:37967296f6a40d5abb198152a92f4523f5abf743202d1acb98f52a0f6894dcbf`** (1,337 files) |
| `bks-schema semantic status` / `doctor` | generation `g20261012T020930Z-31d7388f` is **refreshable**: 0 documents changed, only the `workspace_fingerprint` attribute differs; doctor warn, overall ok |

**Consequence for semantic serving:** until a refresh, semantic and hybrid (and `structured-hybrid`) degrade
explicitly to lexical-only, because hosted hits carry the previous fingerprint and are rejected. The refresh is the
attribute-only path: `bks-schema semantic refresh --live` with 0 uploads (all 1,189 files reused), a new store
attached with the new attribute, and about 4.2 MB more storage while both are retained. It still counts as a
generation, and the authorized budget (2 / 2) is used up, so it needs the lead's go. Ledger unchanged: 2 generations,
187 / 600 searches.

## S.5 Evidence rows

| check | identity | env | command | timestamp (UTC) | result | evidence |
| --- | --- | --- | --- | --- | --- | --- |
| build | BKS working tree | local Windows, Node 24.18.0 | `pnpm build` | 2026-10-12T03:24Z | passed | this session |
| package tests | `@bks/schema-workspace` | same | `pnpm exec vitest run --project schema-workspace` | 2026-10-12T03:24Z | 98 / 98 | this session |
| workspace rebuild + verify | release `sha256:c0dd7837…`, workspace `sha256:37967296…` | same | `pnpm workspace:build && pnpm workspace:verify` | 2026-10-12T03:25Z | ok, 1,337 files | this session |
| generation compatibility | `g20261012T020930Z-31d7388f` | same | `bks-schema semantic status`; `doctor` | 2026-10-12T03:25Z | refreshable (0 documents changed) | this session |


---

# Structured discovery, follow-up (base limit honoured; widened generic expansion)

2026-10-12 (UTC). Still blind to every task file; no eval run; lexical scoring unchanged; no semantic refresh.

## W.1 Base limit

- **Confirmed defect:** `bks-schema eval` did not read `--base-limit` (only `search` did). Every structured eval so far therefore ran with base limit 10.
- **Fixed:** `eval --base-limit N` passes N through; the eval output records `baseLimit` (the value used for structured modes, `null` for plain modes).
- **Default:** the structured base limit is now **5**, the same top-5 window used for node-type detection, for both `search --expand paths` and `eval --mode structured|structured-hybrid`. The maximum stays 10.

## W.2 Widened expansion (`STRUCTURED_EXPANSION` = candidates 10, default base limit 5, node window 5, max 3 endpoints, max hops 3, path limit 2, joins `fill`)

1. **Endpoints:** if the query text names two or more node types, by exact type name or a registered alias of the node card (aliases of at least 4 characters that are multi-word, code-like or the type name itself), those types in query order. Otherwise the distinct node types among the top 5 search cards, in rank order. At most 3. `expansion.endpointSource` = `query` | `search`.
2. **Pairs:** `path a b --max-hops 3 --limit 2 --joins fill` for **every** endpoint pair: 1-2, 1-3, 2-3.
3. **Path cards** (nodes, relationships, predicate joins) are ordered by **path length**, then by the ranks of the endpoints that produced the path, then by path and position. They are deduplicated and skip cards already present.
4. **Reference cards (when slots remain):** for each relationship card on the paths, its same-name authorizing predicate (`typedEdge`), then the predicate and assessment cards linked from that relationship card, in document order. `route.source = "reference"`, `via` = the relationship card id.
5. **Cap and output:** 10 candidates, deterministic. `route` gives search / path / reference with `via`; `calls` gives the search call plus one `path` call per pair; `expansion` carries `baseLimit`, `endpointSource`, `nodesConsidered`, `pathRuns`, `instanceClaim: false`.

Example (synthetic): `search "how does a label version reach an ingredient material and a Product" --expand paths`
→ endpoints from the query text `LabelVersion, IngredientMaterial, Product`; 3 path calls; 5 search cards followed by
path cards, shortest paths first.

## W.3 Tests (synthetic queries; `workspace-v2.test.ts`)

- **Base expansion:** the search window is at most the base limit (default 5); path entries lie on their stated legal paths; reference entries are `pred:`/`asmt:` cards whose `via` relationship is itself a candidate; the result is deterministic.
- **Endpoints and ordering:** query-named endpoints are preferred and keep query order; all three pairs run; the first path card lies on the shortest path among all pairs.
- **Limits:** a single node type gives no expansion; `baseLimit` 3 is respected and recorded.
- **Eval:** structured mode records `baseLimit` (5 by default, 3 when given, `null` for lexical) and is deterministic.

## W.4 Results

| check | result |
| --- | --- |
| `pnpm build` | passed |
| `pnpm exec vitest run --project schema-workspace` | 8 files, **99 / 99** passed |
| `pnpm workspace:build && pnpm workspace:verify` | ok; **new workspaceFingerprint `sha256:287f02bc6ad63e5461f3b21f94d6864ced28c5a322e11751e82dec87dc3fa585`** (START_HERE command row updated) |
| semantic generation `g20261012T020930Z-31d7388f` | still **refreshable** (0 documents changed); not refreshed (budget 2 / 2 used, ledger 187 / 600 searches). Semantic, hybrid and structured-hybrid degrade to lexical-only until the lead authorizes the zero-upload refresh. |

Docs updated: START_HERE command row; skill `references/command-cookbook.md` "Structured discovery" section (new
algorithm, `--base-limit` default 5).

## W.5 Evidence rows

| check | identity | env | command | timestamp (UTC) | result | evidence |
| --- | --- | --- | --- | --- | --- | --- |
| build + tests | `@bks/schema-workspace` | local Windows, Node 24.18.0 | `pnpm build`; `pnpm exec vitest run --project schema-workspace` | 2026-10-12T03:34Z | passed; 99 / 99 | this session |
| workspace rebuild + verify | release `sha256:c0dd7837…`, workspace `sha256:287f02bc…` | same | `pnpm workspace:build && pnpm workspace:verify` | 2026-10-12T03:35Z | ok, 1,337 files | this session |
| generation compatibility | `g20261012T020930Z-31d7388f` | same | `bks-schema semantic status` | 2026-10-12T03:35Z | refreshable (0 changed documents) | this session |


---

# Structured discovery, diagnosis follow-up (direction-first paths, path intent, adaptive base, edge-first fill)

2026-10-12 (UTC). From the qualification role's abstract diagnosis only; no task file read; lexical scoring
unchanged; no eval run; no semantic refresh.

## D.1 Changes

1. **`paths()` ranking (default `rank: "direction-first"`).** Hops traversed against their declared direction ascending, then length, then category (typed < interface-join < predicate-join), then the existing evidence-spine and signature tie-breaks.
   - Endpoint rank applies in the structured fill (D.1.4), where several endpoint pairs are merged.
   - Every path now reports `againstDirection`, and every hop already carries `traversal`; CLI text output prints `against=N`.
   - `rank: "length-first"` keeps the previous order. The renderer uses it for the evidence-path rule card, so card bytes are unchanged (corpus: 0 documents changed).
2. **Path intent gate.** Expansion runs only when the query names two or more node types (exact name or registered alias) or contains explicit path wording: `between`, `path(s)`, `trace/traced/tracing`, or `from … to` (a lone "to" is not counted, since it appears in most questions). Otherwise the result is the plain top 10 search cards (`expansion.pathIntent: "none"`, `baseLimitRule: "no-expansion"`).
3. **Adaptive base limit.**
   - Formula: `10 − pathLimit (2) × shortest legal path length`, clamped to [4, 7]; 5 when no path is known.
   - The shortest length is a cheap BFS over the adjacency (`shortestPathLength`), minimum over the endpoint pairs, before any path enumeration. An explicit `baseLimit` overrides it.
   - `expansion` reports `baseLimit`, `baseLimitRule` (`adaptive` | `explicit` | `fallback` | `no-expansion`) and `shortestPathLength`.
   - In eval: the report's `baseLimit` is `"adaptive"` (or the explicit number); each task records `baseLimitUsed` and `pathIntent`.
4. **Fill order.**
   - First: the relationship and predicate-join cards of all returned paths.
   - Then: the node cards on them, both ordered by (against-direction hops, length, category, endpoint ranks, path, position).
   - Then, while slots remain: referenced predicate / assessment cards.
   - Cap 10, deterministic; `route`, `calls` and `expansion` reported.

**Observations for the lead (not acted on):**
- Under the requested order (against, then length, then category), a direction-consistent 1-hop interface or predicate join still ranks above a 2-hop typed path; category only decides at equal length and direction. If typed-first is the intent, category would have to precede length.
- The kernel evidence chain from a SourceLocator to its Source walks `HAS_LOCATOR` / `HAS_SNAPSHOT` against their stored direction, so `path` now ranks it below direction-consistent alternatives. This is why the evidence-path card is pinned to `length-first`.

## D.2 Tests (synthetic; `workspace-v2.test.ts`)

- direction-consistent path first (synthetic topology with an equal-length against-direction path; per-hop `traversal` auditable; release topology order monotone in `againstDirection`);
- no expansion without path intent (plain top 10 equals the plain search cards; a lone "to" is not intent; named types and path wording are);
- adaptive base (`[1, 2, 3, 4, null] → [7, 6, 4, 4, 5]`; LabTest→Biomarker shortest 2 → base 6; explicit override);
- relationship cards before intermediate node cards, then references; cap 10; deterministic;
- query-named endpoints and all pairs;
- eval records `"adaptive"`, per-task `baseLimitUsed` and `pathIntent`.

## D.3 Results

| check | result |
| --- | --- |
| `pnpm build` | passed |
| `pnpm exec vitest run --project schema-workspace` | 8 files, **102 / 102** passed. An earlier run in this step showed 1 failure in S1's in-flight `release-v2.0.2.test.ts` (vector-gated template count); it passed on the final run |
| `pnpm workspace:build && pnpm workspace:verify` | ok; **new workspaceFingerprint `sha256:4f37678b39de7951dbf0c10f8de76e59fa8000abbed6f4a8b5b9c515108d2e63`** (START_HERE command row updated) |
| `doctor` | ok (cards, links, integrity pass) |
| semantic generation `g20261012T020930Z-31d7388f` | still **refreshable** (0 documents changed); not refreshed; ledger 2 / 2 generations, 187 / 600 searches |

Docs: START_HERE command row; skill `references/command-cookbook.md` "Structured discovery" section rewritten for the
six-step algorithm.


---

# Release v2.0.2: final workspace; semantic refresh aborted at the upload cap

2026-10-12 (UTC).

## V.1 Workspace on `biotech-schema-v2.0.2`

| check | result |
| --- | --- |
| pin | `biotech-schema-v2.0.2`, schemaReleaseDigest `sha256:5fffb593c8ca94b289b768ac0a0b02df5739cb338b7a04ec88173589708c5a42`, schemaDigest `sha256:fe2cc50a…` (same SDL), queryCatalogDigest `sha256:6a2749032ed89c23b22de723ca0deb8d2b6132bf245da68ec8a1f4915795dbb8` |
| `pnpm build` | passed |
| `pnpm workspace:build && pnpm workspace:verify` | ok; **final workspaceFingerprint `sha256:a33cc35acfaec701549c2f84635d4cb0796d03ebc9f90d0633e4a8e14b11c941`**; 1,341 files (4 new pattern cards) |
| `bks-schema doctor` | ok: version, integrity (1,340 files hashed), cards (2,322 records; digests recompute), links, query catalog, pinned release v2.0.2, compatibility pass; semantic **warn (stale)**, see V.2 |
| `pnpm exec vitest run --project schema-workspace` | 8 files, **103 / 103** passed, including all 8 skill examples executed against a fresh v2.0.2 build |

**Skill examples adjusted** to the v2.0.2 catalog, which demotes many questions to `held` (54 supported / 391 held / 9 unsupported):
- `registry-versus-paper-estimate` now shows that `Q-D1-08` is `held` (its template exists but was demoted: no fixture-positive answer) and uses the supported `Q-D11-03` (template `QP/P-04a`);
- `podcast-recommendation` uses the supported `Q-D9-21` (template `D9/Q-D9-21`) and checks that `Q-D9-01` is `held`;
- both lessons now say that a held question is not a validated read route.

## V.2 Authorized refresh: aborted by the 300-upload cap (no provider call)

`bks-schema semantic refresh --live --from g20261012T020930Z-31d7388f --max-uploads 300 --max-generations 3` →
**exit 6, `UPLOAD_CAP`**: 1,193 planned uploads of 1,193 documents, 0 reusable. Nothing was sent to the provider; the ledger is unchanged (2 generations, 2,378 uploads, 187 searches); no generation directory was created. Evidence: `runs/release-v2/custody/semantic/refresh-v2.0.2-preflight.json`.

Why nothing is reusable (offline diff of the new corpus against the indexed corpus of `g20261012T020930Z-31d7388f`):

| class | documents |
| --- | --- |
| header-only change (card digest and release digest in the header) | 971 |
| body change | 218 (pattern 153 from the corrected catalog, node 26, relationship 23, module 15, rule 1) |
| new | 4 (new pattern templates) |
| unchanged | **0** |

Every document header carries the `schemaReleaseDigest` and the card digest, and every card digest changes with the
release, because card front matter embeds `schemaReleaseDigest`. As specified last round ("keep release identity …
card id/digest … in each uploaded document's header"), **any release bump therefore re-uploads every document**.
Without those two header fields, this release would have needed about **222 uploads** (218 body changes + 4 new),
within the cap. That saving only applies to the next release, not this one: the indexed generation's headers already
contain the v2.0.1 digests, so this transition needs a full upload whichever header design is chosen.

**Options for the lead (not taken):**
- **A. Authorize a full generation for v2.0.2:**
  - 1,193 uploads, ~2.54 MB (within the 25 MB ceiling), ~10 minutes;
  - generation 3 (the budget needs raising to 3);
  - then publish, deactivate-and-retain `g20261012T020930Z-31d7388f`, qualify with ~93 searches (ledger would reach ~280 of 600).
- **B. As A, plus moving release identity (release id, release digest, card digest) out of the document text into attributes only.** The next same-SDL release bump would then upload only documents with body changes (here ~222). It is a one-line header change in `corpus.ts`; the stale check already compares card digests through attributes.

**Current serving state:** the shipping workspace is `sha256:a33cc35a…`; the published generation
`g20261012T020930Z-31d7388f` is **stale** against it (release digest and documents differ). Semantic, hybrid and
structured-hybrid search degrade explicitly to lexical-only (exit 0 with `status: degraded`; semantic-only exit 4,
`unavailable`). Lexical and structured search are complete. `doctor` cannot report `compatible` until a v2.0.2
generation is built.

## V.3 Tooling added for the cap

`generate` / `refreshGeneration` accept `maxUploads` (pre-flight: planned uploads after reuse are counted from
custody; above the cap it throws `GenerationAbort("UPLOAD_CAP")` before writing the ledger or calling the provider)
and `maxGenerations` (lead-authorized budget for the run). CLI: `semantic refresh … --max-uploads N
--max-generations N` (exit 6 on the cap). Unit test (fake provider): a refresh planning 3 uploads with cap 2 aborts
with no provider call and no ledger change; with cap 3 it completes and uploads exactly 3.

## V.4 Evidence rows

| check | identity | env | command | timestamp (UTC) | result | evidence |
| --- | --- | --- | --- | --- | --- | --- |
| final workspace | release `sha256:5fffb593…`, workspace `sha256:a33cc35a…` | local Windows, Node 24.18.0 | `pnpm workspace:build && pnpm workspace:verify` | 2026-10-12T03:58Z | ok, 1,341 files | this session |
| doctor | same | same | `bks-schema doctor` | 2026-10-12T04:02Z | ok; semantic warn (stale) | this session |
| package tests + skill examples | `@bks/schema-workspace` | same | `pnpm exec vitest run --project schema-workspace` | 2026-10-12T04:01Z | 103 / 103 | this session |
| semantic refresh (authorized, capped) | from `g20261012T020930Z-31d7388f` | same | `bks-schema semantic refresh --live --from … --max-uploads 300 --max-generations 3` | 2026-10-12T04:02Z | aborted pre-flight: 1,193 > 300 uploads; no provider call | `runs/release-v2/custody/semantic/refresh-v2.0.2-preflight.json` |


---

# Option B: release-stable document headers; shipping generation for v2.0.2

2026-10-12 (UTC). Lead-authorized: Option B, a third generation (cap 1,300 uploads), qualify ≤ 100 searches.

## B.1 Design change

- **Document text** now carries only release-stable identity: title, card id, section id (with headings), kind, module, and the card summary.
- **Attributes only:** release digest, card digest and workspace fingerprint. There are 9 attribute keys within the 16-key bound: `release_digest`, `workspace_fingerprint`, `card_id`, `card_digest`, `kind`, `module`, `language`, `corpus_kind`, `section`. The 9th, `section`, carries the section id used for dedupe and rehydration.
- **Stale detection** now distinguishes:
  - `stale`: document bytes changed;
  - `refreshable`: identical bytes, but attributes differ (release digest, card digests, workspace fingerprint); `changedDocuments.attributesOnly` counts these;
  - `compatible`: identical bytes and identical attributes.
- **Renderer unchanged**, so the workspace fingerprint is still `sha256:a33cc35a…`.
- **CLI:** `search --mode structured|structured-hybrid` is an alias for lexical / hybrid with `--expand paths`, on the same code path as `eval --mode structured`.

## B.2 Shipping generation

| identity | value |
| --- | --- |
| release | `biotech-schema-v2.0.2`, `sha256:5fffb593c8ca94b289b768ac0a0b02df5739cb338b7a04ec88173589708c5a42` |
| **workspaceFingerprint (final)** | **`sha256:a33cc35acfaec701549c2f84635d4cb0796d03ebc9f90d0633e4a8e14b11c941`** (1,341 files, verify ok) |
| **generation (ships)** | **`g20261012T041326Z-6e991373`**: ready 1,193 / 1,193, 0 failed, 0 attribute mismatches, `usage_bytes` 3,853,911; published 2026-10-12T04:23:10Z |
| corpus | 1,193 documents, 2,322,023 B, ~579.5k estimated tokens, max ~1,154 / median ~353 tokens; corpusDigest `sha256:6e99137324f17190ad920106bd4cf4e780570fc2bbd0c2ef55f747187e804cb3` |
| store id | custody only: `runs/release-v2/custody/semantic/g20261012T041326Z-6e991373/generation.json#storeId` (leak scan of docs / src / skills / workspace: 0 hits for all three store ids) |
| reuse | 0 of 1,193 (every header changed with the new format; a full generation was expected and within the cap) |
| previous | `g20261012T020930Z-31d7388f` **deactivated**, retained to 2026-10-26T04:23:11Z; `g20261012T011448Z-4d8bdb77` deactivated, retained to 2026-10-26T02:20:22Z; neither deleted |
| doctor | all pass; **semantic: `compatible`**, generation ready and built from this workspace (0 changed, 0 attribute-only differences) |

## B.3 Qualification on the shipping generation (frozen 68 tasks; seen previously)

| mode | Recall@10 [95% CI] | hit@10 | exact-ID top-1 (all / exact category) | MRR | latency p50 / p95 |
| --- | --- | --- | --- | --- | --- |
| lexical | **0.942** [0.891, 0.983] | 0.985 | 0.632 / 0.917 | 0.742 | 4 / 11 ms |
| semantic | 0.819 [0.736, 0.895] | 0.912 | 0.618 / 0.792 | 0.734 | 1,452 / 1,856 ms |
| hybrid | 0.896 [0.827, 0.953] | 0.956 | 0.809 / 1.000 | 0.851 | cached semantic (cold ≈ semantic) |

- **Paired hybrid − lexical:** paraphrase −10 pp (CI [−25, 0]); Recall@10 −4.7 pp (CI [−9.8, −0.7]); median tokens −1.6%.
- **Decision unchanged:** lexical stays the default; hybrid is not promoted. Semantic-on-demand stays qualified: round trip 20 / 20 found and top-1; 6 / 6 fallback tests passed.

## B.4 Release-bump proof (offline, fake provider)

Test `semantic.test.ts`, "a release bump with identical card bodies needs zero uploads":
1. Generation on the current workspace, then publish.
2. Re-render the workspace from the same release bundle with a **new release id and digest** (`biotech-schema-v9.9.9`, `sha256:7…7`). Every card digest changes (more than 900 cards), because card front matter carries the release digest.
3. The document bytes of **every card with an identical body are unchanged** (more than 1,100 documents). The only body that changes is the one that names the release itself: the compatibility statement (`rules/compatibility.md`).
4. Compatibility is `refreshable` / `stale` only for that body change; `attributesOnly` equals the identical-body count.
5. A refresh with `maxUploads` equal to the body-changed count reuses every other file, uploads only those, attaches every file with the new release digest and fingerprint, and then reports `compatible`.

**The identical-body documents need zero uploads.** For a real next release, uploads are limited to cards whose body
changed (for this transition that was ~222 + the compatibility card).

## B.5 Structured search equivalence on the final workspace

- `search --mode structured --json`, the library `searchWorkspace({ expand: "paths" })` and `eval --mode structured` return **identical candidates**.
- This was checked by a unit test on a clean-room build, and on the actual `workspace/` with 4 synthetic queries: **4 / 4 identical**.
- Per-query adaptive base limits recorded: 6, 7, 10 (no path intent), 7.
- The certify-2 eval belongs to the lead and was not run.

## B.6 Usage (cumulative ledger)

| item | value | ceiling |
| --- | --- | --- |
| generations | 3 (`…4d8bdb77`, `…31d7388f`, `…6e991373`) | 3 (lead-authorized) |
| uploads | 3,571 files, 7,395,633 bytes (this generation: 1,193 files, 2,322,023 B) | 1,300 for this run |
| search calls | **280** (this qualify: 93) | 600 |
| other calls | 51 | — |
| errors | none | — |

## B.7 Gate C evidence rows

| check | identity | env | command | timestamp (UTC) | result | evidence |
| --- | --- | --- | --- | --- | --- | --- |
| package tests | `@bks/schema-workspace` | local Windows, Node 24.18.0, `openai` 7.23.0 | `pnpm exec vitest run --project schema-workspace` | 2026-10-12T04:11Z | 8 files, **105 / 105** (incl. release-bump proof, CLI / eval equivalence, 8 skill examples) | this session |
| workspace verify | release `sha256:5fffb593…`, workspace `sha256:a33cc35a…` | same | `pnpm workspace:verify` | 2026-10-12T04:12Z | ok | this session |
| shipping generation | `g20261012T041326Z-6e991373`; store id at custody path | same + OpenAI Vector Stores (server-side key) | `bks-schema semantic refresh --live --from g20261012T020930Z-31d7388f --max-uploads 1300 --max-generations 3` | 2026-10-12T04:22Z | ready 1,193 / 1,193; 0 failed | `runs/release-v2/custody/semantic/refresh-v2.0.2.json`, `.../g20261012T041326Z-6e991373/generation.json` |
| publish + retain | same; previous `g20261012T020930Z-31d7388f` | same | `semantic publish`; `semantic retire` | 2026-10-12T04:23Z | current bound; previous deactivated, retained to 2026-10-26 | `custody/semantic/current.json` |
| compatibility | same | same | `bks-schema doctor` (`BKS_SEMANTIC_ENABLED=true`); `semantic status` | 2026-10-12T04:23Z | **compatible** | this session |
| qualification | 68 frozen tasks (seen previously) | same | `bks-schema semantic qualify --live --tasks evals/v2/schema-discovery/tasks.json` | 2026-10-12T04:25Z | R@10 lexical 0.942 / semantic 0.819 / hybrid 0.896; lexical default; round trip 20 / 20; fallback 6 / 6 | `custody/semantic/g20261012T041326Z-6e991373/qualification/qualification.json`, `custody/semantic/qualify-run-3.json` |
| usage | ledger | same | ledger | 2026-10-12T04:25Z | 3 generations, 3,571 uploads, 280 / 600 searches, 0 errors | `custody/semantic/usage-ledger.json` |
| structured equivalence | final `workspace/` | same | `eval --mode structured` vs `search --mode structured` (synthetic tasks) | 2026-10-12T04:27Z | 4 / 4 identical | this session |
