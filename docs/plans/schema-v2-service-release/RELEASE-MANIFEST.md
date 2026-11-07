# Release manifest (lead-owned; final values filled at S9)

Status: **v2 live since 2026-10-12T17:30Z** (migration applied 17:15Z; executor deployed 17:26Z; GraphQL switched 17:30Z; read, ingestion/recovery and consumer proofs passed). Soak: 2.5 of 30 minutes recorded with 0 errors before the lead host ran out of memory; the full soak and the post-soak secret hygiene remain to be run (user go required). Sanitized attestation below; secrets, receipts and raw exports stay in `runs/release-v2/custody/`. Identities below are the current candidate; any marked `pending` is filled only from measured evidence. Nothing here attests deployment until the S9 section is completed with Fly release ids and the live `/readyz` capture.

## Candidate identities

| Component | Identity | Source |
| --- | --- | --- |
| Upstream release | `biotech-schema-v2.0.2` (pinned 2026-10-12; v2.0.0 and v2.0.1 immutable) | `biotech-meta/docs/schema/releases/` (uncommitted; content-tree digests in PIN) |
| schemaDigest | `sha256:fe2cc50afb4a48e16a2b5c3c37378b4d00a679a06d37bf312676c45c65c6589a` (identical across v2.0.0–v2.0.2) | release.json |
| schemaReleaseDigest | `sha256:5fffb593c8ca94b289b768ac0a0b02df5739cb338b7a04ec88173589708c5a42` | release.json |
| ddlDigest | `sha256:943f8c2902119030cab2ce2b72be67a346aff23734e08822dc8ea17fcda1520f` (phases pre/post; `rel_MEASURES_assertion_exists` blocked-by-legacy-data) | ddl.json |
| queryCatalogDigest | `sha256:6a2749032ed89c23b22de723ca0deb8d2b6132bf245da68ec8a1f4915795dbb8` (157 templates: 123 EXPLAIN-supported, 33 unsupported, 1 held; questions 54/391/9) | catalog.json |
| workspaceFingerprint | `sha256:a33cc35acfaec701549c2f84635d4cb0796d03ebc9f90d0633e4a8e14b11c941` (1,341 files, renderer 2.0.0) | `workspace/manifest.json` |
| semantic generation | `g20261012T041326Z-6e991373` (compatible; identity in attributes; lexical default, semantic on demand) | custody `runs/release-v2/custody/semantic/current.json` |
| productProjectionDigest / executableGraphqlDigest / operationRegistryDigest | `sha256:2c4581da...` / `sha256:a6ff3889...` (622,819 B) / `sha256:fbf5f95959eea9cee026a90cbf165a84cb674ba48b28d07b458689263a9dc94b` (9 operations; ResolveIdentifier list form) | `apps/graphql-api/{projection,operations}` |
| GraphQL image (local build) | `bks-graphql-api:s6-v2.0.2` `sha256:a4c19b08...` (524 MB); BFF image `bks-bff:v2.0.2` `43beb15e331f` (452 MB) | docker |
| capability descriptor / lane mount | `sha256:9805649ff5fcb155acdc075c2743d93909030eaef16a765b423aeb8340222357` / `sha256:a4f0f2620be3b9a64615455dbd084a6adf93d9258f483a67ea4869dc07e962e4` (final: regenerated 2026-10-12 13:05 local after the WR-19 fix, graph-analyze probe fix and kg-query retry note; routing `sha256:13dc3fdb...`) | `apps/executor/{capabilities,lanes}` |
| executor image | local `bks-executor:v2.0.2` (`36aa4bda6048`, 609 MB); Fly registry `registry.fly.io/bks-biotech-executor:v2-0-2-rc1@sha256:b4b27f8a573f82fef628d23753aa0c3d76fa875d132a00d56e1534add9bf23fc` (remote build 2026-10-12T17:0xZ, not deployed) | `apps/executor/Dockerfile` |
| GraphQL image (Fly registry) | `registry.fly.io/bks-biotech-graphql-api:v2-0-2-rc1@sha256:0767bbc486bd2f4c0f9962efb4a3fc03a96ec8dc1a37239d220bb9f9114ceebf` (remote build 2026-10-12T17:08Z, not deployed) | `apps/graphql-api/Dockerfile` |
| executorVersion | `bks-kg-ops/2.0.0` | `packages/kg-ops` |
| contracts | intent/plan/apply/receipt v2, witness v1, canonical JSON v2, read intent v2, cypher read v1, read result v2, envelope `mc.knowledge_request.v1` | `packages/contracts/json-schema/` |
| skill bundle | `skill-routing.json` (`bks-skill-routing.v1`), first-party skills schema-explore v2, kg-query v2, kg-ingest v2 (10 executable examples), graph-ops, graph-analyze (probe reads the pin), graphql-maintain 1.0.0 (engineering lane; routing check 0 problems, 0 pending) | `.agents/skills/` |
| source snapshot | BKS `431c8a7` + uncommitted working tree, content digest `sha256:65e8ba5a76c4e35f66900bb156e16bdeb40d8b3a579d44b68a32024ef52812ca` (3,550 files, rule in `custody/s9/source-snapshot.json`, computed 2026-10-12T17:38Z after the WR-19 fix and skill edits; the Fly images were built from this tree at 17:0x-17:08Z before the `biotech-graphql-maintain` skill and the kg-query note, which are not in the images); biotech-meta `638aef5` + uncommitted releases | Git + custody |
| source commit | BKS `main` `acb9424` on `github.com/Overton77/biotech-knowledge-services` (first push, 2026-10-12; eight slices `0d1574c..acb9424` over `431c8a7`), tag `v2.0.2-cutover` on the commit that adds this row. The committed tree is the `65e8ba5a` snapshot plus release-doc edits made after 17:38Z (`HANDOFF.md` added; `STATUS`, `VALIDATION`, `CUTOVER`, this manifest, `docs/deployment/executor.md` updated), so it rehashes to `sha256:c3dc83c7...` under the same rule; Git normalizes CRLF sources to LF (`.gitattributes`). No code, pin or workspace file changed after the `65e8ba5a` snapshot (file mtimes). | Git |
| installed graph release marker | **written 2026-10-12T17:15:11Z** by migration `mig-575f91e942e3`: releaseId `biotech-schema-v2.0.2`, schemaReleaseDigest `sha256:5fffb593...`, ddlDigest `sha256:943f8c29...`, legacyExportDigest `sha256:e625fcdd...`, manifest `sha256:322d5807...` | `KsReleaseMarker` on Aura `8032ec07` |

