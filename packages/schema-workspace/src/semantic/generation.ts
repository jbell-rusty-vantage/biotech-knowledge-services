/**
 * Schema-index generations (SPECIFICATION 4.2): one OpenAI Vector Store per immutable generation, named
 * `bks-schema-<releaseId>-<generationId>`. Flow: export the approved corpus -> upload files (resumable, bounded
 * retries) -> create the store -> attach files in batches with per-file attributes and static chunking -> poll to
 * completion -> verify every file and attribute -> mark ready -> publish the `current.json` pointer atomically.
 * Partial indexing is never ready. Previous generations are retained; retirement is deactivate-before-delete.
 *
 * Custody layout (gitignored): <custody>/semantic/
 *   current.json                       pointer {generationId, storeId, ...}, history of previous pointers
 *   usage-ledger.json                  cumulative calls / bytes / generations (budget ceilings)
 *   <generationId>/corpus-manifest.json, corpus/*.md, progress.json, mapping.json, generation.json
 * Store ids and file ids live only in custody, never in Git.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { repoRoot } from "../load.js";
import type { Workspace } from "../workspace.js";
import { exportCorpus, writeCorpus, type CorpusDocument, type CorpusManifest } from "./corpus.js";
import { classifyProviderError, OPENAI_SDK_PACKAGE, OPENAI_SDK_VERSION, ProviderError, type Attributes, type ChunkingStrategy, type VectorProvider } from "./provider.js";

export const GENERATION_FORMAT = "bks-semantic-generation.v1" as const;
export const DEFAULT_CHUNKING: ChunkingStrategy = { type: "static", static: { max_chunk_size_tokens: 800, chunk_overlap_tokens: 100 } };
export const SEARCH_CONFIG = { maxNumResults: 20, rewriteQuery: false, ranker: "auto", scoreThreshold: 0, deadlineMs: 5000, maxQueryChars: 2000, fusion: "rrf", rrfK: 60, lexicalTop: 20, semanticTop: 20, resultTop: 10 } as const;
export const BUDGET = { maxGenerations: 2, maxSearchCalls: 600, maxUploadBytes: 25 * 1024 * 1024 } as const;

export const defaultCustodyDir = (): string => resolve(repoRoot, "runs", "release-v2", "custody", "semantic");

export interface MapEntry {
  docId: string;
  cardId: string;
  cardDigest: string;
  filename: string;
  sha256: string;
  attributes: Attributes;
}

export interface GenerationRecord {
  format: typeof GENERATION_FORMAT;
  generationId: string;
  storeId: string | null;
  storeName: string;
  releaseId: string;
  schemaReleaseDigest: string;
  workspaceFingerprint: string;
  corpusDigest: string;
  /** Fingerprint-independent corpus digest (document ids, bytes, attributes without workspace_fingerprint). */
  contentDigest?: string;
  /** Generation whose uploaded files were reused for byte-identical documents (refresh). */
  reusedFrom?: string;
  status: "building" | "indexing" | "ready" | "partial" | "failed" | "deactivated";
  sdk: { package: string; version: string };
  api: string;
  chunking: ChunkingStrategy;
  searchConfig: typeof SEARCH_CONFIG;
  attributeKeys: string[];
  createdAt: string;
  readyAt?: string;
  deactivatedAt?: string;
  retainUntil?: string;
  documents: number;
  files: { uploaded: number; completed: number; failed: number; inProgress: number; attributeMismatches: number; reused?: number; newlyUploaded?: number };
  provider?: { storeStatus: string; usageBytes: number; fileCounts: Record<string, number>; metadata: Record<string, string> | null; embeddingModel: string };
  problems: string[];
}

export interface UsageLedger {
  format: "bks-semantic-usage.v1";
  generationsStarted: string[];
  uploads: number;
  uploadedBytes: number;
  searchCalls: number;
  otherCalls: number;
  events: Array<{ at: string; kind: string; detail: string }>;
}

export interface Progress {
  uploads: Record<string, { fileId: string; sha256: string; bytes: number; reusedFrom?: string }>;
  storeId: string | null;
  attached: string[];
  batches: Array<{ id: string; status: string; fileCounts: Record<string, number> }>;
}

const readJson = <T>(p: string, fallback: T): T => (existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as T) : fallback);

