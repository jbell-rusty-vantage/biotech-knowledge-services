#!/usr/bin/env node
/**
 * Generates every derived artifact of a schema release from its upstream sources, then writes release.json.
 * Deterministic: inputs are only the release directory (plus the frozen BKS commit id and generator digests);
 * running it twice yields byte-identical files.
 *
 *   node scripts/release/generate.mjs [--release <dir>] [--check]
 *
 * Current authored releases live in schema/source/<release>/ (owner decision SV-D10; default --release is
 * schema/source/biotech-schema-v2.1.0). Generated files are written next to the sources in that directory, so the
 * directory is the complete release that pnpm schema:pin verifies and mirrors.
 *
 * Writes: sdl/assembled.graphql, sdl/assembled.manifest.json, validation/validation-params.json, ddl/{required,
 * enterprise,optional}.cypher, ddl/ddl.json, query-catalog/catalog.json, reports/{metrics,predicate-registry-report,
 * subjectable-audit,decision-closure}.json, reports/predicate-registry-report.md, release.json.
 * EXPLAIN evidence is a separate step (scripts/release/explain-catalog.mjs writes query-catalog/explain.json); re-run
 * generate afterwards so catalog statuses reflect it.
 *
 * --check: generate in memory and exit 1 if any file on disk differs (nothing written).
 * --explain-from <file>: adopt an EXPLAIN result (from scripts/release/explain-catalog.mjs --out) as the release's
 *   query-catalog/explain.json evidence before generating (refused for --check; only while staging a release).
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  arg, BASELINE_SCHEMA_DIGEST, BIOTECH_META_COMMIT, BKS_COMMIT, BKS_ROOT, canonicalJson, CURRENT_RELEASE_DIR, flag, listFiles,
  orderedJson, prettyJson, readText, RELEASE_CREATED_AT, RELEASE_ID, sha256Hex, sha256Tagged, versions, writeTree, YAML,
} from "./lib/common.mjs";
import { assembleModules, releaseHeader } from "./lib/assemble.mjs";
import { buildSdlModel } from "./lib/sdl-model.mjs";
import { buildValidationParams } from "./lib/params.mjs";
import { buildDdl } from "./lib/ddl.mjs";
import { buildMetrics } from "./lib/metrics.mjs";
import { buildDecisionClosure, buildPredicateReport, buildSubjectableAudit } from "./lib/reports.mjs";
import { buildCatalog } from "./lib/catalog.mjs";

export const GENERATOR_VERSION = "1.0.0";
/** Files whose digest is recorded but which are excluded from the frozen digest set until their owner delivers. */
export const EXCLUDED_FROM_FROZEN = {
  "migration/legacy-map.yaml": {
    owner: "S8 (migration / qualification)",
    rule: "placeholder hosted by S1; S8 fills the live legacy biotech-kg label/edge/property dispositions. It is excluded from the frozen digest set (files, contentTreeDigest, schemaReleaseDigest) until S8 delivers; then S1 re-releases as biotech-schema-v2.0.1 if the frozen set must change.",
  },
};
const GENERATORS = [
  "scripts/release/generate.mjs", "scripts/release/promote.mjs", "scripts/release/lib/common.mjs", "scripts/release/lib/assemble.mjs",
  "scripts/release/lib/sdl-model.mjs", "scripts/release/lib/params.mjs", "scripts/release/lib/ddl.mjs", "scripts/release/lib/metrics.mjs",
  "scripts/release/lib/reports.mjs", "scripts/release/lib/catalog.mjs", "scripts/release/lib/corrections.mjs", "scripts/release/lib/registries.mjs",
  "scripts/release/lib/capture-methods.mjs", "scripts/release/lib/v1map.mjs", "scripts/release/explain-catalog.mjs",
  "scripts/release/bootstrap-workspace-inputs.mjs", "scripts/release/derive.mjs", "scripts/release/derive-patch.mjs",
];
const MODULE_OWNERS = {
  K: "kernel: evidence, identity, time, lineage", D1: "compounds and ingredients", D2: "mechanisms and biology of aging", D3: "clinical and preclinical evidence",
  D4: "diagnostics, biomarkers and measurement", D5: "interventions, protocols and safety", D6: "consumer products and commerce", D7: "organizations, people and money",
  D8: "manufacturing, quality, regulation and IP", D9: "sources, media and discourse", D10: "derived knowledge: associations, insights, reports, recommendations",
  D11: "bio-medical tooling action space", D12: "food and nutrition", D13: "frontiers, breakthroughs and events",
};