## Deployed components (S9, pending)

| Component | Endpoint | Image / release | Readiness capture |
| --- | --- | --- | --- |
| GraphQL API | `https://bks-biotech-graphql-api.fly.dev` | `registry.fly.io/bks-biotech-graphql-api:v2-0-2-rc1@sha256:0767bbc486bd2f4c0f9962efb4a3fc03a96ec8dc1a37239d220bb9f9114ceebf`, Fly release v4 (canary, 2026-10-12T17:30Z), machine `8dd714ce9d7228` | `/readyz` ready at 17:31Z (release marker v2.0.2 accepted; 426 indexes checked); `/identity` executable `a6ff3889`, registry `fbf5f959` |
| Executor | `https://bks-biotech-executor.fly.dev` | `registry.fly.io/bks-biotech-executor:v2-0-2-rc1@sha256:b4b27f8a573f82fef628d23753aa0c3d76fa875d132a00d56e1534add9bf23fc`, machine `8140eeb9de0348` (iad), release v1, deployed 2026-10-12T17:26Z | `/readyz` 200 at 17:27Z: database, writer-fence, release-marker, writer-ddl ok; releaseId `biotech-schema-v2.0.2` |
| Reference BFF | not deployed (no consumer app exists; recorded limitation) | image `bks-bff:v2.0.2` local only | n/a |

## Attestation (lead, 2026-10-12T17:45Z)

| Item | Value |
| --- | --- |
| Graph | Aura `8032ec07` db `neo4j`: release `biotech-schema-v2.0.2` installed by `mig-575f91e942e3` at 17:15:11Z; 210 legacy nodes / 288 relationships preserved under `LegacyV0_*` + `MIGRATED_FROM`; 545 v2 nodes / 1,590 v2 relationships created by the migration; 568/568 active DDL statements ONLINE (`rel_MEASURES_assertion_exists` deliberately absent); 59/59 invariants; 65 markers |
| Migration accounting | nodes 210 = 176 migrated + 26 retained + 8 held; relationships 288 = 178 + 27 + 83 held; reconciles with export `sha256:e625fcdd...`; 0 deletions |
| Executor | `https://bks-biotech-executor.fly.dev`, image `@sha256:b4b27f8a...`, ready; writer `bks_writer_svc`; cutover proof receipt `rc-a4950851f3d750c82d0319b537c3cf66` (8 nodes / 15 rels synthetic) |
| GraphQL API | `https://bks-biotech-graphql-api.fly.dev`, Fly release v4, image `@sha256:0767bbc4...`, ready; reader `bks_reader_public_svc`; EntityCard of a migrated organization returns data; rollback = release v3 |
| Principals | 4 Aura service users on Aura roles (Professional tier); write refusal of readers proven; passwords only in custody |
| Identities | schemaReleaseDigest `5fffb593`, ddlDigest `943f8c29`, queryCatalogDigest `6a274903`, workspace `a33cc35a`, executable GraphQL `a6ff3889`, operation registry `fbf5f959`, capability descriptor `9805649f`, lane mount `a4f0f262`, semantic generation `g20261012T041326Z-6e991373`, source snapshot `65e8ba5a` |
| Not deployed | reference BFF (no consumer app); admission service (lead-operated from custody until Mission Control hosts grants); Supabase custody (bucket absent) |
| Open after cutover | full 30-minute soak + post-soak secret hygiene (user go); v2.0.3 deltas below; carried findings in `INDEPENDENT-REVIEW.md` |

## Explicitly disabled / unsupported capabilities

GraphQL mutations; product vector search; native data vectors (OD-44 profile recorded, index not created); AGA/GDS analytics (installed on Aura, not admitted); v2 `Chunk` writes (live Knowledge Services constraints retained); `rel_MEASURES_assertion_exists` (blocked by preserved legacy edges; executor-enforced on new writes); Supabase `knowledge-artifacts` custody (bucket absent; file custody in use); MONDO expansion artifact; ad hoc Cypher reads in production (bindings run `session-routing`/`application`; templates/typed reads only); database-level procedure deny lists for reader principals (Aura Professional has no `ROLE MANAGEMENT`; service users are bound to Aura's `graphql_app_read_only/read_write_8032ec07` roles and `architect`, see CUTOVER.md); `database-rbac` visibility.

## Known deltas to carry into the next patch release (v2.0.3, post-cutover)

- Question status: CQ-MF-01 and Q-D8-13 pass executed assertions on the v2.0.2 fixture graph (56/389/9) but are hosted as held (54/391/9); promote in v2.0.3.

## Known evidence gaps (carried)

OD-35 review set short by 6 retelling and 6 ambiguous-authority claims; 391 catalog questions held (fixtures do not exercise them); S6 performance acceptance not yet measured on an idle host; skill end-to-end evaluations not yet run.
