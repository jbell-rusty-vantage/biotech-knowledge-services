/**
 * Workspace v2 (S2) acceptance: clean-room rerender equality, on-disk tamper detection, zero broken links, card
 * digests, deterministic search ties, structured filters, adjacency / path bounds, budgeted slices that keep the
 * identity and admission rules, semantic degradation, v1 navigation aliases, the schema context artifact and the
 * evaluation runner.
 */
import { appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { build, verifyWorkspace } from "./build.js";
import { parseCard, verifyCardDigest } from "./card.js";
import { schemaContext } from "./context.js";
import { doctor } from "./doctor.js";
import { evalSearch, loadEvalTasks, normalizeGoldId, queryOfPrompt } from "./eval.js";
import { findCards } from "./find.js";
import { neighborsOf, NeighborError } from "./neighbors.js";
import { findPaths, PathError } from "./path.js";
import { patternLookup } from "./pattern.js";
import { linksOf, LAYERS, writeWorkspace, validateGeneratedPath, WorkspaceWriteError, type RenderResult } from "./render.js";
import { LOOKUP_KINDS, SchemaContext, WorkspaceManifestV2 } from "./schema-contracts.js";
import { lexicalSearch, prepareIndex, reciprocalRankFusion, tokenize } from "./search.js";
import type { SemanticRetriever } from "./semantic/retriever.js";
import { buildSlice, referencedTypes } from "./slice.js";
import { loadSidecars } from "./sidecars.js";
import { adaptiveBaseLimit, openWorkspace, searchWorkspace, shortestPathLength, verifyWorkspaceFiles, type Workspace } from "./workspace.js";

vi.setConfig({ testTimeout: 120_000, hookTimeout: 180_000 });
const LOOKUP_KINDS_TEST: readonly string[] = LOOKUP_KINDS;

let tmp: string;
let a: RenderResult;
let wsDir: string;
let ws: Workspace;

beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), "bks-ws-v2-"));
  a = build();
  wsDir = join(tmp, "workspace");
  writeWorkspace(a, wsDir);
  ws = openWorkspace(wsDir);
  process.env.BKS_SEMANTIC_CUSTODY_DIR = join(tmp, "no-semantic");
  process.env.BKS_SEMANTIC_ENABLED = "false";
});
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

