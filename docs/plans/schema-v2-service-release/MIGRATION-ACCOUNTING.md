# Migration accounting (S8, Gate F rehearsal of record: v2.0.2)

Sanitized: aggregate counts only; no production record values. Per-record accounting (`accounting-records.jsonl`), uid
map and batches are in protected custody under the plan directory below.

## Identities (wave 3, v2.0.1; the record of the run is the v2.0.2 section below)

| Item | Value |
| --- | --- |
| Export | `runs/release-v2/custody/backups/20261011T224403Z-aura-neo4j/`, `exportDigest sha256:7f76eefcf7b50977d78efc7d761e00a4622f7e45d4afa97d11c8d0a84a385ba1` (Neo4j 5.27-aura enterprise, database `neo4j`, READ sessions only) |
| Release | `biotech-schema-v2.0.1`, `schemaReleaseDigest sha256:c0dd7837df029695e26f00d99f482483fb715e1cbcd4c4c4b1d8e3d31d6d3b06`, `ddlDigest sha256:3a42a440bd90f41aa9e0dcfb3c5e90d25acd102b97c8d43d13f847d8ed6377bb`; bound through `loadRelease()` at plan time and checked again at apply time (never a literal) |
| Map | release-hosted `migration/legacy-map.yaml` v1.0.0, `sha256:a78218f983379eaefd25bf1ed8952b41f01af693b6d4f0ac1267b3f84568f32b` (byte-identical to the S8-authored source; manifest `mapBoundToRelease: true`) |
| Plan | migration run `mig-a3df353c3d73` (planner 0.2.0; run id = hash of export, map, release digest and planner version), manifest `sha256:e9fb67ca4f7013d307cda1f3af9dca8d5cd14fd0a2f53f68049d339abf069f1c`, 65 batches, 59 invariants |
| New identities vs wave 1 | Activity uids follow S3 `activityUidFor` (8-hex suffix); the Source uid follows S3 `sourceUidFor(canonicalizeUri(...))`; every created node also carries `id` and `privacyClass` (PUBLIC for domain nodes and assertions; INTERNAL for Agent, Activity, Source, SourceSnapshot, SourceLocator) |
| Superseded | wave-1 plan `mig-eee5e7a518c3` (`sha256:4956d530...`, release unbound). A first v2.0.1 re-plan reused that run id and overwrote its plan files in custody; the wave-1 dry-run reports remain under `plans/mig-eee5e7a518c3/runs/`. The run id now includes the release digest, so this cannot recur |

## Totals (reconcile to the export)

| | Input | migrated | unchanged-retained | held | excluded |
| --- | ---: | ---: | ---: | ---: | ---: |
| Nodes | 210 | 176 | 26 | 8 | 0 |
| Relationships | 288 | 178 | 27 | 83 | 0 |

Every input element is classified exactly once; `validate-plan.mjs` re-reconciles the 498 records to the export counts
(13/13 checks). `excluded` applies to properties only.

## Nodes by legacy label

| Legacy label | n | migrated | retained | held | v2 target / reason |
| --- | ---: | ---: | ---: | ---: | --- |
| Biomarker | 41 | 41 | | | Metric (ALGORITHM_OUTPUT, VENDOR); QUANTIFIES -> curated Biomarker held |
| Person | 36 | 36 | | | Person (public basis from migrated role edges) |
| CompoundForm | 26 | 26 | | | IngredientMaterial (materialKind UNRESOLVED) |
| Product | 23 | 23 | | | Product (productKind by explicit map) |
| Compound | 19 | 19 | | | ChemicalSubstance (provisional identity) |
| Listing | 10 | 10 | | | MerchantListing (exact identity hostDomain + hostItemId) |
| ProductSnapshot | 10 | | 10 | | state cache identical to parent; no label content (OD-43 rationale) |
| ListingSnapshot | 10 | | 10 | | state cache identical to parent |
| TechnologyPlatform | 7 | 6 | | 1 | AlgorithmVersion (versionBasis UNKNOWN); the assay platform is held (AssayVersion needs one performing lab) |
| RegulatoryStatus | 6 | 1 | | 5 | LegalStatus for FDA_APPROVED; LDT_CLIA_CAP_NOT_FDA_CLEARED_OR_APPROVED held (regulatory interpretation) |
| LabTest | 4 | 4 | | | LabTest (ALGORITHM_REPORT) |
| PanelDefinition | 4 | 4 | | | LabTest (PANEL) |
| Organization | 3 | 3 | | | Organization (provisional identity) |
| Event | 3 | 1 | | 2 | Event for COMPLETED; ANNOUNCED held (not a v2 EventStatus) |
| Study | 2 | 2 | | | Publication (DOI identifier, exact identity) |
| Document | 2 | | 2 | | Knowledge Services document lane (tag only) |
| PhysicalLocation | 2 | | 2 | | no v2 type |
| OrganizationSnapshot | 1 | | 1 | | state cache identical to parent |
| BellLabsSchemaDeploymentEvidence | 1 | | 1 | | operational (tag only) |