export async function generate(releaseDir, options = {}) {
  const read = (p) => readText(resolve(releaseDir, p));
  const readY = (p) => YAML.parse(read(p));
  const has = (p) => existsSync(resolve(releaseDir, p));
  const out = new Map();
  const problems = [];
  // Per-release configuration (v2.0.1+). v2.0.0 has none: its defaults are the constants below, so it regenerates unchanged.
  const cfg = has("release-source.yaml") ? readY("release-source.yaml") : null;
  const releaseId = cfg?.releaseId ?? RELEASE_ID;
  const version = cfg?.version ?? "2.0.0";
  const createdAt = cfg?.createdAt ?? RELEASE_CREATED_AT;
  const excludedFromFrozen = cfg ? (cfg.excludedFromFrozenDigestSet ?? {}) : EXCLUDED_FROM_FROZEN;
  const operational = has("rules/operational-names.yaml") ? readY("rules/operational-names.yaml") : null;
  const ddlPolicy = has("rules/ddl-policy.yaml") ? readY("rules/ddl-policy.yaml") : null;

  // 1. Assemble the SDL from the module sources.
  const moduleFiles = listFiles(resolve(releaseDir, "sdl", "modules")).filter((f) => f.endsWith(".graphql"));
  const assembled = assembleModules(moduleFiles.map((f) => ({ file: f, text: read(`sdl/modules/${f}`) })), { header: releaseHeader(cfg?.sdlHeaderReleaseId ?? releaseId) });
  const schemaDigest = `sha256:${assembled.sha256}`;
  if (schemaDigest === BASELINE_SCHEMA_DIGEST) problems.push("assembled SDL equals the baseline: corrections were not applied");
  const manifest = {
    format: "bks-sdl-assembly.v1",
    releaseId,
    out: "sdl/assembled.graphql",
    sha256: assembled.sha256,
    schemaDigest,
    parentBaseline: BASELINE_SCHEMA_DIGEST,
    modules: assembled.modules.map((m) => ({ id: m.id, file: `sdl/modules/${m.file}`, sha256: m.sha256, bytes: m.bytes, definitions: m.definitions, lineStart: m.lineStart, lineEnd: m.lineEnd, definitionNames: m.definitionNames })),
  };
  out.set("sdl/assembled.graphql", assembled.text);
  out.set("sdl/assembled.manifest.json", orderedJson(manifest));
  const model = buildSdlModel(assembled.text, manifest);

  // 2. Sources.
  const nodeRegister = readY("registers/node-register.yaml");
  const relRegister = readY("registers/relationship-register.yaml");
  const predicates = readY("vocabularies/predicates.yaml");
  const identifierSchemes = readY("vocabularies/identifier-schemes.yaml");
  const assessments = existsSync(resolve(releaseDir, "vocabularies/assessments.yaml")) ? readY("vocabularies/assessments.yaml") : null;
  const corrections = existsSync(resolve(releaseDir, "reports/corrections.json")) ? JSON.parse(read("reports/corrections.json")) : { predicateDispositions: [] };

  // 3. Validation params (FU-08).
  const params = buildValidationParams({ model, nodeRegister, relRegister, predicates, identifierSchemes, schemaDigest, releaseId, operational });
  problems.push(...params.problems.map((p) => `params: ${p}`));
  const paramsText = prettyJson(params.params);
  out.set("validation/validation-params.json", paramsText);

  // 4. DDL (FU-07). v2.0.2+: the post-migration uid_exists labels are the legacy relabeled labels that are also stored v2
  // labels (legacy rows keep them until the migration relabels them); the policy file must state exactly that set.
  if (ddlPolicy) {
    const lm = has("migration/legacy-map.yaml") ? readY("migration/legacy-map.yaml") : null;
    const relabel = lm?.policy?.legacyPreservation?.relabel?.relabelLabels ?? [];
    const primary = new Set([...model.nodes.values()].map((n) => n.primaryLabel));
    const colliding = relabel.filter((l) => primary.has(l)).sort();
    if (JSON.stringify(colliding) !== JSON.stringify([...ddlPolicy.postMigration.uidExistsLabels].sort())) problems.push(`ddl policy: post-migration uid_exists labels ${ddlPolicy.postMigration.uidExistsLabels} != legacy labels that are v2 primary labels ${colliding}`);
  }
  const ddl = buildDdl({ model, nodeRegister, relRegister, queryPatternsMd: read("query-catalog/sources/query-patterns.md"), d9PatternsMd: read("query-catalog/sources/patterns-by-question/D9.md"), schemaDigest, releaseId, operational, policy: ddlPolicy });
  problems.push(...ddl.problems.map((p) => `ddl: ${p}`));
  for (const [p, t] of Object.entries(ddl.files)) out.set(p, t);
  const ddlText = orderedJson(ddl.ddl);
  out.set("ddl/ddl.json", ddlText);

  // 5. Query catalog (from the final pattern sources; EXPLAIN evidence if present).
  const explainPath = resolve(releaseDir, "query-catalog/explain.json");
  if (options.explainFrom) {
    const ev = readFileSync(resolve(options.explainFrom));
    if (JSON.parse(ev.toString("utf8")).format !== "bks-query-explain.v1") throw new Error(`--explain-from ${options.explainFrom} is not bks-query-explain.v1`);
    out.set("query-catalog/explain.json", ev.toString("utf8"));
  }
  const explain = out.has("query-catalog/explain.json") ? JSON.parse(out.get("query-catalog/explain.json")) : existsSync(explainPath) ? JSON.parse(readText(explainPath)) : null;
  // v2.0.2+: templates that need an optional, disabled capability index are unsupported (OD-44 vectors -> vectors.native).
  const capabilityGates = cfg?.catalogCapabilityGates ? Object.fromEntries(ddl.ddl.statements.filter((s) => s.requirement === "optional" && s.edition === "community" && cfg.catalogCapabilityGates[s.profile]).map((s) => [s.name, cfg.catalogCapabilityGates[s.profile]])) : null;
  const catalogPatch = cfg?.catalogPatch ? { path: cfg.catalogPatch, patch: JSON.parse(read(cfg.catalogPatch)) } : null;
  const questionStatus = cfg?.questionStatus ? { path: cfg.questionStatus, status: JSON.parse(read(cfg.questionStatus)) } : null;
  const catalog = await buildCatalog({ releaseDir, sdlText: assembled.text, ddl: ddl.ddl, explain, releaseId, capabilityGates, catalogPatch, questionStatus });
  out.set("query-catalog/catalog.json", catalog.text);

  // 6. Reports.
  const metrics = buildMetrics({ model, manifest });
  problems.push(...metrics.problems.map((p) => `metrics: ${p}`));
  out.set("reports/metrics.json", prettyJson(metrics.metrics));
  const predReport = buildPredicateReport({ predicates, corrections, model, releaseId });
  problems.push(...predReport.problems.map((p) => `predicates: ${p}`));
  out.set("reports/predicate-registry-report.json", prettyJson(predReport.report));
  out.set("reports/predicate-registry-report.md", predReport.markdown);
  out.set("reports/subjectable-audit.json", prettyJson(buildSubjectableAudit({ model, predicates, nodeRegister, identifierSchemes, assessments })));

  // 7. Decision closure (all 160 ids; S0/S1 rows mapped to release artifacts).
  const existing = new Set([...listFiles(releaseDir), ...out.keys()]);
  const closure = buildDecisionClosure({ decisionsMd: read("decisions/DECISIONS.md"), existing });
  problems.push(...closure.problems.map((p) => `decisions: ${p}`));
  if (closure.ids.length !== 160) problems.push(`decisions: ${closure.ids.length} decision ids, expected 160`);
  out.set("reports/decision-closure.json", prettyJson(closure.closure));

  // 7b. Compatibility (v2.0.1+): rules/compatibility.yaml -> compatibility.json + COMPATIBILITY.md (generated).
  const supportedMatrix = supportedMatrixOf(explain);
  if (has("rules/compatibility.yaml")) {
    const compat = buildCompatibility({ source: readY("rules/compatibility.yaml"), cfg, releaseId, schemaDigest, supportedMatrix, operational, ddl: ddl.ddl, catalogCounts: catalog.catalog.counts, problems });
    out.set("compatibility.json", prettyJson(compat));
    out.set("COMPATIBILITY.md", compatibilityMarkdown(compat));
  }

  // 8. release.json over every file of the release (on disk + generated), excluding release.json itself.
  const bytesOf = new Map();
  for (const p of listFiles(releaseDir)) if (p !== "release.json") bytesOf.set(p, readFileSync(resolve(releaseDir, p)));
  for (const [p, t] of out) bytesOf.set(p, Buffer.from(t, "utf8"));
  for (const p of [...bytesOf.keys()]) if (/\.staging-|\.old-/.test(p)) bytesOf.delete(p);
  const files = {};
  const excluded = {};
  for (const [p, b] of [...bytesOf.entries()].sort(([a], [c]) => (a < c ? -1 : a > c ? 1 : 0))) {
    const entry = { sha256: sha256Hex(b), bytes: b.length, role: roleOf(p) };
    if (excludedFromFrozen[p]) excluded[p] = { ...entry, ...excludedFromFrozen[p] };
    else files[p] = entry;
  }
  for (const p of Object.keys(excludedFromFrozen)) if (!excluded[p]) problems.push(`excluded file ${p} is missing (placeholder required)`);
  const contentTreeDigest = sha256Tagged(Object.entries(files).map(([p, e]) => `${p}\u0000${e.sha256}\n`).join(""));
  const decisionsSha = files["decisions/DECISIONS.md"].sha256;
  const neo4jTested = explain?.neo4j ? `${explain.neo4j.version} ${explain.neo4j.edition}` : "5.26 community";
  const release = {
    releaseFormat: "bks-schema-release.v1",
    releaseId,
    version,
    status: "frozen",
    createdAt,
    ...(cfg?.parentRelease ? { parentRelease: cfg.parentRelease, releaseNotes: cfg.releaseNotes ?? [] } : {}),
    description: cfg?.description ?? "Biotech knowledge graph schema v2: kernel K + domain modules D1-D13, registers, vocabularies, rules, operational DDL, query catalog, migration maps and workspace inputs. Capability qualification (fixtures, result assertions, runtime gates) is tracked separately from this source release.",
    parentBaseline: { schemaDigest: BASELINE_SCHEMA_DIGEST, path: "schema/program/final/schema/final_biotech_schema_v2.graphql", repository: "biotech-knowledge-services", commit: BKS_COMMIT, bytes: 387615 },
    sourceRevision: cfg?.provenance ? authoredSourceRevision(cfg, contentTreeDigest) : {
      bksCommit: BKS_COMMIT,
      ...(cfg?.additionalInputs ? { additionalInputs: cfg.additionalInputs } : {}),
      bksFrozenInputs: "schema/program/final/** and docs/plans/schema-v2-service-release/DECISIONS.md at bksCommit (run record stays in BKS Git history as provenance)",
      bksDirtyAtCreation: ["README.md (pre-existing, unrelated)", "docs/deployment/graphql-api.md (pre-existing, unrelated)", "docs/plans/ (untracked release packet; DECISIONS.md copied into decisions/)"],
      biotechMetaCommit: BIOTECH_META_COMMIT,
      biotechMetaDirty: true,
      dirtySnapshotDigest: contentTreeDigest,
      dirtySnapshotRule: "biotech-meta is dirty while this release is uncommitted: the release identity is the content-tree digest sha256 over the sorted lines '<path>\\0<sha256>\\n' of every frozen file below (identical to identities.contentTreeDigest)",
    },
    identities: {
      schemaDigest,
      queryCatalogDigest: sha256Tagged(catalog.text),
      ddlDigest: sha256Tagged(ddlText),
      validationParamsDigest: sha256Tagged(paramsText),
      decisionLedgerDigest: `sha256:${decisionsSha}`,
      contentTreeDigest,
    },
    identityRules: {
      schemaDigest: "sha256 of sdl/assembled.graphql bytes",
      schemaReleaseDigest: "sha256 of canonicalJson(release.json) (recursively sorted keys, no whitespace, UTF-8); not stored in release.json; recorded in biotech-knowledge-services schema/pinned/PIN.json and INTERFACES.md",
      queryCatalogDigest: "sha256 of query-catalog/catalog.json bytes",
      ddlDigest: "sha256 of ddl/ddl.json bytes (it embeds every statement); the migrator stamps it on :KsReleaseMarker",
      baselineReuse: "the parent baseline sha256:c7cf1235... is never reused for changed bytes",
    },
    decisionLedgerDigest: `sha256:${decisionsSha}`,
    decisionLedger: { path: "decisions/DECISIONS.md", sha256: decisionsSha, entries: closure.ids.length, source: cfg?.decisionLedger?.source ?? "biotech-knowledge-services docs/plans/schema-v2-service-release/DECISIONS.md", input: cfg?.decisionLedger?.input ?? "schema/program/final/open-questions.md sha256 ee1caf258533474b6270eab1f8960a322c2fca310a5f15b58a5473a9e96e942b (historical bytes; release status section appended after)" },
    files,
    excludedFromFrozenDigestSet: excluded,
    moduleOwnership: Object.fromEntries(manifest.modules.map((m) => [m.id, { file: m.file, sha256: m.sha256, owner: m.id === "K" ? "kernel" : m.id, title: MODULE_OWNERS[m.id] ?? m.id, definitions: m.definitions, nodeTypes: [...model.nodes.values()].filter((n) => n.module === m.id).map((n) => n.name).sort() }])),
    contractVersions: {
      release: "bks-schema-release.v1",
      pin: "bks-pin.v2",
      ir: "bks-schema-ir.v2",
      sdlAssembly: "bks-sdl-assembly.v1",
      validationParams: "bks-validation-params.v2",
      ddl: "bks-ddl.v1",
      queryCatalog: catalog.catalog.format ?? "bks-query-catalog.v1",
      queryExplain: explain?.format ?? "bks-query-explain.v1",
      qualifierGrammar: "bks-qualifier-grammar.v1",
      assessmentVocabulary: "bks-assessment-vocabulary.v1",
      rules: "bks-rules.v1",
      v1Map: "bks-v1-map.v1",
      legacyMap: "bks-legacy-map.v1",
      nativeContracts: { owner: "S3 (packages/contracts)", ingestionIntent: "biotech-knowledge-intent.v2", plan: "biotech-knowledge-plan.v2", apply: "biotech-knowledge-apply.v2", applyWitness: "bks-apply-witness.v1", receipt: "biotech-knowledge-receipt.v2", typedRead: "biotech-knowledge-read-intent.v2", cypherRead: "biotech-cypher-read-intent.v1", readResult: "biotech-knowledge-read-result.v2", schemaContext: "biotech-schema-context.v1", canonicalJson: "bks-canonical-json.v2" },
    },
    compilerVersions: {
      generator: `scripts/release/generate.mjs@${GENERATOR_VERSION}`,
      graphqlJs: versions.graphql,
      yaml: versions.yaml,
      neo4jGraphql: lockVersion("@neo4j/graphql"),
      generators: generatorDigests(releaseDir, releaseId, options.refreshProvenance === true),
    },
    supportedMatrix,
    metrics: { nodeTypes: metrics.metrics.nodeTypes, relationshipTypes: metrics.metrics.relationshipTypes, pairsCollapsed: metrics.metrics.pairsCollapsed, pairsExpanded: metrics.metrics.pairsExpanded, kernelRelationshipTypes: metrics.metrics.kernelRelationshipTypes, ddlStatements: ddl.ddl.counts, catalog: catalog.catalog.counts ?? null },
  };
  const releaseText = prettyJson(release);
  out.set("release.json", releaseText);
  return { out, problems, release, schemaReleaseDigest: sha256Tagged(canonicalJson(release)), catalogReport: catalog.report };
}