describe("reproducible build and on-disk integrity", () => {
  it("re-renders byte for byte in a clean room (independent render, independent directory)", () => {
    const b = build();
    expect(b.manifest.workspaceFingerprint).toBe(a.manifest.workspaceFingerprint);
    expect([...b.files.keys()].sort()).toEqual([...a.files.keys()].sort());
    for (const [p, c] of a.files) expect(b.files.get(p), p).toBe(c);
    const other = join(tmp, "clean-room");
    writeWorkspace(b, other);
    const r = verifyWorkspace(other);
    expect(r.ok, JSON.stringify(r.rerender).slice(0, 400)).toBe(true);
  });

  it("keeps the generation timestamp out of the fingerprint", () => {
    const c = build("2030-01-01T00:00:00.000Z");
    expect(c.manifest.generatedAt).toBe("2030-01-01T00:00:00.000Z");
    expect(c.manifest.workspaceFingerprint).toBe(a.manifest.workspaceFingerprint);
    for (const [p, content] of c.files) if (p !== "manifest.json") expect(content, p).toBe(a.files.get(p));
  });

  it("detects altered, missing and unexpected files on disk", () => {
    const t = join(tmp, "tamper");
    cpSync(wsDir, t, { recursive: true });
    expect(verifyWorkspaceFiles(t).ok).toBe(true);
    appendFileSync(join(t, "nodes", "Product.md"), "\nedited by hand\n");
    unlinkSync(join(t, "relationships", "HAS_VARIANT.md"));
    writeFileSync(join(t, "nodes", "Unexpected.md"), "# not generated\n");
    const r = verifyWorkspaceFiles(t);
    expect(r.ok).toBe(false);
    expect(r.altered).toEqual(["nodes/Product.md"]);
    expect(r.missing).toEqual(["relationships/HAS_VARIANT.md"]);
    expect(r.unexpected).toEqual(["nodes/Unexpected.md"]);
    const v = verifyWorkspace(t);
    expect(v.ok).toBe(false);
    expect(v.rerender.staleFiles).toContain("nodes/Product.md");
  });

  it("detects an edited inventory (fingerprint no longer matches the manifest)", () => {
    const t = join(tmp, "tamper-manifest");
    cpSync(wsDir, t, { recursive: true });
    const m = JSON.parse(readFileSync(join(t, "manifest.json"), "utf8"));
    m.inventory["nodes/Product.md"].sha256 = `sha256:${"0".repeat(64)}`;
    writeFileSync(join(t, "manifest.json"), JSON.stringify(m, null, 2));
    const r = verifyWorkspaceFiles(t);
    expect(r.fingerprint.matches).toBe(false);
    expect(r.altered).toContain("nodes/Product.md");
  });

  it("writes only to owned output and validates generated paths", () => {
    const foreign = join(tmp, "foreign");
    mkdirSync(foreign);
    writeFileSync(join(foreign, "package.json"), "{}");
    expect(() => writeWorkspace(a, foreign)).toThrow(WorkspaceWriteError);
    const notWs = join(tmp, "not-a-workspace");
    mkdirSync(notWs);
    writeFileSync(join(notWs, "notes.txt"), "keep me");
    expect(() => writeWorkspace(a, notWs)).toThrow(/not a generated workspace/);
    expect(readFileSync(join(notWs, "notes.txt"), "utf8")).toBe("keep me");
    for (const bad of ["../escape.md", "/abs.md", "nodes\\x.md", "foreign/x.md", "nodes/./x.md"]) expect(() => validateGeneratedPath(bad), bad).toThrow(WorkspaceWriteError);
    // re-writing over an existing generated workspace replaces it atomically and leaves no staging directory
    writeWorkspace(a, wsDir);
    expect(verifyWorkspaceFiles(wsDir).ok).toBe(true);
    expect(existsSync(`${wsDir}.staging`)).toBe(false);
  });

  it("validates the manifest against the v2 contract and lists every file in the inventory", () => {
    expect(WorkspaceManifestV2.safeParse(a.manifest).success).toBe(true);
    expect(Object.keys(a.manifest.inventory).length).toBe(a.files.size - 1);
    expect(a.manifest.release.schemaReleaseDigest).toBe(ws.manifest.release.schemaReleaseDigest);
  });
});

describe("cards, links and layers", () => {
  it("has zero broken links", () => {
    const broken: string[] = [];
    for (const [p, text] of a.files) if (p.endsWith(".md")) for (const target of linksOf(p, text)) if (!a.files.has(target)) broken.push(`${p} -> ${target}`);
    expect(broken).toEqual([]);
  });

  it("gives every card generated front matter whose digest recomputes and matches the index", () => {
    const byId = new Map(a.index.map((r) => [r.id, r]));
    let cards = 0;
    for (const [p, text] of a.files) {
      const card = parseCard(text);
      if (!card) continue;
      cards++;
      expect(verifyCardDigest(card), p).toBe(true);
      expect(card.frontMatter.schemaReleaseDigest).toBe(a.manifest.release.schemaReleaseDigest);
      expect(byId.get(card.frontMatter.id)?.cardDigest, p).toBe(card.frontMatter.cardDigest);
      expect(byId.get(card.frontMatter.id)?.path).toBe(p);
    }
    expect(cards).toBe(a.index.filter((r) => r.cardDigest).length);
  });

  it("retains every v1 navigation layer (or its v2 equivalent) and adds the v2 layers", () => {
    const dirs = new Set([...a.files.keys()].map((p) => p.split("/")[0]));
    for (const d of ["START_HERE.md", "INDEX.md", "manifest.json", "schema-ir.json", "domains", "modules", "tasks", "nodes", "relationships", "edge-properties", "interfaces", "unions", "predicates", "assessments", "vocabularies", "rules", "sdl", "patterns", "migrations", "search"]) expect(dirs.has(d), d).toBe(true);
    expect(a.files.has("search/index.jsonl")).toBe(true);
    expect(a.files.has("search/adjacency.json")).toBe(true);
    expect(LAYERS.map((l) => l.name)).toEqual(expect.arrayContaining(["START_HERE", "INDEX", "domains", "modules", "cards", "sdl", "tasks", "rules", "patterns", "migrations", "search"]));
    const start = a.files.get("START_HERE.md")!;
    expect(start).toContain("rg --files workspace/nodes");
    expect(start).toContain("ConvertFrom-Json");
    expect(start).toContain("jq ");
    expect(start).not.toMatch(/Never list or read the tree|At most 4 page reads/);
    expect(a.files.get("nodes/Product.md")).not.toMatch(/fragments\/W\d\d/);
  });

  it("renders task routes with their pending proposal kinds and node cards with executor ops", () => {
    const sidecars = loadSidecars();
    for (const t of sidecars.tasks.filter((x) => x.pendingProposalKinds?.length)) for (const k of t.pendingProposalKinds!) expect(a.files.get(`tasks/${t.slug}.md`), t.slug).toContain(`\`${k}\``);
    const lv = a.files.get("nodes/LabelVersion.md")!;
    expect(lv).toContain("Executor operations");
    expect(lv).toContain("`create`, `update`");
    expect(lv).toContain("<-[:HAS_SUBJECT]-(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)");
  });
});

