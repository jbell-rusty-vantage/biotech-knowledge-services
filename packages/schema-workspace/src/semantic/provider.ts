/**
 * The narrow provider seam the generation flow and the retriever use. `openAIProvider` adapts the pinned `openai`
 * SDK (OPENAI_SDK_VERSION); tests use an in-memory fake. Only Vector Store and File endpoints are touched.
 */
import OpenAI, { toFile } from "openai";

export const OPENAI_SDK_PACKAGE = "openai";
export const OPENAI_SDK_VERSION = "7.23.0";

export type Attributes = Record<string, string | number | boolean>;

export interface ChunkingStrategy {
  type: "static";
  static: { max_chunk_size_tokens: number; chunk_overlap_tokens: number };
}

export interface StoreFileState {
  id: string;
  status: "in_progress" | "completed" | "cancelled" | "failed";
  attributes: Attributes | null;
  usageBytes: number;
  lastError: { code: string; message: string } | null;
  chunking: unknown;
}

export interface StoreState {
  id: string;
  name: string | null;
  status: string;
  usageBytes: number;
  fileCounts: { in_progress: number; completed: number; failed: number; cancelled: number; total: number };
  createdAt: number;
  metadata: Record<string, string> | null;
}

export interface BatchState {
  id: string;
  status: string;
  fileCounts: { in_progress: number; completed: number; failed: number; cancelled: number; total: number };
}

export interface SearchResult {
  fileId: string;
  filename: string;
  score: number;
  attributes: Attributes | null;
  text: string;
}

export type Filter = { type: "eq" | "ne" | "in" | "nin"; key: string; value: string | number | boolean | Array<string | number> } | { type: "and" | "or"; filters: Filter[] };

export interface SearchParams {
  query: string;
  maxNumResults: number;
  rewriteQuery: boolean;
  filters?: Filter;
  ranker: "none" | "auto" | "default-2024-11-15";
  scoreThreshold: number;
}

export interface VectorProvider {
  readonly id: string;
  uploadFile(filename: string, content: string): Promise<{ id: string; bytes: number }>;
  createStore(name: string, metadata: Record<string, string>): Promise<{ id: string }>;
  addFileBatch(storeId: string, files: Array<{ fileId: string; attributes: Attributes; chunking: ChunkingStrategy }>, pollIntervalMs?: number): Promise<BatchState>;
  listStoreFiles(storeId: string): Promise<StoreFileState[]>;
  retrieveStore(storeId: string): Promise<StoreState>;
  search(storeId: string, params: SearchParams, options: { timeoutMs: number }): Promise<SearchResult[]>;
  deleteStore(storeId: string): Promise<void>;
  deleteFile(fileId: string): Promise<void>;
}

/** Normalized provider failure classes; `quota` and `billing` abort generation runs. */
export type ProviderFailure = "timeout" | "quota" | "billing" | "auth" | "not-found" | "rate-limit" | "bad-request" | "provider-error";

export class ProviderError extends Error {
  constructor(
    readonly failure: ProviderFailure,
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

export function classifyProviderError(error: unknown): ProviderError {
  if (error instanceof ProviderError) return error;
  const e = error as { status?: number; code?: string; error?: { code?: string; type?: string }; name?: string; message?: string };
  const code = e.code ?? e.error?.code ?? "";
  const type = e.error?.type ?? "";
  const msg = (e.message ?? String(error)).replace(/sk-[A-Za-z0-9_-]{8,}/g, "sk-***");
  if (error instanceof OpenAI.APIConnectionTimeoutError || error instanceof OpenAI.APIUserAbortError || e.name === "AbortError" || /timed? ?out/i.test(msg)) return new ProviderError("timeout", msg);
  if (code === "insufficient_quota" || type === "insufficient_quota") return new ProviderError("quota", msg, e.status);
  if (/billing|payment/i.test(code) || /billing/i.test(msg)) return new ProviderError("billing", msg, e.status);
  if (e.status === 401 || e.status === 403) return new ProviderError("auth", msg, e.status);
  if (e.status === 404) return new ProviderError("not-found", msg, e.status);
  if (e.status === 429) return new ProviderError("rate-limit", msg, e.status);
  if (e.status === 400 || e.status === 422) return new ProviderError("bad-request", msg, e.status);
  return new ProviderError("provider-error", msg, e.status);
}

export function openAIProvider(apiKey: string): VectorProvider {
  const client = new OpenAI({ apiKey, maxRetries: 2, timeout: 60_000 });
  const fc = (c: { in_progress: number; completed: number; failed: number; cancelled: number; total: number }) => ({ in_progress: c.in_progress, completed: c.completed, failed: c.failed, cancelled: c.cancelled, total: c.total });
  const wrap = async <T>(f: () => Promise<T>): Promise<T> => {
    try {
      return await f();
    } catch (error) {
      throw classifyProviderError(error);
    }
  };
  return {
    id: `openai-sdk@${OPENAI_SDK_VERSION}`,
    uploadFile: (filename, content) =>
      wrap(async () => {
        const file = await client.files.create({ file: await toFile(Buffer.from(content, "utf8"), filename, { type: "text/markdown" }), purpose: "assistants" });
        return { id: file.id, bytes: file.bytes };
      }),
    createStore: (name, metadata) => wrap(async () => ({ id: (await client.vectorStores.create({ name, metadata })).id })),
    addFileBatch: (storeId, files, pollIntervalMs = 3000) =>
      wrap(async () => {
        const b = await client.vectorStores.fileBatches.createAndPoll(storeId, { files: files.map((f) => ({ file_id: f.fileId, attributes: f.attributes, chunking_strategy: f.chunking })) }, { pollIntervalMs });
        return { id: b.id, status: b.status, fileCounts: fc(b.file_counts) };
      }),
    listStoreFiles: (storeId) =>
      wrap(async () => {
        const out: StoreFileState[] = [];
        for await (const f of client.vectorStores.files.list(storeId, { limit: 100 })) out.push({ id: f.id, status: f.status, attributes: (f.attributes as Attributes | null | undefined) ?? null, usageBytes: f.usage_bytes, lastError: f.last_error ? { code: f.last_error.code, message: f.last_error.message } : null, chunking: f.chunking_strategy ?? null });
        return out;
      }),
    retrieveStore: (storeId) =>
      wrap(async () => {
        const s = await client.vectorStores.retrieve(storeId);
        return { id: s.id, name: s.name, status: s.status, usageBytes: s.usage_bytes, fileCounts: fc(s.file_counts), createdAt: s.created_at, metadata: (s.metadata as Record<string, string> | null) ?? null };
      }),
    search: (storeId, p, options) =>
      wrap(async () => {
        const page = await client.vectorStores.search(
          storeId,
          { query: p.query, max_num_results: p.maxNumResults, rewrite_query: p.rewriteQuery, ...(p.filters ? { filters: p.filters as never } : {}), ranking_options: { ranker: p.ranker, score_threshold: p.scoreThreshold } },
          { timeout: options.timeoutMs, maxRetries: 0 },
        );
        return page.data.map((r) => ({ fileId: r.file_id, filename: r.filename, score: r.score, attributes: r.attributes, text: r.content.map((c) => c.text).join("\n") }));
      }),
    deleteStore: (storeId) => wrap(async () => void (await client.vectorStores.delete(storeId))),
    deleteFile: (fileId) => wrap(async () => void (await client.files.delete(fileId))),
  };
}