/**
 * Source revision of a release authored in biotech-knowledge-services (v2.1.0+, owner decision SV-D10): the repository,
 * the source path and the fixed base commit come from release-source.yaml `provenance` (no git call, so generation stays
 * deterministic). The tree is uncommitted at creation, so the identity is the content-tree digest (dirtySnapshotDigest,
 * checked by pin.mjs). No biotech-meta field: that checkout is historical provenance only.
 */
function authoredSourceRevision(cfg, contentTreeDigest) {
  const p = cfg.provenance;
  for (const k of ["sourceRepository", "sourcePath", "bksCommit"]) if (!p[k]) throw new Error(`release-source.yaml provenance.${k} is required`);
  return {
    sourceRepository: p.sourceRepository,
    sourcePath: p.sourcePath,
    bksCommit: p.bksCommit,
    ...(p.bksCommitRule ? { bksCommitRule: p.bksCommitRule } : {}),
    ...(p.initializedFrom ? { initializedFrom: p.initializedFrom } : {}),
    ...(cfg.additionalInputs ? { additionalInputs: cfg.additionalInputs } : {}),
    dirtySnapshotDigest: contentTreeDigest,
    dirtySnapshotRule: "the release identity is the content-tree digest sha256 over the sorted lines '<path>\\0<sha256>\\n' of every frozen file below (identical to identities.contentTreeDigest); it holds whether or not the source tree is committed",
  };
}

