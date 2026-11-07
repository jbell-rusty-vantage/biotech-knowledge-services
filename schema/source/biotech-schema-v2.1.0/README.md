# biotech-schema-v2.1.0

Minor release of `biotech-schema-v2.0.2` and the first release authored in biotech-knowledge-services (owner decision SV-D10, decision R-SV10 in `decisions/DECISIONS.md`). Its inputs were initialized from the verified pinned v2.0.2 inputs; those copied inputs regenerate v2.0.2's content-tree digest exactly. Earlier releases stay immutable.

What changed (`release-source.yaml` releaseNotes): additive, nullable verification/report binding fields on kernel `Activity`, `Report`, `Assessment` and `Assertion`, plus enums `RunSealKind` and `UseDisposition` (Sprint V V07/V08). PostgreSQL, the Knowledge Services common component, owns runs, sealed manifests and use decisions; the graph holds immutable references and digests, never a competing run store. No label, relationship type or DDL statement changed. The `state.attach` task-route drift is corrected in `workspace-inputs/task-routes.yaml`. EXPLAIN evidence (`query-catalog/explain.json`) is inherited unchanged from v2.0.2 because no query source changed.

Authored sources and generated files share this directory; `release.json` lists every file and its role. Reproduce and pin from biotech-knowledge-services:

```text
node scripts/release/generate.mjs --release schema/source/biotech-schema-v2.1.0 --check
node scripts/release/verify.mjs --release schema/source/biotech-schema-v2.1.0
pnpm schema:pin -- --release schema/source/biotech-schema-v2.1.0 --pinned-at <YYYY-MM-DD>
pnpm workspace:build && pnpm workspace:verify
```

Research only, not medical advice.
