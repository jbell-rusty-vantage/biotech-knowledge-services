#!/usr/bin/env node
/**
 * Derives a patch release from a frozen parent release (never edits the parent):
 *
 *   node scripts/release/derive.mjs --from <parent release dir> --to <new release dir> [--check]
 *
 * Today it implements biotech-schema-v2.0.1 (operational registration only, no ontology change):
 *   1. copies every non-generated file of the parent forward byte for byte (sources, copies, evidence);
 *   2. hosts S8's legacy map verbatim as a frozen file (migration/legacy-map.yaml; digest-checked);
 *   3. registers release-known OPERATIONAL names (not SDL types): rules/operational-names.yaml, the `legacy:` qualifier
 *      family in vocabularies/qualifiers.yaml, operational exclusions in rules/projection-rules.yaml, write denials in
 *      workspace-inputs/ingestion-rules.yaml;
 *   4. writes rules/compatibility.yaml, release-source.yaml and README.md.
 * Then run scripts/release/generate.mjs --release <new dir> (derived artifacts + release.json; SDL bytes unchanged).
 * Text edits are exact insertions verified by re-parsing (parsed(new) == parsed(parent) + additions).
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { arg, BKS_ROOT, canonicalJson, flag, readJson, readText, replaceOnce, sha256Tagged, toYaml, writeTree, YAML } from "./lib/common.mjs";

const PARENT_ID = "biotech-schema-v2.0.0";
const RELEASE = "biotech-schema-v2.0.1";
const CREATED_AT = "2026-10-11T23:45:00.000Z";
const LEGACY_MAP_SOURCE = "schema/program/final/migration/legacy-map.yaml";
const LEGACY_MAP_SHA256 = "a78218f983379eaefd25bf1ed8952b41f01af693b6d4f0ac1267b3f84568f32b";
const RELABELED = ["Biomarker", "Compound", "CompoundForm", "Event", "LabTest", "Listing", "ListingSnapshot", "Organization", "OrganizationSnapshot", "PanelDefinition", "Person", "PhysicalLocation", "Product", "ProductSnapshot", "RegulatoryStatus", "Study", "TechnologyPlatform"];
const TAG_ONLY = ["Document", "BellLabsSchemaDeploymentEvidence"];

const from = resolve(arg("--from") ?? "");
const to = resolve(arg("--to") ?? "");
if (!arg("--from") || !arg("--to")) {
  console.error("usage: node scripts/release/derive.mjs --from <parent release dir> --to <new release dir> [--check]");
  process.exit(2);
}
const parent = readJson(resolve(from, "release.json"));
if (parent.releaseId !== PARENT_ID) throw new Error(`parent is ${parent.releaseId}, expected ${PARENT_ID}`);
const sha = (b) => createHash("sha256").update(b).digest("hex");

// ---- 1. carry the parent's non-generated files forward (byte for byte) ----
const files = new Map();
const carried = [];
for (const [p, e] of Object.entries({ ...parent.files, ...parent.excludedFromFrozenDigestSet })) {
  if (e.role === "generated" || p === "README.md" || p === "migration/legacy-map.yaml") continue;
  const b = readFileSync(resolve(from, p));
  if (sha(b) !== e.sha256) throw new Error(`parent file ${p} does not match its release.json digest`);
  files.set(p, b.toString("utf8"));
  carried.push(p);
}

// ---- 2. host S8's legacy map verbatim ----
const legacyMap = readFileSync(resolve(BKS_ROOT, LEGACY_MAP_SOURCE));
if (sha(legacyMap) !== LEGACY_MAP_SHA256) throw new Error(`legacy map ${LEGACY_MAP_SOURCE} sha256 ${sha(legacyMap)} != expected ${LEGACY_MAP_SHA256}`);
files.set("migration/legacy-map.yaml", legacyMap.toString("utf8"));
const lm = YAML.parse(legacyMap.toString("utf8"));
const lmRelabel = lm.policy?.legacyPreservation?.relabel;
if (JSON.stringify([...lmRelabel.relabelLabels].sort()) !== JSON.stringify([...RELABELED].sort()) || JSON.stringify([...lmRelabel.tagOnly].sort()) !== JSON.stringify([...TAG_ONLY].sort())) throw new Error("legacy map relabel/tagOnly lists differ from the registered operational names");

// ---- 3a. operational names registry ----
const OP_WRITERS = ["bks_migrator (scripts/migration, packages/kg-ops/src/migration)"];
const operational = {
  format: "bks-operational-names.v1",
  releaseId: RELEASE,
  class: "operational",
  rule: "Release-known operational names: they are NOT v2 domain ontology and NOT in the SDL. Validators and the planner recognize them (so they are never reported as unknown names nor mistaken for v2 types); the consumer projection excludes them; no ordinary agent write capability exists for them (only the listed writers, under the KsWriteFence). Typed reads, GraphQL and catalog templates never match them.",
  decisions: ["CUTOVER.md Compatibility decisions (lead, 2026-10-11)", "S8-migration-prep.md section 10 items 1 and 3", "S0-INVENTORY section 5 consequence 2"],
  labels: [
    { name: "LegacyV0", kind: "legacy-tag", appliesTo: "every preserved legacy node (relabeled and tag-only)", writers: OP_WRITERS, projection: "excluded", agentWrite: "forbidden", source: "migration/legacy-map.yaml policy.legacyPreservation" },
    ...RELABELED.map((l) => ({ name: `LegacyV0_${l}`, kind: "legacy-relabel", legacyLabel: l, usedBy: "legacy-map relabel (REMOVE n:<Label> SET n:LegacyV0_<Label>:LegacyV0)", writers: OP_WRITERS, projection: "excluded", agentWrite: "forbidden", source: "migration/legacy-map.yaml policy.legacyPreservation.relabel.relabelLabels" })),
    ...TAG_ONLY.map((l) => ({ name: `LegacyV0_${l}`, kind: "legacy-relabel-reserved", legacyLabel: l, usedBy: `reserved: legacy-map 1.0.0 keeps ${l} tag-only (original label kept + :LegacyV0); the name is registered so a future relabel or a reverse recipe is recognized`, writers: OP_WRITERS, projection: "excluded", agentWrite: "forbidden", source: "migration/legacy-map.yaml policy.legacyPreservation.relabel.tagOnly" })),
    ...TAG_ONLY.map((l) => ({ name: l, kind: "foreign-label", usedBy: l === "Document" ? "shared Knowledge Services document lane (live document_* constraints); not a v2 label" : "deployment evidence node read by deployment tooling; not a v2 label", writers: ["owner outside this release"], projection: "excluded", agentWrite: "forbidden", source: "migration/legacy-map.yaml policy.legacyPreservation.relabel.tagOnlyReason" })),
    { name: "KsWriteFence", kind: "executor-marker", writers: ["native executor", "bks_migrator"], projection: "excluded", agentWrite: "forbidden", source: "INTERFACES.md section 6" },
    { name: "KsIntentMarker", kind: "executor-marker", writers: ["native executor", "bks_migrator"], projection: "excluded", agentWrite: "forbidden", source: "INTERFACES.md section 6" },
    { name: "KsReleaseMarker", kind: "executor-marker", writers: ["bks_migrator"], projection: "excluded", agentWrite: "forbidden", source: "INTERFACES.md sections 1 and 6" },
    { name: "KsRevocationFence", kind: "executor-marker", writers: ["native executor"], projection: "excluded", agentWrite: "forbidden", source: "S3-native-executor.md section 10 item 4 ({id: 'canonical', generation, updatedAt})" },
  ],
  relationshipTypes: [
    { name: "MIGRATED_FROM", class: "operational", from: "any v2 node created by the migration", to: "LegacyV0", properties: ["migrationRunId", "legacyElementId", "legacyId", "legacyLabel", "legacyExportDigest", "mapVersion"], writers: OP_WRITERS, projection: "excluded", agentWrite: "forbidden", typedReads: "excluded", source: "migration/legacy-map.yaml policy.legacyPreservation.migratedFrom" },
  ],
  properties: [
    { name: "legacyLabels", on: "LegacyV0", type: "[String!]", meaning: "original legacy labels of the preserved node", writers: OP_WRITERS, projection: "excluded", agentWrite: "forbidden", source: "migration/legacy-map.yaml policy.legacyPreservation.relabel.effect" },
    { name: "legacyExportDigest", on: "LegacyV0 | MIGRATED_FROM", type: "String (sha256:...)", meaning: "digest of the verified legacy export the migration ran from (rollback / accounting key)", writers: OP_WRITERS, projection: "excluded", agentWrite: "forbidden", source: "migration/legacy-map.yaml policy.legacyPreservation" },
  ],
  qualifierFamilies: [
    { family: "legacy:", members: ["legacy:recordedFrom=", "legacy:extractedAt=", "legacy:runId="], meaning: "source-stated legacy system metadata carried on migrated Assertions; never a v2 clock or run id", writers: OP_WRITERS, projection: "excluded", agentWrite: "forbidden", source: "migration/legacy-map.yaml (legacy:recordedFrom, legacy:runId; legacy:extractedAt for the legacy extraction time)" },
  ],
  markerShapes: {
    KsIntentMarker: "unique on markerKey (ks_intent_marker_key) = mk-<sha256(canonical{installationId, applicationId, tenantId, effectKey})> (S3 markerKeyOf); effectKey is the executor effect key or migration:<migrationRunId>:<batchId> for migration batches (indexed, ks_intent_marker_effect_key_lookup; no longer unique on its own); a migration batch is representable as markerKeyOf({installationId, applicationId: <migrator application id>, tenantId}, 'migration:<runId>:<batchId>'), so migrator markers share the executor's idempotence and must carry markerKey (Enterprise ks_intent_marker_key_exists); planRef = the plan ref, or the migrationRunId for migration batches (ks_intent_marker_plan_ref); persisted status applied|failed (applying is never committed; unresolved is a receipt outcome reconciled by lookup); also effectKey, scope, intentId, intentDigest, planDigest, attempts (JSON), receipt, receiptId, lastAttemptId, graphRevision",
    KsRevocationFence: "exactly one node {id: 'canonical', generation, updatedAt} (ks_revocation_fence_id; Enterprise ks_revocation_fence_generation_exists); the local revocation fence of the admission witness",
    KsReleaseMarker: "{releaseId (unique, ks_release_marker_release_id), schemaReleaseDigest, ddlDigest, installedAt (index ks_release_marker_installed), migrationRunId} written last by the migrator after DDL and migration checks; Enterprise existence constraints on releaseId, schemaReleaseDigest, ddlDigest, installedAt",
    KsWriteFence: "exactly one node {id: 'canonical', graphRevision, lockSeq, locked, lastEffectKey, lastWriterRunId, updatedAt} (ks_write_fence_id; Enterprise ks_write_fence_lock_seq_exists); every canonical write, migration batches included, takes the lock first with SET f.lockSeq = f.lockSeq + 1; graphRevision advances only when graph effects commit; locked is the executor's lock flag",
  },
  executorReconciliation: {
    rule: "ddl/required.cypher of the release is the single DDL authority; kg ensure-operations should apply loadRelease().ddl.required (and .enterprise on Enterprise) instead of its own operationalDdl() list",
    source: "packages/kg-ops/src/fence.ts operationalDdl() (S3)",
    adopted: [
      { s3: "ks_write_fence_id", release: "ks_write_fence_id", note: "same name and definition" },
      { s3: "ks_revocation_fence_id", release: "ks_revocation_fence_id", note: "same name and definition (new in v2.0.1)" },
      { s3: "ks_intent_marker_key", release: "ks_intent_marker_key", note: "same name and definition (new in v2.0.1); the v2.0.0 uniqueness on effectKey (ks_intent_marker_effect_key) is replaced by the index ks_intent_marker_effect_key_lookup; ddl.json migrationCommands drops the old constraint on graphs that received v2.0.0 DDL" },
      { s3: "rel_uid_<lowercase type> (relationshipUid per asserted type)", release: "rel_<TYPE>_uid", note: "same definition under the release naming scheme (rel_<TYPE>_assertion / _writer / _uid)" },
    ],
    notAdopted: [
      { s3: "ks_release_marker_id", release: "ks_release_marker_release_id", reason: "equivalent uniqueness already defined under the release name since v2.0.0; a second name would fail as an equivalent constraint" },
      { s3: "identifier_scheme_issuer_value", release: "identifier_key", reason: "equivalent (scheme, issuer, value) uniqueness already defined (query-patterns D-1)" },
      { s3: "claim_proposition_hash (index)", release: "claim_proposition_hash (uniqueness constraint)", reason: "the release defines Claim.propositionHash as UNIQUE under the same name; its backing index serves the lookup; S3's CREATE INDEX of the same name conflicts and must be dropped from operationalDdl()" },
      { s3: "capture_attempt_subject", release: "capture_subject", reason: "equivalent index already defined (query-patterns D-1)" },
      { s3: "activity_run (index on externalRunSystem, runId)", release: "activity_run (uniqueness constraint)", reason: "the release enforces (externalRunSystem, runId) uniqueness (kernel P2, one Activity per run) under the same name; the backing index serves the lookup" },
      { s3: "uid_<lowercase label>", release: "entity_uid + uid_<Label>", reason: "equivalent per-label uid uniqueness already defined; release names are stable since v2.0.0" },
    ],
  },
};
files.set("rules/operational-names.yaml", toYaml(operational, `# Operational names, release ${RELEASE}. Authored upstream (scripts/release/derive.mjs bootstrap); class operational, not ontology.\n`));

// ---- 3b. qualifier registry: the legacy: family (exact insertion before the top-level migrations key) ----
const legacyQuals = {
  "legacy:recordedFrom=": { name: "legacy:recordedFrom", separator: "=", valueGrammar: "iso-datetime (source-stated legacy record time, verbatim)", owner: "operational (S8 migration)", description: "Legacy system record time of the migrated element, kept verbatim; v2 recordedFrom is the migration commit time.", status: "registered", class: "operational", projection: "excluded", agentWrite: "forbidden", sources: ["migration/legacy-map.yaml commonEdgeProperties.recordedFrom", "rules/operational-names.yaml"] },
  "legacy:extractedAt=": { name: "legacy:extractedAt", separator: "=", valueGrammar: "iso-datetime (source-stated legacy extraction time, verbatim)", owner: "operational (S8 migration)", description: "Legacy extraction time stated by the legacy record; never a v2 observation or valid time.", status: "registered", class: "operational", projection: "excluded", agentWrite: "forbidden", sources: ["CUTOVER.md Compatibility decisions", "rules/operational-names.yaml"] },
  "legacy:runId=": { name: "legacy:runId", separator: "=", valueGrammar: "text (legacy mongoResearchRunId, verbatim)", owner: "operational (S8 migration)", description: "Legacy research run id (mongoResearchRunId) of the migrated element; the v2 lineage is the legacy research Activity (WAS_INFORMED_BY).", status: "registered", class: "operational", projection: "excluded", agentWrite: "forbidden", sources: ["migration/legacy-map.yaml commonProperties.mongoResearchRunId", "rules/operational-names.yaml"] },
};
const qPath = "vocabularies/qualifiers.yaml";
const qBefore = files.get(qPath);
const qBlock = toYaml({ qualifiers: legacyQuals }).replace(/^qualifiers:\n/, "");
let qAfter = replaceOnce(qBefore, "\nmigrations:\n", `\n${qBlock}migrations:\n`, "qualifiers legacy family");
qAfter = replaceOnce(qAfter, "  registered: 77\n", "  registered: 80\n  registeredOperational: 3\n", "qualifier counts");
qAfter = qAfter.replace(/^(#[^\n]*\n)*/, (h) => `${h}# ${RELEASE}: + the operational legacy: family (legacy:recordedFrom=, legacy:extractedAt=, legacy:runId=) registered by scripts/release/derive.mjs; class operational, excluded from projection, migrator-only.\n`);
files.set(qPath, qAfter);

