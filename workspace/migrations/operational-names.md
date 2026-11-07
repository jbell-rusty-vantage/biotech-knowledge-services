---
id: "migration:operational-names"
kind: "migration"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:rules/operational-names.yaml"]
aliases: ["operational names","operational-names"]
capabilities: ["get"]
cardDigest: "sha256:a1e5fd8bcb93a1391156a7fcc86dc44482c24e3559339ba2188d32d8e352ca02"
---
# Operational names (not domain ontology)

Source: `rules/operational-names.yaml` of release biotech-schema-v2.2.0. Release-known operational names: they are NOT v2 domain ontology and NOT in the SDL. Validators and the planner recognize them (so they are never reported as unknown names nor mistaken for v2 types); the consumer projection excludes them; no ordinary agent write capability exists for them (only the listed writers, under the KsWriteFence). Typed reads, GraphQL and catalog templates never match them.

These names never get node or relationship cards: they are not in the SDL, the consumer projection excludes them, typed reads and catalog templates never match them, and no ordinary agent write capability exists for them. Do not use them in an ingestion intent.

## Labels (26)

| label | kind | legacy label / applies to | writers | projection | agent write |
| --- | --- | --- | --- | --- | --- |
| `LegacyV0` | legacy-tag | every preserved legacy node (relabeled and tag-only) | bks_migrator (scripts/migration, packages/kg-ops/src/migration) | excluded | forbidden |
| `LegacyV0_Biomarker` | legacy-relabel | Biomarker | bks_migrator (scripts/migration, packages/kg-ops/src/migration) | excluded | forbidden |
| `LegacyV0_Compound` | legacy-relabel | Compound | bks_migrator (scripts/migration, packages/kg-ops/src/migration) | excluded | forbidden |
| `LegacyV0_CompoundForm` | legacy-relabel | CompoundForm | bks_migrator (scripts/migration, packages/kg-ops/src/migration) | excluded | forbidden |
| `LegacyV0_Event` | legacy-relabel | Event | bks_migrator (scripts/migration, packages/kg-ops/src/migration) | excluded | forbidden |
| `LegacyV0_LabTest` | legacy-relabel | LabTest | bks_migrator (scripts/migration, packages/kg-ops/src/migration) | excluded | forbidden |
| `LegacyV0_Listing` | legacy-relabel | Listing | bks_migrator (scripts/migration, packages/kg-ops/src/migration) | excluded | forbidden |
| `LegacyV0_ListingSnapshot` | legacy-relabel | ListingSnapshot | bks_migrator (scripts/migration, packages/kg-ops/src/migration) | excluded | forbidden |
| `LegacyV0_Organization` | legacy-relabel | Organization | bks_migrator (scripts/migration, packages/kg-ops/src/migration) | excluded | forbidden |
| `LegacyV0_OrganizationSnapshot` | legacy-relabel | OrganizationSnapshot | bks_migrator (scripts/migration, packages/kg-ops/src/migration) | excluded | forbidden |
| `LegacyV0_PanelDefinition` | legacy-relabel | PanelDefinition | bks_migrator (scripts/migration, packages/kg-ops/src/migration) | excluded | forbidden |
| `LegacyV0_Person` | legacy-relabel | Person | bks_migrator (scripts/migration, packages/kg-ops/src/migration) | excluded | forbidden |
| `LegacyV0_PhysicalLocation` | legacy-relabel | PhysicalLocation | bks_migrator (scripts/migration, packages/kg-ops/src/migration) | excluded | forbidden |
| `LegacyV0_Product` | legacy-relabel | Product | bks_migrator (scripts/migration, packages/kg-ops/src/migration) | excluded | forbidden |
| `LegacyV0_ProductSnapshot` | legacy-relabel | ProductSnapshot | bks_migrator (scripts/migration, packages/kg-ops/src/migration) | excluded | forbidden |
| `LegacyV0_RegulatoryStatus` | legacy-relabel | RegulatoryStatus | bks_migrator (scripts/migration, packages/kg-ops/src/migration) | excluded | forbidden |
| `LegacyV0_Study` | legacy-relabel | Study | bks_migrator (scripts/migration, packages/kg-ops/src/migration) | excluded | forbidden |
| `LegacyV0_TechnologyPlatform` | legacy-relabel | TechnologyPlatform | bks_migrator (scripts/migration, packages/kg-ops/src/migration) | excluded | forbidden |
| `LegacyV0_Document` | legacy-relabel-reserved | Document | bks_migrator (scripts/migration, packages/kg-ops/src/migration) | excluded | forbidden |
| `LegacyV0_BellLabsSchemaDeploymentEvidence` | legacy-relabel-reserved | BellLabsSchemaDeploymentEvidence | bks_migrator (scripts/migration, packages/kg-ops/src/migration) | excluded | forbidden |
| `Document` | foreign-label |  | owner outside this release | excluded | forbidden |
| `BellLabsSchemaDeploymentEvidence` | foreign-label |  | owner outside this release | excluded | forbidden |
| `KsWriteFence` | executor-marker |  | native executor; bks_migrator | excluded | forbidden |
| `KsIntentMarker` | executor-marker |  | native executor; bks_migrator | excluded | forbidden |
| `KsReleaseMarker` | executor-marker |  | bks_migrator | excluded | forbidden |
| `KsRevocationFence` | executor-marker |  | native executor | excluded | forbidden |

