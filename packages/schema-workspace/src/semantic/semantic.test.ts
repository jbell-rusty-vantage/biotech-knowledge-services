/**
 * S5 semantic retrieval, offline: corpus export, generation flow (resume, retry, quota abort, partial, publish,
 * retire, delete policy), the Vector Store retriever (filters, mapping validation, stale / unknown / injected hits,
 * timeout, ceilings, cache), hybrid fusion and fallback, doctor compatibility, and the qualification runner — all
 * against an in-memory fake provider. No network.
 */
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { build } from "../build.js";
import { doctor } from "../doctor.js";
import { writeWorkspace } from "../render.js";
import { normalizeTerm, tokenize } from "../search.js";
import { openWorkspace, searchWorkspace, type Workspace } from "../workspace.js";
import { generationCompatibility } from "./config.js";
import { CORPUS_POLICY, exportCorpus } from "./corpus.js";
import { deleteGeneration, generate, publishGeneration, readGeneration, readLedger, readPointer, retireGeneration } from "./generation.js";
import { ProviderError, type Attributes, type Filter, type SearchResult, type VectorProvider } from "./provider.js";
import { qualify } from "./qualify.js";
import { createVectorStoreRetriever } from "./vector-store-retriever.js";

vi.setConfig({ testTimeout: 120_000, hookTimeout: 180_000 });

/** In-memory provider: files, stores, batches and a token-overlap "vector" search that honours attribute filters. */
export class FakeProvider implements VectorProvider {
  readonly id = "fake";
  files = new Map<string, { name: string; text: string }>();
  stores = new Map<string, { name: string; metadata: Record<string, string>; files: Map<string, { attributes: Attributes; status: "completed" | "failed" }> }>();
  calls = { upload: 0, search: 0, batch: 0 };
  failUploadOnce = new Set<string>();
  quotaOnUpload = false;
  failIndexing = new Set<string>();
  searchDelayMs = 0;
  private n = 0;
  async uploadFile(filename: string, content: string) {
    this.calls.upload++;
    if (this.quotaOnUpload) throw new ProviderError("quota", "insufficient_quota (fake)", 429);
    if (this.failUploadOnce.has(filename)) {
      this.failUploadOnce.delete(filename);
      throw new ProviderError("provider-error", "transient (fake)", 500);
    }
    const id = `file-${++this.n}`;
    this.files.set(id, { name: filename, text: content });
    return { id, bytes: Buffer.byteLength(content) };
  }
  async createStore(name: string, metadata: Record<string, string>) {
    const id = `vs_fake_${++this.n}`;
    this.stores.set(id, { name, metadata, files: new Map() });
    return { id };
  }
  async addFileBatch(storeId: string, files: Array<{ fileId: string; attributes: Attributes }>) {
    this.calls.batch++;
    const s = this.stores.get(storeId)!;
    for (const f of files) s.files.set(f.fileId, { attributes: f.attributes, status: this.failIndexing.has(String(f.attributes.section)) ? "failed" : "completed" });
    const failed = files.filter((f) => this.failIndexing.has(String(f.attributes.section))).length;
    return { id: `batch-${++this.n}`, status: "completed", fileCounts: { in_progress: 0, completed: files.length - failed, failed, cancelled: 0, total: files.length } };
  }
  async listStoreFiles(storeId: string) {
    return [...this.stores.get(storeId)!.files.entries()].map(([id, f]) => ({ id, status: f.status, attributes: f.attributes, usageBytes: this.files.get(id)!.text.length, lastError: f.status === "failed" ? { code: "server_error", message: "fake" } : null, chunking: null }));
  }
  async retrieveStore(storeId: string) {
    const s = this.stores.get(storeId)!;
    const failed = [...s.files.values()].filter((f) => f.status === "failed").length;
    return { id: storeId, name: s.name, status: "completed", usageBytes: 1, fileCounts: { in_progress: 0, completed: s.files.size - failed, failed, cancelled: 0, total: s.files.size }, createdAt: 0, metadata: s.metadata };
  }
  async search(storeId: string, p: { query: string; maxNumResults: number; filters?: Filter }, o: { timeoutMs: number }): Promise<SearchResult[]> {
    this.calls.search++;
    if (this.searchDelayMs > o.timeoutMs) throw new ProviderError("timeout", "Request timed out (fake)");
    const s = this.stores.get(storeId);
    if (!s) throw new ProviderError("not-found", "No vector store found (fake)", 404);
    const q = new Set(tokenize(p.query));
    const scored: SearchResult[] = [];
    for (const [id, f] of s.files) {
      if (f.status !== "completed" || (p.filters && !matches(p.filters, f.attributes))) continue;
      const text = this.files.get(id)!.text;
      const toks = new Set(tokenize(text));
      const overlap = [...q].filter((t) => toks.has(t)).length;
      if (overlap) scored.push({ fileId: id, filename: this.files.get(id)!.name, score: overlap / (q.size || 1), attributes: f.attributes, text: text.slice(0, 200) });
    }
    return scored.sort((a, b) => b.score - a.score || (a.fileId < b.fileId ? -1 : 1)).slice(0, p.maxNumResults);
  }
  async deleteStore(storeId: string) {
    this.stores.delete(storeId);
  }
  async deleteFile(fileId: string) {
    this.files.delete(fileId);
  }
}