// ---- 3c. projection rules: operational exclusions (appended top-level key) ----
const prPath = "rules/projection-rules.yaml";
const prBefore = files.get(prPath);
const prBlock = toYaml({ operationalExclusions: { releaseId: RELEASE, rule: "Every operational name of rules/operational-names.yaml is excluded from the consumer projection, from typed reads and from catalog templates; legacy nodes (LegacyV0) are never returned as v2 facts.", labels: operational.labels.map((l) => l.name), relationshipTypes: operational.relationshipTypes.map((r) => r.name), properties: operational.properties.map((p) => p.name), qualifierPrefixes: operational.qualifierFamilies.flatMap((f) => f.members), decision: "CUTOVER.md Compatibility decisions" } });
files.set(prPath, `${prBefore.replace(/\s*$/, "\n")}${prBlock}`);

// ---- 3d. executor policy: write denials in the ingestion rules ----
const irPath = "workspace-inputs/ingestion-rules.yaml";
const irBefore = files.get(irPath);
const denyLine = "  - No knowledge-agent proposal writes an operational name of rules/operational-names.yaml (LegacyV0, LegacyV0_<Label>, MIGRATED_FROM, legacyLabels, legacyExportDigest, legacy:* qualifiers, Ks* markers); only the migrator and executor internals write them, under the KsWriteFence.\n";
files.set(irPath, replaceOnce(irBefore, "  - No qualifier name outside vocabularies/qualifiers.yaml is written.\n", `  - No qualifier name outside vocabularies/qualifiers.yaml is written.\n${denyLine}`, "ingestion deny"));