describe("search", () => {
  it("puts exact id / name / alias before fuzzy ranking", () => {
    expect(ws.search("node:LabelVersion", 3)[0]?.id).toBe("node:LabelVersion");
    expect(ws.search("LabelVersion", 3)[0]?.id).toBe("node:LabelVersion");
    expect(ws.search("supplement", 5)[0]?.id).toBe("term:supplement");
    const mention = ws.search("Mention", 5);
    expect(mention[0]?.id).toBe("node:Mention");
    expect(mention[0]?.kind).toBe("alias");
    expect(mention[1]?.via).toBe("node:Mention");
  });

  it("is deterministic: equal ties break on kind priority then id, independent of index order", () => {
    const shuffled = [...ws.index].reverse();
    for (const q of ["product label", "assertion evidence", "registry version", "D6"]) {
      const x = lexicalSearch(prepareIndex(ws.index), q, { limit: 30 });
      const y = lexicalSearch(prepareIndex(shuffled), q, { limit: 30 });
      expect(y.map((h) => h.id), q).toEqual(x.map((h) => h.id));
      for (let i = 1; i < x.length; i++) expect(x[i - 1]!.score >= x[i]!.score, `${q} order at ${i}`).toBe(true);
    }
  });

  it("indexes field-level keywords and body tokens per card (carried, not scored)", () => {
    const lv = ws.record("node:LabelVersion")!;
    const propertyWords = new Set((lv.properties ?? []).flatMap((p) => tokenize(p)));
    expect((lv.keywords ?? []).some((k) => propertyWords.has(k))).toBe(true);
    expect(lv.keywords).toContain("outgoing");
    expect((lv.bodyTokens ?? []).length).toBeGreaterThan(0);
    const byName = ws.search("label version", 3);
    expect(byName[0]?.id).toBe("node:LabelVersion");
  });

  it("ranks direction-consistent paths before paths that walk an edge against its declared direction", () => {
    // synthetic topology: A->C->B (all along) and A->D<-B (second hop against the stored direction); equal length
    const arc = (type: string, from: string, to: string) => ({ type, from, to, fromDeclared: from, toDeclared: to, relClass: "structural", module: "X", temporal: "recorded-only", exclusive: false, edgePropertyType: null, declaredOn: [], interfaceJoin: false, interfaceRule: null, projectionGate: null });
    const adj = { format: "bks-schema-adjacency.v1" as const, releaseId: "t", schemaReleaseDigest: "t", note: "", nodes: { A: { module: "X", interfaces: [] }, B: { module: "X", interfaces: [] }, C: { module: "X", interfaces: [] }, D: { module: "X", interfaces: [] } }, groups: {}, arcs: [arc("AAA_AGAINST", "A", "D"), arc("AAB_AGAINST", "B", "D"), arc("ZZA_ALONG", "A", "C"), arc("ZZB_ALONG", "C", "B")], predicateJoins: [], evidenceSpine: [] };
    const r = findPaths(adj, "A", "B", { maxHops: 3, limit: 2 });
    expect(r.paths.map((p) => p.againstDirection)).toEqual([0, 1]);
    expect(r.paths[0]!.hops.map((h) => h.type)).toEqual(["ZZA_ALONG", "ZZB_ALONG"]);
    expect(r.paths[1]!.hops.map((h) => h.traversal)).toEqual(["along-direction", "against-direction"]);
    // the length-first ranking (used for the rendered evidence-path rule) keeps the old order: signature decides
    const lf = findPaths(adj, "A", "B", { maxHops: 3, limit: 2, rank: "length-first" });
    expect(lf.paths[0]!.againstDirection).toBe(0);
    // on the release topology the returned order is auditable: against-direction counts never decrease
    const real = findPaths(ws.adjacency(), "LabTest", "Biomarker", { maxHops: 3, limit: 5 });
    for (let i = 1; i < real.paths.length; i++) expect(real.paths[i]!.againstDirection).toBeGreaterThanOrEqual(real.paths[i - 1]!.againstDirection);
  });

  it("expands paths only with path intent; otherwise returns the plain top 10 search cards", async () => {
    const none = await searchWorkspace(ws, { query: "label version per serving amount", expand: "paths" });
    expect(none.expansion?.pathIntent).toBe("none");
    expect(none.expansion?.baseLimitRule).toBe("no-expansion");
    expect(none.route!.every((x) => x.source === "search")).toBe(true);
    expect(none.calls).toHaveLength(1);
    const plain = (await searchWorkspace(ws, { query: "label version per serving amount" })).hits.filter((h) => !LOOKUP_KINDS_TEST.includes(h.kind));
    expect(none.hits.map((h) => h.id)).toEqual(plain.slice(0, 10).map((h) => h.id));
    const loneTo = await searchWorkspace(ws, { query: "what does a LabelVersion declare to consumers", expand: "paths" });
    expect(loneTo.expansion?.pathIntent).toBe("none");
    const named = await searchWorkspace(ws, { query: "LabTest and Biomarker", expand: "paths" });
    expect(named.expansion?.pathIntent).toBe("named-types");
    expect(named.expansion?.endpointSource).toBe("query");
    const worded = await searchWorkspace(ws, { query: "trace the evidence of an assertion", expand: "paths" });
    expect(["wording", "named-types+wording"]).toContain(worded.expansion?.pathIntent);
  });

  it("adapts the base limit to the shortest legal path (10 − 2 × length, clamped to [4, 7]; 5 when unknown)", async () => {
    expect([1, 2, 3, 4, null].map((x) => adaptiveBaseLimit(x))).toEqual([7, 6, 4, 4, 5]);
    expect(shortestPathLength(ws.adjacency(), "LabTest", "Biomarker", 3)).toBe(2);
    const r = await searchWorkspace(ws, { query: "from LabTest to Biomarker", expand: "paths" });
    expect(r.expansion?.shortestPathLength).toBe(2);
    expect(r.expansion?.baseLimit).toBe(6);
    expect(r.expansion?.baseLimitRule).toBe("adaptive");
    expect(r.route!.filter((x) => x.source === "search").length).toBeLessThanOrEqual(6);
    const explicit = await searchWorkspace(ws, { query: "from LabTest to Biomarker", expand: "paths", baseLimit: 3 });
    expect(explicit.expansion?.baseLimit).toBe(3);
    expect(explicit.expansion?.baseLimitRule).toBe("explicit");
  });

  it("fills relationship cards of all paths before intermediate node cards, then references; cap 10; deterministic", async () => {
    const r = await searchWorkspace(ws, { query: "from LabTest to Biomarker", expand: "paths", baseLimit: 2 });
    expect(r.hits.length).toBeLessThanOrEqual(10);
    expect(new Set(r.hits.map((h) => h.id)).size).toBe(r.hits.length);
    const path = r.route!.filter((x) => x.source === "path");
    const firstNode = path.findIndex((x) => x.id.startsWith("node:"));
    const lastEdge = path.map((x) => /^(rel|pred):/.test(x.id)).lastIndexOf(true);
    if (firstNode >= 0) expect(lastEdge).toBeLessThan(firstNode);
    const firstRef = r.route!.findIndex((x) => x.source === "reference");
    if (firstRef >= 0) expect(r.route!.slice(firstRef).every((x) => x.source === "reference")).toBe(true);
    for (const x of r.route!.filter((e) => e.source === "reference")) {
      expect(x.id).toMatch(/^(pred|asmt):/);
      expect(x.via).toMatch(/^rel:/);
    }
    expect(r.calls?.slice(1).every((c) => / --max-hops 3 --limit 2 --joins fill --json$/.test(c))).toBe(true);
    expect(r.expansion?.instanceClaim).toBe(false);
    const again = await searchWorkspace(ws, { query: "from LabTest to Biomarker", expand: "paths", baseLimit: 2 });
    expect(again.hits.map((h) => h.id)).toEqual(r.hits.map((h) => h.id));
  });

  it("prefers node types named in the query as endpoints and runs every pair", async () => {
    const r = await searchWorkspace(ws, { query: "how does a label version reach an ingredient material and a Product", expand: "paths" });
    expect(r.expansion?.endpointSource).toBe("query");
    expect(r.expansion?.nodesConsidered).toEqual(["LabelVersion", "IngredientMaterial", "Product"]);
    expect(r.expansion?.pathRuns.map((p) => `${p.from}>${p.to}`)).toEqual(["LabelVersion>IngredientMaterial", "LabelVersion>Product", "IngredientMaterial>Product"]);
    expect(r.calls).toHaveLength(4);
  });

  it("evaluates structured mode deterministically on synthetic tasks and records the base limit", async () => {
    const tasks = [
      { id: "S1", prompt: "from LabTest to Biomarker", category: "cross-domain", gold: ["rel:MEASURES_METRIC", "rel:QUANTIFIES"] },
      { id: "S2", prompt: "LabelVersion", category: "exact", gold: ["node:LabelVersion"] },
    ];
    const a = await evalSearch(ws, { tasks, mode: "structured" });
    const b = await evalSearch(ws, { tasks, mode: "structured" });
    expect(a).toEqual(b);
    expect(a.baseLimit).toBe("adaptive");
    expect(a.perTask[0]!.baseLimitUsed).toBe(6);
    expect(a.perTask[0]!.pathIntent).toBe("named-types+wording");
    expect(a.perTask[0]!.recallAt10).toBe(1);
    expect(a.perTask[1]!.pathIntent).toBe("none");
    expect(a.perTask[1]!.exactIdHit).toBe(1);
    expect((await evalSearch(ws, { tasks, mode: "structured", baseLimit: 3 })).baseLimit).toBe(3);
    expect((await evalSearch(ws, { tasks, mode: "lexical" })).baseLimit).toBeNull();
  });

  it("CLI `search --mode structured` and the eval runner return the same candidates (one code path)", async () => {
    const { main } = await import("./cli.js");
    const queries = ["from LabTest to Biomarker", "label version per serving amount", "trace an assertion to its source", "how does a label version reach an ingredient material and a Product"];
    const tasks = queries.map((q, i) => ({ id: `E${i}`, prompt: q, gold: ["node:LabelVersion"] }));
    const report = await evalSearch(ws, { tasks, mode: "structured" });
    for (const [i, q] of queries.entries()) {
      const out: string[] = [];
      const log = vi.spyOn(console, "log").mockImplementation((...a: unknown[]) => void out.push(a.map(String).join(" ")));
      try {
        expect(await main(["search", q, "--mode", "structured", "--json", "--dir", wsDir])).toBe(0);
      } finally {
        log.mockRestore();
      }
      const cli = JSON.parse(out.join("\n")) as { hits: Array<{ id: string }>; expansion: { pathIntent: string } };
      expect(cli.hits.map((h) => h.id), q).toEqual(report.perTask[i]!.top);
      expect(cli.expansion.pathIntent).toBe(report.perTask[i]!.pathIntent);
      const lib = await searchWorkspace(ws, { query: q, expand: "paths" });
      expect(lib.hits.map((h) => h.id)).toEqual(report.perTask[i]!.top);
    }
  });

  it("filters by kind and module", () => {
    const hits = lexicalSearch(ws.prepared(), "label", { kind: ["relationship"], module: ["D6"], limit: 50 });
    expect(hits.length).toBeGreaterThan(0);
    for (const h of hits) {
      expect(h.kind).toBe("relationship");
      expect(h.module).toBe("D6");
    }
  });

  it("reports semantic-only as unavailable and hybrid as degraded lexical-only without a bound generation", async () => {
    const sem = await searchWorkspace(ws, { query: "label version", mode: "semantic" });
    expect(sem.status).toBe("unavailable");
    expect(sem.hits).toEqual([]);
    expect(sem.degradation?.fallback).toBe("none");
    const hyb = await searchWorkspace(ws, { query: "label version", mode: "hybrid" });
    expect(hyb.status).toBe("degraded");
    expect(hyb.mode).toBe("lexical-only");
    expect(hyb.hits[0]?.id).toBe("node:LabelVersion");
    await expect(searchWorkspace(ws, { query: "x", limit: 51 })).rejects.toThrow(/limit/);
  });

  it("fuses an available retriever by RRF, keeps exact hits first and rejects stale hosted hits", async () => {
    const lv = ws.record("node:LabelVersion")!;
    const pkg = ws.record("node:Package")!;
    const fake: SemanticRetriever = {
      id: "fake",
      status: async () => ({ state: "available", generationId: "gen-test" }),
      search: async () => ({ status: { state: "available", generationId: "gen-test" }, hits: [{ cardId: pkg.id, cardDigest: pkg.cardDigest!, score: 0.9 }, { cardId: lv.id, cardDigest: `sha256:${"1".repeat(64)}`, score: 0.8 }, { cardId: "node:Nope", cardDigest: `sha256:${"2".repeat(64)}`, score: 0.7 }] }),
    };
    const r = await searchWorkspace(ws, { query: "LabelVersion", mode: "hybrid", retriever: fake });
    expect(r.status).toBe("ok");
    expect(r.hits[0]?.id).toBe("node:LabelVersion");
    expect(r.hits.some((h) => h.id === "node:Package")).toBe(true);
    expect(r.rejectedHostedHits).toBe(2);
    expect(reciprocalRankFusion([["a", "b"], ["b", "c"]]).map((x) => x.id)).toEqual(["b", "a", "c"]);
  });
});

