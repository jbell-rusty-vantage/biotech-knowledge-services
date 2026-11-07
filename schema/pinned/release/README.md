# biotech-schema-v2.2.0

Minor release of `biotech-schema-v2.1.0` (Sprint V SV-11, decision R-SV11 in `decisions/DECISIONS.md`). Earlier releases stay immutable.

What changed (`release-source.yaml` releaseNotes): `ReportKind.STUDY_APPRAISAL`; nullable `useDecisionDigest` on kernel `Activity` and `Assessment`; two operational `KsIntentMarker` lookup indexes (`dispatchId`, `markerDigest`) declared in `rules/operational-names.yaml` for the Knowledge Services dispatch outbox consumer. PostgreSQL, the Knowledge Services common component, still owns runs, use decisions, the outbox and the revocation epoch; the graph holds immutable references and digests. No label or relationship type changed. EXPLAIN evidence (`query-catalog/explain.json`) is inherited unchanged because no query source changed.

Authored sources and generated files share this directory; `release.json` lists every file and its role. Reproduce and pin from biotech-knowledge-services:

```text
node scripts/release/generate.mjs --release schema/source/biotech-schema-v2.2.0 --check
node scripts/release/verify.mjs --release schema/source/biotech-schema-v2.2.0
pnpm schema:pin -- --release schema/source/biotech-schema-v2.2.0 --pinned-at <YYYY-MM-DD>
pnpm workspace:build && pnpm workspace:verify
```

Research only, not medical advice.