## Relationships by legacy triple

| Triple | n | migrated | retained | held | v2 / reason |
| --- | ---: | ---: | ---: | ---: | --- |
| (LabTest)-[:MEASURES]->(Biomarker) | 45 | 45 | | | MEASURES_METRIC |
| (PanelDefinition)-[:INCLUDES_BIOMARKER]->(Biomarker) | 38 | 38 | | | MEASURES_METRIC |
| (Product)-[:CONTAINS_COMPOUND_FORM]->(CompoundForm) | 27 | | | 27 | needs LabelVersion DECLARES_COMPONENT (OD-43) |
| (Person)-[:ADVISES]->(Organization) | 18 | 18 | | | HOLDS_ROLE ADVISOR |
| (Organization)-[:EMPLOYS]->(Person) | 15 | 15 | | | HOLDS_ROLE (reversed; explicit role map) |
| (Organization)-[:OFFERS]->(Product) | 14 | 13 | | 1 | DISTRIBUTES predicate when roleType DISTRIBUTOR; 1 without roleType held |
| (Product)-[:IMPLEMENTS]->(TechnologyPlatform) | 14 | | | 14 | no v2 relationship |
| (Organization)-[:LISTS]->(Listing) | 10 | 10 | | | HOSTED_BY predicate (host domain = organization website) |
| (Listing)-[:LISTS_PRODUCT]->(Product) | 10 | | | 10 | OD-43: single evidenced Package required |
| (LabTest)-[:USES_PLATFORM]->(TechnologyPlatform) | 10 | 7 | | 3 | PERFORMED_WITH_VERSION; 3 held with the assay platform |
| (Listing)-[:HAS_SNAPSHOT]->(ListingSnapshot) | 10 | | 10 | | snapshots retained |
| (Product)-[:HAS_SNAPSHOT]->(ProductSnapshot) | 10 | | 10 | | snapshots retained |
| (Product)-[:IMPLEMENTS_PANEL]->(PanelDefinition) | 8 | 8 | | | DELIVERS |
| (Organization)-[:DEVELOPS_PLATFORM]->(TechnologyPlatform) | 7 | | | 7 | no v2 relationship (identity input of AlgorithmVersion) |
| (Organization)-[:USES_PLATFORM]->(TechnologyPlatform) | 7 | | | 7 | no v2 relationship |
| (Product)-[:DELIVERS_LABTEST]->(LabTest) | 7 | 7 | | | DELIVERS |
| (Product)-[:HAS_REGULATORY_STATUS]->(RegulatoryStatus) | 6 | 1 | | 5 | STATUS_OF; 5 held with their status |
| (Study)-[:INVESTIGATED_BY]->(Person) | 5 | 5 | | | AUTHORED_BY predicate |
| (Organization)-[:FOUNDED_BY]->(Person) | 4 | 4 | | | HOLDS_ROLE FOUNDER |
| (PanelDefinition)-[:INCLUDES_LABTEST]->(LabTest) | 4 | 4 | | | INCLUDES_TEST |
| (Event)-[:ABOUT]->(Organization) | 3 | 1 | | 2 | EVENT_ABOUT; 2 held with their events |
| (Event)-[:REPORTED_IN]->(Document) | 3 | | | 3 | evidence pointer without captured bytes |
| (Document)-[:ABOUT]->(Organization) | 2 | | 2 | | document lane |
| (Document)-[:AUTHORED_BY]->(Organization) | 2 | | 2 | | document lane |
| (Organization)-[:HAS_CEO]->(Person) | 2 | 2 | | | HOLDS_ROLE EXECUTIVE_OFFICER |
| (Organization)-[:HAS_LOCATION]->(PhysicalLocation) | 2 | | 2 | | no v2 type |
| (Study)-[:HAS_PRIMARY_SOURCE]->(Document) | 2 | | | 2 | ambiguous citation semantics |
| (Study)-[:SPONSORED_BY]->(Organization) | 2 | | | 2 | sponsor vs affiliation ambiguous |
| (Organization)-[:HAS_SNAPSHOT]->(OrganizationSnapshot) | 1 | | 1 | | snapshot retained |

