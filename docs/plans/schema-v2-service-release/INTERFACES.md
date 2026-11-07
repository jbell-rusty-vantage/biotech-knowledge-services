# Interface checkpoint

Revision **v1** (S1 schema authority, 2026-10-11): release `biotech-schema-v2.0.0` built and pinned; sections 1-4 and 6 now carry the real identities, files, loader API, IR v2 types and DDL names. What changed against v0 and what other roles must adapt is section 9. Earlier revision line, kept: v0 (lead, 2026-10-11): frozen enough for S1, S3, S6 and S8 to start. S1 publishes v1 with the real release manifest, IR fields and digests. Every later change is a new revision with a delta section and the list of invalidated tests/artifacts. Roles code against this file, not against each other's scratch.

## 1. Release identities (independent digests)

| Identity | Meaning | Emitted by |
| --- | --- | --- |
| `schemaDigest` | `sha256:` of the assembled SDL bytes | S1 release |
| `schemaReleaseDigest` | `sha256:` of canonical `release.json` (which lists every file digest: SDL, modules, registers, vocabularies, DDL, query catalog, migration map, workspace inputs, decision-ledger digest) | S1 release |
| `workspaceFingerprint` | generated workspace content fingerprint (excludes generation timestamp) | S2 |
| `queryCatalogDigest` | digest of the query catalog file in the release | S1 |
| `productProjectionDigest` | digest of the consumer projection manifest plus transformed SDL | S6 |
| `executableGraphqlDigest` | digest of the printed executable GraphQL schema | S6 |
| `operationRegistryDigest` | digest of the safelisted operation manifest | S6 |
| `executorVersion`, `skillBundleVersion` | semver strings | S3 / lead |
| installed graph release marker | node `:KsReleaseMarker {releaseId, schemaReleaseDigest, installedAt, migrationRunId, ddlDigest}` written by the migrator after DDL and migration checks | S8 |
| semantic index generation | `generationId` plus store id mapping in custody | S5 |

Release ID: `biotech-schema-v2.0.0` (parent baseline `sha256:c7cf1235...`). A corrected source produces a new `schemaDigest` and `schemaReleaseDigest`; the baseline hash is never reused for changed bytes.

**Pinned release as of 2026-10-12 (lead): `biotech-schema-v2.0.2` (final for this release).** schemaReleaseDigest `sha256:5fffb593c8ca94b289b768ac0a0b02df5739cb338b7a04ec88173589708c5a42`, schemaDigest unchanged `sha256:fe2cc50a...`, ddlDigest `sha256:943f8c2902119030cab2ce2b72be67a346aff23734e08822dc8ea17fcda1520f` (every statement carries `phase: pre-migration | post-migration`; `rel_MEASURES_assertion_exists` `blocked-by-legacy-data`; `compatibility.json.ddlExceptions`), queryCatalogDigest `sha256:6a2749032ed89c23b22de723ca0deb8d2b6132bf245da68ec8a1f4915795dbb8` (S4 corrections + 4 templates; 54 supported / 391 held / 9 unsupported questions; 2 vector templates `unsupported`), 86 pinned files. v2.0.0 and v2.0.1 remain immutable upstream.

Previous pin (2026-10-11): `biotech-schema-v2.0.1`. schemaDigest `sha256:fe2cc50afb4a48e16a2b5c3c37378b4d00a679a06d37bf312676c45c65c6589a` (identical SDL bytes to v2.0.0), schemaReleaseDigest `sha256:c0dd7837df029695e26f00d99f482483fb715e1cbcd4c4c4b1d8e3d31d6d3b06`, ddlDigest `sha256:3a42a440bd90f41aa9e0dcfb3c5e90d25acd102b97c8d43d13f847d8ed6377bb`, 79 pinned files, biotech-meta dirty-snapshot digest `sha256:af448145...`. v2.0.1 adds the frozen `migration/legacy-map.yaml`, `rules/operational-names.yaml` (LegacyV0*, MIGRATED_FROM, Ks* incl. KsRevocationFence), `legacy:` qualifiers, `compatibility.json`/`COMPATIBILITY.md`, and the executor's operational DDL (`KsIntentMarker.markerKey` uniqueness, `KsRevocationFence.id`, `rel_<TYPE>_uid`, fence `lockSeq`/`locked`). Code must read identities from `loadRelease()`, never from literals. v2.0.0 stays immutable upstream.

**v1 actual identities** (from `schema/pinned/PIN.json` and `release.json`):

| Identity | Value |
| --- | --- |
| parent baseline | `sha256:c7cf1235dba876b26460c54a6510028d2dcfc65989787eacd5b446f9034b4793` |
| `schemaDigest` | `sha256:fe2cc50afb4a48e16a2b5c3c37378b4d00a679a06d37bf312676c45c65c6589a` |
| `schemaReleaseDigest` | `sha256:b62036de7c01be3daf9eae7e534ce0ce566070f4dcc54a3b0aca0ba1070b092f` (sha256 of canonical release.json: recursively sorted keys, no whitespace; `canonicalJson` of @bks/contracts) |
| `queryCatalogDigest` | `sha256:16934295093dd4ae4f71db25ea17f07b8236cb7acde753edc2f13bee5f75d3f3` |
| `ddlDigest` | `sha256:454d6ad60ee1063785e148823f1d02614b2864af089de1bb62deee37ed900644` (sha256 of `ddl/ddl.json`; the migrator stamps it on `:KsReleaseMarker`) |
| `validationParamsDigest` | `sha256:930a60f31f579e13de8fcb10559db62afd67717f9a724054d72b9ccfb29e967c` |
| `decisionLedgerDigest` | `sha256:f790c297b7f3ddcfce9add50f1b494e4dd975dbe2202ebb957c6f9fb521e7c42` |
| `contentTreeDigest` (= biotech-meta dirty-snapshot identity) | `sha256:aacc4c563abc7a504a759ff708ec439cb6f2b7c23772403a270805a9eaca9dbc` |
| source revision | BKS `431c8a7c287ee3d914843390a080dbfbe949acdc`; biotech-meta `638aef572383062401b341802adcf01521136ff7` + uncommitted release (`sourceRevision.dirtySnapshotDigest`) |

## 2. Upstream release bundle (biotech-meta)

Location: `biotech-meta/docs/schema/releases/biotech-schema-v2.0.0/`