describe("structured find", () => {
  it("returns exact matches in id order", () => {
    const r = findCards(ws, { kind: "relationship", relClass: "asserted", module: "D6" });
    expect(r.total).toBeGreaterThan(0);
    expect(r.results.map((x) => x.id)).toEqual([...r.results.map((x) => x.id)].sort());
    for (const x of r.results) {
      expect(x.relClass).toBe("asserted");
      expect(x.module).toBe("D6");
    }
    const upsert = findCards(ws, { kind: "node", executorOp: "node.upsert", property: "uid" });
    expect(upsert.results.map((x) => x.id)).toContain("node:Product");
    for (const x of upsert.results) expect(x.properties).toContain("uid");
    expect(findCards(ws, { kind: "node", name: "Mention" }).total).toBe(0);
    expect(findCards(ws, { kind: "rel", exclusive: true }).results.map((x) => x.id)).toContain("rel:HAS_LABEL_VERSION");
  });
});

describe("topology: neighbors and paths", () => {
  it("keeps adjacency within 100 nodes / 250 arcs, reports truncation and refuses depth > 5", () => {
    const r = neighborsOf(ws.adjacency(), "node:Assertion", { depth: 5, expand: true });
    expect(r.nodes.length).toBeLessThanOrEqual(100);
    expect(r.arcs.length).toBeLessThanOrEqual(250);
    expect(r.truncated).toBe(true);
    expect(r.omitted.nodes + r.omitted.arcs).toBeGreaterThan(0);
    expect(r.instanceClaim).toBe(false);
    expect(() => neighborsOf(ws.adjacency(), "node:Assertion", { depth: 6 })).toThrow(NeighborError);
  });

  it("collapses interface targets unless expanded", () => {
    const collapsed = neighborsOf(ws.adjacency(), "node:Assertion", { direction: "out" });
    const hs = collapsed.arcs.filter((x) => x.type === "HAS_SUBJECT");
    expect(hs).toHaveLength(1);
    expect(hs[0]?.endpointGroup?.name).toBe("Subjectable");
    const expanded = neighborsOf(ws.adjacency(), "node:Assertion", { direction: "out", expand: true });
    expect(expanded.arcs.filter((x) => x.type === "HAS_SUBJECT").length).toBe(hs[0]!.endpointGroup!.members);
  });

  it("returns at most five legal paths, each hop a real arc or predicate join, never an instance claim", () => {
    const adj = ws.adjacency();
    const r = findPaths(adj, "node:Product", "node:SourceLocator", { maxHops: 5 });
    expect(r.paths.length).toBeGreaterThan(0);
    expect(r.paths.length).toBeLessThanOrEqual(5);
    expect(r.instanceClaim).toBe(false);
    expect(r.paths[0]!.hops.map((h) => h.type)).toEqual(["HAS_SUBJECT", "HAS_EVIDENCE"]);
    for (const p of r.paths)
      for (const h of p.hops) {
        const ok = h.kind === "typed" ? adj.arcs.some((x) => x.type === h.type && x.from === h.from && x.to === h.to) : adj.predicateJoins.some((j) => j.predicate === h.type && j.from === h.from && j.to === h.to);
        expect(ok, `${h.type} ${h.from}->${h.to}`).toBe(true);
      }
    expect(() => findPaths(adj, "Product", "Source", { maxHops: 6 })).toThrow(PathError);
    expect(() => findPaths(adj, "Product", "Source", { limit: 6 })).toThrow(PathError);
    const via = findPaths(adj, "Product", "ChemicalSubstance", { via: ["ProductVariant", "Package", "LabelVersion"], joins: "exclude", maxHops: 5 });
    expect(via.paths.map((p) => p.hops.map((h) => h.type).join(">"))).toContain("HAS_VARIANT>HAS_PACKAGE>HAS_LABEL_VERSION>DECLARES_COMPONENT>REALIZES_SUBSTANCE");
    for (const p of via.paths) expect(p.nodes.slice(1, 4)).toEqual(["ProductVariant", "Package", "LabelVersion"]);
    const typed = findPaths(adj, "LabTest", "Biomarker", { joins: "exclude", maxHops: 2 });
    expect(typed.paths[0]?.hops.map((h) => h.type)).toEqual(["MEASURES_METRIC", "QUANTIFIES"]);
  });
});

