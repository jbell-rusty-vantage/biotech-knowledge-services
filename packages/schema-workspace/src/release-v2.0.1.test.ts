/**
 * v2.0.1 staging (S1): the staged upstream patch release loads as an explicit override without touching schema/pinned,
 * keeps the v2.0.0 SDL bytes (same schemaDigest, different schemaReleaseDigest), hosts the legacy map as a frozen file,
 * and registers the migration's operational names as non-domain names.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { pinnedDir, repoRoot } from "./load.js";
import { classifyName, loadRelease } from "./release.js";
import { loadSidecars, validateSidecars } from "./sidecars.js";

vi.setConfig({ testTimeout: 60_000, hookTimeout: 60_000 });

const releases = resolve(repoRoot, "..", "biotech-meta", "docs", "schema", "releases");
const staged = resolve(releases, "biotech-schema-v2.0.1");
const parentDir = resolve(releases, "biotech-schema-v2.0.0");
const present = existsSync(resolve(staged, "release.json")) && existsSync(resolve(parentDir, "release.json"));

// vitest still runs a skipped describe body while collecting, and this body loads the absent upstream releases, so
// the absent case registers an explicitly reasoned skip instead of collecting the body.
if (!present) describe.skip("staged release biotech-schema-v2.0.1 (skipped: ../biotech-meta is absent; it is the retired upstream schema home (history only since SV-D10 made this repository the schema author))", () => {
  it("needs ../biotech-meta/docs/schema/releases/biotech-schema-v2.0.1", () => {});
});
else describe("staged release biotech-schema-v2.0.1", () => {
  const pinBefore = readFileSync(resolve(pinnedDir, "PIN.json"));
  const pinMtime = statSync(resolve(pinnedDir, "PIN.json")).mtimeMs;
  // The parent is read from its immutable upstream directory, so these tests hold before and after the lead re-pins.
  const pinned = loadRelease({ dir: parentDir, cache: false });
  const r = loadRelease({ dir: staged, cache: false });

  it("loads as a verified override and leaves schema/pinned untouched", () => {
    expect(r.source).toBe("override");
    expect(r.manifest.releaseId).toBe("biotech-schema-v2.0.1");
    expect(r.pin).toBeNull();
    expect(pinned.source).toBe("override");
    expect(readFileSync(resolve(pinnedDir, "PIN.json")).equals(pinBefore)).toBe(true);
    expect(statSync(resolve(pinnedDir, "PIN.json")).mtimeMs).toBe(pinMtime);
    expect(pinned.manifest.releaseId).toBe("biotech-schema-v2.0.0");
  });

  it("keeps the v2.0.0 SDL bytes: same schemaDigest, different schemaReleaseDigest", () => {
    expect(r.schemaDigest).toBe("sha256:fe2cc50afb4a48e16a2b5c3c37378b4d00a679a06d37bf312676c45c65c6589a");
    expect(r.schemaDigest).toBe(pinned.schemaDigest);
    expect(r.sdl).toBe(pinned.sdl);
    expect(r.schemaReleaseDigest).not.toBe(pinned.schemaReleaseDigest);
    expect((r.manifest.parentRelease as { schemaReleaseDigest: string }).schemaReleaseDigest).toBe(pinned.schemaReleaseDigest);
  });

  it("hosts the S8 legacy map in the frozen digest set", () => {
    expect(r.manifest.files["migration/legacy-map.yaml"]?.sha256).toBe("a78218f983379eaefd25bf1ed8952b41f01af693b6d4f0ac1267b3f84568f32b");
    expect(Object.keys(r.manifest.excludedFromFrozenDigestSet)).toEqual([]);
    expect(r.manifest.files["compatibility.json"]).toBeDefined();
    const compat = JSON.parse(r.text("compatibility.json"));
    expect(compat.capabilities["chunk.write"].status).toBe("unsupported");
    expect(compat.readCompatibility.schemaDigestEqualToParent).toBe(true);
  });

  it("recognizes the legacy operational names as non-domain (not in the SDL, excluded, not agent-writable)", () => {
    const op = r.operationalNames!;
    expect(op.projection).toBe("excluded");
    expect(op.agentWrite).toBe("forbidden");
    for (const l of ["LegacyV0", "LegacyV0_Product", "LegacyV0_Organization", "LegacyV0_Study"]) expect(classifyName(r, l)).toBe("operational-label");
    expect(op.labels.filter((l) => l.startsWith("LegacyV0_"))).toHaveLength(19);
    expect(classifyName(r, "MIGRATED_FROM")).toBe("operational-relationship");
    expect(classifyName(r, "legacyLabels")).toBe("operational-property");
    expect(classifyName(r, "legacyExportDigest")).toBe("operational-property");
    expect(classifyName(r, "legacy:recordedFrom=2024-01-01T00:00:00Z")).toBe("operational-qualifier");
    expect(classifyName(r, "Product")).toBe("node-type");
    expect(classifyName(r, "Entity")).toBe("label");
    expect(classifyName(pinned, "LegacyV0")).toBe("unknown");
    for (const n of op.labels) expect(r.ir.nodes.some((x) => x.storedLabels.includes(n)), n).toBe(false);
    expect(r.sdl).not.toMatch(/LegacyV0|MIGRATED_FROM/);
    expect(r.ir.qualifierGrammar["legacy:runId="]?.status).toBe("registered");
    const excl = (r.rules["projection-rules"] as { operationalExclusions: { labels: string[] } }).operationalExclusions;
    expect(excl.labels).toContain("LegacyV0_Product");
    const deny = (r.workspaceInputs.parsed["ingestion-rules.yaml"] as { deny: string[] }).deny;
    expect(deny.some((d) => d.includes("MIGRATED_FROM"))).toBe(true);
  });

  it("validates its workspace inputs against its own IR with zero errors", () => {
    expect(validateSidecars(r.ir, loadSidecars(r.workspaceInputs.dir))).toEqual([]);
  });

  it("covers the migrator's marker usage in the operational DDL", () => {
    const names = new Set(r.ddl.manifest.statements.map((s) => s.name));
    expect(names.has("ks_intent_marker_effect_key")).toBe(false); // uniqueness moved to markerKey (S3)
    const marker = r.ddl.manifest.statements.find((s) => s.name === "ks_intent_marker_key")!;
    expect([marker.type, marker.properties.join(","), marker.requirement]).toEqual(["UNIQUENESS", "markerKey", "required"]);
    for (const n of ["ks_intent_marker_effect_key_lookup", "ks_revocation_fence_id", "claim_proposition_hash", "capture_subject", "activity_run", "identifier_key", "ks_intent_marker_key_exists", "ks_revocation_fence_generation_exists", "ks_write_fence_lock_seq_exists"]) expect(names.has(n), n).toBe(true);
    for (const t of r.ir.relationshipTypes.filter((x) => x.class === "asserted")) expect(names.has(`rel_${t.type}_uid`), t.type).toBe(true);
    expect(r.operationalNames!.labels).toContain("KsRevocationFence");
    for (const n of ["ks_intent_marker_plan_ref", "ks_release_marker_release_id", "ks_release_marker_installed", "ks_write_fence_id", "legacy_v0_export_digest", "ks_release_marker_ddl_digest_exists", "ks_release_marker_digest_exists"]) expect(names.has(n), n).toBe(true);
    const shapes = (r.ddl.manifest as unknown as { markerShapes: Record<string, string> }).markerShapes;
    expect(shapes.KsIntentMarker).toContain("migration:<migrationRunId>:<batchId>");
    expect(shapes.KsIntentMarker).toContain("markerKey");
    expect(shapes.KsWriteFence).toContain("lockSeq");
    expect(shapes.KsRevocationFence).toContain("generation");
    const recon = (r.ddl.manifest as unknown as { executorReconciliation: { adopted: unknown[]; notAdopted: unknown[] } }).executorReconciliation;
    expect(recon.adopted.length + recon.notAdopted.length).toBe(10);
    expect(r.text("COMPATIBILITY.md")).toContain("markerKey");
    for (const k of ["releaseId", "schemaReleaseDigest", "ddlDigest", "installedAt", "migrationRunId"]) expect(shapes.KsReleaseMarker).toContain(k);
  });
});
