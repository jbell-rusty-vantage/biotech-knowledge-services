/**
 * v2.0.2 staging (S1): DDL installer phases, the MEASURES assertionUid exception and the vector-gated catalog templates.
 * The staged release loads as an explicit override; schema/pinned is not touched.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { pinnedDir, repoRoot } from "./load.js";
import { loadRelease } from "./release.js";

vi.setConfig({ testTimeout: 60_000, hookTimeout: 60_000 });

const releases = resolve(repoRoot, "..", "biotech-meta", "docs", "schema", "releases");
const staged = resolve(releases, "biotech-schema-v2.0.2");
const parentDir = resolve(releases, "biotech-schema-v2.0.1");
const present = existsSync(resolve(staged, "release.json")) && existsSync(resolve(parentDir, "release.json"));

type Stmt = { name: string; phase?: string; status?: string; file: string | null; phaseFile?: string; statement: string; edition: string; requirement: string };

// vitest still runs a skipped describe body while collecting, and this body loads the absent upstream releases, so
// the absent case registers an explicitly reasoned skip instead of collecting the body.
if (!present) describe.skip("staged release biotech-schema-v2.0.2 (skipped: ../biotech-meta is absent; it is the retired upstream schema home (history only since SV-D10 made this repository the schema author))", () => {
  it("needs ../biotech-meta/docs/schema/releases/biotech-schema-v2.0.2", () => {});
});
else describe("staged release biotech-schema-v2.0.2", () => {
  const pinBefore = readFileSync(resolve(pinnedDir, "PIN.json"));
  const r = loadRelease({ dir: staged, cache: false });
  const parent = loadRelease({ dir: parentDir, cache: false });
  const ddl = r.ddl.manifest as unknown as { statements: Stmt[]; phases: { order: string[]; postMigrationUidExistsLabels: string[] }; exceptions: Array<{ name: string; status: string; enablingCondition: string }> };
  const text = (p: string) => r.text(p);

  it("loads as an override with the parent's SDL bytes and leaves schema/pinned untouched", () => {
    expect(r.source).toBe("override");
    expect(r.manifest.releaseId).toBe("biotech-schema-v2.0.2");
    expect(r.schemaDigest).toBe(parent.schemaDigest);
    expect(r.schemaReleaseDigest).not.toBe(parent.schemaReleaseDigest);
    expect(readFileSync(resolve(pinnedDir, "PIN.json")).equals(pinBefore)).toBe(true);
  });

  it("phases every DDL statement and emits the phase views as exact partitions of the combined files", () => {
    for (const s of ddl.statements) expect(["pre-migration", "post-migration"], s.name).toContain(s.phase);
    const post = ddl.statements.filter((s) => s.phase === "post-migration");
    for (const s of post) expect(/^uid_exists_|^rel_.+_assertion_exists$/.test(s.name), s.name).toBe(true);
    expect(post.filter((s) => s.name.startsWith("uid_exists_")).map((s) => s.name.slice("uid_exists_".length)).sort()).toEqual([...ddl.phases.postMigrationUidExistsLabels].sort());
    const bodies = (p: string) => text(p).split("\n").filter((l) => l.startsWith("CREATE ")).sort();
    expect([...bodies("ddl/required.pre.cypher"), ...bodies("ddl/required.post.cypher")].sort()).toEqual(bodies("ddl/required.cypher"));
    expect([...bodies("ddl/enterprise.pre.cypher"), ...bodies("ddl/enterprise.post.cypher")].sort()).toEqual(bodies("ddl/enterprise.cypher"));
    for (const s of ddl.statements.filter((x) => x.phaseFile)) expect(text(s.phaseFile!), s.name).toContain(`${s.statement};`);
    expect(ddl.phases.order[0]).toMatch(/^pre-migration/);
    expect(ddl.phases.order[3]).toMatch(/KsReleaseMarker/);
    expect(r.text("COMPATIBILITY.md")).toContain("Installer order");
  });

  it("does not install rel_MEASURES_assertion_exists (blocked by preserved legacy data)", () => {
    const m = ddl.statements.find((s) => s.name === "rel_MEASURES_assertion_exists")!;
    expect(m.status).toBe("blocked-by-legacy-data");
    expect(m.file).toBeNull();
    for (const p of ["ddl/enterprise.cypher", "ddl/enterprise.pre.cypher", "ddl/enterprise.post.cypher"]) expect(text(p)).not.toContain("rel_MEASURES_assertion_exists");
    expect(ddl.exceptions.map((x) => x.name)).toEqual(["rel_MEASURES_assertion_exists"]);
    const compat = JSON.parse(text("compatibility.json"));
    expect(compat.ddlExceptions[0].enablingCondition).toMatch(/retirement/);
  });

  it("marks the vector-gated templates unsupported and excludes them from the supported count", () => {
    const catalog = r.queryCatalog as { templates: Array<{ id: string; status: string; requires?: string[]; requiredIndexes: string[] }>; counts: { templatesByStatus: Record<string, number> } };
    const gated = catalog.templates.filter((t) => t.requires);
    expect(gated.map((t) => t.id).sort()).toEqual(["D9/Q-D9-20#vector", "QP/P-04a"]);
    for (const t of gated) {
      expect(t.status).toBe("unsupported");
      expect(t.requires).toEqual(["vectors.native"]);
    }
    for (const t of catalog.templates.filter((x) => x.status === "supported")) expect(t.requiredIndexes.some((n) => /_embedding$/.test(n)), t.id).toBe(false);
    const parentCounts = (parent.queryCatalog as { counts: { templatesByStatus: Record<string, number> } }).counts.templatesByStatus;
    // 120 (v2.0.1) - 2 vector-gated + Q-D5-20 (stored-label fix) + 4 proposed templates (S4 patch).
    expect(catalog.counts.templatesByStatus.supported).toBe(parentCounts.supported! - 2 + 1 + 4);
  });

  it("applies the reads role's catalog patch with digest checks and EXPLAIN evidence (no AllNodesScan)", () => {
    type T = { id: string; status: string; statement: string; statementDigest: string; patch?: { releasedStatementDigest?: string; proposed?: boolean }; validation: { explain: string; planFlags?: string[] } };
    const catalog = r.queryCatalog as { templates: T[]; catalogPatchSource: { path: string }; questionStatusSource: { path: string }; counts: { questionsByStatus: Record<string, number> }; questions: Array<{ id: string; status: string }> };
    const patch = JSON.parse(r.text(catalog.catalogPatchSource.path)) as { corrections: Array<{ id: string; statement: string; releasedStatementDigest: string }>; proposedTemplates: Array<{ id: string; statement: string }> };
    expect(patch.corrections).toHaveLength(8);
    expect(patch.proposedTemplates).toHaveLength(4);
    const parentTemplates = new Map((parent.queryCatalog as { templates: T[] }).templates.map((t) => [t.id, t]));
    for (const c of patch.corrections) {
      const t = catalog.templates.find((x) => x.id === c.id)!;
      expect(t.statement, c.id).toBe(c.statement);
      expect(parentTemplates.get(c.id)!.statementDigest).toBe(c.releasedStatementDigest);
      expect(t.patch?.releasedStatementDigest).toBe(c.releasedStatementDigest);
      expect(t.validation.explain, c.id).toBe("ok");
      expect(t.validation.planFlags ?? [], c.id).not.toContain("AllNodesScan");
    }
    for (const p of patch.proposedTemplates) {
      const t = catalog.templates.find((x) => x.id === p.id)!;
      expect([t.status, t.validation.explain, t.patch?.proposed], p.id).toEqual(["supported", "ok", true]);
    }
    for (const t of catalog.templates) expect(t.validation.planFlags ?? [], t.id).not.toContain("AllNodesScan");
    expect(catalog.counts.questionsByStatus).toEqual({ held: 391, supported: 54, unsupported: 9 });
    for (const q of ["Q-K-09", "Q-K-11", "Q-K-12"]) expect(catalog.questions.find((x) => x.id === q)?.status, q).toBe("supported");
    expect(r.manifest.files[catalog.questionStatusSource.path]).toBeDefined();
  });
});
