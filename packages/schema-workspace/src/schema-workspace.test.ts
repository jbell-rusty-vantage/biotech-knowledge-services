import { describe, expect, it, vi } from "vitest";
import { readPinnedSdl, readValidationParams } from "./load.js";
import { parseClassDoc, parseSchema, summarize } from "./parse.js";
import { loadRelease } from "./release.js";
import { renderWorkspace } from "./render.js";
import { searchIndex } from "./search.js";
import { loadSidecars, validateSidecars } from "./sidecars.js";

// Rendering the full v2 workspace takes ~1 s alone and several seconds under the parallel suite.
vi.setConfig({ testTimeout: 60_000 });

// IR v2 from the verified pinned release (biotech-schema-v2.0.x).
const ir = loadRelease().ir;
const sidecars = loadSidecars();

describe("parseSchema on the pinned release", () => {
  it("finds every @node type and the 14 modules K, D1..D13 from the assembly manifest", () => {
    expect(ir.nodes).toHaveLength(69);
    expect(ir.fragments.map((f) => f.id)).toEqual(["K", ...Array.from({ length: 13 }, (_, i) => `D${i + 1}`)]);
    expect(ir.fragments.find((f) => f.id === "D6")?.title).toMatch(/consumer products/i);
  });

  it("assigns every node to its module and records uid tokens from validation-params v2", () => {
    for (const n of ir.nodes) expect(n.fragment).toMatch(/^(K|D\d{1,2})$/);
    expect(ir.nodes.find((n) => n.name === "Product")?.uidToken).toBe("product");
    expect(ir.nodes.find((n) => n.name === "Product")?.module).toBe("D6");
    expect(ir.nodes.find((n) => n.name === "Assertion")?.executorOps).not.toContain("delete");
  });

  it("parses relationship class, cardinality and read-only derived projections", () => {
    const mechanism = ir.nodes.find((n) => n.name === "Mechanism")!;
    const derived = ir.relationshipTypes.filter((r) => r.class === "derived");
    expect(derived.length).toBeGreaterThan(0);
    for (const r of derived) for (const t of r.triples) for (const v of t.via) expect(v.readOnly, `${r.type} ${v.node}.${v.field}`).toBe(true);
    expect(mechanism.relationships.length).toBeGreaterThan(0);
    const identifiers = ir.relationshipTypes.find((r) => r.type === "HAS_IDENTIFIER")!;
    expect(identifiers.class).toBe("asserted");
    expect(identifiers.edgePropertyType).toBe("IdentifierLinkProperties");
  });

  it("expands interface targets into concrete members and summarizes relationship types", () => {
    const hasIdentifier = ir.relationshipTypes.find((r) => r.type === "HAS_IDENTIFIER")!;
    expect(hasIdentifier.triples.some((t) => t.from === "Product" && t.to === "Identifier")).toBe(true);
    expect(hasIdentifier.fromMembers.length).toBeGreaterThan(40);
    expect(hasIdentifier.to).toEqual(["Identifier"]);
    expect(hasIdentifier.requiredIndexes).toContain("rel_HAS_IDENTIFIER_assertion");
  });

  it("parses the docstring convention", () => {
    const meta = parseClassDoc("class: derived (mx-proj/v1, read-only; inverse view); cardinality: many; catalog: AFFECTS_MECHANISM");
    expect(meta.relClass).toBe("derived");
    expect(meta.classNote).toBe("mx-proj/v1, read-only; inverse view");
    expect(meta.cardinality).toBe("many");
    expect(meta.catalogNote).toBe("AFFECTS_MECHANISM");
    expect(summarize("First sentence here. Second sentence.")).toBe("First sentence here.");
  });

  it("still parses an ad-hoc SDL without release inputs (banner fallback for bks-schema map --sdl)", () => {
    const adHoc = parseSchema(readPinnedSdl(), { params: readValidationParams() });
    expect(adHoc.nodes).toHaveLength(69);
    expect(adHoc.release).toBeNull();
  });
});

describe("sidecars and rendering", () => {
  it("validates every sidecar reference against the IR", () => {
    expect(validateSidecars(ir, sidecars)).toEqual([]);
  });

  it("renders a workspace whose index covers every node and relationship type and whose fingerprint is stable", () => {
    // Renderer API of the workspace role (S2): renderWorkspace({ release, sidecars, generatedAt }).
    const release = loadRelease();
    const at = "2026-10-11T00:00:00.000Z";
    const a = renderWorkspace({ release, sidecars, generatedAt: at });
    const b = renderWorkspace({ release, sidecars, generatedAt: at });
    expect(a.manifest.workspaceFingerprint).toBe(b.manifest.workspaceFingerprint);
    const ids = new Set(a.index.map((e) => e.id));
    for (const n of ir.nodes) expect(ids.has(`node:${n.name}`), n.name).toBe(true);
    for (const r of ir.relationshipTypes) expect(ids.has(`rel:${r.type}`), r.type).toBe(true);
    const indexPage = a.files.get("INDEX.md")!;
    for (const n of ir.nodes) expect(indexPage).toContain(n.name);
    for (const r of ir.relationshipTypes) expect(indexPage).toContain(r.type);
    expect(a.files.has("nodes/Product.md")).toBe(true);
    expect(a.files.get("nodes/Product.md")).toContain("hu:product:");
    expect(a.files.get("START_HERE.md")).toContain(release.manifest.releaseId);
  });

  it("ranks exact aliases above token matches", () => {
    const { index } = renderWorkspace({ release: loadRelease(), sidecars, generatedAt: "2026-10-11T00:00:00.000Z" });
    const hits = searchIndex(index, "supplement", 5);
    expect(hits[0]?.id).toBe("term:supplement");
    const nr = searchIndex(index, "NR", 5);
    expect(nr.some((h) => h.id === "term:compound")).toBe(true);
    const task = searchIndex(index, "what do we know about entity", 3);
    expect(task[0]?.kind).toBe("task");
  });
});