describe("patterns and migration aliases", () => {
  it("returns question-linked templates with output contracts and statuses", () => {
    const r = patternLookup(ws, { question: "Q-D6-01" });
    expect(r.status).toBe("supported");
    expect(r.templates[0]?.outputColumns).toBeDefined();
    expect(String(r.templates[0]?.statement)).not.toMatch(/CYPHER 25/);
    const held = ws.catalog().questions.find((q) => q.status === "held")!;
    const h = patternLookup(ws, { question: held.id });
    expect(h.status).toBe("held");
    expect(h.templates).toEqual([]);
  });

  it("resolves old v1 ids to migration records, never to a silent substitute", () => {
    const m = ws.page("node:Mention");
    expect(m.kind).toBe("alias");
    expect(m.text).toContain("not a live v2 element");
    expect(ws.page("frag:W04").record?.targets).toContain("mod:D6");
    expect(ws.page("frag:D6").id).toBe("mod:D6");
    const removed = ws.index.find((r) => r.kind === "alias" && r.migrationKind === "removed")!;
    expect(ws.page(removed.id).text).toContain("(none: removed; no substitute type)");
  });

  it("renders the live legacy map and operational names as navigation, not domain cards", () => {
    expect(a.files.has("migrations/legacy-map.md")).toBe(true);
    expect(a.files.has("migrations/operational-names.md")).toBe(true);
    for (const p of a.files.keys()) expect(p, p).not.toMatch(/^(nodes|relationships)\/(LegacyV0|MIGRATED_FROM|Ks[A-Z])/);
    const legacy = ws.index.filter((r) => r.id.startsWith("legacy:"));
    const ops = ws.index.filter((r) => r.kind === "operational");
    if (a.manifest.compatibility) {
      expect(legacy.length).toBeGreaterThan(0);
      expect(ops.some((r) => r.name === "MIGRATED_FROM")).toBe(true);
      expect(a.files.get("START_HERE.md")).toContain("## Compatibility (this release)");
    }
  });
});