/** Atomic JSON write: temp file in the same directory, then rename. */
export function writeJsonAtomic(path: string, value: unknown): void {
  mkdirSync(resolve(path, ".."), { recursive: true });
  const tmp = `${path}.tmp-${process.pid}-${Date.now()}`;
  writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  renameSync(tmp, path);
}

export function readLedger(custody: string): UsageLedger {
  return readJson(join(custody, "usage-ledger.json"), { format: "bks-semantic-usage.v1", generationsStarted: [], uploads: 0, uploadedBytes: 0, searchCalls: 0, otherCalls: 0, events: [] });
}

export function recordUsage(custody: string, delta: Partial<Pick<UsageLedger, "uploads" | "uploadedBytes" | "searchCalls" | "otherCalls">>, event?: { kind: string; detail: string }): UsageLedger {
  const l = readLedger(custody);
  l.uploads += delta.uploads ?? 0;
  l.uploadedBytes += delta.uploadedBytes ?? 0;
  l.searchCalls += delta.searchCalls ?? 0;
  l.otherCalls += delta.otherCalls ?? 0;
  if (event) l.events.push({ at: new Date().toISOString(), ...event });
  writeJsonAtomic(join(custody, "usage-ledger.json"), l);
  return l;
}

export function newGenerationId(corpusDigest: string, now = new Date()): string {
  return `g${now.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z")}-${corpusDigest.slice(7, 15)}`;
}

export function storeNameOf(releaseId: string, generationId: string): string {
  return `bks-schema-${releaseId}-${generationId}`;
}

/** Retries transient provider failures (rate limit, provider error, timeout) with backoff; quota / billing / auth abort. */
async function withRetry<T>(label: string, f: () => Promise<T>, attempts = 4): Promise<T> {
  let last: ProviderError | undefined;
  for (let i = 0; i < attempts; i++) {
    try {
      return await f();
    } catch (error) {
      last = classifyProviderError(error);
      if (["quota", "billing", "auth", "bad-request", "not-found"].includes(last.failure)) throw last;
      await new Promise((r) => setTimeout(r, 500 * 2 ** i));
    }
  }
  throw new ProviderError(last?.failure ?? "provider-error", `${label}: ${last?.message ?? "failed"} after ${attempts} attempts`);
}

export interface GenerateOptions {
  ws: Workspace;
  provider: VectorProvider;
  custodyDir?: string;
  generationId?: string;
  /**
   * Refresh: reuse the uploaded files of this earlier generation for every document whose bytes are unchanged
   * (same docId and sha256). Only changed or new documents are uploaded; every file is attached to the new store
   * with the current attributes. The earlier generation's store is never mutated (generations stay immutable).
   */
  reuseFrom?: string;
  /** Pre-flight ceiling on uploads for this run (after reuse); exceeding it aborts before any provider call. */
  maxUploads?: number;
  /** Lead-authorized generation budget for this run (default BUDGET.maxGenerations). */
  maxGenerations?: number;
  chunking?: ChunkingStrategy;
  concurrency?: number;
  batchSize?: number;
  pollIntervalMs?: number;
  log?: (msg: string) => void;
}