## Relationship types (1)

| type | class | from | to | properties | agent write |
| --- | --- | --- | --- | --- | --- |
| `MIGRATED_FROM` | operational | any v2 node created by the migration | LegacyV0 | `migrationRunId`, `legacyElementId`, `legacyId`, `legacyLabel`, `legacyExportDigest`, `mapVersion` | forbidden |

## Properties (2)

| property | on | type | meaning | agent write |
| --- | --- | --- | --- | --- |
| `legacyLabels` | LegacyV0 | [String!] | original legacy labels of the preserved node | forbidden |
| `legacyExportDigest` | LegacyV0 \| MIGRATED_FROM | String (sha256:...) | digest of the verified legacy export the migration ran from (rollback / accounting key) | forbidden |

## Qualifier families (1)

| family | members | meaning | agent write |
| --- | --- | --- | --- |
| `legacy:` | `legacy:recordedFrom=`, `legacy:extractedAt=`, `legacy:runId=` | source-stated legacy system metadata carried on migrated Assertions; never a v2 clock or run id | forbidden |

## Executor and migrator marker shapes (4)

| marker | shape |
| --- | --- |
| `KsIntentMarker` | unique on markerKey (ks_intent_marker_key) = mk-<sha256(canonical{installationId, applicationId, tenantId, effectKey})> (S3 markerKeyOf); effectKey is the executor effect key or migration:<migrationRunId>:<batchId> for migration batches (indexed, ks_intent_marker_effect_key_lookup; no longer unique on its own); a migration batch is representable as markerKeyOf({installationId, applicationId: <mig… |
| `KsReleaseMarker` | {releaseId (unique, ks_release_marker_release_id), schemaReleaseDigest, ddlDigest, installedAt (index ks_release_marker_installed), migrationRunId} written last by the migrator after DDL and migration checks; Enterprise existence constraints on releaseId, schemaReleaseDigest, ddlDigest, installedAt |
| `KsRevocationFence` | exactly one node {id: 'canonical', generation, updatedAt} (ks_revocation_fence_id; Enterprise ks_revocation_fence_generation_exists); the local revocation fence of the admission witness |
| `KsWriteFence` | exactly one node {id: 'canonical', graphRevision, lockSeq, locked, lastEffectKey, lastWriterRunId, updatedAt} (ks_write_fence_id; Enterprise ks_write_fence_lock_seq_exists); every canonical write, migration batches included, takes the lock first with SET f.lockSeq = f.lockSeq + 1; graphRevision advances only when graph effects commit; locked is the executor's lock flag |