function matches(f: Filter, a: Attributes): boolean {
  if (f.type === "and") return f.filters.every((x) => matches(x, a));
  if (f.type === "or") return f.filters.some((x) => matches(x, a));
  const v = a[f.key];
  if (f.type === "eq") return v === f.value;
  if (f.type === "ne") return v !== f.value;
  if (f.type === "in") return Array.isArray(f.value) && f.value.includes(v as string);
  return Array.isArray(f.value) && !f.value.includes(v as string);
}

let tmp: string;
let ws: Workspace;
let custody: string;

beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), "bks-semantic-"));
  writeWorkspace(build(), join(tmp, "workspace"));
  ws = openWorkspace(join(tmp, "workspace"));
  custody = join(tmp, "custody");
  process.env.BKS_SEMANTIC_CUSTODY_DIR = custody;
});
afterAll(() => {
  delete process.env.BKS_SEMANTIC_CUSTODY_DIR;
  rmSync(tmp, { recursive: true, force: true });
});

describe("approved corpus export", () => {
  it("is deterministic, bounded and only contains approved generated cards", () => {
    const a = exportCorpus(ws);
    const b = exportCorpus(ws);
    expect(a.manifest.corpusDigest).toBe(b.manifest.corpusDigest);
    expect(a.manifest.totals.bytes).toBeLessThan(CORPUS_POLICY.maxCorpusBytes);
    for (const d of a.documents) {
      expect(d.sourcePath).toMatch(/^(nodes|relationships|edge-properties|interfaces|unions|vocabularies|domains|modules|tasks|predicates|assessments|rules|patterns)\//);
      expect(d.sourcePath).not.toMatch(/^(sdl|search|migrations)\/|^vocabularies\/release\/|^patterns\/questions\/|catalog\.json|schema-ir/);
      expect(ws.manifest.inventory[d.sourcePath]?.sha256).toBe(d.sourceSha256);
      expect(d.text).toContain(`card: ${d.cardId}`);
      // release-stable header: no release digest, card digest or workspace fingerprint in the text; all are attributes
      expect(d.text).not.toContain(ws.manifest.workspaceFingerprint);
      expect(d.text).not.toContain(ws.manifest.release.schemaReleaseDigest);
      expect(d.text).not.toContain(d.cardDigest);
      expect(d.text).toContain(`module: ${d.module}`);
      expect(d.attributes.workspace_fingerprint).toBe(ws.manifest.workspaceFingerprint);
      expect(d.attributes.release_digest).toBe(ws.manifest.release.schemaReleaseDigest);
      expect(d.attributes.card_digest).toBe(d.cardDigest);
      expect(d.tokensEst).toBeLessThanOrEqual(1250);
      expect(Object.keys(d.attributes).length).toBeLessThanOrEqual(16);
      for (const [k, v] of Object.entries(d.attributes)) {
        expect(k.length).toBeLessThanOrEqual(64);
        expect(String(v).length).toBeLessThanOrEqual(512);
      }
    }
    const pattern = a.documents.find((d) => d.kind === "pattern")!;
    expect(pattern.text).not.toContain("## Statement");
    const multi = a.documents.filter((d) => d.parts > 1);
    expect(multi.length).toBeGreaterThan(0);
    expect(new Set(a.documents.map((d) => d.docId)).size).toBe(a.documents.length);
    expect(new Set(a.documents.map((d) => d.filename.toLowerCase())).size).toBe(a.documents.length);
  });
});

describe("generation flow", () => {
  it("uploads with bounded retries, indexes, verifies attributes, publishes atomically and retains history", async () => {
    const p = new FakeProvider();
    const corpus = exportCorpus(ws);
    p.failUploadOnce.add(corpus.documents[3]!.filename);
    const g1 = await generate({ ws, provider: p, custodyDir: custody, generationId: "gtest-1", batchSize: 400 });
    expect(g1.status).toBe("ready");
    expect(g1.files.completed).toBe(corpus.documents.length);
    expect(Object.keys(readGeneration("gtest-1", custody)!.mapping)).toHaveLength(corpus.documents.length);
    expect(p.calls.upload).toBe(corpus.documents.length + 1);
    // resume: a second run uploads nothing
    const before = p.calls.upload;
    expect((await generate({ ws, provider: p, custodyDir: custody, generationId: "gtest-1" })).status).toBe("ready");
    expect(p.calls.upload).toBe(before);
    publishGeneration("gtest-1", custody);
    expect(readPointer(custody)?.generationId).toBe("gtest-1");
    expect(generationCompatibility(ws, custody).state).toBe("compatible");
    // a second generation republished keeps the first in history
    const g2 = await generate({ ws, provider: p, custodyDir: custody, generationId: "gtest-2" });
    expect(g2.status).toBe("ready");
    publishGeneration("gtest-2", custody);
    expect(readPointer(custody)?.history.map((h) => h.generationId)).toEqual(["gtest-1"]);
    // budget: at most two generations
    await expect(generate({ ws, provider: p, custodyDir: custody, generationId: "gtest-3" })).rejects.toThrow(/generation budget/);
    expect(readLedger(custody).generationsStarted).toEqual(["gtest-1", "gtest-2"]);
  });

  it("refreshes attribute-only when no document byte changed, and re-uploads only changed documents", async () => {
    const c4 = join(tmp, "custody-refresh");
    const p = new FakeProvider();
    const base = await generate({ ws, provider: p, custodyDir: c4, generationId: "gbase" });
    expect(base.status).toBe("ready");
    publishGeneration("gbase", c4);
    expect(generationCompatibility(ws, c4).state).toBe("compatible");
    // a rebuilt workspace whose card bytes are unchanged: only the fingerprint (an attribute) differs
    const rebuilt = { ...ws, manifest: { ...ws.manifest, workspaceFingerprint: `sha256:${"4".repeat(64)}` } } as Workspace;
    const compat = generationCompatibility(rebuilt, c4);
    expect(compat.state).toBe("refreshable");
    expect(compat.changedDocuments).toMatchObject({ changed: 0, added: 0, removed: 0 });
    expect(exportCorpus(rebuilt).manifest.contentDigest).toBe(exportCorpus(ws).manifest.contentDigest);
    expect(exportCorpus(rebuilt).manifest.corpusDigest).not.toBe(exportCorpus(ws).manifest.corpusDigest);
    const uploads = p.calls.upload;
    const r = await generate({ ws: rebuilt, provider: p, custodyDir: c4, generationId: "grefresh", reuseFrom: "gbase" });
    expect(r.status).toBe("ready");
    expect(p.calls.upload).toBe(uploads);
    expect(r.files.reused).toBe(r.documents);
    expect(r.files.newlyUploaded).toBe(0);
    const store = p.stores.get(r.storeId!)!;
    expect([...store.files.values()].every((f) => f.attributes.workspace_fingerprint === rebuilt.manifest.workspaceFingerprint)).toBe(true);
    expect([...p.stores.get(base.storeId!)!.files.values()].every((f) => f.attributes.workspace_fingerprint === ws.manifest.workspaceFingerprint)).toBe(true);
  });

  it("re-uploads only documents whose bytes differ from the reused generation", async () => {
    const c5 = join(tmp, "custody-partial-reuse");
    const p = new FakeProvider();
    await generate({ ws, provider: p, custodyDir: c5, generationId: "ga" });
    const prog = JSON.parse(readFileSync(join(c5, "ga", "progress.json"), "utf8"));
    const first = Object.keys(prog.uploads)[0]!;
    prog.uploads[first].sha256 = `sha256:${"5".repeat(64)}`;
    const { writeFileSync } = await import("node:fs");
    writeFileSync(join(c5, "ga", "progress.json"), JSON.stringify(prog));
    const uploads = p.calls.upload;
    const r = await generate({ ws, provider: p, custodyDir: c5, generationId: "gb", reuseFrom: "ga" });
    expect(r.status).toBe("ready");
    expect(p.calls.upload - uploads).toBe(1);
    expect(r.files.newlyUploaded).toBe(1);
  });

  it("aborts a refresh before any provider call when the planned uploads exceed the cap", async () => {
    const c6 = join(tmp, "custody-cap");
    const p = new FakeProvider();
    await generate({ ws, provider: p, custodyDir: c6, generationId: "gcap-a" });
    const prog = JSON.parse(readFileSync(join(c6, "gcap-a", "progress.json"), "utf8"));
    for (const k of Object.keys(prog.uploads).slice(0, 3)) prog.uploads[k].sha256 = `sha256:${"6".repeat(64)}`;
    const { writeFileSync } = await import("node:fs");
    writeFileSync(join(c6, "gcap-a", "progress.json"), JSON.stringify(prog));
    const before = { ...p.calls };
    const ledgerBefore = readLedger(c6).generationsStarted.length;
    await expect(generate({ ws, provider: p, custodyDir: c6, generationId: "gcap-b", reuseFrom: "gcap-a", maxUploads: 2 })).rejects.toMatchObject({ code: "UPLOAD_CAP", details: { plannedUploads: 3, cap: 2 } });
    expect(p.calls).toEqual(before);
    expect(readLedger(c6).generationsStarted.length).toBe(ledgerBefore);
    const ok = await generate({ ws, provider: p, custodyDir: c6, generationId: "gcap-b", reuseFrom: "gcap-a", maxUploads: 3, maxGenerations: 3 });
    expect(ok.status).toBe("ready");
    expect(ok.files.newlyUploaded).toBe(3);
  });

  it("a release bump with identical card bodies needs zero uploads (re-rendered workspace, fake provider)", async () => {
    const c7 = join(tmp, "custody-bump");
    const p = new FakeProvider();
    const g1 = await generate({ ws, provider: p, custodyDir: c7, generationId: "grel-1" });
    expect(g1.status).toBe("ready");
    publishGeneration("grel-1", c7);
    // simulate the next release: new release id and digest, same SDL and workspace inputs
    const { loadRelease } = await import("../release.js");
    const { renderWorkspace } = await import("../render.js");
    const { loadSidecars } = await import("../sidecars.js");
    const release = loadRelease();
    const bumped = { ...release, schemaReleaseDigest: `sha256:${"7".repeat(64)}`, manifest: { ...release.manifest, releaseId: "biotech-schema-v9.9.9" } };
    const bumpedDir = join(tmp, "workspace-bumped");
    writeWorkspace(renderWorkspace({ release: bumped, sidecars: loadSidecars(release.workspaceInputs.dir) }), bumpedDir);
    const ws2 = openWorkspace(bumpedDir);
    expect(ws2.manifest.release.schemaReleaseDigest).toBe(bumped.schemaReleaseDigest);
    expect(ws2.manifest.workspaceFingerprint).not.toBe(ws.manifest.workspaceFingerprint);
    // every card digest changed (front matter carries the release digest) ...
    const changedDigests = ws2.index.filter((r) => r.cardDigest && ws.record(r.id)?.cardDigest !== r.cardDigest).length;
    expect(changedDigests).toBeGreaterThan(900);
    // ... yet only documents of cards whose BODY changed differ (a card body that names the release, such as the
    // compatibility statement, legitimately changes); every card with an identical body keeps identical document bytes
    const { parseCard } = await import("../card.js");
    const bodyOf = (dir: string, p: string) => parseCard(readFileSync(join(dir, ...p.split("/")), "utf8"))!.body;
    const before = new Map(exportCorpus(ws).documents.map((d) => [d.docId, d.sha256]));
    const after = exportCorpus(ws2).documents;
    const bodyChanged = new Set(after.filter((d) => bodyOf(ws.dir, d.sourcePath) !== bodyOf(ws2.dir, d.sourcePath)).map((d) => d.docId));
    const identicalBody = after.filter((d) => !bodyChanged.has(d.docId));
    expect(identicalBody.length).toBeGreaterThan(1100);
    expect(identicalBody.filter((d) => before.get(d.docId) !== d.sha256)).toEqual([]);
    expect(bodyChanged.size).toBeLessThanOrEqual(2);
    // A card body change may touch only one of the card's documents (a long card is split into parts, and only the
    // part that names the release changes; SV-11 release v2.2.0's compatibility rule does this): count documents.
    const docChanged = new Set(after.filter((d) => before.get(d.docId) !== d.sha256).map((d) => d.docId));
    expect([...docChanged].every((id) => bodyChanged.has(id))).toBe(true);
    expect(docChanged.size).toBeGreaterThanOrEqual(1);
    const compat = generationCompatibility(ws2, c7);
    expect(compat.changedDocuments).toMatchObject({ changed: docChanged.size, added: 0, removed: 0 });
    expect(compat.changedDocuments!.attributesOnly).toBe(after.length - docChanged.size);
    const uploads = p.calls.upload;
    const g2 = await generate({ ws: ws2, provider: p, custodyDir: c7, generationId: "grel-2", reuseFrom: "grel-1", maxUploads: docChanged.size });
    expect(g2.status).toBe("ready");
    expect(p.calls.upload - uploads).toBe(docChanged.size);
    expect(g2.files.newlyUploaded).toBe(docChanged.size);
    expect(g2.files.reused).toBe(after.length - docChanged.size);
    const attrs = [...p.stores.get(g2.storeId!)!.files.values()].map((f) => f.attributes);
    expect(attrs.every((a) => a.release_digest === bumped.schemaReleaseDigest && a.workspace_fingerprint === ws2.manifest.workspaceFingerprint)).toBe(true);
    publishGeneration("grel-2", c7);
    expect(generationCompatibility(ws2, c7).state).toBe("compatible");
  });

  it("deactivates before deleting and never deletes the current or a retained generation", async () => {
    const p = new FakeProvider();
    expect(() => retireGeneration("gtest-2", custody)).toThrow(/current/);
    const r = retireGeneration("gtest-1", custody, new Date("2026-10-12T00:00:00Z"), 14);
    expect(r.status).toBe("deactivated");
    await expect(deleteGeneration(p, "gtest-1", { custodyDir: custody, now: new Date("2026-10-13T00:00:00Z"), confirm: true })).rejects.toThrow(/retained until/);
    await expect(deleteGeneration(p, "gtest-2", { custodyDir: custody, confirm: true })).rejects.toThrow(/current/);
    await expect(deleteGeneration(p, "gtest-1", { custodyDir: custody, confirm: false })).rejects.toThrow(/confirm/);
  });

  it("never marks partial indexing ready, refuses to publish it, and aborts on quota", async () => {
    const c2 = join(tmp, "custody-partial");
    const p = new FakeProvider();
    const corpus = exportCorpus(ws);
    p.failIndexing.add(corpus.documents[10]!.docId);
    const g = await generate({ ws, provider: p, custodyDir: c2, generationId: "gpartial" });
    expect(g.status).toBe("partial");
    expect(g.problems.some((x) => x.includes(corpus.documents[10]!.docId))).toBe(true);
    expect(() => publishGeneration("gpartial", c2)).toThrow(/not ready|partial/);
    const q = new FakeProvider();
    q.quotaOnUpload = true;
    await expect(generate({ ws, provider: q, custodyDir: join(tmp, "custody-quota"), generationId: "gquota" })).rejects.toMatchObject({ failure: "quota" });
  });
});

describe("vector store retriever, fusion and fallback", () => {
  const bind = (p: VectorProvider, extra: Record<string, unknown> = {}) => createVectorStoreRetriever({ provider: p, generation: readGeneration("gtest-2", custody)!, workspace: { schemaReleaseDigest: ws.manifest.release.schemaReleaseDigest, workspaceFingerprint: ws.manifest.workspaceFingerprint }, ...extra });
  let provider: FakeProvider;
  beforeAll(async () => {
    provider = new FakeProvider();
    const c3 = join(tmp, "custody-live-fake");
    await generate({ ws, provider, custodyDir: c3, generationId: "gtest-2" });
    custody = c3;
  });

  it("searches with the exact release filter, validates the mapping and rehydrates local cards", async () => {
    const r = bind(provider);
    const res = await r.search({ query: "label version per serving", limit: 20, filters: {}, release: { schemaReleaseDigest: ws.manifest.release.schemaReleaseDigest, workspaceFingerprint: ws.manifest.workspaceFingerprint }, deadlineMs: 5000 });
    expect(res.status.state).toBe("available");
    expect(res.hits.length).toBeGreaterThan(0);
    for (const h of res.hits) expect(ws.record(h.cardId)?.cardDigest).toBe(h.cardDigest);
    const again = await r.search({ query: "Label  version per serving", limit: 20, filters: {}, release: { schemaReleaseDigest: ws.manifest.release.schemaReleaseDigest, workspaceFingerprint: ws.manifest.workspaceFingerprint }, deadlineMs: 5000 });
    expect(again).toBe(res);
    expect(r.stats().cacheHits).toBe(1);
    expect(normalizeTerm("Label  version per serving")).toBe("label version per serving");
    const wrong = bind(provider, { releaseFilterOverride: `sha256:${"0".repeat(64)}` });
    expect((await wrong.search({ query: "label version", limit: 20, filters: {}, release: { schemaReleaseDigest: ws.manifest.release.schemaReleaseDigest, workspaceFingerprint: ws.manifest.workspaceFingerprint }, deadlineMs: 5000 })).hits).toEqual([]);
  });

  it("rejects unknown and attribute-mismatched hosted hits", async () => {
    const injecting: VectorProvider = { ...provider, id: "inject", search: async (id, p, o) => [{ fileId: "file-unknown", filename: "x", score: 1, attributes: { card_id: "node:Product" }, text: "" }, ...(await provider.search(id, p, o)).map((x, i) => (i === 0 ? { ...x, attributes: { ...x.attributes, card_digest: `sha256:${"9".repeat(64)}` } } : x))] };
    const r = bind(injecting);
    const res = await searchWorkspace(ws, { query: "label version", mode: "semantic", retriever: r });
    expect(res.status).toBe("ok");
    expect(res.rejectedHostedHits).toBeGreaterThanOrEqual(2);
    expect(res.hits.some((h) => h.id === "node:Product" && h.matchedOn === "semantic" && !ws.record("node:Product"))).toBe(false);
  });

  it("degrades explicitly on timeout, missing store, ceilings and stale workspace", async () => {
    const slow = new FakeProvider();
    Object.assign(slow, { stores: provider.stores, files: provider.files, searchDelayMs: 10 });
    const t = await searchWorkspace(ws, { query: "label version", mode: "hybrid", retriever: bind(slow, { deadlineMs: 1 }) });
    expect(t.status).toBe("degraded");
    expect(t.mode).toBe("lexical-only");
    expect(t.degradation?.reason).toMatch(/^timeout/);
    expect(t.hits[0]?.id).toBe("node:LabelVersion");
    const g = readGeneration("gtest-2", custody)!;
    const missing = createVectorStoreRetriever({ provider, generation: { ...g, record: { ...g.record, storeId: "vs_missing" } }, workspace: { schemaReleaseDigest: ws.manifest.release.schemaReleaseDigest, workspaceFingerprint: ws.manifest.workspaceFingerprint } });
    const m = await searchWorkspace(ws, { query: "label version", mode: "semantic", retriever: missing });
    expect(m.status).toBe("unavailable");
    expect(m.hits).toEqual([]);
    expect(m.degradation?.reason).toMatch(/^not-found/);
    const capped = bind(provider, { maxRequests: 0 });
    expect((await searchWorkspace(ws, { query: "x y z", mode: "semantic", retriever: capped })).degradation?.reason).toMatch(/ceiling/);
    const before = provider.calls.search;
    const stale = createVectorStoreRetriever({ provider, generation: g, workspace: { schemaReleaseDigest: ws.manifest.release.schemaReleaseDigest, workspaceFingerprint: `sha256:${"1".repeat(64)}` } });
    const s = await searchWorkspace(ws, { query: "label version", mode: "hybrid", retriever: stale });
    expect(s.mode).toBe("lexical-only");
    expect(s.degradation?.reason).toMatch(/stale generation/);
    expect(provider.calls.search).toBe(before);
  });

  it("fuses by RRF with exact matches first and dedupes by card", async () => {
    const res = await searchWorkspace(ws, { query: "LabelVersion", mode: "hybrid", retriever: bind(provider) });
    expect(res.status).toBe("ok");
    expect(res.hits[0]?.id).toBe("node:LabelVersion");
    expect(new Set(res.hits.map((h) => h.id)).size).toBe(res.hits.length);
    expect(res.hits.length).toBeLessThanOrEqual(10);
  });

  it("doctor reports generation compatibility (compatible, then stale) without provider calls", async () => {
    publishGeneration("gtest-2", custody);
    const ok = await doctor(ws.dir, { semanticCustodyDir: custody, pinned: false });
    expect(ok.checks.find((c) => c.id === "semantic")?.status).toBe("pass");
    const raw = JSON.parse(readFileSync(join(custody, "gtest-2", "generation.json"), "utf8"));
    raw.workspaceFingerprint = `sha256:${"3".repeat(64)}`;
    const { writeFileSync } = await import("node:fs");
    writeFileSync(join(custody, "gtest-2", "generation.json"), JSON.stringify(raw));
    const warn = await doctor(ws.dir, { semanticCustodyDir: custody, pinned: false });
    expect(warn.checks.find((c) => c.id === "semantic")?.status).toBe("warn");
    expect(warn.ok).toBe(true);
    raw.workspaceFingerprint = ws.manifest.workspaceFingerprint;
    writeFileSync(join(custody, "gtest-2", "generation.json"), JSON.stringify(raw));
    expect(existsSync(join(custody, "current.json"))).toBe(true);
  });

  it("runs the qualification flow (three modes, decision, round trip, fallback tests) on a fake provider", async () => {
    const tasks = [
      { id: "T1", prompt: "Which node type holds the printed facts panel of a package as of one label version?", category: "paraphrase", gold: ["node:LabelVersion"] },
      { id: "T2", prompt: "LabelVersion", category: "exact", gold: ["node:LabelVersion"] },
      { id: "T3", prompt: "Which relationship ties an assertion to the media work in which it was said?", category: "paraphrase", gold: ["rel:OCCURS_IN"] },
    ];
    provider.searchDelayMs = 2; // only the 1 ms-deadline probe times out
    const r = await qualify({ ws, tasks, provider, generation: readGeneration("gtest-2", custody)!, corpus: exportCorpus(ws).manifest, roundTripSample: 5 });
    expect(r.modes.lexical.recallAt10).toBeGreaterThan(0);
    expect(typeof r.decision.hybridDefault).toBe("boolean");
    expect(r.roundTrip.sampled).toBe(5);
    expect(r.roundTrip.found).toBe(5);
    for (const f of r.fallback) expect(f.passed, `${f.test}: ${f.observed}`).toBe(true);
    expect(r.usage.cacheHits).toBeGreaterThanOrEqual(tasks.length);
  });
});