/** Runs (or resumes) one generation to `ready` or `partial`. Never publishes; call publishGeneration afterwards. */
export async function generate(opts: GenerateOptions): Promise<GenerationRecord> {
  const custody = opts.custodyDir ?? defaultCustodyDir();
  const log = opts.log ?? (() => undefined);
  const corpus = exportCorpus(opts.ws);
  const generationId = opts.generationId ?? newGenerationId(corpus.manifest.corpusDigest);
  const dir = join(custody, generationId);
  // Pre-flight (no provider call): how many documents would be uploaded after reusing an earlier generation's files?
  const reusable = new Map<string, string>();
  if (opts.reuseFrom) {
    const prev = readJson<Progress>(join(custody, opts.reuseFrom, "progress.json"), { uploads: {}, storeId: null, attached: [], batches: [] });
    for (const [docId, u] of Object.entries(prev.uploads)) reusable.set(docId, u.sha256);
  }
  const already = readJson<Progress>(join(custody, generationId, "progress.json"), { uploads: {}, storeId: null, attached: [], batches: [] });
  const plannedUploads = corpus.documents.filter((d) => already.uploads[d.docId]?.sha256 !== d.sha256 && reusable.get(d.docId) !== d.sha256).length;
  if (opts.maxUploads !== undefined && plannedUploads > opts.maxUploads) {
    throw new GenerationAbort("UPLOAD_CAP", `refresh would upload ${plannedUploads} of ${corpus.documents.length} documents (${corpus.documents.length - plannedUploads} reusable), above the ${opts.maxUploads}-upload cap; nothing was sent to the provider`, { plannedUploads, documents: corpus.documents.length, reusable: corpus.documents.length - plannedUploads, cap: opts.maxUploads });
  }
  const maxGenerations = opts.maxGenerations ?? BUDGET.maxGenerations;
  const ledger = readLedger(custody);
  if (!ledger.generationsStarted.includes(generationId)) {
    if (ledger.generationsStarted.length >= maxGenerations) throw new ProviderError("billing", `generation budget exhausted (${ledger.generationsStarted.length}/${maxGenerations} started)`);
    if (corpus.manifest.totals.bytes > BUDGET.maxUploadBytes) throw new ProviderError("billing", `corpus ${corpus.manifest.totals.bytes} bytes exceeds the ${BUDGET.maxUploadBytes}-byte ceiling`);
    ledger.generationsStarted.push(generationId);
    ledger.events.push({ at: new Date().toISOString(), kind: "generation-start", detail: `${generationId} (${corpus.manifest.counts.documents} documents, ${corpus.manifest.totals.bytes} bytes)` });
    writeJsonAtomic(join(custody, "usage-ledger.json"), ledger);
  }
  const existingManifest = readJson<CorpusManifest | null>(join(dir, "corpus-manifest.json"), null);
  if (existingManifest && existingManifest.corpusDigest !== corpus.manifest.corpusDigest) throw new Error(`generation ${generationId} was started from a different corpus (${existingManifest.corpusDigest}); start a new generation`);
  if (!existingManifest) writeCorpus(dir, corpus);
  const chunking = opts.chunking ?? DEFAULT_CHUNKING;
  const rel = opts.ws.manifest.release;
  const record: GenerationRecord = readJson<GenerationRecord | null>(join(dir, "generation.json"), null) ?? {
    format: GENERATION_FORMAT,
    generationId,
    storeId: null,
    storeName: storeNameOf(rel.releaseId, generationId),
    releaseId: rel.releaseId,
    schemaReleaseDigest: rel.schemaReleaseDigest,
    workspaceFingerprint: opts.ws.manifest.workspaceFingerprint,
    corpusDigest: corpus.manifest.corpusDigest,
    contentDigest: corpus.manifest.contentDigest,
    ...(opts.reuseFrom ? { reusedFrom: opts.reuseFrom } : {}),
    status: "building",
    sdk: { package: OPENAI_SDK_PACKAGE, version: OPENAI_SDK_VERSION },
    api: "OpenAI REST v1: files.create(purpose=assistants), vectorStores.create, vectorStores.fileBatches.createAndPoll(files[].attributes, chunking_strategy), vectorStores.files.list, vectorStores.retrieve, vectorStores.search",
    chunking,
    searchConfig: SEARCH_CONFIG,
    attributeKeys: Object.keys(corpus.documents[0]?.attributes ?? {}),
    createdAt: new Date().toISOString(),
    documents: corpus.documents.length,
    files: { uploaded: 0, completed: 0, failed: 0, inProgress: 0, attributeMismatches: 0 },
    problems: [],
  };
  if (record.status === "ready") return record;
  const progressPath = join(dir, "progress.json");
  const progress = readJson<Progress>(progressPath, { uploads: {}, storeId: null, attached: [], batches: [] });
  const save = () => {
    writeJsonAtomic(progressPath, progress);
    writeJsonAtomic(join(dir, "generation.json"), record);
  };

  // 1. uploads (resumable: a document whose sha256 is already uploaded is skipped)
  if (opts.reuseFrom) {
    const prev = readJson<Progress>(join(custody, opts.reuseFrom, "progress.json"), { uploads: {}, storeId: null, attached: [], batches: [] });
    let reused = 0;
    for (const d of corpus.documents) {
      const u = prev.uploads[d.docId];
      if (u && u.sha256 === d.sha256 && progress.uploads[d.docId]?.sha256 !== d.sha256) {
        progress.uploads[d.docId] = { fileId: u.fileId, sha256: d.sha256, bytes: d.bytes, reusedFrom: opts.reuseFrom };
        reused++;
      }
    }
    log(`refresh: reusing ${reused} uploaded files from ${opts.reuseFrom}`);
  }
  const pending = corpus.documents.filter((d) => progress.uploads[d.docId]?.sha256 !== d.sha256);
  log(`upload: ${pending.length} of ${corpus.documents.length} documents pending`);
  let next = 0;
  let sinceSave = 0;
  const worker = async () => {
    while (next < pending.length) {
      const d = pending[next++]!;
      const f = await withRetry(`upload ${d.docId}`, () => opts.provider.uploadFile(d.filename, d.text));
      progress.uploads[d.docId] = { fileId: f.id, sha256: d.sha256, bytes: d.bytes };
      recordUsage(custody, { uploads: 1, uploadedBytes: d.bytes });
      if (++sinceSave >= 25) {
        sinceSave = 0;
        save();
      }
    }
  };
  await Promise.all(Array.from({ length: opts.concurrency ?? 6 }, worker));
  record.files.uploaded = Object.keys(progress.uploads).length;
  save();

  // 2. store
  if (!progress.storeId) {
    const store = await withRetry("create store", () => opts.provider.createStore(record.storeName, { release_digest: rel.schemaReleaseDigest, workspace_fingerprint: record.workspaceFingerprint, generation_id: generationId, corpus_digest: record.corpusDigest, release_id: rel.releaseId, producer: "bks-schema semantic generate" }));
    progress.storeId = store.id;
    record.storeId = store.id;
    recordUsage(custody, { otherCalls: 1 }, { kind: "store-created", detail: generationId });
    save();
  }
  record.storeId = progress.storeId;
  record.status = "indexing";

  // 3. attach in batches (per-file attributes + static chunking); createAndPoll waits for each batch
  const byDoc = new Map(corpus.documents.map((d) => [d.docId, d]));
  const attached = new Set(progress.attached);
  const toAttach = corpus.documents.filter((d) => !attached.has(d.docId));
  const size = opts.batchSize ?? 500;
  for (let i = 0; i < toAttach.length; i += size) {
    const slice = toAttach.slice(i, i + size);
    const batch = await withRetry("file batch", () => opts.provider.addFileBatch(progress.storeId!, slice.map((d) => ({ fileId: progress.uploads[d.docId]!.fileId, attributes: d.attributes, chunking })), opts.pollIntervalMs));
    progress.batches.push({ id: batch.id, status: batch.status, fileCounts: batch.fileCounts });
    for (const d of slice) attached.add(d.docId);
    progress.attached = [...attached];
    recordUsage(custody, { otherCalls: 1 });
    log(`batch ${progress.batches.length}: ${batch.status} ${JSON.stringify(batch.fileCounts)}`);
    save();
  }

  // 4. verify every file and its attributes; build the local mapping
  return finalizeGeneration({ dir, custody, record, progress, byDoc, provider: opts.provider, save });
}

