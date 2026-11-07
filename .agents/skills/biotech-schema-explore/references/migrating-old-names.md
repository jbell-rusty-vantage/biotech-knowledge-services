# Migrating old names

Three kinds of non-v2 names appear in tasks, old notes and the live graph. None is a v2 type.

## v1 proposal ids (`workspace-inputs/aliases.yaml`, `migration/v1-map.yaml`)

`bks-schema get <old id>` answers with a record of kind `alias`: the disposition (`renamed`, `merged`, `split`,
`removed`), the v2 targets (`to`) and related live ids (`seeAlso`). A removed concept names no substitute type.

| old | answer |
| --- | --- |
| `node:Mention` | merged → `node:SourceLocator` (+ RESOLUTION Assessment); use `mention.stage` |
| `node:FormulationVersion`, `node:ProductSnapshot` | merged → `node:LabelVersion` |
| `frag:W04` (v1 fragments W00–W23) | → module `mod:D6` (`frag:D6` is the v1 spelling of the module id) |
| `rel:SELLS_PRODUCT`, … | see `migrations/v1-relationship-types.md` (`predicate-only`, `carried-by-pattern`, `retired`) |

Disposition tables: `migrations/v1-node-types.md`, `v1-relationship-types.md`, `v1-enums.md`, `v1-other.md`,
`navigation-aliases.md`, `unmapped-edges.md`. Search ranks the alias record first and its live targets right after.

## Live legacy graph labels (`migration/legacy-map.yaml`)

The live Aura graph holds the legacy biotech-kg schema (19 labels, 25 relationship types). `bks-schema get
legacy:Product` (or `legacy:ADVISES`) gives the disposition (`migrate` → v2 target, `retain-legacy`, `quarantine`) from
`migrations/legacy-map.md`. Legacy nodes are preserved, relabeled `LegacyV0_<Label>`, never deleted; migrated v2 nodes
link to them with `MIGRATED_FROM`. Execution belongs to the migration tooling, never to this skill.

## Operational names (`rules/operational-names.yaml`)

`LegacyV0`, `LegacyV0_<Label>`, `MIGRATED_FROM`, `legacyLabels`, `legacyExportDigest`, the `legacy:` qualifier family
(`legacy:recordedFrom=`, `legacy:extractedAt=`, `legacy:runId=`) and the `Ks*` markers (`KsWriteFence`,
`KsIntentMarker`, `KsReleaseMarker`, `KsRevocationFence`) are operational: not in the SDL, excluded from the consumer
projection, typed reads and templates, and not writable by agents. `bks-schema get op:MIGRATED_FROM` explains one;
the register is `migrations/operational-names.md`. Never use them in an ingestion intent or a domain answer.

## Commands

```bash
bks-schema search "ProductSnapshot"          # alias record, then node:LabelVersion
bks-schema find --kind alias --migration-kind removed --limit 20
jq -c 'select(.kind=="alias" and (.id|startswith("legacy:"))) | {id, migrationKind, targets}' workspace/search/index.jsonl
```
