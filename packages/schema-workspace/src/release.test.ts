/**
 * Gate A evidence for the schema release (S1): pinned bundle verification, tamper / missing-override failure, IR v2
 * agreement with registers and vocabularies, decision coverage, catalog EXPLAIN evidence and deterministic generation.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, it, vi } from "vitest";
import { pinnedDir, repoRoot } from "./load.js";
import { clearReleaseCache, loadRelease, ReleaseError } from "./release.js";
import { loadSidecars, validateSidecars } from "./sidecars.js";

// Full parallel `pnpm test` runs (all projects) starve these I/O-heavy tests; 5 s defaults time out (S3 report). Every
// test here gets 60 s; the byte-for-byte regeneration and YAML parity tests set larger explicit budgets.
vi.setConfig({ testTimeout: 60_000, hookTimeout: 60_000 });

const bundle = loadRelease();
const ir = bundle.ir;
const tmpRoots: string[] = [];
const tmp = (prefix: string) => {
  const d = mkdtempSync(join(tmpdir(), prefix));
  tmpRoots.push(d);
  return d;
};
afterAll(() => {
  for (const d of tmpRoots) rmSync(d, { recursive: true, force: true });
});

function expectReleaseError(fn: () => unknown, code: string): ReleaseError {
  try {
    fn();
  } catch (e) {
    expect(e).toBeInstanceOf(ReleaseError);
    expect((e as ReleaseError).code).toBe(code);
    expect((e as ReleaseError).bksCode).toBe(`BKS_${code}`);
    return e as ReleaseError;
  }
  throw new Error(`expected ${code}`);
}

describe("pinned release bundle", () => {
  it("loads the pinned biotech-schema-v2.x release from PIN.json bks-pin.v2 with every byte verified", () => {
    expect(bundle.source).toBe("pinned");
    expect(bundle.pin?.pinFormat).toBe("bks-pin.v2");
    expect(bundle.manifest.releaseId).toMatch(/^biotech-schema-v2\.\d+\.\d+$/);
    expect(bundle.pin?.schemaReleaseDigest).toBe(bundle.schemaReleaseDigest);
    expect(bundle.schemaDigest).toBe(bundle.manifest.identities.schemaDigest);
    expect(ir.schemaDigest).toBe(bundle.schemaDigest);
    expect(Object.keys(bundle.files).length).toBe(Object.keys(bundle.pin!.files).length);
  });

  it("never reuses the candidate baseline digest for the corrected SDL", () => {
    expect(bundle.manifest.parentBaseline.schemaDigest).toBe("sha256:c7cf1235dba876b26460c54a6510028d2dcfc65989787eacd5b446f9034b4793");
    expect(bundle.schemaDigest).not.toBe(bundle.manifest.parentBaseline.schemaDigest);
  });

  it("detects a flipped byte in a pinned file (RELEASE_TAMPERED)", () => {
    const dir = tmp("bks-pin-tamper-");
    cpSync(pinnedDir, dir, { recursive: true });
    const target = join(dir, "release", "sdl", "modules", "D6.graphql");
    const bytes = readFileSync(target);
    bytes[100] = bytes[100]! ^ 0x01;
    writeFileSync(target, bytes);
    const err = expectReleaseError(() => loadRelease({ dir, cache: false }), "RELEASE_TAMPERED");
    expect(String((err.details.problems as string[])[0])).toContain("sdl/modules/D6.graphql");
  });

  it("detects an unlisted file and a tampered release.json", () => {
    const dir = tmp("bks-pin-unlisted-");
    cpSync(pinnedDir, dir, { recursive: true });
    writeFileSync(join(dir, "release", "vocabularies", "extra.yaml"), "x: 1\n");
    expectReleaseError(() => loadRelease({ dir, cache: false }), "RELEASE_TAMPERED");
    const dir2 = tmp("bks-pin-manifest-");
    cpSync(pinnedDir, dir2, { recursive: true });
    const rel = JSON.parse(readFileSync(join(dir2, "release", "release.json"), "utf8"));
    rel.status = "accepted";
    writeFileSync(join(dir2, "release", "release.json"), `${JSON.stringify(rel, null, 2)}\n`);
    expectReleaseError(() => loadRelease({ dir: dir2, cache: false }), "RELEASE_TAMPERED");
  });

  it("fails hard when BKS_SCHEMA_RELEASE_DIR is set but missing (no fallback)", () => {
    const before = process.env.BKS_SCHEMA_RELEASE_DIR;
    process.env.BKS_SCHEMA_RELEASE_DIR = "/nonexistent/bks-schema-release";
    try {
      clearReleaseCache();
      const err = expectReleaseError(() => loadRelease(), "RELEASE_MISSING");
      expect(err.details.explicit).toBe(true);
    } finally {
      if (before === undefined) delete process.env.BKS_SCHEMA_RELEASE_DIR;
      else process.env.BKS_SCHEMA_RELEASE_DIR = before;
      clearReleaseCache();
    }
  });

  it("loads an explicit raw upstream release directory as a visibly non-production override", () => {
    const upstream = resolve(repoRoot, bundle.pin!.sourcePath.replace(/^biotech-meta/, "../biotech-meta"));
    if (!existsSync(upstream)) return;
    const r = loadRelease({ dir: upstream, cache: false });
    expect(r.source).toBe("override");
    expect(r.schemaReleaseDigest).toBe(bundle.schemaReleaseDigest);
  });
});

describe("IR v2 agrees with the release registers, vocabularies and SDL", () => {
  it("has 69 node types and 106 relationship types, each node assigned to its manifest module", () => {
    expect(ir.irVersion).toBe("bks-schema-ir.v2");
    expect(ir.nodes).toHaveLength(69);
    expect(ir.relationshipTypes).toHaveLength(106);
    expect(ir.modules.map((m) => m.id)).toEqual(["K", ...Array.from({ length: 13 }, (_, i) => `D${i + 1}`)]);
    const byName = new Map(ir.modules.flatMap((m) => m.definitions.map((d) => [d, m.id] as const)));
    for (const n of ir.nodes) {
      expect(n.module).toBe(byName.get(n.name));
      expect(n.fragment).toBe(n.module);
    }
    expect(ir.fragments.map((f) => f.id)).toEqual(ir.modules.map((m) => m.id));
  });

  it("gives every node a uid token and explicit executor operations from the register (FU-08, OD-03)", () => {
    const tokens = new Set<string>();
    for (const n of ir.nodes) {
      expect(n.uidToken, n.name).toMatch(/^[a-z][a-z0-9-]*$/);
      expect(tokens.has(n.uidToken!), `duplicate token ${n.uidToken}`).toBe(false);
      tokens.add(n.uidToken!);
      expect(n.executorOps.length, `${n.name} executor ops`).toBeGreaterThan(0);
      expect(n.executorOps).toContain("create");
      expect(n.allowedMutations).toEqual({ create: false, update: false, delete: false });
    }
    expect(Object.keys(bundle.params.uidTypeTokens).sort()).toEqual(ir.nodes.map((n) => n.name).sort());
  });

  it("classifies MEASURES asserted and HAS_VARIANT / REQUIRES_INPUT_METRIC structural, from the register", () => {
    const cls = (t: string) => ir.relationshipTypes.find((r) => r.type === t)!.class;
    expect(cls("MEASURES")).toBe("asserted");
    expect(cls("HAS_VARIANT")).toBe("structural");
    expect(cls("REQUIRES_INPUT_METRIC")).toBe("structural");
    const reg = bundle.registers.relationships as { relationships: Array<{ type: string; class: string }> };
    for (const r of reg.relationships) expect(ir.relationshipTypes.find((x) => x.type === r.type)?.class, r.type).toBe(r.class);
  });

  it("has every register relationship in the SDL and every SDL relationship in the register", () => {
    const reg = new Set((bundle.registers.relationships as { relationships: Array<{ type: string }> }).relationships.map((r) => r.type));
    const sdl = new Set(ir.relationshipTypes.map((r) => r.type));
    expect([...reg].filter((t) => !sdl.has(t))).toEqual([]);
    expect([...sdl].filter((t) => !reg.has(t))).toEqual([]);
    for (const r of ir.relationshipTypes) expect(r.registered).toBe(true);
  });

  it("keeps only v2 names in the validation params (no inherited v1 type, predicate or token)", () => {
    const relTypes = new Set(ir.relationshipTypes.map((r) => r.type));
    for (const t of [...bundle.params.assertedTypes, ...bundle.params.derivedTypes, ...(bundle.params.structuralTypes ?? []), ...bundle.params.exclusiveTypes]) expect(relTypes.has(t), t).toBe(true);
    expect(bundle.params.legacyTypes).toEqual([]);
    const registered = new Set(ir.predicates.filter((p) => p.status === "registered").map((p) => p.name));
    expect(new Set(bundle.params.registeredPredicates)).toEqual(registered);
    for (const pair of bundle.params.implicationPairs) for (const name of pair) expect(registered.has(name) || relTypes.has(name), name).toBe(true);
  });

  it("validates every registered predicate's subject and object types against the SDL (FU-13)", () => {
    const types = new Set([...ir.nodes.map((n) => n.name), ...ir.interfaces.map((i) => i.name), ...ir.unions.map((u) => u.name)]);
    const bad: string[] = [];
    for (const p of ir.predicates.filter((x) => x.status === "registered")) for (const t of [...p.subjectTypes, ...p.objectTypes]) if (!types.has(t)) bad.push(`${p.name}: ${t}`);
    expect(bad).toEqual([]);
    expect(ir.predicates.some((p) => p.status === "proposed-new")).toBe(false);
    for (const p of ir.predicates.filter((x) => x.aliasOf)) expect(registered(p.aliasOf!), `${p.name} -> ${p.aliasOf}`).toBe(true);
    function registered(name: string) {
      return ir.predicates.some((x) => x.name === name && x.status === "registered");
    }
  });

  it("accounts for all 35 proposed-new candidates and resolves the MD-X-03 duplicates", () => {
    const report = JSON.parse(bundle.text("reports/predicate-registry-report.json"));
    expect(report.proposedNewCandidates.accounted).toBe(35);
    expect(report.proposedNewCandidates.registered.length + report.proposedNewCandidates.rejected.length).toBe(35);
    const status = (n: string) => ir.predicates.find((p) => p.name === n)?.status;
    expect(status("PER_MAX_DAILY_DOSE_AMOUNT")).toBe("alias-of:CALCULATED_DAILY_MAX_INTAKE");
    expect(status("ORGANIZATION_RENAMED")).toBe("alias-of:FORMER_NAME");
    expect(ir.predicates.find((p) => p.name === "OUTCOME_MEASURED_WITH")?.objectTypes).not.toContain("Metric");
  });

  it("expands interface endpoints only as kernel traversal or the registered D5/D10 exceptions (OD-45)", () => {
    const ifaceRels = ir.relationshipTypes.filter((r) => r.interfaceEndpoints.length);
    expect(ifaceRels.length).toBeGreaterThan(0);
    for (const r of ifaceRels) {
      for (const e of r.interfaceEndpoints) {
        if (e.rule === "registered-exception") expect(["D5", "D10"], r.type).toContain(r.module);
        expect(e.members).toBeGreaterThan(0);
      }
    }
    const stepUses = ir.relationshipTypes.find((r) => r.type === "STEP_USES")!;
    expect(stepUses.interfaceEndpoints[0]?.rule).toBe("registered-exception");
    expect(ir.relationshipTypes.find((r) => r.type === "HAS_SUBJECT")!.interfaceEndpoints[0]?.rule).toBe("kernel-traversal");
  });

  it("publishes the qualifier grammar and assessment vocabulary (FU-14 a, KN-01, MD-D12-02)", () => {
    expect(ir.qualifierGrammar["target:"]?.status).toBe("registered");
    expect(ir.qualifierGrammar["comparatorArm:"]?.valueGrammar).toMatch(/uid/);
    expect(ir.qualifierGrammar["comparator:"]?.valueGrammar).toMatch(/QuantityComparator|GTE/);
    expect(ir.assessments.kinds).toContain("RESOLUTION");
    expect(ir.assessments.subkinds.some((s) => /dose-translation/.test(s.subkind))).toBe(true);
    const dc = ir.nodes.find((n) => n.name === "DecisionCriterion")!;
    for (const f of ["publisherUid", "publisherUidMethodVersion", "publisherUidDerivedAt", "publisherUidAuthorityUid"]) expect(dc.properties.some((p) => p.name === f), f).toBe(true);
  });
});

describe("release contents", () => {
  it("copies the decision ledger with all 160 decision ids and maps every S0/S1 decision", () => {
    const ledger = bundle.text("decisions/DECISIONS.md");
    const ids = [...ledger.matchAll(/^\| ([A-Z]+(?:-[A-Z0-9]+)+) \|/gm)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(160);
    expect(bundle.manifest.decisionLedgerDigest).toBe(bundle.manifest.identities.decisionLedgerDigest);
    const closure = JSON.parse(bundle.text("reports/decision-closure.json"));
    expect(closure.entries).toBe(160);
    for (const row of closure.rows) if (row.s1Scope) expect(row.releaseArtifacts.length, row.id).toBeGreaterThan(0);
    for (const prefix of ["OD-", "KN-", "EX-", "BM-", "MD-", "FX-", "FU-", "TL-"]) expect(ids.some((i) => i!.startsWith(prefix))).toBe(true);
  });

  it("emits required DDL with uid uniqueness on every stored label and the operational labels (FU-07)", () => {
    const ddl = bundle.ddl.manifest;
    const names = new Set(ddl.statements.filter((s) => s.requirement === "required").map((s) => s.name));
    for (const n of ir.nodes) for (const l of n.storedLabels) expect(names.has(l === "Entity" ? "entity_uid" : `uid_${l}`), l).toBe(true);
    for (const n of ["identifier_key", "identifier_scheme_value", "channel_platform_account", "sponsored_by_valid"]) expect(names.has(n), n).toBe(true);
    // Operational statements are read from ddl.json (release-agnostic: v2.0.1 moved marker uniqueness from effectKey to markerKey).
    const operational = ddl.statements.filter((s) => s.requirement === "required" && (s as { operational?: boolean }).operational);
    expect(operational.length).toBeGreaterThan(0);
    for (const s of operational) expect(bundle.ddl.required, s.name).toContain(s.statement);
    const uniqueOn = (label: string) => operational.filter((s) => s.type === "UNIQUENESS" && s.labelsOrTypes.includes(label));
    for (const label of ["KsWriteFence", "KsIntentMarker", "KsReleaseMarker"]) expect(uniqueOn(label).length, label).toBe(1);
    expect(uniqueOn("KsWriteFence")[0]!.properties).toEqual(["id"]);
    expect(uniqueOn("KsReleaseMarker")[0]!.properties).toEqual(["releaseId"]);
    expect(["effectKey", "markerKey"]).toContain(uniqueOn("KsIntentMarker")[0]!.properties[0]);
    for (const s of ddl.statements) expect(s.statement).toMatch(/IF NOT EXISTS/);
    expect(bundle.ddl.required).not.toMatch(/IS NOT NULL|IS ::/);
    expect(ddl.statements.filter((s) => s.edition === "enterprise").every((s) => s.requirement === "optional")).toBe(true);
  });

  it("binds catalog EXPLAIN evidence to the exact statement bytes; supported templates explained ok", () => {
    const catalog = bundle.queryCatalog as { templates: Array<{ id: string; status: string; statement: string; statementDigest: string; validation: { explain: string; resultAssertions: string }; language: string }>; questions: Array<{ id: string; status: string }>; questionStatusSource?: { path: string } };
    const explain = JSON.parse(bundle.text("query-catalog/explain.json")) as { results: Record<string, { statementDigest: string; ok: boolean }> };
    expect(catalog.questions.length).toBe(454);
    for (const t of catalog.templates) {
      expect(t.language).toBe("CYPHER_5");
      expect(t.statement).not.toMatch(/^\s*CYPHER 25/m);
      if (t.status === "supported") {
        expect(t.validation.explain, t.id).toBe("ok");
        expect(explain.results[t.id]?.ok, t.id).toBe(true);
        expect(explain.results[t.id]?.statementDigest.replace(/^sha256:/, "")).toBe(t.statementDigest.replace(/^sha256:/, ""));
      }
      // v2.0.0/v2.0.1: EXPLAIN only (not_run); v2.0.2+: the reads role's executed outcome per template.
      if (!catalog.questionStatusSource) expect(t.validation.resultAssertions).toBe("not_run");
      else expect(typeof t.validation.resultAssertions).toBe("string");
    }
    expect(catalog.templates.filter((t) => t.status === "supported").length).toBeGreaterThan(100);
    if (!catalog.questionStatusSource) expect(catalog.questions.find((q) => q.id === "Q-D12-03")?.status).toBe("supported");
    else {
      const s4 = JSON.parse(bundle.text(catalog.questionStatusSource.path)) as { questions: Array<{ id: string; status: string }> };
      expect(catalog.questions.find((q) => q.id === "Q-D12-03")?.status).toBe(s4.questions.find((q) => q.id === "Q-D12-03")!.status);
    }
  });

  it("publishes both pair metrics: collapsed within 600, expanded at the 848 baseline, K = 15 exception (OD-01, OD-46)", () => {
    const m = JSON.parse(bundle.text("reports/metrics.json"));
    expect(m.pairsCollapsed).toBeLessThanOrEqual(600);
    expect(m.pairsExpanded).toBe(848);
    expect(m.kernelRelationshipTypes).toBe(15);
  });

  it("hosts the legacy map: an S8-owned placeholder outside the frozen set (v2.0.0) or the S8 map inside it (v2.0.1+)", () => {
    const excluded = bundle.manifest.excludedFromFrozenDigestSet["migration/legacy-map.yaml"];
    if (bundle.manifest.releaseId === "biotech-schema-v2.0.0") {
      expect(excluded?.owner).toMatch(/S8/);
      expect(bundle.manifest.files["migration/legacy-map.yaml"]).toBeUndefined();
    } else {
      expect(excluded).toBeUndefined();
      expect(bundle.manifest.files["migration/legacy-map.yaml"]).toBeDefined();
    }
    const v1 = bundle.migration.v1Map as { unmappedEdges?: unknown };
    expect(JSON.stringify(v1.unmappedEdges)).toContain("ABOUT_CONDITION");
  });
});

describe("workspace inputs (FU-09)", () => {
  it("validate against the IR with zero errors", () => {
    expect(validateSidecars(ir, loadSidecars())).toEqual([]);
  });
});

describe("deterministic generation", () => {
  it("regenerates the upstream release byte for byte (two runs, plus the pinned copy)", () => {
    const upstream = resolve(repoRoot, "..", bundle.pin!.sourcePath.replace(/^biotech\//, ""));
    const src = existsSync(join(upstream, "release.json")) ? upstream : join(pinnedDir, "release");
    const a = tmp("bks-gen-a-");
    const b = tmp("bks-gen-b-");
    cpSync(src, a, { recursive: true });
    cpSync(src, b, { recursive: true });
    for (const d of [a, b]) execFileSync(process.execPath, [join(repoRoot, "scripts", "release", "generate.mjs"), "--release", d], { cwd: repoRoot, stdio: "pipe" });
    const files = Object.keys(bundle.files);
    for (const f of files) {
      const x = readFileSync(join(a, f));
      expect(x.equals(readFileSync(join(b, f))), f).toBe(true);
      expect(x.equals(readFileSync(join(pinnedDir, "release", f))), `${f} drifted from the pin`).toBe(true);
    }
  }, 120_000);
});

describe("YAML parity (TL-04)", () => {
  it("parses every release YAML file identically in Node yaml and PyYAML", () => {
    const uv = spawnSync("uv", ["--version"], { encoding: "utf8" });
    if (uv.status !== 0) return; // uv absent: reported as unrun by the release check, not silently passed
    const yamlFiles = Object.keys(bundle.files).filter((f) => f.endsWith(".yaml")).map((f) => join(pinnedDir, "release", f));
    const r = spawnSync(process.execPath, [join(repoRoot, "scripts", "release", "yaml-parity.mjs"), ...yamlFiles], { encoding: "utf8", cwd: repoRoot });
    expect(r.status, r.stdout + r.stderr).toBe(0);
  }, 180_000);
});