/**
 * Generator provenance: the digests of the tool files that created the release. A frozen release keeps the provenance
 * recorded at its creation, so a later tool version regenerating it (to prove byte equivalence) does not rewrite the
 * record; --refresh-provenance re-records it (only while a release is being staged).
 */
function generatorDigests(releaseDir, releaseId, refresh) {
  const existing = resolve(releaseDir, "release.json");
  if (!refresh && existsSync(existing)) {
    try {
      const prev = JSON.parse(readText(existing));
      if (prev.releaseId === releaseId && prev.compilerVersions?.generators) return prev.compilerVersions.generators;
    } catch {
      // fall through: re-record
    }
  }
  return Object.fromEntries(GENERATORS.filter((g) => existsSync(resolve(BKS_ROOT, g))).map((g) => [g, sha256Hex(readText(resolve(BKS_ROOT, g)))]));
}

function supportedMatrixOf(explain) {
  const neo4jTested = explain?.neo4j ? `${explain.neo4j.version} ${explain.neo4j.edition}` : "5.26 community";
  return {
    neo4j: { tested: `Neo4j ${neo4jTested} (disposable docker neo4j:5.26-community)`, target: "Neo4j 5.27-aura Enterprise (Aura database neo4j, S0-INVENTORY)", enterpriseEvaluation: "neo4j:5.26-enterprise (NEO4J_ACCEPT_LICENSE_AGREEMENT=eval) for Enterprise-only DDL" },
    cypher: "Cypher 5 (a CYPHER 5 prefix is allowed; CYPHER 25 is not used)",
    apoc: "APOC Core (required: DateTime projection in @neo4j/graphql reads); APOC Extended not required",
    gds: "optional (OD-22); no required DDL or supported template depends on it",
    neo4jGraphql: lockVersion("@neo4j/graphql"),
    graphqlJs: versions.graphql,
    node: ">=22",
  };
}

