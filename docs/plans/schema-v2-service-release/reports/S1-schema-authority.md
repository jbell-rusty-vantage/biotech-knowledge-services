# S1 handoff: schema / contract authority (S1, plus S0 upstream publication)

Role: schema authority. Date: 2026-10-11. Nothing was committed or pushed in either repository. Aura was not touched. Budgets are unchanged. Pre-existing dirty files (`README.md`, `docs/deployment/graphql-api.md`) and everything under `schema/program/` were preserved. The one exception is the append-only §11 of `final/open-questions.md`. Evidence files live in `runs/release-v2/custody/s1/` (gitignored).

## 1. Release identities

| Identity | Value |
| --- | --- |
| releaseId | `biotech-schema-v2.0.0` (status `frozen`, createdAt `2026-10-11T00:00:00.000Z`) |
| parent baseline (candidate, never reused) | `sha256:c7cf1235dba876b26460c54a6510028d2dcfc65989787eacd5b446f9034b4793` |
| schemaDigest (final assembled SDL) | `sha256:fe2cc50afb4a48e16a2b5c3c37378b4d00a679a06d37bf312676c45c65c6589a` |
| schemaReleaseDigest (sha256 of canonical release.json) | `sha256:b62036de7c01be3daf9eae7e534ce0ce566070f4dcc54a3b0aca0ba1070b092f` |
| queryCatalogDigest | `sha256:16934295093dd4ae4f71db25ea17f07b8236cb7acde753edc2f13bee5f75d3f3` |
| ddlDigest (sha256 of `ddl/ddl.json`) | `sha256:454d6ad60ee1063785e148823f1d02614b2864af089de1bb62deee37ed900644` |
| validationParamsDigest | `sha256:930a60f31f579e13de8fcb10559db62afd67717f9a724054d72b9ccfb29e967c` |
| decisionLedgerDigest | `sha256:f790c297b7f3ddcfce9add50f1b494e4dd975dbe2202ebb957c6f9fb521e7c42` |
| contentTreeDigest (= biotech-meta dirty-snapshot identity) | `sha256:aacc4c563abc7a504a759ff708ec439cb6f2b7c23772403a270805a9eaca9dbc` |
| workspaceFingerprint (regenerated, S2 owns the format) | `sha256:1ba36b12a83f2e80af6cd304f7ca7481462c92c5d9cdee6cb7afb5406c756726` (755 files) |
| source revision | BKS `431c8a7c287ee3d914843390a080dbfbe949acdc`; biotech-meta `638aef572383062401b341802adcf01521136ff7` plus the uncommitted release (`PIN.sourceRevision.biotechMeta` = content-tree digest) |

Release contents: 72 frozen files plus `release.json` plus 1 excluded placeholder (`migration/legacy-map.yaml`), 74 files pinned. Size: 69 node types, 106 relationship types, 181 collapsed pairs (the adopted ≤ 600 metric), 848 expanded pairs (published baseline; the retired expanded ≤ 600 rule is neither met nor claimed), K = 15 relationship types (OD-46 exception).

## 2. Changed files

**biotech-meta** (all uncommitted):
- `docs/schema/releases/biotech-schema-v2.0.0/**` (new):
  - `README.md`, `release.json`
  - `sdl/` (modules, assembled, manifest), `registers/`
  - `vocabularies/` (11 files, including the new `qualifiers.yaml`, `assessments.yaml` and `capture-methods.yaml`), `rules/` (3)
  - `tooling/action-space.yaml`, `ddl/` (4), `query-catalog/` (sources, `catalog.json`, `explain.json`)
  - `migration/` (`v1-map.yaml`, plus the `legacy-map.yaml` placeholder)
  - `workspace-inputs/` (6), `validation/validation-params.json`, `reports/` (8), `decisions/DECISIONS.md`
- `docs/schema/releases/.gitattributes` (new). It sets `* -text` so a Windows `autocrlf` checkout cannot rewrite digest-bound bytes. biotech-meta has no `.gitattributes` and `core.autocrlf=true`.
- Edited:
  - `docs/schema/CHANGELOG.md`: new "Unreleased → biotech-schema-v2.0.0" entry.
  - `docs/schema/OPEN-QUESTIONS.md`: status section inserted before "Agent evaluation questions".
  - `docs/schema/ontology-lab/proposal-index.md`: new §11.
  - These three files' working copies were normalized to CRLF, matching autocrlf. The index stays LF.

**biotech-knowledge-services**:
- New `scripts/release/`:
  - `promote.mjs`, `generate.mjs`, `pin.mjs`, `verify.mjs`, `apply-ddl.mjs`, `explain-catalog.mjs`, `yaml-parity.mjs`, `bootstrap-workspace-inputs.mjs`.
  - `lib/`: `common`, `assemble`, `corrections`, `sdl-model`, `params`, `ddl`, `metrics`, `reports`, `catalog`, `registries`, `capture-methods`, `v1map`.
- `scripts/assemble-schema.mjs`: refactored onto `lib/assemble.mjs`. It still reproduces `c7cf1235…` byte for byte (`cmp` identical).
- `scripts/packet-check.mjs` (TL-01): the kernel allowlist is read from the release kernel, `Mention` and `StateEpisodeProperties` are rejected, edge-property and enum references are checked, and a new `--release` mode was added.
- `packages/schema-workspace/src/`:
  - New `release.ts`; rewritten `ir.ts` and `load.ts`; extended `parse.ts`; updated `index.ts`.
  - `sidecars.ts` (FU-09).
  - `build.ts` and `render.ts`: compatibility edits (section 8).
  - Tests: new `release.test.ts`; rewritten `schema-workspace.test.ts` and `map.test.ts`.
- `package.json` scripts: `schema:pin`, `schema:release:{promote,generate,check,verify,explain,ddl,parity}`.
- `schema/pinned/**`: replaced by `pnpm schema:pin` only. It now holds `PIN.json` (bks-pin.v2), `README.md` and `release/**`. The v1 files (`final_biotech_schema_proposal.graphql`, `operations*.cypher`, `validation-params.json`, `modules.yaml`) were removed by the command and are summarized under `PIN.provenance.previousPin`.
- `schema/sidecars/`: the five v1 yaml files were deleted (they remain in Git history) and replaced by a `README.md` pointer. One authority: the release `workspace-inputs/`; the pinned verified copy is `schema/pinned/release/workspace-inputs/`.
- `workspace/**`: regenerated by `pnpm workspace:build` (755 files).
- `schema/program/final/open-questions.md`: append-only §11, one status/link line per entry (160). The historical bytes are unchanged (+165/−0).
- `docs/plans/schema-v2-service-release/INTERFACES.md`: published as v1.
- `docs/plans/schema-v2-service-release/reports/S1-schema-authority.md`: this report.

## 3. What the release contains (S1 decisions)

**Source corrections** (`reports/corrections.json`, 37 entries, each with an exact anchor and its decision id):
- C-SDL-01..03: Assertion.predicate and qualifiers docstrings, plus the kernel convention path. Registered prefixes now include `target:`, `comparatorArm:` and `comparator:` (SPEC 2.4, FU-14 a, MD-D12-02).
- C-SDL-04: DecisionCriterion.inputPredicates now names DECLARES_COMPONENT instead of DECLARES_AMOUNT (MD-X-03 d).
- C-SDL-05: added `publisherUidMethodVersion`, `publisherUidDerivedAt` and `publisherUidAuthorityUid`; publisherUid is retained only with these stamps (MD-D10-06).
- C-SDL-06..08: enum-mapping docstrings point at `migration/v1-map.yaml`.
- C-SDL-09: D13 `roleText:` spelling.
- Register baseline stamps.
- 15 explicit executor permissions (OD-03) for rows that only carried packet GraphQL flags.

**Predicates** (MD-X-02, MD-X-03, FU-13, FU-14 f). The registry has 374 entries: 301 registered, 39 alias-of, 34 retired-by, 0 proposed-new.
- All 35 candidates are accounted for. 17 were registered: 8 FIELD predicates of existing SDL fields, and 9 fixture-backed literals, 2 of them with kind corrected from relationship to literal. 18 were rejected with a re-key target.
- All 32 registrar flags are accounted for. The candidate registry has 32 rows today; open-questions said 33 at the first close-out, and the report notes the difference. 16 were kept as explicit exceptions (the D2 and D10 families, D8 action level per FU-14 f, and the rule-3 "span" clause). 14 moved to the subject owner. 2 were resolved as duplicates: PER_MAX_DAILY_DOSE_AMOUNT → alias of D6 CALCULATED_DAILY_MAX_INTAKE, ORGANIZATION_RENAMED → alias of D7 FORMER_NAME.
- OUTCOME_MEASURED_WITH lost its Metric object; that case is MEASURES. MEASURES is asserted.
- Alias chains are re-pointed (MAX_DAILY_SUPPLEMENTAL_AMOUNT).
- Report: `reports/predicate-registry-report.{json,md}`. Endpoint check: 0 problems.