Held reasons: nodes CONDITION_UNMET 8; relationships MAP_QUARANTINE 72, ENDPOINT_HELD 10, CONDITION_UNMET 1. Identity
candidates (same v2 identity tuple, never merged): 0. uid collisions: 0.

## Properties

443 (label or triple).property entries, 4,003 property values: migrate 1,241; retain-legacy 1,568; exclude 184
(regenerable `searchText`/`searchFields`); quarantine 51 (held inputs: listing price, currency and terms, dosage form,
compound-form dose/unit, platform usage context); retained-with-node 486; held-with-node 64; retained-with-relationship
35; held-with-relationship 374. Every live property key of a migrated label/triple is listed in the map (planner coverage
gate); `searchEmbedding` stays legacy only (OD-44).

## v2 elements the plan creates

| Kind | Count |
| --- | --- |
| Domain nodes | 176: Metric 41, Person 36, IngredientMaterial 26, Product 23, ChemicalSubstance 19, MerchantListing 10, LabTest 8, AlgorithmVersion 6, Organization 3, Publication 2, Event 1, LegalStatus 1 |
| Provenance | Agent 1 (legacy-import), Activity 4 (migration + 3 legacy research runs), Source 1 (DATASET), SourceSnapshot 1, SourceLocator 180, Identifier 2 (DOI) |
| Assertions | 180, all `EXTRACTED`, `basisKind UNSTATED`: MEASURES_METRIC 83, HOLDS_ROLE 39, DELIVERS 15, DISTRIBUTES 13, HOSTED_BY 10, PERFORMED_WITH_VERSION 7, AUTHORED_BY 5, INCLUDES_TEST 4, HAS_IDENTIFIER 2, EVENT_ABOUT 1, STATUS_OF 1 |
| Domain relationships | MEASURES_METRIC 83, HOLDS_ROLE 39, DELIVERS 15, PERFORMED_WITH_VERSION 7, INCLUDES_TEST 4, HAS_IDENTIFIER 2, STATUS_OF 1 (each backed by an Assertion uid) |
| Lineage | MIGRATED_FROM 176; legacy nodes relabeled 207 (`LegacyV0_<Label>`), tagged 3 (Document, deployment evidence) |

Held resolution work recorded by the plan: Metric QUANTIFIES -> curated Biomarker (41); Product BRANDED_AS (23) and
variant/package/label chain (23); IngredientMaterial REALIZES_SUBSTANCE (26); ChemicalSubstance identifier resolution
(19); MerchantListing Offer/price (10) and LISTING_FOR Package (10).

## Final rehearsal of record (release biotech-schema-v2.0.2, 2026-10-12)

| Item | Value |
| --- | --- |
| Release | `biotech-schema-v2.0.2`, `schemaReleaseDigest sha256:5fffb593c8ca94b289b768ac0a0b02df5739cb338b7a04ec88173589708c5a42`, `ddlDigest sha256:943f8c2902119030cab2ce2b72be67a346aff23734e08822dc8ea17fcda1520f`, `queryCatalogDigest sha256:6a2749032ed89c23b22de723ca0deb8d2b6132bf245da68ec8a1f4915795dbb8` (bound through `loadRelease()` at plan and apply time) |
| Plan | migration run `mig-0b2e97d4b8e0`, manifest `sha256:c3036eb09926f96acdbbe5d89b1ccbfddf7d838f368032a6fe9ba4182f88cb76` (file sha256 `8cc863ef...`), 65 batches, 59 invariants; map `sha256:a78218f9...` bound to the release; `validate-plan.mjs` 13/13 |
| Accounting (final) | nodes 210 = 176 migrated + 26 unchanged-retained + 8 held + 0 excluded; relationships 288 = 178 + 27 + 83 + 0; reconciles to the export |

| Shadow (fresh, script-created, one at a time) | Restore + verify | Pre-migration DDL | Apply | Post-migration DDL | Invariants | Release marker | S4 assertion replay (123 supported templates) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Community 5.26.31 `bks-neo4j-s8` (03:53-03:59Z) | 210/288, 17/17 | 357/357 ONLINE + both fences | 65/65 batches, 545 nodes / 1,590 rels created, 0 deleted, 65 markers (one attempt each), graphRevision 65 | none for Community | 59/59 | written last: releaseId, schemaReleaseDigest, ddlDigest, installedAt, migrationRunId (+ legacyExportDigest, manifest digest) | 20 fixture-positive (columns match), 103 contract-only, 0 failed |
| Enterprise 5.26.31 eval `bks-neo4j-s8-ee` (04:01-04:07Z) | 210/288, 17/17, 0 gaps | 499/499 ONLINE (357 required + 142 enterprise pre) | same as Community | 69/69 created; `rel_MEASURES_assertion_exists` skipped (release status blocked-by-legacy-data, verified not installed); 568/568 active statements ONLINE | 59/59 | written last | 20 fixture-positive, 103 contract-only, 0 failed |