function buildCompatibility({ source, cfg, releaseId, schemaDigest, supportedMatrix, operational, ddl, catalogCounts, problems }) {
  const parent = cfg?.parentRelease ?? null;
  const sameSdl = parent ? parent.schemaDigest === schemaDigest : null;
  if (parent && source.readCompatibility?.sdlBytesChanged === false && !sameSdl) problems.push(`compatibility: SDL declared unchanged but schemaDigest ${schemaDigest} != parent ${parent.schemaDigest}`);
  return {
    format: "bks-release-compatibility.v1",
    releaseId,
    schemaDigest,
    parentRelease: parent,
    supportedMatrix,
    capabilities: source.capabilities,
    liveConstraintsOwnedElsewhere: source.liveConstraintsOwnedElsewhere,
    operationalNames: operational ? {
      class: "operational",
      projection: "excluded",
      agentWrite: "forbidden",
      labels: operational.labels.map((l) => l.name).sort(),
      relationshipTypes: operational.relationshipTypes.map((x) => x.name).sort(),
      properties: operational.properties.map((p) => p.name).sort(),
      qualifierPrefixes: operational.qualifierFamilies.flatMap((f) => f.members).sort(),
    } : null,
    markers: ddl.markerShapes ?? null,
    markerCompatibility: source.markers ?? null,
    executorReconciliation: ddl.executorReconciliation ?? null,
    migrationCommands: ddl.migrationCommands ?? [],
    ...(ddl.phases ? { installerOrder: ddl.phases.order, ddlPhases: ddl.phases, ddlExceptions: ddl.exceptions } : {}),
    readCompatibility: {
      ...source.readCompatibility,
      schemaDigestEqualToParent: sameSdl,
      schemaReleaseDigestRule: "always differs from the parent release (release.json content differs); readers accept either release when its schemaDigest equals theirs and its operational names are a superset; writers require an exact schemaReleaseDigest match",
    },
    queryCatalog: { counts: catalogCounts },
    decisions: source.decisions ?? [],
  };
}