async function finalizeGeneration(a: { dir: string; custody: string; record: GenerationRecord; progress: Progress; byDoc: Map<string, CorpusDocument>; provider: VectorProvider; save: () => void }): Promise<GenerationRecord> {
  const { record, progress, byDoc } = a;
  const files = await withRetry("list store files", () => a.provider.listStoreFiles(progress.storeId!));
  recordUsage(a.custody, { otherCalls: Math.max(1, Math.ceil(files.length / 100)) });
  const fileToDoc = new Map(Object.entries(progress.uploads).map(([docId, u]) => [u.fileId, docId]));
  const mapping: Record<string, MapEntry> = {};
  const problems: string[] = [];
  let completed = 0;
  let failed = 0;
  let inProgress = 0;
  let mismatches = 0;
  const seen = new Set<string>();
  for (const f of files) {
    const docId = fileToDoc.get(f.id);
    if (!docId) {
      problems.push(`store holds an unexpected file ${f.id}`);
      continue;
    }
    seen.add(docId);
    const d = byDoc.get(docId)!;
    if (f.status === "completed") completed++;
    else if (f.status === "in_progress") inProgress++;
    else {
      failed++;
      problems.push(`${docId}: ${f.status}${f.lastError ? ` (${f.lastError.code})` : ""}`);
    }
    const attrs = f.attributes ?? {};
    const same = Object.keys(d.attributes).every((k) => attrs[k] === d.attributes[k]) && Object.keys(attrs).length === Object.keys(d.attributes).length;
    if (!same) {
      mismatches++;
      problems.push(`${docId}: provider attributes differ from the corpus manifest`);
    }
    if (f.status === "completed" && same) mapping[f.id] = { docId, cardId: d.cardId, cardDigest: d.cardDigest, filename: d.filename, sha256: d.sha256, attributes: d.attributes };
  }
  for (const docId of byDoc.keys()) if (!seen.has(docId)) problems.push(`${docId}: not present in the store`);
  const store = await withRetry("retrieve store", () => a.provider.retrieveStore(progress.storeId!));
  recordUsage(a.custody, { otherCalls: 1 });
  const reusedCount = Object.values(progress.uploads).filter((u) => u.reusedFrom).length;
  record.files = { uploaded: Object.keys(progress.uploads).length, completed, failed, inProgress, attributeMismatches: mismatches, reused: reusedCount, newlyUploaded: Object.keys(progress.uploads).length - reusedCount };
  record.provider = { storeStatus: store.status, usageBytes: store.usageBytes, fileCounts: store.fileCounts, metadata: store.metadata, embeddingModel: "not exposed by the Vector Store create/retrieve contract (provider-managed)" };
  record.problems = problems.slice(0, 200);
  const ready = completed === byDoc.size && Object.keys(mapping).length === byDoc.size && problems.length === 0 && store.status === "completed";
  record.status = ready ? "ready" : inProgress ? "indexing" : "partial";
  if (ready) record.readyAt = new Date().toISOString();
  writeJsonAtomic(join(a.dir, "mapping.json"), mapping);
  a.save();
  return record;
}