Templates that return rows on the migrated data (both editions): 20, spread over K, D6, D7, D8, D9, D10, D11 and query patterns. The 103 contract-only templates execute with correct columns and an absent-binding answer, but the migrated legacy subset holds no matching facts. This is expected for a legacy graph of 210 nodes, and none fails. The crash/restart, rollback and re-apply proofs were made on v2.0.1 with byte-identical batch logic (wave 3 above); the v2.0.2 run differs only in DDL phasing and release identities.

## Production procedure (phase order)

1. **Freeze.** Stop every canonical writer. Confirm no in-flight effects; the fence is idle.
2. **Final export.** `node scripts/migration/export-graph.mjs` (READ only), then `verify-restore.mjs --export <dir> --export-only`. Compare with the rehearsal export; any delta means re-plan.
3. **Re-plan.** `plan-migration.mjs --export <final export>`, bound to the pinned release, then `validate-plan.mjs`. Record the run id and manifest digest.
4. **Pre-migration DDL.** `bks kg ensure-operations --phase pre` (executor, production installer) or `scripts/migration/apply-release-ddl.mjs --phase pre`. This installs `required.pre` (+ `enterprise.pre` on Enterprise) and bootstraps both fences. Verify with `--phase verify --phases pre`: every statement ONLINE.
5. **Migration.** `apply-migration.mjs --mode apply` with `BKS_MIGRATION_APPLY_AUTHORIZED=<runId>` under the operator override for the production host. One fenced transaction per batch; restart is safe (markers).
6. **Post-migration DDL.** Runs inside the apply after the batches, or `kg ensure-operations --phase post`. It installs `enterprise.post` (69 statements: the `uid_exists_*` on the reused labels and the `rel_*_assertion_exists` family) and skips release-blocked statements (`rel_MEASURES_assertion_exists`).
7. **Checks.** All 59 manifest invariants; DDL verify for pre + post; `migration-state.mjs` (65 markers applied).
8. **KsReleaseMarker last.** Written by the apply under the fence after the checks pass.
9. **Replay.** `replay-catalog-s4.mjs` (S4 runner, assertions) against the migrated graph; then executor and GraphQL readiness against the marker.
10. **Rollback before any v2 write.** `rollback-migration.mjs --drop-release-ddl` (rehearsed); after v2 writes, forward repair only.

## Rehearsal results (wave 3: real apply on shadow graphs, release v2.0.1)

Both shadows were fresh restores of the custody export (verify 17/17 each), then `apply-release-ddl.mjs --phase required` (357/357 required rules created and ONLINE, both fences bootstrapped), then `apply-migration.mjs --mode apply`: one transaction per batch under the KsWriteFence (lock via `lockSeq`, `graphRevision` +1 per committed batch) and a `KsIntentMarker` checkpoint per batch with `markerKey = markerKeyOf({belllabs-biotech, bks-migrator, biotech}, migration:<runId>:<batchId>)` (S3 function), persisted status `applied` only.

| Shadow | Step | UTC (2026-10-12) | Result |
| --- | --- | --- | --- |
| Community 5.26 (`bks-neo4j-s8`, 7702) | apply with `--crash-in-batch b025-assertions` | 03:03:00-03:03:20 | process killed inside b025 before commit (exit 137); state: 25 markers applied, graphRevision 25, b025 rolled back by the server |
| | restart (same plan) | 03:03:52-03:04:12 | 25 batches skipped by marker, 40 executed starting at b025; invariant `legacy.untagged` failed because the plan predated the fence-aware invariant set; re-planned (batches byte-identical, same run id) |
| | checks rerun | 03:05:01-03:05:07 | 65/65 batches skipped (idempotent), 59/59 invariants, required DDL 357/357 ONLINE, `KsReleaseMarker` written last |
| | rollback (reverse mapping) | 03:05:25-03:05:43 | removed this run only: 545 v2 nodes, 1,590 v2 relationships, 65 markers, 1 release marker, 357 release rules, 2 fences; 210 legacy labels restored; verify-restore 17/17 with reconstructed digests equal to the export |
| | re-apply | 03:05:54-03:06:25 | 357 rules re-created; 65/65 batches executed; 59/59 invariants; release marker |
| | catalog replay | 03:08:08 | 120 supported templates: 118 EXPLAIN + execute without error, 2 skipped (vector templates need the optional `chunk_embedding` index, OD-44), 8 return rows |
| Enterprise 5.26 eval (`bks-neo4j-s8-ee`, 7703, fresh container) | apply with crash in b025 | 03:11:30-03:11:54 | killed in b025; 25 applied, graphRevision 25 |
| | restart | 03:11:59-03:12:28 | 25 skipped, 40 executed; Enterprise DDL after the batches: 211 created, 1 `blocked-by-legacy-data`; verify 568/569 present plus 1 accepted block, all ONLINE; 59/59 invariants; release marker last |
| | catalog replay | 03:12:38 | same as Community (118 ok, 2 skipped, 8 with rows) |