```text
release.json                 # releaseId, parentBaseline, createdAt (frozen), sourceRevision {bksCommit, biotechMetaCommit|dirtySnapshotDigest},
                             # files{path: {sha256, bytes}}, moduleOwnership, contractVersions, compilerVersions,
                             # supportedMatrix {neo4j, cypher, apoc, neo4jGraphql}, decisionLedgerDigest
sdl/assembled.graphql        # assembled SDL (= schemaDigest bytes)
sdl/assembled.manifest.json
sdl/modules/{kernel,D1..D13}.graphql
registers/node-register.yaml
registers/relationship-register.yaml
vocabularies/{predicates,qualifiers,assessments,identifier-schemes,targets,claim-lifecycle,verdict-lattice,answer-kinds,goal-polarity,frontiers}.yaml
rules/identity-rules.yaml  rules/projection-rules.yaml  rules/temporal-rules.yaml
ddl/required.cypher          # community-compatible required constraints/indexes incl. KsWriteFence / KsIntentMarker / KsReleaseMarker / Identifier(scheme,value)
ddl/enterprise.cypher        # capability-gated additions
ddl/ddl.json                 # machine list: name, kind, definition, required|optional, edition
query-catalog/catalog.json   # templates: id, questionIds, language CYPHER_5, statement, params schema, output schema, limits, requiredIndexes, temporal/evidence notes
migration/legacy-map.yaml    # live legacy label/edge/property dispositions (S8 authors; S1 hosts)
migration/v1-map.yaml        # v1-proposal to v2 dispositions incl. the seven unmapped edges (policy)
workspace-inputs/{domains,terminology,task-routes,identity-rules,ingestion-rules,aliases}.yaml
validation/validation-params.json
decisions/DECISIONS.md       # copy of the ledger with digest
```

The run record (`schema/program/final/**`) stays in biotech-knowledge-services Git history as provenance; `release.json.sourceRevision.bksCommit` points at it. CHANGELOG, OPEN-QUESTIONS and proposal-index entries follow `handoff-to-biotech-meta.md` section 4.

**v1 actual layout additions** (all listed in `release.json` `files`, 72 frozen files): `README.md`; `registers/seams.yaml`; `vocabularies/capture-methods.yaml` (FU-06); `tooling/action-space.yaml` (OD-20); `ddl/optional.cypher` (OD-44 vectors, disabled by default); `query-catalog/sources/**` (pattern sources) and `query-catalog/explain.json` (EXPLAIN evidence keyed by template id + statement digest); `workspace-inputs/aliases.yaml` (v1 navigation aliases); `reports/{corrections,predicate-registry-report,metrics,subjectable-audit,decision-closure,capture-methods}.json` and `reports/predicate-registry-report.md`. `migration/legacy-map.yaml` is a placeholder owned by S8, listed under `excludedFromFrozenDigestSet` (digest recorded, not part of `files`, `contentTreeDigest` or `schemaReleaseDigest`); when S8 fills it, S1 re-releases as `biotech-schema-v2.0.1`. `release.json` top-level keys: compilerVersions, contractVersions, createdAt, decisionLedger, decisionLedgerDigest, description, excludedFromFrozenDigestSet, files, identities, identityRules, metrics, moduleOwnership, parentBaseline, releaseFormat, releaseId, sourceRevision, status, supportedMatrix, version.

## 3. Pin in biotech-knowledge-services

`schema/pinned/PIN.json` v2 shape:

```json
{ "pinFormat": "bks-pin.v2", "releaseId": "biotech-schema-v2.0.0", "schemaReleaseDigest": "sha256:...", "schemaDigest": "sha256:...",
  "sourcePath": "biotech-meta/docs/schema/releases/biotech-schema-v2.0.0", "sourceRevision": {"biotechMeta": "<commit or dirty-snapshot digest>"},
  "pinnedAt": "2026-10-11", "sdlKey": "sdl/assembled.graphql", "files": { "<relative path>": {"sha256": "...", "bytes": 0} } }
```

`schema/pinned/release/**` mirrors the bundle. `pnpm schema:pin -- --release <dir>` validates every digest, replaces the pinned bundle atomically and records provenance. Loader API (`@bks/schema-workspace`):

```ts
loadRelease(opts?: { dir?: string }): ReleaseBundle   // verifies all bytes vs PIN; throws RELEASE_TAMPERED / RELEASE_MISSING
// ReleaseBundle: { pin, manifest: ReleaseManifest, sdl: string, schemaDigest, schemaReleaseDigest, ir: SchemaIR,
//                  registers, vocabularies, rules, ddl, queryCatalog, workspaceInputs, validationParams }
```

`BKS_SCHEMA_RELEASE_DIR` explicitly set but missing is a hard error (TL-02). No fallback to v1 filenames anywhere.

**v1 actual PIN.json** keys: pinFormat, releaseId, schemaReleaseDigest, schemaDigest, queryCatalogDigest, ddlDigest, validationParamsDigest, decisionLedgerDigest, contentTreeDigest, sourcePath, sourceRevision, pinnedAt, root, sdlKey, releaseKey, excludedFromFrozenDigestSet, files, provenance. `files` keys are relative to `schema/pinned/release/` and include `release.json` (74 files). `sourcePath` is relative to the workspace `biotech/` directory. `sourceRevision.biotechMeta` is the biotech-meta commit when the release directory is committed and clean, else the content-tree (dirty-snapshot) digest.

**v1 actual loader API** (`@bks/schema-workspace`):