/** Re-checks a generation against the provider (resume polling after interruption or delayed indexing). */
export async function recheckGeneration(ws: Workspace, provider: VectorProvider, generationId: string, custodyDir = defaultCustodyDir()): Promise<GenerationRecord> {
  const dir = join(custodyDir, generationId);
  const record = readJson<GenerationRecord | null>(join(dir, "generation.json"), null);
  if (!record) throw new Error(`no generation ${generationId}`);
  const progress = readJson<Progress>(join(dir, "progress.json"), { uploads: {}, storeId: null, attached: [], batches: [] });
  const corpus = exportCorpus(ws);
  if (corpus.manifest.corpusDigest !== record.corpusDigest) throw new Error(`workspace corpus ${corpus.manifest.corpusDigest} differs from generation ${record.corpusDigest}`);
  const byDoc = new Map(corpus.documents.map((d) => [d.docId, d]));
  return finalizeGeneration({ dir, custody: custodyDir, record, progress, byDoc, provider, save: () => { writeJsonAtomic(join(dir, "progress.json"), progress); writeJsonAtomic(join(dir, "generation.json"), record); } });
}

export interface CurrentPointer {
  format: "bks-semantic-pointer.v1";
  generationId: string;
  storeName: string;
  releaseId: string;
  schemaReleaseDigest: string;
  workspaceFingerprint: string;
  corpusDigest: string;
  publishedAt: string;
  history: Array<{ generationId: string; publishedAt: string; replacedAt: string }>;
}

export function readGeneration(generationId: string, custodyDir = defaultCustodyDir()): { record: GenerationRecord; mapping: Record<string, MapEntry> } | null {
  const dir = join(custodyDir, generationId);
  const record = readJson<GenerationRecord | null>(join(dir, "generation.json"), null);
  if (!record) return null;
  return { record, mapping: readJson<Record<string, MapEntry>>(join(dir, "mapping.json"), {}) };
}

export function readPointer(custodyDir = defaultCustodyDir()): CurrentPointer | null {
  return readJson<CurrentPointer | null>(join(custodyDir, "current.json"), null);
}