**Identifier schemes** (KN-06, MD-X-01, OD-12): 52 are write-active and 61 are disabled, with reasons. A scheme is active only with an issuer, a normalization rule, R-42 uniqueness, public rights and an exercised route (a fixture use plus an authority route of readiness ≥ 2). CPT, UMLS, SNOMED, DrugBank and CAS are marked rights-restricted. Fixture schemes with no register row: DOMAIN (7 uses) and FDC_NUTRIENT_NUMBER (2), left to S3 for re-keying.

**Registries and rules** (fork C, promotion-time):
- `qualifiers.yaml` (bks-qualifier-grammar.v1): 77 registered and 2 aliases. 97 observed prefixes without a register row are listed under `unregisteredObserved`, not registered. Migrations: GE/LE → GTE/LTE, `comparator:hu:` → `comparatorArm:`, and OD-29 `intakeContext:HIGH_INTAKE_SOURCE_STATED`.
- `assessments.yaml`: 15 kinds and 88 subkinds (6 requested, 2 retired).
  - KN-01 `OTHER/D3.dose-translation@1`.
  - MD-D3-02 BEST.
  - MD-D4-03 alias.
  - MD-D7-06.
  - FU-14 (c) `bl-assoc/evidence-aggregate@1`.
  - FU-14 (g) `INADEQUATE_DISCLOSURE_PER_REGULATOR`, with the D9 spelling as an alias.
- `rules/identity-rules.yaml`: 16 rules over 69 types.
- `rules/projection-rules.yaml`: 11 policies, 21 cache fields, `notReported` for 7 types, status non-implication, KN-15 decision table, and the OD-19 / OD-37 rules.
- `rules/temporal-rules.yaml`: 106 types (26 episode, 80 recorded-only); 3 exclusive, scoped per OD-05.

**Capture methods** (FU-06): 579 values, 164 distinct. 63 values (16 distinct) are canonical, 478 (131) are mapped by explicit rule (39 rules, each with an evidence substring), and 38 (17) are explicit ambiguous errors that need adapter evidence. No mechanical guessing.

**v1 map**:
- 192 nodes: kept 49, merged 119, renamed 3, folded 13, retired 8.
- 393 relationship types: merged 111, kept 50, renamed 15, predicate-only 30, carried-by-pattern 66, retired 114.
- The 7 unmapped edges carry the DECISIONS handling verbatim, plus the quarantine and lineage flags.
- `enums.valueMappings` for QuantityComparator and RegulatoryPathway.
- `legacy-map.yaml` is a placeholder (19 labels and 25 types, all `pending-S8`). It is excluded from the frozen digest set. When S8 delivers it, S1 re-releases as v2.0.1.

**Validation params** (FU-08): 69 uid tokens (no duplicates); 63 asserted, 37 structural, 6 derived (2 rule-only); 3 exclusive; 301 registered predicates; `legacyTypes` and `privateUidTokens` are empty. `implicationPairs` were re-derived at predicate level: 8 v2 pairs, each with a note. No v1-only name remains.

**DDL** (FU-07): 499 statements.
- Required (290, community):
  - `entity_uid` and `uid_<Label>` for every stored label (a second line of defense).
  - Kernel/pattern D-1, including `identifier_key`.
  - `identifier_scheme_value` (FU-14 d), register composite ranges, and the D9 indexes `channel_platform_account` and `sponsored_by_valid` (MD-D9-03 a).
  - 160 `rel_<TYPE>_{assertion,writer}` relationship-property indexes.
  - 15 fulltext indexes.
  - `ks_write_fence_id`, `ks_intent_marker_effect_key`, `ks_release_marker_release_id`, `ks_intent_marker_status`, `ks_release_marker_installed`.
- Enterprise (206): uid existence and type constraints, asserted-edge `assertionUid` existence, and marker shape constraints.
- Optional (3): the OD-44 vectors, disabled.

**Query catalog** (fork B):
- 153 templates, one per statement: 120 supported, 2 held, 31 unsupported (GDS).
- EXPLAIN: 132 ok, 0 failed, 21 GDS calls skipped.
- 454 questions: 123 supported, 322 held (packet-pattern only; S4 promotes them), 9 unsupported (GDS-only). Value 1: 68 / 85 / 1.
- OD-10 option A for Q-D12-03 and Q-D12-06.
- 15 aliases (CQ-PF-03a/b, CQ-FL-01..05, CQ-PV-01 → Q-K-01).
- "supported" means the template passed EXPLAIN on 5.26 with the required DDL; result assertions are `not_run`.

**FU-12** Subjectable audit: all 56 implementers have a registered use, so no removal candidates. Reports: `reports/subjectable-audit.json` and `reports/metrics.json` (OD-01, OD-46).

**Decision closure**: all 160 decision ids are in `decisions/DECISIONS.md`. `reports/decision-closure.json` maps all 67 S0/S1-scoped decisions to release artifacts and lists the work packages that still owe evidence.

## 4. Commands run and results (final state)