- `loadRelease(opts?: { dir?: string; cache?: boolean }): ReleaseBundle` (packages/schema-workspace/src/release.ts:170). Resolution: `opts.dir` → `BKS_SCHEMA_RELEASE_DIR` → `schema/pinned`. A directory with `PIN.json` is verified against the pin (every file, no unlisted file, PIN/release.json agreement, `schemaReleaseDigest`, identities); a raw upstream release directory (only `release.json`) is verified against its own manifest and reported as `source: "override"`. Results are memoized per directory (`clearReleaseCache()`).
- Errors: `ReleaseError` (packages/schema-workspace/src/release.ts:21) with `code` `RELEASE_MISSING | RELEASE_TAMPERED | RELEASE_INVALID` and `bksCode` `BKS_<code>`; `details.problems` lists every mismatch.
- `ReleaseBundle` (packages/schema-workspace/src/release.ts:108): `{ dir, source: "pinned"|"override", pin: PinV2|null, manifest: ReleaseManifest, sdl, schemaDigest, schemaReleaseDigest, assembly, ir: SchemaIR, registers: {nodes, relationships, seams}, vocabularies: Record<name, object>, rules: Record<name, object>, ddl: {manifest, required, enterprise, optional}, queryCatalog, workspaceInputs: {dir, text, parsed}, validationParams (raw v2 JSON), params: ValidationParams, migration: {v1Map, legacyMap}, files: Record<path, {sha256, bytes}>, text(path) }`. `PinV2` packages/schema-workspace/src/release.ts:41, `ReleaseManifest` packages/schema-workspace/src/release.ts:64, `DdlStatement` packages/schema-workspace/src/release.ts:84.
- Compatibility readers (`load.ts`): `readPin()` returns `PinV2`; `readPinnedSdl()`, `readValidationParams()` and `readRelease()` go through `loadRelease()`; `sidecarDir` = `schema/pinned/release/workspace-inputs`.
- Pin command: `pnpm schema:pin -- --release <dir> [--pinned-at YYYY-MM-DD] [--check]` (`scripts/release/pin.mjs`): verifies, then replaces `schema/pinned` atomically (staging directory + rename) and records `provenance.previousPin` (the v1 pin files, now only in Git history).

## 4. Schema IR v2 additions (S1 publishes exact types)

Per node: `module`, `primaryLabel`, `storedLabels[]`, `uidToken`, `archetype`, `identityKeys[]`, `identifierSchemes[]`, `executorOps[]` (`create|update|connect|...` from register `mutations.executor`), `projectionGate`, `provenanceRequirement`, `temporalScope`, `exclusiveSlots[]`, `notReportedFields[]`. Per relationship: `class` (`structural|asserted|derived`), `from/to` including interface/union expansion, `edgePropertyType`, `declaredOn[]`, `direction`, `cardinality`, `temporal`, `questions[]`, `requiredIndexes[]`. Predicates: `kind` (`relationship|authorizing|literal|field|computation`), `status`, `subjectTypes/objectTypes/literalForms`, `registrar`, `qualifiers[]`. Assessments: `kind/subkind/facets/admissibleSubjects`. Qualifier grammar: `name -> valueGrammar`.