function compatibilityMarkdown(c) {
  const q = (x) => "`" + x + "`";
  const cell = (v) => (typeof v === "string" ? v : JSON.stringify(v));
  const L = [];
  L.push("# Compatibility: " + c.releaseId, "");
  L.push("GENERATED by scripts/release/generate.mjs from " + q("rules/compatibility.yaml") + "; machine form " + q("compatibility.json") + " (listed in release.json). Do not edit by hand.", "");
  L.push("schemaDigest " + q(c.schemaDigest) + (c.parentRelease ? " (parent " + c.parentRelease.releaseId + ": " + q(c.parentRelease.schemaDigest) + "; identical SDL bytes: " + (c.readCompatibility.schemaDigestEqualToParent ? "yes" : "no") + ")" : "") + ".", "");
  L.push("## Supported matrix", "", "| component | supported |", "| --- | --- |");
  for (const [k, v] of Object.entries(c.supportedMatrix ?? {})) L.push("| " + k + " | " + cell(v) + " |");
  L.push("", "## Capabilities in this release", "", "| capability | status | reason |", "| --- | --- | --- |");
  for (const [k, v] of Object.entries(c.capabilities ?? {})) L.push("| " + k + " | " + v.status + " | " + v.reason + " |");
  L.push("", "## Live constraints owned by another authority (not dropped, not modified)", "", "| label | constraints | owner | decision |", "| --- | --- | --- | --- |");
  for (const x of c.liveConstraintsOwnedElsewhere ?? []) L.push("| " + x.label + " | " + x.constraints.join(", ") + " | " + x.owner + " | " + x.decision + " |");
  L.push("", "## Operational names (release-known, not domain ontology)", "", "Class " + q("operational") + ": excluded from the consumer projection; no ordinary agent write capability (writers: the migrator and executor internals only); not in the SDL.", "");
  const o = c.operationalNames ?? {};
  L.push("- labels: " + (o.labels ?? []).map(q).join(", "), "- relationship types: " + (o.relationshipTypes ?? []).map(q).join(", "), "- properties: " + (o.properties ?? []).map(q).join(", "), "- qualifiers: " + (o.qualifierPrefixes ?? []).map(q).join(", "));
  if (c.markerCompatibility) {
    L.push("", "## Migration markers under the executor markerKey scheme", "");
    for (const [k, v] of Object.entries(c.markerCompatibility)) L.push("- " + k + ": " + cell(v));
  }
  if (c.executorReconciliation) {
    L.push("", "## Executor DDL reconciliation (release DDL is the single authority)", "", c.executorReconciliation.rule + ".", "", "| S3 statement | release statement | status | note |", "| --- | --- | --- | --- |");
    for (const x of c.executorReconciliation.adopted ?? []) L.push("| " + x.s3 + " | " + x.release + " | adopted | " + x.note + " |");
    for (const x of c.executorReconciliation.notAdopted ?? []) L.push("| " + x.s3 + " | " + x.release + " | not adopted | " + x.reason + " |");
  }
  if (c.installerOrder) {
    L.push("", "## Installer order (DDL phases)", "");
    c.installerOrder.forEach((s, i) => L.push(i + 1 + ". " + s));
    L.push("", c.ddlPhases.rule, "", "Post-migration uid_exists labels (legacy rows carry them until relabeled): " + c.ddlPhases.postMigrationUidExistsLabels.map(q).join(", ") + ". Statement counts: " + cell(c.ddlPhases.counts) + ".");
  }
  if ((c.ddlExceptions ?? []).length) {
    L.push("", "## DDL exceptions (not installed)", "", "| statement | status | reason | enforced instead | enabling condition |", "| --- | --- | --- | --- | --- |");
    for (const x of c.ddlExceptions) L.push("| " + q(x.name) + " | " + x.status + " | " + x.reason + " | " + (x.enforcedInstead ?? "") + " | " + x.enablingCondition + " |");
  }
  if ((c.migrationCommands ?? []).length) {
    L.push("", "## Migration commands", "");
    for (const m of c.migrationCommands) L.push("- " + q(m.cypher) + ": " + m.when + " (" + m.owner + ")");
  }
  L.push("", "## Markers (operational DDL)", "");
  for (const [k, v] of Object.entries(c.markers ?? {})) L.push("- " + q(k) + ": " + cell(v));
  L.push("", "## Read compatibility", "", "| rule | value |", "| --- | --- |");
  for (const [k, v] of Object.entries(c.readCompatibility ?? {})) L.push("| " + k + " | " + cell(v) + " |");
  return `${L.join("\n")}\n`;
}

