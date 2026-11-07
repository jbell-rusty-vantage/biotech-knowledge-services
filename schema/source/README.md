# schema/source

Authored Biotech graph schema releases. Owner decision SV-D10 (2026-10-24, Sprint V) makes this repository the schema author; see decision R-SV10 in each release's `decisions/DECISIONS.md`. The historical upstream checkout `../biotech-meta` is absent. It remains provenance for v2.0.x only and is not an edit destination.

| Directory | Status |
| --- | --- |
| `biotech-schema-v2.1.0/` | Published. Initialized from the verified pinned v2.0.2 inputs; the copied inputs regenerate v2.0.2's content-tree digest exactly. |
| `biotech-schema-v2.2.0/` | Current source (Sprint V SV-11, R-SV11): ReportKind STUDY_APPRAISAL, useDecisionDigest, KsIntentMarker dispatch lookup indexes. Pinned in `schema/pinned/`. Operational DDL can be declared in `rules/operational-names.yaml` (`ddl:`). |

## What is authored, what is generated

`release.json` gives every file a `role`. Edit only `source*`, `copy` and `evidence` files:

- SDL modules: `sdl/modules/*.graphql`
- Registers, rules and vocabularies: `registers/`, `rules/`, `vocabularies/`
- Tooling: `tooling/`
- Workspace inputs (sidecars): `workspace-inputs/`
- Query sources: `query-catalog/sources/`
- Decisions and migration maps: `decisions/`, `migration/`
- Release metadata: `README.md`, `release-source.yaml` (release id, version, parent, frozen `createdAt`, notes, provenance)
- Recorded or inherited EXPLAIN evidence: `query-catalog/explain.json`

`scripts/release/generate.mjs` writes the remaining files into the same directory:

- `sdl/assembled.*`
- `validation/`, `ddl/`
- `query-catalog/catalog.json`
- `reports/{metrics,predicate-registry-report,subjectable-audit,decision-closure}.*`
- `compatibility.json`, `COMPATIBILITY.md`
- `release.json`

Never edit these by hand.

## Changing the schema

1. Copy the current release directory to a new `schema/source/<release>/` and leave published releases unchanged. Use a minor version for additive, backward-compatible changes such as nullable fields or new enums. Use a new major version for anything incompatible.
2. Edit the sources. In `release-source.yaml`, set `releaseId`, `version`, `createdAt`, `parentRelease` (the pinned identities), `releaseNotes` and `provenance` (`sourceRepository`, `sourcePath`, `bksCommit`). In `rules/compatibility.yaml`, set `releaseId` and `readCompatibility`. Record the decision in `decisions/DECISIONS.md` as a section, not a ledger table row, so the decision closure keeps its 160 ids.
3. Generate and check:

   ```text
   node scripts/release/generate.mjs --release schema/source/<release> --refresh-provenance
   node scripts/release/generate.mjs --release schema/source/<release> --check
   node scripts/release/verify.mjs --release schema/source/<release>
   ```

   If a query source changes, record new EXPLAIN evidence with `scripts/release/explain-catalog.mjs` against a disposable Neo4j, then pass it to `generate.mjs --explain-from <file>`. Never fabricate EXPLAIN results.
4. Pin and regenerate the dependents:

   ```text
   pnpm schema:pin -- --release schema/source/<release> --pinned-at <YYYY-MM-DD>
   pnpm build && pnpm workspace:build && pnpm workspace:verify
   pnpm api:generate && pnpm client:codegen
   node apps/executor/scripts/capability.mjs write && node apps/executor/scripts/lane-mount.mjs write
   ```

   Re-binding the pin also changes release-bound test material. Update the example pin in `examples/ingestion-intent.v2.example.json`, then rerun the kg-ops write tests once with `BKS_UPDATE_GOLDEN=1 BKS_UPDATE_ROUND=1`. Finish with `pnpm test`.

Generation is deterministic. It does not call `new Date()` or git, and output paths are relative to the release directory, so the same inputs give the same bytes.