describe("budgeted slice and schema context", () => {
  it("keeps identity and admission rules in a write slice even beyond the budget, and says so", () => {
    const tiny = buildSlice(ws, ws.ir(), loadSidecars(), { tasks: ["ingest-product-label"], maxTokens: 1000 });
    expect(tiny.purpose).toBe("write");
    const paths = tiny.included.map((p) => p.path);
    for (const r of ["rules/identity-rules.md", "rules/ingestion-rules.md", "rules/temporal-rules.md", "rules/evidence-path.md"]) expect(paths).toContain(r);
    expect(tiny.budget.exceeded).toBe(true);
    expect(tiny.budget.overrunReason).toMatch(/mandatory identity\/admission rules/);
    expect(tiny.omissions.some((o) => o.reason.startsWith("budget"))).toBe(true);
    expect(tiny.pages.get("rules/identity-rules.md")).toContain("ID-01");
  });

  it("fits the default 12,000-token budget with explicit estimates and omissions", () => {
    const s = buildSlice(ws, ws.ir(), loadSidecars(), { tasks: ["ingest-product-label"] });
    expect(s.budget.maxTokens).toBe(12_000);
    expect(s.budget.estimatedTokens).toBeLessThanOrEqual(12_000);
    expect(s.budget.exceeded).toBe(false);
    expect(s.included.map((p) => p.path)).toContain("tasks/ingest-product-label.md");
    expect(s.included.find((p) => p.path === "nodes/Product.md")).toBeDefined();
  });

  it("marks incomplete closure and refuses to call it compileable", () => {
    const s = buildSlice(ws, ws.ir(), loadSidecars(), { nodeTypes: ["LabelVersion"], endpointDepth: 0, maxTokens: 200_000 });
    expect(s.closure.complete).toBe(false);
    expect(s.closure.compileable).toBe(false);
    expect(s.closure.missingTypes.length).toBeGreaterThan(0);
    expect(s.closure.note).toMatch(/NOT a compileable/);
    expect(referencedTypes('type A @node { b: [B!]! @relationship(type: "X", direction: OUT, properties: "P") c: E }').sort()).toEqual(["B", "E", "P"]);
  });

  it("emits an advisory biotech-schema-context.v1 that grants no authority", () => {
    const s = buildSlice(ws, ws.ir(), loadSidecars(), { tasks: ["ingest-product-label"], questions: ["Q-D6-01"] });
    expect(SchemaContext.safeParse(s.context).success).toBe(true);
    expect(s.context.grantsAuthority).toBe(false);
    expect(s.context.release.schemaReleaseDigest).toBe(ws.manifest.release.schemaReleaseDigest);
    expect(s.context.route.operation).toBe("read+write");
    expect(s.context.route.pendingProposalKinds).not.toContain("state.attach"); // v2.1.0: state.attach is not a v2 kind (task-routes corrected)
    expect(s.context.route.proposalKinds).toContain("edge.assert");
    expect(s.context.route.patternTemplates).toContain("D6/Q-D6-01#1");
    const c = schemaContext(ws, { cardIds: ["node:Mention", "node:LabelVersion", "pred:DECLARES_COMPONENT", "rel:HAS_LABEL_VERSION"] });
    expect(c.unresolved.some((u) => u.startsWith("node:Mention"))).toBe(true);
    expect(c.decisions.predicates[0]?.route).toBe("typed-edge");
    expect(c.decisions.temporal[0]?.exclusive).toBe(true);
    expect(c.decisions.identity.find((d) => d.type === "LabelVersion")?.uidToken).toBe("label-version");
  });
});