function roleOf(p) {
  if (p === "release-source.yaml" || p === "rules/operational-names.yaml" || p === "rules/compatibility.yaml" || p === "rules/ddl-policy.yaml") return "source (authored upstream)";
  if (p === "COMPATIBILITY.md" || p === "compatibility.json") return "generated";
  if (/^sdl\/modules\//.test(p) || /^registers\//.test(p) || /^vocabularies\/(predicates|identifier-schemes|targets|claim-lifecycle|verdict-lattice|answer-kinds|goal-polarity|frontiers)\.yaml$/.test(p) || /^tooling\//.test(p) || /^query-catalog\/sources\//.test(p)) return "source";
  if (/^vocabularies\//.test(p) || /^rules\//.test(p) || /^migration\//.test(p) || p === "reports/corrections.json" || p === "reports/capture-methods.json") return "source (promotion-generated)";
  if (/^workspace-inputs\//.test(p) || p === "README.md") return "source (authored upstream)";
  if (p === "decisions/DECISIONS.md") return "copy";
  if (p === "query-catalog/explain.json") return "evidence";
  return "generated";
}

function lockVersion(pkg) {
  const lock = readText(resolve(BKS_ROOT, "pnpm-lock.yaml"));
  const m = new RegExp(`\\n  '?${pkg.replace("/", "\\/")}@([0-9][^(:'\\n]*)`).exec(lock);
  return m ? m[1] : "unknown";
}

const invoked = process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
if (invoked) {
  const releaseDir = resolve(arg("--release", CURRENT_RELEASE_DIR));
  if (flag("--check") && arg("--explain-from")) {
    console.error("--explain-from cannot be combined with --check");
    process.exit(2);
  }
  const { out, problems, schemaReleaseDigest, release } = await generate(releaseDir, { refreshProvenance: flag("--refresh-provenance"), explainFrom: arg("--explain-from") });
  if (flag("--check")) {
    const drift = [...out].filter(([p, t]) => !existsSync(resolve(releaseDir, p)) || !readFileSync(resolve(releaseDir, p)).equals(Buffer.from(t, "utf8"))).map(([p]) => p);
    console.log(JSON.stringify({ ok: drift.length === 0 && problems.length === 0, drift, problems }, null, 2));
    process.exit(drift.length || problems.length ? 1 : 0);
  }
  const changed = writeTree(releaseDir, out);
  console.log(JSON.stringify({ ok: problems.length === 0, releaseDir, written: out.size, changed, schemaDigest: release.identities.schemaDigest, schemaReleaseDigest, queryCatalogDigest: release.identities.queryCatalogDigest, ddlDigest: release.identities.ddlDigest, contentTreeDigest: release.identities.contentTreeDigest, problems }, null, 2));
  process.exit(problems.length ? 1 : 0);
}