/** Publishes a ready generation as current (atomic rename); the previous pointer moves into history (retained). */
export function publishGeneration(generationId: string, custodyDir = defaultCustodyDir(), now = new Date()): CurrentPointer {
  const g = readGeneration(generationId, custodyDir);
  if (!g) throw new Error(`no generation ${generationId}`);
  if (g.record.status !== "ready") throw new Error(`generation ${generationId} is ${g.record.status}; only a ready generation is published (partial indexing is not ready)`);
  if (Object.keys(g.mapping).length !== g.record.documents) throw new Error(`generation ${generationId} mapping covers ${Object.keys(g.mapping).length} of ${g.record.documents} documents`);
  const prev = readPointer(custodyDir);
  const pointer: CurrentPointer = {
    format: "bks-semantic-pointer.v1",
    generationId,
    storeName: g.record.storeName,
    releaseId: g.record.releaseId,
    schemaReleaseDigest: g.record.schemaReleaseDigest,
    workspaceFingerprint: g.record.workspaceFingerprint,
    corpusDigest: g.record.corpusDigest,
    publishedAt: now.toISOString(),
    history: [...(prev?.history ?? []), ...(prev && prev.generationId !== generationId ? [{ generationId: prev.generationId, publishedAt: prev.publishedAt, replacedAt: now.toISOString() }] : [])],
  };
  writeJsonAtomic(join(custodyDir, "current.json"), pointer);
  return pointer;
}

/** Deactivates a non-current generation (step 1 of retirement). Deletion is allowed only after `retainUntil`. */
export function retireGeneration(generationId: string, custodyDir = defaultCustodyDir(), now = new Date(), retentionDays = 14): GenerationRecord {
  const cur = readPointer(custodyDir);
  if (cur?.generationId === generationId) throw new Error(`generation ${generationId} is current; publish another generation before retiring it`);
  const g = readGeneration(generationId, custodyDir);
  if (!g) throw new Error(`no generation ${generationId}`);
  const record = { ...g.record, status: "deactivated" as const, deactivatedAt: now.toISOString(), retainUntil: new Date(now.getTime() + retentionDays * 86_400_000).toISOString() };
  writeJsonAtomic(join(custodyDir, generationId, "generation.json"), record);
  return record;
}

/**
 * Deletes a deactivated generation's store and the uploaded files no other retained generation references.
 * Refuses a current, active or still-retained generation. Not exercised against the live store in this release.
 */
export async function deleteGeneration(provider: VectorProvider, generationId: string, opts: { custodyDir?: string; now?: Date; otherGenerations?: string[]; confirm: boolean }): Promise<{ deletedStore: boolean; deletedFiles: number; keptShared: number }> {
  const custody = opts.custodyDir ?? defaultCustodyDir();
  const now = opts.now ?? new Date();
  if (!opts.confirm) throw new Error("deleteGeneration needs confirm: true");
  if (readPointer(custody)?.generationId === generationId) throw new Error(`generation ${generationId} is current`);
  const g = readGeneration(generationId, custody);
  if (!g) throw new Error(`no generation ${generationId}`);
  if (g.record.status !== "deactivated") throw new Error(`generation ${generationId} is ${g.record.status}; deactivate it first`);
  if (!g.record.retainUntil || now < new Date(g.record.retainUntil)) throw new Error(`generation ${generationId} is retained until ${g.record.retainUntil}`);
  const shared = new Set<string>();
  for (const other of opts.otherGenerations ?? []) for (const fileId of Object.keys(readGeneration(other, custody)?.mapping ?? {})) shared.add(fileId);
  const progress = readJson<Progress>(join(custody, generationId, "progress.json"), { uploads: {}, storeId: null, attached: [], batches: [] });
  if (g.record.storeId) await provider.deleteStore(g.record.storeId);
  let deletedFiles = 0;
  let keptShared = 0;
  for (const u of Object.values(progress.uploads)) {
    if (shared.has(u.fileId)) {
      keptShared++;
      continue;
    }
    await provider.deleteFile(u.fileId);
    deletedFiles++;
  }
  writeJsonAtomic(join(custody, generationId, "generation.json"), { ...g.record, status: "deactivated", problems: [...g.record.problems, `deleted at ${now.toISOString()}`] });
  return { deletedStore: Boolean(g.record.storeId), deletedFiles, keptShared };
}

/**
 * Refresh after a workspace rebuild: a new generation (new store; the earlier one stays immutable) that reuses every
 * uploaded file whose document bytes are unchanged and uploads only changed or new documents. When the corpus content
 * digest is unchanged this is an attribute-only refresh: zero uploads, the files are attached with the new
 * `workspace_fingerprint` attribute.
 */
export async function refreshGeneration(opts: GenerateOptions & { from: string }): Promise<GenerationRecord> {
  const { from, ...rest } = opts;
  return generate({ ...rest, reuseFrom: from });
}

/** A deliberate pre-flight abort (no provider call was made). */
export class GenerationAbort extends Error {
  constructor(
    readonly code: "UPLOAD_CAP",
    message: string,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
  }
}