An earlier Enterprise attempt (02:56-03:00, old container) died with the Docker engine hang (environmental, superseded; report kept).

Counters per completed run: 545 nodes and 1,590 relationships created; 207 labels removed (relabel); nodesDeleted 0 and relationshipsDeleted 0 in every apply. Final state per shadow: 545 uid nodes, 210 legacy nodes (207 relabeled, 3 tagged), 288 legacy relationships, 65 applied markers (one attempt each), fence graphRevision 65.

Graph invariants (all 59 pass on both shadows):
- v2 counts per label and relationship type.
- Every asserted edge is backed by an Assertion uid whose predicate equals the edge type, both per run and graph-wide over all 106 asserted types (edges with a legacy endpoint excluded).
- Every run Assertion has CONTEXT/DECLARED evidence, an asserter, status EXTRACTED, and exactly one subject and one object.
- No orphan evidence: every locator is anchored to a snapshot, every snapshot to a source, every run locator is cited, and HAS_EVIDENCE targets only locators.
- uid and Identifier (scheme, issuer, value) are unique graph-wide.
- No contradictory active exclusive episodes for any exclusive slot in the release (HAS_EDITION, HAS_LABEL_VERSION, HAS_REGISTRATION_VERSION).
- Legacy data: nodes and relationships retained (210 / 288), 207 relabeled and 3 tag-only, no legacy node carrying a v2 label, none untagged.
- No v2 vectors (OD-44); exactly one release marker for the run.

**Enterprise DDL finding (needs an S1 + lead decision):** `rel_MEASURES_assertion_exists` (MEASURES must carry assertionUid) cannot be installed while the 45 legacy `(LabTest)-[:MEASURES]->(Biomarker)` edges are preserved: a relationship type can only change by deleting the edge, and legacy data is never deleted. The other 7 conflicting constraints (`uid_exists_` on Biomarker, Event, LabTest, Organization, Person, Product, Study) succeed after relabeling, which is why the Enterprise phase runs after the migration batches. Options: S1 marks this one constraint `blocked-by-legacy-data` in `ddl.json`, with the executor enforcing assertionUid on v2 MEASURES writes; or the owner accepts retyping the 45 legacy edges (a delete). The rehearsal used the first.

## Production rollback procedure (rehearsed on the Community shadow)

Before any v2 write (fence `lastWriterRunId` is the migration run and there are no foreign markers):
1. Freeze all canonical writers. Confirm there is no `KsIntentMarker` with another `planRef` and no v2 node of another run adjacent to run nodes; `rollback-migration.mjs` refuses otherwise.
2. Run `node scripts/migration/rollback-migration.mjs --plan <planDir> --export <exportDir> --drop-release-ddl [--remove-fences]`. It archives the run's markers and release marker to custody, drops the release rules the export did not have, then in one fenced transaction DETACH DELETEs only nodes with `lastWriterRunId = <run>`, deletes the run's markers and release marker, and reverses every relabel and tag. Fences are removed only when the pre-migration graph had none.
3. On a shadow, run `verify-restore.mjs --export <exportDir> --restore <restoreDir>`. On production, compare counts per label and type with the export manifest (element ids are not durable).
4. Switch API, executor, workspace and skill bindings back to the previous release together.

The target guard refuses Aura; running the rollback on production needs the operator override `BKS_ALLOW_NON_DISPOSABLE_TARGET` under explicit S9 authorization. After any v2 write the rule is freeze, reconcile and repair forward; the data rollback is then a restore of the export into a fresh database under an accepted data-loss policy.

## Open for Gate F (after the v2.0.2 rehearsal of record)

- Answer assertions on migrated data are done (S4 runner; 0 failed). What remains is the final delta export at cutover (S9).

Earlier list (wave 3, kept for history):

- Supported-question replay WITH answer assertions (S4's runner); this rehearsal ran EXPLAIN plus execution only.
- The `rel_MEASURES_assertion_exists` decision.
- The final delta export at cutover.