describe("doctor and evaluation hooks", () => {
  it("doctor passes on the packaged workspace and outputs no environment values", async () => {
    process.env.BKS_DOCTOR_SECRET_PROBE = "do-not-print-me";
    const r = await doctor(wsDir);
    delete process.env.BKS_DOCTOR_SECRET_PROBE;
    expect(r.ok, JSON.stringify(r.checks.filter((c) => c.status === "fail"))).toBe(true);
    expect(JSON.stringify(r)).not.toContain("do-not-print-me");
    const mismatch = await doctor(wsDir, { expectRelease: `sha256:${"0".repeat(64)}` });
    expect(mismatch.ok).toBe(false);
  });

  it("scores Recall@10 and exact-ID hits deterministically against gold card ids", async () => {
    expect(normalizeGoldId("relationship:HAS_VARIANT")).toBe("rel:HAS_VARIANT");
    expect(normalizeGoldId("predicate:INHIBITS")).toBe("pred:INHIBITS");
    expect(queryOfPrompt("Release under test: ${RELEASE_ID} (x). Cite every schema card you rely on with its release-bound card id. Give the uid token of LabelVersion.")).toBe("Give the uid token of LabelVersion.");
    const file = join(tmp, "tasks.json");
    writeFileSync(file, JSON.stringify({ tasks: [{ id: "T1", prompt: "Which node type is LabelVersion?", category: "exact" }, { id: "T2", prompt: "Mention", category: "negative" }] }));
    writeFileSync(join(tmp, "gold.json"), JSON.stringify({ gold: { T1: { cardIds: ["node:LabelVersion"] }, T2: { cardIds: ["node:SourceLocator"] } } }));
    const { tasks } = loadEvalTasks(file);
    const r1 = await evalSearch(ws, { tasks });
    const r2 = await evalSearch(ws, { tasks });
    expect(r1).toEqual(r2);
    expect(r1.recallAt10).toBe(1);
    expect(r1.exactIdHitRateExactCategory).toBe(1);
    expect(r1.perTask[1]?.top[0]).toBe("node:SourceLocator");
  });
});
