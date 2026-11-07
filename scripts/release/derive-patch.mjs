#!/usr/bin/env node
/**
 * Derives a patch release from a frozen parent (the parent is never edited):
 *
 *   node scripts/release/derive-patch.mjs --from <parent release dir> --to <new release dir> [--check]
 *
 * Copies every non-generated parent file forward byte for byte (digest-checked against the parent release.json), then
 * applies the recorded delta of the target release (PATCHES below). Then run scripts/release/generate.mjs on the new dir.
 * biotech-schema-v2.0.1 was derived by scripts/release/derive.mjs; this script starts at v2.0.2.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { arg, BKS_ROOT, canonicalJson, flag, PLAN_DIR, readJson, readText, sha256Tagged, toYaml, writeTree, YAML } from "./lib/common.mjs";

const PATCHES = {
  "biotech-schema-v2.0.2": {
    parent: "biotech-schema-v2.0.1",
    createdAt: "2026-10-12T02:00:00.000Z",
    apply(files, parent, parentDigest) {
      const id = "biotech-schema-v2.0.2";
      // 1. DDL installer phases and blocked statements (new source).
      const policy = {
        format: "bks-ddl-policy.v1",
        releaseId: id,
        rule: "Pre-migration: every statement that holds on a graph that still carries preserved legacy rows. Post-migration: constraints that cannot hold while legacy rows still carry the label or relationship type: uid_exists_<Label> for the legacy labels that are also stored v2 labels (legacy rows keep them until the migration relabels them to LegacyV0_<Label>) and the rel_<TYPE>_assertion_exists family (preserved legacy edges of a v2 type carry no assertionUid). Everything else is pre-migration.",
        decision: "lead, migration rehearsal on biotech-schema-v2.0.1 (both editions, 59/59 invariants, rollback byte-identical)",
        postMigration: { uidExistsLabels: ["Biomarker", "Event", "LabTest", "Organization", "Person", "Product", "Study"], relationshipFamilies: ["rel_<TYPE>_assertion_exists"] },
        exceptions: [
          {
            name: "rel_MEASURES_assertion_exists",
            status: "blocked-by-legacy-data",
            reason: "45 preserved legacy MEASURES edges (LabTest -> Biomarker) carry no assertionUid; a relationship type cannot change without deleting the edge, and legacy data is never deleted in this release",
            enforcedInstead: "the native executor requires assertionUid on every new MEASURES write (asserted class, AssertedRecordedProperties)",
            enablingCondition: "retirement of the 45 legacy MEASURES edges by a later admitted migration (legacy edge retirement with retained export and lineage); then the constraint is installed in the post-migration phase",
          },
        ],
      };
      files.set("rules/ddl-policy.yaml", toYaml(policy, `# DDL installer phases and exceptions, release ${id} (read by scripts/release/generate.mjs; authored upstream).\n`));
      // 2. Compatibility source: the vector-gated templates and the new DDL delta.
      const compat = YAML.parse(files.get("rules/compatibility.yaml"));
      compat.releaseId = id;
      compat.decisions = [...compat.decisions, "lead: DDL phases, MEASURES assertionUid exception, vector-gated templates (2026-10-12)"];
      compat.capabilities["vectors.native"].reason += "; the catalog templates that need the vector index (D9/Q-D9-20#vector, QP/P-04a) are unsupported with requires: [vectors.native] and excluded from the supported count";
      compat.readCompatibility.rule = compat.readCompatibility.rule.replaceAll("biotech-schema-v2.0.1", id);
      compat.readCompatibility.ddlDelta = "v2.0.2 against v2.0.1: no statement added or changed; every statement carries phase pre-migration | post-migration (ddl.json) with generated phase views ddl/{required,enterprise}.{pre,post}.cypher; rel_MEASURES_assertion_exists is blocked-by-legacy-data and not installed (ddl.json exceptions)";
      files.set("rules/compatibility.yaml", toYaml(compat, `# Compatibility decisions for ${id} (source of compatibility.json and COMPATIBILITY.md, generated).\n`));
      // 3. Operational names: same registry, release id updated.
      const op = YAML.parse(files.get("rules/operational-names.yaml"));
      op.releaseId = id;
      files.set("rules/operational-names.yaml", toYaml(op, `# Operational names, release ${id}. Authored upstream (carried from biotech-schema-v2.0.1); class operational, not ontology.\n`));
      // 4. The reads role's (S4) catalog patch and executed question status, hosted verbatim as catalog sources.
      const s4 = [
        ["reports/S4-catalog-patch.json", "query-catalog/sources/s4/catalog-patch.json"],
        ["reports/S4-question-status.json", "query-catalog/sources/s4/question-status.json"],
      ].map(([src, dst]) => {
        const bytes = readFileSync(resolve(PLAN_DIR, src));
        files.set(dst, bytes.toString("utf8"));
        return { source: `docs/plans/schema-v2-service-release/${src}`, path: dst, sha256: createHash("sha256").update(bytes).digest("hex"), author: "S4 (native reads)" };
      });
      // 5. Release source.
      const prevSource = YAML.parse(files.get("release-source.yaml"));
      const source = {
        format: "bks-release-source.v1",
        releaseId: id,
        version: "2.0.2",
        createdAt: this.createdAt,
        sdlHeaderReleaseId: prevSource.sdlHeaderReleaseId,
        description: `Patch release of ${parent.releaseId}: DDL installer phases (pre-/post-migration views), the MEASURES assertionUid constraint blocked by preserved legacy data, and the vector-gated catalog templates marked unsupported. No ontology change: SDL bytes and schemaDigest are those of biotech-schema-v2.0.0.`,
        parentRelease: { releaseId: parent.releaseId, schemaDigest: parent.identities.schemaDigest, contentTreeDigest: parent.identities.contentTreeDigest, schemaReleaseDigest: parentDigest },
        releaseNotes: [
          "ddl.json: every statement carries phase pre-migration | post-migration; generated views ddl/required.pre.cypher, required.post.cypher, enterprise.pre.cypher, enterprise.post.cypher (combined files kept); installer order pre -> migration -> post -> release marker (COMPATIBILITY.md)",
          "ddl.json exceptions: rel_MEASURES_assertion_exists blocked-by-legacy-data (45 preserved legacy MEASURES edges without assertionUid; not installed; executor enforces assertionUid on new MEASURES writes); enabling condition: retirement of the legacy edges by a later admitted migration",
          "query catalog: templates that require the optional OD-44 vector index are unsupported with requires: [vectors.native] and excluded from the supported count",
          "query catalog: S4 catalog patch applied (8 corrections: AllNodesScan fixes for K/CQ-AX-04, K/Q-K-23, D9/CQ-RC-05, D12/Q-D12-18, QP/P-10a.4, QP/P-10c.2; Q-D5-20 :Subjectable -> :Entity; Q-D9-02 replaced by the P-09 behind set, MD-D9-03 d; 4 proposed templates K/Q-K-09, K/Q-K-11, K/Q-K-12#identifiers, K/Q-K-12#carrier); question status regenerated from S4's executed result assertions",
        ],
        catalogCapabilityGates: { "OD-44": "vectors.native" },
        catalogPatch: "query-catalog/sources/s4/catalog-patch.json",
        questionStatus: "query-catalog/sources/s4/question-status.json",
        excludedFromFrozenDigestSet: {},
        additionalInputs: { ...prevSource.additionalInputs, s4CatalogPatch: s4[0], s4QuestionStatus: s4[1] },
      };
      files.set("release-source.yaml", toYaml(source, `# Release source configuration (read by scripts/release/generate.mjs).\n`));
      files.set("README.md", `# ${id}

Patch release of [\`${parent.releaseId}\`](../${parent.releaseId}/README.md): **installer and capability metadata only, no ontology change**. SDL bytes are those of biotech-schema-v2.0.0 (same \`schemaDigest\`); \`schemaReleaseDigest\` differs. Earlier releases stay immutable.

What changed (\`release-source.yaml\` releaseNotes): every DDL statement carries an installer phase (\`ddl.json\` \`phase\`), with generated phase views \`ddl/required.pre.cypher\`, \`ddl/required.post.cypher\`, \`ddl/enterprise.pre.cypher\` and \`ddl/enterprise.post.cypher\` next to the combined files; \`rel_MEASURES_assertion_exists\` is blocked by preserved legacy data and not installed (\`ddl.json\` \`exceptions\`, \`compatibility.json\` \`ddlExceptions\`); the catalog templates that need the optional OD-44 vector index are unsupported (\`requires: [vectors.native]\`); the reads role's catalog patch (\`query-catalog/sources/s4/catalog-patch.json\`) corrects 8 templates and adds 4, and question status comes from its executed result assertions (\`query-catalog/sources/s4/question-status.json\`). Installer order (COMPATIBILITY.md): pre-migration DDL, migration, post-migration DDL, release marker.

Reproduce from biotech-knowledge-services:

\`\`\`text
node scripts/release/derive-patch.mjs --from ../biotech-meta/docs/schema/releases/${parent.releaseId} --to ../biotech-meta/docs/schema/releases/${id} --check
node scripts/release/generate.mjs --release ../biotech-meta/docs/schema/releases/${id} --check
node scripts/release/verify.mjs --release ../biotech-meta/docs/schema/releases/${id}
pnpm schema:pin -- --release ../biotech-meta/docs/schema/releases/${id} --pinned-at <YYYY-MM-DD>
\`\`\`

Research only, not medical advice.
`);
    },
  },
};

const from = resolve(arg("--from") ?? "");
const to = resolve(arg("--to") ?? "");
if (!arg("--from") || !arg("--to")) {
  console.error("usage: node scripts/release/derive-patch.mjs --from <parent release dir> --to <new release dir> [--check]");
  process.exit(2);
}
const targetId = basename(to);
const patch = PATCHES[targetId];
if (!patch) throw new Error(`no recorded patch for ${targetId}`);
const parent = readJson(resolve(from, "release.json"));
if (parent.releaseId !== patch.parent) throw new Error(`parent is ${parent.releaseId}, expected ${patch.parent}`);
const sha = (b) => createHash("sha256").update(b).digest("hex");
const files = new Map();
for (const [p, e] of Object.entries({ ...parent.files, ...parent.excludedFromFrozenDigestSet })) {
  if (e.role === "generated") continue;
  // Evidence (EXPLAIN results) is produced for the target by scripts/release/explain-catalog.mjs; the parent's copy only
  // seeds a target that has none yet.
  if (e.role === "evidence" && existsSync(resolve(to, p))) continue;
  const b = readFileSync(resolve(from, p));
  if (sha(b) !== e.sha256) throw new Error(`parent file ${p} does not match its release.json digest`);
  files.set(p, b.toString("utf8"));
}
patch.apply(files, parent, sha256Tagged(canonicalJson(parent)));
if (existsSync(resolve(to, "release.json")) && readJson(resolve(to, "release.json")).releaseId !== targetId) throw new Error("target holds another release");
if (flag("--check")) {
  const drift = [...files].filter(([p, t]) => !existsSync(resolve(to, p)) || readText(resolve(to, p)) !== t).map(([p]) => p);
  console.log(JSON.stringify({ ok: drift.length === 0, to, files: files.size, drift }, null, 2));
  process.exit(drift.length ? 1 : 0);
}
const changed = writeTree(to, files);
console.log(JSON.stringify({ ok: true, from, to, files: files.size, changed: changed.length }, null, 2));