| Command | Result |
| --- | --- |
| `node scripts/assemble-schema.mjs --out <scratch>` + `cmp` with the candidate | identical bytes, `c7cf1235…` |
| `node scripts/release/promote.mjs --check` | ok, 0 drift (51 promotion files) |
| `node scripts/release/bootstrap-workspace-inputs.mjs --check` | ok, 0 drift |
| `node scripts/release/generate.mjs --check` (upstream dir) | ok, 0 drift, 0 problems |
| `node scripts/release/verify.mjs` (upstream and `schema/pinned/release`) | ok (72 files) |
| `pnpm schema:pin -- --release ../biotech-meta/docs/schema/releases/biotech-schema-v2.0.0 --pinned-at 2026-10-11`, then `pin.mjs --check` | ok, 74 files; check ok |
| `node scripts/release/apply-ddl.mjs` (required DDL, fresh 5.26.31 Community, bolt 7693) | 290/290 applied; 292 indexes ONLINE; 82 constraints; 0 missing / failed / not ONLINE |
| `apply-ddl.mjs --uri neo4j://localhost:7694` (required DDL, fresh 5.26.31 Enterprise eval) | 290/290, ok |
| `apply-ddl.mjs --file ddl/enterprise.cypher --uri neo4j://localhost:7694` | 206/206 applied, ONLINE, ok |
| `apply-ddl.mjs --file ddl/enterprise.cypher` on Community | 0/206, rejected as expected: proves the edition split |
| `node scripts/release/explain-catalog.mjs` (after the required DDL) | 132 ok, 0 failed, 21 skipped; `explain.json` byte-identical across runs |
| `node scripts/release/yaml-parity.mjs` (26 pinned YAML files) | 26/26 equal (Node `yaml` vs PyYAML via `uv run --with pyyaml`) |
| `node scripts/packet-check.mjs --release schema/pinned/release` | ok: 14/14 modules, 0 issues |
| `node scripts/packet-check.mjs K … D13` (frozen packets) | 10 pass, 4 fail. These are genuine packet-era references the release resolved: D3, D5 and D6 use `StateEpisodeProperties` (R-10), and D2 uses `QuantityBasis`. The packets are frozen, so the failures are recorded, not fixed. |
| `pnpm exec vitest run --project schema-workspace` | 3 files, 35 tests passed |
| `pnpm workspace:build`, `pnpm workspace:verify` | ok; fingerprint `sha256:1ba36b12…` |
| `pnpm test` (whole repo) | 13 files passed, 1 failed, 2 skipped; 170 tests passed, 1 failed, 10 skipped. The failure is S6's `apps/graphql-api/src/projection.test.ts` "omits operational/private fields…", which expects `publisherUid` to be absent; see section 7. |
| `pnpm build` | fails with 7 TS errors, all in `apps/executor/src/{index,mcp}.ts` (S3's in-flight rename `planIntent` → `planIntentV2`, plus error codes). No error involves schema-workspace exports. |

## 5. Unrun checks and limitations

- **Templates are only EXPLAIN-checked.** Result assertions against fixtures were not run (S4, FU-04). 322 questions stay `held` with their packet pattern cited.
- **EXPLAIN flags.** `AllNodesScan` appears in K/CQ-AX-04, K/Q-K-23, D9/CQ-RC-05, D12/Q-D12-18, QP/P-10a.4 and QP/P-10c.2. Q-D5-20 matches the unstored `:Subjectable` label. Q-D9-19 (also GDS) and Q-D9-02 carry `knownGaps` (MD-D9-03 c, d).
- **Runtime GraphQL metrics are S6's.** Input types, printed size and build time were not measured by S1.
- **Golden vectors (S1 bullet in IMPLEMENTATION) are left to S3.** The cross-language canonical-JSON golden vectors belong to S3 (`packages/contracts`, KN-08). Release digests use the same sorted-key canonical JSON as `@bks/contracts` `canonicalJson`.
- **Still open, outside S1:**
  - fixture re-keys for the 18 rejected predicates and the observed qualifier prefixes (S3, FU-03)
  - 17 ambiguous capture methods (adapter owners)
  - 6 requested assessment subkinds
  - disabled identifier schemes
- **IR v2 `provenanceRequirement`** is a per-archetype kernel rule, not a per-type register field. `projectionGate` exists on relationships only (LEADS_TO, RESPONDS_TO: SUPPORT); it is `null` on nodes.
- **`workspace:verify`** still compares fingerprints only. Hashing the on-disk files is S2's job (SPEC 3.3).
- **The biotech-meta release is uncommitted.** Its identity is the content-tree digest. Committing it changes nothing in `release.json`, but `PIN.sourceRevision.biotechMeta` should be re-pinned to the commit with `pnpm schema:pin` once the lead commits.

## 6. Interface deltas

INTERFACES.md is now **v1**. Its section 9 lists each delta against v0 and who must adapt. The main ones:
- **IR.** IR is `bks-schema-ir.v2`, and `fragments` holds the modules K..D13. `NodeType.allowedMutations` is the GraphQL flag (all false) and must not gate executor writes; use `executorOps`.
- **PIN.json files.** `PIN.json` `files` are relative to `schema/pinned/release/` and include `release.json`.
- **ReleaseError.** `ReleaseError` adds a new `RELEASE_INVALID` code.
- **DDL.** The DDL replaces `schema/pinned/operations*.cypher`, which no longer exist.
- **Sidecars.** The sidecar authority is the release `workspace-inputs/`.
- **Workspace manifest.** `sourceRun` is the releaseId and `catalogVersion` is the schemaReleaseDigest; the contract field names are unchanged.
- **publisherUid.** It is retained in the SDL with three stamps; the MD-D10-06 projection rule is "project only when all three stamps are present".

**Invalidated artifacts:**
- the previous `workspace/` (regenerated)
- S6's generated schema, identity and operations artifacts and benchmarks built from the candidate SDL
- planner probes against the candidate IR
- any test asserting v1 W-fragments or the v1 file name

## 7. Other-role edits needed (exact lines; I did not edit these)

- **S3 (executor):**
  - `packages/kg-ops/src/operations.ts:3,34,37` reads `pinnedDir/operations.cypher` and `operations.enterprise.cypher`, which are gone. Switch to `loadRelease().ddl.required` and `.enterprise` (statement list: `ddl.manifest.statements`).
  - `packages/kg-ops/src/cli.ts:33` help text.
  - `apps/executor/src/index.ts:8,42` and `apps/executor/src/mcp.ts:6` fail to build (in-flight `planIntentV2` rename and error codes).
  - Planner: read creatability from `NodeType.executorOps`. Re-key `params.predicateAliases` before ingest and reject `retiredPredicates`. Accept only `activeIdentifierSchemes`. There is no TradeItemIdentifier in v2 (`.agents/skills/biotech-kg-ingest/SKILL.md:87` still says so: lead).
  - Ingestion-rules and identity-rules content changed; fork D listed the changes: `assertionDefaults.status: EXTRACTED`, `kernelPlumbing.assertionSupport: HAS_EVIDENCE`, no `maturity` / `schemaVersion` defaults, `lastWriterRunId`, `registerNormalization`.
  - Fixture round (FU-03): re-key the 18 rejected predicates (re-key targets are in the registry report), the unregistered schemes DOMAIN and FDC_NUTRIENT_NUMBER, and the nonconforming qualifiers.
  - Fence bootstrap statement: `ddl.json` `bootstrap`.
- **S6 (consumer API):**
  - Regenerate `apps/graphql-api/generated/*`, operations and benchmarks from the pinned release; the SDL digest is now `fe2cc50a…`.
  - `apps/graphql-api/src/projection.test.ts` expects `publisherUid` to be omitted. Either keep omitting it, or project it together with `publisherUidMethodVersion`, `publisherUidDerivedAt` and `publisherUidAuthorityUid` (`rules/projection-rules.yaml` `decisionCriterionPublisherUid`).
  - `apps/graphql-api/Dockerfile:15,27` copy `schema/pinned`, which now contains `PIN.json` + `release/`. Confirm that the image loader resolves `dist/schema/PIN.json` and `release/`.
  - `docs/deployment/graphql-api.md:3,43,64` (append-only section) still name the v1 SDL and `operations.cypher`.
- **S2 (workspace):**
  - `packages/schema-workspace/src/render.ts:21` (`fragments/<W##>.md` layer text) and `:253` (`frag:<W##>` id help) still describe v1 fragments.
  - Render `pendingProposalKinds` (task routes) and the new IR v2 fields (modules, predicates, assessments, qualifier grammar).
  - `.agents/skills/biotech-schema-explore/SKILL.md:23` (v1 SDL path, `schema/sidecars`).
  - `docs/architecture/0002-schema-workspace-progressive-disclosure.md:25` (sidecars).
  - On-disk `workspace:verify` (SPEC 3.3).
  - Workspace-manifest field names in `packages/contracts/src/workspace.ts:42-48` (`sourceRun` / `catalogVersion` now carry releaseId / schemaReleaseDigest).
- **S4 (reads):**
  - Add result assertions to the 120 supported templates.
  - Promote the held questions.
  - Fix the `AllNodesScan` templates, Q-D5-20 and the Q-D9-19 / Q-D9-02 gaps.
  - Catalog temporal parameters bind as driver DateTime (`neo4jType`).
- **S8 (migration):** fill `migration/legacy-map.yaml` in the upstream release, then ask S1 for `biotech-schema-v2.0.1`. Write `:KsReleaseMarker {ddlDigest: sha256:454d6ad6…}` after DDL and migration checks.
- **Lead:**
  - `AGENTS.md:8-9`: re-pin with `pnpm schema:pin -- --release <dir>`; sidecars are authored upstream in `workspace-inputs/`.
  - `README.md:14,16,32`: pre-existing dirty file, so not edited.
  - `.agents/skills/biotech-cypher-baseline/SKILL.md:34`: tokens path is now `schema/pinned/release/validation/validation-params.json`.
  - `.agents/skills/biotech-kg-ingest/SKILL.md:87`: TradeItemIdentifier.
  - Commit biotech-meta (including `docs/schema/releases/.gitattributes`), then re-pin to record the commit.

## 8. Minimal compatibility edits outside the core S1 files (for the workspace role)

- `packages/schema-workspace/src/build.ts`: the whole function. The IR now comes from `loadRelease().ir` (release IR v2) instead of `parseSchema(readPinnedSdl(), v1 params)`.
- `packages/schema-workspace/src/render.ts`:
  - Lines 63-69: `pinnedPath` comes from `PIN.root` + `sdlKey`; `sourceRun` = `pin.releaseId`; `catalogVersion` = `pin.schemaReleaseDigest`.
  - Line 226: the START_HERE "Generated from the pinned release …" sentence.
  - No other renderer change; the renderer works on v2 because `fragments` are the modules.
- `packages/schema-workspace/src/sidecars.ts` (fork D, FU-09):
  - `modules` is read into `fragments`; `aliases.yaml` is loaded.
  - Optional fields added: `Sidecars.aliases`, `DomainSidecar.modules`, `TaskSidecar.pendingProposalKinds`.
  - The validator was extended.
- `workspace.ts` was not edited.

## 9. Gate A evidence rows (for VALIDATION.md)

| check | identity | env | command | timestamp | result | evidence |
| --- | --- | --- | --- | --- | --- | --- |
| candidate module assembly | baseline `sha256:c7cf1235…`, 14 modules | local Windows, Node 24.18.0 | `node scripts/assemble-schema.mjs --out <scratch>` + `cmp` | 2026-10-11 18:4x EDT | passed (byte-identical) | S1 session |
| release sources reproducible | release `biotech-schema-v2.0.0`, BKS `431c8a7` | same | `node scripts/release/promote.mjs --check` | 2026-10-11 19:21 EDT | passed (0 drift) | `runs/release-v2/custody/s1/promote-check.json` |
| deterministic generation | schemaDigest `sha256:fe2cc50a…`, release `sha256:b62036de…` | same | `generate.mjs --check`; vitest "regenerates … byte for byte" (two temp runs + pin) | 2026-10-11 19:21 EDT | passed | `custody/s1/generate-check.json`, `custody/s1/vitest-schema-workspace.txt` |
| release digests verify | 72 frozen files + excluded placeholder | same | `node scripts/release/verify.mjs`; `pin.mjs --check` | 2026-10-11 19:21 EDT | passed | `custody/s1/verify-pinned.json` |
| pin + loader | PIN bks-pin.v2, 74 files | same | `pnpm schema:pin -- --release …`; vitest pinned bundle suite | 2026-10-11 19:11 EDT | passed | `schema/pinned/PIN.json`; vitest |
| tamper detection | pinned bundle copy, 1 flipped byte / unlisted file / edited release.json | same | vitest `release.test.ts` | 2026-10-11 19:21 EDT | passed (RELEASE_TAMPERED ×3) | `custody/s1/vitest-schema-workspace.txt` |
| missing explicit override | `BKS_SCHEMA_RELEASE_DIR=/nonexistent/bks-schema-release` | same | vitest `release.test.ts` | 2026-10-11 19:21 EDT | passed (RELEASE_MISSING, no fallback) | same |
| uid tokens / classes / register-SDL agreement | IR v2 `bks-schema-ir.v2` | same | vitest `release.test.ts` (69 tokens; MEASURES asserted; HAS_VARIANT, REQUIRES_INPUT_METRIC structural; 106 = 106) | 2026-10-11 19:21 EDT | passed | same |
| predicate endpoints + 35 candidates | registry 374 entries | same | vitest FU-13 + MD-X-03 tests; `reports/predicate-registry-report.json` | 2026-10-11 19:21 EDT | passed (0 endpoint problems; 35/35; 32/32 flags) | release `reports/` |
| sidecar validation | workspace-inputs (11 domains, 35 terms, 16 tasks, 943 aliases) | same | vitest "validate against the IR with zero errors" | 2026-10-11 19:21 EDT | passed (0 errors) | same |
| all 160 decision ids | `decisions/DECISIONS.md` `sha256:f790c297…` | same | vitest "copies the decision ledger…"; `reports/decision-closure.json` | 2026-10-11 19:21 EDT | passed (160; 67 S0/S1 rows mapped) | release `reports/decision-closure.json` |
| seven unmapped edges | `migration/v1-map.yaml` | same | vitest + v1map counts | 2026-10-11 19:21 EDT | passed (7/7 with DECISIONS text) | release `migration/v1-map.yaml` |
| catalog EXPLAIN | queryCatalogDigest `sha256:16934295…` | docker `neo4j:5.26-community` 5.26.31, required DDL applied | `node scripts/release/explain-catalog.mjs --uri neo4j://localhost:7693` | 2026-10-11 23:16Z | passed (132 ok / 0 failed / 21 GDS skipped; byte-identical rerun) | `custody/s1/explain-final.json` |
| required DDL ONLINE (Community) | ddlDigest `sha256:454d6ad6…` | fresh 5.26.31 community | `node scripts/release/apply-ddl.mjs --uri neo4j://localhost:7693` | 2026-10-11 23:16Z | passed (290/290; 292 indexes ONLINE) | `custody/s1/ddl-required-community.json` |
| required + enterprise DDL (Enterprise eval) | same | fresh `neo4j:5.26-enterprise` 5.26.31, `NEO4J_ACCEPT_LICENSE_AGREEMENT=eval` | `apply-ddl.mjs --uri neo4j://localhost:7694` (required, then `--file ddl/enterprise.cypher`) | 2026-10-11 23:16Z | passed (290/290; 206/206; all ONLINE) | `custody/s1/ddl-required-enterprise.json`, `ddl-enterprise-enterprise.json` |
| edition split | enterprise.cypher on Community | fresh 5.26.31 community | `apply-ddl.mjs --file ddl/enterprise.cypher` | 2026-10-11 23:16Z | passed as expected (0/206 accepted; Community rejects existence/type constraints) | `custody/s1/ddl-enterprise-community.json` |
| YAML parity (TL-04) | 26 pinned YAML files incl. `tooling/action-space.yaml` | Node `yaml` 2.9.1 vs PyYAML (`uv run --with pyyaml`) | `node scripts/release/yaml-parity.mjs …` | 2026-10-11 19:21 EDT | passed (26/26) | `custody/s1/yaml-parity.jsonl` |
| packet-check (TL-01) | release modules K..D13 | local | `node scripts/packet-check.mjs --release schema/pinned/release` | 2026-10-11 19:21 EDT | passed (14/14, 0 issues); frozen packets 10/14 (packet-era refs recorded) | `custody/s1/packet-check-release.json` |
| workspace regenerate + verify | fingerprint `sha256:1ba36b12…` | local | `pnpm workspace:build && pnpm workspace:verify` | 2026-10-11 19:21 EDT | passed (755 files) | `custody/s1/workspace-verify.json` |
| repo unit tests | BKS working tree (all roles' in-flight edits) | local | `pnpm test` | 2026-10-11 19:22 EDT | failed (170 passed, 1 failed (S6 projection test, publisherUid expectation), 10 skipped) | `custody/s1/pnpm-test.txt` |
| repo build | same | local | `pnpm build` | 2026-10-11 19:22 EDT | failed (7 TS errors in `apps/executor`, S3 in flight; none in schema-workspace) | `custody/s1/pnpm-build.txt` |

Disposable containers `bks-neo4j-s1` (7693) and `bks-neo4j-s1-ent` (7694) are still running for the lead to reproduce these checks. Remove them with `docker rm -f bks-neo4j-s1 bks-neo4j-s1-ent`.

## v2.0.1 staging (lead follow-up, 2026-10-11)

Staged upstream; **not pinned** (`schema/pinned` still holds v2.0.0, PIN unchanged). `biotech-schema-v2.0.0` was not edited: `verify.mjs` ok, `generate.mjs --check` ok, digest still `sha256:b62036de…`.

### Identities

| identity | v2.0.1 | v2.0.0 |
| --- | --- | --- |
| schemaDigest | `sha256:fe2cc50afb4a48e16a2b5c3c37378b4d00a679a06d37bf312676c45c65c6589a` (unchanged; SDL bytes identical) | same |
| schemaReleaseDigest | `sha256:c0dd7837df029695e26f00d99f482483fb715e1cbcd4c4c4b1d8e3d31d6d3b06` | `sha256:b62036de7c01be3daf9eae7e534ce0ce566070f4dcc54a3b0aca0ba1070b092f` |
| queryCatalogDigest | `sha256:84232dbf9e311c211c4d75d90cf5eb0ab9c004f56e1e679d95fe68ade7cfd50a` (templates byte-identical; only `releaseId` differs) | `sha256:16934295…` |
| ddlDigest | `sha256:3a42a440bd90f41aa9e0dcfb3c5e90d25acd102b97c8d43d13f847d8ed6377bb` | `sha256:454d6ad6…` |
| contentTreeDigest | `sha256:af448145e8879ebc257df6b0815c8f267c77bf386662f07258b89755ec743140` | `sha256:aacc4c56…` |

Release `biotech-meta/docs/schema/releases/biotech-schema-v2.0.1/`: 78 frozen files plus `release.json` (79 pinned when re-pinned). `excludedFromFrozenDigestSet` is empty.

### What changed (operational registration only; nothing added to the SDL)

- **Legacy map.** `migration/legacy-map.yaml` is S8's map, hosted verbatim (sha256 `a78218f983379eaefd25bf1ed8952b41f01af693b6d4f0ac1267b3f84568f32b`; checked by the derive script). It is now in the frozen set. Its own `target` block still says `biotech-schema-v2.0.0` and `${SCHEMA_RELEASE_DIGEST}`; S8's planner must bind to this release.json, which is the binding authority.
- **`rules/operational-names.yaml` (new, class `operational`).** Every entry is projection `excluded`, agentWrite `forbidden`, and names its writers. It lists:
  - labels `LegacyV0`, `LegacyV0_<Label>` for all 19 legacy labels (17 relabeled; `LegacyV0_Document` and `LegacyV0_BellLabsSchemaDeploymentEvidence` reserved, because legacy-map 1.0.0 keeps those two tag-only), the foreign labels `Document` and `BellLabsSchemaDeploymentEvidence`, and the `Ks*` markers;
  - relationship `MIGRATED_FROM` (class operational, with S8's edge properties);
  - properties `legacyLabels` and `legacyExportDigest`;
  - the `legacy:` qualifier family;
  - `markerShapes`.
  - The derive script fails if the relabel and tag-only lists differ from the legacy map.
- **Qualifiers.** `vocabularies/qualifiers.yaml` gains `legacy:recordedFrom=`, `legacy:extractedAt=` and `legacy:runId=`. S8's map writes `legacy:<key>=<value>`, so the separator is `=`. All three are class operational. Registered count 77 → 80.
- **Exclusions and write denial.** `rules/projection-rules.yaml` gains `operationalExclusions`. `workspace-inputs/ingestion-rules.yaml` gains a deny rule for operational names (executor policy). Both are exact insertions, verified as pure additions by re-parsing.
- **Validation params.** `validation-params.json` gains `operationalNames`, with a collision check against the SDL labels and relationship types (0 collisions).
- **Loader.** The loader exposes `ReleaseBundle.operationalNames` and the new `classifyName()` (`packages/schema-workspace/src/release.ts`). It returns `operational-label`, `operational-relationship`, `operational-property` or `operational-qualifier`, never a v2 type. The barrel `index.ts` export of `classifyName` had to be re-added after a concurrent rewrite.
- **DDL.** The existing unique `ks_intent_marker_effect_key` already covers `KsIntentMarker {effectKey: "migration:<runId>:<batchId>", planRef}`. Added:
  - required `ks_intent_marker_plan_ref` (planRef lookup for migration recovery);
  - required `legacy_v0_export_digest` (the reverse-relabel key);
  - Enterprise existence constraints on `KsReleaseMarker.releaseId`, `ddlDigest` and `installedAt`, next to the existing `schemaReleaseDigest` one;
  - `ddl.json` `markerShapes`, documenting that `KsReleaseMarker` carries releaseId, schemaReleaseDigest, ddlDigest, installedAt and migrationRunId.
  - Totals after the S3 fold-in: 572 statements (357 required, 212 enterprise, 3 optional). One v2.0.0 statement changed: the `ks_intent_marker_effect_key` uniqueness is replaced by `ks_intent_marker_key` (markerKey); see the S3 subsection below.
- **Compatibility.** `COMPATIBILITY.md` and `compatibility.json` are generated from `rules/compatibility.yaml` and listed in release.json. They contain:
  - the supported matrix (Neo4j 5.26.31 tested / 5.27-aura target, Cypher 5, APOC Core, @neo4j/graphql 7.6.3);
  - `chunk.write` **unsupported**: the live KS `:Chunk`, `Document`, `DocumentTextVersion` and `Segmentation` constraints are kept, not dropped;
  - legacy nodes present but excluded; GDS/AGA and native vectors disabled; GraphQL mutations unsupported;
  - read compatibility: same `schemaDigest` as v2.0.0 (`schemaDigestEqualToParent: true`, asserted by the generator) and a different `schemaReleaseDigest`. Readers bound to v2.0.0 keep working; writers and the migrator need an exact `schemaReleaseDigest` match with the installed `KsReleaseMarker`.
- **Tooling.**
  - New `scripts/release/derive.mjs`. It copies the parent's non-generated files forward byte for byte (58 files, digest-checked), applies the delta and has `--check`.
  - `generate.mjs` reads an optional per-release `release-source.yaml` (releaseId, version, createdAt `2026-10-11T23:45:00.000Z`, parentRelease, the SDL header id, excluded set). With `--refresh-provenance` it re-records generator digests; a frozen release keeps the provenance recorded at its creation, so v2.0.0 still regenerates byte-identically under the new tools.
  - `releaseId` is threaded through the params, DDL, catalog and report libraries (defaults unchanged).
  - `pin.mjs` now records the replaced v2 pin under `provenance.previousPin`, and `--check` compares the release binding instead of tool provenance.
- **CHANGELOG.** `biotech-meta/docs/schema/CHANGELOG.md` has a new "Unreleased → biotech-schema-v2.0.1" entry (operational registration only, no ontology change), in CRLF like the working copy.

### Commands and results

| command | result |
| --- | --- |
| `node scripts/release/derive.mjs --from …/biotech-schema-v2.0.0 --to …/biotech-schema-v2.0.1 --check` | ok, 0 drift |
| `node scripts/release/generate.mjs --release …/biotech-schema-v2.0.1 --check` (run twice) | ok, ok (0 drift, 0 problems) |
| `node scripts/release/verify.mjs --release …/biotech-schema-v2.0.1` | ok (78 files) |
| `verify.mjs` and `generate.mjs --check` on v2.0.0; `pin.mjs --release …v2.0.0 --check` | ok (v2.0.0 untouched, pin binding unchanged) |
| `loadRelease({dir: …/biotech-schema-v2.0.1})` | loads as `source: "override"`; `schema/pinned/PIN.json` bytes and mtime unchanged |
| rehearsal: `pin.mjs --release …v2.0.1 --target <scratch>` and `loadRelease({dir: <scratch>})` | ok (bks-pin.v2, 79 files, `classifyName("LegacyV0_Product") = operational-label`); scratch removed |
| `apply-ddl.mjs` v2.0.1 required DDL, fresh 5.26.31 Community (after the S3 fold-in) | 357/357, 359 indexes ONLINE (first pass, before the fold-in: 292/292) |
| same on fresh 5.26.31 Enterprise eval, then `--file ddl/enterprise.cypher` (after the fold-in) | 357/357; 212/212, ok |
| `explain-catalog.mjs` rerun | **not completed**: the Docker Desktop engine began returning HTTP 500 mid-run, so I stopped my stuck process. The 153 template statements are byte-identical to v2.0.0 (same `statementDigest`), so v2.0.0's EXPLAIN evidence (`explain.json`, byte-identical copy) still applies. Rerun the command once Docker is healthy (expected: identical bytes). |
| `yaml-parity.mjs` on the 9 new or changed YAML files | 9/9 equal |
| `packet-check.mjs --release …v2.0.1` | ok |
| `pnpm exec vitest run --project schema-workspace` | 4 files, 41 tests passed |

New test: `packages/schema-workspace/src/release-v2.0.1.test.ts`. It checks that v2.0.1 loads as an override without touching `schema/pinned`; that `schemaDigest` is the same and `schemaReleaseDigest` differs; that the legacy map is frozen; and that `LegacyV0*`, `MIGRATED_FROM`, `legacyLabels`, `legacyExportDigest` and `legacy:` classify as operational names (absent from the SDL and IR labels, excluded, denied). It also checks the workspace inputs validate against the v2.0.1 IR, and that the marker DDL and shapes are present. `release.test.ts` and `schema-workspace.test.ts` are now release-agnostic (v2.0.x), so they stay green after the re-pin. The two rendering tests in `schema-workspace.test.ts` were moved to S2's new `renderWorkspace({ release, sidecars, generatedAt })` API.

### Re-pin (one command, lead)

```text
pnpm schema:pin -- --release ../biotech-meta/docs/schema/releases/biotech-schema-v2.0.1 --pinned-at <YYYY-MM-DD>
```

Then:
- `pnpm workspace:build && pnpm workspace:verify`. The workspace-inputs digest changes because of the new deny rule.
- S6 refreshes the identity artifacts: `schemaReleaseDigest` changes, the SDL does not.
- S8 binds plan and apply to `sha256:c0dd7837df029695e26f00d99f482483fb715e1cbcd4c4c4b1d8e3d31d6d3b06` and `ddlDigest sha256:3a42a440…`.

### Notes

- `pnpm workspace:verify` currently fails on the v2.0.0 pin as well. S2's new renderer expects `bks-schema-workspace.v2`, and `workspace/` still holds the v1-format output I generated earlier. That is S2's regeneration and is unrelated to v2.0.1; I did not touch `workspace/`.
- Disposable containers `bks-neo4j-s1` (7693) and `bks-neo4j-s1-ent` (7694) were recreated. With Docker returning HTTP 500, remove them with `docker rm -f bks-neo4j-s1 bks-neo4j-s1-ent` once the engine recovers.
- Lead-owned lines (`AGENTS.md`, `.agents/skills/biotech-cypher-baseline/SKILL.md:34`, `.agents/skills/biotech-kg-ingest/SKILL.md:87`) are left for the lead as agreed.
- Evidence: `runs/release-v2/custody/s1/v2.0.1-*` (derive and generate checks, verify, DDL Community/Enterprise, YAML parity, vitest).

### S3 executor deltas folded in (lead follow-up 2, still not pinned)

Inputs: `reports/S3-native-executor.md` section 10 items 2-5; `packages/kg-ops/src/fence.ts` `operationalDdl()`.

Final identities after the fold-in:
- schemaDigest unchanged: `sha256:fe2cc50a…`.
- schemaReleaseDigest: `sha256:c0dd7837df029695e26f00d99f482483fb715e1cbcd4c4c4b1d8e3d31d6d3b06`.
- ddlDigest: `sha256:3a42a440bd90f41aa9e0dcfb3c5e90d25acd102b97c8d43d13f847d8ed6377bb`.
- contentTreeDigest: `sha256:af448145e8879ebc257df6b0815c8f267c77bf386662f07258b89755ec743140`.
- queryCatalogDigest unchanged from the first v2.0.1 staging: `sha256:84232dbf…`.

**Required DDL added or changed.** 572 statements in total: 357 required, 212 enterprise, 3 optional.
- `ks_intent_marker_key`: UNIQUE on `KsIntentMarker.markerKey`, where markerKey = `mk-<sha256(canonical{installationId, applicationId, tenantId, effectKey})>`.
- `effectKey` is kept as the index `ks_intent_marker_effect_key_lookup`.
- The v2.0.0 uniqueness `ks_intent_marker_effect_key` is no longer emitted. `ddl.json` `migrationCommands` contains `DROP CONSTRAINT ks_intent_marker_effect_key IF EXISTS` for any graph that already received v2.0.0 DDL.
- `ks_revocation_fence_id`: UNIQUE on `KsRevocationFence.id`.
- `rel_<TYPE>_uid`: a relationshipUid index for each of the 63 asserted types.
- Enterprise existence constraints: `ks_intent_marker_key_exists`, `ks_revocation_fence_generation_exists`, `ks_write_fence_lock_seq_exists`.
- The bootstrap now seeds `KsWriteFence.lockSeq = 0` and `KsRevocationFence {id: 'canonical', generation: 0}`.
- `ddl.json` `markerShapes` document `KsWriteFence` `lockSeq` / `locked`, the full `KsIntentMarker` field list, and `KsRevocationFence`.

The items S3 asked for that were already present are covered by these existing release statements:
- `Claim.propositionHash`: `claim_proposition_hash`, a uniqueness constraint since v2.0.0.
- `CaptureAttempt.subjectUid`: `capture_subject`.
- `Activity(externalRunSystem, runId)`: `activity_run` (uniqueness).
- `Identifier(scheme, issuer, value)`: `identifier_key`.

**Reconciliation.** The release DDL is the single authority. `ddl.json` `executorReconciliation` and COMPATIBILITY.md list each S3 statement.
- Adopted under the same name: `ks_write_fence_id`, `ks_revocation_fence_id`, `ks_intent_marker_key`.
- Adopted under the release naming scheme: S3 `rel_uid_<type>` becomes `rel_<TYPE>_uid`.
- Not adopted (an equivalent release statement exists):
  - `ks_release_marker_id` → `ks_release_marker_release_id`
  - `identifier_scheme_issuer_value` → `identifier_key`
  - `claim_proposition_hash` index → the same-name uniqueness constraint; S3's `CREATE INDEX` with that name conflicts, so S3 must drop it from `operationalDdl()`
  - `capture_attempt_subject` → `capture_subject`
  - `activity_run` index → the same-name uniqueness constraint
  - `uid_<lowercase label>` → `entity_uid` + `uid_<Label>`
- **S3 action:** point `kg ensure-operations` and `ensureOperationalState()` at `loadRelease().ddl.required` (plus `.enterprise` on Enterprise) and remove the duplicate list in `packages/kg-ops/src/fence.ts:28-49`.

**Operational names.**
- `KsRevocationFence` is registered in `rules/operational-names.yaml`.
- Migrator markers `migration:<runId>:<batchId>` are representable under S3's scheme as `markerKeyOf({installationId, applicationId: <migrator application id>, tenantId}, "migration:<runId>:<batchId>")`. This is stated in COMPATIBILITY.md ("Migration markers under the executor markerKey scheme") and in `markerShapes`.
- **S8 action:** the migrator must write `markerKey` on its markers. The Enterprise `ks_intent_marker_key_exists` constraint enforces it, and required uniqueness is now on `markerKey`.

**Tests.** `release.test.ts` and `release-v2.0.1.test.ts` set `vi.setConfig({ testTimeout: 60_000, hookTimeout: 60_000 })`. The regeneration test keeps 120 s and YAML parity keeps 180 s. The v2.0.1 test now asserts:
- the markerKey uniqueness and the absence of effectKey uniqueness;
- `KsRevocationFence` is registered;
- every asserted type has its `rel_<TYPE>_uid` index;
- the marker shapes are present;
- the reconciliation has 10 entries.

| command | result |
| --- | --- |
| `derive.mjs … --check`; `generate.mjs --release …v2.0.1 --check` (run twice) | ok; ok, ok |
| `verify.mjs --release …v2.0.1` | ok (78 files) |
| `verify.mjs`, `generate.mjs --check` and `pin.mjs --check` on v2.0.0 | ok (v2.0.0 immutable, pin binding unchanged; `schema/pinned` untouched) |
| `yaml-parity.mjs` on operational-names, compatibility and release-source | 3/3 equal |
| `pnpm exec vitest run --project schema-workspace` | 4 files, 41 tests passed |
| `apply-ddl.mjs` on fresh Community / Enterprise eval (Docker responsive at that moment) | 357/357 ONLINE; 357/357 + 212/212, ok |
| `explain-catalog.mjs` rerun | **not_run**: Docker became unresponsive again right after the DDL apply (Neo4j connection acquisition timed out; `docker exec` hangs). The template statements are unchanged, so the carried `explain.json` is still bound to the same statement digests. |

Final re-pin command (lead):

```text
pnpm schema:pin -- --release ../biotech-meta/docs/schema/releases/biotech-schema-v2.0.1 --pinned-at <YYYY-MM-DD>
```

The pin binds `schemaReleaseDigest` `sha256:c0dd7837…`. Then run `pnpm workspace:build && pnpm workspace:verify` with S2's renderer. S8 binds to `sha256:c0dd7837…` / `ddlDigest sha256:3a42a440…` and runs the `migrationCommands` drop on any graph that received v2.0.0 DDL.

### Gate A rows after the v2.0.1 pin (lead follow-up 3)

Pinned release `biotech-schema-v2.0.1` (`schemaReleaseDigest sha256:c0dd7837…`, `schemaDigest sha256:fe2cc50a…`). No pin change was made by S1.

The FU-07 DDL test (`release.test.ts`) now reads the operational required statements from `ddl.json` (release-agnostic) instead of literal names. It asserts:

- each operational statement is present verbatim in `required.cypher`;
- there is exactly one uniqueness constraint each on `KsWriteFence` (id), `KsReleaseMarker` (releaseId) and `KsIntentMarker` (effectKey in v2.0.0, markerKey in v2.0.1+).

| check | identity | env | command | timestamp | result | evidence |
| --- | --- | --- | --- | --- | --- | --- |
| schema-workspace tests on the v2.0.1 pin | pinned `biotech-schema-v2.0.1` | local Windows, Node 24.18.0 | `pnpm exec vitest run --project schema-workspace` | 2026-10-12 00:58Z | passed (6 files, 78/78) | `runs/release-v2/custody/s1/v2.0.1-pinned-vitest-schema-workspace.txt` |
| required DDL on fresh Community (7701) | ddlDigest `sha256:3a42a440…` | docker `neo4j:5.26-community` 5.26.31, container `bks-neo4j-s1-explain` | `node scripts/release/apply-ddl.mjs --release <copy of schema/pinned/release> --uri neo4j://localhost:7701` | 2026-10-12 01:03Z | passed (357/357; 359 indexes ONLINE) | `custody/s1/v2.0.1-pinned-ddl-required-community-7701.json` |
| catalog EXPLAIN on the pinned v2.0.1 | queryCatalogDigest `sha256:84232dbf…` | same container, required DDL applied | `node scripts/release/explain-catalog.mjs --release <copy of schema/pinned/release> --uri neo4j://localhost:7701` | 2026-10-12 01:12Z | passed (153 templates: 132 ok, 0 failed, 21 GDS skipped; `explain.json` byte-identical to the pinned evidence) | `custody/s1/v2.0.1-pinned-explain-run.json`, `custody/s1/v2.0.1-pinned-explain.json` |

Notes:

- **The run used a scratch copy of the pinned bundle,** because the script writes `explain.json` into the directory it is given. `schema/pinned` was never written, and `verify.mjs --release schema/pinned/release` still passes.
- **The first (cold) EXPLAIN run did not finish within 400 s and was killed.** A per-statement probe (30 s transaction timeout, one session per statement) found no runaway statement: the slowest plan was D9/Q-D9-02 at 15.5 s, then QP/G-0 at 3.1 s, K/CQ-AX-04 at 2.4 s and D9/Q-D9-13 at 2.1 s. The GDS projection rewrites were all under 2 s. The warm rerun recorded above completed in 8 s.
- **The cause of the cold-run stall is not isolated.** It is consistent with the two earlier stalls that I attributed to Docker. Suggested follow-ups:
  - S4 should look at Q-D9-02 planning time on the 357-index DDL.
  - `explain-catalog.mjs` should get a per-statement transaction timeout.
- **The disposable container was removed** after the run.

## v2.0.2 staging (lead follow-up 4, 2026-10-12; not pinned)

`biotech-meta/docs/schema/releases/biotech-schema-v2.0.2/` was derived from the frozen v2.0.1 by the new `scripts/release/derive-patch.mjs`. It holds 83 frozen files plus `release.json`. v2.0.0 and v2.0.1 are untouched: both still pass `verify` and `generate --check`. `schema/pinned` still holds v2.0.1 (`pin.mjs --check` against v2.0.1 is ok).

| identity | v2.0.2 | v2.0.1 (pinned) |
| --- | --- | --- |
| schemaDigest | `sha256:fe2cc50afb4a48e16a2b5c3c37378b4d00a679a06d37bf312676c45c65c6589a` (unchanged) | same |
| schemaReleaseDigest | `sha256:68863b88428fc0d713bd7fb9128f6d16e14202bad8bd837e8d4f377a9ba03b14` | `sha256:c0dd7837…` |
| ddlDigest | `sha256:943f8c2902119030cab2ce2b72be67a346aff23734e08822dc8ea17fcda1520f` | `sha256:3a42a440…` |
| queryCatalogDigest | `sha256:ebf6470c796984b4e5a088986fbfed62bf3a65d26ed8f7336d1d6c20820e887e` | `sha256:84232dbf…` |
| contentTreeDigest | `sha256:cf95f15df47e3e8951efed698219dda2cdd09492ff69da07f6ae747eea6f7972` | `sha256:af448145…` |

### Changes

**1. DDL phases.** The new source `rules/ddl-policy.yaml` (`bks-ddl-policy.v1`) drives them.
- Every statement in `ddl.json` now carries `phase`.
- **Post-migration (69 active, 1 blocked):**
  - `uid_exists_<Label>` for Biomarker, Event, LabTest, Organization, Person, Product and Study. The generator checks that this set equals the legacy-map relabel labels that are also v2 primary labels.
  - The `rel_<TYPE>_assertion_exists` family.
- **Pre-migration:** all other statements (502).
- **Generated views:** `ddl/required.pre.cypher` (357), `ddl/required.post.cypher` (0: every required statement holds with legacy rows present), `ddl/enterprise.pre.cypher` (142) and `ddl/enterprise.post.cypher` (69). The combined files are kept. `ddl.json` also gains `phases` (installer order and counts) and `exceptions`.
- **Installer order** (COMPATIBILITY.md "Installer order"): pre-migration DDL → migration (S8 manifests) → post-migration DDL → `KsReleaseMarker`.

**2. `rel_MEASURES_assertion_exists`.**
- Status `blocked-by-legacy-data`; `file: null`, `installed: false`. It is absent from every `.cypher` file.
- `compatibility.json` `ddlExceptions` records the reason (45 preserved legacy MEASURES edges without `assertionUid`; legacy data is never deleted) and what is enforced instead (the executor requires `assertionUid` on new MEASURES writes).
- Enabling condition: retirement of those edges by a later admitted migration.

**3. Vector-gated templates.**
- `release-source.yaml` `catalogCapabilityGates: {OD-44: vectors.native}`. `buildCatalog({capabilityGates})` marks `D9/Q-D9-20#vector` and `QP/P-04a` as `unsupported` with `requires: ["vectors.native"]`.
- **Supported templates: 118** (was 120). Unsupported: 33; held: 2.
- **Supported questions: unchanged at 123** (value 1: 68), because Q-D9-20, Q-K-14, Q-D9-21, Q-D10-17, Q-D11-03 and Q-D13-05 each still have another supported template.

**4. S2 wave-3 finding, carried forward.** `CardRecord` gained optional `keywords` / `bodyTokens`. No release change is needed.

### Tooling

- **New `scripts/release/derive-patch.mjs`:** a recorded per-release delta table with `--check`. Non-generated parent files are copied byte for byte with digest checks.
- **`lib/ddl.mjs`:** `policy` option for phases, exceptions and phase views.
- **`lib/catalog.mjs`:** `capabilityGates` option.
- **`generate.mjs`:** reads `rules/ddl-policy.yaml` and `catalogCapabilityGates`, renders "Installer order" and "DDL exceptions" in COMPATIBILITY.md, and lists `derive.mjs` / `derive-patch.mjs` among the generators.
- **`apply-ddl.mjs`:** accepts the phase-view files.
- **Earlier releases:** all of these are off unless the release declares them, so v2.0.0 and v2.0.1 regenerate byte-identically.

### Commands and results

| check | identity | env | command | timestamp | result | evidence |
| --- | --- | --- | --- | --- | --- | --- |
| derive reproducible | v2.0.2 from v2.0.1 | local, Node 24.18.0 | `node scripts/release/derive-patch.mjs --from …/biotech-schema-v2.0.1 --to …/biotech-schema-v2.0.2 --check` | 2026-10-12 | passed (0 drift) | `custody/s1/v2.0.2-derive-check.json` |
| deterministic generation | release `sha256:68863b88…` | same | `generate.mjs --release …v2.0.2 --check` (run twice) | 2026-10-12 | passed, passed | `custody/s1/v2.0.2-generate-check-{1,2}.json` |
| release digests | 83 files | same | `node scripts/release/verify.mjs --release …v2.0.2` | 2026-10-12 | passed | `custody/s1/v2.0.2-verify.json` |
| YAML parity / packet-check | new sources | same | `yaml-parity.mjs` (4 files); `packet-check.mjs --release …v2.0.2` | 2026-10-12 | passed (4/4; ok) | S1 session |
| schema-workspace tests | pinned v2.0.1 + staged v2.0.1/v2.0.2 | same | `pnpm exec vitest run --project schema-workspace` | 2026-10-12 | passed (8 files, 98/98, with S2's tests and the new `release-v2.0.2.test.ts`) | `custody/s1/v2.0.2-vitest-schema-workspace.txt` |
| phased DDL, Community | ddlDigest `sha256:943f8c29…` | fresh `neo4j:5.26-community` 5.26.31 via `scripts/neo4j-test.sh` (memory-capped), bolt 7701, 0 nodes | `apply-ddl.mjs --file ddl/required.pre.cypher`, then `required.post.cypher`, then `required.cypher` | `custody/s1/v2.0.2-ddl-community-timestamp.txt` | passed: pre 357/357 on the empty graph; post 0/0; combined 357/357 present, 359 indexes ONLINE | `custody/s1/v2.0.2-community-required{.pre,.post,}.json` |
| phased DDL, Enterprise eval | same | fresh `neo4j:5.26-enterprise` 5.26.31 (`BKS_NEO4J_EDITION=enterprise`), bolt 7702; one container at a time (Community removed first) | `apply-ddl.mjs` for `required.pre`, `enterprise.pre`, `required.post`, `enterprise.post`, then `required` and `enterprise` | `custody/s1/v2.0.2-ddl-enterprise-timestamp.txt` | passed: pre 357 + 142; post 0 + 69; full set 357 + 211 present, 294 constraints, 359 indexes ONLINE; `rel_MEASURES_assertion_exists` not installed | `custody/s1/v2.0.2-enterprise-*.json` |

Both containers were removed with `scripts/neo4j-test.sh down`.

**Limitations:**
- The phase run proves a fresh graph only. That post-phase constraints succeed after a real migration is S8's rehearsal evidence.
- The EXPLAIN evidence is carried forward: the statements are byte-identical, and only the two vector templates changed status.

### Re-pin (lead)

```text
pnpm schema:pin -- --release ../biotech-meta/docs/schema/releases/biotech-schema-v2.0.2 --pinned-at <YYYY-MM-DD>
```

After pinning:
- **S8:** bind to `sha256:68863b88…` and `ddlDigest sha256:943f8c29…`. Apply `required.pre` (+ `enterprise.pre`), migrate, apply `required.post` (+ `enterprise.post`), then write the marker.
- **S4 / S6:** read `requires` and the supported template count (118).
- **CHANGELOG:** has a v2.0.2 entry.

### v2.0.2 update: S4 catalog patch and question status (lead follow-up 5; supersedes the v2.0.2 identities above; still not pinned)

| identity | final v2.0.2 |
| --- | --- |
| schemaDigest | `sha256:fe2cc50afb4a48e16a2b5c3c37378b4d00a679a06d37bf312676c45c65c6589a` (unchanged) |
| schemaReleaseDigest | `sha256:5fffb593c8ca94b289b768ac0a0b02df5739cb338b7a04ec88173589708c5a42` |
| queryCatalogDigest | `sha256:6a2749032ed89c23b22de723ca0deb8d2b6132bf245da68ec8a1f4915795dbb8` |
| ddlDigest | `sha256:943f8c2902119030cab2ce2b72be67a346aff23734e08822dc8ea17fcda1520f` (unchanged by this update) |
| contentTreeDigest | `sha256:521f923851417b34bb89ac721764b294140f4a8fadf7342c05aa8de4fb169bf7` |

The release now holds 85 frozen files.

**Inputs hosted verbatim as catalog sources** (their digests are recorded in `release-source.yaml` `additionalInputs`):
- `docs/plans/.../reports/S4-catalog-patch.json` → `query-catalog/sources/s4/catalog-patch.json` (`bks-s4-catalog-patch.v1`, base v2.0.1 catalog `sha256:84232dbf…`).
- `reports/S4-question-status.json` → `query-catalog/sources/s4/question-status.json`.

**How the patch is applied.** `release-source.yaml` gains `catalogPatch` and `questionStatus`. `lib/catalog.mjs` then:
- replaces each corrected statement only when the released statement digest matches the patch's `releasedStatementDigest`, and records `patch` on the template;
- adds the 4 proposed templates;
- takes each template's `validation.resultAssertions` from S4's executed outcome;
- takes question status and `qualification` from S4's file;
- promotes Q-K-09, Q-K-11 and Q-K-12 through the proposed templates (gold assertions, S4 Enterprise integration).

**Results.**
- Questions: **54 supported / 391 held / 9 unsupported**, as S4 reported. Value 1: 34 / 119 / 1.
- Templates: 157 in total; 123 supported by EXPLAIN (118 + Q-D5-20 + 4 proposed), 33 unsupported (31 GDS + 2 vector-gated), 1 held (the QP/G-0 write shape).
- The vector-gated templates remain `unsupported` with `requires: [vectors.native]`.

**Tooling.**
- `explain-catalog.mjs` reads `release-source.yaml`, so it explains the patched statements.
- `derive-patch.mjs` copies the S4 inputs, and does not overwrite an evidence file the target already has (the EXPLAIN step owns it).
- v2.0.0 and v2.0.1 still regenerate byte-identically.

| check | identity | env | command | timestamp | result | evidence |
| --- | --- | --- | --- | --- | --- | --- |
| EXPLAIN of every v2.0.2 template, patched statements included | queryCatalogDigest `sha256:6a274903…` | fresh `neo4j:5.26-community` 5.26.31 via `scripts/neo4j-test.sh` (memory-capped), bolt 7701, required DDL applied 357/357 (359 ONLINE) | `node scripts/release/explain-catalog.mjs --release …/biotech-schema-v2.0.2 --uri neo4j://localhost:7701` | `custody/s1/v2.0.2-explain-timestamp.txt` | passed: 157 templates, 136 ok, 0 failed, 21 GDS skipped. All 8 corrected and 4 proposed statements are ok with no AllNodesScan, and no template in the catalog plans an AllNodesScan. | `custody/s1/v2.0.2-explain-run.json`, `custody/s1/v2.0.2-explain.json` |
| reproducibility | release `sha256:5fffb593…` | local, Node 24.18.0 | `derive-patch.mjs --check`; `generate.mjs --check` (run twice); `verify.mjs` | 2026-10-12 | passed (0 drift; ok, ok; 85 files) | `custody/s1/v2.0.2b-derive-check.json`, `v2.0.2b-generate-check-{1,2}.json`, `v2.0.2b-verify.json` |
| schema-workspace tests | pinned v2.0.1 + staged releases | same | `pnpm exec vitest run --project schema-workspace` | 2026-10-12 | passed (8 files, 102/102). The new v2.0.2 test checks patch digests, EXPLAIN without AllNodesScan, and 54/391/9. | `custody/s1/v2.0.2b-vitest-schema-workspace.txt` |

The container was removed after the run. `schema/pinned` is untouched (v2.0.1; `pin.mjs --check` ok). The CHANGELOG v2.0.2 entry carries the final digests and the catalog line.

**Re-pin (lead):**

```text
pnpm schema:pin -- --release ../biotech-meta/docs/schema/releases/biotech-schema-v2.0.2 --pinned-at <YYYY-MM-DD>
```

S8 binds to `sha256:5fffb593…` with `ddlDigest sha256:943f8c29…`. S4 and S7 publish `queryCatalogDigest sha256:6a274903…`.

### Review fix: EXPLAIN output never written into a release (lead follow-up 6, 2026-10-12)

- **`scripts/release/explain-catalog.mjs` writes only to `--out`.** The default is `runs/release-v2/custody/s1/explain-<releaseId>.json`. It refuses (exit 2, before connecting to Neo4j) any target inside `schema/pinned/**` or under any directory that holds a `release.json` or `PIN.json`. Checked against `schema/pinned/release/query-catalog/explain.json`, `schema/pinned/x.json`, `…/biotech-schema-v2.0.2/query-catalog/explain.json` and `…/biotech-schema-v2.0.0/foo/bar.json`: all four were refused.
- **A release's own evidence changes only through `generate.mjs`.** The new `node scripts/release/generate.mjs --release <dir> --explain-from <file>` adopts a `bks-query-explain.v1` result as `query-catalog/explain.json` while a release is staged. It is refused together with `--check`.
- **Existing releases are unchanged.** The provenance recorded at creation is kept, so `generate.mjs --check` still passes for v2.0.0, v2.0.1 and v2.0.2. The pin (v2.0.2, already re-pinned by the lead) passes `pin.mjs --check` and `verify.mjs`.
- **File-count wording for VALIDATION.** `verify.mjs` reports the frozen files listed in `release.json` `files`. That count excludes `release.json` itself and any `excludedFromFrozenDigestSet` entry. `pin.mjs` and `PIN.json` `files` count every pinned file, including `release.json` and excluded entries.

  | release | verify | pin |
  | --- | --- | --- |
  | v2.0.2 | 85 | 86 (85 + release.json) |
  | v2.0.1 | 78 | 79 (78 + release.json) |
  | v2.0.0 | 72 | 74 (72 + release.json + the excluded legacy-map placeholder) |

- **Tests.** `pnpm exec vitest run --project schema-workspace` → see `runs/release-v2/custody/s1/explain-out-vitest-schema-workspace.txt`.