**v1 exact types** (`irVersion: "bks-schema-ir.v2"`): `SchemaIR` packages/schema-workspace/src/ir.ts:310 (adds `release`, `modules: ModuleInfo[]` packages/schema-workspace/src/ir.ts:39, `predicates: PredicateEntry[]` packages/schema-workspace/src/ir.ts:259, `assessments: AssessmentVocabulary` packages/schema-workspace/src/ir.ts:288 / `AssessmentSubkind` packages/schema-workspace/src/ir.ts:277, `qualifierGrammar: Record<"name"+"separator", QualifierRule>` packages/schema-workspace/src/ir.ts:294); `NodeType` packages/schema-workspace/src/ir.ts:109 (adds `module, storedLabels, archetype, identityRule, identifierSchemes[{scheme, writeStatus}], executorOps: ExecutorOp[], executorPolicy, projectionGate, provenanceRequirement, temporalScope: "bitemporal"|"recorded"|"none", exclusiveSlots, notReportedFields`); `ExecutorOp` packages/schema-workspace/src/ir.ts:15 = `create|update|close|delete|delete-unreferenced` (no `connect`: structural CONNECT permission is the relationship register's `nestedOperations`, OD-03); `RelationshipTypeSummary` packages/schema-workspace/src/ir.ts:217 (adds `class, module, from, to, fromMembers, toMembers, edgePropertyType, declaredOn, direction: "OUT", cardinality, temporal, questions, requiredIndexes, exclusive, projectionGate, interfaceEndpoints: InterfaceEndpoint[]` packages/schema-workspace/src/ir.ts:209 `, registered`); `ValidationParams` packages/schema-workspace/src/ir.ts:332 (v1 keys kept, v2 content; adds `structuralTypes, predicateAliases, retiredPredicates, activeIdentifierSchemes, executorOps, projectionGates`). Release inputs to the parser: `ParseOptions.release: ReleaseInputs` packages/schema-workspace/src/parse.ts:55; modules come from `sdl/assembled.manifest.json` `definitionNames`, never from banners (banner scan remains only for an ad-hoc `parseSchema(sdl)` without release inputs). Interface endpoints (OD-45): `rule: "kernel-traversal"` for K-owned and kernel-meaning types (HAS_SUBJECT, HAS_OBJECT, ASSERTED_BY, ASSESSES, HAS_IDENTIFIER, MENTIONS, WAS_GENERATED_BY), `"registered-exception"` only for D5 STEP_USES and D10 ASSOCIATES.

## 5. Native contracts (S3 owns `packages/contracts`)

| Contract | Version string | Notes |
| --- | --- | --- |
| Ingestion intent | `biotech-knowledge-intent.v2` | pins `schemaReleaseDigest`, optional `workspaceFingerprint`, `policyVersion`; basis is `snapshotRef` (custody-verified) or `creationOnly {reason}`; proposals per the supported matrix including `assertion.relate`, `assessment.record`, `mention.stage` (produces SourceLocator plus RESOLUTION Assessment), `adjudication` (sealed verification ref), `report.publish`, `projection.write` (privileged); evidence refs by digest; no `onStale` field in production |
| Plan | `biotech-knowledge-plan.v2` | server-stored; `planRef` (opaque id) plus `planDigest`; binds intentDigest, observations digest, frozen clock, executorVersion, schemaReleaseDigest, rulesDigest, grants/witness refs, statements |
| Apply request | `biotech-knowledge-apply.v2` | `{ planRef, expectedPlanDigest, intentRef or intentDigest, effectKey, partialPolicy: "all" or { include: [proposalIds] }, witness: ApplyWitness }`; no statements accepted |
| Apply witness | `bks-apply-witness.v1` | signed (Ed25519 or HS256 with pinned issuer key), audience `bks-executor`, binds actor/scope, effectKey, intent/plan/release/evidence digests, policy and decision versions, iat/exp (at most 60 s), revocationGeneration |
| Receipt | `biotech-knowledge-receipt.v2` | effect scope, intent/plan/release ids, proposal outcomes, affected entities/relationships (paged refs), invariant results, `priorGraphRevision/nextGraphRevision`, witness ref, recovery identity; `outcome: applied|noop|partial|rejected|failed|duplicate|unresolved` |
| Typed read | `biotech-knowledge-read-intent.v2` | ops: resolve/card/list/neighbors/assertion/evidence/history/report/association; `consistency: {mode: observed|stable_revision, bookmarks?}` |
| Cypher read | `biotech-cypher-read-intent.v1` | per SPECIFICATION section 6.1 |
| Read result | `biotech-knowledge-read-result.v2` | `status: ok|empty|truncated|failed|skipped|unsupported|stale|forbidden`; `queryDigest`, `resultDigest` (semantic, excludes timing), `receiptDigest` |
| Schema context | `biotech-schema-context.v1` | S2 authors the content of `packages/contracts/src/workspace.ts`; S3 merges |
| Canonical JSON | `bks-canonical-json.v2` | JCS-style: sorted keys, ES6 number serialization, `-0` becomes `0`, undefined dropped, bytes preserved (no NFC), golden vectors TS plus Python; v1 decoding retained |
| Shared envelope | `mc.knowledge_request.v1` | S7; wraps native payload bytes plus `payloadDigest` unchanged |

Error codes (prefix `BKS_`): `RELEASE_MISMATCH`, `RELEASE_TAMPERED`, `UNAUTHORIZED`, `FORBIDDEN_SCOPE`, `PLAN_NOT_FOUND`, `PLAN_DIGEST_MISMATCH`, `PLAN_FORGED`, `WITNESS_INVALID`, `WITNESS_EXPIRED`, `WITNESS_REVOKED`, `EFFECT_DUPLICATE`, `EFFECT_CONFLICT`, `EFFECT_PENDING`, `EFFECT_UNRESOLVED`, `STALE_REVISION`, `STALE_PRECONDITION`, `IDENTITY_CONFLICT`, `SLOT_CONFLICT`, `EVIDENCE_UNVERIFIED`, `SNAPSHOT_UNVERIFIED`, `UNSUPPORTED`, `LIMIT_EXCEEDED`, `TIMEOUT`, `PARSE_REJECTED`, `PROCEDURE_FORBIDDEN`, `VISIBILITY_DENIED`.

## 6. Graph operational labels (S3 defines requirements; S1 emits DDL)

- `:KsWriteFence {id: "canonical", graphRevision: int, lastEffectKey, lastWriterRunId, updatedAt}`: exactly one node; every canonical write first runs `MATCH (f:KsWriteFence {id: "canonical"}) SET f.graphRevision = f.graphRevision + 1` in the transaction (lock), then validates.
- `:KsIntentMarker {effectKey (unique), installationId, applicationId, tenantId, intentId, intentDigest, planRef, planDigest, status: applying|applied|failed|unresolved, attempts: [...], receipt, receiptId, startedAt, finishedAt}`; failure never overwrites `applied`; attempts are appended under the fence.
- `:KsReleaseMarker` (see section 1). Plans are not stored in the graph; they live in executor custody (`runs/`, later Supabase `knowledge-artifacts`) keyed by `planRef`.

**v1 DDL names** (`ddl/ddl.json`, 499 statements: 290 required in `ddl/required.cypher`, 206 in `ddl/enterprise.cypher`, 3 in `ddl/optional.cypher`). Operational: `ks_write_fence_id` (unique KsWriteFence.id), `ks_intent_marker_effect_key` (unique KsIntentMarker.effectKey), `ks_release_marker_release_id` (unique KsReleaseMarker.releaseId), `ks_intent_marker_status` (index KsIntentMarker.status), `ks_release_marker_installed` (index KsReleaseMarker.installedAt); Enterprise adds `ks_write_fence_revision_exists`, `ks_write_fence_revision_type` (INTEGER), `ks_intent_marker_effect_key_exists`, `ks_intent_marker_status_exists`, `ks_release_marker_digest_exists`. Naming: `entity_uid` (Entity.uid), `uid_<Label>` for every other stored label (72, second defense), `rel_<TYPE>_assertion` / `rel_<TYPE>_writer` (relationship-property indexes), `identifier_key` (Identifier scheme, issuer, value unique), `identifier_scheme_value` (FU-14 d), `channel_platform_account` and `sponsored_by_valid` (MD-D9-03 a), the query-patterns D-1 and D-3 names unchanged; Enterprise `uid_exists_<Label>`, `uid_type_<Label>`, `rel_<TYPE>_assertion_exists`. Bootstrap (migrator, once): `MERGE (f:KsWriteFence {id: 'canonical'}) ON CREATE SET f.graphRevision = 0, f.updatedAt = datetime()`. Readiness checks are `ddl.json` `checks`.

## 7. Consumer API (S6)

Executable projection built from the pinned release SDL by the same builder as runtime; `/healthz` liveness; `/readyz` compares `KsReleaseMarker` with the compatibility matrix and index state; `/schema.graphql` returns the executable projection plus identities; persisted-operation safelist (`operations.json` with sha256 ids and variable bounds); BFF actor context is a JWT signed by the BFF service key and verified by GraphQL with a pinned issuer/audience; `GRAPHQL_ENSURE_OPERATIONS=true` refuses to start in production.

## 7a. Revision v3 (S7, lead-merged pointer)

Implemented contracts and their exact shapes are in `reports/S7-integration.md` section 3 and the files it names: `mc.knowledge_request.v1` / `mc.knowledge_delivery.v1` (`packages/contracts/src/envelope.ts`, JSON Schemas, Python `envelope.py`, KS `knowledge-request-envelope.ts`, MC `knowledge/envelope.py`), admission routes `/kg/admission/{witness,revocations,deliver,reconcile}` and `GET /kg/eligibility`, `GET /capability` (descriptor `belllabs.knowledge-capability.v1`), lane mount `belllabs.lane-workspace-mount.v1`, ledger formats `bks-admission-ledger.v1`, `bks-grant-registry.v1`, `ks-verification-state.v1`, `bks-custody-index.v1`. Semantics: authorization at issuance plus ≤60 s lease; delivery states `pending | applied | rejected | unresolved` separate from verification completion; a plan whose proposals are all held is reported by the planner as outcome `rejected` with no errors and is mapped to held by the adapter (candidate future contract change: explicit `held` plan outcome). Supabase custody adapter exists but is blocked on the missing bucket.

## 8. Capability handshake (S7)

`describe` returns `{ service: "biotech-knowledge-services", contracts: {...versions}, releaseId, schemaReleaseDigest, workspaceFingerprint, queryCatalogDigest, executorVersion, capabilities: { "schema.search": {modes: [lexical, semantic?, hybrid?]}, "schema.get", "schema.slice", "read.typed", "read.cypher", "plan", "apply", "receipt.get", "verifyResult", "retrieve": {available: false}, "analytics": {available: false} }, consistency: {readModes: [observed, stable_revision]}, recovery: {receiptLookup: true, atomicCrossStore: false} }`. Nothing planned-but-absent is advertised.

## 9. Revision v1 (S1): delta against v0 and what other roles must adapt

| Area | v0 | v1 (actual) | Who adapts |
| --- | --- | --- | --- |
| Release bundle | layout only | built: 72 frozen files; extra files listed in section 2; `legacy-map.yaml` excluded from the frozen set | S8 fills `migration/legacy-map.yaml` and asks S1 for v2.0.1 |
| Identities | names | values in section 1; `schemaReleaseDigest` = sha256 of canonical release.json (not stored inside it) | all (handshake, readiness, KsReleaseMarker) |
| PIN.json | sketch | section 3 keys; `files` relative to `schema/pinned/release/` and include `release.json`; `root`, `releaseKey`, identity digests and `provenance` added | S6 (already reads `sdlKey`/`files`), S3 |
| Loader | `loadRelease(opts?: {dir})` | section 3; `cache` option; `RELEASE_INVALID` added; raw release dirs load as `override` | S3, S4, S6, S7 |
| IR | v1 + additions | `bks-schema-ir.v2`; `fragments` = modules K..D13; `allowedMutations` is the GraphQL flag (all false, L2) and must not gate executor writes: use `NodeType.executorOps` / `params.executorOps` | S3 (planner: TYPE_NOT_CREATABLE today comes from `allowedMutations`), S2 (renderer) |
| Validation params | v1 keys | `bks-validation-params.v2`: v2 names only; `legacyTypes` empty; `privateUidTokens` empty; `implicationPairs` re-derived at predicate level (8 pairs, notes in `implicationNotes`); `predicateAliases`, `retiredPredicates`, `activeIdentifierSchemes`, `executorOps`, `projectionGates`, `nodeLabels`, `edgeProfiles` added | S3 (re-key aliases before ingest, reject retired, check active schemes) |
| Predicates | registry | 301 registered, 39 alias-of, 34 retired-by, 0 proposed-new; `reports/predicate-registry-report.json` | S3 fixtures (FU-03 re-keys for the 18 rejected names), S4 |
| DDL | names | section 6; `kg ensure-operations` must apply `loadRelease().ddl.required` (and `.enterprise` on Enterprise) instead of `schema/pinned/operations*.cypher`, which no longer exist | S3 (`packages/kg-ops/src/operations.ts:34,37`, `cli.ts:25`), S8 |
| Query catalog | template fields | `bks-query-catalog.v1`: 153 templates (one per statement), questions with status supported/held/unsupported (123/322/9); `supported` = EXPLAIN ok on 5.26 with required DDL, `validation.resultAssertions = not_run`; temporal parameters bind as driver DateTime (`neo4jType`) | S4 (result assertions, promotion of held questions), S7 (catalog digest in describe) |
| Sidecars | `schema/sidecars/*.yaml` | authority is the release `workspace-inputs/`; pinned copy `schema/pinned/release/workspace-inputs/`; `schema/sidecars/README.md` is a pointer; `aliases.yaml` added; domains key on modules (`fragments` filled from `modules` for compatibility) | S2 (renderer, skills), S3 (ingestion-rules and identity-rules content is v2) |
| Workspace manifest | v1 | `schema.pinnedPath` = `schema/pinned/release/sdl/assembled.graphql`; `sourceRun` = releaseId; `catalogVersion` = schemaReleaseDigest (contract fields unchanged) | S2 (rename the fields in contracts workspace.ts when it revises the manifest) |
| Errors | `BKS_RELEASE_*` | `ReleaseError.bksCode` is `BKS_RELEASE_MISSING` / `BKS_RELEASE_TAMPERED` / `BKS_RELEASE_INVALID`; `RELEASE_INVALID` is new (malformed manifest) | S3 contracts errors list |

Invalidated by v1: every artifact built from the v1 pin (`workspace/` was regenerated; S6 printed schemas and benchmarks built from the candidate SDL must be rebuilt from the pinned release; S3 planner probes against the candidate IR must use IR v2 `executorOps`). Tests that asserted v1 W-fragments, `final_biotech_schema_proposal.graphql` or v1 relationship classes were rewritten (schema-workspace) or belong to their owners.

## 10. Revision v2 (S3): native executor deltas against v0 and the reads-role interface

Source: `reports/S3-native-executor.md` sections 8 and 10 (verbatim below), plus the follow-up changes of the same role. Only this section was added by S3.

### 10.1 Interface deltas vs INTERFACES v0 (verbatim from the S3 report, section 10)


1. **Error codes added**: `BKS_PARTIAL_REFUSED`, `BKS_PARTIAL_NOT_CLOSED`, `BKS_PLAN_REJECTED`, `BKS_AUTHORITY_UNAVAILABLE`.
2. **KsIntentMarker** is unique on `markerKey = mk-<sha256(canonical{installationId, applicationId, tenantId, effectKey})>`. It also stores effectKey, scope, intentId, both digests, planRef, `attempts` (JSON history), `receipt`, `receiptId`, `lastAttemptId` and `graphRevision`. Persisted status is `applied | failed` only; `applying` is never committed, and `unresolved` is a receipt outcome reconciled by lookup.
3. **KsWriteFence** gains `lockSeq` and `locked`. `graphRevision` increments only on effect commits.
4. **New operational label** `KsRevocationFence {id: "canonical", generation}`.
5. **DDL for S1's `ddl/required.cypher`** (from `operationalDdl()`):
   - Uniqueness on KsWriteFence.id, KsRevocationFence.id, KsIntentMarker.markerKey, KsReleaseMarker.releaseId and Identifier (scheme, issuer, value).
   - Per-label uid uniqueness.
   - Indexes on Claim.propositionHash, CaptureAttempt.subjectUid and Activity (externalRunSystem, runId), plus relationshipUid per asserted type.
6. **Witness**: Ed25519 only (no HS256). The claims add `jti`, `partialPolicyDigest` and `decisionVersion`.
7. **Apply request** requires `intentDigest` (no `intentRef`). `statements` / `plan` / `cypher` keys are `BKS_PLAN_FORGED`.
8. **Plan**:
   - Dispositions are `admitted | noop_duplicate | held | rejected`.
   - Implicit `dependsOn` is filled in.
   - The plan carries `effects` and `invariants`.
   - Each statement carries `expectRows` / `expectNodesCreated` / `expectRelationshipsCreated` / `needs`.
9. **Receipt** adds `attempts`, `cancellation`, `recovery.lookup`, `invariants` and the complete declared effects.
10. **Intent v2**:
    - The proposal kind `lineage.start` (P15 / OD-06).
    - Proposal-level `hold` (R-22) and an intent `provenance` block.
    - `mention.stage.locator` with `typeHint` and `candidates`.
    - Evidence `{uid, selectorDigest}`.
    - `Qualifier` allows `:` and `=`.
    - A Source can be a `new` subject (EX-04 identity).
11. **`/describe`**:
    - Capabilities: `plan`, `apply`, `receipt.get`, `verifyEffects`, `admission.dev` (dev), `baseline.cypher` (evaluation), `read.typed` (advertised as v1).
    - Adds `schemaDigest`, `releaseSource` and `principal`.
    - `queryCatalogDigest` is null and `readModes` is `["observed"]` until S4.
12. **Python**: `intent` / `plan` / `receipt` mean v2; v1 is under `intent-v1` / `plan-v1` / `receipt-v1`.
13. **New contracts**: `bks-custody-snapshot.v1`, `bks-sealed-verification.v1`, `bks-effect-verification.v1`, `bks-error.v1`.

Invalidated artifacts:
- Clients of the v1 `/kg/plan`, `/kg/apply` or `/kg/receipt/:intentId` routes.
- Anything pinned to the pre-swap candidate digest `sha256:e1197679…`.
- Activity uids (they now end in an 8-hex suffix) and Source uids (now slug + canonical-URI digest). S8 should treat both as new identities.


### 10.2 Follow-up deltas (S3 follow-up, release v2.0.1)

- **DDL authority.** Delta 5 above is superseded: since `biotech-schema-v2.0.1` the release `ddl/required.cypher` (+ `ddl/enterprise.cypher` on Enterprise) is the single DDL authority, with the names `ks_write_fence_id`, `ks_revocation_fence_id`, `ks_intent_marker_key`, `ks_intent_marker_effect_key_lookup`, `ks_release_marker_release_id`, `identifier_key`, `claim_proposition_hash` (uniqueness), `capture_subject`, `activity_run` (uniqueness), `uid_<Label>` and `rel_<TYPE>_uid`. `operationalDdl()` is removed. `ensureOperationalState(client, schema?, {enterprise?, ddl?})` and `bks kg ensure-operations` apply `loadRelease().ddl.required` (+ `.enterprise`, edition auto-detected) and the `ddl.json` bootstrap (both fences); `operationalDdlDrift(ddl, schema)` lists writer-required names missing from a release (empty for v2.0.1), and the apply step verifies every writer name is present as the release kind (constraint or index).
- **Executor operations.** The writer reads node-type operations from the release (`params.executorOps` = IR `NodeType.executorOps`, including `delete` and `delete-unreferenced`, which intents never issue). The register-text derivation is kept only as a cross-check; disagreements are logged once per release (`WriteSchema.executorOpsDisagreements`; for v2.0.1: Association, Chunk, QualityResult, where the release wins).
- **Release override.** `loadPinnedRelease({dir})` serves any verified release directory through `loadRelease({dir})` (source `override`); `ReleaseInputs` carries `executorOps`, `ddl` and `bundle`.
- **Planner.** A Source subject minting the uid of a declared `sources[]` entry reuses it (`SOURCE_DECLARED`); a missing required property does not block a `new` subject with `onMatch: use_existing` that resolves to an existing node (`REQUIRED_PROPERTY_DEFERRED`); proposals that target a resolved subject absent from the graph are `held` (`SUBJECT_MISSING`), not rejected.
- **Fixture round.** `schema/program/final/fixtures-v2/` (manifest `ROUND.json`, format `bks-fixture-round.v1`, generator `packages/kg-ops/src/write/fixture-round.ts`) is the v2 fixture set the matrices run; the originals under `fixtures/` are unchanged.
- **Workspace v2 contracts and routes (S2 merge).** `@bks/contracts` exports `WorkspaceManifestV2`, `CardRecord`, `SliceRequestV2`, `SchemaContext` (v1 shapes kept for decoding; `CONTRACT_VERSIONS.workspace = bks-schema-workspace.v2`). The executor serves `/schema/manifest` (no inventory; `inventoryCount`), `/schema/search` (mode/kind/module/domain; `status`/`degradation`), `/schema/find`, `/schema/neighbors/:id`, `/schema/path`, `/schema/pattern`, `/schema/doctor`, `POST /schema/context`, `/schema/page/:id`, `POST /schema/slice` (`SliceRequestV2`, v1 accepted) and the matching MCP `schema_*` tools; `WorkspaceError RELEASE_MISMATCH` maps to `BKS_RELEASE_MISMATCH`; `/describe` `schema.search.modes` is `["lexical"]` until a semantic retriever is configured.
- **Plan outcome `held` (additive).** `biotech-knowledge-plan.v2` `outcome` gains `held`: no errors, no admitted and no rejected proposal, at least one held. It has no statements, is never admitted (`BKS_PLAN_REJECTED` with an explanatory message) and is served with HTTP 200. Before this, the planner reported such a plan as `rejected`. Python `PlanV2` / `PlanView` accept it.
- **Admission and envelope exports (S7 patches P1-P3).** `@bks/kg-ops` re-exports `./admission/index.js`. `@bks/contracts` exports `envelope.ts` (`KnowledgeRequestEnvelope`, `KnowledgeDelivery`, ...), and `CONTRACT_VERSIONS` adds `knowledgeRequest: mc.knowledge_request.v1` and `knowledgeDelivery: mc.knowledge_delivery.v1`, so `/describe` contracts change and the Mission Control catalog descriptor must be refreshed. JSON Schemas `mc.knowledge_request.v1.json` and `mc.knowledge_delivery.v1.json` are exported.
- **Phase-aware DDL.** `ensureOperationalState(client, schema?, {phase})` and `bks kg ensure-operations --phase pre|post|all` select statements from `ddl.json`: every `requirement: required` statement, plus `edition: enterprise` statements on Enterprise.
  - `phase: post-migration` statements run in `post`; statements without a phase (v2.0.1) count as `pre`.
  - Statements whose `status` is not active (v2.0.2 `blocked-by-legacy-data`, e.g. `rel_MEASURES_assertion_exists`) are skipped and reported in `blocked`.
  - `pre` and `all` install the bootstrap fences and verify the writer names. `all` is the default, for empty graphs and tests.
  - The migrator runs `pre`, then migrates, then runs `post`.
  - The writer stamps `assertionUid` on every new asserted edge, including `MEASURES`, so the blocked constraint is enforced by the executor for new writes.
- **Read contracts in `@bks/contracts` (S4 P-1).** `read-v2.ts` exports `biotech-knowledge-read-intent.v2`, `biotech-cypher-read-intent.v1`, `biotech-knowledge-read-result.v2`, `biotech-cypher-read-explain.v1` and `bks-read-values.v1`.
  - `CONTRACT_VERSIONS.readIntent` is now v2. It adds `cypherReadIntent`, `readResult`, `readExplain` and `readValues`.
  - The v1 read strings move to `LEGACY_CONTRACT_VERSIONS`.
  - JSON Schemas are exported, and the Python client has `ReadResultV2`, `read_v2`, `read_cypher` and `read_explain`.
  - `packages/kg-ops/src/read/contracts.ts` re-exports them.
- **Executor reads (S4 P-2 / P-3).** `POST /kg/read` belongs to the reads module, which decodes v1 and v2 bodies. The legacy module is MCP-only (`kg_read`), advertised as `read.typed.v1`.
  - `/describe` `queryCatalogDigest` and `consistency.readModes` come from the `read.typed` capability.
  - `withStableRevision` accepts `fetchSize` (S4 P-4).
  - `bks kg read` accepts v2 and cypher read intents.
- **Writer fixes (S4 P-6).**
  - Planner probing and `verifyEffects` use retry-local accumulators inside managed transactions.
  - CaptureAttempt nodes are stored `INTERNAL`: the register default (R-41) cannot be overridden.
  - Int-typed node and edge properties are stored as integers (`toInteger` in the compiled SET), which changes the compiled Cypher, so plan digests change; the golden was regenerated.
  - `ensureOperationalState` waits for indexes (`db.awaitIndexes`) before the graph is used.
- **Identifiers on subjects (additive).** `IdentifierDeclarationV2.evidence?` (locator refs). A declared identifier with evidence and an active scheme on a new-mode subject is attached in the same plan (implicit `identifier.attach`, proposalId `id.<ref>.<scheme>`). Without evidence it is a resolution key, with warning `IDENTIFIER_NOT_ATTACHED`.
- **Release-marker rule.** Writes (and `/readyz`) accept the graph only when the KsReleaseMarker with the greatest `installedAt` carries the served `releaseId`, `schemaReleaseDigest` and `ddlDigest`. A tie is refused. Refusals are `BKS_RELEASE_MISMATCH`, as a failed receipt. `FenceState.latestMarkers` and `releaseMarkerVerdict` are exported.
- **Executor health.**
  - `/healthz` is liveness, reporting `database: reachable | unreachable | unconfigured`.
  - `/readyz` checks database, fence, latest marker and writer DDL ONLINE, returning 200 or 503.
  - Production guard: `*.databases.neo4j.io` requires `BKS_TARGET=production`.
  - The env file is loaded explicitly, and only its path is printed.
  - Episode invariant `episode-absent` carries `closing[]`, so a supersession between the same endpoints applies.
- **Temporal precondition (WR-19).** A cited snapshot with `retrievedAt` after the service instant (planner `plannedAt`, re-checked with the apply clock before the transaction), or with `observedAt` after `retrievedAt`, is refused with `BKS_STALE_PRECONDITION`. At plan time the plan is `rejected`; at apply time nothing is written. There is no skew allowance, and equal instants are accepted. The code already existed, so no enum change was needed.

### 10.3 Reads-role interface (verbatim from the S3 report, section 8)


**stable_revision probes** (`packages/kg-ops/src/fence.ts`):
- `withStableRevision(client, fn, { maxAttempts?, timeoutMs?, bookmarks? })` runs `fn(tx, attempt)` inside ONE explicit READ transaction. It reads `KsWriteFence.graphRevision` before and after `fn` and retries the whole read when the revision moved, failing with `BKS_STALE_REVISION` after `maxAttempts`. It returns `{ result, graphRevision, attempts, bookmarks }`.
- `fn` must allocate its accumulators inside each call. An abandoned attempt's rows are discarded.
- `readFence(tx)` is a lock-free probe returning `{ graphRevision, lockSeq, revocationGeneration, releaseDigests }`.
- The guarantee holds because every canonical writer takes `lockFence` and bumps `graphRevision` once per committed effect. Unmanaged admin writes are outside it.

**Snapshots cited as `basis.snapshotRef`.**
- Persist through `SnapshotCustody.put(record, bytes)` (`packages/kg-ops/src/custody.ts`; file backend `runs/release-v2/custody/snapshots/`).
- The record is a `CustodySnapshotRecord` (`bks-custody-snapshot.v1`):
  - `bytesDigest = rawBytesDigest(bytes)`.
  - `issuer`: one of `BKS_SNAPSHOT_ISSUERS`.
  - `scope`: installation / application / tenant.
  - `pins.schemaReleaseDigest`.
  - `consistency.graphRevision`: the revision from `withStableRevision`.
  - `dependencies {complete, nodes[{uid, updatedAt}]}`.
- The planner accepts `revision-equal`, or `dependencies-unchanged` when `complete: true`; anything else is `BKS_STALE_REVISION`.

**Digests.**
- `queryDigest` and `resultDigest`: `canonicalDigest(value, profile)` (bks-canonical-json.v2; no timing in `resultDigest`).
- Retained bytes: `rawBytesDigest(bytes)`.
- `receiptDigest`: `canonicalDigest` including timing and server metadata.
- Shared types `ReadResultStatus`, `ReadDigests` and `ConsistencyMode` are in `@bks/contracts`. Python: `canonical_digest`, `raw_bytes_digest`.

**Executor module.**
- Add `apps/executor/src/modules/read.ts` exporting `executorModule` (interface in `modules/module.ts`), with capabilities `read.typed` v2 and `read.cypher`, role `reader`. It is discovered by HTTP and MCP; no other file changes.
- `BKS_DISABLE_READ_V1=1` retires `modules/read-v1.ts`.
- Use a read-only database role for reads. The Enterprise test proves `bks_reader` cannot write even through a WRITE session.

**Mission Control / S7.**
- Issue `bks-apply-witness.v1` (Ed25519, audience `bks-executor`, ≤60 s). It binds effectKey, scope, the intent/plan/release/evidence digests, `partialPolicyDigest`, the policy/decision versions and `revocationGeneration`.
- Pin the issuer public key via `BKS_WITNESS_ISSUER_KEYS`.
- Deliver revocations with `deliverRevocation(client, generation)`.
- Reconcile with `GET /kg/receipt?effectKey=` before any retry.


## 11. Revision v4 (Sprint V SV-11, 2026-10-25): Knowledge Services dispatch admission and official reads

Release `biotech-schema-v2.2.0` (schemaReleaseDigest `sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74`, schemaDigest `sha256:de8ab942f3b2fac85011938adcddd75244bc9b5e7c53df07ebc7490b888f6576`, ddlDigest `sha256:f0622dba117bd16236e575546764bd49444b604e95893eef665d1e796199ddb3`; decision R-SV11) is pinned. Deltas: `ReportKind.STUDY_APPRAISAL`; `useDecisionDigest` on kernel `Activity` and `Assessment`; `KsIntentMarker` RANGE indexes `ks_intent_marker_dispatch_id` and `ks_intent_marker_marker_digest` (operational DDL declared in `rules/operational-names.yaml` `ddl:`; uniqueness stays on `ks_intent_marker_key`). Biotech admission authority is the Knowledge Services common component `knowledge_verification` installed in the Biotech application PostgreSQL; PostgreSQL and Neo4j are not one transaction.

**Contracts (`packages/contracts/src/admission.ts`, `read-v2.ts`; JSON Schemas exported):**

| Contract | Use |
| --- | --- |
| `biotech-knowledge-admission.v1` | Dispatch payload Knowledge Services stores as the `knowledge_verification.artifact_custody` row (inline bytes, media type `application/vnd.belllabs.biotech-knowledge-admission.v1+json`) whose `digest` = `dispatch_outbox.payload_digest`; `target_binding = biotech-graph`. Carries tenant, installation, application, dispatch id, effect key, bound effect digest, semantic payload digest, originating origin digest, use decision `{id, digest}`, report revision ref, run ref `{runId, manifestDigest, sealKind}`, `revocationEpochAtDecision`, `decidedAt` (planner clock), the exact `biotech-knowledge-intent.v2` intent (no Cypher), custody refs, `expectedMarkerSchemaVersion: bks-intent-marker.v2`. Native payload bytes = bks-canonical-json.v2 of `intent`; `boundEffectDigest` = K01 `boundEffectDigest` (cross-repo vector in `admission.test.ts`). |
| `biotech-knowledge-admission-ack.v1` | Per-dispatch result: outcome `applied | duplicate | revoked | refused | deferred`, `markerDigest` (= `acknowledge_dispatch` `p_ack_digest`), payload / plan digests, receipt id, graph `{bookmark, graphRevision, markerKey}`, `componentState`, `acknowledged`, reason, retry. |
| `biotech-knowledge-admission-consume-request.v1` / `-consume.v1` | `POST /kg/admission/dispatch/consume` request `{tenantId, limit}` and report `{claimed, results[]}`. |
| `biotech-knowledge-read-intent.v3` / `-result.v3`, `bks-read-eligibility.v1` | v2 typed operations + `marker` (`dispatchId | markerDigest | effectKey`, principal-scoped) + `use {officialUse, useName, audience}`; results add `use` and `eligibility {checkedAt, authoritativeEpoch, decisionEpoch, state: eligible | revoked | stale | authority_unavailable, items[], excluded, held}`. Report / assertion rows carry an `admission` column (the generating Activity's use decision ref / digest, effect key, epoch). |
| additive | `report.publish` optional `reportRevisionRef`, `reportSchema`, `reportKindRef` (`<kind>@<semver>`), `structuredBodyDigest`, `supersedesReportRevisionRef`, `custodyKind`; receipt v2 optional `admission`; `Principal.principalClass` (`agent | operator | service`). |

**Operations:**

- `POST /kg/admission/dispatch/consume` (module `admission-dispatch`, capability `admission.dispatch`): role writer + token class `service` + grant `admission.dispatch`, principal `tenantId` = body `tenantId`, listed in `BKS_VERIFICATION_TENANTS`. CLI `bks admission consume --once [--tenant UUID] [--limit N]`. Enabled only with `BKS_BIOTECH_DB_VERIFICATION_DSN` (login role holding `knowledge_verification_outbox_worker`; named `BKS_VERIFICATION_DSN` before the 2026-11-07 env rename) and `BKS_VERIFICATION_TENANTS`.
- `POST /kg/read` with a v3 body (MCP `kg_read_v3`), capability `read.official`; eligibility authority `BKS_BIOTECH_DB_VERIFICATION_READ_DSN`, else `BKS_BIOTECH_DB_VERIFICATION_DSN`; principal `tenantId` must be the knowledge_verification tenant uuid. Not configured or unreachable: official parts are held.

**Consumer semantics:** claim → payload (sha256 = payload_digest, contract, row binding) → row state recheck (`revoked` → outcome revoked, no write) → bound effect recomputed from the native bytes and the origin identity → existing marker (duplicate / reordered / lost ack → acknowledge again with the stored marker digest) → exact-use recheck mirroring `admit_exact_use` (revoked / stale) → plan (clock `decidedAt`) → `applyAdmittedV2`: effect + Activity admission binding + `KsIntentMarker` dispatch fields in ONE write transaction (`faults.beforeMarker` proves rollback) → `acknowledge_dispatch`. Graph unavailable, transaction failure, held decision → `fail_dispatch` with retry. Marker v2 fields: `markerSchemaVersion, dispatchId, markerDigest = sha256 canonical {format: bks-intent-marker-digest.v1, payloadDigest, planDigest}, payloadDigest, boundEffectDigest, useDecisionRef, useDecisionDigest, revocationEpoch (authoritative epoch checked), appliedAt`. One run Activity per admitted effect (`Activity.effectKey`); an existing Activity bound to another effect refuses (`BKS_EFFECT_CONFLICT`).

**Known component gaps (owner: KS `packages/knowledge-db-contract`, not changed here):** no outbox-worker terminal function for a revoked / refused outcome while the row is `dispatched` (BKS parks with `fail_dispatch`, long retry); `claim_dispatches` does not filter `target_binding`; no reader / outbox-worker callable exact-use check (BKS mirrors `admit_exact_use` in one SELECT); the acknowledgment record itself is not durable in PostgreSQL (`ack_digest` only).