// Verify the text edits are pure additions.
const eq = (a, b) => canonicalJson(a) === canonicalJson(b);
{
  const a = YAML.parse(qBefore);
  const b = YAML.parse(qAfter);
  const { qualifiers: qa, counts: ca, ...ra } = a;
  const { qualifiers: qb, counts: cb, ...rb } = b;
  if (!eq(ra, rb) || !eq({ ...qa, ...legacyQuals }, qb) || !eq({ ...ca, registered: 80, registeredOperational: 3 }, cb)) throw new Error("qualifiers.yaml edit is not a pure addition");
  const pa = YAML.parse(prBefore);
  const pb = YAML.parse(files.get(prPath));
  const { operationalExclusions, ...rest } = pb;
  if (!eq(pa, rest) || !operationalExclusions) throw new Error("projection-rules.yaml edit is not a pure addition");
  const ia = YAML.parse(irBefore);
  const ib = YAML.parse(files.get(irPath));
  if (!eq({ ...ia, deny: [...ia.deny, denyLine.slice(4, -1)] }, ib)) throw new Error("ingestion-rules.yaml edit is not a pure addition");
}

// ---- 4. compatibility source, release source, README ----
const compatibility = {
  format: "bks-compatibility-source.v1",
  releaseId: RELEASE,
  decisions: ["CUTOVER.md Compatibility decisions (lead)", "OD-22 (GDS optional)", "OD-44 (native vectors recorded, not served)", "S0-INVENTORY section 4 (live KS constraints)"],
  capabilities: {
    "chunk.write": { status: "unsupported", reason: "the live shared Knowledge Services Enterprise constraints on :Chunk (chunkId, chunkKey, index, text NOT NULL; chunkId/chunkKey unique) conflict with the v2 D9 Chunk shape; they belong to another authority and are not dropped or modified; v2 Chunk writes are unsupported in this release" },
    "legacy.nodes": { status: "present-excluded", reason: "LegacyV0 / LegacyV0_<Label> nodes, MIGRATED_FROM edges and legacy: qualifiers exist after the migration; they are excluded from the consumer projection, typed reads and catalog templates" },
    "analytics.gds-aga": { status: "disabled", reason: "OD-22: optional capability; no required DDL or supported template depends on it" },
    "vectors.native": { status: "disabled", reason: "OD-44: ddl/optional.cypher records the text-embedding-3-small/1536/cosine profile; not created or served in this release" },
    "graphql.mutations": { status: "unsupported", reason: "L2 (OD-02): no Mutation root; writes go through the native executor" },
  },
  liveConstraintsOwnedElsewhere: [
    { label: "Chunk", constraints: ["chunkId NOT NULL", "chunkKey NOT NULL", "index NOT NULL", "text NOT NULL", "chunkId UNIQUE", "chunkKey UNIQUE"], owner: "shared Knowledge Services ingestion", decision: "kept; v2 Chunk writes unsupported" },
    { label: "Document", constraints: ["document_* constraints (live)"], owner: "shared Knowledge Services ingestion", decision: "kept; Document nodes are tag-only LegacyV0 (original label kept)" },
    { label: "DocumentTextVersion", constraints: ["live KS constraints"], owner: "shared Knowledge Services ingestion", decision: "kept; not a v2 label" },
    { label: "Segmentation", constraints: ["live KS constraints"], owner: "shared Knowledge Services ingestion", decision: "kept; not a v2 label" },
  ],
  markers: {
    migrationMarkerKeys: "S8 migration batches claim KsIntentMarker {effectKey: migration:<migrationRunId>:<batchId>, planRef: <migrationRunId>} under S3's markerKey scheme: markerKey = mk-<sha256(canonical{installationId, applicationId: <migrator application id>, tenantId, effectKey})>; uniqueness is on markerKey (ks_intent_marker_key), effectKey stays indexed; the migrator must write markerKey (Enterprise existence constraint)",
    fences: "KsWriteFence {id: 'canonical', graphRevision, lockSeq, locked} and KsRevocationFence {id: 'canonical', generation} are singletons bootstrapped once by the migrator (ddl.json bootstrap)",
  },
  readCompatibility: {
    sdlBytesChanged: false,
    rule: `${RELEASE} and ${PARENT_ID} have identical SDL bytes, so the same schemaDigest; schemaReleaseDigest differs (operational registration, legacy map, DDL additions). Readers bound to ${PARENT_ID} keep working against a graph installed at ${RELEASE} (same domain schema; operational names are excluded from every read surface); writers and the migrator require an exact schemaReleaseDigest match with the installed KsReleaseMarker.`,
    ddlDelta: "adds ks_intent_marker_key, ks_intent_marker_effect_key_lookup, ks_revocation_fence_id, ks_intent_marker_plan_ref, legacy_v0_export_digest and rel_<TYPE>_uid (required) plus marker/fence existence constraints (Enterprise); replaces the v2.0.0 uniqueness ks_intent_marker_effect_key by the markerKey uniqueness (drop command in ddl.json migrationCommands); every other v2.0.0 statement is unchanged",
  },
};
files.set("rules/compatibility.yaml", toYaml(compatibility, `# Compatibility decisions for ${RELEASE} (source of compatibility.json and COMPATIBILITY.md, generated).\n`));
const releaseSource = {
  format: "bks-release-source.v1",
  releaseId: RELEASE,
  version: "2.0.1",
  createdAt: CREATED_AT,
  sdlHeaderReleaseId: PARENT_ID,
  description: `Patch release of ${PARENT_ID}: operational registration only (legacy map hosted as a frozen file, LegacyV0 / MIGRATED_FROM / legacy: operational names, migration marker DDL, compatibility matrix). No ontology change: the SDL bytes and schemaDigest are those of ${PARENT_ID}.`,
  parentRelease: { releaseId: PARENT_ID, schemaDigest: parent.identities.schemaDigest, contentTreeDigest: parent.identities.contentTreeDigest, schemaReleaseDigest: sha256Tagged(canonicalJson(parent)) },
  releaseNotes: [
    "migration/legacy-map.yaml: S8's live legacy biotech-kg map hosted verbatim and moved into the frozen digest set (excludedFromFrozenDigestSet is empty)",
    "rules/operational-names.yaml: LegacyV0, LegacyV0_<Label> (17 relabels + 2 reserved), MIGRATED_FROM, legacyLabels, legacyExportDigest, the legacy: qualifier family and the Ks* markers registered as operational (not SDL)",
    "vocabularies/qualifiers.yaml: + legacy:recordedFrom=, legacy:extractedAt=, legacy:runId= (operational)",
    "rules/projection-rules.yaml: + operationalExclusions; workspace-inputs/ingestion-rules.yaml: + operational write denial",
    "ddl: + ks_intent_marker_plan_ref, legacy_v0_export_digest (required); + KsReleaseMarker existence constraints (Enterprise); ddl.json markerShapes",
    "ddl (S3 executor deltas): KsIntentMarker unique on markerKey (ks_intent_marker_key; effectKey uniqueness replaced by the ks_intent_marker_effect_key_lookup index, drop command in migrationCommands), KsRevocationFence (ks_revocation_fence_id), relationshipUid per asserted type (rel_<TYPE>_uid), KsWriteFence lockSeq/locked documented; ddl.json executorReconciliation lists the S3 statements adopted and not adopted",
    "COMPATIBILITY.md / compatibility.json: supported matrix, Chunk writes unsupported, legacy present and excluded, GDS/AGA and native vectors disabled, read compatibility",
  ],
  excludedFromFrozenDigestSet: {},
  additionalInputs: { legacyMap: { path: LEGACY_MAP_SOURCE, sha256: LEGACY_MAP_SHA256, author: "S8 (migration / qualification)", note: "untracked in BKS at bksCommit; hosted verbatim; its target block still names the parent release and a ${SCHEMA_RELEASE_DIGEST} placeholder: the binding authority is this release.json" } },
};
files.set("release-source.yaml", toYaml(releaseSource, `# Release source configuration (read by scripts/release/generate.mjs).\n`));
files.set("README.md", `# ${RELEASE}

Patch release of [\`${PARENT_ID}\`](../${PARENT_ID}/README.md): **operational registration only, no ontology change**. The SDL bytes are those of ${PARENT_ID}, so \`schemaDigest\` is unchanged; \`schemaReleaseDigest\` differs. ${PARENT_ID} stays immutable.

What changed (\`release-source.yaml\` releaseNotes): S8's live legacy map is hosted verbatim as a frozen file (\`migration/legacy-map.yaml\`); the migration's operational names (\`LegacyV0\`, \`LegacyV0_<Label>\`, \`MIGRATED_FROM\`, \`legacyLabels\`, \`legacyExportDigest\`, the \`legacy:\` qualifier family, the \`Ks*\` markers) are registered in \`rules/operational-names.yaml\`, excluded from the consumer projection and from ordinary agent writes, and kept out of the SDL; the operational DDL gains the migration marker lookups; \`COMPATIBILITY.md\` / \`compatibility.json\` state the supported matrix and the disabled or unsupported capabilities (v2 \`Chunk\` writes unsupported because of the live Knowledge Services constraints).

Layout and commands are those of ${PARENT_ID} (see its README), with \`release-source.yaml\`, \`rules/operational-names.yaml\`, \`rules/compatibility.yaml\`, \`compatibility.json\` and \`COMPATIBILITY.md\` added. Reproduce from biotech-knowledge-services:

\`\`\`text
node scripts/release/derive.mjs --from ../biotech-meta/docs/schema/releases/${PARENT_ID} --to ../biotech-meta/docs/schema/releases/${RELEASE} --check
node scripts/release/generate.mjs --release ../biotech-meta/docs/schema/releases/${RELEASE} --check
node scripts/release/verify.mjs --release ../biotech-meta/docs/schema/releases/${RELEASE}
pnpm schema:pin -- --release ../biotech-meta/docs/schema/releases/${RELEASE} --pinned-at <YYYY-MM-DD>
\`\`\`

Research only, not medical advice.
`);

if (existsSync(resolve(to, "release.json"))) {
  const cur = readJson(resolve(to, "release.json"));
  if (cur.releaseId !== RELEASE) throw new Error(`target holds ${cur.releaseId}`);
}
if (flag("--check")) {
  const drift = [...files].filter(([p, t]) => !existsSync(resolve(to, p)) || readText(resolve(to, p)) !== t).map(([p]) => p);
  console.log(JSON.stringify({ ok: drift.length === 0, to, files: files.size, drift }, null, 2));
  process.exit(drift.length ? 1 : 0);
}
const changed = writeTree(to, files);
console.log(JSON.stringify({ ok: true, from, to, files: files.size, carried: carried.length, changed: changed.length }, null, 2));
